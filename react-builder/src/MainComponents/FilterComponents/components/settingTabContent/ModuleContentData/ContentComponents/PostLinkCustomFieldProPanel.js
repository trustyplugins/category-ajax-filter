import React from "react";
import { Input, Tooltip } from "antd";

/** Pro-only custom URL editor for post module links. */
export default function PostLinkCustomFieldProPanel({ value, onChange }) {
  return (
    <div className="module-content-tab-row">
      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enter the destination URL.">
        <label>Custom Link</label>
      </Tooltip>
      <Input
        placeholder="https://example.com/"
        onChange={onChange}
        value={value}
      />
    </div>
  );
}
