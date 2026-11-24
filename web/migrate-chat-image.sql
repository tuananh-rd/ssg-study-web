-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-chat-image.sql
ALTER TABLE chat_messages ADD COLUMN img TEXT;
