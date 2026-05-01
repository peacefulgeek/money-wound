/**
 * regen-published.mjs
 * ONE-TIME: Regenerates all 30 published articles to 1800+ words in Paul/Kalesh voice.
 * Keeps status=published, replaces body only. Runs via Manus proxy (OPENAI_API_KEY).
 * Do NOT run again after this session.
 */
import OpenAI from 'openai';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { autoSubstitute } from '../src/lib/article-quality-gate.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.manus.im/api/llm-proxy/v1'
});

const MODEL = process.env.OPENAI_MODEL || 'gemini-2.5-flash';
const DATA_DIR = join(process.cwd(), 'data', 'articles');
const INDEX_FILE = join(DATA_DIR, '_index.json');
const MIN_WORDS = 1800;
const MAX_ATTEMPTS = 4;

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

const NICHE_RESEARCHERS = [
  'Lynne Twist (The Soul of Money)',
  'Brad Klontz (financial psychology, money scripts)',
  'Geneen Roth (Lost and Found)',
  'Bari Tessler (The Art of Money)',
  'Vicki Robin (Your Money or Your Life)',
  'Barbara Huson (Sacred Success)',
  'Kate Northrup (Money: A Love Story)',
  'Brene Brown (shame and vulnerability research)',
  'George Kinder (Life Planning movement)',
];

const SPIRITUAL_RESEARCHERS = ['Krishnamurti', 'Alan Watts', 'Tara Brach', 'Sadhguru'];

const OPENER_TYPES = [
  'gut-punch statement that names the uncomfortable truth',
  'a specific scene or moment the reader will recognize',
  'a provocative question that stops them mid-scroll',
  'a confession from Kalesh about their own money wound',
];

const CONCLUSION_TYPES = [
  'a direct challenge to the reader to take one small action today',
  'a reflection question that lingers after the article ends',
  'a compassionate reframe of the wound as information, not failure',
  'a practice or ritual the reader can do right now',
];

const BANNED_WORDS = ['utilize','delve','tapestry','landscape','paradigm','synergy','leverage','unlock','empower','pivotal','embark','underscore','paramount','seamlessly','robust','beacon','foster','elevate','curate','curated','bespoke','resonate','harness','intricate','plethora','myriad','groundbreaking','innovative','cutting-edge','state-of-the-art','game-changer','ever-evolving','stakeholders','navigate','ecosystem','framework','comprehensive','transformative','holistic','nuanced','multifaceted','profound','furthermore'];

function pickRandom(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }
function countWords(html) { return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0).length; }
function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80); }

function checkBanned(text) {
  const lower = text.toLowerCase();
  return BANNED_WORDS.filter(w => lower.includes(w.toLowerCase()));
}

async function generateArticle(title, category, attemptNum, previousBanned = []) {
  const asins = pickRandom(ASIN_POOL, 3);
  const phrases = pickRandom(KALESH_PHRASES, 3);
  const niche = pickRandom(NICHE_RESEARCHERS, 3);
  const spiritual = pickRandom(SPIRITUAL_RESEARCHERS, 1);
  const researchers = [...niche, ...spiritual];
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
- Reference these researchers naturally: ${researchers.join(', ')}
- Vary sentence length aggressively: some 3-word punches, some 25-word sentences, some fragments
- Opinions, not hedges. "This is true" not "This may be true"
- 2 conversational openers from: "Here's the thing," / "Honestly," / "Look," / "Truth is," / "But here's what's interesting,"

BANNED WORDS (any of these = invalid response):
${BANNED_WORDS.join(', ')}

BANNED PHRASES:
"it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role", "unlock your potential"

HARD REQUIREMENTS:
- MINIMUM 1,800 words. TARGET 2,200 words. MAXIMUM 3,000 words. Count carefully. Under 1,800 = invalid.
- DO NOT stop writing until you have written at least 1,800 words. Keep going. Add more sections if needed.
- Zero em-dashes (— or -). Use " - " (hyphen with spaces) or a period instead.
- Exactly 3 Amazon affiliate links from the provided list, placed naturally in the body (not in a list at the end)
- Include a FAQ section with 3-4 questions using <h3> and <p>
- Include at least 5 <h2> section headers
- End with: <p><em>Om Shanti Shanti Shanti</em></p>

FORMAT: Clean HTML only. h1, h2, h3, p, ul, li, a tags. No markdown. No code blocks. Start with <h1>.`;

  const userPrompt = `Write a full article (MINIMUM 1,800 words, TARGET 2,200 words) on this topic: "${title}"

Opener type: ${openerType}
Conclusion type: ${conclusionType}

Use exactly these 3 Amazon affiliate links in the body (naturally placed, not in a list):
${asinLinks}

IMPORTANT: Write AT LEAST 1,800 words. Include at least 5 section headers (h2). Include a FAQ section. Do not stop early. Keep writing until you reach 1,800 words minimum.${previousBanned.length > 0 ? `

PREVIOUS ATTEMPT FAILED because you used these banned words: ${previousBanned.join(', ')}. DO NOT use any of these words in this attempt.` : ''}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.85,
    max_tokens: 6000,
  });

  let content = response.choices[0].message.content || '';
  // Strip markdown code fences if gemini wraps in ```html ... ```
  content = content.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '');
  // Strip full HTML document wrapper if present, keep only body content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) content = bodyMatch[1].trim();
  // Remove <html>, <head>, <meta>, <title>, <link>, <style> tags if not stripped above
  content = content.replace(/<(!DOCTYPE|html|head|meta|title|link|style)[^>]*>[\s\S]*?<\/(html|head|style)>/gi, '');
  content = content.replace(/<(!DOCTYPE|html|head|meta|title|link)[^>]*>/gi, '');
  return content.trim();
}

