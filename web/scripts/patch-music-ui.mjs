import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/web/public/music.js'; let a = fs.readFileSync(f, 'utf8');
const i0 = a.indexOf("var CSS='"), i1 = a.indexOf('function loadApi()'); if (i0 < 0 || i1 < 0) { console.log('không thấy mốc'); process.exit(1); }
const CHUNK = String.raw`var CSS='#wm{position:fixed;left:78px;bottom:20px;z-index:79;width:372px;max-width:calc(100vw - 96px);color:#fff;border-radius:18px;padding:11px;display:flex;gap:12px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;animation:wmin .45s cubic-bezier(.2,.9,.3,1.2);box-sizing:border-box}'+
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
`;
a = a.slice(0, i0) + CHUNK + a.slice(i1);
// khi tạo player: áp dụng âm lượng đã chọn
a = a.replace("try{S.player.setVolume(S.vol);}catch(e){}if(autoplay)", "try{S.player.setVolume(S.vol);}catch(e){}if(autoplay)");
a = a.replace("var v=+ls('wm_vol');S.vol=isNaN(v)||ls('wm_vol')===null?50:Math.max(0,Math.min(100,v));", "var v=+ls('wm_vol');S.vol=isNaN(v)||ls('wm_vol')===null?50:Math.max(0,Math.min(100,v));S.pre=S.vol||50;");
fs.writeFileSync(f, a); console.log('ok');
