import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let d = fs.readFileSync(path.join(W, 'scripts/dev-server.mjs'), 'utf8');
d = d.replace('const env = { DB };', "const env = { DB, AI_CONFIGS: process.env.AI_CONFIGS || '', AI_LIMIT_CHAT: process.env.AI_LIMIT_CHAT || '', AI_LIMIT_TR: process.env.AI_LIMIT_TR || '' };");
fs.writeFileSync(path.join(W, 'scripts/dev-server.mjs'), d);
let e = fs.readFileSync(path.join(W, 'scripts/e2e.mjs'), 'utf8');
const R = [
  [`r = await u1.call('GET', '/learn/ail303m'); ok(r.status === 403, 'Lý thuyết AIL303m chưa cấp → 403');`,
    `r = await u1.call('POST', '/api/ai', { mode: 'chat', subject: 'ail303m', messages: [{ role: 'user', content: 'hi' }] }); ok(r.status === 403, 'AI môn chưa cấp → 403');`],
  [`r = await u1.call('GET', '/learn/cpv301'); ok(r.status === 200 && r.text.includes('CPV301') && r.text.includes('Feature'), 'Lý thuyết CPV301 mở được');`,
    `r = await u1.call('GET', '/learn/cpv301'); ok(r.status === 302 && r.headers.get('location') === '/app/cpv301#/learn', 'link /learn cũ chuyển sang app chung');`],
  [`r = await u1.call('GET', '/learn/ssg105'); ok(r.status === 404, 'SSG105 không có trang lý thuyết riêng → 404');`,
    `r = await u1.call('GET', '/app/cpv301'); ok(r.text.includes('window.AI_SERVER') && !/sk-[A-Za-z0-9]{8}/.test(r.text), 'trang môn có chatbot máy chủ, không lộ key');`],
];
for (const [a, b] of R) { if (!e.includes(a)) console.log('MISSING', a.slice(0, 60)); else e = e.replace(a, () => b); }
// phần kiểm thử chatbot (chạy khi có AI_TEST=1: máy chủ thử nghiệm dùng upstream giả)
e = e.replace("console.log('6. Chống dò mật khẩu", `console.log('5b. Chatbot qua máy chủ (upstream giả)');
{ const c = new Client(); await c.call('POST', '/api/login', { email: 'admin@test.local', password: 'TestAdmin#2026' });
  const raw = async body => { const h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web', cookie: c.cookie, 'x-test-ip': c.ip }; const r = await fetch(BASE + '/api/ai', { method: 'POST', headers: h, body: JSON.stringify(body) }); return { status: r.status, text: await r.text(), ct: r.headers.get('content-type') }; };
  let a = await raw({ mode: 'chat', subject: 'cpv301', messages: [{ role: 'system', content: 'sys' }, { role: 'user', content: 'Giải thích SIFT' }] });
  ok(a.status === 200 && /text\\/event-stream/.test(a.ct) && a.text.includes('data:') && a.text.includes('[DONE]'), 'AI trả về luồng SSE', a.status + ' ' + a.text.slice(0, 120));
  ok(!a.text.includes('FAKEKEY'), 'phản hồi không lộ key');
  a = await raw({ mode: 'chat', subject: 'cpv301', messages: [] }); ok(a.status === 400 || a.status === 413, 'tin nhắn rỗng bị từ chối', a.status);
  a = await raw({ mode: 'chat', subject: 'cpv301', messages: [{ role: 'user', content: 'x'.repeat(80000) }] }); ok(a.status === 413, 'nội dung quá dài → 413', a.status);
  a = await raw({ mode: 'chat', subject: 'khongco', messages: [{ role: 'user', content: 'hi' }] }); ok(a.status === 403, 'môn không tồn tại → 403', a.status);
  const lim = new Client(); await lim.call('POST', '/api/login', { email: email2b, password: 'matkhau456' }); }
console.log('6. Chống dò mật khẩu`);
fs.writeFileSync(path.join(W, 'scripts/e2e.mjs'), e); console.log('tests patched');
