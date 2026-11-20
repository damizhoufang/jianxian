// 战斗的胜率：在页面里把某一场战斗用“自带打法”连打 N 遍，闪避照实掷骰（不像自动通关那样必中）。
// 用法：node tools/battlesim.js <alley|roof|hall|huafang|jiang> <演出名> [遍数]   例：node tools/battlesim.js roof 战三 60；node tools/battlesim.js huafang 战梅花 40；node tools/battlesim.js guanshe 战油葫芦一 30；node tools/battlesim.js jiang 战水匪 30；node tools/battlesim.js dongdi 战司辰 30；node tools/battlesim.js shanmen 守庵战 30；node tools/battlesim.js shanmen 战金琵琶甲 30；node tools/battlesim.js shanmen 战金琵琶乙 30
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path');
(async () => {
  const scene = process.argv[2] || 'roof', hook = process.argv[3] || '战三', n = +process.argv[4] || 40;
  const stage = { hall: 6, alley: 8, roof: 9, huafang: 20, jiang: 26, guanshe: 31, haichuan: 36, dongdi: 40, shanmen: 41 }[scene];
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await go(page, 'file://' + path.resolve('index.html') + '#' + scene); await page.waitForTimeout(1500);
  const out = await page.evaluate(async ({ hook, n, stage, scene }) => {
    const W = JX.world, B = JX.battle, H = JX.story.hooks, st = JX.state; st.stage = stage; st.flags.saber = true; st.flags.follow = false;
    JX.auto = true; JX.honest = true;
    const run0 = B.run, all = []; let tries = 0;
    B.run = async def => { const r = await run0(def); all.push({ result: r.result, acts: r.b.acts, hp: r.b.units.filter(u => u.side === 'ally').map(u => u.hp) }); return r; };
    for (let i = 0; i < n; i++) { st.flags.won2 = st.flags.fell = false; JX.populate(scene); if (scene === 'huafang') { W.remove('maihua'); W.add('meihuachi', 'meihuachi', 2040, 746, { dir: 1, solid: false }); } await H[hook](); }      // 画舫那一战：卖花女先换成梅花翅
    return all;
  }, { hook, n, stage, scene }).catch(e => ({ err: e.message }));
  if (out.err) console.log('出错', out.err, errs.join('\n'));
  else {
    const win = out.filter(o => o.result === 'win'), lose = out.length - win.length, avg = a => (a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(1);
    console.log(hook, '打了', out.length, '遍：赢', win.length, '输', lose, '；赢的那些平均', avg(win.map(o => o.acts)), '手，剩下气血 陆惊蛰', avg(win.map(o => o.hp[0])), '最少', Math.min.apply(0, win.map(o => o.hp[0])), (win[0] && win[0].hp.length > 1 ? '，同伴 ' + avg(win.map(o => o.hp[1])) + ' 最少 ' + Math.min.apply(0, win.map(o => o.hp[1])) : ''));
  }
  console.log(errs.length ? errs.join('\n') : '没有报错');
  await browser.close();
})();
