import type { LibraryConfig } from '../config/schema.js';

export function generatePackageJson(config: LibraryConfig): string {
  const packageJson = {
    name: config.name,
    version: config.version,
    description: config.description || `${config.name} - Icon library`,
    type: 'module',
    main: './index.cjs',
    module: './index.js',
    types: './index.d.ts',
    exports: {
      '.': {
        import: './index.js',
        require: './index.cjs',
        types: './index.d.ts',
      },
      './*.icon': {
        import: './*.icon.js',
        require: './*.icon.cjs',
        types: './*.icon.d.ts',
      },
    },
    sideEffects: false,
    files: ['**/*.js', '**/*.cjs', '**/*.d.ts', '**/*.d.cts'],
    keywords: config.keywords || ['icons', 'svg', 'typescript'],
    author: config.author || '',
    license: config.license,
    repository: config.repository
      ? {
          type: 'git',
          url: config.repository,
        }
      : undefined,
  };

  return JSON.stringify(packageJson, null, 2);
}

export function generateReadme(config: LibraryConfig): string {
  return `# ${config.name}

${config.description || 'Icon library generated from Figma'}

## Installation

\`\`\`bash
npm install ${config.name}
# or
pnpm add ${config.name}
# or
yarn add ${config.name}
\`\`\`

## Usage

### Import all icons

\`\`\`typescript
import { iconHome, iconUser, type IconName } from '${config.name}';

// Use the icon data
console.log(iconHome.data); // '<svg>...</svg>'
console.log(iconHome.name); // 'home'
\`\`\`

### Import individual icons (tree-shakable)

\`\`\`typescript
import { iconHome } from '${config.name}/home.icon';
\`\`\`

### Framework Examples

#### React

\`\`\`tsx
import { iconHome } from '${config.name}';

function HomeIcon() {
  return <div dangerouslySetInnerHTML={{ __html: iconHome.data }} />;
}
\`\`\`

#### Vue

\`\`\`vue
<template>
  <div v-html="iconHome.data" />
</template>

<script setup>
import { iconHome } from '${config.name}';
</script>
\`\`\`

#### Vanilla JS

\`\`\`javascript
import { iconHome } from '${config.name}';

document.getElementById('icon').innerHTML = iconHome.data;
\`\`\`

## Type Safety

All icon names are exported as a TypeScript type:

\`\`\`typescript
import type { IconName } from '${config.name}';

const iconName: IconName = 'home'; // ✓ Valid
const invalid: IconName = 'not-exist'; // ✗ Type error
\`\`\`

## Tree Shaking

This library is fully tree-shakable. Only the icons you import will be included in your bundle.

## License

${config.license}
`;
}
