/* 重点配角的肖像：立绘与对话头像。画法同主角——脸用 portraits.js，身体用 portraits2.js 的那一套。
   这里另外备了几样老人和男人要用的东西：皱纹、胡须，以及常用的手臂姿势和小道具。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, Art = JX.Art, CH = Art.chars;
  const { shape, stroke, lg, rg, soft, hairFill, strands, folds, bead, bust, crossCollar, P2, INK, HAIR } = Art.tools;
  const { fab, tube, hand, shadow, pattern, cuff, longRobe, boots, OUT } = Art.body;
  const WHITE = '#d8d4cc', GREY = '#9a9690';
  Object.assign(Art.MOOD, {                                       // 几种“平常的样子”，给 rest 用
    drowsy: { lid: 0.3, curL: 0.3, curR: 2.0, browOut: 1 }, polite: { cur: 1.5, eyeH: 0.86, lid: 0.1 },
    stern: { browIn: 2.4, cur: -1.2, lid: 0.08 }, weary: { browIn: -1.6, browOut: 1.4, lid: 0.16, cur: -0.6 }, bright: { eyeH: 1.06, cur: 1.2 },
  });

  /* ---------- 脸上的年纪 ---------- */
  function age(c, g, k, o) {
    o = o || {}; const fx = g.fx, col = a => P.rgba('#6a3a26', a * k), nx = fx * 1.55, mx = fx * 1.25;
    [[-31, 0.5], [-25, 0.42], [-19, 0.3]].slice(0, o.fore == null ? 3 : o.fore).forEach(([y, a], i) => stroke(c, `M ${fx - 24 + i * 3} ${y + 1} C ${fx - 8} ${y - 2.5}, ${fx + 8} ${y - 2.5}, ${fx + 24 - i * 3} ${y + 1}`, col(a), 1.2));
    [-1, 1].forEach(s => {
      const far = s === g.sg, ww = far ? 0.78 : 1, ex = fx + s * (far ? 23 * (1 - 0.2 * g.a) : 23);
      stroke(c, `M ${ex + s * 13 * ww} -1 l ${s * 6 * ww} -2.6 M ${ex + s * 13 * ww} 1.6 l ${s * 6.4 * ww} 0.6 M ${ex + s * 12.4 * ww} 4 l ${s * 5.4 * ww} 3`, col(0.55), 1);     // 鱼尾纹
      stroke(c, `M ${ex - s * 9} 9.5 C ${ex - s * 3} 13.5, ${ex + s * 5} 13, ${ex + s * 10 * ww} 8.6`, col(0.5), 1.1);                                              // 眼袋
      stroke(c, `M ${nx + s * 9} 30 C ${nx + s * 15} 37, ${mx + s * 17 * ww} 44, ${mx + s * 16 * ww} ${53 * g.len}`, col(0.62), 1.2);                               // 法令纹
      if (o.hollow) soft(c, fx + s * 30 * ww, 36, 10, 16, '#7a4630', 0.16 * k);
    });
  }
  /* 胡须：stub 胡茬的深浅；mus 髭（1 短，2 长而下垂）；goat 颔下须的长度；jaw 络腮 */
  function whiskers(c, g, o) {
    const mx = g.fx * 1.25, my = 49 * g.len, cx = g.cx, cy = 76 * g.len, col = o.col, dk = P.rgba(P.dark(col, 0.5), 0.8);
    if (o.stub) { soft(c, mx, my + 8, 30, 22, o.stubCol || '#3a2e28', o.stub); soft(c, mx - 26, my - 2, 14, 18, o.stubCol || '#3a2e28', o.stub * 0.7); soft(c, mx + 26, my - 2, 14, 18, o.stubCol || '#3a2e28', o.stub * 0.7); }
    if (o.goat) {
      const w = o.goatW || 10, y1 = cy + o.goat, sw = o.sway || 0;
      shape(c, `M ${mx - w} ${my + 9} C ${mx - w - 4} ${cy - 2}, ${cx - w * 0.75} ${y1 - 16}, ${cx + sw} ${y1} C ${cx + w * 0.75} ${y1 - 16}, ${mx + w + 4} ${cy - 2}, ${mx + w} ${my + 9} C ${mx + w * 0.4} ${my + 12.5}, ${mx - w * 0.4} ${my + 12.5}, ${mx - w} ${my + 9} Z`, lg(c, 0, my, 0, y1, [[0, P.dark(col, 0.08)], [1, P.light(col, 0.12)]]), dk, 1.2);
      for (let i = -2; i <= 2; i++) stroke(c, `M ${mx + i * w * 0.36} ${my + 14} C ${mx + i * w * 0.42} ${cy}, ${cx + i * w * 0.26} ${y1 - 22}, ${cx + i * 1.4 + sw} ${y1 - 7}`, P.rgba(P.dark(col, 0.55), 0.4), 0.9);
    }
    if (o.mus) {
      const len = o.mus === 2 ? 21 : 13.5, drop = o.mus === 2 ? 16 : 4.5, th = o.musTh || 3.4;
      [-1, 1].forEach(s => { const k = s === g.sg ? 1 - 0.2 * g.a : 1; shape(c, `M ${mx} ${my - 6} C ${mx + s * 6 * k} ${my - 8.5}, ${mx + s * (len - 3) * k} ${my - 5}, ${mx + s * len * k} ${my - 2 + drop} C ${mx + s * (len - 5) * k} ${my - 1.5 + drop * 0.35}, ${mx + s * 6 * k} ${my - 3.8 + th * 0.2}, ${mx} ${my - 6 + th} Z`, col, dk, 1); });
    }
  }

  /* ---------- 身体上常用的几样 ---------- */
  function toes(c, col) { shape(c, 'M -70 1008 C -86 1020, -88 1040, -72 1044 L -22 1044 L -22 1008 Z', col, OUT, 1.8); shape(c, 'M 24 1008 L 24 1044 L 76 1044 C 92 1040, 90 1020, 74 1008 Z', col, OUT, 1.8); stroke(c, 'M -78 1039 L -22 1039 M 24 1039 L 82 1039', 'rgba(230,220,200,0.55)', 2); }
  function shoes(c, col) { shape(c, 'M -64 990 C -76 1010, -90 1030, -74 1042 L -22 1042 C -18 1022, -24 1002, -30 990 Z', col, OUT, 1.8); shape(c, 'M 48 990 C 44 1006, 46 1032, 54 1042 L 106 1042 C 112 1028, 96 1006, 82 990 Z', col, OUT, 1.8); stroke(c, 'M -76 1036 L -22 1036 M 54 1036 L 106 1036', '#d9d2c0', 2.2); }
  function trousers(c, col, wrap) {
    shape(c, 'M -78 470 C -88 620, -84 760, -72 832 L -26 832 C -20 700, -12 580, -4 480 Z', fab(c, col, -90, 0), OUT, 2);
    shape(c, 'M 4 480 C 12 600, 28 720, 42 832 L 88 828 C 86 700, 84 580, 78 470 Z', fab(c, col, 0, 92), OUT, 2);
    [[-72, -26, -62, -32], [42, 88, 50, 80]].forEach(([x0, x1, x2, x3]) => {
      const p = shape(c, `M ${x0} 832 L ${x1} 830 L ${x3} 992 L ${x2} 992 Z`, wrap || P.dark(col, 0.12), OUT, 1.8);
      if (wrap) pattern(c, p, () => { for (let y = 836; y < 1000; y += 20) stroke(c, `M ${x0 - 6} ${y + 14} L ${x1 + 6} ${y}`, 'rgba(30,26,22,0.5)', 1.3); });
    });
  }
  function jacket(c, col) { return shape(c, 'M -24 92 C -60 98, -108 108, -118 150 C -116 240, -92 300, -84 345 C -90 420, -98 490, -102 548 Q 0 576, 104 548 C 100 490, 92 420, 86 345 C 94 300, 118 240, 120 150 C 110 108, 60 98, 24 92 Z', fab(c, col, -120, 122), OUT, 2.2); }
  function upper(c, col, o) {                                     // 两条上臂的袖管，要在身子之前画
    o = o || {}; const L = o.l || [[-156, 226], [-134, 300]], R = o.r || [[160, 222], [152, 298]], w = o.w || [26, 28, 30];
    tube(c, [-96, 132], L[0], L[1], w[0], w[1], w[2], fab(c, col, -186, -100)); tube(c, [98, 132], R[0], R[1], w[0], w[1], w[2], fab(c, col, 100, 192));
  }
  function frontEdge(c, hem) { stroke(c, 'M -58 244 C -62 290, -60 320, -56 348', OUT, 1.6); stroke(c, `M -52 372 C -44 600, -40 820, -38 ${hem + 14}`, OUT, 1.6); }
  function robeFolds(c, hem, a) { folds(c, [`M -40 380 C -50 600, -62 800, -66 ${hem - 6}`, `M 10 380 C 12 600, 18 800, 20 ${hem + 10}`, `M 50 380 C 62 600, 76 800, 82 ${hem}`, 'M -92 170 C -84 230, -80 280, -80 330', 'M 94 170 C 86 230, 82 280, 82 330'], a || 0.26); }
  function sash(c, col, y) { shape(c, `M -80 ${y} Q 0 ${y + 18}, 82 ${y} L 82 ${y + 28} Q 0 ${y + 46}, -80 ${y + 28} Z`, col, OUT, 1.8); }
  /* 右臂抬到胸前，手里握着东西（握的东西由 hold 画）*/
  function raiseR(c, col, skin, cuffCol, hold) {
    shape(c, 'M -150 286 C -152 344, -118 386, -84 362 C -74 326, -70 284, -60 248 L -96 232 Z', fab(c, P.dark(col, 0.12), -150, -60), OUT, 2);
    tube(c, [-126, 300], [-104, 290], [-72, 244], 26, 24, 19, fab(c, col, -140, -60));
    if (cuffCol) cuff(c, -70, 242, -0.6, 19, cuffCol);
    if (hold) hold();
    hand(c, -62, 232, 2.9, 1.2, skin, 'fist');
  }
  /* 垂着的手臂：大袖，只露出半只手 */
  function hang(c, s, col, skin, w) {
    hand(c, s * 150, 440, s * 0.05, 1.2, skin, 'rest', s > 0);
    tube(c, [s * 152, 296], [s * 160, 378], [s * 150, 452], 23.9, 30, w || 33, fab(c, col, s > 0 ? 108 : -196, s > 0 ? 196 : -108));
  }
  /* 左手叉在腰间 */
  function hipL(c, col, skin, cuffCol) { tube(c, [146, 298], [128, 340], [84, 346], 26, 23, 19, fab(c, col, 70, 170)); if (cuffCol) cuff(c, 84, 346, 1.5, 19, cuffCol); hand(c, 76, 344, 1.75, 1.2, skin, 'fist', true); }
  /* 左手在身前握着东西 */
  function holdL(c, col, skin, x, y, ang) { tube(c, [150, 298], [(150 + x) / 2 + 20, (298 + y) / 2 + 30], [x + 12, y + 2], 26, 23, 19, fab(c, col, x - 10, 180)); hand(c, x, y, ang == null ? 1.7 : ang, 1.2, skin, 'fist', true); }
  function cup(c) { shape(c, 'M -70 196 L -38 196 C -38 216, -46 224, -54 224 C -62 224, -70 216, -70 196 Z', lg(c, -70, 0, -38, 0, [[0, '#8fae9a'], [0.4, '#d2e6d6'], [1, '#7c9a88']]), OUT, 1.5); shape(c, 'M -70 196 a 16 4.4 0 1 0 32 0 a 16 4.4 0 1 0 -32 0', '#c9a060', OUT, 1.2); }
  function gourd(c, x, y, k) {
    c.save(); c.translate(x, y); c.scale(k || 1, k || 1);
    stroke(c, 'M 0 -18 C -6 -8, 6 -2, 0 8', '#8e2a20', 2.6);
    shape(c, 'M -6 8 L 6 8 L 7 16 C 24 22, 24 50, 12 56 C 40 66, 44 116, 0 122 C -44 116, -40 66, -12 56 C -24 50, -24 22, -7 16 Z', rg(c, -8, 56, 4, 70, [[0, '#e8c068'], [0.6, '#c08a30'], [1, '#7a5216']]), OUT, 1.8);
    stroke(c, 'M -12 57 C -4 61, 4 61, 12 57', '#8e2a20', 3.6); shape(c, 'M -5 -1 h 10 v 10 h -10 Z', '#6a3a1e', OUT, 1.2); soft(c, -12, 84, 8, 18, '#ffffff', 0.32);
    c.restore();
  }
  function book(c, x, y, r, cover, seal) {
    c.save(); c.translate(x, y); c.rotate(r || 0);
    shape(c, 'M -30 -52 h 60 v 104 h -60 Z', cover || '#3d5468', OUT, 1.6); shape(c, 'M 30 -50 l 6 3 v 98 l -6 3 Z', '#e6dcc2', P.rgba(INK, 0.6), 1);
    for (let i = 0; i < 4; i++) stroke(c, `M -30 ${-36 + i * 24} h 9`, '#efe6cf', 1.6);
    shape(c, 'M -14 -42 h 17 v 58 h -17 Z', '#efe6cf', P.rgba(INK, 0.6), 1);
    if (seal) shape(c, 'M 9 22 h 15 v 15 h -15 Z', '#c8362e'); else stroke(c, 'M -5.5 -34 v 40', 'rgba(142,42,32,0.75)', 4);
    c.restore();
  }
  function abacus(c, x, y, r, k) {
    c.save(); c.translate(x, y); c.rotate(r); c.scale(k || 1, k || 1);
    shape(c, 'M -70 -34 h 140 v 68 h -140 Z', '#5a3a22', OUT, 1.8); shape(c, 'M -63 -27 h 126 v 54 h -126 Z', '#2a1c12'); stroke(c, 'M -63 -9 h 126', '#7a5230', 4);
    for (let i = 0; i < 9; i++) { const bx = -56 + i * 14; stroke(c, `M ${bx} -27 v 54`, '#b89a6a', 1.2); [-19, 1, 10, 19].forEach((by, j) => { c.fillStyle = j === 0 ? '#a8362a' : '#c9a24a'; c.beginPath(); c.ellipse(bx, by + ((i * 3 + j) % 4 === 0 ? -2 : 0), 5.4, 3.7, 0, 0, 6.3); c.fill(); }); }
    c.restore();
  }
  function cricket(c, x, y, k, col) {
    c.save(); c.translate(x, y); c.rotate(-0.5); c.scale(k, k); c.fillStyle = col;
    c.beginPath(); c.ellipse(0, 0, 11, 5, 0, 0, 6.3); c.fill(); c.beginPath(); c.arc(12, -1, 4.4, 0, 6.3); c.fill();
    stroke(c, 'M 14 -4 C 22 -14, 30 -16, 36 -12 M 15 -2 C 24 -8, 32 -6, 38 0', col, 1); stroke(c, 'M -4 2 L -14 -10 L -22 6 M 2 3 l -3 9 M 7 3 l 2 8 M -8 3 l -6 8', col, 1.7);
    c.restore();
  }
  const manBack = 'M -53 -18 C -64 -112, 64 -112, 53 -18 C 55 0, 52 16, 47 26 C 30 -8, -30 -8, -47 26 C -52 16, -55 0, -53 -18 Z';
  const capFront = 'M -52 -26 C -60 -106, 60 -106, 52 -26 C 48 -42, 30 -51, 0 -51 C -30 -51, -48 -42, -52 -26 Z';
  function sideburns(c, col, len) { const y = len || 14; hairFill(c, `M -50 -26 C -52 -10, -50 ${y - 8}, -46 ${y} C -45 0, -44 -12, -43 -27 Z`, col); hairFill(c, `M 50 -26 C 52 -10, 50 ${y - 8}, 46 ${y} C 45 0, 44 -12, 43 -27 Z`, col); }
  const BLACK = c => lg(c, 0, -150, 0, -26, [[0, '#2e2824'], [1, '#120e0c']]);

  /* ================= 范醉翁 ================= */
  CH.fan = {
    name: '范醉翁', title: '在醉春楼赊了三年账的老酒客', season: '醉', support: true, up: 11, line: '今晚这楼里有三样东西不对：一壶酒，一个人，一首词。',
    f: { skin: '#e3b792', shade: '#b47a58', turn: 0.24, jaw: 0.8, chin: 12, long: 1.04, blush: 0.4, rest: 'drowsy', neckW: 15,
      eye: { w: 22, h: 7.6, tilt: 0, col: '#4a3020' }, brow: { th: 4.4, arch: 0.3, out: 1.6, col: '#aaa69e' }, mouth: { w: 22, full: 0.7, col: '#a8685a' },
      mark(c, g) { age(c, g, 1, { hollow: true }); soft(c, g.fx * 1.55, 27, 9, 8, '#d8503c', 0.36); whiskers(c, g, { col: '#d2cdc3', stub: 0.12, stubCol: '#8a857c', mus: 2, goat: 26, goatW: 9, sway: -5 }); } },
    hairBack(c) {
      hairFill(c, 'M -53 -18 C -64 -112, 64 -112, 53 -18 C 57 8, 56 30, 52 46 C 36 -2, -36 -2, -52 46 C -56 30, -57 8, -53 -18 Z', WHITE);
      hairFill(c, 'M -14 -90 C -34 -118, 2 -140, 24 -120 C 32 -106, 24 -92, 10 -88 Z', WHITE);                       // 歪在一边的髻
      strands(c, ['M -8 -98 C -14 -114, 6 -126, 18 -114', 'M 2 -94 C 4 -106, 14 -112, 22 -104'], 'rgba(110,104,96,0.5)', 1.1);
      stroke(c, 'M -34 -124 L 42 -98', '#3a2416', 5.4); stroke(c, 'M -34 -124 L 42 -98', '#8a5a30', 3.4);             // 一根筷子当簪
      c.strokeStyle = '#cfcac0'; c.lineCap = 'round'; [['M 52 -30 C 66 -22, 72 -4, 68 14', 1.8], ['M -52 -34 C -64 -28, -70 -12, -68 4', 1.6], ['M 30 -110 C 44 -116, 54 -110, 58 -100', 1.4]].forEach(s => { c.lineWidth = s[1]; c.stroke(P2(s[0])); });
    },
    hairFront(c) {
      hairFill(c, 'M -51 -20 C -58 -104, 58 -104, 51 -20 C 48 -44, 38 -62, 14 -68 C 6 -70, 2 -66, 0 -62 C -8 -70, -30 -68, -42 -54 C -47 -46, -50 -32, -51 -20 Z', WHITE);
      sideburns(c, WHITE, 22);
      strands(c, ['M -30 -78 C -10 -88, 14 -88, 34 -76', 'M -40 -64 C -20 -76, 20 -76, 42 -62'], 'rgba(110,104,96,0.45)', 1);
      c.strokeStyle = '#d2cdc3'; c.lineCap = 'round'; [['M -22 -64 C -28 -52, -31 -40, -29 -27', 1.6], ['M 24 -66 C 32 -56, 36 -44, 35 -32', 1.5], ['M 6 -66 C 10 -58, 11 -50, 9 -43', 1.1]].forEach(s => { c.lineWidth = s[1]; c.stroke(P2(s[0])); });
    },
    bust(c) {
      bust(c, { w: 116, col: '#7a7362' });
      folds(c, ['M -90 150 C -80 190, -76 230, -80 300', 'M 88 150 C 78 190, 76 230, 80 300']);
      crossCollar(c, { trim: '#4b4638', inner: '#d8cdb4', drop: 74 });
      c.save(); c.translate(58, 206); c.rotate(0.12); shape(c, 'M 0 0 h 40 v 44 h -40 Z', '#8c8470', P.rgba(INK, 0.55), 1.2); for (let i = 0; i < 4; i++) stroke(c, `M ${5 + i * 10} -3 v 6 M ${5 + i * 10} 41 v 6`, 'rgba(40,30,20,0.5)', 1); c.restore();
    },
    full(c) {
      const skin = this.f.skin, R = '#7a7362';
      shadow(c, 1046, 150); toes(c, '#3a322a');
      upper(c, R);
      longRobe(c, R, 990, 114); robeFolds(c, 990); frontEdge(c, 990);
      [[24, 640, 0.1], [-88, 820, -0.14]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); c.rotate(r); shape(c, 'M 0 0 h 46 v 50 h -46 Z', '#8c8470', P.rgba(INK, 0.55), 1.2); for (let i = 0; i < 5; i++) stroke(c, `M ${4 + i * 9} -3 v 6 M ${4 + i * 9} 47 v 6`, 'rgba(40,30,20,0.5)', 1); c.restore(); });
      stroke(c, 'M -112 982 Q 0 1014, 116 982', 'rgba(60,54,44,0.5)', 5);
      crossCollar(c, { trim: '#4b4638', inner: '#d8cdb4', drop: 74 });
      stroke(c, 'M -80 350 Q 0 368, 82 350', '#4a3a26', 10); stroke(c, 'M -80 348 Q 0 366, 82 348', 'rgba(230,210,170,0.3)', 2);
      stroke(c, 'M -30 358 C -34 400, -26 430, -32 470 M -22 360 C -22 400, -14 430, -18 462', '#4a3a26', 4);
      gourd(c, 58, 372, 1.05);
      hang(c, 1, R, skin);
      raiseR(c, R, skin, null, () => cup(c));
    },
  };

  /* ================= 贺元度 ================= */
  CH.he = {
    name: '贺元度', title: '半闲堂第一谋士', season: '帖', support: true, up: 10, line: '姑娘唱稼轩，比唱别人的都好。像是自家的东西。',
    f: { skin: '#f0dac2', shade: '#c9a184', turn: -0.22, jaw: 0.8, chin: 11, long: 1.06, blush: 0.03, rest: 'polite', neckW: 15, gaze: -0.3,
      eye: { w: 24, h: 7.2, tilt: 0.3, col: '#2e2018', lid: 0.1 }, brow: { th: 2.8, arch: 0.5, out: -1 }, mouth: { w: 20, full: 0.66, col: '#b06a5e' },
      mark(c, g) { age(c, g, 0.45, { fore: 1 }); whiskers(c, g, { col: '#1c1512', mus: 1, musTh: 2.6, goat: 13, goatW: 6 }); } },
    hairBack(c) {
      shape(c, 'M -40 -50 L -37 -152 C -37 -160, 37 -160, 37 -152 L 40 -50 Z', BLACK(c), P.rgba('#000', 0.85), 1.6);                 // 高装巾子的里层
      hairFill(c, 'M -53 -18 C -60 -80, 60 -80, 53 -18 C 55 0, 52 14, 47 24 C 30 -8, -30 -8, -47 24 C -52 14, -55 0, -53 -18 Z');
    },
    hairFront(c) {
      shape(c, 'M -8 -50 L -7 -140 L 7 -140 L 8 -50 Z', '#0d0a08');
      shape(c, 'M -52 -28 C -56 -60, -50 -100, -47 -128 L -4 -138 L -3 -53 C -26 -52, -46 -44, -52 -28 Z', BLACK(c), P.rgba('#000', 0.85), 1.6);       // 外层两片，中间留一道缝
      shape(c, 'M 52 -28 C 56 -60, 50 -100, 47 -128 L 4 -138 L 3 -53 C 26 -52, 46 -44, 52 -28 Z', BLACK(c), P.rgba('#000', 0.85), 1.6);
      stroke(c, 'M -44 -122 L -6 -131 M 44 -122 L 6 -131', 'rgba(255,255,255,0.13)', 1.2); stroke(c, 'M -46 -42 C -30 -50, -12 -52, -4 -52 M 46 -42 C 30 -50, 12 -52, 4 -52', 'rgba(255,255,255,0.12)', 1.2);
      sideburns(c, HAIR, 10);
    },
    bust(c) {
      const p = bust(c, { w: 118, col: '#473c5a' });
      c.save(); c.clip(p); c.strokeStyle = 'rgba(196,176,226,0.14)'; c.lineWidth = 1.4; for (let y = 140; y < 420; y += 44) for (let x = -130 + ((y / 44) % 2) * 22; x < 140; x += 44) c.strokeRect(x - 7, y - 7, 14, 14); c.restore();
      folds(c, ['M -92 150 C -82 190, -78 230, -82 300', 'M 90 150 C 80 190, 78 230, 82 300']);
      crossCollar(c, { trim: '#221c2e', inner: '#f2ecde', tw: 14, edge: 'rgba(200,180,230,0.3)' });
    },
    full(c) {
      const skin = this.f.skin, R = '#473c5a', TR = '#221c2e';
      shadow(c, 1046, 150); toes(c, '#191513');
      shape(c, 'M -152 292 C -166 380, -146 448, -110 458 C -98 420, -94 360, -100 312 Z', fab(c, P.dark(R, 0.14), -166, -94), OUT, 2);      // 右手背在身后，只见垂下来的大袖
      upper(c, R, { l: [[-152, 232], [-122, 316]], r: [[164, 226], [154, 298]], w: [26, 30, 34] });
      const gown = longRobe(c, R, 992, 114);
      pattern(c, gown, () => { c.strokeStyle = 'rgba(196,176,226,0.13)'; c.lineWidth = 1.5; for (let y = 140; y < 1020; y += 52) for (let x = -130 + ((y / 52) % 2) * 26; x < 140; x += 52) c.strokeRect(x - 8, y - 8, 16, 16); });
      robeFolds(c, 992); frontEdge(c, 992);
      stroke(c, 'M -112 984 Q 0 1016, 116 984', TR, 10); stroke(c, 'M -112 992 Q 0 1024, 116 992', OUT, 2);
      crossCollar(c, { trim: TR, inner: '#f2ecde', tw: 14, edge: 'rgba(200,180,230,0.3)' });
      sash(c, '#1a1522', 336);
      stroke(c, 'M -52 366 C -54 392, -52 410, -54 428', '#c9b27a', 1.6); shape(c, 'M -54 428 m -10 10 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0 M -54 438 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0', '#dfe9df', OUT, 1.3);
      for (let i = -2; i <= 2; i++) stroke(c, `M ${-54 + i * 1.6} 449 L ${-54 + i * 3} 496`, i % 2 ? '#c9b27a' : '#a8905a', 1.5);
      book(c, 58, 306, -0.12, '#3d5468', true);
      holdL(c, R, skin, 84, 348, 1.9);
    },
  };

  /* ================= 重玄子（卖历日的老道） ================= */
  CH.laodao = {
    name: '重玄子', title: '御街上卖历日的老道', season: '玄', support: true, up: 10, line: '今年的惊蛰，要打雷了。',
    f: { skin: '#e8cdae', shade: '#b98f6c', turn: 0.2, jaw: 0.76, chin: 10, long: 1.08, blush: 0.04, rest: 'normal', neckW: 14,
      eye: { w: 22, h: 7, tilt: 0.16, col: '#3a2a20', lid: 0.14 }, brow: { th: 3.4, arch: 0.55, out: 2.6, col: '#dcd8d0' }, mouth: { w: 19, full: 0.6, col: '#a8685a' },
      mark(c, g) { age(c, g, 0.9, { hollow: true }); whiskers(c, g, { col: '#e0dcd4', mus: 2, goat: 78, goatW: 16, sway: -3 }); } },
    hairBack(c) {
      hairFill(c, manBack, WHITE);
      hairFill(c, 'M -17 -92 C -24 -126, 24 -126, 17 -92 C 10 -86, -10 -86, -17 -92 Z', WHITE);
      shape(c, 'M -22 -102 C -20 -124, 20 -124, 22 -102 C 10 -108, -10 -108, -22 -102 Z', '#2a3238', P.rgba('#000', 0.8), 1.4);              // 小小一顶道冠
      stroke(c, 'M -38 -108 L 38 -108', '#3a2416', 5); stroke(c, 'M -38 -108 L 38 -108', '#9a6a3a', 3); bead(c, -40, -108, 3.6, '#9a6a3a');
    },
    hairFront(c) {
      hairFill(c, 'M -51 -20 C -58 -104, 58 -104, 51 -20 C 48 -42, 38 -58, 16 -63 C 9 -64, 4 -60, 0 -56 C -4 -60, -9 -64, -16 -63 C -38 -58, -48 -42, -51 -20 Z', WHITE);
      sideburns(c, WHITE, 26);
      strands(c, ['M 0 -58 C 0 -70, 0 -80, 0 -90', 'M -30 -74 C -40 -60, -46 -44, -49 -28', 'M 30 -74 C 40 -60, 46 -44, 49 -28'], 'rgba(110,104,96,0.45)', 1);
    },
    bust(c) {
      bust(c, { w: 114, col: '#586a74' });
      folds(c, ['M -90 150 C -80 190, -76 230, -80 300', 'M 88 150 C 78 190, 76 230, 80 300']);
      crossCollar(c, { trim: '#23292d', inner: '#f2ecde', tw: 15 });
    },
    full(c) {
      const skin = this.f.skin, R = '#586a74', TR = '#23292d';
      shadow(c, 1046, 150); toes(c, '#26221e'); stroke(c, 'M -70 1010 L -24 1010 M 26 1010 L 72 1010', '#efe9da', 7);
      upper(c, R, { w: [26, 30, 34] });
      longRobe(c, R, 992, 114); robeFolds(c, 992); frontEdge(c, 992);
      stroke(c, 'M -112 982 Q 0 1014, 116 982', TR, 13); stroke(c, 'M -112 991 Q 0 1023, 116 991', OUT, 2);
      crossCollar(c, { trim: TR, inner: '#f2ecde', tw: 15 });
      sash(c, '#2a3238', 336);
      stroke(c, 'M 30 366 C 26 420, 34 470, 28 530', '#c9b27a', 3); for (let i = -2; i <= 2; i++) stroke(c, `M 28 530 l ${i * 3} 34`, '#c9b27a', 1.5);
      /* 左手一叠历日 */
      book(c, 112, 392, 0.16, '#d6bd72'); book(c, 104, 386, 0.1, '#e0c97e');
      holdL(c, R, skin, 96, 356, 1.5);
      /* 右手拂尘：柄在手里，尘尾搭下来 */
      for (let i = -3; i <= 3; i++) stroke(c, `M -26 176 C ${-4 + i * 3} ${150 + Math.abs(i) * 3}, ${22 + i * 4} 230, ${14 + i * 5} ${330 + (3 - Math.abs(i)) * 14}`, i % 2 ? '#f4f0e6' : '#dcd6c8', 2.2);
      raiseR(c, R, skin, null, () => { stroke(c, 'M -78 276 L -24 172', '#2a1c12', 8); stroke(c, 'M -78 276 L -24 172', '#8a5a30', 5); bead(c, -25, 174, 6, '#c8362e'); });
    },
  };

  /* ================= 阮四娘 ================= */
  CH.siniang = {
    name: '阮四娘', title: '醉春楼掌柜', season: '柜', support: true, up: 9, line: '你要锁他，先锁我。',
    f: { skin: '#f2d6bc', shade: '#d19f80', turn: -0.22, jaw: 0.84, chin: 12, blush: 0.16, rest: 'smirk', neckW: 14.5, earring: '#d7a544',
      eye: { w: 23, h: 8.4, tilt: 0.24, col: '#3e2a1e', lash: true, lid: 0.08 }, brow: { th: 2.8, arch: 0.7, out: -1.2 }, mouth: { w: 19.5, full: 1, col: '#b8433a' },
      mark(c, g) { age(c, g, 0.3, { fore: 0 }); c.fillStyle = '#3a2218'; c.beginPath(); c.arc(g.fx * 1.25 + 15, 57, 1.6, 0, 6.3); c.fill(); } },
    hairBack(c) {
      hairFill(c, 'M -54 -18 C -64 -114, 64 -114, 54 -18 C 57 6, 52 28, 42 40 C 24 4, -24 4, -42 40 C -52 28, -57 6, -54 -18 Z');
      const p = shape(c, 'M -34 -88 C -50 -132, 50 -132, 34 -88 C 16 -78, -16 -78, -34 -88 Z', lg(c, 0, -130, 0, -80, [[0, '#9a3a34'], [1, '#6a2420']]), P.rgba(INK, 0.85), 1.6);   // 包髻
      c.save(); c.clip(p); c.fillStyle = 'rgba(227,185,90,0.6)'; for (let y = -124; y < -80; y += 13) for (let x = -44 + ((y / 13) % 2 ? 7 : 0); x < 46; x += 14) { c.beginPath(); c.arc(x, y, 1.8, 0, 6.3); c.fill(); } c.restore();
      stroke(c, 'M -30 -90 C -12 -84, 12 -84, 30 -90', '#d7a544', 3);
      stroke(c, 'M 28 -112 L 62 -124', '#d7a544', 3); bead(c, 64, -125, 4.4, '#d8503c'); stroke(c, 'M -28 -112 L -58 -122', '#d7a544', 2.4); bead(c, -60, -123, 3.4, '#3aa6a0');
    },
    hairFront(c) {
      hairFill(c, 'M -51 -18 C -58 -106, 58 -106, 51 -18 C 49 -36, 40 -50, 22 -56 C 12 -59, 4 -56, 0 -49 C -4 -56, -12 -59, -22 -56 C -40 -50, -49 -36, -51 -18 Z');
      hairFill(c, 'M -51 -22 C -56 -4, -54 14, -48 24 C -47 8, -46 -8, -44 -28 Z'); hairFill(c, 'M 50 -22 C 54 -6, 52 10, 46 20 C 45 6, 44 -8, 43 -28 Z');
      strands(c, ['M 0 -50 C 0 -64, 0 -76, 0 -88', 'M -30 -70 C -40 -56, -46 -40, -49 -24', 'M 30 -70 C 40 -56, 46 -40, 49 -24']);
    },
    bust(c) {
      bust(c, { w: 108, col: '#8b3a3a' });
      shape(c, 'M -20 96 L -26 420 L 26 420 L 20 96 C 8 104, -8 104, -20 96 Z', '#ead9c0');
      shape(c, 'M -27 162 L 27 162 L 30 420 L -30 420 Z', lg(c, 0, 162, 0, 300, [[0, '#4a5d58'], [1, '#3a4a46']]), P.rgba(INK, 0.7), 1.4); stroke(c, 'M -27 170 L 27 170', 'rgba(227,185,90,0.7)', 1.6);
      [-1, 1].forEach(s => { shape(c, `M ${s * 24} 98 L ${s * 12} 100 L ${s * 26} 420 L ${s * 44} 420 Z`, '#d7a544', P.rgba(INK, 0.8), 1.5); stroke(c, `M ${s * 19} 104 L ${s * 35} 420`, 'rgba(120,70,20,0.5)', 1.2); });
      folds(c, ['M -82 150 C -74 200, -72 250, -76 320', 'M 80 150 C 72 200, 70 250, 74 320'], 0.22);
    },
    full(c) {
      const skin = this.f.skin, R = '#8b3a3a', G = '#d7a544', SK = '#3f504c';
      shadow(c, 1050, 150);
      const sk = shape(c, 'M -62 330 C -86 560, -106 820, -114 1038 Q 0 1066, 114 1038 C 106 820, 86 560, 62 330 Z', fab(c, SK, -116, 116), OUT, 2.2);
      pattern(c, sk, () => { for (let i = -6; i <= 6; i++) stroke(c, `M ${i * 9} 340 C ${i * 13} 600, ${i * 17} 840, ${i * 18.5} 1056`, 'rgba(10,20,18,0.3)', 1.3); });
      stroke(c, 'M -113 1026 Q 0 1054, 113 1026', P.rgba(G, 0.8), 3);
      shape(c, 'M -34 1040 C -40 1046, -34 1054, -22 1052 L -8 1046 Z', '#2a2420', OUT, 1.3); shape(c, 'M 20 1046 C 20 1054, 30 1056, 40 1052 L 50 1044 Z', '#2a2420', OUT, 1.3);
      shape(c, 'M -42 150 L 42 150 L 48 346 L -48 346 Z', lg(c, 0, 150, 0, 346, [[0, '#4a5d58'], [1, '#3a4a46']]), OUT, 1.6); stroke(c, 'M -42 160 L 42 160', 'rgba(227,185,90,0.7)', 1.8);
      stroke(c, 'M -46 302 Q 0 314, 46 302', G, 6);
      tube(c, [-86, 130], [-152, 220], [-140, 298], 26, 27, 24, fab(c, R, -170, -90)); tube(c, [86, 130], [150, 220], [142, 300], 26, 27, 24, fab(c, R, 90, 172));
      [-1, 1].forEach(s => {
        shape(c, `M ${s * 24} 92 C ${s * 54} 98, ${s * 92} 108, ${s * 100} 146 C ${s * 98} 240, ${s * 76} 320, ${s * 72} 360 C ${s * 84} 520, ${s * 94} 650, ${s * 98} 764 L ${s * 32} 774 C ${s * 27} 620, ${s * 24} 400, ${s * 20} 100 Z`, fab(c, R, s < 0 ? -104 : 20, s < 0 ? -20 : 104), OUT, 2.2);
        shape(c, `M ${s * 24} 94 L ${s * 11} 98 L ${s * 19} 772 L ${s * 34} 774 Z`, G, OUT, 1.5); stroke(c, `M ${s * 18} 104 L ${s * 27} 770`, 'rgba(120,70,20,0.45)', 1.3);
        folds(c, [`M ${s * 62} 380 C ${s * 70} 520, ${s * 78} 650, ${s * 82} 760`, `M ${s * 84} 170 C ${s * 76} 230, ${s * 72} 290, ${s * 72} 340`], 0.24);
        stroke(c, `M ${s * 98} 756 L ${s * 33} 766`, P.rgba(G, 0.75), 3);
      });
      /* 腰上一串钥匙 */
      stroke(c, 'M -30 310 C -34 330, -30 344, -32 356', '#8e2a20', 2.2); c.strokeStyle = '#b8a070'; c.lineWidth = 2.4; c.beginPath(); c.arc(-32, 366, 10, 0, 6.3); c.stroke();
      [[-40, 372, 0.3], [-32, 376, 0], [-24, 372, -0.3]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); c.rotate(r); shape(c, 'M -2 0 h 4 v 30 h 6 v 5 h -6 v 4 h -4 Z', '#9a8a60', P.rgba(INK, 0.7), 1); c.restore(); });
      /* 右手叉腰 */
      tube(c, [-140, 298], [-118, 344], [-80, 350], 24, 21, 17, fab(c, R, -150, -70)); hand(c, -72, 348, -1.65, 1.15, skin, 'fist');
      /* 左臂夹着算盘 */
      abacus(c, 104, 388, -1.02, 1.05);
      tube(c, [142, 300], [150, 362], [126, 412], 23, 20, 16, fab(c, R, 100, 176)); hand(c, 118, 416, 1.2, 1.15, skin, 'fist', true);
    },
  };

  /* ================= 老褚 ================= */
  CH.laochu = {
    name: '老褚', title: '醉春楼铛头 · 管着八眼灶', season: '灶', support: true, up: 5, line: '垫一口。今晚你要跑到三更。',
    f: { skin: '#e2b48c', shade: '#b07a54', turn: 0.2, jaw: 1.0, chin: 18, long: 0.98, blush: 0.26, rest: 'stern', neckW: 23,
      eye: { w: 21, h: 7.2, tilt: 0, col: '#3a2616' }, brow: { th: 5.8, arch: 0.15, in: 1 }, mouth: { w: 24, full: 0.8, col: '#a8625a' },
      mark(c, g) { age(c, g, 0.6, { fore: 2 }); whiskers(c, g, { col: '#2a211c', stub: 0.22, mus: 1, musTh: 4.8 }); stroke(c, `M ${g.cx - 24} ${68} C ${g.cx - 10} ${84}, ${g.cx + 12} ${84}, ${g.cx + 26} ${66}`, P.rgba('#7a4630', 0.4), 1.4); } },
    hairBack(c) { hairFill(c, 'M -53 -18 C -60 -84, 60 -84, 53 -18 C 55 0, 52 14, 47 22 C 30 -8, -30 -8, -47 22 C -52 14, -55 0, -53 -18 Z'); },
    hairFront(c) {
      const p = shape(c, 'M -53 -30 C -62 -112, 62 -112, 53 -30 C 46 -44, 28 -52, 0 -52 C -28 -52, -46 -44, -53 -30 Z', lg(c, -50, 0, 50, 0, [[0, '#cfc6b0'], [0.4, '#f2ecdc'], [1, '#c2b8a0']]), P.rgba(INK, 0.8), 1.6);   // 裹头的白布
      folds(c, ['M -40 -66 C -20 -78, 20 -78, 40 -66', 'M -46 -50 C -26 -60, 26 -60, 46 -50', 'M -30 -86 C -10 -94, 14 -94, 32 -84'], 0.2);
      shape(c, 'M 46 -44 C 60 -52, 70 -44, 66 -32 C 60 -26, 50 -30, 46 -36 Z', '#e6dfcc', P.rgba(INK, 0.8), 1.3); shape(c, 'M 58 -32 C 68 -22, 70 -8, 64 2 L 58 -2 C 60 -12, 58 -22, 52 -30 Z', '#d9d0ba', P.rgba(INK, 0.8), 1.2);
      sideburns(c, HAIR, 8);
    },
    bust(c) {
      bust(c, { w: 142, col: '#84735f' });
      crossCollar(c, { trim: '#4f4233', inner: '#e6dcc6' });
      stroke(c, 'M -66 196 L -32 104 M 66 196 L 32 104', '#cfc6b0', 7);
      shape(c, 'M -70 192 L 70 192 L 84 420 L -84 420 Z', lg(c, -80, 0, 80, 0, [[0, '#cfc6b0'], [0.4, '#eee7d4'], [1, '#c6bca4']]), P.rgba(INK, 0.8), 1.8);
      soft(c, 30, 300, 26, 18, '#8a6a3a', 0.22); soft(c, -34, 360, 18, 14, '#7a4a2a', 0.2);
    },
    full(c) {
      const skin = this.f.skin, R = '#84735f', AP = '#e6dfcc', bare = lg(c, 0, 250, 0, 400, [[0, skin], [1, P.mix(skin, '#a8603f', 0.25)]]);
      shadow(c, 1046, 176);
      c.save(); c.scale(1.2, 1);
      trousers(c, '#514a42'); shoes(c, '#2a2420');
      tube(c, [-98, 132], [-140, 200], [-150, 262], 27, 28, 27, fab(c, R, -180, -110)); tube(c, [100, 132], [142, 200], [150, 258], 27, 28, 27, fab(c, R, 110, 186));
      jacket(c, R); folds(c, ['M -96 170 C -86 230, -82 280, -84 330', 'M 96 170 C 86 230, 82 280, 84 330']);
      crossCollar(c, { trim: '#4f4233', inner: '#e6dcc6' });
      stroke(c, 'M -58 184 L -28 100 M 58 184 L 28 100', '#cfc6b0', 6);
      shape(c, 'M -62 178 L 62 178 L 86 350 C 92 520, 94 660, 90 772 Q 0 794, -90 772 C -94 660, -92 520, -86 350 Z', lg(c, -90, 0, 90, 0, [[0, '#cfc6b0'], [0.4, AP], [1, '#c6bca4']]), OUT, 2);
      folds(c, ['M -40 380 C -46 520, -50 660, -52 776', 'M 30 380 C 34 520, 38 660, 38 782'], 0.16);
      stroke(c, 'M -86 350 Q 0 368, 86 350', '#b8ae96', 9); stroke(c, 'M -86 346 Q 0 364, 86 346', OUT, 1.4);
      c.restore();
      soft(c, 40, 470, 34, 24, '#8a6a3a', 0.2); soft(c, -50, 600, 24, 30, '#7a4a2a', 0.16); soft(c, 16, 690, 18, 14, '#a8362a', 0.14);
      /* 左手叉腰 */
      tube(c, [180, 258], [176, 330], [124, 356], 20, 18, 16, bare, 1.8); hand(c, 114, 354, 1.7, 1.35, skin, 'fist', true);
      /* 右手拄着一把长柄铁勺 */
      stroke(c, 'M -196 150 L -196 640', '#1c1612', 11); stroke(c, 'M -196 150 L -196 640', '#6a4a2e', 7);
      shape(c, 'M -250 84 C -250 160, -142 160, -142 84 Z', lg(c, -250, 0, -142, 0, [[0, '#3a3e42'], [0.4, '#8a9096'], [1, '#2e3236']]), OUT, 2); shape(c, 'M -250 84 a 54 12 0 1 0 108 0 a 54 12 0 1 0 -108 0', '#22262a', OUT, 1.6); stroke(c, 'M -236 90 C -220 96, -180 97, -158 91', 'rgba(255,255,255,0.18)', 1.6);
      tube(c, [-180, 262], [-204, 326], [-194, 384], 20, 18, 16, bare, 1.8); hand(c, -196, 380, 0.1, 1.35, skin, 'fist');
    },
  };

  /* ================= 阿桂 ================= */
  CH.agui = {
    name: '阿桂', title: '醉春楼小厮 · 跟着惊蛰管酒窖', season: '窖', support: true, up: 6, oy: 176, line: '二楼的酒要温，三楼的酒要烈，一楼的酒要快。',
    f: { skin: '#f3d3b0', shade: '#d6a37e', turn: -0.18, jaw: 0.9, chin: 14, long: 0.9, blush: 0.32, rest: 'bright', neckW: 14,
      eye: { w: 23, h: 10.4, tilt: 0.04, col: '#4a3020', iris: 1.05 }, brow: { th: 3.4, arch: 0.5 }, mouth: { w: 19, full: 0.9, col: '#c0705e' } },
    hairBack(c) {
      hairFill(c, manBack);
      hairFill(c, 'M -15 -92 C -20 -122, 20 -122, 15 -92 C 9 -86, -9 -86, -15 -92 Z');
      shape(c, 'M -16 -96 C -8 -90, 8 -90, 16 -96 L 15 -88 C 8 -83, -8 -83, -15 -88 Z', '#8a775d', P.rgba(INK, 0.85), 1.4);
      shape(c, 'M 14 -92 C 26 -90, 34 -80, 34 -68 L 28 -70 C 26 -78, 20 -84, 13 -85 Z', '#9a876d', P.rgba(INK, 0.8), 1.2);
    },
    hairFront(c) {
      hairFill(c, 'M -52 -16 C -60 -106, 60 -106, 52 -16 C 50 -34, 44 -46, 36 -50 C 30 -40, 22 -52, 12 -44 C 6 -54, -6 -42, -14 -50 C -22 -42, -32 -52, -40 -44 C -46 -40, -50 -30, -52 -16 Z');
      sideburns(c, HAIR, 6);
      strands(c, ['M -24 -80 C -28 -66, -30 -56, -30 -48', 'M 0 -86 C 0 -70, -1 -58, -2 -48', 'M 24 -80 C 26 -66, 25 -56, 24 -48']);
    },
    bust(c) {
      bust(c, { w: 104, col: '#8a775d' });
      folds(c, ['M -80 150 C -72 190, -70 230, -74 300', 'M 78 150 C 70 190, 68 230, 72 300']);
      crossCollar(c, { trim: '#5d4e3a', inner: '#e9dfc8' });
    },
    full(c) {
      const skin = this.f.skin, R = '#8a775d';
      shadow(c, 856, 128);
      c.save(); c.translate(0, 18.4); c.scale(0.9, 0.8);
      trousers(c, '#5c5348', '#7b7566'); shoes(c, '#2a2420');
      tube(c, [-98, 132], [-150, 236], [-140, 300], 26, 26, 25, fab(c, R, -180, -110)); tube(c, [100, 132], [152, 236], [142, 300], 26, 26, 25, fab(c, R, 110, 186));
      jacket(c, R); folds(c, ['M -70 380 C -76 440, -82 500, -84 548', 'M 66 376 C 74 440, 80 500, 84 550']);
      stroke(c, 'M -100 540 Q 0 568, 102 540', P.rgba('#3a3024', 0.8), 3);
      crossCollar(c, { trim: '#5d4e3a', inner: '#e9dfc8' });
      shape(c, 'M -88 330 Q 0 350, 90 330 L 90 358 Q 0 378, -88 358 Z', '#3a3024', OUT, 1.8);
      c.restore();
      /* 两手抱着一坛酒 */
      c.save(); c.translate(0, 404); P.jar(c, 0, 0, 1.5, { seed: 5, text: '酒' }); c.restore();
      tube(c, [-126, 258], [-112, 330], [-52, 344], 22, 19, 16, fab(c, R, -140, -40)); hand(c, -44, 342, -1.5, 1.15, skin, 'fist');
      tube(c, [128, 258], [114, 330], [54, 344], 22, 19, 16, fab(c, R, 40, 142)); hand(c, 46, 342, 1.5, 1.15, skin, 'fist', true);
    },
  };

  /* ================= 蟹壳青 ================= */
  CH.xieke = {
    name: '蟹壳青', title: '半闲堂的“促织客” · 序章首领', season: '铁', support: true, up: 2, line: '翎毛。铜符。',
    f: { skin: '#c99a72', shade: '#96643e', turn: 0.2, jaw: 1.02, chin: 19, long: 1.0, blush: 0, rest: 'stern', neckW: 27,
      eye: { w: 21, h: 6.4, tilt: 0.1, col: '#2a1a10', crease: false }, brow: { th: 6.2, arch: 0.1, in: 1.4 }, mouth: { w: 25, full: 0.7, col: '#8a5a4a' },
      mark(c, g) {
        age(c, g, 0.5, { fore: 2 }); whiskers(c, g, { col: '#2a211c', stub: 0.3 });
        stroke(c, `M ${g.fx - 36} -30 L ${g.fx - 22} 24`, 'rgba(126,56,44,0.75)', 2.4); for (let i = 0; i < 4; i++) stroke(c, `M ${g.fx - 37 + i * 3.6} ${-20 + i * 12} l 7 -2.4`, 'rgba(126,56,44,0.6)', 1.3);     // 一道旧疤
      } },
    hairBack(c) { stroke(c, 'M 50 -42 C 70 -36, 78 -14, 72 6 M 48 -38 C 62 -28, 64 -6, 56 12', '#3d5556', 7); stroke(c, 'M 50 -42 C 70 -36, 78 -14, 72 6', 'rgba(0,0,0,0.5)', 1.2); },
    hairFront(c) {
      shape(c, 'M -53 -36 C -42 -58, 42 -58, 53 -36 L 52 -22 C 40 -44, -40 -44, -52 -22 Z', lg(c, -50, 0, 50, 0, [[0, '#3d5556'], [0.4, '#6a8a8a'], [1, '#34494a']]), P.rgba(INK, 0.85), 1.6);        // 蟹壳青色的抹额
      stroke(c, 'M -46 -40 C -30 -52, 30 -52, 46 -40', 'rgba(255,255,255,0.18)', 1.2);
      soft(c, -10, -66, 26, 12, '#ffffff', 0.16);
    },
    bust(c) {
      bust(c, { w: 152, top: 98, col: '#3f5658' });
      folds(c, ['M -120 160 C -108 200, -104 240, -108 310', 'M 118 160 C 106 200, 104 240, 108 310']);
      crossCollar(c, { trim: '#1c2628', inner: '#4a423c', tw: 15 });
      cricket(c, 74, 220, 1.5, 'rgba(215,165,68,0.85)');
    },
    full(c) {
      const skin = this.f.skin, R = '#3f5658', iron = lg(c, 0, 210, 0, 290, [[0, '#8a949a'], [0.5, '#565f66'], [1, '#2a3036']]);
      shadow(c, 1046, 196);
      c.save(); c.scale(1.24, 1);
      trousers(c, '#2c3638', '#4a5052'); shoes(c, '#17130f');
      c.restore();
      tube(c, [-124, 138], [-186, 200], [-204, 276], 33, 35, 32, fab(c, R, -240, -120)); tube(c, [126, 138], [188, 200], [206, 276], 33, 35, 32, fab(c, R, 122, 242));
      c.save(); c.scale(1.24, 1);
      jacket(c, R); folds(c, ['M -70 380 C -76 440, -82 500, -84 548', 'M 66 376 C 74 440, 80 500, 84 550', 'M -96 170 C -86 230, -82 280, -84 330', 'M 96 170 C 86 230, 82 280, 84 330']);
      crossCollar(c, { trim: '#1c2628', inner: '#4a423c', tw: 15 });
      shape(c, 'M -88 326 Q 0 346, 90 326 L 90 366 Q 0 386, -88 366 Z', '#2a211c', OUT, 1.8); shape(c, 'M -14 340 h 28 v 30 h -28 Z', '#7a8288', OUT, 1.5);
      c.restore();
      cricket(c, 92, 486, 1.5, 'rgba(215,165,68,0.9)');
      /* 两臂在胸前一撞：前臂是铁护臂 */
      [-1, 1].forEach(s => {
        tube(c, [s * 204, 276], [s * 126, 268], [s * 52, 240], 31, 28, 25, iron, 2);
        [0.25, 0.5, 0.75].forEach(t => { const x = s * (204 - 152 * t), y = 276 - 36 * t; stroke(c, `M ${x} ${y - 27} L ${x - s * 3} ${y + 27}`, '#1c2024', 3); bead(c, x - s * 12, y - 14, 2.6, '#aab2b8'); bead(c, x - s * 13, y + 12, 2.6, '#aab2b8'); });
        hand(c, s * 44, 238, -s * 1.52, 1.6, skin, 'fist', s > 0);
      });
    },
  };

  /* ================= 钟推官 ================= */
  CH.zhong = {
    name: '钟推官', title: '临安府推官', season: '官', support: true, up: 9, line: '三天。三天之内他随传随到。',
    f: { skin: '#ead0b0', shade: '#c09a78', turn: -0.2, jaw: 0.86, chin: 13, long: 1.04, blush: 0.05, rest: 'weary', neckW: 16,
      eye: { w: 22, h: 7.4, tilt: 0, col: '#33241a', lid: 0.1 }, brow: { th: 4, arch: 0.3, out: 1.2 }, mouth: { w: 21, full: 0.7, col: '#a8685a' },
      mark(c, g) { age(c, g, 0.75); whiskers(c, g, { col: '#3a332e', mus: 2, goat: 30, goatW: 12 }); } },
    hairBack(c) {
      [-1, 1].forEach(s => { shape(c, `M ${s * 40} -74 L ${s * 180} -82 C ${s * 190} -82, ${s * 190} -68, ${s * 180} -68 L ${s * 40} -60 Z`, '#15110e', P.rgba('#000', 0.85), 1.4); stroke(c, `M ${s * 48} -70 L ${s * 176} -77`, 'rgba(255,255,255,0.14)', 1); });     // 展脚
      shape(c, 'M -40 -60 L -42 -116 C -42 -132, 42 -132, 42 -116 L 40 -60 Z', BLACK(c), P.rgba('#000', 0.85), 1.6);
      hairFill(c, 'M -53 -18 C -62 -112, 62 -112, 53 -18 C 55 0, 52 14, 47 24 C 30 -8, -30 -8, -47 24 C -52 14, -55 0, -53 -18 Z');
    },
    hairFront(c) {
      shape(c, capFront, BLACK(c), P.rgba('#000', 0.85), 1.6);
      stroke(c, 'M -46 -40 C -30 -50, 30 -50, 46 -40', 'rgba(255,255,255,0.14)', 1.2); stroke(c, 'M -44 -66 C -24 -76, 24 -76, 44 -66', 'rgba(0,0,0,0.9)', 2); stroke(c, 'M -44 -68 C -24 -78, 24 -78, 44 -68', 'rgba(255,255,255,0.12)', 1);
      sideburns(c, HAIR, 12);
    },
    collar(c, col) {
      shape(c, 'M -34 94 C -30 142, 30 142, 34 94 L 22 90 C 18 124, -18 124, -22 90 Z', P.dark(col, 0.2), OUT, 1.8);
      shape(c, 'M -22 90 C -18 124, 18 124, 22 90 L 16 88 C 12 114, -12 114, -16 88 Z', '#f2ecde', P.rgba(INK, 0.7), 1.2);
      stroke(c, 'M 30 112 C 52 118, 70 132, 80 152', OUT, 1.5); bead(c, 33, 113, 3.4, P.dark(col, 0.3));
    },
    bust(c) { bust(c, { w: 120, col: '#4d6b4a' }); folds(c, ['M -94 150 C -84 190, -80 230, -84 300', 'M 92 150 C 82 190, 80 230, 84 300']); this.collar(c, '#4d6b4a'); },
    full(c) {
      const R = '#4d6b4a';
      shadow(c, 1046, 150); boots(c, '#17130f', 986);
      upper(c, R, { l: [[-150, 230], [-150, 300]], r: [[152, 230], [152, 300]], w: [26, 30, 33] });
      longRobe(c, R, 985, 112); robeFolds(c, 985, 0.24);
      stroke(c, 'M -112 978 Q 0 1010, 116 978', P.dark(R, 0.35), 8); stroke(c, 'M -112 985 Q 0 1017, 116 985', OUT, 2);
      this.collar(c, R);
      shape(c, 'M -80 322 Q 0 340, 82 322 L 82 348 Q 0 366, -80 348 Z', '#17130f', OUT, 1.8);
      [[-52, 0], [-18, 3], [18, 3], [52, 0]].forEach(([x, dy]) => shape(c, `M ${x - 11} ${329 + dy} h 22 v 18 h -22 Z`, '#3d4a44', P.rgba('#9ab0a0', 0.8), 1.3));
      /* 两袖在身前合拢，袖口露出一卷公文 */
      shape(c, 'M -130 384 C -112 486, -30 512, 0 490 C 30 512, 112 486, 130 384 C 80 430, -80 430, -130 384 Z', fab(c, P.dark(R, 0.14), -130, 130), OUT, 2);
      c.save(); c.translate(6, 372); c.rotate(0.5); shape(c, 'M -9 -86 h 18 v 110 h -18 Z', lg(c, -9, 0, 9, 0, [[0, '#d9cfb4'], [0.5, '#f4eedc'], [1, '#cfc4a6']]), OUT, 1.5); stroke(c, 'M -9 -40 h 18', '#a8362a', 5); c.restore();
      tube(c, [-150, 300], [-128, 384], [-8, 412], 33, 35, 38, fab(c, R, -170, 0)); tube(c, [152, 300], [130, 384], [10, 412], 33, 35, 38, fab(c, R, 0, 172));
      stroke(c, 'M 0 380 C 4 400, 4 430, 0 448', OUT, 1.8);
    },
  };

  Art.supports = ['fan', 'he', 'laodao', 'siniang', 'laochu', 'agui', 'xieke', 'zhong'];
})();
