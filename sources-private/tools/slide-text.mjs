// Tách chữ của từng slide trong src-cpv-slides.html (bản htmlpresent) → cpv-slide-text.json {slide: text}
import fs from 'node:fs'; import path from 'node:path';
const DIR = process.argv[2];
const h = fs.readFileSync(path.join(DIR, 'src-cpv-slides.html'), 'utf8')
  .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '')
  .replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|div|span)>/g, '$&\n').replace(/<[^>]+>/g, '')
  .replace(/&#8203;/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/�/g, '');
const parts = h.split(/(\d+) of 327/);
const out = {};
for (let i = 1; i < parts.length; i += 2) out[+parts[i]] = parts[i + 1].replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
fs.writeFileSync(path.join(DIR, 'cpv-slide-text.json'), JSON.stringify(out, null, 1));
console.log('slides', Object.keys(out).length, '| sample 14:', JSON.stringify(out[14]), '| 48:', JSON.stringify(out[48]).slice(0, 120));
