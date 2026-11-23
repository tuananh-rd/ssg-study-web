import fs from 'node:fs';
const W = 'D:/Downloads/SSG105 app/web/'; const miss = [];
function patch(file, pairs) {
  let a = fs.readFileSync(W + file, 'utf8');
  for (const [o, n] of pairs) { if (!a.includes(o)) { miss.push(file + ': ' + o.slice(0, 60)); continue; } a = a.replace(o, () => n); }
  fs.writeFileSync(W + file, a);
}
// Bộ theo dõi độc lập với chat.js: nhận lệnh "tải lại" từ quản trị viên + tự báo khi web có bản mới.
const LIVE = String.raw`(function(){if(window.__live)return;window.__live=1;var BASE=__BASE__,seen=null,ask=0,t=null;
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function banner(title,msg,secs){if(document.getElementById('wc-rl'))return;var left=secs,b=document.createElement('div');b.id='wc-rl';b.setAttribute('role','alertdialog');
b.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:300;max-width:min(460px,calc(100vw - 24px));background:var(--panel,#fff);color:var(--text,#111);border:1px solid var(--primary,#3b5bdb);border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.35);padding:12px 16px;font:inherit;font-size:.92rem';
b.innerHTML='<b>'+esc(title)+'</b><div style="color:var(--muted,#667);margin:4px 0 10px">'+(msg?esc(msg)+' · ':'')+'Tiến độ làm bài đã được lưu. Tự tải lại sau <span id="wc-rlc">'+left+'</span> giây.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" id="wc-rln" style="border:1px solid var(--line,#ddd);background:var(--panel2,#f6f7fb);color:inherit;border-radius:9px;padding:7px 14px;cursor:pointer;font:600 .86rem system-ui">Hoãn</button><button type="button" id="wc-rly" style="border:0;background:var(--primary,#3b5bdb);color:var(--primary-ink,var(--ink,#fff));border-radius:9px;padding:7px 14px;cursor:pointer;font:700 .86rem system-ui">Tải lại ngay</button></div>';
document.body.appendChild(b);var iv=setInterval(function(){left--;var c=document.getElementById('wc-rlc');if(c)c.textContent=left;if(left<=0){clearInterval(iv);location.reload();}},1000);
document.getElementById('wc-rly').onclick=function(){clearInterval(iv);location.reload();};document.getElementById('wc-rln').onclick=function(){clearInterval(iv);b.remove();};}
function tick(){fetch('/api/live',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
 if(!j)return;
 if(seen===null){seen={rl:+j.rl||0,v:BASE||j.v};}
 else if((+j.rl||0)>seen.rl){seen.rl=+j.rl;banner('Quản trị viên yêu cầu tải lại trang',j.rlmsg||'',8);}
 else if(j.v&&seen.v&&j.v!==seen.v&&!ask){ask=1;banner('Web vừa có bản cập nhật mới','',30);}
}).catch(function(){}).then(function(){clearTimeout(t);t=setTimeout(tick,document.visibilityState==='visible'?6000:20000);});}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){clearTimeout(t);t=setTimeout(tick,300);}});
tick();})();`;
fs.writeFileSync(W + 'scripts/live-src.js', LIVE);
fs.writeFileSync(W + 'functions/_version.js', `export const VERSION = '${Date.now()}';\n`);
fs.writeFileSync(W + 'functions/_live.js', `// Bộ theo dõi nhúng thẳng vào mọi trang (không phụ thuộc file tĩnh bị lưu đệm): lệnh tải lại của quản trị viên + báo bản mới.
import { VERSION } from './_version.js';
const SRC = ${JSON.stringify(LIVE)};
export const liveTag = () => '<script>' + SRC.replace('__BASE__', JSON.stringify(VERSION)) + '</script>';
export { VERSION };
`);
patch('functions/_serve.js', [
  [`import { logEvent } from './_log.js';`, `import { logEvent } from './_log.js';
import { liveTag } from './_live.js';`],
  [`'<script src="/chat.js?v=1" defer></script>`, `liveTag() + '<script src="/chat.js?v=1" defer></script>`],
]);
patch('functions/api/[[path]].js', [
  [`import { handleChat } from '../_chat.js';`, `import { handleChat } from '../_chat.js';
import { VERSION } from '../_live.js';`],
  [`    if (a === 'chat') return handleChat(`, `    if (a === 'live' && m === 'GET') {
      const rl = await env.DB.prepare('SELECT id,msg FROM reload_cmds WHERE ts>? AND (user_id IS NULL OR user_id=?) ORDER BY id DESC LIMIT 1').bind(Date.now() - 600000, user.id).first();
      return json({ v: VERSION, rl: rl ? rl.id : 0, rlmsg: rl ? rl.msg || '' : '' });
    }
    if (a === 'chat') return handleChat(`],
]);
// trang chủ (HTML tĩnh): nhúng cùng bộ theo dõi, mốc phiên bản = lần gọi đầu tiên
patch('public/index.html', [['</body>', '<script>' + LIVE.replace('__BASE__', 'null') + '</script></body>']]);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
console.log('ok');
