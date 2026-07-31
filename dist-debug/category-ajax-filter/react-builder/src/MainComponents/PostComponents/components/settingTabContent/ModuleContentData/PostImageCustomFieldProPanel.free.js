import React from "react";
import { Select, Tooltip } from "antd";

/** Free locked chrome for the Pro custom-field image source panel. */
export default function PostImageCustomFieldProPanel() {
  return (
    <div className="module-content-tab-row caf-design-two-half">
      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Custom field image source is available in Category Ajax Filter Pro.">
        <label>Custom Field</label>
      </Tooltip>
      <Select
        value="0"
        disabled
        style={{ width: "100%" }}
        options={[{ value: "0", label: "Select Custom Field" }]}
      />
    </div>
  );
}
