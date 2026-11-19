/* 夏离换回女装以后的头像（第三章起）。
   她这时还瞒着来历，穿的是汉家女子的衣裳：石榴红窄袖褙子、月白里衣，偏髻上系一根红绳，一支素银簪，不戴别的首饰。
   这一张是程序画的，先顶着——主人画好“夏离·女装”的头像以后，放进 art/xiali2_face.jpg，在 artpack.js 的名单里添上 xiali2 就换过去了。
   用法：JX.state.flags.nv 立着的时候，凡是要“夏离”头像的地方（对白、战斗、菜单）都拿到这一张。排在 artpack.js 后面载入。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, Art = JX.Art, CH = Art.chars, T = Art.tools;
  const { shape, stroke, lg, hairFill, strands, folds, bead, bust, P2, INK, HAIR } = T;
  CH.xiali2 = {
    name: '夏离', title: '换回了女装 · 还是不肯说来历', season: '夏', line: '看什么？',
    f: Object.assign({}, CH.naren.f, { rest: 'normal', earring: null, turn: 0.2 }),
    hairBack(c) {
      hairFill(c, 'M -54 -18 C -64 -114, 64 -114, 54 -18 C 57 8, 52 34, 40 50 C 24 8, -24 8, -40 50 C -52 34, -57 8, -54 -18 Z');
      hairFill(c, 'M 6 -96 C -4 -134, 36 -150, 58 -128 C 76 -108, 66 -82, 44 -80 C 28 -78, 12 -82, 6 -96 Z');                     // 偏在一边的髻
      strands(c, ['M 14 -100 C 12 -124, 36 -136, 54 -122', 'M 24 -94 C 28 -112, 44 -118, 58 -108', 'M 34 -88 C 42 -98, 54 -100, 60 -94'], 'rgba(130,112,104,0.4)', 1.1);
      stroke(c, 'M 8 -92 C 22 -84, 42 -82, 58 -90', '#b8362a', 4.2); stroke(c, 'M 56 -90 C 66 -76, 68 -60, 64 -44', '#b8362a', 3); stroke(c, 'M 58 -88 C 72 -80, 78 -66, 78 -52', '#b8362a', 2.4);      // 红绳
      stroke(c, 'M -14 -118 L 66 -104', '#d9dde0', 2.6); stroke(c, 'M -14 -118 L 66 -104', 'rgba(60,60,70,0.5)', 0.8); bead(c, -16, -118, 3.6, '#eef2f4');                                    // 一支素银簪
      strands(c, ['M -46 20 C -50 34, -48 44, -44 50', 'M 46 20 C 50 34, 48 44, 44 50']);
    },
    hairFront(c) {
      hairFill(c, 'M -51 -18 C -58 -106, 58 -106, 51 -18 C 49 -36, 40 -50, 22 -56 C 12 -59, 4 -56, 0 -49 C -4 -56, -12 -59, -22 -56 C -40 -50, -49 -36, -51 -18 Z');
      hairFill(c, 'M -51 -22 C -57 -2, -55 20, -48 32 C -47 14, -46 -6, -44 -28 Z'); hairFill(c, 'M 50 -22 C 55 -2, 53 20, 46 32 C 45 14, 44 -6, 43 -28 Z');
      strands(c, ['M 0 -50 C 0 -64, 0 -76, 0 -88', 'M -30 -70 C -40 -56, -46 -40, -49 -24', 'M 30 -70 C 40 -56, 46 -40, 49 -24', 'M -16 -80 C -30 -66, -40 -50, -45 -34', 'M 16 -80 C 30 -66, 40 -50, 45 -34']);
      c.strokeStyle = HAIR; c.lineCap = 'round'; c.lineWidth = 2.6; c.stroke(P2('M -48 26 C -52 50, -50 72, -46 92'));
    },
    bust(c) {
      bust(c, { w: 112, col: '#a8352c' });
      shape(c, 'M -20 96 L -26 420 L 26 420 L 20 96 C 8 104, -8 104, -20 96 Z', '#f4eee2');                                       // 月白里衣
      stroke(c, 'M -18 112 C -8 132, 8 132, 18 112', 'rgba(150,140,120,0.5)', 1.2);
      [-1, 1].forEach(s => { shape(c, `M ${s * 24} 98 L ${s * 12} 100 L ${s * 24} 420 L ${s * 44} 420 Z`, '#e3c98a', P.rgba(INK, 0.8), 1.5); stroke(c, `M ${s * 19} 104 L ${s * 34} 420`, 'rgba(255,255,255,0.45)', 1.2); });      // 褙子的领缘
      folds(c, ['M -86 150 C -78 200, -76 250, -80 320', 'M 84 150 C 76 200, 74 250, 78 320'], 0.2);
      c.save(); c.globalAlpha = 0.3; c.fillStyle = '#e3b95a'; for (let y = 170; y < 420; y += 54) [-70, 70].forEach((x, k) => { c.beginPath(); c.arc(x + ((y / 54) % 2) * 8 * (k ? -1 : 1), y, 6, 0, 6.3); c.fill(); }); c.restore();   // 衣料上几点暗花
    },
  };
  const prev = Art.avatar;
  Art.avatar = function (id, mood) {
    const st = JX.state;
    if (id === 'xiali' && st && st.flags && st.flags.nv) id = 'xiali2';
    return prev(id, mood);
  };
})();
