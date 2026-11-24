/* ---------- nhật ký hoạt động (chỉ quản trị viên được cấp quyền) ---------- */
var LOGT={login_ok:['Đăng nhập','ok'],login_fail:['Đăng nhập sai','bad'],login_blocked:['Đăng nhập bị chặn','bad'],logout:['Đăng xuất',''],register:['Đăng ký mới','ok'],password_change:['Đổi mật khẩu',''],
 app_open:['Mở môn',''],access_denied:['Bị từ chối môn','bad'],quiz_answer:['Trả lời câu',''],quiz_finish:['Xong bài','ok'],exam_finish:['Nộp bài thi thử','ok'],lesson_view:['Đọc lý thuyết',''],focus_session:['Phiên tập trung',''],
 search:['Tra cứu',''],ai_chat:['Hỏi Bố Tuấn Anh','ai'],ai_translate:['Dịch bằng AI','ai'],duel_host:['Tạo phòng đấu',''],duel_join:['Vào phòng đấu',''],duel_finish:['Xong trận đấu','ok'],
 admin_user_update:['QT sửa tài khoản','adm'],admin_reset_password:['QT cấp lại mật khẩu','adm'],admin_user_delete:['QT xoá tài khoản','adm'],admin_log_view:['QT xem nhật ký','adm'],chat_send:['Nhắn chat chung',''],chat_delete:['QT xoá tin chat','adm']};
