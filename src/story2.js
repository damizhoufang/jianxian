'use strict';
(function () {
  const JX = window.JX, W = JX.world;
  const pop0 = JX.populate;
  JX.populate = function (id) { pop0(id); if (id === 'chuan' || id === 'chuanye' || id === 'chuanyu' || id === 'jiang') { W.add('shaogong', 'shaogong', 336, 716, { dir: 1, tag: '艄公' }); W.add('weng', { h: 150 }, 1262, 714, { draw(g, e) { JX.P.jar(g, 0, 0, 1.75, { seed: 9, sealed: !e.open, text: '春' }); } }); } };
})();
