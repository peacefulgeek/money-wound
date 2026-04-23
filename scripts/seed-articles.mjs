import { generateArticle } from '../src/lib/anthropic-generate.mjs';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { query } from '../src/lib/db.mjs';
import { productCatalog } from '../src/data/product-catalog.js';

const TOPICS = [
  "What Is a Money Wound? (And Why You Can't Budget Your Way Out of It)",
  "The 7 Money Scripts That Run Your Financial Life",
  "Inherited Poverty Consciousness: How Your Parents' Money Story Became Yours",
  "Financial Shame: The Emotion Nobody Talks About",
  "Why You Self-Sabotage Every Time You Start Earning More",
  "The Neuroscience of Money Anxiety (What Your Brain Does When You Check Your Balance)",
  "Underearning as a Trauma Response",
  "The Spiritual Bypassing of 'Money Doesn't Matter'",
  "How to Have an Honest Conversation About Money With Your Partner",
  "Financial Infidelity: When Money Becomes the Lie",
  "The Connection Between Childhood Neglect and Adult Financial Chaos",
  "Debt as Emotional Weight: A Somatic Approach to Getting Free",
  "Why Rich People Feel Poor (The Never-Enough Wound)",
  "How to Create a Financial Practice (Not Just a Budget)",
  "The TCM View of Wealth: Kidney Essence, Earth Element, and Abundance",
  "Money and Boundaries: Why You Can't Say No to Financial Requests",
  "The Overspending Trap: What You're Actually Buying",
  "Financial Recovery After Divorce: Rebuilding From Scratch",
  "How to Heal Your Relationship With Money in 90 Days",
  "The Ayurvedic Approach to Wealth Consciousness",
  "Why Women Undercharge (And What It Really Costs)",
  "Conscious Investing: Aligning Your Money With Your Values",
  "The Scarcity Loop: How Fear Creates the Exact Financial Reality You Dread",
  "Generational Wealth vs. Generational Trauma: Breaking the Cycle",
  "How to Stop Comparing Your Financial Life to Everyone Else's",
  "The Money Conversation We Never Had: Death, Inheritance, and Family",
  "Financial Minimalism: When Less Money Stuff Means More Life",
  "How Financial Trauma Shows Up in Your Body",
  "The Ethics of Wealth: Can You Be Rich and Spiritual?",
  "Rebuilding Financial Trust After Betrayal or Loss"
];

const OPENER_TYPES = ['gut-punch statement', 'provocative question', 'micro-story', 'counterintuitive claim'];
const CONCLUSION_TYPES = ['call to action', 'reflection', 'question', 'challenge', 'benediction'];

const MAX_ATTEMPTS = 3;

async function run() {
  console.log(`[seed] Generating ${TOPICS.length} articles...`);

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    console.log(`\n[seed] ${i+1}/${TOPICS.length}: ${topic}`);

    const openerType = OPENER_TYPES[i % OPENER_TYPES.length];
    const conclusionType = CONCLUSION_TYPES[i % CONCLUSION_TYPES.length];
    
    // Pick relevant products for this topic
    const catalog = productCatalog.slice((i * 2) % 15, ((i * 2) % 15) + 6);

    let ok = false;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !ok; attempt++) {
      try {
        const article = await generateArticle({ topic, openerType, conclusionType, catalog, attempt });
        const gate = runQualityGate(article.body);
        
        if (gate.passed) {
          await query(`
            INSERT INTO articles (slug, title, body, meta_description, category, tags, reading_time, word_count, asins_used, opener_type, conclusion_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (slug) DO UPDATE SET
              body = EXCLUDED.body,
              word_count = EXCLUDED.word_count,
              asins_used = EXCLUDED.asins_used
          `, [
            article.slug,
            article.title,
            article.body,
            article.title + ' - Kalesh explores the emotional roots of this financial pattern.',
            'money-psychology',
            ['money-psychology', 'healing', 'trauma'],
            article.readingTime,
            article.wordCount,
            gate.asins,
            openerType,
            conclusionType
          ]);
          console.log(`  -> SUCCESS! (${article.wordCount} words)`);
          ok = true;
        } else {
          console.warn(`  -> Attempt ${attempt} failed gate: ${gate.failures.join(', ')}`);
        }
      } catch (err) {
        console.error(`  -> Attempt ${attempt} threw error: ${err.message}`);
      }
    }
    
    if (!ok) {
      console.error(`  !!! FAILED all ${MAX_ATTEMPTS} attempts - skipping this article.`);
    }
  }
  
  console.log('\n[seed] Done generating articles.');
  process.exit(0);
}

run().catch(err => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
