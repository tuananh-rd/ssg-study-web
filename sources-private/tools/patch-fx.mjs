import fs from 'node:fs';
const R = 'D:/Downloads/SSG105 app/', T = R + 'sources-private/tools/';
let a = fs.readFileSync(R + 'src/app.js', 'utf8'), miss = [];
function rep(o, n) { if (!a.includes(o)) { miss.push(o.slice(0, 50)); return; } a = a.replace(o, () => n); }
rep(`var FOCUS_SCENES=['Sương xanh','Hoàng hôn dịu','Đêm tĩnh'];`, `var FOCUS_SCENES=['Sương xanh','Hoàng hôn dịu','Đêm tĩnh','Anh đào rơi','Rừng lá','Đêm đom đóm'];`);
rep(`function fcScene(){for(var i=0;i<3;i++)document.body.classList.toggle('fm-'+i,FC.on&&FC.scene===i);}`, `function fcScene(){for(var i=0;i<FOCUS_SCENES.length;i++)document.body.classList.toggle('fm-'+i,FC.on&&FC.scene===i);if(FC.on&&FX_KIND[FC.scene])fxStart(FX_KIND[FC.scene]);else fxStop();}`);
rep(`FC.scene=(FC.scene+1)%3;`, `FC.scene=(FC.scene+1)%FOCUS_SCENES.length;`);
rep(`var FOCUS_PRESETS=`, fs.readFileSync(T + 'fx-mod.js', 'utf8') + `\nvar FOCUS_PRESETS=`);
if (!miss.length) {
  fs.writeFileSync(R + 'src/app.js', a);
  fs.appendFileSync(R + 'src/style.css', fs.readFileSync(T + 'fx.css', 'utf8'));
}
console.log(miss.length ? 'THIẾU ' + miss.join(' | ') : 'ok');
