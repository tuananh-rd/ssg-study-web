# Báo cáo OCR & Xử lý Bộ Câu hỏi CPV301 từ Slide sang JSON

**Thư mục làm việc:** `D:\Downloads\SSG105 app\sources-private`  
**Ngày thực hiện:** 21/11/2026  
**Nhiệm vụ:** OCR toàn bộ 319 slide ảnh (`slide-009.png` đến `slide-327.png`) kết hợp siêu dữ liệu từ `cpv-slide-text.json` thành 16 tệp lô JSON và xuất báo cáo tổng hợp.

---

## 1. Tổng quan kết quả thực hiện

- **Tổng số slide trong thư mục:** 319 slide (`slide-009.png` → `slide-327.png`).
- **Tổng số câu hỏi trắc nghiệm đã ghi:** **311 câu**.
- **Tổng số slide bị bỏ qua (không phải câu hỏi):** **8 slide** (trang tiêu đề mục, trang trống/logo).
- **Tổng số slide đánh dấu cần xem xét (`needs_review: true`):** **4 slide**.
- **Số lượng lô tạo thành:** **16 lô** (`batch-01.json` đến `batch-16.json`), lưu tại thư mục `ocr-batch/`.

---

## 2. Thống kê chi tiết từng lô (Batch Breakdown)

| Lô | Tên tệp | Khoảng Slide | Số câu hỏi | Số slide bỏ qua | Slide `needs_review` | Ghi chú |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **01** | `ocr-batch/batch-01.json` | 009 – 028 | 20 | 0 | Slide 015 | Nhóm Hình ảnh, biểu đồ / Công thức |
| **02** | `ocr-batch/batch-02.json` | 029 – 048 | 19 | 1 (slide 043) | Không | Slide 043 là tiêu đề "Not" |
| **03** | `ocr-batch/batch-03.json` | 049 – 068 | 15 | 4 (slide 049, 051, 055, 068) | Slide 053 | Slides 049, 051 trống/logo; 055 "Dạng số", 068 "Choose the best" |
| **04** | `ocr-batch/batch-04.json` | 069 – 088 | 20 | 0 | Không | Slides 070–080 có kèm giải thích tiếng Việt |
| **05** | `ocr-batch/batch-05.json` | 089 – 108 | 19 | 1 (slide 102) | Không | Slide 102 là tiêu đề "Câu ngắn" |
| **06** | `ocr-batch/batch-06.json` | 109 – 128 | 20 | 0 | Không | Slides 109 và 111 là câu trùng lặp trong deck gốc |
| **07** | `ocr-batch/batch-07.json` | 129 – 148 | 20 | 0 | Không | Slide 137 có giải thích tiếng Việt |
| **08** | `ocr-batch/batch-08.json` | 149 – 168 | 20 | 0 | Không | |
| **09** | `ocr-batch/batch-09.json` | 169 – 188 | 20 | 0 | Không | Slides 183–188 có giải thích tiếng Việt |
| **10** | `ocr-batch/batch-10.json` | 189 – 208 | 19 | 1 (slide 191) | Không | Slide 191 là tiêu đề "Câu trung bình"; slide 189 có giải thích |
| **11** | `ocr-batch/batch-11.json` | 209 – 228 | 20 | 0 | Không | |
| **12** | `ocr-batch/batch-12.json` | 229 – 248 | 20 | 0 | Không | Slides 247, 248 có giải thích tiếng Việt |
| **13** | `ocr-batch/batch-13.json` | 249 – 268 | 19 | 1 (slide 252) | Không | Slide 252 là tiêu đề "Câu dài"; slides 249, 250 có giải thích |
| **14** | `ocr-batch/batch-14.json` | 269 – 288 | 20 | 0 | Slide 278 | Slide 278 nghi ngờ đáp án key D vs C |
| **15** | `ocr-batch/batch-15.json` | 289 – 308 | 20 | 0 | Slide 305 | Key 307 trong json bị rỗng, phán đoán đáp án B |
| **16** | `ocr-batch/batch-16.json` | 309 – 327 | 19 | 0 | Không | Slides 321–327 có giải thích chi tiết; 326 & 327 trùng lặp |
| **TỔNG** | **16 tệp** | **009 – 327** | **311** | **8** | **4** | **319 slide đã kiểm tra đầy đủ** |

---

## 3. Danh sách các slide bị bỏ qua (Skipped Slides)

