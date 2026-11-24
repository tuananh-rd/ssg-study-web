// Nhật ký hoạt động người dùng. Ghi: máy chủ (đăng nhập, quản trị, AI, mở môn, thi đấu) + trình duyệt (làm bài, đọc bài…).
// CHỈ quản trị viên có cờ can_logs mới đọc được (xem handleLogs). Giữ 90 ngày.
import { json, bad, SUBJECT_IDS } from './_lib.js';
import { scoreEvents } from './_rank.js';

const KEEP_MS = 90 * 86400000;
const clip = (s, n) => (s == null ? null : String(s).slice(0, n));
export const clientIp = req => req.headers.get('cf-connecting-ip') || 'local';

/** Ghi một sự kiện; không bao giờ làm hỏng yêu cầu chính. */
export async function logEvent(env, req, user, type, subject, detail) {
  try {
    let d = null; if (detail != null) { d = typeof detail === 'string' ? detail : JSON.stringify(detail); d = d.slice(0, 900); }
    const email = user ? user.email : (detail && detail.email) || null;
    await env.DB.prepare('INSERT INTO activity_log (ts,user_id,email,ip,ua,type,subject,detail) VALUES (?,?,?,?,?,?,?,?)')
      .bind(Date.now(), user ? user.id : null, clip(email, 120), req ? clip(clientIp(req), 64) : null, req ? clip(req.headers.get('user-agent'), 160) : null, clip(type, 40), clip(subject, 20), d).run();
    if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM activity_log WHERE ts<?').bind(Date.now() - KEEP_MS).run();
  } catch (e) { console.error('log fail', e && e.message); }
}

/** Như logEvent nhưng bỏ qua nếu cùng người, cùng loại, cùng môn đã được ghi trong windowMs gần đây (tránh nhật ký bị ngập bởi việc lặp lại). */
export async function logEventOnce(env, req, user, type, subject, detail, windowMs) {
  try {
    const hit = await env.DB.prepare("SELECT 1 x FROM activity_log WHERE user_id=? AND type=? AND COALESCE(subject,'')=? AND ts>? LIMIT 1").bind(user.id, type, subject || '', Date.now() - windowMs).first();
    if (hit) return;
  } catch { }
  return logEvent(env, req, user, type, subject, detail);
}

// Sự kiện do trình duyệt gửi lên: chỉ nhận đúng các loại này, chuỗi bị cắt ngắn.
const CLIENT_TYPES = new Set(['quiz_answer', 'quiz_finish', 'lesson_view', 'exam_finish', 'duel_finish', 'focus_session', 'read_time', 'search', 'ai_ask_click', 'page_view']);
export async function handleEvent(request, env, user, readJson) {
  const d = await readJson(request); if (!d || !Array.isArray(d.events)) return bad('Dữ liệu không hợp lệ');
  const subj = SUBJECT_IDS.includes(d.subject) ? d.subject : null;
  if (subj && !user.subjects.includes(subj)) return bad('Không có quyền', 403);
  const now = Date.now(), ip = clip(clientIp(request), 64), ua = clip(request.headers.get('user-agent'), 160), stmts = [], scored = [];
  for (const e of d.events.slice(0, 40)) {
    if (!e || !CLIENT_TYPES.has(e.type)) continue;
    let det = null; try { det = JSON.stringify(e.detail == null ? {} : e.detail).slice(0, 700); } catch { }
    const ts = Math.min(now, Math.max(now - 3600000, +e.ts || now));
    if (e.type !== 'read_time') stmts.push(env.DB.prepare('INSERT INTO activity_log (ts,user_id,email,ip,ua,type,subject,detail) VALUES (?,?,?,?,?,?,?,?)').bind(ts, user.id, user.email, ip, ua, e.type, subj, det));
    scored.push({ type: e.type, ts, detail: e.detail && typeof e.detail === 'object' ? e.detail : {} });
  }
  if (stmts.length) await env.DB.batch(stmts);
  if (scored.length && !user.no_rank) await scoreEvents(env, user.id, scored);   // tài khoản no_rank không tính điểm
  return json({ ok: true, n: stmts.length });
}

export const canViewLogs = u => !!u && u.role === 'admin' && !!u.can_logs;

