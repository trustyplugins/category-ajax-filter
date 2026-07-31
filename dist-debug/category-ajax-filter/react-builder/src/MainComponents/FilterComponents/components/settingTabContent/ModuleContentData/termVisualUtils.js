export const TERM_VISUAL_TEXT = "text";
export const TERM_VISUAL_ICON = "icon";
export const TERM_VISUAL_COLOR = "color";
export const DEFAULT_SWATCH_COLOR = "#ffffff";
export const DEFAULT_TERM_ICON = "fas fa-tag";

/** Color swatch settings/UI are Woo product layouts only. */
export const canUseColorSwatchFeatures = (settingsOrPostType) => {
  const postType =
    typeof settingsOrPostType === "string"
      ? settingsOrPostType
      : settingsOrPostType?.post_type;
  return String(postType || "").trim() === "product";
};

/**
 * Filter modules: Icon vs Color only.
 * Do not teach filters about Attribute Swatch "text" mode.
 */
export const resolveTermVisual = (settingsOrValue) => {
  if (!canUseColorSwatchFeatures(settingsOrValue)) {
    return TERM_VISUAL_ICON;
  }
  const value =
    typeof settingsOrValue === "string"
      ? settingsOrValue
      : settingsOrValue?.term_visual;
  return value === TERM_VISUAL_COLOR ? TERM_VISUAL_COLOR : TERM_VISUAL_ICON;
};

/**
 * Attribute Swatch Display As (Text | Icon/Image | Color) — post module only.
 * Migrates legacy show_icon-only layouts when term_visual is unset.
 */
export const resolveAttributeSwatchDisplayMode = (settings) => {
  const visual = String(settings?.term_visual || "").trim();
  if (visual === TERM_VISUAL_TEXT) {
    return TERM_VISUAL_TEXT;
  }
  if (visual === TERM_VISUAL_COLOR) {
    return TERM_VISUAL_COLOR;
  }
  if (visual === TERM_VISUAL_ICON) {
    return TERM_VISUAL_ICON;
  }
  // Legacy: no term_visual — infer from show_icon.
  return String(settings?.show_icon) === "true"
    ? TERM_VISUAL_ICON
    : TERM_VISUAL_TEXT;
};

export const TERM_LABEL_DISPLAY_SHOW = "show";
export const TERM_LABEL_DISPLAY_HIDE = "hide";
export const TERM_LABEL_DISPLAY_TOOLTIP = "tooltip";

/**
 * Resolve term label display for color swatches.
 * Legacy hide_term_label "true" maps to tooltip (old hide also set title=).
 */
export const resolveTermLabelDisplay = (settings) => {
  const raw = String(settings?.term_label_display ?? "")
    .trim()
    .toLowerCase();
  if (
    raw === TERM_LABEL_DISPLAY_SHOW ||
    raw === TERM_LABEL_DISPLAY_HIDE ||
    raw === TERM_LABEL_DISPLAY_TOOLTIP
  ) {
    return raw;
  }
  if (String(settings?.hide_term_label ?? "false") === "true") {
    return TERM_LABEL_DISPLAY_TOOLTIP;
  }
  return TERM_LABEL_DISPLAY_SHOW;
};

/** Persist term_label_display and keep hide_term_label in sync for legacy readers. */
export const applyTermLabelDisplay = (settings, mode) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }
  const next = { ...settings };
  const resolved =
    mode === TERM_LABEL_DISPLAY_HIDE || mode === TERM_LABEL_DISPLAY_TOOLTIP
      ? mode
      : TERM_LABEL_DISPLAY_SHOW;
  next.term_label_display = resolved;
  next.hide_term_label =
    resolved === TERM_LABEL_DISPLAY_SHOW ? "false" : "true";
  return next;
};

/** Sync term_visual + show_icon + hide_term_label for Attribute Swatch Display As. */
export const applyAttributeSwatchDisplayMode = (settings, mode) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }
  const next = { ...settings };
  const resolved =
    mode === TERM_VISUAL_TEXT ||
    mode === TERM_VISUAL_COLOR ||
    mode === TERM_VISUAL_ICON
      ? mode
      : TERM_VISUAL_ICON;

  next.term_visual = resolved;
  // Text = label only; Color = swatch only; Icon/Image = icon only.
  next.show_icon = resolved === TERM_VISUAL_TEXT ? "false" : "true";
  const hideLabel =
    resolved === TERM_VISUAL_COLOR || resolved === TERM_VISUAL_ICON;
  next.hide_term_label = hideLabel ? "true" : "false";
  // Icon/Color keep native title tooltip (previous hide_term_label behavior).
  next.term_label_display = hideLabel
    ? TERM_LABEL_DISPLAY_TOOLTIP
    : TERM_LABEL_DISPLAY_SHOW;
  return next;
};

