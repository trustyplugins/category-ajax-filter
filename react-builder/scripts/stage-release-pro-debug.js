/**
 * Stage CAF Pro DEBUG upload folder (source maps + react-builder/src kept).
 *
 * Output: category-ajax-filter-pro/dist-debug/category-ajax-filter-pro/
 *
 * Usage:
 *   npm run release:pro:debug
 *   node scripts/stage-release-pro-debug.js
 */

const fs = require('fs');
const path = require('path');
const { stagePluginRelease } = require('./stage-plugin-release');

const PRO_PLUGIN = path.resolve(__dirname, '../..');
const MAIN_FILE = path.join(PRO_PLUGIN, 'caf-pro.php');
const BUILD_DIR = path.join(PRO_PLUGIN, 'react-builder', 'build');
const DISTIGNORE_DEBUG = path.join(PRO_PLUGIN, '.distignore-debug');

if (!fs.existsSync(BUILD_DIR)) {
  console.error('react-builder/build/ not found. Run npm run release:pro:debug first.');
  process.exit(1);
}

if (!fs.existsSync(DISTIGNORE_DEBUG)) {
  console.error(`.distignore-debug not found at ${DISTIGNORE_DEBUG}`);
  process.exit(1);
}

stagePluginRelease({
  pluginRoot: PRO_PLUGIN,
  mainFile: MAIN_FILE,
  distignorePath: DISTIGNORE_DEBUG,
  label: 'CAF Pro (DEBUG)',
  distDirName: 'dist-debug',
});
