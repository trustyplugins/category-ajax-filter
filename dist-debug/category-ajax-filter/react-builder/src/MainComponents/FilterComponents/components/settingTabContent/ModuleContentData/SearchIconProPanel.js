import React from "react";
import { Switch, Tooltip } from "antd";
import ContentIcons1 from "./ContentComponents/ContentIcons1";

/**
 * The customizable search-icon controls. Free retains its fixed default icon
 * in filterModuleTier.free.js and replaces this module with NullModule.
 */
export default function SearchIconProPanel({
  data,
  indexes,
  onSettingChange,
  enabled,
  icons,
  position,
  onToggle,
  onPositionChange,
  IconPositionTabs,
}) {
  return (
    <div className="module-content-tab-row">
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip placement="topLeft" title="Show a search icon inside the input.">
          <label>Show Icon</label>
        </Tooltip>
        <Switch onChange={onToggle} checked={enabled} />
      </div>
      {enabled && icons && (
        <>
          <div className="module-content-tab-row">
            <ContentIcons1
              title="Icons"
              data={data}
              indexes={indexes}
              iconsArray={icons}
              onSettingChange={onSettingChange}
              tab="search_icon"
              type=""
            />
          </div>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip placement="topLeft" title="Choose where the icon appears in the field.">
              <label>Icon Position</label>
            </Tooltip>
            <IconPositionTabs value={position} onChange={onPositionChange} />
          </div>
        </>
      )}
    </div>
  );
}
