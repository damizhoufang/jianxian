/* 启动：标题画面 → 新的故事或接着上回 → 跑剧本。入口是 JX.boot，由 index.html 里的载入器在全部脚本到齐后调用 */
'use strict';
(function () {
  const JX = window.JX, W = JX.world, UI = JX.ui;
  JX.game = { playing: false };
  JX.fullScript = () => ['prologue', 'chapter1'].map(k => window.JX_SCRIPTS[k] || '').join('\n');      // 各章剧本接成一本，一口气往下演；场名全书不重复
  JX.boot = async () => {                                          // 载入器把脚本都执行完以后来叫
    JX.initStage(); UI.init(); JX.bindPointer(); JX.start(); JX.booted = true;
    const hash = (location.hash || '').slice(1);
    if (hash.indexOf('auto') === 0) { JX.auto = true; JX.autoDelay = hash === 'autoslow' ? 0.5 : 0.03; JX.fast = hash === 'autoslow' ? 2.2 : 5; JX.autoLoad = hash === 'autoload'; }
    if (hash.indexOf('gallery') === 0) UI.openGalleryAt = parseInt(hash.split('-')[1], 10) || 0;      // 直接打开图鉴
    const dev = ['cellar', 'kitchen', 'hall', 'street', 'snow', 'floor2', 'tingchao', 'alley', 'roof', 'yamen', 'yaopu', 'beiwa', 'ruanhong', 'shufang'].find(s => hash === s || hash === s + '-god');
    if (dev) {                                                    // 开发时直接落到某个场景里走走
      UI.quiet = false; JX.state.stage = dev === 'street' ? 3 : dev === 'hall' ? 2 : dev === 'beiwa' ? 14 : dev === 'ruanhong' ? 15 : dev === 'shufang' ? 16 : 1; JX.state.flags = { aguiUp: true, jar: true, jarDone: true, s1done: true, daoGone: false };
      W.setPlayer(dev === 'snow' || dev === 'shufang' ? 'child' : 'jingzhe', dev === 'snow' ? { carry: 'bundle' } : null); W.load(dev, 'start'); if (dev === 'snow' || dev === 'shufang') UI.tone('sepia');
      W.locked = false; JX.game.playing = true; UI.roam(true); if (hash.endsWith('-god')) W.godOn = true; UI.fade(0, 0.4); return;
    }
    /* 标题画面的背景：灯市，镜头慢慢横移 */
    UI.quiet = true; JX.state.stage = 0; W.load('street', 'title'); W.locked = true;
    /* 菜单里跳场过来的：不过标题画面，黑着直接从那一场开头接上 */
    let jump = false; try { jump = sessionStorage.getItem('jx.jump') === '1'; sessionStorage.removeItem('jx.jump'); } catch (e) { /* 取不到就照常走标题 */ }
    const js = jump && JX.store.get('save');
    if (js) { UI.quiet = false; JX.state.money = js.money || 0; JX.state.maxed = !!js.maxed; JX.state.flags = js.flags || {}; JX.story.run(JX.fullScript(), js.label); return; }
    const pan = { x: 1440, y: 700 }; W.focus = pan;
    const drift = () => { pan.x = 1440 + Math.sin(JX.time * 0.07) * 520; }; JX.on('update', drift);
    JX.audio.music('zhuti'); JX.audio.hold = true;
    UI.fade(0.12, 1.6);
    const act = await UI.title();
    await UI.fade(1, 0.8);
    W.focus = null; UI.quiet = false; JX.audio.hold = false;
    let label = null;
    if (act === 'load') { const s = JX.store.get('save'); if (s) { label = s.label; JX.state.money = s.money || 0; JX.state.maxed = !!s.maxed; JX.state.flags = s.flags || {}; } }
    JX.story.run(JX.fullScript(), label);
  };
})();
