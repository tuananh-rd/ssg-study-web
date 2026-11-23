// Gỡ endpoint chẩn đoán tạm (/api/ai-status) và dòng chẩn đoán admin khỏi mã API.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const f = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'functions/api/[[path]].js'); let c = fs.readFileSync(f, 'utf8');
const before = c.length;
c = c.replace(/    if \(a === 'ai-status' && m === 'GET'\) \{[\s\S]*?\n    \}\n/, '');
c = c.replace(/      if \(b === 'ai-status' && m === 'GET'\) \{[\s\S]*?\n      \}\n/, '');
fs.writeFileSync(f, c); console.log('removed', before - c.length, 'bytes; còn ai-status:', c.includes('ai-status'));
