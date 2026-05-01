import express from 'express';
import { getPublishedArticles, getPublishedCount, getArticle } from '../../src/lib/db.mjs';

export const articlesRouter = express.Router();

// GET /api/articles?limit=20&offset=0&category=X
articlesRouter.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = (req.query.category as string) || null;
    const articles = await getPublishedArticles({ limit, offset, category });
    const total = await getPublishedCount();
    res.json({ articles, total });
  } catch (err) {
    console.error('[articles route]', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:slug
articlesRouter.get('/:slug', async (req, res) => {
  try {
    const article = await getArticle(req.params.slug);
    if (!article || article.status !== 'published') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(article);
  } catch (err) {
    console.error('[articles route]', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});
