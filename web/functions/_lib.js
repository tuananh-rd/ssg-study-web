// Thư viện dùng chung cho các Pages Functions: môn học, mật khẩu, phiên đăng nhập, phản hồi JSON.
export const SUBJECTS = {
  ssg105: { id: 'ssg105', name: 'SSG105', full: 'Kỹ năng mềm', desc: 'Làm việc nhóm, giao tiếp, thuyết trình, nghề nghiệp', key: 'ssg105_progress_v2', color: '#3b5bdb' },
  dap391m: { id: 'dap391m', name: 'DAP391m', full: 'Data Science', desc: 'Python, Pandas, Matplotlib, Seaborn, Dash, Watson', key: 'dap391m_progress_v2', color: '#0c8599' },
  ail303m: { id: 'ail303m', name: 'AIL303m', full: 'Machine Learning', desc: 'Hồi quy, phân loại, cây quyết định, ensemble, clustering', key: 'ail303m_progress_v2', color: '#7048e8' },
  cpv301: { id: 'cpv301', name: 'CPV301', full: 'Computer Vision', desc: 'Xử lý ảnh, biên, phân đoạn, alignment, nhận dạng', key: 'cpv301_progress_v2', color: '#e8590c' },
};
export const SUBJECT_IDS = Object.keys(SUBJECTS);

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});
export const bad = (msg, status = 400) => json({ error: msg }, status);

const enc = new TextEncoder();
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

export async function hashPassword(password, saltB64) {
  const salt = saltB64 ? unb64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256);
  return { hash: b64(bits), salt: saltB64 || b64(salt) };
}
export function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false; let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0;
}
export const sha256hex = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
export const randomToken = (n = 32) => hex(crypto.getRandomValues(new Uint8Array(n)));
export const randomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const r = crypto.getRandomValues(new Uint8Array(12));
  return [...r].map(x => chars[x % chars.length]).join('');
};

const COOKIE = 'sid', SESSION_DAYS = 30;
export function parseCookies(req) {
  const o = {}; (req.headers.get('cookie') || '').split(/;\s*/).forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i)] = p.slice(i + 1); }); return o;
}
export const sessionCookie = (token, secure) => `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure ? '; Secure' : ''}`;
export const clearCookie = secure => `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
export const isSecure = req => new URL(req.url).protocol === 'https:';

export async function createSession(env, userId) {
  const token = randomToken(32), now = Date.now();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?,?,?,?)').bind(await sha256hex(token), userId, now + SESSION_DAYS * 86400000, now).run();
  return token;
}
/** Trả về {id,email,name,role,status,must_change,subjects[]} hoặc null */
export async function getUser(req, env) {
  const t = parseCookies(req)[COOKIE]; if (!t || !/^[0-9a-f]{64}$/.test(t)) return null;
  const row = await env.DB.prepare(
    'SELECT u.id,u.email,u.name,u.role,u.status,u.must_change,u.can_logs FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?'
  ).bind(await sha256hex(t), Date.now()).first();
  if (!row || row.status !== 'active') return null;
  const g = await env.DB.prepare('SELECT subject FROM grants WHERE user_id=?').bind(row.id).all();
  row.subjects = row.role === 'admin' ? SUBJECT_IDS : g.results.map(r => r.subject).filter(s => SUBJECTS[s]);
  return row;
}
export async function deleteSession(req, env) {
  const t = parseCookies(req)[COOKIE]; if (t) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256hex(t)).run();
}

// Chống thử mật khẩu hàng loạt: tối đa 8 lần sai / 10 phút cho mỗi (email + IP)
export async function throttled(env, key) {
  const row = await env.DB.prepare('SELECT n,first_at FROM login_attempts WHERE k=?').bind(key).first();
  if (!row) return false;
  if (Date.now() - row.first_at > 600000) { await env.DB.prepare('DELETE FROM login_attempts WHERE k=?').bind(key).run(); return false; }
  return row.n >= 8;
}
export async function noteFail(env, key) {
  const now = Date.now();
  await env.DB.prepare('INSERT INTO login_attempts (k,n,first_at) VALUES (?,1,?) ON CONFLICT(k) DO UPDATE SET n = CASE WHEN ?-first_at>600000 THEN 1 ELSE n+1 END, first_at = CASE WHEN ?-first_at>600000 THEN ? ELSE first_at END').bind(key, now, now, now, now).run();
}
export const clearFails = (env, key) => env.DB.prepare('DELETE FROM login_attempts WHERE k=?').bind(key).run();

export const validEmail = e => typeof e === 'string' && e.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const validPassword = p => typeof p === 'string' && p.length >= 8 && p.length <= 100;

/** Chỉ cho phép gọi API ghi từ chính trang web (JSON + header tuỳ chỉnh) để chống CSRF */
export function csrfOk(req) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
  return req.headers.get('x-requested-with') === 'ssg-web' && (req.headers.get('content-type') || '').includes('application/json');
}
