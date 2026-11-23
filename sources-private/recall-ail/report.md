# Báo cáo: Bộ câu hỏi "Hỏi lại lý thuyết" môn AIL303m

- **Thời gian hoàn thành**: 2026-11-21
- **Tổng số câu hỏi**: 167 câu hỏi trắc nghiệm
- **Nguyên tắc tuân thủ**:
  - Không chạy lệnh shell; chỉ đọc và ghi file trực tiếp.
  - Mỗi câu hỏi gồm đúng 1 đáp án đúng (`correct`) và 3 đáp án sai (`wrong`) có tính gây nhiễu hợp lý, độ dài tương đương.
  - Tuyệt đối không dùng "Tất cả đều đúng" hay "Cả A và B".
  - Giữ nguyên thuật ngữ tiếng Anh và cú pháp code chuẩn xác theo tài liệu.
  - Có giải thích rõ ràng (`explain`) và mẹo ghi nhớ ngắn gọn (`tip`).

---

## 1. Thống kê chi tiết số lượng câu hỏi theo từng mục

### Chương 1: Tổng quan (`m1` - `recall-ail/m1.json`) - Tổng cộng: 45 câu

| Mục (Ref) | Tiêu đề mục | Số câu hỏi | Ghi chú độ dài / Nội dung |
| :---: | :--- | :---: | :--- |
| **1.1** | AIL303m | **0** | *Bỏ qua*: Lời dẫn môn học, syllabus, kinh nghiệm review lab/project. |
| **1.2** | Overview | **5** | Định nghĩa AI, ML, DL; Các mốc lịch sử từ 1950s đến nay. |
| **1.3** | Quy trình và Thuật ngữ Machine Learning | **4** | Quy trình 6 bước và các thuật ngữ Target, Features, Observation, Label. |
| **1.4** | Thu thập và Làm sạch Dữ liệu | **4** | Nguồn truy xuất, dữ liệu trùng lặp, missing data (Imputation, Masking), Outliers. |
| **1.5** | Phân tích Dữ liệu Khám phá (EDA) | **3** | Khái niệm EDA, thống kê mô tả, Histogram, Scatter plot, Pair plot. |
| **1.6** | Kỹ thuật Đặc trưng (Feature Engineering) | **5** | Log/Polynomial transformation, One-hot/Ordinal encoding, Standard/Min-Max/Robust scaling. |
| **1.7** | Ước lượng và Suy diễn Thống kê | **4** | Estimation vs Inference, Parametric vs Non-parametric, Frequentist vs Bayesian. |
| **1.8** | Kiểm định Giả thuyết (Hypothesis Testing) | **4** | H0, H1, p-value, Sai lầm loại I & II, Tương quan vs Nhân quả. |
| **1.9** | Supervised Learning - học có giám sát | **4** | Phân biệt có giám sát, không giám sát, RL; Regression vs Classification; fit(). |
| **1.10** | Chia dữ liệu Train/Test và Kiểm chéo (Cross Validation) | **4** | Train/Test/Validation set; K-fold CV; train_test_split, cross_val_score. |
| **1.11** | Hồi quy Tuyến tính (Linear Regression) | **4** | Nguyên lý, Residual, Cost function SSE, TSS, R-squared, LinearRegression.score. |
| **1.12** | Hồi quy Đa thức (Polynomial Regression) | **3** | Nắm bắt quan hệ phi tuyến, nguy cơ Overfitting khi bậc cao, PolynomialFeatures. |
| **1.13** | Điều chuẩn (Regularization) | **5** | Bias-Variance tradeoff, Ridge (L2), LASSO (L1), Elastic Net, Scaling trước khi điều chuẩn. |

---

### Chương 2: Hồi quy Logistic, Đánh giá lỗi và Thuật toán KNN (`m2` - `recall-ail/m2.json`) - Tổng cộng: 35 câu

