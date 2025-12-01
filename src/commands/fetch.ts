import { components } from '@figma-export/core';
import asComponentsAsSvg from '@figma-export/output-components-as-svg';
import transformSvgWithSvgo from '@figma-export/transform-svg-with-svgo';
import type { BaseCommandOptions, ComponentsCommandOptions } from '@figma-export/types';
import { resolve } from 'node:path';
import { loadConfig } from '../config/loader.js';
import { ensureDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

/**
 * Fetch icons from Figma
 */
export async function fetchCommand(): Promise<void> {
  try {
    const config = await loadConfig();
    const outputPath = resolve(process.cwd(), config.output.svg);

    await ensureDir(outputPath);

    logger.info('Fetching icons from Figma...');

    const figmaExportConfig: BaseCommandOptions & ComponentsCommandOptions = {
      fileId: config.figma.fileId,
      token: config.figma.token,
        onlyFromPages: config.figma.pages,
      outputters: [
        asComponentsAsSvg({
          output: outputPath,
          getDirname: () => '',
          getBasename: (options) => `${options.basename}.svg`,
        }),
      ],
      transformers: config.figma.svgo
        ? [
            transformSvgWithSvgo({
              plugins: (config.figma.svgo.plugins || []) as any,
            }),
          ]
        : [],
    };

    await components(figmaExportConfig);

    logger.success(`Exported icons to ${pc.cyan(config.output.svg)}`);
    console.log();
    logger.info(`Next: ${pc.cyan('icond build')}`);
  } catch (error) {
    logger.error(
      `Failed to fetch icons: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}