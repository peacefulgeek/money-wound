import express from 'express';
import compression from 'compression';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthRouter } from './routes/health.js';
import { articlesRouter } from './routes/articles.js';
import { sitemapRouter } from './routes/sitemap.js';
import { renderPage } from './ssr.js';
import {
  getPublishedArticles,
  getPublishedCount,
  getArticle,
  rebuildIndex,
} from '../src/lib/db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

// ─── Rebuild index on startup to ensure consistency ───────────────────────────
try {
  rebuildIndex();
  console.log('[server] Article index rebuilt from JSON files');
} catch (err) {
  console.error('[server] Index rebuild error (non-fatal):', err);
}

async function getInitialData(url: string): Promise<Record<string, any>> {
  try {
    const pathname = url.split('?')[0];
    if (pathname === '/' || pathname === '') {
      const articles = await getPublishedArticles({ limit: 6 });
      return { articles };
    }
    if (pathname === '/articles') {
      const articles = await getPublishedArticles({ limit: 20 });
      const total = await getPublishedCount();
      return { articles, total };
    }
    const articleMatch = pathname.match(/^\/articles\/([^/?]+)$/);
    if (articleMatch) {
      const article = await getArticle(articleMatch[1]);
      if (article && article.status === 'published') return { article };
    }
    return {};
  } catch (err) {
    console.error('[ssr] getInitialData error:', err);
    return {};
  }
}

async function createServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // ─── www → non-www 301 redirect (must be first) ───────────────────────────
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV === 'production') {
      const host = req.headers.host ?? '';
      if (host.startsWith('www.')) {
        const canonical = host.slice(4);
        const proto = req.headers['x-forwarded-proto'] ?? 'https';
        return res.redirect(301, `${proto}://${canonical}${req.originalUrl}`);
      }
    }
    next();
  });

  app.use(compression());
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
        if (/\.(html)$/.test(filepath)) res.setHeader('Cache-Control', 'no-cache');
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

const app = await createServer();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Listening on 0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
});
export default app;
