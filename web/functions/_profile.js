// Hồ sơ người dùng: ảnh đại diện, câu nói, giới thiệu, màu nhấn. Ai đã đăng nhập cũng xem được hồ sơ của người khác (không có email).
//   GET /api/profile/:id           → hồ sơ + thống kê học tập
//   GET /api/profile/avatar/:id    → ảnh đại diện
//   PUT /api/profile               → sửa hồ sơ của chính mình
import { json, bad } from './_lib.js';
import { titleOf, dayOf } from './_rank.js';
import { logEvent } from './_log.js';

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '').replace(/\r\n?/g, '\n').trim().slice(0, n);
const IMG_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_AVATAR = 150000;   // ký tự base64 (~110 KB), ảnh được thu nhỏ 256×256 ở trình duyệt

/** Phiên bản ảnh đại diện của một nhóm người dùng: Map id → av_ts (chỉ người đã có ảnh) */
export async function avatarVersions(env, ids) {
  const out = new Map(); ids = [...new Set(ids.filter(x => +x > 0))].slice(0, 200); if (!ids.length) return out;
  const rows = (await env.DB.prepare(`SELECT user_id,av_ts FROM profiles WHERE avatar IS NOT NULL AND user_id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results;
  rows.forEach(r => out.set(r.user_id, r.av_ts || 1)); return out;
}

export async function handleProfile(request, env, user, b, readJson, c) {
  const m = request.method;
  if (m === 'GET' && b === 'avatar') {
    const row = await env.DB.prepare('SELECT avatar FROM profiles WHERE user_id=?').bind(+c).first();
    const mm = row && row.avatar && row.avatar.match(IMG_RE);
    if (!mm) return bad('Không có ảnh', 404);
    const bin = Uint8Array.from(atob(mm[2]), ch => ch.charCodeAt(0));
    return new Response(bin, { headers: { 'content-type': mm[1], 'cache-control': 'private, max-age=86400', 'x-content-type-options': 'nosniff' } });
  }
  if (m === 'PUT' && !b) {
    const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
    const old = await env.DB.prepare('SELECT avatar,av_ts FROM profiles WHERE user_id=?').bind(user.id).first();
    let avatar = old ? old.avatar : null, avTs = old ? old.av_ts : null;
    if (d.avatar === null) { avatar = null; avTs = null; }
    else if (d.avatar !== undefined) {
      if (typeof d.avatar !== 'string' || d.avatar.length > MAX_AVATAR || !IMG_RE.test(d.avatar)) return bad('Ảnh không hợp lệ hoặc quá lớn', 413);
      avatar = d.avatar; avTs = Date.now();
    }
    let newName = null;
    if (d.name !== undefined) {
      newName = clean(d.name, 60).replace(/\s+/g, ' ');
      if (newName.length < 2) return bad('Tên cần ít nhất 2 ký tự');
      if (newName.toLowerCase() !== String(user.name).toLowerCase()) {
        const dup = await env.DB.prepare('SELECT id FROM users WHERE lower(name)=lower(?) AND id!=?').bind(newName, user.id).first();
        if (dup) return bad('Tên này đã có người dùng, hãy chọn tên khác');
      }
    }
    const accent = /^#[0-9a-fA-F]{6}$/.test(d.accent || '') ? d.accent.toLowerCase() : null;
    const now = Date.now();
    await env.DB.prepare(`INSERT INTO profiles (user_id,bio,motto,accent,avatar,av_ts,updated_at) VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET bio=excluded.bio,motto=excluded.motto,accent=excluded.accent,avatar=excluded.avatar,av_ts=excluded.av_ts,updated_at=excluded.updated_at`)
      .bind(user.id, clean(d.bio, 240), clean(d.motto, 70), accent, avatar, avTs, now).run();
    if (newName && newName !== user.name) {
      await env.DB.prepare('UPDATE users SET name=? WHERE id=?').bind(newName, user.id).run();
      await logEvent(env, request, user, 'profile_rename', null, { from: user.name, to: newName });
    }
    return json({ ok: true, pv: avatar ? avTs : 0, name: newName || user.name });
  }
  if (m === 'GET' && +b) {
    const id = +b, now = Date.now();
    const u = await env.DB.prepare("SELECT id,name,role,status,no_rank,created_at,last_login FROM users WHERE id=?").bind(id).first();
    if (!u || u.status !== 'active') return bad('Không tìm thấy người dùng', 404);
    const q = async (sql, ...a) => (await env.DB.prepare(sql).bind(...a).all()).results;
    const [pf, pres, tot, days, all] = await Promise.all([
      env.DB.prepare('SELECT bio,motto,accent,avatar IS NOT NULL has_av,av_ts FROM profiles WHERE user_id=?').bind(id).first(),
      env.DB.prepare('SELECT ts FROM presence WHERE user_id=?').bind(id).first(),
      env.DB.prepare('SELECT COALESCE(SUM(pts),0) pts,COALESCE(SUM(quiz),0) quiz,COALESCE(SUM(ok),0) ok,COALESCE(SUM(read_sec),0) rsec,COALESCE(SUM(focus_min),0) focus FROM score_daily WHERE user_id=?').bind(id).first(),
      q('SELECT day FROM score_daily WHERE user_id=? AND pts>0 ORDER BY day DESC LIMIT 400', id),
      q("SELECT u.id,COALESCE(SUM(s.pts),0) p FROM users u LEFT JOIN score_daily s ON s.user_id=u.id WHERE u.status='active' AND u.no_rank=0 GROUP BY u.id"),
    ]);
    const set = new Set(days.map(x => x.day)); let streak = 0, t = now; if (!set.has(dayOf(t))) t -= 86400000; while (set.has(dayOf(t))) { streak++; t -= 86400000; }
    const tt = titleOf(tot.pts);
    const rank = u.no_rank ? null : 1 + all.filter(x => x.p > tot.pts).length;
    return json({
      id: u.id, name: u.name, admin: u.role === 'admin', noRank: !!u.no_rank, me: u.id === user.id,
      title: u.no_rank ? null : { name: tt.name, c: tt.c, i: tt.i, next: tt.next ? { name: tt.next.name, at: tt.next.at } : null, from: tt.at },
      pts: tot.pts, rank, of: all.length, quiz: tot.quiz, ok: tot.ok, min: Math.floor(tot.rsec / 60), focus: tot.focus, streak,
      joined: u.created_at, last: Math.max(pres ? pres.ts : 0, u.last_login || 0) || null, online: !!(pres && pres.ts > now - 60000),
      bio: pf ? pf.bio || '' : '', motto: pf ? pf.motto || '' : '', accent: pf && pf.accent || null, pv: pf && pf.has_av ? pf.av_ts || 1 : 0,
    });
  }
  return bad('Không hợp lệ', 404);
}
