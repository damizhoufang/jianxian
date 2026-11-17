// 第一章（目前三场）检查：真按键。对白按回车；要走路的地方只照地上的路标按方向键；到人和东西跟前按回车；顺路去看一眼题壁。
// 用法：node tools/ch1test.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await go(page, 'file://' + path.resolve('index.html')); await page.waitForTimeout(1200);
  await page.click('#title [data-a="scenes"]'); await page.waitForTimeout(300); await page.screenshot({ path: 'shots/k_scenes.png' });
  await Promise.all([page.waitForNavigation(), page.click('#menu [data-jump="10"]')]);
  await page.waitForFunction(() => window.JX && JX.game && JX.game.playing);
  const st = () => page.evaluate(() => { const W = JX.world, p = W.player, g = W.guide, n = W.near; return { beat: JX.story.i, label: JX.state.label, locked: W.locked, modal: JX.ui.modal, x: p ? Math.round(p.x) : 0, y: p ? Math.round(p.y) : 0, path: g ? g.path.map(q => [Math.round(q.x), Math.round(q.y)]) : null, near: n ? (n.label || '') : null, obj: document.getElementById('obj').classList.contains('hide') ? null : document.querySelector('#obj .t').textContent, end: !!document.getElementById('end'), ended: !!JX.ended, err: JX.lastError || null, card: document.getElementById('card') && !document.getElementById('card').classList.contains('hide') }; });
  const seen = []; let steps = 0, enters = 0, stuck = 0, lastPos = '', tibi = false; const t0 = Date.now(); let s;
  for (;;) {
    s = await st();
    if (s.err || s.ended || Date.now() - t0 > 420000) break;
    if (s.obj && seen[seen.length - 1] !== s.obj) { seen.push(s.obj); await page.screenshot({ path: 'shots/k_obj' + seen.length + '.png' }); }
    if (s.end) { await page.screenshot({ path: 'shots/k_end.png' }); await page.waitForTimeout(1000); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); continue; }
    if (s.card) { await page.waitForTimeout(1300); await page.screenshot({ path: 'shots/k_card.png' }); await page.keyboard.press('Enter'); await page.waitForTimeout(600); continue; }
    if (s.locked || s.modal) { await page.keyboard.press('Enter'); enters++; await page.waitForTimeout(330); continue; }
    if (s.obj === '出门' && !tibi) {            // 先绕去看题壁：照着坐标走过去，按回车
      const tx = 1640, ty = 800; const dx = tx - s.x, dy = ty - s.y;
      if (Math.hypot(dx, dy) < 60) { if (s.near) { await page.keyboard.press('Enter'); tibi = true; await page.waitForTimeout(600); } else { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(120); await page.keyboard.up('ArrowUp'); } continue; }
      const key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'); await page.keyboard.down(key); await page.waitForTimeout(200); await page.keyboard.up(key); steps++; continue;
    }
    if (s.near && s.path && s.path.length <= 1 && Math.hypot((s.path[0] || [s.x])[0] - s.x, (s.path[0] || [0, s.y])[1] - s.y) < 90) { await page.keyboard.press('Enter'); enters++; await page.waitForTimeout(400); continue; }
    if (!s.path || !s.path.length) { if (s.near) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); } else await page.waitForTimeout(200); continue; }
    const wp = s.path.find(q => Math.hypot(q[0] - s.x, q[1] - s.y) > 26) || s.path[s.path.length - 1];
    const dx = wp[0] - s.x, dy = wp[1] - s.y, key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    if (Math.hypot(dx, dy) < 30 && s.near) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); continue; }
    await page.keyboard.down(key); await page.waitForTimeout(Math.min(260, 60 + Math.max(Math.abs(dx), Math.abs(dy)) * 2)); await page.keyboard.up(key); steps++;
    const pos = s.x + ',' + s.y; stuck = pos === lastPos ? stuck + 1 : 0; lastPos = pos; if (stuck > 40) { console.log('卡住了', JSON.stringify(s)); break; }
  }
  await page.waitForTimeout(1800); await page.screenshot({ path: 'shots/k_stay.png' });
  console.log('提示依次是：', seen.join(' → '));
  console.log(JSON.stringify({ label: s.label, beat: s.beat, ended: s.ended, err: s.err, steps, enters, tibi, sec: ((Date.now() - t0) / 1000).toFixed(0) }));
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
