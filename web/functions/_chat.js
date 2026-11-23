// Chat chung của web: mọi tài khoản đã đăng nhập đều nhắn được. Lấy tin bằng polling (GET /api/chat?after=ID).
// Tên và vai trò lấy từ bảng users tại thời điểm đọc (đổi tên/vai trò là cập nhật ngay).
import { json, bad } from './_lib.js';
import { logEvent } from './_log.js';

const MAX_LEN = 500, MIN_GAP = 900, KEEP_MS = 30 * 86400000, FIRST = 50;
const clean = s => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const SEL = 'SELECT m.id,m.ts,m.user_id uid,m.body,u.name,u.role FROM chat_messages m LEFT JOIN users u ON u.id=m.user_id';

export async function handleChat(request, env, user, sub, readJson) {
  const m = request.method;
  if (m === 'GET' && !sub) {
    const p = new URL(request.url).searchParams, after = Math.max(0, +p.get('after') || 0);
    let rows;
    if (after) rows = (await env.DB.prepare(`${SEL} WHERE m.id>? ORDER BY m.id ASC LIMIT 100`).bind(after).all()).results;
    else rows = (await env.DB.prepare(`${SEL} ORDER BY m.id DESC LIMIT ?`).bind(FIRST).all()).results.reverse();
    const out = { msgs: rows.map(r => ({ id: r.id, ts: r.ts, uid: r.uid, name: r.name || 'Tài khoản đã xoá', role: r.name ? r.role : 'user', body: r.body })), me: user.id };
    if (p.get('sync') === '1' || !after) out.alive = (await env.DB.prepare('SELECT id FROM chat_messages ORDER BY id DESC LIMIT 80').all()).results.map(r => r.id);
    const rl = await env.DB.prepare('SELECT id,msg FROM reload_cmds WHERE ts>? AND (user_id IS NULL OR user_id=?) ORDER BY id DESC LIMIT 1').bind(Date.now() - 600000, user.id).first();
    out.rl = rl ? rl.id : 0; if (rl) out.rlmsg = rl.msg || '';
    return json(out);
  }
  if (m === 'POST' && !sub) {
    const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
    const body = clean(d.body); if (!body) return bad('Tin nhắn trống'); if (body.length > MAX_LEN) return bad('Tin nhắn tối đa ' + MAX_LEN + ' ký tự');
    const now = Date.now(), last = await env.DB.prepare('SELECT ts FROM chat_messages WHERE user_id=? ORDER BY id DESC LIMIT 1').bind(user.id).first();
    if (last && now - last.ts < MIN_GAP) return bad('Bạn gửi nhanh quá, chậm lại một chút', 429);
    const r = await env.DB.prepare('INSERT INTO chat_messages (ts,user_id,body) VALUES (?,?,?) RETURNING id').bind(now, user.id, body).first();
    await logEvent(env, request, user, 'chat_send', null, { len: body.length, q: body.slice(0, 120) });
    if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM chat_messages WHERE ts<?').bind(now - KEEP_MS).run();
    return json({ ok: true, id: r && r.id });
  }
  if (m === 'DELETE' && +sub) {
    const row = await env.DB.prepare('SELECT user_id,body FROM chat_messages WHERE id=?').bind(+sub).first(); if (!row) return json({ ok: true });
    if (user.role !== 'admin' && row.user_id !== user.id) return bad('Không có quyền xoá tin này', 403);
    await env.DB.prepare('DELETE FROM chat_messages WHERE id=?').bind(+sub).run();
    if (row.user_id !== user.id) await logEvent(env, request, user, 'chat_delete', null, { msg: +sub, of: row.user_id, q: row.body.slice(0, 80) });
    return json({ ok: true });
  }
  return bad('Không tìm thấy', 404);
}
