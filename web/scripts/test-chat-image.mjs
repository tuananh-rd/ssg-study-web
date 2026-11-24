// Kiểm thử ảnh trong chat: node scripts/test-chat-image.mjs [port]
const B = 'http://localhost:' + (process.argv[2] || 8799);
const h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' };
async function login(e, p) { const l = await fetch(B + '/api/login', { method: 'POST', headers: h, body: JSON.stringify({ email: e, password: p }) }); return (l.headers.get('set-cookie') || '').split(';')[0]; }
const boss = await login('boss@test.local', 'BossPass#2026'), mod = await login('mod@test.local', 'ModPass#2026');
const call = async (c, p, m, b) => { const r = await fetch(B + p, { method: m || 'GET', headers: { ...h, cookie: c }, body: b ? JSON.stringify(b) : undefined }); return r; };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
// JPEG 1x1 nhỏ (hợp lệ)
const jpg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
let r = await call(boss, '/api/chat', 'POST', { body: 'xem ảnh này', image: jpg }); const j1 = await r.json(); ok(r.status === 200 && j1.id, 'gửi tin có ảnh');
await new Promise(x => setTimeout(x, 1000));
r = await call(boss, '/api/chat', 'POST', { image: jpg }); const j2 = await r.json(); ok(r.status === 200, 'gửi chỉ ảnh, không chữ');
r = await call(mod, '/api/chat'); const d = await r.json(); const m1 = d.msgs.find(x => x.id === j1.id);
ok(m1 && m1.img === true && !('image' in m1) && JSON.stringify(d).length < 5000, 'poll chỉ trả cờ img, không trả dữ liệu ảnh');
r = await call(mod, '/api/chat/img/' + j1.id); const buf = await r.arrayBuffer(); ok(r.status === 200 && /image\/jpeg/.test(r.headers.get('content-type')) && buf.byteLength > 50, 'tải ảnh: ' + r.headers.get('content-type') + ' ' + buf.byteLength + 'B');
r = await call('', '/api/chat/img/' + j1.id); ok(r.status === 401, 'chưa đăng nhập không xem được ảnh');
await new Promise(x => setTimeout(x, 1000));
r = await call(boss, '/api/chat', 'POST', { body: 'x', image: 'data:text/html;base64,PHNjcmlwdD4=' }); ok(r.status === 413, 'định dạng không phải ảnh bị từ chối');
r = await call(boss, '/api/chat', 'POST', { body: 'x', image: 'data:image/jpeg;base64,' + 'A'.repeat(710000) }); ok(r.status === 413, 'ảnh quá lớn bị từ chối');
r = await call(boss, '/api/chat', 'POST', { body: '', image: null }); ok(r.status === 400, 'không chữ không ảnh bị từ chối');
r = await call(mod, '/api/chat/img/999999'); ok(r.status === 404, 'ảnh không tồn tại 404');
r = await call(boss, '/api/chat/' + j1.id, 'DELETE'); r = await call(mod, '/api/chat/img/' + j1.id); ok(r.status === 404, 'xoá tin thì ảnh cũng mất');
console.log(fails ? '\n' + fails + ' LỖI' : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
