# Nhiệm vụ: kiểm tra lại đáp án bộ đề CPV301 từ ảnh slide gốc

Thư mục làm việc: `D:\Downloads\SSG105 app\sources-private`. **Không chạy lệnh shell**: chỉ xem ảnh (Read ảnh), đọc file, ghi file.

## Bối cảnh (đọc kỹ)
Bộ đề CPV301 được OCR từ ảnh slide. Đáp án đúng nằm trong "chữ ẩn" của slide (trường `hidden`). Lỗi cũ: số slide của chữ ẩn bị **lệch 2** so với tên file ảnh nên gần như mọi đáp án sai. Dữ liệu trong file input đã được ghép lại ĐÚNG (`hidden` là chữ ẩn của đúng slide đó), nhưng nhãn `slide` trong các `candidates` (câu hỏi đã OCR cũ) KHÔNG đáng tin, chỉ dùng để tìm lại câu hỏi và `id`.

## Đầu vào
`cpv-verify-in/batch-NN.json` — mảng, mỗi phần tử:
- `png`: đường dẫn ảnh (tương đối với thư mục làm việc), `png_no`: số slide.
- `hidden`: chữ ẩn của slide. Thường bắt đầu bằng chữ cái đáp án đúng (`"B"`, `"AB"` = nhiều đáp án), đôi khi sau đó là xuống dòng + giải thích tiếng Việt (có thể chứa nguyên văn đáp án đúng, dùng để đối chiếu). Có thể là `"Dấu ___"` hoặc nhãn không phải đáp án.
- `candidates`: các câu đã OCR cũ ở gần (có `id`, `question`, `options`, `answer_now` là đáp án CŨ có thể SAI).

## Việc cần làm cho MỖI phần tử
1. Xem ảnh `png`. Nếu không phải câu hỏi (trang tiêu đề, trang nhãn, trống) → `status:"skip"`.
2. Chép đề và các phương án đúng thứ tự **như trong ảnh** (A, B, C, D…, bỏ tiền tố "A."), chính xác nguyên văn. Công thức/ký hiệu viết dạng chữ.
3. Tìm trong `candidates` câu có CÙNG nội dung với ảnh (cho phép khác vài lỗi OCR). Có → `id` = id đó. Không có → `id: null`.
4. Đáp án: lấy chữ cái ở đầu `hidden` (A=0, B=1, …) theo thứ tự phương án trong ẢNH → `answer` là mảng chỉ số, `multi` = true nếu nhiều hơn 1. Nếu `hidden` không bắt đầu bằng chữ cái hợp lệ hoặc chữ cái vượt quá số phương án → `status:"unsure"`, nêu `suggest` (chỉ số) theo kiến thức Computer Vision và lý do ngắn trong `note`.
5. Kiểm tra hợp lý: đáp án theo `hidden` có đúng về kiến thức/ khớp phần giải thích trong `hidden` (nếu có) không? Nếu RÕ RÀNG sai (đối chiếu với giải thích trong hidden hoặc kiến thức chuẩn) → `status:"conflict"`, `answer` vẫn theo hidden, thêm `suggest` + `note` giải thích. Còn lại `status:"ok"`.
6. `figure: true` nếu câu cần xem hình/bảng/biểu đồ trong slide mới trả lời được.
7. `hidden_expl`: phần giải thích tiếng Việt trong `hidden` (sau chữ cái), chép nguyên văn; không có thì chuỗi rỗng.

## Đầu ra
Ghi `cpv-verify-out/batch-NN.json` (cùng NN với input) — mảng JSON HỢP LỆ, đúng thứ tự input, mỗi phần tử:
```json
{"png_no":16,"status":"ok|skip|unsure|conflict","id":5,"question":"...","options":["...","..."],"answer":[0],"multi":false,"figure":false,"suggest":null,"note":"","hidden_expl":""}
```
Làm theo từng cụm 4–5 slide rồi ghi file (ghi lại toàn bộ file sau mỗi cụm) để nếu bị ngắt vẫn còn kết quả. Cuối cùng đọc lại file, đảm bảo đủ số phần tử bằng input và JSON hợp lệ. Trả lời ngắn: số slide ok/skip/unsure/conflict.
