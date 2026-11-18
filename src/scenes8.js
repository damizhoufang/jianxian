/* 第二章后半的场景：扬州（yangzhou）、真州军营外（yingwai）、营内·夜（ying）、馆舍（guanshe）。
   这一批的地面直接用 ground.js：土路、草坡、石板、河沟、远山都在这里。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };
  const clipRect = (c, x, y, w, h, fn) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); fn(); c.restore(); };

  /* 城墙：一段带垛口的砖墙，top 是垛口顶，base 是墙脚 */
  function cityWall(c, x, top, w, base, o) {
    o = o || {};
    P.brick(c, x, top + 26, w, base - top - 26, { seed: o.seed || 801, base: o.col || '#8b8a84', bh: 20, bw: 58 });
    for (let px = x; px < x + w; px += 74) { P.brick(c, px, top, 46, 28, { seed: 802 + px, base: o.col || '#8b8a84', bh: 14, bw: 46 }); c.strokeStyle = INK(0.6); c.lineWidth = 1.2; c.strokeRect(px, top, 46, 28); }
    c.fillStyle = P.vgrad(c, 0, top + 26, base - top - 26, [[0, 'rgba(255,246,226,0.1)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(20,16,12,0.34)']]); c.fillRect(x, top + 26, w, base - top - 26);
    P.line(c, x, top + 26, x + w, top + 26, 2, INK(0.7));
    const r = JX.rng(o.seed || 801);
    for (let i = 0; i < w / 260; i++) {                                  // 新补的砖、烟熏过的地方
      const px = x + r() * w, py = top + 50 + r() * (base - top - 110), ww = 60 + r() * 120, hh = 40 + r() * 60;
      if (r() < 0.5) { c.fillStyle = 'rgba(190,170,140,0.28)'; c.fillRect(px, py, ww, hh); } else { const g = c.createRadialGradient(px, py, 0, px, py, ww); g.addColorStop(0, 'rgba(24,20,18,0.34)'); g.addColorStop(1, 'rgba(24,20,18,0)'); c.fillStyle = g; c.fillRect(px - ww, py - ww, ww * 2, ww * 2); }
    }
  }
  /* 城楼 / 望楼：cx 是正中，base 是楼脚（坐在墙顶上） */
  function tower(c, cx, base, w, h, o) {
    o = o || {};
    c.fillStyle = o.wall || '#9a4a3a'; c.fillRect(cx - w / 2, base - h, w, h); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(cx - w / 2, base - h, w, h);
    for (let i = 0; i < 5; i++) { const px = cx - w / 2 + (i + 0.5) * w / 5; P.post(c, px - 5, base - h, 10, h, '#5a2a20'); if (i < 4) { c.fillStyle = '#2a1c16'; c.fillRect(px + 10, base - h + 12, w / 5 - 20, h - 30); } }
    const rw = w * 0.74, ry = base - h;
    c.fillStyle = P.vgrad(c, 0, ry - 64, 70, [[0, '#3a4046'], [1, '#62686c']]);
    c.beginPath(); c.moveTo(cx - rw - 26, ry + 6); c.quadraticCurveTo(cx - rw * 0.6, ry - 20, cx - rw * 0.34, ry - 62); c.lineTo(cx + rw * 0.34, ry - 62); c.quadraticCurveTo(cx + rw * 0.6, ry - 20, cx + rw + 26, ry + 6); c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.8; c.stroke();
    for (let px = cx - rw; px < cx + rw; px += 16) P.line(c, px, ry + 2, cx + (px - cx) * 0.4, ry - 58, 1, 'rgba(20,22,26,0.4)');
    P.line(c, cx - rw * 0.34, ry - 62, cx + rw * 0.34, ry - 62, 5, '#2a2e32');
  }
  function flag(c, x, y, h, col, text) {
    P.line(c, x, y, x, y - h, 3, '#3a2a1e'); c.fillStyle = col; poly(c, [[x + 2, y - h + 4], [x + 54, y - h + 10], [x + 46, y - h + 34], [x + 54, y - h + 58], [x + 2, y - h + 62]]); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.2; c.stroke();
    if (text) P.vtext(c, text, x + 26, y - h + 14, 22, '#f6e9c8', '600');
  }
  /* 军帐：尖顶的布帐，门帘朝前。原点在帐脚正中 */
  function tent(g, w, h, o) {
    o = o || {}; const col = o.col || '#b9ae96';
    P.shadow(g, 0, 0, w * 0.56, 12, 0.4);
    g.fillStyle = P.hgrad(g, -w / 2, 0, w, [[0, P.dark(col, 0.3)], [0.42, P.light(col, 0.12)], [1, P.dark(col, 0.4)]]);
    g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w * 0.44, -h * 0.5); g.quadraticCurveTo(-w * 0.2, -h * 0.72, 0, -h); g.quadraticCurveTo(w * 0.2, -h * 0.72, w * 0.44, -h * 0.5); g.lineTo(w / 2, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
    P.line(g, -w * 0.44, -h * 0.5, w * 0.44, -h * 0.5, 1.2, INK(0.5));
    for (let i = -2; i <= 2; i++) P.line(g, i * w * 0.09, -h * 0.94 + Math.abs(i) * h * 0.1, i * w * 0.2, -h * 0.5, 1, 'rgba(40,30,20,0.25)');
    g.fillStyle = o.lit ? '#f2c878' : '#2a221c'; g.beginPath(); g.moveTo(-w * 0.1, 0); g.lineTo(-w * 0.07, -h * 0.4); g.lineTo(w * 0.07, -h * 0.4); g.lineTo(w * 0.1, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke();
    P.line(g, 0, -h, 0, -h - 16, 2.4, '#3a2a1e'); g.fillStyle = '#8e2a20'; poly(g, [[1, -h - 16], [20, -h - 11], [1, -h - 5]]); g.fill();
    [-1, 1].forEach(s => { P.line(g, s * w * 0.46, -h * 0.46, s * (w / 2 + 26), 2, 1.2, 'rgba(60,48,34,0.8)'); P.line(g, s * (w / 2 + 26), -6, s * (w / 2 + 26), 4, 3, '#5a4630'); });
  }
  /* 木栅：一排削尖的圆木。从 (x1,y) 到 (x2,y)，y 是脚下 */
  function palisade(g, x1, y, x2, h, seed) {
    const r = JX.rng(seed || 811);
    for (let px = x1; px < x2; px += 17) { const hh = h * (0.93 + r() * 0.12), col = P.mix('#6a5238', '#8a6e4a', r()); g.fillStyle = P.hgrad(g, px, 0, 16, [[0, P.dark(col, 0.25)], [0.4, col], [1, P.dark(col, 0.4)]]); g.beginPath(); g.moveTo(px, y); g.lineTo(px, y - hh + 12); g.lineTo(px + 8, y - hh); g.lineTo(px + 16, y - hh + 12); g.lineTo(px + 16, y); g.closePath(); g.fill(); g.strokeStyle = INK(0.7); g.lineWidth = 1; g.stroke(); }
    P.line(g, x1, y - h * 0.3, x2, y - h * 0.3, 5, 'rgba(58,42,28,0.9)'); P.line(g, x1, y - h * 0.72, x2, y - h * 0.72, 5, 'rgba(58,42,28,0.9)');
  }
  /* 拒马：交叉的尖木 */
  function chevaux(g, w) {
    P.shadow(g, 0, 0, w / 2, 8, 0.35); P.line(g, -w / 2, -22, w / 2, -22, 6, '#5a4630');
    for (let px = -w / 2 + 14; px < w / 2; px += 28) { P.line(g, px - 18, 0, px + 16, -48, 5, INK()); P.line(g, px - 18, 0, px + 16, -48, 3, '#8a6e4a'); P.line(g, px + 18, 0, px - 16, -48, 5, INK()); P.line(g, px + 18, 0, px - 16, -48, 3, '#7a6040'); }
  }
  /* 兵器架：一排长枪 */
  function rack(g) {
    P.shadow(g, 0, 0, 60, 8, 0.35); P.line(g, -54, 0, -54, -70, 5, '#4a3424'); P.line(g, 54, 0, 54, -70, 5, '#4a3424'); P.line(g, -58, -62, 58, -62, 5, '#4a3424'); P.line(g, -58, -24, 58, -24, 4, '#4a3424');
    for (let i = 0; i < 6; i++) { const px = -44 + i * 17.6; P.line(g, px, -4, px + 3, -150, 3, '#8a6e4a'); g.fillStyle = '#cfd6da'; poly(g, [[px + 3, -150], [px - 1, -164], [px + 4, -180], [px + 8, -164]]); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1; g.stroke(); g.fillStyle = '#8e2a20'; g.beginPath(); g.ellipse(px + 3, -146, 5, 7, 0, 0, 6.3); g.fill(); }
  }
  /* 一口大锅，底下烧着柴 */
  function cauldron(g) {
    P.shadow(g, 0, 0, 50, 9, 0.4); [-30, 0, 30].forEach(px => P.line(g, px, 0, px * 0.5, -38, 5, '#3a2a1e'));
    for (let i = 0; i < 5; i++) P.line(g, -24 + i * 12, -2, -14 + i * 8, -12, 4, i % 2 ? '#c9703a' : '#5a4030');
    g.fillStyle = '#26221f'; g.beginPath(); g.ellipse(0, -44, 44, 15, 0, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(-44, -44); g.quadraticCurveTo(-38, -8, 0, -8); g.quadraticCurveTo(38, -8, 44, -44); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
    P.ellipse(g, 0, -45, 38, 11, '#d8cdb0', INK(), 1.2);
  }

  /* ======================= 扬州 ======================= */
  S.yangzhou = {
    name: '扬州', sub: '二月中 · 午后', w: 2800, h: 1080, ambient: '#d0d2d0', music: 'biancheng', outside: '#20242a',
    walk: [[100, 640, 2700, 900]],
    spawns: { start: { x: 220, y: 780, dir: 3 } },
    exits: [{ id: 'west', x: 2640, y: 650, w: 60, h: 230, label: '西门 · 往真州', lx: 2540, ly: 606, back: [-34, 0] }],
    lights: [{ x: 1400, y: 700, r: 2000, c: '#eef0ea', a: 0.8, ey: 0.5 }],
    paint(c) {
      /* 天、蜀冈、城墙 */
      c.fillStyle = P.vgrad(c, 0, 0, 470, [[0, '#bcc8cc'], [1, '#e4e2d2']]); c.fillRect(0, 0, 2800, 470);
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(250,250,244,0.5)'; c.beginPath(); c.ellipse(240 + i * 480, 70 + (i % 3) * 34, 280, 22, 0, 0, 6.3); c.fill(); }
      P.hills(c, 0, 250, 2800, 120, { seed: 820, layers: 2, col: '#8fa49c', far: '#c6d0cc', trees: false });
      cityWall(c, 0, 214, 2800, 452, { seed: 821 });
      tower(c, 2480, 214, 300, 96); flag(c, 2300, 214, 110, '#8e2a20', '淮'); flag(c, 2664, 214, 110, '#8e2a20');
      [300, 900, 1500, 1960].forEach((x, i) => flag(c, x, 214, 80, i % 2 ? '#7a2a22' : '#3d4a56'));
      c.fillStyle = '#17120f'; c.beginPath(); c.moveTo(1130, 452); c.lineTo(1130, 372); c.quadraticCurveTo(1200, 318, 1270, 372); c.lineTo(1270, 452); c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 2; c.stroke();      // 水门
      for (let px = 1146; px < 1270; px += 20) P.line(c, px, 352, px, 452, 3, 'rgba(60,52,44,0.9)');
      /* 地：先铺土，再压上各样东西 */
      P.earth(c, 0, 452, 2800, 628, { seed: 822, ruts: [742] });
      clipRect(c, 0, 452, 2800, 190, () => P.grass(c, 0, 452, 2800, 190, { seed: 823, dry: true, bare: 8 }));              // 墙根到街沿：荒草地
      clipRect(c, 0, 716, 1040, 92, () => P.flagstones(c, 0, 716, 1040, 92, { seed: 824, base: '#928c80', sh: 46 }));       // 官道心里一条石板
      clipRect(c, 1360, 716, 1440, 92, () => P.flagstones(c, 1360, 716, 1440, 92, { seed: 825, base: '#928c80', sh: 46 }));
      clipRect(c, 0, 912, 2800, 168, () => P.grass(c, 0, 912, 2800, 168, { seed: 826, flowers: true, bare: 6 }));           // 街南：废墟上长出的青苗
      /* 废池：干了一半的塘，一圈乱石 */
      P.pond(c, 590, 548, 150, 44, { seed: 827, col: '#7f9690', fish: 0, lily: 3 }); P.reeds(c, 470, 560, 70, 70, { seed: 828 }); P.reeds(c, 720, 566, 60, 60, { seed: 829 });
      /* 街南的断墙残基 */
      [[120, 960, 300], [560, 1000, 240], [1500, 968, 360], [2060, 1010, 280], [2460, 960, 220]].forEach((q, i) => {
        P.brick(c, q[0], q[1], q[2], 26, { seed: 830 + i, base: '#7f7468', bh: 13, bw: 40 }); c.strokeStyle = INK(0.6); c.lineWidth = 1.2; c.strokeRect(q[0], q[1], q[2], 26);
        c.fillStyle = 'rgba(86,112,62,0.5)'; for (let k = 0; k < 6; k++) c.fillRect(q[0] + k * q[2] / 6 + 8, q[1] - 3, 22, 5);
        P.rock(c, q[0] + q[2] + 30, q[1] + 30, 0.7, { seed: 840 + i });
      });
      [[420, 1040], [980, 1050], [1880, 990], [2700, 1040]].forEach((q, i) => P.bush(c, q[0], q[1], 1, { seed: 845 + i }));
      /* 流民的草棚：靠着城墙 */
      [[150, 566], [340, 574], [1560, 566]].forEach((q, i) => { c.fillStyle = '#b8a06a'; poly(c, [[q[0] - 70, q[1]], [q[0] - 54, q[1] - 70], [q[0] + 54, q[1] - 70], [q[0] + 70, q[1]]]); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.stroke(); for (let k = -5; k <= 5; k++) P.line(c, q[0] + k * 12, q[1] - 68, q[0] + k * 14, q[1], 1, 'rgba(90,70,30,0.4)'); c.fillStyle = '#2a221c'; c.fillRect(q[0] - 22, q[1] - 40, 44, 40); void i; });
      /* 河：从水门出来，穿街往南 */
      c.fillStyle = P.vgrad(c, 0, 452, 628, [[0, '#6f8f94'], [0.4, '#86a6a6'], [1, '#6b8a8c']]); poly(c, [[1110, 452], [1290, 452], [1320, 640], [1324, 1080], [1076, 1080], [1080, 640]]); c.fill();
      c.fillStyle = 'rgba(20,28,30,0.3)'; poly(c, [[1110, 452], [1290, 452], [1300, 520], [1100, 520]]); c.fill();
      [[1080, 640, 1110, 452], [1320, 640, 1290, 452]].forEach(q => { P.line(c, q[0], q[1], q[2], q[3], 12, '#8f8a7e'); P.line(c, q[0], q[1], q[2], q[3], 1.2, INK(0.6)); });
      [[1076, 912, 1076, 1080], [1324, 912, 1324, 1080]].forEach(q => { P.line(c, q[0], q[1], q[2], q[3], 12, '#8f8a7e'); });
      /* 石桥：街从桥上过，两边石栏 */
      P.flagstones(c, 1040, 628, 320, 284, { seed: 850, base: '#a39d90', sh: 48 });
      c.fillStyle = 'rgba(20,16,12,0.28)'; c.fillRect(1040, 900, 320, 30);
      const rail = y => { c.fillStyle = P.vgrad(c, 0, y - 30, 34, [[0, '#c2bcae'], [1, '#7e786c']]); c.fillRect(1030, y - 12, 340, 14); c.strokeStyle = INK(0.8); c.lineWidth = 1.3; c.strokeRect(1030, y - 12, 340, 14); for (let px = 1040; px <= 1360; px += 40) { c.fillStyle = '#aaa496'; c.fillRect(px - 6, y - 34, 12, 36); c.strokeRect(px - 6, y - 34, 12, 36); P.ellipse(c, px, y - 38, 7, 5, '#b8b2a4', INK(0.8), 1); } };
      rail(640);
      c.fillStyle = '#5c6a68'; c.beginPath(); c.ellipse(1200, 916, 96, 40, 0, 0, Math.PI); c.fill();                           // 桥洞在南面水上的影
      P.ao(c, 0, 452, 2800, 40, 'top', 0.3);
      P.paper(c, 2800, 1080, 86, 0.3);
    },
    props: [
      { x: 1200, y: 912, bw: 360, bh: 50, sortY: 905, draw(g) { g.fillStyle = P.vgrad(g, 0, -30, 34, [[0, '#c2bcae'], [1, '#7e786c']]); g.fillRect(-170, -12, 340, 14); g.strokeStyle = INK(0.8); g.lineWidth = 1.3; g.strokeRect(-170, -12, 340, 14); for (let px = -160; px <= 160; px += 40) { g.fillStyle = '#aaa496'; g.fillRect(px - 6, -34, 12, 36); g.strokeRect(px - 6, -34, 12, 36); P.ellipse(g, px, -38, 7, 5, '#b8b2a4', INK(0.8), 1); } } },   // 桥南栏：挡在人前面
      { x: 1006, y: 636, bw: 250, bh: 270, draw(g) { P.tree(g, 0, 0, 0.74, 'willow', { seed: 31 }); } },
      { x: 1396, y: 636, bw: 250, bh: 270, draw(g) { P.tree(g, 0, 0, 0.7, 'willow', { seed: 32 }); } },
      { x: 330, y: 634, bw: 280, bh: 300, draw(g) { P.tree(g, 0, 0, 0.9, 'bare', { seed: 33 }); } },                           // 废池边的乔木
      { x: 950, y: 1056, bw: 230, bh: 250, draw(g) { P.tree(g, 0, 0, 0.62, 'willow', { seed: 34 }); } },
      /* 茶摊 */
      { x: 880, y: 668, bw: 280, bh: 220, block: [-70, -22, 140, 26], draw(g) {
        P.line(g, -110, 0, -110, -196, 6, '#5a4630'); P.line(g, 110, 0, 110, -196, 6, '#5a4630');
        g.fillStyle = P.vgrad(g, 0, -204, 56, [[0, '#a89a78'], [1, '#7c6e50']]); g.beginPath(); g.moveTo(-130, -200); g.lineTo(130, -200); g.lineTo(140, -152); g.quadraticCurveTo(0, -140, -140, -152); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
        P.table(g, 0, 0, 130, 30, 40, { col: '#6a4a30', seed: 14 }); P.ellipse(g, -20, -72, 6, 3.4, '#d8ece0', INK(), 1); P.ellipse(g, 24, -72, 6, 3.4, '#d8ece0', INK(), 1);
        g.fillStyle = '#8a6a52'; g.beginPath(); g.ellipse(52, -78, 12, 9, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke();
      } },
      /* 招军的榜 */
      { x: 1640, y: 654, bw: 150, bh: 170, block: [-56, -14, 112, 18], draw(g) { P.shadow(g, 0, 0, 60, 8, 0.35); P.line(g, -50, 0, -50, -150, 6, '#4a3424'); P.line(g, 50, 0, 50, -150, 6, '#4a3424'); g.fillStyle = '#6a4a30'; g.fillRect(-60, -150, 120, 90); g.strokeStyle = INK(); g.lineWidth = 1.4; g.strokeRect(-60, -150, 120, 90); g.fillStyle = '#e9ddc4'; g.fillRect(-48, -142, 96, 74); g.strokeRect(-48, -142, 96, 74); P.vtext(g, '招刺', 26, -138, 22, '#8e2a20', '600'); for (let i = 0; i < 4; i++) P.line(g, -36 + i * 13, -134, -36 + i * 13, -78, 2, 'rgba(43,34,28,0.55)'); } },
      { x: 1900, y: 656, bw: 150, bh: 190, block: [-58, -14, 116, 18], draw(g) { rack(g); } },
      { x: 2130, y: 614, bw: 120, bh: 70, draw(g) { cauldron(g); } },
      { x: 2470, y: 712, bw: 170, bh: 60, block: [-78, -18, 156, 22], draw(g) { chevaux(g, 160); } },
      { x: 2470, y: 876, bw: 170, bh: 60, block: [-78, -18, 156, 22], draw(g) { chevaux(g, 160); } },
    ],
    anim(c, t) {
      c.lineCap = 'round';
      for (let i = 0; i < 16; i++) { const y = 470 + ((i * 97.3 + t * 14) % 600), x = 1100 + ((i * 53.7) % 200), a = 0.5 + 0.5 * Math.sin(t * 1.1 + i); if (y > 624 && y < 916) continue; c.strokeStyle = 'rgba(250,252,246,' + (0.26 * a) + ')'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26, y + 3); c.stroke(); }
      const st = S.yangzhou._steam; if (st !== false) for (let i = 0; i < 5; i++) { const k = (t * 0.4 + i * 0.2) % 1; c.fillStyle = 'rgba(244,244,238,' + (0.3 * (1 - k)) + ')'; c.beginPath(); c.ellipse(2130 + Math.sin(i * 2 + t) * 8, 566 - k * 70, 10 + k * 16, 8 + k * 10, 0, 0, 6.3); c.fill(); }
    },
  };

  /* ======================= 真州军营外 ======================= */
  S.yingwai = {
    name: '真州城外', sub: '忠勇军营 · 黄昏', w: 2800, h: 1080, ambient: '#d9c4a6', music: 'yingye', outside: '#241c18',
    walk: [[100, 640, 2700, 900]],
    spawns: { start: { x: 220, y: 800, dir: 3 }, gate: { x: 2380, y: 700, dir: 2 } },
    exits: [],
    blocks: [[846, 640, 100, 44], [852, 872, 116, 40]],                    // 小河：只有木板桥过得去
    lights: [{ x: 600, y: 420, r: 1500, c: '#ffd9a0', a: 0.7, ey: 0.6 }, { x: 2420, y: 560, r: 300, c: '#ffcf96', a: 0.5, glow: 26, gx: 2420, gy: 520, gc: '#ffb070', ga: 0.5 }],
    paint(c) {
      /* 黄昏的天、远山、江 */
      c.fillStyle = P.vgrad(c, 0, 0, 470, [[0, '#8e9cb0'], [0.55, '#e9c79a'], [1, '#f0dcb4']]); c.fillRect(0, 0, 2800, 470);
      c.fillStyle = 'rgba(255,196,120,0.55)'; c.beginPath(); c.arc(520, 330, 54, 0, 6.3); c.fill(); const sg = c.createRadialGradient(520, 330, 20, 520, 330, 420); sg.addColorStop(0, 'rgba(255,214,150,0.5)'); sg.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = sg; c.fillRect(0, 0, 1200, 470);
      for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(246,224,190,0.5)'; c.beginPath(); c.ellipse(300 + i * 560, 110 + (i % 2) * 50, 300, 18, 0, 0, 6.3); c.fill(); }
      P.hills(c, 0, 440, 2800, 260, { seed: 860, layers: 3, col: '#5d7468', far: '#b9bfae' });
      c.fillStyle = P.vgrad(c, 0, 430, 40, [[0, '#d9c9a0'], [1, '#a8b2a4']]); c.fillRect(0, 430, 1500, 34); for (let i = 0; i < 20; i++) P.line(c, 40 + i * 74, 440 + (i % 3) * 7, 90 + i * 74, 440 + (i % 3) * 7, 1.4, 'rgba(255,250,236,0.5)');     // 远处一线江水
      /* 草坡、土路、小河 */
      P.grass(c, 0, 458, 2800, 622, { seed: 861, dry: true, flowers: true, bare: 10 });
      c.save(); poly(c, [[0, 700], [600, 716], [1300, 690], [2000, 706], [2800, 690], [2800, 846], [2000, 868], [1300, 842], [600, 872], [0, 856]]); c.clip(); P.earth(c, 0, 660, 2800, 240, { seed: 862, ruts: [752] }); c.restore();   // 往营门去的土路
      c.strokeStyle = 'rgba(60,48,30,0.25)'; c.lineWidth = 4; poly(c, [[0, 700], [600, 716], [1300, 690], [2000, 706], [2800, 690], [2800, 846], [2000, 868], [1300, 842], [600, 872], [0, 856]]); c.stroke();
      /* 小河：从山脚弯下来，过一座木板桥，流到近处 */
      const river = [[820, 458], [800, 540], [860, 620], [900, 700], [880, 860], [940, 960], [900, 1080]];
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = '#7b7566'; c.lineWidth = 104; c.beginPath(); river.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke();
      c.strokeStyle = '#7f9ea0'; c.lineWidth = 84; c.stroke(); c.strokeStyle = 'rgba(214,180,130,0.35)'; c.lineWidth = 40; c.stroke();
      c.restore();
      for (let i = 0; i < 26; i++) { const k = i / 26, a = river[Math.min(5, Math.floor(k * 6))], b = river[Math.min(6, Math.floor(k * 6) + 1)], u = (k * 6) % 1, px = a[0] + (b[0] - a[0]) * u + ((i * 37) % 50 - 25), py = a[1] + (b[1] - a[1]) * u; P.ellipse(c, px + ((i % 2) ? 46 : -46), py, 9, 5.5, P.mix('#77736a', '#b4b0a2', (i % 5) / 5), INK(0.6), 0.9); }
      P.reeds(c, 760, 600, 60, 80, { seed: 863 }); P.reeds(c, 960, 930, 70, 90, { seed: 864 }); P.reeds(c, 830, 1010, 60, 80, { seed: 865 });
      /* 木板桥（路过河的地方） */
      c.fillStyle = '#8a6e4a'; c.fillRect(820, 690, 150, 176); for (let px = 820; px < 970; px += 19) P.line(c, px, 690, px, 866, 1.4, 'rgba(40,28,16,0.55)'); c.strokeStyle = INK(0.8); c.lineWidth = 1.6; c.strokeRect(820, 690, 150, 176);
      P.line(c, 816, 690, 974, 690, 6, '#5a4630'); P.line(c, 816, 866, 974, 866, 6, '#5a4630');
      /* 营寨：木栅、望楼、营门、里头露出来的帐顶 */
      for (let i = 0; i < 7; i++) { c.save(); c.translate(1520 + i * 170, 560 - (i % 2) * 10); c.globalAlpha = 0.9; tent(c, 150, 110, { col: '#b0a48a' }); c.restore(); }
      palisade(c, 1380, 600, 2800, 150, 866);
      [[1460, 600], [2760, 600]].forEach(q => { P.post(c, q[0] - 44, q[1] - 250, 10, 250, '#5a4630'); P.post(c, q[0] + 34, q[1] - 250, 10, 250, '#5a4630'); c.fillStyle = '#7a6040'; c.fillRect(q[0] - 56, q[1] - 262, 112, 46); c.strokeStyle = INK(); c.lineWidth = 1.4; c.strokeRect(q[0] - 56, q[1] - 262, 112, 46); c.fillStyle = '#4a4a44'; poly(c, [[q[0] - 70, q[1] - 262], [q[0], q[1] - 306], [q[0] + 70, q[1] - 262]]); c.fill(); c.stroke(); });
      flag(c, 1460, 294, 70, '#8e2a20', '忠'); flag(c, 2700, 294, 70, '#8e2a20', '勇');
      /* 营门（正门，关着）与侧门 */
      c.fillStyle = '#4a3828'; c.fillRect(1900, 440, 220, 160); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(1900, 440, 220, 160); P.line(c, 2010, 440, 2010, 600, 2, INK()); for (let i = 0; i < 4; i++) { P.line(c, 1900, 470 + i * 36, 2120, 470 + i * 36, 1, 'rgba(0,0,0,0.3)'); }
      P.beam(c, 1880, 420, 260, 24, '#3a2a1e'); c.fillStyle = '#17100c'; c.fillRect(1950, 380, 120, 40); c.strokeStyle = C.tenghuang; c.lineWidth = 2; c.strokeRect(1954, 384, 112, 32); c.fillStyle = '#f2cf7a'; c.font = '600 24px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('忠勇軍', 2010, 401);
      c.fillStyle = '#3a2c20'; c.fillRect(2384, 500, 72, 100); c.strokeStyle = INK(); c.lineWidth = 1.8; c.strokeRect(2384, 500, 72, 100); P.ellipse(c, 2444, 552, 3, 3, '#c9a45a');     // 侧门
      /* 馆舍：营里最靠后的一角，高墙，墙头压着荆棘，墙里一株老树 */
      c.fillStyle = '#c9bfa6'; c.fillRect(2500, 380, 300, 90); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.strokeRect(2500, 380, 300, 90); c.fillStyle = '#5a5e62'; c.fillRect(2494, 372, 312, 12);
      P.fence(c, 2500, 380, 2800, { seed: 867, h: 8, thorn: true, col: '#5a4a34' });
      P.ao(c, 1380, 600, 1420, 30, 'top', 0.3);
      P.paper(c, 2800, 1080, 87, 0.3);
    },
    props: [
      { x: 300, y: 636, bw: 300, bh: 330, draw(g) { P.tree(g, 0, 0, 0.92, 'round', { seed: 41, dk: '#4a6238', lt: '#a6b86a' }); } },
      { x: 1200, y: 630, bw: 290, bh: 320, draw(g) { P.tree(g, 0, 0, 0.9, 'pine', { seed: 42 }); } },
      { x: 560, y: 1050, bw: 200, bh: 210, draw(g) { P.rockery(g, 0, 0, 0.9, { seed: 43, col: '#8f9488' }); } },
      { x: 1700, y: 1056, bw: 120, bh: 80, draw(g) { P.bush(g, -30, 0, 1.1, { seed: 44 }); P.rock(g, 40, 0, 0.9, { seed: 45 }); } },
      { x: 2300, y: 1050, bw: 280, bh: 300, draw(g) { P.tree(g, 0, 0, 0.8, 'bare', { seed: 46 }); } },
      /* 路边卖酒的摊子：两只坛、一块板 */
      { x: 520, y: 668, bw: 220, bh: 120, block: [-80, -20, 160, 24], draw(g) { P.shadow(g, 0, 0, 90, 10, 0.35); P.table(g, 10, 0, 120, 28, 36, { col: '#6a4a30', seed: 24 }); P.jar(g, -78, 0, 0.74, { seed: 61, text: '酒' }); P.jar(g, -20, -40, 0.4, { seed: 62, text: '春' }); P.ellipse(g, 30, -68, 7, 4, '#d8ece0', INK(), 1); P.ellipse(g, 52, -68, 7, 4, '#d8ece0', INK(), 1); P.line(g, 96, 0, 96, -150, 4, '#5a4630'); g.fillStyle = '#b8433a'; poly(g, [[98, -150], [134, -146], [132, -96], [116, -104], [98, -96]]); g.fill(); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.stroke(); P.vtext(g, '酒', 115, -142, 24, '#f6e9c8', '600'); } },
      { x: 2230, y: 650, bw: 170, bh: 60, block: [-78, -18, 156, 22], draw(g) { chevaux(g, 160); } },
    ],
    anim(c, t) {
      c.lineCap = 'round';
      for (let i = 0; i < 12; i++) { const k = ((i * 0.083 + t * 0.03) % 1), seg = Math.min(5, Math.floor(k * 6)), u = (k * 6) % 1, R = [[820, 458], [800, 540], [860, 620], [900, 700], [880, 860], [940, 960], [900, 1080]], a = R[seg], b = R[seg + 1], x = a[0] + (b[0] - a[0]) * u + ((i * 29) % 40 - 20), y = a[1] + (b[1] - a[1]) * u; if (y > 686 && y < 870) continue; c.strokeStyle = 'rgba(250,252,246,0.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4, y + 14); c.stroke(); }
    },
  };

  /* ======================= 营内 · 夜 ======================= */
  const TENTS = [[420, 640], [820, 628], [1240, 640], [990, 946], [1830, 948], [1680, 640]];      // 近处两顶要让开三处躲人的地方（粮车、草垛、木桶的前面）
  S.ying = {
    name: '忠勇军营', sub: '三更', w: 2800, h: 1080, ambient: '#5f6a8c', music: 'yingye', outside: '#0c0e16',
    walk: [[110, 650, 2700, 900]],
    spawns: { start: { x: 190, y: 780, dir: 3 }, door: { x: 2520, y: 700, dir: 0 } },
    exits: [{ id: 'guan', x: 2470, y: 650, w: 100, h: 30, label: '馆舍', lx: 2520, ly: 596, back: [0, 34] }],
    lights: [
      { x: 1000, y: 770, r: 150, c: '#ffb46a', a: 0.7, glow: 30, gx: 1000, gy: 746, gc: '#ff9a4a', ga: 0.7 },
      { x: 1900, y: 800, r: 150, c: '#ffb46a', a: 0.7, glow: 30, gx: 1900, gy: 776, gc: '#ff9a4a', ga: 0.7 },
      { x: 2520, y: 560, r: 260, c: '#ffd9a0', a: 0.6, glow: 24, gx: 2632, gy: 512, gc: '#ffcf8a', ga: 0.7 },
      { x: 1400, y: 300, r: 1600, c: '#7f8fc0', a: 0.3, ey: 0.5 },
    ],
    paint(c) {
      c.fillStyle = P.vgrad(c, 0, 0, 520, [[0, '#0e1326'], [1, '#2a3552']]); c.fillRect(0, 0, 2800, 520);
      const r = JX.rng(871); for (let i = 0; i < 150; i++) { c.fillStyle = 'rgba(240,244,255,' + (0.3 + r() * 0.6) + ')'; c.fillRect(r() * 2800, r() * 420, 1.6 + r() * 1.6, 1.6 + r() * 1.6); }
      c.fillStyle = '#eef0e6'; c.beginPath(); c.arc(2160, 150, 36, 0, 6.3); c.fill(); c.fillStyle = '#16203a'; c.beginPath(); c.arc(2176, 140, 34, 0, 6.3); c.fill();     // 下弦月
      P.hills(c, 0, 520, 2800, 150, { seed: 872, layers: 2, col: '#1e2a3a', far: '#2e3a52', mist: false, trees: false });
      /* 后头的木栅和一排帐顶 */
      for (let i = 0; i < 9; i++) { c.save(); c.translate(180 + i * 250, 548 - (i % 2) * 8); tent(c, 190, 120, { col: '#8a8474' }); c.restore(); }
      palisade(c, 0, 600, 2440, 120, 873);
      /* 地：踩实的土，帐前帐后有草 */
      P.earth(c, 0, 600, 2800, 480, { seed: 874, base: '#8e7c62', ruts: [770] });
      [[300, 1000, 380, 60], [1300, 1040, 520, 50], [2200, 1010, 420, 60], [1560, 640, 200, 30], [640, 660, 160, 26]].forEach((q, i) => P.patch(c, q[0], q[1], q[2], q[3], 880 + i, (px, py, pw, ph) => P.grass(c, px, py, pw, ph, { seed: 885 + i, dry: true }), false));
      /* 馆舍：高墙、墙头的荆棘、一扇小门、墙里一扇亮着的窗 */
      c.fillStyle = '#b9b09a'; c.fillRect(2440, 380, 360, 262); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(2440, 380, 360, 262);
      c.fillStyle = P.vgrad(c, 0, 380, 262, [[0, 'rgba(20,24,40,0.45)'], [1, 'rgba(20,24,40,0.2)']]); c.fillRect(2440, 380, 360, 262);
      c.fillStyle = '#4a4e54'; c.fillRect(2432, 370, 376, 14); P.fence(c, 2440, 372, 2800, { seed: 875, h: 10, thorn: true, col: '#4a3c2a' });
      c.fillStyle = '#2a2018'; c.fillRect(2476, 520, 88, 122); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(2476, 520, 88, 122); P.ellipse(c, 2552, 584, 3, 3, '#c9a45a');
      c.fillStyle = '#f2c878'; c.fillRect(2600, 470, 64, 84); c.strokeStyle = '#3a2a1e'; c.lineWidth = 4; c.strokeRect(2600, 470, 64, 84); P.line(c, 2632, 470, 2632, 554, 2.4, '#3a2a1e'); P.line(c, 2600, 512, 2664, 512, 2.4, '#3a2a1e');
      c.fillStyle = 'rgba(40,30,20,0.55)'; c.beginPath(); c.ellipse(2640, 524, 13, 16, 0, 0, 6.3); c.fill(); c.fillRect(2622, 536, 36, 18);                             // 窗纸上一个伏案的人影
      P.ao(c, 0, 600, 2800, 40, 'top', 0.34);
      P.paper(c, 2800, 1080, 88, 0.26);
    },
    props: TENTS.map((q, i) => ({ x: q[0], y: q[1], bw: 300, bh: 190, block: [-118, -34, 236, 40], draw(g) { tent(g, 240, 160, { col: i % 2 ? '#a89e88' : '#b4aa92' }); } })).concat([
      { x: 1000, y: 780, bw: 90, bh: 80, block: [-26, -14, 52, 18], draw(g) { P.shadow(g, 0, 0, 30, 7, 0.4); [-18, 0, 18].forEach(px => P.line(g, px, 0, px * 0.3, -34, 4, '#3a2a1e')); g.fillStyle = '#26221f'; g.beginPath(); g.ellipse(0, -38, 24, 9, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke(); } },       // 火盆
      { x: 1900, y: 810, bw: 90, bh: 80, block: [-26, -14, 52, 18], draw(g) { P.shadow(g, 0, 0, 30, 7, 0.4); [-18, 0, 18].forEach(px => P.line(g, px, 0, px * 0.3, -34, 4, '#3a2a1e')); g.fillStyle = '#26221f'; g.beginPath(); g.ellipse(0, -38, 24, 9, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke(); } },
      { x: 2130, y: 664, bw: 150, bh: 190, block: [-58, -14, 116, 18], draw(g) { rack(g); } },
      /* 粮车、草垛：躲巡更的地方 */
      { x: 620, y: 800, bw: 260, bh: 130, block: [-100, -24, 200, 28], draw(g) { P.shadow(g, 0, 0, 110, 13, 0.4); g.fillStyle = '#7a5a3a'; g.fillRect(-96, -56, 180, 14); g.strokeStyle = INK(); g.lineWidth = 1.4; g.strokeRect(-96, -56, 180, 14); [-56, 44].forEach(px => { g.fillStyle = '#4a3424'; g.beginPath(); g.arc(px, -28, 28, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 2; g.stroke(); g.fillStyle = '#8a6e4a'; g.beginPath(); g.arc(px, -28, 20, 0, 6.3); g.fill(); }); [[-60, -56], [-4, -56], [50, -56], [-32, -86], [24, -86]].forEach(q => { g.fillStyle = P.hgrad(g, q[0] - 30, 0, 60, [[0, '#8a7a5c'], [0.4, '#c2b08a'], [1, '#7a6a4c']]); g.beginPath(); g.roundRect(q[0] - 30, q[1] - 30, 60, 30, 10); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke(); }); } },
      { x: 1380, y: 800, bw: 220, bh: 150, block: [-90, -24, 180, 28], draw(g) { P.shadow(g, 0, 0, 100, 13, 0.4); g.fillStyle = P.hgrad(g, -96, 0, 192, [[0, '#8a7a44'], [0.4, '#d2c078'], [1, '#7a6a3a']]); g.beginPath(); g.moveTo(-96, 0); g.quadraticCurveTo(-100, -110, 0, -128); g.quadraticCurveTo(100, -110, 96, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke(); for (let i = 0; i < 26; i++) { const px = -84 + (i * 37) % 168, py = -10 - (i * 53) % 100; P.line(g, px, py, px + 10, py - 12, 1.2, 'rgba(90,70,20,0.5)'); } } },
      { x: 2290, y: 800, bw: 240, bh: 130, block: [-96, -24, 192, 28], draw(g) { P.shadow(g, 0, 0, 104, 13, 0.4); for (let i = 0; i < 4; i++) { g.fillStyle = P.hgrad(g, -90 + i * 46, 0, 44, [[0, '#5a4630'], [0.4, '#9a7a52'], [1, '#4a3826']]); g.beginPath(); g.ellipse(-68 + i * 46, -34, 21, 34, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke(); P.line(g, -89 + i * 46, -46, -47 + i * 46, -46, 2, '#2a2420'); P.line(g, -89 + i * 46, -22, -47 + i * 46, -22, 2, '#2a2420'); } } },       // 一排木桶
    ]),
    anim(c, t) {
      [[1000, 742], [1900, 772]].forEach((q, k) => { for (let i = 0; i < 6; i++) { const f = 0.6 + 0.4 * Math.sin(t * 9 + i * 1.7 + k); c.fillStyle = i % 2 ? 'rgba(255,170,70,' + (0.75 * f) + ')' : 'rgba(255,226,140,' + (0.8 * f) + ')'; c.beginPath(); c.ellipse(q[0] + (i - 2.5) * 5, q[1] - 6 - f * 8 - (i % 3) * 3, 5, 10 + f * 6, 0, 0, 6.3); c.fill(); } });
    },
  };

  /* ======================= 馆舍 ======================= */
  S.guanshe = {
    name: '馆舍', sub: '灯下', w: 1920, h: 1080, ambient: '#8a7f8a', music: 'meichuang', outside: '#0c0a0c',
    walk: [[130, 650, 1790, 920]],
    spawns: { start: { x: 250, y: 800, dir: 3 } },
    exits: [],
    lights: [
      { x: 1180, y: 600, r: 520, c: '#ffd596', a: 0.85, glow: 30, gx: 1238, gy: 560, gc: '#ffcf8a', ga: 0.8 },
      { x: 520, y: 380, r: 420, c: '#9fb4e0', a: 0.4, ey: 0.7 },
    ],
    paint(c) {
      const r = JX.rng(891);
      P.tiles(c, 0, 560, 1920, 520, { seed: 892, col: '#8a867c', s: 62 });
      P.mat(c, 760, 690, 820, 220, { col: '#c9b47e', edge: '#4a3a2c' });
      P.rug(c, 220, 700, 330, 150, { seed: 893, style: 'plain', col: '#5f6e5a', border: '#2a3028', accent: '#cdbf96' });
      /* 墙：旧粉墙，下半截砖 */
      P.plaster(c, 0, 0, 1920, 560, { seed: 894, base: '#cdbfa2' }); P.brick(c, 0, 470, 1920, 90, { seed: 895, base: '#8a8478', bh: 18, bw: 56 }); P.line(c, 0, 470, 1920, 470, 2, INK(0.6));
      P.beam(c, 0, 16, 1920, 30, '#3a2a1e');
      /* 窗：外头是墙头的荆棘和半个月亮 */
      c.fillStyle = '#16203a'; c.fillRect(380, 170, 300, 220); c.fillStyle = '#eef0e6'; c.beginPath(); c.arc(590, 232, 26, 0, 6.3); c.fill(); c.fillStyle = '#16203a'; c.beginPath(); c.arc(602, 224, 25, 0, 6.3); c.fill();
      c.fillStyle = '#3a3e44'; c.fillRect(380, 330, 300, 60); c.save(); c.beginPath(); c.rect(380, 170, 300, 220); c.clip(); P.fence(c, 380, 334, 680, { seed: 896, h: 8, thorn: true, col: '#4a3c2a' }); c.restore();
      c.strokeStyle = '#3a2a1e'; c.lineWidth = 12; c.strokeRect(380, 170, 300, 220); for (let i = 1; i < 4; i++) P.line(c, 380 + i * 75, 170, 380 + i * 75, 390, 4, '#3a2a1e'); P.line(c, 380, 280, 680, 280, 4, '#3a2a1e');
      /* 门（左墙） */
      c.fillStyle = '#2a2018'; c.fillRect(96, 250, 130, 310); c.strokeStyle = '#3a2a1e'; c.lineWidth = 10; c.strokeRect(96, 250, 130, 310);
      /* 书架：两架，堆满了稿子 */
      [[820, 150], [1340, 150]].forEach((q, k) => { c.fillStyle = '#4a3424'; c.fillRect(q[0], q[1], 420, 330); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(q[0], q[1], 420, 330); for (let j = 0; j < 4; j++) { const sy = q[1] + 14 + j * 80; c.fillStyle = '#2a1c14'; c.fillRect(q[0] + 12, sy, 396, 64); for (let i = 0; i < 9; i++) { const bx = q[0] + 20 + i * 43, n = 2 + Math.floor(r() * 5); for (let m = 0; m < n; m++) { c.fillStyle = P.mix('#d9cfb4', '#b9ad90', r()); c.fillRect(bx, sy + 58 - m * 9, 36, 7); c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = 0.8; c.strokeRect(bx, sy + 58 - m * 9, 36, 7); } } } void k; });
      /* 墙上一幅字 */
      c.fillStyle = '#e9ddc4'; c.fillRect(1784, 170, 96, 280); c.strokeStyle = INK(0.7); c.lineWidth = 1.4; c.strokeRect(1784, 170, 96, 280); P.vtext(c, '守節不屈', 1832, 196, 44, '#2b221c', '600');
      /* 一张窄榻（右下角，走不到） */
      c.fillStyle = '#5a4030'; c.fillRect(1500, 950, 380, 110); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(1500, 950, 380, 110); c.fillStyle = '#8a94a0'; c.fillRect(1512, 958, 356, 70); c.strokeRect(1512, 958, 356, 70); c.fillStyle = '#d9d3c4'; c.beginPath(); c.roundRect(1524, 966, 80, 40, 12); c.fill(); c.stroke();
      P.ao(c, 0, 560, 1920, 50, 'top', 0.32);
      P.paper(c, 1920, 1080, 89, 0.3);
    },
    props: [
      /* 书案：灯、砚、摞得很高的书稿 */
      { x: 1180, y: 730, bw: 480, bh: 200, block: [-230, -70, 460, 74], draw(g) {
        P.table(g, 0, 0, 440, 60, 56, { col: '#5a3a26', seed: 31 });
        [[-180, 6], [-120, 9], [120, 5], [176, 8]].forEach(q => { for (let m = 0; m < q[1]; m++) { g.fillStyle = P.mix('#e2d8be', '#c2b698', (m % 3) / 3); g.fillRect(q[0] - 24, -122 - m * 7, 48, 6); g.strokeStyle = 'rgba(40,30,20,0.6)'; g.lineWidth = 0.8; g.strokeRect(q[0] - 24, -122 - m * 7, 48, 6); } });
        g.fillStyle = '#ece4d0'; g.fillRect(-60, -124, 110, 8); g.strokeStyle = INK(0.7); g.lineWidth = 1; g.strokeRect(-60, -124, 110, 8); for (let i = 0; i < 9; i++) P.line(g, -50 + i * 11, -122, -50 + i * 11, -118, 1, 'rgba(43,34,28,0.6)');
        P.ellipse(g, 76, -120, 14, 6, '#2a2420', INK(), 1); P.line(g, 92, -124, 108, -150, 2.4, '#5a4030');
        P.line(g, 58, -118, 58, -166, 3, '#6a4a30'); P.ellipse(g, 58, -166, 9, 4, '#8a6a3a', INK(), 1); g.fillStyle = '#ffe8a8'; g.beginPath(); g.ellipse(58, -176, 4, 9, 0, 0, 6.3); g.fill();
      } },
      { x: 300, y: 660, bw: 110, bh: 190, block: [-20, -12, 40, 16], draw(g) { P.potted(g, 0, 0, 1.5, 'bamboo', { stand: 44, seed: 51 }); } },
      { x: 700, y: 660, bw: 110, bh: 170, block: [-20, -12, 40, 16], draw(g) { P.potted(g, 0, 0, 1.4, 'orchid', { stand: 36, seed: 52 }); } },
    ],
    anim(c, t) {
      const f = 0.75 + 0.25 * Math.sin(t * 8) * Math.sin(t * 3.1); c.fillStyle = 'rgba(255,232,168,' + (0.5 * f) + ')'; c.beginPath(); c.ellipse(1238, 554, 5, 11 * f, 0, 0, 6.3); c.fill();
      const W = JX.world; if (W.blaze) { const k = Math.min(1, (t - W.blaze) / 1.2), fk = 0.7 + 0.3 * Math.sin(t * 11) * Math.sin(t * 4.3); c.fillStyle = 'rgba(255,110,40,' + (0.62 * k * fk) + ')'; c.fillRect(386, 176, 288, 208); const g = c.createRadialGradient(530, 300, 40, 530, 300, 620); g.addColorStop(0, 'rgba(255,120,50,' + (0.3 * k * fk) + ')'); g.addColorStop(1, 'rgba(255,120,50,0)'); c.fillStyle = g; c.fillRect(0, 0, 1300, 1000); }
    },
  };

  JX.scenes8 = { tent, palisade, rack, cauldron, chevaux, flag };
})();
