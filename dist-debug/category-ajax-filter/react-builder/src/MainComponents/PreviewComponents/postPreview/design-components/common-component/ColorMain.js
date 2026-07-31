import React, { useState, useMemo, useEffect } from "react";
import { ColorPicker, theme, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { gradientCssToStops, normalizeColorPickerValue, getColorPickerModes, canUseGradientColors } from "../../../../utils/colorPicker";
const ColorMain = (props) => {
  const {
    property,
    label,
    styleState = "default",
    defaultValue,
    deviceSwitch,
    style,
    extraClass = "",
    moduleKey = "",
    //styleTab ="",
    isMeta = "",
  } = props;
  const normalizedProperty = String(property || "").toLowerCase();
  const allowGradient =
    normalizedProperty !== "color" && normalizedProperty !== "overlay";
  const gradientAllowed = allowGradient && canUseGradientColors();
  const styleTab = props?.styleTab || "";
  const effectiveStyleTab =
    styleTab === "container" && typeof isMeta === "string" && isMeta !== ""
      ? isMeta
      : styleTab;
  let currentValue = "";
  let device = "desktop";
  if (deviceSwitch) {
    device = deviceSwitch;
  }

  const styleScope =
    effectiveStyleTab !== ""
      ? props.data?.[style]?.[effectiveStyleTab]
      : props.data?.[style];
  const readScopedStyleValue = () => {
    const directValue = styleScope?.[device]?.[styleState]?.[property];
    if (directValue !== undefined && directValue !== null && directValue !== "") {
      return directValue;
    }

    if (device === "desktop") {
      if (
        styleState === "hover" ||
        styleState === "selected" ||
        styleState === "placeholder"
      ) {
        return styleScope?.[device]?.default?.[property] || "";
      }
      return "";
    }

    if (device === "tablet" || device === "mobile") {
      if (styleState === "default") {
        return styleScope?.desktop?.default?.[property] || "";
      }

      return (
        styleScope?.[device]?.default?.[property] ||
        styleScope?.desktop?.hover?.[property] ||
        styleScope?.desktop?.default?.[property] ||
        ""
      );
    }

    return "";
  };
  currentValue = readScopedStyleValue();

  const normalizedCurrentValue = normalizeColorPickerValue(currentValue, defaultValue);
  const normalizedStops =
    typeof normalizedCurrentValue === "string" &&
    normalizedCurrentValue.includes("gradient(")
      ? gradientCssToStops(normalizedCurrentValue)
      : null;
  const pickerValue = useMemo(
    () =>
      !gradientAllowed && normalizedStops?.length
        ? normalizedStops[0].color
        : normalizedStops
        ? normalizedStops || normalizedCurrentValue
        : normalizedCurrentValue,
    [gradientAllowed, normalizedStops, normalizedCurrentValue]
  );
  const serializePickerValue = (value) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return String(value ?? "");
  };
  const pickerValueKey = serializePickerValue(pickerValue);
  const normalizedCurrentValueKey = serializePickerValue(normalizedCurrentValue);
  const [localPickerValue, setLocalPickerValue] = useState(pickerValue);

  useEffect(() => {
    if (serializePickerValue(localPickerValue) !== pickerValueKey) {
      setLocalPickerValue(pickerValue);
    }
  }, [pickerValue, pickerValueKey, styleState, device, effectiveStyleTab, property]);

  const setColorHexFun = (value, cssValue) => {
    // Keep AntD picker responsive while avoiding global preview re-renders
    // on every drag step.
    const normalized = normalizeColorPickerValue(value, defaultValue, cssValue);
    setLocalPickerValue(normalized);
    if (serializePickerValue(normalized) !== normalizedCurrentValueKey) {
      ChangeStyle(property, normalized);
    }
  };
  const commitColorChange = (value, cssValue) => {
    const normalized = normalizeColorPickerValue(value, defaultValue, cssValue);
    setLocalPickerValue(normalized);
    ChangeStyle(property, normalized);
  };
  const ChangeStyle = (property, value, suffix = "") => {
    const nextValue = suffix ? `${value}${suffix}` : value;

    let items = { ...props.data };
    if (!items[style]) {
      items[style] = {};
    }
    if (effectiveStyleTab !== "") {
      if (!items[style][effectiveStyleTab]) {
        items[style][effectiveStyleTab] = {};
      }
      if (!items[style][effectiveStyleTab][device]) {
        items[style][effectiveStyleTab][device] = {};
      }
      let swcopy = { ...items[style][effectiveStyleTab][device] };
      let item = { ...swcopy[styleState] };
      item[property] = nextValue;
      swcopy[styleState] = item;
      items[style][effectiveStyleTab][device] = swcopy;
    } else {
      if (!items[style][device]) {
        items[style][device] = {};
      }
      let swcopy = { ...items[style][device] };
      let item = { ...swcopy[styleState] };
      item[property] = nextValue;
      swcopy[styleState] = item;
      items[style][device] = swcopy;
    }
    if (moduleKey && moduleKey !== "") {
      props.onChangeStyle(items, moduleKey);
    } else {
      props.onChangeStyle(items);
    }
  };

  const resetValue = () => {
    ChangeStyle(property, defaultValue);
  };
  return (
    <div className={`caf-builder-setting-row-label ${extraClass}`}>
      <label>
        <span>{label}</span>
        <Tooltip title="Reset">
          <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
        </Tooltip>
      </label>
      <ColorPicker
        className="custom-color"
        value={localPickerValue}
        mode={getColorPickerModes(allowGradient)}
        onChange={setColorHexFun}
        onChangeComplete={commitColorChange}
        placement={ moduleKey === "loader" ? "left" : "center"}
      />
    </div>
  );
};

export default ColorMain;
