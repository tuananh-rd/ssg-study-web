# Báo cáo Bổ sung & Sửa lỗi: OCR 10 Slide CPV301 (Slide 049 → 058)

**Thư mục làm việc:** `D:\Downloads\SSG105 app\sources-private`  
**Ngày thực hiện:** 21/11/2026  
**Nhiệm vụ:** OCR chính xác 10 ảnh slide từ `cpv-slides-real/slide-049.png` đến `cpv-slides-real/slide-058.png`, đối chiếu với dữ liệu đáp án ẩn trong `cpv-slide-text.json` theo đúng quy chuẩn tại `TASK-cpv-ocr.md` và `TASK-cpv-fix.md`.

---

## 1. Tổng quan kết quả thực hiện

- **Tổng số slide kiểm tra:** 10 slide (`slide-049.png` đến `slide-058.png`).
- **Tổng số câu hỏi trắc nghiệm đã trích xuất:** **7 câu**.
- **Tổng số slide bỏ qua (không phải câu hỏi):** **3 slide** (`slide-051.png`, `slide-053.png`, `slide-057.png`).
- **Tổng số câu hỏi cần xem xét (`needs_review: true`):** **0 câu** (tất cả 7 câu đều rõ nét, đối chiếu chính xác 100% với khóa trong `cpv-slide-text.json`).
- **Tệp kết quả đầu ra:** `ocr-batch/batch-fix-49-58.json`.

---

## 2. Chi tiết từng slide trong dải 049 → 058

| Slide | Tên file ảnh | Dạng câu (Section) | Chủ đề (Topic) | Đáp án | Trạng thái | Ghi chú |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **49** | `slide-049.png` | Câu ngắn | Ảnh số & thu nhận ảnh | **C** (`[2]`) | Hợp lệ | Khái niệm Computer Vision vs Image Processing |
| **50** | `slide-050.png` | NOT / EXCEPT | Biến đổi hình học & ghép ảnh | **A** (`[0]`) | Hợp lệ | Câu hỏi ứng dụng của Image Alignment |
| **51** | `slide-051.png` | — | — | — | **Bỏ qua** | Trang tối chỉ chứa logo FORU, không có câu hỏi |
| **52** | `slide-052.png` | NOT / EXCEPT | Chuyển động & optical flow | **A** (`[0]`) | Hợp lệ | Câu hỏi thông tin không do Optical Flow cung cấp |
| **53** | `slide-053.png` | — | — | — | **Bỏ qua** | Trang tối chỉ chứa logo FORU, không có câu hỏi |
| **54** | `slide-054.png` | Câu ngắn | Phân đoạn & phân cụm | **A** (`[0]`) | Hợp lệ | Câu hỏi Đúng/Sai về Gaussian Mixture Model |
| **55** | `slide-055.png` | Câu ngắn | Phân đoạn & phân cụm | **A** (`[0]`) | Hợp lệ | Câu hỏi Đúng/Sai về Split-and-merge / Quadtree |
| **56** | `slide-056.png` | Câu ngắn | Biến đổi hình học & ghép ảnh | **A** (`[0]`) | Hợp lệ | Câu hỏi Đúng/Sai về Cylindrical Projection |
| **57** | `slide-057.png` | Dạng số | — | — | **Bỏ qua** | Trang phân cách tiêu đề nhóm `"Dạng số"` |
| **58** | `slide-058.png` | Dạng số | Biên & đặc trưng (edge, corner, SIFT…) | **A** (`[0]`) | Hợp lệ | Kích thước vector đặc trưng SIFT (128) |

---

## 3. Danh sách các slide bị bỏ qua (Skipped Slides)

1. **`slide-051.png`**: Slide nền tối trống, chỉ có watermark logo FORU ở giữa và tên nguồn góc dưới. Không có nội dung văn bản hay câu hỏi. Khóa tương ứng `"51": ""` trong `cpv-slide-text.json`.
2. **`slide-053.png`**: Slide nền tối trống tương tự slide 051. Không có câu hỏi. Khóa tương ứng `"53": ""` trong `cpv-slide-text.json`.
3. **`slide-057.png`**: Slide tiêu đề nhóm có dòng chữ đỏ lớn `"Dạng số"` trên nền tối với logo FORU. Khóa `"57": "Dạng số"` trong `cpv-slide-text.json` xác nhận đây là nhãn tiêu đề phần thi, không phải câu hỏi trắc nghiệm.

---

## 4. Phân tích nguyên nhân cần xử lý lô bổ sung (Fix Batch)

- Ở lần chạy OCR trước dựa trên thư mục ảnh cũ (`cpv-slides-png/`), một số slide trống hoặc lặp bị dịch chuyển vị trí khiến số thứ tự ảnh bị lệch so với khóa thực tế trong `cpv-slide-text.json`. Cụ thể:
  - Slide 50 cũ bị nhầm nội dung của slide 52 thực tế.
  - Slide 53 cũ bị nhầm nội dung của slide 55 thực tế, dẫn đến việc lấy nhầm khóa rỗng `"53": ""` và đánh dấu `needs_review: true`.
  - Slide 49 và 50 thực tế bị bỏ sót.
- Trong thư mục ảnh chuẩn `cpv-slides-real/`, các slide 049 đến 058 khớp hoàn hảo 1:1 với khóa `"49"` đến `"58"` trong `cpv-slide-text.json`:
  - Slide 49 khớp khóa `"49": "C"`
  - Slide 50 khớp khóa `"50": "A"`
  - Slide 52 khớp khóa `"52": "A"`
  - Slide 54 khớp khóa `"54": "A"`
  - Slide 55 khớp khóa `"55": "A"`
  - Slide 56 khớp khóa `"56": "A"`
  - Slide 58 khớp khóa `"58": "A"`
- Lô sửa lỗi `ocr-batch/batch-fix-49-58.json` đã trích xuất đầy đủ, chuẩn xác 7 câu hỏi và sẵn sàng cho việc cập nhật / hợp nhất dữ liệu bộ đề thi CPV301.
