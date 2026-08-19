/**
 * Shared helpers for syncing Pro react-builder output to the free plugin.
 */

const fs = require('fs');
const path = require('path');
const { isWooSyncEnabled } = require('./free-build-replacements');
const { wooRuntimeFiles, sharedRuntimeFiles } = require('./free-sync-manifest');

function copyRecursive(src, dest, { replace = true } = {}) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    process.exit(1);
  }

  if (replace && fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }

  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, { replace: false });
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function stripSourceMaps(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return 0;
  }

  let removed = 0;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.name.endsWith('.map')) {
        fs.unlinkSync(fullPath);
        removed += 1;
      }
    }
  };

  walk(rootDir);
  return removed;
}

function stripSourceMapReferences(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return 0;
  }

  let cleaned = 0;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.name.endsWith('.js') && !entry.name.endsWith('.css')) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const next = content
        .replace(/\n?\/\/#\s*sourceMappingURL=.*$/gm, '')
        .replace(/\n?\/\*#\s*sourceMappingURL=.*?\*\/\s*$/gm, '');

      if (next !== content) {
        fs.writeFileSync(fullPath, next, 'utf8');
        cleaned += 1;
      }
    }
  };

  walk(rootDir);
  return cleaned;
}

function stripReleaseSourceMaps(rootDir) {
  const removedMaps = stripSourceMaps(rootDir);
  const cleanedRefs = stripSourceMapReferences(rootDir);
  return { removedMaps, cleanedRefs };
}

function getAdminStaticAssets(proPlugin, freePlugin) {
  return [
    {
      source: path.join(proPlugin, 'assets', 'unnamed.jpg'),
      target: path.join(freePlugin, 'assets', 'unnamed.jpg'),
      label: 'assets/unnamed.jpg',
    },
    {
      source: path.join(proPlugin, 'assets', 'css', 'dynamic-styles.css'),
      target: path.join(freePlugin, 'assets', 'css', 'dynamic-styles.css'),
      label: 'assets/css/dynamic-styles.css',
    },
    {
      source: path.join(proPlugin, 'admin', 'google-fonts.json'),
      target: path.join(freePlugin, 'admin', 'google-fonts.json'),
      label: 'admin/google-fonts.json',
    },
    {
      source: path.join(proPlugin, 'admin', 'fa-icons'),
      target: path.join(freePlugin, 'admin', 'fa-icons'),
      label: 'admin/fa-icons/',
      recursive: true,
    },
  ];
}

function removeCssRuleBlocks(css, selectorPattern) {
  const re = new RegExp(selectorPattern, 'g');
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = re.exec(css)) !== null) {
    const prevChar = match.index > 0 ? css[match.index - 1] : '';
    if (prevChar && /[a-zA-Z0-9_-]/.test(prevChar)) {
      continue;
    }

    result += css.slice(lastIndex, match.index);

    let braceIndex = match.index + match[0].length;
    while (braceIndex < css.length && css[braceIndex] !== '{') {
      braceIndex += 1;
    }

    if (braceIndex >= css.length) {
      result += css.slice(match.index);
      return result;
    }

    let depth = 0;
    let endIndex = braceIndex;
    for (; endIndex < css.length; endIndex += 1) {
      const char = css[endIndex];
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          endIndex += 1;
          break;
        }
      }
    }

    lastIndex = endIndex;
    re.lastIndex = endIndex;
  }

  result += css.slice(lastIndex);
  return result;
}

