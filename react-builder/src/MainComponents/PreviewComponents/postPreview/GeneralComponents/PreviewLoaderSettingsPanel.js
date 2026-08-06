import React from "react";
import { Tooltip } from "antd";
import SwitchMain from "./CommonComponents/SwitchMain";
import InputMain from "./CommonComponents/InputMain";
import IconUpload from "./IconUpload";
import ColorMain from "../design-components/common-component/ColorMain";

const PreviewLoaderSettingsPanel = ({
  previewLoaderData,
  onChangeData,
  handleSelectIcon,
  selctedIcon,
  LoaderIconStyle,
  deviceSwitch,
}) => (
  <div className="module-content-tab-row filter-loader-row-main">
    <div className="module-content-tab-row">
      <SwitchMain
        onChangeData={onChangeData}
        checked=""
        unchecked=""
        data={previewLoaderData}
        property="is_enable"
        label="Enable Loader"
        moduleKey="loader"
      />
      {previewLoaderData?.is_enable == "true" && (
        <>
          {previewLoaderData?.loader_type == "false" && (
            <InputMain
              onChangeData={onChangeData}
              defaultValue="Loading..."
              data={previewLoaderData}
              property="loader_text"
              label="Add Loader Text"
              type="text"
              moduleKey="loader"
            />
          )}
          {previewLoaderData?.loader_type == "true" && (
            <>
              {previewLoaderData?.icon_data.source == "url" && (
                <InputMain
                  onChangeData={onChangeData}
                  defaultValue=""
                  data={previewLoaderData}
                  property="url"
                  parentKey="icon_data"
                  label="Paste Icon URL Here"
                  type="text"
                  moduleKey="loader"
                />
              )}
              {previewLoaderData?.icon_data.source == "upload" && (
                <IconUpload
                  data={previewLoaderData}
                  parentKey="icon_data"
                  property="upload"
                  label="Select Icon "
                  onChangeData={onChangeData}
                  moduleKey="loader"
                />
              )}
              {previewLoaderData?.icon_data.source == "list" && (
                <div className="module-content-tab-row">
                  <Tooltip
                    classNames={{ root: "caf-builder-tooltip" }}
                    placement="topLeft"
                    title="Choose loader icon."
                  >
                    <label>{"Loader Style"}</label>
                  </Tooltip>
                  <div className="caf-post-preview-icons-section loader">
                    <ul className="caf-post-preview-icons-list">
                      {[
                        "fa fa-spinner fa-pulse",
                        "fa fa-circle-o-notch fa-spin",
                        "fa fa-refresh fa-spin",
                        "fa fa-spinner fa-spin",
                      ].map((icon) => (
                        <li
                          key={icon}
                          className={`caf-post-preview-icon-single-item ${
                            selctedIcon === icon ? "active" : ""
                          }`}
                          onClick={() => handleSelectIcon(icon)}
                        >
                          <i className={icon}></i>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
          <SwitchMain
            onChangeData={onChangeData}
            checked=""
            unchecked=""
            data={previewLoaderData}
            property="overlay"
            label="Background Overlay"
            moduleKey="loader"
          />
          {previewLoaderData?.overlay == "true" && (
            <ColorMain
              data={previewLoaderData?.icon_data}
              onChangeStyle={LoaderIconStyle}
              property="overlay"
              defaultValue="#00000080"
              label="Overlay Color"
              styleState="default"
              deviceSwitch={deviceSwitch}
              style="style"
              extraClass=" module-content-tab-row caf-design-two-half caf-pad-lr-0"
              moduleKey="loader"
            />
          )}
        </>
      )}
      <hr className="setting-hr-main"></hr>
    </div>
  </div>
);

export default PreviewLoaderSettingsPanel;
