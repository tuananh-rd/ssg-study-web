-- Chạy MỘT lần trên D1 đang chạy: wrangler d1 execute ssg-study --remote --file=migrate-logs.sql
ALTER TABLE users ADD COLUMN can_logs INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  user_id INTEGER,
  email TEXT,
  ip TEXT,
  ua TEXT,
  type TEXT NOT NULL,
  subject TEXT,
  detail TEXT
);
CREATE INDEX IF NOT EXISTS idx_log_ts ON activity_log (ts DESC);
CREATE INDEX IF NOT EXISTS idx_log_user ON activity_log (user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_log_type ON activity_log (type, ts DESC);