function removeCssSectionFromMarker(css, marker, endMarker) {
  const start = css.indexOf(marker);
  if (start === -1) {
    return css;
  }

  if (endMarker) {
    const end = css.indexOf(endMarker, start);
    if (end !== -1) {
      return `${css.slice(0, start).replace(/\s*$/, '')}\n${css.slice(end).replace(/^\s*/, '')}`;
    }
  }

  return `${css.slice(0, start).replace(/\s*$/, '')}\n`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeRulesBySelectorMarkers(css, markers) {
  let next = css;

  for (const marker of markers) {
    const pattern = new RegExp(
      `[^{}]*${escapeRegExp(marker)}[^{}]*\\{[^}]*\\}`,
      'g'
    );
    let prev;
    do {
      prev = next;
      next = next.replace(pattern, '');
    } while (next !== prev);
  }

  return next;
}

function stripProOnlySelectorBlocks(css, selectorPatterns) {
  let next = css;

  for (const pattern of selectorPatterns) {
    let prev;
    do {
      prev = next;
      next = removeCssRuleBlocks(next, pattern);
    } while (next !== prev);
  }

  return next;
}

function stripProOnlyFromDynamicStyles(css) {
  let next = css;
  const includeWoo = isWooSyncEnabled();

  const selectorPatterns = [
    '\\.caf-builder-template-preview-sorting-container',
    '\\.caf-builder-template-preview-result-count-container',
    'ul\\.caf-builder-template-preview-selected-tags-container',
    '\\.caf-builder-template-preview-selected-tags-container',
  ];

  // Range slider CSS is Pro-only unless syncing Woo (Woo price filter needs it).
  if (!includeWoo) {
    selectorPatterns.push(
      '\\.caf-range-slider-output',
      '\\.caf-range-slider-ui\\.ui-slider-horizontal',
      '\\.caf-range-slider-ui\\.ui-slider-vertical',
      '\\.filter-layout-container \\.caf-builder-module-main\\.caf-module-filter \\.caf-range-slider-output\\.toggle_closed'
    );
  }

  next = stripProOnlySelectorBlocks(next, selectorPatterns);

  next = removeCssSectionFromMarker(
    next,
    '/* Floating filter frontend */',
    '.filter-layout-container .caf-builder-module-main.caf-module-filter .caf-terms-list.toggle_closed'
  );

  // Keep the term-tooltip CSS block that follows masonry. Match the full
  // comment opener so we don't strip `/*` and leave a broken CSS comment.
  next = removeCssSectionFromMarker(
    next,
    '/* Masonry grid (row-span) for frontend builder posts */',
    '/* ==========================================================================\n   CAF term label tooltip'
  );

  next = next.replace(
    /\.caf-builder-container \.post-layout-container-inner\.caf-grid\.caf-masonary-enable[\s\S]*?grid-row-end: span var\(--row-span, 1\);\s*\}/g,
    ''
  );

  return `${next.replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

function stripProOnlyFromReactCss(css) {
  let next = css;
  const includeWoo = isWooSyncEnabled();

  const selectorPatterns = [
    '\\.caf_posts_page_category-ajax-filter-pro-builder-analytics',
    '\\.caf-builder-analytics-delete-confirm-modal',
    '\\.caf-builder-analytics__[\\w-]+',
    '\\.caf-builder-analytics(?![\\w-])',
    '\\.caf-builder-template-preview-sorting-container',
    '\\.caf-builder-template-preview-result-count-container',
    'ul\\.caf-builder-template-preview-selected-tags-container',
    '\\.caf-builder-template-preview-selected-tags-container',
    '\\.caf-builder-preview-post-template\\.grid\\.caf-bl-post\\.caf-masonary-enable',
    '\\.caf-builder-container \\.post-layout-container-inner\\.caf-grid\\.caf-masonary-enable',
    '\\.caf-builder-preview-template-container\\.floating',
    '\\.caf-tablet-preview-iframe-body \\.caf-builder-preview-template-container\\.floating',
    '\\.caf-mobile-preview-iframe-body \\.caf-builder-preview-template-container\\.floating',
    '\\.caf-builder-template-preview-filter-floating',
  ];

  if (!includeWoo) {
    selectorPatterns.push(
      '\\.caf-range-slider-output',
      '\\.caf-range-slider-locked-preview',
      '\\.caf-range-slider-ui-wrapper',
      '\\.caf-range-slider-ui(?![\\w-])',
      '\\.caf-range-slider-cf-error-msg'
    );
  }

  next = stripProOnlySelectorBlocks(next, selectorPatterns);

  const markerList = [
    'category-ajax-filter-pro-builder-analytics',
    'caf-builder-analytics',
    'caf-builder-template-preview-sorting-container',
    'caf-builder-template-preview-result-count-container',
    'caf-builder-template-preview-selected-tags-container',
    'caf-masonary-enable',
    'caf-builder-preview-template-container.floating',
    'caf-builder-template-preview-filter-floating',
  ];
  if (!includeWoo) {
    markerList.push('caf-range-slider');
  }

  next = removeRulesBySelectorMarkers(next, markerList);

  next = next
    .replace(/#caf-builder-analytics-root\s*,\s*/g, '')
    .replace(/,\s*#caf-builder-analytics-root/g, '')
    .replace(/#caf-builder-analytics-root\s+/g, '');

  return next;
}

function stripProOnlyFromFreeReactBuild(buildDir) {
  if (!fs.existsSync(buildDir)) {
    return 0;
  }

  let stripped = 0;

  for (const name of ['index.css', 'index-rtl.css']) {
    const filePath = path.join(buildDir, name);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const css = fs.readFileSync(filePath, 'utf8');
    const next = stripProOnlyFromReactCss(css);
    if (next !== css) {
      fs.writeFileSync(filePath, next, 'utf8');
      stripped += 1;
      console.log(`  Stripped Pro-only CSS from react-builder/build/${name}`);
    }
  }

  return stripped;
}

/** @deprecated Use stripProOnlyFromDynamicStyles */
function stripMasonryFromDynamicStyles(css) {
  return stripProOnlyFromDynamicStyles(css);
}

function copyAdminStaticAssets(proPlugin, freePlugin) {
  for (const asset of getAdminStaticAssets(proPlugin, freePlugin)) {
    if (!fs.existsSync(asset.source)) {
      console.warn(`Skipped missing asset: ${asset.label}`);
      continue;
    }

    if (asset.recursive) {
      copyRecursive(asset.source, asset.target);
    } else if (asset.label === 'assets/css/dynamic-styles.css') {
      fs.mkdirSync(path.dirname(asset.target), { recursive: true });
      const css = fs.readFileSync(asset.source, 'utf8');
      fs.writeFileSync(asset.target, stripProOnlyFromDynamicStyles(css), 'utf8');
    } else {
      fs.mkdirSync(path.dirname(asset.target), { recursive: true });
      fs.copyFileSync(asset.source, asset.target);
    }

    console.log(`Copied ${asset.label}`);
  }
}

/**
 * Copy curated files from react-builder/scripts/free-plugin into the Free plugin.
 *
 * @param {string}   proPlugin
 * @param {string}   freePlugin
 * @param {string[]} relativePaths
 * @param {string}   label
 * @returns {number} Files copied
 */
function copyCuratedFreeRuntimeFiles(proPlugin, freePlugin, relativePaths, label) {
  if (!Array.isArray(relativePaths) || relativePaths.length === 0) {
    return 0;
  }

  const sourceRoot = path.join(
    proPlugin,
    'react-builder',
    'scripts',
    'free-plugin'
  );

  console.log(`${label} → copying curated free runtime`);
  for (const relativePath of relativePaths) {
    const source = path.join(sourceRoot, relativePath);
    const target = path.join(freePlugin, relativePath);
    if (!fs.existsSync(source)) {
      throw new Error(`Curated free runtime source missing: ${source}`);
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    console.log(`  Copied ${relativePath}`);
  }

  return relativePaths.length;
}

/**
 * Sync shared Free+Pro runtime (Elementor widget, etc.). Always runs.
 */
function syncSharedRuntimeToFree(proPlugin, freePlugin) {
  return (
    copyCuratedFreeRuntimeFiles(
      proPlugin,
      freePlugin,
      sharedRuntimeFiles,
      'Shared runtime sync'
    ) > 0
  );
}

/**
 * Sync the curated free WooCommerce runtime.
 *
 * Never copy Pro includes/woocommerce wholesale: that directory contains
 * premium implementations which must not ship in the free plugin.
 */
function syncWooAssetsToFree(proPlugin, freePlugin) {
  if (!isWooSyncEnabled()) {
    console.log('Woo sync skipped (CAF_BUILD_WOO=0).');
    return false;
  }

  return (
    copyCuratedFreeRuntimeFiles(
      proPlugin,
      freePlugin,
      wooRuntimeFiles,
      'Woo sync enabled'
    ) > 0
  );
}

function removeIfExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  console.log(`Removed ${label}`);
}

module.exports = {
  copyRecursive,
  stripSourceMaps,
  stripSourceMapReferences,
  stripReleaseSourceMaps,
  stripMasonryFromDynamicStyles,
  stripProOnlyFromDynamicStyles,
  stripProOnlyFromReactCss,
  stripProOnlyFromFreeReactBuild,
  copyAdminStaticAssets,
  syncSharedRuntimeToFree,
  syncWooAssetsToFree,
  isWooSyncEnabled,
  removeIfExists,
};
