// 从某一场的开头自动往下走（不靠场次表，直接把存档写成那一场）：node tools/fromlabel.js "第二章·一　酒坛里的人" [auto|autoslow] [截图间隔毫秒] [最长秒数] [截图前缀]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const [, , label, mode = 'auto', every = '0', maxSec = '240', prefix = 'fl'] = process.argv;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  const url = 'file://' + path.resolve('index.html');
  await go(page, url);
  await page.evaluate(l => { JX.store.set('save', { label: l, money: 60, flags: {} }); sessionStorage.setItem('jx.jump', '1'); }, label);
  await go(page, 'about:blank').catch(() => {});
  await go(page, url + '#' + mode);
  const t0 = Date.now(); let n = 0, lastLabel = '';
  for (;;) {
    await page.waitForTimeout(+every > 0 ? +every : 500);
    const st = await page.evaluate(() => ({ ended: !!JX.ended, label: JX.state.label, beat: JX.story.i, total: JX.story.beats.length, scene: JX.world.id, err: JX.lastError || null, fps: Math.round(JX.fps) }));
    if (st.label !== lastLabel) { console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', st.label, 'beat', st.beat + '/' + st.total, st.scene); lastLabel = st.label; }
    if (+every > 0) await page.screenshot({ path: 'shots/' + prefix + '_' + String(n++).padStart(3, '0') + '.png' });
    if (st.err) { console.log('JX.lastError:', st.err); break; }
    if (st.ended) { console.log('走完了：', JSON.stringify(st)); await page.waitForTimeout(600); await page.screenshot({ path: 'shots/' + prefix + '_end.png' }); break; }
    if (Date.now() - t0 > +maxSec * 1000) { console.log('超时：', JSON.stringify(st)); await page.screenshot({ path: 'shots/' + prefix + '_timeout.png' }); break; }
  }
  if (errs.length) console.log(errs.slice(0, 15).join('\n'));
  await browser.close();
})();
