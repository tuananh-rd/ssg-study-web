import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function patch(file, R) {
  const f = path.join(W, file); let c = fs.readFileSync(f, 'utf8'), miss = 0;
  for (const [a, b] of R) { if (!c.includes(a)) { console.log('MISSING in', file, ':', a.slice(0, 90)); miss++; continue; } c = c.replace(a, () => b); }
  fs.writeFileSync(f, c); console.log(file, R.length - miss + '/' + R.length);
}
patch('functions/api/[[path]].js', [
  [`import { CPV_IMAGES } from '../_content.generated.js';`, `import { CPV_IMAGES } from '../_content.generated.js';\nimport { handleAi } from '../_ai.js';`],
  [`    if (a === 'password' && m === 'POST') {`, `    if (a === 'ai' && m === 'POST') return handleAi(request, env, user, readJson);\n\n    if (a === 'password' && m === 'POST') {`],
]);
// _serve.js: bỏ trang lý thuyết riêng, chèn cấu hình chatbot máy chủ
patch('functions/_serve.js', [
  [`import { APPS, LESSONS, LEARN_TEMPLATE } from './_content.generated.js';`, `import { APPS } from './_content.generated.js';`],
  [`  return \`<script>(function(){var S=`, `  return \`<script>window.AI_SERVER={label:'Trợ giảng AI'};</script><script>(function(){var S=`],
  [`  const links = [['/', '← Trang chủ']]; if (SUBJECTS[subject].theory) links.push(['/learn/' + subject, 'Lý thuyết']);\n`, `  const links = [['/', '← Trang chủ']];\n`],
]);
let s = fs.readFileSync(path.join(W, 'functions/_serve.js'), 'utf8');
s = s.replace(/export async function serveLearn[\s\S]*$/, '');
fs.writeFileSync(path.join(W, 'functions/_serve.js'), s.trimEnd() + '\n'); console.log('_serve.js: removed serveLearn');
fs.writeFileSync(path.join(W, 'functions/learn/[id].js'), `// Lý thuyết giờ nằm trong app chung của từng môn (tab "Lý thuyết"): chuyển hướng link cũ.\nexport const onRequestGet = ({ params }) => new Response(null, { status: 302, headers: { location: '/app/' + encodeURIComponent(params.id) + '#/learn', 'cache-control': 'no-store' } });\n`);
// build-content: dùng bản HTML thống nhất, bỏ bài học/đọc riêng
let b = fs.readFileSync(path.join(W, 'scripts/build-content.mjs'), 'utf8');
const start = b.indexOf('// ---- engine dùng chung'), end = b.indexOf('// ảnh slide CPV');
b = b.slice(0, start) + `// ---- HTML thống nhất: SSG105 (build.mjs ở thư mục gốc) và 3 môn còn lại (scripts/build-subjects.mjs) ----
const APPS = { ssg105: fs.readFileSync(path.join(W, '..', 'ssg105.html'), 'utf8') };
for (const id of ['dap391m', 'ail303m', 'cpv301']) APPS[id] = fs.readFileSync(path.join(W, 'data', \`app-\${id}.html\`), 'utf8');
` + b.slice(end);
b = b.replace(/export const LESSONS[^\n]*\nexport const LEARN_TEMPLATE[^\n]*\n/, '').replace(/console\.log\('Bài học:'[^\n]*\n/, '').replace(/console\.log\('CPV:'[^\n]*\n/, '');
fs.writeFileSync(path.join(W, 'scripts/build-content.mjs'), b); console.log('build-content.mjs rewritten');
