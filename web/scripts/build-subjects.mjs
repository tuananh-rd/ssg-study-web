// Dựng HTML thống nhất cho DAP391m / AIL303m / CPV301 từ CÙNG giao diện với SSG105 (src/app.js + ai.js + style.css).
// Dữ liệu: bài học (data/lessons-*.json), bộ đề (DAP/AIL data.js, CPV OCR), câu hỏi lại lý thuyết (Antigravity viết, thiếu thì sinh tự động).
// node scripts/build-subjects.mjs  → data/app-<id>.html
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { genRecall } from '../../gen-recall.mjs';
import { applyFormulas } from './lesson-formulas.mjs';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), ROOT = path.resolve(W, '..');
const rd = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const COLORS = ['#3b5bdb', '#7048e8', '#d6336c', '#e8590c', '#0c8599', '#2f9e44', '#c2255c', '#f08c00', '#1971c2', '#6741d9'];
const loadQ = f => JSON.parse(rd(W, 'data', f).match(/window\.QUESTIONS\s*=\s*([\s\S]*?);\s*$/)[1]);

// ---------- CPV: gộp câu trùng, gắn ảnh slide cho câu có hình ----------
const cpvRaw = JSON.parse(rd(W, 'data', 'cpv-questions.json')), seen = new Map(), cpv = [], cpvSourceIds = new Map();
for (const q of cpvRaw) {
  const sig = (q.question + '||' + [...q.options].sort().join('|')).toLowerCase().replace(/\s+/g, ' ');
  if (seen.has(sig)) { const f = seen.get(sig); cpvSourceIds.set(String(q.id), f.id); if (!f.explanation && q.explanation) f.explanation = q.explanation; continue; }
  const o = { id: cpv.length + 1, slide: q.slide, topic: q.topic, section: q.section, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation || '' };
  if (q.figure) { const n = String(q.slide).padStart(3, '0'); if (fs.existsSync(path.join(W, 'data', 'cpv-img', n + '.png'))) o.img = `/api/img/cpv/${n}.png`; }
  seen.set(sig, o); cpv.push(o); cpvSourceIds.set(String(q.id), o.id);
}

// Các batch cũ dùng ID sau gộp trùng; cpv-901.json theo HANDOFF dùng ID bộ đề gốc.
// Chỉ ánh xạ batch sửa mới, giữ ID hiển thị để không làm lệch tiến độ đã lưu.
function cpvSourceOverrides(kind) {
  const file = path.join(ROOT, 'sources-private', kind + '-cpv', 'cpv-901.json');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(file, 'utf8'))).map(([id, value]) => {
    if (!cpvSourceIds.has(id)) throw new Error(`CPV override có ID nguồn không hợp lệ: ${id}`);
    return [cpvSourceIds.get(id), value];
  }));
}

const SUBJECTS = {
  dap391m: { file: 'dap', name: 'DAP391m', bank: () => loadQ('dap-data.js'), aiField: 'Data Science / phân tích dữ liệu (DAP391m: Pandas, Matplotlib, Seaborn, Dash, Folium, Watson, scikit-learn)',
    rename: { m3: 'Watson (đọc để biết)', m4: 'SpaceX · Tổng quan dự án', m5: 'SpaceX · GitHub và Watson Studio', m6: 'SpaceX · Thu thập dữ liệu' },
    topicMod: { 'Matplotlib & Seaborn': 'm2', 'Biểu đồ & trực quan hoá': 'm2', 'Folium & bản đồ': 'm2', 'Dash & Dashboard': 'm2', 'Watson Assistant & Chatbot': 'm3', 'IBM DB2 & SQL': 'm5', 'Thu thập dữ liệu (API, Web scraping)': 'm6' }, defMod: 'm1' },
  ail303m: { file: 'ail', name: 'AIL303m', bank: () => loadQ('ail-data.js'), aiField: 'Machine Learning (AIL303m: hồi quy, phân loại, SVM, cây quyết định, ensemble, clustering, đánh giá mô hình)', rename: {},
    topicMod: { 'Phân loại (Logistic…)': 'm2', 'Đánh giá mô hình (metrics)': 'm2', 'SVM': 'm2', 'KNN & Decision Tree': 'm3', 'Ensemble (RF, Bagging, Boosting)': 'm4', 'Dữ liệu mất cân bằng': 'm4', 'Clustering & khoảng cách': 'm4', 'Giảm chiều (PCA, MDS…)': 'm4' }, defMod: 'm1' },
  cpv301: { file: 'cpv', name: 'CPV301', bank: () => cpv, aiField: 'Computer Vision / xử lý ảnh (CPV301: histogram, lọc, Fourier, biên, SIFT, phân đoạn, RANSAC, homography, optical flow, nhận dạng)', rename: {},
    topicMod: { 'Màu sắc & histogram': 'm2', 'Lọc ảnh & tích chập': 'm2', 'Miền tần số & Fourier': 'm2', 'Biên & đặc trưng (edge, corner, SIFT…)': 'm3', 'Phân đoạn & phân cụm': 'm4', 'Biến đổi hình học & ghép ảnh': 'm5', 'Chuyển động & optical flow': 'm6', 'Nhận dạng & học máy': 'm7' }, defMod: 'm1' },
};

