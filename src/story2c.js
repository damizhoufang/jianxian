/* 第二章《扬州慢》末四场的演出：走水 31、另一回事 32、半句真话 33、人不见了 34。
   接在 story2b.js 后面。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks, Fig = JX.Fig;
  const { fighters, giveUp, ch2 } = ST._h;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const fl = () => JX.state.flags;
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';
  const drawLi = ST._drawLi, drawGoose = ST._drawGoose, drawMule = ST._drawMule;
  const halt = () => (fl().train || []).forEach(id => { const e = W.byId[id]; if (e) { e.path = null; e.moving = false; } });

  /* ---------- 自己画的几样 ---------- */
  /* 油葫芦：在地上滚（spinA 是转到哪了）、被按住（down）、腰里还剩几只葫芦（gourds） */
  function drawYou(g, e) {
    P.shadow(g, 0, 0, 38, 10, 0.38);
    g.save();
    if (e.down) { g.translate(-6, -30); g.rotate(-Math.PI / 2); g.translate(0, 62); }
    else if (e.spinA) { g.translate(0, -50); g.rotate(e.spinA); g.translate(0, 50); }
    if (e.dir === 1 || e.dir === 3) g.scale(1.34, 1);                                                              // 侧着看也是圆的
    Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, pose: e.down ? null : e.pose, carry: e.carry, shadow: false });
    if ((e.dir === 1 || e.dir === 3) && e.pose !== 'squat') {                                                  // 肚子：往前腆着，油绸上一道亮
      const fx = e.dir === 1 ? -9 : 9; g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(fx, -80, 15, 22, 0, 0, 6.3); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.1; g.beginPath(); g.ellipse(fx, -80, 15, 22, 0, e.dir === 1 ? 1.6 : -1.5, e.dir === 1 ? 4.6 : 1.5); g.stroke();
      g.strokeStyle = 'rgba(190,170,140,0.5)'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(fx + (e.dir === 1 ? -3 : 3), -84, 8, 14, 0, e.dir === 1 ? 2.4 : -0.7, e.dir === 1 ? 3.8 : 0.7); g.stroke();
      P.line(g, fx - 15, -72, fx + 15, -72, 4, '#7a5a2a');
    }
    const n = e.gourds || 0, yy = e.pose === 'squat' && !e.down ? -44 : -72;                                    // 腰里的葫芦
    for (let i = 0; i < n; i++) { const gx = -20 + i * 14; P.line(g, gx, yy - 8, gx, yy, 1.4, '#3a2a1e'); P.ellipse(g, gx, yy + 5, 5, 4.4, '#c9a45a', INK(), 1); P.ellipse(g, gx, yy + 13, 7, 6.4, '#b8903e', INK(), 1); }
    g.restore();
  }
  /* 躺在地上的人（被横着扔进门的那两个） */
  function drawLie(g, e) { P.shadow(g, 0, 0, 60, 9, 0.35); g.save(); g.translate(e.flip ? 10 : -10, -26); g.rotate((e.flip ? 1 : -1) * Math.PI / 2); g.translate(0, 70); Fig.draw(g, e.sp, e.dir, e.ph, { shadow: false }); g.restore(); }
  /* 烧黑的粮车、草垛（盖在原来那两样上头） */
  const drawChar = (w, h) => g => { g.fillStyle = 'rgba(14,10,8,0.66)'; g.beginPath(); g.ellipse(0, -h / 2, w / 2, h / 2 + 4, 0, 0, 6.3); g.fill(); for (let i = 0; i < 5; i++) P.line(g, -w / 2 + 20 + i * (w - 40) / 4, -4, -w / 2 + 30 + i * (w - 60) / 4, -h + 8 + (i % 2) * 14, 5, 'rgba(8,6,5,0.8)'); };
  const fling = async (draw, x0, y0, x1, y1, h, sec) => {                   // 扔一样东西过去，走一道弧线
    const e = W.add('fl' + Math.floor(JX.time * 1000), { h: 4 }, x0, y0, { solid: false, draw, sy: Math.max(y0, y1) + 200, ang: 0 });
    await JX.tween(JX.auto ? 0.02 : sec, q => { e.x = x0 + (x1 - x0) * q; e.y = y0 + (y1 - y0) * q; e.z = Math.sin(q * Math.PI) * h; e.ang = q * 9; }, q => q); W.remove(e.id);
  };
  const drawGourd = (g, e) => { g.save(); g.rotate(e.ang || 0); P.ellipse(g, 0, -6, 6, 5, '#c9a45a', INK(), 1); P.ellipse(g, 0, 5, 9, 8, '#b8903e', INK(), 1); g.restore(); };
  const drawWater = (g, e) => { for (let i = 0; i < 7; i++) P.ellipse(g, Math.sin(i * 2.4 + (e.ang || 0)) * 22, Math.cos(i * 1.7) * 14, 9 - i, 7 - i * 0.7, 'rgba(150,196,214,0.85)'); };
  const roll = async (e, tx, ty, sec, turns) => {                           // 贴着地滚过去
    const x0 = e.x, y0 = e.y, sg = tx >= x0 ? 1 : -1; e.pose = 'squat'; e.down = false;
    await JX.tween(JX.auto ? 0.02 : sec, q => { e.x = x0 + (tx - x0) * q; e.y = y0 + (ty - y0) * q; e.spinA = sg * q * Math.PI * 2 * (turns || 2); }); e.spinA = 0;
  };

  /* ---------- 各场景此刻有谁在 ---------- */
  const pop2 = JX.populate;
  JX.populate = function (id) {
    pop2(id);
    const sg = JX.state.stage, off = W.exitsOff;
    if (id === 'guanshe' && sg === 31) {
      const x = W.byId.xiali, h = W.byId.haojing;
      if (x) { x.x = 1180; x.y = 826; x.dir = 1; x.carry = null; }
      if (h) { h.x = 1096; h.y = 806; h.dir = 0; h.carry = null; }
    }
    if (id === 'ying' && sg === 32) {
      const x = W.byId.xiali; if (x) { x.x = 2590; x.y = 716; x.dir = 0; x.carry = null; }
      W.remove('geng');
      W.add('tingxue', 'tingxue', 2566, 786, { dir: 1, tag: '听雪', solid: false });
      W.add('haojing', 'haojing', 2520, 668, { dir: 0, tag: '郝经', solid: false, carry: 'book' });
      W.add('yan', { h: 4 }, 2600, 664, { solid: false, draw: drawGoose, side: -1, up: 0.4 });
      W.add('you', 'youhulu', 2476, 812, { dir: 0, tag: '油葫芦', solid: false, pose: 'squat', draw: drawYou, gourds: 1 });
      [[2396, 716, 3, 'torch'], [2400, 846, 3, 'spear'], [2330, 890, 3, 'torch'], [2716, 852, 1, 'spear'], [2640, 892, 2, 'torch'], [2712, 776, 1, 'spear'], [2700, 700, 1, 'torch']].forEach((q, i) => W.add('wb' + i, 'bing', q[0], q[1], { dir: q[2], solid: false, carry: q[3] }));
      W.add('liting', 'liting', 1900, 850, { dir: 3, tag: '李庭芝', solid: false, draw: drawLi, vis: false });
      W.add('laojun', 'laojun', 2640, 664, { dir: 1, tag: '老军', solid: false, vis: false });
      W.add('char1', { h: 4 }, 620, 801, { solid: false, draw: drawChar(230, 76) }); W.add('char2', { h: 4 }, 1380, 801, { solid: false, draw: drawChar(206, 132) });
      off['ying:guan'] = '门从外头闩上了。'; off['ying:out'] = '兵还围着。';
    }
    if (id === 'jiangbian') {
      W.add('xiali', 'xiali', 1380, 662, { dir: 2, tag: '夏离', reach: 130 });
      W.add('tingxue', 'tingxue', 1090, 688, { dir: 0, tag: '听雪', pose: 'sit', seat: 20, solid: false, bark: ['（嚼）……这饼是冷的。'] });
      W.add('mule', { h: 4 }, 800, 706, { dir: 3, solid: false, draw: drawMule, side: 1 });
      W.add('dugong', 'shaogong', 2140, 566, { dir: 1, solid: false });
    }
    if (id === 'hall' && sg === 34) {
      const s = W.byId.siniang; if (s) { s.x = 780; s.y = 404; s.dir = 0; s.solid = false; s.reach = 170; }
      W.add('xiali', 'xiali', 1500, 1300, { dir: 2, tag: '夏离', solid: false });
      W.add('tingxue', 'tingxue', 1370, 1320, { dir: 2, tag: '听雪', solid: false });
      W.add('agui', 'agui', 150, 688, { dir: 3, tag: '阿桂', solid: false, vis: false });
      off['hall:door'] = '才回来，不忙着出去。'; off['hall:stairs'] = '楼上这会儿没有他的事。'; off['hall:kitchen'] = '后厨攒了两个月的碗。\n这会儿进去，要被拉住。';
    }
  };

  /* ---------- 第九场的战斗：火、葫芦、在地上滚的人 ---------- */
  const HP = 300, HALF = 150;
  let fs = { fire: 0, gourds: 3, hp: HP };
  const SP = { p: [1120, 862], x: [1060, 782], t: [1010, 886], you: [1580, 842], hao: [1180, 700] };
  const fireBar = () => '护住书稿——火势 ' + '■'.repeat(fs.fire) + '□'.repeat(6 - fs.fire) + '（满六格，书稿就保不住了）';
  const getYou = () => W.byId.you || W.add('you', 'youhulu', SP.you[0], SP.you[1], { dir: 1, tag: '油葫芦', solid: false, draw: drawYou, carry: 'saber', gourds: fs.gourds });
  async function fight(phase) {
    const B = JX.battle, p = W.player, x = W.byId.xiali, yo = getYou(), hao = W.byId.haojing;
    const t = phase === 2 ? (W.byId.tingxue || W.add('tingxue', 'tingxue', SP.t[0], SP.t[1], { dir: 3, tag: '听雪', solid: false })) : null;
    const boss = b => b.units.find(u => u.key === 'you');
    const setFire = (b, v) => { if (fs.fire > 0 && v <= 0) W.charred = Math.max(W.charred || 0, 0.5); fs.fire = Math.max(0, Math.min(6, v)); W.fireLv = fs.fire; if (!fs.fire) W.matFire = false; const gl = b && b.box && b.box.querySelector('.goal'); if (gl) gl.innerHTML = '<b>◆</b>' + fireBar(); };
    const me = (b, pool) => pool.find(u => u.key === 'jingzhe') || pool[0];
    const dao = { name: '地躺刀', tell: '贴着地滚过来——刀是冲着阿蛰的脚踝去的', type: 'light', pow: 1, pick: me,
      pre: async (b, u) => { u.up = fs.gourds <= 0; u.last = 'dao'; u.note = u.up ? '葫芦扔完了，喘得滚不动' : '在地上滚'; const e = u.ent; e.pose = 'squat'; await B.fx.tw(0.3, q => { e.spinA = -q * Math.PI * 2; }); e.spinA = 0; } };
    const hulu = { name: '扔火葫芦', kind: 'wait', tell: '滚到了书架底下，手往腰里摸——要直起腰扔火葫芦', say: '油葫芦直起腰，一只葫芦脱手飞向书架——',
      fx: async (b, u) => { const e = u.ent; e.pose = null; e.dir = 1; JX.audio.sfx('page'); await fling(drawGourd, e.x, e.y - 90, 1500, 330, 150, 0.45); JX.audio.sfx('pop'); fs.gourds = Math.max(0, fs.gourds - 1); e.gourds = fs.gourds; setFire(b, fs.fire + 2); B.fx.floater(u, '火大了', '#ffb070'); u.up = true; u.threw = true; u.last = 'hulu'; u.note = '扔完葫芦，人还直着腰'; } };
    const pour = { id: 'shui', name: '泼水', kind: 'talk', desc: '抄起水缸边那只木桶，一桶水泼上去。火势归零。', say: '陆惊蛰抄起水桶，一桶水泼了上去——',
      fx: async (b, u) => { JX.audio.sfx('splash'); await fling(drawWater, u.ent.x + 30, u.ent.y - 100, 1480, 380, 120, 0.4); setFire(b, 0); B.fx.floater(u, '泼灭了', '#bfe3d0'); } };
    const press = { id: 'ya', name: '掌风·压火', kind: 'talk', desc: '听雪掌的掌风是冷的：一掌拍过去，火头就矮了。火势归零。', say: '耶律听雪一掌拍向火头——',
      fx: async (b, u) => { JX.audio.sfx('page'); await B.fx.tw(0.3, q => { u.ent.z = Math.sin(q * Math.PI) * 30; }); u.ent.z = 0; setFire(b, 0); B.fx.floater(u, '压灭了', '#bfe3d0'); } };
    const rec = (b, u) => {
      const o = boss(b), open = o.stun > 0 || o.up, tx = b.units.find(q => q.key === 'tingxue' && q.hp > 0);
      if (u.key === 'tingxue') {
        if (fs.fire > 0) return { pick: 'ya', hint: '火！——一掌拍过去，把火头压下去。' };
        return open ? { pick: 'tui', hint: '他起不来——一掌推实了！' } : { pick: 'shan', hint: '他在地上滚，够不着。等他直起腰。这一手先闪着。' };
      }
      if (u.key === 'jingzhe') {
        if (fs.fire > 0 && !tx) return { pick: 'shui', hint: '书架着了——提桶泼水！火到六格，书稿就保不住。' };
        if (open) return { pick: 'dian', hint: o.stun ? '他被按住了——打！' : '他直着腰，够得着——打！' };
        return o.intent === dao ? { pick: 'bu', hint: '他要滚过来砍脚踝——用踏潮步闪开。' } : { pick: 'sao', hint: '他在地上滚——门闩贴着地扫过去，滚着的人躲不开这一下。' };
      }
      if (o.stun) return { pick: 'zhan', hint: '按住了——一刀下去！' };
      if (o.up) return { pick: 'shuai', hint: '他直起腰来了——抢进去，把他摔在地上按住！' };
      return { pick: 'ge', hint: '他在地上滚，刀够不着。先守住，等他直起腰。' };
    };
    const place = () => {
      p.x = SP.p[0]; p.y = SP.p[1]; p.dir = 3; p.pose = null; p.carry = 'staff'; p.path = null;
      x.x = SP.x[0]; x.y = SP.x[1]; x.dir = 3; x.pose = null; x.carry = 'saber'; x.path = null;
      if (t) { t.x = SP.t[0]; t.y = SP.t[1]; t.dir = 3; t.pose = null; t.path = null; t.vis = true; t.alpha = 1; }
      if (hao) { hao.x = SP.hao[0]; hao.y = SP.hao[1]; hao.dir = 0; hao.carry = 'book'; hao.pose = null; hao.path = null; }
      yo.x = SP.you[0]; yo.y = SP.you[1]; yo.dir = 1; yo.vis = true; yo.alpha = 1; yo.z = 0; yo.down = false; yo.spinA = 0; yo.carry = 'saber'; yo.gourds = fs.gourds;
    };
    const f0 = { fire: phase === 1 ? 2 : Math.max(2, fs.fire), gourds: phase === 1 ? 2 : Math.min(1, fs.gourds), hp: phase === 1 ? HP : (fs.hp > 0 ? Math.min(HALF, fs.hp) : HALF) };
    let won = false;
    for (let lost = 0; ;) {
      fs = Object.assign({}, f0); W.fireLv = fs.fire; W.matFire = phase === 2; place();
      const team = fighters(p, x);
      team[0].cmds[0] = Object.assign({}, team[0].cmds[0], { name: '门闩·点', desc: '拿门闩的一头去点。出手快，下一手来得早。' });
      team[0].cmds[1] = Object.assign({}, team[0].cmds[1], { name: '门闩·扫', desc: '门闩贴着地横扫。他在地上滚的时候，只有这一下扫得着。出手慢。' });
      team[0].cmds.push(pour);
      team[1].cmds[2] = Object.assign({}, team[1].cmds[2], { desc: '草原上的摔跤手法。他在地上滚的时候抢不进去；等他直起腰，一绊一按，他两手之内起不来。' });
      if (t) team.push({ ent: t, key: 'tingxue', name: '耶律听雪', hp: 110, spd: 12, atk: 24, def: 5, season: 3, cmds: [
        { id: 'tui', name: '绵掌·推', kind: 'attack', type: 'light', pow: 0.9, desc: '一掌按在胸口，劲是往外送的。' },
        { id: 'shan', name: '闪', kind: 'dodge', desc: '身子一矮，从刀底下钻过去。' }, press] });
      const r = await B.run({
        goal: fireBar(), music: 'pozhen', season: 0, seasonEvery: 5, zoom: 1.04, focus: { x: 1300, y: 700 },
        allies: team,
        foes: [{ ent: yo, key: 'you', name: '油葫芦', hp: HP, spd: 10.5, atk: 30, def: 6, boss: true, keep: true, up: true, last: 'hulu', note: '扔完葫芦，人还直着腰',
          ai: (b, u) => (fs.gourds > 0 && u.last !== 'hulu' ? hulu : dao) }],      // 刚扔过、又没被按住：就地一刀；不然有葫芦就扔
        start(b) { const o = boss(b); o.hp = fs.hp; o.intent = dao; o.ent.pose = null; },
        allow: rec,
        autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id); },
        resolve(b, a, mv, tg, r2) {
          if (tg.key === 'you') {
            if (a.key === 'xiali' && mv.id === 'shuai' && (tg.up || tg.stun)) { tg.stun = Math.max(tg.stun, 2); tg.up = false; tg.pinned = true; tg.ent.down = true; tg.note = '被按在地上——两手之内起不来'; return r2; }
            if (!tg.stun && !tg.up && !(a.key === 'jingzhe' && mv.id === 'sao')) return { evade: false, block: true, dmg: 0, iron: '滚开了' };      // 滚着的时候，只有贴地的一扫够得着
          }
          if (a.key === 'you' && tg.stance === 'dodge' && !tg.stun) return { evade: true, block: false, dmg: 0 };      // 这一场的地躺刀，踏潮步总躲得开
          return r2;
        },
        end(b) { const o = boss(b); return fs.fire >= 6 ? 'lose' : o.hp <= (phase === 1 ? HALF : 0) ? 'win' : null; },
        async after(b, u) {
          const o = boss(b);
          if (u === o) {                                                      // 轮到他一回（哪怕他被按着），火就自己长一格——除非刚扔过葫芦
            if (fs.fire > 0 && !o.threw) { setFire(b, fs.fire + 1); B.fx.floater(o, '火又大了', '#ffb070'); }
            o.threw = false;
          }
          if (u === o && o.pinned && !o.stun) { o.pinned = false; o.up = fs.gourds <= 0; o.last = 'pin'; o.intent = fs.gourds > 0 ? hulu : dao; o.note = o.up ? '葫芦扔完了，喘得滚不动' : '挣出去了，又在地上滚'; }      // 挣出来以后：还有葫芦就接着扔
          o.ent.down = o.stun > 0; if (o.stun > 0) o.ent.pose = null; else if (!o.up) o.ent.pose = 'squat';
        },
      });
      fs.hp = Math.min(fs.hp, r.b.units.find(u => u.key === 'you').hp);
      if (r.result === 'win') { won = true; break; }
      await UI.narrate(fs.fire >= 6 ? '火舔到了书案上——不对，这一场还没完，再来。' : '眼前一黑。——不对，这一场还没完，再来。');
      if (await giveUp(++lost)) break;
      await UI.tutorial('再来一次', '<b>火势满六格就算输</b>：轮到油葫芦一回，火就自己长一格。<br>看见书架着了，' + (phase === 2 ? '听雪的<b>掌风·压火</b>' : '阿蛰的<b>泼水</b>') + '一下就灭。<br>他在地上滚的时候，只有阿蛰的<b>门闩·扫</b>够得着；等他<b>直起腰扔了葫芦</b>，夏离用<b>摔</b>把他按住，再打。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令上，照着按回车就行。');
    }
    if (!won) fs.hp = phase === 1 ? HALF : 0;
    fs.fire = phase === 1 ? 0 : 1; W.fireLv = fs.fire; W.matFire = false; yo.gourds = fs.gourds; yo.spinA = 0;
    return yo;
  }

  /* ---------- 演出 ---------- */
  Object.assign(H, {
    /* —— 九　走水 —— */
    async 入二九() { ch2(31); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = true; f.haoran = 1; f.train = null; W.blaze = (JX.time - 3) || 0.001; fs = { fire: 0, gourds: 3, hp: HP }; W.remove('you'); },
    async 火声() { JX.audio.amb('huo', 0.22); },
    async 看窗() { const p = W.player; p.path = null; p.dir = 2; W.focus = { x: 560, y: 520 }; await nap(1.2); },
    async 门闩响() { const p = W.player, x = W.byId.xiali; JX.audio.sfx('door'); p.dir = 1; W.focus = { x: 520, y: 640 }; if (x) { x.dir = 1; x.carry = 'saber'; } await nap(0.7); },
    async 油葫芦进门() {
      const p = W.player, x = W.byId.xiali, h = W.byId.haojing; W.remove('you');
      const yo = W.add('you', 'youhulu', 176, 690, { dir: 3, tag: '油葫芦', solid: false, draw: drawYou, carry: 'saber', gourds: 3 });
      if (x) W.walk(x, 880, 786, { speed: 220, dir: 1 }); W.walk(p, 800, 850, { speed: 220, dir: 1 }); if (h) h.dir = 1;
      await W.walk(yo, 420, 770, { speed: 150, straight: true, dir: 3 }); W.focus = { x: 700, y: 700 };
      const y = W.byId.yan; if (y) { y.up = 1; y.side = -1; JX.tween(JX.auto ? 0.02 : 0.9, q => { y.x = 1500 - 880 * q; y.y = 800 - 104 * q; y.z = Math.sin(q * Math.PI) * 26; }).then(() => { y.up = 0.5; }); }      // 雁扑着翅膀躲到水缸后头去了
      for (let i = 0; i < 2; i++) { yo.pose = 'squat'; await nap(0.35); yo.pose = null; await nap(0.3); }           // 作揖
    },
    async 摘葫芦() { const yo = W.byId.you; if (yo) { JX.audio.sfx('tick'); yo.gourds = 2; } await nap(0.6); },
    async 扔葫芦() {
      const yo = getYou(), p = W.player, x = W.byId.xiali, h = W.byId.haojing;
      JX.audio.sfx('page'); await fling(drawGourd, yo.x, yo.y - 90, 1500, 330, 190, 0.6); JX.audio.sfx('pop'); fs.gourds = 2; fs.fire = 2; W.fireLv = 2; yo.gourds = 2; JX.audio.amb('huo', 0.4);
      W.focus = { x: 1300, y: 700 }; await nap(0.5);
      await roll(yo, 760, 900, 0.5, 1.5); await roll(yo, SP.you[0], SP.you[1], 0.8, 3); yo.pose = null; yo.dir = 1;      // 人已经滚到了书架底下
      if (h) { await W.walk(h, 916, 706, { speed: 230, straight: true }); await W.walk(h, SP.hao[0], SP.hao[1], { speed: 230, straight: true, dir: 0 }); h.dir = 0; h.carry = 'book'; }
      p.carry = 'staff'; JX.audio.sfx('tick'); W.walk(p, SP.p[0], SP.p[1], { speed: 260, dir: 3 }); if (x) await W.walk(x, SP.x[0], SP.x[1], { speed: 260, dir: 3 }); await nap(0.3);
    },
    async 战油葫芦一() { const yo = await fight(1); W.charred = 0.5; await roll(yo, SP.you[0] + 40, SP.you[1] - 30, 0.4, 1.5); yo.pose = null; yo.dir = 1; W.focus = { x: 1100, y: 700 }; await nap(0.3); },
    async 听雪进门() {
      const p = W.player, x = W.byId.xiali; JX.audio.sfx('door'); W.focus = { x: 520, y: 700 };
      const mk = (id, y, flip) => W.add(id, 'zonghuo', 150, y, { dir: 3, solid: false, draw: drawLie, flip, z: 40 });
      const a = mk('zh1', 730, false), b = mk('zh2', 760, true);
      const slide = (e, tx, ty) => { const y0 = e.y; return JX.tween(JX.auto ? 0.02 : 0.45, q => { e.x = 150 + (tx - 150) * q; e.y = y0 + (ty - y0) * q; e.z = 40 * (1 - q); }); };
      slide(a, 400, 750); await slide(b, 330, 800); JX.audio.sfx('wrong'); p.dir = 1; if (x) x.dir = 1; await nap(0.4);
      W.remove('tingxue'); const t = W.add('tingxue', 'tingxue', 170, 700, { dir: 3, tag: '听雪', solid: false });
      await W.walk(t, 250, 740, { speed: 200, straight: true, dir: 3 }); await nap(0.3);
    },
    async 火把落地() { JX.audio.sfx('pop'); W.matFire = true; fs.fire = Math.max(2, fs.fire); W.fireLv = fs.fire; W.focus = { x: 900, y: 760 }; await nap(0.6); const t = W.byId.tingxue; if (t) await W.walk(t, SP.t[0], SP.t[1], { speed: 300, dir: 3 }); },
    async 战油葫芦二() {
      const yo = await fight(2), p = W.player, x = W.byId.xiali, t = W.byId.tingxue;
      yo.x = 1490; yo.y = 804; yo.down = true; yo.pose = null; yo.carry = null; yo.dir = 0; yo.vis = true; yo.alpha = 1;
      if (t) { t.x = 1566; t.y = 806; t.dir = 1; t.pose = null; } if (x) { x.x = 1404; x.y = 762; x.dir = 3; x.carry = 'saber'; } p.x = 1356; p.y = 836; p.dir = 3; p.carry = 'staff';
      JX.audio.amb('huo', 0.22); W.focus = { x: 1400, y: 720 }; W.camSnap = true; await nap(0.5);
    },
    async 指书架() { W.focus = { x: 1500, y: 560 }; await nap(0.9); W.focus = { x: 1400, y: 720 }; },
    async 收刀() { const x = W.byId.xiali, h = W.byId.haojing; if (h) h.dir = 3; await nap(0.5); if (x) x.carry = null; await nap(0.3); },
    async 灭火() {
      const h = W.byId.haojing; if (h) { h.carry = null; await W.walk(h, 1460, 690, { speed: 170, straight: true, dir: 2 }); h.dir = 2; }
      JX.audio.sfx('splash', 0.5); W.fireLv = 0; W.charred = 1; fs.fire = 0; JX.audio.amb(null); await nap(0.9); if (h) { h.dir = 0; h.carry = 'book'; }
    },
    async 兵来了() { JX.audio.sfx('bang'); await nap(0.5); JX.audio.sfx('bang'); W.focus = { x: 520, y: 640 }; await nap(0.8); },

    /* —— 十　另一回事 —— */
    async 入二十() { ch2(32); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = true; f.haoran = 1; f.train = null; W.embers = true; },
    async 围住() { const p = W.player; p.x = 2480; p.y = 724; p.dir = 0; p.carry = null; W.focus = { x: 2500, y: 740 }; W.snapCam(); },
    async 李庭芝来() {
      const li = W.byId.liting, b = W.byId.wb1; W.focus = { x: 2300, y: 740 };
      if (b) await W.walk(b, 2404, 884, { speed: 120, straight: true, dir: 3 });                                    // 让开一条路
      if (li) { li.vis = true; li.alpha = 1; await W.walk(li, 2340, 840, { speed: JX.auto ? 2000 : 170, straight: true, dir: 3 }); li.dir = 3; }
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue; p.dir = 1; if (x) x.dir = 1; if (t) t.dir = 1; await nap(0.5);
    },
    async 闻袖子() { const li = W.byId.liting, yo = W.byId.you; if (!li) return; await W.walk(li, 2408, 818, { speed: 130, straight: true, dir: 3 }); li.pose = 'squat'; if (yo) yo.dir = 1; await nap(JX.auto ? 0.05 : 1.3); li.pose = null; await nap(0.3); },
    async 堵嘴() { const b = W.byId.wb1, yo = W.byId.you; if (b && yo) { await W.walk(b, yo.x - 6, yo.y + 40, { speed: 200, straight: true, dir: 2 }); JX.audio.sfx('page'); yo.tag = null; await nap(0.4); } },
    async 看三人() { const li = W.byId.liting; if (li) { await W.walk(li, 2360, 840, { speed: 120, straight: true, dir: 3 }); li.dir = 3; } await nap(0.6); },
    async 李庭芝停步() { const li = W.byId.liting; if (li) { await W.walk(li, 2210, 850, { speed: 150, straight: true, dir: 1 }); li.dir = 1; } await nap(0.4); },
    async 李庭芝走() {
      const li = W.byId.liting, yo = W.byId.you, go = (e, d) => e && JX.sleep(JX.auto ? 0 : d).then(() => W.walk(e, 1700, 850, { speed: JX.auto ? 2400 : 190, straight: true })).then(() => { e.vis = false; });
      const ps = [go(li, 0)]; for (let i = 0; i < 7; i++) ps.push(go(W.byId['wb' + i], 0.3 + i * 0.25)); if (yo) { yo.pose = null; ps.push(go(yo, 0.7)); }
      await Promise.all(ps); const l = W.byId.laojun; if (l) { l.vis = true; l.alpha = 1; } await nap(0.4);
    },
    async 郝经回屋() {
      const h = W.byId.haojing, y = W.byId.yan, l = W.byId.laojun, x = W.byId.xiali; if (x) x.carry = null;
      if (h) { h.dir = 2; await JX.tween(JX.auto ? 0.02 : 0.7, q => { h.alpha = 1 - q; }); h.vis = false; }
      if (y) { await JX.tween(JX.auto ? 0.02 : 0.9, q => { y.x = 2600 - 70 * q; y.alpha = 1 - q * q; }); y.vis = false; }
      if (l) { await W.walk(l, 2540, 668, { speed: 120, straight: true, dir: 2 }); JX.audio.sfx('door', 0.5); await nap(0.6); l.dir = 0; }
    },
    async 可出营() { delete W.exitsOff['ying:out']; W.focus = null; fl().train = ['xiali', 'tingxue']; },

    /* —— 十一　半句真话 —— */
    async 入二十一() { ch2(33); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = false; f.haoran = 1; f.train = null; W.dawn = 0; W.geese = 0; W.exitsOff['jiangbian:boat'] = '渡船要等日头出来才开。'; },
    async 到水边() { const p = W.player, x = W.byId.xiali; p.path = null; await W.walk(p, 1290, 676, { speed: 180, dir: 3 }); p.dir = 3; W.focus = { x: 1340, y: 560 }; if (x) x.dir = 2; await nap(0.6); },
    async 起风() { JX.audio.sfx('page', 0.5); await nap(0.8); },
    async 揣信() { const x = W.byId.xiali; if (x) x.dir = 1; await nap(0.7); },
    async 日出() {
      W.focus = { x: 1420, y: 520 }; const x = W.byId.xiali; if (x) x.dir = 2; W.player.dir = 2;
      await JX.tween(JX.auto ? 0.05 : 4.2, q => { W.dawn = q; }); W.geese = JX.time; JX.audio.sfx('yan', 0.35); await nap(1.6);
    },
    async 夏离回头() { const x = W.byId.xiali; if (x) x.dir = 1; await nap(0.5); },
    async 夏离牵骡() {
      const x = W.byId.xiali, m = W.byId.mule, t = W.byId.tingxue; W.focus = null; delete W.exitsOff['jiangbian:boat'];
      if (t) { t.pose = null; t.bark = null; t.y = 720; }
      if (m) W.walk(m, 1780, 716, { speed: 150 }).then(() => { m.dir = 3; });
      if (x) { x.reach = null; await W.walk(x, 1880, 700, { speed: 170 }); x.dir = 1; }
      fl().train = ['tingxue'];
    },

    /* —— 十二　人不见了 —— */
    async 入二十二() { ch2(34); const f = fl(); f.wengOpen = true; f.tx = 1; f.dusk = false; f.haoran = 1; f.train = ['xiali', 'tingxue']; },
    async 到柜前() {
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue; halt(); fl().train = null; p.path = null;
      const a = W.walk(p, 800, 520, { speed: 220, dir: 2 }); if (x) W.walk(x, 960, 524, { speed: 220, dir: 2 }); if (t) W.walk(t, 1060, 548, { speed: 240, dir: 2 }); await a; p.dir = 2; W.focus = { x: 880, y: 470 }; W.zoom = 1.2; await nap(0.4);
    },
    async 镜头还原二() { W.focus = null; W.zoom = 1; await nap(0.3); },
    async 听雪垮脸() { const t = W.byId.tingxue; if (t) { t.pose = 'squat'; await nap(0.9); t.pose = null; } },
    async 范老停手() { const p = W.player; p.path = null; W.focus = { x: 1440, y: 420 }; W.zoom = 1.2; await nap(0.5); },
    async 阿桂跑来() {
      const a = W.byId.agui, p = W.player; W.focus = null; W.zoom = 1; if (!a) return;
      a.vis = true; a.alpha = 1; await W.walk(a, p.x - 96, p.y + 26, { speed: JX.auto ? 2400 : 330 }); a.dir = 3; p.dir = 1; W.focus = { x: p.x - 40, y: p.y - 60 }; W.zoom = 1.2; await nap(0.3);
      const x = W.byId.xiali, t = W.byId.tingxue; if (x) W.walk(x, p.x + 110, p.y + 30, { speed: 220, dir: 1 }); if (t) W.walk(t, p.x + 60, p.y + 96, { speed: 240, dir: 1 });
    },
    async 夏离放盏() { const x = W.byId.xiali; if (x) { x.dir = 1; JX.audio.sfx('tick', 0.6); } await nap(0.8); },
    async 试玩到此四() {
      ST._endHtml = '<h2>第二章　完</h2><p>序章《青玉案》、第一章《钗头凤》、第二章《扬州慢》都做完了：千里去救一个人，那人不肯走；回到临安，另一个人不见了。</p><p>下一章是《渔家傲》：四月，渡海去普陀。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在醉春楼里看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      W.zoom = 1; delete W.exitsOff['hall:door']; await H.试玩到此二();
    },
  });
  ST._fightYou = fight;
})();
