import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/', T = R + 'sources-private/tools/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
function rep(o, n) { if (!a.includes(o)) { miss.push(o.slice(0, 60)); return; } a = a.replace(o, () => n); }
let mod = fs.readFileSync(T + 'srch-mod.js', 'utf8');
mod = mod.replace(/<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4"[\s\S]*?<\/svg> Mở Google/, '<b class="sr-gl">G</b> Mở Google');
rep(`expand:'`, `search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',expand:'`);
rep(`var FOCUS_PRESETS=`, mod + `\nvar FOCUS_PRESETS=`);
// nút trong thanh đồng hồ
rep(`'<button type="button" class="btn sm" id="fpExit">Thoát</button>';`, `'<button type="button" class="btn sm" id="fpSrch" title="Tra cứu nhanh (Google, Wikipedia)">'+ic('search')+'<span class="fp-sl">Tra cứu</span></button><button type="button" class="btn sm" id="fpExit">Thoát</button>';`);
rep(`$('#fpExit',e).onclick=function(){focusOff();};`, `$('#fpExit',e).onclick=function(){focusOff();};\n  $('#fpSrch',e).onclick=function(){srToggle();};`);
// giữ chế độ tập trung khi mở cửa sổ Google làm thoát toàn màn hình
rep(`if(FC.on&&FC.fs&&!document.fullscreenElement)focusOff();`, `if(FC.on&&FC.fs&&!document.fullscreenElement){if(FC.keepUntil&&Date.now()<FC.keepUntil){FC.fs=false;return;}focusOff();}`);
fs.writeFileSync(R + 'src/app.js', a);
let b = fs.readFileSync(R + 'src/ai.js', 'utf8');
const o1 = `askPop.innerHTML='<button class="btn sm primary" type="button">'+ic('spark')+' Hỏi Bố về đoạn này</button>';`;
if (!b.includes(o1)) miss.push('askPop'); else b = b.replace(o1, () => `askPop.innerHTML='<button class="btn sm primary" type="button">'+ic('spark')+' Hỏi Bố về đoạn này</button><button class="btn sm" type="button" id="apSr" title="Tra cứu Google / Wikipedia">'+ic('search')+' Tra cứu</button>';`);
const o2 = `askPop.querySelector('button').onclick=function(){askPopHide();dockOpen(text,'Giải thích đoạn này giúp tôi một cách dễ hiểu.');};`;
if (!b.includes(o2)) miss.push('askPop2'); else b = b.replace(o2, () => o2 + `\n  askPop.querySelector('#apSr').onclick=function(){askPopHide();srOpen(text);};`);
fs.writeFileSync(R + 'src/ai.js', b);
fs.appendFileSync(R + 'src/style.css', `
/* ===== Tra cứu nhanh ===== */
#srch{position:fixed;top:70px;right:18px;width:min(400px,calc(100vw - 24px));max-height:calc(100vh - 100px);z-index:92;display:none;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:16px;box-shadow:0 18px 50px rgba(15,23,42,.35);overflow:hidden}
#srch.open{display:flex}
#srch .sr-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--line)}
#srch .sr-head b{display:inline-flex;align-items:center;gap:8px}
#srch .sr-form{display:flex;gap:8px;padding:12px 14px 6px}
#srch .sr-form input{flex:1;min-width:0;font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text)}
#srch .sr-go{display:flex;flex-wrap:wrap;gap:6px;padding:6px 14px 10px}
#srch .sr-g{background:var(--primary);color:var(--primary-ink);border-color:var(--primary);font-weight:700}
#srch .sr-gl{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#fff;color:#4285f4;font-size:.8rem;margin-right:4px}
#srch .sr-tabs{margin:0 14px 8px;align-self:flex-start}
#srch .sr-body{overflow:auto;padding:4px 14px 14px;display:flex;flex-direction:column;gap:10px}
#srch .sr-item{padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}
#srch .sr-item a{font-weight:700;color:var(--primary);text-decoration:none}#srch .sr-item a:hover{text-decoration:underline}
#srch .sr-item .small{margin-top:4px;line-height:1.5}
#srch .sr-sum{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}
.ask-pop{display:flex;gap:6px}
@media(max-width:760px){#srch{top:auto;bottom:0;right:0;left:0;width:100vw;border-radius:16px 16px 0 0;max-height:75vh}#fpom .fp-sl{display:none}}
.srch-fab{position:fixed;right:18px;bottom:78px;z-index:50;display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--text);font:600 .88rem system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(15,23,42,.18)}
.srch-fab:hover{background:var(--primary-soft)}.srch-fab svg{width:16px;height:16px}
body.dock-open .srch-fab,body.focus-mode .srch-fab,body:has(#content .duel-grid) .srch-fab,body:has(#content .dcode) .srch-fab,body:has(#content .podium) .srch-fab,body.th-open .srch-fab{display:none}
@media(max-width:760px){.srch-fab{bottom:132px;right:14px;padding:10px}.srch-fab span{display:none}}
`);
console.log(miss.length ? 'THIẾU ' + miss.join(' | ') : 'ok');
