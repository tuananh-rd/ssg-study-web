# Bàn giao: việc còn lại của dự án web ôn thi (SSG105, DAP391m, AIL303m, CPV301)

Web chạy ở https://mangtheomotnetve.website (Cloudflare Pages + D1, project `ssg-study`). Đề thi cuối kỳ bằng tiếng Anh, bài giảng bằng tiếng Việt.

## Cấu trúc nhanh
- Cập nhật 23/11/2026: đã bổ sung 30 lời giải và 9 bản dịch trong hai file `cpv-901.json`, cùng thông báo mới ở đầu `CHANGELOG`. Chạy lại build và kiểm tra preview trước khi deploy bằng tài khoản Cloudflare của chủ dự án.
- Lưu ý ID CPV: các batch lời giải/bản dịch cũ dùng ID sau gộp câu trùng; riêng hai file `cpv-901.json` dùng ID gốc trong `web/data/cpv-questions.json`. `build-subjects.mjs` ánh xạ riêng batch 901 sang ID hiển thị, ưu tiên lời giải/bản dịch sửa mới và giữ nguyên ID tiến độ. Ví dụ ID gốc 17 → hiển thị 16, 277 → 263; ID gốc 16 và 19 là câu trùng nên dùng chung câu hiển thị với 13 và 15.
- `explain-out-cpv/cpv-900.json` bổ sung 5 lời giải còn thiếu trong dải kiểm tra, dùng ID hiển thị 17, 19, 22, 31, 32 (ID gốc 18, 21, 24, 33, 34), theo quy ước batch cũ. Không thay đổi đáp án nào; câu hiển thị 32 (ID gốc 34) được chú thích vì lựa chọn NOT không phù hợp với ứng dụng image registration.
- `translate-out-cpv/cpv-900.json` sửa thêm bản dịch bị lệch ở câu Eigenfaces (ID gốc 291 → ID hiển thị 277), phát hiện khi kiểm tra ba câu có đính chính nguồn trên giao diện VI. File này cũng dùng ID hiển thị theo quy ước batch cũ; bản dịch trước đó nói về bộ lọc ảnh thay vì khuôn mặt.
- Nguồn đối chiếu học thuật: [Object Tracking: A Survey (Yilmaz, Javed, Shah)](https://www.crcv.ucf.edu/papers/Object%20Tracking.pdf), [Eigenfaces (Turk, Pentland)](https://www.cs.utexas.edu/~grauman/courses/spring2007/395T/papers/turk_pentland_1991.pdf), [EWA (Greene, Heckbert)](https://publications.ri.cmu.edu/creating-raster-omnimax-images-from-multiple-perspective-views-using-the-elliptical-weighted-average-filter), [OpenCV Laplacian](https://docs.opencv.org/4.x/d5/db5/tutorial_laplace_operator.html), [OpenCV thresholding](https://docs.opencv.org/4.x/db/d8e/tutorial_threshold.html). Các câu nguồn mơ hồ được ghi rõ giới hạn trong lời giải thay vì sửa đáp án.
- `src/app.js`, `src/ai.js`, `src/style.css`: giao diện dùng chung cho cả 4 môn. `node build.mjs` ra `ssg105.html`.
- `web/scripts/build-subjects.mjs`: dựng 3 môn còn lại vào `web/data/app-*.html`. `web/scripts/build-content.mjs`: gói thành `web/functions/_content.generated.js` (Cloudflare Functions dùng file này).
- `web/functions/`: API (đăng nhập, tiến độ, AI, thi đấu, chat, nhật ký). `web/public/`: trang chủ + file tĩnh.
- Dữ liệu CPV301: `web/data/cpv-questions.json` (bộ đề), `sources-private/explain-out-cpv/` (lời giải soạn sẵn), `sources-private/translate-out-cpv/` (bản dịch Việt của đề).
- Build đầy đủ: `node build.mjs && node web/scripts/build-subjects.mjs && node web/scripts/build-content.mjs`, kiểm cú pháp: `node sources-private/tools/check-html.mjs web/data/app-cpv301.html`.
- Deploy (chỉ chủ tài khoản Cloudflare làm được): `cd web && node scripts/deploy.mjs` (đóng dấu phiên bản để người đang mở web được báo có bản mới).

## Chuyện vừa xảy ra (đã làm xong)
Đáp án bộ đề CPV301 bị sai do chữ ẩn (đáp án) trong slide đánh số theo file HTML, còn ảnh slide lệch 2 so với HTML. Mình đã ghép lại bằng pageid, cho 20 agent xem lại ảnh 319 slide, rồi ghi kết quả vào bộ đề (script `sources-private/tools/cpv-merge.cjs --write`). Kết quả: đổi đáp án 18 câu (id 7–32 và 120), 3 câu nguồn ghi sai/trống nên dùng đáp án theo kiến thức (id 123 → A, id 264 → C, id 291 → B), chép lại chữ phương án theo ảnh cho id 277–285. Đã deploy.

## Việc còn lại (làm theo thứ tự)
Trạng thái sau cập nhật 23/11/2026: đã hoàn tất phần nội dung, build, kiểm tra cú pháp và mở preview bằng `static-preview.mjs`. Câu hiển thị 7–32 đều có lời giải; 9 bản dịch mới và ba câu có đính chính nguồn đã được kiểm tra trên giao diện. Chạy `node web/scripts/check-cpv-corrections.mjs` sau build để kiểm tra hồi quy. Chủ tài khoản Cloudflare cần lấy commit mới (`git pull --ff-only`) rồi chạy `cd web` và `node scripts/deploy.mjs`; chưa deploy trong lần cập nhật này. Danh sách bên dưới được giữ làm checklist bàn giao gốc.

1. **Viết lại lời giải cho 30 câu CPV vừa đổi** (danh sách `explain_ids` trong `sources-private/cpv-need-regen.json`). Lời giải cũ của các câu này đã bị xoá vì mô tả đáp án sai nên hiện câu nào cũng đang thiếu lời giải.
   - Với mỗi id, đọc câu hỏi, phương án, đáp án đúng (`answer` là chỉ số bắt đầu từ 0) trong `web/data/cpv-questions.json` (tìm theo `id`).
   - Viết lời giải tiếng Việt, 2–5 câu, giải thích VÌ SAO đáp án đúng, và nêu ngắn vì sao vài phương án còn lại sai. Giữ nguyên thuật ngữ tiếng Anh.
   - Ghi vào file mới `sources-private/explain-out-cpv/cpv-901.json` dạng `{"7": "lời giải…", "8": "…"}` (khoá là id dạng chuỗi). Tên file phải khớp `cpv-<số>.json` thì bước build mới đọc.
   - Với id 123 (kernel tracking), 264 (edge linking), 291 (Eigenfaces): đáp án nguồn ghi khác với kiến thức chuẩn; nêu trong lời giải rằng "bộ đề gốc ghi X nhưng theo giáo trình đáp án đúng là Y". Xem ghi chú trong `sources-private/cpv-merge-report.json`.
2. **Dịch lại phương án cho id 277–285** (xem `translate_bank_ids` trong `cpv-need-regen.json`): chữ các phương án đã đổi theo ảnh nên bản dịch cũ lệch. Ghi `sources-private/translate-out-cpv/cpv-901.json` dạng `{"277": {"q": "dịch đề", "options": ["dịch A","dịch B","dịch C","dịch D"]}, …}`, `options` giữ đúng thứ tự phương án trong `cpv-questions.json`.
3. **Soát nhanh những câu đáng nghi nhưng đã giữ theo nguồn** (không bắt buộc sửa): id 120 (LoG → "Sobel 5x5"), id 66 và id 65 (K-means), id 266 (thin lens), id 134. Nguồn slide ghi vậy nên đang giữ; nếu muốn đổi, sửa `answer` trong `web/data/cpv-questions.json` rồi xoá lời giải cũ của id đó.
4. Build lại (lệnh ở trên), mở thử `web/data/app-cpv301.html` bằng `node web/scripts/static-preview.mjs data/app-cpv301.html 5175` (vào `http://localhost:5175/#/bank`), kiểm tra các câu id 7–32 hiện đúng đáp án và có lời giải. Rồi commit và push; người chủ tài khoản Cloudflare chạy deploy.
5. Mỗi lần deploy bản mới có thay đổi người dùng thấy được, thêm một mục LÊN ĐẦU mảng `CHANGELOG` trong `web/public/whatsnew.js` để người dùng nhận thông báo khi vào web.

## Lưu ý
- Không đưa khoá API, mật khẩu, file `.dev.vars` vào repo (repo công khai). Khoá AI nằm trong secret của Cloudflare (`AI_CONFIGS`).
- Ảnh slide gốc và các thư mục SVG nguồn không nằm trong repo (nặng, có bản quyền), nhưng kết quả đối chiếu (`sources-private/cpv-verify-in` và `cpv-verify-out`) có sẵn.
- Môn DAP391m và AIL303m chưa kiểm tra lại đáp án theo cách này (dữ liệu của hai môn lấy từ file `data.js` khác, chưa thấy dấu hiệu lệch).
