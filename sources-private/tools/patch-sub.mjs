import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/app.js'; let a = fs.readFileSync(f, 'utf8'); const miss = [];
const rep = (o, n) => { if (!a.includes(o)) miss.push(o.slice(0, 50)); else a = a.replace(o, () => n); };
rep(String.raw`if(/\$[^$]+\$|[λσθαβμεΔ][0-9]/.test(n.textContent))ns.push(n);}`, String.raw`if(/\$[^$]+\$|[λσθαβμεΔ][0-9]|[A-Za-z]_[A-Za-z0-9]/.test(n.textContent))ns.push(n);}`);
rep(String.raw`re=/\$\$([^$]+)\$\$|\$([^$\n]+)\$|([λσθαβμεΔ])([0-9])/g`, String.raw`re=/\$\$([^$]+)\$\$|\$([^$\n]+)\$|([λσθαβμεΔ])([0-9])|(?<![A-Za-z0-9_])([A-Za-z])_([A-Za-z0-9]{1,2})(?![A-Za-z0-9_])/g`);
rep(`if(m[3]){var sp=document.createElement('span');sp.className='gsub';sp.innerHTML='';sp.appendChild(document.createTextNode(m[3]));var sb=document.createElement('sub');sb.textContent=m[4];sp.appendChild(sb);frag.appendChild(sp);}`,
  `if(m[3]||m[5]){var sp=document.createElement('span');sp.className='gsub';sp.appendChild(document.createTextNode(m[3]||m[5]));var sb=document.createElement('sub');sb.textContent=m[4]||m[6];sp.appendChild(sb);frag.appendChild(sp);}`);
// gộp các đoạn chỉ chứa khung hình liền nhau
rep(`  // 3. văn bản:`, `  d.querySelectorAll('p').forEach(function(p){var only=p.querySelector('.fig-ph')&&!p.textContent.replace('Hình minh hoạ trong slide gốc','').trim();if(!only)return;var pv=p.previousElementSibling;if(pv&&pv.classList.contains('fig-only')){var c=pv.querySelector('.fig-n'),k=(+pv.dataset.n||1)+1;pv.dataset.n=k;c.textContent=k+' hình';p.parentNode.removeChild(p);}else{p.classList.add('fig-only');p.dataset.n=1;var sp=document.createElement('b');sp.className='fig-n';p.querySelector('.fig-ph').appendChild(sp);}});
  // 3. văn bản:`);
if (miss.length) { console.log('THIẾU', miss); process.exit(1); }
fs.writeFileSync(f, a); console.log('ok');
