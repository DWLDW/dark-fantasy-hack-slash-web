import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimize() {
  console.log('🖼️ Starting image optimization...');

  // 1. Optimize Boss Portraits
  const bossDir = path.join(__dirname, '../public/images/bosses');
  const bossFiles = fs.readdirSync(bossDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

  for (const file of bossFiles) {
    const filePath = path.join(bossDir, file);
    const baseName = path.parse(file).name;
    const origStat = fs.statSync(filePath);

    // Create 256x256 WebP
    const webpPath = path.join(bossDir, `${baseName}.webp`);
    await sharp(filePath)
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);

    // Overwrite with 256x256 optimized JPG
    const tempJpg = path.join(bossDir, `${baseName}_temp.jpg`);
    await sharp(filePath)
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(tempJpg);

    fs.renameSync(tempJpg, filePath);

    const webpStat = fs.statSync(webpPath);
    const jpgStat = fs.statSync(filePath);
    console.log(`✅ [Boss] ${file}: ${(origStat.size / 1024).toFixed(1)} KB -> JPG ${(jpgStat.size / 1024).toFixed(1)} KB | WebP ${(webpStat.size / 1024).toFixed(1)} KB`);
  }

  // 2. Optimize Town Images
  const imgDir = path.join(__dirname, '../public/images');
  const townFiles = ['town_bg.png', 'town_map.png'];

  for (const file of townFiles) {
    const filePath = path.join(imgDir, file);
    if (!fs.existsSync(filePath)) continue;

    const baseName = path.parse(file).name;
    const origStat = fs.statSync(filePath);

    // WebP version
    const webpPath = path.join(imgDir, `${baseName}.webp`);
    await sharp(filePath)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);

    // Optimized PNG version
    const tempPng = path.join(imgDir, `${baseName}_temp.png`);
    await sharp(filePath)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9, effort: 8 })
      .toFile(tempPng);

    fs.renameSync(tempPng, filePath);

    const webpStat = fs.statSync(webpPath);
    const pngStat = fs.statSync(filePath);
    console.log(`✅ [Town] ${file}: ${(origStat.size / 1024).toFixed(1)} KB -> PNG ${(pngStat.size / 1024).toFixed(1)} KB | WebP ${(webpStat.size / 1024).toFixed(1)} KB`);
  }

  console.log('🎉 Image optimization completed!');
}

optimize().catch(err => {
  console.error('❌ Error optimizing images:', err);
  process.exit(1);
});
