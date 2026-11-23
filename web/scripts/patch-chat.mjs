import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 60)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
patch('functions/api/[[path]].js', [
  [`import { handleDuel } from '../_duel.js';`, `import { handleDuel } from '../_duel.js';
import { handleChat } from '../_chat.js';`],
  [`    if (a === 'ai' && m === 'POST')`, `    if (a === 'chat') return handleChat(request, env, user, b, readJson);
    if (a === 'ai' && m === 'POST')`],
]);
patch('functions/_serve.js', [
  [`.replace(/<\\/body>/i, bar() + '</body>');`, `.replace(/<\\/body>/i, bar() + '<script src="/chat.js?v=1" defer></script></body>');`],
]);
patch('schema.sql', [[`-- Nhật ký hoạt động`, `-- Chat chung
CREATE TABLE IF NOT EXISTS chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_chat_ts ON chat_messages (ts);

-- Nhật ký hoạt động`]]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
fs.writeFileSync(W + 'migrate-chat.sql', `-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-chat.sql
CREATE TABLE IF NOT EXISTS chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_chat_ts ON chat_messages (ts);
`);
console.log('ok');
