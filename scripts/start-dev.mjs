import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const server = spawn('node', ['--loader', 'ts-node/esm', 'server/index.ts'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('error', (err) => {
  console.error('[dev] Server error:', err);
});
