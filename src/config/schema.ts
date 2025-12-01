/**
 * SVGO plugin configuration
 */
export interface SvgoPlugin {
  name: string;
  active?: boolean;
  params?: Record<string, any>;
}

/**
 * Figma configuration
 */
export interface FigmaConfig {
  token: string;
  fileId: string;
  pages?: string[];
  svgo?: {
    plugins?: SvgoPlugin[];
  };
}

/**
 * Output directories configuration
 */
export interface OutputConfig {
  svg: string;
  icons: string;
  dist: string;
}

/**
 * Icon generation configuration (svg-to-ts options)
 */
export interface IconGenerationConfig {
  conversionType: 'files';
  prefix: string;
  interfaceName: string;
  typeName: string;
  delimiter: 'CAMEL' | 'KEBAB' | 'SNAKE' | 'UPPER' | 'NONE';
  barrelFileName: string;
  compileSources: boolean;
  generateType: boolean;
  exportCompleteIconSet: boolean;
  modelFileName: string;
  iconsFolderName: string;
}

/**
 * Library package configuration
 */
export interface LibraryConfig {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license: string;
  repository?: string;
  keywords?: string[];
}

/**
 * Publishing configuration
 */
export interface PublishConfig {
  registry: string;
  access: 'public' | 'restricted';
  tag?: string;
}

/**
 * Build configuration
 */
export interface BuildConfig {
  formats: ('esm' | 'cjs')[];
  minify: boolean;
  sourcemap: boolean;
  target: string;
}

/**
 * Main configuration schema
 */
export interface IcondConfig {
  figma: FigmaConfig;
  output: OutputConfig;
  iconGeneration: IconGenerationConfig;
  library: LibraryConfig;
  publish: PublishConfig;
  build: BuildConfig;
}

/**
 * Default configuration values
 */
export const defaultConfig: Omit<IcondConfig, 'figma' | 'library'> = {
  output: {
    svg: './svg',
    icons: './src/icons',
    dist: './dist',
  },
  iconGeneration: {
    conversionType: 'files',
    prefix: 'icon',
    interfaceName: 'Icon',
    typeName: 'IconName',
    delimiter: 'CAMEL',
    barrelFileName: 'index',
    compileSources: false,
    generateType: true,
    exportCompleteIconSet: false,
    modelFileName: 'icon.model',
    iconsFolderName: '',
  },
  publish: {
    registry: 'https://registry.npmjs.org',
    access: 'public',
  },
  build: {
    formats: ['esm', 'cjs'],
    minify: true,
    sourcemap: true,
    target: 'es2020',
  },
};
