# Integration Guide: Adding icond to Your Icon Package

This guide shows you how to integrate `icond` into any Node.js package to manage your Figma icons.

## Prerequisites

- Node.js 18+
- An existing npm package (or create one with `npm init`)
- Figma personal access token ([Get one here](https://www.figma.com/settings))

---

## Step 1: Install icond

Add `icond` as a development dependency:

```bash
npm install --save-dev icond
```

---

## Step 2: Initialize Configuration

Create the icond configuration file:

```bash
npx icond init
```

This creates `.icondconfig.mjs` in your project root. Update it with your settings:

```js
export default {
  figma: {
    token: process.env.FIGMA_TOKEN || '',
    fileId: 'your-figma-file-id',        // From Figma file URL
    pages: ['Icons'],                     // Optional: specific pages to fetch
  },

  // Optional: Override default output directories
  // output: {
  //   svg: './svg',           // SVG files directory
  //   icons: './src/icons',   // Generated TypeScript files
  //   dist: './dist',         // Bundled output
  // },
};
```

### Where to Find Figma File ID

From your Figma file URL:
```
https://www.figma.com/file/ABC123DEF456/My-Icons
                            ^^^^^^^^^^^^
                            This is your file ID
```

---

## Step 3: Update package.json

Add the following scripts to your `package.json`:

```json
{
  "name": "@your-org/icons",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "fetch": "icond fetch",
    "build": "icond build",
    "prepare": "npm run build",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "icond": "^1.0.0"
  }
}
```

### Script Explanations

- **`fetch`** - Downloads icons from Figma to `svg/` directory
- **`build`** - Generates TypeScript files and bundles the library
- **`prepare`** - Runs automatically on `npm install` (builds the package)
- **`prepublishOnly`** - Ensures fresh build before publishing

---

## Step 4: Update .gitignore

Add generated files to `.gitignore` to keep your git history clean:

```gitignore
# Dependencies
node_modules/

# Generated files (regenerated on build)
src/icons/
dist/

# Build artifacts
*.tsbuildinfo

# Environment
.env
.env.local

# OS
.DS_Store
```

### What Gets Committed vs Ignored

✅ **Committed:**
- `.icondconfig.mjs` - Configuration
- `package.json` - Package metadata
- `svg/` - Source SVG files (reviewable changes)

❌ **Not Committed (Generated):**
- `src/icons/` - TypeScript icon files
- `dist/` - Bundled output
- `node_modules/` - Dependencies

---

## Step 5: Set Environment Variable

Set your Figma token as an environment variable:

### Bash/Zsh
```bash
export FIGMA_TOKEN='your-figma-personal-access-token'
```

### Fish
```fish
set -x FIGMA_TOKEN 'your-figma-personal-access-token'
```

### .env file (optional)
```env
FIGMA_TOKEN=your-figma-personal-access-token
```

⚠️ **Never commit your Figma token!** Add `.env` to `.gitignore`.

---

## Step 6: Fetch Icons

Download icons from Figma:

```bash
npm run fetch
```

This will:
- Connect to Figma API
- Download icons from specified pages
- Save SVG files to `svg/` directory
- Replace colors with `currentColor` for theming
- Add size suffixes (16px → `-16`, 24px → no suffix)

**Example output:**
```
svg/
├── home.svg          # 24px icon (no suffix)
├── user.svg          # 24px icon
└── settings-16.svg   # 16px icon (with suffix)
```

---

## Step 7: Build the Library

Generate TypeScript files and bundle:

```bash
npm run build
```

This will:
1. Convert SVGs to TypeScript constants
2. Generate type definitions
3. Bundle ESM and CJS formats
4. Output to `dist/` directory

**Output structure:**
```
dist/
├── index.js       # ESM bundle
├── index.cjs      # CommonJS bundle
└── index.d.ts     # TypeScript types
```

---

## Step 8: Test Locally

Link your package for local testing:

```bash
npm link
```

In another project:

```bash
npm link @your-org/icons
```

Test the import:

```typescript
import { home, settings16 } from '@your-org/icons';

console.log(home.data);      // '<svg>...</svg>'
console.log(settings16.data); // '<svg>...</svg>'
```

---

## Step 9: Publish

When ready, publish to npm:

```bash
# Commit your changes
git add .
git commit -m "Add icons from Figma"

# Version bump (patch, minor, or major)
npm version patch

# Publish to npm
npm publish
```

---

## Icon Naming Convention

Icons are named based on their size:

| Figma Icon Name | SVG Filename | Generated Variable |
|----------------|--------------|-------------------|
| home (24×24) | `home.svg` | `home` |
| user (24×24) | `user.svg` | `user` |
| settings (16×16) | `settings-16.svg` | `settings16` |
| arrow (20×20) | `arrow-20.svg` | `arrow20` |

**Rule:** 24px icons have clean names, other sizes get a suffix.

---

## Theming with currentColor

All icons automatically use `currentColor` for fills and strokes, making them themeable:

### React Example
```tsx
import { home } from '@your-org/icons';

function HomeIcon() {
  return (
    <div
      style={{ color: 'blue' }}
      dangerouslySetInnerHTML={{ __html: home.data }}
    />
  );
}
```

### CSS Example
```css
.icon {
  color: #3b82f6; /* Icons inherit this color */
}
```

---

## Advanced Configuration

### Custom Output Directories

```js
export default {
  // ... figma config

  output: {
    svg: './svg',           // SVG files directory
    icons: './src/icons',   // Generated TypeScript files
    dist: './dist',         // Bundled output
  },
};
```

### Icon Generation Options

```js
export default {
  // ... other config

  iconGeneration: {
    prefix: '',                    // Prefix for all icon names (default: '')
    delimiter: 'CAMEL',            // CAMEL | KEBAB | SNAKE | UPPER
    interfaceName: 'Icon',
    typeName: 'IconName',
  },
};
```

### SVGO Optimization

```js
export default {
  // ... other config

  figma: {
    token: process.env.FIGMA_TOKEN,
    fileId: 'your-file-id',
    svgo: {
      plugins: [
        { name: 'removeViewBox', active: false },
        { name: 'removeDimensions', active: true },
      ],
    },
  },
};
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Publish Icon Library

on:
  push:
    branches: [main]
    paths:
      - 'svg/**'
      - '.icondconfig.mjs'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Fetch icons
        run: npm run fetch
        env:
          FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}

      - name: Build library
        run: npm run build

      - name: Version bump
        run: npm version patch -m "chore: update icons [skip ci]"

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Push version tag
        run: git push --follow-tags
```

---

## Troubleshooting

### "Configuration error: figma.token is required"

Make sure you've set the `FIGMA_TOKEN` environment variable:

```bash
export FIGMA_TOKEN='your-token'
```

### "No SVG files found"

Run `npm run fetch` before `npm run build`.

### "Cannot find page with name X"

Check that the page name in `.icondconfig.mjs` matches exactly (case-sensitive) the page name in your Figma file.

### Icons don't change color

Make sure your SVG elements use `fill="currentColor"` or `stroke="currentColor"`. The `fetch` command automatically replaces colors, but if you manually edited SVGs, ensure they use `currentColor`.

---

## Example Package Structure

Final structure of your icon package:

```
my-icon-library/
├── .icondconfig.mjs      ✅ committed
├── .gitignore            ✅ committed
├── package.json          ✅ committed
├── README.md             ✅ committed
├── svg/                  ✅ committed
│   ├── home.svg
│   ├── user.svg
│   └── settings-16.svg
├── node_modules/         ❌ not committed
├── src/icons/            ❌ not committed (generated)
│   ├── home.icon.ts
│   ├── user.icon.ts
│   ├── settings-16.icon.ts
│   └── index.ts
└── dist/                 ❌ not committed (generated)
    ├── index.js
    ├── index.cjs
    └── index.d.ts
```

---

## Next Steps

- Check out the [main README](./README.md) for more details
- See [Configuration](./README.md#configuration) for all available options
- Report issues on [GitHub](https://github.com/your-repo/icond/issues)

---

## Quick Reference

```bash
# Install
npm install --save-dev icond

# Initialize
npx icond init

# Fetch icons
npm run fetch

# Build library
npm run build

# Publish
npm version patch && npm publish
```
