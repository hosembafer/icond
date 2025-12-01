import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeFileSafe } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { configTemplate } from '../templates/config.template.js';
import pc from 'picocolors';

export interface InitOptions {
  force?: boolean;
}

/**
 * Initialize icond configuration file
 */
export async function initCommand(options: InitOptions = {}): Promise<void> {
  const configPath = resolve(process.cwd(), 'icond.config.ts');

  // Check if config already exists
  if (existsSync(configPath) && !options.force) {
    logger.error(
      `Configuration file already exists at ${pc.cyan('icond.config.ts')}\n` +
        `Use ${pc.cyan('--force')} to overwrite.`
    );
    process.exit(1);
  }

  try {
    logger.info('Creating configuration file...');

    // Write config file
    await writeFileSafe(configPath, configTemplate);

    logger.success(`Created ${pc.cyan('icond.config.ts')}`);
    console.log();
    logger.info('Next steps:');
    console.log(pc.dim('  1. Add your Figma API token to .env:'));
    console.log(pc.cyan('     FIGMA_TOKEN=your-token-here'));
    console.log();
    console.log(pc.dim('  2. Update icond.config.ts with your Figma file ID'));
    console.log();
    console.log(pc.dim('  3. Run commands:'));
    console.log(pc.cyan('     icond fetch') + pc.dim('  # Fetch icons from Figma'));
    console.log(pc.cyan('     icond build') + pc.dim('  # Build icon library'));
    console.log();
  } catch (error) {
    logger.error(`Failed to create config file: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
