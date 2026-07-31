import React from "react";
import { Switch, Tooltip } from "antd";
import ContentIcons1 from "../ContentComponents/ContentIcons1";

/** Pro-only icon-mode controls. Colour swatch controls stay in their parent. */
export default function FilterShowIconModeProPanel({
  data,
  indexes,
  iconsArray,
  onSettingChange,
  enabled,
  onToggle,
  tab = "all_option",
  label = "Show Icon",
}) {
  return (
    <div className="module-content-tab-row">
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable icon settings."><label>{label}</label></Tooltip>
        <div className="module-content-icon-switch"><Switch onChange={onToggle} checked={enabled} /></div>
      </div>
      {enabled && <ContentIcons1 title="Icons" data={data} indexes={indexes} iconsArray={iconsArray} onSettingChange={onSettingChange} tab={tab} type="" />}
      <hr className="setting-hr-main" />
    </div>
  );
}
