/* 人物：参数化的矢量小人。原点在脚底正中，身高 150 单位为标准成年男子。
   朝向 dir：0 面朝观众（下），1 朝左，2 背对（上），3 朝右。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, C = P.C;
  const Fig = JX.Fig = {};
  const INK = 'rgba(38,28,22,0.9)';

  function fillStroke(ctx, fill, lw) { ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw || 1.4; ctx.lineJoin = 'round'; ctx.stroke(); }
  function cloth(ctx, col, x0, x1) { return P.hgrad(ctx, x0, 0, x1 - x0, [[0, P.dark(col, 0.28)], [0.38, P.light(col, 0.1)], [0.62, col], [1, P.dark(col, 0.34)]]); }
  function seg(ctx, x1, y1, x2, y2, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

  /* ---------- 头 ---------- */
  function hairFront(ctx, sp) {
    const hc = sp.hairCol || C.hair, st = sp.hair || 'bun';
    if (st === 'beggar' || st === 'patchy') {
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(-16, -131);
      ctx.bezierCurveTo(-19, -152, 19, -152, 16, -131); ctx.lineTo(12, -139); ctx.lineTo(8, -134); ctx.lineTo(3, -141); ctx.lineTo(-2, -135); ctx.lineTo(-7, -141); ctx.lineTo(-12, -134); ctx.closePath(); ctx.fill();
      for (let i = -3; i <= 3; i++) seg(ctx, i * 4.5, -148, i * 5.5 + (i % 2 ? 2 : -2), -155 - (i % 2 ? 3 : 0), 2, hc);
      if (st === 'patchy') { P.ellipse(ctx, -6, -146, 4.5, 3, P.rgba(sp.skin || C.skin, 0.95)); P.ellipse(ctx, 7, -143, 3.5, 2.4, P.rgba(sp.skin || C.skin, 0.95)); }
      return;
    }
    ctx.beginPath(); ctx.moveTo(-15.6, -131);
    ctx.bezierCurveTo(-18, -152, 18, -152, 15.6, -131);
    ctx.lineTo(13.6, -138); ctx.quadraticCurveTo(0, sp.female ? -147.5 : -145.5, -13.6, -138); ctx.closePath();
    ctx.fillStyle = st === 'cook' ? (sp.capCol || '#cfc6b0') : hc; ctx.fill();
    if (st === 'bun' || st === 'old' || st === 'dao') {
      P.ellipse(ctx, 0, -152.5, 7.6, 6.6, hc, INK, 1.1);
      ctx.fillStyle = sp.band || sp.trim || '#3a4a5a'; ctx.fillRect(-6.5, -148.6, 13, 3.2);
      if (st === 'dao') { seg(ctx, -12, -152.5, 12, -152.5, 2, '#9fb8a6'); }
    } else if (st === 'boy') {
      P.ellipse(ctx, -11, -150, 5.5, 5, hc, INK, 1); P.ellipse(ctx, 11, -150, 5.5, 5, hc, INK, 1);
      seg(ctx, -11, -146.5, -11, -145, 2.4, C.zhusha); seg(ctx, 11, -146.5, 11, -145, 2.4, C.zhusha);
    } else if (st === 'futou') {
      ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-15.8, -134); ctx.bezierCurveTo(-18, -153, 18, -153, 15.8, -134); ctx.lineTo(14, -139.5); ctx.quadraticCurveTo(0, -143, -14, -139.5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, -148); ctx.quadraticCurveTo(-10, -160, 0, -160); ctx.quadraticCurveTo(10, -160, 10, -148); ctx.closePath(); ctx.fill();
      seg(ctx, -15, -144, -19.5, -145, 2.6, '#17120f'); seg(ctx, 15, -144, 19.5, -145, 2.6, '#17120f');
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-9, -141.5, 18, 1.2);
    } else if (st === 'female') {
      P.ellipse(ctx, 0, -155, 11, 9, hc, INK, 1.1); P.ellipse(ctx, -9, -150, 6, 5, hc); P.ellipse(ctx, 9, -150, 6, 5, hc);
      seg(ctx, -15.4, -131, -15, -122, 3, hc); seg(ctx, 15.4, -131, 15, -122, 3, hc);
      seg(ctx, 5, -160, 17, -156, 1.6, sp.pin || C.tenghuang); P.ellipse(ctx, 17, -156, 2.2, 2.2, sp.pinGem || C.zhusha);
    } else if (st === 'girl') {                                 // 辫发
      P.ellipse(ctx, 0, -151, 9, 6, hc);
      seg(ctx, -14.5, -131, -17, -108, 4.2, hc); seg(ctx, 14.5, -131, 17, -108, 4.2, hc);
      P.ellipse(ctx, -17, -107, 2.6, 2.6, C.zhusha); P.ellipse(ctx, 17, -107, 2.6, 2.6, C.zhusha);
    } else if (st === 'cook') {
      ctx.fillStyle = sp.capCol || '#cfc6b0'; ctx.beginPath(); ctx.moveTo(-14, -146); ctx.quadraticCurveTo(0, -160, 14, -146); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  function faceFront(ctx, sp, o) {
    const skin = sp.skin || C.skin, big = o.detail;
    ctx.fillStyle = P.dark(skin, 0.12); ctx.fillRect(-5, -119, 10, 9);
    P.ellipse(ctx, -15.2, -131.5, 2.6, 4, skin, INK, 1); P.ellipse(ctx, 15.2, -131.5, 2.6, 4, skin, INK, 1);
    ctx.beginPath(); ctx.ellipse(0, -133, 15, 16.5, 0, 0, Math.PI * 2);
    fillStroke(ctx, P.hgrad(ctx, -15, 0, 30, [[0, P.dark(skin, 0.1)], [0.45, P.light(skin, 0.12)], [1, P.dark(skin, 0.14)]]), 1.3);
    if (sp.blush) { P.ellipse(ctx, -8.5, -127, 4, 2.6, 'rgba(214,110,96,0.32)'); P.ellipse(ctx, 8.5, -127, 4, 2.6, 'rgba(214,110,96,0.32)'); }
    hairFront(ctx, sp);
    const browCol = sp.hair === 'old' ? '#bdb7ad' : 'rgba(38,28,22,0.85)', ey = o.eyeY || 0;
    if (o.closed) { seg(ctx, -9, -131.6, -4, -131.2, 1.5, INK); seg(ctx, 4, -131.2, 9, -131.6, 1.5, INK); }
    else {
      P.ellipse(ctx, -6.4, -131.4 + ey, 1.55, 2.25, '#1a1310'); P.ellipse(ctx, 6.4, -131.4 + ey, 1.55, 2.25, '#1a1310');
      seg(ctx, -8.8, -133.4 + ey, -4.2, -134 + ey, sp.female ? 1.3 : 1, INK); seg(ctx, 4.2, -134 + ey, 8.8, -133.4 + ey, sp.female ? 1.3 : 1, INK);
      if (big) { P.ellipse(ctx, -6.9, -132.1 + ey, 0.5, 0.6, 'rgba(255,255,255,0.8)'); P.ellipse(ctx, 5.9, -132.1 + ey, 0.5, 0.6, 'rgba(255,255,255,0.8)'); }
    }
    const bt = sp.brow || 0;                                      // 眉：正数上挑，负数下垂
    seg(ctx, -10, -137 + bt * 0.6, -3.6, -138.2 - bt, sp.female ? 1 : 1.5, browCol); seg(ctx, 3.6, -138.2 - bt, 10, -137 + bt * 0.6, sp.female ? 1 : 1.5, browCol);
    seg(ctx, 0.4, -130, -0.8, -126.4, 0.9, 'rgba(120,80,60,0.55)');
    if (o.smile) { ctx.strokeStyle = sp.female ? '#a8433a' : '#8a4a3a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-3.4, -123.6); ctx.quadraticCurveTo(0, -121.4, 3.8, -124.2); ctx.stroke(); }
    else seg(ctx, -2.6, -123.2, 2.6, -123.2, sp.female ? 1.6 : 1.3, sp.female ? '#a8433a' : '#8a4a3a');
    if (sp.female) P.ellipse(ctx, 0, -141.2, 1.3, 1.6, C.zhusha);
    if (sp.beard === 'white' || sp.beard === 'grey') {
      const bc = sp.beard === 'white' ? '#e3dfd6' : '#9d9890';
      ctx.fillStyle = bc; ctx.beginPath(); ctx.moveTo(-9, -124); ctx.quadraticCurveTo(-8, -110, 0, sp.beardLong ? -96 : -104); ctx.quadraticCurveTo(8, -110, 9, -124); ctx.quadraticCurveTo(0, -118, -9, -124); ctx.fill();
      ctx.strokeStyle = 'rgba(60,50,40,0.5)'; ctx.lineWidth = 0.8; ctx.stroke();
      seg(ctx, -7, -126, -1, -124.6, 1.6, bc); seg(ctx, 1, -124.6, 7, -126, 1.6, bc);
    } else if (sp.beard === 'stubble') {
      ctx.fillStyle = 'rgba(40,30,25,0.22)'; ctx.beginPath(); ctx.ellipse(0, -122, 10, 5.5, 0, 0, Math.PI); ctx.fill();
    } else if (sp.beard === 'black') {
      seg(ctx, -6, -126, -1, -124.8, 1.6, C.hair); seg(ctx, 1, -124.8, 6, -126, 1.6, C.hair);
      ctx.fillStyle = C.hair; ctx.beginPath(); ctx.moveTo(-3, -120); ctx.quadraticCurveTo(0, -108, 3, -120); ctx.fill();
    }
  }
  function headBack(ctx, sp) {
    const skin = sp.skin || C.skin, hc = sp.hair === 'cook' ? (sp.capCol || '#cfc6b0') : (sp.hairCol || C.hair), st = sp.hair || 'bun';
    ctx.fillStyle = P.dark(skin, 0.12); ctx.fillRect(-5, -119, 10, 9);
    P.ellipse(ctx, -15.2, -131.5, 2.6, 4, skin, INK, 1); P.ellipse(ctx, 15.2, -131.5, 2.6, 4, skin, INK, 1);
    ctx.beginPath(); ctx.ellipse(0, -133, 15, 16.5, 0, 0, Math.PI * 2); fillStroke(ctx, st === 'futou' ? '#17120f' : hc, 1.3);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -133, 14.4, 15.9, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -115.5, 11, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    if (st === 'patchy') { P.ellipse(ctx, -5, -140, 5, 3.5, skin); P.ellipse(ctx, 6, -132, 4, 3, skin); }
    ctx.restore();
    if (st === 'bun' || st === 'old' || st === 'dao') {
      P.ellipse(ctx, 0, -152.5, 7.6, 6.6, hc, INK, 1.1); ctx.fillStyle = sp.band || sp.trim || '#3a4a5a'; ctx.fillRect(-6.5, -148.6, 13, 3.2);
      if (st === 'dao') seg(ctx, -12, -152.5, 12, -152.5, 2, '#9fb8a6'); else { seg(ctx, -2, -148, -5, -138, 2.2, sp.band || sp.trim || '#3a4a5a'); seg(ctx, 2, -148, 4, -139, 2.2, sp.band || sp.trim || '#3a4a5a'); }
    } else if (st === 'boy') { P.ellipse(ctx, -11, -150, 5.5, 5, hc, INK, 1); P.ellipse(ctx, 11, -150, 5.5, 5, hc, INK, 1); }
    else if (st === 'futou') { ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-10, -148); ctx.quadraticCurveTo(-10, -160, 0, -160); ctx.quadraticCurveTo(10, -160, 10, -148); ctx.closePath(); ctx.fill(); seg(ctx, -8, -136, -22, -128, 3, '#17120f'); seg(ctx, 8, -136, 22, -128, 3, '#17120f'); }
    else if (st === 'female') { P.ellipse(ctx, 0, -155, 11, 9, hc, INK, 1.1); seg(ctx, -5, -160, -17, -156, 1.6, sp.pin || C.tenghuang); }
    else if (st === 'girl') { P.ellipse(ctx, 0, -151, 9, 6, hc); seg(ctx, -6, -122, -8, -98, 4.4, hc); seg(ctx, 6, -122, 8, -98, 4.4, hc); P.ellipse(ctx, -8, -97, 2.6, 2.6, C.zhusha); P.ellipse(ctx, 8, -97, 2.6, 2.6, C.zhusha); }
    else if (st === 'beggar' || st === 'patchy') for (let i = -3; i <= 3; i++) seg(ctx, i * 4.5, -148, i * 5.5, -155 - (i % 2 ? 3 : 0), 2, hc);
    else if (st === 'cook') { ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(-14, -146); ctx.quadraticCurveTo(0, -160, 14, -146); ctx.closePath(); ctx.fill(); seg(ctx, 0, -124, -4, -114, 2.4, hc); seg(ctx, 0, -124, 5, -115, 2.4, hc); }
  }
  function headSide(ctx, sp, o) {
    const skin = sp.skin || C.skin, hc = sp.hairCol || C.hair, st = sp.hair || 'bun';
    ctx.fillStyle = P.dark(skin, 0.12); ctx.fillRect(-4, -119, 9, 9);
    ctx.beginPath(); ctx.ellipse(2, -133, 14.5, 16.5, 0, 0, Math.PI * 2);
    fillStroke(ctx, P.hgrad(ctx, -13, 0, 30, [[0, P.dark(skin, 0.12)], [0.7, P.light(skin, 0.1)], [1, skin]]), 1.3);
    P.ellipse(ctx, 16.2, -130.4, 2.7, 2.3, skin, INK, 1); P.ellipse(ctx, 14.6, -130.4, 2.4, 2.2, skin);
    if (sp.blush) P.ellipse(ctx, 8.5, -126.5, 4, 2.6, 'rgba(214,110,96,0.32)');
    const cap = st === 'cook' ? (sp.capCol || '#cfc6b0') : st === 'futou' ? '#17120f' : hc;
    ctx.beginPath(); ctx.moveTo(8, -149.5); ctx.bezierCurveTo(-6, -154, -15, -146, -13.2, -131); ctx.bezierCurveTo(-13, -124, -9, -120, -6, -119.6);
    ctx.lineTo(-3.6, -128); ctx.bezierCurveTo(-6, -137, 1, -142.5, 12, -143.5); ctx.closePath(); ctx.fillStyle = cap; ctx.fill();
    P.ellipse(ctx, -1.5, -131, 2.4, 3.8, skin, INK, 0.9);
    if (st === 'bun' || st === 'old' || st === 'dao') { P.ellipse(ctx, -2, -152.6, 7.6, 6.6, hc, INK, 1.1); ctx.fillStyle = sp.band || sp.trim || '#3a4a5a'; ctx.fillRect(-8, -148.6, 12, 3.2); if (st === 'dao') seg(ctx, -12, -153, 9, -152, 2, '#9fb8a6'); }
    else if (st === 'boy') { P.ellipse(ctx, -4, -151, 6, 5.4, hc, INK, 1); seg(ctx, -4, -147, -4, -145.4, 2.4, C.zhusha); }
    else if (st === 'futou') { ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-12, -146); ctx.quadraticCurveTo(-13, -160, -2, -160); ctx.quadraticCurveTo(6, -160, 6, -149); ctx.closePath(); ctx.fill(); seg(ctx, -12, -138, -26, -132, 3, '#17120f'); }
    else if (st === 'female') { P.ellipse(ctx, -4, -155, 11, 9, hc, INK, 1.1); seg(ctx, -12.5, -131, -11, -121, 3, hc); seg(ctx, 2, -160, 13, -157, 1.6, sp.pin || C.tenghuang); P.ellipse(ctx, 13, -157, 2.2, 2.2, sp.pinGem || C.zhusha); }
    else if (st === 'girl') { P.ellipse(ctx, -3, -151, 9, 6, hc); seg(ctx, -9, -124, -13, -99, 4.4, hc); P.ellipse(ctx, -13, -98, 2.6, 2.6, C.zhusha); }
    else if (st === 'beggar' || st === 'patchy') { for (let i = -3; i <= 1; i++) seg(ctx, i * 4.5, -148, i * 5.5 - 2, -155 - (i % 2 ? 3 : 0), 2, hc); if (st === 'patchy') P.ellipse(ctx, -5, -143, 4.5, 3, skin); }
    else if (st === 'cook') { ctx.fillStyle = cap; ctx.beginPath(); ctx.moveTo(-13, -144); ctx.quadraticCurveTo(-3, -160, 11, -146); ctx.closePath(); ctx.fill(); }
    const browCol = st === 'old' ? '#bdb7ad' : 'rgba(38,28,22,0.85)';
    if (o.closed) seg(ctx, 8, -132, 12.4, -131.6, 1.5, INK);
    else { P.ellipse(ctx, 10.6, -131.6, 1.45, 2.2, '#1a1310'); seg(ctx, 8.4, -133.8, 12.8, -133.6, 1, INK); }
    seg(ctx, 7, -137.6, 13, -137.2 - (sp.brow || 0), sp.female ? 1 : 1.5, browCol);
    seg(ctx, 11.4, -123.8, 14.6, -124, sp.female ? 1.6 : 1.3, sp.female ? '#a8433a' : '#8a4a3a');
    if (sp.beard === 'white' || sp.beard === 'grey') {
      const bc = sp.beard === 'white' ? '#e3dfd6' : '#9d9890';
      ctx.fillStyle = bc; ctx.beginPath(); ctx.moveTo(4, -124); ctx.quadraticCurveTo(6, -110, 13, sp.beardLong ? -98 : -106); ctx.quadraticCurveTo(17, -114, 15.4, -124); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(60,50,40,0.5)'; ctx.lineWidth = 0.8; ctx.stroke();
    } else if (sp.beard === 'stubble') { ctx.fillStyle = 'rgba(40,30,25,0.2)'; ctx.beginPath(); ctx.ellipse(9, -122, 7, 5, 0, 0, Math.PI); ctx.fill(); }
    else if (sp.beard === 'black') { ctx.fillStyle = C.hair; ctx.beginPath(); ctx.moveTo(10, -121); ctx.quadraticCurveTo(13, -109, 15, -121); ctx.fill(); }
  }

  /* ---------- 身子 ---------- */
  function dims(sp) {
    const f = sp.fat || 1, k = sp.kind || 'robe';
    return { f, k, sh: (sp.female ? 20 : 23) * f, wa: (sp.female ? 15 : 18.5) * f, hemY: k === 'short' ? -56 : (k === 'dress' ? -8 : -12), hem: (k === 'short' ? 21 : k === 'dress' ? 27 : 25.5) * f };
  }
  function torsoPath(ctx, d, sway) {
    ctx.beginPath(); ctx.moveTo(-d.sh, -110);
    ctx.quadraticCurveTo(-d.sh - 1.5, -92, -d.wa, -75);
    ctx.bezierCurveTo(-d.wa - 2, -56, -d.hem - 2 + sway, d.hemY - 20, -d.hem + sway, d.hemY);
    ctx.quadraticCurveTo(sway, d.hemY + 6, d.hem + sway, d.hemY);
    ctx.bezierCurveTo(d.hem + 2 + sway, d.hemY - 20, d.wa + 2, -56, d.wa, -75);
    ctx.quadraticCurveTo(d.sh + 1.5, -92, d.sh, -110);
    ctx.quadraticCurveTo(0, -121, -d.sh, -110); ctx.closePath();
  }
  function shoesFront(ctx, sp, d, sw, mv) {
    const lL = mv * Math.max(0, sw) * 6, lR = mv * Math.max(0, -sw) * 6, sc = sp.shoe || '#231b17', bare = sp.bare;
    if (d.k === 'short') {
      [[-9 * d.f, lL], [9 * d.f, lR]].forEach(([x, lift]) => {
        ctx.beginPath(); ctx.moveTo(x - 7.5, -64); ctx.lineTo(x + 7.5, -64); ctx.lineTo(x + 6, -8 - lift); ctx.lineTo(x - 6, -8 - lift); ctx.closePath();
        fillStroke(ctx, cloth(ctx, sp.pants || '#4a4a48', x - 8, x + 8), 1.2);
        ctx.fillStyle = P.dark(sp.pants || '#4a4a48', 0.3); ctx.fillRect(x - 6, -15 - lift, 12, 3);     // 绑腿口
        P.ellipse(ctx, x, -4 - lift, 7.6, 4.8, bare ? (sp.skin || C.skin) : sc, INK, 1.1);
      });
    } else {
      P.ellipse(ctx, -9 * d.f, -3.5 - lL * 0.7, 7.5, 4.6, sc, INK, 1.1); P.ellipse(ctx, 9 * d.f, -3.5 - lR * 0.7, 7.5, 4.6, sc, INK, 1.1);
    }
  }
  function armsFront(ctx, sp, d, sw, mv, back, carry) {
    const col = sp.robe, wide = sp.wide || 1;
    [-1, 1].forEach(sg => {
      const dy = sg * sw * mv * 5, sx = sg * d.sh;
      if (carry) {                                              // 两手端在身前
        ctx.beginPath(); ctx.moveTo(sx - sg * 3, -111); ctx.lineTo(sx + sg * 6, -104); ctx.lineTo(sg * 12, -80); ctx.lineTo(sg * 5, -88); ctx.closePath();
        fillStroke(ctx, P.dark(col, 0.1), 1.2); if (!back) P.ellipse(ctx, sg * 9, -84, 4.4, 4.4, sp.skin || C.skin, INK, 1);
        return;
      }
      ctx.beginPath(); ctx.moveTo(sx - sg * 4, -111); ctx.quadraticCurveTo(sx + sg * 7, -108, sx + sg * (5 + 2 * wide), -70 + dy);
      ctx.lineTo(sx - sg * (3 + 3 * wide), -66 + dy); ctx.quadraticCurveTo(sx - sg * 5, -90, sx - sg * 4, -111); ctx.closePath();
      fillStroke(ctx, cloth(ctx, P.dark(col, 0.06), sx - 8, sx + 8), 1.2);
      if (sp.cuff) { ctx.fillStyle = sp.cuff; ctx.beginPath(); ctx.moveTo(sx + sg * (5 + 2 * wide), -74 + dy); ctx.lineTo(sx + sg * (5 + 2 * wide), -70 + dy); ctx.lineTo(sx - sg * (3 + 3 * wide), -66 + dy); ctx.lineTo(sx - sg * (3 + 3 * wide), -70 + dy); ctx.closePath(); ctx.fill(); }
      P.ellipse(ctx, sx + sg * 1, -62 + dy, 4.4, 4.6, sp.skin || C.skin, INK, 1);
    });
  }
  function carried(ctx, what) {
    if (what === 'jar') { ctx.save(); ctx.translate(0, -68); P.jar(ctx, 0, 0, 0.5, { seed: 3, text: '春' }); ctx.restore(); }
    else if (what === 'tray') {
      P.ellipse(ctx, 0, -86, 27, 9, '#6a3020', INK, 1.2); P.ellipse(ctx, 0, -87, 23, 7, '#8a3f2a');
      P.ellipse(ctx, -9, -88, 8, 3.4, C.celadon, INK, 0.8); P.ellipse(ctx, -9, -88.6, 5, 2, '#b5562e');
      P.ellipse(ctx, 9, -87, 8, 3.4, C.whiteware, INK, 0.8); P.ellipse(ctx, 9, -87.6, 5, 2, '#d9a441');
    } else if (what === 'bundle') {
      ctx.beginPath(); ctx.moveTo(-17, -98); ctx.quadraticCurveTo(0, -108, 17, -98); ctx.quadraticCurveTo(21, -84, 12, -78); ctx.quadraticCurveTo(0, -74, -12, -78); ctx.quadraticCurveTo(-21, -84, -17, -98); ctx.closePath();
      fillStroke(ctx, '#5f6f86', 1.2); seg(ctx, -8, -99, 9, -80, 1, 'rgba(20,20,30,0.4)'); seg(ctx, 9, -100, -7, -80, 1, 'rgba(20,20,30,0.4)');
      seg(ctx, 12, -100, 20, -110, 4, '#3a2a1e'); seg(ctx, 18.5, -108.5, 21.5, -112, 2, '#c9c2b2');      // 露出半截剑柄
    }
  }
  function collarFront(ctx, sp, d) {
    const k = d.k, inner = sp.inner || '#ece4d0', trim = sp.trim || P.dark(sp.robe, 0.45);
    if (k === 'dress') {                                        // 褙子对襟，中间露出抹胸与裙
      ctx.fillStyle = sp.skirt || '#5b6b68'; ctx.beginPath(); ctx.moveTo(-5, -116); ctx.lineTo(5, -116); ctx.lineTo(8, d.hemY - 1); ctx.lineTo(-8, d.hemY - 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = inner; ctx.fillRect(-6, -104, 12, 9); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(-6, -104, 12, 9);
      ctx.strokeStyle = trim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -117); ctx.lineTo(-8.5, d.hemY - 20); ctx.moveTo(6, -117); ctx.lineTo(8.5, d.hemY - 20); ctx.stroke();
      return;
    }
    ctx.fillStyle = inner; ctx.beginPath(); ctx.moveTo(-7, -117.5); ctx.lineTo(7, -117.5); ctx.lineTo(0, -103); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 4.6; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(-8.5, -117.5); ctx.lineTo(-0.5, -102.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -118); ctx.lineTo(-d.wa * 0.72, -80); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(11.2, -117); ctx.lineTo(-d.wa * 0.72 + 2.4, -79); ctx.stroke();
  }
  function sashFront(ctx, sp, d, back) {
    if (sp.kind === 'dress') { ctx.fillStyle = sp.sash || C.tenghuang; ctx.fillRect(-d.wa - 0.5, -92, d.wa * 2 + 1, 4); return; }
    const sc = sp.sash || '#2a2320';
    ctx.fillStyle = sc; ctx.fillRect(-d.wa - 1, -80, d.wa * 2 + 2, 7); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.strokeRect(-d.wa - 1, -80, d.wa * 2 + 2, 7);
    const kx = back ? 0 : 5; seg(ctx, kx, -74, kx - 3, -60, 3, sc); seg(ctx, kx, -74, kx + 4, -62, 3, sc);
    if (sp.jade && !back) { seg(ctx, -9, -73, -9, -60, 1, C.tenghuang); P.ellipse(ctx, -9, -57, 3, 4, '#a9c9b4', INK, 0.8); }
  }

  function drawFront(ctx, sp, ph, o, back) {
    const mv = o.moving ? 1 : 0, sw = Math.sin(ph), d = dims(sp), sway = mv * sw * 1.6;
    if (o.pose === 'sit' || o.pose === 'squat' || o.pose === 'slump') { ctx.save(); ctx.beginPath(); ctx.rect(-80, -200, 160, 200 - 60); ctx.clip(); }
    else shoesFront(ctx, sp, d, sw, mv);
    if (back && sp.pole) seg(ctx, -62, -112, 62, -110, 4, '#7a5a34');
    torsoPath(ctx, d, sway); fillStroke(ctx, cloth(ctx, sp.robe, -d.hem, d.hem), 1.4);
    if (d.k !== 'short') {                                      // 衣褶
      ctx.strokeStyle = P.rgba('#1a120c', 0.22); ctx.lineWidth = 1;
      [-0.5, 0.15, 0.6].forEach(t => { ctx.beginPath(); ctx.moveTo(t * d.wa, -70); ctx.quadraticCurveTo(t * d.hem * 0.9 + sway, -40, t * d.hem + sway, d.hemY + 2); ctx.stroke(); });
      if (sp.hemTrim) { ctx.strokeStyle = sp.hemTrim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-d.hem + sway + 1, d.hemY - 2); ctx.quadraticCurveTo(sway, d.hemY + 4, d.hem + sway - 1, d.hemY - 2); ctx.stroke(); }
    }
    if (sp.pattern && !back) {                                  // 锦纹：小团花
      ctx.fillStyle = P.rgba(sp.pattern, 0.5);
      [[-10, -94], [9, -62], [-12, -44], [6, -30], [14, -90], [-3, -54]].forEach(p => { P.ellipse(ctx, p[0], p[1], 2.4, 2.4, P.rgba(sp.pattern, 0.5)); });
    }
    if (back) { seg(ctx, 0, -112, 0, -82, 1, P.rgba('#1a120c', 0.3)); ctx.strokeStyle = sp.inner || '#ece4d0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -119, 8, 0.25, Math.PI - 0.25); ctx.stroke(); }
    else collarFront(ctx, sp, d);
    if (sp.apron && !back) { ctx.beginPath(); ctx.moveTo(-d.wa + 2, -84); ctx.lineTo(d.wa - 2, -84); ctx.lineTo(d.hem - 3, -36); ctx.lineTo(-d.hem + 3, -36); ctx.closePath(); fillStroke(ctx, sp.apron, 1.1); seg(ctx, -6, -84, -4, -112, 1.6, sp.apron); seg(ctx, 6, -84, 4, -112, 1.6, sp.apron); }
    sashFront(ctx, sp, d, back);
    if (back && sp.knife) {                                     // 别在腰后的酒刀
      seg(ctx, -15, -86, 1, -75, 6.4, '#1c1512'); seg(ctx, -15, -86, 1, -75, 4.4, '#4b3525');
      for (let i = 0; i < 4; i++) seg(ctx, -13 + i * 3.6, -86.6 + i * 2.5, -11.4 + i * 3.6, -82.6 + i * 2.5, 1, '#c8b48a');
      seg(ctx, 1, -75, 13, -66.5, 5.6, '#1c1512'); seg(ctx, 1.5, -74.6, 12.4, -67, 3.4, '#9aa3a6'); seg(ctx, 2, -75.4, 11.6, -68.6, 0.9, '#e6eced');
    }
    if (o.pose === 'squat') {                                    // 蹲着：下半身缩成一团
      ctx.restore(); ctx.beginPath(); ctx.ellipse(0, -44, d.wa + 5, 17, 0, 0, Math.PI * 2); fillStroke(ctx, cloth(ctx, sp.pants || sp.robe, -24, 24), 1.3);
      P.ellipse(ctx, -9, -27, 6, 3.6, sp.bare ? (sp.skin || C.skin) : '#231b17', INK, 1); P.ellipse(ctx, 9, -27, 6, 3.6, sp.bare ? (sp.skin || C.skin) : '#231b17', INK, 1);
      ctx.beginPath(); ctx.moveTo(-d.sh, -106); ctx.lineTo(-d.sh + 6, -62); ctx.lineTo(8, -54); ctx.lineTo(6, -64); ctx.lineTo(-d.sh + 12, -74); ctx.closePath(); fillStroke(ctx, P.dark(sp.robe, 0.08), 1.2);
      ctx.beginPath(); ctx.moveTo(d.sh, -106); ctx.lineTo(d.sh - 6, -62); ctx.lineTo(-8, -54); ctx.lineTo(-6, -64); ctx.lineTo(d.sh - 12, -74); ctx.closePath(); fillStroke(ctx, P.dark(sp.robe, 0.08), 1.2);
    } else if (o.pose === 'sit' || o.pose === 'slump') { ctx.restore(); if (back) { ctx.beginPath(); ctx.moveTo(-d.wa - 3, -62); ctx.lineTo(d.wa + 3, -62); ctx.lineTo(d.wa + 7, -44); ctx.lineTo(-d.wa - 7, -44); ctx.closePath(); fillStroke(ctx, P.dark(sp.robe, 0.12), 1.2); } }
    if (o.pose !== 'squat') armsFront(ctx, sp, d, sw, mv, back, o.carry);
    if (!back && sp.towel) { ctx.beginPath(); ctx.moveTo(d.sh - 12, -116); ctx.lineTo(d.sh - 2, -113); ctx.lineTo(d.sh - 5, -84); ctx.lineTo(d.sh - 15, -86); ctx.closePath(); fillStroke(ctx, '#efe9da', 1); seg(ctx, d.sh - 14, -90, d.sh - 5.5, -88.4, 1, 'rgba(90,110,140,0.6)'); }
    if (back && sp.towel) { ctx.beginPath(); ctx.moveTo(-d.sh + 12, -116); ctx.lineTo(-d.sh + 2, -113); ctx.lineTo(-d.sh + 4, -94); ctx.lineTo(-d.sh + 14, -96); ctx.closePath(); fillStroke(ctx, '#efe9da', 1); }
    if (back) { headBack(ctx, sp); if (o.carry) { /* 背对时手里的东西被身子挡住 */ } }
    else { if (!back && sp.pole) seg(ctx, -62, -110, 62, -112, 4, '#7a5a34'); faceFront(ctx, sp, o); if (o.carry) carried(ctx, o.carry); }
    if (sp.pole) {                                              // 扁担两头的历日担子
      [-58, 58].forEach(x => { seg(ctx, x, -111, x - 6, -64, 1, '#3a2a1e'); seg(ctx, x, -111, x + 6, -64, 1, '#3a2a1e'); ctx.beginPath(); ctx.rect(x - 15, -64, 30, 26); fillStroke(ctx, '#b79a62', 1.2); for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#e9dfc6' : '#d9c9a4'; ctx.fillRect(x - 12 + i * 5, -70, 4, 8); } P.shadow(ctx, x, -2, 18, 5, 0.3); });
    }
  }
  function drawSide(ctx, sp, ph, o) {
    const mv = o.moving ? 1 : 0, sw = Math.sin(ph), d = dims(sp), f = d.f, col = sp.robe, sway = -mv * (1.5 + Math.abs(sw));
    const arm = (ang, shade) => {
      ctx.save(); ctx.translate(1, -108); ctx.rotate(ang);
      const wide = sp.wide || 1;
      ctx.beginPath(); ctx.moveTo(-6.5, -2); ctx.quadraticCurveTo(0, -7, 6.5, -2); ctx.lineTo(4 + 2 * wide, 40); ctx.lineTo(-4 - 3 * wide, 41); ctx.closePath();
      fillStroke(ctx, P.dark(col, shade), 1.2);
      if (sp.cuff) { ctx.fillStyle = sp.cuff; ctx.fillRect(-4 - 3 * wide, 37, 8 + 5 * wide, 4); }
      P.ellipse(ctx, 0, 45, 4.3, 4.6, sp.skin || C.skin, INK, 1); ctx.restore();
    };
    const sit = o.pose === 'sit' || o.pose === 'squat';
    if (!o.carry && !sit) arm(-sw * 0.55 * mv, 0.3);
    if (sit) { ctx.save(); ctx.beginPath(); ctx.rect(-80, -200, 160, 140); ctx.clip(); }
    else if (d.k === 'short') {
      [[-1, 0.28], [1, 0]].forEach(([sg, shade]) => {
        ctx.save(); ctx.translate(0, -64); ctx.rotate(-sg * sw * 0.42 * mv);
        ctx.beginPath(); ctx.moveTo(-7.5, 0); ctx.lineTo(7.5, 0); ctx.lineTo(6, 56); ctx.lineTo(-6, 56); ctx.closePath(); fillStroke(ctx, P.dark(sp.pants || '#4a4a48', shade), 1.2);
        ctx.beginPath(); ctx.ellipse(3, 60, 9.5, 4.8, 0, 0, Math.PI * 2); fillStroke(ctx, sp.bare ? (sp.skin || C.skin) : (sp.shoe || '#231b17'), 1.1); ctx.restore();
      });
    } else {
      const sc = sp.shoe || '#231b17';
      ctx.beginPath(); ctx.ellipse(-sw * 10 * mv + 3, -3.6 - mv * Math.max(0, -Math.cos(ph)) * 4, 9.5, 4.6, 0, 0, Math.PI * 2); fillStroke(ctx, P.dark(sc, 0.2), 1.1);
      ctx.beginPath(); ctx.ellipse(sw * 10 * mv + 3, -3.6 - mv * Math.max(0, Math.cos(ph)) * 4, 9.5, 4.6, 0, 0, Math.PI * 2); fillStroke(ctx, sc, 1.1);
    }
    ctx.beginPath(); ctx.moveTo(-9 * f, -113);
    ctx.quadraticCurveTo(-13 * f, -94, -12.5 * f, -75);
    ctx.bezierCurveTo(-13 * f, -56, (d.k === 'short' ? -14 : -19) * f + sway, d.hemY - 16, (d.k === 'short' ? -14 : -19) * f + sway, d.hemY);
    ctx.quadraticCurveTo(sway, d.hemY + 5, (d.k === 'short' ? 13 : 16) * f + sway * 0.6, d.hemY);
    ctx.bezierCurveTo((d.k === 'short' ? 13 : 15) * f, d.hemY - 18, 11 * f, -60, 11 * f, -76);
    ctx.quadraticCurveTo(14.5 * f, -98, 8.5 * f, -114); ctx.quadraticCurveTo(0, -119, -9 * f, -113); ctx.closePath();
    fillStroke(ctx, cloth(ctx, col, -20, 18), 1.4);
    if (d.k !== 'short') { ctx.strokeStyle = P.rgba('#1a120c', 0.22); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, -70); ctx.quadraticCurveTo(-8 + sway, -40, -8 + sway, d.hemY + 2); ctx.moveTo(5, -70); ctx.quadraticCurveTo(7 + sway, -40, 6 + sway, d.hemY + 2); ctx.stroke(); }
    if (d.k === 'dress') { ctx.fillStyle = sp.skirt || '#5b6b68'; ctx.beginPath(); ctx.moveTo(8, -112); ctx.lineTo(11.5 * f, -76); ctx.lineTo(16 * f + sway * 0.6, d.hemY); ctx.lineTo(9 + sway * 0.6, d.hemY + 2); ctx.lineTo(6, -76); ctx.closePath(); ctx.fill(); }
    else { ctx.strokeStyle = sp.trim || P.dark(col, 0.45); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(6.5, -116); ctx.quadraticCurveTo(13, -104, 10, -82); ctx.stroke(); ctx.fillStyle = sp.inner || '#ece4d0'; ctx.fillRect(3, -118, 5, 3.2); }
    if (sp.apron) { ctx.beginPath(); ctx.moveTo(4, -84); ctx.lineTo(12 * f, -84); ctx.lineTo(15 * f, -36); ctx.lineTo(4, -36); ctx.closePath(); fillStroke(ctx, sp.apron, 1.1); }
    if (sp.kind !== 'dress') { ctx.fillStyle = sp.sash || '#2a2320'; ctx.fillRect(-13.2 * f, -80, 24.6 * f, 7); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.strokeRect(-13.2 * f, -80, 24.6 * f, 7); }
    else { ctx.fillStyle = sp.sash || C.tenghuang; ctx.fillRect(-12 * f, -92, 23 * f, 4); }
    if (sp.knife) { seg(ctx, -12, -79, -23, -87, 6.4, '#1c1512'); seg(ctx, -12, -79, -23, -87, 4.4, '#4b3525'); seg(ctx, -15, -83.4, -17.4, -80, 1, '#c8b48a'); seg(ctx, -19, -86.2, -21.4, -83, 1, '#c8b48a'); }
    if (sit) { ctx.restore(); if (o.pose === 'squat') { ctx.beginPath(); ctx.ellipse(4, -44, 18, 16, 0, 0, Math.PI * 2); fillStroke(ctx, P.dark(sp.pants || col, 0.05), 1.3); P.ellipse(ctx, 12, -27, 8, 3.8, sp.bare ? (sp.skin || C.skin) : '#231b17', INK, 1); ctx.save(); ctx.translate(1, -106); ctx.rotate(-0.75); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(5, 40); ctx.lineTo(-5, 40); ctx.closePath(); fillStroke(ctx, P.dark(col, 0.08), 1.2); P.ellipse(ctx, 0, 43, 4.2, 4.4, sp.skin || C.skin, INK, 1); ctx.restore(); } }
    if (sp.towel) { ctx.beginPath(); ctx.moveTo(-5, -116); ctx.lineTo(5, -116); ctx.lineTo(9, -90); ctx.lineTo(0, -90); ctx.closePath(); fillStroke(ctx, '#efe9da', 1); }
    if (sp.pole) { seg(ctx, -44, -113, 48, -113, 4, '#7a5a34'); [-40, 44].forEach(x => { seg(ctx, x, -112, x, -64, 1, '#3a2a1e'); ctx.beginPath(); ctx.rect(x - 13, -64, 26, 26); fillStroke(ctx, '#b79a62', 1.2); for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#e9dfc6' : '#d9c9a4'; ctx.fillRect(x - 10 + i * 5, -70, 4, 8); } }); }
    if (o.carry) {
      ctx.beginPath(); ctx.moveTo(-4, -110); ctx.lineTo(6, -112); ctx.lineTo(24, -86); ctx.lineTo(17, -80); ctx.closePath(); fillStroke(ctx, P.dark(col, 0.06), 1.2);
      ctx.save(); ctx.translate(26, 0); carried(ctx, o.carry); ctx.restore(); P.ellipse(ctx, 21, -83, 4.3, 4.4, sp.skin || C.skin, INK, 1);
    } else if (!sit) arm(sw * 0.55 * mv, 0.04);
    headSide(ctx, sp, o);
  }

  /* 画一个人。ctx 的原点应已移到脚底。 */
  Fig.draw = function (ctx, sp, dir, phase, o) {
    o = o || {};
    const k = (sp.h || 150) / 150, mv = o.moving ? 1 : 0;
    if (o.shadow !== false) P.shadow(ctx, 0, 0, 30 * k * (sp.fat || 1), 9 * k, 0.4);
    ctx.save(); ctx.scale(k, k);
    let lift = 0;
    if (o.pose === 'sit') lift = 62 - (o.seat == null ? 34 : o.seat);
    else if (o.pose === 'squat') lift = 26;
    ctx.translate(0, lift - mv * Math.abs(Math.sin(phase)) * 2.2);
    if (o.pose === 'slump') {                                    // 趴在桌上：只见后脑、肩背和枕着的袖子
      ctx.translate(0, 62 - (o.seat == null ? 34 : o.seat));
      const d = dims(sp);
      ctx.beginPath(); ctx.ellipse(0, -84, d.sh + 6, 20, 0, Math.PI, 0); ctx.closePath(); fillStroke(ctx, cloth(ctx, sp.robe, -30, 30), 1.4);
      ctx.beginPath(); ctx.moveTo(-36, -80); ctx.quadraticCurveTo(0, -92, 36, -80); ctx.lineTo(34, -68); ctx.quadraticCurveTo(0, -62, -34, -68); ctx.closePath(); fillStroke(ctx, P.dark(sp.robe, 0.08), 1.3);
      ctx.save(); ctx.translate(-4, -78); ctx.rotate(-0.5); ctx.translate(0, 126);
      P.ellipse(ctx, 0, -133, 15, 15.5, sp.hairCol || C.hair, INK, 1.3); P.ellipse(ctx, 0, -150, 7.2, 6, sp.hairCol || C.hair, INK, 1.1);
      ctx.fillStyle = sp.skin || C.skin; ctx.beginPath(); ctx.ellipse(8, -124, 8, 6, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.restore(); return;
    }
    if (dir === 0) drawFront(ctx, sp, phase, o, false);
    else if (dir === 2) drawFront(ctx, sp, phase, o, true);
    else { if (dir === 1) ctx.scale(-1, 1); drawSide(ctx, sp, phase, o); }
    ctx.restore();
  };

  /* 对白里的小像：头肩特写，圆形 */
  const medCache = {};
  Fig.medallion = function (id, mood) {
    const key = id + '|' + (mood || '');
    if (medCache[key]) return medCache[key];
    const sp = Fig.cast[id]; if (!sp) return null;
    const n = 360, cv = document.createElement('canvas'); cv.width = cv.height = n;
    const c = cv.getContext('2d');
    c.save(); c.beginPath(); c.arc(n / 2, n / 2, n / 2 - 6, 0, Math.PI * 2); c.clip();
    const g = c.createRadialGradient(n / 2, n * 0.42, 20, n / 2, n / 2, n * 0.62); g.addColorStop(0, '#f1e6cc'); g.addColorStop(1, '#cdb88f');
    c.fillStyle = g; c.fillRect(0, 0, n, n);
    c.globalAlpha = 0.5; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(P.grainTile(), 'repeat'); c.fillRect(0, 0, n, n);
    c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    const k = (sp.h || 150) / 150, z = 5.2 / k;
    c.translate(n / 2, n * 0.5 + 131 * 5.2); c.scale(z, z);
    Fig.draw(c, sp, 0, 0, { shadow: false, detail: true, smile: mood === 'smile', closed: mood === 'closed' });
    c.restore();
    c.strokeStyle = '#5a3a22'; c.lineWidth = 7; c.beginPath(); c.arc(n / 2, n / 2, n / 2 - 6, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(215,165,68,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(n / 2, n / 2, n / 2 - 13, 0, Math.PI * 2); c.stroke();
    medCache[key] = cv; return cv;
  };

  /* ---------- 序章登场的人 ---------- */
  Fig.cast = {
    jingzhe: { name: '陆惊蛰', h: 150, kind: 'short', robe: '#4f6679', trim: '#2c3a47', inner: '#ebe3cf', pants: '#3c444c', sash: '#27211e', band: '#6c8798', towel: true, knife: true, brow: 0.8 },
    agui: { name: '阿桂', h: 116, kind: 'short', robe: '#8a775d', trim: '#5d4e3a', pants: '#5c5348', hair: 'boy', blush: true },
    laochu: { name: '老褚', h: 152, fat: 1.2, kind: 'short', robe: '#84735f', trim: '#4f4233', pants: '#514a42', apron: '#ddd5c1', hair: 'cook', beard: 'stubble', brow: -0.6 },
    siniang: { name: '阮四娘', h: 142, kind: 'dress', female: true, hair: 'female', robe: '#8b3a3a', trim: '#d7a544', skirt: '#3f504c', inner: '#ead9c0', sash: '#d7a544', brow: 1 },
    fan: { name: '范醉翁', h: 148, kind: 'robe', robe: '#7a7362', trim: '#4b4638', hair: 'old', hairCol: '#d9d5cc', beard: 'white', wide: 1.5, band: '#5a5548', brow: -0.4 },
    laodao: { name: '老道', h: 150, kind: 'robe', robe: '#586a74', trim: '#23292d', hair: 'dao', hairCol: '#8f8b85', beard: 'grey', beardLong: true, wide: 1.6, pole: true },
    qier: { name: '小乞儿', h: 96, kind: 'short', robe: '#6d5d4a', trim: '#4a3f33', pants: '#57503f', hair: 'beggar', bare: true, blush: true },
    xiaolai: { name: '小癞', h: 122, kind: 'short', robe: '#665a4c', trim: '#40382f', pants: '#4c463c', hair: 'patchy', bare: true },
    child: { name: '孩子', h: 100, kind: 'robe', robe: '#b9b29c', trim: '#7d7868', hair: 'boy', blush: true, shoe: '#3a2f28' },
    xiali: { name: '夏离', h: 156, kind: 'robe', robe: '#8a2f3a', trim: '#d7a544', inner: '#f0e7d2', sash: '#1d1a18', jade: true, hair: 'futou', skin: '#e2bf96', pattern: '#e3b95a', hemTrim: '#d7a544', cuff: '#d7a544', wide: 1.2, brow: 1.2 },
    huoji: { name: '伙计', h: 160, fat: 1.08, kind: 'short', robe: '#3a3a3c', trim: '#1f1f21', pants: '#2c2c2e', skin: '#d9b28a', beard: 'stubble' },
    shikeA: { name: '食客甲', h: 150, kind: 'robe', robe: '#5d7a6b', trim: '#2f4238', wide: 1.3 },
    shikeB: { name: '食客乙', h: 150, fat: 1.12, kind: 'robe', robe: '#8a6a3c', trim: '#4f3b1f', beard: 'black', wide: 1.3 },
    hangcai: { name: '行菜', h: 148, kind: 'short', robe: '#5b6f62', trim: '#33413a', pants: '#3f4640', towel: true },
    baoqi: { name: '鲍七', h: 146, kind: 'short', robe: '#6a5a6a', trim: '#3d333d', pants: '#474049', beard: 'black' },
  };
  /* 路人和食客：按种子配一身衣裳 */
  Fig.extra = function (seed) {
    const r = JX.rng(seed), robes = ['#6b7f8a', '#8a7a56', '#5f6b4f', '#7c5a4a', '#58606e', '#93806a', '#4f6470', '#7a6a7c', '#a08a62', '#6a4e4e'];
    const female = r() < 0.24, robe = robes[Math.floor(r() * robes.length)];
    return female
      ? { h: 138 + r() * 8, kind: 'dress', female: true, hair: 'female', robe: ['#7c8fa0', '#a7848a', '#8aa08c', '#b39a6a'][Math.floor(r() * 4)], trim: '#e6d7b4', skirt: ['#4a5a66', '#6a4a52', '#54624e'][Math.floor(r() * 3)], inner: '#efe6d2' }
      : { h: 144 + r() * 12, fat: 0.95 + r() * 0.25, kind: r() < 0.7 ? 'robe' : 'short', robe, trim: P.dark(robe, 0.45), pants: '#4a4a48', hair: r() < 0.2 ? 'futou' : 'bun', beard: r() < 0.3 ? 'black' : (r() < 0.12 ? 'grey' : null), wide: 1 + r() * 0.5, band: robes[Math.floor(r() * robes.length)] };
  };
})();
