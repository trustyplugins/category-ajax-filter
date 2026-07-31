/**
 * Ant Design Tabs `items` for post DesignTab sub-areas (prefix/suffix modules).
 * Pure data; no JSX. Moved from DesignTab.js for smaller steps toward post/filter parity.
 */

export function buildPostDesignTabSubTabLayoutItems({
  module,
  item,
  modulesKeysArray,
}) {
  return [
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
