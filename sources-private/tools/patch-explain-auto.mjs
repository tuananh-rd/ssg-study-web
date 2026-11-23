import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/src/';
let a = fs.readFileSync(W + 'app.js', 'utf8'), ai = fs.readFileSync(W + 'ai.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };
const rex = (n, re, y) => { if (!re.test(a)) { miss.push(n); return; } a = a.replace(re, () => y); };

// ===== ai.js: lời nhắc + giải thích tự động khi luyện tập =====
ai += String.raw`
function xpPrompt(t,opts,good){return 'Câu hỏi trắc nghiệm môn '+SJ.name+':\n'+t.q+'\n'+opts.map(function(o,k){return L[k]+'. '+o;}).join('\n')+'\nĐáp án đúng: '+good+'\n\nViết lời giải thích bằng tiếng Việt cho sinh viên ôn thi, gồm: (1) vì sao đáp án đúng là đúng, (2) vì sao từng đáp án còn lại sai, (3) một mẹo ghi nhớ ngắn. Tối đa 150 từ, trình bày bằng gạch đầu dòng, giữ nguyên thuật ngữ tiếng Anh.';}
var XC={};
function practiceExplain(q,t,opts,good,btn){
  if(!(AI_SRV||AiCfg.get().key)||!btn)return;
  var fb=document.getElementById('fb');if(!fb)return;
  var box=document.createElement('div');box.className='card xcard';box.innerHTML='<div class="xc-h">'+ic('spark')+'<b>Giải thích chi tiết</b></div><div class="xc-b"></div>';
  fb.insertAdjacentElement('afterend',box);var body=box.querySelector('.xc-b');
  function paint(txt){body.innerHTML=txt?mdLite(txt):'<span class="typing"><i></i><i></i><i></i></span> Trợ giảng đang soạn giải thích…';}
  if(XC[q.id]){paint(XC[q.id]);return;}
  paint('');btn.disabled=true;
  aiExplainQ(xpPrompt(t,opts,good.join(' ; ')),function(txt){if(body.isConnected)paint(txt);})
    .then(function(txt){XC[q.id]=txt;if(body.isConnected)paint(txt);btn.disabled=false;},
      function(e){if(body.isConnected)body.innerHTML='<span class="ai-err">'+esc(aiErrText(e))+'</span>';btn.disabled=false;});
}
`;

a = a.replace('$(\'#nx\').onclick=next;$(\'#nx\').focus({preventScroll:true});', () => "$('#nx').onclick=next;$('#nx').focus({preventScroll:true});practiceExplain(q,T(q,lang),opts,good,$('#nx'));");
if (!a.includes('practiceExplain(q,T(q,lang)')) miss.push('practice');

// ===== Thi đấu: AI soạn sẵn lời giải trước, xong mới chuyển câu =====
rep('guest', `    if (m.s.phase === 'reveal' && (!old || old.phase !== 'reveal' || old.i !== m.s.i)) DU.revStart = Date.now();`,
  `    if (m.s.phase === 'reveal' && m.s.xpText && (!old || old.phase !== 'reveal' || old.i !== m.s.i || !old.xpText)) DU.revStart = Date.now();`);
rep('reveal', `  s.revMs = 25000; DU.revStart = Date.now();
  DU.timer = setTimeout(duelAdvance, s.revMs);
}`, `  var X = DU.xp[id];
  if (X && X.done) { s.xpText = X.text; duelXpArm(); }
  else { s.xpText = null; clearTimeout(DU.timer); DU.timer = setTimeout(function() { duelXpDone(id, duelXpFallback(id)); }, 45000); duelXpPump(); }
  duelPush();
}

DU.xp = {}; DU.xpBusy = 0;
function duelXpFallback(id) {
  var q = QMAP[id]; return (q && q.explain ? q.explain + '\\n\\n' : '') + 'Đáp án đúng: ' + DU.correct[id] + '.';
}
function duelXpArm() {
  var s = DU.s; if (!s) return;
  s.revMs = 40000; DU.revStart = Date.now();
  clearTimeout(DU.timer); DU.timer = setTimeout(duelAdvance, s.revMs);
}
function duelXpDone(id, text) {
  var X = DU.xp[id] || (DU.xp[id] = {}); if (X.done) return;
  X.done = true; X.text = text; X.busy = false;
  var s = DU.s;
  if (s && s.phase === 'reveal' && s.ids[s.i] === id && s.xpText == null) { s.xpText = text; duelXpArm(); duelPush(); }
  duelXpPump();
}
function duelXpPump() {
  var s = DU.s; if (!s || DU.role !== 'host') return;
  var upto = Math.min(s.ids.length - 1, (s.phase === 'reveal' || s.phase === 'q' ? s.i : 0) + 2);
  for (var k = (s.phase === 'reveal' || s.phase === 'q' ? s.i : 0); k <= upto && DU.xpBusy < 2; k++) {
    (function(id) {
      if (DU.xp[id]) return;
      var q = QMAP[id], t = q.bank ? q : T(q, 'en'), opts = s.opts[id], X = DU.xp[id] = { busy: true, tries: 0 }; DU.xpBusy++;
      function go() {
        X.tries++;
        aiExplainQ(xpPrompt(t, opts, DU.correct[id]), null).then(function(txt) { DU.xpBusy--; duelXpDone(id, txt || duelXpFallback(id)); },
          function() { if (X.tries < 2 && DU.s === s) go(); else { DU.xpBusy--; duelXpDone(id, duelXpFallback(id)); } });
      }
      if (!(AI_SRV || AiCfg.get().key)) { DU.xpBusy--; return duelXpDone(id, duelXpFallback(id)); }
      go();
    })(s.ids[k]);
  }
}`);
// bỏ phần AI theo yêu cầu cũ
rex('oldfn', /DU\.expl = \{\};\nfunction duelExplainAI[\s\S]*?\n\}\n/, '');
rep('start', `duelClearBots(); DU.endPlayed = false;`, `duelClearBots(); DU.endPlayed = false; DU.xp = {}; DU.xpBusy = 0;`);
rep('start2', `  duelPush();
  clearTimeout(DU.timer); DU.timer = setTimeout(duelNextQ, 3000);`, `  duelPush(); duelXpPump();
  clearTimeout(DU.timer); DU.timer = setTimeout(duelNextQ, 3000);`);
