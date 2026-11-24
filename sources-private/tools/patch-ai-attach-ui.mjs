import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/ai.js', 'utf8'); const miss = [];
const rep = (o, n) => { if (!a.includes(o)) miss.push(o.slice(0, 70)); else a = a.replace(o, () => n); };

// 1. gói tin gửi lên: ảnh đi kèm (chỉ giữ ảnh của 2 tin gần nhất để nhẹ), tệp văn bản đã nằm sẵn trong nội dung
rep(`function aiRequest(chat,opts){`, `/* ---- đính kèm ảnh / tệp ---- */
var ATT_MAX_IMG=4,ATT_FILE_CHARS=60000,ATT_PDF_PAGES=60;
function attRecent(chat){var idx=[];chat.msgs.forEach(function(m,i){if(m.role==='user'&&m.imgs&&m.imgs.length)idx.push(i);});return idx.slice(-2);}
function attContent(chat,m,i,mode){
  var text=typeof m.content==='string'?m.content:blocksText(m.content);
  if(m.role!=='user'||!m.imgs||!m.imgs.length)return mode==='anthropic'?m.content:text;
  if(attRecent(chat).indexOf(i)<0)return (mode==='anthropic'?[{type:'text',text:text+'\\n[Người dùng đã gửi '+m.imgs.length+' ảnh ở lượt trước]'}]:text+'\\n[Người dùng đã gửi '+m.imgs.length+' ảnh ở lượt trước]');
  if(mode==='anthropic')return m.imgs.map(function(u){return {type:'image',source:{type:'base64',media_type:'image/jpeg',data:u.split(',')[1]}};}).concat([{type:'text',text:text}]);
  return [{type:'text',text:text}].concat(m.imgs.map(function(u){return {type:'image_url',image_url:{url:u}};}));
}
function aiRequest(chat,opts){`);
rep(`messages:[{role:'system',content:system}].concat(chat.msgs.map(function(m){return {role:m.role,content:typeof m.content==='string'?m.content:blocksText(m.content)};}))}};
  if(p==='openai')`, `messages:[{role:'system',content:system}].concat(chat.msgs.map(function(m,i){return {role:m.role,content:attContent(chat,m,i,'openai')};}))}};
  if(p==='openai')`);
rep(`body:{model:model,stream:true,messages:[{role:'system',content:system}].concat(chat.msgs.map(function(m){return {role:m.role,content:typeof m.content==='string'?m.content:blocksText(m.content)};}))}};`, `body:{model:model,stream:true,messages:[{role:'system',content:system}].concat(chat.msgs.map(function(m,i){return {role:m.role,content:attContent(chat,m,i,'openai')};}))}};`);
rep(`messages:chat.msgs.map(function(m){return {role:m.role,content:m.content};})};`, `messages:chat.msgs.map(function(m,i){return {role:m.role,content:attContent(chat,m,i,'anthropic')};})};`);

// 2. aiAsk lấy tệp đính kèm đang chờ của khung chat
rep(`  chat.msgs.push({role:'user',content:text,shown:shown});chat.busy=true;chat.err=null;chat.partial='';if(chat.view)chat.view();`, `  var att=(chat.att||[]).slice();chat.att=[];
  var fileTxt=att.filter(function(x){return x.kind==='file';}).map(function(x){return '\\n\\n[Tệp đính kèm: '+x.name+(x.note?' — '+x.note:'')+']\\n\`\`\`\\n'+x.text+'\\n\`\`\`';}).join('');
  var imgs=att.filter(function(x){return x.kind==='img';}).map(function(x){return x.url;});
  chat.msgs.push({role:'user',content:text+fileTxt,shown:shown,imgs:imgs,att:att.map(function(x){return {kind:x.kind,name:x.name,url:x.kind==='img'?x.url:null,note:x.note||''};})});chat.busy=true;chat.err=null;chat.partial='';if(chat.attView)chat.attView();if(chat.view)chat.view();`);
rep(`chat.msgs.pop();chat.err=aiErrText(e);`, `chat.msgs.pop();chat.att=att.concat(chat.att||[]);chat.err=aiErrText(e);`);

