/* 第三章五、六场的场景：潮音洞（chaoyindong，一条往下走的石路，三处低洼随潮涨落）、洞底（dongdi，放霜降的石室）。
   三处低洼的水画在 under 里，深浅看 W.tide[i]（1 是潮涨着、淹着，0 是退干了）；挡不挡路是演出里往 W.blocks 里添、撤的。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };
  /* 石壁：深浅不一的一块一块 */
  function rockWall(c, w, h, seed, top, bot) {
    c.fillStyle = P.vgrad(c, 0, 0, h, [[0, top], [1, bot]]); c.fillRect(0, 0, w, h);
    const r = JX.rng(seed);
    for (let i = 0; i < w / 14; i++) { const x = r() * w, y = r() * h, rw = 60 + r() * 220, rh = 30 + r() * 110; c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,' + (0.05 + r() * 0.1) + ')' : 'rgba(190,206,214,' + (0.03 + r() * 0.05) + ')'; c.beginPath(); c.ellipse(x, y, rw, rh, r() * 0.6 - 0.3, 0, 6.3); c.fill(); }
    for (let i = 0; i < w / 40; i++) { const x = r() * w, y = r() * h; c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 1 + r() * 1.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + r() * 80 - 40, y + 40 + r() * 60, x + r() * 120 - 60, y + 90 + r() * 120); c.stroke(); }
  }
  const stalactite = (c, x, y, w, h, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x - w * 0.14, y + h * 0.5, x, y + h); c.quadraticCurveTo(x + w * 0.14, y + h * 0.5, x + w / 2, y); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.2; c.stroke(); };
  /* 一洼水，横在路上，从这边石壁一直到那边：a 是深浅（1 是潮涨着，0 是退干了）。水退的时候是往当中收的，两边先露出湿石头 */
  function pool(c, t, x0, x1, y0, y1, a, seed) {
    const cx = (x0 + x1) / 2, hw = (x1 - x0) / 2, N = 12;
    const edge = (k, sg, w) => { const y = y0 + (y1 - y0) * k / N; return [cx + sg * w * (1 + 0.16 * Math.sin(k * 1.7 + seed * 2.1 + sg) + 0.08 * Math.sin(k * 3.9 + seed)), y]; };
    /* 水边是圆的：折线的拐角用曲线带过去（0.15.0 以前是一段一段的直线，像撕出来的纸边） */
    const shape = w => {
      const pts = []; for (let k = 0; k <= N; k++) pts.push(edge(k, -1, w)); for (let k = N; k >= 0; k--) pts.push(edge(k, 1, w));
      const n = pts.length, mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], m0 = mid(pts[n - 1], pts[0]);
      c.beginPath(); c.moveTo(m0[0], m0[1]);
      for (let k = 0; k < n; k++) { const m = mid(pts[k], pts[(k + 1) % n]); c.quadraticCurveTo(pts[k][0], pts[k][1], m[0], m[1]); }
      c.closePath();
    };
    c.fillStyle = 'rgba(22,36,46,' + (0.2 + 0.14 * (1 - a)) + ')'; shape(hw * 1.08); c.fill();                                    // 水退以后留下的湿石头
    if (a <= 0.03) { for (let i = 0; i < 6; i++) P.ellipse(c, x0 + 26 + ((i * 97 + seed * 31) % (x1 - x0 - 52)), y0 + 34 + ((i * 53 + seed * 17) % (y1 - y0 - 70)), 16 + (i % 3) * 9, 5 + (i % 2) * 3, 'rgba(150,196,210,0.34)'); return; }
    const w = hw * (0.22 + 0.78 * a), g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(92,132,146,' + (0.5 + 0.4 * a) + ')'); g.addColorStop(1, 'rgba(40,76,96,' + (0.6 + 0.36 * a) + ')');
    c.fillStyle = g; shape(w); c.fill();
    c.save(); shape(w); c.clip();
    const dg = c.createRadialGradient(cx, (y0 + y1) / 2, 10, cx, (y0 + y1) / 2, (y1 - y0) * 0.62); dg.addColorStop(0, 'rgba(14,34,48,' + (0.5 * a) + ')'); dg.addColorStop(1, 'rgba(14,34,48,0)');      // 当中深，边上浅
    c.fillStyle = dg; c.fillRect(cx - hw * 1.3, y0, hw * 2.6, y1 - y0);
    for (let i = 0; i < 9; i++) {                                                                                                // 水面的光：一小段一小段的弧，慢慢漂
      const y = y0 + 22 + ((i * 37 + seed * 11) % (y1 - y0 - 44)), x = cx - w + ((i * 131 + t * (10 + (i % 3) * 5) + seed * 40) % (2 * w)), L = 26 + (i % 4) * 12;
      c.strokeStyle = 'rgba(226,244,248,' + (0.34 * a + 0.08) + ')'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + L / 2, y - 3 - (i % 2) * 2, x + L, y); c.stroke();
    }
    c.restore();
    shape(w); c.strokeStyle = 'rgba(226,244,248,' + (0.22 * a + 0.1) + ')'; c.lineWidth = 6; c.stroke();                          // 水边一圈白：外头一道淡的、宽的，里头一道细的
    shape(w); c.strokeStyle = 'rgba(232,246,250,' + (0.5 * a + 0.2) + ')'; c.lineWidth = 1.8; c.stroke();
  }

  const POOLS = [[760, 960], [1420, 1660], [2080, 2320]];                 // 三处低洼的 x 范围
  S.chaoyindong = {
    name: '潮音洞', sub: '洞随潮走', w: 2800, h: 1080, ambient: '#b6c2cc', music: 'shuangjiang', outside: '#06080a',
    walk: [[100, 650, 2700, 900]],
    spawns: { start: { x: 220, y: 780, dir: 3 } },
    exits: [{ id: 'down', x: 2640, y: 660, w: 60, h: 230, label: '洞底', lx: 2590, ly: 610, back: [-40, 0] }],
    pools: POOLS,
    lights: [{ x: 120, y: 520, r: 900, c: '#dff0f6', a: 0.7, ey: 0.7 }, { x: 1400, y: 700, r: 1700, c: '#9fc0d0', a: 0.3, ey: 0.5 }, { x: 2600, y: 640, r: 600, c: '#cfe8f6', a: 0.5, ey: 0.6, glow: 30, gx: 2690, gy: 560, gc: '#dff4ff', ga: 0.4 }],
    marks: [{ t: '洞口', x: 150, y: 420 }, { t: '石刻', x: 430, y: 440 }, { t: '头一处水', x: 860, y: 600 }, { t: '第二处水', x: 1540, y: 600 }, { t: '第三处水', x: 2200, y: 600 }],
    paint(c) {
      const r = JX.rng(1101);
      rockWall(c, 2800, 1080, 1102, '#5a6874', '#333e48');
      /* 洞口：外头的天和海 */
      c.save(); c.beginPath(); c.ellipse(60, 470, 230, 270, 0, 0, 6.3); c.clip(); c.fillStyle = P.vgrad(c, 0, 200, 540, [[0, '#cfe2ea'], [0.55, '#e6ecdc'], [0.56, '#8fb4bc'], [1, '#5f8e9a']]); c.fillRect(-180, 190, 480, 560); for (let i = 0; i < 12; i++) P.line(c, r() * 260, 520 + r() * 200, 40 + r() * 260, 520 + r() * 200, 1.4, 'rgba(250,252,250,0.4)'); c.restore();
      c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 10; c.beginPath(); c.ellipse(60, 470, 230, 270, 0, -1.5, 1.5); c.stroke();
      const lg = c.createRadialGradient(140, 520, 40, 140, 520, 900); lg.addColorStop(0, 'rgba(214,236,244,0.34)'); lg.addColorStop(1, 'rgba(214,236,244,0)'); c.fillStyle = lg; c.fillRect(0, 0, 1100, 1080);
      /* 路：湿的石面，从洞口一路往下 */
      c.fillStyle = P.vgrad(c, 0, 620, 320, [[0, '#8a98a0'], [1, '#66747c']]); poly(c, [[0, 640], [700, 628], [1400, 640], [2100, 630], [2800, 640], [2800, 930], [2100, 944], [1400, 930], [700, 944], [0, 930]]); c.fill();
      for (let i = 0; i < 260; i++) { const x = r() * 2800, y = 640 + r() * 290; P.ellipse(c, x, y, 14 + r() * 40, 5 + r() * 12, r() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(180,200,210,0.07)'); }
      for (let i = 0; i < 40; i++) { const x = r() * 2800, y = 650 + r() * 270; P.ellipse(c, x, y, 5 + r() * 9, 3 + r() * 5, P.mix('#6e7a80', '#a9b6ba', r()), 'rgba(0,0,0,0.4)', 0.8); }
      c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 640); c.lineTo(700, 628); c.lineTo(1400, 640); c.lineTo(2100, 630); c.lineTo(2800, 640); c.stroke();
      /* 钟乳、石笋 */
      for (let i = 0; i < 46; i++) { const x = 260 + r() * 2500, h = 60 + r() * 240; stalactite(c, x, 0, 30 + r() * 50, h, P.mix('#3e4a54', '#62707c', r())); }
      for (let i = 0; i < 14; i++) { const x = 300 + r() * 2400, h = 40 + r() * 90; c.save(); c.translate(x, 640); c.scale(1, -1); stalactite(c, 0, 0, 26 + r() * 30, h, P.mix('#56626c', '#76848e', r())); c.restore(); }
      /* 石壁上的水光、最里头透上来的一点亮 */
      for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(160,220,236,' + (0.15 + r() * 0.3) + ')'; c.fillRect(300 + r() * 2400, 120 + r() * 480, 2, 2); }
      const dg = c.createRadialGradient(2740, 620, 20, 2740, 620, 420); dg.addColorStop(0, 'rgba(206,236,250,0.4)'); dg.addColorStop(1, 'rgba(206,236,250,0)'); c.fillStyle = dg; c.fillRect(2300, 200, 500, 800);
      P.paper(c, 2800, 1080, 111, 0.26);
    },
    props: [
      { x: 430, y: 672, bw: 120, bh: 210, block: [-40, -14, 80, 18], draw(g) {                                                       // 洞口的石刻：潮来则止，潮退则行
        P.shadow(g, 0, 0, 46, 9, 0.4); g.fillStyle = P.vgrad(g, 0, -190, 190, [[0, '#b4c0c4'], [1, '#86949a']]); g.beginPath(); g.moveTo(-36, 0); g.lineTo(-32, -170); g.quadraticCurveTo(0, -200, 32, -170); g.lineTo(36, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
        g.font = '600 24px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle'; ['潮来则止', '潮退则行'].forEach((ln, k) => ln.split('').forEach((ch, i) => { g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillText(ch, 16 - k * 30, -151 + i * 36); g.fillStyle = 'rgba(14,22,28,0.95)'; g.fillText(ch, 15 - k * 30, -152 + i * 36); }));
        for (let i = 0; i < 6; i++) P.ellipse(g, -30 + i * 12, -4 - (i % 2) * 5, 9, 5, 'rgba(70,104,84,0.5)'); } },
      { x: 600, y: 668, bw: 110, bh: 80, block: [-34, -14, 68, 18], draw(g) { P.rock(g, 0, 0, 0.9, { seed: 112, col: '#58646a' }); } },
      { x: 1200, y: 664, bw: 110, bh: 80, block: [-34, -14, 68, 18], draw(g) { P.rock(g, 0, 0, 1.0, { seed: 113, col: '#5e6a70' }); } },
      { x: 1880, y: 668, bw: 130, bh: 90, block: [-40, -14, 80, 18], draw(g) { P.rock(g, -10, 0, 1.1, { seed: 114, col: '#64707a' }); } },
      { x: 400, y: 1070, bw: 200, bh: 130, draw(g) { P.rock(g, -40, 0, 1.4, { seed: 115, col: '#2e363c' }); P.rock(g, 50, 0, 1.0, { seed: 116, col: '#343c42' }); } },
      { x: 2460, y: 1070, bw: 200, bh: 130, draw(g) { P.rock(g, 0, 0, 1.5, { seed: 117, col: '#2e363c' }); } },
    ],
    under(c, t, W) {
      const td = W.tide || [1, 1, 1];
      POOLS.forEach((q, i) => pool(c, t, q[0], q[1], 634, 938, td[i] == null ? 1 : td[i], i + 1));
      (W.prints || []).forEach(q => { for (let k = 0; k < q[3]; k++) { const x = q[0] + k * q[4], y = q[1] + (k % 2 ? 10 : -10), s = q[2]; c.save(); c.translate(x, y); c.rotate(k % 2 ? 0.12 : -0.12); c.fillStyle = 'rgba(14,26,34,0.55)'; c.beginPath(); c.ellipse(s * 0.35, 0, s * 0.9, s * 0.42, 0, 0, 6.3); c.fill(); c.beginPath(); c.ellipse(-s * 0.95, 0, s * 0.42, s * 0.36, 0, 0, 6.3); c.fill(); c.restore(); } });      // 湿脚印：[x, y, 大小, 几个, 步距]
    },
    anim(c, t) { for (let i = 0; i < 7; i++) { const u = (t * 0.5 + i * 0.37) % 1, x = 420 + i * 340; c.fillStyle = 'rgba(190,226,238,' + (0.7 * (1 - u)) + ')'; c.fillRect(x, 200 + u * 440, 2, 9); } },      // 滴水
  };

  /* ================= 洞底：放霜降的石室 ================= */
  S.dongdi = {
    name: '洞底', sub: '潮音洞 · 石室', w: 1920, h: 1080, ambient: '#b8c4d0', music: 'shuangjiang', outside: '#06080a',
    walk: [[150, 660, 1770, 920]],
    spawns: { in: { x: 240, y: 820, dir: 3 }, start: { x: 240, y: 820, dir: 3 } },
    exits: [{ id: 'up', x: 150, y: 700, w: 44, h: 180, label: '回洞口', lx: 240, ly: 640, back: [40, 0] }],
    lights: [{ x: 960, y: 420, r: 900, c: '#e6f4ff', a: 0.8, ey: 0.8, glow: 40, gx: 960, gy: 120, gc: '#eef8ff', ga: 0.5 }, { x: 400, y: 700, r: 700, c: '#a9c8d8', a: 0.3, ey: 0.6 }, { x: 1500, y: 700, r: 700, c: '#a9c8d8', a: 0.3, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(1121);
      rockWall(c, 1920, 1080, 1122, '#5c6a76', '#343e48');
      /* 顶上一道缝，天光漏下来 */
      c.fillStyle = '#eef8ff'; poly(c, [[900, 0], [1010, 0], [984, 60], [938, 70]]); c.fill();
      const sh = c.createLinearGradient(0, 0, 0, 640); sh.addColorStop(0, 'rgba(232,246,255,0.5)'); sh.addColorStop(1, 'rgba(232,246,255,0.04)'); c.fillStyle = sh; poly(c, [[910, 0], [1000, 0], [1180, 640], [760, 640]]); c.fill();
      /* 地：石面；当中一汪水 */
      c.fillStyle = P.vgrad(c, 0, 620, 460, [[0, '#8c9aa2'], [1, '#62707a']]); c.fillRect(0, 630, 1920, 450);
      for (let i = 0; i < 200; i++) { const x = r() * 1920, y = 640 + r() * 430; P.ellipse(c, x, y, 14 + r() * 40, 5 + r() * 12, r() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(180,200,210,0.07)'); }
      c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 632); c.lineTo(1920, 632); c.stroke();
      P.pond(c, 1560, 596, 190, 40, { seed: 1123, col: '#5d8c9a', fish: 0, lily: 0 });
      /* 石台和石匣，正在天光底下：匣盖掀在一边，匣里是空的；四周一圈白霜 */
      c.fillStyle = '#6a767e'; poly(c, [[790, 590], [1130, 590], [1164, 634], [756, 634]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 2; c.stroke();
      c.fillStyle = '#4a545c'; c.fillRect(756, 634, 408, 36); c.strokeRect(756, 634, 408, 36);
      c.fillStyle = '#7e8a92'; c.fillRect(850, 546, 220, 44); c.strokeRect(850, 546, 220, 44); c.fillStyle = '#161e24'; c.fillRect(862, 554, 196, 30);
      c.save(); c.translate(1096, 560); c.rotate(0.42); c.fillStyle = '#8a969e'; c.fillRect(-10, -8, 200, 22); c.strokeRect(-10, -8, 200, 22); c.restore();
      for (let i = 0; i < 90; i++) { const a = r() * 6.3, d = 120 + r() * 170, x = 960 + Math.cos(a) * d * 1.3, y = 612 + Math.sin(a) * d * 0.42; c.fillStyle = 'rgba(240,250,255,' + (0.3 + r() * 0.4) + ')'; c.beginPath(); c.ellipse(x, y, 4 + r() * 12, 2 + r() * 5, 0, 0, 6.3); c.fill(); }
      const fg = c.createRadialGradient(960, 600, 20, 960, 600, 300); fg.addColorStop(0, 'rgba(236,248,255,0.3)'); fg.addColorStop(1, 'rgba(236,248,255,0)'); c.fillStyle = fg; c.fillRect(600, 380, 720, 440);
      /* 钟乳 */
      for (let i = 0; i < 26; i++) { const x = r() * 1920; if (x > 840 && x < 1080) continue; stalactite(c, x, 0, 30 + r() * 50, 70 + r() * 230, P.mix('#3e4a54', '#62707c', r())); }
      P.paper(c, 1920, 1080, 112, 0.26);
    },
    props: [
      { x: 440, y: 668, bw: 130, bh: 90, block: [-40, -14, 80, 18], draw(g) { P.rock(g, 0, 0, 1.2, { seed: 121, col: '#66727a' }); } },
      { x: 960, y: 672, bw: 10, bh: 10, block: [-210, -16, 420, 18], draw() {} },                                              // 石台的前沿，挡着路
      { x: 300, y: 1070, bw: 200, bh: 130, draw(g) { P.rock(g, 0, 0, 1.5, { seed: 122, col: '#2e363c' }); } },
      { x: 1640, y: 1070, bw: 200, bh: 130, draw(g) { P.rock(g, 0, 0, 1.4, { seed: 123, col: '#2e363c' }); } },
    ],
    anim(c, t) { for (let i = 0; i < 12; i++) { const u = (t * 0.16 + i * 0.083) % 1, x = 860 + ((i * 53) % 220); c.fillStyle = 'rgba(240,250,255,' + (0.5 * Math.sin(u * Math.PI)) + ')'; c.fillRect(x + Math.sin(t + i) * 10, 80 + u * 520, 2, 2); } },      // 天光里的浮尘
  };
})();
