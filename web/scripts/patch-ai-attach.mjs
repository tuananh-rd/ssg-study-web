import fs from 'node:fs';
const f = 'D:/Downloads/SSG105 app/web/functions/_ai.js'; let a = fs.readFileSync(f, 'utf8'); const miss = [];
const rep = (o, n) => { if (!a.includes(o)) miss.push(o.slice(0, 70)); else a = a.replace(o, () => n); };
rep(`  if (d.messages.reduce((a, m) => a + (m && typeof m.content === 'string' ? m.content.length : 0), 0) > 70000) return bad('Nội dung quá dài', 413);
  const msgs = d.messages.slice(-40).filter(m => m && ['system', 'user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 16000) }));
  if (!msgs.length || msgs.reduce((a, m) => a + m.content.length, 0) > 70000) return bad('Nội dung quá dài', 413);`,
`  // Tin nhắn người dùng có thể kèm ảnh: content là mảng [{type:'text'},{type:'image_url',image_url:{url:'data:image/...;base64,...'}}]
  const IMG_RE = /^data:image\\/(jpeg|png|webp);base64,[A-Za-z0-9+\\/=]+$/, MAX_IMG = 1800000, MAX_IMGS = 4, MAX_IMG_TOTAL = 6000000;
  let nImg = 0, imgBytes = 0;
  const lenOf = c => typeof c === 'string' ? c.length : Array.isArray(c) ? c.reduce((s, p) => s + (p && p.type === 'text' && typeof p.text === 'string' ? p.text.length : 0), 0) : 0;
  if (d.messages.reduce((s, m) => s + (m ? lenOf(m.content) : 0), 0) > 120000) return bad('Nội dung quá dài', 413);
  const msgs = [];
  for (const m of d.messages.slice(-40)) {
    if (!m || !['system', 'user', 'assistant'].includes(m.role)) continue;
    if (typeof m.content === 'string') { msgs.push({ role: m.role, content: m.content.slice(0, 40000) }); continue; }
    if (m.role === 'user' && Array.isArray(m.content)) {
      const parts = [];
      for (const p of m.content.slice(0, 8)) {
        if (p && p.type === 'text' && typeof p.text === 'string') parts.push({ type: 'text', text: p.text.slice(0, 40000) });
        else if (p && p.type === 'image_url' && p.image_url && typeof p.image_url.url === 'string') {
          const u = p.image_url.url; if (!IMG_RE.test(u) || u.length > MAX_IMG) return bad('Ảnh không hợp lệ hoặc quá lớn', 413);
          if (++nImg > MAX_IMGS || (imgBytes += u.length) > MAX_IMG_TOTAL) return bad('Gửi tối đa ' + MAX_IMGS + ' ảnh mỗi lần', 413);
          parts.push({ type: 'image_url', image_url: { url: u } });
        }
      }
      if (parts.length) msgs.push({ role: 'user', content: parts });
    }
  }
  if (!msgs.length || msgs.reduce((s, m) => s + lenOf(m.content), 0) > 120000) return bad('Nội dung quá dài', 413);`);
rep(`return bad('Bố Tuấn Anh chưa được cấu hình', 503);`, `return bad('Bố Tuấn Anh chưa được cấu hình', 503);
  const hasImg = nImg > 0;`);
// nhật ký: nội dung câu hỏi cuối (chuỗi hoặc mảng)
const i0 = a.indexOf('q: last ? last.content'), i1 = a.indexOf(": '' }", i0);
if (i0 < 0 || i1 < 0) miss.push('log q'); else a = a.slice(0, i0) + `q: (last ? (typeof last.content === 'string' ? last.content : last.content.filter(p => p.type === 'text').map(p => p.text).join(' ')) : '').split(/\\s+/).join(' ').slice(-160), img: nImg }` + a.slice(i1 + 6);
rep(`len: msgs.reduce((a, m) => a + m.content.length, 0),`, `len: msgs.reduce((a, m) => a + lenOf(m.content), 0),`);
rep(`const base = lastStatus === 429 ? 'Bố Tuấn Anh đang quá tải, thử lại sau ít phút.' : 'Bố Tuấn Anh đang bận, thử lại sau ít phút.';`, `const imgHint = hasImg && lastStatus >= 400 && lastStatus < 500 && lastStatus !== 429 ? ' Có thể mô hình hiện tại chưa đọc được ảnh, hãy thử gửi lại chỉ bằng chữ.' : '';
  const base = (lastStatus === 429 ? 'Bố Tuấn Anh đang quá tải, thử lại sau ít phút.' : 'Bố Tuấn Anh đang bận, thử lại sau ít phút.') + imgHint;`);
rep(`Từ chối lịch sự các yêu cầu không liên quan đến việc học.`, `Người dùng có thể gửi kèm ảnh (chụp đề, biểu đồ, slide) và nội dung tệp: hãy đọc kỹ rồi giải thích. Từ chối lịch sự các yêu cầu không liên quan đến việc học.`);
if (miss.length) { console.log('THIẾU\n' + miss.join('\n')); process.exit(1); }
fs.writeFileSync(f, a); console.log('ok');
