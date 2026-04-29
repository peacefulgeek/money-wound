/**
 * generate-article.mjs
 * Queue-first article publisher.
 *
 * Phase 1 (published < 60):  5x/day, every day
 * Phase 2 (published >= 60): 1x/weekday (Mon-Fri only)
 *
 * Logic:
 *   1. Check queue for articles with status='queued'
 *   2. If queue has articles: publish the oldest one (assign hero image, set status='published')
 *   3. If queue is empty: generate a new article with DeepSeek, pass quality gate, insert as 'published'
 */
import { query } from '../lib/db.mjs';
import { generateArticleBody, generateMetaDescription } from '../lib/deepseek-generate.mjs';
import { cleanAndGate } from '../lib/article-quality-gate.mjs';
import { assignHeroImage } from '../lib/bunny-image.mjs';

// ─── ASIN Pool (money-wound niche) ────────────────────────────────────────────
const ASIN_POOL = [
  '0143115766', // Mind Over Money
  '1523085819', // The Soul of Money
  '0062935291', // I Will Teach You to Be Rich
  '1401952461', // You Are a Badass at Making Money
  '0767920104', // Your Money or Your Life
  '1250077060', // The Art of Money
  '0385342535', // The Psychology of Money
  '1250301939', // I Will Teach You to Be Rich (new edition)
  '0316159212', // The Body Keeps the Score
  '1629144460', // Daring Greatly
  '0767921410', // Radical Acceptance
  '0062409603', // It Didn't Start with You
];

function pickAsins(count = 3) {
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function inferCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('partner') || t.includes('relationship') || t.includes('marriage') || t.includes('divorce') || t.includes('family')) return 'relationships';
  if (t.includes('trauma') || t.includes('neglect') || t.includes('shame') || t.includes('inherited') || t.includes('generational')) return 'financial-trauma';
  if (t.includes('spiritual') || t.includes('tcm') || t.includes('ayurvedic') || t.includes('chakra') || t.includes('meditation')) return 'spiritual';
  if (t.includes('wealth') || t.includes('invest') || t.includes('abundance') || t.includes('rich')) return 'wealth-consciousness';
  if (t.includes('heal') || t.includes('recover') || t.includes('rebuild') || t.includes('practice') || t.includes('minimalism')) return 'healing';
  return 'money-psychology';
}

async function getPublishedCount() {
  const { rows } = await query("SELECT COUNT(*) FROM articles WHERE status = 'published'");
  return parseInt(rows[0].count, 10);
}

async function getOldestQueued() {
  const { rows } = await query(
    "SELECT * FROM articles WHERE status = 'queued' ORDER BY queued_at ASC LIMIT 1"
  );
  return rows[0] || null;
}

async function publishQueuedArticle(article) {
  const imageUrl = await assignHeroImage(article.slug);
  await query(
    `UPDATE articles
     SET status = 'published',
         published = true,
         published_at = NOW(),
         image_url = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [imageUrl, article.id]
  );
  console.log(`[generate-article] Published from queue: ${article.slug}`);
  return article.slug;
}

async function generateAndPublish(topic) {
  const MAX_ATTEMPTS = 4;
  let attempt = 0;
  let lastFailures = [];

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    console.log(`[generate-article] Attempt ${attempt}/${MAX_ATTEMPTS} for: "${topic}"`);

    try {
      const asins = pickAsins(3);
      const rawBody = await generateArticleBody(topic, asins);
      const { pass, failures, cleanedBody, wordCount, affiliateLinks } = cleanAndGate(rawBody);

      if (!pass) {
        console.warn(`[generate-article] Gate FAILED (attempt ${attempt}):`, failures);
        lastFailures = failures;
        continue;
      }

      const slug = slugify(topic);
      const category = inferCategory(topic);
      const metaDescription = await generateMetaDescription(topic, cleanedBody);
      const imageUrl = await assignHeroImage(slug);
      const readingTime = Math.ceil(wordCount / 200);

      // Check for slug collision
      const { rows: existing } = await query('SELECT id FROM articles WHERE slug = $1', [slug]);
      const finalSlug = existing.length > 0 ? `${slug}-${Date.now()}` : slug;

      await query(
        `INSERT INTO articles
           (slug, title, body, meta_description, category, tags, image_url, image_alt,
            reading_time, word_count, asins_used, published, status, published_at, queued_at,
            opener_type, conclusion_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW(),$14,$15)`,
        [
          finalSlug, topic, cleanedBody, metaDescription,
          category, [category, 'healing', 'money-psychology'],
          imageUrl, topic,
          readingTime, wordCount, asins,
          true, 'published',
          'gut-punch statement', 'reflection'
        ]
      );

      console.log(`[generate-article] Published new article: ${finalSlug} (${wordCount} words, ${affiliateLinks} links)`);
      return finalSlug;
    } catch (err) {
      console.error(`[generate-article] Error on attempt ${attempt}:`, err.message);
      lastFailures = [err.message];
    }
  }

  console.error(`[generate-article] All ${MAX_ATTEMPTS} attempts failed. Last failures:`, lastFailures);
  return null;
}

// ─── Topics for fresh generation when queue is empty ─────────────────────────
const FRESH_TOPICS = [
  'Why You Freeze When You Open Your Bank Account',
  'The Difference Between Financial Anxiety and Financial Reality',
  'How to Stop Apologizing for Wanting More Money',
  'What Your Spending Patterns Say About Your Childhood',
  'The Hidden Cost of Financial People-Pleasing',
  'Why Budgets Fail People Who Have Experienced Trauma',
  'How to Build Financial Safety When You Never Felt Safe',
  'The Relationship Between Perfectionism and Financial Paralysis',
  'Why Asking for a Raise Feels Like Asking for Love',
  'The Emotional Labor of Being the Family ATM',
];

export async function generateDailyArticle() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[generate-article] AUTO_GEN_ENABLED is not true, skipping');
    return;
  }

  try {
    const publishedCount = await getPublishedCount();
    console.log(`[generate-article] Published count: ${publishedCount} (Phase ${publishedCount < 60 ? 1 : 2})`);

    // Try queue first
    const queued = await getOldestQueued();
    if (queued) {
      return await publishQueuedArticle(queued);
    }

    // Queue empty - generate fresh
    const topic = FRESH_TOPICS[Math.floor(Math.random() * FRESH_TOPICS.length)];
    return await generateAndPublish(topic);
  } catch (err) {
    console.error('[generate-article] Fatal error:', err);
  }
}