rep('nextq', `p.pick = null; p.time = null; p.gain = 0; });
  DU.qStart`, `p.pick = null; p.time = null; p.gain = 0; });
  s.xpText = null; duelXpPump();
  DU.qStart`);
rep('reset', `clearTimeout(DU.timer); duelClearBots();`, `clearTimeout(DU.timer); duelClearBots(); DU.xp = {}; DU.xpBusy = 0;`);
rep('advance', `  if (!s || DU.role !== 'host' || s.phase !== 'reveal') return;
  clearTimeout(DU.timer);
  s.i++;`, `  if (!s || DU.role !== 'host' || s.phase !== 'reveal' || s.xpText == null) return;
  clearTimeout(DU.timer);
  s.i++;`);
rep('tick', `  if (s.phase === 'reveal' && DU.revStart) {
    var rl = Math.max(0, (s.revMs || 25000) - (Date.now() - DU.revStart)), rt = $('#drvt'), rb = $('#drvb');
    if (rt) rt.textContent = 'Tự chuyển câu sau ' + Math.ceil(rl / 1000) + ' giây';
    if (rb) rb.style.width = (rl / (s.revMs || 25000) * 100) + '%';
  }`, `  if (s.phase === 'reveal' && DU.revStart && s.xpText) {
    var rl = Math.max(0, (s.revMs || 40000) - (Date.now() - DU.revStart)), rt = $('#drvt'), rb = $('#drvb');
    if (rt) rt.textContent = 'Tự chuyển câu sau ' + Math.ceil(rl / 1000) + ' giây';
    if (rb) rb.style.width = (rl / (s.revMs || 40000) * 100) + '%';
  }`);

