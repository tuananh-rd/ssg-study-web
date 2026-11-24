-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-mention-invite.sql
ALTER TABLE chat_messages ADD COLUMN mentions TEXT;
CREATE TABLE IF NOT EXISTS duel_invites (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, from_user INTEGER NOT NULL, to_user INTEGER NOT NULL, code TEXT NOT NULL, subj TEXT);
CREATE INDEX IF NOT EXISTS idx_inv_to ON duel_invites (to_user, id);
