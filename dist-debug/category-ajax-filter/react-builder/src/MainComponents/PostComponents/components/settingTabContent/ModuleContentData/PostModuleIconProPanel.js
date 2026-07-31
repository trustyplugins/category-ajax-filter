import React from "react";
import { Skeleton } from "antd";
import ContentIcons from "./ContentComponents/ContentIcons";

export default function PostModuleIconProPanel({
  module,
  data,
  indexes,
  iconsArray,
  onSettingChange,
  className,
}) {
  return (
    <div className={className}>
      <div className="caf-builder-setting-row-label">
        {iconsArray.length > 0 ? <ContentIcons title="Icons" labelType={module?.key ?? ""} data={data} indexes={indexes} iconsArray={iconsArray} onSettingChange={onSettingChange} /> : <Skeleton active />}
      </div>
    </div>
  );
}
