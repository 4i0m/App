const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Draw the Q emblem: circular outer torus with gold gradient and diagonal tail
function getQPixel(x, y, width, height, isMaskable = false) {
  // Normalize to [-1, 1]
  const scale = isMaskable ? 0.72 : 0.82;
  const nx = ((x / width) * 2 - 1) / scale;
  const ny = ((y / height) * 2 - 1) / scale;

  // Background is pitch black #000000 or subtle dark gradient
  const bgDist = Math.hypot(nx, ny);
  let bgR = 5, bgG = 5, bgB = 5;

  // Torus geometry
  // Center is slightly offset to top-left (-0.05, -0.05)
  const cx = -0.04;
  const cy = -0.04;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.hypot(dx, dy);

  const rOuter = 0.74;
  const rInner = 0.44;

  let inRing = dist >= rInner && dist <= rOuter;

  // Tail geometry: line from (0.24, 0.28) to (0.75, 0.78)
  const x1 = 0.22, y1 = 0.26, x2 = 0.72, y2 = 0.76;
  const segDx = x2 - x1, segDy = y2 - y1;
  const segLenSq = segDx * segDx + segDy * segDy;
  let t = ((nx - x1) * segDx + (ny - y1) * segDy) / segLenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * segDx;
  const projY = y1 + t * segDy;
  const tailDist = Math.hypot(nx - projX, ny - projY);
  const inTail = tailDist <= 0.15;

  if (inRing || inTail) {
    // Gold gradient interpolation
    // Color stops: #F9E8C7 (249, 232, 199) -> #C5A46D (197, 164, 109) -> #705626 (112, 86, 38)
    const angle = Math.atan2(ny, nx);
    const gradFactor = Math.max(0, Math.min(1, (nx + ny + 1.2) / 2.4));
    
    // Top highlight vs bottom bevel
    let r = Math.round(249 * (1 - gradFactor) + 112 * gradFactor);
    let g = Math.round(232 * (1 - gradFactor) + 86 * gradFactor);
    let b = Math.round(199 * (1 - gradFactor) + 38 * gradFactor);

    // Subtle edge anti-aliasing
    let edgeAlpha = 1.0;
    if (inRing) {
      const dEdge = Math.min(Math.abs(dist - rInner), Math.abs(dist - rOuter));
      if (dEdge < 0.04) edgeAlpha = Math.min(1, edgeAlpha, dEdge / 0.04);
    }
    if (inTail) {
      const dTailEdge = 0.15 - tailDist;
      if (dTailEdge < 0.03) edgeAlpha = Math.max(edgeAlpha, Math.min(1, dTailEdge / 0.03));
    }

    return [
      Math.round(r * edgeAlpha + bgR * (1 - edgeAlpha)),
      Math.round(g * edgeAlpha + bgG * (1 - edgeAlpha)),
      Math.round(b * edgeAlpha + bgB * (1 - edgeAlpha)),
      255
    ];
  }

  // Border border highlight on rounded square
  if (!isMaskable) {
    const cornerR = 0.88;
    const boxX = Math.abs(nx);
    const boxY = Math.abs(ny);
    if (boxX > cornerR || boxY > cornerR) {
      // corner radius
      const cDist = Math.hypot(Math.max(0, boxX - (cornerR - 0.2)), Math.max(0, boxY - (cornerR - 0.2)));
      if (cDist > 0.4) {
        return [0, 0, 0, 0]; // Transparent outer corners for standalone icon
      }
    }
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

console.log('Generating PWA icons...');
const pwa192 = createPng(192, 192, (x, y, w, h) => getQPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

const pwa512 = createPng(512, 512, (x, y, w, h) => getQPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

const pwaMaskable = createPng(512, 512, (x, y, w, h) => getQPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

const appleTouch = createPng(180, 180, (x, y, w, h) => getQPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// Also generate a 48x48 PNG for favicon
const faviconPng = createPng(48, 48, (x, y, w, h) => getQPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconPng);

console.log('PWA icons generated successfully:');
console.log('- pwa-192x192.png:', pwa192.length, 'bytes');
console.log('- pwa-512x512.png:', pwa512.length, 'bytes');
console.log('- pwa-maskable-512x512.png:', pwaMaskable.length, 'bytes');
console.log('- apple-touch-icon.png:', appleTouch.length, 'bytes');
