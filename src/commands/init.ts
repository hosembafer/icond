import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeFileSafe } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { configTemplate } from '../templates/config.template.js';
import pc from 'picocolors';

/**
 * Initialize icond configuration file
 */
export async function initCommand(): Promise<void> {
  const configPath = resolve(process.cwd(), '.icondconfig.mjs');

  if (existsSync(configPath)) {
    logger.error(`Configuration file already exists: ${pc.cyan('.icondconfig.mjs')}`);
    process.exit(1);
  }

  try {
    await writeFileSafe(configPath, configTemplate);

    logger.success(`Created ${pc.cyan('.icondconfig.mjs')}`);
    console.log();
    logger.info('Next steps:');
    console.log();
    console.log(pc.dim('  1. Update ') + pc.cyan('.icondconfig.mjs') + pc.dim(' with your Figma file ID'));
    console.log();
    console.log(pc.dim('  2. Set your Figma token:'));
    console.log('     ' + pc.cyan('export FIGMA_TOKEN=\'your-token-here\''));
    console.log();
    console.log(pc.dim('  3. Add build scripts to your package.json:'));
    console.log('     ' + pc.cyan('"scripts": {'));
    console.log('     ' + pc.cyan('  "fetch": "icond fetch",'));
    console.log('     ' + pc.cyan('  "build": "icond build",'));
    console.log('     ' + pc.cyan('  "prepublishOnly": "npm run build"'));
    console.log('     ' + pc.cyan('}'));
    console.log();
    console.log(pc.dim('  4. Run commands:'));
    console.log('     ' + pc.cyan('npm run fetch') + '  # Download icons from Figma');
    console.log('     ' + pc.cyan('npm run build') + '  # Build the library');
    console.log('     ' + pc.cyan('npm publish') + '    # Publish to npm');
  } catch (error) {
    logger.error(`Failed to create config: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}