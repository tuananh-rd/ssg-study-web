// Kiểm thử tag @ trong chat và lời mời thi đấu: node scripts/test-mention-invite.mjs [port] (dev-server có seed boss/mod)
const B = 'http://localhost:' + (process.argv[2] || 8799);
class Jar { constructor() { this.c = ''; } async req(path, method = 'GET', body) {
  const r = await fetch(B + path, { method, headers: { 'content-type': 'application/json', 'x-requested-with': 'ssg-web', cookie: this.c }, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) this.c = sc.split(';')[0]; let j = null; try { j = await r.json(); } catch { } return { s: r.status, j }; } }
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const boss = new Jar(), mod = new Jar(), hs = new Jar();
await boss.req('/api/login', 'POST', { email: 'boss@test.local', password: 'BossPass#2026' });
await mod.req('/api/login', 'POST', { email: 'mod@test.local', password: 'ModPass#2026' });
await hs.req('/api/register', 'POST', { email: 'hs3@test.local', name: 'Hoc Sinh Ba', password: 'HocSinh#2026' });
const us = (await boss.req('/api/admin/users')).j.users, id = e => us.find(u => u.email === e).id;
await boss.req('/api/admin/users/' + id('hs3@test.local'), 'POST', { status: 'active', subjects: ['dap391m'] });
await hs.req('/api/login', 'POST', { email: 'hs3@test.local', password: 'HocSinh#2026' });
const modId = id('mod@test.local'), hsId = id('hs3@test.local');
// --- tag @
let r = await boss.req('/api/chat/users?q=mo'); ok(r.s === 200 && r.j.users.some(u => u.name === 'Mod'), 'gợi ý @ tìm thấy "Mod"');
ok(!r.j.users.some(u => u.name === 'Boss'), 'gợi ý không có chính mình');
r = await boss.req('/api/chat/users?q=%25'); ok(r.s === 200 && r.j.users.length === 0, 'ký tự % không khớp mọi tên (đã escape)');
r = await boss.req('/api/chat', 'POST', { body: 'Chào @Mod nhé, @Ma Gia không có', mentions: [modId, 9999] }); ok(r.s === 200, 'gửi tin có tag');
r = await mod.req('/api/chat'); const m1 = r.j.msgs[r.j.msgs.length - 1];
ok(m1.men.length === 1 && m1.men[0].id === modId && m1.men[0].name === 'Mod', 'tag hợp lệ được lưu, id giả bị bỏ');
await sleep(1000);
r = await boss.req('/api/chat', 'POST', { body: 'không nhắc ai cả', mentions: [modId] }); r = await mod.req('/api/chat');
ok(r.j.msgs[r.j.msgs.length - 1].men.length === 0, 'tên không có trong nội dung thì không tính là tag');
await sleep(1000);
r = await boss.req('/api/chat', 'POST', { body: 'ok', mentions: [id('boss@test.local')] }); r = await mod.req('/api/chat'); ok(r.j.msgs[r.j.msgs.length - 1].men.length === 0, 'tag không có @Tên thì bỏ');
// --- mời thi đấu
const code = 'ABC123';
r = await boss.req('/api/duel/host', 'POST', { code, name: 'Boss', subj: 'ssg105-duel-' }); ok(r.s === 200, 'boss tạo phòng');
r = await mod.req('/api/live'); ok(r.j.inv === null, 'chưa có lời mời');
r = await mod.req('/api/duel/invite', 'POST', { code, to: [hsId] }); ok(r.s === 403, 'người không phải chủ phòng không mời được');
r = await boss.req('/api/duel/invite', 'POST', { code, to: [] }); ok(r.s === 400, 'mời không chọn ai bị từ chối');
r = await boss.req('/api/duel/invite', 'POST', { code: 'ZZZZZZ', to: [modId] }); ok(r.s === 404, 'phòng không tồn tại');
r = await boss.req('/api/duel/invite', 'POST', { code, to: [modId, hsId, id('boss@test.local')] });
ok(r.s === 200 && r.j.sent.length === 1 && r.j.sent[0] === modId, 'mời: mod được gửi');
ok(r.j.skipped.some(x => x.id === hsId && /môn/.test(x.why)), 'học sinh chưa được cấp môn ssg105 bị bỏ qua, có lý do');
r = await mod.req('/api/live'); ok(r.j.inv && r.j.inv.code === code && r.j.inv.subj === 'ssg105' && r.j.inv.from === 'Boss', 'mod nhận lời mời qua /api/live');
r = await hs.req('/api/live'); ok(r.j.inv === null, 'học sinh không nhận lời mời');
r = await boss.req('/api/duel/close', 'POST', { code }); r = await mod.req('/api/live'); ok(r.j.inv === null, 'phòng đóng thì lời mời biến mất');
console.log(fails ? '\n' + fails + ' LỖI' : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
