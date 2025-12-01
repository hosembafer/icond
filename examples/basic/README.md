# Basic icond Example

This example demonstrates how to use `icond` to create a tree-shakable icon library from Figma.

## Setup

1. Install icond globally:
   ```bash
   npm install -g icond
   # or for local development, link from root
   cd ../.. && npm link
   ```

2. Create a `.env` file with your Figma token:
   ```env
   FIGMA_TOKEN=your-figma-token-here
   ```

3. Initialize the config file:
   ```bash
   pnpm run init
   ```

4. Update `icond.config.ts` with your Figma file ID and library settings.

## Workflow

### 1. Fetch Icons from Figma

```bash
pnpm run fetch
```

This will download all icons from your Figma file to the `./svg` directory.

### 2. Build Icon Library

```bash
pnpm run build
```

This will:
- Generate TypeScript files from SVGs using `svg-to-ts`
- Bundle the library for ESM and CommonJS
- Create `package.json` and `README.md` in the `./dist` directory

### 3. Publish (Dry Run)

```bash
pnpm run publish
```

This runs a dry-run publish to verify everything is correct before actually publishing.

To publish for real, run:
```bash
icond library:publish
```

## Generated Library Structure

After running `build`, you'll have:

```
dist/
├── index.js              # ESM entry point
├── index.cjs             # CommonJS entry point
├── index.d.ts            # TypeScript types
├── home.icon.js          # Individual icon (ESM)
├── home.icon.cjs         # Individual icon (CommonJS)
├── home.icon.d.ts        # Icon types
├── icon.model.d.ts       # Shared types
├── package.json          # Generated package.json
└── README.md             # Generated README
```

## Using the Generated Library

### Import All Icons

\`\`\`typescript
import { iconHome, iconUser, type IconName } from '@your-org/icons';

// Icon structure
console.log(iconHome.name); // 'home'
console.log(iconHome.data); // '<svg>...</svg>'
\`\`\`

### Tree-Shakable Import

\`\`\`typescript
import { iconHome } from '@your-org/icons/home.icon';
\`\`\`

### React Example

\`\`\`tsx
import { iconHome } from '@your-org/icons';

function HomeIcon() {
  return <div dangerouslySetInnerHTML={{ __html: iconHome.data }} />;
}
\`\`\`

### Vue Example

\`\`\`vue
<template>
  <div v-html="iconHome.data" />
</template>

<script setup>
import { iconHome } from '@your-org/icons';
</script>
\`\`\`
