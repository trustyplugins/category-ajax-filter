/**
 * Pro: range slider meta-key select options (all fields; Free locks non-price).
 * Free builds replace with rangeSliderFieldOptions.free.js (_price only).
 */
import React, { useMemo } from "react";
import { canUseRangeSliderCustomFields } from "../shared/filterModuleTier";
import {
  WOO_PRICE_META_KEY,
  WOO_DIMENSION_META_OPTIONS,
  isWooPriceMetaKey,
  isWooDimensionMetaKey,
} from "../../../woocommerce/wooPriceSlider";

export function useRangeFieldSelectOptions({
  customFieldOptions,
  resolvedPostType,
  includeValue,
}) {
  return useMemo(() => {
    const allowCustomFields = canUseRangeSliderCustomFields();
    const mapped = (customFieldOptions || []).map((option) => {
      const value = String(option?.value ?? "");
      const isPrice = isWooPriceMetaKey(value);
      const isDimension = isWooDimensionMetaKey(value);
      const isPlaceholder = value === "0" || value === "";
      if (isPrice || isDimension) {
        const dimLabel = isDimension
          ? WOO_DIMENSION_META_OPTIONS.find((o) => o.value === value)?.label
          : null;
        return {
          ...option,
          label: dimLabel || option.label,
          disabled: !allowCustomFields && !isPrice,
        };
      }
      if (allowCustomFields || isPlaceholder) {
        return option;
      }
      return {
        ...option,
        disabled: true,
        label: (
          <span className="caf-filter-data-source-tab-label">
            {option.label}{" "}
            <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
              Pro
            </span>
          </span>
        ),
      };
    });

    const hasPrice = mapped.some((option) =>
      isWooPriceMetaKey(option?.value)
    );
    if (!hasPrice && resolvedPostType === "product") {
      mapped.splice(1, 0, {
        label: WOO_PRICE_META_KEY,
        value: WOO_PRICE_META_KEY,
      });
    }

    if (allowCustomFields && resolvedPostType === "product") {
      WOO_DIMENSION_META_OPTIONS.forEach((dimOption) => {
        const exists = mapped.some(
          (option) => String(option?.value) === dimOption.value
        );
        if (!exists) {
          mapped.push({ ...dimOption });
        }
      });
    }

    void includeValue;
    return mapped;
  }, [customFieldOptions, resolvedPostType, includeValue]);
}
