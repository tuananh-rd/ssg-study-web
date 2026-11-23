import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 60)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
patch('functions/_serve.js', [[`<script src="/chat.js?v=1" defer></script></body>`, `<script src="/chat.js?v=1" defer></script><script src="/whatsnew.js?v=1" defer></script></body>`]]);
patch('public/index.html', [
  // nạp chat + thông báo cập nhật sau khi đăng nhập
  [`function boot(){`, `function loadExtras(){
  ['chat.js','whatsnew.js'].forEach(function(f){var id='x-'+f;if(document.getElementById(id)){if(f==='chat.js'&&window.WebChat)window.WebChat.start();if(f==='whatsnew.js'&&window.WebWhatsNew)window.WebWhatsNew.start();return;}var s=document.createElement('script');s.id=id;s.src='/'+f+'?v=1';document.body.appendChild(s);});
}
function boot(){`],
  [`    ME=j.user;SUBJ=j.subjects;acctInit();`, `    ME=j.user;SUBJ=j.subjects;acctInit();loadExtras();`],
  [`ME=null;authView('login');});`, `ME=null;if(window.WebChat)window.WebChat.stop();authView('login');});`],
  // mục "Có gì mới" trong menu tài khoản
  [`[['key','Đổi mật khẩu',function(){pwView(false);}]`, `[['list','Có gì mới',function(){if(window.WebWhatsNew)window.WebWhatsNew.open();}],['key','Đổi mật khẩu',function(){pwView(false);}]`],
]);
patch('scripts/logview.js', [
  [`admin_log_view:['QT xem nhật ký','adm']};`, `admin_log_view:['QT xem nhật ký','adm'],chat_send:['Nhắn chat chung',''],chat_delete:['QT xoá tin chat','adm']};`],
  [`['Quản trị','admin_user_update,admin_reset_password,admin_user_delete,admin_log_view']`, `['Chat','chat_send,chat_delete'],['Quản trị','admin_user_update,admin_reset_password,admin_user_delete,admin_log_view']`],
  [`  if(t==='admin_log_view')`, `  if(t==='chat_send')return '“'+esc(d.q||'')+'” <span class="muted">('+esc(d.len)+' ký tự)</span>';
  if(t==='chat_delete')return 'Xoá tin #'+esc(d.msg)+' của tài khoản #'+esc(d.of)+': “'+esc(d.q||'')+'”';
  if(t==='admin_log_view')`],
]);
patch('public/index.html', [
  [`admin_log_view:['QT xem nhật ký','adm']};`, `admin_log_view:['QT xem nhật ký','adm'],chat_send:['Nhắn chat chung',''],chat_delete:['QT xoá tin chat','adm']};`],
  [`['Quản trị','admin_user_update,admin_reset_password,admin_user_delete,admin_log_view']`, `['Chat','chat_send,chat_delete'],['Quản trị','admin_user_update,admin_reset_password,admin_user_delete,admin_log_view']`],
  [`  if(t==='admin_log_view')`, `  if(t==='chat_send')return '“'+esc(d.q||'')+'” <span class="muted">('+esc(d.len)+' ký tự)</span>';
  if(t==='chat_delete')return 'Xoá tin #'+esc(d.msg)+' của tài khoản #'+esc(d.of)+': “'+esc(d.q||'')+'”';
  if(t==='admin_log_view')`],
]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
