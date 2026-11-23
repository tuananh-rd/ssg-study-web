// Gửi tin chat thử từ một tài khoản: node scripts/say.mjs <email> <mật khẩu> "<nội dung>" [cổng]
const [email, pw, text, port = '8799'] = process.argv.slice(2); const B = 'http://localhost:' + port;
const h = { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' };
const l = await fetch(B + '/api/login', { method: 'POST', headers: h, body: JSON.stringify({ email, password: pw }) });
const ck = (l.headers.get('set-cookie') || '').split(';')[0];
const r = await fetch(B + '/api/chat', { method: 'POST', headers: { ...h, cookie: ck }, body: JSON.stringify({ body: text }) });
console.log(r.status, await r.text());
