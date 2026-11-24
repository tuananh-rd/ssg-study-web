// Bù điểm cho những gì người dùng đã làm TRƯỚC khi có nhật ký, dựa trên tiến độ đã lưu (bảng progress).
//   - số lần trả lời / trả lời đúng: lấy từ answers[*].seen/correct, trừ phần đã có điểm từ nhật ký
//   - bài lý thuyết đã đọc: ước lượng 3 phút mỗi bài (đọc đủ = +6 điểm)
// Điểm bù được ghi vào ngày 2026-10-01 (chỉ tính ở tab "Tất cả"). Chạy lại nhiều lần vẫn cho cùng kết quả.
// Dùng: node scripts/backfill-progress.mjs          (in ra, không ghi)
//       node scripts/backfill-progress.mjs --apply  (ghi lên D1 thật)
import { execFileSync } from 'node:child_process'; import fs from 'node:fs';
const WR = 'node_modules/wrangler/bin/wrangler.js';
const DAY = '2026-10-01', APPLY = process.argv.includes('--apply');
const q = sql => { const o = execFileSync(process.execPath, [WR, 'd1', 'execute', 'ssg-study', '--remote', '--json', '--command', sql], { encoding: 'utf8', maxBuffer: 1 << 28 }); return JSON.parse(o)[0].results; };
const users = q("SELECT id,name,role FROM users WHERE status='active' AND role!='admin'");
const logs = new Map(q(`SELECT user_id id,SUM(quiz) quiz,SUM(ok) ok FROM score_daily WHERE day!='${DAY}' GROUP BY user_id`).map(r => [r.id, r]));
const prog = q('SELECT user_id,subject,data FROM progress');
const rows = [];
for (const u of users) {
  let seen = 0, ok = 0, read = 0;
  for (const p of prog.filter(x => x.user_id === u.id)) {
    let d; try { d = JSON.parse(p.data); } catch { continue; }
    for (const a of Object.values(d.answers || {})) { seen += a.seen | 0; ok += a.correct | 0; }
    read += Object.values(d.read || {}).filter(Boolean).length;
  }
  const l = logs.get(u.id) || { quiz: 0, ok: 0 };
  const quiz = Math.max(0, seen - l.quiz), good = Math.min(quiz, Math.max(0, ok - l.ok)), rsec = read * 180;
  const pts = quiz + good + 2 * Math.floor(rsec / 60);
  rows.push({ id: u.id, name: u.name, seen, ok, read, quiz, good, rsec, pts });
}
console.table(rows);
if (!APPLY) { console.log('(chưa ghi) thêm --apply để ghi'); process.exit(0); }
const sql = rows.filter(r => r.pts > 0).map(r => `INSERT OR REPLACE INTO score_daily (user_id,day,quiz,ok,read_sec,exam_pts,duel_pts,focus_min,pts) VALUES (${r.id},'${DAY}',${r.quiz},${r.good},${r.rsec},0,0,0,${r.pts});`).join('\n');
fs.writeFileSync('.backfill.sql', sql + '\n');
execFileSync(process.execPath, [WR, 'd1', 'execute', 'ssg-study', '--remote', '--file=.backfill.sql'], { stdio: 'inherit' });
fs.unlinkSync('.backfill.sql'); console.log('Đã ghi', rows.filter(r => r.pts > 0).length, 'người');
