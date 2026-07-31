import React from "react";
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

export const canUseFilterCustomField = () => false;
export const canUseRangeSliderCustomFields = () => false;
export const canUseFilterShowIcon = () => false;
export const canUseFilterTermShowMore = () => false;
export const canUseSearchShowIcon = () => false;
export const canUseSearchClearInput = () => false;
export const canUseVoiceSearch = () => false;
export const canUseWooProductFilters = () => false;
export const canUseLabelShowIcon = () => false;
export const canUseFilterLabelCollapse = () => false;
export const canUseFilterTermDefault = () => false;
export const canUseFilterTermIcon = () => false;
export const canUseResetModuleIcon = () => false;
export const canUseCustomTextModuleIcon = () => false;

/** Free keeps color swatches on WooCommerce product layouts. */
export const canUseFilterColorSwatch = (settingsOrPostType) =>
  canUseColorSwatchFeatures(settingsOrPostType);

export const resolveSettingsForTermVisualDefaults = (settings, postType) => {
  const base =
    settings && typeof settings === "object" ? { ...settings } : {};
  const resolvedType = postType || base.post_type;
  if (resolvedType) base.post_type = resolvedType;
  if (
    String(base.show_icon) === "true" &&
    canUseFilterColorSwatch(base)
  ) {
    base.term_visual = TERM_VISUAL_COLOR;
  }
  return base;
};

export const getFilterTermVisualDisplayOptions = () => [
  {
    value: TERM_VISUAL_ICON,
    label: (
      <span className="caf-filter-data-source-tab-label">
        Icon{" "}
        <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
          Pro
        </span>
      </span>
    ),
    disabled: true,
  },
  { value: TERM_VISUAL_COLOR, label: "Color Swatch" },
];

export const canUseFilterShowIconOrColorSwatch = (settingsOrPostType) =>
  canUseFilterColorSwatch(settingsOrPostType);

const isSearchSettingEnabled = (value) => String(value) === "true";

/** The Free default icon remains designable in the output path. */
export const getSearchModuleEnabledIcons = (settings) =>
  isSearchSettingEnabled(
    resolveFreeDefaultSearchIconForOutput(settings?.search_icon).is_enable
  )
    ? [resolveFreeDefaultSearchIconForOutput(settings?.search_icon)]
    : [];

export const buildSearchDesignFieldSubTabs = (settings) => {
  const tabs = [{ key: "input", label: "Field" }];
  if (getSearchModuleEnabledIcons(settings).length) {
    tabs.push({ key: "icon", label: "Search Icon" });
  }
  return tabs;
};

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

export const resolveFilterDataSource = () => "taxonomy";

export const resolveFilterShowIconSetting = (storedValue, settingsOrPostType) =>
  String(storedValue) === "true" && isTermVisualColor(settingsOrPostType)
    ? "true"
    : "false";

export const applyFreeColorSwatchOnEnable = (settings, postType) => {
  if (!settings || typeof settings !== "object") return settings;
  if (!canUseFilterColorSwatch(postType || settings)) {
    return { ...settings, show_icon: "false" };
  }
  return String(settings.show_icon) === "true"
    ? { ...settings, term_visual: TERM_VISUAL_COLOR }
    : settings;
};

