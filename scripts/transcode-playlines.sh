#!/usr/bin/env bash
# this_file: scripts/transcode-playlines.sh
# Trim the Playwright lead-in from the captured WebM and emit a web-friendly,
# faststart H.264 MP4 at testdata/playlines.mp4. Reads head-trim/duration from
# testdata/_rec/cues.json (written by capture-playlines.mjs).
set -euo pipefail
cd "$(dirname "$0")/.."

REC="testdata/_rec/cues.json"
[ -f "$REC" ] || { echo "Missing $REC — run: node scripts/capture-playlines.mjs" >&2; exit 1; }

WEBM="$(node -p "require('./testdata/_rec/cues.json').videoPath")"
HEAD="$(node -p "Math.max(0, (require('./testdata/_rec/cues.json').headTrim||0) - 0.25).toFixed(2)")"
DUR="$(node -p "Math.min(30, (require('./testdata/_rec/cues.json').duration||25) + 0.4).toFixed(2)")"
echo "==> source=$WEBM  headTrim=${HEAD}s  duration=${DUR}s"

ffmpeg -hide_banner -loglevel error \
  -ss "$HEAD" -i "$WEBM" -t "$DUR" \
  -an -vf "scale=1000:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -profile:v high -preset veryfast -crf 25 \
  -g 25 -movflags +faststart \
  -y testdata/playlines.mp4

echo "==> wrote testdata/playlines.mp4"
ffprobe -hide_banner -loglevel error -show_entries format=duration:stream=width,height -of default=nw=1 testdata/playlines.mp4
ls -lh testdata/playlines.mp4
