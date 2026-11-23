import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/src/';
let a = fs.readFileSync(W + 'ai.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };

// 1) nút "Hỏi AI" trong popup dịch
rep('foot', `<button class="btn sm" id="trCopy">Chép</button>`, `<button class="btn sm" id="trAsk">Hỏi AI</button><button class="btn sm" id="trCopy">Chép</button>`);
rep('askbind', `  $('#trClose',trPop).onclick=trHidePop;`, `  $('#trClose',trPop).onclick=trHidePop;
  $('#trAsk',trPop).onclick=function(){var t=trPop._text;trHidePop();dockOpen(t,'Giải thích đoạn này giúp tôi (nghĩa, ý chính và ví dụ nếu cần).');};`);

// 2) chọn chữ: tiếng Việt / đoạn dài -> nút Hỏi AI
rep('sel', `    if(!/[A-Za-z]{2}/.test(text)||/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)||text.length>1500)return;`,
`    if(host.closest('.dock'))return;
    var viet=/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    if(text.length>=3&&(viet||text.length>1500)&&text.length<=3000){askPopShow(text,range.getBoundingClientRect());return;}
    if(!/[A-Za-z]{2}/.test(text)||viet||text.length>1500)return;`);
rep('hide', `document.addEventListener('mousedown',function(e){if(trPop&&!e.target.closest('.tr-pop'))trHidePop();});`,
`document.addEventListener('mousedown',function(e){if(trPop&&!e.target.closest('.tr-pop'))trHidePop();if(askPop&&!e.target.closest('.ask-pop'))askPopHide();});`);
rep('scroll', `window.addEventListener('scroll',function(){if(trPop)trHidePop();},{passive:true});`, `window.addEventListener('scroll',function(){if(trPop)trHidePop();if(askPop)askPopHide();},{passive:true});`);
rep('trHide', `function trHidePop(){if(trPop){trPop.remove();trPop=null;}trSeq++;}`, `function trHidePop(){if(trPop){trPop.remove();trPop=null;}trSeq++;}
var askPop=null;
function askPopHide(){if(askPop){askPop.remove();askPop=null;}}
function askPopShow(text,rect){
  askPopHide();trHidePop();
  askPop=document.createElement('div');askPop.className='ask-pop';
  askPop.innerHTML='<button class="btn sm primary" type="button">'+ic('spark')+' Hỏi AI về đoạn này</button>';
  document.body.appendChild(askPop);
  var w=askPop.offsetWidth,top=rect.bottom+8;if(top+44>window.innerHeight)top=Math.max(8,rect.top-46);
  askPop.style.top=top+'px';askPop.style.left=Math.min(Math.max(8,rect.left),window.innerWidth-w-8)+'px';
  askPop.querySelector('button').onclick=function(){askPopHide();dockOpen(text,'Giải thích đoạn này giúp tôi một cách dễ hiểu.');};
}`);

// 3) khung chat góc phải
a += `
// ===== Khung chat ở góc: hỏi nhanh theo mục đang đọc =====
var dock={open:false,quote:'',ctxKey:'',el:null,fab:null,chat:aiChat('dock')};
function dockContext(){
  var m=(location.hash.match(/#\\/learn\\/([^?\\/]+)/)||[])[1],mod=m&&MOD[m];
  if(!mod)return {key:'',label:'',text:''};
  var secs=[].slice.call(document.querySelectorAll('.lesson .sec')),cur=null;
  secs.forEach(function(s){if(s.getBoundingClientRect().top<innerHeight*0.45)cur=s;});
  var sec=cur&&mod.sections.filter(function(x){return 's-'+x.id===cur.id;})[0];
  function plain(h){var d=document.createElement('div');d.innerHTML=h.replace(/<\\/(li|p|tr|h\\d)>/g,'\\n</$1>');return d.textContent.replace(/\\n\\s*\\n+/g,'\\n').trim();}
  if(sec)return {key:mod.id+'/'+sec.id,label:'chương "'+mod.title+'", mục '+sec.id+' '+sec.t,text:plain(sec.h).slice(0,6000)};
  return {key:mod.id,label:'chương "'+mod.title+'"',text:mod.sections.map(function(s){return s.id+' '+s.t+'\\n'+plain(s.h);}).join('\\n\\n').slice(0,6000)};
}
function dockBuild(){
  if(dock.el)return;
  dock.fab=document.createElement('button');dock.fab.type='button';dock.fab.className='dock-fab';dock.fab.setAttribute('aria-label','Mở trợ giảng AI');
  dock.fab.innerHTML=ic('spark')+'<span>Hỏi AI</span>';dock.fab.onclick=function(){dockToggle();};
  dock.el=document.createElement('aside');dock.el.className='dock';dock.el.setAttribute('aria-label','Trợ giảng AI');
  dock.el.innerHTML='<div class="dk-head"><div><b>Trợ giảng AI</b><div class="small muted" id="dkCtx"></div></div><div class="row" style="gap:6px"><button class="iconbtn sm" id="dkClr" type="button" title="Xoá hội thoại" aria-label="Xoá hội thoại">'+ic('trash')+'</button><button class="iconbtn sm" id="dkX" type="button" title="Đóng" aria-label="Đóng">'+ic('close')+'</button></div></div>'+
    '<div class="dk-log" id="dkLog"></div>'+
    '<div class="dk-foot"><div id="dkQuote"></div><div id="dkChips" class="dk-chips"></div><form id="dkForm" class="dk-form"><textarea id="dkIn" rows="1" placeholder="Hỏi về nội dung đang đọc…" aria-label="Câu hỏi"></textarea><button class="btn primary" type="submit" aria-label="Gửi">'+ic('arrow')+'</button></form></div>';
  document.body.appendChild(dock.fab);document.body.appendChild(dock.el);
  var c=dock.chat;c.view=dockDraw;
  $('#dkX',dock.el).onclick=function(){dockToggle(false);};
  $('#dkClr',dock.el).onclick=function(){if(c.ctrl)try{c.ctrl.abort();}catch(e){}c.msgs=[];c.err=null;c.busy=false;dock.ctxKey='';dock.quote='';dockDraw();};
  $('#dkForm',dock.el).onsubmit=function(e){e.preventDefault();var t=$('#dkIn',dock.el);var q=t.value.trim();if(!q||c.busy)return;t.value='';t.style.height='';dockSend(q);};
  $('#dkIn',dock.el).addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#dkForm',dock.el).requestSubmit();}});
  $('#dkIn',dock.el).addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});
  dockDraw();
}
function dockSend(q){
  var c=dock.chat,ctx=dockContext(),text=q;
  if(!c.msgs.length||dock.ctxKey!==ctx.key||dock.quote){
    text='Trả lời bằng tiếng Việt, ngắn gọn, đúng trọng tâm, giữ nguyên thuật ngữ tiếng Anh.'+(ctx.text?'\\n\\n[Tài liệu môn '+SJ.name+' — '+ctx.label+']\\n'+ctx.text:'')+(dock.quote?'\\n\\n[Đoạn sinh viên bôi đen]\\n"'+dock.quote+'"':'')+'\\n\\n[Câu hỏi]\\n'+q;
    dock.ctxKey=ctx.key;
  }
  dock.quote='';aiAsk(c,text,q,true);dockDraw();
}
function dockDraw(){
  if(!dock.el)return;var c=dock.chat,ctx=dockContext();
  $('#dkCtx',dock.el).textContent=ctx.label?'Đang đọc: '+(ctx.label.length>70?ctx.label.slice(0,68)+'…':ctx.label):'Hỏi bất kỳ điều gì về môn '+SJ.name;
  var log=$('#dkLog',dock.el),nearEnd=log.scrollHeight-log.scrollTop-log.clientHeight<80,h='';
  if(!c.msgs.length&&!c.busy)h='<div class="dk-empty"><p><b>Hỏi ngay khi chưa hiểu.</b></p><p>Bôi đen một đoạn trong bài để hỏi riêng về đoạn đó, hoặc gõ câu hỏi về mục đang đọc.</p></div>';
  c.msgs.forEach(function(m){h+=m.role==='user'?'<div class="dk-u"><div>'+esc(m.shown||'')+'</div></div>':'<div class="dk-a">'+mdLite(m.shown||'')+'</div>';});
  if(c.busy)h+='<div class="dk-a">'+(c.partial?mdLite(c.partial):'<span class="typing"><i></i><i></i><i></i></span>')+'</div>';
  if(c.err)h+='<div class="dk-a ai-err">'+esc(c.err)+(c.retry?' <button class="btn sm" id="dkRetry" type="button">Thử lại</button>':'')+'</div>';
  log.innerHTML=h;if(nearEnd||c.busy)log.scrollTop=log.scrollHeight;
  var r=$('#dkRetry',log);if(r)r.onclick=function(){var x=c.retry;c.retry=null;c.err=null;if(x)aiAsk(c,x.text,x.shown,true);};
  $('#dkQuote',dock.el).innerHTML=dock.quote?'<div class="dk-quote"><span>“'+esc(dock.quote.length>140?dock.quote.slice(0,138)+'…':dock.quote)+'”</span><button type="button" id="dkQx" aria-label="Bỏ đoạn đã chọn">'+ic('close')+'</button></div>':'';
  var qx=$('#dkQx',dock.el);if(qx)qx.onclick=function(){dock.quote='';dockDraw();};
  var chips=ctx.key&&!c.msgs.length?['Tóm tắt mục này','Cho ví dụ dễ nhớ','Những ý nào hay ra thi?']:[];
  $('#dkChips',dock.el).innerHTML=chips.map(function(t,i){return '<button type="button" class="chip" data-i="'+i+'">'+esc(t)+'</button>';}).join('');
  $$('#dkChips .chip',dock.el).forEach(function(b){b.onclick=function(){if(!c.busy)dockSend(chips[+b.dataset.i]);};});
}
function dockToggle(on){
  dockBuild();dock.open=on===undefined?!dock.open:!!on;
  dock.el.classList.toggle('open',dock.open);document.body.classList.toggle('dock-open',dock.open);
  if(dock.open){dockDraw();setTimeout(function(){var t=$('#dkIn',dock.el);if(t)t.focus();},60);}
}
function dockOpen(quote,autoQ){
  dockBuild();dock.quote=quote||'';dockToggle(true);
  if(autoQ&&!dock.chat.busy)dockSend(autoQ);else dockDraw();
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dock.open)dockToggle(false);});
window.addEventListener('hashchange',function(){if(dock.open)setTimeout(dockDraw,50);});
dockBuild();
`;
fs.writeFileSync(W + 'ai.js', a);

fs.appendFileSync(W + 'style.css', `
/* ===== Khung chat ở góc ===== */
.dock-fab{position:fixed;right:18px;bottom:20px;z-index:50;display:inline-flex;align-items:center;gap:8px;padding:12px 18px;border-radius:999px;border:0;background:var(--primary);color:var(--primary-ink);font:600 .95rem system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 20px rgba(15,23,42,.25)}
.dock-fab:hover{background:var(--primary-2)}
body.dock-open .dock-fab{display:none}
.dock{position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);z-index:70;display:flex;flex-direction:column;background:var(--panel);border-left:1px solid var(--line);box-shadow:-8px 0 30px rgba(15,23,42,.15);transform:translateX(105%);transition:transform .2s ease;visibility:hidden}
.dock.open{transform:none;visibility:visible}
.dk-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line)}
.dk-head .small{max-width:260px;line-height:1.4;margin-top:2px}
.dk-log{flex:1;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
.dk-empty{color:var(--muted);font-size:.93rem;line-height:1.6}.dk-empty p{margin:.3em 0}
.dk-u{display:flex;justify-content:flex-end}.dk-u div{max-width:88%;background:var(--primary);color:var(--primary-ink);padding:9px 13px;border-radius:14px 14px 4px 14px;white-space:pre-wrap;line-height:1.5}
.dk-a{background:var(--panel2);padding:10px 14px;border-radius:14px 14px 14px 4px;line-height:1.6;font-size:.95rem;max-width:96%;overflow-wrap:anywhere}
.dk-a p{margin:.4em 0}.dk-a ul,.dk-a ol{margin:.4em 0;padding-left:1.3em}
.dk-foot{border-top:1px solid var(--line);padding:10px 12px;display:grid;gap:8px}
.dk-chips{display:flex;flex-wrap:wrap;gap:6px}.dk-chips:empty{display:none}
.dk-chips .chip{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:5px 12px;font-size:.84rem;cursor:pointer}.dk-chips .chip:hover{background:var(--primary-soft)}
.dk-quote{display:flex;gap:8px;align-items:flex-start;background:var(--primary-soft);border-left:3px solid var(--primary);border-radius:8px;padding:7px 10px;font-size:.85rem;line-height:1.45}
.dk-quote span{flex:1}.dk-quote button{border:0;background:none;color:var(--muted);cursor:pointer;padding:0;display:inline-flex}
.dk-form{display:flex;gap:8px;align-items:flex-end}
.dk-form textarea{flex:1;resize:none;font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel);color:var(--text);max-height:120px}
.dk-form .btn{min-height:42px;width:46px;padding:0}
.ask-pop{position:fixed;z-index:80;box-shadow:0 6px 20px rgba(15,23,42,.25);border-radius:10px}
.tr-pop-foot .btn{white-space:nowrap}
@media(min-width:1100px){body.dock-open #content{margin-right:min(420px,100vw)}}
@media(max-width:760px){.dock-fab{bottom:78px;right:14px;padding:11px 15px}.dock-fab span{display:none}.dock{width:100vw}}
`);
console.log(miss.length ? 'THIẾU ' + miss : 'ok');
