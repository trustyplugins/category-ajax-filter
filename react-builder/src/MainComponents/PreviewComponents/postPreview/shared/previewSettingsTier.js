import React, { useMemo } from "react";
import { Segmented, Select, Tooltip } from "antd";
import { canUseFeature, getUpgradeUrl, isProTier } from "../../../../tier/capabilities";
import { TierLockedSection } from "../../../../tier/TierLockedSection";
import FilterPositionIcon from "../GeneralComponents/FilterPositionIcon";

export const canUseFloatingFilter = () => canUseFeature("floating_filter");

export const canUsePreviewLoaderSettings = () =>
  canUseFeature("preview_loader_settings");

export const canUsePostMasonry = () => canUseFeature("post_masonry");

export const resolveMasonryEnabled = (storedValue) => {
  if (!canUsePostMasonry()) {
    return false;
  }
  return (
    storedValue === true ||
    storedValue === "true" ||
    storedValue === 1 ||
    storedValue === "1"
  );
};

export const canUseScrollToContainer = () => canUseFeature("scroll_to_container");

export const FREE_SCROLL_SETTINGS = Object.freeze({
  desktop: {
    is_enable: "false",
    position: "-100",
  },
  tablet: {},
  mobile: {},
});

export const resolveScrollSettings = (storedScroll) => {
  if (!canUseScrollToContainer()) {
    return FREE_SCROLL_SETTINGS;
  }
  if (!storedScroll || typeof storedScroll !== "object") {
    return FREE_SCROLL_SETTINGS;
  }
  return storedScroll;
};

export const resolveScrollDeviceSettings = (storedScroll, device = "desktop") => {
  const scroll = resolveScrollSettings(storedScroll);
  const getValue = (targetDevice, key) => {
    const value = scroll?.[targetDevice]?.[key];
    return typeof value === "undefined" || value === null || value === ""
      ? undefined
      : value;
  };

  if (device === "mobile") {
    return {
      is_enable:
        getValue("mobile", "is_enable") ??
        getValue("tablet", "is_enable") ??
        getValue("desktop", "is_enable") ??
        "false",
      position: String(
        getValue("mobile", "position") ??
          getValue("tablet", "position") ??
          getValue("desktop", "position") ??
          "-100"
      ),
    };
  }

  if (device === "tablet") {
    return {
      is_enable:
        getValue("tablet", "is_enable") ??
        getValue("desktop", "is_enable") ??
        "false",
      position: String(
        getValue("tablet", "position") ??
          getValue("desktop", "position") ??
          "-100"
      ),
    };
  }

  return {
    is_enable: getValue("desktop", "is_enable") ?? "false",
    position: String(getValue("desktop", "position") ?? "-100"),
  };
};

export const FREE_PREVIEW_LOADER = Object.freeze({
  is_enable: "true",
  loader_type: "true",
  loader_text: "Loading...",
  overlay: "false",
  custom_class: "",
  icon_data: {
    source: "list",
    icon: "fa fa-spinner fa-pulse",
    url: "",
    upload: "",
    style: {
      desktop: {
        default: {
          fontSize: "14px",
          overlay: "rgba(255,255,255,0)",
        },
        hover: {},
      },
      tablet: {
        default: {},
        hover: {},
      },
      mobile: {
        default: {},
        hover: {},
      },
    },
  },
});

export const resolveFilterPosition = (storedValue) => {
  if (canUseFloatingFilter() && storedValue === "floating") {
    return "floating";
  }
  return "inline";
};

export const resolvePreviewLoaderData = (storedLoader) => {
  if (canUsePreviewLoaderSettings()) {
    return storedLoader;
  }
  return FREE_PREVIEW_LOADER;
};

