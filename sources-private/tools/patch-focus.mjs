import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/', T = R + 'sources-private/tools/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
function rep(o, n) { if (!a.includes(o)) { miss.push(o.slice(0, 50)); return; } a = a.replace(o, () => n); }
rep(`'<div class="card"><div class="row small muted">'+(q.bank?'':dot(q.module)`, `'<div class="qlay"><aside class="qside" id="aib" aria-label="Bố Tuấn Anh"></aside><div class="card qmain"><div class="row small muted">'+(q.bank?'':dot(q.module)`);
rep(`<div id="fb"></div><div id="aib"></div><div id="nxw"></div></div>'+`, `<div id="fb"></div><div id="nxw"></div></div></div>'+`);
rep(`(has?'<button type="button" class="btn sm" id="thBtn"`, `'<button type="button" class="btn sm'+(document.body.classList.contains('focus-mode')?' on':'')+'" id="focusBtn" title="Chế độ tập trung: toàn màn hình, ẩn mọi thứ không cần thiết, có đồng hồ Pomodoro (phím F)">'+ic('expand')+'<span>Tập trung</span></button>'+(has?'<button type="button" class="btn sm" id="thBtn"`);
rep(`if($('#thBtn'))$('#thBtn').onclick=`, `if($('#focusBtn'))$('#focusBtn').onclick=function(){focusToggle();};\n    if($('#thBtn'))$('#thBtn').onclick=`);
const m = '// ===== Xem lại tất cả câu hỏi của bộ đề =====';
rep(m, fs.readFileSync(T + 'focus-mod.js', 'utf8') + '\n' + m);
if (!miss.length) { fs.writeFileSync(R + 'src/app.js', a); fs.appendFileSync(R + 'src/style.css', fs.readFileSync(T + 'focus.css', 'utf8')); }
console.log(miss.length ? 'THIẾU ' + miss.join(' | ') : 'ok');
