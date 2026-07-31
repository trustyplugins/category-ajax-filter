import React, { useState, useEffect } from "react";
import { Input } from "antd";
const InputMain = (props) => {
  const item =
    props?.mainBuilder?.common_data?.misc_setting_data?.[props.property1]?.[
      props.property2
    ];
  const [value, setValue] = useState(
    item !== undefined && item !== null && item !== "" ? item : ""
  );
  const patchMiscSetting = (nextVal) => {
    const nextBuilder = structuredClone(props.mainBuilder || {});
    if (!nextBuilder.common_data) nextBuilder.common_data = {};
    if (!nextBuilder.common_data.misc_setting_data) {
      nextBuilder.common_data.misc_setting_data = {};
    }
    if (!nextBuilder.common_data.misc_setting_data[props.property1]) {
      nextBuilder.common_data.misc_setting_data[props.property1] = {};
    }
    nextBuilder.common_data.misc_setting_data[props.property1][
      props.property2
    ] = nextVal;
    props.updatedBuilderData(nextBuilder);
  };
  const handleChange = (val) => {
    setValue(val);
    patchMiscSetting(val);
  };
  return (
    <div className="caf-misc-setting-common-row">
      <label>{props.label}</label>
      <Input
        type={props.type}
        value={value}
        defaultValue={value}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default InputMain;
