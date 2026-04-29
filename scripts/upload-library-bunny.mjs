/**
 * upload-library-bunny.mjs
 * Uploads lib-01.webp through lib-40.webp to Bunny CDN at /library/
 * Run once: node scripts/upload-library-bunny.mjs
 */
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BUNNY_STORAGE_ZONE = 'money-wound';
const BUNNY_API_KEY = 'f45c7c09-0fbc-4742-90b3ae69b3cc-2990-40ff';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';
const BUNNY_PULL_ZONE = 'https://money-wound.b-cdn.net';

const LOCAL_DIR = '/home/ubuntu/money-wound-images/library';

async function uploadFile(localPath, remotePath) {
  const buf = await readFile(localPath);
  const url = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${remotePath}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'image/webp' },
    body: buf
  });
  if (!res.ok) throw new Error(`Upload failed ${remotePath}: ${res.status}`);
  return `${BUNNY_PULL_ZONE}/${remotePath}`;
}

async function run() {
  let ok = 0, fail = 0;
  for (let i = 1; i <= 40; i++) {
    const num = String(i).padStart(2, '0');
    const filename = `lib-${num}.webp`;
    const localPath = join(LOCAL_DIR, filename);
    const remotePath = `library/${filename}`;
    try {
      const url = await uploadFile(localPath, remotePath);
      process.stdout.write(`  OK  ${url}\n`);
      ok++;
    } catch (err) {
      process.stdout.write(`  FAIL ${filename}: ${err.message}\n`);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} uploaded, ${fail} failed`);
}

run().catch(err => { console.error(err); process.exit(1); });
