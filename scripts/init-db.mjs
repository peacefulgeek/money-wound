import { query } from '../src/lib/db.mjs';
async function run() {
  await query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      meta_description TEXT,
      category TEXT,
      tags TEXT[],
      reading_time INTEGER,
      word_count INTEGER,
      asins_used TEXT[],
      opener_type TEXT,
      conclusion_type TEXT,
      last_refreshed_30d TIMESTAMP WITH TIME ZONE,
      last_refreshed_90d TIMESTAMP WITH TIME ZONE,
      published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('DB initialized');
  process.exit(0);
}
run();
