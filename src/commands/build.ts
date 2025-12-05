import { convertToFiles } from 'svg-to-ts';
import { build } from 'esbuild';
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fg from 'fast-glob';
import { loadConfigForBuild } from '../config/loader.js';
import { ensureDir, cleanDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

const execAsync = promisify(exec);

/**
 * Build icon library from SVG files
 */
export async function buildCommand(): Promise<void> {
  try {
    const config = await loadConfigForBuild();

    const svgPath = resolve(process.cwd(), config.output.svg);
    const iconsPath = resolve(process.cwd(), config.output.icons);
    const distPath = resolve(process.cwd(), config.output.dist);

    const svgFiles = await fg(`${svgPath}/**/*.svg`);
    if (svgFiles.length === 0) {
      logger.error(
        `No SVG files found in ${pc.cyan(config.output.svg)}\n` +
          `Run ${pc.cyan('icond fetch')} first`
      );
      process.exit(1);
    }

    logger.info(`Found ${pc.cyan(svgFiles.length.toString())} SVG files`);

    await cleanDir(iconsPath);
    await ensureDir(iconsPath);

    logger.step(1, 3, 'Generating TypeScript files from SVGs...');

    await convertToFiles({
      srcFiles: [`${svgPath}/**/*.svg`],
      outputDirectory: iconsPath,
      prefix: config.iconGeneration.prefix,
      interfaceName: config.iconGeneration.interfaceName,
      typeName: config.iconGeneration.typeName,
      delimiter: (config.iconGeneration.delimiter ?? 'KEBAB') as any,
      barrelFileName: config.iconGeneration.barrelFileName,
      compileSources: config.iconGeneration.compileSources,
      generateType: config.iconGeneration.generateType,
      exportCompleteIconSet: config.iconGeneration.exportCompleteIconSet,
      modelFileName: config.iconGeneration.modelFileName,
      iconsFolderName: config.iconGeneration.iconsFolderName,
    } as any);

    logger.step(2, 3, 'Bundling icon library...');

    await cleanDir(distPath);
    await ensureDir(distPath);

    const entryPoint = join(iconsPath, `${config.iconGeneration.barrelFileName}.ts`);

    if (!existsSync(entryPoint)) {
      logger.error(`Entry point not found: ${entryPoint}`);
      process.exit(1);
    }

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

    logger.step(3, 3, 'Generating TypeScript declarations...');

    // Use npx to run the local TypeScript installation
    try {
      await execAsync(`npx tsc ${entryPoint} --declaration --emitDeclarationOnly --outDir ${distPath}`);
    } catch (tscError) {
      // If tsc fails, try to provide a helpful error message
      if (tscError instanceof Error && tscError.message.includes('tsc')) {
        logger.warn('TypeScript compiler not found. Skipping declaration generation.');
        logger.info('To generate TypeScript declarations, install TypeScript:');
        console.log(pc.cyan('  npm install --save-dev typescript'));
      } else {
        // Re-throw if it's not a missing tsc error
        throw tscError;
      }
    }

    logger.success(`Built library to ${pc.cyan(config.output.dist)}`);
    console.log();
    logger.info('Library built successfully! You can now publish using:');
    console.log(pc.cyan('  npm publish'));
  } catch (error) {
    logger.error(
      `Failed to build library: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error && error.stack) {
      console.error(pc.dim(error.stack));
    }
    process.exit(1);
  }
}