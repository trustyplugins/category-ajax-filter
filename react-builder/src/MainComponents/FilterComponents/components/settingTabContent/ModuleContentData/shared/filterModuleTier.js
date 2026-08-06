import React from "react";
import { canUseFeature, isProTier } from "../../../../../../tier/capabilities";
import { TierLockedWrap } from "../../../../../../tier/TierLockedWrap";
import {
  TERM_VISUAL_COLOR,
  TERM_VISUAL_ICON,
  canUseColorSwatchFeatures,
  getTermSwatchColor,
  isTermVisualColor,
} from "../termVisualUtils";

export const FILTER_MODULE_PRO_MESSAGE =
  "This feature is available in Category Ajax Filter Pro.";

export const canUseFilterCustomField = () =>
  canUseFeature("filter_custom_field");
export const canUseRangeSliderCustomFields = () =>
  canUseFeature("range_slider_custom_fields");
export const canUseFilterShowIcon = () => canUseFeature("filter_show_icon");
export const canUseFilterTermShowMore = () =>
  canUseFeature("filter_term_show_more");
export const canUseSearchShowIcon = () => canUseFeature("search_show_icon");
export const canUseSearchClearInput = () => canUseFeature("search_clear_input");
export const canUseVoiceSearch = () => canUseFeature("voice_search");
/** Woo virtual product filters (stock / sale / rating) in checkbox/dropdown picker. */
export const canUseWooProductFilters = () =>
  canUseFeature("woo_product_filters");

/** Free: color swatch section unlocked on product layouts; icons stay Pro. */
export const canUseFilterColorSwatch = (settingsOrPostType) =>
  canUseColorSwatchFeatures(settingsOrPostType);

/**
 * Settings used when seeding default term icons/colors.
 * Free locks Icon mode but older modules may still store term_visual "icon"
 * while the UI shows Color Swatch — force color so white defaults apply.
 *
 * @param {object} settings
 * @param {string} [postType]
 * @returns {object}
 */
export const resolveSettingsForTermVisualDefaults = (settings, postType) => {
  const base =
    settings && typeof settings === "object" ? { ...settings } : {};
  const resolvedType = postType || base.post_type;
  if (resolvedType) {
    base.post_type = resolvedType;
  }
  if (
    !canUseFilterShowIcon() &&
    String(base.show_icon) === "true" &&
    canUseFilterColorSwatch(base)
  ) {
    base.term_visual = TERM_VISUAL_COLOR;
  }
  return base;
};

/**
 * Display As options for checkbox/dropdown color-swatch mode.
 * Free keeps Icon visible but locked with a Pro badge (same pattern as other gated selects).
 */
export const getFilterTermVisualDisplayOptions = () => {
  const iconLocked = !canUseFilterShowIcon();
  return [
    {
      value: TERM_VISUAL_ICON,
      label: iconLocked ? (
        <span className="caf-filter-data-source-tab-label">
          Icon{" "}
          <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
            Pro
          </span>
        </span>
      ) : (
        "Icon"
      ),
      disabled: iconLocked,
    },
    { value: TERM_VISUAL_COLOR, label: "Color Swatch" },
  ];
};

/** Section enable toggle: Pro icons, or free color-swatch on product layouts. */
export const canUseFilterShowIconOrColorSwatch = (settingsOrPostType) =>
  canUseFilterShowIcon() || canUseFilterColorSwatch(settingsOrPostType);

const isSearchSettingEnabled = (value) => String(value) === "true";

export const getSearchModuleEnabledIcons = (settings) => {
  const icons = [];
  if (
    canUseSearchShowIcon() &&
    isSearchSettingEnabled(settings?.search_icon?.is_enable)
  ) {
    icons.push(settings.search_icon);
  }
  if (
    canUseVoiceSearch() &&
    isSearchSettingEnabled(settings?.voice_icon?.is_enable)
  ) {
    icons.push(settings.voice_icon);
  }
  if (
    canUseSearchClearInput() &&
    isSearchSettingEnabled(settings?.clear_icon?.is_enable)
  ) {
    icons.push(settings.clear_icon);
  }
  return icons;
};

