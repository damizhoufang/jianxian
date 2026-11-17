/* 剧本解释器与序章的演出。
   指令：@场景 场景 落脚点 ｜ @黑 ｜ @亮 秒 ｜ @暗 秒 ｜ @字幕 正文 | 落款 ｜ @题词 题 | 句/句 | 出处
        @指引 文字 | 场景:目标 …（目标写 ent=人物、exit=出口、hot=物件、x=,y=）｜ @等 人物或 exit:出口 ｜ @等到 x y 半径
        @教学 标题 | 正文 ｜ @停 秒 ｜ @做 演出名 参数（演出写在本文件的 HOOKS 里） */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, Fig = JX.Fig, W = JX.world, UI = JX.ui;
  const ST = JX.story = { beats: [], i: 0 };
  JX.state = { label: null, stage: 0, money: 0, maxed: false, flags: {} };
  const NAMES = {}; Object.keys(Fig.cast).forEach(id => { NAMES[Fig.cast[id].name] = id; });
  NAMES['孩子'] = 'child';

  ST.parse = function (text) {
    const beats = [];
    text.split('\n').forEach(raw => {
      const s = raw.trim(); if (!s || s[0] === '#') return;
      let m;
      if ((m = s.match(/^==\s*(.+?)\s*==$/))) beats.push({ t: 'label', name: m[1] });
      else if (s[0] === '@') { const sp = s.indexOf(' '); beats.push({ t: 'cmd', cmd: sp < 0 ? s.slice(1) : s.slice(1, sp), arg: sp < 0 ? '' : s.slice(sp + 1).trim() }); }
      else if ((m = s.match(/^\*(.+)\*$/))) beats.push({ t: 'narr', text: m[1] });
      else if ((m = s.match(/^([^：]{1,8})：(.+)$/))) beats.push({ t: 'say', who: m[1], text: m[2] });
      else beats.push({ t: 'narr', text: s });
    });
    return beats;
  };
  ST.save = function () {
    const st = JX.state, d = new Date();
    JX.store.set('save', { label: st.label, money: st.money, maxed: st.maxed, flags: st.flags, when: (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') });
  };
  function until(cond) { return new Promise(res => { const hs = JX._upd = JX._upd || []; const tick = () => { if (cond()) { hs.splice(hs.indexOf(tick), 1); res(); } }; hs.push(tick); }); }
  function parseTargets(s) {
    const at = {};
    s.split(/\s+/).forEach(tok => { const k = tok.indexOf(':'); if (k < 0) return; const sc = tok.slice(0, k), rest = tok.slice(k + 1), o = {}; rest.split(',').forEach(kv => { const [a, b] = kv.split('='); o[a] = isNaN(+b) ? b : +b; }); at[sc] = o; });
    return at;
  }
  function talker(who) { const id = NAMES[who]; if (!id) return null; if (W.player && (W.player.sp === Fig.cast[id])) return W.player; return W.byId[id] || null; }

  async function exec(b) {
    if (b.t === 'label') { JX.state.label = b.name; ST.save(); return; }
    if (b.t === 'say') { const e = talker(b.who); W.talker = e; await UI.say(NAMES[b.who], b.who, b.text); W.talker = null; return; }
    if (b.t === 'narr') { await UI.narrate(b.text); return; }
    const a = b.arg, parts = a.split('|').map(s => s.trim());
    switch (b.cmd) {
      case '场景': { const [id, spawn] = a.split(/\s+/); W.locked = true; if (spawn === 'keep' && W.id === id) break; await UI.fade(1, parseFloat(document.getElementById('fade').style.opacity || 1) < 1 ? 0.3 : 0); W.load(id, spawn === 'keep' ? undefined : spawn); break; }
      case '黑': await UI.fade(1, 0); break;
      case '亮': await UI.fade(0, JX.auto ? 0.05 : (parseFloat(a) || 0.8)); break;
      case '暗': await UI.fade(1, JX.auto ? 0.05 : (parseFloat(a) || 0.8)); break;
      case '字幕': await UI.caption(parts[0], parts[1]); break;
      case '题词': await UI.card(parts[0], parts[1].split('/'), parts[2]); break;
      case '教学': await UI.tutorial(parts[0], parts[1]); break;
      case '停': await JX.sleep(JX.auto ? 0.02 : parseFloat(a)); break;
      case '指引': W.objective = { text: parts[0], at: parseTargets(parts[1] || '') }; UI.objective(parts[0]); W.guideAt = 0; break;
      case '等': {
        W.locked = false; UI.roam(true);
        await W.waitFor(a);
        W.locked = true; UI.roam(false); if (W.player) { W.player.path = null; W.player.moving = false; }
        W.objective = null; UI.objective(null); break;
      }
      case '等到': {
        const [x, y, r] = a.split(/\s+/).map(Number);
        W.locked = false; UI.roam(true);
        await until(() => W.player && JX.dist(W.player.x, W.player.y, x, y) < r);
        W.locked = true; UI.roam(false); W.player.path = null; W.player.moving = false; W.objective = null; UI.objective(null); break;
      }
      case '做': { const sp = a.indexOf(' '), name = sp < 0 ? a : a.slice(0, sp), arg = sp < 0 ? '' : a.slice(sp + 1); const f = HOOKS[name]; if (!f) throw new Error('没有这段演出：' + name); await f(arg); break; }
      default: throw new Error('不认识的指令：@' + b.cmd);
    }
  }
  ST.run = async function (script, label) {
    ST.beats = ST.parse(script); ST.i = 0;
    if (label) { const k = ST.beats.findIndex(b => b.t === 'label' && b.name === label); if (k >= 0) ST.i = k; }
    JX.game.playing = true;
    while (ST.i < ST.beats.length) {
      const b = ST.beats[ST.i++];
      try { await exec(b); } catch (err) { console.error('[剑仙] 剧本第 ' + ST.i + ' 拍出错', b, err); JX.lastError = String(err && err.stack || err); UI.toast('这一拍演出出了错，已跳过'); }
    }
  };

  /* ---------- 各场景此刻该有谁在 ---------- */
  JX.populate = function (id) {
    const st = JX.state, sg = st.stage, f = st.flags;
    const off = W.exitsOff = {};
    off['hall:stairs'] = '二楼的词会正热闹，\n这会儿上去要挨掌柜的骂。';
    if (id === 'cellar') {
      if (sg === 1 && !f.aguiUp) W.add('agui', 'agui', 1010, 722, { dir: 1, carry: 'jar', tag: '阿桂' });
      if (sg === 1 && !f.jar) W.add('jar2', { h: 96 }, 834, 668, { verb: '抱起', tag: '二楼的酒', draw(g) { P.jar(g, 0, 0, 0.96, { seed: 9, text: '春' }); g.fillStyle = '#f0dca8'; g.fillRect(-9, -72, 18, 12); g.fillStyle = '#8e2a20'; g.font = '600 10px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('二楼', 0, -66); } });
    }
    if (id === 'kitchen') {
      W.add('laochu', 'laochu', 770, 474, { dir: 0, tag: '老褚', bark: ['别挡着灶口。', '蟹酿橙还差一笼。', '手脚麻利点，今晚要跑到三更。'] });
      W.add('cook2', { h: 150, kind: 'short', robe: '#7d6f5c', trim: '#4a3f33', pants: '#4f4840', apron: '#d8d0bc', hair: 'cook' }, 1140, 470, { dir: 2, bark: ['……（忙着颠勺，没空理你）'] });
      if (sg === 1 && !f.jarDone) off['kitchen:hall'] = '先把酒交给老褚。';
      else if (sg === 1 && !f.s1done) off['kitchen:hall'] = '掌柜的话还没说完。';
    }
    if (id === 'hall') {
      W.add('baoqi', 'baoqi', 640, 404, { dir: 0, tag: '鲍七', solid: false, bark: ['皇都春、琼花露、蓬莱春，\n今晚都得往外搬。', '认酒容易，认喝酒的人难。'] });
      W.add('siniang', 'siniang', 880, 500, { dir: 0, tag: '阮四娘', bark: ['不许赊账，不许吵架，\n不许出人命。', '还站着？前头客人等着呢。'] });
      W.add('fan', 'fan', 1470, 366, { dir: 0, pose: 'slump', solid: false, tag: '范醉翁', reach: 190, bark: ['（鼾声）'] });
      W.add('shikeA', Fig.cast.shikeA, 912, 854, { vis: false, solid: false, pose: 'sit' });
      W.add('shikeB', Fig.cast.shikeB, 1712, 854, { vis: false, solid: false, pose: 'sit' });
      W.add('hc2', 'hangcai', 2050, 840, { dir: 1, carry: 'tray', bark: ['借过借过——'] });
      if (sg < 3) off['hall:door'] = '还在当值，出不去。';
    }
    if (id === 'street') {
      if (sg === 3 && !f.daoGone) W.add('laodao', 'laodao', 1250, 690, { dir: 3, tag: '卖历日的老道' });
      if (sg >= 3) W.add('qier', 'qier', 330, 652, { dir: 3, pose: 'squat', tag: '小乞儿', solid: false });
      const r = JX.rng(42);                                       // 看灯的行人，来来往往
      for (let i = 0; i < 9; i++) { const y = i < 6 ? 1090 + r() * 130 : 880 + r() * 120, dirR = r() < 0.5, e = W.add('w' + i, Fig.extra(900 + i * 7), 100 + r() * 2680, y, { solid: false, dir: dirR ? 3 : 1, moving: true, stroll: (dirR ? 1 : -1) * (60 + r() * 60) }); e.ph = r() * 6; }
    }
  };
  JX.on('update', dt => { if (W.id === 'street') W.ents.forEach(e => { if (!e.stroll) return; e.x += e.stroll * dt; e.moving = true; if (e.x > 2960) e.x = -80; if (e.x < -80) e.x = 2960; }); });

  /* ---------- 开坛特写 ---------- */
  ST._drawPry = (c, k) => drawPry(c, k);
  function drawPry(c, k) {                                         // k：0 刀刚插进封泥，1 整块封泥落下
    const w = 1300, h = 640;
    const bg = c.createRadialGradient(520, 260, 40, 650, 320, 800); bg.addColorStop(0, '#5a4636'); bg.addColorStop(0.5, '#2e2420'); bg.addColorStop(1, '#0e0b0a'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { c.save(); c.globalAlpha = 0.5 - i * 0.07; c.translate(120 + i * 250, 250 + (i % 2) * 30); P.jar(c, 0, 400, 2.4, { seed: 20 + i, text: '酒' }); c.restore(); }
    c.fillStyle = 'rgba(8,6,5,0.55)'; c.fillRect(0, 0, w, h);
    const gl = c.createRadialGradient(650, 200, 20, 650, 300, 520); gl.addColorStop(0, 'rgba(255,205,130,0.4)'); gl.addColorStop(1, 'rgba(255,205,130,0)'); c.fillStyle = gl; c.fillRect(0, 0, w, h);
    c.save(); c.translate(650, 1010); P.jar(c, 0, 0, 7.2, { seed: 3, sealed: false, label: false }); c.restore();
    /* 封泥：整块 */
    const lift = k * 150, tilt = k * 0.5, dx = k * 250;
    c.save(); c.translate(650 + dx, 410 + lift * 0.2 - Math.sin(k * Math.PI) * 120); c.rotate(tilt);
    c.beginPath(); c.moveTo(-138, 0); c.bezierCurveTo(-146, -124, 146, -124, 138, 0); c.quadraticCurveTo(0, 34, -138, 0); c.closePath();
    c.fillStyle = P.hgrad(c, -140, 0, 280, [[0, '#8b7453'], [0.35, '#d2b88c'], [1, '#735e42']]); c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 4; c.stroke();
    c.strokeStyle = '#6a4f30'; c.lineWidth = 12; c.beginPath(); c.ellipse(0, -4, 130, 24, 0, 0.1, Math.PI - 0.1); c.stroke();
    c.fillStyle = '#b5382a'; c.fillRect(-26, -100, 52, 92); P.vtext(c, '春', 0, -92, 46, '#1e1410', '600');
    c.restore();
    /* 酒刀：刀身七寸，断口是齐的 */
    const ang = -0.42 - k * 0.5;
    c.save(); c.translate(508 - k * 30, 404 - k * 40); c.rotate(ang); c.scale(0.64, 0.64);
    c.fillStyle = P.vgrad(c, 0, -24, 48, [[0, '#e9eef0'], [0.45, '#aab3b6'], [0.55, '#7c868a'], [1, '#c5cdd0']]); c.beginPath(); c.moveTo(-330, -22); c.lineTo(20, -24); c.lineTo(20, 24); c.lineTo(-330, 20); c.closePath(); c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-326, -12); c.lineTo(14, -14); c.stroke();
    c.strokeStyle = 'rgba(40,46,50,0.5)'; c.lineWidth = 1.5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(20, -22 + i * 11); c.lineTo(14 - (i % 2) * 6, -18 + i * 11); c.stroke(); }
    c.fillStyle = '#3a2a1e'; c.fillRect(-352, -34, 24, 68); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.strokeRect(-352, -34, 24, 68);
    c.fillStyle = '#4b3525'; c.fillRect(-640, -27, 288, 54); c.strokeRect(-640, -27, 288, 54);
    for (let i = 0; i < 13; i++) { c.strokeStyle = '#c8b48a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-630 + i * 22, -27); c.lineTo(-616 + i * 22, 27); c.stroke(); }
    /* 握刀的手与袖口 */
    c.fillStyle = '#4f6679'; c.beginPath(); c.moveTo(-720, -120); c.lineTo(-470, -70); c.lineTo(-460, 90); c.lineTo(-760, 130); c.closePath(); c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.stroke();
    c.fillStyle = '#ebe3cf'; c.beginPath(); c.moveTo(-480, -72); c.lineTo(-462, -68); c.lineTo(-452, 88); c.lineTo(-470, 92); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ecd0ae'; c.beginPath(); c.moveTo(-462, -52); c.quadraticCurveTo(-400, -64, -384, -30); c.lineTo(-384, 34); c.quadraticCurveTo(-404, 66, -462, 62); c.closePath(); c.fill(); c.stroke();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(-452 + i * 22, -40, 20, 72, 9); c.fillStyle = i % 2 ? '#e6c8a4' : '#ecd0ae'; c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.8); c.lineWidth = 2.4; c.stroke(); }
    c.restore();
    c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.5; c.fillStyle = c.createPattern(P.grainTile(), 'repeat'); c.fillRect(0, 0, w, h); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    const vg = c.createRadialGradient(650, 320, 300, 650, 320, 780); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
  }

  /* ---------- 行菜 ---------- */
  const ROUNDS = {
    1: { orders: { 7: 'a', 9: 'b' }, trays: [['a', '皇都春一角', '洗手蟹', '宋嫂鱼羹（免芫荽）'], ['c', '蓬莱春一角', '洗手蟹', '宋嫂鱼羹（加芫荽）'], ['b', '琼花露一角', '鹌子水晶脍', '酒炊淮白鱼']] },
    2: { orders: { 3: 'd', 5: 'e', 11: 'f' }, calls: [[3, '蟹酿橙，两碗圆子，\n酒要蓬莱春！'], [5, '洗手蟹，一碟决明兜子，\n酒也要蓬莱春！'], [11, '鱼兜子，宋嫂鱼羹，\n酒要皇都春！']],
      trays: [['e', '蓬莱春一角', '洗手蟹', '决明兜子'], ['g', '蓬莱春一角', '洗手蟹', '圆子两碗'], ['f', '皇都春一角', '鱼兜子', '宋嫂鱼羹'], ['d', '蓬莱春一角', '蟹酿橙', '圆子两碗']] },
  };
  function tableAnchor(n) { const t = JX.hallTables[n - 1]; return W.byId['ta' + n] || W.add('ta' + n, { h: 150 }, t.x, t.y - 116, { vis: false, solid: false, pose: 'sit' }); }
  function serveRound(no) {
    const R = ROUNDS[no], st = JX.state, served = {}; let carry = null, mist = 0, panel = null;
    return new Promise(done => {
      const setObj = () => {
        if (carry) { W.objective = { text: '把这一盘送到点它的那一桌', at: {} }; UI.objective('把这一盘送到点它的那一桌（按回车上菜）'); }
        else { W.objective = { text: '到出菜口端菜', at: { hall: { hot: 'pass' } } }; UI.objective('到出菜口端菜'); }
        W.guideAt = 0;
      };
      const pass = W.hots.find(h => h.id === 'pass');
      const closePanel = () => { if (panel) { panel.remove(); panel = null; UI.modal--; } };
      pass.act = () => {
        if (carry) { W.bubble(W.player, '手上这盘还没送出去。', 1.8); return; }
        UI.modal++; panel = UI.root().appendChild(JX.el('div', 'panel')); panel.id = 'mini';
        panel.innerHTML = '<h2>出菜口</h2><p>端哪一盘？（数字键或鼠标选，Esc 先不端）</p><div class="trays">' + R.trays.map((t, i) => '<div class="tray jx-clickable' + (Object.values(served).includes(t[0]) ? ' gone' : '') + '" data-i="' + i + '"><b>' + '第' + '一二三四'[i] + '盘</b>' + t.slice(1).map(JX.esc).join('<br>') + '</div>').join('') + '</div>';
        const pick = i => { const t = R.trays[i]; if (Object.values(served).includes(t[0])) return; closePanel(); off(); carry = t[0]; W.player.carry = 'tray'; JX.audio.sfx('tick'); setObj(); };
        panel.onclick = e => { const d = e.target.closest('[data-i]'); if (d) pick(+d.dataset.i); };
        const tick = () => {
          if (JX.auto) { const want = Object.keys(R.orders).find(n => !served[n]); return pick(R.trays.findIndex(t => t[0] === R.orders[want])); }
          for (let i = 0; i < R.trays.length; i++) if (JX.input.hit('Digit' + (i + 1)) || JX.input.hit('Numpad' + (i + 1))) return pick(i);
          if (JX.input.hit('cancel')) { JX.input.eat('cancel'); JX.input.eat('menu'); closePanel(); off(); }
        };
        const hs = JX._upd = JX._upd || []; hs.push(tick); const off = () => { const k = hs.indexOf(tick); if (k >= 0) hs.splice(k, 1); };
      };
      const hots = JX.hallTables.map(t => {
        const h = { id: 'tb' + t.n, x: t.x, y: t.y - 30, r: 150, up: 170, verb: '上菜', n: t.n };
        h.act = () => {
          const a = tableAnchor(t.n);
          if (!carry) { if (mist >= 2 && R.orders[t.n] && !served[t.n]) { const tr = R.trays.find(x => x[0] === R.orders[t.n]); W.bubble(a, '我点的是：\n' + tr.slice(1).join('、').replace(/、([^、]*)$/, '，\n$1'), 3.5); } else W.bubble(W.player, '手上没有菜。', 1.4); return; }
          if (!R.orders[t.n] || served[t.n]) { W.bubble(a, served[t.n] ? '菜齐了，不用再上。' : '我们这桌没叫菜。', 2); return; }
          W.player.carry = null;
          if (R.orders[t.n] === carry) { served[t.n] = carry; st.money += 12; W.bubble(a, '对了对了！赏你的。', 2.2); JX.audio.sfx('coin'); UI.purse(st.money); }
          else { mist++; st.money = Math.max(0, st.money - 5); W.bubble(a, '错了！这不是我点的。', 2.2); JX.audio.sfx('wrong'); UI.purse(st.money); if (mist === 2) UI.toast('记不清了？空着手走到桌边按回车，客人会再说一遍。', 4); }
          carry = null; setObj();
          if (Object.keys(served).length === Object.keys(R.orders).length) finish();
        };
        W.hots.push(h); return h;
      });
      function finish() { hots.forEach(h => W.hots.splice(W.hots.indexOf(h), 1)); pass.act = null; W.objective = null; UI.objective(null); W.autoPilot = null; W.locked = true; UI.roam(false); W.player.path = null; W.player.moving = false; setTimeout(() => done(mist), 0); }
      setObj(); W.locked = false; UI.roam(true); UI.purse(st.money);
      if (JX.auto) W.autoPilot = () => {                           // 自动测试：自己去端、自己去送
        const p = W.player; if (p.path || UI.modal || W.locked) return;
        if (!carry) { if (JX.dist(p.x, p.y, pass.x, pass.y + 40) < 30) pass.act(); else p.path = W.findPath(p.x, p.y, pass.x, pass.y + 40); }
        else { const n = +Object.keys(R.orders).find(n => R.orders[n] === carry), h = hots.find(h => h.n === n), gx = h.x - 140, gy = h.y; if (JX.dist(p.x, p.y, gx, gy) < 60) h.act(); else p.path = W.findPath(p.x, p.y, gx, gy); }
      };
    });
  }
  JX.on('update', () => { if (W.autoPilot) W.autoPilot(); });
  /* 自动测试用：没人操作时，照着指引自己走、自己互动 */
  JX.on('update', () => {
    if (!JX.auto || W.autoPilot || W.locked || UI.modal || !W.player || JX.ended) return;
    const p = W.player, t = W.objTarget(); if (!t || p.path) return;
    if (t.ent) { if (JX.dist(p.x, p.y, t.ent.x, t.ent.y) < (t.ent.reach || 82) + 40) W.fire(t.ent.id); else p.path = W.findPath(p.x, p.y, t.x, t.y + 44); }
    else p.path = W.findPath(p.x, p.y, t.x, t.y);
  });

  /* ---------- 演出 ---------- */
  const HOOKS = ST.hooks = {
    async 入场一() { const st = JX.state; st.stage = 1; st.flags = {}; st.money = 0; W.setPlayer('jingzhe'); UI.purse(null); UI.tone(null); },
    async 开坛特写() {
      const box = UI.root().appendChild(JX.el('div', '', '<canvas width="1300" height="640"></canvas>')); box.id = 'cut';
      const c = box.firstChild.getContext('2d'); drawPry(c, 0); void box.offsetWidth; box.style.opacity = 1;
      await JX.sleep(JX.auto ? 0.05 : 1);
      await UI.narrate('酒窖。一排排泥封的酒坛。');
      await UI.narrate('一只手从腰后抽出一把短刀——刀身只有七寸，断口是齐的——往泥封边上一撬，一拧。');
      JX.audio.sfx('pop'); await JX.tween(JX.auto ? 0.05 : 0.7, k => drawPry(c, k), JX.ease.out);
      await UI.narrate('封泥整块落下，一点渣都没掉进酒里。');
      box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.7); box.remove();
    },
    async 阿桂上楼() { JX.state.flags.aguiUp = true; await W.walk('agui', 1580, 340, { speed: 230 }); W.remove('agui'); JX.audio.sfx('door'); },
    async 抱坛() { JX.state.flags.jar = true; W.remove('jar2'); W.player.carry = 'jar'; JX.audio.sfx('tick'); UI.toast('抱起了酒坛'); },
    async 放坛() { JX.state.flags.jarDone = true; W.player.carry = null; W.exitsOff['kitchen:hall'] = '掌柜的话还没说完。'; W.face('laochu', W.player); JX.audio.sfx('tick'); },
    async 四娘进来() { JX.audio.sfx('door'); const e = W.add('siniang', 'siniang', 1800, 680, { dir: 1, tag: '阮四娘' }); await W.walk(e, 1420, 700, { speed: 240, dir: 1 }); W.face(W.player, e); W.face('laochu', e); },
    async 四娘回堂() { JX.state.flags.s1done = true; delete W.exitsOff['kitchen:hall']; W.walk('siniang', 1800, 680, { speed: 240 }).then(() => W.remove('siniang')); },
    async 入场二() { const st = JX.state; st.stage = 2; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; UI.tone(null); },
    async 叫菜() { W.bubble('shikeA', '小二哥！', 1.6); JX.audio.sfx('tick'); await JX.sleep(JX.auto ? 0.02 : 0.8); },
    async 行菜(no) {
      no = +no;
      if (no === 2) { W.locked = true; for (const [n, text] of ROUNDS[2].calls) { const a = tableAnchor(n); W.focus = { x: a.x, y: a.y + 80 }; await JX.sleep(JX.auto ? 0.02 : 0.7); W.bubble(a, text, JX.auto ? 0.1 : 3.4); JX.audio.sfx('tick'); await JX.sleep(JX.auto ? 0.02 : 3.6); } W.focus = null; await JX.sleep(JX.auto ? 0.02 : 0.5); }
      const mist = await serveRound(no);
      await UI.narrate(mist === 0 ? (no === 1 ? '两桌都送对了。' : '三桌一盘没错。满堂二十个菜报一遍就记住——这是阿蛰吃饭的本事。') : '菜是送到了，中间错了 ' + mist + ' 回。');
    },
    async 范抬头() { const f = W.byId.fan; if (f) { f.pose = 'sit'; f.seat = 34; } },
    async 范趴下() { const f = W.byId.fan; if (f) f.pose = 'slump'; },
    async 入场三() { const st = JX.state; st.stage = 3; st.flags.daoGone = false; if (!W.player) W.setPlayer('jingzhe'); delete W.exitsOff['hall:door']; UI.purse(st.money); UI.tone(null); if (W.id === 'hall' && W.byId.siniang) W.face('siniang', W.player); },
    async 布置灯市() { W.face(W.player, 1250, 690); },
    async 老道走() { JX.state.flags.daoGone = true; const e = W.byId.laodao; if (e) { e.solid = false; W.walk(e, 2920, 1120, { speed: 150 }).then(() => W.remove('laodao')); } await JX.sleep(JX.auto ? 0.02 : 1.2); },
    async 看街角() { W.player.dir = 1; const q = W.byId.qier; W.focus = { x: q.x + 300, y: q.y + 60 }; await JX.sleep(JX.auto ? 0.02 : 1.6); },
    async 入忆一() { W.focus = null; UI.tone('sepia'); UI.purse(null); W.setPlayer('child', { carry: 'bundle', speedK: 0.62 }); W.load('snow', 'start'); },
    async 蹲下() { const p = W.player; await W.walk(p, 2170, 700, { speed: 120 }); p.dir = 0; p.pose = 'squat'; },
    async 小癞来() { const e = W.add('xiaolai', 'xiaolai', 2760, 760, { dir: 1, tag: '小癞' }); await W.walk(e, 2262, 706, { speed: 150, dir: 1 }); W.player.dir = 3; },
    async 出忆一() { UI.tone(null); W.setPlayer('jingzhe'); W.load('street', 'fromHall'); UI.purse(JX.state.money); W.player.dir = 1; },
    async 给兜子() { const q = W.byId.qier; await W.walk(W.player, q.x + 70, q.y + 6, { speed: 230, dir: 1 }); q.dir = 3; },
    async 夏离来() {
      const a = W.add('xiali', 'xiali', 2300, 700, { dir: 1, tag: '夏公子' }), b = W.add('huoji', 'huoji', 2390, 716, { dir: 1 });
      W.walk(W.player, 1350, 640, { speed: 230, dir: 3 }); W.walk(b, 1640, 690, { speed: 200, dir: 1 }); W.focus = { x: 1600, y: 700 };
      await W.walk(a, 1530, 664, { speed: 200, dir: 1 }); W.focus = null;
    },
    async 夏离过门槛() { await W.walk('xiali', 1440, 566, { speed: 170, dir: 2 }); W.face(W.player, 1440, 566); },
    async 夏离进门() { const a = W.byId.xiali, b = W.byId.huoji; JX.audio.sfx('door'); await JX.tween(JX.auto ? 0.05 : 0.6, k => { a.alpha = 1 - k; }); W.remove('xiali'); await W.walk(b, 1440, 566, { speed: 200 }); W.remove('huoji'); },
    async 试玩结束() {
      JX.state.label = '第三场　灯市'; ST.save();
      UI.modal++;
      const box = UI.root().appendChild(JX.el('div', 'panel')); box.id = 'end';
      box.innerHTML = '<h2>试玩到此</h2><p>序章《青玉案》第一至第三场。</p><p>第四场《词会》起——阑珊唱词、十二碗面、一壶毒酒、屋顶上的蟹壳青，连同战斗——下一版接上。</p><div class="btn jx-clickable" data-a="stay">留在灯市走走</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      const a = await new Promise(res => { box.onclick = e => { const b = e.target.closest('[data-a]'); if (b) res(b.dataset.a); }; if (JX.auto) res('stay'); const hs = JX._upd = JX._upd || []; const tick = () => { if (JX.input.hit('confirm')) { hs.splice(hs.indexOf(tick), 1); res('stay'); } }; hs.push(tick); });
      box.remove(); UI.modal--;
      if (a === 'title') { location.reload(); return; }
      W.locked = false; UI.roam(true); JX.ended = true;
    },
  };
})();
