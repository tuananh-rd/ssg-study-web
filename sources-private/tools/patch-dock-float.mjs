import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/ai.js';
let a = fs.readFileSync(f, 'utf8');
const old = `<button class="iconbtn sm" id="dkClr"`;
if (!a.includes(old)) { console.log('thiếu mốc 1'); process.exit(1); }
a = a.replace(old, () => `<button class="iconbtn sm dk-mx" id="dkMx" type="button" title="Phóng to / thu nhỏ (nhấp đúp tiêu đề để về mặc định)" aria-label="Phóng to">'+ic('expand')+'</button><button class="iconbtn sm" id="dkClr"`);
const m2 = `  dockDraw();\n}\nfunction dockSend`;
if (!a.includes(m2)) { console.log('thiếu mốc 2'); process.exit(1); }
a = a.replace(m2, () => `  dockFloat();dockDraw();\n}\n` + `
var DK_KEY='dock_geo';
function dkGet(){try{var g=JSON.parse(localStorage.getItem(DK_KEY)||'null');if(g&&g.w&&g.h)return g;}catch(e){}return null;}
function dkSave(g){try{localStorage.setItem(DK_KEY,JSON.stringify(g));}catch(e){}}
function dkClamp(g){
  var W=window.innerWidth,H=window.innerHeight;
  g.w=Math.max(300,Math.min(g.w,W));g.h=Math.max(320,Math.min(g.h,H));
  g.x=Math.max(0,Math.min(g.x,W-g.w));g.y=Math.max(0,Math.min(g.y,H-g.h));return g;
}
function dkApply(g){var s=dock.el.style;s.left=g.x+'px';s.top=g.y+'px';s.width=g.w+'px';s.height=g.h+'px';s.right='auto';s.bottom='auto';}
function dkReset(){
  dock.max=false;try{localStorage.removeItem(DK_KEY);}catch(e){}
  var s=dock.el.style;s.left=s.top=s.width=s.height=s.right=s.bottom='';
}
function dkCur(){var r=dock.el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};}
function dockFloat(){
  if(window.innerWidth<=760)return;
  ['n','s','e','w','ne','nw','se','sw'].forEach(function(d){var h=document.createElement('div');h.className='dk-h '+d;h.dataset.d=d;dock.el.appendChild(h);});
  var g=dkGet();if(g)dkApply(dkClamp(g));
  var drag=null;
  function down(e){
    if(window.innerWidth<=760||e.button>0)return;
    var t=e.target,h=t.closest&&t.closest('.dk-h'),hd=t.closest&&t.closest('.dk-head');
    if(!h&&!(hd&&!t.closest('button')))return;
    var c=dkCur();drag={mode:h?h.dataset.d:'move',sx:e.clientX,sy:e.clientY,c:c};
    dock.el.classList.add(h?'resizing':'dragging');e.preventDefault();
    document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up);
  }
  function move(e){
    if(!drag)return;var dx=e.clientX-drag.sx,dy=e.clientY-drag.sy,c=drag.c,g={x:c.x,y:c.y,w:c.w,h:c.h},W=window.innerWidth,H=window.innerHeight,m=drag.mode;
    if(m==='move'){g.x=c.x+dx;g.y=c.y+dy;}
    else{
      if(m.indexOf('e')>=0)g.w=Math.min(c.w+dx,W-c.x);
      if(m.indexOf('s')>=0)g.h=Math.min(c.h+dy,H-c.y);
      if(m.indexOf('w')>=0){var nw=Math.min(Math.max(300,c.w-dx),c.x+c.w);g.x=c.x+c.w-nw;g.w=nw;}
      if(m.indexOf('n')>=0){var nh=Math.min(Math.max(320,c.h-dy),c.y+c.h);g.y=c.y+c.h-nh;g.h=nh;}
    }
    dock.max=false;dkApply(dkClamp(g));
  }
  function up(){
    document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',up);
    dock.el.classList.remove('dragging','resizing');if(drag){dkSave(dkClamp(dkCur()));}drag=null;
  }
  dock.el.addEventListener('pointerdown',down);
  $('.dk-head',dock.el).addEventListener('dblclick',function(e){if(e.target.closest('button'))return;dkReset();});
  var mx=$('#dkMx',dock.el);
  if(mx)mx.onclick=function(){
    if(dock.max){dock.max=false;var g=dock.prev;if(g){dkApply(dkClamp(g));dkSave(g);}else dkReset();return;}
    dock.prev=dkCur();dock.max=true;
    var W=window.innerWidth,H=window.innerHeight,w=Math.min(W-40,Math.max(dock.prev.w,Math.round(W*.6))),h=H-40;
    dkApply(dkClamp({x:Math.round((W-w)/2),y:20,w:w,h:h}));
  };
  window.addEventListener('resize',function(){if(window.innerWidth<=760){dock.el.style.cssText='';return;}var g=dkGet();if(g)dkApply(dkClamp(g));});
}
function dockSend`);
fs.writeFileSync(f, a);
console.log('ok');