/** GET /api/admin/logs?user=&type=&subject=&q=&from=&to=&before=&limit=  |  /api/admin/logs/summary */
export async function handleLogs(request, env, user, sub) {
  if (!canViewLogs(user)) return bad('Bạn chưa được cấp quyền xem nhật ký', 403);
  const url = new URL(request.url), p = url.searchParams;
  if (sub === 'scores') {   // nhật ký điểm: điểm từng người theo ngày + tổng
    const uid = +p.get('user') || 0, q = async (sql, ...b) => (await env.DB.prepare(sql).bind(...b).all()).results;
    const [rows, totals] = await Promise.all([
      q(`SELECT s.user_id,u.name,u.email,s.day,s.quiz,s.ok,s.read_sec,s.exam_pts,s.duel_pts,s.focus_min,s.pts,u.no_rank FROM score_daily s JOIN users u ON u.id=s.user_id ${uid ? 'WHERE s.user_id=?' : ''} ORDER BY s.day DESC,s.pts DESC LIMIT 300`, ...(uid ? [uid] : [])),
      q('SELECT s.user_id,u.name,u.email,u.no_rank,SUM(s.pts) pts,SUM(s.quiz) quiz,SUM(s.read_sec) rsec FROM score_daily s JOIN users u ON u.id=s.user_id GROUP BY s.user_id ORDER BY pts DESC'),
    ]);
    return json({ rows, totals });
  }
  if (sub === 'summary') {
    const day = Date.now() - 86400000, week = Date.now() - 7 * 86400000;
    const q = async (sql, ...b) => (await env.DB.prepare(sql).bind(...b).all()).results;
    const [tot, byType, topUsers, active, fails] = await Promise.all([
      q("SELECT COUNT(*) n FROM activity_log WHERE ts>? AND type NOT IN ('admin_log_view','app_open')", day),
      q('SELECT type,COUNT(*) n FROM activity_log WHERE ts>? GROUP BY type ORDER BY n DESC', week),
      q("SELECT l.user_id,l.email,COUNT(*) n,MAX(l.ts) last FROM activity_log l WHERE l.ts>? AND l.user_id IS NOT NULL AND l.type IN ('quiz_answer','quiz_finish','exam_finish','lesson_view','focus_session','duel_finish','ai_chat','ai_translate') GROUP BY l.user_id ORDER BY n DESC LIMIT 8", week),
      q('SELECT COUNT(DISTINCT user_id) n FROM activity_log WHERE ts>? AND user_id IS NOT NULL', day),
      q("SELECT COUNT(*) n FROM activity_log WHERE ts>? AND type IN ('login_fail','login_blocked')", day),
    ]);
    return json({ events24h: tot[0].n, active24h: active[0].n, fails24h: fails[0].n, byType, topUsers });
  }
  const where = [], b = [];
  if (+p.get('user')) { where.push('user_id=?'); b.push(+p.get('user')); }
  const types = (p.get('type') || '').split(',').filter(x => /^[a-z_]{2,40}$/.test(x)); if (types.length) { where.push(`type IN (${types.map(() => '?').join(',')})`); b.push(...types); }
  if (SUBJECT_IDS.includes(p.get('subject'))) { where.push('subject=?'); b.push(p.get('subject')); }
  const qq = (p.get('q') || '').trim().slice(0, 80); if (qq) { where.push("(detail LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR ip LIKE ? ESCAPE '\\')"); const l = '%' + qq.replace(/[\\%_]/g, c => '\\' + c) + '%'; b.push(l, l, l); }
  if (+p.get('from')) { where.push('ts>=?'); b.push(+p.get('from')); }
  if (+p.get('to')) { where.push('ts<=?'); b.push(+p.get('to')); }
  if (+p.get('before')) { where.push('id<?'); b.push(+p.get('before')); }
  const limit = Math.min(200, Math.max(10, +p.get('limit') || 60));
  const rows = (await env.DB.prepare(`SELECT id,ts,user_id,email,ip,ua,type,subject,detail FROM activity_log ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT ?`).bind(...b, limit + 1).all()).results;
  const more = rows.length > limit; if (more) rows.pop();
  if (!p.get('before')) await logEventOnce(env, request, user, 'admin_log_view', null, { filter: Object.fromEntries([...p].filter(([k]) => k !== 'before' && k !== 'limit')) }, 30 * 60000);   // mở/làm mới nhiều lần chỉ ghi 1 dòng mỗi 30 phút
  return json({ rows, more, next: more ? rows[rows.length - 1].id : null });
}
