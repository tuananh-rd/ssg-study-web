import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/app.js'; let a = fs.readFileSync(f, 'utf8'); const miss = [];
const rep = (o, n) => { if (!a.includes(o)) miss.push(o.slice(0, 60)); else a = a.replace(o, () => n); };
rep(`function record(q,ok){`, `// ---------- ghi nhật ký hoạt động (chỉ khi chạy trên web có tài khoản; quản trị viên được cấp quyền mới xem được) ----------
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
function record(q,ok){
  track('quiz_answer',{id:q.id,ok:!!ok,src:q.bank?'bank':(q.type||'q'),mod:q.module||'',ref:q.ref||'',retry:q._retry||0});`);
rep(`  function done(){
    P.quiz=null;save();`, `  function done(){
    P.quiz=null;save();track('quiz_finish',{title:title,n:base,score:score,fixed:fixed,secs:spent+Math.round((Date.now()-t0)/1000)});`);
rep(`  P.exams.push({date:new Date().toISOString(),`, `  track('exam_finish',{right:right,total:E.ids.length,score:Math.round(right/E.ids.length*100)/10,auto:!!auto});
  P.exams.push({date:new Date().toISOString(),`);
rep(`  P.lastLesson=id;P.read[id]=true;save();`, `  P.lastLesson=id;P.read[id]=true;save();track('lesson_view',{mod:id,s:qs&&qs.s||''});`);
rep(`function fcStatAdd(m){`, `function fcStatAdd(m){track('focus_session',{min:m});`);
rep(`function srRun(q){
  q=(q||'').trim();if(!q)return;`, `function srRun(q){
  q=(q||'').trim();if(!q)return;track('search',{q:q.slice(0,120),tab:SR.tab,lang:SR.lang});`);
rep(`if (meR) duelStatsAdd({`, `if (meR) track('duel_finish',{rank:ranked.indexOf(meR)+1,players:ranked.length,score:meR.score,right:meR.right||0,total:s.ids.length});
      if (meR) duelStatsAdd({`);
if (miss.length) { console.log('THIẾU', miss); process.exit(1); }
fs.writeFileSync(f, a); console.log('ok');
