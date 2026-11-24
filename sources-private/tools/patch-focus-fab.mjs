import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
// 1. bỏ nút Tập trung nằm trong thanh công cụ bài làm và đầu trang lý thuyết (thay bằng nút nổi dưới đáy, dùng ở mọi mục)
const stripBtn = (s, marker) => { const i = s.indexOf(marker); if (i < 0) { miss.push(marker.slice(0, 40)); return s; } return s; };
const q1s = `'<button type="button" class="btn sm'+(document.body.classList.contains('focus-mode')?' on':'')+'" id="focusBtn" title="Chế độ tập trung: toàn màn hình, ẩn mọi thứ không cần thiết, có đồng hồ Pomodoro (phím F)">'+ic('expand')+'<span>Tập trung</span></button>'+`;
if (a.includes(q1s)) a = a.replace(q1s, () => ''); else miss.push('nút trong quizTools');
const q2s = `'<button type="button" class="btn sm'+(document.body.classList.contains('focus-mode')?' on':'')+'" id="focusBtn" style="margin-left:auto" title="Chế độ tập trung: toàn màn hình, ẩn mọi thứ không cần thiết, có đồng hồ Pomodoro (phím F)">'+ic('expand')+'<span>Tập trung</span></button>'`;
if (a.includes(q2s)) a = a.replace(q2s, () => `''`); else miss.push('nút trong trang lý thuyết');
// 2. nút nổi ở mọi trang
const fab = `
// Nút Tập trung nổi ở đáy màn hình, có mặt ở mọi mục (phím tắt F)
function focusFabDraw(){var b=document.getElementById('focusBtn');if(!b)return;b.classList.toggle('on',!!FC.on);b.innerHTML=ic('expand')+'<span>'+(FC.on?'Thoát tập trung':'Tập trung')+'</span>';b.title=FC.on?'Thoát chế độ tập trung (phím F)':'Chế độ tập trung: toàn màn hình, ẩn mọi thứ không cần thiết, có đồng hồ Pomodoro (phím F)';}
setTimeout(function(){try{if(document.getElementById('focusBtn'))return;var b=document.createElement('button');b.type='button';b.id='focusBtn';b.className='focus-fab';b.onclick=function(){focusToggle();};document.body.appendChild(b);focusFabDraw();}catch(e){console.error(e);}},0);
`;
a = a.replace('function focusToggle(){if(FC.on)focusOff();else focusOn();}', m => m + fab);
// cập nhật nhãn khi bật/tắt
a = a.replace(`var fb=document.getElementById('focusBtn');if(fb)fb.classList.remove('on');`, `focusFabDraw();`);
a = a.replace(`var b=document.getElementById('focusBtn');if(b)b.classList.add('on');`, `focusFabDraw();`);
if (!a.includes('focusFabDraw();')) miss.push('gắn focusFabDraw');
if (miss.length) { console.log('THIẾU', miss.join(' | ')); }
fs.writeFileSync(R + 'src/app.js', a);
// 3. CSS: hiện lại "Hỏi lại câu sai" trong chế độ tập trung + vị trí nút nổi
let c = fs.readFileSync(R + 'src/style.css', 'utf8');
c = c.replace('body.focus-mode .rgap,', '');
c += `
/* nút Tập trung nổi ở đáy, giữa màn hình */
#focusBtn.focus-fab{position:fixed;left:50%;translate:-50% 0;bottom:20px;z-index:78;margin:0;padding:10px 20px;min-height:44px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-weight:700}
#focusBtn.focus-fab.on{box-shadow:0 6px 22px rgba(15,23,42,.22)}
@media(max-width:760px){#focusBtn.focus-fab{bottom:78px;left:auto;right:14px;translate:none}}
body.dock-open #focusBtn.focus-fab{display:none}
`;
fs.writeFileSync(R + 'src/style.css', c);
console.log(miss.length ? 'có thiếu' : 'ok');
