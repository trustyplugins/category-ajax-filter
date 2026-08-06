import React from "react";
import SelectMain from "../ContentComponents/SelectMain";
import SwitchMain from "../ContentComponents/SwitchMain";

export default function FilterLabelCollapseProPanel({
  settingData,
  onSettingChange,
  enabled,
}) {
  return (
    <>
      <div className="module-content-tab-row caf-design-two-half"><SwitchMain label="Enable Collapse" property="enable_toggle" onSettingChange={onSettingChange} data={settingData} currValue={settingData.enable_toggle} /></div>
      {enabled && <><SelectMain label="Toggle Icon Position" property="toggle_position" classn="caf-design-two-half" options={[{ label: "Left", value: "left" }, { label: "Right", value: "right" }]} onSettingChange={onSettingChange} data={settingData} /><div className="module-content-tab-row caf-design-two-half"><SwitchMain label="Default Collapsed" property="close_toggle" onSettingChange={onSettingChange} data={settingData} currValue={settingData.close_toggle} /></div></>}
    </>
  );
}
