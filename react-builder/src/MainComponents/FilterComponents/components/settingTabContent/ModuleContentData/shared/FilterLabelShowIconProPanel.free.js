import React from "react";
import { Switch, Tooltip } from "antd";

export default function FilterLabelShowIconProPanel({ label = "Show Icon" }) {
  return (
    <div className="module-content-tab-row caf-builder-show-label-icon">
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Label icon settings are available in Category Ajax Filter Pro."><label>{label}</label></Tooltip>
        <div className="module-content-icon-switch"><Switch checked={false} disabled /></div>
      </div>
    </div>
  );
}
