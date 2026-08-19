/**
 * Prepare CAF Pro DEBUG release: keep source maps (do not strip).
 *
 * Usage:
 *   npm run release:pro:debug
 *   node scripts/prepare-pro-debug-release.js
 */

const fs = require('fs');
const path = require('path');

const PRO_PLUGIN = path.resolve(__dirname, '../..');
const BUILD_DIR = path.join(PRO_PLUGIN, 'react-builder', 'build');
const SRC_DIR = path.join(PRO_PLUGIN, 'react-builder', 'src');

console.log('Preparing CAF Pro DEBUG release assets');
console.log(`  Plugin: ${PRO_PLUGIN}`);
console.log('  Source maps: KEEP (not stripped)');
console.log('  react-builder/src: included via .distignore-debug');

if (!fs.existsSync(BUILD_DIR)) {
  console.error('react-builder/build/ not found. Run wp-scripts build first.');
  process.exit(1);
}

if (!fs.existsSync(SRC_DIR)) {
  console.error('react-builder/src/ not found.');
  process.exit(1);
}

const mapCount = countMaps(BUILD_DIR);
console.log(`  Found ${mapCount} .map file(s) under react-builder/build/`);
if (mapCount === 0) {
  console.warn(
    '  Warning: no source maps found. Rebuild with GENERATE_SOURCEMAP=true (wp-scripts default).'
  );
}

console.log('Done.');

function countMaps(rootDir) {
  let n = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.map')) {
        n += 1;
      }
    }
  };
  walk(rootDir);
  return n;
}
