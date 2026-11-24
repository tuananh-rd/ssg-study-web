-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-profile.sql
CREATE TABLE IF NOT EXISTS profiles (user_id INTEGER PRIMARY KEY, bio TEXT, motto TEXT, accent TEXT, avatar TEXT, av_ts INTEGER, updated_at INTEGER NOT NULL);
