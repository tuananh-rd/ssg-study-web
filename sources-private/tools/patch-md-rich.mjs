import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/';
let ai = fs.readFileSync(R + 'src/ai.js', 'utf8'), miss = [];

// 1) thay mdLite bằng bộ dựng Markdown + công thức (KaTeX nạp khi cần)
const m0 = ai.indexOf('function mdLite(t){'), m1 = ai.indexOf('function copyText(text)');
if (m0 < 0 || m1 < 0) miss.push('mdLite'); else ai = ai.slice(0, m0) + String.raw`function mdInline2(s){
  return s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1<i>$2</i>').replace(/~~(.+?)~~/g,'<s>$1</s>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
function mdLite(src){
  src=String(src==null?'':src).replace(/\r\n?/g,'\n');
  var holds=[];function hold(h){holds.push(h);return '\u0000'+(holds.length-1)+'\u0000';}
  function mj(tex,disp){tex=tex.trim();return hold('<'+(disp?'div':'span')+' class="mj'+(disp?' mj-d':'')+'" data-tex="'+esc(tex)+'">'+esc(tex)+'</'+(disp?'div':'span')+'>');}
  // khối code
  src=src.replace(/\x60\x60\x60([\w+#.-]*)[^\n]*\n([\s\S]*?)(?:\x60\x60\x60|$)/g,function(_,lang,code){
    return '\n'+hold('<div class="cb"><div class="cb-h"><span>'+esc(lang||'code')+'</span><button type="button" class="cb-copy">Chép</button></div><pre><code>'+esc(code.replace(/\n$/,''))+'</code></pre></div>')+'\n';});
  // công thức: $$..$$, \[..\], \(..\), $..$
  src=src.replace(/\$\$([\s\S]+?)\$\$/g,function(_,t){return '\n'+mj(t,true)+'\n';})
    .replace(/\\\[([\s\S]+?)\\\]/g,function(_,t){return '\n'+mj(t,true)+'\n';})
    .replace(/\\\(([\s\S]+?)\\\)/g,function(_,t){return mj(t,false);})
    .replace(/\$([^\s$](?:[^$\n]*?[^\s$])?)\$/g,function(_,t){return mj(t,false);});
  src=src.replace(/\x60([^\x60\n]+)\x60/g,function(_,c){return hold('<code>'+esc(c)+'</code>');});
  var lines=src.split('\n'),out=[],i=0;
  function inl(s){return mdInline2(esc(s));}
  function cells(l){return l.trim().replace(/^\||\|$/g,'').split('|').map(function(c){return c.trim();});}
  while(i<lines.length){
    var ln=lines[i],m;
    if(!ln.trim()){i++;continue;}
    if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(ln)){out.push('<hr>');i++;continue;}
    if((m=ln.match(/^\s*(#{1,4})\s+(.*)/))){var lv=Math.min(4,m[1].length+1);out.push('<h'+lv+' class="md-h">'+inl(m[2])+'</h'+lv+'>');i++;continue;}
    if(/^\s*\|.*\|\s*$/.test(ln)&&i+1<lines.length&&/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[i+1])){
      var head=cells(ln),al=cells(lines[i+1]).map(function(c){return /^:-+:$/.test(c)?'center':/-:$/.test(c)?'right':'left';}),rows=[];i+=2;
      while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i])){rows.push(cells(lines[i]));i++;}
      out.push('<div class="md-tbl"><table><thead><tr>'+head.map(function(c,k){return '<th style="text-align:'+(al[k]||'left')+'">'+inl(c)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+head.map(function(_,k){return '<td style="text-align:'+(al[k]||'left')+'">'+inl(r[k]||'')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>');
      continue;
    }
    if(/^\s*>\s?/.test(ln)){var q=[];while(i<lines.length&&/^\s*>\s?/.test(lines[i])){q.push(lines[i].replace(/^\s*>\s?/,''));i++;}out.push('<blockquote>'+q.map(inl).join('<br>')+'</blockquote>');continue;}
    if(/^\s*([-*•]|\d+[.)])\s+/.test(ln)){
      var stack=[],html='';
      while(i<lines.length&&(m=lines[i].match(/^(\s*)([-*•]|\d+[.)])\s+(.*)/))){
        var ind=Math.floor(m[1].replace(/\t/g,'  ').length/2),tag=/\d/.test(m[2])?'ol':'ul';
        while(stack.length>ind+1){html+='</li></'+stack.pop()+'>';}
        if(stack.length===ind+1){if(stack[ind]!==tag){html+='</li></'+stack.pop()+'>';html+='<'+tag+'>';stack.push(tag);}else html+='</li>';}
        else{while(stack.length<ind+1){html+='<'+tag+'>';stack.push(tag);}}
        html+='<li>'+inl(m[3]);i++;
      }
      while(stack.length)html+='</li></'+stack.pop()+'>';
      out.push(html);continue;
    }
    var para=[];
    while(i<lines.length&&lines[i].trim()&&!/^\s*(#{1,4}\s|>|([-*•]|\d+[.)])\s+|\|.*\||-{3,}\s*$)/.test(lines[i])){para.push(lines[i]);i++;}
    if(!para.length){para.push(lines[i]);i++;}
    out.push('<p>'+para.map(inl).join('<br>')+'</p>');
  }
  var html=out.join('').replace(/\u0000(\d+)\u0000/g,function(_,k){return holds[+k];});
  return '<div class="md">'+html+'</div>';
}
// KaTeX: nạp khi trong câu trả lời có công thức; chưa nạp được thì giữ nguyên mã TeX
var KX={p:null};
function katexLoad(){
  if(window.katex)return Promise.resolve();if(KX.p)return KX.p;
  KX.p=new Promise(function(res,rej){var l=document.createElement('link');l.rel='stylesheet';l.href='/vendor/katex/katex.min.css';document.head.appendChild(l);
    var s=document.createElement('script');s.src='/vendor/katex/katex.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  KX.p.catch(function(){KX.p=null;});return KX.p;
}
function katexScan(){
  var els=[].slice.call(document.querySelectorAll('.mj:not([data-done])'));if(!els.length)return;
  katexLoad().then(function(){els.forEach(function(e){try{e.innerHTML=window.katex.renderToString(e.getAttribute('data-tex'),{displayMode:e.classList.contains('mj-d'),throwOnError:false,strict:false,trust:false});e.setAttribute('data-done','1');}catch(x){e.setAttribute('data-done','err');}});},function(){els.forEach(function(e){e.setAttribute('data-done','err');});});
}
setTimeout(function(){
  try{new MutationObserver(function(){clearTimeout(katexScan.t);katexScan.t=setTimeout(katexScan,50);}).observe(document.body,{childList:true,subtree:true});}catch(e){}
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.cb-copy,.md-copy');if(!b)return;
    var t=b.classList.contains('cb-copy')?(b.closest('.cb').querySelector('code')||{}).textContent:(b.closest('[data-raw]')?b.closest('[data-raw]').getAttribute('data-raw'):'');
    if(t&&copyText(t)!==undefined){var o=b.textContent;b.textContent='Đã chép';setTimeout(function(){b.textContent=o;},1400);}
  });
},0);
` + ai.slice(m1);

