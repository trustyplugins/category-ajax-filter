import React, { useState,useEffect } from "react";
import { Col, Input,InputNumber, Row, Slider, Select, Space ,Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import { shouldBindFilterModuleMetaStyleTab } from "../../woocommerce/wooFilterModuleTemplates";
const { Option } = Select;

const SliderMain = (props) => {
  //console.log(props);
  const { type, rowindex, columnindex, moduleindex,module } = props.indexes;

  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    styleState = 'default',
    deviceSwitch,
    styleTab: originalStyleTab,
    isMeta
  } = props;

  let styleTab = originalStyleTab;
  //console.log(styleTab,isMeta);
  if (shouldBindFilterModuleMetaStyleTab(module?.key, type, isMeta)) {
    styleTab = isMeta;
  }
  let currentValue = "";
  let device = deviceSwitch;
  if (defaultValue) {
    currentValue = defaultValue;
  }
  let currentSuffix = "";
  if (defaultSuffix) {
    currentSuffix = defaultSuffix
  }
  function getSuffix(value) {
    if (value === "auto") {
      return "-"; // If value is "auto", return "auto"
    }
    // Use regex to match "px", "%", or any alphabetical unit
    let match = value.match(/[a-z%]+/i);
    return match ? match[0] : "px"; // Return the suffix or default to "px" if no match is found
  }
  if (type === 'row') {
    let RowStyle = props.data[rowindex].style;

    if (RowStyle[device][styleState]?.[property]) {
      currentValue = RowStyle[device][styleState][property];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.[property]) {
            currentValue = RowStyle[device]["default"][property];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
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
      if (device == "mobile") {
        if (styleState == "default") {
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
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.[property]) {
            currentValue = ColStyle[device]["default"][property];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
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
      if (device == "mobile") {
        if (styleState == "default") {
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
  // console.log(ModuleStyle,styleTab,device,styleState);
    if (styleTab !== "") {

      if (ModuleStyle[styleTab][device][styleState]?.[property]) {
        currentValue = ModuleStyle[styleTab][device][styleState][property];
      }
      else {
        if (device === "desktop") {
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
    } else {
      //console.log(ModuleStyle,styleTab,device,styleState);
      if (ModuleStyle[styleTab][device][styleState]?.[property]) {
        currentValue = ModuleStyle[styleTab][device][styleState][property];
      }
      else {
        if (device === "desktop") {
          if (styleState === "hover") {
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
  }
  currentSuffix = getSuffix(currentValue);
  // const [inputValue, setInputValue] = useState(parseInt(currentValue, 10));
  const [suffix, setSuffix] = useState(currentSuffix);
  useEffect(() => {
    setSuffix(getSuffix(String(currentValue || "")));
  }, [currentValue, styleState, styleTab, isMeta, property, device]);

 const onSelectChange = (value) => {
    if (value !== "auto") {
      setSuffix(value);
      ChangeStyle(property, parseInt(currentValue, 10), value);
    } else {
      setSuffix('-');
      ChangeStyle(property, "auto");
    }
  };
  //console.log(currentValue, property, label, suffix);
  const selectAfter = (
    <Select defaultValue={suffix} value={suffix} onChange={onSelectChange} placement="bottomRight" popupMatchSelectWidth={70}>
      <Select.Option value="px">PX</Select.Option>
      {property !== 'fontSize' && property !== 'letterSpacing' && property !== 'lineHeight' && (
    <>
      <Select.Option value="%">%</Select.Option>
      <Select.Option value="auto">auto</Select.Option>
    </>
  )}
    </Select>
  );
  // const onChangeSlider = (newValue) => {
  //   //setInputValue(newValue);
  //   ChangeStyle(property, newValue, suffix);
  // };
  const onChangeNumber = (value) => {
    //setInputValue(e.target.value);
    ChangeStyle(property, value, suffix);
  };
  const ChangeStyle = (property, value, suffix = "") => {
    let items = [...props.data];
    const incomingValue = value;
  if (value !== "auto") {
      // let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }
    //console.log(value);
    // Define joint pairs
    const jointPairs = {
      marginTop: "marginBottom",
      marginBottom: "marginTop",
      marginLeft: "marginRight",
      marginRight: "marginLeft",
      paddingTop: "paddingBottom",
      paddingBottom: "paddingTop",
      paddingLeft: "paddingRight",
      paddingRight: "paddingLeft",
    };

    const applyChange = (targetProperty) => {
      const assignProperty = (item) => {
        if (
          targetProperty === "lineHeight" &&
          (incomingValue === "" || incomingValue === null || incomingValue === undefined || isNaN(incomingValue))
        ) {
          delete item[targetProperty];
        } else {
          item[targetProperty] = value + suffix;
        }
      };

      if (type === "row") {
        let RowStyle = props.data[rowindex].style;
        let deviceCopy = { ...RowStyle[device] };
        let item = { ...deviceCopy[styleState] };
        assignProperty(item);
        deviceCopy[styleState] = item;
        items[rowindex]["style"][device] = deviceCopy;
      }

      if (type === "column") {
        let ColStyle = props.data[rowindex].data[columnindex].style;
        let deviceCopy = { ...ColStyle[device] };
        let item = { ...deviceCopy[styleState] };
        assignProperty(item);
        deviceCopy[styleState] = item;
        items[rowindex].data[columnindex]["style"][device] = deviceCopy;
      }

      if (type === "module") {
        let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
        if (styleTab !== "") {
          let swcopy = { ...ModuleStyle[styleTab] };
          let deviceCopy = { ...swcopy[device] };
          let item = { ...deviceCopy[styleState] };
          assignProperty(item);
          deviceCopy[styleState] = item;
          swcopy[device] = deviceCopy;
          items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
        } else {
          let swcopy = { ...ModuleStyle[device] };
          let item = { ...swcopy[styleState] };
          assignProperty(item);
          swcopy[styleState] = item;
          items[rowindex].data[columnindex].data[moduleindex]["style"][device] = swcopy;
        }
      }
    };

    // Apply pair logic
    if (props.isSpacingJoint && jointPairs[property]) {
      applyChange(property);
      applyChange(jointPairs[property]);
    } else {
      applyChange(property);
    }
      //console.log(props.data)
    props.onChangeStyle(props.data);
  };
  const resetValue = () => {
    setSuffix(defaultSuffix)
    let items = [...props.data];
    const resetProperty = (item) => {
      if (
        property === "lineHeight" &&
        (defaultValue === "" || defaultValue === null || defaultValue === undefined || isNaN(defaultValue))
      ) {
        delete item[property];
      } else {
        item[property] = defaultValue + defaultSuffix;
      }
    };
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      let item = { ...swcopy[styleState] };
      resetProperty(item);
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      let item = { ...swcopy[styleState] };
      resetProperty(item);
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
     let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      let item = { ...deviceCopy[styleState] }
      resetProperty(item);
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  }
  return (
    <div className={`${extraClass} caf-builder-setting-row-label width`}>
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
      <Space orientation="vertical"></Space>
      <Row>
      {props?.isSlider ? (
          <>
            <Col span={15}>
              <Slider
                min={0}
                max={100}
                value={parseInt(currentValue, 10) || 0}
                onChange={(newValue) => ChangeStyle(property, newValue, suffix)}
                tooltip={{ open: false }}
              />
            </Col>
            <div className="caf-manage-suffix-look">
              <Col span={20} className="slide-cnt-col">
                <InputNumber
                changeOnWheel
                  min={0}
                    value={
                      property === "lineHeight" &&
                      (currentValue === undefined ||
                        currentValue === null ||
                        currentValue === "" ||
                        currentValue === "NaN" ||
                        Number.isNaN(currentValue))
                        ? null
                        : currentValue !== "auto"
                          ? currentValue === "NaN%" ||
                            currentValue === "NaNpx" ||
                            currentValue === "nullpx" ||
                            currentValue === "null%"
                            ? 0
                            : parseInt(currentValue, 10)
                          : "auto"
                  }
                  onChange={(newValue) => ChangeStyle(property, newValue, suffix)}
                  tooltip={{ open: false }}
                  className="slide-cnt"
                />
              </Col>
              <Col span={4} className="slide-cnt-col selectafter">
                {selectAfter}
              </Col>
            </div>
          </>
        ) : (
          <div className="caf-manage-suffix-look col2">
          <Col span={extraClass === "colm2" ? 20 : 24} className="slide-cnt-col">
          <InputNumber
           changeOnWheel
           // suffix={selectAfter}
            value={
                currentValue !== "auto" 
                  ? currentValue === "NaN%" ||
                    currentValue === "NaNpx" ||
                    currentValue === "nullpx" ||
                    currentValue === "null%"
                    ? 0
                    : parseInt(currentValue, 10)
                  : "auto"
              }
            onChange={(newValue) =>onChangeNumber(newValue)}
          />
          <Col span={4} className="slide-cnt-col selectafter">
            {selectAfter}
          </Col>
          {props?.labelBottom ? <div className="label-bottom">{label}</div> : null}
        </Col>
        </div>
        )}
      </Row>
    </div>
  );
};

export default SliderMain;
