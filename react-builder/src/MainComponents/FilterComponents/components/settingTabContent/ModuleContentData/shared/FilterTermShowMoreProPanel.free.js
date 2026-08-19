import React from "react";
import { Switch } from "antd";

/** Free keeps the same locked Show More chrome without shipping its settings body. */
export default function FilterTermShowMoreProPanel() {
  return (
    <div className="module-content-tab-row no-pad-0">
      <label className="setting-label-main">Show More</label>
      <div className="module-content-tab-row caf-design-two-half">
        <label>Enable</label>
        <Switch checked={false} disabled />
      </div>
      <hr className="setting-hr-main"></hr>
    </div>
  );
}
