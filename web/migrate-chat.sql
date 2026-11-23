-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-chat.sql
CREATE TABLE IF NOT EXISTS chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_chat_ts ON chat_messages (ts);
