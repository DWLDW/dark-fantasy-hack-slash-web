import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateActBackgrounds() {
  const actsDir = path.join(__dirname, '../public/images/acts');
  if (!fs.existsSync(actsDir)) {
    fs.mkdirSync(actsDir, { recursive: true });
  }

  const actThemesData = [
    {
      act: 1,
      title: 'Catacombs of the Sisterhood',
      svg: `
      <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g1" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#4c0519" stop-opacity="0.85"/>
            <stop offset="50%" stop-color="#1c0a10" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#050203" stop-opacity="1"/>
          </radialGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0.3  0 1 0 0 0.05  0 0 1 0 0.08  0 0 0 0.35 0"/>
          </filter>
        </defs>
        <rect width="1280" height="720" fill="url(#g1)"/>
        <!-- Gothic Cathedral Pillars & Arches -->
        <path d="M 100 720 L 100 200 Q 250 80 400 200 L 400 720 Z" fill="#000" opacity="0.35"/>
        <path d="M 880 720 L 880 200 Q 1030 80 1180 200 L 1180 720 Z" fill="#000" opacity="0.35"/>
        <path d="M 450 720 L 450 150 Q 640 40 830 150 L 830 720 Z" fill="#000" opacity="0.45"/>
        <circle cx="640" cy="200" r="120" fill="none" stroke="#e11d48" stroke-width="4" opacity="0.25"/>
        <rect width="1280" height="720" filter="url(#noise)" opacity="0.4"/>
      </svg>`
    },
    {
      act: 2,
      title: 'Lut Gholein Desert & Tombs',
      svg: `
      <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g2" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#78350f" stop-opacity="0.9"/>
            <stop offset="60%" stop-color="#291807" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#0a0502" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#g2)"/>
        <!-- Desert Dunes & Ancient Pyramid Silhouette -->
        <polygon points="640,120 400,600 880,600" fill="#000" opacity="0.4"/>
        <polygon points="200,280 40,650 360,650" fill="#000" opacity="0.35"/>
        <polygon points="1080,280 920,650 1240,650" fill="#000" opacity="0.35"/>
        <path d="M 0 550 Q 300 480 640 560 T 1280 520 L 1280 720 L 0 720 Z" fill="#1c0d02" opacity="0.6"/>
        <circle cx="640" cy="180" r="90" fill="#f59e0b" opacity="0.15"/>
      </svg>`
    },
    {
      act: 3,
      title: 'Kurast Jungle & Toxic Swamps',
      svg: `
      <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g3" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#064e3b" stop-opacity="0.9"/>
            <stop offset="55%" stop-color="#022c22" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#01140e" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#g3)"/>
        <!-- Giant Jungle Vines & Zakarum Spire -->
        <path d="M 580 720 L 610 160 L 670 160 L 700 720 Z" fill="#000" opacity="0.5"/>
        <path d="M 0 0 C 200 150 100 450 300 720 L 0 720 Z" fill="#022019" opacity="0.55"/>
        <path d="M 1280 0 C 1080 150 1180 450 980 720 L 1280 720 Z" fill="#022019" opacity="0.55"/>
        <circle cx="640" cy="220" r="140" fill="#10b981" opacity="0.15"/>
      </svg>`
    },
    {
      act: 4,
      title: 'Burning Hells Chaos Sanctuary',
      svg: `
      <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g4" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#7f1d1d" stop-opacity="0.95"/>
            <stop offset="50%" stop-color="#450a0a" stop-opacity="0.98"/>
            <stop offset="100%" stop-color="#050101" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#g4)"/>
        <!-- Hellfire Spikes & Lava Cracks -->
        <polygon points="640,60 560,720 720,720" fill="#000" opacity="0.6"/>
        <polygon points="280,180 200,720 360,720" fill="#000" opacity="0.5"/>
        <polygon points="1000,180 920,720 1080,720" fill="#000" opacity="0.5"/>
        <path d="M 0 620 Q 350 540 640 640 T 1280 600 L 1280 720 L 0 720 Z" fill="#ef4444" opacity="0.25"/>
        <circle cx="640" cy="300" r="180" fill="#dc2626" opacity="0.2"/>
      </svg>`
    },
    {
      act: 5,
      title: 'Mount Arreat Frozen Tundra',
      svg: `
      <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g5" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#164e63" stop-opacity="0.9"/>
            <stop offset="55%" stop-color="#082f49" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#020d18" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#g5)"/>
        <!-- Frozen Mountain Peaks & Blizzard Silhouette -->
        <polygon points="640,100 300,720 980,720" fill="#000" opacity="0.45"/>
        <polygon points="200,220 0,720 480,720" fill="#000" opacity="0.35"/>
        <polygon points="1080,220 800,720 1280,720" fill="#000" opacity="0.35"/>
        <circle cx="640" cy="240" r="150" fill="#06b6d4" opacity="0.18"/>
      </svg>`
    }
  ];

  for (const t of actThemesData) {
    const outPath = path.join(actsDir, `act${t.act}.webp`);
    await sharp(Buffer.from(t.svg))
      .resize(1280, 720)
      .webp({ quality: 80, effort: 6 })
      .toFile(outPath);
    const st = fs.statSync(outPath);
    console.log(`✅ [Act ${t.act}] Generated ${outPath} (${(st.size / 1024).toFixed(1)} KB)`);
  }

  console.log('🎉 All Act background artworks generated!');
}

generateActBackgrounds().catch(console.error);
