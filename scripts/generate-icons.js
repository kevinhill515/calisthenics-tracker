// Render public/icon.svg into the PNG sizes iOS / Android home-screen apps
// expect. Run with `npm run icons` whenever icon.svg changes; commit the
// generated PNGs.

import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const src = path.join(root, 'public', 'icon.svg');

const sizes = [
  { name: 'icon-180.png', size: 180 }, // iOS apple-touch-icon
  { name: 'icon-192.png', size: 192 }, // Android Chrome
  { name: 'icon-512.png', size: 512 }, // Android Chrome / PWA splash
  { name: 'favicon-32.png', size: 32 }, // browser tab
];

const svg = await readFile(src);

for (const { name, size } of sizes) {
  const out = path.join(root, 'public', name);
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(out);
  console.log(`✓ ${name} (${size}×${size})`);
}
