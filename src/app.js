(function(){
'use strict';
var D=window.DATA;
// Thông tin môn: bản web gắn D.subject cho từng môn; bản offline SSG105 không có thì dùng mặc định.
var SJ=D.subject||{id:'ssg105',name:'SSG105',title:'Ôn thi cuối kỳ',aiField:'SSG105 – Communication and In-Group Working Skills (kỹ năng giao tiếp và làm việc nhóm)',key:'ssg105_progress_v2',peer:'ssg105-duel-',bankTitle:'Bộ đề SSG105',slides:true};
D.questions=D.questions||[];D.past=D.past||[];D.pastExams=D.pastExams||[];D.glossary=D.glossary||[];D.quick=D.quick||[];D.compares=D.compares||[];D.keyq=D.keyq||[];D.recall=D.recall||[];D.bank=D.bank||[];
// ---------- helpers ----------
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function pad(n){return String(n).padStart(2,'0');}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function today(){return ymd(new Date());}
function diffDays(a,b){return Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5);}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function fmtTime(s){s=Math.max(0,Math.round(s));return pad(Math.floor(s/60))+':'+pad(s%60);}
function pct(x){return Math.round(x*100)+'%';}
var MOD={};D.modules.forEach(function(m){MOD[m.id]=m;});
var QMODS=D.modules.filter(function(m){return !m.noQuiz;});   // chương có câu hỏi ôn (bỏ M1 – tổng quan môn)
var ALLQ=D.questions.concat(D.past||[]);
var RECALL=D.recall||[];
// câu hỏi lại lý thuyết của 1 chương (và 1 mục nếu có), giữ đúng thứ tự trong bài
function recallOf(m,s){return RECALL.filter(function(q){return q.module===m&&(!s||q.ref===s);});}
function secTitle(ref){var m=MOD[modOfRef(ref)],s=m&&m.sections.filter(function(x){return x.id===ref;})[0];return s?s.t:'';}
function recallDone(list){return list.filter(function(q){var a=P.answers[q.id];return a&&a.lastOk;}).length;}
// Bộ đề SSG105 (470 câu tiếng Anh, có câu chọn nhiều đáp án). Chủ đề → chương gần nhất để tính độ chính xác.
var TOPIC_MOD=D.topicMod||{'Trí tuệ cảm xúc, stress & văn hoá':'m4','Làm việc nhóm & tâm lý nhóm':'m2','Thuyết trình & thuyết phục':'m9','Tư duy phản biện, sáng tạo & giải quyết vấn đề':'m5',
  'Viết trong kinh doanh (email, báo cáo, đề xuất)':'m6','Giao tiếp phi ngôn ngữ':'m9','Giao tiếp & kỹ năng mềm':'m2','Nghề nghiệp, CV & phỏng vấn':'m10','Cuộc họp':'m5',
  'Xung đột & phản hồi':'m5','Quyền lực & lãnh đạo':'m4','So sánh xã hội':'m2'};
var KEEP_RE=/\b(all|none|both)\b|above|the others/i;
var BANK=(D.bank||[]).map(function(b){var ans=b.answer.map(function(i){return b.options[i];});
  return {id:'b-'+b.id,no:b.id,bank:true,type:'bank',module:TOPIC_MOD[b.topic]||QMODS[0].id,topic:b.topic,section:b.section,slide:b.slide,img:b.img,q:b.question,orig:b.options,
    answers:ans,correct:ans.join(' + '),wrong:b.options.filter(function(o){return ans.indexOf(o)<0;}),keep:b.options.some(function(o){return KEEP_RE.test(o);}),explain:b.explanation||'',ref:null};});
var SLIDES_BANK=SJ.slides?BANK.filter(function(q){return q.slide>=8&&q.slide<=176;}).sort(function(a,b){return a.slide-b.slide;}):[];
// Môn không có bộ câu "kiểu đề thi" riêng (DAP/AIL/CPV): bộ đề chính là nguồn cho luyện tập, trộn và thi thử (thi thử chỉ lấy câu 1 đáp án).
if(!D.questions.length)ALLQ=BANK.slice();
var PQ=D.questions.length?D.questions:BANK;
var EXAMQ=D.questions.length?D.questions:BANK.filter(function(q){return q.answers.length===1;});
// Kiến thức key: quiz viết tay ôn các ý bắt buộc phải nhớ
var KEYQ=(D.keyq||[]).map(function(k,i){return {id:'k-'+String(i+1).padStart(3,'0'),module:modOfRef(k.ref),ref:k.ref,type:'key',q:k.q,correct:k.correct,wrong:k.wrong,explain:k.explain,tip:k.tip};});
function keyOf(m){return KEYQ.filter(function(q){return !m||q.module===m;});}
var QMAP={};ALLQ.concat(RECALL,BANK,KEYQ).forEach(function(q){QMAP[q.id]=q;});
var ALLQ_ID={};ALLQ.forEach(function(q){ALLQ_ID[q.id]=1;});
var EXAMS={};(D.pastExams||[]).forEach(function(e){EXAMS[e.id]=e;});
// text of a question in a language: past-exam questions are always in their original English
var XL=D.xl||{};Object.keys(XL).forEach(function(id){var q=QMAP[id];if(!q)return;if(q.bank)q.vi=XL[id];else if(!q.en)q.en=XL[id];});
function T(q,lang){return (lang==='en'&&q.en)?q.en:q;}
function plang(){return P.settings.lang||'vi';}
function srcTag(q){if(q.bank)return '<span class="tag">Bộ đề · câu '+q.no+'</span> <span class="tag">'+esc(q.section)+'</span>';return q.past?'<span class="tag warn">Đề kì trước · '+esc(q.exam)+' câu '+q.no+'</span>'+(q.unsure?' <span class="tag">đáp án chưa chắc chắn</span>':''):'';}
function modOfRef(r){return 'm'+String(r).split('.')[0];}
function refLink(r){return '#/learn/'+modOfRef(r)+'?s='+r;}
function dot(m){return '<span class="dot" style="background:'+MOD[m].color+'"></span>';}
function qCount(m){return (D.questions.length?D.questions:BANK).filter(function(q){return q.module===m;}).length;}
var L='ABCDEF';
function keyIdx(e,n){var k=e.key.toUpperCase(),i='123456'.indexOf(k);if(i<0)i=L.indexOf(k);return i>=0&&i<n?i:-1;}
function qhtml(s){return esc(s).replace(/\n/g,'<br>');}
var ICON={close:'<path d="M18 6L6 18M6 6l12 12"/>',check:'<path d="M20 6L9 17l-5-5"/>',checkc:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',clip:'<path d="M21.4 11.1l-9.2 9.2a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5"/>',expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/>',ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01"/>',trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>',play:'<path d="M7 4v16l13-8z"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',book:'<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>',pen:'<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h9"/>',clock:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',x:'<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',cards:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 012 2v12"/>',chat:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',layers:'<path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/>',bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',moon:'<path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',swords:'<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M14.5 6.5L18 3h3v3l-3.5 3.5"/><path d="M5 14l4 4M7 17l-3 3M3 19l2 2"/>',flag:'<path d="M4 21V4M4 4h12l-2 4 2 4H4"/>'};
function ic(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+ICON[n]+'</svg>';}

// ---------- store ----------
var KEY=SJ.key,canSave=true,P;
function blank(){return {version:2,settings:{examDate:'',theme:'auto',lang:'vi'},answers:{},recent:{},mistakes:{},exams:[],examInProgress:null,read:{},lastLesson:null,cards:{},quiz:null};}
function hydrate(o){var r=Object.assign(blank(),o||{});r.settings=Object.assign(blank().settings,(o&&o.settings)||{});return r;}
function load(){try{var s=localStorage.getItem(KEY);P=hydrate(s?JSON.parse(s):null);localStorage.setItem(KEY+'_p','1');localStorage.removeItem(KEY+'_p');}catch(e){if(!P)P=blank();canSave=false;}}
function save(){if(!canSave)return banner();try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){canSave=false;banner();}}
function banner(){var b=$('#banner');if(b){b.style.display='block';b.innerHTML='Trình duyệt đang chặn lưu trữ — tiến độ chỉ giữ trong phiên này. <a href="#" id="bnExp">Xuất file sao lưu</a>';$('#bnExp').onclick=function(e){e.preventDefault();exportData();};}}

// ---------- stats ----------
function modAcc(m){var r=P.recent[m]||[];return r.length?r.reduce(function(a,b){return a+b;},0)/r.length:null;}
function overallAcc(){var s=0,n=0;D.modules.forEach(function(m){(P.recent[m.id]||[]).forEach(function(v){s+=v;n++;});});return n?s/n:0;}
function coverage(){return Object.keys(P.answers).filter(function(k){return ALLQ_ID[k];}).length/ALLQ.length;}
function lastExam(){return P.exams[P.exams.length-1]||null;}
function readiness(){var le=lastExam();return Math.round(100*(0.6*overallAcc()+0.25*coverage()+0.15*(le?le.score/10:0)));}
function mistakeIds(){return Object.keys(P.mistakes).filter(function(k){return QMAP[k];});}
function daysLeft(){return P.settings.examDate?diffDays(today(),P.settings.examDate):null;}
function barClass(v){return v==null?'':v<0.5?'red':v<0.8?'yellow':'green';}
function weakest(){
  var list=QMODS.slice().map(function(m){var a=modAcc(m.id),n=(P.recent[m.id]||[]).length;return {m:m,score:(a==null?-1:(n<10?a-0.3:a))-m.priority*0.02};});
  list.sort(function(a,b){return a.score-b.score;});return list[0].m;
}
// ---------- ghi nhật ký hoạt động (chỉ khi chạy trên web có tài khoản; quản trị viên được cấp quyền mới xem được) ----------
var TRK={q:[],t:0};
function track(type,detail){
  if(!window.AI_SERVER||!SJ||!SJ.id)return;
  TRK.q.push({type:type,ts:Date.now(),detail:detail||{}});if(TRK.q.length>200)TRK.q.shift();
  clearTimeout(TRK.t);TRK.t=setTimeout(trackFlush,TRK.q.length>=20?200:6000);
}
function trackFlush(){
  if(!TRK.q.length)return;var ev=TRK.q.splice(0,40);
  try{fetch('/api/event',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'content-type':'application/json','x-requested-with':'ssg-web'},body:JSON.stringify({subject:SJ.id,events:ev})}).then(function(r){if(!r.ok&&r.status>=500)TRK.q=ev.concat(TRK.q);}).catch(function(){TRK.q=ev.concat(TRK.q).slice(-200);});}catch(e){}
  if(TRK.q.length){clearTimeout(TRK.t);TRK.t=setTimeout(trackFlush,1500);}
}
addEventListener('pagehide',trackFlush);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')trackFlush();});
// Đo thời gian đọc lý thuyết (chỉ tính khi đang xem bài, tab hiển thị và có thao tác trong 2,5 phút gần nhất (đọc chữ thường không đụng chuột)) → điểm bảng xếp hạng
var RT={sec:0,mod:'',act:Date.now()};
['mousemove','keydown','scroll','touchstart','pointerdown','wheel'].forEach(function(ev){addEventListener(ev,function(){RT.act=Date.now();},{passive:true,capture:true});});
function rtFlush(){if(RT.sec>=5){track('read_time',{mod:RT.mod,secs:Math.min(120,RT.sec)});}RT.sec=0;}
setInterval(function(){
  var m=/^#\/learn\/([^?\/]+)/.exec(location.hash||'');
  if(m&&document.visibilityState==='visible'&&Date.now()-RT.act<150000){if(RT.mod&&RT.mod!==m[1])rtFlush();RT.mod=m[1];RT.sec+=5;if(RT.sec>=30)rtFlush();}
  else if(RT.sec)rtFlush();
},5000);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')rtFlush();});
function record(q,ok,quiet){
  if(!quiet)track('quiz_answer',{id:q.id,ok:!!ok,src:q.bank?'bank':(q.type||'q'),mod:q.module||'',ref:q.ref||'',retry:q._retry||0});
  var a=P.answers[q.id]||(P.answers[q.id]={seen:0,correct:0});a.seen++;if(ok)a.correct++;a.lastOk=ok;
  var r=P.recent[q.module]||(P.recent[q.module]=[]);r.push(ok?1:0);if(r.length>20)r.splice(0,r.length-20);
  var m=P.mistakes[q.id];
  if(!ok){m=m||{wrong:0,streak:0};m.wrong++;m.streak=0;P.mistakes[q.id]=m;}
  else if(m){m.streak++;if(m.streak>=2)delete P.mistakes[q.id];}
  save();
}

