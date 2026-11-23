// Kiểm thử đầu-cuối API: node scripts/e2e.mjs http://localhost:8788  (cần admin admin@test.local / TestAdmin#2026)
const BASE = process.argv[2] || 'http://localhost:8788';
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) pass++; else fail++; console.log((c ? '  ✔ ' : '  ✘ ') + name + (c ? '' : '  ← ' + extra)); };
class Client {
  constructor(ip) { this.cookie = ''; this.ip = ip || '10.0.0.' + Math.floor(Math.random() * 200 + 1); }
  async call(method, p, body, extra = {}) {
    const h = { 'x-test-ip': this.ip, ...extra }; if (this.cookie) h.cookie = this.cookie;
    if (!('noCsrf' in extra)) { h['content-type'] = 'application/json'; h['x-requested-with'] = 'ssg-web'; } else { delete h.noCsrf; }
    const r = await fetch(BASE + p, { method, headers: h, body: body ? JSON.stringify(body) : undefined, redirect: 'manual' });
    const sc = r.headers.getSetCookie?.() || []; for (const c of sc) { const kv = c.split(';')[0]; if (/^sid=;?$/.test(kv) || /Max-Age=0/i.test(c)) this.cookie = ''; else this.cookie = kv; }
    const text = await r.text(); let j = null; try { j = JSON.parse(text); } catch { }
    return { status: r.status, j, text, headers: r.headers };
  }
}
const admin = new Client(), u1 = new Client(), u2 = new Client(), anon = new Client();
const email = `user${Date.now()}@example.com`, email2 = `u2${Date.now()}@example.com`;

console.log('1. Chưa đăng nhập');
ok((await anon.call('GET', '/api/me')).status === 401, '/api/me → 401');
ok((await anon.call('GET', '/app/ssg105')).status === 302, '/app/ssg105 → chuyển về trang đăng nhập');
ok((await anon.call('GET', '/api/admin/users')).status === 401, 'admin API → 401');
ok((await anon.call('POST', '/api/login', { email: 'x@y.zz', password: 'abcdefgh' }, { noCsrf: 1 })).status === 403, 'thiếu header CSRF → 403');

console.log('2. Đăng ký & duyệt');
let r = await u1.call('POST', '/api/register', { email, name: 'Nguyễn Văn A', password: 'matkhau123' }); ok(r.status === 200, 'đăng ký', JSON.stringify(r.j));
r = await u1.call('POST', '/api/register', { email, name: 'Trùng', password: 'matkhau123' }); ok(r.status === 409, 'email trùng → 409');
r = await u1.call('POST', '/api/register', { email: 'bad', name: 'A B', password: 'matkhau123' }); ok(r.status === 400, 'email sai → 400');
r = await u1.call('POST', '/api/register', { email: 'a@b.cc', name: 'A B', password: '123' }); ok(r.status === 400, 'mật khẩu ngắn → 400');
r = await u1.call('POST', '/api/login', { email, password: 'matkhau123' }); ok(r.status === 403 && /chờ/.test(r.j.error), 'chưa duyệt → không đăng nhập được', JSON.stringify(r.j));
r = await admin.call('POST', '/api/login', { email: 'admin@test.local', password: 'TestAdmin#2026' }); ok(r.status === 200, 'admin đăng nhập', JSON.stringify(r.j));
r = await admin.call('GET', '/api/me'); ok(r.j.user.role === 'admin' && r.j.subjects.length === 4, 'admin thấy 4 môn');
r = await admin.call('GET', '/api/admin/users'); const uid = r.j.users.find(x => x.email === email)?.id; ok(!!uid && r.j.users.find(x => x.id === uid).status === 'pending', 'admin thấy tài khoản chờ duyệt');
r = await admin.call('POST', `/api/admin/users/${uid}`, { status: 'active', subjects: ['ssg105', 'cpv301'] }); ok(r.status === 200, 'admin duyệt + cấp ssg105, cpv301');

