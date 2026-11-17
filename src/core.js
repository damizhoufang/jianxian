/* 剑仙情缘恩仇录 · 核心：命名空间、工具、画布与缩放、输入、主循环
   逻辑坐标一律用 1920×1080 的“单位”，按屏幕实际像素放大绘制（4K 屏上是 2 倍）。 */
'use strict';
(function () {
  const JX = window.JX = { VERSION: '0.4.0', W: 1920, H: 1080, S: 1 };

  /* ---------- 工具 ---------- */
  JX.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  JX.lerp = (a, b, t) => a + (b - a) * t;
  JX.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  JX.ease = {
    io: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: t => 1 - (1 - t) * (1 - t),
    in: t => t * t,
  };
  /* 可重复的随机数（画面每次生成都一样） */
  JX.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  JX.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  JX.esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* ---------- 事件 ---------- */
  const handlers = {};
  JX.on = (name, fn) => { (handlers[name] = handlers[name] || []).push(fn); };
  JX.emit = (name, arg) => { (handlers[name] || []).forEach(fn => fn(arg)); };

  /* ---------- 游戏内计时（随主循环走，切到后台不会乱跳） ---------- */
  const timers = [];
  JX.time = 0;
  JX.sleep = sec => new Promise(res => timers.push({ t: sec, res }));
  /* 逐帧补间：fn(进度 0→1)，返回 Promise */
  JX.tween = (sec, fn, ease) => new Promise(res => timers.push({ t: sec, d: sec, fn, ease: ease || JX.ease.io, res }));
  function stepTimers(dt) {
    for (let i = timers.length - 1; i >= 0; i--) {
      const tm = timers[i];
      tm.t -= dt;
      if (tm.fn) tm.fn(tm.ease(JX.clamp(1 - tm.t / tm.d, 0, 1)));
      if (tm.t <= 0) { timers.splice(i, 1); tm.res(); }
    }
  }
  JX.clearTimers = () => { timers.length = 0; };

  /* ---------- 设置与本机存储（存不了也照常运行） ---------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('jx.' + k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('jx.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem('jx.' + k); } catch (e) { /* 无妨 */ } },
  };
  JX.store = store;
  JX.settings = Object.assign({
    walk: 1,            // 行走速度倍率
    controls: 'rel',    // rel：W 前进、A/D 转向、S 掉头；abs：WASD 直接是四个方向
    text: 1,            // 文字大小倍率
    textSpeed: 1,       // 出字速度
    music: 0.7, sfx: 0.8,
    guide: true,        // 路线指引
    bright: 1.1,        // 画面亮度
    dlgAlpha: 0.72,     // 对话框的不透明度
  }, store.get('settings') || {});
  JX.saveSettings = () => store.set('settings', JX.settings);

  /* ---------- 舞台与画布 ---------- */
  JX.initStage = function () {
    JX.stage = document.getElementById('stage');
    JX.canvas = document.getElementById('world');
    JX.ctx = JX.canvas.getContext('2d');
    JX.uiRoot = document.getElementById('ui');
    const resize = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      let w = vw, h = vw * 9 / 16;
      if (h > vh) { h = vh; w = vh * 16 / 9; }
      JX.stage.style.width = w + 'px'; JX.stage.style.height = h + 'px';
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const pw = Math.max(640, Math.min(3840, Math.round(w * dpr)));
      const changed = JX.canvas.width !== pw;
      if (changed) { JX.canvas.width = pw; JX.canvas.height = Math.round(pw * 9 / 16); }
      JX.S = pw / JX.W;
      JX.cssScale = w / JX.W;
      JX.uiRoot.style.transform = 'scale(' + JX.cssScale + ')';
      if (changed) JX.emit('resize');
    };
    let pending = 0;
    window.addEventListener('resize', () => { clearTimeout(pending); pending = setTimeout(resize, 120); });
    resize();
  };

  /* ---------- 输入 ---------- */
  const down = new Set(), hit = new Set(), heldSince = {};
  const clicks = [];
  const MAP = {
    confirm: ['Enter', 'Space', 'KeyE', 'KeyZ', 'NumpadEnter'],
    cancel: ['Escape', 'KeyX', 'Backspace'],
    up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
    w: ['KeyW'], a: ['KeyA'], s: ['KeyS'], d: ['KeyD'],
    guide: ['KeyH'], god: ['KeyV', 'Tab'], menu: ['Escape', 'KeyM'],
  };
  JX.input = {
    down: name => (MAP[name] || [name]).some(c => down.has(c)),
    hit: name => (MAP[name] || [name]).some(c => hit.has(c)),
    held: name => { let m = 0; (MAP[name] || [name]).forEach(c => { if (down.has(c)) m = Math.max(m, JX.time - heldSince[c]); }); return m; },
    eat: name => (MAP[name] || [name]).forEach(c => hit.delete(c)),
    clicks,
    any: () => hit.size > 0 || clicks.length > 0,
    press(code) { hit.add(code); },             // 给自动测试用
    hold(code, on) { if (on) { if (!down.has(code)) heldSince[code] = JX.time; down.add(code); } else down.delete(code); },
  };
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey) return;
    if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (!down.has(e.code)) { hit.add(e.code); heldSince[e.code] = JX.time; }
    down.add(e.code);
    JX.emit('userGesture');
  });
  window.addEventListener('keyup', e => down.delete(e.code));
  window.addEventListener('blur', () => down.clear());
  JX.bindPointer = function () {
    JX.stage.addEventListener('pointerdown', e => {
      JX.emit('userGesture');
      if (e.target.closest && e.target.closest('.jx-clickable')) return;   // 界面自己的按钮
      const r = JX.stage.getBoundingClientRect();
      clicks.push({ x: (e.clientX - r.left) / r.width * JX.W, y: (e.clientY - r.top) / r.height * JX.H });
    });
  };

  /* ---------- 主循环 ---------- */
  let last = 0;
  JX.fps = 60;
  function frame(now) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    JX.time += dt;
    JX.fps = JX.fps * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
    stepTimers(dt);
    try {
      JX.emit('update', dt);
      JX.emit('draw', dt);
    } catch (err) {
      console.error('[剑仙] 主循环出错', err);
      JX.lastError = String(err && err.stack || err);
    }
    hit.clear(); clicks.length = 0;
    requestAnimationFrame(frame);
  }
  JX.start = () => requestAnimationFrame(frame);
})();
