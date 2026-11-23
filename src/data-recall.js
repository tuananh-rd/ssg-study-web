// ===== CÂU HỎI LẠI LÝ THUYẾT (viết tay) — bổ sung cho câu sinh tự động từ bài học =====
// Chỉ hỏi lại đúng nội dung tài liệu (định nghĩa, thành phần, con số, thứ tự); không có câu tình huống.
// R(ref, câu hỏi, đáp án đúng, [3 đáp án sai], giải thích?)
DATA.recallManual=[];
(function(){
function R(ref,q,c,w,x){DATA.recallManual.push({ref:ref,q:q,correct:c,wrong:w,explain:x||''});}


// §2.1
R('2.1','Theo tài liệu, team là tập hợp người như thế nào?','Có kỹ năng bổ sung, cùng làm vì một mục tiêu cụ thể và cùng chịu trách nhiệm về kết quả',['Cùng phòng ban, mỗi người theo mục tiêu riêng','Chỉ trao đổi thông tin, không cần mục tiêu chung','Do một người quản lý chịu toàn bộ trách nhiệm']);
R('2.1','Team có bao nhiêu đặc trưng theo tài liệu?','Năm',['Ba','Bốn','Bảy']);
R('2.1','Ý nào KHÔNG thuộc năm đặc trưng của team?','Mỗi thành viên được đánh giá riêng',['Cùng chịu trách nhiệm cho mục tiêu chung','Có sự ổn định trong một khoảng thời gian','Hoạt động trong một bối cảnh xã hội / tổ chức']);
R('2.1','Đặc trưng nào của team liên quan đến thời gian?','Có sự ổn định trong một khoảng thời gian',['Lãnh đạo luân chuyển theo nhiệm vụ','Thành viên phụ thuộc lẫn nhau','Có quyền hạn và khả năng ra quyết định']);
// §2.2
R('2.2','Ý nào là lợi ích của team được nêu trong tài liệu?','Xử lý vấn đề phức tạp tốt hơn cá nhân',['Luôn hoàn thành nhanh hơn cá nhân','Không cần quản lý hỗ trợ','Tự động hiệu quả khi đủ người']);
R('2.2','Team giúp giảm những gì?','Sai sót, vắng mặt và tỷ lệ nghỉ việc',['Chi phí lương và thuế','Số cuộc họp và email','Nhu cầu đào tạo nhân viên']);
R('2.2','Theo tài liệu, kết quả của team phụ thuộc vào gì?','Thiết kế, quản lý, kỹ năng và quan hệ giữa các thành viên',['Chỉ số lượng thành viên','Chỉ năng lực của leader','Ngân sách dự án']);
R('2.2','Tài liệu cảnh báo điều gì về thông tin thành công của team?','Thành công thường được công bố nhiều hơn thất bại',['Thành công thường bị che giấu','Team luôn thành công hơn cá nhân','Thất bại của team không bao giờ được báo cáo']);
// §2.3
R('2.3','Kết quả chung lớn hơn tổng kết quả riêng lẻ được gọi là gì?','Synergy',['Cohesiveness','Groupthink','Interdependence']);
R('2.3','Trong team hoạt động tốt, vai trò lãnh đạo có đặc điểm gì?','Có thể luân chuyển theo nhiệm vụ',['Luôn cố định một người','Do giảng viên chỉ định','Thuộc về người giỏi chuyên môn nhất']);
R('2.3','Ý nào KHÔNG thuộc dấu hiệu team hoạt động tốt?','Mỗi người làm việc độc lập, ít trao đổi',['Giao tiếp rõ ràng','Có niềm tin','Thành viên khuyến khích nhau và thích thuộc về nhóm']);
// §2.4 bổ sung
R('2.4','Group cohesiveness thể hiện ở hai điều gì?','Sự hài lòng và mong muốn tiếp tục ở lại',['Số người và thời gian làm việc','Điểm số và năng suất','Quy tắc và kỷ luật']);
R('2.4','Groupthink làm giảm điều gì?','Tư duy phản biện',['Sự gắn kết','Số lượng thành viên','Thời gian họp']);
R('2.4','Cách nào được tài liệu nêu để phòng tránh groupthink?','Để người có ý kiến thiểu số được trình bày',['Biểu quyết nhanh để giữ đồng thuận','Để leader chốt kết luận sớm','Hạn chế yêu cầu bằng chứng']);
R('2.4','Ý nào KHÔNG thuộc cách phòng tránh groupthink?','Ưu tiên giữ hòa khí hơn tranh luận',['Chủ động mời phản biện','Tách giai đoạn tạo ý tưởng khỏi đánh giá','Yêu cầu bằng chứng']);
// §2.5
R('2.5','Ý nào là yếu tố làm giảm hiệu quả team?','Vai trò không rõ, phân công không công bằng',['Lãnh đạo luân chuyển theo nhiệm vụ','Giao tiếp rõ ràng','Có niềm tin']);
R('2.5','Ý nào KHÔNG thuộc các yếu tố làm giảm hiệu quả team?','Thành viên phụ thuộc tích cực vào nhau',['Thiếu động lực, thất vọng kéo dài','Thiếu nguồn lực và hỗ trợ quản lý','Quản lý kiểm soát quá mức, không trao quyền']);
R('2.5','Hành vi nào được tài liệu xếp vào yếu tố làm giảm hiệu quả?','Độc chiếm thảo luận hoặc né tránh trách nhiệm',['Chia sẻ ý tưởng dù chưa chắc được dùng','Đặt câu hỏi có chất lượng','Mời thành viên ít nói chia sẻ']);
// §2.6 / 2.7 bổ sung
R('2.6','Mỗi thành viên team cần bao nhiêu nhóm kỹ năng?','Bốn',['Ba','Năm','Sáu']);
R('2.7','Có bao nhiêu nhóm vai trò trong nhóm theo tài liệu?','Ba',['Hai','Bốn','Năm']);
R('2.7','Quá thiên về nhiệm vụ trong team dẫn đến điều gì?','Gây căng thẳng',['Làm chậm quyết định','Tạo groupthink','Tăng gắn kết']);
R('2.7','Quá thiên về đồng thuận trong team dẫn đến điều gì?','Có thể làm chậm quyết định',['Gây căng thẳng','Tăng tốc độ làm việc','Tăng xung đột']);

// §3.1
R('3.1','Team charter còn được gọi là gì?','Team contract',['Team report','Team agenda','Team proposal']);
R('3.1','Ý nào là nội dung của team charter?','Cách xử lý bất đồng, chậm tiến độ và vi phạm cam kết',['Điểm số từng thành viên','Kết quả khảo sát dự án','Ngân sách của nhà tài trợ']);
R('3.1','Ý nào KHÔNG thuộc nội dung team charter?','Kết quả cuối cùng của dự án',['Mục tiêu và sản phẩm cần bàn giao','Lịch họp và kênh giao tiếp','Cách ra quyết định']);
R('3.1','Thói quen nào được tài liệu khuyến khích khi khởi động dự án?','Thiết kế quy trình xử lý xung đột trước khi xung đột xảy ra',['Một người ôm toàn bộ công việc','Chỉ chia sẻ ý tưởng chắc chắn được dùng','Để mỗi người tự quyết deadline']);
R('3.1','Ý nào KHÔNG thuộc thói quen quan trọng khi làm việc nhóm?','Ôm toàn bộ công việc để kiểm soát chất lượng',['Luôn tham dự họp và giữ deadline','Tận dụng điểm mạnh của từng người','Lắng nghe, kiên nhẫn và đưa mọi người vào quyết định']);
// §3.2 bổ sung
R('3.2','Công thức Trust Equation là gì?','Trustworthiness = (Credibility + Reliability + Intimacy) / Self-orientation',['Trustworthiness = Credibility × Reliability × Intimacy','Trustworthiness = (Credibility + Intimacy) / Reliability','Trustworthiness = Credibility + Reliability − Self-orientation']);
R('3.2','Ý nào là cách xây dựng niềm tin theo tài liệu?','Chuẩn bị trước khi họp',['Giữ thông tin cho riêng mình','Hứa nhiều để tạo thiện cảm','Tránh đặt câu hỏi']);
R('3.2','Ý nào KHÔNG thuộc lợi ích của niềm tin cao?','Ít cần giao tiếp hơn',['Phản hồi cởi mở hơn','Chia sẻ kiến thức nhiều hơn','Phát hiện vấn đề sớm']);
R('3.2','Niềm tin cao giúp tăng ba điều gì?','Sáng tạo, tốc độ và chất lượng',['Lương, thưởng và chức vụ','Số lượng thành viên và cuộc họp','Quy tắc, kỷ luật và kiểm soát']);
// §3.3 bổ sung
R('3.3','Psychological safety là niềm tin của ai?','Niềm tin chung của cả team',['Niềm tin của leader vào thành viên','Niềm tin của một cá nhân vào người khác','Niềm tin của giảng viên vào nhóm']);
R('3.3','Psychological safety giúp thành viên dám làm gì mà không sợ bị chế giễu hay trừng phạt?','Nói ý kiến, hỏi, thừa nhận sai và phản biện',['Bỏ họp và trễ deadline','Tự quyết mọi việc không cần hỏi','Giữ bí mật thông tin dự án']);
R('3.3','Ý nào là cách tạo an toàn tâm lý?','Dám nói “tôi chưa biết”',['Tìm người chịu trách nhiệm khi có lỗi','Mặc định ý xấu trong tin nhắn ngắn','Chỉ cho người giỏi nhất phát biểu']);
R('3.3','Khi team mắc lỗi, tài liệu khuyên nên hỏi câu gì?','“Lần sau chúng ta cải thiện thế nào?”',['“Ai làm sai?”','“Tại sao bạn không làm đúng?”','“Ai chịu trách nhiệm việc này?”']);

// §4.1
R('4.1','Người quản lý mới phải chuyển từ điều gì sang điều gì?','Từ tự làm tốt sang giúp người khác làm tốt',['Từ giúp người khác sang tự làm','Từ lãnh đạo sang chuyên môn','Từ làm nhóm sang làm cá nhân']);
R('4.1','Ngoài cấp dưới, người quản lý mới còn phải quản lý ai?','Sếp, đồng nghiệp ngang cấp, người ảnh hưởng nội bộ và bên liên quan',['Chỉ khách hàng bên ngoài','Chỉ cấp trên trực tiếp','Đối thủ cạnh tranh']);
R('4.1','Ý nào là một cặp người lãnh đạo phải cân bằng?','Hỗ trợ và đối đầu mang tính xây dựng',['Lương và thưởng','Họp trực tiếp và họp online','Chuyên môn và ngoại ngữ']);
R('4.1','Ý nào KHÔNG thuộc những điều người lãnh đạo phải cân bằng?','Lợi ích của leader và lợi ích của khách hàng',['Mục tiêu cá nhân và mục tiêu tập thể','Hiệu suất hiện tại và học tập / phát triển','Quyền lực lãnh đạo và quyền tự chủ của team']);
R('4.1','Người lãnh đạo phải vừa bảo vệ team khỏi nhiễu bên ngoài, vừa làm gì?','Đưa thông tin / nguồn lực từ bên ngoài vào',['Cắt toàn bộ liên lạc bên ngoài','Giao toàn bộ quyết định cho cấp trên','Tự làm thay thành viên']);
// §4.2 bổ sung
R('4.2','Ý nào KHÔNG thuộc hành vi lãnh đạo cốt lõi?','Ra quyết định một mình để tiết kiệm thời gian',['Integrity','Năng lượng tích cực','Đặt câu hỏi mở']);
// §4.3 bổ sung
R('4.3','Tài liệu nêu bao nhiêu mô hình team?','Bốn: manager-led, self-managing, cross-functional, virtual',['Hai: manager-led và self-managing','Ba: manager-led, self-managing, virtual','Năm: thêm self-designing']);
R('4.3','Lãnh đạo hiệu quả điều chỉnh phong cách theo những yếu tố nào?','Nhiệm vụ, năng lực, độ trưởng thành và nhu cầu của team',['Tuổi, giới tính và quê quán','Lương, chức vụ và thâm niên','Số lượng thành viên và ngân sách']);
// §4.4 bổ sung
R('4.4','Ý nào là biểu hiện của EI thấp?','Rút khỏi nhóm',['Chủ động hỏi thăm đồng đội','Kiểm soát phản ứng tốt','Duy trì động lực']);
R('4.4','Ý nào KHÔNG thuộc biểu hiện của EI thấp?','Ứng phó tốt với căng thẳng',['Chậm deadline','Nỗ lực thấp, chất lượng kém','Suy giảm tinh thần']);
// §4.5
R('4.5','Mẫu I-statement trong tài liệu là gì?','“Tôi cảm thấy … khi … vì điều đó ảnh hưởng đến … Tôi mong chúng ta có thể …”',['“Bạn luôn … nên bạn phải …”','“Khi … xảy ra, ai chịu trách nhiệm …”','“Tôi nghĩ bạn sai vì … ”']);
R('4.5','Khi thể hiện cảm xúc, tài liệu khuyên dùng gì thay cho công kích bằng “you”?','I-statement',['Face-detracting','Avoidance','Leading question']);
R('4.5','Theo tài liệu, nên xem vấn đề như thế nào?','Như challenge có thể xử lý, không chỉ là threat',['Như threat cần né tránh','Như lỗi của người khác','Như việc không thể thay đổi']);
R('4.5','Nếu cuộc trao đổi căng thẳng, tài liệu khuyên gì?','Giữ giọng bình tĩnh; tạm dừng và nói lại khi cả hai sẵn sàng',['Nói to hơn để kết thúc nhanh','Gửi email phê bình ngay','Rời nhóm']);
R('4.5','“Tư duy lãnh đạo” khi thể hiện cảm xúc nghĩa là gì?','Cân nhắc ảnh hưởng của lời nói đến team',['Luôn nói điều mình nghĩ ngay lập tức','Chỉ leader mới được thể hiện cảm xúc','Che giấu mọi cảm xúc']);

// §5.1
R('5.1','Trước cuộc họp, cần giao những vai trò nào?','Facilitator/leader, timekeeper, note-taker, presenter',['Leader, sponsor, auditor, guest','Chair, critic, devil’s advocate, observer','Manager, client, reviewer, secretary']);
R('5.1','Ý nào là việc cần làm TRƯỚC cuộc họp?','Gửi agenda và tài liệu trước',['Chia sẻ minutes','Theo dõi deadline','Tóm tắt để tiến đến quyết định']);
R('5.1','Ý nào là việc cần làm TRONG cuộc họp?','Bắt đầu đúng giờ, nhắc mục tiêu và agenda',['Chọn không gian / kênh phù hợp','Chỉ mời người thực sự cần thiết','Chia sẻ minutes']);
R('5.1','Ý nào là việc thuộc giai đoạn KẾT THÚC và theo dõi?','Chia sẻ minutes / biên bản',['Giao vai trò trong họp','Xác định kết quả phải đạt','Gửi agenda']);
R('5.1','Ý nào KHÔNG thuộc nội dung agenda?','Biên bản cuộc họp trước đó',['Mục đích','Thời lượng từng mục','Người tham dự']);
R('5.1','Agenda cần chừa khoảng cuối để làm gì?','Chốt quyết định và hành động',['Giải lao','Giới thiệu thành viên','Đánh giá điểm cá nhân']);
R('5.1','Mỗi action item phải có ba yếu tố nào?','Who – What – When',['Why – Where – How','Who – Why – Where','What – How – Cost']);
R('5.1','Người điều phối họp nên làm gì với người nói quá nhiều?','Kiểm soát và khuyến khích mọi người tham gia',['Để họ nói hết','Kết thúc cuộc họp','Bỏ qua phần của họ trong biên bản']);
// §5.2 bổ sung
R('5.2','Ý nào là nguyên tắc giải quyết vấn đề theo tài liệu?','Tiêu chí nên được thống nhất trước khi đánh giá ý tưởng',['Chọn giải pháp ngay khi thấy vấn đề','Vừa tạo ý tưởng vừa phê bình','Vấn đề càng chung chung càng tốt']);
R('5.2','Giải quyết vấn đề được tài liệu mô tả là gì?','Một chu kỳ liên tục',['Việc làm một lần duy nhất','Nhiệm vụ riêng của leader','Bước cuối của dự án']);
// §5.3
R('5.3','Theo tài liệu, xung đột là gì?','Sự đấu tranh thể chất hoặc tâm lý do nhận thức về mục tiêu, mong muốn hay nhu cầu đối lập',['Dấu hiệu quan hệ đã thất bại','Việc hai người không nói chuyện với nhau','Hành vi blocking trong nhóm']);
R('5.3','Xung đột có đồng nghĩa với quan hệ thất bại không?','Không, xung đột là phổ biến',['Có, luôn luôn','Có, nếu kéo dài hơn một tuần','Chỉ khi có leader']);
R('5.3','Ý nào là nguồn xung đột thường gặp?','Nguồn lực khan hiếm',['Mục tiêu được mọi người thống nhất','Vai trò rõ ràng','Có team charter']);
R('5.3','Ý nào KHÔNG thuộc nguồn xung đột thường gặp?','Giao tiếp rõ ràng',['Mục tiêu không tương thích','Vai trò hoặc ưu tiên không rõ','Khác biệt giá trị, kỳ vọng, phong cách giao tiếp']);
R('5.3','Phản ứng với xung đột được chia theo hai cặp nào?','Chủ động – thụ động; xây dựng – phá hoại',['Đúng – sai; nhanh – chậm','Nội bộ – bên ngoài; trực tiếp – gián tiếp','Cá nhân – tập thể; cảm xúc – lý trí']);
R('5.3','Avoidance (né tránh) có tác dụng gì?','Cho thời gian bình tĩnh nhưng thường không giải quyết gốc vấn đề',['Luôn giải quyết triệt để','Không bao giờ có ích','Tăng niềm tin ngay lập tức']);
R('5.3','Mức độ trực tiếp phù hợp khi xử lý xung đột phụ thuộc vào gì?','Văn hóa',['Tuổi tác','Lương','Số thành viên']);
// §5.4
R('5.4','Khi giao tiếp trong xung đột nên tập trung vào điều gì?','Vấn đề và hành vi, không phán xét tính cách',['Tính cách của đối phương','Lỗi trong quá khứ','Người đúng người sai']);
R('5.4','Ngôn ngữ giữ thể diện và uy tín cho đối phương gọi là gì?','Face-saving',['Face-detracting','I-statement','Avoidance']);
R('5.4','Thông điệp công kích danh dự, năng lực hoặc tính chính trực gọi là gì?','Face-detracting',['Face-saving','Goal-directed','Constructive feedback']);
R('5.4','Ý nào là cách giao tiếp trong xung đột theo tài liệu?','Dựa vào mục tiêu chung để tìm giải pháp',['Nhắc lại lỗi cũ của đối phương','Để leader quyết thay','Né tránh đến khi tự hết']);
R('5.4','Ý nào KHÔNG thuộc cách giao tiếp trong xung đột?','Dùng “you” để chỉ ra lỗi',['Dùng I-statement, giọng bình tĩnh','Lắng nghe chủ động','Mời hai bên giải thích giới hạn và nhu cầu']);
// §5.5 bổ sung
R('5.5','Có bao nhiêu đặc điểm của phản hồi tốt theo tài liệu?','Sáu',['Bốn','Năm','Bảy']);
R('5.5','Mẫu phản hồi trong tài liệu bắt đầu bằng gì?','“Khi [hành vi cụ thể] xảy ra, nó ảnh hưởng đến [mục tiêu/kết quả]…”',['“Bạn luôn…”','“Tôi nghĩ bạn nên…”','“Theo quy định…”']);
R('5.5','Ý nào là việc nên làm khi NHẬN phản hồi?','Cảm ơn người góp ý, dù chưa hoàn toàn đồng ý',['Giải thích ngay lý do mình đúng','Ngắt lời để làm rõ','Phản hồi lại lỗi của người góp ý']);
R('5.5','Ý nào KHÔNG thuộc cách nhận phản hồi?','Ngắt lời để bảo vệ quan điểm',['Kiểm soát phản ứng phòng thủ','Hỏi để làm rõ','Tìm thông tin hữu ích']);

// §6.1
R('6.1','Texting KHÔNG phù hợp với loại nội dung nào?','Dài, phức tạp hoặc nhạy cảm',['Ngắn','Không chính thức','Cần phản hồi nhanh']);
R('6.1','Subject email cần như thế nào?','Ngắn, rõ, cụ thể',['Dài, đầy đủ mọi ý','Viết in hoa','Có thể bỏ trống']);
R('6.1','Email nên được phản hồi trong khoảng bao lâu?','Thường trong 24 giờ',['Trong 1 giờ','Trong 3 ngày','Trong 1 tuần']);
R('6.1','Với nội dung đơn giản, email thường không quá bao nhiêu đoạn?','Ba đoạn ngắn',['Một đoạn','Năm đoạn','Bảy đoạn']);
R('6.1','Ý nào là quy tắc email chuyên nghiệp?','Chỉ Reply All khi tất cả thực sự cần biết',['Viết ALL CAPS cho rõ','Dùng nhiều viết tắt cho nhanh','Không cần chữ ký']);
R('6.1','Tài liệu nêu bao nhiêu nguyên tắc netiquette?','Mười',['Năm','Bảy','Mười hai']);
R('6.1','Ý nào là nguyên tắc netiquette?','Nhớ rằng phía bên kia là con người',['Trả lời mọi tin nhắn ngay lập tức','Dùng emoji trong mọi tin nhắn','Luôn Reply All']);
R('6.1','Ý nào KHÔNG thuộc nguyên tắc netiquette?','Dùng quyền hạn để yêu cầu phản hồi nhanh',['Tôn trọng thời gian và băng thông','Kiểm soát “flame war”','Bao dung với lỗi của người khác']);
R('6.1','Khi viết trực tuyến, luôn giả định điều gì?','Thông điệp có thể bị chuyển tiếp hoặc đọc công khai',['Chỉ người nhận đọc được','Tin nhắn sẽ tự xoá','Không ai đọc kỹ']);
// §6.2
R('6.2','Memo chủ yếu dùng cho đối tượng nào?','Nội bộ',['Khách hàng bên ngoài','Nhà tuyển dụng','Đối tác nước ngoài']);
R('6.2','Header của memo gồm gì?','To – From – Date – Subject',['Heading – Introduction – Body','Dear – Body – Sincerely','Who – What – When']);
R('6.2','Cấu trúc nội dung memo là gì?','Mở đầu tuyên bố mục đích – thảo luận – kết luận / tóm tắt',['Lời chào – thân bài – chữ ký','Vấn đề – giải pháp – ngân sách','Bối cảnh – phương pháp – kết quả']);
R('6.2','“Direct format” trong memo nghĩa là gì?','Mục đích rõ ngay trong subject và câu đầu',['Gửi trực tiếp không qua email','Nêu mục đích ở cuối','Không cần subject']);
R('6.2','Giọng văn của memo cần như thế nào?','Khách quan, chính thức, ngắn và dễ quét',['Thân mật, dài, nhiều cảm xúc','Thuyết phục, nhiều hình ảnh','Hài hước, ngắn gọn']);
R('6.2','Business letter thường gửi cho ai?','Ra ngoài tổ chức',['Đồng nghiệp cùng phòng','Chỉ cấp trên','Chính mình']);
R('6.2','Business letter có bao nhiêu khu vực chính?','Năm',['Ba','Bốn','Sáu']);
R('6.2','Thứ tự năm khu vực chính của business letter?','Heading → Introduction → Body → Conclusion/CTA → Signature',['Introduction → Heading → Body → Signature → Conclusion','Heading → Body → Introduction → Conclusion → Signature','To → From → Date → Subject → Body']);
R('6.2','Business letter dùng để làm gì?','Thông tin, thuyết phục, trả lời yêu cầu hoặc ghi nhận quyết định',['Chỉ để mời họp','Chỉ để xin việc','Chỉ để báo giá']);
// §6.3 bổ sung
R('6.3','Phong cách viết phụ thuộc vào ba yếu tố nào?','Audience, purpose và context',['Font, cỡ chữ, màu','Độ dài, số trang, số đoạn','Người gửi, người nhận, ngày gửi']);
R('6.3','Bốn mức phong cách viết trong tài liệu là gì?','Colloquial, casual, informal, formal',['Short, medium, long, extended','Direct, indirect, passive, active','Personal, social, business, academic']);
R('6.3','Business writing thường ưu tiên điều gì?','Active voice, từ cụ thể, động từ mạnh, câu tương đối ngắn',['Passive voice, câu dài','Nhiều thuật ngữ khó','Giọng công kích để thuyết phục']);
// §6.4
R('6.4','Thứ tự quy trình viết trong tài liệu?','Think → Research → Organize → Draft → Revise → Edit → Present',['Think → Research → Organize → Draft → Edit → Revise → Present','Research → Think → Draft → Organize → Revise → Edit → Present','Think → Organize → Draft → Research → Revise → Edit → Publish']);
R('6.4','Bước cuối cùng của quy trình viết là gì?','Present',['Publish','Edit','Revise']);
R('6.4','Bước ngay sau Draft trong quy trình viết?','Revise',['Edit','Organize','Present']);
R('6.4','Bước ngay trước Draft trong quy trình viết?','Organize',['Research','Think','Revise']);
R('6.4','Ý nào là câu hỏi cần đặt TRƯỚC khi viết (Think)?','Người đọc là ai và đã biết gì?',['Nên dùng font gì?','Văn bản dài bao nhiêu trang?','Ai sẽ ký văn bản?']);
R('6.4','Khi nghiên cứu, nên dừng thu thập thông tin khi nào?','Khi thông tin bổ sung không còn tạo nhiều giá trị',['Khi có đủ 10 nguồn','Khi hết thời gian','Không bao giờ dừng']);
R('6.4','Ý nào KHÔNG thuộc các cách tổ chức nội dung trong tài liệu?','Theo thứ tự chữ cái',['Theo thời gian','Problem–solution','Compare–contrast']);
R('6.4','Lập luận cần ba thành phần nào?','Claim/thesis rõ và sớm; lý do và bằng chứng; xử lý counterargument và rủi ro',['Mở bài; thân bài; kết bài','Số liệu; hình ảnh; câu chuyện','Ethos; pathos; logos']);
// §6.5
R('6.5','Paraphrase là gì?','Giữ ý và độ dài tương đối tương đương bằng từ / cấu trúc mới',['Rút gọn các ý chính','Chép nguyên văn có ngoặc kép','Dịch sang ngôn ngữ khác']);
R('6.5','Summary là gì?','Rút gọn các ý chính',['Giữ nguyên độ dài, đổi từ','Chép nguyên văn','Bình luận về văn bản']);
R('6.5','Paraphrase và summary có cần ghi nguồn không?','Có, cả hai đều cần',['Không cần','Chỉ summary cần','Chỉ paraphrase cần']);
R('6.5','Revision xem xét điều gì?','Nội dung, tổ chức và độ rõ ở cấp độ lớn',['Ngữ pháp, dấu câu, định dạng','Chỉ chính tả','Chỉ font chữ']);
R('6.5','Editing sửa điều gì?','Ngữ pháp, dấu câu, từ và định dạng',['Nội dung và cấu trúc','Lập luận và bằng chứng','Mục tiêu văn bản']);

// §7.1 bổ sung
R('7.1','Business proposal là gì?','Đề nghị bằng văn bản nhằm giải quyết vấn đề / đáp ứng nhu cầu, thuyết phục đối tượng chấp nhận kế hoạch',['Báo cáo tiến độ dự án','Văn bản nội bộ thông báo chính sách','Thư cảm ơn sau phỏng vấn']);
R('7.1','Solicited proposal được yêu cầu qua những tài liệu nào?','RFP / RFQ / IFB',['Memo / Letter / Email','Agenda / Minutes','CV / Cover letter']);
R('7.1','Solicited proposal phải bám chặt điều gì?','Định dạng, tiêu chí và deadline',['Sở thích của người viết','Mẫu của dự án trước','Số trang tối đa 1']);
R('7.1','Unsolicited proposal phải chứng minh rõ điều gì?','Nhu cầu, giá trị và mức liên quan',['Định dạng theo RFP','Giá thấp nhất','Số người tham gia']);
// §7.2 bổ sung
R('7.2','Proposal chuyên nghiệp thường trình bày bằng định dạng nào?','PDF',['Word để người đọc sửa','Ảnh chụp','Slide PowerPoint']);
R('7.2','Ý nào là yêu cầu của proposal chuyên nghiệp?','Không phóng đại',['Càng dài càng tốt','Không cần trích nguồn','Tập trung vào cảm xúc']);
R('7.2','Phần “Timeline” của proposal cần có gì?','Milestone và ngày cụ thể',['Danh sách thành viên','Kết quả khảo sát','Lời cảm ơn']);
R('7.2','Phần “Benefits” trình bày lợi ích như thế nào?','Ngắn hạn và dài hạn',['Chỉ lợi ích tài chính','Chỉ lợi ích cho nhóm','Chỉ lợi ích trước mắt']);
// §7.3 bổ sung
R('7.3','Proposal / thuyết trình thuyết phục tốt cần gì về ethos, pathos, logos?','Cân bằng cả ba',['Chỉ cần logos','Ưu tiên pathos','Chỉ cần ethos']);
R('7.3','Pathos có được thay thế bằng chứng không?','Không',['Có','Có, nếu câu chuyện đủ cảm động','Có, khi thiếu số liệu']);
// §7.4
R('7.4','Tên dự án nhóm của môn là gì?','Student Project: Creating Social Solutions',['Social Impact Challenge','Community Startup Project','Green Campus Initiative']);
R('7.4','Quy mô gợi ý của nhóm dự án là bao nhiêu người?','5–7',['3–4','8–10','2–3']);
R('7.4','Tổng trọng số của dự án nhóm là bao nhiêu?','30%',['20%','25%','40%']);
R('7.4','Thứ tự ba giai đoạn của dự án?','Thành lập team & proposal → Triển khai, theo dõi, đánh giá → Báo cáo cuối kỳ & thuyết trình',['Triển khai → Proposal → Báo cáo','Proposal → Báo cáo → Triển khai','Báo cáo → Triển khai → Thuyết trình']);
R('7.4','Ý nào là loại dự án được gợi ý?','Sáng kiến công nghệ số',['Kinh doanh thu lợi nhuận','Nghiên cứu khoa học cơ bản','Sự kiện giải trí thương mại']);
R('7.4','Ý nào KHÔNG thuộc nội dung proposal của dự án?','Điểm số từng thành viên',['Problem statement và objectives','Implementation plan, roles và responsibilities','Budget và risk management']);
R('7.4','Dự án cần liên hệ với điều gì?','Một UN Sustainable Development Goal',['Một doanh nghiệp tài trợ','Một môn học khác','Một cuộc thi quốc tế']);

// §8.1
R('8.1','Report là gì theo tài liệu?','Tài liệu ghi nhận và truyền đạt thông tin cho một audience, mục tiêu hoặc chức năng cụ thể',['Đề nghị thuyết phục chấp nhận kế hoạch','Văn bản nội bộ ngắn','Thư gửi đối tác']);
R('8.1','Informational report khác analytical report thế nào?','Informational trình bày dữ kiện; analytical diễn giải và khuyến nghị',['Informational dài hơn','Analytical không có số liệu','Không khác nhau']);
R('8.1','Ý nào là cặp phân loại report trong tài liệu?','Vertical vs. lateral',['Solicited vs. unsolicited','Formal vs. colloquial','Paraphrase vs. summary']);
R('8.1','Ý nào KHÔNG thuộc các cặp phân loại report?','Hard vs. soft',['Short vs. long/formal','Routine vs. special','Internal vs. external']);
R('8.1','Ý nào là mục đích của report?','Ghi nhận tiến độ, vấn đề và bước tiếp theo',['Thuyết phục mua sản phẩm','Giới thiệu bản thân','Mời thầu']);
// §8.2
R('8.2','Thứ tự ba phần của báo cáo chính thức?','Preliminary → Body → Supplementary',['Body → Preliminary → Supplementary','Introduction → Body → Conclusion','Supplementary → Body → Preliminary']);
R('8.2','Executive summary / abstract thuộc phần nào?','Preliminary section',['Body','Supplementary section','Appendices']);
R('8.2','Methodology thuộc phần nào?','Body',['Preliminary section','Supplementary section','Title page']);
R('8.2','Recommendations thuộc phần nào?','Body',['Preliminary section','Supplementary section','Executive summary']);
R('8.2','Appendices và reference list thuộc phần nào?','Supplementary section',['Preliminary section','Body','Introduction']);
R('8.2','Ý nào thuộc preliminary section?','List of illustrations',['Findings','Glossary','Conclusions']);
// §8.3 bổ sung
R('8.3','Ý nào cần TRÁNH khi viết progress report?','Đưa dữ liệu thô mà không giải thích',['Nêu bước tiếp theo','Chỉ rõ trách nhiệm và deadline','Nêu vấn đề và cách xử lý']);
// §8.4 bổ sung
R('8.4','Ý nào là nguồn dữ liệu đánh giá dự án?','Biên bản họp',['Ý kiến cá nhân của leader','Tin đồn','Dự đoán chưa kiểm chứng']);
R('8.4','Loại câu hỏi khảo sát nào có trong tài liệu?','Likert scale',['True/False có bẫy','Câu hỏi dẫn dắt','Câu hỏi kép']);
R('8.4','Mỗi câu hỏi khảo sát phải liên kết với điều gì?','Một mục tiêu dự án',['Một thành viên nhóm','Một nhà tài trợ','Một trang báo cáo']);
R('8.4','Survey nên kết hợp những loại câu nào?','Câu đóng và một số câu mở',['Chỉ câu mở','Chỉ câu Yes/No','Chỉ thang Likert']);
// §8.5
R('8.5','Theo checklist, báo cáo tốt phải đạt điều gì?','Tự đứng vững mà không cần tác giả giải thích miệng',['Càng dài càng tốt','Không cần định nghĩa thuật ngữ','Hình, bảng không cần nhãn']);
R('8.5','Ý nào thuộc checklist báo cáo tốt?','Khuyến nghị hợp lý, có bằng chứng',['Kết quả dài, chi tiết tối đa','Dùng thuật ngữ không cần giải thích','Không cần tài liệu chứng minh']);
R('8.5','Hình, bảng và chart trong báo cáo cần gì?','Có nhãn, rõ và hỗ trợ nội dung',['Càng nhiều càng tốt','Không cần nhãn','Đặt hết ở phụ lục']);

// §9.1 bổ sung
R('9.1','Có bao nhiêu loại giao tiếp phi ngôn ngữ trong tài liệu?','Tám',['Năm','Sáu','Mười']);
R('9.1','Phi ngôn ngữ có thể có những quan hệ nào với lời nói?','Lặp lại, bổ sung, mâu thuẫn hoặc thay thế',['Chỉ lặp lại','Chỉ thay thế','Không liên quan']);
R('9.1','Phi ngôn ngữ phụ thuộc vào gì?','Văn hóa, bối cảnh và quan hệ',['Chỉ ngôn ngữ nói','Chỉ tuổi tác','Không phụ thuộc gì']);
R('9.1','Ý nào KHÔNG thuộc tám loại phi ngôn ngữ?','Written words',['Space','Time','Environment']);
// §9.2
R('9.2','Ba bước của một cử chỉ theo thứ tự?','Anticipation → Implementation → Relaxation',['Implementation → Anticipation → Relaxation','Relaxation → Anticipation → Implementation','Approach → Stroke → Return']);
R('9.2','Eye contact khi thuyết trình nên như thế nào?','Phân bổ tự nhiên giữa các khu vực của khán giả',['Chỉ nhìn giảng viên','Nhìn slide','Nhìn một điểm cố định']);
R('9.2','Ý nào là nguyên tắc delivery?','Dùng tư thế mở, di chuyển có chủ đích',['Đứng yên một chỗ','Đọc slide cho chính xác','Nói đều giọng để chuyên nghiệp']);
R('9.2','Ý nào KHÔNG nên làm khi trình bày?','Nhìn slide, bảng hoặc màn hình thay cho khán giả',['Biểu cảm phù hợp nội dung','Điều chỉnh tone, tốc độ, volume','Di chuyển có chủ đích']);
// §9.3
R('9.3','Bốn tiêu chí của visual aid?','Big – Clear – Simple – Consistent',['Bright – Colorful – Short – Detailed','Bold – Creative – Small – Varied','Brief – Complex – Static – Colorful']);
R('9.3','“Big” trong tiêu chí visual aid nghĩa là gì?','Hàng ghế cuối đọc được',['Slide càng nhiều càng tốt','Hình ảnh chiếm toàn màn hình','Chữ in hoa']);
R('9.3','“Consistent” trong tiêu chí visual aid nghĩa là gì?','Nhất quán phong cách',['Đơn giản hóa khái niệm','Hiểu ngay','Đủ to']);
R('9.3','Ý nào là lợi ích của visual aid?','Truyền thông tin phức tạp nhanh',['Thay thế người nói','Giảm thời gian chuẩn bị','Không cần tập dượt']);
R('9.3','Ý nào là thực hành tốt với visual aid?','Một ý chính mỗi slide',['Nhiều chữ để đủ thông tin','Dùng mọi hình ảnh đẹp','Chỉnh sửa slide khi đang nói']);
R('9.3','Ý nào KHÔNG thuộc thực hành tốt với visual aid?','Nhồi nhiều ý vào một slide',['Font đủ lớn và tương phản cao','Nói rõ liên hệ giữa lời nói và visual','Luôn có phương án dự phòng']);
// §9.4
R('9.4','Persuasion là gì?','Trình bày lập luận để thay đổi điều khán giả nghĩ, cảm nhận hoặc làm',['Ép khán giả đồng ý','Chỉ cung cấp thông tin trung lập','Kể chuyện giải trí']);
R('9.4','Có bao nhiêu chức năng của thuyết phục trong tài liệu?','Năm',['Ba','Bốn','Sáu']);
R('9.4','Ý nào là chức năng của thuyết phục?','Develop tolerance',['Entertain','Inform only','Summarize']);
R('9.4','Sáu nguyên tắc ảnh hưởng gồm những gì?','Reciprocity, Scarcity, Authority, Commitment & consistency, Consensus/social proof, Liking',['Reciprocity, Scarcity, Authority, Credibility, Intimacy, Liking','Ethos, Pathos, Logos, Authority, Liking, Scarcity','Reliability, Scarcity, Authority, Consistency, Empathy, Liking']);
R('9.4','Ý nào KHÔNG thuộc sáu nguyên tắc ảnh hưởng?','Reliability',['Reciprocity','Authority','Liking']);
R('9.4','Khi thuyết phục cần phân tích những gì về audience?','Nhu cầu, giá trị, mối quan tâm và phản đối',['Tuổi, giới tính, quê quán','Lương và chức vụ','Số lượng người nghe']);
R('9.4','Tài liệu gợi ý liên hệ những nhu cầu nào của audience?','An toàn, thuộc về, được công nhận và phát triển',['Ăn, ngủ, nghỉ, chơi','Tiền, quyền, danh, lợi','Học, làm, nghỉ, chơi']);
// §9.5
R('9.5','Ý nào là hành vi KHÔNG được làm trong thuyết phục?','Giả vờ chắc chắn khi chỉ có xác suất',['Trích nguồn bằng chứng','Nêu rõ tổ chức đại diện','Thừa nhận giới hạn dữ liệu']);
R('9.5','Ý nào vi phạm đạo đức thuyết phục?','Biến vấn đề phức tạp thành lựa chọn trắng–đen giả tạo',['Dùng số liệu có nguồn','Kể câu chuyện có thật','Trình bày nhiều góc nhìn']);
R('9.5','Dùng cảm xúc thế nào thì vi phạm đạo đức thuyết phục?','Dùng cảm xúc không có nền tảng lý lẽ',['Dùng cảm xúc kèm bằng chứng','Kể câu chuyện có thật','Thể hiện sự đồng cảm']);
R('9.5','Ý nào KHÔNG thuộc các điều cấm trong thuyết phục?','Kêu gọi hành động cụ thể',['Tự nhận là chuyên gia khi không phải','Che giấu mục đích hoặc tổ chức đại diện','Kêu gọi điều mình không tin']);
// §9.6
R('9.6','Elevator pitch dài khoảng bao lâu?','30–60 giây',['5–10 giây','2–3 phút','5 phút']);
R('9.6','Phần đầu tiên của elevator pitch?','Hook và bạn là ai',['Call to action','Lợi ích nổi bật','Audience / target']);
R('9.6','Phần cuối cùng của elevator pitch?','Yêu cầu / call to action cụ thể',['Hook và bạn là ai','Bạn cung cấp giá trị gì','Lợi ích và điểm khác biệt']);
R('9.6','Phần ngay sau “Bạn cung cấp giá trị gì” trong elevator pitch?','Audience / target là ai',['Lợi ích nổi bật và điểm khác biệt','Hook và bạn là ai','Call to action']);

// §10.1 bổ sung
R('10.1','Thứ tự các giai đoạn nghề nghiệp?','Growth → Exploration → Establishing → Maintaining/Reinventing',['Exploration → Growth → Establishing → Maintaining','Growth → Establishing → Exploration → Reinventing','Establishing → Growth → Exploration → Maintaining']);
R('10.1','Khám phá nghề nghiệp bao gồm cả điều gì?','Học điều mình không muốn',['Chỉ tìm việc lương cao','Chọn nghề theo bạn bè','Tránh thực tập']);
R('10.1','Ý nào là công cụ khám phá nghề nghiệp?','Informational interview',['Thi IQ','Mạng xã hội giải trí','Bói toán']);
R('10.1','Ý nào KHÔNG thuộc công cụ khám phá nghề nghiệp?','Thi lấy bằng lái xe',['Mentor','Job shadow','Internship']);
// §10.2
R('10.2','Khi chọn major, cần cân bằng những yếu tố nào?','Sở thích, năng lực, giá trị, tính cách/lối sống, yêu cầu chương trình, cơ hội việc làm',['Chỉ lương và cơ hội việc làm','Lựa chọn của bạn bè và gia đình','Độ khó và học phí']);
R('10.2','Hard skills là gì?','Kỹ thuật / chuyên môn',['Giao tiếp, teamwork','Quản lý thời gian','Lãnh đạo']);
R('10.2','Ý nào là soft / transferable skill?','Quản lý thời gian',['Lập trình Python','Kế toán','Thiết kế mạch điện']);
R('10.2','Thứ tự chu kỳ career development?','Set goals → Take actions → Review progress → Adjust',['Take actions → Set goals → Adjust → Review','Review progress → Set goals → Take actions → Adjust','Set goals → Review progress → Take actions → Adjust']);
R('10.2','Kỹ năng được xây dựng qua những hoạt động nào?','Môn học, dự án, CLB, tình nguyện, việc bán thời gian, internship, khóa học, chứng chỉ',['Chỉ qua môn học chính khóa','Chỉ qua công việc toàn thời gian','Chỉ qua chứng chỉ quốc tế']);
// §10.3
R('10.3','Résumé là gì theo tài liệu?','Tài liệu marketing bản thân',['Bản sao bảng điểm','Thư xin việc','Hợp đồng lao động']);
R('10.3','Các dạng résumé trong tài liệu?','Reverse chronological, functional, hybrid; video/infographic/website khi phù hợp',['Short, medium, long','Formal, informal, casual','Academic, business, creative']);
R('10.3','Résumé thường dài bao nhiêu?','1–2 trang; sinh viên ưu tiên một trang nếu đủ',['3–4 trang','Nửa trang','Không giới hạn']);
R('10.3','Thông tin trong résumé sắp xếp thế nào?','Mới nhất trước',['Cũ nhất trước','Theo chữ cái','Ngẫu nhiên']);
R('10.3','Ý nào là nguyên tắc viết résumé?','Dùng action verbs và keyword của vị trí',['Dùng đại từ ngôi thứ nhất','Dùng một bản cho mọi công việc','Ghi kỳ vọng lương']);
R('10.3','Ý nào KHÔNG nên đưa vào résumé?','Vấn đề sức khỏe',['Volunteer experience','Skills','Projects, internship, achievement']);
R('10.3','Ý nào KHÔNG nên đưa vào résumé?','Tuổi, giới, chiều cao, cân nặng',['Contact information','Education và training','Work experience']);
// §10.4 bổ sung
R('10.4','Cover letter dài bao nhiêu?','Một trang',['Hai trang','Nửa trang','Không giới hạn']);
R('10.4','Cover letter trả lời hai câu hỏi nào?','Vì sao công việc / công ty này? Vì sao bạn phù hợp?',['Lương bao nhiêu? Khi nào bắt đầu?','Bạn học trường nào? Bạn bao nhiêu tuổi?','Bạn có sở thích gì? Bạn ở đâu?']);
R('10.4','Ý nào cần TRÁNH khi viết cover letter?','Lặp lại résumé',['Liên hệ job description','Dùng STAR','Cảm ơn và đề nghị phỏng vấn']);
// §10.5
R('10.5','Các loại phỏng vấn trong tài liệu?','Phone/video, one-on-one, panel, group',['Written, oral, online, offline','Formal, informal, casual, technical','Short, long, single, double']);
R('10.5','STAR là viết tắt của gì?','Situation – Task – Action – Result',['Skill – Talent – Ability – Result','Situation – Target – Answer – Review','Strategy – Task – Achievement – Reward']);
R('10.5','STAR dùng cho loại câu hỏi nào?','Teamwork, vấn đề, thành tích, sai lầm và xung đột',['Câu hỏi về lương','Câu hỏi về sở thích cá nhân','Câu hỏi kỹ thuật thuần túy']);
R('10.5','Sau phỏng vấn nên gửi thank-you email khi nào?','Trong 24 giờ',['Sau 1 tuần','Khi có kết quả','Không cần gửi']);
R('10.5','Ý nào là việc nên làm TRONG phỏng vấn?','Nếu chưa rõ câu hỏi, xin làm rõ',['Dùng slang cho thân thiện','Ngắt lời để thể hiện nhiệt tình','Đoán ý câu hỏi rồi trả lời']);
R('10.5','Ý nào là việc nên làm TRƯỚC phỏng vấn?','Nghiên cứu công ty và vị trí',['Gửi thank-you email','Tự đánh giá điều cần cải thiện','Cảm ơn trực tiếp']);
// §10.6
R('10.6','Trang phục gợi ý cho Mini Career Fair?','Business casual hoặc theo yêu cầu',['Đồng phục thể thao','Trang phục dạ hội','Tùy thích']);
R('10.6','Elevator pitch chuẩn bị cho career fair dài bao lâu?','30–60 giây',['5 phút','10 giây','2–3 phút']);
R('10.6','Reflection sau career fair dài bao nhiêu từ?','150–200 hoặc 200–300 từ theo yêu cầu giảng viên',['50–100 từ','500–800 từ','1000 từ']);
R('10.6','Sau career fair nên chọn bao nhiêu mục tiêu cải thiện trong ba tháng?','2–3',['1','5–7','10']);
R('10.6','Ý nào là việc nên làm TRONG sự kiện career fair?','Cảm ơn trước khi rời đi',['Tổng hợp phản hồi về CV','Viết reflection','Chọn mục tiêu cải thiện']);
})();
