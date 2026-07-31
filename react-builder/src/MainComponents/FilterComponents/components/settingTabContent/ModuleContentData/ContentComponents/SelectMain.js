import React, { useState } from "react";
import { Select } from "antd";
import { Tooltip } from "antd";
import { useEffect } from "react";
const SelectMain = ({
  options,
  onSettingChange,
  label,
  property,
  property2 = "",
  data,
  classn,
  labelTooltip = "",
}) => {
  const [value, setValue] = useState(options[0].value);
  useEffect(() => {
    if (property2 != "") {
      setValue(data[property][property2]);
    } else {
      setValue(data[property] ?? options?.[0]?.value);
    }
  }, [data]);
  const onChange = (val) => {
    setValue(val);
    let items = { ...data };
    if (property2 != "") {
      items[property][property2] = val;
    } else {
      items[property] = val;
    }
    onSettingChange(items);
  };
  const tooltipTitle = labelTooltip || (label ? `Configure ${String(label).toLowerCase()}.` : "");
  return (
    <div className={`module-content-tab-row ${classn ? classn : ''}`}> 
      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={tooltipTitle}>
        <label>{label}</label>
      </Tooltip>
      <Select
        className="caf-select-post-type caf-header-dropdown"
        defaultValue={value}
        options={options}
        onChange={onChange}
        style={{ width: "100%" }}
        value={value}
      />
    </div>
  );
};

export default SelectMain;
