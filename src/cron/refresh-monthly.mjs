import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin, extractAsinsFromText } from '../lib/amazon-verify.mjs';
import { query } from '../lib/db.mjs';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 10;

export async function refreshMonthly() {
  const { rows } = await query(`
    SELECT id, slug, title, body, category, tags, asins_used
    FROM articles
    WHERE last_refreshed_30d IS NULL OR last_refreshed_30d < NOW() - INTERVAL '30 days'
    ORDER BY COALESCE(last_refreshed_30d, created_at) ASC
    LIMIT $1
  `, [BATCH_SIZE]);

  console.log(`[refresh-monthly] Processing ${rows.length} articles`);
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
            content: `Refresh this article with updated examples and a new opening hook. Keep the same topic and Kalesh voice. Zero em-dashes. 1,600-2,000 words. Same Amazon affiliate links (3-4). Return HTML body only.\n\nOriginal title: ${article.title}\n\nOriginal body:\n${article.body.slice(0, 2000)}...`
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
        console.warn(`[refresh-monthly] ${article.slug} attempt ${attempt}:`, gate.failures.join(' | '));
      } catch (err) {
        console.error(`[refresh-monthly] Error:`, err.message);
      }
    }

    if (gate && gate.passed) {
      await query(
        'UPDATE articles SET body = $1, asins_used = $2, word_count = $3, last_refreshed_30d = NOW() WHERE id = $4',
        [refreshedBody, gate.asins, gate.wordCount, article.id]
      );
      refreshed++;
    } else {
      await query('UPDATE articles SET last_refreshed_30d = NOW() WHERE id = $1', [article.id]);
      kept++;
      console.error(`[refresh-monthly] ${article.slug} FAILED gate 3x - keeping original`);
    }
  }

  return { processed: rows.length, refreshed, kept };
}
