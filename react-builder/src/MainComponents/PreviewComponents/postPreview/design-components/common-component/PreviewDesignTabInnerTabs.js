import React, { useEffect, useMemo } from "react";
import { Tabs } from "antd";

/**
 * Preview design sub-tabs inside a Collapse panel. When the parent panel opens,
 * selects the first available tab if the current activeKey is not in items.
 */
export function PreviewDesignTabInnerTabs({
  isCollapseOpen = false,
  activeKey,
  onChange,
  items,
  ...rest
}) {
  const filteredItems = useMemo(
    () => (Array.isArray(items) ? items.filter(Boolean) : []),
    [items],
  );

  useEffect(() => {
    if (!isCollapseOpen || typeof onChange !== "function") {
      return;
    }

    const keys = filteredItems.map((item) => item.key);
    if (!keys.length) {
      return;
    }

    const isActiveKeyValid =
      activeKey !== undefined &&
      activeKey !== null &&
      activeKey !== "" &&
      keys.includes(activeKey);

    if (!isActiveKeyValid) {
      onChange(keys[0]);
    }
  }, [isCollapseOpen, filteredItems, activeKey, onChange]);

  return (
    <Tabs
      {...rest}
      activeKey={activeKey}
      onChange={onChange}
      items={filteredItems}
    />
  );
}
