import fs from 'node:fs';
const SP = 'D:/Downloads/SSG105 app/sources-private/';
const kinds = [['explain', 'explain-in-', 'explain-out-'], ['bank', 'translate-in-', 'translate-out-'], ['recall', 'translate-recall-in-', 'translate-recall-out-']];
let bad = 0, ok = 0, missing = [];
for (const [kind, I, O] of kinds) for (const k of ['ssg', 'dap', 'ail', 'cpv']) {
  for (const f of fs.readdirSync(SP + I + k).filter(f => /\.json$/.test(f)).sort()) {
    const op = SP + O + k + '/' + f;
    if (!fs.existsSync(op)) { missing.push(`${kind}:${k}:${f.replace(k + '-', '').replace('.json', '')}`); continue; }
    let o; try { o = JSON.parse(fs.readFileSync(op, 'utf8')); } catch (e) { console.log('JSON LỖI', op, e.message.slice(0, 80)); bad++; continue; }
    const inn = JSON.parse(fs.readFileSync(SP + I + k + '/' + f, 'utf8')); const errs = [];
    for (const q of inn) {
      const v = o[String(q.id)];
      if (v == null) { errs.push('thiếu ' + q.id); continue; }
      if (kind === 'explain' && (typeof v !== 'string' || v.length < 20)) errs.push('lời giải ngắn ' + q.id);
      if (kind === 'bank' && (!v.q || !Array.isArray(v.options) || v.options.length !== q.options.length)) errs.push('options lệch ' + q.id);
      if (kind === 'recall' && (!v.q || !v.correct || !Array.isArray(v.wrong) || v.wrong.length !== 3)) errs.push('recall lệch ' + q.id);
    }
    if (errs.length) { bad++; console.log('SAI', kind, op.replace(SP, ''), errs.slice(0, 4).join('; ')); } else ok++;
  }
}
console.log('file hợp lệ', ok, '| file lỗi', bad, '| còn thiếu', missing.length);
console.log(missing.join(' '));