// ---------- ui primitives ----------
var content,keyHandler=null,timers=[];
function setKeys(f){keyHandler=f;}
function every(f,ms){timers.push(setInterval(f,ms));}
function clearTimers(){timers.forEach(clearInterval);timers=[];}
function toast(m){var t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(function(){t.style.display='none';},2200);}
function modal(html,btns){return new Promise(function(res){
  btns=btns||[{t:'Đóng',v:null,primary:true}];var m=$('#modal');
  m.innerHTML='<div class="box" role="dialog" aria-modal="true">'+html+'<div class="row" style="justify-content:flex-end;margin-top:18px">'+btns.map(function(b,i){return '<button class="btn '+(b.primary?'primary':'')+(b.danger?' danger':'')+'" data-i="'+i+'">'+esc(b.t)+'</button>';}).join('')+'</div></div>';
  m.style.display='flex';
  function close(v){m.style.display='none';m.innerHTML='';document.removeEventListener('keydown',kd,true);res(v);}
  function kd(e){if(e.key==='Escape'){e.stopPropagation();close(null);}}
  document.addEventListener('keydown',kd,true);
  $$('[data-i]',m).forEach(function(b){b.onclick=function(){close(btns[+b.dataset.i].v);};});
  m.onclick=function(e){if(e.target===m)close(null);};
  m.__close=close;var f=$('.btn.primary',m);if(f)f.focus();
});}
function confirmBox(msg,yes,danger){return modal('<p style="margin-top:0">'+msg+'</p>',[{t:'Hủy',v:false},{t:yes,v:true,primary:!danger,danger:!!danger}]);}
function render(h){
  if(TH.open&&h.indexOf('id="thBtn"')<0)thClose();
  var rc=(P&&P.quiz&&(cur===''||cur==='practice'||cur==='bank'||cur==='review')&&h.indexOf('class="qtop"')<0&&h.indexOf('qres')<0)?resumeCard():'';
  content.innerHTML=rc+h;window.scrollTo(0,0);
  var dr=document.getElementById('rcDrop');if(dr)dr.onclick=function(){confirmBox('Bỏ bài đang làm dở? Tiến độ của bài này sẽ không được giữ lại.','Bỏ bài',true).then(function(y){if(y){P.quiz=null;save();go();}});};
}
function bind(sel,ev,fn,root){$$(sel,root||content).forEach(function(el){el.addEventListener(ev,function(e){fn.call(el,e,el);});});}
function ring(v,size,stroke,col,track){var r=(size-stroke)/2,c=2*Math.PI*r;return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+track+'" stroke-width="'+stroke+'" fill="none"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+col+'" stroke-width="'+stroke+'" fill="none" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+c*(1-v)+'"/></svg>';}

// ---------- ngăn lý thuyết bên cạnh + hỏi lại câu sai + điều hướng mục ----------
function reaskGap(){var v=parseInt(localStorage.getItem('ui_reask'),10);return isNaN(v)?5:v;}
function allSecs(){var o=[];D.modules.forEach(function(m){m.sections.forEach(function(s){o.push({mod:m.id,id:s.id,t:s.t});});});return o;}
function nextSecOf(ref){var all=allSecs(),k=-1;all.forEach(function(s,i){if(s.id===ref)k=i;});return k>=0&&k+1<all.length?all[k+1]:null;}
var TH={open:false,mod:'',ref:''};
function thEl(){var e=document.getElementById('thdock');if(e)return e;e=document.createElement('aside');e.id='thdock';e.className='thdock';e.setAttribute('aria-label','Lý thuyết');document.body.appendChild(e);return e;}
function thClose(){TH.open=false;var e=document.getElementById('thdock');if(e)e.classList.remove('open');document.body.classList.remove('th-open');}
function thOpen(mod,ref,keep){
  if(ref&&!mod)mod=modOfRef(ref);
  var m=MOD[mod];if(!m||!m.sections.length)return;
  if(!ref||!m.sections.some(function(s){return s.id===ref;}))ref=m.sections[0].id;
  var s=m.sections.filter(function(x){return x.id===ref;})[0],el=thEl();
  TH.open=true;TH.mod=mod;TH.ref=ref;
  el.innerHTML='<div class="th-head"><div style="min-width:0"><div class="small muted">'+esc(m.short)+' · '+esc(m.title)+'</div><b>§'+s.id+' '+esc(s.t)+'</b></div><div class="row" style="gap:6px;flex:none"><a class="iconbtn sm" target="_blank" rel="noopener" href="'+location.pathname+'#/learn/'+mod+'?s='+ref+'" title="Mở trang đầy đủ ở tab mới" aria-label="Mở trang đầy đủ ở tab mới">'+ic('ext')+'</a><button type="button" class="iconbtn sm" id="thx" aria-label="Đóng">'+ic('close')+'</button></div></div>'+
    '<div class="th-chips">'+m.sections.map(function(x){return '<button type="button" class="chip'+(x.id===ref?' on':'')+'" data-ths="'+x.id+'" title="'+esc(x.t)+'">§'+x.id+'</button>';}).join('')+'</div>'+
    '<div class="th-body prose">'+tidyLesson(s.h)+'</div>';
  el.classList.add('open');document.body.classList.add('th-open');
  var dk=document.querySelector('.dock');if(dk){dk.classList.remove('open');document.body.classList.remove('dock-open');}
  $('#thx',el).onclick=thClose;$$('[data-ths]',el).forEach(function(b){b.onclick=function(){thOpen(mod,b.dataset.ths);};});
  if(!keep){var bd=el.querySelector('.th-body');if(bd)bd.scrollTop=0;}
}
function hasLang(q,l){return l==='en'?!!(q.bank||q.en):!!(!q.bank||q.vi);}
function quizTools(q,lang){
  var g=reaskGap(),has=!!(q&&(q.ref||(q.module&&MOD[q.module])));
  return '<span class="qtools"><span class="qlang" role="group" aria-label="Ngôn ngữ câu hỏi"><button type="button" data-ql="vi" class="'+(lang==='vi'?'on':'')+'" title="Tiếng Việt">VI</button><button type="button" data-ql="en" class="'+(lang==='en'?'on':'')+'" title="English">EN</button></span>'+(hasLang(q,lang)?'':'<span class="tag" title="Câu này chưa có bản dịch sang ngôn ngữ đang chọn, đang hiển thị bản gốc">chưa có bản dịch</span>')+(has?'<button type="button" class="btn sm" id="thBtn" title="Mở lý thuyết bên cạnh (phím T)">'+ic('book')+'<span>Lý thuyết</span></button>':'')+
    '<span class="rgap" title="Câu trả lời sai sẽ được hỏi lại sau số câu bạn chọn"><span class="small muted">Hỏi lại câu sai</span><span class="qlang rg" role="group" aria-label="Hỏi lại câu sai sau bao nhiêu câu">'+[[0,'Tắt'],[3,'3'],[5,'5'],[10,'10']].map(function(o){return '<button type="button" data-rg="'+o[0]+'" class="'+(g===o[0]?'on':'')+'" title="'+(o[0]?'Sau '+o[0]+' câu':'Không hỏi lại')+'">'+o[1]+'</button>';}).join('')+'</span></span></span>';
}

// ---------- quiz runner (practice, lesson check, mistakes) ----------
function quizRestore(s){return s.items.map(function(it){var q=QMAP[it[0]];return q?(it[1]?Object.assign({},q,{_retry:it[1]}):q):null;}).filter(Boolean);}
function resumeCard(){
  var s=P.quiz;if(!s||!s.items||!s.items.length)return '';
  var n=s.items.length,pos=Math.min(s.i+1,n);
  return '<div class="card resume-card"><div class="rc-ic">'+ic('clock')+'</div><div class="rc-t"><b>Bạn đang làm dở một bài</b><div class="small muted">'+esc(s.title)+' · câu '+pos+'/'+n+' · đã đúng '+s.score+' câu</div></div><div class="row" style="gap:8px;flex:none"><a class="btn primary sm" href="#/resume">Tiếp tục '+ic('arrow')+'</a><button type="button" class="btn sm ghost" id="rcDrop">Bỏ</button></div></div>';
}
function runQuiz(list,title,back,lang,resume){
  list=list.slice();var i=0,score=0,wrong=[],base=list.length,seen={},fixed=0,t0=Date.now(),spent=0,qkey=title+'|'+back;
  if(resume){i=Math.min(resume.i||0,list.length);score=resume.score||0;fixed=resume.fixed||0;seen=resume.seen||{};spent=resume.spent||0;base=resume.base||list.length;wrong=(resume.wrong||[]).map(function(id){return QMAP[id];}).filter(Boolean);}
  function persist(ix){try{P.quiz={key:qkey,title:title,back:back,lang:lang,items:list.map(function(q){return [q.id,q._retry||0];}),i:ix,score:score,fixed:fixed,seen:seen,base:base,wrong:wrong.map(function(q){return q.id;}),spent:spent+Math.round((Date.now()-t0)/1000),at:Date.now()};save();}catch(e){}}lang=localStorage.getItem('ui_qlang')||lang||plang();
  function show(){
    if(i>=list.length)return done();
    persist(i);
    var q=list[i],t=T(q,lang),answered=false,sel=[],tv=(q.bank&&lang==='vi'&&q.vi)?q.vi:null;
    function od(o){return tv?(tv.options[(q.orig||[]).indexOf(o)]||o):o;}
    // q.orig: câu có sẵn danh sách đáp án gốc (đề kì trước, bộ đề); q.keep: giữ nguyên thứ tự (có "All of the above"…)
    var opts=q.orig?(q.keep?q.orig.slice():shuffle(q.orig)):shuffle([t.correct].concat(t.wrong));
    var good=q.answers||[t.correct],multi=good.length>1;
    var head=q.bank?esc(q.topic):(q.type==='recall'||q.type==='key'?'§'+q.ref+' '+esc(secTitle(q.ref)):esc(MOD[q.module].title));
    render('<div class="qtop"><a class="btn sm ghost" href="'+back+'" aria-label="Thoát bài làm">'+ic('close')+'</a><div class="bar"><i style="width:'+(i/list.length*100)+'%"></i></div><span class="small muted">'+(i+1)+'/'+list.length+'</span>'+quizTools(q,lang)+'</div>'+
      (!localStorage.getItem('ssg_quiz_tip_dismissed')?'<div class="quiz-tip-pill" id="quizTip"><span class="qt-ic">'+ic('info')+'</span><span class="qt-txt"><b>Gợi ý sử dụng.</b> Bôi đen cụm từ tiếng Anh để xem bản dịch; dùng nút Gợi ý bên dưới khi cần định hướng cách làm.</span><button class="qt-close" id="qtClose" aria-label="Đóng">'+ic('close')+'</button></div>':'')+
      '<div class="qlay"><aside class="qside" id="aib" aria-label="Bố Tuấn Anh"></aside><div class="card qmain"><div class="row small muted">'+(q.bank?'':dot(q.module)+MOD[q.module].short+' · ')+head+' '+(q._retry?'<span class="tag warn">Hỏi lại câu đã sai</span> ':'')+srcTag(q)+(q.bank||q.past||(lang==='en'&&q.en)?'<button class="link-btn" id="trb" style="margin-left:auto">Dịch</button>':'')+'</div><div class="q">'+qhtml(tv?tv.q:t.q)+(multi?' <span class="tag warn">Chọn '+good.length+' đáp án</span>':'')+'</div>'+(q.img?'<img class="q-img" src="'+esc(q.img)+'" alt="Hình của câu hỏi">':'')+'<div id="trx"></div><div class="opts">'+opts.map(function(o,k){return '<button class="opt" data-k="'+k+'"><b>'+L[k]+'</b><span>'+esc(od(o))+'</span></button>';}).join('')+'</div><div id="fb"></div><div id="nxw"></div></div></div>'+
      '<p class="small muted hide-m">Phím tắt: <kbd>1</kbd>–<kbd>'+opts.length+'</kbd> hoặc <kbd>A</kbd>–<kbd>'+L[opts.length-1]+'</kbd> để chọn'+(multi?', <kbd>Enter</kbd> để kiểm tra rồi sang câu tiếp.':', <kbd>Enter</kbd> để sang câu tiếp.')+'</p>');
    $$('[data-ql]').forEach(function(b){b.onclick=function(){var nl=b.dataset.ql;if(nl===lang)return;lang=nl;try{localStorage.setItem('ui_qlang',lang);}catch(e){}if(answered){toast('Ngôn ngữ mới áp dụng từ câu tiếp theo');$$('[data-ql]').forEach(function(x){x.classList.toggle('on',x.dataset.ql===lang);});}else show();};});
    if($('#focusBtn'))$('#focusBtn').onclick=function(){focusToggle();};
    qsideResize();
    if($('#thBtn'))$('#thBtn').onclick=function(){if(TH.open)thClose();else thOpen(q.module,q.ref);};
    $$('[data-rg]').forEach(function(b){b.onclick=function(){var v=+b.dataset.rg;try{localStorage.setItem('ui_reask',v);}catch(e){}$$('[data-rg]').forEach(function(x){x.classList.toggle('on',x===b);});toast(v?'Câu sai sẽ được hỏi lại sau '+v+' câu':'Đã tắt hỏi lại câu sai');};});
    if(TH.open&&(q.ref||q.module))thOpen(q.module,q.ref,true);
    if($('#qtClose'))$('#qtClose').onclick=function(){localStorage.setItem('ssg_quiz_tip_dismissed','1');var p=$('#quizTip');if(p)p.remove();};
    if(multi)$('#nxw').innerHTML='<div class="sticky-act"><button class="btn primary big" id="chk" disabled>Kiểm tra</button></div>';
    function toggle(k){if(answered)return;var x=sel.indexOf(k);if(x>=0)sel.splice(x,1);else sel.push(k);
      $$('.opt').forEach(function(b,j){b.classList.toggle('sel',sel.indexOf(j)>=0);});$('#chk').disabled=!sel.length;}
    function pick(k){if(multi)return toggle(k);sel=[k];check();}
    function check(){
      if(answered||!sel.length)return;answered=true;
      var chosen=sel.map(function(k){return opts[k];}),ok=chosen.length===good.length&&chosen.every(function(c){return good.indexOf(c)>=0;});
      var first=!seen[q.id];seen[q.id]=1;
      if(first){if(ok)score++;else wrong.push(q);}else if(ok)fixed++;
      record(q,ok);
      var gp=reaskGap();if(!ok&&gp>0&&(q._retry||0)<3){var cl=Object.assign({},q,{_retry:(q._retry||0)+1});list.splice(Math.min(i+1+gp,list.length),0,cl);}
      $$('.opt').forEach(function(b,j){b.disabled=true;b.classList.remove('sel');if(good.indexOf(opts[j])>=0)b.classList.add('ok');else if(sel.indexOf(j)>=0)b.classList.add('bad');else b.classList.add('dim');});
      var ans=good.map(function(g){return L[opts.indexOf(g)]+'. '+od(g);}).join(' · ');
      $('#fb').innerHTML='<div class="feedback '+(ok?'ok':'bad')+'"><b>'+(ok?'Chính xác!':'Chưa đúng — đáp án: '+esc(ans))+'</b>'+esc(q.bank?'':(q.explain||''))+((q.ref||(q.module&&MOD[q.module]))?' <button type="button" class="link-btn" data-thref="'+(q.ref||'')+'" data-thmod="'+(q.module||'')+'">Xem lý thuyết'+(q.ref?' §'+q.ref:'')+'</button>':'')+(q.tip?'<div class="ktip">'+ic('bulb')+'<span><b>Mẹo nhớ:</b> '+esc(q.tip)+'</span></div>':'')+(lang==='en'&&q.en?'<div class="small muted" style="margin-top:6px">Tiếng Việt: '+esc(q.q)+' → <b>'+esc(q.correct)+'</b></div>':'')+'</div>';
      $('#nxw').innerHTML='<div class="sticky-act"><button class="btn primary big" id="nx">'+(i===list.length-1?'Xem kết quả':'Câu tiếp theo')+' '+ic('arrow')+'</button></div>';
      $$('[data-thref]',$('#fb')).forEach(function(bt){bt.onclick=function(){thOpen(bt.dataset.thmod,bt.dataset.thref);};});
      persist(i+1);
      ctx.answered=true;ctx.picked=multi?chosen:chosen[0];
      $('#aib')._aiDraw();aiAutoCheck($('#aib'),q,getCtx);
      $('#nx').onclick=next;$('#nx').focus({preventScroll:true});practiceExplain(q,T(q,lang),opts,good,$('#nx'));
    }
    function next(){i++;show();}
    var ctx={lang:lang,opts:opts,picked:null,answered:false};function getCtx(){return ctx;}
    aiBox($('#aib'),q,getCtx);
    if($('#trb'))$('#trb').onclick=function(){trToggle($('#trx'),$('#trb'),q,opts);};
    if($('#chk'))$('#chk').onclick=check;
    bind('.opt','click',function(e,b){pick(+b.dataset.k);});
    setKeys(function(e){if((e.key==='t'||e.key==='T')&&$('#thBtn')){$('#thBtn').click();return true;}var n=keyIdx(e,opts.length);if(n>=0&&!answered){pick(n);return true;}if(e.key==='Enter'){if(!answered&&multi){check();return true;}if(answered){next();return true;}}});
  }
  function done(){
    P.quiz=null;save();track('quiz_finish',{title:title,n:base,score:score,fixed:fixed,secs:spent+Math.round((Date.now()-t0)/1000)});
    setKeys(null);var p=base?score/base:0,qs0=list.filter(function(q){return !q._retry;}),secs=allSecs(),ord={};secs.forEach(function(s,k){ord[s.id]=k;});
    var refs=[];qs0.forEach(function(q){if(q.ref&&refs.indexOf(q.ref)<0)refs.push(q.ref);});refs.sort(function(x,y){return (ord[x]||0)-(ord[y]||0);});
    var lastQ=qs0[qs0.length-1]||{},modId=refs.length?modOfRef(refs[refs.length-1]):(lastQ.module||''),acts='',nxt=null;
    if(refs.length)acts+='<a class="btn" href="#/learn/'+modOfRef(refs[0])+'?s='+refs[0]+'">'+ic('book')+' '+(refs.length===1?'Đọc lại §'+refs[0]+' '+esc(secTitle(refs[0])):'Đọc lại lý thuyết')+'</a>';
    else if(MOD[modId])acts+='<a class="btn" href="#/learn/'+modId+'">'+ic('book')+' Đọc lại chương '+esc(MOD[modId].short)+'</a>';
    if(refs.length)nxt=nextSecOf(refs[refs.length-1]);
    else if(MOD[modId]){var mi=D.modules.indexOf(MOD[modId]),nm=D.modules[mi+1];if(nm&&nm.sections.length)nxt={mod:nm.id,id:nm.sections[0].id,t:nm.sections[0].t};}
    if(nxt){acts+='<a class="btn primary" href="#/learn/'+nxt.mod+'?s='+nxt.id+'">Đọc tiếp §'+nxt.id+' '+esc(nxt.t)+' '+ic('arrow')+'</a>';if(recallOf(nxt.mod,nxt.id).length)acts+='<a class="btn" href="#/practice?recall='+nxt.mod+'&s='+nxt.id+'">Ôn mục tiếp theo</a>';}
    var sec=spent+Math.round((Date.now()-t0)/1000),tm=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
    render('<div class="card empty qres"><div class="ring" style="margin:0 auto 10px">'+ring(p,118,10,p>=.8?'var(--ok)':p>=.5?'#f59f00':'var(--bad)','var(--panel2)')+'<b>'+score+'/'+base+'<small>'+pct(p)+'</small></b></div><h1 style="margin-bottom:4px">'+(p>=.8?'Rất tốt!':p>=.5?'Khá ổn, cố thêm chút nữa':'Cần ôn lại')+'</h1><p class="muted" style="margin-top:0">'+esc(title)+'</p>'+
      '<div class="res-stats"><div><b>'+score+'/'+base+'</b><span>đúng ngay lần đầu</span></div><div><b>'+fixed+'</b><span>câu sai đã sửa khi hỏi lại</span></div><div><b>'+wrong.length+'</b><span>câu cần xem lại</span></div><div><b>'+tm+'</b><span>thời gian làm</span></div></div>'+
      (acts?'<div class="res-section"><div class="small muted">Học tiếp</div><div class="row" style="justify-content:center;gap:8px">'+acts+'</div></div>':'')+
      '<div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="again">Làm lượt mới</button>'+(wrong.length?'<a class="btn" href="#/mistakes">Làm lại câu sai</a>':'')+'<a class="btn ghost" href="#/">Trang chủ</a></div></div>'+
      (wrong.length?'<h2>Câu sai lượt này</h2>'+wrong.map(function(q){var t=T(q,lang);return '<div class="card"><div style="font-weight:600">'+qhtml(t.q)+'</div><div class="small" style="margin-top:6px">Đáp án: <b style="color:var(--ok)">'+esc(t.correct)+'</b></div><div class="small muted">'+(q.explain&&q.explain.length<260?esc(q.explain):'')+(q.ref?' <a href="'+refLink(q.ref)+'">§'+q.ref+'</a>':'')+'</div></div>';}).join(''):''));
    bind('#again','click',function(){go();});
  }
  show();
}

/*@AI@*/

// ---------- ROUTES ----------
var routes={};
// ===== Home =====
routes['']=function(){
  var r=readiness(),dl=daysLeft(),mis=mistakeIds().length,w=weakest(),le=lastExam(),cta;
  if(P.examInProgress)cta=['Tiếp tục bài thi thử','Bài thi đang làm dở, đồng hồ vẫn chạy.','#/exam'];
  else if(mis>=5)cta=['Làm lại '+mis+' câu sai','Câu ra khỏi sổ khi trả lời đúng 2 lần liên tiếp.','#/mistakes'];
  else cta=['Luyện '+w.short+': '+w.title,modAcc(w.id)==null?'Chương này bạn chưa luyện câu nào.':'Độ chính xác hiện tại '+pct(modAcc(w.id))+' — chương yếu nhất.','#/practice?m='+w.id];
  render('<div class="card hero"><div><div class="small" style="opacity:.85;font-weight:600">'+(dl==null?'<a href="#" id="setDate" style="color:#fff;text-decoration:underline">Đặt ngày thi</a>':dl<0?'Đã qua ngày thi':dl===0?'Hôm nay thi — bình tĩnh nhé!':'Còn '+dl+' ngày đến ngày thi')+'</div>'+
    '<h1 style="margin:.25em 0 .1em">'+esc(cta[0])+'</h1><p>'+esc(cta[1])+'</p><div class="row"><a class="btn" href="'+cta[2]+'">Bắt đầu '+ic('arrow')+'</a><a class="btn ghost" href="#/exam">Thi thử 50 câu</a></div></div>'+
    '<div class="ring">'+ring(r/100,118,10,'#fff','rgba(255,255,255,.25)')+'<b>'+r+'%<small>sẵn sàng</small></b></div></div>'+
    '<div class="stats"><div class="stat"><b>'+pct(overallAcc())+'</b><span>Độ chính xác gần đây</span></div><div class="stat"><b>'+Math.round(coverage()*ALLQ.length)+'/'+ALLQ.length+'</b><span>Câu đã làm</span></div><div class="stat"><b>'+(le?le.score.toFixed(1):'—')+'</b><span>Thi thử gần nhất</span></div></div>'+
    (KEYQ.length?'<a class="card keycard" href="#/practice?tab=key"><span class="kc-ic">'+ic('bulb')+'</span><span style="flex:1;min-width:0"><b>Kiến thức key</b><span class="small muted" style="display:block">'+KEYQ.length+' câu ôn nhanh các ý bắt buộc phải nhớ · đã thuộc '+recallDone(KEYQ)+'/'+KEYQ.length+'</span></span><span class="btn sm primary">Ôn ngay '+ic('arrow')+'</span></a>':'')+'<div class="card"><div class="row between"><h3 style="margin:0">Theo chương</h3><span class="small muted">20 câu gần nhất mỗi chương</span></div>'+
    QMODS.map(function(m){var a=modAcc(m.id);return '<div class="mrow"><a class="nm" href="#/learn/'+m.id+'" style="color:var(--text)">'+dot(m.id)+'<span><b>'+m.short+'</b> '+esc(m.title)+'</span></a><div class="bar '+barClass(a)+'"><i style="width:'+(a==null?0:a*100)+'%"></i></div><span class="small muted">'+(a==null?'—':pct(a))+'</span><div class="row act"><a class="btn sm" href="#/learn/'+m.id+'">Đọc</a>'+(recallOf(m.id).length?'<a class="btn sm" href="#/practice?recall='+m.id+'">Ôn lý thuyết</a>':'')+'</div></div>';}).join('')+
    '</div><p class="small muted">Điểm sẵn sàng = 60% độ chính xác gần đây + 25% độ phủ ngân hàng câu + 15% điểm thi thử gần nhất. Mục tiêu: thi thử ≥ 8/10 hai lần liên tiếp và sổ câu sai ≤ 10 câu.</p>');
  bind('#setDate','click',function(e){e.preventDefault();openSettings();});
};

// ===== Learn =====
function tidyLesson(h){
  var d=document.createElement('div');d.innerHTML=h;
  // 1. bảng chứa code → khối code có nhãn ngôn ngữ + nút chép
  d.querySelectorAll('table').forEach(function(t){
    if(!t.querySelector('td')&&t.querySelector('code')){
      t.querySelectorAll('br').forEach(function(b){b.replaceWith('\n');});
      var rows=[].map.call(t.querySelectorAll('tr'),function(r){return r.textContent;}),code=rows.join('\n').replace(/^\n+|\s+$/g,'');
      var lang=/^\s*(SELECT|INSERT|CREATE|UPDATE|DELETE)\b/im.test(code)?'sql':/\b(import|def|print|cv2\.|np\.|pd\.|plt\.|from)\b/.test(code)?'python':'code';
      var w=document.createElement('div');w.className='cb';w.innerHTML='<div class="cb-h"><span></span><button type="button" class="cb-copy">Chép</button></div><pre><code></code></pre>';
      w.querySelector('span').textContent=lang;w.querySelector('code').textContent=code;t.replaceWith(w);
    }else{var w2=document.createElement('div');w2.className='tbl-wrap';t.parentNode.insertBefore(w2,t);w2.appendChild(t);}
  });
  // 2. chỗ hình còn lại: gộp các chỗ liền nhau thành một khung "hình trong tài liệu gốc"
  d.querySelectorAll('.img-ph').forEach(function(x){
    var p=x.previousSibling;while(p&&p.nodeType===3&&!p.textContent.trim())p=p.previousSibling;
    if(p&&p.nodeType===1&&p.classList&&p.classList.contains('fig-ph')){x.remove();return;}
    var f=document.createElement('span');f.className='fig-ph';f.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg><span>Hình minh hoạ trong slide gốc</span>';x.replaceWith(f);
  });
  d.querySelectorAll('p').forEach(function(p){var only=p.querySelector('.fig-ph')&&!p.textContent.replace('Hình minh hoạ trong slide gốc','').trim();if(!only)return;var pv=p.previousElementSibling;if(pv&&pv.classList.contains('fig-only')){var c=pv.querySelector('.fig-n'),k=(+pv.dataset.n||1)+1;pv.dataset.n=k;c.textContent=k+' hình';p.parentNode.removeChild(p);}else{p.classList.add('fig-only');p.dataset.n=1;var sp=document.createElement('b');sp.className='fig-n';p.querySelector('.fig-ph').appendChild(sp);}});
  // 3. văn bản: $…$ → công thức KaTeX; λ1, σ2… → chỉ số dưới
  var tw=document.createTreeWalker(d,NodeFilter.SHOW_TEXT,null),ns=[],n;
  while((n=tw.nextNode())){if(n.parentNode.closest&&n.parentNode.closest('code,pre,.cb,.mj'))continue;if(/\$[^$]+\$|[λσθαβμεΔ][0-9]|[A-Za-z]_[A-Za-z0-9]/.test(n.textContent))ns.push(n);}
  ns.forEach(function(t){
    var s=t.textContent,frag=document.createDocumentFragment(),re=/\$\$([^$]+)\$\$|\$([^$\n]+)\$|([λσθαβμεΔ])([0-9])|(?<![A-Za-z0-9_])([A-Za-z])_([A-Za-z0-9]{1,2})(?![A-Za-z0-9_])/g,last=0,m;
    while((m=re.exec(s))){
      if(m.index>last)frag.appendChild(document.createTextNode(s.slice(last,m.index)));
      if(m[3]||m[5]){var sp=document.createElement('span');sp.className='gsub';sp.appendChild(document.createTextNode(m[3]||m[5]));var sb=document.createElement('sub');sb.textContent=m[4]||m[6];sp.appendChild(sb);frag.appendChild(sp);}
      else{var mj=document.createElement(m[1]?'div':'span');mj.className='mj'+(m[1]?' mj-d':'');mj.setAttribute('data-tex',(m[1]||m[2]).trim());mj.textContent=(m[1]||m[2]).trim();frag.appendChild(mj);}
      last=re.lastIndex;
    }
    if(last<s.length)frag.appendChild(document.createTextNode(s.slice(last)));
    t.parentNode.replaceChild(frag,t);
  });
  // 4. ô ghi chú: đoạn bắt đầu bằng Lưu ý / Note / Mẹo / Ghi nhớ / Chú ý / Ví dụ
  d.querySelectorAll('p,li').forEach(function(p){
    var tx=(p.textContent||'').trim(),m=tx.match(/^(Lưu ý|Note|Chú ý|Cảnh báo|Mẹo|Tip|Ghi nhớ|Ví dụ|Example)\b\s*[:：-]?/i);
    if(!m)return;var k=m[1].toLowerCase(),cls=/lưu ý|note|chú ý|cảnh báo/.test(k)?'warn':/mẹo|tip|ghi nhớ/.test(k)?'tip':'ex';
    if(p.tagName==='P'){p.classList.add('callout','co-'+cls);}else p.classList.add('li-co','co-'+cls);
  });
  // bỏ thẻ code/đoạn rỗng sót lại từ tài liệu gốc
  d.querySelectorAll('code').forEach(function(c){if(!c.closest('.cb')&&!c.textContent.trim())c.replaceWith(document.createTextNode(' '));});
  d.querySelectorAll('p').forEach(function(p){if(!p.textContent.trim()&&!p.querySelector('img,.mj,.fig-ph'))p.parentNode.removeChild(p);});
  // tiêu đề con chưa có số thứ tự thì tự đánh số theo mục
  d.querySelectorAll('h4').forEach(function(x){if(!/^\s*(\d+[.)]|[IVX]+\.|Bước\s+\d)/i.test(x.textContent))x.classList.add('hn');});
  // 5. đoạn chỉ gồm một câu in đậm → câu chốt kiến thức
  d.querySelectorAll('p').forEach(function(p){if(p.children.length===1&&/^(B|STRONG)$/.test(p.children[0].tagName)&&p.textContent.trim()===p.children[0].textContent.trim()&&p.textContent.trim().length>12)p.classList.add('kstate');});
  // 6. thuật ngữ đầu mục "Thuật ngữ (…): giải thích" → in đậm phần thuật ngữ
  d.querySelectorAll('li').forEach(function(li){
    var f=li.firstChild;if(!f||f.nodeType!==3)return;var m=f.textContent.match(/^(\s*[^:：.]{2,60}?)([:：])\s/);
    if(!m||/[.!?]/.test(m[1])||m[1].split(/\s+/).length>9)return;
    var b=document.createElement('span');b.className='term';b.textContent=m[1].trim();f.textContent=f.textContent.slice(m[0].length);
    li.insertBefore(document.createTextNode(' '),f);li.insertBefore(document.createTextNode(m[2]),li.firstChild);li.insertBefore(b,li.firstChild);
  });
  return d.innerHTML;
}
function readMins(m){var n=0;m.sections.forEach(function(s){n+=s.h.replace(/<[^>]+>/g,' ').split(/\s+/).length;});return Math.max(1,Math.round(n/170));}
routes.learn=function(id,qs){
  if(!id){
    var tab=qs.tab||'chapters';
    var h='<h1>Lý thuyết</h1><div class="seg full" style="margin-bottom:14px"><button data-t="chapters" class="'+(tab==='chapters'?'on':'')+'">'+D.modules.length+' chương</button>'+(D.quick.length?'<button data-t="quick" class="'+(tab==='quick'?'on':'')+'">Ôn nhanh</button>':'')+(D.compares.length?'<button data-t="compare" class="'+(tab==='compare'?'on':'')+'">Dễ nhầm</button>':'')+'</div>';
    if(tab==='chapters')h+=D.modules.map(function(m){var rd=P.read[m.id],a=modAcc(m.id);return '<a class="lcard" href="#/learn/'+m.id+'"><span class="num" style="background:'+m.color+'">'+m.short+'</span><span class="t"><div>'+esc(m.title)+'</div><span class="small muted">'+m.sections.length+' mục · '+qCount(m.id)+' câu hỏi'+(a!=null?' · đúng '+pct(a):'')+'</span></span>'+(rd?'<span class="tag ok">Đã đọc</span>':'')+(m.priority===4?'<span class="tag warn hide-m">Hay ra thi</span>':'')+'</a>';}).join('');
    else if(tab==='quick')h+=(KEYQ.length?'<a class="card keycard" href="#/practice?tab=key"><span class="kc-ic">'+ic('bulb')+'</span><span style="flex:1;min-width:0"><b>Kiến thức key</b><span class="small muted" style="display:block">'+KEYQ.length+' câu ôn nhanh các ý bắt buộc phải nhớ · đã thuộc '+recallDone(KEYQ)+'/'+KEYQ.length+'</span></span><span class="btn sm primary">Ôn ngay '+ic('arrow')+'</span></a>':'')+'<div class="card"><p class="small muted" style="margin-top:0">28 ý dễ ra kiểm tra nhất (mục 13 của tài liệu). Đọc lại trước giờ thi.</p><ol class="quick" style="padding-left:22px;margin:0">'+D.quick.map(function(x){return '<li>'+esc(x[0])+' <a class="small" href="'+refLink(x[1])+'">§'+x[1]+'</a></li>';}).join('')+'</ol></div>';
    else h+='<p class="muted small">12 cặp khái niệm hay bị nhầm. Mỗi cặp có 2 câu “Cái nào đây?” để tự kiểm tra.</p>'+D.compares.map(function(c,ci){return '<div class="card"><div class="row between"><h3 style="margin:0">'+esc(c.a)+' <span class="muted">vs</span> '+esc(c.b)+'</h3><a class="small" href="'+refLink(c.ref)+'">§'+c.ref+'</a></div><table><tr><th></th><th>'+esc(c.a)+'</th><th>'+esc(c.b)+'</th></tr>'+c.rows.map(function(r){return '<tr><td class="muted small">'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td></tr>';}).join('')+'</table>'+c.quiz.map(function(q,qi){return '<div class="row between" style="padding:6px 0"><span style="flex:1;min-width:200px">'+esc(q[0])+'</span><span class="row"><button class="btn sm" data-c="'+ci+'" data-q="'+qi+'" data-v="0">'+esc(c.a)+'</button><button class="btn sm" data-c="'+ci+'" data-q="'+qi+'" data-v="1">'+esc(c.b)+'</button></span></div>';}).join('')+'</div>';}).join('');
    render(h);
    bind('[data-t]','click',function(e,b){location.hash='#/learn?tab='+b.dataset.t;});
    bind('[data-c]','click',function(e,b){var q=D.compares[+b.dataset.c].quiz[+b.dataset.q];$$('[data-c="'+b.dataset.c+'"][data-q="'+b.dataset.q+'"]').forEach(function(x){x.disabled=true;if(+x.dataset.v===q[1])x.style.cssText='border-color:var(--ok);background:var(--ok-soft);color:var(--ok)';else if(x===b)x.style.cssText='border-color:var(--bad);background:var(--bad-soft);color:var(--bad)';});});
    return;
  }
  var m=MOD[id];if(!m){location.hash='#/learn';return;}
  P.lastLesson=id;P.read[id]=true;save();track('lesson_view',{mod:id,s:qs&&qs.s||''});
  var ix=D.modules.indexOf(m),prev=D.modules[ix-1],nxt=D.modules[ix+1];
  var mins=readMins(m),nsec=m.sections.length;
  render('<div class="row small muted"><a href="#/learn">← Lý thuyết</a><span>·</span>'+dot(id)+m.short+(m.priority===4?' <span class="tag warn">Hay ra thi</span>':'')+'</div>'+
   '<header class="lesson-head"><h1>'+esc(m.title)+'</h1><div class="lesson-meta"><span>'+ic('book')+nsec+' mục</span><span>'+ic('clock')+'khoảng '+mins+' phút đọc</span></div></header>'+
   (m.keyPoints&&m.keyPoints.length?'<div class="keybox"><b>Ý phải nhớ</b><ul>'+m.keyPoints.map(function(k){return '<li>'+esc(k)+'</li>';}).join('')+'</ul></div>':'')+
   '<div class="lesson">'+
   (nsec>1?'<nav class="outline" aria-label="Mục lục"><div class="ol-t">Nội dung chương</div>'+m.sections.map(function(s){return '<a href="#/learn/'+id+'?s='+s.id+'" data-sid="s-'+s.id+'"><span>'+s.id+'</span>'+esc(s.t)+'</a>';}).join('')+'</nav>':'')+
   '<div class="lesson-main">'+
   m.sections.map(function(s,ix){var nS=m.sections[ix+1],rq=recallOf(id,s.id),ok=recallDone(rq);return '<section class="sec" id="s-'+s.id+'"><div class="sec-no">Mục '+s.id+'</div><h2>'+esc(s.t)+'</h2><div class="prose" style="--sid:&quot;'+s.id+'.&quot;">'+tidyLesson(s.h)+'</div>'+
     (rq.length?'<div class="sec-check"><span class="small muted">'+(ok?'Đã trả lời đúng '+ok+'/'+rq.length+' câu của mục này':'Đọc xong? Tự kiểm tra lại mục này')+'</span><a class="btn sm" href="#/practice?recall='+id+'&s='+s.id+'">Hỏi lại mục này · '+rq.length+' câu</a></div>':'')+(nS?'<a class="sec-next" href="#/learn/'+id+'?s='+nS.id+'">Mục tiếp theo: '+esc(nS.t)+' '+ic('arrow')+'</a>':'')+'</section>';}).join('')+
   (m.noQuiz?'':(function(){var rq=recallOf(id),ok=recallDone(rq);return '<div class="card row between"><div><b>Hỏi lại toàn bộ lý thuyết chương này</b><div class="small muted">'+rq.length+' câu đi lần lượt theo từng mục, chỉ hỏi định nghĩa, thành phần, thứ tự — không có câu tình huống.'+(ok?' Đã đúng '+ok+'/'+rq.length+'.':'')+'</div></div><a class="btn primary" href="#/practice?recall='+id+'">Ôn lý thuyết '+m.short+' '+ic('arrow')+'</a></div>';})()+
   '<div class="row" style="justify-content:flex-end;margin:-4px 0 12px"><a class="small" href="#/practice?m='+id+'">Hoặc luyện 10 câu kiểu đề thi của '+m.short+' →</a></div>')+
   '<div class="row between">'+(prev?'<a class="btn" href="#/learn/'+prev.id+'">← '+prev.short+'</a>':'<span></span>')+(nxt?'<a class="btn" href="#/learn/'+nxt.id+'">'+nxt.short+' →</a>':'')+'</div></div></div>');
  if($('#focusBtn'))$('#focusBtn').onclick=function(){focusToggle();};
  lessonProgress();
  (function(){var links=$$('.outline a');if(!links.length||!window.IntersectionObserver)return;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('on',l.dataset.sid===e.target.id);});}});},{rootMargin:'-80px 0px -65% 0px'});
    $$('.lesson .sec').forEach(function(s){io.observe(s);});})();
  if(qs.s){var t=document.getElementById('s-'+qs.s);if(t)setTimeout(function(){t.scrollIntoView({block:'start'});},30);}
  setKeys(function(e){if(e.key==='ArrowLeft'&&prev){location.hash='#/learn/'+prev.id;return true;}if(e.key==='ArrowRight'&&nxt){location.hash='#/learn/'+nxt.id;return true;}});
};

