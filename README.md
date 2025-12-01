# icond

> Icon library solution that fetches icons from Figma and creates tree-shakable TypeScript declarations

[![npm version](https://img.shields.io/npm/v/icond.svg)](https://www.npmjs.com/package/icond)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **Fetch from Figma** - Automatically download icons from Figma using the Figma API
- 📦 **Tree-shakable** - Generate individual files per icon for optimal tree-shaking
- 🔷 **TypeScript First** - Full type safety with generated types for all icon names
- 🚀 **Framework Agnostic** - Works with React, Vue, Angular, Svelte, or vanilla JS
- ⚡ **Optimized** - Built-in SVG optimization using SVGO
- 🔧 **Configurable** - Extensive configuration options for customization
- 📤 **Publishing Ready** - Built-in commands to publish your icon library

## How It Works

```
Figma → SVG Files → TypeScript Files → Bundled Library → npm Package
   ↓         ↓              ↓               ↓              ↓
 fetch     SVGO         svg-to-ts         tsup         publish
```

## Quick Start

### Installation

```bash
npm install -g icond
# or
pnpm add -g icond
```

### Usage

1. **Initialize configuration**

```bash
icond init
```

This creates an `icond.config.ts` file in your project.

2. **Configure Figma**

Add your Figma token to `.env`:

```env
FIGMA_TOKEN=your-figma-token-here
```

Update `icond.config.ts` with your Figma file ID:

```typescript
export default defineConfig({
  figma: {
    token: process.env.FIGMA_TOKEN,
    fileId: 'your-figma-file-id',
  },
  library: {
    name: '@your-org/icons',
    version: '1.0.0',
  },
  // ... more options
});
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
icond library:publish
```

## CLI Commands

### `icond init`

Create `icond.config.ts` configuration file.

**Options:**
- `-f, --force` - Overwrite existing config file

### `icond fetch`

Fetch icons from Figma and save as SVG files.

**Options:**
- `-c, --config <path>` - Path to config file
- `--clean` - Clean output directory before fetching

### `icond build`

Generate TypeScript files from SVGs and bundle the library.

**Options:**
- `-c, --config <path>` - Path to config file
- `--clean` - Clean output directories before building

### `icond publish`

Publish the icond CLI itself to npm.

**Options:**
- `--dry-run` - Run without actually publishing
- `--tag <tag>` - Publish with specific npm tag
- `--registry <url>` - Specify npm registry

### `icond library:publish`

Publish the generated icon library to npm.

**Options:**
- `-c, --config <path>` - Path to config file
- `--dry-run` - Run without actually publishing
- `--tag <tag>` - Publish with specific npm tag

## Configuration

Full configuration example:

```typescript
import { defineConfig } from 'icond';

export default defineConfig({
  // Figma settings
  figma: {
    token: process.env.FIGMA_TOKEN,
    fileId: 'abc123xyz',
    pages: ['Icons'], // Optional: filter pages
    svgo: {
      plugins: [
        { name: 'removeViewBox', active: false },
        { name: 'removeDimensions', active: true },
      ],
    },
  },

  // Output directories
  output: {
    svg: './svg',
    icons: './src/icons',
    dist: './dist',
  },

  // Icon generation (svg-to-ts options)
  iconGeneration: {
    prefix: 'icon',
    interfaceName: 'Icon',
    typeName: 'IconName',
    delimiter: 'CAMEL', // CAMEL | KEBAB | SNAKE | UPPER | NONE
  },

  // Library metadata
  library: {
    name: '@your-org/icons',
    version: '1.0.0',
    description: 'Icon library',
    license: 'MIT',
  },

  // Publishing options
  publish: {
    registry: 'https://registry.npmjs.org',
    access: 'public',
  },

  // Build options
  build: {
    formats: ['esm', 'cjs'],
    minify: true,
    sourcemap: true,
  },
});
```

## Generated Library Usage

### Import All Icons

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

#### Angular

```typescript
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { iconHome } from '@your-org/icons';

@Component({
  selector: 'app-icon',
  template: '<div [innerHTML]="icon"></div>',
})
export class IconComponent {
  icon = this.sanitizer.bypassSecurityTrustHtml(iconHome.data);
  constructor(private sanitizer: DomSanitizer) {}
}
```

## Technology Stack

- **@figma-export** - Fetch icons from Figma API
- **svg-to-ts** - Generate TypeScript files with tree-shaking support
- **esbuild** - Fast bundler for ESM and CommonJS
- **zod** - Configuration validation
- **commander** - CLI framework

## Architecture

icond uses a carefully chosen tech stack for optimal results:

### Why `@figma-export` + `svg-to-ts`?

- **@figma-export**: Official Figma export tool with SVGO integration
- **svg-to-ts**: Generates individual files per icon for maximum tree-shaking
- **Proven**: Battle-tested in production by many teams
- **Framework-agnostic**: Raw SVG strings work everywhere

### Output Format

Generated icons use the `svg-to-ts` format:

```typescript
export const iconHome: Icon = {
  name: 'home',
  data: '<svg xmlns="http://www.w3.org/2000/svg">...</svg>'
};
```

This provides:
- ✅ Type safety with icon names
- ✅ Consistent interface across all icons
- ✅ Framework-agnostic SVG strings
- ✅ Individual files for tree-shaking
- ✅ Lazy loading support

## Examples

See the [examples](./examples) directory for complete examples.

## Contributing

Contributions are welcome! Please open an issue or PR.

## License

MIT © [Your Name]

## Related Projects

- [@figma-export](https://github.com/marcomontalbano/figma-export) - Export tool for Figma
- [svg-to-ts](https://github.com/kreuzerk/svg-to-ts) - SVG to TypeScript converter
- [esbuild](https://esbuild.github.io/) - Fast JavaScript bundler

## Get Your Figma Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll down to "Personal access tokens"
3. Click "Create a new personal access token"
4. Give it a name and click "Create"
5. Copy the token and add it to your `.env` file

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
icond --help
```

### Workflow for Icon Library Users

```bash
# 1. Set up your project
icond init

# 2. Configure your Figma file ID in icond.config.ts

# 3. Fetch icons from Figma
icond fetch

# 4. Build the library
icond build

# 5. Test locally
cd dist && npm link

# 6. Publish when ready
icond library:publish
```
