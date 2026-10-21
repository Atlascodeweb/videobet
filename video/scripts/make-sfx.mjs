// Synthesizes the sound effects into public/sfx (no third-party samples). Needs ffmpeg in PATH.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sfx');
fs.mkdirSync(dir, {recursive: true});
const ff = (args, out) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, path.join(dir, out)], {stdio: 'inherit'});

ff(['-f', 'lavfi', '-i', 'anoisesrc=color=pink:d=0.9:a=0.6', '-af', "bandpass=f=900:w=1400,volume='pow(sin(PI*t/0.9),3)':eval=frame,aecho=0.6:0.5:40:0.3", '-ar', '48000'], 'whoosh.wav');
ff(['-f', 'lavfi', '-i', "aevalsrc='0.9*sin(2*PI*(38+90*exp(-9*t))*t)*exp(-2.6*t)':d=1.6:s=48000", '-af', 'lowpass=f=400,aecho=0.7:0.6:60|120:0.35|0.2'], 'impact.wav');
ff(['-f', 'lavfi', '-i', "aevalsrc='0.35*sin(2*PI*1900*t)*exp(-45*t)+0.2*sin(2*PI*2850*t)*exp(-60*t)':d=0.2:s=48000"], 'tick.wav');
ff(['-f', 'lavfi', '-i', "aevalsrc='0.5*sin(2*PI*(220+660*t*t)*t)*min(1,t/1.4)*(1-max(0,(t-1.4)/0.2))':d=1.6:s=48000", '-af', 'lowpass=f=1600,aecho=0.6:0.5:50:0.4'], 'riser.wav');
console.log('sfx ->', dir);
