import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import fg from 'fast-glob';
import pc from 'picocolors';
import { loadConfigForBuild } from '../config/loader.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Get list of SVG files from git
 */
async function getIconsFromGit(svgPath: string, ref: string): Promise<Set<string>> {
  try {
    const { stdout } = await execAsync(`git ls-tree -r --name-only ${ref} -- ${svgPath}`);
    return new Set(
      stdout
        .trim()
        .split('\n')
        .filter((f) => f.endsWith('.svg'))
        .map((f) => f.split('/').pop()!)
    );
  } catch {
    return new Set();
  }
}

/**
 * Get current SVG files
 */
async function getCurrentIcons(svgPath: string): Promise<Set<string>> {
  const files = await fg(`${svgPath}/**/*.svg`);
  return new Set(files.map((f) => f.split('/').pop()!));
}

/**
 * Get latest git tag
 */
async function getLatestTag(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git describe --tags --abbrev=0 2>/dev/null || echo ""');
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Generate changelog entry
 */
function generateChangelog(added: string[], removed: string[]): string {
  const date = new Date().toISOString().split('T')[0];
  let entry = `## [Unreleased] - ${date}\n\n`;

  if (added.length > 0) {
    entry += `### Added\n\n`;
    added.sort().forEach((icon) => {
      entry += `- \`${icon.replace('.svg', '')}\`\n`;
    });
    entry += '\n';
  }

  if (removed.length > 0) {
    entry += `### Removed\n\n`;
    removed.sort().forEach((icon) => {
      entry += `- \`${icon.replace('.svg', '')}\`\n`;
    });
    entry += '\n';
  }

  return entry;
}

/**
 * Update CHANGELOG.md
 */
function updateChangelog(path: string, entry: string): void {
  let content = existsSync(path)
    ? readFileSync(path, 'utf-8')
    : `# Changelog\n\nAll notable changes to this icon library will be documented in this file.\n\n`;

  // Insert after title
  const lines = content.split('\n');
  const insertIndex = lines.findIndex((l) => l.startsWith('## ')) || 3;
  lines.splice(insertIndex === -1 ? 3 : insertIndex, 0, entry);

  writeFileSync(path, lines.join('\n'), 'utf-8');
}

/**
 * Changelog command - Track icon changes since last tag
 */
export async function changelogCommand(): Promise<void> {
  try {
    const config = await loadConfigForBuild();
    const svgPath = resolve(process.cwd(), config.output.svg);
    const changelogPath = resolve(process.cwd(), 'CHANGELOG.md');

    const ref = (await getLatestTag()) || 'HEAD~1';
    logger.info(`Comparing icons since ${pc.cyan(ref)}...`);

    const oldIcons = await getIconsFromGit(svgPath, ref);
    const newIcons = await getCurrentIcons(svgPath);

    const added = Array.from(newIcons).filter((i) => !oldIcons.has(i));
    const removed = Array.from(oldIcons).filter((i) => !newIcons.has(i));

    if (added.length === 0 && removed.length === 0) {
      logger.success('No icon changes detected');
      return;
    }

    console.log();
    if (added.length > 0) logger.success(`${pc.green('+')} ${added.length} added`);
    if (removed.length > 0) logger.warn(`${pc.red('-')} ${removed.length} removed`);
    console.log();

    updateChangelog(changelogPath, generateChangelog(added, removed));
    logger.success(`Updated ${pc.cyan('CHANGELOG.md')}`);

  } catch (error) {
    logger.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}