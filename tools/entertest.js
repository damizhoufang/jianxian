// 用真回车把某一场从存档点按到底（没有战斗的场次用；要自己走路的地方借自动走一小段）。
// 用法：node tools/entertest.js "第十场　三天" [到第几拍为止，默认按到试玩结束]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const label = process.argv[2] || '第十场　三天', until = +process.argv[3] || 0;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  const url = 'file://' + path.resolve('index.html');
  await go(page, url + '#auto');
  await page.waitForFunction(l => JX.state && JX.state.label === l, label, { timeout: 240000 });
  const save = await page.evaluate(() => localStorage.getItem('jx.save'));
  await go(page, 'about:blank'); await go(page, url + '#gallery-0'); await page.evaluate(s => localStorage.setItem('jx.save', s), save);
  await go(page, 'about:blank'); await go(page, url); await page.waitForTimeout(1500);
  await page.click('#title [data-a="load"]');
  const t0 = Date.now(); let presses = 0, st;
  for (;;) {
    await page.waitForTimeout(280);
    st = await page.evaluate(() => ({ beat: JX.story.i, err: JX.lastError || null, ended: !!JX.ended, end: !!document.getElementById('end'), fade: document.getElementById('fade').style.opacity, exit: JX.world.objective && JX.world.objective.text, scene: JX.world.id }));
    if (st.err) { console.log('出错', st.err); break; }
    if (st.end && !st.shot) { await page.screenshot({ path: 'shots/end_card.png' }); }
    if (st.ended) { await page.waitForTimeout(1800); st = await page.evaluate(() => ({ beat: JX.story.i, ended: true, fade: document.getElementById('fade').style.opacity, locked: JX.world.locked, modal: JX.ui.modal, scene: JX.world.id })); await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(600); await page.keyboard.up('ArrowLeft'); st.x = await page.evaluate(() => Math.round(JX.world.player.x)); await page.screenshot({ path: 'shots/end_stay.png' }); break; }
    if (until && st.beat >= until) break;
    if (Date.now() - t0 > 420000) { console.log('超时'); break; }
    if (st.exit) { await page.evaluate(() => { JX.auto = true; }); await page.waitForTimeout(1500); await page.evaluate(() => { JX.auto = false; }); continue; }
    await page.keyboard.press('Enter'); presses++;
  }
  console.log('按了', presses, '次回车；', JSON.stringify(st));
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
