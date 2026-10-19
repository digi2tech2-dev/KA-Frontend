import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'src/assets/iucon.jpg');
const resources = path.join(root, 'android/app/src/main/res');
const background = '#1B101B';
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

for (const [density, scale] of Object.entries(densities)) {
  const directory = path.join(resources, `mipmap-${density}`);
  await fs.mkdir(directory, { recursive: true });
  const size = Math.round(48 * scale);
  await sharp(source).resize(size, size, { fit: 'contain', background })
    .png().toFile(path.join(directory, 'ic_launcher.png'));

  const roundLogo = await sharp(source)
    .resize(Math.round(size * 0.78), Math.round(size * 0.78), { fit: 'contain', background })
    .png().toBuffer();
  const circle = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`);
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: roundLogo, gravity: 'centre' }, { input: circle, blend: 'dest-in' }])
    .png().toFile(path.join(directory, 'ic_launcher_round.png'));

  // Android masks the central 72dp of a 108dp adaptive layer. Keep the
  // complete artwork within 64dp so its lettering survives launcher masks.
  const foregroundSize = Math.round(108 * scale);
  const logo = await sharp(source).resize(Math.round(64 * scale), Math.round(64 * scale))
    .png().toBuffer();
  await sharp({ create: { width: foregroundSize, height: foregroundSize, channels: 4, background } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png().toFile(path.join(directory, 'ic_launcher_foreground.png'));
}

console.log('Android launcher icons generated from src/assets/iucon.jpg.');
