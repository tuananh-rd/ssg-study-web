// Kiểm thử chat chung trên dev-server: node scripts/test-chat.mjs [port]  (cần seed admin boss/mod như test-logs)
const B = 'http://localhost:' + (process.argv[2] || 8799);
class Jar { constructor() { this.c = ''; } async req(path, method = 'GET', body) {
  const r = await fetch(B + path, { method, headers: { 'content-type': 'application/json', 'x-requested-with': 'ssg-web', cookie: this.c }, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) this.c = sc.split(';')[0]; let j = null; try { j = await r.json(); } catch { } return { s: r.status, j }; } }
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const boss = new Jar(), mod = new Jar(), anon = new Jar(), hs = new Jar();
await boss.req('/api/login', 'POST', { email: 'boss@test.local', password: 'BossPass#2026' });
await mod.req('/api/login', 'POST', { email: 'mod@test.local', password: 'ModPass#2026' });
ok((await anon.req('/api/chat')).s === 401, 'chưa đăng nhập không đọc được chat');
ok((await anon.req('/api/chat', 'POST', { body: 'hi' })).s === 401, 'chưa đăng nhập không gửi được');
let r = await boss.req('/api/chat'); ok(r.s === 200 && r.j.msgs.length === 0, 'phòng chat trống ban đầu');
ok((await boss.req('/api/chat', 'POST', { body: '   ' })).s === 400, 'tin trống bị từ chối');
ok((await boss.req('/api/chat', 'POST', { body: 'x'.repeat(501) })).s === 400, 'tin quá 500 ký tự bị từ chối');
r = await boss.req('/api/chat', 'POST', { body: 'Xin chào <b>mọi người</b> & "bạn"' }); ok(r.s === 200 && r.j.id, 'gửi tin thành công');
ok((await boss.req('/api/chat', 'POST', { body: 'nhanh quá' })).s === 429, 'chống spam: gửi liên tiếp bị chặn');
await sleep(1000);
r = await mod.req('/api/chat', 'POST', { body: 'chào boss' }); const modMsg = r.j.id; ok(r.s === 200, 'mod gửi tin');
r = await mod.req('/api/chat'); ok(r.j.msgs.length === 2 && r.j.msgs[0].role === 'admin' && r.j.msgs[0].name === 'Boss', 'đọc được 2 tin, có tên + vai trò');
ok(r.j.msgs[0].body.includes('<b>'), 'nội dung giữ nguyên (client tự escape)');
const first = r.j.msgs[0].id; r = await mod.req('/api/chat?after=' + first); ok(r.j.msgs.length === 1 && r.j.msgs[0].id === modMsg, 'poll chỉ trả tin mới hơn mốc');
r = await mod.req('/api/chat?after=' + modMsg); ok(r.j.msgs.length === 0, 'poll không có tin mới');
// người dùng thường
const us = (await boss.req('/api/admin/users')).j.users; ok(us.length >= 2, 'có tài khoản');
await hs.req('/api/register', 'POST', { email: 'hs2@test.local', name: 'Hoc Sinh 2', password: 'HocSinh#2026' });
const h = (await boss.req('/api/admin/users')).j.users.find(u => u.email === 'hs2@test.local');
await boss.req('/api/admin/users/' + h.id, 'POST', { status: 'active', subjects: ['ssg105'] });
await hs.req('/api/login', 'POST', { email: 'hs2@test.local', password: 'HocSinh#2026' });
r = await hs.req('/api/chat', 'POST', { body: 'em chào các anh' }); ok(r.s === 200, 'học sinh gửi tin'); const hsMsg = r.j.id;
r = await hs.req('/api/chat'); ok(r.j.msgs.find(m => m.id === hsMsg).role === 'user', 'học sinh có role user');
ok((await hs.req('/api/chat/' + modMsg, 'DELETE')).s === 403, 'học sinh không xoá được tin của người khác');
ok((await hs.req('/api/chat/' + hsMsg, 'DELETE')).s === 200, 'học sinh xoá được tin của mình');
await sleep(1000); r = await hs.req('/api/chat', 'POST', { body: 'tin vi phạm' }); const bad = r.j.id;
ok((await boss.req('/api/chat/' + bad, 'DELETE')).s === 200, 'admin xoá được tin của người khác');
r = await mod.req('/api/chat?after=0&sync=1'); ok(!r.j.msgs.some(m => m.id === bad) && Array.isArray(r.j.alive) && !r.j.alive.includes(bad), 'tin đã xoá biến mất, danh sách alive cập nhật');
r = await boss.req('/api/admin/logs?type=chat_send,chat_delete'); ok(r.j.rows.length >= 4 && r.j.rows.some(x => x.type === 'chat_delete'), 'chat được ghi vào nhật ký');
console.log(fails ? '\n' + fails + ' LỖI' : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
