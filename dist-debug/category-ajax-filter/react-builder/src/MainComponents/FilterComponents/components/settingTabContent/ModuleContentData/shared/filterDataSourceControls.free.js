/**
 * Free: same Taxonomy | Custom Field tabs as Pro, with Custom Field locked (Pro badge + overlay).
 * Does not unlock or render custom-field settings — CF settings stay Pro-gated in parent.
 */
import React, { useMemo } from "react";
import { Segmented, Tooltip } from "antd";
import { getUpgradeUrl } from "../../../../../../tier/capabilities";

export function FilterDataSourceSegment({
  value,
  onChange,
  className = "hoverTabCaf",
}) {
  const safeValue = value === "custom_field" ? "taxonomy" : value || "taxonomy";

  const options = useMemo(
    () => [
      { label: "Taxonomy", value: "taxonomy" },
      {
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            Custom Field
            <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
              Pro
            </span>
          </span>
        ),
        value: "custom_field",
        disabled: true,
        className: "caf-builder-tier-locked-segment-item",
      },
    ],
    []
  );

  return (
    <div className="hoverswitchguard caf-filter-data-source-segmented-wrap caf-filter-data-source-segmented-wrap--locked">
      <Segmented
        value={safeValue}
        style={{ marginBottom: 10 }}
        onChange={(nextValue) => {
          if (nextValue === "custom_field") {
            return;
          }
          onChange(nextValue);
        }}
        className={`${className} caf-filter-data-source-segmented`}
        options={options}
      />
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
    </div>
  );
}

export default FilterDataSourceSegment;
