/**
 * Stage CAF Free upload-ready folder (no zip).
 *
 * Run after sync-release-to-free.js so react-builder/build/ is up to date.
 *
 * Usage:
 *   npm run release:free
 *   node scripts/stage-release-free.js
 */

const fs = require('fs');
const path = require('path');
const { stagePluginRelease } = require('./stage-plugin-release');

const FREE_PLUGIN =
  process.env.CAF_FREE_PLUGIN_PATH ||
  'C:\\xampp\\htdocs\\test-caf-old\\wp-content\\plugins\\category-ajax-filter';

const MAIN_FILE = path.join(FREE_PLUGIN, 'category-ajax-filter.php');
const DISTIGNORE = path.join(FREE_PLUGIN, '.distignore');
const BUILD_DIR = path.join(FREE_PLUGIN, 'react-builder', 'build');

if (!fs.existsSync(FREE_PLUGIN)) {
  console.error(`Free plugin not found: ${FREE_PLUGIN}`);
  console.error('Set CAF_FREE_PLUGIN_PATH if your free plugin lives elsewhere.');
  process.exit(1);
}

if (!fs.existsSync(MAIN_FILE)) {
  console.error(`Free main file not found: ${MAIN_FILE}`);
  process.exit(1);
}

if (!fs.existsSync(BUILD_DIR)) {
  console.error('free react-builder/build/ not found.');
  console.error('Run npm run release:free first (builds free bundle + syncs to free plugin).');
  process.exit(1);
}

if (!fs.existsSync(DISTIGNORE)) {
  console.error(`Free .distignore not found: ${DISTIGNORE}`);
  process.exit(1);
}

stagePluginRelease({
  pluginRoot: FREE_PLUGIN,
  mainFile: MAIN_FILE,
  distignorePath: DISTIGNORE,
  label: 'CAF Free',
});
