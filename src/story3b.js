/* 第三章《渔家傲》的演出（二）：潮音洞 39、这里没有阑珊 40、多看的那一眼 41、忆三·拜师 42。
   接在 story3.js 后面。洞里三处水的深浅记在 W.tide，挡不挡路是往 W.blocks 里添、撤（撤了要 W.regrid）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks, Fig = JX.Fig;
  const { fighters, giveUp, cutSteps, cutBg, cutVig, ch3, XL } = ST._h;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const tw = (s, f, e) => JX.tween(JX.auto ? 0.02 : s, f, e);
  const fl = () => JX.state.flags;
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';
  const fast = v => (JX.auto ? 2400 : v);
  const pop = (e, text, col) => JX.battle.fx.floater({ ent: e }, text, col || '#f0e2b0');      // 人头上冒一行字（不在战斗里也能用）
  ST.alias('秋水', 'qiushui');                                     // 她的对白用画像；场景里的人也叫 qiushui（衣裳是 qiushui2：放下了琵琶，手里是剑）

  /* ---------- 自己画的几样 ---------- */
  /* 司辰：领口袖口几点银星，腰间一只铜漏壶 */
  function drawSi(g, e) {
    Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, pose: e.pose, carry: e.carry, shadow: true });
    if (e.dir !== 2) { [[-7, -105], [6, -101], [-3, -93], [8, -88]].forEach(q => P.ellipse(g, q[0], q[1], 1.5, 1.5, '#e6eef4')); g.strokeStyle = INK(0.8); g.lineWidth = 1; g.beginPath(); g.moveTo(-9, -70); g.lineTo(-10, -60); g.stroke(); P.ellipse(g, -10, -54, 5, 6.4, '#b08a3e', INK(), 1); P.ellipse(g, -10, -57, 3, 1.6, '#e6cf8a'); }
  }
  /* 金琵琶，站在山路上：ring 是琴声荡开的那一圈（0 到 1） */
  function drawJin2(g, e) {
    Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, carry: 'pipa', shadow: true });
    if (e.ring > 0) { for (let i = 0; i < 3; i++) { const q = Math.min(1, e.ring + i * 0.14); g.strokeStyle = 'rgba(236,240,244,' + (0.55 * (1 - q)) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(10, -80, 60 + q * 620, 26 + q * 250, 0, 0, 6.3); g.stroke(); } }
  }
  /* 地上的半截船桨；断成两半的船桨 */
  function drawOar(g) { P.shadow(g, 0, 2, 60, 5, 0.3); g.save(); g.rotate(-0.1); P.line(g, -60, 0, 30, 0, 6, INK()); P.line(g, -60, 0, 30, 0, 4, '#8a7350'); g.fillStyle = '#9a845e'; g.beginPath(); g.moveTo(26, -7); g.lineTo(70, -10); g.quadraticCurveTo(82, 0, 70, 10); g.lineTo(26, 7); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke(); g.restore(); }
  function drawHalves(g) { P.shadow(g, 0, 2, 60, 5, 0.3); [[-34, -4, -0.3], [30, 6, 0.24]].forEach(q => { g.save(); g.translate(q[0], q[1]); g.rotate(q[2]); P.line(g, -34, 0, 34, 0, 4.4, INK()); P.line(g, -34, 0, 34, 0, 2.6, '#8a7350'); P.line(g, 30, -3, 38, 3, 1.2, '#e6d8b4'); g.restore(); }); }
  /* 屋顶上的那坛酒 */
  function drawTan(g) { P.shadow(g, 0, 0, 30, 7, 0.4); g.save(); g.translate(0, -30); P.jar(g, 0, 0, 0.62, { seed: 3, text: '春' }); g.restore(); }
  /* 一口白气：从人嘴边飘上去 */
  function puff(e) {
    const id = 'puff' + Math.round(JX.time * 1000), d = e.dir === 1 ? -1 : 1;
    const f = W.add(id, { h: 1 }, e.x + d * 16, e.y + 3, { solid: false, k: 0, draw(g, me) { g.save(); g.globalAlpha = 0.6 * (1 - me.k); P.ellipse(g, d * me.k * 22, -116 - me.k * 22, 8 + me.k * 18, 6 + me.k * 11, '#f4faff'); P.ellipse(g, d * (10 + me.k * 30), -122 - me.k * 30, 5 + me.k * 12, 4 + me.k * 8, '#f4faff'); g.restore(); } });
    return tw(1.3, k => { f.k = k; }).then(() => W.remove(id));
  }
  /* 冷的地方：跟着一个人，一口一口地呵白气，直到换场景 */
  function breath(e) {
    const id = 'br_' + e.id; W.remove(id); const d = () => (e.dir === 1 ? -1 : 1);
    W.add(id, { h: 1 }, e.x, e.y, { solid: false, sy: 3000, draw(g, me) { if (!e.vis || e.dir === 2) return; const k = (JX.time * 0.4) % 1; if (k > 0.7) return; const u = k / 0.7; g.save(); g.translate(e.x - me.x, e.y - me.y - (e.pose === 'squat' ? -34 : 0)); g.globalAlpha = 0.62 * Math.sin(u * Math.PI); P.ellipse(g, d() * (16 + u * 24), -118 - u * 20, 8 + u * 16, 6 + u * 10, '#f4faff'); P.ellipse(g, d() * (28 + u * 34), -124 - u * 30, 5 + u * 11, 4 + u * 7, '#f4faff'); g.restore(); } });
  }
  /* 琴声里那一根“针”：从 a 到 b 的一道细线 */
  async function needle(a, b, sec) {
    const x0 = a.x + 20, y0 = a.y - 84, x1 = b.x, y1 = b.y - 84, yb = Math.max(a.y, b.y) + 6, ay = y0 - yb;
    const n = W.add('zhen', { h: 1 }, x0, yb, { solid: false, k: 0, draw(g, me) { const kt = Math.max(0, me.k - 0.22), hx = (x1 - x0) * me.k, hy = ay + (y1 - y0) * me.k, tx = (x1 - x0) * kt, ty = ay + (y1 - y0) * kt; P.line(g, tx, ty, hx, hy, 6, 'rgba(236,244,255,0.35)'); P.line(g, tx, ty, hx, hy, 2, '#ffffff'); } });
    await tw(sec, k => { n.k = k; }); W.remove('zhen');
  }
  /* 特写：两口剑，相距三步。左边是酒刀，在响；右边是霜降，在冒白气 */
  function drawPair(c, k) {
    cutBg(c, '#5c6c7a', '#222b35');
    const lg = c.createLinearGradient(0, 0, 0, 640); lg.addColorStop(0, 'rgba(232,246,255,0.24)'); lg.addColorStop(1, 'rgba(232,246,255,0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(570, 0); c.lineTo(730, 0); c.lineTo(900, 640); c.lineTo(400, 640); c.closePath(); c.fill();
    const a = Math.min(1, k / 0.3), tt = k * 36;
    /* 酒刀 */
    c.save(); c.translate(300, 400); c.rotate(-0.34); c.scale(0.6, 0.6);
    c.fillStyle = '#4b3525'; c.fillRect(-330, -30, 252, 60); c.strokeStyle = 'rgba(43,34,28,0.9)'; c.lineWidth = 3; c.strokeRect(-330, -30, 252, 60);
    for (let i = 0; i < 11; i++) { c.strokeStyle = '#c8b48a'; c.lineWidth = 7; c.beginPath(); c.moveTo(-320 + i * 22, -30); c.lineTo(-304 + i * 22, 30); c.stroke(); }
    c.strokeStyle = '#a8322a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-330, 0); c.quadraticCurveTo(-380, 30, -368, 90); c.stroke();
    c.fillStyle = '#3a2a1e'; c.fillRect(-82, -40, 26, 80); c.strokeStyle = 'rgba(43,34,28,0.9)'; c.lineWidth = 3; c.strokeRect(-82, -40, 26, 80);
    c.fillStyle = P.vgrad(c, 0, -28, 56, [[0, '#e9eef0'], [0.45, '#aab3b6'], [0.55, '#7c868a'], [1, '#c5cdd0']]); c.beginPath(); c.moveTo(-56, -27); c.lineTo(330, -29); c.lineTo(330, 29); c.lineTo(-56, 25); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-50, -15); c.lineTo(322, -17); c.stroke();
    for (let i = 1; i <= 4; i++) { const d = Math.sin(tt + i) * i * 3.4 * a; c.strokeStyle = 'rgba(236,244,248,' + (0.36 * a / i) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(-56, -27 + d); c.lineTo(330, -29 + d); c.lineTo(330, 29 + d); c.lineTo(-56, 25 + d); c.closePath(); c.stroke(); }
    c.restore();
    for (let i = 0; i < 4; i++) { const q = ((k * 2 + i / 4) % 1); c.strokeStyle = 'rgba(226,238,244,' + (0.3 * a * (1 - q)) + ')'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(330, 380, 150 + q * 190, 60 + q * 120, -0.34, 0, 6.3); c.stroke(); }
    /* 霜降：窄身直剑，剑尖朝左 */
    c.save(); c.translate(960, 250); c.rotate(0.1);
    c.fillStyle = P.vgrad(c, 0, -13, 26, [[0, '#f2f8fc'], [0.48, '#b4c4d2'], [0.52, '#8a9aaa'], [1, '#d2deea']]); c.beginPath(); c.moveTo(-360, 0); c.lineTo(-320, -12); c.lineTo(200, -13); c.lineTo(200, 13); c.lineTo(-320, 12); c.closePath(); c.fill(); c.strokeStyle = 'rgba(30,40,52,0.9)'; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-340, 0); c.lineTo(196, 0); c.stroke();
    c.fillStyle = '#8a94a0'; c.fillRect(200, -34, 16, 68); c.strokeRect(200, -34, 16, 68); c.fillStyle = '#2e3a48'; c.fillRect(216, -11, 116, 22); c.strokeRect(216, -11, 116, 22); for (let i = 0; i < 8; i++) P.line(c, 222 + i * 14, -11, 230 + i * 14, 11, 2, 'rgba(160,180,200,0.5)'); P.ellipse(c, 340, 0, 13, 13, '#cfd8e0', 'rgba(30,40,52,0.9)', 2);
    c.restore();
    /* 白气：从剑身上往下淌，往左边漫过去 */
    const fz = Math.max(0, (k - 0.2) / 0.8);
    for (let i = 0; i < 26; i++) { const u = (i * 0.618) % 1, x = 640 + u * 520 - fz * 150 * ((i % 5) / 5), y = 268 + ((i * 37) % 60) + fz * (40 + (i % 7) * 26); c.fillStyle = 'rgba(240,250,255,' + (0.1 + 0.16 * fz * (1 - (i % 4) / 5)) + ')'; c.beginPath(); c.ellipse(x, y, 40 + (i % 5) * 16, 14 + (i % 3) * 8, 0, 0, 6.3); c.fill(); }
    for (let i = 0; i < 40; i++) { const x = 520 + ((i * 97) % 640) - fz * 120, y = 420 + ((i * 53) % 180); c.fillStyle = 'rgba(244,252,255,' + (0.5 * fz * ((i % 3) / 3 + 0.3)) + ')'; c.fillRect(x, y, 2.4, 2.4); }
    cutVig(c);
  }

  /* ---------- 潮 ---------- */
  const POOLS = JX.scenes.chaoyindong.pools;
  function dam(i, on) { W.blocks = W.blocks.filter(b => b.tide !== i); if (on) { const q = POOLS[i], b = [q[0] - 16, 640, q[1] - q[0] + 32, 270]; b.tide = i; W.blocks.push(b); } W.regrid(); }
  const surge = (i, to, sec) => { const a0 = W.tide[i]; if (to > a0) JX.audio.sfx('splash', 0.25); return tw(sec, q => { W.tide[i] = a0 + (to - a0) * q; }); };
  async function ebb(i, sec) { await surge(i, 0, sec); W.tide[i] = 0; dam(i, false); }

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop3b = JX.populate;
  JX.populate = function (id) {
    pop3b(id);
    const sg = JX.state.stage, off = W.exitsOff;
    if (id === 'chaoyindong') {
      W.tide = [1, 1, 1]; W.prints = []; [0, 1, 2].forEach(i => dam(i, true));
      if (sg === 39) W.add('xiaoni', 'xiaoni', 350, 800, { dir: 1, tag: '小尼', solid: false });
    }
    if (id === 'dongdi') {
      W.add('qiushui', 'qiushui2', 900, 744, { dir: 3, tag: '阑珊', solid: false, carry: 'sword' });
      W.add('sichen', 'sichen', 1340, 772, { dir: 1, tag: '司辰', solid: false, carry: 'chi', draw: drawSi });
      W.add('lt1', 'lingtai', 1470, 706, { dir: 1, solid: false, carry: 'chi' }); W.add('lt2', 'lingtai', 1490, 832, { dir: 1, solid: false, carry: 'chi' });
      W.add('jiang', { h: 4 }, 640, 872, { solid: false, draw: drawOar });
      off['dongdi:up'] = '话还没有说完。';
    }
    if (id === 'shanmen' && sg >= 41) {                              // 第七场：两个人在山门外等着，小尼扫她的地
      const x = W.byId.xiali, t = W.byId.tingxue, n = W.byId.xiaoni, z = W.byId.zhou;
      if (x) { x.x = 1640; x.y = 744; x.dir = 1; } if (t) { t.x = 1704; t.y = 848; t.dir = 1; t.pose = 'squat'; }
      if (n) { n.x = 1930; n.y = 706; n.dir = 1; n.solid = false; n.reach = 0; } if (z) { z.x = 1962; z.y = 708; z.fall = 0; }
      off['shanmen:gate'] = '现在不是进去的时候。';
    }
    if (id === 'roof' && sg === 42) {                                // 忆三：去年秋夜的屋顶，只有老酒鬼一个
      ['xiali', 'xieke', 'rope'].forEach(k => W.remove(k));
      W.add('fan', 'fan', 1080, 640, { dir: 1, tag: '范醉翁', pose: 'sit', seat: 6, reach: 170, solid: false });
    }
  };

  /* ---------- 演出 ---------- */
  const DS = { p: [790, 822], q: [930, 720], s: [1330, 760], a: [1470, 690], b: [1480, 826] };              // 洞底一战各人站的地方
  const GS = { x: [1470, 776], t: [1620, 826], z: [1640, 736], jin: [980, 770], lt: [[1250, 712], [1196, 770], [1256, 826]] };      // 脚都站在 830 以上，免得给指令框和对白框挡住      // 山门一战
  Object.assign(H, {
    /* —— 五　潮音洞 —— */
    async 入三五() { ch3(39, 1); },
    async 小尼回去() {
      const n = W.byId.xiaoni, p = W.player; JX.audio.amb('chao', 0.3); p.path = null; p.dir = 3;
      if (n) { n.dir = 3; await nap(0.8); n.dir = 1; await nap(0.5); await W.walk(n, 110, 840, { speed: fast(230), dir: 1 }); n.vis = false; }
    },
    async 退潮一() { const p = W.player; p.dir = 3; await surge(0, 0.72, 0.9); await surge(0, 1, 0.9); await ebb(0, 2.4); W.prints = [[1010, 800, 8, 9, 30]]; await nap(0.4); },
    async 看靴印() { W.prints = [[1010, 800, 8, 12, 30], [1170, 772, 12, 6, 34], [1160, 812, 12, 6, 34], [1186, 850, 12, 6, 34]]; W.player.dir = 3; await nap(0.3); },
    async 退潮二() { const p = W.player; p.dir = 3; await surge(1, 0.6, 1.0); await surge(1, 1, 0.9); await surge(1, 0.34, 1.1); await surge(1, 0.8, 0.9); await ebb(1, 2.0); await nap(0.3); },
    async 呵气() { const p = W.player; p.dir = 3; breath(p); await nap(0.8); },
    async 刀又响() { JX.audio.sfx('ming'); await nap(1.5); },
    async 退潮三() { const p = W.player; p.dir = 3; await surge(2, 0.7, 0.9); await surge(2, 1, 0.8); await ebb(2, 2.4); await nap(0.3); },
    async 回头看水() { const p = W.player; p.dir = 1; W.focus = { x: p.x - 380, y: 640 }; await nap(0.5); W.tide[0] = 1; dam(0, true); await surge(1, 1, 1.6); dam(1, true); await nap(0.6); W.focus = null; },
    /* —— 六　这里没有阑珊 —— */
    async 入三六() { ch3(40, 1); },
    async 潮声轻() { JX.audio.amb('chao', 0.14); breath(W.player); },
    async 两剑相对() {
      const p = W.player, q = W.byId.qiushui; p.path = null; await W.walk(p, 760, 778, { speed: 150, dir: 3 }); p.dir = 3; W.focus = { x: 1000, y: 620 };
      JX.audio.sfx('ming'); await nap(0.9); JX.audio.sfx('han'); if (q) puff(q); await nap(1.0);
    },
    async 看两剑() { JX.audio.sfx('ming', 0.7); await cutSteps(drawPair, [[0, 0.45, 1.8, ['两口剑，相距三步。', '一口在响，很低，像隔着一层水。']], [0.45, 1, 2.0, ['一口不响。它身上的白气往下淌，淌到地上，朝这边漫过来。', '石室里一下子冷了，像有人推开了一扇朝北的窗。']]]); },
    async 改名() { const q = W.byId.qiushui; if (q) q.tag = '秋水'; },
    async 司辰举尺() { const s = W.byId.sichen; W.focus = { x: 1120, y: 620 }; if (s) { await tw(0.3, k => { s.z = Math.sin(k * Math.PI) * 6; }); s.z = 0; } await nap(0.7); },
    async 捡船桨() { const p = W.player; W.focus = { x: 860, y: 660 }; await W.walk(p, 690, 850, { speed: 200, dir: 3 }); p.pose = 'squat'; await nap(0.4); W.remove('jiang'); JX.audio.sfx('tick'); p.pose = null; p.carry = 'oar'; await W.walk(p, DS.p[0], DS.p[1], { speed: 220, dir: 3 }); p.dir = 3; await nap(0.3); },
    async 战司辰() {
      const B = JX.battle, p = W.player, q = W.byId.qiushui || W.add('qiushui', 'qiushui2', DS.q[0], DS.q[1], { dir: 3, tag: '秋水', solid: false, carry: 'sword' });
      const S = W.byId.sichen, ds = [W.byId.lt1, W.byId.lt2];
      const NAME = { jingzhe: '阿蛰', qiushui: '秋水' }, DODGE = { jingzhe: 'bu', qiushui: 'leng' };
      const boss = b => b.units.find(z => z.key === 'sichen');
      const liang = { name: '量', kind: 'wait', tell: '铜尺平举着——他在量人。这一手不伤人', say: '司辰的铜尺平平地指了过来——',
        fx: async (b, u) => { const live = b.units.filter(z => z.side === 'ally' && z.hp > 0), want = ++b.nMark % 2 ? 'jingzhe' : 'qiushui', t = live.find(z => z.key === want) || live[0]; if (!t) return; b.mark = t.key; JX.audio.sfx('tick'); B.fx.floater(t, '被量住了', '#e6cf8a'); await B.fx.wait(0.5); } };
      const chi = key => ({ name: '一尺', type: 'heavy', pow: 2.2, delay: 1.1, tell: '铜尺举起来了——量准了的那一尺，冲着' + NAME[key] + '，又准又重', pick: (b, pool) => pool.find(z => z.key === b.mark) || pool[0],
        fx: async (b, u) => { if (b.last && b.last.r.evade) { u.stun = 1; u.note = '一尺量空了，收不住'; B.fx.floater(u, '量空了', '#d9c27a'); await B.fx.wait(0.4); } b.mark = null; } });
      const dian = { name: '铜尺·点', tell: '尺头点过来，不重', type: 'light', pow: 1, pick: (b, pool) => pool.find(z => z.key !== b.mark) || pool[0] };
      const place = () => {
        p.x = DS.p[0]; p.y = DS.p[1]; p.dir = 3; p.pose = null; p.carry = 'oar'; p.path = null; q.x = DS.q[0]; q.y = DS.q[1]; q.dir = 3; q.pose = null; q.carry = 'sword'; q.path = null; q.tag = '秋水';
        S.x = DS.s[0]; S.y = DS.s[1]; S.dir = 1; S.vis = true; S.alpha = 1; ds.forEach((e, i) => { const s = i ? DS.b : DS.a; e.x = s[0]; e.y = s[1]; e.dir = 1; e.vis = true; e.alpha = 1; e.pose = null; }); W.remove('jiang');
      };
      const rec = (b, u) => {
        const Sx = boss(b), other = NAME[u.key === 'jingzhe' ? 'qiushui' : 'jingzhe'];
        if (Sx.stun) return { pick: u.key === 'jingzhe' ? 'dian' : 'ping', target: 'sichen', hint: '他一尺量空了，收不住——趁现在打他！' };
        if (b.mark === u.key) return { pick: DODGE[u.key], hint: '他量的是你——这一手先闪。等那一尺落空，他自己就站不稳。' };
        return { pick: u.key === 'jingzhe' ? 'dian' : 'zhu', target: 'sichen', hint: b.mark ? '他量的是' + other + '，不是你。这一手只管打。' : '他还在量。这一手只管打。' };
      };
      for (let lost = 0; ;) {
        place();
        const me = fighters(p, null)[0];
        me.cmds[0] = Object.assign({}, me.cmds[0], { name: '断桨·点', desc: '半截船桨，专点手腕。出手快，下一手来得早。' });
        me.cmds[1] = Object.assign({}, me.cmds[1], { name: '断桨·扫', desc: '船桨横扫，面前的都带到。出手慢，下一手来得迟。' });
        const r = await B.run({
          goal: '他“量”谁，谁就先闪；等那一尺量空了，两个人一齐打他', music: 'jiaofeng', season: 2, seasonEvery: 5, zoom: 1.06, focus: { x: 1150, y: 730 },
          allies: [me, { ent: q, key: 'qiushui', name: '辛秋水', hp: 105, spd: 12.5, atk: 26, def: 5, season: 2, cmds: [
            { id: 'zhu', name: '大珠小珠', kind: 'attack', type: 'light', pow: 0.9, delay: 0.8, desc: '剑尖连点，一下接着一下，像珠子落在盘里。出手快，下一手来得早。' },
            { id: 'ping', name: '银瓶乍破', kind: 'attack', type: 'heavy', pow: 1.5, delay: 1.2, desc: '蓄住了再出，一剑破进去。打在站不稳的人身上格外重。出手慢。' },
            { id: 'leng', name: '冷月无声', kind: 'dodge', desc: '身子一侧，人已经让开了，剑还横在原处。重手躲得开；快手只能躲开一半。' }] }],
          foes: [{ ent: S, key: 'sichen', name: '司辰', hp: 320, spd: 11, atk: 20, def: 6, boss: true, keep: true, ai: b => (b.mark ? chi(b.mark) : liang) }]
            .concat(ds.map((e, i) => ({ ent: e, key: 'lt' + (i + 1), name: i ? '灵台弟子乙' : '灵台弟子甲', hp: 70, spd: 8 - i * 0.6, atk: 9, def: 2, keep: true, ai: () => dian }))),
          start(b) { b.nMark = 0; b.mark = null; },
          allow: rec,
          autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id); },
          resolve(b, a, m, tg, r2) {
            if (tg.key === 'sichen' && !tg.stun && !r2.evade && r2.dmg > 0) { r2.dmg = Math.max(1, Math.round(r2.dmg * 0.35)); r2.block = true; }      // 他站得稳的时候，铜尺一拨，卸掉大半
            return r2;
          },
          end(b) { const Sx = boss(b); return Sx.hp <= Sx.hpMax * 0.4 ? 'win' : b.units.some(z => z.side === 'ally' && z.hp <= 0) ? 'lose' : null; },
          async after(b, u) { const Sx = boss(b); if (!Sx.stun && Sx.note) Sx.note = ''; },
        });
        if (r.result === 'win') break;
        await UI.narrate('那一尺结结实实量在了肩上，半边身子都麻了。——不对，这一场还没完，再来。');
        if (await giveUp(++lost)) break;
        await UI.tutorial('再来一次', '<b>两个人里有一个倒下就算输。</b><br>司辰那一栏写着“量准了的那一尺，冲着某某”的时候，<b>被点了名的那个人先闪</b>：阿蛰用<b>踏潮步</b>，秋水用<b>冷月无声</b>。<br>一尺落空，他会“失衡”一阵，这时候两个人打他才打得实。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令上，照着按回车就行。');
      }
      [p, q].forEach(e => { e.pose = null; }); p.x = DS.p[0]; p.y = DS.p[1]; p.dir = 3; q.x = DS.q[0]; q.y = DS.q[1]; q.dir = 3; S.x = DS.s[0] + 60; S.y = DS.s[1]; S.dir = 1; S.carry = null;
      W.focus = { x: 1120, y: 640 }; await nap(0.4);
    },
    async 上头弦响() { JX.audio.sfx('tiexian', 0.6); const p = W.player, q = W.byId.qiushui; W.focus = { x: 1000, y: 420 }; await nap(1.0); if (p) p.dir = 2; if (q) q.dir = 2; await nap(0.5); W.focus = { x: 1000, y: 640 }; },
    async 司辰走() {
      const es = ['sichen', 'lt1', 'lt2'].map(k => W.byId[k]).filter(Boolean), p = W.player, q = W.byId.qiushui; if (p) p.dir = 3; if (q) q.dir = 3;
      await Promise.all(es.map((e, i) => JX.sleep(JX.auto ? 0 : i * 0.3).then(() => W.walk(e, 1000, 900, { speed: fast(170), straight: true })).then(() => W.walk(e, 170, 880, { speed: fast(190), straight: true })).then(() => { e.vis = false; })));
      if (p) p.dir = 1; if (q) q.dir = 1; await nap(0.3);
    },
    async 秋水先走() { const q = W.byId.qiushui, p = W.player; W.focus = null; if (q) { await W.walk(q, p.x + 10, p.y - 40, { speed: fast(210), straight: true, dir: 1 }); puff(p); JX.audio.sfx('han', 0.5); await W.walk(q, 300, 800, { speed: fast(240), straight: true, dir: 1 }); } },
    /* —— 七　多看的那一眼 —— */
    async 入三七() { const p = ch3(41, 1); p.vis = false; },
    async 开场七() { W.focus = { x: 1560, y: 640 }; W.camSnap = true; },
    async 神尼出门() {
      JX.audio.sfx('door', 0.6); const x = W.byId.xiali, t = W.byId.tingxue;
      const z = W.add('jizhao', 'jizhao', 1780, 596, { dir: 0, tag: '寂照神尼', solid: false, alpha: 0 });
      await tw(0.5, k => { z.alpha = k; }); await W.walk(z, 1780, 700, { speed: fast(110), straight: true, dir: 0 }); if (x) x.dir = 3; if (t) { t.pose = null; t.dir = 3; } await nap(0.4);
    },
    async 看夏离() { const z = W.byId.jizhao; if (z) z.dir = 1; await nap(0.7); },
    async 看听雪() { const z = W.byId.jizhao; if (z) { z.dir = 0; await W.walk(z, 1760, 760, { speed: fast(70), straight: true, dir: 0 }); z.dir = 1; } W.zoom = 1.18; W.focus = { x: 1700, y: 700 }; await nap(2.2); },
    async 神尼看路() { const z = W.byId.jizhao; W.zoom = 1; W.focus = { x: 1400, y: 640 }; if (z) z.dir = 1; await nap(0.8); },
    async 金琵琶上山() {
      JX.audio.sfx('tiexian', 0.7); W.focus = { x: 760, y: 640 }; await nap(1.0);
      const j = W.add('jin', 'jinpipa', 60, 800, { dir: 3, tag: '金琵琶', solid: false, draw: drawJin2, ring: 0 });
      const ls = GS.lt.map((s, i) => W.add('lg' + (i + 1), 'lingtai', -40 - i * 70, 760 + i * 50, { dir: 3, solid: false, carry: 'chi' }));
      const x = W.byId.xiali, t = W.byId.tingxue; if (x) { x.dir = 1; x.carry = 'saber'; } if (t) t.dir = 1;
      const go = (e, s, d) => JX.sleep(JX.auto ? 0 : d).then(() => W.walk(e, s[0], s[1], { speed: fast(200), straight: true, dir: 3 }));
      JX.tween(JX.auto ? 0.02 : 4.2, k => { W.focus = { x: 760 + 640 * k, y: 640 }; });
      await Promise.all([go(j, GS.jin, 0)].concat(ls.map((e, i) => go(e, GS.lt[i], 0.5 + i * 0.3)))); await nap(0.3);
    },
    async 小尼进门() { const n = W.byId.xiaoni, z = W.byId.zhou; if (z) JX.tween(JX.auto ? 0.02 : 0.4, k => { z.fall = k; }).then(() => JX.audio.sfx('tick')); if (n) { await W.walk(n, 1790, 660, { speed: fast(320), straight: true }); await W.walk(n, 1780, 592, { speed: fast(320), straight: true, dir: 2 }); n.vis = false; } },
    async 守庵站位() {
      const x = W.byId.xiali, t = W.byId.tingxue, z = W.byId.jizhao;
      if (x) W.walk(x, GS.x[0], GS.x[1], { speed: fast(240), dir: 1 }); if (z) W.walk(z, GS.z[0], GS.z[1], { speed: fast(160), dir: 1 }); if (t) await W.walk(t, GS.t[0], GS.t[1], { speed: fast(260), dir: 1 }); await nap(0.4);
    },
    async 守庵战() {
      const B = JX.battle, p = W.player, x = W.byId.xiali, t = W.byId.tingxue, z = W.byId.jizhao || W.add('jizhao', 'jizhao', GS.z[0], GS.z[1], { dir: 1, tag: '寂照神尼', solid: false });
      const jin = W.byId.jin || W.add('jin', 'jinpipa', GS.jin[0], GS.jin[1], { dir: 3, tag: '金琵琶', solid: false, draw: drawJin2, ring: 0 });
      const es = GS.lt.map((s, i) => W.byId['lg' + (i + 1)] || W.add('lg' + (i + 1), 'lingtai', s[0], s[1], { dir: 3, solid: false, carry: 'chi' }));
      const NM = ['青袍人甲', '青袍人乙', '青袍人丙'], WHO = ['xiali', 'tingxue', 'xiali'];
      const allies = b => b.units.filter(u => u.side === 'ally' && u.hp > 0), foes = b => b.units.filter(u => u.side === 'foe' && u.key !== 'jin' && u.hp > 0);
      const ring = () => JX.tween(JX.auto ? 0.02 : 0.9, k => { jin.ring = k; }).then(() => { jin.ring = 0; });
      const aim = i => (b, pool) => pool.find(u => u.key === WHO[i]) || pool[0];
      const bo = { name: '裂帛', kind: 'wait', tell: '手指按上了弦——要拨了', say: '金琵琶五指一划——',
        fx: async b => { JX.audio.sfx('tiexian'); ring(); await B.fx.wait(0.35);
          if (b.ding) { b.ding = false; allies(b).forEach(u => B.fx.floater(u, '镇住了，琴声进不来', '#f0e2b0')); }
          else { allies(b).forEach(u => { u.stun = Math.max(u.stun, 1); u.hp = Math.max(1, u.hp - B.soak(10)); B.fx.floater(u, '内息一乱', '#ff9a8a'); B.fx.shake(u); }); }
          await B.fx.wait(0.4); } };
      const lun = { name: '轮指', kind: 'wait', tell: '手指在弦上慢慢轮着——这一手不伤人', say: '金琵琶的手指在弦上慢慢轮着。', fx: async () => { JX.audio.sfx('xian', 0.4); await B.fx.wait(0.3); } };
      const place = () => {
        x.x = GS.x[0]; x.y = GS.x[1]; x.dir = 1; x.pose = null; x.carry = 'saber'; x.path = null; t.x = GS.t[0]; t.y = GS.t[1]; t.dir = 1; t.pose = null; t.carry = null; t.path = null; z.x = GS.z[0]; z.y = GS.z[1]; z.dir = 1; z.pose = null; z.path = null; z.alpha = 1; z.vis = true;
        es.forEach((e, i) => { e.x = GS.lt[i][0]; e.y = GS.lt[i][1]; e.dir = 3; e.vis = true; e.alpha = 1; e.z = 0; e.pose = null; e.carry = 'chi'; });
        jin.x = GS.jin[0]; jin.y = GS.jin[1]; jin.dir = 3; jin.vis = true; jin.alpha = 1; jin.ring = 0;
      };
      const rec = (b, u) => {
        const J = b.units.find(q => q.key === 'jin'), wob = foes(b).filter(q => q.stun > 0), firm = foes(b).filter(q => !q.stun);
        if (u.key === 'jizhao') {
          if (J.intent === bo && !b.ding) return { pick: 'zhen', hint: '他的手指按上弦了——用“潮音·镇”，这一声琴就进不来。' };
          return firm.length ? { pick: 'fu', target: firm[firm.length - 1].key, hint: '袖子拂他一下，叫他站不稳——听雪好下手。' } : { pick: 'fu', target: (foes(b)[0] || {}).key, hint: '都站不稳了。袖子再拂一下。' };
        }
        if (u.key === 'tingxue') return wob.length ? { pick: 'tui', target: wob[0].key, hint: '他站不稳——一掌送他滚下山路！' } : { pick: 'tui', target: (foes(b)[0] || {}).key, hint: '他们都站稳了，这一掌先打着。等夏离摔倒一个。' };
        return firm.length ? { pick: 'shuai', target: firm[0].key, hint: '抢进去摔他一跤——倒在地上的，听雪一掌就送下去。' } : { pick: 'zhan', target: (wob[0] || {}).key, hint: '都倒着呢。一刀下去，实打实。' };
      };
      for (let lost = 0; ;) {
        place();
        const xl = fighters(p, x)[1];
        const r = await B.run({
          goal: '他一按弦，神尼就“镇”；青袍人：摔倒一个，听雪一掌送下山路一个', music: 'jiaofeng', season: 1, seasonEvery: 5, zoom: 1.04, focus: { x: 1340, y: 720 }, flip: true,
          allies: [xl,
            { ent: t, key: 'tingxue', name: '耶律听雪', hp: 110, spd: 12, atk: 24, def: 5, season: 3, cmds: [
              { id: 'tui', name: '绵掌·推', kind: 'attack', type: 'light', pow: 0.9, desc: '一掌按在胸口，劲是往外送的。对面要是正站不稳，这一掌就送他滚下山路。' },
              { id: 'shan', name: '闪', kind: 'dodge', desc: '身子一矮，从铜尺底下钻过去。' }] },
            { ent: z, key: 'jizhao', name: '寂照神尼', hp: 90, spd: 12.5, atk: 16, def: 6, cmds: [
              { id: 'zhen', name: '潮音·镇', kind: 'talk', desc: '一口气沉下去，像潮水压过滩。下一声琴响，三个人都不受扰。', say: '老尼的嘴唇动了一下——', fx: async (b, u) => { b.ding = true; B.fx.floater(u, '镇', '#f0e2b0'); } },
              { id: 'fu', name: '拂袖', kind: 'attack', type: 'light', pow: 0.7, desc: '袖子一拂，劲在袖子外头。挨着的人要晃好一阵——站不稳的，听雪一掌就送得下去。' }] }],
          foes: es.map((e, i) => ({ ent: e, key: 'lg' + (i + 1), name: NM[i], hp: 80, spd: 10 - i * 0.5, atk: 13, def: 2, keep: true, n: i,
            ai: (b, u) => (++u.n % 3 === 0 ? { name: '铜尺·劈', tell: '铜尺举过了头——劈下来，重', type: 'heavy', pow: 1.6, delay: 1.2, pick: aim(i) } : { name: '铜尺·点', tell: '尺头点过来，快', type: 'light', pow: 1, pick: aim(i) }) }))
            .concat([{ ent: jin, key: 'jin', name: '金琵琶', hp: 999, spd: 12, atk: 0, def: 0, boss: true, keep: true, showHp: false, n: 0, note: '隔着三丈山路，琴声挡着，近不了身', ai: (b, u) => (++u.n % 2 ? bo : lun) }]),
          allow: rec,
          autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id); },
          resolve(b, a, m, tg, r2) {
            if (tg.key === 'jin') return { evade: false, block: true, dmg: 0, iron: '近不了身' };
            if ((m.id === 'shuai' || m.id === 'fu') && tg.side === 'foe' && !r2.evade) { tg.stun = Math.max(tg.stun, 2); tg.note = m.id === 'shuai' ? '摔在地上，一时起不来' : '站不稳'; }
            if (a.key === 'tingxue' && m.id === 'tui' && tg.side === 'foe' && tg.stun > 0) return { evade: false, block: false, dmg: tg.hp };
            return r2;
          },
          end(b) { return foes(b).length === 0 ? 'win' : b.units.some(u => u.side === 'ally' && u.hp <= 0) ? 'lose' : null; },
          async after(b) {
            for (const q of b.units) if (q.side === 'foe' && q.key !== 'jin') {
              if (q.hp <= 0 && !q.gone) { q.gone = true; B.fx.floater(q, '滚下去了！', '#bfe3d0'); await tumble(q.ent); }
              else if (!q.stun && q.note) q.note = '';
            }
          },
        });
        if (r.result === 'win') break;
        await UI.narrate('琴声钻进耳朵里，眼前一黑。——不对，这一场还没完，再来。');
        if (await giveUp(++lost)) break;
        await UI.tutorial('再来一次', '<b>三个人里有一个倒下就算输。</b><br>金琵琶那一栏写着“手指按上了弦”的时候，神尼先用<b>潮音·镇</b>——不镇，三个人都要乱一手、白挨一轮打。<br>别的时候：夏离<b>摔</b>、神尼<b>拂袖</b>，叫青袍人站不稳；听雪<b>绵掌·推</b>，一掌一个送下山路。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令上，照着按回车就行。');
      }
      es.forEach(e => { e.vis = false; }); x.x = GS.x[0]; x.y = GS.x[1]; x.dir = 1; x.pose = null; t.x = GS.t[0]; t.y = GS.t[1]; t.dir = 1; t.pose = null; z.x = GS.z[0]; z.y = GS.z[1]; z.dir = 1; z.pose = null;
      W.focus = { x: 1300, y: 660 }; await nap(0.4);
    },
    async 侧脸() { W.focus = { x: 1300, y: 680 }; await nap(1.2); },
    async 偷袭() {
      const j = W.byId.jin, t = W.byId.tingxue, z = W.byId.jizhao; if (!j || !t || !z) return;
      JX.audio.sfx('xian'); const fly = needle(j, { x: t.x - 50, y: t.y }, JX.auto ? 0.02 : 0.5);
      await nap(0.22); const x0 = z.x, y0 = z.y; await tw(0.2, k => { z.x = x0 + (t.x - 60 - x0) * k; z.y = y0 + (t.y - 2 - y0) * k; }); z.dir = 1; await fly;
      JX.audio.sfx('wrong'); pop(z, '挡下了', '#ff9a8a'); const xx = z.x; await tw(0.4, k => { z.x = xx + Math.sin(k * 26) * 7 * (1 - k); }); z.x = xx; t.dir = 1; await nap(0.5);
    },
    async 神尼坐下() { const z = W.byId.jizhao, t = W.byId.tingxue, x = W.byId.xiali; if (z) { z.pose = 'sit'; z.seat = 2; z.closed = true; } if (t) { t.x = z.x + 72; t.y = z.y + 4; t.dir = 1; t.pose = 'squat'; } if (x) x.dir = 3; await nap(0.9); if (x) x.dir = 1; },
    async 惊蛰赶到() {
      const p = W.player; p.vis = true; p.x = 2290; p.y = 806; p.dir = 1; p.carry = 'oar'; p.path = null;
      const q = W.add('qiushui', 'qiushui2', 2240, 770, { dir: 1, tag: '秋水', solid: false, carry: 'sword' });
      W.focus = { x: 1640, y: 660 }; W.walk(p, 1960, 806, { speed: fast(300), straight: true, dir: 1 }); await W.walk(q, 1850, 770, { speed: fast(320), straight: true, dir: 1 }); await nap(0.3);
    },
    async 按四弦() { W.focus = { x: 1300, y: 680 }; await nap(0.8); },
    async 桨断() {
      const p = W.player, j = W.byId.jin; W.focus = { x: 1300, y: 690 };
      await W.walk(p, 1340, 826, { speed: fast(340), straight: true, dir: 1 }); p.dir = 1;
      JX.audio.sfx('tiexian'); if (j) JX.tween(JX.auto ? 0.02 : 0.9, k => { j.ring = k; }).then(() => { j.ring = 0; }); await nap(0.4);
      p.carry = null; W.add('duan', { h: 4 }, p.x - 76, p.y + 16, { solid: false, draw: drawHalves }); JX.audio.sfx('pop'); pop(p, '桨裂了', '#ff9a8a'); const x0 = p.x; await tw(0.4, k => { p.x = x0 + Math.sin(k * 26) * 8 * (1 - k) + 40 * k; }); await nap(0.4);
    },
    async 众人伏() { const x = W.byId.xiali, q = W.byId.qiushui; if (x) x.pose = 'squat'; if (q) { const x0 = q.x; await tw(0.5, k => { q.x = x0 + 110 * k; }); } await nap(0.6); },
    async 再按弦() { W.focus = { x: 1240, y: 690 }; await nap(1.0); },
    async 手按刀() { const p = W.player; p.dir = 1; W.focus = { x: p.x, y: p.y - 70 }; W.zoom = 1.3; JX.audio.sfx('ming'); await nap(1.6); },
    /* —— 八　忆三　拜师 —— */
    async 入三八() { const p = ch3(42, 1); UI.tone('sepia'); UI.purse(null); p.carry = 'jar'; },
    async 放酒坛() { const p = W.player, f = W.byId.fan; p.path = null; await W.walk(p, 900, 690, { speed: 200, dir: 3 }); p.dir = 3; p.pose = 'squat'; await nap(0.4); p.carry = null; W.add('tan', { h: 44 }, 990, 676, { solid: false, draw: drawTan }); JX.audio.sfx('tick'); p.pose = null; W.focus = { x: 990, y: 560 }; await nap(0.4); },
    async 拔酒刀() { const p = W.player; JX.audio.sfx('page'); p.carry = 'jiudao'; await nap(0.6); },
    async 范老起身() { const f = W.byId.fan; if (f) { f.pose = null; f.carry = 'kuai'; f.x = 1110; f.y = 690; f.dir = 1; } JX.audio.sfx('tick'); await nap(0.5); },
    async 学剑() {
      const B = JX.battle, p = W.player, f = W.byId.fan || W.add('fan', 'fan', 1110, 690, { dir: 1, tag: '范醉翁', solid: false });
      f.pose = null; f.carry = 'kuai'; f.x = 1110; f.y = 690; f.dir = 1; p.x = 880; p.y = 700; p.dir = 3; p.carry = 'jiudao'; p.pose = null; p.path = null;
      const fanSay = (text, mood) => UI.say('fan', '范醉翁', text, mood), meSay = (text, mood) => UI.say('jingzhe', '陆惊蛰', text, mood);
      const TELL = [
        { name: '点', kind: 'wait', tell: '筷子尖对着你的手腕——他要点过来了' },
        { name: '等', kind: 'wait', tell: '他退开了三步，筷子横在身前——等你过去' },
        { name: '立', kind: 'wait', tell: '筷子竖在眼前，一动不动' }];
      const MOVES = [
        { id: 'tiao', name: '挑灯看剑', kind: 'talk', say: '陆惊蛰：挑灯看剑', desc: '第一式。刀尖自下而上，一挑。挑的是灯芯——也是对面的手腕。',
          fx: async (b, u) => { const F = b.units.find(q => q.key === 'fan'); await B.fx.lunge(F, u, 0.62); JX.audio.sfx('tick'); await B.fx.tw(0.16, k => { p.z = Math.sin(k * Math.PI) * 16; }); p.z = 0; B.fx.floater(F, '筷子给挑开了', '#f0e2b0'); await B.fx.back(F); } },
        { id: 'jiao', name: '吹角连营', kind: 'talk', say: '陆惊蛰：吹角连营', desc: '第二式。角声一营接着一营传过去：一刀出去，后头还跟着两刀。',
          fx: async (b, u) => { const F = b.units.find(q => q.key === 'fan'); for (let i = 0; i < 3; i++) { await B.fx.lunge(u, F, 0.5 + i * 0.14); JX.audio.sfx('page'); B.fx.floater(F, ['一', '二', '三'][i], '#f0e2b0'); const x0 = f.x; await B.fx.tw(0.12, k => { f.x = x0 + 26 * k; }); } await B.fx.back(u); await B.fx.tw(0.3, k => { f.x = F.home.x + 78 * (1 - k); }); f.x = F.home.x; } },
        { id: 'pili', name: '霹雳弦惊', kind: 'talk', say: '陆惊蛰：霹雳弦惊', desc: '第三式。弓弦一响，箭已经到了。这一式没有收手，只有出手。',
          fx: async (b, u) => { const F = b.units.find(q => q.key === 'fan'); await B.fx.wait(0.3); await B.fx.lunge(u, F, 0.86); JX.audio.sfx('pop'); f.carry = 'kuai2'; B.fx.floater(F, '筷子断了', '#ff9a8a'); await B.fx.shake(F); await B.fx.back(u); } }];
      MOVES.forEach((m, i) => { m.when = b => b.ph === i; });
      await B.run({
        goal: '照范醉翁说的，一式一式使出来——按回车', wheel: false, zoom: 1.12, focus: { x: 1000, y: 640 },
        allies: [{ ent: p, key: 'jingzhe', name: '陆惊蛰', hp: 130, spd: 13, atk: 22, def: 6, cmds: MOVES }],
        foes: [{ ent: f, key: 'fan', name: '范醉翁', hp: 999, spd: 1, atk: 0, def: 0, boss: true, keep: true, showHp: false, note: '手里一根筷子——是从发髻上拔下来的', ai: b => TELL[Math.min(2, b.ph || 0)] }],
        start(b) { b.ph = 0; },
        allow: b => ({ pick: MOVES[b.ph].id, hint: ['照他说的：刀尖从下往上，一挑。', '照他说的：一刀出去，后头跟上两刀。', '照他说的：不收手，只出手。'][b.ph] }),
        autoPick(b, u, cmds) { return cmds[0]; },
        end(b) { return b.ph >= 3 ? 'win' : null; },
        async after(b, u) {
          if (u.side !== 'ally') return; const F = b.units.find(q => q.key === 'fan'); b.ph++;
          if (b.ph === 1) await B.talk(async () => { await fanSay('手腕太僵。你是挑灯芯，不是撬棺材板。', 'cold'); await meSay('您刚才还说是开酒坛。', 'grin'); await fanSay('少废话。第二式，“吹角连营”。角声是一营接着一营传过去的——一刀出去，后头要跟得上。'); });
          else if (b.ph === 2) await B.talk(async () => { await fanSay('近了。角声哪有贴着人耳朵吹的？', 'cold'); await meSay('那该多远？'); await fanSay('……改天再纠。第三式，“霹雳弦惊”。弓弦一响，箭已经到了。这一式没有收手。'); });
          if (b.ph < 3) F.intent = TELL[b.ph];
        },
      });
      p.x = 880; p.y = 700; p.dir = 3; f.x = 1110; f.y = 690; f.dir = 1; f.carry = 'kuai2'; W.focus = { x: 1000, y: 580 }; await nap(0.4);
    },
    async 范老坐回() { const f = W.byId.fan; if (f) { f.carry = null; await W.walk(f, 1080, 640, { speed: fast(120), straight: true, dir: 1 }); f.pose = 'sit'; f.seat = 6; f.closed = true; f.bark = ['（鼾声）']; } await nap(0.6); },
    async 试玩到此六() {
      ST._endHtml = '<h2>试玩到此</h2><p>第三章《渔家傲》做到第八场：去年秋天的屋顶上，老酒鬼拿三式“开酒坛的手法”抵了三年的酒账。</p><p>后面回到山门前——他的手还按在刀柄上。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在屋顶看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      W.zoom = 1; W.focus = null; await H.试玩到此二();
    },
  });
  /* 滚下山路：往左一路翻下去 */
  async function tumble(e) { e.pose = null; e.carry = null; const x0 = e.x, y0 = e.y; JX.audio.sfx('door', 0.5); await tw(0.7, k => { e.x = x0 - 340 * k; e.y = y0 + 30 * k; e.z = Math.abs(Math.sin(k * Math.PI * 3)) * 44 * (1 - k); e.alpha = 1 - Math.max(0, (k - 0.6) / 0.4); }); e.vis = false; e.z = 0; }
  ST._h.b3 = { drawJin2, drawHalves, drawSi, pop, puff, breath, needle, tumble };      // 给第九场以后接着用
})();
