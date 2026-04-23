import express from 'express';
import { getDb } from '../../src/lib/db.mjs';

export const articlesRouter = express.Router();

articlesRouter.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = req.query.category as string;

    let queryStr = 'SELECT slug, title, meta_description, category, tags, image_url, image_alt, reading_time, published_at, word_count FROM articles WHERE published = true';
    const params: any[] = [];

    if (category) {
      params.push(category);
      queryStr += ` AND category = $${params.length}`;
    }

    queryStr += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await db.query(queryStr, params);
    const countResult = await db.query('SELECT COUNT(*) FROM articles WHERE published = true');
    res.json({ articles: rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error('[articles route]', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

articlesRouter.get('/:slug', async (req, res) => {
  try {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM articles WHERE slug = $1 AND published = true',
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[articles route]', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});
