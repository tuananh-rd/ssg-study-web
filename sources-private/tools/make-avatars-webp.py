from PIL import Image
src = 'C:/Users/tuana/AppData/Local/Temp/claude/a7268a61e20f9fd5/f0694722-e02a-49d1-893a-210cd7c773c5/images/'
out = 'D:/Downloads/SSG105 app/web/public/avatars/'
for f, n in [('13.webp', 'khabanh'), ('15.webp', 'truongcon'), ('17.webp', 'trump')]:
    im = Image.open(src + f).convert('RGB')
    m = min(im.size)
    sx = (im.width - m) // 2
    sy = int((im.height - m) * 0.12)
    im.crop((sx, sy, sx + m, sy + m)).resize((256, 256), Image.LANCZOS).save(out + n + '.jpg', quality=85)
    print('ok', n)