const style = rd(ROOT, 'src', 'style.css'), appJs = rd(ROOT, 'src', 'app.js').replace('/*@AI@*/', () => rd(ROOT, 'src', 'ai.js'));
const safe = s => s.replace(/<\/script/gi, '<\\/script');

// Đề kì trước (làm lại nguyên đề): web/data/<môn>-past.json → D.pastExams + D.past
function pastData(file) {
  const fp = path.join(W, 'data', `${file}-past.json`); if (!fs.existsSync(fp)) return { pastExams: [], past: [] };
  const d = JSON.parse(rd(fp)), ex = d.exams[0], pad = n => String(n).padStart(2, '0');
  const past = d.items.map(it => ({ id: `p-${ex.id}-${pad(it.no)}`, exam: ex.id, no: it.no, module: d.module, ref: it.ref, type: 'past', past: true, q: it.q, correct: it.options[it.answer], wrong: it.options.filter((_, i) => i !== it.answer), orig: it.options, explain: it.explain || '', unsure: false, en: null }));
  return { pastExams: d.exams, past };
}

// Chương lý thuyết "Tổng hợp theo bộ đề" của CPV301, sinh từ web/data/cpv-digest.json (chỉ có lý thuyết và câu ôn lý thuyết, không có câu trong bộ đề)
function digestModule(dg, idx) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const sections = []; let n = 0;
  for (const ch of dg.chapters) for (const s of ch.sections) {
    n++;
    let h = `<p class="muted">${esc(ch.title)}</p><ul>${s.pts.map(p => `<li>${md(p)}</li>`).join('')}</ul>`;
    if (s.tbl) h += `<table><thead><tr>${s.tbl.head.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${s.tbl.rows.map(r => `<tr>${r.map(x => `<td>${md(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    if (s.qs && s.qs.length) h += `<p class="small muted">Câu liên quan trong bộ đề: ${s.qs.join(', ')}</p>`;
    sections.push({ id: (idx + 1) + '.' + n, t: s.h, h });
  }
  return { id: 'm' + (idx + 1), short: 'C' + (idx + 1), title: 'Tổng hợp theo bộ đề', color: '#7c5cff', weight: 0, priority: 1, keyPoints: [], digest: true, sections };
}

for (const [id, S] of Object.entries(SUBJECTS)) {
  const L = JSON.parse(rd(W, 'data', `lessons-${S.file}.json`));
  { const r = applyFormulas(S.file, L.modules); console.log('  công thức ' + S.name + ':', r.n, r.miss.length ? 'LỆCH ' + r.miss.join(', ') : ''); }
  // câu bổ sung vào bộ đề (đề mới thêm sau): web/data/<môn>-extra.json, cùng định dạng với bộ đề
  const extraBank = fs.existsSync(path.join(W, 'data', `${S.file}-extra.json`)) ? JSON.parse(rd(W, 'data', `${S.file}-extra.json`)) : [];
  const bank = [...S.bank(), ...extraBank].map((q, i) => ({ id: q.id ?? i + 1, slide: q.slide, topic: q.topic, section: q.section || '', question: q.question, options: q.options, answer: q.answer, explanation: q.explanation || '', ...(q.img ? { img: q.img } : {}) }));
  { const dir = path.join(ROOT, 'sources-private', 'explain-out-' + S.file), ex = {}; let n = 0;
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(f => /^[a-z]+-\d+\.json$/.test(f) && !(S.file === 'cpv' && f === 'cpv-901.json'))) { try { Object.assign(ex, JSON.parse(rd(dir, f))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } }
    const overrides = S.file === 'cpv' ? cpvSourceOverrides('explain-out') : {};
    Object.assign(ex, overrides);
    for (const q of bank) if ((overrides[q.id] || !q.explanation) && ex[q.id]) { q.explanation = ex[q.id]; n++; }
    console.log('  lời giải soạn sẵn ' + S.name + ':', n + '/' + bank.length); }
  const topicMod = { ...S.topicMod }; for (const q of bank) if (!topicMod[q.topic]) topicMod[q.topic] = S.defMod;
  const perMod = {}; bank.forEach(q => perMod[topicMod[q.topic]] = (perMod[topicMod[q.topic]] || 0) + 1);
  const modules = L.modules.map((m, i) => ({ id: m.id, short: 'C' + (i + 1), title: S.rename[m.id] || m.title, color: COLORS[i % COLORS.length], weight: perMod[m.id] || 1, priority: 3, keyPoints: [], sections: m.sections }));
  if (fs.existsSync(path.join(W, 'data', `${S.file}-digest.json`))) modules.push(digestModule(JSON.parse(rd(W, 'data', `${S.file}-digest.json`)), modules.length));
  // câu hỏi lại lý thuyết: ưu tiên bản Antigravity viết tay, chương nào thiếu thì dùng bộ sinh tự động
  const recallDir = path.join(ROOT, 'sources-private', `recall-${S.file}`), manual = {};
  if (fs.existsSync(recallDir)) for (const f of fs.readdirSync(recallDir).filter(f => /^m\d+\.json$/.test(f))) { try { manual[f.replace('.json', '')] = JSON.parse(rd(recallDir, f)); } catch (e) { console.log('  ! bỏ qua', f, e.message); } }
  const auto = genRecall({ modules: modules.map(m => ({ ...m })) });
  const secOrder = modules.flatMap(m => m.sections.map(s => s.id)), valid = new Set(secOrder), recall = [], seenR = new Set(); let nManual = 0, nAuto = 0;
  for (const m of modules) {
    const src = manual[m.id] && manual[m.id].length ? manual[m.id].filter(x => valid.has(x.ref) && x.q && x.correct && Array.isArray(x.wrong) && x.wrong.length === 3 && new Set([x.correct, ...x.wrong]).size === 4).map(x => ({ ...x, kind: 'manual' })) : auto.filter(x => x.module === m.id);
    for (const s of m.sections) for (const x of src.filter(y => y.ref === s.id)) {
      const k = (x.q + '|' + x.correct).toLowerCase(); if (seenR.has(k)) continue; seenR.add(k);
      recall.push({ id: `r-${m.id}-${String(recall.filter(r => r.module === m.id).length + 1).padStart(3, '0')}`, module: m.id, ref: s.id, type: 'recall', kind: x.kind, q: x.q, correct: x.correct, wrong: x.wrong, explain: x.explain || `Theo §${s.id} ${s.t}.`, ...(x.tip ? { tip: x.tip } : {}) });
      x.kind === 'manual' ? nManual++ : nAuto++;
    }
  }
  const xl = {};
  { const rdd = (d, fn) => { const dir = path.join(ROOT, 'sources-private', d); if (!fs.existsSync(dir)) return; for (const f of fs.readdirSync(dir).filter(f => /^[a-z]+-\d+\.json$/.test(f) && !(d === 'translate-out-cpv' && f === 'cpv-901.json'))) { try { fn(JSON.parse(rd(dir, f))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } } };
    rdd('translate-out-' + S.file, o => { for (const [k, v] of Object.entries(o)) xl['b-' + k] = v; });
    if (S.file === 'cpv') for (const [k, v] of Object.entries(cpvSourceOverrides('translate-out'))) xl['b-' + k] = v;
    rdd('translate-recall-out-' + S.file, o => Object.assign(xl, o)); console.log('  bản dịch ' + S.name + ':', Object.keys(xl).length); }
  const subject = { id, name: S.name, title: 'Ôn thi cuối kỳ', aiField: S.aiField, key: `${id}_progress_v2`, peer: `${id}-duel-`, bankTitle: `Bộ đề ${S.name}`, slides: false };
  const data = `window.DATA=${JSON.stringify({ subject, modules, questions: [], past: pastData(S.file).past, pastExams: pastData(S.file).pastExams, glossary: [], quick: [], compares: [], keyq: [], recall, bank, topicMod, xl, confuse: fs.existsSync(path.join(W, 'data', `${S.file}-confuse.json`)) ? JSON.parse(rd(W, 'data', `${S.file}-confuse.json`)) : [] })};`;
  const html = `<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${S.name} · Ôn thi cuối kỳ</title>\n<style>\n${style}\n</style></head><body>\n<noscript>App cần bật JavaScript.</noscript>\n<script id="data">\n${safe(data)}\n</script>\n<script id="app">\n${safe(appJs)}\n</script>\n</body></html>`;
  fs.writeFileSync(path.join(W, 'data', `app-${id}.html`), html);
  const multi = bank.filter(q => q.answer.length > 1).length;
  console.log(`${S.name}: ${modules.length} chương/${secOrder.length} mục | bộ đề ${bank.length} câu (${multi} nhiều đáp án) | câu hỏi lại ${recall.length} (Antigravity ${nManual}, tự sinh ${nAuto}) | ${(html.length / 1024).toFixed(0)} KB`);
}
