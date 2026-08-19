# Rebuild the CAF Free admin builder

This plugin zip ships minified JavaScript in `react-builder/build/`.
Human-readable source is in `react-builder/src/`. Build tools are in this folder
(`package.json`, `webpack.config.js`, `scripts/`).

## Requirements

- Node.js 18 or later
- npm

## Rebuild the Free-tier bundle

```bash
cd react-builder
npm install
npx cross-env CAF_BUILD_FREE=1 npx wp-scripts build
```

Output: `react-builder/build-free/`

`CAF_BUILD_FREE=1` applies `scripts/free-build-replacements.js` so Pro-only
modules are not compiled into the Free admin bundle.

The WordPress.org plugin package contains only the compiled files under
`react-builder/build/`, not this source tree.
