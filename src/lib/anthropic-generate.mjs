/**
 * anthropic-generate.mjs
 * DEPRECATED: This file is kept for backward compatibility only.
 * All generation now routes through deepseek-generate.mjs via OpenAI client.
 * Do NOT add ANTHROPIC_API_KEY back. Use OPENAI_API_KEY + OPENAI_BASE_URL.
 */
export { generateArticleBody as generateArticle, generateMetaDescription } from './deepseek-generate.mjs';
