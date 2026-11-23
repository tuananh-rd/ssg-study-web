'use strict';
/* =====================================================================
   App ôn thi trắc nghiệm – JS thuần, chạy offline qua file://
   Dữ liệu: window.QUESTIONS + window.APP_CONFIG (sinh bởi build.ps1)
   ===================================================================== */

// ---------- Hằng số & dữ liệu ----------
// Cấu hình theo môn: tên môn, khoá lưu tiến độ (mỗi môn 1 khoá riêng), mặc định thi thử
const CFG = Object.assign({ subject: 'Môn học', title: 'Ôn thi trắc nghiệm', field: 'học', searchHint: 'từ khoá', storeKey: 'quiz-progress-v1', examCount: 50, examMinutes: 60 },
  window.APP_CONFIG || {});
const QUESTIONS = Array.isArray(window.QUESTIONS) ? window.QUESTIONS : [];
const QMAP = new Map(QUESTIONS.map(q => [q.id, q]));
const TOPICS = [...new Set(QUESTIONS.map(q => q.topic))];
const LETTERS = 'ABCDEFGH';
const STORE_KEY = CFG.storeKey;
const STREAK_TO_CLEAR = 2;   // Leitner: đúng liên tiếp 2 lần mới gỡ khỏi danh sách sai
// Đáp án kiểu "All of the others / None of the above" phải giữ nguyên vị trí khi xáo
const ANCHOR_OPT = /^(all|none|not)\b.*\b(above|others?|answers?|these)\.?$/i;

const app = document.getElementById('app');
let view = 'home';       // màn hình hiện tại (dùng cho phím tắt)
let session = null;      // phiên trắc nghiệm / ôn câu sai đang chạy
let ticker = null;       // setInterval cho đồng hồ

// ---------- Tiện ích DOM ----------
/** Tạo phần tử: el('div', {class:'x', onclick: fn}, con1, con2...) */
function el(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (typeof v !== 'string' && k in node) node[k] = v;   // checked, disabled, value số...
      else node.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false || k === '') continue;
    node.append(k instanceof Node ? k : String(k));
  }
  return node;
}

/** Tạo phần tử SVG */
function svg(tag, attrs, ...kids) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
  for (const k of kids.flat()) if (k != null) node.append(k instanceof Node ? k : String(k));
  return node;
}

// ---------- Bộ icon SVG nét (cùng nét, ăn theo màu chữ, chạy offline) ----------
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  quiz: '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
  review: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  exam: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  'search-check': '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11l2 2 4-4"/>',
  bot: '<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  external: '<path d="M7 7h10v10M7 17 17 7"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  languages: '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  enter: '<path d="m9 10-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
};
/** Icon SVG: ic('check'); cls 'fill' = tô đặc (vd cờ đã cắm) */
function ic(name, cls) {
  const node = svg('svg', { class: 'ic' + (cls ? ' ' + cls : ''), viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  node.innerHTML = ICONS[name] || '';
  return node;
}

/** Thay toàn bộ nội dung trang */
function mount(...nodes) {
  app.replaceChildren(...nodes.flat().filter(Boolean));
}

// ---------- Tiện ích chung ----------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const pct = (a, b) => (b ? Math.round((a * 100) / b) : 0);
const score10 = (a, b) => (b ? ((a * 10) / b).toFixed(1).replace('.0', '') : '0');

function fmtTime(secs) {
  secs = Math.max(0, Math.round(secs));
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
function fmtDate(ts) {
  const d = new Date(ts), p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function startTicker(fn) {
  stopTicker();
  ticker = setInterval(fn, 1000);
}
function stopTicker() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}
function setText(id, text) {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

// ---------- Lưu trữ tiến độ (localStorage) ----------
const Store = {
  d: null,
  load() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      console.warn('Không đọc được tiến độ đã lưu', e);
    }
    // stats: {id: {c: số lần đúng, w: số lần sai, last: lần gần nhất đúng?}}
    // wrong: {id: chuỗi đúng liên tiếp}  · history: [{t, mode, total, correct, secs}]
    // practice: bài trắc nghiệm / ôn câu sai đang làm dở · exam: bài thi thử đang làm dở
    this.d = Object.assign({ stats: {}, wrong: {}, history: [], prefs: {}, practice: null, exam: null, lastExam: null }, saved);
  },
  save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.d));
    } catch (e) {
      console.warn('Không lưu được tiến độ', e);
      if (!this.warned) {   // báo một lần để người dùng biết và xuất file sao lưu
        this.warned = true;
        alert('Không lưu được tiến độ vào trình duyệt. Hãy dùng "Xuất tiến độ" ở trang chủ để sao lưu.');
      }
    }
  },
};

/** Ghi nhận một lần trả lời; cập nhật thống kê + danh sách câu sai (Leitner) */
function recordAnswer(id, ok) {
  const { stats, wrong } = Store.d;
  const s = stats[id] || (stats[id] = { c: 0, w: 0, last: null });
  if (ok) s.c++; else s.w++;
  s.last = ok;
  let info = { wasWrong: id in wrong, cleared: false, streak: 0 };
  if (!ok) {
    wrong[id] = 0;                       // sai → vào (hoặc quay lại) danh sách, reset chuỗi
  } else if (id in wrong) {
    wrong[id]++;
    info.streak = wrong[id];
    if (wrong[id] >= STREAK_TO_CLEAR) {  // đủ 2 lần đúng liên tiếp → gỡ
      delete wrong[id];
      info.cleared = true;
    }
  }
  Store.save();
  return info;
}
const wrongIds = () => Object.keys(Store.d.wrong).map(Number).filter(id => QMAP.has(id));

// ---------- Câu hỏi trong một phiên ----------
/** Thứ tự hiển thị đáp án (mảng index gốc); giữ cố định đáp án kiểu "All of the others" */
function optionOrder(q, shuffleOpts) {
  const order = q.options.map((_, i) => i);
  if (!shuffleOpts || order.length <= 2) return order;   // True/False giữ nguyên
  const isAnchor = i => ANCHOR_OPT.test(q.options[i].trim());
  const free = shuffle(order.filter(i => !isAnchor(i)));
  let k = 0;
  return order.map(i => (isAnchor(i) ? i : free[k++]));
}
function makeItem(q, shuffleOpts) {
  // selected lưu index GỐC của đáp án → không cần map ngược khi chấm
  return { id: q.id, order: optionOrder(q, shuffleOpts), selected: [], checked: false, ok: null, flagged: false };
}
function pickOption(item, orig) {
  const q = QMAP.get(item.id);
  if (q.multi) {
    const i = item.selected.indexOf(orig);
    if (i >= 0) item.selected.splice(i, 1); else item.selected.push(orig);
  } else {
    item.selected = [orig];
  }
}
const isCorrect = item => sameSet(item.selected, QMAP.get(item.id).answer);
/** Chữ cái (theo thứ tự đang hiển thị) của các đáp án gốc */
const lettersOf = (item, origs) =>
  item.order.map((o, i) => (origs.includes(o) ? LETTERS[i] : null)).filter(Boolean).join(', ') || '—';

