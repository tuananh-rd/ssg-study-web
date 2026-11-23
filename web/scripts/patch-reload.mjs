import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 60)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
const TBL = `CREATE TABLE IF NOT EXISTS reload_cmds (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, user_id INTEGER, by_id INTEGER, msg TEXT);\n`;
patch('schema.sql', [[`-- Chat chung`, `-- Lệnh yêu cầu tải lại trang (quản trị viên gửi cho một người hoặc mọi người)\n${TBL}\n-- Chat chung`]]);
fs.writeFileSync(W + 'migrate-reload.sql', `-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-reload.sql\n${TBL}`);
patch('functions/_chat.js', [[`    return json(out);
  }
  if (m === 'POST' && !sub) {`, `    const rl = await env.DB.prepare('SELECT id,msg FROM reload_cmds WHERE ts>? AND (user_id IS NULL OR user_id=?) ORDER BY id DESC LIMIT 1').bind(Date.now() - 600000, user.id).first();
    out.rl = rl ? rl.id : 0; if (rl) out.rlmsg = rl.msg || '';
    return json(out);
  }
  if (m === 'POST' && !sub) {`]]);
patch('functions/api/[[path]].js', [[`      if (b === 'logs' && m === 'GET')`, `      if (b === 'reload' && m === 'POST') {
        const d = await readJson(request); if (!d) return bad('Dữ liệu không hợp lệ');
        const target = d.user_id ? +d.user_id : null, msg = String(d.msg || '').slice(0, 120);
        if (target && !(await env.DB.prepare("SELECT 1 FROM users WHERE id=? AND status='active'").bind(target).first())) return bad('Không tìm thấy người dùng đang hoạt động', 404);
        const last = await env.DB.prepare('SELECT ts FROM reload_cmds WHERE by_id=? ORDER BY id DESC LIMIT 1').bind(user.id).first();
        if (last && Date.now() - last.ts < 5000) return bad('Gửi quá nhanh, đợi vài giây', 429);
        await env.DB.prepare('INSERT INTO reload_cmds (ts,user_id,by_id,msg) VALUES (?,?,?,?)').bind(Date.now(), target, user.id, msg).run();
        await logEvent(env, request, user, 'admin_reload', null, { target: target || 'tất cả', msg });
        return json({ ok: true });
      }
      if (b === 'logs' && m === 'GET')`]]);
// phía người dùng
patch('public/chat.js', [
  [`    if(j.$s===401){stop();return;}if(j.error)return;ingest(j,initial,own);`, `    if(j.$s===401){stop();return;}if(j.error)return;reloadCheck(j,initial);ingest(j,initial,own);`],
  [`function poll(now,own){`, `function reloadCheck(j,initial){
  var id=+j.rl||0;if(initial){A.rl=id;return;}if(id>(A.rl||0)){A.rl=id;reloadAsk(j.rlmsg||'');}
}
function reloadAsk(msg){
  if(document.getElementById('wc-rl'))return;var left=8,b=document.createElement('div');b.id='wc-rl';b.setAttribute('role','alertdialog');
  b.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:300;max-width:min(460px,calc(100vw - 24px));background:var(--panel,#fff);color:var(--text,#111);border:1px solid var(--primary,#3b5bdb);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.35);padding:12px 16px;font:inherit;font-size:.92rem';
  b.innerHTML='<b>Quản trị viên yêu cầu tải lại trang</b><div style="color:var(--muted,#667);margin:4px 0 10px">'+(msg?esc(msg)+' · ':'')+'Tiến độ làm bài đã được lưu. Tự tải lại sau <span id="wc-rlc">'+left+'</span> giây.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" id="wc-rln" style="border:1px solid var(--line,#ddd);background:var(--panel2,#f6f7fb);color:inherit;border-radius:9px;padding:7px 14px;cursor:pointer;font:600 .86rem system-ui">Hoãn</button><button type="button" id="wc-rly" style="border:0;background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));border-radius:9px;padding:7px 14px;cursor:pointer;font:700 .86rem system-ui">Tải lại ngay</button></div>';
  document.body.appendChild(b);
  var t=setInterval(function(){left--;var c=document.getElementById('wc-rlc');if(c)c.textContent=left;if(left<=0){clearInterval(t);location.reload();}},1000);
  document.getElementById('wc-rly').onclick=function(){clearInterval(t);location.reload();};
  document.getElementById('wc-rln').onclick=function(){clearInterval(t);b.remove();};
}
function poll(now,own){`],
]);
// giao diện quản trị
const idx = 'public/index.html';
patch(idx, [
  [`'<button class="btn sm" data-a="reset">Cấp lại mật khẩu</button>'+`, `'<button class="btn sm" data-a="reset">Cấp lại mật khẩu</button>'+(u.status==='active'?'<button class="btn sm" data-a="reload" title="Yêu cầu trình duyệt của người này tải lại trang">Tải lại trang của họ</button>':'')+`],
  [`    else if(a==='logs'){`, `    else if(a==='reload'){if(confirm('Yêu cầu trình duyệt của người này tải lại trang? (Họ sẽ thấy thông báo đếm ngược 8 giây và có thể hoãn.)'))api('admin/reload','POST',{user_id:+id}).then(function(j){if(j.error)alert(j.error);else{b.textContent='Đã gửi ✓';setTimeout(function(){b.textContent='Tải lại trang của họ';},2500);}});}
    else if(a==='logs'){`],
  [`<button class="btn" id="back">Quay lại danh sách môn</button></div>`, `<button class="btn" id="reloadall" title="Yêu cầu mọi người đang online tải lại trang">Yêu cầu mọi người tải lại</button><button class="btn" id="back">Quay lại danh sách môn</button></div>`],
  [`  document.getElementById('back').onclick=hub;load();`, `  document.getElementById('back').onclick=hub;load();
  document.getElementById('reloadall').onclick=function(){var m=prompt('Gửi yêu cầu tải lại trang tới TẤT CẢ người dùng đang mở web.\\nLời nhắn kèm theo (có thể để trống):','Web vừa có bản cập nhật mới');if(m===null)return;api('admin/reload','POST',{msg:m}).then(function(j){alert(j.error||'Đã gửi yêu cầu tải lại tới mọi người.');});};`],
  [`admin_log_view:['QT xem nhật ký','adm'],`, `admin_log_view:['QT xem nhật ký','adm'],admin_reload:['QT yêu cầu tải lại','adm'],`],
  [`  if(t==='admin_log_view')`, `  if(t==='admin_reload')return 'Gửi tới <b>'+esc(d.target)+'</b>'+(d.msg?': “'+esc(d.msg)+'”':'');
  if(t==='admin_log_view')`],
  [`admin_user_delete,admin_log_view']`, `admin_user_delete,admin_log_view,admin_reload']`],
]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
