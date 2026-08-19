/**
 * Stage CAF Free DEBUG upload folder (source maps + react-builder/src kept).
 *
 * Output: category-ajax-filter/dist-debug/category-ajax-filter/
 *
 * Usage:
 *   npm run release:free:debug
 *   node scripts/stage-release-free-debug.js
 */

const fs = require('fs');
const path = require('path');
const { stagePluginRelease } = require('./stage-plugin-release');

const FREE_PLUGIN =
  process.env.CAF_FREE_PLUGIN_PATH ||
  'C:\\xampp\\htdocs\\test-caf-old\\wp-content\\plugins\\category-ajax-filter';
const MAIN_FILE = path.join(FREE_PLUGIN, 'category-ajax-filter.php');
const BUILD_DIR = path.join(FREE_PLUGIN, 'react-builder', 'build');
const DISTIGNORE_DEBUG = path.join(FREE_PLUGIN, '.distignore-debug');

if (!fs.existsSync(BUILD_DIR)) {
  console.error(
    'free react-builder/build/ not found. Run npm run release:free:debug (or sync-debug) first.'
  );
  process.exit(1);
}

if (!fs.existsSync(DISTIGNORE_DEBUG)) {
  console.error(`.distignore-debug not found at ${DISTIGNORE_DEBUG}`);
  process.exit(1);
}

stagePluginRelease({
  pluginRoot: FREE_PLUGIN,
  mainFile: MAIN_FILE,
  distignorePath: DISTIGNORE_DEBUG,
  label: 'CAF Free (DEBUG)',
  distDirName: 'dist-debug',
});