// ---------- Hiển thị văn bản câu hỏi (ma trận, bảng số) ----------
const ROMAN_LINE = /^\s*(I|II|III|IV|V|VI)\s*:\s*(.*)$/;
// Dòng bảng số; cho phép cột cuối là nhãn chữ (vd "63.03 22.55 39.61 AB")
const NUM_ROW = /^\s*(-?\d+(\.\d+)?\s+){2,}(-?\d+(\.\d+)?|[A-Za-z]{1,4})\s*$|^\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s*$/;
// Đáp án trông như code Python (hàm, thuộc tính, gán biến, tên_có_gạch_dưới) → font monospace
const CODE_OPT = /^[\w\s.,='"()\[\]:-]+$/;
const isCode = s => CODE_OPT.test(s) && /\w\(|^\w+_\w+$|^[a-z_]+(\.[a-z_]+)+$|\s=\s/i.test(s.trim());
// Dòng code trong đề (Python / HTML): comment, thẻ HTML, import, gán biến, gọi hàm, dòng đóng ngoặc, 'key': value
const CODE_LINE = /^\s*(#|<\/?[a-z!]|import\s|from\s+[\w.]+\s+import|"""|'''|[\w.\[\]'"]+(\s*,\s*[\w.\[\]'"]+)*\s*[+\-*/]?=(?!=)|[\w.]+\(|['"][\w ]+['"]\s*:|[}\])]+[,)]*\s*$|def\s|return\b)/i;

/** Tách dòng "I: ... | II: ..." thành từng dòng riêng */
function expandLines(text) {
  const out = [];
  for (const line of String(text).split('\n')) {
    if (ROMAN_LINE.test(line) && line.includes(' | ')) out.push(...line.split(/\s+\|\s+/));
    else out.push(line);
  }
  return out;
}
function matrixTable(rows, bracket) {
  return el('table', { class: 'matrix' + (bracket ? ' bracket' : '') },
    el('tbody', null, rows.map(r => el('tr', null, r.map(c => el('td', null, c))))));
}
/** Chèn đoạn văn, đổi "[a b; c d]" thành ma trận */
function appendInline(parent, s) {
  const re = /\[([^\[\]]*;[^\[\]]*)\]/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) parent.append(s.slice(last, m.index));
    const rows = m[1].split(';').map(r => r.trim().split(/[\s,]+/).filter(Boolean));
    parent.append(matrixTable(rows, true));
    last = re.lastIndex;
  }
  if (last < s.length) parent.append(s.slice(last));
}
/** Văn bản giàu định dạng: giữ xuống dòng, dòng số liên tiếp → lưới monospace,
    (chỉ trong đề bài) các dòng code liên tiếp → khung code monospace */
function richText(text, cls) {
  const box = el('span', { class: cls || '' });
  box.style.display = 'block';
  const lines = expandLines(text);
  const detectCode = cls === 'q-text';
  let i = 0;
  while (i < lines.length) {
    if (NUM_ROW.test(lines[i])) {
      const rows = [];
      while (i < lines.length && NUM_ROW.test(lines[i])) rows.push(lines[i++].trim().split(/\s+/));
      box.append(el('span', { class: 'matrix-wrap', style: 'display:block' }, matrixTable(rows, false)));
      continue;
    }
    if (detectCode && CODE_LINE.test(lines[i])) {
      const code = [];
      while (i < lines.length && CODE_LINE.test(lines[i])) code.push(lines[i++]);
      box.append(el('span', { class: 'code-block' }, code.join('\n')));
      continue;
    }
    const line = lines[i++];
    const m = line.match(ROMAN_LINE);
    const row = el('span', { class: m ? 'rt-line rt-item' : 'rt-line' });
    if (m) {
      row.append(el('b', { class: 'rt-label' }, m[1] + ':'), ' ');
      appendInline(row, m[2]);
    } else {
      appendInline(row, line);
    }
    box.append(row);
  }
  return box;
}

// ---------- Khối giao diện dùng chung ----------
/** item (nếu có) cho biết thứ tự đáp án đang hiển thị, để bản dịch khớp chữ A/B/C/D */
function questionBlock(q, item) {
  const st = Store.d.stats[q.id];
  return el('div', null,
    el('div', { class: 'q-meta' },
      el('span', { class: 'badge' }, q.topic),
      el('span', { class: 'muted' }, `#${q.id} · slide ${q.slide}` + (q.section ? ` · ${q.section}` : '')),
      q.multi && el('span', { class: 'badge warn' }, `Chọn ${q.answer.length} đáp án`),
      st && el('span', { class: 'muted' }, `· đã làm: ${st.c} đúng / ${st.w} sai`),
      trButton(q)),
    richText(q.question, 'q-text'),
    trBox(q, item ? item.order : q.options.map((_, i) => i)));
}

/** Danh sách đáp án. reveal = tô xanh/đỏ; onPick = null thì chỉ xem */
function optionList(item, { reveal, onPick }) {
  const q = QMAP.get(item.id);
  return el('div', { class: 'options' + (q.multi ? ' multi' : '') },
    item.order.map((orig, i) => {
      const sel = item.selected.includes(orig), ans = q.answer.includes(orig);
      let cls = 'opt' + (sel ? ' selected' : '');
      if (reveal) cls += ans ? (sel ? ' correct' : ' correct missed') : (sel ? ' wrong' : '');
      const mark = reveal ? (ans ? ic('check') : sel ? ic('x') : null) : null;
      return el('button', {
        class: cls, type: 'button', disabled: !onPick,
        // Kéo chuột bôi đen chữ trong đáp án (để dịch) thì không tính là chọn đáp án
        onclick: onPick ? () => { if (!window.getSelection().toString().trim()) onPick(orig); } : null,
      },
        el('span', { class: 'opt-key' }, LETTERS[i]),
        richText(q.options[orig], 'opt-text' + (isCode(q.options[orig]) ? ' code' : '')),
        mark && el('span', { class: 'opt-mark' }, mark));
    }));
}

function explainBlock(q) {
  if (!q.explanation) return null;
  return el('div', { class: 'explain' }, el('div', { class: 'explain-title' }, 'Giải thích'), richText(q.explanation));
}

// ---------- Hỏi chatbot kiểm tra đáp án ----------
// Không cần API key: mở trang chat với prompt điền sẵn (?q=) và chép prompt vào clipboard để dán nếu cần
const AI_SITES = [
  ['Claude', 'https://claude.ai/new?q='],
  ['ChatGPT', 'https://chatgpt.com/?q='],
];
/** Đang làm câu (chưa bấm Kiểm tra) → chỉ xin gợi ý, không gửi đáp án */
const aiHintMode = item => !!item && !item.checked;

/** Prompt nhờ AI tự giải rồi so với đáp án trong đề (hoặc chỉ gợi ý khi chưa làm xong);
    dùng đúng thứ tự đáp án đang hiển thị trên màn hình */
function aiPrompt(q, item) {
  const order = item ? item.order : q.options.map((_, i) => i);
  const letters = origs => order.map((o, i) => (origs.includes(o) ? LETTERS[i] : null)).filter(Boolean).join(', ');
  const ans = letters(q.answer), hint = aiHintMode(item);
  const mine = item && item.selected.length ? letters(item.selected) : '';
  return [
    `Đây là một câu trắc nghiệm môn ${CFG.title.replace(/^Ôn thi\s*/i, '')}.` + (hint ? '' : ' Đáp án trong đề CÓ THỂ BỊ SAI.'),
    hint
      ? 'Tôi đang tự làm câu này. ĐỪNG nói thẳng đáp án: hãy gợi ý kiến thức cần dùng và hướng suy luận để tôi tự chọn. Chỉ nói đáp án khi tôi xin. Trả lời ngắn gọn bằng tiếng Việt.'
      : 'Hãy tự giải độc lập trước, sau đó so với đáp án trong đề và kết luận rõ: ĐÚNG hay SAI (nếu sai thì đáp án đúng là gì). Giải thích ngắn gọn bằng tiếng Việt.',
    '',
    'Câu hỏi:',
    q.question,
    '',
    ...order.map((o, i) => `${LETTERS[i]}. ${q.options[o]}`),
    '',
    q.multi ? `(Chọn ${q.answer.length} đáp án)` : null,
    hint ? null : `Đáp án trong đề: ${ans}`,
    !hint && mine && mine !== ans ? `Tôi đã chọn: ${mine}` : null,
  ].filter(x => x != null).join('\n');
}
/** Chép văn bản vào clipboard (chạy được cả khi mở qua file://) */
function copyText(text) {
  const ta = el('textarea', { style: 'position:fixed;top:0;left:0;opacity:0' });
  ta.value = text;
  document.body.append(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { /* bỏ qua */ }
  ta.remove();
  if (!ok && navigator.clipboard) navigator.clipboard.writeText(text).then(() => {}, () => {});
  return ok;
}
/** Hàng nút "Hỏi AI" + khung chat; item = null khi xem câu ngoài bài làm (trang tìm kiếm) */
function aiBox(q, item) {
  const chat = aiChat(q.id);
  const wrap = el('div', { class: 'ai-wrap' });
  const note = el('span', { class: 'ai-note' });
  const ask = (name, url) => {
    const text = aiPrompt(q, item);
    const copied = copyText(text);
    window.open(url + encodeURIComponent(text), '_blank', 'noopener');
    note.textContent = copied ? `Đã mở ${name} và chép sẵn prompt – nếu ô chat trống thì dán (Ctrl+V).` : `Đã mở ${name}.`;
  };
  const draw = () => wrap.replaceChildren(...[
    el('div', { class: 'ai-row' },
      el('span', { class: 'ai-label' }, ic('bot'), aiHintMode(item) ? 'Bí? Hỏi AI gợi ý:' : 'Nghi đáp án sai? Hỏi AI:'),
      el('button', { class: 'btn small' + (chat.open ? ' active' : ''), type: 'button', onclick: () => { chat.open = !chat.open; draw(); } },
        chat.open ? [ic('x'), 'Đóng chat'] : [ic('message'), 'Chat ngay trong app']),
      AI_SITES.map(([name, url]) => el('button', { class: 'btn small ghost', type: 'button', onclick: () => ask(name, url) }, name, ic('external'))),
      note),
    chat.open && aiChatPanel(q, item, chat),
  ].filter(Boolean));
  draw();
  return wrap;
}

// ---------- Chatbot ngay trong app: gọi thẳng Claude API bằng API key của người dùng ----------
// Gọi bằng fetch (không dùng SDK) vì app là 1 file HTML chạy offline qua file://, không có bước build/npm.
// Key lưu riêng trong localStorage của trình duyệt (không nằm trong file HTML, không bị "Xoá toàn bộ tiến độ" xoá).
const AI_KEY_STORE = STORE_KEY + '-ai';
const AI_MODELS = {
  'claude-opus-5-5': { name: 'Claude Opus 5.5', note: 'chính xác nhất', price: [4, 20], fallback: true },
  'claude-sonnet-5-5': { name: 'Claude Sonnet 5.5', note: 'cân bằng', price: [2, 10], fallback: true },
  'claude-haiku-5-5': { name: 'Claude Haiku 5.5', note: 'rẻ, nhanh', price: [0.1, 0.5], fallback: false },
};
const AI_SYSTEM = 'Bạn là trợ giảng môn ' + CFG.field + ', giúp sinh viên ôn thi trắc nghiệm. Trả lời bằng tiếng Việt, ngắn gọn, đúng trọng tâm. ' +
  'Khi được nhờ kiểm tra đáp án: tự giải độc lập trước rồi mới so với đáp án trong đề; nếu đề sai hoặc câu hỏi mơ hồ (nhiều đáp án hợp lý) thì nói rõ. ' +
  'Với câu tính toán, ghi các bước tính. Công thức viết bằng LaTeX đặt trong \\( ... \\) (trong dòng) hoặc \\[ ... \\] (riêng dòng); ' +
  'không dùng dấu $ đơn. Không dùng bảng Markdown.';
const AiCfg = {
  mem: null,   // dự phòng khi trình duyệt chặn localStorage: giữ key đến khi đóng trang
  get() {
    if (this.mem) return this.mem;
    try { return JSON.parse(localStorage.getItem(AI_KEY_STORE)) || {}; } catch (e) { return {}; }
  },
  set(v) {
    try { localStorage.setItem(AI_KEY_STORE, JSON.stringify(v)); this.mem = null; } catch (e) { this.mem = v; }
  },
};
// Nhà cung cấp: key Anthropic chính hãng, hoặc dịch vụ bên thứ 3 (chuẩn Anthropic / chuẩn OpenAI) với Base URL riêng
const AI_PROVIDERS = {
  anthropic: 'Anthropic (key chính hãng)',
  'anthropic-compat': 'Bên thứ 3 – chuẩn Anthropic (/v1/messages)',
  openai: 'Bên thứ 3 – chuẩn OpenAI (/v1/chat/completions)',
};
const aiProvider = () => (AI_PROVIDERS[AiCfg.get().provider] ? AiCfg.get().provider : 'anthropic');
const aiModel = () => {
  const m = AiCfg.get().model;
  if (aiProvider() === 'anthropic') return AI_MODELS[m] ? m : 'claude-opus-5-5';
  return m || 'claude-opus-5-5';
};
/** Địa chỉ gọi API; với bên thứ 3 nhận cả "https://x.com", ".../v1" hoặc đường dẫn đầy đủ */
function aiUrl() {
  const p = aiProvider();
  if (p === 'anthropic') return 'https://api.anthropic.com/v1/messages';
  const b = (AiCfg.get().base || '').trim().replace(/\/+$/, '');
  const path = p === 'openai' ? '/chat/completions' : '/messages';
  return b.endsWith(path) ? b : b + (/\/v\d+$/.test(b) ? '' : '/v1') + path;
}
const aiModelName = () => (aiProvider() === 'anthropic' ? AI_MODELS[aiModel()].name : aiModel());
const aiChats = new Map();   // id câu -> hội thoại (chỉ giữ trong bộ nhớ, đóng trang là mất)
const aiChat = id => aiChats.get(id) || aiChats.set(id, { msgs: [], busy: false, draft: '', open: false }).get(id);
const blocksText = blocks => blocks.filter(b => b && b.type === 'text').map(b => b.text || '').join('');

/** Tạo request theo nhà cung cấp đang chọn. opts: { system, effort } (mặc định: trợ giảng, effort medium) */
function aiRequest(chat, opts = {}) {
  const p = aiProvider(), model = aiModel(), key = AiCfg.get().key;
  const system = opts.system || AI_SYSTEM;
  if (p === 'openai') {
    return {
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: {
        model, stream: true,
        messages: [{ role: 'system', content: system },
          ...chat.msgs.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : blocksText(m.content) }))],
      },
    };
  }
  const body = { model, max_tokens: 16000, stream: true, system, messages: chat.msgs.map(m => ({ role: m.role, content: m.content })) };
  if (p === 'anthropic-compat') {
    // Dịch vụ trung gian: gửi key theo cả 2 kiểu phổ biến, chỉ dùng các tham số cơ bản cho dễ tương thích
    return { headers: { 'content-type': 'application/json', 'x-api-key': key, authorization: 'Bearer ' + key, 'anthropic-version': '2023-06-01' }, body };
  }
  const headers = {
    'content-type': 'application/json',
    'x-api-key': key,
    'anthropic-version': '2026-10-21',
    'anthropic-dangerous-direct-browser-access': 'true',   // cho phép gọi API thẳng từ trình duyệt
  };
  body.output_config = { effort: opts.effort || 'medium' };
  if (AI_MODELS[model].fallback) {   // bị bộ lọc an toàn từ chối thì máy chủ tự chạy lại bằng model dự phòng
    headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
    body.fallbacks = 'default';
  }
  return { headers, body };
}

/** Gửi hội thoại, đọc stream SSE; trả về các content block của câu trả lời */
async function aiStream(chat, onDelta, opts) {
  const model = aiModel(), openai = aiProvider() === 'openai';
  const { headers, body } = aiRequest(chat, opts);
  chat.ctrl = new AbortController();
  const res = await fetch(aiUrl(), { method: 'POST', headers, body: JSON.stringify(body), signal: chat.ctrl.signal });
  if (!res.ok) {
    let msg = '';
    try { const j = await res.json(); msg = j.error?.message || j.message || ''; } catch (e) { /* bỏ qua */ }
    throw Object.assign(new Error(msg || res.statusText), { status: res.status });
  }
  const blocks = [], usage = { in: 0, out: 0 };
  let stop = null, usedModel = model, buf = '';
  const reader = res.body.getReader(), dec = new TextDecoder();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      const ev = JSON.parse(data);
      if (ev.error) throw new Error(ev.error.message || 'Lỗi từ API');
      if (openai) {   // chuẩn OpenAI: {choices:[{delta:{content}, finish_reason}], usage?}
        const c = ev.choices?.[0];
        if (ev.model) usedModel = ev.model;
        if (c?.delta?.content) {
          blocks[0] = blocks[0] || { type: 'text', text: '' };
          blocks[0].text += c.delta.content;
          onDelta(blocks);
        }
        if (c?.finish_reason) stop = { length: 'max_tokens', content_filter: 'refusal' }[c.finish_reason] || 'end_turn';
        if (ev.usage) { usage.in = ev.usage.prompt_tokens || 0; usage.out = ev.usage.completion_tokens || 0; }
        continue;
      }
      if (ev.type === 'message_start') {
        usedModel = ev.message.model || model;
        usage.in = ev.message.usage?.input_tokens || 0;
      } else if (ev.type === 'content_block_start') {
        blocks[ev.index] = Object.assign({}, ev.content_block);
      } else if (ev.type === 'content_block_delta') {
        const b = blocks[ev.index], d = ev.delta;
        if (d.type === 'text_delta') b.text = (b.text || '') + d.text;
        else if (d.type === 'thinking_delta') b.thinking = (b.thinking || '') + d.thinking;
        else if (d.type === 'signature_delta') b.signature = (b.signature || '') + d.signature;
        onDelta(blocks);
      } else if (ev.type === 'message_delta') {
        if (ev.delta?.stop_reason) stop = ev.delta.stop_reason;
        if (ev.usage?.output_tokens != null) usage.out = ev.usage.output_tokens;
        if (ev.usage?.input_tokens) usage.in = ev.usage.input_tokens;
      } else if (ev.type === 'error') {
        throw new Error(ev.error?.message || 'Lỗi từ API');
      }
    }
  }
  return { blocks: blocks.filter(Boolean), stop, usage, model: usedModel };
}

