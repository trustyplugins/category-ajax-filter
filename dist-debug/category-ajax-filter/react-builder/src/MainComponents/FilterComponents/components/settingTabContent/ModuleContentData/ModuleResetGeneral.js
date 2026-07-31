import React, { useState } from "react";
import { Input, Tooltip } from "antd";
import { commitFilterModuleSettingsPatch } from "./filterSettingsSnapshot";
import {
  ResetModuleIconLockedSection,
} from "./shared/filterModuleTier";
import ResetModuleIconProPanel from "./ResetModuleIconProPanel";

const ModuleResetGeneral = (props) => {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  let settingData = {
    ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings,
  };

  const [resetlabel, setResetlabel] = useState(settingData?.reset_label ?? "");
  const handleChange = (val) => {
    setResetlabel(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.reset_label = val;
      },
    });
  };

  return (
    <>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Set reset button label."
        >
          <label>Text</label>
        </Tooltip>
        <Input
          onChange={(e) => handleChange(e.target.value)}
          value={resetlabel}
        />
      </div>

      <div className="caf-filter-label-inner-row">
        <ResetModuleIconLockedSection>
          <ResetModuleIconProPanel {...props} />
        </ResetModuleIconLockedSection>
      </div>
    </>
  );
};

export default ModuleResetGeneral;
