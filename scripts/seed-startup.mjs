import { query } from '../src/lib/db.mjs';

const CDN = 'https://money-wound.b-cdn.net';

const ARTICLES = [
  { slug: 'what-is-a-money-wound', title: "What Is a Money Wound? (And Why You Can't Budget Your Way Out of It)", img: 'what-is-a-money-wound', cat: 'money-psychology', meta: 'A money wound is the emotional and psychological damage that shapes your financial behavior. Discover the hidden patterns keeping you stuck.' },
  { slug: 'the-7-money-scripts', title: "The 7 Money Scripts That Run Your Financial Life", img: 'the-7-money-scripts', cat: 'money-psychology', meta: 'Money scripts are the unconscious beliefs about money you inherited in childhood. Learn the 7 most common scripts and how to rewrite them.' },
  { slug: 'inherited-poverty-consciousness', title: "Inherited Poverty Consciousness: How Your Parents' Money Story Became Yours", img: 'inherited-poverty-consciousness', cat: 'financial-trauma', meta: 'Your parents passed down more than genes. They passed down their fear, scarcity, and shame about money. Here is how to break the cycle.' },
  { slug: 'financial-shame', title: "Financial Shame: The Emotion Nobody Talks About", img: 'financial-shame', cat: 'financial-trauma', meta: 'Financial shame is the silent epidemic. It keeps people stuck, isolated, and unable to ask for help. Kalesh examines where it comes from.' },
  { slug: 'why-you-self-sabotage', title: "Why You Self-Sabotage Every Time You Start Earning More", img: 'why-you-self-sabotage', cat: 'money-psychology', meta: 'Every time you start earning more, something goes wrong. This is not bad luck. It is a predictable pattern with a psychological root.' },
  { slug: 'the-neuroscience-of-money-anxiety', title: "The Neuroscience of Money Anxiety (What Your Brain Does When You Check Your Balance)", img: 'the-neuroscience-of-money-anxiety', cat: 'money-psychology', meta: 'Your brain treats financial threat the same way it treats physical danger. Understanding the neuroscience changes how you approach money.' },
  { slug: 'underearning-as-a-trauma-response', title: "Underearning as a Trauma Response", img: 'underearning-as-a-trauma-response', cat: 'financial-trauma', meta: 'Chronic underearning is not laziness or lack of ambition. For many people, it is a trauma response. Here is what that actually means.' },
  { slug: 'the-spiritual-bypassing-of-money-doesnt-matter', title: "The Spiritual Bypassing of 'Money Doesn't Matter'", img: 'the-spiritual-bypassing-of-money-doesnt-matter', cat: 'spiritual', meta: 'Saying money does not matter is often a spiritual bypass. A way to avoid the discomfort of wanting, needing, and not having enough.' },
  { slug: 'how-to-have-an-honest-conversation-about-money-with-your-partner', title: "How to Have an Honest Conversation About Money With Your Partner", img: 'how-to-have-an-honest-conversation-about-money-with-your-partner', cat: 'relationships', meta: 'Money is the number one source of relationship conflict. Here is how to have the conversation that most couples spend years avoiding.' },
  { slug: 'financial-infidelity', title: "Financial Infidelity: When Money Becomes the Lie", img: 'financial-infidelity-when-money-becomes-the-lie', cat: 'relationships', meta: 'Financial infidelity is hiding money behavior from a partner. It is more common than people admit, and more damaging than people expect.' },
  { slug: 'the-connection-between-childhood-neglect-and-adult-financial-chaos', title: "The Connection Between Childhood Neglect and Adult Financial Chaos", img: 'the-connection-between-childhood-neglect-and-adult-financial-chaos', cat: 'financial-trauma', meta: 'Childhood neglect does not just affect relationships. It shapes financial behavior in ways that are predictable, painful, and healable.' },
  { slug: 'debt-as-emotional-weight', title: "Debt as Emotional Weight: A Somatic Approach to Getting Free", img: 'debt-as-emotional-weight', cat: 'healing', meta: 'Debt is not just a financial problem. For many people, it is a physical weight they carry in their body. A somatic approach to getting free.' },
  { slug: 'why-rich-people-feel-poor', title: "Why Rich People Feel Poor (The Never-Enough Wound)", img: 'why-rich-people-feel-poor', cat: 'money-psychology', meta: 'The never-enough wound affects people at every income level. Understanding why high earners still feel broke is the first step to healing.' },
  { slug: 'how-to-create-a-financial-practice', title: "How to Create a Financial Practice (Not Just a Budget)", img: 'how-to-create-a-financial-practice', cat: 'healing', meta: 'A budget is a spreadsheet. A financial practice is a relationship. Learn how to build one that actually changes your money behavior.' },
  { slug: 'the-tcm-view-of-wealth', title: "The TCM View of Wealth: Kidney Essence, Earth Element, and Abundance", img: 'the-tcm-view-of-wealth', cat: 'spiritual', meta: 'Traditional Chinese medicine has a framework for understanding wealth, scarcity, and abundance. It starts with the kidneys and fear.' },
  { slug: 'money-and-boundaries', title: "Money and Boundaries: Why You Can't Say No to Financial Requests", img: 'money-and-boundaries', cat: 'relationships', meta: 'If you cannot say no to financial requests, money has become a way to manage relationships. Here is what is really happening.' },
  { slug: 'the-overspending-trap', title: "The Overspending Trap: What You're Actually Buying", img: 'the-overspending-trap', cat: 'money-psychology', meta: 'Overspending is not about willpower. It is about what you are actually buying when you spend. The emotional transaction behind the purchase.' },
  { slug: 'financial-recovery-after-divorce', title: "Financial Recovery After Divorce: Rebuilding From Scratch", img: 'financial-recovery-after-divorce', cat: 'healing', meta: 'Divorce is a financial trauma as much as an emotional one. Here is how to rebuild your financial life from scratch without shame.' },
  { slug: 'how-to-heal-your-relationship-with-money-in-90-days', title: "How to Heal Your Relationship With Money in 90 Days", img: 'how-to-heal-your-relationship-with-money-in-90-days', cat: 'healing', meta: 'A 90-day framework for changing your relationship with money. Not a budget plan. A genuine healing practice with measurable steps.' },
  { slug: 'the-ayurvedic-approach-to-wealth-consciousness', title: "The Ayurvedic Approach to Wealth Consciousness", img: 'the-ayurvedic-approach-to-wealth-consciousness', cat: 'spiritual', meta: 'Ayurveda sees financial behavior through the lens of dosha and dharma. A different framework for understanding your money patterns.' },
  { slug: 'why-women-undercharge', title: "Why Women Undercharge (And What It Really Costs)", img: 'why-women-undercharge', cat: 'money-psychology', meta: 'Women consistently charge less than their work is worth. This is not modesty. It is a complex pattern with roots in trauma and conditioning.' },
  { slug: 'conscious-investing', title: "Conscious Investing: Aligning Your Money With Your Values", img: 'conscious-investing', cat: 'wealth-consciousness', meta: 'Conscious investing means aligning where your money goes with what you actually value. Here is how to start without losing returns.' },
  { slug: 'the-scarcity-loop', title: "The Scarcity Loop: How Fear Creates the Exact Financial Reality You Dread", img: 'the-scarcity-loop', cat: 'money-psychology', meta: 'Scarcity thinking creates the exact financial reality you fear. Here is how the loop works and how to interrupt it before it runs your life.' },
  { slug: 'generational-wealth-vs-generational-trauma', title: "Generational Wealth vs. Generational Trauma: Breaking the Cycle", img: 'generational-wealth-vs-generational-trauma', cat: 'financial-trauma', meta: 'Generational wealth is built on generational patterns. Before you can build wealth, you need to understand what you inherited.' },
  { slug: 'how-to-stop-comparing-your-financial-life', title: "How to Stop Comparing Your Financial Life to Everyone Else's", img: 'how-to-stop-comparing-your-financial-life', cat: 'money-psychology', meta: 'Comparing your financial life to others is a wound, not a motivator. Here is what the comparison is actually about and how to stop.' },
  { slug: 'the-money-conversation-we-never-had', title: "The Money Conversation We Never Had: Death, Inheritance, and Family", img: 'the-money-conversation-we-never-had', cat: 'relationships', meta: 'Death, inheritance, and family money dynamics are conversations most families never have. Until they have to. Here is how to start.' },
  { slug: 'financial-minimalism', title: "Financial Minimalism: When Less Money Stuff Means More Life", img: 'financial-minimalism', cat: 'healing', meta: 'Financial minimalism is not about spending less. It is about wanting less of what does not serve you. A different approach to enough.' },
  { slug: 'how-financial-trauma-shows-up-in-your-body', title: "How Financial Trauma Shows Up in Your Body", img: 'how-financial-trauma-shows-up-in-your-body', cat: 'financial-trauma', meta: 'Financial trauma is not just in your head. It lives in your nervous system, your posture, your breath. Here is how to recognize it.' },
  { slug: 'the-ethics-of-wealth', title: "The Ethics of Wealth: Can You Be Rich and Spiritual?", img: 'the-ethics-of-wealth', cat: 'wealth-consciousness', meta: 'Can you be rich and spiritual? Can you accumulate wealth without losing your soul? Kalesh examines the ethics of having more.' },
  { slug: 'rebuilding-financial-trust', title: "Rebuilding Financial Trust After Betrayal or Loss", img: 'rebuilding-financial-trust', cat: 'healing', meta: 'After financial betrayal, loss, or collapse, trust is the hardest thing to rebuild. Here is what the process actually looks like.' },
];

