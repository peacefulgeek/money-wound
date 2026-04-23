import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';

export async function renderPage(url: string, options?: { vite?: any; initialData?: Record<string, any> }): Promise<string> {
  try {
    let render: any;
    let template: string;

    if (isDev && options?.vite) {
      template = await fs.readFile(path.resolve('index.html'), 'utf-8');
      template = await options.vite.transformIndexHtml(url, template);
      const mod = await options.vite.ssrLoadModule('/src/client/entry-server.tsx');
      render = mod.render;
    } else {
      const clientDir = path.resolve(__dirname, '../dist/client');
      template = await fs.readFile(path.join(clientDir, 'index.html'), 'utf-8');
      const serverEntry = path.resolve(__dirname, '../dist/server/entry-server.cjs');
      const mod = await import(serverEntry);
      render = mod.render;
    }

    const { html: appHtml, head } = await render(url);
    const initialDataScript = options?.initialData
      ? `<script>window.__INITIAL_DATA__ = ${JSON.stringify(options.initialData)};</script>`
      : '';
    const finalHtml = template
      .replace('<!--app-head-->', (head ?? '') + initialDataScript)
      .replace('<!--app-html-->', appHtml ?? '');

    return finalHtml;
  } catch (err) {
    console.error('[ssr] render error:', err);
    throw err;
  }
}
