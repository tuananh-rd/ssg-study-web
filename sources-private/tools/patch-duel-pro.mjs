import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/src/';
let a = fs.readFileSync(W + 'app.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };
const rex = (n, re, y) => { if (!re.test(a)) { miss.push(n); return; } a = a.replace(re, () => y); };

// 1) âm thanh + đối thủ máy
rep('helpers', 'var PEER_PREFIX = SJ.peer;', String.raw`var PEER_PREFIX = SJ.peer;
DU.botLv = 'mid'; DU.botTimers = []; DU.autoBots = 0; DU.endPlayed = false;
function duelMuted() { try { return localStorage.getItem(KEY + '_snd') === '0'; } catch (e) { return false; } }
function duelBeep(kind) {
  if (duelMuted()) return;
  try {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    duelBeep.ctx = duelBeep.ctx || new AC(); var c = duelBeep.ctx; if (c.state === 'suspended') c.resume();
    var seq = { tick: [[660, .07]], go: [[880, .18]], ok: [[660, .09], [880, .14]], bad: [[220, .22]], end: [[523, .12], [659, .12], [784, .22]] }[kind] || [];
    var t = c.currentTime;
    seq.forEach(function(n) {
      var o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = n[0];
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + n[1]);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + n[1] + .02); t += n[1];
    });
  } catch (e) {}
}
var BOT_NAMES = ['Aria', 'Bolt', 'Cleo', 'Dash', 'Echo', 'Fox', 'Gizmo'];
var BOT_LV = { easy: { t: 'Dễ', acc: .5, lo: .35, hi: .85 }, mid: { t: 'Vừa', acc: .72, lo: .2, hi: .7 }, hard: { t: 'Khó', acc: .9, lo: .1, hi: .5 } };
function duelLvSeg() { return '<div class="seg">' + Object.keys(BOT_LV).map(function(k) { return '<button type="button" data-blv="' + k + '" class="' + (DU.botLv === k ? 'on' : '') + '">' + BOT_LV[k].t + '</button>'; }).join('') + '</div>'; }
function duelAddBot() {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  if (s.players.filter(function(p) { return p.connected; }).length >= 8) return toast('Phòng đã đủ 8 người');
  var used = s.players.map(function(p) { return p.name; }), nm = BOT_NAMES.filter(function(n) { return used.indexOf(n + ' (máy)') < 0; })[0] || ('Máy ' + s.players.length);
  s.players.push({ id: 'bot_' + Math.random().toString(36).slice(2, 7), name: nm + ' (máy)', score: 0, pick: null, time: null, connected: true, isHost: false, isBot: true, lv: DU.botLv });
  if (s.phase === 'wait') s.phase = 'ready';
  duelPush();
}
function duelRemoveBot(id) {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  s.players = s.players.filter(function(p) { return p.id !== id; });
  if (s.players.filter(function(p) { return p.connected; }).length < 2) s.phase = 'wait';
  duelPush();
}
function duelClearBots() { (DU.botTimers || []).forEach(clearTimeout); DU.botTimers = []; }
function duelBotPlay() {
  var s = DU.s; if (!s) return; duelClearBots();
  var qi = s.i, id = s.ids[qi], opts = s.opts[id], good = DU.correct[id], tot = s.cfg.sec * 1000;
  s.players.forEach(function(p) {
    if (!p.isBot || !p.connected) return;
    var lv = BOT_LV[p.lv] || BOT_LV.mid, delay = Math.round((lv.lo + Math.random() * (lv.hi - lv.lo)) * tot), ok = Math.random() < lv.acc;
    var wrong = opts.filter(function(o) { return o !== good; }), choice = (ok || !wrong.length) ? good : wrong[Math.floor(Math.random() * wrong.length)];
    DU.botTimers.push(setTimeout(function() { duelAnswer(p.id, qi, choice, delay); }, delay));
  });
}`);
rep('reset', `function duelReset(msg) {
  clearTimeout(DU.timer);`, `function duelReset(msg) {
  clearTimeout(DU.timer); duelClearBots();`);
rep('hostopen', `        hist: []
      };
      duelDraw();`, `        hist: []
      };
      if (DU.autoBots) { var nb = DU.autoBots; DU.autoBots = 0; for (var bi = 0; bi < nb; bi++) duelAddBot(); }
      duelDraw();`);

// 2) tính điểm
rep('start', `s.players.forEach(function(p) { p.score = 0; p.pick = null; p.time = null; });`, `duelClearBots(); DU.endPlayed = false;
  s.players.forEach(function(p) { p.score = 0; p.pick = null; p.time = null; p.gain = 0; p.streak = 0; p.right = 0; p.fast = 0; });`);
rep('nextq1', `s.players.forEach(function(p) { p.pick = null; p.time = null; });
  DU.qStart`, `s.players.forEach(function(p) { p.pick = null; p.time = null; p.gain = 0; });
  DU.qStart`);
rep('nextq2', `clearTimeout(DU.timer); DU.timer = setTimeout(duelReveal, s.cfg.sec * 1000 + 400);`, `clearTimeout(DU.timer); DU.timer = setTimeout(duelReveal, s.cfg.sec * 1000 + 400);
  duelBotPlay();`);
rex('answer', /  var isGood = \(choice === DU\.correct\[s\.ids\[s\.i\]\]\);[\s\S]*?\n  duelCheckAllAnswered\(\);\n\}/, `  var tot = s.cfg.sec * 1000, isGood = (choice === DU.correct[s.ids[s.i]]);
  ms = Math.max(0, Math.min(+ms || 0, tot)); p.time = ms; p.gain = 0;
  if (isGood) {
    p.streak = (p.streak || 0) + 1; p.right = (p.right || 0) + 1;
    p.gain = 100 + Math.round(100 * (tot - ms) / tot) + (p.streak >= 3 ? 25 : 0);
    p.score += p.gain;
    if (!s.winner) { s.winner = p.id; p.fast = (p.fast || 0) + 1; }
  } else p.streak = 0;
  duelCheckAllAnswered();
}`);
rep('reveal1', `clearTimeout(DU.timer);
  var id = s.ids[s.i]; s.phase = 'reveal';`, `clearTimeout(DU.timer); duelClearBots();
  s.players.forEach(function(p) { if (p.pick == null) { p.streak = 0; p.gain = 0; } });
  var id = s.ids[s.i]; s.phase = 'reveal';`);
