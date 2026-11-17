// 载入器检查：起一个本地网页服务，故意让某个文件头几回取不到（503），看游戏还能不能起来；一直取不到时屏幕上有没有话。
// 用法：node tools/loadtest.js
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css' };
(async () => {
  const root = path.resolve('.');
  const server = http.createServer((req, res) => {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0].replace(/\/$/, '/index.html')));
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  }).listen(0);
  const url = 'http://127.0.0.1:' + server.address().port + '/index.html';
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  let bad = 0;
  async function run(name, file, failTimes, expect) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } }), page = await ctx.newPage();
    let n = 0; await page.route('**/' + file + '*', r => (n++ < failTimes ? r.fulfill({ status: 503, body: 'no' }) : r.continue()));
    await page.goto(url);
    const st = await page.waitForFunction(() => (window.JX && JX.booted) || (document.getElementById('boot') && document.getElementById('boot').className === 'bad'), null, { timeout: 30000 })
      .then(() => page.evaluate(() => ({ booted: !!(window.JX && JX.booted), msg: document.getElementById('boot') ? document.getElementById('boot').innerText : '', cps: (window.JX_CHECKPOINTS || []).length, ver: window.JX && JX.VERSION })))
      .catch(() => ({ timeout: true }));
    let extra = '';
    if (expect === 'ok' && st.booted) {
      await page.waitForTimeout(1200); await page.click('#title [data-a="scenes"]'); await page.waitForTimeout(300);
      const opts = await page.evaluate(() => document.querySelectorAll('#menu [data-jump]').length); extra = '选场页 ' + opts + ' 项'; if (opts !== 10) st.booted = false;
    }
    if (expect === 'music') { await page.waitForTimeout(1200); await page.keyboard.press('ArrowDown'); await page.mouse.click(900, 80); await page.waitForTimeout(7000); const m = await page.evaluate(() => !!(window.JX_MUSIC && window.JX_MUSIC.zhuti)); extra = '主题曲 ' + (m ? '取到了' : '没取到'); if (!m) st.booted = false; }
    const good = expect === 'msg' ? (!st.booted && /没有取到/.test(st.msg || '') && st.msg.indexOf(file) >= 0) : !!st.booted;
    if (!good) bad++;
    console.log(good ? '  通' : '  不通', name, '（' + file + ' 头 ' + (failTimes > 50 ? '所有' : failTimes) + ' 回回 503，实际请求 ' + n + ' 回）', extra, good ? '' : JSON.stringify(st));
    await ctx.close();
  }
  await run('什么都不坏', 'nothing-xyz', 0, 'ok');
  await run('场次表头几回取不到', 'data/checkpoints.js', 3, 'ok');
  await run('第一个脚本头几回取不到', 'src/core.js', 2, 'ok');
  await run('中间的脚本头几回取不到', 'src/world.js', 4, 'ok');
  await run('音乐头两回取不到', 'music/zhuti.js', 2, 'music');
  await run('一直取不到：屏幕上要有话', 'src/story.js', 99, 'msg');
  console.log(bad ? bad + ' 项不通' : '载入器都通');
  await browser.close(); server.close(); process.exit(bad ? 1 : 0);
})();
