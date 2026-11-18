// 查每个场景“走不走得通”：把能站的地方按 1 个单位一格铺开，看是不是连成一片；出口、热点、落脚点在不在同一片里。
// 为什么要查：两块能走的矩形只是边挨着边的时候，各自还要往里缩（左右缩半个身子、上下缩 4），中间会留一道缝；
// 一帧只迈三四个单位的人迈不过去，掉帧的时候却偶尔迈得过去——脚本时灵时不灵，真人就卡死在那里。
// 用法：node tools/walkaudit.js [场景id …]（不写就查全部）
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
const go = require('./_go');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader', '--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 960, height: 540 } });
  await go(pg, 'file://' + path.resolve(__dirname, '..', 'index.html') + '#cellar');
  const only = process.argv.slice(2);
  const res = await pg.evaluate((only) => {
    const R = 15, out = [];
    for (const id of Object.keys(JX.scenes)) {
      if (only.length && !only.includes(id)) continue;
      const sc = JX.scenes[id]; if (!sc.walk) continue;
      const blocks = (sc.blocks || []).slice();
      (sc.props || []).forEach(p => { if (p.block) blocks.push([p.x + p.block[0], p.y + p.block[1], p.block[2], p.block[3]]); });
      const ok = (x, y) => {
        let f = false; for (const w of sc.walk) if (x >= w[0] + R && x <= w[2] - R && y >= w[1] + 4 && y <= w[3] - 4) { f = true; break; }
        if (!f) return false;
        for (const k of blocks) if (x > k[0] - R && x < k[0] + k[2] + R && y > k[1] - 6 && y < k[1] + k[3] + 8) return false;
        return true;
      };
      const gw = sc.w + 1, gh = sc.h + 1, comp = new Int32Array(gw * gh), sizes = [0];
      const stack = [];
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
        if (comp[y * gw + x] || !ok(x, y)) continue;
        const c = sizes.length; sizes.push(0); comp[y * gw + x] = c; stack.push(x, y);
        while (stack.length) {
          const cy = stack.pop(), cx = stack.pop(); sizes[c]++;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
            if (comp[ny * gw + nx] || !ok(nx, ny)) continue; comp[ny * gw + nx] = c; stack.push(nx, ny);
          }
        }
      }
      const at = (x, y) => { x = Math.round(x); y = Math.round(y); return x < 0 || y < 0 || x >= gw || y >= gh ? 0 : comp[y * gw + x]; };
      const near = (x, y, r) => { const s = new Set(); for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) if (dx * dx + dy * dy <= r * r) { const c = at(x + dx, y + dy); if (c) s.add(c); } return [...s]; };
      const main = sizes.indexOf(Math.max(...sizes));
      const notes = [];
      sizes.forEach((n, c) => { if (c && c !== main) notes.push('另有一片走不到的地方：' + n + ' 格（第 ' + c + ' 片）'); });
      for (const k of Object.keys(sc.spawns || {})) { const s = sc.spawns[k], c = at(s.x, s.y); if (c !== main) notes.push('落脚点 ' + k + '（' + s.x + ',' + s.y + '）' + (c ? '在第 ' + c + ' 片' : '不在能站的地方')); }
      for (const x of (sc.exits || [])) {
        const s = new Set(); for (let yy = x.y + 1; yy < x.y + x.h; yy++) for (let xx = x.x + 1; xx < x.x + x.w; xx++) { const c = at(xx, yy); if (c) s.add(c); }
        if (!s.has(main)) notes.push('出口 ' + x.id + ' 从主片走不进去' + (s.size ? '（在第 ' + [...s].join('、') + ' 片）' : '（里面没有能站的格子）'));
      }
      for (const h of (sc.hots || [])) { const cs = near(h.x, h.y, (h.r || 80) - 28); if (!cs.includes(main)) notes.push('热点 ' + h.id + ' 从主片够不着'); }
      out.push({ id, parts: sizes.length - 1, main: sizes[main], notes });
    }
    return out;
  }, only);
  let bad = 0;
  for (const r of res) { if (r.notes.length) bad++; console.log((r.notes.length ? '✗ ' : '✓ ') + r.id + '：' + r.parts + ' 片，主片 ' + r.main + ' 格' + (r.notes.length ? '\n    ' + r.notes.join('\n    ') : '')); }
  console.log(bad ? '有 ' + bad + ' 个场景要看' : res.length + ' 个场景都连成一片');
  await b.close();
})();
