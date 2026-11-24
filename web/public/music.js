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
var CSS='#wm{position:fixed;left:78px;bottom:20px;z-index:79;width:340px;max-width:calc(100vw - 96px);background:#181818;color:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.4);padding:10px;display:flex;gap:10px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'+
'#wm.min{display:none}#wm-fab{position:fixed;left:78px;bottom:20px;z-index:79;width:50px;height:50px;border-radius:50%;border:0;background:#181818;color:#1ed760;display:none;place-items:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35)}#wm-fab.on{display:grid}#wm-fab.playing{animation:wmspin 3s linear infinite}#wm-fab:hover{transform:scale(1.06)}'+
'@keyframes wmspin{0%,100%{box-shadow:0 0 0 0 rgba(30,215,96,.5)}50%{box-shadow:0 0 0 8px rgba(30,215,96,0)}}'+
'#wm .art{flex:none;width:96px;height:96px;border-radius:10px;overflow:hidden;background:#000 center/cover no-repeat;position:relative;align-self:flex-start}#wm .art iframe,#wm .art>div{position:absolute;inset:0;width:100%;height:100%;border:0}'+
'#wm.big{flex-wrap:wrap;width:min(420px,calc(100vw - 96px))}#wm.big .art{width:100%;height:auto;aspect-ratio:16/9}'+
'#wm .in{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}#wm .row1{display:flex;align-items:center;gap:6px}#wm .tt{flex:1;min-width:0;overflow:hidden;white-space:nowrap;font-weight:700;font-size:.92rem;-webkit-mask:linear-gradient(90deg,#000 88%,transparent);mask:linear-gradient(90deg,#000 88%,transparent)}'+
'#wm .tt span{display:inline-block}#wm .tt.mq span{animation:wmq 14s linear infinite;padding-right:40px}@keyframes wmq{0%,12%{transform:translateX(0)}100%{transform:translateX(-100%)}}'+
'#wm .ch{color:#b3b3b3;font-size:.8rem;display:flex;align-items:center;gap:6px;min-width:0}#wm .ch b{background:#e22134;color:#fff;border-radius:4px;font-size:.62rem;padding:1px 5px;letter-spacing:.04em}'+
'#wm .ctl{display:flex;align-items:center;gap:2px;margin-top:2px}#wm button{border:0;background:none;color:#fff;cursor:pointer;display:inline-grid;place-items:center;border-radius:50%;padding:6px}#wm button:hover{background:rgba(255,255,255,.12)}#wm .pp{width:40px;height:40px;background:#fff;color:#000;margin:0 4px}#wm .pp:hover{background:#fff;transform:scale(1.07)}'+
'#wm .ib{color:#b3b3b3}#wm .ib:hover{color:#fff}#wm .sp{flex:1}'+
'#wm .vol{display:flex;align-items:center;gap:4px;color:#b3b3b3}#wm input[type=range]{width:64px;accent-color:#1ed760;height:4px}'+
'#wm .ld{width:40px;height:40px;border:3px solid #444;border-top-color:#1ed760;border-radius:50%;animation:wmsp 0.8s linear infinite;display:none}#wm.busy .pp svg{display:none}#wm.busy .ld{display:block;position:absolute}'+
'@keyframes wmsp{to{transform:rotate(360deg)}}'+
'body.focus-mode #wm{bottom:20px}'+
'@media(max-width:760px){#wm,#wm-fab{left:14px;bottom:132px}#wm{max-width:calc(100vw - 28px);width:calc(100vw - 28px)}#wm .vol{display:none}}';
function track(){return LIST[S.cur];}
function pick(avoid){var n,tries=0;do{n=Math.floor(Math.random()*LIST.length);tries++;}while((n===S.cur||S.hist.slice(-4).indexOf(n)>=0)&&tries<30&&LIST.length>5);return n;}
function thumb(id){return 'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg';}
function build(){
  if($('#wm'))return;
  var st=document.createElement('style');st.id='wm-css';st.textContent=CSS;document.head.appendChild(st);
  var d=document.createElement('div');d.id='wm';d.setAttribute('role','region');d.setAttribute('aria-label','Nhạc học bài');
  d.innerHTML='<div class="art" id="wm-art"><div id="wm-yt"></div></div><div class="in"><div class="row1"><div class="tt" id="wm-tt"><span></span></div><button class="ib" id="wm-big" type="button" title="Phóng to video" aria-label="Phóng to video">'+IC.big+'</button><button class="ib" id="wm-min" type="button" title="Thu nhỏ" aria-label="Thu nhỏ">'+IC.min+'</button></div>'+
   '<div class="ch" id="wm-ch"></div><div class="ctl"><button id="wm-shuf" class="ib" type="button" title="Chọn ngẫu nhiên bài khác" aria-label="Ngẫu nhiên">'+IC.shuf+'</button><button id="wm-prev" type="button" title="Bài trước" aria-label="Bài trước">'+IC.prev+'</button><button id="wm-pp" class="pp" type="button" title="Phát / tạm dừng" aria-label="Phát">'+IC.play+'<i class="ld"></i></button><button id="wm-next" type="button" title="Bài ngẫu nhiên kế tiếp" aria-label="Bài kế tiếp">'+IC.next+'</button><span class="sp"></span><span class="vol">'+IC.vol+'<input id="wm-vol" type="range" min="0" max="100" aria-label="Âm lượng"></span></div></div>';
  var f=document.createElement('button');f.id='wm-fab';f.type='button';f.title='Mở trình phát nhạc';f.setAttribute('aria-label','Mở trình phát nhạc');f.innerHTML=IC.note;
  document.body.appendChild(d);document.body.appendChild(f);
  $('#wm-pp').onclick=toggle;$('#wm-next').onclick=function(){go(pick(),true);};$('#wm-shuf').onclick=function(){go(pick(),true);};$('#wm-prev').onclick=function(){if(S.hist.length){var p=S.hist.pop();go(p,true,true);}else go(pick(),true);};
  $('#wm-min').onclick=function(){setMin(true);};f.onclick=function(){setMin(false);};
  $('#wm-big').onclick=function(){S.big=!S.big;ls('wm_big',S.big?'1':null);d.classList.toggle('big',S.big);};
  var v=$('#wm-vol');v.value=S.vol;v.oninput=function(){S.vol=+v.value;ls('wm_vol',String(S.vol));if(S.player&&S.player.setVolume)S.player.setVolume(S.vol);};
  d.classList.toggle('big',S.big);setMin(S.min);show();
}
function setMin(m){S.min=!!m;ls('wm_min',m?'1':'0');var d=$('#wm'),f=$('#wm-fab');if(!d)return;d.classList.toggle('min',m);f.classList.toggle('on',m);}
function show(){
  var t=track(),art=$('#wm-art');if(!art)return;
  if(!S.player)art.style.backgroundImage='url("'+thumb(t.id)+'")';
  var tt=$('#wm-tt');tt.firstChild.textContent=t.t;tt.classList.remove('mq');setTimeout(function(){if(tt.firstChild.scrollWidth>tt.clientWidth+4)tt.classList.add('mq');},50);
  $('#wm-ch').innerHTML=(t.live?'<b>LIVE</b>':'')+'<span>'+esc(t.ch)+'</span>';
  var pp=$('#wm-pp');pp.firstChild.outerHTML=S.playing?IC.pause:IC.play;pp.setAttribute('aria-label',S.playing?'Tạm dừng':'Phát');
  $('#wm').classList.toggle('busy',!!S.busy);var f=$('#wm-fab');if(f)f.classList.toggle('playing',S.playing);
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
    var v=+ls('wm_vol');S.vol=isNaN(v)||ls('wm_vol')===null?50:Math.max(0,Math.min(100,v));S.big=ls('wm_big')==='1';
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
