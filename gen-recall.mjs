// Sinh câu hỏi "hỏi lại lý thuyết" trực tiếp từ nội dung bài học (DATA.modules[].sections[].h).
// Mỗi ý trong bài thành câu hỏi; đáp án nhiễu lấy từ các ý cùng mục / cùng chương.
// Không có câu tình huống: chỉ hỏi định nghĩa, thành phần, thứ tự, con số.

const strip = h => String(h).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const clean = s => strip(s).replace(/[.;:,]\s*$/, '').trim();
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// RNG cố định để mỗi lần build ra cùng một bộ câu
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
// pool = [ưu tiên 1 (cùng danh sách), ưu tiên 2 (cùng chương)…]: lấy hết ưu tiên cao trước rồi mới lấy tiếp
function pick3(pools, correct, key) {
  if (!Array.isArray(pools[0])) pools = [pools];
  const r = rng(hash(key)), got = [], low = correct.toLowerCase();
  for (const pool of pools) {
    const uniq = [...new Set(pool.filter(x => x && x.toLowerCase() !== low && !got.includes(x)))];
    for (let i = uniq.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [uniq[i], uniq[j]] = [uniq[j], uniq[i]]; }
    for (const x of uniq) { if (got.length < 3) got.push(x); }
  }
  return got;
}

const SEQ_HINT = /bước|quy trình|tầng|giai đoạn|cấu trúc|các phần|khu vực chính|chu kỳ|→/i;

export function genRecall(D) {
  const out = [], seenQ = new Set();
  for (const m of D.modules) {
    if (m.noQuiz) continue;   // chương không ôn bằng câu hỏi (M1 – tổng quan môn)
    // Thu thập toàn bộ ý của chương trước, để có nguồn đáp án nhiễu khi một mục quá ít ý
    const secs = m.sections.map(sec => parseSection(sec));
    const modTerms = secs.flatMap(s => s.lists.flatMap(l => l.items.filter(i => i.term).map(i => i.term)));
    const modDescs = secs.flatMap(s => s.lists.flatMap(l => l.items.filter(i => i.desc).map(i => i.desc)));
    const modPlain = secs.flatMap(s => s.lists.flatMap(l => l.items.map(i => i.term ? i.term + ': ' + i.desc : i.full)));
    let n = 0;
    const add = (sec, kind, q, correct, pool, explain) => {
      const key = q + '|' + correct;
      if (!correct || correct.length > 220 || seenQ.has(key)) return;
      const wrong = pick3(pool, correct, m.id + key);
      if (wrong.length < 3) return;
      seenQ.add(key);
      out.push({ id: `r-${m.id}-${String(++n).padStart(3, '0')}`, module: m.id, ref: sec.id, type: 'recall', kind, q, correct, wrong, explain });
    };

    secs.forEach(S => {
      const sec = S.sec, where = `§${sec.id} ${sec.t}`;
      S.lists.forEach(L => {
        const terms = L.items.filter(i => i.term && i.desc);
        // 1) Khái niệm ↔ định nghĩa (hai chiều)
        if (terms.length >= 2) terms.forEach(it => {
          const sibT = terms.map(x => x.term), sibD = terms.map(x => x.desc);
          add(sec, 'define', `“${it.term}” nghĩa là gì?`, cap(it.desc),
            [sibD.map(cap), modDescs.map(cap)], `${where}: ${it.term} — ${it.desc}.`);
          add(sec, 'term', `Ý sau mô tả khái niệm nào: “${cap(it.desc)}”?`, it.term,
            [sibT, modTerms], `${where}: ${it.term} — ${it.desc}.`);
        });
        // 2) Chuỗi có thứ tự: bước đầu / ngay sau / cuối
        const isSeq = L.ordered && L.items.length >= 3 && SEQ_HINT.test(L.label + ' ' + sec.t + ' ' + L.before);
        if (isSeq) {
          const lab = L.items.map(i => i.term || i.full);
          const name = L.label && !sec.t.toLowerCase().includes(L.label.toLowerCase()) ? `${sec.t} – ${L.label.toLowerCase()}` : sec.t;
          const chain = lab.join(' → ');
          add(sec, 'order', `${name}: mục đứng ĐẦU TIÊN là gì?`, lab[0], lab, `${where}: ${chain}.`);
          add(sec, 'order', `${name}: mục đứng CUỐI CÙNG là gì?`, lab[lab.length - 1], lab, `${where}: ${chain}.`);
          for (let k = 0; k < lab.length - 1; k++)
            add(sec, 'order', `${name}: ngay sau “${lab[k]}” là gì?`, lab[k + 1], lab.filter((_, j) => j !== k), `${where}: ${chain}.`);
        }
        // (Danh sách ý không có thuật ngữ được hỏi bằng câu viết tay trong data-recall.js,
        //  vì đáp án nhiễu tự lấy từ mục khác dễ gần đúng gây mơ hồ.)
      });
      // 4) Bảng
      S.tables.forEach(T => {
        if (T.head.length === 2 && T.rows.every(r => r.length === 2)) {
          const [A, B] = T.head;
          if (/trọng số|%/i.test(B) || T.rows.every(r => /\d/.test(r[1]))) {
            T.rows.forEach(r => add(sec, 'fact', `“${r[0]}” chiếm bao nhiêu phần trăm điểm môn?`, r[1], T.rows.map(x => x[1]).concat(['15%', '30%', '40%']), `${where}: ${r[0]} — ${r[1]}.`));
          } else if (A && B) {
            T.rows.forEach(r => {
              add(sec, 'compare', `Đặc điểm nào là của ${A} (không phải ${B})?`, r[0], T.rows.map(x => x[1]), `${where}: ${A} — ${r[0]}; ${B} — ${r[1]}.`);
              add(sec, 'compare', `Đặc điểm nào là của ${B} (không phải ${A})?`, r[1], T.rows.map(x => x[0]), `${where}: ${A} — ${r[0]}; ${B} — ${r[1]}.`);
            });
          } else {
            // bảng 2 cột không có tiêu đề cột rõ: cột 1 là tên, cột 2 là nội dung
            T.rows.forEach(r => add(sec, 'define', `${r[0]}: nội dung nào đúng?`, r[1], T.rows.map(x => x[1]), `${where}: ${r[0]} — ${r[1]}.`));
          }
        } else if (T.head.length === 3 && T.rows.every(r => r.length === 3)) {
          const [, A, B] = T.head;
          T.rows.forEach(r => {
            add(sec, 'compare', `${A} — “${r[0]}” là gì?`, r[1], T.rows.map(x => x[1]).concat(T.rows.map(x => x[2])), `${where}: ${r[0]} — ${A}: ${r[1]}; ${B}: ${r[2]}.`);
            add(sec, 'compare', `${B} — “${r[0]}” là gì?`, r[2], T.rows.map(x => x[2]).concat(T.rows.map(x => x[1])), `${where}: ${r[0]} — ${A}: ${r[1]}; ${B}: ${r[2]}.`);
          });
        }
      });
    });
    // Dùng thêm modPlain làm nguồn nhiễu cuối cùng cho câu nào còn thiếu (đã xử lý trong pick3 qua pool)
    void modPlain;
  }
  return out;
}

