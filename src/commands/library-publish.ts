import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { loadConfig } from '../config/loader.js';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

/**
 * Publish icon library to npm registry
 */
export async function libraryPublishCommand(): Promise<void> {
  try {
    const config = await loadConfig();
    const distPath = resolve(process.cwd(), config.output.dist);

    if (!existsSync(distPath)) {
      logger.error(
        `Distribution directory not found: ${pc.cyan(config.output.dist)}\n` +
          `Run ${pc.cyan('icond build')} first`
      );
      process.exit(1);
    }

    const packageJsonPath = resolve(distPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      logger.error(
        `package.json not found in ${pc.cyan(config.output.dist)}\n` +
          `Run ${pc.cyan('icond build')} first`
      );
      process.exit(1);
    }

    logger.info(`Publishing ${pc.cyan(config.library.name)}...`);

    const args = ['publish', '--access', config.publish.access, '--registry', config.publish.registry];

    if (config.publish.tag) {
      args.push('--tag', config.publish.tag);
    }

    const command = `npm ${args.join(' ')}`;
    logger.info(`Running: ${pc.cyan(command)}`);

    execSync(command, {
      cwd: distPath,
      stdio: 'inherit',
    });

    logger.success(`Published ${pc.cyan(config.library.name)}`);
    console.log();
    console.log(pc.cyan(`  npm install ${config.library.name}`));
  } catch (error) {
    logger.error(
      `Failed to publish: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}