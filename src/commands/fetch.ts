import { exportComponents } from '@figma-export/core';
import asComponentsAsSvg from '@figma-export/output-components-as-svg';
import transformSvgWithSvgo from '@figma-export/transform-svg-with-svgo';
import type { ComponentsCommandOptions } from '@figma-export/types';
import { resolve } from 'node:path';
import { loadConfig } from '../config/loader.js';
import { ensureDir, cleanDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

export interface FetchOptions {
  config?: string;
  clean?: boolean;
}

/**
 * Fetch icons from Figma
 */
export async function fetchCommand(options: FetchOptions = {}): Promise<void> {
  try {
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config);

    const outputPath = resolve(process.cwd(), config.output.svg);

    // Clean output directory if requested
    if (options.clean) {
      logger.info('Cleaning output directory...');
      await cleanDir(outputPath);
    }

    // Ensure output directory exists
    await ensureDir(outputPath);

    logger.step(1, 2, 'Fetching icons from Figma...');

    // Configure @figma-export
    const figmaExportConfig: ComponentsCommandOptions = {
      fileId: config.figma.fileId,
      token: config.figma.token,
      onlyFromPages: config.figma.pages,
      outputters: [
        asComponentsAsSvg({
          output: outputPath,
          getDirname: () => '', // Flat structure
          getBasename: (options) => options.basename,
        }),
      ],
      transformers: config.figma.svgo
        ? [
            transformSvgWithSvgo({
              plugins: config.figma.svgo.plugins || [],
            }),
          ]
        : [],
    };

    // Execute export
    await exportComponents(figmaExportConfig);

    logger.step(2, 2, 'Icons fetched successfully');
    logger.success(
      `Exported icons to ${pc.cyan(config.output.svg)}`
    );

    console.log();
    logger.info(`Next step: Run ${pc.cyan('icond build')} to generate TypeScript files`);
  } catch (error) {
    logger.error(
      `Failed to fetch icons: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}
