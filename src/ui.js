/* 界面：对白、旁白、字幕、题词、选择、教学、指引、菜单、标题。全部是页面元素，叠在画布上，随舞台整体缩放。 */
'use strict';
(function () {
  const JX = window.JX, el = JX.el, Fig = JX.Fig;
  const UI = JX.ui = { modal: 0 };
  let root, obj, keys, banner, toast, dlg, narr, cap, card, choiceBox, tut, purse;

  UI.init = function () {
    root = JX.uiRoot;
    obj = root.appendChild(el('div', 'hide')); obj.id = 'obj';
    purse = root.appendChild(el('div', 'hide')); purse.id = 'purse';
    keys = root.appendChild(el('div', 'hide', '方向键 / WASD 走动　回车 互动　H 指引　V 俯瞰　F 全屏　Esc 菜单')); keys.id = 'keys';
    banner = root.appendChild(el('div', '', '<div class="n"></div><div class="l"></div><div class="s"></div>')); banner.id = 'banner';
    toast = root.appendChild(el('div', '', '<span></span>')); toast.id = 'toast';
    cap = root.appendChild(el('div', '', '<div class="t"></div><div class="s"></div>')); cap.id = 'cap';
    card = root.appendChild(el('div', 'hide')); card.id = 'card';
    dlg = root.appendChild(el('div', 'hide', '<div class="box"></div><canvas class="med" width="380" height="436"></canvas><div class="name"></div><div class="body"></div><div class="next">▾</div>')); dlg.id = 'dlg';
    narr = root.appendChild(el('div', 'hide', '<div class="txt"></div><div class="next">▾</div>')); narr.id = 'narr';
    choiceBox = root.appendChild(el('div', 'hide')); choiceBox.id = 'choice';
    tut = root.appendChild(el('div', 'hide')); tut.id = 'tut';
    UI.applyText();
    JX.on('sceneEnter', sc => { if (!UI.quiet) UI.banner(sc.name, sc.sub); else { clearTimeout(UI._bt); banner.style.opacity = 0; } });      // 不打场景名的时候，把上一场还没退的那块也收掉
  };
  UI.applyText = () => { root.style.setProperty('--ts', JX.settings.text); root.style.setProperty('--da', JX.settings.dlgAlpha); UI.applyLook(); };
  /* 整体亮度与回忆的旧绢色调，都落在画布的滤镜上 */
  UI.applyLook = () => { if (JX.canvas) JX.canvas.style.filter = (UI._sepia ? 'sepia(.5) saturate(.62) contrast(.96) ' : '') + 'brightness(' + (JX.settings.bright * (UI._sepia ? 1.05 : 1)).toFixed(3) + ')'; };

  /* 等玩家按确认或点一下；自动测试时自己往下走 */
  function waitConfirm(minSec) {
    return new Promise(res => {
      let t = 0;
      const tick = dt => {
        if (menu) return;                                       // 菜单开着的时候，对白不往下走
        t += dt;
        if (t < (minSec || 0.12)) return;
        if (JX.auto ? t > (JX.autoDelay || 0.05) : (JX.input.hit('confirm') || JX.input.clicks.length)) { JX.input.eat('confirm'); off(); res(); }
      };
      const hs = JX._upd = JX._upd || []; hs.push(tick);
      const off = () => hs.splice(hs.indexOf(tick), 1);
    });
  }
  JX.on('update', dt => { (JX._upd || []).slice().forEach(f => f(dt)); });
  UI.waitConfirm = waitConfirm;

  UI.fade = function (to, sec) {
    const f = document.getElementById('fade'), from = parseFloat(f.style.opacity === '' ? 1 : f.style.opacity);
    const tok = UI._fadeTok = (UI._fadeTok || 0) + 1;              // 新的一次渐变开始，旧的就不再动它
    if (!sec) { f.style.opacity = to; return Promise.resolve(); }
    return JX.tween(sec, k => { if (tok === UI._fadeTok) f.style.opacity = from + (to - from) * k; });
  };
  UI.tone = function (kind) {
    UI._sepia = kind === 'sepia'; UI.applyLook(); document.getElementById('tone').classList.toggle('sepia', UI._sepia);
  };
  UI.banner = function (name, sub) {
    banner.querySelector('.n').textContent = name || ''; banner.querySelector('.s').textContent = sub || '';
    banner.style.opacity = 1; clearTimeout(UI._bt); UI._bt = setTimeout(() => { banner.style.opacity = 0; }, 2400);
  };
  UI.toast = function (text, sec) {
    toast.firstChild.textContent = text; toast.style.opacity = 1; clearTimeout(UI._tt); UI._tt = setTimeout(() => { toast.style.opacity = 0; }, (sec || 2.2) * 1000);
  };
  /* 左上角的“下一步”：一行要做的事，下面可以带几行补充（detail），最后一行是怎么做（objHow，世界那边按目标自动填） */
  UI.objective = function (text, detail) {
    if (!text) { obj.classList.add('hide'); return; }
    const d = detail ? (Array.isArray(detail) ? detail : [detail]) : [];
    obj.innerHTML = '<div class="k">下一步</div><div class="t">' + JX.esc(text) + '</div>' + (d.length ? '<div class="d">' + d.map(JX.esc).join('<br>') + '</div>' : '') + '<div class="h hide"></div>';
    obj.classList.remove('hide'); UI.objHow(UI._how || '');
  };
  UI.objHow = function (text) { UI._how = text; const h = obj.querySelector('.h'); if (!h) return; if (h.textContent !== text) h.textContent = text; h.classList.toggle('hide', !text); };
  UI.roam = function (on) { keys.classList.toggle('hide', !on); };
  UI.purse = function (n) { if (n == null) purse.classList.add('hide'); else { purse.textContent = '赏钱 ' + n + ' 文'; purse.classList.remove('hide'); } };

  /* ---------- 对白 ---------- */
  function typeInto(node, text) {
    const chars = []; let paren = false;
    for (const ch of text) { if (ch === '（') paren = true; chars.push([ch, paren]); if (ch === '）') paren = false; }
    const render = n => { let h = '', open = false; for (let i = 0; i < n; i++) { const [ch, p] = chars[i]; if (p && !open) { h += '<i>'; open = true; } if (!p && open) { h += '</i>'; open = false; } h += JX.esc(ch); } if (open) h += '</i>'; node.innerHTML = h; };
    return new Promise(res => {
      let shown = 0, t = 0, done = false;
      const tick = dt => {
        if (menu) return;                                       // 菜单开着的时候，对白停在原处
        t += dt;
        if (!done) {
          shown = Math.min(chars.length, shown + dt * 46 * JX.settings.textSpeed);
          if (JX.auto || (t > 0.1 && (JX.input.hit('confirm') || JX.input.clicks.length))) { shown = chars.length; JX.input.eat('confirm'); JX.input.clicks.length = 0; }
          render(Math.floor(shown));
          if (shown >= chars.length) { done = true; t = 0; }
        } else if (JX.auto ? t > (JX.autoDelay || 0.05) : (t > 0.12 && (JX.input.hit('confirm') || JX.input.clicks.length))) { JX.input.eat('confirm'); hs.splice(hs.indexOf(tick), 1); res(); }
      };
      const hs = JX._upd = JX._upd || []; hs.push(tick);
    });
  }
  UI.say = async function (id, name, text, mood) {
    UI.modal++;
    narr.classList.add('hide'); dlg.classList.remove('hide');
    const cv = dlg.querySelector('.med'), c = cv.getContext('2d');
    const art = id && JX.Art && JX.Art.has(id) ? JX.Art.avatar(id, mood) : null;      // 主角用单独画的头像，其余人用小像
    const med = !art && id && Fig.cast[id] ? Fig.medallion(id) : null;
    dlg.classList.toggle('nomed', !art && !med);
    cv.style.display = art || med ? '' : 'none';
    c.clearRect(0, 0, cv.width, cv.height);
    if (art) c.drawImage(art, 0, 0, cv.width, cv.height); else if (med) c.drawImage(med, 34, 116, 312, 312);
    dlg.querySelector('.name').textContent = name;
    JX.audio && JX.audio.sfx('page');
    await typeInto(dlg.querySelector('.body'), text);
    dlg.classList.add('hide'); UI.modal--;
  };
  UI.narrate = async function (text) {
    UI.modal++;
    dlg.classList.add('hide'); narr.classList.remove('hide');
    await typeInto(narr.querySelector('.txt'), text);
    narr.classList.add('hide'); UI.modal--;
  };
  UI.caption = async function (text, sub, hold) {
    UI.modal++; const shown = !purse.classList.contains('hide'); purse.classList.add('hide');      // 字幕是黑底上的一行字，赏钱先收起来
    cap.querySelector('.t').textContent = text; cap.querySelector('.s').textContent = sub || '';
    cap.style.opacity = 1; await JX.sleep(JX.auto ? 0.05 : 1.0);
    await Promise.race([waitConfirm(0.3), JX.sleep(hold || 4.2)]);
    cap.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.9); UI.modal--; if (shown) purse.classList.remove('hide');
  };
  UI.card = async function (head, lines, src) {
    UI.modal++;
    card.innerHTML = '<div class="scroll">' + (head ? '<div class="head">' + JX.esc(head) + '</div>' : '') + lines.map(l => '<div class="col">' + JX.esc(l) + '</div>').join('') + (src ? '<div class="src">' + JX.esc(src) + '</div>' : '') + '<div class="seal">惊蛰卷</div></div>';
    card.classList.remove('hide'); card.style.opacity = 0; void card.offsetWidth; card.style.opacity = 1;
    JX.audio && JX.audio.sfx('gong');
    await JX.sleep(JX.auto ? 0.05 : 1.1); await Promise.race([waitConfirm(0.3), JX.sleep(7)]);
    card.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 1); card.classList.add('hide'); UI.modal--;
  };
  UI.choice = function (q, opts) {
    UI.modal++;
    return new Promise(res => {
      choiceBox.innerHTML = (q ? '<div class="q">' + JX.esc(q) + '</div>' : '');
      let sel = 0; const btns = opts.map((o, i) => { const b = el('div', 'btn jx-clickable', JX.esc(o)); b.onclick = () => finish(i); choiceBox.appendChild(b); return b; });
      const paint = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel)); paint();
      choiceBox.classList.remove('hide');
      const tick = () => {
        if (JX.auto) return finish(JX.autoChoice ? JX.autoChoice(q, opts) : 0);
        if (menu) return;
        if (JX.input.hit('up') || JX.input.hit('w')) { sel = (sel + opts.length - 1) % opts.length; paint(); }
        if (JX.input.hit('down') || JX.input.hit('s')) { sel = (sel + 1) % opts.length; paint(); }
        if (JX.input.hit('confirm')) { JX.input.eat('confirm'); finish(sel); }
      };
      const hs = JX._upd = JX._upd || []; hs.push(tick);
      function finish(i) { const k = hs.indexOf(tick); if (k >= 0) hs.splice(k, 1); choiceBox.classList.add('hide'); UI.modal--; JX.audio && JX.audio.sfx('tick'); res(i); }
    });
  };
  UI.tutorial = async function (title, html) {
    UI.modal++;
    tut.innerHTML = '<h3>' + JX.esc(title) + '</h3><p>' + html + '</p><div class="ok">回车 知道了 ▾</div>';
    tut.classList.remove('hide'); await waitConfirm(0.4); tut.classList.add('hide'); UI.modal--;
  };

  /* ---------- 菜单 ---------- */
  const MOVES = ['挑灯看剑', '吹角连营', '霹雳弦惊', '蓦然回首', '几番风雨', '气吞万里'];
  let menu = null, tab = 0;
  UI.menuOpen = () => !!menu;
  UI.toggleMenu = function () {
    if (menu) { menu.remove(); menu = null; UI.modal--; return; }
    UI.modal++; menu = root.appendChild(el('div', 'panel')); menu.id = 'menu'; renderMenu();
  };
  function optRow(label, key, opts) {
    return '<div class="row"><span>' + label + '</span><span class="opts">' + opts.map(o => '<span class="jx-clickable' + (JX.settings[key] === o[0] ? ' on' : '') + '" data-k="' + key + '" data-v="' + o[0] + '">' + o[1] + '</span>').join('') + '</span></div>';
  }
  function renderMenu() {
    const st = JX.state, tabs = ['人物', '设置', '存档', '场次'];
    const show = JX.game.playing ? [0, 1, 2, 3] : [3, 1];      // 标题画面上开的：只有选场和设置
    if (show.indexOf(tab) < 0) tab = show[0];
    let h = '<div class="tabs">' + show.map(i => '<div class="tab jx-clickable' + (i === tab ? ' on' : '') + '" data-tab="' + i + '">' + tabs[i] + '</div>').join('') + '</div>';
    if (tab === 0) {
      const mx = st.maxed;
      h += '<div class="stat"><canvas width="380" height="436"></canvas><div><table>' +
        '<tr><td>姓名</td><td>阿蛰（户籍上写的是阮蛰）</td></tr><tr><td>身份</td><td>醉春楼 · 行菜</td></tr>' +
        '<tr><td>境界</td><td>' + (mx ? '得道（坐忘七阶之末）' : '不入流——至少看上去是') + '</td></tr>' +
        '<tr><td>气血</td><td>' + (mx ? 9999 : 120) + '</td></tr><tr><td>内力</td><td>' + (mx ? 999 : 30) + '</td></tr><tr><td>身法</td><td>' + (mx ? 255 : 18) + '</td></tr>' +
        '<tr><td>赏钱</td><td>' + (st.money || 0) + ' 文</td></tr></table></div></div>' +
        '<div class="moves">稼轩剑　' + MOVES.map((m, i) => '<span class="' + (mx ? 'got' : '') + '">' + m + '</span>').join('') + '</div>' +
        '<p style="margin-top:18px">' + (mx ? '功力已经全开：六式稼轩剑与满级内力都在身上。战斗从第六场起接入，到时直接生效。' : '想跳过修炼，可以一键把功力提到满级。按下之前会自动存一次档。') + '</p>' +
        '<div class="btn small jx-clickable' + (mx ? ' off' : '') + '" data-act="max">' + (mx ? '功力已全开' : '功力全开') + '</div><div class="btn small jx-clickable" data-act="gallery">人物图鉴 · 配乐</div>';
    } else if (tab === 1) {
      h += optRow('行走速度', 'walk', [[0.6, '慢'], [0.8, '稍慢'], [1, '中'], [1.3, '快']]) +
        optRow('操作方式', 'controls', [['rel', 'W 前进 · A/D 转向 · S 掉头'], ['abs', 'WASD 四向']]) +
        optRow('文字大小', 'text', [[0.85, '小'], [1, '中'], [1.15, '大']]) +
        optRow('出字速度', 'textSpeed', [[0.6, '慢'], [1, '中'], [2, '快'], [50, '立刻']]) +
        optRow('音乐音量', 'music', [[0, '关'], [0.35, '小'], [0.7, '中'], [1, '大']]) +
        optRow('音效音量', 'sfx', [[0, '关'], [0.4, '小'], [0.8, '中'], [1, '大']]) +
        optRow('路线指引', 'guide', [[true, '开'], [false, '关']]) +
        optRow('画面亮度', 'bright', [[1, '标准'], [1.1, '亮'], [1.22, '更亮']]) +
        optRow('对话框', 'dlgAlpha', [[0.94, '不透明'], [0.72, '半透明'], [0.5, '更透']]) +
        '<p style="font-size:24px;color:#7a5d3a">方向键任何时候都是四个固定方向。俯瞰（V）时点地面，人会自己走过去。</p>';
    } else if (tab === 3) {
      const all = JX.story.scenes(), cur = JX.game.playing ? all.indexOf(st.label) : -1, nx = all[cur + 1];
      const chap = l => (l.indexOf('第一章·') === 0 ? '第一章　钗头凤' : '序章　青玉案'), short = l => l.replace(/^第一章·/, '');
      const groups = []; all.forEach((l, i) => { const g = chap(l); if (!groups.length || groups[groups.length - 1].name !== g) groups.push({ name: g, items: [] }); groups[groups.length - 1].items.push([l, i]); });
      h += '<p style="font-size:23px;line-height:1.4;margin:0 0 4px">测试用：点哪一场，就跳到那一场的开头。游戏里随时可按 <kbd>]</kbd> 下一场、<kbd>[</kbd> 上一场。</p>' +
        (all.length ? '' : '<p style="color:#8e2a20">场次表没有载入到。<span class="btn small jx-clickable" data-act="title">重新载入页面</span></p>') +
        '<div class="scwrap">' + groups.map(g => '<div class="grp">' + g.name + '</div><div class="scenes">' + g.items.map(([l, i]) => '<div class="sc jx-clickable' + (i === cur ? ' on' : '') + '" data-jump="' + i + '">' + JX.esc(short(l)) + (i === cur ? '<i>现在</i>' : '') + '</div>').join('') + '</div>').join('') + '</div>' +
        (cur >= 0 ? '<div class="btn small jx-clickable' + (nx ? '' : ' off') + '" data-act="next">' + (nx ? '跳到下一场 ▶　' + JX.esc(short(nx)) : '已经是最后一场') + '</div><div class="btn small jx-clickable" data-act="again">这一场从头再来</div>' : '');
    } else {
      const s = JX.store.get('save');
      h += '<p>进度在每一场开头自动保存，存在这台电脑的这个浏览器里。读档后从那一场的开头接着玩。</p>' +
        '<p>' + (s ? '现有存档：<b>' + JX.esc(s.label) + '</b>　' + JX.esc(s.when || '') : '还没有存档。') + '</p>' +
        '<div class="btn small jx-clickable" data-act="title">回到标题画面</div>';
    }
    h += '<div class="foot"><span>《剑仙情缘恩仇录》试玩 ' + JX.VERSION + '</span><span class="jx-clickable" data-act="close" style="color:#8e2a20;font-size:28px">Esc 关闭</span></div>';
    menu.innerHTML = h;
    if (tab === 0) { const c = menu.querySelector('canvas').getContext('2d'); if (JX.Art && JX.Art.has('jingzhe')) c.drawImage(JX.Art.avatar('jingzhe'), 0, 0, 380, 436); else c.drawImage(Fig.medallion('jingzhe'), 10, 76, 360, 360); }
    menu.onclick = e => {
      const t = e.target.closest('[data-tab],[data-k],[data-act],[data-jump]'); if (!t) return;
      JX.audio && JX.audio.sfx('tick');
      if (t.dataset.tab) { tab = +t.dataset.tab; renderMenu(); }
      else if (t.dataset.jump) JX.story.jump(JX.story.scenes()[+t.dataset.jump]);
      else if (t.dataset.act === 'next') JX.story.jumpBy(1);
      else if (t.dataset.act === 'again') JX.story.jumpBy(0);
      else if (t.dataset.k) {
        let v = t.dataset.v; v = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v;
        JX.settings[t.dataset.k] = v; JX.saveSettings(); UI.applyText(); JX.audio && JX.audio.applyVolume(); renderMenu();
      } else if (t.dataset.act === 'close') UI.toggleMenu();
      else if (t.dataset.act === 'title') location.reload();
      else if (t.dataset.act === 'gallery') { UI.toggleMenu(); UI.gallery(null, () => { JX.audio.hold = false; const sc = JX.world.sc; if (sc && sc.music) JX.audio.music(sc.music, sc.muffle); }); }
      else if (t.dataset.act === 'max' && !JX.state.maxed) { JX.story.save(); JX.state.maxed = true; JX.story.save(); JX.audio && JX.audio.sfx('gong'); UI.toast('功力全开'); renderMenu(); }
    };
  }
  JX.on('update', () => {
    if (menu && (JX.input.hit('menu') || JX.input.hit('cancel'))) { JX.input.eat('menu'); JX.input.eat('cancel'); UI.toggleMenu(); }
    else if (!menu && !UI.galleryOpen() && JX.game && JX.game.playing && !document.getElementById('mini') && JX.input.hit('menu')) { JX.input.eat('menu'); JX.input.eat('cancel'); UI.toggleMenu(); }      // 对白、演出、战斗里也能开（出菜口那块小面板自己用 Esc，除外）
    /* 测试用的跳场键：] 下一场，[ 上一场 */
    if (JX.game && JX.game.playing && !UI.galleryOpen()) { if (JX.input.hit('BracketRight')) JX.story.jumpBy(1); else if (JX.input.hit('BracketLeft')) JX.story.jumpBy(-1); }
  });
  UI.openScenes = function () { tab = 3; if (!menu) UI.toggleMenu(); else renderMenu(); };

  /* ---------- 标题画面 ---------- */
  UI.title = function () {
    return new Promise(res => {
      const t = root.appendChild(el('div')); t.id = 'title';
      const s = JX.store.get('save');
      t.innerHTML = '<div class="name">剑仙情缘恩仇录</div><div class="sub">卷一　惊蛰　·　序章　·　第一章</div><div class="seal">咸淳三年元夕</div>' +
        '<div class="menu"><div class="btn jx-clickable" data-a="new">新的故事</div>' + (s ? '<div class="btn jx-clickable" data-a="load">接着上回　<span style="font-size:22px;color:#7a5d3a">' + JX.esc(s.label) + '</span></div>' : '') + '<div class="btn jx-clickable" data-a="gallery">人物图鉴 · 配乐</div><div class="btn jx-clickable" data-a="scenes">选一场开始　<span style="font-size:22px;color:#7a5d3a">测试用</span></div><div class="btn small jx-clickable" data-a="full" style="margin-top:18px">全屏显示（F）</div></div>' +
        '<div class="ver">试玩 ' + JX.VERSION + '　·　序章十场，第一章做到第三场　·　建议用 Chrome</div>';
      const btns = [...t.querySelectorAll('.btn:not(.small)')]; let sel = s ? 1 : 0;
      const paint = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel)); paint();
      const finish = a => { hs.splice(hs.indexOf(tick), 1); t.remove(); JX.audio && JX.audio.sfx('gong'); res(a); };
      const gal = p => { JX.audio && JX.audio.sfx('page'); t.classList.add('hide'); UI.gallery(p, () => { t.classList.remove('hide'); JX.audio.hold = true; JX.audio.music('zhuti'); }); };
      const go = a => { if (a === 'full') UI.fullscreen(); else if (a === 'gallery') gal(); else if (a === 'scenes') UI.openScenes(); else finish(a); };
      t.onclick = e => { const b = e.target.closest('[data-a]'); if (b) go(b.dataset.a); };
      if (UI.openGalleryAt != null) { const p = UI.openGalleryAt; UI.openGalleryAt = null; gal(p); }
      const tick = () => {
        if (UI.galleryOpen()) return;
        if (JX.auto) return finish(JX.autoLoad && s ? 'load' : 'new');
        if (menu) return;                                       // “选一场开始”那一页开着
        if (JX.input.hit('up') || JX.input.hit('w')) { sel = (sel + btns.length - 1) % btns.length; paint(); }
        if (JX.input.hit('down') || JX.input.hit('s')) { sel = (sel + 1) % btns.length; paint(); }
        if (JX.input.hit('confirm')) { JX.input.eat('confirm'); go(btns[sel].dataset.a); }
      };
      const hs = JX._upd = JX._upd || []; hs.push(tick);
    });
  };
  /* 全屏：只能由按键或点击触发，被拒绝就算了 */
  UI.fullscreen = function () {
    try { if (document.fullscreenElement) document.exitFullscreen(); else { const p = document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(() => UI.toast('这里不让全屏，可以把窗口拉大')); } } catch (e) { UI.toast('这里不让全屏，可以把窗口拉大'); }
  };
  window.addEventListener('keydown', e => { if (e.code === 'KeyF' && !e.metaKey && !e.ctrlKey) UI.fullscreen(); });
  UI.root = () => root;
})();
