/* 主角的画像（art/ 目录里的图，是这个游戏的主人自己画的）。
   对白头像、战斗里的小头像、菜单人物页、图鉴，五位主角都用它；图没取到，就退回原来程序画的头像，不会空着。
   每人四张：_face 头像（对白用，开场前先取好）、_half 半身、_full 全身、_sheet 三视图（后三张只在图鉴里看，点开才取）。
   画像没有分表情：剧本里写的 [笑][怒] 对这五位不再换脸。 */
'use strict';
(function () {
  const JX = window.JX, Art = JX.Art;
  const LEADS = ['jingzhe', 'xiali', 'naren', 'qiushui', 'tingxue'];
  const imgs = {}, cache = {};
  const url = name => 'art/' + name + '.jpg?v=' + (window.JX_V || '');
  function load(src, n) {                                           // 取不到就隔一会儿再试，最多三回
    n = n || 0;
    return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => { if (n >= 2) res(null); else setTimeout(() => load(src, n + 1).then(res), 500 * (n + 1)); }; im.src = src + (n ? '&retry=' + n : ''); });
  }
  Art.leads = LEADS;
  Art.pic = (id, kind) => url(id + '_' + kind);
  Art.painted = id => !!imgs[id];
  /* 开场前把五张头像取好；最多等四秒，等不到就先开场（用程序画的顶着，取到了再换） */
  Art.preload = function () {
    const all = Promise.all(LEADS.map(id => load(url(id + '_face')).then(im => { if (im) imgs[id] = im; })));
    return Promise.race([all, new Promise(res => setTimeout(res, 4000))]);
  };
  const drawn = Art.avatar;
  /* 头像：760×872 的一块，圆角画框——深褐的边，里头一道金线 */
  Art.avatar = function (id, mood) {
    const im = imgs[id]; if (!im) return drawn(id, mood);
    if (cache[id]) return cache[id];
    const W = 760, H = 872, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'), box = (m, r) => { c.beginPath(); c.roundRect(m, m, W - m * 2, H - m * 2, r); };
    c.save(); box(16, 36); c.clip(); c.drawImage(im, 16, 16, W - 32, H - 32); c.restore();
    c.lineWidth = 13; c.strokeStyle = '#3d2a1c'; box(16, 36); c.stroke();
    c.lineWidth = 3; c.strokeStyle = 'rgba(215,165,68,0.92)'; box(28, 27); c.stroke();
    return (cache[id] = cv);
  };
})();
