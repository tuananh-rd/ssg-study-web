import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
function rep(o, n) { if (!a.includes(o)) { miss.push(o.slice(0, 60)); return; } a = a.replace(o, () => n); }
const s0 = a.indexOf('function tidyLesson(h){'), s1 = a.indexOf('function readMins(', s0);
if (s0 < 0 || s1 < 0) { console.log('không thấy tidyLesson'); process.exit(1); }
a = a.slice(0, s0) + fs.readFileSync(R + 'sources-private/tools/tidy-lesson.js', 'utf8') + a.slice(s1);
// đánh số tiêu đề con theo mục + thanh tiến độ đọc
rep(`<h2>'+esc(s.t)+'</h2><div class="prose">'+tidyLesson(s.h)+'</div>'`, `<h2>'+esc(s.t)+'</h2><div class="prose" style="--sid:&quot;'+s.id+'.&quot;">'+tidyLesson(s.h)+'</div>'`);
rep(`  if($('#focusBtn'))$('#focusBtn').onclick=function(){focusToggle();};
  (function(){var links=$$('.outline a');`, `  if($('#focusBtn'))$('#focusBtn').onclick=function(){focusToggle();};
  lessonProgress();
  (function(){var links=$$('.outline a');`);
rep(`routes.resume=function(){`, `// thanh tiến độ đọc của trang chương
function lessonProgress(){
  var bar=document.getElementById('lsProg');if(!bar){bar=document.createElement('div');bar.id='lsProg';bar.innerHTML='<i></i>';document.body.appendChild(bar);}
  function upd(){var main=document.querySelector('.lesson-main');if(!main||cur!=='learn'){bar.style.display='none';return;}bar.style.display='';var r=main.getBoundingClientRect(),tot=r.height-window.innerHeight*.6,p=tot>0?Math.min(1,Math.max(0,-r.top+window.innerHeight*.2)/tot):1;bar.firstChild.style.width=(p*100).toFixed(1)+'%';}
  if(!lessonProgress.on){lessonProgress.on=1;window.addEventListener('scroll',function(){requestAnimationFrame(upd);},{passive:true});window.addEventListener('hashchange',function(){setTimeout(upd,60);});}
  setTimeout(upd,30);
}
(function(){try{if(document.getElementById('font-lesson'))return;var l=document.createElement('link');l.id='font-lesson';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap';document.head.appendChild(l);}catch(e){}})();
routes.resume=function(){`);
if (miss.length) { console.log('THIẾU', miss.join(' | ')); process.exit(1); }
fs.writeFileSync(R + 'src/app.js', a);
fs.appendFileSync(R + 'src/style.css', fs.readFileSync(R + 'sources-private/tools/lesson-v2.css', 'utf8'));
console.log('ok');
