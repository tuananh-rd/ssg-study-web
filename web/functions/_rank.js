// Điểm học tập + bảng xếp hạng. Điểm cộng dồn theo ngày (giờ Việt Nam) trong bảng score_daily, tính ở máy chủ từ các sự kiện học bài.
//   Làm 1 câu quiz        +1   (trả lời đúng +1 nữa)            tối đa 400 câu/ngày
//   Đọc lý thuyết         +2 mỗi phút (chỉ tính khi đang xem)    tối đa 180 phút/ngày
//   Hoàn thành bài thi thử +10, cộng thêm 3 điểm cho mỗi 1 điểm số (thang 10)   tối đa 5 bài/ngày
//   Thi đấu               +5 mỗi trận, hạng nhất (từ 2 người) +10  tối đa 10 trận/ngày
//   Tập trung (Pomodoro)  +1 mỗi phút                            tối đa 240 phút/ngày
import { json, bad } from './_lib.js';

export const CAPS = { quiz: 400, readSec: 180 * 60, exam: 200, duel: 150, focus: 240 };
export const TITLES = [
  { at: 0, name: 'Tuất', c: '#8892a6' },
  { at: 100, name: 'Siêu Tuất', c: '#3f8f5a' },
  { at: 300, name: 'Tuất Vương', c: '#1c8ea8' },
  { at: 700, name: 'Súc Vật', c: '#3b5bdb' },
  { at: 1500, name: 'Siêu Súc Vật', c: '#7a4fd1' },
  { at: 3000, name: 'Súc Vật Vương', c: '#c2410c' },
  { at: 6000, name: 'Vua Tuất', c: '#c0275a' },
  { at: 10000, name: 'Thần Tuất', c: '#b7791f' },
];
export const titleOf = pts => { let t = TITLES[0], i = 0; TITLES.forEach((x, k) => { if (pts >= x.at) { t = x; i = k; } }); return { ...t, i, next: TITLES[i + 1] || null }; };
export const pointsOf = r => r.quiz + r.ok + 2 * Math.floor(r.read_sec / 60) + r.exam_pts + r.duel_pts + r.focus_min;

const VN = 7 * 3600000;
export const dayOf = ts => new Date(ts + VN).toISOString().slice(0, 10);
const num = (v, max) => { v = +v; return Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : 0; };

/** Cộng điểm cho các sự kiện từ trình duyệt: evs = [{type, ts, detail}] */
export async function scoreEvents(env, uid, evs) {
  try {
    const rows = new Map();
    const get = async day => {
      if (rows.has(day)) return rows.get(day);
      const r = (await env.DB.prepare('SELECT quiz,ok,read_sec,exam_pts,duel_pts,focus_min FROM score_daily WHERE user_id=? AND day=?').bind(uid, day).first())
        || { quiz: 0, ok: 0, read_sec: 0, exam_pts: 0, duel_pts: 0, focus_min: 0 };
      r.dirty = false; rows.set(day, r); return r;
    };
    for (const e of evs) {
      const d = e.detail || {}, r = await get(dayOf(e.ts));
      if (e.type === 'quiz_answer') { if (r.quiz < CAPS.quiz) { r.quiz++; if (d.ok) r.ok++; r.dirty = true; } }
      else if (e.type === 'read_time') { const s = num(d.secs, 120); if (s && r.read_sec < CAPS.readSec) { r.read_sec = Math.min(CAPS.readSec, r.read_sec + s); r.dirty = true; } }
      else if (e.type === 'exam_finish') { if (num(d.total, 1000) >= 10 && r.exam_pts < CAPS.exam) { r.exam_pts = Math.min(CAPS.exam, r.exam_pts + 10 + Math.round(num(d.score, 10) * 3)); r.dirty = true; } }
      else if (e.type === 'duel_finish') { if (r.duel_pts < CAPS.duel) { r.duel_pts = Math.min(CAPS.duel, r.duel_pts + 5 + (+d.rank === 1 && +d.players >= 2 ? 10 : 0)); r.dirty = true; } }
      else if (e.type === 'focus_session') { const m = Math.round(num(d.min, 180)); if (m && r.focus_min < CAPS.focus) { r.focus_min = Math.min(CAPS.focus, r.focus_min + m); r.dirty = true; } }
    }
    const st = [];
    for (const [day, r] of rows) if (r.dirty) st.push(env.DB.prepare(
      `INSERT INTO score_daily (user_id,day,quiz,ok,read_sec,exam_pts,duel_pts,focus_min,pts) VALUES (?,?,?,?,?,?,?,?,?)
       ON CONFLICT(user_id,day) DO UPDATE SET quiz=excluded.quiz,ok=excluded.ok,read_sec=excluded.read_sec,exam_pts=excluded.exam_pts,duel_pts=excluded.duel_pts,focus_min=excluded.focus_min,pts=excluded.pts`)
      .bind(uid, day, r.quiz, r.ok, r.read_sec, r.exam_pts, r.duel_pts, r.focus_min, pointsOf(r)));
    if (st.length) await env.DB.batch(st);
  } catch (e) { console.error('score fail', e && e.message); }
}

