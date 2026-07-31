import React, { useState } from "react";
import { ColorPicker } from "antd";
import { gradientCssToStops, normalizeColorPickerValue, getColorPickerModes, canUseGradientColors } from "../utils/colorPicker";
const ColorMain = (props) => {
  const allowGradient = String(props?.property2 || "").toLowerCase() !== "color";
  const gradientAllowed = allowGradient && canUseGradientColors();
  const item =
    props?.mainBuilder?.common_data?.misc_setting_data?.[props.property1]?.[
      props.property2
    ];
  const [value, setValue] = useState(
    item !== undefined && item !== null && item !== "" ? item : "#000000"
  );
  const pickerValue =
    !gradientAllowed && typeof value === "string" && value.includes("gradient(")
      ? (gradientCssToStops(value)?.[0]?.color || "#000000")
      : typeof value === "string" && value.includes("gradient(")
      ? gradientCssToStops(value) || value
      : value;

  const patchMiscSetting = (nextVal) => {
    const nextBuilder = structuredClone(props.mainBuilder || {});
    if (!nextBuilder.common_data) nextBuilder.common_data = {};
    if (!nextBuilder.common_data.misc_setting_data) {
      nextBuilder.common_data.misc_setting_data = {};
    }
    if (!nextBuilder.common_data.misc_setting_data[props.property1]) {
      nextBuilder.common_data.misc_setting_data[props.property1] = {};
    }
    nextBuilder.common_data.misc_setting_data[props.property1][props.property2] =
      nextVal;
    props.updatedBuilderData(nextBuilder);
  };

  const setColorHexFun = (nextColor, cssValue) => {
    const colorValue = normalizeColorPickerValue(nextColor, "#000000", cssValue);
    setValue(colorValue);
    patchMiscSetting(colorValue);
  };
  return (
    <div className={`caf-builder-setting-row-label`}>
      <label>{props.label}</label>
      <ColorPicker
        className="custom-color"
        value={pickerValue}
        mode={getColorPickerModes(allowGradient)}
        // format="rgb"
        onChange={setColorHexFun}
        placement="center"
      />
    </div>
  );
};

export default ColorMain;
