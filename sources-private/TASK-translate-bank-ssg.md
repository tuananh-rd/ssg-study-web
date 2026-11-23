# Nhiệm vụ: dịch câu hỏi trắc nghiệm môn SSG105 – kỹ năng mềm từ tiếng Anh sang tiếng Việt

Thư mục làm việc: `D:\Downloads\SSG105 app\sources-private`

## Đầu vào
Thư mục `translate-in-ssg` có 24 file `ssg-01.json` … mỗi file là mảng ~20 câu:
```json
{ "id": 12, "question": "English question", "options": ["A text", "B text", "C text", "D text"] }
```

## Việc cần làm
Với MỖI câu, dịch câu hỏi và TỪNG đáp án sang tiếng Việt tự nhiên, chính xác, đúng văn phong học thuật cho sinh viên:
- Giữ nguyên thuật ngữ chuyên ngành bằng tiếng Anh trong ngoặc ở lần đầu, ví dụ "chuẩn hoá (normalization)". Tên hàm, thư viện, code, công thức, ký hiệu giữ nguyên, không dịch.
- Giữ nguyên số lượng và THỨ TỰ đáp án (đáp án thứ i của bản dịch phải tương ứng đáp án thứ i của bản gốc). Không gộp, không thêm, không bỏ. Đáp án dạng "All of the above", "None of the above" dịch sát nghĩa.
- Câu có chỗ trống "_____" giữ nguyên chỗ trống.
- Chỉ dịch, không giải thích, không đổi nghĩa.

## Cách làm (QUAN TRỌNG)
- KHÔNG chạy lệnh shell. Chỉ đọc file và ghi file.
- Với mỗi file `translate-in-ssg/ssg-NN.json` ghi ĐÚNG MỘT file `translate-out-ssg/ssg-NN.json` là object JSON hợp lệ, khoá là id câu (chuỗi): `{ "12": { "q": "Câu hỏi đã dịch", "options": ["…","…","…","…"] } }`. Mọi câu đều phải có mặt và `options` đúng bằng số đáp án gốc.
- Làm theo thứ tự 01, 02, … Nếu file kết quả đã tồn tại thì bỏ qua.
- Không sửa/xoá file nào khác. Khi xong ghi `translate-out-ssg/report.md` (số file, số câu).
