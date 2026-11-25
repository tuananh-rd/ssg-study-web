// Tạo sources-private/recall-cpv/m8.json: câu hỏi ôn lý thuyết cho chương "Tổng hợp theo bộ đề" (m8) của CPV301.
// Mỗi câu: [mục, câu hỏi, đáp án đúng, sai 1, sai 2, sai 3, giải thích]. Mục 8.n theo thứ tự các mục trong web/data/cpv-digest.json.
// Chạy: node web/scripts/make-cpv-recall8.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const Q = [
 // 8.1 CV vs IP
 ['8.1', 'Computer vision khác image processing ở đầu ra như thế nào?', 'Computer vision cho ra sự diễn giải ảnh; image processing cho ra ảnh', 'Cả hai đều chỉ cho ra ảnh', 'Computer vision cho ra ảnh; image processing cho ra sự diễn giải ảnh', 'Cả hai đều cho ra văn bản', 'Image processing: ảnh vào, ảnh ra. Computer vision: ảnh/video vào, hiểu và diễn giải ảnh ra.'],
 ['8.1', 'Yếu tố nào thúc đẩy sự phát triển của xử lý ảnh số?', 'Sự phát triển của máy tính và tiến bộ toán học', 'Xu hướng mạng xã hội', 'Phạm vi ứng dụng hẹp', 'Sự suy giảm của máy tính', 'Bộ đề: computer development và mathematical progress.'],
 ['8.1', 'Mục tiêu chung của image processing là gì?', 'Trích thông tin hữu ích và nâng cao chất lượng ảnh', 'Tạo âm thanh từ ảnh', 'Dựng mô hình 3D từ ảnh', 'Sinh văn bản mô tả ảnh', 'Image processing tập trung nâng cao ảnh và trích thông tin hữu ích.'],
 // 8.2 Ảnh số
 ['8.2', 'Một pixel gồm những thành phần nào?', 'Địa chỉ vị trí và giá trị cường độ', 'Kích thước ảnh và giá trị cường độ', 'Địa chỉ vị trí và kích thước ảnh', 'Màu nền và kích thước ảnh', 'Pixel = vị trí + giá trị cường độ.'],
 ['8.2', 'Pixel operator có đầu vào và đầu ra như thế nào?', 'Vào một hoặc nhiều ảnh, ra MỘT ảnh', 'Vào một ảnh, ra nhiều ảnh', 'Vào nhiều ảnh, ra nhiều ảnh', 'Vào một ảnh, ra văn bản', 'Đầu ra của pixel operator là một ảnh.'],
 ['8.2', 'Ảnh xám (grayscale) có bao nhiêu kênh màu?', '1', '2', '3', '4', 'Ảnh xám 1 kênh, ảnh màu RGB 3 kênh.'],
 // 8.3 Camera
 ['8.3', 'Giới hạn TRÊN của dải động (dynamic range) do yếu tố nào quyết định?', 'Saturation (bão hòa)', 'Noise (nhiễu)', 'Contrast', 'Brightness', 'Trên = bão hòa; dưới = nhiễu.'],
 ['8.3', 'Giới hạn DƯỚI của dải động do yếu tố nào quyết định?', 'Noise (nhiễu)', 'Saturation', 'Contrast', 'Brightness', 'Dưới = nhiễu.'],
 ['8.3', 'Thông số nào của camera điều khiển lượng sáng ĐI VÀO ỐNG KÍNH?', 'Aperture (khẩu độ)', 'ISO', 'Shutter speed', 'White balance', 'Khẩu độ điều khiển lượng sáng vào ống kính; shutter speed điều khiển thời gian phơi sáng.'],
 ['8.3', 'ISO trong camera số điều khiển điều gì?', 'Độ nhạy sáng của cảm biến', 'Kích thước khẩu độ', 'Tốc độ màn trập', 'Tốc độ lấy nét', 'ISO = độ nhạy của cảm biến.'],
 ['8.3', 'Nguyên nhân chính của chromatic aberration trong ống kính là gì?', 'Tán sắc ánh sáng (dispersion)', 'Độ cong ống kính', 'Độ dày ống kính', 'Chất liệu thấu kính', 'Chiết suất kính khác nhau theo bước sóng nên các màu hội tụ ở những điểm khác nhau.'],
 // 8.4 Ánh sáng
 ['8.4', 'Phản xạ nào tán xạ ánh sáng theo nhiều hướng (Lambertian)?', 'Diffuse reflection', 'Specular reflection', 'Refraction', 'Translucency', 'Lambertian mô tả phản xạ khuếch tán.'],
 ['8.4', 'Phản xạ kiểu gương, ánh sáng ra theo MỘT hướng, gọi là gì?', 'Specular reflection', 'Diffuse reflection', 'Ambient reflection', 'Emissive reflection', 'Specular = phản xạ gương.'],
 ['8.4', 'Mô hình Phong đầy đủ gồm những thành phần nào?', 'Ambient + diffuse + specular', 'Chỉ ambient', 'Chỉ specular', 'Diffuse + ambient, không có specular', 'Phong đầy đủ = ambient + diffuse + specular từ nguồn sáng chính.'],
 ['8.4', 'Hai phương pháp truyền thống mô hình hóa ánh sáng theo bề mặt là gì?', 'Ray tracing cho bề mặt chủ yếu bóng, radiosity cho bề mặt chủ yếu mờ', 'Ray tracing cho bề mặt mờ, radiosity cho bề mặt bóng', 'Ray tracing cho cả hai loại', 'Radiosity cho cả hai loại', 'Ray tracing: specular. Radiosity: matte.'],
 // 8.5 Màu sắc
 ['8.5', 'Dải bước sóng mắt người nhìn thấy như màu sắc là bao nhiêu?', '400 nm – 700 nm', '200 nm – 500 nm', '300 nm – 600 nm', '500 nm – 900 nm', 'Phổ nhìn thấy 400–700 nm.'],
 ['8.5', 'Trong phổ nhìn thấy, màu nào có tần số lớn nhất?', 'Violet (tím)', 'Red (đỏ)', 'Green (lục)', 'Blue (lam)', 'Tím có bước sóng ngắn nhất nên tần số cao nhất.'],
 ['8.5', 'Định dạng ảnh nào là nén có mất mát (lossy)?', 'jpg', 'bmp', 'ppm', 'iac', 'JPG là lossy.'],
 // 8.6 OpenCV
 ['8.6', 'Muốn vẽ hình và tô kín bên trong bằng OpenCV, giá trị độ dày là bao nhiêu?', '-1', '1', 'True', 'fillInside = True', 'Độ dày -1 tô kín hình.'],
 ['8.6', 'Cần bao nhiêu điểm để vẽ một đường thẳng bằng OpenCV?', '2', '3', '4', '5', 'Đường thẳng cần hai điểm đầu và cuối (hàm line()).'],
 ['8.6', 'Lật ảnh theo cả trục dọc và ngang dùng lệnh nào?', 'cv2.flip(img, -1)', 'cv2.flip(img, 1)', 'cv2.flip(img, 0)', 'cv2.flip(img, 2)', 'flipCode = -1 lật cả hai trục.'],
 // 8.7 Histogram
 ['8.7', 'Kỹ thuật nào kéo giãn khoảng cường độ hiện có để dùng hết các giá trị có thể?', 'Contrast stretching', 'Histogram equalization', 'Gray world', 'Ground truth', 'Contrast stretching kéo giãn dải cường độ.'],
 ['8.7', 'Kỹ thuật nào phân bố đều cường độ ra toàn dải?', 'Histogram equalization', 'Contrast stretching', 'White patch', 'Ground truth', 'Histogram equalization trải đều cường độ.'],
 ['8.7', 'White patch và Gray world thuộc nhóm nào?', 'Cân bằng trắng', 'Tăng tương phản', 'Phân đoạn ảnh', 'Dò cạnh', 'Hai phương pháp cân bằng trắng.'],
 // 8.8 Lọc
 ['8.8', 'Convolution tính được từ correlation bằng cách nào?', 'Xoay kernel 180° quanh tâm rồi correlation', 'Dùng thẳng kết quả correlation', 'Chia kết quả cho một hằng số', 'Không có khác biệt', 'Convolution = correlation sau khi xoay kernel 180°.'],
 ['8.8', 'Nhược điểm chính của mean filter khi khử nhiễu là gì?', 'Làm mờ cạnh và chi tiết', 'Tốn rất nhiều tính toán', 'Chỉ dùng được cho ảnh xám', 'Khuếch đại nhiễu', 'Mean filter làm mờ cạnh.'],
 ['8.8', 'Ưu điểm của chuỗi biến đổi 1 chiều so với kernel 2 chiều lớn không tách được là gì?', 'Tăng hiệu quả tính toán', 'Tăng độ chính xác màu', 'Giữ chi tiết tốt hơn', 'Giảm bộ nhớ', 'Bộ đề: increased computational efficiency.'],
 ['8.8', 'Bộ lọc nào dùng để làm mịn ảnh và giảm nhiễu?', 'Low-pass filter', 'High-pass filter', 'Band-pass filter', 'Adaptive filter', 'Low-pass làm mịn.'],
 // 8.9 Texture filtering
 ['8.9', 'Kỹ thuật nào cải thiện texture trên bề mặt nhìn từ góc xiên?', 'Anisotropic filtering', 'MIP mapping filter', 'Gaussian white filter', 'Box filter', 'Anisotropic filtering làm nét texture ở góc xiên.'],
 ['8.9', 'EWA filter dựa trên ánh xạ nào?', 'Ánh xạ affine tạo hệ tọa độ xiên, lọc Gaussian với ma trận hiệp phương sai nghịch đảo là elip', 'Phép chiếu tròn của pixel đích', 'Lọc trung vị', 'Phép biến đổi Fourier', 'EWA dùng elip, không dùng phép chiếu tròn.'],
 ['8.9', 'Bước đầu tiên khi lấy mẫu lại ảnh từ MIP là gì?', 'Ước lượng hệ số tỉ lệ (scalar) của tốc độ lấy mẫu lại', 'Tính logarit cơ số 2 của ảnh', 'Áp dụng bộ lọc chất lượng cao', 'Dùng mức pyramid phân số', 'Bước đầu: ước lượng resampling rate.'],
 // 8.10 Fourier
 ['8.10', 'Convolution trong miền không gian tương ứng với phép gì trong miền tần số?', 'Phép nhân F(w)H(w)', 'Phép cộng F(w)+H(w)', 'Phép tích chập tiếp', 'Không có quan hệ', 'Convolution ↔ nhân trong miền tần số.'],
 ['8.10', 'Tần số Nyquist bằng bao nhiêu?', 'Một nửa tần số lấy mẫu', 'Tần số cao nhất của tín hiệu', 'Gấp đôi tần số lấy mẫu', 'Tần số làm tín hiệu tuần hoàn', 'Nyquist = 1/2 tần số lấy mẫu.'],
 ['8.10', 'Dịch một tín hiệu theo thời gian thì phổ Fourier của nó thay đổi thế nào?', 'Phổ pha bị dịch', 'Phổ biên độ bị co giãn', 'Các tần số bị suy giảm', 'Tần số Nyquist thay đổi', 'Phổ biên độ giữ nguyên, phổ pha dịch.'],
 ['8.10', 'Định lý Parseval nói về điều gì?', 'Liên hệ năng lượng giữa miền thời gian và miền tần số', 'Biến đổi Fourier khả nghịch', 'Liên hệ biên độ và tần số', 'Biến đổi Fourier luôn thực', 'Parseval: bảo toàn năng lượng giữa hai miền.'],
 ['8.10', 'Band-pass filter có đặc điểm gì?', 'Cho một dải tần số xác định đi qua', 'Chỉ cho tần số thấp đi qua', 'Cho mọi tần số đi qua', 'Chặn mọi tần số', 'Band-pass = cho một dải tần qua.'],
 // 8.11 Gradient
 ['8.11', 'Gradient của ảnh dùng chủ yếu để làm gì?', 'Trích xuất thông tin hữu ích (biên)', 'Tăng độ phân giải', 'Tìm outlier', 'Chỉnh độ sáng', 'Mục đích chính của gradient: trích thông tin hữu ích.'],
 ['8.11', 'Edge linking có vai trò gì sau khi dò cạnh?', 'Sắp xếp tập pixel cạnh rời rạc thành danh sách cạnh có thứ tự', 'Xóa thông tin cạnh', 'Xáo trộn thứ tự pixel cạnh', 'Làm mờ cạnh', 'Edge linking nối các pixel cạnh.'],
 ['8.11', 'Cạnh trong ảnh là gì?', 'Thay đổi cục bộ đáng kể của cường độ', 'Vùng có màu đồng nhất', 'Vùng có kết cấu dày', 'Một đối tượng cụ thể', 'Edges are significant local changes of intensity.'],
 // 8.12 Edge operators
 ['8.12', 'Phương pháp dò cạnh nào bằng kỹ thuật zero-crossing?', 'Đạo hàm bậc hai (second derivative)', 'Đạo hàm bậc nhất', 'Toán tử Prewitt', 'Toán tử Robert', 'Cạnh ứng với điểm cắt không của đạo hàm bậc hai.'],
 ['8.12', 'Nhược điểm cơ bản của toán tử Sobel là gì?', 'Nhạy với nhiễu', 'Không dò được cạnh chéo', 'Tính toán chậm', 'Thiếu bất biến xoay', 'Bộ đề: sensitivity to noise.'],
 ['8.12', 'Toán tử Prewitt tốt ở điểm nào?', 'Dò cạnh dọc và ngang', 'Dò cạnh tròn', 'Dò màu', 'Dò vân', 'Prewitt: good for vertical and horizontal edges.'],
 ['8.12', 'Gaussian trong Canny/LoG có vai trò gì?', 'Làm mờ ảnh, giảm nhiễu', 'Tăng tương phản', 'Tính gradient', 'Loại điểm không cực đại', 'Gaussian chỉ làm mờ để giảm nhiễu.'],
 ['8.12', 'Điều nào KHÔNG phải ưu điểm của Canny?', 'True zero crossing', 'Định vị tốt', 'Ít nhạy với nhiễu', 'Trích đặc trưng không làm đổi đặc trưng', 'Zero-crossing là của LoG/đạo hàm bậc 2.'],
 // 8.13 Blob/DoG/Harris
 ['8.13', 'Thuật toán nào dùng để tìm vị trí blob?', 'Normalized Laplacian of Gaussian', 'Đạo hàm bậc nhất', 'Đạo hàm bậc hai', 'Laplacian of Gaussian không chuẩn hóa', 'Blob: NLoG.'],
 ['8.13', 'Vì sao dùng DoG thay cho NLoG?', 'DoG xấp xỉ NLoG nhưng tính hiệu quả hơn', 'DoG chính xác hơn và tính nhanh hơn', 'DoG xấp xỉ NLoG nhưng tốn tính toán như nhau', 'DoG tốt hơn dù tính chậm hơn', 'DoG xấp xỉ NLoG và rẻ hơn.'],
 ['8.13', 'Trong Harris, khi nào cửa sổ là vùng phẳng?', '|R| nhỏ', '|R| lớn', 'R < 0', 'Không xác định được', '|R| nhỏ: phẳng.'],
 ['8.13', 'Trong Harris, khi nào cửa sổ chứa một góc?', '|R| lớn và λ1 ≈ λ2', '|R| nhỏ và λ1, λ2 nhỏ', 'R < 0 và λ1 ≫ λ2', 'Không xác định được', 'Góc: |R| lớn, hai trị riêng gần nhau.'],
 ['8.13', 'Sau bước dò đặc trưng (feature detection) là bước nào?', 'Mô tả đặc trưng (feature description)', 'Tiền xử lý', 'Gộp đặc trưng', 'Lọc nhiễu', 'Detection → description.'],
 // 8.14 SIFT
 ['8.14', 'Vector mô tả SIFT có bao nhiêu chiều?', '128', '64', '256', '512', 'SIFT 128 chiều.'],
 ['8.14', 'SIFT xử lý xoay khi khớp keypoint bằng cách nào?', 'Căn chỉnh keypoint theo hướng chủ đạo', 'Xoay cả ảnh về hướng chuẩn', 'Dùng hướng cố định cho mọi keypoint', 'Loại các keypoint có hướng khác nhau', 'Dominant orientation.'],
 ['8.14', 'SIFT đạt bất biến tỉ lệ bằng cách nào?', 'Thu nhỏ ảnh ở nhiều độ phân giải', 'Chuẩn hóa cường độ pixel', 'Lọc Gaussian toàn ảnh', 'Dùng cửa sổ thích nghi', 'Scale-space nhiều độ phân giải.'],
 // 8.15 Hough
 ['8.15', 'Bước đầu cần thiết cho Hough transform khi nhận dạng đường phức tạp là gì?', 'Dò cạnh (edge detection)', 'Chỉnh màu', 'Ánh xạ texture', 'Chỉnh tương phản', 'Hough làm việc trên các điểm cạnh.'],
 ['8.15', 'Hough transform dùng không gian nào để biểu diễn đường thẳng trong không gian tham số?', 'Polar space', 'Cartesian space', 'Transform space', 'Gradient space', 'Biểu diễn (ρ, θ).'],
 ['8.15', 'Sau khi bỏ phiếu, các đường thẳng được xác định bằng cách nào?', 'Tìm các đỉnh (peak) có nhiều phiếu nhất', 'Mọi ô có phiếu khác 0 đều là đường', 'Nối mọi điểm cạnh đã bỏ phiếu', 'Hough cho ra đoạn thẳng trực tiếp', 'Peak = đường.'],
 ['8.15', 'Nhiễu nhiều ảnh hưởng thế nào đến Hough?', 'Tạo đỉnh giả trong không gian tham số', 'Không ảnh hưởng', 'Hough không dùng được cho mọi mức nhiễu', 'Làm mất toàn bộ phiếu', 'Nhiễu tạo false peaks.'],
 ['8.15', 'Hai kỹ thuật dò đường thẳng được nhắc trong bộ đề là gì?', 'Hough transform và convolution-based', 'Hough và Canny', 'Sobel và Prewitt', 'K-means và Mean shift', 'Hough và convolution-based technique.'],
 // 8.16 Segmentation/thresholding
 ['8.16', 'Image segmentation là gì?', 'Chia ảnh thành các vùng theo đặc tính pixel', 'Gán một màu cho từng pixel', 'Nhận dạng đối tượng và tên của chúng', 'Làm mờ ảnh', 'Không phải gán màu cho từng pixel.'],
 ['8.16', 'Thresholding segmentation làm gì?', 'Chuyển ảnh xám/màu thành ảnh nhị phân theo ngưỡng', 'Phân cụm theo K-means', 'Nối cạnh', 'Dựng bản đồ địa hình', 'Thresholding = ngưỡng → nhị phân.'],
 // 8.17 Region
 ['8.17', 'Hạn chế chính của region growing là gì?', 'Rất nhạy với nhiễu và thay đổi cường độ nhỏ', 'Không xử lý được ảnh nhiều màu', 'Chi phí tính toán rất lớn', 'Không xử lý được vật thể rời rạc', 'Region growing nhạy với nhiễu.'],
 ['8.17', 'Phương pháp nào phân đoạn ảnh theo độ giống nhau về mức xám và kết cấu?', 'Graph-based segmentation', 'Region splitting', 'Watershed', 'Active contours', 'Graph-based dùng gray-level và texture.'],
 ['8.17', 'Hai dấu hiệu probabilistic merging dùng để gộp vùng là gì?', 'Gray-level similarity và texture similarity', 'Saturation và độ sáng', 'Cạnh và tương phản', 'Hue và nhận dạng mẫu', 'Gray-level + texture similarity.'],
 ['8.17', 'Region splitting làm gì?', 'Chia ảnh thành các vùng rời nhau, đồng nhất trong từng vùng', 'Gộp các vùng giống nhau', 'Chia thành K cụm', 'Dựng đường viền động', 'Chia thường thành 4 vùng con.'],
 // 8.18 Watershed/active contour
 ['8.18', 'Watershed xem ảnh như gì?', 'Bản đồ địa hình, độ sáng là độ cao', 'Một tập điểm dữ liệu nhiều chiều', 'Một đồ thị', 'Một chuỗi tín hiệu', 'Watershed = bản đồ địa hình.'],
 ['8.18', 'Vấn đề thường gặp khi dùng watershed với nền có kết cấu?', 'Over-segmentation', 'Tốc độ xử lý cao', 'Mất màu', 'Ràng buộc thời gian', 'Phân đoạn quá mức.'],
 ['8.18', 'Ranh giới watershed biểu diễn điều gì?', 'Cạnh của đối tượng', 'Tâm đối tượng', 'Thung lũng của ảnh', 'Các pixel ảnh', 'Watershed boundary = object edges.'],
 ['8.18', 'Năng lượng nội (internal) trong mô hình Snake có vai trò gì?', 'Phạt biến dạng lớn, giữ contour trơn', 'Hút contour về biên đối tượng', 'Loại điểm không cực đại', 'Chỉnh cường độ pixel cạnh', 'Internal giữ trơn; external hút về biên.'],
 ['8.18', 'Năng lượng ngoại (external) trong Snake có vai trò gì?', 'Hút contour về biên đối tượng', 'Giữ contour trơn', 'Phạt độ lệch khỏi đường thẳng', 'Chỉnh cường độ pixel cạnh', 'External kéo contour về biên.'],
 ['8.18', 'Thuật toán nào dùng trong active contour?', 'Snakes model', 'Scissors model', 'Sets model', 'Watershed', 'Active contour dùng Snakes.'],
 // 8.19 Clustering
 ['8.19', 'K trong K-means là gì?', 'Số cụm', 'Số chiều', 'Số điểm dữ liệu', 'Số vòng lặp', 'K = number of clusters.'],
 ['8.19', 'Vị trí K centroid ban đầu trong K-means được chọn thế nào?', 'Ngẫu nhiên', 'Phân bố đều trong ảnh', 'Giá trị trung tâm', 'Chia theo K và tỉ lệ ảnh', 'Khởi tạo ngẫu nhiên.'],
 ['8.19', 'Gaussian Mixture Model biểu diễn phân phối như thế nào?', 'Tổng của nhiều mô hình Gaussian', 'Tích của nhiều mô hình Gaussian', 'Một Gaussian duy nhất', 'Cây quyết định', 'GMM = tổng các Gaussian, gom cụm mềm.'],
 ['8.19', 'Mean shift thay mỗi pixel bằng gì?', 'Trung bình các pixel trong một khoảng (range) lân cận', 'Trung bình các pixel trong cụm', 'Trung vị toàn ảnh', 'Giá trị lớn nhất lân cận', 'Mean of the pixels in a range.'],
 ['8.19', 'Thuật toán nào gom cụm mềm theo xác suất?', 'Gaussian Mixture Models', 'K-means', 'Mean shift', 'K-nearest', 'GMM là soft clustering.'],
 // 8.20 Semantic/Instance
 ['8.20', 'Cách tiếp cận gán mỗi pixel vào một lớp gọi là gì?', 'Semantic segmentation', 'Instance segmentation', 'Instance detection', 'Semantic detection', 'Semantic = lớp.'],
 ['8.20', 'Cách tiếp cận tách từng đối tượng riêng (mỗi pixel thuộc instance nào) gọi là gì?', 'Instance segmentation', 'Semantic segmentation', 'Semantic detection', 'Instance detection', 'Instance = từng đối tượng.'],
 ['8.20', 'So với semantic segmentation, instance segmentation thường như thế nào?', 'Phức tạp hơn và cần thêm dữ liệu huấn luyện', 'Đơn giản hơn', 'Phức tạp tương đương', 'Đơn giản nhưng cần ảnh độ phân giải rất cao', 'Instance khó hơn.'],
 // 8.21 Transformations
 ['8.21', 'Phép biến đổi nào bảo toàn tính thẳng hàng và tỉ lệ khoảng cách?', 'Affine', 'Projective', 'Euclidean', 'Perspective', 'Affine giữ collinearity và ratio of distances.'],
 ['8.21', 'Cần tối thiểu bao nhiêu điểm để tìm ma trận biến đổi affine?', '3', '4', '5', '6', 'Affine 6 tham số, 3 cặp điểm.'],
 ['8.21', 'Ma trận [[2,0,1],[0,2,2],[0,0,1]] là phép biến đổi nào?', 'Scale 2, tịnh tiến 1 theo x và 2 theo y', 'Scale 2, tịnh tiến 2 theo x và 1 theo y', 'Chỉ tịnh tiến 2 theo x, 1 theo y', 'Scale 2 theo x, giữ nguyên y', 'Cột cuối (1, 2) là tịnh tiến.'],
 ['8.21', 'Hệ tọa độ dùng bán kính, góc phương vị và độ cao là gì?', 'Cylindrical coordinates', 'Cartesian coordinates', 'Spherical coordinates', 'Polar coordinates', 'Cylindrical = (r, θ, z).'],
 // 8.22 Feature-based alignment
 ['8.22', 'Ý chính của feature-based alignment là gì?', 'Dò vài đặc trưng khớp ở cả hai ảnh rồi tính phép căn chỉnh', 'So sánh pixel trực tiếp giữa hai ảnh', 'Áp biến đổi ngẫu nhiên', 'Chia ảnh thành các vùng', 'Detect + match đặc trưng thưa.'],
 ['8.22', 'Khớp đặc trưng giữa hai ảnh được thực hiện bằng cách nào?', 'So sánh descriptor mô tả cấu trúc cục bộ', 'So pixel trực tiếp', 'Chọn tay theo cảm nhận', 'Ưu tiên đặc trưng gần tâm ảnh', 'Khớp bằng descriptor.'],
 ['8.22', 'Phát biểu nào về "least squares" trong căn chỉnh 2D là đúng?', 'Tối thiểu hóa tổng bình phương khoảng cách giữa các điểm', 'Cực đại hóa entropy', 'Cực đại hóa tổng bình phương sai khác', 'Tối thiểu hóa entropy ảnh', 'Least squares = minimize sum of squared distances.'],
 ['8.22', 'Ứng dụng nào KHÔNG thuộc image alignment?', 'Nhận diện mẫu tài liệu', 'Tạo ảnh panorama', 'So sánh các lần quét mô ở thời điểm khác nhau', 'Nâng cao ảnh tài liệu quét', 'Bộ đề: NOT identifying document templates.'],
 // 8.23 RANSAC
 ['8.23', 'RANSAC là viết tắt của gì?', 'Random Sample Consensus', 'Random Assignment for Numerical Stability', 'Robust Analysis for Noisy Alignment', 'Recursive Alignment and Sampling', 'RANdom SAmple Consensus.'],
 ['8.23', 'RANSAC chủ yếu giải quyết vấn đề gì?', 'Outliers trong dữ liệu đầu vào', 'Overfitting', 'Underfitting', 'Độ phức tạp tính toán', 'RANSAC chịu được nhiều outliers.'],
 ['8.23', 'Số lần thử tối thiểu của RANSAC tính bằng công thức nào?', 'log(1−P) / log(1−p^k)', 'log(1−P) × log(1−p^k)', 'log[(1−P)(1−p^k)]', 'log[(1−P)/(1−p^k)]', 'Phép chia hai logarit.'],
 ['8.23', 'Phát biểu nào KHÔNG đúng về RANSAC?', 'Sinh nghiệm ứng viên bằng số điểm dữ liệu tối đa', 'Ước lượng tham số khi có nhiều outlier', 'Chọn ngẫu nhiên rồi đếm số điểm khớp', 'Nếu đủ điểm khớp thì chấp nhận và thoát', 'RANSAC dùng số điểm TỐI THIỂU.'],
 ['8.23', '"Consensus" trong RANSAC nghĩa là gì?', 'Đa số inliers trong tập dữ liệu', 'Giá trị trung bình của các điểm', 'Độ lệch của mô hình so với dữ liệu', 'Tổng số lần lặp', 'Consensus = đa số inliers.'],
 // 8.24 Stitching
 ['8.24', 'Quá trình tự động xác định ảnh nào thuộc cùng một panorama gọi là gì?', 'Recognizing panoramas', 'Parallax removal', 'Bundle adjustment', 'Panoramas creating', 'Recognizing panoramas.'],
 ['8.24', 'Kết nối connected components trong đồ thị chồng lấn dùng để làm gì?', 'Nhận ra từng panorama riêng', 'Tìm outlier', 'Ước lượng pose camera', 'Tính góc chồng lấn', 'Mỗi connected component là một panorama.'],
 ['8.24', 'Image stitching dùng trong lĩnh vực nào để dựng lại giấy bị xé?', 'Pháp y và điều tra (forensic)', 'Phục chế nghệ thuật', 'Ảnh y tế', 'Khảo cổ', 'Bộ đề: forensic and investigative science.'],
 ['8.24', 'Phát biểu nào KHÔNG đúng về image stitching?', 'Nó ghép hai pixel có cường độ giống nhau ở hai ảnh kề nhau', 'Ghép nhiều ảnh có vùng nhìn chồng lấn', 'Dùng để lập bản đồ một nơi', 'Dùng trong pháp y để dựng lại vật bị xé', 'Stitching dùng đặc trưng, không ghép theo cường độ.'],
 // 8.25 Global/bundle/parallax
 ['8.25', 'Mục tiêu của global alignment là gì?', 'Tìm bộ tham số căn chỉnh nhất quán toàn cục', 'Giảm méo trong từng ảnh', 'Giảm số đặc trưng khớp', 'Chỉ tập trung chi tiết toàn cục', 'Globally consistent set of alignment parameters.'],
 ['8.25', 'Bundle adjustment dùng để làm gì?', 'Chỉnh đồng thời tham số pose của nhiều ảnh chồng lấn', 'Thêm ảnh mới vào panorama', 'Giảm kích thước ảnh', 'Căn chỉnh ảnh tuần tự', 'Simultaneous pose adjustment.'],
 ['8.25', 'Parallax là gì?', 'Sự dịch chuyển vị trí vật khi đổi góc nhìn', 'Méo ảnh do ống kính', 'Chromatic aberration', 'Mờ do chuyển động khi chụp', 'Parallax = shift in apparent position.'],
 ['8.25', 'Khi chuyển động nhỏ, sửa parallax bằng cách nào?', 'Local alignment', 'Global bundle adjustment', 'General 2D motion estimation', 'Back-projection averaging', 'Local alignment.'],
 // 8.26 Cylindrical/spherical
 ['8.26', 'Panorama dạng cylindrical dùng khi nào?', 'Camera nằm ngang, chỉ xoay quanh trục dọc', 'Camera xoay mọi hướng', 'Camera chuyển động tịnh tiến', 'Chụp ảnh tĩnh một khung', 'Cylindrical: rotation quanh trục dọc.'],
 ['8.26', 'Spherical panorama khác cylindrical ở điểm nào?', 'Ngoài 360° ngang còn chụp cả hướng lên và xuống', 'Chỉ chụp một góc hẹp', 'Không chụp 360° ngang', 'Dùng camera cố định', 'Cylindrical không phủ trên-dưới.'],
 // 8.27 Optical flow
 ['8.27', 'Chuyển động của đối tượng giữa các frame liên tiếp do chuyển động tương đối vật–camera gọi là gì?', 'Optical flow', 'Image stitching', 'Object moving', 'Tracking ID', 'Đó là optical flow.'],
 ['8.27', 'Thông tin nào Optical Flow KHÔNG cung cấp?', 'Gia tốc của vật', 'Vận tốc chuyển động của pixel', 'Hướng chuyển động của pixel', 'Vị trí điểm khóa', 'Optical flow: vận tốc và hướng.'],
 ['8.27', 'Ước lượng chuyển động pixel từ I(x,y,t) sang I(x,y,t+1) là tìm gì?', 'Các pixel GẦN ở thời điểm t+1 có cùng màu', 'Các pixel xa ở thời điểm t có cùng màu', 'Các pixel xa ở thời điểm t+1 có cùng màu', 'Các pixel gần ở thời điểm t có cùng màu', 'Closed pixels at t+1 with the same color.'],
 // 8.28 Tracking
 ['8.28', 'Phương pháp tracking nào nhấn mạnh hình dạng và hình thức của vùng đối tượng "phôi thai"?', 'Kernel tracking', 'Point tracking', 'Silhouette tracking', 'Template matching', 'Kernel tracking.'],
 ['8.28', 'Tracking nào ước lượng vùng đối tượng ở mỗi frame bằng thông tin trong chính vùng đối tượng?', 'Template matching', 'Multi-view tracking', 'Silhouette tracking', 'Contour evolution', 'Template matching.'],
 ['8.28', 'Thuật toán tracking nào xử lý đổi tỉ lệ, xoay, che khuất bằng cửa sổ tìm kiếm thích nghi?', 'CamShift', 'Kalman filtering', 'Mean Shift tracking', 'Optical flow tracking', 'CamShift.'],
 ['8.28', 'Đặc điểm cốt lõi của object tracking là gì?', 'Gán ID riêng cho mỗi vật và duy trì ID qua các frame', 'Phân loại đối tượng', 'Dự đoán quỹ đạo', 'Phân đoạn thể hiện', 'ID assignment maintenance.'],
 ['8.28', 'Phương pháp nào dựa trên factored sampling và áp dụng lặp qua chuỗi ảnh?', 'Condensation', 'Feature descriptor', 'Feature matching', 'Hough transform', 'Condensation.'],
 // 8.29 Detection/recognition
 ['8.29', 'Object recognition khác object detection ở chỗ nào?', 'Recognition gán thuộc tính ngữ nghĩa cho vật dựa trên thuộc tính vật lý của nó', 'Detection chỉ phân loại, không định vị', 'Recognition chỉ định vị', 'Không khác', 'Recognition: perceive physical properties and apply semantic attributes.'],
 ['8.29', 'Object detection cần làm những gì?', 'Nhận ra và định vị các thể hiện của vật trong ảnh hoặc video', 'Nhận ra vật mà không cần vị trí', 'Mô tả nội dung ảnh', 'Phân loại ảnh theo đặc trưng thị giác', 'Detection = identify + locate.'],
 ['8.29', 'Phương pháp phát hiện đối tượng truyền thống (không nơ-ron) nào được hỏi?', 'HOG detector', 'YOLO', 'RCNN', 'RetinaNet', 'HOG là phi nơ-ron.'],
 ['8.29', 'Thuật toán detection hai giai đoạn (region proposal + phân loại) là gì?', 'Faster R-CNN', 'YOLO', 'SSD', 'Haar Cascade', 'Faster R-CNN.'],
 ['8.29', 'Haar Cascade dùng loại đặc trưng nào?', 'Đặc trưng dạng đường (line features)', 'Histogram màu', 'Đặc trưng kết cấu', 'Eigenfaces', 'Haar-like: line features.'],
 ['8.29', 'Bin của histogram trong HOG được chọn dựa trên gì?', 'Hướng của gradient', 'Độ sáng pixel', 'Giá trị pixel ngẫu nhiên', 'Kích thước vật', 'HOG = histogram of oriented gradients.'],
 // 8.30 Face
 ['8.30', 'Phương pháp nào trích đặc trưng cục bộ (mắt, mũi, miệng) rồi đưa vị trí và thống kê vào bộ phân loại?', 'Feature-based methods', 'Holistic matching methods', 'Eigenfaces', 'Linear Discriminant Analysis', 'Feature-based.'],
 ['8.30', 'Cách tiếp cận coi nhận dạng khuôn mặt là bài toán 2 chiều, dùng PCA, LDA là gì?', 'Holistic matching methods', 'Feature-based methods', 'Structural classifier methods', 'Neural network based method', 'Holistic matching.'],
 ['8.30', 'Bước xác định các mốc (landmarks) quan trọng của khuôn mặt gọi là gì?', 'Face analysis', 'Face detection', 'Face locating', 'Features analysis', 'Face analysis.'],
 ['8.30', 'Các đặc trưng nào được dùng để nhận ra khuôn mặt trong bộ đề?', 'Mắt, lông mày, mũi, miệng, hàm', 'Mắt, lông mày, mũi, tóc, hàm', 'Mắt, lông mày, mũi, cổ, miệng', 'Mắt, lông mày, hàm, cổ, tai', 'Bộ đề: eyes, eyebrows, nose, mouth, jaw.'],
 ['8.30', 'PCA giữ 1200 thành phần cho 1000 ảnh 128×128. Số đặc trưng của cả tập trong eigenspace là gì?', '1200×1000', '1000×128', '128×1200', '128×128', 'k × N = 1200 × 1000.'],
 // 8.31 Numbers
 ['8.31', 'Chọn đáp án đúng: SIFT descriptor có bao nhiêu chiều, và phổ nhìn thấy là bao nhiêu nm?', '128 chiều; 400–700 nm', '64 chiều; 400–700 nm', '128 chiều; 300–600 nm', '256 chiều; 500–900 nm', 'SIFT 128; phổ 400–700 nm.'],
 ['8.31', 'Mặt nạ convolution dò đường chéo ±? độ trong bộ đề', '45', '15', '90', '180', 'Chéo ±45°.'],
 // 8.32 Traps
 ['8.32', 'Với câu hỏi có chữ NOT / incorrect, nên chọn phát biểu nào?', 'Phát biểu sai hoặc không liên quan', 'Phát biểu đúng nhất', 'Luôn chọn "All of the others"', 'Phát biểu dài nhất', 'Câu phủ định: đáp án là ý sai.'],
 ['8.32', 'Câu "Choose the best description…" có đáp án "All of the others" thì nên làm gì?', 'Kiểm tra từng ý: nếu có ý sai thì "All" là bẫy', 'Luôn chọn "All"', 'Không bao giờ chọn "All"', 'Chọn theo độ dài đáp án', 'Phải kiểm tra từng ý.'],
 ['8.32', 'Trên web, mục nào luyện riêng các cặp câu dễ nhầm đáp án của CPV301?', 'Câu dễ nhầm đáp án', 'Thi đấu', 'Câu sai', 'Kiểu đề thi', 'Mục "Câu dễ nhầm đáp án" ở trang chủ và Bộ đề.']
];
const out = Q.map(([ref, q, correct, w1, w2, w3, explain]) => ({ ref, q, correct, wrong: [w1, w2, w3], explain }));
const bad = out.filter(x => new Set([x.correct, ...x.wrong]).size !== 4 || !x.q || x.wrong.some(w => !w));
if (bad.length) { console.log('Câu lỗi:', bad.map(b => b.q)); process.exit(1); }
const dir = path.join(ROOT, 'sources-private', 'recall-cpv'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'm8.json'), JSON.stringify(out, null, 1));
console.log(out.length + ' câu ôn lý thuyết → sources-private/recall-cpv/m8.json');
