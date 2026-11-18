/* 地面与景物：土地、草地、方砖、卵石、地毯、席子、池塘、河岸；假山、石头、花木、盆景、竹篱、远山。
   和 paint.js 一样都挂在 JX.P 上、在“单位坐标”里画。铺地的函数（earth、grass、tiles、cobbles）画一个矩形，
   要不规则的一块就先用 P.blob 圈出来再 clip（P.patch 替你做这件事）。立着的东西（假山、树、盆景）原点在脚下。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const INK = a => P.rgba(C.ink, a == null ? 0.85 : a);

  /* 一圈不规则的边：圈好路径（不描不填），给 fill、stroke、clip 用 */
  P.blob = function (ctx, cx, cy, rx, ry, seed, wob, n) {
    const r = JX.rng(seed || 3); n = n || 14; wob = wob == null ? 0.22 : wob;
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (r() - 0.5) * 2 * wob; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      if (!i) { const o = pts[n - 1]; ctx.moveTo((o[0] + p[0]) / 2, (o[1] + p[1]) / 2); }
      ctx.quadraticCurveTo(p[0], p[1], mx, my);
    }
    ctx.closePath();
  };
  /* 在一块不规则的地方里画东西：fn 里照常按矩形铺，外面多出来的被裁掉；edge 给这一块描一道软边 */
  P.patch = function (ctx, cx, cy, rx, ry, seed, fn, edge) {
    ctx.save(); P.blob(ctx, cx, cy, rx, ry, seed); ctx.clip(); fn(cx - rx * 1.3, cy - ry * 1.3, rx * 2.6, ry * 2.6); ctx.restore();
    if (edge !== false) { ctx.save(); P.blob(ctx, cx, cy, rx, ry, seed); ctx.strokeStyle = edge || 'rgba(40,32,22,0.22)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  };
  function mottle(ctx, r, x, y, w, h, n, dark, light, rad) {
    for (let i = 0; i < n; i++) {
      const px = x + r() * w, py = y + r() * h, rr = (rad || 60) * (0.5 + r()), d = r() < 0.5;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rr), a = 0.05 + r() * 0.1;
      g.addColorStop(0, P.rgba(d ? dark : light, a)); g.addColorStop(1, P.rgba(d ? dark : light, 0));
      ctx.fillStyle = g; ctx.fillRect(px - rr, py - rr * 0.6, rr * 2, rr * 1.2);
    }
  }

  /* ---------- 铺地 ---------- */
  /* 夯实的土地：瓦子、营地、乡下的路。o.ruts 给几道车辙的 y；o.wet 颜色发深 */
  P.earth = function (ctx, x, y, w, h, o) {
    o = o || {}; const r = JX.rng(o.seed || 301), base = o.base || '#a8916c';
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    mottle(ctx, r, x, y, w, h, w * h / 5200, '#3a2a18', '#fff0cc', 90);
    for (let i = 0; i < w * h / 2600; i++) {                                    // 踩实了的浅痕
      const px = x + r() * w, py = y + r() * h, len = 14 + r() * 46;
      ctx.strokeStyle = P.rgba(r() < 0.6 ? '#3a2a18' : '#fff0cc', 0.05 + r() * 0.07); ctx.lineWidth = 1 + r() * 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + len / 2, py + (r() - 0.5) * 5, px + len, py + (r() - 0.5) * 4); ctx.stroke();
    }
    for (let i = 0; i < w * h / 3000; i++) {                                    // 小石子
      const px = x + r() * w, py = y + r() * h, s = 1.5 + r() * 3.5;
      P.ellipse(ctx, px, py + s * 0.5, s * 1.2, s * 0.5, 'rgba(30,22,14,0.2)');
      P.ellipse(ctx, px, py, s, s * 0.72, P.mix('#8f8676', '#c9c0ac', r()), 'rgba(30,22,14,0.35)', 0.7);
    }
    (o.ruts || []).forEach((ry, k) => {                                         // 车辙：两道一组
      [0, 46].forEach(d => {
        ctx.strokeStyle = 'rgba(58,42,26,0.22)'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath();
        for (let px = x - 20; px <= x + w + 20; px += 60) { const py = ry + d + Math.sin(px * 0.004 + k * 2) * 14 + Math.sin(px * 0.013 + k) * 4; px === x - 20 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
        ctx.stroke(); ctx.strokeStyle = 'rgba(255,240,204,0.1)'; ctx.lineWidth = 2; ctx.translate(0, 6); ctx.stroke(); ctx.translate(0, -6);
      });
    });
    if (o.wet) { ctx.fillStyle = 'rgba(40,34,30,0.2)'; ctx.fillRect(x, y, w, h); }
    ctx.restore();
  };
  /* 草地。o.dry 枯黄一些（早春、营地边），o.flowers 撒小花，o.bare 露出几块土 */
  P.grass = function (ctx, x, y, w, h, o) {
    o = o || {}; const r = JX.rng(o.seed || 311), base = o.base || (o.dry ? '#a3a067' : '#86a05c');
    const dk = o.dry ? '#6d6a3a' : '#4f6d38', lt = o.dry ? '#d2cc8c' : '#c0d68a';
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    mottle(ctx, r, x, y, w, h, w * h / 4200, dk, lt, 80);
    for (let i = 0; i < (o.bare || 0); i++) { const px = x + r() * w, py = y + r() * h; ctx.save(); P.blob(ctx, px, py, 30 + r() * 50, 12 + r() * 16, 900 + i); ctx.fillStyle = 'rgba(160,138,100,0.55)'; ctx.fill(); ctx.restore(); }
    ctx.lineCap = 'round';
    for (let i = 0; i < w * h / 520; i++) {                                     // 一丛一丛的草叶
      const px = x + r() * w, py = y + r() * h, n = 2 + Math.floor(r() * 4), col = P.mix(dk, lt, r());
      ctx.strokeStyle = P.rgba(col, 0.5 + r() * 0.4); ctx.lineWidth = 1.2 + r() * 1.2;
      for (let k = 0; k < n; k++) { const dx = (k - n / 2) * 3.4 + (r() - 0.5) * 3, hh = 6 + r() * 9; ctx.beginPath(); ctx.moveTo(px + dx * 0.4, py); ctx.quadraticCurveTo(px + dx * 0.7, py - hh * 0.6, px + dx * 1.4, py - hh); ctx.stroke(); }
    }
    if (o.flowers) for (let i = 0; i < w * h / 5200; i++) {
      const px = x + r() * w, py = y + r() * h, col = ['#f4f0e0', '#f2d86a', '#e7a9b6', '#c8a2d8'][Math.floor(r() * 4)];
      for (let k = 0; k < 4; k++) P.ellipse(ctx, px + Math.cos(k * 1.57) * 2.6, py + Math.sin(k * 1.57) * 2.2, 2, 1.7, col);
      P.ellipse(ctx, px, py, 1.3, 1.1, '#d7a544');
    }
    ctx.restore();
  };
  /* 方砖地：药铺、库房、厨下。o.s 砖的大小，o.col 砖色，o.diag 斜着铺 */
  P.tiles = function (ctx, x, y, w, h, o) {
    o = o || {}; const r = JX.rng(o.seed || 321), s = o.s || 58, col = o.col || '#8f8f88';
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = P.dark(col, 0.45); ctx.fillRect(x, y, w, h);
    if (o.diag) { ctx.translate(x + w / 2, y + h / 2); ctx.rotate(Math.PI / 4); ctx.translate(-(x + w / 2), -(y + h / 2)); }
    const pad = o.diag ? Math.max(w, h) : 0;
    for (let py = y - pad; py < y + h + pad; py += s) for (let px = x - pad - (o.bond ? ((Math.round((py - y) / s) % 2) * s) / 2 : 0); px < x + w + pad; px += s) {
      ctx.fillStyle = P.mix(P.dark(col, 0.12), P.light(col, 0.16), r()); ctx.fillRect(px + 1.2, py + 1.2, s - 2.4, s - 2.4);
      if (r() < 0.5) { ctx.fillStyle = 'rgba(255,246,226,0.06)'; ctx.fillRect(px + 1.2, py + 1.2, s - 2.4, 3); }
      if (r() < 0.12) { ctx.strokeStyle = 'rgba(28,24,20,0.28)'; ctx.lineWidth = 0.9; ctx.beginPath(); const cx = px + r() * s, cy = py + r() * s; ctx.moveTo(cx, cy); ctx.lineTo(cx + (r() - 0.5) * s * 0.7, cy + (r() - 0.5) * s * 0.7); ctx.stroke(); }
      if (r() < 0.1) P.ellipse(ctx, px + r() * s, py + r() * s, 5 + r() * 9, 3 + r() * 5, 'rgba(28,24,20,0.07)');
    }
    ctx.restore();
  };
  /* 卵石地：巷子、园子里的小径 */
  P.cobbles = function (ctx, x, y, w, h, o) {
    o = o || {}; const r = JX.rng(o.seed || 331), s = o.s || 30, col = o.col || '#8d887c';
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = P.dark(col, 0.5); ctx.fillRect(x, y, w, h);
    for (let py = y - s; py < y + h + s; py += s * 0.78) for (let px = x - s + ((Math.round(py / s) % 2) * s) / 2; px < x + w + s; px += s) {
      const cx = px + (r() - 0.5) * 6, cy = py + (r() - 0.5) * 5, rx = s * (0.4 + r() * 0.12), ry = s * (0.3 + r() * 0.08);
      P.ellipse(ctx, cx, cy, rx, ry, P.mix(P.dark(col, 0.12), P.light(col, 0.2), r()), 'rgba(22,18,14,0.5)', 1);
      P.ellipse(ctx, cx - rx * 0.25, cy - ry * 0.3, rx * 0.4, ry * 0.3, 'rgba(255,248,230,0.1)');
    }
    if (o.moss) for (let i = 0; i < w * h / 4000; i++) P.ellipse(ctx, x + r() * w, y + r() * h, 8 + r() * 20, 4 + r() * 8, 'rgba(86,112,62,0.28)');
    ctx.restore();
  };
  /* 地毯。o.col 底色，o.border 边色，o.accent 花纹色，o.style：'medallion' 团花、'lattice' 斜方格、'plain' 素的；o.fringe 两头的穗子 */
  P.rug = function (ctx, x, y, w, h, o) {
    o = o || {}; const r = JX.rng(o.seed || 341), col = o.col || '#8e2f28', bd = o.border || '#22303e', ac = o.accent || '#d7a544';
    const bw = o.bw || Math.max(14, Math.min(w, h) * 0.085);
    ctx.save();
    ctx.fillStyle = 'rgba(20,12,8,0.3)'; ctx.fillRect(x + 4, y + 6, w, h);            // 压在地上的一点影子
    if (o.fringe !== false) { ctx.strokeStyle = '#e6dcc0'; ctx.lineWidth = 1.6; for (let py = y + 3; py < y + h - 2; py += 5) { ctx.beginPath(); ctx.moveTo(x - 9, py + (r() - 0.5) * 2); ctx.lineTo(x, py); ctx.moveTo(x + w, py); ctx.lineTo(x + w + 9, py + (r() - 0.5) * 2); ctx.stroke(); } }
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = bd; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = col; ctx.fillRect(x + bw, y + bw, w - bw * 2, h - bw * 2);
    /* 边：一道回纹（简成一格一格的勾）夹在两条细线里 */
    ctx.strokeStyle = ac; ctx.lineWidth = 1.6; ctx.strokeRect(x + 3.5, y + 3.5, w - 7, h - 7); ctx.strokeRect(x + bw - 3, y + bw - 3, w - bw * 2 + 6, h - bw * 2 + 6);
    const k = bw - 10, step = k * 1.5; ctx.lineWidth = 1.5; ctx.strokeStyle = P.rgba(ac, 0.9);
    const key = (kx, ky, rot) => { ctx.save(); ctx.translate(kx, ky); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(-k * 0.5, k * 0.3); ctx.lineTo(-k * 0.5, -k * 0.3); ctx.lineTo(k * 0.5, -k * 0.3); ctx.lineTo(k * 0.5, k * 0.3); ctx.lineTo(-k * 0.1, k * 0.3); ctx.lineTo(-k * 0.1, 0); ctx.lineTo(k * 0.15, 0); ctx.stroke(); ctx.restore(); };
    if (k > 4) {
      for (let kx = x + bw + step / 2; kx < x + w - bw; kx += step) { key(kx, y + bw / 2, 0); key(kx, y + h - bw / 2, Math.PI); }
      for (let ky = y + bw + step / 2; ky < y + h - bw; ky += step) { key(x + bw / 2, ky, -Math.PI / 2); key(x + w - bw / 2, ky, Math.PI / 2); }
    }
    /* 心子 */
    const fx = x + bw, fy = y + bw, fw = w - bw * 2, fh = h - bw * 2;
    ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip();
    if (o.style === 'lattice') {
      const d = o.d || 44; ctx.strokeStyle = P.rgba(ac, 0.5); ctx.lineWidth = 1.3;
      for (let i = -fh; i < fw + fh; i += d) { ctx.beginPath(); ctx.moveTo(fx + i, fy); ctx.lineTo(fx + i + fh, fy + fh); ctx.moveTo(fx + i + fh, fy); ctx.lineTo(fx + i, fy + fh); ctx.stroke(); }
      for (let py = fy + d / 2 - ((fh / 2) % d); py < fy + fh + d; py += d / 2) for (let px = fx + ((Math.round(py / (d / 2)) % 2) ? d / 2 : 0) - ((fh) % d) / 2; px < fx + fw + d; px += d) { P.ellipse(ctx, px, py, 3, 3, ac); P.ellipse(ctx, px, py, 1.3, 1.3, bd); }
    } else if (o.style !== 'plain') {
      const cx = fx + fw / 2, cy = fy + fh / 2, mr = Math.min(fw * 0.26, fh * 0.42);
      const flower = (px, py, rad, cut) => {
        ctx.save(); ctx.translate(px, py);
        ctx.fillStyle = P.rgba(bd, 0.9); ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.ellipse(Math.cos(a) * rad * 0.62, Math.sin(a) * rad * 0.62, rad * 0.44, rad * 0.26, a, 0, 6.283); } ctx.fill();
        ctx.strokeStyle = ac; ctx.lineWidth = 1.4; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.beginPath(); ctx.ellipse(Math.cos(a) * rad * 0.62, Math.sin(a) * rad * 0.62, rad * 0.44, rad * 0.26, a, 0, 6.283); ctx.stroke(); }
        P.ellipse(ctx, 0, 0, rad * 0.34, rad * 0.34, ac, bd, 1.2); P.ellipse(ctx, 0, 0, rad * 0.14, rad * 0.14, col);
        ctx.restore(); void cut;
      };
      flower(cx, cy, mr);
      [[fx, fy], [fx + fw, fy], [fx, fy + fh], [fx + fw, fy + fh]].forEach(q => flower(q[0], q[1], mr * 0.7));   // 四角各露四分之一朵
      ctx.strokeStyle = P.rgba(ac, 0.55); ctx.lineWidth = 1.2;                                                   // 缠枝：从团花往两头牵
      [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(cx + s * mr * 1.1, cy); ctx.bezierCurveTo(cx + s * (mr * 1.5), cy - fh * 0.3, cx + s * (fw * 0.36), cy + fh * 0.3, cx + s * (fw * 0.46), cy - fh * 0.05); ctx.stroke(); for (let i = 1; i <= 3; i++) { const px = cx + s * (mr * 1.1 + i * (fw * 0.46 - mr * 1.1) / 4), py = cy + Math.sin(i * 2.1) * fh * 0.16; P.ellipse(ctx, px, py, 5, 3.4, P.rgba(ac, 0.8)); } });
    }
    for (let py = fy; py < fy + fh; py += 3) { ctx.fillStyle = 'rgba(0,0,0,0.035)'; ctx.fillRect(fx, py, fw, 1); }       // 织纹
    ctx.restore();
    for (let i = 0; i < w * h / 16000; i++) { const px = x + r() * w, py = y + r() * h, rr = 30 + r() * 60, g = ctx.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, 'rgba(255,240,210,0.07)'); g.addColorStop(1, 'rgba(255,240,210,0)'); ctx.fillStyle = g; ctx.fillRect(px - rr, py - rr, rr * 2, rr * 2); }   // 踩旧了的地方
    ctx.strokeStyle = INK(0.8); ctx.lineWidth = 1.6; ctx.strokeRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);
    ctx.restore();
  };
  /* 席子：蒲草编的，布包边 */
  P.mat = function (ctx, x, y, w, h, o) {
    o = o || {}; const col = o.col || '#cdb984', edge = o.edge || '#3d4a56';
    ctx.save(); ctx.fillStyle = 'rgba(20,12,8,0.25)'; ctx.fillRect(x + 3, y + 5, w, h);
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(x, y, w, h);
    for (let py = y; py < y + h; py += 6) { ctx.fillStyle = 'rgba(90,70,30,0.13)'; ctx.fillRect(x, py, w, 1.4); }
    for (let px = x; px < x + w; px += 9) { ctx.fillStyle = (Math.round(px / 9) % 2) ? 'rgba(255,250,220,0.07)' : 'rgba(90,70,30,0.06)'; ctx.fillRect(px, y, 4.5, h); }
    ctx.fillStyle = edge; ctx.fillRect(x, y, w, 7); ctx.fillRect(x, y + h - 7, w, 7); ctx.fillRect(x, y, 7, h); ctx.fillRect(x + w - 7, y, 7, h);
    ctx.strokeStyle = INK(0.75); ctx.lineWidth = 1.4; ctx.strokeRect(x + 0.7, y + 0.7, w - 1.4, h - 1.4); ctx.restore();
  };

  /* ---------- 水 ---------- */
  /* 池塘：一圈石头的岸，水里几片浮萍、两尾鱼。o.col 水色，o.fish 几条，o.lily 几片 */
  P.pond = function (ctx, cx, cy, rx, ry, o) {
    o = o || {}; const seed = o.seed || 351, r = JX.rng(seed + 1), wc = o.col || '#6f9aa0';
    ctx.save();
    P.blob(ctx, cx, cy + 5, rx + 12, ry + 10, seed, 0.16); ctx.fillStyle = 'rgba(30,24,18,0.3)'; ctx.fill();
    P.blob(ctx, cx, cy, rx + 9, ry + 8, seed, 0.16); ctx.fillStyle = '#7b7568'; ctx.fill(); ctx.strokeStyle = INK(0.7); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.save(); P.blob(ctx, cx, cy, rx, ry, seed, 0.16); ctx.clip();
    ctx.fillStyle = P.vgrad(ctx, 0, cy - ry * 1.2, ry * 2.4, [[0, P.light(wc, 0.4)], [0.45, wc], [1, P.dark(wc, 0.45)]]); ctx.fillRect(cx - rx * 1.4, cy - ry * 1.4, rx * 2.8, ry * 2.8);
    ctx.fillStyle = 'rgba(20,30,34,0.25)'; ctx.fillRect(cx - rx * 1.4, cy - ry * 1.4, rx * 2.8, ry * 0.5);                 // 岸投在水里的影
    for (let i = 0; i < (o.fish == null ? 2 : o.fish); i++) { const fx = cx + (r() - 0.5) * rx * 1.1, fy = cy + (r() - 0.3) * ry * 0.9, a = r() * 6.3, fc = r() < 0.6 ? '#d9703a' : '#e9e2d0'; ctx.save(); ctx.translate(fx, fy); ctx.rotate(a); ctx.fillStyle = P.rgba(fc, 0.8); ctx.beginPath(); ctx.ellipse(0, 0, 11, 4, 0, 0, 6.3); ctx.fill(); ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-17, -5); ctx.lineTo(-17, 5); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.strokeStyle = 'rgba(250,252,246,0.3)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    for (let i = 0; i < rx * ry / 900; i++) { const px = cx + (r() - 0.5) * rx * 1.6, py = cy + (r() - 0.5) * ry * 1.5, l = 10 + r() * 26; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + l, py); ctx.stroke(); }
    for (let i = 0; i < (o.lily == null ? 5 : o.lily); i++) { const px = cx + (r() - 0.5) * rx * 1.4, py = cy + (r() - 0.5) * ry * 1.3, s = 7 + r() * 8; ctx.fillStyle = P.mix('#5d8a4c', '#8fb46a', r()); ctx.beginPath(); ctx.ellipse(px, py, s, s * 0.62, 0, 0.3, 6.0); ctx.lineTo(px, py); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(30,50,24,0.5)'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.strokeStyle = 'rgba(250,252,246,0.3)'; ctx.lineWidth = 1.2; }
    ctx.restore();
    const n = Math.round((rx + ry) / 9);                                                                                   // 岸上的石头
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + r() * 0.2, px = cx + Math.cos(a) * (rx + 5) * (1 + (r() - 0.5) * 0.12), py = cy + Math.sin(a) * (ry + 4) * (1 + (r() - 0.5) * 0.12), s = 6 + r() * 9; P.ellipse(ctx, px, py, s, s * 0.62, P.mix('#77736a', '#b4b0a2', r()), INK(0.7), 1); P.ellipse(ctx, px - s * 0.2, py - s * 0.2, s * 0.4, s * 0.2, 'rgba(255,250,236,0.18)'); }
    ctx.restore();
  };
  /* 水边的一道岸：从 (x,y) 起宽 w，水在上、岸在下；画湿泥、碎石和水线。河、湖、运河的近岸都用它 */
  P.shore = function (ctx, x, y, w, o) {
    o = o || {}; const r = JX.rng(o.seed || 361), dep = o.dep || 26, col = o.col || '#8c7c60';
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y + dep + 8);
    for (let px = x; px <= x + w; px += 40) ctx.lineTo(px, y + Math.sin(px * 0.011 + (o.seed || 0)) * 5 + Math.sin(px * 0.037) * 2.4);
    ctx.lineTo(x + w, y + dep + 8); ctx.closePath();
    ctx.fillStyle = P.vgrad(ctx, 0, y - 6, dep + 14, [[0, P.dark(col, 0.35)], [0.4, col], [1, P.rgba(col, 0)]]); ctx.fill();
    ctx.strokeStyle = 'rgba(250,252,246,0.5)'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let px = x; px <= x + w; px += 40) { const py = y - 2 + Math.sin(px * 0.011 + (o.seed || 0)) * 5 + Math.sin(px * 0.037) * 2.4; px === x ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke();
    for (let i = 0; i < w / 26; i++) { const px = x + r() * w, py = y + 4 + r() * dep * 0.8, s = 2.5 + r() * 6; P.ellipse(ctx, px, py, s, s * 0.6, P.mix('#6f6a60', '#b0aa9a', r()), INK(0.55), 0.8); }
    ctx.restore();
  };

  /* ---------- 石头 ---------- */
  function lump(g, r, cx, cy, rx, ry, col) {                         // 一块有棱角的石头
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 - 1.57, k = 0.78 + r() * 0.44; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath();
    g.fillStyle = P.hgrad(g, cx - rx, 0, rx * 2, [[0, P.light(col, 0.3)], [0.45, col], [1, P.dark(col, 0.45)]]); g.fill();
    g.strokeStyle = INK(0.85); g.lineWidth = 1.5; g.lineJoin = 'round'; g.stroke();
    g.strokeStyle = 'rgba(255,250,236,0.22)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(pts[n - 2][0] + 3, pts[n - 2][1] + 3); g.lineTo(pts[n - 1][0] + 2, pts[n - 1][1] + 4); g.lineTo(pts[0][0], pts[0][1] + 5); g.stroke();
    for (let i = 0; i < 3; i++) { const a = r() * 6.283, d = r() * 0.5; g.strokeStyle = 'rgba(28,24,20,0.3)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d); g.lineTo(cx + Math.cos(a + 0.4) * rx * (d + 0.3), cy + Math.sin(a + 0.4) * ry * (d + 0.3)); g.stroke(); }
  }
  /* 一块石头（园子里、路边、水边）。原点在石头脚下正中 */
  P.rock = function (g, x, y, s, o) {
    o = o || {}; const r = JX.rng(o.seed || 371); s = s || 1;
    P.shadow(g, x, y, 30 * s, 7 * s, 0.35); lump(g, r, x, y - 16 * s, 28 * s, 18 * s, o.col || '#8d8f8c');
    if (o.moss !== false) { g.fillStyle = 'rgba(92,122,66,0.5)'; g.beginPath(); g.ellipse(x - 6 * s, y - 28 * s, 13 * s, 4.5 * s, -0.2, 0, 6.3); g.fill(); }
  };
  /* 假山：太湖石，瘦、皱、漏、透。原点在脚下正中，s=1 时高一百五上下 */
  P.rockery = function (g, x, y, s, o) {
    o = o || {}; const r = JX.rng(o.seed || 381), col = o.col || '#9aa2a4'; s = s || 1;
    g.save(); g.translate(x, y); g.scale(s, s);
    P.shadow(g, 0, 0, 78, 13, 0.4);
    const parts = [[-34, -22, 34, 26], [26, -26, 36, 30], [-8, -62, 34, 34], [30, -84, 24, 28], [-30, -98, 22, 24], [2, -128, 22, 28], [-4, -160, 13, 16]];
    parts.forEach((p, i) => {
      lump(g, r, p[0], p[1], p[2], p[3], P.mix(col, '#6f777b', r() * 0.5));
      const holes = i < 5 ? 1 + Math.floor(r() * 2) : 0;                                         // 洞：太湖石的“漏”
      for (let k = 0; k < holes; k++) { const hx = p[0] + (r() - 0.5) * p[2] * 0.9, hy = p[1] + (r() - 0.5) * p[3] * 0.8, hr = 4 + r() * 7; g.fillStyle = 'rgba(24,26,30,0.78)'; g.beginPath(); g.ellipse(hx, hy, hr, hr * (0.6 + r() * 0.5), r() * 3, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(255,250,236,0.2)'; g.lineWidth = 1; g.beginPath(); g.ellipse(hx, hy + 1.5, hr, hr * 0.7, 0, 0.3, 2.8); g.stroke(); }
    });
    [[-40, -6, 22, 6], [34, -4, 20, 5], [-10, -92, 14, 4], [22, -108, 10, 3.4]].forEach(m => { g.fillStyle = 'rgba(92,122,66,0.55)'; g.beginPath(); g.ellipse(m[0], m[1], m[2], m[3], 0, 0, 6.3); g.fill(); });
    if (o.grass !== false) { g.strokeStyle = 'rgba(79,109,56,0.85)'; g.lineWidth = 1.6; g.lineCap = 'round'; for (let i = 0; i < 16; i++) { const px = -70 + r() * 140, hh = 8 + r() * 14; g.beginPath(); g.moveTo(px, 2); g.quadraticCurveTo(px + (r() - 0.5) * 6, -hh * 0.6, px + (r() - 0.5) * 12, -hh); g.stroke(); } }
    g.restore();
  };

  /* ---------- 花木 ---------- */
  function leafBall(g, r, cx, cy, rad, dk, lt) {
    for (let i = 0; i < 7; i++) { const a = r() * 6.283, d = r() * rad * 0.55, rr = rad * (0.42 + r() * 0.3); P.ellipse(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, rr, rr * 0.86, P.mix(dk, lt, i / 7 * 0.7 + r() * 0.2)); }
    g.save(); g.beginPath(); g.ellipse(cx, cy, rad * 1.05, rad * 0.95, 0, 0, 6.3); g.clip();
    for (let i = 0; i < rad * 0.9; i++) { const px = cx + (r() - 0.5) * rad * 2, py = cy + (r() - 0.5) * rad * 1.8; g.fillStyle = P.rgba(r() < 0.5 ? lt : dk, 0.35 + r() * 0.3); g.beginPath(); g.ellipse(px, py, 3.2, 1.6, r() * 3, 0, 6.3); g.fill(); }
    g.restore();
  }
  /* 灌木。o.flower 给花色就开花（茶花、杜鹃、迎春） */
  P.bush = function (g, x, y, s, o) {
    o = o || {}; const r = JX.rng(o.seed || 391), dk = o.dk || '#3f5f38', lt = o.lt || '#86a85e'; s = s || 1;
    P.shadow(g, x, y, 34 * s, 8 * s, 0.35);
    leafBall(g, r, x - 16 * s, y - 16 * s, 20 * s, dk, lt); leafBall(g, r, x + 16 * s, y - 15 * s, 19 * s, dk, lt); leafBall(g, r, x, y - 28 * s, 22 * s, dk, lt);
    if (o.flower) for (let i = 0; i < 9; i++) { const px = x + (r() - 0.5) * 60 * s, py = y - 8 * s - r() * 36 * s; for (let k = 0; k < 5; k++) P.ellipse(g, px + Math.cos(k * 1.257) * 3 * s, py + Math.sin(k * 1.257) * 3 * s, 2.8 * s, 2.4 * s, o.flower); P.ellipse(g, px, py, 1.6 * s, 1.6 * s, '#f2d86a'); }
  };
  /* 一丛竹子：n 竿，高 h */
  P.bamboo = function (g, x, y, h, n, o) {
    o = o || {}; const r = JX.rng(o.seed || 401); n = n || 5; h = h || 220;
    P.shadow(g, x, y, 12 + n * 5, 6, 0.3);
    for (let i = 0; i < n; i++) {
      const bx = x + (i - (n - 1) / 2) * 11 + (r() - 0.5) * 6, hh = h * (0.72 + r() * 0.28), lean = (r() - 0.5) * 34, col = P.mix('#5f8a4a', '#9ab86a', r());
      g.strokeStyle = col; g.lineWidth = 4.2; g.lineCap = 'butt'; g.beginPath(); g.moveTo(bx, y); g.quadraticCurveTo(bx + lean * 0.2, y - hh * 0.5, bx + lean, y - hh); g.stroke();
      g.strokeStyle = 'rgba(30,48,24,0.55)'; g.lineWidth = 1; for (let k = 1; k < 7; k++) { const t = k / 7, px = bx + lean * t * t, py = y - hh * t; g.beginPath(); g.moveTo(px - 3, py); g.lineTo(px + 3, py); g.stroke(); }
      for (let k = 0; k < 9; k++) {                                                    // 竹叶：一簇三五片
        const t = 0.45 + r() * 0.55, px = bx + lean * t * t, py = y - hh * t, dir = r() < 0.5 ? -1 : 1;
        for (let m = 0; m < 3; m++) { const a = dir * (0.5 + m * 0.36 + r() * 0.2), len = 20 + r() * 14; g.fillStyle = P.rgba(P.mix('#4f7a3a', '#a2c070', r()), 0.92); g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.sin(a) * len * 0.5 + 3, py + Math.cos(a) * len * 0.3 - 3, px + Math.sin(a) * len, py + Math.cos(a) * len * 0.55); g.quadraticCurveTo(px + Math.sin(a) * len * 0.5 - 2, py + Math.cos(a) * len * 0.3 + 3, px, py); g.fill(); }
      }
    }
  };
  /* 树。kind：'willow' 垂柳（早春的鹅黄）、'pine' 松、'plum' 梅（开着花）、'round' 寻常的阔叶树、'bare' 落了叶的。原点在树根，s=1 高三百上下 */
  P.tree = function (g, x, y, s, kind, o) {
    o = o || {}; const r = JX.rng(o.seed || 411); s = s || 1; kind = kind || 'round';
    g.save(); g.translate(x, y); g.scale(s, s);
    P.shadow(g, 0, 0, kind === 'pine' ? 60 : 80, 12, 0.32);
    const trunk = (pts, w0, w1, col) => { g.lineCap = 'round'; g.lineJoin = 'round'; for (let i = 0; i < pts.length - 1; i++) { const t = i / (pts.length - 1); g.strokeStyle = INK(0.9); g.lineWidth = w0 + (w1 - w0) * t + 2.4; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke(); } for (let i = 0; i < pts.length - 1; i++) { const t = i / (pts.length - 1); g.strokeStyle = col; g.lineWidth = w0 + (w1 - w0) * t; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke(); } };
    if (kind === 'willow') {
      trunk([[0, 0], [-6, -70], [8, -140], [2, -200]], 20, 9, '#5a4630'); trunk([[8, -140], [60, -200], [96, -236]], 9, 4, '#5a4630'); trunk([[2, -200], [-50, -250], [-92, -262]], 8, 4, '#5a4630'); trunk([[2, -200], [20, -262]], 7, 3, '#5a4630');
      g.lineCap = 'round';
      for (let i = 0; i < 90; i++) {                                                   // 垂下来的柳条
        const a = r(), bx = -110 + a * 230, by = -262 + Math.abs(bx) * 0.22 + r() * 30, len = 110 + r() * 110, sway = (r() - 0.5) * 26;
        g.strokeStyle = P.rgba(P.mix('#9db85a', '#dfe08a', r()), 0.55 + r() * 0.35); g.lineWidth = 1.5 + r() * 1.3;
        g.beginPath(); g.moveTo(bx, by); g.bezierCurveTo(bx + sway * 0.3, by + len * 0.4, bx + sway, by + len * 0.7, bx + sway * 1.2, by + len); g.stroke();
      }
    } else if (kind === 'pine') {
      trunk([[0, 0], [8, -80], [-6, -160], [6, -240]], 18, 8, '#6a4a34'); trunk([[8, -80], [70, -110]], 8, 4, '#6a4a34'); trunk([[-6, -160], [-72, -182]], 8, 4, '#6a4a34'); trunk([[6, -240], [50, -262]], 6, 3, '#6a4a34');
      [[84, -122, 104], [-86, -196, 110], [60, -276, 96], [-14, -306, 92], [-44, -118, 80], [10, -214, 84]].forEach(p => {
        for (let k = 0; k < 6; k++) { const px = p[0] + (k - 2.5) * p[2] * 0.2, py = p[1] - (k % 2) * 12 - (k === 2 || k === 3 ? 10 : 0); g.fillStyle = P.mix('#28422e', '#5d8054', k / 6 * 0.7 + r() * 0.3); g.beginPath(); g.ellipse(px, py, p[2] * 0.3, 24, 0, Math.PI, 0); g.lineTo(px + p[2] * 0.3, py + 7); g.lineTo(px - p[2] * 0.3, py + 7); g.closePath(); g.fill(); g.strokeStyle = INK(0.45); g.lineWidth = 1; g.stroke(); }
        g.strokeStyle = 'rgba(16,30,18,0.5)'; g.lineWidth = 1; for (let k = 0; k < 40; k++) { const px = p[0] + (r() - 0.5) * p[2] * 1.1, py = p[1] - r() * 26; g.beginPath(); g.moveTo(px, py + 6); g.lineTo(px + (r() - 0.5) * 7, py - 6); g.stroke(); }
      });
    } else {
      const tc = kind === 'plum' ? '#3a2c26' : '#5e4832';
      trunk([[0, 0], [-10, -60], [6, -120], [-4, -170]], kind === 'plum' ? 14 : 20, 8, tc);
      const br = [[[6, -120], [64, -168], [108, -176]], [[-4, -170], [-60, -214], [-104, -210]], [[-4, -170], [20, -226], [56, -258]], [[-10, -60], [-66, -92], [-96, -124]], [[-4, -170], [-22, -236], [-8, -276]]];
      br.forEach(b => trunk(b, 8, 3, tc));
      if (kind === 'plum') {
        br.forEach(b => { for (let i = 0; i < 16; i++) { const t = r(), k = t < 0.5 ? 0 : 1, u = t < 0.5 ? t * 2 : (t - 0.5) * 2, px = b[k][0] + (b[k + 1][0] - b[k][0]) * u + (r() - 0.5) * 22, py = b[k][1] + (b[k + 1][1] - b[k][1]) * u + (r() - 0.5) * 22, col = o.flower || (r() < 0.75 ? '#e59aa8' : '#f6dfe0'); for (let m = 0; m < 5; m++) P.ellipse(g, px + Math.cos(m * 1.257) * 3.4, py + Math.sin(m * 1.257) * 3.4, 3, 2.6, col); P.ellipse(g, px, py, 1.5, 1.5, '#b33a2a'); } });
      } else if (kind === 'bare') {
        br.forEach(b => { const e = b[2]; for (let i = 0; i < 5; i++) { const a = -1.57 + (r() - 0.5) * 2.4, l = 20 + r() * 34; g.strokeStyle = INK(0.75); g.lineWidth = 1.4; g.beginPath(); g.moveTo(e[0] - (e[0] - b[1][0]) * r() * 0.6, e[1] - (e[1] - b[1][1]) * r() * 0.6); g.lineTo(e[0] + Math.cos(a) * l, e[1] + Math.sin(a) * l); g.stroke(); } });
      } else {
        const dk = o.dk || '#3d6238', lt = o.lt || '#8fb060';
        [[4, -206, 86], [100, -190, 66], [-98, -214, 68], [54, -268, 70], [-90, -136, 54], [-12, -292, 72], [-52, -256, 64], [84, -246, 58]].forEach(p => leafBall(g, r, p[0], p[1], p[2], dk, lt));
      }
    }
    g.restore();
  };
  /* 盆景、盆花。kind：'pine' 小松、'orchid' 兰、'plum' 梅枝、'bamboo' 文竹、'chrys' 一团花。o.stand 给高度就垫一张花几。原点在盆（或花几）脚下 */
  P.potted = function (g, x, y, s, kind, o) {
    o = o || {}; const r = JX.rng(o.seed || 421); s = s || 1; kind = kind || 'orchid';
    g.save(); g.translate(x, y); g.scale(s, s);
    P.shadow(g, 0, 0, 26, 6, 0.35);
    let top = 0;
    if (o.stand) { const sh = o.stand; g.fillStyle = '#4a3020'; g.fillRect(-17, -sh, 34, 5); g.strokeStyle = INK(); g.lineWidth = 1.2; g.strokeRect(-17, -sh, 34, 5); [-13, 13].forEach(px => { P.line(g, px, -sh + 5, px * 1.15, 0, 3.4, '#4a3020'); }); P.line(g, -13, -sh * 0.4, 13, -sh * 0.4, 2, '#4a3020'); top = -sh; }
    const pc = o.pot || (kind === 'pine' || kind === 'plum' ? '#6f5a48' : '#dfe6e2');
    g.fillStyle = P.hgrad(g, -17, 0, 34, [[0, P.dark(pc, 0.3)], [0.4, P.light(pc, 0.2)], [1, P.dark(pc, 0.4)]]);
    g.beginPath(); g.moveTo(-17, top - 20); g.lineTo(17, top - 20); g.lineTo(12, top); g.lineTo(-12, top); g.closePath(); g.fill(); g.strokeStyle = INK(); g.lineWidth = 1.3; g.stroke();
    g.fillStyle = P.dark(pc, 0.15); g.fillRect(-19, top - 24, 38, 5); g.strokeRect(-19, top - 24, 38, 5);
    if (pc === '#dfe6e2') { g.strokeStyle = 'rgba(59,107,130,0.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-10, top - 12); g.quadraticCurveTo(0, top - 18, 10, top - 12); g.moveTo(-8, top - 6); g.quadraticCurveTo(0, top - 11, 8, top - 6); g.stroke(); }
    const by = top - 24;
    if (kind === 'pine') {
      g.strokeStyle = '#5a4030'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, by); g.bezierCurveTo(-14, by - 20, 16, by - 30, 4, by - 52); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(4, by - 30); g.lineTo(26, by - 36); g.stroke();
      [[6, by - 58, 22], [28, by - 40, 16], [-14, by - 30, 14]].forEach(p => { g.fillStyle = '#3f6044'; g.beginPath(); g.ellipse(p[0], p[1], p[2], 8, 0, Math.PI, 0); g.closePath(); g.fill(); g.strokeStyle = INK(0.6); g.lineWidth = 1; g.stroke(); g.fillStyle = '#6a8c5c'; g.beginPath(); g.ellipse(p[0] - 3, p[1] - 2, p[2] * 0.6, 4, 0, Math.PI, 0); g.fill(); });
    } else if (kind === 'plum') {
      g.strokeStyle = '#3a2c26'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, by); g.lineTo(-6, by - 22); g.lineTo(10, by - 40); g.lineTo(2, by - 66); g.moveTo(10, by - 40); g.lineTo(30, by - 52); g.moveTo(-6, by - 22); g.lineTo(-24, by - 38); g.stroke();
      for (let i = 0; i < 14; i++) { const q = [[2, by - 66], [30, by - 52], [-24, by - 38], [10, by - 40], [-2, by - 54], [20, by - 46]][i % 6], px = q[0] + (r() - 0.5) * 16, py = q[1] + (r() - 0.5) * 14; for (let m = 0; m < 5; m++) P.ellipse(g, px + Math.cos(m * 1.257) * 2.6, py + Math.sin(m * 1.257) * 2.6, 2.4, 2, o.flower || '#e59aa8'); P.ellipse(g, px, py, 1.2, 1.2, '#b33a2a'); }
    } else if (kind === 'bamboo') {
      for (let i = 0; i < 4; i++) { const bx = (i - 1.5) * 6, hh = 40 + r() * 26; g.strokeStyle = '#6f9a54'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (r() - 0.5) * 8, by - hh); g.stroke(); for (let k = 0; k < 5; k++) { const py = by - hh * (0.4 + r() * 0.6), dir = r() < 0.5 ? -1 : 1; g.fillStyle = P.mix('#4f7a3a', '#a2c070', r()); g.beginPath(); g.ellipse(bx + dir * 8, py, 9, 2.4, dir * 0.5, 0, 6.3); g.fill(); } }
    } else if (kind === 'chrys') {
      leafBall(g, r, 0, by - 14, 17, '#3f5f38', '#86a85e');
      for (let i = 0; i < 6; i++) { const px = (r() - 0.5) * 30, py = by - 12 - r() * 22, col = o.flower || ['#e9c24a', '#f1ece0', '#c9627a'][i % 3]; for (let m = 0; m < 8; m++) P.ellipse(g, px + Math.cos(m * 0.785) * 4, py + Math.sin(m * 0.785) * 4, 3, 2, col); P.ellipse(g, px, py, 2, 2, '#b8862a'); }
    } else {
      g.lineCap = 'round'; for (let i = 0; i < 11; i++) { const a = -1.57 + (i - 5) * 0.2 + (r() - 0.5) * 0.1, len = 34 + r() * 22; g.strokeStyle = P.mix('#3f6a40', '#8fb46a', r()); g.lineWidth = 2.6; g.beginPath(); g.moveTo(0, by); g.quadraticCurveTo(Math.cos(a) * len * 0.7, by + Math.sin(a) * len, Math.cos(a) * len * 1.25, by + Math.sin(a) * len * 0.55); g.stroke(); }
      [[-6, by - 34], [8, by - 40], [1, by - 48]].forEach(q => { for (let m = 0; m < 3; m++) P.ellipse(g, q[0] + Math.cos(m * 2.1 - 1.57) * 4, q[1] + Math.sin(m * 2.1 - 1.57) * 3.4, 3.4, 1.8, o.flower || '#e9e2b0'); P.ellipse(g, q[0], q[1], 1.4, 1.4, '#9d3f52'); });
    }
    g.restore();
  };
  /* 花坛：一圈矮石沿，里头土和花。原点在左上角 */
  P.flowerbed = function (g, x, y, w, h, o) {
    o = o || {}; const r = JX.rng(o.seed || 431);
    g.save(); g.fillStyle = 'rgba(20,14,8,0.25)'; g.fillRect(x + 3, y + 5, w, h);
    g.fillStyle = '#8f8a7e'; g.fillRect(x, y, w, h); g.strokeStyle = INK(0.8); g.lineWidth = 1.4; g.strokeRect(x, y, w, h);
    for (let px = x + 30; px < x + w; px += 30) P.line(g, px, y, px, y + 6, 1, 'rgba(0,0,0,0.3)'), P.line(g, px - 12, y + h - 6, px - 12, y + h, 1, 'rgba(0,0,0,0.3)');
    g.fillStyle = '#5a4630'; g.fillRect(x + 6, y + 6, w - 12, h - 12);
    g.beginPath(); g.rect(x + 6, y + 6, w - 12, h - 12); g.clip();
    for (let i = 0; i < w * h / 260; i++) { const px = x + 6 + r() * (w - 12), py = y + 8 + r() * (h - 14); g.fillStyle = P.mix('#3f5f38', '#86a85e', r()); g.beginPath(); g.ellipse(px, py, 6, 3, r() * 3, 0, 6.3); g.fill(); }
    const cols = o.cols || ['#c9454a', '#f1ece0', '#e9c24a', '#d98aa0'];
    for (let i = 0; i < w * h / 700; i++) { const px = x + 10 + r() * (w - 20), py = y + 10 + r() * (h - 20), col = cols[Math.floor(r() * cols.length)]; for (let m = 0; m < 5; m++) P.ellipse(g, px + Math.cos(m * 1.257) * 3, py + Math.sin(m * 1.257) * 2.6, 2.6, 2.2, col); P.ellipse(g, px, py, 1.4, 1.4, '#d7a544'); }
    g.restore();
  };
  /* 芦苇：水边一丛。原点在根部正中 */
  P.reeds = function (g, x, y, w, h, o) {
    o = o || {}; const r = JX.rng(o.seed || 441); g.lineCap = 'round';
    for (let i = 0; i < w / 4; i++) {
      const bx = x + (r() - 0.5) * w, hh = h * (0.5 + r() * 0.5), lean = (r() - 0.5) * 26 + (o.lean || 8);
      g.strokeStyle = P.rgba(P.mix('#8a8a4a', '#cfc98a', r()), 0.9); g.lineWidth = 1.4 + r(); g.beginPath(); g.moveTo(bx, y); g.quadraticCurveTo(bx + lean * 0.3, y - hh * 0.6, bx + lean, y - hh); g.stroke();
      if (r() < 0.4) { g.strokeStyle = P.rgba('#b9a27a', 0.9); g.lineWidth = 4; g.beginPath(); g.moveTo(bx + lean * 0.86, y - hh * 0.9); g.lineTo(bx + lean * 1.1, y - hh * 1.06); g.stroke(); }
    }
  };
  /* 篱笆：竹片扎的，从 (x1,y) 到 (x2,y)，y 是脚下。o.thorn 上头压着一层荆棘（棘篱），o.h 高 */
  P.fence = function (g, x1, y, x2, o) {
    o = o || {}; const r = JX.rng(o.seed || 451), h = o.h || 70, col = o.col || '#a89460';
    P.line(g, x1, y - h * 0.28, x2, y - h * 0.28, 4, P.dark(col, 0.35)); P.line(g, x1, y - h * 0.74, x2, y - h * 0.74, 4, P.dark(col, 0.35));
    for (let px = x1; px <= x2; px += 11) { const hh = h * (0.92 + r() * 0.16); g.fillStyle = P.mix(P.dark(col, 0.2), P.light(col, 0.15), r()); g.beginPath(); g.moveTo(px - 3.6, y); g.lineTo(px - 3.6, y - hh + 6); g.lineTo(px, y - hh); g.lineTo(px + 3.6, y - hh + 6); g.lineTo(px + 3.6, y); g.closePath(); g.fill(); g.strokeStyle = INK(0.6); g.lineWidth = 0.9; g.stroke(); }
    if (o.thorn) { g.lineCap = 'round'; for (let i = 0; i < (x2 - x1) / 5; i++) { const px = x1 + r() * (x2 - x1), py = y - h - 4 + r() * 16; g.strokeStyle = P.rgba(P.mix('#4a3c2a', '#7a6a44', r()), 0.9); g.lineWidth = 1.4; g.beginPath(); g.moveTo(px, py + 10); g.quadraticCurveTo(px + (r() - 0.5) * 20, py - 6, px + (r() - 0.5) * 34, py - 12 - r() * 8); g.stroke(); } }
  };

  /* ---------- 远山 ---------- */
  /* 一层一层的远山：从 y（山脚）往上画，h 是最高那层的高度。o.layers 几层，o.col 近处的颜色，o.far 远处的颜色，o.mist 山脚的雾 */
  P.hills = function (ctx, x, y, w, h, o) {
    o = o || {}; const seed = o.seed || 461, n = o.layers || 3, near = o.col || '#5f7f78', far = o.far || '#b7c6c4';
    for (let k = 0; k < n; k++) {
      const t = n === 1 ? 1 : k / (n - 1), hh = h * (1 - t * 0.45), r = JX.rng(seed + k * 7), ph = r() * 9, base = y - (1 - t) * h * 0.06;
      ctx.beginPath(); ctx.moveTo(x, y + 4);
      for (let px = x; px <= x + w; px += 20) { const u = (px - x) / 400, v = Math.sin(u * 1.3 + ph) * 0.5 + Math.sin(u * 2.9 + ph * 2) * 0.28 + Math.sin(u * 6.1 + ph) * 0.12 + Math.sin(u * 13 + ph * 3) * 0.05; ctx.lineTo(px, base - hh * (0.48 + v * 0.52)); }
      ctx.lineTo(x + w, y + 4); ctx.closePath();
      const col = P.mix(far, near, t);
      ctx.fillStyle = P.vgrad(ctx, 0, y - hh, hh, [[0, col], [1, P.mix(col, far, 0.55)]]); ctx.fill();
      if (t > 0.6 && o.trees !== false) { ctx.fillStyle = P.rgba(P.dark(near, 0.35), 0.5); for (let i = 0; i < w / 26; i++) { const px = x + r() * w, u = (px - x) / 400, v = Math.sin(u * 1.3 + ph) * 0.5 + Math.sin(u * 2.9 + ph * 2) * 0.28 + Math.sin(u * 6.1 + ph) * 0.12 + Math.sin(u * 13 + ph * 3) * 0.05, py = base - hh * (0.48 + v * 0.52) + 8 + r() * hh * 0.4; ctx.beginPath(); ctx.ellipse(px, py, 8 + r() * 10, 5 + r() * 5, 0, 0, 6.3); ctx.fill(); } }
    }
    if (o.mist !== false) { ctx.fillStyle = P.vgrad(ctx, 0, y - h * 0.4, h * 0.42, [[0, 'rgba(236,236,226,0)'], [1, 'rgba(236,236,226,0.75)']]); ctx.fillRect(x, y - h * 0.4, w, h * 0.42); }
  };
})();