// thanh tiến độ đọc của trang chương
function lessonProgress(){
  var bar=document.getElementById('lsProg');if(!bar){bar=document.createElement('div');bar.id='lsProg';bar.innerHTML='<i></i>';document.body.appendChild(bar);}
  function upd(){var main=document.querySelector('.lesson-main');if(!main||cur!=='learn'){bar.style.display='none';return;}bar.style.display='';var r=main.getBoundingClientRect(),tot=r.height-window.innerHeight*.6,p=tot>0?Math.min(1,Math.max(0,-r.top+window.innerHeight*.2)/tot):1;bar.firstChild.style.width=(p*100).toFixed(1)+'%';}
  if(!lessonProgress.on){lessonProgress.on=1;window.addEventListener('scroll',function(){requestAnimationFrame(upd);},{passive:true});window.addEventListener('hashchange',function(){setTimeout(upd,60);});}
  setTimeout(upd,30);
}
(function(){try{if(document.getElementById('font-lesson'))return;var l=document.createElement('link');l.id='font-lesson';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap';document.head.appendChild(l);}catch(e){}})();
routes.resume=function(){
  var s=P.quiz;if(!s){location.hash='#/';return;}
  var list=quizRestore(s);if(!list.length){P.quiz=null;save();location.hash='#/';return;}
  runQuiz(list,s.title,s.back,s.lang,s);
};

// ===== Chế độ tập trung + đồng hồ Pomodoro =====
// ===== Nền động hoa lá (canvas, không cần tải ảnh) =====
var FX={cv:null,raf:0,ps:[],kind:'',w:0,h:0,last:0,glows:[]};
var FX_KIND={3:'petal',4:'leaf',5:'fire'};
function fxR(a,b){return a+Math.random()*(b-a);}
function fxSize(){if(!FX.cv)return;var d=Math.min(window.devicePixelRatio||1,1.5);FX.w=window.innerWidth;FX.h=window.innerHeight;FX.cv.width=Math.round(FX.w*d);FX.cv.height=Math.round(FX.h*d);FX.cv.getContext('2d').setTransform(d,0,0,d,0,0);}
function fxMake(k,first){
  var w=FX.w,h=FX.h,p={x:fxR(0,w),y:first?fxR(0,h):fxR(-60,-10),ph:fxR(0,6.28),fl:fxR(0,6.28)};
  if(k==='petal'){var cs=['255,200,215','255,182,205','255,216,226','250,170,195','255,235,240'];p.s=fxR(9,19);p.vy=fxR(26,55);p.vx=fxR(-8,14);p.sw=fxR(18,46);p.rot=fxR(0,6.28);p.vr=fxR(-1.2,1.2);p.c=cs[Math.floor(Math.random()*cs.length)];p.a=fxR(.85,1);}
  else if(k==='leaf'){var ls=['86,158,84','120,181,92','160,200,96','62,128,86','196,205,96','100,170,120'];p.s=fxR(11,22);p.vy=fxR(22,46);p.vx=fxR(-12,12);p.sw=fxR(24,60);p.rot=fxR(0,6.28);p.vr=fxR(-.9,.9);p.c=ls[Math.floor(Math.random()*ls.length)];p.a=fxR(.7,.95);}
  else{p.y=fxR(0,h);p.x=fxR(0,w);p.s=fxR(2.2,5.2);p.vx=fxR(-9,9);p.vy=fxR(-8,8);p.sw=fxR(14,40);p.tw=fxR(.6,1.6);p.c=Math.random()<.8?'214,255,120':'150,255,200';}
  return p;
}
function fxDraw(ctx,p,k,t){
  if(k==='fire'){
    var a=.35+.65*Math.pow(.5+.5*Math.sin(t*p.tw+p.ph),2),r=p.s*4.2,g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
    g.addColorStop(0,'rgba('+p.c+','+a+')');g.addColorStop(.35,'rgba('+p.c+','+a*.35+')');g.addColorStop(1,'rgba('+p.c+',0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(255,255,230,'+Math.min(1,a+.15)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.s*.38,0,6.283);ctx.fill();return;
  }
  var s=p.s;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(1,.35+.65*Math.abs(Math.cos(p.fl)));
  if(k==='petal'){
    var g2=ctx.createLinearGradient(0,-s,0,s);g2.addColorStop(0,'rgba(255,245,248,'+p.a+')');g2.addColorStop(1,'rgba('+p.c+','+p.a+')');ctx.fillStyle=g2;
    ctx.beginPath();ctx.moveTo(0,s);ctx.bezierCurveTo(-s*1.1,s*.2,-s*.7,-s*.9,-s*.12,-s*.8);ctx.lineTo(0,-s*.55);ctx.lineTo(s*.12,-s*.8);ctx.bezierCurveTo(s*.7,-s*.9,s*1.1,s*.2,0,s);ctx.fill();
  }else{
    ctx.fillStyle='rgba('+p.c+','+p.a+')';
    ctx.beginPath();ctx.moveTo(0,-s*1.3);ctx.bezierCurveTo(s*1.0,-s*.4,s*.8,s*.9,0,s*1.4);ctx.bezierCurveTo(-s*.8,s*.9,-s*1.0,-s*.4,0,-s*1.3);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,'+p.a*.45+')';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-s*1.2);ctx.lineTo(0,s*1.3);ctx.stroke();
  }
  ctx.restore();
}
function fxStop(){if(FX.raf)cancelAnimationFrame(FX.raf);FX.raf=0;window.removeEventListener('resize',fxSize);if(FX.cv){FX.cv.remove();FX.cv=null;}FX.ps=[];FX.kind='';}
function fxStart(k){
  fxStop();if(!k)return;
  var cv=document.createElement('canvas');cv.id='fxcv';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);FX.cv=cv;FX.kind=k;fxSize();window.addEventListener('resize',fxSize);
  var n=Math.max(16,Math.min(k==='fire'?46:60,Math.round(FX.w*FX.h/(k==='fire'?30000:24000))));
  for(var i=0;i<n;i++)FX.ps.push(fxMake(k,true));
  var ctx=cv.getContext('2d'),still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;FX.last=0;
  function frame(ts){
    if(!FX.cv)return;var dt=FX.last?Math.min(.05,(ts-FX.last)/1000):0;FX.last=ts;var t=ts/1000;
    ctx.clearRect(0,0,FX.w,FX.h);
    FX.ps.forEach(function(p,i){
      if(!still){
        if(k==='fire'){p.x+=(p.vx+Math.cos(t*.5+p.ph)*p.sw*.3)*dt;p.y+=(p.vy+Math.sin(t*.4+p.ph)*p.sw*.3)*dt;if(p.x<-20)p.x=FX.w+20;if(p.x>FX.w+20)p.x=-20;if(p.y<-20)p.y=FX.h+20;if(p.y>FX.h+20)p.y=-20;}
        else{p.y+=p.vy*dt;p.x+=(p.vx+Math.sin(t*.7+p.ph)*p.sw*.5)*dt;p.rot+=p.vr*dt;p.fl+=dt*1.4;if(p.y>FX.h+30||p.x<-60||p.x>FX.w+60)FX.ps[i]=fxMake(k,false);}
      }
      fxDraw(ctx,p,k,t);
    });
    FX.raf=requestAnimationFrame(frame);
  }
  FX.raf=requestAnimationFrame(frame);
}

// ===== Tra cứu nhanh (giao diện kiểu Google, dữ liệu Wikipedia/Wikimedia ngay trong web) =====
var SR={el:null,open:false,q:'',lang:'en',tab:'all',seq:0};
function srGoogle(q,kind){
  q=(q||'').trim();if(!q)return;
  var urls={g:'https://www.google.com/search?q=',t:'https://translate.google.com/?sl=en&tl=vi&op=translate&text=',y:'https://www.youtube.com/results?search_query=',i:'https://www.google.com/search?tbm=isch&q='};
  var u=urls[kind||'g']+encodeURIComponent(q);
  FC.keepUntil=Date.now()+2500;
  var sw=(window.screen&&screen.availWidth)||1200,sh=(window.screen&&screen.availHeight)||800,w=Math.min(560,Math.round(sw*.42)),f='popup=yes,width='+w+',height='+(sh-90)+',left='+(sw-w-10)+',top=30,noopener,noreferrer';
  var win=null;try{win=window.open(u,'tracuu_'+(kind||'g'),f);}catch(e){}
  if(!win)window.open(u,'_blank','noopener');
}
function srEl(){
  if(SR.el)return SR.el;var e=document.createElement('div');e.id='srch';e.setAttribute('role','dialog');e.setAttribute('aria-label','Tra cứu nhanh');
  var wm='Tra cứu'.split('').map(function(c,i){return '<i style="color:'+['#4285f4','#ea4335','#fbbc05','#4285f4','#34a853','#ea4335','#4285f4'][i%7]+'">'+(c===' '?'&nbsp;':c)+'</i>';}).join('');
  e.innerHTML='<div class="sr-win"><div class="sr-top"><div class="sr-logo">'+wm+'</div>'+
    '<form id="srF" class="sr-bar"><span class="sr-bi">'+ic('search')+'</span><input id="srQ" type="search" placeholder="Tìm trên Wikipedia hoặc gõ từ khoá…" autocomplete="off" aria-label="Từ khoá"><button type="button" class="sr-clr" id="srC" aria-label="Xoá" hidden>'+ic('close')+'</button><button class="sr-go" type="submit" aria-label="Tìm">'+ic('search')+'</button></form>'+
    '<button type="button" class="iconbtn" id="srX" aria-label="Đóng">'+ic('close')+'</button></div>'+
    '<div class="sr-nav"><div class="sr-tabs" role="tablist"><button type="button" data-t="all" class="on">Tất cả</button><button type="button" data-t="img">Hình ảnh</button></div>'+
    '<div class="sr-ext"><span class="sr-lg qlang"><button type="button" data-l="en" class="on">EN</button><button type="button" data-l="vi">VI</button></span><button type="button" class="sr-link" data-k="g">Mở Google ↗</button><button type="button" class="sr-link" data-k="t">Dịch ↗</button><button type="button" class="sr-link" data-k="y">YouTube ↗</button></div></div>'+
    '<div class="sr-body" id="srB"></div></div>';
  document.body.appendChild(e);SR.el=e;var q=e.querySelector('#srQ');
  srHome();
  e.querySelector('#srX').onclick=function(){srToggle(false);};
  e.addEventListener('mousedown',function(ev){if(ev.target===e)srToggle(false);});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&SR.open){ev.stopPropagation();srToggle(false);}},true);
  e.querySelector('#srF').onsubmit=function(ev){ev.preventDefault();srRun(q.value);};
  q.oninput=function(){e.querySelector('#srC').hidden=!q.value;};
  e.querySelector('#srC').onclick=function(){q.value='';this.hidden=true;q.focus();};
  [].forEach.call(e.querySelectorAll('.sr-link'),function(b){b.onclick=function(){var t=q.value||SR.q;if(!t.trim()){q.focus();return;}srGoogle(t,b.dataset.k);};});
  [].forEach.call(e.querySelectorAll('.sr-tabs [data-t]'),function(b){b.onclick=function(){SR.tab=b.dataset.t;srMark();if(SR.q)srRun(SR.q);};});
  [].forEach.call(e.querySelectorAll('.sr-lg [data-l]'),function(b){b.onclick=function(){SR.lang=b.dataset.l;srMark();if(SR.q)srRun(SR.q);};});
  return e;
}
function srMark(){var e=SR.el;[].forEach.call(e.querySelectorAll('.sr-tabs [data-t]'),function(b){b.classList.toggle('on',b.dataset.t===SR.tab);});[].forEach.call(e.querySelectorAll('.sr-lg [data-l]'),function(b){b.classList.toggle('on',b.dataset.l===SR.lang);});}
function srHome(){var b=SR.el.querySelector('#srB');b.innerHTML='<div class="sr-home"><p>Gõ thuật ngữ cần tra, hoặc bôi đen chữ trong bài rồi bấm <b>Tra cứu</b>.</p><div class="sr-sug">'+['Harris corner detector','eigenvalue','logistic regression','random forest','convolution','gradient descent'].map(function(s){return '<button type="button" class="sr-chip" data-s="'+esc(s)+'">'+esc(s)+'</button>';}).join('')+'</div><p class="small muted">Giao diện kiểu Google, kết quả lấy từ Wikipedia và Wikimedia Commons. Google thật không cho nhúng vào trang khác nên nút <b>Mở Google</b> sẽ mở cửa sổ nhỏ bên cạnh.</p></div>';
  [].forEach.call(b.querySelectorAll('[data-s]'),function(x){x.onclick=function(){SR.el.querySelector('#srQ').value=x.dataset.s;srRun(x.dataset.s);};});}
function srToggle(on){
  var e=srEl();SR.open=on===undefined?!SR.open:!!on;e.classList.toggle('open',SR.open);document.body.classList.toggle('sr-open',SR.open);
  if(SR.open)setTimeout(function(){var i=e.querySelector('#srQ');if(i){i.focus();i.select();}},60);
}
function srOpen(q){
  srToggle(true);var e=srEl();q=(q||'').replace(/\s+/g,' ').trim().slice(0,200);
  if(q){e.querySelector('#srQ').value=q;e.querySelector('#srC').hidden=false;srRun(q);}
}
function srPlain(s){var d=document.createElement('div');d.innerHTML=String(s||'');return d.textContent||'';}
function srHost(){return SR.lang+'.wikipedia.org';}
function srImgs(q,my,cb){
  fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch='+encodeURIComponent(q)+'&gsrlimit=24&prop=imageinfo&iiprop=url|mime&iiurlwidth=400&format=json&origin=*').then(function(r){return r.json();}).then(function(j){
    if(my!==SR.seq)return;var ps=j.query?Object.keys(j.query.pages).map(function(k){return j.query.pages[k];}):[];
    ps=ps.filter(function(p){var i=p.imageinfo&&p.imageinfo[0];return i&&i.thumburl&&/^image\/(jpeg|png|webp)/.test(i.mime||'');}).sort(function(a,b){return (a.index||0)-(b.index||0);});
    cb(ps.map(function(p){return {t:p.title.replace(/^File:/,'').replace(/\.[a-z]+$/i,''),u:p.imageinfo[0].thumburl,l:p.imageinfo[0].descriptionurl,w:p.imageinfo[0].thumbwidth,h:p.imageinfo[0].thumbheight};}));
  }).catch(function(){cb([]);});
}
function srRun(q){
  q=(q||'').trim();if(!q)return;track('search',{q:q.slice(0,120),tab:SR.tab,lang:SR.lang});SR.q=q;var my=++SR.seq,b=srEl().querySelector('#srB'),host=srHost();
  b.innerHTML='<div class="sr-load"><i></i><i></i><i></i></div>';
  if(SR.tab==='img'){
    srImgs(q,my,function(im){
      if(my!==SR.seq)return;
      b.innerHTML=im.length?'<div class="sr-grid">'+im.map(function(x){return '<a class="sr-im" href="'+esc(x.l)+'" target="_blank" rel="noopener noreferrer" title="'+esc(x.t)+'"><img loading="lazy" src="'+esc(x.u)+'" alt="'+esc(x.t)+'"><span>'+esc(x.t.slice(0,60))+'</span></a>';}).join('')+'</div><p class="small muted">Ảnh từ Wikimedia Commons (nguồn mở). Bấm vào ảnh để xem nguồn và giấy phép.</p>':'<p class="muted">Không tìm thấy hình ảnh cho “'+esc(q)+'”. Thử nút <b>Mở Google</b> ở trên.</p>';
    });return;
  }
  fetch('https://'+host+'/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(q)+'&srlimit=10&srinfo=suggestion&format=json&origin=*').then(function(r){return r.json();}).then(function(j){
    if(my!==SR.seq)return;var rs=(j.query&&j.query.search)||[],sug=j.query&&j.query.searchinfo&&j.query.searchinfo.suggestion;
    if(!rs.length){b.innerHTML='<p class="muted">Không có kết quả nào khớp với “'+esc(q)+'”.'+(sug?' Có phải ý bạn là <a href="#" data-s="'+esc(sug)+'">'+esc(sug)+'</a>?':'')+'</p><p class="small muted">Thử đổi EN/VI hoặc bấm <b>Mở Google</b> ở trên.</p>';var a=b.querySelector('[data-s]');if(a)a.onclick=function(ev){ev.preventDefault();srEl().querySelector('#srQ').value=sug;srRun(sug);};return;}
    var res=rs.map(function(x){var url='https://'+host+'/wiki/'+encodeURIComponent(x.title.replace(/ /g,'_'));return '<div class="sr-res"><div class="sr-site"><span class="sr-fav">W</span><span><b>Wikipedia</b><span class="sr-crumb">'+esc(host+' › wiki › '+x.title.replace(/ /g,'_'))+'</span></span></div><a class="sr-t" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+'</a><div class="sr-s">'+esc(srPlain(x.snippet))+'…</div></div>';}).join('');
    b.innerHTML=(sug?'<div class="sr-dym">Có phải ý bạn là: <a href="#" data-s="'+esc(sug)+'"><i>'+esc(sug)+'</i></a></div>':'')+'<div class="sr-imgs" id="srIm"></div><div class="sr-cols"><div class="sr-list">'+res+'</div><aside class="sr-kp" id="srKp"></aside></div>';
    var dm=b.querySelector('.sr-dym a');if(dm)dm.onclick=function(ev){ev.preventDefault();srEl().querySelector('#srQ').value=sug;srRun(sug);};
    srImgs(q,my,function(im){var el=document.getElementById('srIm');if(!el||my!==SR.seq||!im.length)return;
      el.innerHTML='<div class="sr-strip">'+im.slice(0,8).map(function(x){return '<a href="'+esc(x.l)+'" target="_blank" rel="noopener noreferrer" title="'+esc(x.t)+'"><img loading="lazy" src="'+esc(x.u)+'" alt="'+esc(x.t)+'"></a>';}).join('')+'</div><button type="button" class="sr-more" id="srMore">Xem thêm hình ảnh →</button>';
      var m=document.getElementById('srMore');if(m)m.onclick=function(){SR.tab='img';srMark();srRun(q);};});
    fetch('https://'+host+'/api/rest_v1/page/summary/'+encodeURIComponent(rs[0].title.replace(/ /g,'_'))).then(function(r){return r.json();}).then(function(s){
      var el=document.getElementById('srKp');if(my!==SR.seq||!el||!s||!s.extract)return;
      el.innerHTML=(s.thumbnail?'<img class="sr-kimg" src="'+esc(s.thumbnail.source)+'" alt="'+esc(s.title)+'">':'')+'<div class="sr-kb"><h3>'+esc(s.title)+'</h3>'+(s.description?'<div class="sr-kd">'+esc(s.description)+'</div>':'')+'<p>'+esc(s.extract.slice(0,520))+(s.extract.length>520?'…':'')+'</p>'+(s.content_urls?'<a href="'+esc(s.content_urls.desktop.page)+'" target="_blank" rel="noopener noreferrer">Wikipedia ↗</a>':'')+'</div>'+
        (rs.length>1?'<div class="sr-rel"><b>Tìm kiếm liên quan</b>'+rs.slice(1,6).map(function(x){return '<button type="button" data-s="'+esc(x.title)+'">'+esc(x.title)+'</button>';}).join('')+'</div>':'');
      [].forEach.call(el.querySelectorAll('[data-s]'),function(x){x.onclick=function(){srEl().querySelector('#srQ').value=x.dataset.s;srRun(x.dataset.s);};});
    }).catch(function(){});
  }).catch(function(){if(my===SR.seq)b.innerHTML='<p class="muted">Không tải được kết quả (kiểm tra mạng). Bạn vẫn có thể bấm <b>Mở Google</b> ở trên.</p>';});
}
setTimeout(function(){try{var f=document.createElement('button');f.type='button';f.className='srch-fab';f.setAttribute('aria-label','Tra cứu nhanh');f.innerHTML=ic('search')+'<span>Tra cứu</span>';f.onclick=function(){srToggle();};document.body.appendChild(f);}catch(e){console.error(e);}},0);

var FOCUS_PRESETS=[{id:'25',name:'Pomodoro 25/5',w:25,s:5,l:15,d:'25 phút tập trung, nghỉ 5 phút; sau 4 phiên nghỉ dài 15 phút (Cirillo)'},{id:'50',name:'50/10',w:50,s:10,l:20,d:'50 phút tập trung, nghỉ 10 phút, hợp bài khó cần chìm sâu'},{id:'90',name:'90/20',w:90,s:20,l:30,d:'Chu kỳ ultradian ~90 phút (Kleitman), hợp buổi ôn dài'}];
var FOCUS_SCENES=['Sương xanh','Hoàng hôn dịu','Đêm tĩnh','Anh đào rơi','Rừng lá','Đêm đom đóm'];
var FC={on:false,phase:'work',left:0,running:false,count:0,endAt:0,timer:null,preset:'25',scene:0,fs:false};
try{FC.preset=localStorage.getItem('focus_preset')||'25';FC.scene=+localStorage.getItem('focus_scene')||0;}catch(e){}
function fcP(){return FOCUS_PRESETS.filter(function(p){return p.id===FC.preset;})[0]||FOCUS_PRESETS[0];}
function fcDur(ph){var p=fcP();return (ph==='work'?p.w:ph==='long'?p.l:p.s)*60;}
function fcStatGet(){var d=new Date().toISOString().slice(0,10),s={d:d,m:0,n:0};try{var x=JSON.parse(localStorage.getItem('focus_stat')||'null');if(x&&x.d===d)s=x;}catch(e){}return s;}
function fcStatAdd(m){track('focus_session',{min:m});var s=fcStatGet();s.m+=m;s.n++;try{localStorage.setItem('focus_stat',JSON.stringify(s));}catch(e){}}
function fcFmt(s){s=Math.max(0,Math.round(s));var m=Math.floor(s/60),r=s%60;return (m<10?'0':'')+m+':'+(r<10?'0':'')+r;}
function fcBeep(){try{var C=window.AudioContext||window.webkitAudioContext,c=new C(),t=c.currentTime;[660,880,1100].forEach(function(f,i){var o=c.createOscillator(),g=c.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0.0001,t+i*.18);g.gain.exponentialRampToValueAtTime(.25,t+i*.18+.03);g.gain.exponentialRampToValueAtTime(.0001,t+i*.18+.16);o.connect(g);g.connect(c.destination);o.start(t+i*.18);o.stop(t+i*.18+.18);});setTimeout(function(){c.close();},900);}catch(e){}}
function fcEl(){var e=document.getElementById('fpom');if(e)return e;e=document.createElement('div');e.id='fpom';e.setAttribute('role','timer');document.body.appendChild(e);return e;}
function fcBrk(){var e=document.getElementById('fbreak');if(e)return e;e=document.createElement('div');e.id='fbreak';document.body.appendChild(e);return e;}
function fcScene(){
  // Tập trung: bỏ qua nền sáng/tối của app, mỗi cảnh dùng đúng bảng màu gốc của nó
  if(FC.on)document.documentElement.dataset.theme=(FC.scene===2||FC.scene===5)?'dark':'light';else applyTheme();
  for(var i=0;i<FOCUS_SCENES.length;i++)document.body.classList.toggle('fm-'+i,FC.on&&FC.scene===i);if(FC.on&&FX_KIND[FC.scene])fxStart(FX_KIND[FC.scene]);else fxStop();}
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
    '<button type="button" class="btn sm" id="fpSrch" title="Tra cứu nhanh (Google, Wikipedia)">'+ic('search')+'<span class="fp-sl">Tra cứu</span></button><button type="button" class="btn sm" id="fpExit">Thoát</button>';
  $('#fpPlay',e).onclick=function(){fcRun(!FC.running);};
  $('#fpSkip',e).onclick=function(){fcNext(true);};
  $('#fpRst',e).onclick=function(){FC.left=fcDur(FC.phase);FC.endAt=Date.now()+FC.left*1000;fcDraw();};
  $('#fpPre',e).onclick=function(){var k=FOCUS_PRESETS.indexOf(fcP());FC.preset=FOCUS_PRESETS[(k+1)%FOCUS_PRESETS.length].id;try{localStorage.setItem('focus_preset',FC.preset);}catch(x){}FC.phase='work';FC.left=fcDur('work');FC.endAt=Date.now()+FC.left*1000;fcBreakShow();toast(fcP().name+': '+fcP().d);fcDraw();};
  $('#fpScn',e).onclick=function(){FC.scene=(FC.scene+1)%FOCUS_SCENES.length;try{localStorage.setItem('focus_scene',FC.scene);}catch(x){}fcScene();fcDraw();};
  $('#fpExit',e).onclick=function(){focusOff();};
  $('#fpSrch',e).onclick=function(){srToggle();};
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
  fcDraw();fcBreakShow();focusFabDraw();
}
function focusOff(){
  if(!FC.on)return;
  if(FC.phase==='work'){var d=fcDur('work')-FC.left;if(d>=60)fcStatAdd(Math.round(d/60));}
  FC.on=false;FC.running=false;clearInterval(FC.timer);document.body.classList.remove('focus-mode');fcScene();
  FC.left=0;FC.phase='work';
  var e=document.getElementById('fpom');if(e)e.remove();var b=document.getElementById('fbreak');if(b)b.remove();
  var wasFs=FC.fs;FC.fs=false;if(wasFs&&document.fullscreenElement){try{document.exitFullscreen();}catch(x){}}
  focusFabDraw();
}
function focusToggle(){if(FC.on)focusOff();else focusOn();}
// Kéo để đổi kích thước khung chatbot cạnh câu hỏi (độ rộng: cạnh phải; chiều cao phần hội thoại: cạnh dưới). Nhớ theo trình duyệt, nhấp đúp để về mặc định.
function qsideResize(){
  var lay=$('.qlay'),side=$('.qside');if(!lay||!side||window.innerWidth<1000)return;
  var W=+localStorage.getItem('qs_w')||0,H=+localStorage.getItem('qs_h')||0;
  function apply(){if(W)lay.style.setProperty('--qw',W+'px');else lay.style.removeProperty('--qw');if(H){lay.style.setProperty('--qlh',H+'px');lay.classList.add('qs-h');}else{lay.style.removeProperty('--qlh');lay.classList.remove('qs-h');}}
  apply();
  var rh=document.createElement('div');rh.className='qs-rh';rh.title='Kéo để đổi độ rộng (nhấp đúp: mặc định)';rh.setAttribute('aria-hidden','true');
  var bh=document.createElement('div');bh.className='qs-bh';bh.title='Kéo để đổi chiều cao (nhấp đúp: mặc định)';bh.setAttribute('aria-hidden','true');
  side.appendChild(rh);side.appendChild(bh);
  try{new MutationObserver(function(){if(!side.contains(rh))side.appendChild(rh);if(!side.contains(bh))side.appendChild(bh);}).observe(side,{childList:true});}catch(e){}
  function drag(h,onmove,onend){h.addEventListener('pointerdown',function(e){e.preventDefault();var sx=e.clientX,sy=e.clientY,s0={w:side.getBoundingClientRect().width,h:($('.ai-log',side)||{getBoundingClientRect:function(){return {height:260};}}).getBoundingClientRect().height};
    document.body.classList.add('qs-dragging');
    function mv(ev){onmove(ev.clientX-sx,ev.clientY-sy,s0);apply();}
    function up(){document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);document.body.classList.remove('qs-dragging');onend();}
    document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);});}
  drag(rh,function(dx,dy,s0){var max=Math.min(760,lay.getBoundingClientRect().width-380);W=Math.round(Math.max(280,Math.min(max,s0.w+dx)));},function(){try{localStorage.setItem('qs_w',String(W));}catch(e){}});
  drag(bh,function(dx,dy,s0){H=Math.round(Math.max(140,Math.min(window.innerHeight-240,s0.h+dy)));},function(){try{localStorage.setItem('qs_h',String(H));}catch(e){}});
  rh.addEventListener('dblclick',function(){W=0;try{localStorage.removeItem('qs_w');}catch(e){}apply();});
  bh.addEventListener('dblclick',function(){H=0;try{localStorage.removeItem('qs_h');}catch(e){}apply();});
}
// Nút Tập trung nổi ở đáy màn hình, có mặt ở mọi mục (phím tắt F)
function focusFabDraw(){var b=document.getElementById('focusBtn');if(!b)return;b.classList.toggle('on',!!FC.on);b.innerHTML=ic('expand')+'<span>'+(FC.on?'Thoát tập trung':'Tập trung')+'</span>';b.title=FC.on?'Thoát chế độ tập trung (phím F)':'Chế độ tập trung: toàn màn hình, ẩn mọi thứ không cần thiết, có đồng hồ Pomodoro (phím F)';}
setTimeout(function(){try{if(document.getElementById('focusBtn'))return;var b=document.createElement('button');b.type='button';b.id='focusBtn';b.className='focus-fab';b.onclick=function(){focusToggle();};document.body.appendChild(b);focusFabDraw();}catch(e){console.error(e);}},0);

document.addEventListener('fullscreenchange',function(){if(FC.on&&FC.fs&&!document.fullscreenElement){if(FC.keepUntil&&Date.now()<FC.keepUntil){FC.fs=false;return;}focusOff();}});
document.addEventListener('keydown',function(e){if((e.key==='f'||e.key==='F')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName||'')&&document.getElementById('focusBtn'))focusToggle();});

// ===== Xem lại tất cả câu hỏi của bộ đề =====
var revSt={q:'',topic:'',status:'all',lang:'',show:30,sol:false};
routes.review=function(){
  var pool=BANK,st=revSt;
  var lang=st.lang||localStorage.getItem('ui_qlang')||'en';
  var topics=[];pool.forEach(function(q){if(topics.indexOf(q.topic)<0)topics.push(q.topic);});
  function status(q){var an=P.answers[q.id];if(P.mistakes[q.id])return 'wrong';if(!an)return 'new';return an.lastOk?'ok':'wrong';}
  function pick(){
    var kw=st.q.trim().toLowerCase();
    return pool.filter(function(q){
      if(st.topic&&q.topic!==st.topic)return false;
      if(st.status!=='all'&&status(q)!==st.status)return false;
      if(kw){var hay=(q.q+' '+q.orig.join(' ')+' '+(q.explain||'')+' '+(q.vi?q.vi.q+' '+q.vi.options.join(' '):'')).toLowerCase();if(hay.indexOf(kw)<0)return false;}
      return true;});
  }
  function item(q){
    var tv=(lang==='vi'&&q.vi)?q.vi:null,s=status(q),good=q.answers;
    var tag=s==='ok'?'<span class="tag ok">Đúng lần gần nhất</span>':s==='wrong'?'<span class="tag bad">Cần ôn lại</span>':'<span class="tag">Chưa làm</span>';
    return '<div class="card rv-item" id="rv-'+q.no+'"><div class="rv-h"><span class="tag">Câu '+q.no+'</span><span class="tag">'+esc(q.topic)+'</span>'+tag+(good.length>1?'<span class="tag warn">'+good.length+' đáp án đúng</span>':'')+'</div>'+
      '<div class="q">'+qhtml(tv?tv.q:q.q)+'</div>'+(q.img?'<img class="q-img" src="'+esc(q.img)+'" alt="Hình của câu hỏi">':'')+
      '<ol class="rv-opts">'+q.orig.map(function(o,k){var ok=good.indexOf(o)>=0;return '<li class="'+(ok?'ok':'')+'"><b>'+L[k]+'</b><span>'+esc(tv?(tv.options[k]||o):o)+'</span>'+(ok?'<i class="rv-tick">'+ic('check')+'</i>':'')+'</li>';}).join('')+'</ol>'+
      '<div class="rv-x'+(st.sol?' open':'')+'" id="rx-'+q.no+'">'+(q.explain?mdLite(q.explain):'<span class="muted small">Câu này chưa có lời giải soạn sẵn.</span>')+'</div>'+
      '<div class="row" style="gap:8px;margin-top:10px"><button type="button" class="btn sm" data-rsol="'+q.no+'">'+ic('book')+' Lời giải</button><button type="button" class="btn sm" data-rprac="'+q.id+'">'+ic('pen')+' Luyện câu này</button></div></div>';
  }
  function list(){
    var l=pick(),box=document.getElementById('rvlist');if(!box)return;
    box.innerHTML='<div class="small muted" style="margin:6px 2px 10px">'+l.length+'/'+pool.length+' câu khớp bộ lọc</div>'+(l.length?l.slice(0,st.show).map(item).join(''):'<div class="card empty"><p class="muted">Không có câu nào khớp.</p></div>')+(l.length>st.show?'<div class="row" style="justify-content:center;margin:8px 0"><button type="button" class="btn" id="rvmore">Hiện thêm '+Math.min(30,l.length-st.show)+' câu ('+(l.length-st.show)+' còn lại)</button></div>':'');
    var cnt=document.getElementById('rvgo');if(cnt){cnt.disabled=!l.length;cnt.innerHTML=ic('play')+' Luyện '+l.length+' câu đang lọc';}
    $$('[data-rsol]',box).forEach(function(b){b.onclick=function(){var x=document.getElementById('rx-'+b.dataset.rsol);if(x)x.classList.toggle('open');};});
    $$('[data-rprac]',box).forEach(function(b){b.onclick=function(){var q=QMAP[b.dataset.rprac];runQuiz([q],'Luyện 1 câu · câu '+q.no,'#/review','en');};});
    var mo=document.getElementById('rvmore');if(mo)mo.onclick=function(){st.show+=30;list();};
  }
  var counts={all:pool.length,new:0,ok:0,wrong:0};pool.forEach(function(q){counts[status(q)]++;});
  render('<div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">'+esc(SJ.bankTitle)+'</h1><div class="seg"><a class="btn sm ghost" href="#/bank" style="border-radius:8px">Luyện tập</a><button class="on" type="button">Xem tất cả câu hỏi</button></div></div>'+
    '<p class="muted" style="margin:6px 0 12px">Duyệt toàn bộ '+pool.length+' câu của bộ đề, xem đáp án đúng và lời giải, lọc theo chủ đề hoặc trạng thái.</p>'+
    '<div class="card rv-tools"><input type="search" id="rvq" class="sel" style="max-width:none;width:100%" placeholder="Tìm theo từ khoá (câu hỏi, đáp án, lời giải)" value="'+esc(st.q)+'">'+
    '<div class="row" style="gap:10px 16px;margin-top:10px;flex-wrap:wrap"><div class="seg" id="rvst">'+[['all','Tất cả'],['new','Chưa làm'],['ok','Đã đúng'],['wrong','Cần ôn']].map(function(x){return '<button type="button" data-st="'+x[0]+'" class="'+(st.status===x[0]?'on':'')+'">'+x[1]+' <span class="muted">'+counts[x[0]]+'</span></button>';}).join('')+'</div>'+
    '<div class="qlang" role="group" aria-label="Ngôn ngữ"><button type="button" data-rl="vi" class="'+(lang==='vi'?'on':'')+'">VI</button><button type="button" data-rl="en" class="'+(lang==='en'?'on':'')+'">EN</button></div>'+
    '<label class="rv-chk"><input type="checkbox" id="rvsol"'+(st.sol?' checked':'')+'> Hiện lời giải của tất cả câu</label></div>'+
    '<div class="chips" style="margin-top:10px"><button type="button" data-tp="" class="'+(!st.topic?'on':'')+'">Mọi chủ đề</button>'+topics.map(function(t){return '<button type="button" data-tp="'+esc(t)+'" class="'+(st.topic===t?'on':'')+'">'+esc(t)+'</button>';}).join('')+'</div>'+
    '<div class="row" style="margin-top:12px"><button type="button" class="btn primary" id="rvgo">'+ic('play')+' Luyện các câu đang lọc</button></div></div><div id="rvlist"></div>');
  $$('[data-st]').forEach(function(b){b.onclick=function(){st.status=b.dataset.st;st.show=30;routes.review();};});
  $$('[data-tp]').forEach(function(b){b.onclick=function(){st.topic=b.dataset.tp;st.show=30;routes.review();};});
  $$('[data-rl]').forEach(function(b){b.onclick=function(){st.lang=b.dataset.rl;try{localStorage.setItem('ui_qlang',st.lang);}catch(e){}routes.review();};});
  document.getElementById('rvsol').onchange=function(){st.sol=this.checked;list();};
  var tm;document.getElementById('rvq').oninput=function(){var v=this.value;clearTimeout(tm);tm=setTimeout(function(){st.q=v;st.show=30;list();},180);};
  document.getElementById('rvgo').onclick=function(){var l=pick();if(l.length)runQuiz(shuffle(l).slice(0,50),'Luyện theo bộ lọc ('+Math.min(50,l.length)+' câu)','#/review','en');};
  list();
};

