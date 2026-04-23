import { generateArticle } from '../lib/anthropic-generate.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { query } from '../lib/db.mjs';
import { productCatalog } from '../data/product-catalog.js';

const MAX_ATTEMPTS = 3;

const TOPIC_POOL = [
  'How to Stop Financial Avoidance',
  'The Emotional Cost of Living Paycheck to Paycheck',
  'Why Budgets Fail (And What Actually Works)',
  'Money and Self-Worth: Breaking the Connection',
  'The Hidden Cost of Financial Stress on Your Health',
  'Conscious Spending: Aligning Money with Values',
  'How to Rebuild Credit After Financial Trauma',
  'The Psychology of Impulse Buying',
  'Financial Boundaries with Family',
  'How to Talk to Your Kids About Money Without Shame',
];

const OPENER_TYPES = ['gut-punch statement', 'provocative question', 'micro-story', 'counterintuitive claim'];
const CONCLUSION_TYPES = ['call to action', 'reflection', 'question', 'challenge', 'benediction'];

export async function generateDailyArticle() {
  // Pick a topic not recently used
  const { rows: recent } = await query(
    'SELECT title FROM articles ORDER BY created_at DESC LIMIT 20'
  );
  const recentTitles = recent.map(r => r.title.toLowerCase());
  const available = TOPIC_POOL.filter(t => !recentTitles.some(rt => rt.includes(t.toLowerCase().slice(0, 20))));
  const topic = available[Math.floor(Math.random() * available.length)] || TOPIC_POOL[0];

  const openerType = OPENER_TYPES[Math.floor(Math.random() * OPENER_TYPES.length)];
  const conclusionType = CONCLUSION_TYPES[Math.floor(Math.random() * CONCLUSION_TYPES.length)];

  // Pick relevant products
  const catalog = productCatalog.slice(0, 10);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[generate-article] Attempt ${attempt}: "${topic}"`);
    try {
      const article = await generateArticle({ topic, openerType, conclusionType, catalog });
      const gate = runQualityGate(article.body);

      if (!gate.passed) {
        console.warn(`[generate-article] Gate failed attempt ${attempt}:`, gate.failures.join(' | '));
        continue;
      }

      // Store article
      await query(`
        INSERT INTO articles (slug, title, body, meta_description, category, tags, reading_time, word_count, asins_used, opener_type, conclusion_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO NOTHING
      `, [
        article.slug,
        article.title,
        article.body,
        article.title + ' - Kalesh explores the emotional roots of this financial pattern.',
        'money-psychology',
        ['money-psychology', 'healing'],
        article.readingTime,
        article.wordCount,
        gate.asins,
        openerType,
        conclusionType
      ]);

      console.log(`[generate-article] Stored: ${article.slug} (${article.wordCount} words)`);
      return { success: true, slug: article.slug };
    } catch (err) {
      console.error(`[generate-article] Error attempt ${attempt}:`, err.message);
    }
  }

  console.error(`[generate-article] Failed all ${MAX_ATTEMPTS} attempts for "${topic}"`);
  return { success: false };
}
