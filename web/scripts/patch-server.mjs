import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function patch(file, R) {
  const f = path.join(W, file); let c = fs.readFileSync(f, 'utf8'), miss = 0;
  for (const [a, b] of R) { if (!c.includes(a)) { console.log('MISSING in', file, ':', a.slice(0, 90)); miss++; continue; } c = c.replace(a, () => b); }
  fs.writeFileSync(f, c); console.log(file, R.length - miss + '/' + R.length);
}
// ---- _lib.js: khoá tiến độ thống nhất cho mọi môn, bỏ cờ theory ----
patch('functions/_lib.js', [
  [`key: 'dap391m-progress-v1', color: '#0c8599', theory: true`, `key: 'dap391m_progress_v2', color: '#0c8599'`],
  [`key: 'ail303m-progress-v1', color: '#7048e8', theory: true`, `key: 'ail303m_progress_v2', color: '#7048e8'`],
  [`key: 'cpv301-progress-v1', color: '#e8590c', theory: true`, `key: 'cpv301_progress_v2', color: '#e8590c'`],
  [`key: 'ssg105_progress_v2', color: '#3b5bdb', theory: false`, `key: 'ssg105_progress_v2', color: '#3b5bdb'`],
]);
patch('functions/api/[[path]].js', [
  [`color: x.color, theory: x.theory }; })`, `color: x.color }; })`],
]);
// ---- schema: bảng đếm lượt dùng AI ----
fs.appendFileSync(path.join(W, 'schema.sql'), `
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  chat INTEGER NOT NULL DEFAULT 0,
  tr INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
`);
console.log('schema.sql: +ai_usage');
