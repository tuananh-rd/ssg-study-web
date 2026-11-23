// Chuyển bản xem cơ bản (mobilebasic) của Google Docs thành văn bản có đánh dấu tiêu đề: src-*-theory.txt
import fs from 'node:fs'; import path from 'node:path';
const DIR = process.argv[2];
const dec = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
for (const k of ['dap', 'ail', 'cpv']) {
  const t = fs.readFileSync(path.join(DIR, `src-${k}-theory.html`), 'utf8').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '');
  const heads = [...t.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map(m => `h${m[1]}:${dec(m[2].replace(/<[^>]+>/g, '')).trim().slice(0, 60)}`).filter(x => x.length > 4);
  const txt = dec(t
    .replace(/<h([1-6])[^>]*>/g, (m, n) => '\n' + '#'.repeat(+n) + ' ')
    .replace(/<li[^>]*>/g, '\n- ').replace(/<\/(p|h[1-6]|tr|div|ul|ol)>/g, '\n').replace(/<\/t[dh]>/g, ' | ').replace(/<br\s*\/?>/g, '\n')
    .replace(/<img[^>]*>/g, '\n[IMG]\n').replace(/<[^>]+>/g, ''))
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
  fs.writeFileSync(path.join(DIR, `src-${k}-theory.txt`), txt);
  console.log(`== ${k}: chars ${txt.length}, imgs ${(t.match(/<img/g) || []).length}, tables ${(t.match(/<table/g) || []).length}, headings ${heads.length}`);
  console.log(heads.slice(0, 40).join(' | '));
}
