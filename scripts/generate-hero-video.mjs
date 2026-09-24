import { execFileSync } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';

// Animated hero background. The source clip is 1280x720, 24fps, ten seconds of
// a drifting nebula with a lightning burst near t=3s, and the sorcerer baked in.
//
// Two decisions shape the export:
//
// 1. A Gemini sparkle is baked into the source at roughly x1128..1194,
//    y566..632 (bottom third, right of centre). It is cropped out rather than
//    inpainted: blurring/`delogo` left a patch that read as a smudge on the
//    smooth nebula, while cropping the right band (right edge 1112) drops the
//    stamp with no artefact. The frame is cut to 1046x656 so the crop keeps the
//    hero art aspect (1583:993), then scaled to an even 1582x992 for yuv420p.
// 2. Only the first 2.5s are used. Later in the source the whole plate drifts
//    and the lightning fires, so the background visibly changes; the opening
//    seconds keep the composition stable.
//
// The clip plays on a continuous loop (see `Hero.astro`). Frame 0 and the last
// frame differ, so a plain loop would seam; instead the opening 2.5s are
// ping-ponged (forward then reverse) into a seamless ~5s cycle — the same
// boomerang trick as the first version, just on the stable segment. Audio is
// dropped, and `prefers-reduced-motion` never starts playback, so the static
// `background.webp` is the guaranteed fallback.
const SRC = 'assets/background/hd/backgroundnya_gausah_berubah_c.mp4';
const OUT_DIR = 'public/images/hero';
const ART_W = 1582;
const ART_H = 992;
const CROP_W = 1046;
const CROP_H = 656;
const CROP_X = 66;
const CROP_Y = 32;
const DURATION = '2.5';

const chain =
  `crop=${CROP_W}:${CROP_H}:${CROP_X}:${CROP_Y},` +
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
      '25',
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
      '42',
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
