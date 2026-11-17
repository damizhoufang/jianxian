// 真按键打第六场的教学战：读第六场的存档，一路回车到战斗，看架势选指令，打完后剧情要能接着走。用法：node tools/battletest.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  const url = 'file://' + path.resolve('index.html');
  await page.goto(url + '#auto');
  await page.waitForFunction(() => JX.state && JX.state.label === '第六场　十二碗面', null, { timeout: 180000 });
  const save = await page.evaluate(() => localStorage.getItem('jx.save'));
  await page.goto('about:blank'); await page.goto(url + '#gallery-0'); await page.evaluate(s => localStorage.setItem('jx.save', s), save);
  await page.goto('about:blank'); await page.goto(url); await page.waitForTimeout(1500);
  await page.click('#title [data-a="load"]');
  const inMenu = () => page.evaluate(() => !!(JX.battle.cur && !JX.battle.cur.box.querySelector('.cmd').classList.contains('hide') && !JX.battle.cur.box.classList.contains('quiet')));
  let shots = 0, picks = [];
  for (let i = 0; i < 400; i++) {
    await page.waitForTimeout(320);
    const st = await page.evaluate(() => ({ beat: JX.story.i, bt: !!JX.battle.cur, err: JX.lastError || null, round: JX.battle.cur ? JX.battle.cur.round : 0 }));
    if (st.err) { console.log('出错', st.err); break; }
    if (await inMenu()) {
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => { const b = JX.battle.cur, f = b.units.find(u => u.side === 'foe'); return { round: b.round, type: f.intent && f.intent.type, tell: f.intent && f.intent.tell, on: b.box.querySelector('.cmd .c.on').textContent, offs: b.box.querySelectorAll('.cmd .c.off').length }; });
      if (shots < 3) await page.screenshot({ path: 'shots/battle_r' + info.round + '.png' }), shots++;
      if (info.round === 2) { const want = info.type === 'grab' ? '2' : '1'; await page.keyboard.press('Digit' + want); await page.waitForTimeout(200); await page.keyboard.press('Enter'); picks.push('第2回合 ' + info.type + ' → 选' + want); }
      else { await page.keyboard.press('Enter'); picks.push('第' + info.round + '回合 默认选中“' + info.on + '”，灰掉 ' + info.offs + ' 个'); }
      await page.waitForTimeout(600); continue;
    }
    if (st.bt === false && st.beat > 250) { console.log('战斗打完，剧情走到第', st.beat, '拍'); break; }
    await page.keyboard.press('Enter');
  }
  console.log(picks.join('\n'));
  const end = await page.evaluate(() => ({ beat: JX.story.i, hp: JX.world.player && 1, label: JX.state.label, modal: JX.ui.modal, zoom: JX.world.zoom, want: JX.audio.want && JX.audio.want.id }));
  console.log('结束时', JSON.stringify(end));
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
