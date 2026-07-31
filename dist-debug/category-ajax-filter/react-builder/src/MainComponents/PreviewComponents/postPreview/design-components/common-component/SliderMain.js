import React, { useState, useEffect } from "react";
import { Col, Input, Row, Slider, Select, Space ,InputNumber} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'antd';
const { Option } = Select;

const SliderMain = (props) => {
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    styleState = "default",
    deviceSwitch,
    style,
    setDraggingDisabled = false,
    moduleKey="",
    isMeta=""

  } = props;
  let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  //console.log(styleTab)
  let currentValue = "";
  let device = "desktop";
  if (deviceSwitch) {
    device = deviceSwitch;
  }
  if (defaultValue) {
    currentValue = defaultValue;
  }
  let currentSuffix = "";
  if (defaultSuffix) {
    currentSuffix = defaultSuffix;
  }
  //console.log(styleState)
 
  function getSuffix(value) {
    if (value === "auto") {
      return "-"; // If value is "auto", return "auto"
    }
    // Use regex to match "px", "%", or any alphabetical unit
    // let match = value.match(/[a-z%]+$/i);
    let match = value.match(/(px|%|em|rem|vh|vw|vmin|vmax|pt|pc|in|cm|mm)$/i);
    return match ? match[1] : "px"; // Return the suffix or default to "px" if no match is found
  }

