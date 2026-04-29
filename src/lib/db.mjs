import pg from 'pg';
const { Pool } = pg;

let pool = null;

export async function getDb() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', (err) => {
      console.error('[db] Unexpected pool error', err);
    });
    await initSchema(pool);
  }
  return pool;
}

export async function query(text, params) {
  const db = await getDb();
  return db.query(text, params);
}

async function initSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      meta_description TEXT,
      og_title TEXT,
      og_description TEXT,
      category TEXT,
      tags TEXT[],
      image_url TEXT,
      image_alt TEXT,
      reading_time INTEGER,
      author TEXT DEFAULT 'Kalesh',
      published BOOLEAN DEFAULT true,
      status TEXT NOT NULL DEFAULT 'published',
      published_at TIMESTAMPTZ,
      queued_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      word_count INTEGER,
      asins_used TEXT[],
      cta_primary TEXT,
      last_refreshed_30d TIMESTAMPTZ,
      last_refreshed_90d TIMESTAMPTZ,
      opener_type TEXT,
      conclusion_type TEXT
    );
    CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
    CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status, published_at DESC);
    CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);

    -- Live migration: add new columns to existing DB without data loss
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS queued_at TIMESTAMPTZ;

    -- Backfill: any row with published=true and no status gets marked published
    UPDATE articles SET status = 'published'
      WHERE (status IS NULL OR status = '') AND published = true;
    -- Backfill queued_at from created_at where missing
    UPDATE articles SET queued_at = created_at WHERE queued_at IS NULL;
  `);
}
