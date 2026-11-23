// Upstream giả trả lời bằng Markdown + công thức để thử giao diện câu trả lời. node scripts/fake-ai-md.mjs [port]
import http from 'node:http';
const PORT = +(process.argv[2] || 9099);
const TEXT = `## Hồi quy Logistic

Con nghe cho kỹ, **bố chỉ giảng một lần**. Hàm sigmoid biến mọi số thực thành xác suất:

$$\\sigma(z)=\\frac{1}{1+e^{-z}}$$

với $z = w^T x + b$. Hàm mất mát (log loss):

$$J(w)=-\\frac{1}{m}\\sum_{i=1}^{m}\\left[y^{(i)}\\log \\hat y^{(i)}+(1-y^{(i)})\\log(1-\\hat y^{(i)})\\right]$$

### So sánh nhanh

| Mô hình | Đầu ra | Dùng khi |
|---|:---:|---|
| Linear Regression | số thực | dự đoán giá trị liên tục |
| Logistic Regression | xác suất $[0,1]$ | phân loại nhị phân |

> Mẹo nhớ: sigmoid *ép* đầu ra vào khoảng $(0,1)$.

1. Chuẩn hoá dữ liệu
2. Huấn luyện:
   - chọn \`learning_rate\`
   - lặp đến hội tụ
3. Đánh giá bằng **F1-score**

\`\`\`python
from sklearn.linear_model import LogisticRegression
clf = LogisticRegression(max_iter=200)
clf.fit(X_train, y_train)
print(clf.predict_proba(X_test)[:3])
\`\`\`
`;
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  if (!/Bearer FAKEKEY/.test(req.headers.authorization || '')) { res.writeHead(401); return res.end('{"error":"bad key"}'); }
  res.writeHead(200, { 'content-type': 'text/event-stream' });
  const parts = TEXT.match(/[\s\S]{1,18}/g);
  for (const w of parts) { res.write('data: ' + JSON.stringify({ model: 'fake', choices: [{ delta: { content: w } }] }) + '\n\n'); await new Promise(r => setTimeout(r, 10)); }
  res.write('data: ' + JSON.stringify({ choices: [{ delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 50 } }) + '\n\n'); res.end('data: [DONE]\n\n');
}).listen(PORT, () => console.log('fake-ai-md on', PORT));
