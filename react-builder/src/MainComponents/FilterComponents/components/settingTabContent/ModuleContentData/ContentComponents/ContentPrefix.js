import React, { useState } from "react";
import { Input, Tooltip } from "antd";
import { commitFilterModuleSettingsPatch } from "../filterSettingsSnapshot";

function ContentPrefix(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;
  const [value, setValue] = useState(modSettings?.prefix?.globalValue);

  const handleOnChange = (e) => {
    const v = e.target.value;
    setValue(v);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.prefix = {
          globalValue: v,
          condition: false,
        };
      },
    });
  };
  return (
    <div class="module-content-tab-row">
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title={`Configure ${String(props.title || "prefix").toLowerCase()}.`}
      >
        <label>{props.title}</label>
      </Tooltip>
      <Input
        placeholder={props.placeholder}
        onChange={handleOnChange}
        value={value}
      />
    </div>
  );
}

export default ContentPrefix;
