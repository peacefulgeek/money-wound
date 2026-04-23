import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ─── Start web server as child process ────────────────────────
const server = spawn('node', ['dist/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('[cron-runner] Server spawn error:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.error(`[cron-runner] Server exited with code ${code}`);
  process.exit(code ?? 1);
});

// ─── Cron #1: Generate article Mon-Fri 06:00 UTC ──────────────
cron.schedule('0 6 * * 1-5', async () => {
  if (process.env.AUTO_GEN_ENABLED !== 'true') return;
  console.log('[cron-1] Generating daily article');
  try {
    const { generateDailyArticle } = await import('../src/cron/generate-article.mjs');
    await generateDailyArticle();
  } catch (err) {
    console.error('[cron-1] Error:', err);
  }
});

// ─── Cron #2: Product spotlight Saturdays 08:00 UTC ───────────
cron.schedule('0 8 * * 6', async () => {
  if (process.env.AUTO_GEN_ENABLED !== 'true') return;
  console.log('[cron-2] Running product spotlight');
  try {
    const { runProductSpotlight } = await import('../src/cron/product-spotlight.mjs');
    await runProductSpotlight();
  } catch (err) {
    console.error('[cron-2] Error:', err);
  }
});

// ─── Cron #3: Monthly refresh 1st of month 03:00 UTC ──────────
cron.schedule('0 3 1 * *', async () => {
  if (process.env.AUTO_GEN_ENABLED !== 'true') return;
  console.log('[cron-3] Running monthly refresh');
  try {
    const { refreshMonthly } = await import('../src/cron/refresh-monthly.mjs');
    await refreshMonthly();
  } catch (err) {
    console.error('[cron-3] Error:', err);
  }
});

// ─── Cron #4: Quarterly refresh Jan/Apr/Jul/Oct 1st 04:00 UTC ─
cron.schedule('0 4 1 1,4,7,10 *', async () => {
  if (process.env.AUTO_GEN_ENABLED !== 'true') return;
  console.log('[cron-4] Running quarterly refresh');
  try {
    const { refreshQuarterly } = await import('../src/cron/refresh-quarterly.mjs');
    await refreshQuarterly();
  } catch (err) {
    console.error('[cron-4] Error:', err);
  }
});

// ─── Cron #5: ASIN health check Sundays 05:00 UTC ─────────────
cron.schedule('0 5 * * 0', async () => {
  console.log('[cron-5] Running ASIN health check');
  try {
    const { runAsinHealthCheck } = await import('../src/cron/asin-health-check.mjs');
    await runAsinHealthCheck();
  } catch (err) {
    console.error('[cron-5] Error:', err);
  }
});

console.log('[cron-runner] All 5 cron schedules registered. AUTO_GEN_ENABLED=' + process.env.AUTO_GEN_ENABLED);
