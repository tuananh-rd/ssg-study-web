// Chuyển src-*-theory.html (Google Docs mobilebasic) → lessons-{dap,ail,cpv}.json bằng DOM của Chrome headless.
// Mô-đun = h1 (nếu chỉ có 1 h1 thì mô-đun = h2); mục = tiêu đề cấp kế tiếp. Giữ in đậm/nghiêng/code, danh sách, bảng, đoạn code.
import { launch, newPage } from './cdp.mjs';
import fs from 'node:fs'; import path from 'node:path';
const DIR = process.argv[2];
const SUBJ = { dap: 'DAP391m', ail: 'AIL303m', cpv: 'CPV301' };
const br = await launch(9380, path.join(DIR, '.prof-lessons'), ['--allow-file-access-from-files']);
const pg = await newPage(br.port);
const walker = `(() => {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const root = document.querySelector('.doc-content') || document.body;
  function inl(n) {
    if (n.nodeType === 3) return esc(n.textContent);
    if (n.nodeType !== 1) return '';
    const tag = n.tagName.toLowerCase();
    if (['script','style'].includes(tag)) return '';
    if (tag === 'br') return '<br>';
    if (tag === 'img') return '<span class="img-ph">[hình minh hoạ]</span>';
    if (tag === 'a') { const h = n.getAttribute('href') || ''; const m = h.match(/[?&]q=([^&]+)/); const u = m ? decodeURIComponent(m[1]) : h; const t = [...n.childNodes].map(inl).join(''); return /^https?:/.test(u) ? '<a href="'+u.replace(/"/g,'&quot;')+'" target="_blank" rel="noopener">'+t+'</a>' : t; }
    let t = [...n.childNodes].map(inl).join('');
    if (!t.trim()) return t;
    const cs = getComputedStyle(n);
    const bold = parseInt(cs.fontWeight) >= 600, ital = cs.fontStyle === 'italic', mono = /consol|courier|mono/i.test(cs.fontFamily);
    if (mono) t = '<code>'+t+'</code>'; if (bold && !mono) t = '<b>'+t+'</b>'; if (ital) t = '<i>'+t+'</i>';
    return t;
  }
  function list(n) { const ord = n.tagName.toLowerCase()==='ol'; let h=''; for (const li of n.children) { if (li.tagName.toLowerCase()!=='li') continue; let inner=''; for (const c of li.childNodes) { const tg=(c.tagName||'').toLowerCase(); inner += (tg==='ul'||tg==='ol') ? list(c) : inl(c); } h += '<li>'+inner.replace(/<br>$/,'')+'</li>'; } return '<'+(ord?'ol':'ul')+'>'+h+'</'+(ord?'ol':'ul')+'>'; }
  function table(n) { let h='<table>'; let first=true; for (const tr of n.querySelectorAll('tr')) { const cells=[...tr.children].map(td=>{const t=[...td.childNodes].map(c=>{const tg=(c.tagName||'').toLowerCase();return (tg==='ul'||tg==='ol')?list(c):(tg==='p'||tg==='div')?'<div>'+inl(c)+'</div>':inl(c);}).join('');return (first?'<th>':'<td>')+t+(first?'</th>':'</td>');}); h+='<tr>'+cells.join('')+'</tr>'; first=false; } return h+'</table>'; }
  const out = []; // {t:'h',l,txt} | {t:'b',html}
  (function go(n){ for (const c of n.children) { const tag=c.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) { const txt=c.textContent.replace(/\\s+/g,' ').trim(); if (txt) out.push({t:'h',l:+tag[1],txt}); }
    else if (tag==='p') { const h=inl(c).replace(/(<br>)+$/,'').trim(); if (h.replace(/<[^>]+>|&nbsp;|\\s/g,'')) out.push({t:'b',html:'<p>'+h+'</p>'}); }
    else if (tag==='ul'||tag==='ol') {
      // Google Docs hay bọc tiêu đề trong <li>: tách tiêu đề ra, gom các <li> thường thành danh sách
      let group=[]; const flush=()=>{ if(group.length){ const w=document.createElement(tag); group.forEach(g=>w.appendChild(g.cloneNode(true))); out.push({t:'b',html:list(w)}); group=[]; } };
      for (const li of c.children) {
        const hd = li.querySelector(':scope > h1,:scope > h2,:scope > h3,:scope > h4,:scope > h5,:scope > h6');
        if (hd) { flush(); const txt=hd.textContent.replace(/\\s+/g,' ').trim(); if (txt) out.push({t:'h',l:+hd.tagName[1],txt}); const rest=document.createElement('div'); [...li.children].forEach(x=>{ if(x!==hd) rest.appendChild(x.cloneNode(true)); }); go(rest); }
        else group.push(li);
      }
      flush();
    }
    else if (tag==='table') out.push({t:'b',html:table(c)});
    else if (tag==='pre') out.push({t:'b',html:'<pre><code>'+esc(c.textContent)+'</code></pre>'});
    else if (['div','section','body'].includes(tag)) go(c);
  }})(root);
  return out;
})()`;
for (const k of Object.keys(SUBJ)) {
  await pg.goto('file:///' + path.join(DIR, `src-${k}-theory.html`).replace(/\\/g, '/'));
  const items = await pg.eval(walker);
  // bỏ phần quảng cáo/đầu trang của người bán trước tiêu đề đầu tiên
  const firstH = items.findIndex(x => x.t === 'h' && x.l <= 2 && !/vip|top 1|FU/i.test(x.txt));
  const body = items.slice(Math.max(0, firstH));
  const h1s = body.filter(x => x.t === 'h' && x.l === 1).length;
  const modLevel = h1s >= 2 ? 1 : 2, secLevel = modLevel + 1;
  const mods = []; let mod = null, sec = null, pre = [];
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const newMod = t => { mod = { id: 'm' + (mods.length + 1), title: t, sections: [] }; mods.push(mod); sec = null; };
  const newSec = t => { sec = { id: mod.id.slice(1) + '.' + (mod.sections.length + 1), t, h: '' }; mod.sections.push(sec); };
  for (const it of body) {
    if (it.t === 'h') {
      if (it.l <= modLevel) { newMod(it.txt.replace(/^\d+\.\s*/, '')); }
      else if (it.l === secLevel) { if (!mod) newMod('Tổng quan'); newSec(it.txt.replace(/^\d+(\.\d+)*\.?\s*/, '')); }
      else { if (!mod) newMod('Tổng quan'); if (!sec) newSec('Nội dung'); sec.h += `<h4>${it.txt}</h4>`; }
    } else { if (!mod) newMod('Tổng quan'); if (!sec) newSec('Tổng quan'); sec.h += it.html; }
  }
  const keep = mods.filter(m => m.sections.some(s => s.h.replace(/<[^>]+>|\s/g, '').length > 20));
  keep.forEach((m, i) => { m.id = 'm' + (i + 1); m.sections.forEach((s, j) => s.id = (i + 1) + '.' + (j + 1)); m.sections = m.sections.filter(s => s.h.replace(/<[^>]+>|\s/g, '').length > 0); });
  const chars = keep.reduce((a, m) => a + m.sections.reduce((b, s) => b + s.h.length, 0), 0);
  fs.writeFileSync(path.join(DIR, `lessons-${k}.json`), JSON.stringify({ subject: SUBJ[k], modules: keep }, null, 1));
  console.log(`${SUBJ[k]}: modLevel h${modLevel}, ${keep.length} chương, ${keep.reduce((a, m) => a + m.sections.length, 0)} mục, ${(chars / 1024).toFixed(0)} KB`);
  keep.forEach(m => console.log('  ' + m.id + ' ' + m.title + ' (' + m.sections.length + ' mục)'));
}
br.close(); process.exit(0);