if(styleTab!==""){
  if (props.data[style][styleTab][device][styleState]?.[property]) {
    currentValue = props.data[style][styleTab][device][styleState][property];
  } else {
    if (device == "desktop") {
      if (styleState == "hover" || styleState === "selected" || styleState === "placeholder") {
        if (props.data[style][styleTab][device]["default"]?.[property]) {
          currentValue = props.data[style][styleTab][device]["default"][property];
        }
      }
    }
    if (device == "tablet") {
      if (styleState == "default") {
        if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
          currentValue = props.data[style][styleTab]["desktop"]["default"][property];
        }
      } else {
        if (props.data[style][styleTab][device]["default"]?.[property]) {
          currentValue = props.data[style][styleTab][device]["default"][property];
        } else {
          if (props.data[style][styleTab]["desktop"]["hover"]?.[property]) {
            currentValue = props.data[style][styleTab]["desktop"]["hover"][property];
          } else {
            if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
              currentValue = props.data[style][styleTab]["desktop"]["default"][property];
            }
          }
        }
      }
    }
    if (device == "mobile") {
      if (styleState == "default") {
        if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
          currentValue = props.data[style][styleTab]["desktop"]["default"][property];
        }
      } else {
        if (props.data[style][styleTab][device]["default"]?.[property]) {
          currentValue = props.data[style][styleTab][device]["default"][property];
        } else {
          if (props.data[style][styleTab]["desktop"]["hover"]?.[property]) {
            currentValue = props.data[style][styleTab]["desktop"]["hover"][property];
          } else {
            if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
              currentValue = props.data[style][styleTab]["desktop"]["default"][property];
            }
          }
        }
      }
    }
  }
}else{
  if (props.data[style][device][styleState]?.[property]) {
    currentValue = props.data[style][device][styleState][property];
  } else {
    if (device == "desktop") {
      if (styleState == "hover") {
        if (props.data[style][device]["default"]?.[property]) {
          currentValue = props.data[style][device]["default"][property];
        }
      }
    }
    if (device == "tablet") {
      if (styleState == "default") {
        if (props.data[style]["desktop"]["default"]?.[property]) {
          currentValue = props.data[style]["desktop"]["default"][property];
        }
      } else {
        if (props.data[style][device]["default"]?.[property]) {
          currentValue = props.data[style][device]["default"][property];
        } else {
          if (props.data[style]["desktop"]["hover"]?.[property]) {
            currentValue = props.data[style]["desktop"]["hover"][property];
          } else {
            if (props.data[style]["desktop"]["default"]?.[property]) {
              currentValue = props.data[style]["desktop"]["default"][property];
            }
          }
        }
      }
    }
    if (device == "mobile") {
      if (styleState == "default") {
        if (props.data[style]["desktop"]["default"]?.[property]) {
          currentValue = props.data[style]["desktop"]["default"][property];
        }
      } else {
        if (props.data[style][device]["default"]?.[property]) {
          currentValue = props.data[style][device]["default"][property];
        } else {
          if (props.data[style]["desktop"]["hover"]?.[property]) {
            currentValue = props.data[style]["desktop"]["hover"][property];
          } else {
            if (props.data[style]["desktop"]["default"]?.[property]) {
              currentValue = props.data[style]["desktop"]["default"][property];
            }
          }
        }
      }
    }
  }
}

  currentSuffix = getSuffix(currentValue);

  // console.log(currentSuffix,currentValue)
  const [suffix, setSuffix] = useState(currentSuffix);
  useEffect(() => {
    setSuffix(getSuffix(String(currentValue || "")));
  }, [currentValue, styleState, styleTab, isMeta, property, device]);
  const onSelectChange = (value) => {
    if (value !== "auto") {
      setSuffix(value);
      ChangeStyle(property, parseInt(currentValue, 10), value);
    } else {
      setSuffix("-");
      ChangeStyle(property, "auto");
    }
  };

  const selectAfter = (
    <Select defaultValue={suffix} value={suffix} onChange={onSelectChange} popupMatchSelectWidth={70}>
      <Select.Option value="px">PX</Select.Option>
      <Select.Option value="%">%</Select.Option>
      <Select.Option value="auto">auto</Select.Option>
    </Select>
  );

  const onChangeNumber = (e) => {
  const value =
    typeof e === "object" && e?.target
      ? e.target.value  
      : e;     
    ChangeStyle(property, value, suffix);
  };
  const ChangeStyle = (property, value, suffix = "") => {
    let items = { ...props.data };
    const incomingValue = value;
    if (value !== "auto") {
      // let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }
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

    if(styleTab !==""){
      let swcopy = { ...items[style][styleTab][device] };
      let item = { ...swcopy[styleState] };
      assignProperty(item);
      swcopy[styleState] = item;
      items[style][styleTab][device] = swcopy;
    }else{
      let swcopy = { ...items[style][device] };
      let item = { ...swcopy[styleState] };
      assignProperty(item);
      swcopy[styleState] = item;
      items[style][device] = swcopy;
    }

  };

    if (props.isSpacingJoint && jointPairs[property]) {
      applyChange(property);
      applyChange(jointPairs[property]);
    } else {
      applyChange(property);
    }


    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }
    //console.log(props.data)
  };

  const resetValue = () => {
    setSuffix(defaultSuffix)
    let items = { ...props.data };
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
    if(styleTab!==""){
      let swcopy = { ...items[style][styleTab][device] };
      let item = { ...swcopy[styleState] };
      resetProperty(item);
      swcopy[styleState] = item;
      items[style][styleTab][device] = swcopy;
    }else{
      let swcopy = { ...items[style][device] };
      let item = { ...swcopy[styleState] };
      resetProperty(item);
      swcopy[styleState] = item;
      items[style][device] = swcopy;
    }
     if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }
  };

  return (
    <>
      <div className={`${extraClass} caf-builder-setting-row-label width`}>
      <label>
        <span>{label}</span>
        <Tooltip title="Reset">
          <span onClick={resetValue}>
            <FontAwesomeIcon icon={faArrowRotateLeft} />
          </span>
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
                  onChange={(newValue) =>
                    ChangeStyle(property, newValue, suffix)
                  }
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
              onChange={(newValue) => onChangeNumber(newValue)}
            />
            <Col span={4} className="slide-cnt-col selectafter">
                {selectAfter}
              </Col>
            {props?.labelBottom ? (
              <div className="label-bottom">{label}</div>
            ) : null}
          </Col>
          </div>
        )}
      </Row>
    </div>
    </>
  );
};

export default SliderMain;
