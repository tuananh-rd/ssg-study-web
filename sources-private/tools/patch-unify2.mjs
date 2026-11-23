// Ẩn các tab/khối không có dữ liệu cho môn (thẻ từ vựng, kiến thức key, đề kì trước, ôn nhanh, dễ nhầm, ngôn ngữ VI/EN).
import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/app.js'; let c = fs.readFileSync(f, 'utf8'), miss = 0;
const R = [
  [`var NAV=[['home','#/','Trang chủ','home'],['learn','#/learn','Lý thuyết','book'],['cards','#/cards','Thẻ','cards'],`,
    `var NAV=[['home','#/','Trang chủ','home'],['learn','#/learn','Lý thuyết','book'],].concat(D.glossary.length?[['cards','#/cards','Thẻ','cards']]:[]).concat([`],
  [`['duel','#/duel','Đấu 1-1','swords'],['mistakes','#/mistakes','Câu sai','x']];`, `['duel','#/duel','Đấu 1-1','swords'],['mistakes','#/mistakes','Câu sai','x']]);`],
  // practice: các tab trên cùng
  [`<div class="seg full f4" style="margin-bottom:14px"><button data-top="key" class="'+(st.mode==='key'?'on':'')+'">Kiến thức key</button><button data-top="recall"`,
    `<div class="seg full f4" style="margin-bottom:14px">'+(KEYQ.length?'<button data-top="key" class="'+(st.mode==='key'?'on':'')+'">Kiến thức key</button>':'')+'<button data-top="recall"`],
  [`<button data-top="past" class="'+(st.mode==='past'?'on':'')+'">Đề kì trước</button></div>'+`, `'+(D.pastExams.length?'<button data-top="past" class="'+(st.mode==='past'?'on':'')+'">Đề kì trước</button>':'')+'</div>'+`],
  // ngôn ngữ câu hỏi VI/EN chỉ khi môn có bản tiếng Việt song song
  [`(st.mode!=='past'?'<div class="row" style="margin-bottom:12px"><span class="muted small">Ngôn ngữ câu hỏi</span>`, `(st.mode!=='past'?(D.questions.length?'<div class="row" style="margin-bottom:12px"><span class="muted small">Ngôn ngữ câu hỏi</span>`],
  [`English (như đề thi)</button></div></div>'+`, `English (như đề thi)</button></div></div>':'')+`],
  // học: ôn nhanh / dễ nhầm
  [`<button data-t="quick" class="'+(tab==='quick'?'on':'')+'">Ôn nhanh</button><button data-t="compare" class="'+(tab==='compare'?'on':'')+'">Dễ nhầm</button></div>';`,
    `'+(D.quick.length?'<button data-t="quick" class="'+(tab==='quick'?'on':'')+'">Ôn nhanh</button>':'')+(D.compares.length?'<button data-t="compare" class="'+(tab==='compare'?'on':'')+'">Dễ nhầm</button>':'')+'</div>';`],
  // trang chủ & ôn nhanh: thẻ kiến thức key
  [`render('<div class="card hero">`, `render('<div class="card hero">`],
  [`'<a class="card keycard" href="#/practice?tab=key">`, `(KEYQ.length?'<a class="card keycard" href="#/practice?tab=key">`, true],
  [`'+KEYQ.length+' câu ôn nhanh các ý bắt buộc phải nhớ · đã thuộc '+recallDone(KEYQ)+'/'+KEYQ.length+'</span></span><span class="btn sm primary">Ôn ngay '+ic('arrow')+'</span></a>'+`,
    `'+KEYQ.length+' câu ôn nhanh các ý bắt buộc phải nhớ · đã thuộc '+recallDone(KEYQ)+'/'+KEYQ.length+'</span></span><span class="btn sm primary">Ôn ngay '+ic('arrow')+'</span></a>':'')+`, true],
  // trang chủ: nút "Ôn lý thuyết" chỉ khi chương có câu hỏi lại
  [`<a class="btn sm" href="#/practice?recall='+m.id+'">Ôn lý thuyết</a></div></div>';}).join('')+`, `'+(recallOf(m.id).length?'<a class="btn sm" href="#/practice?recall='+m.id+'">Ôn lý thuyết</a>':'')+'</div></div>';}).join('')+`],
  // thi thử: đề kì trước
  [`'<h3>Đề kì trước (làm lại nguyên đề)</h3><div class="grid2">'+D.pastExams.map(`, `(D.pastExams.length?'<h3>Đề kì trước (làm lại nguyên đề)</h3><div class="grid2">'+D.pastExams.map(`],
  [`Làm đề này</button></div>';}).join('')+'</div>'+`, `Làm đề này</button></div>';}).join('')+'</div>':'')+`],
];
for (const [a, b, all] of R) { if (!c.includes(a)) { console.log('MISSING:', a.slice(0, 110)); miss++; continue; } c = all ? c.split(a).join(b) : c.replace(a, () => b); }
fs.writeFileSync(f, c); console.log('patched', R.length - miss + '/' + R.length);
