import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 70)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
const INV = `CREATE TABLE IF NOT EXISTS duel_invites (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, from_user INTEGER NOT NULL, to_user INTEGER NOT NULL, code TEXT NOT NULL, subj TEXT);\nCREATE INDEX IF NOT EXISTS idx_inv_to ON duel_invites (to_user, id);\n`;
patch('schema.sql', [
  [`user_id INTEGER NOT NULL, body TEXT NOT NULL);`, `user_id INTEGER NOT NULL, body TEXT NOT NULL, mentions TEXT);`],
  [`-- Chat chung`, `-- Lời mời vào phòng thi đấu\n${INV}\n-- Chat chung`],
]);
fs.writeFileSync(W + 'migrate-mention-invite.sql', `-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-mention-invite.sql\nALTER TABLE chat_messages ADD COLUMN mentions TEXT;\n${INV}`);
patch('functions/_chat.js', [
  [`const SEL = 'SELECT m.id,m.ts,m.user_id uid,m.body,u.name,u.role FROM`, `const SEL = 'SELECT m.id,m.ts,m.user_id uid,m.body,m.mentions,u.name,u.role FROM`],
  [`body: r.body })), me: user.id };`, `body: r.body, men: parseMen(r.mentions) })), me: user.id };`],
  [`export async function handleChat(request, env, user, sub, readJson) {
  const m = request.method;`, `const parseMen = s => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a.filter(x => x && x.id && x.name) : []; } catch { return []; } };
const likeEsc = s => s.replace(/[\\\\%_]/g, c => '\\\\' + c);

export async function handleChat(request, env, user, sub, readJson) {
  const m = request.method;
  if (m === 'GET' && sub === 'users') {   // gợi ý khi gõ @
    const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 30), now = Date.now();
    const rows = (await env.DB.prepare("SELECT u.id,u.name,u.role,(p.ts>?) AS on_ FROM users u LEFT JOIN presence p ON p.user_id=u.id WHERE u.status='active' AND u.id<>? AND u.name LIKE ? ESCAPE '\\\\' ORDER BY on_ DESC, (u.name LIKE ? ESCAPE '\\\\') DESC, u.name COLLATE NOCASE LIMIT 8").bind(now - ONLINE_MS, user.id, '%' + likeEsc(q) + '%', likeEsc(q) + '%').all()).results;
    return json({ users: rows.map(r => ({ id: r.id, name: r.name, role: r.role, on: !!r.on_ })) });
  }`],
  [`    const r = await env.DB.prepare('INSERT INTO chat_messages (ts,user_id,body) VALUES (?,?,?) RETURNING id').bind(now, user.id, body).first();
    await logEvent(env, request, user, 'chat_send', null, { len: body.length, q: body.slice(0, 120) });`, `    // các người được tag: chỉ nhận id có thật, đang hoạt động, và tên còn xuất hiện trong nội dung dạng @Tên
    let men = [];
    const ids = [...new Set((Array.isArray(d.mentions) ? d.mentions : []).map(Number).filter(n => n > 0))].slice(0, 8);
    if (ids.length) {
      const us = (await env.DB.prepare(\`SELECT id,name FROM users WHERE status='active' AND id IN (\${ids.map(() => '?').join(',')})\`).bind(...ids).all()).results;
      men = us.filter(u => body.includes('@' + u.name)).map(u => ({ id: u.id, name: u.name }));
    }
    const r = await env.DB.prepare('INSERT INTO chat_messages (ts,user_id,body,mentions) VALUES (?,?,?,?) RETURNING id').bind(now, user.id, body, men.length ? JSON.stringify(men) : null).first();
    await logEvent(env, request, user, 'chat_send', null, { len: body.length, q: body.slice(0, 120), tag: men.map(x => x.name) });`],
]);
patch('functions/_duel.js', [
  [`  if (action === 'list') {`, `  if (action === 'invite') {   // chủ phòng mời người đang online
    const code = d.code; if (!okCode(code)) return bad('Mã phòng không hợp lệ');
    const room = await env.DB.prepare('SELECT host_user,subj,last,phase FROM duel_rooms WHERE code=?').bind(code).first();
    if (!room || now - room.last > ROOM_TTL) return bad('Phòng không còn mở', 404);
    if (room.host_user !== user.id) return bad('Chỉ chủ phòng mới mời được', 403);
    const subject = String(room.subj || '').replace(/-duel-$/, '');
    const recent = (await env.DB.prepare('SELECT COUNT(*) n FROM duel_invites WHERE from_user=? AND ts>?').bind(user.id, now - 60000).first()).n;
    const to = [...new Set((Array.isArray(d.to) ? d.to : []).map(Number).filter(n => n > 0 && n !== user.id))].slice(0, 8);
    if (!to.length) return bad('Chưa chọn người nhận');
    if (recent + to.length > 24) return bad('Mời quá nhiều, đợi một lát', 429);
    const sent = [], skipped = [];
    for (const id of to) {
      const t = await env.DB.prepare("SELECT id,role,status FROM users WHERE id=?").bind(id).first();
      if (!t || t.status !== 'active') { skipped.push({ id, why: 'không hoạt động' }); continue; }
      if (t.role !== 'admin' && !(await env.DB.prepare('SELECT 1 FROM grants WHERE user_id=? AND subject=?').bind(id, subject).first())) { skipped.push({ id, why: 'chưa được cấp môn này' }); continue; }
      await env.DB.prepare('INSERT INTO duel_invites (ts,from_user,to_user,code,subj) VALUES (?,?,?,?,?)').bind(now, user.id, id, code, subject).run(); sent.push(id);
    }
    if (sent.length) await logEvent(env, request, user, 'duel_invite', subject, { code, to: sent });
    return json({ ok: true, sent, skipped });
  }

  if (action === 'list') {`],
]);
patch('functions/api/[[path]].js', [
  [`      return json({ v: VERSION, rl: rl ? rl.id : 0, rlmsg: rl ? rl.msg || '' : '' });`, `      const nowT = Date.now();
      const iv = await env.DB.prepare("SELECT i.id,i.code,i.subj,u.name FROM duel_invites i JOIN users u ON u.id=i.from_user JOIN duel_rooms r ON r.code=i.code AND r.last>? AND r.phase IN ('wait','ready') WHERE i.to_user=? AND i.ts>? ORDER BY i.id DESC LIMIT 1").bind(nowT - 20000, user.id, nowT - 120000).first();
      return json({ v: VERSION, rl: rl ? rl.id : 0, rlmsg: rl ? rl.msg || '' : '', inv: iv ? { id: iv.id, code: iv.code, subj: iv.subj, from: iv.name } : null });`],
]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
