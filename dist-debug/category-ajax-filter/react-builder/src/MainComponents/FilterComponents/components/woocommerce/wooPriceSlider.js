import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";

export const WOO_PRICE_META_KEY = "_price";
export const WOO_PRICE_URL_PARAM = "price";

export const WOO_LENGTH_META_KEY = "_length";
export const WOO_WIDTH_META_KEY = "_width";
export const WOO_HEIGHT_META_KEY = "_height";
export const WOO_WEIGHT_META_KEY = "_weight";

/** Pro-only Woo shipping meta for range slider (same settings pattern as price). */
export const WOO_DIMENSION_META_KEYS = [
  WOO_LENGTH_META_KEY,
  WOO_WIDTH_META_KEY,
  WOO_HEIGHT_META_KEY,
  WOO_WEIGHT_META_KEY,
];

export const WOO_DIMENSION_META_OPTIONS = [
  { label: "Length (_length)", value: WOO_LENGTH_META_KEY },
  { label: "Width (_width)", value: WOO_WIDTH_META_KEY },
  { label: "Height (_height)", value: WOO_HEIGHT_META_KEY },
  { label: "Weight (_weight)", value: WOO_WEIGHT_META_KEY },
];

export const decodeHtmlEntities = (value) => {
  const raw = String(value ?? "");
  if (!raw) {
    return "";
  }

  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = raw;
    return textarea.value;
  }

  return raw
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'");
};

const normalizeCustomFieldData = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};

export const resolveRangeSliderMetaKey = (settings) => {
  const rows = normalizeCustomFieldData(settings?.custom_field_data);
  const first = rows[0];
  const key = String(first?.custom_field_key || "").trim();
  return key && key !== "0" ? key : "";
};

export const isWooPriceMetaKey = (metaKey) =>
  String(metaKey || "").trim() === WOO_PRICE_META_KEY;

export const isWooDimensionMetaKey = (metaKey) =>
  WOO_DIMENSION_META_KEYS.includes(String(metaKey || "").trim());

export const isWooAllowlistedRangeMetaKey = (metaKey) =>
  isWooPriceMetaKey(metaKey) || isWooDimensionMetaKey(metaKey);

export const isWooPriceRangeSlider = (settings, postType = "") =>
  String(postType || "") === "product" &&
  isWooPriceMetaKey(resolveRangeSliderMetaKey(settings));

export const isWooDimensionRangeSlider = (settings, postType = "") =>
  String(postType || "") === "product" &&
  isWooDimensionMetaKey(resolveRangeSliderMetaKey(settings));

export const ensureWooPriceFieldRow = (row = {}) => ({
  ...row,
  custom_field_key: WOO_PRICE_META_KEY,
  custom_field_value_list: Array.isArray(row.custom_field_value_list)
    ? row.custom_field_value_list
    : [],
  compare_operator: "BETWEEN",
  meta_type: "NUMERIC",
});

export const ensureWooDimensionFieldRow = (row = {}, metaKey = "") => {
  const key = String(metaKey || "").trim();
  return {
    ...row,
    custom_field_key: isWooDimensionMetaKey(key) ? key : WOO_LENGTH_META_KEY,
    custom_field_value_list: Array.isArray(row.custom_field_value_list)
      ? row.custom_field_value_list
      : [],
    compare_operator: "BETWEEN",
    meta_type: "NUMERIC",
  };
};

/**
 * Apply min/max + prefix (currency or unit) — same range_slider settings as price.
 * Auto-seed only when bounds were not manually customized (unless force=true).
 */
export const applyWooAllowlistedRangeBounds = (
  settings,
  metaKey,
  { min = 0, max = 100, unit = "", force = false } = {}
) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }

  const key = String(metaKey || "").trim();
  const safeMin = Number.isFinite(Number(min)) ? Number(min) : 0;
  const safeMax = Number.isFinite(Number(max)) ? Number(max) : 100;
  const safeUnit = decodeHtmlEntities(String(unit || ""));

  const rows = normalizeCustomFieldData(settings.custom_field_data);
  if (isWooPriceMetaKey(key)) {
    settings.custom_field_data = [ensureWooPriceFieldRow(rows[0] || {})];
  } else if (isWooDimensionMetaKey(key)) {
    settings.custom_field_data = [
      ensureWooDimensionFieldRow(rows[0] || {}, key),
    ];
  }
  settings.data_source = "custom_field";

  const range = { ...(settings.range_slider || {}) };
  const isManual = String(range.bounds_manual) === "true";

  if (force || !isManual) {
    range.min = safeMin;
    range.max = safeMax > 0 ? safeMax : 100;
    range.bounds_manual = "false";
  }

  if (!Number.isFinite(Number(range.step)) || Number(range.step) <= 0) {
    range.step = 1;
  }
  range.type = range.type === "single" ? "single" : "double";
  if (safeUnit) {
    const hasEnable = range.prefix && Object.prototype.hasOwnProperty.call(range.prefix, "is_enable");
    const prefixOn = String(range.prefix?.is_enable) === "true";
    const prefixOff =
      String(range.prefix?.is_enable) === "false" ||
      range.prefix?.is_enable === false;
    const prefixValue = String(range.prefix?.value || "").trim();

    if (!hasEnable) {
      // Unset → seed currency/unit once.
      range.prefix = {
        ...(range.prefix || {}),
        is_enable: "true",
        value: safeUnit,
      };
    } else if (prefixOff) {
      // Respect explicit disable.
      range.prefix = {
        ...(range.prefix || {}),
        is_enable: "false",
      };
    } else if (prefixOn && (!prefixValue || prefixValue === "Prefix")) {
      range.prefix = {
        ...(range.prefix || {}),
        is_enable: "true",
        value: safeUnit,
      };
    }
  }
  settings.range_slider = range;

  return settings;
};

export const applyWooPriceRangeBounds = (
  settings,
  { min = 0, max = 100, currency = "$" } = {}
) =>
  applyWooAllowlistedRangeBounds(settings, WOO_PRICE_META_KEY, {
    min,
    max,
    unit: currency,
  });

export const applyWooDimensionRangeBounds = (
  settings,
  metaKey,
  { min = 0, max = 100, unit = "" } = {}
) => applyWooAllowlistedRangeBounds(settings, metaKey, { min, max, unit });

export async function fetchWooProductPriceRange() {
  // Catalog auto-detect removed — static defaults only.
  return {
    min: 0,
    max: 100,
    currency: "$",
  };
}

export async function fetchWooProductMetaRange(metaKey) {
  const key = String(metaKey || "").trim();
  if (!isWooAllowlistedRangeMetaKey(key)) {
    return null;
  }
  // Catalog auto-detect removed — static defaults only.
  return {
    min: 0,
    max: 100,
    unit: isWooPriceMetaKey(key) ? "$" : "",
    meta_key: key,
  };
}
