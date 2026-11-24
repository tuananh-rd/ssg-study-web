-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-presence.sql
CREATE TABLE IF NOT EXISTS presence (user_id INTEGER PRIMARY KEY, ts INTEGER NOT NULL);
