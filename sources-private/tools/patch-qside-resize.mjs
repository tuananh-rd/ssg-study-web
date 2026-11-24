import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
const rep = (o, n) => { if (!a.includes(o)) miss.push(o.slice(0, 60)); else a = a.replace(o, () => n); };
rep(`    if($('#thBtn'))$('#thBtn').onclick=`, `    qsideResize();
    if($('#thBtn'))$('#thBtn').onclick=`);
rep(`// Nút Tập trung nổi ở đáy màn hình`, `// Kéo để đổi kích thước khung chatbot cạnh câu hỏi (độ rộng: cạnh phải; chiều cao phần hội thoại: cạnh dưới). Nhớ theo trình duyệt, nhấp đúp để về mặc định.
function qsideResize(){
  var lay=$('.qlay'),side=$('.qside');if(!lay||!side||window.innerWidth<1000)return;
  var W=+localStorage.getItem('qs_w')||0,H=+localStorage.getItem('qs_h')||0;
  function apply(){if(W)lay.style.setProperty('--qw',W+'px');else lay.style.removeProperty('--qw');if(H){lay.style.setProperty('--qlh',H+'px');lay.classList.add('qs-h');}else{lay.style.removeProperty('--qlh');lay.classList.remove('qs-h');}}
  apply();
  var rh=document.createElement('div');rh.className='qs-rh';rh.title='Kéo để đổi độ rộng (nhấp đúp: mặc định)';rh.setAttribute('aria-hidden','true');
  var bh=document.createElement('div');bh.className='qs-bh';bh.title='Kéo để đổi chiều cao (nhấp đúp: mặc định)';bh.setAttribute('aria-hidden','true');
  side.appendChild(rh);side.appendChild(bh);
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
// Nút Tập trung nổi ở đáy màn hình`);
if (miss.length) { console.log('THIẾU', miss); process.exit(1); }
fs.writeFileSync(R + 'src/app.js', a);
let c = fs.readFileSync(R + 'src/style.css', 'utf8');
c = c.replace('.qlay{grid-template-columns:minmax(300px,360px) minmax(0,1fr);gap:20px}', '.qlay{grid-template-columns:minmax(280px,var(--qw,360px)) minmax(0,1fr);gap:20px}');
c += `
/* chỉnh kích thước khung chatbot cạnh câu hỏi */
.qs-rh,.qs-bh{display:none}
@media(min-width:1000px){
  .qlay>.qside{position:sticky}
  .qs-rh{display:block;position:absolute;top:14px;bottom:14px;right:-12px;width:14px;cursor:ew-resize;z-index:5;border-radius:6px;touch-action:none}
  .qs-rh::after{content:"";position:absolute;left:5px;top:50%;height:46px;width:4px;margin-top:-23px;border-radius:3px;background:var(--line);transition:background .15s,height .15s}
  .qs-rh:hover::after,body.qs-dragging .qs-rh::after{background:var(--primary);height:70px;margin-top:-35px}
  .qs-bh{display:block;position:absolute;left:14px;right:14px;bottom:-12px;height:14px;cursor:ns-resize;z-index:5;touch-action:none}
  .qs-bh::after{content:"";position:absolute;top:5px;left:50%;width:46px;margin-left:-23px;height:4px;border-radius:3px;background:var(--line);transition:background .15s,width .15s}
  .qs-bh:hover::after,body.qs-dragging .qs-bh::after{background:var(--primary);width:70px;margin-left:-35px}
  .qlay.qs-h>.qside{max-height:none}.qlay.qs-h .qside .ai-log{flex:none;height:var(--qlh);max-height:none}
  body.qs-dragging{user-select:none;cursor:grabbing}body.qs-dragging iframe{pointer-events:none}
}
`;
fs.writeFileSync(R + 'src/style.css', c);
console.log('ok');
