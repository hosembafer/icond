# icond

> Minimal tool to transfer icons from Figma to a published npm library

[![npm version](https://img.shields.io/npm/v/icond.svg)](https://www.npmjs.com/package/icond)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **Fetch from Figma** - Download icons from Figma using the Figma API
- 📦 **Tree-shakable** - Generate individual files per icon for optimal tree-shaking
- 🔷 **TypeScript** - Full type safety with generated types
- ⚡ **Optimized** - Built-in SVG optimization using SVGO
- 📤 **Publishing Ready** - Built-in command to publish your icon library

## How It Works

```
Figma → SVG Files → TypeScript Files → Bundled Library → npm Package
```

## Quick Start

### Installation

```bash
npm install -g icond
```

### Usage

1. **Initialize configuration**

```bash
icond init
```

This creates a `.icondconfig.mjs` file.

2. **Configure**

Edit `.icondconfig.mjs`:

```js
export default {
  figma: {
    token: process.env.FIGMA_TOKEN || '',
    fileId: 'your-figma-file-id',
    pages: ['page-id'], // Optional: filter specific pages
  },

  library: {
    name: '@your-org/icons',
    version: '1.0.0',
    description: 'Icon library from Figma',
    license: 'MIT',
  },
};
```

Set your Figma token:

```bash
export FIGMA_TOKEN='your-figma-token'
```

3. **Fetch icons from Figma**

```bash
icond fetch
```

4. **Build icon library**

```bash
icond build
```

5. **Publish your library**

```bash
icond publish
```

## CLI Commands

### `icond init`

Create `.icondconfig.mjs` configuration file.

### `icond fetch`

Fetch icons from Figma and save as SVG files.

### `icond build`

Generate TypeScript files from SVGs and bundle the library.

### `icond publish`

Publish the generated icon library to npm.

## Configuration

The `.icondconfig.mjs` file supports these options:

```js
export default {
  figma: {
    token: '',           // Figma personal access token
    fileId: '',          // Figma file ID (from URL)
    pages: [],           // Optional: page IDs to filter
  },

  library: {
    name: '',            // npm package name
    version: '1.0.0',    // package version
    description: '',     // package description
    license: 'MIT',      // package license
  },
};
```

Advanced options use sensible defaults but can be overridden:

```js
export default {
  // ... figma and library config

  output: {
    svg: './svg',
    icons: './src/icons',
    dist: './dist',
  },

  iconGeneration: {
    prefix: 'icon',
    delimiter: 'CAMEL', // CAMEL | KEBAB | SNAKE | UPPER
  },

  publish: {
    registry: 'https://registry.npmjs.org',
    access: 'public', // public | restricted
  },

  build: {
    formats: ['esm', 'cjs'],
    minify: true,
    sourcemap: true,
  },
};
```

## Generated Library Usage

### Import Icons

```typescript
import { iconHome, iconUser, type IconName } from '@your-org/icons';

// Icon structure
iconHome = {
  name: 'home',
  data: '<svg>...</svg>'
}
```

### Tree-Shakable Imports

```typescript
import { iconHome } from '@your-org/icons/home.icon';
```

### Framework Examples

#### React

```tsx
import { iconHome } from '@your-org/icons';

function HomeIcon() {
  return <div dangerouslySetInnerHTML={{ __html: iconHome.data }} />;
}
```

#### Vue

```vue
<template>
  <div v-html="iconHome.data" />
</template>

<script setup>
import { iconHome } from '@your-org/icons';
</script>
```

#### Svelte

```svelte
<script>
  import { iconHome } from '@your-org/icons';
</script>

<div>{@html iconHome.data}</div>
```

## Technology Stack

- **@figma-export** - Fetch icons from Figma API
- **svg-to-ts** - Generate TypeScript files with tree-shaking support
- **esbuild** - Fast bundler for ESM and CommonJS

## Get Your Figma Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll down to "Personal access tokens"
3. Click "Create a new personal access token"
4. Copy the token and use it in your config

## Development

### Building icond

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Link for local testing
npm link

# Now you can use icond globally
icond help
```

### Testing Your Icon Library

```bash
# 1. Initialize
icond init

# 2. Edit .icondconfig.mjs with your Figma details

# 3. Fetch icons
icond fetch

# 4. Build library
icond build

# 5. Test locally
cd dist && npm link

# 6. Publish when ready
icond publish
```

## License

MIT