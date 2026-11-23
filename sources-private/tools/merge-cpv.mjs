// Gộp ocr-batch/*.json → cpv-questions.json, chuẩn hoá tên trường, đối chiếu đáp án với chữ ẩn trên slide.
import fs from 'node:fs'; import path from 'node:path';
const DIR = process.argv[2];
const text = JSON.parse(fs.readFileSync(path.join(DIR, 'cpv-slide-text.json'), 'utf8'));
const raw = [];
// Số slide trong batch-01..16 là số ảnh lúc chụp (bị lệch): nhãn ≤48 → thật = nhãn; 49..56 bỏ; 57..325 → thật = nhãn+2; 326,327 bỏ (trùng).
// batch-fix-* đã dùng số slide thật.
const toReal = s => s <= 48 ? s : (s >= 57 && s <= 325 ? s + 2 : null);
for (const f of fs.readdirSync(path.join(DIR, 'ocr-batch')).sort()) {
  const arr = JSON.parse(fs.readFileSync(path.join(DIR, 'ocr-batch', f), 'utf8'));
  for (const r of arr) {
    const s = r.slide ?? r.slide_number;
    if (f.startsWith('batch-fix')) { raw.push({ ...r, slide: s }); continue; }
    const real = toReal(s); if (real == null) continue;
    raw.push({ ...r, slide: real, slide_number: undefined, image_url: undefined });
  }
}
const letters = s => { const m = String(s || '').trim().match(/^([A-F]{1,5})\b/); return m ? [...m[1]].map(c => c.charCodeAt(0) - 65) : null; };
const out = [], issues = [];
for (const r of raw) {
  const slide = r.slide ?? r.slide_number;
  let ans = r.answer ?? r.correct_answers ?? [];
  const hint = letters(text[slide]);              // đáp án theo chữ ẩn của slide
  const q = {
    slide, topic: r.topic || 'Khác', section: r.section || 'Câu ngắn', question: String(r.question || '').trim(),
    options: (r.options || []).map(o => String(o).trim()), answer: ans, multi: false,
    explanation: (r.explanation || '').trim(), figure: !!(r.figure || (r.image_url && /Hình ảnh|biểu đồ/i.test(r.section || ''))), needs_review: !!r.needs_review, review_note: r.review_note || ''
  };
  if (hint && hint.every(i => i < q.options.length)) {
    if (JSON.stringify([...ans].sort()) !== JSON.stringify([...hint].sort())) { issues.push(`slide ${slide}: OCR answer ${JSON.stringify(ans)} ≠ slide text ${JSON.stringify(hint)} → dùng chữ trên slide`); q.answer = hint; }
  } else if (!ans.length) { q.needs_review = true; q.review_note = (q.review_note + ' không có đáp án').trim(); }
  q.multi = q.answer.length > 1 || /\((choose|select|\d) ?(2|3|two|three|all)?[^)]*(option|answer)s?\)/i.test(q.question);
  if (q.options.length < 2) { q.needs_review = true; q.review_note = (q.review_note + ' <2 phương án').trim(); }
  out.push(q);
}
out.sort((a, b) => a.slide - b.slide);
const seen = new Set(); const dedup = out.filter(q => { const k = q.slide; if (seen.has(k)) { issues.push('dup slide ' + k); return false; } seen.add(k); return true; });
dedup.forEach((q, i) => q.id = i + 1);
fs.writeFileSync(path.join(DIR, 'cpv-questions.json'), JSON.stringify(dedup, null, 1));
fs.writeFileSync(path.join(DIR, 'cpv-merge-issues.txt'), issues.join('\n'));
const tp = {}; dedup.forEach(q => tp[q.topic] = (tp[q.topic] || 0) + 1);
console.log('questions', dedup.length, '| slides', dedup[0].slide + '..' + dedup.at(-1).slide, '| corrected by slide text', issues.filter(x => x.includes('slide text')).length,
  '| review', dedup.filter(q => q.needs_review).length, '| no answer', dedup.filter(q => !q.answer.length).length, '| multi', dedup.filter(q => q.multi).length, '| figure', dedup.filter(q => q.figure).length);
console.log(tp);
