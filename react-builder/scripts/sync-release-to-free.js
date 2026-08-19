/**
 * WP.org release prep: copy free-tier react-builder bundle + static assets.
 *
 * Requires build-free/ (run `npm run build:free` or `npm run release:free` first).
 *
 * Minified JS source maps are stripped to reduce plugin size. WP.org guideline #4
 * allows this when human-readable source is linked in readme.txt (see free plugin).
 *
 * Usage:
 *   npm run release:free
 *   node scripts/sync-release-to-free.js
 */

const path = require('path');
const {
  copyRecursive,
  stripReleaseSourceMaps,
  stripProOnlyFromFreeReactBuild,
  copyAdminStaticAssets,
  syncSharedRuntimeToFree,
  syncWooAssetsToFree,
  isWooSyncEnabled,
  removeIfExists,
} = require('./sync-utils');

const PRO_PLUGIN = path.resolve(__dirname, '../..');
const FREE_PLUGIN =
  process.env.CAF_FREE_PLUGIN_PATH ||
  'C:\\xampp\\htdocs\\test-caf-old\\wp-content\\plugins\\category-ajax-filter';

const REACT_ROOT = path.join(PRO_PLUGIN, 'react-builder');
const FREE_REACT = path.join(FREE_PLUGIN, 'react-builder');
const SOURCE = path.join(REACT_ROOT, 'build-free');
const TARGET = path.join(FREE_REACT, 'build');
const wooEnabled = isWooSyncEnabled();

console.log('Syncing free-tier release assets → free plugin');
console.log(`  Free plugin: ${FREE_PLUGIN}`);
console.log(`  From: ${SOURCE}`);
console.log(`  To:   ${TARGET}`);
console.log(`  Woo:  ${wooEnabled ? 'include curated free runtime' : 'exclude'}`);

copyRecursive(SOURCE, TARGET);

const { removedMaps, cleanedRefs } = stripReleaseSourceMaps(TARGET);
if (removedMaps > 0) {
  console.log(`  Removed ${removedMaps} .map file(s) from free react-builder/build/`);
}
if (cleanedRefs > 0) {
  console.log(`  Removed sourceMappingURL from ${cleanedRefs} JS/CSS file(s)`);
}

stripProOnlyFromFreeReactBuild(TARGET);

const bootstrapStrip = stripReleaseSourceMaps(
  path.join(FREE_PLUGIN, 'assets', 'bootstrap-4.5.3-dist')
);
if (bootstrapStrip.removedMaps > 0) {
  console.log(
    `  Removed ${bootstrapStrip.removedMaps} .map file(s) from free bootstrap assets`
  );
}

removeIfExists(path.join(FREE_REACT, 'src'), 'react-builder/src/ (not shipped in free release)');
removeIfExists(path.join(FREE_REACT, 'package.json'), 'react-builder/package.json');

copyAdminStaticAssets(PRO_PLUGIN, FREE_PLUGIN);
syncSharedRuntimeToFree(PRO_PLUGIN, FREE_PLUGIN);
syncWooAssetsToFree(PRO_PLUGIN, FREE_PLUGIN);

// Free ships a local import library (no remote API). Durable source: scripts/free-plugin/import-library/.
const freePluginImportLibrary = path.join(__dirname, 'free-plugin', 'import-library');
const freeImportLibraryTarget = path.join(FREE_PLUGIN, 'import-library');
if (require('fs').existsSync(freePluginImportLibrary)) {
  copyRecursive(freePluginImportLibrary, freeImportLibraryTarget);
  console.log('  Copied import-library/ (local Free templates, no remote API)');
} else {
  console.warn('  WARN: scripts/free-plugin/import-library/ missing — Free library may be empty');
}

console.log('Done. (build-free/ → free react-builder/build/, source maps stripped, readme links to GitHub)');
