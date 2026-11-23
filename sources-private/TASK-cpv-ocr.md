# Nhiệm vụ: OCR bộ câu hỏi CPV301 từ ảnh slide → JSON

Thư mục làm việc: `D:\Downloads\SSG105 app\sources-private`

## Đầu vào
- `cpv-slides-png/slide-NNN.png` — 319 ảnh slide (slide 009 → 327). Mỗi slide thường là MỘT câu hỏi trắc nghiệm tiếng Anh (đề + các phương án A, B, C, D…), có thể kèm hình/biểu đồ/bảng/công thức. Bỏ qua watermark "FORU" và chữ "Hoàng Hoàng Buôn Source".
- `cpv-slide-text.json` — chữ ẩn trên từng slide, khoá là số slide. Thường là **đáp án đúng** dạng chữ cái (`"B"`, `"AB"` = chọn nhiều), đôi khi kèm giải thích tiếng Việt (giữ lại làm `explanation`). Một số slide có chữ không phải đáp án (vd `"Dấu ___"`, `"Dạng số"`, `"Choose the best"`, `"Not"`, `"Hình ảnh, biểu đồ"`): đó là **nhãn dạng câu** hoặc tiêu đề nhóm — tự xem ảnh để phán đoán.

## Cách làm (QUAN TRỌNG)
- **KHÔNG chạy lệnh shell/terminal** (bị chặn). Chỉ dùng công cụ **xem ảnh / đọc file** và **tạo / ghi file**.
- Làm theo lô 20 slide theo thứ tự (009–028, 029–048, …). Mỗi lô ghi ra MỘT file riêng trong thư mục `ocr-batch/`: `batch-01.json`, `batch-02.json`, … Mỗi file là một mảng JSON hợp lệ. Xong lô nào ghi ngay lô đó rồi mới sang lô sau; nếu bị ngắt thì làm tiếp từ lô chưa có file.
- Không cần đánh `id`; Claude sẽ đánh số khi gộp.

## Đầu ra mỗi câu
```json
{
  "slide": 9,
  "topic": "<một chủ đề trong danh sách bên dưới>",
  "section": "<dạng câu, vd: Câu ngắn | Nhiều đáp án | Dạng số | Hình ảnh, biểu đồ | Điền vào chỗ trống | NOT / EXCEPT | Công thức>",
  "question": "<đề bài tiếng Anh, chép CHÍNH XÁC từ ảnh, xuống dòng bằng \n>",
  "options": ["<phương án A, bỏ tiền tố 'A.'>", "<B>", "..."],
  "answer": [0],
  "multi": false,
  "explanation": "<giải thích tiếng Việt lấy từ cpv-slide-text.json nếu có, không thì để chuỗi rỗng>",
  "figure": false,
  "needs_review": false,
  "review_note": ""
}
```

Quy tắc:
1. Slide không phải câu hỏi (trang tiêu đề, trang trống) thì bỏ qua, ghi số slide vào báo cáo.
2. `answer` là chỉ số (0 = A) lấy từ chữ cái trong `cpv-slide-text.json`. `"AB"` → `[0,1]`, `multi: true`. Không có chữ cái đáp án hoặc không khớp số phương án → `answer: []`, `needs_review: true`, ghi lý do vào `review_note`.
3. Chép đề và phương án đúng nguyên văn (giữ chính tả gốc, ký hiệu toán viết dạng chữ thường, vd `sigma^2 * Laplacian(n_sigma * f)`; bảng chép thành các dòng `| ... |`). Không tự sửa nội dung, không dịch.
4. Câu phụ thuộc hình/biểu đồ/bảng trong slide → `figure: true` (web sẽ hiện ảnh slide kèm câu hỏi).
5. Chữ không đọc chắc chắn → vẫn chép phỏng đoán tốt nhất, đặt `needs_review: true` + ghi chú.
6. `topic` chọn đúng MỘT trong: `Ảnh số & thu nhận ảnh` · `Màu sắc & histogram` · `Lọc ảnh & tích chập` · `Miền tần số & Fourier` · `Biên & đặc trưng (edge, corner, SIFT…)` · `Phân đoạn & phân cụm` · `Hình thái học` · `Biến đổi hình học & ghép ảnh` · `Camera, stereo & 3D` · `Chuyển động & optical flow` · `Nhận dạng & học máy` · `Khác`.

## Khi xong
- Ghi `cpv-ocr-report.md`: tổng số câu đã ghi, các slide bị bỏ qua và lý do, các slide `needs_review` kèm lý do.
- Không sửa, xoá hay di chuyển file nào khác (ngoài thư mục `ocr-batch/` và `cpv-ocr-report.md`).