export const buildSearchDesignFieldSubTabs = (settings) => {
  const tabs = [{ key: "input", label: "Field" }];
  if (
    canUseSearchShowIcon() &&
    isSearchSettingEnabled(settings?.search_icon?.is_enable)
  ) {
    tabs.push({ key: "icon", label: "Search Icon" });
  }
  if (
    canUseVoiceSearch() &&
    isSearchSettingEnabled(settings?.voice_icon?.is_enable)
  ) {
    tabs.push({ key: "icon2", label: "Voice Icon" });
  }
  if (
    canUseSearchClearInput() &&
    isSearchSettingEnabled(settings?.clear_icon?.is_enable)
  ) {
    tabs.push({ key: "icon3", label: "Clear Icon" });
  }
  return tabs;
};
export const canUseLabelShowIcon = () => canUseFeature("label_show_icon");
export const canUseFilterLabelCollapse = () =>
  canUseFeature("filter_label_collapse");
export const canUseFilterTermDefault = () =>
  canUseFeature("filter_term_default");
export const canUseFilterTermIcon = () => canUseFeature("filter_term_icon");

/** Built-in search icon for free tier output (customization remains Pro-only). */
export const FREE_DEFAULT_SEARCH_ICON = {
  is_enable: "true",
  position: "right",
  type: "icon",
  icon: "fas fa-search",
};

export const resolveFreeDefaultSearchIconForOutput = (searchIcon = {}) => ({
  ...searchIcon,
  ...FREE_DEFAULT_SEARCH_ICON,
});

export const resolveFilterDataSource = (storedValue) => {
  if (canUseFilterCustomField()) {
    return storedValue === "custom_field" ? "custom_field" : "taxonomy";
  }
  return "taxonomy";
};

/**
 * Resolve show_icon for output.
 * Free keeps icons locked, but allows show_icon when Display As is Color Swatch.
 *
 * @param {string} storedValue
 * @param {object|string} [settingsOrPostType] Module settings (needs post_type + term_visual) or post type.
 */
export const resolveFilterShowIconSetting = (storedValue, settingsOrPostType) => {
  if (String(storedValue) !== "true") {
    return "false";
  }
  if (canUseFilterShowIcon()) {
    return "true";
  }
  if (settingsOrPostType && isTermVisualColor(settingsOrPostType)) {
    return "true";
  }
  return "false";
};

/** When free enables the section, force Color Swatch (Icon stays Pro). */
export const applyFreeColorSwatchOnEnable = (settings, postType) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }
  if (canUseFilterShowIcon()) {
    return settings;
  }
  if (!canUseFilterColorSwatch(postType || settings)) {
    return { ...settings, show_icon: "false" };
  }
  if (String(settings.show_icon) !== "true") {
    return settings;
  }
  return {
    ...settings,
    term_visual: TERM_VISUAL_COLOR,
  };
};

export const stripDropdownAllOptionIcons = (settings) => {
  if (
    !settings ||
    typeof settings !== "object" ||
    isProTier() ||
    canUseFilterShowIcon()
  ) {
    return settings;
  }

  if (!settings.dropdown_data?.all_option) {
    return settings;
  }

  return {
    ...settings,
    dropdown_data: {
      ...settings.dropdown_data,
      all_option: {
        ...settings.dropdown_data.all_option,
        icons: {
          ...(settings.dropdown_data.all_option.icons || {}),
          visibility: false,
          icon: "",
          type: "icon",
        },
      },
    },
  };
};

export const resolveMetaRelation = (storedValue) => {
  if (!canUseFeature("meta_relation")) {
    return "IN";
  }
  const raw = String(storedValue || "OR").toUpperCase();
  if (raw === "AND") {
    return "AND";
  }
  if (raw === "IN") {
    return "IN";
  }
  return "OR";
};

