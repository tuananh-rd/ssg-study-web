// Khái quát hoá src/app.js + src/ai.js để MỘT giao diện chạy cho cả 4 môn (D.subject quyết định tên, khoá lưu, nguồn câu hỏi, tab hiển thị).
import fs from 'node:fs';
const ROOT = 'D:/Downloads/SSG105 app/src/';
function patch(file, R) {
  let c = fs.readFileSync(ROOT + file, 'utf8'), miss = 0;
  for (const [a, b, all] of R) {
    if (!c.includes(a)) { console.log('MISSING in', file, ':', a.slice(0, 100)); miss++; continue; }
    c = all ? c.split(a).join(b) : c.replace(a, () => b);
  }
  fs.writeFileSync(ROOT + file, c); console.log(file, 'patched', R.length - miss + '/' + R.length);
}
const IMG = `'+(q.img?'<img class="q-img" src="'+esc(q.img)+'" alt="Hình của câu hỏi">':'')+'`;
patch('app.js', [
  [`var D=window.DATA;`, `var D=window.DATA;
// Thông tin môn: bản web gắn D.subject cho từng môn; bản offline SSG105 không có thì dùng mặc định.
var SJ=D.subject||{id:'ssg105',name:'SSG105',title:'Ôn thi cuối kỳ',aiField:'SSG105 – Communication and In-Group Working Skills (kỹ năng giao tiếp và làm việc nhóm)',key:'ssg105_progress_v2',peer:'ssg105-duel-',bankTitle:'Bộ đề SSG105',slides:true};
D.questions=D.questions||[];D.past=D.past||[];D.pastExams=D.pastExams||[];D.glossary=D.glossary||[];D.quick=D.quick||[];D.compares=D.compares||[];D.keyq=D.keyq||[];D.recall=D.recall||[];D.bank=D.bank||[];`],
  [`var TOPIC_MOD={`, `var TOPIC_MOD=D.topicMod||{`],
  [`module:TOPIC_MOD[b.topic]||'m2',`, `module:TOPIC_MOD[b.topic]||QMODS[0].id,`],
  [`slide:b.slide,q:b.question,orig:b.options,`, `slide:b.slide,img:b.img,q:b.question,orig:b.options,`],
  [`var SLIDES_BANK=BANK.filter(function(q){return q.slide>=8&&q.slide<=176;}).sort(function(a,b){return a.slide-b.slide;});`,
    `var SLIDES_BANK=SJ.slides?BANK.filter(function(q){return q.slide>=8&&q.slide<=176;}).sort(function(a,b){return a.slide-b.slide;}):[];
// Môn không có bộ câu "kiểu đề thi" riêng (DAP/AIL/CPV): bộ đề chính là nguồn cho luyện tập, trộn và thi thử (thi thử chỉ lấy câu 1 đáp án).
if(!D.questions.length)ALLQ=BANK.slice();
var PQ=D.questions.length?D.questions:BANK;
var EXAMQ=D.questions.length?D.questions:BANK.filter(function(q){return q.answers.length===1;});`],
  [`function qCount(m){return D.questions.filter(function(q){return q.module===m;}).length;}`, `function qCount(m){return (D.questions.length?D.questions:BANK).filter(function(q){return q.module===m;}).length;}`],
  [`var KEY='ssg105_progress_v2',canSave=true,P;`, `var KEY=SJ.key,canSave=true,P;`],
  // runQuiz + examRun: hiện ảnh slide kèm câu hỏi (CPV)
  [`</div><div id="trx"></div>`, `</div>${IMG}<div id="trx"></div>`, true],
  [`Đáp án theo bộ đề SSG105.`, `Đáp án theo bộ đề ${'\'+SJ.name+\''}.`],
  // Trang lý thuyết: "Ý phải nhớ" chỉ khi chương có keyPoints
  [`'<div class="keybox"><b>Ý phải nhớ</b><ul>'+m.keyPoints.map(function(k){return '<li>'+esc(k)+'</li>';}).join('')+'</ul></div>'+`,
    `(m.keyPoints&&m.keyPoints.length?'<div class="keybox"><b>Ý phải nhớ</b><ul>'+m.keyPoints.map(function(k){return '<li>'+esc(k)+'</li>';}).join('')+'</ul></div>':'')+`],
  [`'">11 chương</button><button data-t="quick"`, `'">'+D.modules.length+' chương</button><button data-t="quick"`],
  // luyện tập: chọn chương / mix dùng PQ
  [`var pool=shuffle(D.questions.filter(function(q){return q.module===qs.m;})).slice(0,10);`, `var pool=shuffle(PQ.filter(function(q){return q.module===qs.m;})).slice(0,10);`],
  [`list=shuffle(D.questions.filter(function(q){return st.mods.indexOf(q.module)>=0;})).slice(0,st.n);`, `list=shuffle(PQ.filter(function(q){return st.mods.indexOf(q.module)>=0;})).slice(0,st.n);`],
  [`Ngẫu nhiên cả 11 chương`, `Ngẫu nhiên cả '+D.modules.length+' chương`],
  // thi thử
  [`al.forEach(function(a){shuffle(D.questions.filter(function(q){return q.module===a.m;})).slice(0,a.k)`, `al.forEach(function(a){shuffle(EXAMQ.filter(function(q){return q.module===a.m;})).slice(0,a.k)`],
  [`if(ids.length<n)shuffle(D.questions.filter(function(q){return !used[q.id];}))`, `if(ids.length<n)shuffle(EXAMQ.filter(function(q){return !used[q.id];}))`],
  [`o[id]=shuffle([t.correct].concat(t.wrong));`, `var qq=QMAP[id];o[id]=(qq.orig&&qq.keep)?qq.orig.slice():shuffle([t.correct].concat(t.wrong));`],
  [`<span class="tag">Theo workbook cũ</span>`, `<span class="tag">Rút gọn</span>`],
  [`<span class="tag warn">Theo thông tin lớp hiện tại</span>`, `<span class="tag warn">Như đề thật</span>`],
  // giao diện: tên môn
  [`<h1>Bộ đề SSG105</h1>`, `<h1>'+esc(SJ.bankTitle)+'</h1>`],
  [`'Bộ đề SSG105'+(st.topics.length`, `SJ.bankTitle+(st.topics.length`],
  [`<a class="brand" href="#/"><i>SSG105</i><span class="hide-m">Ôn thi cuối kỳ</span></a>`, `<a class="brand" href="#/"><i>'+esc(SJ.name)+'</i><span class="hide-m">'+esc(SJ.title)+'</span></a>`],
  [`a.download='ssg105-tien-do-'+today()+'.json'`, `a.download=SJ.id+'-tien-do-'+today()+'.json'`],
  [`var PEER_PREFIX='ssg105-duel-';`, `var PEER_PREFIX=SJ.peer;`],
  [`cfg:{src:'slides',n:10,sec:20}`, `cfg:{src:SJ.slides?'slides':'bank',n:10,sec:20}`],
  [`var DUEL_SRC={slides:`, `var DUEL_SRC=!SJ.slides?{bank:{t:'Bộ đề '+BANK.length+' câu',list:function(){return BANK.filter(function(q){return q.answers.length===1;});}}}:{slides:`],
  // bộ đề: nút chuyển nguồn chỉ có ở SSG105
  [`bankSt={topics:[],sections:[],filter:'all',order:'shuffle',n:20,query:'',source:'slides'}`, `bankSt={topics:[],sections:[],filter:'all',order:'shuffle',n:20,query:'',source:SJ.slides?'slides':'all'}`],
  [`'<div class="seg" style="margin-bottom:14px"><button data-source="slides"`, `(!SJ.slides?'':'<div class="seg" style="margin-bottom:14px"><button data-source="slides"`],
  [`'+BANK.length+' câu</button></div>'+`, `'+BANK.length+' câu</button></div>')+`],
]);
patch('ai.js', [
  [`'Đây là một câu trắc nghiệm môn SSG105 (Communication and In-Group Working Skills).'`, `'Đây là một câu trắc nghiệm môn '+SJ.aiField+'.'`],
  [`'Câu này lấy từ bộ đề ôn tập SSG105 do sinh viên tổng hợp ('`, `'Câu này lấy từ bộ đề ôn tập '+SJ.name+' do sinh viên tổng hợp ('`],
]);