/** Khối gửi lại ở lượt sau: giữ nguyên thinking (kèm chữ ký); nếu giữa chừng chuyển sang model dự phòng
    thì chỉ giữ text + khối fallback ở trước mốc chuyển (theo quy tắc của API) */
function aiEcho(blocks) {
  const cut = blocks.map(b => b.type).lastIndexOf('fallback');
  return blocks.filter((b, i) => !(b.type === 'text' && !b.text) &&
    (i >= cut || b.type === 'text' || b.type === 'fallback'));
}

function aiErrText(e) {
  if (e.name === 'AbortError') return 'Đã dừng.';
  if (e instanceof TypeError) {
    if (aiProvider() === 'anthropic') return 'Không kết nối được tới Claude API – kiểm tra mạng.';
    let host = aiUrl();
    try { host = new URL(aiUrl()).host; } catch (x) { /* giữ nguyên */ }
    return `Không kết nối được tới ${host}. Kiểm tra mạng và Base URL trong "Cài đặt". ` +
      'Nếu địa chỉ đúng mà vẫn lỗi, có thể dịch vụ này không cho gọi trực tiếp từ trình duyệt (lỗi CORS) – hỏi nhà cung cấp hoặc thử chuẩn API còn lại.';
  }
  const s = e.status;
  if (s === 401) {
    if (aiProvider() === 'anthropic' && !String(AiCfg.get().key).startsWith('sk-ant-'))
      return 'Key bị Anthropic từ chối. Key này không phải key Anthropic chính hãng (sk-ant-…) – nếu bạn mua key ở dịch vụ khác, ' +
        'bấm "Cài đặt", chọn "Bên thứ 3" và nhập Base URL + tên model theo hướng dẫn của dịch vụ đó.';
    return 'API key không hợp lệ hoặc đã bị thu hồi. Bấm "Cài đặt" để nhập lại.';
  }
  if (s === 403) return 'Key không có quyền dùng model này. Thử đổi model trong "Cài đặt".';
  if (s === 404) return 'Không tìm thấy địa chỉ API (404) – kiểm tra Base URL và chuẩn API trong "Cài đặt". ' + e.message;
  if (s === 429) return 'Vượt giới hạn tốc độ hoặc chi tiêu của key. Đợi một lúc rồi thử lại.';
  if (s >= 500) return 'Máy chủ Claude đang quá tải, thử lại sau ít phút.';
  return 'Lỗi: ' + e.message;
}

/** Gửi một tin nhắn. shown = nội dung hiển thị (tin đầu tiên chứa cả đề bài nên hiện gọn lại) */
async function aiAsk(chat, text, shown, restoreDraft) {
  if (chat.busy) return;
  chat.msgs.push({ role: 'user', content: text, shown });
  chat.busy = true; chat.err = null; chat.partial = '';
  chat.view?.();
  try {
    const r = await aiStream(chat, blocks => { chat.partial = blocksText(blocks); chat.view?.(); });
    if (r.stop === 'refusal') throw new Error('AI từ chối trả lời yêu cầu này. Thử hỏi lại theo cách khác.');
    let shownText = blocksText(r.blocks) || '(không có nội dung)';
    if (r.stop === 'max_tokens') shownText += '\n\n[Câu trả lời bị cắt vì quá dài]';
    const tokens = r.usage.in + r.usage.out;
    let meta = aiModelName() + (tokens ? ` · ${tokens} token` : '');
    if (aiProvider() === 'anthropic') {   // giá chỉ biết chắc với key chính hãng
      const p = AI_MODELS[aiModel()].price, cost = (r.usage.in * p[0] + r.usage.out * p[1]) / 1e6;
      if (r.model !== aiModel()) meta = `${r.model} (dự phòng)` + (tokens ? ` · ${tokens} token` : '');
      meta += ` · ≈ $${cost < 0.01 ? cost.toFixed(4) : cost.toFixed(3)}`;
    }
    chat.msgs.push({ role: 'assistant', content: aiEcho(r.blocks), shown: shownText, meta });
  } catch (e) {
    chat.msgs.pop();   // bỏ tin vừa gửi để lịch sử luôn xen kẽ người dùng / AI
    chat.err = aiErrText(e);
    if (restoreDraft) chat.draft = shown;   // trả lại đúng câu người dùng đã gõ
  } finally {
    chat.busy = false; chat.partial = ''; chat.ctrl = null;
    chat.view?.();
  }
}

// ---------- Công thức toán trong câu trả lời của AI ----------
// AI hay viết LaTeX: \( ... \) (trong dòng), \[ ... \] hoặc $$ ... $$ (riêng dòng).
// Vẽ bằng KaTeX tải từ CDN khi cần (chat vốn đã cần mạng); chưa tải được thì đổi sang dạng chữ dễ đọc.
const KATEX_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/';
let katexLoad = null;
function loadKatex() {
  if (window.katex || katexLoad) return;
  katexLoad = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = KATEX_CDN + 'katex.min.css';
    const js = document.createElement('script');
    js.src = KATEX_CDN + 'katex.min.js';
    js.onload = resolve; js.onerror = reject;
    document.head.append(css, js);
  }).then(() => document.querySelectorAll('.math[data-tex]').forEach(renderMath), () => { /* offline: giữ dạng chữ */ });
}
/** LaTeX → chữ thường (dùng khi chưa có KaTeX) */
function texToText(tex) {
  let s = tex;
  for (let i = 0; i < 4; i++) s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)');
  const sym = { cdot: '·', times: '×', le: '≤', leq: '≤', ge: '≥', geq: '≥', neq: '≠', ne: '≠', approx: '≈', to: '→', rightarrow: '→',
    Rightarrow: '⇒', sum: 'Σ', sqrt: '√', alpha: 'α', beta: 'β', lambda: 'λ', sigma: 'σ', mu: 'μ', theta: 'θ', epsilon: 'ε', pm: '±', infty: '∞' };
  return s
    .replace(/\\(text|mathrm|mathbf|mathit|operatorname)\s*\{([^{}]*)\}/g, '$2')
    .replace(/\\(q?quad|,|;|:|!)/g, ' ')
    .replace(/\\(left|right)\b/g, '')
    .replace(/\\([A-Za-z]+)/g, (m, w) => sym[w] || w)
    .replace(/\^\{([^{}]*)\}/g, '^$1').replace(/_\{([^{}]*)\}/g, '_$1')
    .replace(/[{}]/g, '').replace(/[ \t]+/g, ' ').trim();
}
function renderMath(node) {
  if (!window.katex || !node.dataset.tex) return;
  try {
    window.katex.render(node.dataset.tex, node, { displayMode: node.classList.contains('display'), throwOnError: false });
    delete node.dataset.tex;
  } catch (e) { /* giữ dạng chữ */ }
}
function mathNode(tex, display) {
  const n = el('span', { class: 'math' + (display ? ' display' : ''), 'data-tex': tex.trim() }, texToText(tex));
  if (window.katex) renderMath(n); else loadKatex();
  return n;
}
/** Hiển thị **đậm** + công thức; phần còn lại giữ nguyên (white-space: pre-wrap) */
const MATH_RE = /\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\\\(([\s\S]+?)\\\)/g;
const boldLite = s => s.split(/\*\*(.+?)\*\*/g).map((t, i) => (i % 2 ? el('b', null, t) : t));
function mdLite(text) {
  const out = [], s = String(text);
  let last = 0, m, eatNl = false;
  const plain = t => boldLite(eatNl ? t.replace(/^[ \t]*\n/, '') : t);
  MATH_RE.lastIndex = 0;
  while ((m = MATH_RE.exec(s))) {
    const display = m[3] == null;
    let before = s.slice(last, m.index);
    if (display) before = before.replace(/\n[ \t]*$/, '');   // công thức riêng dòng đã tự xuống dòng
    out.push(...plain(before));
    out.push(mathNode(m[1] ?? m[2] ?? m[3], display));
    eatNl = display;
    last = MATH_RE.lastIndex;
  }
  out.push(...plain(s.slice(last)));
  return out;
}
const aiBubble = (role, text, meta, pending) =>
  el('div', { class: 'ai-msg ' + role + (pending ? ' pending' : '') },
    el('div', { class: 'ai-msg-text' }, mdLite(text)),
    meta && el('div', { class: 'ai-msg-meta' }, meta));

