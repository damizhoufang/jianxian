/* 场景（五）：第一章四至七场——北瓦（勾栏、相扑露台）、软红院阑珊的临水小楼、十一年前的陆家书房。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);

  /* ================= 北瓦，正月十六午后 =================
     左手茶棚（团头老癞的交椅摆在棚前），中间两座勾栏（说话、傀儡），右手是半人高的相扑露台，最右是东口。
     人只在棚前的空地上走；露台和围着看的人是一整块，进不去。 */
  function shed(c, x, w, o) {
    const top = 150, eave = 252, base = 540, a = o.a, b = o.b;
    /* 棚里：暗，深处一块亮的布幔 */
    c.fillStyle = P.vgrad(c, x, eave, base - eave, [[0, '#2a211c'], [1, '#4a3a2e']]); c.fillRect(x, eave, w, base - eave);
    if (o.cloth) { c.fillStyle = P.vgrad(c, x, eave + 40, 200, [[0, P.light(o.cloth, 0.1)], [1, P.dark(o.cloth, 0.35)]]); c.fillRect(x + w * 0.2, eave + 44, w * 0.6, 200); c.strokeStyle = INK(0.6); c.lineWidth = 1.2; c.strokeRect(x + w * 0.2, eave + 44, w * 0.6, 200); for (let i = 1; i < 6; i++) P.line(c, x + w * 0.2 + i * w * 0.1, eave + 44, x + w * 0.2 + i * w * 0.1, eave + 244, 1, 'rgba(0,0,0,0.18)'); }
    /* 柱子 */
    const n = Math.max(2, Math.round(w / 170));
    for (let i = 0; i <= n; i++) P.post(c, x + i * (w - 18) / n, eave - 6, 18, base - eave + 6, '#5a3a28');
    /* 棚顶：两色条纹的布 */
    c.save(); c.beginPath(); c.moveTo(x - 26, eave); c.lineTo(x + 34, top); c.lineTo(x + w - 34, top); c.lineTo(x + w + 26, eave); c.closePath(); c.clip();
    for (let i = 0, sx = x - 40; sx < x + w + 40; sx += 46, i++) { c.fillStyle = i % 2 ? a : b; c.beginPath(); c.moveTo(sx, eave); c.lineTo(sx + 20, top); c.lineTo(sx + 66, top); c.lineTo(sx + 46, eave); c.closePath(); c.fill(); }
    c.fillStyle = P.vgrad(c, x, top, eave - top, [[0, 'rgba(255,244,214,0.18)'], [1, 'rgba(0,0,0,0.22)']]); c.fillRect(x - 40, top, w + 80, eave - top);
    c.restore();
    c.strokeStyle = INK(); c.lineWidth = 2; c.beginPath(); c.moveTo(x - 26, eave); c.lineTo(x + 34, top); c.lineTo(x + w - 34, top); c.lineTo(x + w + 26, eave); c.closePath(); c.stroke();
    /* 帐额：一条横幅，下沿剪成波浪 */
    c.fillStyle = o.band || '#8e2a20'; c.beginPath(); c.moveTo(x - 20, eave); c.lineTo(x + w + 20, eave); c.lineTo(x + w + 20, eave + 34);
    for (let sx = x + w + 20; sx > x - 20; sx -= 40) c.quadraticCurveTo(sx - 20, eave + 50, sx - 40, eave + 34);
    c.closePath(); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.stroke();
    if (o.text) { c.fillStyle = '#f3e3b4'; c.font = '600 30px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.text, x + w / 2, eave + 19); }
    P.ao(c, x, base - 40, w, 40, 'bottom', 0.3);
  }
  /* 竖着的招子：一根杆、一面长旗 */
  function flag(c, x, y, h, text, col, tc) {
    P.line(c, x, y - 14, x, y + h + 150, 5, '#4a2f1c');
    c.fillStyle = col; c.beginPath(); c.moveTo(x + 3, y); c.lineTo(x + 50, y + 4); c.lineTo(x + 47, y + h); c.lineTo(x + 26, y + h - 12); c.lineTo(x + 3, y + h + 2); c.closePath(); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.3; c.stroke();
    P.vtext(c, text, x + 26, y + 10, 26, tc || '#f3e3b4', '600');
  }
  S.beiwa = {
    name: '北瓦', sub: '正月十六 · 午后', w: 2800, h: 1080, ambient: '#c2b8a6', music: 'wazi', outside: '#2a2620',
    walk: [[110, 640, 2700, 880]],
    blocks: [[1830, 560, 740, 172]],                                // 露台和围着看的人
    spawns: { start: { x: 230, y: 790, dir: 3 }, stage: { x: 2200, y: 800, dir: 2 } },
    exits: [{ id: 'east', x: 2640, y: 650, w: 60, h: 230, label: '东口 · 抱剑营街', lx: 2560, ly: 610, back: [-34, 0] }],
    marks: [{ t: '相扑露台', x: 2200, y: 170 }],
    lights: [
      { x: 1400, y: 720, r: 2100, c: '#fff1d2', a: 0.75, ey: 0.5 },
      { x: 2200, y: 500, r: 620, c: '#fff6e0', a: 0.5, ey: 0.7 },                         // 露台上亮一些
      { x: 420, y: 520, r: 520, c: '#ffe0b0', a: 0.35, ey: 0.7 },
    ],
    paint(c) {
      const r = JX.rng(1401);
      /* 天：午后的淡青，底下一层暖黄的尘 */
      c.fillStyle = P.vgrad(c, 0, 0, 260, [[0, '#9fbdd2'], [0.6, '#cfdad2'], [1, '#eadcb8']]); c.fillRect(0, 0, 2800, 260);
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,250,236,' + (0.3 + r() * 0.25) + ')'; c.beginPath(); c.ellipse(200 + r() * 2400, 40 + r() * 70, 150 + r() * 200, 10 + r() * 12, 0, 0, 6.3); c.fill(); }
      /* 远处的屋脊 */
      for (let x = -40; x < 2800; x += 210) { const h = 40 + r() * 46; c.fillStyle = P.mix('#6a6f78', '#8b8f92', r()); c.beginPath(); c.moveTo(x, 200); c.lineTo(x + 30, 200 - h); c.lineTo(x + 180, 200 - h); c.lineTo(x + 210, 200); c.closePath(); c.fill(); }
      c.fillStyle = '#7a756a'; c.fillRect(0, 196, 2800, 60);
      /* 地 */
      P.flagstones(c, 0, 540, 2800, 540, { seed: 141 }); c.fillStyle = 'rgba(232,212,170,0.2)'; c.fillRect(0, 540, 2800, 540);
      /* 一溜棚子 */
      shed(c, 70, 520, { a: '#b7a27c', b: '#8f7d5e', band: '#3f5a50', text: '点 茶 · 汤 饼' });
      shed(c, 650, 480, { a: '#a64a3a', b: '#d9c9a0', band: '#8e2a20', text: '小 说 · 讲 史', cloth: '#5a6a80' });
      shed(c, 1190, 500, { a: '#3f6a70', b: '#d9c9a0', band: '#2e4a55', text: '悬 丝 傀 儡', cloth: '#7a3a48' });
      shed(c, 1770, 880, { a: '#8e2a20', b: '#c9a24a', band: '#5a1a14', text: '' });
      /* 茶棚里：两张桌、茶炉、一排茶盏 */
      P.table(c, 240, 530, 150, 40, 40, { col: '#6a4a32', seed: 3 }); P.table(c, 470, 536, 150, 40, 40, { col: '#6a4a32', seed: 4 });
      [[210, 480], [262, 484], [450, 490], [500, 486]].forEach(([x, y]) => { P.ellipse(c, x, y, 9, 4, '#d8ece0', INK(0.7), 1); P.ellipse(c, x, y - 1, 6, 2.4, '#8a6a3a'); });
      c.fillStyle = '#5a4a40'; c.fillRect(104, 440, 58, 96); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(104, 440, 58, 96); P.ellipse(c, 133, 500, 13, 10, '#ff9a4a', 'rgba(120,40,10,0.8)', 1.2);
      c.fillStyle = '#4a4038'; c.beginPath(); c.moveTo(108, 440); c.quadraticCurveTo(133, 398, 158, 440); c.closePath(); c.fill(); c.stroke(); P.line(c, 158, 424, 184, 410, 4, '#4a4038');
      flag(c, 600, 250, 150, '团头茶棚', '#3f5a50');
      /* 说话的勾栏：一张小台、一块醒木 */
      c.fillStyle = '#6a4a32'; c.fillRect(800, 500, 180, 40); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(800, 500, 180, 40);
      P.table(c, 890, 500, 70, 22, 34, { col: '#7a5236', seed: 6 }); c.fillStyle = '#2a1c14'; c.fillRect(880, 440, 18, 7);
      flag(c, 1136, 250, 170, '今日说三分', '#8e2a20');
      /* 傀儡棚：一方小戏台，上头吊着两个木偶（木偶在 anim 里动） */
      c.fillStyle = '#3a2a22'; c.fillRect(1330, 330, 220, 150); c.fillStyle = P.vgrad(c, 1330, 330, 150, [[0, '#7a3a48'], [1, '#4a2230']]); c.fillRect(1338, 338, 204, 134); c.strokeStyle = '#c9a24a'; c.lineWidth = 3; c.strokeRect(1330, 330, 220, 150);
      c.fillStyle = '#5a3a28'; c.fillRect(1320, 480, 240, 60); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(1320, 480, 240, 60); for (let i = 0; i < 5; i++) P.line(c, 1344 + i * 48, 482, 1344 + i * 48, 538, 1, 'rgba(0,0,0,0.3)');
      flag(c, 1712, 250, 150, '东口往右', '#2e4a55');
      /* ---- 相扑露台 ---- */
      const X0 = 1880, X1 = 2520, B0 = 1930, B1 = 2470, TY = 420, FY = 560;
      /* 台后的大幅：两个大字 */
      c.fillStyle = P.vgrad(c, 0, 262, 140, [[0, '#a8362a'], [1, '#7c2219']]); c.fillRect(2000, 268, 400, 132); c.strokeStyle = '#d7a544'; c.lineWidth = 4; c.strokeRect(2000, 268, 400, 132); c.strokeStyle = INK(); c.lineWidth = 1.4; c.strokeRect(1996, 264, 408, 140);
      c.fillStyle = '#f3e3b4'; c.font = '600 88px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('相　扑', 2200, 336);
      /* 后面两根柱 */
      P.post(c, B0 - 8, 250, 16, TY - 244, '#7a281e'); P.post(c, B1 - 8, 250, 16, TY - 244, '#7a281e');
      /* 台面 */
      c.fillStyle = P.vgrad(c, 0, TY, FY - TY, [[0, '#9a7a56'], [1, '#b8946a']]); c.beginPath(); c.moveTo(B0, TY); c.lineTo(B1, TY); c.lineTo(X1, FY); c.lineTo(X0, FY); c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 2; c.stroke();
      for (let i = 1; i < 12; i++) { const t = i / 12; P.line(c, B0 + (B1 - B0) * t, TY, X0 + (X1 - X0) * t, FY, 1, 'rgba(60,36,18,0.28)'); }
      /* 毡子 */
      c.save(); c.translate(2200, 494); c.scale(1, 0.24); c.fillStyle = '#8a3a30'; c.beginPath(); c.arc(0, 0, 232, 0, 6.3); c.fill(); c.strokeStyle = '#d7a544'; c.lineWidth = 9; c.stroke(); c.strokeStyle = 'rgba(60,20,14,0.6)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 196, 0, 6.3); c.stroke(); c.restore();
      /* 台的正面：木板、一圈红帷 */
      c.fillStyle = P.vgrad(c, 0, FY, 86, [[0, '#6a4a32'], [1, '#4a3222']]); c.fillRect(X0, FY, X1 - X0, 86); c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(X0, FY, X1 - X0, 86);
      for (let x = X0 + 40; x < X1; x += 40) P.line(c, x, FY + 2, x, FY + 84, 1, 'rgba(0,0,0,0.3)');
      c.fillStyle = '#a8362a'; c.beginPath(); c.moveTo(X0, FY); c.lineTo(X1, FY); c.lineTo(X1, FY + 22); for (let x = X1; x > X0; x -= 40) c.quadraticCurveTo(x - 20, FY + 44, x - 40, FY + 22); c.closePath(); c.fill(); c.strokeStyle = INK(0.7); c.lineWidth = 1.2; c.stroke();
      /* 右手的踏步 */
      for (let i = 0; i < 3; i++) { c.fillStyle = P.mix('#7a5a3e', '#5a3f2a', i / 3); c.fillRect(X1, FY + i * 28, 70, 28); c.strokeStyle = INK(0.8); c.lineWidth = 1.2; c.strokeRect(X1, FY + i * 28, 70, 28); }
      /* 前面两根柱和一圈绳 */
      P.post(c, X0 - 9, 400, 18, 166, '#7a281e'); P.post(c, X1 - 9, 400, 18, 166, '#7a281e');
      P.swag(c, B0, 262, B1, 262, 26, 5, '#d7a544');
      P.ao(c, 0, 540, 2800, 70, 'top', 0.36);
      /* 东口：一座矮牌坊 */
      P.post(c, 2640, 300, 20, 250, '#6a3a28'); P.post(c, 2760, 300, 20, 250, '#6a3a28'); P.beam(c, 2620, 300, 180, 26, '#6a3a28'); P.beam(c, 2630, 340, 160, 14, '#6a3a28');
      c.fillStyle = '#20160f'; c.fillRect(2664, 250, 92, 46); c.strokeStyle = '#d7a544'; c.lineWidth = 2.4; c.strokeRect(2664, 250, 92, 46); c.fillStyle = '#e8c979'; c.font = '600 28px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('东 口', 2710, 274);
      c.fillStyle = P.hgrad(c, 2660, 0, 100, [[0, '#f0e2bc'], [1, '#fff6dc']]); c.fillRect(2660, 354, 100, 196);
      /* 元夕剩下的灯：一串红纱灯横过半条街 */
      P.swag(c, 590, 150, 1190, 150, 60, 2, '#3a2a1e'); for (let i = 1; i < 6; i++) { const t = i / 6, x = 590 + 600 * t, y = 150 + 4 * 60 * t * (1 - t) * 0.5 + 16; P.lantern(c, x, y + 14, 13, { cord: 8, col: i % 2 ? '#d8432c' : '#e08a3a' }); }
      P.swag(c, 1690, 150, 1770, 150, 18, 2, '#3a2a1e');
      P.ao(c, 0, 1000, 2800, 80, 'bottom', 0.3);
      P.paper(c, 2800, 1080, 19, 0.4);
    },
    props: [
      /* 团头的交椅 */
      { x: 640, y: 652, bw: 96, bh: 132, sortY: 646, block: [-30, -16, 60, 20], draw(g) {
        P.shadow(g, 0, 2, 44, 11, 0.4);
        P.line(g, -30, 0, 26, -62, 6, '#4a2f1c'); P.line(g, 30, 0, -26, -62, 6, '#4a2f1c'); P.line(g, -30, -62, 30, -62, 7, '#5a3a22');
        g.strokeStyle = '#4a2f1c'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-34, -64); g.quadraticCurveTo(-40, -118, 0, -124); g.quadraticCurveTo(40, -118, 34, -64); g.stroke();
        g.fillStyle = '#8e2a20'; g.fillRect(-9, -122, 18, 58); g.strokeStyle = INK(0.7); g.lineWidth = 1; g.strokeRect(-9, -122, 18, 58);
      } },
      /* 听书的两条长凳 */
      { x: 860, y: 660, bw: 210, bh: 60, block: [-100, -14, 200, 18], draw(g) { P.bench(g, 0, 0, 200, {}); } },
      { x: 990, y: 716, bw: 210, bh: 60, block: [-100, -14, 200, 18], draw(g) { P.bench(g, 0, 0, 200, {}); } },
      /* 糖担子 */
      { x: 1640, y: 668, bw: 150, bh: 190, block: [-56, -20, 112, 24], draw(g) {
        P.shadow(g, 0, 2, 66, 13, 0.4); P.table(g, 0, 0, 120, 40, 44, { col: '#7a5236', seed: 9 });
        P.line(g, -50, -84, -50, -176, 4, '#4a2f1c'); P.line(g, 50, -84, 50, -176, 4, '#4a2f1c'); P.line(g, -56, -176, 56, -176, 5, '#4a2f1c');
        for (let i = 0; i < 6; i++) { const x = -40 + i * 16; P.line(g, x, -176, x, -150 - (i % 3) * 8, 1, '#3a2a1e'); P.ellipse(g, x, -142 - (i % 3) * 8, 6, 7, ['#e0a030', '#d8432c', '#f0d070'][i % 3], INK(0.7), 1); }
        for (let i = 0; i < 4; i++) { P.line(g, -36 + i * 24, -86, -36 + i * 24, -112, 1.4, '#c9b890'); P.ellipse(g, -36 + i * 24, -116, 7, 6, '#e8b040', INK(0.6), 1); }
      } },
    ],
    anim(c, t) {
      /* 傀儡：两个吊线的木偶一上一下 */
      [[1400, 0], [1480, 1.7]].forEach(([x, ph], i) => {
        const y = 420 + Math.sin(t * 2.2 + ph) * 12, a = Math.sin(t * 2.2 + ph) * 0.25;
        P.line(c, x - 8, 338, x - 8, y - 34, 0.8, 'rgba(240,230,200,0.7)'); P.line(c, x + 8, 338, x + 8, y - 34, 0.8, 'rgba(240,230,200,0.7)');
        c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = i ? '#3f6a70' : '#c8362e'; c.beginPath(); c.moveTo(-12, -22); c.lineTo(12, -22); c.lineTo(17, 24); c.lineTo(-17, 24); c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 1.2; c.stroke();
        P.ellipse(c, 0, -32, 10, 10, '#f0d8b8', INK(), 1.2); P.ellipse(c, 0, -41, 8, 4.6, '#1e1612'); P.line(c, -12, -16, -24, 0 + Math.sin(t * 4 + ph) * 6, 3, i ? '#3f6a70' : '#c8362e'); P.line(c, 12, -16, 24, 0 - Math.sin(t * 4 + ph) * 6, 3, i ? '#3f6a70' : '#c8362e');
        c.restore();
      });
      /* 露台绳上的小彩旗，风里轻轻摆 */
      for (let i = 1; i < 12; i++) { const u = i / 12, x = 1930 + 540 * u, y = 262 + 4 * 26 * u * (1 - u) * 0.5 + 2, sw = Math.sin(t * 3 + i) * 4; c.fillStyle = ['#d8432c', '#d7a544', '#3f6a70', '#f0e6c8'][i % 4]; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y); c.lineTo(x + sw, y + 24); c.closePath(); c.fill(); c.strokeStyle = 'rgba(43,34,28,0.6)'; c.lineWidth = 0.8; c.stroke(); }
      /* 茶炉的气 */
      for (let i = 0; i < 2; i++) { const u = (t * 0.25 + i * 0.5) % 1; const g = c.createRadialGradient(137 + Math.sin(u * 6) * 8, 400 - u * 80, 0, 137, 400 - u * 80, 14 + u * 22); g.addColorStop(0, 'rgba(246,244,236,' + Math.sin(u * Math.PI) * 0.34 + ')'); g.addColorStop(1, 'rgba(246,244,236,0)'); c.fillStyle = g; c.fillRect(90, 300, 100, 130); }
    },
  };

  /* ================= 软红院 · 阑珊的小楼 =================
     二楼。左手是楼梯口，中间一架屏风，右边临水的里间：一扇大窗，窗下是老梅的枝头，窗外是水。
     墙上挂着她自己抄的半首词；窗下条案上搁着琵琶匣。 */
  const SHANG = ['不是爱风尘', '似被前缘误', '花落花开自有时', '总赖东君主'];
  S.ruanhong = {
    name: '软红院', sub: '抱剑营街 · 临水的小楼', w: 2200, h: 1080, ambient: '#aba294', music: 'meichuang',
    walk: [[96, 640, 2110, 880]],
    spawns: { start: { x: 300, y: 790, dir: 3 }, room: { x: 1330, y: 760, dir: 3 } },
    exits: [{ id: 'down', x: 110, y: 680, w: 90, h: 190, label: '下楼', lx: 150, ly: 520, back: [60, 0] }],
    hots: [{ id: 'zi', x: 990, y: 650, r: 0, up: 250, verb: '看那幅字' }],
    lights: [
      { x: 1450, y: 470, r: 1100, c: '#f2f6ff', a: 0.85, ey: 0.7 },                       // 窗里进来的天光
      { x: 300, y: 760, r: 640, c: '#ffe2b8', a: 0.5, ey: 0.7 },
      { x: 1960, y: 600, r: 420, c: '#ffd0a0', a: 0.4, glow: 22, gx: 1962, gy: 470, gc: '#ffb070', ga: 0.35 },
    ],
    paint(c) {
      const r = JX.rng(1501);
      P.planks(c, 0, 560, 2200, 520, { seed: 151 }); c.fillStyle = 'rgba(214,196,170,0.12)'; c.fillRect(0, 560, 2200, 520);
      P.plaster(c, 0, 110, 2200, 450, { seed: 152 });
      c.fillStyle = '#3a271b'; c.fillRect(0, 0, 2200, 116); P.beam(c, 0, 100, 2200, 22, '#4a3122');
      [40, 540, 800, 1130, 1750, 2140].forEach(x => P.post(c, x, 100, 22, 470, '#5a3a28'));
      /* 墙脚的护板 */
      c.fillStyle = '#6a4a36'; c.fillRect(0, 470, 2200, 90); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.strokeRect(0, 470, 2200, 90); for (let x = 60; x < 2200; x += 120) c.strokeRect(x, 482, 100, 66);
      /* 左手：楼梯口。地板上一个方洞，踏步往左下去；里外两道栏杆，右边敞着是上下的口 */
      c.fillStyle = '#120d0a'; c.fillRect(46, 652, 176, 236);
      for (let i = 0; i < 8; i++) { const x = 200 - i * 22, t = i / 8; c.fillStyle = P.mix('#8a6846', '#1c1410', t); c.fillRect(x, 652, 22, 236); c.fillStyle = 'rgba(0,0,0,' + (0.25 + t * 0.3) + ')'; c.fillRect(x, 652, 3, 236); c.fillStyle = 'rgba(255,236,200,' + (0.16 * (1 - t)) + ')'; c.fillRect(x + 19, 652, 2, 236); }
      c.strokeStyle = INK(); c.lineWidth = 2; c.strokeRect(46, 652, 176, 236);
      const rail = (y) => { P.line(c, 40, y - 92, 226, y - 92, 7, '#6a4630'); P.line(c, 40, y - 92, 226, y - 92, 2, 'rgba(255,236,200,0.2)'); for (let x = 46; x <= 222; x += 35) { P.line(c, x, y, x, y - 92, 5, '#5a3a28'); } P.line(c, 40, y - 46, 226, y - 46, 3, '#5a3a28'); };
      rail(652);
      /* 楼梯口的灯、一张小杌子在 props 里 */
      P.lantern(c, 330, 250, 20, { cord: 60, col: '#e08a4a' });
      /* 一道落地罩，把外间和里间分开 */
      P.beam(c, 540, 122, 282, 26, '#6a4630'); for (let i = 0; i < 7; i++) { const x = 566 + i * 36; c.strokeStyle = '#6a4630'; c.lineWidth = 4; c.strokeRect(x, 152, 30, 30); P.line(c, x, 152, x + 30, 182, 3, '#6a4630'); }
      /* 她抄的半首词：一幅立轴 */
      c.fillStyle = '#d9cdb0'; c.fillRect(876, 170, 228, 300); c.strokeStyle = INK(0.75); c.lineWidth = 1.4; c.strokeRect(876, 170, 228, 300);
      c.fillStyle = '#f4ecd6'; c.fillRect(890, 196, 200, 248); c.strokeStyle = 'rgba(60,40,24,0.5)'; c.lineWidth = 1; c.strokeRect(890, 196, 200, 248);
      c.fillStyle = '#5a3a28'; c.fillRect(868, 162, 244, 10); c.fillRect(862, 468, 256, 12); P.line(c, 990, 162, 990, 140, 1.4, '#3a2a1e');
      SHANG.forEach((ln, i) => P.vtext(c, ln, 1062 - i * 40, 206, i === 2 ? 26 : 30, P.rgba(C.ink, 0.86), '500', i === 2 ? 1.2 : 1.36));
      c.fillStyle = '#b5302a'; c.fillRect(902, 404, 22, 22);                                // 她的小印
      /* 大窗：窗外的水、对岸、梅枝 */
      const WX = 1190, WY = 176, WW = 520, WH = 300;
      c.fillStyle = P.vgrad(c, 0, WY, WH, [[0, '#cfe0ea'], [0.42, '#e6ece6'], [0.46, '#9db0a8'], [0.5, '#7f9a9c'], [1, '#a8c0c2']]); c.fillRect(WX, WY, WW, WH);
      c.save(); c.beginPath(); c.rect(WX, WY, WW, WH); c.clip();
      for (let i = 0; i < 9; i++) { const x = WX + r() * WW, w = 40 + r() * 70, h = 16 + r() * 26; c.fillStyle = P.mix('#8a9aa0', '#b0b8b0', r()); c.fillRect(x, WY + WH * 0.46 - h, w, h); c.fillStyle = '#5a646a'; c.beginPath(); c.moveTo(x - 6, WY + WH * 0.46 - h); c.lineTo(x + w / 2, WY + WH * 0.46 - h - 12); c.lineTo(x + w + 6, WY + WH * 0.46 - h); c.closePath(); c.fill(); }       // 对岸的人家
      for (let i = 0; i < 16; i++) { c.strokeStyle = 'rgba(255,255,255,' + (0.18 + r() * 0.2) + ')'; c.lineWidth = 1.2; const y = WY + WH * 0.54 + r() * WH * 0.44, x = WX + r() * WW; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 60, y); c.stroke(); }                                           // 水纹
      c.fillStyle = '#5a4a3a'; c.beginPath(); c.moveTo(WX + 330, WY + WH * 0.7); c.quadraticCurveTo(WX + 380, WY + WH * 0.62, WX + 440, WY + WH * 0.7); c.lineTo(WX + 440, WY + WH * 0.73); c.lineTo(WX + 330, WY + WH * 0.73); c.closePath(); c.fill(); P.line(c, WX + 420, WY + WH * 0.7, WX + 428, WY + WH * 0.5, 2, '#3a2a1e');   // 一条小船
      /* 老梅：从窗下探上来的枝，开着花 */
      const br = (x0, y0, len, a, w, d) => { if (d > 5 || len < 10) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; c.strokeStyle = '#2e2420'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * 14, (y0 + y1) / 2 + (r() - 0.5) * 14, x1, y1); c.stroke(); if (d > 1) for (let k = 0; k < 3; k++) { const t = r(), px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t; P.ellipse(c, px + (r() - 0.5) * 8, py + (r() - 0.5) * 8, 4.4, 4.4, r() < 0.3 ? '#f6e9ec' : '#e9a6b4'); P.ellipse(c, px, py, 1.4, 1.4, '#c9a24a'); } br(x1, y1, len * 0.74, a - 0.5 + r() * 0.3, w * 0.66, d + 1); br(x1, y1, len * 0.7, a + 0.4 - r() * 0.3, w * 0.66, d + 1); };
      br(WX + 60, WY + WH + 20, 120, -1.05, 13, 0); br(WX + 150, WY + WH + 20, 90, -1.9, 9, 1);
      c.restore();
      /* 窗框：左右两扇，右扇推开着 */
      c.strokeStyle = '#5a3a28'; c.lineWidth = 12; c.strokeRect(WX - 4, WY - 4, WW + 8, WH + 8); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.strokeRect(WX - 11, WY - 11, WW + 22, WH + 22);
      c.fillStyle = 'rgba(244,236,214,0.86)'; c.fillRect(WX, WY, 150, WH); c.strokeStyle = '#5a3a28'; c.lineWidth = 3; for (let x = WX; x <= WX + 150; x += 30) P.line(c, x, WY, x, WY + WH, 3, '#5a3a28'); for (let y = WY; y <= WY + WH; y += 50) P.line(c, WX, y, WX + 150, y, 3, '#5a3a28');
      c.fillStyle = '#6a4630'; c.fillRect(WX - 14, WY + WH + 4, WW + 28, 14);                // 窗台
      /* 右手：妆台、镜、一盏灯 */
      c.fillStyle = '#5a3a28'; c.fillRect(1850, 420, 220, 140); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(1850, 420, 220, 140); for (let i = 0; i < 2; i++) { c.strokeStyle = 'rgba(215,165,68,0.5)'; c.strokeRect(1862 + i * 104, 436, 92, 50); P.ellipse(c, 1908 + i * 104, 461, 4, 4, '#d7a544'); }
      P.ellipse(c, 1930, 360, 40, 48, '#c9d6d2', '#6a4630', 6); P.ellipse(c, 1930, 360, 30, 38, 'rgba(255,255,255,0.35)'); c.fillStyle = '#6a4630'; c.fillRect(1922, 404, 16, 18);
      P.candle(c, 2020, 420); c.fillStyle = '#b8433a'; c.fillRect(1986, 404, 20, 16); c.strokeStyle = INK(0.7); c.lineWidth = 1; c.strokeRect(1986, 404, 20, 16);
      /* 帐子的一角 */
      c.fillStyle = 'rgba(210,220,226,0.75)'; c.beginPath(); c.moveTo(2090, 120); c.lineTo(2200, 120); c.lineTo(2200, 560); c.quadraticCurveTo(2130, 420, 2090, 120); c.closePath(); c.fill(); c.strokeStyle = 'rgba(80,90,110,0.5)'; c.lineWidth = 1.2; c.stroke();
      P.ao(c, 0, 560, 2200, 70, 'top', 0.45);
      P.ao(c, 0, 1000, 2200, 80, 'bottom', 0.32);
      P.paper(c, 2200, 1080, 23, 0.4);
    },
    props: [
      /* 屏风：三扇，画的是水墨的一枝梅 */
      { x: 680, y: 650, bw: 250, bh: 300, block: [-116, -16, 232, 22], draw(g) {
        P.shadow(g, 0, 2, 120, 14, 0.4);
        for (let i = -1; i <= 1; i++) { g.save(); g.translate(i * 78, i === 0 ? -6 : 0); g.fillStyle = '#4a3122'; g.fillRect(-40, -280, 80, 280); g.fillStyle = '#e8dec4'; g.fillRect(-33, -270, 66, 232); g.strokeStyle = INK(); g.lineWidth = 1.6; g.strokeRect(-40, -280, 80, 280); g.strokeRect(-33, -270, 66, 232); g.fillStyle = '#5a3a28'; g.fillRect(-33, -32, 66, 24); g.restore(); }
        g.strokeStyle = 'rgba(40,30,24,0.75)'; g.lineCap = 'round'; g.lineWidth = 5; g.beginPath(); g.moveTo(-100, -60); g.quadraticCurveTo(-40, -150, 10, -170); g.quadraticCurveTo(60, -190, 96, -250); g.stroke(); g.lineWidth = 2.4; g.beginPath(); g.moveTo(-30, -146); g.lineTo(-56, -214); g.moveTo(20, -174); g.lineTo(50, -128); g.stroke();
        [[-58, -216], [-44, -180], [12, -176], [52, -126], [70, -214], [96, -252], [-84, -90], [36, -196]].forEach(([x, y]) => P.ellipse(g, x, y, 5, 5, 'rgba(190,70,80,0.75)'));
      } },
      /* 圆桌、茶具、两只绣墩 */
      { x: 1060, y: 780, bw: 220, bh: 130, block: [-80, -40, 160, 44], draw(g) {
        P.shadow(g, 0, 0, 100, 20, 0.4);
        g.fillStyle = '#4a3122'; g.fillRect(-10, -60, 20, 60); P.ellipse(g, 0, -4, 40, 9, '#4a3122', INK(), 1.4);
        P.ellipse(g, 0, -66, 88, 26, P.vgrad(g, 0, -92, 52, [[0, '#8a6040'], [1, '#6a4630']]), INK(), 1.8); P.ellipse(g, 0, -70, 80, 22, 'rgba(255,236,200,0.08)');
        g.fillStyle = P.hgrad(g, -16, 0, 32, [[0, '#8fae9a'], [0.4, '#dceee2'], [1, '#7c9a88']]); g.beginPath(); g.moveTo(-10, -100); g.lineTo(10, -100); g.quadraticCurveTo(20, -86, 14, -72); g.lineTo(-14, -72); g.quadraticCurveTo(-20, -86, -10, -100); g.closePath(); g.fill(); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.stroke(); P.line(g, 14, -90, 28, -98, 3, '#a9c9b4');
        [[-44, -68], [40, -62], [-30, -56]].forEach(([x, y]) => { P.ellipse(g, x, y, 9, 4, '#d8ece0', INK(0.7), 1); P.ellipse(g, x, y - 1, 6, 2.4, '#8a6a3a'); });
      } },
      { x: 930, y: 800, bw: 70, bh: 70, block: [-24, -14, 48, 18], draw(g) { P.shadow(g, 0, 0, 30, 9, 0.4); g.fillStyle = P.hgrad(g, -26, 0, 52, [[0, '#6a7f8a'], [0.5, '#a9c0c8'], [1, '#5a6f7a']]); g.beginPath(); g.moveTo(-20, -50); g.lineTo(20, -50); g.quadraticCurveTo(32, -26, 20, 0); g.lineTo(-20, 0); g.quadraticCurveTo(-32, -26, -20, -50); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke(); P.ellipse(g, 0, -50, 20, 6, '#c9d8dc', INK(), 1.2); } },
      /* 窗下的条案：琵琶匣（那册书是单摆的，见 story.js） */
      { x: 1580, y: 640, bw: 330, bh: 120, block: [-150, -20, 300, 24], draw(g) {
        P.table(g, 0, 0, 300, 34, 46, { col: '#5a3a28', seed: 11 });
        g.save(); g.translate(-40, -84); g.rotate(-0.03); g.fillStyle = '#2e2420'; g.beginPath(); g.moveTo(-96, -12); g.lineTo(60, -16); g.quadraticCurveTo(100, -18, 104, 0); g.quadraticCurveTo(100, 16, 60, 14); g.lineTo(-96, 10); g.closePath(); g.fill(); g.strokeStyle = '#d7a544'; g.lineWidth = 1.4; g.stroke(); P.line(g, -40, -13, -40, 11, 2, '#d7a544'); P.line(g, 30, -15, 30, 13, 2, '#d7a544'); g.restore();   // 琵琶匣
        /* 那册蓝布函套的书不画在这里：它会被拿走（第五场她拿起来递给他），由 story.js 按场次摆 */
      } },
      /* 楼梯口靠外的一道栏杆（人从它后面走过） */
      { x: 134, y: 892, bw: 200, bh: 100, draw(g) { P.line(g, -94, -92, 92, -92, 7, '#6a4630'); P.line(g, -94, -92, 92, -92, 2, 'rgba(255,236,200,0.2)'); for (let x = -88; x <= 88; x += 35) P.line(g, x, 0, x, -92, 5, '#5a3a28'); P.line(g, -94, -46, 92, -46, 3, '#5a3a28'); } },
      /* 楼梯口的小杌子（崔妈妈坐的） */
      { x: 420, y: 700, bw: 60, bh: 50, block: [-22, -12, 44, 16], draw(g) { P.shadow(g, 0, 0, 26, 7, 0.36); P.table(g, 0, 0, 50, 18, 26, { col: '#6a4630', seed: 2 }); } },
    ],
    anim(c, t) {                                                   // 窗口落进来的几瓣梅花
      for (let i = 0; i < 5; i++) { const u = (t * 0.07 + i * 0.21) % 1, x = 1260 + i * 70 + Math.sin(u * 9 + i) * 26, y = 480 + u * 180; c.fillStyle = 'rgba(236,170,184,' + (0.75 * Math.sin(u * Math.PI)) + ')'; c.beginPath(); c.ellipse(x, y, 4, 2.4, u * 8 + i, 0, 6.3); c.fill(); }
    },
  };

  /* ================= 陆家书房，宝祐四年秋夜（回忆） =================
     三面书架，当中一张书案一盏灯。左手是通院子的门和一扇纸窗，右手是后门，后墙右边是里间的门帘。
     W.raid 一立起来（靴声到了），纸窗和门口就红了——那是火把。 */
  S.shufang = {
    name: '陆家书房', sub: '宝祐四年 · 秋夜', w: 1920, h: 1080, ambient: '#7c7060', music: 'xueye',
    walk: [[110, 640, 1810, 900]],
    spawns: { start: { x: 520, y: 800, dir: 3 } },
    exits: [{ id: 'back', x: 1770, y: 660, w: 60, h: 220, label: '后门', lx: 1700, ly: 620, back: [-34, 0] }],
    lights: [
      { x: 960, y: 620, r: 760, c: '#ffd9a0', a: 0.95, ey: 0.75, glow: 26, gx: 1052, gy: 586, gc: '#ffc070', ga: 0.5 },
      { x: 960, y: 760, r: 1300, c: '#e8c090', a: 0.35, ey: 0.6 },
    ],
    paint(c) {
      const r = JX.rng(1601);
      P.planks(c, 0, 560, 1920, 520, { seed: 161 });
      P.plaster(c, 0, 110, 1920, 450, { seed: 162 }); c.fillStyle = 'rgba(60,44,30,0.22)'; c.fillRect(0, 110, 1920, 450);
      c.fillStyle = '#2e2018'; c.fillRect(0, 0, 1920, 116); P.beam(c, 0, 100, 1920, 22, '#3f2a1e');
      [60, 300, 1500, 1860].forEach(x => P.post(c, x, 100, 22, 470, '#4f3424'));
      /* 书架：四层，一格一格摞着书，有的函套、有的卷轴 */
      const shelf = (x0, w) => {
        c.fillStyle = '#3a271b'; c.fillRect(x0, 150, w, 400); c.strokeStyle = INK(0.9); c.lineWidth = 2; c.strokeRect(x0, 150, w, 400);
        for (let row = 0; row < 4; row++) {
          const y = 162 + row * 97; c.fillStyle = '#20150f'; c.fillRect(x0 + 8, y, w - 16, 84);
          for (let x = x0 + 14; x < x0 + w - 30;) {
            const k = r();
            if (k < 0.62) { const n = 2 + Math.floor(r() * 5), bw = 44 + r() * 20; for (let i = 0; i < n; i++) { c.fillStyle = P.mix(['#3f5a78', '#5a6a58', '#6a5a48', '#4a4a66'][Math.floor(r() * 4)], '#8a7a60', r() * 0.4); c.fillRect(x, y + 84 - (i + 1) * 13, bw, 12); c.strokeStyle = 'rgba(20,14,10,0.7)'; c.lineWidth = 1; c.strokeRect(x, y + 84 - (i + 1) * 13, bw, 12); c.fillStyle = '#e9ddc0'; c.fillRect(x + 4, y + 84 - (i + 1) * 13 + 3, 12, 6); } x += bw + 8; }
            else if (k < 0.85) { const n = 3 + Math.floor(r() * 4); for (let i = 0; i < n; i++) { c.fillStyle = P.mix('#d9cdb0', '#b8a888', r()); c.fillRect(x + i * 12, y + 18 + r() * 8, 10, 66); c.strokeStyle = 'rgba(20,14,10,0.6)'; c.strokeRect(x + i * 12, y + 18, 10, 66); } x += n * 12 + 8; }
            else { for (let i = 0; i < 3; i++) { P.ellipse(c, x + 10 + i * 4, y + 76 - i * 12, 26, 6, '#cfc2a0', 'rgba(20,14,10,0.7)', 1); P.ellipse(c, x - 16 + i * 4, y + 76 - i * 12, 3, 6, '#8e2a20'); } x += 60; }
          }
          c.fillStyle = '#4f3424'; c.fillRect(x0, y + 84, w, 11);
        }
      };
      shelf(340, 520); shelf(880, 600);
      /* 左手：纸窗（红光在 anim 里）、通院子的门 */
      c.fillStyle = '#d9cdb0'; c.fillRect(130, 200, 150, 220); for (let x = 130; x <= 280; x += 30) P.line(c, x, 200, x, 420, 3, '#4f3424'); for (let y = 200; y <= 420; y += 44) P.line(c, 130, y, 280, y, 3, '#4f3424'); c.strokeStyle = '#4f3424'; c.lineWidth = 9; c.strokeRect(128, 198, 154, 224);
      c.fillStyle = '#17110d'; c.fillRect(0, 430, 70, 130); c.fillStyle = '#4a2f20'; c.fillRect(0, 300, 64, 590); c.strokeStyle = INK(); c.lineWidth = 1.8; c.strokeRect(0, 300, 64, 590); for (let i = 0; i < 3; i++) c.strokeRect(8, 316 + i * 190, 48, 170); P.ellipse(c, 50, 600, 5, 5, '#b89a5a');
      /* 后墙右边：里间的门，一道布帘 */
      c.fillStyle = '#17110d'; c.fillRect(1560, 290, 130, 270); c.fillStyle = P.vgrad(c, 0, 290, 230, [[0, '#59606c'], [1, '#3f4650']]); c.fillRect(1560, 290, 130, 220); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.strokeRect(1560, 290, 130, 220); for (let i = 1; i < 5; i++) P.line(c, 1560 + i * 26, 290, 1560 + i * 26, 510, 1, 'rgba(0,0,0,0.25)'); P.beam(c, 1548, 278, 154, 14, '#4f3424');
      /* 右手：后门，关着 */
      c.fillStyle = '#4a2f20'; c.fillRect(1850, 300, 70, 590); c.strokeStyle = INK(); c.lineWidth = 1.8; c.strokeRect(1850, 300, 70, 590); for (let i = 0; i < 3; i++) c.strokeRect(1858, 316 + i * 190, 54, 170); P.ellipse(c, 1866, 600, 5, 5, '#b89a5a');
      /* 墙上一幅字（看不清写的什么），一只花几 */
      c.fillStyle = '#e4d8ba'; c.fillRect(1730, 170, 84, 250); c.strokeStyle = INK(0.7); c.lineWidth = 1.2; c.strokeRect(1730, 170, 84, 250); for (let i = 0; i < 3; i++) for (let j = 0; j < 9; j++) { c.fillStyle = P.rgba(C.ink, 0.5 + r() * 0.25); c.fillRect(1748 + i * 24 + r() * 3, 186 + j * 24, 7 + r() * 5, 14 + r() * 5); }
      P.ao(c, 0, 560, 1920, 70, 'top', 0.5);
      P.ao(c, 0, 1000, 1920, 80, 'bottom', 0.36);
      P.paper(c, 1920, 1080, 29, 0.4);
    },
    props: [
      /* 书案：灯、摊开的新书、印和朱泥、一摞待钤的书 */
      { x: 960, y: 716, bw: 520, bh: 150, block: [-230, -70, 460, 74], draw(g) {
        P.table(g, 0, 0, 460, 60, 50, { col: '#5a3a28', seed: 21 });
        g.fillStyle = '#efe6cc'; g.fillRect(-70, -104, 110, 44); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.strokeRect(-70, -104, 110, 44); P.line(g, -15, -104, -15, -60, 1, 'rgba(60,40,24,0.6)'); for (let i = 0; i < 4; i++) { P.line(g, -62 + i * 11, -98, -62 + i * 11, -66, 1.2, 'rgba(40,30,24,0.5)'); P.line(g, -6 + i * 11, -98, -6 + i * 11, -66, 1.2, 'rgba(40,30,24,0.5)'); }
        g.fillStyle = '#b5302a'; g.fillRect(24, -74, 9, 9);                                                    // 钤好的印
        P.ellipse(g, 76, -80, 15, 6, '#8e2a20', INK(), 1.2); P.ellipse(g, 76, -82, 11, 4, '#c8362e'); g.fillStyle = '#d9d2c0'; g.fillRect(100, -98, 13, 20); g.strokeStyle = INK(); g.lineWidth = 1; g.strokeRect(100, -98, 13, 20);   // 朱泥、印
        for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#3f5a78' : '#4a6686'; g.fillRect(-200, -70 - i * 11, 70, 10); g.strokeStyle = INK(0.7); g.strokeRect(-200, -70 - i * 11, 70, 10); }
        g.fillStyle = '#3a2a1e'; g.fillRect(84 + 60, -66, 18, 6); g.fillRect(84 + 66, -112, 5, 48); P.ellipse(g, 84 + 68, -114, 12, 4, '#4a3526'); const gr = g.createRadialGradient(84 + 68, -126, 0, 84 + 68, -126, 12); gr.addColorStop(0, '#fffbe0'); gr.addColorStop(0.5, '#ffc45a'); gr.addColorStop(1, 'rgba(255,150,40,0)'); P.ellipse(g, 84 + 68, -126, 5, 10, gr);
      } },
      /* 父亲坐的椅子 */
      { x: 960, y: 640, bw: 90, bh: 150, sortY: 600, draw(g) { g.fillStyle = '#4f3424'; g.fillRect(-34, -140, 68, 110); g.strokeStyle = INK(); g.lineWidth = 1.6; g.strokeRect(-34, -140, 68, 110); g.fillStyle = '#6a4630'; g.fillRect(-26, -132, 52, 60); } },
      /* 地上两只书箱 */
      { x: 420, y: 668, bw: 150, bh: 80, block: [-66, -22, 132, 26], draw(g) { P.shadow(g, 0, 0, 70, 12, 0.4); g.fillStyle = '#5a4030'; g.fillRect(-64, -58, 128, 58); g.strokeStyle = INK(); g.lineWidth = 1.6; g.strokeRect(-64, -58, 128, 58); P.line(g, -64, -40, 64, -40, 2, '#3a2a1e'); P.ellipse(g, 0, -28, 6, 7, '#b89a5a', INK(), 1); } },
    ],
    anim(c, t, W) {
      if (!W || !W.raid) return;                                    // 火把到了：纸窗、门口一片红
      const k = Math.min(1, (JX.time - W.raid) / 1.6), fl = 0.82 + 0.18 * Math.sin(t * 9) * Math.sin(t * 4.3);
      c.save(); c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(255,170,90,' + (0.8 * k * fl) + ')'; c.fillRect(130, 200, 150, 220);
      const g = c.createRadialGradient(200, 420, 0, 200, 420, 700); g.addColorStop(0, 'rgba(255,170,90,' + (0.5 * k * fl) + ')'); g.addColorStop(1, 'rgba(255,110,40,0)'); c.fillStyle = g; c.fillRect(0, 0, 900, 1080);
      c.restore();
    },
  };
})();
