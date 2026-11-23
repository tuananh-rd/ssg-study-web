# Nhiệm vụ: soạn sẵn lời giải thích cho từng câu trắc nghiệm môn SSG105 – kỹ năng mềm (giao tiếp, làm việc nhóm, thuyết trình, nghề nghiệp)

Thư mục làm việc: `D:\Downloads\SSG105 app\sources-private`

## Đầu vào
Thư mục `explain-in-ssg` có 19 file `ssg-01.json` … (mỗi file là mảng ~25 câu):
```json
{ "id": 12, "question": "…", "options": ["…"], "correct": ["đáp án đúng theo bộ đề"], "slide_image": "đường dẫn ảnh slide (chỉ có ở CPV)" }
```

## Việc cần làm
Với MỖI câu, viết lời giải thích tiếng Việt cho sinh viên đang ôn thi:
- 3–6 dòng, tối đa ~110 từ, văn phong rõ ràng, chuyên nghiệp, trung tính (không xưng hô, không đùa).
- Dòng đầu: nêu đáp án đúng và lý do cốt lõi (khái niệm/công thức/quy tắc làm nên đáp án).
- Tiếp theo: một dòng cho mỗi đáp án sai quan trọng, nói vì sao sai hoặc dễ nhầm với cái gì (có thể gộp nếu ngắn).
- Dòng cuối (tuỳ chọn): một mẹo ghi nhớ ngắn bắt đầu bằng "Mẹo nhớ:".
- Giữ nguyên thuật ngữ tiếng Anh, code viết trong dấu ``.
- Câu có nhiều đáp án đúng: giải thích từng đáp án đúng.
- Câu có `slide_image` (hình/công thức trong slide): mở ảnh đó bằng công cụ xem ảnh để hiểu câu hỏi trước khi giải thích.
- Tự giải độc lập trước. Nếu đáp án bộ đề có vẻ SAI hoặc câu mơ hồ, vẫn giải thích theo đáp án bộ đề nhưng thêm cuối lời giải một dòng bắt đầu bằng "Lưu ý:" nêu rõ nghi ngờ và đáp án bạn cho là đúng.
- Không dùng bảng Markdown. Được dùng **đậm** và gạch đầu dòng "- ".

## Cách làm (QUAN TRỌNG)
- KHÔNG chạy lệnh shell. Chỉ đọc file, xem ảnh và ghi file.
- Với mỗi file đầu vào `explain-in-ssg/ssg-NN.json` ghi ĐÚNG MỘT file kết quả `explain-out-ssg/ssg-NN.json` là một object JSON hợp lệ: khoá là id câu (chuỗi), giá trị là lời giải. Ví dụ: `{ "12": "**Đáp án đúng: …** …" }`. Mọi câu trong file đầu vào đều phải có mặt.
- Làm xong file nào ghi ngay file đó rồi mới sang file sau, theo thứ tự 01, 02, … Nếu file kết quả đã tồn tại thì bỏ qua (để chạy lại không làm lại).
- Không sửa/xoá file nào khác.

## Khi xong
Ghi `explain-out-ssg/report.md`: số file đã làm, số câu, danh sách id có dòng "Lưu ý:".
