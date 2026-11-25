// ===== Chatbot & dịch (chuyển từ app AIL303m) — chạy bên trong IIFE của app.js =====
// Gọi thẳng API từ trình duyệt bằng key của người dùng. Key lưu riêng trong localStorage (không nằm trong file HTML).
var AI_STORE=KEY+'_ai', TR_STORE=KEY+'_tr';
var AI_MODELS={
  'claude-opus-5-5':{name:'Claude Opus 5.5',note:'chính xác nhất',price:[4,20],fallback:true},
  'claude-sonnet-5-5':{name:'Claude Sonnet 5.5',note:'cân bằng',price:[2,10],fallback:true},
  'claude-haiku-5-5':{name:'Claude Haiku 5.5',note:'rẻ, nhanh',price:[0.1,0.5],fallback:false}
};
var AI_PROVIDERS={anthropic:'Anthropic (key chính hãng)','anthropic-compat':'Bên thứ 3 – chuẩn Anthropic (/v1/messages)',openai:'Bên thứ 3 – chuẩn OpenAI (/v1/chat/completions)'};
var AI_SITES=[['Claude','https://claude.ai/new?q='],['ChatGPT','https://chatgpt.com/?q=']];
var AI_SYSTEM='Bạn là "Bố Tuấn Anh", một người bố uyên bác, trịnh thượng và hay kẻ cả, đang giảng bài môn '+SJ.aiField+' cho "con" (người dùng) để ôn thi trắc nghiệm cuối kỳ (đề thi bằng tiếng Anh). '+
  'XƯNG HÔ: luôn xưng "bố", gọi người dùng là "con". '+
  'GIỌNG ĐIỆU: thượng đẳng, coi thường kiểu hài hước, chê con còn non kém ("con hỏi câu này mà cũng phải nhờ bố à?", "thôi để bố giảng cho mà nghe"), thỉnh thoảng thở dài than con chậm hiểu; khi con làm đúng thì khen miễn cưỡng, ngắn gọn. '+
  'GIỚI HẠN: chỉ trêu về chuyện học hành và độ hiểu bài; không chửi thề, không xúc phạm ngoại hình, gia đình, giới tính, vùng miền, tôn giáo hay sức khoẻ; không làm con nản; không bỏ sót kiến thức vì mải trêu. '+
  'NỘI DUNG luôn phải chính xác, đầy đủ, dễ hiểu và đúng trọng tâm; trả lời bằng tiếng Việt, giữ nguyên thuật ngữ tiếng Anh của môn. '+
  'Khi được nhờ kiểm tra đáp án: tự giải độc lập trước rồi mới so với đáp án trong app; ưu tiên kiến thức trong đoạn trích tài liệu môn được gửi kèm; '+
  'nếu đáp án trong app sai hoặc câu hỏi mơ hồ (nhiều đáp án hợp lý) thì nói rõ. TRÌNH BÀY: dùng Markdown gọn gàng (tiêu đề ngắn, gạch đầu dòng, **đậm** cho ý chính, bảng khi so sánh nhiều tiêu chí, khối code ``` có ghi ngôn ngữ). Công thức toán viết bằng LaTeX: $...$ cho công thức trong dòng, $$...$$ cho công thức đứng riêng; không dùng ký hiệu Unicode thay cho công thức phức tạp.';
var TR_SYSTEM='Bạn là công cụ dịch Anh → Việt cho tài liệu môn '+SJ.aiField+'. Chỉ trả về bản dịch: không giải thích, '+
  'không trả lời hay giải câu hỏi, không nhận xét đáp án nào đúng. Với thuật ngữ chuyên ngành, dịch sang tiếng Việt và ghi thuật ngữ gốc trong ngoặc, ví dụ "an toàn tâm lý (psychological safety)".';

function lsStore(key){return {mem:null,get:function(){if(this.mem)return this.mem;try{return JSON.parse(localStorage.getItem(key))||{};}catch(e){return {};}},set:function(v){try{localStorage.setItem(key,JSON.stringify(v));this.mem=null;}catch(e){this.mem=v;}}};}
var AiCfg=lsStore(AI_STORE), TrCache=lsStore(TR_STORE);
function aiProvider(){var p=AiCfg.get().provider;return AI_PROVIDERS[p]?p:'anthropic';}
function aiModel(){var m=AiCfg.get().model;if(aiProvider()==='anthropic')return AI_MODELS[m]?m:'claude-opus-5-5';return m||'claude-opus-5-5';}
function aiUrl(){var p=aiProvider();if(p==='anthropic')return 'https://api.anthropic.com/v1/messages';
  var b=(AiCfg.get().base||'').trim().replace(/\/+$/,''),path=p==='openai'?'/chat/completions':'/messages';
  return b.slice(-path.length)===path?b:b+(/\/v\d+$/.test(b)?'':'/v1')+path;}
function aiModelName(){return aiProvider()==='anthropic'?AI_MODELS[aiModel()].name:aiModel();}
// Chế độ máy chủ: web đã cấu hình sẵn chatbot (key nằm trên server). Gọi /api/ai theo chuẩn OpenAI, không gửi key.
var AI_SRV=window.AI_SERVER||null;
if(AI_SRV){
  AiCfg={mem:null,get:function(){var u={};try{u=JSON.parse(localStorage.getItem(AI_STORE))||{};}catch(e){}return {key:'server',provider:'openai',model:AI_SRV.label||'Bố Tuấn Anh',autoCheck:false,autoTranslate:u.autoTranslate!==false};},set:function(){}};
  aiProvider=function(){return 'openai';};aiModel=function(){return 'server';};aiUrl=function(){return '/api/ai';};aiModelName=function(){return AI_SRV.label||'Bố Tuấn Anh';};
}
var aiChats={};
function aiChat(id){return aiChats[id]||(aiChats[id]={msgs:[],busy:false,draft:'',open:false});}
function blocksText(bs){return bs.filter(function(b){return b&&b.type==='text';}).map(function(b){return b.text||'';}).join('');}

/* ---- đính kèm ảnh / tệp ---- */
var ATT_MAX_IMG=4,ATT_FILE_CHARS=60000,ATT_PDF_PAGES=60;
function attRecent(chat){var idx=[];chat.msgs.forEach(function(m,i){if(m.role==='user'&&m.imgs&&m.imgs.length)idx.push(i);});return idx.slice(-2);}
function attContent(chat,m,i,mode){
  var text=typeof m.content==='string'?m.content:blocksText(m.content);
  if(m.role!=='user'||!m.imgs||!m.imgs.length)return mode==='anthropic'?m.content:text;
  if(attRecent(chat).indexOf(i)<0)return (mode==='anthropic'?[{type:'text',text:text+'\n[Người dùng đã gửi '+m.imgs.length+' ảnh ở lượt trước]'}]:text+'\n[Người dùng đã gửi '+m.imgs.length+' ảnh ở lượt trước]');
  if(mode==='anthropic')return m.imgs.map(function(u){return {type:'image',source:{type:'base64',media_type:'image/jpeg',data:u.split(',')[1]}};}).concat([{type:'text',text:text}]);
  return [{type:'text',text:text}].concat(m.imgs.map(function(u){return {type:'image_url',image_url:{url:u}};}));
}
var ATT_TEXT_RE=/\.(txt|md|markdown|csv|tsv|json|jsonl|xml|html?|css|js|jsx|ts|tsx|py|ipynb|java|c|h|cpp|hpp|cs|go|rs|rb|php|sh|bat|ps1|sql|r|m|yaml|yml|toml|ini|cfg|log|tex|rtf)$/i;
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
  for(var p=1;p<=n&&len<ATT_FILE_CHARS;p++){var pg=await pdf.getPage(p),tc=await pg.getTextContent(),t=tc.items.map(function(i){return i.str;}).join(' ').replace(/\s+/g,' ').trim();if(t){out.push('--- Trang '+p+' ---\n'+t);len+=t.length;}}
  var txt=out.join('\n\n');if(!txt.trim())throw new Error('PDF "'+file.name+'" là ảnh scan, không có chữ để đọc. Hãy chụp từng trang rồi gửi dạng ảnh.');
  var cut=txt.length>ATT_FILE_CHARS;return {kind:'file',name:file.name,text:cut?txt.slice(0,ATT_FILE_CHARS):txt,note:'PDF '+pdf.numPages+' trang'+(cut||n<pdf.numPages?', chỉ đọc phần đầu':'')};}
async function attText(file){
  var t=await file.text();if(t.indexOf('\u0000')>=0)throw new Error('"'+file.name+'" là tệp nhị phân, chưa đọc được');
  var cut=t.length>ATT_FILE_CHARS;return {kind:'file',name:file.name,text:cut?t.slice(0,ATT_FILE_CHARS):t,note:cut?'đã cắt còn '+ATT_FILE_CHARS+' ký tự đầu':''};}
