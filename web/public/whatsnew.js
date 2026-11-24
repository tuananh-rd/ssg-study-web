/* Thông báo cập nhật: tự hiện một lần cho mỗi người dùng khi vào web sau khi có bản cập nhật mới.
   Thêm bản cập nhật mới = thêm một mục LÊN ĐẦU danh sách CHANGELOG (id tăng dần theo ngày) rồi deploy. */
(function(){
if(window.WebWhatsNew)return;
var CHANGELOG=[
 {id:'2026-11-23-cpv-explanations',date:'23/11/2026',title:'Bổ sung lời giải và bản dịch CPV301',items:['Bổ sung lời giải tiếng Việt cho 30 câu vừa được đối chiếu lại đáp án, kèm lưu ý ở các câu có nguồn sai hoặc chưa rõ.','Dịch lại câu hỏi và phương án của 9 câu CPV301 để khớp đúng thứ tự và nội dung bộ đề; sửa thêm bản dịch câu Eigenfaces bị lệch.']},
 {id:'2026-11-26-cpv-merge',date:'26/11/2026',title:'Cập nhật bộ đề CPV301 sau khi đối chiếu thêm một nguồn',items:['Thêm câu "Condensation" còn thiếu (bộ đề CPV301 giờ có 297 câu).','Sửa hai bản lặp của câu "NOT an application of image alignment" cho cùng một đáp án; đổi đáp án câu Laplacian of Gaussian sang Canny.','Hai câu kernel tracking và edge linking trở về đáp án theo bộ đề gốc, kèm lưu ý trong lời giải về đáp án theo giáo trình.']},
 {id:'2026-11-25-music',date:'25/11/2026',title:'Nhạc học bài từ YouTube',items:['Có trình phát nhạc nhỏ ở góc dưới bên trái (cạnh biểu tượng chat): lofi radio, nhạc piano và các video "Study With Me" được chọn ngẫu nhiên.','Bấm Phát để nghe, nút ngẫu nhiên để đổi bài, kéo thanh để chỉnh âm lượng. Bấm dấu gạch để thu nhỏ thành biểu tượng nốt nhạc, dùng được cả trong chế độ Tập trung.']},
 {id:'2026-11-25-tag-invite',date:'25/11/2026',title:'Tag người dùng và mời vào phòng thi đấu',items:['Trong chat chung, gõ @ rồi chọn tên để tag một người. Người được tag thấy thông báo "nhắc đến bạn" ngay cả khi đã tắt thông báo chat.','Chủ phòng thi đấu bấm "Mời người online" trong phòng chờ để gửi lời mời. Người được mời thấy khung "Tham gia" ở bất kỳ trang nào và vào thẳng phòng (cần được cấp môn đó).']},
 {id:'2026-11-25-online',date:'25/11/2026',title:'Xem ai đang online',items:['Mở khung chat (biểu tượng góc dưới bên trái), bấm nút xanh "N online" để xem danh sách những người đang mở web.','Người được tính online khi đã mở web trong 45 giây gần nhất; quản trị viên hiện nhãn QTV.']},
 {id:'2026-11-24-cpv-fix',date:'24/11/2026',title:'Sửa lại đáp án bộ đề CPV301',items:['Đối chiếu lại toàn bộ bộ đề CPV301 với slide gốc: sửa đáp án sai ở khoảng 20 câu (chủ yếu các câu điền chỗ trống đầu bộ đề).','Những câu vừa sửa tạm chưa có lời giải soạn sẵn, sẽ được bổ sung sớm.']},
 {id:'2026-11-24-reload',date:'24/11/2026',admin:true,title:'Yêu cầu người dùng tải lại trang (quản trị viên)',items:['Ở trang Quản trị tài khoản: nút "Tải lại trang của họ" cho từng người và "Yêu cầu mọi người tải lại" cho tất cả.','Người dùng thấy thông báo đếm ngược 8 giây và có thể hoãn.']},
 {id:'2026-11-24-chat',date:'24/11/2026',title:'Chat chung của cả web',items:['Nhắn tin với mọi người ngay trong web: bấm biểu tượng chat ở góc dưới bên trái.','Tên quản trị viên có hiệu ứng ánh vàng và nhãn QTV, mỗi người dùng có một màu tên riêng.','Có tin mới thì biểu tượng hiện số tin chưa đọc kèm xem trước tin nhắn. Bấm chuông trong khung chat để tắt thông báo: vẫn đếm tin mới nhưng không hiện xem trước.']},
 {id:'2026-11-23-admin-log',date:'23/11/2026',admin:true,title:'Nhật ký hoạt động (dành cho quản trị viên)',items:['Menu tài khoản có mục Nhật ký hoạt động nếu bạn được cấp quyền xem.','Quyền này được cấp riêng cho từng quản trị viên ở trang Quản trị tài khoản.']},
 {id:'2026-11-23-theory',date:'23/11/2026',title:'Lý thuyết dễ đọc hơn',items:['Công thức toán hiển thị đúng như sách, hết lỗi font.','Giao diện bài học mới: đánh số tiêu đề, ô ghi chú, khối code có nút chép, thanh tiến độ đọc.']},
 {id:'2026-11-22-duel',date:'22/11/2026',title:'Thi đấu: avatar nhân vật và bot mới',items:['Thêm avatar nhân vật, và có thể tải ảnh của riêng bạn.','Khi thêm đối thủ máy, bạn chọn được từng bot (Trung, Việt, Lân, Khoa, Huy hắc hóa, Tuấn Anh, Anh Vỹ). Anh Vỹ hay cướp điểm, Tuấn Anh luôn ở mức khó.']},
 {id:'2026-11-22-focus',date:'22/11/2026',title:'Chế độ Tập trung và Tra cứu nhanh',items:['Nút Tập trung ở bài lý thuyết và khi làm bài: toàn màn hình, đồng hồ Pomodoro, nền hoa lá dịu mắt.','Nút Tra cứu mở khung tìm kiếm kiểu Google (Wikipedia, hình ảnh), bôi đen chữ rồi bấm Tra cứu cũng được.']}
];
var ME=null;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function visible(){return CHANGELOG.filter(function(c){return !c.admin||(ME&&ME.role==='admin');});}
function show(list,all){
  if(!list.length||document.getElementById('wn-ov'))return;
  var st=document.getElementById('wn-css');if(!st){st=document.createElement('style');st.id='wn-css';st.textContent='#wn-ov{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,14,24,.55);backdrop-filter:blur(5px)}#wn-box{width:min(520px,100%);max-height:min(80vh,640px);overflow:auto;background:var(--panel,#fff);color:var(--text,#111);border:1px solid var(--line,#ddd);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.4);padding:22px 24px;font-family:inherit}#wn-box h2{margin:0 0 4px;font-size:1.3rem}#wn-box .s{margin:0 0 14px;color:var(--muted,#667);font-size:.9rem}.wn-i{padding:12px 14px;border:1px solid var(--line,#ddd);border-radius:12px;background:var(--panel2,#f6f7fb);margin-bottom:10px}.wn-i b{display:block}.wn-i small{color:var(--muted,#667)}.wn-i ul{margin:8px 0 0;padding-left:1.15em}.wn-i li{margin:4px 0;line-height:1.5;font-size:.93rem}.wn-n{display:inline-block;font:800 .65rem/1 system-ui;letter-spacing:.05em;padding:3px 6px;border-radius:5px;background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));margin-right:6px;vertical-align:middle}#wn-ok{display:block;margin:14px 0 0 auto;border:0;border-radius:10px;padding:10px 22px;background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));font:700 .95rem system-ui,sans-serif;cursor:pointer}';document.head.appendChild(st);}
  var ov=document.createElement('div');ov.id='wn-ov';
  ov.innerHTML='<div id="wn-box" role="dialog" aria-modal="true" aria-labelledby="wn-t"><h2 id="wn-t">'+(all?'Các cập nhật gần đây':'Có cập nhật mới')+'</h2><p class="s">'+(all?'Những thay đổi mới nhất của web.':'Web vừa được nâng cấp từ lần bạn vào gần nhất.')+'</p>'+
   list.map(function(c,i){return '<div class="wn-i"><b>'+(i===0&&!all?'<span class="wn-n">MỚI</span>':'')+esc(c.title)+'</b><small>'+esc(c.date)+'</small><ul>'+c.items.map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul></div>';}).join('')+'<button id="wn-ok" type="button">Đã hiểu</button></div>';
  document.body.appendChild(ov);
  function close(){ov.remove();document.removeEventListener('keydown',kd,true);}
  function kd(e){if(e.key==='Escape'){e.stopPropagation();close();}}
  document.addEventListener('keydown',kd,true);
  ov.addEventListener('mousedown',function(e){if(e.target===ov)close();});
  var ok=document.getElementById('wn-ok');ok.onclick=close;ok.focus();
}
function check(){
  var v=visible();if(!v.length||!ME)return;var key='wn_seen_'+ME.id,seen=ls(key);
  if(seen===v[0].id)return;
  var list;
  if(seen===null)list=v.slice(0,1);                                   // tài khoản/thiết bị mới: chỉ báo bản mới nhất
  else{var k=v.map(function(c){return c.id;}).indexOf(seen);list=(k<0?v.slice(0,3):v.slice(0,k)).slice(0,4);}
  ls(key,v[0].id);show(list,false);
}
function start(){fetch('/api/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():null;}).then(function(j){if(!j||!j.user)return;ME=j.user;setTimeout(check,1200);}).catch(function(){});}
window.WebWhatsNew={start:start,open:function(){show(visible().slice(0,6),true);},latest:function(){return CHANGELOG[0].id;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
