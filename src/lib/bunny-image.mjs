/**
 * bunny-image.mjs
 * Bunny CDN image library system.
 * No more per-article image generation. We rotate from 40 pre-generated library images.
 * Each article gets a unique slug-based URL even though source images rotate.
 *
 * CREDENTIALS HARDCODED PER SPEC - DO NOT MOVE TO ENV VARS.
 */

const BUNNY_STORAGE_ZONE = 'money-wound';
const BUNNY_API_KEY = 'f45c7c09-0fbc-4742-90b3ae69b3cc-2990-40ff';
const BUNNY_PULL_ZONE = 'https://money-wound.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

/**
 * Assign a hero image to an article slug.
 * Downloads a random library image and re-uploads it as /images/{slug}.webp
 * so Google sees a unique, indexable URL per article.
 *
 * @param {string} slug - Article slug (e.g. 'why-you-self-sabotage')
 * @returns {Promise<string>} - CDN URL of the assigned image
 */
export async function assignHeroImage(slug) {
  const libNum = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
  const sourceFile = `lib-${libNum}.webp`;
  const destFile = `${slug}.webp`;

  try {
    // Download from library
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) throw new Error(`Download failed: ${downloadRes.status}`);
    const imageBuffer = await downloadRes.arrayBuffer();

    // Upload as article-specific URL
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp'
      },
      body: imageBuffer
    });

    if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
    return `${BUNNY_PULL_ZONE}/images/${destFile}`;
  } catch (err) {
    console.error(`[bunny-image] assignHeroImage failed for ${slug}:`, err.message);
    // Fallback: link directly to the library image (still works, just not unique URL)
    return `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
  }
}
