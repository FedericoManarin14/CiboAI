// Genera le icone PWA dal logo (logo ciboai.jpg).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

const SRC = 'logo ciboai.jpg';
const white = { r: 255, g: 255, b: 255, alpha: 1 };

// Full-bleed: ritaglio quadrato centrato (favicon, apple-touch, icone standard).
async function cover(file, size) {
  await sharp(SRC).resize(size, size, { fit: 'cover', position: 'center' }).flatten({ background: white }).png().toFile(file);
  console.log('✓', file);
}

// Maskable Android: logo centrato con margine bianco (safe zone ~72%).
async function maskable(file, size) {
  const inner = Math.round(size * 0.7);
  const logo = await sharp(SRC).resize(inner, inner, { fit: 'cover', position: 'center' }).flatten({ background: white }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: white } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(file);
  console.log('✓', file);
}

await cover('public/icon-192.png', 192);
await cover('public/icon-512.png', 512);
await cover('public/apple-icon.png', 180);
await cover('src/app/apple-icon.png', 180);
await cover('src/app/icon.png', 64);
await maskable('public/icon-maskable-512.png', 512);
