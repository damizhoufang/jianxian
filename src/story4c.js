/* 第四章《望海潮》的演出（三）：我姓陆 55、销账 56、往北 57、下一个是夏至 58。卷一到这里完。
   第九场在江堤留出来的那一段（沙滩口）：范老躺在堤沿上（自己画的：横着的小人，心口一个掌印，e.closed 是眼睛）。
   第十场回大堂：靠窗第三张桌没有人了，只有一只空壶、一只倒扣的盏。第十一场先在月轮山下（src/scenes14.js 的 yuelun），再回醉春楼的后门（后巷；门首那条街画的是元夕的灯市，八月里用不得）。
   第十二场的江堤是空的（src/scenes13.js 里按 stage>=58 画的），镜头里只有老道一个人，主角不出场。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks, Fig = JX.Fig;
  const { XL, ch4b } = ST._h;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const tw = (s, f, e) => JX.tween(JX.auto ? 0.02 : s, f, e);
  const fast = v => (JX.auto ? 2400 : v);
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';
  const PARTY = ['xiali', 'tingxue', 'qiushui'];

  /* ---------- 自己画的几样 ---------- */
  /* 躺着的范老：头朝西，心口一个掌印 */
  function drawFanLie(g, e) {
    P.shadow(g, 0, 0, 80, 10, 0.3); g.save(); g.translate(-10, -26); g.rotate(-Math.PI / 2); g.translate(0, 70);
    Fig.draw(g, e.sp, 0, 0, { shadow: false, closed: e.closed, smile: !e.closed });
    g.fillStyle = 'rgba(104,24,20,0.5)'; g.beginPath(); g.ellipse(1, -90, 8, 9, 0, 0, 6.3); g.fill(); for (let i = -2; i <= 2; i++) P.line(g, 1 + i * 3.6, -98, 1 + i * 5, -108 + Math.abs(i) * 2, 3, 'rgba(104,24,20,0.5)');
    g.restore();
  }
  /* 空壶、倒扣的盏 */
  function drawHuEmpty(g) {
    g.save(); g.translate(2, 0); g.fillStyle = P.hgrad(g, -14, 0, 28, [[0, '#7f9a94'], [0.5, '#c9dcd2'], [1, '#6f8a84']]); g.beginPath(); g.moveTo(-6, -40); g.lineTo(6, -40); g.quadraticCurveTo(8, -30, 15, -22); g.quadraticCurveTo(18, -4, 10, 0); g.lineTo(-10, 0); g.quadraticCurveTo(-18, -4, -15, -22); g.quadraticCurveTo(-8, -30, -6, -40); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.3; g.stroke();
    g.beginPath(); g.moveTo(14, -18); g.quadraticCurveTo(28, -22, 26, -34); g.stroke(); P.ellipse(g, 0, -40, 6, 2.6, '#2a2420', INK(), 1); g.restore();                // 壶口是开着的：塞子在一边
    P.ellipse(g, -22, -1, 5, 2.4, '#8e2a20', INK(), 1);
    g.fillStyle = '#e9e6dc'; g.beginPath(); g.moveTo(34, 0); g.lineTo(38, -11); g.lineTo(52, -11); g.lineTo(56, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.2; g.stroke(); P.line(g, 40, -11, 50, -11, 2.4, '#b9b6ac');      // 盏：倒扣着
  }
  /* 柜台上的布包 */
  function drawBao(g) { P.shadow(g, 0, 2, 30, 6, 0.3); g.fillStyle = '#4a5f7a'; g.beginPath(); g.moveTo(-28, 0); g.quadraticCurveTo(-34, -26, -8, -30); g.quadraticCurveTo(0, -42, 8, -30); g.quadraticCurveTo(34, -26, 28, 0); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.4; g.stroke(); P.line(g, -8, -30, -16, -40, 4, '#4a5f7a'); P.line(g, 8, -30, 16, -41, 4, '#4a5f7a'); P.line(g, -18, -14, 18, -10, 1, INK(0.4)); }
  /* 老道：收了伞夹在胳膊底下走 */
  function drawDaoSan(g, e) {
    Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, shadow: true });
    const sx = e.dir === 1 ? -1 : 1; g.save(); g.scale(sx, 1); P.line(g, -30, -62, 44, -100, 7, INK(0.9)); P.line(g, -30, -62, 44, -100, 5, '#8a8266'); P.line(g, 44, -100, 60, -108, 3, '#5a4630'); P.line(g, -36, -59, -30, -62, 3, '#5a4630'); g.restore();
  }
  const drawSan = g => JX.scenes13.umbrella(g);

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop6 = JX.populate;
  JX.populate = function (id) {
    pop6(id);
    const sg = JX.state.stage, off = W.exitsOff;
    if (id === 'hall') { const L = (W.sc.lights || []).find(l => l.gx === 1470 && l.glow); if (L) L.ga = sg === 56 ? 0 : 0.7; }      // 第十场：靠窗第三张桌上没有点灯
    if (sg < 55 || sg > 58) return;
    if (id === 'jiangdi' && sg === 55) {
      W.lingN = 14;
      for (let i = 0; i < 6; i++) { const e = W.byId['nong' + i]; if (e) { e.x = 1870 + i * 64; e.y = 652 + (i % 2) * 7; e.dir = i < 3 ? 3 : 1; e.draw = null; } }      // 抬他回来的六个弄潮儿：旗子放下了，站在后头
      W.add('fan', 'fan', 2010, 704, { tag: '范醉翁', solid: false, reach: 170, closed: true, draw: drawFanLie });
      W.add('tingxue', 'tingxue', 2034, 676, { dir: 0, tag: '听雪', solid: false, pose: 'squat' });
      W.add('xiali', XL(), 2140, 690, { dir: 1, tag: '夏离', solid: false });
      W.add('qiushui', 'qiushui2', 1826, 694, { dir: 3, tag: '秋水', solid: false });
      W.add('he', 'he', 2450, 716, { dir: 1, tag: '贺元度', solid: false });
      W.add('zd1', 'dashou', 2524, 694, { dir: 1, tag: '半闲堂的人', solid: false }); W.add('zd2', 'dashou', 2512, 760, { dir: 1, tag: '半闲堂的人', solid: false });
    }
    if (id === 'hall' && sg === 56) {
      W.remove('fan');
      const s = W.byId.siniang; if (s) { s.x = 780; s.y = 404; s.dir = 0; s.solid = false; s.reach = 170; s.bark = null; s.carry = 'book'; }
      W.add('hu', { h: 1 }, 1398, 418, { solid: false, draw: drawHuEmpty, sy: 486 });      // 排在桌子（480）后头画，不然给桌面盖住
      off['hall:door'] = '账还没有销。'; off['hall:stairs'] = '楼上这会儿没有他的事。'; off['hall:kitchen'] = '后厨这会儿不缺人手。';
    }
    if (id === 'yuelun' && sg === 57) {
      [[XL(), 320, 900], ['tingxue', 250, 940], ['qiushui2', 220, 880]].forEach((q, i) => W.add(PARTY[i], q[0], q[1], q[2], { dir: 3, tag: ['夏离', '听雪', '秋水'][i], solid: false, vis: false }));
    }
    if (id === 'alley' && sg === 57) {                               // 后门口：走的是后巷这扇门
      ['xiali', 'heiyi', 'heiyi2', 'heiyi3'].forEach(k => W.remove(k));
      off['alley:kitchen'] = '账清了，人就得走。';
      W.add('xiali', XL(), 560, 700, { dir: 1, tag: '夏离', solid: false });
      W.add('tingxue', 'tingxue', 470, 746, { dir: 2, tag: '听雪', solid: false });
      W.add('qiushui', 'qiushui2', 640, 646, { dir: 1, tag: '秋水', solid: false, carry: 'sword' });
      W.add('agui', 'agui', 262, 600, { dir: 0, tag: '阿桂', solid: false, vis: false });
    }
    if (id === 'jiangdi' && sg === 58) {
      W.add('san', { h: 1 }, 2620, 716, { solid: false, draw: drawSan });
      W.add('laodao', 'laodao', 2620, 692, { dir: 0, tag: '老道', pose: 'sit', seat: 30, solid: false });
    }
  };

  Object.assign(H, {
    /* —— 九　我姓陆 —— */
    async 入四九() { const p = ch4b(55); p.carry = null; },
    async 摆滩头() { W.lingN = 14; W.zoom = 1; W.focus = null; },
    async 到师父跟前() { const p = W.player; p.path = null; await W.walk(p, 1902, 710, { speed: 170, straight: true, dir: 3 }); p.dir = 3; p.pose = 'squat'; W.focus = { x: 2000, y: 640 }; W.zoom = 1.2; await nap(0.7); },
    async 贺隔人() { JX.audio.sfx('tick', 0.4); ['xiali', 'qiushui'].forEach(k => { const e = W.byId[k]; if (e) e.dir = 3; }); W.focus = { x: 2250, y: 640 }; W.zoom = 1.08; await nap(1); },
    async 抬头() { const p = W.player, x = W.byId.xiali, q = W.byId.qiushui; if (x) x.dir = 1; if (q) q.dir = 3; p.dir = 0; W.focus = { x: 1970, y: 620 }; W.zoom = 1.3; await nap(0.9); },
    async 睁眼() { const f = W.byId.fan; if (f) f.closed = false; W.focus = { x: 1960, y: 650 }; W.zoom = 1.5; await nap(0.9); },
    async 闭眼() { const f = W.byId.fan; if (f) f.closed = true; await nap(0.8); if (JX.audio.amb) JX.audio.amb('chao', 0.08); await nap(1); },
    /* —— 十　销账 —— */
    async 入四十() { const p = ch4b(56); p.carry = null; },
    async 望空桌() { W.zoom = 1; W.focus = { x: 1470, y: 600 }; await nap(1.2); },      // 镜头从门口摇到靠窗那一排
    async 看空桌() { const p = W.player; p.path = null; p.dir = 2; W.focus = { x: 1470, y: 440 }; W.zoom = 1.35; await nap(0.9); },
    async 柜前销账() { const p = W.player, s = W.byId.siniang; p.path = null; if (s) { W.face(p, s); s.dir = 0; s.carry = 'book'; W.focus = { x: s.x + 20, y: s.y + 40 }; } W.zoom = 1.3; JX.audio.sfx('page', 0.6); await nap(0.8); },
    async 推布包() { const s = W.byId.siniang; if (!s) return; s.carry = null; JX.audio.sfx('coin', 0.5); W.add('bao', { h: 1 }, s.x + 92, 396, { solid: false, draw: drawBao, sy: 470 }); /* 摆在柜面上：柜台是一件道具，排在 454，布包要盖在它上面 */ await nap(0.8); },
    async 打算盘() { const s = W.byId.siniang; if (s) s.dir = 0; for (let i = 0; i < 3; i++) { JX.audio.sfx('tick', 0.5); await nap(0.32); } await nap(1.2); JX.audio.sfx('tick', 0.5); await nap(0.4); JX.audio.sfx('tick', 0.5); await nap(0.5); },
    /* —— 十一　往北 —— */
    async 入四十一() { const p = ch4b(57); p.carry = 'jar'; W.dawn = 0; },
    async 浇酒() { const p = W.player; p.path = null; await W.walk(p, 1022, 806, { speed: 150, straight: true, dir: 3 }); p.dir = 3; W.focus = { x: 1150, y: 660 }; W.zoom = 1.2; await nap(0.6); JX.audio.sfx('shui', 0.5); await nap(1.4); p.carry = null; await nap(0.3); },
    async 三人近前() {
      const p = W.player, to = [[880, 856], [936, 906], [820, 806]];
      await Promise.all(PARTY.map((k, i) => { const e = W.byId[k]; if (!e) return null; e.vis = true; return W.walk(e, to[i][0], to[i][1], { speed: fast(170), straight: true, dir: 3 }); }));
      PARTY.forEach(k => { const e = W.byId[k]; if (e) e.dir = 3; }); p.dir = 1; W.focus = { x: 1000, y: 700 }; W.zoom = 1.15; await nap(0.4);
    },
    async 月轮日出() { const p = W.player; W.zoom = 1; W.focus = { x: 960, y: 540 }; p.dir = 3; await tw(4, k => { W.dawn = k; }); await nap(1); },
    async 入门首() { const p = ch4b(57); p.carry = null; W.dawn = 0; },
    async 摆门首() { const p = W.player; p.x = 400; p.y = 676; p.dir = 1; W.zoom = 1; W.focus = { x: 620, y: 600 }; W.camSnap = true; },
    async 阿桂送面() {
      const a = W.byId.agui, t = W.byId.tingxue, p = W.player; if (!a) return; a.vis = true; a.carry = 'sack'; JX.audio.sfx('door', 0.5); p.dir = 1;
      await W.walk(a, t ? t.x - 56 : 410, t ? t.y - 6 : 740, { speed: fast(230), straight: true, dir: 3 }); if (t) { t.dir = 1; a.dir = 3; } await nap(0.4); a.carry = null; if (t) t.carry = 'sack'; JX.audio.sfx('pop', 0.4); await nap(0.4);
    },
    async 四人上路() {
      const a = W.byId.agui, p = W.player; if (a) W.walk(a, 262, 606, { speed: fast(200), straight: true, dir: 0 }).then(() => { a.dir = 3; });
      W.focus = { x: 1140, y: 600 }; W.zoom = 1;
      const ys = { xiali: 700, tingxue: 760, qiushui: 650 }; PARTY.forEach(k => { const e = W.byId[k]; if (e) W.walk(e, 1960, ys[k], { speed: fast(150), straight: true, dir: 3 }).then(() => { e.vis = false; }); });
      await W.walk(p, 1960, 716, { speed: fast(150), straight: true, dir: 3 }); p.vis = false; await nap(0.8);
    },
    /* —— 十二　下一个是夏至 —— */
    async 入四十二() { const p = ch4b(58); p.carry = null; },
    async 摆收摊() { const p = W.player; p.vis = false; p.x = 2300; p.y = 830; W.zoom = 1; W.focus = { x: 2560, y: 560 }; W.camSnap = true; },
    async 翻历日() { const d = W.byId.laodao; if (!d) return; W.focus = { x: 2600, y: 600 }; W.zoom = 1.3; d.carry = 'book'; JX.audio.sfx('page', 0.6); await nap(1.2); JX.audio.sfx('tick', 0.4); await nap(0.6); },
    async 老道走了() {
      const d = W.byId.laodao; if (!d) return; d.carry = null; d.pose = null; d.y = 730; d.x = 2540; d.dir = 0; await nap(0.5); W.remove('san'); JX.audio.sfx('page', 0.5); d.draw = drawDaoSan; await nap(0.7);
      W.zoom = 1; W.focus = { x: 2400, y: 560 }; d.dir = 1; W.walk(d, 1500, 740, { speed: fast(84), straight: true, dir: 1 }); await nap(4.2); await tw(1.6, k => { d.alpha = 1 - k; }); d.vis = false;
    },
    async 卷一完() {
      const p = W.player, d = W.byId.laodao; if (d) { d.path = null; d.vis = false; } p.vis = true; p.x = 2300; p.y = 830; p.dir = 0; p.pose = null; W.zoom = 1; W.focus = null;
      ST._endHtml = '<h2>卷一《惊蛰》　完</h2><p>《青玉案》《钗头凤》《扬州慢》《渔家傲》《望海潮》，五章到这里。</p><p>跑堂的阿蛰说出了自己的姓。四个人往北去了。</p><p>卷二还没有做。</p><div class="btn jx-clickable" data-a="stay">留在江堤上看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      JX.state.stage = 59;                                         // 卷一演完了：线索页里“演完第十二场才出现”的那一条，这样才看得见
      await H.试玩到此二();
    },
  });
})();
