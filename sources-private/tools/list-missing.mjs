import fs from 'node:fs';
const SP='D:/Downloads/SSG105 app/sources-private/';
const kinds=[['explain','explain-in-','explain-out-',5],['bank','translate-in-','translate-out-',6],['recall','translate-recall-in-','translate-recall-out-',7]];
for(const [kind,i,o,n] of kinds)for(const k of ['ssg','dap','ail','cpv']){
  const inn=fs.readdirSync(SP+i+k).filter(f=>/\.json$/.test(f)).sort();
  const miss=inn.filter(f=>!fs.existsSync(SP+o+k+'/'+f)).map(f=>f.replace(k+'-','').replace('.json',''));
  const groups=[];for(let x=0;x<miss.length;x+=n)groups.push(miss.slice(x,x+n).join(','));
  console.log(kind,k,'thiếu',miss.length,'|',groups.join(' ; '));
}