function readIndex() {
  if (!existsSync(INDEX_FILE)) return [];
  try { return JSON.parse(readFileSync(INDEX_FILE, 'utf8')); } catch { return []; }
}

function writeIndex(index) {
  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
}

function updateIndexEntry(article) {
  const index = readIndex();
  const i = index.findIndex(a => a.slug === article.slug);
  const entry = {
    id: article.id, slug: article.slug, title: article.title,
    meta_description: article.meta_description || null,
    category: article.category || null, tags: article.tags || [],
    image_url: article.image_url || null, image_alt: article.image_alt || null,
    reading_time: article.reading_time || null, author: article.author || 'Kalesh',
    published: true, status: 'published',
    published_at: article.published_at || null, created_at: article.created_at || null,
    updated_at: new Date().toISOString(), word_count: article.word_count || null,
    asins_used: article.asins_used || [],
  };
  if (i >= 0) index[i] = entry; else index.unshift(entry);
  writeIndex(index);
}

async function regenArticle(slug) {
  const filePath = join(DATA_DIR, `${slug}.json`);
  if (!existsSync(filePath)) {
    console.log(`[regen] SKIP ${slug} - file not found`);
    return false;
  }

  const article = JSON.parse(readFileSync(filePath, 'utf8'));
  const title = article.title;
  const category = article.category || 'money-psychology';

  console.log(`[regen] Regenerating: "${title}" (${article.word_count || 0} words)`);

  let body = '';
  let wordCount = 0;
  let banned = [];
  let success = false;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      body = await generateArticle(title, category, attempt, banned);
      // Apply auto-substitutions first (replaces landscape, navigate, holistic, etc.)
      body = autoSubstitute(body);
      wordCount = countWords(body);
      banned = checkBanned(body);

      if (wordCount < MIN_WORDS) {
        console.log(`  Attempt ${attempt + 1}: ${wordCount} words - TOO SHORT, retrying`);
        continue;
      }
      if (banned.length > 0) {
        console.log(`  Attempt ${attempt + 1}: ${wordCount} words - STILL BANNED after substitution: ${banned.join(', ')}, retrying`);
        continue;
      }

      success = true;
      console.log(`  Attempt ${attempt + 1}: ${wordCount} words - PASSED`);
      break;
    } catch (err) {
      console.log(`  Attempt ${attempt + 1}: ERROR - ${err.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (!success) {
    console.log(`  FAILED after ${MAX_ATTEMPTS} attempts - keeping original`);
    return false;
  }

  // Extract ASINs used
  const asinMatches = body.match(/amazon\.com\/dp\/([A-Z0-9]{10})/g) || [];
  const asinsUsed = [...new Set(asinMatches.map(m => m.replace('amazon.com/dp/', '')))];

  // Update article
  article.body = body;
  article.word_count = wordCount;
  article.asins_used = asinsUsed;
  article.updated_at = new Date().toISOString();
  article.reading_time = Math.ceil(wordCount / 200);

  writeFileSync(filePath, JSON.stringify(article, null, 2), 'utf8');
  updateIndexEntry(article);

  console.log(`  Saved: ${wordCount} words, ${asinsUsed.length} ASINs`);
  return true;
}

// All 30 published article slugs
const PUBLISHED_SLUGS = [
  'conscious-investing',
  'debt-as-emotional-weight',
  'financial-infidelity-when-money-becomes-the-lie',
  'financial-minimalism',
  'financial-recovery-after-divorce',
  'financial-shame',
  'generational-wealth-vs-generational-trauma',
  'how-financial-trauma-shows-up-in-your-body',
  'how-to-create-a-financial-practice',
  'how-to-have-an-honest-conversation-about-money-with-your-partner',
  'how-to-heal-your-relationship-with-money-in-90-days',
  'how-to-stop-comparing-your-financial-life',
  'inherited-poverty-consciousness',
  'money-and-boundaries',
  'rebuilding-financial-trust',
  'the-7-money-scripts',
  'the-ayurvedic-approach-to-wealth-consciousness',
  'the-connection-between-childhood-neglect-and-adult-financial-chaos',
  'the-ethics-of-wealth',
  'the-money-conversation-we-never-had',
  'the-neuroscience-of-money-anxiety',
  'the-overspending-trap',
  'the-scarcity-loop',
  'the-spiritual-bypassing-of-money-doesnt-matter',
  'the-tcm-view-of-wealth',
  'underearning-as-a-trauma-response',
  'what-is-a-money-wound',
  'why-rich-people-feel-poor',
  'why-women-undercharge',
  'why-you-self-sabotage',
];

async function main() {
  console.log(`[regen] Starting regeneration of ${PUBLISHED_SLUGS.length} published articles`);
  console.log(`[regen] Model: ${MODEL}, Min words: ${MIN_WORDS}`);
  console.log('');

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < PUBLISHED_SLUGS.length; i++) {
    const slug = PUBLISHED_SLUGS[i];
    console.log(`[${i + 1}/${PUBLISHED_SLUGS.length}] ${slug}`);
    const ok = await regenArticle(slug);
    if (ok) passed++; else failed++;
    // Small delay between articles
    if (i < PUBLISHED_SLUGS.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log('');
  console.log(`[regen] COMPLETE: ${passed} passed, ${failed} failed`);
}

main().catch(err => {
  console.error('[regen] Fatal error:', err);
  process.exit(1);
});
