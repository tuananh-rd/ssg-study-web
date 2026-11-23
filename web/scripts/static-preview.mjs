// Xem nhanh một bản build môn học (không cần đăng nhập): node scripts/static-preview.mjs <file.html> <port>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.resolve(W, process.argv[2] || 'data/app-cpv301.html'), PORT = +(process.argv[3] || 5175);
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (u === '/' || u.endsWith('.html')) { s.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); return fs.createReadStream(FILE).pipe(s); }
  let p = path.join(W, 'public', u);
  if (u.startsWith('/api/img/cpv/')) p = path.join(W, 'data', 'cpv-img', path.basename(u));
  if (!p.startsWith(W) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end('not found'); }
  s.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s);
}).listen(PORT, () => console.log('preview', FILE, 'on', PORT));
