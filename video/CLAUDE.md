# BETTING LAB video project — agent instructions

Motion-graphics videos for the BETTING LAB channel, built with Remotion 4 (React) + ffmpeg.
Talk to the user in Russian. Full human guide: `GUIDE.md`.

## Layout
- `src/theme.ts` — colours, Montserrat font, FPS=30, disclaimer insert (`DISC_AT`, `DISC_LEN`), `vf(t)` = voiceover seconds → output frame.
- `src/lib.tsx` — primitives: `Bg` (Ken Burns + grade), `Grain`, `Particles`, `Flash`, `useShake`, `Reveal`, `Letters`, `Kicker`, `Sheen`, `glass`, `glow`.
- `src/kit.tsx` — reusable scene types (`Chapter`, `Statement`, `Quote`, `ProbChain`, `MatchRun`, `BigStat`, `ListCard`, `Compare`, `CouponScene`, `Money`, `Survivorship`, `EVChart`, `CTA`). Text in `[brackets]` is accent-coloured.
- `src/scenes/intro.tsx` — hand-built intro scenes.
- `src/Full.tsx` — the timeline: `CUES` (scene start in voiceover seconds + props), SFX, disclaimer/outro, `CHUNKS`.
- `scripts/transcribe.py` — faster-whisper word timestamps → `out/transcript.txt` (`word@seconds`).
- `scripts/render-full.mjs` — chunked muted render per chapter (resumable via `.done` files) → ffmpeg mix → concat → loudnorm −14 LUFS.
- `scripts/mix-audio.mjs` — soundtrack via ffmpeg, reads `SFX` from `src/Full.tsx`.
- `scripts/progress-server.mjs` — progress page on :3333 reading `out/status.json`.
- Media (gitignored): `public/media/{voice.mp3,disclaimer.mp4,outro.mp4}`, `public/img/*.png`, `public/img/blur/*.jpg`.

## Workflow
1. Transcribe: `python scripts/transcribe.py public/media/voice.mp3 out/transcript`.
2. Read the script and the transcript; plan chapters/scenes; times in `CUES` are voiceover seconds taken from the transcript, keyed to the word that should trigger each element.
3. Edit `src/Full.tsx` (and `CHUNKS`; keep `starts` in `scripts/render-full.mjs` in sync).
4. `npx tsc -p .` then render stills and LOOK at them: `npx remotion still Full out/check.jpg --frame=N --image-format=jpeg`, where N = round((t < DISC_AT ? t : t + DISC_LEN) * 30). Fix overflow, overlaps, wrong colours before rendering video.
5. Test minute first (`npm run render:test`), then the full render in a separate terminal: `npm run progress` + `npm run render:full`. The full render takes far longer than a single tool call; never run it in the foreground.

## Sound design (do NOT invent or regenerate sounds)
You cannot hear audio; you do not need to. The sounds are fixed files plus a timing table:
- Use ONLY the committed files `public/sfx/{tick,impact,riser,whoosh}.wav` (synthesized by `scripts/make-sfx.mjs`). Never replace them with new synthesis, downloads or music.
- Place sounds only through the `sfx` arrays in `src/Full.tsx` (`[voiceSeconds, name, volume]`); the soundtrack is built by `scripts/mix-audio.mjs`. Do not use `<Audio>` for SFX in new code.
- Rules used in the reference video (164 cues in 15 min):
  - `tick` 0.40–0.50 — each list item / ✓ / coupon row / odds card appearing, on its trigger word.
  - `impact` 0.35–0.70 — key number reveal, loss ✕, «проигрыш», chapter title (0.55, at chapter start + 0.1 s). 0.7 only for the biggest loss moments.
  - `riser` 0.25–0.35 — 1.2 s before a chapter card and before a big reveal (result %, payout).
  - `whoosh` 0.30 — every scene change (added automatically). Note: this file is near-silent (−62 dBFS, bandpass Q bug); that is how the reference sounds. Do not "fix" it unless the user asks.
  - Never two impacts within 1 s; no SFX under a quiet, emotional line; density ≈ 1 cue per 5–6 s.
- No background music/ambience unless the user supplies a track (then −28 dB under the voice).
- Verify sound with measurements, not by listening:
  - `ffmpeg -i out/BETTING_LAB_express_full.mp4 -af ebur128 -f null -` → Integrated ≈ −14 LUFS.
  - Pause between phrases (e.g. 3.02–3.37 s): `ffmpeg -ss 3.02 -t 0.35 -i FILE -af volumedetect -f null -` → mean below −45 dB (no hum).
  - Spectrogram you can look at: `ffmpeg -ss 0 -t 60 -i FILE -lavfi showspectrumpic=s=1600x600:legend=1 out/spec.png` — voice is the dense striped band; a tick is a pair of short bright dots at 1.9 and 2.85 kHz; a riser is a rising diagonal line; impacts are short blobs below 200 Hz. A constant horizontal line low in the spectrum = hum (bug).

## Rules
- Text on screen comes from the script (DOCX), not from the Whisper transcript (it misspells names).
- No `backdrop-filter`, avoid large CSS `blur()`; use pre-blurred `public/img/blur/*.jpg` (`Bg` with `blur`), it is what keeps render speed acceptable.
- Do not add low-frequency synthesized ambience; it was heard as a hum. Background music only from a licensed track, quiet under the voice.
- If `DISC_AT`/`DISC_LEN` change, update `src/theme.ts`, `scripts/render-full.mjs`, `scripts/mix-audio.mjs`.
- Final loudness −14 LUFS, 1920×1080, 30 fps, H.264 CRF 18, AAC 256k.
