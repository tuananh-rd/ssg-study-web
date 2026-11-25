// Hiệu ứng "đổi chủ ngôi vương": toàn màn hình, Chúa tể Tuất mới lên ngôi. Gọi: WebThrone.show({uid,name,prev,pts,title,pv,me})
(function(){
if(window.WebThrone)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var RED=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
var HOUSE='<svg class="tn-house" viewBox="0 0 200 170" aria-hidden="true"><defs><linearGradient id="tnw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a05b"/><stop offset="1" stop-color="#8a5a2b"/></linearGradient><linearGradient id="tnr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2574c"/><stop offset="1" stop-color="#8f1d1d"/></linearGradient></defs><rect x="24" y="66" width="152" height="104" rx="4" fill="url(#tnw)"/><g stroke="#6b4220" stroke-opacity=".45" stroke-width="1.5"><path d="M24 92H176M24 118H176M24 144H176"/></g><path d="M58 170V104Q58 74 100 74Q142 74 142 104V170Z" fill="#1d0e05"/><path d="M6 76L100 8L194 76Z" fill="url(#tnr)" stroke="#5a1010" stroke-width="2" stroke-linejoin="round"/><g stroke="#5a1010" stroke-opacity=".5" stroke-width="1.5"><path d="M30 60H170M52 44H148M76 28H124"/></g><rect x="62" y="76" width="76" height="7" rx="3" fill="#5a1010" opacity=".6"/></svg>';
var DOGE='<svg class="tn-doge" viewBox="0 0 64 58" aria-hidden="true"><path d="M7 26L11 3L29 15Z" fill="#e8963a"/><path d="M57 26L53 3L35 15Z" fill="#e8963a"/><path d="M12 22L14 9L23 15Z" fill="#f7c58a"/><path d="M52 22L50 9L41 15Z" fill="#f7c58a"/><ellipse cx="32" cy="34" rx="27" ry="22" fill="#f0a24a"/><ellipse cx="32" cy="45" rx="18" ry="12" fill="#fff1dc"/><path d="M26 15Q32 22 38 15Q32 19 26 15Z" fill="#fff1dc"/><circle cx="20" cy="28" r="2.4" fill="#2a1608"/><circle cx="44" cy="28" r="2.4" fill="#2a1608"/><ellipse cx="32" cy="38" rx="5.2" ry="3.6" fill="#1f1209"/><path d="M32 41.5V45M32 45Q27 49 22.5 45M32 45Q37 49 41.5 45" fill="none" stroke="#1f1209" stroke-width="1.6" stroke-linecap="round"/><path class="tg" d="M29 47.5Q32 56 35 47.5Z" fill="#ff7a8a"/><g class="gl"><rect x="7" y="22" width="22" height="9" fill="#0b0b0b"/><rect x="35" y="22" width="22" height="9" fill="#0b0b0b"/><rect x="29" y="24" width="6" height="3" fill="#0b0b0b"/><rect x="4" y="23" width="4" height="3" fill="#0b0b0b"/><rect x="56" y="23" width="4" height="3" fill="#0b0b0b"/><rect x="10" y="24" width="5" height="2" fill="#fff" opacity=".85"/><rect x="38" y="24" width="5" height="2" fill="#fff" opacity=".85"/></g></svg>';
var CROWN='<svg class="tn-crown" viewBox="0 0 80 56" aria-hidden="true"><defs><linearGradient id="tnc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#d9962a"/></linearGradient></defs><path d="M6 48L2 12L22 28L40 4L58 28L78 12L74 48Z" fill="url(#tnc)" stroke="#8a5a00" stroke-width="2.5" stroke-linejoin="round"/><rect x="6" y="44" width="68" height="9" rx="3" fill="#e0a02e" stroke="#8a5a00" stroke-width="2"/><circle cx="40" cy="30" r="5" fill="#e2574c" stroke="#8f1d1d" stroke-width="1.5"/><circle cx="20" cy="38" r="3.4" fill="#4fc3f7"/><circle cx="60" cy="38" r="3.4" fill="#66e08a"/><circle cx="2" cy="12" r="3" fill="#fff3b0"/><circle cx="78" cy="12" r="3" fill="#fff3b0"/><circle cx="40" cy="4" r="3" fill="#fff3b0"/></svg>';
var MEME=['wow','much quiz','such học','gâu!','very đỉnh','so smart','🦴','bonk','much điểm','🐾','cheems','gâu gâu','🏆','👑','much vương','such ngôi'];
var CSS='@keyframes tnIn{from{opacity:0}to{opacity:1}}@keyframes tnOut{to{opacity:0}}'+
'@keyframes tnSpin{to{transform:rotate(360deg)}}@keyframes tnShake{0%,100%{transform:translate(0)}20%{transform:translate(-7px,3px) rotate(-1deg)}40%{transform:translate(6px,-4px) rotate(1deg)}60%{transform:translate(-5px,-2px)}80%{transform:translate(4px,4px)}}'+
'@keyframes tnTitle{0%{opacity:0;transform:scale(2.4) rotate(-6deg);letter-spacing:.5em}60%{opacity:1;transform:scale(.92) rotate(1deg)}100%{opacity:1;transform:scale(1);letter-spacing:.06em}}'+
'@keyframes tnOld{0%{opacity:0;transform:translateY(10px)}15%{opacity:1;transform:none}70%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-10px) scale(.9)}}'+
'@keyframes tnHouse{0%{transform:translate(-50%,120%)}70%{transform:translate(-50%,-6%)}85%{transform:translate(-50%,3%)}100%{transform:translate(-50%,0)}}'+
'@keyframes tnAv{0%{opacity:0;transform:translate(-50%,-50%) scale(0) rotate(-200deg)}70%{opacity:1;transform:translate(-50%,-50%) scale(1.18) rotate(8deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}}'+
'@keyframes tnCrown{0%{opacity:0;transform:translate(-50%,-420px) rotate(-25deg)}55%{opacity:1;transform:translate(-50%,6px) rotate(6deg)}72%{transform:translate(-50%,-16px) rotate(-3deg)}88%{transform:translate(-50%,2px) rotate(1deg)}100%{opacity:1;transform:translate(-50%,0) rotate(0)}}'+
'@keyframes tnBob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-6px)}}'+
'@keyframes tnPop{0%{opacity:0;transform:translateY(24px) scale(.7)}70%{opacity:1;transform:translateY(-3px) scale(1.05)}100%{opacity:1;transform:none}}'+
'@keyframes tnFall{0%{transform:translate(0,-12vh) rotate(0);opacity:0}8%{opacity:1}100%{transform:translate(var(--dx),108vh) rotate(var(--r));opacity:1}}'+
'@keyframes tnBurst{0%{transform:translate(-50%,-50%) scale(0);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}'+
'@keyframes tnGl{0%,18%{transform:translateY(-26px);opacity:0}30%{transform:translateY(2px);opacity:1}40%,100%{transform:translateY(0);opacity:1}}'+
'@keyframes tnWag{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(24deg)}}@keyframes tnTg{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.45)}}'+
'@keyframes tnShine{from{background-position:160% 0}to{background-position:-60% 0}}'+
'#tn-ov{position:fixed;inset:0;z-index:420;overflow:hidden;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 45%,rgba(90,40,10,.86),rgba(10,5,2,.95) 70%);color:#fff;font-family:"Comic Sans MS","Comic Neue",system-ui,sans-serif;animation:tnIn .4s both;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
'#tn-ov.out{animation:tnOut .5s both}#tn-ov.shake .tn-st{animation:tnShake .5s 1}'+
'.tn-rays{position:absolute;left:50%;top:46%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;background:repeating-conic-gradient(from 0deg,rgba(255,190,90,.2) 0 5deg,transparent 5deg 13deg);-webkit-mask:radial-gradient(circle,#000 4%,transparent 55%);mask:radial-gradient(circle,#000 4%,transparent 55%);animation:tnSpin 40s linear infinite;pointer-events:none}'+
'.tn-st{position:relative;width:min(560px,94vw);height:min(640px,94vh);text-align:center}'+
'.tn-top{position:absolute;left:0;right:0;top:2%;font:800 clamp(1.2rem,4.4vw,1.9rem)/1.1 "Comic Sans MS","Comic Neue",system-ui,sans-serif;color:#ffe9b0;text-shadow:0 0 18px rgba(255,150,40,.9),2px 2px 0 #7a2c00;animation:tnTitle .9s .15s both cubic-bezier(.2,.9,.3,1.2)}'+
'.tn-old{position:absolute;left:0;right:0;top:14%;font-size:.95rem;color:rgba(255,230,190,.85);animation:tnOld 3.2s .9s both}.tn-old s{opacity:.85;color:#ff9b8a;font-weight:700}'+
'.tn-stage{position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-120px 0 0 -150px}'+
'.tn-house{position:absolute;left:50%;bottom:-10px;width:300px;height:255px;transform:translate(-50%,120%);animation:tnHouse .9s 1.1s both cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 8px 22px rgba(0,0,0,.6))}'+
'.tn-av{position:absolute;left:50%;top:67%;width:112px;height:112px;border-radius:50%;opacity:0;transform:translate(-50%,-50%) scale(0);display:grid;place-items:center;overflow:visible;font:800 3rem system-ui;color:#fff;border:4px solid #ffd27a;box-shadow:0 0 0 4px rgba(255,180,60,.4),0 0 40px 10px rgba(255,170,50,.65);animation:tnAv .8s 1.7s both cubic-bezier(.2,.9,.3,1.1)}'+
'.tn-av img{width:100%;height:100%;border-radius:50%;object-fit:cover}'+
'.tn-av::before{content:"";position:absolute;inset:-18px;border-radius:50%;background:conic-gradient(#ffb347,transparent 40%,#fff1d6 55%,transparent 75%,#ffb347);z-index:-1;animation:tnSpin 2.4s linear infinite;-webkit-mask:radial-gradient(circle,transparent 58px,#000 59px);mask:radial-gradient(circle,transparent 58px,#000 59px)}'+
'.tn-crw{position:absolute;left:50%;top:calc(67% - 112px);width:120px;margin-left:0;opacity:0;transform:translate(-50%,-420px);animation:tnCrown 1s 2.35s both cubic-bezier(.3,.8,.4,1);filter:drop-shadow(0 4px 10px rgba(0,0,0,.6));z-index:3}'+
'.tn-crw .tn-crown{display:block;width:100%;overflow:visible}.tn-crw.on{animation:tnCrown 1s 2.35s both cubic-bezier(.3,.8,.4,1),tnBob 2.4s 3.4s ease-in-out infinite}'+
'.tn-dg{position:absolute;left:50%;top:calc(67% - 164px);width:64px;margin-left:-32px;opacity:0;z-index:4;animation:tnPop .6s 3.1s both}.tn-dg .tn-doge{display:block;width:100%;overflow:visible}.tn-dg .gl{animation:tnGl 4s 3.4s ease-in-out infinite}.tn-dg .tg{transform-box:fill-box;transform-origin:top center;animation:tnTg .5s ease-in-out infinite}'+
'.tn-wow{position:absolute;left:calc(50% + 46px);top:calc(67% - 178px);white-space:nowrap;font:700 .95rem/1 "Comic Sans MS","Comic Neue",system-ui,sans-serif;color:#ffe15a;text-shadow:0 0 8px rgba(255,150,0,.95),1px 1px 0 #9a3b00;opacity:0;animation:tnPop .5s 3.3s both;transform-origin:left bottom}'+
'.tn-fl{position:absolute;bottom:4%;font-size:2rem;transform-origin:50% 90%;animation:tnWag .5s ease-in-out infinite}.tn-fl.l{left:-4px}.tn-fl.r{right:-4px;animation-delay:.25s}'+
'.tn-info{position:absolute;left:0;right:0;bottom:2%;opacity:0;animation:tnPop .7s 3.0s both}'+
'.tn-rib{display:inline-block;padding:7px 28px;font:800 clamp(.8rem,2.8vw,1rem)/1 "Comic Sans MS","Comic Neue",system-ui,sans-serif;letter-spacing:.22em;color:#3a1c00;background:linear-gradient(90deg,transparent,#d9822b 10%,#ffd9a0 50%,#d9822b 90%,transparent);text-shadow:0 1px 0 rgba(255,255,255,.45)}'+
'.tn-nm{margin:12px 0 4px;font:800 clamp(1.6rem,6.2vw,2.5rem)/1.1 "Comic Sans MS","Comic Neue",system-ui,sans-serif;background:linear-gradient(90deg,#ffd9a0,#fff,#ffb347,#ffd9a0);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:tnShine 3s linear infinite;word-break:break-word;padding:0 10px}'+
'.tn-sub{color:rgba(255,235,205,.9);font-size:1rem}.tn-sub b{color:#ffc46b}'+
'.tn-hint{margin-top:10px;font-size:.78rem;color:rgba(255,235,205,.55)}'+
'.tn-cf{position:absolute;inset:0;pointer-events:none;overflow:hidden}.tn-cf i{position:absolute;top:0;font-style:normal;white-space:nowrap;font:700 var(--sz) "Comic Sans MS","Comic Neue",system-ui,sans-serif;color:var(--c);text-shadow:0 0 5px rgba(0,0,0,.8),1px 1px 0 rgba(0,0,0,.6);opacity:0;animation:tnFall var(--d) var(--w) linear infinite}'+
'.tn-fw{position:absolute;pointer-events:none;width:12px;height:12px;border-radius:50%;opacity:0;animation:tnBurst 1.3s var(--w) ease-out infinite;box-shadow:0 -60px 0 -2px var(--c),0 60px 0 -2px var(--c),60px 0 0 -2px var(--c),-60px 0 0 -2px var(--c),42px 42px 0 -2px var(--c),-42px 42px 0 -2px var(--c),42px -42px 0 -2px var(--c),-42px -42px 0 -2px var(--c),0 -90px 0 -4px #fff,0 90px 0 -4px #fff,90px 0 0 -4px #fff,-90px 0 0 -4px #fff}'+
'@media(max-width:520px){.tn-stage{transform:scale(.82);margin-top:-110px}.tn-top{top:0}}'+
'@media(prefers-reduced-motion:reduce){#tn-ov *,#tn-ov{animation-duration:.01s!important;animation-delay:0s!important;animation-iteration-count:1!important}.tn-rays,.tn-cf,.tn-fw{display:none}}';
function css(){if(document.getElementById('tn-css'))return;var s=document.createElement('style');s.id='tn-css';s.textContent=CSS;document.head.appendChild(s);}
var AVC=['#e8963a','#3b5bdb','#1c8ea8','#7a4fd1','#c0275a','#3f8f5a'];
function show(d){
  d=d||{};if(document.getElementById('tn-ov'))return;css();
  var name=d.name||'Ẩn danh',ini=(String(name).match(/[A-Za-zÀ-ỹ]/g)||['?'])[0].toUpperCase();
  var o=document.createElement('div');o.id='tn-ov';o.setAttribute('role','alertdialog');o.setAttribute('aria-label','Ngôi vương đổi chủ: '+name);
  var cf='';for(var i=0;i<26;i++){var t=MEME[i%MEME.length],dx=(Math.random()*160-80).toFixed(0)+'px',sz=(.9+Math.random()*.9).toFixed(2)+'rem';
    cf+='<i style="left:'+(Math.random()*96).toFixed(1)+'%;--dx:'+dx+';--r:'+(Math.random()*720-360).toFixed(0)+'deg;--sz:'+sz+';--c:hsl('+((i*47)%360)+',100%,72%);--d:'+(4+Math.random()*3.5).toFixed(1)+'s;--w:'+(2.2+Math.random()*4.5).toFixed(1)+'s">'+esc(t)+'</i>';}
  var fw='',FC=['#ffb347','#7ae0ff','#ff7aa8','#9dff7a','#ffe15a'];for(var k=0;k<5;k++)fw+='<span class="tn-fw" style="left:'+(14+k*18)+'%;top:'+(18+(k%2)*22+(k*3))+'%;--c:'+FC[k]+';--w:'+(2.4+k*.55).toFixed(2)+'s"></span>';
  o.innerHTML='<div class="tn-rays"></div><div class="tn-cf">'+fw+cf+'</div>'+
   '<div class="tn-st"><div class="tn-top">👑 NGÔI VƯƠNG ĐỔI CHỦ! 👑</div>'+
   (d.prev?'<div class="tn-old"><s>'+esc(d.prev)+'</s> đã bị lật đổ…</div>':'')+
   '<div class="tn-stage">'+HOUSE+'<span class="tn-fl l">🦴</span><span class="tn-fl r">🐾</span>'+
   '<div class="tn-av" style="background:'+AVC[Math.abs(+d.uid||0)%AVC.length]+'">'+(d.pv?'<img src="/api/profile/avatar/'+(+d.uid)+'?v='+(+d.pv)+'" alt="">':esc(ini))+'</div>'+
   '<div class="tn-crw on">'+CROWN+'</div><div class="tn-dg">'+DOGE+'</div><span class="tn-wow">wow</span></div>'+
   '<div class="tn-info"><span class="tn-rib">CHÚA TỂ TUẤT MỚI</span><div class="tn-nm">'+esc(name)+(d.me?' (BẠN!)':'')+'</div>'+
   '<div class="tn-sub">'+(d.title?esc(d.title)+' · ':'')+'<b>'+String(+d.pts||0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+'</b> điểm</div><div class="tn-hint">gâu gâu 🐾 bấm bất kỳ đâu để đóng</div></div></div>';
  document.body.appendChild(o);
  setTimeout(function(){o.classList.add('shake');},180);
  var closed=false,tm=setTimeout(close,13000);
  function close(){if(closed)return;closed=true;clearTimeout(tm);document.removeEventListener('keydown',kd,true);o.classList.add('out');setTimeout(function(){o.remove();},520);}
  function kd(e){if(e.key==='Escape'){e.stopPropagation();close();}}
  o.addEventListener('click',close);document.addEventListener('keydown',kd,true);
  return close;
}
window.WebThrone={show:show};
document.dispatchEvent(new Event('throne-ready'));
})();
