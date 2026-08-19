import React from "react";
import { Switch, Tooltip } from "antd";

/** Static locked icon-mode chrome; Free colour swatches remain in the parent. */
export default function FilterShowIconModeProPanel({ label = "Show Icon" }) {
  return <div className="module-content-tab-row"><div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Icon mode is available in Category Ajax Filter Pro."><label>{label}</label></Tooltip><div className="module-content-icon-switch"><Switch checked={false} disabled /></div></div><hr className="setting-hr-main" /></div>;
}