async function attAdd(chat,files){
  chat.att=chat.att||[];chat.attBusy=(chat.attBusy||0);
  for(var i=0;i<files.length;i++){
    var f=files[i];chat.attBusy++;if(chat.attView)chat.attView();
    try{
      var isImg=/^image\//.test(f.type)||/\.(png|jpe?g|webp|gif|bmp)$/i.test(f.name);
      if(isImg){if(chat.att.filter(function(x){return x.kind==='img';}).length>=ATT_MAX_IMG)throw new Error('Gửi tối đa '+ATT_MAX_IMG+' ảnh mỗi lần');if(f.size>25e6)throw new Error('Ảnh quá lớn (trên 25 MB)');chat.att.push(await attImage(f));}
      else if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){if(f.size>40e6)throw new Error('PDF quá lớn (trên 40 MB)');chat.att.push(await attPdf(f));}
      else if(/^text\//.test(f.type)||ATT_TEXT_RE.test(f.name)){if(f.size>10e6)throw new Error('Tệp quá lớn (trên 10 MB)');chat.att.push(await attText(f));}
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
function aiRequest(chat,opts){
  opts=opts||{};var p=aiProvider(),model=aiModel(),key=AiCfg.get().key,system=opts.system||AI_SYSTEM;
  if(AI_SRV)return {headers:{'content-type':'application/json','x-requested-with':'ssg-web'},
    body:{mode:system===TR_SYSTEM?'translate':'chat',subject:SJ.id,messages:[{role:'system',content:system}].concat(chat.msgs.map(function(m,i){return {role:m.role,content:attContent(chat,m,i,'openai')};}))}};
  if(p==='openai')return {headers:{'content-type':'application/json',authorization:'Bearer '+key},
    body:{model:model,stream:true,messages:[{role:'system',content:system}].concat(chat.msgs.map(function(m,i){return {role:m.role,content:attContent(chat,m,i,'openai')};}))}};
  var body={model:model,max_tokens:16000,stream:true,system:system,messages:chat.msgs.map(function(m,i){return {role:m.role,content:attContent(chat,m,i,'anthropic')};})};
  if(p==='anthropic-compat')return {headers:{'content-type':'application/json','x-api-key':key,authorization:'Bearer '+key,'anthropic-version':'2023-06-01'},body:body};
  var headers={'content-type':'application/json','x-api-key':key,'anthropic-version':'2026-10-21','anthropic-dangerous-direct-browser-access':'true'};
  body.output_config={effort:opts.effort||'medium'};
  if(AI_MODELS[model].fallback){headers['anthropic-beta']='server-side-fallback-2026-07-01';body.fallbacks='default';}
  return {headers:headers,body:body};
}
async function aiStream(chat,onDelta,opts){
  var model=aiModel(),openai=aiProvider()==='openai',rq=aiRequest(chat,opts);
  chat.ctrl=new AbortController();
  var res=await fetch(aiUrl(),{method:'POST',headers:rq.headers,body:JSON.stringify(rq.body),signal:chat.ctrl.signal});
  if(!res.ok){var msg='';try{var j=await res.json();msg=(j.error&&j.error.message)||j.message||'';}catch(e){}var er=new Error(msg||res.statusText);er.status=res.status;throw er;}
  var blocks=[],usage={in:0,out:0},stop=null,usedModel=model,buf='',reader=res.body.getReader(),dec=new TextDecoder();
  for(;;){
    var rd=await reader.read();if(rd.done)break;
    buf+=dec.decode(rd.value,{stream:true});var nl;
    while((nl=buf.indexOf('\n'))>=0){
      var line=buf.slice(0,nl).trim();buf=buf.slice(nl+1);
      if(line.indexOf('data:')!==0)continue;var data=line.slice(5).trim();if(data==='[DONE]')continue;
      var ev=JSON.parse(data);if(ev.error)throw new Error(ev.error.message||'Lỗi từ API');
      if(openai){var c=ev.choices&&ev.choices[0];if(ev.model)usedModel=ev.model;
        if(c&&c.delta&&c.delta.content){blocks[0]=blocks[0]||{type:'text',text:''};blocks[0].text+=c.delta.content;onDelta(blocks);}
        if(c&&c.finish_reason)stop={length:'max_tokens',content_filter:'refusal'}[c.finish_reason]||'end_turn';
        if(ev.usage){usage.in=ev.usage.prompt_tokens||0;usage.out=ev.usage.completion_tokens||0;}continue;}
      if(ev.type==='message_start'){usedModel=ev.message.model||model;usage.in=(ev.message.usage&&ev.message.usage.input_tokens)||0;}
      else if(ev.type==='content_block_start'){blocks[ev.index]=Object.assign({},ev.content_block);}
      else if(ev.type==='content_block_delta'){var b=blocks[ev.index],d=ev.delta;
        if(d.type==='text_delta')b.text=(b.text||'')+d.text;else if(d.type==='thinking_delta')b.thinking=(b.thinking||'')+d.thinking;else if(d.type==='signature_delta')b.signature=(b.signature||'')+d.signature;onDelta(blocks);}
      else if(ev.type==='message_delta'){if(ev.delta&&ev.delta.stop_reason)stop=ev.delta.stop_reason;if(ev.usage&&ev.usage.output_tokens!=null)usage.out=ev.usage.output_tokens;if(ev.usage&&ev.usage.input_tokens)usage.in=ev.usage.input_tokens;}
      else if(ev.type==='error'){throw new Error((ev.error&&ev.error.message)||'Lỗi từ API');}
    }
  }
  return {blocks:blocks.filter(Boolean),stop:stop,usage:usage,model:usedModel};
}
// Khối gửi lại ở lượt sau: giữ thinking (kèm chữ ký); nếu giữa chừng chuyển sang model dự phòng thì chỉ giữ text + khối fallback trước mốc chuyển
function aiEcho(blocks){var cut=blocks.map(function(b){return b.type;}).lastIndexOf('fallback');
  return blocks.filter(function(b,i){return !(b.type==='text'&&!b.text)&&(i>=cut||b.type==='text'||b.type==='fallback');});}
function aiErrText(e){
  if(e.name==='AbortError')return 'Đã dừng.';
  if(AI_SRV){if(e instanceof TypeError)return 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.';
    if(e.status===401)return 'Phiên đăng nhập đã hết. Tải lại trang để đăng nhập lại.';
    if(e.status===429)return e.message||'Bạn đã dùng hết lượt hỏi AI trong hôm nay. Mai quay lại nhé.';
    if(e.status===403)return 'Tài khoản chưa được cấp quyền môn này.';
    return 'Bố Tuấn Anh đang bận, thử lại sau ít phút. '+(e.message?'('+e.message+')':'');}
  if(e instanceof TypeError){if(aiProvider()==='anthropic')return 'Không kết nối được tới Claude API – kiểm tra mạng.';
    var host=aiUrl();try{host=new URL(aiUrl()).host;}catch(x){}
    return 'Không kết nối được tới '+host+'. Kiểm tra mạng và Base URL trong "Cài đặt". Nếu địa chỉ đúng mà vẫn lỗi, có thể dịch vụ này không cho gọi trực tiếp từ trình duyệt (lỗi CORS) – hỏi nhà cung cấp hoặc thử chuẩn API còn lại.';}
  var s=e.status;
  if(s===401){if(aiProvider()==='anthropic'&&String(AiCfg.get().key).indexOf('sk-ant-')!==0)return 'Key bị Anthropic từ chối. Key này không phải key Anthropic chính hãng (sk-ant-…) – nếu bạn mua key ở dịch vụ khác, bấm "Cài đặt", chọn "Bên thứ 3" và nhập Base URL + tên model theo hướng dẫn của dịch vụ đó.';
    return 'API key không hợp lệ hoặc đã bị thu hồi. Bấm "Cài đặt" để nhập lại.';}
  if(s===403)return 'Key không có quyền dùng model này. Thử đổi model trong "Cài đặt".';
  if(s===404)return 'Không tìm thấy địa chỉ API (404) – kiểm tra Base URL và chuẩn API trong "Cài đặt". '+e.message;
  if(s===429)return 'Vượt giới hạn tốc độ hoặc chi tiêu của key. Đợi một lúc rồi thử lại.';
  if(s>=500)return 'Máy chủ AI đang quá tải, thử lại sau ít phút.';
  return 'Lỗi: '+e.message;
}
async function aiAsk(chat,text,shown,restoreDraft){
  if(chat.busy)return;
  var att=(chat.att||[]).slice();chat.att=[];
  var fileTxt=att.filter(function(x){return x.kind==='file';}).map(function(x){return '\n\n[Tệp đính kèm: '+x.name+(x.note?' — '+x.note:'')+']\n```\n'+x.text+'\n```';}).join('');
  var imgs=att.filter(function(x){return x.kind==='img';}).map(function(x){return x.url;});
  chat.msgs.push({role:'user',content:text+fileTxt,shown:shown,imgs:imgs,att:att.map(function(x){return {kind:x.kind,name:x.name,url:x.kind==='img'?x.url:null,note:x.note||''};})});chat.busy=true;chat.err=null;chat.partial='';if(chat.attView)chat.attView();if(chat.view)chat.view();
  try{
    var r=await aiStream(chat,function(bs){chat.partial=blocksText(bs);if(chat.view)chat.view();});
    if(r.stop==='refusal')throw new Error('AI từ chối trả lời yêu cầu này. Thử hỏi lại theo cách khác.');
    var shownText=blocksText(r.blocks)||'(không có nội dung)';if(r.stop==='max_tokens')shownText+='\n\n[Câu trả lời bị cắt vì quá dài]';
    var tokens=r.usage.in+r.usage.out,meta=aiModelName()+(tokens?' · '+tokens+' token':'');
    if(aiProvider()==='anthropic'){var p=AI_MODELS[aiModel()].price,cost=(r.usage.in*p[0]+r.usage.out*p[1])/1e6;
      if(r.model!==aiModel())meta=r.model+' (dự phòng)'+(tokens?' · '+tokens+' token':'');meta+=' · ≈ $'+(cost<0.01?cost.toFixed(4):cost.toFixed(3));}
    chat.msgs.push({role:'assistant',content:aiEcho(r.blocks),shown:shownText,meta:meta});
  }catch(e){chat.msgs.pop();chat.att=att.concat(chat.att||[]);chat.err=aiErrText(e);chat.retry=e.name==='AbortError'?null:{text:text,shown:shown};if(restoreDraft)chat.draft=shown;}
  finally{chat.busy=false;chat.partial='';chat.ctrl=null;if(chat.view)chat.view();}
}
// Markdown nhẹ: tiêu đề, gạch đầu dòng, danh sách số, **đậm**, `code`
function mdInline(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>');}
function mdInline2(s){
  return s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1<i>$2</i>').replace(/~~(.+?)~~/g,'<s>$1</s>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
function mdLite(src){
  src=String(src==null?'':src).replace(/\r\n?/g,'\n');
  var holds=[];function hold(h){holds.push(h);return '\u0000'+(holds.length-1)+'\u0000';}
  function mj(tex,disp){tex=tex.trim();return hold('<'+(disp?'div':'span')+' class="mj'+(disp?' mj-d':'')+'" data-tex="'+esc(tex)+'">'+esc(tex)+'</'+(disp?'div':'span')+'>');}
  // khối code
  src=src.replace(/\x60\x60\x60([\w+#.-]*)[^\n]*\n([\s\S]*?)(?:\x60\x60\x60|$)/g,function(_,lang,code){
    return '\n'+hold('<div class="cb"><div class="cb-h"><span>'+esc(lang||'code')+'</span><button type="button" class="cb-copy">Chép</button></div><pre><code>'+esc(code.replace(/\n$/,''))+'</code></pre></div>')+'\n';});
  // công thức: $$..$$, \[..\], \(..\), $..$
  src=src.replace(/\$\$([\s\S]+?)\$\$/g,function(_,t){return '\n'+mj(t,true)+'\n';})
    .replace(/\\\[([\s\S]+?)\\\]/g,function(_,t){return '\n'+mj(t,true)+'\n';})
    .replace(/\\\(([\s\S]+?)\\\)/g,function(_,t){return mj(t,false);})
    .replace(/\$([^\s$](?:[^$\n]*?[^\s$])?)\$/g,function(_,t){return mj(t,false);});
  src=src.replace(/\x60([^\x60\n]+)\x60/g,function(_,c){return hold('<code>'+esc(c)+'</code>');});
  var lines=src.split('\n'),out=[],i=0;
  function inl(s){return mdInline2(esc(s));}
  function cells(l){return l.trim().replace(/^\||\|$/g,'').split('|').map(function(c){return c.trim();});}
  while(i<lines.length){
    var ln=lines[i],m;
    if(!ln.trim()){i++;continue;}
    if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(ln)){out.push('<hr>');i++;continue;}
    if((m=ln.match(/^\s*(#{1,4})\s+(.*)/))){var lv=Math.min(4,m[1].length+1);out.push('<h'+lv+' class="md-h">'+inl(m[2])+'</h'+lv+'>');i++;continue;}
    if(/^\s*\|.*\|\s*$/.test(ln)&&i+1<lines.length&&/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[i+1])){
      var head=cells(ln),al=cells(lines[i+1]).map(function(c){return /^:-+:$/.test(c)?'center':/-:$/.test(c)?'right':'left';}),rows=[];i+=2;
      while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i])){rows.push(cells(lines[i]));i++;}
      out.push('<div class="md-tbl"><table><thead><tr>'+head.map(function(c,k){return '<th style="text-align:'+(al[k]||'left')+'">'+inl(c)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+head.map(function(_,k){return '<td style="text-align:'+(al[k]||'left')+'">'+inl(r[k]||'')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>');
      continue;
    }
    if(/^\s*>\s?/.test(ln)){var q=[];while(i<lines.length&&/^\s*>\s?/.test(lines[i])){q.push(lines[i].replace(/^\s*>\s?/,''));i++;}out.push('<blockquote>'+q.map(inl).join('<br>')+'</blockquote>');continue;}
    if(/^\s*([-*•]|\d+[.)])\s+/.test(ln)){
      var stack=[],html='';
      while(i<lines.length&&(m=lines[i].match(/^(\s*)([-*•]|\d+[.)])\s+(.*)/))){
        var ind=Math.floor(m[1].replace(/\t/g,'  ').length/2),tag=/\d/.test(m[2])?'ol':'ul';
        while(stack.length>ind+1){html+='</li></'+stack.pop()+'>';}
        if(stack.length===ind+1){if(stack[ind]!==tag){html+='</li></'+stack.pop()+'>';html+='<'+tag+'>';stack.push(tag);}else html+='</li>';}
        else{while(stack.length<ind+1){html+='<'+tag+'>';stack.push(tag);}}
        html+='<li>'+inl(m[3]);i++;
      }
      while(stack.length)html+='</li></'+stack.pop()+'>';
      out.push(html);continue;
    }
    var para=[];
    while(i<lines.length&&lines[i].trim()&&!/^\s*(#{1,4}\s|>|([-*•]|\d+[.)])\s+|\|.*\||-{3,}\s*$)/.test(lines[i])){para.push(lines[i]);i++;}
    if(!para.length){para.push(lines[i]);i++;}
    out.push('<p>'+para.map(inl).join('<br>')+'</p>');
  }
  var html=out.join('').replace(/\u0000(\d+)\u0000/g,function(_,k){return holds[+k];});
  return '<div class="md">'+html+'</div>';
}
// KaTeX: nạp khi trong câu trả lời có công thức; chưa nạp được thì giữ nguyên mã TeX
var KX={p:null};
function katexLoad(){
  if(window.katex)return Promise.resolve();if(KX.p)return KX.p;
  KX.p=new Promise(function(res,rej){var l=document.createElement('link');l.rel='stylesheet';l.href='/vendor/katex/katex.min.css';document.head.appendChild(l);
    var s=document.createElement('script');s.src='/vendor/katex/katex.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  KX.p.catch(function(){KX.p=null;});return KX.p;
}
function katexScan(){
  var els=[].slice.call(document.querySelectorAll('.mj:not([data-done])'));if(!els.length)return;
  katexLoad().then(function(){els.forEach(function(e){try{e.innerHTML=window.katex.renderToString(e.getAttribute('data-tex'),{displayMode:e.classList.contains('mj-d'),throwOnError:false,strict:false,trust:false});e.setAttribute('data-done','1');}catch(x){e.setAttribute('data-done','err');}});},function(){els.forEach(function(e){e.setAttribute('data-done','err');});});
}
setTimeout(function(){
  try{new MutationObserver(function(){clearTimeout(katexScan.t);katexScan.t=setTimeout(katexScan,50);}).observe(document.body,{childList:true,subtree:true});}catch(e){}
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.cb-copy,.md-copy');if(!b)return;
    var t=b.classList.contains('cb-copy')?(b.closest('.cb').querySelector('code')||{}).textContent:(b.closest('[data-raw]')?b.closest('[data-raw]').getAttribute('data-raw'):'');
    if(t&&copyText(t)!==undefined){var o=b.textContent;b.textContent='Đã chép';setTimeout(function(){b.textContent=o;},1400);}
  });
},0);
function copyText(text){var ta=document.createElement('textarea');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';ta.value=text;document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();if(!ok&&navigator.clipboard)navigator.clipboard.writeText(text).then(function(){},function(){});return ok;}

// Trích nội dung mục lý thuyết liên quan để AI bám sát tài liệu môn
function secText(ref){var m=MOD[modOfRef(ref)];if(!m)return '';var s=m.sections.filter(function(x){return x.id===ref;})[0];if(!s)return '';
  var d=document.createElement('div');d.innerHTML=s.h.replace(/<\/(li|p|tr|h\d)>/g,'\n</$1>');return ('§'+s.id+' '+s.t+'\n'+d.textContent.replace(/\n\s*\n+/g,'\n').trim()).slice(0,1800);}
/** ctx: {lang, opts: các đáp án theo thứ tự đang hiện, picked: đáp án đã chọn (hoặc null), answered} */
function aiPrompt(q,ctx){
  var t=T(q,ctx.lang),hint=!ctx.answered,good=q.answers||[t.correct];
  var letters=function(arr){return arr.map(function(x){return L[ctx.opts.indexOf(x)];}).filter(Boolean).sort().join(', ');};
  var ans=letters(good),mine=ctx.picked!=null?letters([].concat(ctx.picked)):'';
  return [
    'Đây là một câu trắc nghiệm môn '+SJ.aiField+'.'+(hint?'':' Đáp án trong app CÓ THỂ BỊ SAI.'),
    q.past?'Câu này lấy từ đề thi kì trước; đề không kèm đáp án nên đáp án trong app do người soạn tự xác định.':null,
    q.bank?'Câu này lấy từ bộ đề ôn tập '+SJ.name+' do sinh viên tổng hợp ('+q.section+'); đáp án trong bộ đề có thể sai.':null,
    good.length>1?'Câu này chọn '+good.length+' đáp án.':null,
    hint?'Tôi đang tự làm câu này. ĐỪNG nói thẳng đáp án: hãy gợi ý kiến thức cần dùng và hướng suy luận để tôi tự chọn. Chỉ nói đáp án khi tôi xin. Trả lời ngắn gọn bằng tiếng Việt.'
        :'Hãy tự giải độc lập trước, sau đó so với đáp án trong app và kết luận rõ: ĐÚNG hay SAI (nếu sai thì đáp án đúng là gì). Giải thích ngắn gọn bằng tiếng Việt.',
    '','Câu hỏi:',t.q,''
  ].concat(ctx.opts.map(function(o,i){return L[i]+'. '+o;})).concat([
    '',
    hint?null:'Đáp án trong app: '+ans,
    !hint&&mine&&mine!==ans?'Tôi đã chọn: '+mine:null,
    hint?null:(q.explain?'Giải thích trong app: '+q.explain:null),
    q.ref?'\nTrích tài liệu môn liên quan:\n'+secText(q.ref):null
  ]).filter(function(x){return x!=null;}).join('\n');
}

/** Hàng nút "Hỏi Bố" + khung chat, vẽ vào el. getCtx() trả về ctx hiện tại của câu. */
function aiBox(el,q,getCtx){
  var chat=aiChat(q.id);
  function draw(){
    var ctx=getCtx(),hint=!ctx.answered,hasKey=!!AiCfg.get().key;
    var isFirstHint=!localStorage.getItem('ssg_hint_seen');
    el.innerHTML='<div class="ai-bar'+(chat.open?' open':'')+'"><div class="ai-bar-l"><span class="ai-badge">'+ic('spark')+'</span><div><div class="row" style="gap:6px;align-items:center"><b>Bố Tuấn Anh</b>'+(hint&&isFirstHint?'<span class="tag ok" style="font-size:.72em;padding:1px 7px">Tính năng gợi ý</span>':'')+'</div><div class="small muted">'+
        (hint?'Bí? Nhận gợi ý phương pháp giải — AI không làm lộ đáp án.':'Chưa chắc đáp án? Để AI tự giải và đối chiếu.')+'</div></div></div>'+
      '<div class="ai-bar-r"><button class="btn sm primary ai-btn-quick" data-ai="quick">'+(hint?ic('bulb')+'Gợi ý':ic('check')+' Kiểm tra đáp án')+'</button>'+
      '<button class="btn sm'+(chat.open?' on':'')+'" data-ai="toggle">'+(chat.open?'Thu gọn':ic('chat')+'Hỏi Bố'+(chat.msgs.length?' ('+chat.msgs.length/2+')':''))+'</button>'+
      '<details class="ai-ext"><summary class="btn sm ghost" title="Mở ở trang chat ngoài (không cần API key)">'+ic('ext')+'</summary><div class="ai-ext-menu"><div class="small muted">Mở ở trang chat ngoài, prompt được chép sẵn:</div>'+
        AI_SITES.map(function(s,i){return '<button class="btn sm" data-site="'+i+'">'+s[0]+' '+ic('ext')+'</button>';}).join('')+'</div></details></div>'+
      (hint&&isFirstHint?'<div class="ai-first-coach">'+ic('info')+' <b>Bố Tuấn Anh:</b> Khi gặp câu hỏi khó, bấm <b>“Gợi ý”</b> để nhận manh mối từng bước mà không lo bị lộ đáp án!</div>':'')+
      '<div class="ai-note"></div></div>'+(chat.open?'<div class="ai-chat"></div>':'');
    $('[data-ai="toggle"]',el).onclick=function(){chat.open=!chat.open;localStorage.setItem('ssg_hint_seen','1');draw();};
    $('[data-ai="quick"]',el).onclick=function(){
      chat.open=true;localStorage.setItem('ssg_hint_seen','1');draw();
      if(!hasKey)return;   // chưa có key → khung chat hiện form cài đặt
      aiAsk(chat,aiPrompt(q,getCtx()),hint?'Gợi ý giúp tôi cách làm câu này (chưa nói đáp án).':'Kiểm tra giúp tôi đáp án câu này.',false);
    };
    $$('[data-site]',el).forEach(function(b){b.onclick=function(){var s=AI_SITES[+b.dataset.site],text=aiPrompt(q,getCtx()),ok=copyText(text);window.open(s[1]+encodeURIComponent(text),'_blank','noopener');$('.ai-note',el).textContent=ok?'Đã mở '+s[0]+' và chép sẵn prompt – nếu ô chat trống thì dán (Ctrl+V).':'Đã mở '+s[0]+'.';$('details',el).open=false;};});
    if(chat.open)aiPanel($('.ai-chat',el),q,getCtx,chat);
  }
  el._aiDraw=draw;draw();
}
var AI_CHIPS_HINT=['Gợi ý cách làm câu này','Giải thích các thuật ngữ trong câu','Dịch câu hỏi sang tiếng Việt'];
var AI_CHIPS_CHECK=['Vì sao các đáp án còn lại sai?','Cho ví dụ thực tế dễ nhớ','Mẹo ghi nhớ kiến thức này','Câu này hay bị bẫy ở đâu?'];
function aiPanel(box,q,getCtx,chat){
  function show(editing){if(AI_SRV||(AiCfg.get().key&&!editing))chatView();else keyForm();}
  function keyForm(){
    var cfg=AiCfg.get(),prov=aiProvider();
    box.innerHTML='<div class="ai-chat-head"><b>'+ic('gear')+' Cài đặt chatbot</b></div><p class="muted small" id="aihint" style="margin:0"></p>'+
      '<label class="ai-field">Nhà cung cấp<select id="aiprov">'+Object.keys(AI_PROVIDERS).map(function(k){return '<option value="'+k+'"'+(k===prov?' selected':'')+'>'+esc(AI_PROVIDERS[k])+'</option>';}).join('')+'</select></label>'+
      '<label class="ai-field" id="aibasef">Base URL (địa chỉ API của dịch vụ)<input id="aibase" type="url" placeholder="vd: https://api.dichvu.com/v1" value="'+esc(cfg.base||'')+'"></label>'+
      '<label class="ai-field">API key<span class="ai-keyrow"><input id="aikey" type="password" autocomplete="off" spellcheck="false" value="'+esc(cfg.key||'')+'"><button type="button" class="btn sm" id="aieye">Hiện</button></span></label>'+
      '<p class="small muted" id="ailink" style="margin:-4px 0 6px">Chưa có key? Tạo ở <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> (cần nạp tiền vào tài khoản API).</p>'+
      '<label class="ai-field" id="aimodf">Model<select id="aimod">'+Object.keys(AI_MODELS).map(function(id){var m=AI_MODELS[id];return '<option value="'+id+'"'+(id===aiModel()?' selected':'')+'>'+m.name+' ('+m.note+') – $'+m.price[0]+' / $'+m.price[1]+' mỗi 1 triệu token vào / ra</option>';}).join('')+'</select></label>'+
      '<label class="ai-field" id="aimodtf">Model<input id="aimodt" type="text" list="ai-ids" placeholder="Tên model theo dịch vụ, vd: claude-opus-5-5" value="'+esc(prov==='anthropic'?'':(cfg.model||''))+'"><datalist id="ai-ids">'+Object.keys(AI_MODELS).map(function(id){return '<option value="'+id+'">';}).join('')+'</datalist></label>'+
      '<label class="check"><input type="checkbox" id="aiauto"'+(cfg.autoCheck!==false?' checked':'')+'> Tự động đối chiếu đáp án ngay khi trả lời một câu trong Luyện tập (mỗi câu tốn 1 lượt gọi API)</label>'+
      '<label class="check"><input type="checkbox" id="aitr"'+(cfg.autoTranslate!==false?' checked':'')+'> Bôi đen chữ tiếng Anh là tự dịch (mỗi đoạn mới tốn 1 lượt gọi API nhỏ)</label>'+
      '<p class="muted small" style="margin:6px 0 8px">Key chỉ lưu trong trình duyệt này, không nằm trong file HTML – gửi file cho bạn bè không lộ key.</p>'+
      '<div class="row" style="justify-content:flex-end">'+(cfg.key?'<button class="btn sm ghost" id="aidel">Xoá key</button><button class="btn sm" id="aicancel">Huỷ</button>':'')+'<button class="btn sm primary" id="aisave">Lưu</button></div>';
    function sync(){var off=$('#aiprov',box).value==='anthropic';$('#aibasef',box).hidden=$('#aimodtf',box).hidden=off;$('#aimodf',box).hidden=!off;
      $('#aikey',box).placeholder=off?'sk-ant-…':'Dán API key của dịch vụ…';$('#ailink',box).hidden=!off;
      $('#aihint',box).textContent=off?'Dán Claude API key (tạo ở console.anthropic.com). Mỗi lần hỏi được tính phí vào tài khoản API của bạn – nên đặt giới hạn chi tiêu cho key.':'Lấy Base URL, chuẩn API (Anthropic hay OpenAI) và tên model trong trang hướng dẫn của dịch vụ bạn mua key. Dịch vụ phải cho phép gọi trực tiếp từ trình duyệt (CORS).';}
    $('#aiprov',box).onchange=sync;sync();
    $('#aieye',box).onclick=function(){var k=$('#aikey',box),show=k.type==='password';k.type=show?'text':'password';this.textContent=show?'Ẩn':'Hiện';};
    function save(){
      var k=$('#aikey',box).value.trim(),p=$('#aiprov',box).value,off=p==='anthropic',base=$('#aibase',box).value.trim(),mt=$('#aimodt',box).value.trim();
      if(!k)return $('#aikey',box).focus();
      if(!off&&!/^https?:\/\/\S+$/i.test(base)){toast('Nhập Base URL bắt đầu bằng https://');return $('#aibase',box).focus();}
      if(!off&&!mt)return $('#aimodt',box).focus();
      function commit(){var next={key:k,provider:p,base:off?'':base,model:off?$('#aimod',box).value:mt,autoCheck:$('#aiauto',box).checked,autoTranslate:$('#aitr',box).checked},old=AiCfg.get();
        if(old.provider!==next.provider||old.base!==next.base||old.model!==next.model)Object.keys(aiChats).forEach(function(id){if(!aiChats[id].busy)aiChats[id].msgs=[];});
        AiCfg.set(next);chat.err=null;show(false);}
      if(off&&k.indexOf('sk-ant-')!==0)confirmBox('Key này không giống key Anthropic chính hãng (thường bắt đầu bằng “sk-ant-”). Nếu bạn mua key ở dịch vụ khác, bấm Huỷ rồi chọn “Bên thứ 3” ở ô Nhà cung cấp.<br><br>Vẫn lưu với Anthropic chính hãng?','Vẫn lưu').then(function(y){if(y)commit();});
      else commit();
    }
    [$('#aikey',box),$('#aibase',box),$('#aimodt',box)].forEach(function(n){n.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();save();}};});
    $('#aisave',box).onclick=save;
    if($('#aicancel',box))$('#aicancel',box).onclick=function(){show(false);};
    if($('#aidel',box))$('#aidel',box).onclick=function(){confirmBox('Xoá API key khỏi trình duyệt này?','Xoá key',true).then(function(y){if(y){AiCfg.set(Object.assign({},AiCfg.get(),{key:''}));show(true);}});};
    setTimeout(function(){$('#aikey',box).focus();});
  }
  function chatView(){
    box.innerHTML='<div class="ai-chat-head"><div class="ai-who"><span class="ai-badge sm">'+ic('spark')+'</span><div><b>Bố Tuấn Anh</b><div class="small muted">'+(AI_SRV?'Hỏi đáp riêng cho môn này':esc(aiModelName())+(aiProvider()==='anthropic'?'':' · bên thứ 3'))+'</div></div></div>'+
      '<span class="row" style="gap:2px"><button class="iconbtn sm" id="aiclr" title="Xoá hội thoại" aria-label="Xoá hội thoại">'+ic('trash')+'</button>'+(AI_SRV?'':'<button class="iconbtn sm" id="aicfg" title="Cài đặt chatbot" aria-label="Cài đặt chatbot">'+ic('gear')+'</button>')+'</span></div>'+
      '<div class="ai-log" aria-live="polite"></div><div class="ai-chips"></div>'+
      '<div class="att-bar" id="aiAtt" hidden></div><div class="ai-compose"><button class="iconbtn att-btn" id="aiAt" type="button" title="Đính kèm ảnh, PDF hoặc tệp văn bản" aria-label="Đính kèm">'+ic('clip')+'</button><input type="file" id="aiFile" multiple hidden accept="'+ATT_ACCEPT+'"><textarea class="ai-input" rows="1" placeholder="Hỏi thêm về câu này…"></textarea><button class="btn sm" id="aistop" hidden>■ Dừng</button><button class="ai-send" id="aisend" aria-label="Gửi">'+ic('arrow')+'</button></div>'+
      '<div class="ai-foot small muted"><span><kbd>Enter</kbd> gửi · <kbd>Shift</kbd>+<kbd>Enter</kbd> xuống dòng</span><span>Hội thoại mất khi tải lại trang</span></div>';
    var log=$('.ai-log',box),input=$('.ai-input',box),chips=$('.ai-chips',box);input.value=chat.draft||'';
    function grow(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,160)+'px';}
    input.oninput=function(){chat.draft=input.value;grow();};
    input.onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}if(e.key==='Escape')input.blur();};
    attBind(chat,{btn:$('#aiAt',box),input:$('#aiFile',box),bar:$('#aiAtt',box),box:box,ta:input});
    $('#aistop',box).onclick=function(){if(chat.ctrl)chat.ctrl.abort();};
    $('#aisend',box).onclick=function(){send();};
    $('#aiclr',box).onclick=function(){if(!chat.busy){chat.msgs=[];chat.err=null;chat.retry=null;draw();}};
    if($('#aicfg',box))$('#aicfg',box).onclick=function(){show(true);};
    function ask(t,shown,restore){aiAsk(chat,chat.msgs.length?t:aiPrompt(q,getCtx())+'\n\nCâu hỏi của tôi: '+t,shown||t,restore);}
    function send(t){t=(t||input.value).trim();if((!t&&!(chat.att&&chat.att.length))||chat.busy||chat.attBusy)return;if(!t)t='Hãy xem giúp tôi phần đính kèm này.';input.value='';chat.draft='';grow();ask(t,t,true);}
    function bubble(m,i){
      var asst=m.role==='assistant';
      return '<div class="ai-msg '+m.role+'">'+(asst?'<span class="ai-badge xs">'+ic('spark')+'</span>':'')+'<div class="ai-bub"><div class="ai-msg-text">'+(asst?mdLite(m.shown):esc(m.shown)+attHtml(m))+'</div>'+
        (asst?'<div class="ai-msg-meta"><span>'+esc(m.meta||'')+'</span><button class="link-btn" data-copy="'+i+'">Chép</button></div>':'')+'</div></div>';
    }
    function draw(){
      var hint=!getCtx().answered;
      log.innerHTML=(!chat.msgs.length&&!chat.busy&&!chat.err?'<div class="ai-empty">'+(hint
          ?'Bạn đang làm câu này nên AI chỉ <b>gợi ý</b>, không nói đáp án. Chọn một gợi ý bên dưới hoặc tự gõ câu hỏi.'
          :'AI sẽ tự giải độc lập rồi đối chiếu với đáp án trong app. Bấm <b>Kiểm tra đáp án</b> hoặc hỏi bất kỳ điều gì về câu này.')+'</div>':'')+
        chat.msgs.map(bubble).join('')+
        (chat.busy?'<div class="ai-msg assistant pending"><span class="ai-badge xs">'+ic('spark')+'</span><div class="ai-bub"><div class="ai-msg-text">'+(chat.partial?mdLite(chat.partial):'<span class="typing"><i></i><i></i><i></i></span>')+'</div></div></div>':'')+
        (chat.err?'<div class="ai-err"><span>'+esc(chat.err)+'</span>'+(chat.retry?'<button class="btn sm" id="airetry">Thử lại</button>':'')+'</div>':'');
      var list=(chat.msgs.length?[]:[hint?'Gợi ý cách làm':'Kiểm tra đáp án']).concat(hint?AI_CHIPS_HINT.slice(1):AI_CHIPS_CHECK);
      chips.innerHTML=chat.busy?'':list.map(function(c,k){return '<button class="ai-chip" data-chip="'+k+'">'+esc(c)+'</button>';}).join('');
      $$('[data-chip]',chips).forEach(function(b){b.onclick=function(){var c=list[+b.dataset.chip];
        if(!chat.msgs.length&&+b.dataset.chip===0)aiAsk(chat,aiPrompt(q,getCtx()),hint?'Gợi ý giúp tôi cách làm câu này (chưa nói đáp án).':'Kiểm tra giúp tôi đáp án câu này.',false);
        else ask(c);};});
      $$('[data-copy]',log).forEach(function(b){b.onclick=function(){copyText(chat.msgs[+b.dataset.copy].shown);b.textContent='Đã chép';setTimeout(function(){b.textContent='Chép';},1500);};});
      if($('#airetry',log))$('#airetry',log).onclick=function(){var r=chat.retry;chat.retry=null;chat.err=null;if(r)aiAsk(chat,r.text,r.shown,true);};
      $('#aisend',box).disabled=chat.busy;$('#aistop',box).hidden=!chat.busy;$('#aiclr',box).hidden=!chat.msgs.length;
      if(!chat.busy&&chat.draft&&!input.value){input.value=chat.draft;grow();}
      log.scrollTop=log.scrollHeight;
    }
    chat.view=function(){if(log.isConnected)draw();};draw();grow();
  }
  show(false);
}
/** Trả lời xong 1 câu: đã cài chatbot + bật tự động thì mở chat và nhờ AI đối chiếu (mỗi câu 1 lần) */
function aiAutoCheck(el,q,getCtx){
  var cfg=AiCfg.get();if(!cfg.key||cfg.autoCheck===false)return;
  var chat=aiChat(q.id);if(chat.autoChecked||chat.busy)return;
  chat.autoChecked=true;chat.open=true;if(el._aiDraw)el._aiDraw();
  aiAsk(chat,aiPrompt(q,getCtx()),'Kiểm tra giúp tôi đáp án câu này.',false);
}

// ---------- Dịch Anh → Việt ----------
function googleTr(text){return 'https://translate.google.com/?sl=en&tl=vi&op=translate&text='+encodeURIComponent(text.slice(0,4000));}
async function aiTranslate(text,onDelta){var r=await aiStream({msgs:[{role:'user',content:text}]},function(b){if(onDelta)onDelta(blocksText(b));},{system:TR_SYSTEM,effort:'low'});
  if(r.stop==='refusal')throw new Error('AI từ chối dịch đoạn này.');return blocksText(r.blocks).trim();}
var trState={};
/** Khung dịch cho câu đang hiện bằng tiếng Anh. Câu trong ngân hàng: dùng sẵn bản tiếng Việt (miễn phí);
    câu đề kì trước: nhờ AI dịch (lưu lại), chưa cài chatbot thì mở Google Dịch. opts = đáp án tiếng Anh theo thứ tự đang hiện. */
function trToggle(el,btn,q,opts){
  var st=trState[q.id]||(trState[q.id]={});
  if(st.open){st.open=false;el.innerHTML='';btn.textContent='Dịch';return;}
  var en=T(q,'en'),srcEn=[en.correct].concat(en.wrong),srcVi=[q.correct].concat(q.wrong);
  if(q.en&&!q.past){st.open=true;btn.textContent='Ẩn bản dịch';
    el.innerHTML='<div class="tr-box"><b>Bản tiếng Việt</b><div>'+qhtml(q.q)+'</div><ol class="tr-opts">'+opts.map(function(o,i){return '<li><b>'+L[i]+'.</b> '+esc(srcVi[srcEn.indexOf(o)]||o)+'</li>';}).join('')+'</ol></div>';return;}
  var full=[q.q].concat(q.orig).join('\n'),cached=TrCache.get()[q.id];
  if(!cached&&!AiCfg.get().key){window.open(googleTr(full),'_blank','noopener');return;}
  st.open=true;btn.textContent='Ẩn bản dịch';
  function paint(raw,loading,err){
    var p=raw&&trParse(raw);
    el.innerHTML='<div class="tr-box"><div class="row between"><b>Bản dịch</b><a class="small" href="'+googleTr(full)+'" target="_blank" rel="noopener">Google Dịch '+ic('ext')+'</a></div>'+
      (err?'<div class="ai-err">'+esc(err)+'</div>':loading?'<div class="muted">'+esc((raw||'Đang dịch…').replace(/<<\s*(Q|\d+)\s*>>\s*/g,''))+'</div>':
      p?'<div>'+qhtml(p.q)+'</div><ol class="tr-opts">'+opts.map(function(o,i){return '<li><b>'+L[i]+'.</b> '+esc(p.opts[q.orig.indexOf(o)]||o)+'</li>';}).join('')+'</ol>':'<div>'+qhtml(raw)+'</div>')+'</div>';
  }
  if(cached)return paint(cached);
  paint('',true);
  var src='Dịch nội dung dưới đây. Giữ nguyên các dấu mốc <<Q>>, <<1>>, <<2>>… ở đầu mỗi phần, không thêm gì khác.\n\n'+['<<Q>>',q.q].concat([].concat.apply([],q.orig.map(function(o,i){return ['<<'+(i+1)+'>>',o];}))).join('\n');
  aiTranslate(src,function(t){if(st.open&&el.isConnected)paint(t,true);}).then(function(t){var all=TrCache.get();all[q.id]=t;TrCache.set(all);if(st.open&&el.isConnected)paint(t);},function(e){if(el.isConnected)paint('',false,aiErrText(e));});
}
function trParse(text){var parts=String(text).split(/<<\s*(Q|\d+)\s*>>/),out={q:'',opts:[]};for(var i=1;i<parts.length;i+=2){var v=(parts[i+1]||'').trim();if(parts[i]==='Q')out.q=v;else out.opts[+parts[i]-1]=v;}return out.q?out:null;}

// Bôi đen chữ tiếng Anh → popup dịch ngay cạnh chỗ bôi
var trPop=null,trSeq=0,trSelCache={};
function trHidePop(){if(trPop){trPop.remove();trPop=null;}trSeq++;}
var askPop=null;
function askPopHide(){if(askPop){askPop.remove();askPop=null;}}
function askPopShow(text,rect){
  askPopHide();trHidePop();
  askPop=document.createElement('div');askPop.className='ask-pop';
  askPop.innerHTML='<button class="btn sm primary" type="button">'+ic('spark')+' Hỏi Bố về đoạn này</button><button class="btn sm" type="button" id="apSr" title="Tra cứu Google / Wikipedia">'+ic('search')+' Tra cứu</button>';
  document.body.appendChild(askPop);
  var w=askPop.offsetWidth,top=rect.bottom+8;if(top+44>window.innerHeight)top=Math.max(8,rect.top-46);
  askPop.style.top=top+'px';askPop.style.left=Math.min(Math.max(8,rect.left),window.innerWidth-w-8)+'px';
  askPop.querySelector('button').onclick=function(){askPopHide();dockOpen(text,'Giải thích đoạn này giúp tôi một cách dễ hiểu.');};
  askPop.querySelector('#apSr').onclick=function(){askPopHide();srOpen(text);};
}
function trShowPop(text,rect){
  trHidePop();var seq=trSeq;
  trPop=document.createElement('div');trPop.className='tr-pop';trPop._text=text;
  var isFirstTr=!localStorage.getItem('ssg_tr_hint_seen');
  trPop.innerHTML='<div class="tr-pop-head">'+
    '<div class="tr-pop-title"><span class="tr-ic">'+ic('spark')+'</span><b>Dịch thuật ngữ AI</b></div>'+
    '<button class="tr-pop-close" id="trClose" title="Đóng">'+ic('close')+'</button></div>'+
    (isFirstTr?'<div class="tr-first-tip">'+ic('info')+' <b>Bôi đen để dịch:</b> Bạn có thể bôi đen bất kỳ cụm từ tiếng Anh nào trong bài học hoặc đề thi để xem giải nghĩa ngay tức thì!</div>':'')+
    '<div class="tr-pop-text"></div>'+
    '<div class="tr-pop-foot"><span class="small muted">AI Translation</span><div class="row" style="gap:6px"><button class="btn sm" id="trAsk">Hỏi Bố</button><button class="btn sm" id="trCopy">Chép</button><a class="btn sm ghost" href="'+googleTr(text)+'" target="_blank" rel="noopener">Google Dịch '+ic('ext')+'</a></div></div>';
  document.body.appendChild(trPop);
  if(isFirstTr)localStorage.setItem('ssg_tr_hint_seen','1');
  $('#trClose',trPop).onclick=trHidePop;
  $('#trAsk',trPop).onclick=function(){var t=trPop._text;trHidePop();dockOpen(t,'Giải thích đoạn này giúp tôi (nghĩa, ý chính và ví dụ nếu cần).');};
  $('#trCopy',trPop).onclick=function(){
    var b=$('.tr-pop-text',trPop),t=b?b.innerText||b.textContent:'';
    copyText(t);this.textContent='Đã chép';
    var self=this;setTimeout(function(){if(self.isConnected)self.textContent='Chép';},1500);
  };
  var body=$('.tr-pop-text',trPop);
  function place(){if(!trPop)return;var w=trPop.offsetWidth,h=trPop.offsetHeight,top=rect.bottom+8;if(top+h>window.innerHeight-8)top=Math.max(8,rect.top-h-8);trPop.style.top=top+'px';trPop.style.left=Math.min(Math.max(8,rect.left),window.innerWidth-w-8)+'px';}
  if(trSelCache[text]){body.innerHTML=mdLite(trSelCache[text]);return place();}
  if(!AiCfg.get().key){body.innerHTML='<span class="muted">Cài chatbot (nút “Chat ngay trong app” ở phần Luyện tập) để dịch ngay tại đây.</span>';return place();}
  body.innerHTML='<div class="tr-loading"><span class="typing"><i></i><i></i><i></i></span> Đang tra cứu thuật ngữ…</div>';place();
  aiTranslate(text,function(t){if(seq===trSeq){body.textContent=t||'Đang dịch…';place();}})
    .then(function(t){trSelCache[text]=t;if(seq===trSeq){body.innerHTML=mdLite(t);place();}},function(e){if(seq===trSeq){body.innerHTML='<span class="ai-err">'+esc(aiErrText(e))+'</span>';place();}});
}
function trOnSelect(e){
  if(e.target&&e.target.closest&&e.target.closest('.tr-pop'))return;
  setTimeout(function(){
    var sel=window.getSelection(),text=sel&&sel.rangeCount?sel.toString().replace(/\s+/g,' ').trim():'';
    if(!text)return trHidePop();
    if(AiCfg.get().autoTranslate===false)return;
    var range=sel.getRangeAt(0),node=range.commonAncestorContainer,host=node.nodeType===1?node:node.parentElement;
    if(!host||!host.closest('#content')||host.closest('input,textarea,select,.ai-log,.tr-box,.tr-pop'))return;
    if(host.closest('.dock'))return;
    var viet=/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    if(text.length>=3&&(viet||text.length>1500)&&text.length<=3000){askPopShow(text,range.getBoundingClientRect());return;}
    if(!/[A-Za-z]{2}/.test(text)||viet||text.length>1500)return;
    if(trPop&&trPop._text===text)return;
    trShowPop(text,range.getBoundingClientRect());
  },10);
}
document.addEventListener('mouseup',trOnSelect);
document.addEventListener('touchend',trOnSelect);
document.addEventListener('keyup',function(e){if(e.shiftKey)trOnSelect(e);});
document.addEventListener('mousedown',function(e){if(trPop&&!e.target.closest('.tr-pop'))trHidePop();if(askPop&&!e.target.closest('.ask-pop'))askPopHide();});
window.addEventListener('scroll',function(){if(trPop)trHidePop();if(askPop)askPopHide();},{passive:true});

// ===== Khung chat ở góc: hỏi nhanh theo mục đang đọc =====
var dock={open:false,quote:'',ctxKey:'',el:null,fab:null,chat:aiChat('dock')};
function dockContext(){
  var m=(location.hash.match(/#\/learn\/([^?\/]+)/)||[])[1],mod=m&&MOD[m];
  if(!mod)return {key:'',label:'',text:''};
  var secs=[].slice.call(document.querySelectorAll('.lesson .sec')),cur=null;
  secs.forEach(function(s){if(s.getBoundingClientRect().top<innerHeight*0.45)cur=s;});
  var sec=cur&&mod.sections.filter(function(x){return 's-'+x.id===cur.id;})[0];
  function plain(h){var d=document.createElement('div');d.innerHTML=h.replace(/<\/(li|p|tr|h\d)>/g,'\n</$1>');return d.textContent.replace(/\n\s*\n+/g,'\n').trim();}
  if(sec)return {key:mod.id+'/'+sec.id,label:'chương "'+mod.title+'", mục '+sec.id+' '+sec.t,text:plain(sec.h).slice(0,6000)};
  return {key:mod.id,label:'chương "'+mod.title+'"',text:mod.sections.map(function(s){return s.id+' '+s.t+'\n'+plain(s.h);}).join('\n\n').slice(0,6000)};
}
function dockBuild(){
  if(dock.el)return;
  dock.fab=document.createElement('button');dock.fab.type='button';dock.fab.className='dock-fab';dock.fab.setAttribute('aria-label','Mở Bố Tuấn Anh');
  dock.fab.innerHTML=ic('spark')+'<span>Hỏi Bố</span>';dock.fab.onclick=function(){dockToggle();};
  dock.el=document.createElement('aside');dock.el.className='dock';dock.el.setAttribute('aria-label','Bố Tuấn Anh');
  dock.el.innerHTML='<div class="dk-head"><div><b>Bố Tuấn Anh</b><div class="small muted" id="dkCtx"></div></div><div class="row" style="gap:6px"><button class="iconbtn sm dk-mx" id="dkMx" type="button" title="Phóng to / thu nhỏ (nhấp đúp tiêu đề để về mặc định)" aria-label="Phóng to">'+ic('expand')+'</button><button class="iconbtn sm" id="dkClr" type="button" title="Xoá hội thoại" aria-label="Xoá hội thoại">'+ic('trash')+'</button><button class="iconbtn sm" id="dkX" type="button" title="Đóng" aria-label="Đóng">'+ic('close')+'</button></div></div>'+
    '<div class="dk-log" id="dkLog"></div>'+
    '<div class="dk-foot"><div id="dkQuote"></div><div id="dkChips" class="dk-chips"></div><div id="dkAtt" class="att-bar" hidden></div><form id="dkForm" class="dk-form"><button class="iconbtn att-btn" id="dkAt" type="button" title="Đính kèm ảnh, PDF hoặc tệp văn bản (cũng kéo thả hoặc dán ảnh được)" aria-label="Đính kèm">'+ic('clip')+'</button><input type="file" id="dkFile" multiple hidden accept="'+ATT_ACCEPT+'"><textarea id="dkIn" rows="1" placeholder="Hỏi bố đi con…" aria-label="Câu hỏi"></textarea><button class="btn primary" type="submit" aria-label="Gửi">'+ic('arrow')+'</button></form></div>';
  document.body.appendChild(dock.fab);document.body.appendChild(dock.el);
  var c=dock.chat;c.view=dockDraw;
  $('#dkX',dock.el).onclick=function(){dockToggle(false);};
  $('#dkClr',dock.el).onclick=function(){if(c.ctrl)try{c.ctrl.abort();}catch(e){}c.msgs=[];c.err=null;c.busy=false;dock.ctxKey='';dock.quote='';dockDraw();};
  $('#dkForm',dock.el).onsubmit=function(e){e.preventDefault();var t=$('#dkIn',dock.el);var q=t.value.trim();if((!q&&!(c.att&&c.att.length))||c.busy||c.attBusy)return;if(!q)q='Hãy xem giúp tôi phần đính kèm này.';t.value='';t.style.height='';dockSend(q);};
  $('#dkIn',dock.el).addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#dkForm',dock.el).requestSubmit();}});
  $('#dkIn',dock.el).addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});
  attBind(dock.chat,{btn:$('#dkAt',dock.el),input:$('#dkFile',dock.el),bar:$('#dkAtt',dock.el),box:dock.el,ta:$('#dkIn',dock.el)});
  dockFloat();dockDraw();
}

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
function dockSend(q){
  var c=dock.chat,ctx=dockContext(),text=q;
  if(!c.msgs.length||dock.ctxKey!==ctx.key||dock.quote){
    text='Trả lời bằng tiếng Việt, ngắn gọn, đúng trọng tâm, giữ nguyên thuật ngữ tiếng Anh.'+(ctx.text?'\n\n[Tài liệu môn '+SJ.name+' — '+ctx.label+']\n'+ctx.text:'')+(dock.quote?'\n\n[Đoạn sinh viên bôi đen]\n"'+dock.quote+'"':'')+'\n\n[Câu hỏi]\n'+q;
    dock.ctxKey=ctx.key;
  }
  dock.quote='';aiAsk(c,text,q,true);dockDraw();
}
function dockDraw(){
  if(!dock.el)return;var c=dock.chat,ctx=dockContext();
  $('#dkCtx',dock.el).textContent=ctx.label?'Đang đọc: '+(ctx.label.length>70?ctx.label.slice(0,68)+'…':ctx.label):'Hỏi bất kỳ điều gì về môn '+SJ.name;
  var log=$('#dkLog',dock.el),nearEnd=log.scrollHeight-log.scrollTop-log.clientHeight<80,h='';
  if(!c.msgs.length&&!c.busy)h='<div class="dk-empty"><p><b>Có gì không hiểu thì hỏi bố.</b></p><p>Bôi đen đoạn con thấy khó hiểu để bố giảng riêng, hoặc gõ câu hỏi về mục con đang đọc. Đừng để bố phải nhắc.</p></div>';
  c.msgs.forEach(function(m){h+=m.role==='user'?'<div class="dk-u"><div>'+esc(m.shown||'')+attHtml(m)+'</div></div>':'<div class="dk-a" data-raw="'+esc(m.shown||'')+'"><div class="dk-who">'+ic('spark')+'<b>Bố Tuấn Anh</b><button type="button" class="md-copy">Chép</button></div>'+mdLite(m.shown||'')+'</div>';});
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
  dockBuild();dock.open=on===undefined?!dock.open:!!on;if(dock.open&&typeof thClose==='function')thClose();
  dock.el.classList.toggle('open',dock.open);document.body.classList.toggle('dock-open',dock.open);
  if(dock.open){dockDraw();setTimeout(function(){var t=$('#dkIn',dock.el);if(t)t.focus();},60);}
}
function dockOpen(quote,autoQ){
  dockBuild();dock.quote=quote||'';dockToggle(true);
  if(autoQ&&!dock.chat.busy)dockSend(autoQ);else dockDraw();
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dock.open)dockToggle(false);});
window.addEventListener('hashchange',function(){if(dock.open)setTimeout(dockDraw,50);});
setTimeout(function(){try{dockBuild();}catch(e){console.error(e);}},0);

async function aiExplainQ(prompt,onDelta){var r=await aiStream({msgs:[{role:'user',content:prompt}]},function(b){if(onDelta)onDelta(blocksText(b));},{system:AI_SYSTEM,effort:'low'});
  if(r.stop==='refusal')throw new Error('AI từ chối trả lời yêu cầu này.');return blocksText(r.blocks).trim();}

function xpPrompt(t,opts,good){return 'Câu hỏi trắc nghiệm môn '+SJ.name+':\n'+t.q+'\n'+opts.map(function(o,k){return L[k]+'. '+o;}).join('\n')+'\nĐáp án đúng: '+good+'\n\nViết lời giải thích bằng tiếng Việt cho sinh viên ôn thi, gồm: (1) vì sao đáp án đúng là đúng, (2) vì sao từng đáp án còn lại sai, (3) một mẹo ghi nhớ ngắn. Tối đa 150 từ, trình bày bằng gạch đầu dòng, giữ nguyên thuật ngữ tiếng Anh.';}
function practiceExplain(q,t,opts,good,btn){
  var fb=document.getElementById('fb');if(!fb||!q.bank)return;
  var box=document.createElement('div');box.className='card xcard';
  box.innerHTML='<div class="xc-h">'+ic('book')+'<b>Giải thích</b></div><div class="xc-b">'+(q.explain?mdLite(q.explain):'<span class="muted">Câu này chưa có lời giải soạn sẵn. Con cần thì hỏi bố.</span>')+'</div>'+
    '<div class="xc-f"><button type="button" class="btn sm" id="xcAsk">'+ic('chat')+' Hỏi Bố Tuấn Anh giải thích thêm</button></div>';
  fb.insertAdjacentElement('afterend',box);
  box.querySelector('#xcAsk').onclick=function(){dockOpen('Câu hỏi: '+t.q+'\nĐáp án đúng: '+good.join(' ; '),'');};
}

// ===== Gia sư ôn lý thuyết: chatbot riêng, tự hỏi – chấm – giải thích – tổng kết (chỉ môn có SJ.tutor và chương "digest") =====
var TUT={chat:{msgs:[],busy:false,system:'',ctrl:null,view:null,err:null,retry:null,partial:''},msgs:null,focus:'all',save:function(){tutSave();},sys:function(){return tutSystem();}};
function tutKey(){return KEY+'_tutor';}
function tutLoad(){if(TUT.msgs)return;try{var j=JSON.parse(localStorage.getItem(tutKey())||'null');TUT.msgs=(j&&Array.isArray(j.msgs))?j.msgs:[];TUT.focus=(j&&j.focus)||'all';}catch(e){TUT.msgs=[];}}
function tutSave(){try{localStorage.setItem(tutKey(),JSON.stringify({msgs:TUT.msgs.slice(-60),focus:TUT.focus}));}catch(e){}}
function tutDig(){return SJ.tutor?(D.modules.filter(function(m){return m.digest;})[0]||null):null;}
function tutStats(){if(!P.tutor||typeof P.tutor!=='object')P.tutor={};if(!P.tutor.stats)P.tutor.stats={};return P.tutor.stats;}
function tutIds(){var dg=tutDig();if(!dg)return [];if(TUT.focus!=='all'){var g=(dg.groups||[]).filter(function(x){return x.id===TUT.focus;})[0];if(g)return g.ids;}return dg.sections.map(function(s){return s.id;});}
function tutPlain(s){var d=document.createElement('div');d.innerHTML=s.h.replace(/<\/(li|p|tr|h\d)>/g,'\n</$1>').replace(/<\/t[dh]>/g,' | ');return d.textContent.replace(/[ \t]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();}
function tutFindSec(ref){for(var i=0;i<D.modules.length;i++){var s=D.modules[i].sections.filter(function(x){return x.id===ref;})[0];if(s)return s;}return null;}
function tutHasSec(ref){return !!tutFindSec(ref);}
function tutSystem(only,onlyRef){
  var dg=tutDig(),ids=only?only.map(function(s){return s.id;}):tutIds(),secs=only||dg.sections.filter(function(s){return ids.indexOf(s.id)>=0;});
  var doc=secs.map(function(s){return '### Mục '+s.id+' — '+s.t+'\n'+tutPlain(s);}).join('\n\n').slice(0,34000);
  var st=tutStats(),done=Object.keys(st).filter(function(k){return st[k].n>0;}).sort(function(a,b){return parseFloat(a.split('.')[1])-parseFloat(b.split('.')[1]);}).map(function(k){return k+': '+(Math.round(st[k].ok*2)/2)+'/'+st[k].n;}).join('; ');
  return 'Bạn là GIA SƯ ÔN LÝ THUYẾT môn '+SJ.name+' ('+SJ.aiField+'). Nhiệm vụ: trò chuyện với người học để KIỂM TRA họ đã hiểu lý thuyết đến đâu và giúp họ vững hơn. Đây không phải chatbot "Bố Tuấn Anh": xưng "mình", gọi người học là "bạn", giọng thân thiện, kiên nhẫn, khích lệ, không trêu chọc. '+
   'TÀI LIỆU CHUẨN: chỉ dùng các mục tài liệu bên dưới (tóm tắt theo bộ đề thi, đánh số 7.1, 7.2…) làm chuẩn đúng/sai. Nếu người học hỏi điều ngoài tài liệu, trả lời ngắn gọn và nói rõ đó là kiến thức ngoài tài liệu. '+
   'CÁCH HỎI: mỗi lượt chỉ hỏi MỘT câu. Đa dạng dạng câu: định nghĩa, so sánh hai khái niệm dễ nhầm, tình huống ngắn, "vì sao", đọc mã ngắn, và thỉnh thoảng một câu trắc nghiệm A/B/C/D bằng tiếng Anh như đề thi thật. Chọn mục ngẫu nhiên trong phạm vi, ưu tiên mục chưa hỏi hoặc người học đã trả lời sai. Bắt đầu ở mức vừa, rồi tăng hoặc giảm độ khó theo kết quả. Không tiết lộ đáp án trước khi người học trả lời; nếu họ xin gợi ý thì gợi ý từng bước. '+
   'CHẤM: sau mỗi câu trả lời, nhận xét ngắn ĐÚNG, ĐÚNG MỘT PHẦN hoặc CHƯA ĐÚNG; nêu ý đúng theo tài liệu; nếu sai thì chỉ ra chỗ nhầm và một mẹo nhớ; rồi ra câu tiếp theo (hoặc một câu hỏi nối). Nếu người học nói không biết, giảng ngắn gọn rồi hỏi lại một câu đơn giản hơn. '+
   'GHI KẾT QUẢ (BẮT BUỘC): ngay sau khi chấm một câu, thêm ở CUỐI tin nhắn đúng một dòng dạng [[KQ:7.5:d]] với d = đúng, m = đúng một phần, s = sai, và 7.5 là số mục tài liệu liên quan nhất tới câu vừa chấm. Giao diện sẽ ẩn dòng này; đừng nhắc tới nó. Không thêm dòng này khi chưa chấm câu nào (ví dụ ở lời chào hoặc khi chỉ trả lời thắc mắc). '+
   'TỔNG KẾT: khi người học yêu cầu hoặc sau khoảng 8 câu, nêu họ đang học đến đâu: nhóm chủ đề vững, tạm ổn, còn yếu; các lỗi nhầm hay gặp; và 2–3 mục (ghi số mục) nên đọc lại. '+
   'PHONG CÁCH: tiếng Việt, giữ nguyên thuật ngữ tiếng Anh; ngắn gọn (khoảng 150 từ mỗi lượt, trừ khi đang giảng); Markdown nhẹ, **đậm** cho ý chính, mã trong khối ```. Từ chối lịch sự mọi yêu cầu không phải ôn lý thuyết môn '+SJ.name+'.\n\n'+
   (onlyRef?'CHẾ ĐỘ ÔN NGAY TẠI MỘT MỤC: người học đang đọc mục '+onlyRef+' và muốn được hỏi lại kiến thức của chính mục này. Chỉ hỏi và giải thích trong phạm vi mục này; trong dòng ghi kết quả luôn dùng đúng số mục '+onlyRef+' (ví dụ [[KQ:'+onlyRef+':d]]); sau khoảng 5 câu hãy chốt lại người học đã nắm được gì và còn yếu gì ở mục này, rồi hỏi họ có muốn ôn tiếp không.\n\n':(ids.length<dg.sections.length?'PHẠM VI HIỆN TẠI: chỉ hỏi trong các mục '+ids.join(', ')+'.\n\n':''))+
   (done?'KẾT QUẢ ĐÃ GHI NHẬN CỦA NGƯỜI HỌC (số điểm/số câu theo mục): '+done+'. Hãy dùng thông tin này để chọn câu hỏi và nhận xét.\n\n':'')+
   'TÀI LIỆU:\n'+doc;
}
function tutStrip(t){return String(t||'').replace(/\s*\[\[KQ:[^\]]*\]\]/g,'').replace(/\s*\[\[[^\]]*$/,'').trim();}
function tutRecord(text){
  var re=/\[\[KQ:\s*([0-9]+\.[0-9]+)\s*:\s*([dmsDMS])\s*\]\]/g,m,n=0,st=tutStats();
  while((m=re.exec(text))){var ref=m[1];if(!tutHasSec(ref))continue;var o=st[ref]||(st[ref]={n:0,ok:0});o.n++;o.ok+={d:1,m:0.5,s:0}[m[2].toLowerCase()];n++;}
  if(n){save();}return n;
}
async function tutSend(text,shown,S){
  S=S||TUT;var C=S.chat;if(C.busy)return;if(S===TUT)tutLoad();
  S.msgs.push({role:'user',content:text,shown:shown||text});S.save();
  C.busy=true;C.err=null;C.retry=null;C.partial='';if(C.view)C.view();
  try{
    C.msgs=S.msgs.slice(-30).map(function(m){return {role:m.role,content:m.content};});
    var r=await aiStream(C,function(bs){C.partial=tutStrip(blocksText(bs));if(C.view)C.view();},{system:S.sys()});
    if(r.stop==='refusal')throw new Error('AI từ chối trả lời yêu cầu này. Thử hỏi lại theo cách khác.');
    var raw=blocksText(r.blocks)||'(không có nội dung)';if(r.stop==='max_tokens')raw+='\n\n[Câu trả lời bị cắt vì quá dài]';
    S.msgs.push({role:'assistant',content:raw,shown:tutStrip(raw)||'(không có nội dung)'});tutRecord(raw);S.save();
  }catch(e){S.msgs.pop();S.save();C.err=aiErrText(e);C.retry=e.name==='AbortError'?null:{text:text,shown:shown||text};}
  finally{C.busy=false;C.partial='';C.ctrl=null;if(C.view)C.view();}
}
// Phiên chat theo từng mục lý thuyết (ôn ngay tại mục): lưu trong trình duyệt, tối đa 24 tin gần nhất mỗi mục
var TUTS={};
function tutSecAll(){try{return JSON.parse(localStorage.getItem(KEY+'_tutor_sec')||'{}')||{};}catch(e){return {};}}
function tutSecSave(){try{var o=tutSecAll();Object.keys(TUTS).forEach(function(k){delete o[k];o[k]=TUTS[k].msgs.slice(-24);});var ks=Object.keys(o);while(ks.length>40){delete o[ks.shift()];}localStorage.setItem(KEY+'_tutor_sec',JSON.stringify(o));}catch(e){}}
function tutSecSession(ref){
  if(TUTS[ref])return TUTS[ref];
  var S=TUTS[ref]={ref:ref,chat:{msgs:[],busy:false,ctrl:null,view:null,err:null,retry:null,partial:''},msgs:tutSecAll()[ref]||[]};
  S.save=function(){tutSecSave();};S.sys=function(){return tutSystem([tutFindSec(ref)],ref);};return S;
}
