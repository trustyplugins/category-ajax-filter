/**
 * Smoke-check Free react-builder/build for Guideline 5 regressions.
 *
 * Usage (from Pro react-builder/):
 *   npm run smoke:free
 *
 * Expects Free plugin build synced (npm run build:free) unless CAF_FREE_BUILD is set.
 */
const fs = require('fs');
const path = require('path');

const freePluginRoot =
  process.env.CAF_FREE_PLUGIN_PATH ||
  'C:\\xampp\\htdocs\\test-caf-old\\wp-content\\plugins\\category-ajax-filter';

const freeBuildDir =
  process.env.CAF_FREE_BUILD ||
  path.join(freePluginRoot, 'react-builder', 'build');

/** Strings that must NOT appear in Free JS (Pro implementation leak). */
const BANNED = [
  'detectFontFamilyFromFile',
  'fetchCustomFonts',
  'Number of terms visible before Show more',
  'Please Select the icon',
  'Remove as default term',
  '["single","gradient"]',
];

/** Strings that SHOULD appear (lock chrome / Free stubs still wired). */
const REQUIRED = [
  'caf-term-default-star is-disabled',
  'Plugin settings and custom fonts',
  'Limit which posts can appear',
];

function listJsFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.js'))
    .map((name) => path.join(dir, name));
}

function fileContains(filePath, needle) {
  const text = fs.readFileSync(filePath, 'utf8');
  return text.includes(needle);
}

function anyFileContains(files, needle) {
  return files.some((file) => fileContains(file, needle));
}

const files = listJsFiles(freeBuildDir);
if (files.length === 0) {
  console.error(
    `smoke:free FAIL — no JS in ${freeBuildDir}\nRun npm run build:free first.`
  );
  process.exit(1);
}

let failed = false;

console.log(`smoke:free — scanning ${files.length} file(s) in:`);
console.log(`  ${freeBuildDir}`);
console.log('');

BANNED.forEach((needle) => {
  if (anyFileContains(files, needle)) {
    console.error(`  FAIL banned present: ${needle}`);
    failed = true;
  } else {
    console.log(`  OK  banned absent: ${needle}`);
  }
});

REQUIRED.forEach((needle) => {
  if (!anyFileContains(files, needle)) {
    console.error(`  FAIL required missing: ${needle}`);
    failed = true;
  } else {
    console.log(`  OK  required present: ${needle}`);
  }
});

console.log('');
if (failed) {
  console.error('smoke:free FAILED — Free bundle may reintroduce Pro trialware.');
  process.exit(1);
}

console.log('smoke:free PASSED');
