import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(W + 'src/app.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };

rep('helpers', 'routes.learn=function(id,qs){', `function tidyLesson(h){
  var d=document.createElement('div');d.innerHTML=h;
  d.querySelectorAll('table').forEach(function(t){
    if(!t.querySelector('td')&&t.querySelector('code')){
      t.querySelectorAll('br').forEach(function(b){b.replaceWith('\\n');});
      var rows=[].map.call(t.querySelectorAll('tr'),function(r){return r.textContent;});
      var pre=document.createElement('pre');pre.className='code';var c=document.createElement('code');c.textContent=rows.join('\\n').replace(/^\\n+|\\s+$/g,'');pre.appendChild(c);t.replaceWith(pre);
    }else{var w=document.createElement('div');w.className='tbl-wrap';t.parentNode.insertBefore(w,t);w.appendChild(t);}
  });
  d.querySelectorAll('.img-ph').forEach(function(x){x.textContent='công thức/hình trong tài liệu gốc';});
  return d.innerHTML;
}
function readMins(m){var n=0;m.sections.forEach(function(s){n+=s.h.replace(/<[^>]+>/g,' ').split(/\\s+/).length;});return Math.max(1,Math.round(n/170));}
routes.learn=function(id,qs){`);

const i0 = a.indexOf(`render('<div class="row small muted"><a href="#/learn">← Lý thuyết</a>`);
const i1 = a.indexOf(`  if(qs.s){var t=document.getElementById('s-'+qs.s)`);
if (i0 < 0 || i1 < 0) miss.push('render markers'); else {
  a = a.slice(0, i0) + `var mins=readMins(m),nsec=m.sections.length;
  render('<div class="row small muted"><a href="#/learn">← Lý thuyết</a><span>·</span>'+dot(id)+m.short+(m.priority===4?' <span class="tag warn">Hay ra thi</span>':'')+'</div>'+
   '<header class="lesson-head"><h1>'+esc(m.title)+'</h1><div class="lesson-meta"><span>'+ic('book')+nsec+' mục</span><span>'+ic('clock')+'khoảng '+mins+' phút đọc</span></div></header>'+
   (m.keyPoints&&m.keyPoints.length?'<div class="keybox"><b>Ý phải nhớ</b><ul>'+m.keyPoints.map(function(k){return '<li>'+esc(k)+'</li>';}).join('')+'</ul></div>':'')+
   '<div class="lesson">'+
   (nsec>1?'<nav class="outline" aria-label="Mục lục"><div class="ol-t">Nội dung chương</div>'+m.sections.map(function(s){return '<a href="#/learn/'+id+'?s='+s.id+'" data-sid="s-'+s.id+'"><span>'+s.id+'</span>'+esc(s.t)+'</a>';}).join('')+'</nav>':'')+
   '<div class="lesson-main">'+
   m.sections.map(function(s){var rq=recallOf(id,s.id),ok=recallDone(rq);return '<section class="sec" id="s-'+s.id+'"><div class="sec-no">Mục '+s.id+'</div><h2>'+esc(s.t)+'</h2><div class="prose">'+tidyLesson(s.h)+'</div>'+
     (rq.length?'<div class="sec-check"><span class="small muted">'+(ok?'Đã trả lời đúng '+ok+'/'+rq.length+' câu của mục này':'Đọc xong? Tự kiểm tra lại mục này')+'</span><a class="btn sm" href="#/practice?recall='+id+'&s='+s.id+'">Hỏi lại mục này · '+rq.length+' câu</a></div>':'')+'</section>';}).join('')+
   (m.noQuiz?'':(function(){var rq=recallOf(id),ok=recallDone(rq);return '<div class="card row between"><div><b>Hỏi lại toàn bộ lý thuyết chương này</b><div class="small muted">'+rq.length+' câu đi lần lượt theo từng mục, chỉ hỏi định nghĩa, thành phần, thứ tự — không có câu tình huống.'+(ok?' Đã đúng '+ok+'/'+rq.length+'.':'')+'</div></div><a class="btn primary" href="#/practice?recall='+id+'">Ôn lý thuyết '+m.short+' '+ic('arrow')+'</a></div>';})()+
   '<div class="row" style="justify-content:flex-end;margin:-4px 0 12px"><a class="small" href="#/practice?m='+id+'">Hoặc luyện 10 câu kiểu đề thi của '+m.short+' →</a></div>')+
   '<div class="row between">'+(prev?'<a class="btn" href="#/learn/'+prev.id+'">← '+prev.short+'</a>':'<span></span>')+(nxt?'<a class="btn" href="#/learn/'+nxt.id+'">'+nxt.short+' →</a>':'')+'</div></div></div>');
  (function(){var links=$$('.outline a');if(!links.length||!window.IntersectionObserver)return;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.toggle('on',l.dataset.sid===e.target.id);});}});},{rootMargin:'-80px 0px -65% 0px'});
    $$('.lesson .sec').forEach(function(s){io.observe(s);});})();
` + a.slice(i1);
}
fs.writeFileSync(W + 'src/app.js', a);

fs.appendFileSync(W + 'src/style.css', `
/* ===== Trình bày lý thuyết ===== */
.lesson-head h1{margin:6px 0 8px;font-size:1.75rem;line-height:1.25}
.lesson-meta{display:flex;gap:16px;flex-wrap:wrap;color:var(--muted);font-size:.88rem}.lesson-meta span{display:inline-flex;align-items:center;gap:6px}
.lesson{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;margin-top:14px}
.outline{display:none}
@media(min-width:1000px){.lesson{grid-template-columns:230px minmax(0,1fr)}
 .outline{display:block;position:sticky;top:84px;align-self:start;max-height:calc(100vh - 110px);overflow:auto;border-left:2px solid var(--line);padding:2px 0}
 .outline .ol-t{font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700;padding:0 14px 8px}
 .outline a{display:flex;gap:8px;padding:7px 14px;margin-left:-2px;border-left:2px solid transparent;color:var(--muted);font-size:.88rem;line-height:1.4}
 .outline a span{color:var(--primary);font-variant-numeric:tabular-nums;flex:none;font-weight:600}
 .outline a:hover{color:var(--text)}.outline a.on{border-left-color:var(--primary);color:var(--text);font-weight:600;background:var(--primary-soft)}
 .toc{display:none}}
.lesson-main{min-width:0}
.lesson-main .sec{padding:18px 26px 14px;margin:0 0 16px}
.sec-no{font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--primary);font-weight:700}
.lesson-main .sec h2{margin:.2em 0 .7em;font-size:1.35rem;line-height:1.3;padding-bottom:.55em;border-bottom:1px solid var(--line)}
.prose{max-width:74ch;font-size:1.02rem;line-height:1.8}
.prose p{margin:.75em 0}
.prose h4{margin:1.6em 0 .5em;font-size:1.05rem;padding-left:10px;border-left:3px solid var(--primary);line-height:1.35}
.prose ul,.prose ol{margin:.6em 0;padding-left:1.4em}.prose li{margin:.4em 0;padding-left:.2em}.prose li::marker{color:var(--primary)}
.prose b,.prose strong{color:var(--text)}
.prose .img-ph{display:inline-block;font-size:.78rem;color:var(--muted);background:var(--panel2);border:1px dashed var(--line);border-radius:6px;padding:0 8px;line-height:1.6;vertical-align:baseline;white-space:nowrap}
.prose .tbl-wrap{overflow-x:auto;margin:1em 0;border:1px solid var(--line);border-radius:12px}
.prose table{border-collapse:collapse;width:100%;font-size:.94rem;line-height:1.55}
.prose th,.prose td{padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.prose th{background:var(--panel2);font-weight:650}
.prose tr:last-child td{border-bottom:0}
.prose td div,.prose th div{margin:0}
pre.code{margin:1em 0;padding:14px 16px;background:#0f172a;color:#e5e9f5;border-radius:12px;overflow:auto;font:.86rem/1.65 ui-monospace,Consolas,"Cascadia Mono",monospace;tab-size:4}
pre.code code{background:none;color:inherit;padding:0;font:inherit;white-space:pre}
:root[data-theme=dark] pre.code{background:#0a0f1c;border:1px solid var(--line)}
.prose code{background:var(--panel2);padding:1px 6px;border-radius:5px;font-size:.9em}
@media(max-width:760px){.lesson-head h1{font-size:1.45rem}.lesson-main .sec{padding:14px 16px 10px}.prose{font-size:1rem}}
`);
console.log(miss.length ? 'THIẾU ' + miss : 'ok');
