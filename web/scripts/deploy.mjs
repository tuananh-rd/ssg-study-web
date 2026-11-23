// Deploy có đóng dấu phiên bản: người đang mở web sẽ được báo "có bản cập nhật mới". Chạy: node scripts/deploy.mjs
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.writeFileSync(path.join(W, 'functions', '_version.js'), `export const VERSION = '${Date.now()}';\n`);
execSync('npx wrangler pages deploy public --project-name ssg-study --branch main --commit-dirty=true', { cwd: W, stdio: 'inherit' });
