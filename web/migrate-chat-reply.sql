-- Chạy MỘT lần (sau migrate-chat-image.sql): wrangler d1 execute ssg-study --remote --file=migrate-chat-reply.sql
ALTER TABLE chat_messages ADD COLUMN reply_to INTEGER;
