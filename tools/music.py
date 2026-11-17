#!/usr/bin/env python3
"""原创配乐的离线合成：整首算成音频文件，游戏里只播放、不即时合成。
乐器是物理建模与加法合成：筝、琵琶、古琴（拨弦模型），笛、箫（谐波加气声），板、鼓、磬。
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

    def render(self, t60=2.0, wet=1.0, seed=5):
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
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'sfx.js'), 'w') as f:
        f.write('window.JX_SFX=' + json.dumps(out) + ';\n')
    print('音效：', ', '.join(out.keys()), '，共 %.0f KB' % (os.path.getsize(os.path.join(OUT, 'sfx.js')) / 1024))


TRACKS = {'zhuti': zhuti, 'yuanxi': yuanxi, 'xueye': xueye}
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
