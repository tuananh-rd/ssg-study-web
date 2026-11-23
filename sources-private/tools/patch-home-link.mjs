import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/';
let s = fs.readFileSync(W + 'web/functions/_serve.js', 'utf8');
const a = s.indexOf('const BAR_CSS'), b = s.indexOf('const redirectLogin');
if (a < 0 || b < 0) { console.log('MISSING markers'); process.exit(1); }
s = s.slice(0, a) + "const bar = () => `<style>#web-home{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--panel);color:var(--text);padding:7px 12px;border-radius:10px;font:600 .86rem system-ui,sans-serif;text-decoration:none;white-space:nowrap}#web-home:hover{background:var(--panel2)}#web-home svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}@media(max-width:760px){#web-home span{display:none}#web-home{padding:7px 9px}}</style><script>(function(){var h=document.querySelector('#top .in');if(!h||document.getElementById('web-home'))return;var a=document.createElement('a');a.id='web-home';a.href='/';a.title='Quay lại danh sách môn học';a.innerHTML='<svg viewBox=\"0 0 24 24\"><path d=\"M15 18l-6-6 6-6\"/></svg><span>Môn học</span>';h.insertBefore(a,h.firstChild);})();</script>`;\n\n" + s.slice(b);
s = s.replace("const links = [['/', '← Trang chủ']];\n", '').replace("bar(links) + '</body>'", "bar() + '</body>'");
fs.writeFileSync(W + 'web/functions/_serve.js', s);
let e = fs.readFileSync(W + 'web/scripts/e2e.mjs', 'utf8'); e = e.replace(`r.text.includes('id="ssg-bar"')`, `r.text.includes('id=\\'web-home\\'') || r.text.includes('web-home')`); fs.writeFileSync(W + 'web/scripts/e2e.mjs', e);
fs.appendFileSync(W + 'src/style.css', '\n.help-btn{white-space:nowrap}\n');
console.log('ok');
