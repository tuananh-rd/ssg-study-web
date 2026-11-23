# Báo cáo tổng kết câu hỏi lý thuyết môn CPV301 (Recall CPV)

Đã hoàn thành việc sinh câu hỏi trắc nghiệm lý thuyết cho tất cả các chương từ `lessons-cpv.json` và lưu thành các tệp JSON tương ứng trong thư mục `recall-cpv/`.

---

## 1. Thống kê số lượng câu hỏi theo từng mục (Section)

### Module 1: Introduction (`recall-cpv/m1.json`) - 24 câu
| Mã mục | Tên mục | Số câu | Ghi chú độ dài |
| :--- | :--- | :---: | :--- |
| **1.1** | Tổng quan | 5 | Mục vừa (~2.100 ký tự) |
| **1.2** | Các Khái niệm Hình học Cơ bản và Phép Biến đổi | 7 | Mục dài (~2.700 ký tự) |
| **1.3** | Hình thành Ảnh Quang học (Photometric Image Formation) | 5 | Mục vừa (~1.650 ký tự) |
| **1.4** | Máy ảnh Kỹ thuật số (The Digital Camera) | 7 | Mục dài (~3.000 ký tự) |

### Module 2: Xử lý ảnh và biến đổi Parametric transformations (`recall-cpv/m2.json`) - 20 câu
| Mã mục | Tên mục | Số câu | Ghi chú độ dài |
| :--- | :--- | :---: | :--- |
| **2.1** | Tổng quan | 0 | Bỏ qua (Lời dẫn ngắn) |
| **2.2** | Toán tử Điểm (Point Operators) | 5 | Mục vừa (~1.700 ký tự) |
| **2.3** | Lọc tuyến tính và Phi tuyến tính (Linear & Non-linear Filtering) | 5 | Mục vừa (~2.100 ký tự) |
| **2.4** | Biến đổi Fourier trong Xử lý Ảnh (Fourier Transforms) | 5 | Mục vừa (~1.800 ký tự) |
| **2.5** | Phép biến đổi Hình học Nâng cao (Geometric Transformations cont.) | 5 | Mục vừa (~2.100 ký tự) |

### Module 3: Trích xuất Đặc trưng, Phát hiện Biên và Đường (`recall-cpv/m3.json`) - 13 câu
| Mã mục | Tên mục | Số câu | Ghi chú độ dài |
| :--- | :--- | :---: | :--- |
| **3.1** | Tổng quan | 0 | Bỏ qua (Lời dẫn ngắn) |
| **3.2** | Đặc trưng, Điểm và Vùng lân cận (Points, Patches and Features) | 8 | Mục dài (~3.300 ký tự) |
| **3.3** | Phát hiện Đường thẳng (Line Detection) | 5 | Mục vừa (~1.500 ký tự) |

### Module 4: Các Phương pháp Phân đoạn Ảnh (`recall-cpv/m4.json`) - 21 câu
| Mã mục | Tên mục | Số câu | Ghi chú độ dài |
| :--- | :--- | :---: | :--- |
| **4.1** | Tổng quan | 0 | Bỏ qua (Lời dẫn ngắn) |
| **4.2** | Overview | 4 | Mục vừa (~700 ký tự) |
| **4.3** | Phân đoạn bằng đường viền chủ động (Active Contours / Snakes) | 5 | Mục vừa (~1.500 ký tự) |
| **4.4** | Phương pháp chia và trộn vùng (Split and Merge Segmentation) | 5 | Mục vừa (~2.300 ký tự) |
| **4.5** | Clustering, K-Means & Mean Shift | 7 | Mục dài (~2.800 ký tự) |

### Module 5: Feature-Based Alignment (`recall-cpv/m5.json`) - 19 câu
| Mã mục | Tên mục | Số câu | Ghi chú độ dài |
| :--- | :--- | :---: | :--- |
| **5.1** | Tổng quan | 0 | Bỏ qua (Lời dẫn ngắn) |
| **5.2** | Tổng quan về căn chỉnh dựa trên đặc trưng (Feature-Based Alignment) | 3 | Mục ngắn (~550 ký tự) |
| **5.3** | Căn chỉnh 2D bằng phương pháp bình phương tối thiểu (Least Squares) | 4 | Mục vừa (~850 ký tự) |
| **5.4** | Thuật toán RANSAC (RANdom SAmple Consensus) | 5 | Mục vừa (~1.100 ký tự) |
| **5.5** | Căn chỉnh đặc trưng không gian 3D (3D Alignment) | 3 | Mục ngắn (~650 ký tự) |
| **5.6** | Ứng dụng | 4 | Mục vừa (~750 ký tự + code) |