rep('reveal2', `return { id: p.id, name: p.name, pick: p.pick, time: p.time, score: p.score };`, `return { id: p.id, name: p.name, pick: p.pick, time: p.time, score: p.score, gain: p.gain || 0 };`);
rep('tick', `if (c) c.textContent = Math.max(1, 3 - Math.floor((Date.now() - DU.countStart) / 1000));`, `var n3 = Math.max(1, 3 - Math.floor((Date.now() - DU.countStart) / 1000));
    if (c) c.textContent = n3;
    if (DU.lastTick !== n3) { DU.lastTick = n3; duelBeep('tick'); }`);

// 3) màn hình vào
rep('intro', `<h1>Thi đấu trực tuyến</h1><p class="muted" style="margin-top:-6px">Thi đấu trắc nghiệm thời gian thực cùng bạn bè qua mạng internet. <b>Hỗ trợ từ 2 đến 8 người chơi</b>, kết nối liên mạng toàn cầu (4G/WiFi khác nhau).</p>' +`,
  `<h1>Thi đấu trực tuyến</h1><p class="muted" style="margin-top:-6px">Cùng bạn bè làm đề trắc nghiệm trong thời gian thực, từ 2 đến 8 người, điểm tính theo độ chính xác và tốc độ. Cần kết nối internet.</p>' +`);
rep('solo', `'<div class="grid2"><div class="card"><h3 style="margin-top:0">Tạo phòng mới</h3>'`,
  `'<div class="card duel-solo"><div><b>Đấu thử với đối thủ máy</b><div class="small muted">Chưa có bạn cùng ôn? Tạo phòng riêng và thi đấu với 2 đối thủ máy. Chọn mức độ:</div></div><div class="row">' + duelLvSeg() + '<button class="btn primary" id="dsolo" type="button">Bắt đầu ' + ic('play') + '</button></div></div>' +
      '<div class="grid2"><div class="card"><h3 style="margin-top:0">Tạo phòng mới</h3>'`);
