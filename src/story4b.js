/* 第四章《望海潮》的演出（二）：论潮 51、那一捺 52、临帖手 53、气吞万里 54。都在江心那条船上（src/scenes14.js 的 jiangxin）。
   论潮三场是一个对一个的小战斗（duel），各有一条规矩，照红字按回车就能赢；左上角一排“潮”，对面每轮到一回少一格，没了就算输。
   临帖手那一场是照着剧本演的（一回只给一个指令，打不赢，也不重打）。潮头看 W.chao，墙头上的人看 W.chaoMan，一片白看 W.chaoWhite。
   从第六场“放下手巾”起，惊蛰的小人肩上没有白手巾了（Fig.cast.jingzhe.towel，在 populate 里按场次设）。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, W = JX.world, UI = JX.ui, ST = JX.story, H = ST.hooks, Fig = JX.Fig;
  const { giveUp, XL, ch4 } = ST._h, { pop, puff, needle } = ST._h.b3;
  const nap = s => JX.sleep(JX.auto ? 0.02 : s);
  const tw = (s, f, e) => JX.tween(JX.auto ? 0.02 : s, f, e);
  const fl = () => JX.state.flags;
  const fast = v => (JX.auto ? 2400 : v);
  const INK = a => 'rgba(43,34,28,' + (a == null ? 0.85 : a) + ')';
  const say = (id, name, text, mood) => UI.say(id, name, text, mood || 'normal');
  /* 这一段新出场的四个人 */
  Object.assign(Fig.cast, {
    siyi: Object.assign({}, Fig.cast.shuli, { name: '司仪', robe: '#7a3f34', trim: '#3a1c16' }),
    sunaliu: { name: '孙阿六', h: 160, kind: 'short', robe: '#6d5d4a', trim: '#4a3f33', pants: '#57503f', hair: 'beggar', hairCol: '#1a1512', sash: '#8a6a3a', skin: '#d9b28a', wide: 0.9 },
    fandaqiang: Object.assign({}, Fig.cast.bing, { name: '樊教头', h: 158, skin: '#b88a64', beard: 'stubble' }),
    chonghe: { name: '冲和子', h: 156, kind: 'robe', robe: '#3f4f58', trim: '#1e2529', inner: '#e9e6dc', hair: 'dao', hairCol: '#15110f', beard: 'black', wide: 1.3, sash: '#c9a24a' },
  });
  ['司仪:siyi', '孙阿六:sunaliu', '樊教头:fandaqiang', '冲和子:chonghe'].forEach(s => { const [a, b] = s.split(':'); ST.alias(a, b); });
  const ME = [760, 770], FOE = [1160, 770], SIDE = { xiali: [312, 734], tingxue: [566, 716], qiushui: [300, 850] }, WAIT = { sunaliu: [1590, 690], fandaqiang: [1640, 770], chonghe: [1570, 846] };
  function ch4b(stage) { const p = ch4(stage); W.chao = 0; W.chaoMan = 0; W.chaoWhite = 0; W.jarsBroken = 0; W.zoom = 1; W.focus = null; if (p) { p.pose = null; p.vis = true; p.z = 0; } return p; }
  ST._h.ch4b = ch4b;
  /* 贺元度提起来的那一掌：一截袖子，一只手，掌心一团暗红 */
  function drawZhang(g) { const k = 0.6 + 0.4 * Math.sin((JX.time || 0) * 7); g.lineCap = 'round'; P.line(g, -10, -108, -40, -138, 13, INK(0.9)); P.line(g, -10, -108, -40, -138, 10, '#473c5a'); g.fillStyle = '#e2c4a0'; g.strokeStyle = INK(0.9); g.lineWidth = 1.6; g.beginPath(); g.ellipse(-46, -146, 8, 10, -0.5, 0, 6.3); g.fill(); g.stroke(); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(-50, -150, 0, -50, -150, 46); gr.addColorStop(0, 'rgba(255,90,70,' + (0.5 * k) + ')'); gr.addColorStop(1, 'rgba(255,90,70,0)'); g.fillStyle = gr; g.fillRect(-100, -200, 100, 100); g.restore(); }
  const palm = on => { const h = W.byId.he; W.remove('zhang'); if (on && h) W.add('zhang', { h: 1 }, h.x, h.y + 2, { solid: false, draw: drawZhang }); };
  /* 挨了那一掌的范老：心口多一个掌印 */
  function drawFanHit(g, e) { Fig.draw(g, e.sp, e.dir, e.ph, { moving: e.moving, carry: e.carry, shadow: true }); if (e.dir === 2) return; const x = e.dir === 3 ? 6 : e.dir === 1 ? -6 : 0; g.fillStyle = 'rgba(104,24,20,0.6)'; g.beginPath(); g.ellipse(x, -92, 6, 7.5, 0, 0, 6.3); g.fill(); for (let i = -2; i <= 2; i++) P.line(g, x + i * 2.6, -98, x + i * 3.6, -106 + Math.abs(i) * 1.6, 2.2, 'rgba(104,24,20,0.6)'); }
  function drawTowel(g) { P.shadow(g, 0, 2, 22, 6, 0.25); g.fillStyle = '#efe9da'; g.fillRect(-18, -8, 36, 12); g.strokeStyle = INK(0.7); g.lineWidth = 1.2; g.strokeRect(-18, -8, 36, 12); P.line(g, -18, -2, 18, -2, 1, 'rgba(120,110,90,0.5)'); }

  const pop5 = JX.populate;
  JX.populate = function (id) {
    pop5(id);
    const sg = JX.state.stage;
    Fig.cast.jingzhe.towel = !(sg >= 53 && sg <= 58);                 // 第六场放下的那条手巾（“放手巾”那一下拿掉的），卷一里没有再搭回去
    if (id !== 'jiangxin' || sg < 51 || sg > 54) return;
    const he = W.add('he', 'he', 960, 606, { dir: 0, tag: '贺元度', solid: false, pose: sg <= 52 ? 'sit' : null, seat: 34 });
    W.add('siyi', 'siyi', 1250, 650, { dir: 0, tag: '司仪', solid: false, carry: 'brush' });
    W.add('zd1', 'dashou', 800, 640, { dir: 0, tag: '半闲堂的人', solid: false }); W.add('zd2', 'dashou', 1140, 644, { dir: 0, tag: '半闲堂的人', solid: false });
    W.add('xiali', XL(), SIDE.xiali[0], SIDE.xiali[1], { dir: 3, tag: '夏离', solid: false });
    W.add('tingxue', 'tingxue', SIDE.tingxue[0], SIDE.tingxue[1], { dir: 3, tag: '听雪', solid: false });
    const qs = W.add('qiushui', 'qiushui2', SIDE.qiushui[0], SIDE.qiushui[1], { dir: 3, tag: '秋水', solid: false, carry: sg > 51 ? 'sword' : null });
    if (sg === 52) { qs.x = ME[0]; qs.y = ME[1]; qs.dir = 2; }                // 第六场开头：她还站在船板当中，剑没有收
    W.add('sunaliu', 'sunaliu', WAIT.sunaliu[0], WAIT.sunaliu[1], { dir: 1, tag: '孙阿六', solid: false, carry: 'pole' });
    W.add('fandaqiang', 'fandaqiang', WAIT.fandaqiang[0], WAIT.fandaqiang[1], { dir: 1, tag: '樊教头', solid: false, carry: 'spear' });
    W.add('chonghe', 'chonghe', WAIT.chonghe[0], WAIT.chonghe[1], { dir: 1, tag: '冲和子', solid: false });
    if (sg >= 53) { [['sunaliu', 1336, 648], ['fandaqiang', 1412, 640], ['chonghe', 1484, 652]].forEach(q => { const e = W.byId[q[0]]; e.x = q[1]; e.y = q[2]; e.dir = 0; });      // 第七场起：先前下过场的三位退到后栏边上看（最东头空出来）
      he.x = sg === 53 ? FOE[0] : 1010; he.y = 770; he.dir = 1; W.add('towel', { h: 1 }, 520, 800, { solid: false, draw: drawTowel }); W.chao = sg === 53 ? 0.3 : 0.62; }
    if (sg === 54) { W.jarsBroken = 1; palm(1); }
  };

  /* ---------- 论潮：一个对一个 ---------- */
  async function duel(o) {
    const B = JX.battle, goalText = b => o.goal + '<br>潮　' + '●'.repeat(Math.max(0, b.chao)) + '○'.repeat(Math.max(0, o.chao - b.chao));
    const setGoal = b => { const gl = b.box && b.box.querySelector('.goal'); if (gl) gl.innerHTML = '<b>◆</b>' + goalText(b); };
    for (let lost = 0; ;) {
      const me = W.byId[o.me] || W.player, foe = W.byId[o.foe]; [[me, ME, 3], [foe, FOE, 1]].forEach(([e, q, d]) => { e.x = q[0]; e.y = q[1]; e.dir = d; e.pose = null; e.path = null; e.vis = true; e.alpha = 1; });
      W.chao = o.line;
      const r = await B.run({
        goal: o.goal + '<br>潮　' + '●'.repeat(o.chao), music: 'jiaofeng', wheel: false, zoom: 1.12, focus: { x: 960, y: 700 },
        allies: [Object.assign({ ent: me }, o.ally)], foes: [Object.assign({ ent: foe, keep: true }, o.enemy)],
        start(b) { b.chao = o.chao; setGoal(b); },
        allow: o.rec,
        autoPick(b, u, cmds) { const id = o.rec(b, u).pick; return cmds.find(c => c.id === id) || cmds[0]; },
        resolve: o.resolve,
        end(b) { return b.chao <= 0 && b.units.some(u => u.side === 'foe' && u.hp > 0) ? 'lose' : null; },
        async after(b, u) { if (u.side === 'foe') { b.chao--; W.chao = o.line + 0.06 * (1 - b.chao / o.chao); setGoal(b); } },
      });
      if (r.result === 'win') { foe.pose = 'squat'; break; }
      await UI.narrate(r.b.chao <= 0 ? '东边那条白线到了船边——潮到了，还没有分出输赢。再来。' : '眼前一黑。——不对，这一场还没完，再来。');
      if (await giveUp(++lost)) break;
      await UI.tutorial('再来一次', o.again);
    }
    W.focus = null; W.zoom = 1; JX.audio.music('lunchao'); await nap(0.3);
  }
  const foeOf = b => b.units.find(u => u.side === 'foe');
  /* 听雪对孙阿六：竹竿长，近不了身；他横扫的时候站定了攥住竿子（独钓寒江），他就失了衡，这时候推 */
  const DUEL_T = {
    me: 'tingxue', foe: 'sunaliu', chao: 8, line: 0.1, goal: '他横扫时攥住竹竿，再推',
    again: '<b>竹竿长，她近不了身。</b><br>他要<b>横扫</b>的时候用“独钓寒江”：站定了，一把攥住竿子——他就站不稳了，这时候推。<br>照着红字按回车就行。',
    ally: { key: 'tingxue', name: '耶律听雪', hp: 110, spd: 12, atk: 24, def: 5, cmds: [
      { id: 'diao', name: '独钓寒江', kind: 'guard', desc: '站定了不动，等他的重手过来——一把攥住。', fx: (b, u) => { u.diao = 1; } },
      { id: 'tui', name: '绵掌·推', kind: 'attack', type: 'light', pow: 1.05, desc: '一掌按在胸口，劲是往外送的。竿子在他手里的时候，近不了身。' },
      { id: 'shan', name: '闪', kind: 'dodge', desc: '身子一矮，从竿子底下钻过去。' }] },
    enemy: { key: 'sunaliu', name: '孙阿六', hp: 90, spd: 10, atk: 20, def: 3, n: 0, ai: (b, u) => (u.n++ % 2 ? { name: '竹竿·点', type: 'light', pow: 0.9, tell: '竿头一颤一颤——要点过来（快手）' } : { name: '竹竿·扫', type: 'heavy', pow: 1.5, delay: 1.1, tell: '竹竿抡圆了——要横扫（重手）' }) },
    rec(b, u) { const f = foeOf(b); if (f.stun > 0) return { pick: 'tui', hint: '竿子在她手里，他站不稳——推！' }; if (f.intent && f.intent.type === 'heavy') return { pick: 'diao', hint: '他要横扫——“独钓寒江”：站定了，攥住它。' }; return { pick: 'shan', hint: '竿头点过来了——先闪。' }; },
    resolve(b, a, m, t, r) {
      if (a.side === 'foe') { const d = t.diao; t.diao = 0; if (d && m.type === 'heavy') { a.stun = 2; a.intent = null; return { iron: '攥住了' }; } return r; }
      if (!t.stun) return { iron: '近不了身' }; return r;
    },
  };
  /* 夏离对樊教头：枪长刀短；他直刺的时候拿刀背格开，枪到了外门就抢进去摔，倒了再斩 */
  const DUEL_X = {
    me: 'xiali', foe: 'fandaqiang', chao: 7, line: 0.17, goal: '格开枪，摔倒了再斩',
    again: '<b>枪长刀短，她够不着。</b><br>他<b>直刺</b>的时候用“弯刀·格”把枪格到外门；枪收不回来的那一下，抢进去“摔”；他倒在船板上，再“斩”。<br>照着红字按回车就行。',
    ally: { key: 'xiali', name: '夏离', hp: 120, spd: 11, atk: 28, def: 8, cmds: [
      { id: 'ge', name: '弯刀·格', kind: 'guard', desc: '刀背贴着枪杆格出去。', fx: (b, u) => { u.ge = 1; } },
      { id: 'shuai', name: '摔', kind: 'attack', type: 'grab', pow: 0.6, desc: '抢进去，一手拿腕，一脚绊腿。枪在外门的时候才抢得进去。' },
      { id: 'zhan', name: '弯刀·斩', kind: 'attack', type: 'heavy', pow: 1.25, delay: 1.1, desc: '弯刀自上而下。他站着的时候，枪比刀长，够不着。' }] },
    enemy: { key: 'fandaqiang', name: '樊教头', hp: 92, spd: 9.5, atk: 24, def: 6, n: 0, ai: (b, u) => (u.n++ % 2 ? { name: '枪杆·拨', type: 'light', pow: 0.8, tell: '枪杆横过来了——要拨（快手）' } : { name: '长枪·刺', type: 'heavy', pow: 1.6, delay: 1.1, tell: '枪尖抖了个花——要直刺（重手）' }) },
    rec(b, u) { const f = foeOf(b); if (f.stun > 0) return { pick: 'zhan', hint: '他倒在船板上——斩！' }; if (f.open) return { pick: 'shuai', hint: '枪在外门，收不回来——抢进去，摔！' }; return { pick: 'ge', hint: f.intent && f.intent.type === 'heavy' ? '他要直刺——刀背贴上去，格开。' : '枪杆拨过来了——先格住。' }; },
    resolve(b, a, m, t, r) {
      if (a.side === 'foe') { const g = t.ge; t.ge = 0; if (g && m.type === 'heavy') { a.open = 1; a.note = '枪给格到了外门，收不回来'; return { iron: '格开了' }; } return r; }
      if (m.id === 'shuai' || m.type === 'grab') { if (!t.open) return { iron: '抢不进去' }; t.open = 0; t.note = null; t.stun = 3; t.intent = null; t.ent.pose = 'squat'; return r; }
      if (!t.stun) return { iron: '够不着' }; return r;
    },
  };
  /* 秋水对冲和子：他沉气蓄剑的时候有一口气护着；趁那口气还没满，银瓶乍破一剑破进去，气散了再连点 */
  const DUEL_Q = {
    me: 'qiushui', foe: 'chonghe', chao: 8, line: 0.24, goal: '趁他沉气，一剑破进去',
    again: '<b>他蓄满了的那一剑接不住。</b><br>他把剑尖垂下去<b>沉气</b>的时候，用“银瓶乍破”一剑破进去——那口气就散了，这时候“大珠小珠”连点。<br>照着红字按回车就行。',
    ally: { key: 'qiushui', name: '辛秋水', hp: 105, spd: 12.5, atk: 26, def: 5, cmds: [
      { id: 'leng', name: '冷月无声', kind: 'dodge', desc: '身子一侧，人已经让开了。' },
      { id: 'ping', name: '银瓶乍破', kind: 'attack', type: 'heavy', pow: 1.45, delay: 1.1, desc: '蓄住了再出，一剑破进去。他沉气的时候用，破他那一口气；别的时候剑给他缠着，走不进去。' },
      { id: 'zhu', name: '大珠小珠', kind: 'attack', type: 'light', pow: 0.85, delay: 0.85, desc: '琵琶上的指法，换到了剑尖上：连点三处。' }] },
    enemy: { key: 'chonghe', name: '冲和子', hp: 84, spd: 11, atk: 22, def: 5, n: 0, ai: (b, u) => { const k = u.n++ % 3; return k === 0 ? { name: '道剑·缠', type: 'light', pow: 0.8, tell: '剑走得又慢又圆——来缠（快手）' } : k === 1 ? { name: '沉气', kind: 'wait', id: 'xu', say: '冲和子把剑尖垂了下去，气往下沉。', tell: '剑尖要垂下去了——要沉气蓄剑', fx: (b2, u2) => { u2.xu = 1; u2.note = '在沉气：一口气护着身子，还没有蓄满'; } } : { name: '道剑·贯', type: 'heavy', pow: 2.6, delay: 1.2, tell: '蓄满了——一剑贯过来（重手）', pre: (b2, u2) => { u2.xu = 0; u2.note = null; } }; } },
    rec(b, u) { const f = foeOf(b); if (f.stun > 0) return { pick: 'zhu', hint: '他那口气散了——“大珠小珠”，连点。' }; if (f.xu) return { pick: 'ping', hint: '他在沉气——趁还没有蓄满，“银瓶乍破”，一剑破进去！' }; return { pick: 'leng', hint: f.intent && f.intent.type === 'heavy' ? '蓄满了的一剑——让开！' : f.intent && f.intent.id === 'xu' ? '他要沉气了。这一手先让着，等他把剑尖垂下去。' : '他来缠——让开。' }; },
    resolve(b, a, m, t, r) {
      if (a.side === 'foe') return r;
      if (t.xu && m.id === 'ping') { t.xu = 0; t.note = null; t.stun = 3; t.intent = null; t.n = 0; pop(t.ent, '气散了', '#cfe3f0'); return r; }
      if (t.xu) return { iron: '气护着' };
      if (!t.stun) return { iron: '给他缠住了' }; return r;
    },
  };
  async function back(id, to) { const e = W.byId[id]; if (!e) return; e.pose = null; await W.walk(e, to[0], to[1], { speed: fast(210), straight: true }); }

  Object.assign(H, {
    /* —— 五　论潮 —— */
    async 入四五() { ch4b(51); },
    async 听雪上场() { const t = W.byId.tingxue; if (!t) return; W.focus = { x: 900, y: 660 }; await W.walk(t, ME[0], ME[1], { speed: fast(260), straight: true, dir: 3 }); t.dir = 0; t.carry = 'bowl'; JX.audio.sfx('pop', 0.5); await nap(0.7); t.carry = null; t.dir = 1; await nap(0.2); },
    async 阿六上场() { const a = W.byId.sunaliu, t = W.byId.tingxue; if (t) t.dir = 3; if (a) { await W.walk(a, FOE[0], FOE[1], { speed: fast(220), straight: true, dir: 1 }); a.dir = 1; } await nap(0.3); },
    async 战听雪() { await duel(DUEL_T); },
    async 听雪赢了() {
      const t = W.byId.tingxue; back('sunaliu', WAIT.sunaliu).then(() => { const a = W.byId.sunaliu; if (a) a.dir = 1; }); if (!t) return; t.dir = 1;
      for (let i = 0; i < 3; i++) { JX.audio.sfx('tick', 0.5); await tw(0.3, k => { t.z = Math.sin(k * Math.PI) * 46; }); W.shakeAmp = 4; } t.z = 0; W.player.dir = 3; await nap(0.2);
    },
    async 贺添签() { const t = W.byId.tingxue; if (t) await W.walk(t, SIDE.tingxue[0], SIDE.tingxue[1], { speed: fast(260), straight: true, dir: 3 }); W.focus = { x: 960, y: 560 }; W.zoom = 1.2; JX.audio.music('anliu'); await nap(0.8); },
    async 夏离上场() {
      const x = W.byId.xiali, f = W.byId.fandaqiang; W.zoom = 1; W.focus = { x: 900, y: 660 }; if (!x) return; x.carry = 'saber';
      const a = W.walk(x, ME[0], ME[1], { speed: fast(210), straight: true, dir: 3 }); if (f) W.walk(f, FOE[0], FOE[1], { speed: fast(200), straight: true, dir: 1 }); await a; x.dir = 0; x.carry = 'bowl'; await nap(0.6); x.carry = 'saber'; x.dir = 3; if (f) f.dir = 1; JX.audio.music('lunchao'); await nap(0.3);
    },
    async 战夏离() { await duel(DUEL_X); },
    async 夏离赢了() { const f = W.byId.fandaqiang; if (f) { f.pose = null; f.dir = 1; } await nap(0.5); },
    async 夏离回() { const x = W.byId.xiali; back('fandaqiang', WAIT.fandaqiang).then(() => { const f = W.byId.fandaqiang; if (f) f.dir = 1; }); if (x) { await W.walk(x, SIDE.xiali[0], SIDE.xiali[1], { speed: fast(200), straight: true }); x.dir = 2; x.carry = null; } await nap(0.6); },
    async 秋水上场() {
      const q = W.byId.qiushui, x = W.byId.xiali; if (x) x.dir = 3; if (!q) return; W.focus = { x: 900, y: 660 };
      await W.walk(q, ME[0], ME[1], { speed: fast(170), straight: true, dir: 3 }); q.dir = 3; await nap(0.3); q.carry = 'sword'; JX.audio.sfx('ming', 0.6); JX.audio.sfx('han', 0.8); puff(q); if (W.fx) W.fx('ring', q.x + 30, q.y - 80, { s: 0.9, col: 'rgba(207,227,240,0.9)' }); await nap(0.8);
    },
    async 冲和上场() { const c = W.byId.chonghe; if (!c) return; await W.walk(c, FOE[0], FOE[1], { speed: fast(180), straight: true, dir: 1 }); c.dir = 1; await nap(0.5); c.carry = 'sword'; JX.audio.sfx('page', 0.5); await nap(0.4); },
    async 战秋水() { await duel(DUEL_Q); },
    async 秋水赢了() { const c = W.byId.chonghe; if (c) { c.pose = null; c.dir = 1; } await nap(0.5); },
    async 贺起身() { const h = W.byId.he, q = W.byId.qiushui; back('chonghe', WAIT.chonghe); if (q) q.dir = 2; if (h) { h.pose = null; h.y = 628; } W.focus = { x: 940, y: 600 }; W.zoom = 1.25; JX.audio.music('anliu'); await nap(1); },
    /* —— 六　那一捺 —— */
    async 入四六() { const p = ch4b(52); p.carry = null; },
    async 放手巾() { const p = W.player; Fig.cast.jingzhe.towel = false; W.add('towel', { h: 1 }, p.x + 10, p.y + 16, { solid: false, draw: drawTowel }); JX.audio.sfx('page', 0.4); await nap(0.6); },
    async 惊蛰下场() { const p = W.player, q = W.byId.qiushui; p.path = null; await W.walk(p, 960, 770, { speed: 170, straight: true, dir: 2 }); p.dir = 2; if (q) W.walk(q, SIDE.qiushui[0] + 60, SIDE.qiushui[1], { speed: fast(180), straight: true, dir: 3 }); W.focus = { x: 960, y: 640 }; W.zoom = 1.15; await nap(0.5); },
    async 满江静() { JX.audio.music(null); if (JX.audio.amb) JX.audio.amb('shui', 0.1); W.zoom = 1; W.focus = { x: 960, y: 540 }; await nap(1.6); },
    async 贺出棚() { const h = W.byId.he; if (!h) return; h.pose = null; h.y = 628; W.zoom = 1.15; W.focus = { x: 980, y: 660 }; await W.walk(h, 1130, 730, { speed: fast(110), straight: true, dir: 1 }); h.dir = 1; W.player.dir = 3; JX.audio.music('anliu'); await nap(0.4); },
    async 赐酒() { const d = W.byId.zd2, p = W.player; if (d) { d.carry = 'bowl'; await W.walk(d, p.x + 70, p.y + 10, { speed: fast(160), straight: true, dir: 1 }); d.carry = null; } p.carry = 'bowl'; await nap(0.9); JX.audio.sfx('pop', 0.5); p.carry = null; if (d) W.walk(d, 1140, 644, { speed: fast(160), straight: true, dir: 0 }); await nap(0.4); },
    /* —— 七　临帖手 —— */
    async 入四七() { const p = ch4b(53); p.carry = 'jiudao'; },
    async 战贺() {
      const B = JX.battle, p = W.player, h = W.byId.he; p.x = ME[0]; p.y = ME[1]; p.dir = 3; p.pose = null; p.carry = 'jiudao'; h.x = FOE[0]; h.y = FOE[1]; h.dir = 1; h.pose = null; W.chao = 0.3;
      const narr = t => B.talk(() => UI.narrate(t)), heSay = (t, m) => B.talk(() => say('he', '贺元度', t, m));
      const hurt = (u, n) => { const d = B.soak(n); u.hp = Math.max(6, u.hp - d); B.fx.floater(u, '−' + d, '#ff8a70'); JX.audio.sfx('wrong'); if (W.fx) { W.fx('slash', u.ent.x, u.ent.y - 78, { s: 1.2, rot: Math.PI - 0.35 }); W.fx('flash', u.ent.x, u.ent.y - 80, { s: 1 }); W.shakeAmp = 8; } };
      const tell = (b, t) => { const f = foeOf(b); f.intent = { name: '看', kind: 'wait', tell: t }; };
      const STEPS = [
        { name: '挑灯看剑', desc: '第一式。刀尖自下而上一挑。', hint: '第一式——挑灯看剑。', fx: async (b, u, f) => {
          await B.fx.lunge(u, f, 0.8); B.fx.floater(f, '让开了', '#c9d2d8'); await B.fx.hop(f); await B.fx.back(u);
          await heSay('“挑灯看剑”，是这样么？——我只看了一遍。');
          await B.fx.lunge(f, u, 0.85); hurt(u, 28); await B.fx.back(f); await narr('同一式。从他手上出来，比他使的还要干净。'); tell(b, '两手垂着，像在等下一行字'); } },
        { name: '吹角连营', desc: '第二式。站远了出，一刀后头跟着两刀。', hint: '第二式——吹角连营。退三步再出。', fx: async (b, u, f) => {
          u.ent.dir = 3; for (let i = 0; i < 3; i++) { JX.audio.sfx('page', 0.5); await needle(u.ent, f.ent, 0.16); } B.fx.floater(f, '袖子一卷，卸了', '#c9d2d8'); await B.fx.wait(0.5);
          for (let i = 0; i < 3; i++) { JX.audio.sfx('page', 0.5); await needle(f.ent, u.ent, 0.14); } hurt(u, 30); await narr('角声是从远处来的。——这一条，他也只看了一遍。'); tell(b, '看着他，像看一张帖'); } },
        { name: '霹雳弦惊', desc: '第三式。一刀过去，像弓弦弹开。', hint: '第三式——霹雳弦惊。', fx: async (b, u, f) => {
          JX.audio.sfx('ming', 0.7); await B.fx.lunge(u, f, 0.9); B.fx.floater(f, '两根手指，夹住了', '#c9d2d8'); await B.fx.wait(0.6);
          if (W.fx) W.fx('flash', u.ent.x, u.ent.y - 80, { s: 1.6 }); JX.audio.sfx('lei', 0.5); W.shakeAmp = 14; const x0 = u.ent.x, y0 = u.ent.y; hurt(u, 36);
          await tw(0.5, k => { u.ent.x = x0 + (470 - x0) * k; u.ent.y = y0 + (690 - y0) * k; u.ent.z = Math.sin(k * Math.PI) * 60; }); u.ent.z = 0; W.jarsBroken = 1; JX.audio.sfx('pop'); JX.audio.sfx('splash', 0.7); W.shakeAmp = 10; u.ent.pose = 'squat';
          await narr('他撞进了船板左边那一排酒坛里。三坛蓬莱春，碎在他身上。'); await narr('空着肚子的那一碗，再加上这一身——酒意上来了。');
          u.ent.pose = null; u.ent.moving = true; await tw(1.1, k => { u.ent.x = 470 + (ME[0] - 470) * k; u.ent.y = 690 + (ME[1] - 690) * k + Math.sin(k * 9) * 10; }); u.ent.moving = false; u.ent.dir = 3; b.zui = 1; tell(b, '把夹过刀的两根手指，在袖子上擦了擦'); } },
        { name: '挑灯看剑', desc: '第一式。——脚下有点发飘。', hint: '脚下发飘。还是第一式。', fx: async (b, u, f) => {
          B.fx.lunge(f, u, 0.5); await B.fx.lunge(u, f, 0.5); if (W.fx) W.fx('ring', (u.ent.x + f.ent.x) / 2, u.ent.y - 80, { s: 1.1, col: 'rgba(240,226,176,0.9)' }); JX.audio.sfx('gong', 0.5); hurt(u, 18); await B.fx.back(u); await B.fx.back(f);
          await narr('他才一抬手，对面已经是同一式——比他还早了半步。'); tell(b, '等着他出第二式'); } },
        { name: '吹角连营——', desc: '第二式。……脚底下是湿的。', hint: '第二式。', fx: async (b, u, f) => {
          await narr('第二式起到一半，脚下一滑。'); const x0 = u.ent.x; u.ent.moving = true; await tw(0.5, k => { u.ent.x = x0 + 250 * k; u.ent.z = Math.abs(Math.sin(k * 7)) * 14; }); u.ent.moving = false; u.ent.z = 0;
          if (W.fx) { W.fx('slash', f.ent.x - 20, f.ent.y - 96, { s: 1.4, rot: -0.9 }); W.fx('flash', f.ent.x, f.ent.y - 90, { s: 0.9 }); } JX.audio.sfx('ming', 0.8); B.fx.floater(f, '袖子破了', '#fff2c0'); await B.fx.hop(f);
          await narr('刀没有收回来。顺着那一滑，接上了半式不知道是什么的东西。'); await narr('贺元度退了一步。这是今天他头一回退。');
          await heSay('（看着破了的袖口）这一招没有出处。……有意思。'); await B.fx.back(u); tell(b, '看着破了的袖口'); } },
        { name: '照方才那样，再滑一回', desc: '使错的那一下。——能不能再使一回？', hint: '方才是怎么滑的？照样再来一回。', fx: async (b, u, f) => {
          const x0 = u.ent.x; u.ent.moving = true; await tw(0.5, k => { u.ent.x = x0 + 250 * k; }); u.ent.moving = false; B.fx.floater(f, '接住了', '#c9d2d8'); JX.audio.sfx('tick'); await B.fx.wait(0.5);
          await heSay('学着使错，就有出处了。', 'smile'); hurt(u, 24); await tw(0.4, k => { u.ent.x = x0 + 250 - 250 * k; }); u.ent.pose = 'squat';
          await narr('他单膝跪了下去。刀还在手里。'); const fx0 = f.ent.x; f.ent.moving = true; await tw(1.2, k => { W.chao = Math.max(W.chao, 0.3 + 0.32 * k); f.ent.x = fx0 + (1010 - fx0) * k; }); f.ent.moving = false; palm(1); tell(b, '右掌提起来了'); await B.fx.wait(0.8); } },
      ];
      await B.run({
        goal: '照着按回车，看他怎么接', music: 'jiaofeng', wheel: false, zoom: 1.12, focus: { x: 940, y: 700 },
        allies: [{ ent: p, key: 'jingzhe', name: '陆惊蛰', hp: 150, spd: 13, atk: 22, def: 6, cmds: STEPS.map((s, i) => ({ id: 's' + i, name: s.name, kind: 'talk', say: '陆惊蛰：' + s.name.replace(/——$/, ''), desc: s.desc, when: b => b.step === i, fx: async (b, u) => { await s.fx(b, u, foeOf(b)); b.step++; W.chao = Math.max(W.chao, 0.3 + 0.05 * b.step); } }))}],
        foes: [{ ent: h, key: 'he', name: '贺元度', hp: 999, spd: 1, atk: 30, def: 10, boss: true, keep: true, showHp: false, note: '临帖手：见过一遍的招，他都摹得出来', ai: () => ({ name: '看', kind: 'wait', tell: '两手垂着，像在等人递笔' }) }],
        start(b) { b.step = 0; },
        allow: (b, u) => ({ pick: 's' + b.step, hint: STEPS[Math.min(b.step, STEPS.length - 1)].hint }),
        autoPick: (b, u, cmds) => cmds[0],
        end(b) { return b.step >= STEPS.length ? 'win' : null; },
      });
      p.pose = 'squat'; p.x = ME[0]; p.y = ME[1]; h.x = 1010; h.y = 770; h.dir = 1; W.chao = 0.62; palm(1); W.focus = { x: 900, y: 700 }; W.zoom = 1.1; await nap(0.4);
    },
    /* —— 八　气吞万里 —— */
    async 入四八() { const p = ch4b(54); p.carry = 'jiudao'; p.pose = 'squat'; },
    async 潮立起来() { const p = W.player; p.pose = 'squat'; p.x = ME[0]; p.y = ME[1]; p.dir = 3; W.zoom = 1; W.focus = { x: 1080, y: 540 }; if (JX.audio.amb) JX.audio.amb('chao', 0.5); await tw(2.6, k => { W.chao = 0.62 + 0.2 * k; W.shakeAmp = 2 + 3 * k; }); },
    async 潮上有人() { await tw(2.4, k => { W.chaoMan = k; W.chao = 0.82 + 0.06 * k; W.shakeAmp = 4; }); await nap(0.3); },
    async 师父挡掌() {
      const p = W.player, h = W.byId.he; W.chaoMan = 0; const f = W.add('fan', 'fan', 1420, 770, { dir: 1, tag: '范醉翁', solid: false }); f.z = 560;      // 从墙头上下来：一道弧线，落在两个人当中
      await tw(0.5, k => { f.x = 1420 + (900 - 1420) * k; f.z = 560 * (1 - k) * (1 - k) + 90 * Math.sin(k * Math.PI); }); f.z = 0; f.dir = 3; W.shakeAmp = 6; JX.audio.sfx('tick', 0.6); W.focus = { x: 920, y: 660 }; W.zoom = 1.2;
      palm(0); if (h) { const x0 = h.x; await tw(0.18, k => { h.x = x0 - 60 * k; }); if (W.fx) { W.fx('flash', f.x + 10, f.y - 92, { s: 1.5 }); W.fx('ring', f.x + 10, f.y - 92, { s: 1.2, col: 'rgba(255,138,112,0.9)' }); } JX.audio.sfx('lei', 0.6); W.shakeAmp = 16; f.draw = drawFanHit; await tw(0.3, k => { h.x = x0 - 60 + 60 * k; }); } await nap(0.7);
    },
    async 拔筷子() { const f = W.byId.fan; if (f) f.carry = 'kuai'; JX.audio.sfx('tick', 0.5); await nap(0.6); },
    async 气吞万里() {
      const f = W.byId.fan, h = W.byId.he; if (!f || !h) return; if (UI.cutBanner) await UI.cutBanner([], '气吞万里', 1.5);
      JX.audio.sfx('ming'); const x0 = f.x; await tw(0.22, k => { f.x = x0 + (h.x - 80 - x0) * k; }); if (W.fx) { W.fx('slash', h.x, h.y - 90, { s: 2.2, rot: 0.2 }); W.fx('flash', h.x, h.y - 90, { s: 2 }); W.fx('ring', h.x, h.y - 90, { s: 1.8, col: 'rgba(255,242,192,0.95)' }); } JX.audio.sfx('lei', 0.8); W.shakeAmp = 20;
      const hx = h.x; await tw(0.5, k => { h.x = hx + (1380 - hx) * k; h.z = Math.sin(k * Math.PI) * 50; }); h.z = 0; h.pose = 'squat'; h.dir = 1; await nap(0.8);
    },
    async 潮到了() { const f = W.byId.fan; W.zoom = 1; W.focus = { x: 1100, y: 560 }; if (f) { f.carry = null; W.walk(f, 1640, 760, { speed: fast(170), straight: true, dir: 3 }); } await tw(2.2, k => { W.chao = 0.88 + 0.045 * k; W.shakeAmp = 6 + 6 * k; W.focus = { x: 1100, y: 560 + 34 * Math.sin(k * Math.PI) }; }); if (f) f.dir = 3; },      // 镜头往下一沉：船给抬起来了
    async 师父回头() { const f = W.byId.fan; if (f) f.dir = 1; W.shakeAmp = 8; await nap(0.5); },
    async 卷走() {
      const p = W.player, f = W.byId.fan, q = W.byId.qiushui; p.pose = null; p.moving = true; const x0 = p.x; JX.audio.sfx('lei', 0.9);
      await tw(0.9, k => { W.chao = 0.925 + 0.075 * k; W.chaoWhite = k * k; W.shakeAmp = 18; p.x = x0 + 420 * k; });
      p.moving = false; if (f) f.vis = false; p.x = 1250; p.y = 770; p.dir = 3; p.pose = 'squat'; p.carry = null; if (q) { q.x = 1186; q.y = 790; q.dir = 3; q.pose = null; }
      const h = W.byId.he; if (h) { h.x = 1400; h.y = 690; h.pose = 'squat'; h.dir = 1; }
      ['xiali', 'tingxue'].forEach((k, i) => { const e = W.byId[k]; if (e) { e.pose = 'squat'; e.x = 420 + i * 120; e.y = 760; e.dir = 3; } });
      ['zd1', 'zd2', 'siyi', 'sunaliu', 'fandaqiang', 'chonghe'].forEach(k => { const e = W.byId[k]; if (e) { e.pose = 'squat'; e.carry = null; } });      // 一船的人都给压得蹲下了
      JX.audio.music(null); await nap(0.5);
    },
    async 潮过去() { W.chao = 0; W.focus = { x: 1380, y: 600 }; W.zoom = 1.12; W.camSnap = true; if (JX.audio.amb) JX.audio.amb('chao', 0.22); await tw(1.8, k => { W.chaoWhite = 1 - k; W.shakeAmp = 6 * (1 - k); }); W.chaoWhite = 0; await nap(0.4); },
  });
})();
