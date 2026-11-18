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
  const HAT = { futou: 1, cap: 1, gaojin: 1, zhanjiao: 1 };
  /* 斗笠：戴在发髻外头（sp.hat === 'douli'）。正面、背面、侧面都是同一个尖顶宽檐 */
  function douli(ctx, sp, side) {
    if (sp.hat !== 'douli') return;
    const col = sp.hatCol || '#c9b07a', dx = side ? 1.5 : 0;
    ctx.beginPath(); ctx.moveTo(dx - 28, -141); ctx.quadraticCurveTo(dx, -150.5, dx + 28, -141); ctx.lineTo(dx + 4, -166.5); ctx.quadraticCurveTo(dx, -169, dx - 4, -166.5); ctx.closePath();
    fillStroke(ctx, P.hgrad(ctx, dx - 28, 0, 56, [[0, P.dark(col, 0.3)], [0.42, P.light(col, 0.16)], [1, P.dark(col, 0.34)]]), 1.2);
    for (let i = -3; i <= 3; i++) seg(ctx, dx + i * 1.1, -166, dx + i * 8.4, -143.6 - (3 - Math.abs(i)) * 1.1, 0.6, 'rgba(70,48,22,0.38)');
    ctx.strokeStyle = 'rgba(70,48,22,0.4)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(dx - 16, -152); ctx.quadraticCurveTo(dx, -157, dx + 16, -152); ctx.stroke();
  }
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
      if (sp.ribbon) { seg(ctx, -6, -149.5, -19, -143, 2.8, sp.ribbon); seg(ctx, -19, -143, -21, -131, 2.4, sp.ribbon); seg(ctx, -5, -148, -15, -136, 2.2, P.dark(sp.ribbon, 0.15)); }
    } else if (st === 'boy') {
      P.ellipse(ctx, -11, -150, 5.5, 5, hc, INK, 1); P.ellipse(ctx, 11, -150, 5.5, 5, hc, INK, 1);
      seg(ctx, -11, -146.5, -11, -145, 2.4, C.zhusha); seg(ctx, 11, -146.5, 11, -145, 2.4, C.zhusha);
    } else if (st === 'futou') {
      ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-15.8, -134); ctx.bezierCurveTo(-18, -153, 18, -153, 15.8, -134); ctx.lineTo(14, -139.5); ctx.quadraticCurveTo(0, -143, -14, -139.5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, -148); ctx.quadraticCurveTo(-10, -160, 0, -160); ctx.quadraticCurveTo(10, -160, 10, -148); ctx.closePath(); ctx.fill();
      seg(ctx, -15, -144, -19.5, -145, 2.6, '#17120f'); seg(ctx, 15, -144, 19.5, -145, 2.6, '#17120f');
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-9, -141.5, 18, 1.2);
    } else if (st === 'cap') {                                   // 方顶幞头：夏离戴的那种，后面高起一块
      ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-15.8, -134); ctx.bezierCurveTo(-18, -153, 18, -153, 15.8, -134); ctx.lineTo(14, -139.5); ctx.quadraticCurveTo(0, -143, -14, -139.5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-11.5, -147); ctx.lineTo(-10.5, -164); ctx.quadraticCurveTo(0, -167.5, 10.5, -164); ctx.lineTo(11.5, -147); ctx.closePath(); fillStroke(ctx, '#1d1714', 1);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-9.5, -157, 19, 1.2); ctx.fillRect(-12, -146.4, 24, 1);
      P.ellipse(ctx, 0, -141.8, 2.3, 1.9, '#9fd0c0', INK, 0.6);
    } else if (st === 'gaojin') {                                // 高装巾子：贺元度
      ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-15.8, -134); ctx.bezierCurveTo(-18, -153, 18, -153, 15.8, -134); ctx.lineTo(14, -139.5); ctx.quadraticCurveTo(0, -143, -14, -139.5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-13.5, -143); ctx.lineTo(-12, -173); ctx.lineTo(12, -173); ctx.lineTo(13.5, -143); ctx.closePath(); fillStroke(ctx, '#1d1714', 1); seg(ctx, 0, -172, 0, -145, 1, 'rgba(255,255,255,0.18)');
    } else if (st === 'zhanjiao') {                              // 展脚幞头：做官的
      seg(ctx, -11, -153, -47, -154, 3, '#17120f'); seg(ctx, 11, -153, 47, -154, 3, '#17120f');
      ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-15.8, -134); ctx.bezierCurveTo(-18, -153, 18, -153, 15.8, -134); ctx.lineTo(14, -139.5); ctx.quadraticCurveTo(0, -143, -14, -139.5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-11.5, -147); ctx.lineTo(-10.5, -163); ctx.quadraticCurveTo(0, -166.5, 10.5, -163); ctx.lineTo(11.5, -147); ctx.closePath(); fillStroke(ctx, '#1d1714', 1);
    } else if (st === 'bald') {
      seg(ctx, -15.2, -140.5, 15.2, -140.5, 3.8, sp.band || '#4f6b6c');
    } else if (st === 'female') {
      P.ellipse(ctx, 0, -155, 11, 9, hc, INK, 1.1); P.ellipse(ctx, -9, -150, 6, 5, hc); P.ellipse(ctx, 9, -150, 6, 5, hc);
      seg(ctx, -15.4, -131, -15, -122, 3, hc); seg(ctx, 15.4, -131, 15, -122, 3, hc);
      seg(ctx, 5, -160, 17, -156, 1.6, sp.pin || C.tenghuang); P.ellipse(ctx, 17, -156, 2.2, 2.2, sp.pinGem || C.zhusha);
    } else if (st === 'girl') {                                 // 辫发
      P.ellipse(ctx, 0, -151, 9, 6, hc);
      seg(ctx, -14.5, -131, -17, -108, 4.2, hc); seg(ctx, 14.5, -131, 17, -108, 4.2, hc);
      P.ellipse(ctx, -17, -107, 2.6, 2.6, C.zhusha); P.ellipse(ctx, 17, -107, 2.6, 2.6, C.zhusha);
    } else if (st === 'gaoji') {
      P.ellipse(ctx, 2, -158, 10, 11, hc, INK, 1.1); P.ellipse(ctx, -8, -152, 6, 6, hc, INK, 1);
      seg(ctx, -14, -159, 15, -156, 1.6, '#dfe3e6'); P.ellipse(ctx, -15, -159, 1.8, 1.8, '#eef2f4'); seg(ctx, 13, -156, 14, -150, 0.8, '#c9b27a'); P.ellipse(ctx, 14, -149, 1.4, 1.4, '#a9c9b4');
      seg(ctx, -15.4, -131, -15.4, -117, 2.4, hc); seg(ctx, 15.4, -131, 15.4, -117, 2.4, hc);
    } else if (st === 'twinbun') {
      [-1, 1].forEach(sg => { P.ellipse(ctx, sg * 12, -152.5, 6.6, 6, hc, INK, 1); seg(ctx, sg * 9, -147.6, sg * 15, -147.6, 2.4, C.zhusha); seg(ctx, sg * 15, -147.6, sg * 19, -141, 1.8, C.zhusha); });
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(-14.6, -142); ctx.lineTo(14.6, -142); ctx.lineTo(13.4, -136.4); ctx.lineTo(-13.4, -136.4); ctx.closePath(); ctx.fill();
      seg(ctx, -15.4, -131, -15, -119, 2.8, hc); seg(ctx, 15.4, -131, 15, -119, 2.8, hc);
    } else if (st === 'braids') {
      seg(ctx, -14.6, -140.4, 14.6, -140.4, 1.6, '#c9a24a'); P.ellipse(ctx, 0, -139.6, 2, 2.6, '#3aa6a0', INK, 0.6);
      [-1, 1].forEach(sg => { seg(ctx, sg * 15, -128, sg * 17.5, -96, 3.6, hc); P.ellipse(ctx, sg * 16.6, -108, 2.2, 2.2, '#3aa6a0'); P.ellipse(ctx, sg * 17.4, -97, 2.2, 2.2, '#d8503c'); });
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
    hairFront(ctx, sp); douli(ctx, sp);
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
    ctx.beginPath(); ctx.ellipse(0, -133, 15, 16.5, 0, 0, Math.PI * 2); fillStroke(ctx, HAT[st] ? '#17120f' : hc, 1.3);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -133, 14.4, 15.9, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -115.5, 11, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    if (st === 'patchy') { P.ellipse(ctx, -5, -140, 5, 3.5, skin); P.ellipse(ctx, 6, -132, 4, 3, skin); }
    ctx.restore();
    if (st === 'bun' || st === 'old' || st === 'dao') {
      P.ellipse(ctx, 0, -152.5, 7.6, 6.6, hc, INK, 1.1); ctx.fillStyle = sp.band || sp.trim || '#3a4a5a'; ctx.fillRect(-6.5, -148.6, 13, 3.2);
      if (st === 'dao') seg(ctx, -12, -152.5, 12, -152.5, 2, '#9fb8a6'); else if (sp.ribbon) { seg(ctx, -2, -148, -7, -126, 2.8, sp.ribbon); seg(ctx, 2, -148, 6, -130, 2.6, P.dark(sp.ribbon, 0.15)); } else { seg(ctx, -2, -148, -5, -138, 2.2, sp.band || sp.trim || '#3a4a5a'); seg(ctx, 2, -148, 4, -139, 2.2, sp.band || sp.trim || '#3a4a5a'); }
    } else if (st === 'boy') { P.ellipse(ctx, -11, -150, 5.5, 5, hc, INK, 1); P.ellipse(ctx, 11, -150, 5.5, 5, hc, INK, 1); }
    else if (st === 'gaojin') { ctx.beginPath(); ctx.moveTo(-13.5, -143); ctx.lineTo(-12, -173); ctx.lineTo(12, -173); ctx.lineTo(13.5, -143); ctx.closePath(); fillStroke(ctx, '#1d1714', 1); }
    else if (st === 'zhanjiao') { seg(ctx, -11, -153, -47, -154, 3, '#17120f'); seg(ctx, 11, -153, 47, -154, 3, '#17120f'); ctx.beginPath(); ctx.moveTo(-11.5, -147); ctx.lineTo(-10.5, -163); ctx.quadraticCurveTo(0, -166.5, 10.5, -163); ctx.lineTo(11.5, -147); ctx.closePath(); fillStroke(ctx, '#1d1714', 1); }
    else if (st === 'bald') { seg(ctx, -15, -139, 15, -139, 3.8, sp.band || '#4f6b6c'); seg(ctx, 2, -139, 7, -128, 2.6, sp.band || '#4f6b6c'); seg(ctx, 0, -139, -3, -127, 2.6, sp.band || '#4f6b6c'); }
    else if (st === 'cap') { ctx.beginPath(); ctx.moveTo(-11.5, -147); ctx.lineTo(-10.5, -164); ctx.quadraticCurveTo(0, -167.5, 10.5, -164); ctx.lineTo(11.5, -147); ctx.closePath(); fillStroke(ctx, '#1d1714', 1); seg(ctx, -5, -138, -7.5, -124, 3, '#17120f'); seg(ctx, 5, -138, 7.5, -124, 3, '#17120f'); }
    else if (st === 'futou') { ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-10, -148); ctx.quadraticCurveTo(-10, -160, 0, -160); ctx.quadraticCurveTo(10, -160, 10, -148); ctx.closePath(); ctx.fill(); seg(ctx, -8, -136, -22, -128, 3, '#17120f'); seg(ctx, 8, -136, 22, -128, 3, '#17120f'); }
    else if (st === 'female') { P.ellipse(ctx, 0, -155, 11, 9, hc, INK, 1.1); seg(ctx, -5, -160, -17, -156, 1.6, sp.pin || C.tenghuang); }
    else if (st === 'girl') { P.ellipse(ctx, 0, -151, 9, 6, hc); seg(ctx, -6, -122, -8, -98, 4.4, hc); seg(ctx, 6, -122, 8, -98, 4.4, hc); P.ellipse(ctx, -8, -97, 2.6, 2.6, C.zhusha); P.ellipse(ctx, 8, -97, 2.6, 2.6, C.zhusha); }
    else if (st === 'beggar' || st === 'patchy') for (let i = -3; i <= 3; i++) seg(ctx, i * 4.5, -148, i * 5.5, -155 - (i % 2 ? 3 : 0), 2, hc);
    else if (st === 'gaoji') { P.ellipse(ctx, -2, -158, 10, 11, hc, INK, 1.1); P.ellipse(ctx, 8, -152, 6, 6, hc, INK, 1); seg(ctx, -15, -156, 14, -159, 1.6, '#dfe3e6'); }
    else if (st === 'twinbun') [-1, 1].forEach(sg => { P.ellipse(ctx, sg * 12, -152.5, 6.6, 6, hc, INK, 1); seg(ctx, sg * 9, -147.6, sg * 15, -147.6, 2.4, C.zhusha); seg(ctx, sg * 15, -147.6, sg * 19, -141, 1.8, C.zhusha); });
    else if (st === 'braids') { ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(-14, -124); ctx.lineTo(14, -124); ctx.lineTo(11, -84); ctx.lineTo(-11, -84); ctx.closePath(); ctx.fill(); seg(ctx, -14.6, -138, 14.6, -138, 1.6, '#c9a24a'); [-1, 1].forEach(sg => { seg(ctx, sg * 7, -86, sg * 8, -70, 3.2, hc); P.ellipse(ctx, sg * 8, -70, 2, 2, '#d8503c'); }); }
    else if (st === 'cook') { ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(-14, -146); ctx.quadraticCurveTo(0, -160, 14, -146); ctx.closePath(); ctx.fill(); seg(ctx, 0, -124, -4, -114, 2.4, hc); seg(ctx, 0, -124, 5, -115, 2.4, hc); }
  }
  function headSide(ctx, sp, o) {
    const skin = sp.skin || C.skin, hc = sp.hairCol || C.hair, st = sp.hair || 'bun';
    ctx.fillStyle = P.dark(skin, 0.12); ctx.fillRect(-4, -119, 9, 9);
    ctx.beginPath(); ctx.ellipse(2, -133, 14.5, 16.5, 0, 0, Math.PI * 2);
    fillStroke(ctx, P.hgrad(ctx, -13, 0, 30, [[0, P.dark(skin, 0.12)], [0.7, P.light(skin, 0.1)], [1, skin]]), 1.3);
    P.ellipse(ctx, 16.2, -130.4, 2.7, 2.3, skin, INK, 1); P.ellipse(ctx, 14.6, -130.4, 2.4, 2.2, skin);
    if (sp.blush) P.ellipse(ctx, 8.5, -126.5, 4, 2.6, 'rgba(214,110,96,0.32)');
    const cap = st === 'cook' ? (sp.capCol || '#cfc6b0') : HAT[st] ? '#17120f' : hc;
    ctx.beginPath(); ctx.moveTo(8, -149.5); ctx.bezierCurveTo(-6, -154, -15, -146, -13.2, -131); ctx.bezierCurveTo(-13, -124, -9, -120, -6, -119.6);
    ctx.lineTo(-3.6, -128); ctx.bezierCurveTo(-6, -137, 1, -142.5, 12, -143.5); ctx.closePath(); ctx.fillStyle = cap; ctx.fill();
    P.ellipse(ctx, -1.5, -131, 2.4, 3.8, skin, INK, 0.9);
    if (st === 'bun' || st === 'old' || st === 'dao') { P.ellipse(ctx, -2, -152.6, 7.6, 6.6, hc, INK, 1.1); ctx.fillStyle = sp.band || sp.trim || '#3a4a5a'; ctx.fillRect(-8, -148.6, 12, 3.2); if (st === 'dao') seg(ctx, -12, -153, 9, -152, 2, '#9fb8a6'); if (sp.ribbon) { seg(ctx, -8, -149, -17, -140, 2.8, sp.ribbon); seg(ctx, -17, -140, -18, -127, 2.4, sp.ribbon); } }
    else if (st === 'boy') { P.ellipse(ctx, -4, -151, 6, 5.4, hc, INK, 1); seg(ctx, -4, -147, -4, -145.4, 2.4, C.zhusha); }
    else if (st === 'gaojin') { ctx.beginPath(); ctx.moveTo(-13, -143); ctx.lineTo(-11.5, -173); ctx.lineTo(9, -173); ctx.lineTo(11, -145); ctx.closePath(); fillStroke(ctx, '#1d1714', 1); }
    else if (st === 'zhanjiao') { ctx.beginPath(); ctx.moveTo(-13.5, -146); ctx.lineTo(-12.5, -163); ctx.quadraticCurveTo(-4, -166.5, 4.5, -164); ctx.lineTo(7, -148.5); ctx.closePath(); fillStroke(ctx, '#1d1714', 1); seg(ctx, -9, -153, -15, -153.5, 3.4, '#17120f'); }
    else if (st === 'bald') { seg(ctx, -13.4, -139, 15, -140.5, 3.8, sp.band || '#4f6b6c'); seg(ctx, -13, -139, -18, -128, 2.6, sp.band || '#4f6b6c'); }
    else if (st === 'cap') { ctx.beginPath(); ctx.moveTo(-13.5, -146); ctx.lineTo(-12.5, -164); ctx.quadraticCurveTo(-4, -167.5, 4.5, -165); ctx.lineTo(7, -148.5); ctx.closePath(); fillStroke(ctx, '#1d1714', 1); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-11.5, -157, 15, 1.2); seg(ctx, -12, -139, -17, -126, 2.8, '#17120f'); P.ellipse(ctx, 11.6, -143.4, 1.6, 1.5, '#9fd0c0', INK, 0.5); }
    else if (st === 'futou') { ctx.fillStyle = '#17120f'; ctx.beginPath(); ctx.moveTo(-12, -146); ctx.quadraticCurveTo(-13, -160, -2, -160); ctx.quadraticCurveTo(6, -160, 6, -149); ctx.closePath(); ctx.fill(); seg(ctx, -12, -138, -26, -132, 3, '#17120f'); }
    else if (st === 'female') { P.ellipse(ctx, -4, -155, 11, 9, hc, INK, 1.1); seg(ctx, -12.5, -131, -11, -121, 3, hc); seg(ctx, 2, -160, 13, -157, 1.6, sp.pin || C.tenghuang); P.ellipse(ctx, 13, -157, 2.2, 2.2, sp.pinGem || C.zhusha); }
    else if (st === 'girl') { P.ellipse(ctx, -3, -151, 9, 6, hc); seg(ctx, -9, -124, -13, -99, 4.4, hc); P.ellipse(ctx, -13, -98, 2.6, 2.6, C.zhusha); }
    else if (st === 'beggar' || st === 'patchy') { for (let i = -3; i <= 1; i++) seg(ctx, i * 4.5, -148, i * 5.5 - 2, -155 - (i % 2 ? 3 : 0), 2, hc); if (st === 'patchy') P.ellipse(ctx, -5, -143, 4.5, 3, skin); }
    else if (st === 'cook') { ctx.fillStyle = cap; ctx.beginPath(); ctx.moveTo(-13, -144); ctx.quadraticCurveTo(-3, -160, 11, -146); ctx.closePath(); ctx.fill(); }
    else if (st === 'gaoji') { P.ellipse(ctx, -5, -157, 10.5, 11, hc, INK, 1.1); seg(ctx, -17, -158, 10, -156, 1.6, '#dfe3e6'); seg(ctx, -12.5, -131, -11.5, -118, 2.6, hc); }
    else if (st === 'twinbun') { P.ellipse(ctx, -4, -152.5, 6.8, 6.2, hc, INK, 1); seg(ctx, -8, -147.4, 0, -147.4, 2.4, C.zhusha); seg(ctx, -8, -147.4, -13, -141, 1.8, C.zhusha); ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(2, -144); ctx.lineTo(15, -141); ctx.lineTo(14, -136.6); ctx.lineTo(1, -138); ctx.closePath(); ctx.fill(); seg(ctx, -12, -130, -12, -118, 2.8, hc); }
    else if (st === 'braids') { ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(-13, -128); ctx.lineTo(-3, -128); ctx.lineTo(-7, -82); ctx.lineTo(-17, -84); ctx.closePath(); ctx.fill(); seg(ctx, 6, -124, 8, -96, 3.4, hc); P.ellipse(ctx, 8, -97, 2.2, 2.2, '#d8503c'); seg(ctx, -11, -139.6, 13, -139.6, 1.6, '#c9a24a'); }
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
    return { f, k, sh: (sp.female ? 20 : 23) * f, wa: (sp.female ? 15 : 18.5) * f, hemY: sp.hemY != null ? sp.hemY : (k === 'short' ? -56 : (k === 'dress' ? -8 : -12)), hem: (sp.hemW || (k === 'short' ? 21 : k === 'dress' ? 27 : 25.5)) * f, legs: k === 'short' || (sp.hemY != null && sp.hemY < -30) };
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
    if (d.legs) {
      [[-9 * d.f, lL], [9 * d.f, lR]].forEach(([x, lift]) => {
        ctx.beginPath(); ctx.moveTo(x - 7.5, -64); ctx.lineTo(x + 7.5, -64); ctx.lineTo(x + 6, -8 - lift); ctx.lineTo(x - 6, -8 - lift); ctx.closePath();
        fillStroke(ctx, cloth(ctx, sp.pants || '#4a4a48', x - 8, x + 8), 1.2);
        if (sp.boots) { ctx.fillStyle = sp.boots; ctx.fillRect(x - 6.6, -36 - lift, 13.2, 30); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 6.6, -36 - lift, 13.2, 30); if (sp.fur) P.ellipse(ctx, x, -36 - lift, 8, 3.4, sp.furCol || '#f8f4ec', sp.furEdge || 'rgba(120,104,90,0.6)', 0.8); }
        else if (sp.wraps) { ctx.fillStyle = sp.wraps; ctx.fillRect(x - 6.2, -34 - lift, 12.4, 27); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.strokeRect(x - 6.2, -34 - lift, 12.4, 27); for (let q = 0; q < 3; q++) { seg(ctx, x - 6, -30 + q * 8 - lift, x + 6, -24 + q * 8 - lift, 0.8, sp.wrapTie || 'rgba(30,30,40,0.45)'); seg(ctx, x + 6, -30 + q * 8 - lift, x - 6, -24 + q * 8 - lift, 0.8, sp.wrapTie || 'rgba(30,30,40,0.45)'); } }      // 绑腿：缠到小腿
        else { ctx.fillStyle = P.dark(sp.pants || '#4a4a48', 0.3); ctx.fillRect(x - 6, -15 - lift, 12, 3); }     // 绑腿口
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
  function miniPipa(ctx, x, y, rot, k) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(8, -20, 17, 4, 12, 18); ctx.bezierCurveTo(8, 26, -8, 26, -12, 18); ctx.bezierCurveTo(-17, 4, -8, -20, 0, -22); ctx.closePath();
    fillStroke(ctx, P.hgrad(ctx, -14, 0, 28, [[0, '#8a5a2c'], [0.4, '#d2a868'], [1, '#7a4a22']]), 1.2);
    P.ellipse(ctx, 0, 5, 8, 11, 'rgba(240,222,180,0.6)'); seg(ctx, -6, 15, 6, 15, 2, '#3a2414');
    seg(ctx, 0, -22, 0, -62, 4, '#3a2414'); seg(ctx, 0, -22, 0, -62, 2, '#6a4426'); seg(ctx, 0, -62, 5, -68, 3, '#3a2414');
    seg(ctx, -1, -56, -7, -57, 1.5, '#2e1c10'); seg(ctx, 1, -52, 7, -53, 1.5, '#2e1c10'); seg(ctx, -1, 14, -1, -60, 0.5, 'rgba(250,246,232,0.8)'); seg(ctx, 1.4, 14, 1, -60, 0.5, 'rgba(250,246,232,0.8)');
    ctx.restore();
  }
  function carried(ctx, what) {
    if (what === 'pipa') { miniPipa(ctx, -4, -62, 0.42, 1.2); return; }
    if (what === 'saber') { ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(8, -86); ctx.quadraticCurveTo(34, -116, 24, -152); ctx.stroke(); ctx.strokeStyle = '#e4eaee'; ctx.lineWidth = 3; ctx.stroke(); seg(ctx, 2, -80, 9, -88, 5.4, '#5a3a22'); seg(ctx, 3, -90, 13, -84, 2.4, '#c9a24a'); ctx.lineCap = 'butt'; return; }
    if (what === 'torch') {                                       // 火把：一根杆子、一团跳动的火，外加一圈光
      const fl = 1 + 0.12 * Math.sin((JX.time || 0) * 11);
      seg(ctx, 10, -84, 20, -150, 4.4, INK); seg(ctx, 10, -84, 20, -150, 2.6, '#5a3a22');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(21, -160, 0, 21, -160, 150); gr.addColorStop(0, 'rgba(255,180,100,' + (0.42 * fl) + ')'); gr.addColorStop(1, 'rgba(255,140,60,0)'); ctx.fillStyle = gr; ctx.fillRect(-130, -310, 300, 300); ctx.restore();
      P.ellipse(ctx, 21, -160, 8 * fl, 13 * fl, '#ffb24a'); P.ellipse(ctx, 21, -163, 4.6, 8 * fl, '#fff0c0');
      return;
    }
    if (what === 'coins') {                                       // 一大串铜钱，拎在手里
      seg(ctx, 13, -90, 14, -74, 1.4, '#7a4a28'); for (let i = 0; i < 7; i++) P.ellipse(ctx, 14 + (i % 2 ? 2.4 : -2.4), -72 + i * 5, 5.4, 3.2, i % 3 ? '#c9a24a' : '#b08a3a', INK, 0.8);
      return;
    }
    if (what === 'book') {                                        // 一册线装书，两手捧着
      ctx.save(); ctx.translate(0, -88); ctx.rotate(-0.08); ctx.fillStyle = '#3f5a78'; ctx.fillRect(-13, -9, 26, 18); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-13, -9, 26, 18); ctx.fillStyle = '#efe6cc'; ctx.fillRect(-10, -7, 5, 14); ctx.restore();
      return;
    }
    if (what === 'lantern') {                                     // 提灯：短杆挑着一只纸灯笼，带一团暖光
      const fl = 1 + 0.06 * Math.sin((JX.time || 0) * 7);
      seg(ctx, 6, -86, 23, -93, 2.8, INK); seg(ctx, 6, -86, 23, -93, 1.5, '#5a3a22'); seg(ctx, 23, -93, 23, -80, 1, INK);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gr = ctx.createRadialGradient(23, -66, 0, 23, -66, 130); gr.addColorStop(0, 'rgba(255,200,120,' + (0.2 * fl) + ')'); gr.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = gr; ctx.fillRect(-110, -200, 270, 270); ctx.restore();
      P.ellipse(ctx, 23, -66, 10, 13, '#ffd98a', INK, 1); P.ellipse(ctx, 23, -66, 5, 8, '#fff4cf'); ctx.fillStyle = '#3a2a1e'; ctx.fillRect(18, -81, 10, 3); ctx.fillRect(19, -54, 8, 3);
      return;
    }
    if (what === 'case') {                                        // 琵琶匣：竖着抱在怀里
      ctx.save(); ctx.translate(5, -92); ctx.rotate(0.1);
      ctx.beginPath(); ctx.moveTo(-9, 44); ctx.lineTo(-9, -34); ctx.quadraticCurveTo(-8, -58, 0, -60); ctx.quadraticCurveTo(8, -58, 9, -34); ctx.lineTo(13, 20); ctx.quadraticCurveTo(14, 46, 0, 48); ctx.quadraticCurveTo(-12, 48, -9, 44); ctx.closePath(); fillStroke(ctx, '#2e2420', 1.2);
      ctx.strokeStyle = '#d7a544'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-9, -20); ctx.lineTo(9, -20); ctx.moveTo(-10, 18); ctx.lineTo(13, 18); ctx.stroke(); ctx.restore();
      return;
    }
    if (what === 'basket') {                                      // 竹篮：面上是梅枝和山茶
      ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-2, -76); ctx.quadraticCurveTo(12, -110, 26, -76); ctx.stroke(); ctx.strokeStyle = '#a8864a'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5, -78); ctx.lineTo(29, -78); ctx.quadraticCurveTo(28, -57, 12, -56); ctx.quadraticCurveTo(-4, -57, -5, -78); ctx.closePath(); fillStroke(ctx, P.hgrad(ctx, -5, 0, 34, [[0, '#8a6a3a'], [0.5, '#c9a86a'], [1, '#7a5a30']]), 1.1);
      for (let i = 0; i < 4; i++) seg(ctx, i * 8, -77, 2 + i * 7, -59, 0.8, 'rgba(60,40,20,0.5)');
      seg(ctx, 6, -80, 0, -97, 1.2, '#3a2a1e'); seg(ctx, 18, -80, 27, -99, 1.2, '#3a2a1e');
      [[2, -82, '#e9a6b4'], [9, -86, '#f6e9ec'], [16, -83, '#c8362e'], [22, -85, '#e9a6b4'], [12, -80, '#f6e9ec'], [0, -98, '#e9a6b4'], [27, -100, '#f6e9ec']].forEach(q => P.ellipse(ctx, q[0], q[1], 3.4, 3.2, q[2], INK, 0.6));
      return;
    }
    if (what === 'pole') { seg(ctx, -24, 4, 30, -204, 5, INK); seg(ctx, -24, 4, 30, -204, 3, '#8a9a5a'); return; }
    if (what === 'staff') { seg(ctx, -26, -36, 28, -152, 5, INK); seg(ctx, -26, -36, 28, -152, 3.2, '#b08a52'); return; }
    if (what === 'blade') { seg(ctx, 6, -86, 30, -146, 4.6, INK); seg(ctx, 6, -86, 30, -146, 2.8, '#cfd6da'); seg(ctx, 2, -80, 8, -89, 5, '#2a2420'); return; }
    if (what === 'bow') {
      ctx.strokeStyle = 'rgba(245,240,225,0.9)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-27, -128); ctx.lineTo(25, -44); ctx.stroke();
      ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 5.4; ctx.beginPath(); ctx.moveTo(-27, -128); ctx.bezierCurveTo(-34, -112, -22, -100, -12, -88); ctx.bezierCurveTo(-2, -76, 6, -60, 25, -44); ctx.stroke();
      ctx.strokeStyle = '#8a5a2e'; ctx.lineWidth = 3.4; ctx.stroke(); ctx.strokeStyle = '#3a2416'; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(-15, -92); ctx.lineTo(-8, -83); ctx.stroke(); ctx.lineCap = 'butt';
      return;
    }
    if (what === 'cup') {
      ctx.beginPath(); ctx.moveTo(1, -96); ctx.lineTo(17, -96); ctx.quadraticCurveTo(16, -84, 9, -83); ctx.quadraticCurveTo(2, -84, 1, -96); ctx.closePath(); fillStroke(ctx, P.hgrad(ctx, 1, 0, 16, [[0, '#8fb2a0'], [0.4, '#d8ece0'], [1, '#7fa28e']]), 1);
      P.ellipse(ctx, 9, -96, 8, 2.4, '#c9862e', INK, 0.8); ctx.fillStyle = '#6f8f7e'; ctx.fillRect(6, -83, 6, 2.4);
      return;
    }
    if (what === 'bowl') {
      ctx.beginPath(); ctx.moveTo(-15, -90); ctx.lineTo(15, -90); ctx.quadraticCurveTo(14, -74, 0, -73); ctx.quadraticCurveTo(-14, -74, -15, -90); ctx.closePath(); fillStroke(ctx, P.hgrad(ctx, -15, 0, 30, [[0, '#86a892'], [0.4, '#cfe4d4'], [1, '#789a86']]), 1.1);
      P.ellipse(ctx, 0, -90, 15, 4, '#eadcb2', INK, 1); seg(ctx, -8, -90, 8, -90.5, 1.6, '#f6ecc8');
      seg(ctx, -16, -108, 2, -92, 1.3, '#7a4a28'); seg(ctx, -13, -110, 5, -93, 1.3, '#7a4a28'); seg(ctx, 3, -93, 2, -89, 1.6, '#f6ecc8');
      return;
    }
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
    if (sp.front && !back) { ctx.save(); ctx.clip(); ctx.beginPath(); ctx.moveTo(-8, -120); ctx.lineTo(8, -120); ctx.lineTo(13 + sway, d.hemY + 8); ctx.lineTo(-13 + sway, d.hemY + 8); ctx.closePath(); ctx.fillStyle = cloth(ctx, sp.front, -13, 13); ctx.fill(); ctx.strokeStyle = P.rgba('#1a120c', 0.4); ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); torsoPath(ctx, d, sway); }
    if (sp.lower) { ctx.save(); ctx.clip(); ctx.fillStyle = cloth(ctx, sp.lower, -d.hem, d.hem); ctx.fillRect(-60, -74, 120, 90); ctx.strokeStyle = P.rgba('#1a120c', 0.26); ctx.lineWidth = 1; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 5, -74); ctx.lineTo(i * 8, d.hemY + 5); ctx.stroke(); } ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke(); }
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
    else if (sp.topless) { ctx.strokeStyle = 'rgba(90,50,30,0.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-d.sh + 4, -100); ctx.quadraticCurveTo(-d.sh * 0.5, -94, -1, -100); ctx.quadraticCurveTo(d.sh * 0.5, -94, d.sh - 4, -100); ctx.moveTo(0, -112); ctx.lineTo(0, -100); ctx.stroke(); P.ellipse(ctx, -d.sh * 0.5, -101, 1.4, 1.4, 'rgba(120,60,40,0.8)'); P.ellipse(ctx, d.sh * 0.5, -101, 1.4, 1.4, 'rgba(120,60,40,0.8)'); P.ellipse(ctx, 0, -86, 1.6, 2, 'rgba(90,50,30,0.6)'); }
    else collarFront(ctx, sp, d);
    if (sp.beads && !back) for (let i = -4; i <= 4; i++) { const u = i / 4; P.ellipse(ctx, u * 9.5, -110 + 22 * (1 - u * u), i ? 1.9 : 2.6, i ? 1.9 : 2.6, i ? sp.beads : P.light(sp.beads, 0.25), 'rgba(40,24,12,0.7)', 0.6); }
    if (sp.fur) for (let i = -3; i <= 3; i++) P.ellipse(ctx, i * 6.6, -113.5 + Math.abs(i) * 1.5, 5.2, 4.4, sp.furCol || '#f8f4ec', sp.furEdge || 'rgba(120,104,90,0.6)', 0.8);
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
    if (back && sp.pipaBack && !o.carry) miniPipa(ctx, 3, -72, -0.3, 1);
    if (o.pose !== 'squat') armsFront(ctx, sp, d, sw, mv, back, o.carry);
    if (sp.shawl && !o.carry) [-1, 1].forEach(sg => { ctx.fillStyle = 'rgba(200,220,232,0.72)'; ctx.beginPath(); ctx.moveTo(sg * (d.sh + 3), -86); ctx.quadraticCurveTo(sg * (d.sh + 13), -60, sg * (d.sh + 7), -30); ctx.lineTo(sg * (d.sh + 1), -33); ctx.quadraticCurveTo(sg * (d.sh + 6), -60, sg * (d.sh - 2), -84); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(60,70,90,0.5)'; ctx.lineWidth = 0.8; ctx.stroke(); });
    if (!back && sp.pipaBack && !o.carry) { seg(ctx, 15, -112, 22, -150, 3.4, '#4a2f1c'); seg(ctx, 20, -146, 28, -147, 1.6, '#2e1c10'); seg(ctx, 21, -140, 14, -142, 1.6, '#2e1c10'); }
    if (!back && sp.towel) { ctx.beginPath(); ctx.moveTo(d.sh - 12, -116); ctx.lineTo(d.sh - 2, -113); ctx.lineTo(d.sh - 5, -84); ctx.lineTo(d.sh - 15, -86); ctx.closePath(); fillStroke(ctx, '#efe9da', 1); seg(ctx, d.sh - 14, -90, d.sh - 5.5, -88.4, 1, 'rgba(90,110,140,0.6)'); }
    if (back && sp.towel) { ctx.beginPath(); ctx.moveTo(-d.sh + 12, -116); ctx.lineTo(-d.sh + 2, -113); ctx.lineTo(-d.sh + 4, -94); ctx.lineTo(-d.sh + 14, -96); ctx.closePath(); fillStroke(ctx, '#efe9da', 1); }
    if (back) { headBack(ctx, sp); douli(ctx, sp); if (o.carry) { /* 背对时手里的东西被身子挡住 */ } }
    else { if (!back && sp.pole) seg(ctx, -62, -110, 62, -112, 4, '#7a5a34'); faceFront(ctx, sp, o); if (sp.mask) { ctx.fillStyle = sp.mask; ctx.beginPath(); ctx.moveTo(-14.6, -130); ctx.lineTo(14.6, -130); ctx.lineTo(13, -117); ctx.quadraticCurveTo(0, -110, -13, -117); ctx.closePath(); ctx.fill(); } if (o.carry) carried(ctx, o.carry); }
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
    if (sp.pipaBack && !o.carry) miniPipa(ctx, -17, -76, -0.18, 0.92);
    if (sit) { ctx.save(); ctx.beginPath(); ctx.rect(-80, -200, 160, 140); ctx.clip(); }
    else if (d.legs) {
      [[-1, 0.28], [1, 0]].forEach(([sg, shade]) => {
        ctx.save(); ctx.translate(0, -64); ctx.rotate(-sg * sw * 0.42 * mv);
        ctx.beginPath(); ctx.moveTo(-7.5, 0); ctx.lineTo(7.5, 0); ctx.lineTo(6, 56); ctx.lineTo(-6, 56); ctx.closePath(); fillStroke(ctx, P.dark(sp.pants || '#4a4a48', shade), 1.2);
        if (sp.boots) { ctx.fillStyle = P.dark(sp.boots, shade); ctx.fillRect(-6.6, 28, 13.2, 28); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-6.6, 28, 13.2, 28); if (sp.fur) P.ellipse(ctx, 0, 28, 8, 3.2, sp.furCol || '#f8f4ec', sp.furEdge || 'rgba(120,104,90,0.6)', 0.8); }
        if (sp.wraps && !sp.boots) { ctx.fillStyle = P.dark(sp.wraps, shade); ctx.fillRect(-6.2, 30, 12.4, 26); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.strokeRect(-6.2, 30, 12.4, 26); for (let q = 0; q < 3; q++) seg(ctx, -6, 34 + q * 8, 6, 39 + q * 8, 0.8, sp.wrapTie || 'rgba(30,30,40,0.45)'); }
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
    if (sp.front) { ctx.save(); ctx.clip(); ctx.fillStyle = sp.front; ctx.fillRect(4.5, -118, 16, 130); ctx.restore(); }
    if (sp.lower) { ctx.save(); ctx.clip(); ctx.fillStyle = cloth(ctx, sp.lower, -20, 18); ctx.fillRect(-60, -74, 120, 90); ctx.strokeStyle = P.rgba('#1a120c', 0.26); ctx.lineWidth = 1; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 5, -74); ctx.lineTo(i * 8, d.hemY + 5); ctx.stroke(); } ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke(); }
    if (d.k !== 'short') { ctx.strokeStyle = P.rgba('#1a120c', 0.22); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, -70); ctx.quadraticCurveTo(-8 + sway, -40, -8 + sway, d.hemY + 2); ctx.moveTo(5, -70); ctx.quadraticCurveTo(7 + sway, -40, 6 + sway, d.hemY + 2); ctx.stroke(); }
    if (d.k === 'dress') { ctx.fillStyle = sp.skirt || '#5b6b68'; ctx.beginPath(); ctx.moveTo(8, -112); ctx.lineTo(11.5 * f, -76); ctx.lineTo(16 * f + sway * 0.6, d.hemY); ctx.lineTo(9 + sway * 0.6, d.hemY + 2); ctx.lineTo(6, -76); ctx.closePath(); ctx.fill(); }
    else if (sp.topless) { ctx.strokeStyle = 'rgba(90,50,30,0.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(3 * f, -103); ctx.quadraticCurveTo(11 * f, -100, 10.5 * f, -94); ctx.moveTo(6 * f, -90); ctx.quadraticCurveTo(13.5 * f, -84, 9 * f, -82); ctx.stroke(); P.ellipse(ctx, 9 * f, -99, 1.3, 1.3, 'rgba(120,60,40,0.8)'); }
    else { ctx.strokeStyle = sp.trim || P.dark(col, 0.45); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(6.5, -116); ctx.quadraticCurveTo(13, -104, 10, -82); ctx.stroke(); ctx.fillStyle = sp.inner || '#ece4d0'; ctx.fillRect(3, -118, 5, 3.2); }
    if (sp.apron) { ctx.beginPath(); ctx.moveTo(4, -84); ctx.lineTo(12 * f, -84); ctx.lineTo(15 * f, -36); ctx.lineTo(4, -36); ctx.closePath(); fillStroke(ctx, sp.apron, 1.1); }
    if (sp.fur) [[-7, -114], [0, -116.5], [7, -114]].forEach(q => P.ellipse(ctx, q[0], q[1], 5.2, 4.4, sp.furCol || '#f8f4ec', sp.furEdge || 'rgba(120,104,90,0.6)', 0.8));
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
    headSide(ctx, sp, o); douli(ctx, sp, 1); if (sp.mask) { ctx.fillStyle = sp.mask; ctx.beginPath(); ctx.moveTo(-4, -130); ctx.lineTo(15.4, -130); ctx.lineTo(14, -117); ctx.quadraticCurveTo(6, -111, -4, -116); ctx.closePath(); ctx.fill(); }
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
    jingzhe: { name: '陆惊蛰', h: 150, kind: 'short', robe: '#4a6e96', trim: '#2b4263', inner: '#d9d3c4', pants: '#34343a', sash: '#1e1b1c', band: '#3f8cc0', ribbon: '#3f8cc0', wraps: '#74849c', hairCol: '#2a211d', towel: true, knife: true, brow: 0.8 },      // 照画像：靛蓝短褐、蓝发带、黑腰带、深灰裤、灰蓝绑腿
    agui: { name: '阿桂', h: 116, kind: 'short', robe: '#8a775d', trim: '#5d4e3a', pants: '#5c5348', hair: 'boy', blush: true },
    laochu: { name: '老褚', h: 152, fat: 1.2, kind: 'short', robe: '#84735f', trim: '#4f4233', pants: '#514a42', apron: '#ddd5c1', hair: 'cook', beard: 'stubble', brow: -0.6 },
    siniang: { name: '阮四娘', h: 142, kind: 'dress', female: true, hair: 'female', robe: '#8b3a3a', trim: '#d7a544', skirt: '#3f504c', inner: '#ead9c0', sash: '#d7a544', brow: 1 },
    fan: { name: '范醉翁', h: 148, kind: 'robe', robe: '#7a7362', trim: '#4b4638', hair: 'old', hairCol: '#d9d5cc', beard: 'white', wide: 1.5, band: '#5a5548', brow: -0.4 },
    laodao: { name: '老道', h: 150, kind: 'robe', robe: '#586a74', trim: '#23292d', hair: 'dao', hairCol: '#8f8b85', beard: 'grey', beardLong: true, wide: 1.6, pole: true },
    qier: { name: '小乞儿', h: 96, kind: 'short', robe: '#6d5d4a', trim: '#4a3f33', pants: '#57503f', hair: 'beggar', bare: true, blush: true },
    xiaolai: { name: '小癞', h: 122, kind: 'short', robe: '#665a4c', trim: '#40382f', pants: '#4c463c', hair: 'patchy', bare: true },
    child: { name: '孩子', h: 100, kind: 'robe', robe: '#b9b29c', trim: '#7d7868', hair: 'boy', blush: true, shoe: '#3a2f28' },
    xiali: { name: '夏离', h: 156, kind: 'robe', robe: '#a12a2c', trim: '#d7a544', inner: '#f0e7d2', sash: '#1d1a18', jade: true, hair: 'cap', skin: '#e2bf96', shoe: '#191513', pattern: '#e3b95a', hemTrim: '#d7a544', cuff: '#d7a544', wide: 1.2, brow: 1.2 },
    huoji: { name: '伙计', h: 160, fat: 1.08, kind: 'short', robe: '#3a3a3c', trim: '#1f1f21', pants: '#2c2c2e', skin: '#d9b28a', beard: 'stubble' },
    shikeA: { name: '食客甲', h: 150, kind: 'robe', robe: '#5d7a6b', trim: '#2f4238', wide: 1.3 },
    shikeB: { name: '食客乙', h: 150, fat: 1.12, kind: 'robe', robe: '#8a6a3c', trim: '#4f3b1f', beard: 'black', wide: 1.3 },
    hangcai: { name: '行菜', h: 148, kind: 'short', robe: '#5b6f62', trim: '#33413a', pants: '#3f4640', towel: true },
    qiushui: { name: '阑珊', h: 146, kind: 'dress', female: true, hair: 'gaoji', robe: '#e1e8e8', trim: '#9fb4c4', skirt: '#a9b9c8', inner: '#e6cfc8', sash: '#b8433a', skin: '#f7dfcb', shawl: true, pipaBack: true, brow: 0.5 },
    tingxue: { name: '耶律听雪', h: 136, kind: 'robe', female: true, hair: 'girl', hairCol: '#2a201b', robe: '#40372f', trim: '#8a7f72', inner: '#cfc3ae', front: '#b23a30', hemTrim: '#b9ad9c', cuff: '#b9ad9c', hemY: -40, hemW: 29, wide: 1.6, pants: '#3a3836', boots: '#4a3b2e', fur: true, furCol: '#5c5048', furEdge: 'rgba(220,210,196,0.75)', skin: '#f9e0d0', blush: true, sash: '#5a3a26', beads: '#8a5a34' },      // 照画像：辫发红绳、黑褐貂裘、红袄、一挂木珠、毛口皮靴
    naren: { name: '娜仁托娅', h: 156, kind: 'robe', female: true, hair: 'braids', hairCol: '#3a2a20', robe: '#a8352c', trim: '#c9a24a', hemTrim: '#f1ebe0', inner: '#f0e7d2', sash: '#3a2a1e', fur: true, skin: '#e2bf96', pattern: '#e3b95a', shoe: '#5a3a22', brow: 1.2 },
    he: { name: '贺元度', h: 154, kind: 'robe', robe: '#473c5a', trim: '#221c2e', inner: '#f2ecde', hair: 'gaojin', beard: 'black', wide: 1.7, sash: '#1a1522', jade: true, skin: '#f0dac2', shoe: '#191513' },
    xieke: { name: '蟹壳青', h: 174, fat: 1.3, kind: 'short', robe: '#3f5658', trim: '#1c2628', pants: '#2c3638', hair: 'bald', hairCol: '#c0906a', band: '#4f6b6c', skin: '#c99a72', beard: 'stubble', brow: 1.4, sash: '#2a211c' },
    zhong: { name: '钟推官', h: 152, kind: 'robe', robe: '#4d6b4a', trim: '#2c3f2b', hair: 'zhanjiao', beard: 'black', wide: 1.6, sash: '#17130f', shoe: '#17130f' },
    heiyi: { name: '黑衣人', h: 156, kind: 'short', robe: '#1e1e26', trim: '#0e0e12', pants: '#191920', hairCol: '#0e0e12', band: '#0e0e12', mask: '#15151b', sash: '#3a2a2a', skin: '#d6b08a' },
    chaiyi: { name: '差役', h: 158, kind: 'short', robe: '#3d4a5c', trim: '#1e2630', pants: '#2a323c', hair: 'futou', sash: '#8e2a20', beard: 'black' },
    huyuan: { name: '护院', h: 162, fat: 1.12, kind: 'short', robe: '#4a4038', trim: '#241e1a', pants: '#3a3430', beard: 'black', brow: 1.2, sash: '#8e2a20' },
    luoer: { name: '罗二', h: 152, kind: 'short', robe: '#6a6456', trim: '#3a362e', pants: '#4a463c', beard: 'stubble', band: '#5a5548', skin: '#d9b28a' },
    zhanggui: { name: '仁寿堂掌柜', h: 146, kind: 'robe', robe: '#5f6658', trim: '#33382f', hair: 'old', hairCol: '#cfcbc2', beard: 'grey', wide: 1.5, band: '#3d4238', brow: -0.3 },
    /* —— 第一章 —— */
    laolai: { name: '老癞', h: 150, kind: 'robe', robe: '#7a4f3a', trim: '#3d2418', inner: '#e9dcc0', hair: 'patchy', sash: '#c9a24a', wide: 1.3, beard: 'stubble', skin: '#d9b28a', shoe: '#2a211c', pattern: '#c9a25a', brow: 0.4 },
    cuimama: { name: '崔妈妈', h: 140, fat: 1.16, kind: 'dress', female: true, hair: 'female', robe: '#6e4a36', trim: '#c9a24a', skirt: '#4a3a44', inner: '#e6d6c0', sash: '#c9a24a', brow: 0.6 },
    luwenyuan: { name: '陆文渊', h: 154, kind: 'robe', robe: '#6f7f86', trim: '#39454a', inner: '#f0e9d8', hair: 'gaojin', beard: 'black', wide: 1.6, sash: '#2a2320' },
    lumu: { name: '母亲', h: 142, kind: 'dress', female: true, hair: 'female', robe: '#8a94a0', trim: '#e2d9c2', skirt: '#59606c', inner: '#eee6d4', sash: '#b9b2a0' },
    bushu: { name: '部署', h: 150, kind: 'robe', robe: '#4a5f58', trim: '#26332f', hair: 'futou', beard: 'grey', wide: 1.3, sash: '#8e2a20' },
    zhuangdaoshan: { name: '撞倒山', h: 178, fat: 1.55, kind: 'short', robe: '#c99a72', trim: '#b08058', inner: '#c99a72', pants: '#3a3430', hair: 'bald', hairCol: '#c0906a', skin: '#c99a72', sash: '#8e2a20', band: '#8e2a20', beard: 'stubble', brow: 1.3, bare: true, topless: true },
    chuanniang: { name: '船娘', h: 144, kind: 'dress', female: true, hair: 'female', robe: '#5f7a86', trim: '#2f4048', skirt: '#3f4c58', inner: '#e6dcc8', sash: '#8e2a20', skin: '#e2c19a' },
    maihua: { name: '卖花女', h: 140, kind: 'dress', female: true, hair: 'female', robe: '#9fb08c', trim: '#e6d7b4', skirt: '#5d6a52', inner: '#efe6d2', sash: '#b8433a', blush: true },
    meihuachi: { name: '梅花翅', h: 140, kind: 'dress', female: true, hair: 'female', robe: '#9fb08c', trim: '#e6d7b4', skirt: '#5d6a52', inner: '#efe6d2', sash: '#b8433a', blush: true },
    xiaohuan: { name: '小丫头', h: 120, kind: 'dress', female: true, hair: 'twinbun', robe: '#b9a2aa', trim: '#e6d7b4', skirt: '#6a5a66', inner: '#efe6d2', blush: true },
    shuli: { name: '书吏', h: 148, kind: 'robe', robe: '#6a6f66', trim: '#33382f', hair: 'futou', beard: 'grey', wide: 1.3, sash: '#2a2320' },
    shaogong: { name: '艄公', h: 150, kind: 'short', robe: '#746e5a', trim: '#423e31', pants: '#4c483d', hair: 'old', hairCol: '#b9b4a8', beard: 'grey', hat: 'douli', skin: '#c99a72', bare: true, sash: '#3a3228' },
    shuifei: { name: '水匪', h: 158, kind: 'short', robe: '#2f3f42', trim: '#161f21', pants: '#232d2f', hairCol: '#15181a', band: '#1c2527', mask: '#2a3537', sash: '#4a3a2a', skin: '#c99a72', bare: true },
    jiaofu: { name: '脚夫', h: 160, fat: 1.1, kind: 'short', robe: '#7d6c55', trim: '#4a3e30', pants: '#4f473c', beard: 'stubble', skin: '#c99a72', bare: true, band: '#5a5044' },
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
