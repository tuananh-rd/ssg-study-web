// Dựng functions/_content.generated.js: HTML từng môn (nhúng sẵn), bài học, ảnh slide CPV. Nội dung nằm trong Worker, KHÔNG nằm trong public/.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (...p) => fs.readFileSync(path.join(W, ...p), 'utf8');
const safeScript = s => s.replace(/<\/script/gi, '<\\/script');
const THEME = key => `<script>try{var s=JSON.parse(localStorage.getItem('${key}')||'{}'),t=s.prefs&&s.prefs.theme;if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}</script>`;

// ---- HTML thống nhất: SSG105 (build.mjs ở thư mục gốc) và 3 môn còn lại (scripts/build-subjects.mjs) ----
const APPS = { ssg105: fs.readFileSync(path.join(W, '..', 'ssg105.html'), 'utf8') };
for (const id of ['dap391m', 'ail303m', 'cpv301']) APPS[id] = fs.readFileSync(path.join(W, 'data', `app-${id}.html`), 'utf8');
// ảnh slide CPV
const CPV_IMAGES = {};
const imgDir = path.join(W, 'data', 'cpv-img');
if (fs.existsSync(imgDir)) for (const f of fs.readdirSync(imgDir)) CPV_IMAGES[f.replace('.png', '')] = fs.readFileSync(path.join(imgDir, f)).toString('base64');

const out = `// FILE TỰ SINH bởi scripts/build-content.mjs — đừng sửa tay.
export const APPS = ${JSON.stringify(APPS)};
export const CPV_IMAGES = ${JSON.stringify(CPV_IMAGES)};
`;
fs.writeFileSync(path.join(W, 'functions', '_content.generated.js'), out);
const kb = s => (s.length / 1024).toFixed(0) + ' KB';
console.log('Môn:', Object.entries(APPS).map(([k, v]) => `${k} ${kb(v)}`).join(' | '));
console.log('Tổng _content.generated.js:', kb(out));
