// Dựng các slide SVG (đã nhúng ảnh) thành PNG để OCR.
// node render-slides.mjs <sources-private dir>
import { launch, newPage, sleep } from './cdp.mjs';
import fs from 'node:fs'; import path from 'node:path';
const DIR = process.argv[2], OUT = path.join(DIR, 'cpv-slides-png'); fs.mkdirSync(OUT, { recursive: true });
const br = await launch(9370, path.join(DIR, '.prof-render'));
const pg = await newPage(br.port);
await pg.send('Emulation.setDeviceMetricsOverride', { width: 1641, height: 923, deviceScaleFactor: 1, mobile: false });
await pg.goto('about:blank');
let n = 0;
for (let p = 1; p <= 4; p++) {
  const o = JSON.parse(fs.readFileSync(path.join(DIR, `src-cpv-slides-part${p}.json`), 'utf8'));
  for (const k of Object.keys(o)) {
    await pg.eval(`(() => {
      document.documentElement.style.background = '#fff'; document.body.style.margin = '0';
      document.body.innerHTML = ${JSON.stringify(o[k])};
      const s = document.querySelector('svg'); s.setAttribute('width', '1641'); s.setAttribute('height', '923');
      return Promise.all([...document.querySelectorAll('image')].map(i => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = i.getAttribute('href'); })));
    })()`);
    await sleep(60);
    await pg.shot(path.join(OUT, `slide-${String(k).padStart(3, '0')}.png`));
    n++;
  }
}
console.log('rendered', n);
br.close(); process.exit(0);
