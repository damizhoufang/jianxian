/* 剧本解释器与序章的演出。
   指令：@场景 场景 落脚点 [静]（落脚点写 keep 是留在原地；加“静”不打场景名）｜ @黑 ｜ @亮 秒 ｜ @暗 秒 ｜ @字幕 正文 | 落款 ｜ @题词 题 | 句/句 | 出处
        @指引 文字 | 场景:目标 …（目标写 ent=人物、exit=出口、hot=物件、x=,y=）｜ @等 人物或 exit:出口 ｜ @等到 x y 半径
        @教学 标题 | 正文 ｜ @停 秒 ｜ @乐 曲名（临时换曲，@乐 还 换回场景本来的）｜ @做 演出名 参数（演出写在本文件的 HOOKS 里）
   对白可以带表情：陆惊蛰[笑]：……  可用 笑 嬉 撇 冷 怒 惊 闭 黯 平（只对画了头像的主角起作用） */
'use strict';
(function () {
  const JX = window.JX, P = JX.P, Fig = JX.Fig, W = JX.world, UI = JX.ui;
  const ST = JX.story = { beats: [], i: 0 };
  JX.state = { label: null, stage: 0, money: 0, maxed: false, flags: {} };
  const NAMES = {}; Object.keys(Fig.cast).forEach(id => { NAMES[Fig.cast[id].name] = id; });
  NAMES['孩子'] = 'child';
  const MOODS = { 笑: 'smile', 嬉: 'grin', 撇: 'smirk', 冷: 'cold', 怒: 'angry', 惊: 'surprise', 闭: 'closed', 黯: 'sad', 平: 'normal', 常: null };

  ST.parse = function (text) {
    const beats = [];
    text.split('\n').forEach(raw => {
      const s = raw.trim(); if (!s || s[0] === '#') return;
      let m;
      if ((m = s.match(/^==\s*(.+?)\s*==$/))) beats.push({ t: 'label', name: m[1] });
      else if (s[0] === '@') { const sp = s.indexOf(' '); beats.push({ t: 'cmd', cmd: sp < 0 ? s.slice(1) : s.slice(1, sp), arg: sp < 0 ? '' : s.slice(sp + 1).trim() }); }
      else if ((m = s.match(/^\*(.+)\*$/))) beats.push({ t: 'narr', text: m[1] });
      else if ((m = s.match(/^([^：\[]{1,8})(?:\[(.+?)\])?：(.+)$/))) beats.push({ t: 'say', who: m[1], mood: MOODS[m[2]] || null, text: m[3] });
      else beats.push({ t: 'narr', text: s });
    });
    return beats;
  };
  ST.save = function () {
    const st = JX.state, d = new Date();
    JX.store.set('save', { label: st.label, money: st.money, maxed: st.maxed, flags: st.flags, when: (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') });
  };
  /* 跳场（测试用）：把那一场开头的快照写成存档，重新装载页面，启动时不过标题直接接上。
     这样不管此刻是在对白、演出还是战斗里，都能干净地跳过去。 */
  ST.scenes = () => (window.JX_CHECKPOINTS || []).map(c => c.label);
  ST.jump = function (label) {
    const cp = (window.JX_CHECKPOINTS || []).find(c => c.label === label); if (!cp || ST._jumping) return false;
    ST._jumping = true; const d = new Date();
    JX.store.set('save', { label: cp.label, money: cp.money, maxed: JX.state.maxed, flags: cp.flags, when: (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') });
    try { sessionStorage.setItem('jx.jump', '1'); } catch (e) { /* 存不了就回到标题，用“接着上回”也能到 */ }
    UI.fade(1, 0.2); setTimeout(() => location.reload(), 240); return true;
  };
  ST.jumpBy = function (d) {
    const all = ST.scenes(), i = all.indexOf(JX.state.label), k = (i < 0 ? 0 : i) + d;
    if (k < 0) { UI.toast('已经是第一场'); return false; } if (k >= all.length) { UI.toast('已经是最后一场'); return false; }
    UI.toast('转到　' + all[k], 1.2); return ST.jump(all[k]);
  };
  function until(cond) { return new Promise(res => { const hs = JX._upd = JX._upd || []; const tick = () => { if (cond()) { hs.splice(hs.indexOf(tick), 1); res(); } }; hs.push(tick); }); }
  function parseTargets(s) {
    const at = {};
    s.split(/\s+/).forEach(tok => { const k = tok.indexOf(':'); if (k < 0) return; const sc = tok.slice(0, k), rest = tok.slice(k + 1), o = {}; rest.split(',').forEach(kv => { const [a, b] = kv.split('='); o[a] = isNaN(+b) ? b : +b; }); at[sc] = o; });
    return at;
  }
  function talker(who) { const id = NAMES[who]; if (!id) return null; if (W.player && (W.player.sp === Fig.cast[id])) return W.player; return W.byId[id] || W.byId[String(id).replace(/2$/, '')] || null; }      // 换了衣裳的人（xiali2、qiushui2）在场景里还是原来那个名字

  /* 每一场开头：把这一场和下一场要用的曲子先取下来（只取文件，不出声） */
  function ahead() {
    if (!JX.audio || !JX.audio.prefetch || JX.auto) return;
    const ids = {}; let labels = 0;
    for (let k = ST.i; k < ST.beats.length && labels < 2; k++) {
      const q = ST.beats[k];
      if (q.t === 'label') labels++;
      else if (q.cmd === '乐') ids[q.arg.trim()] = 1;
      else if (q.cmd === '场景') { const sc = JX.scenes[q.arg.split(/\s+/)[0]]; if (sc && sc.music) ids[sc.music] = 1; }
      else if (q.cmd === '做' && /战|相扑|学剑|守庵/.test(q.arg)) { ids.jiaofeng = 1; if (/战三|战梅花|战油葫芦|战金琵琶[甲乙]|战贺/.test(q.arg)) ids.pozhen = 1; }
    }
    JX.audio.prefetch(Object.keys(ids));
  }
  async function exec(b) {
    if (b.t === 'label') { JX.state.label = b.name; ST.save(); ahead(); ST.labelsSeen = (ST.labelsSeen || 0) + 1; const k = ST.scenes().indexOf(b.name) + 1; if (k > (JX.store.get('far') || 0)) JX.store.set('far', k); return; }      // far：故事走到过第几场（图鉴按它解锁）
    if (b.t === 'say') { const e = talker(b.who); W.talker = e; W.talkMood = b.mood; await UI.say(NAMES[b.who], b.who, b.text, b.mood); W.talker = null; W.talkMood = null; return; }
    if (b.t === 'narr') { await UI.narrate(b.text); return; }
    const a = b.arg, parts = a.split('|').map(s => s.trim());
    switch (b.cmd) {
      case '场景': { const [id, spawn] = a.split(/\s+/); W.locked = true; if (spawn === 'keep' && W.id === id) break; await UI.fade(1, parseFloat(document.getElementById('fade').style.opacity || 1) < 1 ? 0.3 : 0); const q0 = UI.quiet; if (a.split(/\s+/)[2] === '静') UI.quiet = true; W.load(id, spawn === 'keep' ? undefined : spawn); UI.quiet = q0; break; }      // 第三个词写“静”：不打场景名（回到刚来过的地方时用）
      case '黑': await UI.fade(1, 0); break;
      case '亮': await UI.fade(0, JX.auto ? 0.05 : (parseFloat(a) || 0.8)); break;
      case '暗': await UI.fade(1, JX.auto ? 0.05 : (parseFloat(a) || 0.8)); break;
      case '字幕': await UI.caption(parts[0], parts[1]); break;
      case '题词': await UI.card(parts[0], parts[1].split('/'), parts[2]); break;
      case '教学': await UI.tutorial(parts[0], parts[1]); break;
      case '前情': if ((ST.labelsSeen || 0) <= 1 && UI.recap) await UI.recap(a); break;      // 前情提要：只在“这一回是从这一场开始的”时候出（读档、跳场）；一口气从上一章演过来的不出
      case '行程': if (UI.routeMap) await UI.routeMap(a); break;                              // 行程图：演这一章要走的那一段路
      case '乐': if (a === '还') { JX.audio.hold = false; if (W.sc && W.sc.music) JX.audio.music(W.sc.music, W.sc.muffle); } else { JX.audio.hold = true; JX.audio.music(a); } break;   // 临时换一首；“还”是换回这个场景本来的曲子
      case '停': await JX.sleep(JX.auto ? 0.02 : parseFloat(a)); break;
      case '指引': W.objective = { text: parts[0], at: parseTargets(parts[1] || '') }; UI.objective(parts[0], parts[2] ? parts[2].split('/') : null); W.guideAt = 0; break;      // 第三段是补充说明，用 / 分行
      case '等': {
        W.locked = false; UI.roam(true);
        await W.waitFor(a);
        W.locked = true; UI.roam(false); if (W.player) { W.player.path = null; W.player.moving = false; }
        W.objective = null; UI.objective(null); break;
      }
      case '等到': {
        const [x, y, r] = a.split(/\s+/).map(Number);
        W.locked = false; UI.roam(true);
        await until(() => W.player && JX.dist(W.player.x, W.player.y, x, y) < r);
        W.locked = true; UI.roam(false); W.player.path = null; W.player.moving = false; W.objective = null; UI.objective(null); break;
      }
      case '做': { const sp = a.indexOf(' '), name = sp < 0 ? a : a.slice(0, sp), arg = sp < 0 ? '' : a.slice(sp + 1); const f = HOOKS[name]; if (!f) throw new Error('没有这段演出：' + name); await f(arg); break; }
      default: throw new Error('不认识的指令：@' + b.cmd);
    }
  }
  ST.run = async function (script, label) {
    ST.beats = ST.parse(script); ST.i = 0; ST.labelsSeen = 0;
    if (label) { const k = ST.beats.findIndex(b => b.t === 'label' && b.name === label); if (k >= 0) ST.i = k; }
    JX.game.playing = true;
    while (ST.i < ST.beats.length) {
      const b = ST.beats[ST.i++];
      try { await exec(b); } catch (err) { console.error('[剑仙] 剧本第 ' + ST.i + ' 拍出错', b, err); JX.lastError = String(err && err.stack || err); UI.toast('这一拍演出出了错，已跳过'); }
    }
  };

  /* ---------- 各场景此刻该有谁在 ---------- */
  JX.populate = function (id) {
    const st = JX.state, sg = st.stage, f = st.flags;
    const off = W.exitsOff = {};
    if (sg < 4) off['hall:stairs'] = '二楼的词会正热闹，\n这会儿上去要挨掌柜的骂。';
    else if (!f.tray2) off['hall:stairs'] = '先到柜台找鲍七，\n把二楼的酒端上。';
    if (id === 'cellar') {
      if (sg === 1 && !f.aguiUp) W.add('agui', 'agui', 1010, 722, { dir: 1, carry: 'jar', tag: '阿桂' });
      if (sg === 1 && !f.jar) W.add('jar2', { h: 96 }, 834, 668, { verb: '抱起', tag: '二楼的酒', draw(g) { P.jar(g, 0, 0, 0.96, { seed: 9, text: '春' }); g.fillStyle = '#f0dca8'; g.fillRect(-9, -72, 18, 12); g.fillStyle = '#8e2a20'; g.font = '600 10px ' + P.KAI; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('二楼', 0, -66); } });
    }
    if (sg >= 11) { off['kitchen:down'] = '酒窖回头再说，\n先把眼前这件事查清。'; off['kitchen:hall'] = '先把后厨这一头查清楚。'; }
    /* ---- 第一章 ---- */
    if (id === 'yamen') {
      W.add('zhong', 'zhong', 690, 616, { dir: 3, tag: '钟推官' });
      W.add('xiali', 'xiali', 1650, 650, { dir: 1, tag: '夏公子' });
      W.add('cy1', 'chaiyi', 1056, 596, { dir: 0, bark: ['（打了个呵欠）', '正门今日不开。'] }); W.add('cy2', 'chaiyi', 1344, 596, { dir: 0, bark: ['……', '有状子，过了卯时再递。'] });
      W.add('danzi', { h: 96 }, 1934, 660, { draw(g) { P.shadow(g, 0, 0, 70, 14, 0.4); P.table(g, 0, 0, 120, 44, 40, { col: '#6a4a32', seed: 7 }); for (let i = 0; i < 2; i++) P.steamer(g, -28 + i * 54, -90, 26, 2); } });
      W.add('tanzhu', { h: 148, kind: 'short', robe: '#7a6a55', trim: '#4a4034', pants: '#4a443c', hair: 'cook', beard: 'stubble' }, 2020, 662, { dir: 1, bark: ['炊饼——刚出笼的炊饼——', '小哥，来一个？两文。'] });
    }
    if (id === 'yaopu') {
      W.add('zhanggui', 'zhanggui', 960, 612, { dir: 0, tag: '仁寿堂掌柜', reach: 190, solid: false });
      W.add('xiali', 'xiali', 180, 880, { dir: 3, tag: '夏公子', solid: false });
      W.add('bingren', { h: 144, kind: 'dress', female: true, hair: 'female', robe: '#6a6f7a', trim: '#3c404a', skirt: '#4a4f58', inner: '#d9d2c0' }, 1420, 706, { dir: 0, pose: 'sit', seat: 30, solid: false, bark: ['（咳了两声）', '先生还没回来……'] });
    }
    if (id === 'beiwa') {
      W.add('laolai', 'laolai', 640, 654, { dir: 0, pose: 'sit', seat: 30, tag: '团头老癞', reach: 170, solid: false });
      W.add('qg1', 'qier', 566, 702, { dir: 3, pose: 'squat', solid: false, bark: ['一五，一十，十五……'] });
      W.add('qg2', Object.assign({}, Fig.cast.qier, { h: 106, robe: '#5d5648', hair: 'boy' }), 498, 726, { dir: 3, pose: 'squat', solid: false, bark: ['……少了两文。'] });
      W.add('chabo', { h: 148, kind: 'short', robe: '#5d6f62', trim: '#33413a', pants: '#3f4640', towel: true }, 352, 600, { dir: 0, solid: false, bark: ['点茶——七宝擂茶——', '客官里边坐。'] });
      W.add('shuohua', { h: 150, kind: 'robe', robe: '#5a6a80', trim: '#2c3644', hair: 'futou', beard: 'grey', wide: 1.5 }, 950, 538, { dir: 0, solid: false, tag: '说话人', reach: 190, bark: ['“……却说那刘玄德三顾茅庐——”', '“欲知后事如何——明日请早！”'] });
      [[800, 654, 31], [866, 654, 32], [928, 654, 33], [950, 710, 34], [1034, 710, 35]].forEach(([x, y, sd], i) => W.add('ts' + i, Fig.extra(sd), x, y, { dir: 2, pose: 'sit', seat: 26, solid: false }));
      W.add('kid1', Object.assign({}, Fig.cast.agui, { robe: '#7a8a6a' }), 1410, 612, { dir: 2, solid: false }); W.add('kid2', Object.assign({}, Fig.cast.child, { robe: '#a8866a' }), 1476, 618, { dir: 2, solid: false });
      W.add('tangren', { h: 150, kind: 'short', robe: '#8a6a3c', trim: '#4f3b1f', pants: '#4a443c', hair: 'bun', beard: 'stubble' }, 1722, 664, { dir: 1, bark: ['糖狮儿——吹糖人儿——', '小哥，给家里的孩子带一个？'] });
      for (let i = 0; i < 11; i++) W.add('gz' + i, Fig.extra(200 + i * 7), 1876 + i * 63 + (i % 2) * 8, 694 + (i % 3) * 10, { dir: 2, solid: false });      // 围着露台看的人
      if (sg === 14) {
        W.add('xiali', 'xiali', 150, 836, { dir: 3, tag: '夏公子', solid: false });
        W.add('bushu', 'bushu', 2200, 452, { dir: 0, solid: false, tag: '部署' });
        if (!f.sumoDone) W.add('tingxue', 'tingxue', 2100, 505, { dir: 0, solid: false, tag: '耶律听雪' });
      }
    }
    if (id === 'ruanhong') {
      const late = sg === 17, bye = sg === 22;                      // bye：章末来道谢，阑珊不见客，屋里只有崔妈妈
      W.add('cuimama', 'cuimama', 420, 702, { dir: late ? 0 : 1, pose: 'sit', seat: 24, tag: '崔妈妈', solid: false, reach: bye ? 150 : null, bark: bye ? ['姑娘不见客。', '走吧，走吧。'] : ['（嗑瓜子）', '一盏茶。说好的。'] });
      if (bye) { W.add('qiushui', 'qiushui', 1470, 664, { dir: 2, pose: 'sit', seat: 30, carry: 'pipa', tag: '阑珊', solid: false }); W.blocks.push([560, 640, 40, 240]); }      // 她在窗下背对着门调弦；崔妈妈守着，过不去
      else W.add('qiushui', 'qiushui', late ? 1410 : 1470, late ? 676 : 664, { dir: late ? 1 : 2, pose: late ? null : 'sit', seat: 30, carry: late ? null : 'pipa', tag: '阑珊', solid: false, reach: 190 });
      W.add('dun', { h: 44 }, 1470, 670, { solid: false, draw(g) { P.shadow(g, 0, 0, 28, 8, 0.4); g.fillStyle = P.hgrad(g, -24, 0, 48, [[0, '#7a5a66'], [0.5, '#c9a8b0'], [1, '#6a4a56']]); g.beginPath(); g.moveTo(-18, -44); g.lineTo(18, -44); g.quadraticCurveTo(30, -22, 18, 0); g.lineTo(-18, 0); g.quadraticCurveTo(-30, -22, -18, -44); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.85)'; g.lineWidth = 1.4; g.stroke(); P.ellipse(g, 0, -44, 18, 5.4, '#d9c0c6', 'rgba(43,34,28,0.85)', 1.2); } });
      if (!bye) W.add('xiali', 'xiali', late ? 1215 : 150, late ? 806 : 842, { dir: 3, tag: '夏公子', solid: false });
      if (sg === 15 && !f.bookGone) W.add('shu', { h: 20 }, 1687, 641, { solid: false, draw(g) { g.fillStyle = '#3f5a78'; g.fillRect(-23, -97, 46, 14); g.strokeStyle = 'rgba(43,34,28,0.8)'; g.lineWidth = 1; g.strokeRect(-23, -97, 46, 14); g.fillStyle = '#efe6cc'; g.fillRect(-17, -94, 9, 8); } });      // 条案上那册书：只在第五场她拿起来之前摆着
    }
    /* —— 第一章八至十一场 —— */
    if (id === 'jiage') W.add('zhong', 'zhong', 330, 716, { dir: 3, tag: '钟推官', solid: false, carry: 'lantern' });
    if (id === 'huafang') {
      W.add('xiali', 'xiali', 150, 836, { dir: 3, tag: '夏公子', solid: false });
      W.add('qiushui', 'qiushui', 340, 742, { dir: 3, tag: '阑珊', solid: false, carry: 'pipa' });
      W.add('xiaohuan', 'xiaohuan', 440, 730, { dir: 1, solid: false });
      W.add('ke1', Fig.extra(311), 600, 706, { dir: 1, solid: false, bark: ['（挑着条案上的果子）', '今夜平章爷高兴，赏得多。'] });
      W.add('ke2', 'hangcai', 930, 700, { dir: 1, carry: 'tray', solid: false, bark: ['借过——正舱要添酒。'] });
      W.add('ke3', Fig.extra(318), 1440, 676, { dir: 0, pose: 'sit', seat: 26, solid: false, bark: ['（等着里头叫，一声不吭）'] });
      W.add('maihua', 'maihua', 1650, 716, { dir: 1, tag: '卖花的', carry: 'basket', reach: 150, solid: false });
      [['boatA', 2040, 742], ['boatB', 2380, 652]].forEach(([k, bx, by], i) => W.add(k, { h: 4 }, bx, by, { solid: false, sy: by - 40, tilt: 0, seed: i, draw: drawSkiff }));
    }
    if (id === 'gongtang') {
      W.add('zhong', 'zhong', 960, 606, { dir: 0, pose: 'sit', seat: 30, tag: '钟推官', solid: false });
      W.add('shuli', 'shuli', 1440, 664, { dir: 0, pose: 'sit', seat: 30, solid: false, bark: ['（笔没有停）'] });
      W.add('he', 'he', 500, 676, { dir: 3, pose: 'sit', seat: 30, tag: '贺元度', solid: false });
      W.add('cy1', 'chaiyi', 650, 716, { dir: 0, solid: false }); W.add('cy2', 'chaiyi', 1270, 716, { dir: 0, solid: false });
      W.add('meihuachi', 'meihuachi', 1150, 800, { dir: 2, pose: 'squat', tag: '梅花翅', solid: false }); W.add('cy3', 'chaiyi', 1250, 806, { dir: 1, solid: false });
      W.add('xiali', 'xiali', 380, 850, { dir: 3, tag: '夏公子', solid: false });
    }
    if (id === 'shufang') W.add('fuqin', 'luwenyuan', 960, 644, { dir: 0, pose: 'sit', seat: 30, tag: '父亲', solid: false, reach: 210 });
    if (id === 'kitchen') {
      W.add('laochu', 'laochu', 770, 474, { dir: 0, tag: '老褚', bark: sg >= 11 ? ['……（看了你一眼，往灶里添了把柴）'] : ['别挡着灶口。', '蟹酿橙还差一笼。', '手脚麻利点，今晚要跑到三更。'] });
      W.add('cook2', { h: 150, kind: 'short', robe: '#7d6f5c', trim: '#4a3f33', pants: '#4f4840', apron: '#d8d0bc', hair: 'cook' }, 1140, 470, { dir: 2, bark: ['……（忙着颠勺，没空理你）'] });
      if (sg === 12) {
        W.add('xiali', 'xiali', 1330, 690, { dir: 3, tag: '夏公子', solid: false });
        W.add('swill', { h: 84 }, 600, 842, { verb: '翻一翻', tag: '泔水桶', draw(g) {                         // 后门边的泔水桶
          P.shadow(g, 0, 0, 44, 11, 0.42); g.fillStyle = P.hgrad(g, -34, 0, 68, [[0, '#4f3a28'], [0.5, '#7a5a3e'], [1, '#4a3626']]); g.beginPath(); g.moveTo(-30, -70); g.lineTo(30, -70); g.lineTo(36, 0); g.lineTo(-36, 0); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.9)'; g.lineWidth = 1.8; g.stroke();
          P.line(g, -32, -52, 32, -52, 3, '#2e2a26'); P.line(g, -35, -16, 35, -16, 3, '#2e2a26'); P.ellipse(g, 0, -70, 30, 9, '#5d5a3c', 'rgba(43,34,28,0.9)', 1.6); P.ellipse(g, -8, -71, 8, 3, '#8a8660'); P.ellipse(g, 12, -69, 5, 2, '#b8b08a');
        } });
      }
      if (sg !== 8) off['kitchen:back'] = '后门闩着。当值的时候，\n不许从这儿溜。';
      if (sg >= 6) {
        W.add('bowls', { h: 150 }, 1560, 792, { draw(g) { P.shadow(g, 0, 0, 62, 14, 0.4); const r = JX.rng(66); for (let col = -2; col <= 2; col++) { const n = 9 - Math.abs(col) * 2 + Math.floor(r() * 2); for (let i = 0; i < n; i++) { const x = col * 26 + (r() - 0.5) * 5, y = -8 - i * 15; g.fillStyle = P.hgrad(g, x - 15, 0, 30, [[0, '#8fae9a'], [0.4, '#dceee2'], [1, '#7c9a88']]); g.beginPath(); g.moveTo(x - 15, y - 9); g.lineTo(x + 15, y - 9); g.quadraticCurveTo(x + 13, y + 5, x, y + 5); g.quadraticCurveTo(x - 13, y + 5, x - 15, y - 9); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.7)'; g.lineWidth = 1; g.stroke(); } } } });
        W.add('tingxue', 'tingxue', 1466, 800, { dir: 3, tag: '洗碗的', bark: ['三顿是多少碗来着……'] });
      }
      if (sg === 8 && f.follow) W.add('xiali', 'xiali', 1650, 716, { dir: 1, tag: '夏公子', solid: false });
      if (sg === 1 && !f.jarDone) off['kitchen:hall'] = '先把酒交给老褚。';
      else if (sg === 1 && !f.s1done) off['kitchen:hall'] = '掌柜的话还没说完。';
    }
    if (id === 'hall') {
      W.add('baoqi', 'baoqi', 640, 404, { dir: 0, tag: '鲍七', solid: false, bark: ['皇都春、琼花露、蓬莱春，\n今晚都得往外搬。', '认酒容易，认喝酒的人难。'] });
      W.add('siniang', 'siniang', sg === 6 ? 1290 : sg === 10 ? 1440 : sg === 22 ? 780 : 880, sg === 6 ? 1190 : sg === 10 ? 1266 : sg === 22 ? 404 : 500, { dir: sg === 6 ? 3 : sg === 10 ? 2 : 0, tag: '阮四娘', solid: sg !== 22, reach: sg === 22 ? 170 : null, bark: ['不许赊账，不许吵架，\n不许出人命。', '还站着？前头客人等着呢。'] });      // 章末（22）她站在柜台后头打算盘
      if (sg === 22) { W.add('xiali', 'xiali', 960, 520, { dir: 1, tag: '夏公子', solid: false }); W.add('tingxue', 'tingxue', 150, 688, { dir: 3, vis: false, solid: false }); }
      if (sg === 6) {
        if (!f.xueGone) W.add('tingxue', 'tingxue', 1600, 1270, { dir: 1, tag: '北边来的小娘子' });
        W.add('huyuan', 'huyuan', f.thrown ? 1778 : 1800, f.thrown ? 1262 : 1200, { dir: 1, pose: f.thrown ? 'squat' : null }); W.add('huyuan2', 'huyuan', f.thrown ? 1792 : 1820, f.thrown ? 1296 : 1340, { dir: 1, pose: f.thrown ? 'squat' : null });
        W.add('bench6', { h: 30 }, 1210, 1330, { solid: false, draw(g) { g.save(); g.rotate(-0.5); P.shadow(g, 0, 10, 80, 12, 0.35); g.fillStyle = '#614430'; g.fillRect(-84, -12, 168, 16); g.strokeStyle = 'rgba(43,34,28,0.85)'; g.lineWidth = 1.4; g.strokeRect(-84, -12, 168, 16); g.fillRect(-70, -40, 9, 28); g.fillRect(60, -40, 9, 28); g.strokeRect(-70, -40, 9, 28); g.strokeRect(60, -40, 9, 28); g.restore(); } });
      }
      if (sg === 7 && f.follow) W.add('luoer', 'luoer', 1440, 1300, { dir: 2, tag: '真州来客', solid: false });
      if (sg === 10) {
        W.add('zhong', 'zhong', 1440, 1070, { dir: 0, tag: '钟推官' }); W.add('cy1', 'chaiyi', 1374, 1164, { dir: 3, solid: false }); W.add('cy2', 'chaiyi', 1506, 1164, { dir: 1, solid: false });      // 站在门里那块空地上，不压着八号桌
        W.add('xiali', 'xiali', 1250, 1150, { dir: 3, tag: '夏公子' }); W.add('tingxue', 'tingxue', 150, 688, { dir: 3, vis: false, solid: false });
      }
      W.add('fan', 'fan', 1470, 366, { dir: 0, pose: 'slump', solid: false, tag: '范醉翁', reach: 190, bark: ['（鼾声）'] });
      W.add('shikeA', Fig.cast.shikeA, 912, 854, { vis: false, solid: false, pose: 'sit' });
      W.add('shikeB', Fig.cast.shikeB, 1712, 854, { vis: false, solid: false, pose: 'sit' });
      W.add('hc2', 'hangcai', 2050, 840, { dir: 1, carry: 'tray', bark: ['借过借过——'] });
      if (sg < 3) off['hall:door'] = '还在当值，出不去。';
      if (sg >= 4) off['hall:door'] = '楼上的客人还等着，\n这会儿出不去。';
      if (sg === 22) { off['hall:door'] = '话还没说完。'; off['hall:stairs'] = '楼上这会儿没有他的事。'; off['hall:kitchen'] = '后厨有人在洗碗。\n这会儿进去，要被拉住算账。'; }
    }
    if (id === 'floor2') {
      W.add('qiushui', 'qiushui', 1200, 742, { dir: 0, pose: f.sang ? null : 'sit', seat: 34, carry: 'pipa', tag: '阑珊', solid: false, bark: ['……（低头调弦，没有看你）'] });
      W.add('he', 'he', 1740, 584, { dir: 0, pose: 'sit', seat: 34, tag: '贺元度', solid: false, reach: 200, bark: ['（他在看那册旧书）'] });
      W.add('cike', { h: 150 }, 820, 894, { vis: false, solid: false });
      W.add('cike2', { h: 150 }, 1580, 894, { vis: false, solid: false }); W.add('cike3', { h: 150 }, 700, 584, { vis: false, solid: false });
      off['floor2:down'] = sg === 4 ? '酒还没送完，下去要挨骂。' : '听潮阁的客人还等着。';
      if (sg === 7 && f.follow) W.add('luoer', 'luoer', 206, 496, { dir: 2, tag: '真州来客', solid: false });
      if (sg === 10) { const q = W.byId.qiushui, h = W.byId.he; if (q) { q.x = 1150; q.y = 1128; q.dir = 0; q.pose = null; } if (h) { h.x = 1222; h.y = 1096; h.dir = 1; h.pose = null; } }
      if (sg === 4 && !f.heDone) off['floor2:up'] = '先把贺先生的酒送到。';
    }
    if (id === 'tingchao') {
      W.add('xiali', 'xiali', sg >= 7 ? 1130 : 960, sg >= 7 ? 640 : 436, { dir: sg >= 7 ? 1 : 2, tag: '夏公子' });
      if (sg === 7 && f.follow) W.add('luoer', 'luoer', 420, 880, { dir: 3, tag: '真州来客', solid: false });
      off['tingchao:down'] = '客人的话还没说完。';
      addCups();
    }
    if (id === 'alley') {
      off['alley:kitchen'] = '回不去了——\n楼里正在喊人。';
      W.add('xiali', 'xiali', 336, 676, { dir: 3, tag: '夏公子', solid: false, carry: f.saber ? 'saber' : null });
      if (!f.won2) [[1480, 640], [1570, 730], [1490, 820]].forEach((q, i) => W.add(i ? 'heiyi' + (i + 1) : 'heiyi', 'heiyi', q[0], q[1], { dir: 1, carry: 'blade', solid: false }));
    }
    if (id === 'roof') {
      W.add('xiali', 'xiali', 540, 610, { dir: 3, tag: '夏公子', carry: 'saber' });
      if (!f.fell) W.add('xieke', 'xieke', 1130, 660, { dir: 1, tag: '蟹壳青' });
      W.add('rope', { h: 4 }, W.sc.rope.x, W.sc.rope.y + 1, { solid: false, k: f.fell ? 1 : 0, draw(g, e) { JX.drawRope(g, e.k); } });
      if (sg === 10) addPosse();
    }
    if (id === 'street') {
      if (sg === 10) { W.add('cy1', 'chaiyi', 1380, 640, { dir: 0, solid: false }); W.add('cy2', 'chaiyi', 1500, 640, { dir: 0, solid: false }); }
      if (sg === 3 && !f.daoGone) W.add('laodao', 'laodao', 1250, 690, { dir: 3, tag: '卖历日的老道' });
      if (sg >= 3) W.add('qier', 'qier', 330, 652, { dir: 3, pose: 'squat', tag: '小乞儿', solid: false });
      const r = JX.rng(42);                                       // 看灯的行人，来来往往
      for (let i = 0; i < 9; i++) { const y = i < 6 ? 1090 + r() * 130 : 880 + r() * 120, dirR = r() < 0.5, e = W.add('w' + i, Fig.extra(900 + i * 7), 100 + r() * 2680, y, { solid: false, dir: dirR ? 3 : 1, moving: true, stroll: (dirR ? 1 : -1) * (60 + r() * 60) }); e.ph = r() * 6; }
    }
  };
  JX.on('update', dt => { if (W.id === 'street') W.ents.forEach(e => { if (!e.stroll) return; e.x += e.stroll * dt; e.moving = true; if (e.x > 2960) e.x = -80; if (e.x < -80) e.x = 2960; }); });

  function addCups() { const f = JX.state.flags; ['cup1', 'cup2'].forEach(k => { if (f[k] && !W.byId[k]) { const o = k === 'cup1' ? [-70, -112] : [40, -76]; W.add(k, { h: 4 }, 960, k === 'cup1' ? 721 : 722, { solid: false, draw(g) { g.save(); g.translate(o[0], o[1]); P.ellipse(g, 0, 0, 9, 4, '#d8ece0', 'rgba(43,34,28,0.7)', 1); P.ellipse(g, 0, -1, 6, 2.4, '#c9862e'); P.line(g, 14, -4, 34, 2, 1.6, '#7a4a28'); P.line(g, 14, -1, 34, 5, 1.6, '#7a4a28'); g.restore(); } }); } }); }
  /* ---------- 朱印特写：案上那册旧书 ---------- */
  function drawSeal(c, k, o) {                                     // k：0 远看，1 凑近到看得清印；o.txt 印文看得清（老学庵），o.fresh 新书，o.fade 印刚钤上去、慢慢显出来
    o = o || {};
    const w = 1300, h = 640;
    const bg = c.createRadialGradient(650, 320, 60, 650, 320, 800); bg.addColorStop(0, '#5a4030'); bg.addColorStop(0.6, '#2a1c16'); bg.addColorStop(1, '#0e0a08'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.save(); c.translate(650, 330); const z = 1 + k * 0.9; c.scale(z, z); c.translate(-140 * k, -70 * k); c.rotate(-0.06);
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-296, -176, 600, 372);
    c.fillStyle = P.hgrad(c, -300, 0, 600, o.fresh ? [[0, '#ece2c6'], [0.48, '#faf3df'], [0.5, '#cdc2a0'], [0.52, '#faf3df'], [1, '#efe5ca']] : [[0, '#d8caa6'], [0.48, '#efe4c6'], [0.5, '#b8aa88'], [0.52, '#efe4c6'], [1, '#dccfac']]); c.fillRect(-300, -180, 600, 360);
    c.strokeStyle = 'rgba(43,34,28,0.8)'; c.lineWidth = 2; c.strokeRect(-300, -180, 600, 360);
    c.strokeStyle = 'rgba(120,60,40,0.35)'; c.lineWidth = 1; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-272 + i * 30, -160); c.lineTo(-272 + i * 30, 160); c.stroke(); c.beginPath(); c.moveTo(28 + i * 30, -160); c.lineTo(28 + i * 30, 160); c.stroke(); }
    const r = JX.rng(77); c.fillStyle = 'rgba(30,22,16,0.8)';
    c.strokeStyle = 'rgba(30,22,16,0.78)'; c.lineCap = 'round';                                   // 一行行的字：只画出字的样子，看不清写的什么
    for (let col = 0; col < 16; col++) { const x = (col < 8 ? -257 : 43) + (col % 8) * 30, n = 9 + Math.floor(r() * 5); for (let j = 0; j < n; j++) { const y = -148 + j * 22, m = 3 + Math.floor(r() * 4); for (let q = 0; q < m; q++) { const k = r(), sx = x - 7 + r() * 12, sy = y - 7 + r() * 12, len = 5 + r() * 8; c.lineWidth = 1.4 + r() * 1.2; c.beginPath(); c.moveTo(sx, sy); if (k < 0.4) c.lineTo(Math.min(x + 8, sx + len), sy + (r() - 0.5) * 2); else if (k < 0.75) c.lineTo(sx + (r() - 0.5) * 2, Math.min(y + 9, sy + len)); else c.lineTo(sx + (r() < 0.5 ? -1 : 1) * len * 0.6, sy + len * 0.7); c.stroke(); } } }
    /* 朱印：方的，四个字的位置，字是篆的，看不真——只看得出是一方藏书印 */
    const sa = o.fade != null ? Math.min(1, o.fade * 1.7) : 1;
    c.save(); c.translate(236, 112); c.rotate(0.03); c.globalAlpha = 0.86 * sa; c.fillStyle = o.fresh ? '#c8362e' : '#b5302a'; c.fillRect(-34, -34, 68, 68); c.globalAlpha = sa;
    c.strokeStyle = '#efe4c6'; c.lineWidth = 3; c.strokeRect(-27, -27, 54, 54);
    if (o.txt) { c.fillStyle = '#f6ecd2'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '600 25px ' + P.KAI; c.fillText('老', 13, -12); c.fillText('学', 13, 13.5); c.save(); c.translate(-13, 1); c.scale(1, 1.9); c.fillText('庵', 0, 0); c.restore(); }
    else { c.lineWidth = 2.6; [[-14, -14], [14, -14], [-14, 14], [14, 14]].forEach(([x, y], i) => { c.beginPath(); c.moveTo(x - 8, y - 8); c.lineTo(x + 8, y - 8); c.moveTo(x - 8, y); c.lineTo(x + 8, y); c.moveTo(x - 8, y + 8); c.lineTo(x + 8, y + 8); c.moveTo(x + (i % 2 ? -8 : 8), y - 8); c.lineTo(x + (i % 2 ? -8 : 8), y + 8); c.moveTo(x, y - 8 + (i > 1 ? 8 : 0)); c.lineTo(x, y + (i > 1 ? 8 : 0)); c.stroke(); }); }
    c.restore();
    c.restore();
    const v = c.createRadialGradient(650, 320, 240, 650, 320, 760); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
  }
  ST._drawSeal = (c, k, o) => drawSeal(c, k, o);
  /* 抄家夜：火把底下，一只翻书的手（只见手和袖口，不见人） */
  function drawHand(c, k) {
    drawSeal(c, 0.78 + k * 0.22, { txt: true });
    const fl = 0.85 + 0.15 * Math.sin(JX.time * 9);
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(1180, 120, 0, 1180, 120, 900); g.addColorStop(0, 'rgba(255,150,70,' + 0.34 * fl + ')'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(0, 0, 1300, 640); c.restore();
    c.save(); c.translate(360 + k * 40, 586 - k * 40); c.rotate(-0.5); c.scale(1.4, 1.4);
    /* 袖子：深色的窄袖，露一道白的里衣袖口 */
    c.fillStyle = P.vgrad(c, 0, -70, 170, [[0, '#4f5d57'], [1, '#2c3632']]); c.beginPath(); c.moveTo(-560, -30); c.lineTo(-8, -46); c.lineTo(-8, 50); c.lineTo(-560, 150); c.closePath(); c.fill(); c.strokeStyle = 'rgba(20,14,10,0.85)'; c.lineWidth = 2.4; c.stroke();
    c.fillStyle = '#ece4d0'; c.fillRect(-20, -44, 20, 92); c.strokeRect(-20, -44, 20, 92);
    /* 手背朝上，四指并着搭在书页上，食指微微抬起——正要翻过这一页 */
    const skin = '#ecd2b4', ink = 'rgba(60,36,22,0.85)';
    c.lineCap = 'round'; c.lineJoin = 'round';
    const finger = (x0, y0, x1, y1, w) => { c.strokeStyle = ink; c.lineWidth = w + 3.4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = skin; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    finger(30, 30, 74, 52, 17);                                                            // 拇指贴在掌侧
    finger(66, 27, 122, 30, 15); finger(70, 10, 140, 11, 16); finger(70, -8, 146, -9, 17); finger(66, -26, 136 + k * 6, -34 - k * 10, 16);
    c.fillStyle = skin; c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-2, -32); c.quadraticCurveTo(40, -44, 76, -34); c.lineTo(78, 36); c.quadraticCurveTo(40, 46, -2, 38); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = skin; c.fillRect(66, -30, 16, 64);                                       // 盖住指根的描边
    c.strokeStyle = 'rgba(60,36,22,0.35)'; c.lineWidth = 1.6; [-18, 0, 18].forEach(y => { c.beginPath(); c.moveTo(70, y); c.lineTo(80, y + 1); c.stroke(); });
    c.restore();
    cutVig(c);
  }
  /* 跟在阿蛰后头走的人（第七场的罗二） */
  let followT = 0;
  JX.on('update', dt => {
    const f = JX.state.flags; if (!f || !f.follow || W.locked) return; const e = W.byId[f.follow === true ? 'luoer' : f.follow], p = W.player; if (!e || !p) return;
    const d = JX.dist(e.x, e.y, p.x, p.y); followT -= dt;
    if (d < 96) { e.path = null; e.moving = false; }
    else if (followT <= 0) { followT = 0.35; e.path = W.findPath(e.x, e.y, p.x, p.y); e.pathSpeed = d > 300 ? 300 : 200; e.onArrive = null; }
  });
  /* 屋顶上来拿人的：钟推官和两个差役，各带一团火把的光 */
  function addPosse() {
    const torch = (dx) => ({ solid: false, draw(g) { g.save(); g.globalCompositeOperation = 'lighter'; const a = 0.5 + 0.12 * Math.sin(JX.time * 9 + dx); const gr = g.createRadialGradient(dx, -150, 0, dx, -150, 190); gr.addColorStop(0, 'rgba(255,190,110,' + a + ')'); gr.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gr; g.fillRect(dx - 190, -340, 380, 380); g.restore(); g.fillStyle = '#3a241a'; g.fillRect(dx - 2, -150, 4, 70); P.ellipse(g, dx, -158, 7, 11, '#ffd27a'); P.ellipse(g, dx, -162, 4, 7, '#fff4d0'); } });
    if (W.byId.zhong) return;
    W.add('zhong', 'zhong', 330, 700, { dir: 3, tag: '钟推官' }); W.add('cy1', 'chaiyi', 250, 620, { dir: 3, solid: false }); W.add('cy2', 'chaiyi', 240, 790, { dir: 3, solid: false });
    W.add('t1', { h: 2 }, 250, 622, torch(26)); W.add('t2', { h: 2 }, 240, 792, torch(26));
  }
  /* 抄家夜：三个举火把的差役从左手的门进来，站到书案左边；父亲起身，绕过书案走到他们中间 */
  const RAID = { a: [636, 778], b: [800, 792], d: [330, 822], fa: [716, 784] };
  function raidIn() {
    const fa = W.byId.fuqin; JX.audio.sfx('door');
    const mk = id => W.add(id, 'chaiyi', 76, 770, { dir: 3, solid: false, carry: 'torch' });
    const a = mk('cy1'), b = mk('cy2'), d = mk('cy3');
    W.walk(a, RAID.a[0], RAID.a[1], { speed: 250, straight: true, dir: 3 }).then(() => { if (!fa || W.id !== 'shufang' || fa.out) return; fa.pose = null; return W.walk(fa, 700, 650, { speed: 110, straight: true }).then(() => { if (!fa.out) return W.walk(fa, RAID.fa[0], RAID.fa[1], { speed: 110, straight: true, dir: 0 }); }); });
    JX.sleep(0.45).then(() => { if (W.byId.cy2 === b) W.walk(b, RAID.b[0], RAID.b[1], { speed: 250, straight: true, dir: 1 }); });
    JX.sleep(0.9).then(() => { if (W.byId.cy3 === d) W.walk(d, RAID.d[0], RAID.d[1], { speed: 220, straight: true, dir: 3 }); });
  }
  /* 第一章每一场开头都要把人和界面摆回“平常”的样子（跳场是直接从这里起头的） */
  function ch1(stage, follow) {
    const st = JX.state, f = st.flags; st.stage = stage; f.follow = follow || false;
    if (!W.player || W.player.sp !== Fig.cast.jingzhe) W.setPlayer('jingzhe');
    const p = W.player; p.carry = null; p.vis = true; p.pose = null; p.speedK = 1; p.draw = null; p.z = 0; UI.purse(st.money); UI.tone(null); W.focus = null; W.zoom = 1; W.raid = 0; W.patrol = 0; W.rocking = false; return p;
  }
  /* 两场真打的战斗共用的人和招 */
  function fighters(p, x) {
    return [
      { ent: p, key: 'jingzhe', name: '陆惊蛰', hp: 130, spd: 13, atk: 22, def: 6, season: 0, cmds: [
        { id: 'dian', name: '酒提子·点', kind: 'attack', type: 'light', pow: 1, delay: 0.8, desc: '长柄酒提子，专点手腕。出手快，下一手来得早。' },
        { id: 'sao', name: '扁担·扫', kind: 'attack', type: 'heavy', all: true, pow: 0.75, delay: 1.3, desc: '扁担横扫，面前的都带到。出手慢，下一手来得迟。' },
        { id: 'bu', name: '踏潮步', kind: 'dodge', desc: '脚下一错，人已不在原地。重手和擒拿都躲得开；快手只能躲开一半。' }] },
      { ent: x, key: 'xiali', name: '夏离', hp: 120, spd: 11, atk: 28, def: 8, season: 1, cmds: [
        { id: 'zhan', name: '弯刀·斩', kind: 'attack', type: 'heavy', pow: 1.25, desc: '一刀下去，实打实。' },
        { id: 'ge', name: '弯刀·格', kind: 'guard', desc: '横刀封住门户。到她下一手之前，挨的打只算三成半。' },
        { id: 'shuai', name: '摔', kind: 'attack', type: 'grab', pow: 0.5, desc: '草原上的摔跤手法：抢进去一绊。伤得不重，但对手要缓一手才起得来。', fx(b, u, t) { if (t && t.hp > 0 && !t.boss) { t.stun = Math.max(t.stun, 1); JX.battle.fx.floater(t, '绊倒', '#d9c27a'); } } }] },
    ];
  }
  /* 特写：一块画板加几句旁白 */
  async function cutIn(draw, lines, sec) {
    const box = UI.root().appendChild(JX.el('div', '', '<canvas width="1300" height="640"></canvas>')); box.id = 'cut';
    const c = box.firstChild.getContext('2d'); draw(c, 0); void box.offsetWidth; box.style.opacity = 1;
    await JX.sleep(JX.auto ? 0.05 : 0.8);
    JX.tween(JX.auto ? 0.05 : (sec || 2.4), k => draw(c, k), JX.ease.out);
    for (const t of lines) await UI.narrate(t);
    box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.7); box.remove();
  }
  function cutBg(c, a, b2) { const bg = c.createRadialGradient(650, 320, 60, 650, 320, 800); bg.addColorStop(0, a); bg.addColorStop(0.6, b2); bg.addColorStop(1, '#0c0908'); c.fillStyle = bg; c.fillRect(0, 0, 1300, 640); }
  function cutVig(c) { const v = c.createRadialGradient(650, 320, 240, 650, 320, 760); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.72)'); c.fillStyle = v; c.fillRect(0, 0, 1300, 640); }
  /* 手心里的雁翎，翎管上缠着半枚铜符 */
  function drawFeather(c, k) {
    cutBg(c, '#4a3a30', '#221814');
    c.save(); c.translate(650, 330); const z = 1 + k * 0.35; c.scale(z, z); c.translate(-60 * k, 10 * k);
    /* 手：四指在上，掌心朝外，拇指在左 */
    const skin = P.hgrad(c, -330, 0, 660, [[0, '#c99a74'], [0.5, '#efcfa8'], [1, '#c09068']]), ink = 'rgba(43,31,25,0.85)';
    c.lineCap = 'round'; c.lineJoin = 'round';
    [[-176, -40, -214, -300, 88], [-58, -60, -66, -340, 92], [62, -60, 80, -330, 90], [176, -36, 222, -270, 82]].forEach(([x0, y0, x1, y1, w]) => {
      c.strokeStyle = ink; c.lineWidth = w + 6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = '#e8c8a0'; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; c.strokeStyle = 'rgba(140,80,56,0.35)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(mx - w * 0.3, my + 4); c.quadraticCurveTo(mx, my + 12, mx + w * 0.3, my + 2); c.stroke();
    });
    c.strokeStyle = ink; c.lineWidth = 104; c.beginPath(); c.moveTo(-250, 120); c.quadraticCurveTo(-360, 20, -390, -110); c.stroke(); c.strokeStyle = '#deb88e'; c.lineWidth = 98; c.beginPath(); c.moveTo(-250, 120); c.quadraticCurveTo(-360, 20, -390, -110); c.stroke();
    c.fillStyle = skin; c.strokeStyle = ink; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-300, 340); c.bezierCurveTo(-320, 180, -290, 20, -226, -40); c.bezierCurveTo(-200, -72, -150, -30, -118, -62); c.bezierCurveTo(-80, -94, -30, -44, 2, -70); c.bezierCurveTo(40, -96, 96, -40, 124, -62); c.bezierCurveTo(170, -84, 250, -30, 262, 60); c.bezierCurveTo(286, 160, 290, 260, 280, 340); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(140,80,56,0.4)'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-230, 40); c.quadraticCurveTo(-40, -30, 220, 30); c.moveTo(-250, 130); c.quadraticCurveTo(-60, 50, 170, 160); c.moveTo(-110, -30); c.quadraticCurveTo(-70, 120, -170, 300); c.stroke();
    /* 雁翎 */
    c.save(); c.rotate(-0.42); c.translate(20, 40);
    const vane = (s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(-250, 0); c.bezierCurveTo(-140, s * 62, 120, s * 70, 300, s * 6); c.lineTo(300, 0); c.closePath(); c.fill(); };
    vane(-1, '#d9d4c8'); vane(1, '#b9b2a2');
    c.strokeStyle = 'rgba(70,62,52,0.45)'; c.lineWidth = 1.3; for (let i = 0; i < 44; i++) { const x = -236 + i * 12, w = Math.sin((i + 2) / 48 * Math.PI) * 58; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 26, -w); c.moveTo(x, 0); c.lineTo(x + 26, w * 1.06); c.stroke(); }
    c.fillStyle = 'rgba(60,52,44,0.5)'; c.beginPath(); c.moveTo(200, 0); c.bezierCurveTo(240, -30, 280, -20, 300, -4); c.lineTo(300, 4); c.bezierCurveTo(280, 22, 240, 30, 200, 0); c.fill();
    c.strokeStyle = '#f4eedc'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-420, 4); c.lineTo(300, 0); c.stroke(); c.strokeStyle = 'rgba(90,80,64,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-420, 7); c.lineTo(300, 3); c.stroke();
    /* 半枚铜符：缠在翎管上 */
    c.save(); c.translate(-330, 4); c.rotate(0.2);
    c.fillStyle = P.hgrad(c, -60, 0, 120, [[0, '#5a6a4a'], [0.4, '#9aa67a'], [1, '#4a563c']]); c.strokeStyle = 'rgba(30,26,20,0.9)'; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(-56, -40); c.lineTo(40, -40); c.lineTo(52, -26); c.lineTo(38, -12); c.lineTo(54, 2); c.lineTo(38, 16); c.lineTo(52, 30); c.lineTo(40, 42); c.lineTo(-56, 42); c.quadraticCurveTo(-70, 0, -56, -40); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(30,40,24,0.75)'; c.lineWidth = 3; [[-36, -24, -36, 26], [-14, -24, -14, 26], [8, -24, 8, 10], [-46, -4, 20, -4], [-46, 16, 4, 16]].forEach(q => { c.beginPath(); c.moveTo(q[0], q[1]); c.lineTo(q[2], q[3]); c.stroke(); });
    c.fillStyle = 'rgba(120,170,140,0.35)'; c.beginPath(); c.arc(-30, 28, 14, 0, 6.3); c.fill(); c.beginPath(); c.arc(16, -30, 10, 0, 6.3); c.fill();
    c.strokeStyle = '#7a3a2a'; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-10 + i * 9, -46); c.lineTo(-18 + i * 9, 48); c.stroke(); }
    c.restore(); c.restore(); c.restore();
    cutVig(c);
  }
  /* ---------- 第一章后半的几样画 ---------- */
  /* 湖上自己撑的那条小划子：船尾船娘撑篙，当中夏离和背着琵琶匣的阿蛰，船头坐着抱琵琶的阑珊 */
  function drawPunt(g, e) {
    const t = JX.time; if (e.dir === 1 || e.dir === 3) e.face = e.dir;
    g.save(); g.translate(0, Math.sin(t * 1.7) * 2); if (e.face === 1) g.scale(-1, 1);
    g.fillStyle = 'rgba(8,12,28,0.45)'; g.beginPath(); g.ellipse(4, 14, 166, 15, 0, 0, 6.3); g.fill();
    if (e.moving) for (let i = 0; i < 3; i++) { const u = (t * 1.1 + i / 3) % 1; g.strokeStyle = 'rgba(200,214,255,' + (0.34 * (1 - u)) + ')'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(-166 - u * 80, 12, 14 + u * 34, 4 + u * 7, 0, 0, 6.3); g.stroke(); }
    g.fillStyle = '#2a1c14'; g.beginPath(); g.moveTo(-154, -32); g.lineTo(156, -36); g.lineTo(130, -8); g.lineTo(-130, -6); g.closePath(); g.fill(); P.line(g, -154, -32, 156, -36, 4, '#6a4a32');
    P.line(g, 156, -34, 166, -150, 4, '#4a3324'); P.line(g, 166, -150, 184, -146, 3, '#4a3324'); P.lantern(g, 184, -122, 11, { cord: 10, tassel: false });
    [['chuanniang', -112, { carry: 'pole' }], ['xiali', -46, { pose: 'sit', seat: 30 }], ['jingzhe', 18, { pose: 'sit', seat: 30, carry: 'case' }], ['qiushui', 86, { pose: 'sit', seat: 30, carry: 'pipa' }]].forEach(([id, x, o]) => { g.save(); g.translate(x, -14); Fig.draw(g, Fig.cast[id], 3, 0.5, Object.assign({ shadow: false }, o)); g.restore(); });
    g.fillStyle = P.vgrad(g, 0, -24, 46, [[0, '#6a4a32'], [1, '#2a1c12']]); g.beginPath(); g.moveTo(-172, -42); g.quadraticCurveTo(-144, 14, -82, 18); g.lineTo(86, 18); g.quadraticCurveTo(152, 12, 180, -48); g.lineTo(152, -24); g.quadraticCurveTo(0, -12, -148, -22); g.closePath(); g.fill(); g.strokeStyle = 'rgba(30,20,14,0.9)'; g.lineWidth = 2; g.stroke();
    P.line(g, -124, 2, 130, 0, 1.2, 'rgba(0,0,0,0.3)');
    g.restore();
  }
  /* 画舫船头外面泊着的小船（梅花翅在上头跳的那两条）：会晃 */
  function drawSkiff(g, e) {
    g.save(); g.rotate((e.tilt || 0) + (W.rocking ? Math.sin(JX.time * 5 + (e.seed || 0) * 2) * 0.03 : 0));
    g.fillStyle = 'rgba(8,12,28,0.5)'; g.beginPath(); g.ellipse(0, 52, 184, 18, 0, 0, 6.3); g.fill();
    g.fillStyle = P.vgrad(g, 0, -10, 62, [[0, '#5a3a26'], [1, '#1e140e']]); g.beginPath(); g.moveTo(-182, -12); g.quadraticCurveTo(-152, 46, -78, 54); g.lineTo(78, 54); g.quadraticCurveTo(152, 46, 182, -12); g.closePath(); g.fill(); g.strokeStyle = 'rgba(30,20,14,0.9)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = P.vgrad(g, 0, -38, 56, [[0, '#9a7650'], [1, '#6a4c34']]); g.beginPath(); g.ellipse(0, -10, 182, 28, 0, 0, 6.3); g.fill(); g.stroke();
    for (let i = -3; i <= 3; i++) P.line(g, i * 46, -36 + Math.abs(i) * 2.6, i * 48, 16 - Math.abs(i) * 2.6, 1, 'rgba(0,0,0,0.22)');
    const s = e.seed ? -1 : 1; P.line(g, s * 150, -14, s * 160, -200, 5, '#3a2a1e');
    for (let i = 0; i < 4; i++) P.lantern(g, s * 160 - s * 17, -178 + i * 34, 10, { cord: 5, tassel: i === 3 });
    g.restore();
  }
  /* 临安府的巡船：钟推官，前后两个举火把的差役 */
  function drawPatrol(g) {
    g.save(); g.translate(0, Math.sin(JX.time * 1.5) * 2); g.scale(-1, 1);
    g.fillStyle = 'rgba(8,12,28,0.45)'; g.beginPath(); g.ellipse(4, 14, 190, 16, 0, 0, 6.3); g.fill();
    g.fillStyle = '#1e1612'; g.beginPath(); g.moveTo(-176, -32); g.lineTo(178, -36); g.lineTo(150, -8); g.lineTo(-150, -6); g.closePath(); g.fill(); P.line(g, -176, -32, 178, -36, 4, '#4a3a32');
    [['chaiyi', -112, { carry: 'torch' }], ['zhong', -8, {}], ['chaiyi', 100, { carry: 'torch' }]].forEach(([id, x, o]) => { g.save(); g.translate(x, -14); Fig.draw(g, Fig.cast[id], 3, 0.5, Object.assign({ shadow: false }, o)); g.restore(); });
    g.fillStyle = P.vgrad(g, 0, -24, 46, [[0, '#4a3a32'], [1, '#1c1410']]); g.beginPath(); g.moveTo(-196, -42); g.quadraticCurveTo(-166, 14, -100, 18); g.lineTo(104, 18); g.quadraticCurveTo(174, 12, 204, -48); g.lineTo(174, -24); g.quadraticCurveTo(0, -12, -170, -22); g.closePath(); g.fill(); g.strokeStyle = 'rgba(30,20,14,0.9)'; g.lineWidth = 2; g.stroke();
    g.restore();
  }
  ST._drawPunt = drawPunt; ST._drawSkiff = drawSkiff;
  function rockBoats(sec) { const a = W.byId.boatA, b2 = W.byId.boatB; return JX.tween(JX.auto ? 0.03 : sec, q => { const sw = Math.sin(q * Math.PI * 4) * (1 - q); if (a) a.tilt = 0.075 * sw; if (b2) b2.tilt = -0.065 * sw; }).then(() => { if (a) a.tilt = 0; if (b2) b2.tilt = 0; }); }
  /* 三枚镖成品字飞过去（画在最上面一层） */
  function dartEnt(id, ang) { return W.add(id, { h: 2 }, 0, 1060, { solid: false, z: 0, ang, draw(g, me) { g.rotate(me.ang); [[0, 0], [-16, -9], [-16, 9]].forEach(([dx, dy]) => { g.fillStyle = '#e8eef2'; g.strokeStyle = 'rgba(20,14,10,0.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(dx + 12, dy); g.lineTo(dx, dy - 3.6); g.lineTo(dx - 8, dy); g.lineTo(dx, dy + 3.6); g.closePath(); g.fill(); g.stroke(); }); } }); }
  async function throwDarts(a, t) {
    const x0 = a.x - 16, y0 = a.y - 96, x1 = t.x + 8, y1 = t.y - 96, d = dartEnt('dart', Math.atan2(y1 - y0, x1 - x0));
    d.x = x0; d.z = 1060 - y0; JX.audio.sfx('page');
    await JX.tween(JX.auto ? 0.03 : 0.22, q => { d.x = x0 + (x1 - x0) * q; d.z = 1060 - (y0 + (y1 - y0) * q); }, q => q); W.remove('dart');
  }
  /* 一列看不清的字：只画出字的样子 */
  function scribble(c, x, y0, n, r, size, a) {
    c.strokeStyle = 'rgba(30,22,16,' + (a || 0.7) + ')'; c.lineCap = 'round';
    for (let j = 0; j < n; j++) { const y = y0 + j * size * 1.08 + size / 2, m = 3 + Math.floor(r() * 4), h = size * 0.36; for (let q = 0; q < m; q++) { const k = r(), sx = x - h + r() * h * 1.6, sy = y - h + r() * h * 1.6, len = h * (0.6 + r()); c.lineWidth = 1.4 + r() * 1.6; c.beginPath(); c.moveTo(sx, sy); if (k < 0.4) c.lineTo(Math.min(x + h, sx + len), sy + (r() - 0.5) * 2); else if (k < 0.75) c.lineTo(sx + (r() - 0.5) * 2, Math.min(y + h, sy + len)); else c.lineTo(sx + (r() < 0.5 ? -1 : 1) * len * 0.6, sy + len * 0.7); c.stroke(); } }
  }
  /* 架阁库：摊开的那一卷。看得清的只有几行——案由，和书的去处 */
  function drawJuan(c, k) {
    cutBg(c, '#4a3c30', '#211812');
    c.save(); c.translate(650, 326); const z = 1 + k * 0.2; c.scale(z, z); c.translate(-40 * k, 0); c.rotate(-0.025);
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-506, -206, 1020, 432);
    c.fillStyle = P.hgrad(c, -510, 0, 1020, [[0, '#d2c4a0'], [0.5, '#e9dcba'], [1, '#d8caa6']]); c.fillRect(-510, -214, 1020, 428); c.strokeStyle = 'rgba(43,34,28,0.8)'; c.lineWidth = 2; c.strokeRect(-510, -214, 1020, 428);
    c.fillStyle = P.hgrad(c, 500, 0, 44, [[0, '#b8aa88'], [0.4, '#efe4c6'], [1, '#8a7c5c']]); c.fillRect(500, -226, 44, 452); c.strokeRect(500, -226, 44, 452); c.fillStyle = '#5a3a28'; c.fillRect(512, -240, 20, 14); c.fillRect(512, 226, 20, 14);
    c.strokeStyle = 'rgba(120,60,40,0.3)'; c.lineWidth = 1; for (let i = 0; i <= 15; i++) { c.beginPath(); c.moveTo(478 - i * 64, -196); c.lineTo(478 - i * 64, 196); c.stroke(); }
    const r = JX.rng(88), colX = i => 446 - i * 64;
    const text = { 0: ['宝祐四年秋', 34, 0.92], 1: ['太学博士陆文渊通敌一案', 31, 0.92], 4: ['籍没家产入官', 34, 0.8], 9: ['籍没书籍', 36, 0.96], 10: ['交贺元度点检', 36, 0.96] };
    c.fillStyle = 'rgba(255,214,120,' + (0.3 * k) + ')'; c.fillRect(colX(10) - 30, -200, 124, 262);
    for (let i = 0; i < 11; i++) { const tx = text[i]; if (tx) P.vtext(c, tx[0], colX(i), -190, tx[1], 'rgba(30,22,16,' + tx[2] + ')', '600', 1.08); else scribble(c, colX(i), -190, 7 + Math.floor(r() * 4), r, 32, 0.6); }      // 书的去处是末一行，再往左只有一方官印
    c.save(); c.translate(colX(12), 110); c.rotate(0.04); c.globalAlpha = 0.7; c.strokeStyle = '#b5302a'; c.lineWidth = 5; c.strokeRect(-46, -46, 92, 92); c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-30 + i * 30, -34); c.lineTo(-30 + i * 30, 34); c.stroke(); } c.restore();
    c.restore(); cutVig(c);
  }
  /* 捺笔：左边是信上的字，捺脚往上一挑；右边是记得的字，父亲的捺是平平送出去的。一笔一笔是拿圆点叠出来的 */
  function brush(c, pt, wd, n) { for (let i = 0; i <= n; i++) { const t = i / n, q = pt(t); c.beginPath(); c.arc(q[0], q[1], Math.max(0.6, wd(t) / 2), 0, 6.3); c.fill(); } }
  const qb = (a, b, d) => t => [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * b[0] + t * t * d[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * b[1] + t * t * d[1]];
  function ren(c, flick) {                                          // 一个“人”字：一撇一捺
    brush(c, qb([14, -150], [6, -20], [-128, 104]), t => 24 * Math.pow(1 - t, 0.75) + 3, 200);
    brush(c, qb([2, -84], [34, 22], [104, 92]), t => 7 + 22 * Math.pow(t, 1.25), 90);
    if (flick) brush(c, qb([104, 92], [152, 106], [180, 30]), t => 29 * Math.pow(1 - t, 0.9) + 1, 170);
    else brush(c, qb([104, 92], [150, 100], [198, 104]), t => 29 * Math.pow(1 - t, 0.8) + 1, 170);
  }
  function drawNa(c, k) {
    cutBg(c, '#4a3c30', '#211812');
    const page = (x, col, a) => { c.save(); c.translate(x, 296); c.globalAlpha = a; c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(-236, -236, 480, 480); c.fillStyle = col; c.fillRect(-240, -240, 480, 480); c.strokeStyle = 'rgba(43,34,28,0.8)'; c.lineWidth = 2; c.strokeRect(-240, -240, 480, 480); c.restore(); };
    page(360, '#e2d5b2', 1);
    c.save(); c.translate(360, 296); const r = JX.rng(123); scribble(c, -204, -220, 10, r, 40, 0.45);
    c.fillStyle = 'rgba(26,20,16,0.93)'; c.scale(1.2, 1.2); ren(c, true); c.restore();
    c.globalAlpha = Math.min(1, k * 1.6); c.strokeStyle = '#c8362e'; c.lineWidth = 4; c.beginPath(); c.ellipse(360 + 176, 296 + 84, 70, 70, 0, 0, 6.3); c.stroke(); c.globalAlpha = 1;
    const a = 0.12 + 0.88 * k; page(940, '#efe6cc', a);
    c.save(); c.translate(940, 296); c.globalAlpha = a; c.fillStyle = 'rgba(26,20,16,0.93)'; c.scale(1.2, 1.2); ren(c, false); c.restore();
    c.fillStyle = '#f0dca8'; c.font = '26px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('信上的捺：收尾往上一挑', 360, 580); c.globalAlpha = a; c.fillText('父亲的捺：平平地送出去', 940, 580); c.globalAlpha = 1;
    cutVig(c);
  }
  /* 花篮：面上的红梅、山茶往两边拨开，底下压着几串小黄花 */
  function drawBasket(c, k) {
    cutBg(c, '#4a3a30', '#221814');
    const ink = 'rgba(43,31,25,0.85)';
    c.save(); c.translate(650, 352);
    c.strokeStyle = ink; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(-318, -50); c.bezierCurveTo(-250, -420, 250, -420, 318, -50); c.stroke(); c.strokeStyle = '#a8864a'; c.lineWidth = 20; c.stroke(); c.strokeStyle = 'rgba(60,40,20,0.4)'; c.lineWidth = 2; for (let i = 1; i < 16; i++) { const t = i / 16, bx = Math.pow(1 - t, 3) * -318 + 3 * (1 - t) * (1 - t) * t * -250 + 3 * (1 - t) * t * t * 250 + t * t * t * 318, by = Math.pow(1 - t, 3) * -50 + 3 * (1 - t) * (1 - t) * t * -420 + 3 * (1 - t) * t * t * -420 + t * t * t * -50; c.beginPath(); c.moveTo(bx - 9, by - 6); c.lineTo(bx + 9, by + 6); c.stroke(); }      // 提梁
    c.fillStyle = P.hgrad(c, -330, 0, 660, [[0, '#7a5a30'], [0.5, '#c9a86a'], [1, '#6a4c28']]); c.beginPath(); c.moveTo(-330, -40); c.quadraticCurveTo(-300, 230, 0, 240); c.quadraticCurveTo(300, 230, 330, -40); c.closePath(); c.fill(); c.strokeStyle = ink; c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(60,40,20,0.35)'; c.lineWidth = 2; for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(-330 + i * 8, -40 + i * 34); c.quadraticCurveTo(0, 6 + i * 36, 330 - i * 8, -40 + i * 34); c.stroke(); } for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * 50, 60); c.lineTo(i * 42, 232 - Math.abs(i) * 8); c.stroke(); }
    c.fillStyle = '#241a12'; c.beginPath(); c.ellipse(0, -40, 330, 110, 0, 0, 6.3); c.fill(); c.strokeStyle = ink; c.lineWidth = 3; c.stroke();
    c.save(); c.beginPath(); c.ellipse(0, -40, 322, 104, 0, 0, 6.3); c.clip();
    c.globalAlpha = 0.1 + 0.9 * k;
    const r = JX.rng(55);
    for (let v = 0; v < 6; v++) {                                   // 钩吻：细藤，对生的叶，一串一串的小黄花
      const x0 = -270 + v * 96 + r() * 30, y0 = -120 + r() * 30, x1 = x0 + 50 + r() * 60, y1 = 30 + r() * 30, cx = (x0 + x1) / 2 + (r() - 0.5) * 80, cy = (y0 + y1) / 2 - 20;
      c.strokeStyle = '#4a6a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1); c.stroke();
      for (let i = 0; i <= 8; i++) {
        const t = i / 8, px = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, py = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y1;
        if (i % 3 === 0) { c.fillStyle = '#5a7a44'; c.beginPath(); c.ellipse(px - 12, py - 4, 12, 5, -0.5, 0, 6.3); c.fill(); c.beginPath(); c.ellipse(px + 12, py + 4, 12, 5, -0.5, 0, 6.3); c.fill(); }
        else { const sd = i % 2 ? 1 : -1; c.fillStyle = '#e8c63a'; for (let q = 0; q < 5; q++) { const an = q / 5 * 6.283 + i; c.beginPath(); c.ellipse(px + sd * 10 + Math.cos(an) * 5, py + Math.sin(an) * 5, 4.6, 3.2, an, 0, 6.3); c.fill(); } c.fillStyle = '#b8862a'; c.beginPath(); c.arc(px + sd * 10, py, 2.4, 0, 6.3); c.fill(); }
      }
    }
    c.globalAlpha = 1;
    const bunch = (dx, dy, rot, seed) => {                          // 面上的一把：梅枝、山茶
      c.save(); c.translate(dx, dy); c.rotate(rot); const q = JX.rng(seed);
      for (let i = 0; i < 5; i++) {
        const bx = -130 + i * 62 + q() * 20, by = -80 + q() * 40; c.strokeStyle = '#3a2a1e'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, by + 90); c.quadraticCurveTo(bx + 20, by + 30, bx + (q() - 0.5) * 60, by - 40); c.stroke();
        for (let j = 0; j < 7; j++) { const fx = bx + (q() - 0.5) * 76, fy = by - 30 + q() * 110, kd = q(), col = kd < 0.3 ? '#c8362e' : kd < 0.65 ? '#e9a6b4' : '#f6e9ec', rad = kd < 0.3 ? 16 : 9; c.fillStyle = col; c.beginPath(); c.arc(fx, fy, rad, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(43,31,25,0.5)'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = kd < 0.3 ? '#e9c24a' : '#b85a6a'; c.beginPath(); c.arc(fx, fy, rad * 0.3, 0, 6.3); c.fill(); }
      }
      c.restore();
    };
    bunch(-150 - 220 * k, -24 - 30 * k, -0.25 * k, 5); bunch(150 + 230 * k, -16 - 20 * k, 0.3 * k, 6);
    c.restore();
    c.strokeStyle = '#a8864a'; c.lineWidth = 12; c.beginPath(); c.ellipse(0, -40, 330, 110, 0, 0.05, Math.PI - 0.05); c.stroke(); c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.ellipse(0, -33, 330, 110, 0, 0.05, Math.PI - 0.05); c.stroke();
    c.restore();
    c.globalAlpha = 0.15 + 0.85 * k; c.fillStyle = '#f0dca8'; c.font = '26px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('底下一层：一串一串的小黄花', 650, 616); c.globalAlpha = 1;
    cutVig(c);
  }
  ST._drawJuan = drawJuan; ST._drawNa = drawNa; ST._drawBasket = drawBasket;
  /* 翻过来的壶盖：里头是光的。旁边虚虚的一只，是醉春楼的壶盖本来的样子 */
  function drawLid(c, k) {
    cutBg(c, '#4f4034', '#241a15');
    const lid = (x, y, r, a, mark) => {
      c.save(); c.translate(x, y); c.globalAlpha = a;
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(10, 18, r * 1.04, r * 0.5, 0, 0, 6.3); c.fill();
      const g = c.createRadialGradient(-r * 0.3, -r * 0.2, r * 0.1, 0, 0, r); g.addColorStop(0, '#e6f2e8'); g.addColorStop(0.7, '#a9c9b4'); g.addColorStop(1, '#6f8f7e'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r, r * 0.46, 0, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(30,40,34,0.9)'; c.lineWidth = 3; c.stroke();
      c.strokeStyle = 'rgba(30,40,34,0.75)'; c.lineWidth = r * 0.11; c.beginPath(); c.ellipse(0, 3, r * 0.66, r * 0.29, 0, 0, 6.3); c.stroke(); c.strokeStyle = '#d6e8da'; c.lineWidth = r * 0.07; c.stroke();        // 盖里一圈子口
      c.fillStyle = '#c4dccb'; c.beginPath(); c.ellipse(0, 5, r * 0.56, r * 0.235, 0, 0, 6.3); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-r * 0.2, -r * 0.02, r * 0.2, r * 0.06, -0.3, 0, 6.3); c.fill();
      if (mark) { c.save(); c.scale(1, 0.46); c.fillStyle = 'rgba(120,60,30,0.85)'; c.font = '600 ' + Math.round(r * 0.7) + 'px ' + P.KAI; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('春', 0, 12); c.strokeStyle = 'rgba(120,60,30,0.7)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 8, r * 0.5, 0, 6.3); c.stroke(); c.restore(); }
      c.restore();
    };
    /* 那把壶：没了盖 */
    c.save(); c.translate(250, 350);
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.ellipse(10, 196, 150, 30, 0, 0, 6.3); c.fill();
    c.fillStyle = P.hgrad(c, -130, 0, 260, [[0, '#6f8f7e'], [0.4, '#d8ece0'], [1, '#5f7f6e']]); c.strokeStyle = 'rgba(30,40,34,0.9)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-46, -150); c.lineTo(46, -150); c.bezierCurveTo(60, -100, 140, -40, 130, 60); c.bezierCurveTo(124, 150, 80, 190, 0, 192); c.bezierCurveTo(-80, 190, -124, 150, -130, 60); c.bezierCurveTo(-140, -40, -60, -100, -46, -150); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2a3a32'; c.beginPath(); c.ellipse(0, -150, 46, 12, 0, 0, 6.3); c.fill(); c.stroke();
    c.lineWidth = 16; c.strokeStyle = 'rgba(30,40,34,0.9)'; c.beginPath(); c.moveTo(120, -10); c.bezierCurveTo(190, -20, 200, -100, 230, -130); c.stroke(); c.lineWidth = 11; c.strokeStyle = '#a9c9b4'; c.stroke();
    c.lineWidth = 14; c.strokeStyle = 'rgba(30,40,34,0.9)'; c.beginPath(); c.moveTo(-110, -40); c.bezierCurveTo(-200, -60, -200, 80, -116, 90); c.stroke(); c.lineWidth = 9; c.strokeStyle = '#a9c9b4'; c.stroke();
    c.restore();
    lid(700 - 30 * k, 340, 112 + k * 22, 1, false);
    lid(1090, 250, 96, 0.16 + 0.5 * k, true);
    c.globalAlpha = 0.2 + 0.6 * k; c.fillStyle = '#f0dca8'; c.font = '26px ' + P.KAI; c.textAlign = 'center'; c.fillText('醉春楼的壶盖', 1090, 340); c.fillText('这一只：里头是光的', 700 - 30 * k, 440 + k * 12); c.globalAlpha = 1;
    cutVig(c);
  }
  ST._drawFeather = drawFeather; ST._drawLid = drawLid;
  /* ---------- 开坛特写 ---------- */
  ST._drawPry = (c, k) => drawPry(c, k);
  function drawPry(c, k) {                                         // k：0 刀刚插进封泥，1 整块封泥落下
    const w = 1300, h = 640;
    const bg = c.createRadialGradient(520, 260, 40, 650, 320, 800); bg.addColorStop(0, '#5a4636'); bg.addColorStop(0.5, '#2e2420'); bg.addColorStop(1, '#0e0b0a'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { c.save(); c.globalAlpha = 0.5 - i * 0.07; c.translate(120 + i * 250, 250 + (i % 2) * 30); P.jar(c, 0, 400, 2.4, { seed: 20 + i, text: '酒' }); c.restore(); }
    c.fillStyle = 'rgba(8,6,5,0.55)'; c.fillRect(0, 0, w, h);
    const gl = c.createRadialGradient(650, 200, 20, 650, 300, 520); gl.addColorStop(0, 'rgba(255,205,130,0.4)'); gl.addColorStop(1, 'rgba(255,205,130,0)'); c.fillStyle = gl; c.fillRect(0, 0, w, h);
    c.save(); c.translate(650, 1010); P.jar(c, 0, 0, 7.2, { seed: 3, sealed: false, label: false }); c.restore();
    /* 封泥：整块 */
    const lift = k * 150, tilt = k * 0.5, dx = k * 250;
    c.save(); c.translate(650 + dx, 410 + lift * 0.2 - Math.sin(k * Math.PI) * 120); c.rotate(tilt);
    c.beginPath(); c.moveTo(-138, 0); c.bezierCurveTo(-146, -124, 146, -124, 138, 0); c.quadraticCurveTo(0, 34, -138, 0); c.closePath();
    c.fillStyle = P.hgrad(c, -140, 0, 280, [[0, '#8b7453'], [0.35, '#d2b88c'], [1, '#735e42']]); c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 4; c.stroke();
    c.strokeStyle = '#6a4f30'; c.lineWidth = 12; c.beginPath(); c.ellipse(0, -4, 130, 24, 0, 0.1, Math.PI - 0.1); c.stroke();
    c.fillStyle = '#b5382a'; c.fillRect(-26, -100, 52, 92); P.vtext(c, '春', 0, -92, 46, '#1e1410', '600');
    c.restore();
    /* 酒刀：刀身七寸，断口是齐的 */
    const ang = -0.42 - k * 0.5;
    c.save(); c.translate(508 - k * 30, 404 - k * 40); c.rotate(ang); c.scale(0.64, 0.64);
    c.fillStyle = P.vgrad(c, 0, -24, 48, [[0, '#e9eef0'], [0.45, '#aab3b6'], [0.55, '#7c868a'], [1, '#c5cdd0']]); c.beginPath(); c.moveTo(-330, -22); c.lineTo(20, -24); c.lineTo(20, 24); c.lineTo(-330, 20); c.closePath(); c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-326, -12); c.lineTo(14, -14); c.stroke();
    c.strokeStyle = 'rgba(40,46,50,0.5)'; c.lineWidth = 1.5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(20, -22 + i * 11); c.lineTo(14 - (i % 2) * 6, -18 + i * 11); c.stroke(); }
    c.fillStyle = '#3a2a1e'; c.fillRect(-352, -34, 24, 68); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.strokeRect(-352, -34, 24, 68);
    c.fillStyle = '#4b3525'; c.fillRect(-640, -27, 288, 54); c.strokeRect(-640, -27, 288, 54);
    for (let i = 0; i < 13; i++) { c.strokeStyle = '#c8b48a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-630 + i * 22, -27); c.lineTo(-616 + i * 22, 27); c.stroke(); }
    /* 握刀的手与袖口 */
    c.fillStyle = '#4f6679'; c.beginPath(); c.moveTo(-720, -120); c.lineTo(-470, -70); c.lineTo(-460, 90); c.lineTo(-760, 130); c.closePath(); c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.9); c.lineWidth = 3; c.stroke();
    c.fillStyle = '#ebe3cf'; c.beginPath(); c.moveTo(-480, -72); c.lineTo(-462, -68); c.lineTo(-452, 88); c.lineTo(-470, 92); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ecd0ae'; c.beginPath(); c.moveTo(-462, -52); c.quadraticCurveTo(-400, -64, -384, -30); c.lineTo(-384, 34); c.quadraticCurveTo(-404, 66, -462, 62); c.closePath(); c.fill(); c.stroke();
    for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(-452 + i * 22, -40, 20, 72, 9); c.fillStyle = i % 2 ? '#e6c8a4' : '#ecd0ae'; c.fill(); c.strokeStyle = P.rgba('#2b221c', 0.8); c.lineWidth = 2.4; c.stroke(); }
    c.restore();
    c.globalCompositeOperation = 'multiply'; c.globalAlpha = 0.5; c.fillStyle = c.createPattern(P.grainTile(), 'repeat'); c.fillRect(0, 0, w, h); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    const vg = c.createRadialGradient(650, 320, 300, 650, 320, 780); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
  }

  /* 一场战斗输了两回以后，问一句要不要跳过（跳过就按打赢了往下演）。自动测试时总是“再来一次”。 */
  async function giveUp(lost) { return lost >= 2 && (await UI.choice('这一战打了 ' + lost + ' 回还没过。', ['再来一次', '跳过这一战，接着看故事'])) === 1; }

  /* ---------- 行菜 ----------
     0.5.2 起是最简单的样子：到出菜口端一回，先后送到两桌，走到跟前就算，不用按键、不用挑、不会错。
     （原来要记谁点了什么、从几盘里挑、还有第二轮，第一位试玩的人卡在这里过不去。） */
  const SERVE = [[7, '皇都春一角、洗手蟹、宋嫂鱼羹（免芫荽）'], [9, '琼花露一角、鹌子水晶脍、酒炊淮白鱼']];
  function tableAnchor(n) { const t = JX.hallTables[n - 1]; return W.byId['ta' + n] || W.add('ta' + n, { h: 150 }, t.x, t.y - 116, { vis: false, solid: false, pose: 'sit' }); }
  function serveRound() {
    const st = JX.state, pass = W.hots.find(h => h.id === 'pass'); let step = 0;      // 0：去出菜口；1、2：送第一、第二桌
    const cn = n => (n <= 10 ? '一二三四五六七八九十'[n - 1] : '十' + '一二三四五六七八九'[n - 11]) + '号桌';
    return new Promise(done => {
      pass.gx = pass.x; pass.gy = pass.y + 40; const passR = pass.r;                  // 路标领到出菜口跟前
      const hots = SERVE.map(([n]) => { const t = JX.hallTables[n - 1], h = { id: 'tb' + n, x: t.x, y: t.y - 30, r: 170, up: 170, verb: '上菜', n, gx: t.x - 140, gy: t.y - 30 }; W.hots.push(h); return h; });
      const target = () => (step === 0 ? pass : hots[step - 1]);
      const setObj = () => {
        if (step === 0) { W.objective = { text: '到出菜口端菜', at: { hall: { hot: 'pass' } }, how: '跟着地上的金色路标走过去就行，不用按键' }; UI.objective(W.objective.text, ['七号桌、九号桌的菜，一趟端齐']); }
        else { const [n, items] = SERVE[step - 1]; W.objective = { text: (step === 1 ? '把菜送到' : '再送到') + cn(n), at: { hall: { hot: 'tb' + n } }, how: '跟着地上的金色路标走到桌边就行，不用按键' }; UI.objective(W.objective.text, [items]); }
        pass.r = step === 0 ? passR : 0; hots.forEach((h, i) => { h.r = step === i + 1 ? 170 : 0; });      // 只有眼下要去的那一处才显示“回车”的小牌子
        W.guideAt = 0;
      };
      const arrive = () => {
        if (step === 0) { W.player.carry = 'tray'; JX.audio.sfx('tick'); step = 1; setObj(); return; }
        const n = SERVE[step - 1][0]; st.money += 30; UI.purse(st.money); JX.audio.sfx('coin'); W.bubble(tableAnchor(n), '对了对了！赏你的。', 2.2);
        if (++step > SERVE.length) { W.player.carry = null; finish(); } else setObj();
      };
      pass.act = () => { if (step === 0) arrive(); };
      hots.forEach((h, i) => { h.act = () => { if (step === i + 1) arrive(); }; });
      const tick = () => {                                                             // 走到跟前就算
        const p = W.player, t = target(); if (!p || W.locked || UI.modal) return;
        if (JX.dist(p.x, p.y, t.gx, t.gy) < (step === 0 ? 80 : 90) || (step > 0 && JX.dist(p.x, p.y, t.x, t.y) < 150)) arrive();
        else if (JX.auto && !p.path) p.path = W.findPath(p.x, p.y, t.gx, t.gy);       // 自动测试：自己走过去
      };
      (JX._upd = JX._upd || []).push(tick);
      function finish() { hots.forEach(h => W.hots.splice(W.hots.indexOf(h), 1)); JX._upd.splice(JX._upd.indexOf(tick), 1); pass.act = null; pass.r = passR; W.objective = null; UI.objective(null); W.locked = true; UI.roam(false); W.player.path = null; W.player.moving = false; setTimeout(done, 0); }
      setObj(); W.locked = false; UI.roam(true); UI.purse(st.money);
    });
  }
  JX.on('update', () => { if (W.autoPilot) W.autoPilot(); });
  /* 自动测试用：没人操作时，照着指引自己走、自己互动 */
  JX.on('update', () => {
    if (!JX.auto || W.autoPilot || W.locked || UI.modal || !W.player || JX.ended) return;
    const p = W.player, t = W.objTarget(); if (!t || p.path) return;
    if (t.ent) { if (JX.dist(p.x, p.y, t.ent.x, t.ent.y) < (t.ent.reach || 82) + 40) W.fire(t.ent.id); else p.path = W.findPath(p.x, p.y, t.x, t.y + 44); }
    else if (t.hot) { if (JX.dist(p.x, p.y, t.x, t.y) < (t.hot.r || 80) * 0.8) W.fire(t.hot.id); else p.path = W.findPath(p.x, p.y, t.x, t.y); }
    else p.path = W.findPath(p.x, p.y, t.x, t.y);
  });

  /* ---------- 演出 ---------- */
  ST._h = { cutIn, cutBg, cutVig, fighters, giveUp, until, ch1, ren, drawNa, drawHand };      // 后面各章的演出（story2.js 起）要用的几样工具
  ST.alias = (name, id) => { NAMES[name] = id; };                     // 对白里的另一个叫法（“俘虏”用水匪的小像）
  const HOOKS = ST.hooks = {
    async 入场一() { const st = JX.state; st.stage = 1; st.flags = {}; st.money = 0; W.setPlayer('jingzhe'); UI.purse(null); UI.tone(null); },
    async 开坛特写() {
      const box = UI.root().appendChild(JX.el('div', '', '<canvas width="1300" height="640"></canvas>')); box.id = 'cut';
      const c = box.firstChild.getContext('2d'); drawPry(c, 0); void box.offsetWidth; box.style.opacity = 1;
      await JX.sleep(JX.auto ? 0.05 : 1);
      await UI.narrate('酒窖。一排排泥封的酒坛。');
      await UI.narrate('一只手从腰后抽出一把短刀——刀身只有七寸，断口是齐的——往泥封边上一撬，一拧。');
      JX.audio.sfx('pop'); await JX.tween(JX.auto ? 0.05 : 0.7, k => drawPry(c, k), JX.ease.out);
      await UI.narrate('封泥整块落下，一点渣都没掉进酒里。');
      box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.7); box.remove();
    },
    async 阿桂上楼() { JX.state.flags.aguiUp = true; await W.walk('agui', 1580, 340, { speed: 230 }); W.remove('agui'); JX.audio.sfx('door'); },
    async 抱坛() { JX.state.flags.jar = true; W.remove('jar2'); W.player.carry = 'jar'; JX.audio.sfx('tick'); UI.toast('抱起了酒坛'); },
    async 放坛() { JX.state.flags.jarDone = true; W.player.carry = null; W.exitsOff['kitchen:hall'] = '掌柜的话还没说完。'; W.face('laochu', W.player); JX.audio.sfx('tick'); },
    async 四娘进来() { JX.audio.sfx('door'); const e = W.add('siniang', 'siniang', 1800, 680, { dir: 1, tag: '阮四娘' }); await W.walk(e, 1420, 700, { speed: 240, dir: 1 }); W.face(W.player, e); W.face('laochu', e); },
    async 四娘回堂() { JX.state.flags.s1done = true; delete W.exitsOff['kitchen:hall']; W.walk('siniang', 1800, 680, { speed: 240 }).then(() => W.remove('siniang')); },
    async 入场二() { const st = JX.state; st.stage = 2; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; UI.tone(null); },
    async 叫菜() { W.bubble('shikeA', '小二哥！', 1.6); JX.audio.sfx('tick'); await JX.sleep(JX.auto ? 0.02 : 0.8); },
    async 行菜() { await serveRound(); await UI.narrate('两桌都送对了。'); },
    async 范抬头() { const f = W.byId.fan; if (f) { f.pose = 'sit'; f.seat = 34; } },
    async 范趴下() { const f = W.byId.fan; if (f) f.pose = 'slump'; },
    async 入场三() { const st = JX.state; st.stage = 3; st.flags.daoGone = false; if (!W.player) W.setPlayer('jingzhe'); delete W.exitsOff['hall:door']; UI.purse(st.money); UI.tone(null); if (W.id === 'hall' && W.byId.siniang) W.face('siniang', W.player); },
    async 布置灯市() { W.face(W.player, 1250, 690); },
    async 老道走() { JX.state.flags.daoGone = true; const e = W.byId.laodao; if (e) { e.solid = false; W.walk(e, 2920, 1120, { speed: 150 }).then(() => W.remove('laodao')); } await JX.sleep(JX.auto ? 0.02 : 1.2); },
    async 看街角() { W.player.dir = 1; const q = W.byId.qier; W.focus = { x: q.x + 300, y: q.y + 60 }; await JX.sleep(JX.auto ? 0.02 : 1.6); },
    async 入忆一() { W.focus = null; UI.tone('sepia'); UI.purse(null); W.setPlayer('child', { carry: 'bundle', speedK: 0.62 }); W.load('snow', 'start'); },
    async 蹲下() { const p = W.player; await W.walk(p, 2170, 700, { speed: 120 }); p.dir = 0; p.pose = 'squat'; },
    async 小癞来() { const e = W.add('xiaolai', 'xiaolai', 2760, 760, { dir: 1, tag: '小癞' }); await W.walk(e, 2262, 706, { speed: 150, dir: 1 }); W.player.dir = 3; },
    async 出忆一() { UI.tone(null); W.setPlayer('jingzhe'); W.load('street', 'fromHall'); UI.purse(JX.state.money); W.player.dir = 1; },
    async 给兜子() { const q = W.byId.qier; await W.walk(W.player, q.x + 70, q.y + 6, { speed: 230, dir: 1 }); q.dir = 3; },
    async 夏离来() {
      const a = W.add('xiali', 'xiali', 2300, 700, { dir: 1, tag: '夏公子' }), b = W.add('huoji', 'huoji', 2390, 716, { dir: 1 });
      W.walk(W.player, 1350, 640, { speed: 230, dir: 3 }); W.walk(b, 1640, 690, { speed: 200, dir: 1 }); W.focus = { x: 1600, y: 700 };
      await W.walk(a, 1530, 664, { speed: 200, dir: 1 }); W.focus = null;
    },
    async 夏离过门槛() { await W.walk('xiali', 1440, 566, { speed: 170, dir: 2 }); W.face(W.player, 1440, 566); },
    async 夏离进门() { const a = W.byId.xiali, b = W.byId.huoji; JX.audio.sfx('door'); await JX.tween(JX.auto ? 0.05 : 0.6, k => { a.alpha = 1 - k; }); W.remove('xiali'); await W.walk(b, 1440, 566, { speed: 200 }); W.remove('huoji'); },
    /* —— 第四场 词会 —— */
    async 入场四() { const st = JX.state; st.stage = 4; st.flags.tray2 = false; st.flags.heDone = false; st.flags.sang = false; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; UI.purse(st.money); UI.tone(null); },
    async 端酒() { JX.state.flags.tray2 = true; W.player.carry = 'tray'; delete W.exitsOff['hall:stairs']; JX.audio.sfx('tick'); UI.toast('端起了二楼的酒'); },
    async 看小台() { W.focus = { x: 1200, y: 720 }; await JX.sleep(JX.auto ? 0.02 : 1.6); },
    async 喝彩() { JX.audio.sfx('coin'); [['cike', '好！'], ['cike2', '妙！'], ['cike3', '好一个\n“蓦然回首”！']].forEach(([id, t], i) => setTimeout(() => W.byId[id] && W.bubble(id, t, 2.2), i * 260)); await JX.sleep(JX.auto ? 0.02 : 1.6); },
    async 放下视线() { W.focus = null; },
    async 接拨子() {
      const q = W.byId.qiushui, p = W.player; JX.state.flags.sang = true; W.focus = { x: 1160, y: 780 };
      q.pose = null; await JX.sleep(JX.auto ? 0.02 : 0.5);                                               // 她起身
      const pick = W.add('pick', { h: 4 }, 1150, 800, { solid: false, k: 0, draw(g, e) { const yy = -86 + e.k * 80; g.save(); g.translate(-10 - e.k * 26, yy); g.rotate(e.k * 5); g.fillStyle = '#f4ecd8'; g.beginPath(); g.moveTo(0, -7); g.lineTo(6, 6); g.lineTo(-6, 6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.8)'; g.lineWidth = 1; g.stroke(); g.restore(); } });
      JX.tween(JX.auto ? 0.05 : 0.5, k => { pick.k = k; });
      await W.walk(p, 1112, 866, { speed: 640, dir: 2, straight: true });                             // 一步抢到台边
      JX.audio.sfx('tick'); W.remove('pick'); q.dir = 0; await JX.sleep(JX.auto ? 0.02 : 0.4);
    },
    async 上酒() { const p = W.player, h = W.byId.he; await W.walk(p, 1640, 742, { speed: 210, dir: 2 }); p.carry = null; JX.audio.sfx('tick'); W.focus = null; if (h) h.dir = 0; await JX.sleep(JX.auto ? 0.02 : 0.5); },
    async 朱印特写() {
      const box = UI.root().appendChild(JX.el('div', '', '<canvas width="1300" height="640"></canvas>')); box.id = 'cut';
      const c = box.firstChild.getContext('2d'); drawSeal(c, 0); void box.offsetWidth; box.style.opacity = 1;
      await JX.sleep(JX.auto ? 0.05 : 0.9);
      await JX.tween(JX.auto ? 0.05 : 1.6, k => drawSeal(c, k), JX.ease.out);
      await UI.narrate('他转身上酒。贺元度的案上摊着一册旧书，书页上一方朱印。惊蛰的眼睛扫过那方印，脚下慢了半步。');
      box.style.opacity = 0; await JX.sleep(JX.auto ? 0.05 : 0.7); box.remove();
    },
    async 贺目送() {
      const p = W.player, h = W.byId.he; JX.state.flags.heDone = true; delete W.exitsOff['floor2:up']; W.focus = null;
      await W.walk(p, 1900, 800, { speed: 170, dir: 3 }); if (h) h.dir = 3; await JX.sleep(JX.auto ? 0.02 : 0.9);
    },
    /* —— 第五场 听潮阁 —— */
    async 入场五() { const st = JX.state; st.stage = 5; st.flags.cup1 = false; st.flags.cup2 = false; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 看湖() { const p = W.player; W.focus = { x: 960, y: 520 }; await W.walk(p, 800, 620, { speed: 200, dir: 2 }); await JX.sleep(JX.auto ? 0.02 : 1.2); const x = W.byId.xiali; if (x) x.dir = 1; },
    async 摆杯() { const p = W.player; await W.walk(p, 800, 700, { speed: 200, dir: 3 }); JX.state.flags.cup1 = true; addCups(); JX.audio.sfx('tick'); },
    async 添杯() { JX.state.flags.cup2 = true; W.focus = null; const p = W.player; p.dir = 2; JX.audio.sfx('tick'); addCups(); const x = W.byId.xiali; if (x) await W.walk(x, 1130, 640, { speed: 170, dir: 1 }); W.face(p, x); },
    async 推银() { W.add('silver', { h: 4 }, 960, 723, { solid: false, draw(g) { g.save(); g.translate(96, -96); g.fillStyle = '#d9dde0'; g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(-9, -9, 0, -6); g.quadraticCurveTo(9, -9, 12, 0); g.quadraticCurveTo(0, 6, -12, 0); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.75)'; g.lineWidth = 1.1; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(-5, -5, 6, 1.6); g.restore(); } }); JX.audio.sfx('coin'); await JX.sleep(JX.auto ? 0.02 : 0.6); },
    async 收银() { await JX.sleep(JX.auto ? 0.02 : 1.1); W.remove('silver'); JX.audio.sfx('tick'); },
    /* —— 第六场 十二碗面 —— */
    async 入场六() { const st = JX.state; st.stage = 6; st.flags.thrown = false; st.flags.xueGone = false; st.flags.follow = false; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = 'tray'; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 巨响() { JX.audio.sfx('gong'); const c = W.cam; await JX.tween(JX.auto ? 0.03 : 0.5, k => { W.focus = { x: c.x + JX.W / 2 / c.z + Math.sin(k * 40) * 10 * (1 - k), y: c.y + JX.H / 2 / c.z + Math.cos(k * 33) * 8 * (1 - k) }; }); W.focus = null; },
    async 条凳飞过() {
      W.focus = { x: 1500, y: 1230 }; const e = W.byId.bench6; if (!e) return; const x1 = e.x, y1 = e.y; e.x = 1980; JX.audio.sfx('door');
      await JX.tween(JX.auto ? 0.03 : 0.7, k => { e.x = 1980 + (x1 - 1980) * k; e.y = y1 - 60 + 60 * k; e.z = Math.sin(k * Math.PI) * 150; }, JX.ease.out); e.z = 0; JX.audio.sfx('wrong');
      await JX.sleep(JX.auto ? 0.02 : 0.5);
    },
    async 护院上前() {
      const a = W.byId.huyuan, b = W.byId.huyuan2, t = W.byId.tingxue;
      await Promise.all([W.walk(a, 1672, 1258, { speed: 280, dir: 1, straight: true }), W.walk(b, 1676, 1294, { speed: 280, dir: 1, straight: true })]);
      JX.audio.sfx('wrong'); t.dir = 0;
      await JX.tween(JX.auto ? 0.03 : 0.36, k => { a.x = 1672 + k * 106; b.x = 1676 + k * 116; a.z = b.z = Math.sin(k * Math.PI) * 46; }); a.z = b.z = 0; a.pose = b.pose = 'squat'; JX.state.flags.thrown = true; JX.audio.sfx('door');
      await JX.sleep(JX.auto ? 0.02 : 0.5);
    },
    async 惊蛰下楼() { const p = W.player, t = W.byId.tingxue; p.carry = 'tray'; await W.walk(p, 1380, 1280, { speed: 330, dir: 3 }); if (t) t.dir = 1; W.face('siniang', p); },
    async 战一() {
      const p = W.player, t = W.byId.tingxue, B = JX.battle; p.dir = 3;
      await W.walk(t, 1640, 1280, { speed: 300, dir: 1, straight: true });
      const MV = {
        grab1: { name: '反手一带', tell: '她的手探向你的手腕——是要拿人', type: 'grab' },
        palm: { name: '连环掌', tell: '她沉肩，两掌一错——连环掌，又快又密', type: 'light', pow: 1.05 },
        grab2: { name: '探手来抓', tell: '她五指张开，手探过来——又是要拿人', type: 'grab' },
        press: { name: '一掌按下', tell: '她吸了一口气，掌心朝下——这一掌躲不开', type: 'heavy', pow: 1.3 },
      };
      const second = Math.random() < 0.5 ? MV.palm : MV.grab2;
      await B.run({
        goal: '不露武功，撑过三个回合', music: 'jiaofeng', wheel: false, zoom: 1.36, focus: { x: 1510, y: 1150 },
        allies: [{ ent: p, key: 'jingzhe', name: '陆惊蛰', hp: 120, spd: 12, atk: 0, def: 6, guardK: 0, cmds: [
          { id: 'tray', name: '托盘格挡', kind: 'guard', desc: '举起托盘接一下。挡得住掌，挡不住拿——让她抓住手腕就要吃亏。' },
          { id: 'bench', name: '借条凳闪开', kind: 'dodge', desc: '脚下勾过一条条凳，人往旁边一让。躲得开拿；又快又密的掌，只能躲开一半。' },
          { id: 'talk', name: '劝', kind: 'talk', say: '陆惊蛰：“小娘子，有话好说——”', desc: '她在气头上，未必听。听进去一点，下一手会轻些。', fx(b) { b.calm = true; } }] }],
        foes: [{ ent: t, key: 'tingxue', name: '耶律听雪', hp: 300, showHp: false, spd: 10, atk: 34, ai: b => (b.round === 1 ? MV.grab1 : b.round === 2 ? second : MV.press) }],
        allow(b) { return b.round === 1 ? { ids: ['bench'], hint: '她要拿你的手腕。拿，只能闪。' } : b.round >= 3 ? { ids: ['tray'], hint: '条凳已经踢远了。这一掌，只能接。' } : { hint: '看她的架势：沉肩是掌，探手是拿。掌要挡，拿要闪。' }; },
        autoPick(b, u, cmds) { return cmds.find(c => c.id === (b.round >= 3 || (b.round === 2 && second === MV.palm) ? 'tray' : 'bench')); },
        resolve(b, a, m, x, r) { if (b.calm && r.dmg) { r.dmg = Math.round(r.dmg * 0.5); } b.calm = false; return r; },
        async after(b, u) {
          if (u.side !== 'foe') return; const n = b.round++, r = b.last.r;
          if (n === 1) await B.talk(async () => { await UI.say('tingxue', '耶律听雪', '咦？你躲得挺准啊！', 'surprise'); await UI.say('jingzhe', '陆惊蛰', '碰巧，碰巧。', 'grin'); });
          else if (n === 2) await B.talk(() => UI.narrate(r.evade || (r.block && !r.dmg) ? '又让过去了。满堂的食客开始叫好。' : '这一下挨得结实。他晃了晃，托盘没掉。'));
          else if (n === 3) await B.talk(() => UI.narrate('第三回合。她一掌按在托盘上——盘里的蟹酿橙纹丝不动。她愣住了。'));
        },
        end(b) { return b.round > 3 ? 'win' : null; },
      });
      p.dir = 3; t.dir = 1; W.focus = { x: 1510, y: 1230 };
    },
    async 听雪去后厨() {
      const t = W.byId.tingxue, a = W.byId.huyuan, b = W.byId.huyuan2; JX.state.flags.xueGone = true; W.focus = null; W.player.carry = null;
      if (a) a.pose = null; if (b) b.pose = null;
      if (t) { await W.walk(t, 1180, 1180, { speed: 240 }); W.walk(t, 200, 680, { speed: 300 }).then(() => W.remove('tingxue')); }
      await JX.sleep(JX.auto ? 0.02 : 1.2);
    },
    /* —— 第七场 一壶酒 —— */
    async 入场七() { const st = JX.state, f = st.flags; st.stage = 7; f.follow = false; f.cup1 = f.cup2 = true; f.xueGone = true; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = 'tray'; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 罗二进门() {
      const e = W.add('luoer', 'luoer', 1440, 1440, { dir: 2, tag: '真州来客', solid: false }), p = W.player; JX.audio.sfx('door'); W.focus = { x: 1440, y: 1260 };
      await W.walk(e, 1440, 1330, { speed: 150, dir: 2 }); for (const d of [1, 3, 2]) { e.dir = d; await JX.sleep(JX.auto ? 0.02 : 0.45); }
      await W.walk(p, 1400, 1240, { speed: 220, dir: 0 }); W.focus = null;
    },
    async 跟上() { JX.state.flags.follow = 'luoer'; },
    async 擦肩() {
      const p = W.player, e = W.byId.luoer, g = W.add('ke', { h: 154, kind: 'robe', robe: '#3a3a44', trim: '#1c1c22', hair: 'futou', wide: 1.4 }, p.x + 430, p.y + 14, { dir: 1, solid: false });
      if (e) { e.path = null; e.moving = false; } p.dir = 3;
      await W.walk(g, p.x + 44, p.y + 12, { speed: 250, dir: 1, straight: true });
      JX.audio.sfx('tick'); const x0 = p.x; JX.tween(JX.auto ? 0.03 : 0.4, k => { p.x = x0 - Math.sin(k * Math.PI) * 12; }).then(() => { p.x = x0; });
      await W.walk(g, p.x - 60, p.y + 26, { speed: 250, dir: 1, straight: true });
      W.walk(g, 190, 400, { speed: 260 }).then(() => W.remove('ke'));
      await JX.sleep(JX.auto ? 0.02 : 0.7);
    },
    async 入座() {
      const p = W.player, e = W.byId.luoer; JX.state.flags.follow = false; W.focus = { x: 960, y: 640 };
      const a = W.walk(p, 800, 720, { speed: 210, dir: 3 }); if (e) { await W.walk(e, 780, 560, { speed: 190 }); await W.walk(e, 960, 590, { speed: 190, dir: 0, straight: true }); e.pose = 'sit'; e.seat = 34; } await a;
    },
    async 斟酒() {
      const p = W.player; p.carry = null; JX.audio.sfx('tick');
      W.add('pot', { h: 4 }, 960, 723, { solid: false, draw(g) { g.save(); g.translate(-18, -112); g.fillStyle = P.hgrad(g, -12, 0, 24, [[0, '#8fb2a0'], [0.4, '#d8ece0'], [1, '#7fa28e']]); g.beginPath(); g.moveTo(-6, -30); g.lineTo(6, -30); g.quadraticCurveTo(16, -14, 11, 0); g.lineTo(-11, 0); g.quadraticCurveTo(-16, -14, -6, -30); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.8)'; g.lineWidth = 1.2; g.stroke(); P.ellipse(g, 0, -31, 6.5, 2.6, '#a9c9b4', 'rgba(43,34,28,0.8)', 1); g.restore(); } });
      await JX.sleep(JX.auto ? 0.02 : 0.7);
      await W.walk(p, 440, 900, { speed: 200, dir: 3 });
    },
    async 罗二倒下() { const e = W.byId.luoer; JX.audio.sfx('wrong'); if (e) e.pose = 'slump'; await JX.sleep(JX.auto ? 0.02 : 0.9); JX.audio.sfx('tick'); },
    async 抢上去() { const p = W.player; await W.walk(p, 850, 610, { speed: 420, dir: 3 }); const x = W.byId.xiali; if (x) x.dir = 1; },
    async 雁翎特写() { await cutIn(drawFeather, ['他没了声息。惊蛰低头：手心里是一根雁翎，翎管上缠着半枚铜符。']); },
    async 壶盖特写() { await cutIn(drawLid, ['他去看那把酒壶，揭开壶盖，翻过来。']); },
    /* —— 第八场 后巷 —— */
    async 入场八() { const st = JX.state, f = st.flags; st.stage = 8; f.follow = 'xiali'; f.won2 = false; f.saber = false; f.fell = false; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 穿过后厨() { const p = W.player, x = W.byId.xiali, t = W.byId.tingxue; const a = W.walk(p, 1300, 800, { speed: 380, dir: 3 }); if (x) W.walk(x, 1220, 740, { speed: 380, dir: 3 }); await a; if (t) t.dir = 1; },
    async 黑衣人围上() { const p = W.player, x = W.byId.xiali; W.focus = { x: 1200, y: 700 }; const a = W.walk(p, 1040, 760, { speed: 240, dir: 3 }); if (x) W.walk(x, 980, 650, { speed: 240, dir: 3 }); await a; await Promise.all(['heiyi', 'heiyi2', 'heiyi3'].map((id, i) => W.walk(W.byId[id], 1340 + (i === 1 ? 70 : 0), 640 + i * 90, { speed: 200, dir: 1, straight: true }))); },
    async 抽刀() { const x = W.byId.xiali; JX.state.flags.saber = true; if (x) { x.pose = 'squat'; await JX.sleep(JX.auto ? 0.02 : 0.35); x.pose = null; x.carry = 'saber'; } JX.audio.sfx('tick'); await JX.sleep(JX.auto ? 0.02 : 0.4); },
    async 战二() {
      const B = JX.battle, p = W.player, x = W.byId.xiali, ids = ['heiyi', 'heiyi2', 'heiyi3'];
      const quick = { name: '快刀', tell: '刀尖晃着——快刀，要抢先手', type: 'light', pow: 1 }, chop = { name: '重劈', tell: '双手举刀过顶——要重劈下来', type: 'heavy', pow: 1.9, delay: 1.2 };
      for (let lost = 0; ;) {
        p.x = 1040; p.y = 760; p.dir = 3; p.pose = null; p.carry = 'staff'; x.x = 980; x.y = 650; x.dir = 3; x.pose = null; x.carry = 'saber';
        ids.forEach((id, i) => { const e = W.byId[id]; e.x = 1340 + (i === 1 ? 70 : 0); e.y = 640 + i * 90; e.dir = 1; e.vis = true; e.alpha = 1; });
        const r = await B.run({
          goal: '放倒三个黑衣人', music: 'jiaofeng', season: 0, seasonEvery: 5, zoom: 1.22, focus: { x: 1190, y: 690 },
          allies: fighters(p, x),
          foes: ids.map((id, i) => ({ ent: id, key: id, name: '黑衣人' + '甲乙丙'[i], hp: 60, spd: 10 - i * 0.7, atk: 17, def: 2, n: i, ai: (b, u) => (++u.n % 3 === 0 ? chop : quick) })),
        });
        if (r.result === 'win') break;
        await UI.narrate('眼前一黑。——不对，这一场还没完，再来。');
        if (await giveUp(++lost)) break;
      }
      JX.state.flags.won2 = true; p.carry = null; ids.forEach(id => W.remove(id)); W.focus = null; p.dir = 2; x.dir = 0;
    },
    async 屋顶来人() {
      const k = W.add('xieke', 'xieke', 1840, 116, { dir: 1, solid: false, tag: '？' }); W.focus = { x: 1300, y: 420 }; const x = W.byId.xiali; if (x) x.dir = 2; W.player.dir = 2;
      for (let i = 0; i < 5; i++) { await W.walk(k, 1840 - (i + 1) * 170, 116, { speed: 420, dir: 1, straight: true }); JX.audio.sfx(i % 2 ? 'wrong' : 'door'); }
      await JX.tween(JX.auto ? 0.03 : 0.5, q => { k.alpha = 1 - q; }); W.remove('xieke'); W.focus = null;
    },
    /* —— 第九场 屋顶 —— */
    async 入场九() { const st = JX.state, f = st.flags; st.stage = 9; f.follow = false; f.fell = false; f.saber = true; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = 'staff'; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 铁臂一撞() { const k = W.byId.xieke; W.focus = { x: 900, y: 640 }; JX.audio.sfx('gong'); if (k) { const x0 = k.x; await JX.tween(JX.auto ? 0.03 : 0.3, q => { k.x = x0 + Math.sin(q * 30) * 5 * (1 - q); }); k.x = x0; } },
    async 一拳碎瓦() {
      const k = W.byId.xieke, p = W.player, x0 = k.x, y0 = k.y; k.moving = true;
      await JX.tween(JX.auto ? 0.03 : 0.22, q => { k.x = x0 + (p.x + 120 - x0) * q; k.y = y0 + (p.y - y0) * q; }, JX.ease.out); JX.audio.sfx('gong');
      const px = p.x; JX.tween(JX.auto ? 0.03 : 0.3, q => { p.x = px - 70 * Math.sin(q * Math.PI / 2); p.z = 26 * Math.sin(q * Math.PI); }).then(() => { p.z = 0; });
      for (let i = 0; i < 7; i++) { const a = i * 0.9, id = 'shard' + i, e = W.add(id, { h: 2 }, k.x - 60, k.y + 6, { solid: false, q: 0, draw(g, me) { g.save(); g.globalAlpha = 1 - me.q; g.translate(Math.cos(a) * 80 * me.q, -Math.abs(Math.sin(a)) * 70 * me.q + 60 * me.q * me.q); g.rotate(a + me.q * 5); g.fillStyle = '#3a4058'; g.fillRect(-8, -5, 16, 10); g.restore(); } }); JX.tween(JX.auto ? 0.03 : 0.6, q => { e.q = q; }).then(() => W.remove(id)); }
      await JX.sleep(JX.auto ? 0.02 : 0.4); await JX.tween(JX.auto ? 0.03 : 0.3, q => { k.x += (x0 - k.x) * q; k.y += (y0 - k.y) * q; }); k.moving = false; k.x = x0; k.y = y0; k.dir = 1;
    },
    async 战三() {
      const B = JX.battle, p = W.player, x = W.byId.xiali, k = W.byId.xieke, STEP = 150;
      const jab = { name: '直拳', tell: '左拳虚晃——直拳，快', type: 'light', pow: 0.7 };
      const hook = { name: '重拳', tell: '沉腰，右拳收到肋下——要出重拳', type: 'heavy', pow: 2.1, delay: 1.15, pick: (b, pool) => pool.find(u => u.key === 'jingzhe') || pool[0] };
      /* 每一手的提示和建议（指引开着时光标先落在建议上）：没晃的时候，重拳来了就闪；晃了就打 */
      const rec = (b, u) => {
        const boss = b.units.find(q => q.key === 'xieke'), me = u.key === 'jingzhe';
        if (boss.stun) return { pick: me ? 'dian' : 'zhan', hint: '他站不稳了——趁现在打！' };
        if (!me) return { pick: 'ge', hint: '铁臂打不动。先格挡，等他站不稳。' };
        return boss.intent === hook ? { pick: 'bu', hint: '他要出重拳——用踏潮步闪开，把他往灯索那边引。' } : { pick: 'dian', hint: '铁臂打不动。这一手是直拳，等他出重拳再闪。' };
      };
      const place = () => { p.x = 600; p.y = 720; p.dir = 3; p.pose = null; p.carry = 'staff'; x.x = 540; x.y = 610; x.dir = 3; x.pose = null; x.carry = 'saber'; k.x = 1130; k.y = 660; k.dir = 1; k.vis = true; k.alpha = 1; };
      for (let lost = 0; ;) {
        place();
        let pos = 0, cup = false;
        const note = () => (pos >= 2 ? '脚下就是灯索' : '离灯索还有 ' + '两一'[pos] + ' 步');
        const r = await B.run({
          goal: '铁臂打不动。闪开重拳，把他引到灯索旁', music: 'pozhen', season: 0, seasonEvery: 5, zoom: 1.12, focus: { x: 1000, y: 640 },
          allies: fighters(p, x),
          foes: [{ ent: k, key: 'xieke', name: '蟹壳青', hp: 300, spd: 9.5, atk: 30, def: 10, boss: true, keep: true, n: 0, note: note(), ai: (b, u) => (++u.n % 2 ? jab : hook) }],
          allow: rec,
          autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id); },
          end(b) { return b.units.find(q => q.key === 'jingzhe').hp <= 0 ? 'lose' : null; },      // 只有他引得动蟹壳青；他倒了，这一场就算输，重来
          resolve(b, a, m, t, r2) {
            if (t.key === 'xieke' && !t.stun) return { evade: false, block: true, dmg: 0, iron: '铁臂' };
            if (a.key === 'xieke' && m === hook && r2.evade) b.lured = true;
            return r2;
          },
          async after(b, u) {
            const boss = b.units.find(q => q.key === 'xieke');
            if (b.lured) {
              b.lured = false;
              if (pos < 2) {
                pos++; boss.note = note(); JX.audio.sfx('door');
                await B.fx.tw(0.5, q => { b.units.forEach(v => { v.ent.x = v.home.x + STEP * q; }); W.focus = { x: 1000 + (pos - 1 + q) * STEP * 0.8, y: 640 }; }); b.units.forEach(v => { v.home.x += STEP; v.ent.x = v.home.x; });
                b.box.querySelector('.log').textContent = '他一拳打空，跟着逼过来一步——' + note() + '。';
              } else { boss.stun = 2; boss.note = '踩在灯索上，晃了'; JX.audio.sfx('wrong'); B.fx.floater(boss, '失衡', '#ffd27a'); b.box.querySelector('.log').textContent = '他一拳打空，一脚踩在灯索上——晃了。趁现在！'; const r0 = W.byId.rope; if (r0) { await B.fx.tw(0.4, q => { r0.k = 0.12 * Math.sin(q * Math.PI * 3) * (1 - q); }); r0.k = 0; } }
            }
            if (!boss.stun && pos >= 2) boss.note = note();
            if (!cup && boss.hp > 0 && boss.hp <= boss.hpMax / 2) {
              cup = true;
              const c = W.add('cup', { h: 2 }, boss.ent.x, boss.ent.y + 2, { solid: false, q: 0, draw(g, me) { g.save(); g.translate(-420 * (1 - me.q), 300 * (1 - me.q) - 40 - 120 * Math.sin(me.q * Math.PI)); g.rotate(me.q * 14); P.ellipse(g, 0, 0, 9, 7, '#d8ece0', 'rgba(43,34,28,0.8)', 1.2); g.restore(); } });
              await B.fx.tw(0.45, q => { c.q = q; }); W.remove('cup'); JX.audio.sfx('tick'); boss.stun = Math.max(boss.stun, 1) + 1; boss.note = '膝弯挨了一下，站不稳'; B.fx.floater(boss, '膝弯', '#ffd27a'); await B.fx.shake(boss);
              await B.talk(async () => { await UI.narrate('楼下一扇窗里飞出一只酒杯，正打在蟹壳青的膝弯上。他一晃。'); await UI.say('jingzhe', '陆惊蛰', '（吸了吸鼻子）……蓬莱春。', 'normal'); await UI.say('xiali', '夏离', '什么？', 'surprise'); await UI.say('jingzhe', '陆惊蛰', '没什么。欠账的人还了一点利息。', 'smile'); });
            }
          },
        });
        if (r.result === 'win') break;
        await UI.narrate('眼前一黑。——不对，这一场还没完，再来。');
        if (await giveUp(++lost)) { place(); break; }
        await UI.tutorial('再来一次', '他一<b>沉腰收拳</b>，阿蛰就用<b>踏潮步</b>；直拳来的那一手，再还手。<br>重拳打空三回，他就踩到<b>灯索</b>上了——那两手，两个人一起打。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令上，照着按回车就行。');
      }
      W.focus = { x: 1300, y: 660 };
    },
    async 坠河() {
      const k = W.byId.xieke, r0 = W.byId.rope, rp = W.sc.rope; if (!k) return; k.vis = true; k.alpha = 1; k.dir = 3; k.moving = true; JX.state.flags.fell = true;
      const x0 = k.x, y0 = k.y; await JX.tween(JX.auto ? 0.03 : 0.35, q => { k.x = x0 + (rp.x + 30 - x0) * q; k.y = y0 + (rp.y + 30 - y0) * q; }, JX.ease.out); JX.audio.sfx('gong');
      const x1 = k.x, y1 = k.y; JX.tween(JX.auto ? 0.03 : 1.3, q => { if (r0) r0.k = q; });
      await JX.tween(JX.auto ? 0.03 : 1.1, q => { k.x = x1 + 150 * q; k.y = y1 + 330 * q * q; k.alpha = 1 - q * q; }); k.moving = false; W.remove('xieke'); JX.audio.sfx('door');
      await JX.sleep(JX.auto ? 0.02 : 0.6);
    },
    async 差役上来() { addPosse(); W.focus = { x: 700, y: 660 }; const p = W.player, x = W.byId.xiali; p.carry = null; p.dir = 1; if (x) x.dir = 1; JX.audio.sfx('gong'); await JX.sleep(JX.auto ? 0.02 : 1); },
    /* —— 第十场 三天 —— */
    async 入场十() { const st = JX.state, f = st.flags; st.stage = 10; f.follow = false; f.fell = true; f.sang = true; if (!W.player) W.setPlayer('jingzhe'); W.player.carry = null; W.player.vis = true; UI.purse(st.money); UI.tone(null); },
    async 屋顶对峙() { const p = W.player, x = W.byId.xiali; p.x = 1160; p.y = 700; p.dir = 1; if (x) { x.x = 1100; x.y = 600; x.dir = 1; } W.focus = { x: 760, y: 660 }; W.camSnap = true; },
    async 堂上站位() { const p = W.player; p.x = 1440; p.y = 1164; p.dir = 0; p.carry = null; W.focus = { x: 1440, y: 1100 }; W.camSnap = true; },
    async 放银铤() {      // 剧本写的是“放在柜上”：她穿过半个大堂走到柜台前，镜头跟着
      const x = W.byId.xiali; if (!x) return; x.carry = null; W.focus = x;
      await W.walk(x, 1160, 1100, { speed: 330, straight: true }); await W.walk(x, 1160, 560, { speed: 330, straight: true }); await W.walk(x, 880, 506, { speed: 300, dir: 2, straight: true });
      W.focus = { x: 880, y: 560 };
      W.add('ingot', { h: 4 }, 846, 458, { solid: false, draw(g) { g.save(); g.translate(0, -104); g.fillStyle = 'rgba(30,18,10,0.35)'; g.beginPath(); g.ellipse(0, 9, 22, 5, 0, 0, 6.3); g.fill(); g.fillStyle = '#d9dde0'; g.beginPath(); g.moveTo(-20, 0); g.quadraticCurveTo(-15, -14, 0, -9); g.quadraticCurveTo(15, -14, 20, 0); g.quadraticCurveTo(0, 10, -20, 0); g.fill(); g.strokeStyle = 'rgba(43,34,28,0.8)'; g.lineWidth = 1.3; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(-8, -8, 9, 2.4); g.restore(); } });
      JX.audio.sfx('coin'); await JX.sleep(JX.auto ? 0.02 : 0.6); x.dir = 3;
    },
    async 听雪探头() { const t = W.byId.tingxue; if (t) { t.vis = true; t.x = 150; t.y = 688; t.dir = 3; } W.focus = { x: 520, y: 760 }; JX.audio.sfx('door'); await JX.sleep(JX.auto ? 0.02 : 1.1); },
    async 回到门口() { const z = W.byId.zhong; if (z) z.dir = 1; W.focus = { x: 1440, y: 1100 }; await JX.sleep(JX.auto ? 0.02 : 1.1); },
    async 栏杆边() { W.player.vis = false; W.player.x = 1180; W.player.y = 760; W.focus = { x: 1186, y: 1130, below: 236 }; W.camSnap = true; },      // 镜头探出栏杆外一截：两个人站在对白框上方，不被挡住
    async 带出门() { const p = W.player; p.vis = true; p.x = 1440; p.y = 700; p.dir = 0; W.focus = { x: 1440, y: 700 }; W.camSnap = true; const a = W.byId.cy1, b = W.byId.cy2; if (a) { a.x = 1376; a.y = 690; } if (b) { b.x = 1504; b.y = 690; } },
    async 回头看() { const p = W.player; await W.walk(p, 1440, 860, { speed: 110, dir: 0, straight: true }); p.dir = 2; await JX.tween(JX.auto ? 0.03 : 2.2, q => { W.focus = { x: 1440, y: 700 - 330 * q }; }); await JX.sleep(JX.auto ? 0.02 : 1.2); },
    async 老道走过() { const d = W.add('laodao', 'laodao', 760, 1010, { dir: 3, solid: false, tag: '卖历日的老道' }); await JX.tween(JX.auto ? 0.03 : 1.2, q => { W.focus = { x: 1440 - 240 * q, y: 370 + 520 * q }; }); await W.walk(d, 1240, 1010, { speed: 120, dir: 3, straight: true }); d.dir = 0; },
    async 老道走远() { const d = W.byId.laodao; if (d) W.walk(d, 2300, 1040, { speed: 120, straight: true }); await JX.sleep(JX.auto ? 0.02 : 1.6); },
    /* ================= 第一章《钗头凤》 ================= */
    async 入一一() { const st = JX.state, f = st.flags; st.stage = 11; f.follow = false; f.saber = false; f.fell = true; if (!W.player) W.setPlayer('jingzhe'); const p = W.player; p.carry = null; p.vis = true; p.pose = null; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 夏离等着() {
      const z = W.byId.zhong, x = W.byId.xiali, p = W.player;
      if (z) { await W.walk(z, 748, 590, { speed: 150, straight: true }); W.remove('zhong'); JX.audio.sfx('door'); }
      W.focus = { x: 1460, y: 660 }; await JX.sleep(JX.auto ? 0.02 : 1.3);
      await W.walk(p, 1490, 664, { speed: 230 }); if (x) { W.face(x, p.x, p.y); W.face(p, x.x, x.y); }
    },
    async 跟上夏离() { JX.state.flags.follow = 'xiali'; W.focus = null; const x = W.byId.xiali; if (x) x.solid = false; },
    async 入一二() { const st = JX.state, f = st.flags; st.stage = 12; f.follow = false; if (!W.player) W.setPlayer('jingzhe'); const p = W.player; p.carry = null; p.vis = true; p.pose = null; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 后厨站位() { const p = W.player, t = W.byId.tingxue; p.x = 1396; p.y = 838; p.dir = 3; /* 别摆进桌子的占位里，会走不动 */ if (t) { t.dir = 1; t.bark = null; } },
    async 鲍七进来() { const b = W.add('baoqi', 'baoqi', 1800, 690, { dir: 1, tag: '鲍七', solid: false }); JX.audio.sfx('door'); await W.walk(b, 1600, 700, { speed: 200, straight: true }); b.dir = 1; },
    async 捞壶() {
      const p = W.player, x = W.byId.xiali, b = W.byId.swill; JX.state.flags.follow = false;
      if (x) { x.path = null; W.walk(x, p.x + 110, p.y - 10, { speed: 220 }).then(() => { if (b) W.face(x, b.x, b.y); }); }
      p.pose = 'squat'; JX.audio.sfx('pop'); await JX.sleep(JX.auto ? 0.02 : 1.1); p.pose = null; JX.audio.sfx('tick');
    },
    /* 回想昨夜：借二楼回廊（夜里的样子正合适），旧绢色调 */
    async 入回想() {
      UI.tone('sepia'); UI.purse(null); const q0 = UI.quiet; UI.quiet = true; W.load('floor2', 'fromHall'); UI.quiet = q0;
      const p = W.player; p.x = 500; p.y = 440; p.dir = 3; p.carry = 'tray'; p.pose = null;
      W.add('luoer', 'luoer', 400, 452, { dir: 3, solid: false });
      const q = W.byId.qiushui; if (q) { q.pose = 'sit'; q.seat = 34; q.carry = 'pipa'; q.dir = 0; }
      W.focus = { x: 760, y: 560 }; W.camSnap = true; W.locked = true;
    },
    async 回想擦肩() {
      const p = W.player, e = W.byId.luoer;
      if (e) W.walk(e, 700, 452, { speed: 170, straight: true }); await W.walk(p, 800, 440, { speed: 170, straight: true, dir: 3 });
      const g = W.add('ke', { h: 154, kind: 'robe', robe: '#3a3a44', trim: '#1c1c22', hair: 'futou', wide: 1.4 }, p.x + 430, p.y + 14, { dir: 1, solid: false });
      await W.walk(g, p.x + 44, p.y + 12, { speed: 250, dir: 1, straight: true });
      JX.audio.sfx('tick'); const x0 = p.x; await JX.tween(JX.auto ? 0.03 : 0.4, k => { p.x = x0 - Math.sin(k * Math.PI) * 12; }); p.x = x0;
      W.walk(g, 180, 440, { speed: 250, straight: true }).then(() => W.remove('ke')); await JX.sleep(JX.auto ? 0.02 : 0.7);
    },
    async 看小台二() { W.focus = { x: 1080, y: 660 }; await JX.sleep(JX.auto ? 0.02 : 1.8); },
    async 出回想() {
      UI.tone(null); W.focus = null; const q0 = UI.quiet; UI.quiet = true; W.load('kitchen', 'fromHall'); UI.quiet = q0;
      const p = W.player, x = W.byId.xiali, t = W.byId.tingxue; p.carry = null; p.pose = null; p.x = 700; p.y = 836; p.dir = 3; if (x) { x.x = 810; x.y = 800; x.dir = 1; } if (t) { t.dir = 1; t.bark = null; }
      W.add('baoqi', 'baoqi', 1590, 740, { dir: 1, tag: '鲍七', solid: false }); UI.purse(JX.state.money);
    },
    async 入一三() { const st = JX.state, f = st.flags; st.stage = 13; f.follow = 'xiali'; f.tibi = false; if (!W.player) W.setPlayer('jingzhe'); const p = W.player; p.carry = null; p.vis = true; p.pose = null; UI.purse(st.money); UI.tone(null); W.focus = null; },
    async 验渣() { const p = W.player; p.dir = 2; JX.audio.sfx('page'); await JX.sleep(JX.auto ? 0.02 : 0.9); },
    async 题壁可看() { const h = W.hots.find(q => q.id === 'tibi'); if (h) { h.r = 170; h.act = () => { HOOKS.看题壁(); }; } },
    async 看题壁() {
      if (W.locked || UI.modal) return; W.locked = true; UI.roam(false); const f = JX.state.flags;
      await UI.narrate('白墙上有人题了一首诗，墨色已经旧了。');
      await UI.card('题壁', ['世味年来薄似纱，', '谁令骑马客京华。', '小楼一夜听春雨，', '深巷明朝卖杏花。', '矮纸斜行闲作草，', '晴窗细乳戏分茶。', '素衣莫起风尘叹，', '犹及清明可到家。'], '陆游《临安春雨初霁》');
      if (!f.tibi) {
        f.tibi = true;
        await UI.say('xiali', '夏离', '小楼一夜听春雨，深巷明朝卖杏花。——谁的诗？', 'normal');
        await UI.say('jingzhe', '陆惊蛰', '……一个老头子。在临安住过一个春天，住得不大痛快。', 'sad');
        await UI.say('xiali', '夏离', '你倒清楚。', 'cold');
        await UI.say('jingzhe', '陆惊蛰', '跑堂的，耳朵杂。', 'grin');
      }
      W.locked = false; UI.roam(true);
    },
    /* —— 第一章·四 团头 —— */
    async 入一四() { ch1(14, 'xiali'); JX.state.flags.sumoDone = false; },
    async 老癞认人() {
      const p = W.player, l = W.byId.laolai, x = W.byId.xiali; JX.state.flags.follow = false;
      await W.walk(p, 700, 766, { speed: 220 }); W.face(p, l);
      if (x) { x.path = null; await W.walk(x, 806, 790, { speed: 240 }); W.face(x, l); }
    },
    async 唿哨() { const k = W.byId.qg1, l = W.byId.laolai; JX.audio.sfx('page'); await JX.sleep(JX.auto ? 0.02 : 0.5); if (k && l) { k.pose = null; await W.walk(k, l.x - 60, l.y + 10, { speed: 200, straight: true, dir: 3 }); } await JX.sleep(JX.auto ? 0.02 : 0.7); },
    async 看露台() {
      const p = W.player, x = W.byId.xiali, l = W.byId.laolai, t = W.byId.tingxue; JX.state.flags.follow = false; W.focus = { x: 1840, y: 560 };
      if (l) { l.pose = null; l.tag = '老癞'; W.walk(l, 640, 772, { speed: 170, straight: true }).then(() => W.walk(l, 1930, 812, { speed: 170, straight: true, dir: 3 })); }      // 团头也踱过来看热闹
      const a = W.walk(p, 2150, 790, { speed: 220, dir: 2 }); if (x) { x.path = null; await W.walk(x, 2264, 806, { speed: 240, dir: 2 }); } await a; if (t) t.dir = 0;
    },
    async 撞倒山上台() {
      const z = W.add('zds', 'zhuangdaoshan', 2650, 640, { dir: 1, solid: false, tag: '撞倒山' }), t = W.byId.tingxue;
      await W.walk(z, 2566, 590, { speed: 170, straight: true }); await W.walk(z, 2300, 505, { speed: 170, straight: true, dir: 1 }); JX.audio.sfx('door'); if (t) t.dir = 3; await JX.sleep(JX.auto ? 0.02 : 0.4);
    },
    /* 相扑：只有两手。他扑过来就闪（闪开了他会站不稳），站不稳就摔；摔两回下台。指引开着时光标先落在该用的那一手上。 */
    async 战相扑() {
      const B = JX.battle, f = JX.state.flags, t = W.byId.tingxue, z = W.byId.zds || W.add('zds', 'zhuangdaoshan', 2300, 505, { dir: 1, solid: false, tag: '撞倒山' });
      const MV = { pu: { name: '猛扑', tell: '他压低身子，两臂张开——要整个人扑过来', type: 'heavy', pow: 1.2 }, bao: { name: '抱腰', tell: '他两手往下一探——要来抱你的腰', type: 'grab', pow: 1 } };
      const foe = b => b.units.find(u => u.side === 'foe');
      for (let lost = 0; ;) {
        t.x = 2100; t.y = 505; t.dir = 3; t.pose = null; t.z = 0; z.x = 2300; z.y = 505; z.dir = 1; z.vis = true; z.alpha = 1; z.pose = null;
        const r = await B.run({
          goal: '替听雪打：把“撞倒山”摔下台', music: 'jiaofeng', wheel: false, zoom: 1.3, focus: { x: 2200, y: 480 },
          allies: [{ ent: t, key: 'tingxue', name: '耶律听雪', hp: 100, spd: 10, atk: 30, def: 4, cmds: [
            { id: 'shan', name: '闪', kind: 'dodge', desc: '脚下一滑，让到一边。他扑过来、抱过来都躲得开；他扑了空，就站不稳。' },
            { id: 'shuai', name: '摔', kind: 'attack', type: 'grab', pow: 1.3, desc: '抢进去，借他的力一带。要等他站不稳的时候才摔得动。' }] }],
          foes: [{ ent: z, key: 'zds', name: '撞倒山', hp: 100, spd: 10, atk: 26, def: 2, keep: true, n: 0, ai: (b, u) => (u.n++ % 2 ? MV.bao : MV.pu) }],
          allow(b) { const o = foe(b); return o.stun ? { pick: 'shuai', hint: '他扑空了，脚下不稳——就是现在：摔！' } : { pick: 'shan', hint: (o.intent && o.intent.type === 'grab' ? '他要来抱腰。' : '他要扑过来。') + '先闪——等他扑空。' }; },
          autoPick(b, u, cmds) { return cmds.find(c => c.id === (foe(b).stun ? 'shuai' : 'shan')); },
          resolve(b, a, m, x, r) {
            if (a.side === 'foe' && r.evade) { a.stun = 1; b.missed = (b.missed || 0) + 1; }
            if (a.side === 'ally' && m.id === 'shuai') { if (!x.stun) { r.dmg = 0; r.iron = '纹丝不动'; } else b.thrown = (b.thrown || 0) + 1; }
            return r;
          },
          async after(b, u) {
            if (u.side === 'foe' && b.missed === 1 && !b.said1) { b.said1 = true; await B.talk(() => UI.narrate('撞倒山扑了个空，往前冲出去三步，险些自己掉下台。台下哄地笑了。')); }
            else if (u.side === 'ally' && b.thrown === 1 && !b.said2 && foe(b).hp > 0) { b.said2 = true; await B.talk(async () => { await UI.narrate('她抢进去，肩膀一顶，手上一带——两百斤的汉子横着摔在毡子上。'); await UI.say('tingxue', '耶律听雪', '起来！还没完呢！', 'grin'); }); }
            else if (u.side === 'ally' && b.last && b.last.r.iron && !b.said3) { b.said3 = true; await B.talk(() => UI.narrate('她一头撞上去，对面纹丝不动。——他还站得稳的时候，摔不动。')); }
          },
        });
        if (r.result === 'win') break;
        await UI.narrate('她被一把推下了台，在人堆里打了个滚，又跳了上去。——再来。');
        if (await giveUp(++lost)) break;
      }
      /* 最后一下：整个人飞出台沿，落在看客堆里 */
      f.sumoDone = true; W.focus = { x: 1840, y: 560 }; W.camSnap = true; t.dir = 3; z.vis = true; z.alpha = 1;
      const x0 = z.x, y0 = z.y; JX.audio.sfx('wrong');
      await JX.tween(JX.auto ? 0.03 : 0.7, k => { z.x = x0 + (2430 - x0) * k; z.y = y0 + (726 - y0) * k; z.z = Math.sin(k * Math.PI) * 150; }, JX.ease.out); z.z = 0; z.pose = 'squat'; z.dir = 0; JX.audio.sfx('door');
      ['gz8', 'gz9'].forEach((id, i) => { const g = W.byId[id]; if (g) W.walk(g, g.x + (i ? 76 : -66), g.y + 22, { speed: 260, straight: true, dir: i ? 1 : 3 }); });
      t.dir = 0; await JX.sleep(JX.auto ? 0.02 : 0.6);
    },
    async 听雪下台() {
      const t = W.byId.tingxue, p = W.player, l = W.byId.laolai; if (!t) return; t.carry = 'coins';
      const x0 = t.x, y0 = t.y, x1 = p.x - 100, y1 = p.y - 2; JX.audio.sfx('pop');
      await JX.tween(JX.auto ? 0.03 : 0.6, k => { t.x = x0 + (x1 - x0) * k; t.y = y0 + (y1 - y0) * k; t.z = Math.sin(k * Math.PI) * 110; }); t.z = 0; t.dir = 3; p.dir = 1;
      if (l && l.x < 1900) { l.path = null; l.pose = null; await W.walk(l, 1930, 812, { speed: 420, straight: true, dir: 3 }); }
    },
    async 听雪回楼() {
      const t = W.byId.tingxue; JX.state.flags.follow = 'xiali'; W.focus = null; W.player.dir = 3;
      if (t) W.walk(t, 1180, 800, { speed: 250, straight: true }).then(() => W.remove('tingxue'));
      await JX.sleep(JX.auto ? 0.02 : 0.9);
    },
    /* —— 第一章·五 软红院 —— */
    async 入一五() { ch1(15, false); JX.state.flags.qs = 0; JX.state.flags.bookGone = false; },
    async 夏离放银() { const x = W.byId.xiali; if (x) await W.walk(x, 262, 716, { speed: 200, dir: 1 }); JX.audio.sfx('coin'); await JX.sleep(JX.auto ? 0.02 : 0.5); if (x) x.dir = 3; },
    async 崔妈妈让路() { const c = W.byId.cuimama; if (c) c.dir = 0; JX.state.flags.follow = 'xiali'; },
    async 到里间() { const p = W.player, x = W.byId.xiali; JX.state.flags.follow = false; const a = W.walk(p, 1310, 752, { speed: 200, dir: 3 }); if (x) { x.path = null; W.walk(x, 1200, 808, { speed: 220, dir: 3 }); } await a; },
    async 阑珊转身() { const q = W.byId.qiushui; if (q) { q.pose = null; q.x = 1410; q.y = 676; q.dir = 1; } JX.audio.sfx('tick'); await JX.sleep(JX.auto ? 0.02 : 0.6); },
    /* 对下片：两回，各三句里挑一句。挑错了她只说一句，那一句拿掉，再挑；不罚。指引开着时光标先落在对的那一句上。 */
    async 对句() {
      const G = JX.settings.guide;
      await UI.card('墙上的半首', ['不是爱风尘，', '似被前缘误。', '花落花开自有时，', '总赖东君主。'], '下片空着');
      await UI.narrate('上片四句，韵脚落在“误”和“主”上。下片要接得上意思，也得落在这个韵上。');
      const ask = async (q, opts, right, wrong) => {
        let list = opts.slice();
        for (;;) {
          const at = list.indexOf(right), k = await UI.choice(q, list, { top: 520, sel: G ? at : 0, auto: at, sub: G ? '指引开着：光标已经停在对的那一句上，按回车就行' : '看韵脚：要和“误”“主”押得上' });
          if (k === at) return;
          await UI.say('qiushui', '阑珊', wrong[list[k]], 'normal'); list = list.filter((s, i) => i !== k);
        }
      };
      await ask('下片头两句是——', ['山盟虽在，锦书难托。', '去也终须去，住也如何住。', '二十四桥仍在，波心荡、冷月无声。'], '去也终须去，住也如何住。',
        { '山盟虽在，锦书难托。': '那是《钗头凤》。说的是别人家的事。', '二十四桥仍在，波心荡、冷月无声。': '那是扬州的月亮。奴问的是这面墙。' });
      await ask('结句是——', ['蓦然回首，那人却在，灯火阑珊处。', '小楼一夜听春雨，深巷明朝卖杏花。', '若得山花插满头，莫问奴归处。'], '若得山花插满头，莫问奴归处。',
        { '蓦然回首，那人却在，灯火阑珊处。': '那是奴昨夜唱的。小二哥记性好，只是记错了地方。', '小楼一夜听春雨，深巷明朝卖杏花。': '春雨杏花，是好句子。不是这一首的。' });
      await UI.say('jingzhe', '陆惊蛰', '去也终须去，住也如何住。若得山花插满头，莫问奴归处。', 'normal');
      await UI.card('卜算子', ['不是爱风尘，', '似被前缘误。', '花落花开自有时，', '总赖东君主。', '去也终须去，', '住也如何住。', '若得山花插满头，', '莫问奴归处。'], '严蕊');
    },
    /* 怎么求她：三样都说得通，回答不一样，记一笔好感（f.qs：2 最好，0 最差），不影响往下走 */
    async 求她() {
      const f = JX.state.flags;
      const k = await UI.choice('怎么对她说？', ['照实说：三天拿不出真凶，死的是我', '不求她上堂，只求一句实话', '拿话激她：是没看见，还是不敢说'], { sub: '三样都说得通，她的回答不一样' });
      if (k === 0) {
        await UI.say('jingzhe', '陆惊蛰', '三天拿不出真凶，我死，保我的人同罪。整座楼里看见那一下的，只有姑娘。', 'normal');
        await UI.say('qiushui', '阑珊', '小二哥倒是不绕弯子。', 'normal');
        await UI.narrate('她垂下眼，手指在弦上按了一下，没有出声。'); f.qs = 1;
      } else if (k === 1) {
        await UI.say('jingzhe', '陆惊蛰', '我不求姑娘上堂。只求一句实话：昨晚拐角上，是个什么人。往后的事，我自己去办。', 'normal');
        await UI.say('qiushui', '阑珊', '实话说出了口，就收不回去了。小二哥是明白人。', 'normal');
        await UI.narrate('她说这话的时候，头一回正眼看了他。'); f.qs = 2;
      } else {
        await UI.say('jingzhe', '陆惊蛰', '姑娘是没看见，还是看见了不敢说？', 'smirk');
        await UI.say('qiushui', '阑珊', '小二哥这话，问得很好。', 'cold');
        await UI.narrate('她笑了一下，很淡。越是这样，越是动了气。'); f.qs = 0;
      }
    },
    async 接书() { const q = W.byId.qiushui; W.remove('shu'); JX.state.flags.bookGone = true; if (q) { q.carry = 'book'; q.dir = 1; } JX.audio.sfx('page'); await JX.sleep(JX.auto ? 0.02 : 0.4); },
    async 翻书() {
      const p = W.player, q = W.byId.qiushui; if (q) q.carry = null; p.carry = 'book'; JX.audio.sfx('page');
      await UI.narrate('蓝布函套，里头是一册旧刻的集子，纸已经黄了。他翻开卷首。');
      await cutIn((c, k) => drawSeal(c, k, { txt: true }), ['卷首右下角，一方朱印。', '三个字：老学庵。']);
    },
    /* —— 第一章·六 忆二 抄家 —— */
    async 入一六() { const st = JX.state; st.stage = 16; st.flags.follow = false; W.focus = null; W.raid = 0; UI.tone('sepia'); UI.purse(null); W.setPlayer('child', { speedK: 0.7 }); },
    async 父亲考书() { const p = W.player; await W.walk(p, 960, 754, { speed: 150, dir: 2 }); },
    async 钤印() { JX.audio.sfx('tick'); await cutIn((c, k) => drawSeal(c, 0.5 + k * 0.5, { txt: true, fresh: true, fade: k }), ['印揭起来。纸上三个朱红的字：老学庵。'], 1.8); },
    async 靴声() {
      const fa = W.byId.fuqin, p = W.player;
      for (let i = 0; i < 4; i++) { JX.audio.sfx('door', 0.4 + i * 0.15); await JX.sleep(JX.auto ? 0.01 : 0.34); }
      W.raid = JX.time; if (fa) fa.dir = 1; p.dir = 1; await JX.sleep(JX.auto ? 0.02 : 1);
    },
    async 母亲进来() {
      const p = W.player, m = W.add('muqin', 'lumu', 1625, 580, { dir: 0, solid: false, tag: '母亲' }); JX.audio.sfx('page');
      await W.walk(m, 1625, 700, { speed: 320, straight: true }); await W.walk(m, p.x + 74, p.y + 6, { speed: 320, straight: true, dir: 1 });
      p.dir = 3; p.carry = 'bundle'; JX.audio.sfx('tick'); await JX.sleep(JX.auto ? 0.02 : 0.5);
      const a = W.walk(p, 1340, 782, { speed: 190, straight: true, dir: 3 }); await W.walk(m, 1250, 778, { speed: 190, straight: true, dir: 3 }); await a;
      W.blocks.push([0, 560, 1296, 400]);                           // 回不去了：母亲挡在身后
      raidIn();
    },
    async 回头() {
      const p = W.player, fa = W.byId.fuqin, a = W.byId.cy1, b = W.byId.cy2, d = W.byId.cy3, m = W.byId.muqin; p.dir = 1; p.path = null;
      const put = (e, q, dir) => { if (e) { e.path = null; e.moving = false; e.x = q[0]; e.y = q[1]; e.dir = dir; } };
      put(a, RAID.a, 1); put(b, RAID.b, 1); put(d, RAID.d, 3); put(m, [1650, 784], 1);
      if (fa) { fa.out = true; fa.pose = null; put(fa, RAID.fa, 1); }
      W.add('beiying', { h: 154, kind: 'robe', robe: '#4a5550', trim: '#252b28', inner: '#e9e2d0', hair: 'gaojin', wide: 1.7 }, 1150, 612, { dir: 2, solid: false });
      W.add('cy4', 'chaiyi', 1262, 648, { dir: 1, solid: false, carry: 'torch' });
      /* 父亲被夹着往外走，走得很慢 */
      [[fa, 250, 790], [a, 170, 784], [b, 334, 798]].forEach(([e, x, y]) => { if (e) W.walk(e, x, y, { speed: 46, straight: true, dir: 1 }); });
    },
    async 翻书的手() { JX.audio.sfx('page'); await cutIn(drawHand, ['火把底下，只看得见一只翻书的手。翻得很慢，像是很爱惜。'], 2.6); },
    /* —— 第一章·七 一方印 —— */
    async 入一七() { const p = ch1(17, false); p.carry = 'book'; },
    async 收书() { const p = W.player; p.carry = null; JX.audio.sfx('page'); JX.state.flags.follow = 'xiali'; await JX.sleep(JX.auto ? 0.02 : 0.4); },
    /* —— 第一章·八 架阁库 —— */
    async 入一八() { ch1(18, false); },
    async 接灯() { const p = W.player, z = W.byId.zhong; p.carry = 'lantern'; if (z) { z.carry = null; z.dir = 3; } JX.audio.sfx('tick'); await JX.sleep(JX.auto ? 0.02 : 0.4); },
    /* 巡更的灯从窗外过：他自己掩了灯蹲下，等光过去。不用玩家按什么，也不会失败 */
    async 巡更() {
      const p = W.player; p.path = null; p.moving = false; JX.audio.sfx('bang'); await JX.sleep(JX.auto ? 0.02 : 0.5);
      p.pose = 'squat'; p.carry = null; p.dir = 0; W.patrol = JX.time; W.focus = { x: p.x + 60, y: 640 };
      JX.sleep(JX.auto ? 0.01 : 2.6).then(() => { if (W.id === 'jiage') JX.audio.sfx('bang', 0.7); });
    },
    async 巡更过去() { await JX.sleep(JX.auto ? 0.02 : 0.9); const p = W.player; p.pose = null; p.carry = 'lantern'; W.focus = null; JX.audio.sfx('bang', 0.35); await JX.sleep(JX.auto ? 0.02 : 0.3); },
    async 抽卷() { const p = W.player, z = W.byId.zhong; p.dir = 2; JX.audio.sfx('page'); if (z) W.walk(z, 2040, 716, { speed: 230 }); await JX.sleep(JX.auto ? 0.02 : 0.6); },      // 钟推官这时候从门口慢慢走过来
    async 看卷() { await cutIn(drawJuan, ['宝祐四年，秋。太学博士陆文渊，通敌。', '往下是抄没的清单。田宅、器物，一行一行。', '末一行：籍没书籍，交贺元度点检。'], 2.6); },
    async 看信() { JX.audio.sfx('page'); await cutIn(drawNa, ['卷里还夹着一页信，是当年的“物证”。', '字像极了父亲。一笔一画，像得叫人发冷。', '只有捺笔。信上的每一捺，收尾都往上一挑。', '父亲写捺，是平平地送出去的。他从不这样。'], 2.8); },
    async 钟推官过来() { const z = W.byId.zhong, p = W.player; if (z) { z.path = null; z.moving = false; z.onArrive = null; z.x = p.x - 150; z.y = p.y + 50; W.face(z, p); W.face(p, z); } await JX.sleep(JX.auto ? 0.02 : 0.3); },
    /* —— 第一章·九 湖上 —— */
    async 入一九() { const p = ch1(19, false); p.draw = drawPunt; p.face = 3; p.speedK = 0.9; },
    async 离岸() { const p = W.player; JX.audio.sfx('splash'); await W.walk(p, 660, 1110, { speed: 100, straight: true }); p.face = 3; },
    async 俯瞰湖面() { W.godOn = true; await JX.sleep(JX.auto ? 0.02 : 1.8); },
    async 收俯瞰() { W.godOn = false; await JX.sleep(JX.auto ? 0.02 : 0.9); },
    async 水上指引() { if (W.objective) W.objective.how = '跟着水面上的金色路标撑过去'; W.guideAt = 0; },
    async 靠船() { const p = W.player; p.path = null; JX.audio.sfx('door'); await W.walk(p, 2330, 808, { speed: 90, straight: true }); p.face = 3; p.dir = 3; await JX.sleep(JX.auto ? 0.02 : 0.5); },
    /* —— 第一章·十 梅花翅 —— */
    async 入一十() { const p = ch1(20, 'xiali'); p.carry = 'case'; },
    async 阑珊进舱() {
      const q = W.byId.qiushui, h = W.byId.xiaohuan, gone = (e, id) => JX.tween(JX.auto ? 0.03 : 0.4, k => { e.alpha = 1 - k; }).then(() => W.remove(id));
      if (h) W.walk(h, 700, 646, { speed: 190 }).then(() => gone(h, 'xiaohuan'));
      if (q) { await W.walk(q, 724, 646, { speed: 170 }); q.dir = 2; JX.audio.sfx('page'); await gone(q, 'qiushui'); }
    },
    async 认篮子() { const p = W.player, m = W.byId.maihua, x = W.byId.xiali; JX.state.flags.follow = false; if (m) W.face(p, m); if (x) { x.path = null; W.walk(x, p.x - 76, p.y + 54, { speed: 220 }).then(() => { if (m) W.face(x, m); }); } await JX.sleep(JX.auto ? 0.02 : 0.3); },
    async 拨花() { JX.audio.sfx('page'); await cutIn(drawBasket, ['面上是红梅和山茶。拨开——', '底下压着几串小黄花，一串一串的，开得正好。'], 2.2); },
    async 梅花翅现身() {
      const m0 = W.byId.maihua, p = W.player, x = W.byId.xiali; if (!m0) return; const x0 = m0.x, y0 = m0.y;
      W.remove('maihua'); const m = W.add('meihuachi', 'meihuachi', x0, y0, { dir: 1, tag: '梅花翅', solid: false });
      W.add('lan', { h: 30 }, x0 - 34, y0 + 8, { solid: false, draw(g) { P.shadow(g, 0, 0, 24, 6, 0.4); g.save(); g.rotate(0.5); g.fillStyle = P.hgrad(g, -20, 0, 40, [[0, '#8a6a3a'], [0.5, '#c9a86a'], [1, '#7a5a30']]); g.beginPath(); g.moveTo(-20, -22); g.lineTo(20, -22); g.quadraticCurveTo(18, 0, 0, 0); g.quadraticCurveTo(-18, 0, -20, -22); g.closePath(); g.fill(); g.strokeStyle = 'rgba(43,31,25,0.85)'; g.lineWidth = 1.2; g.stroke(); g.restore(); [[-26, -8, '#e9a6b4'], [-36, -2, '#c8362e'], [-30, 4, '#f6e9ec'], [-44, 6, '#e0c040'], [-52, 0, '#e0c040']].forEach(q => P.ellipse(g, q[0], q[1], 4, 3.4, q[2], 'rgba(43,31,25,0.6)', 0.6)); } });
      W.focus = { x: 1800, y: 700 }; JX.audio.sfx('pop');
      await JX.tween(JX.auto ? 0.03 : 0.6, k => { m.x = x0 + (2040 - x0) * k; m.y = y0 + (746 - y0) * k; m.z = Math.sin(k * Math.PI) * 150; }); m.z = 0; m.dir = 1; JX.audio.sfx('splash'); rockBoats(0.8);
      p.carry = 'pole'; const a = W.walk(p, 1560, 800, { speed: 260, dir: 3 }); if (x) { x.path = null; W.walk(x, 1500, 700, { speed: 260, dir: 3 }).then(() => { x.carry = 'saber'; }); } await a;
    },
    /* 首领战：她站稳的时候够不着。她要跳船，就把船晃起来——落脚不稳，这时候两个人一起打。
       每一手的提示和建议都写在指令框里；指引开着时光标先落在建议的那一手上。 */
    async 战梅花() {
      const B = JX.battle, p = W.player, x = W.byId.xiali, m = W.byId.meihuachi;
      const SPOT = [[2040, 746], [2380, 656]], boss = b => b.units.find(u => u.key === 'meihuachi');
      const dart = { name: '梅花镖', tell: '指缝里夹着三枚镖——要打过来，快', type: 'light', pow: 1.3, reach: 0, pick: (b, pool) => pool.find(u => u.key === 'jingzhe') || pool[0], pre: (b, u, t) => throwDarts(u.ent, t.ent) };
      const leap = { name: '腾挪', kind: 'wait', tell: '脚尖点着船帮——要跳到另一条船上去', say: '梅花翅脚尖一点，往另一条船上跳——', fx: async (b, u) => {
        const e = u.ent, to = 1 - u.at, tx = SPOT[to][0], ty = SPOT[to][1], x0 = e.x, y0 = e.y; JX.audio.sfx('page'); e.dir = tx > x0 ? 3 : 1;
        await B.fx.tw(0.5, q => { e.x = x0 + (tx - x0) * q; e.y = y0 + (ty - y0) * q; e.z = Math.sin(q * Math.PI) * 140; }); e.z = 0; e.dir = 1; u.at = to; u.home = { x: tx, y: ty, dir: 1 };
        if (b.rock) { b.rock = false; W.rocking = false; u.stun = 3; e.pose = 'squat'; u.note = '落脚的船正晃着——站不稳'; b.slips = (b.slips || 0) + 1; JX.audio.sfx('wrong'); B.fx.floater(u, '脚下一滑', '#ffd27a'); await rockBoats(0.8); } else u.note = '';
      } };
      const rock = (name, desc, say) => ({ id: 'huang', name, kind: 'talk', desc, say, fx: async (b, u) => { b.rock = true; W.rocking = true; JX.audio.sfx('splash'); B.fx.floater(u, '船晃起来了', '#bfe3d0'); boss(b).note = '两条小船都在晃'; await rockBoats(0.7); } });
      const rec = (b, u) => {
        const o = boss(b), me = u.key === 'jingzhe';
        if (o.stun) return { pick: me ? 'dian' : 'zhan', hint: '她脚下不稳，够得着了——趁现在打！' };
        if (o.intent === leap) return b.rock ? { pick: me ? 'bu' : 'ge', hint: '船已经晃起来了，等她跳。这一手先稳住。' } : { pick: 'huang', hint: '她要跳船——把船晃起来！她落脚不稳，就够得着了。' };
        if (me) return { pick: 'bu', hint: '她的镖是冲你来的——用踏潮步闪开。' };
        return b.rock ? { pick: 'ge', hint: '船已经晃起来了。先守住，等她跳。' } : { pick: 'huang', hint: '她站稳的时候够不着。趁她打镖，先把船晃起来。' };
      };
      const place = () => { p.x = 1560; p.y = 800; p.dir = 3; p.pose = null; p.carry = 'pole'; x.x = 1500; x.y = 700; x.dir = 3; x.pose = null; x.carry = 'saber'; x.path = null; m.x = SPOT[0][0]; m.y = SPOT[0][1]; m.dir = 1; m.vis = true; m.alpha = 1; m.z = 0; m.pose = null; W.rocking = false; };
      /* 打到一半：一枚镖直取夏离，舱里一声弦响，镖偏了半寸 */
      const xian = async b => {
        const o = boss(b), xl = b.units.find(u => u.key === 'xiali').ent;
        await UI.narrate('梅花翅人还没站稳，反手一扬——三枚镖成品字，直取夏离的咽喉。太近了，刀来不及回。');
        const x0 = o.ent.x - 16, y0 = o.ent.y - 96, x1 = xl.x + 30, y1 = xl.y - 124, x2 = 1546, y2 = 470, d = dartEnt('dart9', Math.atan2(y1 - y0, x1 - x0)); d.x = x0; d.z = 1060 - y0;
        await B.fx.tw(0.3, q => { d.x = x0 + (x1 - x0) * q; d.z = 1060 - (y0 + (y1 - y0) * q); }, q => q); JX.audio.sfx('xian');
        d.ang = Math.atan2(y2 - y1, x2 - x1); await B.fx.tw(0.12, q => { d.x = x1 + (x2 - x1) * q; d.z = 1060 - (y1 + (y2 - y1) * q); }, q => q); JX.audio.sfx('tick'); B.fx.floater(b.units.find(u => u.key === 'xiali'), '偏了', '#bfe3d0');
        await UI.narrate('舱里“铮”的一声，像是有人在调弦。最前头那一枚镖偏了半寸，擦着她的鬓角过去，钉进了桅杆。');
        await UI.say('xiali', '夏离', '……', 'surprise');
        await UI.say('jingzhe', '陆惊蛰', '（没有回头）这根弦，调得真是时候。', 'normal');
        await UI.say('meihuachi', '梅花翅', '咦。今夜湖上风大。', 'smile');
      };
      for (let lost = 0; ;) {
        place(); W.remove('dart9');
        const team = fighters(p, x);
        team[0].cmds[0] = Object.assign({}, team[0].cmds[0], { name: '竹篙·点', desc: '篙尖专点手腕、脚踝。出手快，下一手来得早。' });
        team[0].cmds[1] = Object.assign({}, team[0].cmds[1], { name: '竹篙·扫', desc: '竹篙横扫。出手慢，下一手来得迟。' });
        team[0].cmds.push(rock('竹篙·拨船', '拿竹篙去拨她脚下那两条小船。船一晃，她下一回落脚就站不稳。', '陆惊蛰一篙点在小船的船帮上——'));
        team[1].cmds.push(rock('踩铁索', '一脚踩在连船的铁索上，那头的小船跟着一荡。船一晃，她下一回落脚就站不稳。', '夏离一脚踩在连船的铁索上——'));
        const r = await B.run({
          goal: '趁她跳船，把船晃起来——落脚不稳再打', music: 'pozhen', season: 0, seasonEvery: 5, zoom: 1.08, focus: { x: 1850, y: 690 },
          allies: team,
          foes: [{ ent: m, key: 'meihuachi', name: '梅花翅', hp: 300, spd: 12, atk: 30, def: 4, boss: true, keep: true, n: 0, at: 0, ai: (b, u) => (++u.n % 2 ? dart : leap) }],
          allow: rec,
          autoPick(b, u, cmds) { const id = rec(b, u).pick; return cmds.find(c => c.id === id); },
          resolve(b, a, mv, t, r2) {
            if (t.key === 'meihuachi' && !t.stun) return { evade: false, block: true, dmg: 0, iron: '够不着' };
            if (a.key === 'meihuachi' && t.stance === 'dodge' && !t.stun) return { evade: true, block: false, dmg: 0 };      // 这一场的镖，踏潮步总躲得开（平常快手只躲得开一半）：照着提示打，一下都不会挨
            return r2;
          },
          end(b) { return b.units.find(q => q.key === 'jingzhe').hp <= 0 ? 'lose' : null; },      // 镖都是冲他去的；他倒了，这一场就算输，重来
          async after(b, u) {
            const o = boss(b);
            if (!o.stun && o.ent.pose && o.hp > 0) o.ent.pose = null;                                    // 缓过来了，站起来
            if (!o.stun && o.note && o.note.indexOf('站不稳') >= 0) o.note = b.rock ? '两条小船都在晃' : '';
            if (b.slips === 1 && !b.said1) { b.said1 = true; await B.talk(async () => { await UI.narrate('她落下去的那条船正晃到一边。脚尖一滑，人矮了半截。'); await UI.say('meihuachi', '梅花翅', '哎呀。小二哥好坏。', 'smile'); }); }
            else if (u.side === 'ally' && b.last && b.last.a === u && b.last.r.iron && !b.said3) { b.said3 = true; await B.talk(() => UI.narrate('差着三尺。她站稳的时候，够不着。')); }
            if (!b.xian && o.hp > 0 && o.hp <= o.hpMax / 2) { b.xian = true; await B.talk(() => xian(b)); }
          },
        });
        if (r.result === 'win') break;
        await UI.narrate('一枚镖擦着耳朵过去，脚下一空——不对，这一场还没完，再来。');
        if (await giveUp(++lost)) break;
        await UI.tutorial('再来一次', '看她的<b>架势</b>：她要<b>打镖</b>，阿蛰就用<b>踏潮步</b>，夏离趁这工夫<b>晃船</b>；她要<b>跳船</b>，船要是还没晃，就先<b>晃船</b>。<br>她落脚不稳的那两手，两个人一起打。<br>指令框里那行红字是这一手的提示；光标已经落在建议的指令上，照着按回车就行。');
      }
      /* 收场：她坐在船板上，夏离的刀背压着她的肩 */
      place(); W.remove('dart9'); W.focus = { x: 1800, y: 700 }; W.camSnap = true;
      m.pose = 'squat'; m.dir = 1; x.x = SPOT[0][0] + 74; x.y = SPOT[0][1] + 6; x.dir = 1; p.x = 1610; p.y = 790; p.dir = 3;
      await JX.sleep(JX.auto ? 0.02 : 0.5);
    },
    async 巡船到() {
      JX.audio.sfx('gong'); const bt = W.add('xunchuan', { h: 150 }, 2760, 870, { solid: false, draw: drawPatrol });
      await W.walk(bt, 2290, 846, { speed: 230, straight: true }); JX.audio.sfx('splash'); await JX.sleep(JX.auto ? 0.02 : 0.4);
    },
    /* —— 第一章·十一 公堂 —— */
    async 入一十一() { ch1(21, false); },
    async 上堂站定() { const p = W.player, x = W.byId.xiali; const a = W.walk(p, 860, 790, { speed: 210, dir: 2 }); if (x) W.walk(x, 716, 760, { speed: 230, dir: 2 }); await a; },
    async 阑珊上堂() {
      const p = W.player, x = W.byId.xiali, h = W.byId.he; JX.audio.sfx('door');
      const q = W.add('qiushui', 'qiushui', 120, 850, { dir: 3, tag: '阑珊', solid: false }); W.focus = { x: 700, y: 700 };
      p.dir = 1; if (x) x.dir = 1; if (h) h.dir = 0;
      await W.walk(q, 1000, 850, { speed: 120, straight: true, dir: 2 }); W.focus = null; p.dir = 3; if (x) x.dir = 3; if (h) h.dir = 3;
    },
    async 指认() { const q = W.byId.qiushui, m = W.byId.meihuachi; if (q) q.dir = 3; await JX.sleep(JX.auto ? 0.02 : 0.6); if (m) m.dir = 1; },
    async 惊堂木() { JX.audio.sfx('door'); await JX.sleep(JX.auto ? 0.02 : 0.4); },
    async 散堂() {
      const m = W.byId.meihuachi, c3 = W.byId.cy3, h = W.byId.he, q = W.byId.qiushui, p = W.player, x = W.byId.xiali;
      if (m) { m.pose = null; W.walk(m, 1870, 840, { speed: 150, straight: true }).then(() => W.remove('meihuachi')); } if (c3) W.walk(c3, 1880, 850, { speed: 140, straight: true }).then(() => W.remove('cy3'));
      ['cy1', 'cy2'].forEach((id, i) => { const c = W.byId[id]; if (c) W.walk(c, i ? 1700 : 240, 700, { speed: 120, straight: true, dir: 0 }); });
      p.dir = 3; if (x) x.dir = 3; if (q) q.dir = 1;
      if (h) { h.pose = null; await W.walk(h, 600, 850, { speed: 100, straight: true }); await W.walk(h, 900, 850, { speed: 100, straight: true, dir: 3 }); }
    },
    async 贺元度走() { const h = W.byId.he; ST._heOut = h ? W.walk(h, 110, 830, { speed: 150, straight: true }).then(() => W.remove('he')) : null; await JX.sleep(JX.auto ? 0.02 : 1.2); },
    async 贺元度走远() { if (ST._heOut) await ST._heOut; ST._heOut = null; await JX.sleep(JX.auto ? 0.02 : 0.5); },      // 等他出了门，阿蛰才开口
    /* —— 第一章·十二 开个价 —— */
    async 入一十二() { ch1(22, false); },
    async 柜前站位() { const p = W.player; p.x = 836; p.y = 528; p.dir = 3; W.zoom = 1.25; W.camSnap = true; },      // 大堂里人多，这几句话把镜头推近一点
    async 镜头还原() { W.zoom = 1; W.focus = null; },
    async 听雪探头二() { const t = W.byId.tingxue; if (t) { t.vis = true; t.x = 150; t.y = 688; t.dir = 3; } W.focus = { x: 560, y: 640 }; JX.audio.sfx('door'); await JX.sleep(JX.auto ? 0.02 : 0.9); },
    async 听雪缩回() { const t = W.byId.tingxue; if (t) t.vis = false; JX.audio.sfx('page'); await JX.sleep(JX.auto ? 0.02 : 0.6); W.focus = null; },
    async 可出门() { delete W.exitsOff['hall:door']; },
    async 得书() { const p = W.player; p.carry = 'book'; JX.audio.sfx('page'); await JX.sleep(JX.auto ? 0.02 : 0.5); await cutIn((c, k) => drawSeal(c, 0.3 + k * 0.7, { txt: true }), ['蓝布函套。翻开卷首，右下角那方朱印还在：老学庵。'], 2.2); },
    async 收书下楼() { const p = W.player; p.carry = null; p.dir = 3; JX.audio.sfx('page'); await JX.sleep(JX.auto ? 0.02 : 0.9); p.dir = 1; },
    /* 做到哪里，就在哪里停：一张卡片，可以留下来走走，也可以回标题 */
    async 试玩结束() {
      ST.save();
      UI.modal++; UI.purse(null); UI.objective(null); W.objective = null;
      const box = UI.root().appendChild(JX.el('div', 'panel')); box.id = 'end';
      box.innerHTML = '<h2>第一章　完</h2><p>序章《青玉案》十场、第一章《钗头凤》十二场，到这里都做完了：命案破到梅花翅为止；阑珊上了堂，丢了脱籍的指望；陆家的书在贺元度手里，那册钤着“老学庵”的回到了他怀里。</p><p>下一章是《扬州慢》：跟夏离沿运河北上，去真州。还没有做。</p><div class="btn jx-clickable" data-a="stay">留在软红院看看</div><div class="btn jx-clickable" data-a="title">回到标题画面</div>';
      const a = await new Promise(res => { box.onclick = e => { const b = e.target.closest('[data-a]'); if (b) res(b.dataset.a); }; if (JX.auto) res('stay'); const hs = JX._upd = JX._upd || [], born = JX.time; const tick = () => { if (UI.menuOpen()) return; if (JX.time - born < 0.8) { JX.input.eat('confirm'); return; } if (JX.input.hit('confirm')) { hs.splice(hs.indexOf(tick), 1); res('stay'); } }; hs.push(tick); });      // 刚出来的一瞬不收回车，免得连按对白时一下子跳过去
      box.remove(); UI.modal--;
      if (a === 'title') { location.reload(); return; }
      const p = W.player, sp0 = (W.sc && W.sc.spawns && W.sc.spawns.start) || { x: 250, y: 820 }; if (p) { p.x = sp0.x + 60; p.y = sp0.y; p.dir = 3; p.path = null; }
      W.focus = null; W.locked = false; UI.purse(JX.state.money); UI.roam(true); JX.ended = true;
      await UI.fade(0, JX.auto ? 0.05 : 1.2);
    },
  };
})();
