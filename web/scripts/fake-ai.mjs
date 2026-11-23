// Upstream giả theo chuẩn OpenAI (SSE) để thử proxy chatbot. node scripts/fake-ai.mjs [port] [mode: ok|fail]
import http from 'node:http';
const PORT = +(process.argv[2] || 9099), MODE = process.argv[3] || 'ok';
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c); let body = {}; try { body = JSON.parse(Buffer.concat(chunks)); } catch { }
  if (!/Bearer FAKEKEY/.test(req.headers.authorization || '')) { res.writeHead(401); return res.end('{"error":"bad key"}'); }
  if (MODE === 'fail') { res.writeHead(500); return res.end('{"error":"boom"}'); }
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  const last = (body.messages || []).filter(m => m.role === 'user').pop()?.content || '';
  const words = ('Đây là câu trả lời thử cho: ' + last.slice(0, 40) + ' (model ' + body.model + ')').split(' ');
  for (const w of words) { res.write('data: ' + JSON.stringify({ model: body.model, choices: [{ delta: { content: w + ' ' } }] }) + '\n\n'); await new Promise(r => setTimeout(r, 15)); }
  res.write('data: ' + JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: words.length } }) + '\n\n'); res.end('data: [DONE]\n\n');
}).listen(PORT, () => console.log('fake-ai on', PORT, MODE));
