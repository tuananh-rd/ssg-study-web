// Gộp kết quả đối chiếu: so với bộ đề hiện tại, báo cáo (mặc định) hoặc ghi (--write) đáp án đã sửa.
const fs = require('fs');
const SP = 'D:/Downloads/SSG105 app/sources-private/', WEB = 'D:/Downloads/SSG105 app/web/data/cpv-questions.json';
const write = process.argv.includes('--write');
const bank = JSON.parse(fs.readFileSync(WEB, 'utf8'));
const byId = new Map(bank.map(q => [q.id, q]));
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
let recs = []; for (let i = 1; i <= 20; i++) recs = recs.concat(JSON.parse(fs.readFileSync(SP + 'cpv-verify-out/batch-' + String(i).padStart(2, '0') + '.json', 'utf8')));
const inn = []; for (let i = 1; i <= 20; i++) inn.push(...JSON.parse(fs.readFileSync(SP + 'cpv-verify-in/batch-' + String(i).padStart(2, '0') + '.json', 'utf8')));
console.log('bản ghi', recs.length, 'input', inn.length, 'ids bank', bank.length);
const st = {}; recs.forEach(r => st[r.status] = (st[r.status] || 0) + 1); console.log('trạng thái', JSON.stringify(st));
const changed = [], orderDiff = [], textDiff = [], newQ = [], seen = new Map(), dupIds = [];
for (const r of recs) {
  if (r.status === 'skip') continue;
  if (r.id == null) { newQ.push(r); continue; }
  const q = byId.get(r.id); if (!q) { console.log('id không có trong bank', r.id, 'slide', r.png_no); continue; }
  if (seen.has(r.id)) dupIds.push([r.id, seen.get(r.id), r.png_no]); seen.set(r.id, r.png_no);
  // đổi chỉ số đáp án theo thứ tự phương án CŨ của bank (giữ nguyên bản dịch/giải thích theo vị trí)
  const imgOpts = r.options.map(norm), oldOpts = q.options.map(norm);
  const map = imgOpts.map(o => oldOpts.indexOf(o));
  let ans;
  if (map.every(x => x >= 0) && new Set(map).size === map.length && r.options.length === q.options.length) ans = r.answer.map(i => map[i]);
  else { textDiff.push({ id: r.id, png: r.png_no, old: q.options, img: r.options, ans: r.answer }); ans = r.answer; }
  if (map.some((x, i) => x !== i) && map.every(x => x >= 0)) orderDiff.push(r.id);
  const a0 = [...q.answer].sort().join(), a1 = [...ans].sort().join();
  if (a0 !== a1) changed.push({ id: r.id, png: r.png_no, old: q.answer, now: ans, st: r.status, note: r.note || '', q: q.question.slice(0, 60) });
  r._ans = ans; r._q = q;
}
console.log('đổi đáp án:', changed.length, '| đổi thứ tự phương án:', orderDiff.length, '| phương án khác chữ so với bank:', textDiff.length, '| câu mới (id null):', newQ.length, '| trùng id:', JSON.stringify(dupIds));
fs.writeFileSync(SP + 'cpv-merge-report.json', JSON.stringify({ changed, textDiff, newQ, dupIds, conflicts: recs.filter(r => r.status === 'conflict' || r.status === 'unsure').map(r => ({ png: r.png_no, id: r.id, st: r.status, ans: r.answer, suggest: r.suggest, note: r.note })) }, null, 1));
console.log('ví dụ đổi:', JSON.stringify(changed.slice(0, 8)));
const ids = new Set(recs.filter(r => r.id != null).map(r => r.id)); console.log('id bank không có slide:', bank.filter(q => !ids.has(q.id)).map(q => q.id).join(','));

// ===== Ghi dữ liệu (--write) =====
if (write) {
  const DECIDE = { 123: [0], 264: [2], 291: [1] };   // 3 câu nguồn ghi sai/trống: dùng đáp án đúng theo kiến thức (xem ghi chú trong báo cáo)
  const TEXT_FIX = new Set([277, 278, 279, 280, 281, 282, 283, 284, 285]);  // ảnh khác chữ so với OCR cũ: lấy chữ theo ảnh
  const touched = new Set();
  for (const r of recs) {
    if (r.status === 'skip' || r.id == null || !r._q) continue; const q = r._q; let ans = DECIDE[r.id] || r._ans;
    if (r.id === 291 && !ans.length) ans = [1];
    if (TEXT_FIX.has(r.id) && r.options.length === q.options.length) { q.question = r.question; q.options = r.options.slice(); ans = DECIDE[r.id] || r.answer; touched.add(r.id); }
    const a0 = [...q.answer].sort().join(), a1 = [...ans].sort().join();
    if (a0 !== a1 || DECIDE[r.id]) { q.answer = ans; q.multi = ans.length > 1; q.explanation = r.hidden_expl && a0 !== a1 ? r.hidden_expl : ''; touched.add(r.id); q.needs_review = false; }
  }
  fs.writeFileSync(WEB, JSON.stringify(bank));
  // xoá lời giải soạn sẵn cũ của các câu đã đổi (đang mô tả đáp án sai) để viết lại
  const dir = SP + 'explain-out-cpv/'; let removed = 0;
  for (const f of fs.readdirSync(dir).filter(f => /\.json$/.test(f))) { const o = JSON.parse(fs.readFileSync(dir + f, 'utf8')); let ch = false; for (const id of touched) if (o[id] != null) { delete o[id]; ch = true; removed++; } if (ch) fs.writeFileSync(dir + f, JSON.stringify(o)); }
  fs.writeFileSync(SP + 'cpv-need-regen.json', JSON.stringify({ explain_ids: [...touched].sort((a, b) => a - b), translate_bank_ids: [...TEXT_FIX].sort((a, b) => a - b) }, null, 1));
  console.log('ĐÃ GHI. câu bị đụng:', touched.size, '| lời giải cũ đã xoá:', removed, '→ cpv-need-regen.json');
}
