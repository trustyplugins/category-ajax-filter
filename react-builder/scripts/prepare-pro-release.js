/**
 * Prepare CAF Pro for distribution: strip source maps from shipped assets.
 *
 * Usage:
 *   npm run release:pro
 *   node scripts/prepare-pro-release.js
 */

const path = require('path');
const { stripReleaseSourceMaps } = require('./sync-utils');

const PRO_PLUGIN = path.resolve(__dirname, '../..');

const MAP_STRIP_PATHS = [
  path.join(PRO_PLUGIN, 'react-builder', 'build'),
  path.join(PRO_PLUGIN, 'assets', 'bootstrap-4.5.3-dist'),
];

console.log('Preparing CAF Pro release assets');
console.log(`  Plugin: ${PRO_PLUGIN}`);

let totalRemoved = 0;
let totalRefsCleaned = 0;

for (const targetPath of MAP_STRIP_PATHS) {
  const { removedMaps, cleanedRefs } = stripReleaseSourceMaps(targetPath);
  const relative = path.relative(PRO_PLUGIN, targetPath);
  if (removedMaps > 0) {
    console.log(`  Removed ${removedMaps} .map file(s) from ${relative}`);
  }
  if (cleanedRefs > 0) {
    console.log(
      `  Removed sourceMappingURL from ${cleanedRefs} JS/CSS file(s) in ${relative}`
    );
  }
  totalRemoved += removedMaps;
  totalRefsCleaned += cleanedRefs;
}

if (totalRemoved === 0 && totalRefsCleaned === 0) {
  console.log('  No source maps found (already stripped or build/ missing).');
} else {
  console.log(
    `  Total: ${totalRemoved} source map file(s) removed, ${totalRefsCleaned} sourceMappingURL reference(s) cleaned.`
  );
}

console.log('Done. Run npm run release:pro to stage the upload-ready folder.');
