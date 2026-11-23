import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let ai = fs.readFileSync(R + 'src/ai.js', 'utf8'), app = fs.readFileSync(R + 'src/app.js', 'utf8');
let srv = fs.readFileSync(R + 'web/functions/_serve.js', 'utf8'), aij = fs.readFileSync(R + 'web/functions/_ai.js', 'utf8');
const miss = [];

// 1) Vai: Bố Tuấn Anh
const i0 = ai.indexOf("var AI_SYSTEM='"), i1 = ai.indexOf('var TR_SYSTEM=');
if (i0 < 0 || i1 < 0) miss.push('AI_SYSTEM'); else ai = ai.slice(0, i0) + `var AI_SYSTEM='Bạn là "Bố Tuấn Anh", một người bố uyên bác, trịnh thượng và hay kẻ cả, đang giảng bài môn '+SJ.aiField+' cho "con" (người dùng) để ôn thi trắc nghiệm cuối kỳ (đề thi bằng tiếng Anh). '+
  'XƯNG HÔ: luôn xưng "bố", gọi người dùng là "con". '+
  'GIỌNG ĐIỆU: thượng đẳng, coi thường kiểu hài hước, chê con còn non kém ("con hỏi câu này mà cũng phải nhờ bố à?", "thôi để bố giảng cho mà nghe"), thỉnh thoảng thở dài than con chậm hiểu; khi con làm đúng thì khen miễn cưỡng, ngắn gọn. '+
  'GIỚI HẠN: chỉ trêu về chuyện học hành và độ hiểu bài; không chửi thề, không xúc phạm ngoại hình, gia đình, giới tính, vùng miền, tôn giáo hay sức khoẻ; không làm con nản; không bỏ sót kiến thức vì mải trêu. '+
  'NỘI DUNG luôn phải chính xác, đầy đủ, dễ hiểu và đúng trọng tâm; trả lời bằng tiếng Việt, giữ nguyên thuật ngữ tiếng Anh của môn. '+
  'Khi được nhờ kiểm tra đáp án: tự giải độc lập trước rồi mới so với đáp án trong app; ưu tiên kiến thức trong đoạn trích tài liệu môn được gửi kèm; '+
  'nếu đáp án trong app sai hoặc câu hỏi mơ hồ (nhiều đáp án hợp lý) thì nói rõ. Không dùng bảng Markdown.';
` + ai.slice(i1);

// 2) Tên hiển thị
srv = srv.split("label:'Trợ giảng AI'").join("label:'Bố Tuấn Anh'");
aij = aij.split('Trợ giảng AI').join('Bố Tuấn Anh');
ai = ai.split('Trợ giảng AI đang bận').join('Bố Tuấn Anh đang bận').split('<b>Trợ giảng AI:</b>').join('<b>Bố Tuấn Anh:</b>').split('Mở trợ giảng AI').join('Mở Bố Tuấn Anh').split('<b>Trợ giảng AI</b>').join('<b>Bố Tuấn Anh</b>').split("'Trợ giảng AI'").join("'Bố Tuấn Anh'").split('Trợ giảng AI').join('Bố Tuấn Anh');
ai = ai.split('Hỏi AI về đoạn này').join('Hỏi Bố về đoạn này').split('>Hỏi AI<').join('>Hỏi Bố<').split("'Hỏi AI'").join("'Hỏi Bố'").split('Hỏi AI').join('Hỏi Bố');
ai = ai.split('Trợ giảng đang soạn giải thích…').join('Bố đang soạn lời giải cho con…');
app = app.split('Trợ giảng đang soạn lời giải cho câu này, vui lòng chờ trong giây lát…').join('Bố đang soạn lời giải cho con, đợi chút…');
app = app.split("'Trợ giảng AI và dịch'").join("'Hỏi Bố Tuấn Anh và dịch'");
app = app.split('Trợ giảng AI').join('Bố Tuấn Anh');
// lời dẫn trong khung chat
ai = ai.split('<b>Hỏi ngay khi chưa hiểu.</b>').join('<b>Có gì không hiểu thì hỏi bố.</b>').split('Bôi đen một đoạn trong bài để hỏi riêng về đoạn đó, hoặc gõ câu hỏi về mục đang đọc.').join('Bôi đen đoạn con thấy khó hiểu để bố giảng riêng, hoặc gõ câu hỏi về mục con đang đọc. Đừng để bố phải nhắc.').split('Hỏi về nội dung đang đọc…').join('Hỏi bố đi con…');
fs.writeFileSync(R + 'src/ai.js', ai); fs.writeFileSync(R + 'src/app.js', app); fs.writeFileSync(R + 'web/functions/_serve.js', srv); fs.writeFileSync(R + 'web/functions/_ai.js', aij);
console.log(miss.length ? 'THIẾU ' + miss : 'ok');
