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
  /* 曲子的文件一首一兆多，头一回用到才取。fetchMusic 只取文件、不解码，可以提前叫（A.prefetch）；
     解码好的一首要占十几兆内存，只留最近用过的 KEEP 首，别的扔掉，再用到时从留着的文件重新解码（0.14.1 以前是全留着，一口气玩完三章要占三四百兆）。 */
  const loading = {}, KEEP = 6;
  function fetchMusic(id) {
    if (window.JX_MUSIC[id]) return Promise.resolve(true);
    return loading[id] || (loading[id] = loadScript('music/' + id + '.js').then(ok => { delete loading[id]; return ok; }));
  }
  function touch(id) {
    A.order = (A.order || []).filter(x => x !== id); A.order.push(id);
    for (let i = 0; A.order.length > KEEP && i < A.order.length;) { const old = A.order[i]; if ((A.cur && A.cur.id === old) || (A.want && A.want.id === old)) { i++; continue; } A.order.splice(i, 1); delete A.bufs[old]; }
  }
  async function getMusic(id) {
    if (A.bufs[id]) { touch(id); return A.bufs[id]; }
    await fetchMusic(id);
    const m = window.JX_MUSIC[id]; if (!m || !m.b64) return null;
    try { const buf = await A.ctx.decodeAudioData(b64buf(m.b64)); A.bufs[id] = { buf, loop: m.loop }; touch(id); return A.bufs[id]; } catch (e) { return null; }
  }
  A.prefetch = function (ids) { (ids || []).forEach(id => { if (id && id !== '还' && window.JX_MUSIC && !window.JX_MUSIC[id]) fetchMusic(id); }); };      // 快要用到的曲子先把文件取下来，换场景时就不用干等
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
  A.sfx = function (id, vol, rate) {                              // rate：放快放慢一点（脚步声每一步略有不同）
    if (!A.ctx || !JX.settings.sfx) return;
    const b = A.sbufs[id]; if (!b) return;
    const src = A.ctx.createBufferSource(), g = A.ctx.createGain(); src.buffer = b; if (rate) src.playbackRate.value = rate; g.gain.value = vol == null ? 1 : vol; src.connect(g); g.connect(sfxGain); src.start();
  };
  /* 环境声：循环着放的一段（雨声）。换场景就停；id 给空也是停 */
  A.amb = function (id, vol) {
    A.ambWant = id ? { id, vol } : null;
    if (A.ambCur && A.ambCur.id === id) return;
    if (A.ambCur) { const o = A.ambCur; A.ambCur = null; o.g.gain.setTargetAtTime(0, A.ctx.currentTime, 0.4); setTimeout(() => { try { o.src.stop(); } catch (e) { /* 已停 */ } }, 1600); }
    if (!id || !A.ctx || !JX.settings.sfx) return;
    const b = A.sbufs[id]; if (!b) return;
    const src = A.ctx.createBufferSource(), g = A.ctx.createGain(); src.buffer = b; src.loop = true; src.loopStart = 0.05; src.loopEnd = Math.max(0.1, b.duration - 0.05);
    g.gain.value = 0; g.gain.setTargetAtTime(vol == null ? 0.5 : vol, A.ctx.currentTime, 0.8); src.connect(g); g.connect(sfxGain); src.start();
    A.ambCur = { id, src, g };
  };
  /* 浏览器要等用户按过键、点过鼠标才许出声 */
  JX.on('userGesture', async () => {
    if (A.started) { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); return; }
    A.started = true; if (!ensure()) return;
    if (A.ctx.state === 'suspended') { try { await A.ctx.resume(); } catch (e) { /* 无妨 */ } }
    if (!Object.keys(window.JX_SFX).length) await loadScript('music/sfx.js');
    for (const k of Object.keys(window.JX_SFX)) { try { A.sbufs[k] = await A.ctx.decodeAudioData(b64buf(window.JX_SFX[k])); } catch (e) { /* 跳过 */ } }
    if (A.want) { const w = A.want; A.want = null; A.music(w.id, w.muffle); }
    if (A.ambWant) { const w = A.ambWant; A.amb(w.id, w.vol); }
  });
  JX.on('sceneEnter', sc => { if (sc.music && !A.hold) A.music(sc.music, sc.muffle); const am = typeof sc.amb === 'function' ? sc.amb() : sc.amb; if (am) A.amb(am[0], am[1]); else A.amb(null); });      // 场景自带的环境声（amb: ['shi', 0.2]）；演出里另叫的（雨、火、潮）照旧
})();
