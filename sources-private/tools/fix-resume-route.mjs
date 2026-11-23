import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/app.js';
let a = fs.readFileSync(f, 'utf8');
const s0 = a.indexOf('routes.resume=function(){');
const s1 = a.indexOf('\nfunction runQuiz(', s0);
if (s0 < 0 || s1 < 0) { console.log('không thấy'); process.exit(1); }
const block = a.slice(s0, s1);
a = a.slice(0, s0) + a.slice(s1 + 1);
const m = '// ===== Xem lại tất cả câu hỏi của bộ đề =====';
if (!a.includes(m)) { console.log('thiếu mốc'); process.exit(1); }
a = a.replace(m, () => block + '\n' + m);
fs.writeFileSync(f, a);
console.log('ok', block.length);
