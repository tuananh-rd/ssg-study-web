
// ===== Chế độ tập trung + đồng hồ Pomodoro =====
var FOCUS_PRESETS=[{id:'25',name:'Pomodoro 25/5',w:25,s:5,l:15,d:'25 phút tập trung, nghỉ 5 phút; sau 4 phiên nghỉ dài 15 phút (Cirillo)'},{id:'50',name:'50/10',w:50,s:10,l:20,d:'50 phút tập trung, nghỉ 10 phút, hợp bài khó cần chìm sâu'},{id:'90',name:'90/20',w:90,s:20,l:30,d:'Chu kỳ ultradian ~90 phút (Kleitman), hợp buổi ôn dài'}];
var FOCUS_SCENES=['Sương xanh','Hoàng hôn dịu','Đêm tĩnh'];
var FC={on:false,phase:'work',left:0,running:false,count:0,endAt:0,timer:null,preset:'25',scene:0,fs:false};
try{FC.preset=localStorage.getItem('focus_preset')||'25';FC.scene=+localStorage.getItem('focus_scene')||0;}catch(e){}
function fcP(){return FOCUS_PRESETS.filter(function(p){return p.id===FC.preset;})[0]||FOCUS_PRESETS[0];}
function fcDur(ph){var p=fcP();return (ph==='work'?p.w:ph==='long'?p.l:p.s)*60;}
function fcStatGet(){var d=new Date().toISOString().slice(0,10),s={d:d,m:0,n:0};try{var x=JSON.parse(localStorage.getItem('focus_stat')||'null');if(x&&x.d===d)s=x;}catch(e){}return s;}
function fcStatAdd(m){var s=fcStatGet();s.m+=m;s.n++;try{localStorage.setItem('focus_stat',JSON.stringify(s));}catch(e){}}
function fcFmt(s){s=Math.max(0,Math.round(s));var m=Math.floor(s/60),r=s%60;return (m<10?'0':'')+m+':'+(r<10?'0':'')+r;}
function fcBeep(){try{var C=window.AudioContext||window.webkitAudioContext,c=new C(),t=c.currentTime;[660,880,1100].forEach(function(f,i){var o=c.createOscillator(),g=c.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.0001,t+i*.18);g.gain.exponentialRampToValueAtTime(.25,t+i*.18+.03);g.gain.exponentialRampToValueAtTime(.0001,t+i*.18+.16);o.connect(g);g.connect(c.destination);o.start(t+i*.18);o.stop(t+i*.18+.18);});setTimeout(function(){c.close();},900);}catch(e){}}
function fcEl(){var e=document.getElementById('fpom');if(e)return e;e=document.createElement('div');e.id='fpom';e.setAttribute('role','timer');document.body.appendChild(e);return e;}
function fcBrk(){var e=document.getElementById('fbreak');if(e)return e;e=document.createElement('div');e.id='fbreak';document.body.appendChild(e);return e;}
function fcScene(){for(var i=0;i<3;i++)document.body.classList.toggle('fm-'+i,FC.on&&FC.scene===i);}
function fcDraw(){
  if(!FC.on)return;var e=fcEl(),tot=fcDur(FC.phase),frac=tot?FC.left/tot:0,w=FC.phase==='work',st=fcStatGet();
  var lbl=w?'Tập trung · phiên '+(FC.count+1):(FC.phase==='long'?'Nghỉ dài':'Nghỉ ngắn');
  e.className=w?'work':'rest';
  var pp=FC.running?'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  e.innerHTML='<span class="fp-ring">'+ring(frac,40,5,'var(--fpc)','var(--line)')+'</span><span class="fp-t"><b>'+fcFmt(FC.left)+'</b><small>'+lbl+'</small></span>'+
    '<span class="fp-sep"></span><button type="button" class="iconbtn sm" id="fpPlay" title="'+(FC.running?'Tạm dừng':'Chạy')+'" aria-label="'+(FC.running?'Tạm dừng':'Chạy')+'">'+pp+'</button>'+
    '<button type="button" class="iconbtn sm" id="fpSkip" title="Bỏ qua sang pha kế" aria-label="Bỏ qua"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 5v14l9-7zM17 5h2v14h-2z"/></svg></button>'+
    '<button type="button" class="iconbtn sm" id="fpRst" title="Đặt lại pha này" aria-label="Đặt lại"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg></button>'+
    '<span class="fp-sep"></span><button type="button" class="fp-pre" id="fpPre" title="'+esc(fcP().d)+' — bấm để đổi">'+esc(fcP().name)+'</button><button type="button" class="fp-pre" id="fpScn" title="Đổi nền">Nền: '+FOCUS_SCENES[FC.scene]+'</button><span class="fp-stat" title="Tổng thời gian tập trung hôm nay">Hôm nay '+st.m+'′</span>'+
    '<button type="button" class="btn sm" id="fpExit">Thoát</button>';
  $('#fpPlay',e).onclick=function(){fcRun(!FC.running);};
  $('#fpSkip',e).onclick=function(){fcNext(true);};
  $('#fpRst',e).onclick=function(){FC.left=fcDur(FC.phase);FC.endAt=Date.now()+FC.left*1000;fcDraw();};
  $('#fpPre',e).onclick=function(){var k=FOCUS_PRESETS.indexOf(fcP());FC.preset=FOCUS_PRESETS[(k+1)%FOCUS_PRESETS.length].id;try{localStorage.setItem('focus_preset',FC.preset);}catch(x){}FC.phase='work';FC.left=fcDur('work');FC.endAt=Date.now()+FC.left*1000;fcBreakShow();toast(fcP().name+': '+fcP().d);fcDraw();};
  $('#fpScn',e).onclick=function(){FC.scene=(FC.scene+1)%3;try{localStorage.setItem('focus_scene',FC.scene);}catch(x){}fcScene();fcDraw();};
  $('#fpExit',e).onclick=function(){focusOff();};
}
function fcRun(on){FC.running=on;if(on)FC.endAt=Date.now()+FC.left*1000;fcDraw();}
function fcNext(manual){
  if(FC.phase==='work'){var done=fcDur('work')-FC.left;if(!manual||done>=60)fcStatAdd(Math.round(done/60));if(!manual)FC.count++;FC.phase=(!manual&&FC.count%4===0)?'long':'short';}
  else FC.phase='work';
  FC.left=fcDur(FC.phase);FC.endAt=Date.now()+FC.left*1000;FC.running=true;
  fcBreakShow();fcDraw();
}
function fcBreakShow(){
  var b=fcBrk();
  if(FC.phase==='work'||!FC.on){b.className='';b.innerHTML='';return;}
  var tips=['Đứng dậy, vươn vai và uống một ly nước.','Nhìn ra xa 6 mét trong 20 giây (quy tắc 20-20-20) để mắt nghỉ.','Hít vào 4 giây, giữ 4 giây, thở ra 6 giây, lặp lại vài lần.','Đừng lướt điện thoại: nghỉ thật thì não mới ghi nhớ tốt hơn.'];
  b.className='on';b.innerHTML='<div class="fb-card"><div class="fb-k">'+(FC.phase==='long'?'Nghỉ dài':'Nghỉ ngắn')+'</div><div class="fb-t" id="fbT">'+fcFmt(FC.left)+'</div><p>'+tips[Math.floor(Math.random()*tips.length)]+'</p><p class="small muted">Đã xong '+FC.count+' phiên · hôm nay '+fcStatGet().m+' phút tập trung</p><div class="row" style="justify-content:center;gap:8px"><button type="button" class="btn primary" id="fbSkip">Quay lại học ngay</button></div></div>';
  $('#fbSkip',b).onclick=function(){fcNext(true);};
}
function fcTick(){
  if(!FC.on||!FC.running)return;
  FC.left=Math.max(0,Math.round((FC.endAt-Date.now())/1000));
  var t=document.getElementById('fbT');if(t)t.textContent=fcFmt(FC.left);
  var e=document.getElementById('fpom');if(e){var s=e.querySelector('.fp-t b');if(s)s.textContent=fcFmt(FC.left);var rg=e.querySelector('.fp-ring');if(rg){var tot=fcDur(FC.phase);rg.innerHTML=ring(tot?FC.left/tot:0,40,5,'var(--fpc)','var(--line)');}}
  if(FC.left<=0){fcBeep();var w=FC.phase==='work';fcNext(false);toast(w?'Hết phiên tập trung, nghỉ thôi!':'Hết giờ nghỉ, vào học tiếp!');}
}
function focusOn(){
  if(FC.on)return;FC.on=true;document.body.classList.add('focus-mode');fcScene();
  if(!FC.left){FC.phase='work';FC.left=fcDur('work');}
  FC.running=true;FC.endAt=Date.now()+FC.left*1000;
  clearInterval(FC.timer);FC.timer=setInterval(fcTick,500);
  var de=document.documentElement;try{if(de.requestFullscreen&&!document.fullscreenElement){FC.fs=true;de.requestFullscreen().catch(function(){FC.fs=false;});}}catch(e){FC.fs=false;}
  fcDraw();fcBreakShow();var b=document.getElementById('focusBtn');if(b)b.classList.add('on');
}
function focusOff(){
  if(!FC.on)return;
  if(FC.phase==='work'){var d=fcDur('work')-FC.left;if(d>=60)fcStatAdd(Math.round(d/60));}
  FC.on=false;FC.running=false;clearInterval(FC.timer);document.body.classList.remove('focus-mode');fcScene();
  FC.left=0;FC.phase='work';
  var e=document.getElementById('fpom');if(e)e.remove();var b=document.getElementById('fbreak');if(b)b.remove();
  var wasFs=FC.fs;FC.fs=false;if(wasFs&&document.fullscreenElement){try{document.exitFullscreen();}catch(x){}}
  var fb=document.getElementById('focusBtn');if(fb)fb.classList.remove('on');
}
function focusToggle(){if(FC.on)focusOff();else focusOn();}
document.addEventListener('fullscreenchange',function(){if(FC.on&&FC.fs&&!document.fullscreenElement)focusOff();});
document.addEventListener('keydown',function(e){if((e.key==='f'||e.key==='F')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName||'')&&document.getElementById('focusBtn'))focusToggle();});
