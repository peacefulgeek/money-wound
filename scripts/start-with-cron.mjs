/**
 * start-with-cron.mjs
 * Starts the web server and registers all 5 cron jobs.
 *
 * Cron #1 (Article Publisher) uses phase-based scheduling:
 *   Phase 1 (published < 60):  5x/day every day  (07:00, 10:00, 13:00, 16:00, 19:00 UTC)
 *   Phase 2 (published >= 60): 1x/weekday         (08:00 UTC, Mon-Fri only)
 */
import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ─── Start web server as child process ────────────────────────────────────────
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

// ─── Helper: get published count ──────────────────────────────────────────────
async function getPublishedCount() {
  try {
    const { query } = await import('../src/lib/db.mjs');
    const { rows } = await query("SELECT COUNT(*) FROM articles WHERE status = 'published'");
    return parseInt(rows[0].count, 10);
  } catch {
    return 0;
  }
}

// ─── Article publisher runner ─────────────────────────────────────────────────
async function runArticlePublisher(label) {
  if (process.env.AUTO_GEN_ENABLED !== 'true') return;
  const count = await getPublishedCount();
  const phase = count < 60 ? 1 : 2;

  // Phase 2 fires only on weekdays (0=Sun, 6=Sat)
  if (phase === 2) {
    const day = new Date().getUTCDay();
    if (day === 0 || day === 6) {
      console.log(`[${label}] Phase 2 - skipping weekend`);
      return;
    }
  }

  console.log(`[${label}] Phase ${phase} - published count: ${count}`);
  try {
    const { generateDailyArticle } = await import('../src/cron/generate-article.mjs');
    await generateDailyArticle();
  } catch (err) {
    console.error(`[${label}] Error:`, err);
  }
}

// ─── Cron #1a-e: Phase 1 — 5x/day every day (07:00, 10:00, 13:00, 16:00, 19:00 UTC)
// Phase 2 guard is inside runArticlePublisher — it skips weekends automatically
cron.schedule('0 7 * * *',  () => runArticlePublisher('cron-1a'));
cron.schedule('0 10 * * *', () => runArticlePublisher('cron-1b'));
cron.schedule('0 13 * * *', () => runArticlePublisher('cron-1c'));
cron.schedule('0 16 * * *', () => runArticlePublisher('cron-1d'));
cron.schedule('0 19 * * *', () => runArticlePublisher('cron-1e'));

// ─── Cron #2: Product spotlight Saturdays 08:00 UTC ──────────────────────────
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

// ─── Cron #3: Monthly refresh 1st of month 03:00 UTC ─────────────────────────
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

// ─── Cron #4: Quarterly refresh Jan/Apr/Jul/Oct 1st 04:00 UTC ────────────────
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

// ─── Cron #5: ASIN health check Sundays 05:00 UTC ────────────────────────────
cron.schedule('0 5 * * 0', async () => {
  console.log('[cron-5] Running ASIN health check');
  try {
    const { runAsinHealthCheck } = await import('../src/cron/asin-health-check.mjs');
    await runAsinHealthCheck();
  } catch (err) {
    console.error('[cron-5] Error:', err);
  }
});

console.log('[cron-runner] All cron schedules registered.');
console.log('[cron-runner] AUTO_GEN_ENABLED=' + process.env.AUTO_GEN_ENABLED);
console.log('[cron-runner] Phase 1 (< 60 published): 5x/day every day at 07,10,13,16,19 UTC');
console.log('[cron-runner] Phase 2 (>= 60 published): 1x/weekday at 08 UTC (Mon-Fri)');
