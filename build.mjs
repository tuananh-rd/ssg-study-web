// Build ssg105.html (single offline file) + validate the content bank.
// Usage: node build.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import { genRecall } from './gen-recall.mjs';
const r = f => fs.readFileSync(new URL('./src/' + f, import.meta.url), 'utf8');
let dataSrc = 'window.DATA={};\n' + ['data-lessons.js', 'data-questions.js', 'data-questions-en.js', 'data-past.js', 'data-misc.js', 'data-recall.js', 'data-bank.js', 'data-key.js'].map(r).join('\n');

// ---- validate ----
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(dataSrc.replace(/^window\.DATA=\{\};/, 'window.DATA={};var DATA=window.DATA;'), ctx);
const D = ctx.window.DATA, errs = [], mods = new Set(D.modules.map(m => m.id));
const sections = new Set(D.modules.flatMap(m => m.sections.map(s => s.id)));
const seenQ = new Set(), seenId = new Set();
for (const q of D.questions) {
  if (seenId.has(q.id)) errs.push('dup id ' + q.id); seenId.add(q.id);
  if (!mods.has(q.module)) errs.push(q.id + ' bad module');
  if (!q.q || !q.correct || !q.explain) errs.push(q.id + ' missing field');
  if (!Array.isArray(q.wrong) || q.wrong.length !== 3) errs.push(q.id + ' needs 3 wrong');
  if (new Set([q.correct, ...q.wrong]).size !== 4) errs.push(q.id + ' duplicate options');
  if (!sections.has(q.ref)) errs.push(q.id + ' bad ref ' + q.ref);
  if ('m' + q.ref.split('.')[0] !== q.module) errs.push(q.id + ' ref/module mismatch');
  if (/tất cả đều đúng|cả a và b/i.test([q.correct, ...q.wrong].join('|'))) errs.push(q.id + ' forbidden option');
  const k = q.q.trim().toLowerCase(); if (seenQ.has(k)) errs.push('duplicate question: ' + q.q); seenQ.add(k);
}
for (const c of D.compares) if (!sections.has(c.ref)) errs.push(c.a + ' compare bad ref');
for (const x of D.quick) if (!sections.has(x[1])) errs.push('quick bad ref ' + x[1]);
const target = { m2: 28, m3: 26, m4: 18, m5: 32, m6: 30, m7: 18, m8: 22, m9: 28, m10: 26, m11: 8 };
const per = {}; D.questions.forEach(q => per[q.module] = (per[q.module] || 0) + 1);
for (const k in target) if (per[k] !== target[k]) errs.push(`${k}: ${per[k]} questions, plan says ${target[k]}`);
// English versions: one per question, 1 correct + 3 distinct wrong
for (const m in D._enCount) if (D._enCount[m].length !== per[m]) errs.push(`${m}: ${D._enCount[m].length} English rows vs ${per[m]} questions`);
for (const q of D.questions) {
  if (!q.en) { errs.push(q.id + ' missing English'); continue; }
  if (q.en.wrong.length !== 3 || new Set([q.en.correct, ...q.en.wrong]).size !== 4) errs.push(q.id + ' bad English options');
}
// past exams
for (const e of D.pastExams) { const n = D.past.filter(q => q.exam === e.id).length; if (n !== e.n) errs.push(`${e.id}: ${n} questions, expected ${e.n}`); }
for (const q of D.past) {
  if (!mods.has(q.module) || !sections.has(q.ref)) errs.push(q.id + ' bad module/ref');
  if (new Set(q.orig).size !== q.orig.length || q.orig.length < 4) errs.push(q.id + ' bad options');
}
console.log('past:', D.past.length, 'unsure:', D.past.filter(q => q.unsure).map(q => q.id).join(', '), '| glossary:', D.glossary.length);
// alignment spot-check: first question of each module VI vs EN
for (const m of D.modules) { const q = D.questions.find(x => x.module === m.id); if (!q) continue; console.log(`  ${q.id}: ${q.correct}  <->  ${q.en.correct}`); }
const types = {}; D.questions.forEach(q => types[q.type] = (types[q.type] || 0) + 1);
console.log('questions:', D.questions.length, types);
console.log('quick:', D.quick.length, '| compares:', D.compares.length);
// ---- bộ đề SSG105 ----
for (const b of D.bank) {
  if (!b.question || !Array.isArray(b.options) || b.options.length < 2) errs.push('bank #' + b.id + ' thiếu câu hỏi / đáp án');
  if (!b.answer.length || b.answer.some(i => i < 0 || i >= b.options.length)) errs.push('bank #' + b.id + ' đáp án ngoài phạm vi');
  if (new Set(b.options).size !== b.options.length) errs.push('bank #' + b.id + ' đáp án trùng nhau');
}
console.log('bank:', D.bank.length, 'câu | chọn nhiều đáp án:', D.bank.filter(b => b.answer.length > 1).length);
// ---- kiến thức key (viết tay) ----
{ const seen = new Set(), perK = {};
  for (const k of D.keyq) {
    if (!sections.has(k.ref)) errs.push('key bad ref ' + k.ref + ': ' + k.q);
    if (!k.q || !k.correct || !k.explain) errs.push('key missing field: ' + k.q);
    if (!Array.isArray(k.wrong) || k.wrong.length !== 3 || new Set([k.correct, ...k.wrong]).size !== 4) errs.push('key needs 3 distinct wrong: ' + k.q);
    const t = k.q.trim().toLowerCase(); if (seen.has(t)) errs.push('key duplicate: ' + k.q); seen.add(t);
    const m = 'm' + k.ref.split('.')[0]; perK[m] = (perK[m] || 0) + 1;
    const lens = [k.correct, ...k.wrong].map(s => s.length), longest = Math.max(...lens);
    if (k.correct.length === longest && k.correct.length > 1.6 * Math.max(...k.wrong.map(s => s.length))) console.log('  (lưu ý) đáp án đúng dài hơn hẳn:', k.q);
  }
  console.log('key:', D.keyq.length, perK);
}
// ---- câu hỏi lại lý thuyết: sinh tự động từ bài học + viết tay, sắp theo thứ tự mục ----
const secOrder = D.modules.filter(m => !m.noQuiz).flatMap(m => m.sections.map(s => s.id));
const gen = genRecall(D);
const recall = [], seenR = new Set();
for (const s of secOrder) {
  const manual = D.recallManual.filter(x => x.ref === s).map(x => ({ ...x, kind: 'manual' }));
  for (const x of gen.filter(g => g.ref === s).concat(manual)) {
    const k = (x.q + '|' + x.correct).trim().toLowerCase(); if (seenR.has(k)) continue; seenR.add(k);
    const m = 'm' + s.split('.')[0], n = recall.filter(y => y.module === m).length + 1;
    if (!Array.isArray(x.wrong) || x.wrong.length !== 3 || new Set([x.correct, ...x.wrong]).size !== 4) errs.push(`recall §${s} bad options: ${x.q}`);
    recall.push({ id: `r-${m}-${String(n).padStart(3, '0')}`, module: m, ref: s, type: 'recall', kind: x.kind, q: x.q, correct: x.correct, wrong: x.wrong,
      explain: x.explain || `Theo §${s} ${D.modules.find(mm => mm.id === m).sections.find(ss => ss.id === s).t}.` });
  }
}
for (const x of D.recallManual) if (!sections.has(x.ref)) errs.push('recall bad ref ' + x.ref + ': ' + x.q);
const perSec = {}; recall.forEach(q => perSec[q.ref] = (perSec[q.ref] || 0) + 1);
const thin = secOrder.filter(s => (perSec[s] || 0) < 3);
console.log('recall:', recall.length, '(auto', gen.length + ', manual', D.recallManual.length + ')', thin.length ? '| mục < 3 câu: ' + thin.join(' ') : '| mục nào cũng ≥ 3 câu');
{ const dir = new URL('./sources-private/explain-out-ssg/', import.meta.url), ex = {};
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(f => /^ssg-\d+\.json$/.test(f))) { try { Object.assign(ex, JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } }
  dataSrc += '\n(function(){var E=' + JSON.stringify(ex) + ';DATA.bank.forEach(function(b){if(!b.explanation&&E[b.id])b.explanation=E[b.id];});})();'; console.log('lời giải soạn sẵn SSG105:', Object.keys(ex).length); }
{ const xl = {}, base = new URL('./sources-private/', import.meta.url);
  const load = (d, fn) => { const dir = new URL(d + '/', base); if (!fs.existsSync(dir)) return; for (const f of fs.readdirSync(dir).filter(f => /^[a-z]+-\d+\.json$/.test(f))) { try { fn(JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } } };
  load('translate-out-ssg', o => { for (const [k, v] of Object.entries(o)) xl['b-' + k] = v; });
  load('translate-recall-out-ssg', o => Object.assign(xl, o));
  dataSrc += '\nDATA.xl=' + JSON.stringify(xl) + ';'; console.log('bản dịch SSG105:', Object.keys(xl).length); }
dataSrc += '\nDATA.recall=' + JSON.stringify(recall) + ';\ndelete DATA.recallManual;';
if (errs.length) { console.error('DATA ERRORS:\n' + errs.join('\n')); process.exit(1); }

// ---- build ----
const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SSG105 · Ôn thi cuối kỳ</title>
<style>
${r('style.css')}
</style></head><body>
<noscript>App cần bật JavaScript.</noscript>
<script id="data">
${dataSrc}
</script>
<script id="app">
${r('app.js').replace('/*@AI@*/', () => r('ai.js'))}
</script>
</body></html>`;
fs.writeFileSync(new URL('./ssg105.html', import.meta.url), html);
console.log('built ssg105.html', (html.length / 1024).toFixed(0) + ' KB');
