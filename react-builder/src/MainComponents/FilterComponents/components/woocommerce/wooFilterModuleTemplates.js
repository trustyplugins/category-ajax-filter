export const RATING_DISPLAY_STARS = "stars";
export const RATING_DISPLAY_PICKER = "star_picker";
/** @deprecated Kept for saved layouts that still store "text"; normalized to stars. */
export const RATING_DISPLAY_TEXT = "text";

export const WOO_RATING_STAR_COUNT_MIN = 3;
export const WOO_RATING_STAR_COUNT_MAX = 10;
export const WOO_RATING_STAR_COUNT_DEFAULT = 5;

export const WOO_RATING_LIST_BASE_CLASS = "caf-woo-rating";
export const WOO_RATING_ITEM_CLASS = "caf-woo-rating-item";
export const WOO_RATING_INPUT_CLASS = "caf-rating-input";
export const WOO_RATING_FILTER_TYPE = "rating";

export const WOO_FILTER_MODULE_KEYS = ["woo_rating_filter"];

export function isWooFilterModuleKey(moduleKey) {
  return WOO_FILTER_MODULE_KEYS.includes(String(moduleKey || ""));
}

export function isWooRatingFilterModule(moduleKey) {
  return String(moduleKey || "") === "woo_rating_filter";
}

/** Modules whose Design tab uses the `isMeta` style-section binding. */
const FILTER_MODULE_META_STYLE_TAB_KEYS = new Set([
  "checkbox_filter",
  "dropdown_filter",
  "search",
  "range_slider",
  "woo_rating_filter",
  "woo_attribute_swatch",
  "reset",
]);

const FILTER_MODULE_BOX_SHADOW_META_TAB_KEYS = new Set([
  "checkbox_filter",
  "dropdown_filter",
  "range_slider",
  "woo_rating_filter",
  "woo_attribute_swatch",
  "reset",
]);

const FILTER_MODULE_ALIGN_META_TAB_KEYS = new Set([
  "checkbox_filter",
  "woo_attribute_swatch",
  "woo_rating_filter",
]);

/**
 * @param {"default"|"boxShadow"|"align"} binding
 */
export function shouldBindFilterModuleMetaStyleTab(
  moduleKey,
  type,
  isMeta,
  binding = "default"
) {
  if (type !== "module" || isMeta === undefined || isMeta === "") {
    return false;
  }
  const key = String(moduleKey || "");
  const sets = {
    default: FILTER_MODULE_META_STYLE_TAB_KEYS,
    boxShadow: FILTER_MODULE_BOX_SHADOW_META_TAB_KEYS,
    align: FILTER_MODULE_ALIGN_META_TAB_KEYS,
  };
  return (sets[binding] || sets.default).has(key);
}

export const WOO_RATING_STAR_COLOR_EMPTY = "rgb(220, 220, 220)";
export const WOO_RATING_STAR_COLOR_ACTIVE = "rgb(255, 183, 0)";

export const WOO_FILTER_DESIGN_CONFIG = {
  woo_rating_filter: {
    hideCheckboxControls: true,
    hideIconControls: true,
    hideCountControls: true,
    starsDesignTab: true,
    defaultStarIconColor: WOO_RATING_STAR_COLOR_EMPTY,
  },
};

export function getWooFilterDesignConfig(moduleKey) {
  return WOO_FILTER_DESIGN_CONFIG[String(moduleKey || "")] || null;
}

export const getRatingDisplayMode = (settings) => {
  const mode = String(settings?.rating_display || RATING_DISPLAY_STARS);
  // Legacy text list → stars-only list.
  if (mode === RATING_DISPLAY_TEXT) {
    return RATING_DISPLAY_STARS;
  }
  if (mode === RATING_DISPLAY_PICKER) {
    return RATING_DISPLAY_PICKER;
  }
  return RATING_DISPLAY_STARS;
};

export const isRatingDisplayStars = (settings) =>
  getRatingDisplayMode(settings) === RATING_DISPLAY_STARS;

export const isRatingDisplayPicker = (settings) =>
  getRatingDisplayMode(settings) === RATING_DISPLAY_PICKER;

export function getWooRatingListClass(settings) {
  const base = WOO_RATING_LIST_BASE_CLASS;
  if (isRatingDisplayPicker(settings)) {
    return `${base} ${base}--picker`;
  }
  return `${base} ${base}--stars`;
}

/** Both layouts use Design tab Stars/icon styles. */
export const usesRatingStarStyles = (settings) => {
  const mode = getRatingDisplayMode(settings);
  return mode === RATING_DISPLAY_STARS || mode === RATING_DISPLAY_PICKER;
};

