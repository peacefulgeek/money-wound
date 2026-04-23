import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin, extractAsinsFromText } from '../lib/amazon-verify.mjs';
import { query } from '../lib/db.mjs';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 15;

export async function refreshQuarterly() {
  const { rows } = await query(`
    SELECT id, slug, title, body, category, tags, asins_used
    FROM articles
    WHERE last_refreshed_90d IS NULL OR last_refreshed_90d < NOW() - INTERVAL '90 days'
    ORDER BY COALESCE(last_refreshed_90d, created_at) ASC
    LIMIT $1
  `, [BATCH_SIZE]);

  console.log(`[refresh-quarterly] Processing ${rows.length} articles`);
  let refreshed = 0, kept = 0;

  for (const article of rows) {
    let refreshedBody = null;
    let gate = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const message = await client.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `Substantially rewrite this article. New hook, new examples, refreshed product recommendations. Same niche, same Kalesh voice. Zero em-dashes. 1,600-2,000 words. 3-4 Amazon affiliate links. Return HTML body only.\n\nOriginal title: ${article.title}\n\nOriginal body:\n${article.body.slice(0, 2000)}...`
          }]
        });

        refreshedBody = message.content[0].type === 'text' ? message.content[0].text : '';
        const asins = extractAsinsFromText(refreshedBody);
        for (const asin of asins) {
          const result = await verifyAsin(asin);
          if (!result.valid) {
            refreshedBody = refreshedBody.replace(new RegExp(`<a[^>]*href="[^"]*${asin}[^"]*"[^>]*>.*?</a>\\s*\\(paid link\\)`, 'gi'), '');
          }
        }

        gate = runQualityGate(refreshedBody);
        if (gate.passed) break;
        console.warn(`[refresh-quarterly] ${article.slug} attempt ${attempt}:`, gate.failures.join(' | '));
      } catch (err) {
        console.error(`[refresh-quarterly] Error:`, err.message);
      }
    }

    if (gate && gate.passed) {
      await query(
        'UPDATE articles SET body = $1, asins_used = $2, word_count = $3, last_refreshed_90d = NOW() WHERE id = $4',
        [refreshedBody, gate.asins, gate.wordCount, article.id]
      );
      refreshed++;
    } else {
      await query('UPDATE articles SET last_refreshed_90d = NOW() WHERE id = $1', [article.id]);
      kept++;
      console.error(`[refresh-quarterly] ${article.slug} FAILED gate 3x - keeping original`);
    }
  }

  return { processed: rows.length, refreshed, kept };
}
