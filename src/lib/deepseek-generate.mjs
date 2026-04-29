/**
 * deepseek-generate.mjs
 * Writing engine: DeepSeek V4-Pro via OpenAI-compatible client.
 * DO NOT use Anthropic. DO NOT use FAL. DO NOT use deepseek-chat or deepseek-reasoner.
 * Model is always deepseek-v4-pro. Period.
 */
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
});

const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

/**
 * Generate a full article body for the given topic.
 * Returns the raw HTML string.
 */
export async function generateArticleBody(topic, asins) {
  const asinLinks = asins.map(a =>
    `<a href="https://www.amazon.com/dp/${a}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">${a} (paid link)</a>`
  ).join('\n');

  const systemPrompt = `You are Kalesh — a consciousness teacher and writer who helps people heal their relationship with money. Your writing is direct, honest, compassionate, and grounded in both psychology and spiritual practice. You write for real humans who are tired of being lied to by the financial industry.

VOICE RULES (non-negotiable):
- Direct address: always "you", never "one" or "people"
- Contractions everywhere: don't, can't, it's, you're, they're
- Compassionate but unflinching — name the uncomfortable truth
- Include 2-3 conversational dialogue markers: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?"
- No academic distance. No corporate speak. Write like you're sitting across from someone who needs to hear this.

BANNED WORDS (if any appear, your response is invalid):
utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore

BANNED PHRASES (if any appear, your response is invalid):
"it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

FORMATTING:
- Output clean HTML only (h1, h2, p, ul, li, a tags)
- No markdown. No code blocks. Just HTML.
- 1,200 to 2,500 words
- Zero em-dashes (— or –). Use " - " (hyphen with spaces) instead.
- Include exactly 3 or 4 Amazon affiliate links from the provided ASINs, formatted exactly as shown.
- End with: <p><em>Om Shanti Shanti Shanti</em></p>`;

  const userPrompt = `Write a full article on this topic: "${topic}"

Use exactly 3 of these Amazon affiliate links in the body (naturally placed, not in a list at the end):
${asinLinks}

The article must be 1,200 to 2,500 words. Start with a gut-punch opening sentence that names the uncomfortable truth. No preamble. No "In this article we will...". Just start.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.72
  });

  return response.choices[0].message.content ?? '';
}

/**
 * Generate a short meta description (150-160 chars) for an article.
 */
export async function generateMetaDescription(title, body) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You write SEO meta descriptions. 150-160 characters. No em-dashes. Direct, honest, first-person plural or second-person. No clickbait.'
      },
      {
        role: 'user',
        content: `Write a meta description for this article titled "${title}". Here is the first paragraph:\n\n${body.slice(0, 500)}`
      }
    ],
    temperature: 0.5
  });
  return (response.choices[0].message.content ?? '').trim().slice(0, 160);
}
