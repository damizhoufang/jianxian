/* 场景（二）：一楼大堂、门首御街、雪夜街（忆一）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C, Fig = JX.Fig;
  const S = JX.scenes = JX.scenes || {};
  const NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四'];

  /* ================= 一楼大堂 ================= */
  const TW = 190, TD = 96, TH = 50;
  const TABLES = [
    [560, 700], [960, 700], [1360, 700], [1760, 700], [2160, 700],
    [560, 970], [960, 970], [1360, 970], [1760, 970], [2160, 970],
    [560, 1240], [960, 1240], [1900, 1240], [2300, 1240],
  ].map((p, i) => ({ n: i + 1, x: p[0], y: p[1] }));
  const WALLT = [{ x: 1130, y: 480, k: 'w1' }, { x: 1470, y: 480, k: 'fan' }, { x: 1810, y: 480, k: 'w3' }, { x: 2120, y: 480, k: 'w4' }];
  JX.hallTables = TABLES;
  function sitter(g, sp, x, dir) { g.save(); g.translate(x, 0); Fig.draw(g, sp, dir, 0.5, { pose: 'sit', seat: 34, shadow: false }); g.restore(); }
  function tableSet(t, seed, o) {
    o = o || {};
    const r = JX.rng(seed), out = [], back = [], front = [];
    const nb = o.back == null ? (r() < 0.75 ? 2 : 1) : o.back, nf = o.front == null ? (r() < 0.6 ? 2 : r() < 0.5 ? 1 : 0) : o.front;
    for (let i = 0; i < nb; i++) back.push({ sp: (o.backSp && o.backSp[i]) || Fig.extra(seed * 7 + i), x: nb === 1 ? (r() < 0.5 ? -44 : 44) : (i ? 48 : -48) });
    for (let i = 0; i < nf; i++) front.push({ sp: Fig.extra(seed * 13 + i + 3), x: nf === 1 ? (r() < 0.5 ? -46 : 46) : (i ? 50 : -50) });
    if (back.length) out.push({ x: t.x, y: t.y - 116, bw: 220, bh: 150, draw(g) { back.forEach(b => sitter(g, b.sp, b.x, 0)); } });
    out.push({
      x: t.x, y: t.y, bw: TW + 30, bh: TD + TH + 30, block: [-TW / 2 - 4, -TD - 44, TW + 8, TD + 44 + 34],
      draw(g) {
        P.table(g, 0, 0, TW, TD, TH, { col: '#5c3f2a', seed });
        P.dishes(g, 0, -TH, TW, TD, seed + 1, o.empty ? 0 : 3 + Math.floor(r() * 3));
        if (o.candle !== false) P.candle(g, 0, -TH - TD * 0.55);
        if (t.n) { g.fillStyle = '#3a281c'; g.fillRect(-15, -TH + 13, 30, 22); g.strokeStyle = P.rgba(C.tenghuang, 0.8); g.lineWidth = 1; g.strokeRect(-15, -TH + 13, 30, 22); g.fillStyle = '#f0dca8'; g.font = '600 ' + (NUM[t.n].length > 1 ? 13 : 17) + 'px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(NUM[t.n], 0, -TH + 24.5); }
      },
    });
    out.push({ x: t.x, y: t.y + 44, bw: 220, bh: 150, draw(g) { P.bench(g, 0, 0, TW - 14, { seed: seed + 5 }); front.forEach(b => sitter(g, b.sp, b.x, 2)); } });
    return out;
  }
  const WALLPOEM = [
    ['三年赊尽醉春楼', 27, 0.92], ['一剑相偿未肯休', 27, 0.92], ['莫道老夫无长物', 27, 0.92], ['稼轩词里有吴钩', 27, 0.92],
    ['山外青山楼外楼', 22, 0.55], ['西湖歌舞几时休', 22, 0.55], ['暖风熏得游人醉', 22, 0.5], ['直把杭州作汴州', 22, 0.5],
    ['醉里挑灯看剑', 26, 0.7], ['梦回吹角连营', 26, 0.7], ['少年不识愁滋味', 20, 0.45], ['爱上层楼', 20, 0.45],
  ];
  S.hall = {
    name: '一楼大堂', sub: '醉春楼 · 元夕', w: 2880, h: 1500, ambient: '#877670', music: 'yuanxi',
    walk: [[80, 344, 2800, 1460]],
    spawns: { fromKitchen: { x: 200, y: 680, dir: 3 }, fromStreet: { x: 1440, y: 1390, dir: 2 }, fromStairs: { x: 2290, y: 560, dir: 1 }, mid: { x: 1380, y: 1190, dir: 0 }, start: { x: 200, y: 680, dir: 3 } },
    exits: [
      { id: 'kitchen', x: 56, y: 590, w: 66, h: 180, to: 'kitchen', spawn: 'fromHall', label: '后厨', lx: 190, ly: 540, back: [30, 0] },
      { id: 'door', x: 1340, y: 1436, w: 200, h: 40, to: 'street', spawn: 'fromHall', label: '门首', ly: 1400, back: [0, -30] },
      { id: 'stairs', x: 2330, y: 470, w: 80, h: 90, to: 'floor2', spawn: 'fromHall', label: '上二楼', lx: 2380, ly: 430, back: [-40, 20] },
    ],
    marks: [{ t: '出菜口', x: 245, y: 330 }, { t: '柜台', x: 700, y: 320 }],
    hots: [{ id: 'pass', x: 245, y: 372, r: 110, up: 120, verb: '端菜' }, { id: 'wall', x: 1470, y: 600, r: 0, up: 300 }],
    blocks: [[2420, 344, 380, 200], [470, 344, 460, 110], [960, 344, 70, 80]],
    lights: (function () {
      const L = [{ x: 1440, y: 900, r: 1500, c: '#ffe0b0', a: 0.5, ey: 0.6 }, { x: 245, y: 330, r: 360, c: '#ffcf96', a: 0.8 }, { x: 700, y: 420, r: 520, c: '#ffe0b0', a: 0.7 }, { x: 1440, y: 1470, r: 360, c: '#8fa6d8', a: 0.5 }, { x: 2600, y: 380, r: 460, c: '#ffd9a0', a: 0.55 }];
      TABLES.concat(WALLT).forEach(t => L.push({ x: t.x, y: t.y - 70, r: 300, c: '#ffd596', a: 0.5, glow: 26, gx: t.x, gy: t.y - TH - TD * 0.55 - 22, gc: '#ffc866', ga: 0.7 }));
      for (let x = 280; x < 2400; x += 320) L.push({ x, y: 300, r: 300, c: '#ffb884', a: 0.5, glow: 70, gx: x, gy: 132, gc: '#ff9a5a', ga: 0.5 });
      return L;
    })(),
    paint(c) {
      const r = JX.rng(301);
      P.planks(c, 0, 330, 2880, 1170, { seed: 33, base: '#8a6540', pw: 46 });
      /* 门口到堂心的一条苇席，走得发亮 */
      c.fillStyle = 'rgba(190,160,100,0.34)'; c.fillRect(1380, 1090, 120, 370);
      for (let y = 1090; y < 1460; y += 9) { c.fillStyle = 'rgba(70,50,24,' + (0.1 + (y % 18 ? 0.08 : 0)) + ')'; c.fillRect(1380, y, 120, 2); }
      c.strokeStyle = 'rgba(60,40,20,0.6)'; c.lineWidth = 2; c.strokeRect(1380, 1090, 120, 372);
      for (let i = 0; i < 44; i++) { const x = 100 + r() * 2680, y = 360 + r() * 1080, rad = 40 + r() * 130; const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(30,18,10,' + (0.04 + r() * 0.09) + ')'); g.addColorStop(1, 'rgba(30,18,10,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      /* 后墙 */
      P.plaster(c, 0, 0, 2880, 340, { seed: 35, base: '#dccdae' });
      c.fillStyle = P.vgrad(c, 0, 280, 60, [[0, '#6a4a30'], [1, '#4a3222']]); c.fillRect(0, 282, 2880, 58); P.line(c, 0, 282, 2880, 282, 1.5, P.rgba(C.ink, 0.8));
      for (let x = 20; x < 2880; x += 64) { c.strokeStyle = 'rgba(30,18,10,0.35)'; c.lineWidth = 1; c.strokeRect(x, 290, 56, 42); }
      P.beam(c, 0, 26, 2880, 40, '#5a2a1e');
      for (let x = 0; x < 2880; x += 48) { c.fillStyle = (x / 48) % 2 ? 'rgba(215,165,68,0.55)' : 'rgba(60,107,128,0.55)'; c.beginPath(); c.moveTo(x + 8, 46); c.quadraticCurveTo(x + 24, 30, x + 40, 46); c.quadraticCurveTo(x + 24, 62, x + 8, 46); c.fill(); }
      const posts = [100, 420, 960, 1270, 1660, 1960, 2270, 2800];
      /* 出菜口：通后厨的窗洞 */
      c.fillStyle = '#3a281c'; c.fillRect(124, 130, 242, 176);
      const kg = c.createLinearGradient(0, 140, 0, 296); kg.addColorStop(0, '#f6b866'); kg.addColorStop(1, '#c8742e'); c.fillStyle = kg; c.fillRect(136, 142, 218, 152);
      for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(60,30,12,0.55)'; c.beginPath(); c.ellipse(175 + i * 70, 300 - 62, 26, 52, 0, 0, 6.3); c.fill(); }      // 灶间忙碌的人影
      c.fillStyle = P.vgrad(c, 0, 292, 22, [[0, '#8a6a42'], [1, '#5a4028']]); c.fillRect(118, 292, 254, 22); c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1.5; c.strokeRect(118, 292, 254, 22); c.strokeRect(124, 130, 242, 176);
      [[170, C.celadon, '#b5562e'], [245, C.whiteware, '#d9a441'], [320, C.celadon, '#7d9a55']].forEach(d => { P.ellipse(c, d[0], 296, 24, 8, '#6a3020', P.rgba(C.ink, 0.8), 1.2); P.ellipse(c, d[0], 293, 16, 5.6, d[1], P.rgba(C.ink, 0.6), 1); P.ellipse(c, d[0], 292, 10, 3.6, d[2]); });
      c.fillStyle = '#3a281c'; c.fillRect(204, 88, 82, 36); c.strokeStyle = C.tenghuang; c.lineWidth = 1.5; c.strokeRect(204, 88, 82, 36); c.fillStyle = '#f0dca8'; c.font = '600 24px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('出 菜', 245, 107);
      /* 柜台后的酒牌和酒架 */
      P.beam(c, 468, 96, 470, 10, '#4a3020');
      ['皇都春', '琼花露', '蓬莱春', '雪醅', '思堂春', '蔷薇露', '流香'].forEach((n, i) => { const x = 500 + i * 66; P.line(c, x, 106, x, 120, 1.2, '#3a2a1e'); c.fillStyle = P.vgrad(c, x - 19, 120, 108, [[0, '#7a5232'], [1, '#5a3a22']]); c.fillRect(x - 19, 120, 38, 108); c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1.2; c.strokeRect(x - 19, 120, 38, 108); P.vtext(c, n, x, 128, n.length > 2 ? 27 : 34, '#f0dca8', '600', 1.1); });
      P.beam(c, 468, 250, 470, 9, '#4a3020'); for (let i = 0; i < 9; i++) P.jar(c, 500 + i * 52, 250, 0.36, { seed: 60 + i, label: false });
      /* 窗、题壁 */
      P.lattice(c, 1010, 96, 240, 172, { seed: 3, n: 12 }); P.lattice(c, 1690, 96, 240, 172, { seed: 4, n: 12 }); P.lattice(c, 2000, 96, 240, 172, { seed: 5, n: 12 });
      c.save(); c.beginPath(); c.rect(1300, 70, 340, 212); c.clip();
      c.fillStyle = 'rgba(120,96,60,0.12)'; c.fillRect(1300, 70, 340, 212);
      let cx = 1622; WALLPOEM.forEach((w, i) => { c.globalAlpha = w[2]; P.vtext(c, w[0], cx, 80 + (i % 3) * 7, w[1], '#241a14', i < 4 ? '600' : '', 1.05); cx -= w[1] * 1.3 + (i === 3 ? 12 : 2); });
      c.globalAlpha = 0.62; P.vtext(c, '灯火满临安不照来时路', 1333, 150, 12.5, '#241a14', '', 1.02); P.vtext(c, '不肯人前说姓名', 1317, 178, 12.5, '#241a14', '', 1.02);
      c.restore(); c.globalAlpha = 1;
      posts.forEach(x => P.post(c, x - 14, 66, 28, 274, C.lacquer));
      /* 彩绸与灯 */
      const sw = [C.zhusha, C.tenghuang, C.shilv, C.yanzhi, C.shiqing];
      for (let i = 0; i < posts.length - 1; i++) { const a = posts[i], b = posts[i + 1]; P.swag(c, a, 70, b, 70, 34 + (i % 2) * 10, 7, sw[i % sw.length]); }
      for (let x = 280; x < 2400; x += 320) P.lantern(c, x, 132, 26, { cord: 44, col: '#d8432c', text: '春' });
      /* 楼梯（右后），通二楼 */
      c.fillStyle = '#20150f'; c.fillRect(2420, 66, 380, 274);
      const sg = c.createLinearGradient(2420, 0, 2800, 0); sg.addColorStop(0, 'rgba(255,214,150,0.05)'); sg.addColorStop(1, 'rgba(255,214,150,0.5)'); c.fillStyle = sg; c.fillRect(2420, 66, 380, 150);
      for (let i = 0; i < 11; i++) { const x = 2424 + i * 34, y = 510 - i * 34; c.fillStyle = P.mix('#7a5636', '#b78a58', i / 11); c.fillRect(x, y, 380 - i * 34, 16); c.fillStyle = 'rgba(20,12,8,0.5)'; c.fillRect(x, y + 16, 380 - i * 34, 18); c.strokeStyle = P.rgba(C.ink, 0.7); c.lineWidth = 1.2; c.strokeRect(x, y, 380 - i * 34, 16); }
      c.strokeStyle = '#5a2a1e'; c.lineWidth = 12; c.beginPath(); c.moveTo(2416, 440); c.lineTo(2790, 66); c.stroke();
      c.strokeStyle = P.rgba(C.ink, 0.7); c.lineWidth = 1.2; c.beginPath(); c.moveTo(2416, 434); c.lineTo(2790, 60); c.stroke();
      for (let i = 0; i < 10; i++) { const x = 2434 + i * 37; c.fillStyle = '#6a3424'; c.fillRect(x, 422 - i * 37, 7, 78); }
      P.post(c, 2404, 400, 22, 130, C.lacquer);
      /* 墙与门 */
      c.fillStyle = '#17110d'; c.fillRect(0, 330, 80, 1170); c.fillRect(2800, 330, 80, 1170); c.fillRect(0, 1460, 2880, 40);
      c.fillStyle = '#e9c58a'; c.fillRect(0, 580, 62, 200); P.beam(c, 62, 570, 18, 220, '#4a3020');
      c.fillStyle = P.hgrad(c, 8, 0, 54, [[0, '#2c4560'], [1, '#3e5c78']]); c.fillRect(8, 580, 54, 150); P.vtext(c, '酒', 35, 620, 22, '#e6dcc2', '600');
      const dg = c.createLinearGradient(0, 1450, 0, 1500); dg.addColorStop(0, '#5a6a94'); dg.addColorStop(1, '#27304e'); c.fillStyle = dg; c.fillRect(1340, 1456, 200, 44);
      P.beam(c, 1322, 1440, 18, 60, C.lacquer); P.beam(c, 1540, 1440, 18, 60, C.lacquer);
      P.ao(c, 80, 330, 130, 1130, 'left', 0.4); P.ao(c, 2670, 330, 130, 1130, 'right', 0.4); P.ao(c, 0, 330, 2880, 80, 'top', 0.45); P.ao(c, 0, 1370, 2880, 90, 'bottom', 0.4);
      P.paper(c, 2880, 1500, 8, 0.42);
    },
    props: (function () {
      let ps = [];
      TABLES.forEach(t => { ps = ps.concat(tableSet(t, 400 + t.n * 3, t.n === 7 ? { back: 2, backSp: [Fig.cast.shikeA] } : t.n === 9 ? { back: 2, backSp: [Fig.cast.shikeB] } : null)); });
      WALLT.forEach((t, i) => { ps = ps.concat(tableSet({ x: t.x, y: t.y }, 470 + i * 5, t.k === 'fan' ? { back: 0, front: 0, empty: true } : { front: i % 2 })); });
      /* 柜台 */
      ps.push({ x: 700, y: 454, bw: 480, bh: 150, draw(g) {
        P.shadow(g, 0, 0, 250, 16, 0.45);
        g.fillStyle = P.vgrad(g, -230, -78, 78, [[0, '#6a3a26'], [1, '#43241a']]); g.fillRect(-230, -78, 460, 78); g.strokeStyle = P.rgba(C.ink, 0.85); g.lineWidth = 1.6; g.strokeRect(-230, -78, 460, 78);
        for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(215,165,68,0.5)'; g.lineWidth = 1.2; g.strokeRect(-218 + i * 90, -68, 76, 56); g.strokeStyle = 'rgba(20,10,6,0.5)'; g.strokeRect(-212 + i * 90, -62, 64, 44); }
        g.fillStyle = P.vgrad(g, -236, -124, 46, [[0, '#8a5236'], [1, '#6f3d28']]); g.fillRect(-236, -124, 472, 46); g.strokeRect(-236, -124, 472, 46);
        g.fillStyle = 'rgba(255,236,200,0.18)'; g.fillRect(-232, -121, 464, 2);
        g.fillStyle = '#2a1c14'; g.fillRect(-196, -116, 96, 26); g.strokeStyle = C.tenghuang; g.lineWidth = 1; g.strokeRect(-196, -116, 96, 26);            // 算盘
        for (let i = 0; i < 9; i++) { P.line(g, -188 + i * 10, -114, -188 + i * 10, -92, 0.8, '#8a744c'); P.ellipse(g, -188 + i * 10, -110 + (i % 3) * 3, 3.6, 2.2, '#b08a5c'); P.ellipse(g, -188 + i * 10, -98 - (i % 2) * 3, 3.6, 2.2, '#b08a5c'); }
        g.fillStyle = '#e9dfc6'; g.fillRect(-70, -116, 70, 28); g.strokeStyle = P.rgba(C.ink, 0.7); g.strokeRect(-70, -116, 70, 28); for (let i = 0; i < 5; i++) P.line(g, -62 + i * 13, -112, -62 + i * 13, -92, 0.8, 'rgba(40,30,22,0.5)');   // 账本
        P.jar(g, 60, -86, 0.42, { seed: 2, text: '春' }); P.jar(g, 112, -90, 0.36, { seed: 4, label: false }); P.candle(g, 170, -96);
        P.ellipse(g, 200, -100, 14, 5, C.celadon, P.rgba(C.ink, 0.6), 1);
      } });
      /* 温酒的垆 */
      ps.push({ x: 994, y: 424, bw: 90, bh: 110, draw(g) { P.shadow(g, 0, 0, 44, 12, 0.4); g.fillStyle = P.hgrad(g, -30, 0, 60, [[0, '#6a5444'], [0.4, '#9a8068'], [1, '#55423a']]); g.beginPath(); g.moveTo(-28, 0); g.lineTo(-32, -52); g.lineTo(32, -52); g.lineTo(28, 0); g.closePath(); g.fill(); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.4; g.stroke(); const fg = g.createRadialGradient(0, -18, 1, 0, -18, 16); fg.addColorStop(0, '#ffe9a0'); fg.addColorStop(1, 'rgba(220,80,20,0.1)'); P.ellipse(g, 0, -18, 12, 10, '#140c08'); P.ellipse(g, 0, -17, 10, 8, fg); P.ellipse(g, 0, -54, 30, 9, '#2a221e', P.rgba(C.ink, 0.8), 1.3); P.ellipse(g, 0, -60, 20, 7, '#a9c4b0', P.rgba(C.ink, 0.7), 1); P.ellipse(g, 0, -68, 9, 4, '#8fae9a', P.rgba(C.ink, 0.7), 1); } });
      return ps;
    })(),
    anim(c, t) { const u = (t * 0.3) % 1; const g = c.createRadialGradient(994, 350 - u * 60, 0, 994, 350 - u * 60, 26 + u * 20); g.addColorStop(0, 'rgba(245,240,230,' + Math.sin(u * 3.14) * 0.16 + ')'); g.addColorStop(1, 'rgba(245,240,230,0)'); c.fillStyle = g; c.fillRect(940, 250, 110, 130); },
  };

  /* ================= 门首 · 御街口 ================= */
  function facade(c, x0, x1, o) {
    /* 一段临街铺面：瓦檐、木构、门窗 */
    o = o || {};
    const lit = o.lit, snow = o.snow, baseY = o.baseY || 520, top = o.top || 120;
    c.fillStyle = o.wall || (lit ? '#7a5236' : '#3a2e2a'); c.fillRect(x0, top, x1 - x0, baseY - top);
    /* 瓦檐 */
    const ey = top - 6;
    c.fillStyle = P.vgrad(c, x0, ey - 86, 92, [[0, '#2a2a30'], [1, '#494a52']]); c.beginPath(); c.moveTo(x0 - 26, ey + 6); c.lineTo(x0 + 10, ey - 86); c.lineTo(x1 - 10, ey - 86); c.lineTo(x1 + 26, ey + 6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(15,12,14,0.6)'; c.lineWidth = 1;
    for (let x = x0 - 10; x < x1 + 20; x += 15) { c.beginPath(); c.moveTo(x, ey + 6); c.lineTo(x + (x - (x0 + x1) / 2) * -0.04 + 4, ey - 86); c.stroke(); }
    for (let x = x0 - 22; x < x1 + 22; x += 15) P.ellipse(c, x + 7, ey + 5, 7.5, 5, '#3a3a42', 'rgba(15,12,14,0.7)', 1);
    if (snow) { c.fillStyle = '#eef2f6'; c.beginPath(); c.moveTo(x0 - 28, ey + 4); c.lineTo(x0 + 8, ey - 88); c.lineTo(x1 - 8, ey - 88); c.lineTo(x1 + 28, ey + 4); for (let x = x1 + 28; x > x0 - 28; x -= 38) c.quadraticCurveTo(x - 19, ey - 6 - ((x * 7) % 9), x - 38, ey + 4); c.closePath(); c.fill(); c.fillStyle = 'rgba(120,140,170,0.35)'; c.fillRect(x0 - 10, ey - 22, x1 - x0 + 20, 20); }
    P.beam(c, x0, top, x1 - x0, 22, o.beam || '#4a2a1e');
    P.ao(c, x0, top + 22, x1 - x0, 40, 'top', 0.5);
  }
  function shutters(c, x, y, w, h, seed, snow) {
    const r = JX.rng(seed);
    for (let px = x; px < x + w - 2; px += 34) { const t = r(); c.fillStyle = P.mix('#5a4636', '#3f3026', t); c.fillRect(px, y, 33, h); c.strokeStyle = 'rgba(15,10,8,0.7)'; c.lineWidth = 1.2; c.strokeRect(px, y, 33, h); for (let k = 0; k < 3; k++) P.line(c, px + 6 + r() * 20, y + 10, px + 6 + r() * 20, y + h - 10, 0.8, 'rgba(15,10,8,0.2)'); }
    P.beam(c, x - 4, y + h * 0.45, w + 8, 10, '#3a2a20');
    if (snow) { c.fillStyle = 'rgba(238,242,246,0.9)'; c.beginPath(); c.moveTo(x - 6, y + h); for (let px = x - 6; px < x + w + 6; px += 30) c.quadraticCurveTo(px + 15, y + h - 14 - ((px * 5) % 8), px + 30, y + h); c.closePath(); c.fill(); }
  }
  function zuichunlou(c, x0, x1, baseY, top, o) {
    /* 醉春楼的门面：朱柱、格子门、匾额、门里的灯火 */
    o = o || {};
    const cx = (x0 + x1) / 2;
    facade(c, x0, x1, { lit: true, baseY, top, wall: '#6a4630', snow: o.snow, beam: '#6a2a1e' });
    const ww = o.winW || 200;
    (o.wins || [-626, -376, 176, 426]).forEach(dx => {
      const x = cx + dx;
      const g = c.createLinearGradient(0, top + 50, 0, baseY - 50); g.addColorStop(0, o.dim ? '#c88a46' : '#ffd98a'); g.addColorStop(1, o.dim ? '#9a5a28' : '#f09a48'); c.fillStyle = g; c.fillRect(x, top + 50, ww, baseY - top - 110);
      c.save(); c.beginPath(); c.rect(x, top + 50, ww, baseY - top - 110); c.clip();
      const r = JX.rng(Math.round(x)); for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(70,30,12,' + (0.3 + r() * 0.25) + ')'; const px = x + 30 + r() * (ww - 60); c.beginPath(); c.ellipse(px, baseY - 70, 20, 60, 0, 0, 6.3); c.fill(); c.beginPath(); c.arc(px, baseY - 140, 15, 0, 6.3); c.fill(); }
      c.fillStyle = '#4a2a1c'; for (let bx = x + 14; bx < x + ww; bx += 14) c.fillRect(bx - 1.4, top + 50, 2.8, baseY - top - 110); for (let by = top + 64; by < baseY - 60; by += 14) c.fillRect(x, by - 1.4, ww, 2.8);
      c.restore(); c.strokeStyle = '#4a2a1c'; c.lineWidth = 8; c.strokeRect(x, top + 50, ww, baseY - top - 110);
      c.fillStyle = '#5a3424'; c.fillRect(x - 4, baseY - 60, ww + 8, 60); c.strokeStyle = P.rgba(C.ink, 0.7); c.lineWidth = 1.2; c.strokeRect(x - 4, baseY - 60, ww + 8, 60);
    });
    /* 正门 */
    const dg = c.createLinearGradient(0, top + 40, 0, baseY); dg.addColorStop(0, o.dim ? '#d09a56' : '#fff0c0'); dg.addColorStop(1, o.dim ? '#a8682e' : '#f6b060'); c.fillStyle = dg; c.fillRect(cx - 100, top + 40, 200, baseY - top - 40);
    if (o.doorShut) { c.fillStyle = '#5a3424'; c.fillRect(cx - 100, top + 40, 92, baseY - top - 40); c.fillRect(cx + 8, top + 40, 92, baseY - top - 40); c.strokeStyle = P.rgba(C.ink, 0.8); c.lineWidth = 1.4; c.strokeRect(cx - 100, top + 40, 92, baseY - top - 40); c.strokeRect(cx + 8, top + 40, 92, baseY - top - 40); for (let i = 0; i < 2; i++) for (let by = top + 60; by < baseY - 130; by += 13) { c.fillStyle = 'rgba(255,200,120,0.75)'; c.fillRect(cx - 90 + i * 108, by, 72, 8); } }
    else { c.fillStyle = 'rgba(80,40,16,0.4)'; c.beginPath(); c.ellipse(cx - 40, baseY - 60, 18, 62, 0, 0, 6.3); c.fill(); c.beginPath(); c.ellipse(cx + 46, baseY - 50, 16, 54, 0, 0, 6.3); c.fill(); }
    [x0 + 14, cx - 124, cx + 104, x1 - 34].forEach(x => P.post(c, x, top + 22, 22, baseY - top - 22, C.lacquer));
    /* 匾 */
    c.fillStyle = '#17100c'; c.fillRect(cx - 150, top - 70, 300, 84); c.strokeStyle = C.tenghuang; c.lineWidth = 3; c.strokeRect(cx - 144, top - 64, 288, 72); c.strokeStyle = P.rgba(C.ink, 0.9); c.lineWidth = 1.5; c.strokeRect(cx - 150, top - 70, 300, 84);
    c.fillStyle = o.dim ? '#c9a45a' : '#f2cf7a'; c.font = '600 58px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('醉 春 樓', cx, top - 27);
    if (o.snow) { c.fillStyle = '#eef2f6'; c.beginPath(); c.ellipse(cx, top - 70, 150, 9, 0, Math.PI, 0); c.fill(); }
  }
  function cobbles(c, x, y, w, h, seed, snow) {
    P.flagstones(c, x, y, w, h, { seed, base: snow ? '#9aa3ad' : '#6f6a66', sh: 78 });
  }
  const STRINGS = [[1290, 96, 420, 700], [1590, 96, 2400, 640], [1290, 150, 860, 1180], [1590, 150, 2060, 1190]];
  function stringPts(s, n) { const out = []; for (let i = 1; i < n; i++) { const u = i / n; out.push({ x: s[0] + (s[2] - s[0]) * u, y: s[1] + (s[3] - s[1]) * u + Math.sin(u * Math.PI) * 60, i }); } return out; }
  const LCOL = ['#e0482e', '#f0b23c', '#e06a8a', '#68b08a', '#e0482e', '#f08a3c'];
  S.street = {
    name: '门首 · 御街口', sub: '正月十五夜', w: 2880, h: 1300, ambient: '#545c8a', particles: 'embers', music: 'dengshi', outside: '#06070c',
    walk: [[60, 540, 2820, 1240]],
    spawns: { fromHall: { x: 1440, y: 610, dir: 0 }, start: { x: 1440, y: 610, dir: 0 }, title: { x: 1440, y: 760, dir: 0 } },
    exits: [{ id: 'door', x: 1350, y: 528, w: 180, h: 30, to: 'hall', spawn: 'fromStreet', label: '回醉春楼', ly: 480, back: [0, 30] }],
    marks: [{ t: '御街 · 灯市', x: 2500, y: 1180 }, { t: '卖圆子的担子', x: 520, y: 760 }],
    blocks: [[1262, 540, 40, 16], [1578, 540, 40, 16], [2470, 640, 320, 150]],
    lights: (function () {
      const L = [{ x: 1440, y: 640, r: 620, c: '#ffd9a0', a: 1, ey: 0.85 }, { x: 1440, y: 330, r: 760, c: '#ffcf96', a: 0.7 }, { x: 1000, y: 420, r: 420, c: '#ffcf96', a: 0.6 }, { x: 1880, y: 420, r: 420, c: '#ffcf96', a: 0.6 },
        { x: 2450, y: 420, r: 520, c: '#ffd9a0', a: 0.9 }, { x: 2630, y: 740, r: 560, c: '#ffc48a', a: 0.95, ey: 0.9 }, { x: 520, y: 880, r: 380, c: '#ffcf96', a: 0.85, glow: 46, gx: 566, gy: 792, gc: '#ffb860' }, { x: 2250, y: 990, r: 400, c: '#ffcf96', a: 0.85 }, { x: 1440, y: 1000, r: 900, c: '#8a94c8', a: 0.3 }];
      STRINGS.forEach((s, k) => stringPts(s, 9).forEach(p => L.push({ x: p.x, y: p.y + 60, r: 170, c: '#ffc890', a: 0.3, glow: 30, gx: p.x, gy: p.y + 16, gc: LCOL[(p.i + k) % 6], ga: 0.6 })));
      [[1290, 300], [1590, 300], [1350, 190], [1530, 190]].forEach(p => L.push({ x: p[0], y: p[1], r: 10, c: '#ffc890', a: 0, glow: 60, gx: p[0], gy: p[1], gc: '#ff9a5a', ga: 0.55 }));
      return L;
    })(),
    paint(c) {
      const r = JX.rng(501);
      c.fillStyle = '#0b0d18'; c.fillRect(0, 0, 2880, 140);
      cobbles(c, 0, 500, 2880, 800, 51);
      for (let i = 0; i < 60; i++) { const x = r() * 2880, y = 540 + r() * 740, rad = 50 + r() * 160; const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(18,14,22,' + (0.06 + r() * 0.12) + ')'); g.addColorStop(1, 'rgba(18,14,22,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      for (let i = 0; i < 260; i++) { const x = r() * 2880, y = 560 + r() * 720; c.fillStyle = [C.zhusha, C.tenghuang, '#e8d8b8', C.yanzhi][Math.floor(r() * 4)]; c.globalAlpha = 0.25 + r() * 0.4; c.save(); c.translate(x, y); c.rotate(r() * 6); c.fillRect(-3, -1.4, 6, 2.8); c.restore(); } c.globalAlpha = 1;   // 一地的彩纸
      /* 左邻：关了板门的彩帛铺；右邻：灯铺 */
      facade(c, 40, 740, { top: 150, wall: '#33292a' }); shutters(c, 80, 230, 620, 290, 7);
      c.fillStyle = '#241a16'; c.fillRect(300, 172, 180, 46); c.strokeStyle = 'rgba(160,130,70,0.5)'; c.lineWidth = 1.5; c.strokeRect(300, 172, 180, 46); c.fillStyle = 'rgba(200,170,110,0.6)'; c.font = '600 30px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('陳家綵帛', 390, 196);
      facade(c, 2140, 2840, { top: 150, lit: true, wall: '#5e4230' });
      const lg = c.createLinearGradient(0, 200, 0, 520); lg.addColorStop(0, '#ffe2a0'); lg.addColorStop(1, '#f0a050'); c.fillStyle = lg; c.fillRect(2190, 196, 600, 324);
      for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const x = 2230 + i * 66 + (row % 2) * 30, y = 262 + row * 86; P.lantern(c, x, y, 20 + ((i + row) % 3) * 3, { cord: 22, col: LCOL[(i + row * 2) % 6], tasselLen: 16 }); }
      P.post(c, 2176, 172, 20, 348, C.lacquer); P.post(c, 2786, 172, 20, 348, C.lacquer);
      c.fillStyle = '#17100c'; c.fillRect(2400, 96, 180, 52); c.strokeStyle = C.tenghuang; c.lineWidth = 2; c.strokeRect(2404, 100, 172, 44); c.fillStyle = '#f2cf7a'; c.font = '600 34px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('周家燈鋪', 2490, 123);
      /* 醉春楼 */
      zuichunlou(c, 760, 2120, 520, 150);
      /* 二楼的栏杆和灯（画面上沿） */
      c.fillStyle = '#3a2218'; c.fillRect(760, 0, 1360, 16); for (let x = 780; x < 2120; x += 26) { c.fillStyle = '#5a2a1e'; c.fillRect(x, 16, 5, 34); } P.beam(c, 760, 46, 1360, 9, '#5a2a1e');
      /* 彩楼欢门：两根高杆，横枋，扎满彩绸纸花 */
      [1280, 1600].forEach(x => { c.fillStyle = P.hgrad(c, x - 9, 0, 18, [[0, '#6a5a2a'], [0.4, '#b89a4a'], [1, '#5a4a22']]); c.fillRect(x - 9, 30, 18, 520); for (let y = 60; y < 540; y += 46) { c.fillStyle = 'rgba(60,45,15,0.6)'; c.fillRect(x - 10, y, 20, 4); } });
      P.beam(c, 1250, 22, 380, 14, '#8a6a2a'); P.beam(c, 1262, 60, 356, 10, '#8a6a2a');
      for (let i = 0; i < 9; i++) P.swag(c, 1262 + i * 40, 28, 1302 + i * 40, 28, 16 + (i % 3) * 6, 9, sw5(i));
      for (let i = 0; i < 40; i++) { const x = 1256 + r() * 368, y = 10 + r() * 62; P.ellipse(c, x, y, 5 + r() * 4, 5 + r() * 4, [C.zhusha, '#f0c0c8', C.tenghuang, '#f4ecd8', C.yanzhi][Math.floor(r() * 5)], 'rgba(60,20,20,0.4)', 0.8); }
      [1280, 1600].forEach(x => { for (let k = 0; k < 4; k++) P.swag(c, x, 150 + k * 80, x + (x < 1440 ? -30 : 30), 215 + k * 80, 6, 7, sw5(k + (x < 1440 ? 0 : 2))); });
      [[1290, 300], [1590, 300]].forEach(p => P.lantern(c, p[0], p[1], 30, { cord: 150, col: '#d8432c', text: '酒' }));
      [[1350, 190], [1530, 190]].forEach(p => P.lantern(c, p[0], p[1], 20, { cord: 40, col: '#f0a23c' }));
      /* 酒旗 */
      c.fillStyle = '#3a2a1e'; c.fillRect(1722, 10, 8, 510); c.fillStyle = '#3a2a1e'; c.fillRect(1722, 40, 96, 6);
      c.fillStyle = P.hgrad(c, 1740, 0, 70, [[0, '#2c4a66'], [1, '#3e6484']]); c.beginPath(); c.moveTo(1740, 46); c.lineTo(1812, 46); c.lineTo(1806, 330); c.lineTo(1776, 306); c.lineTo(1746, 330); c.closePath(); c.fill(); c.strokeStyle = P.rgba(C.ink, 0.7); c.lineWidth = 1.2; c.stroke();
      P.vtext(c, '新酒皇都春', 1776, 60, 40, '#f0e2be', '600', 1.1);
      P.ao(c, 0, 520, 2880, 70, 'top', 0.5); P.ao(c, 0, 1200, 2880, 100, 'bottom', 0.5);
      P.paper(c, 2880, 1300, 9, 0.4);
    },
    props: [
      /* 卖圆子的担子 */
      { x: 520, y: 860, bw: 280, bh: 190, block: [-110, -40, 220, 40], draw(g) {
        P.shadow(g, 0, 0, 130, 18, 0.45);
        g.save(); g.translate(-2, -34); Fig.draw(g, Fig.extra(77), 0, 0.5, { shadow: false }); g.restore();
        [-74, 70].forEach((x, i) => { g.fillStyle = P.vgrad(g, x - 34, -70, 70, [[0, '#8a6a42'], [1, '#5c4329']]); g.fillRect(x - 34, -70, 68, 70); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.4; g.strokeRect(x - 34, -70, 68, 70); for (let k = 0; k < 4; k++) P.line(g, x - 34, -56 + k * 16, x + 34, -56 + k * 16, 1, 'rgba(30,18,10,0.4)'); if (!i) { P.ellipse(g, x, -72, 30, 9, '#2a221e', P.rgba(C.ink, 0.8), 1.2); P.ellipse(g, x, -74, 24, 7, '#ece6d8'); for (let k = 0; k < 6; k++) P.ellipse(g, x - 14 + k * 5.6, -75 + (k % 2) * 2, 4, 3.4, '#fffaf0', 'rgba(120,100,80,0.5)', 0.6); } else { for (let k = 0; k < 4; k++) P.ellipse(g, x - 14 + (k % 2) * 28, -74 - Math.floor(k / 2) * 5, 13, 5, C.celadon, P.rgba(C.ink, 0.6), 0.9); } });
        g.strokeStyle = '#7a5a34'; g.lineWidth = 5; g.beginPath(); g.moveTo(-110, -110); g.quadraticCurveTo(0, -128, 106, -110); g.stroke();
        P.line(g, -74, -110, -74, -70, 1.2, '#3a2a1e'); P.line(g, 70, -110, 70, -70, 1.2, '#3a2a1e');
        P.line(g, 46, -150, 46, -70, 3, '#5a4028'); P.lantern(g, 46, -100, 16, { cord: 30, col: '#f0a23c', tasselLen: 12 });
      } },
      /* 面具花灯摊 */
      { x: 2250, y: 1010, bw: 330, bh: 250, block: [-140, -60, 280, 60], draw(g) {
        g.save(); g.translate(46, -66); Fig.draw(g, Fig.extra(91), 0, 0.5, { shadow: false }); g.restore();
        P.table(g, 0, 0, 280, 70, 52, { col: '#5a4030', seed: 61 });
        P.line(g, -132, -52, -132, -230, 5, '#5a4028'); P.line(g, 132, -52, 132, -230, 5, '#5a4028'); P.beam(g, -140, -236, 280, 9, '#5a4028');
        for (let i = 0; i < 7; i++) P.lantern(g, -108 + i * 36, -186 + (i % 2) * 14, 14 + (i % 3) * 2, { cord: 26, col: LCOL[i % 6], tasselLen: 12 });
        for (let i = 0; i < 5; i++) { const x = -100 + i * 50; P.ellipse(g, x, -92, 17, 20, ['#f4ecd8', '#e8c8a0', '#d85a44', '#f4ecd8', '#6a9a80'][i], P.rgba(C.ink, 0.8), 1.2); P.ellipse(g, x - 6, -96, 3.4, 2.2, '#1a1310'); P.ellipse(g, x + 6, -96, 3.4, 2.2, '#1a1310'); P.line(g, x - 5, -84, x + 5, -84, 1.4, '#8a2a20'); }
      } },
      /* 鳌山：层层叠叠的灯山 */
      { x: 2630, y: 790, bw: 380, bh: 520, sortY: 790, draw(g) {
        P.shadow(g, 0, 0, 180, 26, 0.5);
        g.strokeStyle = '#6a5a2a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-160, 0); g.lineTo(0, -500); g.lineTo(160, 0); g.moveTo(-80, 0); g.lineTo(0, -500); g.lineTo(80, 0); g.stroke();
        for (let row = 0; row < 7; row++) { const y = -40 - row * 64, half = 150 - row * 20; g.strokeStyle = '#6a5a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(-half, y - 26); g.lineTo(half, y - 26); g.stroke(); const n = 7 - row; for (let i = 0; i < n; i++) { const x = n === 1 ? 0 : -half + 16 + i * ((half * 2 - 32) / (n - 1)); P.lantern(g, x, y, 17 - row, { cord: 8, col: LCOL[(i + row) % 6], tasselLen: 10 }); } }
        P.lantern(g, 0, -486, 26, { cord: 0, col: '#f0c040', tassel: false });
        g.fillStyle = '#5a2a1e'; g.fillRect(-170, -14, 340, 14); g.strokeStyle = P.rgba(C.ink, 0.8); g.lineWidth = 1.2; g.strokeRect(-170, -14, 340, 14);
      } },
    ],
    glow(c, t) {
      const gs = JX.world.glowSprite('#ffb866');
      for (let row = 0; row < 7; row++) { const n = 7 - row, half = 150 - row * 20, y = 790 - 40 - row * 64; for (let i = 0; i < n; i++) { const x = 2630 + (n === 1 ? 0 : -half + 16 + i * ((half * 2 - 32) / (n - 1))), fl = 0.5 + 0.12 * Math.sin(t * 4 + i * 2 + row); c.globalAlpha = fl; c.drawImage(gs, x - 34, y - 34, 68, 68); } }
      for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const x = 2230 + i * 66 + (row % 2) * 30, y = 262 + row * 86; c.globalAlpha = 0.4 + 0.08 * Math.sin(t * 3 + i + row * 2); c.drawImage(gs, x - 40, y - 40, 80, 80); }
      c.globalAlpha = 1;
    },
    top(c, t) {                                                  // 横过街面的灯索，画在人上面
      STRINGS.forEach((s, k) => {
        c.strokeStyle = 'rgba(20,14,10,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(s[0], s[1]);
        for (let i = 1; i <= 24; i++) { const u = i / 24; c.lineTo(s[0] + (s[2] - s[0]) * u, s[1] + (s[3] - s[1]) * u + Math.sin(u * Math.PI) * 60); } c.stroke();
        stringPts(s, 9).forEach(p => { const swy = Math.sin(t * 1.3 + p.i + k) * 1.5; P.lantern(c, p.x + swy, p.y + 16, 13, { cord: 6, col: LCOL[(p.i + k) % 6], tasselLen: 10 }); });
      });
    },
  };
  function sw5(i) { return [C.zhusha, C.tenghuang, C.shilv, C.yanzhi, C.shiqing][((i % 5) + 5) % 5]; }

  /* ================= 雪夜（忆一） ================= */
  S.snow = {
    name: '雪夜', sub: '宝祐四年 · 冬', w: 3000, h: 1080, ambient: '#8494ba', particles: 'snow', music: 'xueye', outside: '#05060a',
    walk: [[60, 500, 2940, 1000]],
    spawns: { start: { x: 220, y: 760, dir: 3 } },
    exits: [],
    blocks: [[2330, 500, 220, 40]],
    lights: [{ x: 2440, y: 640, r: 560, c: '#ffcf8e', a: 1, ey: 0.8 }, { x: 2440, y: 330, r: 520, c: '#ffc27a', a: 0.6 }, { x: 2340, y: 300, r: 10, c: '#ffc890', a: 0, glow: 64, gx: 2338, gy: 318, gc: '#ff9a5a', ga: 0.6 }, { x: 2540, y: 300, r: 10, c: '#ffc890', a: 0, glow: 64, gx: 2542, gy: 318, gc: '#ff9a5a', ga: 0.6 }, { x: 900, y: 760, r: 1300, c: '#9ab0e0', a: 0.3, ey: 0.6 }, { x: 2000, y: 860, r: 900, c: '#9ab0e0', a: 0.2, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(701);
      c.fillStyle = '#0a0c16'; c.fillRect(0, 0, 3000, 120);
      /* 雪地 */
      c.fillStyle = P.vgrad(c, 0, 470, 610, [[0, '#cfd6e0'], [1, '#e9eef3']]); c.fillRect(0, 470, 3000, 610);
      for (let i = 0; i < 170; i++) { const x = r() * 3000, y = 500 + r() * 560, rx = 40 + r() * 160, ry = 8 + r() * 22; const g = c.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, r() < 0.5 ? 'rgba(120,140,180,0.16)' : 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(160,175,200,0)'); c.save(); c.translate(x, y); c.scale(1, ry / rx); c.translate(-x, -y); c.fillStyle = g; c.fillRect(x - rx, y - rx, rx * 2, rx * 2); c.restore(); }
      c.strokeStyle = 'rgba(110,125,160,0.3)'; c.lineWidth = 7; [[690, 0], [742, 3]].forEach(o => { c.beginPath(); c.moveTo(0, o[0] + 20); c.bezierCurveTo(900, o[0] - 20 + o[1], 1900, o[0] + 40, 3000, o[0]); c.stroke(); });   // 车辙
      /* 一排关了门的铺子 */
      const names = ['劉家香藥', '徐家紙札', '張官人經書', '顧家彩帛', '孫家生藥'];
      for (let i = 0; i < 5; i++) {
        const x0 = 30 + i * 414, x1 = x0 + 396;
        facade(c, x0, x1, { top: 150, baseY: 470, wall: '#2e2828', snow: true }); shutters(c, x0 + 30, 220, 336, 250, 20 + i, true);
        c.fillStyle = '#201814'; c.fillRect(x0 + 118, 172, 160, 40); c.fillStyle = 'rgba(190,165,115,0.5)'; c.font = '600 25px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(names[i], x0 + 198, 193);
      }
      zuichunlou(c, 2110, 2780, 470, 150, { snow: true, doorShut: true, dim: true, wins: [-300, 120], winW: 180 });
      [[2338, 300], [2542, 300]].forEach(p => P.lantern(c, p[0], p[1], 24, { cord: 100, col: '#d8432c', text: '酒' }));
      facade(c, 2796, 3000, { top: 150, baseY: 470, wall: '#2e2828', snow: true }); shutters(c, 2820, 220, 180, 250, 33, true);
      /* 墙根的雪堆 */
      c.fillStyle = '#eef2f6'; for (let x = 0; x < 3000; x += 70) { c.beginPath(); c.ellipse(x + 35, 474, 50 + ((x * 3) % 24), 14 + ((x * 7) % 9), 0, 0, 6.3); c.fill(); }
      /* 醉春楼门前扫出来的一小块地，和漏出来的灯光 */
      const g = c.createRadialGradient(2440, 560, 20, 2440, 560, 300); g.addColorStop(0, 'rgba(150,120,90,0.5)'); g.addColorStop(1, 'rgba(150,120,90,0)'); c.save(); c.translate(2440, 560); c.scale(1, 0.4); c.translate(-2440, -560); c.fillStyle = g; c.fillRect(2140, 260, 600, 600); c.restore();
      P.ao(c, 0, 470, 3000, 60, 'top', 0.3);
      P.paper(c, 3000, 1080, 12, 0.5);
    },
    props: [
      { x: 2440, y: 540, bw: 240, bh: 60, draw(g) { g.fillStyle = '#8c8880'; g.fillRect(-110, -34, 220, 34); g.strokeStyle = P.rgba(C.ink, 0.6); g.lineWidth = 1.2; g.strokeRect(-110, -34, 220, 34); g.fillStyle = '#eef2f6'; g.beginPath(); g.ellipse(-60, -34, 60, 8, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(70, -34, 44, 6, 0, Math.PI, 0); g.fill(); } },
    ],
    setup(W) { W.prints = []; W.printAt = null; },
    update(W) {
      const p = W.player; if (!p) return;
      if (!W.printAt || JX.dist(p.x, p.y, W.printAt.x, W.printAt.y) > 26) { W.prints.push({ x: p.x + (W.prints.length % 2 ? 5 : -5), y: p.y, d: p.dir }); W.printAt = { x: p.x, y: p.y }; if (W.prints.length > 400) W.prints.shift(); }
    },
    under(c, t, W) { (W.prints || []).forEach(q => { c.fillStyle = 'rgba(96,112,150,0.42)'; c.beginPath(); c.ellipse(q.x, q.y, q.d % 2 ? 7 : 4.6, q.d % 2 ? 4 : 6.4, 0, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(q.x + 1, q.y + 2, q.d % 2 ? 6 : 4, 2, 0, 0, 6.3); c.fill(); }); },
  };
})();
