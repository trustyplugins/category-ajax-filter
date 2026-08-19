/**
 * Stage a WordPress-upload-ready plugin folder (no zip).
 * Zip the output folder manually when uploading to WordPress.
 */

const fs = require('fs');
const path = require('path');
const { parseDistignore, shouldExclude } = require('./distignore');

/**
 * @param {string} mainFile
 * @returns {string}
 */
function getPluginVersion(mainFile) {
  if (!fs.existsSync(mainFile)) {
    return '0.0.0';
  }

  const header = fs.readFileSync(mainFile, 'utf8');
  const match = header.match(/^Version:\s*(.+)$/m);

  return match ? match[1].trim() : '0.0.0';
}

/**
 * @param {string} srcRoot
 * @param {string} destRoot
 * @param {string} pluginRoot
 * @param {string[]} patterns
 */
function copyReleaseTree(srcRoot, destRoot, pluginRoot, patterns) {
  for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    const srcPath = path.join(srcRoot, entry.name);
    const relativePath = path.relative(pluginRoot, srcPath).replace(/\\/g, '/');

    if (shouldExclude(relativePath, patterns)) {
      continue;
    }

    const destPath = path.join(destRoot, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyReleaseTree(srcPath, destPath, pluginRoot, patterns);
      continue;
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
}

/**
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getDirectorySize(dir) {
  let total = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += getDirectorySize(fullPath);
      continue;
    }
    total += fs.statSync(fullPath).size;
  }

  return total;
}

/**
 * @param {object} options
 * @param {string} options.pluginRoot
 * @param {string} options.mainFile
 * @param {string} options.distignorePath
 * @param {string} [options.label]
 * @param {string} [options.distDirName='dist'] Folder under plugin root for staged output
 * @param {string} [options.outputSlug] Folder name inside dist (defaults to plugin basename)
 * @returns {string} Staged folder path.
 */
function stagePluginRelease({
  pluginRoot,
  mainFile,
  distignorePath,
  label,
  distDirName = 'dist',
  outputSlug,
}) {
  const pluginSlug = path.basename(pluginRoot);
  const folderName = outputSlug || pluginSlug;
  const patterns = parseDistignore(distignorePath);
  const version = getPluginVersion(mainFile);
  const distDir = path.join(pluginRoot, distDirName);
  const outputDir = path.join(distDir, folderName);

  console.log(`Staging ${label || pluginSlug} for release`);
  console.log(`  Source plugin: ${pluginRoot}`);
  console.log(`  Version: ${version}`);
  console.log(`  Output folder: ${outputDir}`);

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  fs.mkdirSync(outputDir, { recursive: true });
  copyReleaseTree(pluginRoot, outputDir, pluginRoot, patterns);

  const size = getDirectorySize(outputDir);
  console.log(`Staged ${outputDir} (${formatBytes(size)})`);
  console.log('');
  console.log('Manual zip for WordPress upload:');
  console.log(`  1. Open: ${distDir}`);
  console.log(`  2. Right-click the "${folderName}" folder → Compress to ZIP`);
  console.log('  3. Plugins → Add New → Upload Plugin');
  console.log('');
  console.log('Important: the zip must contain the plugin folder at the top level,');
  console.log(`not loose files. Structure: ${folderName}/main-plugin-file.php`);

  return outputDir;
}

module.exports = {
  stagePluginRelease,
  getPluginVersion,
};