rex('rules', /<div class="card spotlight"[\s\S]*?<\/ul><\/div>/, `<div class="card"><b>Thể lệ tính điểm</b><ul style="margin:6px 0 0;padding-left:20px;font-size:.9em;color:var(--muted)"><li>Mỗi câu đúng được <b>100 điểm</b>, cộng tối đa <b>100 điểm tốc độ</b>: trả lời càng sớm càng nhiều.</li><li>Đúng liên tiếp từ câu thứ 3 được thưởng thêm <b>25 điểm</b> mỗi câu.</li><li>Trả lời sai hoặc hết giờ không có điểm và mất chuỗi.</li><li>Câu kết thúc sớm khi tất cả người chơi đã chọn.</li></ul></div>`);
rep('solobind', `    bind('#dhost', 'click', function() { if (!needName()) duelHost(); });`, `    bind('#dhost', 'click', function() { if (!needName()) duelHost(); });
    bind('[data-blv]', 'click', function(e, b) { DU.botLv = b.dataset.blv; duelDraw(); });
    bind('#dsolo', 'click', function() { if (!needName()) { DU.autoBots = 2; duelHost(); } });`);

// 4) sảnh chờ
rep('lobbytitle', 'Phòng đấu trường', 'Phòng thi đấu');
rep('pill', `(p.isHost ? 'Chủ phòng' : 'Người chơi') + '</span></div><span class="tag ok">Sẵn sàng</span></div>'`,
  `(p.isHost ? 'Chủ phòng' : p.isBot ? 'Đối thủ máy · ' + (BOT_LV[p.lv] || BOT_LV.mid).t : 'Người chơi') + '</span></div>' + (isHost && p.isBot ? '<button class="iconbtn sm" type="button" data-rmbot="' + p.id + '" aria-label="Bỏ đối thủ này">' + ic('close') + '</button>' : '<span class="tag ok">Sẵn sàng</span>') + '</div>'`);
rep('botctl', `(isHost ? '<button class="btn primary big" id="dstart"`, `(isHost ? '<div class="card row between"><div><b>Đối thủ máy</b><div class="small muted">Thêm máy để thi đấu khi chưa đủ người.</div></div><div class="row">' + duelLvSeg() + '<button class="btn sm" id="dbot" type="button">Thêm máy</button></div></div>' : '') +
      (isHost ? '<button class="btn primary big" id="dstart"`);
rep('botbind', `      bind('#dstart', 'click', duelStart);`, `      bind('#dstart', 'click', duelStart);
      bind('[data-blv]', 'click', function(e, b) { DU.botLv = b.dataset.blv; duelDraw(); });
      bind('#dbot', 'click', duelAddBot);
      bind('[data-rmbot]', 'click', function(e, b) { duelRemoveBot(b.dataset.rmbot); });`);

// 5) đang thi: banner, âm thanh, bảng xếp hạng
rep('leave', `var leave = '<button class="btn sm ghost" id="dleave">Rời phòng</button>';`, `var leave = '<span class="row" style="gap:6px"><button class="btn sm ghost" id="dsnd" type="button">' + (duelMuted() ? 'Bật âm thanh' : 'Tắt âm thanh') + '</button><button class="btn sm ghost" id="dleave">Rời phòng</button></span>';`);
rep('sndbind', `  bind('#dleave', 'click', function() {`, `  bind('#dsnd', 'click', function() { try { localStorage.setItem(KEY + '_snd', duelMuted() ? '1' : '0'); } catch (e) {} duelDraw(); });
  bind('#dleave', 'click', function() {`);
rep('rec', `if (myPick != null) record(q, myPick === s.correct);`, `if (myPick != null) record(q, myPick === s.correct);
      duelBeep(myPick === s.correct ? 'ok' : 'bad');`);
