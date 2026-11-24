import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/app.js'; let a = fs.readFileSync(f, 'utf8'); const miss = [];
const rep = (o, n) => { if (!a.includes(o)) miss.push(o.slice(0, 70)); else a = a.replace(o, () => n); };
// thẻ mời trong phòng chờ của chủ phòng
rep(`      (isHost ? '<button class="btn primary big" id="dstart"`, `      (isHost && window.AI_SERVER ? '<div class="card row between"><div><b>Mời người đang online</b><div class="small muted">Gửi lời mời vào phòng cho người đang mở web (họ phải được cấp môn này).</div></div><button class="btn sm" id="dinv" type="button">Mời người online</button></div>' : '') +
      (isHost ? '<button class="btn primary big" id="dstart"`);
rep(`      bind('#dbot', 'click', duelBotPicker);`, `      bind('#dbot', 'click', duelBotPicker);
      bind('#dinv', 'click', duelInvitePicker);`);
rep(`function duelRemoveBot(id) {`, `// Mời người đang online vào phòng (chỉ chạy trên web có tài khoản)
function duelInvitePicker() {
  var s = DU.s; if (!s || DU.role !== 'host' || !window.AI_SERVER) return;
  DU.invited = DU.invited || {};
  modal('<h3 style="margin-top:0">Mời người đang online</h3><div class="bp-list" id="invL"><p class="muted small">Đang tải danh sách…</p></div><p class="small muted" style="margin-bottom:0">Người được mời sẽ thấy khung "Tham gia" ở bất kỳ trang nào của web. Lời mời hết hạn sau 2 phút.</p>', [{ t: 'Đóng', v: null, primary: true }]);
  var m = $('#modal');
  function draw(users) {
    var L = $('#invL', m); if (!L) return;
    users = users.filter(function(u) { return u.id !== duelMyUserId(); });
    if (!users.length) { L.innerHTML = '<p class="muted small">Hiện chưa có ai khác đang online.</p>'; return; }
    L.innerHTML = users.map(function(u) {
      var done = DU.invited[DU.code + ':' + u.id];
      return '<div class="bp-row"><span class="bp-av">' + avHtml({ av: { c: u.id % 8, i: u.id % 12 } }, 36) + '</span><div class="bp-n"><b>' + esc(u.name) + '</b>' + (u.role === 'admin' ? ' <span class="tag warn">QTV</span>' : '') + '</div><button type="button" class="btn sm primary" data-inv="' + u.id + '"' + (done ? ' disabled' : '') + '>' + (done ? 'Đã mời' : 'Mời') + '</button></div>';
    }).join('');
    $$('[data-inv]', L).forEach(function(b) { b.onclick = function() {
      var id = +b.dataset.inv; b.disabled = true; b.textContent = 'Đang gửi…';
      svApi('invite', { code: DU.code, to: [id] }).then(function(j) {
        if (j.error) { b.disabled = false; b.textContent = 'Mời'; return toast(j.error); }
        if (j.sent && j.sent.length) { DU.invited[DU.code + ':' + id] = 1; b.textContent = 'Đã mời'; toast('Đã gửi lời mời'); }
        else { b.disabled = false; b.textContent = 'Mời'; toast('Không mời được: ' + ((j.skipped && j.skipped[0] && j.skipped[0].why) || 'không rõ lý do')); }
      }).catch(function() { b.disabled = false; b.textContent = 'Mời'; toast('Lỗi mạng'); });
    }; });
  }
  fetch('/api/chat/online', { credentials: 'same-origin' }).then(function(r) { return r.json(); }).then(function(j) { DU.myUid = j.me; draw(j.users || []); }).catch(function() { var L = $('#invL', m); if (L) L.innerHTML = '<p class="muted small">Không tải được danh sách.</p>'; });
}
function duelMyUserId() { return DU.myUid || 0; }
function duelRemoveBot(id) {`);
// vào phòng bằng liên kết lời mời: #/duel?join=CODE
rep(`routes.duel=function(){
  content.innerHTML='';duelDraw();window.scrollTo(0,0);`, `routes.duel=function(_,qs){
  content.innerHTML='';duelDraw();window.scrollTo(0,0);
  if(qs&&qs.join&&window.AI_SERVER){var jc=String(qs.join).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);history.replaceState(null,'',location.pathname+location.search+'#/duel');
    var ci=$('#dcode');if(ci&&jc.length===6&&!DU.s&&!DU.busy){ci.value=jc;if(duelName()){DU.myName=duelName();duelJoin(jc);}else{toast('Nhập tên hiển thị rồi bấm Vào phòng');var nmI=$('#dname');if(nmI)nmI.focus();}}}`);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
fs.writeFileSync(f, a); console.log('ok');
