/* 声音：音乐是离线整首合成好的音频（包在脚本文件里，双击打开网页也能装载），不做即时合成。 */
'use strict';
(function () {
  const JX = window.JX;
  window.JX_MUSIC = window.JX_MUSIC || {}; window.JX_SFX = window.JX_SFX || {};
  const A = JX.audio = { ctx: null, cur: null, want: null, bufs: {}, sbufs: {} };
  let musicGain, sfxGain, filter;
  function ensure() {
    if (A.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    try { A.ctx = new AC(); } catch (e) { return false; }
    filter = A.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 20000; filter.Q.value = 0.4;
    musicGain = A.ctx.createGain(); sfxGain = A.ctx.createGain();
    filter.connect(musicGain); musicGain.connect(A.ctx.destination); sfxGain.connect(A.ctx.destination);
    A.applyVolume(); return true;
  }
  A.applyVolume = function () { if (!A.ctx) return; musicGain.gain.value = JX.settings.music * 0.9; sfxGain.gain.value = JX.settings.sfx; };
  function b64buf(b64) { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function loadScript(src, n) {                                  // 取不到（服务器偶尔回 503）就隔一会儿再试，最多三回
    n = n || 0;
    return new Promise(res => { const s = document.createElement('script'); s.src = src + (n ? '?retry=' + n : ''); s.onload = () => res(true); s.onerror = () => { s.remove(); if (n >= 2) res(false); else setTimeout(() => loadScript(src, n + 1).then(res), 600 * (n + 1)); }; document.head.appendChild(s); });
  }
  async function getMusic(id) {
    if (A.bufs[id]) return A.bufs[id];
    if (!window.JX_MUSIC[id]) await loadScript('music/' + id + '.js');
    const m = window.JX_MUSIC[id]; if (!m) return null;
    try { const buf = await A.ctx.decodeAudioData(b64buf(m.b64)); A.bufs[id] = { buf, loop: m.loop }; m.b64 = null; return A.bufs[id]; } catch (e) { return null; }
  }
  /* 换曲：旧的淡出，新的淡入。muffle 是低通的截止频率（隔着楼板听）。 */
  A.music = async function (id, muffle) {
    A.want = { id, muffle };
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    filter.frequency.cancelScheduledValues(t); filter.frequency.setTargetAtTime(muffle || 20000, t, 0.25);
    if (A.cur && A.cur.id === id) return;
    if (A.cur) { const old = A.cur; old.g.gain.setTargetAtTime(0, t, 0.35); setTimeout(() => { try { old.src.stop(); } catch (e) { /* 已停 */ } }, 1800); A.cur = null; }
    if (!id) return;
    const m = await getMusic(id); if (!m || !A.want || A.want.id !== id) return;
    const src = A.ctx.createBufferSource(), g = A.ctx.createGain(); src.buffer = m.buf; src.loop = true;
    if (m.loop) { src.loopStart = m.loop[0]; src.loopEnd = m.loop[1]; }
    g.gain.value = 0; g.gain.setTargetAtTime(1, A.ctx.currentTime, 0.5); src.connect(g); g.connect(filter); src.start();
    A.cur = { id, src, g };
  };
  A.sfx = function (id, vol) {
    if (!A.ctx || !JX.settings.sfx) return;
    const b = A.sbufs[id]; if (!b) return;
    const src = A.ctx.createBufferSource(), g = A.ctx.createGain(); src.buffer = b; g.gain.value = vol == null ? 1 : vol; src.connect(g); g.connect(sfxGain); src.start();
  };
  /* 浏览器要等用户按过键、点过鼠标才许出声 */
  JX.on('userGesture', async () => {
    if (A.started) { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); return; }
    A.started = true; if (!ensure()) return;
    if (A.ctx.state === 'suspended') { try { await A.ctx.resume(); } catch (e) { /* 无妨 */ } }
    if (!Object.keys(window.JX_SFX).length) await loadScript('music/sfx.js');
    for (const k of Object.keys(window.JX_SFX)) { try { A.sbufs[k] = await A.ctx.decodeAudioData(b64buf(window.JX_SFX[k])); } catch (e) { /* 跳过 */ } }
    if (A.want) { const w = A.want; A.want = null; A.music(w.id, w.muffle); }
  });
  JX.on('sceneEnter', sc => { if (sc.music && !A.hold) A.music(sc.music, sc.muffle); });
})();
