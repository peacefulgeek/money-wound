import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { query } from '../lib/db.mjs';
import Anthropic from '@anthropic-ai/sdk';
import { productCatalog } from '../data/product-catalog.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_ATTEMPTS = 3;

export async function runProductSpotlight() {
  // Pick a product not recently spotlighted
  const { rows: recent } = await query(
    "SELECT slug FROM articles WHERE category = 'product-spotlight' ORDER BY created_at DESC LIMIT 10"
  );
  const recentSlugs = recent.map(r => r.slug);
  const available = productCatalog.filter(p => !recentSlugs.some(s => s.includes(p.asin)));
  if (available.length === 0) {
    console.log('[product-spotlight] No new products to spotlight');
    return;
  }

  const product = available[Math.floor(Math.random() * available.length)];
  const topic = `An honest look at "${product.name}" for money healing and financial wellness`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Write a product spotlight article for The Money Wound about: ${product.name}

This is NOT a sales pitch. Write it as Kalesh would - honest, thoughtful, connecting the product to emotional/psychological money healing.

Include:
- Why this product matters in the context of financial stress or money healing
- Who it's actually for (be specific)
- Honest assessment - what it does well, what it doesn't
- 3-4 Amazon affiliate links including this product: https://www.amazon.com/dp/${product.asin}?tag=spankyspinola-20 (paid link)
- 1,600-2,000 words
- Zero em-dashes
- Kalesh voice with contractions, direct address, varied sentence length
- End with Sanskrit mantra in italics

Format as HTML body only starting with <h1>.`
        }]
      });

      const body = message.content[0].type === 'text' ? message.content[0].text : '';
      const gate = runQualityGate(body);

      if (!gate.passed) {
        console.warn(`[product-spotlight] Gate failed attempt ${attempt}:`, gate.failures.join(' | '));
        continue;
      }

      const slug = `product-spotlight-${product.asin.toLowerCase()}-${Date.now()}`;
      const titleMatch = body.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const title = titleMatch ? titleMatch[1] : `Money Healing Tool: ${product.name}`;

      await query(`
        INSERT INTO articles (slug, title, body, category, tags, reading_time, word_count, asins_used)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO NOTHING
      `, [slug, title, body, 'product-spotlight', ['product-spotlight', product.category], Math.ceil(gate.wordCount / 200), gate.wordCount, gate.asins]);

      console.log(`[product-spotlight] Stored: ${slug}`);
      return { success: true, slug };
    } catch (err) {
      console.error(`[product-spotlight] Error attempt ${attempt}:`, err.message);
    }
  }
  return { success: false };
}
