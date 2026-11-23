import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/src/ai.js'; let c = fs.readFileSync(f, 'utf8');
const R = [
  [`autoCheck:u.autoCheck!==false,autoTranslate:u.autoTranslate!==false};},set:function(){}};`, `autoCheck:false,autoTranslate:u.autoTranslate!==false};},set:function(){}};`],
  [`esc(aiModelName())+(aiProvider()==='anthropic'?'':' · bên thứ 3')+`, `(AI_SRV?'Hỏi đáp riêng cho môn này':esc(aiModelName())+(aiProvider()==='anthropic'?'':' · bên thứ 3'))+`],
];
for (const [a, b] of R) { if (!c.includes(a)) console.log('MISSING', a.slice(0, 80)); else c = c.replace(a, () => b); }
fs.writeFileSync(f, c); console.log('ok');