console.log('3. Người dùng & phân quyền môn');
r = await u1.call('POST', '/api/login', { email, password: 'sai-mat-khau' }); ok(r.status === 401, 'sai mật khẩu → 401');
r = await u1.call('POST', '/api/login', { email, password: 'matkhau123' }); ok(r.status === 200, 'đăng nhập sau duyệt');
r = await u1.call('GET', '/api/me'); ok(r.j.user.email === email && r.j.subjects.map(s => s.id).join() === 'ssg105,cpv301', 'chỉ thấy môn được cấp', JSON.stringify(r.j.subjects?.map(s => s.id)));
r = await u1.call('GET', '/api/admin/users'); ok(r.status === 403, 'user thường không vào được admin API');
r = await u1.call('GET', '/app/ssg105'); ok(r.status === 200 && /<title>SSG105/.test(r.text) && r.text.includes("/api/progress/") && r.text.includes('id=\'web-home\'') || r.text.includes('web-home'), 'mở app SSG105 có script đồng bộ + nút trang chủ', r.status);
ok(r.text.indexOf('ssg-web-user') < r.text.indexOf('window.DATA'), 'script đồng bộ chạy TRƯỚC dữ liệu app');
r = await u1.call('GET', '/app/cpv301'); ok(r.status === 200 && r.text.includes('CPV301'), 'mở app CPV301');
r = await u1.call('GET', '/app/dap391m'); ok(r.status === 403, 'DAP391m chưa cấp → 403');
r = await u1.call('POST', '/api/ai', { mode: 'chat', subject: 'ail303m', messages: [{ role: 'user', content: 'hi' }] }); ok(r.status === 403, 'AI môn chưa cấp → 403');
r = await u1.call('GET', '/learn/cpv301'); ok(r.status === 302 && r.headers.get('location') === '/app/cpv301#/learn', 'link /learn cũ chuyển sang app chung');
r = await u1.call('GET', '/app/cpv301'); ok(r.text.includes('window.AI_SERVER') && !/sk-[A-Za-z0-9]{8}/.test(r.text), 'trang môn có chatbot máy chủ, không lộ key');
r = await u1.call('GET', '/api/img/cpv/009.png'); ok(r.status === 200 && r.headers.get('content-type') === 'image/png', 'ảnh slide CPV có quyền → 200');
r = await u1.call('GET', '/api/progress/dap391m'); ok(r.status === 403, 'tiến độ môn chưa cấp → 403');

console.log('4. Đồng bộ tiến độ');
r = await u1.call('GET', '/api/progress/ssg105'); ok(r.status === 200 && r.j.data === null && r.j.updated_at === 0, 'tiến độ ban đầu trống');
const prog = JSON.stringify({ version: 2, answers: { q1: { seen: 1, correct: 1 } } });
r = await u1.call('PUT', '/api/progress/ssg105', { data: prog }); ok(r.status === 200 && r.j.updated_at > 0, 'lưu tiến độ');
r = await u1.call('GET', '/api/progress/ssg105'); ok(r.j.data === prog, 'đọc lại đúng tiến độ');
r = await u1.call('PUT', '/api/progress/ssg105', { data: 'không phải json' }); ok(r.status === 400, 'JSON sai → 400');
r = await u1.call('PUT', '/api/progress/ssg105', { data: 'x'.repeat(800000) }); ok(r.status === 413, 'quá lớn → 413');

console.log('5. Đổi mật khẩu, đặt lại, khoá');
r = await u1.call('POST', '/api/password', { old: 'sai', new: 'matkhaumoi1' }); ok(r.status === 401, 'đổi MK sai MK cũ → 401');
r = await u1.call('POST', '/api/password', { old: 'matkhau123', new: 'matkhaumoi1' }); ok(r.status === 200, 'đổi mật khẩu');
r = await admin.call('POST', `/api/admin/users/${uid}/reset`); const temp = r.j.password; ok(r.status === 200 && temp?.length === 12, 'admin đặt lại mật khẩu tạm');
r = await u1.call('GET', '/api/me'); ok(r.status === 401, 'phiên cũ bị đăng xuất sau khi reset');
r = await u1.call('POST', '/api/login', { email, password: temp }); ok(r.status === 200, 'đăng nhập bằng mật khẩu tạm');
r = await u1.call('GET', '/api/me'); ok(r.j.user.must_change === true, 'bị buộc đổi mật khẩu');
r = await u1.call('POST', '/api/password', { old: temp, new: 'matkhaucuoi9' }); ok(r.status === 200, 'đổi sang mật khẩu riêng');
r = await u1.call('GET', '/api/me'); ok(r.j.user.must_change === false, 'hết cờ buộc đổi');
r = await admin.call('POST', `/api/admin/users/${uid}`, { subjects: ['dap391m'] }); ok(r.status === 200, 'admin đổi quyền sang DAP');
r = await u1.call('GET', '/app/dap391m'); ok(r.status === 200, 'quyền mới có hiệu lực ngay');
r = await u1.call('GET', '/app/ssg105'); ok(r.status === 403, 'quyền cũ bị thu hồi');
r = await admin.call('POST', `/api/admin/users/${uid}`, { status: 'disabled' }); ok(r.status === 200, 'admin khoá tài khoản');
r = await u1.call('GET', '/api/me'); ok(r.status === 401, 'tài khoản bị khoá mất phiên ngay');
r = await u1.call('POST', '/api/login', { email, password: 'matkhaucuoi9' }); ok(r.status === 403, 'khoá → không đăng nhập được');

