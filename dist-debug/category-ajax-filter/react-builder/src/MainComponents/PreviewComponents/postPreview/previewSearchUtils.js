import { getPreviewSmartMatchedTermsCount } from "./previewSmartFilterSearch";

/** Root selector for filter area inside layout preview. */
export const PREVIEW_FILTER_SEARCH_ROOT =
  ".caf-builder-template-preview-filter";

const SEARCH_OUTPUT_SELECTOR = `${PREVIEW_FILTER_SEARCH_ROOT} .caf-filter-module-search-output`;

/**
 * @param {Element | null | undefined} el
 * @returns {Element | null}
 */
export const getSearchModuleOutput = (el) => {
  if (!el?.closest) {
    return null;
  }
  return el.closest(SEARCH_OUTPUT_SELECTOR);
};

/**
 * @param {Element | null | undefined} moduleOutput
 * @returns {"typing"|"enter_icon"}
 */
export const getSearchTrigger = (moduleOutput) => {
  const raw =
    moduleOutput?.getAttribute("data-search-trigger") ||
    moduleOutput?.getAttribute("trigger-type") ||
    "enter_icon";
  return raw === "typing" ? "typing" : "enter_icon";
};

/**
 * @param {Element | null | undefined} moduleOutput
 * @returns {{ enabled: boolean, limit: number }}
 */
export const getCharLimitSettings = (moduleOutput) => {
  const enabled =
    moduleOutput?.getAttribute("data-char-limit-enabled") === "true";
  const limit = parseInt(moduleOutput?.getAttribute("data-char-limit") || "0", 10);
  return {
    enabled,
    limit: Number.isFinite(limit) ? limit : 0,
  };
};

/**
 * @param {Element | null | undefined} moduleOutput
 * @returns {string}
 */
export const getRawSearchInput = (moduleOutput) => {
  const input = moduleOutput?.querySelector?.("input.input-field");
  return String(input?.value || "").trim();
};

/**
 * True when min-characters is on and input has text but is shorter than the limit.
 *
 * @param {Element | null | undefined} moduleOutput
 * @returns {boolean}
 */
export const isBlockedByMinCharLimit = (moduleOutput) => {
  const raw = getRawSearchInput(moduleOutput);
  if (!raw) {
    return false;
  }
  const { enabled, limit } = getCharLimitSettings(moduleOutput);
  return enabled && limit > 0 && raw.length < limit;
};

/**
 * Whether Enter / icon / typing should refresh posts (layout preview).
 * - Min characters on: no query while 0 < length < limit
 * - typing + Enter + empty → no query (live search still refreshes on cleared input via debounce)
 * - enter_icon + empty → no query
 * - Meets min or limit off → query allowed
 *
 * @param {Element | null | undefined} moduleOutput
 * @param {{ viaEnter?: boolean }} [options]
 * @returns {boolean}
 */
export const shouldSubmitPreviewSearch = (moduleOutput, options = {}) => {
  const viaEnter = options.viaEnter === true;
  if (!moduleOutput) {
    return true;
  }
  if (isBlockedByMinCharLimit(moduleOutput)) {
    return false;
  }
  const raw = getRawSearchInput(moduleOutput);
  const trigger = getSearchTrigger(moduleOutput);
  if (trigger === "typing") {
    if (viaEnter) {
      return raw !== "";
    }
    return true;
  }
  return raw !== "";
};

/**
 * Keyword for selected-tags chip (empty when below min).
 *
 * @param {Element | null | undefined} moduleOutput
 * @returns {string}
 */
export const getCommittedSearchKeywordForTags = (moduleOutput) => {
  const raw = getRawSearchInput(moduleOutput);
  if (!raw || isBlockedByMinCharLimit(moduleOutput)) {
    return "";
  }
  return raw;
};

/**
 * Persist committed keyword on DOM for enter/icon trigger (tags must not follow live typing).
 *
 * @param {Element | null | undefined} moduleOutput
 * @returns {string}
 */