export function PostFilterPositionSegment({
  value,
  onChange,
  className = "hoverTabCaf",
}) {
  const floatingLocked = !canUseFloatingFilter();
  const resolvedValue = resolveFilterPosition(value);

  const options = useMemo(
    () => [
      {
        value: "inline",
        label: (
          <span className="caf-filter-position-tab-label">
            <FilterPositionIcon mode="inline" />
            <span>Inline</span>
          </span>
        ),
      },
      {
        value: "floating",
        label: (
          <span className="caf-filter-position-tab-label caf-filter-data-source-tab-label--custom-field">
            <FilterPositionIcon mode="floating" />
            <span>Float Button</span>
            {floatingLocked ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        ),
        disabled: floatingLocked,
        className: floatingLocked
          ? "caf-builder-tier-locked-segment-item"
          : undefined,
      },
    ],
    [floatingLocked]
  );

  const handleChange = (nextValue) => {
    if (nextValue === "floating" && floatingLocked) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <div
      className={`caf-filter-data-source-segmented-wrap${
        floatingLocked ? " caf-filter-data-source-segmented-wrap--locked" : ""
      }`}
    >
      <Segmented
        value={resolvedValue}
        style={{ marginBottom: 8 }}
        onChange={handleChange}
        className={className}
        options={options}
      />
      {floatingLocked ? (
        <Tooltip
          classNames={{
            root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
          }}
          placement="topLeft"
          title={
            <span className="caf-builder-tier-locked-section__tooltip-text">
              Floating filter button is available in Category Ajax Filter Pro.{" "}
              <a
                href={getUpgradeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="caf-builder-tier-locked-section__upgrade-link"
              >
                Upgrade to Pro
              </a>
            </span>
          }
        >
          <div
            className="caf-builder-tier-locked-segment-overlay caf-builder-tier-locked-segment-overlay--custom-field"
            aria-hidden="true"
          />
        </Tooltip>
      ) : null}
    </div>
  );
}

export function PreviewLoaderSettingsLockedSection({ children }) {
  const locked = !canUsePreviewLoaderSettings();
  if (!locked) {
    return children;
  }

  return (
    <TierLockedSection
      locked
      sectionTitle="Loader Settings"
      className="caf-builder-tier-locked-section--preview-loader"
      upgradeMessage="Custom loader settings are available in Category Ajax Filter Pro. Free uses a simple spinner loader."
    >
      {children}
    </TierLockedSection>
  );
}

const DND_MISC_ITEM_FEATURE_MAP = Object.freeze({
  sorting: "sorting",
  result_count: "result_counter",
  selected: "active_filters",
});

export const FREE_DND_ALLOWED_MISC_ITEMS = Object.freeze(["pagination"]);

export const FREE_DND_COLUMN_SETTINGS_DISABLED_KEYS = Object.freeze([
  "filter_top",
  "filter_bottom",
  "post_top",
]);

export const isDndColumnSettingsDisabled = (columnKey) => {
  if (isProTier()) {
    return false;
  }
  return FREE_DND_COLUMN_SETTINGS_DISABLED_KEYS.includes(
    String(columnKey || "")
  );
};

export const canUseDndMiscItem = (itemKey) => {
  if (isProTier()) {
    return true;
  }

  const key = String(itemKey || "");
  if (FREE_DND_ALLOWED_MISC_ITEMS.includes(key)) {
    return true;
  }
  const feature = DND_MISC_ITEM_FEATURE_MAP[key];
  if (!feature) {
    return true;
  }
  return canUseFeature(feature);
};

export const isDndMiscItemLocked = (itemKey) => {
  if (isProTier()) {
    return false;
  }
  return !canUseDndMiscItem(itemKey);
};

export const getDndMiscItemUpgradeMessage = (itemKey) => {
  const labels = {
    sorting: "Sorting",
    result_count: "Result counter",
    selected: "Active filters",
  };
  const label = labels[itemKey] || "This layout control";
  return `${label} is available in Category Ajax Filter Pro. Free includes pagination only in Layout Controls.`;
};

export const resolveDndMiscItemEnabled = (item) => {
  if (!item?.key) {
    return false;
  }
  if (!canUseDndMiscItem(item.key)) {
    return false;
  }
  return item?.settings?.is_enable === "true";
};

export const hasVisibleMiscZoneContent = (zone, deviceType, isHiddenOnDevice) => {
  if (!zone || typeof isHiddenOnDevice !== "function") {
    return false;
  }
  if (isHiddenOnDevice(zone?.settings, deviceType)) {
    return false;
  }
  const items = zone?.data;
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }
  return items.some(
    (item) =>
      resolveDndMiscItemEnabled(item) &&
      !isHiddenOnDevice(item?.settings, deviceType)
  );
};

export const shouldRenderMiscZoneWrapper = (
  zone,
  deviceType,
  isHiddenOnDevice,
  forceRender = false
) => {
  if (!zone || typeof isHiddenOnDevice !== "function") {
    return false;
  }
  if (isHiddenOnDevice(zone?.settings, deviceType)) {
    return false;
  }
  return forceRender || hasVisibleMiscZoneContent(zone, deviceType, isHiddenOnDevice);
};

export const getDndColumnDraggableItemKeys = (column) => {
  if (!Array.isArray(column?.data) || column.data.length === 0) {
    return [];
  }

  if (isProTier()) {
    return column.data
      .filter((item) => item?.key)
      .map((item) => item.key);
  }

  return column.data
    .filter((item) => item?.key && !isDndMiscItemLocked(item.key))
    .map((item) => item.key);
};

export const isDndColumnDragDropDisabled = (column) => {
  if (isProTier()) {
    return false;
  }
  const columnKey = String(column?.key || "");
  if (columnKey === "post_bottom") {
    return false;
  }
  return getDndColumnDraggableItemKeys(column).length === 0;
};

/**
 * Layout Controls sidebar column order (display only; does not mutate saved layout).
 * Free tier: post_bottom first, post_top second — pagination visible without scrolling.
 */
const FREE_DND_COLUMN_DISPLAY_ORDER = Object.freeze([
  "post_bottom",
  "post_top",
  "filter_top",
  "filter_bottom",
]);

export const getDndColumnsForLayoutControlsDisplay = (columns, filterStatus) => {
  if (!Array.isArray(columns) || columns.length === 0) {
    return [];
  }

  let visibleColumns = columns;
  if (filterStatus === "false") {
    visibleColumns = columns.filter(
      (column) =>
        column?.key !== "filter_top" && column?.key !== "filter_bottom"
    );
  }

  if (isProTier()) {
    return visibleColumns;
  }

  const columnMap = new Map(
    visibleColumns
      .filter((column) => column?.key)
      .map((column) => [column.key, column])
  );
  const ordered = [];

  FREE_DND_COLUMN_DISPLAY_ORDER.forEach((key) => {
    if (columnMap.has(key)) {
      ordered.push(columnMap.get(key));
      columnMap.delete(key);
    }
  });

  columnMap.forEach((column) => {
    ordered.push(column);
  });

  return ordered;
};

const DND_COLUMN_FALLBACK_ORDER = Object.freeze([
  "filter_top",
  "filter_bottom",
  "post_top",
  "post_bottom",
]);

/**
 * Default selected column in Layout Controls (sidebar highlight + settings panel).
 * Free tier: post_bottom (pagination). Pro: filter_top or post_top when filter is off.
 */
export const getDefaultLayoutControlsSelectedItem = (columns, filterStatus) => {
  const columnKey = isProTier()
    ? filterStatus === "false"
      ? "post_top"
      : "filter_top"
    : "post_bottom";

  const layout =
    Array.isArray(columns) && columns.length > 0 ? columns : null;
  let column_index = layout
    ? layout.findIndex((column) => column?.key === columnKey)
    : -1;

  if (column_index < 0) {
    column_index = DND_COLUMN_FALLBACK_ORDER.indexOf(columnKey);
  }
  if (column_index < 0) {
    column_index = 0;
  }

  return {
    type: "column",
    columnKey,
    itemKey: null,
    itemData: null,
    column_index,
    item_index: null,
  };
};

/** Free tier only: selection to apply when opening Layout Controls. */
export const getFreeLayoutControlsSelectedItem = (columns, filterStatus) => {
  if (isProTier()) {
    return null;
  }
  return getDefaultLayoutControlsSelectedItem(columns, filterStatus);
};

const PAGINATION_TYPE_FEATURE_MAP = Object.freeze({
  number2: "pagination_number2",
  button: "pagination_button",
  "load-more": "pagination_load_more",
});

export const FREE_PAGINATION_TYPES = Object.freeze(["number"]);

export const canUsePaginationType = (paginationType) => {
  const type = String(paginationType || "");
  if (FREE_PAGINATION_TYPES.includes(type)) {
    return true;
  }
  const feature = PAGINATION_TYPE_FEATURE_MAP[type];
  if (!feature) {
    return true;
  }
  return canUseFeature(feature);
};

export const resolvePaginationType = (storedType) => {
  const type = String(storedType || "number");
  if (canUsePaginationType(type)) {
    return type;
  }
  return "number";
};

export function PaginationTypeSelect({ value, onChange, extraClass = "" }) {
  const resolvedValue = resolvePaginationType(value);

  const options = useMemo(
    () => [
      {
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            <span>Numbers With Buttons</span>
            {!canUsePaginationType("number2") ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        ),
        value: "number2",
        disabled: !canUsePaginationType("number2"),
      },
      {
        label: "Numbers",
        value: "number",
      },
      {
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            <span>Buttons</span>
            {!canUsePaginationType("button") ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        ),
        value: "button",
        disabled: !canUsePaginationType("button"),
      },
      {
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            <span>Load More</span>
            {!canUsePaginationType("load-more") ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        ),
        value: "load-more",
        disabled: !canUsePaginationType("load-more"),
      },
    ],
    []
  );

  const handleChange = (nextValue) => {
    if (!canUsePaginationType(nextValue)) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <div className={`module-content-tab-row ${extraClass}`.trim()}>
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title="Configure pagination type."
      >
        <label>
          <span>Pagination Type</span>
        </label>
      </Tooltip>
      <Select
        style={{ width: "100%" }}
        value={resolvedValue}
        onChange={handleChange}
        options={options}
        popupClassName="caf-builder-pagination-type-select-dropdown"
      />
    </div>
  );
}
