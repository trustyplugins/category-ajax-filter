import React from "react";
import { Select, Tooltip } from "antd";

export default function PostModuleIconProPanel({ className }) {
  return <div className={className}><div className="caf-builder-setting-row-label"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Module icons are available in Category Ajax Filter Pro."><label>Icons</label></Tooltip><Select disabled value="pro" options={[{ value: "pro", label: "Icon settings (Pro)" }]} /></div></div>;
}
