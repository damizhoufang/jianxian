/* 人物图鉴与配乐试听。标题画面和菜单里都能进；地址后面加 #gallery 直接打开（#gallery-3 是第四页）。
   五位主角用画像（art/ 目录，见 artpack.js）：头像、半身、全身、三视图，点开放大；另有场景里走动的小人与动作（figures.js）。
   配角还是程序画的三套：立绘（portraits3.js）、对话头像与表情、场景小人。 */
'use strict';
(function () {
  const JX = window.JX, UI = JX.ui, Fig = JX.Fig, Art = JX.Art, P = JX.P, el = JX.el;
  const CHARS = [
    { id: 'jingzhe', bio: '十八岁。醉春楼的行菜，嘴贫，手稳，记菜过耳不忘。腰后别着一把没有尖的酒刀，天天拿它开坛。户籍上写的是阮蛰，自己的姓从不对人说。',
      acts: [['抱酒坛', { carry: 'jar' }], ['端托盘', { carry: 'tray' }], ['蹲下', { pose: 'squat' }]] },
    { id: 'xiali', bio: '十九岁。元夕夜包下听潮阁的北客，锦袍，步子很大，订金给的是银铤。左手拇指上有一圈扳指磨出来的白痕——不像打算盘的手。',
      acts: [['举杯', { carry: 'cup' }], ['落座', { pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'naren', bio: '夏离的本来面目，第三章在普陀换回来。草原上长大，弓、弯刀、摔跤三样是父亲亲手教的；汉文和道理，是一位被扣在南边的老师教的。',
      acts: [['持弓', { carry: 'bow' }], ['落座', { pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'qiushui', bio: '十九岁。软红院里只唱词的歌伎，艺名阑珊。十三岁没入乐籍，琵琶从不离身。每年有几个月“回乡养病”，没人知道她去了哪里。',
      acts: [['抱琵琶', { carry: 'pipa' }], ['坐弹', { carry: 'pipa', pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'tingxue', bio: '十八岁。东辽宰相耶律德生的小女儿，偷跑到临安来看灯。娇生惯养，饭量惊人，掌力更惊人。脖子上挂着一颗旧佛珠，从小戴着，不知道哪来的。',
      acts: [['捧面碗', { carry: 'bowl' }], ['坐着吃', { carry: 'bowl', pose: 'sit', seat: 26 }, 'stool']] },
    /* —— 以下是重点配角 —— */
    { id: 'fan', bio: '六十二岁。靠窗第三张桌，面前永远是一只空壶，赊了三年的账。身后题壁墙上那首七绝是他写的。看人先问手稳不稳，说完就打鼾。',
      acts: [['落座', { pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'he', bio: '半闲堂第一谋士，元夕夜在二楼办词会。说话温和，从不高声，眼睛却不放过任何一样东西。写得一手好字——谁的字，他都写得像。',
      acts: [['落座', { pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'laodao', bio: '御街上挑担卖历日的老道，正月过了一半还在卖。说话像是早就算好的。他的名号和来历，前几卷不说破。',
      acts: [['落座', { pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'siniang', bio: '醉春楼掌柜。嘴上三条规矩，心里一本明账。伙计们怕她，也只服她。真到了要紧的时候，她站在门口不让。',
      acts: [['落座', { pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'laochu', bio: '醉春楼铛头，管着后厨八眼灶。骂人最凶，往人手里塞吃的也最快。',
      acts: [['端托盘', { carry: 'tray' }]] },
    { id: 'agui', bio: '酒窖小厮，十三四岁，什么都要问一句为什么。管惊蛰叫“蛰哥”，蛰哥说什么他都抢着接下半句。',
      acts: [['抱酒坛', { carry: 'jar' }], ['蹲下', { pose: 'squat' }]] },
    { id: 'xieke', bio: '半闲堂养的“促织客”之一，袖口绣着一只蟋蟀。铁塔似的身量，两条铁臂一撞，铮然有声；格挡的时候刀枪不入。',
      acts: [['落座', { pose: 'sit', seat: 26 }, 'stool']] },
    { id: 'zhong', bio: '临安府推官。办了半辈子案，知道哪些案子压得住，哪些压不住。见了醉春楼的阿蛰，先叹一口气。',
      acts: [['落座', { pose: 'sit', seat: 26 }, 'stool']] },
  ];
  const LEADS = 5, GROUPS = [['主角', 0], ['配角', LEADS], ['配乐', -1]];
  const MOODS = [['', '平常'], ['smile', '笑'], ['grin', '嬉'], ['smirk', '撇嘴'], ['cold', '冷'], ['angry', '怒'], ['surprise', '惊'], ['closed', '闭目'], ['sad', '黯然']];
  const TRACKS = [
    ['zhuti', '惊蛰', '标题画面、三楼听潮阁、序章结尾 · 全剧主题', '箫领，筝的分解和音托着。宫调慢板。'],
    ['kaitan', '开坛', '酒窖', '古琴弹旋律，阮一拍一拍走着，后半箫接过去。商调，不紧不慢。'],
    ['zaohuo', '灶火', '后厨', '笛子吹得短而跳，琵琶跟着，板和小锣凑热闹。徵调快板。'],
    ['yuanxi', '元夕', '一楼大堂（二楼隔着楼板也听得见）；第一章的西湖夜与画舫', '笛、琵琶、筝、板鼓。主题的快板变奏。'],
    ['dengshi', '灯市', '门首御街', '锣鼓开道，笛子领着，中段让给筝。宫调。'],
    ['xueye', '雪夜', '回忆 · 宝祐四年冬', '箫与古琴，中间留白。主题转到羽调。'],
    ['anliu', '暗流', '不对劲的时候；后巷与屋顶；架阁库、公堂；夜渡大江', '很低的箫，古琴，心跳一样的鼓。角音上压着清角。'],
    ['lanshan', '阑珊', '阑珊的曲子：词会上唱《青玉案》、一方印、她走上公堂、章末的软红院', '琵琶轮指唱前半，箫接后半，筝在底下。羽调慢板。'],
    ['jiaofeng', '交锋', '动手的时候（第六场的教学战起；画舫上对梅花翅）', '大鼓和钹催着，琵琶扫弦，笛子在上面。羽调急板。'],
    ['shisheng', '市声', '白天的临安：府衙门外的街、白天的醉春楼、北关码头', '筝弹旋律，阮一步一步垫着，碰铃和板点着拍子，中段笛子接过去。徵调，没有鼓。'],
    ['wazi', '瓦子', '北瓦', '琵琶一句一顿，顿的地方锣鼓接话；中段笛子唱开，回来时齐奏。商调快板，说唱的路子。'],
    ['meichuang', '梅窗', '白天安静的屋子里：软红院、仁寿堂、公堂散后', '古琴先弹，泛音点着；后半箫进来，句尾筝轻轻一拂。宫调慢板。'],
    ['xingchuan', '行船', '第二章：白天，运酒船在运河上', '笛子吹旋律，筝在句尾刮一道，像水；阮一长一短地垫着，是摇船的那个晃。宫调行板，没有鼓。'],
    ['yebo', '夜泊', '第二章：夜里泊船；雨天窝在舱口', '筝一个音一个音地弹，泛音像水面的月光；后半箫接过去，远远一声磬。商调，很慢。'],
    ['biancheng', '边城', '第二章：扬州', '阮在低处一个音一个音地拨，远处的鼓一小节一下；后半箫接过去。羽调，慢，像在城墙底下走。'],
    ['yingye', '营夜', '第二章：真州营外的黄昏、三更的军营', '几乎是空的：箫吹长音，低处的弦两拍一下，每隔一阵远远三声梆子。'],
    ['jiangxiao', '江晓', '第二章：真州渡，天刚亮', '头四小节只有筝，一个音一个音地弹；然后笛子进来，筝退到底下。没有鼓。'],
  ];
  JX.TRACKS = TRACKS;
  const PICS = [['face', '头像'], ['half', '半身'], ['full', '全身'], ['sheet', '三视图']];
  const painted = ch => !!(Art.painted && Art.painted(ch.id));
  let box = null, page = 0, spr = null, onClose = null, playing = null, zoom = null;      // zoom：正在放大看第几张（没有就是 null）

  function stool(c) { c.fillStyle = '#6a3f26'; c.strokeStyle = '#231a14'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-17, -30); c.quadraticCurveTo(-23, -15, -16, 0); c.lineTo(16, 0); c.quadraticCurveTo(23, -15, 17, -30); c.closePath(); c.fill(); c.stroke(); P.ellipse(c, 0, -30, 18, 5.5, '#8a5634', '#231a14', 1.2); }
  function drawSprites(ch) {
    const cv = spr, c = cv.getContext('2d'), k = cv.width / 580, sp = Fig.cast[ch.id], t = JX.time;
    c.setTransform(k, 0, 0, k, 0, 0); c.clearRect(0, 0, 580, 860);
    const lab = (s, x, y) => { c.font = '20px "Kaiti SC","STKaiti","KaiTi",serif'; c.fillStyle = '#6a5236'; c.textAlign = 'center'; c.fillText(s, x, y); };
    const head = (s, y) => { c.font = '600 22px "Kaiti SC","STKaiti","KaiTi",serif'; c.fillStyle = '#8e2a20'; c.textAlign = 'left'; c.fillText(s, 22, y); c.fillStyle = 'rgba(142,42,32,.3)'; c.fillRect(22 + s.length * 23 + 10, y - 8, 520 - s.length * 23, 1.5); };
    const Z = 1.3, dirs = [[0, '正面'], [3, '朝右'], [2, '背面'], [1, '朝左']];
    head('站立', 30);
    dirs.forEach((d, i) => { c.save(); c.translate(82 + i * 139, 262); c.scale(Z, Z); Fig.draw(c, sp, d[0], 0.5, {}); c.restore(); lab(d[1], 82 + i * 139, 290); });
    head('行走', 322);
    dirs.forEach((d, i) => { c.save(); c.translate(82 + i * 139, 556); c.scale(Z, Z); Fig.draw(c, sp, d[0], t * 7.5, { moving: true }); c.restore(); });
    head('动作', 588);
    const n = ch.acts.length, gap = n === 3 ? 170 : 220, x0 = 290 - gap * (n - 1) / 2;
    ch.acts.forEach((a, i) => { c.save(); c.translate(x0 + i * gap, 822); c.scale(Z, Z); if (a[2] === 'stool') { c.save(); c.translate(0, -3); stool(c); c.restore(); } Fig.draw(c, sp, 0, 0.5, a[1]); c.restore(); lab(a[0], x0 + i * gap, 850); });
  }
  function render() {
    const grp = page >= CHARS.length ? 2 : page >= LEADS ? 1 : 0;
    const tabs = GROUPS.map((g, i) => '<div class="tab jx-clickable' + (i === grp ? ' on' : '') + '" data-p="' + (g[1] < 0 ? CHARS.length : g[1]) + '">' + g[0] + '</div>').join('') + '<div class="sep"></div>' +
      CHARS.map((ch, i) => (grp === 2 || (i >= LEADS) !== (grp === 1)) ? '' : '<div class="sub jx-clickable' + (i === page ? ' on' : '') + '" data-p="' + i + '">' + Art.chars[ch.id].name + '</div>').join('');
    let h = '<div class="bar"><h2>图鉴</h2>' + tabs + '<div class="close jx-clickable" data-act="close">← → 翻页　Esc 返回</div></div>';
    spr = null;
    if (page < CHARS.length) {
      const ch = CHARS[page], a = Art.chars[ch.id], pt = painted(ch);
      const info = '<div class="info"><h3>' + a.name + '</h3><div class="ti">' + (a.support ? '' : a.season + '　·　') + a.title + '</div><p class="bio">' + ch.bio + '</p><p class="q">“' + a.line + '”</p></div>';
      if (pt) {                                                     // 主角：用画像。左边一张大的，底下四张小的，点哪张都放大看
        h += '<div class="pic jx-clickable" data-zoom="1"><img src="' + Art.pic(ch.id, 'half') + '" alt=""></div>' +
          '<div class="ths">' + PICS.map((k, i) => '<div class="th jx-clickable" data-zoom="' + i + '"><img src="' + Art.pic(ch.id, k[0]) + '" alt=""><span>' + k[1] + '</span></div>').join('') + '</div>' + info +
          '<div class="sheet"><h4>三视图</h4><div class="f jx-clickable" data-zoom="3"><img src="' + Art.pic(ch.id, 'sheet') + '" alt=""></div></div>';
      } else {
        h += '<canvas class="port-bg" width="518" height="944"></canvas><canvas class="port" width="' + Art.PW * 2 + '" height="' + Art.PH * 2 + '"></canvas>' + info +
          '<div class="faces"><h4>对话头像 · 表情</h4><div class="g">' + MOODS.map((m, i) => '<div class="face"><canvas width="380" height="436" data-m="' + i + '"></canvas><span>' + m[1] + '</span></div>').join('') + '</div></div>';
      }
      h += '<div class="spr"><h4>场景里的样子</h4><canvas width="1160" height="1720"></canvas></div>';
      if (pt && zoom != null) h += '<div class="lb jx-clickable" data-zoom="x"><img src="' + Art.pic(ch.id, PICS[zoom][0]) + '" alt=""><div class="cap">' + a.name + '　·　' + PICS[zoom][1] + '　　← → 换一张　　点一下或按 Esc 收起</div></div>';
    } else {
      h += '<div class="mus">' + TRACKS.map(t => '<div class="trk' + (playing === t[0] ? ' on' : '') + '"><b>《' + t[1] + '》</b><div class="w">' + t[2] + '</div><div class="h">' + t[3] + '</div><div class="btn small jx-clickable" data-play="' + t[0] + '">' + (playing === t[0] ? '■ 停' : '▶ 试听') + '</div></div>').join('') + '</div>' +
        '<div class="note">十六首都是原创旋律，整首离线合成后装进游戏，游戏里只播放。一首一兆上下，点了才装载，头一回要等一两秒。</div>';
    }
    box.innerHTML = h;
    if (page < CHARS.length && painted(CHARS[page])) { spr = box.querySelector('.spr canvas'); drawSprites(CHARS[page]); }
    else if (page < CHARS.length) {
      const ch = CHARS[page];
      const bg = box.querySelector('.port-bg').getContext('2d'), a = Art.chars[ch.id];                    // 立绘背后：一轮淡淡的光和一个季节的字
      bg.save(); bg.scale(1, 1.78); const gr = bg.createRadialGradient(259, 256, 10, 259, 262, 256); gr.addColorStop(0, 'rgba(240,222,180,.32)'); gr.addColorStop(0.55, 'rgba(240,222,180,.1)'); gr.addColorStop(1, 'rgba(240,222,180,0)'); bg.fillStyle = gr; bg.fillRect(0, 0, 518, 531); bg.restore();
      bg.font = '600 200px "Kaiti SC","STKaiti","KaiTi",serif'; bg.textAlign = 'center'; bg.fillStyle = 'rgba(240,222,180,.09)'; bg.fillText(a.season, 404, 250);
      const pc = box.querySelector('.port').getContext('2d'); pc.drawImage(Art.portrait(ch.id), 0, 0);
      box.querySelectorAll('.face canvas').forEach(cv => { cv.getContext('2d').drawImage(Art.avatar(ch.id, MOODS[+cv.dataset.m][0] || null), 0, 0, 380, 436); });
      spr = box.querySelector('.spr canvas'); drawSprites(ch);
    }
  }
  function play(id) {
    const A = JX.audio;
    if (playing === id) { playing = null; A.music(null); }
    else { playing = id; A.hold = true; A.music(id); }
    render();
  }
  function tick() {
    if (!box) return;
    const n = CHARS.length + 1;
    if (zoom != null) {                                             // 放大看的时候：左右换一张，Esc 收起
      if (JX.input.hit('left') || JX.input.hit('a')) { zoom = (zoom + PICS.length - 1) % PICS.length; JX.audio.sfx('page'); render(); }
      else if (JX.input.hit('right') || JX.input.hit('d')) { zoom = (zoom + 1) % PICS.length; JX.audio.sfx('page'); render(); }
      else if (JX.input.hit('cancel') || JX.input.hit('menu') || JX.input.hit('confirm')) { JX.input.eat('cancel'); JX.input.eat('menu'); JX.input.eat('confirm'); zoom = null; render(); }
      if (spr && page < CHARS.length) drawSprites(CHARS[page]);
      return;
    }
    if (JX.input.hit('left') || JX.input.hit('a')) { page = (page + n - 1) % n; JX.audio.sfx('page'); render(); }
    else if (JX.input.hit('right') || JX.input.hit('d')) { page = (page + 1) % n; JX.audio.sfx('page'); render(); }
    else if (JX.input.hit('cancel') || JX.input.hit('menu')) { JX.input.eat('cancel'); JX.input.eat('menu'); UI.closeGallery(); return; }
    if (spr && page < CHARS.length) drawSprites(CHARS[page]);
  }
  UI.galleryOpen = () => !!box;
  UI.gallery = function (p, done) {
    if (box) return;
    if (p != null) page = Math.max(0, Math.min(CHARS.length, p));
    onClose = done || null; zoom = null; UI.modal++;
    box = UI.root().appendChild(el('div')); box.id = 'gal';
    box.onclick = e => {
      const t = e.target.closest('[data-p],[data-act],[data-play],[data-zoom]'); if (!t) return;
      if (t.dataset.zoom != null) { zoom = t.dataset.zoom === 'x' ? null : +t.dataset.zoom; JX.audio.sfx('page'); render(); }
      else if (t.dataset.p != null) { zoom = null; page = +t.dataset.p; JX.audio.sfx('page'); render(); }
      else if (t.dataset.play) play(t.dataset.play);
      else UI.closeGallery();
    };
    render();
    (JX._upd = JX._upd || []).push(tick);
  };
  UI.closeGallery = function () {
    if (!box) return;
    box.remove(); box = null; spr = null; UI.modal--;
    const hs = JX._upd, i = hs.indexOf(tick); if (i >= 0) hs.splice(i, 1);
    const was = playing; playing = null;
    if (onClose) onClose(was);
  };
})();
