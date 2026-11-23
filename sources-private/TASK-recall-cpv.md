# Nhiệm vụ: viết câu hỏi "hỏi lại lý thuyết" cho môn CPV301

Thư mục làm việc: `D:\Downloads\SSG105 app\sources-private`

## Đầu vào
`lessons-cpv.json`: `{ subject, modules: [ { id: "m1", title, sections: [ { id: "1.2", t: "tên mục", h: "<nội dung HTML>" } ] } ] }`

## Việc cần làm
Với **mỗi mục** (section), viết câu hỏi trắc nghiệm tiếng Việt để sinh viên tự kiểm tra đã nắm chắc lý thuyết của mục đó:
- Số câu theo độ dài nội dung mục: mục ngắn (dưới ~600 ký tự chữ) 3 câu; mục vừa 4–5 câu; mục dài (trên ~2500 ký tự) 6–8 câu. Mục chỉ là lời dẫn/trống thì 0 câu (ghi vào báo cáo).
- Chỉ hỏi những gì **có trong nội dung mục đó**: định nghĩa, công dụng, thành phần, thứ tự các bước, công thức, tham số/hàm quan trọng, so sánh hai khái niệm, ý nghĩa một chỉ số. **Không** hỏi câu tình huống lan man, không hỏi chi tiết vụn vặt (tên biến demo, tên file ví dụ).
- Mỗi câu có đúng 1 đáp án đúng + 3 đáp án sai. Đáp án sai phải **hợp lý, dễ nhầm** (lấy từ khái niệm khác trong cùng mục/chương), độ dài tương đương đáp án đúng, không trùng nhau. Không dùng "Tất cả đều đúng", "Cả A và B".
- Giữ nguyên thuật ngữ tiếng Anh trong ngoặc khi có (vd "Chuẩn hoá (Normalization)"). Code/hàm viết y như tài liệu (vd `df.dropna()`).
- `explain`: 1–2 câu giải thích vì sao đúng, bám nội dung mục.
- `tip` (tuỳ chọn): mẹo nhớ ngắn nếu có ý hay, không thì bỏ trường.

## Cách làm (QUAN TRỌNG)
- KHÔNG chạy lệnh shell. Chỉ đọc file và ghi file.
- Mỗi chương ghi **một file** `recall-cpv/m1.json`, `recall-cpv/m2.json`, … (thư mục `recall-cpv`). Mỗi file là một mảng JSON hợp lệ các object:
```json
{ "ref": "1.2", "q": "…?", "correct": "…", "wrong": ["…", "…", "…"], "explain": "…", "tip": "…" }
```
- `ref` = đúng `id` của mục trong lessons-cpv.json.
- Làm xong chương nào ghi ngay chương đó rồi mới sang chương sau.

## Khi xong
Ghi `recall-cpv/report.md`: số câu theo từng mục, các mục bỏ qua và lý do. Không sửa/xoá file nào khác.

