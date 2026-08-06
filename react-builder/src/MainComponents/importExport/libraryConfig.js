/**
 * UI-only config for the import library (tabs, card classes, template normalization).
 * Template payloads and previews come from the remote API via WP AJAX.
 */

import libraryPreviewFallback from "../images/import-library-checkbox-preview.png";

export const FULL_FILTER_LIBRARY_CARD_CLASS =
  "caf-import-template-card--full-filter";

export const FULL_FILTER_LAYOUT_LIBRARY_CARD_CLASS =
  "caf-import-template-card--full-filter-layout";

export const SINGLE_POST_ITEM_LIBRARY_CARD_CLASS =
  "caf-import-template-card--single-post-item";

export const LAYOUT_SETTINGS_PAGINATION_LIBRARY_CARD_CLASS =
  "caf-import-template-card--layout-settings-pagination";

export const LAYOUT_SETTINGS_SELECTED_LIBRARY_CARD_CLASS =
  "caf-import-template-card--layout-settings-selected";

export const LAYOUT_SETTINGS_RESULT_COUNT_LIBRARY_CARD_CLASS =
  "caf-import-template-card--layout-settings-result-count";

export const LAYOUT_SETTINGS_SORTING_LIBRARY_CARD_CLASS =
  "caf-import-template-card--layout-settings-sorting";

export const FILTER_LIBRARY_TABS = [
  { key: "full_filter", label: "Full Filter" },
  { key: "checkbox_filter", label: "Checkbox" },
  { key: "dropdown_filter", label: "Dropdown" },
  { key: "range_slider", label: "Range Slider" },
  { key: "search", label: "Search" },
  { key: "reset", label: "Reset" },
];

export const LAYOUT_SETTINGS_LIBRARY_TABS = [
  { key: "pagination", label: "Pagination" },
  { key: "selected", label: "Selected", tier: "pro" },
  { key: "result_count", label: "Result Count", tier: "pro" },
  { key: "sorting", label: "Sorting", tier: "pro" },
];

const PRO_LAYOUT_SETTINGS_TAB_KEYS = new Set([
  "selected",
  "result_count",
  "sorting",
]);

export const LIBRARY_PREVIEW_FALLBACK = libraryPreviewFallback;

/**
 * Whether a template row normally displays a thumbnail card.
 *
 * @param {object} item Template row.
 * @returns {boolean}
 */
export const templateUsesPreviewThumbnail = (item) => {
  if (!item || typeof item !== "object") {
    return false;
  }

  if (item.section === "full_filter_layout" || item.section === "single_post_item") {
    return true;
  }

  if (item.section === "filter" && item.filterLibraryTab !== "range_slider") {
    return true;
  }

  if (
    item.section === "layout_settings" &&
    item.layoutSettingsLibraryTab === "pagination"
  ) {
    return true;
  }

  return false;
};

/**
 * @param {object} template Library template from API.
 * @returns {string}
 */
export const resolveLibraryCardClass = (template) => {
  if (!template || typeof template !== "object") {
    return "";
  }

  const section = template.section;
  const filterTab = template.filterLibraryTab;
  const layoutTab = template.layoutSettingsLibraryTab;

  if (section === "filter" && filterTab === "full_filter") {
    return FULL_FILTER_LIBRARY_CARD_CLASS;
  }

  if (section === "full_filter_layout") {
    return FULL_FILTER_LAYOUT_LIBRARY_CARD_CLASS;
  }

  if (section === "single_post_item") {
    return SINGLE_POST_ITEM_LIBRARY_CARD_CLASS;
  }

  if (section === "layout_settings") {
    if (layoutTab === "pagination") {
      return LAYOUT_SETTINGS_PAGINATION_LIBRARY_CARD_CLASS;
    }
    if (layoutTab === "selected") {
      return LAYOUT_SETTINGS_SELECTED_LIBRARY_CARD_CLASS;
    }
    if (layoutTab === "result_count") {
      return LAYOUT_SETTINGS_RESULT_COUNT_LIBRARY_CARD_CLASS;
    }
    if (layoutTab === "sorting") {
      return LAYOUT_SETTINGS_SORTING_LIBRARY_CARD_CLASS;
    }
  }

  return "";
};

/**
 * Normalize API template rows for the import library grid.
 *
 * @param {object} item Raw template from AJAX/API.
 * @returns {object}
 */
export const normalizeLibraryTemplate = (item) => {
  const previewCardLayout =
    item.previewCardLayout === true ||
    (item.section === "filter" && item.filterLibraryTab === "range_slider") ||
    (item.section === "layout_settings" &&
      PRO_LAYOUT_SETTINGS_TAB_KEYS.has(item.layoutSettingsLibraryTab));

  let previewImage = item.previewImage || item.preview || null;

  if (!previewImage && templateUsesPreviewThumbnail(item)) {
    previewImage = LIBRARY_PREVIEW_FALLBACK;
  }

  let tier = item.tier;
  if (!tier) {
    if (
      item.section === "layout_settings" &&
      PRO_LAYOUT_SETTINGS_TAB_KEYS.has(item.layoutSettingsLibraryTab)
    ) {
      tier = "pro";
    }
  }

  return {
    ...item,
    previewImage,
    previewCardLayout,
    tier,
    libraryCardClass: item.libraryCardClass || resolveLibraryCardClass(item),
  };
};
