// Nâng cấp UI/UX chuyên nghiệp: bỏ emoji → icon SVG, viết lại hướng dẫn + câu chữ, thêm lớp thiết kế mới (style.css).
import fs from 'node:fs';
const SRC = 'D:/Downloads/SSG105 app/src/';
let app = fs.readFileSync(SRC + 'app.js', 'utf8'), ai = fs.readFileSync(SRC + 'ai.js', 'utf8');
const miss = [];
const rep = (name, s, a, b, all) => { if (!s.includes(a)) { miss.push(name + ': ' + String(a).slice(0, 70)); return s; } return all ? s.split(a).join(b) : s.replace(a, () => b); };
const IC = t => `'+ic('${t}')+'`;

// ---------- 1) thêm icon ----------
const NEW_ICONS = `close:'<path d="M18 6L6 18M6 6l12 12"/>',check:'<path d="M20 6L9 17l-5-5"/>',checkc:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/>',ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01"/>',trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>',play:'<path d="M7 4v16l13-8z"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',`;
app = rep('ICON', app, 'var ICON={', 'var ICON={' + NEW_ICONS);

// ---------- 2) emoji → icon / bỏ ----------
app = rep('close-quiz', app, `href="'+back+'">✕</a>`, `href="'+back+'" aria-label="Thoát bài làm">${IC('close')}</a>`);
app = app.replace(/\(!localStorage\.getItem\('ssg_quiz_tip_dismissed'\)\?'<div class="quiz-tip-pill"[\s\S]*?<\/button><\/div>':''\)\+/,
  `(!localStorage.getItem('ssg_quiz_tip_dismissed')?'<div class="quiz-tip-pill" id="quizTip"><span class="qt-ic">'+ic('info')+'</span><span class="qt-txt"><b>Gợi ý sử dụng.</b> Bôi đen cụm từ tiếng Anh để xem bản dịch; dùng nút Gợi ý bên dưới khi cần định hướng cách làm.</span><button class="qt-close" id="qtClose" aria-label="Đóng">'+ic('close')+'</button></div>':'')+`);
app = rep('empty1', app, `<div class="e">🎯</div>`, `<div class="e">${IC('checkc')}</div>`);
app = rep('empty2', app, `<div class="e">🎉</div>`, `<div class="e">${IC('checkc')}</div>`);
app = rep('duel-host', app, `Tạo phòng thi đấu 🚀`, `Tạo phòng thi đấu ' + ic('arrow') + '`);
app = rep('duel-luat', app, `<b>💡 Luật thi đấu Đấu trường:</b>`, `<b>Thể lệ thi đấu</b>`);
app = app.replace(/🚀/g, `${IC('arrow')}`).replace(/🔄/g, '').replace(/🎉 /g, '').replace(/🥇 /g, '').replace(/🏆 /g, `${IC('trophy')} `);
app = app.replace(/<div class="podium-rank">🥈<\/div>/g, '<div class="podium-rank">2</div>').replace(/<div class="podium-rank">🥉<\/div>/g, '<div class="podium-rank">3</div>').replace(/<div class="podium-rank">👑<\/div>/g, `<div class="podium-rank">1</div>`);
app = app.replace(/👑 /g, '').replace(/👑/g, `${IC('trophy')}`).replace(/🥈/g, '2').replace(/🥉/g, '3').replace(/🥇/g, `${IC('trophy')}`);
app = app.replace(/💡 /g, `${IC('bulb')} `).replace(/🤖 /g, `${IC('spark')} `).replace(/🌐 /g, `${IC('globe')} `).replace(/📊 /g, `${IC('layers')} `);
app = app.replace(/✓ /g, `${IC('check')} `);
// câu chữ
app = rep('quan-quan', app, 'Bạn là Quán Quân!', 'Bạn đứng nhất!');
app = app.replace(/Bảng Xếp Hạng Chung Cuộc/g, 'Bảng xếp hạng chung cuộc').replace(/Đấu trường trực tuyến/g, 'Thi đấu trực tuyến').replace(/Đang khởi tạo phòng đấu trường…/g, 'Đang tạo phòng…').replace(/Tạo phòng đấu mới/g, 'Tạo phòng mới').replace(/Tham gia phòng có sẵn/g, 'Vào phòng đã có')
  .replace(/Nhập mã 6 ký tự do chủ phòng cung cấp/g, 'Nhập mã 6 ký tự do chủ phòng gửi cho bạn').replace(/\['duel','#\/duel','Đấu trường','swords'\]/g, `['duel','#/duel','Thi đấu','swords']`).replace(/Vào phòng ngay /g, 'Vào phòng ');
