/**
 * Quick sanity check: all functions imported across the builder exist and are callable.
 */
const path = require("path");

const functionsPath = path.join(
  __dirname,
  "..",
  "src",
  "MainComponents",
  "utils",
  "functions.js"
);

// Babel-register is not available; verify exports exist in source instead.
const source = require("fs").readFileSync(functionsPath, "utf8");

const requiredExports = [
  "CamelToSnake",
  "removeDuplicateProperty",
  "getStyleLayers",
  "generateCSS",
  "generateImageModuleCSS",
  "generateImageModuleTagCSS",
  "generateFilterCSS",
  "generateFilterFocusCSS",
  "generateFilterLabelCSS",
  "generateFilterLabelInnerCSS",
  "generateFilterPlaceholderCSS",
  "getMetaStyle",
  "removeDuplicateSkinCss",
  "generateSkinCSS",
  "generateContainerCSS",
  "generateHeaderCSS",
  "generateMetaCSS",
  "getFilterMetaStyle",
  "generateSkinWrapperCSS",
  "generateFilterRowColCSS",
  "generateFilterWrapperPreviewCSS",
  "generatePostPreviewCSS",
  "generateMiscContainerCSS",
  "generatePreviewSingleCSS",
  "generateGridLayoutCSS",
  "generateLoaderContainerCSS",
  "generatePostPreviewElementCSS",
  "generateLinkParentCSS",
  "validateTerm",
];

const missing = requiredExports.filter(
  (name) => !new RegExp(`export const ${name}\\b`).test(source)
);

if (missing.length) {
  console.error("Missing exports:", missing.join(", "));
  process.exit(1);
}

console.log("All", requiredExports.length, "required exports present.");
