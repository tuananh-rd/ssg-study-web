import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/src/';
let a = fs.readFileSync(W + 'app.js', 'utf8'), ai = fs.readFileSync(W + 'ai.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };
const rex = (n, re, y) => { if (!re.test(a)) { miss.push(n); return; } a = a.replace(re, () => y); };

// ai.js: hàm giải thích một câu hỏi
ai += String.raw`
async function aiExplainQ(prompt,onDelta){var r=await aiStream({msgs:[{role:'user',content:prompt}]},function(b){if(onDelta)onDelta(blocksText(b));},{system:AI_SYSTEM,effort:'low'});
  if(r.stop==='refusal')throw new Error('AI từ chối trả lời yêu cầu này.');return blocksText(r.blocks).trim();}
`;

// 1) thời gian xem giải thích: chủ phòng bấm "Câu tiếp theo" hoặc tự chuyển sau 25 giây
rex('reveal', /  DU\.timer = setTimeout\(function\(\) \{\n    if \(!DU\.s\) return;\n    s\.i\+\+;[\s\S]*?\n  \}, 3600\);\n\}/, `  s.revMs = 25000; DU.revStart = Date.now();
  DU.timer = setTimeout(duelAdvance, s.revMs);
}

function duelAdvance() {
  var s = DU.s; if (!s || DU.role !== 'host' || s.phase !== 'reveal') return;
  clearTimeout(DU.timer);
  s.i++;
  if (s.i >= s.ids.length) { s.phase = 'end'; duelPush(); }
  else duelNextQ();
}

DU.expl = {};
function duelExplainAI(id, q, t, opts, good) {
  var box = $('#dxai'); if (!box) return;
  if (DU.expl[id] && DU.expl[id].busy) return;
  var prompt = 'Câu hỏi trắc nghiệm môn ' + SJ.name + ':\\n' + t.q + '\\n' + opts.map(function(o, k) { return L[k] + '. ' + o; }).join('\\n') + '\\nĐáp án đúng: ' + good + '\\n\\nGiải thích bằng tiếng Việt, tối đa 120 từ: vì sao đáp án đúng là đúng và vì sao mỗi đáp án còn lại sai. Giữ nguyên thuật ngữ tiếng Anh.';
  DU.expl[id] = { text: '', busy: true };
  function paint(txt, err) { var b = $('#dxai'); if (b && DU.s && DU.s.ids[DU.s.i] === id) b.innerHTML = err ? '<span class="ai-err">' + esc(err) + '</span>' : (txt ? mdLite(txt) : '<span class="typing"><i></i><i></i><i></i></span> Đang soạn giải thích…'); }
  paint('');
  aiExplainQ(prompt, function(txt) { DU.expl[id].text = txt; paint(txt); })
    .then(function(txt) { DU.expl[id] = { text: txt, busy: false }; paint(txt); },
      function(e) { delete DU.expl[id]; paint('', aiErrText(e)); });
}`);
rep('guestrev', `    if (m.s.phase === 'q' && m.s.i !== DU.lastI) {`, `    if (m.s.phase === 'reveal' && (!old || old.phase !== 'reveal' || old.i !== m.s.i)) DU.revStart = Date.now();
    if (m.s.phase === 'q' && m.s.i !== DU.lastI) {`);

// 2) tick: đếm ngược phần giải thích
rep('tick', `  if (s.phase === 'count') {
    var c = $('#dcn');`, `  if (s.phase === 'reveal' && DU.revStart) {
    var rl = Math.max(0, (s.revMs || 25000) - (Date.now() - DU.revStart)), rt = $('#drvt'), rb = $('#drvb');
    if (rt) rt.textContent = 'Tự chuyển câu sau ' + Math.ceil(rl / 1000) + ' giây';
    if (rb) rb.style.width = (rl / (s.revMs || 25000) * 100) + '%';
  }
  if (s.phase === 'count') {
    var c = $('#dcn');`);

// 3) giao diện phần giải thích
rep('dxhtml', `    DU.endPlayed = false;
    if (rv) {`, `    DU.endPlayed = false;
    var dxHtml = '';
    if (rv) {
      var cached = DU.expl[id], goodTxt = s.correct, isHostNow = (DU.role === 'host');
      dxHtml = '<div class="card dx"><div class="row between"><b>Giải thích đáp án</b><span class="small muted" id="drvt"></span></div>' +
        '<p style="margin:8px 0 4px">Đáp án đúng: <b style="color:var(--ok)">' + esc(L[opts.indexOf(goodTxt)] + '. ' + goodTxt) + '</b></p>' +
        (q.explain ? '<p style="margin:4px 0">' + esc(q.explain) + '</p>' : '') +
        (q.tip ? '<div class="ktip">' + ic('bulb') + '<span><b>Mẹo nhớ:</b> ' + esc(q.tip) + '</span></div>' : '') +
        (q.ref ? '<p class="small" style="margin:6px 0"><a href="' + refLink(q.ref) + '">Xem lý thuyết §' + q.ref + '</a></p>' : '') +
        '<div id="dxai" class="dx-ai">' + (cached && cached.text ? mdLite(cached.text) : '') + '</div>' +
        (cached && cached.text ? '' : '<button class="btn sm" id="dxbtn" type="button">' + ic('spark') + ' Giải thích chi tiết bằng AI</button>') +
        '<div class="bar" style="margin-top:12px"><i id="drvb" style="width:100%"></i></div>' +
        '<div class="row between" style="margin-top:10px"><span class="small muted">' + (isHostNow ? 'Đọc xong thì chuyển câu, hoặc đợi tự chuyển.' : 'Chủ phòng sẽ chuyển câu tiếp theo.') + '</span>' +
        (isHostNow ? '<button class="btn primary" id="dnext" type="button">' + (s.i + 1 >= s.ids.length ? 'Xem kết quả' : 'Câu tiếp theo') + ' ' + ic('arrow') + '</button>' : '') + '</div></div>';
    }
    if (rv) {`);
rex('dxinsert', /\(rv && q\.explain \? '<p class="small muted" style="margin:10px 0 0">' \+ esc\(q\.explain\) \+ '<\/p>' : ''\) \+ '<\/div>' \+/, `'</div>' + dxHtml +`);
rep('dxbind', `    bind('.opt', 'click', function(e, b) { duelPick(+b.dataset.k); });`, `    bind('.opt', 'click', function(e, b) { duelPick(+b.dataset.k); });
    if (rv) {
      bind('#dnext', 'click', duelAdvance);
      bind('#dxbtn', 'click', function(e, b) { b.remove(); duelExplainAI(id, q, t, opts, s.correct); });
      if (DU.expl[id] && DU.expl[id].busy && DU.expl[id].text === '') { var bb = $('#dxbtn'); if (bb) bb.remove(); }
    }`);
rep('keys', `setKeys(function(e){var s=DU.s;if(!s||s.phase!=='q')return;`, `setKeys(function(e){var s=DU.s;if(s&&s.phase==='reveal'&&DU.role==='host'&&(e.key==='Enter'||e.key==='ArrowRight')){duelAdvance();return true;}if(!s||s.phase!=='q')return;`);
fs.writeFileSync(W + 'app.js', a); fs.writeFileSync(W + 'ai.js', ai);
fs.appendFileSync(W + 'style.css', `
.dx{border-left:4px solid var(--primary)}
.dx-ai{margin:8px 0;line-height:1.65;font-size:.95rem}.dx-ai p{margin:.4em 0}
.dx .bar{height:6px}.dx .bar i{transition:width .25s linear}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
