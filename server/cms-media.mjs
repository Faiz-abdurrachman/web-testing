import sharp from 'sharp';
import { createHash } from 'node:crypto';

export const MEDIA_INPUT_LIMIT = 2 * 1024 * 1024;
export const MEDIA_OUTPUT_LIMIT = 256 * 1024;
export const MEDIA_PATH =
  /^\/images\/cms\/(?:projects|team)\/([a-f0-9]{64})\.webp$/;
const invalid = () => {
  throw new Error('Invalid project image.');
};

export async function normalizeProjectImage(
  bytes,
  mime,
  collection = 'projects',
) {
  if (
    !['projects', 'team'].includes(collection) ||
    !bytes.length ||
    bytes.length > MEDIA_INPUT_LIMIT ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(mime)
  )
    invalid();
  const image = sharp(bytes, {
    limitInputPixels: 16000000,
    failOn: 'warning',
    animated: false,
  });
  const info = await image.metadata();
  if (
    !['jpeg', 'png', 'webp'].includes(info.format) ||
    mime !== 'image/' + info.format ||
    (info.pages || 1) !== 1 ||
    !info.width ||
    !info.height
  )
    invalid();
  let output;
  for (const [width, height, quality] of [
    [1600, 1200, 82],
    [1280, 960, 76],
    [960, 720, 72],
  ]) {
    output = await image
      .clone()
      .rotate()
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (output.length <= MEDIA_OUTPUT_LIMIT) break;
  }
  if (!output || output.length > MEDIA_OUTPUT_LIMIT) invalid();
  const hash = createHash('sha256').update(output).digest('hex');
  return {
    image: `/images/cms/${collection}/${hash}.webp`,
    mimeType: 'image/webp',
    data: output.toString('base64'),
  };
}

export async function verifyProjectMedia(media, expected) {
  const match = MEDIA_PATH.exec(expected || '');
  if (
    !match ||
    media?.image !== expected ||
    media.mimeType !== 'image/webp' ||
    typeof media.data !== 'string' ||
    media.data.length > Math.ceil(MEDIA_OUTPUT_LIMIT / 3) * 4
  )
    invalid();
  const bytes = Buffer.from(media.data, 'base64');
  if (
    !bytes.length ||
    bytes.length > MEDIA_OUTPUT_LIMIT ||
    bytes.toString('base64') !== media.data ||
    createHash('sha256').update(bytes).digest('hex') !== match[1]
  )
    invalid();
  const decoder = sharp(bytes, {
    limitInputPixels: 16000000,
    failOn: 'warning',
  });
  const info = await decoder.metadata();
  if (
    info.format !== 'webp' ||
    (info.pages || 1) !== 1 ||
    info.width > 1600 ||
    info.height > 1200
  )
    invalid();
  await decoder.raw().toBuffer();
  return bytes;
}
