/* Hồ sơ người dùng: bấm vào avatar (bảng xếp hạng, danh sách online…) để xem hồ sơ; hồ sơ của mình có thể chỉnh sửa. */
(function(){
if(window.WebProfile)return;
var ov=null,ME=null,CUR=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function H(){return {'x-requested-with':'ssg-web','content-type':'application/json'};}
function get(p){return fetch(p,{credentials:'same-origin',headers:H()}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Lỗi');return j;});});}
function put(b){return fetch('/api/profile',{method:'PUT',credentials:'same-origin',headers:H(),body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Lỗi');return j;});});}
var AVC=['#e5484d','#e5832d','#d6a100','#3f9b5f','#1c93a8','#3b5bdb','#7a4fd1','#c0368f'];
function avc(id){return AVC[Math.abs(+id||0)%AVC.length];}
function ini(n){n=String(n||'?').trim().split(/\s+/);return (n[n.length-1]||'?').charAt(0).toUpperCase();}
function ptsTxt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
var ACC=['#3b5bdb','#7a4fd1','#c0368f','#e5484d','#e5832d','#d6a100','#3f9b5f','#1c93a8','#475569'];
function css(){if(document.getElementById('pf-css'))return;var s=document.createElement('style');s.id='pf-css';s.textContent=
'[data-pf]{cursor:pointer}.rk-av img,.wc-av img{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover}'+
'#pf-ov{position:fixed;inset:0;z-index:230;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(10,14,24,.55);backdrop-filter:blur(5px);white-space:normal}'+
'#pf-box{box-sizing:border-box;width:min(480px,100%);max-height:94vh;overflow:auto;background:var(--panel,#fff);color:var(--text,#111);border:1px solid var(--line,#ddd);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.45);font-weight:400;animation:pfIn .22s both cubic-bezier(.2,.8,.2,1)}'+
'@keyframes pfIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}'+
'.pf-ban{position:relative;height:104px;background:linear-gradient(120deg,var(--ac),color-mix(in srgb,var(--ac) 50%,#0b1020));overflow:hidden}.pf-ban::before{content:"";position:absolute;right:-30px;top:-60px;width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.14)}.pf-ban::after{content:"";position:absolute;left:30%;bottom:-80px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.09)}'+
'.pf-x{position:absolute;right:10px;top:10px;z-index:2;width:32px;height:32px;border:0;border-radius:50%;background:rgba(0,0,0,.28);color:#fff;font-size:1.3rem;line-height:1;cursor:pointer}.pf-x:hover{background:rgba(0,0,0,.45)}'+
'.pf-av{position:relative;margin:-46px 0 0 22px;width:92px;height:92px}.pf-av .rk-av{--s:92px;box-sizing:border-box;width:92px;height:92px;font-size:2.3rem;border-width:3px}.pf-av .rk-av::before{inset:-7px}'+
'.pf-bd{padding:8px 22px 20px}.pf-nm{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px}.pf-nm h2{margin:0;font-size:1.35rem}.pf-qtv{font:700 .65rem/1 system-ui;padding:3px 6px;border-radius:5px;background:linear-gradient(90deg,#f59f00,#ff6b6b);color:#fff}'+
'.pf-st{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:.8rem;color:var(--muted,#667)}.pf-dot{width:9px;height:9px;border-radius:50%;background:#9aa3b2}.pf-dot.on{background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.25)}'+
'.pf-mo{margin:12px 0 0;padding:9px 12px;border-left:3px solid var(--ac);background:color-mix(in srgb,var(--ac) 9%,transparent);border-radius:0 10px 10px 0;font-style:italic;line-height:1.5}'+
'.pf-bio{margin:12px 0 0;line-height:1.6;font-size:.93rem;white-space:pre-wrap;overflow-wrap:anywhere}.pf-emp{color:var(--muted,#667);font-style:italic}'+
'.pf-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.pf-g div{border:1px solid var(--line,#ddd);background:var(--panel2,#f6f7fb);border-radius:12px;padding:9px 10px;text-align:center}.pf-g b{display:block;font-size:1.1rem;font-variant-numeric:tabular-nums}.pf-g small{font-size:.7rem;color:var(--muted,#667)}'+
'.pf-bar{height:7px;border-radius:99px;background:var(--line,#e4e7ee);overflow:hidden;margin:14px 0 4px}.pf-bar i{display:block;height:100%;width:0;border-radius:99px;background:var(--ac);transition:width .8s cubic-bezier(.2,.8,.2,1)}.pf-nx{font-size:.76rem;color:var(--muted,#667)}'+
'.pf-ft{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}.pf-b{border:1px solid var(--line,#ddd);background:var(--panel2,#f6f7fb);color:var(--text,#111);padding:9px 16px;border-radius:10px;font:600 .88rem system-ui,sans-serif;cursor:pointer}.pf-b.pr{background:var(--primary,#3b5bdb);border-color:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff))}.pf-b:disabled{opacity:.6;cursor:default}'+
'.pf-f label{display:block;margin:14px 0 5px;font-weight:700;font-size:.82rem}.pf-f input[type=text],.pf-f textarea{box-sizing:border-box;width:100%;padding:9px 11px;border:1px solid var(--line,#ddd);border-radius:10px;background:var(--panel2,#f6f7fb);color:var(--text,#111);font:inherit;font-size:.92rem}.pf-f textarea{min-height:92px;resize:vertical}.pf-cn{float:right;font-weight:400;color:var(--muted,#667)}'+
'.pf-ap{display:flex;align-items:center;gap:12px}.pf-ap .pf-av{margin:0}.pf-sw{display:flex;gap:8px;flex-wrap:wrap}.pf-sw button{width:30px;height:30px;border-radius:50%;border:3px solid transparent;cursor:pointer;background:var(--c);box-shadow:0 0 0 1px var(--line,#ddd)}.pf-sw button.on{border-color:var(--panel,#fff);box-shadow:0 0 0 2px var(--c)}'+
'.pf-er{margin-top:10px;color:#e5484d;font-size:.84rem}.pf-ld{padding:50px 20px;text-align:center;color:var(--muted,#667)}'+
'@media(prefers-reduced-motion:reduce){#pf-box{animation:none}.pf-bar i{transition:none}}';
document.head.appendChild(s);}
function avHtml(p,pv){var t=p.title?p.title.i:0,c=p.title?p.title.c:'#888',img=pv?'<img src="/api/profile/avatar/'+p.id+'?v='+pv+'" alt="">':'';
  return '<div class="pf-av"><span class="rk-av t'+(p.title?t:0)+'" style="--s:92px;--c:'+esc(c)+';background:'+avc(p.id)+'">'+(img||esc(ini(p.name)))+'</span></div>';}
function ago(ts){if(!ts)return 'chưa rõ';var s=Math.max(0,(Date.now()-ts)/1000);if(s<90)return 'vừa xong';if(s<3600)return Math.round(s/60)+' phút trước';if(s<86400)return Math.round(s/3600)+' giờ trước';return Math.round(s/86400)+' ngày trước';}
function dmy(ts){var d=new Date(ts);return d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();}
function close(){if(ov){ov.remove();ov=null;document.removeEventListener('keydown',kd,true);}}
function kd(e){if(e.key==='Escape'){e.stopPropagation();close();}}
function shell(){if(ov)return ov.querySelector('#pf-box');css();ov=document.createElement('div');ov.id='pf-ov';ov.innerHTML='<div id="pf-box" role="dialog" aria-modal="true" aria-label="Hồ sơ"></div>';document.body.appendChild(ov);document.addEventListener('keydown',kd,true);ov.addEventListener('mousedown',function(e){if(e.target===ov)close();});return ov.querySelector('#pf-box');}
function view(p){
  CUR=p;var box=shell(),ac=p.accent||(p.title?p.title.c:'#3b5bdb'),t=p.title;
  var pct=t&&t.next?Math.max(3,Math.min(100,Math.round((p.pts-t.from)/(t.next.at-t.from)*100))):100;
  box.style.setProperty('--ac',ac);
  box.innerHTML='<div class="pf-ban"><button class="pf-x" type="button" aria-label="Đóng">×</button></div>'+avHtml(p,p.pv)+
   '<div class="pf-bd"><div class="pf-nm"><h2>'+esc(p.name)+'</h2>'+(p.admin?'<span class="pf-qtv">QTV</span>':'')+(t?'<span class="rk-tt t'+t.i+'" style="background-color:'+esc(t.c)+';--c:'+esc(t.c)+'">'+esc(t.name)+'</span>':'')+'</div>'+
   '<div class="pf-st"><span class="pf-dot'+(p.online?' on':'')+'"></span>'+(p.online?'Đang online':'Hoạt động '+ago(p.last))+'<span>· Tham gia '+dmy(p.joined)+'</span></div>'+
   (p.motto?'<div class="pf-mo">“'+esc(p.motto)+'”</div>':'')+
   '<div class="pf-bio'+(p.bio?'':' pf-emp')+'">'+(p.bio?esc(p.bio):(p.me?'Bạn chưa viết giới thiệu. Bấm “Chỉnh sửa hồ sơ” để thêm.':'Chưa có giới thiệu.'))+'</div>'+
   (p.noRank?'':'<div class="pf-bar"><i id="pf-fill"></i></div><div class="pf-nx">'+(t&&t.next?'Còn '+ptsTxt(t.next.at-p.pts)+' điểm để lên '+esc(t.next.name):'Đã đạt danh hiệu cao nhất')+'</div>')+
   '<div class="pf-g"><div><b>'+(p.noRank?'—':ptsTxt(p.pts))+'</b><small>Tổng điểm</small></div><div><b>'+(p.rank?'#'+p.rank+'<small>/'+p.of+'</small>':'—')+'</b><small>Hạng</small></div><div><b>'+p.streak+'</b><small>Chuỗi ngày</small></div>'+
   '<div><b>'+ptsTxt(p.quiz)+'</b><small>Câu quiz</small></div><div><b>'+(p.quiz?Math.round(p.ok/p.quiz*100)+'%':'—')+'</b><small>Đúng</small></div><div><b>'+ptsTxt(p.min)+'</b><small>Phút đọc</small></div></div>'+
   '<div class="pf-ft">'+(p.me?'<button class="pf-b pr" id="pf-edit" type="button">Chỉnh sửa hồ sơ</button>':'')+'<button class="pf-b" id="pf-cl" type="button">Đóng</button></div></div>';
  box.querySelector('.pf-x').onclick=close;box.querySelector('#pf-cl').onclick=close;
  var ed=box.querySelector('#pf-edit');if(ed)ed.onclick=function(){edit(p);};
  var f=box.querySelector('#pf-fill');if(f)setTimeout(function(){f.style.width=pct+'%';},60);
}
function shrink(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var S=256,c=document.createElement('canvas');c.width=c.height=S;var x=c.getContext('2d'),m=Math.min(im.width,im.height),sx=(im.width-m)/2,sy=(im.height-m)/2;x.fillStyle='#fff';x.fillRect(0,0,S,S);x.drawImage(im,sx,sy,m,m,0,0,S,S);URL.revokeObjectURL(u);var q=.85,d=c.toDataURL('image/jpeg',q);while(d.length>120000&&q>.4){q-=.1;d=c.toDataURL('image/jpeg',q);}d.length>140000?rej(new Error('Ảnh quá lớn')):res(d);};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('Không đọc được ảnh'));};im.src=u;});}
function edit(p){
  var box=shell(),st={avatar:undefined,accent:p.accent||ACC[0],preview:p.pv?('/api/profile/avatar/'+p.id+'?v='+p.pv):''};
  function paint(){
    var ac=st.accent;box.style.setProperty('--ac',ac);
    var av=box.querySelector('#pf-pv');if(av){av.style.background=avc(p.id);av.innerHTML=st.preview?'<img src="'+esc(st.preview)+'" alt="">':esc(ini(p.name));}
    [].forEach.call(box.querySelectorAll('.pf-sw button'),function(b){b.classList.toggle('on',b.dataset.c===st.accent);});
  }
  box.innerHTML='<div class="pf-ban"><button class="pf-x" type="button" aria-label="Đóng">×</button></div><div class="pf-bd pf-f"><h2 style="margin:6px 0 0;font-size:1.2rem">Chỉnh sửa hồ sơ</h2>'+
   '<label>Ảnh đại diện</label><div class="pf-ap"><div class="pf-av" style="width:72px;height:72px"><span id="pf-pv" class="rk-av t0" style="--s:72px;width:72px;height:72px;font-size:1.8rem"></span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="pf-b" id="pf-up" type="button">Chọn ảnh</button><button class="pf-b" id="pf-rm" type="button">Gỡ ảnh</button></div><input type="file" id="pf-file" accept="image/*" hidden></div>'+
   '<label>Câu nói của bạn <span class="pf-cn" id="pf-c1"></span></label><input type="text" id="pf-mo" maxlength="70" placeholder="Một câu bạn thích…" value="'+esc(p.motto)+'">'+
   '<label>Giới thiệu <span class="pf-cn" id="pf-c2"></span></label><textarea id="pf-bio" maxlength="240" placeholder="Bạn đang ôn gì, mục tiêu của bạn…">'+esc(p.bio)+'</textarea>'+
   '<label>Màu hồ sơ</label><div class="pf-sw">'+ACC.map(function(c){return '<button type="button" data-c="'+c+'" style="--c:'+c+'" aria-label="Màu '+c+'"></button>';}).join('')+'</div>'+
   '<div class="pf-er" id="pf-er" hidden></div><div class="pf-ft"><button class="pf-b" id="pf-cn" type="button">Huỷ</button><button class="pf-b pr" id="pf-sv" type="button">Lưu</button></div></div>';
  paint();
  var mo=box.querySelector('#pf-mo'),bio=box.querySelector('#pf-bio'),er=box.querySelector('#pf-er');
  function cnt(){box.querySelector('#pf-c1').textContent=mo.value.length+'/70';box.querySelector('#pf-c2').textContent=bio.value.length+'/240';}cnt();mo.oninput=bio.oninput=cnt;
  function fail(m){er.textContent=m;er.hidden=false;}
  box.querySelector('.pf-x').onclick=function(){view(p);};box.querySelector('#pf-cn').onclick=function(){view(p);};
  box.querySelector('#pf-up').onclick=function(){box.querySelector('#pf-file').click();};
  box.querySelector('#pf-file').onchange=function(){var f=this.files[0];this.value='';if(!f)return;if(!/^image\//.test(f.type))return fail('Chỉ chọn được tệp ảnh');shrink(f).then(function(d){st.avatar=d;st.preview=d;er.hidden=true;paint();}).catch(function(e){fail(e.message);});};
  box.querySelector('#pf-rm').onclick=function(){st.avatar=null;st.preview='';paint();};
  [].forEach.call(box.querySelectorAll('.pf-sw button'),function(b){b.onclick=function(){st.accent=b.dataset.c;paint();};});
  box.querySelector('#pf-sv').onclick=function(){var b=this;b.disabled=true;var pl={motto:mo.value,bio:bio.value,accent:st.accent};if(st.avatar!==undefined)pl.avatar=st.avatar;
    put(pl).then(function(){return get('/api/profile/'+p.id);}).then(function(np){document.dispatchEvent(new CustomEvent('profile-updated',{detail:np}));view(np);}).catch(function(e){b.disabled=false;fail(e.message);});};
}
function open(id){
  id=+id;if(!id)return;var box=shell();box.style.setProperty('--ac','#3b5bdb');box.innerHTML='<div class="pf-ld">Đang tải hồ sơ…</div>';
  get('/api/profile/'+id).then(function(p){if(ov)view(p);}).catch(function(e){if(ov)box.innerHTML='<div class="pf-ld">'+esc(e.message)+'<div class="pf-ft" style="justify-content:center"><button class="pf-b" id="pf-cl" type="button">Đóng</button></div></div>',box.querySelector('#pf-cl').onclick=close;});
}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-pf]');if(!t)return;e.preventDefault();e.stopPropagation();open(t.getAttribute('data-pf'));},true);
window.WebProfile={open:open,close:close,css:css};
css();
})();
