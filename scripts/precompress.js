import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const COMPRESSIBLE = /\.(js|css|html|svg|json|txt|xml|map|woff2)$/i;
const MIN_BYTES = 256;

async function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, files);
    else files.push(full);
  }
  return files;
}

const files = await walk(distDir);
let gzCount = 0;
let brCount = 0;

for (const file of files) {
  if (file.endsWith('.gz') || file.endsWith('.br')) continue;
  if (!COMPRESSIBLE.test(file)) continue;
  const buf = fs.readFileSync(file);
  if (buf.length < MIN_BYTES) continue;

  // 1. Gzip (Level 9)
  const gz = await gzip(buf, { level: 9 });
  if (gz.length < buf.length * 0.95) {
    fs.writeFileSync(`${file}.gz`, gz);
    gzCount++;
  }

  // 2. Brotli (Level 11)
  const br = await brotli(buf, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length
    }
  });
  if (br.length < buf.length * 0.95) {
    fs.writeFileSync(`${file}.br`, br);
    brCount++;
  }
}

console.log(`precompress: wrote ${gzCount} .gz and ${brCount} .br files in ${path.relative(process.cwd(), distDir) || 'dist'}`);
