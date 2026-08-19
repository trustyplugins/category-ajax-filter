import React, { useEffect, useState } from "react";
import { Input, Switch, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "./postLayoutSnapshot";

function ModuleExcerptContent(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;

  const [lengthValue, setLengthValue] = useState(modSettings?.excerptLength);
  const [iconSwitch, setIconSwitch] = useState(modSettings?.htmlRender);

  useEffect(() => {
    setLengthValue(modSettings?.excerptLength);
    setIconSwitch(modSettings?.htmlRender);
  }, [props.data, rowindex, columnindex, moduleindex]);

  const ChangeLength = (e) => {
    const v = e.target.value;
    setLengthValue(v);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.excerptLength = v;
      },
    });
  };
  const onIconSwitch = (checked) => {
    setIconSwitch(checked);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.htmlRender = checked;
      },
    });
  };
  return (
    <>
      <label className="setting-label-main">Description</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set description length in words. Applies to preview placeholder and frontend output.">
          <label>Word Limit</label>
        </Tooltip>
        <Input
          type="number"
          placeholder="20"
          onChange={ChangeLength}
          value={lengthValue}
        />
      </div>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="When enabled, preserves safe HTML from post content. When disabled, shows plain excerpt text.">
          <label>Enable HTML</label>
        </Tooltip>
        <div className="module-content-icon-switch">
          <Switch onChange={onIconSwitch} checked={iconSwitch} />
        </div>
      </div>
    </>
  );
}

export default ModuleExcerptContent;
