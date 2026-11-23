// Ghép số slide HTML (khoá của cpv-slide-text.json) với số slide SVG/PNG (tên file ảnh) qua pageid của Google Slides.
const fs = require('fs'), path = require('path');
const SP = 'D:/Downloads/SSG105 app/sources-private/';
const html = fs.readFileSync(SP + 'src-cpv-slides.html', 'utf8');
const htmlPage = {};   // slide HTML -> pageid
for (const m of html.matchAll(/aria-label="Slide (\d+)"[^>]*style="[^"]*?pageid=([A-Za-z0-9_]+)/g)) htmlPage[+m[1]] = m[2];
const svgPage = {};    // slide SVG -> id đầu tiên của trang
for (const p of ['part1', 'part2', 'part3', 'part4', 'fix49-58']) {
  const j = JSON.parse(fs.readFileSync(SP + 'src-cpv-slides-' + p + '.json', 'utf8'));
  for (const k of Object.keys(j)) { const ids = [...j[k].matchAll(/ id="(h[0-9a-f]+_\d+_\d+)"/g)].map(x => x[1]); svgPage[+k] = ids[0]; if (!svgPage['all' + k]) svgPage['all' + k] = ids.slice(0, 3); }
}
const hk = Object.keys(htmlPage).map(Number).sort((a, b) => a - b);
console.log('html slides', hk.length, 'svg slides', Object.keys(svgPage).filter(k => /^\d+$/.test(k)).length);
console.log('mẫu html', hk.slice(14, 19).map(k => k + ':' + htmlPage[k]), 'mẫu svg', [15, 16, 17, 18].map(k => k + ':' + svgPage[k] + ' ' + JSON.stringify(svgPage['all' + k])));
const byPage = {}; for (const k of hk) byPage[htmlPage[k]] = k;
const map = {}; let hit = 0, miss = [];
for (const k of Object.keys(svgPage).filter(k => /^\d+$/.test(k)).map(Number)) {
  const ids = svgPage['all' + k] || []; let h = null; for (const id of ids) { const base = id.replace(/-.*$/, ''); if (byPage[base]) { h = byPage[base]; break; } }
  if (h) { map[k] = h; hit++; } else miss.push(k);
}
console.log('khớp', hit, 'không khớp', miss.length, miss.slice(0, 20));
const offs = {}; for (const k in map) { const o = map[k] - k; offs[o] = (offs[o] || 0) + 1; } console.log('độ lệch html-svg', JSON.stringify(offs));
fs.writeFileSync(SP + 'cpv-align.json', JSON.stringify({ map, miss }));
