import React from "react";
import { Select, Switch, Tooltip } from "antd";
import ContentIcons1 from "./ContentComponents/ContentIcons1";

export default function SearchClearIconProPanel({
  data,
  indexes,
  onSettingChange,
  enabled,
  icons,
  position,
  visibility,
  onToggle,
  onPositionChange,
  onVisibilityChange,
  IconPositionTabs,
}) {
  return (
    <div className="module-search-clear-row">
      <label className="setting-label-main">Clear Input</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip placement="topLeft" title="Turn clear button on or off.">
          <label>Enable</label>
        </Tooltip>
        <Switch onChange={onToggle} checked={enabled} />
      </div>
      {enabled && icons && (
        <>
          <div className="module-content-tab-row">
            <Tooltip placement="topLeft" title="Select the clear button icon.">
              <label>Clear Icon</label>
            </Tooltip>
            <ContentIcons1
              title="Icons"
              data={data}
              indexes={indexes}
              iconsArray={icons}
              onSettingChange={onSettingChange}
              tab="clear_icon"
              type=""
            />
          </div>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip placement="topLeft" title="Choose clear icon placement in the field.">
              <label>Icon Position</label>
            </Tooltip>
            <IconPositionTabs value={position} onChange={onPositionChange} />
          </div>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip placement="topLeft" title="Control when the clear button is visible.">
              <label>Visibility</label>
            </Tooltip>
            <Select
              style={{ width: "100%" }}
              onChange={onVisibilityChange}
              options={[
                { value: "type", label: "On Type" },
                { value: "always", label: "Always Visible" },
              ]}
              value={visibility}
            />
          </div>
        </>
      )}
      <hr className="setting-hr-main" />
    </div>
  );
}
