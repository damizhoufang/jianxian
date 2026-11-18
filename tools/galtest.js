// 图鉴与配乐的检查：从标题进图鉴、翻页、十六首曲子逐首试听（能装载、能解码）、从菜单进图鉴、关掉后还能走。用法：node tools/galtest.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await go(page, 'file://' + path.resolve('index.html'));
  await page.waitForTimeout(1500);
  // 标题画面 → 点“人物图鉴 · 配乐”
  await page.click('#title [data-a="gallery"]'); await page.waitForTimeout(500);
  console.log('从标题进图鉴', await page.evaluate(() => ({ open: JX.ui.galleryOpen(), titleHidden: document.getElementById('title').classList.contains('hide'), modal: JX.ui.modal })));
  for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); }
  console.log('按五次右键后在哪页', await page.evaluate(() => document.querySelector('#gal .tab.on').textContent + ' / ' + document.querySelector('#gal .sub.on').textContent));
  await page.evaluate(() => document.querySelectorAll('#gal .tab')[2].click()); await page.waitForTimeout(300);
  const ids = await page.evaluate(() => JX.TRACKS.map(t => t[0]));
  for (const id of ids) {
    await page.click('#gal [data-play="' + id + '"]'); 
    await page.waitForFunction(i => JX.audio.cur && JX.audio.cur.id === i, id, { timeout: 15000 });
    const r = await page.evaluate(i => ({ id: i, cur: JX.audio.cur.id, dur: +JX.audio.bufs[i].buf.duration.toFixed(1), ch: JX.audio.bufs[i].buf.numberOfChannels, on: !!document.querySelector('#gal .trk.on') }), id);
    console.log('试听', JSON.stringify(r));
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  console.log('Esc 回标题', await page.evaluate(() => ({ open: JX.ui.galleryOpen(), titleHidden: document.getElementById('title').classList.contains('hide'), want: JX.audio.want && JX.audio.want.id, modal: JX.ui.modal })));
  // 开始游戏 → 菜单 → 图鉴 → 关 → 还能走
  await go(page, 'about:blank'); await go(page, 'file://' + path.resolve('index.html') + '#kitchen'); await page.waitForTimeout(1500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.click('#menu [data-act="gallery"]'); await page.waitForTimeout(400);
  console.log('从菜单进图鉴', await page.evaluate(() => ({ open: JX.ui.galleryOpen(), menu: JX.ui.menuOpen(), modal: JX.ui.modal })));
  await page.click('#gal [data-p="3"]'); await page.waitForTimeout(600);
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const before = await page.evaluate(() => ({ open: JX.ui.galleryOpen(), menu: JX.ui.menuOpen(), modal: JX.ui.modal, x: Math.round(JX.world.player.x), y: Math.round(JX.world.player.y), want: JX.audio.want && JX.audio.want.id }));
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
  const after = await page.evaluate(() => ({ x: Math.round(JX.world.player.x), y: Math.round(JX.world.player.y) }));
  console.log('关图鉴后', JSON.stringify(before), '走半秒', JSON.stringify(after));
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
