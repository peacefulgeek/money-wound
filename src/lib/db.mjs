/**
 * db.mjs — Flat JSON file store. Zero database. Zero pg. Zero DATABASE_URL.
 *
 * Articles are stored as individual JSON files:
 *   data/articles/{slug}.json
 *
 * An index file is maintained for fast list queries:
 *   data/articles/_index.json  — array of article metadata (no body)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

// Use process.cwd() so this works whether running from source or bundled into dist/index.js
// The data/articles directory is always relative to the project root (where pnpm start is run)
const DATA_DIR = join(process.cwd(), 'data', 'articles');
const INDEX_FILE = join(DATA_DIR, '_index.json');

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readIndex() {
  ensureDir();
  if (!existsSync(INDEX_FILE)) return [];
  try { return JSON.parse(readFileSync(INDEX_FILE, 'utf8')); } catch { return []; }
}

function writeIndex(index) {
  ensureDir();
  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
}

function articlePath(slug) { return join(DATA_DIR, `${slug}.json`); }

function readArticleFile(slug) {
  const p = articlePath(slug);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function writeArticleFile(article) {
  ensureDir();
  writeFileSync(articlePath(article.slug), JSON.stringify(article, null, 2), 'utf8');
}

function toIndexEntry(a) {
  return {
    id: a.id, slug: a.slug, title: a.title,
    meta_description: a.meta_description || null,
    og_title: a.og_title || null, og_description: a.og_description || null,
    category: a.category || null, tags: a.tags || [],
    image_url: a.image_url || null, image_alt: a.image_alt || null,
    reading_time: a.reading_time || null, author: a.author || 'Kalesh',
    published: a.published !== false, status: a.status || 'published',
    published_at: a.published_at || null, queued_at: a.queued_at || null,
    created_at: a.created_at || null, updated_at: a.updated_at || null,
    word_count: a.word_count || null, asins_used: a.asins_used || [],
    cta_primary: a.cta_primary || null, opener_type: a.opener_type || null,
    conclusion_type: a.conclusion_type || null,
    last_refreshed_30d: a.last_refreshed_30d || null,
    last_refreshed_90d: a.last_refreshed_90d || null,
  };
}

function updateIndexEntry(article) {
  const index = readIndex();
  const i = index.findIndex(a => a.slug === article.slug);
  const entry = toIndexEntry(article);
  if (i >= 0) index[i] = entry; else index.unshift(entry);
  writeIndex(index);
}

export function rebuildIndex() {
  ensureDir();
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== '_index.json');
  const entries = [];
  for (const f of files) {
    try {
      const a = JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8'));
      entries.push(toIndexEntry(a));
    } catch { /* skip corrupt */ }
  }
  entries.sort((a, b) => {
    const at = a.published_at || a.queued_at || a.created_at || '';
    const bt = b.published_at || b.queued_at || b.created_at || '';
    return bt.localeCompare(at);
  });
  writeIndex(entries);
  return entries;
}

// ─── Named API ────────────────────────────────────────────────────────────────

export async function getPublishedArticles({ limit = 20, offset = 0, category = null } = {}) {
  const index = readIndex();
  let rows = index.filter(a => a.status === 'published');
  if (category) rows = rows.filter(a => a.category === category);
  rows.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));
  return rows.slice(offset, offset + limit);
}

export async function getPublishedCount() {
  return readIndex().filter(a => a.status === 'published').length;
}

export async function getQueuedCount() {
  return readIndex().filter(a => a.status === 'queued').length;
}

export async function getArticle(slug) {
  return readArticleFile(slug);
}

export async function getOldestQueued() {
  const index = readIndex();
  const queued = index.filter(a => a.status === 'queued');
  queued.sort((a, b) => (a.queued_at || '').localeCompare(b.queued_at || ''));
  if (queued.length === 0) return null;
  return readArticleFile(queued[0].slug);
}

export async function publishArticle(slug, imageUrl = null) {
  const article = readArticleFile(slug);
  if (!article) return null;
  article.status = 'published';
  article.published = true;
  article.published_at = new Date().toISOString();
  article.updated_at = new Date().toISOString();
  if (imageUrl) article.image_url = imageUrl;
  writeArticleFile(article);
  updateIndexEntry(article);
  return article;
}

export async function insertArticle(article) {
  const index = readIndex();
  const id = (index.length > 0 ? Math.max(...index.map(a => a.id || 0)) : 0) + 1;
  const now = new Date().toISOString();
  const full = {
    id, created_at: now, updated_at: now, queued_at: now,
    published: false, status: 'queued', author: 'Kalesh',
    ...article,
  };
  writeArticleFile(full);
  updateIndexEntry(full);
  return full;
}

export async function articleExists(slug) {
  return existsSync(articlePath(slug));
}

export async function getSitemapArticles() {
  return readIndex()
    .filter(a => a.status === 'published')
    .map(a => ({ slug: a.slug, updated_at: a.updated_at || a.published_at || a.created_at }));
}

export async function getArticlesForMonthlyRefresh(cutoffDate) {
  const index = readIndex();
  return index
    .filter(a => a.status === 'published')
    .filter(a => !a.last_refreshed_30d || a.last_refreshed_30d < cutoffDate)
    .map(a => readArticleFile(a.slug)).filter(Boolean);
}

