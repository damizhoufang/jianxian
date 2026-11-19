// 演出（@做 的名字）核对：一、各个 story*.js 里有没有重名的演出——重名的话后装载的会把先装载的盖掉，前面章节的戏就演错了；
// 二、剧本里 @做 的名字是不是都有对应的演出；三、有没有写了却没有哪一场用到的演出（只提示，不算错）。
// 用法：node tools/hookcheck.js      有重名或缺失就以非零状态退出
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/'(src\/story[^']*\.js)'/g)].map(m => m[1]);
const defs = {};
for (const f of files) { const s = fs.readFileSync(path.join(root, f), 'utf8'); for (const m of s.matchAll(/^\s{4}async ([^\s(]+)\(/gm)) (defs[m[1]] = defs[m[1]] || []).push(f); }
const dup = Object.entries(defs).filter(([, v]) => v.length > 1);
global.window = {}; for (const f of [...html.matchAll(/'(data\/(?!checkpoints)[^']*\.js)'/g)].map(m => m[1])) require(path.join(root, f));
const used = {};
for (const [k, text] of Object.entries(window.JX_SCRIPTS)) for (const m of text.matchAll(/^@做 (\S+)/gm)) (used[m[1]] = used[m[1]] || []).push(k);
const miss = Object.keys(used).filter(h => !defs[h]);
const INNER = /^(试玩到此|战|入)/;                                // 这些有的是别的演出里头调的
const idle = Object.keys(defs).filter(h => !used[h] && !INNER.test(h));
console.log('演出共', Object.keys(defs).length, '段，分在', files.length, '个文件；剧本用到', Object.keys(used).length, '段');
console.log('重名：', dup.length ? dup.map(([k, v]) => k + '（' + v.join('、') + '）').join('；') : '没有');
console.log('剧本里有、演出里没有：', miss.length ? miss.join('、') : '没有');
if (idle.length) console.log('写了没用到的（只提示）：', idle.join('、'));
process.exit(dup.length || miss.length ? 1 : 0);
