import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
function rep(o, n) { if (!a.includes(o)) { miss.push(o.slice(0, 60)); return; } a = a.replace(o, () => n); }

// ---- tên bot + chọn bot ----
rep(`var BOT_NAMES = ['Trung', 'Việt', 'Lân', 'Khoa', 'Huy', 'Tuấn Anh', 'Anh Vỹ'];`, `var BOT_NAMES = ['Trung hắc hóa', 'Việt hắc hóa', 'Lân hắc hóa', 'Khoa hắc hóa', 'Huy hắc hóa', 'Tuấn Anh', 'Anh Vỹ'];`);
rep(`function duelAddBot() {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  if (s.players.filter(function(p) { return p.connected; }).length >= 8) return toast('Phòng đã đủ 8 người');
  var used = s.players.map(function(p) { return p.name; }), nm = BOT_NAMES.filter(function(n) { return used.indexOf(n + ' (máy)') < 0; })[0] || ('Máy ' + s.players.length);
  s.players.push({ av: { c: Math.floor(Math.random() * 8), i: Math.floor(Math.random() * 12) },`, `function duelAddBot(pick) {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  if (s.players.filter(function(p) { return p.connected; }).length >= 8) return toast('Phòng đã đủ 8 người');
  var used = s.players.map(function(p) { return p.name; }), nm = (pick && pick.name) || BOT_NAMES.filter(function(n) { return used.indexOf(n + ' (máy)') < 0; })[0] || ('Máy ' + s.players.length);
  if (used.indexOf(nm + ' (máy)') >= 0) return toast(nm + ' đã có trong phòng');
  var bav = (pick && pick.av) ? validAv(pick.av) : { c: Math.floor(Math.random() * 8), i: Math.floor(Math.random() * 12) };
  s.players.push({ av: bav,`);
rep(`bind('#dbot', 'click', duelAddBot);`, `bind('#dbot', 'click', duelBotPicker);`);
rep(`function duelRemoveBot(id) {`, `function duelBotPicker() {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  var used = s.players.map(function(p) { return p.name; });
  var info = { 'Tuấn Anh': 'Luôn ở mức Khó', 'Anh Vỹ': 'Mức Vừa, thỉnh thoảng cướp điểm của người khác' };
  var rows = BOT_NAMES.map(function(n, k) {
    var has = used.indexOf(n + ' (máy)') >= 0, lv = info[n] || ('Mức ' + BOT_LV[DU.botLv].t + ' (theo mục chọn mức độ)');
    return '<div class="bp-row"><span class="bp-av" data-bpav="' + k + '">' + avHtml({ av: { c: k % 8, i: k % 12 } }, 40) + '</span><div class="bp-n"><b>' + esc(n) + '</b><div class="small muted">' + esc(lv) + '</div></div>' +
      '<select class="sel bp-sel" data-bps="' + k + '" aria-label="Ảnh đại diện của ' + esc(n) + '"><option value="">Ảnh: tự động</option>' + AV_CHARS.map(function(x) { return '<option value="' + x.id + '">' + esc(x.n) + '</option>'; }).join('') + '</select>' +
      '<button type="button" class="btn sm primary" data-bpadd="' + k + '"' + (has ? ' disabled' : '') + '>' + (has ? 'Đã có' : 'Thêm') + '</button></div>';
  }).join('');
  modal('<h3 style="margin-top:0">Chọn đối thủ máy</h3><div class="bp-list">' + rows + '</div>', [{ t: 'Đóng', v: null, primary: true }]);
  var m = $('#modal');
  $$('[data-bps]', m).forEach(function(sel) { sel.onchange = function() { var k = +sel.dataset.bps, c = AV_CHARS.filter(function(x) { return x.id === sel.value; })[0]; $('[data-bpav="' + k + '"]', m).innerHTML = avHtml({ av: c ? { c: 0, i: 0, k: c.id } : { c: k % 8, i: k % 12 } }, 40); }; });
  $$('[data-bpadd]', m).forEach(function(b) { b.onclick = function() {
    var k = +b.dataset.bpadd, sel = $('[data-bps="' + k + '"]', m), av = sel.value ? { c: 0, i: 0, k: sel.value } : null;
    duelAddBot({ name: BOT_NAMES[k], av: av }); b.disabled = true; b.textContent = 'Đã có';
  }; });
}
function duelRemoveBot(id) {`);

