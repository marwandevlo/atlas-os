import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, 'public');

const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B1630"/>
      <stop offset="1" stop-color="#0F1F3D"/>
    </linearGradient>
    <radialGradient id="vignette" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#1B2F5A" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.25"/>
    </radialGradient>
    <linearGradient id="zgrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38BDF8"/>
      <stop offset="0.5" stop-color="#818CF8"/>
      <stop offset="1" stop-color="#A78BFA"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.35 0" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Rounded-square background -->
  <rect x="36" y="36" width="440" height="440" rx="120" fill="url(#bg)"/>
  <rect x="36" y="36" width="440" height="440" rx="120" fill="url(#vignette)"/>

  <!-- Center Z -->
  <g filter="url(#softGlow)">
    <path
      d="M170 168H350V206L239 334H350V344C350 365 333 382 312 382H170V344L282 216H170V206C170 185 187 168 208 168Z"
      fill="url(#zgrad)"
    />
  </g>
</svg>`;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writePng(outPath, size) {
  const buf = await sharp(Buffer.from(SVG))
    .resize(size, size)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  await fs.writeFile(outPath, buf);
}

async function writeFavicon(outPath) {
  // Multi-size favicon for best browser support
  const sizes = [16, 32, 48, 64];
  const pngBuffers = await Promise.all(
    sizes.map((s) =>
      sharp(Buffer.from(SVG))
        .resize(s, s)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer(),
    ),
  );
  const ico = await pngToIco(pngBuffers);
  await fs.writeFile(outPath, ico);
}

await ensureDir(publicDir);

await writePng(path.join(publicDir, 'icon-512.png'), 512);
await writePng(path.join(publicDir, 'icon-192.png'), 192);
await writeFavicon(path.join(publicDir, 'favicon.ico'));

console.log('Generated public/icon-512.png, public/icon-192.png, public/favicon.ico');

