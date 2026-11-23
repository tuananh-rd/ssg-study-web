import fs from 'node:fs';
for (const k of ['ssg', 'dap', 'ail', 'cpv']) {
  const f = 'D:/Downloads/SSG105 app/sources-private/TASK-explain-' + k + '.md';
  let t = fs.readFileSync(f, 'utf8');
  t = t.split('D:DownloadsSSG105 appsources-private').join('D:\\Downloads\\SSG105 app\\sources-private');
  fs.writeFileSync(f, t);
}
console.log(fs.readFileSync('D:/Downloads/SSG105 app/sources-private/TASK-explain-ail.md', 'utf8').split('\n')[2]);
