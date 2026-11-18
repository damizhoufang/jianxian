// 把 ground.js 里的画法摆在一张图上看：node tools/kitshot.js 图.png
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'); const go = require('./_go');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader', '--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await go(pg, 'file://' + path.resolve(__dirname, '..', 'index.html') + '#cellar');
  await pg.evaluate(() => {
    const P = JX.P, cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:1920px;height:1080px';
    document.body.appendChild(cv); const c = cv.getContext('2d');
    c.fillStyle = '#d9cdb4'; c.fillRect(0, 0, 1920, 1080);
    P.earth(c, 0, 0, 480, 270, { ruts: [120] }); P.grass(c, 480, 0, 480, 270, { flowers: true, bare: 3 }); P.grass(c, 960, 0, 480, 270, { dry: true }); P.tiles(c, 1440, 0, 480, 270);
    P.tiles(c, 0, 270, 480, 270, { diag: true, col: '#9a7a5c' }); P.cobbles(c, 480, 270, 480, 270, { moss: true }); P.planks(c, 960, 270, 960, 270, { seed: 3 });
    P.rug(c, 1000, 300, 420, 210, {}); P.rug(c, 1470, 300, 400, 210, { style: 'lattice', col: '#2f4a5e', border: '#7a2a24', accent: '#e3c57a' }); 
    P.flagstones(c, 0, 540, 1920, 540, { seed: 9 });
    P.patch(c, 300, 700, 260, 110, 5, (x, y, w, h) => P.grass(c, x, y, w, h, { flowers: true }));
    P.pond(c, 300, 700, 150, 60, {});
    P.patch(c, 820, 900, 300, 120, 8, (x, y, w, h) => P.earth(c, x, y, w, h, {}));
    P.mat(c, 1500, 880, 300, 150); P.rug(c, 1150, 890, 300, 150, { style: 'plain', col: '#5a6a4a', border: '#2a2a22', accent: '#d9c98a' });
    P.rockery(c, 640, 760, 1); P.rock(c, 760, 770, 1); P.rock(c, 520, 800, 0.7, { seed: 9 });
    P.bush(c, 880, 760, 1, {}); P.bush(c, 960, 770, 0.9, { flower: '#c9454a', seed: 7 }); P.bamboo(c, 1060, 780, 240, 6);
    P.tree(c, 1250, 790, 0.8, 'willow'); P.tree(c, 1460, 790, 0.8, 'pine'); P.tree(c, 1660, 790, 0.8, 'plum'); P.tree(c, 1830, 790, 0.7, 'round');
    P.tree(c, 120, 1040, 0.6, 'bare');
    P.potted(c, 240, 1040, 1.2, 'orchid'); P.potted(c, 320, 1040, 1.2, 'pine', { stand: 50 }); P.potted(c, 400, 1040, 1.2, 'plum'); P.potted(c, 480, 1040, 1.2, 'bamboo'); P.potted(c, 560, 1040, 1.2, 'chrys', { stand: 30 });
    P.flowerbed(c, 620, 960, 180, 70, {}); P.reeds(c, 150, 660, 90, 80); P.fence(c, 860, 1040, 1100, { thorn: true });
    P.shore(c, 0, 560, 1920, {});
    c.save(); c.translate(0, 0); P.hills(c, 1440, 268, 480, 170, {}); c.restore();
  });
  await pg.waitForTimeout(300); await pg.screenshot({ path: process.argv[2] || '/tmp/kit.png' }); console.log(errs.length ? errs : '没有报错'); await b.close();
})();