const stripFilterTermNodeForOutput = (term) => {
  if (!term || typeof term !== "object") {
    return term;
  }
  const next = { ...term };
  if (!canUseFilterTermIcon()) {
    const swatchColor = getTermSwatchColor(next.icons);
    // Keep color swatch data on free; strip FA/SVG icons only.
    if (swatchColor) {
      next.icons = {
        type: "color",
        icon: swatchColor,
        color: swatchColor,
        position: next.icons?.position || "before",
      };
    } else {
      next.icons = { icon: "", type: "icon", position: "before" };
    }
  }
  if (!canUseFilterTermDefault()) {
    next.predefine = "false";
  }
  if (Array.isArray(next.children_data)) {
    next.children_data = next.children_data.map(stripFilterTermNodeForOutput);
  }
  return next;
};

export const stripFilterLabelIcons = (settings) => {
  if (!settings || typeof settings !== "object" || isProTier() || canUseLabelShowIcon()) {
    return settings;
  }

  const next = { ...settings };
  next.label = {
    ...(next.label || {}),
    icons: {
      ...((next.label || {}).icons || {}),
      visibility: false,
      icon: "",
      type: "icon",
      position: "before-label",
    },
  };
  return next;
};

export const stripFilterLabelCollapse = (settings) => {
  if (
    !settings ||
    typeof settings !== "object" ||
    isProTier() ||
    canUseFilterLabelCollapse()
  ) {
    return settings;
  }

  return {
    ...settings,
    enable_toggle: "false",
    close_toggle: "false",
  };
};

export const resolveFilterLabelCollapseToggleState = (settings) => {
  if (!canUseFilterLabelCollapse()) {
    return { enable: false, close: false };
  }

  return {
    enable: settings?.enable_toggle !== "false",
    close: settings?.close_toggle !== "false",
  };
};

export const applyFilterLabelCollapseTierToSettings = (settings) =>
  stripFilterLabelCollapse(settings);

export const resolveSearchModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object" || isProTier()) {
    return settings;
  }

  let next = { ...settings };
  if (!canUseSearchShowIcon()) {
    next.search_icon = resolveFreeDefaultSearchIconForOutput(next.search_icon);
  }
  if (!canUseSearchClearInput()) {
    next.clear_icon = { ...(next.clear_icon || {}), is_enable: "false" };
  }
  next = stripFilterLabelIcons(next);
  return stripFilterLabelCollapse(next);
};

export const resolveFilterModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object" || isProTier()) {
    return settings;
  }

  let next = { ...settings };
  next.data_source = resolveFilterDataSource(next.data_source);
  next = applyFreeColorSwatchOnEnable(next, next.post_type);
  next.show_icon = resolveFilterShowIconSetting(next.show_icon, next);
  if (!canUseFilterShowIcon() && next.show_icon === "true") {
    next.term_visual = TERM_VISUAL_COLOR;
  }
  if (!canUseFilterTermShowMore()) {
    next.term_show_more = "false";
  }
  if (!canUseFilterCustomField()) {
    next.custom_field = "0";
  }
  if (!canUseFilterTermDefault()) {
    next.predefined_terms = [];
    next.cf_predefined_terms = [];
  }
  if (Array.isArray(next.taxonomy_data)) {
    next.taxonomy_data = next.taxonomy_data.map((group) => ({
      ...group,
      term_data: (group?.term_data || []).map(stripFilterTermNodeForOutput),
    }));
  }
  return stripFilterLabelCollapse(
    stripDropdownAllOptionIcons(stripFilterLabelIcons(next))
  );
};

/** Range slider keeps custom_field data_source; free only allows WooCommerce `_price`. */
export const resolveRangeSliderSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object" || isProTier()) {
    return settings;
  }

  let next = { ...settings, data_source: "custom_field" };
  if (!canUseRangeSliderCustomFields()) {
    const rows = Array.isArray(next.custom_field_data)
      ? next.custom_field_data
      : next.custom_field_data && typeof next.custom_field_data === "object"
        ? [next.custom_field_data]
        : [];
    const first = rows[0] && typeof rows[0] === "object" ? rows[0] : {};
    next.custom_field_data = [
      {
        ...first,
        custom_field_key: "_price",
        custom_field_value_list: Array.isArray(first.custom_field_value_list)
          ? first.custom_field_value_list
          : [],
        compare_operator: "BETWEEN",
        meta_type: "NUMERIC",
      },
    ];
  }
  return stripFilterLabelCollapse(stripFilterLabelIcons(next));
};

