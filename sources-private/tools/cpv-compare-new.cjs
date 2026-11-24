// So bộ đề CPV trong D:/Downloads/CPV (cpv301_questions.json) với bộ đề hiện tại của web.
const fs = require('fs');
const N = JSON.parse(fs.readFileSync('D:/Downloads/CPV/cpv301_questions.json', 'utf8'));
const C = JSON.parse(fs.readFileSync('D:/Downloads/SSG105 app/web/data/cpv-questions.json', 'utf8'));
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const key = q => norm(q.question).slice(0, 70) + '|' + q.options.map(norm).sort().join('|').slice(0, 60);
const stat = (n, a) => ({ n: a.length, withExp: a.filter(q => (q.explanation || '').trim()).length, multi: a.filter(q => (q.answer || []).length > 1).length });
console.log('mới', JSON.stringify(stat('mới', N)), 'hiện tại', JSON.stringify(stat('cũ', C)));
console.log('trường mẫu mới:', Object.keys(N[0]).join(','), '| topic mới:', [...new Set(N.map(q => q.topic))].length);
const byQ = new Map(); C.forEach(q => { const k = norm(q.question).slice(0, 60); if (!byQ.has(k)) byQ.set(k, []); byQ.get(k).push(q); });
let match = 0, same = 0, diff = [], only = [], optDiff = 0;
for (const q of N) {
  const cand = (byQ.get(norm(q.question).slice(0, 60)) || []);
  // chọn bản có tập phương án giống nhất
  let best = null, bs = -1; for (const c of cand) { const a = new Set(q.options.map(norm)), b = new Set(c.options.map(norm)); let s = 0; a.forEach(x => { if (b.has(x)) s++; }); if (s > bs) { bs = s; best = c; } }
  if (!best) { only.push(q); continue; }
  match++;
  const ansTxt = o => o.answer.map(i => norm(o.options[i])).sort().join('||');
  if (bs < q.options.length) optDiff++;
  if (ansTxt(q) === ansTxt(best)) same++; else diff.push({ idNew: q.id, slideNew: q.slide, idCur: best.id, q: q.question.slice(0, 70), newAns: q.answer.map(i => q.options[i]), curAns: best.answer.map(i => best.options[i]), expl: (q.explanation || '').slice(0, 80) });
}
console.log('ghép được', match, '/', N.length, '| cùng đáp án', same, '| khác đáp án', diff.length, '| phương án chữ khác', optDiff, '| chỉ có ở bản mới', only.length);
const curOnly = C.filter(c => !N.some(q => norm(q.question).slice(0, 60) === norm(c.question).slice(0, 60))); console.log('chỉ có ở bản hiện tại', curOnly.length);
fs.writeFileSync('D:/Downloads/SSG105 app/sources-private/cpv-compare-new.json', JSON.stringify({ diff, onlyNew: only.map(q => ({ id: q.id, slide: q.slide, q: q.question.slice(0, 90), ans: q.answer.map(i => q.options[i]) })), curOnly: curOnly.map(c => ({ id: c.id, slide: c.slide, q: c.question.slice(0, 90) })) }, null, 1));
diff.slice(0, 40).forEach(d => console.log('#' + d.idNew + '(cur ' + d.idCur + ') ' + d.q + '\n   MỚI: ' + JSON.stringify(d.newAns).slice(0, 80) + '\n   NAY: ' + JSON.stringify(d.curAns).slice(0, 80)));
