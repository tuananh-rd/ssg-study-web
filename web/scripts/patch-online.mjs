import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 70)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
const TBL = `CREATE TABLE IF NOT EXISTS presence (user_id INTEGER PRIMARY KEY, ts INTEGER NOT NULL);\n`;
patch('schema.sql', [[`-- Chat chung`, `-- Người đang online (cập nhật mỗi khi trình duyệt hỏi máy chủ, giới hạn 1 lần/20 giây)\n${TBL}\n-- Chat chung`]]);
fs.writeFileSync(W + 'migrate-presence.sql', `-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-presence.sql\n${TBL}`);
patch('functions/_chat.js', [
  [`export async function handleChat(request, env, user, sub, readJson) {
  const m = request.method;`, `const ONLINE_MS = 45000, TOUCH_MS = 20000;
/** Đánh dấu người dùng đang online; chỉ ghi khi bản ghi cũ hơn 20 giây để tiết kiệm ghi D1. */
export async function touchPresence(env, user) {
  try { const now = Date.now(); await env.DB.prepare('INSERT INTO presence (user_id,ts) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET ts=excluded.ts WHERE presence.ts < ?').bind(user.id, now, now - TOUCH_MS).run(); } catch (e) { console.error('presence', e && e.message); }
}
async function onlineCount(env) { const r = await env.DB.prepare("SELECT COUNT(*) n FROM presence p JOIN users u ON u.id=p.user_id WHERE p.ts>? AND u.status='active'").bind(Date.now() - ONLINE_MS).first(); return r ? r.n : 0; }

export async function handleChat(request, env, user, sub, readJson) {
  const m = request.method;
  if (m === 'GET' && sub === 'online') {
    await touchPresence(env, user);
    const rows = (await env.DB.prepare("SELECT u.id,u.name,u.role,p.ts FROM presence p JOIN users u ON u.id=p.user_id WHERE p.ts>? AND u.status='active' ORDER BY (u.role='admin') DESC, u.name COLLATE NOCASE LIMIT 200").bind(Date.now() - ONLINE_MS).all()).results;
    return json({ users: rows.map(r => ({ id: r.id, name: r.name, role: r.role, ts: r.ts })), me: user.id });
  }`],
  [`    const rl = await env.DB.prepare('SELECT id,msg FROM reload_cmds`, `    await touchPresence(env, user); out.on = await onlineCount(env);
    const rl = await env.DB.prepare('SELECT id,msg FROM reload_cmds`],
]);
patch('functions/api/[[path]].js', [
  [`import { handleChat } from '../_chat.js';`, `import { handleChat, touchPresence } from '../_chat.js';`],
  [`    if (a === 'live' && m === 'GET') {`, `    if (a === 'live' && m === 'GET') {
      await touchPresence(env, user);`],
]);
patch('public/chat.js', [
  [`<div class="h"><b>Chat chung<small id="wc-sub"></small></b><button class="ib" id="wc-mute"`, `<div class="h"><b>Chat chung<small id="wc-sub"></small></b><button class="wc-onb" id="wc-onb" type="button" title="Xem ai đang online" aria-pressed="false"><i class="wc-dot"></i><span id="wc-onn">0</span> online</button><button class="ib" id="wc-mute"`],
  [`<div id="wc-list" aria-live="polite"></div>`, `<div id="wc-list" aria-live="polite"></div><div id="wc-on" hidden></div>`],
  [`  $('#wc-x').onclick=function(){toggle(false);};`, `  $('#wc-onb').onclick=function(){toggleOn();};
  $('#wc-x').onclick=function(){toggle(false);};`],
  [`function reloadCheck(j,initial){`, `function toggleOn(on){
  A.onOpen=on===undefined?!A.onOpen:!!on;var l=$('#wc-list'),o=$('#wc-on'),f=$('#wc-form'),b=$('#wc-onb');if(!l||!o)return;
  l.hidden=A.onOpen;o.hidden=!A.onOpen;f.style.display=A.onOpen?'none':'';if(b){b.classList.toggle('on',A.onOpen);b.setAttribute('aria-pressed',A.onOpen?'true':'false');}
  if(A.onOpen)loadOnline();else scrollEnd(true);
}
function loadOnline(){
  api('chat/online').then(function(j){
    if(j.error||!j.users)return;var o=$('#wc-on');if(!o)return;A.on=j.users.length;var n=$('#wc-onn');if(n)n.textContent=A.on;
    o.innerHTML='<div class="wc-onh">'+j.users.length+' người đang online</div>'+(j.users.length?j.users.map(function(u){var me=u.id===ME.id;
      return '<div class="wc-ou"><span class="wc-av" style="background:hsl('+hue(u.name)+',55%,45%)">'+esc(u.name.trim().charAt(0).toUpperCase()||'?')+'<i class="wc-dot sm"></i></span><span class="wc-on-n">'+nameHtml({name:u.name,role:u.role})+(me?' <em class="wc-me">(Bạn)</em>':'')+'</span></div>';}).join(''):'<div class="wc-empty">Chưa có ai.</div>');
  }).catch(function(){});
}
function reloadCheck(j,initial){
  if(typeof j.on==='number'){A.on=j.on;var n=$('#wc-onn');if(n)n.textContent=j.on;if(A.onOpen&&A.n%2===0)loadOnline();}`],
  [`.wc-empty{`, `.wc-onb{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#ddd);background:var(--panel2,#f6f7fb);color:var(--text,#111);border-radius:999px;padding:4px 10px;font:600 .76rem system-ui,sans-serif;cursor:pointer}.wc-onb:hover,.wc-onb.on{border-color:var(--primary,#3b5bdb);color:var(--primary,#3b5bdb)}'+
'.wc-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#2fb344;box-shadow:0 0 0 0 rgba(47,179,68,.6);animation:wcpulse 2s infinite}.wc-dot.sm{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border:2px solid var(--panel,#fff);box-sizing:border-box;animation:none}'+
'@keyframes wcpulse{70%{box-shadow:0 0 0 6px rgba(47,179,68,0)}100%{box-shadow:0 0 0 0 rgba(47,179,68,0)}}'+
'#wc-on{flex:1;overflow-y:auto;padding:10px 14px;background:var(--panel2,#f6f7fb)}#wc-on[hidden]{display:none}.wc-onh{font:700 .78rem system-ui,sans-serif;color:var(--muted,#667);text-transform:uppercase;letter-spacing:.05em;margin:2px 0 10px}'+
'.wc-ou{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:10px}.wc-ou:hover{background:var(--panel,#fff)}.wc-av{position:relative;width:34px;height:34px;border-radius:50%;color:#fff;display:grid;place-items:center;font-weight:800;flex:none}.wc-on-n{display:flex;align-items:center;gap:6px;min-width:0;word-break:break-word}.wc-me{font-style:normal;color:var(--muted,#667);font-size:.8rem}'+
'#wc-list[hidden]{display:none}.wc-empty{`],
]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
