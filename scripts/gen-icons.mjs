// Genera le icone PWA da un SVG (forchetta+coltello su sfondo verde).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

function svg(size, radiusRatio = 0.22) {
  const r = Math.round(size * radiusRatio);
  const s = size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <rect width="${s}" height="${s}" rx="${r}" fill="#16a34a"/>
    <g stroke="#ffffff" stroke-width="${s * 0.05}" stroke-linecap="round" fill="none">
      <!-- forchetta -->
      <line x1="${s * 0.36}" y1="${s * 0.28}" x2="${s * 0.36}" y2="${s * 0.72}"/>
      <line x1="${s * 0.30}" y1="${s * 0.28}" x2="${s * 0.30}" y2="${s * 0.40}"/>
      <line x1="${s * 0.42}" y1="${s * 0.28}" x2="${s * 0.42}" y2="${s * 0.40}"/>
      <path d="M ${s * 0.30} ${s * 0.40} Q ${s * 0.36} ${s * 0.46} ${s * 0.42} ${s * 0.40}"/>
      <!-- coltello -->
      <line x1="${s * 0.64}" y1="${s * 0.28}" x2="${s * 0.64}" y2="${s * 0.72}"/>
      <path d="M ${s * 0.64} ${s * 0.28} Q ${s * 0.72} ${s * 0.34} ${s * 0.64} ${s * 0.50}"/>
    </g>
  </svg>`;
}

const targets = [
  { file: 'public/icon-192.png', size: 192 },
  { file: 'public/icon-512.png', size: 512 },
  { file: 'public/apple-icon.png', size: 180 },
  { file: 'src/app/icon.png', size: 64 },
];

for (const t of targets) {
  await sharp(Buffer.from(svg(t.size))).png().toFile(t.file);
  console.log('✓', t.file);
}
