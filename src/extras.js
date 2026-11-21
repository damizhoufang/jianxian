/* 0.15.0 添的几样界面：前情提要、行程图、合击的横幅。排在 ui.js 后面载入。 */
'use strict';
(function () {
  const JX = window.JX, UI = JX.ui, el = JX.el;
  const KAI = '"Kaiti SC","STKaiti","KaiTi","楷体",serif';

  /* ---------- 前情提要 ---------- */
  /* key 不给：照眼下的场次找这一章的（序章没有）。 */
  UI.recap = async function (key) {
    const m = /^第(.)章/.exec(key || JX.state.label || ''), k = m ? '第' + m[1] + '章' : null, lines = k && JX.recaps && JX.recaps[k];
    if (!lines) { if (!key) await UI.tutorial('前情提要', '故事才刚开头：咸淳三年元夕，临安，醉春楼。', 'recap'); return; }
    await UI.tutorial('前情提要', lines.map(l => '<span class="rl">' + JX.esc(l) + '</span>').join(''), 'recap');
  };

  /* ---------- 行程图 ---------- */
  const X = lon => 300 + (lon - 118.3) * 258, Y = lat => 70 + (32.75 - lat) * 300;
  const COAST = [[120.85, 32.75], [121.2, 32.3], [121.6, 32.05], [121.9, 31.75], [121.85, 31.35], [121.95, 31.0], [121.6, 30.85], [121.3, 30.7], [121.0, 30.6], [120.9, 30.45], [120.6, 30.38], [120.35, 30.32],
    [120.5, 30.22], [120.8, 30.18], [121.1, 30.25], [121.35, 30.32], [121.6, 30.15], [121.75, 29.98], [121.95, 29.95], [122.1, 29.85], [121.95, 29.6], [122.0, 29.5]];
  const JIANG = [[118.3, 31.7], [118.75, 32.08], [119.18, 32.22], [119.45, 32.26], [119.9, 32.3], [120.3, 31.98], [120.9, 32.02], [121.4, 31.8], [121.88, 31.55]];
  const QIANTANG = [[119.6, 29.75], [119.95, 30.05], [120.16, 30.2], [120.35, 30.31]];
  const CANAL = ['临安', '嘉兴', '平望', '平江', '常州', '镇江', '瓜洲', '扬州'];
  function path(c, pts) { c.beginPath(); pts.forEach((p, i) => { const x = X(p[0]), y = Y(p[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); }
  function base(c) {
    const P = JX.P, r = JX.rng(7711);
    const g = c.createLinearGradient(0, 0, 0, 1080); g.addColorStop(0, '#efe4c8'); g.addColorStop(1, '#dccba0'); c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
    for (let i = 0; i < 900; i++) { c.fillStyle = 'rgba(90,65,40,' + (0.02 + r() * 0.05).toFixed(3) + ')'; c.fillRect(r() * 1920, r() * 1080, 1 + r() * 3, 1 + r() * 2); }
    /* 海：岸线以东 */
    c.save(); path(c, COAST); c.lineTo(X(122.0), 1080); c.lineTo(1920, 1080); c.lineTo(1920, 0); c.lineTo(X(120.6), 0); c.closePath(); c.fillStyle = 'rgba(96,132,146,0.22)'; c.fill();
    c.clip(); for (let i = 0; i < 170; i++) { const x = 960 + r() * 960, y = 20 + r() * 1040; P.line(c, x, y, x + 18 + r() * 26, y, 1.2, 'rgba(60,90,104,0.25)'); } c.restore();
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); c.moveTo(X(120.6), 0); COAST.forEach(q => c.lineTo(X(q[0]), Y(q[1]))); c.lineTo(X(122.0), 1080); c.strokeStyle = '#3d2a1c'; c.lineWidth = 3; c.stroke();
    /* 岛：舟山、普陀，几粒小的 */
    const isle = (lon, lat, rx, ry) => { c.beginPath(); c.ellipse(X(lon), Y(lat), rx, ry, -0.12, 0, 6.3); c.fillStyle = '#e6d8b4'; c.fill(); c.strokeStyle = '#3d2a1c'; c.lineWidth = 2.2; c.stroke(); };
    isle(122.12, 30.05, 70, 30); isle(122.4, 30.0, 11, 14); isle(122.25, 30.28, 16, 9); isle(122.45, 30.4, 10, 7); isle(122.2, 29.75, 14, 8); isle(122.6, 30.7, 9, 6);
    /* 太湖 */
    c.beginPath(); c.ellipse(X(120.2), Y(31.2), 82, 74, 0.2, 0, 6.3); c.fillStyle = 'rgba(96,132,146,0.3)'; c.fill(); c.strokeStyle = 'rgba(61,42,28,0.7)'; c.lineWidth = 2; c.stroke();
    /* 江 */
    path(c, JIANG); c.strokeStyle = 'rgba(70,104,120,0.75)'; c.lineWidth = 11; c.stroke(); path(c, JIANG); c.strokeStyle = 'rgba(180,205,210,0.6)'; c.lineWidth = 4; c.stroke();
    path(c, QIANTANG); c.strokeStyle = 'rgba(70,104,120,0.75)'; c.lineWidth = 7; c.stroke();
    /* 运河：细的虚线 */
    c.save(); c.setLineDash([10, 8]); path(c, CANAL.map(n => JX.places[n])); c.strokeStyle = 'rgba(70,104,120,0.8)'; c.lineWidth = 3; c.stroke(); c.restore();
    /* 山：西南角一带点几个“山”字形 */
    const hill = (x, y, s) => { c.beginPath(); c.moveTo(x - 20 * s, y); c.quadraticCurveTo(x - 8 * s, y - 26 * s, x, y - 10 * s); c.quadraticCurveTo(x + 6 * s, y - 34 * s, x + 22 * s, y); c.strokeStyle = 'rgba(61,42,28,0.55)'; c.lineWidth = 2; c.stroke(); };
    [[119.2, 30.4], [119.45, 30.2], [119.0, 30.1], [119.6, 30.55], [118.9, 30.7], [119.25, 29.9], [120.2, 29.6], [120.75, 29.65], [121.2, 29.6], [118.7, 31.2], [119.1, 31.45], [118.6, 30.5], [120.9, 29.85], [119.7, 31.3]].forEach((q, i) => hill(X(q[0]), Y(q[1]), 0.9 + (i % 3) * 0.2));
    /* 水名 */
    const lab = (t, lon, lat, size, col, rot) => { c.save(); c.translate(X(lon), Y(lat)); if (rot) c.rotate(rot); c.font = size + 'px ' + KAI; c.fillStyle = col; c.textAlign = 'center'; c.fillText(t, 0, 0); c.restore(); };
    lab('大　江', 120.55, 32.22, 30, 'rgba(50,84,100,0.9)', 0.02); lab('太湖', 120.2, 31.24, 28, 'rgba(50,84,100,0.9)'); lab('钱塘江', 119.72, 30.02, 24, 'rgba(50,84,100,0.9)', -0.62);
    lab('东　海', 122.55, 31.2, 40, 'rgba(50,84,100,0.7)'); lab('运河', 120.98, 31.22, 22, 'rgba(50,84,100,0.9)');
  }
  function towns(c, seen) {
    Object.keys(JX.places).forEach(n => {
      if (n === '瓜洲') return;                                    // 只当路上的一个拐点，不标名字（和真州、扬州挤在一处）
      const p = JX.places[n], x = X(p[0]), y = Y(p[1]), on = seen[n], big = n === '临安';
      c.fillStyle = on ? '#a8362a' : '#3d2a1c'; c.strokeStyle = '#f8ecd0'; c.lineWidth = 2;
      if (big) { c.fillRect(x - 9, y - 9, 18, 18); c.strokeRect(x - 9, y - 9, 18, 18); } else { c.beginPath(); c.arc(x, y, 6.5, 0, 6.3); c.fill(); c.stroke(); }
      const left = n === '真州' || n === '瓜洲' || n === '山阴' || n === '平望', dy = n === '扬州' ? -14 : n === '镇江' ? 34 : n === '定海' ? 46 : n === '普陀' ? -22 : n === '山阴' ? 36 : 9;
      c.font = (big ? '600 36px ' : '30px ') + KAI; c.textAlign = left ? 'right' : 'left'; c.lineWidth = 5; c.strokeStyle = 'rgba(239,228,200,0.9)'; c.fillStyle = on ? '#8e2a20' : '#2b221c';
      const tx = x + (left ? -14 : 14) + (n === '定海' ? -40 : n === '山阴' ? 40 : 0); c.strokeText(n, tx, y + dy); c.fillText(n, tx, y + dy);
    });
  }
  function leg(c, L, k, hot) {
    const pts = L.via.map(n => [X(JX.places[n][0]), Y(JX.places[n][1])]); let tot = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let left = tot * k, end = pts[0];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) { const d = seg[i - 1], q = Math.min(1, left / d); end = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q]; c.lineTo(end[0], end[1]); left -= d; }
    c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = hot ? '#a8362a' : 'rgba(142,42,32,0.5)'; c.lineWidth = hot ? 7 : 4; c.stroke();
    if (hot && k < 1) { c.beginPath(); c.arc(end[0], end[1], 11, 0, 6.3); c.fillStyle = '#d7a544'; c.fill(); c.strokeStyle = '#3d2a1c'; c.lineWidth = 2.5; c.stroke(); }
  }
  /* which：只演哪一章的那一段（'第二章'）；不给就把走过的都画出来，不演。 */
  UI.routeMap = async function (which) {
    if (UI.overlay) return;
    UI.overlay = true; UI.modal++;
    const box = UI.root().appendChild(el('div', '', '<canvas width="1920" height="1080"></canvas><div class="ok">回车 收起 ▾</div>')); box.id = 'rmap';
    const c = box.firstChild.getContext('2d'), bg = document.createElement('canvas'); bg.width = 1920; bg.height = 1080; base(bg.getContext('2d'));
    const m = /^第(.)章/.exec(JX.state.label || ''), cur = which || (m ? '第' + m[1] + '章' : ''), order = ['第二章', '第三章', '第四章'], upto = order.indexOf(cur);
    const legs = (JX.legs || []).filter(L => order.indexOf(L.ch) <= upto), hot = which ? legs[legs.length - 1] : null;
    const paint = k => {
      c.drawImage(bg, 0, 0); const seen = { 临安: 1 };
      legs.forEach(L => { const kk = L === hot ? k : 1; leg(c, L, kk, L === hot); L.via.forEach((n, i) => { if (L !== hot || i / (L.via.length - 1) <= kk + 0.001) seen[n] = 1; }); });
      towns(c, seen);
      c.textAlign = 'center'; c.fillStyle = '#2b221c'; c.font = '600 76px ' + KAI; c.fillText('行', 1712, 250); c.fillText('程', 1712, 350);
      c.fillStyle = '#a8362a'; c.fillRect(1672, 392, 80, 80); c.fillStyle = '#f8ecd0'; c.font = '600 30px ' + KAI; c.fillText('咸淳', 1712, 426); c.fillText('三年', 1712, 460);
      c.font = '30px ' + KAI; let y = 560;
      legs.forEach(L => { c.fillStyle = L === hot ? '#8e2a20' : '#5a4128'; c.fillText(L.ch + '　' + L.name, 1712, y); y += 46; });
      if (!legs.length) { c.fillStyle = '#5a4128'; c.fillText('还没有出过临安', 1712, y); }
      c.font = '22px ' + KAI; c.fillStyle = 'rgba(61,42,28,0.7)'; c.fillText('示意图，不按比例', 1712, 960);
    };
    paint(hot ? 0 : 1); void box.offsetWidth; box.style.opacity = 1;
    await JX.sleep(JX.auto ? 0.05 : 0.7);
    if (hot) { JX.audio && JX.audio.sfx('page'); await JX.tween(JX.auto ? 0.05 : 3.2, k => paint(k), JX.ease.inOut || JX.ease.out); paint(1); }
    await Promise.race([UI.waitConfirm(0.3), JX.sleep(hot ? 6 : 600)]);
    box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.6); box.remove(); UI.modal--; UI.overlay = false;
  };

  /* ---------- 合击的横幅：两张半身画像从两边进来，当中几个大字 ---------- */
  UI.cutBanner = async function (ids, text, sec) {
    if (JX.auto) return;
    const A = JX.Art, pic = id => (A && A.pic && A.painted && A.painted(id) ? '<img src="' + A.pic(id, 'half') + '" alt="">' : '');
    const four = ids.length >= 4;                                 // 四个人的合击：一边两张
    const box = UI.root().appendChild(el('div', '', '<div class="l">' + pic(ids[0]) + (four ? pic(ids[1]) : '') + '</div><div class="r">' + (four ? pic(ids[2]) + pic(ids[3]) : pic(ids[1])) + '</div><div class="t">' + JX.esc(text) + '</div>')); box.id = 'cutb'; if (four) box.classList.add('four');
    void box.offsetWidth; box.classList.add('in'); JX.audio && JX.audio.sfx('gong');
    await JX.sleep(sec || 1.5); box.classList.remove('in'); box.classList.add('out'); await JX.sleep(0.35); box.remove();
  };
  /* 先把半身画像取下来，免得横幅出来的时候图还没到 */
  UI.warmHalf = function (ids) { const A = JX.Art; (ids || []).forEach(id => { if (A && A.pic && A.painted && A.painted(id)) { const im = new Image(); im.src = A.pic(id, 'half'); } }); };

  /* ---------- 各场景的环境声和脚步声 ---------- */
  /* amb：[哪一段, 多响]，进场景就垫上（演出里另叫的雨、火、潮照旧，会把它换掉）。step：主角脚步声的地面——mu 木板、shi 石板、cao 草和土；false 不出声。 */
  const AMB = { street: ['shi', 0.2], hall: ['shi', 0.15], beiwa: ['shi', 0.24], matou: ['shi', 0.15], dinghai: ['shi', 0.13], yangzhou: ['shi', 0.1],
    chuan: ['shui', 0.2], chuanye: ['shui', 0.18], jiang: ['shui', 0.22], haichuan: ['shui', 0.2], guichuan: ['shui', 0.2], xihu: ['shui', 0.16], huafang: ['shui', 0.14], jiangbian: ['shui', 0.18],
    alley: ['feng', 0.12], yingwai: ['feng', 0.14], ying: ['feng', 0.12], snow: ['feng', 0.18], shanmen: ['feng', 0.09],
    roof: () => (JX.state.stage === 42 || JX.state.stage === 48 ? ['chong', 0.13] : ['feng', 0.15]),                // 忆三是去年九月：屋顶上有秋虫
    anneiye: ['chong', 0.09], haibian: ['chao', 0.2] };
  const STEP = { cellar: 'cao', kitchen: 'shi', hall: 'mu', street: 'shi', snow: 'cao', floor2: 'mu', tingchao: 'mu', alley: 'shi', roof: 'shi', yamen: 'shi', yaopu: 'shi', beiwa: 'cao', ruanhong: 'mu', shufang: 'mu', jiage: 'shi',
    xihu: false, huafang: 'mu', gongtang: 'shi', matou: 'shi', chuan: 'mu', chuanye: 'mu', chuanyu: 'mu', jiang: 'mu', yangzhou: 'cao', yingwai: 'cao', ying: 'cao', guanshe: 'shi', jiangbian: 'cao',
    dinghai: 'shi', haichuan: 'mu', shanmen: 'cao', annei: 'mu', chaoyindong: 'shi', dongdi: 'shi', anneiye: 'mu', haibian: 'cao', guichuan: 'mu', banxian: 'shi' };
  JX.ambience = { AMB, STEP };
  Object.keys(JX.scenes || {}).forEach(id => { const sc = JX.scenes[id]; if (AMB[id] && sc.amb == null) sc.amb = AMB[id]; if (id in STEP && sc.step == null) sc.step = STEP[id]; });
})();
