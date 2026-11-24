-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-no-rank.sql
-- Cờ no_rank=1: tài khoản không tính điểm xếp hạng (đặt bằng: UPDATE users SET no_rank=1 WHERE id=...)
ALTER TABLE users ADD COLUMN no_rank INTEGER NOT NULL DEFAULT 0;
