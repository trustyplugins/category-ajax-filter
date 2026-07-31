import React from "react";
import { Switch, Tooltip } from "antd";
import ContentIcons1 from "../ContentComponents/ContentIcons1";

export default function FilterLabelShowIconProPanel({
  data,
  indexes,
  iconsArray,
  onSettingChange,
  enabled,
  onToggle,
  label = "Show Icon",
}) {
  return (
    <div className="module-content-tab-row caf-builder-show-label-icon">
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable label icon settings."><label>{label}</label></Tooltip>
        <div className="module-content-icon-switch"><Switch onChange={onToggle} checked={enabled} /></div>
      </div>
      {enabled && <ContentIcons1 title="Icons" data={data} indexes={indexes} iconsArray={iconsArray} onSettingChange={onSettingChange} tab="label" type="" />}
    </div>
  );
}
