// Dựng lại bộ theo dõi nhúng trong mọi trang từ scripts/live-src.js: node scripts/regen-live.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = fs.readFileSync(path.join(W, 'scripts/live-src.js'), 'utf8').replace(/\s+$/, '');
fs.writeFileSync(path.join(W, 'functions/_live.js'), `// Bộ theo dõi nhúng thẳng vào mọi trang (không phụ thuộc file tĩnh bị lưu đệm): lệnh tải lại, báo bản mới, lời mời thi đấu.
// Sinh tự động từ scripts/live-src.js bằng scripts/regen-live.mjs, đừng sửa tay.
import { VERSION } from './_version.js';
const SRC = ${JSON.stringify(LIVE)};
export const liveTag = () => '<script>' + SRC.replace('__BASE__', JSON.stringify(VERSION)) + '</script>';
export { VERSION };
`);
const f = path.join(W, 'public/index.html'); let h = fs.readFileSync(f, 'utf8');
const i = h.indexOf('<script>(function(){if(window.__live)'), j = h.indexOf('</script></body>', i);
if (i < 0 || j < 0) { console.log('không thấy khối live trong index.html'); process.exit(1); }
h = h.slice(0, i) + '<script>' + LIVE.replace('__BASE__', 'null') + h.slice(j);
fs.writeFileSync(f, h); console.log('ok');
