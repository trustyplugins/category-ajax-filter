/**
 * Free debug release sync: copy free-tier bundle + KEEP source maps + copy React src.
 *
 * For support/diagnostics only — not for WP.org or customer installs.
 *
 * Usage:
 *   npm run release:free:debug
 *   node scripts/sync-debug-release-to-free.js
 */

const path = require('path');
const {
  copyRecursive,
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
const SRC_SOURCE = path.join(REACT_ROOT, 'src');
const SRC_TARGET = path.join(FREE_REACT, 'src');
const wooEnabled = isWooSyncEnabled();

console.log('Syncing FREE DEBUG release assets → free plugin');
console.log(`  Free plugin: ${FREE_PLUGIN}`);
console.log(`  From: ${SOURCE}`);
console.log(`  To:   ${TARGET}`);
console.log('  Source maps: KEEP');
console.log('  react-builder/src: COPY from Pro');
console.log(`  Woo:  ${wooEnabled ? 'include curated free runtime' : 'exclude'}`);

copyRecursive(SOURCE, TARGET);
stripProOnlyFromFreeReactBuild(TARGET);

copyRecursive(SRC_SOURCE, SRC_TARGET);
console.log(`  Copied react-builder/src → ${SRC_TARGET}`);

copyAdminStaticAssets(PRO_PLUGIN, FREE_PLUGIN);
syncSharedRuntimeToFree(PRO_PLUGIN, FREE_PLUGIN);
syncWooAssetsToFree(PRO_PLUGIN, FREE_PLUGIN);

const freePluginImportLibrary = path.join(__dirname, 'free-plugin', 'import-library');
const freeImportLibraryTarget = path.join(FREE_PLUGIN, 'import-library');
if (require('fs').existsSync(freePluginImportLibrary)) {
  copyRecursive(freePluginImportLibrary, freeImportLibraryTarget);
  console.log('  Copied import-library/ (local Free templates, no remote API)');
}

console.log('Done. (debug: maps + src kept; do not ship to WP.org)');