// ===== Practice =====
routes.practice=function(_,qs){
  // Hỏi lại lý thuyết: đi lần lượt từng mục của chương, giữ thứ tự trong bài
  if(qs.recall&&MOD[qs.recall]){
    var rl=recallOf(qs.recall,qs.s);if(qs.todo==='1')rl=rl.filter(function(q){var a=P.answers[q.id];return !(a&&a.lastOk);});
    if(!rl.length){toast('Bạn đã trả lời đúng hết các câu ở đây');location.hash='#/practice';return;}
    var mm=MOD[qs.recall];
    return runQuiz(rl,'Ôn lý thuyết '+mm.short+(qs.s?' · §'+qs.s+' '+secTitle(qs.s):' – '+mm.title),qs.s?'#/learn/'+qs.recall+'?s='+qs.s:'#/practice','vi');
  }
  if(qs.key){
    var kl=keyOf(MOD[qs.key]?qs.key:'');if(qs.todo==='1')kl=kl.filter(function(q){var a=P.answers[q.id];return !(a&&a.lastOk);});
    if(!kl.length){toast('Bạn đã thuộc hết các câu ở đây');location.hash='#/practice?tab=key';return;}
    return runQuiz(kl,'Kiến thức key'+(MOD[qs.key]?' '+MOD[qs.key].short+' – '+MOD[qs.key].title:''),'#/practice?tab=key','vi');
  }
  if(qs.m&&MOD[qs.m]&&qs.go!=='0'){var pool=shuffle(PQ.filter(function(q){return q.module===qs.m;})).slice(0,10);return runQuiz(pool,'Luyện '+MOD[qs.m].short+' – '+MOD[qs.m].title,'#/practice?go=0&m='+qs.m);}
  var st={mode:qs.tab==='key'?'key':qs.past?'past':qs.m?'chapter':qs.exam?'smart':'recall',n:20,mods:qs.m?[qs.m]:[],ex:qs.past&&EXAMS[qs.past]?[qs.past]:D.pastExams.map(function(e){return e.id;}),order:false,open:null,todo:false};
  function draw(){
    var lg=plang();
    render('<h1>Luyện tập</h1><p class="muted" style="margin-top:-6px">Chấm ngay sau mỗi câu, có giải thích và link về đúng mục lý thuyết.</p>'+
     '<div class="seg full f4" style="margin-bottom:14px">'+(KEYQ.length?'<button data-top="key" class="'+(st.mode==='key'?'on':'')+'">Kiến thức key</button>':'')+'<button data-top="recall" class="'+(st.mode==='recall'?'on':'')+'">Ôn lý thuyết</button><button data-top="exam" class="'+(st.mode!=='recall'&&st.mode!=='past'&&st.mode!=='key'?'on':'')+'">Kiểu đề thi</button>'+(D.pastExams.length?'<button data-top="past" class="'+(st.mode==='past'?'on':'')+'">Đề kì trước</button>':'')+'</div>'+
     (st.mode==='key'?keyHtml():st.mode==='recall'?recallHtml():
     (st.mode!=='past'?(D.questions.length?'<div class="row" style="margin-bottom:12px"><span class="muted small">Ngôn ngữ câu hỏi</span><div class="seg"><button data-lang="vi" class="'+(lg==='vi'?'on':'')+'">Tiếng Việt</button><button data-lang="en" class="'+(lg==='en'?'on':'')+'">English (như đề thi)</button></div></div>':'')+
     '<div class="mode"><button data-mode="smart" class="'+(st.mode==='smart'?'on':'')+'"><b>Ôn chỗ yếu</b><span>Câu chưa làm, hay sai, chương yếu</span></button><button data-mode="mix" class="'+(st.mode==='mix'?'on':'')+'"><b>Trộn tất cả</b><span>Ngẫu nhiên cả '+D.modules.length+' chương</span></button><button data-mode="chapter" class="'+(st.mode==='chapter'?'on':'')+'"><b>Theo chương</b><span>Chọn một hoặc nhiều chương</span></button></div>':'')+
     modeRest()));
    bind('[data-top]','click',function(e,b){st.mode=b.dataset.top==='exam'?'smart':b.dataset.top;draw();});
    bind('[data-open]','click',function(e,b){st.open=st.open===b.dataset.open?null:b.dataset.open;draw();});
    bind('[data-krun]','click',function(e,b){e.stopPropagation();location.hash='#/practice?key='+b.dataset.krun+(st.todo?'&todo=1':'');});
    bind('[data-run]','click',function(e,b){e.stopPropagation();location.hash='#/practice?recall='+b.dataset.run+(b.dataset.s?'&s='+b.dataset.s:'')+(st.todo?'&todo=1':'');});
    bind('#todo','change',function(){st.todo=this.checked;});
    bindRest();
  }
  function keyHtml(){
    var all=keyOf(''),ok=recallDone(all);
    return '<p class="small muted" style="margin:0 0 10px">'+all.length+' câu viết tay, mỗi câu hỏi đúng một ý <b>bắt buộc phải nhớ</b> khi thi: định nghĩa, thứ tự các bước, thành phần, con số. Đáp án nhiễu là các khái niệm dễ nhầm; sau mỗi câu có giải thích và mẹo nhớ.</p>'+
      '<div class="card row between"><div style="flex:1;min-width:220px"><b>Ôn toàn bộ kiến thức key</b><div class="small muted">Đã thuộc '+ok+'/'+all.length+' câu · đi lần lượt từ M2 đến M11, khoảng '+Math.ceil(all.length*12/60)+' phút</div><div class="bar '+barClass(ok/all.length)+'" style="margin-top:8px;max-width:360px"><i style="width:'+(ok/all.length*100)+'%"></i></div></div><button class="btn primary" data-krun="all">Bắt đầu '+ic('arrow')+'</button></div>'+
      '<label class="small row" style="gap:8px;margin-bottom:10px"><input type="checkbox" id="todo"'+(st.todo?' checked':'')+'> Chỉ hỏi những câu chưa thuộc</label>'+
      '<div class="card" style="padding:6px 16px">'+QMODS.map(function(m){var kq=keyOf(m.id),k2=recallDone(kq);if(!kq.length)return '';
        return '<div class="rc-row"><div class="rc-head"><span class="nm">'+dot(m.id)+'<span><b>'+m.short+'</b> '+esc(m.title)+'</span></span><div class="bar '+barClass(k2/kq.length)+'"><i style="width:'+(k2/kq.length*100)+'%"></i></div><span class="small muted">'+k2+'/'+kq.length+'</span><button class="btn sm" data-krun="'+m.id+'">Ôn '+m.short+'</button></div></div>';}).join('')+'</div>'+
      '<p class="small muted">“Đã thuộc” = trả lời đúng ở lần gần nhất. Câu sai tự vào sổ Câu sai.</p>';
  }
  function recallHtml(){
    return '<p class="small muted" style="margin:0 0 10px">Hỏi lại đúng nội dung từng mục trong bài: định nghĩa, thành phần, thứ tự, con số. Không có câu tình huống. Câu đi lần lượt theo thứ tự mục để bạn rà hết lý thuyết.</p>'+
      '<label class="small row" style="gap:8px;margin-bottom:10px"><input type="checkbox" id="todo"'+(st.todo?' checked':'')+'> Chỉ hỏi những câu chưa trả lời đúng</label>'+
      '<div class="card" style="padding:6px 16px">'+QMODS.map(function(m){
        var rq=recallOf(m.id),ok=recallDone(rq),open=st.open===m.id;
        return '<div class="rc-row'+(open?' open':'')+'"><div class="rc-head" data-open="'+m.id+'" role="button" tabindex="0"><span class="nm">'+dot(m.id)+'<span><b>'+m.short+'</b> '+esc(m.title)+'</span></span>'+
          '<div class="bar '+barClass(rq.length?ok/rq.length:null)+'"><i style="width:'+(rq.length?ok/rq.length*100:0)+'%"></i></div><span class="small muted">'+ok+'/'+rq.length+'</span>'+
          '<button class="btn sm primary" data-run="'+m.id+'">Ôn cả chương</button></div>'+
          (open?'<div class="rc-secs">'+m.sections.map(function(s){var sq=recallOf(m.id,s.id),so=recallDone(sq);return '<button class="rc-sec" data-run="'+m.id+'" data-s="'+s.id+'"><span><b>§'+s.id+'</b> '+esc(s.t)+'</span><span class="small muted">'+so+'/'+sq.length+'</span></button>';}).join('')+'</div>':'')+'</div>';
      }).join('')+'</div><p class="small muted">Bấm vào tên chương để chọn ôn từng mục.</p>';
  }
  function modeRest(){return ''+
     (st.mode==='past'?'<p class="small muted" style="margin:0 0 10px">'+D.past.length+' câu thật của các đề kì trước, bằng tiếng Anh.</p>':'')+
     (st.mode==='chapter'?'<div class="card"><div class="chips">'+QMODS.map(function(m){return '<button data-m="'+m.id+'" class="'+(st.mods.indexOf(m.id)>=0?'on':'')+'">'+dot(m.id)+m.short+' · '+esc(m.title.length>28?m.title.slice(0,26)+'…':m.title)+'</button>';}).join('')+'</div></div>':'')+
     (st.mode==='past'?'<div class="card"><div class="chips">'+D.pastExams.map(function(e){return '<button data-ex="'+e.id+'" class="'+(st.ex.indexOf(e.id)>=0?'on':'')+'">'+esc(e.title)+' · '+e.n+' câu</button>';}).join('')+'</div><label class="small row" style="margin-top:10px;gap:8px"><input type="checkbox" id="ord"'+(st.order?' checked':'')+'> Làm theo đúng thứ tự trong đề</label><p class="small muted" style="margin:6px 0 0">Đề không kèm đáp án — đáp án trong app được xác định theo tài liệu môn; câu nào chưa chắc có gắn nhãn.</p></div>':'')+
     (st.mode!=='past'?'<div class="row" style="margin:16px 0"><span class="muted small">Số câu</span><div class="seg">'+[10,20,30].map(function(n){return '<button data-n="'+n+'" class="'+(st.n===n?'on':'')+'">'+n+'</button>';}).join('')+'</div></div>':'<div style="height:12px"></div>')+
     '<button class="btn primary big" id="start" style="width:100%">Bắt đầu '+ic('arrow')+'</button>';}
  function bindRest(){
    bind('[data-lang]','click',function(e,b){P.settings.lang=b.dataset.lang;save();draw();});
    bind('[data-mode]','click',function(e,b){st.mode=b.dataset.mode;draw();});
    bind('[data-m]','click',function(e,b){var k=st.mods.indexOf(b.dataset.m);if(k>=0)st.mods.splice(k,1);else st.mods.push(b.dataset.m);draw();});
    bind('[data-ex]','click',function(e,b){var k=st.ex.indexOf(b.dataset.ex);if(k>=0)st.ex.splice(k,1);else st.ex.push(b.dataset.ex);draw();});
    bind('#ord','change',function(){st.order=this.checked;});
    bind('[data-n]','click',function(e,b){st.n=+b.dataset.n;draw();});
    bind('#start','click',start);
  }
  function start(){
    var list,title;
    if(st.mode==='past'){if(!st.ex.length)return toast('Chọn ít nhất một đề');list=D.past.filter(function(q){return st.ex.indexOf(q.exam)>=0;});if(!st.order)list=shuffle(list);title='Đề kì trước: '+st.ex.join(', ');}
    else if(st.mode==='chapter'){if(!st.mods.length)return toast('Chọn ít nhất một chương');list=shuffle(PQ.filter(function(q){return st.mods.indexOf(q.module)>=0;})).slice(0,st.n);title='Theo chương: '+st.mods.map(function(m){return MOD[m].short;}).join(', ');}
    else if(st.mode==='mix'){list=shuffle(ALLQ).slice(0,st.n);title='Trộn tất cả';}
    else{
      list=shuffle(ALLQ).map(function(q){var a=P.answers[q.id],acc=modAcc(q.module);var s=(!a?3:0)+(P.mistakes[q.id]?4:0)+(a&&a.seen>a.correct?1:0)+(acc==null?1:(1-acc)*3)+MOD[q.module].priority*0.3+Math.random();return {q:q,s:s};}).sort(function(a,b){return b.s-a.s;}).slice(0,st.n).map(function(x){return x.q;});
      list=shuffle(list);title='Ôn chỗ yếu';
    }
    runQuiz(list,title,'#/practice');
  }
  draw();
};

// ===== Exam =====
function buildExam(n){
  var tot=D.modules.reduce(function(a,m){return a+m.weight;},0),al=D.modules.map(function(m){var x=n*m.weight/tot;return {m:m.id,k:Math.floor(x),r:x%1};});
  var left=n-al.reduce(function(a,b){return a+b.k;},0);al.slice().sort(function(a,b){return b.r-a.r;}).slice(0,left).forEach(function(a){a.k++;});
  var ids=[],used={};
  al.forEach(function(a){shuffle(EXAMQ.filter(function(q){return q.module===a.m;})).slice(0,a.k).forEach(function(q){ids.push(q.id);used[q.id]=1;});});
  if(ids.length<n)shuffle(EXAMQ.filter(function(q){return !used[q.id];})).slice(0,n-ids.length).forEach(function(q){ids.push(q.id);});
  ids=shuffle(ids);return withOpts(ids);
}
// exam text is always English
function withOpts(ids){var o={};ids.forEach(function(id){var t=T(QMAP[id],'en');var qq=QMAP[id];o[id]=(qq.orig&&qq.keep)?qq.orig.slice():shuffle([t.correct].concat(t.wrong));});return {ids:ids,opts:o,answers:{},flags:{},cur:0};}
function buildPastExam(ex){return withOpts(D.past.filter(function(q){return q.exam===ex;}).map(function(q){return q.id;}));}
function chart(h){var pts=h.slice(-15),W=600,H=150,p=22;function x(i){return p+(pts.length<2?(W-2*p)/2:i*(W-2*p)/(pts.length-1));}function y(v){return H-p-v/10*(H-2*p);}
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Điểm các lần thi thử"><line x1="'+p+'" x2="'+(W-p)+'" y1="'+y(8)+'" y2="'+y(8)+'" stroke="var(--ok)" stroke-dasharray="5 5"/><text x="'+(W-p)+'" y="'+(y(8)-6)+'" font-size="12" text-anchor="end" fill="var(--muted)">mục tiêu 8</text><line x1="'+p+'" x2="'+(W-p)+'" y1="'+y(4)+'" y2="'+y(4)+'" stroke="var(--bad)" stroke-dasharray="3 6" opacity=".6"/><text x="'+(W-p)+'" y="'+(y(4)-6)+'" font-size="12" text-anchor="end" fill="var(--muted)">tối thiểu 4</text>'+
  '<polyline fill="none" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round" points="'+pts.map(function(e,i){return x(i)+','+y(e.score);}).join(' ')+'"/>'+pts.map(function(e,i){return '<circle cx="'+x(i)+'" cy="'+y(e.score)+'" r="5" fill="var(--panel)" stroke="var(--primary)" stroke-width="3"><title>'+e.score.toFixed(1)+'</title></circle>';}).join('')+'</svg>';}
routes.exam=function(_,qs){
  if(qs.r!=null&&P.exams[+qs.r])return examResult(+qs.r);
  if(P.examInProgress)return examRun();
  var h=P.exams;
  render('<h1>Thi thử</h1><p class="muted" style="margin-top:-6px">Đề bằng <b>tiếng Anh</b> như đề thật, không hiện đáp án khi đang làm, hết giờ tự nộp. Giải thích sau khi nộp bằng tiếng Việt.</p>'+
   '<h3>Đề ngẫu nhiên từ ngân hàng câu hỏi</h3><div class="grid2">'+
   '<div class="card excard"><span class="tag">Rút gọn</span><span class="big-n">30 câu</span><span class="muted">40 phút</span><button class="btn primary" data-n="30" data-t="40" style="margin-top:8px">Bắt đầu</button></div>'+
   '<div class="card excard"><span class="tag warn">Như đề thật</span><span class="big-n">50 câu</span><span class="muted">60 phút</span><button class="btn primary" data-n="50" data-t="60" style="margin-top:8px">Bắt đầu</button></div></div>'+
   (D.pastExams.length?'<h3>Đề kì trước (làm lại nguyên đề)</h3><div class="grid2">'+D.pastExams.map(function(e){var best=P.exams.filter(function(x){return x.past===e.id;}).reduce(function(a,x){return Math.max(a,x.score);},-1);return '<div class="card excard"><span class="tag ok">'+esc(e.title)+'</span><span class="big-n">'+e.n+' câu</span><span class="muted">'+e.minutes+' phút'+(best>=0?' · tốt nhất '+best.toFixed(1):'')+'</span><button class="btn primary" data-past="'+e.id+'" style="margin-top:8px">Làm đề này</button></div>';}).join('')+'</div>':'')+
   (h.length?'<h2>Lịch sử thi thử</h2><div class="card">'+chart(h)+'<table><tr><th>Ngày</th><th>Đề</th><th>Điểm</th><th>Thời gian</th><th></th></tr>'+h.map(function(x,i){return '<tr><td>'+esc(x.date.slice(0,10))+'</td><td>'+esc(x.config)+'</td><td><b style="color:'+(x.score>=8?'var(--ok)':x.score>=4?'inherit':'var(--bad)')+'">'+x.score.toFixed(1)+'</b></td><td>'+fmtTime(x.seconds)+'</td><td><a href="#/exam?r='+i+'">Xem</a></td></tr>';}).reverse().join('')+'</table></div>':''));
  function begin(x,cfg,min){x.config=cfg;x.startedAt=Date.now();x.endsAt=x.startedAt+min*60000;P.examInProgress=x;save();go();}
  bind('[data-n]','click',function(e,b){begin(buildExam(+b.dataset.n),b.dataset.n+' câu/'+b.dataset.t+' phút',+b.dataset.t);});
  bind('[data-past]','click',function(e,b){var ex=EXAMS[b.dataset.past],x=buildPastExam(ex.id);x.past=ex.id;begin(x,ex.title,ex.minutes);});
};
function examRun(){
  var E=P.examInProgress;
  render('<div class="row between" style="margin-bottom:8px"><b>'+esc(E.config)+'</b><span class="tag" style="font-size:.95em">⏱ <span class="timer" id="tm"></span></span></div><div class="bar" style="margin-bottom:14px"><i id="pb"></i></div><div id="eq"></div>'+
   '<div class="row between" style="margin:12px 0"><div class="row"><button class="btn" id="pv">←</button><button class="btn" id="nx">→</button><button class="btn" id="fl">'+ic('flag')+'<span class="hide-m">Flag</span></button></div><button class="btn primary" id="sb">Submit</button></div>'+
   '<div class="card"><div class="row between small muted" style="margin-bottom:8px"><span>Questions</span><span><span class="tag">answered</span> <span class="tag warn">flagged</span></span></div><div class="qgrid" id="grid"></div></div><p class="small muted hide-m">Phím: <kbd>1</kbd>–<kbd>5</kbd>/<kbd>A</kbd>–<kbd>E</kbd> chọn · <kbd>←</kbd><kbd>→</kbd> chuyển câu · <kbd>F</kbd> gắn cờ</p>');
  function draw(){
    var id=E.ids[E.cur],q=T(QMAP[id],'en'),o=E.opts[id],done=E.ids.filter(function(x){return E.answers[x]!=null;}).length;
    $('#pb').style.width=(done/E.ids.length*100)+'%';
    if(trState[id])trState[id].open=false;
    $('#eq').innerHTML='<div class="card"><div class="row between small muted"><span>Question '+(E.cur+1)+' of '+E.ids.length+' · (Choose 1 answer)</span><span class="row">'+(E.flags[id]?'<span class="tag warn">Flagged</span>':'')+'<button class="link-btn" id="trb">Dịch</button></span></div><div class="q">'+qhtml(q.q)+'</div>'+(q.img?'<img class="q-img" src="'+esc(q.img)+'" alt="Hình của câu hỏi">':'')+'<div id="trx"></div><div class="opts">'+o.map(function(t,k){return '<button class="opt'+(E.answers[id]===t?' sel':'')+'" data-k="'+k+'"><b>'+L[k]+'</b><span>'+esc(t)+'</span></button>';}).join('')+'</div></div>';
    bind('.opt','click',function(e,b){pick(+b.dataset.k);},$('#eq'));
    $('#trb').onclick=function(){trToggle($('#trx'),$('#trb'),QMAP[id],o);};
    $('#grid').innerHTML=E.ids.map(function(x,k){return '<button data-g="'+k+'" class="'+(E.answers[x]!=null?'done ':'')+(E.flags[x]?'flag ':'')+(k===E.cur?'cur':'')+'">'+(k+1)+'</button>';}).join('');
    bind('[data-g]','click',function(e,b){E.cur=+b.dataset.g;save();draw();},$('#grid'));
  }
  function pick(k){var id=E.ids[E.cur];E.answers[id]=E.opts[id][k];save();draw();if(E.cur<E.ids.length-1)setTimeout(function(){move(1);},180);}
  function move(d){E.cur=Math.max(0,Math.min(E.ids.length-1,E.cur+d));save();draw();}
  function flag(){var id=E.ids[E.cur];E.flags[id]=!E.flags[id];save();draw();}
  function tick(){var left=(E.endsAt-Date.now())/1000,t=$('#tm');if(!t)return;t.textContent=fmtTime(left);t.classList.toggle('low',left<300);if(left<300&&!E.warned){E.warned=true;save();toast('Còn 5 phút!');}if(left<=0)submitExam(true);}
  bind('#pv','click',function(){move(-1);});bind('#nx','click',function(){move(1);});bind('#fl','click',flag);
  bind('#sb','click',function(){var un=E.ids.filter(function(x){return E.answers[x]==null;}).length,fl=E.ids.filter(function(x){return E.flags[x];}).length;
    confirmBox((un?'Còn <b>'+un+'</b> câu chưa làm. ':'Bạn đã làm hết các câu. ')+(fl?'Có <b>'+fl+'</b> câu gắn cờ. ':'')+'Nộp bài?','Nộp bài').then(function(y){if(y)submitExam(false);});});
  draw();tick();every(tick,1000);
  setKeys(function(e){var n=keyIdx(e,E.opts[E.ids[E.cur]].length);if(n>=0){pick(n);return true;}if(e.key.toUpperCase()==='F'){flag();return true;}if(e.key==='ArrowLeft'){move(-1);return true;}if(e.key==='ArrowRight'){move(1);return true;}});
}
function submitExam(auto){
  var E=P.examInProgress;if(!E)return;clearTimers();
  var by={},right=0,wrong=[];
  E.ids.forEach(function(id){var q=QMAP[id],ok=E.answers[id]===T(q,'en').correct;if(ok)right++;else wrong.push(id);var b=by[q.module]||(by[q.module]=[0,0]);b[1]++;if(ok)b[0]++;record(q,ok,E.answers[id]==null);});   // câu bỏ trống: vẫn tính là sai trong tiến độ nhưng không ghi nhật ký/không tính điểm
  var bm={};Object.keys(by).forEach(function(k){bm[k]=by[k][0]/by[k][1];});
  track('exam_finish',{answered:E.ids.filter(function(x){return E.answers[x]!=null;}).length,right:right,total:E.ids.length,score:Math.round(right/E.ids.length*100)/10,auto:!!auto});
  P.exams.push({date:new Date().toISOString(),config:E.config,score:Math.round(right/E.ids.length*100)/10,right:right,total:E.ids.length,byModule:bm,past:E.past||null,seconds:Math.round(Math.min(Date.now()-E.startedAt,E.endsAt-E.startedAt)/1000),wrong:wrong,answers:E.answers});
  P.examInProgress=null;save();if(auto)toast('Hết giờ — bài đã được tự động nộp');
  location.hash='#/exam?r='+(P.exams.length-1);
}
function examResult(i){
  var x=P.exams[i],p=x.score/10;
  render('<div class="row small muted"><a href="#/exam">← Thi thử</a></div><div class="card hero" style="margin-top:10px"><div><div class="small" style="opacity:.85">'+esc(x.config)+' · '+fmtTime(x.seconds)+'</div><h1 style="margin:.2em 0">'+(x.score>=8?'Đạt mục tiêu!':x.score>=4?'Qua mức tối thiểu':'Dưới mức tối thiểu 4')+'</h1><p>'+x.right+'/'+x.total+' câu đúng'+(x.score<8?' — cần ≥ 8 để vào phòng thi tự tin.':'.')+'</p><div class="row">'+(x.wrong.length?'<a class="btn" href="#/mistakes">Làm lại câu sai</a>':'')+'<a class="btn ghost" href="#/exam">Thi lại</a></div></div><div class="ring">'+ring(p,118,10,'#fff','rgba(255,255,255,.25)')+'<b>'+x.score.toFixed(1)+'<small>/10</small></b></div></div>'+
   '<div class="card"><h3 style="margin-top:0">Theo chương</h3>'+Object.keys(x.byModule).sort(function(a,b){return +a.slice(1)-+b.slice(1);}).map(function(k){var v=x.byModule[k];return '<div class="mrow" style="grid-template-columns:minmax(0,1fr) 120px 46px"><span class="nm">'+dot(k)+'<span><b>'+MOD[k].short+'</b> '+esc(MOD[k].title)+'</span></span><div class="bar '+barClass(v)+'"><i style="width:'+v*100+'%"></i></div><span class="small">'+pct(v)+'</span></div>';}).join('')+'</div>'+
   (x.wrong.length?'<h2>Câu sai ('+x.wrong.length+')</h2>'+x.wrong.map(function(id){var q=QMAP[id];if(!q)return '';var t=T(q,'en'),a=x.answers[id];return '<div class="card"><div class="small muted">'+srcTag(q)+'</div><div style="font-weight:600">'+qhtml(t.q)+'</div><div class="small" style="margin-top:8px">Bạn chọn: <span style="color:var(--bad)">'+(a?esc(a):'(bỏ trống)')+'</span><br>Đáp án: <b style="color:var(--ok)">'+esc(t.correct)+'</b></div><div class="small muted" style="margin-top:4px">'+esc(q.explain)+(q.ref?' <a href="'+refLink(q.ref)+'">§'+q.ref+'</a>':'')+(q.past||!q.en?'':'<br>Tiếng Việt: '+esc(q.q)+' → '+esc(q.correct))+'</div><div class="aibox" data-id="'+id+'"></div></div>';}).join(''):''));
  $$('.aibox').forEach(function(el){var q=QMAP[el.dataset.id],t=T(q,'en'),a=x.answers[el.dataset.id];
    var ctx={lang:'en',opts:[t.correct].concat(t.wrong),picked:a||null,answered:true};aiBox(el,q,function(){return ctx;});});
}

