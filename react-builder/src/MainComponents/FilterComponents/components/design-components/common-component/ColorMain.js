import React, { useState, useMemo, useEffect } from "react";
import { ColorPicker, theme, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { gradientCssToStops, normalizeColorPickerValue, getColorPickerModes, canUseGradientColors } from "../../../../utils/colorPicker";
import { shouldBindFilterModuleMetaStyleTab } from "../../woocommerce/wooFilterModuleTemplates";
const ColorMain = (props) => {
  const { property, label, styleState = "default", defaultValue, deviceSwitch, styleTab: originalStyleTab, isMeta } = props;
  const allowGradient = String(property || "").toLowerCase() !== "color";
  const gradientAllowed = allowGradient && canUseGradientColors();
  const { type, rowindex, columnindex, moduleindex, module } = props.indexes;

  let currentValue = "";
  let device = deviceSwitch;
  let styleTab = originalStyleTab;
  //console.log(styleState);
  if (shouldBindFilterModuleMetaStyleTab(module?.key, type, isMeta)) {
    styleTab = isMeta;
  }
  //  const [colorHex, setColorHex] = useState(currentValue);
  if (type === 'row') {
    let RowStyle = props.data[rowindex].style;

    if (RowStyle[device][styleState]?.[property]) {
      currentValue = RowStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState === "hover") {
          if (RowStyle[device]["default"]?.[property]) {
            currentValue = RowStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
          if (RowStyle["desktop"]["default"]?.[property]) {
            currentValue = RowStyle["desktop"]["default"][property];
          }
        } else {
          if (RowStyle[device]["default"]?.[property]) {
            currentValue = RowStyle[device]["default"][property];
          } else {
            if (RowStyle["desktop"]["hover"]?.[property]) {
              currentValue = RowStyle["desktop"]["hover"][property];
            } else {
              if (RowStyle["desktop"]["default"]?.[property]) {
                currentValue = RowStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (RowStyle["desktop"]["default"]?.[property]) {
            currentValue = RowStyle["desktop"]["default"][property];
          }
        } else {
          if (RowStyle[device]["default"]?.[property]) {
            currentValue = RowStyle[device]["default"][property];
          } else {
            if (RowStyle["desktop"]["hover"]?.[property]) {
              currentValue = RowStyle["desktop"]["hover"][property];
            } else {
              if (RowStyle["desktop"]["default"]?.[property]) {
                currentValue = RowStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }
  if (type === 'column') {
    let ColStyle = props.data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleState]?.[property]) {
      currentValue = ColStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.[property]) {
            currentValue = ColStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
          if (ColStyle["desktop"]["default"]?.[property]) {
            currentValue = ColStyle["desktop"]["default"][property];
          }
        } else {
          if (ColStyle[device]["default"]?.[property]) {
            currentValue = ColStyle[device]["default"][property];
          } else {
            if (ColStyle["desktop"]["hover"]?.[property]) {
              currentValue = ColStyle["desktop"]["hover"][property];
            } else {
              if (ColStyle["desktop"]["default"]?.[property]) {
                currentValue = ColStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (ColStyle["desktop"]["default"]?.[property]) {
            currentValue = ColStyle["desktop"]["default"][property];
          }
        } else {
          if (ColStyle[device]["default"]?.[property]) {
            currentValue = ColStyle[device]["default"][property];
          } else {
            if (ColStyle["desktop"]["hover"]?.[property]) {
              currentValue = ColStyle["desktop"]["hover"][property];
            } else {
              if (ColStyle["desktop"]["default"]?.[property]) {
                currentValue = ColStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }

  if (type === "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
   // console.log(device, styleState);
    if (ModuleStyle[styleTab][device][styleState]?.[property]) {
      currentValue = ModuleStyle[styleTab][device][styleState][property];
    } else {
      if (device === "desktop") {
        //console.log(styleState);
        if (styleState === "hover" || styleState === "selected" || styleState === "placeholder") {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab][device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentValue =
                  ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentValue =
                  ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }
  const normalizedCurrentValue = normalizeColorPickerValue(currentValue, defaultValue);
  const normalizedStops =
    typeof normalizedCurrentValue === "string" &&
    normalizedCurrentValue.includes("gradient(")
      ? gradientCssToStops(normalizedCurrentValue)
      : null;
  const pickerValue =
    !gradientAllowed && normalizedStops?.length
      ? normalizedStops[0].color
      : normalizedStops
      ? normalizedStops || normalizedCurrentValue
      : normalizedCurrentValue;

  const setColorHexFun = (value, cssValue) => {
    ChangeStyle(property, normalizeColorPickerValue(value, defaultValue, cssValue));
  };

  const ChangeStyle = (property, value) => {
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      let item = { ...swcopy[styleState] };
      item[property] = value;
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      let item = { ...swcopy[styleState] };
      item[property] = value;
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      let item = { ...deviceCopy[styleState] }
      item[property] = value;
      deviceCopy[styleState] = item
      swcopy[device] = deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(items);
  };

  const resetValue = () => {
    ChangeStyle(property, defaultValue);
  }
  return (
    <div className={`caf-builder-setting-row-label`}>
      <label>
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title={`Adjust ${label} settings.`}
        >
          {label}
        </Tooltip>
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
          <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
        </Tooltip>
      </label>
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
