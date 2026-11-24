/* Chat chung của web: icon + bảng chat, thông báo, xem trước, tắt thông báo. Tự khởi động khi đã đăng nhập. */
(function(){
if(window.WebChat)return;
var ME=null,A={panelOpen:false,muted:false,unread:0,max:0,msgs:[],lastRead:0,timer:null,n:0,busy:false,started:false,ready:false,prevT:0,baseTitle:'',dead:false};
function $(s,r){return (r||document).querySelector(s);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}return null;}
function api(path,method,body){return fetch('/api/'+path,{method:method||'GET',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Requested-With':'ssg-web'},body:body?JSON.stringify(body):undefined}).then(function(r){return r.json().catch(function(){return {};}).then(function(j){j.$s=r.status;return j;});});}
var ICON={chat:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 bell:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
 bellOff:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.7 3A6 6 0 0 1 18 8c0 2.2.3 4 .8 5.4M6.3 6.3C6.1 6.8 6 7.4 6 8c0 7-3 9-3 9h14M10.3 21a1.9 1.9 0 0 0 3.4 0M2 2l20 20"/></svg>',
 x:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
 send:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
 shield:'<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/></svg>'};
var CSS='#wc-fab{position:fixed;left:18px;bottom:20px;z-index:80;width:50px;height:50px;border-radius:50%;border:0;background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 20px rgba(15,23,42,.3);transition:transform .15s}#wc-fab:hover{transform:scale(1.06)}'+
'#wc-badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:#e03131;color:#fff;font:700 .72rem/20px system-ui,sans-serif;text-align:center;border:2px solid var(--panel,#fff);box-sizing:content-box;display:none}#wc-badge.on{display:block;animation:wcpop .25s}'+
'@keyframes wcpop{from{transform:scale(.4)}to{transform:scale(1)}}'+
'#wc-fab.muted::after{content:"";position:absolute;right:2px;bottom:2px;width:14px;height:14px;border-radius:50%;background:var(--panel,#fff) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'3\' stroke-linecap=\'round\'><path d=\'M2 2l20 20\'/></svg>") center/9px no-repeat;border:1px solid var(--line,#ddd)}'+
'#wc-prev{position:fixed;left:18px;bottom:80px;z-index:81;max-width:min(320px,calc(100vw - 36px));display:none;background:var(--panel,#fff);color:var(--text,#111);border:1px solid var(--line,#ddd);border-radius:14px 14px 14px 4px;box-shadow:0 10px 30px rgba(15,23,42,.25);padding:9px 12px;cursor:pointer;animation:wcin .22s ease}#wc-prev.on{display:block}'+
'@keyframes wcin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'+
'#wc-prev b{display:block;font-size:.82rem}#wc-prev span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.88rem;line-height:1.35;word-break:break-word;color:var(--muted,#667)}#wc-prev i{font-style:normal;font-size:.72rem;color:var(--primary,#3b5bdb);font-weight:700}'+
'#wc-panel{position:fixed;left:18px;bottom:80px;z-index:82;width:min(380px,calc(100vw - 24px));height:min(540px,calc(100vh - 110px));display:none;flex-direction:column;background:var(--panel,#fff);color:var(--text,#111);border:1px solid var(--line,#ddd);border-radius:16px;box-shadow:0 18px 50px rgba(15,23,42,.35);overflow:hidden;font-family:inherit}#wc-panel.open{display:flex;animation:wcin .18s ease}'+
'#wc-panel .h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line,#ddd)}#wc-panel .h b{flex:1;font-size:1rem}#wc-panel .h small{display:block;font-weight:400;color:var(--muted,#667);font-size:.74rem}'+
'#wc-panel .ib{border:0;background:none;color:var(--muted,#667);cursor:pointer;padding:6px;border-radius:8px;display:inline-grid;place-items:center}#wc-panel .ib:hover{background:var(--panel2,#f1f4f9);color:var(--text,#111)}#wc-panel .ib.on{color:var(--primary,#3b5bdb)}'+
'#wc-list{flex:1;overflow-y:auto;padding:12px 12px 6px;display:flex;flex-direction:column;gap:2px;background:var(--panel2,#f6f7fb);scroll-behavior:auto}'+
'.wc-m{display:flex;flex-direction:column;max-width:86%;align-self:flex-start}.wc-m.me{align-self:flex-end;align-items:flex-end}.wc-m.first{margin-top:8px}'+
'.wc-h{display:flex;align-items:center;gap:6px;font-size:.78rem;margin:0 4px 2px}.wc-t{color:var(--muted,#667);font-size:.7rem}'+
'.wc-b{position:relative;padding:7px 11px;border-radius:14px;background:var(--panel,#fff);border:1px solid var(--line,#ddd);line-height:1.42;font-size:.92rem;white-space:pre-wrap;word-break:break-word}'+
'.wc-m.me .wc-b{background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));border-color:transparent}'+
'.wc-m.admin .wc-b{border-color:#f59f00;box-shadow:0 0 0 1px rgba(245,159,0,.25),0 2px 10px rgba(245,159,0,.12)}.wc-m.admin.me .wc-b{background:linear-gradient(135deg,#e8590c,#f08c00);color:#fff}'+
'.wc-del{position:absolute;top:-8px;right:-6px;width:20px;height:20px;border-radius:50%;border:1px solid var(--line,#ddd);background:var(--panel,#fff);color:#e03131;cursor:pointer;font-size:12px;line-height:1;display:none;padding:0}.wc-m:hover .wc-del{display:block}'+
/* hiệu ứng tên theo vai trò */
'.wc-n{font-weight:700}'+
'.wc-n.user{color:var(--wcc,var(--primary,#3b5bdb))}'+
'.wc-n.admin{background:linear-gradient(90deg,#f59f00,#ff6b6b,#f59f00,#ffd43b);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:wcshine 3s linear infinite;text-shadow:0 0 14px rgba(245,159,0,.35)}'+
'@keyframes wcshine{to{background-position:-250% 0}}'+
'.wc-tag{display:inline-flex;align-items:center;gap:3px;font:800 .62rem/1 system-ui,sans-serif;letter-spacing:.04em;padding:3px 6px;border-radius:5px;background:linear-gradient(135deg,#f59f00,#e8590c);color:#fff;-webkit-text-fill-color:#fff}'+
'#wc-jump{position:absolute;left:50%;transform:translateX(-50%);bottom:76px;z-index:2;display:none;border:0;border-radius:999px;padding:6px 14px;background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));font:700 .8rem system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}#wc-jump.on{display:block}'+
'#wc-form{display:flex;gap:8px;align-items:flex-end;padding:10px;border-top:1px solid var(--line,#ddd);background:var(--panel,#fff)}#wc-in{flex:1;resize:none;max-height:110px;border:1px solid var(--line,#ddd);border-radius:12px;padding:9px 12px;font:inherit;font-size:.92rem;background:var(--panel2,#f6f7fb);color:var(--text,#111);outline:0}#wc-in:focus{border-color:var(--primary,#3b5bdb)}'+
'#wc-send{border:0;background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));width:40px;height:40px;border-radius:12px;cursor:pointer;display:grid;place-items:center;flex:none}#wc-send:disabled{opacity:.5;cursor:default}'+
'.wc-onb{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#ddd);background:var(--panel2,#f6f7fb);color:var(--text,#111);border-radius:999px;padding:4px 10px;font:600 .76rem system-ui,sans-serif;cursor:pointer}.wc-onb:hover,.wc-onb.on{border-color:var(--primary,#3b5bdb);color:var(--primary,#3b5bdb)}'+
'.wc-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#2fb344;box-shadow:0 0 0 0 rgba(47,179,68,.6);animation:wcpulse 2s infinite}.wc-dot.sm{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border:2px solid var(--panel,#fff);box-sizing:border-box;animation:none}'+
'@keyframes wcpulse{70%{box-shadow:0 0 0 6px rgba(47,179,68,0)}100%{box-shadow:0 0 0 0 rgba(47,179,68,0)}}'+
'#wc-on{flex:1;overflow-y:auto;padding:10px 14px;background:var(--panel2,#f6f7fb)}#wc-on[hidden]{display:none}.wc-onh{font:700 .78rem system-ui,sans-serif;color:var(--muted,#667);text-transform:uppercase;letter-spacing:.05em;margin:2px 0 10px}'+
'.wc-ou{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:10px}.wc-ou:hover{background:var(--panel,#fff)}.wc-av{position:relative;width:34px;height:34px;border-radius:50%;color:#fff;display:grid;place-items:center;font-weight:800;flex:none}.wc-on-n{display:flex;align-items:center;gap:6px;min-width:0;word-break:break-word}.wc-me{font-style:normal;color:var(--muted,#667);font-size:.8rem}'+
'#wc-list[hidden]{display:none}.wc-empty{margin:auto;text-align:center;color:var(--muted,#667);font-size:.9rem;padding:20px}.wc-err{color:#e03131;font-size:.78rem;padding:0 12px 6px;background:var(--panel,#fff)}'+
'body.focus-mode #wc-fab,body.focus-mode #wc-prev{display:none!important}'+
'@media(max-width:760px){#wc-fab{left:14px;bottom:78px}#wc-prev{left:14px;bottom:138px}#wc-panel{left:0;right:0;bottom:0;top:0;width:100vw;height:100dvh;border-radius:0}.wc-del{display:block}}';
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h;}
function fmtT(t){var d=new Date(t),n=new Date(),hm=('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);return d.toDateString()===n.toDateString()?hm:('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+hm;}
function nameHtml(m){var cls=m.role==='admin'?'admin':'user';return '<span class="wc-n '+cls+'" style="--wcc:hsl('+hue(m.name)+',60%,42%)">'+esc(m.name)+'</span>'+(m.role==='admin'?'<span class="wc-tag">'+ICON.shield+'QTV</span>':'');}
function build(){
  if($('#wc-fab'))return;
  var st=document.createElement('style');st.id='wc-css';st.textContent=CSS;document.head.appendChild(st);
  var fab=document.createElement('button');fab.id='wc-fab';fab.type='button';fab.setAttribute('aria-label','Chat chung');fab.title='Chat chung';fab.innerHTML=ICON.chat+'<span id="wc-badge"></span>';
  var prev=document.createElement('div');prev.id='wc-prev';prev.setAttribute('role','status');
  var pn=document.createElement('aside');pn.id='wc-panel';pn.setAttribute('aria-label','Chat chung');
  pn.innerHTML='<div class="h"><b>Chat chung<small id="wc-sub"></small></b><button class="wc-onb" id="wc-onb" type="button" title="Xem ai đang online" aria-pressed="false"><i class="wc-dot"></i><span id="wc-onn">0</span> online</button><button class="ib" id="wc-mute" type="button"></button><button class="ib" id="wc-x" type="button" aria-label="Đóng">'+ICON.x+'</button></div><div id="wc-list" aria-live="polite"></div><div id="wc-on" hidden></div><button id="wc-jump" type="button"></button><div class="wc-err" id="wc-err" hidden></div>'+
   '<form id="wc-form"><textarea id="wc-in" rows="1" maxlength="500" placeholder="Nhắn cho mọi người…" aria-label="Tin nhắn"></textarea><button id="wc-send" type="submit" aria-label="Gửi">'+ICON.send+'</button></form>';
  document.body.appendChild(fab);document.body.appendChild(prev);document.body.appendChild(pn);
  fab.onclick=function(){toggle();};prev.onclick=function(){toggle(true);};
  $('#wc-onb').onclick=function(){toggleOn();};
  $('#wc-x').onclick=function(){toggle(false);};$('#wc-mute').onclick=function(){setMute(!A.muted);};
  $('#wc-jump').onclick=function(){scrollEnd(true);};
  $('#wc-list').addEventListener('scroll',function(){if(atEnd()){$('#wc-jump').classList.remove('on');markRead();}});
  var inp=$('#wc-in');inp.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,110)+'px';});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#wc-form').requestSubmit();}});
  $('#wc-form').onsubmit=function(e){e.preventDefault();send();};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&A.panelOpen)toggle(false);});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){if(A.panelOpen&&atEnd())markRead();schedule(100);}title();});
  A.baseTitle=document.title;drawMute();
}
function setMute(v){A.muted=!!v;ls('wc_mute_'+ME.id,v?'1':null);drawMute();if(v)hidePrev();}
function drawMute(){var b=$('#wc-mute'),f=$('#wc-fab');if(!b)return;b.innerHTML=A.muted?ICON.bellOff:ICON.bell;b.classList.toggle('on',!A.muted);b.title=A.muted?'Đang tắt thông báo (vẫn đếm tin mới, không xem trước). Bấm để bật lại':'Thông báo đang bật. Bấm để tắt';b.setAttribute('aria-label',b.title);f.classList.toggle('muted',A.muted);var s=$('#wc-sub');if(s)s.textContent=A.muted?'Thông báo: tắt':'';}
function badge(){var b=$('#wc-badge');if(!b)return;b.textContent=A.unread>99?'99+':String(A.unread);b.classList.toggle('on',A.unread>0);title();}
function title(){if(!A.baseTitle)return;document.title=(A.unread>0&&document.visibilityState==='hidden'?'('+A.unread+') ':'')+A.baseTitle;}
function hidePrev(){clearTimeout(A.prevT);var p=$('#wc-prev');if(p)p.classList.remove('on');}
function showPrev(m){if(A.muted||A.panelOpen)return;var p=$('#wc-prev');p.innerHTML='<b>'+esc(m.name)+(A.unread>1?' <i>+'+(A.unread-1)+' tin nữa</i>':'')+'</b><span>'+esc(m.body)+'</span>';p.classList.add('on');clearTimeout(A.prevT);A.prevT=setTimeout(hidePrev,7000);}
function atEnd(){var l=$('#wc-list');return !l||l.scrollHeight-l.scrollTop-l.clientHeight<60;}
function scrollEnd(mark){var l=$('#wc-list');if(!l)return;l.scrollTop=l.scrollHeight;$('#wc-jump').classList.remove('on');if(mark)markRead();}
function markRead(){if(!A.panelOpen||document.visibilityState!=='visible')return;if(A.max>A.lastRead){A.lastRead=A.max;ls('wc_last_'+ME.id,String(A.max));}if(A.unread){A.unread=0;badge();}}
function toggle(on){
  A.panelOpen=on===undefined?!A.panelOpen:!!on;$('#wc-panel').classList.toggle('open',A.panelOpen);hidePrev();
  if(A.panelOpen){draw(true);scrollEnd(true);setTimeout(function(){var i=$('#wc-in');if(i)i.focus();},60);schedule(100);}
}
function draw(full){
  var l=$('#wc-list');if(!l)return;var keep=atEnd();
  if(!A.msgs.length){l.innerHTML='<div class="wc-empty">Chưa có tin nhắn nào.<br>Hãy là người nói câu đầu tiên 👋</div>';return;}
  var h='',prev=null;
  A.msgs.forEach(function(m){
    var me=m.uid===ME.id,first=!prev||prev.uid!==m.uid||m.ts-prev.ts>180000;prev=m;
    var canDel=ME.role==='admin'||me;
    h+='<div class="wc-m '+(me?'me ':'')+(m.role==='admin'?'admin ':'')+(first?'first':'')+'" data-id="'+m.id+'">'+(first?'<div class="wc-h">'+(me?'':nameHtml(m))+'<span class="wc-t">'+fmtT(m.ts)+'</span></div>':'')+'<div class="wc-b">'+esc(m.body)+(canDel?'<button class="wc-del" type="button" data-d="'+m.id+'" title="Xoá tin nhắn" aria-label="Xoá">×</button>':'')+'</div></div>';
  });
  l.innerHTML=h;
  [].forEach.call(l.querySelectorAll('[data-d]'),function(b){b.onclick=function(){if(!confirm('Xoá tin nhắn này?'))return;api('chat/'+b.dataset.d,'DELETE').then(function(j){if(j.error){alert(j.error);return;}A.msgs=A.msgs.filter(function(x){return x.id!==+b.dataset.d;});draw();});};});
  if(keep||full)l.scrollTop=l.scrollHeight;
}
function send(){
  var i=$('#wc-in'),t=i.value.trim();if(!t||A.busy)return;A.busy=true;$('#wc-send').disabled=true;var er=$('#wc-err');er.hidden=true;
  api('chat','POST',{body:t}).then(function(j){A.busy=false;$('#wc-send').disabled=false;
    if(j.error){er.textContent=j.error;er.hidden=false;return;}i.value='';i.style.height='';i.focus();poll(true,true);
  }).catch(function(){A.busy=false;$('#wc-send').disabled=false;er.textContent='Không gửi được, kiểm tra mạng';er.hidden=false;});
}
function ingest(j,initial,own){
  var fresh=[];(j.msgs||[]).forEach(function(m){if(m.id>A.max){fresh.push(m);A.msgs.push(m);A.max=m.id;}});
  if(A.msgs.length>300)A.msgs=A.msgs.slice(-300);
  if(j.alive){var alive={};j.alive.forEach(function(id){alive[id]=1;});var lo=j.alive.length?j.alive[j.alive.length-1]:0,before=A.msgs.length;A.msgs=A.msgs.filter(function(m){return m.id<lo||alive[m.id];});if(A.msgs.length!==before)fresh.length||draw();}
  if(initial){
    var lr=+ls('wc_last_'+ME.id);if(!lr&&lr!==0||ls('wc_last_'+ME.id)===null){lr=A.max;ls('wc_last_'+ME.id,String(lr));}
    A.lastRead=lr;A.unread=A.msgs.filter(function(m){return m.id>lr&&m.uid!==ME.id;}).length;A.ready=true;badge();draw(true);return;
  }
  if(!fresh.length)return;
  var others=fresh.filter(function(m){return m.uid!==ME.id;});
  var visible=A.panelOpen&&document.visibilityState==='visible';
  if(visible){draw();if(!atEnd()&&others.length){$('#wc-jump').textContent='↓ '+others.length+' tin mới';$('#wc-jump').classList.add('on');}else{if(own||atEnd())scrollEnd(true);}if(own||atEnd())markRead();}
  else{draw();}
  if(others.length&&!(visible&&atEnd())){A.unread+=others.length;badge();showPrev(others[others.length-1]);}
}
function toggleOn(on){
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
  if(typeof j.on==='number'){A.on=j.on;var n=$('#wc-onn');if(n)n.textContent=j.on;if(A.onOpen&&A.n%2===0)loadOnline();}
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
function poll(now,own){
  if(A.dead)return;
  var initial=!A.ready;A.n++;
  return api('chat?after='+(initial?0:A.max)+(A.n%5===0?'&sync=1':'')).then(function(j){
    if(j.$s===401){stop();return;}if(j.error)return;reloadCheck(j,initial);ingest(j,initial,own);
  }).catch(function(){}).then(function(){schedule();});
}
function schedule(ms){clearTimeout(A.timer);if(A.dead)return;A.timer=setTimeout(function(){poll();},ms||(document.visibilityState==='visible'?(A.panelOpen?3500:6000):15000));}
function start(){
  if(A.started||A.dead)return;A.started=true;
  fetch('/api/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
    if(!j||!j.user){A.started=false;return;}
    ME={id:j.user.id,role:j.user.role,name:j.user.name};A.muted=ls('wc_mute_'+ME.id)==='1';
    build();drawMute();poll();
  }).catch(function(){A.started=false;});
}
function stop(){A.dead=true;clearTimeout(A.timer);['wc-fab','wc-prev','wc-panel','wc-css'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove();});if(A.baseTitle)document.title=A.baseTitle;
  A={panelOpen:false,muted:false,unread:0,max:0,msgs:[],lastRead:0,timer:null,n:0,busy:false,started:false,ready:false,prevT:0,baseTitle:'',dead:false};ME=null;}
window.WebChat={start:start,stop:stop};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
