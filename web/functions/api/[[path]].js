// Toàn bộ API: /api/*  (đăng ký, đăng nhập, tiến độ, quản trị, ảnh slide có kiểm quyền)
import { SUBJECTS, SUBJECT_IDS, json, bad, hashPassword, timingSafeEqual, createSession, getUser, deleteSession, sessionCookie, clearCookie, isSecure,
  throttled, noteFail, clearFails, validEmail, validPassword, csrfOk, randomPassword } from '../_lib.js';
import { CPV_IMAGES } from '../_content.generated.js';
import { handleAi } from '../_ai.js';
import { handleDuel } from '../_duel.js';
import { handleChat, touchPresence } from '../_chat.js';
import { VERSION } from '../_live.js';
import { logEvent, handleEvent, handleLogs, canViewLogs } from '../_log.js';

const publicUser = u => ({ id: u.id, email: u.email, name: u.name, role: u.role, must_change: !!u.must_change, subjects: u.subjects, can_logs: u.role === 'admin' && !!u.can_logs });
const clientIp = req => req.headers.get('cf-connecting-ip') || 'local';
const readJson = async req => { try { return await req.json(); } catch { return null; } };

export async function onRequest({ request, env, params }) {
  const parts = (params.path || []).slice(); const [a, b, c] = parts; const m = request.method;
  if (!csrfOk(request)) return bad('Yêu cầu không hợp lệ', 403);
  try {
    // ---------- công khai ----------
    if (a === 'register' && m === 'POST') {
      const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
      const email = String(d.email || '').trim().toLowerCase(), name = String(d.name || '').trim().slice(0, 60);
      if (!validEmail(email)) return bad('Email không hợp lệ'); if (name.length < 2) return bad('Nhập họ tên (ít nhất 2 ký tự)'); if (!validPassword(d.password)) return bad('Mật khẩu cần 8–100 ký tự');
      const key = 'reg:' + clientIp(request); if (await throttled(env, key)) return bad('Thử lại sau ít phút', 429);
      const dup = await env.DB.prepare('SELECT 1 FROM users WHERE email=?').bind(email).first();
      await noteFail(env, key);   // mỗi lần đăng ký tính 1 lượt để chặn spam
      if (dup) return bad('Email này đã được đăng ký', 409);
      const { hash, salt } = await hashPassword(d.password);
      await env.DB.prepare("INSERT INTO users (email,name,pass_hash,pass_salt,role,status,created_at) VALUES (?,?,?,?, 'user','pending',?)").bind(email, name, hash, salt, Date.now()).run();
      await logEvent(env, request, null, 'register', null, { email, name });
      return json({ ok: true, message: 'Đăng ký thành công. Tài khoản đang chờ quản trị viên duyệt.' });
    }
    if (a === 'login' && m === 'POST') {
      const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
      const email = String(d.email || '').trim().toLowerCase(), key = 'login:' + email + ':' + clientIp(request);
      if (await throttled(env, key)) { await logEvent(env, request, null, 'login_blocked', null, { email, why: 'quá nhiều lần sai' }); return bad('Sai quá nhiều lần. Thử lại sau 10 phút.', 429); }
      const u = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
      // luôn tính băm để thời gian phản hồi không lộ email có tồn tại hay không
      const h = await hashPassword(String(d.password || ''), u ? u.pass_salt : undefined);
      if (!u || !timingSafeEqual(h.hash, u.pass_hash)) { await noteFail(env, key); await logEvent(env, request, null, 'login_fail', null, { email, why: u ? 'sai mật khẩu' : 'email không tồn tại' }); return bad('Email hoặc mật khẩu không đúng', 401); }
      if (u.status === 'pending') { await logEvent(env, request, null, 'login_blocked', null, { email, why: 'chờ duyệt' }); return bad('Tài khoản đang chờ quản trị viên duyệt', 403); }
      if (u.status === 'disabled') { await logEvent(env, request, null, 'login_blocked', null, { email, why: 'tài khoản bị khoá' }); return bad('Tài khoản đã bị khoá', 403); }
      await clearFails(env, key);
      await env.DB.prepare('UPDATE users SET last_login=? WHERE id=?').bind(Date.now(), u.id).run();
      const token = await createSession(env, u.id);
      await logEvent(env, request, u, 'login_ok', null, null);
      return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token, isSecure(request)) });
    }
    if (a === 'logout' && m === 'POST') { const lu = await getUser(request, env); if (lu) await logEvent(env, request, lu, 'logout', null, null); await deleteSession(request, env); return json({ ok: true }, 200, { 'set-cookie': clearCookie(isSecure(request)) }); }

    // ---------- cần đăng nhập ----------
    const user = await getUser(request, env);
    if (!user) return bad('Chưa đăng nhập', 401);

    if (a === 'me' && m === 'GET') return json({ user: publicUser(user), subjects: SUBJECT_IDS.filter(s => user.subjects.includes(s)).map(s => { const x = SUBJECTS[s]; return { id: x.id, name: x.name, full: x.full, desc: x.desc, color: x.color }; }) });

    if (a === 'event' && m === 'POST') return handleEvent(request, env, user, readJson);
    if (a === 'live' && m === 'GET') {
      await touchPresence(env, user);
      const rl = await env.DB.prepare('SELECT id,msg FROM reload_cmds WHERE ts>? AND (user_id IS NULL OR user_id=?) ORDER BY id DESC LIMIT 1').bind(Date.now() - 600000, user.id).first();
      return json({ v: VERSION, rl: rl ? rl.id : 0, rlmsg: rl ? rl.msg || '' : '' });
    }
    if (a === 'chat') return handleChat(request, env, user, b, readJson);
    if (a === 'ai' && m === 'POST') return handleAi(request, env, user, readJson, logEvent);
    if (a === 'duel' && m === 'POST') return handleDuel(request, env, user, b, readJson);

    if (a === 'password' && m === 'POST') {
      const d = await readJson(request); if (!d || !validPassword(d.new)) return bad('Mật khẩu mới cần 8–100 ký tự');
      const row = await env.DB.prepare('SELECT pass_hash,pass_salt FROM users WHERE id=?').bind(user.id).first();
      const h = await hashPassword(String(d.old || ''), row.pass_salt);
      if (!timingSafeEqual(h.hash, row.pass_hash)) return bad('Mật khẩu hiện tại không đúng', 401);
      const n = await hashPassword(d.new);
      await env.DB.prepare('UPDATE users SET pass_hash=?,pass_salt=?,must_change=0 WHERE id=?').bind(n.hash, n.salt, user.id).run();
      await logEvent(env, request, user, 'password_change', null, null);
      return json({ ok: true });
    }

    if (a === 'progress' && SUBJECTS[b]) {
      if (!user.subjects.includes(b)) return bad('Bạn chưa được cấp quyền môn này', 403);
      if (m === 'GET') {
        const r = await env.DB.prepare('SELECT data,updated_at FROM progress WHERE user_id=? AND subject=?').bind(user.id, b).first();
        return json({ uid: user.id, data: r ? r.data : null, updated_at: r ? r.updated_at : 0 });
      }
      if (m === 'PUT') {
        const d = await readJson(request); if (!d || typeof d.data !== 'string') return bad('Dữ liệu không hợp lệ');
        if (d.data.length > 700000) return bad('Dữ liệu tiến độ quá lớn', 413);
        try { JSON.parse(d.data); } catch { return bad('Tiến độ không phải JSON hợp lệ'); }
        const now = Date.now();
        await env.DB.prepare('INSERT INTO progress (user_id,subject,data,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id,subject) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at').bind(user.id, b, d.data, now).run();
        return json({ ok: true, updated_at: now });
      }
    }

    if (a === 'img' && b === 'cpv' && m === 'GET') {
      if (!user.subjects.includes('cpv301')) return bad('Không có quyền', 403);
      const img = CPV_IMAGES[String(c || '').replace(/\.png$/, '')]; if (!img) return bad('Không tìm thấy', 404);
      const bin = Uint8Array.from(atob(img), ch => ch.charCodeAt(0));
      return new Response(bin, { headers: { 'content-type': 'image/png', 'cache-control': 'private, max-age=86400' } });
    }

    // ---------- quản trị ----------
    if (a === 'admin') {
      if (user.role !== 'admin') return bad('Chỉ quản trị viên', 403);
      if (b === 'reload' && m === 'POST') {
        const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
        const target = d.user_id ? +d.user_id : null, msg = String(d.msg || '').slice(0, 120);
        if (target && !(await env.DB.prepare("SELECT 1 FROM users WHERE id=? AND status='active'").bind(target).first())) return bad('Không tìm thấy người dùng đang hoạt động', 404);
        const last = await env.DB.prepare('SELECT ts FROM reload_cmds WHERE by_id=? ORDER BY id DESC LIMIT 1').bind(user.id).first();
        if (last && Date.now() - last.ts < 5000) return bad('Gửi quá nhanh, đợi vài giây', 429);
        await env.DB.prepare('INSERT INTO reload_cmds (ts,user_id,by_id,msg) VALUES (?,?,?,?)').bind(Date.now(), target, user.id, msg).run();
        await logEvent(env, request, user, 'admin_reload', null, { target: target || 'tất cả', msg });
        return json({ ok: true });
      }
      if (b === 'logs' && m === 'GET') return handleLogs(request, env, user, c);
      if (b === 'users' && !c && m === 'GET') {
        const us = (await env.DB.prepare("SELECT id,email,name,role,status,must_change,created_at,last_login,can_logs FROM users ORDER BY (status='pending') DESC, created_at DESC").all()).results;
        const gs = (await env.DB.prepare('SELECT user_id,subject FROM grants').all()).results;
        const pr = (await env.DB.prepare('SELECT user_id,subject,updated_at FROM progress').all()).results;
        return json({ canLogs: canViewLogs(user), subjects: SUBJECT_IDS, users: us.map(u => ({ ...u, subjects: gs.filter(g => g.user_id === u.id).map(g => g.subject), progress: pr.filter(p => p.user_id === u.id).map(p => ({ subject: p.subject, updated_at: p.updated_at })) })) });
      }
      const uid = +c;
      if (b === 'users' && uid && m === 'POST' && !parts[3]) {
        const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
        const target = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(uid).first(); if (!target) return bad('Không tìm thấy người dùng', 404);
        const admins = (await env.DB.prepare("SELECT COUNT(*) n FROM users WHERE role='admin' AND status='active'").first()).n;
        const losingAdmin = target.role === 'admin' && target.status === 'active' && ((d.role && d.role !== 'admin') || (d.status && d.status !== 'active'));
        if (losingAdmin && admins <= 1) return bad('Không thể bỏ quản trị viên cuối cùng', 409);
        const st = [], bind = [];
        if (typeof d.can_logs === 'boolean') {
          if (!canViewLogs(user)) return bad('Chỉ người đang có quyền xem nhật ký mới cấp được quyền này', 403);
          if (d.can_logs && target.role !== 'admin') return bad('Chỉ quản trị viên mới có thể được cấp quyền xem nhật ký', 409);
          if (!d.can_logs && target.can_logs) { const holders = (await env.DB.prepare("SELECT COUNT(*) n FROM users WHERE role='admin' AND status='active' AND can_logs=1").first()).n; if (holders <= 1) return bad('Không thể gỡ quyền của người cuối cùng được xem nhật ký', 409); }
          st.push('can_logs=?'); bind.push(d.can_logs ? 1 : 0);
        }
        if (d.status) { if (!['pending', 'active', 'disabled'].includes(d.status)) return bad('Trạng thái không hợp lệ'); st.push('status=?'); bind.push(d.status); }
        if (d.role) { if (!['admin', 'user'].includes(d.role)) return bad('Vai trò không hợp lệ'); st.push('role=?'); bind.push(d.role); if (d.role !== 'admin') st.push('can_logs=0'); }
        if (typeof d.name === 'string' && d.name.trim().length >= 2) { st.push('name=?'); bind.push(d.name.trim().slice(0, 60)); }
        const stmts = [];
        if (st.length) stmts.push(env.DB.prepare(`UPDATE users SET ${st.join(',')} WHERE id=?`).bind(...bind, uid));
        if (Array.isArray(d.subjects)) {
          stmts.push(env.DB.prepare('DELETE FROM grants WHERE user_id=?').bind(uid));
          for (const s of [...new Set(d.subjects)].filter(s => SUBJECTS[s])) stmts.push(env.DB.prepare('INSERT INTO grants (user_id,subject) VALUES (?,?)').bind(uid, s));
        }
        if (d.status === 'disabled') stmts.push(env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(uid));
        if (stmts.length) await env.DB.batch(stmts);
        await logEvent(env, request, user, 'admin_user_update', null, { target: target.email, changes: { status: d.status, role: d.role, name: d.name, subjects: d.subjects, can_logs: d.can_logs } });
        return json({ ok: true });
      }
      if (b === 'users' && uid && parts[3] === 'reset' && m === 'POST') {
        const target = await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(uid).first(); if (!target) return bad('Không tìm thấy người dùng', 404);
        const pw = randomPassword(), h = await hashPassword(pw);
        await logEvent(env, request, user, 'admin_reset_password', null, { target: uid });
        await env.DB.batch([env.DB.prepare('UPDATE users SET pass_hash=?,pass_salt=?,must_change=1 WHERE id=?').bind(h.hash, h.salt, uid), env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(uid)]);
        return json({ ok: true, password: pw });
      }
      if (b === 'users' && uid && m === 'DELETE') {
        if (uid === user.id) return bad('Không thể tự xoá chính mình', 409);
        const gone = await env.DB.prepare('SELECT email FROM users WHERE id=?').bind(uid).first();
        await env.DB.prepare('DELETE FROM users WHERE id=?').bind(uid).run();
        await logEvent(env, request, user, 'admin_user_delete', null, { target: gone && gone.email, id: uid });
        return json({ ok: true });
      }
    }
    return bad('Không tìm thấy', 404);
  } catch (e) {
    console.error(e && e.stack || e);
    return bad('Lỗi máy chủ', 500);
  }
}
