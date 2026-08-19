/**
 * One-time helper content inserted into functions.js
 * Run: node scripts/apply-hover-css-refactor.js
 */
module.exports = {
  helpersBlock: `
const isStyleLayerEmpty = (layer) =>
  !layer || typeof layer !== "object" || Object.keys(layer).length === 0;

const isDefaultStyleState = (state) => state === "default";
const isPlaceholderStyleState = (state) => state === "placeholder";

const shouldSkipStyleValue = (value) =>
  value === "" || value === null || value === undefined;

/**
 * Ordered style layers for CSS output.
 * Default merges breakpoints; hover/selected/placeholder emit explicit overrides only.
 */
export const getStyleLayers = (style, device, state) => {
  if (!style || !device || !state) {
    return [];
  }

  const layers = [];

  if (device === "desktop") {
    if (isDefaultStyleState(state)) {
      layers.push(style.desktop?.default);
    } else if (isPlaceholderStyleState(state)) {
      layers.push(style.desktop?.placeholder);
    } else {
      layers.push(style.desktop?.[state]);
    }
  } else if (device === "tablet" || device === "mobile") {
    if (isDefaultStyleState(state)) {
      layers.push(style.desktop?.default);
      layers.push(style[device]?.default);
    } else if (isPlaceholderStyleState(state)) {
      layers.push(style.desktop?.placeholder);
      layers.push(style[device]?.placeholder);
    } else {
      layers.push(style.desktop?.[state]);
      layers.push(style[device]?.[state]);
    }
  }

  return layers.filter((layer) => !isStyleLayerEmpty(layer));
};

const appendBackgroundImageRule = (
  styleArr,
  item,
  value,
  { settings = null, postData = null, imageUrl = null, backgroundImageMode = "auto" } = {}
) => {
  const property = CamelToSnake(item);
  styleArr = removeDuplicateProperty(styleArr, property);

  if (backgroundImageMode === "url-wrap") {
    styleArr.push(property + ":url(" + value + ");");
    return styleArr;
  }

  const imageSource =
    settings?.background_image === "post-img"
      ? postData?.image || imageUrl
      : value;
  styleArr.push(property + ":url(" + imageSource + ");");
  return styleArr;
};

const appendStandardStyleLayer = (styleArr, layer, options = {}) => {
  const {
    settings = null,
    postData = null,
    imageUrl = null,
    includeKeys = null,
    excludeKeys = [],
    includeStyleKeys = null,
    propertyFilter = null,
    valueFormatter = null,
    backgroundImageMode = "auto",
    onPropertyApplied = null,
  } = options;

  if (isStyleLayerEmpty(layer)) {
    return styleArr;
  }

  Object.keys(layer).forEach((item) => {
    if (includeKeys && !includeKeys.includes(item)) {
      return;
    }
    if (includeStyleKeys && !includeStyleKeys.includes(item)) {
      return;
    }
    if (excludeKeys.includes(item)) {
      return;
    }

    const value = layer[item];
    if (shouldSkipStyleValue(value)) {
      return;
    }

    const property = CamelToSnake(item);
    if (propertyFilter && !propertyFilter(property, item, value)) {
      return;
    }

    styleArr = removeDuplicateProperty(styleArr, property);

    if (item === "backgroundImage") {
      styleArr = appendBackgroundImageRule(styleArr, item, value, {
        settings,
        postData,
        imageUrl,
        backgroundImageMode,
      });
    } else {
      const formattedValue = valueFormatter
        ? valueFormatter(property, item, value)
        : value;
      styleArr.push(property + ":" + formattedValue + ";");
    }

    if (typeof onPropertyApplied === "function") {
      styleArr = onPropertyApplied(styleArr, property, item, value) || styleArr;
    }
  });

  return styleArr;
};

const buildStyleArrayFromLayers = (style, device, state, options = {}) => {
  let styleArr = [];
  getStyleLayers(style, device, state).forEach((layer) => {
    styleArr = appendStandardStyleLayer(styleArr, layer, options);
  });
  return styleArr;
};

const buildSkinStyleFromLayers = (style, device, state) => {
  let styleObj = {};
  getStyleLayers(style, device, state).forEach((layer) => {
    Object.keys(layer).forEach((item) => {
      if (item === "backgroundImage" || shouldSkipStyleValue(layer[item])) {
        return;
      }
      styleObj = removeDuplicateSkinCss(styleObj, item);
      styleObj[item] = layer[item];
    });
  });
  return styleObj;
};
`,
};
