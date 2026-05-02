/**
 * Regenerates ZAFIRIX PRO app icons from the same geometric "Z" as ZafirixLogo
 * (rounded square, sky→indigo→violet gradient, white Z with purple stroke).
 * Run from repo root: node scripts/generate-zafirix-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="zfxBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0ea5e9"/>
      <stop offset="0.55" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="zfxZ" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e9ecff"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" ry="108" fill="url(#zfxBg)"/>
  <g transform="translate(76,76) scale(9)">
    <path
      d="M11 10h18v4L18 26h11v4H11v-4l11-12H11z"
      fill="url(#zfxZ)"
      stroke="#5b21b6"
      stroke-width="0.55"
      stroke-linejoin="round"
      paint-order="stroke fill"
    />
  </g>
</svg>`;

const root = path.join(__dirname, '..');
const pub = path.join(root, 'public');

async function main() {
  const buf = Buffer.from(svg);

  await sharp(buf).resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(pub, 'icon-512.png'));

  await sharp(buf).resize(192, 192).png({ compressionLevel: 9 }).toFile(path.join(pub, 'icon-192.png'));

  const icoBuffer = await pngToIco(path.join(pub, 'icon-512.png'));
  fs.writeFileSync(path.join(pub, 'favicon.ico'), icoBuffer);

  console.log('Wrote public/icon-512.png, public/icon-192.png, public/favicon.ico');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
