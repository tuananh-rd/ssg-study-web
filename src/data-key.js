// ===== KIẾN THỨC KEY: quiz viết tay ôn các ý bắt buộc phải nhớ khi thi =====
// K(mục, câu hỏi, đáp án đúng, [3 đáp án nhiễu], giải thích, mẹo nhớ)
// Đáp án nhiễu cố ý lấy từ khái niệm dễ nhầm ngay trong bài, để làm đúng phải thật sự phân biệt được.
DATA.keyq = [];
(function () {
  function K(ref, q, c, w, x, tip) { DATA.keyq.push({ ref: ref, q: q, correct: c, wrong: w, explain: x, tip: tip || '' }); }
  var EPL = ['Ethos', 'Pathos', 'Logos', 'Kairos'];
  function epl(ref, q, c, x, tip) { K(ref, q, c, EPL.filter(function (e) { return e !== c; }), x, tip); }

  // ---------- M2 Nền tảng làm việc nhóm ----------
  K('2.1', 'Điểm khác biệt cốt lõi giữa team và group là gì?', 'Team có mục tiêu chung cụ thể, phụ thuộc lẫn nhau và cùng chịu trách nhiệm',
    ['Team luôn đông người hơn group', 'Group có quyền ra quyết định, team chỉ trao đổi thông tin', 'Team được đánh giá cá nhân, group được đánh giá chung'],
    'Team: mục tiêu chung cụ thể, phụ thuộc lẫn nhau, cùng chịu trách nhiệm, có quyền ra quyết định. Group: mục tiêu riêng, phụ thuộc thấp, đánh giá cá nhân.',
    'Team = 3 chữ “cùng”: cùng mục tiêu, cùng phụ thuộc, cùng chịu trách nhiệm.');
  K('2.1', 'Thành viên của một GROUP (không phải team) thường được đánh giá thế nào?', 'Đánh giá cá nhân',
    ['Đánh giá chung cả nhóm', 'Đánh giá theo kết quả của trưởng nhóm', 'Không được đánh giá'],
    'Group: mỗi người có thể theo mục tiêu riêng nên thường được đánh giá cá nhân; team mới cùng chịu trách nhiệm kết quả.');
  K('2.1', 'Ý nào KHÔNG thuộc 5 đặc trưng của team?', 'Mỗi thành viên theo đuổi mục tiêu riêng',
    ['Có sự ổn định trong một khoảng thời gian', 'Có quyền hạn và khả năng ra quyết định', 'Hoạt động trong một bối cảnh xã hội / tổ chức'],
    '5 đặc trưng của team: cùng chịu trách nhiệm cho mục tiêu chung; phụ thuộc lẫn nhau; ổn định trong một thời gian; có quyền ra quyết định; hoạt động trong bối cảnh xã hội / tổ chức. “Mục tiêu riêng” là đặc điểm của group.');
  K('2.3', 'Synergy nghĩa là gì?', 'Kết quả chung lớn hơn tổng kết quả của từng người cộng lại',
    ['Mọi thành viên có kỹ năng giống hệt nhau', 'Cả nhóm luôn đồng ý với nhau', 'Mức độ hấp dẫn của nhóm đối với thành viên'],
    'Synergy là dấu hiệu team hoạt động tốt: kết quả chung lớn hơn tổng kết quả riêng lẻ. “Mức độ hấp dẫn của nhóm” là cohesiveness.',
    'Synergy: 1 + 1 > 2.');
  K('2.4', 'Group cohesiveness là gì?', 'Mức độ hấp dẫn của nhóm đối với thành viên — hài lòng và muốn ở lại',
    ['Khuynh hướng tuân theo áp lực nhóm, bỏ qua ý kiến trái chiều', 'Kết quả chung lớn hơn tổng kết quả riêng lẻ', 'Thỏa thuận về cách team làm việc'],
    'Cohesiveness = sức hút của nhóm (hài lòng, muốn ở lại). Áp lực tuân theo là groupthink; 1+1>2 là synergy; thỏa thuận làm việc là team charter.');
  K('2.4', 'Yếu tố nào KHÔNG thuộc 5 yếu tố ảnh hưởng đến cohesiveness?', 'Số buổi họp mỗi tuần',
    ['Quy mô nhóm', 'Cạnh tranh bên ngoài', 'Tính chọn lọc / địa vị của nhóm'],
    '5 yếu tố: quy mô, tương đồng, thành công, tính chọn lọc / địa vị, cạnh tranh bên ngoài.',
    '“Quy – Tương – Thành – Chọn – Cạnh”: Quy mô, Tương đồng, Thành công, Chọn lọc, Cạnh tranh ngoài.');
  K('2.4', 'Nhóm càng lớn thì cohesiveness thường thay đổi thế nào?', 'Dễ giảm hài lòng và tăng xung đột',
    ['Gắn kết hơn vì có nhiều người hỗ trợ', 'Không bị ảnh hưởng', 'Tự động tạo ra synergy'],
    'Theo bài: nhóm càng lớn càng dễ giảm hài lòng và tăng xung đột, nên cohesiveness giảm.');
  K('2.4', 'Groupthink là gì?', 'Tuân theo áp lực nhóm, giảm tư duy phản biện và bỏ qua ý kiến trái chiều',
    ['Mức độ hấp dẫn của nhóm, khiến thành viên hài lòng và muốn ở lại lâu dài', 'Cách tạo thật nhiều ý tưởng trước, rồi mới đánh giá theo tiêu chí chung', 'Việc lãnh đạo luân chuyển theo nhiệm vụ để mọi người cùng phát triển'],
    'Groupthink là mặt trái của quá nhiều đồng thuận: tuân theo áp lực nhóm, giảm phản biện.',
    'Cohesiveness có lợi, nhưng quá nhiều đồng thuận → groupthink.');
  K('2.4', 'Cách nào giúp PHÒNG TRÁNH groupthink?', 'Chủ động mời phản biện và yêu cầu bằng chứng',
    ['Để lãnh đạo chốt kết luận sớm cho nhanh', 'Đánh giá ngay mỗi ý tưởng vừa được nêu', 'Chỉ lắng nghe ý kiến của số đông'],
    'Phòng groupthink: mời phản biện; tách tạo ý tưởng khỏi đánh giá; yêu cầu bằng chứng; cho ý kiến thiểu số trình bày; lãnh đạo không áp đặt kết luận sớm.');
  K('2.5', 'Yếu tố nào làm GIẢM hiệu quả của team?', 'Vai trò không rõ, phân công không công bằng',
    ['Lãnh đạo luân chuyển theo nhiệm vụ', 'Thành viên phụ thuộc tích cực vào nhau', 'Giao tiếp rõ ràng'],
    'Yếu tố làm giảm hiệu quả: thiếu động lực; không thống nhất mục tiêu; thiếu nguồn lực; quản lý kiểm soát quá mức; vai trò không rõ, phân công không công bằng; hành vi cản trở. Ba phương án còn lại là dấu hiệu team hoạt động TỐT (§2.3).');
  K('2.6', 'Bốn nhóm kỹ năng cần có của thành viên team là gì?', 'Giao tiếp; chuyên môn; ra quyết định & giải quyết vấn đề; quan hệ liên cá nhân',
    ['Giao tiếp; lãnh đạo; thuyết trình; viết báo cáo', 'Chuyên môn; ngoại ngữ; tin học; quản lý thời gian', 'Lắng nghe; đồng cảm; thuyết phục; đàm phán'],
    '4 nhóm kỹ năng: giao tiếp; chuyên môn / kỹ thuật; ra quyết định và giải quyết vấn đề; quan hệ liên cá nhân.');
  K('2.7', '“Cung cấp thông tin, theo dõi tiến độ, thúc đẩy ra quyết định” thuộc nhóm vai trò nào?', 'Task-facilitating roles',
    ['Relationship-building roles', 'Blocking roles', 'Challenger roles'],
    'Task-facilitating: hướng vào việc hoàn thành nhiệm vụ. Relationship-building: động lực, đồng cảm, gắn kết. Blocking: cản trở.',
    'Task = việc; Relationship = người; Blocking = cản.');
  K('2.7', '“Tạo động lực, đồng cảm, duy trì gắn kết và xử lý mâu thuẫn” thuộc nhóm vai trò nào?', 'Relationship-building roles',
    ['Task-facilitating roles', 'Blocking roles', 'Challenger roles'],
    'Relationship-building roles chăm lo quan hệ trong nhóm; task-facilitating chăm lo nhiệm vụ.');
  K('2.7', 'Một thành viên độc chiếm thảo luận và né tránh trách nhiệm. Đây là vai trò gì?', 'Blocking roles',
    ['Task-facilitating roles', 'Relationship-building roles', 'Challenger roles'],
    'Blocking roles: hành vi làm chậm tiến độ, giảm tinh thần, niềm tin hoặc đóng góp của người khác.');
  K('2.7', 'Team quá thiên về đồng thuận (quan hệ) dễ gặp hậu quả gì?', 'Chậm ra quyết định',
    ['Căng thẳng vì áp lực nhiệm vụ', 'Tư duy phản biện tăng mạnh', 'Synergy tăng cao'],
    'Team cần cân bằng: quá thiên về nhiệm vụ → căng thẳng; quá thiên về đồng thuận → chậm quyết định.');

  // ---------- M3 Team charter, niềm tin, an toàn tâm lý ----------
  K('3.1', 'Team charter / team contract là gì?', 'Thỏa thuận về cách team làm việc',
    ['Báo cáo tiến độ gửi giảng viên', 'Đề xuất dự án gửi nhà tài trợ', 'Biên bản ghi lại một cuộc họp'],
    'Team charter thống nhất mục tiêu, vai trò, lịch họp, quy tắc, cách ra quyết định và cách xử lý vi phạm — để phòng ngừa vấn đề.');
  K('3.1', 'Nội dung nào KHÔNG cần có trong team charter?', 'Điểm số cá nhân của từng thành viên ở các môn khác',
    ['Cách ra quyết định', 'Cách xử lý chậm tiến độ và vi phạm cam kết', 'Lịch họp và kênh giao tiếp'],
    'Team charter gồm: mục tiêu & sản phẩm; vai trò, trách nhiệm; lịch họp & kênh giao tiếp; quy tắc, thời hạn, chất lượng; cách ra quyết định; cách xử lý bất đồng, chậm tiến độ, vi phạm.');
  K('3.1', 'Quy trình xử lý xung đột của team nên được thiết kế khi nào?', 'Trước khi xung đột xảy ra',
    ['Ngay khi có xung đột đầu tiên', 'Sau khi dự án kết thúc', 'Chỉ khi giảng viên yêu cầu'],
    'Một thói quen quan trọng trong §3.1: thiết kế quy trình xử lý xung đột trước khi xung đột xảy ra.');
  K('3.2', 'Công thức Trust Equation là gì?', 'Trustworthiness = (Credibility + Reliability + Intimacy) / Self-orientation',
    ['Trustworthiness = (Credibility + Reliability + Self-orientation) / Intimacy', 'Trustworthiness = Credibility × Reliability × Intimacy', 'Trustworthiness = (Reliability + Intimacy + Self-orientation) / Credibility'],
    'Ba yếu tố tốt nằm trên tử số; self-orientation (vì lợi ích bản thân) nằm dưới mẫu số.',
    'Ba cái tốt ở trên, cái “vì mình” ở dưới — càng ích kỷ càng mất lòng tin.');
  K('3.2', 'Khi self-orientation TĂNG thì trustworthiness thay đổi thế nào?', 'Giảm',
    ['Tăng', 'Không đổi', 'Chỉ tăng khi reliability cũng tăng'],
    'Self-orientation là mẫu số: càng lớn thì trustworthiness càng nhỏ.');
  K('3.2', '“Bạn có thực hiện cam kết ổn định, đúng hạn không” là thành phần nào của Trust Equation?', 'Reliability',
    ['Credibility', 'Intimacy', 'Self-orientation'],
    'Credibility = nói gì, biết gì (chuyên môn). Reliability = giữ cam kết, đúng hạn. Intimacy = an toàn khi chia sẻ. Self-orientation = vì mình hay vì người khác.',
    'Reliability → “rely on”: dựa vào được vì luôn giữ lời.');
  K('3.2', '“Người khác có cảm thấy an toàn khi chia sẻ với bạn không” là thành phần nào?', 'Intimacy',
    ['Credibility', 'Reliability', 'Self-orientation'],
    'Intimacy = mức độ người khác cảm thấy an toàn khi chia sẻ với bạn.');
  K('3.2', '“Bạn nói gì, biết gì; mức chính xác và chuyên môn” là thành phần nào?', 'Credibility',
    ['Reliability', 'Intimacy', 'Self-orientation'],
    'Credibility = độ tin về lời nói và chuyên môn.');
  K('3.3', 'Psychological safety (an toàn tâm lý) là gì?', 'Niềm tin chung rằng team an toàn để nói ý kiến, hỏi, nhận sai mà không bị chế giễu',
    ['Niềm tin vào một cá nhân, dựa trên credibility, reliability và intimacy', 'Cảm giác yên tâm về việc làm, thu nhập và phúc lợi khi tham gia team', 'Quy định bảo mật thông tin nội bộ mà mọi thành viên phải tuân thủ'],
    'An toàn tâm lý là niềm tin CHUNG của cả team (khác Trust Equation nhìn vào MỘT người).');
  K('3.3', 'Thứ tự 4 tầng của psychological safety là gì?', 'Inclusion → Learner → Contributor → Challenger',
    ['Learner → Inclusion → Contributor → Challenger', 'Inclusion → Contributor → Learner → Challenger', 'Contributor → Learner → Inclusion → Challenger'],
    'Được chấp nhận (Inclusion) → dám học, dám sai (Learner) → dám đóng góp (Contributor) → dám chất vấn (Challenger).',
    'Vào nhóm → Học → Góp → Cãi.');
  K('3.3', 'Một thành viên dám chất vấn cách làm hiện tại của nhóm. Đó là tầng an toàn tâm lý nào?', 'Challenger safety',
    ['Contributor safety', 'Learner safety', 'Inclusion safety'],
    'Challenger safety là tầng cao nhất: dám chất vấn cách làm hoặc quyết định hiện tại.');
  K('3.3', 'Một thành viên dám hỏi khi chưa hiểu và không sợ mắc lỗi. Đó là tầng nào?', 'Learner safety',
    ['Inclusion safety', 'Contributor safety', 'Challenger safety'],
    'Learner safety: dám hỏi, học và mắc lỗi. Contributor safety: dám dùng kỹ năng đóng góp ý tưởng.');
  K('3.3', 'Hành động nào giúp TẠO an toàn tâm lý?', 'Không đổ lỗi; hỏi “lần sau chúng ta cải thiện thế nào?”',
    ['Chỉ để người giỏi nhất phát biểu', 'Phê bình công khai người mắc lỗi để cả nhóm rút kinh nghiệm', 'Mặc định tin nhắn khó hiểu là có ý xấu'],
    'Cách tạo an toàn tâm lý: lắng nghe chủ động; không đổ lỗi; cho mọi người tham gia quyết định; mời người ít nói; cởi mở với phản hồi; dám nói “tôi chưa biết”; làm rõ thay vì mặc định ý xấu.');

  // ---------- M4 Lãnh đạo, EI ----------
  K('4.1', 'Thách thức lớn nhất của người quản lý mới là gì?', 'Chuyển từ tự làm tốt sang giúp người khác làm tốt',
    ['Học thêm chuyên môn kỹ thuật', 'Làm thay phần việc khó của nhân viên', 'Chỉ cần quản lý cấp dưới trực tiếp'],
    'Người quản lý mới thường giỏi chuyên môn nhưng phải chuyển sang giúp người khác làm tốt; họ quản lý cả sếp, đồng nghiệp, người ảnh hưởng và bên liên quan.');
  K('4.3', '“Lãnh đạo chỉ đặt định hướng lớn, team tự điều hành hằng ngày” là mô hình nào?', 'Self-managing team',
    ['Manager-led team', 'Cross-functional team', 'Virtual team'],
    'Manager-led: lãnh đạo đặt mục tiêu và hoạt động (rõ nhưng hạn chế tự chủ). Self-managing: lãnh đạo đặt định hướng lớn, team tự điều hành (tăng sở hữu và động lực).');
  K('4.3', 'Virtual team cần đặc biệt chú trọng điều gì?', 'Giao tiếp, phối hợp và xây dựng niềm tin mạnh hơn',
    ['Tích hợp nhiều chuyên môn khác nhau', 'Để lãnh đạo đặt toàn bộ mục tiêu và hoạt động', 'Giảm số lần trao đổi để tránh phiền'],
    'Virtual team: cần giao tiếp, phối hợp và niềm tin mạnh hơn. “Tích hợp nhiều chuyên môn” là đặc điểm của cross-functional team.');
  K('4.3', 'Theo bài, phong cách lãnh đạo nào là tốt nhất?', 'Không có phong cách tốt cho mọi tình huống — phải điều chỉnh theo team',
    ['Luôn độc đoán, vì lãnh đạo quyết định nhanh thì team hiệu quả hơn', 'Luôn trao toàn quyền cho team để tăng tối đa sở hữu và động lực', 'Luôn dùng manager-led vì mục tiêu và hoạt động được giao rõ ràng'],
    'Lãnh đạo hiệu quả điều chỉnh theo nhiệm vụ, năng lực, độ trưởng thành và nhu cầu của team.');
  K('4.4', 'Self-awareness trong emotional intelligence là gì?', 'Nhận biết cảm xúc của chính mình',
    ['Kiểm soát phản ứng của bản thân', 'Hiểu cảm xúc của người khác', 'Duy trì động lực'],
    'Self-awareness = nhận biết; self-management = kiểm soát phản ứng; self-motivation = duy trì động lực; social awareness / empathy = hiểu cảm xúc người khác.',
    'EI bắt đầu từ NHẬN BIẾT cảm xúc của chính mình.');
  K('4.4', '“Hiểu được cảm xúc của người khác” là thành phần nào của EI?', 'Social awareness / empathy',
    ['Self-awareness', 'Self-management', 'Self-motivation'],
    'Social awareness / empathy hướng ra người khác; ba thành phần “self-” hướng vào bản thân.');
  K('4.4', 'Biểu hiện nào cho thấy EI thấp?', 'Chậm deadline, nỗ lực thấp, rút khỏi nhóm',
    ['Dùng I-statement khi bực bội', 'Tạm dừng rồi nói lại khi đã bình tĩnh', 'Xem vấn đề như thử thách có thể xử lý'],
    'EI thấp thường biểu hiện: chậm deadline, nỗ lực thấp, chất lượng kém, rút khỏi nhóm, suy giảm tinh thần. Ba phương án còn lại là cách thể hiện cảm xúc tốt (§4.5).');
  K('4.5', 'Câu nào là I-statement đúng cách?', 'Tôi thấy lo khi bản nháp nộp trễ vì nhóm khó kịp deadline. Mình chốt hạn sớm hơn được không?',
    ['Bạn lúc nào cũng nộp trễ, lần này cả nhóm lại phải ngồi chờ bạn nữa rồi.', 'Bạn làm cả nhóm thất bại rồi, mình không muốn làm chung với bạn nữa.', 'Sao bạn vô trách nhiệm vậy? Lần sau bạn phải nộp đúng hạn cho mình.'],
    'I-statement nói về cảm xúc của mình và ảnh hưởng của hành vi, thay vì công kích bằng “you”.',
    'Mẫu: Tôi cảm thấy … khi … vì … Tôi mong …');
  K('4.5', 'Mẫu I-statement đúng thứ tự là gì?', '“Tôi cảm thấy … khi … vì … Tôi mong chúng ta có thể …”',
    ['“Khi … tôi mong … vì … tôi cảm thấy …”', '“Bạn đã … nên tôi cảm thấy … Bạn phải …”', '“Tôi mong … vì … khi … tôi cảm thấy …”'],
    'Thứ tự: cảm xúc → hành vi (khi) → ảnh hưởng (vì) → mong muốn.');

  // ---------- M5 Họp, Dewey, xung đột, phản hồi ----------
  K('5.1', 'Trước cuộc họp, nên giao những vai trò nào?', 'Facilitator, timekeeper, note-taker, presenter',
    ['Leader, sponsor, auditor, guest', 'Chair, critic, devil’s advocate, observer', 'Manager, client, reviewer, secretary'],
    'Bốn vai trò cần giao trước họp: facilitator / leader, timekeeper, note-taker, presenter.');
  K('5.1', 'Người ghi lại biên bản (minutes) của cuộc họp đảm nhận vai trò nào?', 'Note-taker',
    ['Facilitator', 'Timekeeper', 'Presenter'],
    'Note-taker ghi biên bản; timekeeper quản lý thời gian; facilitator điều phối; presenter trình bày nội dung.');
  K('5.1', 'Mục tiêu họp nào được viết đúng cách?', 'Chốt 3 nhiệm vụ và người phụ trách cho tuần tới',
    ['Bàn về dự án và các vấn đề liên quan của nhóm', 'Gặp nhau trao đổi tình hình chung của mọi người', 'Cập nhật chung các việc đang làm trong tuần này'],
    'Trước họp phải xác định KẾT QUẢ cần đạt, không dùng mục tiêu mơ hồ như “bàn về dự án”.');
  K('5.1', 'Mỗi action item sau cuộc họp phải có đủ những gì?', 'Who – What – When',
    ['Why – Where – How', 'Who – Why – Where', 'What – How – Cost'],
    'Action item = ai làm (Who), làm gì (What), hạn khi nào (When). Sau đó chia sẻ minutes và theo dõi deadline.',
    'Action item hỏi 3 câu: Ai? Việc gì? Khi nào?');
  K('5.1', 'Agenda nên được gửi khi nào?', 'Trước cuộc họp, kèm tài liệu',
    ['Đầu buổi họp', 'Sau buổi họp, cùng minutes', 'Không cần gửi, chỉ cần nói miệng'],
    'Trước họp: xác định kết quả, mời đúng người, giao vai trò, gửi agenda và tài liệu trước, chọn không gian / kênh phù hợp.');
  K('5.1', 'Việc nào thuộc giai đoạn SAU cuộc họp?', 'Chia sẻ minutes và theo dõi deadline',
    ['Giao vai trò timekeeper', 'Gửi agenda cho người tham dự', 'Nhắc lại mục tiêu và agenda'],
    'Kết thúc và theo dõi: ghi quyết định, action item có Who – What – When, chia sẻ minutes, theo dõi deadline.');
  K('5.2', 'Quy trình giải quyết vấn đề 7 bước của Dewey theo đúng thứ tự là gì?', 'Define → Analyze → Establish criteria → Generate → Evaluate → Implement → Follow up',
    ['Define → Generate → Analyze → Establish criteria → Evaluate → Implement → Follow up', 'Analyze → Define → Establish criteria → Generate → Evaluate → Implement → Follow up', 'Define → Analyze → Generate → Establish criteria → Evaluate → Implement → Follow up'],
    'Xác định vấn đề → phân tích → đặt tiêu chí → tạo phương án → đánh giá → thực hiện → theo dõi.',
    'Tiêu chí (criteria) đặt TRƯỚC khi nghĩ giải pháp; chưa hiểu vấn đề thì chưa nghĩ giải pháp.');
  K('5.2', 'Theo Dewey, tiêu chí của một giải pháp tốt nên được xác định khi nào?', 'Trước khi tạo và đánh giá các phương án',
    ['Sau khi đã chọn phương án', 'Trong bước Follow up', 'Không cần, chỉ cần cả nhóm thích'],
    'Nguyên tắc: tiêu chí nên được thống nhất trước khi đánh giá ý tưởng (bước 3 Establish criteria, trước Generate và Evaluate).');
  K('5.2', '“Tạo nhiều phương án, chưa đánh giá vội” là bước nào của Dewey?', 'Generate solutions',
    ['Evaluate', 'Analyze', 'Establish criteria'],
    'Generate: tạo nhiều phương án; Evaluate: so sánh theo tiêu chí, chi phí, rủi ro, khả thi. Tách tạo ý tưởng khỏi phê bình ý tưởng.');
  K('5.2', '“Đo kết quả, xác định điều hiệu quả và điều cần điều chỉnh” là bước nào?', 'Follow up',
    ['Evaluate', 'Implement', 'Analyze'],
    'Follow up là bước cuối: đo kết quả và điều chỉnh. Giải quyết vấn đề là chu kỳ liên tục.');
  K('5.3', 'Theo bài, xung đột (conflict) là gì?', 'Sự đấu tranh do nhận thức về mục tiêu hay nhu cầu đối lập, không tương thích',
    ['Dấu hiệu cho thấy quan hệ giữa các thành viên đã thất bại', 'Một cuộc cãi nhau bằng lời nói giữa hai thành viên trở lên', 'Việc một thành viên không tham gia họp và không báo trước'],
    'Xung đột là phổ biến và KHÔNG đồng nghĩa quan hệ thất bại; nó là sự đấu tranh thể chất hoặc tâm lý do nhận thức về mục tiêu, mong muốn, nhu cầu đối lập.');
  K('5.3', 'Avoidance (né tránh) trong xung đột có đặc điểm gì?', 'Cho thời gian bình tĩnh nhưng thường không giải quyết gốc vấn đề',
    ['Luôn là cách xử lý tốt nhất vì giúp tránh làm mất lòng nhau', 'Giải quyết dứt điểm gốc rễ vấn đề nhờ không ai phải tranh cãi', 'Là phản ứng chủ động, xây dựng và phù hợp với mọi nền văn hóa'],
    'Né tránh có thể giúp mọi người bình tĩnh nhưng thường không giải quyết gốc vấn đề; mức trực tiếp phù hợp còn tùy văn hóa.');
  K('5.4', 'Ngôn ngữ giúp giữ thể diện và uy tín cho đối phương trong xung đột gọi là gì?', 'Face-saving',
    ['Face-detracting', 'Avoidance', 'Blocking'],
    'Face-saving giữ thể diện → giúp giải quyết xung đột. Face-detracting công kích danh dự, năng lực → làm xung đột leo thang.');
  K('5.4', 'Khi giao tiếp trong xung đột, nên tập trung vào điều gì?', 'Vấn đề và hành vi, không phán xét tính cách',
    ['Tính cách của người kia, để họ hiểu vì sao mình bực', 'Xác định rõ ai đúng ai sai trước khi bàn giải pháp', 'Những lỗi trong quá khứ để tránh bị lặp lại lần sau'],
    'Giao tiếp trong xung đột: tập trung vào vấn đề và hành vi; dùng face-saving, I-statement, giọng bình tĩnh; dựa vào mục tiêu chung.');
  K('5.5', 'Phản hồi “goal-directed” nghĩa là gì?', 'Gắn với mục tiêu, deadline và tiêu chuẩn chung',
    ['Mô tả cụ thể hành vi và kết quả', 'Đúng thời điểm, đúng nơi, giữ phẩm giá', 'Tạo đối thoại và cùng thiết kế bước tiếp theo'],
    'Specific = mô tả cụ thể; Respectful = đúng lúc, đúng nơi, giữ phẩm giá; Goal-directed = gắn mục tiêu; Collaborative = đối thoại; Timely & necessary = kịp thời, cần thiết; Positive & encouraging = ghi nhận điều tốt.');
  K('5.5', 'Câu phản hồi nào đúng nguyên tắc nhất?', 'Khi slide nộp trễ 2 ngày, nhóm không kịp tập. Mình muốn nghe lý do — lần tới chốt hạn sớm hơn nhé?',
    ['Bạn làm slide tệ quá, lần sau nhớ làm cẩn thận hơn để cả nhóm khỏi bị ảnh hưởng.', 'Cố lên nhé, lần sau chắc chắn bạn sẽ làm tốt hơn! Mình tin bạn, đừng lo gì cả.', 'Cả nhóm đều thấy bạn lười, bạn nên tự xem lại mình trước buổi họp tuần sau đi.'],
    'Phản hồi tốt: mô tả hành vi cụ thể → ảnh hưởng tới mục tiêu → hỏi góc nhìn → cùng đề xuất giải pháp.',
    'Mẫu: Khi [hành vi] → ảnh hưởng [mục tiêu] → mình muốn hiểu góc nhìn của bạn → lần tới [giải pháp]?');
  K('5.5', 'Khi NHẬN phản hồi, nên làm gì?', 'Không ngắt lời, hỏi để làm rõ và cảm ơn người góp ý',
    ['Giải thích ngay vì sao mình đúng', 'Im lặng rồi bỏ qua', 'Chỉ ra lỗi của người góp ý'],
    'Khi nhận phản hồi: không ngắt lời; kiểm soát phản ứng phòng thủ; hỏi để làm rõ; tìm thông tin hữu ích; cảm ơn, dù chưa hoàn toàn đồng ý.');

  // ---------- M6 Giao tiếp bằng văn bản ----------
  K('6.1', 'Texting phù hợp với loại nội dung nào?', 'Ngắn, không chính thức, cần phản hồi nhanh',
    ['Nhạy cảm, như góp ý tiêu cực', 'Dài và phức tạp, như báo cáo', 'Chính thức, như thông báo chính sách'],
    'Texting không phù hợp với nội dung dài, phức tạp hoặc nhạy cảm.');
  K('6.1', 'Email công việc thường nên được phản hồi trong vòng bao lâu?', '24 giờ',
    ['1 giờ', '3 ngày', '1 tuần'],
    'Email chuyên nghiệp: phản hồi kịp thời, thường trong 24 giờ.',
    '24 giờ — trùng với hạn gửi thank-you email sau phỏng vấn.');
  K('6.1', 'Điều nào KHÔNG nên làm khi viết email chuyên nghiệp?', 'Viết ALL CAPS để nhấn mạnh',
    ['Nêu mục đích ngay từ sớm', 'Đặt subject ngắn, rõ, cụ thể', 'Có chữ ký và thông tin liên hệ'],
    'Không viết ALL CAPS (bị coi như la hét); chỉ Reply All khi tất cả thực sự cần biết.');
  K('6.1', 'Khi nào nên dùng Reply All?', 'Chỉ khi tất cả người nhận thực sự cần biết',
    ['Luôn luôn, để mọi người cùng nắm', 'Khi muốn trả lời nhanh hơn', 'Không bao giờ được dùng'],
    'Tôn trọng thời gian và băng thông của người khác: chỉ Reply All khi tất cả thực sự cần.');
  K('6.1', 'Nguyên tắc netiquette nào đúng?', 'Luôn giả định thông điệp có thể bị chuyển tiếp hoặc đọc công khai',
    ['Trên mạng không cần theo chuẩn mực ngoài đời', 'Tranh luận gay gắt (flame war) để làm rõ vấn đề', 'Chỉ ra lỗi của người khác thật công khai'],
    'Netiquette: nhớ phía bên kia là con người; theo chuẩn mực ngoài đời; kiểm soát flame war; tôn trọng quyền riêng tư; bao dung với lỗi của người khác.');
  K('6.2', 'Phần đầu (header) của một memo gồm những gì?', 'To – From – Date – Subject',
    ['Heading – Introduction – Body – Signature', 'Dear – Body – Sincerely – Signature', 'Subject – CC – BCC – Attachment'],
    'Memo: header To – From – Date – Subject; cấu trúc mục đích → thảo luận → kết luận.');
  K('6.2', 'Loại văn bản nào chủ yếu gửi RA NGOÀI tổ chức?', 'Business letter',
    ['Memo', 'Minutes', 'Team charter'],
    'Memo chủ yếu dùng nội bộ; business letter thường gửi ra ngoài và đại diện cho doanh nghiệp.',
    'Memo = trong nhà; Letter = ra ngoài.');
  K('6.2', 'Năm khu vực chính của business letter theo thứ tự là gì?', 'Heading → Introduction → Body → Conclusion / CTA → Signature',
    ['Introduction → Heading → Body → Signature → Conclusion / CTA', 'Heading → Body → Introduction → Conclusion / CTA → Signature', 'To → From → Date → Subject → Body'],
    'Business letter: Heading → Introduction → Body → Conclusion / call to action → Signature. “To – From – Date – Subject” là header của memo.');
  K('6.3', '“Có đủ who, what, when, where, how (và why khi cần)” là nguyên tắc viết nào?', 'Complete',
    ['Clear', 'Concise', 'Correct'],
    'Clear = rõ, logic; Concise = bỏ lặp; Complete = đủ thông tin; Correct = đúng ngữ pháp, số liệu; Courteous = lịch sự; Audience-focused = hợp người đọc.');
  K('6.3', '“Bỏ chỗ lặp và từ không cần thiết” là nguyên tắc viết nào?', 'Concise',
    ['Clear', 'Complete', 'Courteous'],
    'Concise = ngắn gọn, không thừa.',
    'Good writing = 5C + A: Clear, Concise, Complete, Correct, Courteous + Audience-focused.');
  K('6.3', 'Business writing thường ưu tiên điều gì?', 'Active voice, động từ mạnh, câu tương đối ngắn',
    ['Passive voice để trang trọng hơn', 'Câu dài, nhiều mệnh đề', 'Từ chuyên môn phức tạp để thể hiện năng lực'],
    'Ưu tiên từ cụ thể, động từ mạnh, active voice, câu tương đối ngắn, giọng tự tin nhưng không công kích.');
  K('6.4', 'Quy trình viết đúng thứ tự là gì?', 'Think → Research → Organize → Draft → Revise → Edit → Present',
    ['Think → Organize → Research → Draft → Edit → Revise → Present', 'Research → Think → Draft → Organize → Revise → Edit → Present', 'Think → Research → Draft → Organize → Edit → Revise → Present'],
    'Nghĩ → tìm hiểu → sắp xếp → viết nháp → sửa nội dung → sửa lỗi → trình bày.',
    'Revise (sửa nội dung) TRƯỚC Edit (sửa lỗi chữ).');
  K('6.5', 'Sửa ngữ pháp, dấu câu, từ ngữ và định dạng gọi là gì?', 'Editing',
    ['Revision', 'Paraphrase', 'Summary'],
    'Revision xem nội dung, tổ chức, độ rõ ở cấp độ lớn (làm trước). Editing sửa lỗi ngôn ngữ và định dạng (làm sau).');
  K('6.5', 'Phát biểu nào đúng về paraphrase và summary?', 'Paraphrase giữ độ dài tương đương, summary rút gọn — cả hai đều cần ghi nguồn',
    ['Paraphrase không cần ghi nguồn vì đã đổi sang từ ngữ của mình', 'Summary thường dài hơn bản gốc vì phải giải thích thêm ý chính', 'Paraphrase chỉ giữ ý chính, còn summary giữ nguyên độ dài bản gốc'],
    'Paraphrase: giữ ý, độ dài tương đương, từ / cấu trúc mới. Summary: chỉ ý chính, ngắn hơn. Dùng ý người khác thì luôn ghi nguồn.');

  // ---------- M7 Proposal ----------
  K('7.1', 'Solicited proposal là gì?', 'Đề xuất được yêu cầu qua RFP/RFQ/IFB, phải bám định dạng, tiêu chí, deadline',
    ['Đề xuất tự gửi, phải tự chứng minh nhu cầu và giá trị', 'Báo cáo tiến độ gửi cho nhà tài trợ', 'Thư giới thiệu bản thân gửi kèm CV'],
    'Solicited = được mời (RFP / RFQ / IFB). Unsolicited = tự đề xuất, linh hoạt hơn nhưng phải chứng minh nhu cầu, giá trị.',
    'Solicited = “được mời”; Unsolicited = “tự đến”.');
  K('7.1', 'Unsolicited proposal cần đặc biệt chú trọng điều gì?', 'Chứng minh rõ nhu cầu, giá trị và mức liên quan',
    ['Bám chặt mẫu của RFP', 'Bỏ qua phần chi phí', 'Nộp đúng deadline do bên mời thầu đặt'],
    'Không ai yêu cầu nên người đọc chưa thấy cần — proposal phải tự chứng minh nhu cầu và giá trị.');
  K('7.2', 'Phần nào của proposal tóm tắt toàn bộ đề xuất cho người đọc bận rộn?', 'Executive summary',
    ['Background', 'Conclusion', 'Market analysis'],
    '10 phần thường gặp: cover, executive summary, background, idea, market analysis, benefits, timeline, marketing plan, finance, conclusion.');
  K('7.2', 'Nội dung nào thường KHÔNG thuộc các phần của một business proposal?', 'Bảng chấm công hằng ngày của nhóm',
    ['Timeline với milestone và ngày cụ thể', 'Marketing / communication plan', 'Benefits ngắn hạn và dài hạn'],
    'Proposal: cover, executive summary, background, idea (5W1H), market analysis, benefits, timeline, marketing plan, finance, conclusion.');
  epl('7.3', 'Nhóm đưa số liệu khảo sát 200 sinh viên để chứng minh vấn đề có thật. Đây là yếu tố thuyết phục nào?', 'Logos',
    'Logos = logic, lý do, bằng chứng. Ethos = độ tin cậy, năng lực. Pathos = cảm xúc, đồng cảm.',
    'Logos ~ logic; Pathos ~ “pathetic”, cảm xúc; Ethos ~ “ethics”, uy tín.');
  epl('7.3', 'Nhóm kể câu chuyện cảm động về một em nhỏ không được đến trường. Đây là yếu tố nào?', 'Pathos',
    'Pathos chạm vào cảm xúc, nhưng không được dùng thay cho bằng chứng.');
  epl('7.3', 'Nhóm nêu 3 năm kinh nghiệm làm tình nguyện để người nghe tin vào năng lực của mình. Đây là yếu tố nào?', 'Ethos',
    'Ethos = độ tin cậy, năng lực, tư cách, thiện chí của người nói. Thuyết phục tốt cần cân bằng cả ethos, pathos, logos.');
  K('7.4', 'Thông tin nào đúng về dự án nhóm Creating Social Solutions?', '5–7 thành viên, chiếm 30%, 3 giai đoạn, liên hệ một UN SDG',
    ['3–5 thành viên, chiếm 30%, 2 giai đoạn, liên hệ một UN SDG', '5–7 thành viên, chiếm 40%, 3 giai đoạn, liên hệ một UN SDG', '5–7 thành viên, chiếm 30%, 4 giai đoạn, không cần SDG'],
    '3 giai đoạn: thành lập team & proposal → triển khai, theo dõi, đánh giá → báo cáo cuối kỳ & thuyết trình.');

  // ---------- M8 Report, survey ----------
  K('8.1', 'Báo cáo diễn giải dữ liệu và đưa ra khuyến nghị gọi là gì?', 'Analytical report',
    ['Informational report', 'Routine report', 'Lateral report'],
    'Informational report chỉ trình bày dữ kiện; analytical report diễn giải và khuyến nghị.',
    'Analytical = Analyze + khuyên.');
  K('8.2', 'Executive summary nằm ở phần nào của báo cáo chính thức?', 'Preliminary section',
    ['Body', 'Supplementary section', 'Appendices'],
    'Preliminary: title page, table of contents, list of illustrations, executive summary / abstract.');
  K('8.2', 'Glossary, appendices và reference list thuộc phần nào?', 'Supplementary section',
    ['Preliminary section', 'Body', 'Executive summary'],
    'Report = Preliminary (trước) → Body (chính) → Supplementary (bổ sung, cuối).',
    'Pre – Body – Supple: trước, giữa, sau.');
  K('8.2', 'Phần Body của báo cáo gồm những gì?', 'Introduction, methodology, findings, conclusions, recommendations',
    ['Title page, table of contents, executive summary', 'Glossary, appendices, reference list', 'Cover, title fly, list of illustrations'],
    'Body: introduction; methodology; findings, analysis và evaluation; conclusions; recommendations.');
  K('8.3', 'Cấu trúc 7 phần của progress report theo đúng thứ tự là gì?', 'Project information → Overview → Work completed → Progress & results → Challenges → Solutions → Next steps',
    ['Overview → Project information → Challenges → Work completed → Solutions → Progress & results → Next steps', 'Project information → Overview → Challenges → Solutions → Work completed → Progress & results → Next steps', 'Project information → Work completed → Overview → Progress & results → Solutions → Challenges → Next steps'],
    'Thông tin dự án → tổng quan → đã làm gì → kết quả → vướng gì → đã gỡ thế nào → bước tiếp theo.',
    'Đã làm → Kết quả → Vướng → Gỡ → Tiếp.');
  K('8.3', 'Điều nào cần TRÁNH khi viết progress report?', 'Che giấu vấn đề bằng sự lạc quan quá mức',
    ['Nêu rõ người phụ trách bước tiếp theo', 'Giải thích ý nghĩa của dữ liệu', 'Báo cáo thách thức và cách đã xử lý'],
    'Tránh: đưa dữ liệu thô không giải thích; che giấu vấn đề bằng lạc quan quá mức; không nêu rõ trách nhiệm, deadline, bước tiếp theo.');
  K('8.4', 'Câu hỏi khảo sát nào trung lập, không phải leading question?', 'Bạn đánh giá buổi workshop thế nào? (thang 1–5)',
    ['Bạn thấy buổi workshop tuyệt vời đến mức nào?', 'Bạn đồng ý rằng workshop rất hữu ích chứ?', 'Vì sao buổi workshop thành công như vậy?'],
    'Leading question gợi sẵn câu trả lời. Survey tốt: ngắn, từ đơn giản, trung lập, mỗi câu gắn với một mục tiêu dự án.');
  K('8.4', 'Pilot test trong khảo sát là gì?', 'Thử khảo sát với một nhóm nhỏ trước khi phát rộng',
    ['Phát khảo sát cho toàn bộ đối tượng ngay', 'Trình bày kết quả bằng bảng hoặc chart', 'Chỉ dùng toàn câu hỏi mở'],
    'Quy trình survey có bước pilot test với nhóm nhỏ để phát hiện câu hỏi khó hiểu trước khi thu thập thật.');
  K('8.5', 'Một báo cáo tốt phải “tự đứng vững” nghĩa là gì?', 'Người đọc hiểu được mà không cần tác giả giải thích thêm',
    ['Báo cáo phải dài trên 20 trang để thể hiện đủ công sức', 'Báo cáo không cần trích nguồn vì là ý kiến của cả nhóm', 'Báo cáo chỉ cần đúng định dạng mẫu của tổ chức là đạt'],
    'Checklist báo cáo tốt: hợp audience, format đúng chức năng, thông tin chính xác có chứng minh, thuật ngữ được định nghĩa, hình bảng có nhãn, khuyến nghị có bằng chứng, tự đứng vững.');

  // ---------- M9 Thuyết trình, phi ngôn ngữ, thuyết phục ----------
  K('9.1', 'Phát biểu nào ĐÚNG về giao tiếp phi ngôn ngữ?', 'Luôn xảy ra — kể cả im lặng cũng gửi thông điệp',
    ['Có ý nghĩa giống nhau ở mọi nền văn hóa', 'Chỉ đi qua một kênh tại một thời điểm', 'Không bao giờ mâu thuẫn với lời nói'],
    'Phi ngôn ngữ: luôn xảy ra; qua nhiều kênh cùng lúc; phụ thuộc văn hóa, bối cảnh; có thể lặp lại, bổ sung, mâu thuẫn hoặc thay thế lời nói.');
  K('9.1', 'Paralanguage gồm những yếu tố nào?', 'Tone, pitch, volume, speed của giọng nói',
    ['Quần áo, phụ kiện, vật dụng', 'Khoảng cách giữa người nói và người nghe', 'Cử chỉ tay và tư thế'],
    'Paralanguage = cách nói (giọng). Quần áo = artifacts; khoảng cách = space; cử chỉ = body movements.',
    'Para-language: “bên cạnh lời nói” — chính là giọng.');
  K('9.1', 'Quần áo, phụ kiện, vật dụng mang theo thuộc loại phi ngôn ngữ nào?', 'Artifacts',
    ['Physical characteristics / appearance', 'Environment', 'Paralanguage'],
    'Artifacts = đồ vật bên ngoài (quần áo, phụ kiện). Physical characteristics / appearance = đặc điểm cơ thể.');
  K('9.1', 'Đến phỏng vấn muộn 15 phút gửi thông điệp qua kênh phi ngôn ngữ nào?', 'Time',
    ['Space', 'Touch', 'Environment'],
    '8 loại phi ngôn ngữ: space, time, appearance, body movements, touch, paralanguage, artifacts, environment.',
    '8 loại: Không gian – Thời gian – Ngoại hình – Cử động – Đụng chạm – Giọng – Đồ vật – Môi trường.');
  K('9.2', 'Ba bước của một cử chỉ khi thuyết trình theo thứ tự là gì?', 'Anticipation → Implementation → Relaxation',
    ['Implementation → Anticipation → Relaxation', 'Relaxation → Anticipation → Implementation', 'Anticipation → Relaxation → Implementation'],
    'Chuẩn bị (anticipation) → thực hiện (implementation) → thả lỏng (relaxation).');
  K('9.3', 'Bốn tiêu chí của visual aid là gì?', 'Big – Clear – Simple – Consistent',
    ['Bright – Colorful – Short – Creative', 'Big – Complex – Smart – Colorful', 'Brief – Clear – Stylish – Creative'],
    'Big: hàng ghế cuối đọc được; Clear: hiểu ngay; Simple: đơn giản hóa; Consistent: nhất quán phong cách. Một ý chính mỗi slide.');
  K('9.4', '“Chỉ còn 10 suất ưu đãi trong hôm nay!” dùng nguyên tắc ảnh hưởng nào?', 'Scarcity',
    ['Reciprocity', 'Authority', 'Liking'],
    'Scarcity = khan hiếm: thứ càng ít càng muốn có.',
    '6 nguyên tắc: Reciprocity, Scarcity, Authority, Commitment & consistency, Consensus / social proof, Liking.');
  K('9.4', '“Hơn 2.000 sinh viên đã đăng ký khóa học này” dùng nguyên tắc nào?', 'Consensus / social proof',
    ['Authority', 'Scarcity', 'Commitment and consistency'],
    'Social proof: người ta làm theo số đông.');
  K('9.4', 'Tặng một món quà nhỏ trước khi mời người khác đăng ký là nguyên tắc nào?', 'Reciprocity',
    ['Liking', 'Scarcity', 'Consensus / social proof'],
    'Reciprocity = có qua có lại: nhận trước thì muốn đáp lại.');
  K('9.4', '“Được các bác sĩ khuyên dùng” là nguyên tắc ảnh hưởng nào?', 'Authority',
    ['Liking', 'Consensus / social proof', 'Reciprocity'],
    'Authority = dựa vào chuyên gia, người có thẩm quyền.');
  K('9.5', 'Hành vi nào VI PHẠM đạo đức trong thuyết phục?', 'Biến vấn đề phức tạp thành lựa chọn trắng–đen giả tạo',
    ['Trích dẫn nguồn đáng tin cậy', 'Nói rõ tổ chức mà mình đại diện', 'Nói rõ khi kết luận chỉ là khả năng'],
    'Không: bịa hoặc bóp méo bằng chứng; suy luận phi logic; tự nhận chuyên gia; che giấu mục đích; dùng cảm xúc không có lý lẽ; tạo lựa chọn trắng–đen giả; giả vờ chắc chắn; kêu gọi điều mình không tin.');
  K('9.6', 'Elevator pitch dài khoảng bao lâu và kết thúc bằng gì?', '30–60 giây, kết bằng một call to action cụ thể',
    ['30–60 giây, kết bằng lời cảm ơn chung chung', '3–5 phút, kết bằng câu hỏi về mức lương', '10–15 giây, kết bằng tên của bạn'],
    'Elevator pitch: hook & bạn là ai → giá trị → audience → lợi ích & khác biệt → call to action.');

  // ---------- M10 Nghề nghiệp, CV, phỏng vấn ----------
  K('10.1', '“Hành trình dài hạn gồm nhiều công việc, hướng đến học hỏi và phát triển” là định nghĩa của gì?', 'Career',
    ['Job', 'Internship', 'Major'],
    'Job: ngắn hạn, tập trung thu nhập. Career: dài hạn, học hỏi và phát triển. Career path: chuỗi vai trò theo thời gian.');
  K('10.1', 'Các giai đoạn phát triển nghề nghiệp theo thứ tự là gì?', 'Growth → Exploration → Establishing → Maintaining / Reinventing',
    ['Exploration → Growth → Establishing → Maintaining / Reinventing', 'Growth → Establishing → Exploration → Maintaining / Reinventing', 'Exploration → Establishing → Growth → Maintaining / Reinventing'],
    'Lớn lên (growth) → khám phá (exploration) → xác lập (establishing) → duy trì / làm mới (maintaining / reinventing).');
  K('10.2', 'Chu kỳ phát triển nghề nghiệp gồm những bước nào?', 'Set goals → Take actions → Review progress → Adjust',
    ['Take actions → Set goals → Adjust → Review progress', 'Review progress → Set goals → Take actions → Adjust', 'Set goals → Review progress → Take actions → Adjust'],
    'Đặt mục tiêu → hành động → đánh giá tiến độ → điều chỉnh, rồi lặp lại.');
  K('10.2', 'Kỹ năng nào là soft / transferable skill?', 'Quản lý thời gian',
    ['Lập trình Python', 'Kế toán', 'Thiết kế mạch điện'],
    'Hard skills: kỹ thuật, chuyên môn. Soft / transferable: giao tiếp, teamwork, giải quyết vấn đề, quản lý thời gian, lãnh đạo…');
  K('10.3', 'Thông tin nào KHÔNG nên đưa vào résumé?', 'Kỳ vọng lương',
    ['Kinh nghiệm tình nguyện', 'Kỹ năng liên quan đến vị trí', 'Dự án và thành tích'],
    'Không nên đưa: tuổi, giới, chiều cao, cân nặng, số định danh, tôn giáo / chính trị không liên quan, ảnh, sức khỏe, kỳ vọng lương, đại từ ngôi thứ nhất.');
  K('10.3', 'Dạng résumé đưa thông tin MỚI NHẤT lên trước là gì?', 'Reverse chronological',
    ['Functional', 'Hybrid', 'Infographic'],
    'Reverse chronological = đảo ngược thời gian, mới nhất trước. Functional tập trung vào kỹ năng; hybrid kết hợp hai dạng.');
  K('10.4', 'Cover letter cần trả lời hai câu hỏi nào?', '“Why this job?” và “Why you?”',
    ['“What salary?” và “When can you start?”', '“Who are you?” và “Where do you live?”', '“What is your weakness?” và “Why did you leave?”'],
    'Cover letter (1 trang, đi kèm résumé): vì sao công việc / công ty này và vì sao bạn phù hợp.');
  K('10.5', 'STAR là viết tắt của gì?', 'Situation – Task – Action – Result',
    ['Skill – Task – Attitude – Result', 'Situation – Target – Action – Review', 'Strength – Task – Achievement – Reflection'],
    'STAR dùng trả lời câu hỏi về teamwork, vấn đề, thành tích, sai lầm, xung đột: bối cảnh → nhiệm vụ → hành động → kết quả.');
  K('10.5', 'Sau phỏng vấn, nên gửi thank-you email trong vòng bao lâu?', '24 giờ',
    ['1 giờ', '3 ngày', '1 tuần'],
    'Sau phỏng vấn: cảm ơn trực tiếp; gửi thank-you email trong 24 giờ; tự đánh giá điều tốt và điều cần cải thiện.');

  // ---------- M11 Report → thuyết trình ----------
  K('11.1', 'Khi chuyển báo cáo thành bài thuyết trình, nên chọn những gì?', 'Một core message và 3–4 ý hỗ trợ',
    ['Toàn bộ các mục của báo cáo', 'Một ý duy nhất, không cần ý hỗ trợ', '7–10 ý để thật đầy đủ'],
    '3–4 ý hỗ trợ gợi ý: problem, solution, results, recommendations.');
  K('11.1', 'Bảng số liệu chi tiết trong báo cáo nên xử lý thế nào khi thuyết trình?', 'Chuyển sang backup slides',
    ['Chép nguyên lên slide chính', 'Đọc to từng con số', 'Bỏ hẳn, không chuẩn bị'],
    'Dùng report làm nguồn, không đọc report như script; chỉ chọn dữ liệu quan trọng, bảng chi tiết đưa vào backup slides.');
})();