// 3. đọc tệp: ảnh (thu nhỏ), văn bản/mã nguồn, PDF
rep(`function aiRequest(chat,opts){`, `var ATT_TEXT_RE=/\\.(txt|md|markdown|csv|tsv|json|jsonl|xml|html?|css|js|jsx|ts|tsx|py|ipynb|java|c|h|cpp|hpp|cs|go|rs|rb|php|sh|bat|ps1|sql|r|m|yaml|yml|toml|ini|cfg|log|tex|rtf)$/i;
function attImage(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){
  var s=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));
  var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);
  var q=.85,d=c.toDataURL('image/jpeg',q);while(d.length>1600000&&q>.35){q-=.1;d=c.toDataURL('image/jpeg',q);}
  if(d.length>1750000)return rej(new Error('Ảnh quá lớn, hãy chụp lại nhỏ hơn'));res({kind:'img',name:file.name||'ảnh',url:d});};
  im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('Không đọc được ảnh '+(file.name||'')));};im.src=u;});}
function attPdfLib(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);if(attPdfLib.p)return attPdfLib.p;
  attPdfLib.p=new Promise(function(res,rej){var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=function(){window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';res(window.pdfjsLib);};s.onerror=function(){attPdfLib.p=null;rej(new Error('Không tải được bộ đọc PDF'));};document.head.appendChild(s);});return attPdfLib.p;}
async function attPdf(file){
  var lib=await attPdfLib(),pdf=await lib.getDocument({data:await file.arrayBuffer()}).promise,out=[],n=Math.min(pdf.numPages,ATT_PDF_PAGES),len=0;
  for(var p=1;p<=n&&len<ATT_FILE_CHARS;p++){var pg=await pdf.getPage(p),tc=await pg.getTextContent(),t=tc.items.map(function(i){return i.str;}).join(' ').replace(/\\s+/g,' ').trim();if(t){out.push('--- Trang '+p+' ---\\n'+t);len+=t.length;}}
  var txt=out.join('\\n\\n');if(!txt.trim())throw new Error('PDF "'+file.name+'" là ảnh scan, không có chữ để đọc. Hãy chụp từng trang rồi gửi dạng ảnh.');
  var cut=txt.length>ATT_FILE_CHARS;return {kind:'file',name:file.name,text:cut?txt.slice(0,ATT_FILE_CHARS):txt,note:'PDF '+pdf.numPages+' trang'+(cut||n<pdf.numPages?', chỉ đọc phần đầu':'')};}
async function attText(file){
  var t=await file.text();if(t.indexOf('\\u0000')>=0)throw new Error('"'+file.name+'" là tệp nhị phân, chưa đọc được');
  var cut=t.length>ATT_FILE_CHARS;return {kind:'file',name:file.name,text:cut?t.slice(0,ATT_FILE_CHARS):t,note:cut?'đã cắt còn '+ATT_FILE_CHARS+' ký tự đầu':''};}
async function attAdd(chat,files){
  chat.att=chat.att||[];chat.attBusy=(chat.attBusy||0);
  for(var i=0;i<files.length;i++){
    var f=files[i];chat.attBusy++;if(chat.attView)chat.attView();
    try{
      var isImg=/^image\\//.test(f.type)||/\\.(png|jpe?g|webp|gif|bmp)$/i.test(f.name);
      if(isImg){if(chat.att.filter(function(x){return x.kind==='img';}).length>=ATT_MAX_IMG)throw new Error('Gửi tối đa '+ATT_MAX_IMG+' ảnh mỗi lần');if(f.size>25e6)throw new Error('Ảnh quá lớn (trên 25 MB)');chat.att.push(await attImage(f));}
      else if(/pdf$/i.test(f.type)||/\\.pdf$/i.test(f.name)){if(f.size>40e6)throw new Error('PDF quá lớn (trên 40 MB)');chat.att.push(await attPdf(f));}
      else if(/^text\\//.test(f.type)||ATT_TEXT_RE.test(f.name)){if(f.size>10e6)throw new Error('Tệp quá lớn (trên 10 MB)');chat.att.push(await attText(f));}
      else throw new Error('Chưa đọc được loại tệp "'+f.name+'". Hãy gửi ảnh, PDF hoặc tệp văn bản/mã nguồn.');
    }catch(e){if(typeof toast==='function')toast(e.message||'Không đọc được tệp');}
    chat.attBusy--;if(chat.attView)chat.attView();
  }
}
function attHtml(m){
  if(!m.att||!m.att.length)return '';
  return '<div class="att-row">'+m.att.map(function(x){return x.kind==='img'&&x.url?'<img class="att-th" src="'+x.url+'" alt="'+esc(x.name)+'">':'<span class="att-chip">'+ic('book')+'<span>'+esc(x.name)+'</span></span>';}).join('')+'</div>';}
/** Thanh đính kèm + nút kẹp giấy + kéo thả/dán ảnh cho một khung chat. o: {btn,input,bar,box,ta} */
function attBind(chat,o){
  chat.att=chat.att||[];
  chat.attView=function(){
    o.bar.hidden=!(chat.att.length||chat.attBusy);
    o.bar.innerHTML=chat.att.map(function(x,i){return '<span class="att-pill">'+(x.kind==='img'?'<img src="'+x.url+'" alt="">':ic('book'))+'<span class="att-n" title="'+esc(x.name+(x.note?' · '+x.note:''))+'">'+esc(x.name)+'</span><button type="button" data-rm="'+i+'" aria-label="Bỏ tệp">'+ic('close')+'</button></span>';}).join('')+(chat.attBusy?'<span class="att-pill busy"><i class="att-spin"></i> Đang đọc…</span>':'');
    [].forEach.call(o.bar.querySelectorAll('[data-rm]'),function(b){b.onclick=function(){chat.att.splice(+b.dataset.rm,1);chat.attView();};});
  };
  o.btn.onclick=function(){o.input.click();};
  o.input.onchange=function(){var fs=[].slice.call(o.input.files);o.input.value='';attAdd(chat,fs);};
  o.ta.addEventListener('paste',function(e){var fs=[];[].forEach.call((e.clipboardData&&e.clipboardData.items)||[],function(it){if(it.kind==='file'){var f=it.getAsFile();if(f)fs.push(f);}});if(fs.length){e.preventDefault();attAdd(chat,fs);}});
  var hasFiles=function(e){return e.dataTransfer&&[].indexOf.call(e.dataTransfer.types||[],'Files')>=0;};
  o.box.addEventListener('dragover',function(e){if(hasFiles(e)){e.preventDefault();o.box.classList.add('att-drop');}});
  o.box.addEventListener('dragleave',function(e){if(!o.box.contains(e.relatedTarget))o.box.classList.remove('att-drop');});
  o.box.addEventListener('drop',function(e){if(hasFiles(e)){e.preventDefault();o.box.classList.remove('att-drop');attAdd(chat,[].slice.call(e.dataTransfer.files));}});
  chat.attView();
}
var ATT_ACCEPT='image/*,.pdf,.txt,.md,.csv,.json,.py,.js,.ts,.html,.css,.java,.c,.cpp,.cs,.sql,.ipynb,.xml,.yml,.yaml,.log,.tex';
function aiRequest(chat,opts){`);

