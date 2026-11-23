// Smoke test trên site thật: node scripts/smoke.mjs https://... email matkhau
const [BASE, email, password] = process.argv.slice(2);
let cookie = '', fails = 0;
const call = async (m, p, b) => {
  const r = await fetch(BASE + p, { method: m, redirect: 'manual', headers: { 'content-type': 'application/json', 'x-requested-with': 'ssg-web', ...(cookie ? { cookie } : {}) }, body: b ? JSON.stringify(b) : undefined });
  const sc = r.headers.getSetCookie?.() || []; for (const c of sc) cookie = /Max-Age=0/i.test(c) ? '' : c.split(';')[0];
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch { } return { s: r.status, j, t, h: r.headers };
};
const ok = (c, n, x = '') => { if (!c) fails++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c ? '' : ' ← ' + x)); };
let r = await call('GET', '/'); ok(r.s === 200 && r.t.includes('Đăng nhập'), 'trang chủ (đăng nhập) tải được', r.s);
r = await call('GET', '/api/me'); ok(r.s === 401, 'chưa đăng nhập → 401', r.s);
r = await call('GET', '/app/ssg105'); ok(r.s === 302, 'app chưa đăng nhập → chuyển hướng', r.s);
r = await call('POST', '/api/login', { email, password: 'sai-mat-khau-1' }); ok(r.s === 401, 'sai mật khẩu → 401', r.s + ' ' + r.t.slice(0, 80));
r = await call('POST', '/api/login', { email, password }); ok(r.s === 200, 'đăng nhập admin', r.s + ' ' + r.t.slice(0, 120));
r = await call('GET', '/api/me'); ok(r.s === 200 && r.j.user.role === 'admin' && r.j.subjects.length === 4 && r.j.user.must_change === true, 'admin thấy 4 môn, bị buộc đổi mật khẩu', r.t.slice(0, 160));
for (const [p, needle] of [['/app/ssg105', 'SSG105'], ['/app/dap391m', 'DAP391m'], ['/app/ail303m', 'AIL303m'], ['/app/cpv301', 'CPV301'], ['/learn/dap391m', 'DAP391m'], ['/learn/ail303m', 'AIL303m'], ['/learn/cpv301', 'CPV301']]) {
  r = await call('GET', p); ok(r.s === 200 && r.t.includes(needle), p + ' → 200', r.s);
}
r = await call('GET', '/api/img/cpv/009.png'); ok(r.s === 200 && r.h.get('content-type') === 'image/png', 'ảnh slide CPV', r.s);
r = await call('GET', '/api/admin/users'); ok(r.s === 200 && r.j.users.length >= 1, 'admin API', r.s);
r = await call('GET', '/api/progress/cpv301'); ok(r.s === 200, 'API tiến độ', r.s);
r = await call('POST', '/api/logout'); ok(r.s === 200, 'đăng xuất', r.s);
r = await call('GET', '/api/me'); ok(r.s === 401, 'sau đăng xuất → 401', r.s);
console.log(fails ? `\n${fails} lỗi` : '\nTất cả đạt'); process.exit(fails ? 1 : 0);
