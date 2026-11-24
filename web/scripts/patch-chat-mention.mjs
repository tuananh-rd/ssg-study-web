import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 70)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
patch('public/chat.js', [
  // hiển thị: tô sáng @tên; tin nhắc tới mình được nổi bật
  [`'<div class="wc-b">'+esc(m.body)+`, `'<div class="wc-b">'+bodyHtml(m)+`],
  [`'<div class="wc-m '+(me?'me ':'')+`, `'<div class="wc-m '+(!me&&mentionsMe(m)?'men-me ':'')+(me?'me ':'')+`],
  [`function showPrev(m){if(A.muted||A.panelOpen)return;var p=$('#wc-prev');p.innerHTML='<b>'+esc(m.name)+`, `function mentionsMe(m){return !!(m.men&&ME&&m.men.some(function(x){return x.id===ME.id;}));}
function bodyHtml(m){var h=esc(m.body);(m.men||[]).forEach(function(x){var t=esc('@'+x.name);h=h.split(t).join('<span class="wc-men'+(ME&&x.id===ME.id?' me':'')+'">'+t+'</span>');});return h;}
function showPrev(m,forced){if((A.muted&&!forced)||A.panelOpen)return;var p=$('#wc-prev');p.innerHTML='<b>'+esc(m.name)+(forced?' <i>nhắc đến bạn</i>':'')+`],
  [`  if(others.length&&!(visible&&atEnd())){A.unread+=others.length;badge();showPrev(others[others.length-1]);}`, `  if(others.length&&!(visible&&atEnd())){A.unread+=others.length;badge();var tm=others.filter(mentionsMe);if(tm.length){var f=$('#wc-fab');if(f)f.classList.add('tagged');showPrev(tm[tm.length-1],true);}else showPrev(others[others.length-1]);}`],
  [`function markRead(){if(!A.panelOpen||document.visibilityState!=='visible')return;`, `function markRead(){if(!A.panelOpen||document.visibilityState!=='visible')return;var tf=$('#wc-fab');if(tf)tf.classList.remove('tagged');`],
  // gửi kèm danh sách người được tag
  [`  api('chat','POST',{body:t}).then(`, `  var men=Object.keys(A.pend||{}).filter(function(id){return t.indexOf('@'+A.pend[id])>=0;}).map(Number);
  api('chat','POST',{body:t,mentions:men}).then(`],
  [`if(j.error){er.textContent=j.error;er.hidden=false;return;}i.value='';`, `if(j.error){er.textContent=j.error;er.hidden=false;return;}i.value='';A.pend={};acHide();`],
  // gợi ý khi gõ @
  [`  $('#wc-form').onsubmit=function(e){e.preventDefault();send();};`, `  $('#wc-form').onsubmit=function(e){e.preventDefault();send();};
  inp.addEventListener('input',acUpdate);inp.addEventListener('click',acUpdate);
  inp.addEventListener('keydown',function(e){if(!A.ac||!A.ac.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();A.acI=(A.acI+(e.key==='ArrowDown'?1:-1)+A.ac.length)%A.ac.length;acDraw();}else if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();acPick(A.ac[A.acI]);}else if(e.key==='Escape'){e.stopPropagation();acHide();}},true);`],
  [`<div class="wc-err" id="wc-err" hidden></div>`, `<div id="wc-ac" hidden></div><div class="wc-err" id="wc-err" hidden></div>`],
  [`function toggleOn(on){`, `/* gợi ý @tên */
function acToken(){var i=$('#wc-in');if(!i)return null;var pos=i.selectionStart,m=i.value.slice(0,pos).match(/(^|\\s)@([^\\s@]{0,24})$/);return m?{q:m[2],start:pos-m[2].length-1,end:pos}:null;}
function acHide(){A.ac=[];var e=$('#wc-ac');if(e)e.hidden=true;}
function acDraw(){var e=$('#wc-ac');if(!e)return;if(!A.ac||!A.ac.length){e.hidden=true;return;}e.hidden=false;
  e.innerHTML=A.ac.map(function(u,k){return '<button type="button" class="wc-aci'+(k===A.acI?' on':'')+'" data-k="'+k+'"><span class="wc-av sm" style="background:hsl('+hue(u.name)+',55%,45%)">'+esc(u.name.trim().charAt(0).toUpperCase()||'?')+(u.on?'<i class="wc-dot sm"></i>':'')+'</span><span class="wc-on-n">'+nameHtml(u)+'</span></button>';}).join('');
  [].forEach.call(e.querySelectorAll('.wc-aci'),function(b){b.onmousedown=function(ev){ev.preventDefault();acPick(A.ac[+b.dataset.k]);};});}
function acUpdate(){var t=acToken();if(!t){acHide();return;}clearTimeout(A.acT);A.acT=setTimeout(function(){var t2=acToken();if(!t2)return;
  api('chat/users?q='+encodeURIComponent(t2.q)).then(function(j){if(!j.users)return;A.ac=j.users;A.acI=0;acDraw();}).catch(function(){});},120);}
function acPick(u){var t=acToken(),i=$('#wc-in');if(!t||!u)return;var ins='@'+u.name+' ';i.value=i.value.slice(0,t.start)+ins+i.value.slice(t.end);var p=t.start+ins.length;i.setSelectionRange(p,p);i.focus();
  A.pend=A.pend||{};A.pend[u.id]=u.name;acHide();i.dispatchEvent(new Event('input'));}
function toggleOn(on){`],
  [`.wc-onb{`, `#wc-ac{border-top:1px solid var(--line,#ddd);background:var(--panel,#fff);max-height:200px;overflow-y:auto;padding:4px}#wc-ac[hidden]{display:none}.wc-aci{display:flex;align-items:center;gap:8px;width:100%;border:0;background:none;color:var(--text,#111);padding:6px 8px;border-radius:8px;cursor:pointer;text-align:left;font:inherit}.wc-aci.on,.wc-aci:hover{background:var(--panel2,#f6f7fb)}.wc-av.sm{width:26px;height:26px;font-size:.8rem}'+
'.wc-men{font-weight:700;color:var(--primary,#3b5bdb);background:color-mix(in srgb,var(--primary,#3b5bdb) 12%,transparent);border-radius:5px;padding:0 3px}.wc-m.me .wc-men{color:inherit;background:rgba(255,255,255,.25)}.wc-men.me{background:rgba(245,159,0,.25);color:#b45309}.wc-m.men-me .wc-b{border-color:#f59f00;box-shadow:0 0 0 2px rgba(245,159,0,.3)}'+
'#wc-fab.tagged::before{content:"@";position:absolute;left:-4px;top:-4px;width:20px;height:20px;border-radius:50%;background:#f59f00;color:#fff;font:800 .8rem/20px system-ui,sans-serif;text-align:center;border:2px solid var(--panel,#fff);box-sizing:content-box}'+
'.wc-onb{`],
]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
