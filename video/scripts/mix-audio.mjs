// Builds the full soundtrack with ffmpeg (much faster than Remotion's audio-only render).
// Mirrors the <Audio>/<OffthreadVideo> layout in src/Full.tsx.
import {execFileSync} from 'node:child_process';
import {buildSync} from 'esbuild';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = process.argv[2] || path.join(root, 'out', 'audio.wav');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mix-'));
fs.writeFileSync(path.join(tmp, 'font.mjs'), "export const loadFont=()=>({fontFamily:''});");
fs.writeFileSync(path.join(tmp, 'entry.ts'), `import {SFX, VOICE_END} from ${JSON.stringify(path.join(root, 'src/Full').replace(/\\/g, '/'))};\nconsole.log(JSON.stringify({SFX, VOICE_END}));`);
buildSync({
  entryPoints: [path.join(tmp, 'entry.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  logLevel: 'error',
  alias: {'@remotion/google-fonts/Montserrat': path.join(tmp, 'font.mjs')},
  outfile: path.join(tmp, 'out.mjs'),
});
const {SFX, VOICE_END} = JSON.parse(execFileSync(process.execPath, [path.join(tmp, 'out.mjs')]).toString());

const FPS = 30, DISC_AT = 48.4, DISC_LEN = 10;
const vf = (t) => Math.round((t < DISC_AT ? t : t + DISC_LEN) * FPS);
const discFrom = vf(DISC_AT - 0.0001) + 1;
const discEnd = discFrom + DISC_LEN * FPS;
const outroFrom = vf(VOICE_END) + 6;
const total = (outroFrom + 15 * FPS) / FPS;
const s = (fr) => (fr / FPS).toFixed(4);
const ms = (fr) => Math.round((fr / FPS) * 1000);

const pub = (p) => path.join(root, 'public', p);
const inputs = [pub('media/voice.mp3'), pub('media/disclaimer.mp4'), pub('media/outro.mp4')];
// Each cue name may have variants: name.wav, name_2.wav, ... They are used round-robin
// per name, so the same file never plays twice in a row.
const sfxDir = pub('sfx');
const variants = (n) =>
  fs
    .readdirSync(sfxDir)
    .filter((f) => f === `${n}.wav` || new RegExp(`^${n}_\\d+\\.wav$`).test(f))
    .sort((a, b) => (a === `${n}.wav` ? -1 : b === `${n}.wav` ? 1 : a.localeCompare(b, 'en', {numeric: true})));
const counters = {};
const cues = SFX.map(([t, n, vol]) => {
  const files = variants(n);
  if (!files.length) throw new Error(`no sfx file for "${n}"`);
  const k = counters[n] ?? 0;
  counters[n] = k + 1;
  return {t, file: files[k % files.length], vol};
});
const files = [...new Set(cues.map((c) => c.file))];
files.forEach((f) => inputs.push(path.join(sfxDir, f)));

const f = [];
const mix = [];
const fmt = 'aformat=sample_rates=48000:channel_layouts=stereo';
f.push(`[0:a]${fmt},atrim=0:${DISC_AT},asetpts=PTS-STARTPTS[v1]`);
f.push(`[0:a]${fmt},atrim=start=${DISC_AT},asetpts=PTS-STARTPTS,adelay=${ms(discEnd)}:all=1[v2]`);
f.push(`[1:a]${fmt},adelay=${ms(discFrom)}:all=1[d]`);
f.push(`[2:a]${fmt},adelay=${ms(outroFrom)}:all=1[o]`);
mix.push('[v1]', '[v2]', '[d]', '[o]');

files.forEach((file, k) => {
  const uses = cues.filter((c) => c.file === file);
  const id = `s${k}_`;
  f.push(`[${3 + k}:a]${fmt},asplit=${uses.length}${uses.map((_, j) => `[${id}${j}]`).join('')}`);
  uses.forEach(({t, vol}, j) => {
    f.push(`[${id}${j}]volume=${vol},adelay=${ms(Math.max(0, vf(t)))}:all=1[${id}x${j}]`);
    mix.push(`[${id}x${j}]`);
  });
});
f.push(`${mix.join('')}amix=inputs=${mix.length}:normalize=0:dropout_transition=0,highpass=f=40,atrim=0:${total.toFixed(3)}[out]`);
fs.writeFileSync(path.join(tmp, 'graph.txt'), f.join(';\n'));
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs.flatMap((i) => ['-i', i]), '-filter_complex_script', path.join(tmp, 'graph.txt'), '-map', '[out]', '-ar', '48000', outFile], {stdio: 'inherit'});
const usage = Object.fromEntries(files.map((f) => [f, cues.filter((c) => c.file === f).length]));
console.log(`audio: ${outFile} (${total.toFixed(2)}s, ${SFX.length} sfx)`);
console.log(JSON.stringify(usage));
