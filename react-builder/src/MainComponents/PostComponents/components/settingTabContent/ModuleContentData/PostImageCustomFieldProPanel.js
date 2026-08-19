import React from "react";
import { Select, Tooltip } from "antd";

/**
 * Pro implementation for the custom-field image source controls.
 * The Free build replaces this module with locked, non-interactive chrome.
 */
export default function PostImageCustomFieldProPanel({
  modSettings,
  metaObject,
  cfImageSizes,
  cfLoading,
  cfFieldListLoading,
  imageOptions,
  onCustomFieldChange,
  onImageSizeChange,
}) {
  return (
    <>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select custom field key for image URL.">
          <label>Custom Field</label>
        </Tooltip>
        <Select
          defaultValue="0"
          style={{ width: "100%" }}
          value={modSettings?.custom_field}
          onChange={onCustomFieldChange}
          options={metaObject}
          loading={cfLoading || cfFieldListLoading}
        />
      </div>
      {cfImageSizes && Object.keys(cfImageSizes).length > 0 && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select registered image size.">
            <label>Image Size</label>
          </Tooltip>
          <Select
            defaultValue={modSettings?.image_size}
            style={{ width: "100%" }}
            value={modSettings?.image_size}
            onChange={onImageSizeChange}
            options={imageOptions}
            className="image_size_caf"
          />
        </div>
      )}
    </>
  );
}
