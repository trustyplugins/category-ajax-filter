import React from "react";
import FilterModuleLockedPanel from "./shared/FilterModuleLockedPanel";

/**
 * Free build replacement: rating filter configuration is Pro-only.
 * Keep the same locked-panel treatment without shipping rating settings logic.
 */
const WooFilterSettings = () => (
  <FilterModuleLockedPanel
    title="Star Rating Filter"
    upgradeMessage="Star rating filter is available in Category Ajax Filter Pro."
  />
);

export default WooFilterSettings;
