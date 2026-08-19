/**
 * Stage CAF Pro upload-ready folder (no zip).
 *
 * Usage:
 *   npm run release:pro
 *   node scripts/stage-release-pro.js
 */

const fs = require('fs');
const path = require('path');
const { stagePluginRelease } = require('./stage-plugin-release');

const PRO_PLUGIN = path.resolve(__dirname, '../..');
const MAIN_FILE = path.join(PRO_PLUGIN, 'caf-pro.php');
const BUILD_DIR = path.join(PRO_PLUGIN, 'react-builder', 'build');

if (!fs.existsSync(BUILD_DIR)) {
  console.error('react-builder/build/ not found. Run npm run build or npm run release:pro first.');
  process.exit(1);
}

stagePluginRelease({
  pluginRoot: PRO_PLUGIN,
  mainFile: MAIN_FILE,
  distignorePath: path.join(PRO_PLUGIN, '.distignore'),
  label: 'CAF Pro',
});
