// Dựng cpv-slides-real/slide-NNN.png theo SỐ SLIDE THẬT.
// Ảnh cũ: nhãn s ≤ 48 → thật s ; nhãn 57..325 → thật s+2 ; nhãn 49..56 bỏ ; 326,327 (chụp tay) bỏ vì trùng.
// Slide thật 49..58 lấy từ src-cpv-slides-fix49-58.json (chụp lại có kiểm bằng nhãn "Slide N of 327").
import { launch, newPage, sleep } from './cdp.mjs';
import fs from 'node:fs'; import path from 'node:path';
const DIR = process.argv[2], OLD = path.join(DIR, 'cpv-slides-png'), OUT = path.join(DIR, 'cpv-slides-real');
fs.mkdirSync(OUT, { recursive: true });
const name = n => `slide-${String(n).padStart(3, '0')}.png`;
let copied = 0;
for (let s = 9; s <= 325; s++) {
  const real = s <= 48 ? s : (s >= 57 ? s + 2 : null);
  if (real == null) continue;
  fs.copyFileSync(path.join(OLD, name(s)), path.join(OUT, name(real))); copied++;
}
const br = await launch(9371, path.join(DIR, '.prof-render2'));
const pg = await newPage(br.port);
await pg.send('Emulation.setDeviceMetricsOverride', { width: 1641, height: 923, deviceScaleFactor: 1, mobile: false });
await pg.goto('about:blank');
const fix = JSON.parse(fs.readFileSync(path.join(DIR, 'src-cpv-slides-fix49-58.json'), 'utf8'));
for (const k of Object.keys(fix)) {
  await pg.eval(`(() => {
    document.documentElement.style.background = '#fff'; document.body.style.margin = '0';
    document.body.innerHTML = ${JSON.stringify(fix[k])};
    const s = document.querySelector('svg'); s.setAttribute('width', '1641'); s.setAttribute('height', '923');
    return Promise.all([...document.querySelectorAll('image')].map(i => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = i.getAttribute('href'); })));
  })()`);
  await sleep(60);
  await pg.shot(path.join(OUT, name(k)));
}
br.close();
const have = fs.readdirSync(OUT).filter(f => f.endsWith('.png')).length;
const missing = []; for (let s = 9; s <= 327; s++) if (!fs.existsSync(path.join(OUT, name(s)))) missing.push(s);
console.log('copied', copied, '| rendered', Object.keys(fix).length, '| total', have, '| missing', missing.join(',') || 'none');
process.exit(0);
