/* Trình phát nhạc mini kiểu Spotify cho việc học: chọn ngẫu nhiên nhạc lofi / study with me trên YouTube (IFrame API chính thức). */
(function(){
if(window.WebMusic)return;
var LIST=[
 {id:'rFZHOHl-L8A',t:'lofi hip hop radio · beats to relax/study to',ch:'Lofi Girl',live:1},
 {id:'1Tl2FtV06qo',t:'asian lofi radio · beats to relax/study to',ch:'Lofi Girl',live:1},
 {id:'qGohtGC5Rtk',t:'Study With Me · Pomodoro',ch:'Lofi Girl',live:1},
 {id:'A8jDx9TLMQc',t:'relaxing jazz · cozy radio to study/chill to',ch:'Lofi Girl',live:1},
 {id:'N0snMcR6aaA',t:'relaxing piano radio · calm music to focus to',ch:'Lofi Girl',live:1},
 {id:'5yx6BWlEVcY',t:'Chillhop Radio · jazzy & lofi hip hop beats',ch:'Chillhop Music',live:1},
 {id:'IdjDjxNn9ws',t:'4-HOUR STUDY WITH ME · Sunset Meditation, Calm Piano, Pomodoro 50/10',ch:'StudyMD'},
 {id:'YdtBEFK_HgI',t:'5-HOUR STUDY WITH ME · calm piano, Tokyo Skyline at Sunset',ch:'Abao in Tokyo'},
 {id:'sUwD3GRPJos',t:'2.5-HOUR STUDY WITH ME · calm piano, Yokohama Harbor at Sunset',ch:'Abao in Tokyo'},
 {id:'OS8lnKZdJYc',t:'2-HOUR STUDY WITH ME · calm lofi, Golden Morning in Tokyo',ch:'Abao in Tokyo'},
 {id:'6cZ3eD5rRbo',t:'5-HOUR Study with me at home · 50/10, real time, real sound',ch:'Focus with Yoo'},
 {id:'JHF4MPoADSs',t:'4-HOUR STUDY WITH ME · Calm Piano, Morning Ambience',ch:'The Hanoi Chamomile'},
 {id:'qkdUGC-izus',t:'study with me live pomodoro · 12 hours super revision day',ch:'James Scholz'},
 {id:'VJhd3hvsMTo',t:'50/10 Pomodoro Timer · Relaxing Lofi, Deep Focus',ch:'Study Pomodoro'},
 {id:'Ud5nv8CIZiM',t:'3-HOUR STUDY WITH ME · Pomodoro 25/5, Rain Sounds, No Music',ch:'Celine'}
];
var S={cur:0,hist:[],player:null,ready:false,playing:false,vol:50,min:false,big:false,api:null,el:null,started:false,errs:0};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}return null;}
function $(s,r){return (r||document).querySelector(s);}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var IC={play:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
 prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 5h2v14H6zM9 12l10 7V5z"/></svg>',next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 5h2v14h-2zM15 12L5 5v14z"/></svg>',
 note:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
 shuf:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
 min:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>',
 big:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
 vol:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7"/></svg>'};
var CSS='#wm{position:fixed;left:78px;bottom:20px;z-index:79;width:372px;max-width:calc(100vw - 96px);color:#fff;border-radius:18px;padding:11px;display:flex;gap:12px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;animation:wmin .45s cubic-bezier(.2,.9,.3,1.2);box-sizing:border-box}'+
'@keyframes wmin{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:none}}'+
'#wm .bg{position:absolute;inset:0;border-radius:18px;z-index:-1;background:radial-gradient(120% 140% at 0% 0%,#26302b 0,#17181b 55%),#17181b;box-shadow:0 14px 36px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.06);overflow:hidden}'+
'#wm .bg::after{content:"";position:absolute;inset:-40%;background:radial-gradient(40% 40% at 30% 30%,rgba(30,215,96,.22),transparent 70%),radial-gradient(35% 35% at 75% 70%,rgba(124,77,255,.2),transparent 70%);opacity:0;transition:opacity .6s}#wm.playing .bg::after{opacity:1;animation:wmamb 9s ease-in-out infinite alternate}'+
'@keyframes wmamb{to{transform:translate(8%,6%) rotate(12deg)}}'+
'#wm::before{content:"";position:absolute;inset:-2px;border-radius:20px;z-index:-2;background:linear-gradient(120deg,#1ed760,#7c4dff,#ff5ea8,#1ed760);background-size:300% 100%;filter:blur(9px);opacity:0;transition:opacity .5s}#wm.playing::before{opacity:.55;animation:wmflow 5s linear infinite}'+
'@keyframes wmflow{to{background-position:-300% 0}}'+
'#wm.min{display:none}#wm-fab{position:fixed;left:78px;bottom:20px;z-index:79;width:50px;height:50px;border-radius:50%;border:0;background:#17181b;color:#1ed760;display:none;place-items:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.4);transition:transform .15s}#wm-fab.on{display:grid;animation:wmin .35s}#wm-fab.playing{animation:wmpulse 2.2s ease-in-out infinite}#wm-fab:hover{transform:scale(1.08)}'+
'@keyframes wmpulse{0%,100%{box-shadow:0 0 0 0 rgba(30,215,96,.55)}50%{box-shadow:0 0 0 9px rgba(30,215,96,0)}}'+
'#wm .art{flex:none;width:100px;height:100px;border-radius:12px;overflow:hidden;background:#000 center/cover no-repeat;position:relative;align-self:flex-start;box-shadow:0 6px 18px rgba(0,0,0,.5);transition:box-shadow .4s,transform .4s}#wm.playing .art{box-shadow:0 8px 24px rgba(30,215,96,.35),0 0 0 1px rgba(255,255,255,.08)}#wm .art iframe,#wm .art>div{position:absolute;inset:0;width:100%;height:100%;border:0}'+
'#wm.big{flex-wrap:wrap;width:min(440px,calc(100vw - 96px))}#wm.big .art{width:100%;height:auto;aspect-ratio:16/9}'+
'#wm .in{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;justify-content:space-between}#wm .row1{display:flex;align-items:center;gap:2px}'+
'#wm .tt{flex:1;min-width:0;overflow:hidden;white-space:nowrap;font-weight:700;font-size:.93rem;-webkit-mask:linear-gradient(90deg,transparent,#000 6px,#000 calc(100% - 14px),transparent);mask:linear-gradient(90deg,transparent,#000 6px,#000 calc(100% - 14px),transparent);padding:0 4px}'+
'#wm .mi{display:inline-flex}#wm .mi span{display:inline-block}#wm .tt.mq .mi{animation:wmq 16s linear infinite}#wm .tt.mq .mi span{padding-right:44px}#wm:hover .tt.mq .mi{animation-play-state:paused}@keyframes wmq{0%,8%{transform:translateX(0)}100%{transform:translateX(-50%)}}'+
'#wm .ch{color:#b3b3b3;font-size:.8rem;display:flex;align-items:center;gap:7px;min-width:0;padding-left:4px}#wm .ch span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#wm .ch b{background:#e22134;color:#fff;border-radius:4px;font-size:.6rem;padding:1px 5px;letter-spacing:.05em;animation:wmlive 1.6s ease-in-out infinite}@keyframes wmlive{50%{opacity:.55}}'+
'#wm .eq{display:inline-flex;align-items:flex-end;gap:2px;height:14px;margin-left:auto;flex:none}#wm .eq i{display:block;width:3px;height:3px;border-radius:2px;background:linear-gradient(#1ed760,#7c4dff);transition:height .3s}#wm.playing .eq i{animation:wmeq 1s ease-in-out infinite}#wm.playing .eq i:nth-child(2){animation-delay:-.4s;animation-duration:.85s}#wm.playing .eq i:nth-child(3){animation-delay:-.7s;animation-duration:1.15s}#wm.playing .eq i:nth-child(4){animation-delay:-.2s;animation-duration:.7s}'+
'@keyframes wmeq{0%,100%{height:3px}50%{height:14px}}'+
'#wm .ctl{display:flex;align-items:center;gap:0;min-width:0;flex-wrap:nowrap}#wm button{border:0;background:none;color:#fff;cursor:pointer;display:inline-grid;place-items:center;border-radius:50%;padding:6px;flex:none;transition:background .15s,transform .12s,color .15s}#wm button:hover{background:rgba(255,255,255,.12)}#wm button:active{transform:scale(.88)}'+
'#wm .pp{position:relative;width:42px;height:42px;background:#fff;color:#000;margin:0 3px}#wm .pp:hover{background:#fff;transform:scale(1.08)}#wm.playing .pp{animation:wmring 2.4s ease-out infinite}@keyframes wmring{0%{box-shadow:0 0 0 0 rgba(255,255,255,.45)}70%,100%{box-shadow:0 0 0 11px rgba(255,255,255,0)}}'+
'#wm .ib{color:#b3b3b3}#wm .ib:hover{color:#fff}#wm .ib.on{color:#1ed760}'+
'#wm .vol{display:flex;align-items:center;gap:1px;margin-left:auto;flex:0 1 118px;min-width:64px}#wm .vs{position:relative;flex:1;min-width:0;display:flex;align-items:center;height:26px}'+
'#wm input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:26px;margin:0;background:transparent;cursor:pointer;outline:0;--v:50%}'+
'#wm input[type=range]::-webkit-slider-runnable-track{height:5px;border-radius:5px;background:linear-gradient(90deg,#1ed760,#7c4dff var(--v),rgba(255,255,255,.18) var(--v))}'+
'#wm input[type=range]::-moz-range-track{height:5px;border-radius:5px;background:rgba(255,255,255,.18)}#wm input[type=range]::-moz-range-progress{height:5px;border-radius:5px;background:linear-gradient(90deg,#1ed760,#7c4dff)}'+
'#wm input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#fff;margin-top:-4px;box-shadow:0 1px 4px rgba(0,0,0,.5);transform:scale(.0);transition:transform .15s,box-shadow .15s}'+
'#wm input[type=range]::-moz-range-thumb{width:13px;height:13px;border:0;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.5);transform:scale(0);transition:transform .15s}'+
'#wm .vs:hover input::-webkit-slider-thumb,#wm input:focus-visible::-webkit-slider-thumb,#wm input:active::-webkit-slider-thumb{transform:scale(1);box-shadow:0 0 0 5px rgba(30,215,96,.28)}#wm .vs:hover input::-moz-range-thumb,#wm input:active::-moz-range-thumb{transform:scale(1)}'+
'#wm .vt{position:absolute;top:-19px;left:calc(var(--v,50%) * .86 + 4px);transform:translateX(-50%) scale(.8);padding:1px 6px;border-radius:6px;background:#fff;color:#000;font:700 .68rem/1.5 system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}#wm .vs:hover .vt,#wm .vs.drag .vt{opacity:1;transform:translateX(-50%) scale(1)}'+
'#wm.muted .vs input{opacity:.45}'+
'#wm .ld{width:42px;height:42px;border:3px solid #ddd;border-top-color:#1ed760;border-radius:50%;animation:wmsp .8s linear infinite;display:none;position:absolute;inset:0;box-sizing:border-box}#wm.busy .pp svg{opacity:.2}#wm.busy .ld{display:block}'+
'@keyframes wmsp{to{transform:rotate(360deg)}}'+
'@media(prefers-reduced-motion:reduce){#wm,#wm *,#wm::before,#wm-fab{animation:none!important}}'+
'@media(max-width:760px){#wm,#wm-fab{left:14px;bottom:132px}#wm{max-width:calc(100vw - 28px);width:calc(100vw - 28px)}}';
function track(){return LIST[S.cur];}
function pick(avoid){var n,tries=0;do{n=Math.floor(Math.random()*LIST.length);tries++;}while((n===S.cur||S.hist.slice(-4).indexOf(n)>=0)&&tries<30&&LIST.length>5);return n;}
function thumb(id){return 'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg';}
var VIC={hi:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',lo:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7"/></svg>',off:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/></svg>'};
function setVol(v,save){
  v=Math.max(0,Math.min(100,Math.round(v)));S.vol=v;var r=$('#wm-vol'),t=$('#wm-vt'),m=$('#wm-mute');
  if(r){r.value=v;r.style.setProperty('--v',v+'%');r.parentNode.style.setProperty('--v',v+'%');r.setAttribute('aria-valuetext',v+'%');}
  if(t)t.textContent=v;if(m){m.innerHTML=v===0?VIC.off:(v<45?VIC.lo:VIC.hi);m.classList.toggle('on',v>0);}
  var d=$('#wm');if(d)d.classList.toggle('muted',v===0);
  if(save)ls('wm_vol',String(v));if(S.player&&S.player.setVolume)try{S.player.setVolume(v);}catch(e){}
}
function build(){
  if($('#wm'))return;
  var st=document.createElement('style');st.id='wm-css';st.textContent=CSS;document.head.appendChild(st);
  var d=document.createElement('div');d.id='wm';d.setAttribute('role','region');d.setAttribute('aria-label','Nhạc học bài');
  d.innerHTML='<div class="bg"></div><div class="art" id="wm-art"><div id="wm-yt"></div></div><div class="in"><div class="row1"><div class="tt" id="wm-tt"></div><button class="ib" id="wm-big" type="button" title="Phóng to video" aria-label="Phóng to video">'+IC.big+'</button><button class="ib" id="wm-min" type="button" title="Thu nhỏ" aria-label="Thu nhỏ">'+IC.min+'</button></div>'+
   '<div class="ch"><span id="wm-ch"></span><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>'+
   '<div class="ctl"><button id="wm-shuf" class="ib" type="button" title="Chọn ngẫu nhiên bài khác" aria-label="Ngẫu nhiên">'+IC.shuf+'</button><button id="wm-prev" type="button" title="Bài trước" aria-label="Bài trước">'+IC.prev+'</button><button id="wm-pp" class="pp" type="button" title="Phát / tạm dừng" aria-label="Phát">'+IC.play+'<i class="ld"></i></button><button id="wm-next" type="button" title="Bài ngẫu nhiên kế tiếp" aria-label="Bài kế tiếp">'+IC.next+'</button>'+
   '<span class="vol"><button id="wm-mute" class="ib on" type="button" title="Tắt / bật tiếng" aria-label="Tắt tiếng"></button><span class="vs"><input id="wm-vol" type="range" min="0" max="100" step="1" aria-label="Âm lượng"><b class="vt" id="wm-vt">50</b></span></span></div></div>';
  var f=document.createElement('button');f.id='wm-fab';f.type='button';f.title='Mở trình phát nhạc';f.setAttribute('aria-label','Mở trình phát nhạc');f.innerHTML=IC.note;
  document.body.appendChild(d);document.body.appendChild(f);
  $('#wm-pp').onclick=toggle;$('#wm-next').onclick=function(){go(pick(),true);};$('#wm-shuf').onclick=function(){go(pick(),true);};$('#wm-prev').onclick=function(){if(S.hist.length){var p=S.hist.pop();go(p,true,true);}else go(pick(),true);};
  $('#wm-min').onclick=function(){setMin(true);};f.onclick=function(){setMin(false);};
  $('#wm-big').onclick=function(){S.big=!S.big;ls('wm_big',S.big?'1':null);d.classList.toggle('big',S.big);};
  var v=$('#wm-vol'),vs=v.parentNode;
  v.oninput=function(){setVol(+v.value,true);};
  v.addEventListener('pointerdown',function(){vs.classList.add('drag');});window.addEventListener('pointerup',function(){vs.classList.remove('drag');});
  v.addEventListener('wheel',function(e){e.preventDefault();setVol(S.vol+(e.deltaY<0?5:-5),true);},{passive:false});
  $('#wm-mute').onclick=function(){if(S.vol>0){S.pre=S.vol;setVol(0,true);}else setVol(S.pre||50,true);};
  d.classList.toggle('big',S.big);setVol(S.vol,false);setMin(S.min);show();
}
function setMin(m){S.min=!!m;ls('wm_min',m?'1':'0');var d=$('#wm'),f=$('#wm-fab');if(!d)return;d.classList.toggle('min',m);f.classList.toggle('on',m);}
function marquee(text){
  var tt=$('#wm-tt');if(!tt)return;tt.classList.remove('mq');tt.innerHTML='<div class="mi"><span>'+esc(text)+'</span></div>';tt.firstChild.firstChild.style.paddingRight='0';
  setTimeout(function(){var mi=tt.firstChild,sp=mi.firstChild;if(!sp)return;if(sp.scrollWidth>tt.clientWidth-6){sp.style.paddingRight='';mi.appendChild(sp.cloneNode(true));mi.lastChild.setAttribute('aria-hidden','true');tt.classList.add('mq');mi.style.animationDuration=Math.max(10,Math.round(text.length*0.32))+'s';}},60);
}
function show(){
  var t=track(),art=$('#wm-art');if(!art)return;
  if(!S.player)art.style.backgroundImage='url("'+thumb(t.id)+'")';
  if(S.shown!==t.id){S.shown=t.id;marquee(t.t);}
  $('#wm-ch').innerHTML=(t.live?'<b>LIVE</b> ':'')+esc(t.ch);
  var pp=$('#wm-pp');pp.firstChild.outerHTML=S.playing?IC.pause:IC.play;pp.setAttribute('aria-label',S.playing?'Tạm dừng':'Phát');
  var d=$('#wm');d.classList.toggle('busy',!!S.busy);d.classList.toggle('playing',!!S.playing);var f=$('#wm-fab');if(f)f.classList.toggle('playing',S.playing);
}
function loadApi(){
  if(S.api)return S.api;
  S.api=new Promise(function(res,rej){
    if(window.YT&&window.YT.Player)return res();
    var prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(prev)try{prev();}catch(e){}res();};
    var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=function(){S.api=null;rej(new Error('yt'));};document.head.appendChild(s);
  });return S.api;
}
function mount(autoplay){
  S.busy=true;show();
  return loadApi().then(function(){
    if(S.player){return;}
    var host=$('#wm-art');host.style.backgroundImage='none';
    S.player=new YT.Player('wm-yt',{host:'https://www.youtube-nocookie.com',videoId:track().id,width:'100%',height:'100%',playerVars:{autoplay:autoplay?1:0,controls:0,rel:0,modestbranding:1,playsinline:1,disablekb:1,fs:0,iv_load_policy:3,origin:location.origin},
      events:{onReady:function(){S.ready=true;try{S.player.setVolume(S.vol);}catch(e){}if(autoplay)try{S.player.playVideo();}catch(e){}},
        onStateChange:function(e){var s=e.data;S.playing=(s===1||s===3);S.busy=(s===3);if(s===1){S.errs=0;S.busy=false;ls('wm_play',String(Date.now()));}if(s===0){go(pick(),true);return;}show();},
        onError:function(){if(++S.errs<6)go(pick(),true);else{S.busy=false;S.playing=false;show();}}}});
  }).catch(function(){S.busy=false;show();var tt=$('#wm-tt');if(tt)tt.firstChild.textContent='Không tải được YouTube (kiểm tra mạng hoặc chặn quảng cáo)';});
}
function toggle(){
  if(!S.player){S.started=true;mount(true);return;}
  if(!S.ready)return;try{var st=S.player.getPlayerState();if(st===1||st===3)S.player.pauseVideo();else S.player.playVideo();}catch(e){}
}
function go(n,play,fromHist){
  if(!fromHist)S.hist.push(S.cur);if(S.hist.length>30)S.hist.shift();S.cur=n;ls('wm_cur',track().id);show();
  if(S.player&&S.ready){try{if(play)S.player.loadVideoById(track().id);else S.player.cueVideoById(track().id);}catch(e){}}
  else if(play)toggle();
}
function start(){
  fetch('/api/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
    if(!j||!j.user)return;
    var v=+ls('wm_vol');S.vol=isNaN(v)||ls('wm_vol')===null?50:Math.max(0,Math.min(100,v));S.pre=S.vol||50;S.big=ls('wm_big')==='1';
    var mn=ls('wm_min');S.min=mn===null?window.innerWidth<=760:mn==='1';
    var last=ls('wm_cur'),k=LIST.map(function(x){return x.id;}).indexOf(last);S.cur=k>=0?k:Math.floor(Math.random()*LIST.length);
    build();
    // vừa chuyển trang trong lúc đang nghe: thử phát tiếp (trình duyệt có thể chặn, khi đó chỉ cần bấm Phát)
    var lp=+ls('wm_play');if(lp&&Date.now()-lp<20000&&!S.min){S.started=true;mount(true);}
  }).catch(function(){});
}
window.WebMusic={start:start,stop:function(){try{if(S.player)S.player.destroy();}catch(e){}['wm','wm-fab','wm-css'].forEach(function(i){var e=document.getElementById(i);if(e)e.remove();});S.player=null;S.ready=false;S.playing=false;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
