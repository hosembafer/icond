import { z } from 'zod';

/**
 * SVGO plugin configuration
 */
const svgoPluginSchema = z.object({
  name: z.string(),
  active: z.boolean().optional(),
  params: z.record(z.any()).optional(),
});

/**
 * Figma configuration
 */
const figmaConfigSchema = z.object({
  token: z.string().min(1, 'Figma token is required'),
  fileId: z.string().min(1, 'Figma file ID is required'),
  pages: z.array(z.string()).optional().describe('Optional: filter specific pages to export'),
  svgo: z
    .object({
      plugins: z.array(svgoPluginSchema).optional(),
    })
    .optional()
    .describe('SVGO optimization configuration'),
});

/**
 * Output directories configuration
 */
const outputConfigSchema = z.object({
  svg: z.string().default('./svg').describe('Directory for raw SVG files from Figma'),
  icons: z.string().default('./src/icons').describe('Directory for generated TypeScript files'),
  dist: z.string().default('./dist').describe('Directory for built library'),
});

/**
 * Icon generation configuration (svg-to-ts options)
 */
const iconGenerationConfigSchema = z.object({
  conversionType: z.literal('files').default('files'),
  prefix: z.string().default('icon').describe('Prefix for generated icon constants'),
  interfaceName: z.string().default('Icon').describe('Name of the generated interface'),
  typeName: z.string().default('IconName').describe('Name of the generated type'),
  delimiter: z
    .enum(['CAMEL', 'KEBAB', 'SNAKE', 'UPPER', 'NONE'])
    .default('CAMEL')
    .describe('Naming convention for icon constants'),
  barrelFileName: z.string().default('index').describe('Name of the barrel export file'),
  compileSources: z.boolean().default(false).describe('Compile to JavaScript instead of TypeScript'),
  generateType: z.boolean().default(true).describe('Generate TypeScript types'),
  exportCompleteIconSet: z.boolean().default(false).describe('Export complete icon set as array'),
  modelFileName: z.string().default('icon.model').describe('Name of the model file containing types'),
  iconsFolderName: z.string().default('').describe('Subfolder name for icon files'),
});

/**
 * Library package configuration
 */
const libraryConfigSchema = z.object({
  name: z.string().min(1, 'Library name is required'),
  version: z.string().default('1.0.0'),
  description: z.string().optional(),
  author: z.string().optional(),
  license: z.string().default('MIT'),
  repository: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * Publishing configuration
 */
const publishConfigSchema = z.object({
  registry: z.string().default('https://registry.npmjs.org'),
  access: z.enum(['public', 'restricted']).default('public'),
  tag: z.string().optional().describe('npm dist-tag'),
});

/**
 * Build configuration
 */
const buildConfigSchema = z.object({
  formats: z.array(z.enum(['esm', 'cjs'])).default(['esm', 'cjs']),
  minify: z.boolean().default(true),
  sourcemap: z.boolean().default(true),
  target: z.string().default('es2020').describe('Build target for esbuild'),
});

/**
 * Main configuration schema
 */
export const icondConfigSchema = z.object({
  figma: figmaConfigSchema,
  output: outputConfigSchema.optional().default({}),
  iconGeneration: iconGenerationConfigSchema.optional().default({}),
  library: libraryConfigSchema,
  publish: publishConfigSchema.optional().default({}),
  build: buildConfigSchema.optional().default({}),
});

export type IcondConfig = z.infer<typeof icondConfigSchema>;
export type FigmaConfig = z.infer<typeof figmaConfigSchema>;
export type OutputConfig = z.infer<typeof outputConfigSchema>;
export type IconGenerationConfig = z.infer<typeof iconGenerationConfigSchema>;
export type LibraryConfig = z.infer<typeof libraryConfigSchema>;
export type PublishConfig = z.infer<typeof publishConfigSchema>;
export type BuildConfig = z.infer<typeof buildConfigSchema>;

/**
 * Helper function to define config with type safety
 */
export function defineConfig(config: IcondConfig): IcondConfig {
  return icondConfigSchema.parse(config);
}
