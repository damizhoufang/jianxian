#!/usr/bin/env python3
"""原创配乐的离线合成：整首算成音频文件，游戏里只播放、不即时合成。
乐器是物理建模与加法合成：筝、琵琶、古琴、阮（拨弦模型，含轮指与扫弦），笛、箫（谐波加气声），板、板鼓、大鼓、大小锣、钹、磬。
用法：python3 tools/music.py [曲名 ...]   不写曲名就全部重做。输出到 music/*.js（Ogg Vorbis，包成脚本）。"""
import sys, os, base64, subprocess, json
import numpy as np
import scipy.signal as sg

SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'music')
DEG = {1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11}


def m2f(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


# ---------------------------------------------------------------- 乐器
def warp(x, ratio):
    """按随时间变化的倍率重新采样（滑音、吟猱、把整数周期修成准确音高）。"""
    pos = np.cumsum(ratio) - ratio[0]
    pos = pos[pos < len(x) - 1]
    return np.interp(pos, np.arange(len(x)), x)


def pluck(f, dur, amp=1.0, bright=0.6, t60=2.5, pos=0.18, glide=0.0, vib=0.0, seed=0, body=0.25):
    """拨弦：延迟线加回路滤波。glide 是起音低多少个半音再滑上来，vib 是吟的幅度（音分）。"""
    rng = np.random.default_rng(seed)
    N = max(8, int(round(SR / f)))
    exc = rng.uniform(-1, 1, N)
    k = 1 - bright
    e2 = np.concatenate([exc, exc, exc])
    for _ in range(2):
        e2 = sg.lfilter([1 - k * 0.92], [1, -k * 0.92], e2)
    exc = e2[2 * N:]
    d = max(1, int(pos * N))
    exc = exc - np.roll(exc, d)
    exc /= np.abs(exc).max() + 1e-9
    s = 0.06 + 0.42 * (1 - bright)
    g = 10 ** (-3.0 * (N / SR) / t60)
    nper = int((dur + 0.05) * SR / N) + 3
    out = np.empty(nper * N)
    buf = exc
    for i in range(nper):
        out[i * N:(i + 1) * N] = buf
        buf = g * ((1 - s) * buf + s * np.roll(buf, 1))
    f_act = SR / (N + s)
    n = int(dur * SR)
    t = np.arange(n) / SR
    cents = np.zeros(n)
    if glide:
        cents += -100.0 * glide * np.exp(-t / 0.045)
    if vib:
        cents += vib * np.sin(2 * np.pi * 5.3 * t) * np.clip((t - 0.12) / 0.25, 0, 1) * np.exp(-t / 1.6)
    ratio = (f * 2 ** (cents / 1200.0)) / f_act
    y = warp(out, ratio)
    if len(y) < n:
        y = np.pad(y, (0, n - len(y)))
    y = y[:n]
    a = int(0.002 * SR)
    y[:a] *= np.linspace(0, 1, a)
    r = min(n, int(0.04 * SR))
    y[-r:] *= np.linspace(1, 0, r)
    if body:                                    # 一点木头共鸣
        b, a2 = sg.butter(2, [180 / (SR / 2), 900 / (SR / 2)], 'band')
        y = y + body * sg.lfilter(b, a2, y)
    return amp * y


def harmonic(f, dur, amp=1.0):
    """泛音：干净的钟一样的音。"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / (dur * 0.35)) + 0.18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / (dur * 0.2))
    a = int(0.004 * SR)
    y[:a] *= np.linspace(0, 1, a)
    return amp * y


def flute(f, dur, amp=1.0, kind='dizi', grace=0, vib=14.0, seed=0, legato=False):
    """笛或箫。grace：起音带一个倚音（相差几个半音，正数从上面来）。"""
    rng = np.random.default_rng(seed)
    n = int((dur + 0.09) * SR)
    t = np.arange(n) / SR
    cents = np.zeros(n)
    if grace:
        g = int(0.055 * SR)
        cents[:g] = 100.0 * grace
        sm = int(0.012 * SR)
        cents[g - sm:g + sm] = np.linspace(100.0 * grace, 0, 2 * sm)
    cents += -18 * np.exp(-t / 0.03)                                   # 起音略低，随即到位
    if dur > 0.42 and vib:
        cents += vib * np.sin(2 * np.pi * (5.2 + 0.3 * rng.random()) * t + rng.random() * 6) * np.clip((t - 0.2) / 0.3, 0, 1)
    cents += rng.normal(0, 1.2, n).cumsum() * 0.02                      # 气息带来的细微飘动
    fr = f * 2 ** (cents / 1200.0)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    att = 0.035 if kind == 'dizi' else 0.07
    env = np.minimum(1, t / att) ** 1.5
    sus = 0.82 + 0.18 * np.sin(np.pi * np.clip(t / max(dur, 0.01), 0, 1)) ** 0.8
    rel = np.clip((dur + 0.08 - t) / 0.09, 0, 1)
    env = env * sus * rel
    if kind == 'dizi':
        H = [1.0, 0.62, 0.36, 0.22, 0.13, 0.085, 0.05, 0.03, 0.02]
        breath, buzz = 0.03, 0.22
    else:
        H = [1.0, 0.34, 0.16, 0.06, 0.025]
        breath, buzz = 0.075, 0.0
    y = np.zeros(n)
    for i, a in enumerate(H):
        k = i + 1
        if f * k > SR * 0.45:
            break
        y += a * (env ** (1 + 0.22 * i)) * np.sin(k * ph + rng.random() * 6.28)
    if buzz:                                                           # 笛膜：亮而略带沙
        hp_b, hp_a = sg.butter(2, 1800 / (SR / 2), 'high')
        y = y + buzz * sg.lfilter(hp_b, hp_a, np.tanh(2.6 * y)) * env
    noise = rng.normal(0, 1, n)
    bb, ba = sg.butter(2, [min(0.9, 1.6 * f / (SR / 2)), min(0.95, 6.5 * f / (SR / 2))], 'band')
    y += breath * sg.lfilter(bb, ba, noise) * env * 3
    chiff = int(0.03 * SR)
    y[:chiff] += 0.1 * noise[:chiff] * np.linspace(1, 0, chiff) * (0.6 if kind == 'dizi' else 1.0)
    return amp * y * 0.5


def wood(freq=1250, dur=0.09, amp=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 1.52 * t)) * np.exp(-t / 0.018)
    y[:20] += np.linspace(0.6, 0, 20)
    return amp * y


def drum(f0=150, dur=0.32, amp=1.0, seed=1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    fr = f0 * (0.62 + 0.38 * np.exp(-t / 0.035))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.11)
    nz = np.random.default_rng(seed).normal(0, 1, n) * np.exp(-t / 0.012)
    b, a = sg.butter(2, 900 / (SR / 2), 'low')
    return amp * (y + 0.35 * sg.lfilter(b, a, nz))


def bell(f=1560, dur=1.8, amp=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (dur * d)) for r, a, d in [(1, 1, 0.3), (2.71, 0.45, 0.16), (4.9, 0.22, 0.09), (0.5, 0.2, 0.35)])
    y[:60] *= np.linspace(0, 1, 60)
    return amp * y


def dagu(f0=74, dur=0.9, amp=1.0, seed=1):
    """大鼓：比板鼓低一截，余音长。"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    fr = f0 * (0.7 + 0.3 * np.exp(-t / 0.05))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.24) + 0.3 * np.sin(2 * np.pi * np.cumsum(fr * 1.59) / SR) * np.exp(-t / 0.09)
    nz = np.random.default_rng(seed).normal(0, 1, n) * np.exp(-t / 0.016)
    b, a = sg.butter(2, 700 / (SR / 2), 'low')
    y = y + 0.5 * sg.lfilter(b, a, nz)
    y[:30] *= np.linspace(0, 1, 30)
    return amp * y


def gong(f=300, dur=2.6, amp=1.0, bend=-0.05, seed=2):
    """锣：一组不成倍数的分音。大锣敲下去音往下掉（bend 为负），小锣往上挑（bend 为正）。"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    gl = 1 + bend * (1 - np.exp(-t / 0.14))
    y = np.zeros(n)
    for i, r in enumerate([1, 1.48, 1.97, 2.64, 3.21, 4.13, 5.4, 6.7]):
        ph = 2 * np.pi * np.cumsum(f * r * gl) / SR
        y += (1 / (1 + i * 0.55)) * np.sin(ph + rng.random() * 6.28) * np.exp(-t / (dur * 0.34 / (1 + i * 0.35)))
    nz = rng.normal(0, 1, n) * np.exp(-t / 0.05)
    b, a = sg.butter(2, [1500 / (SR / 2), 7000 / (SR / 2)], 'band')
    y += 0.5 * sg.lfilter(b, a, nz)
    y[:40] *= np.linspace(0, 1, 40)
    return amp * y * 0.4


def cymbal(dur=0.5, amp=1.0, seed=3):
    """钹：一团高频的沙声加几个金属分音。"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    b, a = sg.butter(2, [2600 / (SR / 2), 11000 / (SR / 2)], 'band')
    y = sg.lfilter(b, a, rng.normal(0, 1, n)) * np.exp(-t / (dur * 0.28))
    for fr in (3120, 4270, 5630, 7410):
        y += 0.12 * np.sin(2 * np.pi * fr * t + rng.random() * 6.28) * np.exp(-t / (dur * 0.35))
    y[:30] *= np.linspace(0, 1, 30)
    return amp * y * 0.5


def tremolo(f, dur, amp=1.0, rate=11.0, bright=0.76, seed=0):
    """轮指：同一个音连着弹，中间略鼓起来。"""
    rng = np.random.default_rng(seed + 77)
    n = int((dur + 0.5) * SR)
    y = np.zeros(n)
    t, k = 0.0, 0
    while t < dur - 0.04:
        sw = 0.72 + 0.28 * np.sin(np.pi * min(1.0, t / max(dur, 0.01)))
        a = amp * sw * (1.0 if k % 5 == 0 else 0.78) * (0.85 + 0.15 * rng.random())
        note = pluck(f, 0.42, a, bright=bright, t60=0.8, pos=0.1, seed=seed * 31 + k, body=0.15)
        i = int(t * SR)
        note = note[:n - i]
        y[i:i + len(note)] += note
        t += (0.94 + 0.12 * rng.random()) / rate
        k += 1
    b, a = sg.butter(1, 5200 / (SR / 2), 'low')
    return sg.lfilter(b, a, y)


def strum(ms, dur, amp=1.0, bright=0.86, gap=0.011, seed=0):
    """扫弦：几根弦依次带过。"""
    n = int((dur + gap * len(ms) + 0.1) * SR)
    y = np.zeros(n)
    for j, m in enumerate(ms):
        note = pluck(m2f(m), dur, amp * (0.8 + 0.05 * j), bright=bright, t60=1.1, pos=0.1, seed=seed * 13 + j, body=0.18)
        i = int(j * gap * SR)
        note = note[:n - i]
        y[i:i + len(note)] += note
    return y


# ---------------------------------------------------------------- 混音
class Mix:
    def __init__(self, beats, bpm, tail=4.5):
        self.bpm = bpm
        self.L = int(round(beats * 60.0 / bpm * SR))
        self.n = self.L + int(tail * SR)
        self.dry = np.zeros((2, self.n))
        self.send = np.zeros((2, self.n))

    def at(self, beat):
        return int(round(beat * 60.0 / self.bpm * SR))

    def add(self, y, beat, pan=0.0, rev=0.25, delay=0.0):
        i = self.at(beat) + int(delay * SR)
        if i >= self.n:
            return
        y = y[:self.n - i]
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.dry[0, i:i + len(y)] += l * y
        self.dry[1, i:i + len(y)] += r * y
        self.send[0, i:i + len(y)] += rev * l * y
        self.send[1, i:i + len(y)] += rev * r * y

    def render(self, t60=2.0, wet=1.0, seed=5, level=0.0):
        rng = np.random.default_rng(seed)
        n = int(t60 * 1.3 * SR)
        t = np.arange(n) / SR
        out = self.dry.copy()
        for ch in range(2):
            ir = rng.normal(0, 1, n) * np.exp(-6.91 * t / t60)
            b, a = sg.butter(1, 4200 / (SR / 2), 'low')
            ir = sg.lfilter(b, a, ir)
            ir[:int(0.012 * SR)] = 0
            for d, gk in [(0.017, 0.5), (0.029, 0.4), (0.041, 0.3)]:
                ir[int((d + ch * 0.003) * SR)] += gk * 6
            ir /= np.sqrt((ir ** 2).sum())
            out[ch] += wet * sg.fftconvolve(self.send[ch], ir)[:self.n] * 0.9
        out[:, :self.n - self.L] += out[:, self.L:]            # 尾音折回开头，首尾相接没有缝
        out = out[:, :self.L]
        b, a = sg.butter(2, 32 / (SR / 2), 'high')
        out = sg.lfilter(b, a, out, axis=1)
        out = np.tanh(out / (np.abs(out).max() + 1e-9) * 0.9) / np.tanh(0.9)      # 只在最响的地方轻轻收一下
        if level and np.sqrt((out ** 2).mean()) * 0.86 < level:  # 各曲拉到差不多一样响：拨弦和打击乐峰值高、平均小，把峰收一收
            lo, hi = 0.05, 4.0
            for _ in range(18):
                g = (lo + hi) / 2
                if np.sqrt(((np.tanh(out * g) / np.tanh(g)) ** 2).mean()) * 0.86 < level:
                    lo = g
                else:
                    hi = g
            out = np.tanh(out * hi) / np.tanh(hi)
        return out * 0.86


def parse(s, base, octave_shift=0):
    """简谱串：'5:1 6:0.5^ 1\\':2~ 0:1'。' 高八度，, 低八度；^ 上倚音，v 下倚音，~ 多吟，g 滑音，! 重音。"""
    ev, beat = [], 0.0
    for tok in s.split():
        if tok == '|':
            continue
        flags = ''
        while tok and tok[-1] in '^v~g!':
            flags += tok[-1]
            tok = tok[:-1]
        p, _, d = tok.partition(':')
        d = float(d) if d else 1.0
        deg = int(p[0])
        if deg:
            m = base + DEG[deg] + 12 * (p.count("'") - p.count(',')) + 12 * octave_shift
            ev.append((beat, d, m, flags))
        beat += d
    return ev, beat


CH = {1: (0, 4, 7), 2: (2, 7, 9), 3: (4, 9, 12), 5: (7, 9, 14), 6: (9, 12, 16)}   # 五声里的和音，相对宫音的半音数


def bars(s, per=4.0):
    """核对简谱：每小节的拍数要对。"""
    for i, bar in enumerate(s.split('|')):
        tot = sum(float(tok.rstrip('^v~g!').partition(':')[2] or 1) for tok in bar.split())
        assert abs(tot - per) < 1e-6, '第 %d 小节是 %.2f 拍：%s' % (i + 1, tot, bar)
    return s


def ogg(name, stereo, loop=True):
    os.makedirs(OUT, exist_ok=True)
    wav = os.path.join(OUT, name + '.raw')
    (np.clip(stereo.T, -1, 1) * 32767).astype('<i2').tofile(wav)
    dst = os.path.join(OUT, name + '.ogg')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', wav, '-c:a', 'libvorbis', '-q:a', '3.5', dst], check=True)
    os.remove(wav)
    b64 = base64.b64encode(open(dst, 'rb').read()).decode()
    with open(os.path.join(OUT, name + '.js'), 'w') as f:
        f.write("window.JX_MUSIC=window.JX_MUSIC||{};window.JX_MUSIC[%s]={b64:%s};\n" % (json.dumps(name), json.dumps(b64)))
    sec = stereo.shape[1] / SR
    print('%s: %.1f 秒，峰值 %.2f，均方根 %.3f，接缝跳变 %.4f，文件 %.0f KB' % (name, sec, np.abs(stereo).max(), np.sqrt((stereo ** 2).mean()), np.abs(stereo[:, 0] - stereo[:, -1]).max(), os.path.getsize(dst) / 1024))
    os.remove(dst)


# ---------------------------------------------------------------- 曲子
D4 = 62
THEME_A = "3:1 5:1 6:2~ | 1':1 6:0.5 5:0.5 3:2 | 2:1 3:1 5:1 6:1^ | 5:4~ | 6:1 1':1 2':2~ | 3':1^ 2':0.5 1':0.5 6:2 | 5:1 6:1 1':1 2':1 | 1':4~"
THEME_B = "2':1.5 3':0.5 2':1 1':1 | 6:2~ 5:1 6:1 | 1':1 2':1^ 1':1 6:1 | 5:3~ 3:1 | 2:1 3:1 5:1 3:1 | 2:2~ 1:1 2:1 | 3:1 5:1 6:1 1':1^ | 6:2 5:2~"


def zhuti():
    """主题《惊蛰》：标题画面。筝的分解和音托着箫。"""
    bpm = 66
    mel, beats = parse(THEME_A + ' | ' + THEME_B, D4)
    mx = Mix(beats, bpm)
    for b, d, m, fl in mel:
        mx.add(flute(m2f(m), d * 60 / bpm, 0.9, 'xiao', grace=(2 if '^' in fl else 0), vib=20 if '~' in fl else 12, seed=int(b * 7)), b, pan=0.12, rev=0.5)
    roots = [1, 6, 2, 5, 6, 1, 5, 1, 2, 6, 1, 5, 1, 2, 6, 5]
    k = 0
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        seq = [a - 12, e - 12, c, e, a, c, e - 12, c] if bar % 2 == 0 else [a - 12, c, e, a + 12, e, c, a, e - 12]
        for i, off in enumerate(seq):
            m = D4 + off - (12 if i == 0 else 0)
            k += 1
            mx.add(pluck(m2f(m), 2.6, 0.5 if i else 0.72, bright=0.62, t60=3.0, vib=6, seed=k), bar * 4 + i * 0.5, pan=-0.35 + 0.5 * (i % 4) / 4, rev=0.4)
        if bar % 4 == 3:                                        # 句尾一串刮奏
            for j, off in enumerate([-3, 0, 2, 4, 7, 9, 12, 14, 16, 19]):
                mx.add(pluck(m2f(D4 + off), 2.0, 0.26 + j * 0.012, bright=0.7, t60=2.4, seed=900 + j + bar), bar * 4 + 3.3 + j * 0.055, pan=-0.6 + j * 0.12, rev=0.5)
    for bar in (0, 8):
        mx.add(bell(1174, 2.4, 0.1), bar * 4, pan=0.5, rev=0.8)
    return mx.render(t60=2.6)


YX_A = "3:0.5 5:0.5 6:1 1':0.5 6:0.5 5:1 | 6:0.5 1':0.5 2':1^ 1':0.5 6:0.5 5:1 | 3:0.5 5:0.5 6:0.5 1':0.5 6:0.5 5:0.5 3:0.5 2:0.5 | 3:2~ 0:0.5 5:0.5 6:0.5 1':0.5 | 2':1^ 3':0.5 2':0.5 1':1 6:1 | 5:0.5 6:0.5 1':0.5 2':0.5 3':1^ 2':1 | 1':0.5 6:0.5 5:0.5 6:0.5 1':0.5 2':0.5 1':0.5 6:0.5 | 5:3~ 0:1"
YX_B = "6:1.5 1':0.5 2':1 3':1^ | 2':1 1':0.5 6:0.5 5:2~ | 3:1.5 5:0.5 6:1 1':1 | 6:1^ 5:0.5 3:0.5 2:2~ | 3:0.5 5:0.5 6:0.5 5:0.5 3:0.5 2:0.5 1:1 | 2:0.5 3:0.5 5:0.5 6:0.5 1':1^ 6:1 | 5:0.5 6:0.5 1':0.5 2':0.5 3':0.5 2':0.5 1':0.5 6:0.5 | 1':3~ 0:1"


def yuanxi():
    """《元夕》：醉春楼与灯市。笛领，琵琶和筝衬，板鼓点着。旋律是主题的快板变奏。"""
    bpm = 108
    mel, beats = parse(YX_A + ' | ' + YX_B + ' | ' + YX_A, D4, 1)
    mx = Mix(beats, bpm)
    for b, d, m, fl in mel:
        mx.add(flute(m2f(m), d * 60 / bpm * 0.96, 0.8, 'dizi', grace=(2 if '^' in fl else 0), vib=18 if '~' in fl else 10, seed=int(b * 11)), b, pan=0.1, rev=0.3)
    roots = [1, 6, 1, 6, 2, 5, 6, 5, 6, 5, 1, 2, 1, 2, 5, 1, 1, 6, 1, 6, 2, 5, 6, 5]
    k = 0
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        for i, off in enumerate([a - 12, e - 12, c, e - 12, a - 12, e - 12, c, e]):      # 琵琶：弹挑交替
            k += 1
            mx.add(pluck(m2f(D4 + off), 0.9, 0.34 if i % 2 else 0.5, bright=0.86, t60=1.0, pos=0.1, seed=k, body=0.15), bar * 4 + i * 0.5, pan=0.42, rev=0.18)
        mx.add(pluck(m2f(D4 + a - 24), 3.0, 0.62, bright=0.5, t60=3.2, seed=5000 + bar), bar * 4, pan=-0.4, rev=0.3)                # 筝的低音
        for j, off in enumerate([a, c, e, a + 12]):
            mx.add(pluck(m2f(D4 + off), 1.6, 0.3, bright=0.66, t60=2.2, seed=6000 + bar * 4 + j), bar * 4 + 2 + j * 0.125, pan=-0.45 + j * 0.08, rev=0.35)
        if bar % 8 in (3, 7):
            for j, off in enumerate([-3, 0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]):
                mx.add(pluck(m2f(D4 + off), 1.6, 0.22 + j * 0.01, bright=0.72, t60=2.0, seed=7000 + j + bar), bar * 4 + 3.35 + j * 0.045, pan=-0.7 + j * 0.1, rev=0.45)
        for beat, f0, amp in [(0, 150, 0.5), (1.5, 210, 0.28), (2, 150, 0.42), (2.5, 210, 0.24), (3.5, 210, 0.26)]:               # 小鼓
            mx.add(drum(f0, 0.3, amp, seed=bar), bar * 4 + beat, pan=-0.1, rev=0.2)
        for beat in (1, 3):
            mx.add(wood(1250, 0.09, 0.2), bar * 4 + beat, pan=0.25, rev=0.25)
        if bar % 8 == 0:
            mx.add(bell(1760, 1.6, 0.09), bar * 4, pan=0.55, rev=0.7)
    return mx.render(t60=1.5, wet=0.85)


XY_A = "6:3~ 1':1 | 2':2~ 1':1 6:1 | 5:1.5 6:0.5 3:2~ | 6:4~ | 3':2~ 2':1 1':1 | 2':3~ 6:1 | 1':1 6:1 5:1 3:1 | 6:4~"
XY_B = "6:2~ 5:1 6:1 | 1':3~ 6:1 | 2':1 1':1 6:1 5:1 | 3:4~ | 5:1 6:1 1':2~ | 2':2 3':2~ | 2':1 1':1 6:2~ | 6:4~"


def xueye():
    """《雪夜》：忆一。主题转到羽调，慢，箫与古琴，中间留白。"""
    bpm = 54
    mel, beats = parse(XY_A + ' | ' + XY_B, D4)
    mx = Mix(beats, bpm, tail=6)
    half = beats / 2
    for b, d, m, fl in mel:
        sec = d * 60 / bpm
        if b < half:
            mx.add(flute(m2f(m), sec, 0.85, 'xiao', grace=(-2 if d >= 3 else 0), vib=22 if '~' in fl else 10, seed=int(b * 13)), b, pan=0.1, rev=0.6)
        else:                                                   # 后半段古琴接过旋律，箫只在长音上应一声
            mx.add(pluck(m2f(m - 12), sec + 1.5, 0.8, bright=0.4, t60=4.5, pos=0.24, glide=1.0 if d >= 2 else 0, vib=26 if '~' in fl else 8, seed=int(b * 17)), b, pan=-0.2, rev=0.5)
            if d >= 3:
                mx.add(flute(m2f(m), sec * 0.8, 0.42, 'xiao', vib=20, seed=int(b * 19)), b + 0.5, pan=0.3, rev=0.8)
    for bar in range(16):
        low = [47, 47, 52, 47, 54, 52, 50, 47][bar % 8]          # 古琴空弦：B、E、升F、D
        mx.add(pluck(m2f(low), 5.0, 0.55, bright=0.32, t60=5.5, pos=0.26, vib=10, seed=300 + bar), bar * 4, pan=-0.3, rev=0.45)
        mx.add(pluck(m2f(low + 7), 4.0, 0.3, bright=0.34, t60=4.5, pos=0.26, seed=340 + bar), bar * 4 + 0.07, pan=-0.25, rev=0.45)
        if bar % 2 == 1:
            mx.add(harmonic(m2f([83, 78, 86, 83][(bar // 2) % 4]), 3.0, 0.12), bar * 4 + 2, pan=0.5, rev=0.9)
    return mx.render(t60=3.4, wet=1.1)


# ---- 以下六首是 0.2.0 加的：一个场合一种气质 ----
KT = 65
KT_A = bars("2:1 3:0.5 5:0.5 6:1 5:1 | 3:1.5 2:0.5 1:2~ | 2:1 5:1 3:1 2:0.5 1:0.5 | 6,:3~ 0:1 | 1:1 2:0.5 3:0.5 5:1 6:1 | 1':1.5 6:0.5 5:2~ | 3:1 5:0.5 3:0.5 2:1 1:1 | 2:3~ 0:1")
KT_B = bars("5:1.5 6:0.5 1':1 6:1 | 5:1 3:1 2:2~ | 3:1 5:1 6:1 5:0.5 3:0.5 | 2:3~ 0:1 | 6,:1 1:1 2:1 3:1 | 5:2~ 3:1 2:1 | 1:1 2:0.5 3:0.5 2:1 6,:1 | 2:4~")


def kaitan():
    """《开坛》：酒窖。商调，不紧不慢。古琴弹旋律，阮走低音，后半箫接过去。"""
    bpm = 76
    mel, beats = parse(KT_A + ' | ' + KT_B, KT)
    mx = Mix(beats, bpm, tail=5)
    half = beats / 2
    for b, d, m, fl in mel:
        sec = d * 60 / bpm
        if b < half:
            mx.add(pluck(m2f(m - 12), sec + 1.2, 1.5, bright=0.5, t60=3.6, pos=0.22, glide=0.8 if d >= 1.5 else 0, vib=22 if '~' in fl else 6, seed=int(b * 23)), b, pan=-0.12, rev=0.4)
            mx.add(pluck(m2f(m), sec + 0.8, 0.5, bright=0.5, t60=2.6, pos=0.22, seed=int(b * 27)), b, pan=-0.05, rev=0.4)
        else:
            mx.add(flute(m2f(m), sec * 0.97, 0.46, 'xiao', grace=(2 if d >= 2 else 0), vib=18 if '~' in fl else 9, seed=int(b * 29)), b, pan=0.15, rev=0.5)
            if d >= 2:                                           # 长音底下古琴应一声
                mx.add(pluck(m2f(m - 12), sec + 1.0, 0.7, bright=0.42, t60=3.2, pos=0.22, vib=14, seed=int(b * 31)), b + 0.5, pan=-0.2, rev=0.45)
    roots = [2, 1, 2, 6, 1, 5, 3, 2, 5, 2, 3, 2, 6, 5, 1, 2]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        for i, off in enumerate([a - 24, e - 24, c - 12, e - 24]):          # 阮：一拍一个，走着
            mx.add(pluck(m2f(KT + off), 1.1, 0.8 if i == 0 else 0.56, bright=0.55, t60=1.3, pos=0.2, seed=bar * 9 + i, body=0.35), bar * 4 + i, pan=0.3, rev=0.25)
        mx.add(wood(820, 0.08, 0.1), bar * 4 + 1.5, pan=-0.3, rev=0.35)
        mx.add(wood(980, 0.08, 0.08), bar * 4 + 3.5, pan=-0.25, rev=0.35)
        if bar % 4 == 3:
            mx.add(harmonic(m2f(KT + 14 + 12), 2.6, 0.09), bar * 4 + 2.5, pan=0.5, rev=0.8)
    return mx.render(t60=2.2, wet=0.95, level=0.17)


A4 = 69
ZH_A = bars("5:0.5 5:0.5 6:0.5 1':0.5 2':1 1':0.5 6:0.5 | 5:0.5 6:0.5 5:0.5 3:0.5 2:1 0:0.5 3:0.5 | 5:0.5 5:0.5 6:0.5 1':0.5 2':0.5 3':0.5 2':0.5 1':0.5 | 6:1 5:1^ 0:1 5:0.5 6:0.5 | 1':0.5 1':0.5 2':0.5 1':0.5 6:1 5:0.5 3:0.5 | 2:0.5 3:0.5 5:0.5 6:0.5 5:1 0:0.5 3:0.5 | 2:0.5 3:0.5 5:0.5 3:0.5 2:0.5 1:0.5 6,:0.5 1:0.5 | 2:1 5:1! 0:2")
ZH_B = bars("3':1.5 2':0.5 1':1 6:1 | 1':0.5 2':0.5 1':0.5 6:0.5 5:2~ | 6:1.5 1':0.5 2':1 3':1^ | 2':3~ 0:1 | 3':0.5 3':0.5 2':0.5 1':0.5 2':1 6:1 | 1':0.5 1':0.5 6:0.5 5:0.5 6:1 3:1 | 5:0.5 6:0.5 1':0.5 2':0.5 3':0.5 2':0.5 1':0.5 6:0.5 | 5:2~ 0:2")


def zaohuo():
    """《灶火》：后厨。徵调快板，笛子吹得短而跳，琵琶跟着，板和小锣凑热闹。"""
    bpm = 126
    mel, beats = parse(ZH_A + ' | ' + ZH_B + ' | ' + ZH_A, A4)
    mx = Mix(beats, bpm, tail=3.5)
    spb = 60 / bpm
    for b, d, m, fl in mel:
        short = d <= 0.5
        mx.add(flute(m2f(m), d * spb * (0.62 if short else 0.92), 0.8 * (1.15 if '!' in fl else 1), 'dizi', grace=(2 if '^' in fl else 0), vib=16 if '~' in fl else 0, seed=int(b * 37)), b, pan=0.1, rev=0.25)
        mx.add(pluck(m2f(m - 12), 0.5 if short else 0.9, 0.3, bright=0.88, t60=0.8, pos=0.1, seed=int(b * 41), body=0.15), b, pan=0.45, rev=0.15)
    roots = [5, 5, 5, 2, 1, 2, 2, 5, 3, 5, 6, 2, 3, 6, 5, 5, 5, 5, 5, 2, 1, 2, 2, 5]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        mid = 8 <= bar < 16
        for i, off in enumerate([a - 12, e - 12, c, e - 12, a - 12, c, e - 12, c]):                    # 阮与琵琶：八分音符垫着
            if mid and i % 2:
                continue
            mx.add(pluck(m2f(A4 + off - 12), 0.7, 0.4 if i % 2 == 0 else 0.26, bright=0.7, t60=0.9, pos=0.16, seed=bar * 17 + i, body=0.3), bar * 4 + i * 0.5, pan=-0.4, rev=0.18)
        for beat, fq, amp in ([(0, 1250, 0.3), (1, 1250, 0.16), (1.5, 1560, 0.14), (2, 1250, 0.24), (3, 1250, 0.16), (3.5, 1560, 0.16)] if not mid else [(0, 1250, 0.24), (2, 1250, 0.18), (3.5, 1560, 0.12)]):
            mx.add(wood(fq, 0.08, amp), bar * 4 + beat, pan=0.25, rev=0.2)
        for beat, f0, amp in ([(0, 170, 0.42), (1.5, 230, 0.22), (2.5, 230, 0.24), (3, 170, 0.3)] if not mid else [(0, 170, 0.3), (2.5, 230, 0.18)]):
            mx.add(drum(f0, 0.26, amp, seed=bar + 3), bar * 4 + beat, pan=-0.1, rev=0.18)
        if bar % 8 in (3, 7):                                                                          # 句尾小锣“台”一声
            mx.add(gong(880, 0.7, 0.34, bend=0.09, seed=bar), bar * 4 + (2 if bar % 8 == 3 else 2.5), pan=0.5, rev=0.3)
    return mx.render(t60=1.2, wet=0.8, level=0.2)


G4 = 67
DS_A = bars("1':1 1':0.5 2':0.5 3':1 5':1 | 3':0.5 2':0.5 1':0.5 2':0.5 3':2~ | 5':1 3':0.5 5':0.5 6':1 5':1 | 3':0.5 5':0.5 3':0.5 2':0.5 1':2~ | 6:1 1':0.5 2':0.5 3':1 2':0.5 1':0.5 | 6:0.5 1':0.5 6:0.5 5:0.5 3:1 5:1 | 6:0.5 1':0.5 2':0.5 3':0.5 5':1 3':0.5 2':0.5 | 1':3! 0:1")
DS_B = bars("3:1 5:1 6:1.5 5:0.5 | 6:1 1':1 2':2~ | 1':1 6:1 5:1.5 3:0.5 | 5:3~ 0:1 | 6:1 1':1 2':1.5 3':0.5 | 2':1 1':1 6:2~ | 5:0.5 6:0.5 1':0.5 2':0.5 3':1 2':1 | 5:1 6:1 2':2~")


def dengshi():
    """《灯市》：门首御街。宫调，锣鼓开道，笛子领着，中段让给筝。"""
    bpm = 112
    intro = 8.0
    mel, beats = parse(DS_A + ' | ' + DS_B + ' | ' + DS_A, G4)
    mx = Mix(beats + intro, bpm, tail=4)
    spb = 60 / bpm

    def luogu(b0, pat):
        for beat, what, amp in pat:
            if what == 'd':
                mx.add(dagu(78, 0.8, amp, seed=int(beat * 7) + 1), b0 + beat, pan=-0.15, rev=0.22)
            elif what == 'x':
                mx.add(drum(190, 0.24, amp, seed=int(beat * 5) + 2), b0 + beat, pan=-0.05, rev=0.2)
            elif what == 'c':
                mx.add(cymbal(0.42, amp, seed=int(beat * 3) + 4), b0 + beat, pan=0.35, rev=0.3)
            elif what == 't':
                mx.add(gong(900, 0.6, amp, bend=0.09, seed=int(beat) + 5), b0 + beat, pan=0.5, rev=0.3)
            elif what == 'k':
                mx.add(gong(260, 2.6, amp, bend=-0.05, seed=int(beat) + 6), b0 + beat, pan=0.0, rev=0.45)
    # 开场两小节：咚 咚 | 咚咚 锵 ‖ 咚锵 咚锵 | 咚咚咚咚 匡
    luogu(0, [(0, 'd', 0.7), (1, 'd', 0.6), (2, 'd', 0.55), (2.5, 'd', 0.5), (3, 'c', 0.5), (3, 't', 0.3),
              (4, 'd', 0.6), (4.5, 'c', 0.4), (5, 'd', 0.6), (5.5, 'c', 0.4), (6, 'x', 0.4), (6.25, 'x', 0.34), (6.5, 'x', 0.4), (6.75, 'x', 0.46), (7, 'k', 0.6), (7, 'd', 0.7), (7, 'c', 0.5)])
    for b, d, m, fl in mel:
        sec = d * spb
        mid = 32 <= b < 64
        if not mid:
            mx.add(flute(m2f(m), sec * 0.94, 0.8 * (1.15 if '!' in fl else 1), 'dizi', grace=(2 if d >= 1 and int(b * 2) % 3 == 0 else 0), vib=18 if '~' in fl else 8, seed=int(b * 43)), intro + b, pan=0.1, rev=0.3)
        else:                                                   # 中段：筝弹旋律，带八度；笛子只在长音上远远应一句
            mx.add(pluck(m2f(m), sec + 1.2, 1.5, bright=0.66, t60=2.4, glide=0.6 if d >= 1.5 else 0, vib=16 if '~' in fl else 5, seed=int(b * 47)), intro + b, pan=-0.3, rev=0.4)
            mx.add(pluck(m2f(m - 12), sec + 1.2, 0.9, bright=0.6, t60=2.6, seed=int(b * 53)), intro + b, pan=-0.38, rev=0.4)
            if d >= 2:
                mx.add(flute(m2f(m + 12 if m < 76 else m), sec * 0.7, 0.36, 'dizi', vib=16, seed=int(b * 59)), intro + b + 0.5, pan=0.4, rev=0.7)
    roots = [1, 1, 5, 1, 6, 6, 5, 1, 3, 2, 6, 5, 6, 2, 1, 5, 1, 1, 5, 1, 6, 6, 5, 1]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        b0 = intro + bar * 4
        mid = 8 <= bar < 16
        for i, off in enumerate([a - 12, c, e - 12, c, a - 12, e, c, e - 12]):                            # 琵琶
            mx.add(pluck(m2f(G4 + off), 0.8, (0.3 if i % 2 else 0.44) * (1.3 if mid else 1), bright=0.86, t60=0.95, pos=0.1, seed=bar * 19 + i, body=0.15), b0 + i * 0.5, pan=0.45, rev=0.18)
        mx.add(pluck(m2f(G4 + a - 24), 2.6, 0.56, bright=0.5, t60=3.0, seed=4000 + bar), b0, pan=-0.4, rev=0.3)
        if not mid:
            luogu(b0, [(0, 'd', 0.5), (1, 'c', 0.26), (1.5, 'x', 0.26), (2, 'd', 0.4), (2.5, 'x', 0.24), (3, 'c', 0.28), (3.5, 'x', 0.28)])
            if bar % 4 == 3:
                luogu(b0, [(2, 't', 0.3), (3, 't', 0.26)])
            if bar % 8 == 0:
                luogu(b0, [(0, 'k', 0.42)])
            if bar % 8 == 7:                                    # 句尾筝的刮奏
                for j, off in enumerate([-5, -3, 0, 2, 4, 7, 9, 12, 14, 16, 19, 21]):
                    mx.add(pluck(m2f(G4 + off), 1.6, 0.22 + j * 0.01, bright=0.72, t60=2.0, seed=8000 + j + bar), b0 + 3.3 + j * 0.045, pan=-0.7 + j * 0.1, rev=0.45)
        else:
            luogu(b0, [(0, 'x', 0.26), (2, 'x', 0.2), (3.5, 'x', 0.16)])
            mx.add(wood(1250, 0.09, 0.16), b0 + 1, pan=0.25, rev=0.25)
            mx.add(wood(1250, 0.09, 0.14), b0 + 3, pan=0.25, rev=0.25)
            if bar == 15:                                       # 回到头一段之前，锣鼓先起
                luogu(b0, [(2, 'd', 0.5), (2.5, 'd', 0.5), (3, 'd', 0.55), (3.5, 'c', 0.4), (3.5, 't', 0.3)])
    return mx.render(t60=1.5, wet=0.85, level=0.2)


F4 = 65
LS_A = bars("6:2~ 1':1 2':1 | 3':2~ 2':1 1':1 | 6:1 1':0.5 6:0.5 5:1 3:1 | 6:4~ | 2':2~ 3':1 5':1 | 3':1.5 2':0.5 1':2~ | 2':1 1':1 6:1 5:1 | 3:4~")
LS_B = bars("3:1 5:1 6:2~ | 1':1 2':1 3':2~ | 5':2~ 3':1 2':1 | 1':1 6:1 2':2~ | 3':1 2':0.5 1':0.5 6:1 5:1 | 6:1 1':1 2':1.5 1':0.5 | 6:1 5:0.5 3:0.5 5:1 6:1 | 6:4~")


def lanshan():
    """《阑珊》：秋水的曲子。羽调慢板，琵琶轮指唱前半，箫接后半。"""
    bpm = 60
    mel, beats = parse(LS_A + ' | ' + LS_B, F4)
    mx = Mix(beats, bpm, tail=6)
    half = beats / 2
    for b, d, m, fl in mel:
        sec = d * 60 / bpm
        if b < half:
            if d >= 1:
                mx.add(tremolo(m2f(m), sec * 0.96, 1.5, rate=10.5, seed=int(b * 61)), b, pan=0.18, rev=0.45)
            else:
                mx.add(pluck(m2f(m), 0.9, 1.5, bright=0.8, t60=1.1, pos=0.1, seed=int(b * 67), body=0.15), b, pan=0.18, rev=0.4)
        else:
            mx.add(flute(m2f(m), sec * 0.98, 0.5, 'xiao', grace=(2 if '~' in fl and d >= 2 else 0), vib=22 if '~' in fl else 10, seed=int(b * 71)), b, pan=-0.1, rev=0.6)
    roots = [6, 3, 6, 6, 2, 1, 2, 3, 3, 1, 5, 2, 3, 6, 5, 6]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        b0 = bar * 4
        if bar < 8:                                             # 前半：筝在底下慢慢分解
            for i, off in enumerate([a - 24, e - 12, c - 12, e - 12]):
                mx.add(pluck(m2f(F4 + off), 2.6, 0.8 if i else 1.1, bright=0.55, t60=3.2, vib=6, seed=bar * 23 + i), b0 + i, pan=-0.4 + 0.1 * i, rev=0.45)
        else:                                                   # 后半：琵琶退到底下，弹挑分解
            for i, off in enumerate([a - 12, e - 12, c, e, a, e, c, e - 12]):
                mx.add(pluck(m2f(F4 + off), 1.3, 0.44 if i % 2 else 0.6, bright=0.8, t60=1.4, pos=0.12, seed=bar * 29 + i, body=0.15), b0 + i * 0.5, pan=0.35, rev=0.35)
            mx.add(pluck(m2f(F4 + a - 24), 3.6, 0.8, bright=0.48, t60=4.0, seed=bar * 31), b0, pan=-0.4, rev=0.45)
        if bar % 4 == 3:
            mx.add(harmonic(m2f(F4 + 9 + 12 if bar % 8 == 7 else F4 + 4 + 12), 3.2, 0.1), b0 + 1, pan=0.55, rev=0.9)
            mx.add(bell(1396, 2.2, 0.05), b0 + 3, pan=-0.5, rev=0.9)
    return mx.render(t60=3.0, wet=1.05, level=0.18)


C4 = 60
AL_A = bars("3:3~ 4:1 | 3:2 2:1 3:1 | 6:3~ 5:1 | 3:4~ | 3:1 6:1 7:2~ | 6:2 4:1 3:1 | 2:1.5 3:0.5 2:1 1:1 | 3:4~")
AL_B = bars("6,:2~ 7,:1 1:1 | 3:3~ 0:1 | 4:2~ 3:1 2:1 | 3:4~ | 6:2~ 7:1 1':1 | 7:2 6:1 4:1 | 3:2~ 2:1 7,:1 | 6,:4~")


def anliu():
    """《暗流》：不对劲的时候。角音上压着清角，低音不动，箫吹得又低又慢。"""
    bpm = 58
    mel, beats = parse(AL_A + ' | ' + AL_B, C4)
    mx = Mix(beats, bpm, tail=6)
    half = beats / 2
    for b, d, m, fl in mel:
        sec = d * 60 / bpm
        if b < half:
            mx.add(flute(m2f(m), sec * 0.98, 0.48, 'xiao', grace=(-1 if d >= 3 else 0), vib=24 if '~' in fl else 6, seed=int(b * 73)), b, pan=0.12, rev=0.7)
        else:
            mx.add(pluck(m2f(m - 12), sec + 2.0, 1.4, bright=0.4, t60=4.8, pos=0.26, glide=1.0 if d >= 2 else 0, vib=30 if '~' in fl else 8, seed=int(b * 79)), b, pan=-0.15, rev=0.55)
            if d >= 3:
                mx.add(flute(m2f(m + 12), sec * 0.7, 0.2, 'xiao', vib=22, seed=int(b * 83)), b + 1, pan=0.4, rev=0.9)
    for bar in range(16):
        b0 = bar * 4
        low = 40 if bar % 8 < 6 else 45                         # 低音守着 E，句尾才挪到 A
        mx.add(pluck(m2f(low), 6.0, 0.9, bright=0.3, t60=6.0, pos=0.28, vib=8, seed=500 + bar), b0, pan=-0.3, rev=0.5)
        mx.add(tremolo(m2f(low + 12), 3.4, 0.2, rate=13, bright=0.55, seed=600 + bar), b0 + 0.5, pan=0.3, rev=0.6)
        mx.add(dagu(52, 0.9, 0.28, seed=bar), b0, pan=0, rev=0.4)                                   # 心跳一样的两下
        mx.add(dagu(52, 0.9, 0.18, seed=bar + 40), b0 + 0.42, pan=0, rev=0.4)
        if bar % 2 == 1:
            mx.add(wood(640, 0.1, 0.12), b0 + 2.5, pan=-0.5, rev=0.7)
            mx.add(wood(640, 0.1, 0.07), b0 + 2.75, pan=-0.5, rev=0.7)
        if bar % 4 == 2:
            mx.add(harmonic(m2f(89), 3.4, 0.07), b0 + 3, pan=0.55, rev=0.95)                         # 高处一点冷光：清角
        if bar % 8 == 7:
            mx.add(gong(150, 4.0, 0.22, bend=-0.03, seed=bar), b0 + 2, pan=0, rev=0.8)
    return mx.render(t60=3.6, wet=1.15, level=0.17)


JF_A = bars("6:1 6:0.5 1':0.5 2':1 3':1 | 2':0.5 1':0.5 6:0.5 1':0.5 2':2 | 3':1 3':0.5 5':0.5 6':1 5':1 | 3':0.5 2':0.5 3':0.5 5':0.5 3':2 | 6':1 5':0.5 3':0.5 2':1 3':1 | 5':0.5 3':0.5 2':0.5 1':0.5 6:2 | 1':0.5 2':0.5 3':0.5 2':0.5 1':0.5 6:0.5 5:0.5 6:0.5 | 6:3! 0:1")
JF_B = bars("3:2 5:1 6:1 | 1':2 6:1 5:1 | 3:1 5:1 6:1 1':1 | 2':3 0:1 | 3':2 2':1 1':1 | 2':2 1':1 6:1 | 5:1 6:1 1':1 2':1 | 3':2 5':2")


def jiaofeng():
    """《交锋》：动手的时候。羽调急板，大鼓和钹催着，琵琶扫弦，笛子在上面。"""
    bpm = 152
    mel, beats = parse(JF_A + ' | ' + JF_B + ' | ' + JF_A, A4)
    mx = Mix(beats, bpm, tail=3.5)
    spb = 60 / bpm
    for b, d, m, fl in mel:
        mid = 32 <= b < 64
        sec = d * spb
        if not mid:
            mx.add(flute(m2f(m), sec * (0.7 if d <= 0.5 else 0.93), 0.8 * (1.2 if '!' in fl else 1), 'dizi', grace=(2 if d >= 2 else 0), vib=20 if d >= 2 else 0, seed=int(b * 89)), b, pan=0.1, rev=0.28)
            mx.add(pluck(m2f(m - 12), 0.5, 0.3, bright=0.9, t60=0.7, pos=0.09, seed=int(b * 97), body=0.15), b, pan=0.4, rev=0.15)
        else:                                                   # 中段：琵琶轮指在中音区顶着，笛子高八度拉长音
            mx.add(tremolo(m2f(m), sec * 0.97, 1.1, rate=13, seed=int(b * 101)), b, pan=0.35, rev=0.3)
            if d >= 2:
                mx.add(flute(m2f(m + 12 if m < 78 else m), sec * 0.95, 0.5, 'dizi', vib=20, seed=int(b * 103)), b, pan=-0.1, rev=0.4)
    roots = [6, 6, 3, 3, 6, 6, 1, 6, 3, 1, 3, 2, 3, 2, 5, 3, 6, 6, 3, 3, 6, 6, 1, 6]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        b0 = bar * 4
        mid = 8 <= bar < 16
        mx.add(strum([A4 + a - 24, A4 + e - 24, A4 + a - 12, A4 + c - 12], 1.0, 0.36, seed=bar), b0, pan=0.45, rev=0.2)             # 扫弦
        mx.add(strum([A4 + a - 24, A4 + e - 24, A4 + a - 12], 0.8, 0.28, seed=bar + 50), b0 + 2.5, pan=0.45, rev=0.2)
        for i in range(8):                                                                                                    # 低音不停
            mx.add(pluck(m2f(A4 + (a if i % 4 != 3 else e - 12) - 24), 0.5, 0.42 if i % 2 == 0 else 0.3, bright=0.6, t60=0.7, pos=0.18, seed=bar * 37 + i, body=0.35), b0 + i * 0.5, pan=-0.4, rev=0.15)
        pat = [(0, 'd', 0.46), (1, 'x', 0.32), (1.5, 'd', 0.3), (2, 'x', 0.36), (2.5, 'd', 0.36), (3, 'x', 0.32), (3.5, 'x', 0.36)] if not mid else [(0, 'd', 0.38), (1.5, 'x', 0.24), (2, 'd', 0.28), (3, 'x', 0.24), (3.5, 'x', 0.22)]
        for beat, what, amp in pat:
            if what == 'd':
                mx.add(dagu(70, 0.6, amp, seed=bar + int(beat * 2)), b0 + beat, pan=-0.1, rev=0.2)
            else:
                mx.add(drum(200, 0.2, amp, seed=bar + int(beat * 2)), b0 + beat, pan=0.05, rev=0.18)
        if not mid:
            mx.add(cymbal(0.3, 0.22, seed=bar), b0 + 1, pan=0.3, rev=0.25)
            mx.add(cymbal(0.3, 0.26, seed=bar + 9), b0 + 3, pan=0.3, rev=0.25)
        if bar % 4 == 0:
            mx.add(cymbal(0.9, 0.4, seed=bar + 20), b0, pan=0.2, rev=0.35)
        if bar % 8 == 7:
            for j in range(4):                                                                                                # 句尾一串急鼓
                mx.add(drum(200 - j * 12, 0.2, 0.3 + j * 0.06, seed=j), b0 + 3 + j * 0.25, pan=0, rev=0.2)
            mx.add(gong(240, 2.4, 0.4, bend=-0.05, seed=bar), b0 + 4 if bar < 23 else b0 + 3, pan=0, rev=0.4)
    return mx.render(t60=1.2, wet=0.75, level=0.2)


# ---- 以下三首是 0.8.0 加的：白天的临安 ----
SS_A = bars("5:1 6:0.5 1':0.5 2':1 1':0.5 6:0.5 | 5:1 3:0.5 5:0.5 6:2~ | 1':1 2':0.5 3':0.5 2':1 1':0.5 6:0.5 | 5:3~ 0:1 | 3:1 5:0.5 6:0.5 1':1 6:0.5 5:0.5 | 3:1 2:0.5 3:0.5 5:2~ | 6:0.5 1':0.5 6:0.5 5:0.5 3:1 2:1 | 5:3! 0:1")
SS_B = bars("2':2~ 1':1 6:1 | 1':1 2':1 3':2~ | 5':1.5 3':0.5 2':1 1':1 | 2':3~ 0:1 | 6:1 1':1 2':1.5 1':0.5 | 6:1 5:1 3:2~ | 5:1 6:0.5 1':0.5 2':1 3':1^ | 2':2~ 5:2")


def shisheng():
    """《市声》：白天的临安街上。徵调，不快不慢地走着。筝弹旋律，阮一步一步垫着，碰铃和板点着拍子；中段笛子接过去。没有鼓。"""
    bpm = 104
    mel, beats = parse(SS_A + ' | ' + SS_B + ' | ' + SS_A, D4)
    mx = Mix(beats, bpm, tail=4)
    spb = 60 / bpm
    for b, d, m, fl in mel:
        sec = d * spb
        mid = 32 <= b < 64
        if not mid:
            mx.add(pluck(m2f(m), sec + 1.1, 1.8 * (1.15 if '!' in fl else 1), bright=0.7, t60=2.2, glide=0.6 if d >= 2 else 0, vib=16 if '~' in fl else 4, seed=int(b * 61)), b, pan=-0.2, rev=0.35)
            mx.add(pluck(m2f(m - 12), sec + 1.0, 0.85, bright=0.6, t60=2.4, seed=int(b * 67)), b, pan=-0.3, rev=0.35)
            if b >= 64 and d >= 1:                              # 回来的时候，笛子在高处轻轻跟着长一点的音
                mx.add(flute(m2f(m + 12 if m < 76 else m), sec * 0.9, 0.3, 'dizi', vib=14, seed=int(b * 71)), b, pan=0.35, rev=0.55)
        else:                                                   # 中段：笛子吹旋律，筝退成分解和音
            mx.add(flute(m2f(m), sec * 0.95, 0.46, 'dizi', grace=(2 if '^' in fl else 0), vib=18 if '~' in fl else 8, seed=int(b * 73)), b, pan=0.15, rev=0.4)
            if d >= 2:
                mx.add(pluck(m2f(m - 12), sec + 1.0, 0.8, bright=0.62, t60=2.4, vib=10, seed=int(b * 79)), b + 0.5, pan=-0.3, rev=0.4)
    roots = [5, 5, 1, 5, 3, 5, 6, 5, 2, 1, 5, 2, 6, 3, 5, 2, 5, 5, 1, 5, 3, 5, 6, 5]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        b0 = bar * 4
        mid = 8 <= bar < 16
        for beat, off, amp in [(0, a - 24, 0.8), (1, c - 12, 0.34), (1.5, e - 12, 0.3), (2, e - 24, 0.6), (3, c - 12, 0.34), (3.5, e - 12, 0.3)]:      # 阮：走着
            mx.add(pluck(m2f(D4 + off), 1.0, amp, bright=0.58, t60=1.2, pos=0.2, seed=bar * 11 + int(beat * 2), body=0.35), b0 + beat, pan=0.35, rev=0.22)
        if mid:
            for i, off in enumerate([a - 12, c - 12, e - 12, c, e - 12, c - 12, a, e - 12]):
                mx.add(pluck(m2f(D4 + off), 1.2, 0.3 if i % 2 else 0.42, bright=0.68, t60=1.8, seed=bar * 13 + i), b0 + i * 0.5, pan=-0.3, rev=0.35)
        mx.add(wood(1100, 0.08, 0.12), b0 + 1, pan=0.2, rev=0.3)
        mx.add(wood(1100, 0.08, 0.1), b0 + 3, pan=0.2, rev=0.3)
        if bar % 2 == 0:
            mx.add(bell(1760, 1.4, 0.06), b0, pan=0.5, rev=0.6)                                          # 碰铃
        if bar % 8 == 7:                                                                               # 句尾筝往上一刮
            for j, off in enumerate([-5, -3, 0, 2, 4, 7, 9, 12, 14]):
                mx.add(pluck(m2f(D4 + off), 1.4, 0.2 + j * 0.012, bright=0.72, t60=1.8, seed=9000 + j + bar), b0 + 3.45 + j * 0.05, pan=-0.6 + j * 0.12, rev=0.45)
    return mx.render(t60=1.6, wet=0.9, level=0.18)


WZ_A = bars("2:0.5 2:0.5 3:0.5 5:0.5 6:1 5:0.5 3:0.5 | 2:1 0:0.5 2:0.5 3:0.5 2:0.5 1:0.5 6,:0.5 | 2:0.5 3:0.5 5:0.5 6:0.5 1':1 6:0.5 5:0.5 | 6:1! 0:3 | 1':0.5 1':0.5 6:0.5 5:0.5 6:1 5:0.5 3:0.5 | 5:0.5 6:0.5 5:0.5 3:0.5 2:1 0:0.5 1:0.5 | 2:0.5 3:0.5 5:0.5 3:0.5 2:0.5 1:0.5 6,:0.5 1:0.5 | 2:2! 0:2")
WZ_B = bars("5:1 6:1 1':1.5 2':0.5 | 3':1 2':0.5 1':0.5 2':2~ | 1':1 6:1 5:1.5 6:0.5 | 5:1 3:1 2:2~ | 3:0.5 5:0.5 6:0.5 1':0.5 2':1 1':1 | 6:0.5 1':0.5 6:0.5 5:0.5 3:1 5:1 | 6:1 5:0.5 3:0.5 2:1 3:0.5 5:0.5 | 2:3~ 0:1")


def wazi():
    """《瓦子》：北瓦。商调快板，说唱的路子：琵琶一句一顿，顿的地方锣鼓接话；中段笛子唱开；回来时笛子和琵琶齐奏。"""
    bpm = 126
    intro = 8.0
    mel, beats = parse(WZ_A + ' | ' + WZ_B + ' | ' + WZ_A, G4)
    mx = Mix(beats + intro, bpm, tail=3.5)
    spb = 60 / bpm

    def lg(b0, pat):                                            # b 板鼓、d 堂鼓、t 小锣、c 钹、k 大锣
        for beat, what, amp in pat:
            if what == 'b':
                mx.add(drum(330, 0.12, amp, seed=int(beat * 9) + 1), b0 + beat, pan=-0.05, rev=0.15)
            elif what == 'd':
                mx.add(dagu(84, 0.6, amp, seed=int(beat * 7) + 2), b0 + beat, pan=-0.15, rev=0.2)
            elif what == 't':
                mx.add(gong(920, 0.5, amp, bend=0.1, seed=int(beat * 3) + 5), b0 + beat, pan=0.45, rev=0.28)
            elif what == 'c':
                mx.add(cymbal(0.3, amp, seed=int(beat * 5) + 4), b0 + beat, pan=0.3, rev=0.25)
            elif what == 'k':
                mx.add(gong(280, 2.0, amp, bend=-0.05, seed=int(beat) + 6), b0 + beat, pan=0.0, rev=0.4)
    # 开场两小节：嗒嗒 嗒 台 嗒嗒 | 仓才 仓才 嗒嗒嗒嗒 仓
    lg(0, [(0, 'b', 0.5), (0.5, 'b', 0.4), (1, 'b', 0.5), (2, 't', 0.4), (3, 'b', 0.4), (3.5, 'b', 0.44),
           (4, 'c', 0.44), (4, 'd', 0.5), (4.5, 't', 0.3), (5, 'c', 0.4), (5, 'd', 0.46), (5.5, 't', 0.3), (6, 'b', 0.4), (6.25, 'b', 0.36), (6.5, 'b', 0.42), (6.75, 'b', 0.48), (7, 'k', 0.5), (7, 'c', 0.46), (7, 'd', 0.6)])
    for b, d, m, fl in mel:
        sec = d * spb
        mid = 32 <= b < 64
        acc = 1.25 if '!' in fl else 1
        if not mid:
            if d >= 1.5:                                        # 长音用轮指
                mx.add(tremolo(m2f(m), sec * 0.9, 1.3 * acc, rate=14, seed=int(b * 107)), intro + b, pan=0.3, rev=0.25)
            else:
                mx.add(pluck(m2f(m), 0.55 if d <= 0.5 else 0.9, 2.1 * acc, bright=0.9, t60=0.8, pos=0.1, seed=int(b * 109), body=0.15), intro + b, pan=0.3, rev=0.18)
            if b >= 64:                                         # 最后一遍笛子高八度齐奏
                mx.add(flute(m2f(m + 12 if m < 74 else m), sec * (0.6 if d <= 0.5 else 0.9), 0.4 * acc, 'dizi', vib=0 if d < 1.5 else 16, seed=int(b * 113)), intro + b, pan=-0.1, rev=0.28)
        else:
            mx.add(flute(m2f(m), sec * 0.94, 0.46, 'dizi', grace=(2 if d >= 1 and int(b) % 3 == 0 else 0), vib=18 if '~' in fl else 8, seed=int(b * 127)), intro + b, pan=-0.05, rev=0.3)
    roots = [2, 2, 5, 6, 1, 5, 2, 2, 5, 2, 6, 2, 3, 6, 5, 2, 2, 2, 5, 6, 1, 5, 2, 2]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        b0 = intro + bar * 4
        mid = 8 <= bar < 16
        k = bar % 8
        mx.add(pluck(m2f(G4 + a - 24), 0.9, 0.7, bright=0.55, t60=1.0, pos=0.2, seed=bar * 7, body=0.35), b0, pan=-0.4, rev=0.2)                     # 阮：一、三拍
        mx.add(pluck(m2f(G4 + e - 24), 0.9, 0.5, bright=0.55, t60=1.0, pos=0.2, seed=bar * 7 + 1, body=0.35), b0 + 2, pan=-0.4, rev=0.2)
        if mid:
            for i, off in enumerate([a - 12, e - 12, c, e - 12, a - 12, c, e - 12, c]):                                                               # 琵琶垫八分
                mx.add(pluck(m2f(G4 + off), 0.6, 0.34 if i % 2 == 0 else 0.24, bright=0.86, t60=0.8, pos=0.1, seed=bar * 23 + i, body=0.15), b0 + i * 0.5, pan=0.4, rev=0.18)
            lg(b0, [(0, 'b', 0.3), (1, 'b', 0.2), (2, 'b', 0.26), (3, 'b', 0.2), (3.5, 'b', 0.2)])
            if k == 7:
                lg(b0, [(3, 'b', 0.4), (3.25, 'b', 0.4), (3.5, 'b', 0.46), (3.75, 'b', 0.5)])
        else:
            mx.add(strum([G4 + a - 12, G4 + e - 12, G4 + a, G4 + c], 0.7, 0.42, seed=bar), b0, pan=0.4, rev=0.2)                                       # 句头扫一下
            if k == 3:                                          # 琵琶只弹一拍，后三拍锣鼓接话：仓才 仓才 嗒嗒
                lg(b0, [(0, 'b', 0.34), (1, 'c', 0.42), (1, 'd', 0.46), (1.5, 't', 0.3), (2, 'c', 0.4), (2.5, 't', 0.3), (3, 'b', 0.4), (3.5, 'b', 0.44)])
            elif k == 7:                                        # 句尾：仓才 仓
                lg(b0, [(0, 'b', 0.34), (1, 'b', 0.3), (2, 'c', 0.42), (2, 'd', 0.46), (2.5, 't', 0.32), (3, 'k', 0.44), (3, 'c', 0.4), (3, 'd', 0.5)])
            else:
                lg(b0, [(0, 'b', 0.36), (0.5, 'b', 0.2), (1, 'b', 0.3), (1.5, 'b', 0.2), (2, 'b', 0.34), (2.5, 'b', 0.2), (3, 'b', 0.3), (3.5, 'b', 0.24)])
                mx.add(wood(1250, 0.07, 0.2), b0, pan=0.2, rev=0.2)
                mx.add(wood(1250, 0.07, 0.14), b0 + 2, pan=0.2, rev=0.2)
                if k in (1, 5):
                    lg(b0, [(3, 't', 0.26)])
    return mx.render(t60=1.1, wet=0.7, level=0.2)


MC_A = bars("1:2~ 2:1 3:1 | 5:3~ 3:1 | 6:2 5:1 3:1 | 2:4~ | 3:2~ 5:1 6:1 | 1':3~ 6:1 | 5:1.5 3:0.5 2:1 3:1 | 1:4~")
MC_B = bars("5:2~ 6:1 1':1 | 2':3~ 1':1 | 6:1 5:1 3:2~ | 5:4~ | 6:2 1':1 6:1 | 5:2~ 3:1 2:1 | 3:1 5:1 6:1.5 5:0.5 | 5:4~")


def meichuang():
    """《梅窗》：白天安静的屋子里。宫调慢板。古琴先弹，泛音点着；后半箫进来，古琴退到底下应着；句尾筝轻轻一拂。"""
    bpm = 60
    mel, beats = parse(MC_A + ' | ' + MC_B, D4)
    mx = Mix(beats, bpm, tail=6)
    half = beats / 2
    for b, d, m, fl in mel:
        sec = d * 60 / bpm
        if b < half:
            mx.add(pluck(m2f(m - 12), sec + 1.6, 1.8, bright=0.46, t60=4.2, pos=0.23, glide=0.9 if d >= 2 else 0, vib=24 if '~' in fl else 6, seed=int(b * 131)), b, pan=-0.12, rev=0.45)
            if d >= 2:
                mx.add(harmonic(m2f(m + 12), 2.8, 0.1), b + 1, pan=0.4, rev=0.85)
        else:
            mx.add(flute(m2f(m), sec * 0.96, 0.4, 'xiao', grace=(2 if d >= 3 else 0), vib=20 if '~' in fl else 9, seed=int(b * 137)), b, pan=0.12, rev=0.6)
            if d >= 2:
                mx.add(pluck(m2f(m - 12), sec + 1.2, 0.75, bright=0.42, t60=3.6, pos=0.23, vib=14, seed=int(b * 139)), b + 0.5, pan=-0.2, rev=0.5)
    roots = [1, 5, 6, 2, 3, 1, 5, 1, 5, 2, 6, 5, 6, 5, 3, 5]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        mx.add(pluck(m2f(D4 + a - 24), 5.0, 0.5, bright=0.32, t60=5.2, pos=0.26, vib=8, seed=500 + bar), bar * 4, pan=-0.3, rev=0.45)                # 古琴的空弦垫底
        mx.add(pluck(m2f(D4 + e - 24), 4.0, 0.26, bright=0.34, t60=4.4, pos=0.26, seed=540 + bar), bar * 4 + 2, pan=-0.25, rev=0.45)
        if bar % 4 == 3:                                        # 句尾筝一拂，很轻
            for j, off in enumerate([0, 2, 4, 7, 9, 12, 14]):
                mx.add(pluck(m2f(D4 + off + 12), 2.0, 0.1 + j * 0.008, bright=0.7, t60=2.2, seed=9500 + j + bar), bar * 4 + 2.6 + j * 0.07, pan=0.2 + j * 0.08, rev=0.7)
        if bar % 4 == 1:
            mx.add(bell(1760, 2.0, 0.035), bar * 4 + 3, pan=-0.5, rev=0.8)
    return mx.render(t60=3.0, wet=1.05, level=0.15)


F4 = 65
XC_A = bars("5:1.5 6:0.5 1':1 2':1 | 3':2~ 2':1 1':1 | 6:1.5 1':0.5 6:1 5:1 | 3:3~ 0:1 | 5:1.5 6:0.5 1':1 6:1 | 5:1 3:1 2:2~ | 3:1 5:1 6:1.5 5:0.5 | 5:3~ 0:1")
XC_B = bars("1':2~ 2':1 3':1 | 5':3~ 3':1 | 2':1.5 3':0.5 2':1 1':1 | 6:3~ 0:1 | 1':1 6:1 5:1.5 6:0.5 | 1':2~ 2':2 | 3':1 2':1 1':1 6:1 | 5:4~")
XC_C = bars("5:1.5 6:0.5 1':1 2':1 | 3':2~ 2':1 1':1 | 6:1.5 1':0.5 6:1 5:1 | 3:3~ 0:1 | 5:1.5 6:0.5 1':1 6:1 | 5:1 3:1 2:2~ | 3:1 2:1 1:1.5 2:0.5 | 1:4~")


def xingchuan():
    """《行船》：白天，运酒船在运河上往北走。宫调，行板。笛子吹旋律，筝在句尾刮一下像水；阮一长一短地垫着，是摇船的那个晃；中段筝接过旋律，笛子在上头拖长音。没有鼓。"""
    bpm = 76
    mel, beats = parse(XC_A + ' | ' + XC_B + ' | ' + XC_C, F4)
    mx = Mix(beats, bpm, tail=4.5)
    spb = 60 / bpm
    for b, d, m, fl in mel:
        sec = d * spb
        mid = 32 <= b < 64
        if not mid:
            mx.add(flute(m2f(m), sec * 0.96, 0.44, 'dizi', grace=(2 if '^' in fl else 0), vib=17 if '~' in fl else 7, seed=int(b * 151)), b, pan=0.1, rev=0.5)
        else:                                                   # 中段：筝弹旋律，带一点滑；长音上笛子在高处轻轻跟着
            mx.add(pluck(m2f(m - 12), sec + 1.3, 1.7, bright=0.68, t60=2.6, glide=0.7 if d >= 2 else 0, vib=16 if '~' in fl else 4, seed=int(b * 157)), b, pan=-0.2, rev=0.4)
            mx.add(pluck(m2f(m - 24), sec + 1.2, 0.7, bright=0.56, t60=2.8, seed=int(b * 163)), b, pan=-0.3, rev=0.4)
            if d >= 2:
                mx.add(flute(m2f(m), sec * 0.9, 0.24, 'dizi', vib=13, seed=int(b * 167)), b, pan=0.35, rev=0.6)
    roots = [1, 1, 6, 3, 1, 2, 6, 5, 1, 1, 2, 6, 6, 5, 1, 5, 1, 1, 6, 3, 1, 2, 5, 1]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        b0 = bar * 4
        mid = 8 <= bar < 16
        for beat, off, amp, ln in [(0, a - 24, 0.85, 1.8), (1.5, e - 24, 0.4, 0.8), (2, c - 12, 0.6, 1.6), (3.5, e - 12, 0.32, 0.8)]:      # 阮：一长一短，摇船的晃
            mx.add(pluck(m2f(F4 + off), ln, amp, bright=0.52, t60=1.5, pos=0.21, seed=bar * 17 + int(beat * 2), body=0.38), b0 + beat, pan=0.3, rev=0.25)
        if not mid:                                             # 筝的分解和音，很轻，像水一道一道过去
            for i, off in enumerate([a - 12, e - 12, c, e - 12, a, e - 12, c, e - 12]):
                mx.add(pluck(m2f(F4 + off), 1.4, 0.2 if i % 2 else 0.3, bright=0.66, t60=2.0, seed=bar * 19 + i), b0 + i * 0.5, pan=-0.35, rev=0.4)
        if bar % 4 == 3:                                        # 句尾：筝从低往高刮一道
            for j, off in enumerate([-12, -10, -8, -5, -3, 0, 2, 4, 7, 9, 12]):
                mx.add(pluck(m2f(F4 + off), 1.6, 0.16 + j * 0.012, bright=0.74, t60=2.0, seed=9700 + j + bar), b0 + 3.0 + j * 0.055, pan=-0.6 + j * 0.1, rev=0.5)
        if bar % 8 == 0:
            mx.add(bell(1397, 1.8, 0.045), b0, pan=0.5, rev=0.7)
    return mx.render(t60=2.0, wet=0.95, level=0.17)


C4 = 60
YB_A = bars("2:2 3:1 | 5:3~ | 6:2 5:1 | 2:3~ | 1':2 6:1 | 5:2 3:1 | 2:1 3:1 5:1 | 2:3~", 3.0)
YB_B = bars("5:2 6:1 | 1':3~ | 2':2 1':1 | 6:3~ | 5:1 6:1 1':1 | 6:2 5:1 | 3:1 2:1 1:1 | 2:3~", 3.0)


def yebo():
    """《夜泊》：船停了，夜里，或是雨天窝在舱口。商调，很慢，三拍子但不摇。筝一个音一个音地弹，带吟；泛音像水面的月光；后半箫接过去，筝退成底下的几个音；远远一声磬。没有鼓，没有阮。"""
    bpm = 56
    mel, beats = parse(YB_A + ' | ' + YB_B, C4)
    mx = Mix(beats, bpm, tail=6.5)
    half = beats / 2
    for b, d, m, fl in mel:
        sec = d * 60 / bpm
        if b < half:
            mx.add(pluck(m2f(m), sec + 2.0, 1.6, bright=0.6, t60=3.6, glide=0.8 if d >= 2 else 0, vib=22 if '~' in fl else 7, seed=int(b * 173)), b, pan=-0.1, rev=0.5)
            if d >= 3:
                mx.add(harmonic(m2f(m + 12), 3.0, 0.11), b + 1.5, pan=0.45, rev=0.9)
        else:
            mx.add(flute(m2f(m), sec * 0.96, 0.38, 'xiao', grace=(2 if d >= 3 else 0), vib=19 if '~' in fl else 8, seed=int(b * 179)), b, pan=0.15, rev=0.65)
            if d >= 2:
                mx.add(pluck(m2f(m - 12), sec + 1.6, 0.7, bright=0.5, t60=3.4, vib=12, seed=int(b * 181)), b + 1, pan=-0.25, rev=0.55)
    roots = [2, 5, 6, 2, 6, 5, 2, 2, 5, 1, 2, 6, 1, 5, 6, 2]
    for bar, r in enumerate(roots):
        a, c, e = CH[r]
        b0 = bar * 3
        mx.add(pluck(m2f(C4 + a - 24), 4.5, 0.55, bright=0.4, t60=4.6, pos=0.24, vib=8, seed=700 + bar), b0, pan=-0.3, rev=0.5)            # 低音：筝的低弦，一小节一个
        mx.add(harmonic(m2f(C4 + e), 2.6, 0.07), b0 + 2, pan=0.5 if bar % 2 else -0.5, rev=0.9)                                        # 泛音，左一下右一下
        if bar % 4 == 1:
            mx.add(harmonic(m2f(C4 + c + 12), 2.8, 0.06), b0 + 1, pan=0.2, rev=0.9)
        if bar % 8 == 3:
            mx.add(bell(1175, 2.6, 0.04), b0 + 1, pan=-0.4, rev=0.9)                                                                  # 远远一声磬
    return mx.render(t60=3.2, wet=1.1, level=0.14)


# ---------------------------------------------------------------- 音效
def sfx():
    rng = np.random.default_rng(3)

    def enc(y):
        y = np.asarray(y, dtype=float)
        y = y / (np.abs(y).max() + 1e-9) * 0.8
        raw = os.path.join(OUT, '_s.raw'); dst = os.path.join(OUT, '_s.ogg')
        (y * 32767).astype('<i2').tofile(raw)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', raw, '-c:a', 'libvorbis', '-q:a', '3', dst], check=True)
        b = base64.b64encode(open(dst, 'rb').read()).decode(); os.remove(raw); os.remove(dst); return b

    def noise(dur, lo, hi, tau):
        n = int(dur * SR); t = np.arange(n) / SR
        b, a = sg.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band')
        return sg.lfilter(b, a, rng.normal(0, 1, n)) * np.exp(-t / tau)

    out = {}
    out['tick'] = enc(wood(1500, 0.08, 0.5))
    pg = noise(0.11, 2500, 9000, 0.03); pg[:200] *= np.linspace(0, 1, 200); out['page'] = enc(pg * 0.35)
    out['door'] = enc(np.concatenate([drum(110, 0.25, 0.9, 2), np.zeros(1000)]) + np.pad(noise(0.12, 300, 1800, 0.03) * 0.5, (0, int(0.25 * SR) + 1000 - int(0.12 * SR))))
    out['gong'] = enc(bell(523, 2.2, 1.0) + np.pad(wood(700, 0.1, 0.3), (0, int(2.2 * SR) - int(0.1 * SR))))
    c1 = bell(4200, 0.5, 1.0); c2 = np.pad(bell(5600, 0.42, 0.8), (int(0.07 * SR), 0))[:len(c1)]
    out['coin'] = enc(c1 + np.pad(c2, (0, len(c1) - len(c2))))
    pp = noise(0.18, 120, 900, 0.035) * 1.2 + np.pad(drum(180, 0.15, 0.7, 4), (0, int(0.18 * SR) - int(0.15 * SR)))
    out['pop'] = enc(pp)
    out['wrong'] = enc(drum(95, 0.3, 1.0, 6) + wood(320, 0.3, 0.25)[:int(0.3 * SR)] if True else 0)
    # 0.8.0 添的三样：一声弦（琵琶高音，带一点滑）、梆子两下、水声。排在最后，前面几样的随机数不受影响
    out['xian'] = enc(pluck(988, 1.3, 1.0, bright=0.88, t60=1.0, glide=0.4, seed=7))
    bg = wood(620, 0.13, 0.7); out['bang'] = enc(np.concatenate([bg, np.zeros(int(0.24 * SR)), bg * 0.85]))
    sp = noise(0.55, 180, 2600, 0.15); sp[:400] *= np.linspace(0, 1, 400); out['splash'] = enc(sp * 0.6)
    # 0.9.0 添的两样：一声雷（先一下裂，再滚远）、一段可以循环的雨。也排在最后
    lei = noise(3.6, 28, 240, 1.2) * 1.0 + np.pad(noise(0.3, 180, 2600, 0.07) * 0.55, (0, int(3.3 * SR)))
    lei += np.pad(noise(2.2, 24, 160, 0.9) * 0.6, (int(1.1 * SR), int(0.3 * SR)))[:len(lei)]
    lei[:300] *= np.linspace(0, 1, 300); out['lei'] = enc(lei)
    n = int(5.4 * SR); b2, a2 = sg.butter(2, [900 / (SR / 2), 7500 / (SR / 2)], 'band'); yu = sg.lfilter(b2, a2, rng.normal(0, 1, n))
    yu *= 1 + 0.18 * np.sin(2 * np.pi * 0.37 * np.arange(n) / SR) + 0.1 * np.sin(2 * np.pi * 1.3 * np.arange(n) / SR)
    k = int(0.4 * SR); ramp = np.linspace(0, 1, k); yu[:k] = yu[:k] * ramp + yu[-k:] * (1 - ramp); yu = yu[:-k]      # 尾巴叠回开头：循环起来没有缝
    out['yu'] = enc(yu * 0.5)
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'sfx.js'), 'w') as f:
        f.write('window.JX_SFX=' + json.dumps(out) + ';\n')
    print('音效：', ', '.join(out.keys()), '，共 %.0f KB' % (os.path.getsize(os.path.join(OUT, 'sfx.js')) / 1024))


TRACKS = {'zhuti': zhuti, 'yuanxi': yuanxi, 'xueye': xueye, 'kaitan': kaitan, 'zaohuo': zaohuo, 'dengshi': dengshi, 'lanshan': lanshan, 'anliu': anliu, 'jiaofeng': jiaofeng, 'shisheng': shisheng, 'wazi': wazi, 'meichuang': meichuang, 'xingchuan': xingchuan, 'yebo': yebo}
if __name__ == '__main__':
    want = sys.argv[1:] or list(TRACKS) + ['sfx']
    for name in want:
        if name == 'sfx':
            sfx()
        elif name == 'check':                                    # 单音核对：音高偏差（音分）
            for nm, y, f in [('筝 A4', pluck(440, 1.5), 440), ('筝 D3', pluck(m2f(50), 1.5), m2f(50)), ('琵琶 A5', pluck(880, 0.8, bright=0.86, t60=1), 880), ('笛 D5', flute(m2f(74), 1.2, vib=0), m2f(74)), ('箫 B4', flute(m2f(71), 1.2, kind='xiao', vib=0), m2f(71))]:
                seg = y[int(0.2 * SR):int(0.2 * SR) + 32768]; seg = np.pad(seg, (0, 32768 - len(seg))) * np.hanning(32768)
                sp = np.abs(np.fft.rfft(seg, 262144)); fr = np.fft.rfftfreq(262144, 1 / SR)
                lo, hi = np.searchsorted(fr, f * 0.94), np.searchsorted(fr, f * 1.06)
                pk = fr[lo + sp[lo:hi].argmax()]
                cen = (sp * fr).sum() / sp.sum()
                print('%s：目标 %.1f Hz，实测 %.1f Hz，偏 %+.1f 音分；频谱重心 %.0f Hz' % (nm, f, pk, 1200 * np.log2(pk / f), cen))
        else:
            ogg(name, TRACKS[name]())
