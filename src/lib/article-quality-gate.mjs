/**
 * article-quality-gate.mjs
 * The Paul Voice Gate — non-negotiable.
 * Every article must pass all checks before storage.
 * Regenerate up to 4 attempts. Do not store failed articles.
 */
import { countAmazonLinks, extractAsinsFromText } from './amazon-verify.mjs';

// ─── 1. Banned Words (spec-exact list) ────────────────────────────────────────
const BANNED_WORDS = [
  'utilize', 'delve', 'tapestry', 'landscape', 'paradigm', 'synergy',
  'leverage', 'unlock', 'empower', 'pivotal', 'embark', 'underscore',
  'paramount', 'seamlessly', 'robust', 'beacon', 'foster', 'elevate',
  'curate', 'curated', 'bespoke', 'resonate', 'harness', 'intricate',
  'plethora', 'myriad', 'groundbreaking', 'innovative', 'cutting-edge',
  'state-of-the-art', 'game-changer', 'ever-evolving', 'rapidly-evolving',
  'stakeholders', 'navigate', 'ecosystem', 'framework', 'comprehensive',
  'transformative', 'holistic', 'nuanced', 'multifaceted', 'profound',
  'furthermore'
];

// ─── 2. Banned Phrases (spec-exact list) ──────────────────────────────────────
const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "in conclusion",
  "in summary",
  "a holistic approach",
  "in the realm of",
  "dive deep into",
  "at the end of the day",
  "in today's fast-paced world",
  "plays a crucial role"
];

// ─── 3. Word count bounds ─────────────────────────────────────────────────────
const MIN_WORDS = 1200;
const MAX_WORDS = 3000;

// ─── 4. Affiliate link bounds ─────────────────────────────────────────────────
const MIN_AFFILIATE = 3;
const MAX_AFFILIATE = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function countWords(text) {
  const plain = stripHtml(text);
  return plain ? plain.split(/\s+/).length : 0;
}

export function hasEmDash(text) {
  return /[\u2013\u2014]/.test(text);
}

/**
 * Auto-replace em-dashes and en-dashes with " - " before gate checks.
 */
export function cleanEmDashes(body) {
  return body.replace(/[\u2013\u2014]/g, ' - ');
}

export function findFlaggedWords(text) {
  const plain = stripHtml(text).toLowerCase();
  const found = [];
  for (const w of BANNED_WORDS) {
    const escaped = w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(plain)) found.push(w);
  }
  return found;
}

export function findFlaggedPhrases(text) {
  const plain = stripHtml(text).toLowerCase().replace(/\s+/g, ' ');
  return BANNED_PHRASES.filter(p => plain.includes(p.toLowerCase()));
}

export function voiceSignals(text) {
  const plain = stripHtml(text);
  const lower = plain.toLowerCase();
  const contractions = (lower.match(/\b\w+'(s|re|ve|d|ll|m|t)\b/g) || []).length;
  const directAddress = (lower.match(/\byou('re|r|rself|)?\b/g) || []).length;
  const firstPerson = (lower.match(/\b(i|i'm|i've|i'd|i'll|my|me|mine)\b/g) || []).length;
  const sentences = plain.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / (lengths.length || 1);
  const stdDev = Math.sqrt(variance);
  const shortSentences = lengths.filter(l => l <= 6).length;
  const longSentences = lengths.filter(l => l >= 25).length;
  // Spec-required dialogue markers
  const dialogueMarkers = [
    /Right\?!/i, /Know what I mean\?/i, /Does that land\?/i, /How does that make you feel\?/i
  ];
  const markerCount = dialogueMarkers.filter(r => r.test(plain)).length;
  return {
    contractions, directAddress, firstPerson,
    sentenceCount: sentences.length,
    avgSentenceLength: +avg.toFixed(1),
    sentenceStdDev: +stdDev.toFixed(1),
    shortSentences, longSentences,
    dialogueMarkers: markerCount
  };
}

/**
 * Run the full Paul Voice Gate.
 * @param {string} articleBody - HTML body (after cleanEmDashes)
 * @returns {{ passed, failures, warnings, wordCount, amazonLinks, asins, voice }}
 */
export function runQualityGate(articleBody) {
  const failures = [];
  const warnings = [];

  // Em-dash check (must be clean before calling this)
  if (hasEmDash(articleBody)) {
    failures.push('contains-em-dash');
  }

  // Banned words
  const bw = findFlaggedWords(articleBody);
  if (bw.length > 0) failures.push(`banned-words:${bw.join(',')}`);

  // Banned phrases
  const bp = findFlaggedPhrases(articleBody);
  if (bp.length > 0) failures.push(`banned-phrases:${bp.join('|')}`);

  // Word count
  const words = countWords(articleBody);
  if (words < MIN_WORDS) failures.push(`word-count-too-low:${words}`);
  if (words > MAX_WORDS) failures.push(`word-count-too-high:${words}`);

  // Affiliate links
  const amzCount = countAmazonLinks(articleBody);
  if (amzCount < MIN_AFFILIATE) failures.push(`affiliate-links-too-few:${amzCount}`);
  if (amzCount > MAX_AFFILIATE) failures.push(`affiliate-links-too-many:${amzCount}`);

  // Voice signals
  const voice = voiceSignals(articleBody);
  const per1k = (n) => (n / (words || 1)) * 1000;
  if (per1k(voice.contractions) < 4) {
    failures.push(`contractions-too-few:${voice.contractions}(${per1k(voice.contractions).toFixed(1)}/1k)`);
  }
  if (voice.directAddress === 0 && voice.firstPerson === 0) {
    failures.push('no-direct-address-or-first-person');
  }
  if (voice.sentenceStdDev < 4) {
    failures.push(`sentence-variance-too-low:${voice.sentenceStdDev}`);
  }
  if (voice.shortSentences < 2) {
    failures.push(`too-few-short-sentences:${voice.shortSentences}`);
  }
  if (voice.dialogueMarkers < 2) {
    failures.push(`dialogue-markers-too-few:${voice.dialogueMarkers}(need 2-3)`);
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings,
    wordCount: words,
    amazonLinks: amzCount,
    asins: extractAsinsFromText(articleBody),
    voice
  };
}

/**
 * Convenience: clean em-dashes then run gate.
 */
export function cleanAndGate(rawBody) {
  const cleanedBody = cleanEmDashes(rawBody);
  const result = runQualityGate(cleanedBody);
  return { ...result, cleanedBody };
}
