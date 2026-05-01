import { verifyAsinBatch, buildAmazonUrl, countAmazonLinks, extractAsinsFromText } from '../lib/amazon-verify.mjs';
import { matchProducts } from '../lib/match-products.mjs';
import { getPublishedArticlesWithAsins, updateArticleBody } from '../lib/db.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_PATH = path.resolve(__dirname, '../data/verified-asins.json');

export async function runAsinHealthCheck() {
  console.log('[asin-health-check] Starting weekly sweep');
  let cache;
  try {
    cache = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
  } catch {
    cache = { version: 1, lastUpdated: null, asins: {}, failed: {} };
  }

  const asins = Object.keys(cache.asins);
  if (asins.length === 0) {
    console.log('[asin-health-check] Empty catalog - nothing to check');
    return { checked: 0, invalidated: 0 };
  }

  console.log(`[asin-health-check] Checking ${asins.length} ASINs`);
  const results = await verifyAsinBatch(asins, {
    delayMs: 2500,
    onProgress: (done, total) => {
      if (done % 25 === 0) console.log(`[asin-health-check] ${done}/${total}`);
    }
  });

  const now = new Date().toISOString();
  let invalidated = 0;
  const deadAsins = [];

  for (const r of results) {
    const existing = cache.asins[r.asin];
    if (r.valid) {
      existing.lastChecked = now;
      existing.status = 'valid';
      if (r.title) existing.title = r.title;
    } else {
      deadAsins.push(r.asin);
      delete cache.asins[r.asin];
      cache.failed[r.asin] = {
        reason: r.reason,
        lastAttempted: now,
        attempts: (cache.failed[r.asin]?.attempts || 0) + 1
      };
      invalidated++;
      console.warn(`[asin-health-check] INVALIDATED ${r.asin}: ${r.reason}`);
    }
  }

  cache.lastUpdated = now;
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`[asin-health-check] Invalidated ${invalidated} ASINs`);

  if (deadAsins.length > 0) {
    await swapDeadAsinsAcrossArticles(deadAsins, cache);
  }

  return { checked: asins.length, invalidated };
}

async function swapDeadAsinsAcrossArticles(deadAsins, cache) {
  const allArticles = await getPublishedArticlesWithAsins();
  const articles = allArticles.filter(a =>
    Array.isArray(a.asins_used) && a.asins_used.some(asin => deadAsins.includes(asin))
  );

  console.log(`[asin-health-check] Swapping dead ASINs in ${articles.length} articles`);

  const catalog = Object.entries(cache.asins).map(([asin, entry]) => ({
    asin, name: entry.title, category: entry.category || '', tags: entry.tags || []
  }));

  for (const article of articles) {
    let body = article.body;
    for (const dead of deadAsins) {
      const re = new RegExp(
        `<a[^>]*href="[^"]*\\/dp\\/${dead}[^"]*"[^>]*>.*?</a>\\s*(?:\\(paid link\\))?`,
        'gi'
      );
      body = body.replace(re, '');
    }

    const needed = Math.max(0, 3 - countAmazonLinks(body));
    if (needed > 0 && catalog.length > 0) {
      const picks = matchProducts({
        articleTitle: article.slug,
        articleTags: article.tags || [],
        articleCategory: article.category || 'money-psychology',
        catalog,
        minLinks: 3,
        maxLinks: 4
      });
      const existing = new Set(extractAsinsFromText(body));
      const toAdd = picks.filter(p => !existing.has(p.asin)).slice(0, needed);
      body += '\n' + toAdd.map(p =>
        `<p>A helpful resource here is <a href="${buildAmazonUrl(p.asin)}" target="_blank" rel="nofollow sponsored noopener noreferrer">${p.name}</a> (paid link).</p>`
      ).join('\n');
    }

    await updateArticleBody(article.slug, body, article.word_count || 0, null);
    await new Promise(r => setTimeout(r, 200));
  }
}
