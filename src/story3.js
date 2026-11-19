/* 第三章《渔家傲》的演出：换装 35、莲花洋 36、山门 37、一启一闭 38（后面的场次接着往下写）。
   接在 story2c.js 后面。夏离换回女装以后，flags.nv 立着：小人换成 xiali2，头像由 portraits4.js 换。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks, Fig = JX.Fig;
  const { fighters, giveUp, ch2, cutSteps, overboard } = ST._h;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const fl = () => JX.state.flags;
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';
  const halt = () => (fl().train || []).forEach(id => { const e = W.byId[id]; if (e) { e.path = null; e.moving = false; } });
  const XL = () => (fl().nv ? 'xiali2' : 'xiali');
  /* 第三章每一场开头：照第二章的办法摆回平常的样子，再把这一章要的几样旗标设全（跳场是直接从这里开始的） */
  function ch3(stage, nv) { const p = ch2(stage), f = fl(); f.wengOpen = true; f.tx = 1; f.haoran = 1; f.dusk = false; f.nv = nv ? 1 : 0; f.train = null; return p; }
  ST._h.ch3 = ch3; ST._h.XL = XL;

  /* ---------- 自己画的几样 ---------- */
  /* 金琵琶：站在快船的船头，抱着铁琵琶。ring 是琴声荡开的那一圈（0 到 1） */
  function drawJin(g, e) {
    g.fillStyle = 'rgba(70,98,106,0.5)'; g.beginPath(); g.ellipse(70, 40, 280, 15, 0, 0, 6.3); g.fill();                             // 船底下的一片水，免得像浮在雾里
    for (let i = 0; i < 5; i++) P.line(g, -170 + i * 22, 44 + i * 5, 300 - i * 30, 44 + i * 5, 1.4, 'rgba(240,246,244,0.4)');
    JX.scenes7.sideBoat(g, 70, 30, 440, { col: '#2e2620', awn: false });
    Fig.draw(g, e.sp, e.dir, e.ph, { carry: 'pipa', shadow: false });
    if (e.ring > 0) { for (let i = 0; i < 3; i++) { const q = Math.min(1, e.ring + i * 0.14); g.strokeStyle = 'rgba(236,240,244,' + (0.5 * (1 - q)) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(-10, -80, 60 + q * 520, 26 + q * 230, 0, 0, 6.3); g.stroke(); } }
  }
  /* 小尼的扫帚：比她还高；fall 是倒下去的那一下（0 到 1） */
  function drawBroom(g, e) {
    g.save(); g.rotate((e.fall || 0) * 1.45); P.line(g, 0, 0, -6, -150, 4.5, '#8a6a44'); P.line(g, 0, 0, -6, -150, 1, 'rgba(255,255,255,0.25)');
    g.fillStyle = '#b89a5a'; g.beginPath(); g.moveTo(-10, -30); g.lineTo(10, -30); g.lineTo(20, 2); g.lineTo(-20, 2); g.closePath(); g.fill(); g.strokeStyle = INK(0.8); g.lineWidth = 1.2; g.stroke(); for (let i = -3; i <= 3; i++) P.line(g, i * 3, -28, i * 5.6, 2, 0.9, 'rgba(60,44,16,0.5)'); P.line(g, -10, -30, 10, -30, 3, '#8e2a20'); g.restore();
  }
  /* 放在地上的那把刀 */
  function drawDao(g) { P.shadow(g, 6, 2, 34, 5, 0.3); g.save(); g.rotate(-0.08); g.fillStyle = '#4b3525'; g.fillRect(-30, -5, 26, 10); g.strokeStyle = INK(0.9); g.lineWidth = 1; g.strokeRect(-30, -5, 26, 10); g.fillStyle = '#c5cdd0'; g.fillRect(-4, -4, 46, 8); g.strokeRect(-4, -4, 46, 8); P.line(g, -2, -2, 40, -2, 1, 'rgba(255,255,255,0.8)'); P.line(g, -30, 0, -40, 8, 2, '#a8322a'); g.restore(); }
  /* 特写：刀自己在响。底子用第二章那张刀的特写，上头叠几道抖开的影子和一圈一圈的声纹 */
  function drawHum(c, k) {
    ST._drawKnife(c, 0);
    const a = k < 0.5 ? k / 0.5 : 1 - (k - 0.5) * 0.5, tt = k * 40;
    c.save(); c.translate(600, 350); c.rotate(-0.1);
    for (let i = 1; i <= 4; i++) { const d = Math.sin(tt + i) * i * 3.2 * a; c.strokeStyle = 'rgba(236,244,248,' + (0.34 * a / i) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(-196, -27 + d); c.lineTo(330, -29 + d); c.lineTo(330, 29 + d); c.lineTo(-196, 25 + d); c.closePath(); c.stroke(); }
    for (let i = 0; i < 5; i++) { const q = ((k * 2.2 + i / 5) % 1); c.strokeStyle = 'rgba(226,238,244,' + (0.3 * a * (1 - q)) + ')'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(70, 0, 280 + q * 300, 40 + q * 200, 0, 0, 6.3); c.stroke(); }
    c.restore();
  }

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop3 = JX.populate;
  JX.populate = function (id) {
    pop3(id);
    const sg = JX.state.stage, off = W.exitsOff;
    if (id === 'dinghai') {
      W.add('xiali', XL(), 300, 824, { dir: 3, tag: '夏离', solid: false });
      W.add('tingxue', 'tingxue', 250, 872, { dir: 3, tag: '听雪', solid: false });
      W.add('laoda', 'chuanlaoda', 760, 616, { dir: 0, tag: '船老大', solid: false, reach: 170 });
      W.add('guyi', 'guyi', 1890, 606, { dir: 0, solid: false });
      W.add('ds1', 'dashou', 1130, 640, { dir: 2, solid: false }); W.add('ds2', 'dashou', 1220, 648, { dir: 2, solid: false });
      W.add('yg1', 'chuangong', 440, 690, { dir: 1, solid: false, pose: 'squat', bark: ['网破了三个眼。'] });
      W.add('yg2', 'chuangong', 2520, 700, { dir: 1, solid: false, carry: 'sack' });
      W.add('xk1', 'xiangke', 1010, 770, { dir: 3, solid: false, bark: ['求菩萨保佑我那个出海的儿子。'] }); W.add('xk2', 'xiangke', 1070, 800, { dir: 1, solid: false });
      W.add('yp', 'chapo', 1420, 700, { dir: 1, solid: false, bark: ['黄鱼鲞，新晒的。'] });
    }
    if (id === 'haichuan') {
      W.add('xiali', XL(), 1540, 792, { dir: 3, tag: '夏离', solid: false });
      W.add('tingxue', 'tingxue', 1730, 662, { dir: 2, tag: '听雪', solid: false, pose: 'squat', bark: ['……别跟我说话。'] });
      W.add('laoda', 'chuanlaoda', 400, 730, { dir: 3, tag: '船老大', solid: false, carry: 'pole' });
      W.add('cg1', 'chuangong', 560, 806, { dir: 3, solid: false, carry: 'pole' }); W.add('cg2', 'chuangong', 470, 856, { dir: 3, solid: false });
      W.add('xk1', 'xiangke', 1120, 806, { dir: 3, solid: false, pose: 'sit', seat: 6 }); W.add('xk2', 'xiangke', 1200, 836, { dir: 1, solid: false, pose: 'sit', seat: 6 });
    }
    if (id === 'shanmen') {
      W.add('xiali', XL(), 280, 824, { dir: 3, tag: '夏离', solid: false });
      W.add('tingxue', 'tingxue', 230, 872, { dir: 3, tag: '听雪', solid: false });
      W.add('xiaoni', 'xiaoni', 1780, 676, { dir: 0, tag: '小尼', reach: 140 });
      W.add('zhou', { h: 4 }, 1812, 678, { solid: false, draw: drawBroom, fall: 0 });
      off['shanmen:gate'] = '小尼拿扫帚拦着。';
    }
    if (id === 'annei') {
      W.add('jizhao', 'jizhao', 960, 770, { dir: 0, tag: '寂照神尼', pose: 'sit', seat: 12, reach: 170, solid: false });
      off['annei:out'] = '话还没有说完。';
    }
  };

  /* ---------- 演出 ---------- */
  const BS = { p: [1440, 800], x: [1360, 730], t: [1368, 866], jin: [1880, 566] };
  const SPOT = [[1640, 706], [1722, 772], [1700, 846], [1616, 884]];
  Object.assign(H, {
    /* —— 一　换装 —— */
    async 入三一() { ch3(35, 0); fl().train = ['xiali', 'tingxue']; },
    async 问船() { const p = W.player, x = W.byId.xiali, t = W.byId.tingxue; halt(); fl().train = null; p.path = null; W.walk(p, 760, 690, { speed: 200, dir: 2 }); if (x) W.walk(x, 850, 700, { speed: 200, dir: 2 }); if (t) await W.walk(t, 670, 704, { speed: 220, dir: 2 }); p.dir = 2; W.focus = { x: 800, y: 560 }; await nap(0.4); },
    async 看打手() { W.focus = { x: 1180, y: 560 }; await nap(1.6); },
    async 看估衣铺() { const x = W.byId.xiali; if (x) x.dir = 3; W.focus = { x: 1500, y: 560 }; await nap(1.3); W.focus = null; },
    async 夏离进铺() {
      const x = W.byId.xiali, t = W.byId.tingxue; W.focus = null;
      if (t) W.walk(t, 1750, 716, { speed: JX.auto ? 2400 : 260, dir: 0 }).then(() => { t.pose = 'squat'; });
      if (x) { await W.walk(x, 1890, 656, { speed: JX.auto ? 2400 : 240, dir: 2 }); await JX.tween(JX.auto ? 0.02 : 0.5, q => { x.alpha = 1 - q; }); x.vis = false; }
      fl().train = null;
    },
    async 换装() {
      const p = W.player, t = W.byId.tingxue; p.path = null; p.dir = 2; W.focus = { x: 1880, y: 600 }; JX.audio.sfx('page'); await nap(0.5);
      W.remove('xiali'); fl().nv = 1;
      const x = W.add('xiali', 'xiali2', 1890, 652, { dir: 0, tag: '夏离', solid: false, alpha: 0 });
      await JX.tween(JX.auto ? 0.02 : 0.6, q => { x.alpha = q; }); await W.walk(x, 1960, 700, { speed: 120, straight: true, dir: 1 }); x.dir = 1; p.dir = 3; if (t) { t.pose = null; t.dir = 3; } await nap(0.5);
    },
    async 打手走过() {
      const a = W.byId.ds1, b = W.byId.ds2, x = W.byId.xiali; W.focus = { x: 1800, y: 640 };
      const go = (e, y, d) => e && JX.sleep(JX.auto ? 0 : d).then(() => W.walk(e, 2060, y, { speed: JX.auto ? 2400 : 150, straight: true })).then(() => W.walk(e, 2760, y, { speed: JX.auto ? 2400 : 170, straight: true })).then(() => { e.vis = false; });
      if (a) { a.x = 1320; a.y = 760; } if (b) { b.x = 1260; b.y = 790; } if (x) x.dir = 0;
      await Promise.all([go(a, 762, 0), go(b, 790, 0.4)]); W.focus = null; await nap(0.3);
    },
    /* —— 二　莲花洋 —— */
    async 入三二() { ch3(36, 1); },
    async 到船头() { const p = W.player; p.path = null; p.dir = 3; W.focus = { x: 1700, y: 620 }; await nap(0.5); },
    async 琴声() {
      JX.audio.sfx('tiexian'); await nap(0.9);
      ['laoda', 'cg1', 'cg2', 'xk1', 'xk2'].forEach(id => { const e = W.byId[id]; if (e) { e.carry = null; if (e.pose !== 'sit') e.pose = 'squat'; } });
      const t = W.byId.tingxue; if (t) { t.pose = null; t.dir = 3; t.bark = null; } JX.audio.sfx('splash', 0.5); W.focus = { x: 700, y: 700 }; await nap(1.2); W.focus = { x: 1800, y: 620 };
    },
    async 快船来() {
      W.remove('jin'); const j = W.add('jin', 'jinpipa', 2700, BS.jin[1], { dir: 1, tag: '金琵琶', solid: false, draw: drawJin, alpha: 0, sy: 500 });
      await JX.tween(JX.auto ? 0.02 : 2.6, q => { j.x = 2700 - (2700 - BS.jin[0]) * q; j.alpha = Math.min(1, q * 1.6); }); await nap(0.4);
    },
    async 侧耳() { const j = W.byId.jin, x = W.byId.xiali; await nap(0.9); if (x) { x.dir = 3; x.carry = 'saber'; } await nap(0.4); },
    async 打手上船() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue;
      for (let i = 0; i < 4; i++) { const e = W.add('ds' + (i + 1), 'dashou', BS.jin[0] - 60, BS.jin[1] - 10, { dir: 1, solid: false, carry: 'blade' }); const tx = SPOT[i][0], ty = SPOT[i][1], x0 = e.x, y0 = e.y; JX.audio.sfx('page', 0.5); await JX.tween(JX.auto ? 0.02 : 0.42, q => { e.x = x0 + (tx - x0) * q; e.y = y0 + (ty - y0) * q; e.z = Math.sin(q * Math.PI) * 150; }); e.z = 0; }
      p.carry = 'pole'; W.walk(p, BS.p[0], BS.p[1], { speed: 280, dir: 3 }); if (t) W.walk(t, BS.t[0], BS.t[1], { speed: 300, dir: 3 }); if (x) await W.walk(x, BS.x[0], BS.x[1], { speed: 280, dir: 3 }); W.focus = { x: 1640, y: 720 }; await nap(0.3);
    },
    async 战金琵琶() {
      const B = JX.battle, p = W.player, x = W.byId.xiali, t = W.byId.tingxue || W.add('tingxue', 'tingxue', BS.t[0], BS.t[1], { dir: 3, tag: '听雪', solid: false });
      const jin = W.byId.jin || W.add('jin', 'jinpipa', BS.jin[0], BS.jin[1], { dir: 1, tag: '金琵琶', solid: false, draw: drawJin, sy: 500 });
      const NM = ['打手甲', '打手乙', '打手丙', '打手丁'];
      const es = SPOT.map((s, i) => W.byId['ds' + (i + 1)] || W.add('ds' + (i + 1), 'dashou', s[0], s[1], { dir: 1, solid: false, carry: 'blade' }));
      const me = (b, pool) => pool.find(u => u.key === 'jingzhe') || pool[0];
      const kuai = { name: '快刀', tell: '刀尖朝前——冲着阿蛰递过来，快', type: 'light', pow: 1, pick: me }, pi = { name: '重劈', tell: '刀举过了头——冲着阿蛰劈下来，重', type: 'heavy', pow: 1.8, delay: 1.2, pick: me };
      const allies = b => b.units.filter(q => q.side === 'ally' && q.hp > 0);
      const foes = b => b.units.filter(q => q.side === 'foe' && q.key !== 'jin' && q.hp > 0);
      const ring = () => JX.tween(JX.auto ? 0.02 : 0.9, q => { jin.ring = q; }).then(() => { jin.ring = 0; });
      const bo = { name: '裂帛', kind: 'wait', tell: '手指按上了弦——要拨了', say: '金琵琶五指一划——',
        fx: async (b, u) => { JX.audio.sfx('tiexian'); ring(); await B.fx.wait(0.35);
          if (b.ding) { b.ding = false; allies(b).forEach(q => B.fx.floater(q, '气定，琴声进不来', '#f0e2b0')); }
          else { allies(b).forEach(q => { q.stun = Math.max(q.stun, 1); q.hp = Math.max(1, q.hp - 10); B.fx.floater(q, '内息一乱', '#ff9a8a'); B.fx.shake(q); }); }
          await B.fx.wait(0.4); } };
      const lun = { name: '轮指', kind: 'wait', tell: '手指在弦上慢慢轮着——这一手不伤人', say: '金琵琶的手指在弦上慢慢轮着。', fx: async () => { JX.audio.sfx('xian', 0.4); await B.fx.wait(0.3); } };
      const ding = { id: 'ding', name: '浩然诀·定气', kind: 'talk', desc: '把一口气沉到底。下一声琴响，三个人都不受扰。', say: '陆惊蛰把一口气沉了下去——', fx: async (b, u) => { b.ding = true; B.fx.floater(u, '气定', '#f0e2b0'); } };
      const place = () => {
        p.x = BS.p[0]; p.y = BS.p[1]; p.dir = 3; p.pose = null; p.carry = 'pole'; p.path = null;
        x.x = BS.x[0]; x.y = BS.x[1]; x.dir = 3; x.pose = null; x.carry = 'saber'; x.path = null; t.x = BS.t[0]; t.y = BS.t[1]; t.dir = 3; t.pose = null; t.carry = null; t.path = null;
        es.forEach((e, i) => { e.x = SPOT[i][0]; e.y = SPOT[i][1]; e.dir = 1; e.vis = true; e.alpha = 1; e.z = 0; e.pose = null; e.carry = 'blade'; });
        jin.x = BS.jin[0]; jin.y = BS.jin[1]; jin.vis = true; jin.alpha = 1; jin.ring = 0;
      };
      const rec = (b, u) => {
        const J = b.units.find(q => q.key === 'jin'), wob = foes(b).filter(q => q.stun > 0);
        if (u.key === 'jingzhe') {
          if (J.intent === bo && !b.ding) return { pick: 'ding', hint: '他的手指按上弦了——用浩然诀定气，这一声琴就进不来。' };
          return wob.length ? { pick: 'dian', target: wob[wob.length - 1].key, hint: '有人站不稳——篙尖补一下。' } : { pick: 'sao', hint: '竹篙横扫——把他们扫得站不稳，听雪才送得下水。' };
        }
        if (u.key === 'tingxue') return wob.length ? { pick: 'tui', target: wob[0].key, hint: '他站不稳——一掌送他下水！' } : { pick: 'tui', target: (foes(b)[0] || {}).key, hint: '他们都站稳了，这一掌先打着。等竹篙再扫。' };
        return wob.length ? { pick: 'zhan', target: wob[wob.length - 1].key, hint: '趁他站不稳，一刀下去。' } : { pick: 'zhan', target: (foes(b)[0] || {}).key, hint: '一刀下去，实打实。' };
      };
      for (let lost = 0; ;) {
        place();
        const team = fighters(p, x);
        team[0].cmds[0] = Object.assign({}, team[0].cmds[0], { name: '竹篙·点', desc: '篙尖专点手腕、脚踝。出手快，下一手来得早。' });
        team[0].cmds[1] = Object.assign({}, team[0].cmds[1], { name: '竹篙·扫', desc: '竹篙贴着船板横扫过去，面前的人都要晃两晃——站不稳的，听雪一掌就送得下水。出手慢。' });
        team[0].cmds.push(ding);
        team.push({ ent: t, key: 'tingxue', name: '耶律听雪', hp: 110, spd: 12, atk: 24, def: 5, season: 3, cmds: [
          { id: 'tui', name: '绵掌·推', kind: 'attack', type: 'light', pow: 0.9, desc: '一掌按在胸口，劲是往外送的。对面要是正站不稳，这一掌就送他下水。' },
          { id: 'shan', name: '闪', kind: 'dodge', desc: '身子一矮，从刀底下钻过去。' }] });
        const r = await B.run({
          goal: '他一按弦，阿蛰就“定气”；上船的四个，扫得站不稳、一掌送下水', music: 'jiaofeng', season: 1, seasonEvery: 5, zoom: 1.04, focus: { x: 1700, y: 700 },
          allies: team,
          foes: es.map((e, i) => ({ ent: e, key: 'ds' + (i + 1), name: NM[i], hp: 84, spd: 10 - i * 0.5, atk: 15, def: 2, keep: true, n: i, ai: (b, u) => (++u.n % 3 === 0 ? pi : kuai) }))
            .concat([{ ent: jin, key: 'jin', name: '金琵琶', hp: 999, spd: 12, atk: 0, def: 0, boss: true, keep: true, showHp: false, n: 0, note: '隔着三丈水，够不着', ai: (b, u) => (++u.n % 2 ? bo : lun) }]),
          start(b) { foes(b).forEach(q => { q.stun = 1; q.note = '刚跳过来，脚下还没站稳'; }); },
          allow: rec,
          autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id); },
          resolve(b, a, m, tg, r2) {
            if (tg.key === 'jin') return { evade: false, block: true, dmg: 0, iron: '够不着' };
            if (a.key === 'jingzhe' && m.id === 'sao' && tg.side === 'foe') { tg.stun = Math.max(tg.stun, 2); tg.note = '站不稳'; }
            if (a.key === 'tingxue' && m.id === 'tui' && tg.side === 'foe' && tg.stun > 0) return { evade: false, block: false, dmg: tg.hp };
            return r2;
          },
          end(b) { return foes(b).length === 0 ? 'win' : b.units.find(q => q.key === 'jingzhe').hp <= 0 ? 'lose' : null; },
          async after(b, u) {
            for (const q of b.units) if (q.side === 'foe' && q.key !== 'jin') {
              if (q.hp <= 0 && !q.gone) { q.gone = true; B.fx.floater(q, '下水！', '#bfe3d0'); await overboard(q.ent); }
              else if (!q.stun && q.note) q.note = '';
            }
          },
        });
        if (r.result === 'win') break;
        await UI.narrate('琴声钻进耳朵里，眼前一黑。——不对，这一场还没完，再来。');
        if (await giveUp(++lost)) break;
        await UI.tutorial('再来一次', '<b>阿蛰倒下就算输。</b><br>金琵琶那一栏写着“手指按上了弦”的时候，阿蛰先用<b>浩然诀·定气</b>——不定气，三个人都要乱一手、白挨一轮刀。<br>别的时候：<b>竹篙·扫</b>扫得他们站不稳，听雪<b>绵掌·推</b>一掌一个送下水。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令上，照着按回车就行。');
      }
      es.forEach(e => { e.vis = false; }); p.carry = null; W.focus = { x: 1760, y: 640 }; await nap(0.4);
    },
    async 快船走() { const j = W.byId.jin, x = W.byId.xiali; if (j) { await JX.tween(JX.auto ? 0.02 : 2.4, q => { j.x = BS.jin[0] + 520 * q; j.alpha = 1 - q; }); W.remove('jin'); } if (x) x.carry = null; ['laoda', 'cg1', 'cg2'].forEach(id => { const e = W.byId[id]; if (e) e.pose = null; }); W.focus = null; },
    /* —— 三　山门 —— */
    async 入三三() { ch3(37, 1); fl().train = ['xiali', 'tingxue']; },
    async 问小尼() { const p = W.player, x = W.byId.xiali, t = W.byId.tingxue; halt(); fl().train = null; p.path = null; W.walk(p, 1700, 716, { speed: 200, dir: 3 }); if (x) W.walk(x, 1620, 760, { speed: 220, dir: 3 }); if (t) await W.walk(t, 1650, 826, { speed: 240, dir: 3 }); p.dir = 3; W.focus = { x: 1740, y: 560 }; await nap(0.4); },
    async 顿扫帚() { const z = W.byId.zhou; JX.audio.sfx('tick'); if (z) { await JX.tween(JX.auto ? 0.02 : 0.2, q => { z.z = Math.sin(q * Math.PI) * 14; }); z.z = 0; } await nap(0.5); },
    async 小尼进去() { const n = W.byId.xiaoni, z = W.byId.zhou; if (z) JX.tween(JX.auto ? 0.02 : 0.4, q => { z.fall = q; }).then(() => JX.audio.sfx('tick')); if (n) { n.solid = false; await W.walk(n, 1780, 590, { speed: JX.auto ? 2400 : 300, straight: true, dir: 2 }); n.vis = false; } await nap(JX.auto ? 0.02 : 1.6); },
    async 小尼出来() { const n = W.byId.xiaoni; if (n) { n.vis = true; n.alpha = 1; await W.walk(n, 1780, 676, { speed: JX.auto ? 2400 : 300, straight: true, dir: 0 }); n.dir = 0; } await nap(0.3); },
    async 拎后领() { const x = W.byId.xiali, t = W.byId.tingxue; if (x && t) { await W.walk(x, t.x - 46, t.y - 6, { speed: 240, dir: 3 }); t.pose = 'squat'; await nap(0.5); t.pose = null; } },
    async 可进门() { const z = W.byId.zhou, n = W.byId.xiaoni; if (z) { z.fall = 0; z.x = 1846; } if (n) { n.x = 1870; n.y = 690; n.dir = 1; n.solid = false; } delete W.exitsOff['shanmen:gate']; W.focus = null; },
    /* —— 四　一启一闭 —— */
    async 入三四() { ch3(38, 1); W.remove('dao'); },
    async 刀响() { const p = W.player; p.path = null; await W.walk(p, 800, 816, { speed: 150, dir: 3 }); p.dir = 3; W.focus = { x: 920, y: 620 }; JX.audio.sfx('ming'); await nap(1.0); },
    async 看刀鸣() { JX.audio.sfx('ming'); await cutSteps(drawHum, [[0, 0.5, 1.8, ['很低的一声。像有人在很远的地方，拨了一下弦。']], [0.5, 1, 1.6, ['这把刀跟了他十一年，开过几千只酒坛，在雷声里烫过一回。', '它从来没有响过。']]]); },
    async 放刀() { const p = W.player; p.pose = 'squat'; await nap(0.5); W.remove('dao'); W.add('dao', { h: 4 }, 892, 800, { solid: false, draw: drawDao }); JX.audio.sfx('tick'); await nap(0.4); p.pose = null; await nap(0.3); },
    async 神尼笑() { await nap(0.9); },
    async 划断口() { W.focus = { x: 920, y: 700 }; W.zoom = 1.25; await nap(1.2); },
    async 推刀() { JX.audio.sfx('tick', 0.6); const p = W.player; p.pose = 'squat'; await nap(0.5); W.remove('dao'); p.pose = null; W.zoom = 1; W.focus = { x: 920, y: 620 }; await nap(0.4); },
    async 试玩到此五() {
      ST._endHtml = '<h2>试玩到此</h2><p>第三章《渔家傲》做到第四场：酒刀有了名字，叫“惊蛰”。</p><p>后面是潮音洞——阑珊在洞里，洞里不止她一个人。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在庵里看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      W.zoom = 1; W.focus = null; await H.试玩到此二();
    },
  });
})();
