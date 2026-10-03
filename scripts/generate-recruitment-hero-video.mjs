import { execFileSync } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';

// Animated background for the Recruitment hero. The source is a 1920x1080,
// 24fps, ten-second purple planet horizon clip. The static reference remains
// `backgrounds/recruitment.webp` under reduced motion and on small screens.
//
// Three decisions shape the export:
//
// 1. The clip does not loop seamlessly on its own. A circular crossfade blends
//    the last `XFADE` seconds into the first `XFADE` seconds; the output
//    is trimmed to the remaining length. Frame 0 of the export is therefore the
//    tail frame, which makes the loop point continuous without reversing the
//    aurora (a ping-pong boomerang would, and this clip visibly builds up).
//    `[tail][body]xfade=...:offset=0` does exactly that.
// 2. Audio is dropped. `prefers-reduced-motion` (and <=600px) never start
//    playback, so the static `recruitment.webp` stays the reference fallback.
// 3. The clip is served at 2560x1440. At 1920x1080 the AV1 webm carried visible
//    8x8/16x16 blocking through the dark sky, and the hero crops (`object-fit:
//    cover`) then zooms (pinned to 1.35x), so a 1080p source is upscaled ~2x in
//    device pixels on retina. The larger canvas keeps the star field crisp
//    through the zoom. Encoding budget (Perf P0): crf 43 (AV1) / 30 (x264)
//    keeps the WebM under 0.9 MB and MP4 under 1.1 MB. Chrome/Edge get WebM
//    (listed first), Safari gets MP4 — only one is ever fetched.
const SRC =
  'assets/assets recruitment page/hero section/Animating_static_planetary_space…_1080p_20261003170119.mp4';
const OUT_DIR = 'public/images/recruitment';
const ART_W = 2560;
const ART_H = 1440;
const LOOP_LEN = '10'; // source seconds fed into the loop
const XFADE = '1'; // crossfade seconds
const BODY_LEN = (Number(LOOP_LEN) - Number(XFADE)).toFixed(0); // 9s output

// Circular crossfade: tail (last XFADE s) dissolves into body (first BODY s).
const loopChain =
  `[0:v]split=2[a][b];` +
  `[a]trim=start=${BODY_LEN},setpts=PTS-STARTPTS[tail];` +
  `[b]trim=0:${BODY_LEN},setpts=PTS-STARTPTS[body];` +
  `[tail][body]xfade=transition=fade:duration=${XFADE}:offset=0,` +
  `scale=${ART_W}:${ART_H}:flags=lanczos,` +
  `unsharp=5:5:0.5:5:5:0.0[v]`;

await mkdir(OUT_DIR, { recursive: true });

// Poster = the clip's own first frame (the crossfaded tail frame), so the
// `<video>` can be shown before it plays without swapping composition.
execFileSync(
  'ffmpeg',
  [
    '-v',
    'error',
    '-i',
    SRC,
    '-filter_complex',
    loopChain,
    '-map',
    '[v]',
    '-frames:v',
    '1',
    '-c:v',
    'libwebp',
    '-quality',
    '82',
    '-y',
    `${OUT_DIR}/hero-poster.webp`,
  ],
  { stdio: 'inherit' },
);
console.log(
  `hero-poster.webp: ${((await stat(`${OUT_DIR}/hero-poster.webp`)).size / 1024).toFixed(0)} KB`,
);

const encodes = [
  {
    name: 'hero-bg.mp4',
    args: [
      '-c:v',
      'libx264',
      '-crf',
      '30',
      '-preset',
      'slow',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
    ],
  },
  {
    name: 'hero-bg.webm',
    args: [
      '-c:v',
      'libsvtav1',
      '-crf',
      '43',
      '-preset',
      '8',
      '-pix_fmt',
      'yuv420p',
    ],
  },
];

for (const { name, args } of encodes) {
  const out = `${OUT_DIR}/${name}`;
  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      SRC,
      '-filter_complex',
      loopChain,
      '-map',
      '[v]',
      '-an',
      ...args,
      '-y',
      out,
    ],
    { stdio: 'inherit' },
  );
  const { size } = await stat(out);
  if (size === 0) throw new Error(`${name} was written empty`);
  console.log(`${name}: ${(size / 1024 / 1024).toFixed(2)} MB`);
}