function aiChatPanel(q, item, chat) {
  const box = el('div', { class: 'ai-chat' });
  const show = editing => box.replaceChildren(...(AiCfg.get().key && !editing ? chatView() : keyForm()));

  function keyForm() {
    const cfg = AiCfg.get();
    const input = (attrs, v) => { const n = el('input', Object.assign({ autocomplete: 'off', spellcheck: 'false' }, attrs)); n.value = v || ''; return n; };
    const prov = el('select', null, Object.entries(AI_PROVIDERS).map(([id, name]) => el('option', { value: id, selected: id === aiProvider() }, name)));
    const key = input({ type: 'password', placeholder: 'Dán API key…' }, cfg.key);
    const base = input({ type: 'url', placeholder: 'vd: https://api.dichvu.com/v1' }, cfg.base);
    const sel = el('select', null, Object.entries(AI_MODELS).map(([id, m]) =>
      el('option', { value: id, selected: id === aiModel() }, `${m.name} (${m.note}) – $${m.price[0]} / $${m.price[1]} mỗi 1 triệu token vào / ra`)));
    const modelTxt = input({ type: 'text', placeholder: 'Tên model theo dịch vụ, vd: claude-opus-5-5', list: 'ai-model-ids' },
      aiProvider() === 'anthropic' ? '' : cfg.model);
    const ids = el('datalist', { id: 'ai-model-ids' }, Object.keys(AI_MODELS).map(id => el('option', { value: id })));
    const baseField = el('label', { class: 'ai-field' }, 'Base URL (địa chỉ API của dịch vụ)', base);
    const officialModel = el('label', { class: 'ai-field' }, 'Model', sel);
    const customModel = el('label', { class: 'ai-field' }, 'Model', modelTxt, ids);
    const hint = el('p', { class: 'muted', style: 'margin:0' });
    const auto = el('input', { type: 'checkbox', checked: cfg.autoCheck !== false });
    const autoTr = el('input', { type: 'checkbox', checked: cfg.autoTranslate !== false });
    const sync = () => {
      const official = prov.value === 'anthropic';
      baseField.hidden = customModel.hidden = official;
      officialModel.hidden = !official;
      key.placeholder = official ? 'sk-ant-…' : 'Dán API key của dịch vụ…';
      hint.textContent = official
        ? 'Dán Claude API key (tạo ở console.anthropic.com). Mỗi lần hỏi được tính phí vào tài khoản API của bạn – nên đặt giới hạn chi tiêu cho key.'
        : 'Lấy Base URL, chuẩn API (Anthropic hay OpenAI) và tên model trong trang hướng dẫn của dịch vụ bạn mua key. Dịch vụ phải cho phép gọi trực tiếp từ trình duyệt (CORS).';
    };
    prov.addEventListener('change', sync);
    sync();
    const save = () => {
      const k = key.value.trim(), official = prov.value === 'anthropic';
      if (!k) return key.focus();
      if (official && !k.startsWith('sk-ant-') && !confirm('Key này không giống key Anthropic chính hãng (thường bắt đầu bằng "sk-ant-").\n' +
        'Nếu bạn mua key ở dịch vụ khác, bấm Huỷ rồi chọn "Bên thứ 3" ở ô Nhà cung cấp.\n\nVẫn lưu với Anthropic chính hãng?')) return prov.focus();
      if (!official && !/^https?:\/\/\S+$/i.test(base.value.trim())) { alert('Nhập Base URL bắt đầu bằng https://'); return base.focus(); }
      if (!official && !modelTxt.value.trim()) return modelTxt.focus();
      const next = { key: k, provider: prov.value, base: official ? '' : base.value.trim(), model: official ? sel.value : modelTxt.value.trim(), autoCheck: auto.checked, autoTranslate: autoTr.checked };
      const old = AiCfg.get();
      // Đổi nơi gọi / model thì xoá các hội thoại cũ (lịch sử có thể không tương thích)
      if (old.provider !== next.provider || old.base !== next.base || old.model !== next.model) aiChats.forEach(c => { if (!c.busy) c.msgs = []; });
      AiCfg.set(next);
      chat.err = null;
      show(false);
    };
    for (const n of [key, base, modelTxt]) n.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
    setTimeout(() => key.focus());
    return [
      el('div', { class: 'ai-chat-head' }, el('b', { class: 'ic-text' }, ic('settings'), 'Cài đặt chatbot')),
      hint,
      el('label', { class: 'ai-field' }, 'Nhà cung cấp', prov),
      baseField,
      el('label', { class: 'ai-field' }, 'API key', key),
      officialModel,
      customModel,
      el('label', { class: 'check' }, auto, 'Tự động đối chiếu đáp án khi bấm "Kiểm tra" (mỗi câu tốn 1 lượt gọi API)'),
      el('label', { class: 'check' }, autoTr, 'Bôi đen chữ tiếng Anh là tự dịch (mỗi đoạn mới tốn 1 lượt gọi API nhỏ)'),
      el('p', { class: 'muted', style: 'margin:0 0 8px;font-size:.82rem' },
        'Key chỉ lưu trong trình duyệt này, không nằm trong file HTML – gửi file cho người khác không lộ key.'),
      el('div', { class: 'row end' },
        cfg.key && el('button', { class: 'btn small ghost', type: 'button',
          onclick: () => { if (confirm('Xoá API key khỏi trình duyệt này?')) { AiCfg.set(Object.assign({}, AiCfg.get(), { key: '' })); show(true); } } }, 'Xoá key'),
        cfg.key && el('button', { class: 'btn small', type: 'button', onclick: () => show(false) }, 'Huỷ'),
        el('button', { class: 'btn small primary', type: 'button', onclick: save }, 'Lưu')),
    ];
  }

  function chatView() {
    const log = el('div', { class: 'ai-log' });
    const input = el('textarea', { class: 'ai-input', rows: 2, placeholder: 'Hỏi thêm về câu này… (Enter gửi · Shift+Enter xuống dòng)' });
    input.value = chat.draft || '';
    input.addEventListener('input', () => { chat.draft = input.value; });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    const hint = aiHintMode(item);
    const checkBtn = el('button', { class: 'btn small', type: 'button',
      onclick: () => aiAsk(chat, aiPrompt(q, item),
        hint ? 'Gợi ý giúp tôi cách làm câu này (chưa nói đáp án).' : 'Kiểm tra giúp tôi đáp án câu này.', false) },
      hint ? [ic('bulb'), 'Gợi ý'] : [ic('search-check'), 'Kiểm tra đáp án']);
    const stopBtn = el('button', { class: 'btn small', type: 'button', onclick: () => chat.ctrl?.abort() }, ic('stop'), 'Dừng');
    const sendBtn = el('button', { class: 'btn small primary', type: 'button', onclick: () => send() }, 'Gửi');
    function send() {
      const t = input.value.trim();
      if (!t || chat.busy) return;
      input.value = ''; chat.draft = '';
      // Tin đầu tiên chưa có ngữ cảnh → gửi kèm nội dung câu hỏi
      aiAsk(chat, chat.msgs.length ? t : `${aiPrompt(q, item)}\n\nCâu hỏi của tôi: ${t}`, t, true);
    }
    function draw() {
      log.replaceChildren(...[
        !chat.msgs.length && !chat.busy && el('p', { class: 'muted', style: 'margin:0' }, hint
          ? 'Bấm "Gợi ý" để AI chỉ hướng làm (không nói đáp án), hoặc gõ câu hỏi bên dưới. Đáp án trong đề không được gửi cho AI.'
          : 'Bấm "Kiểm tra đáp án" để AI tự giải rồi so với đáp án trong đề, hoặc gõ câu hỏi bên dưới.'),
        ...chat.msgs.map(m => aiBubble(m.role, m.shown, m.meta)),
        chat.busy && aiBubble('assistant', chat.partial || 'Đang suy nghĩ…', null, true),
        chat.err && el('div', { class: 'ai-err' }, chat.err),
      ].filter(Boolean));
      checkBtn.disabled = sendBtn.disabled = chat.busy;
      stopBtn.hidden = !chat.busy;
      if (!chat.busy && chat.draft && !input.value) input.value = chat.draft;   // khôi phục tin chưa gửi được
      log.scrollTop = log.scrollHeight;
    }
    chat.view = () => { if (log.isConnected) draw(); };
    draw();
    return [
      el('div', { class: 'ai-chat-head' },
        el('b', { class: 'ic-text' }, ic('message'), 'Chat với ' + aiModelName() + (aiProvider() === 'anthropic' ? '' : ' (bên thứ 3)')),
        el('span', { class: 'row' },
          chat.msgs.length > 0 && el('button', { class: 'link-btn', type: 'button',
            onclick: () => { if (!chat.busy) { chat.msgs = []; chat.err = null; draw(); } } }, 'Xoá hội thoại'),
          el('button', { class: 'link-btn', type: 'button', onclick: () => show(true) }, 'Cài đặt'))),
      log,
      el('div', { class: 'ai-compose' }, input, el('div', { class: 'ai-compose-btns' }, checkBtn, stopBtn, sendBtn)),
    ];
  }

  show(false);
  return box;
}

// ---------- Dịch Anh → Việt (nút "Dịch" ở mỗi câu + bôi đen để dịch) ----------
const TR_SYSTEM = 'Bạn là công cụ dịch Anh → Việt cho tài liệu môn ' + CFG.field + '. Chỉ trả về bản dịch: không giải thích, ' +
  'không trả lời hay giải câu hỏi, không nhận xét đáp án nào đúng. Giữ nguyên số, ký hiệu, công thức, code và tên hàm. ' +
  'Với thuật ngữ chuyên ngành, dịch sang tiếng Việt và ghi thuật ngữ gốc trong ngoặc, ví dụ "độ chính xác (precision)".';
const TR_STORE = STORE_KEY + '-tr';
const TrCache = {   // bản dịch cả câu được lưu lại → dịch lại không tốn thêm lượt gọi API
  mem: {},
  all() { try { return JSON.parse(localStorage.getItem(TR_STORE)) || this.mem; } catch (e) { return this.mem; } },
  get(k) { return this.all()[k]; },
  set(k, v) {
    const d = this.all(); d[k] = v; this.mem = d;
    try { localStorage.setItem(TR_STORE, JSON.stringify(d)); } catch (e) { /* dùng bộ nhớ tạm */ }
  },
};
const trKey = q => `${q.id}:${q.question.length}`;   // đề đổi nội dung thì dịch lại
const trState = new Map();   // id câu -> { open, loading, partial, err }
const googleTr = text => 'https://translate.google.com/?sl=en&tl=vi&op=translate&text=' + encodeURIComponent(text.slice(0, 4000));

/** Gọi AI dịch một đoạn; onDelta nhận bản dịch đang chạy */
async function aiTranslate(text, onDelta) {
  const r = await aiStream({ msgs: [{ role: 'user', content: text }] }, b => onDelta && onDelta(blocksText(b)),
    { system: TR_SYSTEM, effort: 'low' });
  if (r.stop === 'refusal') throw new Error('AI từ chối dịch đoạn này.');
  return blocksText(r.blocks).trim();
}

/** Câu hỏi + đáp án (thứ tự gốc), đánh dấu từng phần để tách lại sau khi dịch */
const trSource = q => 'Dịch nội dung dưới đây. Giữ nguyên các dấu mốc <<Q>>, <<1>>, <<2>>… ở đầu mỗi phần, không thêm gì khác.\n\n' +
  ['<<Q>>', q.question, ...q.options.flatMap((o, i) => [`<<${i + 1}>>`, o])].join('\n');
function trParse(text) {
  const parts = String(text).split(/<<\s*(Q|\d+)\s*>>/);
  const out = { q: '', opts: [] };
  for (let i = 1; i < parts.length; i += 2) {
    const v = (parts[i + 1] || '').trim();
    if (parts[i] === 'Q') out.q = v; else out.opts[+parts[i] - 1] = v;
  }
  return out.q ? out : null;
}

const trLabel = open => (open ? [ic('x'), 'Ẩn bản dịch'] : [ic('languages'), 'Dịch']);
/** Nút "Dịch" (đặt ở dòng thông tin câu hỏi) */
function trButton(q) {
  const st = trState.get(q.id);
  return el('button', { class: 'link-btn tr-btn', type: 'button', 'data-trbtn': q.id, onclick: () => trToggle(q) },
    trLabel(st?.open));
}
/** Khung bản dịch (đặt dưới câu hỏi); order = thứ tự đáp án đang hiển thị */
function trBox(q, order) {
  const st = trState.get(q.id) || {};
  const box = el('div', { class: 'tr-box', 'data-tr': q.id });
  box._q = q; box._order = order;
  if (!st.open) { box.hidden = true; return box; }
  const raw = TrCache.get(trKey(q));
  const head = el('div', { class: 'tr-head' }, el('b', { class: 'ic-text' }, ic('languages'), 'Bản dịch'),
    el('a', { class: 'link-btn', href: googleTr([q.question, ...q.options].join('\n')), target: '_blank', rel: 'noopener' }, 'Google Dịch', ic('external')));
  if (st.loading) {
    box.append(head, el('div', { class: 'muted' }, st.partial ? st.partial.replace(/<<\s*(Q|\d+)\s*>>\s*/g, '') : 'Đang dịch…'));
  } else if (st.err) {
    box.append(head, el('div', { class: 'ai-err' }, st.err));
  } else if (raw) {
    const p = trParse(raw);
    box.append(head, ...(p
      ? [richText(p.q), el('ol', { class: 'tr-opts' }, order.map((o, i) =>
        el('li', null, el('b', null, LETTERS[i] + '. '), p.opts[o] || q.options[o])))]
      : [richText(raw)]));
  }
  return box;
}
/** Vẽ lại nút + khung dịch của câu này ở mọi chỗ đang hiển thị */
function trRefresh(id) {
  document.querySelectorAll(`[data-tr="${id}"]`).forEach(n => n.replaceWith(trBox(n._q, n._order)));
  document.querySelectorAll(`[data-trbtn="${id}"]`).forEach(n => n.replaceChildren(...trLabel(trState.get(id)?.open)));
}
async function trToggle(q) {
  const st = trState.get(q.id) || trState.set(q.id, {}).get(q.id);
  if (st.open) { st.open = false; return trRefresh(q.id); }
  if (!TrCache.get(trKey(q)) && !AiCfg.get().key) {   // chưa cài chatbot → dùng Google Dịch
    window.open(googleTr([q.question, ...q.options].join('\n')), '_blank', 'noopener');
    return;
  }
  st.open = true; st.err = null;
  if (TrCache.get(trKey(q)) || st.loading) return trRefresh(q.id);
  st.loading = true; st.partial = '';
  trRefresh(q.id);
  try {
    const text = await aiTranslate(trSource(q), t => { st.partial = t; trRefresh(q.id); });
    TrCache.set(trKey(q), text);
  } catch (e) {
    st.err = aiErrText(e);
  } finally {
    st.loading = false;
    trRefresh(q.id);
  }
}

