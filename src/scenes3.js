/* 场景（三）：二楼回廊（词会）、三楼听潮阁。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C, Fig = JX.Fig;
  const S = JX.scenes = JX.scenes || {};
  const WARM = [[0, '#f8c478'], [1, '#c8742e']];
  function sitter(g, sp, x, dir) { g.save(); g.translate(x, 0); Fig.draw(g, sp, dir, 0.5, { pose: 'sit', seat: 34, shadow: false }); g.restore(); }
  const scholar = (seed, robe) => ({ h: 148 + (seed % 7), kind: 'robe', robe, trim: P.dark(robe, 0.45), hair: seed % 3 ? 'futou' : 'bun', beard: seed % 2 ? 'black' : null, wide: 1.5 });
  /* 一桌词客：后排坐两位，桌上有酒有纸笔，前面一条凳 */
  function guestTable(x, y, seed, o) {
    o = o || {};
    const back = (o.back || []).map((s, i, a) => ({ sp: s, x: a.length === 1 ? 0 : (i ? 50 : -50) })), front = (o.front || []).map((s, i, a) => ({ sp: s, x: a.length === 1 ? 0 : (i ? 52 : -52) }));
    const out = [];
    if (back.length) out.push({ x, y: y - 116, bw: 230, bh: 150, draw(g) { back.forEach(b => sitter(g, b.sp, b.x, 0)); } });
    out.push({ x, y, bw: 230, bh: 180, block: [-100, -140, 200, 174], draw(g) {
      P.table(g, 0, 0, 190, 96, 50, { col: '#5c3f2a', seed });
      P.dishes(g, -30, -50, 120, 90, seed + 1, 3);
      g.fillStyle = '#efe6cf'; g.fillRect(34, -128, 46, 34); g.strokeStyle = P.rgba(C.ink, 0.6); g.lineWidth = 1; g.strokeRect(34, -128, 46, 34); for (let i = 0; i < 4; i++) P.line(g, 42 + i * 10, -124, 42 + i * 10, -104 + (i % 2) * 4, 1, 'rgba(30,20,14,0.55)');   // 一张写了半阕的纸
      P.candle(g, 0, -50 - 96 * 0.55);
    } });
    out.push({ x, y: y + 44, bw: 230, bh: 150, draw(g) { P.bench(g, 0, 0, 176, { seed: seed + 5 }); front.forEach(b => sitter(g, b.sp, b.x, 2)); } });
    return out;
  }

  /* ================= 二楼回廊 ================= */
  const STAGE = { x: 1200, y: 640, w: 400, d: 170 };              // 小台：x 是中心，y 是台面后沿
  S.floor2 = {
    below(c) {      // 栏杆外是天井：一楼大堂的灯光漏上来，越往下越暗
      const g = c.createLinearGradient(0, 1238, 0, 1500); g.addColorStop(0, '#7a5632'); g.addColorStop(0.35, '#4a3020'); g.addColorStop(1, '#120c09'); c.fillStyle = g; c.fillRect(-300, 1238, 3000, 280);
    },
    name: '二楼回廊', sub: '醉春楼 · 词会', w: 2400, h: 1240, ambient: '#8a7468', music: 'yuanxi', muffle: 1300,
    walk: [[90, 350, 2310, 1150]],
    spawns: { fromHall: { x: 190, y: 430, dir: 0 }, fromUp: { x: 2210, y: 430, dir: 0 }, start: { x: 190, y: 430, dir: 0 } },
    exits: [
      { id: 'down', x: 110, y: 350, w: 160, h: 30, to: 'hall', spawn: 'fromStairs', label: '下一楼', ly: 300, back: [0, 34] },
      { id: 'up', x: 2130, y: 350, w: 160, h: 30, to: 'tingchao', spawn: 'start', label: '上三楼', ly: 300, back: [0, 34] },
    ],
    marks: [{ t: '小台', x: STAGE.x, y: STAGE.y - 130 }, { t: '贺先生的案', x: 1740, y: 600 }],
    blocks: [[STAGE.x - STAGE.w / 2 - 6, STAGE.y - 16, STAGE.w + 12, STAGE.d + 44]],
    lights: (function () {
      const L = [{ x: 1200, y: 760, r: 1300, c: '#ffe0b0', a: 0.5, ey: 0.6 }, { x: 1200, y: 1260, r: 700, c: '#ffc98a', a: 0.4, ey: 0.4 }];
      for (let i = 0; i < 6; i++) L.push({ x: 430 + i * 300, y: 320, r: 300, c: '#ffb884', a: 0.5, glow: 66, gx: 430 + i * 300, gy: 118, gc: '#ff9a5a', ga: 0.5 });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => L.push({ x: STAGE.x + sx * 232, y: STAGE.y + (sy > 0 ? STAGE.d + 30 : 0), r: 330, c: '#ffd596', a: 0.6, glow: 30, gx: STAGE.x + sx * 232, gy: STAGE.y + (sy > 0 ? STAGE.d + 30 : 0) - 118, gc: '#ffc866', ga: 0.75 }));
      [[700, 700], [1740, 700], [820, 1010], [1580, 1010]].forEach(([x, y]) => L.push({ x, y: y - 70, r: 290, c: '#ffd596', a: 0.5, glow: 26, gx: x, gy: y - 50 - 96 * 0.55 - 22, gc: '#ffc866', ga: 0.7 }));
      L.push({ x: 190, y: 340, r: 360, c: '#ffd9a0', a: 0.5 }, { x: 2210, y: 340, r: 360, c: '#ffd9a0', a: 0.5 });
      return L;
    })(),
    paint(c) {
      const r = JX.rng(511);
      P.planks(c, 0, 330, 2400, 910, { seed: 51, base: '#8c6642', pw: 44 });
      for (let i = 0; i < 30; i++) { const x = 100 + r() * 2200, y = 360 + r() * 800, rad = 40 + r() * 120; const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(30,20,12,' + (0.05 + r() * 0.1) + ')'); g.addColorStop(1, 'rgba(30,20,12,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      /* 后墙：一排阁儿，门都开着，里头灯火通明 */
      P.plaster(c, 0, 0, 2400, 330, { seed: 52 });
      P.beam(c, 0, 26, 2400, 34, '#4a2c1e'); P.beam(c, 0, 300, 2400, 30, '#3a241a');
      const names = ['梅', '兰', '竹', '菊', '松', '月'];
      for (let i = 0; i < 6; i++) {
        const x = 320 + i * 300;
        c.fillStyle = P.vgrad(c, x, 84, 216, WARM); c.fillRect(x, 84, 220, 216);
        for (let k = 0; k < 3; k++) { c.save(); c.globalAlpha = 0.5; c.translate(x + 50 + k * 60, 300); Fig.draw(c, scholar(i * 3 + k, '#3a2a22'), k % 2 ? 0 : 2, 0.5, { pose: 'sit', seat: 34, shadow: false }); c.restore(); }
        c.fillStyle = 'rgba(248,196,120,0.5)'; c.fillRect(x, 84, 220, 216);
        P.lattice(c, x - 62, 96, 54, 204, { seed: 60 + i, sky: WARM, lights: false, step: 13, grid: true, wood: '#5a2a1e' }); P.lattice(c, x + 228, 96, 54, 204, { seed: 70 + i, sky: WARM, lights: false, step: 13, grid: true, wood: '#5a2a1e' });
        P.post(c, x - 80, 60, 16, 270, C.lacquer); P.post(c, x + 284, 60, 16, 270, C.lacquer);
        c.fillStyle = '#2a1c14'; c.fillRect(x + 84, 60, 52, 30); c.strokeStyle = P.rgba(C.tenghuang, 0.8); c.lineWidth = 1.2; c.strokeRect(x + 84, 60, 52, 30);
        c.fillStyle = '#f0dca8'; c.font = '600 20px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(names[i] + '阁', x + 110, 76);
        P.swag(c, x - 70, 66, x + 290, 66, 26, 5, i % 2 ? '#a8362a' : '#d7a544');
        P.lantern(c, x + 110, 132, 20, { cord: 46, col: i % 2 ? '#e06a36' : '#d8432c' });
      }
      /* 两头的楼梯口 */
      [[100, '下'], [2120, '上']].forEach(([x, t], k) => {
        c.fillStyle = '#17100c'; c.fillRect(x, 60, 180, 290);
        const g = c.createLinearGradient(0, 60, 0, 350); g.addColorStop(0, k ? 'rgba(255,220,160,0.6)' : 'rgba(255,200,130,0.1)'); g.addColorStop(1, k ? 'rgba(255,200,130,0.1)' : 'rgba(255,214,150,0.6)'); c.fillStyle = g; c.fillRect(x, 60, 180, 290);
        for (let i = 0; i < 8; i++) { const y = 330 - i * 32, w = 168 - i * 10; c.fillStyle = P.mix('#6a4a2e', '#c59a62', k ? i / 8 : 1 - i / 8); c.fillRect(x + 90 - w / 2, y, w, 16); c.fillStyle = 'rgba(20,12,8,0.5)'; c.fillRect(x + 90 - w / 2, y + 16, w, 14); }
        P.post(c, x - 14, 40, 16, 310, C.lacquer); P.post(c, x + 178, 40, 16, 310, C.lacquer);
      });
      P.ao(c, 0, 330, 2400, 90, 'top', 0.45);
      /* 中央的小台：矮矮一方，铺红毡 */
      const { x, y, w, d } = STAGE;
      P.shadow(c, x, y + d + 36, w * 0.56, 26, 0.5);
      c.fillStyle = P.vgrad(c, x - w / 2, y + d, 30, [[0, '#6a3a26'], [1, '#3d2016']]); c.fillRect(x - w / 2, y + d, w, 30); c.strokeStyle = P.rgba(C.ink, 0.85); c.lineWidth = 1.6; c.strokeRect(x - w / 2, y + d, w, 30);
      for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(215,165,68,0.45)'; c.lineWidth = 1.2; c.strokeRect(x - w / 2 + 10 + i * 64, y + d + 6, 52, 18); }
      c.fillStyle = P.vgrad(c, x - w / 2, y, d, [[0, '#7d2a22'], [1, '#a2382c']]); c.fillRect(x - w / 2, y, w, d); c.strokeStyle = P.rgba(C.ink, 0.85); c.strokeRect(x - w / 2, y, w, d);
      c.strokeStyle = 'rgba(227,185,90,0.8)'; c.lineWidth = 3; c.strokeRect(x - w / 2 + 12, y + 12, w - 24, d - 24); c.strokeStyle = 'rgba(227,185,90,0.4)'; c.lineWidth = 1.2; c.strokeRect(x - w / 2 + 22, y + 22, w - 44, d - 44);
      for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) { const px = x - w / 2 + 56 + i * 48, py = y + 46 + j * 40; c.strokeStyle = 'rgba(227,185,90,0.22)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px - 9, py); c.lineTo(px, py - 9); c.lineTo(px + 9, py); c.lineTo(px, py + 9); c.closePath(); c.stroke(); }
      P.shadow(c, x, y + 104, 30, 8, 0.4); c.fillStyle = '#6a3f26'; c.beginPath(); c.moveTo(x - 22, y + 66); c.quadraticCurveTo(x - 30, y + 84, x - 21, y + 102); c.lineTo(x + 21, y + 102); c.quadraticCurveTo(x + 30, y + 84, x + 22, y + 66); c.closePath(); c.fill(); c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1.3; c.stroke(); P.ellipse(c, x, y + 66, 23, 7, '#8a5634', P.rgba(C.ink, 0.8), 1.2);   // 台上的绣墩
      /* 临天井的朱栏；栏外是一楼大堂漏上来的光 */
      c.fillStyle = '#120c09'; c.fillRect(0, 1168, 2400, 72);
      const ug = c.createLinearGradient(0, 1168, 0, 1240); ug.addColorStop(0, 'rgba(255,196,120,0.05)'); ug.addColorStop(1, 'rgba(255,196,120,0.55)'); c.fillStyle = ug; c.fillRect(0, 1168, 2400, 72);
      P.beam(c, 0, 1150, 2400, 20, '#7a2e22'); P.beam(c, 0, 1206, 2400, 12, '#6a2a1e');
      for (let bx = 20; bx < 2400; bx += 40) { c.fillStyle = bx % 240 === 20 ? '#8e2a20' : '#6f2a1e'; c.fillRect(bx, 1168, bx % 240 === 20 ? 14 : 7, 40); }
      /* 两侧的墙 */
      c.fillStyle = '#17110d'; c.fillRect(0, 330, 86, 840); c.fillRect(2314, 330, 86, 840);
      P.ao(c, 86, 330, 120, 820, 'left', 0.4); P.ao(c, 2194, 330, 120, 820, 'right', 0.4); P.ao(c, 0, 1060, 2400, 90, 'bottom', 0.35);
      P.paper(c, 2400, 1240, 6, 0.42);
    },
    props: (function () {
      let ps = [];
      const lamp = (px, py) => ({ x: px, y: py, bw: 50, bh: 150, draw(g) { P.shadow(g, 0, 0, 16, 5, 0.4); g.fillStyle = '#3a241a'; g.fillRect(-2.5, -100, 5, 100); g.fillRect(-12, -4, 24, 5); P.lantern(g, 0, -118, 15, { cord: 0, col: '#f0b060', tall: 1.3 }); } });
      [[-1, 0], [1, 0], [-1, 1], [1, 1]].forEach(([sx, sy]) => ps.push(lamp(STAGE.x + sx * 232, STAGE.y + (sy ? STAGE.d + 30 : 0))));
      ps = ps.concat(guestTable(700, 700, 801, { back: [scholar(1, '#5d7a6b'), scholar(2, '#8a6a3c')], front: [scholar(3, '#6b7f8a')] }));
      ps = ps.concat(guestTable(820, 1010, 811, { back: [scholar(4, '#7c5a4a')], front: [scholar(5, '#58606e'), scholar(6, '#93806a')] }));
      ps = ps.concat(guestTable(1580, 1010, 821, { back: [scholar(7, '#4f6470'), scholar(8, '#7a6a7c')], front: [scholar(9, '#a08a62')] }));
      /* 贺元度的案：比别的桌长，摊着书 */
      ps.push({ x: 1740, y: 700, bw: 290, bh: 180, block: [-124, -140, 248, 150], draw(g) {
        P.table(g, 0, 0, 240, 96, 50, { col: '#4a2c20', seed: 831 });
        g.fillStyle = '#e9dfc6'; g.beginPath(); g.moveTo(-70, -128); g.lineTo(-14, -128); g.lineTo(-10, -84); g.lineTo(-74, -84); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.7); g.lineWidth = 1.2; g.stroke();     // 摊开的旧书
        P.line(g, -42, -128, -42, -84, 1, 'rgba(40,30,22,0.6)'); for (let i = 0; i < 5; i++) { P.line(g, -66 + i * 5, -122, -66 + i * 5, -92, 0.8, 'rgba(40,30,22,0.45)'); P.line(g, -36 + i * 5, -122, -36 + i * 5, -100, 0.8, 'rgba(40,30,22,0.45)'); }
        g.fillStyle = '#c8362e'; g.fillRect(-24, -98, 10, 10);                                                                                                     // 书页上那方朱印
        g.fillStyle = '#3d5468'; g.fillRect(20, -124, 40, 30); g.fillRect(24, -130, 40, 30); g.strokeStyle = P.rgba(C.ink, 0.7); g.strokeRect(24, -130, 40, 30);
        g.fillStyle = '#2a1c14'; g.fillRect(78, -112, 26, 16); P.ellipse(g, 91, -104, 9, 4, '#0e0b0a'); P.line(g, 96, -128, 108, -100, 2.2, '#5a3a22');                      // 砚与笔
        P.candle(g, -98, -104);
      } });
      return ps;
    })(),
  };

  /* ================= 三楼 · 听潮阁 ================= */
  const BOATS = (function () { const r = JX.rng(907), a = []; for (let i = 0; i < 46; i++) a.push({ x: 380 + r() * 1160, y: 196 + r() * r() * 96, s: 0.5 + r() * 0.9, c: r() < 0.7 ? '255,196,120' : r() < 0.5 ? '255,140,100' : '190,230,200', p: r() * 6.3 }); return a; })();
  S.tingchao = {
    name: '听潮阁', sub: '醉春楼三楼 · 临湖', w: 1920, h: 1080, ambient: '#6e6a86', music: 'zhuti',
    walk: [[150, 400, 1770, 1010]],
    spawns: { start: { x: 330, y: 900, dir: 2 }, fromUp: { x: 330, y: 900, dir: 2 } },
    exits: [{ id: 'down', x: 150, y: 1000, w: 300, h: 40, to: 'floor2', spawn: 'fromUp', label: '下楼', ly: 960, back: [0, -34] }],
    hots: [{ id: 'table', x: 960, y: 800, r: 130, up: 150, verb: '摆杯箸' }],
    marks: [{ t: '窗外是西湖', x: 960, y: 60 }],
    lights: [
      { x: 960, y: 700, r: 760, c: '#ffd9a0', a: 0.75, ey: 0.7, glow: 30, gx: 960, gy: 598, gc: '#ffc866', ga: 0.8 },
      { x: 300, y: 470, r: 420, c: '#ffb884', a: 0.6, glow: 60, gx: 300, gy: 250, gc: '#ff9a5a', ga: 0.5 }, { x: 1620, y: 470, r: 420, c: '#ffb884', a: 0.6, glow: 60, gx: 1620, gy: 250, gc: '#ff9a5a', ga: 0.5 },
      { x: 960, y: 380, r: 520, c: '#9fb4e0', a: 0.42, ey: 0.5 },
    ],
    paint(c) {
      const r = JX.rng(601);
      P.planks(c, 0, 380, 1920, 700, { seed: 61, base: '#93704a', pw: 40 });
      /* 桌下一领大席 */
      c.fillStyle = 'rgba(196,170,112,0.5)'; c.fillRect(560, 560, 800, 400); for (let y = 560; y < 960; y += 8) { c.fillStyle = 'rgba(70,50,24,' + (y % 16 ? 0.1 : 0.17) + ')'; c.fillRect(560, y, 800, 2); }
      c.strokeStyle = '#4a2c20'; c.lineWidth = 10; c.strokeRect(560, 560, 800, 400); c.strokeStyle = 'rgba(215,165,68,0.5)'; c.lineWidth = 2; c.strokeRect(568, 568, 784, 384);
      /* 后墙 */
      P.plaster(c, 0, 0, 1920, 380, { seed: 62 });
      P.beam(c, 0, 20, 1920, 34, '#4a2c1e');
      /* 大窗：整面推开，外头是西湖 */
      const wx = 360, wy = 64, ww = 1200, wh = 290;
      const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#0e1630'); sky.addColorStop(0.42, '#263862'); sky.addColorStop(0.46, '#1c2a4c'); sky.addColorStop(1, '#0c1428'); c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
      for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(240,244,255,' + (0.2 + r() * 0.6) + ')'; c.fillRect(wx + r() * ww, wy + r() * 100, 1.6, 1.6); }
      P.ellipse(c, wx + 990, wy + 50, 26, 26, '#f4efd8'); P.glow(c, wx + 990, wy + 50, 120, '#f4efd8', 0.35);                                          // 十五的月亮
      c.fillStyle = '#131c36'; c.beginPath(); c.moveTo(wx, wy + 128); c.bezierCurveTo(wx + 160, wy + 70, wx + 300, wy + 96, wx + 430, wy + 112); c.bezierCurveTo(wx + 560, wy + 60, wx + 700, wy + 84, wx + 820, wy + 110); c.bezierCurveTo(wx + 980, wy + 86, wx + 1100, wy + 100, wx + ww, wy + 122); c.lineTo(wx + ww, wy + 136); c.lineTo(wx, wy + 136); c.closePath(); c.fill();   // 对岸的山
      c.fillStyle = '#0d1630'; for (let i = 0; i < 5; i++) { c.fillRect(wx + 566 - i * 1.2, wy + 50 + i * 8, 6 + i * 2.4, 7); c.fillRect(wx + 562 - i * 1.6, wy + 56 + i * 8, 14 + i * 3.2, 1.8); } c.fillRect(wx + 568.4, wy + 40, 1.4, 10);                // 山上的塔
      P.glow(c, wx + 300, wy + 126, 190, '#ffc470', 0.6); P.glow(c, wx + 300, wy + 126, 70, '#fff0c0', 0.7);                                             // 葛岭：山脚下最亮的一带
      for (let i = 0; i < 26; i++) { const lx = wx + 190 + r() * 230, ly = wy + 112 + r() * 20; c.fillStyle = 'rgba(255,' + (200 + r() * 40 | 0) + ',140,' + (0.6 + r() * 0.4) + ')'; c.fillRect(lx, ly, 2.4, 2.4); }
      for (let i = 0; i < 40; i++) { const lx = wx + r() * ww, ly = wy + 120 + r() * 12; c.fillStyle = 'rgba(255,200,130,' + (0.25 + r() * 0.4) + ')'; c.fillRect(lx, ly, 1.8, 1.8); }
      c.save(); c.beginPath(); c.rect(wx, wy + 136, ww, wh - 136); c.clip(); c.translate(wx + 300, wy + 136); c.scale(1, 1.5); P.glow(c, 0, 0, 120, '#ffc470', 0.34); c.restore();
      for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(150,180,230,' + (0.05 + r() * 0.1) + ')'; c.fillRect(wx + r() * ww, wy + 140 + r() * 150, 20 + r() * 60, 1.4); }
      /* 窗框、两边折开的格扇、美人靠 */
      P.lattice(c, wx - 150, wy, 130, wh, { seed: 63, sky: [[0, '#2a2f4a'], [1, '#3a3f5a']], lights: false, step: 14, grid: true, wood: '#5a2a1e' }); P.lattice(c, wx + ww + 20, wy, 130, wh, { seed: 64, sky: [[0, '#2a2f4a'], [1, '#3a3f5a']], lights: false, step: 14, grid: true, wood: '#5a2a1e' });
      P.post(c, wx - 22, 40, 22, 340, C.lacquer); P.post(c, wx + ww, 40, 22, 340, C.lacquer); P.post(c, wx + ww / 2 - 9, wy + wh - 60, 18, 86, C.lacquer);
      P.beam(c, wx - 22, wy - 14, ww + 44, 16, '#6a2a1e'); P.beam(c, wx, wy + wh - 62, ww, 12, '#7a2e22'); P.beam(c, wx, wy + wh - 6, ww, 16, '#6a2a1e');
      for (let bx = wx + 16; bx < wx + ww; bx += 34) { c.fillStyle = '#6f2a1e'; c.fillRect(bx, wy + wh - 50, 6, 44); }
      P.swag(c, wx, wy - 4, wx + ww / 2, wy - 4, 34, 5, '#a8362a'); P.swag(c, wx + ww / 2, wy - 4, wx + ww, wy - 4, 34, 5, '#d7a544');
      P.lantern(c, 300, 250, 26, { cord: 170, col: '#e06a36' }); P.lantern(c, 1620, 250, 26, { cord: 170, col: '#e06a36' });
      /* 匾 */
      c.fillStyle = '#2a1c14'; c.fillRect(860, 6, 200, 50); c.strokeStyle = P.rgba(C.tenghuang, 0.85); c.lineWidth = 2; c.strokeRect(860, 6, 200, 50);
      c.fillStyle = '#f0dca8'; c.font = '600 34px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('聽 潮 閣', 960, 32);
      P.ao(c, 0, 380, 1920, 90, 'top', 0.45);
      /* 墙与门口（左下） */
      c.fillStyle = '#17110d'; c.fillRect(0, 380, 150, 700); c.fillRect(1770, 380, 150, 700); c.fillRect(0, 1010, 1920, 70);
      const dg = c.createLinearGradient(0, 1000, 0, 1080); dg.addColorStop(0, '#e9c58a'); dg.addColorStop(1, '#a8742e'); c.fillStyle = dg; c.fillRect(160, 1012, 280, 68);
      P.beam(c, 142, 1000, 18, 80, C.lacquer); P.beam(c, 440, 1000, 18, 80, C.lacquer);
      P.ao(c, 150, 380, 120, 630, 'left', 0.4); P.ao(c, 1650, 380, 120, 630, 'right', 0.4); P.ao(c, 0, 920, 1920, 90, 'bottom', 0.35);
      P.paper(c, 1920, 1080, 8, 0.42);
    },
    props: [
      /* 屏风：三扇，画的是远山 */
      { x: 1560, y: 560, bw: 330, bh: 260, block: [-150, -30, 300, 40], draw(g) {
        P.shadow(g, 0, 0, 160, 14, 0.45);
        [-100, 0, 100].forEach((px, i) => {
          g.fillStyle = '#4a2c20'; g.fillRect(px - 50, -230 + Math.abs(i - 1) * 8, 100, 230 - Math.abs(i - 1) * 8); g.fillStyle = P.vgrad(g, px - 44, -222, 200, [[0, '#e6dcc2'], [1, '#cdbf9c']]); g.fillRect(px - 44, -222 + Math.abs(i - 1) * 8, 88, 196 - Math.abs(i - 1) * 8);
          g.fillStyle = 'rgba(70,90,100,0.45)'; g.beginPath(); g.moveTo(px - 44, -90); g.quadraticCurveTo(px - 20, -150 - i * 12, px, -110); g.quadraticCurveTo(px + 24, -160 + i * 10, px + 44, -100); g.lineTo(px + 44, -60); g.lineTo(px - 44, -60); g.closePath(); g.fill();
          g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.4; g.strokeRect(px - 50, -230 + Math.abs(i - 1) * 8, 100, 230 - Math.abs(i - 1) * 8);
        });
      } },
      /* 花几与一瓶梅 */
      { x: 330, y: 540, bw: 110, bh: 240, block: [-34, -24, 68, 30], draw(g) {
        P.table(g, 0, 0, 62, 40, 96, { col: '#4a2c20', seed: 641 });
        g.fillStyle = P.hgrad(g, -14, 0, 28, [[0, '#7fa28e'], [0.4, '#d8ece0'], [1, '#6f8f7e']]); g.beginPath(); g.moveTo(-7, -150); g.lineTo(7, -150); g.quadraticCurveTo(18, -128, 12, -112); g.lineTo(-12, -112); g.quadraticCurveTo(-18, -128, -7, -150); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.2; g.stroke();
        g.strokeStyle = '#3a2a20'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -150); g.quadraticCurveTo(-10, -190, -34, -214); g.moveTo(-6, -172); g.quadraticCurveTo(14, -196, 30, -226); g.moveTo(-20, -200); g.lineTo(-44, -196); g.stroke();
        [[-34, -216], [-26, -206], [30, -228], [20, -212], [-44, -196], [8, -190], [-12, -182], [26, -220]].forEach(p => P.ellipse(g, p[0], p[1], 4.4, 4.4, '#e8a0a0', 'rgba(140,40,40,0.5)', 0.8));
      } },
      /* 酒桌：正中一张方桌，两只绣墩 */
      { x: 960, y: 560, bw: 90, bh: 60, draw(g) { P.shadow(g, 0, 0, 30, 8, 0.4); g.fillStyle = '#6a3f26'; g.beginPath(); g.moveTo(-22, -36); g.quadraticCurveTo(-30, -18, -21, 0); g.lineTo(21, 0); g.quadraticCurveTo(30, -18, 22, -36); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.3; g.stroke(); P.ellipse(g, 0, -36, 23, 7, '#8a5634', P.rgba(C.ink, 0.8), 1.2); } },
      { x: 960, y: 720, bw: 300, bh: 220, block: [-124, -150, 248, 160], draw(g) {
        P.table(g, 0, 0, 236, 130, 54, { col: '#5a3424', seed: 651 });
        P.dishes(g, 0, -54, 200, 110, 652, 4);
        g.fillStyle = P.hgrad(g, -70, 0, 26, [[0, '#8fb2a0'], [0.4, '#d8ece0'], [1, '#7fa28e']]); g.beginPath(); g.moveTo(-64, -150); g.lineTo(-52, -150); g.quadraticCurveTo(-40, -132, -46, -112); g.lineTo(-70, -112); g.quadraticCurveTo(-76, -132, -64, -150); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.2; g.stroke();   // 执壶
        g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 2; g.beginPath(); g.moveTo(-46, -138); g.quadraticCurveTo(-32, -140, -30, -152); g.stroke();
        P.candle(g, 70, -134);
      } },
      { x: 960, y: 800, bw: 90, bh: 60, draw(g) { P.shadow(g, 0, 0, 30, 8, 0.4); g.fillStyle = '#6a3f26'; g.beginPath(); g.moveTo(-22, -36); g.quadraticCurveTo(-30, -18, -21, 0); g.lineTo(21, 0); g.quadraticCurveTo(30, -18, 22, -36); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.3; g.stroke(); P.ellipse(g, 0, -36, 23, 7, '#8a5634', P.rgba(C.ink, 0.8), 1.2); } },
    ],
    anim(c, t) {                                                   // 湖上的灯船：一点一点地闪，慢慢地漂
      BOATS.forEach(b => { const a = 0.45 + 0.4 * Math.sin(t * (0.8 + b.s) + b.p), x = b.x + Math.sin(t * 0.05 + b.p) * 14, rad = 5 + b.s * 6; const g = c.createRadialGradient(x, b.y, 0, x, b.y, rad); g.addColorStop(0, 'rgba(' + b.c + ',' + a + ')'); g.addColorStop(1, 'rgba(' + b.c + ',0)'); c.fillStyle = g; c.fillRect(x - rad, b.y - rad, rad * 2, rad * 2); c.fillStyle = 'rgba(' + b.c + ',' + a * 0.25 + ')'; c.fillRect(x - 0.8, b.y + 3, 1.6, 10 + b.s * 8); });
    },
  };
})();

