// Synthesizes the sound effects into public/sfx (no third-party samples). Needs ffmpeg in PATH.
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sfx');
fs.mkdirSync(dir, {recursive: true});
// Existing files are kept: the committed originals define the reference sound
// (whoosh uses random noise, so regenerating it would change it).
const ff = (args, out) => {
  if (fs.existsSync(path.join(dir, out))) return;
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, path.join(dir, out)], {stdio: 'inherit'});
};

ff(['-f', 'lavfi', '-i', 'anoisesrc=color=pink:d=0.9:a=0.6', '-af', "bandpass=f=900:w=1400,volume='pow(sin(PI*t/0.9),3)':eval=frame,aecho=0.6:0.5:40:0.3", '-ar', '48000'], 'whoosh.wav');
ff(['-f', 'lavfi', '-i', "aevalsrc='0.9*sin(2*PI*(38+90*exp(-9*t))*t)*exp(-2.6*t)':d=1.6:s=48000", '-af', 'lowpass=f=400,aecho=0.7:0.6:60|120:0.35|0.2'], 'impact.wav');
ff(['-f', 'lavfi', '-i', "aevalsrc='0.35*sin(2*PI*1900*t)*exp(-45*t)+0.2*sin(2*PI*2850*t)*exp(-60*t)':d=0.2:s=48000"], 'tick.wav');
ff(['-f', 'lavfi', '-i', "aevalsrc='0.5*sin(2*PI*(220+660*t*t)*t)*min(1,t/1.4)*(1-max(0,(t-1.4)/0.2))':d=1.6:s=48000", '-af', 'lowpass=f=1600,aecho=0.6:0.5:50:0.4'], 'riser.wav');
console.log('sfx ->', dir);

// ---------------------------------------------------------------------------
// Variants and semantic sounds. Same recipe as the originals (pure sines, soft
// attack, short echo), different pitches/shapes so repeats don't sound identical.
// The mixer rotates `name.wav`, `name_2.wav`, ... automatically.
// ---------------------------------------------------------------------------
const peak = (file) => {
  const r = spawnSync('ffmpeg', ['-i', file, '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
  return Number(r.match(/max_volume: (-?[\d.]+) dB/)?.[1] ?? 0);
};
// Render, then set the peak so every variant matches its family's loudness.
const make = (expr, dur, af, out, targetPeak) => {
  if (fs.existsSync(path.join(dir, out))) return;
  const tmp = path.join(dir, `_tmp_${out}`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `aevalsrc='${expr}':d=${dur}:s=48000`, ...(af ? ['-af', af] : []), tmp]);
  const gain = targetPeak - peak(tmp);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-af', `volume=${gain.toFixed(2)}dB`, '-ar', '48000', path.join(dir, out)]);
  fs.rmSync(tmp);
};
const soft = 'min(1,t/0.003)'; // 3 ms attack: no click

// tick: pentatonic pitches around the original 1900 Hz (+ fifth overtone).
[1568, 1760, 2093, 2349].forEach((f, i) =>
  make(`(0.35*sin(2*PI*${f}*t)*exp(-45*t)+0.2*sin(2*PI*${f * 1.5}*t)*exp(-60*t))*${soft}`, 0.2, '', `tick_${i + 2}.wav`, -5.7),
);
// impact: deeper / tighter / rounder sub drops.
[
  [32, 80, 2.2, '60|130:0.35|0.2'],
  [44, 100, 3.0, '50|110:0.3|0.18'],
  [50, 70, 2.6, '70|140:0.35|0.2'],
].forEach(([b, s, d, echo], i) =>
  make(`0.9*sin(2*PI*(${b}+${s}*exp(-9*t))*t)*exp(-${d}*t)*${soft}`, 1.6, `lowpass=f=400,aecho=0.7:0.6:${echo}`, `impact_${i + 2}.wav`, -6.1),
);
// riser: same 1.6 s shape (peak at 1.4 s) ending on different notes.
[
  [196, 600],
  [262, 520],
  [247, 700],
].forEach(([a, b], i) =>
  make(`0.5*sin(2*PI*(${a}+${b}*t*t)*t)*min(1,t/1.4)*(1-max(0,(t-1.4)/0.2))`, 1.6, 'lowpass=f=1600,aecho=0.6:0.5:50:0.4', `riser_${i + 2}.wav`, -19.2),
);

// success: two-note rising chime for ✓ / «зашёл».
[
  [1568, 2093],
  [1319, 1760],
  [1760, 2349],
].forEach(([a, b], i) =>
  make(
    `(0.3*sin(2*PI*${a}*t)*exp(-14*t)+0.3*gt(t,0.09)*sin(2*PI*${b}*(t-0.09))*exp(-12*(t-0.09))+0.08*sin(2*PI*${b * 2}*t)*exp(-30*t))*${soft}`,
    0.8,
    'aecho=0.6:0.4:70:0.25',
    `success${i ? `_${i + 1}` : ''}.wav`,
    -9,
  ),
);
// fail: soft descending two-note tone for ✕ / «проигрыш» (layered with impact).
[
  [392, 330],
  [349, 294],
].forEach(([a, b], i) =>
  make(
    `(0.4*sin(2*PI*${a}*t)*exp(-6*t)+0.4*gt(t,0.14)*sin(2*PI*${b}*(t-0.14))*exp(-4.5*(t-0.14))+0.15*sin(2*PI*${b / 2}*t)*exp(-3*t))*${soft}`,
    1.1,
    'lowpass=f=1500,aecho=0.6:0.5:80:0.3',
    `fail${i ? `_${i + 1}` : ''}.wav`,
    -10,
  ),
);
// shimmer: quiet sparkle for gold numbers / payouts / wins.
[
  [3136, 3951, 4699, 5274],
  [2637, 3520, 4186, 5588],
].forEach((fs4, i) =>
  make(
    `(${fs4.map((f, k) => `0.06*sin(2*PI*${f}*t)*(0.6+0.4*sin(2*PI*${7 + k * 2}*t))`).join('+')})*pow(sin(PI*t/1.3),2)`,
    1.3,
    'highpass=f=1500,aecho=0.7:0.6:90|150:0.35|0.25',
    `shimmer${i ? `_${i + 1}` : ''}.wav`,
    -16,
  ),
);
// pop: soft bubble for cards/buttons appearing.
[
  [380, 600],
  [460, 700],
  [320, 520],
].forEach(([b, s], i) =>
  make(`0.5*sin(2*PI*(${b}+${s}*exp(-40*t))*t)*exp(-22*t)*${soft}`, 0.3, 'aecho=0.5:0.4:40:0.2', `pop${i ? `_${i + 1}` : ''}.wav`, -9),
);
console.log('variants ->', dir);
