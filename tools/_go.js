// 打开页面并等游戏启动完。脚本是 index.html 里的载入器一个接一个执行的，页面的 load 事件到了不代表都执行完了。
module.exports = async function go(page, url, opts) {
  const r = await page.goto(url, opts);
  if (/index\.html/.test(url)) await page.waitForFunction(() => window.JX && window.JX.booted, null, { timeout: 30000 });
  return r;
};
