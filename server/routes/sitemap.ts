import express from 'express';
import { getDb } from '../../src/lib/db.mjs';

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT slug, published_at FROM articles WHERE published = true ORDER BY published_at DESC'
    );

    const baseUrl = 'https://yourmoneywound.com';
    const staticPages = ['', '/about', '/articles', '/tools', '/privacy'];

    const urls = [
      ...staticPages.map(p => `
  <url>
    <loc>${baseUrl}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...rows.map(r => `
  <url>
    <loc>${baseUrl}/articles/${r.slug}</loc>
    <lastmod>${new Date(r.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    ].join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.set('Content-Type', 'application/xml').send(xml);
  } catch (err) {
    console.error('[sitemap]', err);
    res.status(500).send('Error generating sitemap');
  }
});
