/* 场景（四）：第一章用的地方——临安府衙门外（清晨）、清河坊仁寿堂药铺。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const S = JX.scenes = JX.scenes || {};

  /* ================= 临安府衙门外，正月十六清晨 =================
     正中是关着的大门和“临安府”的匾，左手一扇角门（放人走的那一扇），门前石狮、鸣冤鼓、贴告示的八字墙。
     天刚亮，有薄雾；右手街口通回醉春楼。 */
  S.yamen = {
    name: '临安府衙', sub: '正月十六 · 清晨', w: 2400, h: 1080, ambient: '#b6b3c6', music: 'kaitan', outside: '#1a1c26',
    walk: [[120, 584, 2384, 880]],
    spawns: { start: { x: 770, y: 624, dir: 0 } },
    exits: [{ id: 'east', x: 2326, y: 590, w: 56, h: 290, label: '回醉春楼', lx: 2230, ly: 548, back: [-34, 0] }],
    marks: [{ t: '往涌金门 · 醉春楼', x: 2250, y: 500 }],
    lights: [
      { x: 1200, y: 700, r: 1700, c: '#e8ecf8', a: 0.85, ey: 0.55 },
      { x: 2300, y: 620, r: 900, c: '#ffe2b8', a: 0.75, ey: 0.6 },                       // 东边的天光
      { x: 746, y: 560, r: 300, c: '#ffcf96', a: 0.55, ey: 0.6, glow: 30, gx: 746, gy: 318, gc: '#ffb070', ga: 0.45 },   // 角门上还没熄的灯
    ],
    paint(c) {
      const r = JX.rng(1101);
      /* 天：鱼肚白到一抹橙 */
      c.fillStyle = P.vgrad(c, 0, 0, 170, [[0, '#9fb0cc'], [0.6, '#d9d6dc'], [1, '#f3d8b8']]); c.fillRect(0, 0, 2400, 170);
      for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(255,236,214,' + (0.25 + r() * 0.25) + ')'; c.beginPath(); c.ellipse(300 + r() * 1900, 60 + r() * 70, 160 + r() * 200, 9 + r() * 10, 0, 0, 6.3); c.fill(); }
      /* 地面 */
      P.flagstones(c, 0, 540, 2400, 380, { seed: 111 });
      c.fillStyle = 'rgba(210,214,230,0.16)'; c.fillRect(0, 540, 2400, 380);
      /* 衙墙：白粉墙、青砖墙脚、瓦檐 */
      P.plaster(c, 0, 170, 2400, 240, { seed: 112 }); c.fillStyle = 'rgba(190,196,214,0.2)'; c.fillRect(0, 170, 2400, 240);
      P.brick(c, 0, 410, 2400, 130, { seed: 113 }); c.fillStyle = 'rgba(120,128,150,0.22)'; c.fillRect(0, 410, 2400, 130);
      c.fillStyle = '#3a3e4c'; c.fillRect(0, 118, 2400, 58);
      for (let x = 0; x < 2400; x += 34) { c.fillStyle = x % 68 ? '#4a4f60' : '#40455a'; c.fillRect(x, 124, 30, 46); P.ellipse(c, x + 15, 172, 13, 7, '#565c70', 'rgba(0,0,0,0.5)', 1); }
      /* 八字墙上的告示 */
      [[1560, 250], [1668, 262], [1790, 246], [330, 256], [452, 250]].forEach(([x, y], i) => {
        c.save(); c.translate(x, y); c.rotate((i % 2 ? 1 : -1) * 0.012);
        c.fillStyle = i === 1 ? '#efe2c2' : '#f3ead2'; c.fillRect(0, 0, 92, 124); c.strokeStyle = P.rgba(C.ink, 0.6); c.lineWidth = 1.2; c.strokeRect(0, 0, 92, 124);
        for (let k = 0; k < 6; k++) { c.fillStyle = P.rgba(C.ink, 0.5); c.fillRect(78 - k * 13, 12, 3, 60 + ((k * 37 + i * 11) % 44)); }
        if (i === 1) { c.strokeStyle = 'rgba(168,54,42,0.8)'; c.lineWidth = 2.4; c.strokeRect(8, 92, 22, 22); }
        c.restore();
      });
      /* 正门：门楼高出一截，朱漆大门关着，匾额“临安府” */
      c.fillStyle = '#2f3340'; c.fillRect(900, 40, 600, 96);
      for (let x = 900; x < 1500; x += 34) { c.fillStyle = x % 68 ? '#454a5c' : '#3b4052'; c.fillRect(x, 50, 30, 78); P.ellipse(c, x + 15, 132, 13, 7, '#525870', 'rgba(0,0,0,0.5)', 1); }
      c.fillStyle = '#2a2d3a'; c.beginPath(); c.moveTo(880, 44); c.quadraticCurveTo(1200, 4, 1520, 44); c.lineTo(1500, 54); c.lineTo(900, 54); c.closePath(); c.fill();
      P.plaster(c, 930, 136, 540, 60, { seed: 114 });
      c.fillStyle = '#6e241c'; c.fillRect(1010, 196, 380, 344);
      [[1010, 190], [1200, 190]].forEach(([x, w]) => { c.fillStyle = P.hgrad(c, x, 0, w, [[0, '#7c2a20'], [0.5, '#933428'], [1, '#742619']]); c.fillRect(x + 4, 202, w - 8, 334); c.strokeStyle = P.rgba(C.ink, 0.85); c.lineWidth = 2; c.strokeRect(x + 4, 202, w - 8, 334); for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 5; gx++) P.ellipse(c, x + 26 + gx * 34, 236 + gy * 62, 5.5, 5.5, '#d7a544', 'rgba(60,30,10,0.8)', 1); });
      P.ellipse(c, 1186, 380, 11, 11, null, '#d7a544', 3); P.ellipse(c, 1214, 380, 11, 11, null, '#d7a544', 3);
      [960, 1000, 1390, 1430].forEach(x => P.post(c, x, 150, 22, 390, '#7a281e'));
      P.beam(c, 946, 180, 508, 22, '#5a2018');
      c.fillStyle = '#1d2a44'; c.fillRect(1090, 126, 220, 62); c.strokeStyle = '#d7a544'; c.lineWidth = 3; c.strokeRect(1090, 126, 220, 62);
      c.fillStyle = '#e8c979'; c.font = '600 40px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('临　安　府', 1200, 158);
      for (let i = 0; i < 3; i++) { c.fillStyle = P.mix('#a8acb8', '#7c8090', i / 3); c.fillRect(980 - i * 14, 540 + i * 12, 440 + i * 28, 13); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; c.strokeRect(980 - i * 14, 540 + i * 12, 440 + i * 28, 13); }      // 台阶
      /* 角门：开着一扇，里头黑 */
      c.fillStyle = '#15161c'; c.fillRect(700, 330, 96, 210); c.fillStyle = '#5a2a1e'; c.fillRect(700, 330, 40, 210); c.strokeStyle = P.rgba(C.ink, 0.85); c.lineWidth = 1.6; c.strokeRect(700, 330, 40, 210); c.strokeRect(700, 330, 96, 210);
      P.post(c, 686, 316, 14, 224, '#4a2a20'); P.post(c, 796, 316, 14, 224, '#4a2a20'); P.beam(c, 680, 308, 136, 16, '#4a2a20'); P.lantern(c, 746, 300, 14, { cord: 0, col: '#e08a4a' });
      P.ao(c, 0, 540, 2400, 60, 'top', 0.4);
      /* 街对面：一溜矮墙头、几棵落了叶的树 */
      c.fillStyle = '#2b2e3a'; c.fillRect(0, 900, 2400, 180); for (let x = 0; x < 2400; x += 40) P.ellipse(c, x + 20, 904, 19, 9, '#3c4050', 'rgba(0,0,0,0.5)', 1);
      [[260, 0.9], [1120, 1.1], [1740, 0.8], [2120, 1]].forEach(([x, s]) => { c.strokeStyle = '#1e2029'; c.lineCap = 'round'; const br = (x0, y0, len, a, w, d) => { if (d > 4 || len < 14) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); br(x1, y1, len * 0.72, a - 0.5 + r() * 0.2, w * 0.66, d + 1); br(x1, y1, len * 0.7, a + 0.42 - r() * 0.2, w * 0.66, d + 1); }; br(x, 1080, 150 * s, -Math.PI / 2 + (r() - 0.5) * 0.2, 12 * s, 0); });
      P.ao(c, 0, 830, 2400, 70, 'bottom', 0.35);
      /* 薄雾：几道横着的白 */
      for (let i = 0; i < 7; i++) { const y = 520 + i * 52 + r() * 20, g = c.createLinearGradient(0, y - 26, 0, y + 26); g.addColorStop(0, 'rgba(236,240,250,0)'); g.addColorStop(0.5, 'rgba(236,240,250,' + (0.1 + r() * 0.08) + ')'); g.addColorStop(1, 'rgba(236,240,250,0)'); c.fillStyle = g; c.fillRect(0, y - 26, 2400, 52); }
      P.paper(c, 2400, 1080, 13, 0.4);
    },
    props: [
      /* 一对石狮 */
      ...[930, 1470].map((x, i) => ({ x, y: 620, bw: 110, bh: 170, block: [-44, -34, 88, 40], draw(g) {
        P.shadow(g, 0, 2, 56, 14, 0.4);
        g.fillStyle = '#8f93a0'; g.strokeStyle = 'rgba(40,42,52,0.85)'; g.lineWidth = 1.6; g.fillRect(-44, -34, 88, 34); g.strokeRect(-44, -34, 88, 34); g.fillStyle = '#a2a6b2'; g.fillRect(-50, -42, 100, 10); g.strokeRect(-50, -42, 100, 10);
        g.save(); g.scale(i ? -1 : 1, 1);
        g.fillStyle = '#b4b8c4'; g.beginPath(); g.moveTo(-30, -42); g.quadraticCurveTo(-36, -96, -10, -112); g.quadraticCurveTo(22, -120, 30, -92); g.quadraticCurveTo(38, -66, 28, -42); g.closePath(); g.fill(); g.stroke();       // 身子
        P.ellipse(g, 12, -122, 26, 24, '#bcc0cc', 'rgba(40,42,52,0.85)', 1.6);                                                                     // 头
        for (let k = 0; k < 6; k++) P.ellipse(g, -8 + k * 8, -140 + Math.abs(k - 2.5) * 3, 6, 6, '#a8acb8', 'rgba(40,42,52,0.6)', 1);               // 鬃毛的卷
        P.ellipse(g, 20, -124, 3, 3, '#2b2d36'); P.line(g, 16, -110, 30, -110, 1.6, '#2b2d36');
        P.ellipse(g, 30, -52, 12, 12, '#9da1ae', 'rgba(40,42,52,0.8)', 1.4);                                                                        // 爪下的球
        g.restore();
      } })),
      /* 鸣冤鼓 */
      { x: 600, y: 610, bw: 90, bh: 190, block: [-34, -22, 68, 26], draw(g) {
        P.shadow(g, 0, 2, 44, 11, 0.38);
        P.line(g, -30, 0, -14, -150, 7, '#4a2a20'); P.line(g, 30, 0, 14, -150, 7, '#4a2a20'); P.line(g, -26, -40, 26, -40, 5, '#4a2a20');
        P.ellipse(g, 0, -132, 40, 44, '#8e2a20', P.rgba(C.ink, 0.85), 2); P.ellipse(g, 0, -132, 30, 34, '#e6d4b0', P.rgba(C.ink, 0.6), 1.4);
        for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28; P.ellipse(g, Math.cos(a) * 35, -132 + Math.sin(a) * 39, 2.4, 2.4, '#d7a544'); }
      } },
    ],
    anim(c, t) {                                                   // 早点担子上的热气
      for (let i = 0; i < 3; i++) { const u = (t * 0.28 + i * 0.33) % 1; const g = c.createRadialGradient(1934 + Math.sin(u * 5 + i) * 8, 596 - u * 70, 0, 1934, 596 - u * 70, 16 + u * 22); g.addColorStop(0, 'rgba(248,246,240,' + Math.sin(u * Math.PI) * 0.4 + ')'); g.addColorStop(1, 'rgba(248,246,240,0)'); c.fillStyle = g; c.fillRect(1880, 480, 110, 130); }
    },
  };

  /* ================= 清河坊 · 仁寿堂药铺 =================
     一面墙的百子柜，长柜台，左手是临街的门，右手白墙上有人题了一首诗。 */
  const HERBS = ['当归', '黄芪', '甘草', '茯苓', '白术', '川芎', '陈皮', '半夏', '桂枝', '杏仁', '麦冬', '柴胡', '黄连', '厚朴', '防风', '细辛', '枳实', '知母'];
  S.yaopu = {
    name: '仁寿堂', sub: '清河坊 · 生药铺', w: 1920, h: 1080, ambient: '#a59886', music: 'kaitan',
    walk: [[96, 720, 1790, 1030]],
    spawns: { start: { x: 250, y: 820, dir: 3 } },
    exits: [{ id: 'door', x: 70, y: 720, w: 70, h: 200, label: '出门', lx: 176, ly: 676, back: [34, 0] }],
    hots: [{ id: 'tibi', x: 1664, y: 730, r: 0, up: 250, verb: '看题壁' }],
    lights: [
      { x: 150, y: 800, r: 900, c: '#fff2d6', a: 0.85, ey: 0.6 },                         // 门口进来的天光
      { x: 960, y: 640, r: 1300, c: '#ffe4bc', a: 0.6, ey: 0.6 },
      { x: 1690, y: 880, r: 300, c: '#ffb070', a: 0.5, glow: 24, gx: 1690, gy: 880, gc: '#ff8a4a', ga: 0.4 },   // 药炉
    ],
    paint(c) {
      const r = JX.rng(1201);
      P.planks(c, 0, 560, 1920, 520, { seed: 121 });
      /* 后墙 */
      P.plaster(c, 0, 110, 1920, 450, { seed: 122 });
      c.fillStyle = '#3a271b'; c.fillRect(0, 0, 1920, 116); P.beam(c, 0, 100, 1920, 22, '#4a3122');
      [120, 440, 1500, 1820].forEach(x => P.post(c, x, 100, 24, 470, '#5a3a28'));
      /* 百子柜：十八列七排小抽屉，上面一排青瓷药罐 */
      const X0 = 478, Y0 = 196, CW = 56, CH = 48;
      c.fillStyle = '#4b3324'; c.fillRect(X0 - 12, Y0 - 62, 18 * CW + 24, 7 * CH + 82); c.strokeStyle = P.rgba(C.ink, 0.9); c.lineWidth = 2; c.strokeRect(X0 - 12, Y0 - 62, 18 * CW + 24, 7 * CH + 82);
      for (let i = 0; i < 13; i++) { const x = X0 + 40 + i * 76; P.shadow(c, x, Y0 - 12, 20, 5, 0.3); c.fillStyle = P.hgrad(c, x - 18, 0, 36, [[0, '#7fa392'], [0.45, '#d6ebe0'], [1, '#6f917f']]); c.beginPath(); c.moveTo(x - 12, Y0 - 50); c.quadraticCurveTo(x - 22, Y0 - 30, x - 15, Y0 - 12); c.lineTo(x + 15, Y0 - 12); c.quadraticCurveTo(x + 22, Y0 - 30, x + 12, Y0 - 50); c.closePath(); c.fill(); c.strokeStyle = P.rgba(C.ink, 0.75); c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#a8362a'; c.fillRect(x - 7, Y0 - 38, 14, 16); }
      for (let row = 0; row < 7; row++) for (let col = 0; col < 18; col++) {
        const x = X0 + col * CW, y = Y0 + row * CH, t = r();
        c.fillStyle = P.mix('#6a4a32', '#7e5a3e', t); c.fillRect(x + 2, y + 2, CW - 4, CH - 4); c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1; c.strokeRect(x + 2, y + 2, CW - 4, CH - 4);
        c.fillStyle = '#e9ddc0'; c.fillRect(x + 9, y + 8, 16, CH - 16); c.fillRect(x + CW - 25, y + 8, 16, CH - 16);
        const a = HERBS[(row * 18 + col) % HERBS.length], b = HERBS[(row * 18 + col + 7) % HERBS.length];
        c.fillStyle = P.rgba(C.ink, 0.85); c.font = '600 11px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(a[0], x + 17, y + 17); c.fillText(a[1], x + 17, y + 31); c.fillText(b[0], x + CW - 17, y + 17); c.fillText(b[1], x + CW - 17, y + 31);
        P.ellipse(c, x + CW / 2, y + CH / 2, 2.6, 2.6, '#d7a544', 'rgba(60,30,10,0.8)', 0.8);
      }
      /* 匾 */
      c.fillStyle = '#20160f'; c.fillRect(840, 122, 240, 64); c.strokeStyle = '#d7a544'; c.lineWidth = 3; c.strokeRect(840, 122, 240, 64);
      c.fillStyle = '#e8c979'; c.font = '600 42px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('仁　寿　堂', 960, 155);
      /* 梁上挂的药草 */
      for (let i = 0; i < 9; i++) { const x = 170 + i * 30 + (i > 4 ? 1160 : 0), len = 60 + r() * 50; P.line(c, x, 118, x, 150, 1.4, '#3a2a1e'); c.fillStyle = P.mix('#7a8a4a', '#a8935a', r()); c.beginPath(); c.moveTo(x - 4, 150); c.quadraticCurveTo(x - 16, 150 + len * 0.6, x - 6, 150 + len); c.lineTo(x + 6, 150 + len); c.quadraticCurveTo(x + 16, 150 + len * 0.6, x + 4, 150); c.closePath(); c.fill(); c.strokeStyle = P.rgba(C.ink, 0.5); c.lineWidth = 1; c.stroke(); }
      /* 左手：临街的门，外头是亮的 */
      c.fillStyle = P.hgrad(c, 0, 0, 150, [[0, '#fff6dc'], [1, '#f0d8a8']]); c.fillRect(0, 300, 128, 640);
      c.fillStyle = 'rgba(120,140,170,0.35)'; c.fillRect(0, 300, 128, 250); for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(90,100,120,' + (0.25 + i * 0.05) + ')'; c.fillRect(8 + i * 30, 470 - (i % 2) * 30, 22, 90 + (i % 2) * 30); }     // 对街的屋子
      P.post(c, 120, 280, 22, 680, '#5a3a28'); P.beam(c, 0, 280, 150, 24, '#5a3a28');
      c.fillStyle = '#2e4b6a'; c.fillRect(20, 310, 80, 150); c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1.4; c.strokeRect(20, 310, 80, 150); P.vtext(c, '生熟药材', 60, 322, 26, '#f1e6c8', '600');      // 门帘似的招子
      /* 右手：白墙，题壁 */
      c.fillStyle = 'rgba(255,250,236,0.5)'; c.fillRect(1560, 200, 240, 330);
      ['世味年来薄似纱', '谁令骑马客京华', '小楼一夜听春雨', '深巷明朝卖杏花'].forEach((ln, i) => P.vtext(c, ln, 1770 - i * 44, 222, 26, P.rgba(C.ink, 0.62), '500'));
      for (let i = 0; i < 4; i++) { c.fillStyle = P.rgba(C.ink, 0.3); c.fillRect(1590 - i * 4, 230 + i * 40, 2.2, 180 - i * 30); }                      // 后半首写得小，淡了
      P.ao(c, 0, 560, 1920, 70, 'top', 0.5);
      /* 候诊的条凳、药炉 */
      P.bench(c, 1420, 716, 210, {});
      P.shadow(c, 1690, 900, 46, 12, 0.4); c.fillStyle = '#6a5a50'; c.fillRect(1658, 838, 64, 60); c.strokeStyle = P.rgba(C.ink, 0.85); c.lineWidth = 1.6; c.strokeRect(1658, 838, 64, 60); P.ellipse(c, 1690, 876, 12, 9, '#ffb070', 'rgba(120,40,10,0.8)', 1.2);
      c.fillStyle = '#4a4038'; c.beginPath(); c.moveTo(1664, 838); c.quadraticCurveTo(1690, 800, 1716, 838); c.closePath(); c.fill(); c.stroke(); P.line(c, 1716, 824, 1740, 812, 4, '#4a4038');
      P.ao(c, 0, 1000, 1920, 80, 'bottom', 0.35);
      P.paper(c, 1920, 1080, 17, 0.4);
    },
    props: [
      /* 长柜台：戥子、药碾、一摞纸包 */
      { x: 960, y: 716, bw: 1000, bh: 150, block: [-470, -96, 940, 100], draw(g) {
        P.shadow(g, 0, 0, 480, 16, 0.4);
        g.fillStyle = P.vgrad(g, -470, -110, 110, [[0, '#7a5236'], [1, '#553622']]); g.fillRect(-470, -84, 940, 84); g.strokeStyle = P.rgba(C.ink, 0.9); g.lineWidth = 2; g.strokeRect(-470, -84, 940, 84);
        for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(215,165,68,0.5)'; g.lineWidth = 1.4; g.strokeRect(-452 + i * 152, -70, 136, 56); }
        g.fillStyle = '#8a6040'; g.fillRect(-482, -118, 964, 36); g.strokeStyle = P.rgba(C.ink, 0.9); g.lineWidth = 2; g.strokeRect(-482, -118, 964, 36);
        /* 戥子 */
        P.line(g, -250, -128, -150, -148, 2.4, '#d7a544'); P.line(g, -238, -130, -238, -112, 1, '#3a2a1e'); P.ellipse(g, -238, -110, 15, 5, '#d7a544', 'rgba(60,30,10,0.8)', 1); P.ellipse(g, -160, -134, 5, 6, '#3a3a3a');
        /* 药碾 */
        g.fillStyle = '#4a4a50'; g.beginPath(); g.moveTo(120, -122); g.quadraticCurveTo(170, -96, 220, -122); g.lineTo(214, -130); g.lineTo(126, -130); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.85); g.lineWidth = 1.4; g.stroke(); P.ellipse(g, 170, -130, 15, 15, '#5c5c64', P.rgba(C.ink, 0.85), 1.4); P.line(g, 140, -130, 200, -130, 3, '#6a4a32');
        /* 纸包、算盘 */
        for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#efe4c8' : '#e6d8b6'; g.fillRect(300 + i * 4, -134 - i * 9, 44, 12); g.strokeStyle = P.rgba(C.ink, 0.6); g.lineWidth = 1; g.strokeRect(300 + i * 4, -134 - i * 9, 44, 12); }
        g.fillStyle = '#3a2a1e'; g.fillRect(-420, -132, 96, 14); for (let i = 0; i < 9; i++) P.ellipse(g, -412 + i * 10, -125, 3.4, 4.4, '#8e2a20');
      } },
    ],
    anim(c, t) {                                                   // 药炉上的一缕气
      for (let i = 0; i < 2; i++) { const u = (t * 0.25 + i * 0.5) % 1; const g = c.createRadialGradient(1694 + Math.sin(u * 6) * 10, 800 - u * 90, 0, 1694, 800 - u * 90, 14 + u * 24); g.addColorStop(0, 'rgba(246,244,236,' + Math.sin(u * Math.PI) * 0.36 + ')'); g.addColorStop(1, 'rgba(246,244,236,0)'); c.fillStyle = g; c.fillRect(1640, 690, 110, 140); }
    },
  };
})();
