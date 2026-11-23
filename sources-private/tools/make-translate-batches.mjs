// Tạo các lô dịch cho Antigravity. Đọc dữ liệu từ các file HTML đã dựng.
import fs from 'node:fs'; import vm from 'node:vm';
const R = 'D:/Downloads/SSG105 app/', SP = R + 'sources-private/';
const files = { ssg: R + 'ssg105.html', dap: R + 'web/data/app-dap391m.html', ail: R + 'web/data/app-ail303m.html', cpv: R + 'web/data/app-cpv301.html' };
const N_BANK = 20, N_REC = 25;
function loadData(f) {
  const h = fs.readFileSync(f, 'utf8'); let found = null;
  { const a0 = h.indexOf('<script id="data">') + 18, a1 = h.indexOf('</script>', a0); found = h.slice(a0, a1); }
  const ctx = { window: {}, console }; vm.createContext(ctx);
  const cut = found.indexOf('window.DATA='); let code = found.slice(cut);
  // chỉ chạy phần dữ liệu: dừng ở dấu hiệu bắt đầu mã ứng dụng
  vm.runInContext(code.replace(/^window\.DATA=\{\};/, 'window.DATA={};var DATA=window.DATA;'), ctx);
  return ctx.window.DATA;
}
const w = (dir, name, obj) => { fs.mkdirSync(SP + dir, { recursive: true }); fs.writeFileSync(SP + dir + '/' + name, JSON.stringify(obj, null, 1)); };
for (const [k, f] of Object.entries(files)) {
  const D = loadData(f);
  for (const d of ['translate-in-' + k, 'translate-recall-in-' + k]) fs.rmSync(SP + d, { recursive: true, force: true });
  fs.mkdirSync(SP + 'translate-out-' + k, { recursive: true }); fs.mkdirSync(SP + 'translate-recall-out-' + k, { recursive: true });
  const bank = D.bank.map(b => ({ id: b.id, question: b.question, options: b.options }));
  for (let i = 0; i * N_BANK < bank.length; i++) w('translate-in-' + k, `${k}-${String(i + 1).padStart(2, '0')}.json`, bank.slice(i * N_BANK, (i + 1) * N_BANK));
  const rec = (D.recall || []).map(r => ({ id: r.id, q: r.q, correct: r.correct, wrong: r.wrong }));
  const key = (D.keyq || []).map((x, i) => ({ id: 'k-' + String(i + 1).padStart(3, '0'), q: x.q, correct: x.correct, wrong: x.wrong }));
  const all = rec.concat(key);
  for (let i = 0; i * N_REC < all.length; i++) w('translate-recall-in-' + k, `${k}-${String(i + 1).padStart(2, '0')}.json`, all.slice(i * N_REC, (i + 1) * N_REC));
  console.log(k, 'bộ đề', bank.length, 'lô', Math.ceil(bank.length / N_BANK), '| ôn lý thuyết+key', all.length, 'lô', Math.ceil(all.length / N_REC));
}
