import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 60)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
patch('functions/_log.js', [[`  await logEvent(env, request, user, 'admin_log_view'`, `  if (!p.get('before')) await logEvent(env, request, user, 'admin_log_view'`]]);
patch('functions/_lib.js', [[`'SELECT u.id,u.email,u.name,u.role,u.status,u.must_change FROM sessions`, `'SELECT u.id,u.email,u.name,u.role,u.status,u.must_change,u.can_logs FROM sessions`]]);
patch('functions/api/[[path]].js', [
  [`import { handleDuel } from '../_duel.js';`, `import { handleDuel } from '../_duel.js';
import { logEvent, handleEvent, handleLogs, canViewLogs } from '../_log.js';`],
  [`must_change: !!u.must_change, subjects: u.subjects });`, `must_change: !!u.must_change, subjects: u.subjects, can_logs: u.role === 'admin' && !!u.can_logs });`],
  // đăng ký
  [`      return json({ ok: true, message: 'Đăng ký thành công.`, `      await logEvent(env, request, null, 'register', null, { email, name });
      return json({ ok: true, message: 'Đăng ký thành công.`],
  // đăng nhập
  [`if (await throttled(env, key)) return bad('Sai quá nhiều lần. Thử lại sau 10 phút.', 429);`, `if (await throttled(env, key)) { await logEvent(env, request, null, 'login_blocked', null, { email, why: 'quá nhiều lần sai' }); return bad('Sai quá nhiều lần. Thử lại sau 10 phút.', 429); }`],
  [`{ await noteFail(env, key); return bad('Email hoặc mật khẩu không đúng', 401); }`, `{ await noteFail(env, key); await logEvent(env, request, null, 'login_fail', null, { email, why: u ? 'sai mật khẩu' : 'email không tồn tại' }); return bad('Email hoặc mật khẩu không đúng', 401); }`],
  [`if (u.status === 'pending') return bad('Tài khoản đang chờ quản trị viên duyệt', 403);`, `if (u.status === 'pending') { await logEvent(env, request, null, 'login_blocked', null, { email, why: 'chờ duyệt' }); return bad('Tài khoản đang chờ quản trị viên duyệt', 403); }`],
  [`if (u.status === 'disabled') return bad('Tài khoản đã bị khoá', 403);`, `if (u.status === 'disabled') { await logEvent(env, request, null, 'login_blocked', null, { email, why: 'tài khoản bị khoá' }); return bad('Tài khoản đã bị khoá', 403); }`],
  [`      const token = await createSession(env, u.id);
      return json({ ok: true }`, `      const token = await createSession(env, u.id);
      await logEvent(env, request, u, 'login_ok', null, null);
      return json({ ok: true }`],
  [`if (a === 'logout' && m === 'POST') { await deleteSession(request, env);`, `if (a === 'logout' && m === 'POST') { const lu = await getUser(request, env); if (lu) await logEvent(env, request, lu, 'logout', null, null); await deleteSession(request, env);`],
  // sự kiện từ trình duyệt + AI
  [`    if (a === 'ai' && m === 'POST') return handleAi(request, env, user, readJson);`, `    if (a === 'event' && m === 'POST') return handleEvent(request, env, user, readJson);
    if (a === 'ai' && m === 'POST') return handleAi(request, env, user, readJson, logEvent);`],
  // đổi mật khẩu
  [`      await env.DB.prepare('UPDATE users SET pass_hash=?,pass_salt=?,must_change=0 WHERE id=?').bind(n.hash, n.salt, user.id).run();
      return json({ ok: true });`, `      await env.DB.prepare('UPDATE users SET pass_hash=?,pass_salt=?,must_change=0 WHERE id=?').bind(n.hash, n.salt, user.id).run();
      await logEvent(env, request, user, 'password_change', null, null);
      return json({ ok: true });`],
  // quản trị: nhật ký
  [`      if (b === 'users' && !c && m === 'GET') {`, `      if (b === 'logs' && m === 'GET') return handleLogs(request, env, user, c);
      if (b === 'users' && !c && m === 'GET') {`],
  [`return json({ subjects: SUBJECT_IDS, users: us.map(`, `return json({ canLogs: canViewLogs(user), subjects: SUBJECT_IDS, users: us.map(`],
  [`SELECT id,email,name,role,status,must_change,created_at,last_login FROM users ORDER BY`, `SELECT id,email,name,role,status,must_change,created_at,last_login,can_logs FROM users ORDER BY`],
  // cấp/thu quyền xem nhật ký: chỉ người đang có quyền, chỉ cho admin
  [`        const st = [], bind = [];
        if (d.status) {`, `        const st = [], bind = [];
        if (typeof d.can_logs === 'boolean') {
          if (!canViewLogs(user)) return bad('Chỉ người đang có quyền xem nhật ký mới cấp được quyền này', 403);
          if (d.can_logs && target.role !== 'admin') return bad('Chỉ quản trị viên mới có thể được cấp quyền xem nhật ký', 409);
          if (!d.can_logs && target.can_logs) { const holders = (await env.DB.prepare("SELECT COUNT(*) n FROM users WHERE role='admin' AND status='active' AND can_logs=1").first()).n; if (holders <= 1) return bad('Không thể gỡ quyền của người cuối cùng được xem nhật ký', 409); }
          st.push('can_logs=?'); bind.push(d.can_logs ? 1 : 0);
        }
        if (d.status) {`],
  [`        if (d.role) { if (!['admin', 'user'].includes(d.role)) return bad('Vai trò không hợp lệ'); st.push('role=?'); bind.push(d.role); }`, `        if (d.role) { if (!['admin', 'user'].includes(d.role)) return bad('Vai trò không hợp lệ'); st.push('role=?'); bind.push(d.role); if (d.role !== 'admin') st.push('can_logs=0'); }`],
  [`        if (stmts.length) await env.DB.batch(stmts);
        return json({ ok: true });`, `        if (stmts.length) await env.DB.batch(stmts);
        await logEvent(env, request, user, 'admin_user_update', null, { target: target.email, changes: { status: d.status, role: d.role, name: d.name, subjects: d.subjects, can_logs: d.can_logs } });
        return json({ ok: true });`],
  [`        await env.DB.batch([env.DB.prepare('UPDATE users SET pass_hash=?,pass_salt=?,must_change=1 WHERE id=?')`, `        await logEvent(env, request, user, 'admin_reset_password', null, { target: uid });
        await env.DB.batch([env.DB.prepare('UPDATE users SET pass_hash=?,pass_salt=?,must_change=1 WHERE id=?')`],
  [`        await env.DB.prepare('DELETE FROM users WHERE id=?').bind(uid).run();
        return json({ ok: true });`, `        const gone = await env.DB.prepare('SELECT email FROM users WHERE id=?').bind(uid).first();
        await env.DB.prepare('DELETE FROM users WHERE id=?').bind(uid).run();
        await logEvent(env, request, user, 'admin_user_delete', null, { target: gone && gone.email, id: uid });
        return json({ ok: true });`],
]);
// AI
patch('functions/_ai.js', [
  [`export async function handleAi(request, env, user, readJson) {`, `export async function handleAi(request, env, user, readJson, logEvent) {`],
  [`  const messages = [{ role: 'system', content: GUARD }, ...msgs];`, `  if (logEvent) { const last = [...msgs].reverse().find(m => m.role === 'user'); await logEvent(env, request, user, mode === 'translate' ? 'ai_translate' : 'ai_chat', String(d.subject), { len: msgs.reduce((a, m) => a + m.content.length, 0), q: last ? last.content.replace(/\\s+/g, ' ').slice(-160) : '' }); }
  const messages = [{ role: 'system', content: GUARD }, ...msgs];`],
]);
// mở môn
patch('functions/_serve.js', [
  [`import { SUBJECTS, getUser } from './_lib.js';`, `import { SUBJECTS, getUser } from './_lib.js';
import { logEvent } from './_log.js';`],
  [`  if (!user.subjects.includes(subject)) return forbidden();`, `  if (!user.subjects.includes(subject)) { await logEvent(env, request, user, 'access_denied', subject, null); return forbidden(); }
  await logEvent(env, request, user, 'app_open', subject, null);`],
]);
if (miss.length) { console.log('THIẾU:\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
