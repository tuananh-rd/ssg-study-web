// Minimal Chrome DevTools Protocol client (no deps; Node 24 has global WebSocket)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function launch(port, profile, extra = []) {
  fs.mkdirSync(profile, { recursive: true });
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--hide-scrollbars', '--force-color-profile=srgb', '--no-first-run', '--no-default-browser-check',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', ...extra, 'about:blank'],
    { stdio: 'ignore' });
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/json/version`); if (r.ok) break; } catch { }
    await sleep(150);
  }
  return { proc, port, close: () => { try { proc.kill(); } catch { } } };
}

export async function newPage(port, url = 'about:blank') {
  const r = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const t = await r.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    else if (m.method) listeners.forEach(f => f(m));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const page = {
    send,
    on: f => listeners.push(f),
    async eval(expr, awaitPromise = true) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true });
      if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return r.result.value;
    },
    async goto(u) {
      // luôn tải lại trang thật (kể cả khi chỉ khác #hash)
      await send('Page.navigate', { url: 'about:blank' }); await sleep(100);
      const done = new Promise(res => { const f = m => { if (m.method === 'Page.loadEventFired') res(); }; listeners.push(f); setTimeout(res, 8000); });
      await send('Page.navigate', { url: u }); await done;
    },
    async shot(file, opts = {}) {
      const r = await send('Page.captureScreenshot', { format: opts.format || 'png', quality: opts.quality, captureBeyondViewport: false, fromSurface: true });
      if (file) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.from(r.data, 'base64')); }
      return r.data;
    },
    close() { ws.close(); }
  };
  await send('Page.enable'); await send('Runtime.enable');
  return page;
}
