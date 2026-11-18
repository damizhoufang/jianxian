/* 给已有的场景换地面、添景物。各场景原来的画法不动：这里只在它铺完地的那一刻插进去——
   floor(c, x, y, w, h, o, orig) 顶替原来那一次铺地（回 true 表示顶替了；orig 是原来的铺法，想留一块原样就调它），
   after(c, x, y, w, h) 在铺完地之后、画墙和家具之前再画（地毯、席子、草、土），所以墙根的影子和纸纹照样盖在上面；
   props 是添的立着的东西（盆景、树、假山），和场景自己的道具一样参加前后遮挡，带 block 的会挡路。
   放在所有 scenes*.js 之后载入。新做的场景直接在自己的 paint 里用 ground.js 的画法，不必走这里。 */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, S = JX.scenes;
  const pot = (x, y, s, kind, o) => ({ x, y, bw: 96 * s, bh: (100 + ((o && o.stand) || 0)) * s, block: [-18 * s, -12, 36 * s, 16], draw(g) { P.potted(g, 0, 0, s, kind, o); } });
  const tree = (x, y, s, kind, o) => ({ x, y, bw: 330 * s, bh: 350 * s, block: [-14, -10, 28, 14], draw(g) { P.tree(g, 0, 0, s, kind, o); } });
  const rockery = (x, y, s, o) => ({ x, y, bw: 190 * s, bh: 196 * s, block: [-64 * s, -22, 128 * s, 26], draw(g) { P.rockery(g, 0, 0, s, o); } });
  const bush = (x, y, s, o) => ({ x, y, bw: 90 * s, bh: 60 * s, block: [-30 * s, -12, 60 * s, 16], draw(g) { P.bush(g, 0, 0, s, o); } });
  const clipRect = (c, x, y, w, h, fn) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); fn(); c.restore(); };
  const kerb = (c, x, y, w) => { c.fillStyle = 'rgba(30,24,18,0.3)'; c.fillRect(x, y + 5, w, 4); c.fillStyle = '#9a9488'; c.fillRect(x, y, w, 7); c.strokeStyle = 'rgba(30,24,18,0.6)'; c.lineWidth = 1; c.strokeRect(x, y, w, 7); for (let px = x + 70; px < x + w; px += 110) P.line(c, px, y, px, y + 7, 1, 'rgba(0,0,0,0.3)'); };

  const TABLES = [[560, 700], [960, 700], [1360, 700], [1760, 700], [2160, 700], [560, 970], [960, 970], [1360, 970], [1760, 970], [2160, 970], [560, 1240], [960, 1240], [1900, 1240], [2300, 1240]];

  const DECOR = {
    /* 酒窖：夯土地，潮 */
    cellar: { floor(c, x, y, w, h) { P.earth(c, x, y, w, h, { seed: 5, base: '#8f7f66', wet: true }); return true; } },
    /* 后厨：方砖地 */
    kitchen: { floor(c, x, y, w, h) { P.tiles(c, x, y, w, h, { seed: 15, col: '#9a8c7a', s: 66, bond: true }); return true; } },
    /* 大堂：每桌底下一领席，门里一张红毡，楼梯口一张蓝毡；门边两盆梅，墙边几盆松兰 */
    hall: {
      after(c) {
        TABLES.forEach((t, i) => P.mat(c, t[0] - 140, t[1] - 178, 280, 236, i % 2 ? { col: '#c6b27c', edge: '#5a3a2a' } : { col: '#cfbb86', edge: '#3d4a56' }));
        P.rug(c, 1240, 1104, 400, 348, { seed: 21, style: 'lattice', col: '#7c2b26', border: '#22303e', accent: '#d7a544', d: 50 });
        P.rug(c, 2420, 566, 350, 96, { seed: 22, style: 'plain', col: '#2f4a5e', border: '#6a2a24', accent: '#e3c57a' });
      },
      props: [pot(1196, 1456, 1.5, 'plum', { seed: 3 }), pot(1684, 1456, 1.5, 'plum', { seed: 4 }), pot(116, 860, 1.4, 'pine', { stand: 46, seed: 5 }), pot(116, 1180, 1.4, 'orchid', { stand: 46, seed: 6 }), pot(2764, 800, 1.4, 'orchid', { stand: 46, seed: 7 }), pot(2764, 1140, 1.4, 'pine', { stand: 46, seed: 8 })],
    },
    /* 二楼回廊：阁儿门前一条长毡，各桌底下的席 */
    floor2: {
      after(c) {
        P.rug(c, 320, 392, 1760, 62, { seed: 31, style: 'lattice', col: '#2f4a5e', border: '#6a2a24', accent: '#e3c57a', bw: 11, d: 30 });
        [[700, 700], [820, 1010], [1580, 1010]].forEach((t, i) => P.mat(c, t[0] - 140, t[1] - 178, 280, 236, i % 2 ? { col: '#c6b27c', edge: '#5a3a2a' } : {}));
      },
      props: [pot(126, 1130, 1.4, 'pine', { stand: 46, seed: 11 }), pot(2276, 1130, 1.4, 'plum', { stand: 46, seed: 12 })],
    },
    /* 听潮阁：席底下垫一张旧蓝毡（席是半透的，花纹透上来）；两头的花几 */
    tingchao: {
      after(c) { P.rug(c, 560, 560, 800, 400, { seed: 41, col: '#2f506a', border: '#1e2a36', accent: '#f0d48a', fringe: false }); },
      props: [pot(214, 760, 1.5, 'pine', { stand: 52, seed: 13 }), pot(1706, 800, 1.5, 'orchid', { stand: 52, seed: 14 })],
    },
    /* 仁寿堂：方砖地，柜台前一领席 */
    yaopu: { floor(c, x, y, w, h) { P.tiles(c, x, y, w, h, { seed: 121, col: '#8f8a80', s: 60 }); return true; }, after(c) { P.mat(c, 640, 744, 640, 110, { col: '#c9b47e' }); }, props: [pot(1740, 1012, 1.4, 'chrys', { stand: 30, seed: 15 })] },
    /* 软红院：圆桌底下一张胭脂色的毡，窗下一张小的；窗边一盆梅，屏风旁一盆兰 */
    ruanhong: {
      after(c) { P.rug(c, 870, 690, 380, 168, { seed: 51, col: '#8a3f52', border: '#2e2a3a', accent: '#ecd9a8' }); P.rug(c, 1420, 664, 330, 96, { seed: 52, style: 'lattice', col: '#5d7f8a', border: '#2a3a44', accent: '#f0e6c4', d: 34 }); },
      props: [pot(1966, 652, 1.5, 'plum', { stand: 40, seed: 16 }), pot(300, 652, 1.4, 'orchid', { stand: 40, seed: 17 })],
    },
    /* 陆家书房：书案底下一张素毡，墙角一盆文竹 */
    shufang: { after(c) { P.rug(c, 660, 606, 600, 210, { seed: 61, style: 'plain', col: '#66757a', border: '#2a3238', accent: '#d2c8a6' }); }, props: [pot(1640, 652, 1.5, 'bamboo', { stand: 40, seed: 18 }), pot(250, 656, 1.4, 'orchid', { stand: 40, seed: 19 })] },
    /* 架阁库：方砖地 */
    jiage: { floor(c, x, y, w, h) { P.tiles(c, x, y, w, h, { seed: 181, col: '#82848a', s: 62 }); return true; } },
    /* 公堂：斜铺的大方砖，堂下一张红毡 */
    gongtang: { floor(c, x, y, w, h) { P.tiles(c, x, y, w, h, { seed: 211, col: '#8d8a84', s: 86, diag: true }); return true; }, after(c) { P.rug(c, 770, 706, 380, 180, { seed: 71, style: 'plain', col: '#7a2a24', border: '#2a2420', accent: '#c9a45a' }); } },
    /* 画舫：舱门口一张红毡 */
    huafang: { after(c) { P.rug(c, 250, 694, 440, 150, { seed: 81, col: '#8e2f28', border: '#22303e', accent: '#e3c57a' }); } },
    /* 御街：楼前廊下是方砖，街心是石板，街那一边是卵石；两头各一株柳 */
    street: {
      after(c, x, y, w, h) {
        P.tiles(c, x, y, w, 96, { seed: 91, col: '#7d7468', s: 48, bond: true }); kerb(c, x, y + 94, w);
        P.cobbles(c, x, y + h - 170, w, 170, { seed: 92, col: '#6f6a66', s: 32, moss: true }); kerb(c, x, y + h - 176, w);
      },
      props: [tree(250, 1236, 0.72, 'willow', { seed: 21 }), tree(2700, 1236, 0.72, 'willow', { seed: 22 })],
    },
    /* 府衙门外：门前一方石板月台，两边是土路，墙根和河沿长着草 */
    yamen: {
      floor(c, x, y, w, h, o, orig) {
        P.earth(c, x, y, w, h, { seed: 111, ruts: [y + 196] });
        clipRect(c, 700, y, 1040, 232, () => orig(c, x, y, w, h, o)); kerb(c, 700, y + 228, 1040); c.fillStyle = 'rgba(30,24,18,0.25)'; c.fillRect(696, y, 4, 232); c.fillRect(1740, y, 4, 232);
        return true;
      },
      after(c, x, y, w, h) {
        clipRect(c, x, y, 690, 40, () => P.grass(c, x, y, 690, 40, { seed: 112, dry: true })); clipRect(c, 1750, y, w, 40, () => P.grass(c, 1750, y, w - 1750, 40, { seed: 113, dry: true }));
        P.patch(c, 330, y + h - 6, 420, 46, 114, (px, py, pw, ph) => P.grass(c, px, py, pw, ph, { seed: 115, dry: true }), false);
        P.patch(c, 1300, y + h - 2, 520, 40, 116, (px, py, pw, ph) => P.grass(c, px, py, pw, ph, { seed: 117, dry: true }), false);
        P.patch(c, 2150, y + h - 8, 330, 48, 118, (px, py, pw, ph) => P.grass(c, px, py, pw, ph, { seed: 119, dry: true, flowers: true }), false);
        [[180, y + 30], [470, y + 26], [1900, y + 28], [2200, y + 30]].forEach((q, i) => P.bush(c, q[0], q[1], 0.8, { seed: 120 + i }));
      },
    },
    /* 后巷：卵石地，墙根一溜青苔和枯草 */
    alley: {
      floor(c, x, y, w, h) { P.cobbles(c, x, y, w, h, { seed: 81, col: '#77746e', s: 36, moss: true }); return true; },
      after(c, x, y, w) { clipRect(c, x, y, w, 22, () => P.grass(c, x, y, w, 22, { seed: 82, dry: true })); },
    },
    /* 北瓦：瓦子里是踩实的土地，棚前各铺一片石板，场边长着草 */
    beiwa: {
      floor(c, x, y, w, h, o, orig) {
        P.earth(c, x, y, w, h, { seed: 141, ruts: [y + 250] });
        [[260, 900], [1500, 420], [2000, 620]].forEach(q => { clipRect(c, q[0], y, q[1], 96, () => orig(c, x, y, w, h, o)); kerb(c, q[0], y + 92, q[1]); });
        return true;
      },
      after(c, x, y, w, h) {
        [[230, 380, 60, 142], [1180, 460, 50, 144], [2040, 420, 56, 146], [2660, 260, 60, 148]].forEach(q => P.patch(c, q[0], y + h - 30, q[1], q[2], q[3], (px, py, pw, ph) => P.grass(c, px, py, pw, ph, { seed: q[3] + 1, dry: true, flowers: q[3] % 4 === 0 }), false));
        [[90, y + h - 40], [700, y + h - 26], [1650, y + h - 30], [2400, y + h - 22]].forEach((q, i) => P.bush(c, q[0], q[1], 0.9, { seed: 150 + i }));
        P.rock(c, 1560, y + h - 60, 0.9, { seed: 155 }); P.rock(c, 420, y + h - 44, 0.7, { seed: 156 });
      },
    },
    /* 北关码头：临河一条石板，往里是土场院，角上长着草，水边几丛芦苇 */
    matou: {
      floor(c, x, y, w, h, o, orig) { P.earth(c, x, y, w, h, { seed: 212, ruts: [y + 230] }); clipRect(c, x, y, w, 120, () => orig(c, x, y, w, h, o)); kerb(c, x, y + 116, w); return true; },
      after(c, x, y, w, h) {
        [[150, 300, 64, 214], [2260, 300, 70, 216], [1500, 260, 44, 218]].forEach(q => P.patch(c, q[0], y + h - 24, q[1], q[2], q[3], (px, py, pw, ph) => P.grass(c, px, py, pw, ph, { seed: q[3] + 1, dry: true }), false));
        P.rock(c, 60, y + h - 110, 0.9, { seed: 220 }); P.bush(c, 2330, y + h - 96, 0.9, { seed: 221 });
      },
    },
  };

  /* —— 插进铺地的那一刻 —— */
  let cur = null, done = false;
  ['planks', 'flagstones'].forEach(fn => {
    const orig = P[fn];
    P[fn] = function (ctx, x, y, w, h, o) {
      const d = cur;
      if (!d || done) return orig(ctx, x, y, w, h, o);
      done = true;
      if (!(d.floor && d.floor(ctx, x, y, w, h, o, orig))) orig(ctx, x, y, w, h, o);
      if (d.after) d.after(ctx, x, y, w, h);
    };
  });
  Object.keys(DECOR).forEach(id => {
    const sc = S[id], d = DECOR[id]; if (!sc) return;
    const paint = sc.paint;
    sc.paint = function (c, s) { cur = d; done = false; try { paint.call(this, c, s); } finally { cur = null; } };
    if (d.props) sc.props = (sc.props || []).concat(d.props);
  });
  JX.decor = DECOR;
})();
