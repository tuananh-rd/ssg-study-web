-- D1 schema cho web ôn thi nhiều môn
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','disabled')),
  must_change INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_login INTEGER,
  can_logs INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS grants (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  PRIMARY KEY (user_id, subject)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, subject)
);
CREATE TABLE IF NOT EXISTS login_attempts (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  first_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_usage (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  chat INTEGER NOT NULL DEFAULT 0,
  tr INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- Relay phòng thi đấu
CREATE TABLE IF NOT EXISTS duel_rooms (code TEXT PRIMARY KEY, host_user INTEGER NOT NULL, last INTEGER NOT NULL, created INTEGER NOT NULL, name TEXT, subj TEXT, n INTEGER NOT NULL DEFAULT 1, phase TEXT NOT NULL DEFAULT 'wait');
CREATE TABLE IF NOT EXISTS duel_peers (code TEXT NOT NULL, id TEXT NOT NULL, last INTEGER NOT NULL, gone INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (code, id));
CREATE TABLE IF NOT EXISTS duel_msgs (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, to_id TEXT NOT NULL, body TEXT NOT NULL, ts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_duel_msgs ON duel_msgs (code, to_id, id);

-- Lệnh yêu cầu tải lại trang (quản trị viên gửi cho một người hoặc mọi người)
CREATE TABLE IF NOT EXISTS reload_cmds (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, user_id INTEGER, by_id INTEGER, msg TEXT);

-- Người đang online (cập nhật mỗi khi trình duyệt hỏi máy chủ, giới hạn 1 lần/20 giây)
CREATE TABLE IF NOT EXISTS presence (user_id INTEGER PRIMARY KEY, ts INTEGER NOT NULL);

-- Lời mời vào phòng thi đấu
CREATE TABLE IF NOT EXISTS duel_invites (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, from_user INTEGER NOT NULL, to_user INTEGER NOT NULL, code TEXT NOT NULL, subj TEXT);
CREATE INDEX IF NOT EXISTS idx_inv_to ON duel_invites (to_user, id);

-- Chat chung
CREATE TABLE IF NOT EXISTS chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL, mentions TEXT, img TEXT, reply_to INTEGER);
CREATE INDEX IF NOT EXISTS idx_chat_ts ON chat_messages (ts);

-- Nhật ký hoạt động (chỉ quản trị viên được cấp quyền can_logs mới xem được)
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

-- Điểm học tập theo ngày (giờ VN) cho bảng xếp hạng
CREATE TABLE IF NOT EXISTS score_daily (
  user_id INTEGER NOT NULL, day TEXT NOT NULL,
  quiz INTEGER NOT NULL DEFAULT 0, ok INTEGER NOT NULL DEFAULT 0, read_sec INTEGER NOT NULL DEFAULT 0,
  exam_pts INTEGER NOT NULL DEFAULT 0, duel_pts INTEGER NOT NULL DEFAULT 0, focus_min INTEGER NOT NULL DEFAULT 0,
  pts INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, day));
CREATE INDEX IF NOT EXISTS idx_score_day ON score_daily (day);
