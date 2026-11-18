/* 世界：场景的预渲染、镜头、人物、碰撞、寻路、路线指引、俯瞰（上帝视角）、灯光与粒子 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, Fig = JX.Fig;
  const CELL = 20, R = 15;
  const W = JX.world = {
    id: null, sc: null, bg: null, lm: null, sprites: [], ents: [], byId: {}, hots: [], blocks: [],
    player: null, cam: { x: 0, y: 0, z: 1 }, godOn: false, god: 0,
    locked: true, objective: null, guide: null, guideAt: 0,
    waiters: {}, bubbles: [], parts: [], partKind: null, exitsOff: {}, tone: null,
  };
  const DIRV = [[0, 1], [-1, 0], [0, -1], [1, 0]];

  /* ---------- 进入场景 ---------- */
  W.load = function (id, spawn) {
    const sc = JX.scenes[id];
    if (!sc) throw new Error('没有这个场景：' + id);
    W.id = id; W.sc = sc; W.ents = []; W.byId = {}; W.hots = []; W.bubbles = []; W.guide = null; W.focus = null; W.talker = null;
    W.blocks = (sc.blocks || []).slice();
    (sc.props || []).forEach(p => { if (p.block) W.blocks.push([p.x + p.block[0], p.y + p.block[1], p.block[2], p.block[3]]); });
    W.prerender();
    (sc.hots || []).forEach(h => W.hots.push(Object.assign({}, h)));
    if (sc.setup) sc.setup(W);
    if (JX.populate) JX.populate(id, W);
    W.initParts(sc.particles);
    const sp = (sc.spawns || {})[spawn || 'start'] || { x: sc.w / 2, y: sc.h / 2, dir: 0 };
    if (W.player) { W.player.x = sp.x; W.player.y = sp.y; W.player.dir = sp.dir || 0; W.player.path = null; W.player.moving = false; W.ents.push(W.player); W.byId[W.player.id] = W.player; }
    W.godOn = false; W.god = 0;
    W.snapCam();
    JX.emit('sceneEnter', sc);
  };
  W.prerender = function () {
    const sc = W.sc, S = JX.S; if (!sc) return;
    const cv = document.createElement('canvas'); cv.width = Math.round(sc.w * S); cv.height = Math.round(sc.h * S);
    const c = cv.getContext('2d'); c.scale(S, S); sc.paint(c, sc); W.bg = cv;
    W.sprites = (sc.props || []).map(p => {
      const pad = 6, below = p.below || 14, pc = document.createElement('canvas');
      pc.width = Math.ceil((p.bw + pad * 2) * S); pc.height = Math.ceil((p.bh + pad + below) * S);
      const g = pc.getContext('2d'); g.scale(S, S); g.translate(pad + p.bw / 2, pad + p.bh); p.draw(g, sc);
      return { p, cv: pc, x: p.x - p.bw / 2 - pad, y: p.y - p.bh - pad, w: p.bw + pad * 2, h: p.bh + pad + below, sy: p.sortY == null ? p.y : p.sortY };
    });
    const ls = Math.max(0.25, S * 0.5), lc = document.createElement('canvas');
    lc.width = Math.ceil(sc.w * ls); lc.height = Math.ceil(sc.h * ls);
    const l = lc.getContext('2d'); l.scale(ls, ls);
    l.fillStyle = sc.ambient || '#ffffff'; l.fillRect(0, 0, sc.w, sc.h);
    l.globalCompositeOperation = 'lighter';
    (sc.lights || []).forEach(L => {
      const a = L.a == null ? 1 : L.a, col = L.c || '#ffd9a0';
      l.save(); l.translate(L.x, L.y); l.scale(1, L.ey || 1);
      const g = l.createRadialGradient(0, 0, 0, 0, 0, L.r);
      g.addColorStop(0, P.rgba(col, a)); g.addColorStop(0.45, P.rgba(col, a * 0.5)); g.addColorStop(1, P.rgba(col, 0));
      l.fillStyle = g; l.fillRect(-L.r, -L.r, L.r * 2, L.r * 2); l.restore();
    });
    W.lm = lc;
    buildGrid();
  };
  JX.on('resize', () => { if (W.sc) W.prerender(); });

  /* ---------- 人物 ---------- */
  W.add = function (id, spec, x, y, o) {
    const e = Object.assign({ id, sp: typeof spec === 'string' ? Fig.cast[spec] : spec, x, y, dir: 0, ph: 0, moving: false, solid: true, vis: true, alpha: 1, blink: 2 + Math.random() * 4 }, o || {});
    if (W.byId[id]) W.remove(id);
    W.ents.push(e); W.byId[id] = e; return e;
  };
  W.remove = function (id) { const e = W.byId[id]; if (!e) return; W.ents.splice(W.ents.indexOf(e), 1); delete W.byId[id]; };
  W.setPlayer = function (spec, o) {
    if (W.player) W.remove(W.player.id);
    W.player = W.add('player', spec, 0, 0, Object.assign({ isPlayer: true }, o || {}));
    return W.player;
  };
  W.face = function (e, tx, ty) {
    if (typeof e === 'string') e = W.byId[e]; if (!e) return;
    if (typeof tx === 'object') { ty = tx.y; tx = tx.x; }
    const dx = tx - e.x, dy = ty - e.y;
    e.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2);
  };
  /* 让一个人走到某处（沿寻路结果走），到了才算完 */
  W.walk = function (e, x, y, o) {
    if (typeof e === 'string') e = W.byId[e];
    o = o || {};
    return new Promise(res => {
      if (!e) return res();
      const path = o.straight ? [{ x, y }] : (W.findPath(e.x, e.y, x, y) || [{ x, y }]);
      e.path = path; e.pathSpeed = o.speed || 210; e.onArrive = () => { if (o.dir != null) e.dir = o.dir; res(); };
    });
  };
  W.bubble = function (e, text, sec) {
    if (typeof e === 'string') e = W.byId[e];
    W.bubbles = W.bubbles.filter(b => b.e !== e);
    W.bubbles.push({ e, text, t: sec || 2.6, d: sec || 2.6 });
  };

  /* ---------- 碰撞与寻路 ---------- */
  function staticFree(x, y) {
    const sc = W.sc; let ok = false;
    for (const f of sc.walk) if (x >= f[0] + R && x <= f[2] - R && y >= f[1] + 4 && y <= f[3] - 4) { ok = true; break; }
    if (!ok) return false;
    for (const b of W.blocks) if (x > b[0] - R && x < b[0] + b[2] + R && y > b[1] - 6 && y < b[1] + b[3] + 8) return false;
    return true;
  }
  function free(x, y, self) {
    if (!staticFree(x, y)) return false;
    for (const e of W.ents) if (e !== self && e.solid && e.vis !== false && Math.abs(e.x - x) < 30 && Math.abs(e.y - y) < 16) return false;
    return true;
  }
  W.free = free;
  function buildGrid() {
    const sc = W.sc, gw = Math.ceil(sc.w / CELL), gh = Math.ceil(sc.h / CELL), g = new Uint8Array(gw * gh);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) g[y * gw + x] = staticFree((x + 0.5) * CELL, (y + 0.5) * CELL) ? 1 : 0;
    W.grid = { g, gw, gh };
  }
  function nearestFree(cx, cy) {
    const { g, gw, gh } = W.grid;
    if (cx >= 0 && cy >= 0 && cx < gw && cy < gh && g[cy * gw + cx]) return [cx, cy];
    for (let r = 1; r < 14; r++) {
      let best = null, bd = 1e9;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= gw || y >= gh || !g[y * gw + x]) continue;
        const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) return best;
    }
    return null;
  }
  function sight(ax, ay, bx, by) {
    const n = Math.ceil(JX.dist(ax, ay, bx, by) / 8);
    for (let i = 1; i < n; i++) if (!staticFree(ax + (bx - ax) * i / n, ay + (by - ay) * i / n)) return false;
    return true;
  }
  W.findPath = function (x0, y0, x1, y1) {
    const { g, gw, gh } = W.grid;
    const s = nearestFree(Math.floor(x0 / CELL), Math.floor(y0 / CELL)), t = nearestFree(Math.floor(x1 / CELL), Math.floor(y1 / CELL));
    if (!s || !t) return null;
    const N = gw * gh, gs = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = [], hf = i => { const x = i % gw, y = (i / gw) | 0, dx = Math.abs(x - t[0]), dy = Math.abs(y - t[1]); return (dx + dy) + (1.4142 - 2) * Math.min(dx, dy); };
    const push = (i, f) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const a = k * 2 + 1, b = a + 1; let m = k; if (a < heap.length && heap[a][0] < heap[m][0]) m = a; if (b < heap.length && heap[b][0] < heap[m][0]) m = b; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const si = s[1] * gw + s[0], ti = t[1] * gw + t[0];
    gs[si] = 0; push(si, hf(si));
    let found = false, guard = 0;
    while (heap.length && guard++ < 60000) {
      const cur = pop()[1]; if (closed[cur]) continue; closed[cur] = 1;
      if (cur === ti) { found = true; break; }
      const cx = cur % gw, cy = (cur / gw) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const ni = ny * gw + nx; if (!g[ni] || closed[ni]) continue;
        if (dx && dy && (!g[cy * gw + nx] || !g[ny * gw + cx])) continue;       // 不许斜着擦过墙角
        const ng = gs[cur] + (dx && dy ? 1.4142 : 1);
        if (ng < gs[ni]) { gs[ni] = ng; from[ni] = cur; push(ni, ng + hf(ni)); }
      }
    }
    if (!found) return null;
    let pts = []; for (let i = ti; i !== -1; i = from[i]) pts.push({ x: (i % gw + 0.5) * CELL, y: (((i / gw) | 0) + 0.5) * CELL });
    pts.reverse(); pts[0] = { x: x0, y: y0 };
    if (staticFree(x1, y1)) pts.push({ x: x1, y: y1 });
    const out = [pts[0]]; let a = 0;                              // 拉直：能直接看见的中间点都去掉
    while (a < pts.length - 1) { let b = pts.length - 1; while (b > a + 1 && !sight(pts[a].x, pts[a].y, pts[b].x, pts[b].y)) b--; out.push(pts[b]); a = b; }
    out.shift(); return out;
  };

  /* ---------- 互动 ---------- */
  W.waitFor = id => new Promise(res => { W.waiters[id] = res; });
  function fire(id, arg) { const f = W.waiters[id]; if (f) { delete W.waiters[id]; f(arg); return true; } return false; }
  W.fire = fire;
  function targetPos(t) {
    if (!t) return null;
    if (t.ent) { const e = W.byId[t.ent]; return e ? { x: e.x, y: e.y, ent: e } : null; }
    if (t.hot) { const h = W.hots.find(h => h.id === t.hot); return h ? { x: h.x, y: h.y, hot: h } : null; }
    if (t.exit) { const x = (W.sc.exits || []).find(x => x.id === t.exit); return x ? { x: x.x + x.w / 2, y: x.y + x.h / 2, exit: x } : null; }
    if (t.x != null) return t;
    return null;
  }
  W.objTarget = () => { const o = W.objective; if (!o) return null; return targetPos(o.at && (o.at[W.id] || o.at['*'])); };
  function nearby() {                                             // 剧情正等着的那个人或东西优先：旁边有会搭话的路人，也不抢它的“回车”
    const p = W.player; if (!p) return null;
    let best = null, bd = 1e9, bw = false;
    const f = DIRV[p.dir], px = p.x + f[0] * 26, py = p.y + f[1] * 18;
    const take = (d, want, make) => { if ((want && !bw) || (want === bw && d < bd)) { bd = d; bw = want; best = make(); } };
    W.ents.forEach(e => { if (e === p || e.vis === false || !(e.act || W.waiters[e.id] || e.bark)) return; const d = JX.dist(px, py, e.x, e.y); if (d < (e.reach || 82)) take(d, !!W.waiters[e.id], () => ({ e, x: e.x, y: e.y - (e.sp.h || 150) * (e.pose ? 0.8 : 1) - 18, label: e.verb || '说话' })); });
    W.hots.forEach(h => { if (h.off || !(h.act || W.waiters[h.id])) return; const d = JX.dist(px, py, h.x, h.y); if (d < (h.r || 80)) take(d, !!W.waiters[h.id], () => ({ h, x: h.x, y: h.y - (h.up || 110), label: h.verb || '查看' })); });
    return best;
  }
  function interact(n) {
    const p = W.player;
    if (n.e) { W.face(p, n.e.x, n.e.y); if (fire(n.e.id)) return; if (n.e.act) return void n.e.act(n.e); if (n.e.bark) { const b = n.e.bark; W.bubble(n.e, b[(n.e.barkI = ((n.e.barkI || 0) + 1)) % b.length]); JX.audio && JX.audio.sfx('tick'); } }
    else if (n.h) { W.face(p, n.h.x, n.h.y); if (fire(n.h.id)) return; if (n.h.act) n.h.act(n.h); }
  }

  /* ---------- 每帧更新 ---------- */
  function movePlayer(dt) {
    const p = W.player, I = JX.input, S = JX.settings;
    let mx = 0, my = 0;
    const rel = S.controls === 'rel';
    if (I.down('up')) my -= 1; if (I.down('down')) my += 1; if (I.down('left')) mx -= 1; if (I.down('right')) mx += 1;
    if (!rel) { if (I.down('w')) my -= 1; if (I.down('s')) my += 1; if (I.down('a')) mx -= 1; if (I.down('d')) mx += 1; }
    if (mx || my) { p.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 3 : 1) : (my > 0 ? 0 : 2); if (mx && my && (I.down('up') || I.down('down') || I.down('w') || I.down('s'))) p.dir = my > 0 ? 0 : 2; }
    else if (rel) {                                              // W 前进；A、D 转向，按住超过四分之一秒才迈步；S 掉头往回走
      if (I.hit('a')) p.dir = [3, 0, 1, 2][p.dir];
      if (I.hit('d')) p.dir = [1, 2, 3, 0][p.dir];
      if (I.hit('s')) p.dir = (p.dir + 2) % 4;
      if (I.down('w') || I.down('s') || I.held('a') > 0.25 || I.held('d') > 0.25) { mx = DIRV[p.dir][0]; my = DIRV[p.dir][1]; }
    }
    if (mx || my) {
      p.path = null; p.onArrive = null; if (W.godOn) W.godOn = false;
      const len = Math.hypot(mx, my), sp = 250 * S.walk * (p.speedK || 1) * (JX.fast || 1) * dt;
      const nx = p.x + mx / len * sp, ny = p.y + my / len * sp;
      let moved = false;
      const inside = !free(p.x, p.y, p);                          // 万一被演出摆进了桌子或人的占位里，先许他走出来，不然哪边都迈不动
      if (inside || free(nx, p.y, p)) { p.x = nx; moved = moved || !!mx; }
      if (inside || free(p.x, ny, p)) { p.y = ny; moved = moved || !!my; }
      /* 蹭到桌角、凳角走不动的时候：只按着一个方向，就往旁边让一让，顺着角滑过去（不然得自己松手、挪半步、再按） */
      if (!moved && (!mx || !my)) {
        const ax = mx ? 1 : 0, sx = Math.sign(mx), sy = Math.sign(my), g = W.guide && W.guide.path && W.guide.path[0];
        for (const d of [6, 12, 18, 24, 30, 38, 46]) {
          const okA = ax ? free(p.x + sx * 6, p.y - d, p) && free(p.x, p.y - Math.min(d, sp), p) : free(p.x - d, p.y + sy * 6, p) && free(p.x - Math.min(d, sp), p.y, p);
          const okB = ax ? free(p.x + sx * 6, p.y + d, p) && free(p.x, p.y + Math.min(d, sp), p) : free(p.x + d, p.y + sy * 6, p) && free(p.x + Math.min(d, sp), p.y, p);
          if (!okA && !okB) continue;
          let side = okA && okB ? (g ? ((ax ? g.y - p.y : g.x - p.x) < 0 ? -1 : 1) : -1) : okA ? -1 : 1;      // 两边都让得开，就往路标那一边让
          if (ax) p.y += side * Math.min(d, sp); else p.x += side * Math.min(d, sp);
          moved = true; break;
        }
      }
      p.moving = moved;
    } else if (!p.path) p.moving = false;
  }
  function followPath(e, dt) {
    const sp = (e.isPlayer ? 250 * JX.settings.walk * (e.speedK || 1) : e.pathSpeed || 210) * (JX.fast || 1) * dt;
    let left = sp;
    while (e.path && e.path.length && left > 0) {
      const t = e.path[0], d = JX.dist(e.x, e.y, t.x, t.y);
      if (d <= left) { e.x = t.x; e.y = t.y; e.path.shift(); left -= d; }
      else { const dx = (t.x - e.x) / d, dy = (t.y - e.y) / d; e.x += dx * left; e.y += dy * left; e.dir = Math.abs(dx) > Math.abs(dy) * 0.9 ? (dx > 0 ? 3 : 1) : (dy > 0 ? 0 : 2); left = 0; }
    }
    e.moving = !!(e.path && e.path.length);
    if (!e.moving) { e.path = null; const f = e.onArrive; e.onArrive = null; if (f) f(); }
  }
  function update(dt) {
    const sc = W.sc; if (!sc) return;
    const p = W.player, blocked = W.locked || (JX.ui && JX.ui.modal > 0);
    W.near = null;
    if (p && !blocked) {
      if (JX.input.hit('god')) { W.godOn = !W.godOn; JX.audio && JX.audio.sfx('tick'); }
      if (JX.input.hit('guide')) { JX.settings.guide = !JX.settings.guide; JX.saveSettings(); JX.ui.toast(JX.settings.guide ? '路线指引：开' : '路线指引：关'); }
      movePlayer(dt);
      for (const c of JX.input.clicks) {                         // 点地行走；俯瞰时点完自动落回
        const wx = W.cam.x + c.x / W.cam.z, wy = W.cam.y + c.y / W.cam.z;
        let goal = { x: wx, y: wy }, then = null;
        const hitE = W.ents.find(e => e !== p && e.vis !== false && (e.act || W.waiters[e.id] || e.bark) && Math.abs(e.x - wx) < 34 && wy < e.y + 14 && wy > e.y - 160);
        const hitH = W.hots.find(h => !h.off && (h.act || W.waiters[h.id]) && JX.dist(h.x, h.y - 30, wx, wy) < 70);
        if (hitE) { goal = { x: hitE.x, y: hitE.y + 40 }; then = { e: hitE }; } else if (hitH) { goal = { x: hitH.x, y: hitH.y + 20 }; then = { h: hitH }; }
        const path = W.findPath(p.x, p.y, goal.x, goal.y);
        if (path && path.length) { p.path = path; p.onArrive = then ? () => { if (!W.locked) interact(then); } : null; W.godOn = false; W.clickMark = { x: goal.x, y: goal.y, t: 0.8 }; }
      }
      W.near = nearby();
      if (W.near && JX.input.hit('confirm')) { JX.input.eat('confirm'); p.path = null; p.moving = false; interact(W.near); }
      for (const x of (sc.exits || [])) {                         // 走进出口
        if (p.x > x.x && p.x < x.x + x.w && p.y > x.y && p.y < x.y + x.h) {
          if (W.exitsOff[W.id + ':' + x.id]) { W.bubble(p, W.exitsOff[W.id + ':' + x.id], 2); p.y += x.back ? x.back[1] : 0; p.x += x.back ? x.back[0] : 0; p.path = null; break; }
          if (!fire('exit:' + x.id, x) && x.to) { W.travel(x.to, x.spawn); }
          break;
        }
      }
    } else if (p && !p.path) p.moving = false;
    W.ents.forEach(e => {
      if (e.path) followPath(e, dt);
      if (e.moving) e.ph += dt * (e.isPlayer ? 9.5 * Math.sqrt(JX.settings.walk) : 8.5);
      else e.ph = 0.5;
      e.blink -= dt; if (e.blink < -0.13) e.blink = 2.5 + Math.random() * 4;
    });
    for (let i = W.bubbles.length - 1; i >= 0; i--) { W.bubbles[i].t -= dt; if (W.bubbles[i].t <= 0) W.bubbles.splice(i, 1); }
    if (W.clickMark) { W.clickMark.t -= dt; if (W.clickMark.t <= 0) W.clickMark = null; }
    /* 镜头 */
    W.god += ((W.godOn ? 1 : 0) - W.god) * Math.min(1, dt * 7);
    const fit = Math.min(JX.W / sc.w, JX.H / sc.h) * 0.9, z = JX.lerp(W.zoom || 1, fit, W.god);
    const f = W.focus || p || { x: sc.w / 2, y: sc.h / 2 };
    const vw = JX.W / z, vh = JX.H / z;
    let cx = f.x - vw / 2, cy = f.y - 70 - vh / 2;
    cx = sc.w <= vw ? (sc.w - vw) / 2 : JX.clamp(cx, 0, sc.w - vw); cy = sc.h <= vh ? (sc.h - vh) / 2 : JX.clamp(cy, 0, sc.h - vh + (f.below || 0));      // focus.below：这一个镜头许它探出场景下沿多少（二楼栏杆外的天井）
    const k = W.camSnap ? 1 : Math.min(1, dt * 6);
    W.cam.x += (cx - W.cam.x) * k; W.cam.y += (cy - W.cam.y) * k; W.cam.z = z; W.camSnap = false;
    if (sc.w > vw) W.cam.x = JX.clamp(W.cam.x, 0, sc.w - vw); if (sc.h > vh) W.cam.y = JX.clamp(W.cam.y, 0, sc.h - vh + (f.below || 0));      // 镜头拉远的那一瞬（战斗收场）也不许探出场景外面
    /* 路线指引：每 0.3 秒重算一次 */
    W.guideAt -= dt;
    if (W.guideAt <= 0) {
      W.guideAt = 0.3; W.guide = null;
      const tt = p ? W.objTarget() : null, t = JX.settings.guide ? tt : null, o = W.objective;
      if (t) { const off = t.ent ? 44 : 0, gx = t.hot && t.hot.gx != null ? t.hot.gx : t.x, gy = t.hot && t.hot.gy != null ? t.hot.gy : t.y + off; W.guide = { path: W.findPath(p.x, p.y, gx, gy) || [], t }; }
      /* 左上角提示的最后一行：这一步具体怎么做 */
      if (JX.ui.objHow) JX.ui.objHow(!o ? '' : o.how != null && (JX.settings.guide || !tt) ? o.how : !tt ? '' : !JX.settings.guide ? '路线指引关着，按 H 打开' : (tt.ent || tt.hot) ? '跟着地上的金色路标走到跟前，按回车' : '跟着地上的金色路标走过去');
    }
    stepParts(dt);
    if (sc.update) sc.update(W, dt);
  }
  W.snapCam = () => { W.camSnap = true; };
  W.travel = async function (to, spawn) {
    if (W.traveling) return; W.traveling = true; const was = W.locked; W.locked = true;
    JX.audio && JX.audio.sfx('door');
    await JX.ui.fade(1, 0.28); W.load(to, spawn); JX.emit('travel', to); await JX.ui.fade(0, 0.32);
    W.locked = was; W.traveling = false;
  };

  /* ---------- 粒子：雪、雨、落灯花、微尘 ---------- */
  W.initParts = function (kind) {
    W.partKind = kind || null; W.parts = [];
    const n = kind === 'snow' ? 230 : kind === 'rain' ? 280 : kind === 'embers' ? 70 : kind === 'dust' ? 46 : 0, r = JX.rng(99);
    for (let i = 0; i < n; i++) W.parts.push({ x: r() * JX.W, y: r() * JX.H, s: 0.5 + r(), ph: r() * 6.28, v: 0.6 + r() * 0.8 });
  };
  function stepParts(dt) {
    const k = W.partKind; if (!k) return;
    W.parts.forEach(q => {
      if (k === 'snow') { q.y += (46 + q.s * 60) * q.v * dt; q.x += (Math.sin(JX.time * 0.7 + q.ph) * 16 - 22) * dt; }
      else if (k === 'rain') { q.y += (900 + q.s * 520) * dt; q.x -= (170 + q.s * 90) * dt; }
      else if (k === 'embers') { q.y += (22 + q.s * 26) * q.v * dt; q.x += Math.sin(JX.time * 0.9 + q.ph) * 14 * dt; }
      else { q.y -= 5 * q.v * dt; q.x += Math.sin(JX.time * 0.4 + q.ph) * 6 * dt; }
      if (q.y > JX.H + 10) { q.y = -10; q.x = Math.random() * JX.W; } if (q.y < -12) q.y = JX.H + 8;
      if (q.x < -10) q.x += JX.W + 20; if (q.x > JX.W + 10) q.x -= JX.W + 20;
    });
  }
  const glowCache = {};
  function glowSprite(col) {
    if (glowCache[col]) return glowCache[col];
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, P.rgba(col, 0.9)); g.addColorStop(0.25, P.rgba(col, 0.38)); g.addColorStop(0.6, P.rgba(col, 0.1)); g.addColorStop(1, P.rgba(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, 128, 128); return (glowCache[col] = cv);
  }
  W.glowSprite = glowSprite;

  /* ---------- 绘制 ---------- */
  function label(c, text, x, y, size, col) {
    c.font = '600 ' + size + 'px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = size * 0.22; c.strokeStyle = 'rgba(20,12,8,0.85)'; c.lineJoin = 'round'; c.strokeText(text, x, y);
    c.fillStyle = col || '#f6e9c8'; c.fillText(text, x, y);
  }
  function drawEnt(c, e) {
    if (e.vis === false) return;
    c.save(); c.translate(e.x, e.y - (e.z || 0)); if (e.alpha < 1) c.globalAlpha = e.alpha;
    if (e.draw) e.draw(c, e);
    else Fig.draw(c, e.sp, e.dir, e.ph, { moving: e.moving, pose: e.pose, carry: e.carry, seat: e.seat, closed: e.closed || e.blink < 0, smile: e.smile, shadow: !e.pose || e.pose === 'squat' });
    c.restore();
  }
  function draw() {
    const c = JX.ctx, S = JX.S, sc = W.sc, cw = JX.canvas.width, ch = JX.canvas.height;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.fillStyle = (sc && sc.outside) || '#0b0908'; c.fillRect(0, 0, cw, ch);
    if (!sc || !W.bg) return;
    const z = W.cam.z, t = JX.time;
    c.setTransform(S * z, 0, 0, S * z, -W.cam.x * S * z, -W.cam.y * S * z);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(W.bg, 0, 0, sc.w, sc.h);
    if (sc.below && W.cam.y + JX.H / z > sc.h + 1) sc.below(c, t, W);
    if (sc.under) sc.under(c, t, W);
    const list = [];
    W.sprites.forEach(s => list.push(s)); W.ents.forEach(e => list.push(e));
    list.sort((a, b) => (a.sy == null ? a.y : a.sy) - (b.sy == null ? b.y : b.sy));
    for (const it of list) { if (it.cv) c.drawImage(it.cv, it.x, it.y, it.w, it.h); else drawEnt(c, it); }
    if (sc.anim) sc.anim(c, t, W);
    c.globalCompositeOperation = 'multiply'; c.drawImage(W.lm, 0, 0, sc.w, sc.h);
    c.globalCompositeOperation = 'lighter';
    (sc.lights || []).forEach((L, i) => {
      if (!L.glow) return;
      const fl = 1 + Math.sin(t * (5 + (i % 5)) + i * 1.7) * 0.05 + Math.sin(t * 13.1 + i) * 0.03, gr = L.glow * fl;
      c.globalAlpha = (L.ga == null ? 0.85 : L.ga) * fl; c.drawImage(glowSprite(L.gc || L.c || '#ffd9a0'), (L.gx == null ? L.x : L.gx) - gr, (L.gy == null ? L.y : L.gy) - gr, gr * 2, gr * 2);
    });
    c.globalAlpha = 1;
    if (sc.glow) sc.glow(c, t, W);
    c.globalCompositeOperation = 'source-over';
    if (sc.top) sc.top(c, t, W);
    /* 路线指引 */
    if (W.guide && !W.locked && W.guide.t) {
      const g = W.guide, pts = [{ x: W.player.x, y: W.player.y }].concat(g.path);
      let acc = -30, n = 0; const off = (t * 60) % 52;
      for (let i = 1; i < pts.length && n < 16; i++) {
        const a = pts[i - 1], b = pts[i], d = JX.dist(a.x, a.y, b.x, b.y); if (d < 0.01) continue;
        let s = (52 - (acc % 52) + off) % 52; if (acc < 0) s = Math.max(s, -acc);
        for (; s < d && n < 16; s += 52, n++) {
          const x = a.x + (b.x - a.x) * s / d, y = a.y + (b.y - a.y) * s / d, al = 0.85 - n * 0.045;
          c.save(); c.translate(x, y); c.scale(1, 0.55); c.rotate(Math.PI / 4);
          c.fillStyle = 'rgba(255,214,120,' + al + ')'; c.fillRect(-6.5, -6.5, 13, 13); c.strokeStyle = 'rgba(120,40,20,' + al + ')'; c.lineWidth = 1.6; c.strokeRect(-6.5, -6.5, 13, 13); c.restore();
        }
        acc += d;
      }
      const tx = g.t.x, ty = g.t.ent ? g.t.y - (g.t.ent.sp.h || 150) * (g.t.ent.pose ? 0.82 : 1) - 44 : g.t.y - (g.t.hot ? (g.t.hot.up || 110) + 30 : 60), bob = Math.sin(t * 4) * 6;
      c.save(); c.translate(tx, ty + bob); c.fillStyle = '#ffd778'; c.strokeStyle = '#7a2a16'; c.lineWidth = 2.4; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(0, 16); c.lineTo(-12, -2); c.lineTo(-5, -2); c.lineTo(-5, -16); c.lineTo(5, -16); c.lineTo(5, -2); c.lineTo(12, -2); c.closePath(); c.fill(); c.stroke(); c.restore();
    }
    if (W.clickMark) { const m = W.clickMark; c.strokeStyle = 'rgba(255,220,140,' + m.t + ')'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(m.x, m.y, 26 * (1.2 - m.t), 11 * (1.2 - m.t), 0, 0, Math.PI * 2); c.stroke(); }
    /* 可互动的提示 */
    if (W.near && !W.locked && W.god < 0.3) {
      const n = W.near, txt = '⏎ ' + n.label; c.font = '600 22px ' + P.KAI; const tw = c.measureText(txt).width + 26, bob = Math.sin(t * 3) * 2;
      c.fillStyle = 'rgba(34,22,14,0.86)'; c.strokeStyle = 'rgba(215,165,68,0.9)'; c.lineWidth = 1.6;
      c.beginPath(); c.roundRect(n.x - tw / 2, n.y - 18 + bob, tw, 34, 9); c.fill(); c.stroke();
      c.fillStyle = '#f6e9c8'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, n.x, n.y + bob);
    }
    /* 头顶的话 */
    W.bubbles.forEach(b => {
      const e = b.e; if (!e) return; const a = Math.min(1, b.t * 3, (b.d - b.t) * 6);
      c.globalAlpha = a; c.font = '24px ' + P.KAI; const lines = b.text.split('\n'), tw = Math.max.apply(null, lines.map(l => c.measureText(l).width)) + 32, th = lines.length * 32 + 16;
      const x = e.x, y = e.y - (e.sp.h || 150) * (e.pose ? 0.82 : 1) - 28 - th;
      c.fillStyle = 'rgba(246,236,210,0.96)'; c.strokeStyle = 'rgba(60,40,26,0.9)'; c.lineWidth = 1.8;
      c.beginPath(); c.roundRect(x - tw / 2, y, tw, th, 12); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x - 8, y + th - 1); c.lineTo(x, y + th + 12); c.lineTo(x + 8, y + th - 1); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(246,236,210,1)'; c.fillRect(x - 7, y + th - 3, 14, 4);
      c.fillStyle = '#2b221c'; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((l, i) => c.fillText(l, x, y + 25 + i * 32));
      c.globalAlpha = 1;
    });
    if (W.talker && W.talker.vis !== false) {
      const e = W.talker, y = e.y - (e.z || 0) - (e.sp.h || 150) * (e.pose ? 0.82 : 1) - 30 + Math.sin(t * 5) * 4;      // 人被抬高了（站在瓮里、跳起来）时，说话的小泡泡也跟着抬高，不压在脸上
      c.fillStyle = '#f6e9c8'; c.strokeStyle = 'rgba(60,40,26,0.9)'; c.lineWidth = 1.6; c.beginPath(); c.roundRect(e.x - 21, y - 15, 42, 24, 11); c.fill(); c.stroke();
      c.fillStyle = '#8e2a20'; for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(e.x + i * 10, y - 3, 2.6 + (Math.floor(t * 4) % 3 === i + 1 ? 1 : 0), 0, 6.3); c.fill(); }
    }
    /* 俯瞰时的标注 */
    if (W.god > 0.5) {
      const a = (W.god - 0.5) * 2, k = 1 / z; c.globalAlpha = a;
      (sc.exits || []).forEach(x => { if (x.label) label(c, '⇨ ' + x.label, x.lx == null ? x.x + x.w / 2 : x.lx, x.ly == null ? x.y + x.h / 2 : x.ly, 26 * k, '#ffe2a0'); });
      W.ents.forEach(e => { if (e.vis !== false && (e.isPlayer || e.tag)) label(c, e.isPlayer ? '你' : e.tag, e.x, e.y - (e.sp.h || 150) * (e.pose ? 0.82 : 1) - 26 * k, 24 * k, e.isPlayer ? '#ffffff' : '#f6e9c8'); });
      (sc.marks || []).forEach(m => label(c, m.t, m.x, m.y, 24 * k, '#d9e6ea'));
      c.globalAlpha = 1;
    }
    /* 粒子：画在屏幕坐标里 */
    if (W.partKind) {
      c.setTransform(S, 0, 0, S, 0, 0);
      if (W.partKind === 'snow') { c.fillStyle = '#f6f8fb'; W.parts.forEach(q => { c.globalAlpha = 0.35 + q.s * 0.4; c.beginPath(); c.arc(q.x, q.y, 1.4 + q.s * 2.4, 0, 6.3); c.fill(); }); }
      else if (W.partKind === 'rain') { c.strokeStyle = '#e4eef2'; c.lineWidth = 1.3; W.parts.forEach(q => { c.globalAlpha = 0.22 + q.s * 0.2; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - 5 - q.s * 3, q.y + 26 + q.s * 16); c.stroke(); }); }
      else if (W.partKind === 'embers') { c.globalCompositeOperation = 'lighter'; const gs = glowSprite('#ffb866'); W.parts.forEach(q => { const tw = 0.5 + 0.5 * Math.sin(t * 3 + q.ph); c.globalAlpha = 0.25 + tw * 0.5; const r = 5 + q.s * 7; c.drawImage(gs, q.x - r, q.y - r, r * 2, r * 2); }); }
      else { c.globalCompositeOperation = 'lighter'; const gs = glowSprite('#ffe0a8'); W.parts.forEach(q => { c.globalAlpha = 0.1 + 0.12 * Math.sin(t + q.ph) ** 2; const r = 3 + q.s * 3; c.drawImage(gs, q.x - r, q.y - r, r * 2, r * 2); }); }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
  }
  JX.on('update', update);
  JX.on('draw', draw);
})();
