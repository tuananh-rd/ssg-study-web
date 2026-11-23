import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const f = W + 'public/index.html'; let a = fs.readFileSync(f, 'utf8'); const miss = [];
const rep = (o, n) => { if (!a.includes(o)) miss.push(o.slice(0, 70)); else a = a.replace(o, () => n); };
rep(`var P={book:`, `var P={list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',book:`);
rep(`ME.role==='admin'?[['shield','Quản trị tài khoản',adminView]]:[])`, `ME.role==='admin'?[['shield','Quản trị tài khoản',adminView]].concat(ME.can_logs?[['list','Nhật ký hoạt động',logView]]:[]):[])`);
rep(`function boot(){`, fs.readFileSync(W + 'scripts/logview.js', 'utf8') + `function boot(){`);
// nút cấp/thu quyền xem nhật ký trên từng quản trị viên (chỉ người đang có quyền mới thấy)
rep(`'<button class="btn sm" data-a="reset">Cấp lại mật khẩu</button>'+`, `'<button class="btn sm" data-a="reset">Cấp lại mật khẩu</button>'+(j.canLogs&&u.role==='admin'?'<button class="btn sm" data-a="logs">'+(u.can_logs?'Thu hồi quyền xem nhật ký':'Cho phép xem nhật ký')+'</button>':'')+`);
rep(`(u.role==='admin'?' <span class="tag admin">Quản trị viên</span>':'')`, `(u.role==='admin'?' <span class="tag admin">Quản trị viên</span>':'')+(u.role==='admin'&&u.can_logs?' <span class="tag active">Xem nhật ký</span>':'')`);
rep(`    else if(a==='role'){`, `    else if(a==='logs'){var has=tr.dataset.cl==='1';if(confirm(has?'Thu hồi quyền xem nhật ký của quản trị viên này?':'Cho phép quản trị viên này xem nhật ký hoạt động chi tiết của mọi người dùng?'))post({can_logs:!has});}
    else if(a==='role'){`);
// CSS
rep(`/* quản trị */`, `/* quản trị */
.lsum{display:grid;grid-template-columns:repeat(3,minmax(140px,1fr)) 2fr;gap:12px;margin-bottom:14px}.lcard{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px 16px}.lcard b{display:block;font-size:1.7rem;line-height:1.1}.lcard span{color:var(--muted);font-size:.84rem}.lcard.warn b{color:var(--bad)}.lcard.wide{grid-column:auto}.lcard.wide>div{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.lflt{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.lflt select,.lflt input{width:auto;min-height:38px;padding:7px 10px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text);font:inherit;font-size:.9rem}.lflt input[type=search]{flex:1;min-width:200px}
.lchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.lchip{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:5px 12px;font:600 .82rem system-ui;cursor:pointer}.lchip:hover{background:var(--soft)}.lchip.on{background:var(--primary);border-color:var(--primary);color:var(--ink)}
.ltable{font-size:.88rem}.ltable td{padding:9px 8px}.ltable .nw{white-space:nowrap;color:var(--muted);font-variant-numeric:tabular-nums}.lt{display:inline-block;padding:2px 9px;border-radius:6px;font-size:.78rem;font-weight:700;background:var(--panel2);white-space:nowrap}
.lt.ok{background:var(--okbg);color:var(--ok)}.lt.bad{background:var(--badbg);color:var(--bad)}.lt.ai{background:var(--soft);color:var(--primary)}.lt.adm{background:var(--warnbg);color:var(--warn)}
@media(max-width:900px){.lsum{grid-template-columns:1fr 1fr}.lcard.wide{grid-column:1/-1}.ltable thead{display:none}.ltable tr{display:block;border:1px solid var(--line);border-radius:10px;margin:8px 0;padding:6px}.ltable td{display:block;border:0;padding:3px 6px}}`);
rep(`return '<tr data-id="'+u.id+'" class="`, `return '<tr data-cl="'+(u.can_logs?1:0)+'" data-id="'+u.id+'" class="`);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
fs.writeFileSync(f, a); console.log('ok');
