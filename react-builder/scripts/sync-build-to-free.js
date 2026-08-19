/**
 * Copy react-builder output to the free plugin (local dev / release sync).
 *
 * Usage:
 *   node scripts/sync-build-to-free.js
 *   CAF_BUILD_OUT=free node scripts/sync-build-to-free.js   # from build-free/
 *   CAF_FREE_PLUGIN_PATH="C:/path/to/category-ajax-filter" node scripts/sync-build-to-free.js
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
} = require('./sync-utils');

const PRO_PLUGIN = path.resolve(__dirname, '../..');
const FREE_PLUGIN =
  process.env.CAF_FREE_PLUGIN_PATH ||
  'C:\\xampp\\htdocs\\test-caf-old\\wp-content\\plugins\\category-ajax-filter';

const BUILD_OUT = process.env.CAF_BUILD_OUT === 'free' ? 'build-free' : 'build';
const SOURCE = path.join(PRO_PLUGIN, 'react-builder', BUILD_OUT);
const TARGET = path.join(FREE_PLUGIN, 'react-builder', 'build');
const wooEnabled = isWooSyncEnabled();

console.log(`Syncing ${BUILD_OUT}/ → free plugin`);
console.log(`  From: ${SOURCE}`);
console.log(`  To:   ${TARGET}`);
console.log(`  Woo:  ${wooEnabled ? 'include curated free runtime' : 'exclude'}`);

copyRecursive(SOURCE, TARGET);

const { removedMaps } = stripReleaseSourceMaps(TARGET);
if (removedMaps > 0) {
  console.log(`Removed ${removedMaps} source map file(s) from free build/`);
}

stripProOnlyFromFreeReactBuild(TARGET);

copyAdminStaticAssets(PRO_PLUGIN, FREE_PLUGIN);
syncSharedRuntimeToFree(PRO_PLUGIN, FREE_PLUGIN);
syncWooAssetsToFree(PRO_PLUGIN, FREE_PLUGIN);

console.log('Done.');
