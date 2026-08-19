import React, { useState, useEffect } from "react";
import { Col, Input, Row, Slider, Select, Space } from "antd";
const SelectMain = (props) => {
  const item =
    props?.mainBuilder?.common_data?.misc_setting_data?.[props.property1]?.[
      props.property2
    ];
  const [value, setValue] = useState(
    item !== undefined && item !== null && item !== ""
      ? item
      : props.options?.[0]?.value
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
      <Select
        defaultValue={value}
        style={{
          width: "100%",
        }}
        onChange={handleChange}
        options={[...props.options]}
        value={value}
      />
    </div>
  );
};

export default SelectMain;