// Bôi đen chữ tiếng Anh → popup dịch ngay cạnh chỗ bôi
const trSelCache = new Map();
let trPop = null, trSelSeq = 0;
function trHidePop() {
  if (trPop) { trPop.remove(); trPop = null; }
  trSelSeq++;   // bỏ kết quả của lượt dịch cũ nếu còn đang chạy
}
function trShowPop(text, rect) {
  trHidePop();
  const seq = trSelSeq;
  const body = el('div', { class: 'tr-pop-text' });
  trPop = el('div', { class: 'tr-pop', role: 'dialog' },
    body,
    el('div', { class: 'tr-pop-foot' },
      el('a', { class: 'link-btn', href: googleTr(text), target: '_blank', rel: 'noopener' }, 'Google Dịch', ic('external')),
      el('button', { class: 'link-btn', type: 'button', onclick: trHidePop }, 'Đóng')));
  document.body.append(trPop);
  const place = () => {
    if (!trPop) return;
    const w = trPop.offsetWidth, h = trPop.offsetHeight;
    let top = rect.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, rect.top - h - 8);
    trPop.style.top = top + 'px';
    trPop.style.left = Math.min(Math.max(8, rect.left), window.innerWidth - w - 8) + 'px';
  };
  const cached = trSelCache.get(text);
  if (cached) { body.replaceChildren(...mdLite(cached)); return place(); }
  if (!AiCfg.get().key) {
    body.append(el('span', { class: 'muted' }, 'Cài chatbot (nút "Chat ngay trong app") để dịch ngay tại đây.'));
    return place();
  }
  body.textContent = 'Đang dịch…';
  place();
  aiTranslate(text, t => { if (seq === trSelSeq) { body.textContent = t || 'Đang dịch…'; place(); } })
    .then(t => { trSelCache.set(text, t); if (seq === trSelSeq) { body.replaceChildren(...mdLite(t)); place(); } })
    .catch(e => { if (seq === trSelSeq) { body.replaceChildren(el('span', { class: 'ai-err' }, aiErrText(e))); place(); } });
}
function trOnSelect(e) {
  if (e.target.closest?.('.tr-pop')) return;
  setTimeout(() => {   // đợi trình duyệt cập nhật vùng bôi đen
    const sel = window.getSelection();
    const text = sel && sel.rangeCount ? sel.toString().replace(/\s+/g, ' ').trim() : '';
    if (!text) return trHidePop();
    if (AiCfg.get().autoTranslate === false) return;
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const host = node.nodeType === 1 ? node : node.parentElement;
    // Chỉ dịch nội dung đề (bỏ qua ô nhập, khung chat, bản dịch) và khi có chữ tiếng Anh
    if (!host?.closest('#app') || host.closest('input, textarea, select, .ai-log, .tr-box, .tr-pop')) return;
    if (!/[A-Za-z]{2}/.test(text) || text.length > 1500) return;
    if (trPop && trPop._text === text) return;
    trShowPop(text, range.getBoundingClientRect());
    if (trPop) trPop._text = text;
  }, 10);
}
document.addEventListener('mouseup', trOnSelect);
document.addEventListener('touchend', trOnSelect);
document.addEventListener('keyup', e => { if (e.shiftKey) trOnSelect(e); });
document.addEventListener('mousedown', e => { if (trPop && !e.target.closest('.tr-pop')) trHidePop(); });
window.addEventListener('scroll', () => { if (trPop) trHidePop(); }, { passive: true });

function progressBar(ratio) {
  const bar = el('div', { class: 'progress' }, el('span'));
  bar.firstChild.style.width = `${Math.round(ratio * 100)}%`;
  return bar;
}

function tile(value, label, cls) {
  return el('div', { class: 'tile ' + (cls || '') }, el('div', { class: 'tile-value' }, value), el('div', { class: 'tile-label' }, label));
}

/** Thẻ xem lại một câu đã làm (kết quả trắc nghiệm / thi thử) */
function reviewCard(item, num, tag) {
  const q = QMAP.get(item.id);
  const status = !item.selected.length ? ['Bỏ trống', 'warn'] : item.ok ? ['Đúng', 'ok'] : ['Sai', 'bad'];
  return el('section', { class: 'card review-card' },
    el('div', { class: 'review-head' },
      el('b', null, `Câu ${num}`),
      el('div', { class: 'row' },
        item.flagged && el('span', { class: 'badge warn' }, ic('flag', 'fill'), 'Đã cắm cờ'),
        tag && el('span', { class: 'badge ' + tag[1] }, tag[0]),
        el('span', { class: 'badge ' + status[1] }, status[0]))),
    questionBlock(q, item),
    optionList(item, { reveal: true, onPick: null }),
    el('div', { class: 'answer-line' },
      'Bạn chọn: ', el('b', null, lettersOf(item, item.selected)),
      ' · Đáp án đúng: ', el('b', null, lettersOf(item, q.answer))),
    explainBlock(q),
    aiBox(q, item));
}

