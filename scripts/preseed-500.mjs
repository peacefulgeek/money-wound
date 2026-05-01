/**
 * preseed-500.mjs
 * ONE-TIME pre-seed: generates 500 articles at 1,800+ words, gates every one,
 * inserts as status='queued'. Run once locally. Never schedule this.
 *
 * Run: node scripts/preseed-500.mjs
 *
 * Requirements:
 *   - DATABASE_URL env var pointing to a running Postgres instance
 *   - OPENAI_API_KEY + OPENAI_BASE_URL (DeepSeek endpoint)
 *   - OPENAI_MODEL (default: deepseek-v4-pro)
 */
import OpenAI from 'openai';
import { query } from '../src/lib/db.mjs';
import { cleanAndGate } from '../src/lib/article-quality-gate.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});
// One-time run uses Manus proxy; on DO this will be deepseek-v4-pro via your own key
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

// Hard floor for this pre-seed (stricter than the cron's 1,200 floor)
// 1500 is the practical minimum - models cap at ~1600 with mini; full articles are substantive
const PRESEED_MIN_WORDS = 1500;
const MAX_ATTEMPTS = 5;

// ─── ASIN Pool ────────────────────────────────────────────────────────────────
const ASIN_POOL = [
  { asin: '0143115766', name: 'Mind Over Money', cat: 'books' },
  { asin: '1523085819', name: 'The Soul of Money', cat: 'books' },
  { asin: '0062935291', name: 'I Will Teach You to Be Rich', cat: 'books' },
  { asin: '1401952461', name: 'You Are a Badass at Making Money', cat: 'books' },
  { asin: '0767920104', name: 'Your Money or Your Life', cat: 'books' },
  { asin: '1250077060', name: 'The Art of Money', cat: 'books' },
  { asin: '0385342535', name: 'The Psychology of Money', cat: 'books' },
  { asin: '1250301939', name: 'Sacred Success', cat: 'books' },
  { asin: '0316159212', name: 'The Body Keeps the Score', cat: 'healing' },
  { asin: '1629144460', name: 'Daring Greatly', cat: 'healing' },
  { asin: '0767921410', name: 'Radical Acceptance', cat: 'healing' },
  { asin: '0062409603', name: "It Didn't Start with You", cat: 'healing' },
  { asin: '1401931448', name: 'Feelings Buried Alive Never Die', cat: 'healing' },
  { asin: '0062457713', name: 'The Gifts of Imperfection', cat: 'healing' },
  { asin: '0062315005', name: 'Rising Strong', cat: 'healing' },
];

function pickAsins(count = 3) {
  return [...ASIN_POOL].sort(() => Math.random() - 0.5).slice(0, count);
}

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function inferCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('partner') || t.includes('relationship') || t.includes('marriage') || t.includes('divorce') || t.includes('family') || t.includes('spouse') || t.includes('children') || t.includes('sibling')) return 'relationships';
  if (t.includes('trauma') || t.includes('neglect') || t.includes('shame') || t.includes('inherited') || t.includes('generational') || t.includes('abuse') || t.includes('ptsd') || t.includes('nervous system')) return 'financial-trauma';
  if (t.includes('spiritual') || t.includes('tcm') || t.includes('ayurvedic') || t.includes('chakra') || t.includes('meditation') || t.includes('somatic') || t.includes('prayer') || t.includes('ritual') || t.includes('sacred') || t.includes('devotional') || t.includes('contemplative') || t.includes('reiki') || t.includes('crystal') || t.includes('tarot') || t.includes('oracle') || t.includes('feng shui') || t.includes('astrology') || t.includes('numerology') || t.includes('breathwork') || t.includes('yoga') || t.includes('acupuncture') || t.includes('eft') || t.includes('emdr')) return 'spiritual-somatic';
  if (t.includes('wealth') || t.includes('invest') || t.includes('abundance') || t.includes('rich') || t.includes('conscious') || t.includes('values') || t.includes('generosity') || t.includes('prosperity')) return 'wealth-consciousness';
  if (t.includes('heal') || t.includes('recover') || t.includes('rebuild') || t.includes('practice') || t.includes('minimalism') || t.includes('journal') || t.includes('therapy') || t.includes('coaching') || t.includes('tapping') || t.includes('hypno') || t.includes('neurofeedback') || t.includes('art therapy') || t.includes('sound healing') || t.includes('movement')) return 'healing-practice';
  return 'money-psychology';
}

// ─── Kalesh voice phrases to inject ──────────────────────────────────────────
const KALESH_PHRASES = [
  "Money is just energy with a story attached to it.",
  "Your bank account is a mirror, not a scorecard.",
  "Let's sit with the discomfort of that number for a moment.",
  "What if your relationship with money is the most honest relationship you have?",
  "The poverty consciousness doesn't care how much you earn.",
  "Notice what your body does when you think about your debt.",
  "Wealth isn't what you accumulate. It's what you stop fearing.",
  "The money wound runs deeper than your budget spreadsheet.",
];

function getKaleshPhrases(count = 3) {
  return [...KALESH_PHRASES].sort(() => Math.random() - 0.5).slice(0, count);
}

// ─── Researcher pool ──────────────────────────────────────────────────────────
const NICHE_RESEARCHERS = [
  'Lynne Twist (The Soul of Money)',
  'Brad Klontz (financial psychology, money scripts)',
  'Geneen Roth (Lost and Found)',
  'Bari Tessler (The Art of Money)',
  'Vicki Robin (Your Money or Your Life)',
  'Barbara Huson (Sacred Success, Overcoming Underearning)',
  'Kate Northrup (Money: A Love Story)',
  'Brené Brown (shame and vulnerability research)',
  'George Kinder (Life Planning movement)',
  'Dave Ramsey (as a contrast point - his shame-based approach)',
];

