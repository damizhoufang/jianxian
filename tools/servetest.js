// 行菜检查：用真方向键，只照着地上的路标走，看能不能把第二场的菜送完。
// 用法：node tools/servetest.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await go(page, 'file://' + path.resolve('index.html')); await page.waitForTimeout(1500);
  await page.click('#title [data-a="scenes"]'); await page.waitForTimeout(300);
  await Promise.all([page.waitForNavigation(), page.click('#menu [data-jump="1"]')]);
  await page.waitForFunction(() => window.JX && JX.game && JX.game.playing);
  const st = () => page.evaluate(() => { const W = JX.world, p = W.player, g = W.guide; return { beat: JX.story.i, locked: W.locked, modal: JX.ui.modal, money: JX.state.money, x: p ? Math.round(p.x) : 0, y: p ? Math.round(p.y) : 0, path: g ? g.path.map(q => [Math.round(q.x), Math.round(q.y)]) : null, obj: document.getElementById('obj').classList.contains('hide') ? null : document.querySelector('#obj .t').textContent, narr: document.getElementById('narr').classList.contains('hide') ? null : document.querySelector('#narr .txt').textContent }; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (!s.locked && s.obj) break; await page.keyboard.press('Enter'); await page.waitForTimeout(450); }
  const seen = []; let steps = 0, done = false, shot = 0; const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    const s = await st();
    if (s.obj && seen[seen.length - 1] !== s.obj) { seen.push(s.obj); if (shot < 4) await page.screenshot({ path: 'shots/serve_' + (shot++) + '.png' }); }
    if (s.narr && /两桌都送对了/.test(s.narr)) { done = true; console.log('送完了：', JSON.stringify({ money: s.money, steps, sec: ((Date.now() - t0) / 1000).toFixed(0) })); break; }
    if (s.locked || s.modal || !s.path) { await page.waitForTimeout(200); continue; }
    const wp = s.path.find(q => Math.hypot(q[0] - s.x, q[1] - s.y) > 26) || s.path[s.path.length - 1]; if (!wp) { await page.waitForTimeout(150); continue; }
    const dx = wp[0] - s.x, dy = wp[1] - s.y, key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    await page.keyboard.down(key); await page.waitForTimeout(Math.min(260, 60 + Math.max(Math.abs(dx), Math.abs(dy)) * 2)); await page.keyboard.up(key); steps++;
  }
  console.log('提示依次是：', seen.join(' → '));
  if (!done) console.log('没送完', JSON.stringify(await st()));
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close(); process.exit(done ? 0 : 1);
})();
