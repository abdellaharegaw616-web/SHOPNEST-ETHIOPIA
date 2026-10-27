import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const clientPublicDir = path.resolve('client/public');
const iconsDir = path.join(clientPublicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Create beautiful SVG icons
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#7C2D12" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Background with rounded corners -->
  <rect width="192" height="192" rx="42" fill="url(#brandGrad)"/>
  
  <!-- Ethiopian Tricolor subtle accent stripe -->
  <g opacity="0.9" transform="translate(36, 154)">
    <rect x="0" y="0" width="40" height="4" rx="2" fill="#10B981" />
    <rect x="40" y="0" width="40" height="4" rx="2" fill="#FBBF24" />
    <rect x="80" y="0" width="40" height="4" rx="2" fill="#EF4444" />
  </g>

  <!-- Central Nest & Shopping Bag Icon -->
  <g filter="url(#shadow)" transform="translate(40, 36)">
    <!-- Bag Handle -->
    <path d="M 36 34 C 36 18, 76 18, 76 34" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
    <!-- Bag Body with Nest curve -->
    <path d="M 18 34 L 94 34 L 86 94 C 86 100, 80 106, 72 106 L 40 106 C 32 106, 26 100, 26 94 Z" fill="#FFFFFF"/>
    <!-- Heart / Diamond accent representing Ethiopia's heart -->
    <path d="M 56 54 L 63 65 L 56 76 L 49 65 Z" fill="#F97316"/>
    <!-- Nest weaves -->
    <path d="M 32 86 Q 56 94 80 86" fill="none" stroke="#F97316" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="brandGrad512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="50%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <filter id="shadow512" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#7C2D12" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#brandGrad512)"/>
  
  <!-- Subtle circular radiant aura -->
  <circle cx="256" cy="256" r="180" fill="#FFFFFF" opacity="0.06"/>
  
  <!-- Ethiopian Tricolor Accent Stripe -->
  <g opacity="0.95" transform="translate(106, 416)">
    <rect x="0" y="0" width="100" height="10" rx="5" fill="#10B981" />
    <rect x="100" y="0" width="100" height="10" rx="5" fill="#FBBF24" />
    <rect x="200" y="0" width="100" height="10" rx="5" fill="#EF4444" />
  </g>

  <!-- Central Nest & Shopping Bag Icon -->
  <g filter="url(#shadow512)" transform="translate(106, 96)">
    <!-- Bag Handle -->
    <path d="M 96 90 C 96 48, 204 48, 204 90" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round"/>
    <!-- Bag Body with Nest curve -->
    <path d="M 48 90 L 252 90 L 230 250 C 230 268, 214 284, 192 284 L 108 284 C 86 284, 70 268, 70 250 Z" fill="#FFFFFF"/>
    <!-- Center Jewel Motif -->
    <path d="M 150 144 L 170 174 L 150 204 L 130 174 Z" fill="#F97316"/>
    <!-- Nest Weave Curves -->
    <path d="M 86 230 Q 150 252 214 230" fill="none" stroke="#F97316" stroke-width="10" stroke-linecap="round"/>
    <path d="M 96 206 Q 150 224 204 206" fill="none" stroke="#F97316" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
  </g>
</svg>`;

const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#F97316"/>
  <circle cx="256" cy="256" r="220" fill="#EA580C" opacity="0.5"/>
  <g transform="translate(106, 106)">
    <path d="M 96 90 C 96 48, 204 48, 204 90" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round"/>
    <path d="M 48 90 L 252 90 L 230 250 C 230 268, 214 284, 192 284 L 108 284 C 86 284, 70 268, 70 250 Z" fill="#FFFFFF"/>
    <path d="M 150 144 L 170 174 L 150 204 L 130 174 Z" fill="#F97316"/>
    <path d="M 86 230 Q 150 252 214 230" fill="none" stroke="#F97316" stroke-width="10" stroke-linecap="round"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.svg'), svg192, 'utf8');
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.svg'), svg512, 'utf8');
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), svgMaskable, 'utf8');

// 2. Pure Node PNG builder helper function to write valid PNG files
function generateSolidPng(width, height, r, g, b) {
  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcBuf = Buffer.alloc(4 + len);
    crcBuf.write(type, 0, 4, 'ascii');
    data.copy(crcBuf, 4);
    buf.writeUInt32BE(crc32(crcBuf), 8 + len);
    return buf;
  }

  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  // Each line starts with filter byte 0, followed by width * 4 bytes RGBA
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(lineSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineSize;
    rawData[lineOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Simple icon drawing: Orange badge with white shopping bag center
      const inBagBody = Math.abs(dx) <= width * 0.22 && dy >= -height * 0.05 && dy <= height * 0.25;
      const inHandle = Math.abs(dx) <= width * 0.12 && dy >= -height * 0.22 && dy <= -height * 0.05 && Math.abs(dx) >= width * 0.07;
      const inHandleTop = Math.abs(dx) <= width * 0.12 && dy >= -height * 0.25 && dy <= -height * 0.20;

      if (inBagBody || inHandle || inHandleTop) {
        // White center symbol
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 255;
        rawData[pxOffset + 2] = 255;
        rawData[pxOffset + 3] = 255;
      } else {
        // Brand orange background #F97316
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const png192 = generateSolidPng(192, 192, 249, 115, 22);
const png512 = generateSolidPng(512, 512, 249, 115, 22);

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.png'), png512);

console.log('Successfully generated PWA SVG and PNG icons in client/public/icons!');
