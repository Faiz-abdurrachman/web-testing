import { execFileSync } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';

// Animated hero background. The source clip is 1280x720, 24fps, ten seconds of
// a drifting nebula with the sorcerer baked in. This is the calmer "clean
// plate": the left half stays dark and there is no baked lightning strike, so
// the composition holds for the whole ten seconds (signalstats YAVG sits at
// ~55-56 across every frame). The plate carries no Gemini sparkle, so nothing
// has to be inpainted or cropped away.
//
// Two decisions shape the export:
//
// 1. The full frame is kept at its native 1280x720 — no crop, no rescale — so
//    the whole scene stays visible and no pixels are invented. The earlier
//    1046x656 window (which matched the hero art's 1583:993 aspect) forced a
//    ~1.5x upscale and threw away the left/right edges; the user asked for the
//    uncropped, sharpest plate instead. `object-fit: cover` on the `<video>`
//    does the only remaining framing.
// 2. The whole clip is used: the first 5s are ping-ponged (forward then reverse)
//    into a seamless 10s cycle. Frame 0 and frame 239 differ, so a plain loop
//    would seam; the boomerang avoids that without changing the grade (the user
//    asked to keep the source look as-is). Audio is dropped, and
//    `prefers-reduced-motion` never starts playback, so the static
//    `background.webp` is the guaranteed fallback.
const SRC = 'assets/assets home page/hero section/hero.mp4';
const OUT_DIR = 'public/images/hero';
const DURATION = '5';
const SHARPEN = 'unsharp=5:5:0.5:5:5:0.0';

const chain =
  `${SHARPEN},` + `split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]`;

// Poster = the clip's own first frame, so the `<video>` can be shown before it
// can play (and while it streams) without the static hero art swapping to a
// different composition. Encoded from the same sharpen pass as the film so
// poster and frame 0 line up exactly.
const posterChain = SHARPEN;

execFileSync(
  'ffmpeg',
  [
    '-v',
    'error',
    '-t',
    '1',
    '-i',
    SRC,
    '-vf',
    posterChain,
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
      '21',
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
      '34',
      '-preset',
      '8',
      '-pix_fmt',
      'yuv420p',
    ],
  },
];

await mkdir(OUT_DIR, { recursive: true });

for (const { name, args } of encodes) {
  const out = `${OUT_DIR}/${name}`;
  execFileSync(
    'ffmpeg',
    [
      '-v',
      'error',
      '-t',
      DURATION,
      '-i',
      SRC,
      '-filter_complex',
      chain,
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
