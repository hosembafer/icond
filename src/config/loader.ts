import { cosmiconfig } from 'cosmiconfig';
import { icondConfigSchema, type IcondConfig } from './schema.js';
import { resolve } from 'node:path';
import pc from 'picocolors';

const MODULE_NAME = 'icond';

/**
 * Load and validate icond configuration
 */
export async function loadConfig(configPath?: string): Promise<IcondConfig> {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      'icond.config.ts',
      'icond.config.js',
      'icond.config.mjs',
      'icond.config.cjs',
      '.icondrc',
      '.icondrc.json',
      '.icondrc.js',
      'package.json',
    ],
    loaders: {
      '.ts': async (filepath: string) => {
        // Use tsx or ts-node to load TypeScript config
        try {
          const { default: config } = await import(filepath);
          return config;
        } catch (error) {
          throw new Error(
            `Failed to load TypeScript config file: ${filepath}\n${error instanceof Error ? error.message : String(error)}`
          );
        }
      },
    },
  });

  try {
    let result;

    if (configPath) {
      const absolutePath = resolve(process.cwd(), configPath);
      result = await explorer.load(absolutePath);
    } else {
      result = await explorer.search();
    }

    if (!result || result.isEmpty) {
      throw new Error(
        `No ${MODULE_NAME} configuration found. Run ${pc.cyan('icond init')} to create a config file.`
      );
    }

    // Validate config with zod schema
    const validatedConfig = icondConfigSchema.parse(result.config);

    console.log(pc.dim(`Loaded config from: ${result.filepath}`));

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
  const explorer = cosmiconfig(MODULE_NAME);
  const result = await explorer.search();
  return result !== null && !result.isEmpty;
}
