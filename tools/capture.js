// 从某一场的存档点起，慢速自动走，每换一拍截一张（战斗中每隔一秒多截一张），拼成总览图。
// 用法：node tools/capture.js "第六场　十二碗面" s67      → shots/s67_*.png 与 shots/s67_sheet*.png（拼图要 python3 tools 外另做）
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const [, , label, prefix = 'cap', maxSec = '300'] = process.argv;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  const url = 'file://' + path.resolve('index.html');
  await go(page, url + '#auto');
  await page.waitForFunction(l => JX.state && JX.state.label === l, label, { timeout: 180000 });
  const save = await page.evaluate(() => localStorage.getItem('jx.save'));
  await go(page, 'about:blank'); await go(page, url + '#gallery-0'); await page.evaluate(s => localStorage.setItem('jx.save', s), save);
  await go(page, 'about:blank'); await go(page, url + '#autoload');
  await page.evaluate(() => { JX.autoDelay = 0.5; JX.fast = 2.2; });
  let n = 0, last = -1, lastT = 0; const t0 = Date.now();
  for (;;) {
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => ({ ended: !!JX.ended, label: JX.state.label, beat: JX.story.i, scene: JX.world.id, err: JX.lastError || null, bt: !!(JX.battle && JX.battle.cur) }));
    if (st.beat !== last || (st.bt && Date.now() - lastT > 1000)) { await page.screenshot({ path: 'shots/' + prefix + '_' + String(n++).padStart(3, '0') + '_b' + st.beat + '.png' }); last = st.beat; lastT = Date.now(); }
    if (st.err) { console.log('出错', st.err); break; }
    if (st.ended || Date.now() - t0 > +maxSec * 1000) { console.log(st.ended ? '走完' : '超时', JSON.stringify(st), n, '张'); break; }
  }
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
