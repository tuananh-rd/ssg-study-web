// Phục vụ trang môn học có kiểm quyền + chèn script đồng bộ tiến độ về tài khoản.
import { SUBJECTS, getUser } from './_lib.js';
import { logEvent, logEventOnce } from './_log.js';
import { liveTag } from './_live.js';
import { APPS } from './_content.generated.js';

const HEAD = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'same-origin' };

function syncScript(subject, user) {
  const s = SUBJECTS[subject];
  // Đổi tài khoản trên cùng trình duyệt → xoá dữ liệu học của người trước (kể cả API key AI), rồi tải tiến độ từ máy chủ.
  return `<script>window.AI_SERVER={label:'Bố Tuấn Anh'};</script><script>(function(){var S=${JSON.stringify(subject)},K=${JSON.stringify(s.key)},U='/api/progress/'+S,ME=${user.id},ls=localStorage;
try{var last=ls.getItem('ssg-web-user');if(last&&last!==String(ME)){Object.keys(ls).filter(function(k){return k.indexOf(K)===0;}).forEach(function(k){ls.removeItem(k);});}ls.setItem('ssg-web-user',String(ME));}catch(e){}
var serverHas=false;
try{var x=new XMLHttpRequest();x.open('GET',U,false);x.send();
 if(x.status===401){location.replace('/?next='+encodeURIComponent(location.pathname));}
 else if(x.status===200){var r=JSON.parse(x.responseText);var okFmt=false;try{okFmt=JSON.parse(r.data).version===2;}catch(e){}serverHas=!!r.data&&okFmt;var stamp=+ls.getItem(K+':sync')||0;if(okFmt&&r.updated_at>stamp){ls.setItem(K,r.data);ls.setItem(K+':sync',String(r.updated_at));}}
}catch(e){}
var si=Storage.prototype.setItem,timer=null,dirty=false,busy=false;
function push(){if(busy){timer=setTimeout(push,1500);return;}var d=ls.getItem(K);if(d==null)return;busy=true;dirty=false;
 fetch(U,{method:'PUT',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json','X-Requested-With':'ssg-web'},body:JSON.stringify({data:d})})
 .then(function(r){return r.json();}).then(function(j){if(j&&j.updated_at)si.call(ls,K+':sync',String(j.updated_at));}).catch(function(){dirty=true;}).then(function(){busy=false;});}
Storage.prototype.setItem=function(k,v){si.apply(this,arguments);if(this===ls&&k===K){dirty=true;clearTimeout(timer);timer=setTimeout(push,2500);}};
if(!serverHas&&ls.getItem(K))timer=setTimeout(push,1500);   // tiến độ cũ trên máy (bản offline) được đưa lên tài khoản
addEventListener('pagehide',function(){if(dirty)push();});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&dirty)push();});
})();</script>`;
}
const bar = () => `<style>#web-home{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--panel);color:var(--text);padding:7px 12px;border-radius:10px;font:600 .86rem system-ui,sans-serif;text-decoration:none;white-space:nowrap}#web-home:hover{background:var(--panel2)}#web-home svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}@media(max-width:760px){#web-home span{display:none}#web-home{padding:7px 9px}}</style><script>(function(){var h=document.querySelector('#top .in');if(!h||document.getElementById('web-home'))return;var a=document.createElement('a');a.id='web-home';a.href='/';a.title='Quay lại danh sách môn học';a.innerHTML='<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg><span>Môn học</span>';h.insertBefore(a,h.firstChild);})();</script>`;

const redirectLogin = url => new Response(null, { status: 302, headers: { location: '/?next=' + encodeURIComponent(new URL(url).pathname), 'cache-control': 'no-store' } });
const forbidden = () => new Response('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width"><body style="font:16px system-ui;padding:40px;text-align:center"><h2>Bạn chưa được cấp quyền môn này</h2><p><a href="/">Về trang chủ</a></p>', { status: 403, headers: HEAD });

export async function serveApp({ request, env }, subject) {
  const user = await getUser(request, env); if (!user) return redirectLogin(request.url);
  if (!SUBJECTS[subject] || !APPS[subject]) return new Response('Không tìm thấy', { status: 404 });
  if (!user.subjects.includes(subject)) { await logEvent(env, request, user, 'access_denied', subject, null); return forbidden(); }
  await logEventOnce(env, request, user, 'app_open', subject, null, 15 * 60000);   // mở lại liên tục chỉ ghi 1 dòng mỗi 15 phút
    let html = APPS[subject];
  html = html.replace(/<head[^>]*>/i, m => m + syncScript(subject, user)).replace(/<\/body>/i, bar() + liveTag() + '<script src="/chat.js?v=10" defer></script><script src="/whatsnew.js?v=12" defer></script><script src="/rank.js?v=17" defer></script><script src="/profile.js?v=11" defer></script><script src="/music.js?v=10" defer></script></body>');
  return new Response(html, { headers: HEAD });
}
