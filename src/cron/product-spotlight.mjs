/**
 * product-spotlight.mjs
 * Saturdays 08:00 UTC — generates a product review article.
 * Uses DeepSeek V4-Pro. Inserts directly as status='published'.
 */
import OpenAI from 'openai';
import { cleanAndGate } from '../lib/article-quality-gate.mjs';
import { assignHeroImage } from '../lib/bunny-image.mjs';
import { query } from '../lib/db.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

const MAX_ATTEMPTS = 4;

// ASIN pool for product spotlights
const SPOTLIGHT_ASINS = [
  { asin: '0143115766', name: 'Mind Over Money', category: 'books' },
  { asin: '1523085819', name: 'The Soul of Money', category: 'books' },
  { asin: '0062935291', name: 'I Will Teach You to Be Rich', category: 'books' },
  { asin: '1401952461', name: 'You Are a Badass at Making Money', category: 'books' },
  { asin: '0767920104', name: 'Your Money or Your Life', category: 'books' },
  { asin: '1250077060', name: 'The Art of Money', category: 'books' },
  { asin: '0385342535', name: 'The Psychology of Money', category: 'books' },
  { asin: '0316159212', name: 'The Body Keeps the Score', category: 'healing' },
  { asin: '1629144460', name: 'Daring Greatly', category: 'healing' },
  { asin: '0767921410', name: 'Radical Acceptance', category: 'healing' },
  { asin: '0062409603', name: "It Didn't Start with You", category: 'healing' },
];

function pickAsins(primary, count = 3) {
  const others = SPOTLIGHT_ASINS.filter(a => a.asin !== primary.asin)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1);
  return [primary, ...others];
}

export async function runProductSpotlight() {
  // Pick a product not recently spotlighted
  const { rows: recent } = await query(
    "SELECT slug FROM articles WHERE category = 'product-spotlight' ORDER BY created_at DESC LIMIT 10"
  );
  const recentSlugs = recent.map(r => r.slug);
  const available = SPOTLIGHT_ASINS.filter(p => !recentSlugs.some(s => s.includes(p.asin)));

  if (available.length === 0) {
    console.log('[product-spotlight] No new products to spotlight - cycling from full pool');
  }

  const product = (available.length > 0 ? available : SPOTLIGHT_ASINS)[Math.floor(Math.random() * (available.length || SPOTLIGHT_ASINS.length))];
  const asins = pickAsins(product, 3);
  const asinLinks = asins.map(a =>
    `<a href="https://www.amazon.com/dp/${a.asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">${a.name} (paid link)</a>`
  ).join('\n');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.72,
        messages: [
          {
            role: 'system',
            content: `You are Kalesh - a consciousness teacher who writes about healing your relationship with money. Direct, honest, compassionate. No corporate speak. No em-dashes. Contractions everywhere. 2-3 dialogue markers like "Right?!", "Know what I mean?", "Does that land?". 1,200-2,500 words. HTML only.`
          },
          {
            role: 'user',
            content: `Write a product spotlight article about "${product.name}" for The Money Wound.

This is NOT a sales pitch. Write it as Kalesh - honest, connecting the product to emotional/psychological money healing.

Include:
- Why this product matters for financial healing
- Who it's actually for (be specific)
- Honest assessment - what it does well, what it doesn't
- Exactly 3 Amazon affiliate links from these (naturally placed in the body):
${asinLinks}
- 1,200-2,500 words
- Zero em-dashes (use " - " instead)
- End with: <p><em>Om Shanti Shanti Shanti</em></p>

Format as HTML body only starting with <h1>.`
          }
        ]
      });

      const rawBody = response.choices[0].message.content ?? '';
      const { pass, failures, cleanedBody, wordCount } = cleanAndGate(rawBody);

      if (!pass) {
        console.warn(`[product-spotlight] Gate failed attempt ${attempt}:`, failures.slice(0, 3).join(' | '));
        continue;
      }

      const slug = `product-spotlight-${product.asin.toLowerCase()}-${Date.now()}`;
      const titleMatch = cleanedBody.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const title = titleMatch ? titleMatch[1] : `Money Healing Tool: ${product.name}`;
      const imageUrl = await assignHeroImage(slug);

      await query(
        `INSERT INTO articles
           (slug, title, body, meta_description, category, tags, image_url, image_alt,
            reading_time, word_count, asins_used, published, status, published_at, queued_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [
          slug, title, cleanedBody,
          `Kalesh reviews ${product.name} - an honest look at how this tool supports financial healing.`,
          'product-spotlight',
          ['product-spotlight', product.category, 'books'],
          imageUrl, title,
          Math.ceil(wordCount / 200), wordCount,
          asins.map(a => a.asin),
          true, 'published'
        ]
      );

      console.log(`[product-spotlight] Published: ${slug} (${wordCount} words)`);
      return { success: true, slug };
    } catch (err) {
      console.error(`[product-spotlight] Error attempt ${attempt}:`, err.message);
    }
  }

  console.error(`[product-spotlight] All ${MAX_ATTEMPTS} attempts failed`);
  return { success: false };
}
