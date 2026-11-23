// Kiểm tra cú pháp JS trong các <script> của file HTML: node check-html.mjs file.html
import fs from 'node:fs';
const h = fs.readFileSync(process.argv[2], 'utf8');
const re = /<script[^>]*>([\s\S]*?)<\/script>/g; let m, n = 0, bad = 0;
while ((m = re.exec(h))) { n++; try { new Function(m[1]); } catch (e) { bad++; console.log('SYNTAX ERROR in script #' + n + ':', e.message); } }
console.log(process.argv[2].split(/[\\/]/).pop(), '—', n, 'script,', bad ? bad + ' lỗi' : 'cú pháp OK');
process.exit(bad ? 1 : 0);
