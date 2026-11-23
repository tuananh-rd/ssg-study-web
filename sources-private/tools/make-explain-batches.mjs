// Tạo các lô câu hỏi chưa có lời giải cho Antigravity soạn sẵn. node tools/make-explain-batches.mjs
import fs from 'node:fs'; import vm from 'node:vm';
const R = 'D:/Downloads/SSG105 app/', SP = R + 'sources-private/', N = 25;
const loadQ = f => JSON.parse(fs.readFileSync(R + 'web/data/' + f, 'utf8').match(/window\.QUESTIONS\s*=\s*([\s\S]*?);\s*$/)[1]);
// SSG105 bank
const files = ['data-lessons.js', 'data-questions.js', 'data-questions-en.js', 'data-past.js', 'data-misc.js', 'data-recall.js', 'data-bank.js', 'data-key.js'];
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext('window.DATA={};var DATA=window.DATA;\n' + files.map(f => fs.readFileSync(R + 'src/' + f, 'utf8')).join('\n'), ctx);
const ssg = ctx.window.DATA.bank;
// CPV (gộp trùng giống build-subjects)
const cpvRaw = JSON.parse(fs.readFileSync(R + 'web/data/cpv-questions.json', 'utf8')), seen = new Map(), cpv = [];
for (const q of cpvRaw) { const sig = (q.question + '||' + [...q.options].sort().join('|')).toLowerCase().replace(/\s+/g, ' '); if (seen.has(sig)) continue; const o = { id: cpv.length + 1, slide: q.slide, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation || '', figure: q.figure }; seen.set(sig, o); cpv.push(o); }
const sets = { ssg: ssg, dap: loadQ('dap-data.js'), ail: loadQ('ail-data.js'), cpv };
for (const [k, bank] of Object.entries(sets)) {
  const todo = bank.filter(q => !q.explanation).map(q => {
    const o = { id: q.id, question: q.question, options: q.options, correct: q.answer.map(i => q.options[i]) };
    if (k === 'cpv' && q.slide) { const n = String(q.slide).padStart(3, '0'); o.slide_image = `cpv-slides-real/slide-${n}.png`; }
    return o;
  });
  fs.rmSync(SP + 'explain-in-' + k, { recursive: true, force: true }); fs.mkdirSync(SP + 'explain-in-' + k, { recursive: true }); fs.mkdirSync(SP + 'explain-out-' + k, { recursive: true });
  for (let i = 0; i * N < todo.length; i++) fs.writeFileSync(SP + `explain-in-${k}/${k}-${String(i + 1).padStart(2, '0')}.json`, JSON.stringify(todo.slice(i * N, (i + 1) * N), null, 1));
  console.log(k, 'tổng', bank.length, 'cần soạn', todo.length, 'lô', Math.ceil(todo.length / N));
}
