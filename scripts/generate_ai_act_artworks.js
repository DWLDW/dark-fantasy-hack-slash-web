import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const acts = [
  {
    act: 1,
    name: 'act1',
    prompt: 'dark fantasy gothic monastery catacombs crypt, ruined stone arches, ominous blood red mist, torches casting dramatic shadows, diablo 2 inspired concept art digital painting wide angle, cinematic atmospheric lighting',
    seed: 101
  },
  {
    act: 2,
    name: 'act2',
    prompt: 'dark fantasy ancient desert tomb interior, sandstone pillars with glowing hieroglyphs, amber dust storm particles, golden braziers, diablo 2 lut gholein desert ruins concept art, wide angle digital painting, dramatic cinematic lighting',
    seed: 202
  },
  {
    act: 3,
    name: 'act3',
    prompt: 'dark fantasy overgrown toxic jungle swamp temple, glowing emerald green venomous fog, ancient mossy stone ruins, corrupted swamp water reflections, diablo 2 kurast inspired concept art, eerie atmospheric lighting, wide angle digital painting',
    seed: 303
  },
  {
    act: 4,
    name: 'act4',
    prompt: 'dark fantasy burning hells landscape, rivers of molten glowing red lava, blackened obsidian demonic spikes and gothic hell arches, fire embers, diablo 2 chaos sanctuary concept art, epic hellfire lighting, wide angle digital painting',
    seed: 404
  },
  {
    act: 5,
    name: 'act5',
    prompt: 'dark fantasy frozen mountain summit of mount arreat, violent blizzard snowstorm mist, frost covered ancient barbarian stone monoliths, glowing cyan glacial ice crystals, diablo 2 inspired concept art, dramatic cold blizzard lighting, wide angle digital painting',
    seed: 505
  }
];

async function generateAllActArtworks() {
  const actsDir = path.join(__dirname, '../public/images/acts');
  if (!fs.existsSync(actsDir)) {
    fs.mkdirSync(actsDir, { recursive: true });
  }

  for (const item of acts) {
    console.log(`🎨 [Act ${item.act}] Generating AI artwork...`);
    const encodedPrompt = encodeURIComponent(item.prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${item.seed}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      
      // Save full-res optimized WebP and high quality fallback
      const outWebP = path.join(actsDir, `act${item.act}.webp`);
      const outJpg = path.join(actsDir, `act${item.act}.jpg`);

      await sharp(buffer)
        .resize(1280, 720, { fit: 'cover' })
        .webp({ quality: 82, effort: 6 })
        .toFile(outWebP);

      await sharp(buffer)
        .resize(1280, 720, { fit: 'cover' })
        .jpeg({ quality: 80, progressive: true })
        .toFile(outJpg);

      const webpStat = fs.statSync(outWebP);
      console.log(`✅ [Act ${item.act}] Successfully generated & saved! WebP: ${(webpStat.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`❌ [Act ${item.act}] Failed:`, err);
    }
  }

  console.log('🎉 All 5 Act AI artworks generated and optimized!');
}

generateAllActArtworks().catch(console.error);
