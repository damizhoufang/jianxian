// 从某一场起慢速自动走，每句旁白出来时截一张小图，编号；另存一份“编号 → 旁白”的清单。
// 用法：node tools/narrshot.js "第三章·一　换装" /tmp/narr [到哪一场为止（不含），不写就到全书末]；再用 python3 tools/narrsheet.py /tmp/narr 1 16 /tmp/sheet1.jpg 拼成 4×4 的小图，对着 /tmp/narr/list.txt 逐句看旁白和画面对不对得上
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path'), fs = require('fs');
(async () => {
  const [, , label, out = '/tmp/narr', until = ''] = process.argv; fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await go(page, 'file://' + path.resolve('index.html')); await page.waitForTimeout(1200);
  await Promise.all([page.waitForNavigation(), page.evaluate(l => JX.story.jump(l), label)]);
  await page.waitForFunction(() => window.JX && JX.game && JX.game.playing, null, { timeout: 20000 });
  await page.evaluate(() => { JX.auto = true; JX.autoDelay = 1.5; JX.fast = 2.2; });
  let last = -1, n = 0; const list = []; const t0 = Date.now();
  while (Date.now() - t0 < 1500000) {
    await page.waitForTimeout(120);
    const st = await page.evaluate(() => { const i = JX.story.i - 1, b = JX.story.beats[i] || {}; return { i, t: b.t, text: b.text || '', label: JX.state.label, err: JX.lastError || null, ended: !!JX.ended }; });
    if (st.err) { console.log('出错', st.err); break; }
    if (st.ended || (until && st.label === until)) break;
    if (st.i !== last && st.t === 'narr') { last = st.i; await page.waitForTimeout(650); n++; await page.screenshot({ path: out + '/' + String(n).padStart(3, '0') + '.jpg', type: 'jpeg', quality: 70 }); list.push(n + '\t' + st.label.replace(/^第.章·/, '') + '\t' + st.text); }
    else if (st.i !== last) last = st.i;
  }
  fs.writeFileSync(out + '/list.txt', list.join('\n'));
  console.log('旁白', n, '句；', errs.length ? errs.join('\n') : '没有报错', ((Date.now() - t0) / 1000).toFixed(0) + ' 秒'); await browser.close();
})();
