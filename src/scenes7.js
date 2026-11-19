/* 第二章《扬州慢》的场景：北关码头（matou）；一条运酒的船——白天行船（chuan）、夜泊（chuanye）、雷雨（chuanyu）、夜渡大江（jiang）。
   船在四个场景里是同一条：整条船画成一张大“道具”，垫在所有人脚下；岸在船后头自己往后退（under 里画）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C, Fig = JX.Fig;
  const S = JX.scenes = JX.scenes || {};
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.closePath(); };

  /* 竹篾编的篷：先铺底色，再打斜纹（当前路径就是篷的外形） */
  function weave(g, x, y, w, h, top, bot) {
    g.save(); g.clip();
    g.fillStyle = P.vgrad(g, 0, y, h, [[0, top], [0.5, P.mix(top, bot, 0.5)], [1, bot]]); g.fillRect(x - 40, y - 10, w + 80, h + 20);
    g.lineWidth = 1;
    for (let q = x - h - 60; q < x + w + 60; q += 13) {
      g.strokeStyle = 'rgba(70,48,20,0.2)'; g.beginPath(); g.moveTo(q, y + h + 8); g.lineTo(q + h, y - 4); g.stroke();
      g.strokeStyle = 'rgba(255,240,200,0.12)'; g.beginPath(); g.moveTo(q + h, y + h + 8); g.lineTo(q, y - 4); g.stroke();
    }
    g.restore();
  }
  /* 一条泊着的小船的侧影（码头和远处用）：船身、篷、桅 */
  function sideBoat(g, x, y, w, o) {
    o = o || {}; const hw = w / 2, col = o.col || '#4a3526';
    g.fillStyle = col; g.beginPath(); g.moveTo(x - hw, y - 16); g.quadraticCurveTo(x - hw + 18, y + 4, x - hw + 46, y + 6); g.lineTo(x + hw - 46, y + 6); g.quadraticCurveTo(x + hw - 14, y + 2, x + hw + 6, y - 22); g.lineTo(x + hw - 20, y - 14); g.lineTo(x - hw + 14, y - 12); g.closePath(); g.fill();
    if (o.awn !== false) { g.beginPath(); g.moveTo(x - hw * 0.45, y - 12); g.quadraticCurveTo(x - hw * 0.45, y - 44, x - hw * 0.2, y - 46); g.lineTo(x + hw * 0.25, y - 46); g.quadraticCurveTo(x + hw * 0.48, y - 44, x + hw * 0.48, y - 12); g.closePath(); g.fillStyle = o.awnCol || '#a89060'; g.fill(); g.strokeStyle = 'rgba(40,28,18,0.6)'; g.lineWidth = 1; g.stroke(); }
    if (o.mast) { P.line(g, x + hw * 0.56, y - 12, x + hw * 0.56, y - o.mast, 3, '#3a2a1e'); P.line(g, x + hw * 0.56 - 30, y - o.mast * 0.72, x + hw * 0.56 + 34, y - o.mast * 0.74, 5, '#8a7448'); }
  }

  /* ================= 运酒船 =================
     甲板是一块长条：船尾在左（桨、行灶），中段靠里是竹篷的舱（十九坛酒码在里头），桅在舱前，船头在右。 */
  const DECK = [[226, 634], [300, 600], [1980, 600], [2272, 730], [1980, 900], [300, 900], [226, 866]];
  const CX0 = 640, CX1 = 1320, EAVE = 556, RIDGE = 396, FL = 692, MX = 1420;
  function drawBoat(g, o) {
    /* 水里的影子 */
    g.fillStyle = 'rgba(10,18,24,0.26)'; g.beginPath(); g.ellipse(1240, 998, 1090, 30, 0, 0, 6.3); g.fill();
    /* 近舷的船身：甲板以下那一截；船头翘起来 */
    g.beginPath(); g.moveTo(226, 866); g.lineTo(300, 900); g.lineTo(1980, 900); g.lineTo(2272, 730); g.lineTo(2266, 796); g.quadraticCurveTo(2130, 958, 1940, 988); g.lineTo(330, 988); g.quadraticCurveTo(246, 982, 230, 940); g.closePath();
    g.fillStyle = P.vgrad(g, 0, 880, 110, [[0, '#6a4630'], [0.5, '#4a2f20'], [1, '#1e140e']]); g.fill(); g.strokeStyle = INK(0.9); g.lineWidth = 2; g.stroke();
    for (let k = 0; k < 3; k++) { g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(236, 902 + k * 24); g.lineTo(300, 924 + k * 22); g.lineTo(1950, 924 + k * 22); g.quadraticCurveTo(2130, 906 + k * 16, 2262, 752 + k * 16); g.stroke(); }
    for (let x = 380; x < 1960; x += 150) { P.ellipse(g, x, 914, 2.2, 2.2, 'rgba(20,14,10,0.6)'); P.ellipse(g, x + 70, 958, 2.2, 2.2, 'rgba(20,14,10,0.55)'); }
    g.strokeStyle = 'rgba(220,236,236,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(250, 986); g.lineTo(1940, 990); g.quadraticCurveTo(2110, 966, 2200, 880); g.stroke();
    /* 船尾的挡板 */
    g.fillStyle = '#4a3222'; poly(g, [[226, 634], [226, 866], [212, 872], [212, 628]]); g.fill(); g.strokeStyle = INK(0.85); g.lineWidth = 1.6; g.stroke();
    /* 甲板 */
    g.save(); poly(g, DECK); g.clip();
    P.planks(g, 210, 596, 2080, 312, { seed: 71, base: '#9a7852', pw: 38 });
    g.fillStyle = 'rgba(255,236,200,0.07)'; g.fillRect(210, 596, 2080, 312); P.ao(g, 210, 596, 2080, 46, 'top', 0.32);
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(CX0, 600, CX1 - CX0, FL - 600);                 // 舱里的地：暗一层
    g.restore();
    g.strokeStyle = INK(0.85); g.lineWidth = 2; poly(g, DECK); g.stroke();
    /* 远舷的舷墙，一直包到船头 */
    g.fillStyle = P.vgrad(g, 0, 570, 32, [[0, '#7a5638'], [1, '#4a3222']]); poly(g, [[226, 634], [226, 606], [300, 572], [1980, 572], [2272, 700], [2272, 730], [1980, 600], [300, 600]]); g.fill(); g.strokeStyle = INK(0.85); g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = '#8a6644'; g.lineWidth = 4; g.beginPath(); g.moveTo(226, 606); g.lineTo(300, 572); g.lineTo(1980, 572); g.lineTo(2272, 700); g.stroke();
    for (let x = 340; x < 1980; x += 118) P.line(g, x, 575, x, 600, 2, 'rgba(0,0,0,0.3)');
    /* 近舷：一道厚边 */
    g.strokeStyle = '#6a4630'; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath(); g.moveTo(226, 868); g.lineTo(300, 902); g.lineTo(1980, 902); g.lineTo(2272, 732); g.stroke();
    g.strokeStyle = INK(0.8); g.lineWidth = 1.4; g.beginPath(); g.moveTo(224, 873); g.lineTo(300, 907); g.lineTo(1981, 907); g.lineTo(2275, 736); g.stroke();
    /* 船头柱，缠着缆 */
    P.post(g, 2256, 660, 16, 74, '#5a3c28'); for (let i = 0; i < 4; i++) P.line(g, 2254, 690 + i * 7, 2274, 688 + i * 7, 3, '#c9b48a');
    /* 船尾：桨桩、水缸、一筐菜、柴 */
    P.post(g, 254, 668, 14, 46, '#4a3424'); P.ellipse(g, 261, 668, 9, 4, '#6a4a32', INK(0.8), 1);
    P.jar(g, 398, 626, 0.96, { seed: 61, sealed: false, label: false, glaze: '#5a5248' }); P.ellipse(g, 398, 547, 15, 4.4, '#3a5a66');
    g.fillStyle = '#9a7a44'; g.beginPath(); g.moveTo(436, 592); g.lineTo(484, 592); g.lineTo(478, 624); g.lineTo(442, 624); g.closePath(); g.fill(); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.stroke();
    for (let i = 0; i < 5; i++) P.ellipse(g, 442 + i * 9, 590 - (i % 2) * 3, 6, 5, i % 2 ? '#6f9a5a' : '#8ab06a', INK(0.5), 0.6);
    for (let k = 0; k < 3; k++) for (let i = 0; i < 4 - k; i++) { g.fillStyle = k % 2 ? '#7a5a3a' : '#8a6a44'; g.fillRect(582 + i * 13 + k * 6, 612 - k * 9, 12, 9); g.strokeStyle = INK(0.6); g.lineWidth = 0.8; g.strokeRect(582 + i * 13 + k * 6, 612 - k * 9, 12, 9); }
    /* —— 舱 —— 里头是暗的；深处一面篷壁 */
    g.fillStyle = P.vgrad(g, 0, EAVE - 10, FL - EAVE + 10, [[0, '#1a120e'], [0.55, '#34261c'], [1, 'rgba(60,44,30,0)']]); g.fillRect(CX0, EAVE - 10, CX1 - CX0, 80);
    g.fillStyle = '#2a1e16'; g.fillRect(CX0, EAVE - 10, CX1 - CX0, 56);
    for (let x = CX0 + 30; x < CX1; x += 44) P.line(g, x, EAVE - 8, x, 600, 1, 'rgba(160,130,80,0.18)');
    /* 酒坛：后排十只，前排九只；最右手空着的地方摆那口大瓮（单画，见各场景的人物） */
    if (o && o.xiang) {                                              // 香船：舱里是香客的包袱、香烛箱、几只竹篓
      const r = JX.rng(77), cols = ['#8a6a48', '#6e5a7a', '#5f7a66', '#a8843e', '#7a4a3a'];
      for (let i = 0; i < 9; i++) { const x = 700 + i * 60, y = 646 + (i % 2) * 6; if (i % 3 === 1) { g.fillStyle = '#b89a5a'; g.fillRect(x - 22, y - 44, 44, 44); g.strokeStyle = INK(0.8); g.lineWidth = 1.4; g.strokeRect(x - 22, y - 44, 44, 44); for (let k = 1; k < 5; k++) P.line(g, x - 22, y - 44 + k * 9, x + 22, y - 44 + k * 9, 1, 'rgba(60,40,16,0.4)'); } else { g.fillStyle = cols[i % 5]; g.beginPath(); g.ellipse(x, y - 20, 24, 20 + r() * 4, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(0.8); g.lineWidth = 1.4; g.stroke(); P.line(g, x - 8, y - 38, x + 8, y - 38, 3, '#e6d7b4'); } }
      for (let i = 0; i < 5; i++) { const x = 760 + i * 96; g.fillStyle = '#9a3a2e'; g.fillRect(x - 26, 686 - 34, 52, 34); g.strokeStyle = INK(0.85); g.lineWidth = 1.5; g.strokeRect(x - 26, 686 - 34, 52, 34); g.fillStyle = '#f0d8a0'; g.font = '600 20px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('香', x, 686 - 16); }
    } else {
    for (let i = 0; i < 10; i++) P.jar(g, 690 + i * 56, 642, 0.74, { seed: 100 + i, text: '酒' });
    P.line(g, 664, 598, 1220, 598, 2.2, 'rgba(214,196,150,0.55)');
    for (let i = 0; i < 9; i++) P.jar(g, 718 + i * 56, 686, 0.84, { seed: 120 + i, text: '酒' });
    P.line(g, 688, 634, 1196, 634, 2.4, 'rgba(214,196,150,0.6)');
    }
    /* 檐下挂的：蓑衣、斗笠、一串鱼干、水葫芦 */
    g.fillStyle = '#7a6238'; g.beginPath(); g.moveTo(664, 566); g.lineTo(650, 632); g.lineTo(700, 632); g.lineTo(686, 566); g.closePath(); g.fill(); for (let i = 0; i < 7; i++) P.line(g, 668 + i * 3, 570, 653 + i * 7.5, 632, 1, 'rgba(40,28,12,0.5)');
    for (let i = 0; i < 4; i++) { const y = 574 + i * 15; P.line(g, 1150, 562, 1150, y, 0.8, INK(0.6)); g.fillStyle = i % 2 ? '#b9a88a' : '#a8987a'; g.beginPath(); g.ellipse(1150, y + 4, 4, 8, 0.2, 0, 6.3); g.fill(); g.strokeStyle = INK(0.5); g.lineWidth = 0.6; g.stroke(); }
    P.line(g, 1206, 560, 1206, 574, 1, INK(0.7)); P.ellipse(g, 1206, 582, 6, 7, '#c9a85a', INK(0.8), 1); P.ellipse(g, 1206, 596, 9, 10, '#c9a85a', INK(0.8), 1);
    /* 柱子 */
    [CX0, 866, 1094, CX1].forEach(x => P.post(g, x - 7, EAVE - 4, 14, FL - EAVE + 4, '#9a7a44'));
    /* 篷顶：朝着我们的这一面坡 */
    const roof = () => { g.beginPath(); g.moveTo(CX0 - 28, EAVE + 6); g.quadraticCurveTo(CX0 - 32, 430, CX0 + 14, RIDGE); g.lineTo(CX1 - 14, RIDGE); g.quadraticCurveTo(CX1 + 32, 430, CX1 + 28, EAVE + 6); g.closePath(); };
    roof(); weave(g, CX0 - 28, RIDGE, CX1 - CX0 + 56, EAVE - RIDGE + 6, '#d2ba84', '#86693a');
    g.save(); roof(); g.clip();
    for (let x = CX0 + 22; x < CX1; x += 113) { g.fillStyle = 'rgba(60,40,18,0.3)'; g.fillRect(x - 5, RIDGE, 10, EAVE - RIDGE + 8); g.fillStyle = 'rgba(255,240,200,0.12)'; g.fillRect(x - 5, RIDGE, 2, EAVE - RIDGE + 8); }
    g.fillStyle = 'rgba(150,122,66,0.75)'; g.fillRect(968, 446, 92, 62); g.strokeStyle = 'rgba(60,40,18,0.6)'; g.lineWidth = 1.2; g.setLineDash([5, 4]); g.strokeRect(968, 446, 92, 62); g.setLineDash([]);
    g.fillStyle = P.vgrad(g, 0, RIDGE, 30, [[0, 'rgba(255,244,210,0.3)'], [1, 'rgba(255,244,210,0)']]); g.fillRect(CX0 - 40, RIDGE, CX1 - CX0 + 80, 30);
    g.restore();
    roof(); g.strokeStyle = INK(0.9); g.lineWidth = 2; g.stroke();
    P.line(g, CX0 - 28, EAVE + 4, CX1 + 28, EAVE + 4, 7, '#7a5c30'); P.line(g, CX0 - 28, EAVE + 1, CX1 + 28, EAVE + 1, 2, 'rgba(255,236,190,0.35)');
    /* —— 桅 —— 桅座、桅、落下来捆着的帆、两根缆、酒旗、一只灯 */
    g.fillStyle = '#4a3424'; g.fillRect(MX - 22, 622, 44, 22); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.strokeRect(MX - 22, 622, 44, 22);
    g.fillStyle = P.hgrad(g, MX - 8, 0, 16, [[0, '#3a2a1e'], [0.4, '#7a5a3c'], [1, '#2a1c14']]); g.beginPath(); g.moveTo(MX - 8, 634); g.lineTo(MX - 5, 44); g.lineTo(MX + 5, 44); g.lineTo(MX + 8, 634); g.closePath(); g.fill(); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = INK(0.5); g.lineWidth = 1.4; g.beginPath(); g.moveTo(MX, 50); g.lineTo(2266, 664); g.moveTo(MX, 50); g.lineTo(236, 606); g.stroke();
    g.save(); g.translate(MX, 246); g.rotate(-0.045);
    P.line(g, -262, -25, 282, -25, 5, '#4a3424');
    g.fillStyle = P.vgrad(g, 0, -20, 40, [[0, '#d2bc88'], [0.5, '#a88c56'], [1, '#6e5630']]); g.beginPath(); g.roundRect(-250, -20, 520, 40, 18); g.fill(); g.strokeStyle = INK(0.85); g.lineWidth = 1.6; g.stroke();
    for (let x = -232; x < 262; x += 12) P.line(g, x, -17, x + 5, 17, 0.8, 'rgba(70,48,20,0.25)');
    for (let x = -210; x <= 240; x += 75) P.line(g, x, -22, x + 6, 22, 3.4, '#5a4630');
    g.restore();
    P.line(g, MX, 60, MX + 62, 66, 2.4, '#3a2a1e');
    g.fillStyle = '#b8433a'; poly(g, [[MX + 14, 66], [MX + 58, 68], [MX + 56, 152], [MX + 36, 140], [MX + 14, 152]]); g.fill(); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.stroke(); P.vtext(g, o && o.xiang ? '香' : '酒', MX + 36, 78, 30, '#f6e9c8', '600');
    P.line(g, MX, 330, MX + 48, 338, 3, '#3a2a1e'); P.lantern(g, MX + 48, 374, 15, { cord: 18 });
    /* 船头：两根竹篙靠在舷墙上，一盘缆，一只四爪锚 */
    P.line(g, 1500, 597, 1964, 591, 5, '#b8ae6a'); P.line(g, 1500, 597, 1964, 591, 1.2, 'rgba(60,60,20,0.4)'); P.line(g, 1540, 603, 1930, 599, 5, '#a8a05e');
    for (let i = 0; i < 4; i++) { g.strokeStyle = i % 2 ? '#c9b48a' : '#b8a276'; g.lineWidth = 6; g.beginPath(); g.ellipse(2052, 666 - i * 5, 40 - i * 5, 13 - i * 1.6, 0, 0, 6.3); g.stroke(); g.strokeStyle = INK(0.4); g.lineWidth = 0.8; g.stroke(); }
    g.strokeStyle = '#2a2a30'; g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(2150, 716); g.lineTo(2188, 768); g.stroke(); g.lineWidth = 5;
    [[-26, 4], [22, -10], [-6, 22], [16, 16]].forEach(([dx, dy]) => { g.beginPath(); g.moveTo(2188, 768); g.quadraticCurveTo(2188 + dx * 0.9, 768 + dy * 1.3, 2188 + dx, 768 + dy - 8); g.stroke(); });
    g.lineWidth = 2.4; g.beginPath(); g.arc(2146, 710, 7, 0, 6.3); g.stroke(); g.lineCap = 'butt';
  }
  const boatProp = () => ({ x: 1200, y: 1010, bw: 2380, bh: 986, below: 20, sortY: -1e6, draw(g) { g.translate(-1200, -1010); drawBoat(g); } });
  /* 行灶：泥灶上一口铁锅，旁边一块案板 */
  function drawStove(g) {
    P.shadow(g, 0, 0, 64, 12, 0.4);
    g.fillStyle = P.hgrad(g, -44, 0, 88, [[0, '#5a4638'], [0.4, '#9a7c62'], [1, '#4a382c']]); g.beginPath(); g.moveTo(-38, 0); g.lineTo(-44, -52); g.quadraticCurveTo(0, -62, 44, -52); g.lineTo(38, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
    g.fillStyle = '#140c08'; g.beginPath(); g.moveTo(-14, 0); g.lineTo(-14, -20); g.quadraticCurveTo(0, -30, 14, -20); g.lineTo(14, 0); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,150,60,0.75)'; g.beginPath(); g.ellipse(0, -6, 9, 7, 0, 0, 6.3); g.fill(); g.fillStyle = 'rgba(255,220,140,0.8)'; g.beginPath(); g.ellipse(0, -5, 4.5, 4, 0, 0, 6.3); g.fill();
    g.fillStyle = '#26221f'; g.beginPath(); g.ellipse(0, -56, 42, 11, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke();
    g.fillStyle = P.vgrad(g, 0, -72, 16, [[0, '#b08a5c'], [1, '#7a5a38']]); g.beginPath(); g.ellipse(0, -60, 34, 8, 0, 0, 6.3); g.fill(); g.stroke(); P.ellipse(g, 0, -66, 6, 3.4, '#5a3c24', INK(), 1);
    /* 案板、一把菜刀 */
    g.fillStyle = '#6a4a32'; g.fillRect(52, -40, 6, 40); g.fillRect(88, -40, 6, 40); g.fillStyle = '#b08a5c'; g.beginPath(); g.ellipse(74, -42, 28, 8, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#c8d0d4'; g.fillRect(64, -50, 20, 7); g.strokeRect(64, -50, 20, 7); g.fillStyle = '#4a3424'; g.fillRect(84, -48, 10, 3.4);
  }
  /* 矮几：舱口摆的一张小桌 */
  function drawLowTable(g) { P.table(g, 0, 0, 130, 26, 26, { col: '#6a4a30', seed: 9 }); }

  /* —— 岸：一长条能首尾相接的远岸，under 里每帧往左挪 —— */
  const strips = {};
  function bankStrip(kind) {
    const key = kind + '@' + JX.S; if (strips[key]) return strips[key];
    const W0 = 2400, H0 = 250, cv = document.createElement('canvas'); cv.width = Math.round(W0 * JX.S); cv.height = Math.round(H0 * JX.S);
    const g = cv.getContext('2d'); g.scale(JX.S, JX.S);
    const r = JX.rng(kind === 'rain' ? 909 : 808), rain = kind === 'rain';
    const far = rain ? '#8e9a9c' : '#a9bcae', mid = rain ? '#6f7f7c' : '#86a084', near = rain ? '#586a66' : '#6b8a66', wall = rain ? '#c2c6c2' : '#ece6d6', roofC = rain ? '#3e4444' : '#3a3c3e';
    const each = (x, f) => { [-W0, 0, W0].forEach(dx => { g.save(); g.translate(x + dx, 0); f(); g.restore(); }); };
    /* 远山：很淡的一抹 */
    g.fillStyle = P.rgba(far, 0.55); g.beginPath(); g.moveTo(0, 150);
    for (let x = 0; x <= W0; x += 60) g.lineTo(x, 150 - 26 * (0.5 + 0.5 * Math.sin(x / W0 * Math.PI * 4 + 1)) - 14 * (0.5 + 0.5 * Math.sin(x / W0 * Math.PI * 10)));
    g.lineTo(W0, 200); g.lineTo(0, 200); g.closePath(); g.fill();
    /* 田和堤：一条平平的岸 */
    g.fillStyle = mid; g.fillRect(0, 168, W0, 34); g.fillStyle = near; g.fillRect(0, 186, W0, 16); g.fillStyle = rain ? '#4a5a56' : '#57704e'; g.fillRect(0, 198, W0, 5);
    /* 桑、柳：柳条才冒黄 */
    for (let i = 0; i < 26; i++) {
      const x = r() * W0, willow = r() < 0.55, h = 46 + r() * 34;
      each(x, () => {
        P.line(g, 0, 198, 2, 198 - h * 0.55, 3, rain ? '#3a3e3a' : '#4a3a2a');
        if (willow) { for (let k = 0; k < 9; k++) { const a = -1.3 + k * 0.33, len = h * (0.55 + (k % 3) * 0.12); g.strokeStyle = P.rgba(rain ? '#7a8a6a' : '#b9c46a', 0.55); g.lineWidth = 1.6; g.beginPath(); g.moveTo(2, 198 - h * 0.55); g.quadraticCurveTo(Math.sin(a) * 30, 198 - h * 1.0, Math.sin(a) * 34, 198 - h * 0.55 + len * 0.42); g.stroke(); } g.fillStyle = P.rgba(rain ? '#7a8a6a' : '#c2cc78', 0.28); g.beginPath(); g.ellipse(2, 198 - h * 0.72, 32, h * 0.36, 0, 0, 6.3); g.fill(); }
        else { g.fillStyle = P.rgba(rain ? '#5a6a58' : '#6f8f5a', 0.85); g.beginPath(); g.ellipse(2, 198 - h * 0.62, 20, h * 0.3, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(-10, 198 - h * 0.5, 14, h * 0.2, 0, 0, 6.3); g.fill(); }
      });
    }
    /* 人家：白墙黑瓦，三五成群 */
    [[260, 3], [900, 2], [1500, 4], [2050, 2]].forEach(([x0, n]) => {
      for (let k = 0; k < n; k++) { const w = 56 + r() * 40, h = 30 + r() * 16, x = x0 + k * 62 + r() * 10; each(x, () => { g.fillStyle = wall; g.fillRect(0, 196 - h, w, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(w * 0.4, 196 - h * 0.55, 9, h * 0.55); g.fillStyle = roofC; g.beginPath(); g.moveTo(-8, 196 - h); g.lineTo(w * 0.5, 196 - h - 20); g.lineTo(w + 8, 196 - h); g.closePath(); g.fill(); }); }
    });
    /* 一座石拱桥，跨着一条岔河 */
    each(1200, () => { g.fillStyle = rain ? '#8a908c' : '#b4b0a2'; g.beginPath(); g.moveTo(-90, 200); g.quadraticCurveTo(0, 126, 90, 200); g.closePath(); g.fill(); g.fillStyle = rain ? '#7d8c8a' : '#9db7b4'; g.beginPath(); g.moveTo(-40, 202); g.quadraticCurveTo(0, 152, 40, 202); g.closePath(); g.fill(); g.strokeStyle = 'rgba(40,40,36,0.4)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-90, 200); g.quadraticCurveTo(0, 126, 90, 200); g.stroke(); });
    /* 岸边的芦苇、泊着的小船 */
    for (let i = 0; i < 40; i++) { const x = r() * W0; each(x, () => { for (let k = 0; k < 5; k++) P.line(g, k * 3, 204, k * 3 - 4 + k * 2, 186 - (k % 3) * 5, 1, P.rgba(rain ? '#5a6050' : '#8a8a50', 0.7)); }); }
    [[620, 120], [1760, 150]].forEach(([x, w]) => each(x, () => sideBoat(g, 0, 204, w, { col: rain ? '#34302c' : '#4a3526', awnCol: rain ? '#8a8468' : '#b09a66', mast: 0 })));
    /* 水里的倒影：淡淡的一截 */
    g.save(); g.globalAlpha = 0.22; g.translate(0, 408); g.scale(1, -1); g.drawImage(cv, 0, Math.round(150 * JX.S), cv.width, Math.round(54 * JX.S), 0, 150, W0, 54); g.restore();
    g.fillStyle = P.vgrad(g, 0, 204, 46, [[0, 'rgba(255,255,255,0)'], [1, rain ? 'rgba(125,141,140,0.9)' : 'rgba(157,183,180,0.9)']]); g.fillRect(0, 204, W0, 46);
    return (strips[key] = cv);
  }

  /* 四个场景共用的部分 */
  const BW = 2400, BH = 1080, HORIZON = 432;
  const clipScene = c => { c.beginPath(); c.rect(0, 0, BW, BH); c.clip(); };
  function waterBase(c, top, bot, streak) {
    c.fillStyle = P.vgrad(c, 0, HORIZON, BH - HORIZON, [[0, top], [1, bot]]); c.fillRect(0, HORIZON, BW, BH - HORIZON);
    const r = JX.rng(31); for (let i = 0; i < 240; i++) { const x = r() * BW, y = HORIZON + 6 + r() * (BH - HORIZON - 10); c.strokeStyle = P.rgba(streak, 0.05 + r() * 0.09); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 90, y); c.stroke(); }
  }
  function flow(c, t, v, col, a) {                                   // 水往后流：一道一道的碎光，近处的快
    c.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const y = HORIZON + 24 + ((i * 137.3) % (BH - HORIZON - 30)), k = (y - HORIZON) / (BH - HORIZON), sp = v * (0.5 + k * 1.6), x = BW - ((i * 331.7 + t * sp) % (BW + 200)), tw = 0.5 + 0.5 * Math.sin(t * 0.8 + i);
      c.strokeStyle = P.rgba(col, a * (0.4 + 0.6 * tw)); c.lineWidth = 1.4 + k; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + (i % 5) * 16, y); c.stroke();
    }
  }
  function oar(c, t, swing) {                                         // 船尾那支桨：摇起来一来一回
    const s = swing ? Math.sin(t * 1.9) : 0.2, hx = 356 + s * 16, hy = 628 - s * 4, bx = 66 - s * 26, by = 806 + Math.cos(t * 1.9) * (swing ? 8 : 0);
    c.strokeStyle = INK(0.9); c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(261, 668); c.lineTo(bx, by); c.stroke();
    c.strokeStyle = '#8a6a44'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = '#7a5c3a'; c.lineWidth = 13; c.beginPath(); c.moveTo(bx + 64, by - 46); c.lineTo(bx, by); c.stroke(); c.lineCap = 'butt';
    if (swing) { c.strokeStyle = 'rgba(236,244,244,' + (0.3 + 0.2 * Math.abs(s)) + ')'; c.lineWidth = 1.6; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(bx - 10 - i * 26, by + 8 + i * 4, 16 + i * 10, 4 + i * 2, 0, 0, 6.3); c.stroke(); } }
  }
  function steam(c, t, W) {                                          // 灶上做着饭：锅里冒热气（W.cooking 立着的时候）
    if (!W.cooking) return;
    for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1; c.fillStyle = 'rgba(250,250,246,' + (0.34 * (1 - u)) + ')'; c.beginPath(); c.ellipse(520 + Math.sin(t * 1.3 + i * 2.1) * 14 * u, 600 - u * 120, 12 + u * 22, 9 + u * 14, 0, 0, 6.3); c.fill(); }
  }
  function bowWake(c, t, a) {                                         // 船头劈开的水
    for (let i = 0; i < 4; i++) { const u = (t * 0.6 + i / 4) % 1; c.strokeStyle = 'rgba(236,244,244,' + (a * (1 - u)) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(2262, 800); c.quadraticCurveTo(2180 - u * 120, 930 + u * 30, 1980 - u * 320, 1004 + u * 40); c.stroke(); }
  }
  const PROPS = [boatProp(),
    { x: 520, y: 668, bw: 220, bh: 86, block: [-50, -22, 150, 26], draw: drawStove },
    { x: 930, y: 746, bw: 150, bh: 60, block: [-66, -22, 132, 22], draw: drawLowTable }];
  const base = o => Object.assign({
    w: BW, h: BH, walk: [[250, 640, 1960, 884], [1900, 684, 2110, 826]], blocks: [[CX0, 600, CX1 - CX0, 96], [MX - 22, 622, 44, 20]],
    spawns: { start: { x: 760, y: 800, dir: 3 }, bow: { x: 1700, y: 770, dir: 3 }, stern: { x: 450, y: 780, dir: 3 } },
    exits: [], props: PROPS,
    hots: [{ id: 'zao', x: 520, y: 700, r: 96, up: 120, verb: '下厨' }],
    marks: [{ t: '船尾 · 灶', x: 470, y: 520 }, { t: '舱 · 酒坛', x: 980, y: 360 }, { t: '船头', x: 1900, y: 520 }],
  }, o);

  /* —— 白天行船 —— */
  S.chuan = base({
    name: '运酒船', sub: '运河 · 往北', ambient: '#cfccc6', music: 'xingchuan', outside: '#6f8f90',
    lights: [{ x: 1200, y: 640, r: 2000, c: '#fff6e4', a: 0.55, ey: 0.6 }, { x: 980, y: 660, r: 420, c: '#ffe0b0', a: 0.3, ey: 0.5 }],
    paint(c) {
      c.fillStyle = P.vgrad(c, 0, 0, HORIZON, [[0, '#a9c4d6'], [0.6, '#d6e2e2'], [1, '#eef0e2']]); c.fillRect(0, 0, BW, HORIZON);
      const r = JX.rng(51); for (let i = 0; i < 9; i++) { const x = r() * BW, y = 40 + r() * 150, w = 160 + r() * 240; c.fillStyle = 'rgba(255,255,255,' + (0.25 + r() * 0.25) + ')'; c.beginPath(); c.ellipse(x, y, w, 14 + r() * 12, 0, 0, 6.3); c.fill(); }
      P.glow(c, 1900, 110, 240, '#fff4d8', 0.5);
      waterBase(c, '#a4bdb8', '#6f9090', '#eef6f2');
      P.paper(c, BW, BH, 71, 0.25);
    },
    under(c, t) {
      const st = bankStrip('day'), off = (t * 26) % BW;
      c.save(); clipScene(c);
      c.drawImage(st, -off, 228, BW, 250); c.drawImage(st, BW - off, 228, BW, 250);
      flow(c, t, 60, '#f4faf6', 0.3); bowWake(c, t, 0.4);
      c.restore();
    },
    anim(c, t, W) { oar(c, t, true); steam(c, t, W); },
  });

  /* —— 夜泊 —— 船不走了；月亮，对岸几点渔火 */
  S.chuanye = base({
    name: '运酒船', sub: '夜泊', ambient: '#8a92b6', music: 'yebo', outside: '#070a16',
    lights: [{ x: 1468, y: 640, r: 620, c: '#ffcf96', a: 0.6, ey: 0.75, glow: 44, gx: 1468, gy: 374, gc: '#ffb070', ga: 0.6 }, { x: 1700, y: 560, r: 1500, c: '#c6d2f6', a: 0.42, ey: 0.6 }, { x: 980, y: 650, r: 380, c: '#ffc890', a: 0.3, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(52);
      c.fillStyle = P.vgrad(c, 0, 0, HORIZON, [[0, '#0b1232'], [1, '#2a3c70']]); c.fillRect(0, 0, BW, HORIZON);
      for (let i = 0; i < 150; i++) { c.fillStyle = 'rgba(240,244,255,' + (0.2 + r() * 0.6) + ')'; c.fillRect(r() * BW, r() * 330, 1.6, 1.6); }
      P.ellipse(c, 1960, 130, 40, 40, '#f4efd8'); P.glow(c, 1960, 130, 230, '#f4efd8', 0.36);
      /* 对岸：一道黑黑的堤，几棵树，几点渔火 */
      c.fillStyle = '#121a3a'; c.beginPath(); c.moveTo(0, 396); for (let x = 0; x <= BW; x += 80) c.lineTo(x, 392 - 10 * Math.sin(x / 300) - 6 * Math.sin(x / 97)); c.lineTo(BW, HORIZON + 2); c.lineTo(0, HORIZON + 2); c.closePath(); c.fill();
      for (let i = 0; i < 16; i++) { const x = r() * BW, h = 40 + r() * 40; c.fillStyle = '#0f1632'; c.beginPath(); c.ellipse(x, 392 - h * 0.5, 26 + r() * 16, h * 0.5, 0, 0, 6.3); c.fill(); }
      waterBase(c, '#1c2c56', '#0e1a36', '#aabef0');
      [[330, 420], [520, 426], [1640, 424], [2140, 422]].forEach(([x, y]) => { sideBoat(c, x, y + 8, 110, { col: '#0c1228', awnCol: '#161e3a', mast: 0 }); P.glow(c, x + 20, y - 10, 26, '#ffc478', 0.9); for (let k = 0; k < 5; k++) { c.fillStyle = 'rgba(255,190,110,' + (0.2 - k * 0.035) + ')'; c.fillRect(x + 12 - k, y + 16 + k * 9, 18 + k * 2, 3); } });
      for (let k = 0; k < 16; k++) { c.fillStyle = 'rgba(244,239,216,' + (0.16 - k * 0.008) + ')'; c.fillRect(1930 - k * 5, HORIZON + 8 + k * 16, 60 + k * 10, 4); }      // 月亮落在水里的一溜
      /* 近岸的芦苇（船是靠着这一边泊的） */
      for (let i = 0; i < 70; i++) { const x = r() * BW, y = 1040 + r() * 40; for (let k = 0; k < 4; k++) P.line(c, x + k * 4, y, x + k * 4 - 6 + k * 3, y - 50 - r() * 40, 1.4, 'rgba(18,26,52,0.9)'); }
      P.paper(c, BW, BH, 72, 0.3);
    },
    anim(c, t) {
      oar(c, t, false); c.lineCap = 'round';
      for (let i = 0; i < 30; i++) { const sx = (i * 197.3) % BW, sy = HORIZON + 30 + ((i * 131.7) % 130), a = 0.5 + 0.5 * Math.sin(t * (0.7 + (i % 5) * 0.15) + i); c.strokeStyle = 'rgba(200,214,255,' + (0.12 * a) + ')'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 40 + (i % 4) * 12, sy); c.stroke(); }
    },
  });

  /* —— 雷雨 —— 天压下来，岸是灰的；雨是粒子，雷是一下白（W.flash 记着那一下的时刻） */
  S.chuanyu = base({
    name: '运酒船', sub: '平江府外 · 雨', ambient: '#aeb2b4', music: 'yebo', outside: '#4c5a5c',
    lights: [{ x: 1200, y: 640, r: 2000, c: '#e6eef0', a: 0.4, ey: 0.6 }, { x: 980, y: 650, r: 460, c: '#ffd9a0', a: 0.42, ey: 0.6 }, { x: 520, y: 650, r: 260, c: '#ffb878', a: 0.4 }],
    paint(c) {
      c.fillStyle = P.vgrad(c, 0, 0, HORIZON, [[0, '#59646c'], [0.6, '#8a969a'], [1, '#aab4b4']]); c.fillRect(0, 0, BW, HORIZON);
      const r = JX.rng(53); for (let i = 0; i < 16; i++) { const x = r() * BW, y = 20 + r() * 210, w = 240 + r() * 360; c.fillStyle = 'rgba(60,70,78,' + (0.18 + r() * 0.2) + ')'; c.beginPath(); c.ellipse(x, y, w, 26 + r() * 24, 0, 0, 6.3); c.fill(); }
      waterBase(c, '#7f8f8e', '#56696a', '#e4eeee');
      P.paper(c, BW, BH, 73, 0.25);
    },
    under(c, t, W) {
      const st = bankStrip('rain'), off = (t * 20) % BW;
      c.save(); clipScene(c);
      c.drawImage(st, -off, 228, BW, 250); c.drawImage(st, BW - off, 228, BW, 250);
      c.fillStyle = P.vgrad(c, 0, 250, 200, [[0, 'rgba(170,180,180,0.55)'], [1, 'rgba(170,180,180,0.15)']]); c.fillRect(0, 250, BW, 200);      // 雨雾
      flow(c, t, 46, '#eef6f6', 0.22); bowWake(c, t, 0.3);
      if (W.raining) for (let i = 0; i < 60; i++) { const u = (t * 1.3 + i * 0.137) % 1, x = (i * 397.1 + Math.floor(t * 1.3 + i * 0.137) * 211.3) % BW, y = HORIZON + 20 + ((i * 173.9 + Math.floor(t * 1.3 + i * 0.137) * 97.7) % (BH - HORIZON - 30)); c.strokeStyle = 'rgba(236,244,244,' + (0.3 * (1 - u)) + ')'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y, 4 + u * 16, 1.4 + u * 5, 0, 0, 6.3); c.stroke(); }      // 雨点落在水面上的圈
      c.restore();
    },
    anim(c, t, W) { oar(c, t, true); steam(c, t, W); },
    top(c, t, W) { const d = W.flash ? t - W.flash : 9; if (d >= 0 && d < 0.7) { const a = d < 0.08 ? 0.85 : d < 0.16 ? 0.25 : d < 0.24 ? 0.7 : 0.7 * (1 - (d - 0.24) / 0.46); c.fillStyle = 'rgba(240,246,255,' + Math.max(0, a * 0.6) + ')'; c.fillRect(0, 0, BW, BH); } },
  });

  /* —— 夜渡大江 —— 水宽得看不见岸；江心一座山，山上有塔，塔上一点灯 */
  S.jiang = base({
    name: '大江', sub: '镇江 · 夜渡', ambient: '#8088aa', music: 'anliu', outside: '#05070f',
    lights: [{ x: 1468, y: 640, r: 600, c: '#ffcf96', a: 0.6, ey: 0.75, glow: 44, gx: 1468, gy: 374, gc: '#ffb070', ga: 0.6 }, { x: 1200, y: 600, r: 1900, c: '#b8c6f0', a: 0.42, ey: 0.6 }, { x: 980, y: 650, r: 360, c: '#ffc890', a: 0.26, ey: 0.6 }],
    marks: [{ t: '金山', x: 620, y: 250 }, { t: '对岸 · 瓜洲', x: 2000, y: 392 }, { t: '船尾 · 灶', x: 470, y: 520 }, { t: '船头', x: 1900, y: 520 }],
    paint(c) {
      const r = JX.rng(54);
      c.fillStyle = P.vgrad(c, 0, 0, HORIZON, [[0, '#080d24'], [1, '#232f5a']]); c.fillRect(0, 0, BW, HORIZON);
      for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(240,244,255,' + (0.15 + r() * 0.4) + ')'; c.fillRect(r() * BW, r() * 200, 1.6, 1.6); }
      P.glow(c, 1700, 150, 260, '#dfe6f8', 0.3); P.ellipse(c, 1700, 150, 38, 38, 'rgba(236,236,224,0.75)');      // 云里的月亮
      for (let i = 0; i < 12; i++) { const x = 1200 + r() * 1000, y = 90 + r() * 150, w = 200 + r() * 300; c.fillStyle = 'rgba(20,28,60,' + (0.4 + r() * 0.3) + ')'; c.beginPath(); c.ellipse(x, y, w, 22 + r() * 20, 0, 0, 6.3); c.fill(); }
      /* 金山：江心一座小山，山上有塔，塔上一点灯 */
      c.fillStyle = '#0e1530'; c.beginPath(); c.moveTo(430, HORIZON); c.quadraticCurveTo(520, 330, 620, 306); c.quadraticCurveTo(740, 330, 830, HORIZON); c.closePath(); c.fill();
      for (let k = 0; k < 6; k++) { const w = 26 - k * 3.4, y = 306 - k * 16; c.fillStyle = '#0a1028'; c.fillRect(620 - w / 2 + 2, y - 14, w - 4, 14); c.beginPath(); c.moveTo(620 - w / 2 - 6, y); c.lineTo(620 + w / 2 + 6, y); c.lineTo(620 + w / 2, y - 4); c.lineTo(620 - w / 2, y - 4); c.closePath(); c.fill(); }
      P.line(c, 620, 212, 620, 196, 2, '#0a1028'); P.glow(c, 620, 244, 18, '#ffc478', 0.95); for (let k = 0; k < 5; k++) { c.fillStyle = 'rgba(255,190,110,' + (0.16 - k * 0.028) + ')'; c.fillRect(612 - k, HORIZON + 10 + k * 12, 16 + k * 2, 3); }
      /* 对岸：极远的一线，几点灯 */
      c.fillStyle = '#10183a'; c.fillRect(1500, HORIZON - 7, 900, 9); for (let i = 0; i < 9; i++) P.glow(c, 1700 + r() * 600, HORIZON - 6, 8, '#ffc478', 0.7);
      waterBase(c, '#16234a', '#0a1430', '#9db2ea');
      P.paper(c, BW, BH, 74, 0.3);
    },
    under(c, t) { c.save(); clipScene(c); flow(c, t, 34, '#b8c8f4', 0.22); bowWake(c, t, 0.3); c.restore(); },
    anim(c, t) { oar(c, t, true); },
  });

  /* ================= 北关码头，清晨 =================
     运河从城里出来的头一座码头。远处是城墙和北关门的城楼；河对岸泊着一排船；近处是石板码头，那条运酒船就靠在岸边，搭着跳板。 */
  S.matou = {
    name: '北关码头', sub: '正月二十一 · 清晨', w: 2400, h: 1080, ambient: '#bdbcc6', music: 'shisheng', outside: '#5c6c70',
    walk: [[110, 640, 2300, 900], [1392, 606, 1468, 664]],      // 跳板这一条要往码头里伸一截（叠着）：只是边挨边的话，上下各缩 4，中间留一道 8 个单位的缝，一帧迈不过去，人就上不了船
    spawns: { start: { x: 420, y: 800, dir: 3 } },
    exits: [{ id: 'board', x: 1392, y: 606, w: 76, h: 22, label: '上船', lx: 1430, ly: 560, back: [0, 30] }],
    marks: [{ t: '北关门', x: 420, y: 60 }, { t: '运酒的船', x: 1800, y: 380 }, { t: '跳板', x: 1430, y: 520 }],
    lights: [{ x: 1200, y: 700, r: 1800, c: '#eef0f8', a: 0.8, ey: 0.55 }, { x: 2300, y: 500, r: 1100, c: '#ffe2b8', a: 0.7, ey: 0.6 }],
    paint(c) {
      const r = JX.rng(2101);
      /* 天：东边刚亮 */
      c.fillStyle = P.vgrad(c, 0, 0, 340, [[0, '#a9bccd'], [0.6, '#d9dcd6'], [1, '#f3e2c4']]); c.fillRect(0, 0, 2400, 340);
      P.glow(c, 2250, 300, 420, '#ffe6b8', 0.55);
      for (let i = 0; i < 7; i++) { const x = r() * 2400, y = 40 + r() * 140; c.fillStyle = 'rgba(255,255,255,' + (0.2 + r() * 0.25) + ')'; c.beginPath(); c.ellipse(x, y, 180 + r() * 200, 12 + r() * 12, 0, 0, 6.3); c.fill(); }
      /* 河对岸：塌房的屋顶、柳、桅杆 */
      c.fillStyle = '#93a79c'; c.fillRect(1000, 296, 1400, 44);
      for (let i = 0; i < 9; i++) { const x = 1080 + i * 150 + r() * 40, w = 90 + r() * 50, h = 40 + r() * 20; c.fillStyle = '#e4dccb'; c.fillRect(x, 330 - h, w, h); c.fillStyle = '#4a4c4c'; c.beginPath(); c.moveTo(x - 10, 330 - h); c.lineTo(x + w / 2, 330 - h - 26); c.lineTo(x + w + 10, 330 - h); c.closePath(); c.fill(); }
      for (let i = 0; i < 12; i++) { const x = 1040 + r() * 1340, h = 50 + r() * 30; P.line(c, x, 336, x + 2, 336 - h * 0.5, 3, '#4a3a2a'); c.fillStyle = 'rgba(190,200,110,0.4)'; c.beginPath(); c.ellipse(x + 2, 336 - h * 0.7, 30, h * 0.4, 0, 0, 6.3); c.fill(); }
      /* 城墙和北关门的城楼 */
      P.brick(c, 0, 176, 1010, 164, { seed: 211, base: '#857e72', bh: 18, bw: 54 });
      for (let x = 0; x < 1010; x += 46) { c.fillStyle = '#857e72'; c.fillRect(x, 158, 28, 20); c.strokeStyle = INK(0.5); c.lineWidth = 1; c.strokeRect(x, 158, 28, 20); }
      c.fillStyle = 'rgba(40,36,30,0.25)'; c.fillRect(0, 176, 1010, 10);
      c.fillStyle = '#16100c'; c.beginPath(); c.moveTo(370, 340); c.lineTo(370, 262); c.quadraticCurveTo(420, 214, 470, 262); c.lineTo(470, 340); c.closePath(); c.fill();          // 门洞
      c.fillStyle = '#2a2018'; c.fillRect(350, 222, 140, 22); P.vtext(c, '北', 396, 224, 16, '#d7a544', '600'); P.vtext(c, '关', 428, 224, 16, '#d7a544', '600');
      c.fillStyle = '#0e1216'; c.beginPath(); c.moveTo(760, 340); c.lineTo(760, 290); c.quadraticCurveTo(840, 236, 920, 290); c.lineTo(920, 340); c.closePath(); c.fill();          // 水门：河从这里出城
      c.fillStyle = '#7f9c9c'; c.fillRect(760, 322, 160, 18);
      c.fillStyle = '#6a2a20'; c.fillRect(300, 92, 240, 68); [[300, 0], [376, 0], [452, 0], [528, 0]].forEach(([x]) => P.post(c, x - 6, 92, 12, 68, '#8e2a20'));
      for (let i = 0; i < 3; i++) { c.fillStyle = '#e8d4a8'; c.fillRect(320 + i * 76, 104, 44, 40); c.strokeStyle = 'rgba(90,40,20,0.7)'; c.lineWidth = 1.2; c.strokeRect(320 + i * 76, 104, 44, 40); P.line(c, 342 + i * 76, 104, 342 + i * 76, 144, 1, 'rgba(90,40,20,0.7)'); }
      c.fillStyle = '#3c4042'; c.beginPath(); c.moveTo(250, 100); c.quadraticCurveTo(290, 78, 330, 52); c.lineTo(510, 52); c.quadraticCurveTo(550, 78, 590, 100); c.lineTo(560, 104); c.lineTo(280, 104); c.closePath(); c.fill(); c.strokeStyle = INK(0.9); c.lineWidth = 1.6; c.stroke();
      for (let x = 290; x < 560; x += 18) P.line(c, x, 100, x + (x - 420) * 0.12, 56, 1, 'rgba(0,0,0,0.3)');
      P.line(c, 610, 176, 610, 70, 3, '#3a2a1e'); c.fillStyle = '#b8433a'; poly(c, [[612, 74], [672, 82], [612, 104]]); c.fill();
      /* 运河 */
      c.fillStyle = P.vgrad(c, 0, 338, 270, [[0, '#a9c0bc'], [1, '#7f9c9c']]); c.fillRect(0, 338, 2400, 270);
      for (let i = 0; i < 150; i++) { const x = r() * 2400, y = 344 + r() * 250; c.strokeStyle = 'rgba(240,248,244,' + (0.06 + r() * 0.1) + ')'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 80, y); c.stroke(); }
      [[1120, 372, 130, 90], [1300, 376, 150, 110], [1480, 372, 120, 0], [1660, 378, 160, 120], [2240, 374, 140, 100]].forEach(([x, y, w, m]) => sideBoat(c, x, y, w, { mast: m }));
      sideBoat(c, 520, 470, 230, { col: '#3f2e22', awnCol: '#b09a66', mast: 0 }); c.fillStyle = 'rgba(40,50,50,0.2)'; c.fillRect(410, 478, 220, 6);      // 河心一条过路的柴船
      for (let i = 0; i < 5; i++) { c.fillStyle = '#7a5c3a'; c.fillRect(470 + i * 22, 450, 18, 12); }
      /* —— 那条运酒的船，靠在码头边上：船尾在左，船头在右 —— */
      c.fillStyle = 'rgba(20,30,30,0.3)'; c.fillRect(1230, 596, 1110, 14);
      c.fillStyle = P.vgrad(c, 0, 536, 80, [[0, '#6a4630'], [1, '#2a1c14']]); c.beginPath(); c.moveTo(1226, 540); c.lineTo(2150, 540); c.quadraticCurveTo(2280, 520, 2350, 470); c.lineTo(2330, 560); c.quadraticCurveTo(2260, 610, 2150, 616); c.lineTo(1250, 616); c.closePath(); c.fill(); c.strokeStyle = INK(0.9); c.lineWidth = 2; c.stroke();
      P.line(c, 1226, 548, 2150, 548, 5, '#8a6644'); for (let k = 0; k < 2; k++) P.line(c, 1240, 568 + k * 20, 2180, 568 + k * 20, 1.2, 'rgba(0,0,0,0.3)');
      /* 舱：篷、舱口里的酒坛 */
      c.fillStyle = '#1e1610'; c.fillRect(1540, 470, 480, 72);
      for (let i = 0; i < 8; i++) P.jar(c, 1578 + i * 56, 540, 0.72, { seed: 130 + i, text: '酒' });
      [1540, 1700, 1860, 2020].forEach(x => P.post(c, x - 6, 466, 12, 76, '#9a7a44'));
      c.beginPath(); c.moveTo(1516, 474); c.quadraticCurveTo(1514, 392, 1556, 372); c.lineTo(2004, 372); c.quadraticCurveTo(2046, 392, 2044, 474); c.closePath(); weave(c, 1516, 372, 528, 102, '#d2ba84', '#86693a');
      c.beginPath(); c.moveTo(1516, 474); c.quadraticCurveTo(1514, 392, 1556, 372); c.lineTo(2004, 372); c.quadraticCurveTo(2046, 392, 2044, 474); c.closePath(); c.strokeStyle = INK(0.9); c.lineWidth = 2; c.stroke(); P.line(c, 1516, 472, 2044, 472, 6, '#7a5c30');
      /* 桅、捆着的帆、酒旗 */
      c.fillStyle = P.hgrad(c, 2096, 0, 14, [[0, '#3a2a1e'], [0.4, '#7a5a3c'], [1, '#2a1c14']]); c.fillRect(2096, 60, 13, 482);
      c.save(); c.translate(2102, 226); c.rotate(-0.045); P.line(c, -220, -22, 240, -22, 5, '#4a3424'); c.fillStyle = P.vgrad(c, 0, -18, 36, [[0, '#d2bc88'], [0.5, '#a88c56'], [1, '#6e5630']]); c.beginPath(); c.roundRect(-210, -18, 440, 36, 16); c.fill(); c.strokeStyle = INK(0.85); c.lineWidth = 1.6; c.stroke(); for (let x = -180; x <= 200; x += 70) P.line(c, x, -20, x + 6, 20, 3.2, '#5a4630'); c.restore();
      c.strokeStyle = INK(0.5); c.lineWidth = 1.3; c.beginPath(); c.moveTo(2102, 64); c.lineTo(2346, 474); c.moveTo(2102, 64); c.lineTo(1232, 540); c.stroke();
      P.line(c, 2102, 74, 2160, 80, 2.4, '#3a2a1e'); c.fillStyle = '#b8433a'; poly(c, [[2114, 80], [2156, 82], [2154, 160], [2135, 148], [2114, 160]]); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.2; c.stroke(); P.vtext(c, '酒', 2135, 90, 28, '#f6e9c8', '600');
      /* —— 码头：石板地，临河一道石沿，系缆的石桩 —— */
      P.flagstones(c, 0, 606, 2400, 474, { seed: 212, base: '#9d978b', sh: 60 });
      c.fillStyle = 'rgba(255,236,200,0.08)'; c.fillRect(0, 606, 2400, 474);
      c.fillStyle = P.vgrad(c, 0, 596, 22, [[0, '#b9b2a4'], [1, '#77726a']]); c.fillRect(0, 596, 2400, 20); c.strokeStyle = INK(0.7); c.lineWidth = 1.4; c.strokeRect(-2, 596, 2404, 20); for (let x = 60; x < 2400; x += 130) P.line(c, x, 596, x, 616, 1, 'rgba(0,0,0,0.3)');
      [180, 640, 1100, 1290, 1640, 2000, 2300].forEach(x => { P.shadow(c, x, 626, 16, 5, 0.35); c.fillStyle = P.hgrad(c, x - 10, 0, 20, [[0, '#6c675f'], [0.4, '#a8a296'], [1, '#5c5750']]); c.beginPath(); c.roundRect(x - 10, 586, 20, 40, 5); c.fill(); c.strokeStyle = INK(0.8); c.lineWidth = 1.2; c.stroke(); });
      [[1290, 1262, 548], [1640, 1700, 546], [2300, 2330, 540]].forEach(([x, bx, by]) => { c.strokeStyle = '#c9b48a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 600); c.quadraticCurveTo((x + bx) / 2, 596, bx, by); c.stroke(); c.strokeStyle = INK(0.5); c.lineWidth = 0.8; c.stroke(); });
      /* 跳板：从石沿搭到船帮上 */
      c.fillStyle = '#9a7650'; poly(c, [[1404, 546], [1452, 546], [1470, 632], [1390, 632]]); c.fill(); c.strokeStyle = INK(0.85); c.lineWidth = 1.6; c.stroke(); for (let y = 560; y < 630; y += 16) P.line(c, 1402 - (y - 546) * 0.14, y, 1454 + (y - 546) * 0.2, y, 2.4, '#6a4a30');
      /* 城门那头下来的一段坡道 */
      c.fillStyle = 'rgba(60,54,46,0.25)'; poly(c, [[330, 616], [520, 616], [600, 700], [260, 700]]); c.fill();
      P.ao(c, 0, 606, 2400, 50, 'top', 0.28);
      P.paper(c, 2400, 1080, 42, 0.28);
    },
    props: [
      /* 阿桂那辆空了的板车 */
      { x: 700, y: 760, bw: 250, bh: 100, block: [-96, -22, 200, 26], draw(g) {
        P.shadow(g, 0, 0, 110, 14, 0.4);
        g.fillStyle = '#7a5a3a'; g.fillRect(-92, -52, 170, 12); g.strokeStyle = INK(); g.lineWidth = 1.4; g.strokeRect(-92, -52, 170, 12); P.line(g, 78, -46, 118, -30, 6, '#6a4a30'); P.line(g, -92, -46, -104, -46, 5, '#6a4a30');
        [-52, 40].forEach(x => { g.fillStyle = '#4a3424'; g.beginPath(); g.arc(x, -26, 26, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 2; g.stroke(); g.fillStyle = '#9a7650'; g.beginPath(); g.arc(x, -26, 19, 0, 6.3); g.fill(); for (let k = 0; k < 6; k++) P.line(g, x, -26, x + Math.cos(k * 1.047) * 19, -26 + Math.sin(k * 1.047) * 19, 2, '#4a3424'); P.ellipse(g, x, -26, 4, 4, '#3a2a1e'); });
        for (let i = 0; i < 3; i++) P.line(g, -80 + i * 56, -58, -72 + i * 56, -52, 3, '#c9b48a');      // 捆酒坛剩下的草绳
      } },
      /* 茶棚：一张桌，后头撑着一领布篷，挂个“茶”字 */
      { x: 300, y: 706, bw: 300, bh: 230, block: [-70, -22, 140, 26], draw(g) {
        P.line(g, -120, 0, -120, -206, 6, '#5a4630'); P.line(g, 120, 0, 120, -206, 6, '#5a4630');
        g.fillStyle = P.vgrad(g, 0, -214, 60, [[0, '#8a9aa8'], [1, '#5f7080']]); g.beginPath(); g.moveTo(-140, -210); g.lineTo(140, -210); g.lineTo(150, -160); g.quadraticCurveTo(0, -148, -150, -160); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.6; g.stroke();
        g.fillStyle = '#e9ddc4'; g.fillRect(96, -156, 34, 50); g.strokeRect(96, -156, 34, 50); P.vtext(g, '茶', 113, -150, 28, '#2b221c', '600');
        P.table(g, 0, 0, 130, 30, 40, { col: '#6a4a30', seed: 4 });
        g.fillStyle = '#8a6a52'; g.beginPath(); g.ellipse(-10, -78, 13, 10, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke(); P.line(g, 2, -80, 14, -86, 3, '#8a6a52'); P.ellipse(g, 26, -72, 6, 3.4, '#d8ece0', INK(), 1); P.ellipse(g, -36, -72, 6, 3.4, '#d8ece0', INK(), 1);
      } },
      /* 一垛麻包、几只竹篓、别家的货 */
      { x: 1010, y: 690, bw: 220, bh: 130, block: [-96, -22, 192, 26], draw(g) {
        P.shadow(g, 0, 0, 104, 14, 0.4); const sack = (x, y, k) => { g.fillStyle = P.hgrad(g, x - 34, 0, 68, [[0, '#8a7a5c'], [0.4, '#c2b08a'], [1, '#7a6a4c']]); g.beginPath(); g.roundRect(x - 34, y - 30, 68, 30, 11); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.3; g.stroke(); P.line(g, x - 20 + k * 3, y - 28, x - 16 + k * 3, y - 2, 0.8, 'rgba(60,40,20,0.4)'); };
        sack(-58, 0, 0); sack(8, 0, 2); sack(70, 0, 1); sack(-26, -28, 1); sack(40, -28, 0); sack(6, -56, 2);
      } },
      { x: 1900, y: 700, bw: 200, bh: 110, block: [-86, -22, 172, 26], draw(g) {
        P.shadow(g, 0, 0, 92, 13, 0.4);
        [-56, 2, 58].forEach((x, i) => { g.fillStyle = P.hgrad(g, x - 26, 0, 52, [[0, '#7a6234'], [0.4, '#c2a85e'], [1, '#6a5430']]); g.beginPath(); g.moveTo(x - 22, 0); g.lineTo(x - 27, -56); g.lineTo(x + 27, -56); g.lineTo(x + 22, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.3; g.stroke(); for (let k = 1; k < 5; k++) P.line(g, x - 26 + k * 0.6, -56 + k * 11, x + 26 - k * 0.6, -56 + k * 11, 0.8, 'rgba(60,40,10,0.35)'); P.ellipse(g, x, -56, 27, 6, i === 1 ? '#8ab06a' : '#d9c8a0', INK(), 1.1); });
      } },
      /* 近处（走不到的地方）：一排等着装船的货、一杆灯、一只系船的石墩 */
      { x: 420, y: 1052, bw: 420, bh: 150, draw(g) {
        P.shadow(g, 0, 0, 200, 16, 0.4);
        for (let i = 0; i < 5; i++) P.jar(g, -160 + i * 78, 0, 1.2, { seed: 50 + i, glaze: '#4a3a2e', text: i % 2 ? '醋' : '酱' });
        for (let i = 0; i < 4; i++) P.jar(g, -120 + i * 78, -70, 1.08, { seed: 56 + i, glaze: '#4a3a2e', text: i % 2 ? '酱' : '醋' });
      } },
      { x: 1180, y: 1060, bw: 360, bh: 170, draw(g) {
        P.shadow(g, 0, 0, 170, 16, 0.4);
        const bale = (x, y) => { g.fillStyle = P.hgrad(g, x - 62, 0, 124, [[0, '#7c7460'], [0.4, '#c9c0a4'], [1, '#6e6654']]); g.beginPath(); g.roundRect(x - 62, y - 56, 124, 56, 9); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke(); P.line(g, x - 22, y - 56, x - 22, y, 3, '#8a6a3a'); P.line(g, x + 22, y - 56, x + 22, y, 3, '#8a6a3a'); };
        bale(-100, 0); bale(34, 0); bale(-34, -56); bale(110, -14);
      } },
      { x: 1760, y: 1056, bw: 80, bh: 330, draw(g) {
        P.shadow(g, 0, 0, 26, 8, 0.4); P.post(g, -6, -300, 12, 300, '#5a4030'); P.line(g, 0, -292, 34, -286, 3.4, '#3a2a1e'); P.lantern(g, 34, -248, 16, { cord: 20, col: '#c9b48a' });
      } },
      { x: 2180, y: 780, bw: 190, bh: 120, block: [-80, -22, 160, 26], draw(g) { P.shadow(g, 0, 0, 86, 13, 0.4); for (let i = 0; i < 3; i++) P.jar(g, -50 + i * 50, 0, 0.8, { seed: 40 + i, glaze: '#5a4a3a', label: false }); P.jar(g, -24, -52, 0.74, { seed: 44, glaze: '#5a4a3a', label: false }); } },
    ],
    anim(c, t) {                                                     // 河面的碎光
      c.lineCap = 'round';
      for (let i = 0; i < 26; i++) { const sx = (i * 197.3) % 2400, sy = 400 + ((i * 131.7) % 180), a = 0.5 + 0.5 * Math.sin(t * (0.7 + (i % 5) * 0.15) + i); if (sy > 520 && sx > 1220) continue; c.strokeStyle = 'rgba(250,252,246,' + (0.22 * a) + ')'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 40 + (i % 4) * 12, sy); c.stroke(); }
    },
  };
  JX.scenes7 = { drawBoat, sideBoat };
})();
