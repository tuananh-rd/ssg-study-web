const fs = require('fs'), path = require('path');
const SP = 'D:/Downloads/SSG105 app/sources-private/';
const al = JSON.parse(fs.readFileSync(SP + 'cpv-align.json', 'utf8')).map, text = JSON.parse(fs.readFileSync(SP + 'cpv-slide-text.json', 'utf8'));
const bank = JSON.parse(fs.readFileSync(SP + 'cpv-questions.json', 'utf8')); const web = JSON.parse(fs.readFileSync('D:/Downloads/SSG105 app/web/data/cpv-questions.json', 'utf8'));
const byId = web;  // bản có id
const vals = Object.values(al); console.log('đơn ánh', new Set(vals).size === vals.length, 'trùng:', vals.filter((v, i) => vals.indexOf(v) !== i));
const dir = SP + 'cpv-verify-in/'; fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(SP + 'cpv-verify-out/', { recursive: true });
const slides = []; for (let p = 9; p <= 327; p++) {
  const h = al[p]; const cands = byId.filter(q => Math.abs(q.slide - p) <= 3).map(q => ({ id: q.id, slide: q.slide, question: q.question, options: q.options, answer_now: q.answer, section: q.section, topic: q.topic }));
  slides.push({ png: 'cpv-slides-png/slide-' + String(p).padStart(3, '0') + '.png', png_no: p, html_no: h, hidden: text[h] == null ? null : text[h], candidates: cands });
}
const N = 20, per = Math.ceil(slides.length / N);
for (let i = 0; i < N; i++) { const part = slides.slice(i * per, (i + 1) * per); if (part.length) fs.writeFileSync(dir + 'batch-' + String(i + 1).padStart(2, '0') + '.json', JSON.stringify(part, null, 1)); }
console.log('batches', N, 'per', per, 'ví dụ', JSON.stringify(slides[7]).slice(0, 400));