export const commitSearchKeywordToDom = (moduleOutput) => {
  if (!moduleOutput) {
    return "";
  }
  const keyword = getCommittedSearchKeywordForTags(moduleOutput);
  const trigger = getSearchTrigger(moduleOutput);
  if (trigger === "enter_icon") {
    moduleOutput.setAttribute("data-committed-search-keyword", keyword);
  } else {
    moduleOutput.removeAttribute("data-committed-search-keyword");
  }
  return keyword;
};

/**
 * Keyword shown in layout-preview selected tags (respects trigger + min characters).
 *
 * @param {Element | null | undefined} moduleOutput
 * @returns {string}
 */
export const getSearchKeywordForSelectedTags = (moduleOutput) => {
  if (!moduleOutput) {
    return "";
  }
  const trigger = getSearchTrigger(moduleOutput);
  if (trigger === "enter_icon") {
    return String(
      moduleOutput.getAttribute("data-committed-search-keyword") || ""
    ).trim();
  }
  return getCommittedSearchKeywordForTags(moduleOutput);
};

/**
 * Keyword sent with preview post queries (respects trigger + min characters).
 *
 * @param {Element | null | undefined} moduleOutput
 * @returns {string}
 */
export const getSearchKeywordForQuery = (moduleOutput) => {
  if (!moduleOutput) {
    return "";
  }
  const trigger = getSearchTrigger(moduleOutput);
  if (trigger === "enter_icon") {
    const committed = String(
      moduleOutput.getAttribute("data-committed-search-keyword") || ""
    ).trim();
    if (!committed) {
      return "";
    }
    const { enabled, limit } = getCharLimitSettings(moduleOutput);
    if (enabled && limit > 0 && committed.length < limit) {
      return "";
    }
    return committed;
  }
  return getSearchKeywordFromOutput(moduleOutput);
};

/**
 * Clear committed search keyword (reset / tag close).
 *
 * @param {Element | null | undefined} moduleOutput
 */
export const clearCommittedSearchKeywordOnDom = (moduleOutput) => {
  moduleOutput?.removeAttribute?.("data-committed-search-keyword");
};

/**
 * Mirrors CAFQueryBuilder.getSearchKeyword — empty when below min length.
 *
 * @param {Element | null | undefined} moduleOutput
 * @returns {string}
 */
export const getSearchKeywordFromOutput = (moduleOutput) => {
  const raw = getRawSearchInput(moduleOutput);
  if (!raw) {
    return "";
  }

  const { enabled, limit } = getCharLimitSettings(moduleOutput);
  if (enabled && limit > 0 && raw.length < limit) {
    return "";
  }
  return raw;
};

/**
 * @param {Document} scopeDocument
 * @returns {string}
 */
export const resolvePreviewSearchKeywordFromDom = (scopeDocument) => {
  const outputs = scopeDocument.querySelectorAll(SEARCH_OUTPUT_SELECTOR);
  const parts = [];
  outputs.forEach((output) => {
    const keyword = getSearchKeywordForQuery(output);
    if (keyword) {
      parts.push(keyword);
    }
  });
  return parts.join(" ");
};

/**
 * @param {string} rawKeyword
 * @param {{ enabled: boolean, limit: number }} charLimit
 * @returns {boolean}
 */
export const isBelowCharLimit = (rawKeyword, charLimit) => {
  const trimmed = String(rawKeyword || "").trim();
  if (!trimmed) {
    return false;
  }
  if (!charLimit.enabled || charLimit.limit <= 0) {
    return false;
  }
  return trimmed.length < charLimit.limit;
};

/**
 * @param {object} settings ModuleSearch settings object
 * @param {string} value Trimmed input value
 * @returns {boolean}
 */
const attrTruthy = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value) === "true";
};

