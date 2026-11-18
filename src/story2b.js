/* 第二章《扬州慢》后半的演出：边城 27、郝先生的雁 28、柝声 29、不走 30（九至十二场接着往下写）。
   接在 story2.js 后面，用它和 story.js 交出来的小工具（JX.story._h）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks, Fig = JX.Fig;
  const { cutBg, cutSteps, ch2 } = ST._h;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const fl = () => JX.state.flags;
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';

  /* ---------- 一串跟着走的人（和牲口）：flags.train 里依次是谁，头一个跟主角，后一个跟前一个 ---------- */
  let trainT = 0;
  JX.on('update', dt => {
    const f = JX.state.flags, tr = f && f.train; if (!tr || !tr.length || W.locked) return;
    trainT -= dt; if (trainT > 0) return; trainT = 0.3;
    let lead = W.player;
    for (const id of tr) {
      const e = W.byId[id]; if (!e || !lead) break;
      const d = JX.dist(e.x, e.y, lead.x, lead.y), gap = id === 'mule' ? 104 : 88;
      if (d < gap) { if (e.path && d < gap - 16) { e.path = null; e.moving = false; } }
      else { e.path = W.findPath(e.x, e.y, lead.x, lead.y); e.pathSpeed = d > 320 ? 310 : 215; e.onArrive = null; }
      lead = e;
    }
  });
  const halt = () => (fl().train || []).forEach(id => { const e = W.byId[id]; if (e) { e.path = null; e.moving = false; } });

  /* ---------- 自己画的几样：骡子、雁、披红的李制置 ---------- */
  function drawMule(g, e) {
    if (e.dir === 1) e.side = -1; else if (e.dir === 3) e.side = 1;
    const s = e.side || 1, t = JX.time, sw = e.moving ? Math.sin(t * 9) : 0;
    P.shadow(g, 0, 0, 46, 9, 0.35);
    g.save(); g.scale(s, 1);
    const leg = (x, k) => { P.line(g, x, -40, x + k * sw * 9, -2, 8, INK()); P.line(g, x, -40, x + k * sw * 9, -2, 5.4, '#6f6458'); P.ellipse(g, x + k * sw * 9, -1, 4.6, 2.6, '#2a2420'); };
    leg(-26, 1); leg(22, -1);
    g.fillStyle = P.hgrad(g, -44, 0, 88, [[0, '#5d544a'], [0.5, '#8a7e6e'], [1, '#6a6054']]); g.beginPath(); g.ellipse(0, -56, 42, 22, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.5; g.stroke();
    leg(-18, -1); leg(30, 1);
    g.strokeStyle = INK(); g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(34, -64); g.lineTo(54, -92); g.stroke(); g.strokeStyle = '#857968'; g.lineWidth = 13; g.stroke();          // 脖子
    g.fillStyle = '#857968'; g.beginPath(); g.ellipse(64, -98, 17, 10, 0.5, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke(); P.ellipse(g, 76, -92, 6, 5, '#c9bca8', INK(), 1);     // 头、口鼻
    [[52, -108, -0.5], [59, -110, -0.2]].forEach(q => { g.save(); g.translate(q[0], q[1]); g.rotate(q[2]); g.fillStyle = '#6a6054'; g.beginPath(); g.ellipse(0, -9, 4, 12, 0, 0, 6.3); g.fill(); g.stroke(); g.restore(); });   // 长耳朵
    P.ellipse(g, 66, -100, 1.8, 2, '#1a1310');
    P.line(g, -42, -60, -54, -36 + sw * 3, 4, '#3a322c');                                                                   // 尾巴
    g.strokeStyle = '#3a2a1e'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(70, -92); g.quadraticCurveTo(96, -78, 104, -70); g.stroke();   // 缰绳
    g.fillStyle = '#7a3a2e'; g.fillRect(-20, -80, 40, 10); g.strokeStyle = INK(); g.lineWidth = 1.2; g.strokeRect(-20, -80, 40, 10);    // 鞍垫
    g.save(); g.translate(-2, -34); P.jar(g, 0, 0, 0.5, { seed: 71, text: '酒' }); g.restore();                              // 驮着的酒坛（这一侧一只）
    P.line(g, -16, -78, -14, -52, 2, '#c9b48a'); P.line(g, 14, -78, 12, -52, 2, '#c9b48a');
    g.restore();
  }
  function drawGoose(g, e) {
    const s = e.side || 1, up = e.up || 0;                                     // up：0 缩着脖子睡，1 伸长脖子
    P.shadow(g, 0, 0, 24, 6, 0.3); g.save(); g.scale(s, 1);
    P.line(g, -3, -8, -3, 0, 2.4, '#d98a4a'); P.line(g, 5, -8, 5, 0, 2.4, '#d98a4a');
    g.fillStyle = P.hgrad(g, -22, 0, 44, [[0, '#6d6a66'], [0.5, '#a39f98'], [1, '#77736e']]); g.beginPath(); g.ellipse(0, -18, 22, 12, -0.1, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.3; g.stroke();
    g.fillStyle = '#5a5652'; g.beginPath(); g.moveTo(-6, -24); g.quadraticCurveTo(-22, -22, -28, -12); g.quadraticCurveTo(-14, -12, -2, -16); g.closePath(); g.fill(); g.stroke();      // 翅
    const hx = 16 + up * 6, hy = -24 - up * 26;
    g.strokeStyle = INK(); g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(14, -22); g.quadraticCurveTo(20 + up * 4, -30 - up * 10, hx, hy); g.stroke(); g.strokeStyle = '#8f8b85'; g.lineWidth = 6.4; g.stroke();
    P.ellipse(g, hx + 2, hy - 2, 6.4, 5.4, '#7d7973', INK(), 1.2); g.fillStyle = '#2a2420'; g.beginPath(); g.moveTo(hx + 7, hy - 4); g.lineTo(hx + 17, hy - 1); g.lineTo(hx + 7, hy + 1); g.closePath(); g.fill();
    P.ellipse(g, hx + 3, hy - 3, 1.2, 1.2, '#1a1310');
    g.restore();
  }
  function drawLi(g, e) {
    const cape = () => { g.fillStyle = '#8e2a20'; g.beginPath(); g.moveTo(-21, -110); g.lineTo(21, -110); g.lineTo(31, -26); g.lineTo(-31, -26); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke(); P.line(g, -8, -100, -12, -30, 1, 'rgba(40,10,8,0.35)'); P.line(g, 9, -100, 13, -30, 1, 'rgba(40,10,8,0.35)'); };
    P.shadow(g, 0, 0, 30, 8, 0.35);
    if (e.dir !== 2) cape();
    Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, pose: e.pose, carry: e.carry, shadow: false });
    if (e.dir === 2) cape();
  }
  ST._drawLi = drawLi; ST._drawGoose = drawGoose; ST._drawMule = drawMule;

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop1 = JX.populate;
  JX.populate = function (id) {
    pop1(id);
    const sg = JX.state.stage;
    const loop = (e, pts, sp, scene) => { let i = 0; const go = () => { if (W.byId[e.id] !== e || W.id !== scene) return; i = (i + 1) % pts.length; W.walk(e, pts[i][0], pts[i][1], { speed: sp, straight: true }).then(() => JX.sleep(0.8 + Math.random() * 1.4).then(go)); }; go(); };
    if (id === 'yangzhou') {
      W.add('xiali', 'xiali', 150, 792, { dir: 3, tag: '夏离', solid: false });
      W.add('mule', { h: 4 }, 70, 820, { dir: 3, solid: false, draw: drawMule, side: 1 });
      W.add('tingxue', 'tingxue', 128, 858, { dir: 3, tag: '听雪', solid: false });
      W.add('chapo', 'chapo', 966, 660, { dir: 0, tag: '卖茶的', bark: ['热茶——一文钱一碗——'] });
      W.add('laobing', 'laobing', 770, 664, { dir: 3, tag: '老兵' });
      W.add('hs', 'huoji', 716, 672, { dir: 3, solid: false, pose: 'squat' });                                      // 听老兵说话的后生
      [[150, 604], [392, 610], [1560, 604]].forEach((q, i) => W.add('lm' + i, 'liumin', q[0], q[1], { dir: 0, solid: false, pose: 'sit', seat: 6 }));
      W.add('lmk', 'qier', 214, 612, { dir: 0, solid: false });
      W.add('maichang', 'maichang', 1150, 668, { dir: 0, tag: '卖唱的', pose: 'sit', seat: 6, carry: 'ruan', closed: true });
      W.add('b1', 'bing', 1392, 672, { dir: 1, tag: '军士', carry: 'spear' });
      W.add('b4', 'bing', 1960, 690, { dir: 3, tag: '军士', carry: 'spear' });
      loop(W.add('b2', 'bing', 1500, 884, { dir: 3, solid: false, carry: 'spear' }), [[1500, 884], [2560, 884]], 120, 'yangzhou');
      loop(W.add('b3', 'bing', 2420, 660, { dir: 1, solid: false, carry: 'spear' }), [[2420, 660], [1700, 660]], 110, 'yangzhou');
      [[2068, 626, 3], [2196, 628, 1], [2104, 598, 0]].forEach((q, i) => W.add('bp' + i, 'bing', q[0], q[1], { dir: q[2], solid: false, pose: 'squat', carry: 'bowl' }));
      W.add('liting', 'liting', 2240, 616, { dir: 1, solid: false, carry: 'bowl', draw: drawLi });
    }
    if (id === 'yingwai') {
      const dusk = fl().dusk;
      W.add('xiali', 'xiali', 470, 654, { dir: 2, tag: '夏离', carry: 'bowl' });
      W.add('tingxue', 'tingxue', 640, 668, { dir: 0, tag: '听雪', pose: 'sit', seat: 6, carry: 'bowl' });
      W.add('mule', { h: 4 }, 300, 660, { dir: 3, solid: false, draw: drawMule, side: 1 });
      if (!dusk) W.add('shitou', 'shitou', 1040, 880, { dir: 1, tag: '写字的孩子', pose: 'squat', reach: 110 });
      if (dusk) W.add('laojun', 'laojun', 2420, 652, { dir: 0, tag: '老军', carry: 'lantern' });
      W.add('g1', 'bing', 1960, 652, { dir: 0, tag: '营门的兵', carry: 'spear', bark: ['营门重地，闲人走开。'] });
      W.add('g2', 'bing', 2076, 652, { dir: 0, solid: false, carry: 'spear' });
    }
    if (id === 'ying') {
      W.add('xiali', 'xiali', 130, 806, { dir: 3, tag: '夏离', solid: false });
      W.add('geng', 'bing', 2000, 700, { dir: 1, solid: false, carry: 'lantern', vis: false });                     // 巡更的：演出里才走出来
    }
    if (id === 'guanshe') {
      W.add('xiali', 'xiali', 190, 822, { dir: 3, tag: '夏离', solid: false });
      W.add('haojing', 'haojing', 1180, 700, { dir: 0, tag: '郝经', carry: 'brush', solid: false });
      W.add('yan', { h: 4 }, 1500, 800, { solid: false, draw: drawGoose, side: -1, up: 0 });
    }
    void sg;
  };

  /* ---------- 特写：两半雁翎铜符合在一起 ---------- */
  function drawToken(c, k) {
    cutBg(c, '#4a3c30', '#231c18');
    const gl = c.createRadialGradient(650, 300, 20, 650, 320, 480); gl.addColorStop(0, 'rgba(255,214,150,0.4)'); gl.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = gl; c.fillRect(0, 0, 1300, 640);
    const palm = (x, y, flip) => { c.save(); c.translate(x, y); c.scale(flip, 1); c.fillStyle = '#e2c19a'; c.beginPath(); c.moveTo(-190, 190); c.quadraticCurveTo(-210, 30, -90, 10); c.lineTo(120, 0); c.quadraticCurveTo(190, 20, 180, 90); c.lineTo(150, 190); c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 3; c.stroke(); for (let i = 0; i < 3; i++) { c.strokeStyle = 'rgba(120,80,50,0.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-120 + i * 40, 50 + i * 16); c.quadraticCurveTo(-20 + i * 30, 70 + i * 20, 90 + i * 16, 50 + i * 30); c.stroke(); } c.restore(); };
    const half = (side) => {                                            // 半根铜翎：羽轴在断口那一边
      c.fillStyle = P.vgrad(c, 0, -150, 300, [[0, '#c9a45a'], [0.5, '#8a6a3a'], [1, '#5a4426']]);
      c.beginPath(); c.moveTo(0, -150); c.quadraticCurveTo(side * 74, -110, side * 78, -10); c.quadraticCurveTo(side * 70, 110, 0, 150);
      for (let i = 0; i < 6; i++) c.lineTo((i % 2 ? 0 : -side * 9), 150 - (i + 1) * 50);                      // 锯齿的断口
      c.closePath(); c.fill(); c.strokeStyle = INK(); c.lineWidth = 3; c.stroke();
      c.strokeStyle = 'rgba(40,26,12,0.55)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(side * 2, -120 + i * 30); c.quadraticCurveTo(side * 36, -124 + i * 30, side * (60 - Math.abs(i - 4) * 5), -100 + i * 30); c.stroke(); }
      c.fillStyle = 'rgba(86,130,110,0.45)'; c.beginPath(); c.ellipse(side * 40, 60, 16, 9, 0.4, 0, 6.3); c.fill(); c.beginPath(); c.ellipse(side * 30, -70, 11, 6, -0.3, 0, 6.3); c.fill();    // 铜绿
    };
    const k1 = Math.min(1, k / 0.34), k2 = Math.max(0, Math.min(1, (k - 0.34) / 0.4)), k3 = Math.max(0, (k - 0.8) / 0.2);
    palm(470, 330, 1);
    if (k2 > 0) { c.save(); c.globalAlpha = Math.min(1, k2 * 3); palm(1300 - 470 + (1 - k2) * 260, 330, -1); c.restore(); }
    c.save(); c.translate(650 - 12 - (1 - k2) * 150 - (1 - k1) * 30, 330); c.rotate(-0.06 * (1 - k2)); half(-1); c.restore();
    if (k2 > 0) { c.save(); c.globalAlpha = Math.min(1, k2 * 3); c.translate(650 + 12 + (1 - k2) * 420, 330); c.rotate(0.1 * (1 - k2)); half(1); c.restore(); }
    if (k3 > 0) { const g2 = c.createRadialGradient(650, 330, 10, 650, 330, 260); g2.addColorStop(0, 'rgba(255,236,180,' + (0.5 * k3) + ')'); g2.addColorStop(1, 'rgba(255,236,180,0)'); c.fillStyle = g2; c.fillRect(300, 60, 700, 540); }
  }

  /* ---------- 演出 ---------- */
  let patrolP = null;
  const patrol = (pts, bangs, keep) => {                                  // 巡更的沿着 pts 走一趟，边走边敲；走完就看不见了（keep：先留在原地）
    const g = W.byId.geng; if (!g) return (patrolP = Promise.resolve());
    if (pts[0]) { g.x = pts[0][0]; g.y = pts[0][1]; } g.vis = true; g.alpha = 1;
    let on = true; (async () => { for (let i = 0; i < bangs && on; i++) { JX.audio.sfx('bang', 0.55); await nap(1.4); } })();
    return (patrolP = (async () => { for (let i = 1; i < pts.length; i++) await W.walk(g, pts[i][0], pts[i][1], { speed: JX.auto ? 2400 : 185, straight: true }); on = false; if (!keep) { await JX.tween(JX.auto ? 0.02 : 0.4, q => { g.alpha = 1 - q; }); g.vis = false; } })());
  };
  const duck = async (x, y, x2) => {                                     // 两个人各自蹲到遮挡后面
    const p = W.player, x0 = W.byId.xiali; halt(); fl().train = null;
    const a = W.walk(p, x, y, { speed: 240, dir: 2 }); if (x0) W.walk(x0, x2, y + 4, { speed: 260, dir: 2 }); await a; await nap(0.2);
    p.pose = 'squat'; if (x0) x0.pose = 'squat';
  };
  const rise = async () => { const p = W.player, x0 = W.byId.xiali; await nap(0.4); p.pose = null; if (x0) x0.pose = null; fl().train = ['xiali']; };

  Object.assign(H, {
    /* —— 五　边城 —— */
    async 入二五() { ch2(27); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = false; f.train = ['xiali', 'mule', 'tingxue']; },
    async 问路() {
      const p = W.player, x = W.byId.xiali, m = W.byId.mule, t = W.byId.tingxue, lb = W.byId.laobing; halt(); fl().train = null; p.path = null;
      const a = W.walk(x, 936, 752, { speed: 220, dir: 2 }); if (m) W.walk(m, 850, 762, { speed: 200 }).then(() => { m.dir = 3; m.side = 1; }); if (t) W.walk(t, 630, 846, { speed: 220, dir: 2 });
      await W.walk(p, 730, 800, { speed: 220, dir: 2 }); await a; if (x) x.dir = 2; W.focus = { x: 860, y: 700 }; if (lb) lb.dir = 3; await nap(0.3);
    },
    async 老兵转脸() { const lb = W.byId.laobing; if (lb) lb.dir = 0; await nap(0.5); },
    async 递酒() { const p = W.player, lb = W.byId.laobing; await W.walk(p, 786, 714, { speed: 200, dir: 2 }); JX.audio.sfx('pop'); if (lb) lb.carry = 'bowl'; await nap(0.4); },
    async 泼酒() { const lb = W.byId.laobing; if (lb) { lb.dir = 2; JX.audio.sfx('splash', 0.4); await nap(0.8); lb.carry = null; } },
    async 接着走() { W.focus = null; fl().train = ['xiali', 'mule', 'tingxue']; await nap(0.3); },
    async 听唱() { const p = W.player; halt(); p.path = null; p.dir = 2; W.focus = { x: 1180, y: 720 }; JX.audio.sfx('xian', 0.6); await nap(0.9); },
    async 放银子() { const x = W.byId.xiali; fl().train = null; halt(); if (x) { await W.walk(x, 1150, 716, { speed: 200, dir: 2 }); JX.audio.sfx('coin'); await nap(0.5); } },
    async 看锅() { const p = W.player; halt(); p.path = null; p.dir = 2; fl().train = null; const x = W.byId.xiali; if (x) W.walk(x, p.x + 90, p.y + 6, { speed: 220, dir: 2 }); W.focus = { x: 2150, y: 640 }; await nap(1.4); },
    async 问军士() { const b = W.byId.b4, p = W.player; if (b) b.dir = 0; W.focus = { x: (p.x + 2150) / 2, y: 680 }; await nap(0.3); },
    async 夏离先走() { const x = W.byId.xiali, m = W.byId.mule; W.focus = null; if (x) W.walk(x, 2420, 790, { speed: 190 }); if (m) W.walk(m, 2300, 800, { speed: 180 }); await nap(1.0); fl().train = ['tingxue']; },

    /* —— 六　郝先生的雁 —— */
    async 入二六() { ch2(28); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = false; f.train = null; const p = W.player; void p; },
    async 军士来打酒() {
      const p = W.player; p.x = 610; p.y = 704; p.dir = 0; p.carry = 'jar'; W.snapCam();
      const b = W.add('b9', 'bing', 1700, 760, { dir: 1, tag: '军士', solid: false, carry: 'bowl' });
      await W.walk(b, 700, 724, { speed: JX.auto ? 2000 : 230, straight: true }); b.dir = 1; p.dir = 3; JX.audio.sfx('pop'); await nap(0.4);
    },
    async 军士走() { const b = W.byId.b9, p = W.player; p.carry = null; if (b) W.walk(b, 1760, 760, { speed: 230, straight: true }).then(() => W.remove('b9')); await nap(0.6); },
    async 天擦黑() { fl().dusk = true; W.remove('shitou'); W.add('laojun', 'laojun', 2420, 652, { dir: 0, tag: '老军', carry: 'lantern' }); JX.audio.sfx('door', 0.6); const p = W.player; p.x = 1100; p.y = 780; p.dir = 3; W.snapCam(); },
    async 合符() { JX.audio.sfx('tick'); await cutSteps(drawToken, [[0, 0.34, 1.4, ['半根铜铸的雁翎，断口像锯齿。']], [0.34, 0.8, 1.8, ['老军看了很久。然后从怀里掏出一个布包，一层一层打开。', '里头是另外半根。']], [0.8, 1, 1.0, ['两半一碰，严丝合缝。']]]); },
    async 老军回门() { const l = W.byId.laojun; if (l) { l.dir = 2; await nap(0.5); l.alpha = 0; l.vis = false; JX.audio.sfx('door', 0.6); } const t = W.byId.tingxue, x = W.byId.xiali, p = W.player; if (t) { t.pose = null; t.carry = null; t.x = p.x - 150; t.y = p.y + 30; t.dir = 3; } if (x) { x.x = p.x - 80; x.y = p.y - 6; x.dir = 3; } await nap(0.3); },

    /* —— 七　柝声 —— */
    async 入二七() { ch2(29); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = true; f.train = ['xiali']; W.exitsOff['ying:guan'] = '先躲过巡更的。'; W.exitsOff['ying:out'] = '人还没见着，不能走。'; },
    async 可进门() { delete W.exitsOff['ying:guan']; },
    async 柝一来() { await duck(600, 850, 668); W.focus = { x: 640, y: 760 }; patrol([[1240, 706], [330, 706], [300, 664]], 5); await nap(1.2); },
    async 柝一去() { await patrolP; W.focus = null; await rise(); },
    async 柝二来() { await duck(1366, 850, 1432); W.focus = { x: 1300, y: 760 }; patrol([[420, 706], [960, 716], [1040, 756]], 5, true); await nap(1.2); },
    async 柝二添炭() { await patrolP; const g = W.byId.geng; if (g) g.dir = 1; JX.audio.sfx('tick', 0.8); await nap(0.9); },
    async 柝二去() { patrol([null, [1100, 716], [1216, 664]], 2); await patrolP; W.focus = null; await rise(); },
    async 柝三来() { await duck(2276, 850, 2340); W.focus = { x: 2380, y: 720 }; patrol([[1840, 706], [2500, 692], [2520, 668]], 5, true); await nap(1.2); },
    async 柝三停() { await patrolP; const g = W.byId.geng; if (g) g.dir = 2; for (let i = 0; i < 3; i++) { JX.audio.sfx('bang', 0.6); await nap(0.9); } },
    async 柝三去() { patrol([null, [2640, 704], [2780, 770]], 2); await patrolP; W.focus = null; await rise(); },

    /* —— 八　不走 —— */
    async 入二八() { ch2(30); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = true; f.train = null; W.blaze = 0; },
    async 夏离上前() { const x = W.byId.xiali, p = W.player; p.path = null; W.walk(p, 860, 838, { speed: 200, dir: 3 }); if (x) { await W.walk(x, 1180, 814, { speed: 190, dir: 2 }); x.dir = 2; } await nap(0.5); },
    async 跪() { const x = W.byId.xiali; if (x) x.pose = 'squat'; await nap(0.6); },
    async 郝经扶她() {
      const h = W.byId.haojing, x = W.byId.xiali; if (!h || !x) return;
      h.carry = null; await nap(0.4); await W.walk(h, 916, 700, { speed: 150, straight: true }); await W.walk(h, 1104, 814, { speed: 150, straight: true, dir: 3 }); h.dir = 3; await nap(0.3);
      x.pose = null; x.dir = 1; await nap(0.7);
      await W.walk(h, 1070, 814, { speed: 60, straight: true, dir: 3 }); h.dir = 3; await nap(0.25); h.pose = 'squat'; await nap(JX.auto ? 0.05 : 1.5); h.pose = null; await nap(0.3);
    },
    async 雁抬头() { const y = W.byId.yan; if (y) { JX.tween(0.5, q => { y.up = q; }); await nap(1.1); JX.tween(0.6, q => { y.up = 1 - q; }); await nap(0.5); } },
    async 取信() { const h = W.byId.haojing, x = W.byId.xiali; if (!h) return; await W.walk(h, 1090, 748, { speed: 150, straight: true, dir: 2 }); JX.audio.sfx('page'); await nap(0.6); h.carry = 'book'; await W.walk(h, 1096, 814, { speed: 150, straight: true, dir: 3 }); h.dir = 3; await nap(0.4); h.carry = null; if (x) x.carry = 'book'; JX.audio.sfx('page'); await nap(0.5); if (x) x.carry = null; },
    async 看惊蛰() { const h = W.byId.haojing, p = W.player; if (h) h.dir = 1; await W.walk(p, 950, 836, { speed: 180, dir: 3 }); await nap(0.4); },
    async 浩然诀得名() { fl().haoran = 1; JX.audio.sfx('gong'); UI.banner('浩然诀', '他那套“喘气的法子”，有了名字'); await nap(JX.auto ? 0.1 : 2.4); },
    async 雁叫() { const y = W.byId.yan; JX.audio.sfx('yan'); if (y) { JX.tween(0.3, q => { y.up = q; }); } await nap(0.9); },
    async 走水() { W.blaze = JX.time; W.focus = { x: 760, y: 560 }; JX.audio.sfx('gong', 0.5); await nap(1.2); },
    async 试玩到此三() {
      ST._endHtml = '<h2>试玩到此</h2><p>第二章《扬州慢》做到第八场：扬州城墙底下的一口大锅，真州营外那个会写“雁”字的孩子，三更的柝声，灯下不肯走的郝先生。</p><p>下一场是《走水》：有人放火，要趁乱杀掉使臣。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在馆舍里看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      W.blaze = 0; await H.试玩到此二();
    },
  });
})();
