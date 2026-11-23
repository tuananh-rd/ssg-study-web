# Bàn giao: việc còn lại của dự án web ôn thi (SSG105, DAP391m, AIL303m, CPV301)

Web chạy ở https://mangtheomotnetve.website (Cloudflare Pages + D1, project `ssg-study`). Đề thi cuối kỳ bằng tiếng Anh, bài giảng bằng tiếng Việt.

## Cấu trúc nhanh
- `src/app.js`, `src/ai.js`, `src/style.css`: giao diện dùng chung cho cả 4 môn. `node build.mjs` ra `ssg105.html`.
- `web/scripts/build-subjects.mjs`: dựng 3 môn còn lại vào `web/data/app-*.html`. `web/scripts/build-content.mjs`: gói thành `web/functions/_content.generated.js` (Cloudflare Functions dùng file này).
- `web/functions/`: API (đăng nhập, tiến độ, AI, thi đấu, chat, nhật ký). `web/public/`: trang chủ + file tĩnh.
- Dữ liệu CPV301: `web/data/cpv-questions.json` (bộ đề), `sources-private/explain-out-cpv/` (lời giải soạn sẵn), `sources-private/translate-out-cpv/` (bản dịch Việt của đề).
- Build đầy đủ: `node build.mjs && node web/scripts/build-subjects.mjs && node web/scripts/build-content.mjs`, kiểm cú pháp: `node sources-private/tools/check-html.mjs web/data/app-cpv301.html`.
- Deploy (chỉ chủ tài khoản Cloudflare làm được): `cd web && node scripts/deploy.mjs` (đóng dấu phiên bản để người đang mở web được báo có bản mới).

## Chuyện vừa xảy ra (đã làm xong)
Đáp án bộ đề CPV301 bị sai do chữ ẩn (đáp án) trong slide đánh số theo file HTML, còn ảnh slide lệch 2 so với HTML. Mình đã ghép lại bằng pageid, cho 20 agent xem lại ảnh 319 slide, rồi ghi kết quả vào bộ đề (script `sources-private/tools/cpv-merge.cjs --write`). Kết quả: đổi đáp án 18 câu (id 7–32 và 120), 3 câu nguồn ghi sai/trống nên dùng đáp án theo kiến thức (id 123 → A, id 264 → C, id 291 → B), chép lại chữ phương án theo ảnh cho id 277–285. Đã deploy.

## Việc còn lại (làm theo thứ tự)
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