| Mục (Ref) | Tiêu đề mục | Số câu hỏi | Ghi chú độ dài / Nội dung |
| :---: | :--- | :---: | :--- |
| **2.1** | Hồi quy Logistic và Phân loại cơ bản | **4** | Regression vs Classification, hàm Sigmoid, tính diễn giải cao, tham số penalty/C. |
| **2.2** | Các chỉ số đánh giá lỗi (Error Metrics) | **5** | Ma trận nhầm lẫn (TP, FP, FN, TN), Accuracy, Recall, Precision, Specificity, ROC/AUC. |
| **2.3** | Thuật toán K-Láng giềng gần nhất (KNN) | **6** | Non-parametric, Lazy learner, 4 bước quy trình, Feature Scaling, Elbow method, so sánh KNN vs Linear Regression. |
| **2.4** | Giới thiệu về Support Vector Machines (SVM) | **5** | Định nghĩa, Hyperplane, Maximize Margin, Support Vectors, hàm mất mát Hinge Loss so với Logistic. |
| **2.5** | Độ nhạy với Outliers và Regularization | **4** | Nhạy cảm với Outliers; ý nghĩa tham số điều chuẩn C (C nhỏ vs C lớn). |
| **2.6** | SVM với Kernels (Nhân) | **4** | Kernel Trick, Linear Kernel, Gaussian RBF Kernel, tham số gamma. |
| **2.7** | Tối ưu hóa hiệu suất (Faster Kernel Transformations) | **4** | Hạn chế hiệu năng khi mẫu lớn, kỹ thuật xấp xỉ Nystroem và RBFSampler, SGDClassifier. |
| **2.8** | Workflow cơ bản khi làm với SVM | **3** | 4 bước workflow chuẩn: chuẩn bị dữ liệu -> chọn kernel -> tinh chỉnh C, gamma qua CV -> đánh giá. |

---

### Chương 3: Cây Quyết định (Decision Trees) (`m3` - `recall-ail/m3.json`) - Tổng cộng: 15 câu

| Mục (Ref) | Tiêu đề mục | Số câu hỏi | Ghi chú độ dài / Nội dung |
| :---: | :--- | :---: | :--- |
| **3.1** | Tổng quan về Cây Quyết định | **6** | Thuật toán tham lam (greedy), so sánh KNN vs Logistic vs Decision Trees, độ vẩn đục: Entropy, Information Gain, Gini Index. |
| **3.2** | Vấn đề Quá khớp và Cắt tỉa (Overfitting & Pruning) | **3** | Xu hướng overfit và phương sai cao; cơ chế cắt tỉa (pruning) dựa trên ngưỡng lỗi phân loại. |
| **3.3** | Ưu điểm và Khả năng giải thích | **3** | Logic if-then-else trực quan; linh hoạt mọi loại dữ liệu; không cần scaling/tiền xử lý phức tạp. |
| **3.4** | Mã nguồn minh họa (Python) | **3** | DecisionTreeClassifier, criterion='entropy', max_depth=5, min_samples_leaf, cross-validation. |

---

### Chương 4: Ensemble Learning & Học không giám sát (`m4` - `recall-ail/m4.json`) - Tổng cộng: 72 câu

