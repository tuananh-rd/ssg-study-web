// Phục vụ chỉ-đọc ảnh slide CPV và SVG nguồn để đối chiếu: node web/scripts/slides-server.mjs [port]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'sources-private'), PORT = +(process.argv[2] || 5180);
const OK = /^\/(cpv-slides-png\/slide-\d{3}\.png|src-cpv-slides-(part[1-4]|fix49-58)\.json|cpv-questions\.json|cpv-slide-text\.json)$/;
http.createServer((q, s) => { const u = q.url.split('?')[0]; if (!OK.test(u)) { s.writeHead(404); return s.end('no'); }
  const p = path.join(R, u); s.writeHead(200, { 'content-type': u.endsWith('.png') ? 'image/png' : 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' }); fs.createReadStream(p).pipe(s); }).listen(PORT, () => console.log('slides on', PORT));