// 4. khung chat nổi (dock)
rep(`<form id="dkForm" class="dk-form"><textarea id="dkIn"`, `<div id="dkAtt" class="att-bar" hidden></div><form id="dkForm" class="dk-form"><button class="iconbtn att-btn" id="dkAt" type="button" title="Đính kèm ảnh, PDF hoặc tệp văn bản (cũng kéo thả hoặc dán ảnh được)" aria-label="Đính kèm">'+ic('clip')+'</button><input type="file" id="dkFile" multiple hidden accept="'+ATT_ACCEPT+'"><textarea id="dkIn"`);
rep(`  dockFloat();dockDraw();`, `  attBind(dock.chat,{btn:$('#dkAt',dock.el),input:$('#dkFile',dock.el),bar:$('#dkAtt',dock.el),box:dock.el,ta:$('#dkIn',dock.el)});
  dockFloat();dockDraw();`);
rep(`var q=t.value.trim();if(!q||c.busy)return;t.value='';`, `var q=t.value.trim();if((!q&&!(c.att&&c.att.length))||c.busy||c.attBusy)return;if(!q)q='Hãy xem giúp tôi phần đính kèm này.';t.value='';`);
rep(`'<div class="dk-u"><div>'+esc(m.shown||'')+'</div></div>'`, `'<div class="dk-u"><div>'+esc(m.shown||'')+attHtml(m)+'</div></div>'`);

