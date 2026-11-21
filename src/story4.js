/* 第四章《望海潮》的演出（一）：多一双筷子 47、前夜 48、四样都齐了 49、忆四·伪书 50。接在 story3c.js 后面。
   第一场里有一场四个人一起打的战斗（后巷），四个人各出过一回手以后使合击“四时俱全”；五月、六月、七月三段过场用 flags.v4 记着演到哪一段
  （同一个场景、同一场里人站的地方不一样）。方向：dir 0 朝下（脸对着我们），1 朝左，2 朝上（背对着我们），3 朝右。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks, Fig = JX.Fig;
  const { fighters, giveUp, cutIn, cutBg, cutVig, ch3, XL } = ST._h;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const tw = (s, f, e) => JX.tween(JX.auto ? 0.02 : s, f, e);
  const fl = () => JX.state.flags;
  const fast = v => (JX.auto ? 2400 : v);
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';
  const say = (id, name, text, mood) => UI.say(id, name, text, mood || 'normal');
  ST.alias('打手头目', 'dashou');
  /* 第四章每一场开头：照第三章的办法摆回平常的样子，再把这一章要的几样旗标设全（跳场是直接从这里开始的） */
  function ch4(stage) { const p = ch3(stage, 1), f = fl(); f.qsIn = 1; f.sishi = 1; f.train = null; W.lingN = 0; if (p) p.carry = null; return p; }
  ST._h.ch4 = ch4;
  const halt = () => (fl().train || []).forEach(id => { const e = W.byId[id]; if (e) { e.path = null; e.moving = false; } });
  const TRAIN = ['xiali', 'tingxue', 'qiushui'];

  /* ---------- 自己画的几样 ---------- */
  /* 掉在地上的那册文书 */
  function drawWenshu(g) { g.save(); g.rotate(-0.2); P.shadow(g, 0, 2, 22, 6, 0.3); g.fillStyle = '#efe6cc'; g.fillRect(-20, -8, 40, 14); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.strokeRect(-20, -8, 40, 14); g.fillStyle = '#b5302a'; g.fillRect(6, -6, 9, 9); g.restore(); }
  /* 后巷门边的泔水桶 */
  function drawSwill(g) {
    P.shadow(g, 0, 0, 44, 11, 0.42); g.fillStyle = P.hgrad(g, -34, 0, 68, [[0, '#4f3a28'], [0.5, '#7a5a3e'], [1, '#4a3626']]); g.beginPath(); g.moveTo(-30, -70); g.lineTo(30, -70); g.lineTo(36, 0); g.lineTo(-36, 0); g.closePath(); g.fill(); g.strokeStyle = INK(0.9); g.lineWidth = 1.8; g.stroke();
    P.line(g, -32, -52, 32, -52, 3, '#2e2a26'); P.line(g, -35, -16, 35, -16, 3, '#2e2a26'); P.ellipse(g, 0, -70, 30, 9, '#5d5a3c', INK(0.9), 1.6); P.ellipse(g, -8, -71, 8, 3, '#8a8660');
  }
  /* 听雪：举着论潮的号牌（e.pai 是举起来没有） */
  function drawPai(g, e) {
    const idle = e.moving ? 0 : Math.sin(JX.time * 1.1 + 2);
    Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, pose: e.pose, idle, shadow: true });
    if (!e.pai) return;
    const sx = e.dir === 1 ? -1 : 1; g.save(); g.scale(sx, 1); P.line(g, 22, -78, 30, -150, 4, '#6a4a30'); g.fillStyle = '#c9a66a'; g.fillRect(8, -206, 46, 58); g.strokeStyle = INK(); g.lineWidth = 1.6; g.strokeRect(8, -206, 46, 58); g.restore();
    g.fillStyle = '#3a1c14'; g.font = '600 36px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('七', sx * 31, -176);
  }
  /* 范老桌上：一壶酒、一只盏 */
  function drawHu(g) {
    g.fillStyle = P.hgrad(g, -14, 0, 28, [[0, '#7f9a94'], [0.5, '#c9dcd2'], [1, '#6f8a84']]); g.beginPath(); g.moveTo(-6, -40); g.lineTo(6, -40); g.quadraticCurveTo(8, -30, 15, -22); g.quadraticCurveTo(18, -4, 10, 0); g.lineTo(-10, 0); g.quadraticCurveTo(-18, -4, -15, -22); g.quadraticCurveTo(-8, -30, -6, -40); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.3; g.stroke();
    g.beginPath(); g.moveTo(14, -18); g.quadraticCurveTo(28, -22, 26, -34); g.stroke(); P.ellipse(g, 0, -41, 7, 3, '#8e2a20', INK(), 1);
    P.ellipse(g, 46, -4, 11, 5, '#dceee2', INK(), 1.2); P.ellipse(g, 46, -5, 8, 3, '#f4f8f2');
  }
  /* 屋顶上：一盏小灯；夏离手里那卷纸（e.burn 烧掉了几分） */
  function drawLamp(g) {
    g.save(); g.globalCompositeOperation = 'lighter'; const a = 0.5 + 0.1 * Math.sin(JX.time * 8); const gr = g.createRadialGradient(0, -22, 0, 0, -22, 150); gr.addColorStop(0, 'rgba(255,200,120,' + a + ')'); gr.addColorStop(1, 'rgba(255,160,80,0)'); g.fillStyle = gr; g.fillRect(-150, -172, 300, 300); g.restore();
    g.fillStyle = '#3a2a1e'; g.fillRect(-9, -8, 18, 8); g.fillStyle = '#5a4630'; g.fillRect(-3, -20, 6, 12); P.ellipse(g, 0, -27, 5, 9, '#ffd27a'); P.ellipse(g, 0, -29, 2.6, 5, '#fff4d0');
  }
  function drawReader(g, e) {
    Fig.draw(g, e.sp, e.dir, e.ph, { pose: e.pose, seat: e.seat, carry: e.carry, idle: Math.sin(JX.time * 1.1), shadow: false });
    const b = e.burn == null ? 1 : e.burn; if (b >= 1) return;
    const sx = e.dir === 1 ? -1 : 1, w = 34 * (1 - b); g.save(); g.scale(sx, 1); g.translate(24, -84 + (62 - (e.seat == null ? 34 : e.seat)));
    g.fillStyle = '#efe6cc'; g.fillRect(0, -5, w, 10); g.strokeStyle = INK(0.7); g.lineWidth = 1; g.strokeRect(0, -5, w, 10);
    if (b > 0) { g.globalCompositeOperation = 'lighter'; P.ellipse(g, w + 2, -4, 5, 9 + 2 * Math.sin(JX.time * 14), 'rgba(255,170,70,0.9)'); P.ellipse(g, w + 2, -2, 2.4, 5, 'rgba(255,240,200,0.95)'); }
    g.restore();
  }
  /* 特写：那卷纸。两行北边的字（竖着写的，一根脊线上挂着钩和圈） */
  function drawMi(c, k) {
    cutBg(c, '#4a4234', '#1c1814'); c.save(); c.translate(650, 320); c.rotate(-0.04);
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-172, -262, 360, 540); c.fillStyle = '#eadfbe'; c.fillRect(-180, -270, 360, 540); c.strokeStyle = INK(0.8); c.lineWidth = 2; c.strokeRect(-180, -270, 360, 540);
    const r = JX.rng(477), col = (x, len, a) => {
      c.strokeStyle = 'rgba(24,18,14,' + a + ')'; c.lineCap = 'round'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, -220); c.lineTo(x, -220 + len); c.stroke();
      for (let y = -206; y < -220 + len - 10; y += 18 + r() * 14) { const s = r() < 0.5 ? -1 : 1, q = r(); c.lineWidth = 4; c.beginPath();
        if (q < 0.4) { c.moveTo(x, y); c.quadraticCurveTo(x + s * 22, y + 2, x + s * 20, y + 16); } else if (q < 0.7) { c.ellipse(x + s * 10, y + 6, 9, 7, 0, 0, 6.3); } else { c.moveTo(x, y); c.lineTo(x + s * 18, y - 8); c.moveTo(x, y + 8); c.lineTo(x + s * 14, y + 14); }
        c.stroke(); }
    };
    col(70, 420, 0.92); col(-70, 150 + 60 * Math.min(1, k * 2), 0.92 * Math.min(1, k * 2.4));
    c.restore(); cutVig(c);
  }
  /* 特写：白绫上的“会”字（上头那一撇一捺借第一章“人”字的画法），旁边是十一年前信上的那个“人” */
  function drawNa2(c, k) {
    const ren = ST._h.ren; cutBg(c, '#4a3c30', '#211812');
    c.save(); c.translate(360, 300); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-246, -246, 500, 500); c.fillStyle = '#f8f5ea'; c.fillRect(-250, -250, 500, 500); c.strokeStyle = INK(0.8); c.lineWidth = 2; c.strokeRect(-250, -250, 500, 500);
    c.fillStyle = 'rgba(18,14,12,0.94)'; c.save(); c.translate(-8, -60); c.scale(1.5, 0.92); if (ren) ren(c, true); c.restore();
    c.font = '600 250px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('云', 0, 110); c.restore();
    c.globalAlpha = Math.min(1, k * 1.8); c.strokeStyle = '#c8362e'; c.lineWidth = 4; c.beginPath(); c.ellipse(360 + 236, 300 - 4, 62, 62, 0, 0, 6.3); c.stroke(); c.globalAlpha = 1;
    const a = Math.max(0, Math.min(1, k * 1.6 - 0.4));
    c.save(); c.translate(940, 300); c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-236, -236, 480, 480); c.fillStyle = '#e2d5b2'; c.fillRect(-240, -240, 480, 480); c.strokeStyle = INK(0.8); c.lineWidth = 2; c.strokeRect(-240, -240, 480, 480);
    c.fillStyle = 'rgba(26,20,16,0.93)'; c.scale(1.2, 1.2); if (ren) ren(c, true); c.restore();
    c.globalAlpha = a; c.strokeStyle = '#c8362e'; c.lineWidth = 4; c.beginPath(); c.ellipse(940 + 176, 300 + 84, 70, 70, 0, 0, 6.3); c.stroke(); c.globalAlpha = 1;
    c.fillStyle = '#f0dca8'; c.font = '26px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('白绫上的捺：收尾往上一挑', 360, 590); c.globalAlpha = a; c.fillText('十一年前，信上的捺', 940, 590); c.globalAlpha = 1;
    cutVig(c);
  }
  /* 贺元度和那管大笔 */
  function drawHe(g, e) {
    const idle = e.moving ? 0 : Math.sin(JX.time * 1.1);
    Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, idle, shadow: true });
    g.save(); const back = e.dir === 2, sx = e.dir === 1 ? -1 : 1; g.scale(sx, 1);
    if (e.bi === 2) { g.translate(0, -92); P.line(g, -40, 0, 40, -3, 6, '#5a3f2c'); g.fillStyle = '#1a1512'; g.beginPath(); g.moveTo(40, -9); g.quadraticCurveTo(64, -4, 72, -2); g.quadraticCurveTo(62, 2, 40, 3); g.closePath(); g.fill(); P.line(g, -40, 0, -46, 0, 8, '#c9a24a'); }      // 横托在两只手上
    else { g.translate(back ? 22 : 24, -84); g.rotate(back ? -0.5 : 0.16); P.line(g, 0, 10, 0, -86, 6, '#5a3f2c'); P.line(g, 0, -86, 0, -92, 8, '#c9a24a'); g.fillStyle = '#1a1512'; g.beginPath(); g.moveTo(-7, 10); g.quadraticCurveTo(-4, 34, 0, 44); g.quadraticCurveTo(4, 34, 7, 10); g.closePath(); g.fill(); }
    g.restore();
  }

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop4 = JX.populate;
  JX.populate = function (id) {
    pop4(id);
    const sg = JX.state.stage, off = W.exitsOff, f = fl();
    if (sg < 47 || sg > 50) return;
    if (id === 'hall') {
      const s = W.byId.siniang, fan = W.byId.fan;
      if (s) { s.x = 780; s.y = 404; s.dir = 0; s.solid = false; s.reach = 170; s.bark = null; }
      off['hall:door'] = sg === 48 ? '明天才是正日子。\n今晚哪儿也不去。' : '才回来，不忙着出去。'; off['hall:stairs'] = '楼上这会儿没有他的事。'; off['hall:kitchen'] = '后厨这会儿不缺人手。';
      W.add('agui', 'agui', 150, 688, { dir: 3, tag: '阿桂', solid: false, vis: false });
      if (sg === 47 && f.v4 !== 7) {
        W.add('xiali', XL(), 1500, 1300, { dir: 2, tag: '夏离', solid: false });
        W.add('tingxue', 'tingxue', 1370, 1320, { dir: 2, tag: '听雪', solid: false });
        W.add('qiushui', 'qiushui2', 1570, 1360, { dir: 2, tag: '秋水', solid: false, carry: 'sword' });
      }
      if (sg === 47 && f.v4 === 7) {
        if (s) s.carry = 'book';
        W.add('qiushui', 'qiushui2', 1300, 608, { dir: 2, tag: '秋水', solid: false, reach: 150 });
        W.add('xiali', XL(), 1440, 1410, { dir: 2, tag: '夏离', solid: false, vis: false });
        W.add('tingxue', 'tingxue', 150, 688, { dir: 3, tag: '听雪', solid: false, vis: false });
      }
      if (sg === 48) {
        W.add('tingxue', 'tingxue', 1180, 850, { dir: 0, tag: '听雪', solid: false, reach: 150, draw: drawPai, pai: 1 });
        const a = W.byId.agui; if (a) { a.vis = true; a.x = 330; a.y = 700; }
        if (fan) { fan.pose = 'sit'; fan.seat = 34; fan.bark = null; }
        W.add('hu', { h: 1 }, 1432, 441, { solid: false, draw: drawHu });
      }
    }
    if (id === 'alley' && sg === 47) {
      ['xiali', 'heiyi', 'heiyi2', 'heiyi3'].forEach(k => W.remove(k));
      off['alley:kitchen'] = '先把眼前这五个人打发了。';
      W.add('swill', { h: 84 }, 420, 612, { tag: '泔水桶', draw: drawSwill, solid: false });
      const A = AL; W.add('xiali', XL(), A.x[0], A.x[1], { dir: 3, tag: '夏离', solid: false, carry: 'saber' });
      W.add('qiushui', 'qiushui2', A.q[0], A.q[1], { dir: 3, tag: '秋水', solid: false, carry: 'sword' });
      W.add('tingxue', 'tingxue', A.t[0], A.t[1], { dir: 3, tag: '听雪', solid: false });
      A.foes.forEach((q, i) => W.add('ds' + i, 'dashou', q[0], q[1], { dir: 1, tag: i ? '半闲堂的人' : '打手头目', solid: false, carry: i ? null : 'book' }));
    }
    if (id === 'roof') {
      ['xiali', 'xieke', 'rope'].forEach(k => W.remove(k));
      if (sg === 47) W.add('fan', 'fan', 1080, 640, { dir: 1, tag: '范醉翁', pose: 'sit', seat: 6, reach: 170, solid: false, carry: 'cup' });
      if (sg === 48) { W.add('lamp', { h: 30 }, 1150, 652, { solid: false, draw: drawLamp }); W.add('xiali', XL(), 1080, 640, { dir: 3, tag: '夏离', pose: 'sit', seat: 6, solid: false, draw: drawReader, burn: 0 }); }
    }
    if (id === 'kitchen' && sg === 47) {
      const t = W.byId.tingxue; if (t) { t.tag = '听雪'; t.bark = null; t.reach = 150; }
      W.add('siniang', 'siniang', 1770, 690, { dir: 1, tag: '阮四娘', solid: false, vis: false, carry: 'book' });
      W.add('qiushui', 'qiushui2', 1190, 890, { dir: 3, tag: '秋水', solid: false });
      off['kitchen:hall'] = '话还没有说完。'; off['kitchen:down'] = '这会儿不用下酒窖。';
    }
    if (id === 'jiangdi') {
      W.add('laodao', 'laodao', 2620, 692, { dir: 0, tag: '卖图的老道', pose: 'sit', seat: 30, reach: 200, solid: false });
      const r = JX.rng(4901);
      for (let i = 0; i < 9; i++) { const dirR = r() < 0.5, e = W.add('w' + i, Fig.extra(4910 + i * 7), 200 + r() * 4000, 852 + r() * 28, { solid: false, dir: dirR ? 3 : 1, moving: true, stroll: (dirR ? 1 : -1) * (46 + r() * 50) }); e.ph = r() * 6; }
      if (sg === 49) {
        W.add('xiali', XL(), 440, 806, { dir: 3, tag: '夏离', solid: false });
        W.add('tingxue', 'tingxue', 356, 772, { dir: 3, tag: '听雪', solid: false });
        W.add('qiushui', 'qiushui2', 300, 836, { dir: 3, tag: '秋水', solid: false, carry: 'sword' });
      }
      if (sg === 50) {
        W.add('xiali', XL(), 3570, 846, { dir: 2, tag: '夏离', solid: false });
        W.add('tingxue', 'tingxue', 3370, 852, { dir: 2, tag: '听雪', solid: false });
        W.add('qiushui', 'qiushui2', 3650, 812, { dir: 2, tag: '秋水', solid: false, carry: 'sword' });
        W.add('he', 'he', 3620, 468, { dir: 0, tag: '贺元度', solid: false, vis: false, draw: drawHe, bi: 1 });
        [[3240, 760], [3320, 800], [3960, 790], [4060, 770], [4160, 800], [3800, 830], [3720, 876], [3900, 866]].forEach((q, i) => W.add('k' + i, Fig.extra(5000 + i * 11), q[0], q[1], { dir: 2, solid: false }));
      }
    }
  };
  JX.on('update', dt => { if (W.id !== 'jiangdi') return; const DW = JX.scenes13.DW; W.ents.forEach(e => { if (!e.stroll) return; e.x += e.stroll * dt; e.moving = true; if (e.x > DW + 60) e.x = -60; if (e.x < -60) e.x = DW + 60; }); });

  /* ---------- 后巷：四个人对五个人 ---------- */
  const AL = { p: [720, 742], x: [600, 664], q: [610, 824], t: [800, 846], foes: [[1240, 736], [1150, 652], [1160, 826], [1330, 668], [1340, 812]] };
  const ORDER = ['jingzhe', 'xiali', 'qiushui', 'tingxue'], SEA = ['春生', '夏长', '秋收', '冬藏'], SCOL = ['#9fd8a8', '#ff9a8a', '#f0dca8', '#cfe3f0'];
  function setAlley() {
    const p = W.player; p.vis = true; p.x = AL.p[0]; p.y = AL.p[1]; p.dir = 3; p.pose = null; p.path = null; p.carry = 'jiudao';
    [['xiali', AL.x], ['qiushui', AL.q], ['tingxue', AL.t]].forEach(([k, q]) => { const e = W.byId[k]; if (e) { e.x = q[0]; e.y = q[1]; e.dir = 3; e.pose = null; e.path = null; } });
    AL.foes.forEach((q, i) => { const e = W.byId['ds' + i]; if (e) { e.x = q[0]; e.y = q[1]; e.dir = 1; e.pose = null; e.vis = true; e.alpha = 1; e.path = null; } });
  }
  async function fightAlley() {
    const B = JX.battle;
    const goalText = b => (b.full ? '齐了——合击“四时俱全”' : '四人各出一手，就能合击') + '<br>' + ORDER.map((k, i) => '春夏秋冬'[i] + (b.did[k] ? '●' : '○')).join('　');
    const setGoal = b => { const gl = b.box && b.box.querySelector('.goal'); if (gl) gl.innerHTML = '<b>◆</b>' + goalText(b); };
    const HEJI = { id: 'heji', name: '四时俱全', kind: 'talk', say: '四个人，一起——', desc: '合击。春生，夏长，秋收，冬藏：四个人一人一手，一个接着一个。', when: b => b.full,
      fx: async b => {
        if (UI.cutBanner) await UI.cutBanner(ORDER, '四时俱全', 1.7);
        const foes = b.units.filter(q => q.side === 'foe' && q.hp > 0);
        for (let i = 0; i < 4 && foes.length; i++) {
          const a = b.units.find(q => q.key === ORDER[i]); if (!a || a.hp <= 0) continue;
          const tg = foes[i % foes.length]; B.fx.floater(a, SEA[i], SCOL[i]); JX.audio.sfx(i % 2 ? 'page' : 'ming', 0.7); a.ent.dir = 3;
          await B.fx.lunge(a, tg, 0.82); if (W.fx) { W.fx('slash', tg.ent.x, tg.ent.y - 78, { s: 1.3, rot: 0.35 }); W.fx('flash', tg.ent.x, tg.ent.y - 80, { s: 1.1 }); W.shakeAmp = 8; } JX.audio.sfx('wrong'); await B.fx.wait(0.14); await B.fx.back(a);
        }
        foes.forEach(q => { q.hp = 0; q.ent.pose = 'squat'; B.fx.floater(q, '倒了', '#ff8a70'); }); JX.audio.sfx('gong'); await B.fx.wait(0.7);
      } };
    const only = c => Object.assign({}, c, { when: b => !b.full });
    const weakest = b => { const fs = b.units.filter(q => q.side === 'foe' && q.hp > 0 && !q.boss); return fs.length ? fs.reduce((m, q) => (q.hp < m.hp ? q : m), fs[0]).key : 'ds0'; };
    const rec = (b, u) => {
      if (b.full) return { pick: 'heji', hint: '四个人都出过手了——按回车：合击“四时俱全”！' };
      const dl = u.season === b.season ? '时令正在' + '春夏秋冬'[u.season] + '，' + u.name + '当令，这一手重两成半。' : '';
      if (u.key === 'jingzhe') return { pick: 'jiao', hint: '面前五个——“吹角连营”，一刀带一片。' + dl };
      if (u.key === 'xiali') return { pick: 'zhan', target: 'ds0', hint: '拿文书的那个归她——弯刀·斩。' + dl };
      if (u.key === 'qiushui') return { pick: 'ping', target: 'ds0', hint: '他们是来找她的——“银瓶乍破”，一剑破进去。' + dl };
      return { pick: 'tui', target: weakest(b), hint: '挑一个站不稳的——绵掌·推。' + dl };
    };
    const QUAN = { name: '拳脚', type: 'light', pow: 1, tell: '捏着拳头往前凑——快手' }, PU = { name: '扑上来', type: 'heavy', pow: 1.1, delay: 1.2, tell: '抡圆了胳膊扑上来——重手' };
    for (let lost = 0; ;) {
      setAlley(); const p = W.player, x = W.byId.xiali, q = W.byId.qiushui, t = W.byId.tingxue, xl = fighters(p, x)[1];
      const r = await B.run({
        goal: '四人各出一手，就能合击<br>春○　夏○　秋○　冬○', music: 'jiaofeng', season: 0, seasonEvery: 3, zoom: 1.1, focus: { x: 965, y: 700 },
        allies: [
          { ent: p, key: 'jingzhe', name: '陆惊蛰', hp: 130, spd: 13, atk: 22, def: 6, season: 0, cmds: [
            only({ id: 'jiao', name: '吹角连营', kind: 'attack', type: 'heavy', all: true, pow: 0.62, delay: 1.3, desc: '第二式。一刀出去，后头还跟着两刀——面前的都带到。出手慢，下一手来得迟。' }),
            only({ id: 'tiao', name: '挑灯看剑', kind: 'attack', type: 'light', pow: 1, delay: 0.85, desc: '第一式。刀尖自下而上一挑。出手快，下一手来得早。' }),
            only({ id: 'bu', name: '踏潮步', kind: 'dodge', desc: '脚下一错，人已不在原地。重手躲得开；快手只能躲开一半。' }), HEJI] },
          { ent: x, key: 'xiali', name: '夏离', hp: xl.hp, spd: xl.spd, atk: xl.atk, def: xl.def, season: 1, cmds: xl.cmds.map(only).concat([HEJI]) },
          { ent: q, key: 'qiushui', name: '辛秋水', hp: 105, spd: 12.5, atk: 26, def: 5, season: 2, cmds: [
            only({ id: 'ping', name: '银瓶乍破', kind: 'attack', type: 'heavy', pow: 1.45, delay: 1.2, desc: '蓄住了再出，一剑破进去。' }),
            only({ id: 'zhu', name: '大珠小珠', kind: 'attack', type: 'light', pow: 0.85, delay: 0.8, desc: '琵琶上的指法，换到了剑尖上：连点三处。出手快。' }),
            only({ id: 'leng', name: '冷月无声', kind: 'dodge', desc: '身子一侧，人已经让开了。' }), HEJI] },
          { ent: t, key: 'tingxue', name: '耶律听雪', hp: 110, spd: 12, atk: 24, def: 5, season: 3, cmds: [
            only({ id: 'tui', name: '绵掌·推', kind: 'attack', type: 'light', pow: 1.05, desc: '一掌按在胸口，劲是往外送的。' }),
            only({ id: 'shan', name: '闪', kind: 'dodge', desc: '身子一矮，从底下钻过去。' }), HEJI] },
        ],
        foes: AL.foes.map((_, i) => ({ ent: W.byId['ds' + i], key: 'ds' + i, name: i ? '半闲堂的人' + '甲乙丙丁'[i - 1] : '打手头目', hp: i ? 60 : 105, spd: i ? 8.6 + i * 0.2 : 9.4, atk: i ? 12 : 15, def: 2, boss: !i, keep: true, n: i, ai: (b, u) => (++u.n % 2 ? QUAN : PU) })),
        start(b) { b.did = {}; b.full = false; setGoal(b); },
        allow: rec,
        autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id) || cmds[0]; },
        end(b) { return b.units.some(u => u.side === 'ally' && u.hp <= 0) ? 'lose' : null; },
        async after(b, u) {
          const L = b.last; b.last = null;
          b.units.forEach(k => { if (k.side === 'foe' && k.hp <= 0 && k.ent.pose !== 'squat') k.ent.pose = 'squat'; });
          if (u.side !== 'ally' || !L || L.a !== u || b.did[u.key]) return;
          b.did[u.key] = 1; setGoal(b);
          if (!b.full && ORDER.every(k => b.did[k]) && b.units.some(k => k.side === 'foe' && k.hp > 0)) { b.full = true; setGoal(b); JX.audio.sfx('gong'); B.fx.floater(b.units.find(k => k.key === 'jingzhe'), '春夏秋冬，齐了', '#fff2c0'); await B.fx.wait(0.7); }
        },
      });
      if (r.result === 'win') break;
      await UI.narrate('有一个人倒下了。——不对，这一场还没完，再来。');
      if (await giveUp(++lost)) break;
      await UI.tutorial('再来一次', '<b>四个人里有一个倒下就算输。</b><br>指令框里那行红字是这一手的提示，光标已经落在建议的指令上，照着按回车就行。<br>四个人都出过一回手，指令就只剩一个：<b>四时俱全</b>。');
    }
    setAlley(); AL.foes.forEach((_, i) => { const e = W.byId['ds' + i]; if (e) e.pose = 'squat'; }); W.focus = { x: 965, y: 700 }; await nap(0.4);
  }

  /* ---------- 演出 ---------- */
  Object.assign(H, {
    /* —— 一　多一双筷子 —— */
    async 入四一() { ch4(47); const f = fl(); f.v4 = 4; f.train = TRAIN.slice(); if (UI.warmHalf) UI.warmHalf(ORDER); },
    async 四人到柜前() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue, q = W.byId.qiushui; halt(); fl().train = null; p.path = null;
      const a = W.walk(p, 800, 520, { speed: 220, dir: 2 }); if (x) W.walk(x, 950, 524, { speed: 220, dir: 2 }); if (t) W.walk(t, 1050, 548, { speed: 240, dir: 2 }); if (q) W.walk(q, 1150, 566, { speed: 210, dir: 2 });
      await a; p.dir = 2; W.focus = { x: 930, y: 480 }; W.zoom = 1.15; await nap(0.5);
    },
    async 阿桂跑来四() {
      const a = W.byId.agui, p = W.player; if (!a) return;
      a.vis = true; a.alpha = 1; await W.walk(a, p.x - 100, p.y + 30, { speed: fast(330) }); a.dir = 3; p.dir = 1; ['xiali', 'tingxue', 'qiushui'].forEach(k => { const e = W.byId[k]; if (e) e.dir = 1; }); await nap(0.3);
    },
    async 打手进门() {
      const SP = [[1010, 800], [925, 846], [1095, 846], [965, 892], [1055, 892]]; W.zoom = 1; W.focus = { x: 980, y: 690 }; JX.audio.sfx('door');
      const ws = SP.map((q, i) => { const e = W.add('ds' + i, 'dashou', 1440, 1400 + i * 6, { dir: 2, tag: i ? '半闲堂的人' : '打手头目', solid: false, carry: i ? null : 'book' }); return JX.sleep(JX.auto ? 0 : i * 0.25).then(() => W.walk(e, q[0], q[1], { speed: fast(260), dir: 2 })); });
      await Promise.all(ws); const p = W.player; p.dir = 0; ['xiali', 'tingxue', 'qiushui', 'agui'].forEach(k => { const e = W.byId[k]; if (e) e.dir = 0; }); await nap(0.4);
    },
    async 入后巷() { const p = W.player; p.carry = null; W.zoom = 1; W.focus = null; },
    async 战后巷() { W.exitsOff['alley:kitchen'] = '先把眼前这五个人打发了。'; await fightAlley(); },
    async 打手逃() {
      const b0 = W.byId.ds0; W.add('wenshu', { h: 1 }, 1190, 770, { solid: false, draw: drawWenshu }); if (b0) b0.carry = null; JX.audio.sfx('page');
      const ws = AL.foes.map((_, i) => { const e = W.byId['ds' + i]; if (!e) return null; e.pose = null; return JX.sleep(JX.auto ? 0 : i * 0.12).then(() => W.walk(e, 1800, 700 + i * 30, { speed: fast(380), straight: true })).then(() => { e.vis = false; }); });
      await Promise.all(ws); const p = W.player; p.carry = null; const q = W.byId.qiushui, x = W.byId.xiali; if (x) x.carry = null; W.focus = { x: 900, y: 700 }; await nap(0.3);
    },
    async 夏离拾书() { const x = W.byId.xiali; if (!x) return; await W.walk(x, 1150, 772, { speed: fast(200), straight: true, dir: 3 }); x.pose = 'squat'; await nap(0.4); W.remove('wenshu'); x.pose = null; x.carry = 'book'; x.dir = 1; JX.audio.sfx('page'); await nap(0.5); },
    async 收文书() { const x = W.byId.xiali; if (x) x.carry = null; await nap(0.3); },
    async 四娘出门() {
      JX.audio.sfx('door'); const s = W.add('siniang', 'siniang', 266, 596, { dir: 0, tag: '阮四娘', solid: false }), p = W.player, x = W.byId.xiali, q = W.byId.qiushui, t = W.byId.tingxue;
      W.focus = { x: 560, y: 690 }; const a = W.walk(p, 440, 690, { speed: fast(230), dir: 1 }); if (x) W.walk(x, 640, 720, { speed: fast(230), dir: 1 }); if (q) W.walk(q, 560, 780, { speed: fast(230), dir: 1 }); if (t) W.walk(t, 720, 800, { speed: fast(240), dir: 1 });
      await a; W.player.dir = 1; s.dir = 3; await nap(0.4);
    },
    async 入五月() { const p = ch4(47); fl().v4 = 5; p.carry = null; },
    async 屋顶对坐() { const p = W.player; p.path = null; await W.walk(p, 860, 664, { speed: 180, dir: 3 }); p.dir = 3; p.carry = 'jiudao'; W.focus = { x: 960, y: 600 }; W.zoom = 1.2; JX.audio.sfx('ming', 0.5); await nap(0.5); },
    async 使三式() {
      const p = W.player, x0 = p.x;
      JX.audio.sfx('page'); await tw(0.2, k => { p.z = Math.sin(k * Math.PI) * 12; }); p.z = 0; if (W.fx) W.fx('slash', p.x + 70, p.y - 86, { s: 0.9, rot: -0.9 }); await nap(0.7);
      p.moving = true; await tw(0.3, k => { p.x = x0 + 96 * k; }); p.moving = false; if (W.fx) W.fx('slash', p.x + 56, p.y - 80, { s: 0.8, rot: 0.2 }); JX.audio.sfx('page'); await nap(0.5);
    },
    async 退三步出剑() {
      const p = W.player; p.dir = 3; p.moving = true; const x0 = p.x; await tw(0.9, k => { p.x = x0 - 150 * k; }); p.moving = false; await nap(0.4);
      JX.audio.sfx('ming', 0.7); await tw(0.16, k => { p.z = Math.sin(k * Math.PI) * 8; }); p.z = 0;
      if (W.fx) { W.fx('slash', p.x + 150, p.y - 82, { s: 1.5, rot: 0.1 }); W.fx('ring', p.x + 190, p.y - 82, { s: 0.7, col: 'rgba(240,226,176,0.9)' }); } await nap(0.9);
    },
    async 入六月() { const p = ch4(47); fl().v4 = 6; p.carry = null; },
    async 四娘进厨() {
      const p = W.player, s = W.byId.siniang, t = W.byId.tingxue; p.path = null; W.focus = { x: 1480, y: 720 }; W.zoom = 1.15;
      const a = W.walk(p, 1350, 770, { speed: 200, dir: 3 }); JX.audio.sfx('door', 0.5);
      if (s) { s.vis = true; await W.walk(s, 1630, 742, { speed: fast(170), dir: 1 }); s.dir = 1; } await a; p.dir = 3; if (t) t.dir = 3; await nap(0.3);
    },
    async 四娘走() { const s = W.byId.siniang; if (s) { await W.walk(s, 1770, 690, { speed: fast(180), straight: true }); s.vis = false; } await nap(0.3); },
    async 秋水编辫() {
      const p = W.player, q = W.byId.qiushui, t = W.byId.tingxue; W.walk(p, 1290, 830, { speed: fast(200), dir: 3 });
      if (q) { await W.walk(q, 1470, 770, { speed: fast(150), dir: 0 }); q.dir = 0; } if (t) t.dir = 0; W.focus = { x: 1450, y: 700 }; W.zoom = 1.3; await nap(0.5);
    },
    async 入七月() { const p = ch4(47); fl().v4 = 7; p.carry = null; },
    async 到墙下() { const p = W.player; p.path = null; await W.walk(p, 1396, 622, { speed: 190, dir: 2 }); p.dir = 2; W.focus = { x: 1380, y: 500 }; W.zoom = 1.2; await nap(0.5); },
    /* 第一章软红院里那一回三选一（flags.qs）的回响：她为什么上的堂，三样说法 */
    async 秋水回话() {
      const q = W.byId.qiushui, p = W.player, k = fl().qs; if (q) q.dir = 3; p.dir = 1; await nap(0.4);
      if (k === 2) { await say('qiushui', '秋水', '是为那一句“只求一句实话”。'); await say('qiushui', '秋水', '六年里，头一回有人同我要的是这个。'); }
      else if (k === 0) { await say('qiushui', '秋水', '是为你那一句“还是不敢说”。', 'cold'); await say('qiushui', '秋水', '我不敢的事，轮不到别人替我说破。——往后不要再拿话激我。'); await say('jingzhe', '陆惊蛰', '……不敢了。', 'grin'); }
      else { await say('qiushui', '秋水', '是因为你没有绕弯子。'); await say('qiushui', '秋水', '来求我的人，个个都绕。照实说自己要死了的，你是头一个。'); }
    },
    async 到柜前四() { const p = W.player; p.path = null; W.zoom = 1; W.focus = null; await W.walk(p, 800, 520, { speed: 200, dir: 2 }); p.dir = 2; W.focus = { x: 900, y: 470 }; W.zoom = 1.2; await nap(0.4); },
    async 夏离回楼() {
      const x = W.byId.xiali, p = W.player; W.zoom = 1; W.focus = { x: 1000, y: 760 }; if (!x) return; JX.audio.sfx('door', 0.5); x.vis = true;
      await W.walk(x, 960, 560, { speed: fast(240), dir: 1 }); x.dir = 1; p.dir = 3; W.focus = { x: 900, y: 500 }; W.zoom = 1.15; await nap(0.3);
    },
    async 听雪冲出() { const t = W.byId.tingxue; if (!t) return; t.vis = true; W.focus = { x: 700, y: 560 }; W.zoom = 1.05; await W.walk(t, 640, 580, { speed: fast(360), dir: 3 }); t.dir = 3; W.player.dir = 1; await nap(0.2); },
    async 鼾声停() { W.focus = { x: 1450, y: 440 }; W.zoom = 1.2; await nap(1.4); },
    /* —— 二　前夜 —— */
    async 入四二() { const p = ch4(48); fl().v4 = 8; p.carry = null; },
    async 听雪亮牌() { const p = W.player, t = W.byId.tingxue; p.path = null; await W.walk(p, 1080, 862, { speed: 200, dir: 3 }); p.dir = 3; if (t) t.dir = 1; W.focus = { x: 1140, y: 760 }; W.zoom = 1.25; await nap(0.4); },
    async 镜头还原四() { W.focus = null; W.zoom = 1; await nap(0.3); },
    async 范老坐直() { const p = W.player; p.path = null; W.focus = { x: 1450, y: 430 }; W.zoom = 1.25; await nap(0.6); },
    async 推酒() { const h = W.byId.hu; if (h) { const x0 = h.x; JX.audio.sfx('tick', 0.5); await tw(0.5, k => { h.x = x0 + 44 * k; }); } await nap(0.5); },
    async 屋顶读信() { const p = ch4(48); fl().v4 = 9; p.vis = false; },
    async 摆屋顶() { W.focus = { x: 1060, y: 560 }; W.zoom = 1.25; W.camSnap = true; },
    async 看密信() { JX.audio.sfx('page'); await cutIn(drawMi, ['纸上的字，这座城里没有几个人认得。只有两行。', '头一行说：兵已经动了。', '第二行只有两个字：回来。'], 2.6); },
    async 烧信() { const x = W.byId.xiali; if (x) { JX.audio.sfx('huo', 0.35); await tw(1.2, k => { x.burn = 0.5 * k + 0.001; }); } await nap(0.5); },
    async 烧完() { const x = W.byId.xiali; if (x) { await tw(1.1, k => { x.burn = 0.5 + 0.5 * k; }); x.burn = 1; } await nap(0.6); },
    async 惊蛰上屋顶() {
      const p = W.player, x = W.byId.xiali; p.vis = true; p.x = 420; p.y = 820; p.dir = 3; p.carry = fl().xl === 2 ? 'cup' : null; W.zoom = 1.1; W.focus = { x: 940, y: 600 };
      await W.walk(p, 930, 668, { speed: fast(190), dir: 3 }); p.dir = 3; if (x) x.dir = 1; await nap(0.4);
    },
    /* 第二章船头夜话那一回三选一（flags.xl）的回响：递过酒的，这一回还是不问；问过话的，这一回问了也只得着半句 */
    async 夜话二() {
      const p = W.player, x = W.byId.xiali;
      if (fl().xl === 2) {
        await UI.narrate('他什么也没有问。把手里那半盏酒递了过去。'); p.carry = null; if (x) x.carry = 'cup';
        await say('jingzhe', '陆惊蛰', '范老今晚不喝，壶里的便宜我了。还是蓬莱春。', 'grin');
        await UI.narrate('她接了，喝了一口。这一回没有呛。'); await say('xiali2', '夏离', '……好酒。', 'smile'); if (x) x.carry = null;
      } else {
        await say('jingzhe', '陆惊蛰', '家里的信？'); await say('xiali2', '夏离', '（拍了拍手上的纸灰）家里的。问我几时回去。');
        await say('jingzhe', '陆惊蛰', '你怎么回的？'); await say('xiali2', '夏离', '还没有回。');
      }
    },
    async 看灯河() { const x = W.byId.xiali; if (x) x.dir = 0; await nap(1.2); },
    /* —— 三　四样都齐了 —— */
    async 入四三() { ch4(49); fl().train = TRAIN.slice(); },
    async 俯瞰江堤() { W.godOn = true; await nap(2.6); },
    async 收俯瞰江() { W.godOn = false; await nap(0.9); },
    async 看水军() { const p = W.player; halt(); p.path = null; p.dir = 2; TRAIN.forEach(k => { const e = W.byId[k]; if (e) e.dir = 2; }); W.focus = { x: 1150, y: 540 }; await nap(0.8); },
    async 沿堤再走() { const t = W.byId.tingxue; if (t) t.carry = null; W.focus = null; W.zoom = 1; fl().train = TRAIN.slice(); },
    async 看弄潮儿() { const p = W.player; halt(); p.path = null; p.dir = 2; TRAIN.forEach(k => { const e = W.byId[k]; if (e) e.dir = 2; }); W.focus = { x: 2010, y: 540 }; await nap(0.8); },
    async 见老道() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue, q = W.byId.qiushui; halt(); fl().train = null; p.path = null;
      const a = W.walk(p, 2610, 792, { speed: 200, dir: 2 }); if (x) W.walk(x, 2712, 806, { speed: 220, dir: 2 }); if (t) W.walk(t, 2512, 800, { speed: 230, dir: 2 }); if (q) W.walk(q, 2796, 786, { speed: 210, dir: 2 });
      await a; p.dir = 2; W.focus = { x: 2640, y: 620 }; W.zoom = 1.2; await nap(0.4);
    },
    async 老道看四人() { const d = W.byId.laodao; if (!d) return; for (const k of [1, 0, 3, 3]) { d.dir = k; await nap(0.75); } d.dir = 0; await nap(0.3); },
    async 送图() { const t = W.byId.tingxue; JX.audio.sfx('page'); if (t) t.carry = 'book'; await nap(0.4); },
    /* —— 四　忆四　伪书 —— */
    async 入四四() { ch4(50); fl().train = null; },
    async 摆台前() { W.zoom = 1; W.focus = { x: 3780, y: 540 }; W.camSnap = true; W.lingN = 0; },
    async 贺登台() { const h = W.byId.he; JX.audio.sfx('gong'); await nap(0.5); JX.audio.sfx('gong'); await nap(0.5); JX.audio.sfx('gong'); if (!h) return; h.vis = true; h.bi = 1; await W.walk(h, 3820, 496, { speed: fast(110), straight: true, dir: 0 }); h.dir = 0; await nap(0.6); },
    async 贺下台() {
      const h = W.byId.he, L = JX.scenes13.LING; if (!h) return;
      await W.walk(h, 3440, 500, { speed: fast(150), straight: true }); await W.walk(h, 3272, 652, { speed: fast(130), straight: true }); await W.walk(h, L.x0 + L.cw * 0.5, 676, { speed: fast(130), straight: true, dir: 2 }); h.dir = 2; W.focus = { x: 3560, y: 540 }; await nap(0.4);
    },
    async 写白绫() {
      const h = W.byId.he, L = JX.scenes13.LING; if (!h) return; const x0 = L.x0 + L.cw * 0.5, x1 = L.x0 + L.cw * (L.n - 0.5); let last = 0;
      h.dir = 2; h.moving = true;
      await tw(11, k => { h.x = x0 + (x1 - x0) * k; h.dir = 2; W.lingN = Math.min(L.n, (h.x - L.x0) / L.cw + 0.35); W.focus = { x: Math.max(3560, Math.min(3840, h.x)), y: 540 }; const n = Math.floor(W.lingN); if (n > last) { last = n; JX.audio.sfx('page', 0.3); } });
      h.moving = false; W.lingN = L.n; await nap(0.5); h.dir = 0; JX.audio.sfx('gong', 0.5); await nap(0.6);
    },
    async 挤到绫前() {
      const p = W.player, L = JX.scenes13.LING; p.path = null; for (let i = 0; i < 8; i++) { const e = W.byId['k' + i]; if (e) W.walk(e, e.x, e.y - 16, { speed: fast(60), straight: true, dir: 2 }); }
      [['xiali', 3760, 770], ['tingxue', 3600, 772], ['qiushui', 3940, 756]].forEach(([k, x, y]) => { const e = W.byId[k]; if (e) W.walk(e, x, y, { speed: fast(160), dir: 2 }); });
      await W.walk(p, L.x0 + L.cw * 7.5, 734, { speed: fast(170), dir: 2 }); p.dir = 2; W.focus = { x: p.x, y: 560 }; W.zoom = 1.3; await nap(0.5);
    },
    async 看捺二() { JX.audio.sfx('page'); await cutIn(drawNa2, ['“吴”字的捺。“会”字的捺。“繁”字里藏着的那一捺。', '每一捺的收尾，都往上轻轻一挑。'], 2.6); },
    async 忆信() { UI.tone('sepia'); await cutIn(ST._h.drawNa, ['架阁库里那一页信。字像极了父亲，只有捺笔——每一捺，收尾都往上一挑。'], 2.2); },
    async 忆手() { JX.audio.sfx('page'); await cutIn(ST._h.drawHand, ['抄家那一夜，火把底下那只翻书的手。翻得很慢，像是很爱惜。'], 2.6); UI.tone(null); },
    async 看台上() { const h = W.byId.he; if (h) { h.x = 3820; h.y = 496; h.dir = 0; h.bi = 2; h.moving = false; } W.focus = { x: 3820, y: 470 }; W.zoom = 1.5; W.camSnap = true; await nap(1.2); },
    async 试玩到此八() {
      ST._endHtml = '<h2>试玩到此</h2><p>第四章《望海潮》做到第四场：白绫上十四个字，每一捺都往上一挑。——是他。</p><p>后面是江心的三场比试，和午时三刻的那一道潮。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在江堤上看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      const p = W.player; p.vis = true; W.zoom = 1; W.focus = null; await H.试玩到此二();
    },
  });
})();
