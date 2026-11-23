// Tạo SQL thêm tài khoản admin: node scripts/make-admin.mjs <email> "<Họ tên>" [mật khẩu]
// Không có mật khẩu → tự sinh ngẫu nhiên và in ra MỘT lần. Admin phải đổi mật khẩu ở lần đăng nhập đầu.
import crypto from 'node:crypto';
const [email, name = 'Quản trị viên', given] = process.argv.slice(2);
if (!email) { console.error('Cần email'); process.exit(1); }
const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const pw = given || [...crypto.randomBytes(14)].map(x => chars[x % chars.length]).join('');
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(pw, salt, 100000, 32, 'sha256');
const q = s => "'" + s.replace(/'/g, "''") + "'";
const sql = `INSERT INTO users (email,name,pass_hash,pass_salt,role,status,must_change,created_at) VALUES (${q(email.toLowerCase())},${q(name)},'${hash.toString('base64')}','${salt.toString('base64')}','admin','active',${given ? 0 : 1},${Date.now()})
 ON CONFLICT(email) DO UPDATE SET pass_hash=excluded.pass_hash, pass_salt=excluded.pass_salt, role='admin', status='active', must_change=excluded.must_change;`;
import fs from 'node:fs'; fs.writeFileSync('.admin-seed.sql', sql + '\n');
console.log('Đã ghi .admin-seed.sql\nEmail:', email, '\nMật khẩu tạm:', pw);
