import React, { useMemo } from "react";
import { Segmented, Select, Tooltip } from "antd";
import { getUpgradeUrl } from "../../../../tier/capabilities";
import { TierLockedSection } from "../../../../tier/TierLockedSection";
import FilterPositionIcon from "../GeneralComponents/FilterPositionIcon";

export const canUseFloatingFilter = () => false;
export const canUsePreviewLoaderSettings = () => false;
export const canUsePostMasonry = () => false;
export const canUseScrollToContainer = () => false;

export const resolveMasonryEnabled = () => false;

export const FREE_SCROLL_SETTINGS = Object.freeze({
  desktop: { is_enable: "false", position: "-100" },
  tablet: {},
  mobile: {},
});

export const resolveScrollSettings = () => FREE_SCROLL_SETTINGS;

export const resolveScrollDeviceSettings = (storedScroll, device = "desktop") => {
  const scroll = storedScroll && typeof storedScroll === "object"
    ? storedScroll
    : FREE_SCROLL_SETTINGS;
  const getValue = (targetDevice, key) => {
    const value = scroll?.[targetDevice]?.[key];
    return value === undefined || value === null || value === "" ? undefined : value;
  };
  if (device === "mobile") {
    return {
      is_enable: getValue("mobile", "is_enable") ?? getValue("tablet", "is_enable") ?? getValue("desktop", "is_enable") ?? "false",
      position: String(getValue("mobile", "position") ?? getValue("tablet", "position") ?? getValue("desktop", "position") ?? "-100"),
    };
  }
  if (device === "tablet") {
    return {
      is_enable: getValue("tablet", "is_enable") ?? getValue("desktop", "is_enable") ?? "false",
      position: String(getValue("tablet", "position") ?? getValue("desktop", "position") ?? "-100"),
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
      desktop: { default: { fontSize: "14px", overlay: "rgba(255,255,255,0)" }, hover: {} },
      tablet: { default: {}, hover: {} },
      mobile: { default: {}, hover: {} },
    },
  },
});

export const resolveFilterPosition = () => "inline";
export const resolvePreviewLoaderData = () => FREE_PREVIEW_LOADER;

export function PostFilterPositionSegment({ value, onChange, className = "hoverTabCaf" }) {
  const options = useMemo(() => [
    {
      value: "inline",
      label: <span className="caf-filter-position-tab-label"><FilterPositionIcon mode="inline" /><span>Inline</span></span>,
    },
    {
      value: "floating",
      disabled: true,
      className: "caf-builder-tier-locked-segment-item",
      label: <span className="caf-filter-position-tab-label caf-filter-data-source-tab-label--custom-field"><FilterPositionIcon mode="floating" /><span>Float Button</span><span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">Pro</span></span>,
    },
  ], []);
  return (
    <div className="caf-filter-data-source-segmented-wrap caf-filter-data-source-segmented-wrap--locked">
      <Segmented value="inline" style={{ marginBottom: 8 }} onChange={(nextValue) => nextValue !== "floating" && onChange(nextValue)} className={className} options={options} />
      <Tooltip classNames={{ root: "caf-builder-tooltip caf-builder-tier-locked-tooltip" }} placement="topLeft" title={<span className="caf-builder-tier-locked-section__tooltip-text">Floating filter button is available in Category Ajax Filter Pro. <a href={getUpgradeUrl()} target="_blank" rel="noopener noreferrer" className="caf-builder-tier-locked-section__upgrade-link">Upgrade to Pro</a></span>}>
        <div className="caf-builder-tier-locked-segment-overlay caf-builder-tier-locked-segment-overlay--custom-field" aria-hidden="true" />
      </Tooltip>
    </div>
  );
}

export function PreviewLoaderSettingsLockedSection({ children }) {
  return <TierLockedSection locked sectionTitle="Loader Settings" className="caf-builder-tier-locked-section--preview-loader" upgradeMessage="Custom loader settings are available in Category Ajax Filter Pro. Free uses a simple spinner loader.">{children}</TierLockedSection>;
}

