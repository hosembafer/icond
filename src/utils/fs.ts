import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Ensure directory exists
 */
export async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Write file and ensure directory exists
 */
export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Clean directory
 */
export async function cleanDir(dir: string): Promise<void> {
  if (existsSync(dir)) {
    await rm(dir, { recursive: true, force: true });
  }
}
