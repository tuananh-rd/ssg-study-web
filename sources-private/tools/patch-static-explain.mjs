import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), ai = fs.readFileSync(R + 'src/ai.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };
const rex = (n, re, y) => { if (!re.test(a)) { miss.push(n); return; } a = a.replace(re, () => y); };

// 1) Luyện tập: không gọi AI tự động; hiện lời giải soạn sẵn
rep('fb', `esc(q.explain||(q.bank?'Đáp án theo bộ đề '+SJ.name+'.':''))`, `esc(q.bank?'':(q.explain||''))`);
const p0 = ai.indexOf('var XC={};'), p1 = ai.indexOf('\n', ai.indexOf("function(e){if(body.isConnected)body.innerHTML='<span class=\"ai-err\">'"));
if (p0 < 0 || p1 < 0) miss.push('practiceExplain'); else ai = ai.slice(0, p0) + String.raw`function practiceExplain(q,t,opts,good,btn){
  var fb=document.getElementById('fb');if(!fb||!q.bank)return;
  var box=document.createElement('div');box.className='card xcard';
  box.innerHTML='<div class="xc-h">'+ic('book')+'<b>Giải thích</b></div><div class="xc-b">'+(q.explain?mdLite(q.explain):'<span class="muted">Câu này chưa có lời giải soạn sẵn. Con cần thì hỏi bố.</span>')+'</div>'+
    '<div class="xc-f"><button type="button" class="btn sm" id="xcAsk">'+ic('chat')+' Hỏi Bố Tuấn Anh giải thích thêm</button></div>';
  fb.insertAdjacentElement('afterend',box);
  box.querySelector('#xcAsk').onclick=function(){dockOpen('Câu hỏi: '+t.q+'\nĐáp án đúng: '+good.join(' ; '),'');};
}` + ai.slice(p1);
// 2) Thi đấu: lời giải soạn sẵn, không gọi AI
rex('xpreveal', /  var X = DU\.xp\[id\];\n  if \(X && X\.done\) \{ s\.xpText = X\.text; duelXpArm\(\); \}\n  else \{[^\n]*\n/, `  s.xpText = duelXpFallback(id); duelXpArm();\n`);
rex('xppump', /function duelXpPump\(\) \{[\s\S]*?\n\}\n(?=\nfunction|\n[A-Za-z])/, `function duelXpPump() {}\n`);
rep('xpfallback', `return (q && q.explain) ? q.explain : 'Chưa có lời giải chi tiết cho câu này. Đáp án đúng theo bộ đề môn ' + SJ.name + '. Hãy xem lại phần lý thuyết liên quan.';`, `return (q && q.explain) ? q.explain : 'Câu này chưa có lời giải soạn sẵn. Đáp án đúng theo bộ đề môn ' + SJ.name + '.';`);
rep('xpbtn', `'<div class="bar" style="margin-top:14px"><i id="drvb"`, `'<div style="margin-top:10px"><button type="button" class="btn sm" id="dxask">' + ic('chat') + ' Hỏi Bố Tuấn Anh giải thích thêm</button></div>' +
        '<div class="bar" style="margin-top:14px"><i id="drvb"`);
rep('xpbind', `      bind('#dnext', 'click', duelAdvance);`, `      bind('#dnext', 'click', duelAdvance);
      bind('#dxask', 'click', function() { dockOpen('Câu hỏi: ' + t.q + '\\nĐáp án đúng: ' + s.correct, ''); });`);
fs.writeFileSync(R + 'src/app.js', a); fs.writeFileSync(R + 'src/ai.js', ai);

// 3) Nạp lời giải soạn sẵn khi dựng
let b = fs.readFileSync(R + 'build.mjs', 'utf8');
if (!b.includes('explain-out-ssg')) b = b.replace("dataSrc += '\\nDATA.recall='", () => `{ const dir = new URL('./sources-private/explain-out-ssg/', import.meta.url), ex = {};
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(f => /^ssg-\\d+\\.json$/.test(f))) { try { Object.assign(ex, JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } }
  dataSrc += '\\n(function(){var E=' + JSON.stringify(ex) + ';DATA.bank.forEach(function(b){if(!b.explanation&&E[b.id])b.explanation=E[b.id];});})();'; console.log('lời giải soạn sẵn SSG105:', Object.keys(ex).length); }
dataSrc += '\\nDATA.recall='`);
fs.writeFileSync(R + 'build.mjs', b);
let s = fs.readFileSync(R + 'web/scripts/build-subjects.mjs', 'utf8');
if (!s.includes('explain-out-')) s = s.replace("  const topicMod = { ...S.topicMod };", () => `  { const dir = path.join(ROOT, 'sources-private', 'explain-out-' + S.file), ex = {}; let n = 0;
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(f => /^[a-z]+-\\d+\\.json$/.test(f))) { try { Object.assign(ex, JSON.parse(rd(dir, f))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } }
    for (const q of bank) if (!q.explanation && ex[q.id]) { q.explanation = ex[q.id]; n++; }
    console.log('  lời giải soạn sẵn ' + S.name + ':', n + '/' + bank.length); }
  const topicMod = { ...S.topicMod };`);
fs.writeFileSync(R + 'web/scripts/build-subjects.mjs', s);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok', b.includes('explain-out-ssg'), s.includes('explain-out-'));
