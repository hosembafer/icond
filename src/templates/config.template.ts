export const configTemplate = `export default {
  figma: {
    token: process.env.FIGMA_TOKEN || '', // Your Figma personal access token
    fileId: '', // Your Figma file ID (from the URL)
    // pages: [], // Optional: specific pages to fetch (e.g., ['Icons'])
  },

  // Optional: Override default output directories
  // output: {
  //   svg: './svg',           // SVG files directory
  //   icons: './src/icons',   // Generated TypeScript files
  //   dist: './dist',         // Bundled output
  // },

  // Optional: Customize icon naming
  // iconGeneration: {
  //   prefix: '',                    // Prefix for all icon names
  //   delimiter: 'CAMEL',            // CAMEL | KEBAB | SNAKE | UPPER
  //   interfaceName: 'Icon',
  //   typeName: 'IconName',
  // },
};
`;