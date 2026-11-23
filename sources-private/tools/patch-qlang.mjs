import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
const rep = (n, x, y) => { if (!a.includes(x)) { miss.push(n); return; } a = a.replace(x, () => y); };

// 1) áp bản dịch từ dữ liệu
rep('xl', `function T(q,lang){`, `var XL=D.xl||{};Object.keys(XL).forEach(function(id){var q=QMAP[id];if(!q)return;if(q.bank)q.vi=XL[id];else if(!q.en)q.en=XL[id];});
function T(q,lang){`);
// 2) nút đổi ngôn ngữ trong bài làm
rep('tools', `function quizTools(q){
  var g=reaskGap(),has=`, `function hasLang(q,l){return l==='en'?!!(q.bank||q.en):!!(!q.bank||q.vi);}
function quizTools(q,lang){
  var g=reaskGap(),has=`);
rep('toolshtml', `return '<span class="qtools">'+(has?`, `return '<span class="qtools"><span class="qlang" role="group" aria-label="Ngôn ngữ câu hỏi"><button type="button" data-ql="vi" class="'+(lang==='vi'?'on':'')+'" title="Tiếng Việt">VI</button><button type="button" data-ql="en" class="'+(lang==='en'?'on':'')+'" title="English">EN</button></span>'+(hasLang(q,lang)?'':'<span class="tag" title="Câu này chưa có bản dịch sang ngôn ngữ đang chọn, đang hiển thị bản gốc">chưa có bản dịch</span>')+(has?`);
rep('calltools', `quizTools(q)+'</div>'+`, `quizTools(q,lang)+'</div>'+`);
rep('langinit', `lang=lang||plang();
  function show(){`, `lang=localStorage.getItem('ui_qlang')||lang||plang();
  function show(){`);
rep('tv', `var q=list[i],t=T(q,lang),answered=false,sel=[];`, `var q=list[i],t=T(q,lang),answered=false,sel=[],tv=(q.bank&&lang==='vi'&&q.vi)?q.vi:null;
    function od(o){return tv?(tv.options[(q.orig||[]).indexOf(o)]||o):o;}`);
rep('qtext', `'<div class="q">'+qhtml(t.q)+(multi?`, `'<div class="q">'+qhtml(tv?tv.q:t.q)+(multi?`);
rep('opttext', `'<span>'+esc(o)+'</span></button>';}).join('')+'</div><div id="fb">`, `'<span>'+esc(od(o))+'</span></button>';}).join('')+'</div><div id="fb">`);
rep('ans', `return L[opts.indexOf(g)]+'. '+g;}).join(' · ');`, `return L[opts.indexOf(g)]+'. '+od(g);}).join(' · ');`);
rep('qlbind', `    if($('#thBtn'))$('#thBtn').onclick=`, `    $$('[data-ql]').forEach(function(b){b.onclick=function(){var nl=b.dataset.ql;if(nl===lang)return;lang=nl;try{localStorage.setItem('ui_qlang',lang);}catch(e){}if(answered){toast('Ngôn ngữ mới áp dụng từ câu tiếp theo');$$('[data-ql]').forEach(function(x){x.classList.toggle('on',x.dataset.ql===lang);});}else show();};});
    if($('#thBtn'))$('#thBtn').onclick=`);
fs.writeFileSync(R + 'src/app.js', a);

fs.appendFileSync(R + 'src/style.css', `
.qlang{display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden;background:var(--panel)}
.qlang button{border:0;background:transparent;color:var(--muted);padding:5px 11px;font:700 .78rem system-ui,sans-serif;cursor:pointer}
.qlang button.on{background:var(--primary);color:var(--primary-ink)}
`);

// 3) nạp bản dịch khi dựng
let b = fs.readFileSync(R + 'build.mjs', 'utf8');
if (!b.includes('translate-out-ssg')) b = b.replace("dataSrc += '\\nDATA.recall='", () => `{ const xl = {}, base = new URL('./sources-private/', import.meta.url);
  const load = (d, fn) => { const dir = new URL(d + '/', base); if (!fs.existsSync(dir)) return; for (const f of fs.readdirSync(dir).filter(f => /^[a-z]+-\\d+\\.json$/.test(f))) { try { fn(JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } } };
  load('translate-out-ssg', o => { for (const [k, v] of Object.entries(o)) xl['b-' + k] = v; });
  load('translate-recall-out-ssg', o => Object.assign(xl, o));
  dataSrc += '\\nDATA.xl=' + JSON.stringify(xl) + ';'; console.log('bản dịch SSG105:', Object.keys(xl).length); }
dataSrc += '\\nDATA.recall='`);
fs.writeFileSync(R + 'build.mjs', b);
let s = fs.readFileSync(R + 'web/scripts/build-subjects.mjs', 'utf8');
if (!s.includes('translate-out-')) {
  s = s.replace("  const subject = { id, name: S.name,", () => `  const xl = {};
  { const rdd = (d, fn) => { const dir = path.join(ROOT, 'sources-private', d); if (!fs.existsSync(dir)) return; for (const f of fs.readdirSync(dir).filter(f => /^[a-z]+-\\d+\\.json$/.test(f))) { try { fn(JSON.parse(rd(dir, f))); } catch (e) { console.log('  ! bỏ qua', f, e.message); } } };
    rdd('translate-out-' + S.file, o => { for (const [k, v] of Object.entries(o)) xl['b-' + k] = v; });
    rdd('translate-recall-out-' + S.file, o => Object.assign(xl, o)); console.log('  bản dịch ' + S.name + ':', Object.keys(xl).length); }
  const subject = { id, name: S.name,`);
  s = s.replace('recall, bank, topicMod })', 'recall, bank, topicMod, xl })');
}
fs.writeFileSync(R + 'web/scripts/build-subjects.mjs', s);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok', b.includes('translate-out-ssg'), s.includes('topicMod, xl'));
