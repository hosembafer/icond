import { convertToFiles } from 'svg-to-ts';
import { build } from 'esbuild';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fg from 'fast-glob';
import { loadConfigForBuild } from '../config/loader.js';
import { ensureDir, cleanDir } from '../utils/fs.js';
import { logger } from '../utils/logger.js';
import pc from 'picocolors';

const execAsync = promisify(exec);

/**
 * Convert a variable name to icon-prefixed format
 * Examples: delete -> iconDelete, home -> iconHome, arrowLeft -> iconArrowLeft
 */
function toIconName(name: string): string {
  // Capitalize first letter and prefix with 'icon'
  return 'icon' + name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Post-process generated TypeScript files to add 'icon' prefix to all exports
 * This creates a consistent API and avoids reserved keyword conflicts
 */
function prefixIconExports(iconsPath: string): number {
  const files = readdirSync(iconsPath, { recursive: true }) as string[];
  let modifiedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.ts')) continue;

    const filePath = join(iconsPath, file);
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Match patterns like: export const home: {
    // Replace with: export const iconHome: {
    const exportPattern = /export const (\w+):/g;
    content = content.replace(exportPattern, (match, varName) => {
      const iconName = toIconName(varName);
      if (iconName !== varName) {
        modified = true;
        return `export const ${iconName}:`;
      }
      return match;
    });

    // Handle re-exports in barrel files: export { home } from './icons/home';
    // Replace with: export { home as iconHome } from './icons/home';
    const reExportPattern = /export \{ (\w+) \}/g;
    content = content.replace(reExportPattern, (match, varName) => {
      const iconName = toIconName(varName);
      if (iconName !== varName) {
        modified = true;
        return `export { ${varName} as ${iconName} }`;
      }
      return match;
    });

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      modifiedCount++;
    }
  }

  return modifiedCount;
}

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

    // Post-process generated files to add 'icon' prefix to all exports
    const modifiedCount = prefixIconExports(iconsPath);
    if (modifiedCount > 0) {
      logger.info(`  Prefixed ${pc.cyan(modifiedCount.toString())} icon exports`);
    }

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