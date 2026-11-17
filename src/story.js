/* 剧本解释器与序章的演出。
   指令：@场景 场景 落脚点 ｜ @黑 ｜ @亮 秒 ｜ @暗 秒 ｜ @字幕 正文 | 落款 ｜ @题词 题 | 句/句 | 出处
        @指引 文字 | 场景:目标 …（目标写 ent=人物、exit=出口、hot=物件、x=,y=）｜ @等 人物或 exit:出口 ｜ @等到 x y 半径
        @教学 标题 | 正文 ｜ @停 秒 ｜ @乐 曲名（临时换曲，@乐 还 换回场景本来的）｜ @做 演出名 参数（演出写在本文件的 HOOKS 里）
   对白可以带表情：陆惊蛰[笑]：……  可用 笑 嬉 撇 冷 怒 惊 闭 黯 平（只对画了头像的主角起作用） */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, Fig = JX.Fig, W = JX.world, UI = JX.ui;
  const ST = JX.story = { beats: [], i: 0 };
  JX.state = { label: null, stage: 0, money: 0, maxed: false, flags: {} };
  const NAMES = {}; Object.keys(Fig.cast).forEach(id => { NAMES[Fig.cast[id].name] = id; });
  NAMES['孩子'] = 'child';
  const MOODS = { 笑: 'smile', 嬉: 'grin', 撇: 'smirk', 冷: 'cold', 怒: 'angry', 惊: 'surprise', 闭: 'closed', 黯: 'sad', 平: 'normal', 常: null };

  ST.parse = function (text) {
    const beats = [];
    text.split('\n').forEach(raw => {
      const s = raw.trim(); if (!s || s[0] === '#') return;
      let m;
      if ((m = s.match(/^==\s*(.+?)\s*==$/))) beats.push({ t: 'label', name: m[1] });
      else if (s[0] === '@') { const sp = s.indexOf(' '); beats.push({ t: 'cmd', cmd: sp < 0 ? s.slice(1) : s.slice(1, sp), arg: sp < 0 ? '' : s.slice(sp + 1).trim() }); }
      else if ((m = s.match(/^\*(.+)\*$/))) beats.push({ t: 'narr', text: m[1] });
      else if ((m = s.match(/^([^：\[]{1,8})(?:\[(.+?)\])?：(.+)$/))) beats.push({ t: 'say', who: m[1], mood: MOODS[m[2]] || null, text: m[3] });
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
    if (b.t === 'say') { const e = talker(b.who); W.talker = e; await UI.say(NAMES[b.who], b.who, b.text, b.mood); W.talker = null; return; }
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
      case '乐': if (a === '还') { JX.audio.hold = false; if (W.sc && W.sc.music) JX.audio.music(W.sc.music, W.sc.muffle); } else { JX.audio.hold = true; JX.audio.music(a); } break;   // 临时换一首；“还”是换回这个场景本来的曲子
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
    if (sg < 4) off['hall:stairs'] = '二楼的词会正热闹，\n这会儿上去要挨掌柜的骂。';
    else if (!f.tray2) off['hall:stairs'] = '先到柜台找鲍七，\n把二楼的酒端上。';
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
      W.add('siniang', 'siniang', sg === 6 ? 1290 : 880, sg === 6 ? 1190 : 500, { dir: sg === 6 ? 3 : 0, tag: '阮四娘', bark: ['不许赊账，不许吵架，\n不许出人命。', '还站着？前头客人等着呢。'] });
      if (sg === 6) {
        if (!f.xueGone) W.add('tingxue', 'tingxue', 1600, 1270, { dir: 1, tag: '北边来的小娘子' });
        W.add('huyuan', 'huyuan', f.thrown ? 1778 : 1800, f.thrown ? 1262 : 1200, { dir: 1, pose: f.thrown ? 'squat' : null }); W.add('huyuan2', 'huyuan', f.thrown ? 1792 : 1820, f.thrown ? 1296 : 1340, { dir: 1, pose: f.thrown ? 'squat' : null });
        W.add('bench6', { h: 30 }, 1210, 1330, { solid: false, draw(g) { g.save(); g.rotate(-0.5); P.shadow(g, 0, 10, 80, 12, 0.35); g.fillStyle = '#614430'; g.fillRect(-84, -12, 168, 16); g.strokeStyle = 'rgba(43,34,28,0.85)'; g.lineWidth = 1.4; g.strokeRect(-84, -12, 168, 16); g.fillRect(-70, -40, 9, 28); g.fillRect(60, -40, 9, 28); g.strokeRect(-70, -40, 9, 28); g.strokeRect(60, -40, 9, 28); g.restore(); } });
      }
      if (sg === 7 && f.follow) { const p = W.player; W.add('luoer', 'luoer', p.x - 70, p.y + 20, { dir: p.dir, tag: '真州来客', solid: false }); }
      W.add('fan', 'fan', 1470, 366, { dir: 0, pose: 'slump', solid: false, tag: '范醉翁', reach: 190, bark: ['（鼾声）'] });
      W.add('shikeA', Fig.cast.shikeA, 912, 854, { vis: false, solid: false, pose: 'sit' });
      W.add('shikeB', Fig.cast.shikeB, 1712, 854, { vis: false, solid: false, pose: 'sit' });
      W.add('hc2', 'hangcai', 2050, 840, { dir: 1, carry: 'tray', bark: ['借过借过——'] });
      if (sg < 3) off['hall:door'] = '还在当值，出不去。';
      if (sg >= 4) off['hall:door'] = '楼上的客人还等着，\n这会儿出不去。';
    }
    if (id === 'floor2') {
      W.add('qiushui', 'qiushui', 1200, 742, { dir: 0, pose: f.sang ? null : 'sit', seat: 34, carry: 'pipa', tag: '阑珊', solid: false, bark: ['……（低头调弦，没有看你）'] });
      W.add('he', 'he', 1740, 584, { dir: 0, pose: 'sit', seat: 34, tag: '贺元度', solid: false, reach: 200, bark: ['（他在看那册旧书）'] });
      W.add('cike', { h: 150 }, 820, 894, { vis: false, solid: false });
      W.add('cike2', { h: 150 }, 1580, 894, { vis: false, solid: false }); W.add('cike3', { h: 150 }, 700, 584, { vis: false, solid: false });
      off['floor2:down'] = sg === 4 ? '酒还没送完，下去要挨骂。' : '听潮阁的客人还等着。';
      if (sg === 7 && f.follow) { const p = W.player; W.add('luoer', 'luoer', p.x + 10, p.y + 60, { dir: 2, tag: '真州来客', solid: false }); }
      if (sg === 4 && !f.heDone) off['floor2:up'] = '先把贺先生的酒送到。';
    }
    if (id === 'tingchao') {
      W.add('xiali', 'xiali', sg >= 7 ? 1130 : 960, sg >= 7 ? 640 : 436, { dir: sg >= 7 ? 1 : 2, tag: '夏公子' });
      if (sg === 7 && f.follow) W.add('luoer', 'luoer', 420, 880, { dir: 3, tag: '真州来客', solid: false });
      off['tingchao:down'] = '客人的话还没说完。';
      addCups();
    }
    if (id === 'street') {
      if (sg === 3 && !f.daoGone) W.add('laodao', 'laodao', 1250, 690, { dir: 3, tag: '卖历日的老道' });
      if (sg >= 3) W.add('qier', 'qier', 330, 652, { dir: 3, pose: 'squat', tag: '小乞儿', solid: false });
      const r = JX.rng(42);                                       // 看灯的行人，来来往往
      for (let i = 0; i < 9; i++) { const y = i < 6 ? 1090 + r() * 130 : 880 + r() * 120, dirR = r() < 0.5, e = W.add('w' + i, Fig.extra(900 + i * 7), 100 + r() * 2680, y, { solid: false, dir: dirR ? 3 : 1, moving: true, stroll: (dirR ? 1 : -1) * (60 + r() * 60) }); e.ph = r() * 6; }
    }
  };
  JX.on('update', dt => { if (W.id === 'street') W.ents.forEach(e => { if (!e.stroll) return; e.x += e.stroll * dt; e.moving = true; if (e.x > 2960) e.x = -80; if (e.x < -80) e.x = 2960; }); });

  function addCups() { const f = JX.state.flags; ['cup1', 'cup2'].forEach(k => { if (f[k] && !W.byId[k]) { const o = k === 'cup1' ? [-70, -112] : [40, -76]; W.add(k, { h: 4 }, 960, k === 'cup1' ? 721 : 722, { solid: false, draw(g) { g.save(); g.translate(o[0], o[1]); P.ellipse(g, 0, 0, 9, 4, '#d8ece0', 'rgba(43,34,28,0.7)', 1); P.ellipse(g, 0, -1, 6, 2.4, '#c9862e'); P.line(g, 14, -4, 34, 2, 1.6, '#7a4a28'); P.line(g, 14, -1, 34, 5, 1.6, '#7a4a28'); g.restore(); } }); } }); }
  /* ---------- 朱印特写：案上那册旧书 ---------- */
  function drawSeal(c, k) {                                        // k：0 远看，1 凑近到看得清印
    const w = 1300, h = 640;
    const bg = c.createRadialGradient(650, 320, 60, 650, 320, 800); bg.addColorStop(0, '#5a4030'); bg.addColorStop(0.6, '#2a1c16'); bg.addColorStop(1, '#0e0a08'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.save(); c.translate(650, 330); const z = 1 + k * 0.9; c.scale(z, z); c.translate(-140 * k, -70 * k); c.rotate(-0.06);
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-296, -176, 600, 372);
    c.fillStyle = P.hgrad(c, -300, 0, 600, [[0, '#d8caa6'], [0.48, '#efe4c6'], [0.5, '#b8aa88'], [0.52, '#efe4c6'], [1, '#dccfac']]); c.fillRect(-300, -180, 600, 360);
    c.strokeStyle = 'rgba(43,34,28,0.8)'; c.lineWidth = 2; c.strokeRect(-300, -180, 600, 360);
    c.strokeStyle = 'rgba(120,60,40,0.35)'; c.lineWidth = 1; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-272 + i * 30, -160); c.lineTo(-272 + i * 30, 160); c.stroke(); c.beginPath(); c.moveTo(28 + i * 30, -160); c.lineTo(28 + i * 30, 160); c.stroke(); }
    const r = JX.rng(77); c.fillStyle = 'rgba(30,22,16,0.8)';
    c.strokeStyle = 'rgba(30,22,16,0.78)'; c.lineCap = 'round';                                   // 一行行的字：只画出字的样子，看不清写的什么
    for (let col = 0; col < 16; col++) { const x = (col < 8 ? -257 : 43) + (col % 8) * 30, n = 9 + Math.floor(r() * 5); for (let j = 0; j < n; j++) { const y = -148 + j * 22, m = 3 + Math.floor(r() * 4); for (let q = 0; q < m; q++) { const k = r(), sx = x - 7 + r() * 12, sy = y - 7 + r() * 12, len = 5 + r() * 8; c.lineWidth = 1.4 + r() * 1.2; c.beginPath(); c.moveTo(sx, sy); if (k < 0.4) c.lineTo(Math.min(x + 8, sx + len), sy + (r() - 0.5) * 2); else if (k < 0.75) c.lineTo(sx + (r() - 0.5) * 2, Math.min(y + 9, sy + len)); else c.lineTo(sx + (r() < 0.5 ? -1 : 1) * len * 0.6, sy + len * 0.7); c.stroke(); } } }
    /* 朱印：方的，四个字的位置，字是篆的，看不真——只看得出是一方藏书印 */
    c.save(); c.translate(236, 112); c.rotate(0.03); c.globalAlpha = 0.86; c.fillStyle = '#b5302a'; c.fillRect(-34, -34, 68, 68); c.globalAlpha = 1;
    c.strokeStyle = '#efe4c6'; c.lineWidth = 3; c.strokeRect(-27, -27, 54, 54);
    c.lineWidth = 2.6; [[-14, -14], [14, -14], [-14, 14], [14, 14]].forEach(([x, y], i) => { c.beginPath(); c.moveTo(x - 8, y - 8); c.lineTo(x + 8, y - 8); c.moveTo(x - 8, y); c.lineTo(x + 8, y); c.moveTo(x - 8, y + 8); c.lineTo(x + 8, y + 8); c.moveTo(x + (i % 2 ? -8 : 8), y - 8); c.lineTo(x + (i % 2 ? -8 : 8), y + 8); c.moveTo(x, y - 8 + (i > 1 ? 8 : 0)); c.lineTo(x, y + (i > 1 ? 8 : 0)); c.stroke(); });
    c.restore();
    c.restore();
    const v = c.createRadialGradient(650, 320, 240, 650, 320, 760); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
  }
  ST._drawSeal = (c, k) => drawSeal(c, k);
  /* 跟在阿蛰后头走的人（第七场的罗二） */
  let followT = 0;
  JX.on('update', dt => {
    const f = JX.state.flags; if (!f || !f.follow || W.locked) return; const e = W.byId.luoer, p = W.player; if (!e || !p) return;
    const d = JX.dist(e.x, e.y, p.x, p.y); followT -= dt;
    if (d < 96) { e.path = null; e.moving = false; }
    else if (followT <= 0) { followT = 0.35; e.path = W.findPath(e.x, e.y, p.x, p.y); e.pathSpeed = d > 300 ? 300 : 200; e.onArrive = null; }
  });
  /* 特写：一块画板加几句旁白 */
  async function cutIn(draw, lines, sec) {
    const box = UI.root().appendChild(JX.el('div', '', '<canvas width="1300" height="640"></canvas>')); box.id = 'cut';
    const c = box.firstChild.getContext('2d'); draw(c, 0); void box.offsetWidth; box.style.opacity = 1;
    await JX.sleep(JX.auto ? 0.05 : 0.8);
    JX.tween(JX.auto ? 0.05 : (sec || 2.4), k => draw(c, k), JX.ease.out);
    for (const t of lines) await UI.narrate(t);
    box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.7); box.remove();
  }
  function cutBg(c, a, b2) { const bg = c.createRadialGradient(650, 320, 60, 650, 320, 800); bg.addColorStop(0, a); bg.addColorStop(0.6, b2); bg.addColorStop(1, '#0c0908'); c.fillStyle = bg; c.fillRect(0, 0, 1300, 640); }
  function cutVig(c) { const v = c.createRadialGradient(650, 320, 240, 650, 320, 760); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.72)'); c.fillStyle = v; c.fillRect(0, 0, 1300, 640); }
  /* 手心里的雁翎，翎管上缠着半枚铜符 */
  function drawFeather(c, k) {
    cutBg(c, '#4a3a30', '#221814');
    c.save(); c.translate(650, 330); const z = 1 + k * 0.35; c.scale(z, z); c.translate(-60 * k, 10 * k);
    /* 手：四指在上，掌心朝外，拇指在左 */
    const skin = P.hgrad(c, -330, 0, 660, [[0, '#c99a74'], [0.5, '#efcfa8'], [1, '#c09068']]), ink = 'rgba(43,31,25,0.85)';
    c.lineCap = 'round'; c.lineJoin = 'round';
    [[-176, -40, -214, -300, 88], [-58, -60, -66, -340, 92], [62, -60, 80, -330, 90], [176, -36, 222, -270, 82]].forEach(([x0, y0, x1, y1, w]) => {
      c.strokeStyle = ink; c.lineWidth = w + 6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = '#e8c8a0'; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; c.strokeStyle = 'rgba(140,80,56,0.35)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(mx - w * 0.3, my + 4); c.quadraticCurveTo(mx, my + 12, mx + w * 0.3, my + 2); c.stroke();
    });
    c.strokeStyle = ink; c.lineWidth = 104; c.beginPath(); c.moveTo(-250, 120); c.quadraticCurveTo(-360, 20, -390, -110); c.stroke(); c.strokeStyle = '#deb88e'; c.lineWidth = 98; c.beginPath(); c.moveTo(-250, 120); c.quadraticCurveTo(-360, 20, -390, -110); c.stroke();
    c.fillStyle = skin; c.strokeStyle = ink; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-300, 340); c.bezierCurveTo(-320, 180, -290, 20, -226, -40); c.bezierCurveTo(-200, -72, -150, -30, -118, -62); c.bezierCurveTo(-80, -94, -30, -44, 2, -70); c.bezierCurveTo(40, -96, 96, -40, 124, -62); c.bezierCurveTo(170, -84, 250, -30, 262, 60); c.bezierCurveTo(286, 160, 290, 260, 280, 340); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(140,80,56,0.4)'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-230, 40); c.quadraticCurveTo(-40, -30, 220, 30); c.moveTo(-250, 130); c.quadraticCurveTo(-60, 50, 170, 160); c.moveTo(-110, -30); c.quadraticCurveTo(-70, 120, -170, 300); c.stroke();
    /* 雁翎 */
    c.save(); c.rotate(-0.42); c.translate(20, 40);
    const vane = (s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(-250, 0); c.bezierCurveTo(-140, s * 62, 120, s * 70, 300, s * 6); c.lineTo(300, 0); c.closePath(); c.fill(); };
    vane(-1, '#d9d4c8'); vane(1, '#b9b2a2');
    c.strokeStyle = 'rgba(70,62,52,0.45)'; c.lineWidth = 1.3; for (let i = 0; i < 44; i++) { const x = -236 + i * 12, w = Math.sin((i + 2) / 48 * Math.PI) * 58; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 26, -w); c.moveTo(x, 0); c.lineTo(x + 26, w * 1.06); c.stroke(); }
    c.fillStyle = 'rgba(60,52,44,0.5)'; c.beginPath(); c.moveTo(200, 0); c.bezierCurveTo(240, -30, 280, -20, 300, -4); c.lineTo(300, 4); c.bezierCurveTo(280, 22, 240, 30, 200, 0); c.fill();
    c.strokeStyle = '#f4eedc'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-420, 4); c.lineTo(300, 0); c.stroke(); c.strokeStyle = 'rgba(90,80,64,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-420, 7); c.lineTo(300, 3); c.stroke();
    /* 半枚铜符：缠在翎管上 */
    c.save(); c.translate(-330, 4); c.rotate(0.2);
    c.fillStyle = P.hgrad(c, -60, 0, 120, [[0, '#5a6a4a'], [0.4, '#9aa67a'], [1, '#4a563c']]); c.strokeStyle = 'rgba(30,26,20,0.9)'; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(-56, -40); c.lineTo(40, -40); c.lineTo(52, -26); c.lineTo(38, -12); c.lineTo(54, 2); c.lineTo(38, 16); c.lineTo(52, 30); c.lineTo(40, 42); c.lineTo(-56, 42); c.quadraticCurveTo(-70, 0, -56, -40); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(30,40,24,0.75)'; c.lineWidth = 3; [[-36, -24, -36, 26], [-14, -24, -14, 26], [8, -24, 8, 10], [-46, -4, 20, -4], [-46, 16, 4, 16]].forEach(q => { c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[2], q[3]); c.stroke(); });
    c.fillStyle = 'rgba(120,170,140,0.35)'; c.beginPath(); c.arc(-30, 28, 14, 0, 6.3); c.fill(); c.beginPath(); c.arc(16, -30, 10, 0, 6.3); c.fill();
    c.strokeStyle = '#7a3a2a'; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-10 + i * 9, -46); c.lineTo(-18 + i * 9, 48); c.stroke(); }
    c.restore(); c.restore(); c.restore();
    cutVig(c);
  }
  /* 翻过来的壶盖：里头是光的。旁边虚虚的一只，是醉春楼的壶盖本来的样子 */
  function drawLid(c, k) {
    cutBg(c, '#4f4034', '#241a15');
    const lid = (x, y, r, a, mark) => {
      c.save(); c.translate(x, y); c.globalAlpha = a;
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(10, 18, r * 1.04, r * 0.5, 0, 0, 6.3); c.fill();
      const g = c.createRadialGradient(-r * 0.3, -r * 0.2, r * 0.1, 0, 0, r); g.addColorStop(0, '#e6f2e8'); g.addColorStop(0.7, '#a9c9b4'); g.addColorStop(1, '#6f8f7e'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r, r * 0.46, 0, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(30,40,34,0.9)'; c.lineWidth = 3; c.stroke();
      c.strokeStyle = 'rgba(30,40,34,0.75)'; c.lineWidth = r * 0.11; c.beginPath(); c.ellipse(0, 3, r * 0.66, r * 0.29, 0, 0, 6.3); c.stroke(); c.strokeStyle = '#d6e8da'; c.lineWidth = r * 0.07; c.stroke();        // 盖里一圈子口
      c.fillStyle = '#c4dccb'; c.beginPath(); c.ellipse(0, 5, r * 0.56, r * 0.235, 0, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-r * 0.2, -r * 0.02, r * 0.2, r * 0.06, -0.3, 0, 6.3); c.fill();
      if (mark) { c.save(); c.scale(1, 0.46); c.fillStyle = 'rgba(120,60,30,0.85)'; c.font = '600 ' + Math.round(r * 0.7) + 'px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('春', 0, 12); c.strokeStyle = 'rgba(120,60,30,0.7)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 8, r * 0.5, 0, 6.3); c.stroke(); c.restore(); }
      c.restore();
    };
    /* 那把壶：没了盖 */
    c.save(); c.translate(250, 350);
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.ellipse(10, 196, 150, 30, 0, 0, 6.3); c.fill();
    c.fillStyle = P.hgrad(c, -130, 0, 260, [[0, '#6f8f7e'], [0.4, '#d8ece0'], [1, '#5f7f6e']]); c.strokeStyle = 'rgba(30,40,34,0.9)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-46, -150); c.lineTo(46, -150); c.bezierCurveTo(60, -100, 140, -40, 130, 60); c.bezierCurveTo(124, 150, 80, 190, 0, 192); c.bezierCurveTo(-80, 190, -124, 150, -130, 60); c.bezierCurveTo(-140, -40, -60, -100, -46, -150); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2a3a32'; c.beginPath(); c.ellipse(0, -150, 46, 12, 0, 0, 6.3); c.fill(); c.stroke();
    c.lineWidth = 16; c.strokeStyle = 'rgba(30,40,34,0.9)'; c.beginPath(); c.moveTo(120, -10); c.bezierCurveTo(190, -20, 200, -100, 230, -130); c.stroke(); c.lineWidth = 11; c.strokeStyle = '#a9c9b4'; c.stroke();
    c.lineWidth = 14; c.strokeStyle = 'rgba(30,40,34,0.9)'; c.beginPath(); c.moveTo(-110, -40); c.bezierCurveTo(-200, -60, -200, 80, -116, 90); c.stroke(); c.lineWidth = 9; c.strokeStyle = '#a9c9b4'; c.stroke();
    c.restore();
    lid(700 - 30 * k, 340, 112 + k * 22, 1, false);
    lid(1090, 250, 96, 0.16 + 0.5 * k, true);
    c.globalAlpha = 0.2 + 0.6 * k; c.fillStyle = '#f0dca8'; c.font = '26px ' + P.KAI; c.textAlign = 'center'; c.fillText('醉春楼的壶盖', 1090, 340); c.fillText('这一只：里头是光的', 700 - 30 * k, 440 + k * 12); c.globalAlpha = 1;
    cutVig(c);
  }
  ST._drawFeather = drawFeather; ST._drawLid = drawLid;
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
    else if (t.hot) { if (JX.dist(p.x, p.y, t.x, t.y) < (t.hot.r || 80) * 0.8) W.fire(t.hot.id); else p.path = W.findPath(p.x, p.y, t.x, t.y); }
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
    /* —— 第四场 词会 —— */
    async 入场四() { const st = JX.state; st.stage = 4; st.flags.tray2 = false; st.flags.heDone = false; st.flags.sang = false; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; UI.purse(st.money); UI.tone(null); },
    async 端酒() { JX.state.flags.tray2 = true; W.player.carry = 'tray'; delete W.exitsOff['hall:stairs']; JX.audio.sfx('tick'); UI.toast('端起了二楼的酒'); },
    async 看小台() { W.focus = { x: 1200, y: 720 }; await JX.sleep(JX.auto ? 0.02 : 1.6); },
    async 喝彩() { JX.audio.sfx('coin'); [['cike', '好！'], ['cike2', '妙！'], ['cike3', '好一个\n“蓦然回首”！']].forEach(([id, t], i) => setTimeout(() => W.byId[id] && W.bubble(id, t, 2.2), i * 260)); await JX.sleep(JX.auto ? 0.02 : 1.6); },
    async 放下视线() { W.focus = null; },
    async 接拨子() {
      const q = W.byId.qiushui, p = W.player; JX.state.flags.sang = true; W.focus = { x: 1160, y: 780 };
      q.pose = null; await JX.sleep(JX.auto ? 0.02 : 0.5);                                               // 她起身
      const pick = W.add('pick', { h: 4 }, 1150, 800, { solid: false, k: 0, draw(g, e) { const yy = -86 + e.k * 80; g.save(); g.translate(-10 - e.k * 26, yy); g.rotate(e.k * 5); g.fillStyle = '#f4ecd8'; g.beginPath(); g.moveTo(0, -7); g.lineTo(6, 6); g.lineTo(-6, 6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.8)'; g.lineWidth = 1; g.stroke(); g.restore(); } });
      JX.tween(JX.auto ? 0.05 : 0.5, k => { pick.k = k; });
      await W.walk(p, 1112, 866, { speed: 640, dir: 2, straight: true });                             // 一步抢到台边
      JX.audio.sfx('tick'); W.remove('pick'); q.dir = 0; await JX.sleep(JX.auto ? 0.02 : 0.4);
    },
    async 上酒() { const p = W.player, h = W.byId.he; await W.walk(p, 1640, 742, { speed: 210, dir: 2 }); p.carry = null; JX.audio.sfx('tick'); W.focus = null; if (h) h.dir = 0; await JX.sleep(JX.auto ? 0.02 : 0.5); },
    async 朱印特写() {
      const box = UI.root().appendChild(JX.el('div', '', '<canvas width="1300" height="640"></canvas>')); box.id = 'cut';
      const c = box.firstChild.getContext('2d'); drawSeal(c, 0); void box.offsetWidth; box.style.opacity = 1;
      await JX.sleep(JX.auto ? 0.05 : 0.9);
      await JX.tween(JX.auto ? 0.05 : 1.6, k => drawSeal(c, k), JX.ease.out);
      await UI.narrate('他转身上酒。贺元度的案上摊着一册旧书，书页上一方朱印。惊蛰的眼睛扫过那方印，脚下慢了半步。');
      box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.7); box.remove();
    },
    async 贺目送() {
      const p = W.player, h = W.byId.he; JX.state.flags.heDone = true; delete W.exitsOff['floor2:up']; W.focus = null;
      await W.walk(p, 1900, 800, { speed: 170, dir: 3 }); if (h) h.dir = 3; await JX.sleep(JX.auto ? 0.02 : 0.9);
    },
    /* —— 第五场 听潮阁 —— */
    async 入场五() { const st = JX.state; st.stage = 5; st.flags.cup1 = false; st.flags.cup2 = false; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 看湖() { const p = W.player; W.focus = { x: 960, y: 520 }; await W.walk(p, 800, 620, { speed: 200, dir: 2 }); await JX.sleep(JX.auto ? 0.02 : 1.2); const x = W.byId.xiali; if (x) x.dir = 1; },
    async 摆杯() { const p = W.player; await W.walk(p, 800, 700, { speed: 200, dir: 3 }); JX.state.flags.cup1 = true; addCups(); JX.audio.sfx('tick'); },
    async 添杯() { JX.state.flags.cup2 = true; W.focus = null; const p = W.player; p.dir = 2; JX.audio.sfx('tick'); addCups(); const x = W.byId.xiali; if (x) await W.walk(x, 1130, 640, { speed: 170, dir: 1 }); W.face(p, x); },
    async 推银() { W.add('silver', { h: 4 }, 960, 723, { solid: false, draw(g) { g.save(); g.translate(96, -96); g.fillStyle = '#d9dde0'; g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(-9, -9, 0, -6); g.quadraticCurveTo(9, -9, 12, 0); g.quadraticCurveTo(0, 6, -12, 0); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.75)'; g.lineWidth = 1.1; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(-5, -5, 6, 1.6); g.restore(); } }); JX.audio.sfx('coin'); await JX.sleep(JX.auto ? 0.02 : 0.6); },
    async 收银() { await JX.sleep(JX.auto ? 0.02 : 1.1); W.remove('silver'); JX.audio.sfx('tick'); },
    /* —— 第六场 十二碗面 —— */
    async 入场六() { const st = JX.state; st.stage = 6; st.flags.thrown = false; st.flags.xueGone = false; st.flags.follow = false; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = 'tray'; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 巨响() { JX.audio.sfx('gong'); const c = W.cam; await JX.tween(JX.auto ? 0.03 : 0.5, k => { W.focus = { x: c.x + JX.W / 2 / c.z + Math.sin(k * 40) * 10 * (1 - k), y: c.y + JX.H / 2 / c.z + Math.cos(k * 33) * 8 * (1 - k) }; }); W.focus = null; },
    async 条凳飞过() {
      W.focus = { x: 1500, y: 1230 }; const e = W.byId.bench6; if (!e) return; const x1 = e.x, y1 = e.y; e.x = 1980; JX.audio.sfx('door');
      await JX.tween(JX.auto ? 0.03 : 0.7, k => { e.x = 1980 + (x1 - 1980) * k; e.y = y1 - 60 + 60 * k; e.z = Math.sin(k * Math.PI) * 150; }, JX.ease.out); e.z = 0; JX.audio.sfx('wrong');
      await JX.sleep(JX.auto ? 0.02 : 0.5);
    },
    async 护院上前() {
      const a = W.byId.huyuan, b = W.byId.huyuan2, t = W.byId.tingxue;
      await Promise.all([W.walk(a, 1672, 1258, { speed: 280, dir: 1, straight: true }), W.walk(b, 1676, 1294, { speed: 280, dir: 1, straight: true })]);
      JX.audio.sfx('wrong'); t.dir = 0;
      await JX.tween(JX.auto ? 0.03 : 0.36, k => { a.x = 1672 + k * 106; b.x = 1676 + k * 116; a.z = b.z = Math.sin(k * Math.PI) * 46; }); a.z = b.z = 0; a.pose = b.pose = 'squat'; JX.state.flags.thrown = true; JX.audio.sfx('door');
      await JX.sleep(JX.auto ? 0.02 : 0.5);
    },
    async 惊蛰下楼() { const p = W.player, t = W.byId.tingxue; p.carry = 'tray'; await W.walk(p, 1380, 1280, { speed: 330, dir: 3 }); if (t) t.dir = 1; W.face('siniang', p); },
    async 战一() {
      const p = W.player, t = W.byId.tingxue, B = JX.battle; p.dir = 3;
      await W.walk(t, 1640, 1280, { speed: 300, dir: 1, straight: true });
      const MV = {
        grab1: { name: '反手一带', tell: '她的手探向你的手腕——是要拿人', type: 'grab' },
        palm: { name: '连环掌', tell: '她沉肩，两掌一错——连环掌，又快又密', type: 'light', pow: 1.05 },
        grab2: { name: '探手来抓', tell: '她五指张开，手探过来——又是要拿人', type: 'grab' },
        press: { name: '一掌按下', tell: '她吸了一口气，掌心朝下——这一掌躲不开', type: 'heavy', pow: 1.3 },
      };
      const second = Math.random() < 0.5 ? MV.palm : MV.grab2;
      await B.run({
        goal: '不露武功，撑过三个回合', music: 'jiaofeng', wheel: false, zoom: 1.36, focus: { x: 1510, y: 1150 },
        allies: [{ ent: p, key: 'jingzhe', name: '陆惊蛰', hp: 120, spd: 12, atk: 0, def: 6, guardK: 0, cmds: [
          { id: 'tray', name: '托盘格挡', kind: 'guard', desc: '举起托盘接一下。挡得住掌，挡不住拿——让她抓住手腕就要吃亏。' },
          { id: 'bench', name: '借条凳闪开', kind: 'dodge', desc: '脚下勾过一条条凳，人往旁边一让。躲得开拿；又快又密的掌，只能躲开一半。' },
          { id: 'talk', name: '劝', kind: 'talk', say: '陆惊蛰：“小娘子，有话好说——”', desc: '她在气头上，未必听。听进去一点，下一手会轻些。', fx(b) { b.calm = true; } }] }],
        foes: [{ ent: t, key: 'tingxue', name: '耶律听雪', hp: 300, showHp: false, spd: 10, atk: 34, ai: b => (b.round === 1 ? MV.grab1 : b.round === 2 ? second : MV.press) }],
        allow(b) { return b.round === 1 ? { ids: ['bench'], hint: '她要拿你的手腕。拿，只能闪。' } : b.round >= 3 ? { ids: ['tray'], hint: '条凳已经踢远了。这一掌，只能接。' } : { hint: '看她的架势：沉肩是掌，探手是拿。掌要挡，拿要闪。' }; },
        autoPick(b, u, cmds) { return cmds.find(c => c.id === (b.round >= 3 || (b.round === 2 && second === MV.palm) ? 'tray' : 'bench')); },
        resolve(b, a, m, x, r) { if (b.calm && r.dmg) { r.dmg = Math.round(r.dmg * 0.5); } b.calm = false; return r; },
        async after(b, u) {
          if (u.side !== 'foe') return; const n = b.round++, r = b.last.r;
          if (n === 1) await B.talk(async () => { await UI.say('tingxue', '耶律听雪', '咦？你躲得挺准啊！', 'surprise'); await UI.say('jingzhe', '陆惊蛰', '碰巧，碰巧。', 'grin'); });
          else if (n === 2) await B.talk(() => UI.narrate(r.evade || (r.block && !r.dmg) ? '又让过去了。满堂的食客开始叫好。' : '这一下挨得结实。他晃了晃，托盘没掉。'));
          else if (n === 3) await B.talk(() => UI.narrate('第三回合。她一掌按在托盘上——盘里的蟹酿橙纹丝不动。她愣住了。'));
        },
        end(b) { return b.round > 3 ? 'win' : null; },
      });
      p.dir = 3; t.dir = 1; W.focus = { x: 1510, y: 1230 };
    },
    async 听雪去后厨() {
      const t = W.byId.tingxue, a = W.byId.huyuan, b = W.byId.huyuan2; JX.state.flags.xueGone = true; W.focus = null; W.player.carry = null;
      if (a) a.pose = null; if (b) b.pose = null;
      if (t) { await W.walk(t, 1180, 1180, { speed: 240 }); W.walk(t, 200, 680, { speed: 300 }).then(() => W.remove('tingxue')); }
      await JX.sleep(JX.auto ? 0.02 : 1.2);
    },
    /* —— 第七场 一壶酒 —— */
    async 入场七() { const st = JX.state, f = st.flags; st.stage = 7; f.follow = false; f.cup1 = f.cup2 = true; f.xueGone = true; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = 'tray'; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 罗二进门() {
      const e = W.add('luoer', 'luoer', 1440, 1440, { dir: 2, tag: '真州来客', solid: false }), p = W.player; JX.audio.sfx('door'); W.focus = { x: 1440, y: 1260 };
      await W.walk(e, 1440, 1330, { speed: 150, dir: 2 }); for (const d of [1, 3, 2]) { e.dir = d; await JX.sleep(JX.auto ? 0.02 : 0.45); }
      await W.walk(p, 1400, 1240, { speed: 220, dir: 0 }); W.focus = null;
    },
    async 跟上() { JX.state.flags.follow = true; },
    async 擦肩() {
      const p = W.player, e = W.byId.luoer, g = W.add('ke', { h: 154, kind: 'robe', robe: '#3a3a44', trim: '#1c1c22', hair: 'futou', wide: 1.4 }, p.x + 430, p.y + 14, { dir: 1, solid: false });
      if (e) { e.path = null; e.moving = false; } p.dir = 3;
      await W.walk(g, p.x + 44, p.y + 12, { speed: 250, dir: 1, straight: true });
      JX.audio.sfx('tick'); const x0 = p.x; JX.tween(JX.auto ? 0.03 : 0.4, k => { p.x = x0 - Math.sin(k * Math.PI) * 12; }).then(() => { p.x = x0; });
      await W.walk(g, p.x - 60, p.y + 26, { speed: 250, dir: 1, straight: true });
      W.walk(g, 190, 400, { speed: 260 }).then(() => W.remove('ke'));
      await JX.sleep(JX.auto ? 0.02 : 0.7);
    },
    async 入座() {
      const p = W.player, e = W.byId.luoer; JX.state.flags.follow = false; W.focus = { x: 960, y: 640 };
      const a = W.walk(p, 800, 720, { speed: 210, dir: 3 }); if (e) { await W.walk(e, 780, 560, { speed: 190 }); await W.walk(e, 960, 590, { speed: 190, dir: 0, straight: true }); e.pose = 'sit'; e.seat = 34; } await a;
    },
    async 斟酒() {
      const p = W.player; p.carry = null; JX.audio.sfx('tick');
      W.add('pot', { h: 4 }, 960, 723, { solid: false, draw(g) { g.save(); g.translate(-18, -112); g.fillStyle = P.hgrad(g, -12, 0, 24, [[0, '#8fb2a0'], [0.4, '#d8ece0'], [1, '#7fa28e']]); g.beginPath(); g.moveTo(-6, -30); g.lineTo(6, -30); g.quadraticCurveTo(16, -14, 11, 0); g.lineTo(-11, 0); g.quadraticCurveTo(-16, -14, -6, -30); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.8)'; g.lineWidth = 1.2; g.stroke(); P.ellipse(g, 0, -31, 6.5, 2.6, '#a9c9b4', 'rgba(43,34,28,0.8)', 1); g.restore(); } });
      await JX.sleep(JX.auto ? 0.02 : 0.7);
      await W.walk(p, 440, 900, { speed: 200, dir: 3 });
    },
    async 罗二倒下() { const e = W.byId.luoer; JX.audio.sfx('wrong'); if (e) e.pose = 'slump'; await JX.sleep(JX.auto ? 0.02 : 0.9); JX.audio.sfx('tick'); },
    async 抢上去() { const p = W.player; await W.walk(p, 850, 610, { speed: 420, dir: 3 }); const x = W.byId.xiali; if (x) x.dir = 1; },
    async 雁翎特写() { await cutIn(drawFeather, ['他没了声息。惊蛰低头：手心里是一根雁翎，翎管上缠着半枚铜符。']); },
    async 壶盖特写() { await cutIn(drawLid, ['他去看那把酒壶，揭开壶盖，翻过来。']); },
    async 试玩结束() {
      JX.state.label = '第七场　一壶酒'; ST.save();
      UI.modal++;
      const box = UI.root().appendChild(JX.el('div', 'panel')); box.id = 'end';
      box.innerHTML = '<h2>试玩到此</h2><p>序章《青玉案》第一至第七场。</p><p>第八场《后巷》起——后巷里等着的三个黑衣人、屋顶上的蟹壳青、三天的期限——下一版接上。</p><div class="btn jx-clickable" data-a="stay">留在听潮阁</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      const a = await new Promise(res => { box.onclick = e => { const b = e.target.closest('[data-a]'); if (b) res(b.dataset.a); }; if (JX.auto) res('stay'); const hs = JX._upd = JX._upd || []; const tick = () => { if (JX.input.hit('confirm')) { hs.splice(hs.indexOf(tick), 1); res('stay'); } }; hs.push(tick); });
      box.remove(); UI.modal--;
      if (a === 'title') { location.reload(); return; }
      W.locked = false; UI.roam(true); JX.ended = true;
    },
  };
})();
