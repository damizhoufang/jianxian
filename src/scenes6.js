/* 场景（六）：第一章八至十一场——临安府架阁库、西湖夜（撑船）、平章的画舫（连成一片的灯船）、临安府公堂。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);

  /* ================= 架阁库，正月十七夜 =================
     存旧案卷的库房。靠墙一溜架子，地上还有两架、两堆卷箱，把路挤成一个“之”字。
     左手是门（钟推官提着灯站在那里），最里头靠东墙是宝祐四年的那一架。 */
  function rack(c, x, y, w, h, seed, o) {                          // 一架案卷：木格子里摞着函套、卷子，垂着纸签。(x,y) 是左上角
    o = o || {}; const r = JX.rng(seed), rows = o.rows || Math.round(h / 80), rh = (h - 10) / rows;
    c.fillStyle = '#3a2a1e'; c.fillRect(x, y, w, h); c.strokeStyle = INK(0.9); c.lineWidth = 2; c.strokeRect(x, y, w, h);
    for (let row = 0; row < rows; row++) {
      const ry = y + 6 + row * rh, floor = ry + rh - 10;
      c.fillStyle = '#1c1410'; c.fillRect(x + 7, ry, w - 14, rh - 10);
      for (let bx = x + 12; bx < x + w - 50;) {
        if (r() < 0.55) {                                           // 一摞函套
          const n = 2 + Math.floor(r() * 4), bw = 40 + r() * 16;
          for (let i = 0; i < n && (i + 1) * 12 < rh - 14; i++) { c.fillStyle = P.mix(['#4a5a6a', '#5a5a48', '#6a5a48', '#4a4a5a'][Math.floor(r() * 4)], '#8a7a60', r() * 0.4); c.fillRect(bx, floor - (i + 1) * 12, bw, 11); c.strokeStyle = 'rgba(20,14,10,0.7)'; c.lineWidth = 1; c.strokeRect(bx, floor - (i + 1) * 12, bw, 11); }
          if (r() < 0.65) { c.fillStyle = '#e4d8ba'; c.fillRect(bx + bw * 0.4, floor - 22, 8, 18); c.strokeStyle = 'rgba(20,14,10,0.5)'; c.strokeRect(bx + bw * 0.4, floor - 22, 8, 18); }
          bx += bw + 7;
        } else {                                                    // 一排卷子，露着圆头
          const n = 3 + Math.floor(r() * 3);
          for (let j = 0; j < 2; j++) for (let i = 0; i < n - j; i++) { if (16 + j * 14 > rh - 14) continue; const cx = bx + 8 + i * 15 + j * 7.5, cy = floor - 8 - j * 13; P.ellipse(c, cx, cy, 7, 7, P.mix('#d9cdb0', '#a89878', r()), 'rgba(20,14,10,0.7)', 1); P.ellipse(c, cx, cy, 2, 2, '#6a5a44'); }
          bx += n * 15 + 12;
        }
      }
      c.fillStyle = '#4f3424'; c.fillRect(x, floor, w, 10); c.fillStyle = 'rgba(255,236,200,0.1)'; c.fillRect(x, floor, w, 2);
    }
  }
  const JG_WIN = [[470, 150], [1130, 150], [1790, 150]];           // 三扇高窗的左上角，各 200×150
  S.jiage = {
    name: '架阁库', sub: '临安府 · 正月十七夜', w: 2400, h: 1080, ambient: '#8a847c', music: 'anliu', outside: '#07080c',
    walk: [[110, 640, 2300, 900]],
    spawns: { start: { x: 250, y: 800, dir: 3 } },
    exits: [],
    hots: [{ id: 'juan', x: 2200, y: 660, r: 130, up: 240, verb: '抽出那一卷' }],
    marks: [{ t: '宝祐四年的那一架', x: 2200, y: 130 }, { t: '门', x: 120, y: 560 }],
    lights: [
      { x: 300, y: 720, r: 600, c: '#ffd9a0', a: 0.6, ey: 0.75 },
      { x: 570, y: 620, r: 560, c: '#b9c8ea', a: 0.42, ey: 0.8 }, { x: 1230, y: 620, r: 560, c: '#b9c8ea', a: 0.42, ey: 0.8 }, { x: 1890, y: 620, r: 560, c: '#b9c8ea', a: 0.42, ey: 0.8 },
      { x: 2200, y: 600, r: 420, c: '#ffe2b8', a: 0.26 },
    ],
    paint(c) {
      P.flagstones(c, 0, 560, 2400, 520, { seed: 181 }); c.fillStyle = 'rgba(40,36,44,0.26)'; c.fillRect(0, 560, 2400, 520);
      P.plaster(c, 0, 110, 2400, 450, { seed: 182 }); c.fillStyle = 'rgba(40,36,44,0.34)'; c.fillRect(0, 110, 2400, 450);
      c.fillStyle = '#241a14'; c.fillRect(0, 0, 2400, 116); P.beam(c, 0, 100, 2400, 22, '#3a271c');
      [90, 430, 710, 1090, 1370, 1750, 2030, 2350].forEach(x => P.post(c, x, 100, 22, 470, '#4a3122'));
      /* 高窗：直棂，糊着纸，窗外是夜 */
      JG_WIN.forEach(([x, y]) => {
        c.fillStyle = P.vgrad(c, x, y, 150, [[0, '#5a6686'], [1, '#3e4864']]); c.fillRect(x, y, 200, 150);
        for (let i = 1; i < 8; i++) P.line(c, x + i * 25, y, x + i * 25, y + 150, 4, '#3a271c'); P.line(c, x, y + 75, x + 200, y + 75, 4, '#3a271c');
        c.strokeStyle = '#3a271c'; c.lineWidth = 9; c.strokeRect(x - 2, y - 2, 204, 154); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.strokeRect(x - 7, y - 7, 214, 164);
      });
      /* 靠墙的架子：窗下的矮一些，其余顶到梁下 */
      rack(c, 760, 140, 300, 420, 21); rack(c, 1420, 140, 300, 420, 22); rack(c, 2080, 140, 250, 420, 23);
      rack(c, 470, 330, 200, 230, 24, { rows: 3 }); rack(c, 1130, 330, 200, 230, 25, { rows: 3 }); rack(c, 1790, 330, 200, 230, 26, { rows: 3 });
      rack(c, 150, 250, 250, 310, 27, { rows: 4 });
      /* 东墙那一架上的签子 */
      c.fillStyle = '#efe4c8'; c.fillRect(2184, 146, 32, 104); c.strokeStyle = INK(0.8); c.lineWidth = 1.2; c.strokeRect(2184, 146, 32, 104); P.vtext(c, '宝祐四年', 2200, 152, 21, '#8e2a20', '600', 1.1);
      /* 左手：通衙署的门，虚掩着 */
      c.fillStyle = '#4a2f20'; c.fillRect(0, 300, 64, 590); c.strokeStyle = INK(); c.lineWidth = 1.8; c.strokeRect(0, 300, 64, 590); for (let i = 0; i < 3; i++) c.strokeRect(8, 316 + i * 190, 48, 170); P.ellipse(c, 50, 600, 5, 5, '#b89a5a');
      c.fillStyle = 'rgba(255,214,150,0.5)'; c.fillRect(64, 300, 5, 590);
      P.ao(c, 0, 560, 2400, 80, 'top', 0.5);
      P.ao(c, 0, 1000, 2400, 80, 'bottom', 0.36);
      P.paper(c, 2400, 1080, 31, 0.4);
    },
    props: [620, 1420].map((x, i) => ({                             // 地上的两架：从后墙伸出来，人从它前头绕
      x, y: 772, bw: 196, bh: 336, block: [-92, -132, 184, 134], draw(g) {
        P.shadow(g, 0, 0, 100, 16, 0.42); rack(g, -90, -330, 180, 326, 31 + i, { rows: 4 });
        g.fillStyle = '#2a1c14'; g.fillRect(-90, -6, 180, 6);
      },
    })).concat([1020, 1820].map((x, i) => ({                        // 两堆卷箱：靠着前头，人从它后面绕（只挡住腿）
      x, y: 900, bw: 230, bh: 140, block: [-104, -128, 208, 132], draw(g) {
        P.shadow(g, 0, 0, 112, 14, 0.4);
        [[-104, -62, 100, 62], [4, -62, 100, 62], [-56, -122, 108, 60]].forEach(([bx, by, bw, bh], k) => {
          g.fillStyle = P.vgrad(g, 0, by, bh, [[0, k === 2 ? '#6a4c36' : '#5c4230'], [1, '#3f2c20']]); g.fillRect(bx, by, bw, bh); g.strokeStyle = INK(); g.lineWidth = 1.6; g.strokeRect(bx, by, bw, bh);
          P.line(g, bx, by + 16, bx + bw, by + 16, 2, '#2e2018'); P.ellipse(g, bx + bw / 2, by + 30, 6, 7, '#b89a5a', INK(), 1);
          g.fillStyle = '#e4d8ba'; g.fillRect(bx + 10, by + 24, 14, 26); g.strokeStyle = 'rgba(20,14,10,0.6)'; g.lineWidth = 1; g.strokeRect(bx + 10, by + 24, 14, 26);
        });
        void i;
      },
    }))),
    glow(c, t, W) {                                                 // 画在灯光图之后（此刻是“加亮”）：手里的灯；窗外巡更的灯笼
      const lamp = (e, a) => { if (!e || e.vis === false || e.carry !== 'lantern') return; const g = c.createRadialGradient(e.x, e.y - 70, 0, e.x, e.y - 70, 380); g.addColorStop(0, 'rgba(255,196,120,' + a + ')'); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(e.x - 380, e.y - 450, 760, 760); };
      lamp(W.player, 0.17); lamp(W.byId.zhong, 0.13);
      if (W.patrol) {
        const k = (JX.time - W.patrol) / 5.2; if (k > 1.15) return;
        const px = -200 + 2900 * k;
        JG_WIN.forEach(([x, y]) => {
          const a = Math.max(0, 1 - Math.abs(px - (x + 100)) / 430); if (a <= 0) return;
          c.fillStyle = 'rgba(255,200,120,' + (0.8 * a) + ')'; c.fillRect(x, y, 200, 150);
          const g = c.createRadialGradient(x + 100, 640, 0, x + 100, 640, 430); g.addColorStop(0, 'rgba(255,196,120,' + (0.3 * a) + ')'); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(x - 330, 210, 860, 860);
        });
      }
    },
  };

  /* ================= 西湖，正月十八夜 =================
     这一场是撑船：自己是一条小划子（画在 story.js 里），湖上散着灯船，都绕得开。
     湖心偏右是平章的画舫——好几条大船用铁索连成一片，挂着一串一串的红灯。 */
  const LB = [[690, 610, 0], [1120, 1010, 1], [1480, 560, 2], [1640, 1180, 0], [1960, 800, 1], [900, 1270, 2], [1260, 780, 0], [2260, 1200, 2], [2800, 1040, 1], [520, 880, 1], [2040, 470, 0], [3000, 520, 2]];
  function lampBoat(g, kind, seed) {                                // 一条灯船：船身、篷、一串灯、两三个人影
    const r = JX.rng(seed);
    g.fillStyle = 'rgba(8,12,28,0.5)'; g.beginPath(); g.ellipse(0, 6, 150, 16, 0, 0, 6.3); g.fill();
    g.fillStyle = P.vgrad(g, 0, -34, 40, [[0, '#4a3324'], [1, '#22160f']]); g.beginPath(); g.moveTo(-150, -34); g.quadraticCurveTo(-120, 4, -60, 6); g.lineTo(60, 6); g.quadraticCurveTo(120, 4, 150, -34); g.lineTo(118, -26); g.lineTo(-118, -26); g.closePath(); g.fill(); g.strokeStyle = INK(0.9); g.lineWidth = 1.8; g.stroke();
    P.line(g, -118, -26, 118, -26, 2.4, '#6a4a32');
    if (kind === 0) {                                               // 弯篷
      g.fillStyle = P.vgrad(g, 0, -96, 70, [[0, '#7a6a4a'], [1, '#4a3e2c']]); g.beginPath(); g.moveTo(-70, -26); g.quadraticCurveTo(-70, -100, 0, -100); g.quadraticCurveTo(70, -100, 70, -26); g.closePath(); g.fill(); g.stroke();
      for (let i = -3; i <= 3; i++) { g.strokeStyle = 'rgba(30,20,12,0.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(i * 20, -26); g.quadraticCurveTo(i * 20, -96, i * 6, -100); g.stroke(); }
      g.fillStyle = 'rgba(255,200,120,0.85)'; g.fillRect(-40, -70, 80, 34); g.strokeStyle = INK(0.7); g.lineWidth = 1.2; g.strokeRect(-40, -70, 80, 34); P.line(g, 0, -70, 0, -36, 2, '#4a3324');
      [[-20, 0], [18, 1]].forEach(([x]) => { g.fillStyle = 'rgba(40,24,14,0.75)'; g.beginPath(); g.arc(x, -54, 7, 0, 6.3); g.fill(); g.fillRect(x - 9, -48, 18, 12); });
    } else if (kind === 1) {                                        // 四柱的凉亭顶
      [-70, -24, 24, 70].forEach(x => P.line(g, x, -26, x, -96, 5, '#8e2a20'));
      g.fillStyle = '#3a2a22'; g.beginPath(); g.moveTo(-100, -92); g.quadraticCurveTo(-60, -104, 0, -128); g.quadraticCurveTo(60, -104, 100, -92); g.lineTo(84, -86); g.lineTo(-84, -86); g.closePath(); g.fill(); g.strokeStyle = INK(0.9); g.lineWidth = 1.6; g.stroke();
      [[-46, 0], [0, 1], [44, 0]].forEach(([x, f]) => { g.fillStyle = f ? '#a9b9c8' : '#7a6a7c'; g.beginPath(); g.arc(x, -62, 7, 0, 6.3); g.fill(); g.fillRect(x - 9, -56, 18, 30); g.fillStyle = '#2a2018'; g.beginPath(); g.arc(x, -64, 7, Math.PI, 0); g.fill(); });
    } else {                                                        // 没篷的小船，船头一根竿子挑着灯
      P.line(g, -96, -26, -110, -150, 4, '#4a3324'); P.line(g, 96, -26, 110, -150, 4, '#4a3324');
      [[-30, 0], [26, 1]].forEach(([x, f]) => { g.fillStyle = f ? '#8aa08c' : '#93806a'; g.beginPath(); g.arc(x, -58, 7, 0, 6.3); g.fill(); g.fillRect(x - 9, -52, 18, 26); g.fillStyle = '#2a2018'; g.beginPath(); g.arc(x, -60, 7, Math.PI, 0); g.fill(); });
    }
    /* 一串灯 */
    const n = 4 + Math.floor(r() * 2), y0 = kind === 2 ? -146 : -112, sag = kind === 2 ? 46 : 10, x0 = kind === 2 ? -108 : -96;
    g.strokeStyle = INK(0.7); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(0, y0 + sag * 2, -x0, y0); g.stroke();
    for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = x0 + (-x0 - x0) * u, y = y0 + sag * 4 * u * (1 - u) + 12; P.lantern(g, x, y, 9, { cord: 3, tassel: false, col: i % 2 ? '#e0803a' : '#d8432c' }); }
  }
  function bigBoat(g, w, tiers, seed) {                             // 画舫里的一条大船：船身、一两层的舱楼、满檐的红灯。原点在船身底边正中
    const r = JX.rng(seed), hw = w / 2;
    g.fillStyle = P.vgrad(g, 0, -60, 70, [[0, '#5a3a26'], [1, '#22160f']]); g.beginPath(); g.moveTo(-hw, -64); g.quadraticCurveTo(-hw + 30, 6, -hw + 90, 8); g.lineTo(hw - 90, 8); g.quadraticCurveTo(hw - 30, 6, hw, -64); g.lineTo(hw - 40, -50); g.lineTo(-hw + 40, -50); g.closePath(); g.fill(); g.strokeStyle = INK(0.9); g.lineWidth = 2; g.stroke();
    P.line(g, -hw + 40, -50, hw - 40, -50, 3, '#7a5236'); for (let x = -hw + 70; x < hw - 60; x += 46) P.line(g, x, -48, x + 4, 4, 1, 'rgba(0,0,0,0.3)');
    let bw = w - 150, y = -50;
    for (let t = 0; t < tiers; t++) {
      const h = t ? 62 : 80, x0 = -bw / 2;
      g.fillStyle = '#3a2218'; g.fillRect(x0, y - h, bw, h);
      const n = Math.max(2, Math.round(bw / 74)), cw = bw / n;
      for (let i = 0; i < n; i++) {
        g.fillStyle = P.vgrad(g, 0, y - h + 10, h - 20, [[0, '#ffdca0'], [1, '#e8a45a']]); g.fillRect(x0 + i * cw + 8, y - h + 10, cw - 16, h - 22);
        g.strokeStyle = 'rgba(90,40,20,0.75)'; g.lineWidth = 1.4; for (let q = 1; q < 4; q++) { g.beginPath(); g.moveTo(x0 + i * cw + 8 + q * (cw - 16) / 4, y - h + 10); g.lineTo(x0 + i * cw + 8 + q * (cw - 16) / 4, y - 12); g.stroke(); }
        if (r() < 0.7) { const sx = x0 + i * cw + cw * (0.3 + r() * 0.4); g.fillStyle = 'rgba(50,26,14,0.7)'; g.beginPath(); g.arc(sx, y - h * 0.52, 8, 0, 6.3); g.fill(); g.fillRect(sx - 11, y - h * 0.52 + 6, 22, h * 0.4); }
        P.line(g, x0 + i * cw, y - h, x0 + i * cw, y, 6, '#8e2a20');
      }
      P.line(g, x0 + bw, y - h, x0 + bw, y, 6, '#8e2a20');
      y -= h;
      g.fillStyle = '#2a1c18'; g.beginPath(); g.moveTo(x0 - 34, y + 4); g.quadraticCurveTo(x0 - 20, y - 8, x0 + 10, y - 22); g.lineTo(-x0 - 10, y - 22); g.quadraticCurveTo(-x0 + 20, y - 8, -x0 + 34, y + 4); g.closePath(); g.fill(); g.strokeStyle = INK(0.9); g.lineWidth = 1.6; g.stroke();
      for (let x = x0 - 14; x <= -x0 + 14; x += 34) P.lantern(g, x, y + 20, 8, { cord: 4, tassel: false });
      y -= 22; bw -= 130;
    }
    return y;
  }
  S.xihu = {
    name: '西湖', sub: '正月十八夜 · 灯船', w: 3200, h: 1400, ambient: '#8790b8', music: 'yuanxi', outside: '#05060c',
    walk: [[90, 430, 3120, 1330]],
    blocks: [[0, 1130, 250, 270]],                                  // 码头
    spawns: { start: { x: 420, y: 1130, dir: 3 } },
    exits: [],
    marks: [{ t: '平章的画舫（连成一片、挂红灯的）', x: 2620, y: 400 }, { t: '葛岭 · 半闲堂', x: 2480, y: 96 }, { t: '断桥', x: 700, y: 236 }, { t: '涌金门外的码头', x: 250, y: 1090 }],
    lights: (function () {
      const L = [{ x: 1600, y: 800, r: 2600, c: '#c8d4ff', a: 0.5, ey: 0.55 }, { x: 2620, y: 640, r: 760, c: '#ffc890', a: 0.85, ey: 0.6 }, { x: 200, y: 1180, r: 460, c: '#ffd9a0', a: 0.55 }];
      LB.forEach(([x, y]) => L.push({ x, y: y - 60, r: 300, c: '#ffcf96', a: 0.6, glow: 24, gx: x, gy: y - 100, gc: '#ffb060', ga: 0.5 }));
      return L;
    })(),
    paint(c) {
      const r = JX.rng(1901);
      c.fillStyle = P.vgrad(c, 0, 0, 300, [[0, '#0a1030'], [1, '#2a3c72']]); c.fillRect(0, 0, 3200, 300);
      for (let i = 0; i < 150; i++) { c.fillStyle = 'rgba(240,244,255,' + (0.2 + r() * 0.6) + ')'; c.fillRect(r() * 3200, r() * 190, 1.6, 1.6); }
      P.ellipse(c, 430, 92, 36, 36, '#f4efd8'); P.glow(c, 430, 92, 190, '#f4efd8', 0.35);
      /* 北岸的山：宝石山上一座塔，葛岭半山腰一片灯火 */
      c.fillStyle = '#101836'; c.beginPath(); c.moveTo(0, 262); c.bezierCurveTo(300, 210, 700, 236, 1000, 200); c.bezierCurveTo(1300, 120, 1500, 90, 1700, 150); c.bezierCurveTo(1950, 60, 2400, 30, 2800, 120); c.bezierCurveTo(3000, 160, 3100, 200, 3200, 190); c.lineTo(3200, 290); c.lineTo(0, 290); c.closePath(); c.fill();
      c.fillStyle = '#0c1228'; c.beginPath(); c.moveTo(1492, 112); c.lineTo(1497, 40); c.lineTo(1500, 22); c.lineTo(1503, 40); c.lineTo(1508, 112); c.closePath(); c.fill(); for (let i = 0; i < 5; i++) c.fillRect(1490 - i * 0.6, 100 - i * 15, 20 + i * 1.2, 2.4);
      for (let i = 0; i < 46; i++) { const x = 2300 + r() * 380, y = 120 + r() * 70; P.glow(c, x, y, 6 + r() * 9, r() < 0.75 ? '#ffc478' : '#ff9a70', 0.85); }
      for (let i = 0; i < 5; i++) { const x = 2330 + i * 70, y = 150 + (i % 2) * 22; c.fillStyle = '#0c1228'; c.beginPath(); c.moveTo(x - 30, y); c.lineTo(x, y - 14); c.lineTo(x + 30, y); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,200,120,0.8)'; c.fillRect(x - 18, y + 2, 36, 9); }
      P.glow(c, 2480, 160, 260, '#ffb870', 0.3);
      /* 断桥、白堤：一道细细的堤，一座小拱桥 */
      c.fillStyle = '#0e1630'; c.fillRect(0, 262, 1300, 9); c.beginPath(); c.moveTo(640, 264); c.quadraticCurveTo(700, 226, 760, 264); c.closePath(); c.fill(); c.fillStyle = '#2a3c72'; c.beginPath(); c.arc(700, 268, 18, Math.PI, 0); c.fill();
      for (let i = 0; i < 22; i++) { const x = r() * 1300; c.fillStyle = '#0e1630'; c.beginPath(); c.ellipse(x, 256, 9 + r() * 8, 12 + r() * 8, 0, 0, 6.3); c.fill(); }      // 堤上的柳
      c.fillStyle = '#131c3c'; c.fillRect(0, 272, 3200, 32);
      for (let i = 0; i < 90; i++) { const x = r() * 3200, y = 276 + r() * 22; P.glow(c, x, y, 5 + r() * 6, r() < 0.7 ? '#ffc478' : '#ff9a70', 0.7); }
      /* 水 */
      c.fillStyle = P.vgrad(c, 0, 300, 1100, [[0, '#1c2c56'], [0.5, '#17264a'], [1, '#101c3a']]); c.fillRect(0, 300, 3200, 1100);
      for (let i = 0; i < 26; i++) { const y = 310 + i * 22 + r() * 8, w = 60 - i * 1.4; c.fillStyle = 'rgba(244,239,216,' + (0.16 - i * 0.004) + ')'; c.fillRect(430 - w / 2 + (r() - 0.5) * 30, y, w, 3); }      // 月亮的倒影
      for (let i = 0; i < 420; i++) { const x = r() * 3200, y = 310 + r() * 1080; c.strokeStyle = 'rgba(170,190,240,' + (0.04 + r() * 0.08) + ')'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 90, y); c.stroke(); }
      for (let i = 0; i < 70; i++) { const x = r() * 3200, y = 312 + r() * 90; P.glow(c, x, y, 5 + r() * 7, r() < 0.7 ? '#ffc478' : '#ff9a70', 0.6); c.fillStyle = 'rgba(255,190,110,0.12)'; c.fillRect(x - 1.5, y + 4, 3, 14 + r() * 14); }      // 远处的灯船
      /* 左下：涌金门外的码头，一株柳 */
      c.fillStyle = P.vgrad(c, 0, 1120, 280, [[0, '#6a6a72'], [1, '#3a3a44']]); c.beginPath(); c.moveTo(0, 1120); c.lineTo(230, 1120); c.lineTo(270, 1160); c.lineTo(270, 1400); c.lineTo(0, 1400); c.closePath(); c.fill(); c.strokeStyle = INK(0.85); c.lineWidth = 2; c.stroke();
      for (let i = 0; i < 5; i++) P.line(c, 0, 1160 + i * 48, 270, 1160 + i * 48, 1.4, 'rgba(0,0,0,0.3)'); for (let i = 0; i < 4; i++) P.line(c, 60 + i * 60, 1120, 60 + i * 60, 1400, 1.2, 'rgba(0,0,0,0.22)');
      P.line(c, 236, 1120, 236, 1060, 8, '#3a2a1e'); P.lantern(c, 236, 1046, 16, { cord: 0 });
      c.strokeStyle = '#1c1612'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(90, 1130); c.quadraticCurveTo(70, 990, 120, 880); c.stroke(); c.lineWidth = 10; c.beginPath(); c.moveTo(118, 890); c.quadraticCurveTo(170, 830, 250, 820); c.moveTo(108, 920); c.quadraticCurveTo(60, 850, 20, 850); c.stroke();
      for (let i = 0; i < 26; i++) { const x = 10 + r() * 280, y0 = 820 + r() * 50, len = 120 + r() * 170; c.strokeStyle = 'rgba(70,100,74,' + (0.5 + r() * 0.3) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + (r() - 0.5) * 30, y0 + len * 0.6, x + (r() - 0.5) * 24, y0 + len); c.stroke(); }
      P.paper(c, 3200, 1400, 37, 0.3);
    },
    props: LB.map(([x, y, kind], i) => ({ x, y, bw: 330, bh: 190, below: 26, block: [-150, -34, 300, 52], draw(g) { lampBoat(g, kind, 60 + i); } })).concat([
      /* 平章的画舫：三排大船，前后错着，用铁索连成一片 */
      { x: 2620, y: 760, bw: 860, bh: 400, below: 30, block: [-400, -150, 800, 170], draw(g) {
        g.fillStyle = 'rgba(8,12,28,0.5)'; g.beginPath(); g.ellipse(0, 6, 410, 30, 0, 0, 6.3); g.fill();
        g.save(); g.translate(-250, -130); g.scale(0.82, 0.82); bigBoat(g, 380, 1, 81); g.restore();
        g.save(); g.translate(250, -134); g.scale(0.82, 0.82); bigBoat(g, 380, 1, 82); g.restore();
        g.save(); g.translate(0, -150); g.scale(0.9, 0.9); bigBoat(g, 460, 2, 83); g.restore();
        g.save(); g.translate(-262, -22); bigBoat(g, 300, 1, 84); g.restore();
        g.save(); g.translate(262, -22); bigBoat(g, 300, 1, 85); g.restore();
        g.save(); g.translate(0, -6); const top = bigBoat(g, 330, 2, 86); g.restore();
        /* 桅杆和一串一串的红灯 */
        P.line(g, 0, top - 10, 0, top - 110, 5, '#3a2a1e');
        [[-400, -150], [400, -150], [-250, -250], [250, -250]].forEach(([tx, ty]) => {
          g.strokeStyle = INK(0.7); g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, top - 106); g.quadraticCurveTo(tx / 2, (top - 106 + ty) / 2 + 40, tx, ty); g.stroke();
          for (let i = 1; i < 8; i++) { const u = i / 8, x = 2 * u * (1 - u) * (tx / 2) + u * u * tx, y = (1 - u) * (1 - u) * (top - 106) + 2 * u * (1 - u) * ((top - 106 + ty) / 2 + 40) + u * u * ty; P.lantern(g, x, y + 10, 8, { cord: 3, tassel: false }); }
        });
        /* 铁索 */
        g.strokeStyle = 'rgba(20,20,26,0.9)'; g.lineWidth = 2.4; [[-130, -70], [130, -70], [-120, -30], [120, -30]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x - 26, y); g.quadraticCurveTo(x, y + 12, x + 26, y); g.stroke(); });
      } },
    ]),
    anim(c, t) {                                                    // 水面上的碎光
      c.lineCap = 'round';
      for (let i = 0; i < 70; i++) { const sx = (i * 397.3) % 3200, sy = 330 + ((i * 251.7) % 1040), a = 0.5 + 0.5 * Math.sin(t * (0.6 + (i % 5) * 0.14) + i); if (a < 0.3) continue; c.strokeStyle = 'rgba(200,214,255,' + (0.12 * a) + ')'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx + Math.sin(t * 0.3 + i) * 12, sy); c.lineTo(sx + 44 + (i % 4) * 14 + Math.sin(t * 0.3 + i) * 12, sy); c.stroke(); }
      LB.forEach(([x, y], i) => { const a = 0.14 + 0.05 * Math.sin(t * 2 + i); c.fillStyle = 'rgba(255,190,110,' + a + ')'; c.fillRect(x - 60, y + 22 + Math.sin(t * 1.4 + i) * 2, 120, 3); c.fillRect(x - 36, y + 34 + Math.sin(t * 1.7 + i) * 2, 72, 2.4); });
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(255,150,100,' + (0.16 + 0.05 * Math.sin(t * 1.8 + i)) + ')'; c.fillRect(2620 - 330 + i * 26, 790 + i * 12 + Math.sin(t * 1.3 + i) * 2, 660 - i * 52, 3); }
    },
    glow(c, t, W) {                                                 // 自己船头的灯
      const p = W.player; if (!p || p.vis === false) return;
      const g = c.createRadialGradient(p.x, p.y - 60, 0, p.x, p.y - 60, 300); g.addColorStop(0, 'rgba(255,200,130,0.3)'); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(p.x - 300, p.y - 360, 600, 600);
    },
  };

  /* ================= 平章的画舫，正月十八夜 =================
     上来的地方是最外头的两条船：左手一条大的，舱楼里是灯宴（进不去）；右手一条小些的，船头朝着湖。
     船头外面还泊着两条小船（画成会晃的人物，在 story.js 里），梅花翅就在那两条船之间跳。 */
  S.huafang = {
    name: '平章的画舫', sub: '湖心 · 连成一片的灯船', w: 2600, h: 1080, ambient: '#a39892', music: 'yuanxi', outside: '#05060a',
    walk: [[110, 640, 1740, 880]],
    spawns: { start: { x: 220, y: 800, dir: 3 }, bow: { x: 1540, y: 790, dir: 3 } },
    exits: [],
    marks: [{ t: '正舱 · 灯宴', x: 790, y: 60 }],
    lights: [
      { x: 760, y: 660, r: 1000, c: '#ffd0a0', a: 0.75, ey: 0.7 }, { x: 1540, y: 680, r: 640, c: '#ffc890', a: 0.65, ey: 0.8 },
      { x: 2040, y: 700, r: 420, c: '#ffc890', a: 0.6 }, { x: 2380, y: 610, r: 400, c: '#ffc890', a: 0.6 }, { x: 1900, y: 500, r: 1500, c: '#c0ccf0', a: 0.38, ey: 0.7 },
      { x: 1540, y: 300, r: 10, c: '#ffb070', a: 0, glow: 80, gx: 1540, gy: 330, gc: '#ff9a5a', ga: 0.4 }, { x: 600, y: 330, r: 10, c: '#ffb070', a: 0, glow: 90, gx: 520, gy: 330, gc: '#ff9a5a', ga: 0.35 }, { x: 1040, y: 330, r: 10, c: '#ffb070', a: 0, glow: 90, gx: 1060, gy: 330, gc: '#ff9a5a', ga: 0.35 },
    ],
    paint(c) {
      const r = JX.rng(2001);
      /* 天、远岸、水 */
      c.fillStyle = P.vgrad(c, 0, 0, 230, [[0, '#0a1030'], [1, '#27386c']]); c.fillRect(0, 0, 2600, 230);
      for (let i = 0; i < 110; i++) { c.fillStyle = 'rgba(240,244,255,' + (0.2 + r() * 0.6) + ')'; c.fillRect(r() * 2600, r() * 150, 1.6, 1.6); }
      c.fillStyle = '#101836'; c.beginPath(); c.moveTo(0, 200); c.bezierCurveTo(500, 150, 1200, 180, 1700, 150); c.bezierCurveTo(2100, 110, 2400, 150, 2600, 170); c.lineTo(2600, 232); c.lineTo(0, 232); c.closePath(); c.fill();
      for (let i = 0; i < 30; i++) P.glow(c, 1900 + r() * 500, 150 + r() * 40, 5 + r() * 8, '#ffc478', 0.8);      // 葛岭的灯火
      c.fillStyle = P.vgrad(c, 0, 228, 852, [[0, '#1c2c56'], [0.5, '#16254a'], [1, '#0e1a36']]); c.fillRect(0, 228, 2600, 852);
      for (let i = 0; i < 260; i++) { const x = r() * 2600, y = 236 + r() * 840; c.strokeStyle = 'rgba(170,190,240,' + (0.04 + r() * 0.08) + ')'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 80, y); c.stroke(); }
      /* 后面还连着的船：一排舱楼的影子 */
      [[1830, 420, 380, 2], [2260, 400, 360, 1], [2540, 440, 300, 1]].forEach(([x, y, w, t], i) => { c.save(); c.translate(x, y); c.globalAlpha = 0.9; (function () { const g = c; const hw = w / 2; g.fillStyle = '#1c1420'; g.beginPath(); g.moveTo(-hw, -40); g.quadraticCurveTo(-hw + 30, 6, -hw + 80, 8); g.lineTo(hw - 80, 8); g.quadraticCurveTo(hw - 30, 6, hw, -40); g.closePath(); g.fill(); let bw = w - 120, yy = -34; for (let k = 0; k < t; k++) { g.fillStyle = '#241828'; g.fillRect(-bw / 2, yy - 60, bw, 60); const n = Math.round(bw / 60); for (let q = 0; q < n; q++) { g.fillStyle = 'rgba(255,196,120,0.82)'; g.fillRect(-bw / 2 + q * bw / n + 8, yy - 50, bw / n - 16, 36); } yy -= 60; g.fillStyle = '#161020'; g.beginPath(); g.moveTo(-bw / 2 - 26, yy + 4); g.lineTo(-bw / 2 + 10, yy - 16); g.lineTo(bw / 2 - 10, yy - 16); g.lineTo(bw / 2 + 26, yy + 4); g.closePath(); g.fill(); for (let x2 = -bw / 2 - 10; x2 <= bw / 2 + 10; x2 += 36) P.lantern(g, x2, yy + 18, 7, { cord: 3, tassel: false }); yy -= 16; bw -= 110; } })(); c.restore(); void i; });
      for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(255,170,110,' + (0.12 - i * 0.015) + ')'; c.fillRect(1700, 440 + i * 16, 900, 4); }
      /* 两条船的船身（甲板以下的那一截） */
      const hull = (x0, x1, y0) => { c.fillStyle = P.vgrad(c, 0, y0, 120, [[0, '#5a3a26'], [1, '#1e140e']]); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1 - 30, y0 + 110); c.lineTo(x0 + 30, y0 + 110); c.closePath(); c.fill(); c.strokeStyle = INK(0.9); c.lineWidth = 2; c.stroke(); for (let y = y0 + 26; y < y0 + 110; y += 28) P.line(c, x0 + 8, y, x1 - 8, y, 1.4, 'rgba(0,0,0,0.35)'); };
      hull(40, 1300, 900); hull(1300, 1770, 900);
      /* 甲板 */
      P.planks(c, 40, 560, 1260, 344, { seed: 201 }); P.planks(c, 1300, 584, 470, 320, { seed: 202 });
      c.fillStyle = 'rgba(255,214,170,0.1)'; c.fillRect(40, 560, 1730, 344);
      /* 右手那条船的船头：削出一个尖 */
      c.fillStyle = P.vgrad(c, 0, 228, 852, [[0, '#1c2c56'], [0.5, '#16254a'], [1, '#0e1a36']]); c.beginPath(); c.moveTo(1770, 560); c.lineTo(1700, 584); c.quadraticCurveTo(1790, 640, 1770, 720); c.lineTo(1780, 560); c.closePath(); c.fill();
      c.strokeStyle = '#6a4630'; c.lineWidth = 10; c.beginPath(); c.moveTo(1300, 586); c.lineTo(1700, 586); c.quadraticCurveTo(1786, 640, 1768, 904); c.stroke(); c.strokeStyle = INK(0.85); c.lineWidth = 1.6; c.beginPath(); c.moveTo(1300, 580); c.lineTo(1702, 580); c.quadraticCurveTo(1794, 640, 1774, 904); c.stroke();
      /* 两条船之间：一道缝，上头搭着跳板，缆绳捆着 */
      c.fillStyle = '#0c0a0c'; c.fillRect(1292, 560, 14, 344); c.fillStyle = '#8a6846'; c.fillRect(1262, 650, 74, 220); c.strokeStyle = INK(0.85); c.lineWidth = 1.6; c.strokeRect(1262, 650, 74, 220); for (let y = 672; y < 870; y += 22) P.line(c, 1262, y, 1336, y, 1, 'rgba(0,0,0,0.3)');
      [600, 884].forEach(y => { c.strokeStyle = '#c9b48a'; c.lineWidth = 5; c.beginPath(); c.moveTo(1276, y); c.quadraticCurveTo(1299, y + 14, 1322, y); c.stroke(); c.strokeStyle = INK(0.6); c.lineWidth = 1; c.stroke(); });
      /* 左手大船的舱楼：两层，朱柱，槅扇里透着灯，满檐的红灯 */
      const X0 = 330, X1 = 1250;
      c.fillStyle = '#2e1a14'; c.fillRect(X0, 300, X1 - X0, 262);
      const n = 6, cw = (X1 - X0) / n;
      for (let i = 0; i < n; i++) {
        const x = X0 + i * cw;
        if (i === 2) {                                               // 舱门：垂着帘子
          c.fillStyle = '#140c0a'; c.fillRect(x + 20, 330, cw - 40, 232); c.fillStyle = P.vgrad(c, 0, 330, 200, [[0, '#a8483a'], [1, '#6a2a22']]); c.beginPath(); c.moveTo(x + 20, 330); c.lineTo(x + cw - 20, 330); c.lineTo(x + cw - 20, 500); c.quadraticCurveTo(x + cw / 2, 540, x + 20, 470); c.closePath(); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.stroke();
          for (let q = 1; q < 6; q++) P.line(c, x + 20 + q * (cw - 40) / 6, 330, x + 20 + q * (cw - 40) / 6, 480, 1, 'rgba(0,0,0,0.2)');
          c.fillStyle = 'rgba(255,214,150,0.55)'; c.beginPath(); c.moveTo(x + 20, 472); c.quadraticCurveTo(x + cw / 2, 542, x + cw - 20, 502); c.lineTo(x + cw - 20, 562); c.lineTo(x + 20, 562); c.closePath(); c.fill();
        } else {
          c.fillStyle = P.vgrad(c, 0, 334, 170, [[0, '#ffe0a8'], [1, '#e8a45a']]); c.fillRect(x + 16, 334, cw - 32, 170);
          for (let k = 0; k < 2; k++) if (r() < 0.8) { const sx = x + 40 + r() * (cw - 80), sy = 400 + r() * 20; c.fillStyle = 'rgba(60,30,16,0.62)'; c.beginPath(); c.arc(sx, sy, 15, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(sx - 26, 504); c.quadraticCurveTo(sx - 24, sy + 16, sx, sy + 12); c.quadraticCurveTo(sx + 24, sy + 16, sx + 26, 504); c.closePath(); c.fill(); }
          c.strokeStyle = 'rgba(90,40,20,0.8)'; c.lineWidth = 2; for (let q = 1; q < 6; q++) { c.beginPath(); c.moveTo(x + 16 + q * (cw - 32) / 6, 334); c.lineTo(x + 16 + q * (cw - 32) / 6, 504); c.stroke(); } for (let q = 1; q < 4; q++) { c.beginPath(); c.moveTo(x + 16, 334 + q * 42.5); c.lineTo(x + cw - 16, 334 + q * 42.5); c.stroke(); }
          c.fillStyle = '#4a2a1e'; c.fillRect(x + 16, 504, cw - 32, 58); c.strokeStyle = INK(0.7); c.lineWidth = 1.2; c.strokeRect(x + 22, 512, cw - 44, 40);
        }
      }
      for (let i = 0; i <= n; i++) P.post(c, X0 + i * cw - 11, 300, 22, 262, '#8e2a20');
      /* 下层的檐 */
      c.fillStyle = '#241816'; c.beginPath(); c.moveTo(X0 - 70, 312); c.quadraticCurveTo(X0 - 40, 286, X0 + 20, 262); c.lineTo(X1 - 20, 262); c.quadraticCurveTo(X1 + 40, 286, X1 + 70, 312); c.lineTo(X1 + 40, 318); c.lineTo(X0 - 40, 318); c.closePath(); c.fill(); c.strokeStyle = INK(0.9); c.lineWidth = 1.8; c.stroke();
      for (let x = X0 - 20; x < X1 + 20; x += 26) P.line(c, x, 266, x - 6, 314, 1.2, 'rgba(0,0,0,0.35)');
      /* 上层 */
      c.fillStyle = '#2e1a14'; c.fillRect(X0 + 180, 150, X1 - X0 - 360, 114);
      for (let i = 0; i < 4; i++) { const x = X0 + 180 + i * (X1 - X0 - 360) / 4, w = (X1 - X0 - 360) / 4; c.fillStyle = P.vgrad(c, 0, 164, 86, [[0, '#ffdca0'], [1, '#e09a52']]); c.fillRect(x + 12, 164, w - 24, 86); c.strokeStyle = 'rgba(90,40,20,0.8)'; c.lineWidth = 1.6; for (let q = 1; q < 5; q++) { c.beginPath(); c.moveTo(x + 12 + q * (w - 24) / 5, 164); c.lineTo(x + 12 + q * (w - 24) / 5, 250); c.stroke(); } if (r() < 0.8) { const sx = x + w * (0.3 + r() * 0.4); c.fillStyle = 'rgba(60,30,16,0.6)'; c.beginPath(); c.arc(sx, 204, 11, 0, 6.3); c.fill(); c.fillRect(sx - 15, 214, 30, 36); } P.post(c, x - 8, 150, 16, 114, '#8e2a20'); }
      P.post(c, X1 - 188, 150, 16, 114, '#8e2a20');
      c.fillStyle = '#241816'; c.beginPath(); c.moveTo(X0 + 120, 160); c.quadraticCurveTo(X0 + 150, 136, X0 + 200, 116); c.lineTo(X1 - 200, 116); c.quadraticCurveTo(X1 - 150, 136, X1 - 120, 160); c.lineTo(X1 - 150, 166); c.lineTo(X0 + 150, 166); c.closePath(); c.fill(); c.strokeStyle = INK(0.9); c.lineWidth = 1.8; c.stroke();
      /* 满檐的灯 */
      for (let x = X0 - 40; x <= X1 + 40; x += 62) P.lantern(c, x, 344, 13, { cord: 12, tassel: false });
      for (let x = X0 + 150; x <= X1 - 150; x += 62) P.lantern(c, x, 186, 10, { cord: 8, tassel: false });
      /* 右手那条船：一根桅杆，几串红灯牵到舱楼的檐角和船头 */
      P.line(c, 1540, 610, 1540, 110, 9, '#3a2a1e'); P.line(c, 1540, 610, 1540, 110, 3, 'rgba(255,220,180,0.12)');
      [[1300, 280], [1764, 540], [1380, 560]].forEach(([tx, ty]) => {
        const mx = (1540 + tx) / 2, my = (120 + ty) / 2 + 70;
        c.strokeStyle = INK(0.75); c.lineWidth = 1.4; c.beginPath(); c.moveTo(1540, 120); c.quadraticCurveTo(mx, my, tx, ty); c.stroke();
        for (let i = 1; i < 8; i++) { const u = i / 8, x = (1 - u) * (1 - u) * 1540 + 2 * u * (1 - u) * mx + u * u * tx, y = (1 - u) * (1 - u) * 120 + 2 * u * (1 - u) * my + u * u * ty; P.lantern(c, x, y + 14, 11, { cord: 4, tassel: false }); }
      });
      /* 后舷的栏杆 */
      for (let x = 1316; x <= 1690; x += 46) P.line(c, x, 640, x, 580, 5, '#5a3a28'); P.line(c, 1306, 584, 1700, 584, 6, '#6a4630'); P.line(c, 1306, 612, 1700, 612, 3, '#5a3a28');
      for (let x = 60; x <= 320; x += 46) P.line(c, x, 640, x, 566, 5, '#5a3a28'); P.line(c, 46, 570, 330, 570, 6, '#6a4630'); P.line(c, 46, 604, 330, 604, 3, '#5a3a28');
      /* 左手：上船的软梯口 */
      c.fillStyle = '#0c0a0c'; c.fillRect(40, 700, 30, 170); for (let y = 712; y < 870; y += 24) P.line(c, 40, y, 74, y, 4, '#c9b48a');
      /* 连到外头小船的铁索 */
      c.strokeStyle = 'rgba(16,16,22,0.9)'; c.lineWidth = 3; c.beginPath(); c.moveTo(1770, 760); c.quadraticCurveTo(1840, 830, 1900, 772); c.stroke(); c.beginPath(); c.moveTo(2180, 730); c.quadraticCurveTo(2230, 760, 2250, 690); c.stroke();
      P.ao(c, 40, 560, 1260, 60, 'top', 0.4);
      P.paper(c, 2600, 1080, 41, 0.3);
    },
    props: [
      /* 甲板上的东西：一摞酒坛、一张摆果子的条案、两只鼓凳 */
      { x: 1180, y: 660, bw: 150, bh: 110, block: [-64, -20, 128, 24], draw(g) { P.shadow(g, 0, 0, 66, 12, 0.4); for (let i = 0; i < 3; i++) P.jar(g, -40 + i * 40, 0, 0.6, { seed: 30 + i, text: '酒' }); P.jar(g, -20, -44, 0.56, { seed: 34, text: '酒' }); } },
      { x: 480, y: 660, bw: 240, bh: 110, block: [-110, -20, 220, 24], draw(g) { P.table(g, 0, 0, 210, 30, 44, { col: '#5a3a28', seed: 5 }); [[-70, '#d98a3a'], [-20, '#c8362e'], [34, '#d9b03a'], [76, '#8aa05a']].forEach(([x, col]) => { P.ellipse(g, x, -80, 18, 6, '#d8ece0', INK(0.8), 1); for (let k = 0; k < 4; k++) P.ellipse(g, x - 9 + k * 6, -86 - (k % 2) * 5, 5, 5, col, INK(0.5), 0.6); }); } },
      { x: 1440, y: 690, bw: 60, bh: 60, block: [-22, -12, 44, 16], draw(g) { P.shadow(g, 0, 0, 26, 8, 0.4); g.fillStyle = P.hgrad(g, -24, 0, 48, [[0, '#6a3a2a'], [0.5, '#b8433a'], [1, '#5a2a20']]); g.beginPath(); g.moveTo(-18, -44); g.lineTo(18, -44); g.quadraticCurveTo(30, -22, 18, 0); g.lineTo(-18, 0); g.quadraticCurveTo(-30, -22, -18, -44); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke(); P.ellipse(g, 0, -44, 18, 5.4, '#d9a8a0', INK(), 1.2); } },
    ],
    anim(c, t) {
      c.lineCap = 'round';
      for (let i = 0; i < 34; i++) { const sx = 1780 + (i * 197.3) % 800, sy = 470 + ((i * 131.7) % 590), a = 0.5 + 0.5 * Math.sin(t * (0.7 + (i % 5) * 0.15) + i); if (a < 0.3) continue; c.strokeStyle = 'rgba(255,200,150,' + (0.14 * a) + ')'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 40 + (i % 4) * 12, sy); c.stroke(); }
      for (let i = 0; i < 16; i++) { const sx = (i * 173.1) % 1780, sy = 1014 + (i % 4) * 16, a = 0.5 + 0.5 * Math.sin(t * 0.9 + i); c.strokeStyle = 'rgba(255,200,150,' + (0.12 * a) + ')'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 50, sy); c.stroke(); }
    },
  };

  /* ================= 临安府公堂，正月十九晨 =================
     正中一座矮台，台上是公案；左手的门开着，天光从那边进来。堂下左侧添了一把交椅（贺元度），右侧是书吏的小案。 */
  S.gongtang = {
    name: '临安府公堂', sub: '正月十九 · 卯时', w: 1920, h: 1080, ambient: '#aaa49c', music: 'anliu', outside: '#16161c',
    walk: [[110, 640, 1810, 900]],
    blocks: [[600, 640, 720, 14]],                                  // 矮台的前沿
    spawns: { start: { x: 230, y: 800, dir: 3 } },
    exits: [],
    marks: [{ t: '公案', x: 960, y: 150 }],
    lights: [
      { x: 60, y: 760, r: 1000, c: '#fff4dc', a: 0.8, ey: 0.75 }, { x: 960, y: 700, r: 1500, c: '#fff0d8', a: 0.55, ey: 0.6 },
      { x: 660, y: 520, r: 300, c: '#ffd9a0', a: 0.4, glow: 20, gx: 640, gy: 404, gc: '#ffc070', ga: 0.6 }, { x: 1260, y: 520, r: 300, c: '#ffd9a0', a: 0.4, glow: 20, gx: 1280, gy: 404, gc: '#ffc070', ga: 0.6 },
    ],
    paint(c) {
      const r = JX.rng(2101);
      P.flagstones(c, 0, 560, 1920, 520, { seed: 211 }); c.fillStyle = 'rgba(226,214,190,0.14)'; c.fillRect(0, 560, 1920, 520);
      P.plaster(c, 0, 110, 1920, 450, { seed: 212 });
      c.fillStyle = '#2e2018'; c.fillRect(0, 0, 1920, 116); P.beam(c, 0, 100, 1920, 24, '#4a3122');
      c.fillStyle = '#5a4034'; c.fillRect(0, 440, 1920, 120); c.strokeStyle = INK(0.8); c.lineWidth = 1.4; c.strokeRect(0, 440, 1920, 120); for (let x = 40; x < 1920; x += 130) c.strokeRect(x, 454, 110, 92);
      [100, 420, 1500, 1820].forEach(x => P.post(c, x, 100, 26, 470, '#7a2a20'));
      /* 公案后面的大屏风：一幅水墨的山 */
      c.fillStyle = '#3a271b'; c.fillRect(640, 150, 640, 400); c.strokeStyle = INK(0.9); c.lineWidth = 2; c.strokeRect(640, 150, 640, 400);
      c.fillStyle = P.vgrad(c, 0, 168, 340, [[0, '#e9e0c8'], [1, '#d6cab0']]); c.fillRect(658, 168, 604, 340); c.strokeStyle = INK(0.7); c.lineWidth = 1.2; c.strokeRect(658, 168, 604, 340);
      c.save(); c.beginPath(); c.rect(658, 168, 604, 340); c.clip();
      [[0.16, 430, 150], [0.22, 400, 190], [0.34, 350, 240]].forEach(([a, base, amp], k) => { c.fillStyle = 'rgba(40,36,34,' + a + ')'; c.beginPath(); c.moveTo(658, 508); for (let x = 658; x <= 1262; x += 30) { const u = (x - 658) / 604; c.lineTo(x, base - Math.abs(Math.sin(u * (3 + k) + k * 1.7)) * amp * (0.4 + 0.6 * Math.sin(u * Math.PI)) + r() * 8); } c.lineTo(1262, 508); c.closePath(); c.fill(); });
      for (let i = 0; i < 12; i++) { c.strokeStyle = 'rgba(40,36,34,0.2)'; c.lineWidth = 1.2; const y = 440 + r() * 60, x = 670 + r() * 520; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 30, y - 5, x + 60, y); c.stroke(); }
      P.ellipse(c, 1170, 226, 22, 22, 'rgba(181,48,42,0.75)');
      c.restore();
      c.fillStyle = '#3a271b'; c.fillRect(620, 508, 680, 44); c.strokeStyle = INK(0.9); c.lineWidth = 1.6; c.strokeRect(620, 508, 680, 44);
      /* 矮台 */
      c.fillStyle = P.vgrad(c, 0, 548, 92, [[0, '#7a5a40'], [1, '#6a4c36']]); c.fillRect(600, 548, 720, 92); c.strokeStyle = INK(0.9); c.lineWidth = 1.8; c.strokeRect(600, 548, 720, 92);
      c.fillStyle = '#4a3324'; c.fillRect(600, 640, 720, 16); c.strokeRect(600, 640, 720, 16); for (let x = 640; x < 1320; x += 60) P.line(c, x, 550, x, 638, 1, 'rgba(0,0,0,0.2)');
      /* 台两边的灯架 */
      [640, 1280].forEach(x => { P.line(c, x, 548, x, 420, 6, '#3a2a1e'); P.ellipse(c, x, 548, 20, 6, '#3a2a1e'); P.ellipse(c, x, 418, 14, 5, '#4a3526'); const g = c.createRadialGradient(x, 404, 0, x, 404, 12); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.5, '#ffc45a'); g.addColorStop(1, 'rgba(255,150,40,0)'); P.ellipse(c, x, 404, 6, 12, g); });
      /* 左手的门：开着，外头是清早的天光 */
      c.fillStyle = P.vgrad(c, 0, 300, 590, [[0, '#dfe6ee'], [1, '#f4ecd8']]); c.fillRect(0, 300, 70, 590); c.strokeStyle = '#4a2f20'; c.lineWidth = 12; c.strokeRect(-6, 296, 78, 598);
      c.fillStyle = '#4a2f20'; c.fillRect(70, 300, 26, 590); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(70, 300, 26, 590);
      c.fillStyle = 'rgba(255,244,214,0.22)'; c.beginPath(); c.moveTo(70, 640); c.lineTo(620, 700); c.lineTo(560, 900); c.lineTo(70, 890); c.closePath(); c.fill();
      /* 右墙边：一架杖 */
      c.fillStyle = '#3a271b'; c.fillRect(1600, 470, 180, 12); c.fillRect(1600, 540, 180, 12); for (let i = 0; i < 6; i++) { P.line(c, 1620 + i * 28, 560, 1616 + i * 28, 250, 6, i % 2 ? '#7a2a20' : '#2a2420'); P.line(c, 1620 + i * 28, 560, 1616 + i * 28, 250, 1.4, 'rgba(255,230,200,0.14)'); }
      /* 右手尽头：通牢里的门，黑着 */
      c.fillStyle = '#17110d'; c.fillRect(1856, 300, 64, 590); c.fillStyle = '#3a2418'; c.fillRect(1840, 300, 20, 590); c.strokeStyle = INK(); c.lineWidth = 1.6; c.strokeRect(1840, 300, 20, 590); P.beam(c, 1830, 286, 90, 16, '#3a2418');
      /* 左墙边：一面鼓 */
      P.line(c, 220, 560, 250, 420, 6, '#4a3122'); P.line(c, 340, 560, 310, 420, 6, '#4a3122'); P.ellipse(c, 280, 380, 58, 62, '#8e2a20', INK(), 2); P.ellipse(c, 280, 380, 44, 48, '#e4d6b4', INK(0.7), 1.4); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; P.ellipse(c, 280 + Math.cos(a) * 51, 380 + Math.sin(a) * 55, 2.4, 2.4, '#d7a544'); }
      P.ao(c, 0, 560, 1920, 70, 'top', 0.4);
      P.ao(c, 0, 1000, 1920, 80, 'bottom', 0.3);
      P.paper(c, 1920, 1080, 43, 0.4);
    },
    props: [
      /* 推官的椅子 */
      { x: 960, y: 612, bw: 110, bh: 170, sortY: 560, draw(g) { g.fillStyle = '#4f3424'; g.fillRect(-42, -160, 84, 130); g.strokeStyle = INK(); g.lineWidth = 1.6; g.strokeRect(-42, -160, 84, 130); g.fillStyle = '#7a2a20'; g.fillRect(-32, -150, 64, 70); g.strokeRect(-32, -150, 64, 70); } },
      /* 公案：红桌围，案上是惊堂木、笔架，还有三样物证——没盖的壶、一只壶盖、一只花篮 */
      { x: 960, y: 656, bw: 440, bh: 150, block: [-206, -22, 412, 26], draw(g) {
        P.shadow(g, 0, 0, 210, 14, 0.36);
        g.fillStyle = '#4a3122'; g.fillRect(-204, -86, 408, 14); g.strokeStyle = INK(); g.lineWidth = 1.6; g.strokeRect(-204, -86, 408, 14);
        g.fillStyle = P.vgrad(g, 0, -72, 72, [[0, '#a8352c'], [1, '#7a2420']]); g.fillRect(-196, -72, 392, 72); g.strokeRect(-196, -72, 392, 72);
        g.strokeStyle = 'rgba(215,165,68,0.8)'; g.lineWidth = 2; g.strokeRect(-184, -62, 368, 52); P.ellipse(g, 0, -36, 26, 20, 'rgba(0,0,0,0)', 'rgba(215,165,68,0.8)', 2); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; P.line(g, Math.cos(a) * 8, -36 + Math.sin(a) * 6, Math.cos(a) * 22, -36 + Math.sin(a) * 17, 1.6, 'rgba(215,165,68,0.7)'); }
        g.fillStyle = '#2a1c14'; g.fillRect(-150, -98, 26, 12); g.strokeStyle = INK(); g.lineWidth = 1; g.strokeRect(-150, -98, 26, 12);                                                    // 惊堂木
        g.fillStyle = '#3a2a1e'; g.fillRect(-104, -92, 40, 6); [-96, -84, -72].forEach(x => P.line(g, x, -92, x - 3, -122, 2.4, '#5a4030'));                                                // 笔架
        g.fillStyle = '#efe6cc'; g.fillRect(-50, -94, 60, 8); g.strokeStyle = INK(0.7); g.strokeRect(-50, -94, 60, 8);                                                                       // 卷宗
        g.fillStyle = P.hgrad(g, 40, 0, 34, [[0, '#8fae9a'], [0.4, '#e6f2e8'], [1, '#7c9a88']]); g.beginPath(); g.moveTo(50, -124); g.lineTo(64, -124); g.quadraticCurveTo(78, -108, 72, -88); g.lineTo(42, -88); g.quadraticCurveTo(36, -108, 50, -124); g.closePath(); g.fill(); g.strokeStyle = INK(0.85); g.lineWidth = 1.2; g.stroke(); P.ellipse(g, 57, -124, 7, 2.4, '#2a3a32'); P.line(g, 72, -108, 86, -118, 3, '#a9c9b4');     // 没盖的壶
        P.ellipse(g, 100, -90, 11, 4.4, '#dceee2', INK(0.85), 1.2); P.ellipse(g, 100, -91, 6, 2.4, '#c4dccb');                                                                                // 壶盖，翻着
        g.strokeStyle = INK(); g.lineWidth = 2.2; g.beginPath(); g.moveTo(134, -100); g.quadraticCurveTo(156, -140, 178, -100); g.stroke(); g.strokeStyle = '#a8864a'; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = P.hgrad(g, 128, 0, 56, [[0, '#8a6a3a'], [0.5, '#c9a86a'], [1, '#7a5a30']]); g.beginPath(); g.moveTo(128, -102); g.lineTo(184, -102); g.quadraticCurveTo(182, -86, 156, -86); g.quadraticCurveTo(130, -86, 128, -102); g.closePath(); g.fill(); g.strokeStyle = INK(0.85); g.lineWidth = 1.1; g.stroke();
        [[138, '#e9a6b4'], [150, '#f6e9ec'], [162, '#e0c040'], [173, '#e0c040']].forEach(([x, col]) => P.ellipse(g, x, -106, 4.4, 4, col, INK(0.5), 0.6));                                // 花篮
      } },
      /* 堂下左侧的交椅（贺元度的） */
      { x: 500, y: 682, bw: 90, bh: 130, sortY: 650, block: [-30, -14, 60, 18], draw(g) { P.shadow(g, 0, 0, 40, 9, 0.36); g.strokeStyle = '#3a271b'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-30, 0); g.lineTo(26, -56); g.moveTo(30, 0); g.lineTo(-26, -56); g.stroke(); g.fillStyle = '#6a4630'; g.fillRect(-34, -62, 68, 9); g.strokeStyle = INK(); g.lineWidth = 1.2; g.strokeRect(-34, -62, 68, 9); g.fillStyle = '#4f3424'; g.fillRect(-32, -126, 64, 12); g.strokeRect(-32, -126, 64, 12); P.line(g, -30, -62, -30, -120, 5, '#4f3424'); P.line(g, 30, -62, 30, -120, 5, '#4f3424'); } },
      /* 书吏的小案 */
      { x: 1440, y: 700, bw: 170, bh: 110, block: [-74, -22, 148, 26], draw(g) { P.table(g, 0, 0, 140, 34, 44, { col: '#5a3a28', seed: 9 }); g.fillStyle = '#efe6cc'; g.fillRect(-40, -84, 60, 26); g.strokeStyle = INK(0.7); g.lineWidth = 1; g.strokeRect(-40, -84, 60, 26); for (let i = 0; i < 4; i++) P.line(g, -32 + i * 12, -80, -32 + i * 12, -62, 1.2, 'rgba(40,30,24,0.5)'); P.ellipse(g, 40, -72, 10, 5, '#2a2420', INK(), 1); } },
    ],
  };
})();
