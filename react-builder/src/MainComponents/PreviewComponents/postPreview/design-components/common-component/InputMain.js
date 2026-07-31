import React, { useState } from "react";
import { Input,Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
const InputMain = (props) => {
  const {
    property,
    label,
    defaultValue,
    styleState = "default",
    deviceSwitch,
    style,
    setDraggingDisabled = false,
    moduleKey = "",
    isMeta ="",
  } = props;

  let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  let currentValue = "";
  if (defaultValue) {
    currentValue = defaultValue;
  }
  let device = "desktop";
  if (deviceSwitch) {
    device = deviceSwitch;
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

  const [inputValue, setInputValue] = useState(currentValue);

  const onChangeValue = (e) => {
    let value = e.target.value;
    setInputValue(value);
    let items = { ...props.data };
    if(styleTab!==""){
      let swcopy = { ...items[style][styleTab][device] };
      let item = { ...swcopy[styleState] };
      item[property] = value;
      swcopy[styleState] = item;
      items[style][styleTab][device] = swcopy;
    }else{
      let swcopy = { ...items[style][device] };
      let item = { ...swcopy[styleState] };
      item[property] = value;
      swcopy[styleState] = item;
      items[style][device] = swcopy;
    }
   
    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }
  };

  const resetValue = () => {
    setInputValue(defaultValue);
    let items = { ...props.data };
    if(styleTab!==""){
      let swcopy = { ...items[style][styleTab][device] };
      let item = { ...swcopy[styleState] };
      item[property] = defaultValue;
      swcopy[styleState] = item;
      items[style][styleTab][device] = swcopy;
    }else{
      let swcopy = { ...items[style][device] };
      let item = { ...swcopy[styleState] };
      item[property] = defaultValue;
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
    <div className="caf-builder-setting-row-label">
      <label>
        <span>{label}</span> 
        <Tooltip title="Reset">
        <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
        </Tooltip>
      </label>
      <Input
        type="number"
        value={inputValue}
        defaultValue={inputValue}
        onChange={(e) => onChangeValue(e)}
      />
    </div>
  );
};

export default InputMain;