// ===== Bộ đề SSG105 =====
var bankSt={topics:[],sections:[],filter:'all',order:'shuffle',n:20,query:'',source:SJ.slides?'slides':'all'};
function bankStat(list){var done=0,ok=0;list.forEach(function(q){var a=P.answers[q.id];if(a){done++;if(a.lastOk)ok++;}});return {done:done,ok:ok,n:list.length};}
routes.bank=function(){
  var st=bankSt;
  var pool=st.source==='slides'?SLIDES_BANK:BANK;
  var all=bankStat(pool),topics=[],sections=[];
  pool.forEach(function(q){
    if(topics.indexOf(q.topic)<0)topics.push(q.topic);
    if(sections.indexOf(q.section)<0)sections.push(q.section);
  });
  function pickList(){
    return pool.filter(function(q){
      if(st.topics.length&&st.topics.indexOf(q.topic)<0)return false;
      if(st.sections.length&&st.sections.indexOf(q.section)<0)return false;
      var a=P.answers[q.id];
      if(st.filter==='new'&&a)return false;
      if(st.filter==='wrong'&&!(P.mistakes[q.id]||(a&&!a.lastOk)))return false;
      return true;});
  }
  function draw(){
    var list=pickList();
    render('<div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">'+esc(SJ.bankTitle)+'</h1><div class="seg"><button class="on" type="button">Luyện tập</button><a class="btn sm ghost" href="#/review" style="border-radius:8px">Xem tất cả câu hỏi</a></div></div><p class="muted" style="margin:6px 0 12px">'+pool.length+' câu tiếng Anh tổng hợp từ đề các kì và tài liệu ôn của giảng viên. Mỗi câu có nút <b>Dịch</b> và <b>Bố Tuấn Anh</b>.</p>'+
      '<div class="stats"><div class="stat"><b>'+all.done+'/'+all.n+'</b><span>Câu đã làm</span></div><div class="stat"><b>'+(all.done?pct(all.ok/all.done):'—')+'</b><span>Đúng ở lần gần nhất</span></div><div class="stat"><b>'+pool.filter(function(q){return P.mistakes[q.id];}).length+'</b><span>Câu đang trong sổ sai</span></div></div>'+
      '<div class="card"><h3 style="margin-top:0">Luyện tập</h3>'+
        (!SJ.slides?'':'<div class="seg" style="margin-bottom:14px"><button data-source="slides" class="'+(st.source==='slides'?'on':'')+'">'+SLIDES_BANK.length+' câu đầu từ Google Slides</button><button data-source="all" class="'+(st.source==='all'?'on':'')+'">Toàn bộ '+BANK.length+' câu</button></div>')+
        '<div class="small muted" style="margin-bottom:6px">Chủ đề <span class="muted">(không chọn = tất cả)</span></div><div class="chips">'+topics.map(function(t){var s=bankStat(pool.filter(function(q){return q.topic===t;}));return '<button data-topic="'+esc(t)+'" class="'+(st.topics.indexOf(t)>=0?'on':'')+'">'+esc(t)+' <span class="muted">'+s.done+'/'+s.n+'</span></button>';}).join('')+'</div>'+
        '<div class="small muted" style="margin:14px 0 6px">Dạng câu</div><div class="chips">'+sections.map(function(s){var n=pool.filter(function(q){return q.section===s;}).length;return '<button data-sec="'+esc(s)+'" class="'+(st.sections.indexOf(s)>=0?'on':'')+'">'+esc(s)+' <span class="muted">'+n+'</span></button>';}).join('')+'</div>'+
        '<div class="row" style="margin-top:14px;gap:14px 20px"><div><div class="small muted" style="margin-bottom:4px">Câu</div><div class="seg"><button data-f="all" class="'+(st.filter==='all'?'on':'')+'">Tất cả</button><button data-f="new" class="'+(st.filter==='new'?'on':'')+'">Chưa làm</button><button data-f="wrong" class="'+(st.filter==='wrong'?'on':'')+'">Đã sai</button></div></div>'+
        '<div><div class="small muted" style="margin-bottom:4px">Thứ tự</div><div class="seg"><button data-o="shuffle" class="'+(st.order==='shuffle'?'on':'')+'">Ngẫu nhiên</button><button data-o="seq" class="'+(st.order==='seq'?'on':'')+'">Theo bộ đề</button></div></div>'+
        '<div><div class="small muted" style="margin-bottom:4px">Số câu</div><div class="seg">'+[10,20,30,50,0].map(function(n){return '<button data-n="'+n+'" class="'+(st.n===n?'on':'')+'">'+(n||'Tất cả')+'</button>';}).join('')+'</div></div></div>'+
        '<button class="btn primary big" id="bstart" style="width:100%;margin-top:16px"'+(list.length?'':' disabled')+'>Bắt đầu · '+(st.n?Math.min(st.n,list.length):list.length)+' câu '+ic('arrow')+'</button>'+
        '<p class="small muted" style="margin:8px 0 0">'+list.length+' câu khớp bộ lọc. Câu “Chọn 2-3 đáp án”: bấm chọn đủ rồi <b>Kiểm tra</b>. Câu có “All of the above”, “None of the others”… giữ nguyên thứ tự đáp án.</p></div>'+
      '<div class="card"><h3 style="margin-top:0">Tìm câu</h3><input type="search" id="bq" class="sel" style="max-width:none;width:100%" placeholder="Gõ từ khoá tiếng Anh, vd: groupthink, coercive, minutes, résumé" value="'+esc(st.query)+'"><div id="bres"></div></div>');
    bind('[data-source]','click',function(e,b){
      if(st.source===b.dataset.source)return;
      st.source=b.dataset.source;st.topics=[];st.sections=[];routes.bank();
    });
    bind('[data-topic]','click',function(e,b){var t=b.dataset.topic,k=st.topics.indexOf(t);if(k>=0)st.topics.splice(k,1);else st.topics.push(t);draw();});
    bind('[data-sec]','click',function(e,b){var t=b.dataset.sec,k=st.sections.indexOf(t);if(k>=0)st.sections.splice(k,1);else st.sections.push(t);draw();});
    bind('[data-f]','click',function(e,b){st.filter=b.dataset.f;draw();});
    bind('[data-o]','click',function(e,b){st.order=b.dataset.o;draw();});
    bind('[data-n]','click',function(e,b){st.n=+b.dataset.n;draw();});
    bind('#bstart','click',function(){var l=pickList();if(st.order==='shuffle')l=shuffle(l);if(st.n)l=l.slice(0,st.n);
      runQuiz(l,SJ.bankTitle+(st.topics.length?' · '+st.topics.join(', '):''),'#/bank','en');});
    var deb;$('#bq').oninput=function(){var v=this.value;clearTimeout(deb);deb=setTimeout(function(){st.query=v;search();},250);};
    search();
  }
  function search(){
    var el=$('#bres'),k=st.query.trim().toLowerCase();if(!el)return;
    if(k.length<2){el.innerHTML='';return;}
    var res=pool.filter(function(q){return (q.q+' '+q.orig.join(' ')).toLowerCase().indexOf(k)>=0;});
    el.innerHTML='<p class="small muted">'+res.length+' câu'+(res.length>30?' · hiện 30 câu đầu':'')+'</p>'+res.slice(0,30).map(function(q){
      return '<div class="bres"><div class="small muted">'+srcTag(q)+' <span class="tag">'+esc(q.topic)+'</span></div><div style="font-weight:600;margin:6px 0">'+qhtml(q.q)+'</div>'+
        '<ol class="tr-opts">'+q.orig.map(function(o,j){var g=q.answers.indexOf(o)>=0;return '<li'+(g?' class="good"':'')+'><b>'+L[j]+'.</b> '+esc(o)+(g?' ✓':'')+'</li>';}).join('')+'</ol>'+
        (q.explain?'<p class="small muted">'+esc(q.explain)+'</p>':'')+
        '<div class="aibox" data-id="'+q.id+'"></div></div>';}).join('');
    $$('.aibox',el).forEach(function(box){var q=QMAP[box.dataset.id],ctx={lang:'en',opts:q.orig.slice(),picked:null,answered:true};aiBox(box,q,function(){return ctx;});});
  }
  draw();
};

// ===== Mistakes =====
routes.mistakes=function(){
  var ids=mistakeIds();
  if(!ids.length){render('<h1>Câu sai</h1><div class="card empty"><div class="e">'+ic('checkc')+'</div><h3>Chưa có câu sai</h3><p class="muted">Câu trả lời sai khi luyện tập hoặc thi thử sẽ tự vào đây.</p><a class="btn primary" href="#/practice">Luyện 20 câu</a></div>');return;}
  var by={};ids.forEach(function(id){var m=QMAP[id].module;by[m]=(by[m]||0)+1;});
  var sorted=ids.slice().sort(function(a,b){return P.mistakes[b].wrong-P.mistakes[a].wrong;});
  render('<h1>Câu sai</h1><div class="card row between"><div><div class="big-n">'+ids.length+'</div><div class="small muted">câu cần làm lại · ra khỏi sổ khi đúng 2 lần liên tiếp</div></div><button class="btn primary big" id="redo">Làm lại tất cả '+ic('arrow')+'</button></div>'+
   '<div class="chips" style="margin:6px 0 4px">'+Object.keys(by).sort(function(a,b){return by[b]-by[a];}).map(function(k){return '<button data-m="'+k+'">'+dot(k)+MOD[k].short+' · '+by[k]+'</button>';}).join('')+'</div><p class="small muted">Bấm một chương để chỉ làm lại câu sai của chương đó.</p>'+
   sorted.map(function(id){var q=QMAP[id],t=T(q,plang()),m=P.mistakes[id];return '<div class="card" style="padding:14px 18px"><div class="row small muted">'+dot(q.module)+MOD[q.module].short+'<span class="tag bad">sai '+m.wrong+' lần</span>'+(m.streak?'<span class="tag ok">đúng '+m.streak+'/2</span>':'')+srcTag(q)+'</div><div style="margin-top:6px;font-weight:600">'+qhtml(t.q)+'</div><details><summary>Xem đáp án</summary><div class="small" style="margin-top:6px"><b style="color:var(--ok)">'+esc(t.correct)+'</b><div class="muted">'+esc(q.explain)+(q.ref?' <a href="'+refLink(q.ref)+'">§'+q.ref+'</a>':'')+'</div></div><div class="aibox" data-id="'+id+'"></div></details></div>';}).join(''));
  $$('.aibox').forEach(function(el){var q=QMAP[el.dataset.id],t=T(q,plang());
    var ctx={lang:plang(),opts:q.orig?q.orig.slice():[t.correct].concat(t.wrong),picked:null,answered:true};aiBox(el,q,function(){return ctx;});});
  bind('#redo','click',function(){runQuiz(shuffle(ids.map(function(k){return QMAP[k];})),'Làm lại câu sai','#/mistakes');});
  bind('[data-m]','click',function(e,b){runQuiz(shuffle(ids.filter(function(k){return QMAP[k].module===b.dataset.m;}).map(function(k){return QMAP[k];})),'Câu sai '+MOD[b.dataset.m].short,'#/mistakes');});
};

// ===== Flashcards: English terms, Leitner boxes =====
var INTERVAL=[0,1,2,4,7,15];
function cardId(g){return 'g-'+g.term.toLowerCase().replace(/[^a-z0-9]+/g,'-');}
function addDays(s,n){var d=new Date(s+'T00:00:00');d.setDate(d.getDate()+n);return ymd(d);}
function dueTerms(mod){var t=today();return D.glossary.filter(function(g){var p=P.cards[cardId(g)];return p&&p.due<=t&&(!mod||g.module===mod);});}
function newTerms(mod){return D.glossary.filter(function(g){return !P.cards[cardId(g)]&&(!mod||g.module===mod);});}
routes.cards=function(_,qs){
  var mod=qs.m||'',mode=qs.mode||'due',rev=qs.rev==='1',list=qs.list==='1';
  var known=D.glossary.filter(function(g){var p=P.cards[cardId(g)];return p&&p.box>=3;}).length;
  var head='<h1>Flashcard thuật ngữ</h1><p class="muted" style="margin-top:-6px">'+D.glossary.length+' thuật ngữ tiếng Anh của môn · đã thuộc '+known+' · đến hạn hôm nay '+dueTerms().length+'</p>'+
    '<div class="row" style="margin-bottom:12px"><select id="cm" class="sel">'+'<option value="">Tất cả chương</option>'+D.modules.map(function(m){return '<option value="'+m.id+'"'+(m.id===mod?' selected':'')+'>'+m.short+' · '+esc(m.title)+'</option>';}).join('')+'</select>'+
    '<div class="seg"><button data-mode="due" class="'+(mode==='due'&&!list?'on':'')+'">Theo lịch</button><button data-mode="all" class="'+(mode==='all'&&!list?'on':'')+'">Ôn tất cả</button><button data-mode="list" class="'+(list?'on':'')+'">Danh sách</button></div>'+
    (list?'':'<label class="small row" style="gap:6px"><input type="checkbox" id="rev"'+(rev?' checked':'')+'> Đảo: Việt → Anh</label>')+'</div>';
  function nav(o){var p=Object.assign({m:$('#cm').value,mode:mode,rev:rev?'1':'',list:list?'1':''},o),s=[];Object.keys(p).forEach(function(k){if(p[k])s.push(k+'='+p[k]);});location.hash='#/cards'+(s.length?'?'+s.join('&'):'');}
  function wire(){$('#cm').onchange=function(){nav({});};bind('[data-mode]','click',function(e,b){if(b.dataset.mode==='list')nav({list:'1'});else nav({mode:b.dataset.mode,list:''});});var r=$('#rev');if(r)r.onchange=function(){nav({rev:this.checked?'1':''});};}
  if(list){
    var gl=D.glossary.filter(function(g){return !mod||g.module===mod;}).slice().sort(function(a,b){return a.term.localeCompare(b.term);});
    render(head+'<div class="card" style="padding:6px 18px">'+gl.map(function(g){var p=P.cards[cardId(g)];return '<div class="gl"><div><b>'+esc(g.term)+'</b> <span class="muted">— '+esc(g.vi)+'</span><div class="small muted">'+esc(g.def)+'</div></div>'+(p&&p.box>=3?'<span class="tag ok">đã thuộc</span>':p?'<span class="tag">hộp '+p.box+'</span>':'')+'</div>';}).join('')+'</div>');
    wire();return;
  }
  var q=mode==='all'?shuffle(D.glossary.filter(function(g){return !mod||g.module===mod;})):shuffle(dueTerms(mod)).concat(newTerms(mod).slice(0,20));
  // Phiên ôn: deck là danh sách thẻ theo thứ tự, pos là thẻ đang xem; có thể lùi lại xem / chấm lại thẻ trước.
  var deck=q,pos=0,flipped=false,rated={},RATE=['Quên','Khó','Nhớ','Dễ'];
  render(head+'<div id="fc"></div>'+
    '<div class="kbd-help hide-m"><span><kbd>Space</kbd> lật</span><span><kbd>←</kbd><kbd>→</kbd> thẻ trước / sau</span><span><kbd>1</kbd> Quên <kbd>2</kbd> Khó <kbd>3</kbd> Nhớ <kbd>4</kbd> Dễ</span><span><kbd>R</kbd> đảo Việt ↔ Anh</span></div>'+
    '<p class="small muted">Khoảng ôn theo hộp: 0 → 1 → 2 → 4 → 7 → 15 ngày. “Quên” đưa thẻ về cuối phiên để gặp lại. Trên điện thoại có thể vuốt trái/phải để chuyển thẻ.</p>');
  wire();
  function draw(){
    var el=$('#fc');
    if(!deck.length||pos>=deck.length){
      var n=Object.keys(rated).length;
      el.innerHTML='<div class="card empty"><div class="e">'+ic('checkc')+'</div><h3>'+(deck.length?'Xong phiên ôn · đã chấm '+n+' thẻ':'Không có thẻ nào đến hạn')+'</h3><p class="muted">Thẻ “Nhớ”, “Dễ” sẽ quay lại theo lịch; bạn vẫn có thể ôn tất cả bất cứ lúc nào.</p><div class="row" style="justify-content:center">'+(deck.length?'<button class="btn" id="backb">← Xem lại thẻ cuối</button>':'')+'<button class="btn primary" id="allb">Ôn tất cả</button><a class="btn ghost" href="#/">Trang chủ</a></div></div>';
      $('#allb').onclick=function(){nav({mode:'all'});};if($('#backb'))$('#backb').onclick=function(){go2(deck.length-1);};
      setKeys(function(e){if(e.key==='ArrowLeft'&&deck.length){go2(deck.length-1);return true;}});return;}
    var g=deck[pos],p=P.cards[cardId(g)],front=rev?g.vi:g.term,r=rated[pos],pc=Math.round(pos/deck.length*100);flipped=false;
    el.innerHTML='<div class="fc-top"><span class="small muted">Thẻ <b>'+(pos+1)+'</b> / '+deck.length+'</span><div class="bar"><i style="width:'+pc+'%"></i></div><span class="small muted">'+dot(g.module)+MOD[g.module].short+' · '+(p?'hộp '+p.box:'thẻ mới')+'</span></div>'+
     '<div class="fc-stage"><button class="fc-nav" id="fcp" aria-label="Thẻ trước"'+(pos===0?' disabled':'')+'>‹</button>'+
     '<div class="flip" id="fl" role="button" tabindex="0" aria-label="Lật thẻ"><div class="inner"><div class="face">'+(r!=null?'<span class="tag fc-rated">đã chấm: '+RATE[r]+'</span>':'')+'<div class="big">'+esc(front)+'</div><div class="small muted" style="margin-top:14px">Chạm hoặc Space để lật</div></div>'+
     '<div class="face back"><div class="big">'+esc(g.term)+'</div><div style="font-weight:600;color:var(--primary);margin-top:4px">'+esc(g.vi)+'</div><div class="small" style="margin-top:10px">'+esc(g.def)+'</div></div></div></div>'+
     '<button class="fc-nav" id="fcn" aria-label="Thẻ sau">›</button></div>'+
     '<div class="rate" id="rt"><button class="btn" data-r="0">Quên<small>1 · xem lại</small></button><button class="btn" data-r="1">Khó<small>2 · giữ hộp</small></button><button class="btn" data-r="2">Nhớ<small>3 · +1 hộp</small></button><button class="btn" data-r="3">Dễ<small>4 · +2 hộp</small></button></div>'+
     '<p class="small muted center" id="rthint">Lật thẻ để tự chấm mức độ nhớ</p>';
    $('#rt').classList.add('locked');
    $('#fl').onclick=flip;$('#fcp').onclick=function(){go2(pos-1);};$('#fcn').onclick=function(){go2(pos+1);};
    bind('[data-r]','click',function(e,b){rate(+b.dataset.r);},el);
    // vuốt trái/phải trên điện thoại
    var sx=null;$('#fl').addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
    $('#fl').addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>60){e.preventDefault();go2(pos+(dx<0?1:-1));}});
  }
  function go2(i){pos=Math.max(0,Math.min(deck.length,i));draw();}
  function flip(){flipped=!flipped;$('#fl').classList.toggle('on',flipped);$('#rt').classList.toggle('locked',!flipped);$('#rthint').style.visibility=flipped?'hidden':'visible';}
  function rate(r){if(!flipped)return;var g=deck[pos],id=cardId(g),p=P.cards[id]||{box:0};
    if(r===0)p.box=0;else if(r===1)p.box=Math.max(1,p.box);else if(r===2)p.box=Math.min(5,p.box+1);else p.box=Math.min(5,p.box+2);
    p.due=addDays(today(),INTERVAL[p.box]);P.cards[id]=p;save();
    if(r===0&&rated[pos]!==0&&deck.indexOf(g,pos+1)<0)deck.push(g);   // quên → gặp lại cuối phiên (1 lần)
    rated[pos]=r;go2(pos+1);}
  draw();
  setKeys(function(e){if(pos>=deck.length)return;
    if(e.key===' '||e.key==='Enter'){flip();return true;}
    if(e.key==='ArrowRight'){go2(pos+1);return true;}if(e.key==='ArrowLeft'){go2(pos-1);return true;}
    if(e.key==='r'||e.key==='R'){nav({rev:rev?'':'1'});return true;}
    var i='1234'.indexOf(e.key);if(i>=0){if(!flipped)flip();else rate(i);return true;}});
};

// ===== Thi đấu trực tuyến (Multiplayer Arena): Hỗ trợ 2-8 người chơi qua internet / 4G / khác mạng =====
var KEEP_ANY = function(arr) { return arr.some(function(o) { return KEEP_RE.test(o); }); };
var DUEL_SRC = !SJ.slides ? {
  bank: { t: 'Bộ đề ' + BANK.length + ' câu', list: function() { return BANK.filter(function(q) { return q.answers.length === 1; }); } }
} : {
  slides: { t: 'Bộ đề 167 câu (Slides)', list: function() { return SLIDES_BANK.filter(function(q) { return q.answers.length === 1; }); } },
  bank: { t: 'Bộ đề 470 câu', list: function() { return BANK.filter(function(q) { return q.answers.length === 1; }); } },
  exam: { t: 'Kiểu đề thi 296 câu', list: function() { return ALLQ; } }
};

var ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
];

var DU = {
  peer: null,
  conns: [],      // host: array of connections; guest: single connection
  role: null,     // 'host' or 'guest'
  myId: '',
  code: '',
  s: null,
  correct: {},
  timer: null,
  qStart: 0,
  lastI: -1,
  countStart: 0,
  recorded: -1,
  pending: -1,
  pendingChoice: null,
  busy: '',
  cfg: { src: SJ.slides ? 'slides' : 'bank', n: 10, sec: 20 }
};

var PEER_PREFIX = SJ.peer;
DU.botLv = 'mid'; DU.botTimers = []; DU.autoBots = 0; DU.endPlayed = false;
function duelMuted() { try { return localStorage.getItem(KEY + '_snd') === '0'; } catch (e) { return false; } }
function duelBeep(kind) {
  if (duelMuted()) return;
  try {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    duelBeep.ctx = duelBeep.ctx || new AC(); var c = duelBeep.ctx; if (c.state === 'suspended') c.resume();
    var seq = { tick: [[660, .07]], go: [[880, .18]], ok: [[660, .09], [880, .14]], bad: [[220, .22]], end: [[523, .12], [659, .12], [784, .22]] }[kind] || [];
    var t = c.currentTime;
    seq.forEach(function(n) {
      var o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = n[0];
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + n[1]);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + n[1] + .02); t += n[1];
    });
  } catch (e) {}
}
var BOT_NAMES = ['Trung hắc hóa', 'Việt hắc hóa', 'Lân hắc hóa', 'Khoa hắc hóa', 'Huy hắc hóa', 'Tuấn Anh', 'Anh Vỹ'];
// Bot đặc biệt: Tuấn Anh luôn ở mức Khó; Anh Vỹ ở mức Vừa nhưng thỉnh thoảng cướp điểm của một người chơi khác
var BOT_FIXED = { 'Tuấn Anh': 'hard', 'Anh Vỹ': 'mid' };
function duelBotSteal() {
  var s = DU.s; if (!s || DU.role !== 'host') return; s.steal = null;
  var th = s.players.filter(function(p) { return p.isBot && p.connected && p.steal; })[0];
  if (!th || Math.random() > 0.3) return;
  var vs = s.players.filter(function(p) { return p.connected && p.id !== th.id && p.score > 0; });
  if (!vs.length) return;
  var v = vs[Math.floor(Math.random() * vs.length)], amt = Math.min(v.score, 50 + 10 * Math.floor(Math.random() * 11));
  v.score -= amt; th.score += amt; s.steal = { by: th.id, from: v.id, amt: amt, byName: th.name, fromName: v.name };
}
var BOT_LV = { easy: { t: 'Dễ', acc: .5, lo: .35, hi: .85 }, mid: { t: 'Vừa', acc: .72, lo: .2, hi: .7 }, hard: { t: 'Khó', acc: .9, lo: .1, hi: .5 } };
function duelLvSeg() { return '<div class="seg">' + Object.keys(BOT_LV).map(function(k) { return '<button type="button" data-blv="' + k + '" class="' + (DU.botLv === k ? 'on' : '') + '">' + BOT_LV[k].t + '</button>'; }).join('') + '</div>'; }
function duelAddBot(pick) {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  if (s.players.filter(function(p) { return p.connected; }).length >= 8) return toast('Phòng đã đủ 8 người');
  var used = s.players.map(function(p) { return p.name; }), nm = (pick && pick.name) || BOT_NAMES.filter(function(n) { return used.indexOf(n + ' (máy)') < 0; })[0] || ('Máy ' + s.players.length);
  if (used.indexOf(nm + ' (máy)') >= 0) return toast(nm + ' đã có trong phòng');
  var bav = (pick && pick.av) ? validAv(pick.av) : { c: Math.floor(Math.random() * 8), i: Math.floor(Math.random() * 12) };
  s.players.push({ av: bav, id: 'bot_' + Math.random().toString(36).slice(2, 7), name: nm + ' (máy)', score: 0, pick: null, time: null, connected: true, isHost: false, isBot: true, lv: BOT_FIXED[nm] || DU.botLv, steal: nm === 'Anh Vỹ' });
  if (s.phase === 'wait') s.phase = 'ready';
  duelPush();
}
function duelBotPicker() {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  var used = s.players.map(function(p) { return p.name; });
  var info = { 'Tuấn Anh': 'Luôn ở mức Khó', 'Anh Vỹ': 'Mức Vừa, thỉnh thoảng cướp điểm của người khác' };
  var rows = BOT_NAMES.map(function(n, k) {
    var has = used.indexOf(n + ' (máy)') >= 0, lv = info[n] || ('Mức ' + BOT_LV[DU.botLv].t + ' (theo mục chọn mức độ)');
    return '<div class="bp-row"><span class="bp-av" data-bpav="' + k + '">' + avHtml({ av: { c: k % 8, i: k % 12 } }, 40) + '</span><div class="bp-n"><b>' + esc(n) + '</b><div class="small muted">' + esc(lv) + '</div></div>' +
      '<select class="sel bp-sel" data-bps="' + k + '" aria-label="Ảnh đại diện của ' + esc(n) + '"><option value="">Ảnh: tự động</option>' + AV_CHARS.map(function(x) { return '<option value="' + x.id + '">' + esc(x.n) + '</option>'; }).join('') + '</select>' +
      '<button type="button" class="btn sm primary" data-bpadd="' + k + '"' + (has ? ' disabled' : '') + '>' + (has ? 'Đã có' : 'Thêm') + '</button></div>';
  }).join('');
  modal('<h3 style="margin-top:0">Chọn đối thủ máy</h3><div class="bp-list">' + rows + '</div>', [{ t: 'Đóng', v: null, primary: true }]);
  var m = $('#modal');
  $$('[data-bps]', m).forEach(function(sel) { sel.onchange = function() { var k = +sel.dataset.bps, c = AV_CHARS.filter(function(x) { return x.id === sel.value; })[0]; $('[data-bpav="' + k + '"]', m).innerHTML = avHtml({ av: c ? { c: 0, i: 0, k: c.id } : { c: k % 8, i: k % 12 } }, 40); }; });
  $$('[data-bpadd]', m).forEach(function(b) { b.onclick = function() {
    var k = +b.dataset.bpadd, sel = $('[data-bps="' + k + '"]', m), av = sel.value ? { c: 0, i: 0, k: sel.value } : null;
    duelAddBot({ name: BOT_NAMES[k], av: av }); b.disabled = true; b.textContent = 'Đã có';
  }; });
}
// Mời người đang online vào phòng (chỉ chạy trên web có tài khoản)
function duelInvitePicker() {
  var s = DU.s; if (!s || DU.role !== 'host' || !window.AI_SERVER) return;
  DU.invited = DU.invited || {};
  modal('<h3 style="margin-top:0">Mời người đang online</h3><div class="bp-list" id="invL"><p class="muted small">Đang tải danh sách…</p></div><p class="small muted" style="margin-bottom:0">Người được mời sẽ thấy khung "Tham gia" ở bất kỳ trang nào của web. Lời mời hết hạn sau 2 phút.</p>', [{ t: 'Đóng', v: null, primary: true }]);
  var m = $('#modal');
  function draw(users) {
    var L = $('#invL', m); if (!L) return;
    users = users.filter(function(u) { return u.id !== duelMyUserId(); });
    if (!users.length) { L.innerHTML = '<p class="muted small">Hiện chưa có ai khác đang online.</p>'; return; }
    L.innerHTML = users.map(function(u) {
      var done = DU.invited[DU.code + ':' + u.id];
      return '<div class="bp-row"><span class="bp-av">' + avHtml({ av: { c: u.id % 8, i: u.id % 12 } }, 36) + '</span><div class="bp-n"><b>' + esc(u.name) + '</b>' + (u.role === 'admin' ? ' <span class="tag warn">QTV</span>' : '') + '</div><button type="button" class="btn sm primary" data-inv="' + u.id + '"' + (done ? ' disabled' : '') + '>' + (done ? 'Đã mời' : 'Mời') + '</button></div>';
    }).join('');
    $$('[data-inv]', L).forEach(function(b) { b.onclick = function() {
      var id = +b.dataset.inv; b.disabled = true; b.textContent = 'Đang gửi…';
      svApi('invite', { code: DU.code, to: [id] }).then(function(j) {
        if (j.error) { b.disabled = false; b.textContent = 'Mời'; return toast(j.error); }
        if (j.sent && j.sent.length) { DU.invited[DU.code + ':' + id] = 1; b.textContent = 'Đã mời'; toast('Đã gửi lời mời'); }
        else { b.disabled = false; b.textContent = 'Mời'; toast('Không mời được: ' + ((j.skipped && j.skipped[0] && j.skipped[0].why) || 'không rõ lý do')); }
      }).catch(function() { b.disabled = false; b.textContent = 'Mời'; toast('Lỗi mạng'); });
    }; });
  }
  fetch('/api/chat/online', { credentials: 'same-origin' }).then(function(r) { return r.json(); }).then(function(j) { DU.myUid = j.me; draw(j.users || []); }).catch(function() { var L = $('#invL', m); if (L) L.innerHTML = '<p class="muted small">Không tải được danh sách.</p>'; });
}
function duelMyUserId() { return DU.myUid || 0; }
function duelRemoveBot(id) {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  s.players = s.players.filter(function(p) { return p.id !== id; });
  if (s.players.filter(function(p) { return p.connected; }).length < 2) s.phase = 'wait';
  duelPush();
}
function duelClearBots() { (DU.botTimers || []).forEach(clearTimeout); DU.botTimers = []; }
function duelBotPlay() {
  var s = DU.s; if (!s) return; duelClearBots();
  var qi = s.i, id = s.ids[qi], opts = s.opts[id], good = DU.correct[id], tot = s.cfg.sec * 1000;
  s.players.forEach(function(p) {
    if (!p.isBot || !p.connected) return;
    var lv = BOT_LV[p.lv] || BOT_LV.mid, delay = Math.round((lv.lo + Math.random() * (lv.hi - lv.lo)) * tot), ok = Math.random() < lv.acc;
    var wrong = opts.filter(function(o) { return o !== good; }), choice = (ok || !wrong.length) ? good : wrong[Math.floor(Math.random() * wrong.length)];
    DU.botTimers.push(setTimeout(function() { duelAnswer(p.id, qi, choice, delay); }, delay));
  });
}
function duelName() { try { return localStorage.getItem(KEY + '_name') || ''; } catch(e) { return ''; } }
function duelSetName(v) { try { localStorage.setItem(KEY + '_name', v); } catch(e) {} }

