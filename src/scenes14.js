/* 第四章《望海潮》的场景（二）：江心论潮的船（jiangxin）、月轮山下（yuelun）。
   江心：三条大船并成的擂台，一屏宽。远处一线江堤（密密一排小点是看潮的人）、六和塔、观潮台。东边在右手。
   潮头画在 under 和 top 里，看 W.chao（0 没有；0.3 天边一条白线；0.6 看得见是一堵墙；1 到了船上）。W.chaoMan 是墙头上那个人（0 到 1，从远到近）。
   船尾（画面左后）一排酒坛是单摆的人物位（W.jarsBroken 立起来就是碎的）。
   月轮山下：坟朝着江，背后是六和塔；日头看 W.dawn（和第二章江边用同一个数）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C, Fig = JX.Fig;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };
  const HZ = 286, DK = { x0: 190, x1: 1730, back: 566, front: 904 };
  const pagoda = (c, x, y, s) => JX.scenes13.pagoda(c, x, y, s);

  /* 一坛酒（贴“春”字） */
  function jar(g, x, y, s, broken) {
    g.save(); g.translate(x, y); g.scale(s, s); P.shadow(g, 0, 0, 34, 9, 0.35);
    if (broken) { g.fillStyle = '#5a3a26'; poly(g, [[-30, 0], [-34, -22], [-18, -12], [-6, -30], [8, -10], [24, -26], [32, 0]]); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke(); g.fillStyle = 'rgba(190,150,90,0.35)'; g.beginPath(); g.ellipse(6, 4, 60, 12, 0, 0, 6.3); g.fill(); g.restore(); return; }
    g.fillStyle = P.hgrad(g, -34, 0, 68, [[0, '#4a2f20'], [0.45, '#7a5236'], [1, '#3a2418']]); g.beginPath(); g.moveTo(-16, -78); g.quadraticCurveTo(-40, -60, -34, -22); g.quadraticCurveTo(-30, 0, -20, 0); g.lineTo(20, 0); g.quadraticCurveTo(30, 0, 34, -22); g.quadraticCurveTo(40, -60, 16, -78); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
    P.ellipse(g, 0, -80, 18, 6, '#b8362a', INK(), 1.4); g.fillStyle = '#b8362a'; g.fillRect(-13, -56, 26, 26); g.strokeRect(-13, -56, 26, 26); g.fillStyle = '#f3e6c4'; g.font = '600 20px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('春', 0, -42);
    g.restore();
  }
  function drawJars(g) { const b = JX.world.jarsBroken; for (let i = 0; i < 6; i++) jar(g, i * 62 - (i % 2) * 6, (i % 2) * 14, 0.92, b && i >= 2 && i <= 4); }

  /* 潮头：从右边压过来的一堵白墙 */
  function chao(c, t, k, over) {
    if (k <= 0.02) return;
    if (k < 0.5) {                                                    // 天边一条白线，慢慢粗起来
      const a = Math.min(1, k * 4), w = 2 + k * 22; c.fillStyle = 'rgba(250,252,248,' + (0.85 * a) + ')'; c.fillRect(1920 - 1500 * Math.min(1, k * 2.4), HZ + 6 - w / 2, 1500, w);
      for (let i = 0; i < 14; i++) P.ellipse(c, 1920 - ((i * 137 + t * 30) % (1500 * Math.min(1, k * 2.4))), HZ + 6 + Math.sin(t * 2 + i) * 2, 10 + k * 30, 3 + k * 8, 'rgba(255,255,255,' + (0.5 * a) + ')');
      return;
    }
    const q = (k - 0.5) / 0.5, xl = 1920 - 300 - 1500 * q, H = 80 + 820 * q * q, base = HZ + 30 + 560 * q;                 // 墙的左沿、墙高、墙脚
    if (over && q < 0.86) return;
    c.save(); if (over) c.globalAlpha = Math.min(1, (q - 0.86) / 0.1);
    const top = x => base - H * Math.min(1, Math.pow(Math.max(0, (x - xl) / 520), 0.55)) - Math.sin(x * 0.02 + t * 4) * 8 * q;      // 墙头是平的：往右不再接着长高
    const foot = over ? 1100 : base + 44;                               // 没到船上的时候，墙只有墙脚以上那一截；墙脚前头还是平常的水
    c.beginPath(); c.moveTo(xl - 60, base + 30); for (let x = xl; x <= 1960; x += 24) c.lineTo(x, top(x)); c.lineTo(1960, foot); c.lineTo(xl - 60, foot); c.closePath();
    const gr = c.createLinearGradient(0, base - H, 0, base + 40); gr.addColorStop(0, 'rgba(244,250,248,0.98)'); gr.addColorStop(0.3, 'rgba(176,206,204,0.96)'); gr.addColorStop(1, 'rgba(96,140,142,0.96)'); c.fillStyle = gr; c.fill();
    for (let x = xl; x <= 1960; x += 30) { const y = top(x), r = 16 + 26 * q + Math.sin(x * 0.07 + t * 5) * 6; P.ellipse(c, x, y + 4, r, r * 0.7, 'rgba(255,255,255,0.95)'); P.ellipse(c, x + 14, y - r * 0.4, r * 0.5, r * 0.4, 'rgba(255,255,255,0.8)'); }
    if (!over) for (let x = xl - 40; x <= 1960; x += 34) { const r = 10 + 12 * q + Math.sin(x * 0.05 + t * 6) * 4; P.ellipse(c, x, base + 40 + Math.sin(x * 0.03 + t * 3) * 3, r * 1.5, r * 0.5, 'rgba(255,255,255,0.75)'); }      // 墙脚一线白沫
    for (let i = 0; i < 40; i++) { const x = xl - 40 + ((i * 97 + t * 160) % 300) - 150, y = base + 20 - ((i * 53 + t * 220) % (80 + 200 * q)); P.ellipse(c, x, y, 3 + (i % 4), 3 + (i % 3), 'rgba(255,255,255,0.7)'); }      // 墙脚溅起来的水
    c.restore();
  }
  /* 墙头上那个人：远的时候只是一个小黑点，近了看得出灰袍子 */
  function chaoMan(c, t, k, m) {
    if (!m || k < 0.5) return; const q = (k - 0.5) / 0.5, xl = 1920 - 300 - 1500 * q, H = 80 + 820 * q * q, base = HZ + 30 + 560 * q;
    const x = 1470 - 60 * m, y = base - H * Math.min(1, Math.pow(Math.max(0, (x - xl) / 520), 0.55)) - Math.sin(x * 0.02 + t * 4) * 8 * q - 4, s = 0.28 + 0.5 * m;      // 在右边两面旗当中那一段墙头上
    c.save(); c.translate(x, y); c.scale(s, s); Fig.draw(c, Fig.cast.fan, 1, t * 9, { moving: true, shadow: false }); c.restore();
  }

  /* 三条大船并成的台（单画成一个函数：潮头立起来以后，要把船再盖在潮头上面——潮是从船后头过来的） */
  function boat(c) {
    /* 船帮、船头、铁索、铺板 */
    const { x0, x1, back, front } = DK;
    c.fillStyle = 'rgba(30,50,52,0.35)'; c.beginPath(); c.ellipse(960, front + 70, 900, 30, 0, 0, 6.3); c.fill();
    c.fillStyle = P.vgrad(c, 0, front, 76, [[0, '#5a3f2a'], [1, '#2e2018']]); poly(c, [[x0 - 110, front - 60], [x0 - 20, front + 66], [x1 + 20, front + 66], [x1 + 120, front - 70], [x1 + 40, front - 10], [x0 - 40, front - 6]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 2.2; c.stroke();
    [700, 1220].forEach(x => { P.line(c, x, front, x, front + 66, 5, '#1e1612'); for (let y = front + 6; y < front + 64; y += 12) P.ellipse(c, x, y, 5, 4, null, '#8a8f92', 2); });      // 铁索
    c.fillStyle = P.vgrad(c, 0, back, front - back, [[0, '#b39468'], [1, '#9a7c54']]); poly(c, [[x0 + 50, back], [x1 - 50, back], [x1, front], [x0, front]]); c.fill(); c.stroke();
    for (let i = 1; i < 22; i++) { const u = i / 22; P.line(c, x0 + 50 + (x1 - x0 - 100) * u, back, x0 + (x1 - x0) * u, front, 1.2, 'rgba(60,40,22,0.35)'); }
    for (let i = 1; i < 5; i++) { const y = back + (front - back) * i / 5; P.line(c, x0 + 50 * (1 - i / 5), y, x1 - 50 * (1 - i / 5), y, 1, 'rgba(60,40,22,0.18)'); }
    c.fillStyle = '#6a4a30'; c.fillRect(x0, front, x1 - x0, 14); c.strokeRect(x0, front, x1 - x0, 14);
    /* 后栏、旗 */
    for (let x = x0 + 60; x <= x1 - 60; x += 82) { c.fillStyle = '#6a4a30'; c.fillRect(x - 4, back - 46, 8, 46); } P.line(c, x0 + 56, back - 46, x1 - 56, back - 46, 5, '#6a4a30'); P.line(c, x0 + 56, back - 24, x1 - 56, back - 24, 3, '#6a4a30');
    [[x0 + 90, '#a8362a'], [x0 + 420, '#c9a24a'], [x1 - 420, '#2e5a66'], [x1 - 90, '#a8362a']].forEach(q => { P.line(c, q[0], back - 10, q[0], back - 290, 6, '#4a3a2a'); c.fillStyle = q[1]; poly(c, [[q[0] + 4, back - 286], [q[0] + 62, back - 278], [q[0] + 58, back - 130], [q[0] + 34, back - 150], [q[0] + 4, back - 130]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.6; c.stroke(); });
    /* 当中的凉棚：四根柱子，一领席顶，底下一张交椅、一张小几（茶盏、那管大笔横在笔架上） */
    c.strokeStyle = INK(); c.lineWidth = 1.6; [820, 1100].forEach(x => { c.fillStyle = '#5a3f2c'; c.fillRect(x - 7, back - 210, 14, 250); c.strokeRect(x - 7, back - 210, 14, 250); });
    c.fillStyle = P.vgrad(c, 0, back - 250, 60, [[0, '#c8b282'], [1, '#a08a5c']]); poly(c, [[780, back - 196], [820, back - 250], [1100, back - 250], [1140, back - 196]]); c.fill(); c.stroke(); for (let i = 1; i < 12; i++) P.line(c, 820 + 280 * i / 12, back - 250, 780 + 360 * i / 12, back - 196, 1, 'rgba(60,44,24,0.4)');
    c.fillStyle = '#b8362a'; c.fillRect(784, back - 196, 352, 12); c.strokeRect(784, back - 196, 352, 12);
    c.fillStyle = '#6a4a32'; c.fillRect(1010, back + 2, 96, 10); c.strokeRect(1010, back + 2, 96, 10); c.fillRect(1016, back + 12, 7, 36); c.fillRect(1093, back + 12, 7, 36); P.ellipse(c, 1034, back - 2, 9, 5, '#dceee2', INK(), 1.2); P.line(c, 1050, back - 6, 1100, back - 9, 5, '#5a3f2c'); c.fillStyle = '#1a1512'; poly(c, [[1100, back - 14], [1122, back - 9], [1100, back - 4]]); c.fill();
    /* 右后一面大鼓 */
    P.shadow(c, 1560, back + 50, 60, 14, 0.35); P.line(c, 1530, back + 50, 1544, back - 30, 6, '#4a3a2a'); P.line(c, 1590, back + 50, 1576, back - 30, 6, '#4a3a2a'); P.ellipse(c, 1560, back - 50, 56, 56, '#a8362a', INK(), 2); P.ellipse(c, 1560, back - 50, 44, 44, '#e9dcc0', INK(), 1.4);
  }
  let boatCv = null;
  function boatOver(c) {
    const S = JX.S || 1, w = Math.round(1920 * S), h = Math.round(1080 * S);
    if (!boatCv || boatCv.width !== w) { boatCv = document.createElement('canvas'); boatCv.width = w; boatCv.height = h; const g = boatCv.getContext('2d'); g.scale(S, S); boat(g); }
    c.drawImage(boatCv, 0, 0, 1920, 1080);
  }

  S.jiangxin = {
    name: '江心', sub: '论潮的船', w: 1920, h: 1080, ambient: '#e6e2d6', music: 'lunchao', outside: '#1c2026', amb: ['shui', 0.22], step: 'mu',
    walk: [[240, 626, 1680, 876]],
    spawns: { start: { x: 430, y: 790, dir: 3 }, mid: { x: 520, y: 780, dir: 3 }, duel: { x: 760, y: 770, dir: 3 } },
    exits: [],
    lights: [{ x: 960, y: 200, r: 1700, c: '#fff4d8', a: 0.4, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(1401);
      c.fillStyle = P.vgrad(c, 0, 0, HZ + 6, [[0, '#8fb4d0'], [0.7, '#cfe0e2'], [1, '#eef0e2']]); c.fillRect(0, 0, 1920, HZ + 6);
      P.glow(c, 1000, 60, 380, '#fffbe8', 0.7); [[420, 110, 420], [1500, 70, 520]].forEach(q => { c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(q[0], q[1], q[2], 18, 0, 0, 6.3); c.fill(); });
      P.hills(c, 0, HZ - 8, 1920, 70, { seed: 1402, layers: 2, col: '#7f9896', far: '#b4c6c8', mist: true, trees: false });
      c.fillStyle = '#5f7c66'; c.beginPath(); c.moveTo(60, HZ - 8); c.quadraticCurveTo(190, HZ - 96, 330, HZ - 8); c.closePath(); c.fill(); pagoda(c, 196, HZ - 62, 0.34);      // 月轮山、六和塔（很远）
      /* 远处的江堤：一道石色的线，上头密密一排小点 */
      c.fillStyle = '#8f938a'; c.fillRect(0, HZ - 10, 1920, 9);
      for (let x = 340; x < 1920; x += 5 + r() * 4) { c.fillStyle = P.mix(['#5b6f8a', '#8a5a4a', '#6e8a6a', '#b0a070', '#4a4a56'][Math.floor(r() * 5)], '#9aa6a2', 0.3); c.fillRect(x, HZ - 17 - r() * 3, 3, 8); }
      c.fillStyle = '#7a5a3c'; c.fillRect(1330, HZ - 34, 150, 18); ['#a8362a', '#c9a24a', '#2e5a66', '#a8362a', '#c9a24a'].forEach((col, i) => { P.line(c, 1345 + i * 30, HZ - 34, 1345 + i * 30, HZ - 70, 1.6, '#4a3a2a'); c.fillStyle = col; c.fillRect(1346 + i * 30, HZ - 70, 9, 22); }); c.fillStyle = '#f4f0e2'; c.fillRect(1290, HZ - 16, 230, 5);      // 观潮台和那道白绫
      c.fillStyle = P.vgrad(c, 0, HZ, 1080 - HZ, [[0, '#c4d2c8'], [0.3, '#93aeaa'], [1, '#5f8686']]); c.fillRect(0, HZ, 1920, 1080 - HZ);
      for (let i = 0; i < 240; i++) { const y = HZ + 8 + r() * (1080 - HZ - 12), x = r() * 1920, k = (y - HZ) / (1080 - HZ); P.line(c, x, y, x + 20 + r() * (50 + k * 110), y, 1 + k, 'rgba(250,252,246,' + (0.1 + r() * 0.2) + ')'); }
      [[330, 372, 0.5], [640, 350, 0.42], [1580, 380, 0.5]].forEach(q => { c.save(); c.translate(q[0], q[1]); c.scale(q[2], q[2]); c.fillStyle = 'rgba(40,60,60,0.25)'; c.beginPath(); c.ellipse(0, 14, 120, 8, 0, 0, 6.3); c.fill(); c.fillStyle = '#4a3626'; poly(c, [[-110, -16], [-92, 12], [92, 12], [118, -22], [90, -12], [-88, -12]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 2; c.stroke(); for (let i = 0; i < 7; i++) { c.fillStyle = P.mix('#5b6f8a', '#8a5a4a', r()); c.fillRect(-70 + i * 22, -34, 10, 22); P.ellipse(c, -65 + i * 22, -38, 5, 5, '#2a211d'); } c.restore(); });      // 四面看热闹的船
      boat(c);
      P.paper(c, 1920, 1080, 141, 0.28);
    },
    setup(W) { W.add('jars', { h: 80 }, 300, 640, { solid: true, tag: '醉春楼的酒', draw: drawJars }); },
    blocks: [[270, 606, 380, 50], [1000, 600, 120, 30]],
    under(c, t, W) {
      for (let i = 0; i < 20; i++) { const y = HZ + 20 + (i * 41) % (1080 - HZ - 30), x = (i * 311 + t * (8 + (i % 4) * 4)) % 2100 - 100; if (y > DK.back - 40 && y < DK.front + 70 && x > DK.x0 - 100 && x < DK.x1 + 100) continue; P.line(c, x, y, x + 50 + (i % 5) * 18, y, 1.4, 'rgba(250,252,246,0.22)'); }
      const k = JX.world.chao || 0; if (k > 0.02) { chao(c, t, k, false); chaoMan(c, t, k, JX.world.chaoMan || 0); boatOver(c); }
    },
    top(c, t) { const W = JX.world, k = W.chao || 0; chao(c, t, k, true); if (W.chaoWhite) { c.fillStyle = 'rgba(248,252,250,' + Math.min(1, W.chaoWhite) + ')'; c.fillRect(-200, -200, 2400, 1500); } },
  };

  /* 月轮山下 */
  S.yuelun = {
    name: '月轮山下', sub: '听得见潮声的地方', w: 1920, h: 1080, ambient: '#cfc9c6', music: 'yuelun', outside: '#1c2026', amb: ['chao', 0.16], step: 'cao',
    walk: [[220, 760, 1700, 970]],
    spawns: { start: { x: 420, y: 880, dir: 3 } },
    exits: [],
    blocks: [[1130, 756, 190, 44]],
    lights: [{ x: 1500, y: 360, r: 1500, c: '#ffe2b0', a: 0.4, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(1451);
      c.fillStyle = P.vgrad(c, 0, 0, 430, [[0, '#6f86a8'], [0.55, '#b9b4c0'], [0.85, '#f0c8a0'], [1, '#f8dcae']]); c.fillRect(0, 0, 1920, 430);
      [[600, 150, 380], [1300, 110, 460], [1700, 230, 300]].forEach(q => { c.fillStyle = 'rgba(255,236,214,0.4)'; c.beginPath(); c.ellipse(q[0], q[1], q[2], 14, 0, 0, 6.3); c.fill(); });
      P.hills(c, 500, 420, 1420, 60, { seed: 1452, layers: 2, col: '#6f8088', far: '#a9b2bc', mist: true, trees: false });
      c.fillStyle = P.vgrad(c, 0, 416, 260, [[0, '#d8c4a8'], [0.3, '#9fb0ac'], [1, '#6f8c8e']]); c.fillRect(0, 416, 1920, 270);
      for (let i = 0; i < 120; i++) { const y = 424 + r() * 240, x = 420 + r() * 1500; P.line(c, x, y, x + 30 + r() * 90, y, 1.2, 'rgba(255,246,226,' + (0.12 + r() * 0.2) + ')'); }
      /* 背后的山坡和塔 */
      c.fillStyle = P.vgrad(c, 0, 120, 600, [[0, '#5f7a62'], [1, '#4a6650']]); c.beginPath(); c.moveTo(0, 240); c.quadraticCurveTo(260, 120, 520, 300); c.quadraticCurveTo(700, 420, 900, 690); c.lineTo(0, 690); c.closePath(); c.fill(); c.strokeStyle = INK(0.6); c.lineWidth = 1.6; c.stroke();
      for (let i = 0; i < 80; i++) { const x = r() * 760, y = 250 + r() * 420; if (y < 240 + Math.max(0, x - 260) * 0.75) continue; P.ellipse(c, x, y, 22 + r() * 26, 14 + r() * 12, P.mix('#476650', '#6f8f68', r()), 'rgba(30,44,34,0.35)', 1); }
      pagoda(c, 300, 300, 1.25);
      /* 山脚的草坡、一条土路 */
      P.grass(c, 0, 660, 1920, 420, { seed: 1453, flowers: true });
      c.save(); poly(c, [[0, 900], [500, 868], [1100, 830], [1300, 840], [1320, 900], [1100, 906], [520, 950], [0, 990]]); c.clip(); P.earth(c, 0, 820, 1400, 180, { seed: 1454, col: '#b9a67e' }); c.restore();
      P.shore(c, 0, 668, 1920, { seed: 1455 });
      /* 坟：一堆新土，一块没有刨光的木牌 */
      P.shadow(c, 1226, 792, 130, 22, 0.35);
      c.fillStyle = P.vgrad(c, 0, 690, 110, [[0, '#9a7a54'], [1, '#6e5438']]); c.beginPath(); c.moveTo(1100, 794); c.quadraticCurveTo(1130, 690, 1226, 684); c.quadraticCurveTo(1326, 690, 1352, 794); c.closePath(); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.6; c.stroke();
      for (let i = 0; i < 40; i++) P.ellipse(c, 1120 + r() * 220, 716 + r() * 74, 3 + r() * 5, 2 + r() * 3, 'rgba(60,44,28,' + (0.2 + r() * 0.25) + ')');
      c.fillStyle = '#c9b48a'; c.fillRect(1080, 664, 34, 132); c.strokeRect(1080, 664, 34, 132); for (let i = 0; i < 5; i++) P.line(c, 1084 + i * 6, 668, 1084 + i * 6 + (i % 2), 792, 0.8, 'rgba(90,70,40,0.3)'); P.vtext(c, '师父', 1097, 700, 28, '#3a2a1c');
      P.ellipse(c, 1150, 800, 16, 6, '#dceee2', INK(), 1.2);
      P.paper(c, 1920, 1080, 151, 0.28);
    },
    props: [
      { x: 560, y: 760, bw: 300, bh: 330, draw(g) { P.tree(g, 0, 0, 1.05, 'pine', { seed: 1461 }); } },
      { x: 1560, y: 780, bw: 300, bh: 330, draw(g) { P.tree(g, 0, 0, 0.95, 'pine', { seed: 1462 }); } },
      { x: 1740, y: 1000, bw: 240, bh: 200, draw(g) { P.reeds(g, 0, 0, 180, 150, { seed: 1463 }); } },
      { x: 200, y: 1040, bw: 260, bh: 180, draw(g) { P.bush(g, 0, 0, 1.3, { seed: 1464 }); } },
    ],
    under(c, t) {
      const k = JX.world.dawn || 0; if (k <= 0) return;
      const y = 430 - 70 * k; c.save(); c.beginPath(); c.rect(520, 0, 1400, 430); c.clip(); P.glow(c, 1500, y, 300 + 200 * k, '#fff0c8', 0.55 * k); P.ellipse(c, 1500, y, 46, 46, 'rgba(255,244,214,' + (0.95 * k) + ')'); c.restore();
      c.save(); c.globalAlpha = 0.5 * k; for (let i = 0; i < 16; i++) P.line(c, 1500 - 30 - i * 5 + Math.sin(t * 1.5 + i) * 6, 440 + i * 14, 1500 + 30 + i * 5 + Math.sin(t * 1.5 + i) * 6, 440 + i * 14, 3, 'rgba(255,236,190,0.7)'); c.restore();
    },
  };
  JX.scenes14 = { DK, jar };
})();
