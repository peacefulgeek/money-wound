import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Build SSR entry - use cjs format since react-router-dom/server is CJS
await build({
  entryPoints: [resolve(projectRoot, 'src/client/entry-server.tsx')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: resolve(projectRoot, 'dist/server/entry-server.cjs'),
  external: ['react', 'react-dom', 'react-router-dom'],
  jsx: 'automatic',
  target: 'node20',
});

// Build Express server
await build({
  entryPoints: [resolve(projectRoot, 'server/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: resolve(projectRoot, 'dist/index.js'),
  external: [
    'vite',
    '@vitejs/plugin-react',
    'express',
    'compression',
    'serve-static',
    'pg',
    'node-cron',
    '@anthropic-ai/sdk',
    'react',
    'react-dom',
    'react-router-dom',
    'react-router-dom/server'
  ],
  target: 'node20',
});

console.log('[build-server] Done');
