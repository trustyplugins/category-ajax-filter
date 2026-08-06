import React from "react";
import { Switch, Tooltip } from "antd";

const PreviewLoaderSettingsPanel = ({ previewLoaderData }) => (
  <div className="module-content-tab-row filter-loader-row-main">
    <div className="module-content-tab-row">
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Configure enable loader."
        >
          <label>
            <span>Enable Loader</span>
          </label>
        </Tooltip>
        <Switch
          checked={previewLoaderData?.is_enable !== "false"}
          disabled
          onChange={() => {}}
        />
      </div>
      <hr className="setting-hr-main"></hr>
    </div>
  </div>
);

export default PreviewLoaderSettingsPanel;