// 2) hướng dẫn định dạng cho Bố Tuấn Anh
const old = 'Không dùng bảng Markdown.';
if (!ai.includes(old)) miss.push('system'); else ai = ai.replace(old, () => "TRÌNH BÀY: dùng Markdown gọn gàng (tiêu đề ngắn, gạch đầu dòng, **đậm** cho ý chính, bảng khi so sánh nhiều tiêu chí, khối code ``` có ghi ngôn ngữ). Công thức toán viết bằng LaTeX: $...$ cho công thức trong dòng, $$...$$ cho công thức đứng riêng; không dùng ký hiệu Unicode thay cho công thức phức tạp.");

// 3) bong bóng trong khung chat góc: tên + nút chép
const d = `'<div class="dk-a">'+mdLite(m.shown||'')+'</div>'`;
if (!ai.includes(d)) miss.push('dkbubble'); else ai = ai.replace(d, () => `'<div class="dk-a" data-raw="'+esc(m.shown||'')+'"><div class="dk-who">'+ic('spark')+'<b>Bố Tuấn Anh</b><button type="button" class="md-copy">Chép</button></div>'+mdLite(m.shown||'')+'</div>'`);
fs.writeFileSync(R + 'src/ai.js', ai);

fs.appendFileSync(R + 'src/style.css', String.raw`
/* ===== Trình bày câu trả lời của chatbot ===== */
.md{line-height:1.7;font-size:.95rem;overflow-wrap:anywhere}
.md>*:first-child{margin-top:0}.md>*:last-child{margin-bottom:0}
.md p{margin:.55em 0}
.md .md-h{margin:1.1em 0 .4em;font-weight:750;line-height:1.35;color:var(--text)}
.md h2.md-h{font-size:1.12em}.md h3.md-h{font-size:1.04em}.md h4.md-h,.md h5.md-h{font-size:.98em;color:var(--primary)}
.md ul,.md ol{margin:.5em 0;padding-left:1.4em}.md li{margin:.28em 0}.md li::marker{color:var(--primary)}
.md ul ul,.md ol ol,.md ul ol,.md ol ul{margin:.25em 0}
.md blockquote{margin:.7em 0;padding:.5em .9em;border-left:3px solid var(--primary);background:var(--primary-soft);border-radius:0 10px 10px 0;color:var(--text)}
.md hr{border:0;border-top:1px solid var(--line);margin:1em 0}
.md code{background:var(--panel2);padding:1px 6px;border-radius:5px;font:.88em ui-monospace,Consolas,"Cascadia Mono",monospace}
.md a{color:var(--primary);text-decoration:underline;text-underline-offset:2px}
.cb{margin:.7em 0;border-radius:12px;overflow:hidden;background:#0f172a;color:#e5e9f5;border:1px solid rgba(255,255,255,.06)}
.cb-h{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:rgba(255,255,255,.06);font-size:.74rem;text-transform:uppercase;letter-spacing:.06em;color:#9fb0d0}
.cb-copy,.md-copy{border:0;background:transparent;color:inherit;font:600 .74rem system-ui,sans-serif;cursor:pointer;padding:2px 8px;border-radius:6px;text-transform:none;letter-spacing:0}
.cb-copy:hover,.md-copy:hover{background:rgba(127,127,127,.2)}
.cb pre{margin:0;padding:12px 14px;overflow:auto}.cb pre code{background:none;padding:0;color:inherit;font:.86rem/1.6 ui-monospace,Consolas,"Cascadia Mono",monospace;white-space:pre}
.md-tbl{overflow-x:auto;margin:.7em 0;border:1px solid var(--line);border-radius:10px}
.md-tbl table{border-collapse:collapse;width:100%;font-size:.9em}.md-tbl th,.md-tbl td{padding:7px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.md-tbl th{background:var(--panel2);font-weight:650;white-space:nowrap}.md-tbl tr:last-child td{border-bottom:0}
.mj-d{display:block;margin:.7em 0;padding:.4em .2em;overflow-x:auto;overflow-y:hidden;text-align:center}
.mj:not([data-done]),.mj[data-done=err]{font:.88em ui-monospace,Consolas,monospace;background:var(--panel2);padding:1px 6px;border-radius:5px;white-space:pre-wrap}
.mj-d:not([data-done]),.mj-d[data-done=err]{padding:.6em .8em;text-align:left}
.katex{font-size:1.06em}.katex-display{margin:0}
.dk-a{padding:10px 14px 12px}.dk-who{display:flex;align-items:center;gap:6px;margin:-2px 0 6px;font-size:.8rem;color:var(--primary)}.dk-who svg{width:14px;height:14px}.dk-who b{font-weight:700}.dk-who .md-copy{margin-left:auto;color:var(--muted)}
.ai-bub .md{font-size:.95rem}
.qtools .btn,.qtop .btn{white-space:nowrap}
`);
console.log(miss.length ? 'THIẾU: ' + miss.join(', ') : 'ok');