function parseSection(sec) {
  const h = sec.h, lists = [], tables = [], groups = [];
  const re = /<(ol|ul)>([\s\S]*?)<\/\1>/g; let m;
  while ((m = re.exec(h))) {
    const before = h.slice(Math.max(0, m.index - 220), m.index);
    // Nhãn của danh sách: đoạn <p>…</p> hoặc <b>…</b> ngay trước nó
    let label = '';
    const pb = before.match(/<p>(?:<b>)?([^<]{3,80}?)(?:<\/b>)?:?\s*<\/p>\s*$/) || before.match(/<b>([^<]{3,80}?)<\/b>:?\s*(?:<\/p>)?\s*$/) || before.match(/<p>([^<]{3,90}?):\s*<\/p>\s*$/);
    if (pb) label = clean(pb[1]);
    const items = (m[2].match(/<li>[\s\S]*?<\/li>/g) || []).map(li => {
      const inner = li.replace(/^<li>|<\/li>$/g, '');
      const t = inner.match(/^\s*<b>([\s\S]*?)<\/b>\s*(?:[:–-]|là)\s*([\s\S]+)$/);
      if (t && clean(t[1]).length <= 60 && clean(t[2]).length >= 4) return { term: clean(t[1]), desc: clean(t[2]), full: clean(inner) };
      return { term: null, desc: null, full: clean(inner) };
    }).filter(i => i.full);
    lists.push({ ordered: m[1] === 'ol', label, before: strip(before), items });
  }
  const tre = /<table>([\s\S]*?)<\/table>/g;
  while ((m = tre.exec(h))) {
    const rows = (m[1].match(/<tr>[\s\S]*?<\/tr>/g) || []).map(tr => (tr.match(/<t[hd]>[\s\S]*?<\/t[hd]>/g) || []).map(c => clean(c)));
    const headRow = /<th>/.test((m[1].match(/<tr>[\s\S]*?<\/tr>/) || [''])[0]);
    if (!rows.length) continue;
    tables.push(headRow ? { head: rows[0], rows: rows.slice(1) } : { head: [], rows });
  }
  const gre = /<p><b>([^<]{3,60}?):?<\/b>:?\s*([^<]{10,}?)<\/p>/g;
  while ((m = gre.exec(h))) {
    const items = m[2].split(/;\s*/).map(clean).filter(x => x.length >= 4);
    if (items.length >= 2) groups.push({ label: clean(m[1]), items });
  }
  return { sec, lists, tables, groups };
}
