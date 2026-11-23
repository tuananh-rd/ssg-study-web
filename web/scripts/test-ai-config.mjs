// Thử từng cấu hình chatbot trong file (chỉ in kết quả, KHÔNG in key). node scripts/test-ai-config.mjs <file1> <file2> ...
import fs from 'node:fs';
const parse = f => { const o = {}; for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) { let m; if ((m = l.match(/^\s*Base URL:\s*(.+?)\s*$/))) o.base = m[1]; else if ((m = l.match(/^\s*API key:\s*(.+?)\s*$/))) o.key = m[1]; else if ((m = l.match(/^\s*Model:\s*(.+?)\s*$/))) o.model = m[1]; } return o; };
for (const f of process.argv.slice(2)) {
  const c = parse(f), t0 = Date.now();
  try {
    const r = await fetch(c.base.replace(/\/+$/, '') + '/chat/completions', { method: 'POST', signal: AbortSignal.timeout(40000),
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + c.key },
      body: JSON.stringify({ model: c.model, max_tokens: 60, stream: false, messages: [{ role: 'user', content: 'Trả lời đúng một câu ngắn bằng tiếng Việt: SIFT là gì?' }] }) });
    const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch { }
    const msg = j?.choices?.[0]?.message; const text = (msg?.content || msg?.reasoning || '').replace(/\s+/g, ' ').slice(0, 140);
    console.log(`${c.base} | ${c.model} → HTTP ${r.status} ${Date.now() - t0}ms | ${r.ok ? (text || 'trống: ' + t.slice(0, 120)) : (j?.error?.message || t.slice(0, 160))}`);
  } catch (e) { console.log(`${c.base} | ${c.model} → LỖI ${e.name}: ${e.message}`); }
}
