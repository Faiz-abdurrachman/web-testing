import { execFileSync } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';

// Animated hero background. The source clip is 1280x720, 24fps, ten seconds of
// a drifting nebula with a lightning burst near t=3s, and the sorcerer baked in.
// The shot is a one-way move (frame 0 vs frame 239 differ too much to seam), so
// the loop is a boomerang: forward then reverse, which is seamless by
// construction and makes the lightning flash twice per cycle. Cropped to the
// hero art aspect (1583:993) and exported at an even 1582x992 for yuv420p.
//
// Two encodes: AV1/WebM is ~30% smaller for Chrome/Firefox, H.264/MP4 is the
// broad fallback (Safari). Audio is dropped. `prefers-reduced-motion` never
// starts playback, so the static `background.webp` is the guaranteed fallback.
const SRC = 'assets/background/hd/backgroundnya_gausah_berubah_c.mp4';
const OUT_DIR = 'public/images/hero';
const ART_W = 1582;
const ART_H = 992;
const CROP_W = 1148;
const CROP_H = 720;
const CROP_X = 66;

const chain =
  `crop=${CROP_W}:${CROP_H}:${CROP_X}:0,` +
  `scale=${ART_W}:${ART_H}:flags=lanczos,` +
  `unsharp=5:5:0.5:5:5:0.0,` +
  `split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]`;

const encodes = [
  {
    name: 'hero-bg.mp4',
    args: [
      '-c:v',
      'libx264',
      '-crf',
      '27',
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
      '40',
      '-preset',
      '8',
      '-g',
      '240',
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
