# Nhiệm vụ: dịch câu hỏi ôn lý thuyết môn DAP391m – Data Science từ tiếng Việt sang tiếng Anh

Thư mục làm việc: `D:\Downloads\SSG105 app\sources-private`

## Đầu vào
Thư mục `translate-recall-in-dap` có 5 file `dap-01.json` … mỗi file là mảng ~25 câu:
```json
{ "id": "r-m1-001", "q": "Câu hỏi tiếng Việt", "correct": "Đáp án đúng", "wrong": ["Sai 1", "Sai 2", "Sai 3"] }
```

## Việc cần làm
Dịch câu hỏi, đáp án đúng và 3 đáp án sai sang tiếng Anh chuẩn, tự nhiên, đúng văn phong đề thi trắc nghiệm đại học:
- Dùng đúng thuật ngữ chuyên ngành tiếng Anh. Phần trong ngoặc là thuật ngữ gốc tiếng Anh thì dùng luôn làm bản dịch. Tên hàm, thư viện, code, công thức giữ nguyên.
- Đáp án đúng vẫn là đáp án đúng, 3 đáp án sai vẫn là 3 đáp án sai (đúng thứ tự như bản gốc). Không đổi nghĩa, không thêm giải thích.

## Cách làm (QUAN TRỌNG)
- KHÔNG chạy lệnh shell. Chỉ đọc file và ghi file.
- Với mỗi file `translate-recall-in-dap/dap-NN.json` ghi ĐÚNG MỘT file `translate-recall-out-dap/dap-NN.json` là object JSON hợp lệ, khoá là id câu: `{ "r-m1-001": { "q": "English question", "correct": "…", "wrong": ["…","…","…"] } }`. Mọi câu đều phải có mặt, `wrong` đúng 3 phần tử.
- Làm theo thứ tự 01, 02, … Nếu file kết quả đã tồn tại thì bỏ qua.
- Không sửa/xoá file nào khác. Khi xong ghi `translate-recall-out-dap/report.md` (số file, số câu).
