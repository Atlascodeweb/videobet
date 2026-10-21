#!/usr/bin/env bash
# Synthesized sound design (no third-party samples needed).
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
ff() { ffmpeg -v error -y "$@"; }
ff -f lavfi -i "anoisesrc=color=pink:d=0.9:a=0.6" -af "bandpass=f=900:w=1400,volume='pow(sin(PI*t/0.9),3)':eval=frame,aecho=0.6:0.5:40:0.3" -ar 48000 whoosh.wav
ff -f lavfi -i "aevalsrc='0.9*sin(2*PI*(38+90*exp(-9*t))*t)*exp(-2.6*t)':d=1.6:s=48000" -af "lowpass=f=400,aecho=0.7:0.6:60|120:0.35|0.2" impact.wav
ff -f lavfi -i "aevalsrc='0.35*sin(2*PI*1900*t)*exp(-45*t)+0.2*sin(2*PI*2850*t)*exp(-60*t)':d=0.2:s=48000" tick.wav
ff -f lavfi -i "aevalsrc='0.5*sin(2*PI*(220+660*t*t)*t)*min(1,t/1.4)*(1-max(0,(t-1.4)/0.2))':d=1.6:s=48000" -af "lowpass=f=1600,aecho=0.6:0.5:50:0.4" riser.wav
# Ambient pad removed (heard as a background hum).
#ff -f lavfi -i "aevalsrc='(0.16*sin(2*PI*55*t)+0.10*sin(2*PI*82.4*t)+0.07*sin(2*PI*110.3*t)+0.05*sin(2*PI*164.6*t)+0.03*sin(2*PI*220.6*t))*(0.75+0.25*sin(2*PI*t/7))':d=200:s=48000" -af "lowpass=f=700,aecho=0.8:0.7:500|900:0.4|0.25,afade=t=in:d=3" pad.wav
ls -la
