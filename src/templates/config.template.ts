export const configTemplate = `import { defineConfig } from 'icond';

export default defineConfig({
  figma: {
    token: process.env.FIGMA_TOKEN || '',
    fileId: '', // Your Figma file ID
    pages: [], // Optional: ['Icons', 'Brand'] - filter specific pages
    svgo: {
      plugins: [
        { name: 'removeViewBox', active: false },
        { name: 'removeDimensions', active: true },
        { name: 'removeAttrs', active: true, params: { attrs: '(fill|stroke)' } },
      ],
    },
  },

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
    delimiter: 'CAMEL', // 'CAMEL' | 'KEBAB' | 'SNAKE' | 'UPPER' | 'NONE'
    barrelFileName: 'index',
    compileSources: false,
    generateType: true,
    exportCompleteIconSet: false,
    modelFileName: 'icon.model',
  },

  library: {
    name: '@your-org/icons',
    version: '1.0.0',
    description: 'Icon library generated from Figma',
    author: '',
    license: 'MIT',
    repository: '',
    keywords: ['icons', 'svg', 'typescript'],
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
});
`;