export function clampWooRatingStarCount(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) {
    return WOO_RATING_STAR_COUNT_DEFAULT;
  }
  return Math.min(
    WOO_RATING_STAR_COUNT_MAX,
    Math.max(WOO_RATING_STAR_COUNT_MIN, n)
  );
}

export function getWooRatingStarCount(settings) {
  if (
    settings?.star_count !== undefined &&
    settings?.star_count !== null &&
    settings?.star_count !== ""
  ) {
    return clampWooRatingStarCount(settings.star_count);
  }
  // Legacy: derive from highest enabled woo_options value when present.
  if (Array.isArray(settings?.woo_options) && settings.woo_options.length) {
    const maxEnabled = settings.woo_options.reduce((max, option) => {
      if (String(option?.enabled ?? "true") === "false") {
        return max;
      }
      const n = parseInt(option?.value, 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    if (maxEnabled > 0) {
      return clampWooRatingStarCount(maxEnabled);
    }
  }
  return WOO_RATING_STAR_COUNT_DEFAULT;
}

function getWooRatingOptionLabel(value) {
  const n = Number(value);
  return n === 1 ? "1 Star" : `${value} Stars`;
}

export function buildWooRatingOptionsFromCount(count) {
  const starCount = clampWooRatingStarCount(count);
  const options = [];
  for (let i = starCount; i >= 1; i -= 1) {
    options.push({
      value: String(i),
      label: getWooRatingOptionLabel(i),
      enabled: "true",
    });
  }
  return options;
}

/** @deprecated Prefer buildWooRatingOptionsFromCount / getWooRatingStarCount. */
export const DEFAULT_WOO_RATING_OPTIONS = buildWooRatingOptionsFromCount(
  WOO_RATING_STAR_COUNT_DEFAULT
);

export function getWooRatingIconStyleDefaults() {
  return {
    desktop: {
      default: { fontSize: "18px", color: WOO_RATING_STAR_COLOR_EMPTY },
      hover: { color: WOO_RATING_STAR_COLOR_ACTIVE },
      selected: { color: WOO_RATING_STAR_COLOR_ACTIVE },
    },
    tablet: { default: {}, hover: {}, selected: {} },
    mobile: { default: {}, hover: {}, selected: {} },
  };
}

const WOO_RATING_META_SHARED = {
  height: "auto",
  position: "relative",
  paddingTop: "0px",
  paddingRight: "0",
  paddingBottom: "0",
  paddingLeft: "0",
  marginTop: "0",
  marginRight: "0",
  marginBottom: "0",
  marginLeft: "0",
  backgroundColor: "rgba(255,255,255,0)",
  float: "none",
  flexWrap: "nowrap",
  boxShadow: "0px 0px 0px 0px  #333333",
};

export function getWooRatingMetaLayoutDefaults(displayMode) {
  if (displayMode === RATING_DISPLAY_PICKER) {
    return {
      ...WOO_RATING_META_SHARED,
      display: "flex",
      flexFlow: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "4px",
      width: "auto",
    };
  }

  return {
    ...WOO_RATING_META_SHARED,
    display: "flex",
    flexFlow: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: "8px",
    width: "100%",
  };
}

export function getWooRatingMeta1LayoutDefaults(displayMode) {
  const shared = {
    width: "auto",
    height: "auto",
    position: "relative",
    paddingTop: "0px",
    paddingRight: "0",
    paddingBottom: "0",
    paddingLeft: "0",
    marginTop: "0",
    marginRight: "0",
    marginBottom: "0",
    marginLeft: "0",
    backgroundColor: "rgba(255,255,255,0)",
    fontFamily: "DM Sans",
    fontSize: "16px",
    color: "rgb(3,3,3)",
    display: "flex",
    flexFlow: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "0px",
    float: "none",
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
    borderBottomLeftRadius: "0px",
    borderBottomRightRadius: "0px",
    borderTopWidth: "0px",
    borderRightWidth: "0px",
    borderBottomWidth: "0px",
    borderLeftWidth: "0px",
    borderTopStyle: "none",
    borderRightStyle: "none",
    borderBottomStyle: "none",
    borderLeftStyle: "none",
    borderTopColor: "rgba(255,255,255,0)",
    borderRightColor: "rgba(255,255,255,0)",
    borderBottomColor: "rgba(255,255,255,0)",
    borderLeftColor: "rgba(255,255,255,0)",
    boxShadow: "0px 0px 0px 0px  #333333",
    cursor: "pointer",
  };

  if (displayMode === RATING_DISPLAY_PICKER) {
    return {
      ...shared,
      display: "inline-flex",
      justifyContent: "center",
    };
  }

  return shared;
}

/**
 * Apply layout + star color defaults when display mode is stars list vs star picker.
 */
export function getWooRatingMeta2LayoutDefaults() {
  return {
    display: "flex",
    flexFlow: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "0.15em",
    float: "none",
  };
}

export function applyWooRatingDisplayStyleDefaults(moduleStyle, displayMode) {
  if (!moduleStyle || typeof moduleStyle !== "object") {
    return;
  }

  const mode =
    displayMode === RATING_DISPLAY_PICKER
      ? RATING_DISPLAY_PICKER
      : RATING_DISPLAY_STARS;
  const metaDefault = getWooRatingMetaLayoutDefaults(mode);
  const meta1Default = getWooRatingMeta1LayoutDefaults(mode);
  const meta2Default = getWooRatingMeta2LayoutDefaults();
  const iconDefaults = getWooRatingIconStyleDefaults();

  if (!moduleStyle.meta) {
    moduleStyle.meta = {};
  }
  if (!moduleStyle.meta.desktop) {
    moduleStyle.meta.desktop = {};
  }
  moduleStyle.meta.desktop.default = {
    ...(moduleStyle.meta.desktop.default || {}),
    ...metaDefault,
  };

  if (!moduleStyle.meta1) {
    moduleStyle.meta1 = {};
  }
  if (!moduleStyle.meta1.desktop) {
    moduleStyle.meta1.desktop = {};
  }
  moduleStyle.meta1.desktop.default = {
    ...(moduleStyle.meta1.desktop.default || {}),
    ...meta1Default,
  };

  if (!moduleStyle.meta2) {
    moduleStyle.meta2 = {};
  }
  if (!moduleStyle.meta2.desktop) {
    moduleStyle.meta2.desktop = {};
  }
  moduleStyle.meta2.desktop.default = {
    ...(moduleStyle.meta2.desktop.default || {}),
    ...meta2Default,
  };

  moduleStyle.icon = {
    ...(moduleStyle.icon || {}),
    desktop: {
      ...(moduleStyle.icon?.desktop || {}),
      default: {
        ...(moduleStyle.icon?.desktop?.default || {}),
        ...iconDefaults.desktop.default,
      },
      hover: {
        ...(moduleStyle.icon?.desktop?.hover || {}),
        ...iconDefaults.desktop.hover,
      },
      selected: {
        ...(moduleStyle.icon?.desktop?.selected || {}),
        ...iconDefaults.desktop.selected,
      },
    },
    tablet: {
      ...(moduleStyle.icon?.tablet || {}),
      ...iconDefaults.tablet,
    },
    mobile: {
      ...(moduleStyle.icon?.mobile || {}),
      ...iconDefaults.mobile,
    },
  };
}

export const getEnabledWooRatingOptions = (settings) => {
  const starCount = getWooRatingStarCount(settings);
  if (isRatingDisplayPicker(settings)) {
    return Array.from({ length: starCount }, (_, index) => {
      const value = index + 1;
      return {
        value: String(value),
        label: getWooRatingOptionLabel(value),
        enabled: "true",
      };
    });
  }
  return buildWooRatingOptionsFromCount(starCount);
};

export const WOO_FILTER_DATA_SOURCES = {
  woo_rating_filter: "woo_rating",
};

export const RATING_COMPARE_GTE = ">=";
export const RATING_COMPARE_LTE = "<=";
export const RATING_COMPARE_EQ = "=";
export const RATING_COMPARE_DEFAULT = RATING_COMPARE_GTE;

export const RATING_COMPARE_OPTIONS = [
  { value: RATING_COMPARE_GTE, label: "Greater than or equals (>=)" },
  { value: RATING_COMPARE_LTE, label: "Less than or equals (<=)" },
  { value: RATING_COMPARE_EQ, label: "Equals (=)" },
];

export function normalizeRatingCompare(value) {
  const compare = String(value || "").trim();
  if (compare === RATING_COMPARE_LTE || compare === RATING_COMPARE_EQ) {
    return compare;
  }
  return RATING_COMPARE_DEFAULT;
}

export function getRatingCompare(settings) {
  return normalizeRatingCompare(settings?.rating_compare);
}

/**
 * Optional default rating (empty string when unset).
 * Valid range: 1 … Number of Stars.
 */
export function normalizeRatingDefaultValue(value, starCount) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) {
    return "";
  }
  const max = clampWooRatingStarCount(starCount);
  if (n < 1) {
    return "";
  }
  return String(Math.min(max, n));
}

export function getRatingDefaultValue(settings) {
  return normalizeRatingDefaultValue(
    settings?.default_value,
    getWooRatingStarCount(settings)
  );
}

export const WOO_FILTER_META = {
  woo_rating_filter: {
    key: "_wc_average_rating",
    compare: RATING_COMPARE_DEFAULT,
    type: "DECIMAL",
  },
};