const DND_MISC_ITEM_FEATURE_MAP = Object.freeze({ sorting: "sorting", result_count: "result_counter", selected: "active_filters" });
export const FREE_DND_ALLOWED_MISC_ITEMS = Object.freeze(["pagination"]);
export const FREE_DND_COLUMN_SETTINGS_DISABLED_KEYS = Object.freeze(["filter_top", "filter_bottom", "post_top"]);
export const isDndColumnSettingsDisabled = (columnKey) => FREE_DND_COLUMN_SETTINGS_DISABLED_KEYS.includes(String(columnKey || ""));
export const canUseDndMiscItem = (itemKey) => {
  const key = String(itemKey || "");
  return FREE_DND_ALLOWED_MISC_ITEMS.includes(key) || !DND_MISC_ITEM_FEATURE_MAP[key];
};
export const isDndMiscItemLocked = (itemKey) => !canUseDndMiscItem(itemKey);
export const getDndMiscItemUpgradeMessage = (itemKey) => `${({ sorting: "Sorting", result_count: "Result counter", selected: "Active filters" }[itemKey] || "This layout control")} is available in Category Ajax Filter Pro. Free includes pagination only in Layout Controls.`;
export const resolveDndMiscItemEnabled = (item) => Boolean(item?.key && canUseDndMiscItem(item.key) && item?.settings?.is_enable === "true");
export const hasVisibleMiscZoneContent = (zone, deviceType, isHiddenOnDevice) => Boolean(zone && typeof isHiddenOnDevice === "function" && !isHiddenOnDevice(zone?.settings, deviceType) && Array.isArray(zone?.data) && zone.data.some((item) => resolveDndMiscItemEnabled(item) && !isHiddenOnDevice(item?.settings, deviceType)));
export const shouldRenderMiscZoneWrapper = (zone, deviceType, isHiddenOnDevice, forceRender = false) => Boolean(zone && typeof isHiddenOnDevice === "function" && !isHiddenOnDevice(zone?.settings, deviceType) && (forceRender || hasVisibleMiscZoneContent(zone, deviceType, isHiddenOnDevice)));
export const getDndColumnDraggableItemKeys = (column) => Array.isArray(column?.data) ? column.data.filter((item) => item?.key && !isDndMiscItemLocked(item.key)).map((item) => item.key) : [];
export const isDndColumnDragDropDisabled = (column) => String(column?.key || "") !== "post_bottom" && getDndColumnDraggableItemKeys(column).length === 0;

const FREE_DND_COLUMN_DISPLAY_ORDER = Object.freeze(["post_bottom", "post_top", "filter_top", "filter_bottom"]);
export const getDndColumnsForLayoutControlsDisplay = (columns, filterStatus) => {
  if (!Array.isArray(columns) || !columns.length) return [];
  const visible = filterStatus === "false" ? columns.filter((column) => column?.key !== "filter_top" && column?.key !== "filter_bottom") : columns;
  const map = new Map(visible.filter((column) => column?.key).map((column) => [column.key, column]));
  const ordered = FREE_DND_COLUMN_DISPLAY_ORDER.flatMap((key) => {
    const column = map.get(key);
    map.delete(key);
    return column ? [column] : [];
  });
  return [...ordered, ...map.values()];
};

const DND_COLUMN_FALLBACK_ORDER = Object.freeze(["filter_top", "filter_bottom", "post_top", "post_bottom"]);
export const getDefaultLayoutControlsSelectedItem = (columns) => {
  const columnKey = "post_bottom";
  const layout = Array.isArray(columns) && columns.length ? columns : null;
  let column_index = layout ? layout.findIndex((column) => column?.key === columnKey) : -1;
  if (column_index < 0) column_index = DND_COLUMN_FALLBACK_ORDER.indexOf(columnKey);
  return { type: "column", columnKey, itemKey: null, itemData: null, column_index: column_index < 0 ? 0 : column_index, item_index: null };
};
export const getFreeLayoutControlsSelectedItem = (columns, filterStatus) => getDefaultLayoutControlsSelectedItem(columns, filterStatus);

export const FREE_PAGINATION_TYPES = Object.freeze(["number"]);
export const canUsePaginationType = (paginationType) => String(paginationType || "") === "number";
export const resolvePaginationType = (storedType) => canUsePaginationType(storedType) ? String(storedType) : "number";

export function PaginationTypeSelect({ value, onChange, extraClass = "" }) {
  const options = useMemo(() => [
    { label: <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field"><span>Numbers With Buttons</span><span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">Pro</span></span>, value: "number2", disabled: true },
    { label: "Numbers", value: "number" },
    { label: <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field"><span>Buttons</span><span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">Pro</span></span>, value: "button", disabled: true },
    { label: <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field"><span>Load More</span><span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">Pro</span></span>, value: "load-more", disabled: true },
  ], []);
  return <div className={`module-content-tab-row ${extraClass}`.trim()}><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure pagination type."><label><span>Pagination Type</span></label></Tooltip><Select style={{ width: "100%" }} value={resolvePaginationType(value)} onChange={(nextValue) => canUsePaginationType(nextValue) && onChange(nextValue)} options={options} popupClassName="caf-builder-pagination-type-select-dropdown" /></div>;
}