// ---- avatar nhân vật + ảnh tuỳ chọn ----
rep(`function duelAv() { try { var v = JSON.parse(localStorage.getItem(KEY + '_av')); if (v && v.c >= 0 && v.i >= 0) return { c: v.c % 8, i: v.i % 12 }; } catch (e) {} return { c: 0, i: 0 }; }`,
`// Nhân vật: hiện huy hiệu emoji; nếu có file ảnh /avatars/<id>.jpg thì tự dùng ảnh đó
var AV_CHARS = [
  { id: 'messi', n: 'Messi', e: '⚽', c: '#4f9fd8' }, { id: 'ronaldo', n: 'Ronaldo', e: '🐐', c: '#c8102e' },
  { id: 'j97', n: 'J97', e: '🎤', c: '#7c3aed' }, { id: 'khabanh', n: 'Khá Bảnh', e: '😎', c: '#111827' },
  { id: 'huanhoahong', n: 'Huấn Hoa Hồng', e: '🌹', c: '#be123c' }, { id: 'truongcon', n: 'Trường Con', e: '🧒', c: '#ea580c' },
  { id: 'truonggiang', n: 'Trường Giang', e: '🎬', c: '#0891b2' }, { id: 'trump', n: 'Donald Trump', e: '🦅', c: '#b45309' },
  { id: 'putin', n: 'Putin', e: '🐻', c: '#475569' }
];
function avChar(id) { return AV_CHARS.filter(function(x) { return x.id === id; })[0] || null; }
function avUrlOk(u) { return typeof u === 'string' && u.length < 14000 && /^data:image\\/(jpeg|png|webp);base64,[A-Za-z0-9+\\/=]+$/.test(u); }
function duelAv() { try { var v = JSON.parse(localStorage.getItem(KEY + '_av')); if (v && v.u && avUrlOk(v.u)) return { c: 0, i: 0, u: v.u }; if (v && v.k && avChar(v.k)) return { c: 0, i: 0, k: v.k }; if (v && v.c >= 0 && v.i >= 0) return { c: v.c % 8, i: v.i % 12 }; } catch (e) {} return { c: 0, i: 0 }; }`);
rep(`function validAv(v) { return (v && v.c >= 0 && v.c < 8 && v.i >= 0 && v.i < 12) ? { c: v.c | 0, i: v.i | 0 } : { c: 0, i: 0 }; }`,
`function validAv(v) { if (v && v.u && avUrlOk(v.u)) return { c: 0, i: 0, u: v.u }; if (v && v.k && avChar(v.k)) return { c: 0, i: 0, k: v.k }; return (v && v.c >= 0 && v.c < 8 && v.i >= 0 && v.i < 12) ? { c: v.c | 0, i: v.i | 0 } : { c: 0, i: 0 }; }`);
rep(`function avHtml(p, size) { var v = (p && p.av) || { c: 0, i: 0 };`, `function avHtml(p, size) { var v = (p && p.av) || { c: 0, i: 0 };
  if (v.u && avUrlOk(v.u)) return '<span class="av av-k" style="width:' + size + 'px;height:' + size + 'px"><img src="' + v.u + '" alt=""></span>';
  var ch = v.k ? avChar(v.k) : null;
  if (ch) return '<span class="av av-k" style="--avc:' + ch.c + ';width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .5) + 'px" title="' + esc(ch.n) + '"><b>' + ch.e + '</b><img src="/avatars/' + ch.id + '.jpg" alt="" onerror="this.remove()"></span>';`);
