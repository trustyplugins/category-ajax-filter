import React, { useState } from "react";
import { Switch } from "antd";
const SwitchMain = (props) => {
  const item =
    props?.mainBuilder?.common_data?.misc_setting_data?.[props.property1]?.[
      props.property2
    ];
  const [value, setValue] = useState(item === "true");
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
    patchMiscSetting(val === true ? "true" : "false");
  };
  return (
    <div className="caf-misc-setting-common-row">
      <label>{props.label}</label>
      <Switch
        checkedChildren={props.checked}
        unCheckedChildren={props.unChecked}
        onChange={handleChange}
        checked={value}
      />
    </div>
  );
};

export default SwitchMain;
