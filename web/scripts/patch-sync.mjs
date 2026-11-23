import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const f = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'functions/_serve.js'); let c = fs.readFileSync(f, 'utf8');
const a = `var r=JSON.parse(x.responseText);serverHas=!!r.data;var stamp=+ls.getItem(K+':sync')||0;if(r.data&&r.updated_at>stamp){`;
const b = `var r=JSON.parse(x.responseText);var okFmt=false;try{okFmt=JSON.parse(r.data).version===2;}catch(e){}serverHas=!!r.data&&okFmt;var stamp=+ls.getItem(K+':sync')||0;if(okFmt&&r.updated_at>stamp){`;
if (!c.includes(a)) { console.log('MISSING'); process.exit(1); } c = c.replace(a, () => b); fs.writeFileSync(f, c); console.log('sync: chỉ nhận tiến độ version 2');
