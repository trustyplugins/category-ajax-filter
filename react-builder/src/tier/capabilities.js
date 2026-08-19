/**
 * Builder tier capabilities — reads from window.tc_caf_ajax (set by PHP).
 */

const DEFAULT_UPGRADE_URL = 'https://trustyplugins.com/category-ajax-filter-pro';

function readAjaxConfig() {
  if (typeof window === 'undefined' || !window.tc_caf_ajax) {
    return {};
  }
  return window.tc_caf_ajax;
}

export function getTier() {
  const cfg = readAjaxConfig();
  return cfg.tier === 'free' ? 'free' : 'pro';
}

export function isProTier() {
  const cfg = readAjaxConfig();
  if (cfg.tier === "free") {
    return false;
  }
  if (cfg.tier === "pro") {
    return true;
  }
  if (cfg.is_pro === true || cfg.is_pro === 1 || cfg.is_pro === "1") {
    return true;
  }
  if (cfg.is_pro === false || cfg.is_pro === 0 || cfg.is_pro === "0") {
    return false;
  }
  return getTier() !== "free";
}

export function getLimits() {
  const cfg = readAjaxConfig();
  return cfg.limits || {};
}

export function getUpgradeUrl() {
  const cfg = readAjaxConfig();
  return cfg.upgrade_url || DEFAULT_UPGRADE_URL;
}

const FILTER_MODULE_KEY_ALIASES = {
  checkbox_filter: "checkbox",
  dropdown_filter: "dropdown",
};

export function normalizeFilterModuleKey(moduleKey) {
  const key = String(moduleKey || "");
  return FILTER_MODULE_KEY_ALIASES[key] || key;
}

const POST_MODULE_KEY_ALIASES = {
  custom_text: "customtext",
  custom_field: "customfield",
};

export function normalizePostModuleKey(moduleKey) {
  const key = String(moduleKey || "");
  return POST_MODULE_KEY_ALIASES[key] || key;
}

/**
 * @param {string} moduleKey
 * @param {{ postType?: string }} [options] Layout post type — Free Range Slider needs `product`.
 */
export function canUseFilterModule(moduleKey, options = {}) {
  const key = normalizeFilterModuleKey(moduleKey);
  if (key.startsWith("woo_") && !canUseProductPostType()) {
    return false;
  }
  if (key === "woo_rating_filter" && !canUseFeature("woo_rating_filter")) {
    return false;
  }
  if (isProTier()) {
    return true;
  }
  // Free Range Slider is Woo `_price` only — require a Product layout (+ Woo).
  if (key === "range_slider") {
    if (!canUseProductPostType()) {
      return false;
    }
    const postType =
      options && options.postType != null ? String(options.postType) : "";
    if (postType && postType !== "product") {
      return false;
    }
  }
  const allowed = getLimits().filter_modules;
  if (!Array.isArray(allowed) || allowed.length === 0) {
    return true;
  }
  return allowed.includes(key);
}

export function canUsePostModule(moduleKey) {
  const key = normalizePostModuleKey(moduleKey);
  if (key.startsWith("woo_") && !canUseProductPostType()) {
    return false;
  }
  if (isProTier()) {
    return true;
  }
  const allowed = getLimits().post_modules;
  if (!Array.isArray(allowed) || allowed.length === 0) {
    return true;
  }
  return allowed.includes(normalizePostModuleKey(moduleKey));
}

export function isWooCommerceActive() {
  const cfg = readAjaxConfig();
  return (
    cfg.woocommerce_active === true ||
    cfg.woocommerce_active === 1 ||
    cfg.woocommerce_active === "1"
  );
}

export function canUseProductPostType() {
  const cfg = readAjaxConfig();
  return (
    cfg.product_post_type_enabled === true ||
    cfg.product_post_type_enabled === 1 ||
    cfg.product_post_type_enabled === "1"
  );
}

export function canUseFeature(featureKey) {
  if (isProTier()) {
    return true;
  }
  const blocked = getLimits().blocked_features;
  if (!Array.isArray(blocked)) {
    return true;
  }
  return !blocked.includes(featureKey);
}

export function canUseGradientColors() {
  return canUseFeature("gradient_colors");
}

export function canUseFilterTermReorder() {
  return canUseFeature("filter_term_reorder");
}

export function getMaxLayouts() {
  if (isProTier()) {
    return Infinity;
  }
  const max = getLimits().max_layouts;
  if (typeof max === 'number' && max < 0) {
    return Infinity;
  }
  return typeof max === 'number' && max >= 0 ? max : Infinity;
}

/** Max revision snapshots stored in session (free: 2, pro: 10). */
export function getMaxStoredBuilderRevisions() {
  if (isProTier()) {
    return getBuilderRevisionDisplayMax();
  }
  const max = getLimits().revision_max;
  if (typeof max === 'number' && max >= 0) {
    return max;
  }
  return 2;
}

/** Total revisions shown in the panel header (pro marketing count). */
export function getBuilderRevisionDisplayMax() {
  const limits = getLimits();
  if (typeof limits.revision_display_max === 'number' && limits.revision_display_max > 0) {
    return limits.revision_display_max;
  }
  return 10;
}

/**
 * @param {string} moduleKey
 * @param {"filter"|"post"} [type]
 * @param {{ postType?: string }} [options]
 */
export function isModuleLocked(moduleKey, type = 'filter', options = {}) {
  if (type === 'post') {
    return !canUsePostModule(moduleKey);
  }
  return !canUseFilterModule(moduleKey, options);
}

export const CAPS = {
  getTier,
  isProTier,
  getLimits,
  getUpgradeUrl,
  normalizeFilterModuleKey,
  normalizePostModuleKey,
  canUseFilterModule,
  canUsePostModule,
  canUseFeature,
  isWooCommerceActive,
  canUseProductPostType,
  getMaxLayouts,
  getMaxStoredBuilderRevisions,
  getBuilderRevisionDisplayMax,
  isModuleLocked,
  canUseGradientColors,
  canUseFilterTermReorder,
};

export default CAPS;
