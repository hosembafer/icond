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
  build: BuildConfig;
}

/**
 * Default configuration values
 */
export const defaultConfig: Omit<IcondConfig, 'figma'> = {
  output: {
    svg: './src/svg',
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
  build: {
    formats: ['esm', 'cjs'],
    minify: true,
    sourcemap: true,
    target: 'es2020',
  },
};
