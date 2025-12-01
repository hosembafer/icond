import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { loadConfig } from '../config/loader.js';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

export interface LibraryPublishOptions {
  config?: string;
  dryRun?: boolean;
  tag?: string;
}

/**
 * Publish icon library to npm registry
 */
export async function libraryPublishCommand(options: LibraryPublishOptions = {}): Promise<void> {
  try {
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config);

    const distPath = resolve(process.cwd(), config.output.dist);

    // Validate dist directory exists
    if (!existsSync(distPath)) {
      logger.error(
        `Distribution directory not found: ${pc.cyan(config.output.dist)}\n` +
          `Run ${pc.cyan('icond build')} first to build your icon library.`
      );
      process.exit(1);
    }

    // Validate package.json exists
    const packageJsonPath = resolve(distPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      logger.error(
        `package.json not found in ${pc.cyan(config.output.dist)}\n` +
          `Run ${pc.cyan('icond build')} first to generate package files.`
      );
      process.exit(1);
    }

    logger.info(`Publishing ${pc.cyan(config.library.name)}...`);

    const args: string[] = ['publish'];

    if (options.dryRun) {
      args.push('--dry-run');
      logger.warn('Running in dry-run mode (no actual publish)');
    }

    const tag = options.tag || config.publish.tag;
    if (tag) {
      args.push('--tag', tag);
    }

    args.push('--access', config.publish.access);
    args.push('--registry', config.publish.registry);

    const command = `npm ${args.join(' ')}`;
    logger.info(`Running: ${pc.cyan(command)}`);

    execSync(command, {
      cwd: distPath,
      stdio: 'inherit',
    });

    if (!options.dryRun) {
      logger.success(`Successfully published ${pc.cyan(config.library.name)}`);
      console.log();
      logger.info('Install your library:');
      console.log(pc.cyan(`  npm install ${config.library.name}`));
      console.log(pc.dim('  or'));
      console.log(pc.cyan(`  pnpm add ${config.library.name}`));
      console.log(pc.dim('  or'));
      console.log(pc.cyan(`  yarn add ${config.library.name}`));
    }
  } catch (error) {
    logger.error(
      `Failed to publish library: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
