/**
 * refresh-quarterly.mjs
 * Jan/Apr/Jul/Oct 1st 04:00 UTC — substantially rewrites articles older than 90 days.
 * Uses DeepSeek V4-Pro via OpenAI client.
 */
import OpenAI from 'openai';
import { cleanAndGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin, extractAsinsFromText } from '../lib/amazon-verify.mjs';
import { getPublishedArticlesOlderThan, updateArticleBody } from '../lib/db.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

const MAX_ATTEMPTS = 4;
const BATCH_SIZE = 15;

export async function refreshQuarterly() {
  const articles = await getPublishedArticlesOlderThan(90, BATCH_SIZE, 'last_refreshed_90d');

  console.log(`[refresh-quarterly] Processing ${articles.length} articles`);
  let refreshed = 0, kept = 0;

  for (const article of articles) {
    let cleanedBody = null;
    let gateResult = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: MODEL,
          temperature: 0.78,
          messages: [
            {
              role: 'system',
              content: 'You are Kalesh. Substantially rewrite this article. New hook, new examples, refreshed product recommendations. Same niche, same voice. Zero em-dashes. 1,200-2,500 words. 3-4 Amazon affiliate links. Return HTML body only.'
            },
            {
              role: 'user',
              content: `Substantially rewrite this article:\n\nTitle: ${article.title}\n\nBody:\n${article.body.slice(0, 3000)}...`
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
        if (finalResult.passed) {
          cleanedBody = finalResult.cleanedBody;
          gateResult = finalResult;
          break;
        }

        console.warn(`[refresh-quarterly] ${article.slug} attempt ${attempt}:`, finalResult.failures.slice(0, 2).join(' | '));
      } catch (err) {
        console.error(`[refresh-quarterly] Error:`, err.message);
      }
    }

    if (gateResult && gateResult.passed) {
      await updateArticleBody(article.slug, cleanedBody, gateResult.wordCount, 'last_refreshed_90d');
      refreshed++;
      console.log(`[refresh-quarterly] Refreshed: ${article.slug}`);
    } else {
      await updateArticleBody(article.slug, article.body, article.word_count, 'last_refreshed_90d');
      kept++;
      console.warn(`[refresh-quarterly] ${article.slug} - keeping original (gate failed all ${MAX_ATTEMPTS} attempts)`);
    }
  }

  return { processed: articles.length, refreshed, kept };
}
