// Kiểm thử điểm + bảng xếp hạng: node scripts/test-rank.mjs [port]  (cần seed admin boss như test-logs)
const B = 'http://localhost:' + (process.argv[2] || 8799);
const h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' };
const l = await fetch(B + '/api/login', { method: 'POST', headers: h, body: JSON.stringify({ email: 'boss@test.local', password: 'BossPass#2026' }) });
const ck = (l.headers.get('set-cookie') || '').split(';')[0];
const call = async (p, m, b) => { const r = await fetch(B + p, { method: m || 'GET', headers: { ...h, cookie: ck }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, j: await r.json().catch(() => null) }; };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const now = Date.now(), ev = (type, detail) => ({ type, ts: now, detail });
let r = await call('/api/rank'); ok(r.s === 200 && r.j.rows.length === 0 && r.j.me.total === 0, 'ban đầu chưa có điểm');
const evs = [];
for (let i = 0; i < 10; i++) evs.push(ev('quiz_answer', { id: i, ok: i < 6 }));              // 10 câu, 6 đúng → 16
evs.push(ev('read_time', { secs: 120 }), ev('read_time', { secs: 60 }));                      // 3 phút → +6
evs.push(ev('exam_finish', { right: 8, total: 10, score: 8 }));                               // 10 + 24 = 34
evs.push(ev('exam_finish', { right: 1, total: 5, score: 2 }));                                // dưới 10 câu → 0
evs.push(ev('duel_finish', { rank: 1, players: 3 }), ev('duel_finish', { rank: 2, players: 3 })); // 15 + 5 = 20
evs.push(ev('focus_session', { min: 25 }));                                                   // +25
r = await call('/api/event', 'POST', { events: evs }); ok(r.s === 200 && r.j.n === evs.length, 'gửi sự kiện');
r = await call('/api/rank?period=week'); const me = r.j.rows[0];
// 10+6 + 6 + 34 + 20 + 25 = 101
ok(me && me.pts === 101 && me.me && me.rank === 1, 'tổng điểm 101: ' + (me && me.pts));
ok(me && me.quiz === 10 && me.min === 3 && me.title === 'Siêu Tuất', 'quiz=10, đọc 3 phút, danh hiệu Siêu Tuất (' + (me && me.title) + ')');
ok(r.j.me.next && r.j.me.next.name === 'Tuất Vương' && r.j.me.today === 101, 'danh hiệu kế tiếp + điểm hôm nay');
ok(r.j.me.streak === 1, 'chuỗi 1 ngày');
// giới hạn mỗi ngày
const big = []; for (let i = 0; i < 500; i++) big.push(ev('quiz_answer', { ok: true }));
for (let k = 0; k < 13; k++) await call('/api/event', 'POST', { events: big.slice(0, 40) });
r = await call('/api/rank?period=all'); ok(r.j.rows[0].quiz === 400, 'quiz chặn ở 400 câu/ngày: ' + r.j.rows[0].quiz);
r = await call('/api/event', 'POST', { events: [ev('read_time', { secs: 99999 })] });
r = await call('/api/rank?period=all'); ok(r.j.rows[0].min === 5, 'read_time mỗi lần tối đa 120 giây: ' + r.j.rows[0].min);
r = await call('/api/event', 'POST', { events: [ev('quiz_answer', { ok: 'x' }), { type: 'hack', ts: now, detail: {} }] }); ok(r.s === 200 && r.j.n === 1, 'loại sự kiện lạ bị bỏ');
r = await call('/api/rank?period=bad'); ok(r.s === 200 && r.j.period === 'week', 'tham số lạ → tuần');
console.log(fails ? '\n' + fails + ' LỖI' : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
