import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const gzip = promisify(zlib.gzip);
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
let wrote = 0;
let skipped = 0;

for (const file of files) {
  if (file.endsWith('.gz') || file.endsWith('.br')) continue;
  if (!COMPRESSIBLE.test(file)) continue;
  const buf = fs.readFileSync(file);
  if (buf.length < MIN_BYTES) {
    skipped += 1;
    continue;
  }
  const gz = await gzip(buf, { level: 9 });
  if (gz.length >= buf.length * 0.95) {
    skipped += 1;
    continue;
  }
  fs.writeFileSync(`${file}.gz`, gz);
  wrote += 1;
}

console.log(`precompress: wrote ${wrote} .gz files (${skipped} skipped) in ${path.relative(process.cwd(), distDir) || 'dist'}`);
