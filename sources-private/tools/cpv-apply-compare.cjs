// Áp dụng kết quả so sánh với bộ đề CPV thứ hai: thêm câu Condensation, thống nhất câu lặp, LoG→Canny, trả 123/264 về đáp án nguồn.
const fs = require('fs'), R = 'D:/Downloads/SSG105 app/';
const J = f => JSON.parse(fs.readFileSync(R + f, 'utf8')), W = (f, o) => fs.writeFileSync(R + f, typeof o === 'string' ? o : JSON.stringify(o, null, 2) + '\n');
const raw = J('web/data/cpv-questions.json');
const q = id => raw.find(x => x.id === id);
// 1. câu lặp "NOT an application of image alignment": raw 34 (đại diện sau gộp) phải trùng raw 41
q(34).answer = q(41).answer.slice();
// 2. LoG: chọn Canny
q(120).answer = [q(120).options.findIndex(o => /^Canny/i.test(o))];
// 3. trả về đáp án theo nguồn slide
q(123).answer = [q(123).options.findIndex(o => /Deterministic/i.test(o))];
q(264).answer = [q(264).options.findIndex(o => /eliminates edge information/i.test(o))];
// 4. thêm câu Condensation (cuối mảng để giữ nguyên ID hiển thị của các câu cũ)
const nid = Math.max(...raw.map(x => x.id)) + 1;
if (!raw.some(x => /factored sampling/i.test(x.question))) raw.push({ id: nid, slide: 16, topic: q(123).topic, section: 'Điền vào chỗ trống', question: '_____ is based on factored sampling but extended to apply iteratively to successive images in a sequence.', options: ['Feature descriptor', 'Condensation', 'Feature matching', 'Hough transform'], answer: [1], multi: false, explanation: 'Đáp án B: Condensation (Conditional Density Propagation). Đây là thuật toán theo dõi đối tượng dựa trên factored sampling (lấy mẫu có trọng số) và được mở rộng để áp dụng lặp đi lặp lại cho các ảnh liên tiếp trong một chuỗi, về bản chất là một bộ lọc hạt (particle filter). Feature descriptor dùng để mô tả đặc trưng cục bộ, feature matching dùng để ghép đặc trưng giữa các ảnh, còn Hough transform phát hiện đường hoặc hình dạng bằng cách bỏ phiếu; cả ba đều không phải kỹ thuật lấy mẫu lặp theo chuỗi ảnh.', figure: false, needs_review: false, review_note: '' });
W('web/data/cpv-questions.json', JSON.stringify(raw));
// 5. lời giải
const e = J('sources-private/explain-out-cpv/cpv-901.json');
e['120'] = 'Đáp án B: Canny operator. Laplacian of Gaussian (LoG) là phép làm mượt ảnh bằng Gaussian rồi lấy đạo hàm bậc hai (Laplacian), thường gắn với Marr–Hildreth. Trong các lựa chọn, Canny là toán tử phát hiện biên duy nhất bắt đầu bằng làm mượt Gaussian rồi tìm biên nên gần với LoG nhất, còn Prewitt và Sobel (3x3, 5x5) chỉ là mặt nạ đạo hàm bậc nhất. Lưu ý: chữ ẩn trên slide gốc ghi D (Sobel 5x5), còn một bộ đề khác ghi Canny; web chọn Canny vì hợp lý hơn về lý thuyết.';
e['123'] = 'Lưu ý: bộ đề gốc ghi B (Deterministic method) và web giữ đáp án này theo nguồn đề, nhưng theo giáo trình đáp án đúng là A (Multi-view based method). Trong hệ phân loại object tracking thường dùng, kernel tracking gồm các mô hình appearance dựa trên template, density và multi-view, còn Deterministic và Probabilistic thuộc nhóm point tracking, Shape matching thuộc silhouette tracking. Nếu đề thi theo bộ đề gốc thì chọn B.';
e['264'] = 'Lưu ý: bộ đề gốc ghi D (loại bỏ thông tin biên bằng cách ngắt kết nối các pixel lân cận) và web giữ đáp án này theo nguồn đề, nhưng theo giáo trình đáp án đúng là C (tổ chức tập edge pixels chưa có thứ tự thành danh sách biên có thứ tự). Sau edge detection, edge linking nối các điểm biên lân cận có cùng hướng thành đường biên liên tục. Nếu đề thi theo bộ đề gốc thì chọn D.';
W('sources-private/explain-out-cpv/cpv-901.json', e);
const s = J('sources-private/explain-out-cpv/cpv-900.json');
s['32'] = 'Đáp án A: Identifying document templates. Image alignment (căn chỉnh ảnh) dùng để ghép các ảnh thành panorama, so sánh các ảnh quét của cùng một mô tại các thời điểm khác nhau và chỉnh lại tài liệu được chụp hoặc quét cho thẳng, rõ. Còn nhận diện mẫu tài liệu là bài toán nhận dạng, phân loại chứ không phải ứng dụng của căn chỉnh ảnh, nên đó là lựa chọn "không phải" (NOT) cần tìm.';
W('sources-private/explain-out-cpv/cpv-900.json', s);
// 6. bản dịch cho câu mới (ID hiển thị = số câu sau gộp + 1)
const uniq = new Set(raw.map(x => (x.question + '||' + [...x.options].sort().join('|')).toLowerCase().replace(/\s+/g, ' '))).size;
W('sources-private/translate-out-cpv/cpv-902.json', { [String(uniq)]: { q: '_____ dựa trên factored sampling nhưng được mở rộng để áp dụng lặp đi lặp lại cho các ảnh liên tiếp trong một chuỗi.', options: ['Bộ mô tả đặc trưng (Feature descriptor)', 'Condensation', 'Ghép đặc trưng (Feature matching)', 'Biến đổi Hough (Hough transform)'] } });
console.log('ok; câu mới id', nid, '→ ID hiển thị', uniq, '| 120', q(120).answer, '123', q(123).answer, '264', q(264).answer, '34', q(34).answer, '41', q(41).answer);
