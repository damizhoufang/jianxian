/* 第二章末四场的场景：江边·黎明（jiangbian）；另给馆舍和营内两个老场景添了第九、十场要用的东西
   （馆舍：一口水缸、起火的画法；营内：出营的侧门、烧过以后的烟）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };

  /* 一簇火：底边中点在 (x, y)，宽 w、高 h。画在“加亮”那一层里才亮。 */
  function flame(c, x, y, w, h, t, seed) {
    const n = Math.max(3, Math.round(w / 28));
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n, px = x - w / 2 + k * w, ph = seed * 1.7 + i * 2.1;
      const hh = h * (0.6 + 0.4 * Math.sin(t * 7 + ph) * Math.sin(t * 3.3 + ph * 0.7)) * (0.65 + 0.35 * Math.sin(k * Math.PI));
      const sway = Math.sin(t * 5 + ph) * w * 0.05, bw = (w / n) * 0.95;
      const g = c.createLinearGradient(0, y, 0, y - hh); g.addColorStop(0, 'rgba(255,226,140,0.95)'); g.addColorStop(0.4, 'rgba(255,140,40,0.85)'); g.addColorStop(1, 'rgba(200,40,10,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(px - bw, y); c.quadraticCurveTo(px - bw * 0.9, y - hh * 0.5, px + sway, y - hh); c.quadraticCurveTo(px + bw * 0.9, y - hh * 0.5, px + bw, y); c.closePath(); c.fill();
    }
  }
  /* 一股烟：从 (x, y) 往上飘 */
  function smoke(c, x, y, t, seed, a) {
    for (let i = 0; i < 7; i++) { const k = (t * 0.12 + i / 7 + seed * 0.13) % 1; c.fillStyle = 'rgba(40,36,34,' + ((a || 0.34) * (1 - k)) + ')'; c.beginPath(); c.ellipse(x + Math.sin(k * 5 + i + seed) * 26 + k * 40, y - k * 300, 18 + k * 46, 14 + k * 30, 0, 0, 6.3); c.fill(); }
  }

  /* ================= 江边 · 黎明 ================= */
  const SUN = [1480, 404];
  S.jiangbian = {
    name: '江边', sub: '真州渡 · 黎明', w: 2400, h: 1080, ambient: '#c9bcb8', music: 'jiangxiao', outside: '#1c1e26',
    walk: [[100, 650, 2300, 900], [1904, 560, 2016, 672]],
    spawns: { start: { x: 240, y: 790, dir: 3 } },
    exits: [{ id: 'boat', x: 1916, y: 566, w: 88, h: 44, label: '渡船', lx: 1960, ly: 520, back: [0, 40] }],
    lights: [{ x: 1480, y: 420, r: 1700, c: '#ffe2bc', a: 0.55, ey: 0.6 }, { x: 600, y: 300, r: 1400, c: '#b8c4e0', a: 0.35, ey: 0.6 }],
    paint(c) {
      /* 天：上头还是青灰的，水天相接的地方已经红了 */
      c.fillStyle = P.vgrad(c, 0, 0, 410, [[0, '#5d6f8e'], [0.5, '#a9a6b4'], [0.82, '#eabf9e'], [1, '#f6d6a4']]); c.fillRect(0, 0, 2400, 410);
      const r = JX.rng(911);
      for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(244,246,255,' + (0.1 + r() * 0.3) + ')'; c.fillRect(r() * 2400, r() * 170, 1.6, 1.6); }                    // 没退完的几颗星
      [[300, 150, 380], [980, 96, 460], [1700, 170, 420], [2200, 110, 300], [1320, 250, 520], [600, 268, 360]].forEach((q, i) => { c.fillStyle = i < 4 ? 'rgba(232,206,206,0.45)' : 'rgba(255,214,170,0.55)'; c.beginPath(); c.ellipse(q[0], q[1], q[2], 13 + (i % 3) * 5, 0, 0, 6.3); c.fill(); });
      const sg = c.createRadialGradient(SUN[0], SUN[1], 10, SUN[0], SUN[1], 560); sg.addColorStop(0, 'rgba(255,226,170,0.75)'); sg.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = sg; c.fillRect(600, 0, 1800, 410);
      /* 对岸：很低的一线山，罩着雾 */
      { const tc = document.createElement('canvas'); tc.width = 2400; tc.height = 110; const g = tc.getContext('2d');      // 日头出来的那一段水面上没有山：山画在一张小图上，中间一段抹掉，边上是渐渐淡下去的
        P.hills(g, 0, 106, 2400, 96, { seed: 912, layers: 2, col: '#6f8088', far: '#b6bcc6', mist: true, trees: false });
        g.globalCompositeOperation = 'destination-out'; const m = g.createLinearGradient(1000, 0, 2000, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.3, 'rgba(0,0,0,1)'); m.addColorStop(0.7, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = m; g.fillRect(1000, 0, 1000, 110);
        c.drawImage(tc, 0, 298); }
      /* 江 */
      c.fillStyle = P.vgrad(c, 0, 404, 240, [[0, '#e6cfae'], [0.25, '#b9c0c0'], [1, '#7f98a2']]); c.fillRect(0, 404, 2400, 240);
      for (let i = 0; i < 90; i++) { const y = 412 + r() * 220, x = r() * 2400, w = 30 + r() * 110 * ((y - 404) / 240 + 0.3); P.line(c, x, y, x + w, y, 1.2 + r(), 'rgba(250,252,250,' + (0.12 + r() * 0.2) + ')'); }
      c.fillStyle = 'rgba(214,220,222,0.4)'; c.fillRect(0, 398, 2400, 26);                                                    // 水面上一层雾
      /* 江心一片沙洲，长着芦苇 */
      c.fillStyle = '#b9ad8a'; c.beginPath(); c.ellipse(560, 470, 250, 12, 0, 0, 6.3); c.fill(); P.reeds(c, 380, 468, 340, 34, { seed: 913 });
      /* 近岸：沙滩、草坡、往渡口去的土路 */
      c.fillStyle = P.vgrad(c, 0, 630, 80, [[0, '#cdbf9a'], [1, '#b9ae84']]); c.fillRect(0, 630, 2400, 80);
      P.grass(c, 0, 690, 2400, 390, { seed: 914, flowers: true, bare: 6 });
      c.save(); c.beginPath(); c.moveTo(0, 706); for (let x = 0; x <= 2400; x += 60) c.lineTo(x, 690 + Math.sin(x * 0.013) * 8 + Math.sin(x * 0.041) * 4); c.lineTo(2400, 640); c.lineTo(0, 640); c.closePath(); c.fillStyle = '#c6b88f'; c.fill(); c.restore();      // 沙和草的交界，弯弯的
      const road = [[0, 742], [500, 760], [1100, 738], [1700, 716], [1960, 668], [2040, 668], [2060, 760], [1700, 812], [1100, 838], [500, 862], [0, 846]];
      c.save(); poly(c, road); c.clip(); P.earth(c, 0, 650, 2400, 230, { seed: 915, ruts: [800] }); c.restore();
      c.strokeStyle = 'rgba(60,48,30,0.22)'; c.lineWidth = 4; poly(c, road); c.stroke();
      P.shore(c, 0, 632, 2400, { seed: 916, col: '#9c8e6c', dep: 22 });
      for (let i = 0; i < 44; i++) { const x = r() * 2400, y = 648 + r() * 36; P.ellipse(c, x, y, 2.5 + r() * 5, 1.8 + r() * 3, P.mix('#8a8474', '#d6ceb6', r()), INK(0.5), 0.7); }      // 沙滩上的卵石
      /* 水边的芦苇（一丛一丛，中间留着看得见水的豁口） */
      [[40, 150], [330, 120], [640, 190], [1180, 150], [1500, 110], [2120, 220]].forEach((q, i) => P.reeds(c, q[0], 640, q[1], 96 + (i % 3) * 18, { seed: 917 + i }));
      /* 栈桥：几根木桩，一溜木板，伸到水里去 */
      [[1900, 566], [2020, 566], [1900, 620], [2020, 620]].forEach(q => { P.line(c, q[0], q[1] - 26, q[0], q[1] + 30, 9, '#4a3a2a'); P.line(c, q[0], q[1] - 26, q[0], q[1] + 30, 5, '#7a6248'); });
      c.fillStyle = '#9a7c54'; c.fillRect(1900, 556, 120, 122); for (let y = 556; y < 678; y += 17) P.line(c, 1900, y, 2020, y, 1.4, 'rgba(40,28,16,0.5)'); c.strokeStyle = INK(0.8); c.lineWidth = 1.6; c.strokeRect(1900, 556, 120, 122);
      /* 渡船：泊在栈桥头上，篷是旧的 */
      c.save(); c.translate(2190, 574);
      c.fillStyle = 'rgba(40,60,70,0.3)'; c.beginPath(); c.ellipse(0, 22, 176, 12, 0, 0, 6.3); c.fill();
      c.fillStyle = P.vgrad(c, 0, -26, 50, [[0, '#7a5c3c'], [1, '#4a3626']]); c.beginPath(); c.moveTo(-170, -22); c.quadraticCurveTo(-150, 22, -90, 24); c.lineTo(110, 24); c.quadraticCurveTo(170, 18, 186, -30); c.lineTo(120, -18); c.lineTo(-120, -18); c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.8; c.stroke();
      c.fillStyle = '#b4a47c'; c.beginPath(); c.moveTo(-70, -18); c.quadraticCurveTo(-64, -78, 0, -80); c.quadraticCurveTo(64, -78, 70, -18); c.closePath(); c.fill(); c.stroke(); for (let i = -2; i <= 2; i++) P.line(c, i * 24, -78 + Math.abs(i) * 5, i * 28, -18, 1, 'rgba(60,44,24,0.45)');
      P.line(c, 124, -20, 124, -150, 4, '#4a3a2a'); P.line(c, -160, -22, -214, 40, 3, '#5a4630');                         // 桅、桨
      c.restore();
      P.line(c, 2020, 590, 2060, 566, 1.6, '#3a2a1e');                                                                 // 缆
      /* 渡口的木牌 */
      P.line(c, 1846, 596, 1846, 668, 7, '#4a3a2a'); c.fillStyle = '#7a6248'; c.fillRect(1812, 582, 68, 34); c.strokeStyle = INK(); c.lineWidth = 1.4; c.strokeRect(1812, 582, 68, 34); c.fillStyle = '#efe6d0'; c.font = '600 20px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('真州渡', 1846, 600);
      P.flowerbed && [[900, 930, 150], [1560, 960, 120]].forEach((q, i) => P.patch(c, q[0], q[1], q[2], 34, 931 + i, () => P.grass(c, q[0] - q[2], q[1] - 40, q[2] * 2, 80, { seed: 941 + i, flowers: true })));
      P.paper(c, 2400, 1080, 91, 0.3);
    },
    props: [
      { x: 470, y: 652, bw: 330, bh: 360, block: [-16, -10, 32, 14], draw(g) { P.tree(g, 0, 0, 1.0, 'willow', { seed: 61 }); } },
      { x: 1090, y: 676, bw: 150, bh: 80, block: [-52, -16, 104, 22], draw(g) { P.rock(g, -26, 0, 1.3, { seed: 62, col: '#8f918a' }); P.rock(g, 34, 2, 0.9, { seed: 63 }); } },      // 听雪坐的那块石头
      { x: 1600, y: 660, bw: 110, bh: 80, block: [-30, -12, 60, 16], draw(g) { P.rock(g, 0, 0, 1.0, { seed: 64, col: '#9a968a' }); } },
      { x: 2290, y: 664, bw: 300, bh: 330, block: [-16, -10, 32, 14], draw(g) { P.tree(g, 0, 0, 0.9, 'round', { seed: 65, dk: '#4f6a44', lt: '#a9be78' }); } },
      { x: 150, y: 1060, bw: 220, bh: 150, draw(g) { P.reeds(g, -90, 0, 180, 120, { seed: 66 }); } },
      { x: 760, y: 1066, bw: 160, bh: 90, draw(g) { P.bush(g, -30, 0, 1.0, { seed: 67, flower: '#e6b8c8' }); P.rock(g, 44, 0, 0.8, { seed: 68 }); } },
      { x: 2180, y: 1060, bw: 240, bh: 150, draw(g) { P.reeds(g, -100, 0, 200, 110, { seed: 69 }); } },
    ],
    under(c, t) {
      /* 日头：W.dawn 从 0 到 1，一点一点从江面上出来；出来以后水上一条金路 */
      const W = JX.world, k = Math.max(0, Math.min(1, W.dawn || 0));
      c.save(); c.beginPath(); c.rect(0, 0, 2400, 404); c.clip();
      const sy = SUN[1] + 46 - k * 92;
      const g = c.createRadialGradient(SUN[0], sy, 8, SUN[0], sy, 240); g.addColorStop(0, 'rgba(255,238,190,' + (0.5 + 0.4 * k) + ')'); g.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = g; c.fillRect(SUN[0] - 260, sy - 260, 520, 520);
      c.fillStyle = 'rgba(255,' + Math.round(118 + 70 * k) + ',' + Math.round(64 + 60 * k) + ',0.97)'; c.beginPath(); c.arc(SUN[0], sy, 42, 0, 6.3); c.fill();
      c.restore();
      for (let i = 0; i < 16; i++) { const y = 410 + i * 14, w = (20 + i * 9) * (0.3 + 0.7 * k) * (0.8 + 0.2 * Math.sin(t * 2 + i)); c.fillStyle = 'rgba(255,226,160,' + ((0.16 + 0.34 * k) * (1 - i / 22)) + ')'; c.fillRect(SUN[0] - w + Math.sin(t * 1.3 + i * 1.9) * 6, y, w * 2, 3); }
      /* 水纹 */
      for (let i = 0; i < 22; i++) { const y = 424 + (i * 37) % 200, x = (i * 331 + t * (8 + (i % 4) * 3)) % 2500 - 60; P.line(c, x, y, x + 40 + (i % 5) * 14, y, 1.2, 'rgba(250,252,250,0.22)'); }
      /* 一行雁，往北去（W.geese 是它们起飞的时刻） */
      if (W.geese) { const q = Math.min(1, (t - W.geese) / 26); c.strokeStyle = 'rgba(40,40,52,0.8)'; c.lineWidth = 2.2; c.lineCap = 'round'; for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1, n = Math.ceil(i / 2), x = 2300 - q * 2300 + n * 30, y = 250 - q * 150 + side * n * 13 + n * 4, f = Math.sin(t * 6 + i) * 5; c.beginPath(); c.moveTo(x - 9, y - 3 + f); c.lineTo(x, y); c.lineTo(x + 9, y - 3 + f); c.stroke(); } }
    },
  };

  /* ================= 馆舍：一口水缸、一只桶；起火 ================= */
  const G = S.guanshe;
  G.spawns.mid = { x: 950, y: 836, dir: 3 };
  G.props.push({ x: 540, y: 664, bw: 170, bh: 120, block: [-64, -14, 128, 18], draw(g) {
    P.shadow(g, -14, 0, 44, 9, 0.4);
    g.fillStyle = P.hgrad(g, -56, 0, 84, [[0, '#3f352c'], [0.45, '#7a6a58'], [1, '#3a3028']]); g.beginPath(); g.moveTo(-50, -70); g.quadraticCurveTo(-62, -30, -40, 0); g.lineTo(12, 0); g.quadraticCurveTo(34, -30, 22, -70); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke();
    P.ellipse(g, -14, -70, 36, 9, '#2a2622', INK(), 1.4); P.ellipse(g, -14, -69, 30, 6.5, '#5f7a84');                                   // 缸口、水面
    g.fillStyle = '#8a6c48'; g.beginPath(); g.moveTo(34, -34); g.lineTo(62, -34); g.lineTo(58, 0); g.lineTo(38, 0); g.closePath(); g.fill(); g.stroke(); P.line(g, 35, -22, 61, -22, 1.6, '#3a2a1e'); P.line(g, 37, -8, 59, -8, 1.6, '#3a2a1e');      // 木桶
    g.strokeStyle = '#3a2a1e'; g.lineWidth = 2; g.beginPath(); g.moveTo(36, -34); g.quadraticCurveTo(48, -56, 60, -34); g.stroke();
  } });
  const gUnder = G.under, gGlow = G.glow;
  G.under = function (c, t, W) {
    if (gUnder) gUnder.call(this, c, t, W);
    const ch = W.charred || 0;                                              // 烧过的地方是黑的
    if (ch > 0) { c.fillStyle = 'rgba(18,12,9,' + (0.62 * Math.min(1, ch)) + ')'; c.fillRect(1340, 150, 420, 330); c.fillStyle = 'rgba(18,12,9,' + (0.3 * Math.min(1, ch)) + ')'; c.fillRect(1300, 60, 500, 90); }
  };
  G.glow = function (c, t, W) {
    if (gGlow) gGlow.call(this, c, t, W);
    const lv = W.fireLv || 0; if (lv <= 0) return;
    const k = Math.min(1, lv / 6);
    for (let j = 0; j < 4; j++) flame(c, 1550, 150 + 78 + j * 80, 400 * (0.5 + 0.5 * k), 60 + 50 * k, t, j + 1);           // 右边那一架，一层一层都着了
    flame(c, 1550, 484, 430, 110 + 200 * k, t, 9);
    if (lv >= 3) { for (let j = 0; j < 4; j++) flame(c, 1150, 150 + 78 + j * 80, 180 + 220 * (k - 0.4), 50 + 50 * k, t, j + 11); flame(c, 1130, 484, 300, 90 + 150 * k, t, 19); }      // 火往左边那一架爬
    if (lv >= 5) flame(c, 1290, 600, 300, 170, t, 23);                                                                      // 舔到书案了
    if (W.matFire) flame(c, 760, 806, 120, 110, t, 31);                                                                     // 掉在席子上的火把
    const fk = 0.75 + 0.25 * Math.sin(t * 9) * Math.sin(t * 3.7), g = c.createRadialGradient(1500, 380, 40, 1500, 380, 1000);
    g.addColorStop(0, 'rgba(255,130,40,' + (0.2 * (0.5 + k) * fk) + ')'); g.addColorStop(1, 'rgba(255,130,40,0)'); c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
  };

  /* ================= 营内：出营的侧门；烧过以后 ================= */
  const Y = S.ying;
  Y.exits.push({ id: 'out', x: 112, y: 690, w: 46, h: 190, label: '侧门 · 出营', lx: 190, ly: 640, back: [40, 0] });
  const yAnim = Y.anim, yGlow = Y.glow;
  Y.anim = function (c, t, W) {
    if (yAnim) yAnim.call(this, c, t, W);
    if (!W.embers) return;
    smoke(c, 620, 760, t, 1); smoke(c, 1380, 700, t, 4); smoke(c, 300, 600, t, 7, 0.22);
  };
  Y.glow = function (c, t, W) {
    if (yGlow) yGlow.call(this, c, t, W);
    if (!W.embers) return;
    [[560, 792], [640, 770], [690, 796], [1340, 780], [1410, 760], [1440, 794]].forEach((q, i) => { const f = 0.5 + 0.5 * Math.sin(t * (2 + i % 3) + i * 1.9); c.fillStyle = 'rgba(255,110,40,' + (0.5 * f) + ')'; c.beginPath(); c.ellipse(q[0], q[1], 9, 4, 0, 0, 6.3); c.fill(); });      // 没灭透的火星
  };

  JX.scenes9 = { flame, smoke };
})();
