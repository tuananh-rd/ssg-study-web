import fs from 'node:fs';
const a = fs.readFileSync('D:/Downloads/SSG105 app/src/app.js', 'utf8');
const i0 = a.indexOf("var BOT_NAMES"), i1 = a.indexOf("var BOT_LV");
const code = a.slice(i0, i1);
const DU = { role: 'host', s: null };
const mk = (id, name, score, bot, steal) => ({ id, name, score, connected: true, isBot: bot, steal });
let steals = 0, N = 2000, bad = 0;
const f = new Function('DU', code + '; return {duelBotSteal, BOT_NAMES, BOT_FIXED};')(DU);
console.log(f.BOT_NAMES.join(','), JSON.stringify(f.BOT_FIXED));
for (let k = 0; k < N; k++) {
  DU.s = { players: [mk('me', 'Tester', 300, false), mk('b1', 'Trung', 200, true, false), mk('b2', 'Anh Vỹ', 100, true, true)] };
  const tot0 = 600; f.duelBotSteal();
  const s = DU.s, tot = s.players.reduce((x, p) => x + p.score, 0);
  if (tot !== tot0) bad++;
  if (s.steal) { steals++; if (s.steal.by !== 'b2' || s.steal.from === 'b2' || s.steal.amt < 50 || s.steal.amt > 150) bad++; }
}
console.log('tỉ lệ cướp', (steals / N * 100).toFixed(1) + '%', 'lỗi', bad);
