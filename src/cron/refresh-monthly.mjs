/**
 * refresh-monthly.mjs
 * 1st of month 03:00 UTC — refreshes articles older than 30 days.
 * Uses DeepSeek V4-Pro via OpenAI client.
 */
import OpenAI from 'openai';
import { cleanAndGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin, extractAsinsFromText } from '../lib/amazon-verify.mjs';
import { query } from '../lib/db.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

const MAX_ATTEMPTS = 4;
const BATCH_SIZE = 10;

export async function refreshMonthly() {
  const { rows } = await query(`
    SELECT id, slug, title, body, category, tags, asins_used
    FROM articles
    WHERE status = 'published'
      AND (last_refreshed_30d IS NULL OR last_refreshed_30d < NOW() - INTERVAL '30 days')
    ORDER BY COALESCE(last_refreshed_30d, created_at) ASC
    LIMIT $1
  `, [BATCH_SIZE]);

  console.log(`[refresh-monthly] Processing ${rows.length} articles`);
  let refreshed = 0, kept = 0;

  for (const article of rows) {
    let cleanedBody = null;
    let gateResult = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: MODEL,
          temperature: 0.72,
          messages: [
            {
              role: 'system',
              content: 'You are Kalesh. Refresh this article with updated examples and a new opening hook. Keep the same topic and voice. Zero em-dashes. 1,200-2,500 words. Same Amazon affiliate links (3-4). Return HTML body only.'
            },
            {
              role: 'user',
              content: `Refresh this article:\n\nTitle: ${article.title}\n\nBody:\n${article.body.slice(0, 3000)}...`
            }
          ]
        });

        const rawBody = response.choices[0].message.content ?? '';
        const result = cleanAndGate(rawBody);

        // Verify ASINs still work
        const asins = extractAsinsFromText(result.cleanedBody);
        let bodyWithValidAsins = result.cleanedBody;
        for (const asin of asins) {
          const check = await verifyAsin(asin);
          if (!check.valid) {
            bodyWithValidAsins = bodyWithValidAsins.replace(
              new RegExp(`<a[^>]*href="[^"]*${asin}[^"]*"[^>]*>.*?</a>\\s*\\(paid link\\)`, 'gi'),
              ''
            );
          }
        }

        // Re-gate after ASIN removal
        const finalResult = cleanAndGate(bodyWithValidAsins);
        if (finalResult.pass) {
          cleanedBody = finalResult.cleanedBody;
          gateResult = finalResult;
          break;
        }

        console.warn(`[refresh-monthly] ${article.slug} attempt ${attempt}:`, finalResult.failures.slice(0, 2).join(' | '));
      } catch (err) {
        console.error(`[refresh-monthly] Error:`, err.message);
      }
    }

    if (gateResult && gateResult.pass) {
      await query(
        `UPDATE articles
         SET body = $1, asins_used = $2, word_count = $3, last_refreshed_30d = NOW(), updated_at = NOW()
         WHERE id = $4`,
        [cleanedBody, gateResult.asins, gateResult.wordCount, article.id]
      );
      refreshed++;
      console.log(`[refresh-monthly] Refreshed: ${article.slug}`);
    } else {
      await query('UPDATE articles SET last_refreshed_30d = NOW() WHERE id = $1', [article.id]);
      kept++;
      console.warn(`[refresh-monthly] ${article.slug} - keeping original (gate failed all ${MAX_ATTEMPTS} attempts)`);
    }
  }

  return { processed: rows.length, refreshed, kept };
}
