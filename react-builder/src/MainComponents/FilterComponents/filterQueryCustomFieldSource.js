/**
 * Pro: Filter-with-query custom field source checkbox.
 * Free builds replace with filterQueryCustomFieldSource.free.js.
 */
import React from "react";
import { Checkbox } from "antd";
import { TierLockedWrap } from "../../tier/TierLockedWrap";
import { canUseFilterCustomField } from "./components/settingTabContent/ModuleContentData/shared/filterModuleTier";

export function FilterQueryCustomFieldSource({
  checked,
  onChange,
}) {
  return (
    <TierLockedWrap
      locked={!canUseFilterCustomField()}
      className="caf-builder-tier-locked-query-custom-field"
      upgradeMessage="Custom field query filters are available in Category Ajax Filter Pro."
      showProBadge
    >
      <div className="source-checkbox-custom-field">
        <Checkbox
          checked={canUseFilterCustomField() ? checked : false}
          disabled={!canUseFilterCustomField()}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label>Custom Field</label>
      </div>
    </TierLockedWrap>
  );
}

export default FilterQueryCustomFieldSource;
