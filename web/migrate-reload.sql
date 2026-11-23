-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-reload.sql
CREATE TABLE IF NOT EXISTS reload_cmds (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, user_id INTEGER, by_id INTEGER, msg TEXT);
