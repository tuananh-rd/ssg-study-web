// Tạo sources-private/recall-dap/m7.json: câu hỏi ôn lý thuyết cho chương "Tổng hợp theo bộ đề" (m7) của DAP391m.
// Mỗi câu: [mục, câu hỏi, đáp án đúng, sai 1, sai 2, sai 3, giải thích]. Mục 7.n theo thứ tự các mục trong web/data/dap-digest.json.
// Chạy: node web/scripts/make-dap-recall7.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const Q = [
 // 7.1 Quy trình
 ['7.1', 'Pha đầu tiên của quy trình phân tích dữ liệu là gì?', 'Ask', 'Prepare', 'Process', 'Act', 'Ask → Prepare → Process → Analyze → Share → Act.'],
 ['7.1', 'Nhà phân tích so sánh trạng thái nào với trạng thái lý tưởng để xác định cần thu thập dữ liệu gì?', 'Trạng thái hiện tại (current)', 'Trạng thái tương đối (relative)', 'Trạng thái tuyệt đối (absolute)', 'Trạng thái "sick"', 'So sánh current state với ideal state.'],
 ['7.1', 'Thay đổi quy trình gây hệ quả xấu thì nên tập trung vào đâu?', 'Nguyên nhân gốc của vấn đề (source cause)', 'Từng hệ quả riêng lẻ', 'Các bên liên quan', 'Người quản lý dự án ban đầu', 'Cần điều tra nguyên nhân gốc.'],
 ['7.1', 'Dự án liên tục trễ hạn, bước đầu tiên của người lãnh đạo mới là gì?', 'Phân tích nguyên nhân gốc (root cause analysis)', 'Phỏng vấn đánh giá từng cá nhân', 'Đánh giá hiệu quả các nền tảng', 'Vẽ biểu đồ tròn để lập lịch mới', 'Bắt đầu bằng root cause analysis.'],
 ['7.1', 'Điều nào KHÔNG phải bước tiền xử lý dữ liệu thông thường?', 'Triển khai mô hình (model deployment)', 'Xử lý dữ liệu thiếu', 'Thu phóng đặc trưng', 'Mã hóa biến phân loại', 'Triển khai mô hình diễn ra sau khi xây dựng.'],
 ['7.1', 'Phát biểu nào về EDA đúng?', 'EDA tập trung hiểu cấu trúc và mẫu của bộ dữ liệu', 'EDA chỉ làm sau khi huấn luyện mô hình', 'EDA thường bị bỏ qua', 'EDA giống feature engineering', 'EDA = Exploratory Data Analysis.'],
 // 7.2 Python/NumPy
 ['7.2', 'Trong list các ngày bắt đầu từ Sunday, chỉ số của Wednesday là gì?', '[3]', '[4]', '"Wednesday"', '[-4]', 'Chỉ số bắt đầu từ 0.'],
 ['7.2', 'Mở file để ghi thêm vào dữ liệu hiện có, cần mode nào?', '"a"', '"w"', '"x"', '"n"', '"a" = append; "w" ghi đè.'],
 ['7.2', 'Cách mở file để không lo quên đóng file là gì?', 'Dùng câu lệnh with cùng lệnh open', 'Dùng close trước open', 'Dùng close thay cho open', 'Dùng with thay cho open', 'with open(...) tự đóng file.'],
 ['7.2', 'Cách đúng để gán giá trị nhỏ nhất của mảng grades cho biến lowest_grade là gì?', 'lowest_grade = grades.min()', 'grades.min() = lowest_grade', 'grades = grades.min()', 'grades.min() = grades', 'Biến ở bên trái dấu =, có dấu ngoặc ở .min().'],
 ['7.2', 'Cần thêm gì vào highest_gpa = grades để lấy giá trị lớn nhất?', '.max()', '.max', '(high)', '.high', 'Gọi phương thức .max() có dấu ngoặc.'],
 // 7.3 Thư viện
 ['7.3', 'Thư viện nào chủ yếu dùng để xử lý và phân tích dữ liệu trong Python?', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Pandas = data manipulation and analysis.'],
 ['7.3', 'Thư viện nào dùng để gửi HTTP request truy cập trang web và API?', 'Requests', 'BeautifulSoup', 'Scrapy', 'Selenium', 'Requests gửi HTTP request.'],
 ['7.3', 'Thư viện nào thường dùng để phân tích HTML trong web scraping?', 'BeautifulSoup', 'Pandas', 'Requests', 'Scrapy', 'BeautifulSoup parse HTML/XML.'],
 ['7.3', 'Thư viện nào thiết kế riêng để xây dựng ứng dụng web phân tích?', 'Dash', 'Matplotlib', 'Seaborn', 'Folium', 'Dash là framework ứng dụng web phân tích.'],
 ['7.3', 'Thư viện nào thường cài đặt grid search để tinh chỉnh siêu tham số?', 'Scikit-learn', 'Pandas', 'NumPy', 'TensorFlow', 'GridSearchCV của scikit-learn.'],
 // 7.4 Đọc dữ liệu
 ['7.4', 'Hàm Pandas nào đọc file CSV?', 'read_csv()', 'load_csv()', 'import_csv()', 'open_csv()', 'pd.read_csv().'],
 ['7.4', 'Hàm Pandas nào đọc bảng từ HTML?', 'read_html()', 'read_html_table()', 'parse_html()', 'import_html()', 'pd.read_html().'],
 ['7.4', 'Thuộc tính nào cho biết kiểu dữ liệu của từng cột?', 'dtypes', 'ftypes', 'itypes', 'ntypes', 'df.dtypes.'],
 ['7.4', 'Phương thức nào đếm số lần xuất hiện của các giá trị duy nhất?', 'value_counts()', 'count()', 'get_total()', 'describe()', 'value_counts() trả về số lần của từng giá trị.'],
 ['7.4', 'Đổi tên cột "point" thành "location" bằng đoạn mã nào?', 'df.rename(columns={"point": "location"}, inplace=True)', 'df.rename(columns={"location": "point"}, inplace=True)', 'df.change(columns={"point": "location"}, inplace=True)', 'df.Change(columns={"location": "point"}, inplace=True)', 'Dict {tên cũ: tên mới}.'],
 ['7.4', 'Toán tử nào kết hợp điều kiện khi lọc DataFrame bằng Pandas?', '& (mỗi điều kiện trong ngoặc)', '&&', 'AND', '= (một dấu bằng)', "df[(df['gender']=='M') & (df['age']>=40)]."],
 ['7.4', 'Phương thức nào cho thống kê mô tả cho các cột số?', 'describe()', 'summary()', 'stats()', 'statistics()', 'df.describe().'],
 // 7.5 Dữ liệu thiếu
 ['7.5', 'Phương thức nào phát hiện dữ liệu thiếu trong DataFrame?', 'isnull()', 'find_missing()', 'missing_data()', 'NaN_check()', 'isnull() trả về mặt nạ giá trị thiếu.'],
 ['7.5', 'Phương thức nào xóa các dòng có giá trị thiếu?', 'dropna()', 'remove_missing()', 'clean_data()', 'remove_nulls()', 'dropna().'],
 ['7.5', 'Phương thức nào điền dữ liệu thiếu bằng giá trị hợp lệ KẾ TIẾP phía sau?', 'bfill()', 'ffill()', 'backward_fill()', 'backfill()', 'bfill = backward fill.'],
 ['7.5', 'Với [20, NaN, 25, NaN, 30], điền bằng ffill thì giá trị ở vị trí thiếu đầu tiên là bao nhiêu?', '20', '25', '30', '27.5', 'ffill lấy giá trị hợp lệ trước đó.'],
 ['7.5', 'Với [20, NaN, 25, NaN, 30], nội suy tuyến tính cho giá trị thiếu đầu tiên là bao nhiêu?', '22.5', '23.0', '27.5', '26.0', 'Trung điểm của 20 và 25.'],
 ['7.5', 'Điền NaN của chuỗi [NaN, 15, NaN, 25, 30] bằng median thì NaN ở chỉ số 0 thành bao nhiêu?', '25.0', '30.0', '15.0', '23.33', 'Median của 15, 25, 30 là 25.'],
 ['7.5', 'Câu nào dưới đây xử lý dữ liệu thiếu được?', 'Cả xóa dòng, imputation và bỏ qua khi phân tích (All of the above)', 'Chỉ xóa dòng', 'Chỉ imputation', 'Không xử lý được', 'Câu bộ đề đáp án là All of the above.'],
 // 7.6 Chuẩn hóa
 ['7.6', 'Kỹ thuật nào đưa dữ liệu về mean bằng 0 và độ lệch chuẩn bằng 1?', 'Z-score normalization', 'Min-Max scaling', 'Log transformation', 'Robust scaling', 'z = (x − mean) / std.'],
 ['7.6', 'Với mean = 75, độ lệch chuẩn = 15, điểm dữ liệu 90 có z-score bằng bao nhiêu?', '1', '2', '3', '4', '(90 − 75) / 15 = 1.'],
 ['7.6', 'Min-Max scaling làm gì với dữ liệu?', 'Đưa dữ liệu về khoảng cố định, thường 0 đến 1', 'Đưa mean về 0 và phương sai về 1', 'Chuẩn hóa theo median và IQR', 'Biến đổi bằng logarit tự nhiên', 'Min-Max → [0, 1].'],
 ['7.6', 'Khi nào thường áp dụng log transformation?', 'Khi dữ liệu có phân phối lệch (skewed)', 'Khi dữ liệu phân phối tuyến tính', 'Khi dữ liệu phân phối chuẩn', 'Khi dữ liệu có giá trị thiếu', 'Log giảm độ lệch.'],
 ['7.6', 'Mã hóa tần suất (frequency encoding) cột Gender làm thế nào?', "df['Gender'].map(df['Gender'].value_counts())", "df['Gender'].map({'Male': 3, 'Female': 3})", "df['Gender'].astype('category').cat.codes", "df['Gender'].value_counts(normalize=True)", 'Thay nhãn bằng số lần xuất hiện.'],
 ['7.6', 'Hàm nào chuyển cột thành các cột one-hot?', 'pd.get_dummies()', 'pd.one_hot()', 'df.encode()', 'df.fillna()', 'get_dummies tạo các cột one-hot.'],
 ['7.6', 'Kỹ thuật nào thường dùng để giảm chiều dữ liệu nhiều chiều?', 'PCA (Principal Component Analysis)', 'Feature scaling', 'One-Hot Encoding', 'Min-Max scaling', 'PCA giảm chiều.'],
 // 7.7 Thống kê
 ['7.7', 'Hệ số tương quan nằm trong khoảng nào?', '[-1, 1]', '[0, 1]', '[-∞, ∞]', '[0, ∞]', 'Tương quan từ -1 đến 1.'],
 ['7.7', 'Theo bộ đề, tương quan mạnh khi p-value như thế nào?', 'Nhỏ hơn 0.001', 'Nhỏ hơn 0.05', 'Nhỏ hơn 0.1', 'Lớn hơn 0.1', 'Bộ đề: p < 0.001.'],
 ['7.7', 'Trong kiểm định Chi-square, p-value nhỏ hơn 0.05 gợi ý điều gì?', 'Bác bỏ giả thuyết không', 'Không bác bỏ giả thuyết không', 'Không đủ bằng chứng', 'Không có tương quan', 'p < 0.05 → reject the null hypothesis.'],
 ['7.7', 'Giá trị R² nào cho thấy mô hình tốt nhất?', '1', '0', '-1', 'Vô cùng', 'R² = 1 là khớp hoàn hảo.'],
 ['7.7', 'IQR của [15, 10, 5, 25, 20, 30, 40, 35] là bao nhiêu?', '20', '15', '25', '30', 'Q3 − Q1 = 32.5 − 12.5 = 20.'],
 ['7.7', 'Râu trên của box plot biểu diễn khoảng phân vị nào?', 'Từ phân vị 75 đến 100', 'Từ phân vị 50 đến 75', 'Từ phân vị 25 đến 50', 'Từ phân vị 0 đến 25', 'Upper whisker: 75th–100th.'],
 ['7.7', 'Max của box plot là 100, Q1 = 20. Q3 và Min bằng bao nhiêu?', 'Q3 = 52, Min = −28', 'Q3 = 80, Min = 0', 'Q3 = 50, Min = 25', 'Q3 = 68, Min = −22', 'Max = Q3 + 1.5·IQR, Min = Q1 − 1.5·IQR.'],
 ['7.7', 'Phân phối lệch biểu diễn thế nào trên box plot?', 'Độ dài hai râu không đối xứng', 'Hai râu có độ dài bằng nhau', 'Hộp và râu có cùng chiều rộng', 'Hộp biến mất', 'Skewed → asymmetrical whiskers.'],
 // 7.8 Chọn loại biểu đồ
 ['7.8', 'Loại biểu đồ nào hiển thị quan hệ giữa hai biến liên tục?', 'Scatter plot', 'Box plot', 'Histogram', 'Pie chart', 'Scatter = hai biến.'],
 ['7.8', 'Loại biểu đồ nào hợp nhất để hiển thị phân phối của MỘT biến liên tục?', 'Histogram', 'Pie chart', 'Bar chart', 'Line chart', 'Histogram = phân phối một biến.'],
 ['7.8', 'Đường ngang bên trong hộp của box plot biểu diễn gì?', 'Median (trung vị)', 'Mean', 'Độ lệch chuẩn', 'IQR', 'Đường giữa là median.'],
 ['7.8', 'Chiều rộng của hộp trong box plot mô tả gì (theo bộ đề)?', 'IQR', 'Phạm vi dữ liệu', 'Phương sai', 'Độ lệch chuẩn', 'Theo bộ đề: IQR.'],
 ['7.8', 'Màu đậm nhạt trong heatmap thể hiện điều gì?', 'Độ mạnh của tương quan', 'Tần suất xuất hiện', 'Độ lớn một biến', 'Phạm vi giá trị', 'Heatmap: strength of correlations.'],
 ['7.8', 'Kích thước từ trong word cloud thường dựa vào gì?', 'Số lần xuất hiện (word count)', 'Độ dài từ', 'Thứ tự bảng chữ cái', 'Ngẫu nhiên', 'Từ xuất hiện nhiều thì to.'],
 ['7.8', 'Hai biến có xu hướng cùng tăng trên scatter plot là quan hệ gì?', 'Positive linear relationship', 'Independent linear relationship', 'Dependent cross relationship', 'Dispositive multi-linear relationship', 'Tăng cùng nhau = tuyến tính dương.'],
 // 7.9 Matplotlib
 ['7.9', 'Module nào của Matplotlib cung cấp giao diện kiểu MATLAB?', 'matplotlib.pyplot', 'matplotlib.figure', 'matplotlib.axis', 'matplotlib.plot', 'pyplot.'],
 ['7.9', 'Hàm nào vẽ biểu đồ vùng xếp chồng (stack plot)?', 'plt.stackplot()', 'plt.area()', 'plt.stack()', 'plt.plot()', 'Không có plt.area hay plt.stack.'],
 ['7.9', 'Lệnh nào hiển thị biểu đồ trực tiếp trong Jupyter Notebook?', '%matplotlib inline', '%inline plot', 'plt.inline()', 'plt.notebook()', 'Magic command %matplotlib inline.'],
 ['7.9', 'Hàm nào lưu hình ra file?', 'savefig()', 'save()', 'export()', 'saveas()', 'plt.savefig().'],
 ['7.9', 'Tham số nào của plt.plot() đặt độ dày đường?', 'linewidth', 'line_width', 'width', 'line', 'linewidth.'],
 ['7.9', 'Tham số autopct trong plot(kind="pie") làm gì?', 'Tự động định dạng nhãn phần trăm', 'Đặt tỉ lệ khung hình', 'Chỉnh phần trăm mỗi lát', 'Tự vẽ thêm biểu đồ tròn', 'autopct định dạng nhãn.'],
 ['7.9', 'Tham số bins của hist() điều khiển điều gì?', 'Số cột (bin) của histogram', 'Độ rộng mỗi cột', 'Số dòng của histogram', 'Kích thước hình', 'bins = số bin.'],
 ['7.9', 'Hàm subplot() cho phép làm gì?', 'Tạo nhiều biểu đồ trong một hình', 'Đổi màu nền', 'Chỉnh kích thước marker', 'Bỏ ticks trên trục', 'subplot chia hình thành nhiều ô.'],
 ['7.9', 'Phương thức Pandas nào vẽ biểu đồ vùng?', 'plot.area()', "plot(kind='area')", "plot(type='area')", 'plot.area', 'Theo bộ đề: plot.area().'],
 // 7.10 Seaborn
 ['7.10', 'Hàm Seaborn nào hiển thị ma trận tương quan dạng bản đồ nhiệt?', 'sns.heatmap()', 'sns.pairplot()', 'sns.jointplot()', 'sns.scatterplot()', 'sns.heatmap().'],
 ['7.10', 'Hàm nào đếm số lần xuất hiện của mỗi giá trị duy nhất của biến phân loại?', 'sns.countplot()', 'sns.barplot()', 'sns.pointplot()', 'sns.boxplot()', 'countplot đếm số lượng.'],
 ['7.10', 'Hàm nào hiển thị phân phối biến liên tục theo từng nhóm phân loại?', 'sns.violinplot()', 'sns.histplot()', 'sns.kdeplot()', 'sns.boxplot()', 'violinplot.'],
 ['7.10', 'Hàm nào vẽ box plot để xem phân phối biến số?', 'sns.boxplot()', 'sns.barplot()', 'sns.violinplot()', 'sns.countplot()', 'boxplot.'],
 ['7.10', 'Tham số order của regplot điều khiển điều gì?', 'Bậc của hồi quy đa thức', 'Kích thước marker', 'Thứ tự marker trong chú giải', 'Màu đường hồi quy', 'order = bậc đa thức.'],
 ['7.10', 'Seaborn là gì?', 'Thư viện trực quan hóa cấp cao dựa trên Matplotlib', 'Thư viện trực quan hóa dựa trên scikit-learn', 'Thư viện tăng số dòng mã', 'Thư viện học sâu', 'Seaborn có giao diện high-level.'],
 // 7.11 Folium
 ['7.11', 'Thư viện Folium chủ yếu dùng để làm gì?', 'Hiển thị dữ liệu địa lý trên bản đồ tương tác', 'Tạo dashboard tương tác', 'Tạo biểu đồ tĩnh', 'Vẽ đồ thị 3D', 'Folium = bản đồ.'],
 ['7.11', 'Tạo bản đồ cơ bản trong Folium bằng hàm nào?', 'folium.Map()', 'BaseMap()', 'create_map()', 'Không có cách trực tiếp', 'folium.Map().'],
 ['7.11', 'Tham số nào đặt tâm bản đồ?', 'location', 'change_center()', 'center()', 'set_center', 'Map(location=[lat, lon]).'],
 ['7.11', 'Hàm nào thêm vòng tròn có bán kính thay đổi vào bản đồ?', 'folium.Circle()', 'folium.Marker()', 'folium.PolyLine()', 'folium.Choropleth()', 'Circle thêm vòng tròn.'],
 ['7.11', 'Choropleth map thể hiện điều gì?', 'Các vùng địa lý được tô màu theo giá trị dữ liệu', 'Các vị trí địa lý có marker gom cụm', 'Phân bố mật độ điểm dữ liệu', 'Đường nối giữa các vị trí', 'Choropleth tô màu vùng.'],
 ['7.11', 'Định dạng file nào thường lưu dữ liệu biên giới địa lý cho choropleth?', 'GeoJSON', 'CSV', 'Excel', 'TXT', 'GeoJSON.'],
 // 7.12 Dash
 ['7.12', 'dcc trong dcc.Graph là viết tắt của gì?', 'Dash Core Components', 'Dynamic Chart Creator', 'Data Collection Component', 'Display Chart Component', 'dcc = Dash Core Components.'],
 ['7.12', 'Thành phần Dash nào tạo thanh trượt chọn MỘT khoảng giá trị?', 'dcc.RangeSlider()', 'dcc.Slider()', 'dcc.Input()', 'dcc.Dropdown()', 'RangeSlider chọn khoảng.'],
 ['7.12', 'Thành phần nào tạo ô nhập văn bản?', 'dcc.Input()', 'dcc.Dropdown()', 'dcc.Slider()', 'dcc.Graph()', 'Input.'],
 ['7.12', 'Thành phần nào hiển thị đồ thị và hình trực quan?', 'dcc.Graph()', 'dcc.Input()', 'dcc.Dropdown()', 'dcc.Slider()', 'Graph.'],
 ['7.12', 'Decorator nào cập nhật nội dung thành phần theo thao tác người dùng?', '@app.callback', '@dash_callback', '@app.route', '@update_content', 'Callback.'],
 ['7.12', 'Thuộc tính marks của dcc.Slider làm gì?', 'Gắn nhãn cho các giá trị cụ thể trên thanh trượt', 'Xác định khoảng giá trị', 'Đặt màu thanh trượt', 'Đặt giá trị ban đầu', 'marks = nhãn.'],
 // 7.13 API
 ['7.13', 'Dữ liệu được lấy khi client gửi loại request nào đến server?', 'GET', 'PORT', 'PUT', 'HTTP', 'GET lấy dữ liệu.'],
 ['7.13', 'Mã trạng thái nào xuất hiện khi server gặp lỗi nội bộ?', '500', '200', '300', '400', '500 = Internal Server Error.'],
 ['7.13', 'Mã trạng thái nào xuất hiện khi tài nguyên chỉ dành cho vai trò admin?', '401', '500', '303', '200', '401 = chưa được phép.'],
 ['7.13', 'URI là viết tắt của gì?', 'Uniform Resource Identifier', 'Universal Resource Identifier', 'Unique Resource Identifier', 'Unrestricted Resource Identifier', 'Uniform Resource Identifier.'],
 ['7.13', 'Gửi dữ liệu JSON mà không hiện trên URL, dùng cách nào?', 'requests.post(url, json={...})', 'requests.post(url, params={...})', 'requests.get(url, json={...})', 'requests.get(url, params={...})', 'POST với json; params đưa dữ liệu lên URL.'],
 // 7.14 Scraping
 ['7.14', 'Beautiful Soup có chức năng chính nào trong web scraping?', 'Phân tích và duyệt tài liệu HTML/XML', 'Gửi HTTP request', 'Lưu dữ liệu vào cơ sở dữ liệu', 'Trực quan hóa dữ liệu', 'Parse HTML.'],
 ['7.14', '"HTML parsing" trong web scraping nghĩa là gì?', 'Xác định và trích các phần tử cụ thể từ trang web', 'Chuyển HTML thành văn bản thuần', 'Phân tích cấu trúc CSDL của website', 'Lấy dữ liệu từ endpoint API', 'Parsing = trích phần tử.'],
 ['7.14', 'Hàm requests.get() làm gì?', 'Gửi GET request đến URL chỉ định', 'Gửi POST request', 'Lấy dữ liệu từ CSDL', 'Phân tích HTML', 'requests.get.'],
 // 7.15 DB2
 ['7.15', 'Tiện ích nào của IBM DB2 nạp dữ liệu từ file ngoài vào bảng?', 'LOAD DATA', 'IMPORT DATA', 'INSERT DATA', 'EXPORT DATA', 'LOAD DATA.'],
 ['7.15', 'Trường SEPARATOR trong tab LOAD DATA của DB2 dùng để làm gì?', 'Chỉ định ký tự phân cách các cột trong file đầu vào', 'Đặt khóa chính cho bảng', 'Xác định kiểu dữ liệu các cột', 'Điều khiển tốc độ nạp', 'SEPARATOR = delimiter.'],
 // 7.16 Hồi quy tuyến tính
 ['7.16', 'Hồi quy tuyến tính giả định quan hệ nào giữa biến độc lập và phụ thuộc?', 'Tuyến tính', 'Phi tuyến', 'Hàm mũ', 'Ngẫu nhiên', 'Linear.'],
 ['7.16', 'Trong Y = b0 + b1x, x là gì?', 'Biến dự đoán (predictor)', 'Biến mục tiêu', 'Hệ số chặn', 'Độ dốc', 'x là predictor.'],
 ['7.16', 'Trong y = mx + c, m là gì?', 'Độ dốc (slope)', 'Hệ số chặn', 'Phần dư', 'Biến phụ thuộc', 'm = slope.'],
 ['7.16', 'Hàm y = b0 + b1x1 + b2x2 + b3x3 + b4x4 là phương pháp nào?', 'Multiple linear regression', 'Linear regression', 'None linear regression', 'Polynomial regression', 'Nhiều biến độc lập.'],
 ['7.16', 'Mục tiêu của hồi quy tuyến tính là gì?', 'Cực tiểu tổng bình phương phần dư', 'Cực đại R²', 'Cực tiểu số biến dự đoán', 'Cực đại hệ số xác định', 'Minimize sum of squared residuals.'],
 ['7.16', 'Độ đo nào phù hợp nhất để đánh giá mô hình hồi quy?', 'RMSE', 'Accuracy', 'Precision', 'Recall', 'RMSE cho hồi quy.'],
 ['7.16', 'Điểm trong residual plot biểu diễn gì?', 'Hiệu giữa giá trị quan sát và giá trị dự đoán', 'Giá trị dự đoán', 'Giá trị quan sát thực', 'Điểm ngoại lai', 'Residual = thực − dự đoán.'],
 // 7.17 Poly/Ridge/Lasso
 ['7.17', 'Kỹ thuật hồi quy nào phạt theo GIÁ TRỊ TUYỆT ĐỐI của hệ số?', 'Lasso regression', 'Ridge regression', 'ElasticNet regression', 'Polynomial regression', 'Lasso = L1.'],
 ['7.17', 'Kỹ thuật nào phạt bằng BÌNH PHƯƠNG hệ số?', 'Ridge regression', 'Lasso regression', 'Polynomial regression', 'Linear regression', 'Ridge = L2.'],
 ['7.17', 'Mục tiêu chính của Ridge regression là gì?', 'Xử lý đa cộng tuyến, giảm overfitting', 'Chọn đặc trưng', 'Giảm phương sai về 0', 'Giảm bias', 'Ridge xử lý multicollinearity.'],
 ['7.17', 'Phương pháp nào kết hợp hình phạt của Ridge và Lasso?', 'ElasticNet regression', 'Polynomial regression', 'Stepwise regression', 'Gradient Boosting', 'ElasticNet.'],
 ['7.17', 'Tăng alpha trong Lasso làm hệ số thay đổi thế nào?', 'Hệ số co về 0', 'Hệ số tăng lên', 'Hệ số giữ nguyên', 'Hệ số chặn tăng', 'Alpha lớn → shrink.'],
 ['7.17', 'Tăng bậc trong hồi quy đa thức dẫn đến điều gì?', 'Overfitting', 'Underfitting', 'Tăng bias', 'Giảm phương sai', 'Bậc cao dễ overfitting.'],
 ['7.17', 'Khi nào chọn hồi quy đa thức thay cho tuyến tính?', 'Khi quan hệ giữa các biến là phi tuyến', 'Khi quan hệ là tuyến tính', 'Khi chỉ có hai biến', 'Khi không có tương quan', 'Polynomial cho phi tuyến.'],
 ['7.17', 'Lớp PolynomialFeatures trong scikit-learn làm gì?', 'Tạo các biến đổi đa thức của đặc trưng', 'Chọn đặc trưng', 'Chuẩn hóa đặc trưng', 'Giảm chiều', 'Tạo đặc trưng đa thức.'],
 // 7.18 Phân loại
 ['7.18', 'Mục đích chính của hồi quy logistic là gì?', 'Phân loại dữ liệu vào hai hoặc nhiều nhóm', 'Dự đoán kết quả liên tục', 'Gom cụm', 'Phát hiện ngoại lai', 'Logistic = phân loại.'],
 ['7.18', 'Thuật toán nào là học có giám sát?', 'Linear Regression', 'K-Means', 'Apriori', 'PCA', 'Linear Regression có nhãn.'],
 ['7.18', 'Đường chéo của confusion matrix biểu diễn gì?', 'True positives và true negatives', 'False positives và false negatives', 'True positives và false positives', 'True negatives và false negatives', 'Dự đoán đúng.'],
 ['7.18', 'Precision tính bằng công thức nào?', 'TP / (TP + FP)', 'TP / (TP + FN)', 'TP / (TP + TN)', 'TP / (FP + FN)', 'Precision = TP/(TP+FP).'],
 ['7.18', 'Quan hệ giữa precision và recall là gì?', 'Tỉ lệ nghịch', 'Độc lập', 'Tỉ lệ thuận', 'Bậc hai', 'Tăng cái này thường giảm cái kia.'],
 ['7.18', 'Độ đo nào phù hợp nhất cho bài toán phân loại mất cân bằng?', 'F1-Score', 'Accuracy', 'Precision', 'Recall', 'F1 cân bằng precision và recall.'],
 ['7.18', 'False positive (FP) là gì?', 'Mẫu bị dự đoán SAI là dương', 'Mẫu dự đoán đúng là dương', 'Mẫu dự đoán đúng là âm', 'Mẫu dự đoán sai là âm', 'FP = dự đoán dương nhưng thực là âm.'],
 // 7.19 Cây/SVC
 ['7.19', 'Gini impurity của nút có 80 mẫu lớp A và 20 mẫu lớp B là bao nhiêu?', '0.32', '0.40', '0.48', '0.64', '1 − (0.8² + 0.2²) = 0.32.'],
 ['7.19', 'Tăng min_samples_split của cây quyết định dẫn đến điều gì?', 'Cây đơn giản hơn, có thể underfitting', 'Cây phức tạp hơn, overfitting', 'Giảm bias', 'Tăng phương sai', 'Khó tách nút hơn → đơn giản hơn.'],
 ['7.19', 'min_samples_split = 10 nghĩa là gì?', 'Một nút chỉ được tách khi có ít nhất 10 mẫu', 'Độ sâu tối thiểu của cây là 10', 'Mỗi độ sâu phải có hơn 10 nút', 'Tổng số nút phải lớn hơn 10', 'Số mẫu tối thiểu để tách nút.'],
 ['7.19', 'Best C = 10 trong SVC cho biết điều gì về mức điều chuẩn?', 'Điều chuẩn yếu (low regularization strength)', 'Điều chuẩn mạnh', 'Không có điều chuẩn', 'Không kết luận được', 'C lớn → điều chuẩn yếu.'],
 ['7.19', 'Phương pháp nào chọn siêu tham số C tốt nhất cho SVC?', 'Grid Search', 'Random Search', 'Sequential Feature Selection', 'Recursive Feature Elimination', 'Grid Search.'],
 // 7.20 Tối ưu
 ['7.20', 'GridSearchCV tìm siêu tham số tốt nhất bằng cách nào?', 'Thử tất cả các tổ hợp siêu tham số', 'Chọn ngẫu nhiên', 'Dùng gradient descent', 'Dùng siêu tham số mặc định', 'Exhaustive search.'],
 ['7.20', '"Grid" trong grid search là gì?', 'Tập các tham số mô hình tiềm năng', 'Tập các đặc trưng đầu vào', 'Tập các dự đoán đầu ra', 'Tập các độ đo đánh giá', 'Lưới tham số.'],
 ['7.20', 'Hàm nào dùng cross-validation để đánh giá mô hình?', 'cross_val_score()', 'evaluate()', 'validate()', 'model_performance()', 'cross_val_score.'],
 ['7.20', 'Tham số cv trong cross-validation là gì?', 'Số fold hoặc số lần lặp cross-validation', 'Giá trị độ phức tạp', 'Điểm cross-validation', 'Tham số điều chuẩn', 'cv = số fold.'],
 ['7.20', 'Hàm nào tạo pipeline với các bước tuần tự?', 'make_pipeline()', 'build_pipeline()', 'create_pipeline()', 'init_pipeline()', 'make_pipeline hoặc lớp Pipeline.'],
 ['7.20', 'fit_transform() thường làm gì?', 'Vừa fit vừa biến đổi dữ liệu huấn luyện', 'Chỉ fit mô hình', 'Chỉ biến đổi dữ liệu', 'Không làm gì', 'Fit và transform đồng thời.'],
 // 7.21 Deep learning
 ['7.21', 'Mục đích chính của hàm kích hoạt trong mạng nơ-ron là gì?', 'Thêm tính phi tuyến cho mô hình', 'Khởi tạo trọng số', 'Giảm độ phức tạp', 'Tính gradient', 'Activation → non-linearity.'],
 ['7.21', 'Hàm kích hoạt nào hay dùng ở lớp ẩn của CNN?', 'ReLU', 'Sigmoid', 'Tanh', 'Softmax', 'ReLU.'],
 ['7.21', 'Softmax ở lớp ra của mô hình nhiều lớp làm gì?', 'Chuyển logits thành phân phối xác suất trên nhiều lớp', 'Áp ngưỡng cho phân loại nhị phân', 'Chuẩn hóa đầu vào', 'Tính đạo hàm', 'Softmax → xác suất.'],
 ['7.21', 'Lớp nào giảm kích thước không gian và kiểm soát overfitting trong CNN?', 'MaxPooling', 'Convolutional', 'Dense', 'Flatten', 'MaxPooling.'],
 ['7.21', 'Dropout trong CNN để làm gì?', 'Chống overfitting bằng cách ngẫu nhiên bỏ nơ-ron khi huấn luyện', 'Giảm learning rate', 'Tăng số tham số', 'Tăng độ chính xác trực tiếp', 'Dropout chống overfitting.'],
 ['7.21', 'model.compile() làm gì?', 'Gắn optimizer, loss function và metrics', 'Khởi tạo trọng số', 'Định nghĩa kiến trúc', 'Đánh giá mô hình', 'compile.'],
 ['7.21', 'model.fit() làm gì?', 'Huấn luyện mô hình trên dữ liệu huấn luyện', 'Biên dịch mô hình', 'Khởi tạo trọng số', 'Đánh giá mô hình', 'fit.'],
 ['7.21', 'model.evaluate() làm gì?', 'Đánh giá hiệu năng trên dữ liệu kiểm tra', 'Biên dịch mô hình', 'Huấn luyện mô hình', 'Khởi tạo trọng số', 'evaluate.'],
 // 7.22 Watson Assistant
 ['7.22', 'Intent trong Watson Assistant là gì?', 'Mục đích hoặc mục tiêu thể hiện trong câu nhập của khách hàng', 'Thông tin cụ thể trích từ câu nhập', 'Luồng hội thoại', 'Hồ sơ người dùng', 'Intent = mục đích.'],
 ['7.22', 'Entity trong Watson Assistant dùng để làm gì?', 'Trích thông tin cụ thể từ câu nhập của người dùng', 'Xác thực người dùng', 'Định nghĩa luồng hội thoại', 'Lưu hồ sơ người dùng', 'Entity = thông tin cụ thể.'],
 ['7.22', 'Dialog node dùng để làm gì?', 'Điều khiển luồng hội thoại', 'Biểu diễn tin nhắn người dùng', 'Định nghĩa intents', 'Lưu dữ liệu người dùng', 'Dialog node điều khiển luồng.'],
 ['7.22', 'Tính năng Slots trong dialog node để làm gì?', 'Thu thập thông tin từ câu nhập của người dùng', 'Biểu diễn khoảng trống trong hội thoại', 'Dự trữ bộ nhớ', 'Định nghĩa màu giao diện', 'Slots thu thập thông tin.'],
 ['7.22', 'Dialog skill dùng công nghệ nào để hiểu câu hỏi?', 'Xử lý ngôn ngữ tự nhiên của Watson và học máy', 'Chỉ xử lý ngôn ngữ tự nhiên của Watson', 'Chỉ học máy', 'Không dùng công nghệ nào', 'Cả NLP và ML.'],
 // 7.23 Triển khai
 ['7.23', 'Khi thay đổi dialog của chatbot, có cần triển khai lại không?', 'Không cần triển khai lại', 'Luôn phải triển khai lại', 'Phải xóa chatbot', 'Phải tạo skill mới', 'Không cần re-deploy.'],
 ['7.23', 'Tích hợp chatbot với Facebook Messenger cần gì để thiết lập?', 'Access token', 'Developer API key', 'Facebook Graph API', 'OAuth token', 'Access token.'],
 ['7.23', 'Tính năng "Try it out" dùng để làm gì?', 'Gỡ lỗi chatbot', 'Triển khai chatbot lên môi trường thật', 'Tự tạo dữ liệu huấn luyện', 'Nhập cấu hình chatbot có sẵn', 'Try it out = debug.'],
 ['7.23', 'Phương thức nào thường dùng để xác thực truy cập API Watson?', 'API key', 'OAuth authentication', 'API token', 'Access key', 'API key.'],
 ['7.23', 'Ba cách làm giao diện giọng nói cho chatbot Watson Assistant là gì?', 'Cuộc gọi điện thoại, Speech to Text và Text to Speech APIs, Voice Agent with Watson', 'Cuộc gọi điện thoại, chỉ Speech to Text và Text Agent', 'Cuộc gọi điện thoại, chỉ Text to Speech và Voice Agent', 'Chỉ Text Agent with Watson', 'Ba cách đầy đủ.'],
 ['7.23', 'Webhook kết nối DB2 được cấu hình như thế nào?', 'Cung cấp endpoint URL của webhook trong thiết lập webhook', 'Ghi câu SQL trực tiếp trong thiết lập webhook', 'Nhúng thông tin đăng nhập CSDL vào câu trả lời', 'Tạo một webhook riêng cho mỗi truy vấn', 'Endpoint URL.'],
 // 7.24 API Watson
 ['7.24', 'Đầu ra của Watson Speech to Text là gì?', 'Văn bản (text)', 'Âm thanh', 'JSON', 'Hình ảnh', 'Giọng nói → văn bản.'],
 ['7.24', 'Dịch vụ Watson nào chuyển văn bản thành giọng nói?', 'Text-to-Speech', 'Speech-to-Text', 'Discovery', 'Natural Language Understanding', 'Text-to-Speech.'],
 ['7.24', 'Dịch vụ Watson nào dùng cho lập chỉ mục và tìm kiếm tài liệu?', 'Watson Discovery', 'Watson Assistant', 'Watson Language Translator', 'Watson Natural Language Understanding', 'Discovery.'],
 ['7.24', 'Dịch vụ Watson nào dùng để hiểu và xử lý nội dung văn bản?', 'Natural Language Understanding', 'Watson Assistant', 'Watson Discovery', 'Language Translator', 'NLU.'],
 // 7.25 Hệ số
 ['7.25', 'Với câu polynomial regression nhiệt độ theo giờ (câu 91 và 99), bộ hệ số đúng theo bộ đề là gì?', 'a=0.83, b=1.77, c=1.07', 'a=0.82, b=1.74, c=1.02', 'a=0.83, b=1.77, c=1.09', 'a=0.84, b=1.78, c=1.10', 'Đáp án của bộ đề.'],
 ['7.25', 'Với câu logistic regression nhiệt độ theo giờ có a, b ban đầu 0.8 và 1.2 (câu 95), đáp án theo bộ đề là gì?', 'a=0.56, b=1.14', 'a=0.32, b=1.08', 'a=0.09, b=1.02', 'a=-0.15, b=0.96', 'Đáp án của bộ đề.'],
 ['7.25', 'Với câu logistic regression theo lượng mưa (câu 98), đáp án theo bộ đề là gì?', 'a=0.46, b=0.48', 'a=0.42, b=0.46', 'a=0.39, b=0.43', 'a=0.35, b=0.41', 'Đáp án của bộ đề.'],
 // 7.26 Bẫy
 ['7.26', 'Dcc.Slider khác dcc.RangeSlider ở điểm nào?', 'Slider chọn một giá trị; RangeSlider chọn một khoảng', 'Slider chọn một khoảng; RangeSlider chọn một giá trị', 'Cả hai đều chỉ nhập văn bản', 'Cả hai đều là danh sách thả xuống', 'Slider: một giá trị; RangeSlider: một khoảng.'],
 ['7.26', 'Khác biệt cơ bản giữa Ridge và Lasso là gì?', 'Ridge phạt bình phương hệ số; Lasso phạt giá trị tuyệt đối và có thể đưa hệ số về 0', 'Ridge phạt giá trị tuyệt đối; Lasso phạt bình phương', 'Cả hai phạt theo cách giống nhau', 'Ridge luôn đưa hệ số về 0', 'Ridge L2, Lasso L1.'],
 ['7.26', 'Độ đo nào dành cho hồi quy, độ đo nào dành cho phân loại?', 'R², RMSE, MSE cho hồi quy; Accuracy, Precision, Recall, F1 cho phân loại', 'Accuracy cho hồi quy; R² cho phân loại', 'Mọi độ đo dùng cho cả hai', 'F1 cho hồi quy', 'Phân biệt hồi quy và phân loại.'],
 ['7.26', 'Với câu có đáp án "All of the above", nên làm gì?', 'Kiểm tra từng lựa chọn rồi mới quyết định', 'Luôn chọn "All of the above"', 'Không bao giờ chọn', 'Chọn theo độ dài đáp án', 'Đừng chọn theo phản xạ.']
];
const FE26 = (await import('./dap-recall7-fe26.mjs')).default;   // câu bổ sung từ đề FE Fall 2026
Q.push(...FE26);
const EN = (await import('./dap-recall7-en.mjs')).default;   // bản tiếng Anh, cùng thứ tự
if (EN.length !== Q.length) { console.log('Số câu tiếng Anh', EN.length, 'khác số câu', Q.length); process.exit(1); }
const out = Q.map(([ref, q, correct, w1, w2, w3, explain], i) => { const [r2, eq, ec, e1, e2, e3] = EN[i]; if (r2 !== ref) { console.log('Lệch mục ở câu', i + 1, ref, r2); process.exit(1); } return { ref, q, correct, wrong: [w1, w2, w3], explain, en: { q: eq, correct: ec, wrong: [e1, e2, e3] } }; });
const bad = out.filter(x => new Set([x.correct, ...x.wrong]).size !== 4 || !x.q || x.wrong.some(w => !w) || new Set([x.en.correct, ...x.en.wrong]).size !== 4);
if (bad.length) { console.log('Câu lỗi:', bad.map(b => b.q)); process.exit(1); }
const dir = path.join(ROOT, 'sources-private', 'recall-dap'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'm7.json'), JSON.stringify(out, null, 1));
console.log(out.length + ' câu ôn lý thuyết → sources-private/recall-dap/m7.json');
