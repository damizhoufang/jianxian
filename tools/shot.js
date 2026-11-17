// 用法：node tools/shot.js <页面相对路径或带#的地址> <输出png> [宽] [高] [等待毫秒] [执行的脚本]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const [, , page0, out, w = '1600', h = '900', wait = '800', script = ''] = process.argv;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  const [file, hash] = page0.split('#');
  await page.goto('file://' + path.resolve(file) + (hash ? '#' + hash : ''));
  await page.waitForTimeout(+wait);
  if (script) { const r = await page.evaluate(script); if (r !== undefined) console.log('eval:', JSON.stringify(r)); await page.waitForTimeout(400); }
  await page.screenshot({ path: out });
  if (errs.length) console.log(errs.slice(0, 12).join('\n'));
  await browser.close();
})();
