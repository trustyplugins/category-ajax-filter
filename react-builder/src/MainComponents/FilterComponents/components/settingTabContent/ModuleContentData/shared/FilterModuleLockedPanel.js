import React from "react";
import { TierLockedSection } from "../../../../../../tier/TierLockedSection";
import { FILTER_MODULE_PRO_MESSAGE } from "./filterModuleTier";

export function FilterModuleLockedPanel({
  title,
  upgradeMessage = FILTER_MODULE_PRO_MESSAGE,
  className = "caf-builder-tier-locked-filter-module-settings",
}) {
  return (
    <TierLockedSection
      locked
      sectionTitle={title}
      className={className}
      upgradeMessage={upgradeMessage}
    >
      <p className="caf-builder-tier-locked-filter-module-settings__text">
        Upgrade to Pro to configure this module.
      </p>
    </TierLockedSection>
  );
}

export default FilterModuleLockedPanel;