export const resolveResetModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object" || isProTier()) {
    return settings;
  }
  let next = { ...settings };
  if (!canUseResetModuleIcon()) {
    next.icons = {
      visibility: false,
      icon: "",
      type: "icon",
    };
  }
  return stripFilterLabelCollapse(stripFilterLabelIcons(next));
};

export const areFilterTermActionsLocked = () =>
  !canUseFilterTermDefault() || !canUseFilterTermIcon();

export { FilterDataSourceSegment } from "./filterDataSourceControls";

/**
 * Locks the Show Icon section on free, unless product color-swatch is allowed.
 * Pass unlockForColorSwatch when the layout post type supports color swatches.
 */
export function FilterShowIconLockedSection({
  children,
  unlockForColorSwatch = false,
}) {
  const locked = !canUseFilterShowIcon() && !unlockForColorSwatch;
  if (!locked) {
    return children;
  }

  return (
    <TierLockedWrap
      locked
      className="caf-builder-tier-locked-filter-show-icon module-content-tab-row no-pad-0"
      upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
      showProBadge
    >
      {children}
    </TierLockedWrap>
  );
}

export function FilterTermShowMoreLockedSection({ children }) {
  const locked = !canUseFilterTermShowMore();
  if (!locked) {
    return children;
  }

  return (
    <TierLockedWrap
      locked
      className="caf-builder-tier-locked-filter-term-show-more module-content-tab-row no-pad-0"
      upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
      showProBadge
    >
      {children}
    </TierLockedWrap>
  );
}

export function FilterLabelShowIconLockedSection({ children, className = "" }) {
  const locked = !canUseLabelShowIcon();
  if (!locked) {
    return children;
  }

  return (
    <TierLockedWrap
      locked
      className={`caf-builder-tier-locked-filter-label-icon ${className}`.trim()}
      upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
      showProBadge
    >
      {children}
    </TierLockedWrap>
  );
}

export function FilterLabelCollapseLockedSection({ children, className = "" }) {
  const locked = !canUseFilterLabelCollapse();
  if (!locked) {
    return children;
  }

  return (
    <TierLockedWrap
      locked
      className={`caf-builder-tier-locked-filter-label-collapse ${className}`.trim()}
      upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
      showProBadge
    >
      {children}
    </TierLockedWrap>
  );
}

export function FilterTermActionsLockedWrap({ children }) {
  const locked = areFilterTermActionsLocked();
  if (!locked) {
    return children;
  }

  return (
    <TierLockedWrap
      locked
      className="caf-builder-tier-locked-term-actions"
      upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
    >
      {children}
    </TierLockedWrap>
  );
}

export const shouldShowFilterTermIconControl = (showIconSetting) =>
  areFilterTermActionsLocked() || showIconSetting === "true";

export const canUseResetModuleIcon = () => canUseFeature("reset_module_icon");
export const canUseCustomTextModuleIcon = () =>
  canUseFeature("customtext_module_icon");

export const resolveCustomTextModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object" || isProTier()) {
    return settings;
  }
  let next = { ...settings };
  if (!canUseCustomTextModuleIcon()) {
    next.icons = {
      visibility: false,
      icon: "",
      type: "icon",
      position: "before-customtext",
    };
  }
  return next;
};

export function ResetModuleIconLockedSection({ children }) {
  const locked = !canUseResetModuleIcon();
  if (!locked) {
    return children;
  }

  return (
    <TierLockedWrap
      locked
      className="caf-builder-tier-locked-reset-icon-section"
      upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
      showProBadge
    >
      {children}
    </TierLockedWrap>
  );
}

export function CustomTextModuleIconLockedSection({ children }) {
  const locked = !canUseCustomTextModuleIcon();
  if (!locked) {
    return children;
  }

  return (
    <TierLockedWrap
      locked
      className="caf-builder-tier-locked-customtext-icon-section"
      upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
      showProBadge
    >
      {children}
    </TierLockedWrap>
  );
}
