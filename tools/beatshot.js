// 从某一场跳进去慢速自动走，演到含有某几个关键字的对白或旁白时各截一张 1920×1080 的图（给人看的截图用）。
// 用法：node tools/beatshot.js "第一章·十一　公堂" 输出前缀 "奴在台上" "可惜了"      → shots/<前缀>_1.png、_2.png……
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const [, , label, prefix = 'beat', ...keys] = process.argv;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await go(page, 'file://' + path.resolve('index.html')); await page.waitForTimeout(1200);
  await Promise.all([page.waitForNavigation(), page.evaluate(l => JX.story.jump(l), label)]);
  await page.waitForFunction(() => window.JX && JX.game && JX.game.playing, null, { timeout: 20000 });
  await page.evaluate(() => { JX.auto = true; JX.autoDelay = 1.6; JX.fast = 2.2; });
  const done = new Set(); const t0 = Date.now();
  while (done.size < keys.length && Date.now() - t0 < 240000) {
    await page.waitForTimeout(250);
    const st = await page.evaluate(() => { const b = JX.story.beats[JX.story.i - 1] || {}; const d = document.querySelector('#dialog, #dlg, .dialog'); return { text: (b.text || '') + '｜' + (document.body.innerText || '').slice(0, 4000), err: JX.lastError || null, ended: !!JX.ended }; });
    if (st.err) { console.log('出错', st.err); break; }
    for (let k = 0; k < keys.length; k++) if (!done.has(k) && st.text.indexOf(keys[k]) >= 0) { await page.waitForTimeout(900); await page.screenshot({ path: 'shots/' + prefix + '_' + (k + 1) + '.png' }); done.add(k); console.log('截到', keys[k]); }
    if (st.ended) break;
  }
  console.log(done.size === keys.length ? '都截到了' : '没截全：' + keys.filter((_, k) => !done.has(k)).join('、'));
  console.log(errs.length ? errs.join('\n') : '没有报错'); await browser.close();
})();
