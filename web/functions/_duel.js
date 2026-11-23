// Relay phòng thi đấu: chủ phòng và người chơi trao đổi tin nhắn qua máy chủ (không cần WebRTC/TURN, vào được từ mọi mạng).
// Mọi POST /api/duel/<hành động> đều cần đăng nhập. Chủ phòng giữ toàn bộ luật chơi trong trình duyệt, máy chủ chỉ chuyển tin.
import { json, bad } from './_lib.js';
import { logEvent } from './_log.js';

const ROOM_TTL = 20000, PEER_TTL = 12000, KEEP = 15 * 60 * 1000, MAX_BODY = 150000;
const okCode = c => typeof c === 'string' && /^[A-Z0-9]{6}$/.test(c);
const okId = s => typeof s === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(s);

async function sweep(env, now) {
  if (Math.random() > 0.05) return;
  await env.DB.prepare('DELETE FROM duel_msgs WHERE ts<?').bind(now - KEEP).run();
  await env.DB.prepare('DELETE FROM duel_peers WHERE last<?').bind(now - KEEP).run();
  await env.DB.prepare('DELETE FROM duel_rooms WHERE last<?').bind(now - KEEP).run();
}

async function roomAlive(env, code, now) {
  const r = await env.DB.prepare('SELECT last FROM duel_rooms WHERE code=?').bind(code).first();
  return !!r && now - r.last < ROOM_TTL;
}

export async function handleDuel(request, env, user, action, readJson) {
  const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
  const now = Date.now(); await sweep(env, now);

  if (action === 'list') {
    const subj = String(d.subj || '').slice(0, 40);
    const rows = (await env.DB.prepare("SELECT code,name,n,phase FROM duel_rooms WHERE last>? AND subj=? AND phase IN ('wait','ready') AND n<8 ORDER BY created DESC LIMIT 20").bind(now - ROOM_TTL, subj).all()).results || [];
    return json({ rooms: rows.map(r => ({ code: r.code, name: r.name || 'Chủ phòng', n: r.n || 1 })) });
  }
  if (!okCode(d.code)) return bad('Mã phòng không hợp lệ');
  const code = d.code;

  if (action === 'host') {
    const r = await env.DB.prepare('SELECT last,host_user FROM duel_rooms WHERE code=?').bind(code).first();
    if (r && now - r.last < ROOM_TTL && r.host_user !== user.id) return bad('Mã phòng đã được dùng', 409);
    await env.DB.prepare("INSERT INTO duel_rooms (code,host_user,last,created,name,subj,n,phase) VALUES (?,?,?,?,?,?,1,'wait') ON CONFLICT(code) DO UPDATE SET host_user=excluded.host_user,last=excluded.last,created=excluded.created,name=excluded.name,subj=excluded.subj,n=1,phase='wait'").bind(code, user.id, now, now, String(d.name || user.name || 'Chủ phòng').slice(0, 24), String(d.subj || '').slice(0, 40)).run();
    await env.DB.prepare('DELETE FROM duel_msgs WHERE code=?').bind(code).run();
    await env.DB.prepare('DELETE FROM duel_peers WHERE code=?').bind(code).run();
    await logEvent(env, request, user, 'duel_host', null, { code, name: d.name || '' });
    return json({ ok: true });
  }

  if (action === 'close') {
    const r = await env.DB.prepare('SELECT host_user FROM duel_rooms WHERE code=?').bind(code).first();
    if (r && r.host_user === user.id) {
      await env.DB.prepare('DELETE FROM duel_rooms WHERE code=?').bind(code).run();
      await env.DB.prepare('DELETE FROM duel_msgs WHERE code=?').bind(code).run();
      await env.DB.prepare('DELETE FROM duel_peers WHERE code=?').bind(code).run();
    }
    return json({ ok: true });
  }

  if (action === 'join') {
    if (!okId(d.id)) return bad('Dữ liệu không hợp lệ');
    if (!(await roomAlive(env, code, now))) return bad('Không tìm thấy phòng', 404);
    await env.DB.prepare('INSERT INTO duel_peers (code,id,last,gone) VALUES (?,?,?,0) ON CONFLICT(code,id) DO UPDATE SET last=excluded.last,gone=0').bind(code, d.id, now).run();
    await env.DB.prepare('INSERT INTO duel_msgs (code,to_id,body,ts) VALUES (?,?,?,?)').bind(code, 'host', JSON.stringify({ f: d.id, m: { $: 'join' } }), now).run();
    await logEvent(env, request, user, 'duel_join', null, { code });
    return json({ ok: true });
  }

  if (action === 'send') {
    if (!okId(d.from) || !okId(d.to) || typeof d.body !== 'string' || d.body.length > MAX_BODY) return bad('Dữ liệu không hợp lệ');
    if (!(await roomAlive(env, code, now))) return bad('Phòng đã đóng', 404);
    await env.DB.prepare('INSERT INTO duel_msgs (code,to_id,body,ts) VALUES (?,?,?,?)').bind(code, d.to, JSON.stringify({ f: d.from, m: JSON.parse(d.body) }), now).run();
    return json({ ok: true });
  }

  if (action === 'poll') {
    if (!okId(d.me)) return bad('Dữ liệu không hợp lệ');
    const after = Math.max(0, +d.after || 0), isHost = d.me === 'host';
    let gone = [], hostAlive = true, kicked = false;
    if (isHost) {
      const r = await env.DB.prepare('SELECT host_user,last FROM duel_rooms WHERE code=?').bind(code).first();
      if (!r || r.host_user !== user.id) return json({ closed: true, msgs: [], gone: [], after });
      const mt = d.meta && typeof d.meta === 'object' ? d.meta : null;
      if (mt) await env.DB.prepare('UPDATE duel_rooms SET last=?,n=?,phase=?,name=COALESCE(?,name) WHERE code=?').bind(now, Math.max(1, Math.min(8, +mt.n || 1)), String(mt.phase || 'wait').slice(0, 10), mt.name ? String(mt.name).slice(0, 24) : null, code).run();
      else if (now - r.last > 3000) await env.DB.prepare('UPDATE duel_rooms SET last=? WHERE code=?').bind(now, code).run();
      const stale = (await env.DB.prepare('SELECT id FROM duel_peers WHERE code=? AND gone=0 AND last<?').bind(code, now - PEER_TTL).all()).results || [];
      gone = stale.map(x => x.id);
      for (const id of gone) await env.DB.prepare('UPDATE duel_peers SET gone=1 WHERE code=? AND id=?').bind(code, id).run();
    } else {
      hostAlive = await roomAlive(env, code, now);
      const p = await env.DB.prepare('SELECT last,gone FROM duel_peers WHERE code=? AND id=?').bind(code, d.me).first();
      if (!p) kicked = true;
      else if (p.gone) kicked = true;
      else if (now - p.last > 4000) await env.DB.prepare('UPDATE duel_peers SET last=? WHERE code=? AND id=?').bind(now, code, d.me).run();
    }
    const rows = (await env.DB.prepare('SELECT id,body FROM duel_msgs WHERE code=? AND to_id=? AND id>? ORDER BY id LIMIT 100').bind(code, d.me, after).all()).results || [];
    return json({ msgs: rows.map(r => ({ id: r.id, body: r.body })), after: rows.length ? rows[rows.length - 1].id : after, gone, hostAlive, kicked });
  }

  return bad('Không tìm thấy', 404);
}
