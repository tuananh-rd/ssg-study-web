# Hoàn tất: gộp câu hỏi lại lý thuyết do Antigravity viết → dựng lại 4 môn → kiểm tra → deploy → thử trên site thật.
# Chạy:  powershell -ExecutionPolicy Bypass -File "D:\Downloads\SSG105 app\web\finish.ps1"
$ErrorActionPreference = 'Stop'
$web = $PSScriptRoot; $root = Split-Path $web -Parent; $tools = Join-Path $root 'sources-private\tools'
Set-Location $web

Write-Host '1) Câu hỏi lại lý thuyết do Antigravity viết:' -ForegroundColor Cyan
foreach ($k in 'dap', 'ail', 'cpv') {
  $d = Join-Path $root "sources-private\recall-$k"; $n = 0; $q = 0
  if (Test-Path $d) { Get-ChildItem $d -Filter 'm*.json' | % { $n++; try { $q += (Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json).Count } catch { Write-Host "   ! file lỗi: $($_.Name)" -ForegroundColor Yellow } } }
  Write-Host "   $k : $n chương, $q câu (chương nào thiếu sẽ dùng bộ sinh tự động)"
}
Write-Host '2) Dựng lại SSG105 + 3 môn' -ForegroundColor Cyan
Set-Location $root; node build.mjs | Select-Object -Last 1
Set-Location $web; node scripts\build-subjects.mjs
node scripts\build-content.mjs | Select-Object -Last 1
Write-Host '3) Kiểm tra cú pháp' -ForegroundColor Cyan
foreach ($f in "$root\ssg105.html", "$web\data\app-dap391m.html", "$web\data\app-ail303m.html", "$web\data\app-cpv301.html") { node "$tools\check-html.mjs" $f; if ($LASTEXITCODE) { throw "Lỗi cú pháp: $f" } }
Write-Host '4) Deploy lên Cloudflare' -ForegroundColor Cyan
npx wrangler pages deploy public --project-name ssg-study --branch main --commit-dirty=true 2>&1 | % { $_ -replace '\x1b\[[0-9;]*m', '' } | Select-Object -Last 3
Write-Host '5) Thử nhanh trên tên miền thật (chưa đăng nhập)' -ForegroundColor Cyan
foreach ($p in '/', '/api/me', '/app/ssg105') {
  try { $r = Invoke-WebRequest "https://mangtheomotnetve.website$p" -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop; "   $p -> $($r.StatusCode)" } catch { "   $p -> HTTP $($_.Exception.Response.StatusCode.value__)  (mong đợi 401/302 với /api/me và /app/...)" }
}
Write-Host 'Xong. Đăng nhập trên web, vào từng môn thử Luyện tập > Ôn lý thuyết và chatbot.' -ForegroundColor Green