// thẻ giải thích to
rex('card', /      var cached = DU\.expl\[id\][\s\S]*?\n    \}\n    if \(rv\) \{\n      var mine/, `      var goodTxt = s.correct, isHostNow = (DU.role === 'host'), ready = !!s.xpText;
      dxHtml = '<div class="card dx dx-big"><div class="dx-h"><div class="dx-t">' + ic('spark') + '<b>Giải thích đáp án</b></div><span class="small muted" id="drvt">' + (ready ? '' : 'Đang soạn…') + '</span></div>' +
        '<div class="dx-ans">Đáp án đúng<b>' + esc(L[opts.indexOf(goodTxt)] + '. ' + goodTxt) + '</b></div>' +
        '<div class="dx-body">' + (ready ? mdLite(s.xpText) : '<span class="typing"><i></i><i></i><i></i></span> Trợ giảng đang soạn lời giải cho câu này, vui lòng chờ trong giây lát…') + '</div>' +
        (q.tip ? '<div class="ktip">' + ic('bulb') + '<span><b>Mẹo nhớ:</b> ' + esc(q.tip) + '</span></div>' : '') +
        (q.ref ? '<p class="small" style="margin:8px 0 0"><a href="' + refLink(q.ref) + '">Xem lý thuyết §' + q.ref + '</a></p>' : '') +
        '<div class="bar" style="margin-top:14px"><i id="drvb" style="width:' + (ready ? '100' : '0') + '%"></i></div>' +
        '<div class="row between" style="margin-top:10px"><span class="small muted">' + (ready ? (isHostNow ? 'Đọc xong thì chuyển câu, hoặc đợi tự chuyển.' : 'Chủ phòng sẽ chuyển câu tiếp theo.') : 'Chưa chuyển câu cho tới khi lời giải sẵn sàng.') + '</span>' +
        (isHostNow ? '<button class="btn primary" id="dnext" type="button"' + (ready ? '' : ' disabled') + '>' + (s.i + 1 >= s.ids.length ? 'Xem kết quả' : 'Câu tiếp theo') + ' ' + ic('arrow') + '</button>' : '') + '</div></div>';
    }
    if (rv) {
      var mine`);
rex('bindfix', /      bind\('#dxbtn'[\s\S]*?\n      if \(DU\.expl\[id\][^\n]*\n/, '');
fs.writeFileSync(W + 'app.js', a); fs.writeFileSync(W + 'ai.js', ai);
fs.appendFileSync(W + 'style.css', `
.dx-big{padding:20px 22px;border-left-width:5px;box-shadow:0 8px 28px rgba(47,75,209,.12)}
.dx-h{display:flex;justify-content:space-between;align-items:center;gap:10px}
.dx-t{display:flex;align-items:center;gap:8px;font-size:1.05rem;color:var(--primary)}.dx-t svg{width:20px;height:20px}
.dx-ans{margin:12px 0 10px;padding:10px 14px;background:var(--ok-soft);border-radius:10px;color:var(--ok);display:flex;flex-direction:column;gap:2px;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.dx-ans b{font-size:1.02rem;text-transform:none;letter-spacing:0;color:var(--text)}
.dx-body{line-height:1.75;font-size:1rem}.dx-body p{margin:.5em 0}.dx-body ul,.dx-body ol{margin:.5em 0;padding-left:1.3em}.dx-body li{margin:.35em 0}
.xcard{border-left:5px solid var(--primary);padding:16px 18px;margin:12px 0;box-shadow:0 8px 28px rgba(47,75,209,.12)}
.xc-h{display:flex;align-items:center;gap:8px;color:var(--primary);margin-bottom:8px}.xc-h svg{width:18px;height:18px}
.xc-b{line-height:1.7}.xc-b p{margin:.4em 0}.xc-b ul,.xc-b ol{margin:.4em 0;padding-left:1.3em}.xc-b li{margin:.3em 0}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
