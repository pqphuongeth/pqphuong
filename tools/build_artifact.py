#!/usr/bin/env python3
"""Gộp index.html + css + js thành một trang duy nhất để đăng lên claude.ai (Artifact).

Cách dùng: python3 tools/build_artifact.py <file-đầu-ra.html>
Trang đầu ra không có thẻ <html>/<head>/<body> (trình đăng tự thêm), CSS và JS được nhúng
trực tiếp, Chart.js và SheetJS (xuất Excel) nạp từ CDN được phép trên claude.ai.
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js'
XLSX_CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.mini.min.js'

html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'css/style.css').read_text(encoding='utf-8')
js = (ROOT / 'js/app.js').read_text(encoding='utf-8')

body = re.search(r'<body>(.*)</body>', html, re.S).group(1).strip()
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com[^"]+)"', html).group(1)

out = f'''<title>Sổ Thu Chi</title>
<meta name="theme-color" content="#4f46e5">
<link rel="stylesheet" href="{fonts}">
<style>
{css}
</style>
{body}
<script src="{CHART_CDN}"></script>
<script src="{XLSX_CDN}"></script>
<script>
{js.replace("</script", "<\\/script")}
</script>
'''
dest = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'dist/so-thu-chi.html')
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(out, encoding='utf-8')
print(f'Đã tạo {dest} ({len(out) // 1024} KB)')
