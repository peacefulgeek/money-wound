import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUNNY_STORAGE_ZONE = 'money-wound';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';
const BUNNY_API_KEY = 'f45c7c09-0fbc-4742-90b3ae69b3cc-2990-40ff';
const CDN_BASE = 'https://money-wound.b-cdn.net';

const IMAGES_DIR = path.resolve(__dirname, '../../money-wound-images/webp');

function uploadFile(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(localPath);
    const options = {
      hostname: BUNNY_HOSTNAME,
      path: `/${BUNNY_STORAGE_ZONE}/${remotePath}`,
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp',
        'Content-Length': fileBuffer.length,
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve({ path: remotePath, url: `${CDN_BASE}/${remotePath}` });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

async function uploadAll() {
  const manifest = {};
  let uploaded = 0, failed = 0;

  // Upload hero images
  const heroFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.webp') && !fs.statSync(path.join(IMAGES_DIR, f)).isDirectory());
  for (const file of heroFiles) {
    const localPath = path.join(IMAGES_DIR, file);
    const remotePath = `images/${file}`;
    try {
      const result = await uploadFile(localPath, remotePath);
      manifest[file.replace('.webp', '')] = result.url;
      console.log(`[bunny] Uploaded: ${result.url}`);
      uploaded++;
    } catch (err) {
      console.error(`[bunny] FAILED ${file}: ${err.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // Upload article images
  const articlesDir = path.join(IMAGES_DIR, 'articles');
  const articleFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.webp'));
  for (const file of articleFiles) {
    const localPath = path.join(articlesDir, file);
    const remotePath = `images/articles/${file}`;
    try {
      const result = await uploadFile(localPath, remotePath);
      manifest[`articles/${file.replace('.webp', '')}`] = result.url;
      console.log(`[bunny] Uploaded: ${result.url}`);
      uploaded++;
    } catch (err) {
      console.error(`[bunny] FAILED ${file}: ${err.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // Write manifest
  const manifestPath = path.resolve(__dirname, '../src/data/image-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n[bunny] Done. Uploaded: ${uploaded}, Failed: ${failed}`);
  console.log(`[bunny] Manifest written to ${manifestPath}`);
  return manifest;
}

uploadAll().catch(err => {
  console.error('[bunny] Fatal:', err);
  process.exit(1);
});
