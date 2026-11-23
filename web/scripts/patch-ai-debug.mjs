import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const f = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'functions/_ai.js'); let c = fs.readFileSync(f, 'utf8');
const R = [
  [`  let lastStatus = 0;\n`, `  let lastStatus = 0; const dbg = [];\n`],
  [`      lastStatus = up.status; console.error('ai upstream', c.name || c.base, up.status);\n    } catch (e) { console.error('ai upstream error', c.name || c.base, e && e.message); }`,
    `      lastStatus = up.status; let body = ''; try { body = (await up.text()).slice(0, 160); } catch { }\n      dbg.push((c.name || 'cfg') + ': HTTP ' + up.status + ' ' + body); console.error('ai upstream', c.name || c.base, up.status, body);\n    } catch (e) { dbg.push((c.name || 'cfg') + ': ' + (e && e.name) + ' ' + (e && e.message)); console.error('ai upstream error', c.name || c.base, e && e.message); }`],
  [`  return json({ message: lastStatus === 429 ? 'Trợ giảng AI đang quá tải, thử lại sau ít phút.' : 'Trợ giảng AI đang bận, thử lại sau ít phút.' }, 503);`,
    `  const base = lastStatus === 429 ? 'Trợ giảng AI đang quá tải, thử lại sau ít phút.' : 'Trợ giảng AI đang bận, thử lại sau ít phút.';\n  return json({ message: base + (user.role === 'admin' ? ' [chẩn đoán admin] ' + dbg.join(' | ') : '') }, 503);`],
];
for (const [a, b] of R) { if (!c.includes(a)) { console.log('MISSING', a.slice(0, 70)); process.exit(1); } c = c.replace(a, () => b); }
fs.writeFileSync(f, c); console.log('ok');
