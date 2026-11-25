// Kiểm thử đổi chủ ngôi vương: node scripts/test-throne.mjs [port]  (seed 2 admin: boss@test.local / mod@test.local như test-chat)
const B = 'http://localhost:' + (process.argv[2] || 8799);
const h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' };
const login = async (email, password) => { const l = await fetch(B + '/api/login', { method: 'POST', headers: h, body: JSON.stringify({ email, password }) }); const ck = (l.headers.get('set-cookie') || '').split(';')[0];
  return async (p, m, b) => { const r = await fetch(B + p, { method: m || 'GET', headers: { ...h, cookie: ck }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, j: await r.json().catch(() => null) }; }; };
const boss = await login('boss@test.local', 'BossPass#2026'), mod = await login('mod@test.local', 'ModPass#2026');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const q = n => Array.from({ length: n }, (_, i) => ({ type: 'quiz_answer', ts: Date.now(), detail: { id: i, ok: false } }));
let r = await boss('/api/live'); ok(r.s === 200 && r.j.th === null, 'ban đầu chưa có thông báo ngôi vương');
await boss('/api/event', 'POST', { events: q(10) });            // boss 10 điểm → vua đầu tiên (ghi nhận lặng lẽ)
r = await mod('/api/live'); ok(r.j.th === null, 'lần ghi nhận vua đầu tiên không thông báo');
await mod('/api/event', 'POST', { events: q(10) });             // hoà 10–10: vua cũ giữ ngôi
r = await mod('/api/live'); ok(r.j.th === null, 'hoà điểm thì không đổi chủ');
await mod('/api/event', 'POST', { events: q(5) });              // mod 15 > boss 10 → đổi chủ
r = await boss('/api/live'); const th = r.j.th;
ok(th && th.name && th.prev && th.name !== th.prev && th.pts === 15 && th.me === false, 'đổi chủ được báo cho vua cũ: ' + JSON.stringify(th));
r = await mod('/api/live'); ok(r.j.th && r.j.th.me === true && r.j.th.id === th.id, 'người mới lên ngôi thấy cờ me=true');
await mod('/api/event', 'POST', { events: q(5) });              // vua tự cộng thêm: không tạo sự kiện mới
r = await boss('/api/live'); ok(r.j.th && r.j.th.id === th.id, 'vua tự cộng điểm không tạo sự kiện mới');
await boss('/api/event', 'POST', { events: q(30) });            // boss 40 > mod 20 → đổi chủ lại
r = await mod('/api/live'); ok(r.j.th && r.j.th.id > th.id && r.j.th.me === false && r.j.th.pts === 40, 'vua mới lật đổ lại: ' + JSON.stringify(r.j.th));
console.log(fails ? '\n' + fails + ' LỖI' : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