/* 场景（三·续）：后厨的后门、后巷、屋顶。 */
(function () {
  const JX = window.JX, P = JX.P, C = P.C, Fig = JX.Fig, S = JX.scenes;
  /* 后厨添一道后门（左下），平时闩着 */
  S.kitchen.spawns.fromAlley = { x: 410, y: 980, dir: 2 };
  S.kitchen.exits.push({ id: 'back', x: 310, y: 1026, w: 200, h: 30, to: 'alley', spawn: 'fromKitchen', label: '后门', ly: 960, back: [0, -34] });
  S.kitchen.props.push({ x: 410, y: 1079, bw: 280, bh: 80, draw(g) {
    g.fillStyle = '#0a0d16'; g.fillRect(-104, -42, 208, 42); const m = g.createLinearGradient(0, -42, 0, 0); m.addColorStop(0, 'rgba(120,150,210,0)'); m.addColorStop(1, 'rgba(120,150,210,0.4)'); g.fillStyle = m; g.fillRect(-104, -42, 208, 42);
    g.fillStyle = '#3a241a'; g.fillRect(-118, -52, 16, 52); g.fillRect(102, -52, 16, 52); g.fillRect(-118, -56, 236, 10); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.2; g.strokeRect(-118, -56, 236, 10);
  } });

  /* ================= 后巷 ================= */
  S.alley = {
    name: '后巷', sub: '醉春楼背后 · 通清湖河', w: 2200, h: 1080, ambient: '#8a92b8', music: 'anliu', outside: '#05060a',
    walk: [[130, 566, 1820, 860]],
    spawns: { fromKitchen: { x: 262, y: 640, dir: 0 }, start: { x: 262, y: 640, dir: 0 } },
    exits: [{ id: 'kitchen', x: 190, y: 552, w: 150, h: 24, to: 'kitchen', spawn: 'fromAlley', label: '回后厨', ly: 500, back: [0, 34] }],
    marks: [{ t: '清湖河的石埠头', x: 1980, y: 640 }],
    lights: [
      { x: 262, y: 590, r: 430, c: '#ffc98a', a: 0.85, ey: 0.6, glow: 44, gx: 262, gy: 318, gc: '#ff9a5a', ga: 0.6 },
      { x: 1210, y: 560, r: 360, c: '#ffd9a0', a: 0.4, ey: 0.6 },
      { x: 1100, y: 700, r: 1300, c: '#c4d2f8', a: 0.75, ey: 0.5 }, { x: 2040, y: 720, r: 520, c: '#9db8e8', a: 0.6 },
    ],
    paint(c) {
      const r = JX.rng(801);
      P.flagstones(c, 0, 540, 2200, 340, { seed: 81 });
      c.fillStyle = 'rgba(30,40,80,0.2)'; c.fillRect(0, 540, 2200, 340);
      for (let i = 0; i < 9; i++) { const x = 200 + r() * 1500, y = 600 + r() * 220, w = 50 + r() * 110; const g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, 'rgba(130,160,220,0.2)'); g.addColorStop(1, 'rgba(130,160,220,0)'); c.save(); c.translate(x, y); c.scale(1, 0.3); c.translate(-x, -y); c.fillStyle = g; c.fillRect(x - w, y - w, w * 2, w * 2); c.restore(); }   // 积水映着月色
      /* 醉春楼的后墙 */
      P.plaster(c, 0, 110, 1860, 260, { seed: 82 }); c.fillStyle = 'rgba(30,40,80,0.26)'; c.fillRect(0, 110, 1860, 260);
      P.brick(c, 0, 370, 1860, 170, { seed: 83 }); c.fillStyle = 'rgba(30,40,80,0.26)'; c.fillRect(0, 370, 1860, 170);
      c.fillStyle = '#12141e'; c.fillRect(0, 0, 1860, 118); for (let x = 0; x < 1860; x += 34) { c.fillStyle = x % 68 ? '#1c2030' : '#161926'; c.fillRect(x, 20, 30, 92); P.ellipse(c, x + 15, 114, 13, 7, '#232838', 'rgba(0,0,0,0.6)', 1); }      // 屋檐
      P.beam(c, 0, 108, 1860, 12, '#2a2026');
      /* 后门：半掩，里头是后厨的光 */
      c.fillStyle = P.vgrad(c, 190, 330, 210, [[0, '#f6c684'], [1, '#c8742e']]); c.fillRect(190, 330, 150, 210); c.fillStyle = '#4a2c1e'; c.fillRect(190, 330, 62, 210); c.strokeStyle = P.rgba(C.ink, 0.85); c.lineWidth = 1.6; c.strokeRect(190, 330, 62, 210);
      P.post(c, 174, 310, 16, 230, '#3a241a'); P.post(c, 340, 310, 16, 230, '#3a241a'); P.beam(c, 168, 304, 194, 18, '#3a241a'); P.lantern(c, 262, 300, 16, { cord: 0, col: '#e06a36' });
      /* 靠墙的空坛、竹竿、一扇高窗 */
      for (let i = 0; i < 7; i++) { c.save(); c.translate(470 + i * 62 + (i % 2) * 8, 556 + (i % 3) * 5); P.jar(c, 0, 0, 0.82 + (i % 3) * 0.08, { seed: 90 + i, sealed: false }); c.restore(); }
      for (let i = 0; i < 4; i++) P.line(c, 980 + i * 16, 548, 1040 + i * 10, 150, 5, i % 2 ? '#6a7a4a' : '#56683c');
      P.lattice(c, 1150, 190, 120, 110, { seed: 84, sky: [[0, '#f8c478'], [1, '#c8742e']], lights: false, step: 13, grid: true, wood: '#3a241a' });
      c.fillStyle = '#2a2f3e'; c.fillRect(1500, 120, 14, 420);                                                       // 落水管
      P.ao(c, 0, 540, 1860, 70, 'top', 0.6);
      /* 巷子对面的墙头 */
      c.fillStyle = '#0a0c14'; c.fillRect(0, 880, 1860, 200); for (let x = 0; x < 1860; x += 40) P.ellipse(c, x + 20, 884, 19, 9, '#1a1e2c', 'rgba(0,0,0,0.7)', 1);
      P.ao(c, 0, 800, 1860, 80, 'bottom', 0.5);
      /* 尽头：石埠头与清湖河 */
      const wg = c.createLinearGradient(1860, 0, 2200, 0); wg.addColorStop(0, '#16223e'); wg.addColorStop(1, '#0b1226'); c.fillStyle = wg; c.fillRect(1860, 0, 340, 1080);
      for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(150,180,230,' + (0.06 + r() * 0.14) + ')'; c.fillRect(1870 + r() * 320, 20 + r() * 1040, 14 + r() * 50, 1.6); }
      [[2100, 170, '255,196,120'], [2150, 420, '255,150,110'], [2080, 930, '255,206,140']].forEach(([x, y, col]) => { P.glow(c, x, y, 60, 'rgb(' + col + ')', 0.5); c.fillStyle = 'rgba(' + col + ',0.35)'; c.fillRect(x - 2, y + 6, 4, 70); });       // 对岸人家的灯
      for (let i = 0; i < 4; i++) { c.fillStyle = P.mix('#6a7286', '#2e3446', i / 4); c.fillRect(1820 + i * 22, 560 + i * 4, 26, 300 - i * 8); c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.2; c.strokeRect(1820 + i * 22, 560 + i * 4, 26, 300 - i * 8); }     // 石阶
      c.fillStyle = '#0c0f18'; c.beginPath(); c.moveTo(1930, 760); c.quadraticCurveTo(2020, 800, 2130, 752); c.lineTo(2120, 730); c.lineTo(1940, 736); c.closePath(); c.fill(); c.fillStyle = '#161a26'; c.beginPath(); c.moveTo(1980, 738); c.quadraticCurveTo(2030, 676, 2084, 734); c.closePath(); c.fill();   // 系着的一条乌篷船
      P.line(c, 1930, 756, 1884, 700, 1.6, '#3a3f50');
      P.paper(c, 2200, 1080, 9, 0.4);
    },
    props: [
      { x: 1660, y: 600, bw: 130, bh: 150, block: [-46, -26, 92, 34], draw(g) { for (let i = 0; i < 2; i++) { g.save(); g.translate(-22 + i * 46, i * 4); P.jar(g, 0, 0, 1.0, { seed: 97 + i }); g.restore(); } g.save(); g.translate(2, -72); P.jar(g, 0, 0, 0.9, { seed: 99 }); g.restore(); } },
    ],
  };

  /* ================= 醉春楼屋顶 ================= */
  const ROPE = { x: 1700, y: 760 };                                // 灯索桩的位置
  S.roof = {
    name: '屋顶', sub: '脚下是御街的灯河', w: 1920, h: 1080, ambient: '#9aa2c8', music: 'anliu', outside: '#05060a',
    walk: [[200, 440, 1740, 850]],
    spawns: { start: { x: 600, y: 720, dir: 3 } },
    exits: [],
    rope: ROPE,
    lights: [{ x: 800, y: 560, r: 1500, c: '#d0dcff', a: 0.8, ey: 0.6 }, { x: 960, y: 1120, r: 900, c: '#ffc98a', a: 0.6, ey: 0.36 }, { x: 1760, y: 860, r: 420, c: '#ffb884', a: 0.6 }],
    paint(c) {
      const r = JX.rng(901);
      const sky = c.createLinearGradient(0, 0, 0, 270); sky.addColorStop(0, '#0b1230'); sky.addColorStop(1, '#24366a'); c.fillStyle = sky; c.fillRect(0, 0, 1920, 270);
      for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(240,244,255,' + (0.2 + r() * 0.6) + ')'; c.fillRect(r() * 1920, r() * 170, 1.6, 1.6); }
      P.ellipse(c, 330, 96, 34, 34, '#f4efd8'); P.glow(c, 330, 96, 170, '#f4efd8', 0.35);
      c.fillStyle = '#121a36'; c.beginPath(); c.moveTo(0, 214); c.bezierCurveTo(300, 150, 520, 190, 760, 200); c.bezierCurveTo(1000, 140, 1300, 170, 1920, 206); c.lineTo(1920, 232); c.lineTo(0, 232); c.closePath(); c.fill();
      c.fillStyle = '#16244a'; c.fillRect(0, 226, 1920, 44); for (let i = 0; i < 46; i++) { const x = r() * 1920, y = 232 + r() * 30; P.glow(c, x, y, 7 + r() * 6, r() < 0.7 ? '#ffc478' : '#ff9a70', 0.7); }      // 远处湖上的船
      /* 屋脊 */
      c.fillStyle = '#10131e'; c.fillRect(0, 262, 1920, 74); for (let x = 0; x < 1920; x += 30) { c.fillStyle = x % 60 ? '#262b3c' : '#1c2030'; c.fillRect(x + 2, 272, 26, 22); } P.beam(c, 0, 296, 1920, 16, '#1a1e2c');
      [[60, 1], [1860, -1]].forEach(([x, s]) => { c.fillStyle = '#161a28'; c.beginPath(); c.moveTo(x - s * 50, 300); c.quadraticCurveTo(x - s * 30, 210, x + s * 30, 196); c.quadraticCurveTo(x, 240, x + s * 40, 300); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.7)'; c.lineWidth = 1.6; c.stroke(); });   // 鸱吻
      /* 瓦面：一垄一垄往下淌 */
      const tg = c.createLinearGradient(0, 330, 0, 910); tg.addColorStop(0, '#4a5474'); tg.addColorStop(0.6, '#6e7898'); tg.addColorStop(1, '#8a8496'); c.fillStyle = tg; c.fillRect(0, 330, 1920, 580);
      for (let x = 0; x < 1920; x += 46) {
        c.fillStyle = 'rgba(14,18,36,0.34)'; c.fillRect(x + 30, 330, 16, 580); c.fillStyle = 'rgba(210,222,255,0.16)'; c.fillRect(x + 4, 330, 5, 580);
        for (let y = 344; y < 910; y += 28) { c.strokeStyle = 'rgba(14,18,36,0.3)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + 15, y, 15, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
      }
      for (let i = 0; i < 26; i++) { const x = r() * 1920, y = 360 + r() * 520; c.fillStyle = 'rgba(60,90,70,' + (0.1 + r() * 0.16) + ')'; c.fillRect(x, y, 20 + r() * 40, 10 + r() * 16); }                    // 青苔
      /* 0.15.0 添的：月光在瓦上斜斜地铺一道；屋脊边一座烟囱；左下檐口靠着一架梯子、码着一摞备用的瓦——这片屋顶原来只有瓦，太空 */
      { const mg = c.createLinearGradient(0, 0, 1150, 0); mg.addColorStop(0, 'rgba(214,226,255,0.05)'); mg.addColorStop(0.28, 'rgba(214,226,255,0.16)'); mg.addColorStop(1, 'rgba(214,226,255,0)'); c.fillStyle = mg; c.fillRect(0, 330, 1150, 580); }
      { const x = 1290, y = 426; P.shadow(c, x + 30, y + 4, 60, 9, 0.4); c.fillStyle = P.vgrad(c, 0, y - 98, 98, [[0, '#59607a'], [1, '#3c4258']]); c.fillRect(x, y - 98, 64, 98); c.strokeStyle = 'rgba(8,10,20,0.8)'; c.lineWidth = 1.6; c.strokeRect(x, y - 98, 64, 98);
        for (let j = 0; j < 6; j++) for (let i = 0; i < 3; i++) { c.strokeStyle = 'rgba(8,10,20,0.3)'; c.strokeRect(x + (j % 2 ? 0 : -10) + i * 26, y - 98 + j * 16, 26, 16); }
        c.fillStyle = '#2a2f42'; c.fillRect(x - 7, y - 108, 78, 12); c.strokeRect(x - 7, y - 108, 78, 12); c.fillStyle = '#0c0e16'; c.fillRect(x + 12, y - 106, 40, 7); }
      { const x = 232, y = 932; c.strokeStyle = '#5a4630'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y - 92); c.moveTo(x + 46, y); c.lineTo(x + 62, y - 92); c.stroke(); c.lineWidth = 5; for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(x + 4 + j * 4, y - 14 - j * 22); c.lineTo(x + 50 + j * 4, y - 14 - j * 22); c.stroke(); }
        for (let j = 0; j < 5; j++) { P.ellipse(c, 372, 884 - j * 7, 30, 9, j % 2 ? '#4a5270' : '#565e7c', 'rgba(8,10,20,0.75)', 1.3); } P.shadow(c, 372, 892, 34, 7, 0.4); }
      /* 檐口与檐下的灯河 */
      for (let x = 0; x < 1920; x += 46) { P.ellipse(c, x + 15, 914, 15, 10, '#2c3146', 'rgba(0,0,0,0.7)', 1.2); P.ellipse(c, x + 15, 914, 7, 5, '#3c4258'); }
      const st = c.createLinearGradient(0, 924, 0, 1080); st.addColorStop(0, '#2a1a14'); st.addColorStop(0.4, '#7a4a22'); st.addColorStop(1, '#d08a3a'); c.fillStyle = st; c.fillRect(0, 926, 1920, 154);
      for (let i = 0; i < 150; i++) { const x = r() * 1920, y = 950 + r() * 124, k = r(); P.glow(c, x, y, 6 + k * 12, k < 0.6 ? '#ffd27a' : k < 0.85 ? '#ff8a4a' : '#fff0c0', 0.5 + r() * 0.4); }
      for (let i = 0; i < 80; i++) { c.fillStyle = 'rgba(20,12,8,0.5)'; c.fillRect(r() * 1920, 990 + r() * 86, 5, 9); }
      for (let k = 0; k < 3; k++) { const x0 = 180 + k * 520, y0 = 926; c.strokeStyle = 'rgba(20,14,10,0.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 130, 1040, x0 + 300, 1080); c.stroke(); for (let j = 1; j < 5; j++) { const t = j / 5, x = x0 + 2 * (1 - t) * t * 130 + t * t * 300, y = y0 + 2 * (1 - t) * t * 114 + t * t * 154; P.lantern(c, x, y + 4, 9 + j, { cord: 0, col: j % 2 ? '#e06a36' : '#d8432c' }); } }   // 檐下几条灯索
      P.paper(c, 1920, 1080, 10, 0.4);
    },
    props: [
      { x: ROPE.x, y: ROPE.y, bw: 80, bh: 150, block: [-14, -10, 28, 16], draw(g) { P.shadow(g, 0, 0, 18, 6, 0.5); g.fillStyle = '#3a241a'; g.fillRect(-6, -110, 12, 110); g.strokeStyle = P.rgba(C.ink, 0.85); g.lineWidth = 1.3; g.strokeRect(-6, -110, 12, 110); g.fillStyle = '#8e2a20'; g.fillRect(-9, -104, 18, 10); g.fillRect(-9, -84, 18, 6); } },
    ],
  };
  S.roof.anim = function (c, t) {                                 // 烟囱里一缕烟，慢慢往上散（画在屋脊以上，不会盖到人）
    for (let i = 0; i < 6; i++) { const u = (t * 0.11 + i / 6) % 1, x = 1322 + Math.sin(u * 5 + i) * 14 + u * 46, y = 318 - u * 190, r = 12 + u * 34; c.fillStyle = 'rgba(190,198,220,' + (0.17 * (1 - u)).toFixed(3) + ')'; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); }
  };
  /* 屋顶上那条灯索：从桩上牵到街对面。k 是断开的程度（0 完好） */
  JX.drawRope = function (g, k) {
    const a = 1 - k; if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(20,14,10,0.9)'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, -100); g.quadraticCurveTo(110, -20 + k * 200, 240, 150 + k * 300); g.stroke();
    for (let j = 1; j <= 5; j++) { const t = j / 6, x = 2 * (1 - t) * t * 110 + t * t * 240, y = -100 * (1 - t) * (1 - t) + 2 * (1 - t) * t * (-20 + k * 200) + t * t * (150 + k * 300); P.lantern(g, x, y + 6 + k * j * 30, 13, { cord: 0, col: j % 2 ? '#e06a36' : '#d8432c' }); P.glow(g, x, y + 22 + k * j * 30, 44, '#ffb060', 0.35 * a); }
    g.restore();
  };
})();