/** Danh hiệu theo tổng điểm cho một nhóm người dùng (tài khoản đặt no_rank → không có danh hiệu): Map id → [tên, màu, bậc] */
export async function titlesFor(env, ids) {
  const out = new Map(); ids = [...new Set(ids.filter(x => +x > 0))].slice(0, 200); if (!ids.length) return out;
  const ph = ids.map(() => '?').join(',');
  const us = (await env.DB.prepare(`SELECT id,no_rank FROM users WHERE id IN (${ph})`).bind(...ids).all()).results;
  const pts = new Map((await env.DB.prepare(`SELECT user_id id,SUM(pts) p FROM score_daily WHERE user_id IN (${ph}) GROUP BY user_id`).bind(...ids).all()).results.map(r => [r.id, r.p]));
  for (const u of us) if (!u.no_rank) { const t = titleOf(pts.get(u.id) || 0); out.set(u.id, [t.name, t.c, t.i]); }
  return out;
}

/** GET /api/rank?period=week|month|all */
export async function handleRank(request, env, user) {
  const p = new URL(request.url).searchParams.get('period');
  const period = p === 'month' || p === 'all' ? p : 'week', now = Date.now();
  const since = period === 'all' ? '0000-00-00' : dayOf(now - (period === 'week' ? 6 : 29) * 86400000);
  const q = async (sql, ...b) => (await env.DB.prepare(sql).bind(...b).all()).results;
  const [top, life, mine] = await Promise.all([
    q(`SELECT u.id id,u.name,u.role,COALESCE(SUM(s.pts),0) pts,COALESCE(SUM(s.quiz),0) quiz,COALESCE(SUM(s.ok),0) ok,COALESCE(SUM(s.read_sec),0) rsec,COALESCE(SUM(s.focus_min),0) focus
       FROM users u LEFT JOIN score_daily s ON s.user_id=u.id AND s.day>=? WHERE u.status='active' AND u.no_rank=0 GROUP BY u.id ORDER BY pts DESC,u.id LIMIT 100`, since),
    q('SELECT user_id id,SUM(pts) pts FROM score_daily GROUP BY user_id'),
    q('SELECT day,pts FROM score_daily WHERE user_id=? AND pts>0 ORDER BY day DESC LIMIT 400', user.id),
  ]);
  const total = new Map(life.map(x => [x.id, x.pts]));
  let last = null, rank = 0;
  const rows = top.map((r, i) => { if (r.pts !== last) { rank = i + 1; last = r.pts; } const t = titleOf(total.get(r.id) || 0); return { rank, id: r.id, name: r.name, admin: r.role === 'admin', pts: r.pts, quiz: r.quiz, ok: r.ok, min: Math.floor(r.rsec / 60), focus: r.focus, title: t.name, tc: t.c, ti: t.i, me: r.id === user.id }; });
  // thông tin của chính người xem (kể cả khi ngoài top 100)
  const myTotal = total.get(user.id) || 0, mt = titleOf(myTotal);
  const days = new Set(mine.map(x => x.day)); let streak = 0, d = now; if (!days.has(dayOf(d))) d -= 86400000; while (days.has(dayOf(d))) { streak++; d -= 86400000; }
  const today = mine.find(x => x.day === dayOf(now));
  const myRow = rows.find(r => r.me);
  return json({
    period, rows,
    admin: !!user.no_rank,
    me: user.no_rank ? null : { rank: myRow ? myRow.rank : null, pts: myRow ? myRow.pts : 0, total: myTotal, title: mt.name, tc: mt.c, ti: mt.i, next: mt.next ? { name: mt.next.name, at: mt.next.at } : null, from: mt.at, streak, today: today ? today.pts : 0 },
    titles: TITLES, caps: CAPS,
  });
}