### Module 6: Motion Models & Global Alignment (`recall-cpv/m6.json`) - 13 câu
| Mã mục | Tên mục | Số câu | Ghi chú độ dài |
| :--- | :--- | :---: | :--- |
| **6.1** | Tổng quan | 0 | Bỏ qua (Lời dẫn ngắn) |
| **6.2** | Mô hình chuyển động (Motion Models) | 5 | Mục vừa (~1.500 ký tự) |
| **6.3** | Căn chỉnh toàn cục (Global Alignment) | 5 | Mục vừa (~1.500 ký tự) |
| **6.4** | DEMO | 3 | Mục vừa (~800 ký tự + code) |

### Module 7: Object Detection, Face Recognition, Object Tracking (`recall-cpv/m7.json`) - 39 câu
| Mã mục | Tên mục | Số câu | Ghi chú độ dài |
| :--- | :--- | :---: | :--- |
| **7.1** | Tổng quan | 0 | Bỏ qua (Lời dẫn ngắn) |
| **7.2** | Phát hiện đối tượng (Object Detection) | 6 | Mục dài (~2.300 ký tự) |
| **7.3** | Nhận dạng đối tượng và khuôn mặt (Object / Face Recognition) | 5 | Mục vừa (~1.700 ký tự) |
| **7.4** | Theo dõi đối tượng (Object Tracking) | 8 | Mục dài (~8.000+ ký tự) |
| **7.5** | Tổng hợp công thức | 4 | Mục vừa (~1.100 ký tự) |
| **7.6** | ALGEBRA REVIEW & TRANSFORMATIONS | 6 | Mục dài (~3.000 ký tự) |
| **7.7** | IMAGE PROCESSING (THỐNG KÊ VÀ LỌC ẢNH) | 5 | Mục vừa (~2.100 ký tự) |
| **7.8** | EDGE AND FEATURE DETECTION | 5 | Mục vừa (~1.700 ký tự) |

---

## 2. Danh sách các mục bỏ qua (0 câu) và lý do

Theo yêu cầu nhiệm vụ: *"Mục chỉ là lời dẫn/trống thì 0 câu (ghi vào báo cáo)"*:

1. **Mục 2.1 ("Tổng quan")**: Chỉ gồm 1 câu tóm tắt giới thiệu 3 chủ đề con trong chương (Toán tử điểm, Lọc tuyến tính, Biến đổi Fourier), không chứa kiến thức lý thuyết cụ thể để đặt câu hỏi.
2. **Mục 3.1 ("Tổng quan")**: Chỉ gồm 1 dòng liệt kê 3 nội dung con (Points and Patches, Edges, Lines).
3. **Mục 4.1 ("Tổng quan")**: Chỉ gồm 1 câu liệt kê danh mục chủ đề phân đoạn (Active Contours, Split and Merge, Mean Shift & Clustering).
4. **Mục 5.1 ("Tổng quan")**: Chỉ gồm 1 đoạn văn tóm tắt khái quát các nội dung sẽ học trong chương 5.
5. **Mục 6.1 ("Tổng quan")**: Chỉ gồm 1 câu dẫn giới thiệu về Motion Models và Global Alignment.
6. **Mục 7.1 ("Tổng quan")**: Lời dặn dò ngắn về việc sử dụng thư viện `face_recognition` khi làm đồ án, không phải nội dung lý thuyết môn học.

---

## 3. Tổng kết

- **Tổng số câu hỏi đã tạo:** 149 câu trắc nghiệm.
- **Tiêu chuẩn câu hỏi:**
  - 100% tiếng Việt, có thuật ngữ tiếng Anh gốc trong ngoặc đơn.
  - Đúng 1 đáp án đúng + 3 đáp án gây nhiễu hợp lý, độ dài tương đương.
  - Không sử dụng "Tất cả đều đúng" hoặc "Cả A và B".
  - Bám sát định nghĩa, công thức, cơ chế thuật toán, so sánh, tham số hàm.
  - Có trường `explain` giải thích rõ ràng và trường `tip` mẹo nhớ ngắn gọn.
  - Lưu trữ dưới dạng JSON hợp lệ tại các file: `recall-cpv/m1.json` đến `recall-cpv/m7.json`.
- **Tuyệt đối không chạy lệnh shell và không sửa/xoá bất kỳ file nào khác.**
