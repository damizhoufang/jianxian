/* 第二章《扬州慢》的演出。接在 story.js 后面：往 JX.story.hooks 里添演出，JX.populate 外面再包一层。
   场次编号接着第一章往下：酒坛里的人 23、船上 24、惊蛰 25、水匪 26。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks;
  const { cutIn, cutBg, cutVig, fighters, giveUp, ch1 } = ST._h;
  const BOATS = { chuan: 1, chuanye: 1, chuanyu: 1, jiang: 1 };
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const fl = () => JX.state.flags;
  ST.alias('俘虏', 'shuifei');
  /* 第二章每一场开头：先照第一章的办法摆回平常的样子，再把这一章自己的几样状态清掉 */
  function ch2(stage) { const p = ch1(stage, false); W.flash = 0; W.raining = false; W.cooking = 0; W.blaze = 0; W.fireLv = 0; W.charred = 0; W.matFire = false; W.embers = false; W.dawn = 0; W.geese = 0; JX.state.flags.train = null; if (p) p.pose = null; return p; }
  const sit = { pose: 'sit', seat: 6 };                             // 席地坐在船板上

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop0 = JX.populate;
  JX.populate = function (id) {
    pop0(id);
    const sg = JX.state.stage, f = fl();
    if (id === 'matou') {
      W.add('agui', 'agui', 856, 794, { dir: 1, tag: '阿桂' });
      W.add('xiali', 'xiali', 1548, 688, { dir: 1, tag: '夏离', reach: 100 });
      W.add('shaogong', 'shaogong', 1300, 548, { dir: 3, solid: false, sy: 500 });            // 艄公站在船尾，等着开船
      W.add('k1', 'huoji', 262, 752, Object.assign({ dir: 2, solid: false }, sit, { seat: 30 })); W.add('k2', 'huoji', 344, 752, Object.assign({ dir: 2, solid: false }, sit, { seat: 30 }));      // 茶棚底下那两个
      /* 两个来回扛包的脚夫 */
      const loop = (e, pts, sp) => { let i = 0; const go = () => { if (W.byId[e.id] !== e || W.id !== 'matou') return; i = (i + 1) % pts.length; W.walk(e, pts[i][0], pts[i][1], { speed: sp, straight: true }).then(() => JX.sleep(0.5 + Math.random()).then(go)); }; go(); };
      loop(W.add('jf1', 'jiaofu', 240, 884, { dir: 3, solid: false, carry: 'sack' }), [[240, 884], [2240, 884]], 150);
      loop(W.add('jf2', 'jiaofu', 1330, 654, { dir: 1, solid: false, carry: 'sack' }), [[1330, 654], [470, 654]], 130);
    }
    if (!BOATS[id]) return;
    W.add('weng', { h: 150 }, 1262, 714, { open: sg > 23 || !!f.wengOpen, draw(g, e) { g.save(); g.translate(e.dx || 0, 0); P.jar(g, 0, 0, 1.75, { seed: 9, sealed: !e.open, text: '春' }); g.restore(); } });
    const sg0 = W.add('shaogong', 'shaogong', 336, 716, { dir: 1, tag: '艄公', bark: ['这条河，我摇了三十年船。', '顺风的日子少，靠的还是这一支桨。'] });
    if (id === 'chuan' && sg === 23) W.add('xiali', 'xiali', 1560, 764, { dir: 1, tag: '夏离' });
    if (id === 'chuan' && sg === 24) {
      W.add('xiali', 'xiali', 930, 712, Object.assign({ dir: 0, tag: '夏离', reach: 110 }, sit));
      W.add('zhang', { h: 20 }, 930, 747, { solid: false, draw(g) {                                   // 矮几上的账本和算盘
        g.fillStyle = '#efe6cc'; g.fillRect(-48, -62, 44, 15); g.strokeStyle = 'rgba(43,34,28,0.8)'; g.lineWidth = 1; g.strokeRect(-48, -62, 44, 15); P.line(g, -26, -62, -26, -47, 1, 'rgba(43,34,28,0.6)'); for (let i = 0; i < 3; i++) { P.line(g, -44, -58 + i * 4, -30, -58 + i * 4, 0.7, 'rgba(43,34,28,0.5)'); P.line(g, -22, -58 + i * 4, -8, -58 + i * 4, 0.7, 'rgba(43,34,28,0.5)'); }
        g.fillStyle = '#5a3a26'; g.fillRect(8, -62, 46, 16); g.strokeRect(8, -62, 46, 16); P.line(g, 8, -57, 54, -57, 1, '#2a1c14'); for (let i = 0; i < 7; i++) { P.ellipse(g, 13 + i * 6, -59.5, 2, 1.6, '#c9a24a'); P.ellipse(g, 13 + i * 6, -52, 2, 2, '#1e1410'); P.ellipse(g, 13 + i * 6, -48.6, 2, 2, '#1e1410'); }
      } });
      W.add('tingxue', 'tingxue', 424, 824, Object.assign({ dir: 3, tag: '听雪' }, sit));
    }
    if (id === 'chuanye') {
      sg0.pose = 'squat'; sg0.closed = true; sg0.bark = null; sg0.tag = null;
      W.add('xiali', 'xiali', 1900, 748, Object.assign({ dir: 3, tag: '夏离', reach: 120 }, sit));
    }
    if (id === 'chuanyu') { W.add('xiali', 'xiali', 1064, 708, { dir: 0, tag: '夏离' }); W.add('tingxue', 'tingxue', 806, 708, { dir: 0, tag: '听雪' }); }
    if (id === 'jiang') W.add('xiali', 'xiali', 900, 786, { dir: 3, tag: '夏离' });
  };

  /* ---------- 特写 ---------- */
  /* 那口大瓮的封泥，自己从里头顶开了 */
  function drawPop(c, k) {
    cutBg(c, '#5a4636', '#2e2420');
    for (let i = 0; i < 5; i++) { c.save(); c.globalAlpha = 0.5 - i * 0.07; c.translate(120 + i * 250, 250 + (i % 2) * 30); P.jar(c, 0, 400, 2.4, { seed: 20 + i, text: '酒' }); c.restore(); }
    c.fillStyle = 'rgba(8,6,5,0.5)'; c.fillRect(0, 0, 1300, 640);
    const gl = c.createRadialGradient(650, 220, 20, 650, 320, 520); gl.addColorStop(0, 'rgba(255,214,150,0.36)'); gl.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = gl; c.fillRect(0, 0, 1300, 640);
    const MY = 1040 - 84 * 7.4;                                      // 瓮口的高度
    const up = Math.max(0, (k - 0.5) / 0.5), hand = Math.max(0, Math.min(1, (k - 0.22) / 0.16));
    /* 从瓮口冒出来的：两条缠红绳的辫子、一个脑袋顶（画在瓮身后面，被瓮口挡住下半） */
    if (up > 0) {
      c.save(); c.beginPath(); c.rect(0, 0, 1300, MY + 6); c.clip();
      const y = MY + 150 - up * 262;
      c.fillStyle = '#f9e0d0'; c.beginPath(); c.ellipse(650, y + 40, 84, 80, 0, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(43,34,28,0.85)'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#2a201b'; c.beginPath(); c.moveTo(560, y + 36); c.bezierCurveTo(552, y - 70, 748, y - 70, 740, y + 36); c.lineTo(722, y + 2); c.quadraticCurveTo(650, y - 30, 578, y + 2); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(650, y - 46, 40, 26, 0, 0, 6.3); c.fill(); c.stroke();
      [-1, 1].forEach(s => { c.strokeStyle = '#2a201b'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(650 + s * 92, y + 20); c.quadraticCurveTo(650 + s * 108, y + 90, 650 + s * 100, y + 170); c.stroke(); c.strokeStyle = '#b8362a'; c.lineWidth = 7; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(650 + s * 88, y + 52 + i * 40); c.lineTo(650 + s * 116, y + 62 + i * 40); c.stroke(); } });
      c.lineCap = 'butt';
      P.ellipse(c, 618, y + 44, 8, 11, '#1a1310'); P.ellipse(c, 682, y + 44, 8, 11, '#1a1310'); P.ellipse(c, 600, y + 66, 16, 10, 'rgba(214,110,96,0.4)'); P.ellipse(c, 700, y + 66, 16, 10, 'rgba(214,110,96,0.4)');
      c.restore();
    }
    c.save(); c.translate(650, 1040); P.jar(c, 0, 0, 7.4, { seed: 9, sealed: false, text: '春' }); c.restore();
    /* 扒着瓮沿的一只手 */
    if (hand > 0) { c.save(); c.globalAlpha = hand; c.translate(560, MY + 4); for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(-34 + i * 17, -30, 15, 40, 7); c.fillStyle = i % 2 ? '#f0d2bc' : '#f9e0d0'; c.fill(); c.strokeStyle = 'rgba(43,34,28,0.8)'; c.lineWidth = 2; c.stroke(); } c.restore(); }
    /* 封泥：先裂一道缝，再整块掀到一边 */
    const a = -Math.min(1, k / 0.45) * 1.25, sl = Math.min(1, k / 0.45);
    c.save(); c.translate(650 + 118 + sl * 64, MY + 2); c.rotate(-a * 0.9); c.translate(-118, 0);
    c.beginPath(); c.moveTo(-138, 0); c.bezierCurveTo(-146, -124, 146, -124, 138, 0); c.quadraticCurveTo(0, 34, -138, 0); c.closePath();
    c.fillStyle = P.hgrad(c, -140, 0, 280, [[0, '#8b7453'], [0.35, '#d2b88c'], [1, '#735e42']]); c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 4; c.stroke();
    c.fillStyle = '#b5382a'; c.fillRect(-26, -100, 52, 92); P.vtext(c, '春', 0, -92, 46, '#1e1410', '600');
    c.strokeStyle = '#2a1c14'; c.lineWidth = 3 + sl * 3; c.beginPath(); c.moveTo(-60, -112); c.lineTo(-40, -70); c.lineTo(-56, -40); c.lineTo(-36, 6); c.stroke();
    c.restore();
    c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.5; c.fillStyle = c.createPattern(P.grainTile(), 'repeat'); c.fillRect(0, 0, 1300, 640); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    cutVig(c);
  }
  /* 酒刀：七寸残刃，断口是齐的。头一滴雨落在刀身上，成了一缕白气 */
  function drawKnife(c, k) {
    cutBg(c, '#55616a', '#252c33');
    c.strokeStyle = 'rgba(220,232,238,' + (0.12 * Math.max(0, Math.min(1, (k - 0.4) / 0.3))) + ')'; c.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = (i * 97.3) % 1300, y = (i * 53.7) % 640; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 14, y + 64); c.stroke(); }
    const hot = k < 0.25 ? k / 0.25 : Math.min(1, Math.max(0, 1 - (k - 0.55) / 0.4)), u = Math.max(0, (k - 0.5) / 0.5);      // 0–0.25 烫起来；0.25–0.5 雨点落下；0.5–1 白气升上去，刀凉回去
    c.save(); c.translate(600, 350); c.rotate(-0.1);
    c.fillStyle = '#4b3525'; c.fillRect(-470, -30, 252, 60); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.strokeRect(-470, -30, 252, 60);
    for (let i = 0; i < 11; i++) { c.strokeStyle = '#c8b48a'; c.lineWidth = 7; c.beginPath(); c.moveTo(-460 + i * 22, -30); c.lineTo(-444 + i * 22, 30); c.stroke(); }
    c.strokeStyle = '#a8322a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-470, 0); c.quadraticCurveTo(-520, 30, -508, 90); c.stroke(); for (let i = 0; i < 5; i++) P.line(c, -508, 90, -522 + i * 7, 150, 3, '#b8362a');
    c.fillStyle = '#3a2a1e'; c.fillRect(-222, -40, 26, 80); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.strokeRect(-222, -40, 26, 80);
    c.fillStyle = P.vgrad(c, 0, -28, 56, [[0, '#e9eef0'], [0.45, '#aab3b6'], [0.55, '#7c868a'], [1, '#c5cdd0']]); c.beginPath(); c.moveTo(-196, -27); c.lineTo(330, -29); c.lineTo(330, 29); c.lineTo(-196, 25); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-190, -15); c.lineTo(322, -17); c.stroke();
    c.strokeStyle = 'rgba(40,46,50,0.5)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(330, -27 + i * 11); c.lineTo(323 - (i % 2) * 6, -22 + i * 11); c.stroke(); }
    if (hot > 0) { c.fillStyle = 'rgba(255,168,88,' + (0.3 * hot) + ')'; c.beginPath(); c.moveTo(-196, -27); c.lineTo(330, -29); c.lineTo(330, 29); c.lineTo(-196, 25); c.closePath(); c.fill(); }
    /* 雨点落下来；落到刀上，一缕白气 */
    if (k >= 0.25 && k < 0.5) { const y = -300 + ((k - 0.25) / 0.25) * 274; c.fillStyle = 'rgba(226,238,244,0.9)'; c.beginPath(); c.moveTo(96, y - 22); c.quadraticCurveTo(106, y, 96, y + 6); c.quadraticCurveTo(86, y, 96, y - 22); c.fill(); }
    else if (k >= 0.5) for (let i = 0; i < 22; i++) { const q = i / 21, yy = -30 - q * 250 * Math.min(1, u * 1.6), xx = 96 + Math.sin(q * 5 + u * 3) * 26 * q; c.fillStyle = 'rgba(246,248,250,' + (0.34 * (1 - q) * (1 - u * 0.75)) + ')'; c.beginPath(); c.ellipse(xx, yy, 10 + q * 22, 8 + q * 16, 0, 0, 6.3); c.fill(); }
    c.restore();
    c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.5; c.fillStyle = c.createPattern(P.grainTile(), 'repeat'); c.fillRect(0, 0, 1300, 640); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    cutVig(c);
  }
  ST._drawPop = drawPop; ST._drawKnife = drawKnife;
  /* 分几步演的特写：每一步有自己的一段动作和几句旁白，旁白说到哪，画面演到哪 */
  async function cutSteps(draw, steps) {
    const box = UI.root().appendChild(JX.el('div', '', '<canvas width="1300" height="640"></canvas>')); box.id = 'cut';
    const c = box.firstChild.getContext('2d'); draw(c, steps[0][0]); void box.offsetWidth; box.style.opacity = 1;
    await JX.sleep(JX.auto ? 0.05 : 0.8);
    for (const [k0, k1, sec, lines] of steps) { JX.tween(JX.auto ? 0.05 : sec, q => draw(c, k0 + (k1 - k0) * q), JX.ease.out); for (const t of lines) await UI.narrate(t); }
    box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.7); box.remove();
  }

  ST._h.cutSteps = cutSteps; ST._h.ch2 = ch2;
  /* ---------- 小动作 ---------- */
  /* 一个人划一道弧落到某处（跳出瓮、被丢下水都用它） */
  const arc = (e, tx, ty, h, sec) => { const x0 = e.x, y0 = e.y, z0 = e.z || 0; return JX.tween(JX.auto ? 0.03 : sec, q => { e.x = x0 + (tx - x0) * q; e.y = y0 + (ty - y0) * q; e.z = z0 * (1 - q) + Math.sin(q * Math.PI) * h; }).then(() => { e.z = 0; }); };
  /* 水花：一圈一圈散开 */
  function splash(x, y) {
    JX.audio.sfx('splash');
    const id = 'sp' + Math.round(x) + Math.round(JX.time * 100), e = W.add(id, { h: 2 }, x, y, { solid: false, k: 0, sy: 3000, draw(g, me) { for (let i = 0; i < 3; i++) { const u = Math.min(1, me.k * 1.4 - i * 0.18); if (u <= 0) continue; g.strokeStyle = 'rgba(236,244,250,' + (0.8 * (1 - u)) + ')'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(0, 0, 14 + u * 70, 5 + u * 20, 0, 0, 6.3); g.stroke(); } for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.15 + i * 0.117), r = me.k * 90; g.fillStyle = 'rgba(236,244,250,' + (0.9 * (1 - me.k)) + ')'; g.beginPath(); g.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r - 10 + me.k * me.k * 70, 3.2, 0, 6.3); g.fill(); } } });
    JX.tween(JX.auto ? 0.03 : 0.9, q => { e.k = q; }, q => q).then(() => W.remove(id));
  }
  /* 把一个人送下水：越过近舷，落进水里 */
  async function overboard(e) { e.pose = null; e.carry = null; await arc(e, e.x + 70, 986, 150, 0.5); e.vis = false; splash(e.x, 1002); await nap(0.35); }
  /* 没点灯的小船 */
  const skiff = (id, x) => W.add(id, { h: 30 }, x, 1048, { solid: false, sy: 2500, draw(g) { g.save(); g.translate(0, Math.sin(JX.time * 1.6 + x) * 2); g.fillStyle = 'rgba(6,10,22,0.5)'; g.beginPath(); g.ellipse(0, 8, 170, 12, 0, 0, 6.3); g.fill(); JX.scenes7.sideBoat(g, 0, 0, 320, { col: '#0e121c', awn: false }); g.restore(); } });

  /* ---------- 演出 ---------- */
  Object.assign(H, {
    /* —— 第二章·一 酒坛里的人 —— */
    async 入二一() { ch2(23); const f = fl(); f.wengOpen = false; f.tx = 0; W.exitsOff['matou:board'] = '先同阿桂交接，再去找夏离'; },
    async 看茶棚() { W.focus = { x: 520, y: 760 }; await nap(1.1); },
    async 收镜头() { W.focus = null; await nap(0.4); },
    async 可上船() { delete W.exitsOff['matou:board']; },
    async 开船() { JX.audio.sfx('splash'); await nap(0.5); },
    async 咚() { const w = W.byId.weng; JX.audio.sfx('bang', 0.8); if (w) await JX.tween(JX.auto ? 0.03 : 0.34, q => { w.dx = Math.sin(q * 22) * 4 * (1 - q); }); if (w) w.dx = 0; await nap(0.3); },
    async 顶封泥() {
      const p = W.player, x = W.byId.xiali, w = W.byId.weng; p.path = null;
      JX.audio.sfx('pop'); await cutSteps(drawPop, [[0, 0.5, 1.6, ['封泥自己裂开了。先是一道缝，再是一只手。']], [0.5, 1, 1.3, ['然后是两条缠着红绳的辫子。']]]);
      if (w) w.open = true; fl().wengOpen = true;
      const a = W.walk(p, 1096, 806, { speed: 230, dir: 3 }); if (x) W.walk(x, 1400, 800, { speed: 230, dir: 1 }); await a;
      const t = W.add('tingxue', 'tingxue', 1262, 712, { dir: 0, tag: '听雪', solid: false, z: 62 });      // 先只露出半个人：站在瓮里（排在瓮的后头画，下半身被瓮挡住）
      void t; await nap(0.3);
    },
    async 听雪出坛() { const t = W.byId.tingxue; if (!t) return; JX.audio.sfx('page'); t.carry = 'jar'; await arc(t, 1226, 802, 120, 0.5); t.dir = 0; t.solid = true; await nap(0.3); },
    async 听雪入队() { fl().tx = 1; JX.audio.sfx('gong'); UI.banner('耶律听雪　入队', '保镖 · 一天抵一百只碗'); await nap(2.2); },
    /* —— 第二章·二 船上 —— */
    async 入二二() { ch2(24); const f = fl(); f.wengOpen = true; f.tx = 1; },
    async 站到几旁() { const p = W.player; await W.walk(p, 1040, 770, { speed: 220, dir: 1 }); },      // 别站在她正前头把人挡住
    async 船头站定() { const p = W.player; await W.walk(p, 1776, 776, { speed: 200, dir: 3 }); },
    async 拨算盘() { for (let i = 0; i < 5; i++) { JX.audio.sfx('tick', 0.7); await nap(0.13); } await nap(0.3); },
    async 下厨() { const p = W.player; p.dir = 2; W.cooking = JX.time; for (let i = 0; i < 4; i++) { JX.audio.sfx('tick', 0.8); await nap(0.2); } await nap(0.4); },
    async 开饭() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue, s = W.byId.shaogong; W.cooking = 0; W.remove('zhang');
      const seat = (e, px, py, dir) => { if (!e) return; e.path = null; e.x = px; e.y = py; e.dir = dir; e.pose = 'sit'; e.seat = 6; e.carry = 'bowl'; };
      seat(t, 600, 796, 3); seat(x, 770, 800, 1); seat(p, 684, 862, 2); if (s) s.carry = 'bowl';
      W.focus = { x: 700, y: 770 }; W.camSnap = true;
    },
    /* 饭后：碗收了；夏离走到船头去看水，听雪跟着晃过去，阿蛰站到桅下 */
    async 收碗() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue, s = W.byId.shaogong;
      [p, x, t].forEach(e => { if (e) { e.pose = null; e.carry = null; } }); if (s) s.carry = null;
      W.focus = { x: 1560, y: 740 };
      const a = x ? W.walk(x, 1740, 772, { speed: 260, dir: 3 }) : null; W.walk(p, 1330, 836, { speed: 240, dir: 3 }); if (t) await W.walk(t, 1540, 800, { speed: 280, dir: 3 }); await a;
    },
    async 摔跤一() { const x = W.byId.xiali, t = W.byId.tingxue; if (!x || !t) return; x.dir = 1; JX.audio.sfx('page'); await W.walk(t, 1672, 774, { speed: 520, straight: true, dir: 3 }); await JX.tween(JX.auto ? 0.03 : 0.16, q => { x.x = 1740 + 26 * q; }); await nap(0.3); },
    async 摔跤二() {
      const x = W.byId.xiali, t = W.byId.tingxue; if (!x || !t) return; const x0 = x.x, t0 = t.x;
      t.x = t0 + 30; const f0 = W.focus;
      await JX.tween(JX.auto ? 0.03 : 2.2, q => { const s = Math.sin(q * Math.PI * 5) * 22 * (1 - q * 0.3); x.x = x0 + s; t.x = t0 + 30 + s; W.focus = { x: 1560, y: 740 + Math.sin(q * Math.PI * 10) * 5 }; if (!JX.auto && Math.floor(q * 10) !== Math.floor((q - 0.02) * 10)) JX.audio.sfx('tick', 0.6); }, q => q);
      W.focus = f0; x.x = x0; t.x = t0 + 30;
    },
    async 摔跤三() { const x = W.byId.xiali, t = W.byId.tingxue; if (!x || !t) return; JX.audio.sfx('pop'); x.pose = 'squat'; t.pose = 'squat'; x.x += 24; t.x -= 24; x.dir = 1; t.dir = 3; await nap(0.7); },
    async 入夜() { const p = W.player; p.carry = 'cup'; W.focus = null; },
    /* 她问完那一句，他接什么：三样都往下走，只是她答得不一样（记在 flags.xl 里） */
    async 夜话() {
      const p = W.player, f = fl();
      const k = await UI.choice('这时候，他——', ['“掌柜的见过？”', '什么也不问，把手里那半盏酒递过去', '“北边的月亮，也这么大么？”'], { auto: 1, top: 520 });
      if (k === 0) { f.xl = 1; await UI.say('xiali', '夏离', '见过。', 'normal'); await UI.narrate('她只说了两个字。过了一会儿，又添了一句。'); await UI.say('xiali', '夏离', '骑马的人里，也有不想来的。', 'normal'); }
      else if (k === 1) { f.xl = 2; p.carry = null; const x = W.byId.xiali; if (x) x.carry = 'cup'; await UI.narrate('他没有问。把手里那半盏酒递了过去。'); await UI.narrate('她接了，喝了一口，呛住了。'); await UI.say('xiali', '夏离', '……这是什么？', 'surprise'); await UI.say('jingzhe', '陆惊蛰', '三十年的蓬莱春。坛底剩的。', 'grin'); await UI.say('xiali', '夏离', '……好酒。', 'smile'); }
      else { f.xl = 1; await UI.say('xiali', '夏离', '大。', 'normal'); await UI.narrate('她停了一下。'); await UI.say('xiali', '夏离', '那边没有这么多屋檐。月亮出来，就是一整个。', 'normal'); }
    },
    /* —— 第二章·三 惊蛰 —— */
    async 入二三() { ch2(25); const f = fl(); f.wengOpen = true; f.tx = 1; },
    async 头一声雷() { W.flash = JX.time; JX.audio.sfx('lei'); await nap(1.3); },
    async 看酒刀() { await cutSteps(drawKnife, [[0, 0.25, 1.2, ['是那把开酒坛的刀。七寸长的一截残刃，断口齐齐的，跟了他十一年，一向是凉的。', '这一下，烫得他差一点叫出声来。']], [0.25, 1, 3.2, ['头一滴雨落在刀身上，“嗤”的一声，成了一缕白气。', '只一下。雷声滚远了，它又凉了回去，像什么事也没有。']]]); },
    async 落雨() { W.initParts('rain'); W.raining = true; JX.audio.amb('yu', 0.5); const x = W.byId.xiali, t = W.byId.tingxue; if (x) x.dir = 0; if (t) t.dir = 0; await nap(0.9); },
    async 擀面() { const p = W.player; p.dir = 2; W.cooking = JX.time; for (let i = 0; i < 5; i++) { JX.audio.sfx('tick', 0.7); await nap(0.22); } await nap(0.4); },
    async 舱口吃面() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue, s = W.byId.shaogong; W.cooking = 0;
      const seat = (e, px, py, dir, carry) => { if (!e) return; e.path = null; e.x = px; e.y = py; e.dir = dir; e.pose = 'sit'; e.seat = 6; e.carry = carry || null; };
      seat(x, 1040, 744, 1); seat(t, 820, 744, 3, 'bowl'); seat(p, 930, 808, 2); if (s) s.carry = 'bowl';
      W.add('mian', { h: 20 }, 930, 747, { solid: false, draw(g) { [[-30, -56], [30, -56], [0, -42]].forEach(([bx, by]) => { g.fillStyle = '#e8eef0'; g.beginPath(); g.ellipse(bx, by, 15, 6.5, 0, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.85)'; g.lineWidth = 1.1; g.stroke(); g.fillStyle = '#3f6fa0'; g.fillRect(bx - 12, by + 1, 24, 1.6); P.ellipse(g, bx, by - 1.4, 11.6, 4.2, '#efe2b8'); P.ellipse(g, bx + 2, by - 2, 5.4, 3, '#fbf7ea', 'rgba(120,100,60,0.5)', 0.6); P.ellipse(g, bx + 2.6, by - 2.2, 2.2, 1.5, '#f0b23a'); }); } });
      W.add('liri', { h: 10 }, 1024, 822, { solid: false, sy: 800, draw(g) { g.save(); g.rotate(-0.12); g.fillStyle = '#e9ddc4'; g.fillRect(-20, -9, 40, 16); g.strokeStyle = 'rgba(43,34,28,0.85)'; g.lineWidth = 1; g.strokeRect(-20, -9, 40, 16); P.line(g, 0, -9, 0, 7, 1, 'rgba(43,34,28,0.6)'); g.fillStyle = '#a8322a'; g.fillRect(4, -6, 4, 9); for (let i = 0; i < 3; i++) P.line(g, -16, -5 + i * 4, -4, -5 + i * 4, 0.7, 'rgba(43,34,28,0.5)'); g.restore(); } });
      W.focus = { x: 930, y: 760 }; W.zoom = 1.2; W.camSnap = true;
    },
    async 拨蛋() { const t = W.byId.tingxue; JX.audio.sfx('pop'); if (t) t.carry = null; await nap(0.7); },
    async 远雷() { W.flash = JX.time; JX.audio.sfx('lei', 0.35); await nap(1.2); },
    /* —— 第二章·四 水匪 —— */
    async 入二四() { ch2(26); const f = fl(); f.wengOpen = true; f.tx = 1; },
    async 听雪出舱() { JX.audio.sfx('door'); W.add('tingxue', 'tingxue', 1330, 742, { dir: 1, tag: '听雪' }); await nap(0.5); },
    async 搭钩() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue;
      const a = skiff('sk1', -260), b = skiff('sk2', -640);
      W.focus = { x: 1180, y: 760 };
      W.walk(b, 1000, 1048, { speed: 520, straight: true }); await W.walk(a, 1520, 1048, { speed: 560, straight: true });
      JX.audio.sfx('bang'); await nap(0.25); JX.audio.sfx('bang'); await nap(0.3);
      p.carry = 'pole'; W.walk(p, 1040, 800, { speed: 260, dir: 3 }); if (x) W.walk(x, 960, 730, { speed: 260, dir: 3 }).then(() => { x.carry = 'saber'; }); if (t) W.walk(t, 968, 866, { speed: 280, dir: 3 });
      const ws = SPOT.map((s, i) => { const e = W.add('sf' + (i + 1), 'shuifei', s[0] + (i % 2 ? 60 : -40), 930, { dir: 1, solid: false, carry: 'blade', z: -60, alpha: 0 }); return JX.sleep(JX.auto ? 0.01 : i * 0.16).then(() => { e.alpha = 1; return arc(e, s[0], s[1], 110, 0.45); }).then(() => { e.dir = 1; }); });
      await Promise.all(ws); await nap(0.4);
    },
    /* 三个人打五个。竹篙一扫，面前的都站不稳；站不稳的，听雪一掌就送下水。剩最后一个，他自己就跪了。 */
    async 战水匪() {
      const B = JX.battle, p = W.player, x = W.byId.xiali, t = W.byId.tingxue || W.add('tingxue', 'tingxue', 968, 866, { dir: 3, tag: '听雪' }), NM = ['水匪甲', '水匪乙', '水匪丙', '水匪丁', '水匪戊'];
      const es = SPOT.map((s, i) => W.byId['sf' + (i + 1)] || W.add('sf' + (i + 1), 'shuifei', s[0], s[1], { dir: 1, solid: false, carry: 'blade' }));
      const me = (b, pool) => pool.find(u => u.key === 'jingzhe') || pool[0];      // 他们要的是他怀里的东西：刀都冲着他去
      const kuai = { name: '快刀', tell: '刀尖朝前——冲着阿蛰递过来，快', type: 'light', pow: 1, pick: me }, pi = { name: '重劈', tell: '刀举过了头——冲着阿蛰劈下来，重', type: 'heavy', pow: 1.8, delay: 1.2, pick: me };
      const place = () => {
        p.x = 1040; p.y = 800; p.dir = 3; p.pose = null; p.carry = 'pole'; p.path = null;
        x.x = 960; x.y = 730; x.dir = 3; x.pose = null; x.carry = 'saber'; x.path = null; t.x = 968; t.y = 866; t.dir = 3; t.pose = null; t.carry = null; t.path = null;
        es.forEach((e, i) => { e.x = SPOT[i][0]; e.y = SPOT[i][1]; e.dir = 1; e.vis = true; e.alpha = 1; e.z = 0; e.pose = null; e.carry = 'blade'; });
      };
      const foes = b => b.units.filter(q => q.side === 'foe' && q.hp > 0);
      const rec = (b, u) => {
        const wob = foes(b).filter(q => q.stun > 0);
        if (u.key === 'jingzhe') return wob.length ? { pick: 'dian', target: wob[wob.length - 1].key, hint: '有人站不稳——篙尖补一下。' } : { pick: 'sao', hint: '竹篙横扫——把他们扫得站不稳，听雪才送得下水。' };
        if (u.key === 'tingxue') return wob.length ? { pick: 'tui', target: wob[0].key, hint: '他站不稳——一掌送他下水！' } : { pick: 'tui', hint: '他们都站稳了，这一掌先打着。等竹篙再扫。' };
        return wob.length ? { pick: 'zhan', target: wob[wob.length - 1].key, hint: '趁他站不稳，一刀下去。' } : { pick: 'zhan', hint: '一刀下去，实打实。' };
      };
      for (let lost = 0; ;) {
        place();
        const team = fighters(p, x);
        team[0].cmds[0] = Object.assign({}, team[0].cmds[0], { name: '竹篙·点', desc: '篙尖专点手腕、脚踝。出手快，下一手来得早。' });
        team[0].cmds[1] = Object.assign({}, team[0].cmds[1], { name: '竹篙·扫', desc: '竹篙贴着船板横扫过去，面前的人都要晃两晃——站不稳的，听雪一掌就送得下水。出手慢。' });
        team.push({ ent: t, key: 'tingxue', name: '耶律听雪', hp: 110, spd: 12, atk: 24, def: 5, season: 3, cmds: [
          { id: 'tui', name: '绵掌·推', kind: 'attack', type: 'light', pow: 0.9, desc: '一掌按在胸口，劲是往外送的。对面要是正站不稳，这一掌就送他下水。' },
          { id: 'shan', name: '闪', kind: 'dodge', desc: '身子一矮，从刀底下钻过去。重手和擒拿都躲得开；快手只能躲开一半。' }] });
        const r = await B.run({
          goal: '竹篙扫得他们站不稳，听雪一掌一个送下水', music: 'jiaofeng', season: 3, seasonEvery: 5, zoom: 1.08, focus: { x: 1230, y: 730 },
          allies: team,
          foes: es.map((e, i) => ({ ent: e, key: 'sf' + (i + 1), name: NM[i], hp: 84, spd: 10 - i * 0.5, atk: 15, def: 2, keep: true, n: i, ai: (b, u) => (++u.n % 3 === 0 ? pi : kuai) })),
          allow: rec,
          autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id); },
          resolve(b, a, m, tg, r2) {
            if (a.key === 'jingzhe' && m.id === 'sao' && tg.side === 'foe') { tg.stun = Math.max(tg.stun, 2); tg.note = '站不稳'; }
            if (a.key === 'tingxue' && m.id === 'tui' && tg.side === 'foe' && tg.stun > 0) return { evade: false, block: false, dmg: tg.hp };      // 站不稳的，一掌送下水
            return r2;
          },
          end(b) { return foes(b).length <= 1 ? 'win' : b.units.find(q => q.key === 'jingzhe').hp <= 0 ? 'lose' : null; },      // 剩最后一个，他自己把刀扔了；阿蛰倒了就算输（东西在他身上）
          async after(b, u) {
            for (const q of b.units) if (q.side === 'foe') {
              if (q.hp <= 0 && !q.gone) { q.gone = true; B.fx.floater(q, '下水！', '#bfe3d0'); await overboard(q.ent); b.wet = (b.wet || 0) + 1; }
              else if (!q.stun && q.note) q.note = '';
            }
            if (b.wet === 1 && !b.said1) { b.said1 = true; await B.talk(async () => { await UI.say('tingxue', '耶律听雪', '一个！', 'grin'); }); }
          },
        });
        if (r.result === 'win') break;
        await UI.narrate('刀背砸在肩上，眼前一黑——不对，这一场还没完，再来。');
        if (await giveUp(++lost)) break;
        await UI.tutorial('再来一次', '他们的刀都冲着阿蛰来，阿蛰倒了就算输。<br>阿蛰先用<b>竹篙·扫</b>：面前的人都会<b>站不稳</b>，刀也递不出来。<br>趁他们站不稳，听雪的<b>绵掌·推</b>一掌送一个下水，夏离的刀也砍得更重。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令和该打的人身上，照着按回车就行。');
      }
      /* 收场：四个在水里，剩下那一个被听雪一只手按在船板上 */
      const live = es.filter(e => e.vis !== false), cap = live[live.length - 1] || es[4];
      es.forEach(e => { if (e !== cap) e.vis = false; });
      cap.vis = true; cap.alpha = 1; cap.z = 0; cap.x = 1300; cap.y = 806; cap.pose = 'squat'; cap.carry = null; cap.dir = 1; W.byId.cap = cap;
      t.x = 1366; t.y = 812; t.dir = 1; t.pose = null; x.x = 1216; x.y = 762; x.dir = 3; x.carry = 'saber'; p.x = 1170; p.y = 836; p.dir = 3; p.carry = 'pole';
      W.focus = { x: 1260, y: 760 }; W.camSnap = true; await nap(0.5);
    },
    async 丢下水() { const c = W.byId.cap, t = W.byId.tingxue; if (!c) return; JX.audio.sfx('page'); c.pose = null; c.z = 30; await nap(0.25); await overboard(c); if (t) t.dir = 0; W.byId.cap = null; await nap(0.3); },
    async 看对岸() { W.focus = { x: 1960, y: 640 }; await nap(1.6); },
    /* 做到哪里，就在哪里停 */
    async 试玩到此二() {
      ST.save();
      UI.modal++; UI.purse(null); UI.objective(null); W.objective = null;
      const box = UI.root().appendChild(JX.el('div', 'panel')); box.id = 'end';
      box.innerHTML = ST._endHtml || '<h2>试玩到此</h2><p>序章《青玉案》、第一章《钗头凤》都做完了；第二章《扬州慢》做到第四场：听雪从酒坛里钻出来入了队，船过平江那天打了头一声春雷，镇江江面上有人出钱，只要那一根雁翎。</p><p>下一场是《边城》：过了瓜洲，是扬州。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在船上看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      const a = await new Promise(res => { box.onclick = e => { const b = e.target.closest('[data-a]'); if (b) res(b.dataset.a); }; if (JX.auto) res('stay'); const hs = JX._upd = JX._upd || [], born = JX.time; const tick = () => { if (UI.menuOpen()) return; if (JX.time - born < 0.8) { JX.input.eat('confirm'); return; } if (JX.input.hit('confirm')) { hs.splice(hs.indexOf(tick), 1); res('stay'); } }; hs.push(tick); });
      box.remove(); UI.modal--;
      if (a === 'title') { location.reload(); return; }
      const p = W.player; if (p) { p.path = null; p.carry = null; }
      W.focus = null; W.locked = false; UI.purse(JX.state.money); UI.roam(true); JX.ended = true;
      await UI.fade(0, JX.auto ? 0.05 : 1.2);
    },
  });
  const SPOT = [[1360, 736], [1450, 800], [1360, 862], [1530, 740], [1540, 856]];
})();
