import { components } from '@figma-export/core';
import asComponentsAsSvg from '@figma-export/output-components-as-svg';
import transformSvgWithSvgo from '@figma-export/transform-svg-with-svgo';
import type { BaseCommandOptions, ComponentsCommandOptions } from '@figma-export/types';
import { resolve, join } from 'node:path';
import { readFileSync, writeFileSync, renameSync, readdirSync, statSync } from 'node:fs';
import { loadConfig } from '../config/loader.js';
import { ensureDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

/**
 * Extract width attribute from SVG string
 */
function extractSvgWidth(svgContent: string): string {
  const widthMatch = svgContent.match(/width="(\d+)"/);
  return widthMatch?.[1] ?? '24'; // Default to 24 if not found
}

/**
 * Replace all fill and stroke color values with currentColor
 * This makes icons themeable via CSS color property
 */
function replaceColorsWithCurrentColor(svgContent: string): string {
  return svgContent
    // Replace fill colors (hex, rgb, rgba, named colors)
    .replace(/fill="(?!none|currentColor)[^"]+"/g, 'fill="currentColor"')
    // Replace stroke colors (hex, rgb, rgba, named colors)
    .replace(/stroke="(?!none|currentColor)[^"]+"/g, 'stroke="currentColor"');
}

/**
 * Post-process SVG files to add size suffix and replace colors with currentColor
 * - Replaces all fill/stroke colors with currentColor for CSS theming
 * - Renames files based on their width: 24px gets no suffix, others get -16, -20, etc.
 */
async function postProcessSvgFiles(outputPath: string): Promise<void> {
  const files = readdirSync(outputPath);
  let colorReplacementCount = 0;

  for (const file of files) {
    const filePath = join(outputPath, file);
    const stat = statSync(filePath);

    if (!stat.isFile() || !file.endsWith('.svg')) {
      continue;
    }

    let svgContent = readFileSync(filePath, 'utf-8');
    const width = extractSvgWidth(svgContent);

    // Replace colors with currentColor
    const modifiedContent = replaceColorsWithCurrentColor(svgContent);
    if (modifiedContent !== svgContent) {
      colorReplacementCount++;
      svgContent = modifiedContent;
      writeFileSync(filePath, svgContent, 'utf-8');
    }

    // Rename file if not 24px
    if (width !== '24') {
      const nameWithoutExt = file.replace(/\.svg$/, '');
      const newFileName = `${nameWithoutExt}-${width}.svg`;
      const newFilePath = join(outputPath, newFileName);

      renameSync(filePath, newFilePath);
    }
  }

  if (colorReplacementCount > 0) {
    logger.info(`  Replaced colors with currentColor in ${pc.cyan(colorReplacementCount.toString())} icons`);
  }
}

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
          getBasename: (options) => {
            // Trim whitespace, replace spaces with dashes, and clean up
            const cleaned = options.basename
              .trim()                      // Remove leading/trailing spaces
              .replace(/\s+/g, '-')       // Replace spaces with dashes
              .replace(/-+/g, '-');       // Remove consecutive dashes
            return `${cleaned}.svg`;
          },
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

    logger.info('Post-processing icons...');
    await postProcessSvgFiles(outputPath);

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