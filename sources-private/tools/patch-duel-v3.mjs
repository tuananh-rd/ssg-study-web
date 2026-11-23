import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/src/';
let a = fs.readFileSync(W + 'app.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };
const rex = (n, re, y) => { if (!re.test(a)) { miss.push(n); return; } a = a.replace(re, () => y); };

// ---------- 1) hồ sơ, avatar, thống kê, trợ giúp, cảm xúc ----------
rep('helpers', 'function duelRoomsStart() {', String.raw`var AV_COLORS = ['#2f4bd1', '#0f9d77', '#d9480f', '#a61e82', '#c92a2a', '#0b7285', '#5f3dc4', '#e67700'];
var AV_ICONS = ['spark', 'bulb', 'book', 'pen', 'swords', 'trophy', 'globe', 'layers', 'clock', 'cards', 'chat', 'flag'];
function duelAv() { try { var v = JSON.parse(localStorage.getItem(KEY + '_av')); if (v && v.c >= 0 && v.i >= 0) return { c: v.c % 8, i: v.i % 12 }; } catch (e) {} return { c: 0, i: 0 }; }
function duelSetAv(v) { try { localStorage.setItem(KEY + '_av', JSON.stringify(v)); } catch (e) {} }
function validAv(v) { return (v && v.c >= 0 && v.c < 8 && v.i >= 0 && v.i < 12) ? { c: v.c | 0, i: v.i | 0 } : { c: 0, i: 0 }; }
function avHtml(p, size) { var v = (p && p.av) || { c: 0, i: 0 }; return '<span class="av" style="--avc:' + AV_COLORS[v.c % 8] + ';width:' + size + 'px;height:' + size + 'px">' + ic(AV_ICONS[v.i % 12]) + '</span>'; }
function duelStats() { var z = { games: 0, wins: 0, best: 0, right: 0, total: 0, hist: [] }; try { return Object.assign(z, JSON.parse(localStorage.getItem(KEY + '_dstat')) || {}); } catch (e) { return z; } }
function duelStatsAdd(rec) { var st = duelStats(); st.games++; if (rec.rank === 1 && rec.players > 1) st.wins++; st.best = Math.max(st.best, rec.score); st.right += rec.right; st.total += rec.total; st.hist.unshift(rec); st.hist = st.hist.slice(0, 6); try { localStorage.setItem(KEY + '_dstat', JSON.stringify(st)); } catch (e) {} }
var REACTS = ['Hay đấy', 'Nhanh thật', 'Tiếc quá', 'Cố lên'];
var POWERS = { x2: { t: 'Nhân đôi', d: 'Nếu đúng, điểm câu này nhân đôi' }, fifty: { t: 'Loại 2 đáp án', d: 'Bỏ 2 đáp án sai, nhưng điểm câu này giảm 30%' } };
function duelReact(pid, k) {
  var s = DU.s; if (!s || DU.role !== 'host' || !(k >= 0 && k < REACTS.length)) return;
  var p = s.players.find(function(x) { return x.id === pid; }); if (!p || Date.now() - (p.lastRx || 0) < 1500) return;
  p.lastRx = Date.now(); s.feed = (s.feed || []).concat([{ n: p.name, k: k, t: p.lastRx }]).slice(-4); duelPush();
}
function duelPower(pid, i, k) {
  var s = DU.s; if (!s || DU.role !== 'host' || s.phase !== 'q' || i !== s.i) return;
  var p = s.players.find(function(x) { return x.id === pid; }); if (!p || p.pick != null) return;
  p.pw = p.pw || { x2: 1, fifty: 1 };
  if (k === 'x2' && p.pw.x2 > 0 && p.x2 !== s.i) { p.pw.x2--; p.x2 = s.i; }
  else if (k === 'fifty' && p.pw.fifty > 0 && p.hideI !== s.i) {
    var id = s.ids[s.i], wrong = shuffle(s.opts[id].filter(function(o) { return o !== DU.correct[id]; }));
    if (wrong.length < 2) return;
    p.pw.fifty--; p.hide = wrong.slice(0, 2); p.hideI = s.i;
  } else return;
  duelPush();
}
function duelUsePower(k) { var s = DU.s; if (!s) return; if (DU.role === 'host') duelPower('host', s.i, k); else duelSend({ t: 'pow', i: s.i, k: k }); }
function duelUseReact(k) { if (DU.role === 'host') duelReact('host', k); else duelSend({ t: 'react', k: k }); }
function duelRoomsStart() {`);

// ---------- 2) người chơi có avatar ----------
rep('hostplayer', `players: [{ id: 'host', name: DU.myName || 'Chủ phòng', score: 0,`, `players: [{ id: 'host', av: duelAv(), name: DU.myName || 'Chủ phòng', score: 0,`);
rep('hello', `p = { id: pid, name: pName, score: 0,`, `p = { id: pid, av: validAv(m.av), name: pName, score: 0,`);
rep('hello2', `      p.connected = true;
      p.name = pName;`, `      p.connected = true;
      p.name = pName; p.av = validAv(m.av);`);
rep('guesthello', `c.send({ t: 'hello', name: DU.myName || 'Khách' });`, `c.send({ t: 'hello', name: DU.myName || 'Khách', av: duelAv() });`);
rep('bot', `s.players.push({ id: 'bot_'`, `s.players.push({ av: { c: Math.floor(Math.random() * 8), i: Math.floor(Math.random() * 12) }, id: 'bot_'`);
rep('handlers', `  } else if (m.t === 'ans') {`, `  } else if (m.t === 'react') {
    duelReact(c.peer, m.k);
  } else if (m.t === 'pow') {
    duelPower(c.peer, m.i, m.k);
  } else if (m.t === 'ans') {`);
rep('startinit', `p.gain = 0; p.streak = 0; p.right = 0; p.fast = 0; });`, `p.gain = 0; p.streak = 0; p.right = 0; p.fast = 0; p.pw = { x2: 1, fifty: 1 }; p.x2 = -1; p.hideI = -1; p.hide = []; s.feed = []; });`);
rep('score', `    p.score += p.gain;`, `    if (p.x2 === s.i) p.gain *= 2;
    if (p.hideI === s.i) p.gain = Math.round(p.gain * 0.7);
    p.score += p.gain;`);

// ---------- 3) màn hình vào ----------
const e0 = a.indexOf("  if (!s) {\n    var c = DU.cfg;"), e1 = a.indexOf("    content.innerHTML = h;\n    var nm = $('#dname');");
if (e0 < 0 || e1 < 0) miss.push('entry'); else {
  a = a.slice(0, e0) + String.raw`  if (!s) {
    var c = DU.cfg, myav = duelAv(), st = duelStats(), acc = st.total ? Math.round(st.right / st.total * 100) : 0;
    var profile = '<aside class="card dprofile"><div class="dp-top">' + avHtml({ av: myav }, 64) + '<div style="min-width:0"><div class="small muted">Hồ sơ đấu thủ</div><div class="dp-name">' + esc(duelName() || 'Chưa đặt tên') + '</div></div></div>' +
      '<label class="small muted" for="dname">Tên hiển thị</label><input id="dname" class="sel" style="max-width:none;width:100%;margin-top:6px" maxlength="24" placeholder="vd: Tuấn Anh" value="' + esc(duelName()) + '">' +
      '<div class="small muted" style="margin:14px 0 6px">Màu đại diện</div><div class="av-colors">' + AV_COLORS.map(function(col, k) { return '<button type="button" class="av-c' + (myav.c === k ? ' on' : '') + '" data-avc="' + k + '" style="background:' + col + '" aria-label="Màu ' + (k + 1) + '"></button>'; }).join('') + '</div>' +
      '<div class="small muted" style="margin:14px 0 6px">Biểu tượng</div><div class="av-icons">' + AV_ICONS.map(function(n, k) { return '<button type="button" class="av-i' + (myav.i === k ? ' on' : '') + '" data-avi="' + k + '" aria-label="Biểu tượng ' + (k + 1) + '">' + ic(n) + '</button>'; }).join('') + '</div>' +
      '<div class="dp-stats"><div><b>' + st.games + '</b><span>Trận</span></div><div><b>' + st.wins + '</b><span>Thắng</span></div><div><b>' + st.best + '</b><span>Điểm cao nhất</span></div><div><b>' + acc + '%</b><span>Chính xác</span></div></div>' +
      (st.hist.length ? '<div class="small muted" style="margin:14px 0 6px">Các trận gần đây</div><div class="dp-hist">' + st.hist.map(function(x) { return '<div><span class="tag ' + (x.rank === 1 ? 'ok' : '') + '">Hạng ' + x.rank + '/' + x.players + '</span><span>' + x.score + ' điểm</span></div>'; }).join('') + '</div>' : '') + '</aside>';
    h = '<div class="duel-hero"><div><div class="dh-k">Chế độ thi đấu</div><h1>Đấu trường kiến thức</h1><p>Thi trắc nghiệm theo thời gian thực cùng bạn bè, từ 2 đến 8 người. Trả lời đúng và nhanh để leo bảng xếp hạng, dùng trợ giúp đúng lúc để lội ngược dòng.</p></div></div>' +
      '<div class="duel-layout">' + profile + '<div class="duel-main">' +
      '<div class="card duel-solo"><div><b>Đấu thử với đối thủ máy</b><div class="small muted">Chưa có bạn cùng ôn? Tạo phòng riêng và thi đấu với 2 đối thủ máy. Chọn mức độ:</div></div><div class="row">' + duelLvSeg() + '<button class="btn primary" id="dsolo" type="button">Bắt đầu ' + ic('play') + '</button></div></div>' +
      (window.AI_SERVER ? '<div class="card"><div class="row between"><h3 style="margin:0">Phòng đang mở</h3><span class="small muted">Tự cập nhật</span></div><div id="drooms" class="rooms-list"><p class="small muted" style="margin:8px 0 0">Đang tải…</p></div></div>' : '') +
      '<div class="grid2"><div class="card"><h3 style="margin-top:0">Tạo phòng mới</h3>' +
        '<div class="small muted" style="margin-bottom:4px">Nguồn câu hỏi</div><div class="seg" style="margin-bottom:12px">' + Object.keys(DUEL_SRC).map(function(k) { return '<button data-dsrc="' + k + '" class="' + (c.src === k ? 'on' : '') + '">' + DUEL_SRC[k].t + '</button>'; }).join('') + '</div>' +
        '<div class="row" style="gap:14px 20px"><div><div class="small muted" style="margin-bottom:4px">Số câu hỏi</div><div class="seg">' + [10, 15, 20, 30].map(function(n) { return '<button data-dn="' + n + '" class="' + (c.n === n ? 'on' : '') + '">' + n + '</button>'; }).join('') + '</div></div>' +
        '<div><div class="small muted" style="margin-bottom:4px">Thời gian mỗi câu</div><div class="seg">' + [15, 20, 30].map(function(n) { return '<button data-dsec="' + n + '" class="' + (c.sec === n ? 'on' : '') + '">' + n + ' giây</button>'; }).join('') + '</div></div></div>' +
        '<button class="btn primary big" id="dhost" style="width:100%;margin-top:16px">Tạo phòng thi đấu ' + ic('arrow') + '</button></div>' +
      '<div class="card"><h3 style="margin-top:0">Vào phòng bằng mã</h3><p class="small muted" style="margin-top:0">Nhập mã 6 ký tự do chủ phòng gửi cho bạn.</p>' +
        '<input id="dcode" class="sel dcode-in" maxlength="6" placeholder="VD: K7P2QX" autocomplete="off" spellcheck="false">' +
        '<button class="btn primary big" id="djoin" style="width:100%;margin-top:12px">Vào phòng ' + ic('arrow') + '</button></div></div>' +
      '<div class="card dx-rules"><b>Luật chơi</b><div class="rules-grid"><div><b>100 + tốc độ</b><span>Mỗi câu đúng được 100 điểm, cộng tối đa 100 điểm tốc độ.</span></div><div><b>Chuỗi đúng</b><span>Từ câu đúng thứ 3 liên tiếp, thưởng thêm 25 điểm mỗi câu.</span></div><div><b>Nhân đôi</b><span>1 lần mỗi trận: điểm câu đó nhân đôi nếu bạn trả lời đúng.</span></div><div><b>Loại 2 đáp án</b><span>1 lần mỗi trận: bỏ 2 đáp án sai, điểm câu đó giảm 30%.</span></div></div></div>' +
      '</div></div>';
` + a.slice(e1);
}
rep('avbind', `    var nm = $('#dname'); nm.oninput = function() { duelSetName(nm.value.trim()); };`, `    var nm = $('#dname'); nm.oninput = function() { duelSetName(nm.value.trim()); var dn = $('.dp-name'); if (dn) dn.textContent = nm.value.trim() || 'Chưa đặt tên'; };
    bind('[data-avc]', 'click', function(e, b) { var v = duelAv(); v.c = +b.dataset.avc; duelSetAv(v); duelDraw(); });
    bind('[data-avi]', 'click', function(e, b) { var v = duelAv(); v.i = +b.dataset.avi; duelSetAv(v); duelDraw(); });`);

// ---------- 4) sảnh, bảng điểm ----------
rex('pillav', /<div class="player-avatar">' \+ esc\(p\.name\.charAt\(0\)\.toUpperCase\(\)\) \+ '<\/div><div style="flex:1;min-width:0">/, `' + avHtml(p, 36) + '<div style="flex:1;min-width:0">`);
rex('scoreav', /<div class="player-avatar">' \+ \(p\.isBot \? ic\('spark'\) : esc\(p\.name\.charAt\(0\)\.toUpperCase\(\)\)\) \+ '<\/div>/, `' + avHtml(p, 32) + '`);

// ---------- 5) đang thi: trợ giúp, cảm xúc ----------
rep('hid', `var whoHtml = whoPicks.length`, `var hid = (!rv && myP && myP.hideI === s.i && myP.hide && myP.hide.indexOf(o) >= 0);
        var whoHtml = whoPicks.length`);
rep('hid2', `return '<button class="opt ' + cls + '" data-k="' + k + '"' + (rv || myPick != null ? ' disabled' : '') +`, `return '<button class="opt ' + (hid ? 'gone' : cls) + '" data-k="' + k + '"' + (rv || myPick != null || hid ? ' disabled' : '') +`);
rep('pwbuild', `    DU.endPlayed = false;
    var dxHtml = '';`, `    DU.endPlayed = false;
    var pwHtml = '', reactHtml = '';
    if (!rv && myP) {
      var pw = myP.pw || { x2: 0, fifty: 0 };
      pwHtml = '<div class="pw-bar"><span class="small muted">Trợ giúp</span>' + ['x2', 'fifty'].map(function(k) {
        var left = pw[k] || 0, on = (k === 'x2' && myP.x2 === s.i) || (k === 'fifty' && myP.hideI === s.i);
        return '<button type="button" class="pw-btn' + (on ? ' on' : '') + '" data-pw="' + k + '" title="' + POWERS[k].d + '"' + ((myPick != null || on || left < 1) ? ' disabled' : '') + '>' + POWERS[k].t + ' <b>' + (on ? 'đang dùng' : left) + '</b></button>';
      }).join('') + '</div>';
    }
    reactHtml = '<div class="react-bar">' + REACTS.map(function(t, k) { return '<button type="button" class="chip" data-rx="' + k + '">' + t + '</button>'; }).join('') + '<div class="feed">' + (s.feed || []).slice(-3).map(function(f) { return '<span><b>' + esc(f.n) + '</b>: ' + REACTS[f.k] + '</span>'; }).join('') + '</div></div>';
    var dxHtml = '';`);
rex('pwins', /qhtml\(t\.q\) \+ '<\/div>' \+ ban \+\s*'<div class="opts">'/, `qhtml(t.q) + '</div>' + ban + pwHtml + '<div class="opts">'`);
rep('reactins', `'<div class="row between"><span class="small muted hide-m">Phím tắt:`, `reactHtml + '<div class="row between"><span class="small muted hide-m">Phím tắt:`);
rep('pwbind', `    bind('.opt', 'click', function(e, b) { duelPick(+b.dataset.k); });`, `    bind('.opt', 'click', function(e, b) { duelPick(+b.dataset.k); });
    bind('[data-pw]', 'click', function(e, b) { duelUsePower(b.dataset.pw); });
    bind('[data-rx]', 'click', function(e, b) { duelUseReact(+b.dataset.rx); });`);

// ---------- 6) kết quả ----------
rep('endstat', `if (!DU.endPlayed) { DU.endPlayed = true; duelBeep('end'); }`, `if (!DU.endPlayed) {
      DU.endPlayed = true; duelBeep('end');
      var meR = ranked.filter(function(p) { return p.id === duelMyId(); })[0];
      if (meR) duelStatsAdd({ rank: ranked.indexOf(meR) + 1, players: ranked.length, score: meR.score, right: meR.right || 0, total: s.ids.length, t: Date.now() });
    }
    var meX = ranked.filter(function(p) { return p.id === duelMyId(); })[0], meRank = meX ? ranked.indexOf(meX) + 1 : 0;`);
rex('endhero', /'<p>Điểm số cao nhất: <b>' \+ \(winner \? winner\.score : 0\) \+ ' điểm<\/b><\/p>' \+/, `'<p>Điểm cao nhất: <b>' + (winner ? winner.score : 0) + '</b>' + (meX ? ' · Bạn hạng <b>' + meRank + '/' + ranked.length + '</b> với <b>' + meX.score + '</b> điểm, đúng <b>' + (meX.right || 0) + '/' + s.ids.length + '</b> câu' : '') + '</p>' +`);
rep('share', `<button class="btn ghost" id="dleave">Rời phòng</button></div></div>'`, `<button class="btn ghost" id="dshare" type="button">Chép kết quả</button><button class="btn ghost" id="dleave">Rời phòng</button></div></div>'`);
rep('sharebind', `    bind('#dagain', 'click', duelStart);`, `    bind('#dagain', 'click', duelStart);
    bind('#dshare', 'click', function() {
      var t = 'Kết quả thi đấu ' + SJ.name + ': ' + ranked.map(function(p, k) { return (k + 1) + '. ' + p.name + ' (' + p.score + ' điểm)'; }).join(' | ');
      copyText(t); toast('Đã chép kết quả');
    });`);
rex('pod1', /<div class="podium-rank">2<\/div><div class="podium-name">/, `' + avHtml(ranked[1], 40) + '<div class="podium-rank">2</div><div class="podium-name">`);
rex('pod2', /<div class="podium-rank">1<\/div><div class="podium-name">/, `' + avHtml(ranked[0], 48) + '<div class="podium-rank">1</div><div class="podium-name">`);
rex('pod3', /<div class="podium-rank">3<\/div><div class="podium-name">/, `' + avHtml(ranked[2], 40) + '<div class="podium-rank">3</div><div class="podium-name">`);
fs.writeFileSync(W + 'app.js', a);

fs.appendFileSync(W + 'style.css', String.raw`
/* ===== Thi đấu v3: hồ sơ, trợ giúp, cảm xúc ===== */
.av{display:inline-grid;place-items:center;border-radius:50%;background:var(--avc,#2f4bd1);color:#fff;flex:none;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25)}
.av svg{width:55%;height:55%;stroke-width:2}
.duel-hero{background:linear-gradient(135deg,#1c2a7a 0%,#3350d4 60%,#5a74f0 100%);color:#fff;border-radius:20px;padding:26px 28px;margin-bottom:16px;position:relative;overflow:hidden}
.duel-hero:after{content:"";position:absolute;right:-60px;top:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.08)}
.duel-hero h1{margin:.1em 0 .3em;font-size:1.8rem;color:#fff}.duel-hero p{margin:0;max-width:60ch;opacity:.92;line-height:1.6}
.dh-k{font-size:.74rem;text-transform:uppercase;letter-spacing:.1em;opacity:.8;font-weight:700}
.duel-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:16px;align-items:start}
.duel-main{display:grid;gap:12px;min-width:0}.duel-main>.card{margin:0}
.dprofile{position:sticky;top:76px;margin:0}
.dp-top{display:flex;align-items:center;gap:14px;margin-bottom:14px}.dp-name{font-weight:750;font-size:1.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.av-colors{display:flex;gap:8px;flex-wrap:wrap}.av-c{width:28px;height:28px;border-radius:50%;border:3px solid var(--panel);box-shadow:0 0 0 1px var(--line);cursor:pointer}.av-c.on{box-shadow:0 0 0 2px var(--text)}
.av-icons{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.av-i{aspect-ratio:1;border:1px solid var(--line);background:var(--panel);border-radius:10px;cursor:pointer;color:var(--muted);display:grid;place-items:center}.av-i:hover{background:var(--panel2)}.av-i.on{border-color:var(--primary);color:var(--primary);background:var(--primary-soft)}.av-i svg{width:18px;height:18px}
.dp-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.dp-stats div{background:var(--panel2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column}.dp-stats b{font-size:1.3rem;font-variant-numeric:tabular-nums}.dp-stats span{font-size:.78rem;color:var(--muted)}
.dp-hist{display:grid;gap:6px}.dp-hist div{display:flex;justify-content:space-between;align-items:center;font-size:.88rem}
.rules-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px}.rules-grid div{background:var(--panel2);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:3px}.rules-grid span{font-size:.86rem;color:var(--muted);line-height:1.5}
@media(max-width:900px){.duel-layout{grid-template-columns:1fr}.dprofile{position:static}.duel-hero{padding:20px}.duel-hero h1{font-size:1.5rem}}
.pw-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}
.pw-btn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:6px 14px;font:600 .86rem system-ui,sans-serif;cursor:pointer;display:inline-flex;gap:8px;align-items:center}
.pw-btn b{background:var(--primary-soft);color:var(--primary);border-radius:99px;padding:0 8px;font-size:.78rem}
.pw-btn:hover:not(:disabled){border-color:var(--primary);background:var(--primary-soft)}.pw-btn:disabled{opacity:.55;cursor:default}.pw-btn.on{border-color:var(--primary);background:var(--primary-soft);opacity:1}
.opt.gone{opacity:.35;text-decoration:line-through;pointer-events:none}
.react-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:2px 0 12px}
.react-bar .chip{border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:999px;padding:4px 12px;font-size:.82rem;cursor:pointer}.react-bar .chip:hover{background:var(--primary-soft);color:var(--primary)}
.feed{display:flex;gap:10px;flex-wrap:wrap;margin-left:auto;font-size:.82rem;color:var(--muted)}.feed span{animation:fin .3s ease}
@keyframes fin{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
#dtm{font-variant-numeric:tabular-nums;background:var(--primary-soft);color:var(--primary);border-radius:999px;padding:2px 10px}
.podium-item{animation:rise .5s ease both}.podium-item.first{animation-delay:.25s}.podium-item.second{animation-delay:.1s}.podium-item.third{animation-delay:0s}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.podium-item .av{margin-bottom:8px}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
