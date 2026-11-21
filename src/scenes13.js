/* 第四章《望海潮》的场景（一）：钱塘江堤（jiangdi）。
   从西头六和塔底下一直到东头的观潮台，一条长堤：江在上头，堤面当中是路，靠江一侧站满了看潮的人（画在底图里，背对着我们），靠里一侧是柳树和看棚。
   第三场从西往东走一遍（水军、弄潮儿、老道的摊子），第四场在东头观潮台前。白绫是一件会变的东西（字是一个一个写上去的），所以做成场景里的一个人物位（setup 里放）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C, Fig = JX.Fig;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };
  const text = (c, t, x, y, px, col) => { c.fillStyle = col || '#2b221c'; c.font = '600 ' + px + 'px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x, y); };
  const DW = 4400, HZ = 250, RY = 560, TOP = 644;
  const LING = { x0: 3300, n: 14, cw: 74, y: 654, text: '东南形胜三吴都会钱塘自古繁华' };      // 白绫：十四个字，一个字一格
  const TAI = { x0: 3420, x1: 4220, deck: 510 };
  const SHIPS = []; for (let k = 0; k < 2; k++) for (let i = 0; i < 6; i++) SHIPS.push({ x: 760 + i * 150 + k * 60, y: 356 + k * 84, s: 0.5 + k * 0.2 });
  const TB = [[3070, 366, 0.64], [4316, 384, 0.56]];                 // 东头江心等着论潮的两条大船（别停在观潮台正后头，旗会压到匾上）
  const GAP = [1690, 2330];                                          // 堤上留出来的一段：从这里下到沙滩，弄潮儿站在滩上

  /* 一条战船：船身、女墙上一排圆牌、一根桅（旗另画，会飘） */
  function warship(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(40,60,60,0.25)'; c.beginPath(); c.ellipse(4, 16, 136, 8, 0, 0, 6.3); c.fill();
    c.fillStyle = P.vgrad(c, 0, -34, 48, [[0, '#6a4c34'], [1, '#33241a']]); poly(c, [[-124, -22], [-104, 12], [96, 12], [134, -36], [100, -20], [-96, -18]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.8; c.stroke();
    c.fillStyle = '#7a5a3c'; c.fillRect(-92, -36, 182, 17); c.strokeRect(-92, -36, 182, 17);
    for (let i = 0; i < 8; i++) P.ellipse(c, -80 + i * 23, -27, 7, 7, i % 2 ? '#a8362a' : '#c9a24a', INK(0.8), 1);
    P.line(c, 4, -36, 4, -156, 5, '#3e2e20'); c.fillStyle = '#9a8660'; c.fillRect(-40, -126, 88, 10); c.strokeRect(-40, -126, 88, 10);
    for (let i = 0; i < 6; i++) P.line(c, -70 + i * 26, 0, -80 + i * 26, 22, 2, 'rgba(50,36,24,0.8)');
    c.restore();
  }
  /* 六和塔：七层，越往上越收 */
  function pagoda(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    let w = 84, yy = 0;
    for (let i = 0; i < 7; i++) {
      const h = 34 - i * 2, w2 = w - 8;
      c.fillStyle = i % 2 ? '#8e6048' : '#7c503c'; c.fillRect(-w2 / 2, yy - h, w2, h); c.strokeStyle = INK(0.8); c.lineWidth = 1.2; c.strokeRect(-w2 / 2, yy - h, w2, h);
      c.fillStyle = 'rgba(24,16,12,0.65)'; c.fillRect(-4, yy - h + 9, 8, h - 11);
      c.fillStyle = '#2e2a28'; poly(c, [[-w / 2 - 14, yy - h + 4], [-w2 / 2 + 2, yy - h - 8], [w2 / 2 - 2, yy - h - 8], [w / 2 + 14, yy - h + 4]]); c.fill(); c.stroke();
      yy -= h + 7; w = w2;
    }
    P.line(c, 0, yy + 2, 0, yy - 36, 3.4, '#3a332c'); P.ellipse(c, 0, yy - 38, 4.5, 6, '#c9a24a', INK(0.8), 1);
    c.restore();
  }
  /* 观潮台：杉木搭的高台，台面比堤面高出大半个人，台口披红绸，后头一排旗 */
  function tai(c) {
    const x0 = TAI.x0, x1 = TAI.x1, d = TAI.deck, r = JX.rng(1331);
    c.strokeStyle = INK(); c.lineWidth = 1.8;
    const cols = ['#a8362a', '#c9a24a', '#2e5a66', '#a8362a', '#6a4a86', '#c9a24a', '#a8362a'];
    cols.forEach((col, i) => { const x = x0 + 60 + i * (x1 - x0 - 120) / 6; P.line(c, x, d - 60, x, d - 330, 5, '#4a3a2a'); c.fillStyle = col; poly(c, [[x + 4, d - 326], [x + 54, d - 318], [x + 50, d - 150], [x + 30, d - 168], [x + 4, d - 150]]); c.fill(); c.stroke(); });      // 后头的旗
    c.fillStyle = '#3a2a1e'; c.fillRect(x0 + 250, d - 268, x1 - x0 - 500, 78); c.strokeRect(x0 + 250, d - 268, x1 - x0 - 500, 78); c.strokeStyle = '#c9a24a'; c.lineWidth = 2; c.strokeRect(x0 + 258, d - 260, x1 - x0 - 516, 62);
    '钱塘论潮'.split('').forEach((ch, i) => text(c, ch, x0 + 250 + (x1 - x0 - 500) * (i + 0.5) / 4, d - 228, 52, '#f0dca8'));                                                              // 台后的匾
    c.strokeStyle = INK(); c.lineWidth = 1.8;
    [x0 + 250, x1 - 250].forEach(x => { c.fillStyle = '#5a3f2c'; c.fillRect(x - 8, d - 268, 16, 210); c.strokeRect(x - 8, d - 268, 16, 210); });
    c.fillStyle = P.vgrad(c, 0, d - 64, 64, [[0, '#a8845a'], [1, '#806040']]); poly(c, [[x0 + 34, d - 64], [x1 - 34, d - 64], [x1, d], [x0, d]]); c.fill(); c.stroke();      // 台面
    for (let i = 1; i < 8; i++) P.line(c, x0 + 34 + (x1 - x0 - 68) * i / 8, d - 64, x0 + (x1 - x0) * i / 8, d, 1, 'rgba(50,34,20,0.4)');
    for (let x = x0 + 44; x < x1 - 30; x += 60) { c.fillStyle = '#6a4a30'; c.fillRect(x - 3, d - 96, 6, 34); } P.line(c, x0 + 38, d - 96, x1 - 38, d - 96, 4, '#6a4a30'); P.line(c, x0 + 38, d - 80, x1 - 38, d - 80, 2.4, '#6a4a30');      // 后栏
    for (let x = x0 + 16; x <= x1 - 10; x += (x1 - x0 - 30) / 8) { c.fillStyle = P.hgrad(c, x - 10, 0, 20, [[0, '#5a3f28'], [0.5, '#7a5a3a'], [1, '#4a3320']]); c.fillRect(x - 10, d + 14, 20, TOP - d - 8); c.strokeRect(x - 10, d + 14, 20, TOP - d - 8); }      // 台脚
    c.fillStyle = '#5a3f28'; c.fillRect(x0, d, x1 - x0, 16); c.strokeRect(x0, d, x1 - x0, 16);
    for (let i = 0; i < 7; i++) { const sx = x0 - 20 - i * 19, sy = d + i * 19; c.fillStyle = P.mix('#8a6a46', '#6a4e32', i / 7); c.fillRect(sx - 26, sy, 46, TOP - sy + 2); c.strokeRect(sx - 26, sy, 46, TOP - sy + 2); }      // 台左下来的木梯
    c.fillStyle = '#b8362a'; c.beginPath(); c.moveTo(x0, d + 16); for (let x = x0; x < x1; x += 100) c.quadraticCurveTo(x + 50, d + 92 + r() * 10, Math.min(x1, x + 100), d + 16); c.closePath(); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.stroke();      // 红绸
    for (let x = x0; x <= x1; x += 100) { P.ellipse(c, x, d + 20, 9, 9, '#c9a24a', INK(0.8), 1.2); P.line(c, x, d + 28, x, d + 60, 3, '#b8362a'); }
    /* 台右一面大锣，台左一张放笔墨的条案 */
    c.strokeStyle = INK(); c.lineWidth = 1.6; P.line(c, x1 - 120, d - 22, x1 - 120, d - 150, 5, '#4a3a2a'); P.line(c, x1 - 60, d - 22, x1 - 60, d - 150, 5, '#4a3a2a'); P.line(c, x1 - 126, d - 148, x1 - 54, d - 148, 5, '#4a3a2a'); P.ellipse(c, x1 - 90, d - 96, 30, 34, '#c9a24a', INK(), 1.6); P.ellipse(c, x1 - 90, d - 96, 12, 14, '#e3c98a');
    c.fillStyle = '#6a4a32'; c.fillRect(x0 + 90, d - 58, 150, 12); c.strokeRect(x0 + 90, d - 58, 150, 12); c.fillRect(x0 + 98, d - 46, 8, 28); c.fillRect(x0 + 224, d - 46, 8, 28); P.ellipse(c, x0 + 130, d - 62, 20, 8, '#2b221c', INK(), 1.2); c.fillStyle = '#f4eedc'; c.fillRect(x0 + 164, d - 66, 56, 8);
  }
  /* 堤上看潮的人：背对着我们的一排，画进底图里 */
  function crowd(c) {
    const r = JX.rng(1341), umb = ['#a8362a', '#c9a24a', '#4f6b8a', '#6e8a5a'];
    for (let row = 0; row < 2; row++) {
      for (let x = 70 + row * 22; x < DW - 40; x += 40 + r() * 16) {
        if ((x > GAP[0] && x < GAP[1]) || (x > LING.x0 - 90 && x < LING.x0 + LING.n * LING.cw + 60)) continue;
        const sp = Fig.extra(4000 + Math.floor(x) + row * 7), y = 616 + row * 22 + r() * 6;
        c.save(); c.translate(x, y); const k = 0.9 + row * 0.06; c.scale(k, k); Fig.draw(c, sp, 2, r() * 6, { shadow: row === 1 });
        if (r() < 0.07) { P.line(c, 14, -80, 14, -214, 3, '#4a3a2a'); c.fillStyle = umb[Math.floor(r() * 4)]; c.beginPath(); c.moveTo(-50, -206); c.quadraticCurveTo(14, -262, 78, -206); c.closePath(); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.2; c.stroke(); }      // 有几把遮日头的伞
        c.restore();
      }
    }
  }
  /* 白绫：绷在一排木架上；W.lingN 是写到第几个字（可以带小数，最后那个字淡淡地出来） */
  function drawLing(g) {
    const W = JX.world, w = LING.n * LING.cw, n = W.lingN || 0;
    for (let x = -14; x <= w + 14; x += (w + 28) / 6) { g.fillStyle = '#6a4a30'; g.fillRect(x - 5, -186, 10, 186); g.strokeStyle = INK(); g.lineWidth = 1.2; g.strokeRect(x - 5, -186, 10, 186); P.shadow(g, x, 0, 16, 5, 0.3); }
    P.line(g, -18, -182, w + 18, -182, 5, '#6a4a30'); P.line(g, -18, -56, w + 18, -56, 4, '#6a4a30');
    g.fillStyle = P.vgrad(g, 0, -176, 116, [[0, '#fbf8ee'], [1, '#e9e3d0']]); g.fillRect(0, -176, w, 116); g.strokeStyle = INK(0.7); g.lineWidth = 1.4; g.strokeRect(0, -176, w, 116);
    for (let i = 1; i < 6; i++) P.line(g, w * i / 6, -176, w * i / 6 + 3, -60, 1, 'rgba(120,110,90,0.18)');
    g.font = '600 70px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < LING.n; i++) { const a = Math.max(0, Math.min(1, n - i)); if (a <= 0) break; g.fillStyle = 'rgba(18,14,12,' + (0.94 * a) + ')'; g.fillText(LING.text[i], LING.cw * (i + 0.5), -116); }
  }
  /* 弄潮儿：赤膊，披发，手里一面彩旗（旗会飘） */
  const NONG = i => ({ h: 142 + (i % 3) * 5, kind: 'short', robe: '#c99a72', trim: '#b08058', inner: '#c99a72', pants: ['#39424a', '#4a3a30', '#2e4a4a'][i % 3], hair: 'beggar', hairCol: '#1a1512', skin: '#c99a72', bare: true, sash: '#b8362a' });
  const FLAGS = ['#b8362a', '#c9a24a', '#2e7a86', '#e9e3d0', '#7a4a86', '#3f8a5a'];
  function drawNong(g, e) {
    const t = JX.time * 3 + e.k * 1.7, col = FLAGS[e.k % FLAGS.length], sx = e.dir === 1 ? -1 : 1;
    Fig.draw(g, e.sp, e.dir, e.ph, { shadow: true, idle: Math.sin(JX.time * 1.1 + e.k) });
    g.save(); g.scale(sx, 1); P.line(g, 20, -78, 30, -250, 3.4, '#5a4630');
    g.fillStyle = col; g.beginPath(); g.moveTo(30, -250); for (let i = 1; i <= 6; i++) g.lineTo(30 + i * 13, -248 + Math.sin(t + i * 0.9) * 5 * (i / 6)); for (let i = 6; i >= 0; i--) g.lineTo(30 + i * 13, -196 + Math.sin(t + i * 0.9 + 0.6) * 5 * (i / 6)); g.closePath(); g.fill(); g.strokeStyle = INK(0.75); g.lineWidth = 1.2; g.stroke();
    g.restore();
  }

  S.jiangdi = {
    name: '钱塘江堤', sub: '八月十八 · 观潮', w: DW, h: 1080, ambient: '#e2dccb', music: 'jiangxiao', outside: '#1c2026', amb: ['shi', 0.26], step: 'cao',
    walk: [[90, 668, DW - 150, 884]],
    spawns: { start: { x: 540, y: 790, dir: 3 }, tai: { x: 3460, y: 830, dir: 2 } },
    exits: [],
    blocks: [[LING.x0 - 24, 640, LING.n * LING.cw + 48, 30]],
    lights: [{ x: 3800, y: 220, r: 2400, c: '#fff0d0', a: 0.5, ey: 0.6 }, { x: 1300, y: 420, r: 2300, c: '#ffeccb', a: 0.36, ey: 0.6 }],
    marks: [{ t: '六和塔', x: 330, y: 96 }, { t: '水军', x: 1150, y: 300 }, { t: '弄潮儿', x: 2010, y: 430 }, { t: '观潮台', x: 3820, y: 160 }],
    paint(c) {
      const r = JX.rng(1301);
      /* 天、对岸的山、江 */
      c.fillStyle = P.vgrad(c, 0, 0, HZ + 10, [[0, '#9dbacd'], [0.6, '#dfe0cf'], [1, '#f6e6bc']]); c.fillRect(0, 0, DW, HZ + 10);
      P.glow(c, 4100, 150, 420, '#fff2c8', 0.75); P.ellipse(c, 4100, 150, 44, 44, '#fff7dc');
      [[700, 90, 520], [1900, 60, 620], [3000, 120, 480]].forEach(q => { c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(q[0], q[1], q[2], 20, 0, 0, 6.3); c.fill(); });
      P.hills(c, 0, HZ + 6, DW, 80, { seed: 1302, layers: 2, col: '#7f9896', far: '#b9c8c8', mist: true, trees: false });
      c.fillStyle = P.vgrad(c, 0, HZ, RY - HZ, [[0, '#cfd6c6'], [0.4, '#9fb5ae'], [1, '#6f9190']]); c.fillRect(0, HZ, DW, RY - HZ + 10);
      for (let i = 0; i < 260; i++) { const y = HZ + 8 + r() * (RY - HZ - 14), x = r() * DW, k = (y - HZ) / (RY - HZ); P.line(c, x, y, x + 20 + r() * (60 + k * 80), y, 1 + k * 0.6, 'rgba(250,252,246,' + (0.12 + r() * 0.2) + ')'); }
      /* 西头：月轮山和六和塔 */
      c.fillStyle = P.vgrad(c, 0, 150, 420, [[0, '#6f8a6e'], [1, '#4a6654']]); c.beginPath(); c.moveTo(0, 250); c.quadraticCurveTo(200, 150, 400, 236); c.quadraticCurveTo(560, 300, 700, RY + 6); c.lineTo(0, RY + 6); c.closePath(); c.fill(); c.strokeStyle = INK(0.6); c.lineWidth = 1.6; c.stroke();
      for (let i = 0; i < 70; i++) { const x = r() * 620, y = 230 + r() * 320; if (y < 250 + (x > 400 ? (x - 400) * 1.05 : 0) - (x < 400 ? 60 : 0)) continue; P.ellipse(c, x, y, 20 + r() * 22, 13 + r() * 10, P.mix('#4f7058', '#7a9870', r()), 'rgba(30,44,34,0.35)', 1); }
      pagoda(c, 330, 252, 0.92);
      /* 水军的战船，两列；东头江心另有几条等着论潮的大船 */
      SHIPS.slice().sort((a, b) => a.y - b.y).forEach(q => warship(c, q.x, q.y, q.s));
      TB.forEach(q => warship(c, q[0], q[1], q[2]));
      /* 弄潮儿站的那一片沙滩，和下去的石阶 */
      c.fillStyle = P.vgrad(c, 0, 500, 80, [[0, '#d9cda8'], [1, '#c2b48c']]); c.beginPath(); c.moveTo(GAP[0] - 60, RY + 20); c.quadraticCurveTo(GAP[0] + 80, 488, 2010, 492); c.quadraticCurveTo(GAP[1] - 80, 488, GAP[1] + 60, RY + 20); c.closePath(); c.fill(); c.strokeStyle = 'rgba(250,252,246,0.7)'; c.lineWidth = 3; c.stroke();
      for (let i = 0; i < 60; i++) P.ellipse(c, GAP[0] + 40 + r() * (GAP[1] - GAP[0] - 80), 512 + r() * 56, 2 + r() * 3, 1.2, 'rgba(120,104,70,0.35)');
      /* 石塘 */
      c.fillStyle = P.vgrad(c, 0, RY, TOP - RY, [[0, '#9a9d96'], [1, '#6c706a']]); c.fillRect(0, RY, DW, TOP - RY + 4);
      for (let x = 0; x < DW; x += 78) P.line(c, x + r() * 16, RY + 2, x + r() * 16, TOP, 1.2, 'rgba(30,34,32,0.45)'); [RY + 28, RY + 56].forEach(y => P.line(c, 0, y, DW, y, 1.2, 'rgba(30,34,32,0.35)'));
      for (let i = 0; i < 6; i++) { c.fillStyle = P.mix('#b4b6ac', '#8a8d86', i / 6); c.fillRect(GAP[0] + 30, RY + i * 14, GAP[1] - GAP[0] - 60, 15); c.strokeStyle = 'rgba(30,34,32,0.4)'; c.lineWidth = 1; c.strokeRect(GAP[0] + 30, RY + i * 14, GAP[1] - GAP[0] - 60, 15); }
      /* 观潮台（在人群和白绫后头） */
      tai(c);
      /* 堤面：土、当中一条石板路、两边的草 */
      P.earth(c, 0, TOP, DW, 1080 - TOP, { seed: 1303, col: '#bfae86' });
      c.save(); poly(c, [[0, 742], [900, 730], [2200, 748], [3400, 734], [DW, 744], [DW, 836], [3400, 850], [2200, 838], [900, 852], [0, 838]]); c.clip(); P.tiles(c, 0, 720, DW, 140, { seed: 1304, s: 74, col: '#aaa99c', bond: true }); c.restore();
      for (let i = 0; i < 9; i++) { const x = 120 + i * 500 + r() * 120, w = 300 + r() * 160; P.patch(c, x + w / 2, 1000, w / 2, 70, 1310 + i, () => P.grass(c, x, 930, w, 140, { seed: 1320 + i, dry: i % 3 === 1 })); }
      for (let i = 0; i < 12; i++) { const x = 200 + i * 360 + r() * 100; P.patch(c, x, 690, 90, 16, 1340 + i, () => P.grass(c, x - 90, 674, 180, 32, { seed: 1350 + i })); }
      crowd(c);
      /* 白绫两头各一杆大旗 */
      [[LING.x0 - 70, '#a8362a'], [LING.x0 + LING.n * LING.cw + 70, '#c9a24a']].forEach(q => { P.shadow(c, q[0], 660, 18, 6, 0.3); P.line(c, q[0], 660, q[0], 360, 6, '#4a3a2a'); c.fillStyle = q[1]; poly(c, [[q[0] + 4, 366], [q[0] + 66, 374], [q[0] + 62, 520], [q[0] + 36, 500], [q[0] + 4, 520]]); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.6; c.stroke(); });
      P.paper(c, DW, 1080, 131, 0.3);
    },
    props: [
      /* 柳树 */
      { x: 170, y: 972, bw: 330, bh: 330, block: [-14, -10, 28, 14], draw(g) { P.tree(g, 0, 0, 1.0, 'willow', { seed: 1361 }); } },
      { x: 1180, y: 990, bw: 330, bh: 330, block: [-14, -10, 28, 14], draw(g) { P.tree(g, 0, 0, 1.05, 'willow', { seed: 1362 }); } },
      { x: 2420, y: 972, bw: 330, bh: 330, block: [-14, -10, 28, 14], draw(g) { P.tree(g, 0, 0, 0.96, 'willow', { seed: 1363 }); } },
      { x: 3060, y: 996, bw: 330, bh: 330, block: [-14, -10, 28, 14], draw(g) { P.tree(g, 0, 0, 1.04, 'willow', { seed: 1364 }); } },
      { x: 4250, y: 980, bw: 330, bh: 330, block: [-14, -10, 28, 14], draw(g) { P.tree(g, 0, 0, 1.0, 'willow', { seed: 1365 }); } },
      { x: 1640, y: 1040, bw: 260, bh: 250, draw(g) { P.tree(g, 0, 0, 0.8, 'round', { seed: 1366 }); } },
      /* 看棚：竹架子、席顶，底下一排坐着看的人（背对着我们） */
      { x: 760, y: 1078, bw: 470, bh: 190, draw(g) { shed(g, 430, 1371); } },
      { x: 2040, y: 1078, bw: 470, bh: 190, draw(g) { shed(g, 430, 1372); } },
      { x: 2760, y: 1078, bw: 380, bh: 190, draw(g) { shed(g, 340, 1373); } },
      /* 老道的摊子：一张小桌、一把旧伞、一摞图 */
      { x: 2620, y: 716, bw: 220, bh: 250, block: [-66, -22, 132, 26], draw(g) {
        P.line(g, 60, 0, 52, -226, 5, '#5a4630'); g.fillStyle = '#8a8266'; g.beginPath(); g.moveTo(-58, -200); g.quadraticCurveTo(52, -262, 150, -196); g.lineTo(52, -218); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke(); for (let i = -2; i <= 2; i++) P.line(g, 52, -238, 52 + i * 44, -198, 1, 'rgba(40,34,20,0.5)'); g.fillStyle = 'rgba(60,54,36,0.5)'; g.fillRect(10, -214, 30, 9);      // 伞上一块补丁
        P.shadow(g, 0, 0, 70, 12, 0.35); g.fillStyle = '#6a4a32'; g.fillRect(-60, -62, 120, 12); g.strokeRect(-60, -62, 120, 12); g.fillRect(-54, -50, 8, 50); g.fillRect(46, -50, 8, 50); g.strokeRect(-54, -50, 8, 50); g.strokeRect(46, -50, 8, 50);
        for (let i = 0; i < 5; i++) { g.fillStyle = i === 4 ? '#f4eedc' : '#e6dec6'; g.fillRect(-40 + i, -72 - i * 2.4, 64, 10); g.strokeStyle = INK(0.6); g.lineWidth = 1; g.strokeRect(-40 + i, -72 - i * 2.4, 64, 10); } g.strokeStyle = 'rgba(46,90,102,0.8)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-30, -78); g.quadraticCurveTo(-10, -86, 6, -78); g.quadraticCurveTo(14, -74, 22, -80); g.stroke(); P.ellipse(g, 40, -70, 9, 6, '#3a3632', INK(), 1);
      } },
      /* 卖茶的担子、卖糕的案子 */
      { x: 1420, y: 708, bw: 210, bh: 150, block: [-70, -20, 140, 24], draw(g) { P.shadow(g, 0, 0, 80, 12, 0.32); [-50, 50].forEach(x => { g.fillStyle = '#8a6a44'; g.beginPath(); g.ellipse(x, -22, 30, 22, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke(); for (let k = -2; k <= 2; k++) P.line(g, x - 28, -22 + k * 7, x + 28, -22 + k * 7, 1, 'rgba(40,28,12,0.4)'); }); P.line(g, -70, -84, 70, -84, 5, '#6a5238'); P.line(g, -50, -84, -50, -40, 1.6, '#3a2a1e'); P.line(g, 50, -84, 50, -40, 1.6, '#3a2a1e'); P.ellipse(g, -50, -46, 22, 8, '#c9d6d8', INK(), 1.2); for (let i = 0; i < 4; i++) P.ellipse(g, 34 + i * 10, -48, 5, 4, '#e9e3d0', INK(0.7), 1); } },
      { x: 2960, y: 706, bw: 200, bh: 170, block: [-64, -20, 128, 24], draw(g) { P.shadow(g, 0, 0, 74, 12, 0.32); g.fillStyle = '#6a4a32'; g.fillRect(-64, -64, 128, 12); g.strokeStyle = INK(); g.lineWidth = 1.4; g.strokeRect(-64, -64, 128, 12); g.fillRect(-58, -52, 8, 52); g.fillRect(50, -52, 8, 52); P.steamer(g, -22, -66, 30, 3); for (let i = 0; i < 5; i++) P.ellipse(g, 20 + (i % 3) * 16, -70 - Math.floor(i / 3) * 9, 8, 5, '#f0e2b8', INK(0.7), 1); P.line(g, 64, 0, 64, -150, 4, '#5a4630'); g.fillStyle = '#a8362a'; g.fillRect(40, -150, 44, 60); g.strokeRect(40, -150, 44, 60); P.vtext(g, '糕', 62, -132, 30, '#f3e6c4'); } },
    ],
    setup(W) { W.lingN = W.lingN || 0; W.add('ling', { h: 1 }, LING.x0, LING.y, { solid: false, draw: drawLing }); for (let i = 0; i < 6; i++) { const e = W.add('nong' + i, NONG(i), 1780 + i * 92 + (i % 2) * 14, 534 + (i % 3) * 9, { dir: [2, 3, 0, 1, 2, 0][i], solid: false, draw: drawNong }); e.k = i; } },
    under(c, t) {
      for (let i = 0; i < 26; i++) { const y = HZ + 14 + (i * 37) % (RY - HZ - 30), x = (i * 331 + t * (5 + (i % 4) * 3)) % (DW + 200) - 100; P.line(c, x, y, x + 40 + (i % 5) * 16, y, 1.2, 'rgba(250,252,246,0.22)'); }
      const flag = (x, y, s, col, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y); for (let i = 1; i <= 5; i++) c.lineTo(x + i * 9 * s, y + 1 + Math.sin(t * 3 + ph + i) * 3 * s * (i / 5)); for (let i = 5; i >= 0; i--) c.lineTo(x + i * 9 * s, y + 18 * s + Math.sin(t * 3 + ph + i + 0.5) * 3 * s * (i / 5)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(43,34,28,0.6)'; c.lineWidth = 1; c.stroke(); };
      SHIPS.forEach((q, i) => flag(q.x + 6 * q.s, q.y - 156 * q.s, q.s * 1.5, '#b8362a', i));                    // 桅上的旗，一色朝东
      TB.forEach((q, i) => flag(q[0] + 6 * q[2], q[1] - 156 * q[2], q[2] * 1.6, ['#c9a24a', '#2e7a86'][i], i * 2));
    },
  };
  /* 看棚 */
  function shed(g, w, seed) {
    const r = JX.rng(seed), hw = w / 2;
    for (let x = -hw + 10; x <= hw - 10; x += (w - 20) / 3) { g.fillStyle = '#7a8a4e'; g.fillRect(x - 5, -150, 10, 150); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.strokeRect(x - 5, -150, 10, 150); }
    g.fillStyle = '#6a4a32'; g.fillRect(-hw + 24, -30, w - 48, 12); g.strokeRect(-hw + 24, -30, w - 48, 12);
    for (let x = -hw + 60; x < hw - 50; x += 56 + r() * 10) { g.save(); g.translate(x, -4); Fig.draw(g, Fig.extra(seed * 3 + Math.floor(x)), 2, 0.5, { pose: 'sit', seat: 30, shadow: false }); g.restore(); }
    g.fillStyle = P.vgrad(g, 0, -186, 44, [[0, '#c2ac7c'], [1, '#9a8458']]); poly(g, [[-hw - 14, -142], [-hw + 16, -184], [hw - 16, -184], [hw + 14, -142]]); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
    for (let i = 1; i < 12; i++) P.line(g, -hw + 16 + (w - 32) * i / 12, -184, -hw - 14 + (w + 28) * i / 12, -142, 1, 'rgba(60,44,24,0.4)');
  }
  JX.scenes13 = { LING, TAI, GAP, DW, drawLing };
})();
