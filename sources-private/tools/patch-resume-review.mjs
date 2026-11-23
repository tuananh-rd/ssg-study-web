import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };

// ---------- 1) lưu & tiếp tục bài đang làm ----------
rep('blank', `cards:{}};}`, `cards:{},quiz:null};}`);
rep('sig', `function runQuiz(list,title,back,lang){
  list=list.slice();var i=0,score=0,wrong=[],base=list.length,seen={},fixed=0,t0=Date.now();`, `function quizRestore(s){return s.items.map(function(it){var q=QMAP[it[0]];return q?(it[1]?Object.assign({},q,{_retry:it[1]}):q):null;}).filter(Boolean);}
function resumeCard(){
  var s=P.quiz;if(!s||!s.items||!s.items.length)return '';
  var n=s.items.length,pos=Math.min(s.i+1,n);
  return '<div class="card resume-card"><div class="rc-ic">'+ic('clock')+'</div><div class="rc-t"><b>Bạn đang làm dở một bài</b><div class="small muted">'+esc(s.title)+' · câu '+pos+'/'+n+' · đã đúng '+s.score+' câu</div></div><div class="row" style="gap:8px;flex:none"><a class="btn primary sm" href="#/resume">Tiếp tục '+ic('arrow')+'</a><button type="button" class="btn sm ghost" id="rcDrop">Bỏ</button></div></div>';
}
routes.resume=function(){
  var s=P.quiz;if(!s){location.hash='#/';return;}
  var list=quizRestore(s);if(!list.length){P.quiz=null;save();location.hash='#/';return;}
  runQuiz(list,s.title,s.back,s.lang,s);
};
function runQuiz(list,title,back,lang,resume){
  list=list.slice();var i=0,score=0,wrong=[],base=list.length,seen={},fixed=0,t0=Date.now(),spent=0,qkey=title+'|'+back;
  if(resume){i=Math.min(resume.i||0,list.length);score=resume.score||0;fixed=resume.fixed||0;seen=resume.seen||{};spent=resume.spent||0;base=resume.base||list.length;wrong=(resume.wrong||[]).map(function(id){return QMAP[id];}).filter(Boolean);}
  function persist(ix){try{P.quiz={key:qkey,title:title,back:back,lang:lang,items:list.map(function(q){return [q.id,q._retry||0];}),i:ix,score:score,fixed:fixed,seen:seen,base:base,wrong:wrong.map(function(q){return q.id;}),spent:spent+Math.round((Date.now()-t0)/1000),at:Date.now()};save();}catch(e){}}`);
rep('persistShow', `    var q=list[i],t=T(q,lang),answered=false,sel=[],tv=`, `    persist(i);
    var q=list[i],t=T(q,lang),answered=false,sel=[],tv=`);
rep('persistCheck', `      record(q,ok);
      var gp=reaskGap();`, `      record(q,ok);
      var gp=reaskGap();`);
rep('persistAfter', `      ctx.answered=true;ctx.picked=`, `      persist(i+1);
      ctx.answered=true;ctx.picked=`);
rep('doneClear', `    setKeys(null);var p=base?score/base:0,qs0=`, `    P.quiz=null;save();
    setKeys(null);var p=base?score/base:0,qs0=`);
rep('timefix', `var sec=Math.round((Date.now()-t0)/1000),tm=`, `var sec=spent+Math.round((Date.now()-t0)/1000),tm=`);
// hiện thẻ "bài đang làm dở" ở trang chủ / luyện tập / bộ đề
rep('renderResume', `function render(h){if(TH.open&&h.indexOf('id="thBtn"')<0)thClose();content.innerHTML=h;window.scrollTo(0,0);}`, `function render(h){
  if(TH.open&&h.indexOf('id="thBtn"')<0)thClose();
  var rc=(P&&P.quiz&&(cur===''||cur==='practice'||cur==='bank'||cur==='review')&&h.indexOf('class="qtop"')<0&&h.indexOf('qres')<0)?resumeCard():'';
  content.innerHTML=rc+h;window.scrollTo(0,0);
  var dr=document.getElementById('rcDrop');if(dr)dr.onclick=function(){confirmBox('Bỏ bài đang làm dở? Tiến độ của bài này sẽ không được giữ lại.','Bỏ bài',true).then(function(y){if(y){P.quiz=null;save();go();}});};
}`);

// ---------- 2) xem lại tất cả câu hỏi ----------
rep('review', `// ===== Practice =====`, String.raw`// ===== Xem lại tất cả câu hỏi của bộ đề =====
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

// ===== Practice =====`);
// liên kết từ trang Bộ đề sang mục xem lại
rep('banklink', `routes.bank=function(){
  var st=bankSt;`, `routes.bank=function(){
  var st=bankSt;`);
rep('bankhead', `render('<h1>'+esc(SJ.bankTitle)+'</h1><p class="muted" style="margin-top:-6px">'+pool.length+' câu tiếng Anh`, `render('<div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">'+esc(SJ.bankTitle)+'</h1><div class="seg"><button class="on" type="button">Luyện tập</button><a class="btn sm ghost" href="#/review" style="border-radius:8px">Xem tất cả câu hỏi</a></div></div><p class="muted" style="margin:6px 0 12px">'+pool.length+' câu tiếng Anh`);
fs.writeFileSync(R + 'src/app.js', a);

fs.appendFileSync(R + 'src/style.css', String.raw`
/* ===== Bài đang làm dở + xem lại câu hỏi ===== */
.resume-card{display:flex;align-items:center;gap:14px;border-left:4px solid var(--primary);margin-bottom:14px;flex-wrap:wrap}
.rc-ic{width:40px;height:40px;border-radius:12px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;flex:none}.rc-ic svg{width:20px;height:20px}
.rc-t{flex:1;min-width:200px}.rc-t .small{margin-top:2px}
.rv-tools{margin-bottom:12px}
.rv-chk{display:inline-flex;align-items:center;gap:8px;font-size:.88rem;color:var(--muted);cursor:pointer}.rv-chk input{accent-color:var(--primary)}
.rv-item{margin-bottom:12px}
.rv-h{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.rv-opts{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:6px}
.rv-opts li{display:flex;gap:12px;align-items:flex-start;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel)}
.rv-opts li b{width:24px;height:24px;border-radius:50%;background:var(--panel2);display:grid;place-items:center;font-size:.8rem;flex:none}
.rv-opts li span{flex:1;line-height:1.5}
.rv-opts li.ok{border-color:var(--ok);background:var(--ok-soft)}.rv-opts li.ok b{background:var(--ok);color:#fff}
.rv-tick{color:var(--ok);display:inline-flex}.rv-tick svg{width:18px;height:18px}
.rv-x{display:none;margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--panel2);border-left:3px solid var(--primary)}.rv-x.open{display:block}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
