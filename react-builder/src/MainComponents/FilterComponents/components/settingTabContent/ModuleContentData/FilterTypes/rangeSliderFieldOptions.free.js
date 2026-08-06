/**
 * Free: range slider may only target WooCommerce `_price` (no Pro meta-key list).
 */
import { useMemo } from "react";
import { WOO_PRICE_META_KEY } from "../../../woocommerce/wooPriceSlider";

export function useRangeFieldSelectOptions({ resolvedPostType }) {
  return useMemo(() => {
    const options = [{ label: "Select Field", value: "0" }];
    if (resolvedPostType === "product") {
      options.push({
        label: WOO_PRICE_META_KEY,
        value: WOO_PRICE_META_KEY,
      });
    }
    return options;
  }, [resolvedPostType]);
}
