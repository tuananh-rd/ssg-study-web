-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-throne.sql
CREATE TABLE IF NOT EXISTS throne_log (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, king_id INTEGER NOT NULL, prev_id INTEGER, pts INTEGER NOT NULL DEFAULT 0);
