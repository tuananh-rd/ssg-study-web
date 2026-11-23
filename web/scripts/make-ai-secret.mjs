// In JSON cấu hình chatbot ra stdout (dùng để pipe vào `wrangler pages secret put AI_CONFIGS`). Thứ tự file = thứ tự ưu tiên.
// node scripts/make-ai-secret.mjs "<file chính>" "<file dự phòng>" ...   — KHÔNG in key ra màn hình khi pipe.
import fs from 'node:fs';
const parse = f => { const o = {}; for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) { let m; if ((m = l.match(/^\s*Base URL:\s*(.+?)\s*$/))) o.base = m[1]; else if ((m = l.match(/^\s*API key:\s*(.+?)\s*$/))) o.key = m[1]; else if ((m = l.match(/^\s*Model:\s*(.+?)\s*$/))) o.model = m[1]; } return o; };
const names = ['apithat', 'openrouter', 'cfg3', 'cfg4'];
const arr = process.argv.slice(2).map((f, i) => ({ name: names[i], ...parse(f) }));
if (arr.some(c => !c.base || !c.key || !c.model)) { console.error('Thiếu Base URL / API key / Model trong một file'); process.exit(1); }
process.stdout.write(JSON.stringify(arr));