export const isTermVisualColor = (settingsOrValue) =>
  canUseColorSwatchFeatures(settingsOrValue) &&
  resolveTermVisual(settingsOrValue) === TERM_VISUAL_COLOR;

/** Attribute Swatch only. */
export const isTermVisualText = (settingsOrValue) =>
  resolveAttributeSwatchDisplayMode(
    typeof settingsOrValue === "string"
      ? { term_visual: settingsOrValue }
      : settingsOrValue || {}
  ) === TERM_VISUAL_TEXT;

/** Visible term label is hidden (Hide or Tooltip) in color swatch mode. */
export const shouldHideTermLabel = (settings) =>
  isTermVisualColor(settings) &&
  resolveTermLabelDisplay(settings) !== TERM_LABEL_DISPLAY_SHOW;

/** Label is hidden and shown via native title tooltip on the swatch. */
export const shouldShowTermLabelAsTooltip = (settings) =>
  isTermVisualColor(settings) &&
  resolveTermLabelDisplay(settings) === TERM_LABEL_DISPLAY_TOOLTIP;
export const isValidSwatchColor = (value) => {
  if (typeof value !== "string") return false;
  const color = value.trim();
  if (!color) return false;
  if (color.startsWith("#")) return true;
  if (color.startsWith("rgb")) return true;
  if (color.startsWith("hsl")) return true;
  return false;
};

export const getTermSwatchColor = (icons) => {
  if (!icons || typeof icons !== "object") return "";
  if (typeof icons.color === "string" && isValidSwatchColor(icons.color)) {
    return icons.color.trim();
  }
  if (icons.type === "color" && typeof icons.icon === "string") {
    return isValidSwatchColor(icons.icon) ? icons.icon.trim() : "";
  }
  return "";
};

export const termHasColorSwatch = (icons) => Boolean(getTermSwatchColor(icons));

export const termHasIconVisual = (icons) => {
  if (!icons || typeof icons !== "object") return false;
  if (icons.type === "color") {
    const backup = icons.icon_backup;
    if (!backup) return false;
    const iconValue = backup.icon;
    if (typeof iconValue === "string" && iconValue.trim() !== "") return true;
    if (iconValue && typeof iconValue === "object") {
      if (iconValue.url) return true;
      return Object.keys(iconValue).length > 0;
    }
    return false;
  }
  const iconValue = icons.icon;
  if (typeof iconValue === "string" && iconValue.trim() !== "") {
    return !isValidSwatchColor(iconValue) || icons.type === "icon";
  }
  if (iconValue && typeof iconValue === "object") {
    if (iconValue.url) return true;
    return Object.keys(iconValue).length > 0;
  }
  return false;
};

export const buildColorTermIcons = (prevIcons = {}, color, position = "before") => {
  const prev = prevIcons && typeof prevIcons === "object" ? prevIcons : {};
  const next = {
    ...prev,
    type: "color",
    icon: color,
    color,
    position: position || prev.position || "before",
  };

  if (prev.type && prev.type !== "color" && prev.icon) {
    next.icon_backup = {
      type: prev.type,
      icon: prev.icon,
    };
  } else if (prev.icon_backup) {
    next.icon_backup = prev.icon_backup;
  }

  return next;
};

export const buildIconTermIcons = (prevIcons = {}, iconPayload) => {
  const prev = prevIcons && typeof prevIcons === "object" ? prevIcons : {};
  const preservedColor =
    (typeof prev.color === "string" && prev.color) ||
    (prev.type === "color" && typeof prev.icon === "string" ? prev.icon : "");

  return {
    ...prev,
    ...iconPayload,
    ...(preservedColor ? { color: preservedColor } : {}),
  };
};

export const buildDefaultIconTermIcons = (
  prevIcons = {},
  icon = DEFAULT_TERM_ICON,
  position = "before"
) =>
  buildIconTermIcons(prevIcons, {
    type: "icon",
    icon,
    position: position || prevIcons?.position || "before",
  });

export const restoreIconFromBackup = (icons) => {
  if (!icons || typeof icons !== "object") return icons || {};
  if (icons.type !== "color") return icons;
  const backup = icons.icon_backup;
  if (!backup?.icon) {
    return {
      ...icons,
      type: "icon",
      icon: "",
      position: icons.position || "before",
    };
  }
  return {
    ...icons,
    type: backup.type || "icon",
    icon: backup.icon,
    position: icons.position || "before",
  };
};