| Mục (Ref) | Tiêu đề mục | Số câu hỏi | Ghi chú độ dài / Nội dung |
| :---: | :--- | :---: | :--- |
| **4.1** | Overview (Ensemble Learning) | **3** | Định nghĩa kết hợp base learners, mục tiêu giảm Variance và Bias, 3 nhánh: Bagging, Boosting, Stacking. |
| **4.2** | Bagging (Bootstrap Aggregation) | **5** | Cơ chế Bootstrap có thay thế, Aggregation (trung bình / bỏ phiếu), Random Forest (chọn tập con feature), Extra Trees. |
| **4.3** | Boosting | **5** | Huấn luyện tuần tự (sequential) sửa sai, tăng trọng số mẫu sai, Decision Stumps 1 tầng, AdaBoost vs Gradient Boosting. |
| **4.4** | Stacking (Học xếp chồng) | **4** | Kết hợp mô hình khác loại (heterogeneous), mô hình base level-0 truyền dự đoán vào meta model level-1. |
| **4.5** | So sánh (Bagging vs Boosting vs Stacking) | **5** | Cấu trúc (song song vs tuần tự), loại mô hình, mục đích sai số (Variance vs Bias), Blagging, nguy cơ overfit khi lặp nhiều. |
| **4.7** | Khả năng Giải thích Mô hình (Model Interpretability) | **6** | Tự giải thích vs Hộp đen, Model-agnostic, Permutation Feature Importance, PDP, Global Surrogate, Local Surrogate (LIME). |
| **4.8** | Xử lý Dữ liệu Không cân bằng (Unbalanced Classes) | **6** | Không dùng Accuracy, thước đo thay thế (AUC, F1, Kappa), Resampling sau khi chia Train/Test, SMOTE, NearMiss-1/2/3, Tomek Links, ENN. |
| **4.9** | Overview (Unsupervised Learning) | **4** | Huấn luyện trên unlabeled data, Phân cụm vs Giảm chiều dữ liệu, Lời nguyền chiều dữ liệu (Curse of Dimensionality), vai trò của PCA. |
| **4.10** | Phân cụm K-Means (K-Means Clustering) | **5** | 4 bước thuật toán, cập nhật tâm trung bình, K-Means++, Elbow Method, Inertia (SSE) luôn giảm khi tăng K. |
| **4.11** | Ứng dụng thực tế | **3** | Phân khúc khách hàng, Phát hiện bất thường (Anomaly Detection), Nén hình ảnh (Image Compression). |
| **4.12** | Code minh họa (Python) | **3** | Cú pháp KMeans, thuộc tính inertia_, cluster_centers_, phương thức fit_predict. |
| **4.14** | Các Độ đo Khoảng cách (Distance Metrics) | **5** | Khoảng cách Euclidean (L2), Manhattan (L1), Cosine (Text Mining), Jaccard (IoU), ví dụ tính tay Euclidean sqrt(27). |
| **4.15** | Phân cụm Phân cấp (HAC) | **5** | Phương pháp Bottom-up, các loại Linkage (Single - chaining, Complete, Average, Ward), cắt cây Dendrogram tại đường đứng dài nhất. |
| **4.16** | DBSCAN | **5** | Ưu điểm (cụm bất kỳ, lọc nhiễu), Core Point (> MinPts), Border Point, nhãn nhiễu (-1), tham số eps và min_samples. |
| **4.17** | Mean-Shift Clustering | **4** | Cơ chế trượt cửa sổ tìm đỉnh mật độ (mode), ưu điểm (không cần K, cụm không đều), nhược điểm (chậm, phụ thuộc bandwidth, chỉ dùng Euclidean), estimate_bandwidth. |
| **4.18** | So sánh các thuật toán phân cụm | **4** | So sánh ưu/nhược điểm K-Means, Hierarchical (O(N^2)), DBSCAN (nhạy eps, mật độ khác nhau), Mean-Shift. |

---

## 2. Danh sách các mục bỏ qua và lý do

| Mã mục | Tiêu đề | Lý do bỏ qua (0 câu hỏi) |
| :---: | :--- | :--- |
| **1.1** | AIL303m | Nội dung mục này chỉ thuần túy là lời dẫn giới thiệu ban đầu về môn học, cấu trúc điểm thi (20% PT, lab, project), lời khuyên làm bài tập lớn và kinh nghiệm review lab với giảng viên. Mục này hoàn toàn không chứa lý thuyết, định nghĩa, công thức hoặc thuật toán chuyên môn AI/ML. |

*(Lưu ý: Trong file nguồn `lessons-ail.json`, Module 4 chuyển trực tiếp từ 4.5 sang 4.7 và từ 4.12 sang 4.14, hoàn toàn không tồn tại mục 4.6 và 4.13 nên không thuộc diện bỏ qua).*

---

## 3. Danh sách các tệp dữ liệu đã tạo

- [m1.json](file:///D:/Downloads/SSG105%20app/sources-private/recall-ail/m1.json) (45 câu hỏi)
- [m2.json](file:///D:/Downloads/SSG105%20app/sources-private/recall-ail/m2.json) (35 câu hỏi)
- [m3.json](file:///D:/Downloads/SSG105%20app/sources-private/recall-ail/m3.json) (15 câu hỏi)
- [m4.json](file:///D:/Downloads/SSG105%20app/sources-private/recall-ail/m4.json) (72 câu hỏi)
- [report.md](file:///D:/Downloads/SSG105%20app/sources-private/recall-ail/report.md) (Báo cáo tổng kết)