rep('banner', `trả lời đúng nhanh nhất! (+2 điểm · ' + (winnerP.time / 1000).toFixed(1) + 's)</div>';`, `trả lời đúng nhanh nhất (' + (winnerP.time / 1000).toFixed(1) + ' giây).</div>';`);
rex('mine', /    h = '<div class="duel-grid">' \+ renderScoreboard\(s\) \+ '<\/div>' \+\n      '<div class="row between" style="gap:10px;margin:4px 0 8px">/, `    DU.endPlayed = false;
    if (rv) {
      var mine = myP ? (myP.gain || 0) : 0;
      ban += '<div class="dbanner ' + (mine ? 'ok' : 'bad') + '">' + (mine ? 'Bạn ghi <b>+' + mine + '</b> điểm' + (myP.streak >= 3 ? ' · chuỗi đúng ' + myP.streak + ' câu' : '') : (myP && myP.pick != null ? 'Chưa đúng. Đáp án đúng đã được đánh dấu.' : 'Bạn chưa kịp trả lời câu này.')) + '</div>';
    }
    h = '<div class="duel-grid">' + renderScoreboard(s) + '</div>' +
      '<div class="row between" style="gap:10px;margin:4px 0 8px">`);
const r0 = a.indexOf('function renderScoreboard(state) {'), r1 = a.indexOf('\n}\nroutes.duel=function');
if (r0 < 0 || r1 < 0) miss.push('scoreboard'); else a = a.slice(0, r0) + String.raw`function renderScoreboard(state) {
    var myPid = duelMyId();
    var rank = state.players.filter(function(p) { return p.connected; }).sort(function(x, y) { return y.score - x.score; });
    var top = rank.length ? Math.max(1, rank[0].score) : 1;
    return rank.map(function(p, k) {
      var isMe = (p.id === myPid), st = '';
      if (state.phase === 'q') st = (p.pick != null || (isMe && DU.pending === state.i)) ? '<span class="tag ok">đã chọn</span>' : '<span class="tag">đang nghĩ…</span>';
      else if (state.phase === 'reveal') {
        if (p.gain) st = '<span class="tag ok">+' + p.gain + (state.winner === p.id ? ' · nhanh nhất' : '') + '</span>';
        else if (p.pick != null) st = '<span class="tag bad">sai</span>'; else st = '<span class="tag">hết giờ</span>';
      }
      var streak = (p.streak >= 2 && state.phase !== 'count') ? '<span class="tag warn">chuỗi ' + p.streak + '</span> ' : '';
      return '<div class="pl-card' + (isMe ? ' me' : '') + '"><span class="pl-rank">' + (k + 1) + '</span><div class="player-avatar">' + (p.isBot ? ic('spark') : esc(p.name.charAt(0).toUpperCase())) + '</div><div class="nm"><b>' + esc(p.name) + '</b>' + (isMe ? ' <small class="muted">(Bạn)</small>' : '') + '<div class="pl-st">' + streak + st + '</div></div><div class="pl-sc"><b class="sc">' + p.score + '</b><div class="pl-bar"><i style="width:' + Math.round(p.score / top * 100) + '%"></i></div></div></div>';
    }).join('');
  }` + a.slice(r1);

// 6) kết quả
rep('endvars', `    var isMeWinner = (winner && winner.id === duelMyId());
`, `    var isMeWinner = (winner && winner.id === duelMyId());
    if (!DU.endPlayed) { DU.endPlayed = true; duelBeep('end'); }
    var nQ = s.hist.length || 1, runBest = {};
    ranked.forEach(function(p) { var run = 0, best = 0; s.hist.forEach(function(x) { var e = x.players.filter(function(y) { return y.id === p.id; })[0]; if (e && e.gain > 0) { run++; if (run > best) best = run; } else run = 0; }); runBest[p.id] = best; });
    function pstat(p) { var t = 0, c = 0; s.hist.forEach(function(x) { var e = x.players.filter(function(y) { return y.id === p.id; })[0]; if (e && e.pick != null && e.time != null) { t += e.time; c++; } }); return { avg: c ? t / c / 1000 : 0, acc: Math.round((p.right || 0) / nQ * 100) }; }
    function best(fn) { return ranked.slice().sort(function(x, y) { return fn(y) - fn(x); })[0]; }
    var bAcc = best(function(p) { return p.right || 0; }), bFast = best(function(p) { return p.fast || 0; }), bRun = best(function(p) { return runBest[p.id] || 0; });
    var awardsHtml = '';
    if (bAcc && (bAcc.right || 0) > 0) awardsHtml += '<div class="award"><div class="aw-t">Chính xác nhất</div><b>' + esc(bAcc.name) + '</b><span>' + bAcc.right + '/' + nQ + ' câu đúng</span></div>';
    if (bFast && (bFast.fast || 0) > 0) awardsHtml += '<div class="award"><div class="aw-t">Tay nhanh nhất</div><b>' + esc(bFast.name) + '</b><span>nhanh nhất ' + bFast.fast + ' câu</span></div>';
    if (bRun && (runBest[bRun.id] || 0) >= 2) awardsHtml += '<div class="award"><div class="aw-t">Chuỗi dài nhất</div><b>' + esc(bRun.name) + '</b><span>đúng liền ' + runBest[bRun.id] + ' câu</span></div>';
`);
rep('wintxt', `' Chiến Thắng!'`, `' thắng cuộc'`);
rex('table', /'<table style="margin-top:16px">[\s\S]*?<\/tbody><\/table><\/div>' \+/, `'<div class="awards">' + awardsHtml + '</div><div class="tbl-wrap"><table><thead><tr><th>Hạng</th><th>Người chơi</th><th>Điểm</th><th>Đúng</th><th>Chính xác</th><th>Tốc độ TB</th></tr></thead><tbody>' +
      ranked.map(function(p, rk) {
        var st = pstat(p), self = (p.id === duelMyId());
        return '<tr' + (self ? ' class="me"' : '') + '><td>' + (rk + 1) + '</td><td>' + esc(p.name) + (self ? ' (Bạn)' : '') + '</td><td><b>' + p.score + '</b></td><td>' + (p.right || 0) + '/' + nQ + '</td><td>' + st.acc + '%</td><td>' + (st.avg ? st.avg.toFixed(1) + ' giây' : '—') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>' +`);
rep('histtag', `' +2đ</span>'`, `' nhanh nhất</span>'`);
rep('againtxt', `Đấu lại cùng phòng </button>`, `Đấu lại cùng phòng</button>`);
fs.writeFileSync(W + 'app.js', a);

fs.appendFileSync(W + 'style.css', `
/* ===== Thi đấu v2 ===== */
.duel-grid{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.pl-card{gap:10px;justify-content:flex-start;padding:8px 12px}
.pl-rank{width:20px;text-align:center;font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums;flex:none}
.pl-card .nm{flex:1;white-space:normal}.pl-st{margin-top:2px;display:flex;gap:4px;flex-wrap:wrap}
.pl-card .player-avatar{width:30px;height:30px;font-size:.8em}.pl-card .player-avatar svg{width:16px;height:16px}
.pl-sc{min-width:56px;text-align:right}.pl-sc .sc{font-size:1.2em;font-variant-numeric:tabular-nums}
.pl-bar{height:4px;border-radius:99px;background:var(--panel2);margin-top:4px;overflow:hidden}.pl-bar i{display:block;height:100%;background:var(--primary);border-radius:99px;transition:width .4s}
.pl-card.me .pl-bar{background:var(--panel)}
.duel-solo{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;border-left:4px solid var(--primary)}
.duel-solo .small{margin-top:2px;max-width:46ch}
.player-pill .iconbtn{margin-left:auto}
.awards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:14px 0}.awards:empty{display:none}
.award{border:1px solid var(--line);background:var(--panel2);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}
.aw-t{font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--primary);font-weight:700}
.award span{font-size:.88rem;color:var(--muted)}
.tbl-wrap table{width:100%;border-collapse:collapse}.tbl-wrap th,.tbl-wrap td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--line)}
.tbl-wrap th{font-size:.82rem;color:var(--muted);font-weight:650}
.tbl-wrap tr.me td{background:var(--primary-soft);font-weight:650}
.podium{align-items:flex-end}.podium-item.first{padding-top:26px;padding-bottom:22px}.podium-item.second{padding-top:18px}.podium-item.third{padding-top:12px}
.opt.sel{border-color:var(--primary);background:var(--primary-soft)}
#dtb{transition:width .25s linear}
.q-wrap{}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
