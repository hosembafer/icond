import { build } from 'esbuild';
import { readFileSync, chmodSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));

const sharedConfig = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  sourcemap: true,
  external: Object.keys(pkg.dependencies || {}),
};

// Build CLI
await build({
  ...sharedConfig,
  entryPoints: ['src/cli.ts'],
  outfile: 'dist/cli.js',
  banner: {
    js: '#!/usr/bin/env node',
  },
});

// Build library (for programmatic usage)
await build({
  ...sharedConfig,
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
});

// Generate type declarations using tsc
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
const execAsync = promisify(exec);

await execAsync('tsc --emitDeclarationOnly --outDir dist');

// Make CLI executable
chmodSync('dist/cli.js', 0o755);

console.log('✓ Build complete');
