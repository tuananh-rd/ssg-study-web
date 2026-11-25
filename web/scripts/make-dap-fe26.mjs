// Tạo dữ liệu cho đề DAP391m FE Fall 2026 (nguồn: web/data/dap-fe-fa26.json, tách từ file Word "Đề, đáp án và giải thích").
//  - web/data/dap-extra.json: các câu CHƯA có trong bộ đề DAP (thêm vào bộ đề, có giải thích tiếng Việt)
//  - web/data/dap-past.json: nguyên đề (49 câu 1 đáp án) để làm ở "Thi thử → Đề kì trước" và "Luyện tập → Đề kì trước"
//  - sources-private/translate-out-dap/dap-801.json: bản dịch tiếng Việt cho các câu mới trong bộ đề
// Chạy: node web/scripts/make-dap-fe26.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const W = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), ROOT = path.join(W, '..');
const fe = JSON.parse(fs.readFileSync(path.join(W, 'data', 'dap-fe-fa26.json'), 'utf8'));
const t = fs.readFileSync(path.join(W, 'data', 'dap-data.js'), 'utf8'), bank = JSON.parse(t.match(/window\.QUESTIONS\s*=\s*([\s\S]*?);\s*$/)[1]);
const maxId = Math.max(...bank.map(x => x.id));

// Câu giải thích bị thiếu trong file Word
const EXTRA_EXP = { 42: 'REST API cho phép các ứng dụng giao tiếp với một dịch vụ web qua giao thức HTTP (GET, POST, PUT, DELETE).', 45: 'Giai đoạn Ask (đặt câu hỏi) là lúc xác định vấn đề và mục tiêu của dự án phân tích.' };

// Câu đã có trong bộ đề DAP (cùng nội dung, cùng đáp án) → không thêm lại vào bộ đề, vẫn nằm trong nguyên đề
const DUP = new Set([14, 17, 19, 22, 23, 25, 26, 29, 30, 31, 32, 33, 35, 38, 40, 44, 46, 47, 48, 49, 50]);

// Chủ đề (topic) của bộ đề cho các câu mới
const TOPIC = { 1: 'Python cơ bản & NumPy', 2: 'Pandas & xử lý dữ liệu', 3: 'Matplotlib & Seaborn', 4: 'Biểu đồ & trực quan hoá', 5: 'Folium & bản đồ', 6: 'Watson Assistant & Chatbot', 7: 'Pandas & xử lý dữ liệu', 8: 'Biểu đồ & trực quan hoá', 9: 'Pandas & xử lý dữ liệu', 10: 'Matplotlib & Seaborn', 11: 'Folium & bản đồ', 12: 'Thống kê', 13: 'Quy trình phân tích dữ liệu', 15: 'Hồi quy (Linear, Polynomial, Ridge, Lasso)', 16: 'Tối ưu mô hình (CV, GridSearch, Pipeline)', 18: 'Dash & Dashboard', 20: 'Watson Assistant & Chatbot', 21: 'Biểu đồ & trực quan hoá', 24: 'Pandas & xử lý dữ liệu', 27: 'Watson Assistant & Chatbot', 28: 'Pandas & xử lý dữ liệu', 34: 'Watson Assistant & Chatbot', 36: 'Thu thập dữ liệu (API, Web scraping)', 37: 'Phân loại & đánh giá', 39: 'Pandas & xử lý dữ liệu', 41: 'Matplotlib & Seaborn', 42: 'Thu thập dữ liệu (API, Web scraping)', 43: 'Watson Assistant & Chatbot', 45: 'Quy trình phân tích dữ liệu' };

// Mục lý thuyết (chương "Tổng hợp theo bộ đề", m7) liên quan đến từng câu của đề
const REF = { 1: '7.2', 2: '7.5', 3: '7.9', 4: '7.8', 5: '7.11', 6: '7.23', 7: '7.4', 8: '7.8', 9: '7.6', 10: '7.3', 11: '7.11', 12: '7.7', 13: '7.1', 14: '7.6', 15: '7.16', 16: '7.17', 17: '7.1', 18: '7.12', 19: '7.22', 20: '7.22', 21: '7.8', 22: '7.6', 23: '7.21', 24: '7.4', 25: '7.1', 26: '7.23', 27: '7.24', 28: '7.4', 29: '7.1', 30: '7.23', 31: '7.14', 32: '7.14', 33: '7.16', 34: '7.23', 35: '7.21', 36: '7.14', 38: '7.21', 39: '7.4', 40: '7.16', 41: '7.9', 42: '7.13', 43: '7.24', 44: '7.1', 45: '7.1', 46: '7.1', 47: '7.8', 48: '7.9', 49: '7.11', 50: '7.9' };

