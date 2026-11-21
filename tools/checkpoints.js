// 生成各场开头的进度快照 data/checkpoints.js（菜单“场次”跳场用）。
// 自动通玩一遍，把每一场开头那次自动存档记下来。剧本或演出改了旗标，就重新跑一次：node tools/checkpoints.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const go = require('./_go');
const path = require('path'), fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(() => { const s = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'jx.save') (window.__cps = window.__cps || []).push(v); return s.apply(this, arguments); }; });
  await go(page, 'file://' + path.resolve('index.html') + '#auto');
  await page.waitForFunction(() => window.JX && (JX.ended || JX.lastError), null, { timeout: 900000 });
  const out = await page.evaluate(() => ({ err: JX.lastError || null, cps: window.__cps || [], labels: JX.story.beats.filter(b => b.t === 'label').map(b => b.name) }));
  await browser.close();
  if (out.err || errs.length) { console.log('出错', out.err, errs.join('\n')); process.exit(1); }
  const list = [];
  for (const l of out.labels) { const raw = out.cps.map(s => JSON.parse(s)).find(s => s.label === l); if (!raw) { console.log('缺这一场的存档：', l); process.exit(1); } list.push({ label: l, money: raw.money || 0, flags: raw.flags || {} }); }
  const text = '/* 各场开头的进度快照：菜单“场次”和 [ ] 键跳场用。\n   由 tools/checkpoints.js 自动通玩一遍生成，不要手改；剧本或演出改了旗标就重新生成。 */\nwindow.JX_CHECKPOINTS = [\n' + list.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n];\n';
  const file = path.resolve('data/checkpoints.js'), old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  fs.writeFileSync(file, text);
  console.log(list.length, '场；', old === text ? '和原来的一样' : old ? '有变化，已更新' : '新建');
  list.forEach(c => console.log(' ', c.label, c.money + ' 文', JSON.stringify(c.flags)));
})();
