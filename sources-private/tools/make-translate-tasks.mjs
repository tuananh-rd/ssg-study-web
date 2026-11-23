import fs from 'node:fs';
const SP = 'D:/Downloads/SSG105 app/sources-private/';
const subj = { ssg: ['SSG105 – kỹ năng mềm', 24, 21], dap: ['DAP391m – Data Science', 14, 5], ail: ['AIL303m – Machine Learning', 10, 7], cpv: ['CPV301 – Computer Vision', 15, 6] };
const WD = 'D:\\Downloads\\SSG105 app\\sources-private';
for (const [k, [name, nb, nr]] of Object.entries(subj)) {
  const bank = `# Nhiệm vụ: dịch câu hỏi trắc nghiệm môn ${name} từ tiếng Anh sang tiếng Việt

Thư mục làm việc: \`${WD}\`

## Đầu vào
Thư mục \`translate-in-${k}\` có ${nb} file \`${k}-01.json\` … mỗi file là mảng ~20 câu:
\`\`\`json
{ "id": 12, "question": "English question", "options": ["A text", "B text", "C text", "D text"] }
\`\`\`

## Việc cần làm
Với MỖI câu, dịch câu hỏi và TỪNG đáp án sang tiếng Việt tự nhiên, chính xác, đúng văn phong học thuật cho sinh viên:
- Giữ nguyên thuật ngữ chuyên ngành bằng tiếng Anh trong ngoặc ở lần đầu, ví dụ "chuẩn hoá (normalization)". Tên hàm, thư viện, code, công thức, ký hiệu giữ nguyên, không dịch.
- Giữ nguyên số lượng và THỨ TỰ đáp án (đáp án thứ i của bản dịch phải tương ứng đáp án thứ i của bản gốc). Không gộp, không thêm, không bỏ. Đáp án dạng "All of the above", "None of the above" dịch sát nghĩa.
- Câu có chỗ trống "_____" giữ nguyên chỗ trống.
- Chỉ dịch, không giải thích, không đổi nghĩa.

## Cách làm (QUAN TRỌNG)
- KHÔNG chạy lệnh shell. Chỉ đọc file và ghi file.
- Với mỗi file \`translate-in-${k}/${k}-NN.json\` ghi ĐÚNG MỘT file \`translate-out-${k}/${k}-NN.json\` là object JSON hợp lệ, khoá là id câu (chuỗi): \`{ "12": { "q": "Câu hỏi đã dịch", "options": ["…","…","…","…"] } }\`. Mọi câu đều phải có mặt và \`options\` đúng bằng số đáp án gốc.
- Làm theo thứ tự 01, 02, … Nếu file kết quả đã tồn tại thì bỏ qua.
- Không sửa/xoá file nào khác. Khi xong ghi \`translate-out-${k}/report.md\` (số file, số câu).
`;
  const rec = `# Nhiệm vụ: dịch câu hỏi ôn lý thuyết môn ${name} từ tiếng Việt sang tiếng Anh

Thư mục làm việc: \`${WD}\`

## Đầu vào
Thư mục \`translate-recall-in-${k}\` có ${nr} file \`${k}-01.json\` … mỗi file là mảng ~25 câu:
\`\`\`json
{ "id": "r-m1-001", "q": "Câu hỏi tiếng Việt", "correct": "Đáp án đúng", "wrong": ["Sai 1", "Sai 2", "Sai 3"] }
\`\`\`

## Việc cần làm
Dịch câu hỏi, đáp án đúng và 3 đáp án sai sang tiếng Anh chuẩn, tự nhiên, đúng văn phong đề thi trắc nghiệm đại học:
- Dùng đúng thuật ngữ chuyên ngành tiếng Anh. Phần trong ngoặc là thuật ngữ gốc tiếng Anh thì dùng luôn làm bản dịch. Tên hàm, thư viện, code, công thức giữ nguyên.
- Đáp án đúng vẫn là đáp án đúng, 3 đáp án sai vẫn là 3 đáp án sai (đúng thứ tự như bản gốc). Không đổi nghĩa, không thêm giải thích.

## Cách làm (QUAN TRỌNG)
- KHÔNG chạy lệnh shell. Chỉ đọc file và ghi file.
- Với mỗi file \`translate-recall-in-${k}/${k}-NN.json\` ghi ĐÚNG MỘT file \`translate-recall-out-${k}/${k}-NN.json\` là object JSON hợp lệ, khoá là id câu: \`{ "r-m1-001": { "q": "English question", "correct": "…", "wrong": ["…","…","…"] } }\`. Mọi câu đều phải có mặt, \`wrong\` đúng 3 phần tử.
- Làm theo thứ tự 01, 02, … Nếu file kết quả đã tồn tại thì bỏ qua.
- Không sửa/xoá file nào khác. Khi xong ghi \`translate-recall-out-${k}/report.md\` (số file, số câu).
`;
  fs.writeFileSync(SP + `TASK-translate-bank-${k}.md`, '\uFEFF' + bank);
  fs.writeFileSync(SP + `TASK-translate-recall-${k}.md`, '\uFEFF' + rec);
  for (const [kind, f] of [['bank', `TASK-translate-bank-${k}.md`], ['recall', `TASK-translate-recall-${k}.md`]]) {
    fs.writeFileSync(SP + `run-translate-${kind}-${k}.cmd`, `@echo off\r\ncd /d "${WD}"\r\n"C:\\Users\\tuana\\.gemini\\bin\\agy.exe" -p "Doc file ${f} trong thu muc hien tai va thuc hien day du nhiem vu. Tuyet doi khong chay lenh shell. Chi lam viec trong thu muc nay." --model gemini-3.8-flash-high --mode accept-edits > agy-translate-${kind}-${k}.log 2>&1\r\n`);
  }
}
console.log('ok');