// Bản dịch tiếng Việt cho các câu mới trong bộ đề: [câu hỏi, [đáp án theo thứ tự trong đề]] (đáp án chứa tên hàm/mã giữ nguyên)
const VI = {
 1: ['Trong Linux, cần đưa gì cho lệnh chmod để đặt một loại quyền cụ thể cho file?', ['Gán ID cho lệnh', 'Gán tên người dùng cho lệnh', 'Gán quản trị viên cho lệnh', 'Gán một chế độ (mode) cho lệnh']],
 2: ['Kết quả của: df = pd.DataFrame({\'A\':[1,2,None,4]}); df[\'A\'] = df[\'A\'].fillna(df[\'A\'].mean()) là gì?', ['Giá trị thiếu được thay bằng khoảng 2,33', 'Được thay bằng 0', 'Toàn bộ dòng bị xóa', 'Toàn bộ cột bị xóa']],
 3: ['Mô tả 3 tầng chính của kiến trúc Matplotlib.', null],
 4: ['Chọn mô tả đúng nhất về biểu đồ tròn (Pie chart).', ['So sánh giá trị của một biến tại một thời điểm', 'Biểu diễn phân phối tần suất', 'Đồ thị hình tròn chia thành các lát để minh họa tỉ lệ số liệu', 'Tổng tích lũy theo thời gian']],
 5: ['Có ba kiểu tile (nền bản đồ) của bản đồ Folium.', null],
 6: ['Phát biểu nào đúng về việc triển khai (deploy) ứng dụng chatbot?', ['Phải triển khai lại mỗi khi thêm một intent mới', 'Không cần triển khai lại mỗi khi thay đổi dialog', 'Phải xóa và tạo lại mỗi khi thay đổi dialog', 'Không cần triển khai lại chatbot mỗi khi thay đổi nội dung trong Watson Assistant']],
 7: ['Cần làm gì trước khi nhà phát triển có thể dùng thư viện pandas?', ['Xuất (exported)', 'Khai báo (declared)', 'Phải được nhập (imported)', 'Trích xuất (extracted)']],
 8: ['Biểu đồ nào cho thấy nhiều đại lượng thay đổi theo một biến có thứ tự, đồng thời nhấn mạnh thành phần tích lũy?', ['Biểu đồ vùng xếp chồng (stacked area plot)', 'Histogram', 'Word cloud', 'Biểu đồ cột']],
 9: ['Dòng mã đúng để thực hiện one-hot encoding cho cột "price"?', null],
 10: ['Thư viện nào cung cấp giao diện cấp cao cho đồ họa thống kê, xây dựng trên Matplotlib?', null],
 11: ['m = folium.Map(location=[10.03, 105.78], zoom_start=12) làm gì?', ['Tạo bản đồ có tâm tại tọa độ đó với mức zoom ban đầu 12', 'Thêm một marker', 'Tạo bản đồ Choropleth', 'Tạo biểu đồ cột']],
 12: ['Hệ số tương quan Pearson giữa X và Y nếu X = Y là bao nhiêu?', ['0', '-1', '1', '+vô cùng']],
 13: ['Vì sao kỹ năng giao tiếp quan trọng trong pha đầu tiên của phân tích dữ liệu?', ['Để liên hệ trực tiếp cập nhật tiến độ', 'Để truyền đạt kết quả cho các bên liên quan', 'Để thiết lập quy trình thay đổi', 'Để xác định các mục tiêu cụ thể của các bên liên quan']],
 15: ['Trong hồi quy tuyến tính đơn giản (simple linear regression), dùng bao nhiêu biến độc lập?', ['Một', 'Ba', 'Tùy mô hình', 'Không xác định được']],
 16: ['Dấu hiệu điển hình của overfitting là gì?', ['Sai số huấn luyện và sai số kiểm tra đều cao', 'Sai số huấn luyện rất thấp nhưng sai số kiểm tra cao hơn đáng kể', 'Hiệu năng cao tương tự trên cả hai tập', 'Mô hình không có đặc trưng nào']],
 18: ['px.line(df, x=\'Year\', y=\'Sales\'); fig.show() tạo ra gì?', ['Một biểu đồ đường Plotly thể hiện Sales theo Year', 'Histogram của Matplotlib', 'Bản đồ Folium', 'Biểu đồ hồi quy của Seaborn']],
 20: ['Khi thêm một dialog vào dialog skill, những node nào được tự động thêm?', null],
 21: ['Trong heatmap, cường độ màu biểu thị điều gì?', ['Số lượng biến', 'Phạm vi giá trị', 'Kiểu dữ liệu của mỗi cột', 'Độ lớn của giá trị trong mỗi ô']],
 24: ['Phương thức mean() của một đối tượng GroupBy tính gì?', ['Trung bình của mỗi nhóm', 'Yếu vị (mode)', 'Độ lệch chuẩn', 'Trung vị']],
 27: ['POST /v1/synthesize trong IBM Text to Speech dùng để làm gì?', ['Chuyển văn bản thành âm thanh giọng nói tổng hợp', 'Chuyển giọng nói thành văn bản', 'Tạo một bảng cơ sở dữ liệu', 'Gửi một tin nhắn chatbot']],
 28: ['Phương thức nào trả về tóm tắt của tất cả các cột?', null],
 34: ['Điều nào đúng khi triển khai chatbot trên Facebook?', ['Trừ khi bạn công khai ứng dụng Facebook, bạn cần thêm người thử nghiệm (tester) thủ công để cấp quyền truy cập cho họ', 'Cấp quyền để lưu trữ trên một máy chủ cụ thể', 'Quyền riêng tư công khai, bao gồm cả tập dữ liệu huấn luyện', 'Quyền riêng tư công khai, trừ tập dữ liệu huấn luyện']],
 36: ['Một kỹ sư dữ liệu dùng BeautifulSoup để thu thập bản ghi các lần phóng tên lửa mà không có API. Nguồn hoặc định dạng nào được phân tích?', ['Một nguồn cấp JSON', 'Tệp CSV đính kèm', 'Một bảng HTML nhúng trong trang Wikipedia', 'Một sitemap XML']],
 37: ['Tác động của việc tăng tham số điều chuẩn C trong SVM là gì? (Chọn 2 đáp án)', ['Tăng nguy cơ overfitting', 'Mở rộng lề (margin)', 'Siết chặt ranh giới quyết định', 'Giảm ảnh hưởng của các support vector']],
 39: ['Phương thức pandas nào chuyển một cột sang kiểu dữ liệu được chỉ định?', null],
 41: ['plt.plot([1,2,3], [2,4,6]) tạo ra gì?', ['Một biểu đồ đường nối các điểm', 'Histogram', 'Biểu đồ cột', 'Biểu đồ tròn']],
 42: ['REST API cho phép các ứng dụng giao tiếp với một dịch vụ ___ qua HTTP.', ['web', 'hạ tầng', 'cơ sở dữ liệu', 'nền tảng']],
 43: ['Trong dịch vụ Watson, DQL là viết tắt của gì?', null],
 45: ['Nhà phân tích nên xác định vấn đề ở giai đoạn nào?', ['Giai đoạn ask', 'Prepare', 'Process', 'Analysis']]
};

