-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-rank.sql
CREATE TABLE IF NOT EXISTS score_daily (
  user_id INTEGER NOT NULL, day TEXT NOT NULL,
  quiz INTEGER NOT NULL DEFAULT 0, ok INTEGER NOT NULL DEFAULT 0, read_sec INTEGER NOT NULL DEFAULT 0,
  exam_pts INTEGER NOT NULL DEFAULT 0, duel_pts INTEGER NOT NULL DEFAULT 0, focus_min INTEGER NOT NULL DEFAULT 0,
  pts INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, day));
CREATE INDEX IF NOT EXISTS idx_score_day ON score_daily (day);

-- Tính điểm cho những hoạt động đã ghi trong nhật ký (tối đa 90 ngày gần nhất; thời gian đọc chưa được đo nên chưa có)
INSERT OR IGNORE INTO score_daily (user_id,day,quiz,ok,read_sec,exam_pts,duel_pts,focus_min,pts)
SELECT user_id, day, quiz, ok, 0, exam_pts, duel_pts, focus_min, quiz + ok + exam_pts + duel_pts + focus_min FROM (
  SELECT user_id, day,
    MIN(SUM(CASE WHEN type='quiz_answer' THEN 1 ELSE 0 END), 400) quiz,
    MIN(SUM(CASE WHEN type='quiz_answer' AND json_extract(detail,'$.ok') IN (1,'true') THEN 1 ELSE 0 END), 400) ok,
    MIN(SUM(CASE WHEN type='exam_finish' AND json_extract(detail,'$.total')>=10 THEN 10+CAST(ROUND(MIN(MAX(COALESCE(json_extract(detail,'$.score'),0),0),10)*3) AS INTEGER) ELSE 0 END), 200) exam_pts,
    MIN(SUM(CASE WHEN type='duel_finish' THEN 5+(CASE WHEN json_extract(detail,'$.rank')=1 AND json_extract(detail,'$.players')>=2 THEN 10 ELSE 0 END) ELSE 0 END), 150) duel_pts,
    MIN(SUM(CASE WHEN type='focus_session' THEN MIN(MAX(CAST(COALESCE(json_extract(detail,'$.min'),0) AS INTEGER),0),180) ELSE 0 END), 240) focus_min
  FROM (SELECT user_id, date((ts/1000)+25200,'unixepoch') day, type, detail FROM activity_log WHERE user_id IS NOT NULL AND type IN ('quiz_answer','exam_finish','duel_finish','focus_session'))
  GROUP BY user_id, day);
