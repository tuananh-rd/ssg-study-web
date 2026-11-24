// Upstream giả: báo lại số ảnh và độ dài chữ trong yêu cầu. node scripts/fake-ai-vision.mjs [port]
import http from 'node:http';
const PORT = +(process.argv[2] || 9098);
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  if (!/Bearer FAKEKEY/.test(req.headers.authorization || '')) { res.writeHead(401); return res.end('{"error":"bad key"}'); }
  let j = {}; try { j = JSON.parse(Buffer.concat(chunks).toString()); } catch { }
  const last = [...(j.messages || [])].reverse().find(m => m.role === 'user');
  const parts = Array.isArray(last.content) ? last.content : [{ type: 'text', text: last.content }];
  const imgs = parts.filter(p => p.type === 'image_url').length, text = parts.filter(p => p.type === 'text').map(p => p.text).join('\n');
  const files = (text.match(/\[Tệp đính kèm: [^\]]*\]/g) || []);
  const answer = `Bố nhận được ${imgs} ảnh${imgs ? ' (' + parts.filter(p => p.type === 'image_url').map(p => Math.round(p.image_url.url.length / 1024) + 'KB').join(', ') + ')' : ''} và ${files.length} tệp ${files.join(' ')}.`;
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  for (const w of answer.match(/[\s\S]{1,14}/g)) { res.write('data: ' + JSON.stringify({ model: 'fake', choices: [{ delta: { content: w } }] }) + '\n\n'); await new Promise(r => setTimeout(r, 8)); }
  res.write('data: ' + JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 20 } }) + '\n\n'); res.end('data: [DONE]\n\n');
}).listen(PORT, () => console.log('fake-ai-vision on', PORT));
