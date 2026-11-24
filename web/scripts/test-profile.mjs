// Kiểm thử hồ sơ: node scripts/test-profile.mjs [port]  (cần seed admin boss + user id 20 như test-rank)
const B = 'http://localhost:' + (process.argv[2] || 8799), h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' };
const l = await fetch(B + '/api/login', { method: 'POST', headers: h, body: JSON.stringify({ email: 'boss@test.local', password: 'BossPass#2026' }) });
const ck = (l.headers.get('set-cookie') || '').split(';')[0];
const call = async (p, m, b) => { const r = await fetch(B + p, { method: m || 'GET', headers: { ...h, cookie: ck }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, r, j: await r.clone().json().catch(() => null) }; };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const jpg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
let r = await call('/api/profile/20'); ok(r.s === 200 && r.j.name && !('email' in r.j) && r.j.pv === 0, 'xem hồ sơ người khác (không lộ email)');
r = await call('/api/profile/9999'); ok(r.s === 404, 'người không tồn tại 404');
r = await call('/api/profile', 'PUT', { bio: 'Xin chào\u0007 !', motto: 'Học đi', accent: '#7a4fd1', avatar: jpg }); ok(r.s === 200 && r.j.pv > 0, 'lưu hồ sơ + ảnh');
r = await call('/api/profile/1'); ok(r.j.me === true && r.j.bio === 'Xin chào !' && r.j.motto === 'Học đi' && r.j.accent === '#7a4fd1' && r.j.pv > 0, 'hồ sơ của mình đọc lại đúng, ký tự điều khiển bị bỏ');
r = await call('/api/profile/avatar/1'); ok(r.s === 200 && /image\/jpeg/.test(r.r.headers.get('content-type')), 'tải ảnh đại diện');
r = await call('/api/profile', 'PUT', { bio: 'a'.repeat(500), motto: 'b'.repeat(200), accent: 'javascript:1' }); r = await call('/api/profile/1'); ok(r.j.bio.length === 240 && r.j.motto.length === 70 && r.j.accent === null && r.j.pv > 0, 'cắt độ dài, màu sai bị bỏ, ảnh giữ nguyên khi không gửi avatar');
r = await call('/api/profile', 'PUT', { avatar: 'data:text/html;base64,PHNjcmlwdD4=' }); ok(r.s === 413, 'ảnh sai định dạng bị từ chối');
r = await call('/api/profile', 'PUT', { avatar: 'data:image/jpeg;base64,' + 'A'.repeat(160000) }); ok(r.s === 413, 'ảnh quá lớn bị từ chối');
r = await call('/api/profile', 'PUT', { avatar: null }); r = await call('/api/profile/1'); ok(r.j.pv === 0, 'gỡ ảnh');
r = await call('/api/profile/avatar/1'); ok(r.s === 404, 'ảnh đã gỡ → 404');
console.log(fails ? '\n' + fails + ' LỖI' : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
