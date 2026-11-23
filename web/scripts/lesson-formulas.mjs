// Công thức thay cho các chỗ "[hình minh hoạ]" trong bài lý thuyết (tài liệu gốc để công thức dạng ảnh).
// Mỗi mục: danh sách theo đúng thứ tự xuất hiện trong mục đó.
//   'tex'        → công thức nội dòng (KaTeX)
//   { d: 'tex' } → công thức hiển thị riêng một dòng
//   'IMG'        → đúng là hình (sơ đồ, ảnh chụp, chữ viết tay) — giữ khung "hình trong tài liệu gốc"
export const FORMULAS = {
  dap: {
    '1.4': ['R^2'],
  },
  ail: {
    '1.9': ['\\hat{y} = f(x;\\,\\theta)', '\\theta', 'y'],
    '1.10': ['K'],
    '1.11': ['R^2 = 1 - \\dfrac{SSE}{TSS}', 'R^2'],
    '1.12': ['x^2,\\ x^3,\\ \\dots,\\ x^d'],
    '1.13': ['\\alpha'],
    '2.1': ['\\sigma(z) = \\dfrac{1}{1 + e^{-z}}'],
    '2.2': ['\\text{Recall} = \\dfrac{TP}{TP + FN}', '\\text{Precision} = \\dfrac{TP}{TP + FP}', '\\text{Specificity} = \\dfrac{TN}{TN + FP}'],
    '4.7': ['X', 'X', '\\hat{y}', '(X,\\ \\hat{y})', 'R^2', 'R^2'],
    '4.8': ['x_{new} = x_i + \\lambda\\,(x_{zi} - x_i),\\quad \\lambda \\in [0, 1]'],
    '4.10': ['K', 'K', 'K', 'K'],
  },
  cpv: {
    '1.2': ['IMG'],
    '3.2': ['\\lVert \\nabla f \\rVert = \\sqrt{\\left(\\dfrac{\\partial f}{\\partial x}\\right)^2 + \\left(\\dfrac{\\partial f}{\\partial y}\\right)^2}', '\\theta = \\tan^{-1}\\!\\left(\\dfrac{\\partial f / \\partial y}{\\partial f / \\partial x}\\right)'],
    '5.3': [{ d: 'E_{LS} = \\sum_i \\lVert \\mathbf{r}_i \\rVert^2 = \\sum_i \\lVert f(\\mathbf{x}_i;\\,\\mathbf{p}) - \\mathbf{x}\'_i \\rVert^2' }],
    '7.8': ['IMG', 'IMG', 'IMG', 'IMG', 'IMG', 'IMG'],
  },
};
const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function applyFormulas(file, modules) {
  const map = FORMULAS[file] || {}; let n = 0, miss = [];
  for (const m of modules) for (const s of m.sections) {
    const list = map[s.id]; if (!list) continue; let k = 0;
    s.h = s.h.replace(/<span class="img-ph">\[hình minh hoạ\]<\/span>/g, all => {
      const f = list[k++]; if (f == null) { miss.push(s.id); return all; }
      if (f === 'IMG') return all;
      n++;
      return typeof f === 'object' ? `<span class="mj mj-d" data-tex="${escAttr(f.d)}">${escAttr(f.d)}</span>` : `<span class="mj" data-tex="${escAttr(f)}">${escAttr(f)}</span>`;
    });
    if (k !== list.length) miss.push(s.id + ` (có ${k} chỗ, bảng ghi ${list.length})`);
  }
  return { n, miss };
}
