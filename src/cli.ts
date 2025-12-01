#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pc from 'picocolors';
import { initCommand } from './commands/init.js';
import { fetchCommand } from './commands/fetch.js';
import { buildCommand } from './commands/build.js';
import { publishCommand } from './commands/publish.js';
import { libraryPublishCommand } from './commands/library-publish.js';

// Get package.json for version
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('icond')
  .description('Icon library solution that fetches icons from Figma and creates tree-shakable TypeScript declarations')
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Create icond.config.ts configuration file')
  .option('-f, --force', 'Overwrite existing config file')
  .action(async (options) => {
    await initCommand(options);
  });

// Fetch command
program
  .command('fetch')
  .description('Fetch icons from Figma')
  .option('-c, --config <path>', 'Path to config file')
  .option('--clean', 'Clean output directory before fetching')
  .action(async (options) => {
    await fetchCommand(options);
  });

// Build command
program
  .command('build')
  .description('Build icon library from SVG files')
  .option('-c, --config <path>', 'Path to config file')
  .option('--clean', 'Clean output directories before building')
  .action(async (options) => {
    await buildCommand(options);
  });

// Publish command (for icond CLI itself)
program
  .command('publish')
  .description('Publish icond CLI to npm registry')
  .option('--dry-run', 'Run without actually publishing')
  .option('--tag <tag>', 'Publish with a specific npm tag')
  .option('--registry <url>', 'Specify npm registry URL')
  .action(async (options) => {
    await publishCommand(options);
  });

// Library publish command (for generated icon library)
program
  .command('library:publish')
  .description('Publish generated icon library to npm registry')
  .option('-c, --config <path>', 'Path to config file')
  .option('--dry-run', 'Run without actually publishing')
  .option('--tag <tag>', 'Publish with a specific npm tag')
  .action(async (options) => {
    await libraryPublishCommand(options);
  });

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error instanceof Error) {
    // Handle commander errors
    if ('code' in error && error.code !== 'commander.help') {
      console.error(pc.red('Error:'), error.message);
      process.exit(1);
    }
  } else {
    console.error(pc.red('An unexpected error occurred'));
    process.exit(1);
  }
}
