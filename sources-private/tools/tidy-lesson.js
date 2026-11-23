function tidyLesson(h){
  var d=document.createElement('div');d.innerHTML=h;
  // 1. bảng chứa code → khối code có nhãn ngôn ngữ + nút chép
  d.querySelectorAll('table').forEach(function(t){
    if(!t.querySelector('td')&&t.querySelector('code')){
      t.querySelectorAll('br').forEach(function(b){b.replaceWith('\n');});
      var rows=[].map.call(t.querySelectorAll('tr'),function(r){return r.textContent;}),code=rows.join('\n').replace(/^\n+|\s+$/g,'');
      var lang=/^\s*(SELECT|INSERT|CREATE|UPDATE|DELETE)\b/im.test(code)?'sql':/\b(import|def|print|cv2\.|np\.|pd\.|plt\.|from)\b/.test(code)?'python':'code';
      var w=document.createElement('div');w.className='cb';w.innerHTML='<div class="cb-h"><span></span><button type="button" class="cb-copy">Chép</button></div><pre><code></code></pre>';
      w.querySelector('span').textContent=lang;w.querySelector('code').textContent=code;t.replaceWith(w);
    }else{var w2=document.createElement('div');w2.className='tbl-wrap';t.parentNode.insertBefore(w2,t);w2.appendChild(t);}
  });
  // 2. chỗ hình còn lại: gộp các chỗ liền nhau thành một khung "hình trong tài liệu gốc"
  d.querySelectorAll('.img-ph').forEach(function(x){
    var p=x.previousSibling;while(p&&p.nodeType===3&&!p.textContent.trim())p=p.previousSibling;
    if(p&&p.nodeType===1&&p.classList&&p.classList.contains('fig-ph')){x.remove();return;}
    var f=document.createElement('span');f.className='fig-ph';f.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg><span>Hình minh hoạ trong slide gốc</span>';x.replaceWith(f);
  });
  // 3. văn bản: $…$ → công thức KaTeX; λ1, σ2… → chỉ số dưới
  var tw=document.createTreeWalker(d,NodeFilter.SHOW_TEXT,null),ns=[],n;
  while((n=tw.nextNode())){if(n.parentNode.closest&&n.parentNode.closest('code,pre,.cb,.mj'))continue;if(/\$[^$]+\$|[λσθαβμεΔ][0-9]/.test(n.textContent))ns.push(n);}
  ns.forEach(function(t){
    var s=t.textContent,frag=document.createDocumentFragment(),re=/\$\$([^$]+)\$\$|\$([^$\n]+)\$|([λσθαβμεΔ])([0-9])/g,last=0,m;
    while((m=re.exec(s))){
      if(m.index>last)frag.appendChild(document.createTextNode(s.slice(last,m.index)));
      if(m[3]){var sp=document.createElement('span');sp.className='gsub';sp.innerHTML='';sp.appendChild(document.createTextNode(m[3]));var sb=document.createElement('sub');sb.textContent=m[4];sp.appendChild(sb);frag.appendChild(sp);}
      else{var mj=document.createElement(m[1]?'div':'span');mj.className='mj'+(m[1]?' mj-d':'');mj.setAttribute('data-tex',(m[1]||m[2]).trim());mj.textContent=(m[1]||m[2]).trim();frag.appendChild(mj);}
      last=re.lastIndex;
    }
    if(last<s.length)frag.appendChild(document.createTextNode(s.slice(last)));
    t.parentNode.replaceChild(frag,t);
  });
  // 4. ô ghi chú: đoạn bắt đầu bằng Lưu ý / Note / Mẹo / Ghi nhớ / Chú ý / Ví dụ
  d.querySelectorAll('p,li').forEach(function(p){
    var tx=(p.textContent||'').trim(),m=tx.match(/^(Lưu ý|Note|Chú ý|Cảnh báo|Mẹo|Tip|Ghi nhớ|Ví dụ|Example)\b\s*[:：-]?/i);
    if(!m)return;var k=m[1].toLowerCase(),cls=/lưu ý|note|chú ý|cảnh báo/.test(k)?'warn':/mẹo|tip|ghi nhớ/.test(k)?'tip':'ex';
    if(p.tagName==='P'){p.classList.add('callout','co-'+cls);}else p.classList.add('li-co','co-'+cls);
  });
  // 5. đoạn chỉ gồm một câu in đậm → câu chốt kiến thức
  d.querySelectorAll('p').forEach(function(p){if(p.children.length===1&&/^(B|STRONG)$/.test(p.children[0].tagName)&&p.textContent.trim()===p.children[0].textContent.trim()&&p.textContent.trim().length>12)p.classList.add('kstate');});
  // 6. thuật ngữ đầu mục "Thuật ngữ (…): giải thích" → in đậm phần thuật ngữ
  d.querySelectorAll('li').forEach(function(li){
    var f=li.firstChild;if(!f||f.nodeType!==3)return;var m=f.textContent.match(/^(\s*[^:：.]{2,60}?)([:：])\s/);
    if(!m||/[.!?]/.test(m[1])||m[1].split(/\s+/).length>9)return;
    var b=document.createElement('span');b.className='term';b.textContent=m[1].trim();f.textContent=f.textContent.slice(m[0].length);
    li.insertBefore(document.createTextNode(' '),f);li.insertBefore(document.createTextNode(m[2]),li.firstChild);li.insertBefore(b,li.firstChild);
  });
  return d.innerHTML;
}
