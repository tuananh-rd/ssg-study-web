import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 70)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
patch('schema.sql', [[`mentions TEXT, img TEXT);`, `mentions TEXT, img TEXT, reply_to INTEGER);`]]);
fs.writeFileSync(W + 'migrate-chat-reply.sql', `-- Chạy MỘT lần (sau migrate-chat-image.sql): wrangler d1 execute ssg-study --remote --file=migrate-chat-reply.sql\nALTER TABLE chat_messages ADD COLUMN reply_to INTEGER;\n`);
patch('functions/_chat.js', [
  [`const SEL = 'SELECT m.id,m.ts,m.user_id uid,m.body,m.mentions,(m.img IS NOT NULL) has_img,u.name,u.role FROM chat_messages m LEFT JOIN users u ON u.id=m.user_id';`,
   `const SEL = 'SELECT m.id,m.ts,m.user_id uid,m.body,m.mentions,(m.img IS NOT NULL) has_img,m.reply_to,rm.id rid,rm.body rbody,(rm.img IS NOT NULL) rimg,ru.name rname,u.name,u.role FROM chat_messages m LEFT JOIN users u ON u.id=m.user_id LEFT JOIN chat_messages rm ON rm.id=m.reply_to LEFT JOIN users ru ON ru.id=rm.user_id';`],
  [`const parseMen = s => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a.filter(x => x && x.id && x.name) : []; } catch { return []; } };`,
   `const parseMen = s => { try { const a = JSON.parse(s || '[]'); return Array.isArray(a) ? a.filter(x => x && x.id != null && x.name) : []; } catch { return []; } };`],
  [`men: parseMen(r.mentions), img: !!r.has_img })), me: user.id };`, `men: parseMen(r.mentions), img: !!r.has_img, re: r.reply_to ? { id: r.reply_to, gone: r.rid == null, name: r.rname || '', body: (r.rbody || '').slice(0, 100), img: !!r.rimg } : null })), me: user.id };`],
  [`    const r = await env.DB.prepare('INSERT INTO chat_messages (ts,user_id,body,mentions,img) VALUES (?,?,?,?,?) RETURNING id').bind(now, user.id, body, men.length ? JSON.stringify(men) : null, img).first();`,
   `    // @all: nhắc tất cả mọi người (các máy khách tự nhận biết qua id 0)
    if (/(^|\\s)@all(?![\\p{L}\\p{N}_])/iu.test(body)) men.push({ id: 0, name: 'all' });
    // trả lời một tin: người được trả lời cũng được báo
    let replyTo = null;
    if (+d.reply_to > 0) {
      const tgt = await env.DB.prepare('SELECT m.id,m.user_id,u.name,u.status FROM chat_messages m LEFT JOIN users u ON u.id=m.user_id WHERE m.id=?').bind(+d.reply_to).first();
      if (tgt) { replyTo = tgt.id; if (tgt.user_id !== user.id && tgt.status === 'active' && !men.some(x => x.id === tgt.user_id)) men.push({ id: tgt.user_id, name: tgt.name, rep: 1 }); }
    }
    const r = await env.DB.prepare('INSERT INTO chat_messages (ts,user_id,body,mentions,img,reply_to) VALUES (?,?,?,?,?,?) RETURNING id').bind(now, user.id, body, men.length ? JSON.stringify(men) : null, img, replyTo).first();`],
  [`img: !!img }`, `img: !!img, reply: replyTo, all: men.some(x => x.id === 0) }`],
]);
patch('public/chat.js', [
  // hiển thị @all
  [`function bodyHtml(m){var h=esc(m.body);`, `function mentionsMe(m){return !!(m.men&&ME&&m.men.some(function(x){return x.id===ME.id||x.id===0;}));}
function mentionsPersonal(m){return !!(m.men&&ME&&m.men.some(function(x){return x.id===ME.id;}));}
function bodyHtml(m){var h=esc(m.body).replace(/(^|\\s)@all(?![\\wÀ-ỹ])/gi,'$1<span class="wc-men all">@all</span>');`],
  // báo: tag cá nhân / trả lời bỏ qua tắt thông báo; @all tôn trọng tắt thông báo
  [`var tm=others.filter(mentionsMe);if(tm.length){var f=$('#wc-fab');if(f)f.classList.add('tagged');showPrev(tm[tm.length-1],true);}else showPrev(others[others.length-1]);}`,
   `var tp=others.filter(mentionsPersonal),ta=others.filter(mentionsMe);if(ta.length){var f=$('#wc-fab');if(f)f.classList.add('tagged');}if(tp.length)showPrev(tp[tp.length-1],true);else showPrev(others[others.length-1]);}`],
  [`(forced?' <i>nhắc đến bạn</i>':'')`, `(forced?' <i>'+((m.men||[]).some(function(x){return x.id===(ME&&ME.id)&&x.rep;})?'trả lời bạn':'nhắc đến bạn')+'</i>':'')`],
  // bong bóng: trích dẫn + nút trả lời
  [`+'" data-id="'+m.id+'">'+(first?`, `+'" data-id="'+m.id+'">'+(first?`],
  [`'<div class="wc-b">'+(m.img?`, `'<div class="wc-b">'+(m.re?'<div class="wc-quote'+(m.re.gone?' gone':'')+'" data-go="'+m.re.id+'"><b>'+esc(m.re.gone?'Tin đã xoá':(m.re.name||''))+'</b><span>'+esc(m.re.gone?'':(m.re.body||(m.re.img?'Ảnh':'')))+'</span></div>':'')+(m.img?`],
  [`(canDel?'<button class="wc-del" type="button"`, `'<button class="wc-rep" type="button" data-r="'+m.id+'" title="Trả lời tin nhắn này" aria-label="Trả lời">'+ICON.reply+'</button>'+(canDel?'<button class="wc-del" type="button"`],
  [` img:'<svg viewBox="0 0 24 24" width="20"`, ` reply:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/></svg>',
 img:'<svg viewBox="0 0 24 24" width="20"`],
  // thanh "đang trả lời"
  [`'<div id="wc-pv" hidden></div>`, `'<div id="wc-rp" hidden></div><div id="wc-pv" hidden></div>`],
  [`function imgDraw(){`, `function replyDraw(){var p=$('#wc-rp');if(!p)return;if(!A.reply){p.hidden=true;p.innerHTML='';return;}p.hidden=false;p.innerHTML='<span class="wc-rpi"><b>Trả lời '+esc(A.reply.name)+'</b><span>'+esc(A.reply.body||'Ảnh')+'</span></span><button type="button" id="wc-rpx" aria-label="Bỏ trả lời">'+ICON.x+'</button>';$('#wc-rpx').onclick=function(){A.reply=null;replyDraw();};}
function replyTo(id){var m=A.msgs.filter(function(x){return x.id===id;})[0];if(!m)return;A.reply={id:id,name:m.name,body:(m.body||'').slice(0,80)};replyDraw();var i=$('#wc-in');if(i)i.focus();}
function goMsg(id){var l=$('#wc-list'),e=l&&l.querySelector('.wc-m[data-id="'+id+'"]');if(!e)return;e.scrollIntoView({block:'center',behavior:'smooth'});e.classList.add('flash');setTimeout(function(){e.classList.remove('flash');},1600);}
function imgDraw(){`],
  [`  $('#wc-list').addEventListener('click',function(e){var im=e.target.closest&&e.target.closest('.wc-img');if(im)lightbox(im.getAttribute('src'));});`, `  $('#wc-list').addEventListener('click',function(e){var t=e.target;var im=t.closest&&t.closest('.wc-img');if(im){lightbox(im.getAttribute('src'));return;}var rb=t.closest&&t.closest('[data-r]');if(rb){replyTo(+rb.dataset.r);return;}var q=t.closest&&t.closest('.wc-quote');if(q&&!q.classList.contains('gone'))goMsg(+q.dataset.go);});`],
  // gửi kèm reply_to
  [`var pl={body:t,mentions:men};if(A.img)pl.image=A.img;`, `var pl={body:t,mentions:men};if(A.img)pl.image=A.img;if(A.reply)pl.reply_to=A.reply.id;`],
  [`A.pend={};A.img=null;imgDraw();acHide();`, `A.pend={};A.img=null;A.reply=null;imgDraw();replyDraw();acHide();`],
  // gợi ý @all
  [`  api('chat/users?q='+encodeURIComponent(t2.q)).then(function(j){if(!j.users)return;A.ac=j.users;`, `  api('chat/users?q='+encodeURIComponent(t2.q)).then(function(j){if(!j.users)return;var us=j.users.slice();if('all'.indexOf(t2.q.toLowerCase())===0)us.unshift({id:0,name:'all',role:'user',all:true});A.ac=us;`],
  [`function acPick(u){var t=acToken(),i=$('#wc-in');if(!t||!u)return;var ins='@'+u.name+' ';`, `function acPick(u){var t=acToken(),i=$('#wc-in');if(!t||!u)return;var ins='@'+u.name+' ';if(u.all){i.value=i.value.slice(0,t.start)+ins+i.value.slice(t.end);var pp=t.start+ins.length;i.setSelectionRange(pp,pp);i.focus();acHide();i.dispatchEvent(new Event('input'));return;}`],
  [`<span class="wc-on-n">'+nameHtml(u)+'</span></button>';}).join('');`, `<span class="wc-on-n">'+(u.all?'<b>@all</b> <small style="opacity:.7">nhắc tất cả mọi người</small>':nameHtml(u))+'</span></button>';}).join('');`],
  [`.wc-onb{`, `.wc-men.all{background:rgba(245,159,0,.22);color:#b45309}.wc-m.me .wc-men.all{color:#fff;background:rgba(255,255,255,.3)}'+
'.wc-rep{position:absolute;top:-9px;right:22px;width:22px;height:22px;border-radius:50%;border:1px solid var(--line,#ddd);background:var(--panel,#fff);color:var(--muted,#667);cursor:pointer;display:none;place-items:center;padding:0}.wc-m:hover .wc-rep{display:grid}.wc-rep:hover{color:var(--primary,#3b5bdb)}.wc-m:not(.me) .wc-del{right:-6px}@media(max-width:760px){.wc-rep{display:grid}}'+
'.wc-quote{border-left:3px solid var(--primary,#3b5bdb);background:rgba(127,127,127,.12);border-radius:6px;padding:3px 8px;margin:0 0 5px;cursor:pointer;font-size:.78rem;line-height:1.35;overflow:hidden}.wc-quote b{display:block}.wc-quote span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.85}.wc-quote.gone{opacity:.6;cursor:default;font-style:italic}.wc-m.me .wc-quote{border-left-color:rgba(255,255,255,.7);background:rgba(255,255,255,.18)}'+
'#wc-rp{display:flex;align-items:center;gap:8px;padding:6px 10px 0;background:var(--panel,#fff)}#wc-rp[hidden]{display:none}.wc-rpi{flex:1;min-width:0;border-left:3px solid var(--primary,#3b5bdb);padding:2px 8px;font-size:.8rem;background:var(--panel2,#f6f7fb);border-radius:6px}.wc-rpi b,.wc-rpi span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#wc-rp button{border:0;background:none;color:var(--muted,#667);cursor:pointer;display:grid;place-items:center;padding:4px}'+
'.wc-m.flash .wc-b{animation:wcflash 1.5s}@keyframes wcflash{0%,60%{box-shadow:0 0 0 3px rgba(59,91,219,.55)}100%{box-shadow:none}}'+
'.wc-onb{`],
]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
