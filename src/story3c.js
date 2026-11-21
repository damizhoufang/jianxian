/* 第三章《渔家傲》的演出（三）：拔剑 43、姓辛 44、和词 45、一条船上 46。接在 story3b.js 后面。
   金琵琶的首领战分两半（两次 B.run，中间秋水那三句写在剧本里）：上半阿蛰一个人、三式各使一回；下半秋水起调、两个人合击，打断四根弦算赢。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks;
  const { giveUp, cutSteps, cutBg, cutVig, ch3, XL } = ST._h, { drawJin2, drawHalves, pop, needle } = ST._h.b3;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const tw = (s, f, e) => JX.tween(JX.auto ? 0.02 : s, f, e);
  const fl = () => JX.state.flags;
  const fast = v => (JX.auto ? 2400 : v);

  /* ---------- 自己画的几样 ---------- */
  /* 书案上那张纸：W.paperN 是写到第几个字 */
  function drawPaper(g) {
    g.save(); g.transform(1, 0, -0.3, 0.5, -84, -112); g.fillStyle = '#f4eedc'; g.fillRect(0, -44, 250, 88); g.strokeStyle = 'rgba(43,34,28,0.6)'; g.lineWidth = 1.4; g.strokeRect(0, -44, 250, 88);
    g.font = '600 56px ' + P.KAI; g.fillStyle = 'rgba(20,16,14,0.92)'; g.textBaseline = 'middle'; '望海潮'.split('').forEach((ch, i) => { if ((W.paperN || 0) > i) g.fillText(ch, 26 + i * 70, 4); }); g.restore();
  }
  /* 特写：纸上三个字 */
  function drawZi(c, k) {
    cutBg(c, '#6a5a48', '#2a221c'); c.save(); c.translate(650, 320); c.rotate(-0.03);
    c.fillStyle = '#f6f0dc'; c.fillRect(-470, -190, 940, 380); c.strokeStyle = 'rgba(43,34,28,0.7)'; c.lineWidth = 3; c.strokeRect(-470, -190, 940, 380);
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(160,140,100,0.06)'; c.fillRect(-470 + ((i * 97) % 900), -190 + ((i * 53) % 360), 30 + (i % 5) * 16, 2); }
    c.font = '600 230px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle';
    '望海潮'.split('').forEach((ch, i) => { const a = Math.max(0, Math.min(1, k * 3.4 - i)); c.fillStyle = 'rgba(18,14,12,' + (0.94 * a) + ')'; c.fillText(ch, -290 + i * 290, 10); });
    c.textAlign = 'left'; c.restore(); cutVig(c);
  }
  /* 特写：出了鞘的酒刀——借第二章那张（k 是刀身亮起来几分） */
  const drawBlade = (c, k) => ST._drawKnife(c, k);

  /* ---------- 山门前：照第七场结尾把各人摆好（drawn：刀出了鞘没有） ---------- */
  const BJ = { p: [1330, 806], q: [1396, 700], jin: [980, 770] };
  function tableau(drawn) {
    const p = W.player, x = W.byId.xiali, t = W.byId.tingxue, n = W.byId.xiaoni, zh = W.byId.zhou; ['lg1', 'lg2', 'lg3'].forEach(k => W.remove(k));
    if (n) n.vis = false; if (zh) { zh.x = 1900; zh.y = 690; zh.fall = 1; }
    const z = W.byId.jizhao || W.add('jizhao', 'jizhao', 1560, 824, { dir: 1, tag: '寂照神尼', solid: false }); z.x = 1560; z.y = 824; z.dir = 1; z.pose = 'sit'; z.seat = 2; z.closed = true; z.vis = true; z.alpha = 1;
    if (t) { t.x = 1632; t.y = 828; t.dir = 1; t.pose = 'squat'; t.path = null; } if (x) { x.x = 1486; x.y = 802; x.dir = 1; x.pose = 'squat'; x.carry = 'saber'; x.path = null; }
    const q = W.byId.qiushui || W.add('qiushui', 'qiushui2', 1960, 770, { dir: 1, tag: '秋水', solid: false, carry: 'sword' }); q.x = 1960; q.y = 770; q.dir = 1; q.pose = null; q.carry = 'sword'; q.path = null;
    const j = W.byId.jin || W.add('jin', 'jinpipa', BJ.jin[0], BJ.jin[1], { dir: 3, tag: '金琵琶', solid: false, draw: drawJin2, ring: 0 }); j.x = BJ.jin[0]; j.y = BJ.jin[1]; j.dir = 3; j.vis = true; j.alpha = 1; j.ring = 0;
    if (!W.byId.duan) W.add('duan', { h: 4 }, 1304, 842, { solid: false, draw: drawHalves });
    p.vis = true; p.x = 1380; p.y = 826; p.dir = 1; p.pose = null; p.path = null; p.carry = drawn ? 'jiudao' : null;
    W.exitsOff['shanmen:gate'] = '现在不是进去的时候。';
    return { p, q, j, z, x, t };
  }

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop3c = JX.populate;
  JX.populate = function (id) {
    pop3c(id);
    const sg = JX.state.stage, off = W.exitsOff;
    if (id === 'anneiye') {
      W.add('jizhao', 'jizhao', 470, 704, { dir: 3, tag: '寂照神尼', pose: 'sit', seat: 4, solid: false });
      W.add('xiaoni', 'xiaoni', 392, 766, { dir: 3, tag: '小尼', solid: false });
      W.add('qiushui', 'qiushui2', 620, 772, { dir: 1, tag: '秋水', solid: false, carry: 'sword' });
      W.add('tingxue', 'tingxue', 730, 838, { dir: 1, tag: '听雪', solid: false, pose: 'squat' });
      W.add('xiali', XL(), 900, 760, { dir: 1, tag: '夏离', solid: false });
      off['anneiye:out'] = '话还没有说完。';
    }
    if (id === 'haibian') { W.add('qiushui', 'qiushui2', 1180, 716, { dir: 2, tag: '秋水', solid: false, carry: 'sword', reach: 170 }); off['haibian:back'] = '话还没有说完。'; }
    if (id === 'guichuan') {
      W.add('xiali', XL(), 1560, 806, { dir: 3, tag: '夏离', solid: false });
      W.add('tingxue', 'tingxue', 1700, 716, { dir: 3, tag: '听雪', solid: false });
      W.add('qiushui', 'qiushui2', 1820, 760, { dir: 1, tag: '秋水', solid: false, carry: 'sword' });
    }
    if (id === 'banxian') { W.paperN = 0; W.add('he', 'he', 960, 726, { dir: 0, tag: '贺元度', solid: false }); W.add('zhi', { h: 1 }, 960, 801, { solid: false, draw: drawPaper }); }
  };

  /* ---------- 首领战：金琵琶（phase 1 上半、2 下半） ---------- */
  async function fightJin(phase) {
    const B = JX.battle, NUM = ['', '一', '两', '三', '四'];
    const J = b => b.units.find(u => u.key === 'jin'), ally = (b, k) => b.units.find(u => u.key === k);
    const goalText = b => (phase === 1 ? '照师父教的，三式各使一回' : '挑开琴声、断他的弦；她起调，你出剑') + '<br>铁琵琶的弦 ' + '●'.repeat(b.xian) + '○'.repeat(4 - b.xian);
    const setGoal = b => { const gl = b.box && b.box.querySelector('.goal'); if (gl) gl.innerHTML = '<b>◆</b>' + goalText(b); };
    const snap = async b => { const Jx = J(b); b.xian = Math.max(0, b.xian - 1); JX.audio.sfx('tiexian', 0.7); JX.audio.sfx('pop'); B.fx.floater(Jx, b.xian ? '弦断了一根——还剩' + NUM[b.xian] + '根' : '最后一根弦，断了', '#f0e2b0'); setGoal(b); await B.fx.shake(Jx); };
    const ring = e => JX.tween(JX.auto ? 0.02 : 0.9, k => { e.ring = k; }).then(() => { e.ring = 0; });
    const bo = { name: '裂帛', kind: 'wait', tell: '手指按上了弦——要拨了', say: '金琵琶五指一划——',
      fx: async (b, u) => { JX.audio.sfx('tiexian'); ring(u.ent); await B.fx.wait(0.35);
        if (b.tiao) { b.tiao = false; b.ext = false; u.stun = 1; u.note = '这一声给挑偏了，手上一空'; B.fx.floater(ally(b, 'jingzhe'), '挑偏了', '#f0e2b0'); JX.audio.sfx('tick'); }
        else b.units.filter(q => q.side === 'ally' && q.hp > 0).forEach(q => { q.stun = Math.max(q.stun, 1); q.hp = Math.max(0, q.hp - B.soak(36)); B.fx.floater(q, '内息一乱　−' + B.soak(36), '#ff9a8a'); B.fx.shake(q); });
        await B.fx.wait(0.4); } };
    const lun = { name: '轮指', type: 'light', pow: 1, tell: '轮指——一串碎音，冲着开口唱的人（没人唱就冲着刀）', pick: (b, pool) => pool.find(q => q.key === (b.sing > 0 ? 'qiushui' : 'jingzhe')) || pool[0], pre: async (b, u) => { JX.audio.sfx('xian', 0.5); ring(u.ent); await B.fx.wait(0.2); } };
    const TIAO = { id: 'tiao', name: '挑灯看剑', kind: 'talk', say: '陆惊蛰：挑灯看剑', desc: '第一式。刀尖自下而上一挑——挑的是他的琴声。他手指按上弦的时候用：那一声给挑偏，他手上一空。',
      fx: async (b, u) => { b.tiao = true; JX.audio.sfx('page'); await B.fx.tw(0.16, k => { u.ent.z = Math.sin(k * Math.PI) * 14; }); u.ent.z = 0; B.fx.floater(u, '刀尖斜挑着，等那一声', '#f0e2b0'); } };
    const PILI = { id: 'pili', name: '霹雳弦惊', kind: 'attack', type: 'heavy', pow: 1.4, delay: 1.2, desc: '第三式。弓弦一响，箭已经到了。他手上空着的时候用：断他一根弦。他按着弦的时候，近不了身。',
      fx: async b => { if (b.snapNow) { b.snapNow = false; await snap(b); } } };
    const JIAO = { id: 'jiao', name: '吹角连营', kind: 'talk', say: '陆惊蛰：吹角连营', desc: phase === 1 ? '第二式。角声一营接着一营传过去：一刀出去，后头还跟着两刀。' : '第二式。角声从远处来——站远了出剑。秋水起了调以后用，踩着她的拍子，就是合击“词剑合璧”：必断他一根弦。',
      fx: async (b, u) => { const Jx = J(b), Q = ally(b, 'qiushui');
        if (phase === 1) { await B.fx.lunge(u, Jx, 0.86); JX.audio.sfx('page'); const e = Jx.ent, x0 = e.x; await B.fx.tw(0.16, k => { e.x = x0 - 40 * k; }); B.fx.floater(u, '出得太近，力道散了', '#ff9a8a'); await B.fx.wait(0.5); await B.fx.back(u); e.x = x0; return; }
        if (b.sing > 0 && Q && Q.hp > 0) { b.sing--; JX.audio.sfx('xian'); B.fx.floater(Q, '“梦回吹角连营——”', '#cfe3f0'); await B.fx.wait(0.35); JX.audio.sfx('ming', 0.6); await needle(u.ent, Jx.ent, JX.auto ? 0.02 : 0.32); await needle(Q.ent, Jx.ent, JX.auto ? 0.02 : 0.26); B.fx.floater(Jx, '词剑合璧！', '#fff2c0'); await snap(b); }
        else { JX.audio.sfx('page'); await needle(u.ent, Jx.ent, JX.auto ? 0.02 : 0.36); B.fx.floater(Jx, '没有拍子，他让开了', '#cfd8e0'); await B.fx.wait(0.3); } } };
    const QI = { id: 'qi', name: '起调', kind: 'talk', say: '秋水开口，起了一句——', desc: '开口起一句：“梦回吹角连营”。阿蛰下一回使“吹角连营”，踩着这一句的拍子，就是合击“词剑合璧”。最多攒两句。',
      fx: async (b, u) => { b.sing = Math.min(2, (b.sing || 0) + 1); JX.audio.sfx('xian', 0.6); B.fx.floater(u, b.sing > 1 ? '又接了一句' : '起了调', '#cfe3f0'); } };
    const PING = { id: 'ping', name: '银瓶乍破', kind: 'attack', type: 'heavy', pow: 1.5, delay: 1.2, desc: '蓄住了再出，一剑破进去。他手上空着的时候用：打在腕上，叫他多空一手。他按着弦的时候，近不了身。' };
    const LENG = { id: 'leng', name: '冷月无声', kind: 'dodge', desc: '身子一侧，人已经让开了。他的轮指冲着唱的人来——让得开一半。' };
    const HINT1 = ['他的手指按上弦了——第一式：刀尖一挑，把这一声挑偏。', '他手上空了——第三式：霹雳弦惊，断他一根弦！', '他退开了——第二式：吹角连营，追上去。'], STEP = ['tiao', 'pili', 'jiao'];
    const rec = (b, u) => {
      const Jx = J(b);
      if (phase === 1) return { pick: STEP[b.step], hint: HINT1[b.step] };
      if (u.key === 'jingzhe') {
        if (Jx.intent === bo && !b.tiao && !Jx.stun) return { pick: 'tiao', hint: '他的手指按上弦了——挑灯看剑，把这一声挑偏。' };
        if (b.sing > 0) return { pick: 'jiao', hint: '她起了调——站远了，踩着她的拍子出剑：词剑合璧！' };
        if (Jx.stun) return { pick: 'pili', target: 'jin', hint: '他手上空了——霹雳弦惊，断他一根弦！' };
        return b.tiao ? { pick: 'jiao', hint: '先出一剑压着他，等她起调。' } : { pick: 'tiao', hint: '先把刀尖挑起来，等他那一声。' };
      }
      if (Jx.intent === lun && b.sing > 0 && !Jx.stun) return { pick: 'leng', hint: '他的轮指冲着唱的人来——让一让。' };
      if (Jx.stun && !b.ext) return { pick: 'ping', target: 'jin', hint: '他手上空了——银瓶乍破，打他的腕子，叫他多空一手。' };
      return b.sing < 2 ? { pick: 'qi', hint: '起一句调，给阿蛰打拍子——他下一回“吹角连营”就是合击。' } : { pick: 'leng', hint: '调已经起了两句。先让着，等他出剑。' };
    };
    for (let lost = 0; ;) {
      const T = tableau(true), p = T.p, q = T.q, jin = T.j; p.x = BJ.p[0]; p.y = BJ.p[1]; p.dir = 1;
      if (phase === 2) { q.x = BJ.q[0]; q.y = BJ.q[1]; q.dir = 1; }
      const me = { ent: p, key: 'jingzhe', name: '陆惊蛰', hp: 130, spd: 13, atk: 22, def: 6, season: 0, cmds: [TIAO, JIAO, PILI] };
      if (phase === 1) [TIAO, PILI, JIAO].forEach((m, i) => { m.when = b => b.step === i; }); else [TIAO, PILI, JIAO].forEach(m => { delete m.when; });
      const r = await B.run({
        goal: (phase === 1 ? '照师父教的，三式各使一回' : '挑开琴声、断他的弦；她起调，你出剑') + '<br>铁琵琶的弦 ' + (phase === 1 ? '●●●●' : '●●●○'), music: 'jiaofeng', season: 0, seasonEvery: 5, zoom: 1.04, focus: { x: 1240, y: 720 }, flip: true,
        allies: phase === 1 ? [me] : [me, { ent: q, key: 'qiushui', name: '辛秋水', hp: 105, spd: 12.5, atk: 26, def: 5, season: 2, cmds: [QI, PING, LENG] }],
        foes: [{ ent: jin, key: 'jin', name: '金琵琶', hp: 999, spd: 11, atk: 16, def: 0, boss: true, keep: true, showHp: false, n: 0, ai: (b, u) => (++u.n % 2 ? bo : lun) }],
        start(b) { b.xian = phase === 1 ? 4 : 3; b.step = 0; b.sing = 0; b.tiao = false; b.ext = false; b.snapNow = false; setGoal(b); },
        allow: rec,
        autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id) || cmds[0]; },
        resolve(b, a, m, tg, r2) {
          if (tg.key !== 'jin') return r2;
          if (!tg.stun) return { evade: false, block: true, dmg: 0, iron: '琴声挡着，近不了身' };
          if (m.id === 'pili') { b.snapNow = true; return { evade: false, block: false, dmg: 0, iron: '正中琴弦' }; }
          if (m.id === 'ping' && !b.ext) { b.ext = true; tg.stun = Math.max(tg.stun, 2); return { evade: false, block: false, dmg: 0, iron: '腕上一麻，又空了一手' }; }
          return { evade: false, block: false, dmg: 0, iron: '打着了' };
        },
        end(b) { if (b.units.some(u => u.side === 'ally' && u.hp <= 0)) return 'lose'; return (phase === 1 ? b.step >= 3 : b.xian <= 0) ? 'win' : null; },
        async after(b, u) { const Jx = J(b); if (!Jx.stun && Jx.note) Jx.note = ''; if (phase === 1 && u.side === 'ally') b.step++; },
      });
      if (r.result === 'win') break;
      await UI.narrate('琴声钻进耳朵里，眼前一黑。——不对，这一场还没完，再来。');
      if (await giveUp(++lost)) break;
      await UI.tutorial('再来一次', '<b>两个人里有一个倒下就算输。</b><br>金琵琶那一栏写着“手指按上了弦”的时候，阿蛰先用<b>挑灯看剑</b>——不挑，这一声两个人都要挨，很重。<br>挑偏了，他手上一空：阿蛰<b>霹雳弦惊</b>断他一根弦。秋水<b>起调</b>以后，阿蛰的<b>吹角连营</b>就是合击，也断一根。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令上，照着按回车就行。');
    }
    const T = tableau(true); T.p.x = BJ.p[0]; T.p.y = BJ.p[1]; if (phase === 2) { T.q.x = BJ.q[0]; T.q.y = BJ.q[1]; }
    W.focus = { x: 1240, y: 680 }; await nap(0.4);
  }

  /* ---------- 演出 ---------- */
  Object.assign(H, {
    /* —— 九　拔剑 —— */
    async 入三九() { ch3(43, 1); },
    async 摆山门() { tableau(false); W.zoom = 1; W.focus = { x: 1300, y: 690 }; W.camSnap = true; },
    async 拔剑() { const p = W.player; W.focus = { x: p.x, y: p.y - 70 }; W.zoom = 1.3; await nap(0.6); JX.audio.sfx('ming'); p.carry = 'jiudao'; await tw(0.2, k => { p.z = Math.sin(k * Math.PI) * 8; }); p.z = 0; await nap(0.9); },
    async 看断刃() { await cutSteps(drawBlade, [[0, 0.5, 1.6, ['七寸。没有尖。断口是齐的。']], [0.5, 1, 1.8, ['六年里，它开过几千只酒坛。', '今天头一回当着人，开别的。']]]); W.zoom = 1; W.focus = { x: 1240, y: 690 }; },
    async 战金琵琶甲() { await fightJin(1); },
    async 退两丈() { const j = W.byId.jin; W.focus = { x: 1200, y: 690 }; if (j) { JX.audio.sfx('xian', 0.5); await nap(0.8); } },
    async 秋水上前() { const q = W.byId.qiushui, p = W.player; if (q) await W.walk(q, BJ.q[0], BJ.q[1], { speed: fast(230), straight: true, dir: 1 }); if (q) q.dir = 1; p.dir = 1; await nap(0.4); },
    async 看她一眼() { const p = W.player; p.dir = 3; await nap(0.7); },
    async 转回去() { const p = W.player; p.dir = 1; await nap(0.3); },
    async 战金琵琶乙() { await fightJin(2); },
    async 金琵琶走() { const j = W.byId.jin; W.focus = { x: 1100, y: 690 }; if (j) { j.dir = 1; await W.walk(j, 120, 810, { speed: fast(150), straight: true, dir: 1 }); j.vis = false; } await nap(0.4); },
    async 众人起() {
      const x = W.byId.xiali, t = W.byId.tingxue, q = W.byId.qiushui, p = W.player; W.focus = { x: 1500, y: 700 };
      if (x) { x.pose = null; x.dir = 3; } if (q) await W.walk(q, 1500, 800, { speed: fast(260), straight: true, dir: 3 }); p.dir = 3; await nap(0.4);
    },
    async 夏离看刀() { const x = W.byId.xiali, p = W.player; if (x) { await W.walk(x, 1420, 770, { speed: fast(160), dir: 1 }); x.dir = 1; } p.dir = 3; await nap(0.3); },
    async 秋水回望() { const q = W.byId.qiushui; if (q) q.dir = 1; await nap(0.9); },
    /* —— 十　姓辛 —— */
    async 入三十() { const p = ch3(44, 1); p.carry = null; },
    async 围坐() { const p = W.player; p.path = null; await W.walk(p, 800, 806, { speed: 180, dir: 1 }); p.dir = 1; W.focus = { x: 700, y: 640 }; await nap(0.4); },
    async 托剑() { const q = W.byId.qiushui; if (q) { await W.walk(q, 556, 746, { speed: fast(110), straight: true, dir: 1 }); q.dir = 1; q.pose = 'squat'; q.carry = 'swordflat'; JX.audio.sfx('han', 0.4); } await nap(0.8); },
    async 神尼转脸() { const z = W.byId.jizhao; if (z) z.dir = 0; await nap(0.6); },
    async 听雪近前() { const t = W.byId.tingxue, z = W.byId.jizhao, q = W.byId.qiushui; if (q) { q.pose = null; q.carry = 'sword'; await W.walk(q, 640, 800, { speed: fast(120), straight: true, dir: 1 }); } if (t) { t.pose = null; await W.walk(t, 548, 740, { speed: fast(120), straight: true, dir: 1 }); t.dir = 1; t.pose = 'squat'; } if (z) z.dir = 3; await nap(0.6); },
    async 神尼闭眼() { const z = W.byId.jizhao; if (z) z.closed = true; await nap(0.8); },
    /* —— 十一　和词 —— */
    async 入三十一() { const p = ch3(45, 1); p.carry = null; },
    async 并肩() { const p = W.player, q = W.byId.qiushui; p.path = null; await W.walk(p, 1080, 732, { speed: 170, dir: 2 }); p.dir = 2; W.focus = { x: 1140, y: 560 }; await nap(0.5); if (q) q.dir = 1; p.dir = 3; await nap(0.4); },
    async 看海() { const q = W.byId.qiushui; if (q) q.dir = 2; await nap(0.9); },
    async 转过来() { const q = W.byId.qiushui; if (q) q.dir = 1; await nap(0.4); },
    async 秋水入队() { fl().qsIn = 1; JX.audio.sfx('gong'); UI.banner('辛秋水　入队', '霜降 · 这里没有阑珊'); await nap(2.4); },
    /* —— 十二　一条船上 —— */
    async 入三十二() { const p = ch3(46, 1); p.carry = null; fl().qsIn = 1; },
    async 船头四人() { const p = W.player, x = W.byId.xiali, t = W.byId.tingxue, q = W.byId.qiushui; p.path = null; await W.walk(p, 1460, 770, { speed: 190, dir: 3 }); p.dir = 3; W.focus = { x: 1640, y: 620 }; if (t) t.dir = 3; if (q) q.dir = 1; if (x) x.dir = 3; await nap(0.4); },
    async 听雪凑近() { const t = W.byId.tingxue; if (t) { await W.walk(t, 1712, 806, { speed: fast(240), straight: true, dir: 3 }); t.dir = 3; } await nap(0.3); },
    async 四时() { fl().sishi = 1; JX.audio.sfx('gong'); UI.banner('四时俱全', '春 陆惊蛰　·　夏 夏离　·　秋 辛秋水　·　冬 耶律听雪'); await nap(2.8); },
    async 半闲堂() { const p = W.player; p.vis = false; W.paperN = 0; W.focus = { x: 960, y: 600 }; W.camSnap = true; },
    async 写字() { const h = W.byId.he; for (let i = 1; i <= 3; i++) { await nap(0.9); W.paperN = i; JX.audio.sfx('page', 0.6); } await nap(0.8); },
    async 看字() { await cutSteps(drawZi, [[0, 1, 2.6, ['纸上是三个字。', '望海潮。']]]); },
    async 试玩到此七() {
      ST._endHtml = '<h2>第三章　完</h2><p>《渔家傲》十二场到这里：酒刀有了名字，她拿回了自己的姓，一条船上坐了四个人。</p><p>第四章《望海潮》——八月十八，钱塘江上有一场潮。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在船上看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      const p = W.player; p.vis = true; W.zoom = 1; W.focus = null; await H.试玩到此二();
    },
  });
})();
