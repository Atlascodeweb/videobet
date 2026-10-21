// Builds the full soundtrack with ffmpeg (much faster than Remotion's audio-only render).
// Mirrors the <Audio>/<OffthreadVideo> layout in src/Full.tsx.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outFile = process.argv[2] || path.join(root, 'out', 'audio.wav');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mix-'));
fs.writeFileSync(path.join(tmp, 'font.mjs'), "export const loadFont=()=>({fontFamily:''});");
fs.writeFileSync(path.join(tmp, 'entry.ts'), `import {SFX, VOICE_END} from ${JSON.stringify(path.join(root, 'src/Full'))};\nconsole.log(JSON.stringify({SFX, VOICE_END}));`);
execFileSync(path.join(root, 'node_modules/.bin/esbuild'), [
  path.join(tmp, 'entry.ts'), '--bundle', '--platform=node', '--format=esm', '--jsx=automatic', '--log-level=error',
  `--alias:@remotion/google-fonts/Montserrat=${path.join(tmp, 'font.mjs')}`, `--outfile=${path.join(tmp, 'out.mjs')}`,
]);
const {SFX, VOICE_END} = JSON.parse(execFileSync('node', [path.join(tmp, 'out.mjs')]).toString());

const FPS = 30, DISC_AT = 48.4, DISC_LEN = 10;
const vf = (t) => Math.round((t < DISC_AT ? t : t + DISC_LEN) * FPS);
const discFrom = vf(DISC_AT - 0.0001) + 1;
const discEnd = discFrom + DISC_LEN * FPS;
const outroFrom = vf(VOICE_END) + 6;
const total = (outroFrom + 15 * FPS) / FPS;
const s = (fr) => (fr / FPS).toFixed(4);
const ms = (fr) => Math.round((fr / FPS) * 1000);

const pub = (p) => path.join(root, 'public', p);
const inputs = [pub('media/voice.mp3'), pub('media/disclaimer.mp4'), pub('media/outro.mp4'), pub('sfx/pad.wav')];
const names = [...new Set(SFX.map(([, n]) => n))];
names.forEach((n) => inputs.push(pub(`sfx/${n}.wav`)));

const f = [];
const mix = [];
const fmt = 'aformat=sample_rates=48000:channel_layouts=stereo';
f.push(`[0:a]${fmt},atrim=0:${DISC_AT},asetpts=PTS-STARTPTS[v1]`);
f.push(`[0:a]${fmt},atrim=start=${DISC_AT},asetpts=PTS-STARTPTS,adelay=${ms(discEnd)}:all=1[v2]`);
f.push(`[1:a]${fmt},adelay=${ms(discFrom)}:all=1[d]`);
f.push(`[2:a]${fmt},adelay=${ms(outroFrom)}:all=1[o]`);
mix.push('[v1]', '[v2]', '[d]', '[o]');
// Pad envelope (seconds -> gain), matching the volume callback in Full.tsx.
const env = [[0, 0], [30, 1], [discFrom - 15, 1], [discFrom, 0.25], [discEnd, 0.25], [discEnd + 20, 1], [outroFrom - 40, 1], [outroFrom + 20, 0]].map(([fr, g]) => [fr / FPS, g]);
let expr = '0';
for (let i = env.length - 2; i >= 0; i--) {
  const [t0, g0] = env[i], [t1, g1] = env[i + 1];
  expr = `if(between(t,${t0.toFixed(3)},${t1.toFixed(3)}),${g0}+(${g1 - g0})*(t-${t0.toFixed(3)})/${(t1 - t0).toFixed(3) || 1},${expr})`;
}
f.push(`[3:a]${fmt},aloop=loop=-1:size=2e9,atrim=0:${s(outroFrom + 20)},volume='0.3*(${expr})':eval=frame[pad]`);
mix.push('[pad]');
names.forEach((n, k) => {
  const uses = SFX.filter(([, m]) => m === n);
  f.push(`[${4 + k}:a]${fmt},asplit=${uses.length}${uses.map((_, j) => `[${n}${j}]`).join('')}`);
  uses.forEach(([t, , vol], j) => {
    f.push(`[${n}${j}]volume=${vol},adelay=${ms(Math.max(0, vf(t)))}:all=1[${n}x${j}]`);
    mix.push(`[${n}x${j}]`);
  });
});
f.push(`${mix.join('')}amix=inputs=${mix.length}:normalize=0:dropout_transition=0,atrim=0:${total.toFixed(3)}[out]`);
fs.writeFileSync(path.join(tmp, 'graph.txt'), f.join(';\n'));
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs.flatMap((i) => ['-i', i]), '-filter_complex_script', path.join(tmp, 'graph.txt'), '-map', '[out]', '-ar', '48000', outFile], {stdio: 'inherit'});
console.log(`audio: ${outFile} (${total.toFixed(2)}s, ${SFX.length} sfx)`);
