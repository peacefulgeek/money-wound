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
    // Initialize schema
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
      published_at TIMESTAMPTZ DEFAULT NOW(),
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
    CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published, published_at DESC);
    CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
  `);
}
