# icond

> CLI tool for creating tree-shakable icon libraries from Figma

[![npm version](https://img.shields.io/npm/v/icond.svg)](https://www.npmjs.com/package/icond)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **Fetch from Figma** - Download icons from Figma using the Figma API
- 📦 **Tree-shakable** - Generate individual files per icon for optimal tree-shaking
- 🔷 **TypeScript** - Full type safety with generated types
- ⚡ **Optimized** - Built-in SVG optimization using SVGO
- 🎯 **Smart Naming** - Size-based naming (24px = clean names, others get suffix)
- 🎨 **Themeable** - Automatic `currentColor` replacement for CSS theming
- 📝 **Git-Friendly** - Only SVGs committed, TypeScript files generated on build

## Architecture

`icond` is installed as a **devDependency** in your icon library package. This separation allows you to:
- ✅ Commit SVG source files (reviewable changes)
- ✅ Track library versions with semantic versioning
- ✅ Generate TypeScript files on install (via `prepare` script)
- ✅ Keep git history clean (no generated file commits)

```
@your-org/icons (git repo)          icond (npm package, devDependency)
├── .icondconfig.mjs  ✅ committed   ├── CLI commands
├── svg/              ✅ committed   ├── Templates
├── package.json      ✅ committed   └── Build tooling
├── src/icons/        ❌ generated
└── dist/             ❌ generated
```

## How It Works

```
Figma → SVG Files (committed) → TypeScript (generated) → Bundled Library → npm Package
```

## Quick Start

### For New Packages

```bash
# Create package
mkdir my-icons && cd my-icons
npm init -y

# Install icond
npm install --save-dev icond

# Initialize configuration
npx icond init

# Follow the setup instructions
```

### For Existing Packages

```bash
# Install icond as dev dependency
npm install --save-dev icond

# Create configuration file
npx icond init
```

### Complete Integration Guide

See **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** for detailed step-by-step integration guide including:
- Package.json setup
- Environment configuration
- Build scripts
- Git configuration
- CI/CD examples
- Troubleshooting

## CLI Commands

### `icond init`

Creates `.icondconfig.mjs` configuration file in the current directory.

### `icond fetch`

Fetch icons from Figma and save as SVG files.
- Downloads from specified Figma file
- Saves to `svg/` directory
- Replaces colors with `currentColor`
- Adds size suffixes (16px → `-16`, 24px → no suffix)

### `icond build`

Generate TypeScript files from SVGs and bundle the library.
- Converts SVGs to TypeScript constants
- Generates type definitions
- Bundles ESM and CJS formats
- Outputs to `dist/` directory

## Configuration

The `.icondconfig.mjs` file supports these options:

```js
export default {
  figma: {
    token: process.env.FIGMA_TOKEN || '', // Figma personal access token
    fileId: '',                           // Figma file ID (from URL)
    pages: [],                            // Optional: specific pages to fetch
  },
};
```

Advanced options use sensible defaults but can be overridden:

```js
export default {
  // ... figma config

  output: {
    svg: './svg',           // SVG files directory
    icons: './src/icons',   // Generated TypeScript files
    dist: './dist',         // Bundled output
  },

  iconGeneration: {
    prefix: '',                    // Prefix for all icon names
    delimiter: 'CAMEL',            // CAMEL | KEBAB | SNAKE | UPPER
    interfaceName: 'Icon',
    typeName: 'IconName',
  },

  build: {
    formats: ['esm', 'cjs'],       // Output formats
    minify: true,                  // Minify output
    sourcemap: true,               // Generate sourcemaps
    target: 'es2020',              // Build target
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

See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for complete testing and local development workflow.

## License

MIT