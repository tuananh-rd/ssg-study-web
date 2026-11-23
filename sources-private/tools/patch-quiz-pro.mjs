import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), ai = fs.readFileSync(R + 'src/ai.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };

// ---------- 1) tiện ích: hỏi lại câu sai, mục kế tiếp, ngăn lý thuyết bên cạnh ----------
rep('helpers', '// ---------- quiz runner (practice, lesson check, mistakes) ----------', String.raw`// ---------- ngăn lý thuyết bên cạnh + hỏi lại câu sai + điều hướng mục ----------
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
function quizTools(q){
  var g=reaskGap(),has=!!(q&&(q.ref||(q.module&&MOD[q.module])));
  return '<span class="qtools">'+(has?'<button type="button" class="btn sm" id="thBtn" title="Mở lý thuyết bên cạnh (phím T)">'+ic('book')+'<span>Lý thuyết</span></button>':'')+
    '<label class="small muted rgap" title="Câu trả lời sai sẽ được hỏi lại sau số câu bạn chọn">Hỏi lại câu sai <select id="rgap" class="sel sm">'+[[0,'Tắt'],[3,'Sau 3 câu'],[5,'Sau 5 câu'],[10,'Sau 10 câu']].map(function(o){return '<option value="'+o[0]+'"'+(g===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></label></span>';
}

// ---------- quiz runner (practice, lesson check, mistakes) ----------`);

// ---------- 2) runQuiz ----------
rep('init', `function runQuiz(list,title,back,lang){
  var i=0,score=0,wrong=[];lang=lang||plang();`, `function runQuiz(list,title,back,lang){
  list=list.slice();var i=0,score=0,wrong=[],base=list.length,seen={},fixed=0,t0=Date.now();lang=lang||plang();`);
rep('tools', `'<span class="small muted">'+(i+1)+'/'+list.length+'</span></div>'+`, `'<span class="small muted">'+(i+1)+'/'+list.length+'</span>'+quizTools(q)+'</div>'+`);
rep('retrytag', `' '+srcTag(q)+(`, `' '+(q._retry?'<span class="tag warn">Hỏi lại câu đã sai</span> ':'')+srcTag(q)+(`);
rep('bindtools', `    if($('#qtClose'))$('#qtClose').onclick=`, `    if($('#thBtn'))$('#thBtn').onclick=function(){if(TH.open)thClose();else thOpen(q.module,q.ref);};
    if($('#rgap'))$('#rgap').onchange=function(){try{localStorage.setItem('ui_reask',this.value);}catch(e){}toast(+this.value?'Câu sai sẽ được hỏi lại sau '+this.value+' câu':'Đã tắt hỏi lại câu sai');};
    if(TH.open&&(q.ref||q.module))thOpen(q.module,q.ref,true);
    if($('#qtClose'))$('#qtClose').onclick=`);
rep('check', `if(ok)score++;else wrong.push(q);record(q,ok);`, `var first=!seen[q.id];seen[q.id]=1;
      if(first){if(ok)score++;else wrong.push(q);}else if(ok)fixed++;
      record(q,ok);
      var gp=reaskGap();if(!ok&&gp>0&&(q._retry||0)<3){var cl=Object.assign({},q,{_retry:(q._retry||0)+1});list.splice(Math.min(i+1+gp,list.length),0,cl);}`);
rep('refbtn', `(q.ref?' <a href="'+refLink(q.ref)+'">Xem lý thuyết §'+q.ref+'</a>':'')`, `((q.ref||(q.module&&MOD[q.module]))?' <button type="button" class="link-btn" data-thref="'+(q.ref||'')+'" data-thmod="'+(q.module||'')+'">Xem lý thuyết'+(q.ref?' §'+q.ref:'')+'</button>':'')`);
rep('bindref', `      ctx.answered=true;ctx.picked=`, `      $$('[data-thref]',$('#fb')).forEach(function(bt){bt.onclick=function(){thOpen(bt.dataset.thmod,bt.dataset.thref);};});
      ctx.answered=true;ctx.picked=`);
rep('keyT', `setKeys(function(e){var n=keyIdx(e,opts.length);if(n>=0&&!answered){pick(n);return true;}`, `setKeys(function(e){if((e.key==='t'||e.key==='T')&&$('#thBtn')){$('#thBtn').click();return true;}var n=keyIdx(e,opts.length);if(n>=0&&!answered){pick(n);return true;}`);
rep('render', `function render(h){content.innerHTML=h;window.scrollTo(0,0);}`, `function render(h){if(TH.open&&h.indexOf('id="thBtn"')<0)thClose();content.innerHTML=h;window.scrollTo(0,0);}`);

// ---------- 3) màn kết quả ----------
const d0 = a.indexOf('  function done(){'), d1 = a.indexOf("    bind('#again','click',function(){go();});\n  }\n  show();");
if (d0 < 0 || d1 < 0) miss.push('done'); else a = a.slice(0, d0) + String.raw`  function done(){
    setKeys(null);var p=base?score/base:0,qs0=list.filter(function(q){return !q._retry;}),secs=allSecs(),ord={};secs.forEach(function(s,k){ord[s.id]=k;});
    var refs=[];qs0.forEach(function(q){if(q.ref&&refs.indexOf(q.ref)<0)refs.push(q.ref);});refs.sort(function(x,y){return (ord[x]||0)-(ord[y]||0);});
    var lastQ=qs0[qs0.length-1]||{},modId=refs.length?modOfRef(refs[refs.length-1]):(lastQ.module||''),acts='',nxt=null;
    if(refs.length)acts+='<a class="btn" href="#/learn/'+modOfRef(refs[0])+'?s='+refs[0]+'">'+ic('book')+' '+(refs.length===1?'Đọc lại §'+refs[0]+' '+esc(secTitle(refs[0])):'Đọc lại lý thuyết')+'</a>';
    else if(MOD[modId])acts+='<a class="btn" href="#/learn/'+modId+'">'+ic('book')+' Đọc lại chương '+esc(MOD[modId].short)+'</a>';
    if(refs.length)nxt=nextSecOf(refs[refs.length-1]);
    else if(MOD[modId]){var mi=D.modules.indexOf(MOD[modId]),nm=D.modules[mi+1];if(nm&&nm.sections.length)nxt={mod:nm.id,id:nm.sections[0].id,t:nm.sections[0].t};}
    if(nxt){acts+='<a class="btn primary" href="#/learn/'+nxt.mod+'?s='+nxt.id+'">Đọc tiếp §'+nxt.id+' '+esc(nxt.t)+' '+ic('arrow')+'</a>';if(recallOf(nxt.mod,nxt.id).length)acts+='<a class="btn" href="#/practice?recall='+nxt.mod+'&s='+nxt.id+'">Ôn mục tiếp theo</a>';}
    var sec=Math.round((Date.now()-t0)/1000),tm=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
    render('<div class="card empty qres"><div class="ring" style="margin:0 auto 10px">'+ring(p,118,10,p>=.8?'var(--ok)':p>=.5?'#f59f00':'var(--bad)','var(--panel2)')+'<b>'+score+'/'+base+'<small>'+pct(p)+'</small></b></div><h1 style="margin-bottom:4px">'+(p>=.8?'Rất tốt!':p>=.5?'Khá ổn, cố thêm chút nữa':'Cần ôn lại')+'</h1><p class="muted" style="margin-top:0">'+esc(title)+'</p>'+
      '<div class="res-stats"><div><b>'+score+'/'+base+'</b><span>đúng ngay lần đầu</span></div><div><b>'+fixed+'</b><span>câu sai đã sửa khi hỏi lại</span></div><div><b>'+wrong.length+'</b><span>câu cần xem lại</span></div><div><b>'+tm+'</b><span>thời gian làm</span></div></div>'+
      (acts?'<div class="res-section"><div class="small muted">Học tiếp</div><div class="row" style="justify-content:center;gap:8px">'+acts+'</div></div>':'')+
      '<div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="again">Làm lượt mới</button>'+(wrong.length?'<a class="btn" href="#/mistakes">Làm lại câu sai</a>':'')+'<a class="btn ghost" href="#/">Trang chủ</a></div></div>'+
      (wrong.length?'<h2>Câu sai lượt này</h2>'+wrong.map(function(q){var t=T(q,lang);return '<div class="card"><div style="font-weight:600">'+qhtml(t.q)+'</div><div class="small" style="margin-top:6px">Đáp án: <b style="color:var(--ok)">'+esc(t.correct)+'</b></div><div class="small muted">'+(q.explain&&q.explain.length<260?esc(q.explain):'')+(q.ref?' <a href="'+refLink(q.ref)+'">§'+q.ref+'</a>':'')+'</div></div>';}).join(''):''));
` + a.slice(d1);

// ---------- 4) trang lý thuyết: link sang mục kế tiếp ----------
rep('secmap', `m.sections.map(function(s){var rq=recallOf(id,s.id),ok=recallDone(rq);return '<section class="sec" id="s-'+s.id+'">`, `m.sections.map(function(s,ix){var nS=m.sections[ix+1],rq=recallOf(id,s.id),ok=recallDone(rq);return '<section class="sec" id="s-'+s.id+'">`);
rep('secnext', `' câu</a></div>':'')+'</section>';}`, `' câu</a></div>':'')+(nS?'<a class="sec-next" href="#/learn/'+id+'?s='+nS.id+'">Mục tiếp theo: '+esc(nS.t)+' '+ic('arrow')+'</a>':'')+'</section>';}`);
fs.writeFileSync(R + 'src/app.js', a);

// ---------- ai.js: mở chat thì đóng ngăn lý thuyết ----------
const o = 'dock.open=on===undefined?!dock.open:!!on;';
if (!ai.includes(o)) miss.push('dockToggle'); else ai = ai.replace(o, () => o + 'if(dock.open&&typeof thClose===\'function\')thClose();');
fs.writeFileSync(R + 'src/ai.js', ai);

fs.appendFileSync(R + 'src/style.css', String.raw`
/* ===== Bài làm: công cụ, ngăn lý thuyết, kết quả ===== */
.qtop{flex-wrap:wrap;gap:8px 12px}.qtop .bar{flex:1 1 160px}
.qtools{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;margin-left:auto}
.qtools .btn svg{width:15px;height:15px}.qtools .btn span{margin-left:2px}
.rgap{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.rgap select{padding:4px 8px;font-size:.84rem;border-radius:8px}
@media(max-width:560px){.rgap{font-size:.8rem}.qtools .btn span{display:none}}
.thdock{position:fixed;top:61px;right:0;bottom:0;width:min(470px,100vw);z-index:25;display:flex;flex-direction:column;background:var(--panel);border-left:1px solid var(--line);box-shadow:-8px 0 30px rgba(15,23,42,.14);transform:translateX(105%);transition:transform .2s ease;visibility:hidden}
.thdock.open{transform:none;visibility:visible}
.th-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:14px 16px 10px;border-bottom:1px solid var(--line)}
.th-head b{display:block;margin-top:2px;line-height:1.35}
.th-chips{display:flex;gap:6px;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--line);max-height:92px;overflow:auto}
.th-chips .chip{border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:999px;padding:3px 11px;font-size:.82rem;cursor:pointer}.th-chips .chip.on{background:var(--primary);border-color:var(--primary);color:var(--primary-ink)}
.th-body{flex:1;overflow:auto;padding:14px 18px 40px;font-size:.96rem;line-height:1.7}
@media(min-width:1100px){body.th-open #content{margin-left:224px;margin-right:490px;max-width:none}}
@media(max-width:999px){.thdock{top:0;z-index:70}}
body.th-open .dock-fab{display:none}
.qres{padding-bottom:22px}
.res-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:14px auto 4px;max-width:640px}
.res-stats div{background:var(--panel2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:2px}.res-stats b{font-size:1.35rem;font-variant-numeric:tabular-nums}.res-stats span{font-size:.78rem;color:var(--muted)}
.res-section{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}.res-section .small{margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em;font-weight:700}
.sec-next{display:flex;justify-content:flex-end;align-items:center;gap:6px;margin:8px 0 6px;font-weight:600;font-size:.92rem}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