app = rep('help-btn', app, `title="Hướng dẫn tính năng">'+ic('bulb')+'<span>Hướng dẫn</span>`, `title="Hướng dẫn sử dụng" aria-label="Hướng dẫn sử dụng">'+ic('help')+'<span>Hướng dẫn</span>`);

// ---------- 3) hướng dẫn sử dụng: ngắn gọn, một màn hình ----------
const g0 = app.indexOf('// ---------- onboarding guide ----------'), g1 = app.indexOf('// ---------- shell ----------');
if (g0 < 0 || g1 < 0) miss.push('guide markers'); else app = app.slice(0, g0) + `// ---------- hướng dẫn sử dụng ----------
function showOnboardingGuide(force){
  if(!force&&localStorage.getItem('ssg_guide_seen_v3'))return;
  var rows=[
    ['book','Học lý thuyết','Đọc từng chương ở tab Lý thuyết, sau đó dùng Ôn lý thuyết để kiểm tra đúng nội dung vừa đọc.'],
    ['pen','Luyện đề','Bộ đề, Luyện tập và Thi thử dùng câu hỏi tiếng Anh như đề thi thật. Câu làm sai được lưu vào Câu sai và hỏi lại cho đến khi bạn nắm chắc.'],
    ['spark','Trợ giảng AI và dịch','Dưới mỗi câu hỏi, chọn Gợi ý để được định hướng cách làm mà không lộ đáp án, hoặc Kiểm tra đáp án sau khi trả lời. Bôi đen chữ tiếng Anh để xem bản dịch ngay tại chỗ.'],
    ['layers','Tiến độ','Kết quả được lưu theo tài khoản và đồng bộ giữa các thiết bị. Trang chủ hiển thị mức sẵn sàng và chương cần ưu tiên.']
  ];
  var h='<div class="guide-modal"><h2 class="guide-title">Hướng dẫn sử dụng</h2><p class="guide-lead">Bốn bước để ôn thi hiệu quả với '+esc(SJ.name)+'.</p><ol class="guide-list">'+rows.map(function(r,i){return '<li><span class="gl-ic">'+ic(r[0])+'</span><div><b>'+r[1]+'</b><p>'+r[2]+'</p></div></li>';}).join('')+'</ol><p class="guide-foot">Bạn có thể mở lại hướng dẫn này bất cứ lúc nào bằng nút Hướng dẫn trên thanh công cụ.</p></div>';
  modal(h,[{t:'Đã hiểu',v:'done',primary:true}]).then(function(){localStorage.setItem('ssg_guide_seen_v3','1');});
}

` + app.slice(g1);

// ---------- 4) ai.js ----------
ai = rep('ai-quick', ai, `(hint?ic('bulb')+'Gợi ý tư duy':'✓ `, `(hint?ic('bulb')+'Gợi ý':ic('check')+' `);
ai = ai.replace(/>↗<\/summary>/g, `>'+ic('ext')+'</summary>`).replace(/' ↗<\/button>/g, `'+' '+ic('ext')+'</button>`).replace(/ ↗<\/a>/g, ` '+ic('ext')+'</a>`);
ai = ai.replace(/<button class="iconbtn sm" id="aiclr" title="Xoá hội thoại" aria-label="Xoá hội thoại">🗑<\/button>/g, `<button class="iconbtn sm" id="aiclr" title="Xoá hội thoại" aria-label="Xoá hội thoại">'+ic('trash')+'</button>`);
ai = ai.replace(/💡 Gợi ý cách làm/g, 'Gợi ý cách làm').replace(/'✓ Kiểm tra đáp án'/g, `'Kiểm tra đáp án'`).replace(/Đã chép ✓/g, 'Đã chép').replace(/>✕<\/button>/g, `>'+ic('close')+'</button>`);
ai = ai.replace(/<div class="ai-first-coach">💡 /g, `<div class="ai-first-coach">'+ic('info')+' `).replace(/<div class="tr-first-tip">💡 /g, `<div class="tr-first-tip">'+ic('info')+' `).replace(/“Gợi ý tư duy”/g, '“Gợi ý”').replace(/Gợi ý tư duy/g, 'Gợi ý');
ai = ai.replace(/✓ /g, '');

fs.writeFileSync(SRC + 'app.js', app); fs.writeFileSync(SRC + 'ai.js', ai);
console.log(miss.length ? 'THIẾU:\n' + miss.join('\n') : 'patched OK');
const left = [...(app + ai).matchAll(/[\u2600-\u27BF]|[\uD83C-\uD83E][\uDC00-\uDFFF]|↗/g)].map(m => m[0]);
console.log('ký hiệu còn lại:', [...new Set(left)].join(' ') || 'không');