/** Biểu đồ đường % điểm các lần thi (SVG) */
function historyChart(list) {
  if (!list.length) return el('p', { class: 'muted' }, 'Chưa có lần thi thử nào. Làm một bài để bắt đầu theo dõi tiến bộ.');
  const pts = list.slice(-30);
  const W = 640, H = 230, L = 40, R = 16, T = 14, B = 30;
  const x = i => (pts.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (pts.length - 1));
  const y = v => T + ((100 - v) * (H - T - B)) / 100;
  const vals = pts.map(h => pct(h.correct, h.total));
  const offset = list.length - pts.length;
  const step = Math.ceil(pts.length / 10);

  const chart = svg('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Biểu đồ điểm các lần thi thử' });
  for (const v of [0, 25, 50, 75, 100]) {
    chart.append(svg('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
    chart.append(svg('text', { class: 'axis-label', x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, `${v}%`));
  }
  pts.forEach((_, i) => {
    if (i % step === 0 || i === pts.length - 1)
      chart.append(svg('text', { class: 'axis-label', x: x(i), y: H - 8, 'text-anchor': 'middle' }, `#${offset + i + 1}`));
  });
  const line = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  if (pts.length > 1) {
    chart.append(svg('polygon', { class: 'area', points: `${x(0)},${y(0)} ${line} ${x(pts.length - 1)},${y(0)}` }));
    chart.append(svg('polyline', { class: 'line', points: line }));
  }
  pts.forEach((h, i) => {
    chart.append(svg('circle', { class: 'dot', cx: x(i), cy: y(vals[i]), r: 5 },
      svg('title', null, `Lần ${offset + i + 1} · ${fmtDate(h.t)}: ${vals[i]}% (${h.correct}/${h.total})`)));
  });
  return chart;
}

function historyTable(list) {
  if (!list.length) return null;
  const rows = list.slice(-10).reverse();
  return el('div', { class: 'table-wrap' },
    el('table', { class: 'hist' },
      el('thead', null, el('tr', null, ['Ngày', 'Điểm', 'Đúng', '%', 'Thời gian'].map(h => el('th', null, h)))),
      el('tbody', null, rows.map(h => el('tr', null,
        el('td', null, fmtDate(h.t)),
        el('td', null, el('b', null, score10(h.correct, h.total))),
        el('td', null, `${h.correct}/${h.total}`),
        el('td', null, `${pct(h.correct, h.total)}%`),
        el('td', null, fmtTime(h.secs)))))));
}

// ---------- Điều hướng ----------
function go(name, ...args) {
  stopTicker();
  view = name;
  const screens = {
    home: renderHome, quizSetup: renderQuizSetup, examSetup: renderExamSetup,
    search: renderSearch, exam: renderExam,
  };
  screens[name](...args);
  window.scrollTo(0, 0);
}
/** Rời màn hình làm bài: hỏi lại nếu đang làm trắc nghiệm dở */
function leaveTo(name) {
  if (view === 'practice' && session && !session.done) savePractice();   // bài được lưu, vào lại làm tiếp
  go(name);
}

// =====================================================================
// TRANG CHỦ
// =====================================================================
function renderHome() {
  const { stats, history, exam } = Store.d;
  const ids = Object.keys(stats).filter(id => QMAP.has(+id));
  let c = 0, w = 0;
  ids.forEach(id => { c += stats[id].c; w += stats[id].w; });
  const nWrong = wrongIds().length;
  const exams = history.filter(h => h.mode === 'exam');

  const modeBtn = (icon, name, desc, onclick, extra) =>
    el('button', { class: 'mode-btn ' + (extra?.cls || ''), type: 'button', onclick },
      el('span', { class: 'mode-icon' }, ic(icon)),
      el('span', { class: 'mode-name' }, name),
      el('span', { class: 'mode-desc' }, desc),
      extra?.count ? el('span', { class: 'mode-count' }, extra.count) : null);

  mount(
    el('h1', null, CFG.title),
    practiceBanner(),
    exam && resumeBanner(),
    el('div', { class: 'tiles' },
      tile(QUESTIONS.length, 'Tổng số câu'),
      tile(`${ids.length}`, `Đã làm ít nhất 1 lần (${pct(ids.length, QUESTIONS.length)}%)`),
      tile(c + w ? `${pct(c, c + w)}%` : '—', `Tỉ lệ đúng tổng (${c}/${c + w} lượt)`, 'ok'),
      tile(nWrong, 'Câu sai chờ ôn', nWrong ? 'bad' : '')),
    el('div', { class: 'modes' },
      modeBtn('quiz', 'Trắc nghiệm', 'Chọn chủ đề, chấm ngay từng câu', () => go('quizSetup'), { cls: 'main' }),
      modeBtn('review', 'Ôn câu sai', nWrong ? `Đúng 2 lần liên tiếp để gỡ` : 'Chưa có câu sai nào', startReview, { count: nWrong }),
      modeBtn('exam', 'Thi thử', 'Tính giờ, chấm khi nộp bài', () => go('examSetup')),
      modeBtn('search', 'Tìm câu hỏi', 'Tra nhanh đáp án theo từ khoá', () => go('search'))),
    el('section', { class: 'card' },
      el('div', { class: 'section-head' },
        el('h2', null, 'Tiến độ theo chủ đề'),
        el('span', { class: 'muted' }, 'Thanh xanh = số câu trả lời đúng ở lần gần nhất · bấm để luyện chủ đề')),
      TOPICS.map(topicRow)),
    el('section', { class: 'card' },
      el('div', { class: 'section-head' },
        el('h2', null, 'Tiến bộ thi thử'),
        exams.length ? el('span', { class: 'muted' }, `${exams.length} lần thi`) : null),
      historyChart(exams)),
    el('div', { class: 'footer-actions' },
      el('button', { class: 'btn small', type: 'button', onclick: exportProgress }, ic('download'), 'Xuất tiến độ'),
      el('button', { class: 'btn small', type: 'button', onclick: importProgress }, ic('upload'), 'Nhập tiến độ'),
      el('button', { class: 'btn small', type: 'button', disabled: !nWrong, onclick: clearWrong }, 'Xoá hết câu sai'),
      el('button', { class: 'btn small ghost', type: 'button', onclick: resetAll }, 'Xoá toàn bộ tiến độ')));
}

function topicRow(topic) {
  const qs = QUESTIONS.filter(q => q.topic === topic);
  const st = Store.d.stats;
  const done = qs.filter(q => st[q.id]).length;
  const right = qs.filter(q => st[q.id]?.last).length;
  const bar = el('div', { class: 'bar' }, el('span'));
  bar.firstChild.style.width = `${pct(right, qs.length)}%`;
  return el('button', {
    class: 'topic-row', type: 'button', title: `Luyện chủ đề "${topic}"`,
    onclick: () => { Store.d.prefs.quizTopics = [topic]; Store.save(); go('quizSetup'); },
  },
    el('span', { class: 'topic-name' }, topic),
    bar,
    el('span', { class: 'topic-num' }, `${right}/${qs.length} đúng · đã làm ${done}`));
}

function resumeBanner() {
  const ex = Store.d.exam;
  const left = (ex.endAt - Date.now()) / 1000;
  return el('div', { class: 'banner' },
    el('div', null, el('b', null, 'Bạn có bài thi thử đang làm dở. '),
      left > 0 ? `Còn ${fmtTime(left)}.` : 'Đã hết giờ – bài sẽ được nộp khi mở lại.'),
    el('div', { class: 'row' },
      el('button', { class: 'btn small ghost', type: 'button', onclick: discardExam }, 'Huỷ bài'),
      el('button', { class: 'btn small primary', type: 'button', onclick: () => go('exam') }, 'Tiếp tục')));
}

/** Xuất toàn bộ tiến độ ra file JSON để sao lưu / chuyển máy (không kèm API key) */
function exportProgress() {
  const payload = { app: CFG.subject, storeKey: STORE_KEY, version: 1, exportedAt: new Date().toISOString(), data: Store.d };
  const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(blob), download: `${CFG.subject}-tien-do-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Bỏ dữ liệu không còn khớp bộ đề: câu sai đã bị xoá, bài làm dở hỏng */
function sanitizeStore() {
  const d = Store.d;
  for (const id of Object.keys(d.wrong)) if (!QMAP.has(+id)) delete d.wrong[id];
  const valid = s => s && Array.isArray(s.items) && s.items[s.idx] && s.items.every(it => QMAP.has(it.id));
  if (d.practice && !valid(d.practice)) d.practice = null;
  if (d.exam && !valid(d.exam)) d.exam = null;
}

/** Nhập tiến độ từ file JSON (thay thế tiến độ hiện tại của môn này) */
function importProgress() {
  const input = el('input', { type: 'file', accept: '.json,application/json' });
  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    let obj = null;
    try { obj = JSON.parse(await file.text()); } catch (e) { /* xử lý bên dưới */ }
    const d = obj && obj.data;
    const ok = d && typeof d === 'object' && typeof d.stats === 'object' && typeof d.wrong === 'object' && Array.isArray(d.history);
    if (!ok) return alert('File không hợp lệ: không phải file tiến độ xuất từ app ôn thi.');
    if (obj.storeKey && obj.storeKey !== STORE_KEY &&
        !confirm(`File này là tiến độ môn ${obj.app || obj.storeKey}, không phải ${CFG.subject}. Vẫn nhập?`)) return;
    const n = Object.keys(d.stats).length, h = d.history.length;
    if (!confirm(`Nhập tiến độ (${n} câu đã làm, ${h} lượt lịch sử)?\nTiến độ hiện tại của ${CFG.subject} sẽ bị thay thế.`)) return;
    const theme = Store.d.prefs.theme;
    Store.d = Object.assign({ stats: {}, wrong: {}, history: [], prefs: {}, practice: null, exam: null, lastExam: null }, d);
    Store.d.prefs = Object.assign({}, Store.d.prefs, theme ? { theme } : {});
    sanitizeStore();
    Store.save();
    applyTheme();
    renderHome();
  });
  input.click();
}

function clearWrong() {
  if (!confirm(`Xoá ${wrongIds().length} câu khỏi danh sách câu sai?`)) return;
  Store.d.wrong = {};
  Store.save();
  renderHome();
}
function resetAll() {
  if (!confirm('Xoá TOÀN BỘ tiến độ (thống kê, câu sai, lịch sử thi)? Không thể hoàn tác.')) return;
  const theme = Store.d.prefs.theme;
  localStorage.removeItem(STORE_KEY);
  Store.load();
  Store.d.prefs.theme = theme;
  Store.save();
  renderHome();
}

// =====================================================================
// CHẾ ĐỘ 1: TRẮC NGHIỆM CÓ CHẤM ĐIỂM
// =====================================================================
function renderQuizSetup() {
  const p = Store.d.prefs;
  const chosen = new Set((p.quizTopics || TOPICS).filter(t => TOPICS.includes(t)));
  let count = p.quizCount ?? 20;
  const info = el('span', { class: 'muted' });

  const inPool = q => chosen.has(q.topic);
  const poolSize = () => QUESTIONS.filter(inPool).length;
  const refresh = () => {
    const n = poolSize();
    info.textContent = `Có ${n} câu trong các chủ đề đã chọn → sẽ làm ${count === 0 ? n : Math.min(count, n)} câu.`;
    startBtn.disabled = n === 0;
  };

  const topicChips = TOPICS.map(t => {
    const box = el('input', { type: 'checkbox', checked: chosen.has(t),
      onchange: e => { e.target.checked ? chosen.add(t) : chosen.delete(t); refresh(); } });
    return el('label', { class: 'chip' }, box, t, el('span', { class: 'muted' }, QUESTIONS.filter(q => q.topic === t).length));
  });
  const setAll = on => {
    topicChips.forEach((chip, i) => { chip.querySelector('input').checked = on; on ? chosen.add(TOPICS[i]) : chosen.delete(TOPICS[i]); });
    refresh();
  };
  const countChips = [10, 20, 50, 0].map(n => el('label', { class: 'chip' },
    el('input', { type: 'radio', name: 'count', checked: count === n, onchange: () => { count = n; refresh(); } }),
    n === 0 ? 'Tất cả' : `${n} câu`));
  let retryGap = retryGapPref();
  const retryChips = RETRY_GAPS.map(n => el('label', { class: 'chip' },
    el('input', { type: 'radio', name: 'retry', checked: retryGap === n, onchange: () => { retryGap = n; } }),
    n === 0 ? 'Tắt' : `Sau ${n} câu`));
  const shuffleQ = el('input', { type: 'checkbox', checked: p.quizShuffleQ ?? true });
  const shuffleO = el('input', { type: 'checkbox', checked: p.quizShuffleO ?? true });
  const startBtn = el('button', { class: 'btn primary', type: 'button', onclick: start }, 'Bắt đầu', ic('enter', 'kbd'));

  function start() {
    let pool = QUESTIONS.filter(inPool);
    if (!pool.length) return;
    if (shuffleQ.checked) pool = shuffle(pool.slice());
    if (count) pool = pool.slice(0, count);
    Object.assign(p, { quizTopics: [...chosen], quizCount: count, quizShuffleQ: shuffleQ.checked, quizShuffleO: shuffleO.checked, quizRetryGap: retryGap });
    Store.save();
    startPractice('quiz', pool, shuffleO.checked);
  }

  mount(
    el('h1', null, ic('quiz'), 'Trắc nghiệm có chấm điểm'),
    practiceBanner(),
    el('section', { class: 'card' },
      el('div', { class: 'field' },
        el('div', { class: 'field-label' }, 'Chủ đề',
          el('button', { class: 'link-btn', type: 'button', onclick: () => setAll(true) }, 'Chọn tất cả'),
          el('button', { class: 'link-btn', type: 'button', onclick: () => setAll(false) }, 'Bỏ chọn')),
        el('div', { class: 'chips' }, topicChips)),
      el('div', { class: 'field' }, el('div', { class: 'field-label' }, 'Số câu'), el('div', { class: 'chips' }, countChips)),
      el('div', { class: 'field' },
        el('div', { class: 'field-label' }, 'Hỏi lại câu sai trong bài',
          el('span', { class: 'muted', style: 'font-weight:400' }, 'làm sai sẽ được hỏi lại sau vài câu, đến khi trả lời đúng')),
        el('div', { class: 'chips' }, retryChips)),
      el('div', { class: 'field' },
        el('div', { class: 'field-label' }, 'Tuỳ chọn'),
        el('label', { class: 'check' }, shuffleQ, 'Xáo thứ tự câu hỏi (tắt: làm theo thứ tự trong đề)'),
        el('label', { class: 'check' }, shuffleO, 'Xáo thứ tự đáp án (giữ nguyên các đáp án kiểu "All of the others")')),
      el('div', { class: 'row', style: 'justify-content:space-between' }, info, startBtn)));
  refresh();
  view = 'quizSetup';
  setupStart = start;
}
let setupStart = null;   // hàm "Bắt đầu" của màn cấu hình hiện tại (cho phím Enter)

const RETRY_GAPS = [0, 3, 5, 10];   // "Hỏi lại câu sai sau N câu" (0 = tắt)
const retryGapPref = () => (RETRY_GAPS.includes(Store.d.prefs.quizRetryGap) ? Store.d.prefs.quizRetryGap : 5);

/** Bắt đầu phiên luyện tập: mode = 'quiz' | 'review' */
function startPractice(mode, questions, shuffleOpts) {
  const old = Store.d.practice;
  if (old && !confirm(`Bài ${old.mode === 'review' ? 'ôn câu sai' : 'trắc nghiệm'} đang làm dở sẽ bị thay thế. Tiếp tục?`)) return;
  const items = questions.map((q, i) => Object.assign(makeItem(q, shuffleOpts), { no: i + 1, retry: 0 }));
  session = { mode, items, total: items.length, idx: 0, startedAt: Date.now(), done: false, shuffleOpts, retryGap: retryGapPref() };
  runPractice();
}

/** Mở màn làm bài cho session hiện tại (bài mới hoặc bài tiếp tục) */
function runPractice() {
  view = 'practice';
  renderPractice();
  window.scrollTo(0, 0);
  startTicker(() => setText('clock-t', fmtTime((Date.now() - session.startedAt) / 1000)));
}

/** Lưu bài đang làm vào localStorage để thoát ra vào lại vẫn làm tiếp được */
function savePractice() {
  session.elapsed = Date.now() - session.startedAt;   // thời gian đã làm (không tính lúc thoát ra)
  Store.d.practice = session;
  Store.save();
}
/** Tiếp tục bài đang làm dở */
function resumePractice() {
  const p = Store.d.practice;
  if (!p) return;
  session = p;
  session.startedAt = Date.now() - (p.elapsed || 0);
  runPractice();
}
function discardPractice() {
  if (!confirm('Bỏ bài đang làm dở? Các câu đã kiểm tra vẫn nằm trong thống kê.')) return;
  Store.d.practice = null;
  Store.save();
  go(view === 'quizSetup' ? 'quizSetup' : 'home');
}
function practiceBanner() {
  const p = Store.d.practice;
  if (!p) return null;
  const done = p.items.filter(it => !it.retry && it.checked).length;
  const name = p.mode === 'review' ? 'ôn câu sai' : 'trắc nghiệm';
  return el('div', { class: 'banner' },
    el('div', null, el('b', null, `Bạn đang làm dở bài ${name}. `),
      `Đã làm ${done}/${p.total} câu · ${fmtTime((p.elapsed || 0) / 1000)}.`),
    el('div', { class: 'row' },
      el('button', { class: 'btn small ghost', type: 'button', onclick: discardPractice }, 'Bỏ bài'),
      el('button', { class: 'btn small primary', type: 'button', onclick: resumePractice }, `Tiếp tục từ câu ${p.items[p.idx].no}`, ic('arrow-right'))));
}

// Lượt hỏi lại (retry > 0) không tính vào điểm / thống kê, chỉ để ghi nhớ
const firstTries = s => s.items.filter(it => !it.retry);
const pendingRetries = s => s.items.filter((it, i) => it.retry && !it.checked && i !== s.idx).length;

function renderPractice() {
  savePractice();   // mọi thay đổi (chọn, kiểm tra, sang câu) đều đi qua đây → lưu luôn
  const s = session, item = s.items[s.idx], q = QMAP.get(item.id);
  const answered = firstTries(s).filter(it => it.checked);
  const right = answered.filter(it => it.ok).length;
  const last = s.idx === s.items.length - 1;
  const inWrong = Store.d.wrong[q.id];
  const waiting = pendingRetries(s);

  const mainBtn = item.checked
    ? el('button', { class: 'btn primary', type: 'button', onclick: nextPractice }, last ? 'Xem kết quả' : 'Câu tiếp', ic('enter', 'kbd'))
    : el('button', { class: 'btn primary', type: 'button', disabled: !item.selected.length, onclick: checkPractice }, 'Kiểm tra', ic('enter', 'kbd'));

  mount(
    el('div', { class: 'run-head' },
      el('div', { class: 'run-title' }, s.mode === 'review' ? [ic('review'), 'Ôn câu sai'] : [ic('quiz'), 'Trắc nghiệm'],
        el('span', { class: 'muted' }, item.retry ? ` · Hỏi lại câu ${item.no}` : ` · Câu ${item.no}/${s.total}`)),
      el('div', { class: 'run-stats' },
        s.mode === 'review' && inWrong != null && !item.checked && !item.retry
          ? el('span', { class: 'pill' }, `Chuỗi đúng ${inWrong}/${STREAK_TO_CLEAR}`) : null,
        waiting > 0 && el('span', { class: 'pill warn', title: 'Số câu sai đang chờ được hỏi lại' }, ic('review'), `Chờ hỏi lại ${waiting}`),
        el('span', { class: 'pill ok' }, `Đúng ${right}/${answered.length}`),
        el('span', { class: 'pill', id: 'clock' }, ic('clock'), el('span', { id: 'clock-t' }, fmtTime((Date.now() - s.startedAt) / 1000))))),
    progressBar((s.idx + (item.checked ? 1 : 0)) / s.items.length),
    el('section', { class: 'card' + (item.retry ? ' retry-card' : '') },
      item.retry > 0 && el('div', { class: 'retry-tag' }, ic('review'),
        `Hỏi lại${item.retry > 1 ? ` lần ${item.retry}` : ''} – bạn đã trả lời sai câu này, thử nhớ lại nhé!`),
      questionBlock(q, item),
      optionList(item, {
        reveal: item.checked,
        onPick: item.checked ? null : orig => { pickOption(item, orig); renderPractice(); },
      }),
      item.checked && feedbackBlock(item, q),
      item.checked && explainBlock(q),
      aiBox(q, item),   // chưa kiểm tra: chế độ gợi ý; đã kiểm tra: kiểm tra đáp án
      el('div', { class: 'actions' },
        el('button', { class: 'btn ghost', type: 'button', onclick: finishPractice }, 'Kết thúc'),
        mainBtn),
      el('p', { class: 'hint' }, 'Phím tắt: 1–5 hoặc A–E chọn đáp án · Enter kiểm tra / sang câu tiếp')));
}

function feedbackBlock(item, q) {
  const r = item.result || {};
  const notes = [];
  if (item.retry) {
    if (item.ok) notes.push('Đã nhớ được câu này (lượt hỏi lại không tính vào điểm).');
  } else if (item.ok && r.cleared) notes.push('Đã đúng 2 lần liên tiếp – gỡ khỏi danh sách câu sai.');
  else if (item.ok && r.wasWrong) notes.push(`Chuỗi đúng ${r.streak}/${STREAK_TO_CLEAR} – đúng thêm lần nữa để gỡ khỏi danh sách câu sai.`);
  else if (!item.ok) notes.push('Đã thêm vào danh sách ôn câu sai.');
  if (!item.ok && item.requeueIn != null) {
    notes.push(item.requeueIn > 0 ? `Sẽ hỏi lại sau ${item.requeueIn} câu.` : 'Sẽ hỏi lại ngay câu tiếp theo.');
  }
  return el('div', { class: 'feedback ' + (item.ok ? 'ok' : 'bad') },
    el('div', { class: 'ic-text' }, item.ok ? [ic('check'), 'Chính xác!'] : [ic('x'), `Chưa đúng — đáp án đúng: ${lettersOf(item, q.answer)}`]),
    notes.length > 0 && el('small', null, notes.join(' ')));
}

/** Chèn lại câu vừa sai vào sau retryGap câu nữa (xáo đáp án mới để không nhớ vị trí) */
function requeue(item) {
  const s = session;
  const copy = Object.assign(makeItem(QMAP.get(item.id), s.shuffleOpts), { no: item.no, retry: item.retry + 1 });
  const at = Math.min(s.items.length, s.idx + 1 + s.retryGap);
  s.items.splice(at, 0, copy);
  item.requeueIn = at - s.idx - 1;
}

function checkPractice() {
  const item = session.items[session.idx];
  if (item.checked || !item.selected.length) return;
  item.checked = true;
  item.ok = isCorrect(item);
  if (!item.retry) item.result = recordAnswer(item.id, item.ok);   // chỉ lần đầu ghi vào tiến độ
  if (!item.ok && session.retryGap) requeue(item);
  aiAutoCheck(item);
  renderPractice();
}

/** Đã cài chatbot + bật tự động: bấm Kiểm tra là mở chat và nhờ AI đối chiếu đáp án (mỗi câu 1 lần) */
function aiAutoCheck(item) {
  const cfg = AiCfg.get();
  if (!cfg.key || cfg.autoCheck === false) return;
  const chat = aiChat(item.id);
  if (chat.autoChecked || chat.busy) return;   // lượt hỏi lại cùng câu không gọi thêm
  chat.autoChecked = true;
  chat.open = true;
  aiAsk(chat, aiPrompt(QMAP.get(item.id), item), 'Kiểm tra giúp tôi đáp án câu này.', false);
}
function nextPractice() {
  if (session.idx >= session.items.length - 1) return finishPractice();
  session.idx++;
  renderPractice();
  window.scrollTo(0, 0);
}

function finishPractice() {
  const s = session;
  const answered = firstTries(s).filter(it => it.checked);
  const left = s.items.filter(it => !it.checked).length;
  if (!s.done && left && !confirm(`Còn ${left} câu chưa làm (kể cả câu chờ hỏi lại). Kết thúc bài?`)) return;
  stopTicker();
  if (!s.done) {
    s.done = true;
    s.secs = (Date.now() - s.startedAt) / 1000;
    Store.d.practice = null;   // làm xong → không còn bài dở
    Store.save();
    if (answered.length) {
      Store.d.history.push({ t: s.startedAt, mode: s.mode, total: answered.length, correct: answered.filter(i => i.ok).length, secs: s.secs });
      Store.save();
    }
  }
  if (!answered.length) return go('home');
  view = 'practiceResult';
  renderPracticeResult();
  window.scrollTo(0, 0);
}

function renderPracticeResult() {
  const s = session;
  const answered = firstTries(s).filter(it => it.checked);
  const wrong = answered.filter(it => !it.ok);
  const right = answered.length - wrong.length;
  const cleared = answered.filter(it => it.result?.cleared).length;
  const skipped = s.total - answered.length;
  const p = pct(right, answered.length);
  // Câu sai lần đầu nhưng đã trả lời đúng ở lượt hỏi lại
  const fixed = new Set(s.items.filter(it => it.retry && it.ok).map(it => it.id));
  const retries = s.items.filter(it => it.retry && it.checked).length;

  mount(
    el('h1', null, s.mode === 'review' ? [ic('review'), 'Kết quả ôn câu sai'] : [ic('quiz'), 'Kết quả trắc nghiệm']),
    el('div', { class: 'tiles' },
      tile(score10(right, answered.length), 'Điểm (thang 10, lần đầu)'),
      tile(`${right}/${answered.length}`, 'Số câu đúng lần đầu', 'ok'),
      tile(`${p}%`, 'Tỉ lệ đúng', p >= 50 ? 'ok' : 'bad'),
      tile(fmtTime(s.secs), 'Thời gian')),
    wrong.length > 0 && retries > 0 && el('p', null, ic('review', 'muted-ic'),
      ` Hỏi lại: đã nhớ được `, el('b', null, `${wrong.filter(it => fixed.has(it.id)).length}/${wrong.length}`),
      ` câu sai sau ${retries} lượt hỏi lại.`),
    (skipped || s.mode === 'review') && el('p', { class: 'muted' },
      skipped ? `Bạn dừng sớm, ${skipped} câu chưa làm không được tính. ` : '',
      s.mode === 'review' ? `Đã gỡ ${cleared} câu khỏi danh sách · còn ${wrongIds().length} câu sai chờ ôn.` : ''),
    el('div', { class: 'row', style: 'margin-bottom:16px' },
      wrong.length > 0 && el('button', { class: 'btn primary', type: 'button',
        onclick: () => startPractice('quiz', wrong.map(i => QMAP.get(i.id)), s.shuffleOpts) }, `Làm lại ${wrong.length} câu sai này`),
      wrongIds().length > 0 && el('button', { class: 'btn', type: 'button', onclick: startReview }, 'Ôn câu sai'),
      el('button', { class: 'btn', type: 'button', onclick: () => go('quizSetup') }, 'Trắc nghiệm mới'),
      el('button', { class: 'btn ghost', type: 'button', onclick: () => go('home') }, 'Trang chủ')),
    el('h2', null, wrong.length ? `Các câu sai lần đầu (${wrong.length})` : ['Không sai câu nào', ic('trophy', 'ok-ic')]),
    wrong.map(it => reviewCard(it, it.no,
      retries > 0 ? (fixed.has(it.id) ? ['Đã nhớ khi hỏi lại', 'ok'] : ['Chưa nhớ được', 'bad']) : null)));
}

// =====================================================================
// CHẾ ĐỘ 2: ÔN LẠI CÂU SAI (Leitner đơn giản)
// =====================================================================
function startReview() {
  const ids = wrongIds();
  if (!ids.length) {
    view = 'reviewEmpty';
    mount(el('section', { class: 'card empty' },
      el('div', { class: 'big' }, ic('trophy', 'ok-ic')),
      el('h2', null, 'Không còn câu sai nào'),
      el('p', null, 'Mọi câu làm sai ở các chế độ khác sẽ tự động được gom vào đây.'),
      el('button', { class: 'btn primary', type: 'button', onclick: () => go('quizSetup') }, 'Làm trắc nghiệm')));
    return;
  }
  // Ưu tiên câu có chuỗi đúng thấp, trong cùng mức thì xáo ngẫu nhiên
  const qs = shuffle(ids.map(id => QMAP.get(id))).sort((a, b) => Store.d.wrong[a.id] - Store.d.wrong[b.id]);
  startPractice('review', qs, Store.d.prefs.quizShuffleO ?? true);
}

// =====================================================================
// CHẾ ĐỘ 3: THI THỬ TÍNH GIỜ
// =====================================================================
function renderExamSetup() {
  const p = Store.d.prefs;
  const nInput = el('input', { class: 'num-input', type: 'number', min: 1, max: QUESTIONS.length, value: p.examCount ?? Math.min(CFG.examCount, QUESTIONS.length) });
  const mInput = el('input', { class: 'num-input', type: 'number', min: 1, max: 600, value: p.examMinutes ?? CFG.examMinutes });
  const shuffleO = el('input', { type: 'checkbox', checked: p.examShuffleO ?? true });
  const exams = Store.d.history.filter(h => h.mode === 'exam');

  function start() {
    const n = Math.min(QUESTIONS.length, Math.max(1, parseInt(nInput.value, 10) || CFG.examCount));
    const minutes = Math.min(600, Math.max(1, parseInt(mInput.value, 10) || CFG.examMinutes));
    if (Store.d.exam && !confirm('Bài thi đang làm dở sẽ bị huỷ. Bắt đầu bài mới?')) return;
    Object.assign(p, { examCount: n, examMinutes: minutes, examShuffleO: shuffleO.checked });
    const now = Date.now();
    Store.d.exam = {
      items: shuffle(QUESTIONS.slice()).slice(0, n).map(q => makeItem(q, shuffleO.checked)),
      idx: 0, startedAt: now, endAt: now + minutes * 60000, minutes,
    };
    Store.save();
    go('exam');
  }

  mount(
    el('h1', null, ic('exam'), 'Thi thử tính giờ'),
    Store.d.exam && resumeBanner(),
    el('section', { class: 'card' },
      el('div', { class: 'row', style: 'gap:24px;margin-bottom:14px' },
        el('label', null, el('div', { class: 'field-label' }, 'Số câu'), nInput),
        el('label', null, el('div', { class: 'field-label' }, 'Thời gian (phút)'), mInput)),
      el('label', { class: 'check' }, shuffleO, 'Xáo thứ tự đáp án'),
      el('p', { class: 'muted' }, 'Câu hỏi lấy ngẫu nhiên từ tất cả chủ đề. Không hiện đáp án khi đang làm; hết giờ bài tự nộp. ' +
        'Bài làm được lưu liên tục – lỡ đóng trang vẫn tiếp tục được (đồng hồ vẫn chạy).'),
      el('div', { class: 'row end' },
        Store.d.lastExam && el('button', { class: 'btn', type: 'button', onclick: () => showExamResult(Store.d.lastExam) }, 'Xem lại bài gần nhất'),
        el('button', { class: 'btn primary', type: 'button', onclick: start }, 'Bắt đầu thi', ic('enter', 'kbd')))),
    el('section', { class: 'card' },
      el('div', { class: 'section-head' }, el('h2', null, 'Lịch sử thi thử'), exams.length ? el('span', { class: 'muted' }, `${exams.length} lần`) : null),
      historyChart(exams),
      historyTable(exams)));
  setupStart = start;
}

function renderExam() {
  const ex = Store.d.exam;
  if (!ex) return go('examSetup');
  if (Date.now() >= ex.endAt) return submitExam(true);   // mở lại khi đã hết giờ
  view = 'exam';

  const item = ex.items[ex.idx], q = QMAP.get(item.id);
  const n = ex.items.length;
  const done = ex.items.filter(i => i.selected.length).length;
  const left = (ex.endAt - Date.now()) / 1000;

  mount(
    el('div', { class: 'run-head' },
      el('div', { class: 'run-title' }, ic('exam'), 'Thi thử', el('span', { class: 'muted' }, ` · Câu ${ex.idx + 1}/${n}`)),
      el('div', { class: 'run-stats' },
        el('span', { class: 'pill' }, `Đã làm ${done}/${n}`),
        el('span', { class: 'pill' + (left <= 60 ? ' urgent' : ''), id: 'clock' }, ic('clock'), el('span', { id: 'clock-t' }, fmtTime(left))))),
    progressBar(done / n),
    el('div', { class: 'exam-layout' },
      el('section', { class: 'card' },
        questionBlock(q, item),
        optionList(item, { reveal: false, onPick: orig => { pickOption(item, orig); saveExam(); renderExam(); } }),
        el('div', { class: 'actions' },
          el('button', { class: 'btn', type: 'button', disabled: ex.idx === 0, onclick: () => examGoto(ex.idx - 1) }, ic('arrow-left'), 'Trước'),
          el('button', { class: 'btn' + (item.flagged ? ' active' : ''), type: 'button', onclick: toggleFlag },
            item.flagged ? [ic('flag', 'fill'), 'Bỏ cờ'] : [ic('flag'), 'Cắm cờ']),
          item.selected.length > 0 && el('button', { class: 'btn ghost', type: 'button',
            onclick: () => { item.selected = []; saveExam(); renderExam(); } }, 'Xoá lựa chọn'),
          el('span', { class: 'spacer' }),
          el('button', { class: 'btn primary', type: 'button', disabled: ex.idx === n - 1, onclick: () => examGoto(ex.idx + 1) }, 'Sau', ic('arrow-right'))),
        el('p', { class: 'hint' }, 'Phím tắt: 1–5 / A–E chọn · ← → chuyển câu · Enter câu sau · F cắm cờ')),
      el('aside', { class: 'card nav-panel' },
        el('b', null, 'Bảng câu hỏi'),
        el('div', { class: 'nav-grid' }, ex.items.map((it, i) => el('button', {
          type: 'button',
          class: 'nav-cell' + (it.selected.length ? ' answered' : '') + (it.flagged ? ' flagged' : '') + (i === ex.idx ? ' current' : ''),
          title: `Câu ${i + 1}` + (it.flagged ? ' (đã cắm cờ)' : ''),
          onclick: () => examGoto(i),
        }, i + 1))),
        el('div', { class: 'legend' },
          el('span', null, el('i', { class: 'a' }), 'Đã làm'),
          el('span', null, el('i'), 'Chưa làm'),
          el('span', null, el('i', { class: 'f' }), 'Cắm cờ')),
        el('button', { class: 'btn danger block', type: 'button', onclick: () => submitExam(false) }, 'Nộp bài'))));

  if (!ticker) startTicker(examTick);
}

function examTick() {
  const ex = Store.d.exam;
  if (!ex) return stopTicker();
  const left = (ex.endAt - Date.now()) / 1000;
  setText('clock-t', fmtTime(left));
  if (left <= 60) document.getElementById('clock')?.classList.add('urgent');
  if (left <= 0) submitExam(true);
}
function saveExam() { Store.save(); }
function examGoto(i) {
  const ex = Store.d.exam;
  if (i < 0 || i >= ex.items.length) return;
  ex.idx = i;
  saveExam();
  renderExam();
}
function toggleFlag() {
  const ex = Store.d.exam, item = ex.items[ex.idx];
  item.flagged = !item.flagged;
  saveExam();
  renderExam();
}
function discardExam() {
  if (!confirm('Huỷ bài thi đang làm dở? Bài này sẽ không được chấm.')) return;
  Store.d.exam = null;
  Store.save();
  go(view === 'examSetup' ? 'examSetup' : 'home');
}

/** Nộp bài: chấm điểm, ghi thống kê (câu bỏ trống không tính vào thống kê từng câu) */
function submitExam(auto) {
  const ex = Store.d.exam;
  if (!ex) return;
  const blank = ex.items.filter(i => !i.selected.length).length;
  if (!auto && !confirm(blank ? `Còn ${blank} câu chưa làm. Vẫn nộp bài?` : 'Nộp bài và xem kết quả?')) return;
  stopTicker();
  for (const it of ex.items) {
    it.checked = true;
    it.ok = it.selected.length ? isCorrect(it) : false;
    if (it.selected.length) recordAnswer(it.id, it.ok);
  }
  const correct = ex.items.filter(i => i.ok).length;
  const secs = Math.max(0, Math.min(Date.now(), ex.endAt) - ex.startedAt) / 1000;
  const result = { t: ex.startedAt, items: ex.items, secs, minutes: ex.minutes, auto, correct };
  Store.d.history.push({ t: ex.startedAt, mode: 'exam', total: ex.items.length, correct, secs });
  Store.d.lastExam = result;
  Store.d.exam = null;
  Store.save();
  showExamResult(result);
}

function showExamResult(result, filter = 'all') {
  stopTicker();
  view = 'examResult';
  const items = result.items;
  const groups = {
    all: ['Tất cả', () => true],
    wrong: ['Sai', i => i.selected.length && !i.ok],
    blank: ['Bỏ trống', i => !i.selected.length],
    flagged: ['Cắm cờ', i => i.flagged],
    right: ['Đúng', i => i.ok],
  };
  const total = items.length, correct = items.filter(i => i.ok).length, p = pct(correct, total);
  const exams = Store.d.history.filter(h => h.mode === 'exam');

  mount(
    el('h1', null, ic('exam'), 'Kết quả thi thử'),
    result.auto && el('div', { class: 'banner' }, el('b', null, 'Hết giờ – bài đã được tự động nộp.')),
    el('div', { class: 'tiles' },
      tile(score10(correct, total), 'Điểm (thang 10)'),
      tile(`${correct}/${total}`, 'Số câu đúng', 'ok'),
      tile(`${p}%`, 'Tỉ lệ đúng', p >= 50 ? 'ok' : 'bad'),
      tile(fmtTime(result.secs), `Thời gian / ${result.minutes} phút`)),
    el('div', { class: 'row', style: 'margin-bottom:16px' },
      el('button', { class: 'btn primary', type: 'button', onclick: () => go('examSetup') }, 'Thi lại'),
      wrongIds().length > 0 && el('button', { class: 'btn', type: 'button', onclick: startReview }, `Ôn câu sai (${wrongIds().length})`),
      el('button', { class: 'btn ghost', type: 'button', onclick: () => go('home') }, 'Trang chủ')),
    el('section', { class: 'card' },
      el('div', { class: 'section-head' }, el('h2', null, 'Tiến bộ qua các lần thi')),
      historyChart(exams)),
    el('section', { class: 'card' },
      el('b', null, 'Bảng kết quả'),
      el('div', { class: 'nav-grid' }, items.map((it, i) => el('button', {
        type: 'button', class: 'nav-cell ' + (it.ok ? 'ok' : it.selected.length ? 'bad' : '') + (it.flagged ? ' flagged' : ''),
        title: `Câu ${i + 1}`,
        onclick: () => document.getElementById(`rv-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      }, i + 1)))),
    el('div', { class: 'tabs' }, Object.entries(groups).map(([key, [label, fn]]) =>
      el('button', { class: 'tab' + (filter === key ? ' on' : ''), type: 'button', onclick: () => showExamResult(result, key) },
        `${label} (${items.filter(fn).length})`))),
    items.map((it, i) => {
      if (!groups[filter][1](it)) return null;
      const card = reviewCard(it, i + 1);
      card.id = `rv-${i}`;
      return card;
    }));
}

