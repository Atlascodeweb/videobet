// Renders the Full composition chapter by chapter, writing out/status.json for the progress page.
// Re-running resumes: finished chunks are skipped.
import {spawn, execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'out');
const chunksDir = path.join(out, 'chunks');
fs.mkdirSync(chunksDir, {recursive: true});

// Mirrors src/theme.ts vf() and the CHUNKS table in src/Full.tsx.
const FPS = 30;
const DISC_AT = 48.4;
const DISC_LEN = 10;
const vf = (t) => Math.round((t < DISC_AT ? t : t + DISC_LEN) * FPS);
const discFrom = vf(DISC_AT - 0.0001) + 1;
const TOTAL = vf(914.3) + 6 + 15 * FPS;
const starts = [
  ['Вступление + дисклеймер', 0],
  ['01 · Купон, который кажется очевидным', discFrom + DISC_LEN * FPS],
  ['02 · Маленькие коэффициенты', vf(148.8)],
  ['03 · Что означает коэффициент', vf(246.1)],
  ['04 · Ловушка «ещё один матч»', vf(358.2)],
  ['05 · Последний матч', vf(443.7)],
  ['06 · Огромные выигрыши в сети', vf(536.6)],
  ['07 · Что выгодно букмекеру', vf(599.5)],
  ['08 · Экспресс и одиночные', vf(665.2)],
  ['09 · Попытка отыграться', vf(731.2)],
  ['10 · Что запомнить + аутро', vf(800.7)],
];
const parts = starts.map(([title, from], i) => {
  const to = (i + 1 < starts.length ? starts[i + 1][1] : TOTAL) - 1;
  const file = path.join(chunksDir, `${String(i).padStart(2, '0')}.mp4`);
  const done = fs.existsSync(file + '.done');
  return {title, from, to, frames: to - from + 1, rendered: done ? to - from + 1 : 0, state: done ? 'done' : 'queued', file};
});
parts.push({title: 'Звук, склейка, громкость', from: 0, to: 0, frames: 1, rendered: 0, state: 'queued'});

const status = {startedAt: Date.now(), message: 'Рендер запущен', preview: 0, parts};
const save = () => {
  const s = {...status, parts: parts.map(({file, ...p}) => p)};
  fs.writeFileSync(path.join(out, 'status.json.tmp'), JSON.stringify(s));
  fs.renameSync(path.join(out, 'status.json.tmp'), path.join(out, 'status.json'));
};
save();

const run = (args, onLine) =>
  new Promise((resolve, reject) => {
    // npx is npx.cmd on Windows and needs a shell there.
    const p = spawn('npx', args, {cwd: root, shell: process.platform === 'win32'});
    let buf = '';
    const feed = (d) => {
      buf += d.toString();
      const lines = buf.split(/[\r\n]/);
      buf = lines.pop();
      lines.forEach((l) => onLine && onLine(l));
    };
    p.stdout.on('data', feed);
    p.stderr.on('data', feed);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });

const preview = (file, t) => {
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', file, '-frames:v', '1', '-vf', 'scale=960:-1', path.join(out, 'preview.jpg')]);
    status.preview = Date.now();
  } catch {}
};

for (const part of parts.slice(0, -1)) {
  if (part.state === 'done') continue;
  part.state = 'rendering';
  status.message = `Рендерится: ${part.title}`;
  save();
  let last = 0;
  await run(
    ['remotion', 'render', 'Full', part.file, `--frames=${part.from}-${part.to}`, '--muted', '--crf=18', '--concurrency=2'],
    (l) => {
      const m = l.match(/Rendered (\d+)\/(\d+)/);
      if (m) part.rendered = Number(m[1]);
      if (/Encoded/.test(l)) part.state = 'encoding';
      if (Date.now() - last > 1500) {
        last = Date.now();
        save();
      }
    },
  ).catch((e) => {
    part.state = 'error';
    status.message = `Ошибка в части «${part.title}»: ${e.message}`;
    save();
    process.exit(1);
  });
  part.rendered = part.frames;
  part.state = 'done';
  fs.writeFileSync(part.file + '.done', '');
  preview(part.file, (part.frames / FPS) * 0.6);
  save();
}

const fin = parts[parts.length - 1];
fin.state = 'rendering';
status.message = 'Сводим звук и склеиваем части';
save();
const audio = path.join(out, 'audio.wav');
execFileSync(process.execPath, [path.join(root, 'scripts/mix-audio.mjs'), audio], {stdio: 'inherit'});
const list = path.join(chunksDir, 'list.txt');
fs.writeFileSync(list, parts.slice(0, -1).map((p) => `file '${p.file.replace(/\\/g, '/')}'`).join('\n'));
execFileSync('ffmpeg', [
  '-v', 'error', '-y',
  '-f', 'concat', '-safe', '0', '-i', list,
  '-i', audio,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-1.2:LRA=11', '-ar', '48000',
  '-c:a', 'aac', '-b:a', '256k',
  '-movflags', '+faststart', '-shortest',
  path.join(out, 'BETTING_LAB_express_full.mp4'),
]);
fin.rendered = 1;
fin.state = 'done';
status.message = 'Готово: out/BETTING_LAB_express_full.mp4';
save();
console.log('DONE');
