/* 战斗。行动条排先后，时令轮转四季；敌人下一手会先露出架势，挡还是闪由你定。
   人物就站在当前场景里打，不另切画面。每一场战斗是一份定义（def），交给 JX.battle.run：
     allies / foes   各方的人：ent（场景里的人）、name、hp、spd、atk、def、season（0 春 1 夏 2 秋 3 冬）、cmds 或 ai
     allow(b,u)      这一手的提示，返回 { ids, hint, pick, target }（target 是建议打谁，写那个人的 key）：ids 只许用哪几个指令（教学时用），hint 一句话，pick 建议用哪个（指引开着时光标先落在它上面）
     resolve(...)    一下打出去之后改写结果（各场战斗自己的规矩）
     after(b,u)      每一手之后：插对白、数回合
     end(b)          返回 'win' / 'lose' 就结束；不写则打到一方全倒
   指令与招式：kind 是 attack / guard / dodge / talk；type 是 light（快手）/ heavy（重手）/ grab（擒拿）。
   守（guard）挡得住打，挡不住拿；避（dodge）躲得开重手和拿，快手只能躲开一半。 */
'use strict';
(function () {
  const JX = window.JX, W = JX.world, UI = JX.ui, P = JX.P, Art = JX.Art, el = JX.el;
  const B = JX.battle = { n: 0 };
  const SEASONS = ['春', '夏', '秋', '冬'], SCOL = ['#5f9a6a', '#b8433a', '#c9a24a', '#6a8aa8'];
  const wait = s => JX.sleep(JX.auto ? 0.02 : s), tw = (s, f, e) => JX.tween(JX.auto ? 0.03 : s, f, e);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const alive = (b, side) => b.units.filter(u => u.side === side && u.hp > 0);

  /* ---------- 界面 ---------- */
  function face(cv, key) { const a = Art && Art.has(key) ? Art.avatar(key) : null; if (a) cv.getContext('2d').drawImage(a, 190, 196, 380, 380, 0, 0, cv.width, cv.height); }
  function chip(u, now) { const art = Art && Art.has(u.key); return '<div class="chip s-' + u.side + (now ? ' now' : '') + '">' + (art ? '<canvas width="128" height="128" data-k="' + u.key + '"></canvas>' : '<div class="tk">' + u.name.slice(-1) + '</div>') + '<span>' + u.name + '</span></div>'; }
  function order(b, n) {                                          // 往后推演几手，画行动条
    const ct = new Map(alive(b, 'ally').concat(alive(b, 'foe')).map(u => [u, u.ct])), out = [];
    while (out.length < n && ct.size) { let m = null; ct.forEach((v, u) => { if (!m || v < ct.get(m)) m = u; }); out.push(m); ct.set(m, ct.get(m) + 100 / m.spd); }
    return out;
  }
  function refresh(b, cur) {
    const box = b.box, seq = order(b, 7);
    box.querySelector('.order').innerHTML = '<div class="lab">先后</div>' + seq.map((u, i) => chip(u, i === 0 && u === cur)).join('<div class="ar">›</div>');
    box.querySelectorAll('.order canvas').forEach(cv => face(cv, cv.dataset.k));
    box.querySelector('.party').innerHTML = b.units.filter(u => u.side === 'ally').map(u => '<div class="card' + (u.hp <= 0 ? ' out' : '') + '">' + (Art && Art.has(u.key) ? '<canvas width="152" height="174" data-k="' + u.key + '"></canvas>' : '') +
      '<b>' + u.name + '</b>' + (b.def.wheel !== false && u.season === b.season ? '<em>当令</em>' : '') + (u.stance ? '<em class="st">' + (u.stance === 'guard' ? '守' : '避') + '</em>' : '') +
      '<div class="bar"><i style="width:' + Math.round(100 * u.hp / u.hpMax) + '%"></i></div><small>气血 ' + u.hp + ' / ' + u.hpMax + '</small></div>').join('');
    box.querySelectorAll('.party canvas').forEach(cv => { const a = Art.avatar(cv.dataset.k); cv.getContext('2d').drawImage(a, 0, 0, 152, 174); });
    box.querySelector('.foes').innerHTML = alive(b, 'foe').map(u => '<div class="foe"><b>' + u.name + '</b>' + (u.stun ? '<em>失衡</em>' : '') + (u.showHp === false ? '' : '<div class="bar"><i style="width:' + Math.round(100 * u.hp / u.hpMax) + '%"></i></div>') +
      (u.intent && !u.stun ? '<div class="tell"><em>架势</em>' + u.intent.tell + '</div>' : '') + (u.note ? '<div class="tell">' + u.note + '</div>' : '') + '</div>').join('');
    const wh = box.querySelector('.wheel'); wh.classList.toggle('hide', b.def.wheel === false);
    if (b.def.wheel !== false) {
      const c = wh.querySelector('canvas').getContext('2d'); c.setTransform(2, 0, 0, 2, 0, 0); c.clearRect(0, 0, 150, 150);
      for (let i = 0; i < 4; i++) { const a0 = -Math.PI / 2 - Math.PI / 4 + (i - b.season) * Math.PI / 2, on = i === b.season; c.beginPath(); c.moveTo(75, 75); c.arc(75, 75, 66, a0, a0 + Math.PI / 2); c.closePath(); c.fillStyle = on ? SCOL[i] : P.rgba(SCOL[i], 0.3); c.fill(); c.strokeStyle = 'rgba(43,34,28,0.85)'; c.lineWidth = 2; c.stroke();
        const am = a0 + Math.PI / 4; c.font = '600 ' + (on ? 34 : 24) + 'px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = on ? '#fff6dc' : 'rgba(246,233,200,0.7)'; c.fillText(SEASONS[i], 75 + Math.cos(am) * 40, 77 + Math.sin(am) * 40); }
      c.beginPath(); c.arc(75, 75, 66, 0, 6.3); c.strokeStyle = '#d7a544'; c.lineWidth = 3; c.stroke(); c.beginPath(); c.arc(75, 75, 9, 0, 6.3); c.fillStyle = '#2b221c'; c.fill(); c.strokeStyle = '#d7a544'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.moveTo(75, 2); c.lineTo(68, 16); c.lineTo(82, 16); c.closePath(); c.fillStyle = '#d7a544'; c.fill();
      const who = b.units.filter(u => u.hp > 0 && u.season === b.season).map(u => u.name);
      wh.querySelector('.wl').innerHTML = '时令：' + SEASONS[b.season] + (who.length ? '<br>当令 ' + who.join('、') : '');
    }
  }
  function log(b, text) { const l = b.box.querySelector('.log'); l.textContent = text; l.style.opacity = 1; }
  B.quiet = on => { if (B.cur) B.cur.box.classList.toggle('quiet', !!on); };
  /* 战斗当中插一段对白：先把指令和状态收起来 */
  B.talk = async function (fn) { B.quiet(true); try { await fn(); } finally { B.quiet(false); } };

  /* ---------- 选指令 ---------- */
  function menu(b, title, items, allow, auto, grace) {
    return new Promise(res => {
      const box = b.box.querySelector('.cmd'), ok = c => (!allow || !allow.ids || allow.ids.includes(c.id)) && !c.off;
      let sel = Math.max(0, items.findIndex(ok));
      if (allow && allow.pick && JX.settings.guide) { const k = items.findIndex(c => c.id === allow.pick && ok(c)); if (k >= 0) sel = k; }      // 指引开着：光标先落在建议的那一手上，照着按回车就能打过去
      const paint = () => { box.innerHTML = '<div class="who">' + title + '</div><div class="list">' + items.map((c, i) => '<div class="c jx-clickable' + (i === sel ? ' on' : '') + (ok(c) ? '' : ' off') + '" data-i="' + i + '"><b>' + (i + 1) + '</b>' + c.name + '</div>').join('') + '</div><div class="d">' + (allow && allow.hint ? '<em>' + allow.hint + '</em>' : '') + (items[sel].desc || '') + '</div>'; };
      const hs = JX._upd = JX._upd || [], off = () => { const k = hs.indexOf(tick); if (k >= 0) hs.splice(k, 1); box.classList.add('hide'); box.onclick = box.onmousemove = null; };
      const pick = i => { if (!ok(items[i])) { JX.audio.sfx('wrong'); return; } JX.audio.sfx('tick'); off(); res(items[i]); };
      const born = JX.time;
      const tick = () => {
        if (JX.auto) return pick(auto != null ? auto : items.findIndex(ok));
        if (UI.menuOpen && UI.menuOpen()) return;
        const young = JX.time - born < (grace == null ? 0.4 : grace);       // 刚弹出来的一瞬只许挪光标、不收“确定”，免得连按对白时误选
        const mv = (JX.input.hit('right') || JX.input.hit('down') || JX.input.hit('KeyD') || JX.input.hit('KeyS') ? 1 : 0) - (JX.input.hit('left') || JX.input.hit('up') || JX.input.hit('KeyA') || JX.input.hit('KeyW') ? 1 : 0);
        if (mv) { sel = (sel + mv + items.length) % items.length; JX.audio.sfx('page'); paint(); }
        for (let i = 0; i < items.length; i++) if (JX.input.hit('Digit' + (i + 1)) || JX.input.hit('Numpad' + (i + 1))) { if (sel === i) { if (!young) pick(i); return; } sel = i; JX.audio.sfx('page'); paint(); return; }
        if (JX.input.hit('confirm')) { JX.input.eat('confirm'); if (!young) pick(sel); }
      };
      box.onclick = e => { const d = e.target.closest('[data-i]'); if (d) pick(+d.dataset.i); };
      box.onmousemove = e => { const d = e.target.closest('[data-i]'); if (d && +d.dataset.i !== sel) { sel = +d.dataset.i; paint(); } };
      b.m = { items, ok, get sel() { return sel; } };                 // 给检查脚本看的
      paint(); box.classList.remove('hide'); hs.push(tick);
    });
  }
  async function choose(b, u) {
    const allow = b.def.allow ? b.def.allow(b, u) : null, cmds = u.cmds.filter(c => !c.when || c.when(b, u)); b.actor = u;
    const auto = b.def.autoPick ? cmds.indexOf(b.def.autoPick(b, u, cmds)) : null;
    const c = await menu(b, u.name + '　这一手', cmds, allow, auto >= 0 ? auto : null);
    let t = null;
    if (c.kind === 'attack' && !c.all) {
      const fs = alive(b, 'foe'), want = allow && allow.target ? fs.findIndex(f => f.key === allow.target) : -1;      // 提示里点了名的那个人：光标先落在他身上
      t = fs.length === 1 ? fs[0] : (await menu(b, c.name + '　打谁', fs.map(f => ({ id: f.key, name: f.name, desc: (f.stun ? '站不稳。' : '') + (f.intent && !f.stun ? '架势：' + f.intent.tell : ''), u: f })), want >= 0 ? { pick: allow.target } : null, want >= 0 ? want : null, 0.12)).u;
    }
    return { c, t };
  }

  /* ---------- 动作 ---------- */
  function floater(u, text, col) {
    const e = u.ent, id = 'fl' + (++B.n), h = (e.sp && e.sp.h) || 150;
    const f = W.add(id, { h: 1 }, e.x, e.y + 4, { solid: false, k: 0, draw(g, me) { g.save(); g.globalAlpha = Math.max(0, 1 - me.k * me.k); g.font = '600 38px ' + P.KAI; g.textAlign = 'center'; g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = 'rgba(20,12,8,0.85)'; const y = -h - 26 - me.k * 50; g.strokeText(text, 0, y); g.fillStyle = col; g.fillText(text, 0, y); g.restore(); } });
    tw(1.1, k => { f.k = k; }).then(() => W.remove(id));
  }
  async function lunge(a, t, k) { const e = a.ent, hx = e.x, hy = e.y, tx = hx + (t.ent.x - hx) * k, ty = hy + (t.ent.y - hy) * k; e.moving = true; await tw(0.2, q => { e.x = hx + (tx - hx) * q; e.y = hy + (ty - hy) * q; }, JX.ease.out); e.moving = false; }
  async function back(a) { const e = a.ent, sx = e.x, sy = e.y, h = a.home; if (JX.dist(sx, sy, h.x, h.y) < 2) return; e.moving = true; await tw(0.24, q => { e.x = sx + (h.x - sx) * q; e.y = sy + (h.y - sy) * q; }); e.moving = false; e.dir = h.dir; }
  async function shake(u) { const e = u.ent, x0 = e.x; await tw(0.3, k => { e.x = x0 + Math.sin(k * 26) * 8 * (1 - k); }); e.x = x0; }
  async function hop(u) { const e = u.ent, h = u.home, d = (u.side === 'ally' ? -1 : 1) * (B.cur && B.cur.def.flip ? -1 : 1);      // flip：这一场是我方站右边、对面在左边
    await tw(0.34, k => { e.x = h.x + d * 46 * Math.sin(k * Math.PI); e.y = h.y + 22 * Math.sin(k * Math.PI); e.z = 30 * Math.sin(k * Math.PI); }); e.x = h.x; e.y = h.y; e.z = 0; }
  B.fx = { floater, lunge, back, shake, hop, wait, tw };
  B.soak = n => (JX.state && JX.state.maxed ? Math.max(1, Math.round(n * 0.25)) : n);      // 演出里直接扣我方气血的地方（琴声）用它过一道，功力全开时一样只算两成半

  function strike(b, a, m, t) {
    const res = { evade: false, block: false, dmg: 0 }, mul = (b.def.wheel !== false && a.season != null && a.season === b.season ? 1.25 : 1) * (t.stun ? 1.5 : 1) * (a.weak || 1);
    if (t.stance === 'dodge' && !t.stun && (m.type !== 'light' || (JX.auto && !JX.honest) || Math.random() < 0.5)) { res.evade = true; return res; }
    let d = Math.max(1, Math.round((a.atk * (m.pow || 1) - t.def * 0.5) * mul * rnd(0.92, 1.08)));
    if (JX.state && JX.state.maxed) d = a.side === 'ally' ? d * 3 : Math.max(1, Math.round(d * 0.25));      // 功力全开：我方出手重三倍，挨打只算两成半（菜单人物页的开关；0.14.1 以前这个开关在战斗里不起作用）
    if (t.stance === 'guard') { if (m.type === 'grab') d = Math.round(d * 1.15); else { d = Math.round(d * (t.guardK == null ? 0.35 : t.guardK)); res.block = true; } }
    res.dmg = d; return res;
  }
  async function land(b, a, m, t) {
    let r = strike(b, a, m, t); if (b.def.resolve) r = b.def.resolve(b, a, m, t, r) || r;
    b.last = { a, m, t, r };
    if (r.evade) { floater(t, '闪', '#bfe3d0'); JX.audio.sfx('page'); await hop(t); }
    else if (r.iron) { floater(t, r.iron, '#c9d2d8'); JX.audio.sfx('gong'); W.fx && W.fx('ring', t.ent.x, t.ent.y - 80, { s: 0.9, col: 'rgba(201,210,216,0.9)' }); await wait(0.35); }
    else {
      if (W.fx) { const heavy = m.type === 'heavy' || r.dmg >= 40, fromLeft = a.ent.x < t.ent.x;      // 观感：刀光一道、命中一闪、重的一下镜头震一震；挡住了只是一圈
        if (r.block || !r.dmg) W.fx('ring', t.ent.x, t.ent.y - 80, { s: 0.8, col: 'rgba(240,220,168,0.9)' });
        else { W.fx('slash', t.ent.x, t.ent.y - 78, { s: heavy ? 1.3 : 1, rot: fromLeft ? 0.35 : Math.PI - 0.35 }); W.fx('flash', t.ent.x, t.ent.y - 80, { s: heavy ? 1.15 : 0.75 }); W.shakeAmp = Math.max(W.shakeAmp || 0, heavy ? 9 : 3.5); } }
      t.hp = Math.max(0, t.hp - r.dmg); floater(t, r.dmg ? '−' + r.dmg : '接住', r.block ? '#f0dca8' : '#ff8a70'); JX.audio.sfx(r.block ? 'tick' : 'wrong'); refresh(b); await shake(t);
      if (t.hp <= 0) { if (t.side === 'foe') { if (!t.keep) { await tw(0.5, k => { t.ent.alpha = 1 - k; }); t.ent.vis = false; } } else t.ent.pose = 'squat'; }
    }
    refresh(b);
  }
  async function perform(b, u, m, t) {
    if (m.kind === 'guard' || m.kind === 'dodge') { u.stance = m.kind; log(b, u.name + '：' + m.name); floater(u, m.kind === 'guard' ? '守' : '避', '#f0dca8'); refresh(b); if (m.fx) await m.fx(b, u); await wait(0.5); return; }
    if (m.kind === 'talk' || m.kind === 'wait') { log(b, m.say || (u.name + '：' + m.name)); if (m.fx) await m.fx(b, u, t); await wait(0.6); return; }
    const other = u.side === 'ally' ? 'foe' : 'ally', pool = alive(b, other); if (!pool.length) return;
    const ts = m.all ? pool : [t && t.hp > 0 ? t : (m.pick ? m.pick(b, pool) : pool[Math.floor(Math.random() * pool.length)])];
    log(b, u.name + '：' + m.name);
    u.ent.dir = ts[0].ent.x > u.ent.x ? 3 : 1;
    if (m.pre) await m.pre(b, u, ts[0]);                              // 出手之前的一段（暗器飞过去之类）
    await lunge(u, ts[0], m.reach == null ? 0.7 : m.reach);
    for (const x of ts) await land(b, u, m, x);
    if (m.fx) await m.fx(b, u, ts[0]);
    await back(u);
  }

  /* ---------- 一场战斗 ---------- */
  B.run = async function (def) {
    const b = B.cur = { def, season: def.season || 0, acts: 0, round: 1, units: [] };
    const mk = (u, side) => { const ent = typeof u.ent === 'string' ? W.byId[u.ent] : u.ent; const o = Object.assign({ side, spd: 10, atk: 10, def: 0, stance: null, stun: 0, intent: null }, u, { ent }); o.hpMax = u.hp; o.home = { x: ent.x, y: ent.y, dir: ent.dir }; ent.pose = null; ent.moving = false; return o; };
    def.allies.forEach(u => b.units.push(mk(u, 'ally'))); def.foes.forEach(u => b.units.push(mk(u, 'foe')));
    b.units.forEach((u, i) => { u.ct = 100 / u.spd * (u.side === 'ally' ? 0.8 : 1) + i * 0.01; });
    const zoom0 = W.zoom, hold0 = JX.audio.hold;
    UI.modal++; W.locked = true; UI.roam(false); UI.objective(null); UI.purse(null);
    const xs = b.units.map(u => u.ent.x), ys = b.units.map(u => u.ent.y);
    W.focus = def.focus || { x: (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, y: (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2 - 20 }; W.zoom = def.zoom || 1.2;
    if (def.music) { JX.audio.hold = true; JX.audio.music(def.music); }
    if (JX.state.maxed && !JX.auto && UI.toast) UI.toast('功力全开：出手重三倍，挨打只算两成半');
    const box = b.box = UI.root().appendChild(el('div')); box.id = 'bt';
    box.innerHTML = (def.goal ? '<div class="goal"><b>◆</b>' + def.goal + '</div>' : '') + '<div class="order"></div><div class="wheel"><canvas width="300" height="300"></canvas><div class="wl"></div></div><div class="log"></div><div class="party"></div><div class="foes"></div><div class="cmd hide"></div>';
    const plan = u => { u.intent = u.ai(b, u); };
    alive(b, 'foe').forEach(plan); refresh(b);
    if (def.start) await def.start(b);
    let result = null;
    while (!result) {
      const live = alive(b, 'ally').concat(alive(b, 'foe')); let u = live[0]; live.forEach(x => { if (x.ct < u.ct) u = x; });
      const dt = u.ct; live.forEach(x => { x.ct -= dt; });
      refresh(b, u);
      if (u.stun > 0) { u.stun--; log(b, u.name + ' 还没缓过来。'); floater(u, '失衡', '#d9c27a'); await wait(0.8); u.ct += 100 / u.spd; }
      else if (u.side === 'ally') { u.stance = null; refresh(b, u); const { c, t } = await choose(b, u); await perform(b, u, c, t); u.ct += 100 / u.spd * (c.delay || 1); }
      else { const m = u.intent; u.intent = null; await perform(b, u, m, null); u.ct += 100 / u.spd * (m.delay || 1); }
      b.acts++;
      if (def.wheel !== false && b.acts % (def.seasonEvery || 4) === 0) { b.season = (b.season + 1) % 4; log(b, '时令转到了' + SEASONS[b.season] + '。'); JX.audio.sfx('page'); }
      refresh(b);
      if (def.after) await def.after(b, u);
      if (u.side === 'foe' && u.hp > 0 && !u.intent) plan(u);                    // 下一手的架势，等这一手的后话说完了再露
      refresh(b);
      result = def.end ? def.end(b) : null;
      if (!result) { if (!alive(b, 'foe').length) result = 'win'; else if (!alive(b, 'ally').length) result = 'lose'; }
    }
    await wait(0.4);
    box.remove(); B.cur = null; B.result = result; UI.modal--; UI.purse(JX.state.money);
    W.zoom = zoom0; W.focus = null; JX.audio.hold = hold0; if (def.music && !hold0 && W.sc && W.sc.music) JX.audio.music(W.sc.music, W.sc.muffle);
    b.units.forEach(u => { u.ent.z = 0; u.ent.moving = false; });
    return { result, b };
  };
})();
