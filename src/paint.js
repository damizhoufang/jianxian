/* 画法库：宋画路子的程序化绘制。所有函数都在“单位坐标”里画，调用前画布已按 JX.S 放大。 */
'use strict';
(function () {
  const JX = window.JX;
  const P = JX.P = {};

  /* 颜料盘：矿物色与宋瓷色 */
  P.C = {
    ink: '#2b221c', paper: '#e9ddc4', silk: '#d9c7a0',
    zhusha: '#b33a2a', yanzhi: '#9d3f52', tenghuang: '#d7a544', zheshi: '#9a5b3c',
    shiqing: '#3b6b82', shilv: '#5d8a6b', huaqing: '#2e4257', yuebai: '#d9e3e0', ouse: '#d8b8b0',
    qingbu: '#4a5f73', hebu: '#7b6a55',
    woodDark: '#3f2b1e', wood: '#74512f', woodMid: '#8c6641', woodLight: '#b08a5c', lacquer: '#8a3120',
    plaster: '#dccdae', plasterShade: '#c2b08d', stone: '#8d877c', stoneDark: '#6c675f', brick: '#7d6a5c',
    celadon: '#a9c4b0', whiteware: '#ece6d8', blackware: '#2f2622',
    skin: '#ecd0ae', skinShade: '#d6b08a', hair: '#1f1a18',
  };
  const C = P.C;

  /* ---------- 颜色运算 ---------- */
  function rgb(hex) {
    if (hex[0] !== '#') { const m = hex.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2]]; }
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  P.rgba = (hex, a) => { const c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  P.mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')'; };
  P.dark = (hex, t) => P.mix(hex, '#120d0a', t);
  P.light = (hex, t) => P.mix(hex, '#fff6e2', t);

  /* ---------- 基本笔触 ---------- */
  P.line = function (ctx, x1, y1, x2, y2, w, col) {
    ctx.strokeStyle = col || C.ink; ctx.lineWidth = w || 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  P.poly = function (ctx, pts, fill, stroke, w) {
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 1.5; ctx.lineJoin = 'round'; ctx.stroke(); }
  };
  P.rect = function (ctx, x, y, w, h, fill, stroke, lw) {
    if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.strokeRect(x, y, w, h); }
  };
  P.ellipse = function (ctx, x, y, rx, ry, fill, stroke, lw) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); }
  };
  /* 柔和的影子 */
  P.shadow = function (ctx, x, y, rx, ry, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, 'rgba(20,12,8,' + (a == null ? 0.38 : a) + ')'); g.addColorStop(1, 'rgba(20,12,8,0)');
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };
  P.vgrad = function (ctx, x, y, h, stops) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    stops.forEach((s, i) => g.addColorStop(s[0], s[1]));
    return g;
  };
  P.hgrad = function (ctx, x, y, w, stops) {
    const g = ctx.createLinearGradient(x, y, x + w, y);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    return g;
  };
  /* 墙根、桌底那种顺着一条边压暗 */
  P.ao = function (ctx, x, y, w, h, side, a) {
    let g;
    const c0 = 'rgba(18,10,6,' + ((a == null ? 0.35 : a) * 0.55).toFixed(3) + ')', c1 = 'rgba(18,10,6,0)';
    if (side === 'top') g = P.vgrad(ctx, x, y, h, [[0, c0], [1, c1]]);
    else if (side === 'bottom') g = P.vgrad(ctx, x, y, h, [[0, c1], [1, c0]]);
    else if (side === 'left') g = P.hgrad(ctx, x, y, w, [[0, c0], [1, c1]]);
    else g = P.hgrad(ctx, x, y, w, [[0, c1], [1, c0]]);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  };

  /* ---------- 纸与绢的质地 ---------- */
  let grain = null;
  function grainTile() {
    if (grain) return grain;
    const n = 256, cv = document.createElement('canvas'); cv.width = cv.height = n;
    const c = cv.getContext('2d'), im = c.createImageData(n, n), r = JX.rng(7);
    for (let i = 0; i < n * n; i++) {
      const v = 205 + Math.floor(r() * 50) - ((i % n) % 3 === 0 ? 5 : 0) - ((Math.floor(i / n)) % 3 === 0 ? 5 : 0);   // 细噪点加一点经纬纹
      im.data[i * 4] = v; im.data[i * 4 + 1] = v - 3; im.data[i * 4 + 2] = v - 10; im.data[i * 4 + 3] = 255;
    }
    c.putImageData(im, 0, 0);
    grain = cv; return cv;
  }
  P.grainTile = grainTile;
  /* 给整张底图罩一层绢纹和旧色 */
  P.paper = function (ctx, w, h, seed, strength) {
    const r = JX.rng(seed || 1);
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = strength == null ? 0.55 : strength;
    const pat = ctx.createPattern(grainTile(), 'repeat');
    ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    for (let i = 0; i < w * h / 26000; i++) {           // 水渍与旧斑
      const x = r() * w, y = r() * h, rad = 40 + r() * 160;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(150,120,80,' + (0.03 + r() * 0.05) + ')'); g.addColorStop(1, 'rgba(150,120,80,0)');
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    ctx.restore();
  };

  /* ---------- 地面 ---------- */
  P.planks = function (ctx, x, y, w, h, o) {
    o = o || {};
    const r = JX.rng(o.seed || 11), base = o.base || C.woodMid, pw = o.pw || 44;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    for (let py = y; py < y + h; py += pw) {
      let px = x - r() * 260;
      while (px < x + w) {
        const len = 240 + r() * 300, t = r();
        ctx.fillStyle = t < 0.5 ? P.rgba('#2a1a0e', 0.03 + r() * 0.1) : P.rgba('#ffe7b8', 0.02 + r() * 0.07);
        ctx.fillRect(px, py, len, pw);
        for (let k = 0; k < 5; k++) {                       // 木纹
          const gy = py + 4 + r() * (pw - 8);
          ctx.strokeStyle = P.rgba('#2a1a0e', 0.05 + r() * 0.09); ctx.lineWidth = 0.8 + r() * 0.8;
          ctx.beginPath(); ctx.moveTo(px + r() * 30, gy);
          ctx.bezierCurveTo(px + len * 0.3, gy + (r() - 0.5) * 5, px + len * 0.6, gy + (r() - 0.5) * 5, px + len - r() * 30, gy + (r() - 0.5) * 3);
          ctx.stroke();
        }
        if (r() < 0.25) {                                   // 节疤
          const kx = px + 30 + r() * (len - 60), ky = py + pw * (0.3 + r() * 0.4);
          P.ellipse(ctx, kx, ky, 5 + r() * 4, 3 + r() * 2, P.rgba('#2a1a0e', 0.22));
          P.ellipse(ctx, kx, ky, 9 + r() * 5, 5 + r() * 2, null, P.rgba('#2a1a0e', 0.12), 1);
        }
        ctx.fillStyle = P.rgba('#1a0f08', 0.45); ctx.fillRect(px + len - 1.2, py, 1.6, pw);   // 接缝
        px += len;
      }
      ctx.fillStyle = P.rgba('#1a0f08', 0.5); ctx.fillRect(x, py - 0.9, w, 1.8);
      ctx.fillStyle = P.rgba('#fff0cc', 0.07); ctx.fillRect(x, py + 1, w, 1.2);
    }
    ctx.restore();
  };
  P.flagstones = function (ctx, x, y, w, h, o) {
    o = o || {};
    const r = JX.rng(o.seed || 23), base = o.base || C.stone, sh = o.sh || 64;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    for (let py = y; py < y + h; py += sh) {
      let px = x - r() * 120;
      while (px < x + w) {
        const len = 90 + r() * 110;
        ctx.fillStyle = r() < 0.5 ? P.rgba('#1c1814', 0.04 + r() * 0.13) : P.rgba('#fff3da', 0.03 + r() * 0.08);
        ctx.fillRect(px + 1.5, py + 1.5, len - 3, sh - 3);
        for (let k = 0; k < 7; k++) P.ellipse(ctx, px + r() * len, py + r() * sh, 1 + r() * 2.5, 0.8 + r() * 1.5, P.rgba('#1c1814', 0.06 + r() * 0.08));
        if (r() < 0.18) {                                   // 裂纹
          ctx.strokeStyle = P.rgba('#1c1814', 0.3); ctx.lineWidth = 1;
          ctx.beginPath(); const cx = px + r() * len, cy = py + r() * sh; ctx.moveTo(cx, cy);
          ctx.lineTo(cx + (r() - 0.5) * 40, cy + (r() - 0.5) * 30); ctx.lineTo(cx + (r() - 0.5) * 70, cy + (r() - 0.5) * 50); ctx.stroke();
        }
        ctx.strokeStyle = P.rgba('#1c1814', 0.42); ctx.lineWidth = 2; ctx.strokeRect(px, py, len, sh);
        px += len;
      }
    }
    if (o.snow) {                                           // 石缝里的积雪
      for (let i = 0; i < w * h / 900; i++) P.ellipse(ctx, x + r() * w, y + r() * h, 8 + r() * 30, 4 + r() * 12, P.rgba('#f4f6f8', 0.25 + r() * 0.3));
    }
    ctx.restore();
  };

  /* ---------- 墙、柱、窗 ---------- */
  P.plaster = function (ctx, x, y, w, h, o) {
    o = o || {};
    const r = JX.rng(o.seed || 31);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = P.vgrad(ctx, x, y, h, [[0, P.dark(o.base || C.plaster, 0.22)], [0.35, o.base || C.plaster], [1, P.dark(o.base || C.plaster, 0.12)]]);
    ctx.fillRect(x, y, w, h);
    for (let i = 0; i < w / 40; i++) {                      // 烟熏和潮斑
      const bx = x + r() * w, by = y + r() * h, rad = 30 + r() * 90;
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
      g.addColorStop(0, 'rgba(90,70,45,' + (0.04 + r() * 0.07) + ')'); g.addColorStop(1, 'rgba(90,70,45,0)');
      ctx.fillStyle = g; ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    ctx.restore();
  };
  P.brick = function (ctx, x, y, w, h, o) {
    o = o || {};
    const r = JX.rng(o.seed || 37), bh = o.bh || 22, bw = o.bw || 62, base = o.base || C.brick;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = base; ctx.fillRect(x, y, w, h);
    let row = 0;
    for (let py = y; py < y + h; py += bh, row++) {
      for (let px = x - (row % 2) * bw / 2; px < x + w; px += bw) {
        ctx.fillStyle = r() < 0.5 ? P.rgba('#16100c', 0.05 + r() * 0.16) : P.rgba('#ffe9c8', 0.02 + r() * 0.08);
        ctx.fillRect(px + 1, py + 1, bw - 2, bh - 2);
      }
      ctx.fillStyle = P.rgba('#16100c', 0.4); ctx.fillRect(x, py, w, 1.6);
    }
    row = 0;
    for (let py = y; py < y + h; py += bh, row++)
      for (let px = x - (row % 2) * bw / 2; px < x + w; px += bw) { ctx.fillStyle = P.rgba('#16100c', 0.35); ctx.fillRect(px, py, 1.6, bh); }
    ctx.restore();
  };
  /* 木柱：朱漆或素木，带一道高光 */
  P.post = function (ctx, x, y, w, h, col) {
    col = col || C.lacquer;
    ctx.fillStyle = P.hgrad(ctx, x, y, w, [[0, P.dark(col, 0.45)], [0.3, P.light(col, 0.12)], [0.55, col], [1, P.dark(col, 0.55)]]);
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = P.rgba(C.ink, 0.7); ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = P.dark(col, 0.5); ctx.fillRect(x - 4, y + h - 14, w + 8, 14);       // 柱础
    ctx.fillStyle = P.rgba('#000', 0.25); ctx.fillRect(x - 4, y + h - 14, w + 8, 3);
  };
  P.beam = function (ctx, x, y, w, h, col) {
    col = col || C.woodDark;
    ctx.fillStyle = P.vgrad(ctx, x, y, h, [[0, P.light(col, 0.18)], [0.4, col], [1, P.dark(col, 0.5)]]);
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = P.rgba(C.ink, 0.75); ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
  };
  /* 直棂窗或方格窗；窗外是夜色和灯影 */
  P.lattice = function (ctx, x, y, w, h, o) {
    o = o || {};
    const r = JX.rng(o.seed || 41);
    ctx.save();
    ctx.fillStyle = P.vgrad(ctx, x, y, h, o.sky || [[0, '#16203a'], [1, '#31405f']]);
    ctx.fillRect(x, y, w, h);
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (o.lights !== false) for (let i = 0; i < (o.n || 9); i++) {         // 远处的灯
      const lx = x + r() * w, ly = y + h * (0.25 + r() * 0.7), rad = 6 + r() * 16;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, rad);
      const col = r() < 0.7 ? '255,190,110' : '255,120,90';
      g.addColorStop(0, 'rgba(' + col + ',' + (0.5 + r() * 0.4) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.fillStyle = g; ctx.fillRect(lx - rad, ly - rad, rad * 2, rad * 2);
    }
    if (o.snow) for (let i = 0; i < 40; i++) P.ellipse(ctx, x + r() * w, y + r() * h, 1.2 + r() * 1.5, 1.2 + r() * 1.5, 'rgba(240,244,250,0.7)');
    const wood = o.wood || C.woodDark, step = o.step || 16;
    ctx.fillStyle = wood;
    for (let bx = x + step; bx < x + w - 2; bx += step) ctx.fillRect(bx - 1.6, y, 3.2, h);
    if (o.grid) for (let by = y + step; by < y + h - 2; by += step) ctx.fillRect(x, by - 1.6, w, 3.2);
    else { ctx.fillRect(x, y + h * 0.33 - 2, w, 4); ctx.fillRect(x, y + h * 0.66 - 2, w, 4); }
    ctx.restore();
    ctx.strokeStyle = wood; ctx.lineWidth = 9; ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    ctx.strokeStyle = P.rgba(C.ink, 0.8); ctx.lineWidth = 1.4; ctx.strokeRect(x - 6.5, y - 6.5, w + 13, h + 13);
    ctx.strokeStyle = P.rgba('#ffe2b0', 0.18); ctx.lineWidth = 1.2; ctx.strokeRect(x - 4, y - 4, w + 8, h + 8);
  };

  /* ---------- 灯 ---------- */
  P.lantern = function (ctx, x, y, r, o) {
    o = o || {};
    const col = o.col || '#d8432c', cord = o.cord == null ? 40 : o.cord, ry = r * (o.tall || 1.12);
    if (cord) P.line(ctx, x, y - ry - cord, x, y - ry, 1.4, P.rgba(C.ink, 0.8));
    const g = ctx.createRadialGradient(x, y + r * 0.1, r * 0.1, x, y, r * 1.15);
    g.addColorStop(0, '#fff1c0'); g.addColorStop(0.35, P.light(col, 0.35)); g.addColorStop(0.8, col); g.addColorStop(1, P.dark(col, 0.45));
    P.ellipse(ctx, x, y, r, ry, g, P.rgba(C.ink, 0.75), 1.3);
    ctx.strokeStyle = P.rgba('#5a1208', 0.35); ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) { if (!i) continue; ctx.beginPath(); ctx.ellipse(x, y, Math.abs(i) * r / 2.6, ry, 0, i < 0 ? Math.PI * 0.5 : -Math.PI * 0.5, i < 0 ? Math.PI * 1.5 : Math.PI * 0.5); ctx.stroke(); }
    P.line(ctx, x, y - ry, x, y + ry, 1, P.rgba('#5a1208', 0.3));
    ctx.fillStyle = '#2a1c14'; ctx.fillRect(x - r * 0.42, y - ry - 4, r * 0.84, 6); ctx.fillRect(x - r * 0.36, y + ry - 2, r * 0.72, 5);
    ctx.fillStyle = P.rgba(C.tenghuang, 0.9); ctx.fillRect(x - r * 0.42, y - ry - 1, r * 0.84, 1.4);
    if (o.tassel !== false) {
      const tl = o.tasselLen || r * 1.1;
      for (let i = -2; i <= 2; i++) P.line(ctx, x + i * 1.6, y + ry + 3, x + i * 2.6, y + ry + 3 + tl * (1 - Math.abs(i) * 0.08), 1.2, i % 2 ? C.tenghuang : C.zhusha);
    }
    if (o.text) { ctx.fillStyle = P.rgba('#3a0f08', 0.75); ctx.font = '600 ' + Math.round(r * 0.9) + 'px ' + P.KAI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.text, x, y + 1); }
  };
  /* 桌上的油灯、烛台 */
  P.candle = function (ctx, x, y) {
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - 5, y - 4, 10, 4); ctx.fillRect(x - 1.5, y - 16, 3, 13);
    P.ellipse(ctx, x, y - 16, 6, 2.2, '#4a3526');
    const g = ctx.createRadialGradient(x, y - 22, 0, x, y - 22, 6);
    g.addColorStop(0, '#fffbe0'); g.addColorStop(0.5, '#ffc45a'); g.addColorStop(1, 'rgba(255,150,40,0)');
    P.ellipse(ctx, x, y - 22, 3.2, 6, g);
  };

  P.KAI = '"Kaiti SC","STKaiti","KaiTi","楷体","LXGW WenKai","Noto Serif CJK SC","Songti SC",serif';
  P.SONG = '"Songti SC","STSong","Noto Serif CJK SC","Source Han Serif SC","SimSun",serif';
  /* 竖排的字：题壁、招牌、酒旗 */
  P.vtext = function (ctx, text, x, y, size, col, font, gap) {
    ctx.fillStyle = col || C.ink; ctx.font = (font || '') + ' ' + size + 'px ' + P.KAI;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    let cy = y;
    for (const ch of text) { if (ch === ' ') { cy += size * 0.5; continue; } ctx.fillText(ch, x, cy); cy += size * (gap || 1.08); }
    return cy;
  };

  /* ---------- 器物 ---------- */
  /* 酒坛：底部中心在 (x,y) */
  P.jar = function (ctx, x, y, s, o) {
    o = o || {};
    const r = JX.rng(o.seed || 1), glaze = o.glaze || (r() < 0.5 ? '#3b2a20' : '#4a3122');
    P.shadow(ctx, x + 6 * s, y + 2 * s, 40 * s, 12 * s, 0.4);
    ctx.beginPath();
    ctx.moveTo(x - 20 * s, y);
    ctx.bezierCurveTo(x - 30 * s, y - 20 * s, x - 38 * s, y - 46 * s, x - 31 * s, y - 64 * s);
    ctx.bezierCurveTo(x - 27 * s, y - 74 * s, x - 18 * s, y - 78 * s, x - 16 * s, y - 84 * s);
    ctx.lineTo(x + 16 * s, y - 84 * s);
    ctx.bezierCurveTo(x + 18 * s, y - 78 * s, x + 27 * s, y - 74 * s, x + 31 * s, y - 64 * s);
    ctx.bezierCurveTo(x + 38 * s, y - 46 * s, x + 30 * s, y - 20 * s, x + 20 * s, y);
    ctx.quadraticCurveTo(x, y + 7 * s, x - 20 * s, y);
    ctx.closePath();
    ctx.fillStyle = P.hgrad(ctx, x - 36 * s, y, 72 * s, [[0, P.dark(glaze, 0.5)], [0.28, P.light(glaze, 0.2)], [0.5, glaze], [1, P.dark(glaze, 0.6)]]);
    ctx.fill(); ctx.strokeStyle = P.rgba(C.ink, 0.85); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,236,200,0.22)'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';       // 釉面高光
    ctx.beginPath(); ctx.moveTo(x - 22 * s, y - 60 * s); ctx.quadraticCurveTo(x - 27 * s, y - 42 * s, x - 21 * s, y - 20 * s); ctx.stroke();
    ctx.strokeStyle = P.rgba('#000', 0.25); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x, y - 64 * s, 31 * s, 5 * s, 0, 0.1, Math.PI - 0.1); ctx.stroke();
    if (o.sealed !== false) {                                 // 泥封、封布、麻绳
      ctx.beginPath(); ctx.moveTo(x - 19 * s, y - 83 * s);
      ctx.bezierCurveTo(x - 20 * s, y - 100 * s, x + 20 * s, y - 100 * s, x + 19 * s, y - 83 * s);
      ctx.quadraticCurveTo(x, y - 78 * s, x - 19 * s, y - 83 * s); ctx.closePath();
      ctx.fillStyle = P.hgrad(ctx, x - 20 * s, y, 40 * s, [[0, '#8b7453'], [0.35, '#c7ad82'], [1, '#7c6648']]); ctx.fill();
      ctx.strokeStyle = P.rgba(C.ink, 0.8); ctx.lineWidth = 1.3; ctx.stroke();
      ctx.strokeStyle = '#6a4f30'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.ellipse(x, y - 84 * s, 18 * s, 3.5 * s, 0, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = P.rgba(C.zhusha, 0.9); ctx.fillRect(x - 3.5 * s, y - 97 * s, 7 * s, 13 * s);
    } else {
      P.ellipse(ctx, x, y - 84 * s, 16 * s, 4.5 * s, '#140d0a', P.rgba(C.ink, 0.8), 1.2);
      P.ellipse(ctx, x, y - 83.5 * s, 12 * s, 3 * s, 'rgba(120,70,30,0.55)');
    }
    if (o.label !== false) {                                  // 斗方红笺
      ctx.save(); ctx.translate(x + 1 * s, y - 40 * s); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = o.labelCol || '#b5382a'; ctx.fillRect(-13 * s, -13 * s, 26 * s, 26 * s);
      ctx.strokeStyle = P.rgba('#5a120a', 0.6); ctx.lineWidth = 1; ctx.strokeRect(-13 * s, -13 * s, 26 * s, 26 * s);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#1e1410'; ctx.font = '600 ' + Math.round(18 * s) + 'px ' + P.KAI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(o.text || '酒', 0, 1 * s);
      ctx.restore();
    }
  };
  /* 桌子：(x,y) 是前沿正中的落地点；w 宽，d 桌面进深，h 高 */
  P.table = function (ctx, x, y, w, d, h, o) {
    o = o || {};
    const col = o.col || '#5a3d28', x0 = x - w / 2, ty = y - h - d;
    P.shadow(ctx, x, y - d * 0.4, w * 0.62, d * 0.75, 0.42);
    ctx.fillStyle = P.dark(col, 0.45);
    ctx.fillRect(x0 + 8, y - h, 9, h); ctx.fillRect(x0 + w - 17, y - h, 9, h);
    ctx.fillRect(x0 + 14, y - h - d * 0.5, 7, h * 0.7); ctx.fillRect(x0 + w - 21, y - h - d * 0.5, 7, h * 0.7);
    ctx.fillStyle = P.dark(col, 0.3); ctx.fillRect(x0 + 17, y - h * 0.45, w - 34, 5);              // 横枨
    ctx.fillStyle = P.vgrad(ctx, x0, ty, d, [[0, P.light(col, 0.16)], [1, P.light(col, 0.04)]]);
    ctx.fillRect(x0, ty, w, d);
    const r = JX.rng(o.seed || 5);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, ty, w, d); ctx.clip();
    for (let i = 0; i < 7; i++) { ctx.strokeStyle = P.rgba('#1c110a', 0.08 + r() * 0.1); ctx.lineWidth = 1; const gy = ty + r() * d; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.bezierCurveTo(x0 + w * 0.3, gy + 3, x0 + w * 0.7, gy - 3, x0 + w, gy + 1); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = P.vgrad(ctx, x0, y - h, 13, [[0, P.dark(col, 0.2)], [1, P.dark(col, 0.5)]]);
    ctx.fillRect(x0, y - h, w, 13);
    ctx.strokeStyle = P.rgba(C.ink, 0.85); ctx.lineWidth = 1.5; ctx.strokeRect(x0, ty, w, d); ctx.strokeRect(x0, y - h, w, 13);
    ctx.fillStyle = 'rgba(255,236,200,0.16)'; ctx.fillRect(x0 + 2, ty + 2, w - 4, 2);
  };
  P.bench = function (ctx, x, y, w, o) { P.table(ctx, x, y, w, 20, 24, Object.assign({ col: '#614430' }, o || {})); };
  /* 桌面上的杯盘酒菜 */
  P.dishes = function (ctx, x, y, w, d, seed, n) {
    const r = JX.rng(seed || 3), wares = [C.celadon, C.whiteware, C.celadon, C.blackware, '#b9cdd0'];
    const foods = ['#b5562e', '#d9a441', '#7d9a55', '#c9b48c', '#a03a2a', '#e3d2a6', '#6d8f6a'];
    n = n || 4;
    for (let i = 0; i < n; i++) {
      const px = x - w / 2 + 22 + r() * (w - 44), py = y - d + 9 + r() * (d - 18), rx = 11 + r() * 6, ware = wares[Math.floor(r() * wares.length)];
      P.ellipse(ctx, px + 2, py + 2, rx, rx * 0.46, 'rgba(0,0,0,0.25)');
      P.ellipse(ctx, px, py, rx, rx * 0.46, ware, P.rgba(C.ink, 0.6), 1);
      P.ellipse(ctx, px, py - 0.6, rx * 0.66, rx * 0.28, foods[Math.floor(r() * foods.length)]);
      P.ellipse(ctx, px - rx * 0.2, py - 1.4, rx * 0.2, rx * 0.08, 'rgba(255,255,255,0.35)');
    }
    const ex = x - w / 2 + 26 + r() * (w - 52), ey = y - d * 0.45;                                 // 注子（酒壶）
    P.ellipse(ctx, ex + 2, ey + 3, 9, 4, 'rgba(0,0,0,0.3)');
    ctx.beginPath(); ctx.moveTo(ex - 7, ey + 2); ctx.bezierCurveTo(ex - 11, ey - 10, ex - 5, ey - 18, ex - 3, ey - 22); ctx.lineTo(ex + 3, ey - 22);
    ctx.bezierCurveTo(ex + 5, ey - 18, ex + 11, ey - 10, ex + 7, ey + 2); ctx.closePath();
    ctx.fillStyle = P.hgrad(ctx, ex - 10, ey, 20, [[0, '#8fae9a'], [0.4, '#c6dccb'], [1, '#7c9a88']]); ctx.fill();
    ctx.strokeStyle = P.rgba(C.ink, 0.7); ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex + 7, ey - 8); ctx.quadraticCurveTo(ex + 16, ey - 12, ex + 15, ey - 20); ctx.stroke();
    for (let i = 0; i < 2; i++) { const cx = ex + (i ? 22 : -20), cy = ey + 4 - i * 6; P.ellipse(ctx, cx, cy, 5, 2.4, C.whiteware, P.rgba(C.ink, 0.6), 0.8); P.ellipse(ctx, cx, cy, 3.4, 1.4, 'rgba(180,120,50,0.6)'); }
  };
  /* 蒸笼（叠 n 层） */
  P.steamer = function (ctx, x, y, r, n) {
    for (let i = 0; i < n; i++) {
      const cy = y - i * r * 0.42;
      ctx.fillStyle = P.hgrad(ctx, x - r, cy, r * 2, [[0, '#8c6a3c'], [0.35, '#d0ac72'], [1, '#7f5f35']]);
      ctx.beginPath(); ctx.ellipse(x, cy, r, r * 0.36, 0, 0, Math.PI); ctx.lineTo(x - r, cy - r * 0.4); ctx.ellipse(x, cy - r * 0.4, r, r * 0.36, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = P.rgba(C.ink, 0.7); ctx.lineWidth = 1.2; ctx.stroke();
      P.line(ctx, x - r, cy - r * 0.2, x + r, cy - r * 0.2, 1, P.rgba('#4a3418', 0.5));
    }
    const ty = y - n * r * 0.42;
    P.ellipse(ctx, x, ty, r, r * 0.36, '#c9a56b', P.rgba(C.ink, 0.7), 1.2);
    ctx.strokeStyle = P.rgba('#4a3418', 0.35); ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(x, ty, Math.abs(i) * r / 3.6 + 1, r * 0.36, 0, 0, Math.PI * 2); ctx.stroke(); }
    P.ellipse(ctx, x, ty - 2, r * 0.14, r * 0.07, '#5b4226');
  };
  /* 光晕（画在叠加层上） */
  P.glow = function (ctx, x, y, r, col, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, P.rgba(col, a)); g.addColorStop(0.4, P.rgba(col, a * 0.35)); g.addColorStop(1, P.rgba(col, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  /* 彩绸一段：从 (x1,y1) 垂到 (x2,y2) */
  P.swag = function (ctx, x1, y1, x2, y2, sag, w, col) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + sag, x2, y2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,210,0.25)'; ctx.lineWidth = w * 0.3;
    ctx.beginPath(); ctx.moveTo(x1, y1 - w * 0.2); ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + sag - w * 0.2, x2, y2 - w * 0.2); ctx.stroke();
  };
})();
