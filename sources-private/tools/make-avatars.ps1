Add-Type -AssemblyName System.Drawing
$src = 'C:\Users\tuana\AppData\Local\Temp\claude\a7268a61e20f9fd5\f0694722-e02a-49d1-893a-210cd7c773c5\images'
$out = 'D:\Downloads\SSG105 app\web\public\avatars'
$map = [ordered]@{ '10.png'='messi'; '11.png'='ronaldo'; '12.png'='j97'; '13.webp'='khabanh'; '14.png'='huanhoahong'; '15.webp'='truongcon'; '16.png'='truonggiang'; '17.webp'='trump'; '18.png'='putin' }
$jpg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
foreach ($k in $map.Keys) {
  $p = Join-Path $src $k
  try { $img = [System.Drawing.Image]::FromFile($p) } catch { Write-Output "KHONG DOC $k : $($_.Exception.Message)"; continue }
  $m = [Math]::Min($img.Width, $img.Height)
  $sx = [int](($img.Width - $m) / 2); $sy = [int](($img.Height - $m) * 0.12)
  $bmp = New-Object System.Drawing.Bitmap 256, 256
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, 256, 256), $sx, $sy, $m, $m, [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save((Join-Path $out ($map[$k] + '.jpg')), $jpg, $ep)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  Write-Output "ok $k -> $($map[$k]).jpg"
}
