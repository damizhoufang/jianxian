/* 第三章《渔家傲》头四场的场景：定海渡口（dinghai）、莲花洋上的香船（haichuan）、潮音庵山门（shanmen）、庵内（annei）。
   地面和景物直接用 ground.js；香船借第二章那条船的画法（scenes7.js 的 drawBoat，舱里换成香客的行李）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };
  const text = (c, t, x, y, px, col) => { c.fillStyle = col || '#2b221c'; c.font = '600 ' + px + 'px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x, y); };
  const vtext = (c, t, x, y, px, col) => { for (let i = 0; i < t.length; i++) text(c, t[i], x, y + i * px * 1.08, px, col); };

  /* 一条海船：船身、一根桅、一面席帆（落着或者张着） */
  function junk(c, x, y, s, o) {
    o = o || {}; c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(30,50,60,0.25)'; c.beginPath(); c.ellipse(0, 20, 150, 10, 0, 0, 6.3); c.fill();
    c.fillStyle = P.vgrad(c, 0, -40, 60, [[0, o.col || '#7a5a3a'], [1, '#3e2c1e']]); c.beginPath(); c.moveTo(-150, -34); c.quadraticCurveTo(-130, 16, -80, 20); c.lineTo(96, 20); c.quadraticCurveTo(150, 12, 170, -46); c.lineTo(110, -26); c.lineTo(-110, -26); c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.8; c.stroke();
    P.line(c, -100, -8, 120, -10, 2, 'rgba(230,214,170,0.4)');
    P.line(c, 10, -26, 10, -250, 6, '#4a3a2a');
    if (o.sail) { c.fillStyle = o.sailCol || '#b8a274'; c.beginPath(); c.moveTo(-58, -236); c.lineTo(84, -244); c.lineTo(96, -70); c.lineTo(-70, -60); c.closePath(); c.fill(); c.stroke(); for (let i = 1; i < 7; i++) P.line(c, -60 - i * 1.6, -236 + i * 25, 86 + i * 1.6, -244 + i * 25, 1.6, 'rgba(60,44,24,0.5)'); }
    else { c.fillStyle = '#a8946a'; c.beginPath(); c.ellipse(14, -64, 86, 12, -0.03, 0, 6.3); c.fill(); c.stroke(); for (let i = -3; i <= 3; i++) P.line(c, 14 + i * 22, -75, 14 + i * 22, -53, 1.2, 'rgba(60,44,24,0.5)'); }
    c.fillStyle = '#9a8660'; c.beginPath(); c.moveTo(-96, -26); c.quadraticCurveTo(-90, -62, -52, -64); c.lineTo(-20, -64); c.quadraticCurveTo(-8, -60, -6, -26); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
  /* 铺面：瓦顶、木板墙、一面招子 */
  function shop(c, x, w, o) {
    const y0 = 372, y1 = 640;
    c.fillStyle = o.wall || '#c9b592'; c.fillRect(x, y0, w, y1 - y0); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(x, y0, w, y1 - y0);
    c.fillStyle = '#3a2a20'; c.fillRect(x + 26, y0 + 60, w - 52, y1 - y0 - 60);                                               // 敞着的铺面
    c.fillStyle = P.vgrad(c, 0, y0 - 96, 110, [[0, '#4a4f54'], [1, '#2c3136']]); poly(c, [[x - 30, y0 + 14], [x + 20, y0 - 96], [x + w - 20, y0 - 96], [x + w + 30, y0 + 14]]); c.fill(); c.stroke();
    for (let i = 0; i <= 12; i++) { const u = i / 12; P.line(c, x + 20 + (w - 40) * u, y0 - 96, x - 30 + (w + 60) * u, y0 + 14, 1.2, 'rgba(10,12,14,0.5)'); }
    P.line(c, x + 14, y0 - 96, x + w - 14, y0 - 96, 7, '#23272b');
    [x + 26, x + w - 26].forEach(px => { c.fillStyle = '#5a3f2c'; c.fillRect(px - 8, y0 + 14, 16, y1 - y0 - 14); c.strokeRect(px - 8, y0 + 14, 16, y1 - y0 - 14); });
    c.fillStyle = '#6a4a32'; c.fillRect(x + 26, y1 - 62, w - 52, 62); c.strokeRect(x + 26, y1 - 62, w - 52, 62);                 // 柜台
    c.fillStyle = o.flag || '#8e2a20'; c.fillRect(x + w - 6, y0 + 20, 46, 150); c.strokeRect(x + w - 6, y0 + 20, 46, 150); vtext(c, o.sign, x + w + 17, y0 + 52, 30, '#f3e6c4');
  }

  /* ================= 定海渡口 ================= */
  S.dinghai = {
    name: '定海', sub: '渡口 · 四月', w: 2800, h: 1080, ambient: '#d9d2c4', music: 'shisheng', outside: '#1c2026',
    walk: [[100, 650, 2700, 900]],
    spawns: { start: { x: 220, y: 800, dir: 3 } },
    exits: [],
    lights: [{ x: 900, y: 300, r: 1900, c: '#fff0d0', a: 0.5, ey: 0.6 }, { x: 2200, y: 500, r: 1500, c: '#ffe9c6', a: 0.4, ey: 0.6 }],
    marks: [{ t: '船行', x: 760, y: 380 }, { t: '估衣铺', x: 1880, y: 250 }, { t: '香烛铺', x: 2380, y: 250 }],
    paint(c) {
      const r = JX.rng(1011);
      c.fillStyle = P.vgrad(c, 0, 0, 340, [[0, '#8fb0c8'], [0.7, '#d2dcd8'], [1, '#ece4cc']]); c.fillRect(0, 0, 2800, 340);
      [[400, 120, 420], [1200, 80, 520], [2000, 150, 460], [2600, 90, 300]].forEach(q => { c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(q[0], q[1], q[2], 22, 0, 0, 6.3); c.fill(); });
      P.hills(c, 0, 340, 2800, 90, { seed: 1012, layers: 2, col: '#6f8a8c', far: '#a9bcc4', mist: true, trees: false });      // 海上的岛
      c.fillStyle = P.vgrad(c, 0, 336, 240, [[0, '#a8c4c8'], [1, '#5f8e9a']]); c.fillRect(0, 336, 2800, 240);
      for (let i = 0; i < 110; i++) { const y = 344 + r() * 220, x = r() * 2800; P.line(c, x, y, x + 24 + r() * 90, y, 1.2, 'rgba(250,252,250,' + (0.14 + r() * 0.2) + ')'); }
      [[520, 370, 0.3], [980, 362, 0.24], [1500, 380, 0.34]].forEach(q => junk(c, q[0], q[1], q[2], { sail: true, sailCol: '#c9b88e' }));      // 远处的帆
      /* 泊在岸边的船 */
      junk(c, 300, 540, 0.9, { col: '#6e5238' }); junk(c, 1180, 546, 1.0, { sail: false, col: '#7a5a3a' }); junk(c, 1500, 536, 0.8, { col: '#5e4a38' });
      /* 石岸、系缆的桩、码头的地 */
      c.fillStyle = P.vgrad(c, 0, 560, 50, [[0, '#8a8f8c'], [1, '#5c615e']]); c.fillRect(0, 560, 2800, 50); for (let x = 0; x < 2800; x += 86) P.line(c, x + (r() * 20), 562, x + (r() * 20), 608, 1.2, 'rgba(30,34,32,0.5)'); P.line(c, 0, 584, 2800, 584, 1.2, 'rgba(30,34,32,0.4)');
      P.earth(c, 0, 606, 2800, 474, { seed: 1013, col: '#c0ad84' });
      P.tiles(c, 0, 606, 2800, 110, { seed: 1014, s: 70, col: '#a9a89c', bond: true });
      c.save(); poly(c, [[0, 760], [700, 744], [1500, 770], [2800, 750], [2800, 880], [1500, 896], [700, 872], [0, 884]]); c.clip(); P.cobbles(c, 0, 740, 2800, 160, { seed: 1015 }); c.restore();
      [[60, 980, 300, 70], [900, 1000, 260, 60], [1700, 990, 320, 70], [2500, 1000, 260, 60]].forEach((q, i) => P.patch(c, q[0] + q[2] / 2, q[1], q[2] / 2, q[3] / 2, 1016 + i, () => P.grass(c, q[0], q[1] - q[3] / 2, q[2], q[3], { seed: 1020 + i, dry: i % 2 })));
      [150, 520, 930, 1330, 2660].forEach(x => { P.ellipse(c, x, 610, 15, 6, '#3a3632', INK(), 1.4); c.fillStyle = '#5a554e'; c.fillRect(x - 10, 578, 20, 32); c.strokeStyle = INK(); c.lineWidth = 1.4; c.strokeRect(x - 10, 578, 20, 32); P.ellipse(c, x, 578, 12, 5, '#6e6a62', INK(), 1.2); });
      /* 船行：一间敞棚，一面旗 */
      c.fillStyle = '#5a3f2c'; [[640, 440], [880, 440]].forEach(q => { c.fillRect(q[0] - 7, q[1], 14, 200); });
      c.fillStyle = P.vgrad(c, 0, 380, 80, [[0, '#b8a274'], [1, '#8a7650']]); poly(c, [[600, 452], [650, 384], [870, 384], [920, 452]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 2; c.stroke(); for (let i = 0; i < 9; i++) P.line(c, 656 + i * 26, 386, 612 + i * 37, 450, 1, 'rgba(60,44,24,0.45)');
      c.fillStyle = '#6a4a32'; c.fillRect(660, 572, 200, 56); c.strokeRect(660, 572, 200, 56);
      P.line(c, 940, 330, 940, 640, 7, '#4a3a2a'); c.fillStyle = '#2e5a66'; c.fillRect(944, 336, 60, 190); c.strokeRect(944, 336, 60, 190); vtext(c, '普陀香船', 974, 362, 34, '#f3e6c4');
      /* 两间铺面 */
      shop(c, 1700, 380, { sign: '估衣', wall: '#cbb894' }); shop(c, 2200, 380, { sign: '香烛', wall: '#c4b08c', flag: '#a8843e' });
      const cl = ['#a8352c', '#4f6b8a', '#6e8a5a', '#c9a24a', '#7a5a86', '#d8c8b0', '#3f504c'];
      P.line(c, 1730, 444, 2050, 444, 2, '#3a2a1e'); for (let i = 0; i < 7; i++) { const x = 1752 + i * 44; c.fillStyle = cl[i]; poly(c, [[x - 16, 446], [x + 16, 446], [x + 22, 470], [x + 13, 474], [x + 15, 540], [x - 15, 540], [x - 13, 474], [x - 22, 470]]); c.fill(); c.strokeStyle = INK(0.7); c.lineWidth = 1.2; c.stroke(); }      // 挂着的旧衣裳
      for (let i = 0; i < 9; i++) { const x = 2250 + i * 34; c.fillStyle = i % 2 ? '#b8362a' : '#e3c98a'; c.fillRect(x - 5, 486 + (i % 3) * 6, 10, 86); P.line(c, x, 480 + (i % 3) * 6, x, 470, 1, '#3a2a1e'); }          // 一把一把的香烛
      P.paper(c, 2800, 1080, 101, 0.3);
    },
    props: [
      { x: 330, y: 668, bw: 250, bh: 110, block: [-100, -18, 200, 22], draw(g) { for (let i = 0; i < 3; i++) { const x = -80 + i * 70; g.fillStyle = '#8a7650'; g.beginPath(); g.ellipse(x, -22, 30, 22, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke(); for (let k = -2; k <= 2; k++) P.line(g, x - 28, -22 + k * 7, x + 28, -22 + k * 7, 1, 'rgba(40,28,12,0.4)'); P.ellipse(g, x, -40, 26, 7, '#c9d6d8', INK(), 1.2); } g.strokeStyle = 'rgba(60,70,60,0.8)'; g.lineWidth = 1.2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(40 + i * 8, -60); g.quadraticCurveTo(70 + i * 5, -30, 60 + i * 9, 0); g.stroke(); } } },      // 鱼篓、渔网
      { x: 1260, y: 668, bw: 260, bh: 170, block: [-110, -14, 220, 18], draw(g) { P.line(g, -110, 0, -110, -150, 6, '#5a4630'); P.line(g, 110, 0, 110, -150, 6, '#5a4630'); [-140, -100].forEach(y => P.line(g, -116, y, 116, y, 4, '#6a5238')); for (let k = 0; k < 2; k++) for (let i = 0; i < 8; i++) { const x = -96 + i * 27, y = -138 + k * 40; g.fillStyle = '#b9b4a2'; g.beginPath(); g.ellipse(x, y + 16, 6, 17, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(0.7); g.lineWidth = 1; g.stroke(); } } },      // 晒鱼的架子
      { x: 1560, y: 664, bw: 130, bh: 90, block: [-56, -16, 112, 20], draw(g) { P.jar(g, -28, 0, 0.8, { seed: 5, label: false }); P.jar(g, 26, 2, 0.9, { seed: 6, label: false }); } },
      { x: 2640, y: 668, bw: 160, bh: 190, block: [-16, -10, 32, 14], draw(g) { P.tree(g, 0, 0, 0.62, 'round', { seed: 71 }); } },
      { x: 120, y: 1064, bw: 200, bh: 120, draw(g) { P.bush(g, -30, 0, 1.0, { seed: 72 }); P.rock(g, 50, 0, 0.9, { seed: 73 }); } },
      { x: 2100, y: 1066, bw: 200, bh: 120, draw(g) { P.rock(g, -40, 0, 1.0, { seed: 74 }); P.bush(g, 40, 0, 0.9, { seed: 75, flower: '#f0e6b0' }); } },
    ],
    under(c, t) { for (let i = 0; i < 20; i++) { const y = 350 + (i * 41) % 200, x = (i * 331 + t * (6 + (i % 4) * 3)) % 2900 - 60; P.line(c, x, y, x + 40 + (i % 5) * 14, y, 1.2, 'rgba(250,252,250,0.2)'); } },
  };

  /* ================= 莲花洋：香船，晨雾 ================= */
  const J = S.jiang, BW = 2400, BH = 1080, HZ = 432;
  const fogBand = (c, t, y, a, v, seed) => { for (let i = 0; i < 6; i++) { const x = ((i * 520 + seed * 173 + t * v) % (BW + 900)) - 450; const g = c.createRadialGradient(x, y, 20, x, y, 420); g.addColorStop(0, 'rgba(236,240,238,' + a + ')'); g.addColorStop(1, 'rgba(236,240,238,0)'); c.fillStyle = g; c.fillRect(x - 430, y - 150, 860, 300); } };
  S.haichuan = Object.assign({}, J, {
    name: '莲花洋', sub: '海上 · 晨雾', ambient: '#c2c8c6', music: 'haiwu', outside: '#141a1e',
    lights: [{ x: 1200, y: 500, r: 2200, c: '#f2f0e6', a: 0.5, ey: 0.6 }],
    marks: [{ t: '船尾', x: 470, y: 520 }, { t: '船头', x: 1900, y: 520 }],
    hots: [],
    props: [{ x: 1200, y: 1010, bw: 2380, bh: 986, below: 20, sortY: -1e6, draw(g) { g.translate(-1200, -1010); JX.scenes7.drawBoat(g, { xiang: true }); } }, J.props[1], J.props[2]],
    paint(c) {
      const r = JX.rng(1031);
      c.fillStyle = P.vgrad(c, 0, 0, HZ, [[0, '#aab4b8'], [0.6, '#d6dad4'], [1, '#e6e4d8']]); c.fillRect(0, 0, BW, HZ);
      const sg = c.createRadialGradient(700, 300, 10, 700, 300, 420); sg.addColorStop(0, 'rgba(255,244,214,0.8)'); sg.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = sg; c.fillRect(200, 0, 1000, HZ);      // 雾里的日头，只是一团亮
      c.fillStyle = 'rgba(120,140,144,0.45)'; c.beginPath(); c.moveTo(1500, HZ); c.quadraticCurveTo(1640, 372, 1800, 360); c.quadraticCurveTo(1960, 372, 2140, HZ); c.closePath(); c.fill();                  // 极远的一座岛
      c.fillStyle = P.vgrad(c, 0, HZ, BH - HZ, [[0, '#b9c6c6'], [0.3, '#8fa6aa'], [1, '#5d7c84']]); c.fillRect(0, HZ, BW, BH - HZ);
      for (let i = 0; i < 240; i++) { const x = r() * BW, y = HZ + 6 + r() * (BH - HZ - 10); c.strokeStyle = 'rgba(240,246,244,' + (0.05 + r() * 0.1) + ')'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 90, y); c.stroke(); }
      c.fillStyle = 'rgba(226,230,226,0.55)'; c.fillRect(0, HZ - 40, BW, 90);
      P.paper(c, BW, BH, 75, 0.3);
    },
    under(c, t) {
      c.save(); c.beginPath(); c.rect(0, 0, BW, BH); c.clip(); c.lineCap = 'round';
      for (let i = 0; i < 40; i++) { const y = HZ + 24 + ((i * 137.3) % (BH - HZ - 30)), k = (y - HZ) / (BH - HZ), x = BW - ((i * 331.7 + t * 22 * (0.5 + k * 1.6)) % (BW + 200)); c.strokeStyle = 'rgba(240,246,244,' + (0.2 * (0.5 + 0.5 * Math.sin(t * 0.8 + i))) + ')'; c.lineWidth = 1.4 + k; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + (i % 5) * 16, y); c.stroke(); }
      fogBand(c, t, 470, 0.5, 9, 1); fogBand(c, t, 560, 0.3, 14, 2);
      c.restore();
    },
    anim() {},
    top(c, t) { c.save(); c.beginPath(); c.rect(0, 0, BW, BH); c.clip(); fogBand(c, t, 640, 0.16, 20, 3); fogBand(c, t, 900, 0.2, 26, 4); c.restore(); },
  });

  /* ================= 潮音庵 · 山门 ================= */
  S.shanmen = {
    name: '潮音庵', sub: '普陀 · 山门', w: 2400, h: 1080, ambient: '#d2d4c6', music: 'chaoyin', outside: '#161a16',
    walk: [[100, 650, 2300, 900], [1700, 556, 1860, 672]],
    spawns: { start: { x: 200, y: 800, dir: 3 }, gate: { x: 1780, y: 690, dir: 0 } },
    exits: [{ id: 'gate', x: 1716, y: 560, w: 128, h: 40, label: '山门', lx: 1780, ly: 500, back: [0, 40] }],
    lights: [{ x: 700, y: 300, r: 1800, c: '#f6f2dc', a: 0.5, ey: 0.6 }, { x: 1900, y: 500, r: 1300, c: '#fff0cc', a: 0.36, ey: 0.6 }],
    marks: [{ t: '山门', x: 1780, y: 300 }, { t: '放生池', x: 760, y: 560 }],
    paint(c) {
      const r = JX.rng(1041);
      c.fillStyle = P.vgrad(c, 0, 0, 480, [[0, '#9fbccc'], [0.75, '#e2e6d8'], [1, '#e2e6d8']]); c.fillRect(0, 0, 2400, 480);
      c.fillStyle = P.vgrad(c, 0, 250, 230, [[0, '#b4cccc'], [1, '#86aab0']]); c.fillRect(0, 250, 2400, 230);                 // 山后头是海：从山坳里露出来（原来只画了左边一块，右边齐刷刷断掉，山低的地方还露出一条没画的底）
      c.fillStyle = P.vgrad(c, 0, 238, 26, [[0, 'rgba(226,230,216,0)'], [0.5, 'rgba(226,230,216,0.6)'], [1, 'rgba(226,230,216,0)']]); c.fillRect(0, 238, 2400, 26);      // 水天相接处一道薄雾
      for (let i = 0; i < 16; i++) { const y = 262 + r() * 96, x = r() * 640; P.line(c, x, y, x + 30 + r() * 60, y, 1.2, 'rgba(250,252,250,0.3)'); }
      { const r2 = JX.rng(1044); for (let i = 0; i < 40; i++) { const y = 262 + r2() * 110, x = 640 + r2() * 1700; P.line(c, x, y, x + 30 + r2() * 60, y, 1.2, 'rgba(250,252,250,0.3)'); } }
      P.hills(c, 0, 470, 2400, 330, { seed: 1042, layers: 3, col: '#4f7450', far: '#9db8a4', mist: true, trees: true });     // 一层一层的山，长满了树
      P.grass(c, 0, 440, 2400, 640, { seed: 1043, flowers: true, bare: 5 });
      /* 竹林（左）、松（右后） */
      for (let i = 0; i < 9; i++) P.bamboo(c, 60 + i * 62 + r() * 20, 600 + (i % 3) * 14, 230 + r() * 90, 5, { seed: 1050 + i });
      [[1240, 590, 1.1], [2240, 600, 1.2]].forEach((q, i) => P.tree(c, q[0], q[1], q[2], 'pine', { seed: 1060 + i }));
      /* 杏黄的庵墙，墙头青瓦；当中是山门 */
      const wy = 330, wb = 600;
      c.fillStyle = P.vgrad(c, 0, wy, wb - wy, [[0, '#d8b45e'], [1, '#c29a46']]); c.fillRect(1380, wy, 860, wb - wy); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(1380, wy, 860, wb - wy);
      for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(110,80,30,' + (0.05 + r() * 0.08) + ')'; c.fillRect(1380 + r() * 840, wy + r() * (wb - wy - 20), 20 + r() * 60, 6 + r() * 20); }
      c.fillStyle = '#3a4046'; poly(c, [[1366, wy + 6], [1380, wy - 22], [2240, wy - 22], [2254, wy + 6]]); c.fill(); c.stroke(); for (let x = 1390; x < 2240; x += 22) P.line(c, x, wy - 20, x - 4, wy + 4, 1.2, 'rgba(10,12,14,0.5)');
      c.fillStyle = '#c9b592'; c.fillRect(1380, wb - 34, 860, 34); c.strokeRect(1380, wb - 34, 860, 34);                         // 墙脚
      /* 门楼 */
      c.fillStyle = '#b8935a'; c.fillRect(1650, 250, 260, 350); c.strokeRect(1650, 250, 260, 350);
      c.fillStyle = P.vgrad(c, 0, 170, 100, [[0, '#4a5056'], [1, '#2c3136']]); poly(c, [[1596, 262], [1660, 172], [1900, 172], [1964, 262]]); c.fill(); c.stroke(); for (let i = 0; i <= 12; i++) { const u = i / 12; P.line(c, 1660 + 240 * u, 172, 1596 + 368 * u, 262, 1.2, 'rgba(10,12,14,0.5)'); }
      P.line(c, 1652, 172, 1908, 172, 8, '#23272b'); [[1596, 262, -1], [1964, 262, 1]].forEach(q => { c.strokeStyle = '#23272b'; c.lineWidth = 5; c.beginPath(); c.moveTo(q[0], q[1]); c.quadraticCurveTo(q[0] + q[2] * 22, q[1] - 2, q[0] + q[2] * 34, q[1] - 22); c.stroke(); });
      c.fillStyle = '#23201c'; c.fillRect(1700, 330, 160, 270);                                                                // 门洞
      [[1700, 1], [1860, -1]].forEach(q => { c.fillStyle = '#7a2a22'; poly(c, [[q[0], 330], [q[0] + q[1] * 46, 344], [q[0] + q[1] * 46, 600], [q[0], 600]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.6; c.stroke(); for (let k = 0; k < 4; k++) P.ellipse(c, q[0] + q[1] * 24, 380 + k * 56, 4, 4, '#c9a24a'); });      // 两扇半开的门
      c.fillStyle = '#2e3a34'; c.fillRect(1716, 272, 128, 46); c.strokeStyle = '#c9a24a'; c.lineWidth = 2.4; c.strokeRect(1716, 272, 128, 46); text(c, '潮音庵', 1780, 296, 30, '#e9d8a0');
      /* 石阶 */
      for (let k = 0; k < 5; k++) { const y = 600 + k * 14, w = 180 + k * 16; c.fillStyle = k % 2 ? '#aaa89c' : '#b8b6aa'; c.fillRect(1780 - w / 2, y, w, 14); c.strokeStyle = INK(0.7); c.lineWidth = 1.2; c.strokeRect(1780 - w / 2, y, w, 14); }
      /* 石板路：从左下弯到石阶前 */
      const road = [[0, 760], [600, 772], [1200, 740], [1640, 690], [1920, 690], [1960, 760], [1400, 830], [600, 868], [0, 860]];
      c.save(); poly(c, road); c.clip(); P.tiles(c, 0, 660, 2400, 240, { seed: 1044, s: 64, col: '#b4b2a4', bond: true }); c.restore(); c.strokeStyle = 'rgba(50,48,40,0.3)'; c.lineWidth = 4; poly(c, road); c.stroke();
      /* 放生池、假山、花 */
      P.pond(c, 760, 590, 190, 44, { fish: 4, lily: 6 });
      P.rockery(c, 1040, 630, 1.0, { seed: 1045 }); P.rockery(c, 470, 640, 0.7, { seed: 1046 });
      P.flowerbed(c, 1420, 640, 190, 40, { seed: 1047 }); P.flowerbed(c, 2010, 640, 190, 40, { seed: 1048 });
      P.paper(c, 2400, 1080, 102, 0.3);
    },
    props: [
      { x: 1560, y: 690, bw: 110, bh: 150, block: [-34, -14, 68, 18], draw(g) { P.shadow(g, 0, 0, 40, 9, 0.35); g.fillStyle = '#5c625c'; g.fillRect(-8, -40, 16, 40); P.ellipse(g, 0, 0, 30, 8, '#6e746e', INK(), 1.4); g.fillStyle = P.hgrad(g, -34, 0, 68, [[0, '#4a524c'], [0.5, '#7a827a'], [1, '#444a46']]); g.beginPath(); g.moveTo(-32, -84); g.quadraticCurveTo(-38, -52, -18, -40); g.lineTo(18, -40); g.quadraticCurveTo(38, -52, 32, -84); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke(); P.ellipse(g, 0, -84, 32, 7, '#2e3430', INK(), 1.3); for (let i = -1; i <= 1; i++) P.line(g, i * 10, -86, i * 12, -112, 2, '#b8362a'); } },      // 香炉
      { x: 2100, y: 676, bw: 90, bh: 150, block: [-22, -12, 44, 16], draw(g) { P.shadow(g, 0, 0, 26, 7, 0.35); g.fillStyle = '#9a9a8e'; g.fillRect(-9, -70, 18, 70); g.strokeStyle = INK(); g.lineWidth = 1.4; g.strokeRect(-9, -70, 18, 70); g.fillStyle = '#b4b4a6'; g.fillRect(-20, -108, 40, 38); g.strokeRect(-20, -108, 40, 38); g.fillStyle = '#3a342c'; g.fillRect(-9, -98, 18, 20); poly(g, [[-28, -108], [0, -132], [28, -108]]); g.fillStyle = '#8a8a7e'; g.fill(); g.stroke(); } },      // 石灯
      { x: 300, y: 1064, bw: 240, bh: 240, draw(g) { P.bamboo(g, -40, 0, 220, 5, { seed: 81 }); P.bamboo(g, 30, 0, 180, 4, { seed: 82 }); } },
      { x: 1200, y: 1066, bw: 220, bh: 110, draw(g) { P.rock(g, -40, 0, 1.1, { seed: 83 }); P.bush(g, 44, 0, 1.0, { seed: 84, flower: '#f2c8d0' }); } },
      { x: 2260, y: 1064, bw: 200, bh: 110, draw(g) { P.bush(g, 0, 0, 1.1, { seed: 85 }); } },
    ],
  };

  /* ================= 庵内 ================= */
  S.annei = {
    name: '潮音庵', sub: '庵内', w: 1920, h: 1080, ambient: '#a59c90', music: 'chaoyin', outside: '#120f0c',
    walk: [[150, 660, 1770, 920]],
    spawns: { door: { x: 240, y: 820, dir: 3 } },
    exits: [{ id: 'out', x: 150, y: 700, w: 44, h: 180, label: '出庵', lx: 230, ly: 640, back: [40, 0] }],
    lights: [{ x: 960, y: 420, r: 760, c: '#ffe0a8', a: 0.6, ey: 0.7, glow: 30, gx: 960, gy: 430, gc: '#ffc478', ga: 0.5 }, { x: 1560, y: 400, r: 700, c: '#dfe9f0', a: 0.5, ey: 0.8 }, { x: 400, y: 700, r: 600, c: '#f0e6d0', a: 0.3, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(1051);
      c.fillStyle = P.vgrad(c, 0, 0, 640, [[0, '#8a7c66'], [1, '#b0a288']]); c.fillRect(0, 0, 1920, 640);
      for (let x = 0; x < 1920; x += 240) { c.fillStyle = '#4a3626'; c.fillRect(x - 10, 0, 20, 640); }                             // 柱
      c.fillStyle = '#3e2c1e'; c.fillRect(0, 0, 1920, 56); c.fillStyle = '#5a4230'; c.fillRect(0, 600, 1920, 44);
      /* 月洞窗：外头是竹子和海 */
      c.save(); c.beginPath(); c.arc(1560, 330, 150, 0, 6.3); c.clip(); c.fillStyle = P.vgrad(c, 0, 180, 300, [[0, '#a9c4d0'], [0.6, '#cfdcd8'], [1, '#7fa6ae']]); c.fillRect(1400, 170, 320, 320); for (let i = 0; i < 9; i++) P.line(c, 1410 + r() * 300, 400 + r() * 70, 1450 + r() * 300, 400 + r() * 70, 1.2, 'rgba(250,252,250,0.4)'); for (let i = 0; i < 4; i++) P.bamboo(c, 1440 + i * 30, 500, 300, 3, { seed: 1052 + i }); c.restore();
      c.strokeStyle = '#3e2c1e'; c.lineWidth = 16; c.beginPath(); c.arc(1560, 330, 150, 0, 6.3); c.stroke(); c.strokeStyle = INK(); c.lineWidth = 2; c.beginPath(); c.arc(1560, 330, 158, 0, 6.3); c.stroke();
      /* 龛：一尊白瓷的像，只画个影子；供桌、香炉、两支烛 */
      c.fillStyle = '#2e2218'; c.fillRect(800, 130, 320, 380); c.strokeStyle = '#c9a24a'; c.lineWidth = 3; c.strokeRect(800, 130, 320, 380);
      const hg = c.createRadialGradient(960, 300, 10, 960, 300, 170); hg.addColorStop(0, 'rgba(255,224,160,0.5)'); hg.addColorStop(1, 'rgba(255,224,160,0)'); c.fillStyle = hg; c.fillRect(800, 130, 320, 380);
      c.fillStyle = '#eee8dc'; c.beginPath(); c.moveTo(960, 196); c.bezierCurveTo(996, 200, 1000, 250, 984, 270); c.bezierCurveTo(1040, 300, 1050, 420, 1044, 500); c.lineTo(876, 500); c.bezierCurveTo(870, 420, 880, 300, 936, 270); c.bezierCurveTo(920, 250, 924, 200, 960, 196); c.closePath(); c.fill(); c.strokeStyle = 'rgba(120,110,96,0.6)'; c.lineWidth = 1.5; c.stroke();
      c.strokeStyle = 'rgba(160,150,130,0.6)'; c.lineWidth = 1.2; [[940, 300, 900, 480], [980, 300, 1020, 480], [960, 290, 960, 480]].forEach(q => { c.beginPath(); c.moveTo(q[0], q[1]); c.quadraticCurveTo((q[0] + q[2]) / 2 + 8, (q[1] + q[3]) / 2, q[2], q[3]); c.stroke(); });
      [[-1, '#7a2a22'], [1, '#7a2a22']].forEach(q => { c.fillStyle = q[1]; c.fillRect(960 + q[0] * 190 - 22, 120, 44, 400); c.strokeStyle = INK(); c.lineWidth = 1.5; c.strokeRect(960 + q[0] * 190 - 22, 120, 44, 400); });
      vtext(c, '潮音不住', 770, 180, 34, '#e9d8a0'); vtext(c, '明月长圆', 1150, 180, 34, '#e9d8a0');
      c.fillStyle = '#5a3a26'; c.fillRect(780, 520, 360, 90); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(780, 520, 360, 90); c.fillStyle = '#8e2a20'; c.fillRect(790, 528, 340, 26);
      P.ellipse(c, 960, 514, 34, 10, '#6a5a3a', INK(), 1.4); c.fillStyle = '#8a7648'; c.fillRect(934, 486, 52, 28); c.strokeRect(934, 486, 52, 28); for (let i = -1; i <= 1; i++) P.line(c, 960 + i * 8, 486, 960 + i * 10, 452, 1.6, '#7a5a3a');
      [860, 1060].forEach(x => { c.fillStyle = '#b8362a'; c.fillRect(x - 5, 470, 10, 46); P.ellipse(c, x, 518, 12, 4, '#c9a24a', INK(), 1); });
      /* 经架、木鱼 */
      c.fillStyle = '#4a3626'; c.fillRect(300, 250, 300, 300); c.strokeRect(300, 250, 300, 300); for (let k = 0; k < 4; k++) { c.fillStyle = '#2e2218'; c.fillRect(312, 262 + k * 72, 276, 60); for (let i = 0; i < 12; i++) { c.fillStyle = ['#c9b592', '#a9b4a0', '#b8a274'][i % 3]; c.fillRect(318 + i * 22, 270 + k * 72 + (i % 2) * 4, 18, 50 - (i % 2) * 4); } }
      /* 地：木板，当中一领大席，三只蒲团的位置 */
      P.planks(c, 0, 640, 1920, 440, { seed: 1053 });
      P.mat(c, 520, 690, 880, 230, { seed: 1054 });
      P.paper(c, 1920, 1080, 103, 0.3);
    },
    props: [
      { x: 700, y: 800, bw: 110, bh: 40, draw(g) { P.ellipse(g, 0, -10, 46, 16, '#8a7248', INK(), 1.5); P.ellipse(g, 0, -14, 40, 12, '#a88c58'); } },        // 给客人的蒲团
      { x: 960, y: 790, sortY: 750, bw: 132, bh: 46, draw(g) { P.ellipse(g, 0, -10, 58, 18, '#7a6440', INK(), 1.5); P.ellipse(g, 0, -15, 51, 14, '#9a8050'); } },      // 老尼坐的那一只（旁白说“蒲团上坐着一位老尼”，原来她身子底下什么也没有）
      { x: 1240, y: 700, bw: 90, bh: 70, block: [-34, -12, 68, 16], draw(g) { P.shadow(g, 0, 0, 30, 7, 0.35); g.fillStyle = '#7a4a2a'; g.beginPath(); g.ellipse(0, -24, 30, 24, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke(); P.line(g, -18, -20, 18, -20, 2, '#2e1e14'); P.line(g, 26, -44, 46, -64, 3, '#5a3a22'); } },      // 木鱼
      { x: 250, y: 664, bw: 100, bh: 150, block: [-26, -12, 52, 16], draw(g) { P.potted(g, 0, 0, 1.4, 'orchid', { seed: 91, stand: 36 }); } },
      { x: 1700, y: 664, bw: 100, bh: 150, block: [-26, -12, 52, 16], draw(g) { P.potted(g, 0, 0, 1.4, 'pine', { seed: 92, stand: 36 }); } },
    ],
    anim(c, t) { for (let i = 0; i < 3; i++) for (let k = 0; k < 6; k++) { const u = (t * 0.12 + k / 6 + i * 0.13) % 1; c.fillStyle = 'rgba(236,232,224,' + (0.16 * (1 - u)) + ')'; c.beginPath(); c.ellipse(960 + (i - 1) * 9 + Math.sin(u * 6 + i) * 12 * u, 452 - u * 150, 5 + u * 12, 5 + u * 9, 0, 0, 6.3); c.fill(); } },      // 香烟
  };
})();
