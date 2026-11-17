// 自动从头玩一遍：node tools/play.js [auto|autoslow] [截图间隔毫秒] [最长秒数]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const [, , mode = 'auto', every = '0', maxSec = '240'] = process.argv;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await go(page, 'file://' + path.resolve('index.html') + '#' + mode);
  const t0 = Date.now(); let n = 0, lastLabel = '';
  for (;;) {
    await page.waitForTimeout(+every > 0 ? +every : 500);
    const st = await page.evaluate(() => ({ ended: !!JX.ended, label: JX.state.label, beat: JX.story.i, total: JX.story.beats.length, scene: JX.world.id, err: JX.lastError || null, money: JX.state.money, fps: Math.round(JX.fps) }));
    if (st.label !== lastLabel) { console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', st.label, 'beat', st.beat + '/' + st.total, st.scene); lastLabel = st.label; }
    if (+every > 0) await page.screenshot({ path: 'shots/play_' + String(n++).padStart(3, '0') + '.png' });
    if (st.err) { console.log('JX.lastError:', st.err); break; }
    if (st.ended) { console.log('走完了：', JSON.stringify(st)); await page.waitForTimeout(600); await page.screenshot({ path: 'shots/play_end.png' }); break; }
    if (Date.now() - t0 > +maxSec * 1000) { console.log('超时：', JSON.stringify(st)); await page.screenshot({ path: 'shots/play_timeout.png' }); break; }
  }
  if (errs.length) console.log(errs.slice(0, 15).join('\n'));
  await browser.close();
})();
