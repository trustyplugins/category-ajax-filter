/**
 * Ant Design Tabs `items` for post DesignTab sub-areas (prefix/suffix modules).
 * Pure data; no JSX. Moved from DesignTab.js for smaller steps toward post/filter parity.
 */

export function buildPostDesignTabSubTabLayoutItems({
  module,
  item,
  modulesKeysArray,
}) {
  const items = [
    modulesKeysArray.includes(module?.key) &&
    (item?.prefix?.is_enable === "true" || item?.suffix?.is_enable === "true")
      ? {
          key: "container",
          label:
            modulesKeysArray.includes(module?.key) &&
            item?.prefix?.is_enable === "true"
              ? "Prefix + Content"
              : modulesKeysArray.includes(module?.key) &&
                  item?.suffix?.is_enable === "true"
                ? "Content + Suffix"
                : "Main",
        }
      : null,
    modulesKeysArray.includes(module?.key) &&
    item?.prefix?.is_enable === "true" &&
    item?.suffix?.is_enable === "true"
      ? {
          key: "meta",
          label: "Content + Suffix",
        }
      : null,
  ].filter(Boolean);
  const showStarTab =
    module?.key === "woo_product_rating" &&
    (item?.rating_display || "stars") === "stars";
  if (!showStarTab) {
    return items;
  }
  return [
    ...items,
    {
      key: "star",
      label: "Star",
    },
  ];
}

export function buildPostDesignTabSubTabCommonItems({ item }) {
  return [
    {
      key: "container",
      label: "All",
    },
    item?.prefix?.is_enable === "true"
      ? {
          key: "prefix",
          label: "Prefix",
        }
      : null,
    item?.suffix?.is_enable === "true"
      ? {
          key: "suffix",
          label: "Suffix",
        }
      : null,
  ].filter(Boolean);
}

/** Text collapse only: All / Prefix / Suffix + Star (product rating + display as stars). */
export function buildPostDesignTabTextSubTabItems({ item, module }) {
  const items = buildPostDesignTabSubTabCommonItems({ item });
  const showStarTab =
    module?.key === "woo_product_rating" &&
    (item?.rating_display || "stars") === "stars";
  if (!showStarTab) {
    return items;
  }
  return [
    ...items,
    {
      key: "star",
      label: "Star",
    },
  ];
}

export function shouldShowPostDesignTabTextSubTabs({ item, module, modulesKeysArray }) {
  const hasPrefixSuffixTabs =
    modulesKeysArray.includes(module?.key) &&
    (item?.prefix?.is_enable === "true" || item?.suffix?.is_enable === "true");
  const showStarTab =
    module?.key === "woo_product_rating" &&
    (item?.rating_display || "stars") === "stars";
  return hasPrefixSuffixTabs || showStarTab;
}
