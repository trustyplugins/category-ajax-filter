/**
 * Minimal .distignore parser for release zip builds.
 */

const fs = require('fs');
const path = require('path');

function parseDistignore(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

function shouldExclude(relativePath, patterns) {
  const normalized = relativePath.replace(/\\/g, '/');
  const baseName = path.posix.basename(normalized);

  return patterns.some((pattern) => {
    if (pattern.includes('*')) {
      if (pattern.startsWith('*.')) {
        const suffix = pattern.slice(1);
        return normalized.endsWith(suffix) || baseName.endsWith(suffix);
      }

      const regex = new RegExp(
        `^${pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*\*/g, '§§')
          .replace(/\*/g, '[^/]*')
          .replace(/§§/g, '.*')}$`
      );
      return regex.test(normalized);
    }

    if (pattern.endsWith('/')) {
      const dir = pattern.slice(0, -1);
      return normalized === dir || normalized.startsWith(`${dir}/`);
    }

    return (
      normalized === pattern ||
      normalized.startsWith(`${pattern}/`) ||
      normalized.endsWith(`/${pattern}`)
    );
  });
}

module.exports = {
  parseDistignore,
  shouldExclude,
};
