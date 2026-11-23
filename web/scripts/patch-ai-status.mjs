import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const f = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'functions/api/[[path]].js'); let c = fs.readFileSync(f, 'utf8');
const a = `      if (b === 'users' && !c && m === 'GET') {`;
const b = `      if (b === 'ai-status' && m === 'GET') {   // chẩn đoán cấu hình chatbot (chỉ tên biến và số lượng, không lộ giá trị)
        let n = -1, kinds = ''; try { const p = JSON.parse(env.AI_CONFIGS || '[]'); n = Array.isArray(p) ? p.length : -2; kinds = Array.isArray(p) ? p.map(x => (x.name || '?') + ':' + (x.base ? 'base' : '-') + (x.key ? '+key' : '-') + (x.model ? '+model' : '-')).join(',') : typeof p; } catch (e) { kinds = 'parse-error ' + e.message.slice(0, 40); }
        return json({ envNames: Object.keys(env), hasAiConfigs: typeof env.AI_CONFIGS, length: (env.AI_CONFIGS || '').length, count: n, kinds });
      }
` + a;
if (!c.includes(a)) { console.log('MISSING'); process.exit(1); } c = c.replace(a, () => b); fs.writeFileSync(f, c); console.log('ok');
