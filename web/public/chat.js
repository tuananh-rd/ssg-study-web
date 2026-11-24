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
 reply:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/></svg>',
 img:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg>',
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
'#wc-ac{border-top:1px solid var(--line,#ddd);background:var(--panel,#fff);max-height:200px;overflow-y:auto;padding:4px}#wc-ac[hidden]{display:none}.wc-aci{display:flex;align-items:center;gap:8px;width:100%;border:0;background:none;color:var(--text,#111);padding:6px 8px;border-radius:8px;cursor:pointer;text-align:left;font:inherit}.wc-aci.on,.wc-aci:hover{background:var(--panel2,#f6f7fb)}.wc-av.sm{width:26px;height:26px;font-size:.8rem}'+
'.wc-men{font-weight:700;color:var(--primary,#3b5bdb);background:color-mix(in srgb,var(--primary,#3b5bdb) 12%,transparent);border-radius:5px;padding:0 3px}.wc-m.me .wc-men{color:inherit;background:rgba(255,255,255,.25)}.wc-men.me{background:rgba(245,159,0,.25);color:#b45309}.wc-m.men-me .wc-b{border-color:#f59f00;box-shadow:0 0 0 2px rgba(245,159,0,.3)}'+
'#wc-fab.tagged::before{content:"@";position:absolute;left:-4px;top:-4px;width:20px;height:20px;border-radius:50%;background:#f59f00;color:#fff;font:800 .8rem/20px system-ui,sans-serif;text-align:center;border:2px solid var(--panel,#fff);box-sizing:content-box}'+
'.wc-imb{flex:none;align-self:flex-end;width:40px;height:40px}.wc-img{display:block;max-width:100%;max-height:260px;border-radius:10px;cursor:zoom-in;margin:0 0 4px;background:var(--panel2,#f6f7fb)}.wc-b .wc-tx{white-space:pre-wrap}.wc-b:has(.wc-img){padding:5px}.wc-b:has(.wc-img) .wc-tx{padding:2px 6px 3px}'+
'#wc-pv{padding:8px 10px 0;background:var(--panel,#fff)}#wc-pv[hidden]{display:none}.wc-pvi{position:relative;display:inline-block}.wc-pvi img{display:block;max-height:90px;max-width:160px;border-radius:10px;border:1px solid var(--line,#ddd)}.wc-pvi button{position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;border:1px solid var(--line,#ddd);background:var(--panel,#fff);color:var(--text,#111);cursor:pointer;display:grid;place-items:center;padding:0}.wc-pvi button svg{width:12px;height:12px}'+
'#wc-panel.wc-drop{outline:3px dashed var(--primary,#3b5bdb);outline-offset:-6px}#wc-lb{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:wcin .15s}#wc-lb img{max-width:94vw;max-height:92vh;border-radius:8px;box-shadow:0 10px 50px rgba(0,0,0,.6)}#wc-lb button{position:absolute;top:14px;right:14px;border:0;background:rgba(255,255,255,.15);color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;display:grid;place-items:center}'+
'.wc-men.all{background:rgba(245,159,0,.22);color:#b45309}.wc-m.me .wc-men.all{color:#fff;background:rgba(255,255,255,.3)}'+
'.wc-rep{position:absolute;top:-9px;right:22px;width:22px;height:22px;border-radius:50%;border:1px solid var(--line,#ddd);background:var(--panel,#fff);color:var(--muted,#667);cursor:pointer;display:none;place-items:center;padding:0}.wc-m:hover .wc-rep{display:grid}.wc-rep:hover{color:var(--primary,#3b5bdb)}.wc-m:not(.me) .wc-del{right:-6px}@media(max-width:760px){.wc-rep{display:grid}}'+
'.wc-quote{border-left:3px solid var(--primary,#3b5bdb);background:rgba(127,127,127,.12);border-radius:6px;padding:3px 8px;margin:0 0 5px;cursor:pointer;font-size:.78rem;line-height:1.35;overflow:hidden}.wc-quote b{display:block}.wc-quote span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.85}.wc-quote.gone{opacity:.6;cursor:default;font-style:italic}.wc-m.me .wc-quote{border-left-color:rgba(255,255,255,.7);background:rgba(255,255,255,.18)}'+
'#wc-rp{display:flex;align-items:center;gap:8px;padding:6px 10px 0;background:var(--panel,#fff)}#wc-rp[hidden]{display:none}.wc-rpi{flex:1;min-width:0;border-left:3px solid var(--primary,#3b5bdb);padding:2px 8px;font-size:.8rem;background:var(--panel2,#f6f7fb);border-radius:6px}.wc-rpi b,.wc-rpi span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#wc-rp button{border:0;background:none;color:var(--muted,#667);cursor:pointer;display:grid;place-items:center;padding:4px}'+
'.wc-m.flash .wc-b{animation:wcflash 1.5s}@keyframes wcflash{0%,60%{box-shadow:0 0 0 3px rgba(59,91,219,.55)}100%{box-shadow:none}}'+
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
function ttHtml(t){return t?'<span class="rk-tt t'+(t[2]|0)+'" style="background-color:'+esc(t[1])+';--c:'+esc(t[1])+'">'+esc(t[0])+'</span>':'';}
function nameHtml(m){var cls=m.role==='admin'?'admin':'user';return '<span class="wc-n '+cls+'" style="--wcc:hsl('+hue(m.name)+',60%,42%)">'+esc(m.name)+'</span>'+(m.role==='admin'?'<span class="wc-tag">'+ICON.shield+'QTV</span>':ttHtml(m.tt));}
function build(){
  if($('#wc-fab'))return;
  var st=document.createElement('style');st.id='wc-css';st.textContent=CSS;document.head.appendChild(st);
  var fab=document.createElement('button');fab.id='wc-fab';fab.type='button';fab.setAttribute('aria-label','Chat chung');fab.title='Chat chung';fab.innerHTML=ICON.chat+'<span id="wc-badge"></span>';
  var prev=document.createElement('div');prev.id='wc-prev';prev.setAttribute('role','status');
  var pn=document.createElement('aside');pn.id='wc-panel';pn.setAttribute('aria-label','Chat chung');
  pn.innerHTML='<div class="h"><b>Chat chung<small id="wc-sub"></small></b><button class="wc-onb" id="wc-onb" type="button" title="Xem ai đang online" aria-pressed="false"><i class="wc-dot"></i><span id="wc-onn">0</span> online</button><button class="ib" id="wc-mute" type="button"></button><button class="ib" id="wc-x" type="button" aria-label="Đóng">'+ICON.x+'</button></div><div id="wc-list" aria-live="polite"></div><div id="wc-on" hidden></div><button id="wc-jump" type="button"></button><div id="wc-ac" hidden></div><div class="wc-err" id="wc-err" hidden></div>'+
   '<div id="wc-rp" hidden></div><div id="wc-pv" hidden></div><form id="wc-form"><button class="ib wc-imb" id="wc-imb" type="button" title="Gửi ảnh (cũng có thể dán Ctrl+V hoặc kéo thả vào khung)" aria-label="Gửi ảnh">'+ICON.img+'</button><input type="file" id="wc-imf" accept="image/*" hidden><textarea id="wc-in" rows="1" maxlength="500" placeholder="Nhắn cho mọi người…" aria-label="Tin nhắn"></textarea><button id="wc-send" type="submit" aria-label="Gửi">'+ICON.send+'</button></form>';
  document.body.appendChild(fab);document.body.appendChild(prev);document.body.appendChild(pn);
  fab.onclick=function(){toggle();};prev.onclick=function(){toggle(true);};
  $('#wc-onb').onclick=function(){toggleOn();};
  $('#wc-imb').onclick=function(){$('#wc-imf').click();};$('#wc-imf').onchange=function(){var f=this.files;imgPick(f);this.value='';};
  $('#wc-in').addEventListener('paste',function(e){var fs=[];[].forEach.call((e.clipboardData&&e.clipboardData.items)||[],function(it){if(it.kind==='file'){var f=it.getAsFile();if(f&&/^image\//.test(f.type))fs.push(f);}});if(fs.length){e.preventDefault();imgPick(fs);}});
  var dz=$('#wc-panel'),hf=function(e){return e.dataTransfer&&[].indexOf.call(e.dataTransfer.types||[],'Files')>=0;};
  dz.addEventListener('dragover',function(e){if(hf(e)){e.preventDefault();dz.classList.add('wc-drop');}});dz.addEventListener('dragleave',function(e){if(!dz.contains(e.relatedTarget))dz.classList.remove('wc-drop');});dz.addEventListener('drop',function(e){if(hf(e)){e.preventDefault();dz.classList.remove('wc-drop');imgPick(e.dataTransfer.files);}});
  $('#wc-list').addEventListener('click',function(e){var t=e.target;var im=t.closest&&t.closest('.wc-img');if(im){lightbox(im.getAttribute('src'));return;}var rb=t.closest&&t.closest('[data-r]');if(rb){replyTo(+rb.dataset.r);return;}var q=t.closest&&t.closest('.wc-quote');if(q&&!q.classList.contains('gone'))goMsg(+q.dataset.go);});
  $('#wc-x').onclick=function(){toggle(false);};$('#wc-mute').onclick=function(){setMute(!A.muted);};
  $('#wc-jump').onclick=function(){scrollEnd(true);};
  $('#wc-list').addEventListener('scroll',function(){if(atEnd()){$('#wc-jump').classList.remove('on');markRead();}});
  var inp=$('#wc-in');inp.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,110)+'px';});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#wc-form').requestSubmit();}});
  $('#wc-form').onsubmit=function(e){e.preventDefault();send();};
  inp.addEventListener('input',acUpdate);inp.addEventListener('click',acUpdate);
  inp.addEventListener('keydown',function(e){if(!A.ac||!A.ac.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();A.acI=(A.acI+(e.key==='ArrowDown'?1:-1)+A.ac.length)%A.ac.length;acDraw();}else if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();acPick(A.ac[A.acI]);}else if(e.key==='Escape'){e.stopPropagation();acHide();}},true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&A.panelOpen)toggle(false);});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){if(A.panelOpen&&atEnd())markRead();schedule(100);}title();});
  A.baseTitle=document.title;drawMute();
}
function setMute(v){A.muted=!!v;ls('wc_mute_'+ME.id,v?'1':null);drawMute();if(v)hidePrev();}
function drawMute(){var b=$('#wc-mute'),f=$('#wc-fab');if(!b)return;b.innerHTML=A.muted?ICON.bellOff:ICON.bell;b.classList.toggle('on',!A.muted);b.title=A.muted?'Đang tắt thông báo (vẫn đếm tin mới, không xem trước). Bấm để bật lại':'Thông báo đang bật. Bấm để tắt';b.setAttribute('aria-label',b.title);f.classList.toggle('muted',A.muted);var s=$('#wc-sub');if(s)s.textContent=A.muted?'Thông báo: tắt':'';}
function badge(){var b=$('#wc-badge');if(!b)return;b.textContent=A.unread>99?'99+':String(A.unread);b.classList.toggle('on',A.unread>0);title();}
function title(){if(!A.baseTitle)return;document.title=(A.unread>0&&document.visibilityState==='hidden'?'('+A.unread+') ':'')+A.baseTitle;}
function hidePrev(){clearTimeout(A.prevT);var p=$('#wc-prev');if(p)p.classList.remove('on');}
function mentionsMe(m){return !!(m.men&&ME&&m.men.some(function(x){return x.id===ME.id||x.id===0;}));}
function mentionsPersonal(m){return !!(m.men&&ME&&m.men.some(function(x){return x.id===ME.id;}));}
function bodyHtml(m){var h=esc(m.body).replace(/(^|\s)@all(?![\wÀ-ỹ])/gi,'$1<span class="wc-men all">@all</span>');(m.men||[]).forEach(function(x){var t=esc('@'+x.name);h=h.split(t).join('<span class="wc-men'+(ME&&x.id===ME.id?' me':'')+'">'+t+'</span>');});return h;}
function showPrev(m,forced){if((A.muted&&!forced)||A.panelOpen)return;var p=$('#wc-prev');p.innerHTML='<b>'+esc(m.name)+(forced?' <i>'+((m.men||[]).some(function(x){return x.id===(ME&&ME.id)&&x.rep;})?'trả lời bạn':'nhắc đến bạn')+'</i>':'')+(A.unread>1?' <i>+'+(A.unread-1)+' tin nữa</i>':'')+'</b><span>'+esc(m.body||'Đã gửi một ảnh')+'</span>';p.classList.add('on');clearTimeout(A.prevT);A.prevT=setTimeout(hidePrev,7000);}
function atEnd(){var l=$('#wc-list');return !l||l.scrollHeight-l.scrollTop-l.clientHeight<60;}
function scrollEnd(mark){var l=$('#wc-list');if(!l)return;l.scrollTop=l.scrollHeight;$('#wc-jump').classList.remove('on');if(mark)markRead();}
function markRead(){if(!A.panelOpen||document.visibilityState!=='visible')return;var tf=$('#wc-fab');if(tf)tf.classList.remove('tagged');if(A.max>A.lastRead){A.lastRead=A.max;ls('wc_last_'+ME.id,String(A.max));}if(A.unread){A.unread=0;badge();}}
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
    h+='<div class="wc-m '+(!me&&mentionsMe(m)?'men-me ':'')+(me?'me ':'')+(m.role==='admin'?'admin ':'')+(first?'first':'')+'" data-id="'+m.id+'">'+(first?'<div class="wc-h">'+(me?ttHtml(m.tt):nameHtml(m))+'<span class="wc-t">'+fmtT(m.ts)+'</span></div>':'')+'<div class="wc-b">'+(m.re?'<div class="wc-quote'+(m.re.gone?' gone':'')+'" data-go="'+m.re.id+'"><b>'+esc(m.re.gone?'Tin đã xoá':(m.re.name||''))+'</b><span>'+esc(m.re.gone?'':(m.re.body||(m.re.img?'Ảnh':'')))+'</span></div>':'')+(m.img?'<img class="wc-img" data-i="'+m.id+'" src="/api/chat/img/'+m.id+'" alt="Ảnh" loading="lazy">':'')+(m.body?'<div class="wc-tx">'+bodyHtml(m)+'</div>':'')+'<button class="wc-rep" type="button" data-r="'+m.id+'" title="Trả lời tin nhắn này" aria-label="Trả lời">'+ICON.reply+'</button>'+(canDel?'<button class="wc-del" type="button" data-d="'+m.id+'" title="Xoá tin nhắn" aria-label="Xoá">×</button>':'')+'</div></div>';
  });
  l.innerHTML=h;
  [].forEach.call(l.querySelectorAll('[data-d]'),function(b){b.onclick=function(){if(!confirm('Xoá tin nhắn này?'))return;api('chat/'+b.dataset.d,'DELETE').then(function(j){if(j.error){alert(j.error);return;}A.msgs=A.msgs.filter(function(x){return x.id!==+b.dataset.d;});draw();});};});
  if(keep||full)l.scrollTop=l.scrollHeight;
}
function send(){
  var i=$('#wc-in'),t=i.value.trim();if((!t&&!A.img)||A.busy)return;A.busy=true;$('#wc-send').disabled=true;var er=$('#wc-err');er.hidden=true;
  var men=Object.keys(A.pend||{}).filter(function(id){return t.indexOf('@'+A.pend[id])>=0;}).map(Number);
  var pl={body:t,mentions:men};if(A.img)pl.image=A.img;if(A.reply)pl.reply_to=A.reply.id;
  api('chat','POST',pl).then(function(j){A.busy=false;$('#wc-send').disabled=false;
    if(j.error){er.textContent=j.error;er.hidden=false;return;}i.value='';A.pend={};A.img=null;A.reply=null;imgDraw();replyDraw();acHide();i.style.height='';i.focus();poll(true,true);
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
  if(others.length&&!(visible&&atEnd())){A.unread+=others.length;badge();var tp=others.filter(mentionsPersonal),ta=others.filter(mentionsMe);if(ta.length){var f=$('#wc-fab');if(f)f.classList.add('tagged');}if(tp.length)showPrev(tp[tp.length-1],true);else showPrev(others[others.length-1]);}
}
/* gợi ý @tên */
function acToken(){var i=$('#wc-in');if(!i)return null;var pos=i.selectionStart,m=i.value.slice(0,pos).match(/(^|\s)@([^\s@]{0,24})$/);return m?{q:m[2],start:pos-m[2].length-1,end:pos}:null;}
function acHide(){A.ac=[];var e=$('#wc-ac');if(e)e.hidden=true;}
function acDraw(){var e=$('#wc-ac');if(!e)return;if(!A.ac||!A.ac.length){e.hidden=true;return;}e.hidden=false;
  e.innerHTML=A.ac.map(function(u,k){return '<button type="button" class="wc-aci'+(k===A.acI?' on':'')+'" data-k="'+k+'"><span class="wc-av sm" style="background:hsl('+hue(u.name)+',55%,45%)">'+esc(u.name.trim().charAt(0).toUpperCase()||'?')+(u.on?'<i class="wc-dot sm"></i>':'')+'</span><span class="wc-on-n">'+(u.all?'<b>@all</b> <small style="opacity:.7">nhắc tất cả mọi người</small>':nameHtml(u))+'</span></button>';}).join('');
  [].forEach.call(e.querySelectorAll('.wc-aci'),function(b){b.onmousedown=function(ev){ev.preventDefault();acPick(A.ac[+b.dataset.k]);};});}
function acUpdate(){var t=acToken();if(!t){acHide();return;}clearTimeout(A.acT);A.acT=setTimeout(function(){var t2=acToken();if(!t2)return;
  api('chat/users?q='+encodeURIComponent(t2.q)).then(function(j){if(!j.users)return;var us=j.users.slice();if('all'.indexOf(t2.q.toLowerCase())===0)us.unshift({id:0,name:'all',role:'user',all:true});A.ac=us;A.acI=0;acDraw();}).catch(function(){});},120);}
function acPick(u){var t=acToken(),i=$('#wc-in');if(!t||!u)return;var ins='@'+u.name+' ';if(u.all){i.value=i.value.slice(0,t.start)+ins+i.value.slice(t.end);var pp=t.start+ins.length;i.setSelectionRange(pp,pp);i.focus();acHide();i.dispatchEvent(new Event('input'));return;}i.value=i.value.slice(0,t.start)+ins+i.value.slice(t.end);var p=t.start+ins.length;i.setSelectionRange(p,p);i.focus();
  A.pend=A.pend||{};A.pend[u.id]=u.name;acHide();i.dispatchEvent(new Event('input'));}
/* ảnh trong chat: thu nhỏ trước khi gửi (tối đa ~450 KB) */
function imgShrink(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var s=Math.min(1,1280/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);var q=.82,d=c.toDataURL('image/jpeg',q);while(d.length>600000&&q>.35){q-=.1;d=c.toDataURL('image/jpeg',q);}if(d.length>650000){var s2=.6;c.width=Math.round(c.width*s2);c.height=Math.round(c.height*s2);x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);d=c.toDataURL('image/jpeg',.7);}if(d.length>650000)return rej(new Error('Ảnh quá lớn'));res(d);};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('Không đọc được ảnh'));};im.src=u;});}
function replyDraw(){var p=$('#wc-rp');if(!p)return;if(!A.reply){p.hidden=true;p.innerHTML='';return;}p.hidden=false;p.innerHTML='<span class="wc-rpi"><b>Trả lời '+esc(A.reply.name)+'</b><span>'+esc(A.reply.body||'Ảnh')+'</span></span><button type="button" id="wc-rpx" aria-label="Bỏ trả lời">'+ICON.x+'</button>';$('#wc-rpx').onclick=function(){A.reply=null;replyDraw();};}
function replyTo(id){var m=A.msgs.filter(function(x){return x.id===id;})[0];if(!m)return;A.reply={id:id,name:m.name,body:(m.body||'').slice(0,80)};replyDraw();var i=$('#wc-in');if(i)i.focus();}
function goMsg(id){var l=$('#wc-list'),e=l&&l.querySelector('.wc-m[data-id="'+id+'"]');if(!e)return;e.scrollIntoView({block:'center',behavior:'smooth'});e.classList.add('flash');setTimeout(function(){e.classList.remove('flash');},1600);}
function imgDraw(){var p=$('#wc-pv');if(!p)return;if(!A.img){p.hidden=true;p.innerHTML='';return;}p.hidden=false;p.innerHTML='<span class="wc-pvi"><img src="'+A.img+'" alt="Ảnh sẽ gửi"><button type="button" id="wc-pvx" aria-label="Bỏ ảnh">'+ICON.x+'</button></span>';$('#wc-pvx').onclick=function(){A.img=null;imgDraw();};}
function imgPick(files){var f=[].filter.call(files||[],function(x){return /^image\//.test(x.type);})[0];if(!f){var er=$('#wc-err');if(er){er.textContent='Chỉ gửi được tệp ảnh';er.hidden=false;}return;}
  imgShrink(f).then(function(d){A.img=d;var er=$('#wc-err');if(er)er.hidden=true;imgDraw();var i=$('#wc-in');if(i)i.focus();}).catch(function(e){var er=$('#wc-err');if(er){er.textContent=e.message;er.hidden=false;}});}
function lightbox(src){var o=document.createElement('div');o.id='wc-lb';o.innerHTML='<img src="'+src+'" alt="Ảnh"><button type="button" aria-label="Đóng">'+ICON.x+'</button>';document.body.appendChild(o);function close(){o.remove();document.removeEventListener('keydown',kd,true);}function kd(e){if(e.key==='Escape'){e.stopPropagation();close();}}document.addEventListener('keydown',kd,true);o.onclick=close;}
function toggleOn(on){
  A.onOpen=on===undefined?!A.onOpen:!!on;var l=$('#wc-list'),o=$('#wc-on'),f=$('#wc-form'),b=$('#wc-onb');if(!l||!o)return;
  l.hidden=A.onOpen;o.hidden=!A.onOpen;f.style.display=A.onOpen?'none':'';if(b){b.classList.toggle('on',A.onOpen);b.setAttribute('aria-pressed',A.onOpen?'true':'false');}
  if(A.onOpen)loadOnline();else scrollEnd(true);
}
function loadOnline(){
  api('chat/online').then(function(j){
    if(j.error||!j.users)return;var o=$('#wc-on');if(!o)return;A.on=j.users.length;var n=$('#wc-onn');if(n)n.textContent=A.on;
    o.innerHTML='<div class="wc-onh">'+j.users.length+' người đang online</div>'+(j.users.length?j.users.map(function(u){var me=u.id===ME.id;
      return '<div class="wc-ou"><span class="wc-av'+(u.tt?' rk-av t'+(u.tt[2]|0):'')+'" style="--s:34px;--c:'+(u.tt?esc(u.tt[1]):'#888')+';background:hsl('+hue(u.name)+',55%,45%)">'+esc(u.name.trim().charAt(0).toUpperCase()||'?')+'<i class="wc-dot sm"></i></span><span class="wc-on-n">'+nameHtml({name:u.name,role:u.role,tt:u.tt})+(me?' <em class="wc-me">(Bạn)</em>':'')+'</span></div>';}).join(''):'<div class="wc-empty">Chưa có ai.</div>');
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
