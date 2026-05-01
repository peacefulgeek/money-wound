/**
 * assign-library-images.mjs
 * One-time script: assign Bunny CDN library images to all queued articles
 * Uses the same deterministic hash as assignHeroImage() in src/lib/bunny-image.mjs
 * Run once after preseed-500 completes.
 */
import pg from 'pg';
const { Client } = pg;

const PULL_ZONE_URL = 'https://money-wound.b-cdn.net';
const LIBRARY_COUNT = 40;

function assignHeroImage(slug) {
  // Simple deterministic hash: sum of char codes mod LIBRARY_COUNT
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i)) % LIBRARY_COUNT;
  }
  const idx = (hash % LIBRARY_COUNT) + 1;
  const padded = String(idx).padStart(2, '0');
  return `${PULL_ZONE_URL}/library/lib-${padded}.webp`;
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Get all queued articles that don't have an image_url yet
  const { rows } = await client.query(
    `SELECT id, slug FROM articles WHERE status = 'queued' ORDER BY id`
  );

  console.log(`Assigning library images to ${rows.length} queued articles...`);

  let updated = 0;
  for (const row of rows) {
    const imageUrl = assignHeroImage(row.slug);
    await client.query(
      `UPDATE articles SET image_url = $1 WHERE id = $2`,
      [imageUrl, row.id]
    );
    updated++;
    if (updated % 50 === 0) {
      console.log(`  ${updated}/${rows.length} assigned...`);
    }
  }

  // Verify
  const { rows: sample } = await client.query(
    `SELECT slug, image_url FROM articles WHERE status = 'queued' LIMIT 5`
  );
  console.log('\nSample assignments:');
  for (const r of sample) {
    console.log(`  ${r.slug} → ${r.image_url}`);
  }

  // Count articles with images
  const { rows: counts } = await client.query(
    `SELECT 
      COUNT(*) FILTER (WHERE status='queued') as queued,
      COUNT(*) FILTER (WHERE status='published') as published,
      COUNT(*) FILTER (WHERE image_url IS NOT NULL AND status='queued') as queued_with_images
     FROM articles`
  );
  console.log('\nFinal DB state:');
  console.log(`  Queued: ${counts[0].queued}`);
  console.log(`  Published: ${counts[0].published}`);
  console.log(`  Queued with images: ${counts[0].queued_with_images}`);

  await client.end();
  console.log('\nDone. All queued articles have library image URLs assigned.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
