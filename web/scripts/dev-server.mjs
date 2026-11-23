// Máy chủ thử nghiệm cục bộ (không cần workerd): chạy đúng code trong functions/ với D1 giả lập bằng node:sqlite.
// node scripts/dev-server.mjs [port] [dbfile]   — dbfile mặc định :memory:
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
const W = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +(process.argv[2] || 8788), DBF = process.argv[3] || ':memory:';

const sqlite = new DatabaseSync(DBF); sqlite.exec('PRAGMA foreign_keys = ON;'); sqlite.exec(fs.readFileSync(path.join(W, 'schema.sql'), 'utf8'));
class Stmt {
  constructor(sql) { this.sql = sql; this.args = []; }
  bind(...a) { this.args = a; return this; }
  _st() { return sqlite.prepare(this.sql); }
  async first() { return this._st().get(...this.args) ?? null; }
  async all() { return { results: this._st().all(...this.args) }; }
  async run() { const r = this._st().run(...this.args); return { success: true, meta: { changes: r.changes } }; }
}
const DB = { prepare: sql => new Stmt(sql), async batch(stmts) { sqlite.exec('BEGIN'); try { const out = []; for (const s of stmts) out.push(await s.run()); sqlite.exec('COMMIT'); return out; } catch (e) { sqlite.exec('ROLLBACK'); throw e; } } };
const env = { DB, AI_CONFIGS: process.env.AI_CONFIGS || '', AI_LIMIT_CHAT: process.env.AI_LIMIT_CHAT || '', AI_LIMIT_TR: process.env.AI_LIMIT_TR || '' };
if (process.env.SEED_ADMIN_SQL) sqlite.exec(fs.readFileSync(process.env.SEED_ADMIN_SQL, 'utf8'));

const load = f => import(pathToFileURL(path.join(W, 'functions', f)).href);
const api = await load('api/[[path]].js'), app = await load('app/[id].js'), learn = await load('learn/[id].js');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const chunks = []; for await (const c of req) chunks.push(c); const body = Buffer.concat(chunks);
    const headers = new Headers(); for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
    headers.set('cf-connecting-ip', req.headers['x-test-ip'] || '127.0.0.1');
    const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body, redirect: 'manual' });
    let r = null; const seg = url.pathname.split('/').filter(Boolean);
    if (seg[0] === 'api') r = await api.onRequest({ request, env, params: { path: seg.slice(1) } });
    else if (seg[0] === 'app' && seg.length === 2 && req.method === 'GET') r = await app.onRequestGet({ request, env, params: { id: seg[1] } });
    else if (seg[0] === 'learn' && seg.length === 2 && req.method === 'GET') r = await learn.onRequestGet({ request, env, params: { id: seg[1] } });
    else {
      const f = path.join(W, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
      if (f.startsWith(path.join(W, 'public')) && fs.existsSync(f) && fs.statSync(f).isFile()) r = new Response(fs.readFileSync(f), { headers: { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' } });
      else r = new Response('Not found', { status: 404 });
    }
    const out = {}; r.headers.forEach((v, k) => { out[k] = v; }); const sc = r.headers.getSetCookie?.(); if (sc && sc.length) out['set-cookie'] = sc;
    res.writeHead(r.status, out); res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) { console.error(e); res.writeHead(500); res.end('dev-server error: ' + e.message); }
}).listen(PORT, () => console.log(`dev-server http://localhost:${PORT}  (db: ${DBF})`));
