import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 70)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
patch('schema.sql', [[`body TEXT NOT NULL, mentions TEXT);`, `body TEXT NOT NULL, mentions TEXT, img TEXT);`]]);
fs.writeFileSync(W + 'migrate-chat-image.sql', `-- Chạy MỘT lần: wrangler d1 execute ssg-study --remote --file=migrate-chat-image.sql\nALTER TABLE chat_messages ADD COLUMN img TEXT;\n`);
patch('functions/_chat.js', [
  [`m.mentions,u.name,u.role FROM`, `m.mentions,(m.img IS NOT NULL) has_img,u.name,u.role FROM`],
  [`men: parseMen(r.mentions) })), me: user.id };`, `men: parseMen(r.mentions), img: !!r.has_img })), me: user.id };`],
  [`export async function handleChat(request, env, user, sub, readJson) {
  const m = request.method;`, `export async function handleChat(request, env, user, sub, readJson, arg) {
  const m = request.method;
  if (m === 'GET' && sub === 'img' && +arg) {   // ảnh trong tin nhắn (cần đăng nhập)
    const row = await env.DB.prepare('SELECT img FROM chat_messages WHERE id=?').bind(+arg).first();
    const mm = row && row.img && row.img.match(/^data:(image\\/(?:jpeg|png|webp));base64,([A-Za-z0-9+\\/=]+)$/);
    if (!mm) return bad('Không có ảnh', 404);
    const bin = Uint8Array.from(atob(mm[2]), ch => ch.charCodeAt(0));
    return new Response(bin, { headers: { 'content-type': mm[1], 'cache-control': 'private, max-age=86400', 'x-content-type-options': 'nosniff' } });
  }`],
  [`const body = clean(d.body); if (!body) return bad('Tin nhắn trống');`, `const body = clean(d.body); let img = null;
    if (d.image != null) { if (typeof d.image !== 'string' || d.image.length > 700000 || !/^data:image\\/(jpeg|png|webp);base64,[A-Za-z0-9+\\/=]+$/.test(d.image)) return bad('Ảnh không hợp lệ hoặc quá lớn (tối đa khoảng 500 KB)', 413); img = d.image; }
    if (!body && !img) return bad('Tin nhắn trống');`],
  [`'INSERT INTO chat_messages (ts,user_id,body,mentions) VALUES (?,?,?,?) RETURNING id').bind(now, user.id, body, men.length ? JSON.stringify(men) : null).first();`, `'INSERT INTO chat_messages (ts,user_id,body,mentions,img) VALUES (?,?,?,?,?) RETURNING id').bind(now, user.id, body, men.length ? JSON.stringify(men) : null, img).first();`],
  [`{ len: body.length, q: body.slice(0, 120), tag: men.map(x => x.name) }`, `{ len: body.length, q: body.slice(0, 120), tag: men.map(x => x.name), img: !!img }`],
]);
patch('functions/api/[[path]].js', [[`return handleChat(request, env, user, b, readJson);`, `return handleChat(request, env, user, b, readJson, c);`]]);
patch('public/chat.js', [
  // form: nút ảnh + xem trước
  [`'<form id="wc-form"><textarea id="wc-in"`, `'<div id="wc-pv" hidden></div><form id="wc-form"><button class="ib wc-imb" id="wc-imb" type="button" title="Gửi ảnh (cũng có thể dán Ctrl+V hoặc kéo thả vào khung)" aria-label="Gửi ảnh">'+ICON.img+'</button><input type="file" id="wc-imf" accept="image/*" hidden><textarea id="wc-in"`],
  [`x:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',`, `x:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
 img:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg>',`],
  // hiển thị ảnh trong bong bóng
  [`'<div class="wc-b">'+bodyHtml(m)+`, `'<div class="wc-b">'+(m.img?'<img class="wc-img" data-i="'+m.id+'" src="/api/chat/img/'+m.id+'" alt="Ảnh" loading="lazy">':'')+(m.body?'<div class="wc-tx">'+bodyHtml(m)+'</div>':'')+`],
  [`+esc(m.body)+'</span>';p.classList.add('on');`, `+esc(m.body||'Đã gửi một ảnh')+'</span>';p.classList.add('on');`],
  // gửi
  [`var i=$('#wc-in'),t=i.value.trim();if(!t||A.busy)return;`, `var i=$('#wc-in'),t=i.value.trim();if((!t&&!A.img)||A.busy)return;`],
  [`api('chat','POST',{body:t,mentions:men}).then(`, `var pl={body:t,mentions:men};if(A.img)pl.image=A.img;
  api('chat','POST',pl).then(`],
  [`i.value='';A.pend={};acHide();`, `i.value='';A.pend={};A.img=null;imgDraw();acHide();`],
  // thao tác chọn / dán / kéo thả + xem trước + phóng to
  [`function toggleOn(on){`, `/* ảnh trong chat: thu nhỏ trước khi gửi (tối đa ~450 KB) */
function imgShrink(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var s=Math.min(1,1280/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);var q=.82,d=c.toDataURL('image/jpeg',q);while(d.length>600000&&q>.35){q-=.1;d=c.toDataURL('image/jpeg',q);}if(d.length>650000){var s2=.6;c.width=Math.round(c.width*s2);c.height=Math.round(c.height*s2);x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);d=c.toDataURL('image/jpeg',.7);}if(d.length>650000)return rej(new Error('Ảnh quá lớn'));res(d);};im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('Không đọc được ảnh'));};im.src=u;});}
function imgDraw(){var p=$('#wc-pv');if(!p)return;if(!A.img){p.hidden=true;p.innerHTML='';return;}p.hidden=false;p.innerHTML='<span class="wc-pvi"><img src="'+A.img+'" alt="Ảnh sẽ gửi"><button type="button" id="wc-pvx" aria-label="Bỏ ảnh">'+ICON.x+'</button></span>';$('#wc-pvx').onclick=function(){A.img=null;imgDraw();};}
function imgPick(files){var f=[].filter.call(files||[],function(x){return /^image\\//.test(x.type);})[0];if(!f){var er=$('#wc-err');if(er){er.textContent='Chỉ gửi được tệp ảnh';er.hidden=false;}return;}
  imgShrink(f).then(function(d){A.img=d;var er=$('#wc-err');if(er)er.hidden=true;imgDraw();var i=$('#wc-in');if(i)i.focus();}).catch(function(e){var er=$('#wc-err');if(er){er.textContent=e.message;er.hidden=false;}});}
function lightbox(src){var o=document.createElement('div');o.id='wc-lb';o.innerHTML='<img src="'+src+'" alt="Ảnh"><button type="button" aria-label="Đóng">'+ICON.x+'</button>';document.body.appendChild(o);function close(){o.remove();document.removeEventListener('keydown',kd,true);}function kd(e){if(e.key==='Escape'){e.stopPropagation();close();}}document.addEventListener('keydown',kd,true);o.onclick=close;}
function toggleOn(on){`],
  [`  $('#wc-x').onclick=function(){toggle(false);};`, `  $('#wc-imb').onclick=function(){$('#wc-imf').click();};$('#wc-imf').onchange=function(){var f=this.files;imgPick(f);this.value='';};
  $('#wc-in').addEventListener('paste',function(e){var fs=[];[].forEach.call((e.clipboardData&&e.clipboardData.items)||[],function(it){if(it.kind==='file'){var f=it.getAsFile();if(f&&/^image\\//.test(f.type))fs.push(f);}});if(fs.length){e.preventDefault();imgPick(fs);}});
  var dz=$('#wc-panel'),hf=function(e){return e.dataTransfer&&[].indexOf.call(e.dataTransfer.types||[],'Files')>=0;};
  dz.addEventListener('dragover',function(e){if(hf(e)){e.preventDefault();dz.classList.add('wc-drop');}});dz.addEventListener('dragleave',function(e){if(!dz.contains(e.relatedTarget))dz.classList.remove('wc-drop');});dz.addEventListener('drop',function(e){if(hf(e)){e.preventDefault();dz.classList.remove('wc-drop');imgPick(e.dataTransfer.files);}});
  $('#wc-list').addEventListener('click',function(e){var im=e.target.closest&&e.target.closest('.wc-img');if(im)lightbox(im.getAttribute('src'));});
  $('#wc-x').onclick=function(){toggle(false);};`],
  [`.wc-onb{`, `.wc-imb{flex:none;align-self:flex-end;width:40px;height:40px}.wc-img{display:block;max-width:100%;max-height:260px;border-radius:10px;cursor:zoom-in;margin:0 0 4px;background:var(--panel2,#f6f7fb)}.wc-b .wc-tx{white-space:pre-wrap}.wc-b:has(.wc-img){padding:5px}.wc-b:has(.wc-img) .wc-tx{padding:2px 6px 3px}'+
'#wc-pv{padding:8px 10px 0;background:var(--panel,#fff)}#wc-pv[hidden]{display:none}.wc-pvi{position:relative;display:inline-block}.wc-pvi img{display:block;max-height:90px;max-width:160px;border-radius:10px;border:1px solid var(--line,#ddd)}.wc-pvi button{position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;border:1px solid var(--line,#ddd);background:var(--panel,#fff);color:var(--text,#111);cursor:pointer;display:grid;place-items:center;padding:0}.wc-pvi button svg{width:12px;height:12px}'+
'#wc-panel.wc-drop{outline:3px dashed var(--primary,#3b5bdb);outline-offset:-6px}#wc-lb{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:wcin .15s}#wc-lb img{max-width:94vw;max-height:92vh;border-radius:8px;box-shadow:0 10px 50px rgba(0,0,0,.6)}#wc-lb button{position:absolute;top:14px;right:14px;border:0;background:rgba(255,255,255,.15);color:#fff;width:38px;height:38px;border-radius:50%;cursor:pointer;display:grid;place-items:center}'+
'.wc-onb{`],
]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
