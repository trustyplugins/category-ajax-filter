import React from "react";
import { Input, Tooltip } from "antd";

/** Free locked chrome for the Pro-only custom URL editor. */
export default function PostLinkCustomFieldProPanel() {
  return (
    <div className="module-content-tab-row">
      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Custom field links are available in Category Ajax Filter Pro.">
        <label>Custom Link</label>
      </Tooltip>
      <Input value="https://example.com/" disabled readOnly />
    </div>
  );
}
