/**
 * Free: query-builder custom-field source toggle — CTA only.
 */
import React from "react";
import { TierLockedSection } from "../../tier/TierLockedSection";

export function FilterQueryCustomFieldSource() {
  return (
    <div className="source-checkbox-custom-field caf-free-pro-upsell-row">
      <TierLockedSection
        locked
        sectionTitle="Custom Field"
        upgradeMessage="Custom field query filters are available in the separate Category Ajax Filter Pro plugin."
      >
        <p className="caf-free-pro-upsell-copy">
          Build queries with custom fields in Category Ajax Filter Pro.
        </p>
      </TierLockedSection>
    </div>
  );
}

export default FilterQueryCustomFieldSource;
