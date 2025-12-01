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
    console.log(pc.dim('  1. Add your Figma token and file ID to .icondconfig.mjs'));
    console.log(pc.dim('  2. Run: ') + pc.cyan('icond fetch'));
    console.log(pc.dim('  3. Run: ') + pc.cyan('icond build'));
    console.log(pc.dim('  4. Run: ') + pc.cyan('icond publish'));
  } catch (error) {
    logger.error(`Failed to create config: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}