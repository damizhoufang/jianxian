// 用真按键打一场战斗：读某一场的存档，一路回车到战斗；每到选指令就按这场战斗自带的打法（没有就选第一个能用的）按数字键加回车，
// 打完后剧情要能接着走。用法：node tools/battletest.js ["第六场　十二碗面" | "第八场　后巷" | "第九场　屋顶"]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const label = process.argv[2] || '第六场　十二碗面';
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
  let shots = 0, picks = 0, fought = false, lost = 0, bad = 0, log = [];
  const t0 = Date.now();
  for (;;) {
    await page.waitForTimeout(300);
    const st = await page.evaluate(() => { const b = JX.battle.cur; return { beat: JX.story.i, err: JX.lastError || null, bt: !!b, menu: !!(b && b.m && !b.box.querySelector('.cmd').classList.contains('hide') && !b.box.classList.contains('quiet')), exit: JX.world.objective && JX.world.objective.text }; });
    if (st.err) { console.log('出错', st.err); break; }
    if (st.bt) fought = true;
    if (st.menu) {
      await page.waitForTimeout(350);
      const pick = await page.evaluate(() => { const b = JX.battle.cur, m = b.m; let i = -1; const isCmd = b.actor && b.actor.cmds.includes(m.items[0]); if (isCmd && b.def.autoPick) i = m.items.indexOf(b.def.autoPick(b, b.actor, m.items)); if (i < 0 || !m.ok(m.items[i])) i = m.items.findIndex(m.ok); return { i, sel: m.sel, name: m.items[i].name, who: b.actor && b.actor.name, hp: b.units.map(u => u.name + ' ' + u.hp).join('，') }; });
      if (shots < 2 && picks === 2 * shots + 1) { await page.screenshot({ path: 'shots/bt_' + label.slice(0, 3) + '_' + shots + '.png' }); shots++; }
      if (pick.sel !== pick.i) { await page.keyboard.press('Digit' + (pick.i + 1)); await page.waitForTimeout(160); }
      const now = await page.evaluate(() => { const b = JX.battle.cur; return b && b.m ? b.m.sel : -1; });
      if (now !== pick.i) { bad++; log.push('〔光标没到位：要 ' + pick.name + '〕'); continue; }      // 数字键没生效就不按回车，下一轮再来
      await page.keyboard.press('Enter'); picks++; if (log.length < 80) log.push(pick.who + '→' + pick.name);
      await page.waitForTimeout(500); continue;
    }
    if (fought && !st.bt) {
      await page.waitForTimeout(1500); const res = await page.evaluate(() => (JX.battle.cur ? null : JX.battle.result));
      if (res === 'lose') { lost++; fought = false; log.push('〔输了，重来〕'); }
      else if (res) { console.log('战斗结束（' + res + '），剧情在第', st.beat, '拍；一共选了', picks, '次指令，输了', lost, '次，光标没到位', bad, '次'); break; }
    }
    if (Date.now() - t0 > 420000) { console.log('超时', JSON.stringify(st)); break; }
    if (st.exit && !st.bt) { await page.evaluate(() => { JX.auto = true; }); await page.waitForTimeout(1500); await page.evaluate(() => { JX.auto = false; }); continue; }   // 要自己走路的地方，让自动走一小段
    await page.keyboard.press('Enter');
  }
  console.log(log.join(' ｜ '));
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
