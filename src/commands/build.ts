import { convertToFiles } from 'svg-to-ts';
import { build } from 'esbuild';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fg from 'fast-glob';
import { loadConfig } from '../config/loader.js';
import { ensureDir, cleanDir, writeFileSafe } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import { generatePackageJson, generateReadme } from '../templates/package.template.js';
import pc from 'picocolors';

const execAsync = promisify(exec);

export interface BuildOptions {
  config?: string;
  clean?: boolean;
}

/**
 * Build icon library from SVG files
 */
export async function buildCommand(options: BuildOptions = {}): Promise<void> {
  try {
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config);

    const svgPath = resolve(process.cwd(), config.output.svg);
    const iconsPath = resolve(process.cwd(), config.output.icons);
    const distPath = resolve(process.cwd(), config.output.dist);

    // Validate SVG files exist
    const svgFiles = await fg(`${svgPath}/**/*.svg`);
    if (svgFiles.length === 0) {
      logger.error(
        `No SVG files found in ${pc.cyan(config.output.svg)}\n` +
          `Run ${pc.cyan('icond fetch')} first to download icons from Figma.`
      );
      process.exit(1);
    }

    logger.info(`Found ${pc.cyan(svgFiles.length.toString())} SVG files`);

    // Clean icon generation directory if requested
    if (options.clean) {
      logger.info('Cleaning icon generation directory...');
      await cleanDir(iconsPath);
    }

    await ensureDir(iconsPath);

    logger.step(1, 4, 'Generating TypeScript files from SVGs...');

    // Convert SVGs to TypeScript using svg-to-ts
    await convertToFiles({
      srcFiles: `${svgPath}/**/*.svg`,
      outputDirectory: iconsPath,
      conversionType: 'files',
      prefix: config.iconGeneration.prefix,
      interfaceName: config.iconGeneration.interfaceName,
      typeName: config.iconGeneration.typeName,
      delimiter: config.iconGeneration.delimiter,
      barrelFileName: config.iconGeneration.barrelFileName,
      compileSources: config.iconGeneration.compileSources,
      generateType: config.iconGeneration.generateType,
      exportCompleteIconSet: config.iconGeneration.exportCompleteIconSet,
      modelFileName: config.iconGeneration.modelFileName,
      iconsFolderName: config.iconGeneration.iconsFolderName,
    });

    logger.step(2, 4, 'Bundling icon library...');

    // Clean dist directory
    await cleanDir(distPath);
    await ensureDir(distPath);

    const entryPoint = join(iconsPath, `${config.iconGeneration.barrelFileName}.ts`);

    if (!existsSync(entryPoint)) {
      logger.error(`Entry point not found: ${entryPoint}`);
      process.exit(1);
    }

    // Build with esbuild for each format
    const buildPromises = [];

    if (config.build.formats.includes('esm')) {
      buildPromises.push(
        build({
          entryPoints: [entryPoint],
          outfile: join(distPath, 'index.js'),
          bundle: true,
          platform: 'neutral',
          format: 'esm',
          target: config.build.target,
          minify: config.build.minify,
          sourcemap: config.build.sourcemap,
          treeShaking: true,
        })
      );
    }

    if (config.build.formats.includes('cjs')) {
      buildPromises.push(
        build({
          entryPoints: [entryPoint],
          outfile: join(distPath, 'index.cjs'),
          bundle: true,
          platform: 'neutral',
          format: 'cjs',
          target: config.build.target,
          minify: config.build.minify,
          sourcemap: config.build.sourcemap,
          treeShaking: true,
        })
      );
    }

    await Promise.all(buildPromises);

    // Also build individual icon files if they exist
    const iconFiles = await fg(`${iconsPath}/**/*.icon.ts`);
    if (iconFiles.length > 0) {
      logger.step(3, 4, 'Building individual icon files...');

      const iconBuildPromises = [];

      for (const iconFile of iconFiles) {
        const iconName = iconFile.replace(iconsPath + '/', '').replace('.ts', '');

        if (config.build.formats.includes('esm')) {
          iconBuildPromises.push(
            build({
              entryPoints: [iconFile],
              outfile: join(distPath, `${iconName}.js`),
              bundle: true,
              platform: 'neutral',
              format: 'esm',
              target: config.build.target,
              minify: config.build.minify,
              treeShaking: true,
            })
          );
        }

        if (config.build.formats.includes('cjs')) {
          iconBuildPromises.push(
            build({
              entryPoints: [iconFile],
              outfile: join(distPath, `${iconName}.cjs`),
              bundle: true,
              platform: 'neutral',
              format: 'cjs',
              target: config.build.target,
              minify: config.build.minify,
              treeShaking: true,
            })
          );
        }
      }

      await Promise.all(iconBuildPromises);
    }

    // Generate TypeScript declarations using tsc
    logger.step(3, 4, 'Generating TypeScript declarations...');
    await execAsync(`tsc ${entryPoint} --declaration --emitDeclarationOnly --outDir ${distPath}`);

    // Generate package.json for the library
    logger.step(4, 4, 'Generating package files...');

    const packageJsonContent = generatePackageJson(config.library);
    await writeFileSafe(join(distPath, 'package.json'), packageJsonContent);

    // Generate README
    const readmeContent = generateReadme(config.library);
    await writeFileSafe(join(distPath, 'README.md'), readmeContent);

    logger.success(
      `Built icon library to ${pc.cyan(config.output.dist)}`
    );

    console.log();
    logger.info('Library structure:');
    console.log(pc.dim(`  ${config.output.dist}/`));
    console.log(pc.dim(`    ├── index.js (ESM)`));
    console.log(pc.dim(`    ├── index.cjs (CommonJS)`));
    console.log(pc.dim(`    ├── index.d.ts (TypeScript types)`));
    console.log(pc.dim(`    ├── *.icon.js (Individual icons)`));
    console.log(pc.dim(`    ├── package.json`));
    console.log(pc.dim(`    └── README.md`));
    console.log();
    logger.info(`Next step: Run ${pc.cyan('icond library:publish')} to publish your icon library`);
  } catch (error) {
    logger.error(
      `Failed to build icon library: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error && error.stack) {
      console.error(pc.dim(error.stack));
    }
    process.exit(1);
  }
}
