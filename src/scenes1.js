/* 场景（一）：酒窖、后厨。每个场景自己画底图、摆物件、定灯位和出口。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C, Fig = JX.Fig;
  const S = JX.scenes = JX.scenes || {};

  /* 一排酒坛做成一件物件 */
  function jarRow(x, y, n, step, seed, o) {
    o = o || {};
    return {
      x: x + (n - 1) * step / 2, y, bw: (n - 1) * step + 90, bh: 108, block: [-(n - 1) * step / 2 - 30, -26, (n - 1) * step + 60, 30],
      draw(g) { const r = JX.rng(seed); for (let i = 0; i < n; i++) P.jar(g, -(n - 1) * step / 2 + i * step, 0, 0.92 + r() * 0.16, { seed: seed + i, text: o.text || (r() < 0.3 ? '春' : '酒'), label: r() > 0.15 }); },
    };
  }

  /* ================= 酒窖 ================= */
  S.cellar = {
    name: '酒窖', sub: '醉春楼 · 地下', w: 1920, h: 1080, ambient: '#35324c', particles: 'dust', music: 'yuanxi', muffle: 520,
    walk: [[80, 300, 1840, 1040]],
    spawns: { start: { x: 900, y: 720, dir: 0 }, fromKitchen: { x: 1580, y: 370, dir: 0 } },
    exits: [{ id: 'up', x: 1500, y: 296, w: 160, h: 26, to: 'kitchen', spawn: 'fromCellar', label: '上后厨', ly: 250, back: [0, 30] }],
    lights: [
      { x: 760, y: 560, r: 640, c: '#ffcf8e', a: 0.95, ey: 0.8, glow: 62, gx: 760, gy: 236, gc: '#ffc670' },
      { x: 1580, y: 330, r: 520, c: '#ffe0b0', a: 0.9, ey: 0.9, glow: 90, gx: 1580, gy: 150, gc: '#ffd9a0', ga: 0.5 },
      { x: 300, y: 860, r: 300, c: '#8fa0c8', a: 0.25 },
    ],
    blocks: [[1690, 300, 150, 150]],
    paint(c) {
      const r = JX.rng(101);
      /* 地面：青石板，中间一条被酒坛磨出来的旧痕 */
      P.flagstones(c, 0, 290, 1920, 790, { seed: 5, base: '#7f786c', sh: 70 });
      for (let i = 0; i < 26; i++) { const x = 100 + r() * 1700, y = 320 + r() * 700, rad = 30 + r() * 110; const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(30,22,16,' + (0.06 + r() * 0.12) + ')'); g.addColorStop(1, 'rgba(30,22,16,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      /* 后墙：砖，上面压一道木梁 */
      P.brick(c, 0, 0, 1920, 300, { seed: 9, base: '#6f5e52' });
      P.ao(c, 0, 0, 1920, 120, 'top', 0.55); P.ao(c, 0, 200, 1920, 100, 'bottom', 0.4);
      P.beam(c, 0, 30, 1920, 30, '#3a281c');
      for (let x = 110; x < 1920; x += 300) P.beam(c, x, 60, 22, 240, '#3f2c1f');
      /* 墙上的木架：两层小坛 */
      [[150, 1130]].forEach(([x0, x1]) => {
        [150, 248].forEach((sy, tier) => {
          P.beam(c, x0, sy, x1 - x0, 12, '#4a3424');
          P.ao(c, x0, sy + 12, x1 - x0, 18, 'top', 0.45);
          for (let x = x0 + 40; x < x1 - 20; x += 62) { if (r() < 0.12) continue; P.jar(c, x, sy, 0.5 + r() * 0.08, { seed: x + tier, label: r() < 0.7, text: '酒' }); }
        });
      });
      /* 酒神龛与“酒”字红笺 */
      c.fillStyle = '#2a1c14'; c.fillRect(1218, 96, 110, 150); P.rect(c, 1226, 104, 94, 134, '#4a2a1c', P.rgba(C.ink, 0.8), 1.5);
      c.fillStyle = '#b5382a'; c.fillRect(1246, 118, 54, 78); P.vtext(c, '酒', 1273, 128, 46, '#1e1410', '600');
      P.candle(c, 1242, 238); P.candle(c, 1304, 238);
      /* 墙上挂的酒提子、漏斗、麻绳 */
      for (let i = 0; i < 4; i++) { const x = 1370 + i * 26; P.line(c, x, 120, x, 200 + i * 6, 2.4, '#5a4028'); P.ellipse(c, x, 206 + i * 6, 8, 6, '#6a4c30', P.rgba(C.ink, 0.8), 1); }
      c.strokeStyle = '#8a744c'; c.lineWidth = 4; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(1150, 200, 20 - i * 3, 26 - i * 3, 0, 0, 6.3); c.stroke(); }
      /* 上后厨的木梯：墙上开一个口，暖光从上面漏下来 */
      c.fillStyle = '#120c09'; c.fillRect(1490, 40, 180, 262);
      const g2 = c.createLinearGradient(0, 40, 0, 300); g2.addColorStop(0, 'rgba(255,214,150,0.85)'); g2.addColorStop(1, 'rgba(255,190,110,0.08)'); c.fillStyle = g2; c.fillRect(1490, 40, 180, 262);
      for (let i = 0; i < 9; i++) { const y = 286 - i * 28, w = 168 - i * 9; c.fillStyle = P.mix('#6a4a2e', '#c59a62', i / 9); c.fillRect(1580 - w / 2, y, w, 16); c.fillStyle = 'rgba(20,12,8,0.55)'; c.fillRect(1580 - w / 2, y + 16, w, 12); c.strokeStyle = P.rgba(C.ink, 0.6); c.lineWidth = 1; c.strokeRect(1580 - w / 2, y, w, 16); }
      P.beam(c, 1478, 30, 14, 272, '#3a281c'); P.beam(c, 1668, 30, 14, 272, '#3a281c');
      P.lantern(c, 1580, 150, 24, { cord: 60, col: '#e06a36' });
      /* 柱上的油灯 */
      P.beam(c, 748, 60, 24, 240, '#3f2c1f'); c.fillStyle = '#2a1c14'; c.fillRect(742, 244, 36, 6); P.candle(c, 760, 244);
      /* 左右墙与近处的墙沿 */
      c.fillStyle = '#17110d'; c.fillRect(0, 290, 80, 790); c.fillRect(1840, 290, 80, 790); c.fillRect(0, 1040, 1920, 40);
      P.ao(c, 80, 290, 120, 750, 'left', 0.5); P.ao(c, 1720, 290, 120, 750, 'right', 0.5); P.ao(c, 0, 290, 1920, 90, 'top', 0.5); P.ao(c, 0, 940, 1920, 100, 'bottom', 0.45);
      /* 右后角的木箱和箩筐 */
      [[1700, 448, 64, 70], [1772, 452, 60, 60], [1730, 392, 70, 56]].forEach(([x, y, w, h], i) => { P.shadow(c, x + w / 2, y, w * 0.7, 12, 0.4); c.fillStyle = P.vgrad(c, x, y - h, h, [[0, '#8a6a42'], [1, '#5c4329']]); c.fillRect(x, y - h, w, h); c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1.5; c.strokeRect(x, y - h, w, h); P.line(c, x, y - h * 0.5, x + w, y - h * 0.5, 1, P.rgba(C.ink, 0.4)); P.line(c, x + w / 2, y - h, x + w / 2, y, 1, P.rgba(C.ink, 0.3)); });
      P.paper(c, 1920, 1080, 4, 0.45);
    },
    props: [
      jarRow(150, 420, 1, 0, 11), jarRow(150, 530, 1, 0, 12), jarRow(150, 640, 1, 0, 13), jarRow(150, 750, 1, 0, 14), jarRow(150, 860, 1, 0, 15), jarRow(150, 970, 1, 0, 16),
      jarRow(250, 475, 1, 0, 21), jarRow(250, 585, 1, 0, 22), jarRow(250, 805, 1, 0, 23), jarRow(250, 915, 1, 0, 24),
      jarRow(430, 560, 5, 88, 31), jarRow(1010, 560, 3, 88, 36),
      jarRow(430, 860, 6, 88, 41), jarRow(1130, 860, 4, 88, 47),
      jarRow(1340, 640, 1, 0, 51), jarRow(1440, 700, 1, 0, 52), jarRow(1730, 760, 1, 0, 53), jarRow(1730, 880, 1, 0, 54), jarRow(1640, 960, 2, 90, 55),
      { x: 1110, y: 520, bw: 70, bh: 60, draw(g) { P.shadow(g, 0, 0, 34, 9, 0.35); g.fillStyle = '#6b4c30'; g.fillRect(-26, -30, 52, 8); g.fillRect(-22, -22, 6, 22); g.fillRect(16, -22, 6, 22); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.2; g.strokeRect(-26, -30, 52, 8); g.fillStyle = '#e6dcc2'; g.fillRect(-16, -37, 30, 7); g.strokeRect(-16, -37, 30, 7); }, block: [-26, -14, 52, 16] },
    ],
  };

  /* ================= 后厨 ================= */
  function steam(c, x, y, t, k) {
    for (let i = 0; i < 5; i++) {
      const u = ((t * 0.28 + i * 0.2 + k) % 1), a = Math.sin(u * Math.PI) * 0.2, yy = y - u * 150, xx = x + Math.sin(u * 5 + i + k * 9) * 16;
      const g = c.createRadialGradient(xx, yy, 0, xx, yy, 24 + u * 44); g.addColorStop(0, 'rgba(245,240,230,' + a + ')'); g.addColorStop(1, 'rgba(245,240,230,0)');
      c.fillStyle = g; c.fillRect(xx - 70, yy - 70, 140, 140);
    }
  }
  S.kitchen = {
    name: '后厨', sub: '醉春楼 · 八眼灶', w: 1920, h: 1080, ambient: '#5b4c50', music: 'yuanxi', muffle: 1500,
    walk: [[80, 440, 1840, 1040]],
    spawns: { fromCellar: { x: 250, y: 700, dir: 3 }, fromHall: { x: 1720, y: 680, dir: 1 }, start: { x: 250, y: 700, dir: 3 } },
    exits: [
      { id: 'down', x: 60, y: 610, w: 70, h: 170, to: 'cellar', spawn: 'fromKitchen', label: '下酒窖', lx: 150, ly: 560, back: [30, 0] },
      { id: 'hall', x: 1790, y: 580, w: 70, h: 190, to: 'hall', spawn: 'fromKitchen', label: '去大堂', lx: 1740, ly: 520, back: [-30, 0] },
    ],
    lights: [
      { x: 330, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 330, gy: 424, gc: '#ff8a3a' },
      { x: 476, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 476, gy: 424, gc: '#ff8a3a' },
      { x: 622, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 622, gy: 424, gc: '#ff8a3a' },
      { x: 768, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 768, gy: 424, gc: '#ff8a3a' },
      { x: 914, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 914, gy: 424, gc: '#ff8a3a' },
      { x: 1060, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 1060, gy: 424, gc: '#ff8a3a' },
      { x: 1206, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 1206, gy: 424, gc: '#ff8a3a' },
      { x: 1352, y: 470, r: 300, c: '#ffb066', a: 0.5, ey: 0.8, glow: 44, gx: 1352, gy: 424, gc: '#ff8a3a' },
      { x: 960, y: 760, r: 760, c: '#ffe2b4', a: 0.75, ey: 0.75 },
      { x: 1650, y: 520, r: 460, c: '#ffe6c0', a: 0.8, glow: 70, gx: 1650, gy: 130, gc: '#ffd9a0', ga: 0.55 },
      { x: 240, y: 760, r: 360, c: '#ffd9a8', a: 0.5, glow: 60, gx: 240, gy: 150, gc: '#ffd9a0', ga: 0.5 },
    ],
    blocks: [[250, 440, 1180, 20], [1480, 440, 260, 30]],
    paint(c) {
      const r = JX.rng(201);
      P.flagstones(c, 0, 420, 1920, 660, { seed: 15, base: '#8f8573', sh: 66 });
      for (let i = 0; i < 30; i++) { const x = 100 + r() * 1700, y = 470 + r() * 560, rad = 30 + r() * 90; const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(40,28,18,' + (0.05 + r() * 0.1) + ')'); g.addColorStop(1, 'rgba(40,28,18,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      /* 后墙：熏黑的灰墙，木构架 */
      P.plaster(c, 0, 0, 1920, 330, { seed: 17, base: '#c9b997' });
      const sm = c.createLinearGradient(0, 0, 0, 330); sm.addColorStop(0, 'rgba(30,20,14,0.62)'); sm.addColorStop(0.6, 'rgba(30,20,14,0.2)'); sm.addColorStop(1, 'rgba(30,20,14,0.05)'); c.fillStyle = sm; c.fillRect(0, 0, 1920, 330);
      P.beam(c, 0, 40, 1920, 30, '#3a281c');
      for (let x = 190; x < 1920; x += 430) P.post(c, x, 70, 26, 260, '#4a3020');
      /* 梁上挂的火腿、蒜辫、干鱼、辣茱萸 */
      for (let i = 0; i < 16; i++) {
        const x = 250 + i * 76 + r() * 20, k = Math.floor(r() * 4), len = 30 + r() * 26;
        P.line(c, x, 70, x, 70 + len, 1.2, '#3a2a1e');
        if (k === 0) { c.fillStyle = '#8a4636'; c.beginPath(); c.ellipse(x, 70 + len + 26, 13, 28, 0.15, 0, 6.3); c.fill(); c.strokeStyle = P.rgba(C.ink, 0.7); c.lineWidth = 1.2; c.stroke(); P.ellipse(c, x - 3, 70 + len + 18, 4, 10, 'rgba(255,220,190,0.25)'); }
        else if (k === 1) { for (let j = 0; j < 6; j++) P.ellipse(c, x + (j % 2 ? 5 : -5), 70 + len + j * 9, 6, 5.4, '#e9e2cf', P.rgba(C.ink, 0.6), 1); }
        else if (k === 2) { c.fillStyle = '#8f8a78'; c.beginPath(); c.ellipse(x, 70 + len + 22, 7, 24, 0, 0, 6.3); c.fill(); c.strokeStyle = P.rgba(C.ink, 0.7); c.stroke(); P.poly(c, [x, 70 + len + 44, x - 8, 70 + len + 56, x + 8, 70 + len + 56], '#8f8a78', P.rgba(C.ink, 0.7), 1); }
        else { for (let j = 0; j < 7; j++) P.ellipse(c, x + (j % 2 ? 4 : -4), 70 + len + j * 7, 3.4, 5, '#b43a2a'); }
      }
      /* 八眼灶：砖砌灶台，灶口朝外 */
      const sx = 250, sw = 1180, sy = 330;
      P.brick(c, sx, sy - 6, sw, 116, { seed: 19, base: '#8a6f5c', bh: 20, bw: 54 });
      c.fillStyle = P.vgrad(c, sx, sy - 44, 44, [[0, '#a89880'], [1, '#8d7d66']]); c.fillRect(sx - 10, sy - 44, sw + 20, 44);
      c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1.6; c.strokeRect(sx - 10, sy - 44, sw + 20, 44); c.strokeRect(sx, sy - 6, sw, 116);
      for (let i = 0; i < 8; i++) {
        const x = sx + 80 + i * 146;
        c.fillStyle = '#0f0a08'; c.beginPath(); c.moveTo(x - 30, sy + 104); c.lineTo(x - 30, sy + 62); c.quadraticCurveTo(x, sy + 34, x + 30, sy + 62); c.lineTo(x + 30, sy + 104); c.closePath(); c.fill();
        const fg = c.createRadialGradient(x, sy + 96, 2, x, sy + 90, 40); fg.addColorStop(0, '#fff0b0'); fg.addColorStop(0.35, '#ff9a34'); fg.addColorStop(1, 'rgba(180,40,10,0)'); c.fillStyle = fg; c.beginPath(); c.moveTo(x - 28, sy + 104); c.lineTo(x - 28, sy + 64); c.quadraticCurveTo(x, sy + 38, x + 28, sy + 64); c.lineTo(x + 28, sy + 104); c.closePath(); c.fill();
        P.ellipse(c, x, sy - 24, 54, 15, '#17110e', P.rgba(C.ink, 0.9), 1.5);
        if (i % 3 === 1) P.steamer(c, x, sy - 22, 46, 3);
        else if (i % 3 === 2) { P.ellipse(c, x, sy - 26, 50, 13, '#2a221e', P.rgba(C.ink, 0.9), 1.4); P.ellipse(c, x, sy - 27, 40, 9, ['#a8672e', '#7a8c4e', '#c9b07a'][i % 3]); P.line(c, x + 30, sy - 30, x + 76, sy - 52, 3.4, '#5a4028'); }
        else { P.ellipse(c, x, sy - 25, 48, 12, '#3a302a', P.rgba(C.ink, 0.9), 1.4); P.ellipse(c, x, sy - 31, 46, 11, '#8a6a42', P.rgba(C.ink, 0.8), 1.2); P.ellipse(c, x, sy - 34, 8, 4, '#4a3424'); }
      }
      P.ao(c, sx, sy + 110, sw, 34, 'top', 0.5);
      /* 传菜的条案（右后）：出好的菜等着端 */
      c.fillStyle = '#2c1e16'; c.fillRect(1470, 60, 290, 250); P.rect(c, 1480, 70, 270, 230, '#55392a', P.rgba(C.ink, 0.8), 1.5);
      for (let i = 0; i < 3; i++) { P.beam(c, 1480, 122 + i * 62, 270, 8, '#3a281c'); for (let j = 0; j < 7; j++) { const x = 1500 + j * 37; P.ellipse(c, x, 118 + i * 62, 14, 5, [C.celadon, C.whiteware, '#b9cdd0'][(i + j) % 3], P.rgba(C.ink, 0.6), 1); P.ellipse(c, x, 113 + i * 62, 14, 5, [C.whiteware, C.celadon, C.celadon][(i + j) % 3], P.rgba(C.ink, 0.6), 1); } }
      P.table(c, 1610, 474, 250, 60, 44, { col: '#5d412c', seed: 7 }); P.dishes(c, 1610, 430, 250, 60, 71, 5);
      P.lantern(c, 1650, 130, 26, { cord: 70, col: '#e8743a' }); P.lantern(c, 240, 150, 22, { cord: 80, col: '#e8743a' });
      /* 下酒窖的梯口（左墙）与通大堂的门（右墙，挂蓝布门帘） */
      c.fillStyle = '#17110d'; c.fillRect(0, 330, 80, 750); c.fillRect(1840, 330, 80, 750); c.fillRect(0, 1040, 1920, 40);
      c.fillStyle = '#0c0807'; c.fillRect(14, 600, 66, 190); for (let i = 0; i < 5; i++) { c.fillStyle = P.mix('#5a4028', '#22170f', i / 5); c.fillRect(22 + i * 2, 770 - i * 34, 58 - i * 2, 14); }
      P.beam(c, 66, 590, 14, 210, '#4a3020');
      c.fillStyle = '#e9c58a'; c.fillRect(1840, 570, 60, 210); P.beam(c, 1834, 560, 12, 230, '#4a3020');
      c.fillStyle = P.hgrad(c, 1846, 0, 54, [[0, '#3e5c78'], [1, '#2c4560']]); c.fillRect(1846, 570, 54, 150); c.strokeStyle = P.rgba(C.ink, 0.7); c.lineWidth = 1.2; c.strokeRect(1846, 570, 54, 150); P.line(c, 1872, 570, 1872, 720, 1, P.rgba('#000', 0.4)); P.vtext(c, '酒', 1859, 610, 22, '#e6dcc2', '600');
      P.ao(c, 80, 420, 110, 620, 'left', 0.42); P.ao(c, 1730, 420, 110, 620, 'right', 0.3); P.ao(c, 0, 950, 1920, 90, 'bottom', 0.4);
      P.paper(c, 1920, 1080, 6, 0.45);
    },
    props: [
      /* 案板一：片好的淮白鱼 */
      { x: 760, y: 760, bw: 330, bh: 150, block: [-150, -84, 300, 80], draw(g) { P.table(g, 0, 0, 300, 86, 46, { col: '#6a4a30', seed: 21 }); P.rect(g, -120, -124, 120, 56, '#c9a878', P.rgba(C.ink, 0.7), 1.2); for (let i = 0; i < 3; i++) { g.fillStyle = '#d9dde0'; g.beginPath(); g.ellipse(-60, -112 + i * 16, 42, 6.5, 0, 0, 6.3); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.7); g.lineWidth = 1; g.stroke(); P.poly(g, [-18, -112 + i * 16, -4, -118 + i * 16, -4, -106 + i * 16], '#c5cbd0', P.rgba(C.ink, 0.7), 1); P.ellipse(g, -92, -113 + i * 16, 1.6, 1.6, '#1a1310'); } g.fillStyle = '#9aa3a6'; g.fillRect(30, -122, 54, 14); g.fillStyle = '#4b3525'; g.fillRect(84, -119, 28, 8); P.dishes(g, 80, -46, 130, 60, 5, 2); } },
      /* 案板二：蟹酿橙 */
      { x: 1230, y: 800, bw: 330, bh: 150, block: [-150, -84, 300, 80], draw(g) { P.table(g, 0, 0, 300, 86, 46, { col: '#6a4a30', seed: 22 }); const r = JX.rng(8); for (let i = 0; i < 9; i++) { const x = -120 + (i % 5) * 34 + (i > 4 ? 17 : 0), y = -108 + (i > 4 ? 26 : 0); P.ellipse(g, x + 2, y + 3, 14, 6, 'rgba(0,0,0,0.25)'); const og = g.createRadialGradient(x - 4, y - 6, 1, x, y, 15); og.addColorStop(0, '#ffd27a'); og.addColorStop(1, '#d9791f'); P.ellipse(g, x, y, 14, 12.5, og, P.rgba(C.ink, 0.7), 1.1); if (i % 2) P.ellipse(g, x, y - 9, 9, 3.6, '#f2e2a8', P.rgba(C.ink, 0.6), 0.8); } g.strokeStyle = '#a8412c'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const x = 70 + i * 26, y = -100; P.ellipse(g, x, y, 11, 8, '#b5482e', P.rgba(C.ink, 0.7), 1); P.line(g, x - 10, y, x - 17, y - 8, 2, '#a8412c'); P.line(g, x + 10, y, x + 17, y - 8, 2, '#a8412c'); } P.steamer(g, 110, -62, 26, 2); } },
      /* 水缸 */
      { x: 470, y: 960, bw: 130, bh: 130, block: [-52, -30, 104, 30], draw(g) { P.shadow(g, 6, 0, 62, 16, 0.4); g.beginPath(); g.moveTo(-40, 0); g.bezierCurveTo(-66, -40, -62, -90, -48, -104); g.lineTo(48, -104); g.bezierCurveTo(62, -90, 66, -40, 40, 0); g.quadraticCurveTo(0, 8, -40, 0); g.closePath(); g.fillStyle = P.hgrad(g, -60, 0, 120, [[0, '#3a2c22'], [0.3, '#6a5444'], [1, '#2c2018']]); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.85); g.lineWidth = 1.5; g.stroke(); P.ellipse(g, 0, -104, 48, 13, '#1c2a30', P.rgba(C.ink, 0.85), 1.5); P.ellipse(g, -8, -106, 26, 5, 'rgba(160,200,210,0.25)'); P.line(g, 30, -112, 62, -128, 3, '#6a4c30'); P.ellipse(g, 26, -108, 10, 5, '#7a5a38', P.rgba(C.ink, 0.7), 1); } },
      /* 洗碗的木盆和碗山 */
      { x: 300, y: 980, bw: 190, bh: 190, block: [-84, -34, 168, 34], draw(g) { P.shadow(g, 0, 0, 90, 18, 0.4); g.fillStyle = P.hgrad(g, -70, 0, 140, [[0, '#6a4c30'], [0.4, '#9a7448'], [1, '#5a3e26']]); g.beginPath(); g.ellipse(0, -8, 70, 20, 0, 0, Math.PI); g.lineTo(-70, -34); g.ellipse(0, -34, 70, 20, 0, Math.PI, 0, true); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.4; g.stroke(); P.ellipse(g, 0, -34, 70, 20, '#3a4a4c', P.rgba(C.ink, 0.8), 1.4); for (let s = 0; s < 4; s++) { const x = -42 + s * 28, n = 6 + ((s * 5) % 7); for (let i = 0; i < n; i++) P.ellipse(g, x + Math.sin(i * 1.3 + s) * 2, -40 - i * 8, 13, 5, i % 3 ? C.whiteware : C.celadon, P.rgba(C.ink, 0.55), 0.9); } } },
      /* 柴垛 */
      { x: 1500, y: 1010, bw: 200, bh: 90, block: [-90, -30, 180, 30], draw(g) { P.shadow(g, 0, 0, 96, 14, 0.4); const r = JX.rng(31); for (let row = 0; row < 3; row++) for (let i = 0; i < 7 - row; i++) { const x = -78 + i * 26 + row * 13, y = -10 - row * 22; P.ellipse(g, x, y, 12, 11, P.mix('#8a6238', '#5a3e22', r()), P.rgba(C.ink, 0.8), 1.2); P.ellipse(g, x, y, 6, 5.4, null, P.rgba('#3a2412', 0.5), 1); } } },
    ],
    anim(c, t) { [476, 914, 1352].forEach((x, i) => steam(c, x, 262, t, i * 0.31)); steam(c, 1340, 720, t, 0.6); },
  };
})();
