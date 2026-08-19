export const DEFAULT_SHOW_MORE_LABEL = "Show more";
export const DEFAULT_SHOW_LESS_LABEL = "Show less";
export const DEFAULT_TERM_VISIBLE_LIMIT = 10;
export const DEFAULT_SHOW_MORE_COUNT_SEPARATOR = "brackets";

export function formatShowMoreRemainingCount(count, formatSettings = {}) {
  const countStr = String(Number.isFinite(Number(count)) ? Number(count) : 0);
  const separator = String(
    formatSettings.separator ?? DEFAULT_SHOW_MORE_COUNT_SEPARATOR
  ).trim();
  const prefix = String(formatSettings.prefix ?? "");
  const suffix = String(formatSettings.suffix ?? "");

  if (separator === "brackets") {
    return `(${countStr})`;
  }
  if (separator === "hyphen") {
    return `- ${countStr}`;
  }
  if (separator === "custom") {
    return `${prefix}${countStr}${suffix}`;
  }

  return countStr;
}

/**
 * Fill companion Show More settings when the feature is enabled.
 * Mirrors NewModulePopUp defaults — does not invent style (caller seeds style.showmore).
 */
export function ensureTermShowMoreSettingsDefaults(settings = {}) {
  if (!settings || typeof settings !== "object") {
    return settings;
  }
  if (String(settings.term_show_more ?? "false") !== "true") {
    return settings;
  }

  const next = { ...settings };
  const parsedLimit = parseInt(next.term_visible_limit, 10);
  if (!(Number.isFinite(parsedLimit) && parsedLimit > 0)) {
    next.term_visible_limit = String(DEFAULT_TERM_VISIBLE_LIMIT);
  }
  if (!String(next.show_more_label ?? "").trim()) {
    next.show_more_label = DEFAULT_SHOW_MORE_LABEL;
  }
  if (!String(next.show_less_label ?? "").trim()) {
    next.show_less_label = DEFAULT_SHOW_LESS_LABEL;
  }
  if (next.show_more_count == null || next.show_more_count === "") {
    next.show_more_count = "true";
  }
  if (!String(next.show_more_count_separator ?? "").trim()) {
    next.show_more_count_separator = DEFAULT_SHOW_MORE_COUNT_SEPARATOR;
  }
  if (next.show_more_count_prefix == null) {
    next.show_more_count_prefix = "";
  }
  if (next.show_more_count_suffix == null) {
    next.show_more_count_suffix = "";
  }
  return next;
}

export function resolveTermShowMoreSettings(settings = {}) {
  const enabled = String(settings?.term_show_more ?? "false") === "true";
  const parsedLimit = parseInt(settings?.term_visible_limit, 10);
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : DEFAULT_TERM_VISIBLE_LIMIT;

  return {
    enabled,
    limit: enabled ? limit : 0,
    moreLabel: String(settings?.show_more_label ?? DEFAULT_SHOW_MORE_LABEL).trim() || DEFAULT_SHOW_MORE_LABEL,
    lessLabel: String(settings?.show_less_label ?? DEFAULT_SHOW_LESS_LABEL).trim() || DEFAULT_SHOW_LESS_LABEL,
    showRemainingCount: String(settings?.show_more_count ?? "true") !== "false",
    countSeparator:
      String(settings?.show_more_count_separator ?? DEFAULT_SHOW_MORE_COUNT_SEPARATOR).trim() ||
      DEFAULT_SHOW_MORE_COUNT_SEPARATOR,
    countPrefix: String(settings?.show_more_count_prefix ?? ""),
    countSuffix: String(settings?.show_more_count_suffix ?? ""),
  };
}

/** Slots left for non-pinned terms after reserved default/selected pins. */
export function getShowMoreFreeSlots(limit, pinCount) {
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 0;
  const safePins = Math.max(0, Number(pinCount) || 0);
  return Math.max(0, safeLimit - safePins);
}

/**
 * Overflow / collapsed classes for a top-level term.
 *
 * Default/selected (pinned) terms always stay visible and consume Visible Limit slots.
 * Remaining slots go to non-pinned terms in list order.
 *
 * @param {number} nonPinnedIndex Zero-based index among non-pinned terms only
 * @param {number} pinCount Total pinned terms in the same list
 */
export function getShowMoreItemClassName(
  settings,
  nonPinnedIndex,
  isPinned,
  isExpanded,
  pinCount = 0
) {
  const config = resolveTermShowMoreSettings(settings);
  if (!config.enabled || config.limit < 1) {
    return "";
  }
  if (isPinned) {
    return "";
  }

  const freeSlots = getShowMoreFreeSlots(config.limit, pinCount);
  if (nonPinnedIndex < freeSlots) {
    return "";
  }

  return isExpanded ? " caf-term-overflow" : " caf-term-overflow caf-term-collapsed";
}

/**
 * Count terms that sit past the free non-pinned window (Show More needed).
 */
export function countShowMoreOverflowTerms(settings, termItems, isPinnedFn) {
  const config = resolveTermShowMoreSettings(settings);
  if (!config.enabled || config.limit < 1 || !Array.isArray(termItems)) {
    return 0;
  }

  let pinCount = 0;
  termItems.forEach((item) => {
    if (typeof isPinnedFn === "function" && isPinnedFn(item)) {
      pinCount += 1;
    }
  });

  const freeSlots = getShowMoreFreeSlots(config.limit, pinCount);
  let nonPinnedIndex = 0;
  let overflow = 0;

  termItems.forEach((item) => {
    const pinned = typeof isPinnedFn === "function" ? !!isPinnedFn(item) : false;
    if (pinned) {
      return;
    }
    if (nonPinnedIndex >= freeSlots) {
      overflow += 1;
    }
    nonPinnedIndex += 1;
  });

  return overflow;
}

/** @deprecated Prefer countShowMoreOverflowTerms — kept for older call sites. */
export function countHiddenShowMoreTerms(settings, termItems, isPinnedFn, isExpanded) {
  if (isExpanded) {
    return 0;
  }
  return countShowMoreOverflowTerms(settings, termItems, isPinnedFn);
}

export function buildShowMoreButtonParts(settings, isExpanded, hiddenCount) {
  const config = resolveTermShowMoreSettings(settings);
  if (isExpanded) {
    return { label: config.lessLabel, countText: null };
  }
  if (config.showRemainingCount && hiddenCount > 0) {
    return {
      label: config.moreLabel,
      countText: formatShowMoreRemainingCount(hiddenCount, {
        separator: config.countSeparator,
        prefix: config.countPrefix,
        suffix: config.countSuffix,
      }),
    };
  }
  return { label: config.moreLabel, countText: null };
}

export function buildShowMoreButtonLabel(settings, isExpanded, hiddenCount) {
  const { label, countText } = buildShowMoreButtonParts(
    settings,
    isExpanded,
    hiddenCount
  );
  return countText ? `${label} ${countText}` : label;
}
