// Chat chung của web: mọi tài khoản đã đăng nhập đều nhắn được. Lấy tin bằng polling (GET /api/chat?after=ID).
// Tên và vai trò lấy từ bảng users tại thời điểm đọc (đổi tên/vai trò là cập nhật ngay).
import { json, bad } from './_lib.js';
import { logEvent } from './_log.js';

const MAX_LEN = 500, MIN_GAP = 900, KEEP_MS = 30 * 86400000, FIRST = 50;
const clean = s => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const SEL = 'SELECT m.id,m.ts,m.user_id uid,m.body,m.mentions,u.name,u.role FROM chat_messages m LEFT JOIN users u ON u.id=m.user_id';

const ONLINE_MS = 45000, TOUCH_MS = 20000;
/** Đánh dấu người dùng đang online; chỉ ghi khi bản ghi cũ hơn 20 giây để tiết kiệm ghi D1. */
export async function touchPresence(env, user) {
  try { const now = Date.now(); await env.DB.prepare('INSERT INTO presence (user_id,ts) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET ts=excluded.ts WHERE presence.ts < ?').bind(user.id, now, now - TOUCH_MS).run(); } catch (e) { console.error('presence', e && e.message); }
}
async function onlineCount(env) { const r = await env.DB.prepare("SELECT COUNT(*) n FROM presence p JOIN users u ON u.id=p.user_id WHERE p.ts>? AND u.status='active'").bind(Date.now() - ONLINE_MS).first(); return r ? r.n : 0; }

const parseMen = s => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a.filter(x => x && x.id && x.name) : []; } catch { return []; } };
const likeEsc = s => s.replace(/[\\%_]/g, c => '\\' + c);

export async function handleChat(request, env, user, sub, readJson) {
  const m = request.method;
  if (m === 'GET' && sub === 'users') {   // gợi ý khi gõ @
    const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 30), now = Date.now();
    const rows = (await env.DB.prepare("SELECT u.id,u.name,u.role,(p.ts>?) AS on_ FROM users u LEFT JOIN presence p ON p.user_id=u.id WHERE u.status='active' AND u.id<>? AND u.name LIKE ? ESCAPE '\\' ORDER BY on_ DESC, (u.name LIKE ? ESCAPE '\\') DESC, u.name COLLATE NOCASE LIMIT 8").bind(now - ONLINE_MS, user.id, '%' + likeEsc(q) + '%', likeEsc(q) + '%').all()).results;
    return json({ users: rows.map(r => ({ id: r.id, name: r.name, role: r.role, on: !!r.on_ })) });
  }
  if (m === 'GET' && sub === 'online') {
    await touchPresence(env, user);
    const rows = (await env.DB.prepare("SELECT u.id,u.name,u.role,p.ts FROM presence p JOIN users u ON u.id=p.user_id WHERE p.ts>? AND u.status='active' ORDER BY (u.role='admin') DESC, u.name COLLATE NOCASE LIMIT 200").bind(Date.now() - ONLINE_MS).all()).results;
    return json({ users: rows.map(r => ({ id: r.id, name: r.name, role: r.role, ts: r.ts })), me: user.id });
  }
  if (m === 'GET' && !sub) {
    const p = new URL(request.url).searchParams, after = Math.max(0, +p.get('after') || 0);
    let rows;
    if (after) rows = (await env.DB.prepare(`${SEL} WHERE m.id>? ORDER BY m.id ASC LIMIT 100`).bind(after).all()).results;
    else rows = (await env.DB.prepare(`${SEL} ORDER BY m.id DESC LIMIT ?`).bind(FIRST).all()).results.reverse();
    const out = { msgs: rows.map(r => ({ id: r.id, ts: r.ts, uid: r.uid, name: r.name || 'Tài khoản đã xoá', role: r.name ? r.role : 'user', body: r.body, men: parseMen(r.mentions) })), me: user.id };
    if (p.get('sync') === '1' || !after) out.alive = (await env.DB.prepare('SELECT id FROM chat_messages ORDER BY id DESC LIMIT 80').all()).results.map(r => r.id);
    await touchPresence(env, user); out.on = await onlineCount(env);
    const rl = await env.DB.prepare('SELECT id,msg FROM reload_cmds WHERE ts>? AND (user_id IS NULL OR user_id=?) ORDER BY id DESC LIMIT 1').bind(Date.now() - 600000, user.id).first();
    out.rl = rl ? rl.id : 0; if (rl) out.rlmsg = rl.msg || '';
    return json(out);
  }
  if (m === 'POST' && !sub) {
    const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
    const body = clean(d.body); if (!body) return bad('Tin nhắn trống'); if (body.length > MAX_LEN) return bad('Tin nhắn tối đa ' + MAX_LEN + ' ký tự');
    const now = Date.now(), last = await env.DB.prepare('SELECT ts FROM chat_messages WHERE user_id=? ORDER BY id DESC LIMIT 1').bind(user.id).first();
    if (last && now - last.ts < MIN_GAP) return bad('Bạn gửi nhanh quá, chậm lại một chút', 429);
    // các người được tag: chỉ nhận id có thật, đang hoạt động, và tên còn xuất hiện trong nội dung dạng @Tên
    let men = [];
    const ids = [...new Set((Array.isArray(d.mentions) ? d.mentions : []).map(Number).filter(n => n > 0))].slice(0, 8);
    if (ids.length) {
      const us = (await env.DB.prepare(`SELECT id,name FROM users WHERE status='active' AND id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results;
      men = us.filter(u => body.includes('@' + u.name)).map(u => ({ id: u.id, name: u.name }));
    }
    const r = await env.DB.prepare('INSERT INTO chat_messages (ts,user_id,body,mentions) VALUES (?,?,?,?) RETURNING id').bind(now, user.id, body, men.length ? JSON.stringify(men) : null).first();
    await logEvent(env, request, user, 'chat_send', null, { len: body.length, q: body.slice(0, 120), tag: men.map(x => x.name) });
    if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM chat_messages WHERE ts<?').bind(now - KEEP_MS).run();
    return json({ ok: true, id: r && r.id });
  }
  if (m === 'DELETE' && +sub) {
    const row = await env.DB.prepare('SELECT user_id,body FROM chat_messages WHERE id=?').bind(+sub).first(); if (!row) return json({ ok: true });
    if (user.role !== 'admin' && row.user_id !== user.id) return bad('Không có quyền xoá tin này', 403);
    await env.DB.prepare('DELETE FROM chat_messages WHERE id=?').bind(+sub).run();
    if (row.user_id !== user.id) await logEvent(env, request, user, 'chat_delete', null, { msg: +sub, of: row.user_id, q: row.body.slice(0, 80) });
    return json({ ok: true });
  }
  return bad('Không tìm thấy', 404);
}
