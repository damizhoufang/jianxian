// 真按键测试：走动、转向、互动、出口、俯瞰点地、菜单、声音
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const pos = () => page.evaluate(() => ({ x: Math.round(JX.world.player.x), y: Math.round(JX.world.player.y), dir: JX.world.player.dir, scene: JX.world.id, god: JX.world.godOn, modal: JX.ui.modal }));
  const hold = async (k, ms) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); await page.waitForTimeout(80); };
  await page.goto('file://' + path.resolve('index.html') + '#cellar'); await page.waitForTimeout(900);
  console.log('起点', JSON.stringify(await pos()));
  await hold('ArrowRight', 700); console.log('→ 0.7 秒', JSON.stringify(await pos()));
  await hold('ArrowUp', 400); console.log('↑ 0.4 秒', JSON.stringify(await pos()));
  await page.keyboard.press('KeyA'); await page.waitForTimeout(120); console.log('轻按 A（左转）', JSON.stringify(await pos()));
  await hold('KeyW', 500); console.log('W 0.5 秒', JSON.stringify(await pos()));
  await hold('KeyS', 500); console.log('S 0.5 秒（掉头走）', JSON.stringify(await pos()));
  await hold('KeyD', 600); console.log('按住 D 0.6 秒（右转并走）', JSON.stringify(await pos()));
  await page.keyboard.press('KeyV'); await page.waitForTimeout(700); console.log('V 俯瞰', JSON.stringify(await pos()));
  await page.mouse.click(1030, 300); await page.waitForTimeout(3500); console.log('点楼梯口后', JSON.stringify(await pos()));
  await page.waitForTimeout(1500); console.log('再等一会', JSON.stringify(await pos()));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); console.log('Esc 菜单', JSON.stringify(await pos()));
  await page.screenshot({ path: 'shots/keytest_menu.png' });
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const au = await page.evaluate(() => ({ ctx: JX.audio.ctx && JX.audio.ctx.state, cur: JX.audio.cur && JX.audio.cur.id, sfx: Object.keys(JX.audio.sbufs), dur: JX.audio.cur && Math.round(JX.audio.cur.src.buffer.duration * 10) / 10, filt: Math.round(JX.audio.ctx ? 0 : 0) }));
  console.log('声音', JSON.stringify(au));
  if (errs.length) console.log('错误：', errs.slice(0, 8).join(' | ')); else console.log('没有报错');
  await browser.close();
})();
