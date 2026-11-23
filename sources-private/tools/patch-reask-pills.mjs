import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
const i0 = a.indexOf(`'<label class="small muted rgap"`);
const endTok = `</label></span>';`;
const i1 = i0 < 0 ? -1 : a.indexOf(endTok, i0) + endTok.length;
if (i0 < 0 || i1 < i0) miss.push('select');
else a = a.slice(0, i0) +
  `'<span class="rgap" title="Câu trả lời sai sẽ được hỏi lại sau số câu bạn chọn"><span class="small muted">Hỏi lại câu sai</span><span class="qlang rg" role="group" aria-label="Hỏi lại câu sai sau bao nhiêu câu">'+[[0,'Tắt'],[3,'3'],[5,'5'],[10,'10']].map(function(o){return '<button type="button" data-rg="'+o[0]+'" class="'+(g===o[0]?'on':'')+'" title="'+(o[0]?'Sau '+o[0]+' câu':'Không hỏi lại')+'">'+o[1]+'</button>';}).join('')+'</span></span></span>';` + a.slice(i1);
const j0 = a.indexOf(`if($('#rgap'))`);
const j1 = a.indexOf('\n', j0);
if (j0 < 0) miss.push('bind');
else a = a.slice(0, j0) +
  `$$('[data-rg]').forEach(function(b){b.onclick=function(){var v=+b.dataset.rg;try{localStorage.setItem('ui_reask',v);}catch(e){}$$('[data-rg]').forEach(function(x){x.classList.toggle('on',x===b);});toast(v?'Câu sai sẽ được hỏi lại sau '+v+' câu':'Đã tắt hỏi lại câu sai');};});` + a.slice(j1);
fs.writeFileSync(R + 'src/app.js', a);
fs.appendFileSync(R + 'src/style.css', '\n.rgap .qlang button{min-width:34px;text-align:center}\n.rgap{gap:8px}\n');
console.log(miss.length ? 'THIẾU ' + miss : 'ok');
