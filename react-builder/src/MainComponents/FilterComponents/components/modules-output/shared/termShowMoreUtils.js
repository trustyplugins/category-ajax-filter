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

export function getShowMoreItemClassName(settings, termIndex, isPinned, isExpanded) {
  const config = resolveTermShowMoreSettings(settings);
  if (!config.enabled || config.limit < 1 || isPinned || termIndex < config.limit) {
    return "";
  }

  return isExpanded ? " caf-term-overflow" : " caf-term-overflow caf-term-collapsed";
}

export function countHiddenShowMoreTerms(settings, termItems, isPinnedFn, isExpanded) {
  const config = resolveTermShowMoreSettings(settings);
  if (!config.enabled || config.limit < 1 || isExpanded) {
    return 0;
  }

  let hidden = 0;
  let termIndex = 0;

  termItems.forEach((item) => {
    const pinned = typeof isPinnedFn === "function" ? isPinnedFn(item) : false;
    if (!pinned && termIndex >= config.limit) {
      hidden += 1;
    }
    if (!pinned) {
      termIndex += 1;
    }
  });

  return hidden;
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
