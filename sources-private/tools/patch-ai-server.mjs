// Sửa src/ai.js: thêm "chế độ máy chủ" (window.AI_SERVER) — chatbot cấu hình sẵn trên server, người dùng không nhập key.
// Không có window.AI_SERVER (bản offline 1 file) thì giữ nguyên hành vi cũ.
import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/ai.js';
let c = fs.readFileSync(f, 'utf8');
const R = [
  [`var AI_SYSTEM='Bạn là trợ giảng môn SSG105 – Communication and In-Group Working Skills (kỹ năng giao tiếp và làm việc nhóm), giúp sinh viên ôn thi trắc nghiệm cuối kỳ (đề thi bằng tiếng Anh). '+`,
    `var AI_SYSTEM='Bạn là trợ giảng môn '+SJ.aiField+', giúp sinh viên ôn thi trắc nghiệm cuối kỳ (đề thi bằng tiếng Anh). '+`],
  [`var TR_SYSTEM='Bạn là công cụ dịch Anh → Việt cho tài liệu môn kỹ năng giao tiếp và làm việc nhóm. Chỉ trả về bản dịch: không giải thích, '+`,
    `var TR_SYSTEM='Bạn là công cụ dịch Anh → Việt cho tài liệu môn '+SJ.aiField+'. Chỉ trả về bản dịch: không giải thích, '+`],
  [`function aiModelName(){return aiProvider()==='anthropic'?AI_MODELS[aiModel()].name:aiModel();}`,
    `function aiModelName(){return aiProvider()==='anthropic'?AI_MODELS[aiModel()].name:aiModel();}
// Chế độ máy chủ: web đã cấu hình sẵn chatbot (key nằm trên server). Gọi /api/ai theo chuẩn OpenAI, không gửi key.
var AI_SRV=window.AI_SERVER||null;
if(AI_SRV){
  AiCfg={mem:null,get:function(){var u={};try{u=JSON.parse(localStorage.getItem(AI_STORE))||{};}catch(e){}return {key:'server',provider:'openai',model:AI_SRV.label||'Trợ giảng AI',autoCheck:u.autoCheck!==false,autoTranslate:u.autoTranslate!==false};},set:function(){}};
  aiProvider=function(){return 'openai';};aiModel=function(){return 'server';};aiUrl=function(){return '/api/ai';};aiModelName=function(){return AI_SRV.label||'Trợ giảng AI';};
}`],
  [`  if(p==='openai')return {headers:{'content-type':'application/json',authorization:'Bearer '+key},`,
    `  if(AI_SRV)return {headers:{'content-type':'application/json','x-requested-with':'ssg-web'},
    body:{mode:system===TR_SYSTEM?'translate':'chat',subject:SJ.id,messages:[{role:'system',content:system}].concat(chat.msgs.map(function(m){return {role:m.role,content:typeof m.content==='string'?m.content:blocksText(m.content)};}))}};
  if(p==='openai')return {headers:{'content-type':'application/json',authorization:'Bearer '+key},`],
  [`function aiErrText(e){
  if(e.name==='AbortError')return 'Đã dừng.';`,
    `function aiErrText(e){
  if(e.name==='AbortError')return 'Đã dừng.';
  if(AI_SRV){if(e instanceof TypeError)return 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.';
    if(e.status===401)return 'Phiên đăng nhập đã hết. Tải lại trang để đăng nhập lại.';
    if(e.status===429)return e.message||'Bạn đã dùng hết lượt hỏi AI trong hôm nay. Mai quay lại nhé.';
    if(e.status===403)return 'Tài khoản chưa được cấp quyền môn này.';
    return 'Trợ giảng AI đang bận, thử lại sau ít phút. '+(e.message?'('+e.message+')':'');}`],
  // không cho mở form cài đặt key ở chế độ máy chủ
  [`  function show(editing){if(AiCfg.get().key&&!editing)chatView();else keyForm();}`,
    `  function show(editing){if(AI_SRV||(AiCfg.get().key&&!editing))chatView();else keyForm();}`],
  [`<button class="iconbtn sm" id="aicfg" title="Cài đặt chatbot" aria-label="Cài đặt chatbot">'+ic('gear')+'</button>`,
    `'+(AI_SRV?'':'<button class="iconbtn sm" id="aicfg" title="Cài đặt chatbot" aria-label="Cài đặt chatbot">'+ic('gear')+'</button>')+'`],
  [`    $('#aicfg',box).onclick=function(){show(true);};`, `    if($('#aicfg',box))$('#aicfg',box).onclick=function(){show(true);};`],
];
for (const [a, b] of R) { if (!c.includes(a)) { console.log('MISSING:', a.slice(0, 90)); process.exitCode = 1; continue; } c = c.replace(a, () => b); }
fs.writeFileSync(f, c); console.log('patched ai.js');