// =====================================================================
// TÌM CÂU HỎI
// =====================================================================
/** Bỏ dấu + chữ thường để tìm kiếm không phân biệt dấu */
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
let searchIndex = null;

/** Tô sáng các từ khoá trong text (khớp không phân biệt dấu) */
function highlight(text, terms) {
  if (!terms.length) return [text];
  let norm = '';
  const map = [];                       // vị trí trong chuỗi đã chuẩn hoá → vị trí gốc
  for (let i = 0; i < text.length; i++) {
    for (const ch of fold(text[i])) { norm += ch; map.push(i); }
  }
  const ranges = [];
  for (const t of terms) {
    let from = 0, at;
    while ((at = norm.indexOf(t, from)) >= 0) {
      ranges.push([map[at], map[at + t.length - 1] + 1]);
      from = at + t.length;
    }
  }
  if (!ranges.length) return [text];
  ranges.sort((a, b) => a[0] - b[0]);
  const out = [];
  let pos = 0;
  for (const [a, b] of ranges) {
    if (b <= pos) continue;
    const start = Math.max(a, pos);
    if (start > pos) out.push(text.slice(pos, start));
    out.push(el('mark', null, text.slice(start, b)));
    pos = b;
  }
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

function renderSearch() {
  if (!searchIndex) {
    searchIndex = new Map(QUESTIONS.map(q => [q.id, fold([q.question, ...q.options, q.explanation || ''].join('\n'))]));
  }
  const p = Store.d.prefs;
  let limit = 30;
  const input = el('input', { type: 'search', placeholder: 'Nhập từ khoá (vd: ' + CFG.searchHint + ') hoặc #số câu…', value: p.lastSearch || '' });
  const topicSel = el('select', null,
    el('option', { value: '' }, 'Tất cả chủ đề'),
    TOPICS.map(t => el('option', { value: t }, t)));
  const results = el('div');

  function update() {
    const raw = input.value.trim();
    p.lastSearch = raw;
    const terms = fold(raw).split(/\s+/).filter(Boolean);
    const idMatch = raw.match(/^#?(\d+)$/);
    const list = QUESTIONS.filter(q => {
      if (topicSel.value && q.topic !== topicSel.value) return false;
      if (idMatch && q.id === +idMatch[1]) return true;
      const hay = searchIndex.get(q.id);
      return terms.every(t => hay.includes(t));
    });
    results.replaceChildren(...[
      el('p', { class: 'muted' }, raw ? `Tìm thấy ${list.length} câu.` : `Có ${list.length} câu. Gõ từ khoá để lọc.`),
      list.slice(0, limit).map(q => searchCard(q, terms)),
      list.length > limit && el('div', { class: 'row', style: 'justify-content:center' },
        el('button', { class: 'btn', type: 'button', onclick: () => { limit += 50; update(); } }, `Hiện thêm (${list.length - limit} câu)`)),
    ].flat().filter(Boolean));
  }
  input.addEventListener('input', () => { limit = 30; update(); });
  input.addEventListener('change', () => Store.save());
  topicSel.addEventListener('change', () => { limit = 30; update(); });

  mount(
    el('h1', null, ic('search'), 'Tìm câu hỏi'),
    el('div', { class: 'search-bar' }, input, topicSel),
    results);
  update();
  input.focus();
}

function searchCard(q, terms) {
  const st = Store.d.stats[q.id];
  return el('section', { class: 'card' },
    el('div', { class: 'q-meta' },
      el('span', { class: 'badge' }, q.topic),
      el('span', { class: 'muted' }, `#${q.id} · slide ${q.slide}`),
      q.multi && el('span', { class: 'badge warn' }, 'Nhiều đáp án'),
      st && el('span', { class: 'muted' }, `· ${st.c} đúng / ${st.w} sai`),
      Store.d.wrong[q.id] != null && el('span', { class: 'badge bad' }, 'Đang trong danh sách sai'),
      trButton(q)),
    el('div', { class: 's-q' }, highlight(q.question, terms)),
    trBox(q, q.options.map((_, i) => i)),
    el('ul', { class: 's-opts' }, q.options.map((o, i) => {
      const right = q.answer.includes(i);
      return el('li', { class: right ? 'right' : '' }, `${LETTERS[i]}. `, highlight(o, terms), right ? ic('check', 'ok-ic') : null);
    })),
    q.explanation && el('div', { class: 'explain' }, el('div', { class: 'explain-title' }, 'Giải thích'),
      el('div', { style: 'white-space:pre-wrap' }, highlight(q.explanation, terms))),
    aiBox(q, null));
}

// =====================================================================
// PHÍM TẮT
// =====================================================================
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    if (e.key === 'Enter' && setupStart && (view === 'quizSetup' || view === 'examSetup') && tag === 'INPUT') {
      e.preventDefault();
      setupStart();
    }
    return;
  }
  const key = e.key.toLowerCase();
  // 1-5 hoặc A-E → index đáp án đang hiển thị
  const optIdx = /^[1-8]$/.test(key) ? +key - 1 : /^[a-h]$/.test(key) ? key.charCodeAt(0) - 97 : -1;

  if (view === 'practice' && session) {
    const item = session.items[session.idx];
    if (optIdx >= 0 && !item.checked && optIdx < item.order.length) {
      e.preventDefault();
      pickOption(item, item.order[optIdx]);
      renderPractice();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      item.checked ? nextPractice() : checkPractice();
    }
  } else if (view === 'exam' && Store.d.exam) {
    const ex = Store.d.exam, item = ex.items[ex.idx];
    if (key === 'f') { e.preventDefault(); toggleFlag(); }
    else if (optIdx >= 0 && optIdx < item.order.length) {
      e.preventDefault();
      pickOption(item, item.order[optIdx]);
      saveExam();
      renderExam();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); examGoto(ex.idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); examGoto(ex.idx - 1); }
  } else if ((view === 'quizSetup' || view === 'examSetup') && e.key === 'Enter' && setupStart && tag !== 'BUTTON') {
    e.preventDefault();
    setupStart();
  }
});

