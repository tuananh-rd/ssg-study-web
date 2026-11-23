// ===== Nền động hoa lá (canvas, không cần tải ảnh) =====
var FX={cv:null,raf:0,ps:[],kind:'',w:0,h:0,last:0,glows:[]};
var FX_KIND={3:'petal',4:'leaf',5:'fire'};
function fxR(a,b){return a+Math.random()*(b-a);}
function fxSize(){if(!FX.cv)return;var d=Math.min(window.devicePixelRatio||1,1.5);FX.w=window.innerWidth;FX.h=window.innerHeight;FX.cv.width=Math.round(FX.w*d);FX.cv.height=Math.round(FX.h*d);FX.cv.getContext('2d').setTransform(d,0,0,d,0,0);}
function fxMake(k,first){
  var w=FX.w,h=FX.h,p={x:fxR(0,w),y:first?fxR(0,h):fxR(-60,-10),ph:fxR(0,6.28),fl:fxR(0,6.28)};
  if(k==='petal'){var cs=['255,200,215','255,182,205','255,216,226','250,170,195','255,235,240'];p.s=fxR(6,13);p.vy=fxR(22,48);p.vx=fxR(-8,14);p.sw=fxR(18,46);p.rot=fxR(0,6.28);p.vr=fxR(-1.2,1.2);p.c=cs[Math.floor(Math.random()*cs.length)];p.a=fxR(.7,.95);}
  else if(k==='leaf'){var ls=['86,158,84','120,181,92','160,200,96','62,128,86','196,205,96','100,170,120'];p.s=fxR(8,17);p.vy=fxR(18,40);p.vx=fxR(-12,12);p.sw=fxR(24,60);p.rot=fxR(0,6.28);p.vr=fxR(-.9,.9);p.c=ls[Math.floor(Math.random()*ls.length)];p.a=fxR(.55,.85);}
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