// Kết nối qua máy chủ của web (relay): vào được từ mọi mạng, không cần WebRTC/TURN. Giao diện giống PeerJS để dùng lại logic cũ.
function svApi(action, body) {
  return fetch('/api/duel/' + action, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-requested-with': 'ssg-web' }, body: JSON.stringify(body) })
    .then(function(r) { return r.json().catch(function() { return {}; }).then(function(j) { j.$status = r.status; return j; }); });
}
function SvEmitter() { this.ev = {}; }
SvEmitter.prototype.on = function(n, f) { (this.ev[n] = this.ev[n] || []).push(f); return this; };
SvEmitter.prototype.emit = function(n, x) { var l = this.ev[n] || []; for (var i = 0; i < l.length; i++) { try { l[i](x); } catch (e) { if (window.console) console.error(e); } } };
function SvConn(peer, remoteId) {
  SvEmitter.call(this); this.p = peer; this.peer = remoteId; this.open = false; this.dead = false;
}
SvConn.prototype = Object.create(SvEmitter.prototype);
SvConn.prototype.send = function(m) {
  var p = this.p, to = p.isHost ? this.peer : 'host', c = this; if (this.dead) return;
  p.q = p.q.then(function() { return svApi('send', { code: p.code, from: p.id, to: to, body: JSON.stringify(m) }); }).catch(function() {});
};
SvConn.prototype.close = function() {
  if (this.dead) return; var p = this.p, to = p.isHost ? this.peer : 'host';
  this.send({ $: p.isHost ? 'kick' : 'leave' });
  this.dead = true; this.open = false;
  if (p.isHost) delete p.conns[this.peer]; else p.stop();
};
function SvPeer(id) {
  SvEmitter.call(this); var self = this;
  this.isHost = typeof id === 'string' && id.indexOf(PEER_PREFIX) === 0;
  this.code = this.isHost ? id.slice(PEER_PREFIX.length) : ''; this.id = this.isHost ? 'host' : 'g' + Math.random().toString(36).slice(2, 10);
  this.conns = {}; this.after = 0; this.q = Promise.resolve(); this.fails = 0; this.stopped = false; this.timer = null;
  if (this.isHost) {
    svApi('host', { code: this.code, name: DU.myName || '', subj: PEER_PREFIX }).then(function(j) {
      if (j.$status === 409) return self.emit('error', { type: 'unavailable-id' });
      if (!j.ok) return self.emit('error', { type: 'server-error' });
      self.emit('open', id); self.loop();
    }, function() { self.emit('error', { type: 'network' }); });
  } else setTimeout(function() { self.emit('open', self.id); }, 0);
}
SvPeer.prototype = Object.create(SvEmitter.prototype);
SvPeer.prototype.connect = function(target) {
  var self = this, c = new SvConn(this, 'host'); this.code = target.slice(PEER_PREFIX.length); this.hostConn = c;
  svApi('join', { code: this.code, id: this.id }).then(function(j) {
    if (j.$status === 404) return self.emit('error', { type: 'peer-unavailable' });
    if (!j.ok) return self.emit('error', { type: 'server-error' });
    c.open = true; c.emit('open'); self.loop();
  }, function() { self.emit('error', { type: 'network' }); });
  return c;
};
SvPeer.prototype.loop = function() {
  var self = this; if (this.stopped) return;
  clearTimeout(this.timer);
  this.timer = setTimeout(function() {
    if (self.stopped) return;
    svApi('poll', { code: self.code, me: self.id, after: self.after, meta: self.isHost ? self.meta : undefined }).then(function(j) {
      if (self.stopped) return;
      if (j.$status === 401) { self.stop(); return self.emit('error', { type: 'network' }); }
      self.fails = 0; self.after = j.after || self.after;
      if (self.isHost) {
        if (j.closed) { self.stop(); return self.emit('error', { type: 'server-error' }); }
        (j.msgs || []).forEach(function(r) { self.deliver(r.body); });
        (j.gone || []).forEach(function(g) { var c = self.conns[g]; if (c) { c.dead = true; c.open = false; delete self.conns[g]; c.emit('close'); } });
      } else {
        (j.msgs || []).forEach(function(r) { self.deliver(r.body); });
        if ((j.kicked || !j.hostAlive) && self.hostConn && self.hostConn.open) { var hc = self.hostConn; hc.open = false; hc.dead = true; self.stop(); hc.emit('close'); return; }
      }
      self.loop();
    }, function() {
      self.fails++;
      if (self.fails >= 10) { self.stop(); if (self.isHost) self.emit('error', { type: 'network' }); else if (self.hostConn) { self.hostConn.open = false; self.hostConn.emit('close'); } return; }
      self.loop();
    });
  }, 600);
};
SvPeer.prototype.deliver = function(body) {
  var env; try { env = JSON.parse(body); } catch (e) { return; } var m = env.m, f = env.f; if (!m) return;
  if (this.isHost) {
    var c = this.conns[f];
    if (m.$ === 'join') {
      if (c) return;
      c = this.conns[f] = new SvConn(this, f); c.open = true; this.emit('connection', c); c.emit('open'); return;
    }
    if (!c) return;
    if (m.$ === 'leave') { c.dead = true; c.open = false; delete this.conns[f]; c.emit('close'); return; }
    c.emit('data', m);
  } else if (this.hostConn) {
    if (m.$ === 'kick') { var hc = this.hostConn; hc.open = false; hc.dead = true; this.stop(); hc.emit('close'); return; }
    this.hostConn.emit('data', m);
  }
};
SvPeer.prototype.stop = function() { this.stopped = true; clearTimeout(this.timer); };
SvPeer.prototype.reconnect = function() {};
SvPeer.prototype.destroy = function() {
  var self = this, wasHost = this.isHost && !this.stopped; this.stopped = true; clearTimeout(this.timer);
  if (wasHost) { this.q = this.q.then(function() { return svApi('close', { code: self.code }); }).catch(function() {}); }
};
var AV_COLORS = ['#2f4bd1', '#0f9d77', '#d9480f', '#a61e82', '#c92a2a', '#0b7285', '#5f3dc4', '#e67700'];
var AV_ICONS = ['spark', 'bulb', 'book', 'pen', 'swords', 'trophy', 'globe', 'layers', 'clock', 'cards', 'chat', 'flag'];
// Nhân vật: hiện huy hiệu emoji; nếu có file ảnh /avatars/<id>.jpg thì tự dùng ảnh đó
var AV_CHARS = [
  { id: 'messi', n: 'Messi', e: '⚽', c: '#4f9fd8' }, { id: 'ronaldo', n: 'Ronaldo', e: '🐐', c: '#c8102e' },
  { id: 'j97', n: 'J97', e: '🎤', c: '#7c3aed' }, { id: 'khabanh', x: 'webp', n: 'Khá Bảnh', e: '😎', c: '#111827' },
  { id: 'huanhoahong', n: 'Huấn Hoa Hồng', e: '🌹', c: '#be123c' }, { id: 'truongcon', x: 'webp', n: 'Trường Con', e: '🧒', c: '#ea580c' },
  { id: 'truonggiang', n: 'Trường Giang', e: '🎬', c: '#0891b2' }, { id: 'trump', x: 'webp', n: 'Donald Trump', e: '🦅', c: '#b45309' },
  { id: 'putin', n: 'Putin', e: '🐻', c: '#475569' }
];
function avChar(id) { return AV_CHARS.filter(function(x) { return x.id === id; })[0] || null; }
function avUrlOk(u) { return typeof u === 'string' && u.length < 14000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(u); }
function duelAv() { try { var v = JSON.parse(localStorage.getItem(KEY + '_av')); if (v && v.u && avUrlOk(v.u)) return { c: 0, i: 0, u: v.u }; if (v && v.k && avChar(v.k)) return { c: 0, i: 0, k: v.k }; if (v && v.c >= 0 && v.i >= 0) return { c: v.c % 8, i: v.i % 12 }; } catch (e) {} return { c: 0, i: 0 }; }
function duelSetAv(v) { try { localStorage.setItem(KEY + '_av', JSON.stringify(v)); } catch (e) {} }
function validAv(v) { if (v && v.u && avUrlOk(v.u)) return { c: 0, i: 0, u: v.u }; if (v && v.k && avChar(v.k)) return { c: 0, i: 0, k: v.k }; return (v && v.c >= 0 && v.c < 8 && v.i >= 0 && v.i < 12) ? { c: v.c | 0, i: v.i | 0 } : { c: 0, i: 0 }; }
function avHtml(p, size) { var v = (p && p.av) || { c: 0, i: 0 };
  if (v.u && avUrlOk(v.u)) return '<span class="av av-k" style="width:' + size + 'px;height:' + size + 'px"><img src="' + v.u + '" alt=""></span>';
  var ch = v.k ? avChar(v.k) : null;
  if (ch) return '<span class="av av-k" style="--avc:' + ch.c + ';width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .5) + 'px" title="' + esc(ch.n) + '"><b>' + ch.e + '</b><img src="/avatars/' + ch.id + '.' + (ch.x || 'jpg') + '" alt="" onerror="this.remove()"></span>'; return '<span class="av" style="--avc:' + AV_COLORS[v.c % 8] + ';width:' + size + 'px;height:' + size + 'px">' + ic(AV_ICONS[v.i % 12]) + '</span>'; }
function duelStats() { var z = { games: 0, wins: 0, best: 0, right: 0, total: 0, hist: [] }; try { return Object.assign(z, JSON.parse(localStorage.getItem(KEY + '_dstat')) || {}); } catch (e) { return z; } }
function duelStatsAdd(rec) { var st = duelStats(); st.games++; if (rec.rank === 1 && rec.players > 1) st.wins++; st.best = Math.max(st.best, rec.score); st.right += rec.right; st.total += rec.total; st.hist.unshift(rec); st.hist = st.hist.slice(0, 6); try { localStorage.setItem(KEY + '_dstat', JSON.stringify(st)); } catch (e) {} }
var REACTS = ['Hay đấy', 'Nhanh thật', 'Tiếc quá', 'Cố lên'];
var POWERS = { x2: { t: 'Nhân đôi', d: 'Nếu đúng, điểm câu này nhân đôi' }, fifty: { t: 'Loại 2 đáp án', d: 'Bỏ 2 đáp án sai, nhưng điểm câu này giảm 30%' } };
function duelReact(pid, k) {
  var s = DU.s; if (!s || DU.role !== 'host' || !(k >= 0 && k < REACTS.length)) return;
  var p = s.players.find(function(x) { return x.id === pid; }); if (!p || Date.now() - (p.lastRx || 0) < 1500) return;
  p.lastRx = Date.now(); s.feed = (s.feed || []).concat([{ n: p.name, k: k, t: p.lastRx }]).slice(-4); duelPush();
}
function duelPower(pid, i, k) {
  var s = DU.s; if (!s || DU.role !== 'host' || s.phase !== 'q' || i !== s.i) return;
  var p = s.players.find(function(x) { return x.id === pid; }); if (!p || p.pick != null) return;
  p.pw = p.pw || { x2: 1, fifty: 1 };
  if (k === 'x2' && p.pw.x2 > 0 && p.x2 !== s.i) { p.pw.x2--; p.x2 = s.i; }
  else if (k === 'fifty' && p.pw.fifty > 0 && p.hideI !== s.i) {
    var id = s.ids[s.i], wrong = shuffle(s.opts[id].filter(function(o) { return o !== DU.correct[id]; }));
    if (wrong.length < 2) return;
    p.pw.fifty--; p.hide = wrong.slice(0, 2); p.hideI = s.i;
  } else return;
  duelPush();
}
function duelUsePower(k) { var s = DU.s; if (!s) return; if (DU.role === 'host') duelPower('host', s.i, k); else duelSend({ t: 'pow', i: s.i, k: k }); }
function duelUseReact(k) { if (DU.role === 'host') duelReact('host', k); else duelSend({ t: 'react', k: k }); }
function duelRoomsStart() {
  if (!window.AI_SERVER || !$('#drooms')) return;
  clearInterval(DU.rt);
  function load() {
    if (cur !== 'duel' || DU.s || DU.busy || !$('#drooms')) { clearInterval(DU.rt); return; }
    svApi('list', { subj: PEER_PREFIX }).then(function(j) {
      var b = $('#drooms'); if (!b || DU.s) return;
      var rs = j.rooms || [];
      b.innerHTML = rs.length ? rs.map(function(r) { return '<div class="room-row"><div><b>' + esc(r.name) + '</b><div class="small muted">Mã ' + esc(r.code) + ' · ' + r.n + '/8 người</div></div><button class="btn primary sm" type="button" data-jr="' + esc(r.code) + '">Vào phòng</button></div>'; }).join('')
        : '<p class="small muted" style="margin:8px 0 0">Chưa có phòng nào đang mở. Tạo phòng mới để bạn bè nhìn thấy ở đây.</p>';
      bind('[data-jr]', 'click', function(e, bt) {
        var nm = $('#dname'); if (!nm || !nm.value.trim()) { if (nm) nm.focus(); return toast('Vui lòng nhập tên của bạn'); }
        DU.myName = nm.value.trim(); duelSetName(DU.myName); duelJoin(bt.dataset.jr);
      });
    }, function() {});
  }
  load(); DU.rt = setInterval(load, 3000);
}
function duelLib() {
  if (window.AI_SERVER) { window.Peer = SvPeer; return Promise.resolve(); }
  if (window.Peer) return Promise.resolve();
  if (duelLib.p) return duelLib.p;
  var urls = ['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
  duelLib.p = new Promise(function(res, rej) {
    (function next(k) {
      if (k >= urls.length) { duelLib.p = null; return rej(new Error('lib')); }
      var s = document.createElement('script');
      s.src = urls[k];
      s.onload = function() { window.Peer ? res() : next(k + 1); };
      s.onerror = function() { s.remove(); next(k + 1); };
      document.head.appendChild(s);
    })(0);
  });
  return duelLib.p;
}

function duelMyId() { return DU.role === 'host' ? 'host' : DU.myId; }
function duelMe() {
  var mid = duelMyId();
  return (DU.s && DU.s.players) ? (DU.s.players.find(function(p) { return p.id === mid; }) || null) : null;
}
function duelActive() { return !!(DU.s && ['count', 'q', 'reveal'].indexOf(DU.s.phase) >= 0); }

function duelReset(msg) {
  clearTimeout(DU.timer); duelClearBots(); DU.xp = {}; DU.xpBusy = 0;
  if (DU.role === 'host' && Array.isArray(DU.conns)) {
    DU.conns.forEach(function(c) { try { c.close(); } catch(e) {} });
  } else if (DU.conns && DU.conns.close) {
    try { DU.conns.close(); } catch(e) {}
  }
  try { if (DU.peer) DU.peer.destroy(); } catch(e) {}
  DU.peer = null; DU.conns = []; DU.role = null; DU.myId = ''; DU.s = null; DU.code = ''; DU.busy = '';
  DU.lastI = -1; DU.recorded = -1; DU.pending = -1; DU.pendingChoice = null;
  if (msg) modal('<p style="margin-top:0">' + msg + '</p>');
  duelDraw();
}

function duelBroadcast(msg) {
  if (DU.role !== 'host' || !Array.isArray(DU.conns)) return;
  var data = msg || { t: 'st', s: DU.s };
  DU.conns.forEach(function(c) {
    try { if (c && c.open) c.send(data); } catch(e) {}
  });
}

function duelSend(m) {
  try {
    if (DU.role === 'guest' && DU.conns && DU.conns.open) DU.conns.send(m);
  } catch(e) {}
}

function duelPush() {
  duelBroadcast();
  duelDraw();
}

function duelErr(e) {
  var t = e && e.type;
  if (t === 'peer-unavailable') return duelReset('Không tìm thấy phòng <b>' + esc(DU.code) + '</b>. Kiểm tra lại mã phòng hoặc chủ phòng đã đóng phòng.');
  if (t === 'unavailable-id') return duelHost(true);
  if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') return duelReset('Không kết nối được tới máy chủ ghép phòng. Kiểm tra internet rồi thử lại.');
  if (t === 'browser-incompatible') return duelReset('Trình duyệt này không hỗ trợ WebRTC. Hãy dùng Chrome, Edge, Firefox hoặc Safari bản mới.');
  duelReset('Lỗi kết nối' + (t ? ' (' + esc(t) + ')' : '') + '. Thử tạo lại phòng mới.');
}

function duelHost(retry) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', code = '';
  for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  if (!retry) { DU.busy = 'Đang tạo phòng…'; duelDraw(); }
  duelLib().then(function() {
    try { if (DU.peer) DU.peer.destroy(); } catch(e) {}
    var peer = new window.Peer(PEER_PREFIX + code, {
      debug: 0,
      config: { iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 }
    });
    DU.peer = peer; DU.code = code; DU.role = 'host'; DU.myId = 'host'; DU.conns = [];
    peer.on('open', function() {
      DU.busy = '';
      DU.s = {
        phase: 'wait',
        code: code,
        cfg: Object.assign({}, DU.cfg),
        players: [{ id: 'host', av: duelAv(), name: DU.myName || 'Chủ phòng', score: 0, pick: null, time: null, connected: true, isHost: true }],
        ids: [],
        opts: {},
        i: 0,
        winner: null,
        correct: null,
        hist: []
      };
      if (DU.autoBots) { var nb = DU.autoBots; DU.autoBots = 0; for (var bi = 0; bi < nb; bi++) duelAddBot(); }
      duelDraw();
    });
    peer.on('connection', function(c) {
      c.on('open', function() {
        if (!DU.s) return;
        var activePlayers = DU.s.players.filter(function(p) { return p.connected; });
        if (activePlayers.length >= 8) {
          c.send({ t: 'full' }); setTimeout(function() { c.close(); }, 400); return;
        }
        if (DU.s.phase !== 'wait' && DU.s.phase !== 'ready' && DU.s.phase !== 'end') {
          c.send({ t: 'started' }); setTimeout(function() { c.close(); }, 400); return;
        }
        DU.conns.push(c);
        c.on('data', function(m) { duelHostData(c, m); });
        c.on('close', function() { duelHostDrop(c); });
      });
    });
    peer.on('error', duelErr);
    peer.on('disconnected', function() { try { peer.reconnect(); } catch(e) {} });
  }, function() { DU.busy = ''; duelReset('Không tải được thư viện kết nối. Chế độ đấu cần internet.'); });
}

function duelHostData(c, m) {
  var s = DU.s; if (!s || !m) return;
  if (m.t === 'hello') {
    var pid = c.peer || ('p_' + Math.random().toString(36).slice(2, 8));
    var pName = String(m.name || 'Người chơi ' + (s.players.length)).slice(0, 24);
    var p = s.players.find(function(x) { return x.id === pid; });
    if (!p) {
      p = { id: pid, av: validAv(m.av), name: pName, score: 0, pick: null, time: null, connected: true, isHost: false };
      s.players.push(p);
    } else {
      p.connected = true;
      p.name = pName; p.av = validAv(m.av);
    }
    if (s.players.filter(function(x) { return x.connected; }).length >= 2 && s.phase === 'wait') {
      s.phase = 'ready';
    }
    try { c.send({ t: 'welcome', myId: pid, s: s }); } catch(e) {}
    duelPush();
  } else if (m.t === 'react') {
    duelReact(c.peer, m.k);
  } else if (m.t === 'pow') {
    duelPower(c.peer, m.i, m.k);
  } else if (m.t === 'ans') {
    duelAnswer(c.peer, m.i, m.choice, m.ms);
  } else if (m.t === 'bye') {
    duelHostDrop(c);
  }
}

function duelHostDrop(c) {
  var s = DU.s; if (!s) return;
  var idx = DU.conns.indexOf(c);
  if (idx >= 0) DU.conns.splice(idx, 1);
  var p = s.players.find(function(x) { return x.id === c.peer; });
  if (p) {
    p.connected = false;
    toast(esc(p.name) + ' đã rời phòng');
    if (s.phase === 'wait' || s.phase === 'ready') {
      s.players = s.players.filter(function(x) { return x.connected; });
      if (s.players.length < 2) s.phase = 'wait';
    } else if (s.phase === 'q') {
      duelCheckAllAnswered();
    }
    duelPush();
  }
}

function duelJoin(code) {
  code = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) return toast('Mã phòng gồm 6 ký tự');
  DU.busy = 'Đang vào phòng ' + code + '…'; DU.code = code; duelDraw();
  duelLib().then(function() {
    var peer = new window.Peer({
      debug: 0,
      config: { iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 }
    });
    DU.peer = peer; DU.role = 'guest';
    var to = setTimeout(function() {
      if (!DU.s) duelReset('Không vào được phòng <b>' + esc(code) + '</b> sau 15 giây. Hãy kiểm tra mã phòng và kết nối mạng rồi thử lại.');
    }, 15000);
    peer.on('open', function(id) {
      DU.myId = id;
      var c = peer.connect(PEER_PREFIX + code, { reliable: true });
      DU.conns = c;
      c.on('open', function() {
        c.send({ t: 'hello', name: DU.myName || 'Khách', av: duelAv() });
      });
      c.on('data', function(m) {
        clearTimeout(to);
        duelGuestData(m);
      });
      c.on('close', function() {
        duelLost();
      });
    });
    peer.on('error', function(e) { clearTimeout(to); duelErr(e); });
  }, function() { DU.busy = ''; duelReset('Không tải được thư viện kết nối. Chế độ đấu cần internet.'); });
}

function duelLost() {
  var s = DU.s;
  if (DU.role === 'host') {
    duelPush();
    return;
  }
  duelReset(s && s.phase !== 'end' ? 'Mất kết nối với chủ phòng — trận đấu kết thúc.' : '');
}

function duelGuestData(m) {
  if (!m) return;
  if (m.t === 'full') return duelReset('Phòng <b>' + esc(DU.code) + '</b> đã đầy (tối đa 8 người).');
  if (m.t === 'started') return duelReset('Trận đấu trong phòng <b>' + esc(DU.code) + '</b> đã bắt đầu rồi. Hãy chờ trận kế tiếp!');
  if (m.t === 'bye') return duelReset('Chủ phòng đã đóng phòng đấu.');
  if (m.t === 'welcome') {
    DU.myId = m.myId || DU.myId;
    DU.s = m.s;
    duelDraw();
    return;
  }
  if (m.t === 'st') {
    var old = DU.s; DU.s = m.s;
    if (m.s.phase === 'count' && (!old || old.phase !== 'count')) {
      DU.countStart = Date.now(); DU.recorded = -1; DU.lastI = -1; DU.pending = -1; DU.pendingChoice = null;
    }
    if (m.s.phase === 'reveal' && m.s.xpText && (!old || old.phase !== 'reveal' || old.i !== m.s.i || !old.xpText)) DU.revStart = Date.now();
    if (m.s.phase === 'q' && m.s.i !== DU.lastI) {
      DU.lastI = m.s.i; DU.qStart = Date.now(); DU.pending = -1; DU.pendingChoice = null;
    }
    duelDraw();
  }
}

// Trọng tài (Host)
function duelStart() {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  var cfg = s.cfg, pool = DUEL_SRC[cfg.src].list();
  var list = shuffle(pool).slice(0, cfg.n);
  s.ids = []; s.opts = {}; DU.correct = {};
  list.forEach(function(q) {
    var t = q.bank ? null : T(q, 'en'), base = q.bank ? q.orig : (q.orig || [t.correct].concat(t.wrong));
    s.ids.push(q.id); s.opts[q.id] = KEEP_ANY(base) ? base.slice() : shuffle(base);
    DU.correct[q.id] = q.bank ? q.answers[0] : t.correct;
  });
  s.i = 0; s.hist = []; s.phase = 'count';
  duelClearBots(); DU.endPlayed = false; DU.xp = {}; DU.xpBusy = 0;
  s.players.forEach(function(p) { p.score = 0; p.pick = null; p.time = null; p.gain = 0; p.streak = 0; p.right = 0; p.fast = 0; p.pw = { x2: 1, fifty: 1 }; p.x2 = -1; p.hideI = -1; p.hide = []; s.feed = []; });
  DU.countStart = Date.now(); DU.recorded = -1; DU.lastI = -1; DU.pending = -1; DU.pendingChoice = null;
  duelPush(); duelXpPump();
  clearTimeout(DU.timer); DU.timer = setTimeout(duelNextQ, 3000);
}

function duelNextQ() {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  s.phase = 'q'; s.winner = null; s.correct = null; s.steal = null;
  s.players.forEach(function(p) { p.pick = null; p.time = null; p.gain = 0; });
  s.xpText = null; duelXpPump();
  DU.qStart = Date.now(); DU.lastI = s.i; DU.pending = -1; DU.pendingChoice = null;
  duelPush();
  clearTimeout(DU.timer); DU.timer = setTimeout(duelReveal, s.cfg.sec * 1000 + 400);
  duelBotPlay();
}

function duelAnswer(pid, i, choice, ms) {
  var s = DU.s; if (!s || s.phase !== 'q' || i !== s.i) return;
  var p = s.players.find(function(x) { return x.id === pid; });
  if (!p || p.pick != null) return;
  p.pick = choice; p.time = ms;
  var tot = s.cfg.sec * 1000, isGood = (choice === DU.correct[s.ids[s.i]]);
  ms = Math.max(0, Math.min(+ms || 0, tot)); p.time = ms; p.gain = 0;
  if (isGood) {
    p.streak = (p.streak || 0) + 1; p.right = (p.right || 0) + 1;
    p.gain = 100 + Math.round(100 * (tot - ms) / tot) + (p.streak >= 3 ? 25 : 0);
    if (p.x2 === s.i) p.gain *= 2;
    if (p.hideI === s.i) p.gain = Math.round(p.gain * 0.7);
    p.score += p.gain;
    if (!s.winner) { s.winner = p.id; p.fast = (p.fast || 0) + 1; }
  } else p.streak = 0;
  duelCheckAllAnswered();
}

function duelCheckAllAnswered() {
  var s = DU.s; if (!s || s.phase !== 'q') return;
  var actives = s.players.filter(function(p) { return p.connected; });
  var allDone = actives.every(function(p) { return p.pick != null; });
  if (allDone) {
    duelReveal();
  } else {
    duelPush();
  }
}

function duelReveal() {
  var s = DU.s; if (!s || s.phase !== 'q') return;
  clearTimeout(DU.timer); duelClearBots();
  s.players.forEach(function(p) { if (p.pick == null) { p.streak = 0; p.gain = 0; } });
  var id = s.ids[s.i]; s.phase = 'reveal'; s.correct = DU.correct[id];
  duelBotSteal();
  s.hist.push({
    id: id,
    correct: s.correct,
    winner: s.winner,
    players: s.players.map(function(p) { return { id: p.id, name: p.name, pick: p.pick, time: p.time, score: p.score, gain: p.gain || 0 }; })
  });
  duelPush();
  s.xpText = duelXpFallback(id); duelXpArm();
  duelPush();
}

DU.xp = {}; DU.xpBusy = 0;
function duelXpFallback(id) {
  var q = QMAP[id]; return (q && q.explain) ? q.explain : 'Câu này chưa có lời giải soạn sẵn. Đáp án đúng theo bộ đề môn ' + SJ.name + '.';
}
function duelXpArm() {
  var s = DU.s; if (!s) return;
  s.revMs = 40000; DU.revStart = Date.now();
  clearTimeout(DU.timer); DU.timer = setTimeout(duelAdvance, s.revMs);
}
function duelXpDone(id, text) {
  var X = DU.xp[id] || (DU.xp[id] = {}); if (X.done) return;
  X.done = true; X.text = text; X.busy = false;
  var s = DU.s;
  if (s && s.phase === 'reveal' && s.ids[s.i] === id && s.xpText == null) { s.xpText = text; duelXpArm(); duelPush(); }
  duelXpPump();
}
function duelXpPump() {}

function duelAdvance() {
  var s = DU.s; if (!s || DU.role !== 'host' || s.phase !== 'reveal' || s.xpText == null) return;
  clearTimeout(DU.timer);
  s.i++;
  if (s.i >= s.ids.length) { s.phase = 'end'; duelPush(); }
  else duelNextQ();
}


function duelPick(k) {
  var s = DU.s; if (!s || s.phase !== 'q') return;
  var me = duelMe(); if (!me || me.pick != null || DU.pending === s.i) return;
  var choice = s.opts[s.ids[s.i]][k], ms = Date.now() - DU.qStart;
  if (DU.role === 'host') {
    duelAnswer('host', s.i, choice, ms);
  } else {
    DU.pending = s.i; DU.pendingChoice = choice;
    duelSend({ t: 'ans', i: s.i, choice: choice, ms: ms });
    duelDraw();
  }
}

function duelTick() {
  var s = DU.s; if (!s || cur !== 'duel') return;
  if (s.phase === 'q') {
    var left = Math.max(0, s.cfg.sec - (Date.now() - DU.qStart) / 1000);
    var t = $('#dtm'), b = $('#dtb');
    if (t) t.textContent = Math.ceil(left);
    if (b) {
      b.style.width = (left / s.cfg.sec * 100) + '%';
      b.parentNode.className = 'bar ' + (left < 5 ? 'red' : left < 10 ? 'yellow' : 'green');
    }
  }
  if (s.phase === 'reveal' && DU.revStart && s.xpText) {
    var rl = Math.max(0, (s.revMs || 40000) - (Date.now() - DU.revStart)), rt = $('#drvt'), rb = $('#drvb');
    if (rt) rt.textContent = 'Tự chuyển câu sau ' + Math.ceil(rl / 1000) + ' giây';
    if (rb) rb.style.width = (rl / (s.revMs || 40000) * 100) + '%';
  }
  if (s.phase === 'count') {
    var c = $('#dcn');
    var n3 = Math.max(1, 3 - Math.floor((Date.now() - DU.countStart) / 1000));
    if (c) c.textContent = n3;
    if (DU.lastTick !== n3) { DU.lastTick = n3; duelBeep('tick'); }
  }
}
setInterval(duelTick, 200);

function duelDraw() {
  if (cur !== 'duel' || !content) return;
  var s = DU.s, me = duelMe(), h = '';
  if (DU.role === 'host' && DU.peer && s) DU.peer.meta = { name: DU.myName, n: s.players.filter(function(p) { return p.connected; }).length, phase: s.phase };
  if (DU.busy && !s) {
    content.innerHTML = '<h1>Thi đấu trực tuyến</h1><div class="card empty"><div class="spin"></div><p class="muted">' + esc(DU.busy) + '</p><button class="btn ghost" id="dcancel">Huỷ</button></div>';
    bind('#dcancel', 'click', function() { duelReset(); });
    return;
  }
  if (!s) {
    var c = DU.cfg, myav = duelAv(), st = duelStats(), acc = st.total ? Math.round(st.right / st.total * 100) : 0;
    var profile = '<aside class="card dprofile"><div class="dp-top">' + avHtml({ av: myav }, 64) + '<div style="min-width:0"><div class="small muted">Hồ sơ đấu thủ</div><div class="dp-name">' + esc(duelName() || 'Chưa đặt tên') + '</div></div></div>' +
      '<label class="small muted" for="dname">Tên hiển thị</label><input id="dname" class="sel" style="max-width:none;width:100%;margin-top:6px" maxlength="24" placeholder="vd: Tuấn Anh" value="' + esc(duelName()) + '">' +
      '<div class="small muted" style="margin:14px 0 6px">Màu đại diện</div><div class="av-colors">' + AV_COLORS.map(function(col, k) { return '<button type="button" class="av-c' + (myav.c === k ? ' on' : '') + '" data-avc="' + k + '" style="background:' + col + '" aria-label="Màu ' + (k + 1) + '"></button>'; }).join('') + '</div>' +
      '<div class="small muted" style="margin:14px 0 6px">Nhân vật</div><div class="av-chars">' + AV_CHARS.map(function(x) { return '<button type="button" class="av-ch' + (myav.k === x.id ? ' on' : '') + '" data-avk="' + x.id + '" title="' + esc(x.n) + '">' + avHtml({ av: { c: 0, i: 0, k: x.id } }, 34) + '<span>' + esc(x.n) + '</span></button>'; }).join('') + '</div>' +
      '<div class="row" style="gap:8px;margin-top:10px"><label class="btn sm" style="cursor:pointer">Tải ảnh của bạn<input type="file" id="avfile" accept="image/*" hidden></label>' + (myav.u ? '<button type="button" class="btn sm ghost" id="avnofile">Bỏ ảnh</button>' : '') + '</div>' +
      '<div class="small muted" style="margin:14px 0 6px">Biểu tượng</div><div class="av-icons">' + AV_ICONS.map(function(n, k) { return '<button type="button" class="av-i' + (myav.i === k ? ' on' : '') + '" data-avi="' + k + '" aria-label="Biểu tượng ' + (k + 1) + '">' + ic(n) + '</button>'; }).join('') + '</div>' +
      '<div class="dp-stats"><div><b>' + st.games + '</b><span>Trận</span></div><div><b>' + st.wins + '</b><span>Thắng</span></div><div><b>' + st.best + '</b><span>Điểm cao nhất</span></div><div><b>' + acc + '%</b><span>Chính xác</span></div></div>' +
      (st.hist.length ? '<div class="small muted" style="margin:14px 0 6px">Các trận gần đây</div><div class="dp-hist">' + st.hist.map(function(x) { return '<div><span class="tag ' + (x.rank === 1 ? 'ok' : '') + '">Hạng ' + x.rank + '/' + x.players + '</span><span>' + x.score + ' điểm</span></div>'; }).join('') + '</div>' : '') + '</aside>';
    h = '<div class="duel-hero"><div><div class="dh-k">Chế độ thi đấu</div><h1>Đấu trường kiến thức</h1><p>Thi trắc nghiệm theo thời gian thực cùng bạn bè, từ 2 đến 8 người. Trả lời đúng và nhanh để leo bảng xếp hạng, dùng trợ giúp đúng lúc để lội ngược dòng.</p></div></div>' +
      '<div class="duel-layout">' + profile + '<div class="duel-main">' +
      '<div class="card duel-solo"><div><b>Đấu thử với đối thủ máy</b><div class="small muted">Chưa có bạn cùng ôn? Tạo phòng riêng và thi đấu với 2 đối thủ máy. Chọn mức độ:</div></div><div class="row">' + duelLvSeg() + '<button class="btn primary" id="dsolo" type="button">Bắt đầu ' + ic('play') + '</button></div></div>' +
      (window.AI_SERVER ? '<div class="card"><div class="row between"><h3 style="margin:0">Phòng đang mở</h3><span class="small muted">Tự cập nhật</span></div><div id="drooms" class="rooms-list"><p class="small muted" style="margin:8px 0 0">Đang tải…</p></div></div>' : '') +
      '<div class="grid2"><div class="card"><h3 style="margin-top:0">Tạo phòng mới</h3>' +
        '<div class="small muted" style="margin-bottom:4px">Nguồn câu hỏi</div><div class="seg" style="margin-bottom:12px">' + Object.keys(DUEL_SRC).map(function(k) { return '<button data-dsrc="' + k + '" class="' + (c.src === k ? 'on' : '') + '">' + DUEL_SRC[k].t + '</button>'; }).join('') + '</div>' +
        '<div class="row" style="gap:14px 20px"><div><div class="small muted" style="margin-bottom:4px">Số câu hỏi</div><div class="seg">' + [10, 15, 20, 30].map(function(n) { return '<button data-dn="' + n + '" class="' + (c.n === n ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div></div>' +
        '<div><div class="small muted" style="margin-bottom:4px">Thời gian mỗi câu</div><div class="seg">' + [15, 20, 30].map(function(n) { return '<button data-dsec="' + n + '" class="' + (c.sec === n ? 'on' : '') + '">' + n + ' giây</button>'; }).join('') + '</div></div></div>' +
        '<button class="btn primary big" id="dhost" style="width:100%;margin-top:16px">Tạo phòng thi đấu ' + ic('arrow') + '</button></div>' +
      '<div class="card"><h3 style="margin-top:0">Vào phòng bằng mã</h3><p class="small muted" style="margin-top:0">Nhập mã 6 ký tự do chủ phòng gửi cho bạn.</p>' +
        '<input id="dcode" class="sel dcode-in" maxlength="6" placeholder="VD: K7P2QX" autocomplete="off" spellcheck="false">' +
        '<button class="btn primary big" id="djoin" style="width:100%;margin-top:12px">Vào phòng ' + ic('arrow') + '</button></div></div>' +
      '<div class="card dx-rules"><b>Luật chơi</b><div class="rules-grid"><div><b>100 + tốc độ</b><span>Mỗi câu đúng được 100 điểm, cộng tối đa 100 điểm tốc độ.</span></div><div><b>Chuỗi đúng</b><span>Từ câu đúng thứ 3 liên tiếp, thưởng thêm 25 điểm mỗi câu.</span></div><div><b>Nhân đôi</b><span>1 lần mỗi trận: điểm câu đó nhân đôi nếu bạn trả lời đúng.</span></div><div><b>Loại 2 đáp án</b><span>1 lần mỗi trận: bỏ 2 đáp án sai, điểm câu đó giảm 30%.</span></div></div></div>' +
      '</div></div>';
    content.innerHTML = h;
    var nm = $('#dname'); nm.oninput = function() { duelSetName(nm.value.trim()); var dn = $('.dp-name'); if (dn) dn.textContent = nm.value.trim() || 'Chưa đặt tên'; };
    bind('[data-avc]', 'click', function(e, b) { var v = duelAv(); v = { c: +b.dataset.avc, i: v.i }; duelSetAv(v); duelDraw(); });
    bind('[data-avi]', 'click', function(e, b) { var v = duelAv(); v = { c: v.c, i: +b.dataset.avi }; duelSetAv(v); duelDraw(); });
    bind('[data-avk]', 'click', function(e, b) { duelSetAv({ c: 0, i: 0, k: b.dataset.avk }); duelDraw(); });
    bind('#avnofile', 'click', function() { duelSetAv({ c: 0, i: 0 }); duelDraw(); });
    var af = $('#avfile'); if (af) af.onchange = function() {
      var f = af.files && af.files[0]; if (!f) return; var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function() {
        var S = 72, cv = document.createElement('canvas'); cv.width = cv.height = S; var cx = cv.getContext('2d'), m = Math.min(img.width, img.height);
        cx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S); URL.revokeObjectURL(url);
        var d = cv.toDataURL('image/jpeg', .72); if (!avUrlOk(d)) return toast('Không xử lý được ảnh này'); duelSetAv({ c: 0, i: 0, u: d }); duelDraw();
      };
      img.onerror = function() { URL.revokeObjectURL(url); toast('Không đọc được file ảnh'); }; img.src = url;
    };
    bind('[data-dsrc]', 'click', function(e, b) { DU.cfg.src = b.dataset.dsrc; duelDraw(); });
    bind('[data-dn]', 'click', function(e, b) { DU.cfg.n = +b.dataset.dn; duelDraw(); });
    bind('[data-dsec]', 'click', function(e, b) { DU.cfg.sec = +b.dataset.dsec; duelDraw(); });
    function needName() {
      if (!nm.value.trim()) { nm.focus(); toast('Vui lòng nhập tên của bạn'); return true; }
      DU.myName = nm.value.trim(); duelSetName(DU.myName); return false;
    }
    bind('#dhost', 'click', function() { if (!needName()) duelHost(); });
    bind('[data-blv]', 'click', function(e, b) { DU.botLv = b.dataset.blv; duelDraw(); });
    bind('#dsolo', 'click', function() { if (!needName()) { DU.autoBots = 2; duelHost(); } });
    duelRoomsStart();
    var ci = $('#dcode'); ci.oninput = function() { ci.value = ci.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
    ci.onkeydown = function(e) { if (e.key === 'Enter') $('#djoin').click(); };
    bind('#djoin', 'click', function() { if (!needName()) duelJoin(ci.value); });
    return;
  }

  var leave = '<span class="row" style="gap:6px"><button class="btn sm ghost" id="dsnd" type="button">' + (duelMuted() ? 'Bật âm thanh' : 'Tắt âm thanh') + '</button><button class="btn sm ghost" id="dleave">Rời phòng</button></span>';
  var activePlayers = s.players.filter(function(p) { return p.connected; });

  // 1. LOBBY (WAIT / READY)
  if (s.phase === 'wait' || s.phase === 'ready') {
    var isHost = (DU.role === 'host'), cfg = s.cfg;
    var canStart = isHost && activePlayers.length >= 2;
    h = '<div class="row between"><h1 style="margin:0">Phòng thi đấu</h1>' + leave + '</div>' +
      '<div class="card center" style="padding:18px 14px"><div class="small muted">Mã phòng thi đấu (gửi mã này cho bạn bè)</div><div class="dcode">' + esc(DU.code) + '</div>' +
      (isHost ? '<button class="btn sm primary" id="dcopy">Chép mã phòng</button>' : '<span class="tag ok">Đã kết nối</span>') + '</div>' +
      '<div class="card"><div class="row between"><h3 style="margin:0">Danh sách người chơi (' + activePlayers.length + '/8)</h3><span class="small muted">' + (activePlayers.length >= 2 ? 'Đã đủ điều kiện bắt đầu' : 'Cần ít nhất 2 người') + '</span></div>' +
      '<div class="room-players-list">' + activePlayers.map(function(p) {
        var isSelf = (p.id === duelMyId());
        return '<div class="player-pill' + (isSelf ? ' me' : '') + '">' + avHtml(p, 36) + '<div style="flex:1;min-width:0"><div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(p.name) + (isSelf ? ' <small class="muted">(Bạn)</small>' : '') + '</div><span class="small muted">' + (p.isHost ? 'Chủ phòng' : p.isBot ? 'Đối thủ máy · ' + (BOT_LV[p.lv] || BOT_LV.mid).t : 'Người chơi') + '</span></div>' + (isHost && p.isBot ? '<button class="iconbtn sm" type="button" data-rmbot="' + p.id + '" aria-label="Bỏ đối thủ này">' + ic('close') + '</button>' : '<span class="tag ok">Sẵn sàng</span>') + '</div>';
      }).join('') + '</div></div>' +
      '<div class="card"><div class="small muted">Cấu hình trận đấu</div><div style="margin-top:4px">' + DUEL_SRC[cfg.src].t + ' · <b>' + cfg.n + ' câu</b> · <b>' + cfg.sec + ' giây</b> mỗi câu.</div>' +
      (isHost ? '<div class="row" style="margin-top:12px;gap:10px 16px"><div class="seg">' + Object.keys(DUEL_SRC).map(function(k) { return '<button data-dsrc="' + k + '" class="' + (cfg.src === k ? 'on' : '') + '">' + DUEL_SRC[k].t + '</button>'; }).join('') + '</div>' +
        '<div class="seg">' + [10, 15, 20, 30].map(function(n) { return '<button data-dn="' + n + '" class="' + (cfg.n === n ? 'on' : '') + '">' + n + ' câu</button>'; }).join('') + '</div><div class="seg">' + [15, 20, 30].map(function(n) { return '<button data-dsec="' + n + '" class="' + (cfg.sec === n ? 'on' : '') + '">' + n + 's</button>'; }).join('') + '</div></div>' : '') + '</div>' +
      (isHost ? '<div class="card row between"><div><b>Đối thủ máy</b><div class="small muted">Thêm máy để thi đấu khi chưa đủ người.</div></div><div class="row">' + duelLvSeg() + '<button class="btn sm" id="dbot" type="button">Thêm máy</button></div></div>' : '') +
      (isHost && window.AI_SERVER ? '<div class="card row between"><div><b>Mời người đang online</b><div class="small muted">Gửi lời mời vào phòng cho người đang mở web (họ phải được cấp môn này).</div></div><button class="btn sm" id="dinv" type="button">Mời người online</button></div>' : '') +
      (isHost ? '<button class="btn primary big" id="dstart" style="width:100%"' + (canStart ? '' : ' disabled') + '>' + (canStart ? 'Bắt đầu trận đấu (' + activePlayers.length + ' người) '+ic('arrow')+'' : 'Đang chờ người chơi khác vào phòng (tối thiểu 2)...') + '</button>' : '<div class="card center" style="padding:16px"><span class="spin sm"></span> Đang chờ chủ phòng bắt đầu trận đấu…</div>');
    content.innerHTML = h;
    if (isHost) {
      bind('#dcopy', 'click', function() { copyText(DU.code); toast('Đã chép mã ' + DU.code); });
      bind('[data-dsrc]', 'click', function(e, b) { s.cfg.src = DU.cfg.src = b.dataset.dsrc; duelPush(); });
      bind('[data-dn]', 'click', function(e, b) { s.cfg.n = DU.cfg.n = +b.dataset.dn; duelPush(); });
      bind('[data-dsec]', 'click', function(e, b) { s.cfg.sec = DU.cfg.sec = +b.dataset.dsec; duelPush(); });
      bind('#dstart', 'click', duelStart);
      bind('[data-blv]', 'click', function(e, b) { DU.botLv = b.dataset.blv; duelDraw(); });
      bind('#dbot', 'click', duelBotPicker);
      bind('#dinv', 'click', duelInvitePicker);
      bind('[data-rmbot]', 'click', function(e, b) { duelRemoveBot(b.dataset.rmbot); });
    }
  }
  // 2. COUNTDOWN
  else if (s.phase === 'count') {
    h = '<div class="duel-grid">' + renderScoreboard(s) + '</div>' +
      '<div class="card center" style="padding:40px 16px"><div class="small muted">Trận đấu bắt đầu sau</div><div class="dcount" id="dcn">3</div><div class="muted">' + s.ids.length + ' câu · ' + s.cfg.sec + ' giây mỗi câu · ' + activePlayers.length + ' người tranh tài</div></div>';
    content.innerHTML = h;
    duelTick();
  }
  // 3. QUESTION / REVEAL
  else if (s.phase === 'q' || s.phase === 'reveal') {
    var id = s.ids[s.i], q = QMAP[id], t = q.bank ? q : T(q, 'en'), opts = s.opts[id], rv = (s.phase === 'reveal');
    var myPid = duelMyId();
    var myP = s.players.find(function(p) { return p.id === myPid; });
    var myPick = (myP && myP.pick != null) ? myP.pick : (DU.pending === s.i ? DU.pendingChoice : null);

    if (rv && DU.recorded !== s.i) {
      DU.recorded = s.i;
      if (myPick != null) record(q, myPick === s.correct);
      duelBeep(myPick === s.correct ? 'ok' : 'bad');
    }

    var ban = '';
    if (rv) {
      var winnerP = s.players.find(function(p) { return p.id === s.winner; });
      if (winnerP) {
        var isMeWin = (winnerP.id === myPid);
        ban = '<div class="dbanner ' + (isMeWin ? 'ok' : 'info') + '"><b>' + esc(winnerP.name) + '</b> trả lời đúng nhanh nhất (' + (winnerP.time / 1000).toFixed(1) + ' giây).</div>';
      } else {
        ban = '<div class="dbanner info">Không ai trả lời đúng câu này.</div>';
      }
    } else if (myPick != null) {
      ban = '<div class="dbanner info">Đã ghi nhận câu trả lời của bạn! Đang chờ những người chơi khác…</div>';
    }

    DU.endPlayed = false;
    var pwHtml = '', reactHtml = '';
    if (!rv && myP) {
      var pw = myP.pw || { x2: 0, fifty: 0 };
      pwHtml = '<div class="pw-bar"><span class="small muted">Trợ giúp</span>' + ['x2', 'fifty'].map(function(k) {
        var left = pw[k] || 0, on = (k === 'x2' && myP.x2 === s.i) || (k === 'fifty' && myP.hideI === s.i);
        return '<button type="button" class="pw-btn' + (on ? ' on' : '') + '" data-pw="' + k + '" title="' + POWERS[k].d + '"' + ((myPick != null || on || left < 1) ? ' disabled' : '') + '>' + POWERS[k].t + ' <b>' + (on ? 'đang dùng' : left) + '</b></button>';
      }).join('') + '</div>';
    }
    reactHtml = '<div class="react-bar">' + REACTS.map(function(t, k) { return '<button type="button" class="chip" data-rx="' + k + '">' + t + '</button>'; }).join('') + '<div class="feed">' + (s.feed || []).slice(-3).map(function(f) { return '<span><b>' + esc(f.n) + '</b>: ' + REACTS[f.k] + '</span>'; }).join('') + '</div></div>';
    var dxHtml = '';
    if (rv) {
      var goodTxt = s.correct, isHostNow = (DU.role === 'host'), ready = !!s.xpText;
      dxHtml = '<div class="card dx dx-big"><div class="dx-h"><div class="dx-t">' + ic('spark') + '<b>Giải thích đáp án</b></div><span class="small muted" id="drvt">' + (ready ? '' : 'Đang soạn…') + '</span></div>' +
        '<div class="dx-ans">Đáp án đúng<b>' + esc(L[opts.indexOf(goodTxt)] + '. ' + goodTxt) + '</b></div>' +
        '<div class="dx-body">' + (ready ? mdLite(s.xpText) : '<span class="typing"><i></i><i></i><i></i></span> Bố đang soạn lời giải cho con, đợi chút…') + '</div>' +
        (q.tip ? '<div class="ktip">' + ic('bulb') + '<span><b>Mẹo nhớ:</b> ' + esc(q.tip) + '</span></div>' : '') +
        (q.ref ? '<p class="small" style="margin:8px 0 0"><a href="' + refLink(q.ref) + '">Xem lý thuyết §' + q.ref + '</a></p>' : '') +
        '<div style="margin-top:10px"><button type="button" class="btn sm" id="dxask">' + ic('chat') + ' Hỏi Bố Tuấn Anh giải thích thêm</button></div>' +
        '<div class="bar" style="margin-top:14px"><i id="drvb" style="width:' + (ready ? '100' : '0') + '%"></i></div>' +
        '<div class="row between" style="margin-top:10px"><span class="small muted">' + (ready ? (isHostNow ? 'Đọc xong thì chuyển câu, hoặc đợi tự chuyển.' : 'Chủ phòng sẽ chuyển câu tiếp theo.') : 'Chưa chuyển câu cho tới khi lời giải sẵn sàng.') + '</span>' +
        (isHostNow ? '<button class="btn primary" id="dnext" type="button"' + (ready ? '' : ' disabled') + '>' + (s.i + 1 >= s.ids.length ? 'Xem kết quả' : 'Câu tiếp theo') + ' ' + ic('arrow') + '</button>' : '') + '</div></div>';
    }
    if (rv) {
      var mine = myP ? (myP.gain || 0) : 0;
      ban += '<div class="dbanner ' + (mine ? 'ok' : 'bad') + '">' + (mine ? 'Bạn ghi <b>+' + mine + '</b> điểm' + (myP.streak >= 3 ? ' · chuỗi đúng ' + myP.streak + ' câu' : '') : (myP && myP.pick != null ? 'Chưa đúng. Đáp án đúng đã được đánh dấu.' : 'Bạn chưa kịp trả lời câu này.')) + '</div>';
    }
    h = '<div class="duel-grid">' + renderScoreboard(s) + '</div>' +
      '<div class="row between" style="gap:10px;margin:4px 0 8px"><span class="small muted">Câu ' + (s.i + 1) + '/' + s.ids.length + '</span><div class="bar green" style="flex:1"><i id="dtb" style="width:' + (rv ? 0 : 100) + '%"></i></div><b id="dtm" style="min-width:2ch;text-align:right">' + (rv ? 0 : s.cfg.sec) + '</b></div>' +
      '<div class="card"><div class="row small muted">' + (q.bank ? '<span class="tag">' + esc(q.topic) + '</span>' : dot(q.module) + MOD[q.module].short) + '</div><div class="q">' + qhtml(t.q) + '</div>' + ban + pwHtml + '<div class="opts">' + opts.map(function(o, k) {
        var cls = '';
        if (rv) {
          cls = (o === s.correct) ? 'ok' : (o === myPick ? 'bad' : 'dim');
        } else if (myPick != null) {
          cls = (o === myPick) ? 'sel' : 'dim';
        }
        var whoPicks = [];
        if (rv) {
          s.players.forEach(function(p) {
            if (p.connected && p.pick === o) whoPicks.push(p.id === myPid ? 'Bạn' : p.name);
          });
        } else if (myPick === o) {
          whoPicks.push('Bạn');
        }
        var hid = (!rv && myP && myP.hideI === s.i && myP.hide && myP.hide.indexOf(o) >= 0);
        var whoHtml = whoPicks.length ? '<span class="tag who" style="margin-left:auto">' + esc(whoPicks.join(', ')) + '</span>' : '';
        return '<button class="opt ' + (hid ? 'gone' : cls) + '" data-k="' + k + '"' + (rv || myPick != null || hid ? ' disabled' : '') + '><b>' + L[k] + '</b><span>' + esc(o) + '</span>' + whoHtml + '</button>';
      }).join('') + '</div>' +
      '</div>' + dxHtml +
      reactHtml + '<div class="row between"><span class="small muted hide-m">Phím tắt: <kbd>1</kbd>–<kbd>' + opts.length + '</kbd> hoặc <kbd>A</kbd>–<kbd>' + L[opts.length - 1] + '</kbd></span>' + leave + '</div>';
    // Người khác chọn đáp án/thả cảm xúc chỉ làm thay đổi bảng điểm và dòng cảm xúc: cập nhật riêng hai chỗ đó,
    // KHÔNG dựng lại cả màn hình câu hỏi (dựng lại làm màn hình nháy như tải lại).
    var qfp = [s.phase, s.i, myPick, myP && myP.hideI, myP && myP.x2, myP && myP.pw && myP.pw.x2, myP && myP.pw && myP.pw.fifty, !!s.xpText, rv ? s.winner : '', rv && myP ? myP.gain : ''].join('|');
    var gridEl = content.querySelector('.duel-grid');
    if (DU.qfp === qfp && gridEl && content.querySelector('.opts') && content.querySelector('.react-bar')) {
      var sbHtml = renderScoreboard(s);
      if (gridEl.__sb !== sbHtml) { gridEl.innerHTML = sbHtml; gridEl.__sb = sbHtml; }
      var feedEl = content.querySelector('.react-bar .feed');
      if (feedEl) { var fdHtml = (s.feed || []).slice(-3).map(function(f) { return '<span><b>' + esc(f.n) + '</b>: ' + REACTS[f.k] + '</span>'; }).join(''); if (feedEl.__fd !== fdHtml) { feedEl.innerHTML = fdHtml; feedEl.__fd = fdHtml; } }
      duelTick();
      return;
    }
    DU.qfp = qfp;
    content.innerHTML = h;
    var gridNew = content.querySelector('.duel-grid'); if (gridNew) gridNew.__sb = renderScoreboard(s);
    var feedNew = content.querySelector('.react-bar .feed'); if (feedNew) feedNew.__fd = (s.feed || []).slice(-3).map(function(f) { return '<span><b>' + esc(f.n) + '</b>: ' + REACTS[f.k] + '</span>'; }).join('');
    bind('.opt', 'click', function(e, b) { duelPick(+b.dataset.k); });
    bind('[data-pw]', 'click', function(e, b) { duelUsePower(b.dataset.pw); });
    bind('[data-rx]', 'click', function(e, b) { duelUseReact(+b.dataset.rx); });
    if (rv) {
      bind('#dnext', 'click', duelAdvance);
      bind('#dxask', 'click', function() { dockOpen('Câu hỏi: ' + t.q + '\nĐáp án đúng: ' + s.correct, ''); });
    }
    duelTick();
  }
  // 4. END GAME / LEADERBOARD PODIUM
  else if (s.phase === 'end') {
    var ranked = s.players.slice().filter(function(p) { return p.connected; }).sort(function(a, b) { return b.score - a.score; });
    var winner = ranked[0];
    var isHost = (DU.role === 'host');
    var isMeWinner = (winner && winner.id === duelMyId());
    if (!DU.endPlayed) {
      DU.endPlayed = true; duelBeep('end');
      var meR = ranked.filter(function(p) { return p.id === duelMyId(); })[0];
      if (meR) track('duel_finish',{rank:ranked.indexOf(meR)+1,players:ranked.length,score:meR.score,right:meR.right||0,total:s.ids.length});
      if (meR) duelStatsAdd({ rank: ranked.indexOf(meR) + 1, players: ranked.length, score: meR.score, right: meR.right || 0, total: s.ids.length, t: Date.now() });
    }
    var meX = ranked.filter(function(p) { return p.id === duelMyId(); })[0], meRank = meX ? ranked.indexOf(meX) + 1 : 0;
    var nQ = s.hist.length || 1, runBest = {};
    ranked.forEach(function(p) { var run = 0, best = 0; s.hist.forEach(function(x) { var e = x.players.filter(function(y) { return y.id === p.id; })[0]; if (e && e.gain > 0) { run++; if (run > best) best = run; } else run = 0; }); runBest[p.id] = best; });
    function pstat(p) { var t = 0, c = 0; s.hist.forEach(function(x) { var e = x.players.filter(function(y) { return y.id === p.id; })[0]; if (e && e.pick != null && e.time != null) { t += e.time; c++; } }); return { avg: c ? t / c / 1000 : 0, acc: Math.round((p.right || 0) / nQ * 100) }; }
    function best(fn) { return ranked.slice().sort(function(x, y) { return fn(y) - fn(x); })[0]; }
    var bAcc = best(function(p) { return p.right || 0; }), bFast = best(function(p) { return p.fast || 0; }), bRun = best(function(p) { return runBest[p.id] || 0; });
    var awardsHtml = '';
    if (bAcc && (bAcc.right || 0) > 0) awardsHtml += '<div class="award"><div class="aw-t">Chính xác nhất</div><b>' + esc(bAcc.name) + '</b><span>' + bAcc.right + '/' + nQ + ' câu đúng</span></div>';
    if (bFast && (bFast.fast || 0) > 0) awardsHtml += '<div class="award"><div class="aw-t">Tay nhanh nhất</div><b>' + esc(bFast.name) + '</b><span>nhanh nhất ' + bFast.fast + ' câu</span></div>';
    if (bRun && (runBest[bRun.id] || 0) >= 2) awardsHtml += '<div class="award"><div class="aw-t">Chuỗi dài nhất</div><b>' + esc(bRun.name) + '</b><span>đúng liền ' + runBest[bRun.id] + ' câu</span></div>';

    h = '<div class="card hero"><div><div class="small" style="opacity:.85">' + DUEL_SRC[s.cfg.src].t + ' · ' + s.ids.length + ' câu · ' + ranked.length + ' người chơi</div>' +
      '<h1 style="margin:.2em 0">' + (isMeWinner ? 'Bạn đứng nhất!' : '' + esc(winner ? winner.name : '') + ' thắng cuộc') + '</h1>' +
      '<p>Điểm cao nhất: <b>' + (winner ? winner.score : 0) + '</b>' + (meX ? ' · Bạn hạng <b>' + meRank + '/' + ranked.length + '</b> với <b>' + meX.score + '</b> điểm, đúng <b>' + (meX.right || 0) + '/' + s.ids.length + '</b> câu' : '') + '</p>' +
      '<div class="row">' + (isHost ? '<button class="btn primary" id="dagain">Đấu lại cùng phòng</button>' : '<span class="small" style="opacity:.9">Chờ chủ phòng chọn đấu lại…</span>') + '<button class="btn ghost" id="dshare" type="button">Chép kết quả</button><button class="btn ghost" id="dleave">Rời phòng</button></div></div>' +
      '</div>' +
      '<div class="card"><h3 style="margin:0 0 12px">'+ic('trophy')+' Bảng xếp hạng chung cuộc</h3>' +
      '<div class="podium">' +
        (ranked[1] ? '<div class="podium-item second">' + avHtml(ranked[1], 40) + '<div class="podium-rank">2</div><div class="podium-name">' + esc(ranked[1].name) + '</div><div class="podium-score">' + ranked[1].score + 'đ</div></div>' : '') +
        (ranked[0] ? '<div class="podium-item first">' + avHtml(ranked[0], 48) + '<div class="podium-rank">1</div><div class="podium-name">' + esc(ranked[0].name) + '</div><div class="podium-score">' + ranked[0].score + 'đ</div></div>' : '') +
        (ranked[2] ? '<div class="podium-item third">' + avHtml(ranked[2], 40) + '<div class="podium-rank">3</div><div class="podium-name">' + esc(ranked[2].name) + '</div><div class="podium-score">' + ranked[2].score + 'đ</div></div>' : '') +
      '</div>' +
      '<div class="awards">' + awardsHtml + '</div><div class="tbl-wrap"><table><thead><tr><th>Hạng</th><th>Người chơi</th><th>Điểm</th><th>Đúng</th><th>Chính xác</th><th>Tốc độ TB</th></tr></thead><tbody>' +
      ranked.map(function(p, rk) {
        var st = pstat(p), self = (p.id === duelMyId());
        return '<tr' + (self ? ' class="me"' : '') + '><td>' + (rk + 1) + '</td><td>' + esc(p.name) + (self ? ' (Bạn)' : '') + '</td><td><b>' + p.score + '</b></td><td>' + (p.right || 0) + '/' + nQ + '</td><td>' + st.acc + '%</td><td>' + (st.avg ? st.avg.toFixed(1) + ' giây' : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<h2>Xem lại từng câu</h2>' + s.hist.map(function(x, k) {
        var q = QMAP[x.id], tq = q.bank ? q : T(q, 'en');
        var winP = s.players.find(function(p) { return p.id === x.winner; });
        return '<div class="card" style="padding:14px 18px"><div class="row small muted"><b>Câu ' + (k + 1) + '</b>' + (winP ? '<span class="tag ok">' + esc(winP.name) + ' nhanh nhất</span>' : '<span class="tag">Không ai ghi điểm</span>') + '</div>' +
          '<div style="font-weight:600;margin-top:6px">' + qhtml(tq.q) + '</div>' +
          '<div class="small" style="margin-top:6px">Đáp án đúng: <b style="color:var(--ok)">' + esc(x.correct) + '</b></div>' +
          (q.explain ? '<div class="small muted" style="margin-top:4px">' + esc(q.explain) + '</div>' : '') + '</div>';
      }).join('');
    content.innerHTML = h;
    bind('#dagain', 'click', duelStart);
    bind('#dshare', 'click', function() {
      var t = 'Kết quả thi đấu ' + SJ.name + ': ' + ranked.map(function(p, k) { return (k + 1) + '. ' + p.name + ' (' + p.score + ' điểm)'; }).join(' | ');
      copyText(t); toast('Đã chép kết quả');
    });
  }

  bind('#dsnd', 'click', function() { try { localStorage.setItem(KEY + '_snd', duelMuted() ? '1' : '0'); } catch (e) {} duelDraw(); });
  bind('#dleave', 'click', function() {
    var go2 = function() { duelSend({ t: 'bye' }); duelReset(); };
    if (duelActive()) confirmBox('Rời phòng giữa trận? Bạn sẽ bị mất kết nối khỏi trận đấu này.', 'Rời phòng', true).then(function(y) { if (y) go2(); });
    else go2();
  });

  function renderScoreboard(state) {
    var myPid = duelMyId();
    var rank = state.players.filter(function(p) { return p.connected; }).sort(function(x, y) { return y.score - x.score; });
    var top = rank.length ? Math.max(1, rank[0].score) : 1;
    return rank.map(function(p, k) {
      var isMe = (p.id === myPid), st = '';
      if (state.phase === 'q') st = (p.pick != null || (isMe && DU.pending === state.i)) ? '<span class="tag ok">đã chọn</span>' : '<span class="tag">đang nghĩ…</span>';
      else if (state.phase === 'reveal') {
        if (p.gain) st = '<span class="tag ok">+' + p.gain + (state.winner === p.id ? ' · nhanh nhất' : '') + '</span>';
        else if (p.pick != null) st = '<span class="tag bad">sai</span>'; else st = '<span class="tag">hết giờ</span>';
      }
      if (state.phase === 'reveal' && state.steal) {
        if (state.steal.by === p.id) st += ' <span class="tag warn">cướp +' + state.steal.amt + '</span>';
        else if (state.steal.from === p.id) st += ' <span class="tag bad">bị cướp −' + state.steal.amt + '</span>';
      }
      var streak = (p.streak >= 2 && state.phase !== 'count') ? '<span class="tag warn">chuỗi ' + p.streak + '</span> ' : '';
      return '<div class="pl-card' + (isMe ? ' me' : '') + '"><span class="pl-rank">' + (k + 1) + '</span>' + avHtml(p, 32) + '<div class="nm"><b>' + esc(p.name) + '</b>' + (isMe ? ' <small class="muted">(Bạn)</small>' : '') + '<div class="pl-st">' + streak + st + '</div></div><div class="pl-sc"><b class="sc">' + p.score + '</b><div class="pl-bar"><i style="width:' + Math.round(p.score / top * 100) + '%"></i></div></div></div>';
    }).join('');
  }
}
routes.duel=function(_,qs){
  content.innerHTML='';duelDraw();window.scrollTo(0,0);
  if(qs&&qs.join&&window.AI_SERVER){var jc=String(qs.join).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);history.replaceState(null,'',location.pathname+location.search+'#/duel');
    var ci=$('#dcode');if(ci&&jc.length===6&&!DU.s&&!DU.busy){ci.value=jc;if(duelName()){DU.myName=duelName();duelJoin(jc);}else{toast('Nhập tên hiển thị rồi bấm Vào phòng');var nmI=$('#dname');if(nmI)nmI.focus();}}}
  setKeys(function(e){var s=DU.s;if(s&&s.phase==='reveal'&&DU.role==='host'&&(e.key==='Enter'||e.key==='ArrowRight')){duelAdvance();return true;}if(!s||s.phase!=='q')return;var n=keyIdx(e,s.opts[s.ids[s.i]].length);if(n>=0){duelPick(n);return true;}});
};

// ---------- settings ----------
function exportData(){var blob=new Blob([JSON.stringify(P)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=SJ.id+'-tien-do-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);}
function openSettings(){
  modal('<h3 style="margin-top:0">Cài đặt</h3><label class="small muted" style="display:block">Ngày thi</label><input type="date" id="sd" value="'+esc(P.settings.examDate)+'" style="width:100%;margin:4px 0 14px">'+
   '<label class="small muted" style="display:block;margin-bottom:4px">Chế độ sáng/tối</label><div class="seg" id="th">'+[['auto','Tự động'],['light','Sáng'],['dark','Tối']].map(function(t){return '<button data-v="'+t[0]+'" class="'+(P.settings.theme===t[0]?'on':'')+'">'+t[1]+'</button>';}).join('')+'</div>'+
   '<h3>Tuỳ chỉnh giao diện</h3><div id="lookbox"></div><h3>Sao lưu tiến độ</h3><p class="small muted" style="margin-top:0">'+(window.AI_SERVER?'Tiến độ tự đồng bộ theo tài khoản. Bạn vẫn có thể xuất file để lưu riêng.':'Tiến độ lưu trong trình duyệt của máy này. Muốn chuyển máy: xuất file ở đây, nhập ở máy kia.')+'</p><div class="row"><button class="btn sm" id="ex">Xuất file</button><label class="btn sm">Nhập file<input type="file" id="im" accept=".json" hidden></label><button class="btn sm danger" id="rs">Xóa dữ liệu</button></div>',[{t:'Xong',v:null,primary:true}]);
  var m=$('#modal');lookPanel(m);
  $('#sd',m).onchange=function(){P.settings.examDate=this.value;save();go();};
  $$('#th button',m).forEach(function(b){b.onclick=function(){P.settings.theme=b.dataset.v;save();applyTheme();$$('#th button',m).forEach(function(x){x.classList.toggle('on',x===b);});};});
  $('#ex',m).onclick=exportData;
  $('#im',m).onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var d;try{d=JSON.parse(r.result);}catch(e){d=null;}m.__close(null);
    if(!d||d.version!==2){modal('<p style="margin-top:0">File không đúng định dạng tiến độ của app này.</p>');return;}
    confirmBox('Thay toàn bộ tiến độ trên máy này bằng dữ liệu trong file?','Nhập').then(function(y){if(y){P=hydrate(d);save();applyTheme();toast('Đã nhập tiến độ');go();}});};r.readAsText(f);};
  $('#rs',m).onclick=function(){m.__close(null);confirmBox('Xóa <b>toàn bộ</b> tiến độ trên máy này? Không thể hoàn tác.','Xóa hết',true).then(function(y){if(y){P=blank();save();applyTheme();toast('Đã xóa dữ liệu');go();}});};
}
// ---------- tuỳ chỉnh giao diện (dùng chung mọi môn, lưu trên trình duyệt) ----------
var LOOK_ACCENTS=[['indigo','Chàm','#2f4bd1','#8499ff'],['teal','Ngọc','#0f8a6c','#4fd1a5'],['violet','Tím','#6d3fd1','#a78bfa'],['rose','Hồng','#c2255c','#f783ac'],['amber','Cam','#c2410c','#ffa94d'],['ocean','Biển','#0b7285','#66d9e8'],['slate','Than','#334155','#cbd5e1']];
function lookGet(){var d={accent:'rose',size:'sm',density:'comfy',radius:'round',dim:80,glass:76};try{return Object.assign(d,JSON.parse(localStorage.getItem('ui_look'))||{});}catch(e){return d;}}
function lookSet(v){try{localStorage.setItem('ui_look',JSON.stringify(v));}catch(e){}applyLook();}
var DEFAULT_BG=window.AI_SERVER?'/bg-default.jpg':'';
function lookBg(){var v='';try{v=localStorage.getItem('ui_bg');}catch(e){}if(v==='none')return '';return v||DEFAULT_BG;}
function applyLook(){
  var L=lookGet(),acc=LOOK_ACCENTS.filter(function(x){return x[0]===L.accent;})[0]||LOOK_ACCENTS[0],bg=lookBg(),st=document.getElementById('look-css');
  if(!st){st=document.createElement('style');st.id='look-css';document.head.appendChild(st);}
  var css=':root{--primary:'+acc[2]+';--primary-2:color-mix(in srgb,'+acc[2]+' 82%,#fff);--primary-soft:color-mix(in srgb,'+acc[2]+' 11%,var(--panel))}'+
    ':root[data-theme=dark]{--primary:'+acc[3]+';--primary-2:color-mix(in srgb,'+acc[3]+' 80%,#fff);--primary-ink:#0b1020;--primary-soft:color-mix(in srgb,'+acc[3]+' 16%,var(--panel))}'+
    'html{font-size:'+({sm:'15px',md:'16px',lg:'17.5px'}[L.size]||'16px')+'}';
  if(L.radius==='sharp')css+=':root{--r:8px}.card,.opt,.btn,.seg,.keybox,.sec,.stat{border-radius:8px!important}';
  if(L.density==='compact')css+='.card{padding:14px 16px}.opt{padding:10px 14px}#content{padding-top:16px}.prose{line-height:1.65}';
  if(bg){
    css+='body{background:transparent}body:before{content:"";position:fixed;inset:0;z-index:-2;background:url('+JSON.stringify(bg)+') center/cover no-repeat}'+
      'body:after{content:"";position:fixed;inset:0;z-index:-1;background:var(--bg);opacity:'+(L.dim/100)+'}'+
      '.card:not(.hero),.stat,.sec,.keycard,.opt,.dprofile,#nav,#bottom,.dock,.pl-card,.player-pill,.award{background:color-mix(in srgb,var(--panel) '+L.glass+'%,transparent)!important;backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2)}';
  }
  st.textContent=css;
}
function readBgFile(f){
  return new Promise(function(res,rej){
    if(!f||!/^image\//.test(f.type))return rej(new Error('Hãy chọn một file ảnh (JPG, PNG, WebP).'));
    if(f.size>20*1024*1024)return rej(new Error('Ảnh quá lớn (tối đa 20 MB).'));
    var r=new FileReader();r.onerror=function(){rej(new Error('Không đọc được file ảnh.'));};
    r.onload=function(){var im=new Image();im.onerror=function(){rej(new Error('File ảnh không hợp lệ.'));};
      im.onload=function(){var k=Math.min(1,1920/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);var q=.82,u=c.toDataURL('image/jpeg',q);while(u.length>2600000&&q>.4){q-=.12;u=c.toDataURL('image/jpeg',q);}res(u);};
      im.src=r.result;};
    r.readAsDataURL(f);
  });
}
function lookPanel(m){
  var L=lookGet(),bg=lookBg(),box=$('#lookbox',m);if(!box)return;
  box.innerHTML='<div class="look-row"><span>Màu chủ đạo</span><div class="look-acc">'+LOOK_ACCENTS.map(function(x){return '<button type="button" class="la'+(L.accent===x[0]?' on':'')+'" data-la="'+x[0]+'" title="'+x[1]+'" style="--c:'+x[2]+'"></button>';}).join('')+'</div></div>'+
    '<div class="look-row"><span>Cỡ chữ</span><div class="seg">'+[['sm','Nhỏ'],['md','Vừa'],['lg','Lớn']].map(function(x){return '<button type="button" data-ls="'+x[0]+'" class="'+(L.size===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</div></div>'+
    '<div class="look-row"><span>Mật độ</span><div class="seg">'+[['comfy','Thoáng'],['compact','Gọn']].map(function(x){return '<button type="button" data-ld="'+x[0]+'" class="'+(L.density===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</div></div>'+
    '<div class="look-row"><span>Góc bo</span><div class="seg">'+[['round','Mềm'],['sharp','Vuông']].map(function(x){return '<button type="button" data-lr="'+x[0]+'" class="'+(L.radius===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</div></div>'+
    '<div class="look-bg"><div class="look-thumb"'+(bg?' style="background-image:url('+bg+')"':'')+'>'+(bg?'':'<span>Chưa có ảnh nền</span>')+'</div><div style="flex:1;min-width:0">'+
      '<div class="row" style="gap:6px"><label class="btn sm primary">Tải ảnh nền<input type="file" id="lbgf" accept="image/*" hidden></label>'+(bg?'<button type="button" class="btn sm" id="lbgx">Bỏ ảnh nền</button>':'')+'</div>'+
      '<p class="small muted" style="margin:6px 0 0">'+(bg===DEFAULT_BG&&bg?'Đang dùng ảnh nền mặc định. ':'')+'Ảnh bạn tải lên được thu nhỏ và chỉ lưu trên trình duyệt này.</p>'+
      (bg?'<label class="look-range">Độ mờ phủ lên ảnh <b>'+L.dim+'%</b><input type="range" min="0" max="90" step="5" value="'+L.dim+'" id="ldim"></label><label class="look-range">Độ đặc của thẻ <b>'+L.glass+'%</b><input type="range" min="40" max="100" step="4" value="'+L.glass+'" id="lgl"></label>':'')+
    '</div></div><div class="row" style="justify-content:flex-end;margin-top:10px"><button type="button" class="btn sm ghost" id="lreset">Khôi phục mặc định</button></div>';
  function set(k,v){var x=lookGet();x[k]=v;lookSet(x);lookPanel(m);}
  $$('[data-la]',box).forEach(function(b){b.onclick=function(){set('accent',b.dataset.la);};});
  $$('[data-ls]',box).forEach(function(b){b.onclick=function(){set('size',b.dataset.ls);};});
  $$('[data-ld]',box).forEach(function(b){b.onclick=function(){set('density',b.dataset.ld);};});
  $$('[data-lr]',box).forEach(function(b){b.onclick=function(){set('radius',b.dataset.lr);};});
  var dm=$('#ldim',box);if(dm)dm.oninput=function(){var x=lookGet();x.dim=+dm.value;lookSet(x);dm.previousElementSibling.textContent=dm.value+'%';};
  var gl=$('#lgl',box);if(gl)gl.oninput=function(){var x=lookGet();x.glass=+gl.value;lookSet(x);gl.previousElementSibling.textContent=gl.value+'%';};
  $('#lbgf',box).onchange=function(){var f=this.files[0];readBgFile(f).then(function(u){try{localStorage.setItem('ui_bg',u);}catch(e){toast('Không lưu được ảnh: bộ nhớ trình duyệt đã đầy.');return;}applyLook();lookPanel(m);toast('Đã đặt ảnh nền');},function(e){toast(e.message);});};
  var bx=$('#lbgx',box);if(bx)bx.onclick=function(){try{localStorage.setItem('ui_bg','none');}catch(e){}applyLook();lookPanel(m);};
  $('#lreset',box).onclick=function(){try{localStorage.removeItem('ui_look');localStorage.removeItem('ui_bg');}catch(e){}applyLook();lookPanel(m);};
}
function applyTheme(){var t=P.settings.theme;if(t==='auto')t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;var b=$('#themeBtn');if(b)b.innerHTML=ic(t==='dark'?'sun':'moon');}

// ---------- router ----------
var cur='',suppress=false,lastHash=location.hash;
function parse(){var h=location.hash.replace(/^#\/?/,''),i=h.indexOf('?'),path=i>=0?h.slice(0,i):h,qs={};if(i>=0)h.slice(i+1).split('&').forEach(function(p){var kv=p.split('=');if(kv[0])qs[decodeURIComponent(kv[0])]=decodeURIComponent(kv[1]||'');});var parts=path.split('/').filter(Boolean);return {name:parts[0]||'',arg:parts[1],qs:qs};}
function go(){
  var r=parse();clearTimers();setKeys(null);cur=r.name;
  try{(routes[r.name]||routes[''])(r.arg,r.qs);}catch(e){console.error(e);render('<h1>Có lỗi</h1><p>'+esc(e.message)+'</p><a class="btn" href="#/">Về trang chủ</a>');}
  $$('#nav a,#bottom a').forEach(function(a){a.classList.toggle('on',a.dataset.r===(r.name||'home'));});
  var n=mistakeIds().length;$$('.mbadge').forEach(function(b){b.textContent=n;b.style.display=n?'':'none';});
}
window.addEventListener('hashchange',function(){
  if(suppress){suppress=false;lastHash=location.hash;return;}
  var r=parse();
  if(cur==='exam'&&P.examInProgress&&r.name!=='exam'){var target=location.hash;suppress=true;location.hash=lastHash;
    confirmBox('Bạn đang làm bài thi thử. Rời trang? Bài làm được giữ lại nhưng đồng hồ vẫn chạy.','Rời trang').then(function(y){if(y){cur='';location.hash=target;}});return;}
  if(cur==='duel'&&duelActive()&&r.name!=='duel'){var tg=location.hash;suppress=true;location.hash=lastHash;
    confirmBox('Đang trong trận đấu. Rời trang thì trận sẽ kết thúc với cả hai người. Vẫn rời?','Rời trận',true).then(function(y){if(y){duelSend({t:'bye'});duelReset();cur='';location.hash=tg;}});return;}
  lastHash=location.hash;go();
});


// ---------- hướng dẫn sử dụng ----------
function showOnboardingGuide(force){
  if(!force&&localStorage.getItem('ssg_guide_seen_v3'))return;
  var rows=[
    ['book','Học lý thuyết','Đọc từng chương ở tab Lý thuyết, sau đó dùng Ôn lý thuyết để kiểm tra đúng nội dung vừa đọc.'],
    ['pen','Luyện đề','Bộ đề, Luyện tập và Thi thử dùng câu hỏi tiếng Anh như đề thi thật. Câu làm sai được lưu vào Câu sai và hỏi lại cho đến khi bạn nắm chắc.'],
    ['spark','Hỏi Bố Tuấn Anh và dịch','Dưới mỗi câu hỏi, chọn Gợi ý để được định hướng cách làm mà không lộ đáp án, hoặc Kiểm tra đáp án sau khi trả lời. Bôi đen chữ tiếng Anh để xem bản dịch ngay tại chỗ.'],
    ['layers','Tiến độ','Kết quả được lưu theo tài khoản và đồng bộ giữa các thiết bị. Trang chủ hiển thị mức sẵn sàng và chương cần ưu tiên.']
  ];
  var h='<div class="guide-modal"><h2 class="guide-title">Hướng dẫn sử dụng</h2><p class="guide-lead">Bốn bước để ôn thi hiệu quả với '+esc(SJ.name)+'.</p><ol class="guide-list">'+rows.map(function(r,i){return '<li><span class="gl-ic">'+ic(r[0])+'</span><div><b>'+r[1]+'</b><p>'+r[2]+'</p></div></li>';}).join('')+'</ol><p class="guide-foot">Bạn có thể mở lại hướng dẫn này bất cứ lúc nào bằng nút Hướng dẫn trên thanh công cụ.</p></div>';
  modal(h,[{t:'Đã hiểu',v:'done',primary:true}]).then(function(){localStorage.setItem('ssg_guide_seen_v3','1');});
}

// ---------- shell ----------
var NAV=[['home','#/','Trang chủ','home'],['learn','#/learn','Lý thuyết','book'],].concat(D.glossary.length?[['cards','#/cards','Thẻ','cards']]:[]).concat([['practice','#/practice','Luyện tập','pen'],['bank','#/bank','Bộ đề','layers'],['exam','#/exam','Thi thử','clock'],['duel','#/duel','Thi đấu','swords'],['mistakes','#/mistakes','Câu sai','x']]);
function shell(){
  document.body.innerHTML='<div id="banner"></div><header id="top"><div class="in"><a class="brand" href="#/"><i>'+esc(SJ.name)+'</i><span class="hide-m">'+esc(SJ.title)+'</span></a><nav id="nav">'+NAV.map(function(n){return '<a href="'+n[1]+'" data-r="'+n[0]+'" title="'+n[2]+'">'+ic(n[3])+'<span class="nl">'+n[2]+'</span>'+(n[0]==='mistakes'?' <span class="badge mbadge"></span>':'')+'</a>';}).join('')+'</nav><span style="flex:1" class="only-m"></span><button class="help-btn" id="guideBtn" title="Hướng dẫn sử dụng" aria-label="Hướng dẫn sử dụng">'+ic('help')+'<span>Hướng dẫn</span></button><button class="iconbtn" id="themeBtn" aria-label="Đổi sáng/tối"></button><button class="iconbtn" id="setBtn" aria-label="Cài đặt">'+ic('gear')+'</button></div></header>'+
   '<main id="content"></main><nav id="bottom">'+NAV.map(function(n){return '<a href="'+n[1]+'" data-r="'+n[0]+'">'+ic(n[3])+n[2]+(n[0]==='mistakes'?'<span class="badge mbadge"></span>':'')+'</a>';}).join('')+'</nav><div id="modal"></div><div id="toast" role="status"></div>';
  content=$('#content');
  $('#guideBtn').onclick=function(){showOnboardingGuide(true);};
  $('#themeBtn').onclick=function(){P.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';save();applyTheme();};
  $('#setBtn').onclick=openSettings;
}
document.addEventListener('keydown',function(e){
  if($('#modal').style.display==='flex'||e.ctrlKey||e.metaKey||e.altKey)return;
  var t=(e.target.tagName||'').toLowerCase();if(t==='input'||t==='textarea'||t==='select')return;
  if(keyHandler&&keyHandler(e))e.preventDefault();
});

// ---------- boot ----------
load();shell();applyTheme();applyLook();
setTimeout(function(){showOnboardingGuide(false);},450);
if(window.matchMedia)matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
if(!canSave)banner();
window.SSG={P:function(){return P;},shuffle:shuffle,buildExam:buildExam,record:record};
go();
})();
