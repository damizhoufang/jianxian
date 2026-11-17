// 跳场检查：逐场用菜单里的“跳到这一场”跳过去，再自动走到下一场开头（最后一场走到结尾），看每一份快照都接得上。
// 用法：node tools/jumptest.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const url = 'file://' + path.resolve('index.html');
  await go(page, url); await page.waitForTimeout(1500);
  const all = await page.evaluate(() => JX.story.scenes()); let bad = 0;
  for (let i = 0; i < all.length; i++) {
    const t0 = Date.now();
    if (i === 0) { await page.click('#title [data-a="scenes"]'); await page.waitForTimeout(300); await Promise.all([page.waitForNavigation(), page.click('#menu [data-jump="0"]')]); }   // 第一回从标题画面的“选一场开始”进
    else await Promise.all([page.waitForNavigation(), page.evaluate(l => { JX.auto = false; JX.story.jump(l); }, all[i])]);
    await page.waitForFunction(() => window.JX && JX.game && JX.game.playing, null, { timeout: 20000 });
    const at = await page.evaluate(() => { JX.auto = true; JX.autoDelay = 0.03; JX.fast = 5; return JX.state.label; });
    const next = all[i + 1] || null;
    const ok = await page.waitForFunction(n => JX.lastError || (n ? JX.state.label === n : JX.ended), next, { timeout: 200000 }).then(() => true).catch(() => false);
    const st = await page.evaluate(() => ({ label: JX.state.label, beat: JX.story.i, err: JX.lastError || null, ended: !!JX.ended }));
    const good = at === all[i] && ok && !st.err; if (!good) bad++;
    console.log(good ? '  通' : '  不通', all[i], '→', next || '结尾', '　', ((Date.now() - t0) / 1000).toFixed(0) + ' 秒', good ? '' : JSON.stringify({ at, st }));
  }
  console.log(bad ? bad + ' 场接不上' : all.length + ' 场都接得上');
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close(); process.exit(bad ? 1 : 0);
})();