// 5. khung chat trong lúc làm bài
rep(`'<div class="ai-compose"><textarea class="ai-input"`, `'<div class="att-bar" id="aiAtt" hidden></div><div class="ai-compose"><button class="iconbtn att-btn" id="aiAt" type="button" title="Đính kèm ảnh, PDF hoặc tệp văn bản" aria-label="Đính kèm">'+ic('clip')+'</button><input type="file" id="aiFile" multiple hidden accept="'+ATT_ACCEPT+'"><textarea class="ai-input"`);
rep(`    $('#aistop',box).onclick=`, `    attBind(chat,{btn:$('#aiAt',box),input:$('#aiFile',box),bar:$('#aiAtt',box),box:box,ta:input});
    $('#aistop',box).onclick=`);
rep(`function send(t){t=(t||input.value).trim();if(!t||chat.busy)return;`, `function send(t){t=(t||input.value).trim();if((!t&&!(chat.att&&chat.att.length))||chat.busy||chat.attBusy)return;if(!t)t='Hãy xem giúp tôi phần đính kèm này.';`);
rep(`(asst?mdLite(m.shown):esc(m.shown))+'</div>'+`, `(asst?mdLite(m.shown):esc(m.shown)+attHtml(m))+'</div>'+`);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
fs.writeFileSync(R + 'src/ai.js', a);

// biểu tượng kẹp giấy + CSS
let app = fs.readFileSync(R + 'src/app.js', 'utf8');
if (!app.includes("clip:'")) app = app.replace(`expand:'`, `clip:'<path d="M21.4 11.1l-9.2 9.2a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5"/>',expand:'`);
fs.writeFileSync(R + 'src/app.js', app);
fs.appendFileSync(R + 'src/style.css', `
/* ===== Đính kèm ảnh / tệp cho chatbot ===== */
.att-bar{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px 0}.att-bar[hidden]{display:none}
.att-pill{display:inline-flex;align-items:center;gap:6px;max-width:190px;border:1px solid var(--line);background:var(--panel2);border-radius:999px;padding:3px 4px 3px 4px;font-size:.78rem}
.att-pill img{width:24px;height:24px;border-radius:50%;object-fit:cover;flex:none}.att-pill>svg{width:16px;height:16px;margin-left:6px;flex:none;color:var(--primary)}
.att-pill .att-n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.att-pill button{border:0;background:none;color:var(--muted);cursor:pointer;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;padding:0;flex:none}.att-pill button:hover{background:var(--line);color:var(--text)}.att-pill button svg{width:12px;height:12px}
.att-pill.busy{padding:3px 10px;color:var(--muted)}.att-spin{width:12px;height:12px;border:2px solid var(--line);border-top-color:var(--primary);border-radius:50%;animation:attsp .8s linear infinite;display:inline-block}@keyframes attsp{to{transform:rotate(360deg)}}
.att-btn{flex:none;align-self:flex-end;color:var(--muted)}.att-btn:hover{color:var(--primary)}
.att-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.att-th{width:84px;height:64px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.35);cursor:zoom-in}.att-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.18);border-radius:8px;padding:3px 8px;font-size:.78rem;max-width:100%}.att-chip svg{width:14px;height:14px;flex:none}.att-chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dock.att-drop,.ai-chat.att-drop{outline:3px dashed var(--primary);outline-offset:-6px}
.ai-compose .att-btn{margin-bottom:2px}
`);
console.log('ok');