Các slide dưới đây được bỏ qua vì không chứa câu hỏi trắc nghiệm hoặc bài tập:

1. **`slide-043.png`**: Trang phân cách tiêu đề nhóm `"Not"` (các câu hỏi dạng phủ định NOT / EXCEPT).
2. **`slide-049.png`**: Trang trống chuyển đoạn / logo watermark.
3. **`slide-051.png`**: Trang trống chuyển đoạn / logo watermark.
4. **`slide-055.png`**: Trang phân cách tiêu đề nhóm `"Dạng số"` (các câu hỏi tính toán giá trị số).
5. **`slide-068.png`**: Trang phân cách tiêu đề nhóm `"Choose the best"` (các câu hỏi chọn phương án đúng nhất).
6. **`slide-102.png`**: Trang phân cách tiêu đề nhóm `"Câu ngắn"`.
7. **`slide-191.png`**: Trang phân cách tiêu đề nhóm `"Câu trung bình"`.
8. **`slide-252.png`**: Trang phân cách tiêu đề nhóm `"Câu dài"`.

---

## 4. Danh sách các câu hỏi gắn cờ cần rà soát (`needs_review: true`)

| Slide | Chủ đề | Vấn đề / Lý do cần rà soát | Hướng xử lý đề xuất |
| :---: | :--- | :--- | :--- |
| **015** | Biên & đặc trưng (edge, corner, SIFT…) | Slide chứa công thức toán/hình đồ thị phức tạp và khoá đáp án trong `cpv-slide-text.json` không đồng nhất. | Giáo viên/người phụ trách môn học cần đối chiếu lại hình vẽ công thức trên slide 015 để chuẩn hóa đáp án. |
| **053** | Biên & đặc trưng (edge, corner, SIFT…) | Ký hiệu toán học và chữ trên slide mờ, một số ký hiệu đạo hàm/toán tử Laplace cần đối chiếu lại văn bản gốc. | Xác nhận lại chính tả công thức toán học từ slide gốc. |
| **278** | Biến đổi hình học & ghép ảnh | Câu hỏi về tính chất của phép biến đổi affine: $x' = x + ay + x_0, y' = y + y_0$. Đáp án trong `cpv-slide-text.json` ghi là **D** ("All of the others"), nhưng về mặt lý thuyết hình học biến đổi affine chỉ bảo toàn đường thẳng và tính song song (phương án **C**). | Khuyên dùng đáp án C hoặc giữ D nếu đề thi trường quy ước chọn D ("All of the others"). |
| **305** | Nhận dạng & học máy | Câu hỏi về **Eigenfaces** trong nhận dạng khuôn mặt. Khoá `"307"` trong `cpv-slide-text.json` bị rỗng (`""`). | Đã gán đáp án **B** (*"The most distinctive facial features across different individuals"*) dựa trên nguyên lý giải thuật PCA/Eigenfaces (loại trừ ảnh trung bình trước khi trích xuất vector riêng). Cần ban tổ chức xác nhận lại. |

---

## 5. Quy luật ánh xạ dữ liệu phát hiện trong quá trình OCR

1. **Độ lệch chỉ số giữa ảnh và JSON:**
   - Từ `slide-009.png` đến `slide-054.png`: `khoá JSON == số thứ tự slide`.
   - Từ `slide-055.png` trở đi (đến `slide-327.png`): Do file PPTX gốc khi xuất sang PNG đã bỏ qua 2 trang, quy luật ánh xạ chính xác là:
     $$\text{khoá JSON} = \text{số thứ tự slide PNG} + 2$$
     *(Ví dụ: slide-057.png ứng với khoá 59; slide-103.png ứng với khoá 105; slide-305.png ứng với khoá 307; slide-325.png ứng với khoá 327).*
2. **Giải thích tiếng Việt:**
   - Tất cả các slide có kèm nội dung giải thích tiếng Việt từ `cpv-slide-text.json` (đặc biệt là các slide 070–080, 137, 183–188, 189, 247–250, 321–327) đều đã được trích xuất nguyên văn vào trường `explanation`.
3. **Câu hỏi trùng lặp:**
   - Bộ slide gốc có một số câu hỏi lặp lại nguyên văn (ví dụ: slide 109 & 111, slide 294 & 295, slide 324 & 326, slide 325 & 327). Tất cả đều được giữ nguyên vẹn để bảo đảm tính toàn vẹn 1-1 với slide bài giảng của sinh viên.
