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
    keys = root.appendChild(el('div', 'hide', '方向键 / WASD 走动　回车 互动　H 指引　V 俯瞰　L 回看　F 全屏　Esc 菜单')); keys.id = 'keys';
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
  UI.purse = function (n) { if (n == null || (JX.state && JX.state.stage > 10)) purse.classList.add('hide'); else {      // 赏钱只在序章（当跑堂的那一晚）有用；出了序章就不再挂在右上角，菜单人物页里还看得到
    purse.textContent = '赏钱 ' + n + ' 文'; purse.classList.remove('hide'); } };

  /* ---------- 对白 ---------- */
  function typeInto(node, text) {
    const chars = []; let paren = false;
    for (const ch of text) { if (ch === '（') paren = true; chars.push([ch, paren]); if (ch === '）') paren = false; }
    const render = n => { let h = '', open = false; for (let i = 0; i < n; i++) { const [ch, p] = chars[i]; if (p && !open) { h += '<i>'; open = true; } if (!p && open) { h += '</i>'; open = false; } h += JX.esc(ch); } if (open) h += '</i>'; node.innerHTML = h; };
    node.innerHTML = '';                                          // 先清掉上一句，免得新名字底下闪一下旧话
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
  UI.log = [];                                                      // 说过的话（对白回看用）：最近八十句
  const logPush = (n, t) => { UI.log.push([n || '', t]); if (UI.log.length > 80) UI.log.shift(); };
  UI.say = async function (id, name, text, mood) {
    UI.modal++; logPush(name, text);
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
    UI.modal++; logPush('', text);
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
  /* 选一项。o 可以不给：sel 是光标先落在第几项，sub 是问题底下的一行小字，auto 是自动测试时选第几项，top 是整个框离画面顶多远（默认 300）。
     刚弹出来的一瞬不收“确定”，免得连按对白时一下子选过去。 */
  UI.choice = function (q, opts, o) {
    o = o || {}; UI.modal++;
    return new Promise(res => {
      choiceBox.innerHTML = (q || o.sub ? '<div class="hd">' + (q ? '<div class="q">' + JX.esc(q) + '</div>' : '') + (o.sub ? '<div class="sub">' + JX.esc(o.sub) + '</div>' : '') + '</div>' : '');
      choiceBox.style.top = (o.top || 300) + 'px';
      let sel = o.sel || 0; const born = JX.time; const btns = opts.map((t, i) => { const b = el('div', 'btn jx-clickable', JX.esc(t)); b.onclick = () => finish(i); b.onmousemove = () => { if (sel !== i) { sel = i; paint(); } }; choiceBox.appendChild(b); return b; });
      const paint = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel)); paint();
      choiceBox.classList.remove('hide');
      const tick = () => {
        if (JX.auto) return finish(JX.autoChoice ? JX.autoChoice(q, opts) : (o.auto || 0));
        if (menu) return;
        if (JX.input.hit('up') || JX.input.hit('w')) { sel = (sel + opts.length - 1) % opts.length; paint(); JX.audio && JX.audio.sfx('page'); }
        if (JX.input.hit('down') || JX.input.hit('s')) { sel = (sel + 1) % opts.length; paint(); JX.audio && JX.audio.sfx('page'); }
        for (let i = 0; i < opts.length; i++) if (JX.input.hit('Digit' + (i + 1)) || JX.input.hit('Numpad' + (i + 1))) { sel = i; paint(); }
        if (JX.input.hit('confirm')) { JX.input.eat('confirm'); if (JX.time - born > 0.4) finish(sel); }
      };
      const hs = JX._upd = JX._upd || []; hs.push(tick);
      function finish(i) { const k = hs.indexOf(tick); if (k >= 0) hs.splice(k, 1); choiceBox.classList.add('hide'); UI.modal--; JX.audio && JX.audio.sfx('tick'); res(i); }
    });
  };
  UI.tutorial = async function (title, html, cls) {
    UI.modal++; tut.className = cls || '';
    tut.innerHTML = '<h3>' + JX.esc(title) + '</h3><p>' + html + '</p><div class="ok">回车 知道了 ▾</div>';
    tut.classList.remove('hide'); await waitConfirm(0.4); tut.classList.add('hide'); UI.modal--;
  };

  /* ---------- 菜单 ---------- */
  const MOVES = ['挑灯看剑', '吹角连营', '霹雳弦惊', '蓦然回首', '几番风雨', '气吞万里'];
  let mem = 0;
  /* 眼下同行的人（菜单人物页用）。数值照战斗里的写；身份只写这时候玩家已经知道的 */
  function party() {
    const st = JX.state, f = st.flags || {}, s = st.stage || 0, L = [];
    L.push({ id: 'jingzhe', name: '陆惊蛰', full: '阿蛰（户籍上写的是阮蛰）', season: '春', hp: 130, spd: 13, atk: 22, def: 6,
      role: s >= 43 ? '醉春楼的行菜——做到今年四月为止' : '醉春楼 · 行菜', nei: f.haoran ? '浩然诀' : '一套“喘气的法子”，没有名字',
      art: '稼轩剑', moves: MOVES.map((n, i) => [n, s >= 42 && i < 3]) });
    if (s >= 8) L.push({ id: 'xiali', name: '夏离', full: s >= 33 ? '夏离（化名；“离”字是真的）' : '夏离', season: '夏', hp: 120, spd: 11, atk: 28, def: 8,
      role: s >= 36 ? '北边来的姑娘。来历，她说到了该说的时候再说' : s >= 23 ? '贩酒的夏掌柜' : '北边口音的客人，自称做生意的', nei: '没有听她说过',
      art: '弯刀与跤', moves: [['弯刀·斩', 1], ['弯刀·格', 1], ['摔', 1]] });
    if (f.tx) L.push({ id: 'tingxue', name: '耶律听雪', full: '耶律听雪', season: '冬', hp: 110, spd: 12, atk: 24, def: 5,
      role: '北边来的小娘子，自称“我爹是宰相”。当保镖抵碗债', nei: '没有听她说过',
      art: '掌', moves: [['绵掌·推', 1], ['闪', 1]].concat(s >= 31 ? [['掌风·压火', 1]] : []) });
    if (f.qsIn) L.push({ id: 'qiushui', name: '辛秋水', full: '辛秋水（软红院里叫阑珊）', season: '秋', hp: 105, spd: 12.5, atk: 26, def: 5,
      role: '辛家的后人。霜降剑如今是她的', nei: '寂照神尼教的',
      art: '霜降剑', moves: [['大珠小珠', 1], ['银瓶乍破', 1], ['冷月无声', 1]] });
    return L;
  }
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
    const st = JX.state, tabs = ['人物', '设置', '存档', '场次', '线索', '回看'];
    const show = JX.game.playing ? [0, 4, 5, 1, 2, 3] : [3, 1];      // 标题画面上开的：只有选场和设置
    if (show.indexOf(tab) < 0) tab = show[0];
    let h = '<div class="tabs">' + show.map(i => '<div class="tab jx-clickable' + (i === tab ? ' on' : '') + '" data-tab="' + i + '">' + tabs[i] + '</div>').join('') + '</div>';
    if (tab === 0) {
      const mx = st.maxed, team = party(); if (mem >= team.length) mem = 0; const m = team[mem];
      h += (team.length > 1 ? '<div class="pty">' + team.map((q, i) => '<span class="jx-clickable' + (i === mem ? ' on' : '') + '" data-mem="' + i + '">' + q.name + ' · ' + q.season + '</span>').join('') + '</div>' : '') +
        '<div class="stat"><canvas width="380" height="436"></canvas><div><table>' +
        '<tr><td>姓名</td><td>' + m.full + '</td></tr><tr><td>身份</td><td>' + m.role + '</td></tr>' +
        '<tr><td>时令</td><td>' + m.season + '（轮到这一季，出手重两成半）</td></tr>' +
        '<tr><td>气血</td><td>' + m.hp + '　　身法 ' + m.spd + '　　攻 ' + m.atk + '　　防 ' + m.def + '</td></tr>' +
        '<tr><td>内功</td><td>' + m.nei + '</td></tr>' +
        (mem === 0 ? '<tr><td>赏钱</td><td>' + (st.money || 0) + ' 文</td></tr>' : '') + '</table></div></div>' +
        '<div class="moves">' + m.art + '　' + m.moves.map(q => '<span class="' + (q[1] ? 'got' : '') + '">' + q[0] + '</span>').join('') + '</div>' +
        '<p style="margin-top:14px">' + (mx ? '功力已经全开：战斗里我方出手重三倍，挨打只算两成半。要讲打法的对手（铁臂、够不着、数弦的）照样得按打法来——照着红字提示按就行。' : '嫌打得慢，可以把功力全开：战斗里我方出手重三倍，挨打只算两成半。随时可以收回。') + '</p>' +
        '<div class="btn small jx-clickable" data-act="max">' + (mx ? '收回功力' : '功力全开') + '</div><div class="btn small jx-clickable" data-act="gallery">人物图鉴 · 配乐</div>';
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
    } else if (tab === 4) {                                         // 线索：眼下要办的事、悬着的事、已经了结的
      const s = st.stage || 0, now = (JX.nows || []).filter(q => s >= q[0]).pop(), all = JX.threads || [];
      const open = all.filter(q => s > q.a && !(q.z && s > q.z)), done = all.filter(q => q.z && s > q.z);
      h += '<div class="scwrap thw"><div class="grp">眼下</div><div class="th now">' + JX.esc(now ? now[1] : '') + '<i>' + JX.esc(st.label || '') + '</i></div>' +
        '<div class="grp">悬着的事</div>' + (open.length ? open.map(q => '<div class="th">' + JX.esc(q.t) + '</div>').reverse().join('') : '<div class="th">眼下还没有。</div>') +
        (done.length ? '<div class="grp">已经了结的</div>' + done.map(q => '<div class="th done">' + JX.esc(q.t) + '<i>' + JX.esc(q.d || '') + '</i></div>').reverse().join('') : '') + '</div>' +
        '<div class="btn small jx-clickable" data-act="map">行程图</div><div class="btn small jx-clickable" data-act="recap">前情提要</div>';
    } else if (tab === 5) {                                         // 回看：说过的话
      h += '<div class="scwrap logw">' + (UI.log.length ? UI.log.map(q => '<div class="lg' + (q[0] ? '' : ' nr') + '">' + (q[0] ? '<b>' + JX.esc(q[0]) + '</b>' : '') + JX.esc(q[1]) + '</div>').join('') : '<div class="lg nr">这一回还没有人说过话。</div>') + '</div>' +
        '<p style="font-size:22px;margin:6px 0 0;color:#7a5d3a">游戏里随时按 <kbd>L</kbd> 打开这一页；<kbd>↑</kbd> <kbd>↓</kbd> 或滚轮翻看，再按一次 <kbd>L</kbd> 收起。只记最近八十句，换一场、重开页面就清空。</p>';
    } else if (tab === 3) {
      const all = JX.story.scenes(), cur = JX.game.playing ? all.indexOf(st.label) : -1, nx = all[cur + 1];
      const CHN = { 一: '钗头凤', 二: '扬州慢', 三: '渔家傲', 四: '望海潮' }, chap = l => { const m = /^第(.)章·/.exec(l); return m ? '第' + m[1] + '章　' + (CHN[m[1]] || '') : '序章　青玉案'; }, short = l => l.replace(/^第.章·/, '');      // 原来只认第一、二章，第三章的十二场排在了第二个“序章”底下
      const groups = []; all.forEach((l, i) => { const g = chap(l); if (!groups.length || groups[groups.length - 1].name !== g) groups.push({ name: g, items: [] }); groups[groups.length - 1].items.push([l, i]); });
      h += '<p style="font-size:23px;line-height:1.4;margin:0 0 4px">点哪一场，就跳到那一场的开头。游戏里随时可按 <kbd>]</kbd> 下一场、<kbd>[</kbd> 上一场。</p>' +
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
    if (tab === 5) { const w = menu.querySelector('.logw'); w.scrollTop = w.scrollHeight; }
    if (tab === 0) { const id = party()[mem].id, c = menu.querySelector('canvas').getContext('2d'); if (JX.Art && JX.Art.has(id)) c.drawImage(JX.Art.avatar(id), 0, 0, 380, 436); else c.drawImage(Fig.medallion(id), 10, 76, 360, 360); }
    menu.onclick = e => {
      const t = e.target.closest('[data-tab],[data-k],[data-act],[data-jump],[data-mem]'); if (!t) return;
      JX.audio && JX.audio.sfx('tick');
      if (t.dataset.tab) { tab = +t.dataset.tab; renderMenu(); }
      else if (t.dataset.mem) { mem = +t.dataset.mem; renderMenu(); }
      else if (t.dataset.jump) JX.story.jump(JX.story.scenes()[+t.dataset.jump]);
      else if (t.dataset.act === 'next') JX.story.jumpBy(1);
      else if (t.dataset.act === 'again') JX.story.jumpBy(0);
      else if (t.dataset.k) {
        let v = t.dataset.v; v = v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v;
        JX.settings[t.dataset.k] = v; JX.saveSettings(); UI.applyText(); JX.audio && JX.audio.applyVolume(); renderMenu();
      } else if (t.dataset.act === 'close') UI.toggleMenu();
      else if (t.dataset.act === 'title') location.reload();
      else if (t.dataset.act === 'map') { UI.toggleMenu(); UI.routeMap && UI.routeMap(); }
      else if (t.dataset.act === 'recap') { UI.toggleMenu(); UI.recap && UI.recap(); }
      else if (t.dataset.act === 'gallery') { UI.toggleMenu(); UI.gallery(null, () => { JX.audio.hold = false; const sc = JX.world.sc; if (sc && sc.music) JX.audio.music(sc.music, sc.muffle); }); }
      else if (t.dataset.act === 'max') { const on = !JX.state.maxed, keep = JX.store.get('save'); JX.state.maxed = on; if (keep) { keep.maxed = on; JX.store.set('save', keep); } JX.audio && JX.audio.sfx(on ? 'gong' : 'tick'); UI.toast(on ? '功力全开' : '功力收回了'); renderMenu(); }      // 只改存档里的这一个开关，进度还是这一场的开头
    };
  }
  JX.on('update', () => {
    if (JX.input.hit('log') && JX.game && JX.game.playing && !UI.galleryOpen() && !document.getElementById('mini') && !UI.overlay) { if (menu && tab === 5) UI.toggleMenu(); else { tab = 5; if (menu) renderMenu(); else UI.toggleMenu(); } return; }      // L：对白回看
    if (menu && (tab === 5 || tab === 4)) { const w = menu.querySelector('.scwrap'); if (w) { if (JX.input.down('up') || JX.input.down('w')) w.scrollTop -= 16; if (JX.input.down('down') || JX.input.down('s')) w.scrollTop += 16; } }
    if (menu && (JX.input.hit('menu') || JX.input.hit('cancel'))) { JX.input.eat('menu'); JX.input.eat('cancel'); UI.toggleMenu(); }
    else if (!menu && !UI.galleryOpen() && JX.game && JX.game.playing && !document.getElementById('mini') && JX.input.hit('menu')) { JX.input.eat('menu'); JX.input.eat('cancel'); UI.toggleMenu(); }      // 对白、演出、战斗里也能开（出菜口那块小面板自己用 Esc，除外）
    /* 跳场键：] 下一场，[ 上一场（原先标着“测试用”；2026-11-21 用户定了正式版也留着） */
    if (JX.game && JX.game.playing && !UI.galleryOpen()) { if (JX.input.hit('BracketRight')) JX.story.jumpBy(1); else if (JX.input.hit('BracketLeft')) JX.story.jumpBy(-1); }
  });
  UI.openScenes = function () { tab = 3; if (!menu) UI.toggleMenu(); else renderMenu(); };

  /* ---------- 标题画面 ---------- */
  UI.title = function () {
    return new Promise(res => {
      const t = root.appendChild(el('div')); t.id = 'title';
      const s = JX.store.get('save');
      t.innerHTML = '<div class="name">剑仙情缘恩仇录</div><div class="sub">卷一　惊蛰　·　序章至第三章</div><div class="seal">咸淳三年元夕</div>' +
        '<div class="menu"><div class="btn jx-clickable" data-a="new">新的故事</div>' + (s ? '<div class="btn jx-clickable" data-a="load">接着上回　<span style="font-size:22px;color:#7a5d3a">' + JX.esc(s.label) + '</span></div>' : '') + '<div class="btn jx-clickable" data-a="gallery">人物图鉴 · 配乐</div><div class="btn jx-clickable" data-a="scenes">选一场开始　<span style="font-size:22px;color:#7a5d3a">测试用</span></div><div class="btn small jx-clickable" data-a="full" style="margin-top:18px">全屏显示（F）</div></div>' +
        '<div class="ver">试玩 ' + JX.VERSION + '　·　序章十场，第一章、第二章各十二场，第三章十二场　·　建议用 Chrome</div>';
      const btns = [...t.querySelectorAll('.btn:not(.small)')]; let sel = s ? 1 : 0;
      const paint = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel)); paint();
      const finish = a => { hs.splice(hs.indexOf(tick), 1); t.remove(); JX.audio && JX.audio.sfx('gong'); res(a); };
      const gal = p => { JX.audio && JX.audio.sfx('page'); t.classList.add('hide'); UI.gallery(p, () => { t.classList.remove('hide'); JX.audio.hold = true; JX.audio.music('zhuti'); }); };
      let asking = false;      // 有存档时点“新的故事”：先问一句，免得一下把进度盖掉（存档只有一个）
      const go = a => { if (asking) return; if (a === 'full') UI.fullscreen(); else if (a === 'gallery') gal(); else if (a === 'scenes') UI.openScenes();
        else if (a === 'new' && s) { const mn = t.querySelector('.menu'); asking = true; mn.style.visibility = 'hidden'; UI.choice('从头开始？', ['算了', '从头开始'], { sub: '现在的进度（' + s.label + '）会被盖掉。', sel: 0, top: 420 }).then(k => { asking = false; mn.style.visibility = ''; if (k === 1) finish('new'); }); }
        else finish(a); };
      t.onclick = e => { const b = e.target.closest('[data-a]'); if (b) go(b.dataset.a); };
      if (UI.openGalleryAt != null) { const p = UI.openGalleryAt; UI.openGalleryAt = null; gal(p); }
      const tick = () => {
        if (UI.galleryOpen()) return;
        if (JX.auto) return finish(JX.autoLoad && s ? 'load' : 'new');
        if (menu || asking) return;                             // “选一场开始”那一页开着，或者正在问要不要从头开始
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
