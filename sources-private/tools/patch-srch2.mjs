import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/', T = R + 'sources-private/tools/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8');
const s0 = a.indexOf('// ===== Tra cứu nhanh (Google + Wikipedia ngay trong web) =====');
const s1 = a.indexOf('var FOCUS_PRESETS=', s0);
if (s0 < 0 || s1 < 0) { console.log('không thấy khối cũ'); process.exit(1); }
a = a.slice(0, s0) + fs.readFileSync(T + 'srch2-mod.js', 'utf8') + '\n' + a.slice(s1);
fs.writeFileSync(R + 'src/app.js', a);
let c = fs.readFileSync(R + 'src/style.css', 'utf8');
const c0 = c.indexOf('/* ===== Tra cứu nhanh ===== */'), c1 = c.indexOf('.srch-fab{', c0);
if (c0 < 0 || c1 < 0) { console.log('không thấy css cũ'); process.exit(1); }
c = c.slice(0, c0) + '.ask-pop{display:flex;gap:6px}\n' + c.slice(c1);
c = c.replace('#srch .sr-head,#srch .sr-form,#srch .sr-go,#srch .sr-tabs{flex:none}#srch .sr-tabs{display:inline-flex}\n', '');
c += fs.readFileSync(T + 'srch2.css', 'utf8');
fs.writeFileSync(R + 'src/style.css', c);
console.log('ok');
