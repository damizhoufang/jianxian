// 第一章四至十二场检查：真按键。对白按回车；要走路的地方只照地上的路标按方向键；到人和东西跟前按回车；
// 相扑、对句、选择都只按回车（指引开着，光标该已经停在对的那一项上）。顺手把选择框、战斗、特写各截一张。
// 用法：node tools/ch1btest.js [从第几场起，默认 13＝第一章·四；17＝第一章·八] [wrong] [截图前缀，默认 b]
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const from = process.argv[2] || '13', wrong = process.argv[3] === 'wrong', PRE = 'shots/' + (process.argv[4] || 'b') + '_';      // 第二个参数写 wrong：故意打输两回再跳过、对句先挑错、选择挑最后一项
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await go(page, 'file://' + path.resolve('index.html')); await page.waitForTimeout(1200);
  await page.click('#title [data-a="scenes"]'); await page.waitForTimeout(300);
  await Promise.all([page.waitForNavigation(), page.click('#menu [data-jump="' + from + '"]')]);
  await page.waitForFunction(() => window.JX && JX.game && JX.game.playing);
  const st = () => page.evaluate(() => {
    const W = JX.world, p = W.player, g = W.guide, n = W.near, ch = document.getElementById('choice'), bt = document.getElementById('bt');
    return { beat: JX.story.i, label: JX.state.label, locked: W.locked, modal: JX.ui.modal, x: p ? Math.round(p.x) : 0, y: p ? Math.round(p.y) : 0, path: g ? g.path.map(q => [Math.round(q.x), Math.round(q.y)]) : null, near: n ? (n.label || '') : null,
      obj: document.getElementById('obj').classList.contains('hide') ? null : document.querySelector('#obj .t').textContent, end: !!document.getElementById('end'), ended: !!JX.ended, err: JX.lastError || null,
      card: document.getElementById('card') && !document.getElementById('card').classList.contains('hide'),
      choice: ch && !ch.classList.contains('hide') ? { q: (ch.querySelector('.q') || {}).textContent || '', sel: [...ch.querySelectorAll('.btn')].findIndex(b => b.classList.contains('sel')), opts: [...ch.querySelectorAll('.btn')].map(b => b.textContent) } : null,
      cmd: bt && bt.querySelector('.cmd') && !bt.querySelector('.cmd').classList.contains('hide') ? { on: (bt.querySelector('.cmd .c.on') || {}).textContent || '', items: [...bt.querySelectorAll('.cmd .c')].map(c => c.textContent), hint: (bt.querySelector('.cmd .d em') || {}).textContent || '' } : null,
      cut: !!document.getElementById('cut'), tut: !document.getElementById('tut') || document.getElementById('tut').classList.contains('hide') ? null : document.querySelector('#tut h3').textContent, qs: JX.state.flags.qs };
  });
  const seen = [], picks = [], cmds = []; let gotWrong = false, skipped = false; let steps = 0, enters = 0, stuck = 0, lastPos = '', nCut = 0, nCard = 0, lastQ = '', lastCmdBeat = -1; const t0 = Date.now(); let s;
  for (;;) {
    s = await st();
    if (s.err || s.ended || Date.now() - t0 > 900000) break;
    if (s.obj && seen[seen.length - 1] !== s.obj) { seen.push(s.obj); await page.screenshot({ path: PRE + 'obj' + seen.length + '.png' }); }
    if (s.end) { await page.screenshot({ path: PRE + 'end.png' }); await page.waitForTimeout(1000); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); continue; }
    if (s.tut) { await page.screenshot({ path: PRE + 'tut.png' }); await page.waitForTimeout(500); await page.keyboard.press('Enter'); await page.waitForTimeout(400); continue; }
    if (s.card) { await page.waitForTimeout(1300); await page.screenshot({ path: PRE + 'card' + (++nCard) + '.png' }); await page.keyboard.press('Enter'); await page.waitForTimeout(600); continue; }
    if (s.choice && wrong) {
      const q = s.choice.q, n = s.choice.opts.length; picks.push(q + '（' + n + ' 项）');
      if (/这一战/.test(q)) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(150); skipped = true; }
      else if (/下片|结句/.test(q) && n === 3) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(150); if (!gotWrong) { gotWrong = true; await page.screenshot({ path: PRE + 'wrongpick.png' }); } }
      else if (/怎么对她说/.test(q)) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); }
      await page.waitForTimeout(500); await page.keyboard.press('Enter'); await page.waitForTimeout(500); continue;
    }
    if (s.cmd && wrong && !skipped) {                                // 故意反着来：该闪的时候摔
      const other = s.cmd.items.indexOf(s.cmd.on) === 0 ? 'Digit2' : 'Digit1'; cmds.push('反着按 ' + other);      // 建议的是第一手就按第二手，否则按第一手
      await page.waitForTimeout(450); await page.keyboard.press(other); await page.waitForTimeout(200); await page.keyboard.press(other); await page.waitForTimeout(500); continue;
    }
    if (s.choice) { if (s.choice.q !== lastQ) { lastQ = s.choice.q; await page.waitForTimeout(500); await page.screenshot({ path: PRE + 'choice' + (picks.length + 1) + '.png' }); picks.push(s.choice.q + ' → ' + s.choice.opts[s.choice.sel]); } await page.keyboard.press('Enter'); await page.waitForTimeout(450); continue; }
    if (s.cmd) { if (cmds.length < 40) { cmds.push(s.cmd.on + '｜' + s.cmd.hint); if (cmds.length <= 6) { await page.waitForTimeout(450); await page.screenshot({ path: PRE + 'cmd' + cmds.length + '.png' }); } } await page.waitForTimeout(450); await page.keyboard.press('Enter'); await page.waitForTimeout(500); continue; }
    if (s.cut && nCut < 9) { await page.waitForTimeout(1900); await page.screenshot({ path: PRE + 'cut' + (++nCut) + '.png' }); await page.keyboard.press('Enter'); await page.waitForTimeout(400); continue; }
    if (s.locked || s.modal) { await page.keyboard.press('Enter'); enters++; await page.waitForTimeout(330); continue; }
    if (s.near && s.path && s.path.length <= 1 && Math.hypot((s.path[0] || [s.x])[0] - s.x, (s.path[0] || [0, s.y])[1] - s.y) < 90) { await page.keyboard.press('Enter'); enters++; await page.waitForTimeout(400); continue; }
    if (!s.path || !s.path.length) { if (s.near) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); } else await page.waitForTimeout(200); continue; }
    const wp = s.path.find(q => Math.hypot(q[0] - s.x, q[1] - s.y) > 26) || s.path[s.path.length - 1];
    const dx = wp[0] - s.x, dy = wp[1] - s.y, key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    if (Math.hypot(dx, dy) < 30 && s.near) { await page.keyboard.press('Enter'); await page.waitForTimeout(400); continue; }
    await page.keyboard.down(key); await page.waitForTimeout(Math.min(260, 60 + Math.max(Math.abs(dx), Math.abs(dy)) * 2)); await page.keyboard.up(key); steps++;
    const pos = s.x + ',' + s.y; stuck = pos === lastPos ? stuck + 1 : 0; lastPos = pos; if (stuck > 40) { console.log('卡住了', JSON.stringify(s)); await page.screenshot({ path: PRE + 'stuck.png' }); break; }
  }
  await page.waitForTimeout(1800); await page.screenshot({ path: PRE + 'stay.png' });
  console.log('提示依次是：', seen.join(' → '));
  console.log('选择：', picks.join('；'));
  console.log('战斗每一手：', cmds.join('；'));
  console.log(JSON.stringify({ label: s.label, beat: s.beat, ended: s.ended, err: s.err, steps, enters, qs: s.qs, sec: ((Date.now() - t0) / 1000).toFixed(0) }));
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
