import { defaultConfig, type IcondConfig } from './schema.js';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import pc from 'picocolors';

/**
 * Validate and apply defaults to configuration
 */
function validateConfig(config: Partial<IcondConfig>): IcondConfig {
  // Required fields
  if (!config.figma?.token) {
    throw new Error('figma.token is required - set FIGMA_TOKEN environment variable or add to config');
  }
  if (!config.figma?.fileId) {
    throw new Error('figma.fileId is required');
  }

  // Merge with defaults
  return {
    figma: config.figma,
    output: { ...defaultConfig.output, ...config.output },
    iconGeneration: { ...defaultConfig.iconGeneration, ...config.iconGeneration },
    build: { ...defaultConfig.build, ...config.build },
  };
}

/**
 * Load and validate icond configuration from .icondconfig.mjs
 */
export async function loadConfig(): Promise<IcondConfig> {
  const configPath = resolve(process.cwd(), '.icondconfig.mjs');

  if (!existsSync(configPath)) {
    throw new Error(
      `${pc.red('Configuration file not found:')}\n` +
      `Expected ${pc.cyan('.icondconfig.mjs')} in the current directory.\n` +
      `Run ${pc.cyan('icond init')} to create one.`
    );
  }

  try {
    // Import the config file
    const configModule = await import(`file://${configPath}`);
    const config = configModule.default;

    if (!config) {
      throw new Error('Config file must have a default export');
    }

    // Validate and apply defaults to config
    const validatedConfig = validateConfig(config);

    console.log(pc.dim(`Loaded config from: ${configPath}`));

    return validatedConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `${pc.red('Configuration error:')}\n${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Check if config file exists
 */
export async function configExists(): Promise<boolean> {
  const configPath = resolve(process.cwd(), '.icondconfig.mjs');
  return existsSync(configPath);
}