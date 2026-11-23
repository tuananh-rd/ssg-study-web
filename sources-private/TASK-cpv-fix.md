# Nhiệm vụ bổ sung: OCR 10 slide CPV301 (slide 049 → 058)

Thư mục làm việc: `D:\Downloads\SSG105 app\sources-private`

Làm đúng như `TASK-cpv-ocr.md` (đọc kỹ file đó, giữ nguyên định dạng và quy tắc), nhưng chỉ cho **10 ảnh**:
`cpv-slides-real/slide-049.png` … `cpv-slides-real/slide-058.png`.

- Trường `slide` = số trong tên file (49 … 58). Dùng ĐÚNG tên trường như trong TASK-cpv-ocr.md: `slide, topic, section, question, options, answer, multi, explanation, figure, needs_review, review_note`.
- Chữ ẩn của slide lấy từ `cpv-slide-text.json` theo khoá là số slide thật (49 … 58).
- Một số slide trong dải này có thể không phải câu hỏi hoặc là bài giải thích dài: nếu vậy bỏ qua và ghi vào báo cáo.
- KHÔNG chạy lệnh shell. Chỉ xem ảnh, đọc file, ghi file.
- Ghi kết quả vào `ocr-batch/batch-fix-49-58.json` (một mảng JSON hợp lệ) và `cpv-ocr-report-fix.md`.
