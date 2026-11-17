/* 主角的肖像：立绘与对话头像，一人一画。脸、发式、衣着各自成形，表情可换。
   头部坐标：原点在两眼之间，脸宽约 100。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P;
  const Art = JX.Art = {};
  const INK = '#2b1f19', HAIR = '#1d1715';
  const P2 = d => new Path2D(d);
  function shape(c, d, fill, stroke, lw) {
    const p = typeof d === 'string' ? P2(d) : d;
    if (fill) { c.fillStyle = fill; c.fill(p); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(p); }
    return p;
  }
  function stroke(c, d, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(P2(d)); }
  function lg(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
  function rg(c, x, y, r0, r1, stops) { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
  function soft(c, x, y, rx, ry, col, a) { c.save(); c.translate(x, y); c.scale(1, ry / rx); c.fillStyle = rg(c, 0, 0, 0, rx, [[0, P.rgba(col, a)], [1, P.rgba(col, 0)]]); c.fillRect(-rx, -rx, rx * 2, rx * 2); c.restore(); }
  function hairFill(c, d, base) {
    base = base || HAIR;
    const p = P2(d); c.fillStyle = lg(c, 0, -110, 0, 60, [[0, P.light(base, 0.14)], [0.45, base], [1, P.dark(base, 0.25)]]); c.fill(p);
    c.strokeStyle = P.dark(base, 0.5); c.lineWidth = 1.6; c.lineJoin = 'round'; c.stroke(p); return p;
  }
  function strands(c, list, col, lw) { c.strokeStyle = col || 'rgba(120,100,92,0.32)'; c.lineWidth = lw || 1; c.lineCap = 'round'; list.forEach(d => c.stroke(P2(d))); }

  /* ---------- 表情 ---------- */
  const MOOD = {
    normal: {},
    smile: { browOut: -1.2, eyeH: 0.8, cur: 2.6, wide: 1.12, lower: 0.5 },
    grin: { browOut: -1.5, eyeH: 0.72, cur: 3.2, wide: 1.22, teeth: true, lower: 0.6 },
    smirk: { curL: 0.2, curR: 2.8, browAsym: -3, eyeH: 0.92 },
    cold: { lid: 0.24, browIn: 1.6, cur: -0.8 },
    angry: { browIn: 5.2, browOut: -1.5, eyeH: 0.9, cur: -2.2, lid: 0.12 },
    surprise: { browIn: -4.5, browOut: -4, eyeH: 1.24, open: true, wide: 0.62 },
    closed: { closed: true, cur: 0.6 },
    sad: { browIn: -3.2, browOut: 2, lid: 0.18, cur: -1.4 },
  };

  /* ---------- 脸 ---------- */
  function geo(f) {
    const t = f.turn || 0, a = Math.abs(t), sg = t >= 0 ? 1 : -1, nearW = 50 + 2 * a, farW = 50 - 10 * a;
    return { t, a, sg, L: sg > 0 ? nearW : farW, R: sg > 0 ? farW : nearW, fx: t * 8, cx: t * 7, len: f.long || 1 };
  }
  function neck(c, f) {
    const g = geo(f), skin = f.skin, sh = f.shade || P.mix(skin, '#a8603f', 0.3), w = f.neckW || 17;
    const p = shape(c, `M ${-w + g.cx * 0.4} 44 C ${-w - 1} 70, ${-w - 3} 96, ${-w - 9} 118 L ${w + 9} 118 C ${w + 3} 96, ${w + 1} 70, ${w + g.cx * 0.4} 44 Z`, lg(c, -20, 0, 22, 0, [[0, P.mix(skin, sh, 0.55)], [0.5, skin], [1, P.mix(skin, sh, 0.7)]]), P.rgba(INK, 0.7), 1.6);
    c.save(); c.clip(p); soft(c, g.cx, 74 * g.len, 34, 22, '#7a4630', 0.5); c.restore();
  }
  function face(c, f, moodName) {
    const g = geo(f), { t, a, sg, L, R, fx, cx, len } = g, m = Object.assign({}, MOOD[f.rest || 'normal'], MOOD[moodName] || (moodName ? {} : null));
    const skin = f.skin, sh = f.shade || P.mix(skin, '#a8603f', 0.3), jw = f.jaw || 0.82, ch = f.chin || 12, jy = 42 * len, cy = 76 * len;
    /* 耳 */
    [-1, 1].forEach(s => {
      if (s === sg && a > 0.16) return;
      const ex = s < 0 ? -L - 0.5 : R + 0.5;
      shape(c, `M ${ex} -8 C ${ex + s * 11} -14, ${ex + s * 12} 14, ${ex + s * 3} 26 C ${ex + s * 1} 20, ${ex} 6, ${ex} -8 Z`, P.mix(skin, sh, 0.35), P.rgba(INK, 0.7), 1.5);
      stroke(c, `M ${ex + s * 5} -3 C ${ex + s * 8} 4, ${ex + s * 6} 12, ${ex + s * 3} 17`, P.rgba('#8a5038', 0.55), 1.1);
      if (f.earring) { c.fillStyle = f.earring; c.beginPath(); c.arc(ex + s * 4, 31, 3.2, 0, 6.3); c.fill(); c.strokeStyle = P.rgba(INK, 0.7); c.lineWidth = 1; c.stroke(); stroke(c, `M ${ex + s * 4} 26 L ${ex + s * 4} 28`, '#c9b27a', 1); }
    });
    /* 脸形 */
    const fp = P2(`M ${-L * 0.94} -42 C ${-L * 1.04} -12, ${-L} 20, ${-L * jw} ${jy} C ${-L * jw * 0.8} ${jy + 16 * len}, ${cx - ch - 8} ${cy - 5}, ${cx} ${cy} C ${cx + ch + 8} ${cy - 5}, ${R * jw * 0.8} ${jy + 16 * len}, ${R * jw} ${jy} C ${R} 20, ${R * 1.04} -12, ${R * 0.94} -42 C ${R * 0.8} -86, ${-L * 0.8} -86, ${-L * 0.94} -42 Z`);
    c.fillStyle = rg(c, fx - sg * 8, 2, 6, 86, [[0, P.light(skin, 0.1)], [0.62, skin], [1, P.mix(skin, sh, 0.62)]]); c.fill(fp);
    c.save(); c.clip(fp);
    c.fillStyle = lg(c, fx, 0, sg * 52, 0, [[0, P.rgba(sh, 0)], [0.55, P.rgba(sh, 0)], [1, P.rgba(sh, 0.5)]]); c.fillRect(-60, -90, 120, 180);       // 背光一侧
    c.fillStyle = lg(c, 0, -62, 0, -30, [[0, 'rgba(70,36,20,0.34)'], [1, 'rgba(70,36,20,0)']]); c.fillRect(-60, -90, 120, 62);                           // 发际的影子
    const bl = f.blush == null ? 0.2 : f.blush;
    soft(c, fx - 27 * (sg > 0 ? 1.02 : 0.84), 25, 17, 11, '#e8766a', bl); soft(c, fx + 27 * (sg > 0 ? 0.84 : 1.02), 25, 17, 11, '#e8766a', bl);
    soft(c, fx * 1.4 + sg * 9, 18, 8, 16, '#8a5038', 0.14);
    c.restore();
    c.strokeStyle = P.rgba(INK, 0.82); c.lineWidth = 2; c.lineJoin = 'round'; c.stroke(fp);
    /* 眼与眉 */
    const E = f.eye, ew = E.w || 22, eh0 = E.h || 9, eyeH = (m.eyeH || 1) * eh0, tilt = (E.tilt || 0.1) * 6;
    [-1, 1].forEach(s => {
      const far = s === sg, ex = (far ? s * 23 * (1 - 0.2 * a) : s * 23 * (1 + 0.02 * a)) + fx, wf = far ? 1 - 0.24 * a : 1 + 0.03 * a;
      c.save(); c.translate(ex, 0); c.scale(s * wf, 1);
      const w = ew, h = eyeH, lid = (m.lid || 0) * h + (E.lid || 0) * h;
      if (m.closed) {
        stroke(c, `M ${-w / 2} 1 C ${-w * 0.2} ${h * 0.55}, ${w * 0.25} ${h * 0.5}, ${w / 2} ${-tilt * 0.4}`, '#1e1512', 2.6);
        if (E.lash) stroke(c, `M ${w / 2} ${-tilt * 0.4} L ${w / 2 + 4} ${-tilt * 0.4 + 2.5}`, '#1e1512', 1.6);
      } else {
        const up = `M ${-w / 2} 1.5 C ${-w * 0.3} ${-h * 1.16 + lid}, ${w * 0.2} ${-h * 1.22 + lid}, ${w / 2} ${-tilt}`;
        const ep = P2(up + ` C ${w * 0.3} ${h * (0.62 - (m.lower || 0))}, ${-w * 0.25} ${h * (0.6 - (m.lower || 0) * 0.8)}, ${-w / 2} 1.5 Z`);
        c.fillStyle = '#fbf5ee'; c.fill(ep);
        c.save(); c.clip(ep);
        const ir = Math.max(h * 0.95, 5.2) * (E.iris || 1), ix = (f.gaze || 0) * 2.2 * s, iy = -h * 0.2 + lid * 0.4;
        c.fillStyle = rg(c, ix, iy + ir * 0.25, ir * 0.1, ir, [[0, P.light(E.col || '#5a3a22', 0.25)], [0.55, E.col || '#5a3a22'], [0.9, P.dark(E.col || '#5a3a22', 0.6)], [1, '#140c08']]);
        c.beginPath(); c.arc(ix, iy, ir, 0, 6.3); c.fill();
        c.fillStyle = '#0c0706'; c.beginPath(); c.arc(ix, iy, ir * 0.42, 0, 6.3); c.fill();
        c.fillStyle = lg(c, 0, -h * 1.2, 0, -h * 0.1, [[0, 'rgba(30,14,10,0.55)'], [1, 'rgba(30,14,10,0)']]); c.fillRect(-w, -h * 1.3, w * 2, h * 1.3);          // 上睑投在眼珠上的影
        c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath(); c.ellipse(ix - ir * 0.36 * s, iy - ir * 0.38, ir * 0.26, ir * 0.2, 0, 0, 6.3); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.arc(ix + ir * 0.4 * s, iy + ir * 0.42, ir * 0.12, 0, 6.3); c.fill();
        c.restore();
        stroke(c, up, '#1e1512', E.lash ? 3 : 2.7);
        stroke(c, `M ${w * 0.4} ${h * (0.34 - (m.lower || 0) * 0.6) - tilt * 0.3} C ${w * 0.26} ${h * (0.6 - (m.lower || 0))}, ${w * 0.05} ${h * 0.62}, ${-w * 0.12} ${h * 0.56}`, 'rgba(60,34,26,0.32)', 1);
        if (E.lash) stroke(c, `M ${w / 2 - 0.5} ${-tilt} Q ${w / 2 + 2} ${-tilt - 0.6} ${w / 2 + 3.6} ${-tilt - 2}`, '#1e1512', 1.7);
        if (E.crease !== false) stroke(c, `M ${-w * 0.36} ${-h * 1.02 + lid - 3.2} C ${-w * 0.1} ${-h * 1.3 + lid - 3.4}, ${w * 0.22} ${-h * 1.34 + lid - 3}, ${w * 0.46} ${-tilt - 3.6}`, 'rgba(90,50,38,0.42)', 1);
      }
      /* 眉 */
      const B = f.brow, th = B.th || 3.6, arch = B.arch || 0.4, asym = (m.browAsym || 0) * (s > 0 ? 1 : 0);
      const ix2 = -w * 0.62, iy2 = -eh0 - 8.5 + (m.browIn || 0) + (B.in || 0) + asym * 0.6, ox = w * 0.82, oy = -eh0 - 9.5 - arch * 3 + (m.browOut || 0) + (B.out || 0) + asym;
      const px = w * 0.2, py = -eh0 - 12.5 - arch * 5 + ((m.browIn || 0) + (m.browOut || 0)) * 0.5 + asym;
      c.fillStyle = B.col || '#1c1512'; c.globalAlpha = B.a || 0.92;
      c.fill(P2(`M ${ix2} ${iy2} Q ${px} ${py - th * 0.15} ${ox} ${oy} Q ${px + 1} ${py + th * 0.95} ${ix2 + 1.5} ${iy2 + th} Z`)); c.globalAlpha = 1;
      c.restore();
    });
    /* 鼻 */
    const nx = fx * 1.55, ny = 31 * len;
    stroke(c, `M ${fx * 1.05 + sg * 4.5} 5 C ${fx * 1.2 + sg * 7.5} 14, ${nx + sg * 9} ${ny - 8}, ${nx + sg * 7} ${ny - 0.5}`, P.rgba('#7a4630', 0.3 + 0.5 * a), 1.3);
    stroke(c, `M ${nx - 6.5} ${ny} Q ${nx - 3.2} ${ny + 4.2} ${nx} ${ny + 2.4} Q ${nx + 3.2} ${ny + 4.2} ${nx + 6.5} ${ny}`, P.rgba('#7a4630', 0.62), 1.5);
    stroke(c, `M ${nx - 4.6} ${ny + 1.4} l 1.8 0.9`, P.rgba('#4a2418', 0.55), 1.4); stroke(c, `M ${nx + 4.6} ${ny + 1.4} l -1.8 0.9`, P.rgba('#4a2418', 0.55), 1.4);
    soft(c, nx - sg * 1.5, ny - 5, 4, 5, '#ffffff', 0.3);
    /* 口 */
    const mx = fx * 1.25, my = 49 * len, mw = (f.mouth.w || 22) * (m.wide || 1), fu = f.mouth.full == null ? 1 : f.mouth.full, lip = f.mouth.col || '#c06a5c';
    const cl = m.curL != null ? m.curL : (m.cur || 0), cr = m.curR != null ? m.curR : (m.cur || 0), mid = (cl + cr) * 0.4;
    c.save(); c.translate(mx, my);
    if (m.open) {
      shape(c, `M ${-mw / 2} 0 C ${-mw * 0.3} ${-4 * fu}, ${mw * 0.3} ${-4 * fu}, ${mw / 2} 0 C ${mw * 0.34} ${9 * fu}, ${-mw * 0.34} ${9 * fu}, ${-mw / 2} 0 Z`, lip, P.rgba('#5a2a22', 0.8), 1.3);
      shape(c, `M ${-mw * 0.34} 0.5 C ${-mw * 0.2} -1.6, ${mw * 0.2} -1.6, ${mw * 0.34} 0.5 C ${mw * 0.2} ${5.5 * fu}, ${-mw * 0.2} ${5.5 * fu}, ${-mw * 0.34} 0.5 Z`, '#4a1f1c');
    } else if (m.teeth) {
      shape(c, `M ${-mw / 2} ${-cl} C ${-mw * 0.3} ${-3 * fu - 0.5}, ${-mw * 0.1} ${-3.6 * fu}, 0 ${-2 * fu} C ${mw * 0.1} ${-3.6 * fu}, ${mw * 0.3} ${-3 * fu - 0.5}, ${mw / 2} ${-cr} C ${mw * 0.3} ${9 * fu + mid}, ${-mw * 0.3} ${9 * fu + mid}, ${-mw / 2} ${-cl} Z`, lip, P.rgba('#5a2a22', 0.85), 1.3);
      shape(c, `M ${-mw * 0.4} ${-cl * 0.5 + 0.4} C ${-mw * 0.2} 1.2, ${mw * 0.2} 1.2, ${mw * 0.4} ${-cr * 0.5 + 0.4} C ${mw * 0.24} ${5.6 * fu + mid}, ${-mw * 0.24} ${5.6 * fu + mid}, ${-mw * 0.4} ${-cl * 0.5 + 0.4} Z`, '#fffaf2', P.rgba('#5a2a22', 0.5), 0.8);
      shape(c, `M ${-mw * 0.3} ${3.4 * fu + mid} C ${-mw * 0.1} ${5.4 * fu + mid}, ${mw * 0.1} ${5.4 * fu + mid}, ${mw * 0.3} ${3.4 * fu + mid} C ${mw * 0.14} ${5.9 * fu + mid}, ${-mw * 0.14} ${5.9 * fu + mid}, ${-mw * 0.3} ${3.4 * fu + mid} Z`, '#7a2e28');
    } else {
      shape(c, `M ${-mw / 2} ${-cl} C ${-mw * 0.3} ${-2.3 * fu}, ${-mw * 0.12} ${-3.5 * fu}, 0 ${-1.9 * fu} C ${mw * 0.12} ${-3.5 * fu}, ${mw * 0.3} ${-2.3 * fu}, ${mw / 2} ${-cr} C ${mw * 0.2} ${1.4 + mid}, ${-mw * 0.2} ${1.4 + mid}, ${-mw / 2} ${-cl} Z`, P.dark(lip, 0.12));
      shape(c, `M ${-mw * 0.43} ${0.7 - cl * 0.7} C ${-mw * 0.25} ${6.4 * fu + mid}, ${mw * 0.25} ${6.4 * fu + mid}, ${mw * 0.43} ${0.7 - cr * 0.7} C ${mw * 0.2} ${1.7 + mid}, ${-mw * 0.2} ${1.7 + mid}, ${-mw * 0.43} ${0.7 - cl * 0.7} Z`, P.light(lip, 0.1));
      soft(c, -1.5, 3.2 * fu + mid, 4.5, 1.8, '#ffffff', 0.35);
      stroke(c, `M ${-mw / 2} ${-cl} C ${-mw * 0.2} ${1.5 + mid}, ${mw * 0.2} ${1.5 + mid}, ${mw / 2} ${-cr}`, P.rgba('#5a2a22', 0.85), 1.4);
    }
    c.restore();
    soft(c, mx, my + 11 * fu, 9, 3, '#8a5038', 0.2);
    if (f.mark) f.mark(c, g);
  }

  /* ---------- 衣领与肩 ---------- */
  function bust(c, o) {
    const w = o.w || 120, top = o.top || 100, col = o.col;
    const p = shape(c, `M -24 ${top} C -60 ${top + 6}, ${-w + 8} ${top + 18}, ${-w - 4} ${top + 62} C ${-w - 10} ${top + 100}, ${-w - 12} 300, ${-w - 12} 420 L ${w + 12} 420 C ${w + 12} 300, ${w + 10} ${top + 100}, ${w + 4} ${top + 62} C ${w - 8} ${top + 18}, 60 ${top + 6}, 24 ${top} Z`,
      lg(c, -w, 0, w, 0, [[0, P.dark(col, 0.3)], [0.3, P.light(col, 0.08)], [0.6, col], [1, P.dark(col, 0.36)]]), P.rgba(INK, 0.85), 2.2);
    return p;
  }
  /* 交领：右衽。inner 是里衣，trim 是领缘 */
  function crossCollar(c, o) {
    const top = o.top || 100, inner = o.inner || '#f1e9d6', trim = o.trim, tw = o.tw || 13, drop = o.drop || 64;
    shape(c, `M -20 ${top - 4} L 2 ${top + drop * 0.72} L 22 ${top - 4} L 16 ${top - 8} L 1 ${top + drop * 0.5} L -15 ${top - 8} Z`, inner, P.rgba(INK, 0.7), 1.4);
    shape(c, `M -25 ${top - 3} L ${-25 + tw} ${top - 8} L ${8} ${top + drop * 0.86} L ${-2} ${top + drop} Z`, trim, P.rgba(INK, 0.8), 1.6);
    shape(c, `M 27 ${top - 3} L ${27 - tw} ${top - 8} L ${-44} ${top + drop * 2.2} L ${-58} ${top + drop * 2.25} L ${-56} ${top + drop * 2.0} Z`, trim, P.rgba(INK, 0.8), 1.6);
    if (o.edge) { stroke(c, `M ${25 - tw * 0.5} ${top - 5} L ${-50} ${top + drop * 2.2}`, o.edge, 1.4); stroke(c, `M ${-25 + tw * 0.5} ${top - 5} L 3 ${top + drop * 0.9}`, o.edge, 1.4); }
  }
  function folds(c, list, a) { c.strokeStyle = 'rgba(30,18,12,' + (a || 0.3) + ')'; c.lineWidth = 1.5; c.lineCap = 'round'; list.forEach(d => c.stroke(P2(d))); }
  function fur(c, pts, r, col) {                                  // 一圈毛领：沿折线排开的小绒球
    c.fillStyle = col || '#f4efe6'; c.strokeStyle = 'rgba(120,104,90,0.55)'; c.lineWidth = 1.2;
    for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / (r * 0.9))); for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n, rr = r * (0.85 + 0.3 * Math.abs(Math.sin(i * 7.3 + k * 2.1))); c.beginPath(); c.arc(x, y, rr, 0, 6.3); c.fill(); c.stroke(); } }
    c.fillStyle = col || '#f4efe6'; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / (r * 0.9))); for (let k = 0; k <= n; k++) { c.beginPath(); c.arc(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, r * 0.72, 0, 6.3); c.fill(); } }
  }
  function bead(c, x, y, r, col) { c.fillStyle = rg(c, x - r * 0.3, y - r * 0.3, r * 0.1, r, [[0, P.light(col, 0.5)], [1, P.dark(col, 0.25)]]); c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); c.strokeStyle = P.rgba(INK, 0.7); c.lineWidth = 0.9; c.stroke(); }
  function braid(c, x0, y0, x1, y1, n, w, beads) {
    const bx = (x0 + x1) / 2 + (x1 - x0) * 0.35, by = (y0 + y1) / 2, pt = u => [(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * bx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * by + u * u * y1];
    c.strokeStyle = '#120e0c'; c.lineWidth = w * 2 + 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(bx, by, x1, y1); c.stroke();
    c.strokeStyle = HAIR; c.lineWidth = w * 2; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(bx, by, x1, y1); c.stroke();
    c.strokeStyle = 'rgba(150,128,116,0.5)'; c.lineWidth = 1;
    for (let i = 0; i < n; i++) { const [x, y] = pt((i + 0.5) / n); c.beginPath(); c.moveTo(x - w * 0.85, y + w * 0.5); c.lineTo(x, y - w * 0.35); c.lineTo(x + w * 0.85, y + w * 0.5); c.stroke(); }
    const e = pt(1); c.fillStyle = HAIR; c.beginPath(); c.moveTo(e[0] - w * 0.7, e[1]); c.lineTo(e[0], e[1] + w * 2.4); c.lineTo(e[0] + w * 0.7, e[1]); c.closePath(); c.fill();
    (beads || []).forEach(b => { const q = pt(b[0]); bead(c, q[0], q[1], w * 1.15, b[1]); });
  }

  /* ================= 各人的样子 ================= */
  const CH = Art.chars = {};

  /* —— 陆惊蛰：瘦，眼尾略挑，嘴角常带一点笑；发髻用青布条束着，鬓边有碎发 —— */
  CH.jingzhe = {
    name: '陆惊蛰', title: '醉春楼 · 行菜', season: '春', up: 13, line: '有尖儿的是杀人的，没尖儿的才是开酒的。',
    f: { skin: '#efcfa8', turn: 0.26, jaw: 0.88, chin: 14, long: 1.02, blush: 0.08, rest: 'smirk', neckW: 18,
      eye: { w: 23, h: 8.4, tilt: 0.26, col: '#4a3020', crease: true }, brow: { th: 4.4, arch: 0.25, out: -2.2, in: 0.6 }, mouth: { w: 23, full: 0.72, col: '#b9796a' } },
    hairBack(c) {
      hairFill(c, 'M -53 -18 C -64 -114, 64 -114, 53 -18 C 55 0, 52 16, 47 26 C 30 -8, -30 -8, -47 26 C -52 16, -55 0, -53 -18 Z');
      shape(c, 'M 8 -90 C 30 -92, 50 -78, 62 -56 C 64 -50, 58 -48, 55 -53 C 46 -68, 30 -80, 10 -82 Z', '#55748a', P.rgba(INK, 0.8), 1.5);
      shape(c, 'M 6 -86 C 26 -80, 40 -62, 44 -40 C 44 -34, 38 -34, 37 -40 C 33 -58, 22 -72, 5 -78 Z', '#6a8a9e', P.rgba(INK, 0.8), 1.5);
    },
    hairFront(c) {
      hairFill(c, 'M -51 -20 C -58 -104, 58 -104, 51 -20 C 48 -38, 38 -52, 16 -55 C 9 -56, 4 -52, 1 -49 C -6 -56, -30 -56, -42 -44 C -47 -38, -50 -28, -51 -20 Z');
      hairFill(c, 'M -51 -24 C -53 -6, -51 10, -46 20 C -45 6, -44 -10, -43 -26 Z'); hairFill(c, 'M 49 -24 C 50 -8, 48 6, 44 14 C 44 2, 43 -12, 42 -26 Z');
      hairFill(c, 'M -18 -92 C -20 -114, 20 -116, 19 -92 C 12 -86, -11 -86, -18 -92 Z');
      strands(c, ['M -10 -108 C -4 -100, 6 -100, 12 -108', 'M -30 -74 C -10 -84, 14 -84, 34 -72', 'M -40 -60 C -20 -72, 20 -72, 42 -58']);
      shape(c, 'M -19 -93 C -9 -87, 10 -87, 20 -93 L 19 -84 C 9 -79, -8 -79, -18 -84 Z', '#5f8196', P.rgba(INK, 0.85), 1.5);
      stroke(c, 'M -14 -88 C -6 -84, 8 -84, 15 -88', 'rgba(255,255,255,0.25)', 1);
      c.strokeStyle = HAIR; c.lineCap = 'round';
      [['M -34 -50 C -42 -40, -46 -26, -44 -10', 1.5], ['M 24 -54 C 32 -46, 36 -36, 35 -26', 1.4], ['M -4 -51 C -9 -45, -11 -39, -10 -33', 1.1]].forEach(s => { c.lineWidth = s[1]; c.stroke(P2(s[0])); });
    },
    bust(c) {
      bust(c, { w: 124, col: '#4f6a7e' });
      folds(c, ['M -96 150 C -84 190, -80 230, -84 300', 'M 92 150 C 82 190, 80 230, 84 300', 'M 30 190 C 24 230, 22 260, 24 300']);
      crossCollar(c, { trim: '#2f4252', inner: '#efe7d4', edge: 'rgba(160,190,205,0.35)' });
    },
    front(c) {                                                    // 搭在肩上的白手巾
      shape(c, 'M 56 96 C 74 96, 96 104, 104 118 C 110 150, 108 200, 104 252 L 66 250 C 68 200, 66 150, 56 96 Z', lg(c, 56, 0, 110, 0, [[0, '#f6f1e4'], [0.6, '#fbf8ee'], [1, '#d9d2c0']]), P.rgba(INK, 0.8), 1.8);
      folds(c, ['M 76 116 C 80 160, 80 200, 78 246', 'M 92 122 C 96 160, 95 200, 92 248'], 0.22);
      stroke(c, 'M 66 236 L 104 238', 'rgba(70,100,130,0.6)', 2.2); stroke(c, 'M 66 242 L 104 244', 'rgba(70,100,130,0.4)', 1.2);
    },
  };

  /* —— 夏离：娜仁托娅的男装。小麦色，浓眉，眼神亮；幞头，绛色锦袍 —— */
  const nrFace = { skin: '#e4b98e', shade: '#c08a62', turn: -0.24, jaw: 0.84, chin: 12, blush: 0.14, neckW: 16,
    eye: { w: 24, h: 9.6, tilt: 0.2, col: '#5a3418', lash: true }, brow: { th: 4.2, arch: 0.3, out: -1.6 }, mouth: { w: 23, full: 0.95, col: '#c0624f' } };
  CH.xiali = {
    name: '夏离', title: '听潮阁的客人 · 自称北边来的药商', season: '夏', line: '这是赏你记不住的。',
    f: Object.assign({}, nrFace, { rest: 'smile' }),
    hairBack(c) {
      shape(c, 'M -40 -60 L -42 -108 C -42 -124, 42 -124, 42 -108 L 40 -60 Z', lg(c, 0, -124, 0, -60, [[0, '#2c2622'], [1, '#120e0c']]), P.rgba('#000', 0.85), 1.6);
      shape(c, 'M -46 -34 C -58 -30, -70 -18, -76 -2 C -66 -8, -56 -16, -44 -22 Z', '#17120f', P.rgba('#000', 0.8), 1.3); shape(c, 'M 46 -34 C 58 -30, 70 -18, 76 -2 C 66 -8, 56 -16, 44 -22 Z', '#17120f', P.rgba('#000', 0.8), 1.3);
      hairFill(c, 'M -53 -18 C -62 -112, 62 -112, 53 -18 C 55 0, 52 14, 47 24 C 30 -8, -30 -8, -47 24 C -52 14, -55 0, -53 -18 Z');
    },
    hairFront(c) {
      shape(c, 'M -52 -26 C -60 -106, 60 -106, 52 -26 C 48 -42, 30 -51, 0 -51 C -30 -51, -48 -42, -52 -26 Z', lg(c, 0, -90, 0, -26, [[0, '#2a2420'], [1, '#120e0c']]), P.rgba('#000', 0.85), 1.6);
      stroke(c, 'M -46 -40 C -30 -50, 30 -50, 46 -40', 'rgba(255,255,255,0.14)', 1.2); stroke(c, 'M -44 -66 C -24 -76, 24 -76, 44 -66', 'rgba(0,0,0,0.9)', 2); stroke(c, 'M -44 -68 C -24 -78, 24 -78, 44 -68', 'rgba(255,255,255,0.12)', 1);
      shape(c, 'M -7 -52 L 7 -52 L 5 -44 L -5 -44 Z', '#a9c9b4', P.rgba(INK, 0.8), 1);
      hairFill(c, 'M -50 -26 C -52 -10, -50 4, -46 12 C -45 0, -44 -12, -43 -27 Z'); hairFill(c, 'M 50 -26 C 52 -10, 50 4, 46 12 C 45 0, 44 -12, 43 -27 Z');
    },
    bust(c) {
      const p = bust(c, { w: 122, col: '#8a2f3a' });
      c.save(); c.clip(p); c.fillStyle = 'rgba(227,185,90,0.34)';
      for (let y = 130; y < 420; y += 46) for (let x = -130 + ((y / 46) % 2) * 23; x < 140; x += 46) { c.beginPath(); c.arc(x, y, 8, 0, 6.3); c.fill(); c.beginPath(); c.arc(x, y, 3.4, 0, 6.3); c.fillStyle = 'rgba(138,47,58,0.9)'; c.fill(); c.fillStyle = 'rgba(227,185,90,0.34)'; }
      c.restore();
      folds(c, ['M -94 150 C -84 190, -80 230, -84 300', 'M 92 150 C 82 190, 80 230, 84 300']);
      crossCollar(c, { trim: '#d7a544', inner: '#f3ead6', tw: 14, edge: 'rgba(120,70,20,0.5)' });
    },
  };
  /* —— 娜仁托娅：本来的样子。额饰，细辫，绿松石与珊瑚，皮毛领的蒙古袍 —— */
  CH.naren = {
    name: '娜仁托娅', title: '草原上的女儿 · 第三章换回本相', season: '夏', line: '围着襄阳的，是我父亲的兵。',
    f: Object.assign({}, nrFace, { rest: 'normal', earring: '#3aa6a0', turn: 0.22 }),
    hairBack(c) {
      hairFill(c, 'M -55 -18 C -66 -114, 66 -114, 55 -18 C 62 30, 66 90, 62 150 L -62 150 C -66 90, -62 30, -55 -18 Z');
      strands(c, ['M -50 20 C -56 60, -56 100, -54 146', 'M 50 20 C 56 60, 56 100, 54 146', 'M -40 30 C -44 70, -44 110, -42 148', 'M 40 30 C 44 70, 44 110, 42 148']);
    },
    hairFront(c) {
      hairFill(c, 'M -51 -18 C -58 -106, 58 -106, 51 -18 C 49 -36, 40 -50, 22 -56 C 12 -59, 4 -56, 0 -49 C -4 -56, -12 -59, -22 -56 C -40 -50, -49 -36, -51 -18 Z');
      strands(c, ['M 0 -50 C 0 -64, 0 -76, 0 -88', 'M -30 -70 C -40 -56, -46 -40, -49 -24', 'M 30 -70 C 40 -56, 46 -40, 49 -24', 'M -16 -80 C -30 -66, -40 -50, -45 -34', 'M 16 -80 C 30 -66, 40 -50, 45 -34']);
      stroke(c, 'M -50 -34 C -30 -48, 30 -48, 50 -34', '#c9a24a', 2.2);
      for (let i = -3; i <= 3; i++) bead(c, i * 13, -45 + Math.abs(i) * 2.6, 2.6, i % 2 ? '#d8503c' : '#3aa6a0');
      shape(c, 'M 0 -42 L 6 -34 L 0 -24 L -6 -34 Z', '#3aa6a0', P.rgba(INK, 0.8), 1.2); bead(c, 0, -20, 2.4, '#d8503c');
      braid(c, -53, 22, -70, 168, 12, 5.2, [[0.34, '#3aa6a0'], [0.7, '#d8503c']]); braid(c, 53, 22, 70, 168, 12, 5.2, [[0.34, '#3aa6a0'], [0.7, '#d8503c']]);
      braid(c, -46, 40, -50, 150, 9, 3.6, [[0.6, '#c9a24a']]); braid(c, 46, 40, 50, 150, 9, 3.6, [[0.6, '#c9a24a']]);
    },
    bust(c) {
      const p = bust(c, { w: 118, col: '#a8352c' });
      c.save(); c.clip(p); c.strokeStyle = 'rgba(227,185,90,0.5)'; c.lineWidth = 1.6;
      for (let y = 150; y < 420; y += 40) for (let x = -120 + ((y / 40) % 2) * 20; x < 130; x += 40) { c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x, y - 8); c.lineTo(x + 8, y); c.lineTo(x, y + 8); c.closePath(); c.stroke(); }
      c.restore();
      crossCollar(c, { trim: '#2e5a66', inner: '#f3ead6', tw: 15, edge: 'rgba(227,185,90,0.7)' });
      fur(c, [[-30, 98], [-52, 104], [-80, 116], [-104, 134], [-116, 160]], 9, '#efe6d6'); fur(c, [[30, 98], [52, 104], [80, 116], [104, 134], [116, 160]], 9, '#efe6d6');
      stroke(c, 'M -22 112 C -12 150, 12 150, 22 112', '#c9a24a', 1.6); for (let i = 0; i < 7; i++) { const u = i / 6, x = -18 + 36 * u, y = 118 + Math.sin(u * Math.PI) * 24; bead(c, x, y, 3.4, i === 3 ? '#d8503c' : '#3aa6a0'); }
    },
  };

  /* —— 辛秋水（阑珊）：清而硬。高髻，一支素簪，眉细，眼神沉 —— */
  CH.qiushui = {
    name: '辛秋水', title: '软红院歌伎 · 艺名阑珊', season: '秋', line: '奴这名字是妈妈起的，取的是灯火阑珊。',
    f: { skin: '#f7dfcb', shade: '#dba98c', turn: 0.24, jaw: 0.78, chin: 10, blush: 0.2, rest: 'normal', neckW: 14.5, gaze: 0.3,
      eye: { w: 23.5, h: 8.6, tilt: 0.3, col: '#3e2a20', lash: true, lid: 0.12 }, brow: { th: 2.4, arch: 0.75, a: 0.85, out: 0.5 }, mouth: { w: 18.5, full: 1.05, col: '#c44e48' },
      mark(c, g) { [[0, -3.4], [3.2, -1], [2, 2.8], [-2, 2.8], [-3.2, -1]].forEach(p => { c.fillStyle = '#c8362e'; c.beginPath(); c.arc(g.fx * 0.9 + p[0], -37 + p[1], 1.7, 0, 6.3); c.fill(); }); c.fillStyle = '#f0c040'; c.beginPath(); c.arc(g.fx * 0.9, -37, 1, 0, 6.3); c.fill(); } },
    hairBack(c) {
      hairFill(c, 'M -54 -18 C -64 -114, 64 -114, 54 -18 C 57 6, 52 30, 40 44 C 24 6, -24 6, -40 44 C -52 30, -57 6, -54 -18 Z');
      hairFill(c, 'M -30 -92 C -44 -128, -10 -152, 14 -142 C 40 -132, 44 -100, 28 -88 C 10 -80, -14 -80, -30 -92 Z');
      hairFill(c, 'M -40 -88 C -56 -104, -50 -126, -32 -128 C -22 -116, -24 -98, -40 -88 Z');
      strands(c, ['M -22 -100 C -24 -124, 0 -140, 16 -132', 'M -10 -96 C -8 -116, 8 -128, 22 -120', 'M 4 -92 C 10 -106, 22 -112, 30 -104', 'M -42 -96 C -48 -108, -44 -120, -34 -122'], 'rgba(130,112,104,0.4)', 1.1);
      stroke(c, 'M -52 -112 L 46 -104', '#d9dde0', 2.6); stroke(c, 'M -52 -112 L 46 -104', 'rgba(60,60,70,0.5)', 0.8); bead(c, -54, -112, 4.2, '#eef2f4');
      stroke(c, 'M 40 -108 L 44 -86', '#c9b27a', 1); bead(c, 44, -84, 2.6, '#e8f0ee'); stroke(c, 'M 46 -106 L 52 -80', '#c9b27a', 1); bead(c, 52, -78, 2.6, '#a9c9b4'); stroke(c, 'M 34 -108 L 36 -90', '#c9b27a', 1); bead(c, 36, -88, 2.2, '#e8f0ee');
    },
    hairFront(c) {
      hairFill(c, 'M -51 -18 C -58 -106, 58 -106, 51 -18 C 49 -36, 40 -50, 22 -56 C 12 -59, 4 -56, 0 -49 C -4 -56, -12 -59, -22 -56 C -40 -50, -49 -36, -51 -18 Z');
      hairFill(c, 'M -51 -22 C -58 0, -56 26, -48 40 C -47 18, -46 -4, -44 -28 Z'); hairFill(c, 'M 50 -22 C 55 -2, 53 20, 46 32 C 45 14, 44 -6, 43 -28 Z');
      strands(c, ['M 0 -50 C 0 -64, 0 -76, 0 -88', 'M -30 -70 C -40 -56, -46 -40, -49 -24', 'M 30 -70 C 40 -56, 46 -40, 49 -24', 'M -16 -80 C -30 -66, -40 -50, -45 -34', 'M 16 -80 C 30 -66, 40 -50, 45 -34']);
      c.strokeStyle = HAIR; c.lineCap = 'round'; c.lineWidth = 3; c.stroke(P2('M -49 30 C -54 62, -52 92, -47 118')); c.lineWidth = 2.4; c.stroke(P2('M 47 24 C 51 56, 50 84, 46 108'));
    },
    bust(c) {
      bust(c, { w: 104, col: '#dfe6e6' });
      shape(c, 'M -20 96 L -26 420 L 26 420 L 20 96 C 8 104, -8 104, -20 96 Z', '#f4eee6');                                    // 里衣
      shape(c, 'M -27 158 L 27 158 L 30 420 L -30 420 Z', lg(c, 0, 158, 0, 300, [[0, '#d9b8b4'], [1, '#c79e9c']]), P.rgba(INK, 0.7), 1.4);   // 抹胸
      stroke(c, 'M -27 166 L 27 166', 'rgba(255,255,255,0.5)', 1.4);
      [-1, 1].forEach(s => { shape(c, `M ${s * 24} 98 L ${s * 12} 100 L ${s * 26} 420 L ${s * 44} 420 Z`, '#9fb4c4', P.rgba(INK, 0.8), 1.5); stroke(c, `M ${s * 19} 104 L ${s * 35} 420`, 'rgba(255,255,255,0.5)', 1.2); });
      folds(c, ['M -80 150 C -72 200, -70 250, -74 320', 'M 78 150 C 70 200, 68 250, 72 320'], 0.2);
    },
  };

  /* —— 耶律听雪：圆眼，爱笑，饭量大。双丫髻系红绳，齐眉刘海，雪白毛领，颈上一颗佛珠 —— */
  CH.tingxue = {
    name: '耶律听雪', title: '东辽宰相家的小女儿', season: '冬', line: '十二碗！你少算一碗！',
    f: { skin: '#f9e0d0', shade: '#e2ad94', turn: -0.2, jaw: 0.84, chin: 13, long: 0.95, blush: 0.36, rest: 'grin', neckW: 14.5,
      eye: { w: 23, h: 11.4, tilt: 0.06, col: '#5a3418', lash: true, iris: 1.06 }, brow: { th: 3, arch: 0.55, a: 0.88 }, mouth: { w: 20, full: 1, col: '#d0605a' } },
    hairBack(c) {
      hairFill(c, 'M -55 -16 C -66 -114, 66 -114, 55 -16 C 58 10, 54 34, 44 48 C 26 8, -26 8, -44 48 C -54 34, -58 10, -55 -16 Z');
      [-1, 1].forEach(s => {
        hairFill(c, `M ${s * 22} -84 C ${s * 20} -112, ${s * 60} -120, ${s * 66} -94 C ${s * 68} -76, ${s * 44} -66, ${s * 22} -84 Z`);
        strands(c, [`M ${s * 30} -90 C ${s * 36} -106, ${s * 54} -108, ${s * 60} -94`, `M ${s * 34} -82 C ${s * 42} -94, ${s * 54} -94, ${s * 58} -84`], 'rgba(130,112,104,0.4)', 1.1);
        shape(c, `M ${s * 24} -86 C ${s * 30} -76, ${s * 40} -72, ${s * 50} -76 L ${s * 49} -69 C ${s * 39} -65, ${s * 29} -69, ${s * 22} -79 Z`, '#c8362e', P.rgba(INK, 0.8), 1.3);
        shape(c, `M ${s * 50} -75 C ${s * 60} -72, ${s * 68} -62, ${s * 70} -50 L ${s * 64} -50 C ${s * 62} -59, ${s * 56} -66, ${s * 49} -68 Z`, '#d8463a', P.rgba(INK, 0.8), 1.2);
        shape(c, `M ${s * 49} -72 C ${s * 56} -64, ${s * 59} -54, ${s * 58} -44 L ${s * 53} -45 C ${s * 53} -54, ${s * 50} -61, ${s * 46} -66 Z`, '#b02c26', P.rgba(INK, 0.8), 1.2);
        c.fillStyle = '#f6f1e8'; c.strokeStyle = 'rgba(120,104,90,0.6)'; c.lineWidth = 1; c.beginPath(); c.arc(s * 68, -46, 5.5, 0, 6.3); c.fill(); c.stroke();
      });
    },
    hairFront(c) {
      hairFill(c, 'M -52 -14 C -60 -108, 60 -108, 52 -14 C 51 -30, 47 -40, 42 -44 C 41 -34, 36 -29, 30 -32 C 26 -40, 18 -28, 8 -31 C 2 -40, -8 -28, -16 -31 C -24 -40, -32 -30, -38 -33 C -42 -41, -49 -32, -52 -14 Z');
      hairFill(c, 'M -52 -16 C -59 16, -55 44, -48 58 C -47 36, -46 10, -45 -18 Z'); hairFill(c, 'M 52 -16 C 59 16, 55 44, 48 58 C 47 36, 46 10, 45 -18 Z');
      strands(c, ['M -30 -78 C -34 -60, -36 -44, -37 -30', 'M -12 -84 C -14 -64, -15 -46, -15 -28', 'M 10 -84 C 10 -64, 9 -46, 8 -28', 'M 30 -78 C 32 -60, 31 -44, 30 -29', 'M -46 -60 C -30 -76, 30 -76, 46 -60']);
    },
    bust(c) {
      bust(c, { w: 108, col: '#f1ece2' });
      folds(c, ['M -84 160 C -76 200, -74 250, -78 320', 'M 82 160 C 74 200, 72 250, 76 320'], 0.16);
      shape(c, 'M -16 100 L 2 168 L 20 100 Z', '#cfe0ea', P.rgba(INK, 0.6), 1.2);
      shape(c, 'M -26 100 L -12 96 L 8 420 L -12 420 Z', '#c8362e', P.rgba(INK, 0.8), 1.5); stroke(c, 'M -19 100 L -2 420', 'rgba(255,220,160,0.6)', 1.2);
      fur(c, [[-22, 98], [-48, 102], [-76, 112], [-100, 130], [-112, 156]], 11.5, '#fbf8f2'); fur(c, [[24, 98], [48, 102], [76, 112], [100, 130], [112, 156]], 11.5, '#fbf8f2');
      stroke(c, 'M -15 106 C -8 140, 8 150, 15 106', '#7a4a2a', 1.4); bead(c, 1, 137, 6.4, '#7a4a28');
    },
  };

  /* 头肩一起画：后发、身、颈、脸、前发、搭在身前的东西 */
  Art.head = function (c, ch, mood, noBody) {
    const up = ch.up == null ? 9 : ch.up;
    ch.hairBack(c);
    if (!noBody) { c.save(); c.translate(0, -up); ch.bust(c); c.restore(); }
    neck(c, ch.f); face(c, ch.f, mood); ch.hairFront(c);
    if (!noBody && ch.front) { c.save(); c.translate(0, -up); ch.front(c); c.restore(); }
  };
  Art.has = id => !!CH[id];
  Art.face = face; Art.neck = neck; Art.MOOD = MOOD; Art.tools = { shape, stroke, lg, rg, soft, hairFill, strands, folds, fur, bead, braid, bust, crossCollar, P2, INK, HAIR };

  /* ---------- 对话头像：头肩，透明底，底边渐隐 ---------- */
  const cache = {};
  Art.avatar = function (id, mood) {
    const key = id + '|' + (mood || ''), ch = CH[id]; if (!ch) return null;
    if (cache[key]) return cache[key];
    const W = 380, H = 436, k = 2, cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k;
    const c = cv.getContext('2d'); c.scale(k, k);
    c.save(); c.translate(W / 2 - (ch.f.turn || 0) * 10, 214); c.scale(1.36, 1.36);
    Art.head(c, ch, mood);
    c.restore();
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = lg(c, 0, H - 70, 0, H, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); c.fillRect(0, H - 70, W, 70);
    c.globalCompositeOperation = 'source-over';
    cache[key] = cv; return cv;
  };
})();
