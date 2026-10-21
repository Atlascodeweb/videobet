"""Word-level transcription of the voiceover (faster-whisper, CPU).

Usage: python scripts/transcribe.py public/media/voice.mp3 out/transcript
Writes <prefix>.json (segments + words) and <prefix>.txt ("слово@секунды" per line),
which is what scene timings in src/*.tsx are taken from.
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

src, prefix = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "small"

# Decode with ffmpeg ourselves: avoids PyAV version issues inside faster-whisper.
pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", src, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
    check=True,
    capture_output=True,
).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

model = WhisperModel(model_name, device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio, language="ru", word_timestamps=True)

out = []
with open(prefix + ".txt", "w", encoding="utf-8") as txt:
    for s in segments:
        words = [(w.start, w.end, w.word.strip()) for w in s.words]
        out.append({"start": s.start, "end": s.end, "text": s.text.strip(), "words": words})
        txt.write(" ".join(f"{w}@{a:.2f}" for a, _, w in words) + "\n")
        print(f"{s.start:7.2f} {s.text.strip()}", flush=True)

with open(prefix + ".json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)