var LOGSTUDY='quiz_answer,quiz_finish,exam_finish,lesson_view,focus_session,duel_finish,ai_chat,ai_translate';
var LOGG=[['Học tập',LOGSTUDY],['Điểm','@scores'],['Tất cả',''],['Đăng nhập & mở môn','login_ok,login_fail,login_blocked,logout,register,password_change,access_denied,app_open'],['Làm bài','quiz_answer,quiz_finish,exam_finish'],['Đọc & tập trung','lesson_view,focus_session'],['AI & tra cứu','ai_chat,ai_translate,search'],['Thi đấu','duel_host,duel_join,duel_finish'],['Chat','chat_send,chat_delete'],['Quản trị','admin_user_update,admin_reset_password,admin_user_delete,admin_log_view']];
function fmtS(t){return new Date(t).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});}
function jd(s){try{return s?JSON.parse(s):{};}catch(e){return {raw:s};}}
function logText(r){
  var d=jd(r.detail),t=r.type;
  function sec(s){s=+s||0;return s>=60?Math.floor(s/60)+' phút '+(s%60)+' giây':s+' giây';}
  if(t==='quiz_answer')return 'Câu #'+esc(d.id)+' — '+(d.ok?'<b style="color:var(--ok)">đúng</b>':'<b style="color:var(--bad)">sai</b>')+' <span class="muted">('+esc(d.src==='bank'?'bộ đề':d.src||'')+(d.mod?' · '+esc(d.mod):'')+(d.ref?' · §'+esc(d.ref):'')+(d.retry?' · hỏi lại':'')+')</span>';
  if(t==='quiz_finish')return '“'+esc(d.title||'')+'”: <b>'+esc(d.score)+'/'+esc(d.n)+'</b> đúng, sửa lại '+esc(d.fixed||0)+' câu, mất '+sec(d.secs);
  if(t==='exam_finish')return 'Điểm <b>'+esc(d.score)+'</b> ('+esc(d.right)+'/'+esc(d.total)+')'+(d.auto?' · tự nộp khi hết giờ':'');
  if(t==='lesson_view')return 'Chương <b>'+esc(d.mod)+'</b>'+(d.s?' · mục '+esc(d.s):'');
  if(t==='focus_session')return 'Tập trung <b>'+esc(d.min)+'</b> phút';
  if(t==='search')return '“'+esc(d.q)+'” <span class="muted">('+esc(d.tab==='img'?'hình ảnh':'tất cả')+' · '+esc(d.lang)+')</span>';
  if(t==='ai_chat'||t==='ai_translate')return '“'+esc(d.q||'')+'” <span class="muted">('+esc(d.len)+' ký tự gửi đi)</span>';
  if(t==='duel_host'||t==='duel_join')return 'Phòng <b>'+esc(d.code)+'</b>'+(d.name?' · '+esc(d.name):'');
  if(t==='duel_finish')return 'Hạng <b>'+esc(d.rank)+'/'+esc(d.players)+'</b>, '+esc(d.score)+' điểm, đúng '+esc(d.right)+'/'+esc(d.total);
  if(t==='login_fail'||t==='login_blocked')return esc(d.email||'')+' <span class="muted">— '+esc(d.why||'')+'</span>';
  if(t==='register')return esc(d.name||'')+' <span class="muted">'+esc(d.email||'')+'</span>';
  if(t==='admin_user_update'){var c=d.changes||{},p=[];Object.keys(c).forEach(function(k){if(c[k]!==undefined&&c[k]!==null)p.push(k+'='+(Array.isArray(c[k])?c[k].join('/'):c[k]));});return 'Tài khoản <b>'+esc(d.target)+'</b>: '+esc(p.join(', '));}
  if(t==='admin_reset_password')return 'Tài khoản #'+esc(d.target);
  if(t==='admin_user_delete')return 'Đã xoá <b>'+esc(d.target)+'</b>';
  if(t==='chat_send')return '“'+esc(d.q||'')+'” <span class="muted">('+esc(d.len)+' ký tự)</span>';
  if(t==='chat_delete')return 'Xoá tin #'+esc(d.msg)+' của tài khoản #'+esc(d.of)+': “'+esc(d.q||'')+'”';
  if(t==='admin_log_view')return '<span class="muted">Mở nhật ký</span>';
  return r.detail?'<span class="muted">'+esc(r.detail.slice(0,160))+'</span>':'';
}
function uaShort(u){u=u||'';var b=/Edg\//.test(u)?'Edge':/OPR\//.test(u)?'Opera':/Chrome\//.test(u)?'Chrome':/Firefox\//.test(u)?'Firefox':/Safari\//.test(u)?'Safari':'?';var o=/Windows/.test(u)?'Windows':/Android/.test(u)?'Android':/iPhone|iPad/.test(u)?'iOS':/Mac OS/.test(u)?'macOS':/Linux/.test(u)?'Linux':'';return b+(o?' · '+o:'');}
function logView(){
  acctInit();
  var F={user:'',type:LOGSTUDY,subject:'',q:'',from:'',to:''},rows=[],next=null,timer=null,users=[];
  root.innerHTML='<div class="pagehead"><div><h1>Nhật ký hoạt động</h1><p>Theo dõi chi tiết hoạt động của người dùng. Chỉ quản trị viên được cấp quyền mới xem được; mỗi lần mở nhật ký cũng được ghi lại. Mặc định chỉ hiện hoạt động học tập; chọn “Tất cả” để xem cả đăng nhập, chat, quản trị. Dữ liệu giữ 90 ngày.</p></div><span class="sp"></span><button class="btn" id="lback">Quay lại</button></div>'+
   '<div id="lsum" class="lsum"></div><div class="card" style="padding:14px 16px;margin-bottom:14px"><div class="lflt"><select id="fu"><option value="">Mọi người dùng</option></select><select id="fs"><option value="">Mọi môn</option>'+Object.keys(NAMES).map(function(k){return '<option value="'+k+'">'+NAMES[k]+'</option>';}).join('')+'</select>'+
   '<input id="fq" type="search" placeholder="Tìm trong chi tiết, email, IP…"><label class="muted" style="font-size:.84rem">Từ <input id="ff" type="date"></label><label class="muted" style="font-size:.84rem">đến <input id="ft" type="date"></label></div>'+
   '<div class="lchips" id="lch"></div><div class="acts" style="margin-top:10px"><button class="btn sm" id="lre">Làm mới</button><label class="chk"><input type="checkbox" id="lauto"> Tự làm mới 10 giây</label><button class="btn sm" id="lcsv">Xuất CSV</button></div></div>'+
   '<div class="card" style="padding:6px 16px"><div id="ltb">Đang tải…</div></div>';
  document.getElementById('lback').onclick=function(){clearInterval(timer);hub();};
  var ch=document.getElementById('lch');ch.innerHTML=LOGG.map(function(g,i){return '<button type="button" class="lchip'+(i===0?' on':'')+'" data-t="'+g[1]+'">'+g[0]+'</button>';}).join('');
  [].forEach.call(ch.querySelectorAll('.lchip'),function(b){b.onclick=function(){F.type=b.dataset.t;[].forEach.call(ch.children,function(x){x.classList.toggle('on',x===b);});reload();};});
  function qs(extra){var p=[];['user','type','subject','q'].forEach(function(k){if(F[k])p.push(k+'='+encodeURIComponent(F[k]));});if(F.from)p.push('from='+new Date(F.from+'T00:00:00').getTime());if(F.to)p.push('to='+(new Date(F.to+'T23:59:59').getTime()));return p.concat(extra||[]).join('&');}
  function summary(){api('admin/logs/summary').then(function(j){var el=document.getElementById('lsum');if(!el)return;if(j.error){el.innerHTML='';return;}
    el.innerHTML='<div class="lcard"><b>'+j.events24h+'</b><span>sự kiện 24 giờ</span></div><div class="lcard"><b>'+j.active24h+'</b><span>người hoạt động 24 giờ</span></div><div class="lcard'+(j.fails24h?' warn':'')+'"><b>'+j.fails24h+'</b><span>đăng nhập thất bại 24 giờ</span></div>'+
     '<div class="lcard wide"><span>Hoạt động nhiều nhất 7 ngày</span><div>'+(j.topUsers.map(function(u){return '<button type="button" class="lchip" data-u="'+u.user_id+'">'+esc(u.email)+' · '+u.n+'</button>';}).join('')||'<span class="muted">Chưa có</span>')+'</div></div>';
    [].forEach.call(el.querySelectorAll('[data-u]'),function(b){b.onclick=function(){F.user=b.dataset.u;document.getElementById('fu').value=F.user;reload();};});});}
  function draw(){var tb=document.getElementById('ltb');if(!tb)return;
    if(!rows.length){tb.innerHTML='<p class="muted" style="padding:14px 4px">Không có sự kiện nào khớp bộ lọc.</p>';return;}
    tb.innerHTML='<table class="ltable"><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Sự kiện</th><th>Môn</th><th>Chi tiết</th><th>Thiết bị / IP</th></tr></thead><tbody>'+rows.map(function(r){var T=LOGT[r.type]||[r.type,''];
      return '<tr><td class="nw">'+fmtS(r.ts)+'</td><td>'+(r.user_id?'<a href="#" data-u="'+r.user_id+'">'+esc(r.email||('#'+r.user_id))+'</a>':'<span class="muted">'+esc(r.email||'(chưa đăng nhập)')+'</span>')+'</td><td><span class="lt '+T[1]+'">'+esc(T[0])+'</span></td><td>'+(r.subject?esc(NAMES[r.subject]||r.subject):'')+'</td><td>'+logText(r)+'</td><td class="muted" style="font-size:.8em">'+esc(uaShort(r.ua))+'<br>'+esc(r.ip||'')+'</td></tr>';}).join('')+'</tbody></table>'+(next?'<div style="text-align:center;padding:12px"><button class="btn" id="lmore">Tải thêm</button></div>':'<p class="muted" style="text-align:center;padding:8px">— hết —</p>');
    [].forEach.call(tb.querySelectorAll('[data-u]'),function(a){a.onclick=function(e){e.preventDefault();F.user=a.dataset.u;document.getElementById('fu').value=F.user;reload();};});
    var m=document.getElementById('lmore');if(m)m.onclick=function(){m.disabled=true;load(true);};}
  function load(more){api('admin/logs?'+qs(['limit=80'].concat(more&&next?['before='+next]:[]))).then(function(j){if(j.error){document.getElementById('ltb').innerHTML='<div class="msg err">'+esc(j.error)+'</div>';return;}rows=more?rows.concat(j.rows):j.rows;next=j.more?j.next:null;draw();});}
  function reload(){rows=[];next=null;if(F.type==='@scores'){loadScores();return;}load(false);}
  function loadScores(){var tb=document.getElementById('ltb');if(!tb)return;tb.innerHTML='Đang tải…';
    api('admin/logs/scores'+(F.user?'?user='+encodeURIComponent(F.user):'')).then(function(j){if(!document.getElementById('ltb'))return;if(j.error){tb.innerHTML='<div class="msg err">'+esc(j.error)+'</div>';return;}
      var nm=function(r){return esc(r.name||'')+' <span class="muted">'+esc(r.email||'')+'</span>'+(r.no_rank?' <span class="lt">không tính điểm</span>':'');};
      tb.innerHTML='<h3 style="margin:10px 0 6px">Tổng điểm từng người</h3><table class="ltable"><thead><tr><th>Người dùng</th><th>Tổng điểm</th><th>Câu quiz</th><th>Phút đọc</th></tr></thead><tbody>'+j.totals.map(function(t){return '<tr><td><a href="#" data-su="'+t.user_id+'">'+nm(t)+'</a></td><td><b>'+t.pts+'</b></td><td>'+t.quiz+'</td><td>'+Math.floor(t.rsec/60)+'</td></tr>';}).join('')+'</tbody></table>'+
       '<h3 style="margin:18px 0 6px">Điểm theo ngày'+(F.user?' (một người)':'')+'</h3><table class="ltable"><thead><tr><th>Ngày</th><th>Người dùng</th><th>Quiz (đúng)</th><th>Đọc (phút)</th><th>Thi thử</th><th>Thi đấu</th><th>Tập trung</th><th>Điểm</th></tr></thead><tbody>'+j.rows.map(function(r){return '<tr><td class="nw">'+esc(r.day)+'</td><td>'+nm(r)+'</td><td>'+r.quiz+' ('+r.ok+')</td><td>'+Math.floor(r.read_sec/60)+'</td><td>'+r.exam_pts+'</td><td>'+r.duel_pts+'</td><td>'+r.focus_min+'</td><td><b>'+r.pts+'</b></td></tr>';}).join('')+'</tbody></table><p class="muted" style="font-size:.82rem">Ngày 2026-10-01 là điểm bù từ tiến độ đã lưu trước khi có nhật ký.</p>';
      [].forEach.call(tb.querySelectorAll('[data-su]'),function(a){a.onclick=function(e){e.preventDefault();F.user=a.dataset.su;document.getElementById('fu').value=F.user;reload();};});});}
  api('admin/users').then(function(j){if(j.error)return;users=j.users;var s=document.getElementById('fu');if(!s)return;users.forEach(function(u){var o=document.createElement('option');o.value=u.id;o.textContent=u.name+' — '+u.email;s.appendChild(o);});s.value=F.user;});
  document.getElementById('fu').onchange=function(){F.user=this.value;reload();};document.getElementById('fs').onchange=function(){F.subject=this.value;reload();};
  var qt=null;document.getElementById('fq').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){F.q=v;reload();},350);};
  document.getElementById('ff').onchange=function(){F.from=this.value;reload();};document.getElementById('ft').onchange=function(){F.to=this.value;reload();};
  document.getElementById('lre').onclick=function(){summary();reload();};
  document.getElementById('lauto').onchange=function(){clearInterval(timer);if(this.checked)timer=setInterval(function(){if(!document.getElementById('ltb')){clearInterval(timer);return;}summary();reload();},10000);};
  document.getElementById('lcsv').onclick=function(){var q=qs(['limit=200']);api('admin/logs?'+q).then(function(j){if(j.error){alert(j.error);return;}var lines=[['thoi_gian','nguoi_dung','email','su_kien','mon','chi_tiet','ip','thiet_bi']].concat(j.rows.map(function(r){return [new Date(r.ts).toISOString(),r.user_id||'',r.email||'',r.type,r.subject||'',r.detail||'',r.ip||'',r.ua||''];})).map(function(a){return a.map(function(c){c=String(c);if(/^[=+\-@\t\r]/.test(c))c="'"+c;return '"'+c.replace(/"/g,'""')+'"';}).join(',');});
    var b=new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='nhat-ky-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);});};
  summary();reload();
}