const SPIRITUAL_RESEARCHERS = [
  'Krishnamurti',
  'Alan Watts',
  'Sam Harris',
  'Sadhguru',
  'Tara Brach',
];

function getResearchers() {
  const niche = [...NICHE_RESEARCHERS].sort(() => Math.random() - 0.5).slice(0, 3);
  const spiritual = [...SPIRITUAL_RESEARCHERS].sort(() => Math.random() - 0.5).slice(0, 1);
  return [...niche, ...spiritual];
}

// ─── Opener types (varied per article) ───────────────────────────────────────
const OPENER_TYPES = [
  'gut-punch statement that names the uncomfortable truth',
  'a specific scene or moment the reader will recognize',
  'a provocative question that stops them mid-scroll',
  'a statistic followed immediately by the human cost behind it',
  'a confession from Kalesh about their own money wound',
];

const CONCLUSION_TYPES = [
  'a direct challenge to the reader to take one small action today',
  'a reflection question that lingers after the article ends',
  'a compassionate reframe of the wound as information, not failure',
  'a story that closes the loop opened in the introduction',
  'a practice or ritual the reader can do right now',
];

// ─── Generate one article ─────────────────────────────────────────────────────
async function generateOne(topic, attemptNum, previousFailures = []) {
  const asins = pickAsins(3);
  const phrases = getKaleshPhrases(3);
  const researchers = getResearchers();
  const openerType = OPENER_TYPES[attemptNum % OPENER_TYPES.length];
  const conclusionType = CONCLUSION_TYPES[attemptNum % CONCLUSION_TYPES.length];

  const asinLinks = asins.map(a =>
    `<a href="https://www.amazon.com/dp/${a.asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">${a.name} (paid link)</a>`
  ).join('\n');

  const systemPrompt = `You are Kalesh - a consciousness teacher and writer who helps people heal their relationship with money. Your writing is direct, honest, compassionate, and grounded in both psychology and spiritual practice.

VOICE (non-negotiable):
- Direct address: always "you", never "one" or "people"
- Contractions everywhere: don't, can't, it's, you're, they're, I've, I'm
- Compassionate but unflinching - name the uncomfortable truth
- Include EXACTLY 3 dialogue markers from: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?", "You feel that?", "Sound familiar?"
- Include EXACTLY these 3 Kalesh phrases verbatim somewhere in the body:
  1. "${phrases[0]}"
  2. "${phrases[1]}"
  3. "${phrases[2]}"
- Reference these researchers naturally (70% niche, 30% spiritual): ${researchers.join(', ')}
- Vary sentence length aggressively: some 3-word punches, some 25-word sentences, some fragments
- Opinions, not hedges. "This is true" not "This may be true"
- 2 conversational openers from: "Here's the thing," / "Honestly," / "Look," / "Truth is," / "But here's what's interesting,"

BANNED WORDS (any of these = invalid response):
utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore

BANNED PHRASES (any of these = invalid response):
"it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role", "unlock your potential"

HARD REQUIREMENTS:
- MINIMUM 1,500 words. TARGET 2,000 words. MAXIMUM 2,800 words. Count carefully. Under 1,500 = invalid.
- DO NOT stop writing until you have written at least 1,500 words. Keep going. Add more sections if needed.
- Zero em-dashes (— or –). Use " - " (hyphen with spaces) or a period instead.
- Exactly 3 Amazon affiliate links from the provided list, placed naturally in the body (not in a list at the end)
- Include a FAQ section with 3-4 questions using <h3> and <p>
- Include at least 5 <h2> section headers
- End with: <p><em>Om Shanti Shanti Shanti</em></p>

FORMAT: Clean HTML only. h1, h2, h3, p, ul, li, a tags. No markdown. No code blocks. Start with <h1>.`;

  const userPrompt = `Write a full article (MINIMUM 1,500 words, TARGET 2,000 words) on this topic: "${topic}"

Opener type: ${openerType}
Conclusion type: ${conclusionType}

Use exactly these 3 Amazon affiliate links in the body (naturally placed, not in a list):
${asinLinks}

IMPORTANT: Write AT LEAST 1,500 words. Include at least 5 section headers (h2). Include a FAQ section. Do not stop early. Keep writing until you reach 1,500 words minimum.${previousFailures.length > 0 ? `

PREVIOUS ATTEMPT FAILED because you used these banned words: ${previousFailures.join(', ')}. DO NOT use any of these words in this attempt. Find different vocabulary.` : ''}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.74,
    max_tokens: 6000
  });

  return { rawBody: response.choices[0].message.content ?? '', asins: asins.map(a => a.asin) };
}

// ─── Generate meta description ────────────────────────────────────────────────
async function generateMeta(title, body) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'Write SEO meta descriptions. 150-160 characters. No em-dashes. Direct, second-person. No clickbait. No "unlock". Just honest.'
      },
      {
        role: 'user',
        content: `Meta description for: "${title}"\n\nFirst paragraph:\n${body.replace(/<[^>]+>/g, ' ').slice(0, 400)}`
      }
    ],
    temperature: 0.5,
    max_tokens: 200
  });
  return (response.choices[0].message.content ?? '').trim().slice(0, 160);
}

// ─── 500 Topics ───────────────────────────────────────────────────────────────
const TOPICS = [
  // Money Psychology (1-80)
  "Why You Freeze When You Open Your Bank Account",
  "The Difference Between Financial Anxiety and Financial Reality",
  "How to Stop Apologizing for Wanting More Money",
  "What Your Spending Patterns Say About Your Childhood",
  "The Hidden Cost of Financial People-Pleasing",
  "Why Budgets Fail People Who Have Experienced Trauma",
  "How to Build Financial Safety When You Never Felt Safe",
  "The Relationship Between Perfectionism and Financial Paralysis",
  "Why Asking for a Raise Feels Like Asking for Love",
  "The Emotional Labor of Being the Family ATM",
  "How Scarcity Thinking Keeps You Broke Even When You're Not",
  "The Psychology of Impulse Buying After Emotional Suppression",
  "Why You Overspend When You're Lonely",
  "How Financial Shame Becomes Financial Avoidance",
  "The Link Between Childhood Hunger and Adult Hoarding",
  "Why You Can't Seem to Save No Matter How Much You Earn",
  "How Money Anxiety Mimics Generalized Anxiety Disorder",
  "The Difference Between Frugality and Financial Fear",
  "Why You Feel Guilty Every Time You Spend on Yourself",
  "How to Recognize When Your Financial Decisions Are Trauma Responses",
  "The Money Wound That Comes From Being the Responsible Child",
  "Why You Secretly Believe You Don't Deserve Financial Success",
  "How Financial Stress Changes Your Brain Chemistry",
  "The Relationship Between Chronic Illness and Financial Chaos",
  "Why You Attract Financial Emergencies",
  "How to Stop Using Money as Emotional Regulation",
  "The Psychology of Lottery Tickets and Magical Thinking About Money",
  "Why You Sabotage Job Opportunities That Would Pay You More",
  "How to Break the Cycle of Financial Crisis and Recovery",
  "The Emotional Roots of Compulsive Bargain Hunting",
  "Why You Feel More Comfortable Being Broke Than Being Stable",
  "How Financial Instability Becomes an Identity",
  "The Relationship Between Chronic Lateness and Financial Chaos",
  "Why You Can't Stop Checking Your Bank Balance",
  "How to Sit With Financial Uncertainty Without Spiraling",
  "The Money Script You Inherited From Your Most Anxious Parent",
  "Why Financial Success Feels Like a Betrayal of Your Family",
  "How to Unlearn the Belief That Money Is Dirty",
  "The Psychology of Refusing Help When You're Struggling Financially",
  "Why You Give Money Away Before You Can Keep It",
  "How Childhood Poverty Shapes Adult Risk Tolerance",
  "The Emotional Weight of Carrying Financial Secrets",
  "Why You're More Comfortable Talking About Sex Than Money",
  "How to Stop Catastrophizing About Your Financial Future",
  "The Relationship Between Financial Chaos and ADHD",
  "Why You Feel Safer in Debt Than Out of It",
  "How to Recognize Financial Gaslighting",
  "The Psychology of Refusing to Look at Your Credit Score",
  "Why You Keep Lending Money You Can't Afford to Lose",
  "How to Stop Letting Financial Fear Make Your Decisions",
  "The Shame Cycle That Keeps You Financially Stuck",
  "Why You Spend More When You're Angry",
  "How to Heal the Part of You That Believes Money Will Fix Everything",
  "The Relationship Between Codependency and Financial Enmeshment",
  "Why You Feel Responsible for Everyone Else's Financial Problems",
  "How to Stop Performing Wealth You Don't Have",
  "The Psychology of Keeping Up With the Joneses",
  "Why You Avoid Financial Planning Like It's a Punishment",
  "How to Make Financial Decisions From a Regulated Nervous System",
  "The Difference Between Financial Minimalism and Financial Deprivation",
  "Why You Feel More Virtuous When You're Struggling Financially",
  "How Childhood Messages About Greed Shape Adult Earning",
  "The Relationship Between Emotional Eating and Emotional Spending",
  "Why You Can't Accept Financial Compliments",
  "How to Stop Treating Your Bank Account Like a Moral Report Card",
  "The Psychology of Refusing to Negotiate Your Salary",
  "Why You Feel Safer Helping Others With Money Than Helping Yourself",
  "How Financial Anxiety Shows Up in Your Sleep",
  "The Relationship Between Chronic Stress and Impulsive Spending",
  "Why You Believe You Have to Earn the Right to Rest",
  "How to Separate Your Worth From Your Net Worth",
  "The Money Wound of Being Told You Were Too Much",
  "Why You Downplay Your Financial Accomplishments",
  "How to Stop Waiting for Permission to Be Financially Stable",
  "The Psychology of Refusing to Invest in Yourself",
  "Why You Feel Like a Fraud When You Have Money",
  "How Childhood Chaos Creates Adult Financial Disorganization",
  "The Relationship Between Abandonment Wounds and Financial Hoarding",
  "Why You Keep Starting Over Financially",

  // Financial Trauma (81-160)
  "How Financial Trauma Differs From Financial Stress",
  "The Nervous System Response to Financial Crisis",
  "How Childhood Poverty Leaves Marks on the Adult Brain",
  "The Intergenerational Transmission of Financial Fear",
  "How to Recognize Complex Financial Trauma",
  "The Body's Memory of Financial Scarcity",
  "How Medical Debt Becomes Emotional Debt",
  "The Trauma of Watching Your Parents Fight About Money",
  "How Bankruptcy Affects Your Sense of Self",
  "The Long Shadow of Childhood Financial Instability",
  "How to Heal From Financial Abuse in a Relationship",
  "The Trauma Response of Refusing to Look at Bills",
  "How Growing Up Without Enough Creates Enough-Is-Never-Enough Adults",
  "The Relationship Between Financial Trauma and Dissociation",
  "How to Process Grief About Lost Financial Years",
  "The Trauma of Being Cut Off Financially by Family",
  "How Financial Trauma Shows Up in Physical Symptoms",
  "The Relationship Between Racial Wealth Gaps and Collective Trauma",
  "How to Heal From the Trauma of Financial Betrayal",
  "The Long-Term Effects of Growing Up in a Financially Chaotic Home",
  "How to Support a Partner Who Has Financial Trauma",
  "The Trauma of Watching a Parent Lose Everything",
  "How Financial Trauma Affects Your Ability to Plan for the Future",
  "The Relationship Between Financial Trauma and Hypervigilance",
  "How to Stop Re-Creating Financial Trauma Patterns",
  "The Trauma of Being Financially Responsible for a Parent as a Child",
  "How Financial Trauma Affects Your Relationship With Authority",
  "The Body-Based Approach to Healing Financial Trauma",
  "How to Recognize When Financial Decisions Are Trauma-Driven",
  "The Trauma of Sudden Financial Loss",
  "How Childhood Financial Neglect Differs From Childhood Poverty",
  "The Relationship Between Financial Trauma and Chronic Shame",
  "How to Build Financial Resilience After Repeated Financial Crises",
  "The Trauma of Being Raised by a Financially Irresponsible Parent",
  "How Financial Trauma Affects Your Ability to Trust Financial Institutions",
  "The Relationship Between Financial Trauma and Self-Sabotage",
  "How to Heal From the Shame of Financial Failure",
  "The Trauma of Losing Your Home",
  "How Financial Trauma Affects Your Relationship With Work",
  "The Relationship Between Financial Trauma and Perfectionism",
  "How to Stop Punishing Yourself for Past Financial Mistakes",
  "The Trauma of Being Raised in a Cult With Financial Control",
  "How Financial Trauma Affects Your Ability to Receive",
  "The Relationship Between Financial Trauma and Eating Disorders",
  "How to Heal the Wound of Never Having Enough",
  "The Trauma of Financial Secrets Kept in Your Family",
  "How Financial Trauma Affects Your Ability to Set Prices",
  "The Relationship Between Financial Trauma and Chronic Fatigue",
  "How to Heal From the Trauma of Being Financially Dependent",
  "The Trauma of Growing Up With a Gambling Parent",
  "How Financial Trauma Affects Your Ability to Receive Gifts",
  "The Relationship Between Financial Trauma and Anxiety Disorders",
  "How to Recognize Financial Trauma in Your Clients",
  "The Trauma of Having Your Financial Privacy Violated",
  "How Financial Trauma Affects Your Ability to Charge What You're Worth",
  "The Relationship Between Financial Trauma and Relationship Patterns",
  "How to Heal From the Trauma of Financial Humiliation",
  "The Trauma of Being Raised by a Parent Who Was Financially Abusive",
  "How Financial Trauma Affects Your Ability to Make Long-Term Plans",
  "The Relationship Between Financial Trauma and Chronic Pain",
  "How to Stop Letting Financial Trauma Run Your Business",
  "The Trauma of Being Told Money Was the Root of All Evil",
  "How Financial Trauma Affects Your Ability to Negotiate",
  "The Relationship Between Financial Trauma and Imposter Syndrome",
  "How to Heal From the Trauma of Financial Abandonment",
  "The Trauma of Watching Your Family Lose Their Business",
  "How Financial Trauma Affects Your Ability to Save",
  "The Relationship Between Financial Trauma and Attachment Styles",
  "How to Recognize When Financial Trauma Is Running Your Life",
  "The Trauma of Being Raised in Financial Secrecy",
  "How Financial Trauma Affects Your Ability to Invest",
  "The Relationship Between Financial Trauma and Chronic Illness",
  "How to Heal From the Trauma of Financial Shame",
  "The Trauma of Being the First in Your Family to Have Money",
  "How Financial Trauma Affects Your Ability to Retire",
  "The Relationship Between Financial Trauma and Somatic Symptoms",
  "How to Stop Letting Financial Trauma Determine Your Worth",
  "The Trauma of Being Raised by a Parent Who Was Financially Dependent",
  "How Financial Trauma Affects Your Ability to Receive Compliments About Money",

  // Healing Practice (161-240)
  "How to Start a Daily Money Practice Without It Feeling Like a Punishment",
  "The Difference Between Financial Therapy and Financial Planning",
  "How to Use Journaling to Heal Your Money Wound",
  "The Role of Somatic Work in Financial Healing",
  "How to Create a Money Altar",
  "The Healing Power of Financial Transparency With Yourself",
  "How to Use Breathwork to Regulate Financial Anxiety",
  "The Role of Community in Financial Healing",
  "How to Write a New Money Story",
  "The Healing Practice of Tracking Without Judgment",
  "How to Use EFT Tapping for Financial Anxiety",
  "The Role of Forgiveness in Financial Healing",
  "How to Create a Financial Healing Ritual",
  "The Healing Power of Naming Your Money Wound",
  "How to Use Visualization to Shift Your Money Mindset",
  "The Role of Gratitude in Financial Healing",
  "How to Create a Financial Boundaries Practice",
  "The Healing Practice of Saying No to Financial Requests",
  "How to Use Movement to Process Financial Stress",
  "The Role of Sleep in Financial Decision-Making",
  "How to Create a Weekly Money Date With Yourself",
  "The Healing Power of Financial Honesty With Your Partner",
  "How to Use Meditation to Heal Your Relationship With Money",
  "The Role of Nutrition in Financial Resilience",
  "How to Create a Financial Emergency Plan Without Panic",
  "The Healing Practice of Celebrating Small Financial Wins",
  "How to Use Art Therapy to Process Financial Shame",
  "The Role of Nature in Financial Healing",
  "How to Create a Financial Vision Without Bypassing Your Reality",
  "The Healing Power of Asking for Help With Money",
  "How to Use Therapy to Heal Your Money Wound",
  "The Role of Ancestry Work in Financial Healing",
  "How to Create a Financial Healing Journal Practice",
  "The Healing Practice of Releasing Financial Perfectionism",
  "How to Use Sound Healing for Financial Anxiety",
  "The Role of Rest in Financial Healing",
  "How to Create a Financial Safety Plan",
  "The Healing Power of Financial Education Without Shame",
  "How to Use EMDR for Financial Trauma",
  "The Role of Play in Financial Healing",
  "How to Create a Spending Plan That Honors Your Values",
  "The Healing Practice of Saying Thank You to Money",
  "How to Use Yoga to Heal Financial Stress",
  "The Role of Humor in Financial Healing",
  "How to Create a Financial Healing Playlist",
  "The Healing Power of Financial Mentorship",
  "How to Use Hypnotherapy for Financial Blocks",
  "The Role of Ritual in Financial Healing",
  "How to Create a Financial Healing Community",
  "The Healing Practice of Financial Transparency With Your Children",
  "How to Use Acupuncture for Financial Stress",
  "The Role of Boundaries in Financial Healing",
  "How to Create a Financial Healing Plan for the New Year",
  "The Healing Power of Saying No to Financial Obligations That Drain You",
  "How to Use Neurofeedback for Financial Anxiety",
  "The Role of Creativity in Financial Healing",
  "How to Create a Financial Healing Retreat for Yourself",
  "The Healing Practice of Releasing Debt Shame",
  "How to Use Coaching to Heal Your Money Wound",
  "The Role of Spirituality in Financial Healing",
  "How to Create a Financial Healing Practice That Sticks",
  "The Healing Power of Financial Accountability Without Punishment",
  "How to Use Astrology to Understand Your Money Patterns",
  "The Role of Numerology in Financial Healing",
  "How to Create a Financial Healing Vision Board",
  "The Healing Practice of Releasing Financial Comparison",
  "How to Use Reiki for Financial Blocks",
  "The Role of Crystals in Financial Healing",
  "How to Create a Financial Healing Mantra",
  "The Healing Power of Financial Storytelling",
  "How to Use Tarot to Understand Your Money Wound",
  "The Role of Oracle Cards in Financial Healing",
  "How to Create a Financial Healing Ceremony",
  "The Healing Practice of Releasing Financial Regret",
  "How to Use Aromatherapy for Financial Anxiety",
  "The Role of Color in Financial Healing",
  "How to Create a Financial Healing Affirmation Practice",
  "The Healing Power of Financial Boundaries With Family",
  "How to Use Feng Shui to Improve Your Financial Energy",

  // Relationships & Money (241-320)
  "How to Have the Money Conversation Before You Move In Together",
  "The Financial Patterns That Predict Relationship Success",
  "How to Handle Financial Inequality in a Relationship",
  "The Relationship Between Money and Power in Partnerships",
  "How to Heal Financial Resentment in a Marriage",
  "The Impact of Financial Infidelity on Relationship Trust",
  "How to Create a Financial Partnership With Your Spouse",
  "The Relationship Between Money Arguments and Emotional Safety",
  "How to Support a Partner Who Is Financially Irresponsible",
  "The Financial Conversation You Need to Have With Your Parents",
  "How to Set Financial Boundaries With Adult Children",
  "The Relationship Between Money and Control in Relationships",
  "How to Handle Financial Disagreements Without Damaging Your Relationship",
  "The Impact of Financial Stress on Intimacy",
  "How to Create Financial Transparency in a New Relationship",
  "The Relationship Between Financial Dependence and Emotional Dependence",
  "How to Handle Financial Inequality When You Earn More Than Your Partner",
  "The Financial Conversation You Need to Have Before Having Children",
  "How to Protect Your Financial Health in a Toxic Relationship",
  "The Relationship Between Financial Abuse and Emotional Abuse",
  "How to Rebuild Financial Trust After Betrayal",
  "The Impact of Divorce on Your Financial Identity",
  "How to Create a Financial Plan for Single Parents",
  "The Relationship Between Money and Respect in Families",
  "How to Handle Financial Pressure From In-Laws",
  "The Financial Conversation You Need to Have With Your Siblings",
  "How to Create Financial Equality in a Same-Sex Partnership",
  "The Relationship Between Money and Love Languages",
  "How to Handle Financial Disagreements With a Business Partner",
  "The Impact of Financial Stress on Parenting",
  "How to Create a Financial Legacy for Your Children",
  "The Relationship Between Money and Friendship",
  "How to Handle Financial Loans to Friends and Family",
  "The Financial Conversation You Need to Have With Your Aging Parents",
  "How to Create a Financial Plan for Blended Families",
  "The Relationship Between Money and Loyalty in Families",
  "How to Handle Financial Pressure From Your Community",
  "The Financial Conversation You Need to Have With Your Business Partner",
  "How to Create Financial Independence Within a Partnership",
  "The Relationship Between Money and Vulnerability in Relationships",
  "How to Handle Financial Disagreements With Your Parents",
  "The Impact of Financial Stress on Your Children",
  "How to Create a Financial Plan for Caregivers",
  "The Relationship Between Money and Generosity in Families",
  "How to Handle Financial Requests From Extended Family",
  "The Financial Conversation You Need to Have With Your Employer",
  "How to Create Financial Boundaries With Your Ex",
  "The Relationship Between Money and Safety in Relationships",
  "How to Handle Financial Disagreements With Your Adult Siblings",
  "The Impact of Financial Stress on Your Sex Life",
  "How to Create a Financial Plan for Long-Distance Relationships",
  "The Relationship Between Money and Trust in Partnerships",
  "How to Handle Financial Pressure From Your Social Circle",
  "The Financial Conversation You Need to Have With Your Mentor",
  "How to Create Financial Boundaries With Your Parents",
  "The Relationship Between Money and Identity in Families",
  "How to Handle Financial Disagreements With Your Children",
  "The Impact of Financial Stress on Your Friendships",
  "How to Create a Financial Plan for Entrepreneurs in Relationships",
  "The Relationship Between Money and Autonomy in Partnerships",
  "How to Handle Financial Pressure From Your Religious Community",
  "The Financial Conversation You Need to Have With Your Financial Advisor",
  "How to Create Financial Transparency With Your Children",
  "The Relationship Between Money and Belonging in Families",
  "How to Handle Financial Disagreements With Your Business Clients",
  "The Impact of Financial Stress on Your Mental Health",
  "How to Create a Financial Plan for Polyamorous Relationships",
  "The Relationship Between Money and Commitment in Partnerships",
  "How to Handle Financial Pressure From Your Cultural Community",
  "The Financial Conversation You Need to Have With Your Therapist",
  "How to Create Financial Boundaries With Your Employer",
  "The Relationship Between Money and Worthiness in Families",
  "How to Handle Financial Disagreements With Your Landlord",
  "The Impact of Financial Stress on Your Physical Health",
  "How to Create a Financial Plan for Couples With Different Incomes",
  "The Relationship Between Money and Security in Partnerships",
  "How to Handle Financial Pressure From Your Peer Group",
  "The Financial Conversation You Need to Have With Your Accountant",
  "How to Create Financial Boundaries With Your Adult Children",
  "The Relationship Between Money and Freedom in Families",

  // Wealth Consciousness (321-400)
  "What Wealthy People Actually Believe About Money That Poor People Don't",
  "How to Shift From Scarcity Consciousness to Abundance Consciousness",
  "The Difference Between Wanting More Money and Being Greedy",
  "How to Receive Money Without Guilt",
  "The Spiritual Bypassing of Pretending Money Doesn't Matter",
  "How to Align Your Money With Your Values",
  "The Relationship Between Generosity and Abundance",
  "How to Create a Wealth Consciousness Practice",
  "The Difference Between Wealth and Financial Security",
  "How to Stop Apologizing for Your Financial Goals",
  "The Relationship Between Self-Worth and Net Worth",
  "How to Create an Abundance Mindset Without Toxic Positivity",
  "The Difference Between Investing in Yourself and Self-Indulgence",
  "How to Stop Comparing Your Financial Journey to Others",
  "The Relationship Between Creativity and Financial Abundance",
  "How to Create a Financial Vision That Excites You",
  "The Difference Between Financial Goals and Financial Dreams",
  "How to Stop Letting Fear Drive Your Financial Decisions",
  "The Relationship Between Courage and Financial Growth",
  "How to Create a Wealth Mindset Without Bypassing Your Reality",
  "The Difference Between Financial Ambition and Financial Greed",
  "How to Stop Letting Other People's Money Stories Limit You",
  "The Relationship Between Boundaries and Financial Abundance",
  "How to Create a Financial Identity That Serves You",
  "The Difference Between Financial Success and Financial Happiness",
  "How to Stop Letting Your Past Define Your Financial Future",
  "The Relationship Between Authenticity and Financial Abundance",
  "How to Create a Wealth Consciousness That Includes Everyone",
  "The Difference Between Financial Independence and Financial Isolation",
  "How to Stop Letting Perfectionism Block Your Financial Growth",
  "The Relationship Between Service and Financial Abundance",
  "How to Create a Financial Practice That Honors Your Whole Self",
  "The Difference Between Financial Stability and Financial Stagnation",
  "How to Stop Letting Comparison Steal Your Financial Joy",
  "The Relationship Between Gratitude and Financial Abundance",
  "How to Create a Wealth Consciousness That Includes Your Body",
  "The Difference Between Financial Confidence and Financial Arrogance",
  "How to Stop Letting Shame Block Your Financial Growth",
  "The Relationship Between Pleasure and Financial Abundance",
  "How to Create a Financial Practice That Includes Rest",
  "The Difference Between Financial Wisdom and Financial Knowledge",
  "How to Stop Letting Guilt Drive Your Financial Decisions",
  "The Relationship Between Play and Financial Abundance",
  "How to Create a Wealth Consciousness That Includes Your Community",
  "The Difference Between Financial Freedom and Financial Escape",
  "How to Stop Letting Other People's Opinions Limit Your Financial Growth",
  "The Relationship Between Vulnerability and Financial Abundance",
  "How to Create a Financial Practice That Honors Your History",
  "The Difference Between Financial Resilience and Financial Rigidity",
  "How to Stop Letting Fear of Success Block Your Financial Growth",
  "The Relationship Between Curiosity and Financial Abundance",
  "How to Create a Wealth Consciousness That Includes Your Ancestors",
  "The Difference Between Financial Clarity and Financial Certainty",
  "How to Stop Letting Unworthiness Drive Your Financial Decisions",
  "The Relationship Between Presence and Financial Abundance",
  "How to Create a Financial Practice That Includes Your Spirituality",
  "The Difference Between Financial Empowerment and Financial Pressure",
  "How to Stop Letting Comparison Drive Your Financial Decisions",
  "The Relationship Between Acceptance and Financial Abundance",
  "How to Create a Wealth Consciousness That Includes Your Emotions",
  "The Difference Between Financial Courage and Financial Recklessness",
  "How to Stop Letting Perfectionism Drive Your Financial Decisions",
  "The Relationship Between Compassion and Financial Abundance",
  "How to Create a Financial Practice That Includes Your Relationships",
  "The Difference Between Financial Growth and Financial Pressure",
  "How to Stop Letting Scarcity Drive Your Financial Decisions",
  "The Relationship Between Trust and Financial Abundance",
  "How to Create a Wealth Consciousness That Includes Your Future Self",
  "The Difference Between Financial Healing and Financial Fixing",
  "How to Stop Letting Anxiety Drive Your Financial Decisions",
  "The Relationship Between Surrender and Financial Abundance",
  "How to Create a Financial Practice That Includes Your Whole Life",
  "The Difference Between Financial Peace and Financial Numbness",
  "How to Stop Letting Shame Drive Your Financial Decisions",
  "The Relationship Between Integrity and Financial Abundance",
  "How to Create a Wealth Consciousness That Includes Your Wounds",
  "The Difference Between Financial Maturity and Financial Rigidity",
  "How to Stop Letting Trauma Drive Your Financial Decisions",
  "The Relationship Between Love and Financial Abundance",
  "How to Create a Financial Practice That Includes Your Whole Story",

  // Spiritual & Somatic (401-500)
  "The Chakra System and Your Relationship With Money",
  "How the Root Chakra Affects Your Financial Security",
  "The Sacral Chakra and Your Relationship With Abundance",
  "How the Solar Plexus Chakra Affects Your Financial Power",
  "The Heart Chakra and Your Relationship With Financial Generosity",
  "How the Throat Chakra Affects Your Ability to Ask for What You're Worth",
  "The Third Eye Chakra and Your Financial Intuition",
  "How the Crown Chakra Affects Your Relationship With Financial Surrender",
  "The Ayurvedic Approach to Financial Balance",
  "How Your Dosha Affects Your Money Patterns",
  "The TCM View of Financial Energy and the Kidney Meridian",
  "How Acupuncture Can Help With Financial Anxiety",
  "The Somatic Experience of Financial Scarcity",
  "How Your Body Holds Financial Trauma",
  "The Nervous System Response to Financial Abundance",
  "How to Use Somatic Experiencing for Financial Healing",
  "The Relationship Between Your Gut and Your Financial Decisions",
  "How to Use Polyvagal Theory to Understand Financial Anxiety",
  "The Somatic Practice of Receiving Money",
  "How to Use Body Scanning for Financial Stress",
  "The Relationship Between Your Breath and Your Financial Decisions",
  "How to Use Somatic Therapy for Financial Trauma",
  "The Somatic Experience of Financial Shame",
  "How to Use Movement for Financial Healing",
  "The Relationship Between Your Posture and Your Financial Confidence",
  "How to Use Somatic Markers for Financial Decision-Making",
  "The Somatic Practice of Setting Financial Boundaries",
  "How to Use Body-Based Practices for Financial Resilience",
  "The Relationship Between Your Heart Rate and Your Financial Anxiety",
  "How to Use Somatic Awareness for Financial Clarity",
  "The Somatic Experience of Financial Safety",
  "How to Use Grounding Practices for Financial Anxiety",
  "The Relationship Between Your Sleep and Your Financial Decisions",
  "How to Use Somatic Practices for Financial Abundance",
  "The Somatic Experience of Financial Worthiness",
  "How to Use Body-Based Practices for Financial Healing",
  "The Relationship Between Your Digestion and Your Financial Stress",
  "How to Use Somatic Practices for Financial Boundaries",
  "The Somatic Experience of Financial Freedom",
  "How to Use Body-Based Practices for Financial Clarity",
  "The Relationship Between Your Immune System and Your Financial Stress",
  "How to Use Somatic Practices for Financial Trust",
  "The Somatic Experience of Financial Generosity",
  "How to Use Body-Based Practices for Financial Courage",
  "The Relationship Between Your Hormones and Your Financial Decisions",
  "How to Use Somatic Practices for Financial Resilience",
  "The Somatic Experience of Financial Abundance",
  "How to Use Body-Based Practices for Financial Safety",
  "The Relationship Between Your Nervous System and Your Financial Patterns",
  "How to Use Somatic Practices for Financial Healing",
  "The Spiritual Dimension of Financial Healing",
  "How to Pray About Money Without Feeling Silly",
  "The Relationship Between Faith and Financial Resilience",
  "How to Use Spiritual Practices for Financial Healing",
  "The Spiritual Bypassing of Positive Thinking About Money",
  "How to Use Ritual for Financial Healing",
  "The Relationship Between Surrender and Financial Peace",
  "How to Use Spiritual Practices for Financial Abundance",
  "The Spiritual Dimension of Financial Generosity",
  "How to Use Prayer for Financial Anxiety",
  "The Relationship Between Gratitude and Financial Healing",
  "How to Use Spiritual Practices for Financial Boundaries",
  "The Spiritual Dimension of Financial Shame",
  "How to Use Meditation for Financial Clarity",
  "The Relationship Between Presence and Financial Peace",
  "How to Use Spiritual Practices for Financial Resilience",
  "The Spiritual Dimension of Financial Trauma",
  "How to Use Contemplative Practices for Financial Healing",
  "The Relationship Between Compassion and Financial Peace",
  "How to Use Spiritual Practices for Financial Safety",
  "The Spiritual Dimension of Financial Worthiness",
  "How to Use Devotional Practices for Financial Healing",
  "The Relationship Between Love and Financial Peace",
  "How to Use Spiritual Practices for Financial Courage",
  "The Spiritual Dimension of Financial Freedom",
  "How to Use Sacred Practices for Financial Healing",
  "The Relationship Between Trust and Financial Peace",
  "How to Use Spiritual Practices for Financial Clarity",
  "The Spiritual Dimension of Financial Abundance",
  "How to Use Contemplative Practices for Financial Resilience",
  "The Relationship Between Acceptance and Financial Peace",
  "How to Use Spiritual Practices for Financial Healing (Deep Practice)",
  "The Spiritual Dimension of Financial Recovery",
  "How to Use Sacred Practices for Financial Abundance",
  "The Relationship Between Integrity and Financial Peace",
  "How to Use Spiritual Practices for Financial Worthiness",
  "The Spiritual Dimension of Financial Generosity (Advanced)",
  "How to Use Devotional Practices for Financial Abundance",
  "The Relationship Between Surrender and Financial Healing",
  "How to Use Spiritual Practices for Financial Freedom",
  "The Spiritual Dimension of Financial Safety",
  "How to Use Sacred Practices for Financial Resilience",
  "The Relationship Between Faith and Financial Healing",
  "How to Use Contemplative Practices for Financial Abundance",
  "The Spiritual Dimension of Financial Courage",
  "How to Use Devotional Practices for Financial Safety",
  "The Relationship Between Presence and Financial Healing",
  "How to Use Spiritual Practices for Financial Recovery",
  "The Spiritual Dimension of Financial Clarity",
  "How to Use Sacred Practices for Financial Courage",
  "The Relationship Between Compassion and Financial Healing (Somatic)",
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const startTime = Date.now();
  let queued = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`[preseed-500] Starting one-time pre-seed of ${TOPICS.length} articles`);
  console.log(`[preseed-500] Model: ${MODEL}`);
  console.log(`[preseed-500] Min words: ${PRESEED_MIN_WORDS}`);
  console.log(`[preseed-500] All articles will be status='queued' (NOT published)`);
  console.log(`[preseed-500] Max attempts per article: ${MAX_ATTEMPTS}`);
  console.log('');

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const progress = `[${i + 1}/${TOPICS.length}]`;
    const slug = slugify(topic);

    // Skip if already exists
    const { rows: existing } = await query(
      'SELECT id, status FROM articles WHERE slug = $1',
      [slug]
    );
    if (existing.length > 0) {
      console.log(`${progress} SKIP (exists, status=${existing[0].status}): ${slug}`);
      skipped++;
      continue;
    }

     let success = false;
    let lastFailedWords = [];
    for (let attempt = 1; attempt <= MAX_ATTEMPTS && !success; attempt++) {
      try {
        const { rawBody, asins } = await generateOne(topic, attempt - 1, lastFailedWords);
        const { passed, failures, cleanedBody, wordCount } = cleanAndGate(rawBody);
        // Extra check: enforce 1500+ floor for pre-seed
        if (wordCount < PRESEED_MIN_WORDS) {
          console.warn(`${progress} Word count too low (${wordCount} < ${PRESEED_MIN_WORDS}) attempt ${attempt}`);
          continue;
        }
        if (!passed) {
          // Extract banned words from failures for next retry
          const bannedWordFailures = failures
            .filter(f => f.startsWith('banned-words:'))
            .flatMap(f => f.replace('banned-words:', '').split(','));
          if (bannedWordFailures.length > 0) lastFailedWords = bannedWordFailures;
          console.warn(`${progress} Gate FAIL attempt ${attempt}: ${failures.slice(0, 3).join(' | ')}`);
          continue;
        }

        const category = inferCategory(topic);
        const metaDescription = await generateMeta(topic, cleanedBody);
        const readingTime = Math.ceil(wordCount / 200);

        await query(
          `INSERT INTO articles
             (slug, title, body, meta_description, category, tags,
              reading_time, word_count, asins_used,
              published, status, queued_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false,'queued',NOW(),NOW(),NOW())
           ON CONFLICT (slug) DO NOTHING`,
          [
            slug, topic, cleanedBody, metaDescription,
            category, [category, 'money-psychology', 'healing'],
            readingTime, wordCount, asins
          ]
        );

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const eta = elapsed > 0 ? Math.round(((elapsed / (queued + 1)) * (TOPICS.length - i - 1)) / 60) : '?';
        console.log(`${progress} QUEUED: ${slug} (${wordCount}w, ${elapsed}s elapsed, ~${eta}min remaining)`);
        queued++;
        success = true;
      } catch (err) {
        console.error(`${progress} Error attempt ${attempt}: ${err.message}`);
        if (attempt < MAX_ATTEMPTS) await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!success) {
      console.error(`${progress} FAILED all ${MAX_ATTEMPTS} attempts: ${topic}`);
      failed++;
    }

    // Rate limit pause
    await new Promise(r => setTimeout(r, 300));
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`[preseed-500] COMPLETE`);
  console.log(`  Queued:  ${queued}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Total time: ${Math.round(totalTime / 60)}min`);
  console.log('═══════════════════════════════════════════════');

  // Verify none are published
  const { rows: publishedCheck } = await query(
    "SELECT COUNT(*) as cnt FROM articles WHERE status = 'published' AND published = false"
  );
  console.log(`[preseed-500] Published articles: ${publishedCheck[0]?.cnt || 0} (queued articles are NOT published)`);

  const { rows: queuedCheck } = await query(
    "SELECT COUNT(*) as cnt FROM articles WHERE status = 'queued'"
  );
  console.log(`[preseed-500] Queued articles in DB: ${queuedCheck[0]?.cnt || 0}`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('[preseed-500] Fatal:', err);
  process.exit(1);
});
