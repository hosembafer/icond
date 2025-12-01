#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { initCommand } from './commands/init.js';
import { fetchCommand } from './commands/fetch.js';
import { buildCommand } from './commands/build.js';
import { libraryPublishCommand } from './commands/library-publish.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
);

const command = process.argv[2];

function showHelp() {
  console.log(`
${pc.cyan('icond')} v${packageJson.version}

Minimal tool to transfer icons from Figma to a published npm library

${pc.yellow('Commands:')}
  init      Create .icondconfig.mjs
  fetch     Fetch icons from Figma
  build     Build icon library
  publish   Publish library to npm

${pc.yellow('Examples:')}
  icond init
  icond fetch
  icond build
  icond publish
`);
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  if (command === '--version' || command === '-v') {
    console.log(packageJson.version);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'init':
        await initCommand();
        break;
      case 'fetch':
        await fetchCommand();
        break;
      case 'build':
        await buildCommand();
        break;
      case 'publish':
        await libraryPublishCommand();
        break;
      default:
        console.error(pc.red(`Unknown command: ${command}`));
        console.log(`Run ${pc.cyan('icond help')} for usage`);
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();