console.log('5b. Chatbot qua máy chủ (upstream giả)');
{ const c = new Client(); await c.call('POST', '/api/login', { email: 'admin@test.local', password: 'TestAdmin#2026' });
  const raw = async body => { const h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web', cookie: c.cookie, 'x-test-ip': c.ip }; const r = await fetch(BASE + '/api/ai', { method: 'POST', headers: h, body: JSON.stringify(body) }); return { status: r.status, text: await r.text(), ct: r.headers.get('content-type') }; };
  let a = await raw({ mode: 'chat', subject: 'cpv301', messages: [{ role: 'system', content: 'sys' }, { role: 'user', content: 'Giải thích SIFT' }] });
  ok(a.status === 200 && /text\/event-stream/.test(a.ct) && a.text.includes('data:') && a.text.includes('[DONE]'), 'AI trả về luồng SSE', a.status + ' ' + a.text.slice(0, 120));
  ok(!a.text.includes('FAKEKEY'), 'phản hồi không lộ key');
  a = await raw({ mode: 'chat', subject: 'cpv301', messages: [] }); ok(a.status === 400 || a.status === 413, 'tin nhắn rỗng bị từ chối', a.status);
  a = await raw({ mode: 'chat', subject: 'cpv301', messages: [{ role: 'user', content: 'x'.repeat(80000) }] }); ok(a.status === 413, 'nội dung quá dài → 413', a.status);
  a = await raw({ mode: 'chat', subject: 'khongco', messages: [{ role: 'user', content: 'hi' }] }); ok(a.status === 403, 'môn không tồn tại → 403', a.status); }
console.log('6. Chống dò mật khẩu & bảo vệ admin cuối');
const brute = new Client('203.0.113.9'); let last;
for (let i = 0; i < 9; i++) last = await brute.call('POST', '/api/login', { email: 'admin@test.local', password: 'sai' + i });
ok(last.status === 429, 'sai >8 lần → 429', last.status);
r = await admin.call('GET', '/api/admin/users'); const aid = r.j.users.find(x => x.email === 'admin@test.local').id;
r = await admin.call('POST', `/api/admin/users/${aid}`, { role: 'user' }); ok(r.status === 409, 'không thể hạ admin cuối cùng');
r = await admin.call('POST', `/api/admin/users/${aid}`, { status: 'disabled' }); ok(r.status === 409, 'không thể khoá admin cuối cùng');
r = await admin.call('DELETE', `/api/admin/users/${aid}`); ok(r.status === 409, 'không thể tự xoá');
r = await u2.call('POST', '/api/register', { email: email2, name: 'Người B', password: 'matkhau456' }); ok(r.status === 200, 'đăng ký người thứ hai');
r = await admin.call('GET', '/api/admin/users'); const uid2 = r.j.users.find(x => x.email === email2).id;
r = await admin.call('DELETE', `/api/admin/users/${uid2}`); ok(r.status === 200, 'xoá tài khoản');
r = await admin.call('POST', '/api/logout'); ok(r.status === 200, 'đăng xuất');
r = await admin.call('GET', '/api/me'); ok(r.status === 401, 'sau đăng xuất mất phiên');

console.log(`\nKết quả: ${pass} đạt, ${fail} lỗi`); process.exit(fail ? 1 : 0);
