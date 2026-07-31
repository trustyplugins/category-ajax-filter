/**
 * Checkbox/Dropdown data-source control (Taxonomy vs Custom Field).
 * Free builds replace with filterDataSourceControls.free.js (CTA stub).
 */
import React, { useMemo } from "react";
import { Segmented, Tooltip } from "antd";
import { canUseFeature, getUpgradeUrl } from "../../../../../../tier/capabilities";

export function FilterDataSourceSegment({
  value,
  onChange,
  className = "hoverTabCaf",
}) {
  const customFieldLocked = !canUseFeature("filter_custom_field");
  const options = useMemo(
    () => [
      { label: "Taxonomy", value: "taxonomy" },
      {
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            Custom Field
            {customFieldLocked ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        ),
        value: "custom_field",
        disabled: customFieldLocked,
        className: customFieldLocked
          ? "caf-builder-tier-locked-segment-item"
          : undefined,
      },
    ],
    [customFieldLocked]
  );

  const handleChange = (nextValue) => {
    if (nextValue === "custom_field" && customFieldLocked) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <div
      className={`hoverswitchguard caf-filter-data-source-segmented-wrap${
        customFieldLocked ? " caf-filter-data-source-segmented-wrap--locked" : ""
      }`}
    >
      <Segmented
        value={value}
        style={{ marginBottom: 10 }}
        onChange={handleChange}
        className={`${className} caf-filter-data-source-segmented`}
        options={options}
      />
      {customFieldLocked ? (
        <Tooltip
          classNames={{
            root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
          }}
          placement="topLeft"
          title={
            <span className="caf-builder-tier-locked-section__tooltip-text">
              Custom field filtering is available in Category Ajax Filter Pro.{" "}
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

export default FilterDataSourceSegment;