export async function getArticlesForQuarterlyRefresh(cutoffDate) {
  const index = readIndex();
  return index
    .filter(a => a.status === 'published')
    .filter(a => !a.last_refreshed_90d || a.last_refreshed_90d < cutoffDate)
    .map(a => readArticleFile(a.slug)).filter(Boolean);
}

// updateArticleBody(slug, body, wordCount, refreshField)
// refreshField: 'last_refreshed_30d' | 'last_refreshed_90d' | null
export async function updateArticleBody(slug, body, wordCount = 0, refreshField = null) {
  const article = readArticleFile(slug);
  if (!article) return;
  article.body = body;
  article.updated_at = new Date().toISOString();
  if (wordCount) article.word_count = wordCount;
  if (refreshField === 'last_refreshed_30d') article.last_refreshed_30d = new Date().toISOString();
  if (refreshField === 'last_refreshed_90d') article.last_refreshed_90d = new Date().toISOString();
  writeArticleFile(article);
  updateIndexEntry(article);
}

export async function getAllPublishedSlugs() {
  return readIndex().filter(a => a.status === 'published').map(a => a.slug);
}

// Alias for start-with-cron.mjs
export async function countPublishedArticles() {
  return readIndex().filter(a => a.status === 'published').length;
}

// Get articles in a specific category (published only), up to limit
export async function getArticlesByCategory(category, limit = 10) {
  const index = readIndex();
  return index
    .filter(a => a.status === 'published' && a.category === category)
    .sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''))
    .slice(0, limit)
    .map(a => readArticleFile(a.slug)).filter(Boolean);
}

// Save or update an article (upsert by slug)
export async function saveArticle(article) {
  const existing = readArticleFile(article.slug);
  if (existing) {
    const updated = { ...existing, ...article, updated_at: new Date().toISOString() };
    writeArticleFile(updated);
    updateIndexEntry(updated);
    return updated;
  }
  return insertArticle(article);
}

// Get published articles not refreshed in `days` days, up to `limit`
export async function getPublishedArticlesOlderThan(days, limit = 10, refreshField = 'last_refreshed_30d') {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const index = readIndex();
  return index
    .filter(a => a.status === 'published')
    .filter(a => !a[refreshField] || a[refreshField] < cutoff)
    .sort((a, b) => {
      const at = a[refreshField] || a.created_at || '';
      const bt = b[refreshField] || b.created_at || '';
      return at.localeCompare(bt);
    })
    .slice(0, limit)
    .map(a => readArticleFile(a.slug)).filter(Boolean);
}

// Get all published articles that have asins_used (for ASIN health check)
export async function getPublishedArticlesWithAsins() {
  const index = readIndex();
  return index
    .filter(a => a.status === 'published' && Array.isArray(a.asins_used) && a.asins_used.length > 0)
    .map(a => readArticleFile(a.slug)).filter(Boolean);
}

// ─── Legacy shim (backward compat for old query() callers) ───────────────────
export async function getDb() {
  return { query: async (sql, params) => legacyQuery(sql, params || []) };
}
export async function query(sql, params = []) {
  return legacyQuery(sql, params);
}
function legacyQuery(sql, params = []) {
  const s = sql.replace(/\s+/g, ' ').trim();
  if (/SELECT COUNT\(\*\) FROM articles WHERE status = 'published'/i.test(s)) {
    const count = readIndex().filter(a => a.status === 'published').length;
    return { rows: [{ count: String(count) }] };
  }
  if (/SELECT COUNT\(\*\) FROM articles/i.test(s)) {
    return { rows: [{ count: String(readIndex().length) }] };
  }
  if (/FROM articles WHERE slug = \$1/i.test(s)) {
    const a = readArticleFile(params[0]);
    return { rows: a ? [a] : [] };
  }
  if (/FROM articles WHERE status = 'published' AND slug = \$1/i.test(s)) {
    const a = readArticleFile(params[0]);
    return { rows: (a && a.status === 'published') ? [a] : [] };
  }
  if (/FROM articles WHERE status = 'queued'/i.test(s)) {
    const index = readIndex();
    const queued = index.filter(a => a.status === 'queued');
    queued.sort((a, b) => (a.queued_at || '').localeCompare(b.queued_at || ''));
    if (!queued.length) return { rows: [] };
    const full = readArticleFile(queued[0].slug);
    return { rows: full ? [full] : [] };
  }
  if (/FROM articles WHERE status = 'published'/i.test(s)) {
    const index = readIndex();
    let rows = index.filter(a => a.status === 'published');
    const catMatch = s.match(/AND category = \$(\d+)/i);
    if (catMatch) { const cv = params[parseInt(catMatch[1]) - 1]; if (cv) rows = rows.filter(a => a.category === cv); }
    rows.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));
    const lm = s.match(/LIMIT \$(\d+)/i); const om = s.match(/OFFSET \$(\d+)/i);
    const limit = lm ? parseInt(params[parseInt(lm[1]) - 1]) : 20;
    const offset = om ? parseInt(params[parseInt(om[1]) - 1]) : 0;
    return { rows: rows.slice(offset, offset + limit) };
  }
  if (/FROM articles/i.test(s)) {
    const index = readIndex();
    return { rows: index.map(a => readArticleFile(a.slug)).filter(Boolean) };
  }
  console.warn('[db] Unhandled SQL:', s.substring(0, 80));
  return { rows: [] };
}