// bộ chọn trong hồ sơ
rep(`'<div class="small muted" style="margin:14px 0 6px">Biểu tượng</div>`, `'<div class="small muted" style="margin:14px 0 6px">Nhân vật</div><div class="av-chars">' + AV_CHARS.map(function(x) { return '<button type="button" class="av-ch' + (myav.k === x.id ? ' on' : '') + '" data-avk="' + x.id + '" title="' + esc(x.n) + '">' + avHtml({ av: { c: 0, i: 0, k: x.id } }, 34) + '<span>' + esc(x.n) + '</span></button>'; }).join('') + '</div>' +
      '<div class="row" style="gap:8px;margin-top:10px"><label class="btn sm" style="cursor:pointer">Tải ảnh của bạn<input type="file" id="avfile" accept="image/*" hidden></label>' + (myav.u ? '<button type="button" class="btn sm ghost" id="avnofile">Bỏ ảnh</button>' : '') + '</div>' +
      '<div class="small muted" style="margin:14px 0 6px">Biểu tượng</div>`);
rep(`    bind('[data-avc]', 'click', function(e, b) { var v = duelAv(); v.c = +b.dataset.avc; duelSetAv(v); duelDraw(); });
    bind('[data-avi]', 'click', function(e, b) { var v = duelAv(); v.i = +b.dataset.avi; duelSetAv(v); duelDraw(); });`,
`    bind('[data-avc]', 'click', function(e, b) { var v = duelAv(); v = { c: +b.dataset.avc, i: v.i }; duelSetAv(v); duelDraw(); });
    bind('[data-avi]', 'click', function(e, b) { var v = duelAv(); v = { c: v.c, i: +b.dataset.avi }; duelSetAv(v); duelDraw(); });
    bind('[data-avk]', 'click', function(e, b) { duelSetAv({ c: 0, i: 0, k: b.dataset.avk }); duelDraw(); });
    bind('#avnofile', 'click', function() { duelSetAv({ c: 0, i: 0 }); duelDraw(); });
    var af = $('#avfile'); if (af) af.onchange = function() {
      var f = af.files && af.files[0]; if (!f) return; var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function() {
        var S = 72, cv = document.createElement('canvas'); cv.width = cv.height = S; var cx = cv.getContext('2d'), m = Math.min(img.width, img.height);
        cx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S); URL.revokeObjectURL(url);
        var d = cv.toDataURL('image/jpeg', .72); if (!avUrlOk(d)) return toast('Không xử lý được ảnh này'); duelSetAv({ c: 0, i: 0, u: d }); duelDraw();
      };
      img.onerror = function() { URL.revokeObjectURL(url); toast('Không đọc được file ảnh'); }; img.src = url;
    };`);
if (!miss.length) fs.writeFileSync(R + 'src/app.js', a);
else console.log('THIẾU', miss.join(' | '));
if (!miss.length) {
  fs.appendFileSync(R + 'src/style.css', `
/* Avatar nhân vật + chọn bot */
.av.av-k{position:relative;overflow:hidden;background:var(--avc,#334155);line-height:1}
.av.av-k b{font-weight:400;position:relative}
.av.av-k img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.av-chars{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.av-ch{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border:1px solid var(--line);background:var(--panel);border-radius:12px;cursor:pointer;color:var(--text);font:inherit}
.av-ch span{font-size:.72rem;line-height:1.2;text-align:center}
.av-ch:hover{background:var(--panel2)}.av-ch.on{border-color:var(--primary);background:var(--primary-soft)}
.bp-list{display:flex;flex-direction:column;gap:8px;min-width:min(520px,80vw)}
.bp-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
.bp-n{flex:1;min-width:0}.bp-n b{display:block}
.bp-sel{max-width:150px;font-size:.82rem;padding:6px 8px}
@media(max-width:560px){.bp-row{flex-wrap:wrap}.bp-sel{max-width:none;flex:1}}
`);
  console.log('ok');
}
