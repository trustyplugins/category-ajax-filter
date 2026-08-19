import React from "react";
import { Input, Tooltip } from "antd";
import SelectMain from "../ContentComponents/SelectMain";
import SwitchMain from "../ContentComponents/SwitchMain";

export default function FilterTermShowMoreProPanel({
  settingData,
  onSettingChange,
}) {
  return (
    <div className="module-content-tab-row no-pad-0">
      <label className="setting-label-main">Show More</label>
      <div className="module-content-tab-row caf-design-two-half">
        <SwitchMain label="Enable" property="term_show_more" onSettingChange={onSettingChange} data={settingData} currValue={settingData?.term_show_more ?? "false"} />
      </div>
      {settingData?.term_show_more === "true" && (
        <>
          <div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Max terms shown before Show more. Default/selected terms always stay visible and count toward this limit."><label>Visible Limit</label></Tooltip><Input type="number" min={1} value={settingData?.term_visible_limit ?? "10"} onChange={(e) => onSettingChange({ ...settingData, term_visible_limit: e.target.value })} /></div>
          <div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Label for the expand button."><label>Show More Label</label></Tooltip><Input value={settingData?.show_more_label ?? "Show more"} onChange={(e) => onSettingChange({ ...settingData, show_more_label: e.target.value })} /></div>
          <div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Label for the collapse button."><label>Show Less Label</label></Tooltip><Input value={settingData?.show_less_label ?? "Show less"} onChange={(e) => onSettingChange({ ...settingData, show_less_label: e.target.value })} /></div>
          <div className="module-content-tab-row caf-design-two-half"><SwitchMain label="Show Remaining Count" property="show_more_count" onSettingChange={onSettingChange} data={settingData} currValue={settingData?.show_more_count ?? "true"} /></div>
          {settingData?.show_more_count !== "false" && <SelectMain label="Separator" property="show_more_count_separator" classn="caf-design-two-half" options={[{ value: "brackets", label: "(Brackets)" }, { value: "hyphen", label: "Hyphen - " }, { value: "none", label: "None" }, { value: "custom", label: "Custom" }]} onSettingChange={onSettingChange} data={settingData} defaultValue={settingData?.show_more_count_separator ?? "brackets"} />}
          {settingData?.show_more_count_separator === "custom" && <><div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set remaining count prefix text."><label>Prefix</label></Tooltip><input type="text" value={settingData?.show_more_count_prefix || ""} placeholder="e.g. (" onChange={(e) => onSettingChange({ ...settingData, show_more_count_prefix: e.target.value })} /></div><div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set remaining count suffix text."><label>Suffix</label></Tooltip><input type="text" value={settingData?.show_more_count_suffix || ""} placeholder="e.g. )" onChange={(e) => onSettingChange({ ...settingData, show_more_count_suffix: e.target.value })} /></div></>}
        </>
      )}
      <hr className="setting-hr-main"></hr>
    </div>
  );
}
