import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const videos = {
  about: {
    source:
      'assets/assets about us/hero/Animating_sorcerer_image_ambient…_1080p_20261003164943.mp4',
    output: 'public/images/about',
    duration: 8,
    fade: 1,
  },
  hof: {
    source:
      'assets/hall of frames/hero/terbaruSorcerer_casting_subtle_ambient_…_20261003194412.mp4',
    output: 'public/images/hof',
    duration: 8,
    fade: 1,
  },
  partners: {
    source:
      'assets/partners/hero/Arcane_hands_establishing_magica…_1080p_20261003172522.mp4',
    output: 'public/images/partners',
    duration: 8,
    fade: 1,
  },
};

const page = process.argv[2];
const config = videos[page];
if (!config) {
  console.error(
    `Usage: node scripts/generate-hero-videos.mjs ${Object.keys(videos).join('|')}`,
  );
  process.exit(1);
}

mkdirSync(config.output, { recursive: true });
const loopStart = config.fade;
const bridgeStart = config.duration - config.fade;
const filter = [
  'split=3[mainIn][tailIn][headIn]',
  `[mainIn]trim=start=${loopStart}:end=${bridgeStart},setpts=PTS-STARTPTS[main]`,
  `[tailIn]trim=start=${bridgeStart}:end=${config.duration},setpts=PTS-STARTPTS[tail]`,
  `[headIn]trim=start=0:end=${config.fade},setpts=PTS-STARTPTS[head]`,
  `[tail][head]xfade=transition=fade:duration=${config.fade}:offset=0[bridge]`,
  '[main][bridge]concat=n=2:v=1:a=0,unsharp=5:5:0.5:5:5:0.0,format=yuv420p[v]',
].join(';');

function run(args) {
  const result = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-loglevel', 'error', '-y', ...args],
    {
      stdio: 'inherit',
    },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}

run([
  '-ss',
  String(loopStart),
  '-i',
  config.source,
  '-frames:v',
  '1',
  '-vf',
  'unsharp=5:5:0.5:5:5:0.0',
  '-quality',
  '82',
  join(config.output, 'hero-poster.webp'),
]);

const shared = [
  '-filter_complex_threads',
  '2',
  '-i',
  config.source,
  '-filter_complex',
  filter,
  '-map',
  '[v]',
  '-an',
];
run([
  ...shared,
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '33',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  join(config.output, 'hero-bg.mp4'),
]);
run([
  ...shared,
  '-c:v',
  'libsvtav1',
  '-preset',
  '8',
  '-crf',
  '50',
  '-pix_fmt',
  'yuv420p',
  '-svtav1-params',
  'film-grain=0',
  join(config.output, 'hero-bg.webm'),
]);

for (const name of ['hero-poster.webp', 'hero-bg.mp4', 'hero-bg.webm']) {
  const bytes = statSync(join(config.output, name)).size;
  console.log(`${page}/${name}: ${(bytes / 1048576).toFixed(2)} MiB`);
}
