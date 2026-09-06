const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
  const PNG_HEADER = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([len, typeB, data, crcB]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Build raw scanlines
  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter type None
    for (let x = 0; x < width; x++) {
      raw.push(r);
      raw.push(g);
      raw.push(b);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));

  return Buffer.concat([
    PNG_HEADER,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const assetsDir = path.join(__dirname, 'mobile', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// icon.png 1024x1024 — deep purple brand bg
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPNG(1024, 1024, 10, 4, 20));
console.log('✓ icon.png (1024x1024)');

// adaptive-icon.png 1024x1024 — pink brand color
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPNG(1024, 1024, 255, 42, 133));
console.log('✓ adaptive-icon.png (1024x1024)');

// splash.png 1242x2688 — dark bg matching splash backgroundColor
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createPNG(1242, 2688, 10, 4, 20));
console.log('✓ splash.png (1242x2688)');

// favicon.png 48x48 — pink
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), createPNG(48, 48, 255, 42, 133));
console.log('✓ favicon.png (48x48)');

console.log('\nAll assets generated successfully in mobile/assets/');
