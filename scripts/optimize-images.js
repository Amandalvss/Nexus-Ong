// scripts/optimize-images.js
// Convert images to WebP and AVIF for production using sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'img');
const outDir = path.resolve(__dirname, '..', 'dist', 'img');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function processFile(file) {
  const inPath = path.join(srcDir, file);
  const name = path.parse(file).name;
  try {
    const image = sharp(inPath);
    await image.webp({ quality: 80 }).toFile(path.join(outDir, `${name}.webp`));
    await image.avif({ quality: 50 }).toFile(path.join(outDir, `${name}.avif`));
    console.log('Optimized', file);
  } catch (err) {
    console.warn('Could not process', file, err.message);
  }
}

fs.readdir(srcDir, (err, files) => {
  if (err) { console.error(err); process.exit(1); }
  files.filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f)).forEach(f => processFile(f));
});