/**
 * Seed default swatch color on terms that do not already have a color.
 * Existing custom colors are preserved.
 */
export const seedDefaultColorOnTermTree = (
  terms,
  defaultColor = DEFAULT_SWATCH_COLOR
) => {
  if (!Array.isArray(terms)) return terms;
  return terms.map((term) => {
    const next = { ...term };
    if (!termHasColorSwatch(next.icons)) {
      next.icons = buildColorTermIcons(
        next.icons,
        defaultColor,
        next.icons?.position || "before"
      );
    }
    if (Array.isArray(next.children_data) && next.children_data.length > 0) {
      next.children_data = seedDefaultColorOnTermTree(
        next.children_data,
        defaultColor
      );
    }
    return next;
  });
};

export const ensureDefaultSwatchColorsOnSettings = (
  settings,
  defaultColor = DEFAULT_SWATCH_COLOR
) => {
  if (!settings || typeof settings !== "object") return settings;
  if (!Array.isArray(settings.taxonomy_data)) return settings;
  return {
    ...settings,
    taxonomy_data: settings.taxonomy_data.map((group) => ({
      ...group,
      term_data: seedDefaultColorOnTermTree(group?.term_data, defaultColor),
    })),
  };
};

/**
 * Seed default icon on terms missing an icon visual (Attribute Swatch Icon/Image mode).
 * Restores icon_backup when switching from color swatches.
 */
export const seedDefaultIconOnTermTree = (
  terms,
  defaultIcon = DEFAULT_TERM_ICON
) => {
  if (!Array.isArray(terms)) return terms;
  return terms.map((term) => {
    const next = { ...term };
    if (next.icons?.type === "color") {
      next.icons = restoreIconFromBackup(next.icons);
    }
    if (!termHasIconVisual(next.icons)) {
      next.icons = buildDefaultIconTermIcons(
        next.icons,
        defaultIcon,
        next.icons?.position || "before"
      );
    }
    if (Array.isArray(next.children_data) && next.children_data.length > 0) {
      next.children_data = seedDefaultIconOnTermTree(
        next.children_data,
        defaultIcon
      );
    }
    return next;
  });
};

export const ensureDefaultTermIconsOnSettings = (
  settings,
  defaultIcon = DEFAULT_TERM_ICON
) => {
  if (!settings || typeof settings !== "object") return settings;
  if (!Array.isArray(settings.taxonomy_data)) return settings;
  return {
    ...settings,
    taxonomy_data: settings.taxonomy_data.map((group) => ({
      ...group,
      term_data: seedDefaultIconOnTermTree(group?.term_data, defaultIcon),
    })),
  };
};

/** Default icons payload when selecting a term in the current visual mode. */
export const getDefaultTermIconsForMode = (settings) => {
  if (isTermVisualColor(settings)) {
    return buildColorTermIcons({}, DEFAULT_SWATCH_COLOR, "before");
  }
  return {};
};

/** Attribute Swatch: default term icons when adding terms by Display As mode. */
export const getAttributeSwatchDefaultTermIcons = (settings) => {
  const mode = resolveAttributeSwatchDisplayMode(settings);
  if (mode === TERM_VISUAL_COLOR) {
    return buildColorTermIcons({}, DEFAULT_SWATCH_COLOR, "before");
  }
  if (mode === TERM_VISUAL_ICON) {
    return buildDefaultIconTermIcons({}, DEFAULT_TERM_ICON, "before");
  }
  return {};
};

/** Filter Design-tab labels (Icon vs Color only — unchanged for filter modules). */
export const getTermVisualDesignLabel = (settings) =>
  isTermVisualColor(settings) ? "Color Swatch" : "Icon";

export const getTermVisualWithTextDesignLabel = (settings) =>
  isTermVisualColor(settings) ? "Color Swatch + Text" : "Icon + Text";

/** Attribute Swatch Design-tab labels (Text | Icon/Image | Color). */
export const getAttributeSwatchDesignLabel = (settings) => {
  const mode = resolveAttributeSwatchDisplayMode(settings);
  if (mode === TERM_VISUAL_COLOR) {
    return "Color Swatch";
  }
  if (mode === TERM_VISUAL_TEXT) {
    return "Text";
  }
  return "Icon";
};

export const getAttributeSwatchWithTextDesignLabel = (settings) => {
  const mode = resolveAttributeSwatchDisplayMode(settings);
  if (mode === TERM_VISUAL_COLOR) {
    // Color Display As never shows term names on Attribute Swatch.
    return "Color Swatch";
  }
  if (mode === TERM_VISUAL_TEXT) {
    return "Text";
  }
  return "Icon";
};