import React, { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { Tooltip } from "antd";
import { commitFilterModuleSettingsPatch } from "./filterSettingsSnapshot";
import {
  CustomTextModuleIconLockedSection,
} from "./shared/filterModuleTier";
import CustomTextModuleIconProPanel from "./CustomTextModuleIconProPanel";

const ModuleCustomTextFilterGeneral = (props) => {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;

  const [text, setText] = useState(modSettings?.customText ?? "");
  useEffect(() => {
    setText(modSettings?.customText ?? "");
  }, [props.data, rowindex, columnindex, moduleindex]);

  const onChangeText = (e) => {
    const value = e.target.value;
    setText(value);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (settings) => {
        settings.customText = value;
      },
    });
  };

  return (
    <>
      <label className="setting-label-main">Custom Text</label>
      <div className="module-content-tab-row">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Enter custom text or HTML content."
        >
          <label>Content</label>
        </Tooltip>
        <TextArea
          placeholder="Add your text here ...."
          onChange={onChangeText}
          value={text}
        />
      </div>

      <div className="caf-filter-label-inner-row">
        <CustomTextModuleIconLockedSection>
          <CustomTextModuleIconProPanel {...props} />
        </CustomTextModuleIconLockedSection>
      </div>
    </>
  );
};

export default ModuleCustomTextFilterGeneral;