function makeBody(title) {
  return `<h1>${title}</h1>
<p>Let's be honest with each other. The financial advice you've been given your whole life has been missing something crucial. Not the math. You know the math. What's been missing is the emotional truth underneath the numbers.</p>
<p>This is about what's actually happening when you find yourself in the same financial patterns, year after year, despite your best intentions and your very real intelligence.</p>
<h2>The Pattern You Keep Repeating</h2>
<p>Every financial pattern has an emotional root. That's not a metaphor. It's a clinical reality backed by decades of research in financial psychology, trauma therapy, and neuroscience. The way you relate to money right now is a direct reflection of the emotional environment in which you first learned what money meant.</p>
<p>And here's the uncomfortable part: most of us learned in environments that were, to varying degrees, financially traumatic. Not necessarily dramatically so. Not always poverty or crisis. Sometimes it was just the chronic low-grade anxiety of a household where money was always tight, always tense, always a source of conflict.</p>
<h2>What This Means for You</h2>
<p>It means the work isn't primarily financial. It's emotional. It's about understanding the story you inherited, seeing it clearly, and making a conscious choice about whether you want to keep living it.</p>
<p>That's harder than opening a Roth IRA. It's also more important.</p>
<p>Start by sitting with this question: What did money mean in your household growing up? Not what your parents said about money. What did it feel like? What was the emotional texture of financial life in your family?</p>
<p>The answer to that question is the beginning of your healing.</p>
<h2>The Next Step</h2>
<p>Honestly, you're not broken. You're just carrying weight that isn't yours. Let's sit with the discomfort of that for a moment. Notice what your body does when you think about your financial situation right now. That physical response is data. It's your nervous system telling you where the wound is.</p>
<p>From there, the work is about understanding the story underneath the reaction. Not to analyze it to death, but to see it clearly enough that you can choose differently. I've seen it happen. It can happen for you too.</p>
<div class="money-healing-library">
  <h3>Money Healing Library</h3>
  <ul>
    <li><a href="https://www.amazon.com/dp/0143115766?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">Mind Over Money: Overcoming the Money Disorders That Threaten Our Financial Health</a> <span class="disclosure">(paid link)</span></li>
    <li><a href="https://www.amazon.com/dp/1523085819?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">The Soul of Money: Transforming Your Relationship with Money and Life</a> <span class="disclosure">(paid link)</span></li>
    <li><a href="https://www.amazon.com/dp/0062935291?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">I Will Teach You to Be Rich</a> <span class="disclosure">(paid link)</span></li>
  </ul>
  <p class="affiliate-disclosure">As an Amazon Associate, I earn from qualifying purchases.</p>
</div>
<p>Wealth isn't what you accumulate. It's what you stop fearing. Don't let anyone tell you otherwise.</p>
<p><em>Om Shanti Shanti Shanti</em></p>`;
}

export default async function seedStartup() {
  console.log('[seed-startup] Seeding 30 articles...');
  for (const a of ARTICLES) {
    const body = makeBody(a.title);
    const wc = body.split(/\s+/).length;
    await query(`
      INSERT INTO articles (slug, title, body, meta_description, category, tags, image_url, image_alt, reading_time, word_count, asins_used, published, opener_type, conclusion_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (slug) DO NOTHING
    `, [
      a.slug, a.title, body,
      a.meta,
      a.cat, [a.cat, 'healing', 'trauma'],
      `${CDN}/images/articles/${a.img}.webp`, a.title,
      Math.ceil(wc / 200), wc,
      ['0143115766', '1523085819', '0062935291'],
      true, 'gut-punch statement', 'reflection'
    ]);
    process.stdout.write('.');
  }
  console.log('\n[seed-startup] Done! 30 articles seeded.');
}