const lenSec = q => q.length < 80 ? 'Câu ngắn' : q.length < 160 ? 'Câu trung bình' : 'Câu dài';
const extra = [], trans = {}, idOf = {};
let nid = maxId;
for (const f of fe) {
  if (DUP.has(f.no)) continue;
  const id = ++nid; idOf[f.no] = id;
  const exp = f.exp || EXTRA_EXP[f.no] || '';
  extra.push({ id, slide: null, topic: TOPIC[f.no], section: f.answer.length > 1 ? 'Nhiều đáp án' : lenSec(f.q), question: f.q, options: f.options, answer: f.answer, multi: f.answer.length > 1, explanation: exp, source: 'FE Fall 2026' });
  const v = VI[f.no]; if (!v) throw new Error('Thiếu bản dịch câu ' + f.no);
  trans[id] = { q: v[0], options: v[1] || f.options };
}
// nguyên đề: 49 câu một đáp án (câu 37 chọn 2 đáp án nằm trong bộ đề, vì phần Thi thử chỉ hỗ trợ câu một đáp án)
const items = fe.filter(f => f.answer.length === 1).map(f => ({ no: f.no, ref: REF[f.no], q: f.q, options: f.options, answer: f.answer[0], explain: f.exp || EXTRA_EXP[f.no] || '' }));
const past = { exams: [{ id: 'fe-fa26', title: 'Đề FE Fall 2026 – DAP391m_FA26_FE_758855', n: items.length, minutes: 60 }], module: 'm7', items };

fs.writeFileSync(path.join(W, 'data', 'dap-extra.json'), JSON.stringify(extra, null, 1));
fs.writeFileSync(path.join(W, 'data', 'dap-past.json'), JSON.stringify(past, null, 1));
fs.writeFileSync(path.join(ROOT, 'sources-private', 'translate-out-dap', 'dap-801.json'), JSON.stringify(trans, null, 1));
console.log('Câu mới vào bộ đề:', extra.length, '(id ' + (maxId + 1) + '–' + nid + ') | nguyên đề:', items.length, 'câu | bản dịch:', Object.keys(trans).length);
console.log('Ánh xạ số câu đề → id bộ đề:', JSON.stringify(idOf));
