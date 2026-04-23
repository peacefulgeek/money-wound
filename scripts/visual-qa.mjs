import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const failures = [];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function luminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// 1. Contrast check from design tokens
try {
  const css = await fs.readFile(path.join(projectRoot, 'src/client/styles/tokens.css'), 'utf8');
  const text = css.match(/--text-primary:\s*(#[0-9a-fA-F]{6})/)?.[1];
  const bg = css.match(/--bg-primary:\s*(#[0-9a-fA-F]{6})/)?.[1];
  if (text && bg) {
    const ratio = contrastRatio(hexToRgb(text), hexToRgb(bg));
    if (ratio < 4.5) failures.push(`contrast-fail: ${text} on ${bg} = ${ratio.toFixed(2)} (need 4.5)`);
    else console.log(`[visual-qa] Contrast ${ratio.toFixed(2)} OK`);
  } else {
    failures.push('tokens.css missing --text-primary or --bg-primary');
  }
} catch (e) {
  failures.push(`tokens.css not readable: ${e.message}`);
}

// 2. Check dist/client exists
async function walk(dir, results = []) {
  try {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(full, results);
      else results.push(full);
    }
  } catch {}
  return results;
}

const clientDir = path.join(projectRoot, 'dist/client');
const clientFiles = await walk(clientDir);

if (clientFiles.length === 0) {
  failures.push('dist/client is empty - build may have failed');
} else {
  console.log(`[visual-qa] dist/client has ${clientFiles.length} files`);
}

// 3. No Google Fonts in HTML
for (const f of clientFiles.filter(f => f.endsWith('.html'))) {
  const html = await fs.readFile(f, 'utf8');
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html)) {
    failures.push(`google-fonts-leak: ${path.basename(f)}`);
  }
  if (/cloudfront\.net/.test(html)) {
    failures.push(`cloudfront-leak: ${path.basename(f)}`);
  }
}

// 4. No Manus artifacts
async function walkSrc(dir, results = []) {
  try {
    for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) await walkSrc(full, results);
      else results.push(full);
    }
  } catch {}
  return results;
}

const srcFiles = await walkSrc(path.join(projectRoot, 'src'));
const scriptFiles = await walkSrc(path.join(projectRoot, 'scripts'));
const allSourceFiles = [...srcFiles, ...scriptFiles];

for (const f of allSourceFiles) {
  if (!/\.(ts|tsx|js|mjs|jsx)$/.test(f)) continue;
  try {
    const txt = await fs.readFile(f, 'utf8');
    if (/forge\.manus\.im|vite-plugin-manus|manus-runtime/.test(txt) && !f.endsWith('visual-qa.mjs')) {
      failures.push(`manus-artifact: ${f}`);
    }
  } catch {}
}

// 5. No API keys in code
for (const f of allSourceFiles) {
  if (!/\.(ts|tsx|js|mjs|jsx)$/.test(f)) continue;
  try {
    const txt = await fs.readFile(f, 'utf8');
    if (/sk-ant-api[0-9a-zA-Z_-]{20,}/.test(txt)) failures.push(`API key in code: ${f}`);
    if (/ghp_[0-9a-zA-Z]{30,}/.test(txt)) failures.push(`GitHub PAT in code: ${f}`);
  } catch {}
}

// Report
if (failures.length > 0) {
  console.error('[visual-qa] FAILED:');
  failures.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('[visual-qa] All checks passed');
