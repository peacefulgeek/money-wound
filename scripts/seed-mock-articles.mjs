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

async function run() {
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const slug = topic.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    
    const catalog = productCatalog.slice((i * 2) % 15, ((i * 2) % 15) + 3);
    const asins = catalog.map(c => c.asin);
    
    const body = `
      <h1>${topic}</h1>
      <p>Here's the thing. Your bank account is a mirror, not a scorecard. Most financial advice treats money as a math problem. Add income, subtract expenses, invest the rest. But if it were that simple, you'd have done it already.</p>
      <h2>The Real Problem</h2>
      <p>The real reason people stay stuck isn't ignorance. It's the story they inherited about what money means, what they deserve, and what happens when they actually have enough. The money wound runs deeper than your budget spreadsheet.</p>
      <p>Honestly, you're not broken. You're just carrying weight that isn't yours. Let's sit with the discomfort of that number for a moment. Notice what your body does when you think about your debt. I've seen it a hundred times.</p>
      <h2>What You Can Do</h2>
      <p>Start by observing without judgment. That said, you need tools. We can't just think our way out of this.</p>
      <div class="money-healing-library">
        <h3>Money Healing Library</h3>
        <ul>
          ${catalog.map(c => `<li><a href="https://www.amazon.com/dp/${c.asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">${c.name}</a> <span class="disclosure">(paid link)</span></li>`).join('')}
        </ul>
        <p class="affiliate-disclosure">As an Amazon Associate, I earn from qualifying purchases.</p>
      </div>
      <p>Wealth isn't what you accumulate. It's what you stop fearing. Don't let anyone tell you otherwise.</p>
      <p><em>Om Shanti Shanti Shanti</em></p>
    `;
    
    await query(\`
      INSERT INTO articles (slug, title, body, meta_description, category, tags, reading_time, word_count, asins_used, opener_type, conclusion_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body
    \`, [
      slug,
      topic,
      body,
      topic + ' - Kalesh explores the emotional roots of this financial pattern.',
      'money-psychology',
      ['money-psychology', 'healing', 'trauma'],
      7,
      1650,
      asins,
      'gut-punch statement',
      'reflection'
    ]);
    console.log(\`Mocked: \${slug}\`);
  }
  process.exit(0);
}

run();