/**
 * Mirrors CAFQueryBuilder.getSearchModuleSettings — reads search module data attrs from DOM.
 *
 * @param {Element | null | undefined} moduleOutput
 * @returns {{
 *   keywordEnabled: boolean,
 *   smartEnabled: boolean,
 *   searchTrigger: "typing"|"enter_icon",
 *   charLimitEnabled: boolean,
 *   charLimit: number,
 *   source: { everything: boolean, title: boolean, descriptions: boolean, custom_field: boolean },
 *   customField: string
 * }}
 */
export const getSearchModuleSettingsFromOutput = (moduleOutput) => {
  const defaults = {
    keywordEnabled: true,
    smartEnabled: true,
    searchTrigger: "enter_icon",
    charLimitEnabled: false,
    charLimit: 0,
    source: {
      everything: true,
      title: false,
      descriptions: false,
      custom_field: false,
    },
    customField: "",
  };

  if (!moduleOutput) {
    return defaults;
  }

  return {
    keywordEnabled: attrTruthy(
      moduleOutput.getAttribute("data-keyword-search-enabled"),
      true
    ),
    smartEnabled: attrTruthy(
      moduleOutput.getAttribute("data-smart-search-enabled"),
      true
    ),
    searchTrigger: getSearchTrigger(moduleOutput),
    charLimitEnabled: attrTruthy(
      moduleOutput.getAttribute("data-char-limit-enabled"),
      false
    ),
    charLimit:
      parseInt(moduleOutput.getAttribute("data-char-limit") || "0", 10) || 0,
    source: {
      everything: attrTruthy(
        moduleOutput.getAttribute("data-search-source-everything"),
        false
      ),
      title: attrTruthy(
        moduleOutput.getAttribute("data-search-source-title"),
        false
      ),
      descriptions: attrTruthy(
        moduleOutput.getAttribute("data-search-source-descriptions"),
        false
      ),
      custom_field: attrTruthy(
        moduleOutput.getAttribute("data-search-source-custom-field"),
        false
      ),
    },
    customField: String(
      moduleOutput.getAttribute("data-search-custom-field") || ""
    ),
  };
};

/**
 * First search module in layout preview (matches live builder behavior).
 *
 * @param {Document} scopeDocument
 */
export const resolvePreviewSearchSettingsFromDom = (scopeDocument) => {
  const moduleOutput = scopeDocument.querySelector(SEARCH_OUTPUT_SELECTOR);
  return getSearchModuleSettingsFromOutput(moduleOutput);
};

/**
 * Build WP_Query search args for preview (keyword source + custom field).
 *
 * @param {Document} scopeDocument
 * @returns {{ s?: string, caf_search_keyword?: string, caf_search_source?: object, caf_search_custom_field?: string }}
 */
export const resolvePreviewSearchQueryFromDom = (scopeDocument) => {
  const keyword = resolvePreviewSearchKeywordFromDom(scopeDocument);
  if (!keyword) {
    return {};
  }

  const settings = resolvePreviewSearchSettingsFromDom(scopeDocument);

  if (getPreviewSmartMatchedTermsCount(scopeDocument) > 0) {
    return {};
  }

  const allowKeywordSearch =
    settings.keywordEnabled || settings.smartEnabled;

  const query = { s: keyword };

  if (!allowKeywordSearch) {
    return query;
  }

  query.caf_search_keyword = keyword;
  query.caf_search_source = {
    everything: settings.source.everything ? "true" : "false",
    title: settings.source.title ? "true" : "false",
    descriptions: settings.source.descriptions ? "true" : "false",
    custom_field: settings.source.custom_field ? "true" : "false",
  };

  if (settings.source.custom_field && settings.customField) {
    query.caf_search_custom_field = settings.customField;
  }

  return query;
};

export const meetsMinCharLimitFromSettings = (settings, value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return true;
  }
  if (settings?.char_limit?.is_enable !== "true") {
    return true;
  }
  const limit = parseInt(settings?.char_limit?.limit || "0", 10);
  if (!Number.isFinite(limit) || limit <= 0) {
    return true;
  }
  return trimmed.length >= limit;
};
