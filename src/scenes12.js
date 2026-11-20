/* 第三章九至十二场的场景：庵内·夜（anneiye，借庵内）、普陀海边·夜（haibian）、归途的船（guichuan，借香船，雾散了）、半闲堂（banxian）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, S = JX.scenes;
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };

  /* ---------- 庵内·夜：两支烛，窗外一弯月 ---------- */
  S.anneiye = Object.assign({}, S.annei, {
    sub: '庵内 · 夜', ambient: '#a2968a', music: 'shuangjiang', spawns: { door: { x: 240, y: 820, dir: 3 }, start: { x: 240, y: 820, dir: 3 } },
    lights: [{ x: 960, y: 430, r: 860, c: '#ffd9a0', a: 0.8, ey: 0.7, glow: 34, gx: 960, gy: 430, gc: '#ffc478', ga: 0.6 }, { x: 600, y: 700, r: 560, c: '#ffd9a0', a: 0.6, ey: 0.6, glow: 26, gx: 566, gy: 606, gc: '#ffc478', ga: 0.6 }, { x: 1560, y: 360, r: 560, c: '#b9cdea', a: 0.45, ey: 0.8 }],
    paint(c) {
      S.annei.paint(c);
      c.save(); c.beginPath(); c.arc(1560, 330, 142, 0, 6.3); c.clip();
      c.fillStyle = P.vgrad(c, 0, 180, 300, [[0, '#2c3c60'], [0.7, '#40567a'], [1, '#2e4660']]); c.fillRect(1400, 170, 320, 320);
      P.ellipse(c, 1612, 262, 30, 30, '#f6f0d8'); P.ellipse(c, 1626, 254, 28, 28, '#30426a');
      for (let i = 0; i < 5; i++) { const x = 1430 + i * 26; P.line(c, x, 480, x + 10, 250 + i * 14, 5, 'rgba(18,30,34,0.9)'); for (let k = 0; k < 4; k++) P.line(c, x + 6, 300 + k * 40 + i * 9, x + 40, 286 + k * 40 + i * 9, 3, 'rgba(18,30,34,0.85)'); }
      for (let i = 0; i < 7; i++) P.line(c, 1540 + i * 22, 440 + (i % 3) * 8, 1580 + i * 22, 440 + (i % 3) * 8, 1.4, 'rgba(240,244,230,0.5)');
      c.restore();
      c.strokeStyle = '#3e2c1e'; c.lineWidth = 16; c.beginPath(); c.arc(1560, 330, 150, 0, 6.3); c.stroke();
    },
    props: (S.annei.props || []).concat([{ x: 566, y: 672, bw: 50, bh: 90, block: [-16, -10, 32, 14], draw(g) { P.shadow(g, 0, 0, 20, 5, 0.4); g.fillStyle = '#5a3d28'; g.fillRect(-4, -52, 8, 52); g.fillRect(-14, -4, 28, 5); g.fillRect(-12, -56, 24, 5); g.strokeStyle = INK(); g.lineWidth = 1; g.strokeRect(-12, -56, 24, 5); P.candle(g, 0, -56); } }]),
  });

  /* ---------- 普陀海边·夜：月亮地里 ---------- */
  const SEA = 430, SHORE = 640;
  S.haibian = {
    name: '普陀', sub: '海边 · 夜', w: 1920, h: 1080, ambient: '#aab6cc', music: 'lanshan', outside: '#0a0e16',
    walk: [[150, 700, 1770, 920]],
    spawns: { start: { x: 260, y: 820, dir: 3 } },
    exits: [{ id: 'back', x: 150, y: 720, w: 44, h: 180, label: '回庵', lx: 240, ly: 660, back: [40, 0] }],
    lights: [{ x: 1180, y: 330, r: 1500, c: '#e8f0ff', a: 0.6, ey: 0.6, glow: 60, gx: 1180, gy: 190, gc: '#f6f6e6', ga: 0.5 }, { x: 330, y: 660, r: 420, c: '#ffd9a0', a: 0.5, ey: 0.6, glow: 20, gx: 330, gy: 596, gc: '#ffc478', ga: 0.6 }],
    marks: [{ t: '回庵的路', x: 200, y: 600 }, { t: '水边', x: 1180, y: 640 }],
    paint(c) {
      const r = JX.rng(1201);
      c.fillStyle = P.vgrad(c, 0, 0, SEA, [[0, '#2c3c64'], [0.6, '#4a6088'], [1, '#8296b4']]); c.fillRect(0, 0, 1920, SEA);
      for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(244,246,255,' + (0.3 + r() * 0.6) + ')'; const s = r() < 0.12 ? 2.6 : 1.5; c.fillRect(r() * 1920, r() * 330, s, s); }
      const mg = c.createRadialGradient(1180, 190, 30, 1180, 190, 340); mg.addColorStop(0, 'rgba(250,248,226,0.6)'); mg.addColorStop(1, 'rgba(250,248,226,0)'); c.fillStyle = mg; c.fillRect(800, 0, 760, 430);
      P.ellipse(c, 1180, 190, 56, 56, '#fbf7e2'); P.ellipse(c, 1164, 178, 12, 9, 'rgba(210,206,180,0.5)'); P.ellipse(c, 1198, 204, 8, 6, 'rgba(210,206,180,0.4)');
      for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(210,220,240,' + (0.1 + r() * 0.1) + ')'; c.beginPath(); c.ellipse(200 + r() * 1500, 90 + r() * 200, 160 + r() * 200, 16 + r() * 16, 0, 0, 6.3); c.fill(); }
      c.fillStyle = 'rgba(40,56,84,0.9)'; poly(c, [[0, SEA], [0, 372], [120, 350], [260, 380], [420, 404], [520, SEA]]); c.fill();                      // 左边的山影
      c.fillStyle = 'rgba(52,70,100,0.8)'; poly(c, [[1500, SEA], [1600, 400], [1720, 386], [1830, 404], [1920, 396], [1920, SEA]]); c.fill();           // 远处的岛
      c.fillStyle = P.vgrad(c, 0, SEA, SHORE - SEA, [[0, '#5a7498'], [0.5, '#3e5a80'], [1, '#34506e']]); c.fillRect(0, SEA, 1920, SHORE - SEA);
      for (let i = 0; i < 70; i++) { const k = r(), y = SEA + 6 + k * (SHORE - SEA - 12), w = 30 + k * 190, x = 1180 - w / 2 + (r() - 0.5) * (60 + k * 260); P.line(c, x, y, x + w, y, 2 + k * 2.4, 'rgba(250,246,220,' + (0.2 + r() * 0.4) + ')'); }      // 月亮在水上的一条路
      for (let i = 0; i < 120; i++) { const x = r() * 1920, y = SEA + 8 + r() * (SHORE - SEA - 14); P.line(c, x, y, x + 20 + r() * 70, y, 1.2, 'rgba(220,232,250,' + (0.08 + r() * 0.14) + ')'); }
      /* 沙滩：湿的一条、干的一片 */
      c.fillStyle = P.vgrad(c, 0, SHORE - 14, 80, [[0, '#7c8ea0'], [1, '#a8aaa0']]); poly(c, [[0, SHORE - 6], [500, SHORE + 8], [1000, SHORE - 8], [1500, SHORE + 6], [1920, SHORE - 4], [1920, SHORE + 70], [0, SHORE + 70]]); c.fill();
      c.fillStyle = P.vgrad(c, 0, SHORE + 50, 400, [[0, '#b8b4a0'], [1, '#9a9684']]); c.fillRect(0, SHORE + 56, 1920, 1080 - SHORE - 56);
      for (let i = 0; i < 520; i++) { const x = r() * 1920, y = SHORE + 30 + r() * 420; c.fillStyle = r() < 0.5 ? 'rgba(60,64,70,0.12)' : 'rgba(244,244,230,0.14)'; c.beginPath(); c.ellipse(x, y, 6 + r() * 30, 2 + r() * 6, 0, 0, 6.3); c.fill(); }
      for (let i = 0; i < 46; i++) { const x = r() * 1920, y = SHORE + 50 + r() * 400; P.ellipse(c, x, y, 4 + r() * 6, 3 + r() * 4, P.mix('#8e929a', '#dcdccc', r()), 'rgba(0,0,0,0.35)', 0.8); }
      for (let i = 0; i < 14; i++) { const x = r() * 1920, y = SHORE + 60 + r() * 380; c.strokeStyle = 'rgba(250,240,226,0.8)'; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 5, 3.3, 6.1); c.stroke(); }      // 贝壳
      /* 左边回庵的石阶和一盏石灯 */
      c.fillStyle = '#8a8e90'; for (let i = 0; i < 5; i++) { c.fillRect(40 + i * 14, 640 + i * 18, 190 - i * 10, 18); c.strokeStyle = INK(0.6); c.lineWidth = 1.2; c.strokeRect(40 + i * 14, 640 + i * 18, 190 - i * 10, 18); }
      P.paper(c, 1920, 1080, 121, 0.26);
    },
    props: [
      { x: 330, y: 676, bw: 70, bh: 130, block: [-22, -12, 44, 16], draw(g) { P.shadow(g, 0, 0, 26, 6, 0.4); g.fillStyle = '#9a9ea0'; g.fillRect(-7, -70, 14, 70); g.fillRect(-20, -6, 40, 8); g.fillRect(-22, -104, 44, 34); g.strokeStyle = INK(); g.lineWidth = 1.2; g.strokeRect(-22, -104, 44, 34); g.fillStyle = '#ffd9a0'; g.fillRect(-12, -96, 24, 20); g.fillStyle = '#7e8284'; poly(g, [[-30, -104], [0, -126], [30, -104]]); g.fill(); g.stroke(); } },
      { x: 700, y: 668, bw: 170, bh: 100, block: [-60, -14, 120, 20], draw(g) { P.rock(g, -26, 0, 1.3, { seed: 131, col: '#6e7884' }); P.rock(g, 40, 2, 0.9, { seed: 132, col: '#5e6874' }); } },
      { x: 1620, y: 672, bw: 150, bh: 100, block: [-50, -14, 100, 20], draw(g) { P.rock(g, 0, 0, 1.2, { seed: 133, col: '#66707c' }); } },
      { x: 1500, y: 1070, bw: 240, bh: 130, draw(g) { P.rock(g, -40, 0, 1.3, { seed: 134, col: '#4a5460' }); P.reeds(g, 20, 0, 150, 110, { seed: 135 }); } },
      { x: 260, y: 1074, bw: 240, bh: 120, draw(g) { P.reeds(g, -100, 0, 200, 100, { seed: 136 }); } },
    ],
    under(c, t) {                                                   // 一道一道漫上来的浪
      for (let i = 0; i < 3; i++) { const u = (t * 0.16 + i / 3) % 1, y = SHORE - 30 + u * 62, a = Math.sin(u * Math.PI); c.strokeStyle = 'rgba(244,248,255,' + (0.6 * a) + ')'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= 1920; x += 60) { const yy = y + Math.sin(x * 0.011 + i * 2 + t * 0.5) * 7; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
    },
  };

  /* ---------- 归途的船：借香船，雾散了，顺风 ---------- */
  const BW = 2400, BH = 1080, HZ = 432;
  S.guichuan = Object.assign({}, S.haichuan, {
    name: '归途', sub: '海上 · 顺风', ambient: '#d2d8d6', music: 'xingchuan',
    lights: [{ x: 1200, y: 400, r: 2400, c: '#fff6dc', a: 0.6, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(1231);
      c.fillStyle = P.vgrad(c, 0, 0, HZ, [[0, '#8fb4d2'], [0.7, '#cfe0e6'], [1, '#eef0e2']]); c.fillRect(0, 0, BW, HZ);
      for (let i = 0; i < 7; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.4 + r() * 0.3) + ')'; const x = r() * BW, y = 70 + r() * 220; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + k * 46 - 60, y + (k % 2) * 10, 60 + r() * 40, 20 + r() * 12, 0, 0, 6.3); c.fill(); } }
      c.fillStyle = 'rgba(92,128,140,0.7)'; c.beginPath(); c.moveTo(300, HZ); c.quadraticCurveTo(460, 360, 620, 352); c.quadraticCurveTo(800, 366, 960, HZ); c.closePath(); c.fill();          // 身后的普陀
      c.fillStyle = 'rgba(120,150,160,0.5)'; c.beginPath(); c.moveTo(1700, HZ); c.quadraticCurveTo(1800, 396, 1900, 392); c.quadraticCurveTo(2010, 400, 2100, HZ); c.closePath(); c.fill();
      c.fillStyle = P.vgrad(c, 0, HZ, BH - HZ, [[0, '#9cc0cc'], [0.3, '#6a9cb0'], [1, '#447890']]); c.fillRect(0, HZ, BW, BH - HZ);
      for (let i = 0; i < 260; i++) { const x = r() * BW, y = HZ + 6 + r() * (BH - HZ - 10); c.strokeStyle = 'rgba(250,252,250,' + (0.08 + r() * 0.16) + ')'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 90, y); c.stroke(); }
      for (let i = 0; i < 4; i++) { const x = 1000 + r() * 1200, y = HZ - 8 - r() * 10; c.fillStyle = 'rgba(250,246,230,0.9)'; poly(c, [[x, y], [x + 10, y - 22], [x + 12, y]]); c.fill(); P.line(c, x - 8, y, x + 18, y, 2, 'rgba(60,50,40,0.7)'); }      // 远帆
      P.paper(c, BW, BH, 123, 0.28);
    },
    under(c, t) {
      c.save(); c.beginPath(); c.rect(0, 0, BW, BH); c.clip(); c.lineCap = 'round';
      for (let i = 0; i < 46; i++) { const y = HZ + 24 + ((i * 137.3) % (BH - HZ - 30)), k = (y - HZ) / (BH - HZ), x = BW - ((i * 331.7 + t * 40 * (0.5 + k * 1.6)) % (BW + 200)); c.strokeStyle = 'rgba(250,252,250,' + (0.26 * (0.5 + 0.5 * Math.sin(t * 0.8 + i))) + ')'; c.lineWidth = 1.4 + k * 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + k * 80, y); c.stroke(); }
      c.restore();
    },
    top() {},
  });

  /* ---------- 半闲堂：葛岭，贺元度的书房 ---------- */
  S.banxian = {
    name: '半闲堂', sub: '葛岭 · 书房', w: 1920, h: 1080, ambient: '#b4a48e', music: 'anliu', outside: '#120f0c',
    walk: [[150, 700, 1770, 920]],
    spawns: { start: { x: 300, y: 860, dir: 3 } },
    exits: [],
    lights: [{ x: 960, y: 520, r: 900, c: '#ffe0a8', a: 0.7, ey: 0.7, glow: 30, gx: 1090, gy: 560, gc: '#ffc478', ga: 0.6 }, { x: 1560, y: 380, r: 700, c: '#e6eef0', a: 0.5, ey: 0.8 }, { x: 380, y: 520, r: 600, c: '#f0e2c4', a: 0.3, ey: 0.7 }],
    paint(c) {
      const r = JX.rng(1241);
      P.plaster(c, 0, 0, 1920, 640, { col: '#cdbf9e', seed: 124 });
      c.fillStyle = '#5a3d28'; c.fillRect(0, 0, 1920, 46); c.fillRect(0, 610, 1920, 30); [60, 720, 1250, 1860].forEach(x => P.post(c, x, 40, 34, 600, '#4b3324'));
      /* 右边一排槅扇窗：外头是西湖 */
      c.save(); c.beginPath(); c.rect(1300, 150, 520, 380); c.clip(); c.fillStyle = P.vgrad(c, 0, 150, 380, [[0, '#c4d6dc'], [0.5, '#dfe6da'], [0.56, '#9fbcc0'], [1, '#7fa2aa']]); c.fillRect(1300, 150, 520, 380);
      c.fillStyle = 'rgba(96,128,124,0.7)'; poly(c, [[1300, 362], [1420, 318], [1560, 340], [1700, 310], [1820, 350], [1820, 364], [1300, 364]]); c.fill(); P.line(c, 1690, 310, 1690, 280, 3, 'rgba(70,90,90,0.8)');
      for (let i = 0; i < 14; i++) P.line(c, 1310 + r() * 480, 380 + r() * 130, 1350 + r() * 480, 380 + r() * 130, 1.2, 'rgba(250,252,250,0.4)'); c.restore();
      P.lattice(c, 1300, 150, 520, 380, { open: true });
      /* 左边一架书：整整齐齐，每一册的书根都朝外 */
      c.fillStyle = '#4b3324'; c.fillRect(170, 150, 440, 470); c.fillStyle = '#2e2018'; c.fillRect(184, 164, 412, 442);
      for (let row = 0; row < 4; row++) { const y = 172 + row * 108; c.fillStyle = '#4b3324'; c.fillRect(184, y + 96, 412, 10); for (let x = 190; x < 588;) { const w = 34 + r() * 30, n = 3 + Math.floor(r() * 4); for (let k = 0; k < n; k++) { c.fillStyle = P.mix('#d8cfb4', '#b9c0c4', r()); c.fillRect(x, y + 96 - (k + 1) * 13, w, 12); c.strokeStyle = 'rgba(43,34,28,0.5)'; c.lineWidth = 0.8; c.strokeRect(x, y + 96 - (k + 1) * 13, w, 12); if (r() < 0.25) { c.fillStyle = '#a8322a'; c.fillRect(x + w - 9, y + 98 - (k + 1) * 13, 6, 8); } } x += w + 8; } }
      /* 当中一幅字、一只养促织的罐架 */
      c.fillStyle = '#efe6cc'; c.fillRect(880, 130, 160, 400); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(880, 130, 160, 400); c.fillStyle = '#6a4a30'; c.fillRect(870, 120, 180, 12); c.fillRect(870, 528, 180, 12); c.font = '600 96px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(30,24,20,0.9)'; c.fillText('半', 960, 250); c.fillText('閒', 960, 390); c.textAlign = 'left'; c.fillStyle = '#a8322a'; c.fillRect(1004, 470, 22, 22);
      c.fillStyle = '#5a3d28'; c.fillRect(1100, 440, 130, 10); c.fillRect(1100, 520, 130, 10); c.fillRect(1104, 440, 8, 180); c.fillRect(1218, 440, 8, 180); for (let i = 0; i < 3; i++) { P.ellipse(c, 1126 + i * 38, 428, 15, 12, '#8a6a4a', INK(), 1.2); P.ellipse(c, 1126 + i * 38, 418, 12, 4, '#6a4e36', INK(), 1); P.ellipse(c, 1126 + i * 38, 508, 15, 12, '#7a7e86', INK(), 1.2); P.ellipse(c, 1126 + i * 38, 498, 12, 4, '#5a5e66', INK(), 1); }
      /* 地：方砖，书案底下一张毡 */
      P.tiles(c, 0, 640, 1920, 440, { s: 96, col: '#9a8a74', seed: 125 });
      P.rug(c, 560, 700, 820, 250, { col: '#5a3a44', border: '#c9a86a', accent: '#8a5a50', style: 'lattice', seed: 126 });
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 640, 1920, 14);
      P.paper(c, 1920, 1080, 127, 0.26);
    },
    props: [
      { x: 960, y: 800, bw: 520, bh: 190, block: [-250, -60, 500, 64], draw(g) {                                   // 书案：笔山、砚、一盏灯、一封拆开的信（纸是演出里单摆的，字要一个一个写上去）
        P.table(g, 0, 0, 500, 60, 78, { col: '#4a2f22' });
        P.ellipse(g, -170, -112, 30, 12, '#2a2422', INK(), 1.2); P.ellipse(g, -170, -114, 20, 7, '#0e0c0c'); g.fillStyle = '#6a4a30'; g.fillRect(-126, -122, 40, 8); P.line(g, -112, -122, -96, -150, 3, '#3a2a1e');
        g.fillStyle = '#e6dcc0'; g.save(); g.translate(170, -112); g.rotate(-0.2); g.fillRect(-34, -10, 68, 20); g.strokeStyle = 'rgba(43,34,28,0.6)'; g.strokeRect(-34, -10, 68, 20); g.restore();
        g.fillStyle = '#8a6a3a'; g.fillRect(124, -150, 6, 34); P.ellipse(g, 127, -116, 14, 5, '#8a6a3a', INK(), 1); P.candle(g, 127, -150); } },
      { x: 300, y: 690, bw: 90, bh: 150, block: [-30, -10, 60, 14], draw(g) { P.potted(g, 0, 0, 1, 'pine', { stand: 46, seed: 128 }); } },
      { x: 1780, y: 690, bw: 90, bh: 150, block: [-30, -10, 60, 14], draw(g) { P.potted(g, 0, 0, 1, 'orchid', { stand: 46, seed: 129 }); } },
    ],
  };
})();
