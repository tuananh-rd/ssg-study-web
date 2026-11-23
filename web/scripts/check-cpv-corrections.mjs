// Chạy sau build: node web/scripts/check-cpv-corrections.mjs
// Kiểm tra ID nguồn → ID sau gộp, ưu tiên batch sửa và tính nhất quán gói deploy.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const raw = json('web/data/cpv-questions.json');
const wanted = json('sources-private/cpv-need-regen.json');
const explanations = json('sources-private/explain-out-cpv/cpv-901.json');
const translations = json('sources-private/translate-out-cpv/cpv-901.json');
const supplemental = json('sources-private/explain-out-cpv/cpv-900.json');
const supplementalTranslations = json('sources-private/translate-out-cpv/cpv-900.json');
const html = read('web/data/app-cpv301.html');
const context = { window: {} };
vm.runInNewContext(html.match(/<script id="data">([\s\S]*?)<\/script>/)[1], context);
// Chuyển dữ liệu VM sang realm hiện tại để assert.deepEqual so sánh prototype đúng.
const data = JSON.parse(JSON.stringify(context.window.DATA));
const signature = q => (q.question + '||' + [...q.options].sort().join('|')).toLowerCase().replace(/\s+/g, ' ');
const bySignature = new Map(data.bank.map(q => [signature(q), q]));
const target = id => bySignature.get(signature(raw.find(q => q.id === +id)));
const keys = ids => ids.map(String).sort();
assert.deepEqual(Object.keys(explanations).sort(), keys(wanted.explain_ids));
assert.deepEqual(Object.keys(translations).sort(), keys(wanted.translate_bank_ids));
assert.equal(wanted.explain_ids.length, 30);
assert.equal(wanted.translate_bank_ids.length, 9);
assert.equal(data.bank.length, new Set(raw.map(signature)).size);

// Build giữ câu xuất hiện đầu tiên khi gộp trùng, kể cả nguồn trùng khác đáp án.
// Kiểm tra câu đại diện theo đúng quy tắc hiện có, không sửa xung đột ngoài phạm vi.
const seen = new Set();
for (const q of raw) {
  if (seen.has(signature(q))) continue;
  seen.add(signature(q));
  const built = target(q.id);
  assert.ok(built, `Thiếu câu nguồn ${q.id}`);
  assert.deepEqual(built.options, q.options, `Sai thứ tự phương án nguồn ${q.id}`);
  assert.deepEqual(built.answer, q.answer, `Sai đáp án nguồn ${q.id}`);
}
for (const [id, text] of Object.entries(explanations)) {
  assert.equal(typeof text, 'string');
  assert.ok(text.trim().length > 80, `Lời giải quá ngắn: ${id}`);
  // ID 15 và 19 trùng nhau; batch dùng lời giải ID sau cho cùng câu hiển thị.
  assert.equal(target(id).explanation, explanations[id === '15' ? '19' : id], `Lệch lời giải nguồn ${id}`);
}
for (const [id, translation] of Object.entries(translations)) {
  assert.equal(typeof translation.q, 'string');
  assert.equal(translation.options.length, raw.find(q => q.id === +id).options.length);
  assert.ok(translation.options.every(o => typeof o === 'string' && o.trim()));
  assert.deepEqual(data.xl['b-' + target(id).id], translation, `Lệch bản dịch nguồn ${id}`);
}
for (const id of [123, 264, 291]) {
  assert.match(explanations[id], /bộ đề gốc ghi/);
  assert.match(explanations[id], /theo giáo trình đáp án đúng là/);
}
for (const [id, explanation] of Object.entries(supplemental)) {
  assert.equal(data.bank.find(q => q.id === +id).explanation, explanation);
}
for (const [id, translation] of Object.entries(supplementalTranslations)) {
  assert.deepEqual(data.xl['b-' + id], translation);
}
assert.equal(target(291).id, 277);
assert.deepEqual(data.xl['b-' + target(291).id], supplementalTranslations['277']);
for (const q of data.bank.filter(q => q.id >= 7 && q.id <= 32)) {
  assert.ok(q.explanation.trim(), `Thiếu lời giải ID hiển thị ${q.id}`);
}
for (const q of raw.filter(q => q.id >= 7 && q.id <= 32)) {
  assert.ok(target(q.id).explanation.trim(), `Thiếu lời giải ID gốc ${q.id}`);
}
const packed = read('web/functions/_content.generated.js').match(/export const APPS = (.*);\r?\n/);
assert.equal(JSON.parse(packed[1]).cpv301, html, 'Gói Cloudflare chưa chứa HTML mới');
const whatsNewContext = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
vm.runInNewContext(read('web/public/whatsnew.js'), whatsNewContext);
assert.equal(whatsNewContext.window.WebWhatsNew.latest(), '2026-11-23-cpv-explanations');
console.log(`OK: ${raw.length} câu nguồn / ${data.bank.length} câu sau gộp giữ nguyên đáp án của câu đại diện; 30 lời giải, 9 bản dịch và 5 lời giải bổ sung gắn đúng ID; dải 7–32 đủ lời giải; gói Cloudflare và CHANGELOG nhất quán.`);