export const stripDropdownAllOptionIcons = (settings) => {
  if (!settings || typeof settings !== "object" || !settings.dropdown_data?.all_option) {
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

export const resolveMetaRelation = () => "IN";

const stripFilterTermNodeForOutput = (term) => {
  if (!term || typeof term !== "object") return term;
  const next = { ...term };
  const swatchColor = getTermSwatchColor(next.icons);
  next.icons = swatchColor
    ? {
        type: "color",
        icon: swatchColor,
        color: swatchColor,
        position: next.icons?.position || "before",
      }
    : { icon: "", type: "icon", position: "before" };
  next.predefine = "false";
  if (Array.isArray(next.children_data)) {
    next.children_data = next.children_data.map(stripFilterTermNodeForOutput);
  }
  return next;
};

export const stripFilterLabelIcons = (settings) => {
  if (!settings || typeof settings !== "object") return settings;
  return {
    ...settings,
    label: {
      ...(settings.label || {}),
      icons: {
        ...((settings.label || {}).icons || {}),
        visibility: false,
        icon: "",
        type: "icon",
        position: "before-label",
      },
    },
  };
};

export const stripFilterLabelCollapse = (settings) =>
  !settings || typeof settings !== "object"
    ? settings
    : { ...settings, enable_toggle: "false", close_toggle: "false" };

export const resolveFilterLabelCollapseToggleState = () => ({
  enable: false,
  close: false,
});

export const applyFilterLabelCollapseTierToSettings = (settings) =>
  stripFilterLabelCollapse(settings);

export const resolveSearchModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object") return settings;
  return stripFilterLabelCollapse(
    stripFilterLabelIcons({
      ...settings,
      search_icon: resolveFreeDefaultSearchIconForOutput(settings.search_icon),
      clear_icon: { ...(settings.clear_icon || {}), is_enable: "false" },
    })
  );
};

export const resolveFilterModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object") return settings;
  let next = {
    ...settings,
    data_source: "taxonomy",
    custom_field: "0",
    term_show_more: "false",
    predefined_terms: [],
    cf_predefined_terms: [],
  };
  next = applyFreeColorSwatchOnEnable(next, next.post_type);
  next.show_icon = resolveFilterShowIconSetting(next.show_icon, next);
  if (next.show_icon === "true") next.term_visual = TERM_VISUAL_COLOR;
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

export const resolveRangeSliderSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object") return settings;
  const rows = Array.isArray(settings.custom_field_data)
    ? settings.custom_field_data
    : settings.custom_field_data && typeof settings.custom_field_data === "object"
      ? [settings.custom_field_data]
      : [];
  const first = rows[0] && typeof rows[0] === "object" ? rows[0] : {};
  return stripFilterLabelCollapse(
    stripFilterLabelIcons({
      ...settings,
      data_source: "custom_field",
      custom_field_data: [
        {
          ...first,
          custom_field_key: "_price",
          custom_field_value_list: Array.isArray(first.custom_field_value_list)
            ? first.custom_field_value_list
            : [],
          compare_operator: "BETWEEN",
          meta_type: "NUMERIC",
        },
      ],
    })
  );
};

export const resolveResetModuleSettingsForOutput = (settings) =>
  !settings || typeof settings !== "object"
    ? settings
    : stripFilterLabelCollapse(
        stripFilterLabelIcons({
          ...settings,
          icons: { visibility: false, icon: "", type: "icon" },
        })
      );

export const areFilterTermActionsLocked = () => true;

export { FilterDataSourceSegment } from "./filterDataSourceControls";

const lockedWrap = (className, children, showProBadge = true) => (
  <TierLockedWrap
    locked
    className={className}
    upgradeMessage={FILTER_MODULE_PRO_MESSAGE}
    showProBadge={showProBadge}
  >
    {children}
  </TierLockedWrap>
);

export function FilterShowIconLockedSection({ children, unlockForColorSwatch = false }) {
  return unlockForColorSwatch
    ? children
    : lockedWrap(
        "caf-builder-tier-locked-filter-show-icon module-content-tab-row no-pad-0",
        children
      );
}

export function FilterTermShowMoreLockedSection({ children }) {
  return lockedWrap(
    "caf-builder-tier-locked-filter-term-show-more module-content-tab-row no-pad-0",
    children
  );
}

export function FilterLabelShowIconLockedSection({ children, className = "" }) {
  return lockedWrap(
    `caf-builder-tier-locked-filter-label-icon ${className}`.trim(),
    children
  );
}

export function FilterLabelCollapseLockedSection({ children, className = "" }) {
  return lockedWrap(
    `caf-builder-tier-locked-filter-label-collapse ${className}`.trim(),
    children
  );
}

export function FilterTermActionsLockedWrap({ children }) {
  return lockedWrap("caf-builder-tier-locked-term-actions", children, false);
}

export const shouldShowFilterTermIconControl = (showIconSetting) =>
  areFilterTermActionsLocked() || showIconSetting === "true";

export const resolveCustomTextModuleSettingsForOutput = (settings) =>
  !settings || typeof settings !== "object"
    ? settings
    : {
        ...settings,
        icons: {
          visibility: false,
          icon: "",
          type: "icon",
          position: "before-customtext",
        },
      };

export function ResetModuleIconLockedSection({ children }) {
  return lockedWrap("caf-builder-tier-locked-reset-icon-section", children);
}

export function CustomTextModuleIconLockedSection({ children }) {
  return lockedWrap("caf-builder-tier-locked-customtext-icon-section", children);
}
