// Chuyển trang báo cáo (report.py --html) thành PDF A4.
// Cách dùng: node html_to_pdf.js <bao-cao.html> <bao-cao.pdf>
// Dùng Playwright có sẵn trong môi trường (require('playwright')); phông Google bị chặn thì dùng phông dự phòng.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
(async () => {
  const [src, out] = process.argv.slice(2);
  if (!src || !out) { console.error('Cách dùng: node html_to_pdf.js in.html out.pdf'); process.exit(1); }
  const body = fs.readFileSync(src, 'utf8');
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'stc-')), 'page.html');
  fs.writeFileSync(tmp, `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">${body}</body></html>`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.route('https://fonts.googleapis.com/**', r => r.abort().catch(() => {}));
  await page.emulateMedia({ colorScheme: 'light', media: 'print' });
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.pdf({ path: out, format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } });
  await browser.close();
  console.log('PDF:', out);
})().catch(e => { console.error(e); process.exit(1); });