// =====================================================================
// THEME & KHỞI ĐỘNG
// =====================================================================
const THEMES = { auto: ['contrast', 'Theo hệ thống'], light: ['sun', 'Sáng'], dark: ['moon', 'Tối'] };
function applyTheme() {
  const t = Store.d.prefs.theme || 'auto';
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  const btn = document.getElementById('themeBtn');
  btn.replaceChildren(ic(THEMES[t][0]));
  btn.title = `Giao diện: ${THEMES[t][1]} (bấm để đổi)`;
}

function init() {
  Store.load();
  applyTheme();
  document.getElementById('themeBtn').addEventListener('click', () => {
    const order = Object.keys(THEMES);
    Store.d.prefs.theme = order[(order.indexOf(Store.d.prefs.theme || 'auto') + 1) % order.length];
    Store.save();
    applyTheme();
  });
  document.getElementById('homeBtn').addEventListener('click', () => leaveTo('home'));

  if (!QUESTIONS.length) {
    mount(el('section', { class: 'card empty' },
      el('div', { class: 'big' }, ic('alert')),
      el('h2', null, 'Chưa có dữ liệu câu hỏi'),
      el('p', null, 'Không tìm thấy window.QUESTIONS. Hãy chạy build.ps1 để tạo data.js.')));
    return;
  }
  // Dọn thống kê của các câu không còn trong bộ đề (khi JSON được cập nhật)
  sanitizeStore();
  go('home');
}

init();
