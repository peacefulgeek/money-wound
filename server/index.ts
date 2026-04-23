import express from 'express';
import compression from 'compression';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthRouter } from './routes/health.js';
import { articlesRouter } from './routes/articles.js';
import { sitemapRouter } from './routes/sitemap.js';
import { renderPage } from './ssr.js';
import { getDb } from '../src/lib/db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function getInitialData(url: string): Promise<Record<string, any>> {
  try {
    const db = await getDb();
    const pathname = url.split('?')[0];
    if (pathname === '/' || pathname === '') {
      const { rows } = await db.query(
        `SELECT slug, title, meta_description, category, image_url, image_alt, reading_time, published_at
         FROM articles WHERE published = true ORDER BY published_at DESC LIMIT 6`
      );
      return { articles: rows };
    }
    if (pathname === '/articles') {
      const { rows } = await db.query(
        `SELECT slug, title, meta_description, category, image_url, image_alt, reading_time, published_at
         FROM articles WHERE published = true ORDER BY published_at DESC LIMIT 20`
      );
      const countResult = await db.query('SELECT COUNT(*) FROM articles WHERE published = true');
      return { articles: rows, total: parseInt(countResult.rows[0].count) };
    }
    const articleMatch = pathname.match(/^\/articles\/([^/?]+)$/);
    if (articleMatch) {
      const slug = articleMatch[1];
      const { rows } = await db.query(
        'SELECT * FROM articles WHERE slug = $1 AND published = true',
        [slug]
      );
      if (rows.length) return { article: rows[0] };
    }
    return {};
  } catch (err) {
    console.error('[ssr] getInitialData error:', err);
    return {};
  }
}

async function createServer() {
  const app = express();
  app.use(compression());
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use('/health', healthRouter);
  app.use('/api/articles', articlesRouter);
  app.use('/sitemap.xml', sitemapRouter);

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const initialData = await getInitialData(req.originalUrl);
        const html = await renderPage(req.originalUrl, { vite, initialData });
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) { next(e); }
    });
  } else {
    const clientDir = path.resolve(__dirname, '../dist/client');
    app.use(serveStatic(clientDir, {
      index: false,
      maxAge: '1y',
      setHeaders(res, filepath) {
        if (/\.(html)$/.test(filepath)) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    app.use('*', async (req, res, next) => {
      try {
        const initialData = await getInitialData(req.originalUrl);
        const html = await renderPage(req.originalUrl, { initialData });
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) { next(e); }
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[server error]', err);
    res.status(500).send('Internal Server Error');
  });

  return app;
}

// ─── Startup seed: populate 30 articles if DB is empty ────────
async function maybeRunSeed() {
  try {
    const db = await getDb();
    const { rows } = await db.query('SELECT COUNT(*) FROM articles');
    const count = parseInt(rows[0].count, 10);
    if (count === 0) {
      console.log('[server] Empty DB detected - running startup seed...');
      const { default: seedFn } = await import('../scripts/seed-startup.mjs' as any);
      await seedFn();
      console.log('[server] Startup seed complete');
    } else {
      console.log(`[server] DB has ${count} articles - skipping seed`);
    }
  } catch (err) {
    console.error('[server] Startup seed error (non-fatal):', err);
  }
}

await maybeRunSeed();
const app = await createServer();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Listening on 0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
});

export default app;
