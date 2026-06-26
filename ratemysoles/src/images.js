import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function isAcceptedMime(mime) {
  return ACCEPTED.has(mime);
}

/**
 * Validate + normalize an uploaded image buffer.
 *
 * sharp does the security and privacy heavy lifting here:
 *  - it only succeeds if the buffer is a genuine, decodable image (defeats
 *    files that merely *claim* an image mime type),
 *  - re-encoding strips all metadata, including EXIF GPS coordinates, so
 *    uploaders don't accidentally leak where a photo was taken.
 *
 * Returns { filename, thumb, width, height }.
 */
export async function processUpload(buffer) {
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) {
    throw new Error('Unrecognized or corrupt image.');
  }

  const id = crypto.randomBytes(16).toString('hex');
  const filename = `${id}.webp`;
  const thumb = `${id}.thumb.webp`;

  const full = await sharp(buffer)
    .rotate() // honor EXIF orientation before metadata is dropped
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  await sharp(buffer)
    .rotate()
    .resize({ width: 600, height: 600, fit: 'cover', position: 'centre' })
    .webp({ quality: 78 })
    .toFile(path.join(UPLOAD_DIR, thumb));

  await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), full.data);

  return {
    filename,
    thumb,
    width: full.info.width,
    height: full.info.height,
  };
}

export async function deleteFiles(filename, thumb) {
  for (const f of [filename, thumb]) {
    if (!f) continue;
    try {
      await fs.promises.unlink(path.join(UPLOAD_DIR, f));
    } catch {
      /* already gone — ignore */
    }
  }
}
