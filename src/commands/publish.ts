import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

export interface PublishOptions {
  dryRun?: boolean;
  tag?: string;
  registry?: string;
}

/**
 * Publish icond CLI to npm registry
 */
export async function publishCommand(options: PublishOptions = {}): Promise<void> {
  try {
    logger.info('Publishing icond CLI...');

    const packageRoot = resolve(__dirname, '../..');
    const args: string[] = ['publish'];

    if (options.dryRun) {
      args.push('--dry-run');
      logger.warn('Running in dry-run mode (no actual publish)');
    }

    if (options.tag) {
      args.push('--tag', options.tag);
    }

    if (options.registry) {
      args.push('--registry', options.registry);
    }

    // Add access public by default
    args.push('--access', 'public');

    const command = `npm ${args.join(' ')}`;
    logger.info(`Running: ${pc.cyan(command)}`);

    execSync(command, {
      cwd: packageRoot,
      stdio: 'inherit',
    });

    if (!options.dryRun) {
      logger.success('Successfully published icond CLI');
    }
  } catch (error) {
    logger.error(
      `Failed to publish: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
