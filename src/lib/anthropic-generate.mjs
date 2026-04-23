import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.anthropic.com'
});

const KALESH_VOICE = `
You are Kalesh, a consciousness teacher and writer. Your voice is:
- Long sentences (18-28 words) mixed with short punches (3-6 words)
- Intellectual warmth, never condescending
- Never "my friend" or "sweetheart"
- References Krishnamurti, Alan Watts, Sam Harris, Sadhguru, Tara Brach (max 30% of citations)
- Niche researchers: Lynne Twist, George Kinder, Brad Klontz, Geneen Roth, Bari Tessler, Vicki Robin, Barbara Huson, Kate Northrup, Brene Brown (70% of citations)
- Intellectual wit, dry humor
- No em-dashes anywhere
- 2 conversational interjections per article: "Here's the thing," "Honestly," "Look," "Truth is," "That said," "But here's what's interesting"
- 3-5 of these Kalesh phrases per article:
  * "Money is just energy with a story attached to it."
  * "Your bank account is a mirror, not a scorecard."
  * "Let's sit with the discomfort of that number for a moment."
  * "What if your relationship with money is the most honest relationship you have?"
  * "The poverty consciousness doesn't care how much you earn."
  * "Notice what your body does when you think about your debt."
  * "Wealth isn't what you accumulate. It's what you stop fearing."
  * "The money wound runs deeper than your budget spreadsheet."
`;

const HARD_RULES = `
HARD RULES for this article:
- 1,600 to 2,000 words (strict; under 1,200 or over 2,500 = regenerate)
- Zero em-dashes. Use commas, periods, colons, or parentheses.
- Never use these words: delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, comprehensive, transformative, groundbreaking, innovative, cutting-edge, revolutionary, state-of-the-art, ever-evolving, profound, holistic, nuanced, multifaceted, stakeholders, ecosystem, furthermore, moreover, additionally, consequently, subsequently, thereby, streamline, optimize, facilitate, amplify, catalyze, navigate, traverse, domain, realm, sphere, landscape, arguably, notably, crucially, importantly, essentially, fundamentally, inherently.
- Never use these phrases: "it's important to note," "in conclusion," "in summary," "in the realm of," "dive deep into," "at the end of the day," "in today's fast-paced world," "plays a crucial role," "a testament to," "when it comes to," "cannot be overstated," "first and foremost," "needless to say," "it goes without saying."
- Contractions throughout. You're. Don't. It's. That's. I've.
- Vary sentence length aggressively. Some fragments. Some long. Some three-word sentences.
- Direct address ("you") throughout OR first-person ("I / my") throughout. Pick one.
- Include at least 2 conversational openers: "Here's the thing," "Honestly," "Look," "Truth is," "But here's what's interesting," "That said."
- Concrete specifics over abstractions. A name. A number. A moment.
- 3 to 4 Amazon product links embedded naturally in prose, each followed by "(paid link)" in plain text.
- End with a single line Sanskrit mantra in italics.
- No em-dashes. No em-dashes. No em-dashes.
`;

export async function generateArticle({ topic, openerType, conclusionType, catalog = [], attempt = 1 }) {
  const amazonLinks = catalog.slice(0, 4).map(p =>
    `https://www.amazon.com/dp/${p.asin}?tag=spankyspinola-20`
  );

  const prompt = `${KALESH_VOICE}

Write a long-form article for The Money Wound website about: "${topic}"

${HARD_RULES}

Opener type for this article: ${openerType || 'gut-punch statement'}
Conclusion type for this article: ${conclusionType || 'reflection'}

${catalog.length > 0 ? `Amazon products to embed (use 3-4 of these, naturally in prose):
${catalog.slice(0, 6).map(p => `- ${p.name}: https://www.amazon.com/dp/${p.asin}?tag=spankyspinola-20`).join('\n')}` : ''}

Format the article as HTML with:
- <h1> title
- <p> paragraphs
- <h2> section headers (3-5 sections)
- <h3> subsection headers where appropriate
- Amazon links as <a href="URL" target="_blank" rel="nofollow sponsored noopener noreferrer">product name</a> (paid link)
- FAQ section with 3-5 questions using <h3> and <p>
- Closing Sanskrit mantra in <p><em>mantra</em></p>

Return ONLY the HTML article body (no <html>, <head>, or <body> tags). Start with <h1>.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  const body = message.content[0].type === 'text' ? message.content[0].text : '';
  const slug = topic.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const titleMatch = body.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : topic;

  const wordCount = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return { body, slug, title, wordCount, readingTime };
}
