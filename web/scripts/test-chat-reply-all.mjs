// Kiểm thử @all và trả lời tin: node scripts/test-chat-reply-all.mjs [port]
const B = 'http://localhost:' + (process.argv[2] || 8799), h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' };
async function login(e, p) { const l = await fetch(B + '/api/login', { method: 'POST', headers: h, body: JSON.stringify({ email: e, password: p }) }); return (l.headers.get('set-cookie') || '').split(';')[0]; }
const boss = await login('boss@test.local', 'BossPass#2026'), mod = await login('mod@test.local', 'ModPass#2026');
const call = async (c, p, m, b) => (await fetch(B + p, { method: m || 'GET', headers: { ...h, cookie: c }, body: b ? JSON.stringify(b) : undefined })).json();
const sleep = ms => new Promise(r => setTimeout(r, ms)); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
let r = await call(boss, '/api/chat', 'POST', { body: 'Họp nhóm lúc 8h nhé @all ơi' }); await sleep(1000);
let d = await call(mod, '/api/chat'); let m1 = d.msgs.find(x => x.id === r.id); ok(m1.men.length === 1 && m1.men[0].id === 0 && m1.men[0].name === 'all', '@all được nhận biết');
r = await call(boss, '/api/chat', 'POST', { body: 'email me@all.com không phải tag' }); await sleep(1000); d = await call(mod, '/api/chat'); ok(d.msgs.find(x => x.id === r.id).men.length === 0, '"me@all.com" không bị tính là @all');
r = await call(boss, '/api/chat', 'POST', { body: '@allison khác' }); await sleep(1000); d = await call(mod, '/api/chat'); ok(d.msgs.find(x => x.id === r.id).men.length === 0, '@allison không bị tính là @all');
const orig = (await call(boss, '/api/chat', 'POST', { body: 'câu hỏi gốc của boss' })).id; await sleep(1000);
r = await call(mod, '/api/chat', 'POST', { body: 'trả lời nè', reply_to: orig }); await sleep(1000);
d = await call(boss, '/api/chat'); const rp = d.msgs.find(x => x.id === r.id);
ok(rp.re && rp.re.id === orig && rp.re.name === 'Boss' && rp.re.body === 'câu hỏi gốc của boss' && !rp.re.gone, 'tin trả lời kèm trích dẫn đúng');
ok(rp.men.some(x => x.name === 'Boss' && x.rep === 1), 'người được trả lời được báo (rep)');
r = await call(mod, '/api/chat', 'POST', { body: 'trả lời tin không tồn tại', reply_to: 987654 }); await sleep(1000); d = await call(boss, '/api/chat'); ok(d.msgs.find(x => x.id === r.id).re === null, 'reply_to không tồn tại thì bỏ');
await call(boss, '/api/chat/' + orig, 'DELETE'); d = await call(boss, '/api/chat'); const rp2 = d.msgs.find(x => x.id === rp.id); ok(rp2.re && rp2.re.gone === true, 'xoá tin gốc thì trích dẫn báo "đã xoá"');
r = await call(boss, '/api/chat', 'POST', { body: 'tự trả lời mình', reply_to: rp.id }); await sleep(100); d = await call(boss, '/api/chat'); 
console.log(fails ? '\n' + fails + ' LỖI' : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
