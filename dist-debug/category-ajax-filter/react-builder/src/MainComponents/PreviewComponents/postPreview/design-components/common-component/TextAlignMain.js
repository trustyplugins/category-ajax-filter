import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from 'antd';

function TextAlignMain(props) {
  const {
    property,
    label,
    styleState = "default",
    deviceSwitch,
    style,
    //styleTab,
    isMeta ="",
  } = props;
   let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  let currentalign = "left";
  let device = "desktop";
  if (deviceSwitch) {
    device = deviceSwitch;
  }

  if(styleTab!==""){
  if (props.data[style][styleTab][device][styleState]?.[property]) {
    currentalign = props.data[style][styleTab][device][styleState][property];
  } else {
    if (device == "desktop") {
      if (styleState == "hover") {
        if (props.data[style][styleTab][device]["default"]?.[property]) {
          currentalign = props.data[style][styleTab][device]["default"][property];
        }
      }
    }
    if (device == "tablet") {
      if (styleState == "default") {
        if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
          currentalign = props.data[style][styleTab]["desktop"]["default"][property];
        }
      } else {
        if (props.data[style][styleTab][device]["default"]?.[property]) {
          currentalign = props.data[style][styleTab][device]["default"][property];
        } else {
          if (props.data[style][styleTab]["desktop"]["hover"]?.[property]) {
            currentalign = props.data[style][styleTab]["desktop"]["hover"][property];
          } else {
            if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
              currentalign = props.data[style][styleTab]["desktop"]["default"][property];
            }
          }
        }
      }
    }
    if (device == "mobile") {
      if (styleState == "default") {
        if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
          currentalign = props.data[style][styleTab]["desktop"]["default"][property];
        }
      } else {
        if (props.data[style][styleTab][device]["default"]?.[property]) {
          currentalign = props.data[style][styleTab][device]["default"][property];
        } else {
          if (props.data[style][styleTab]["desktop"]["hover"]?.[property]) {
            currentalign = props.data[style][styleTab]["desktop"]["hover"][property];
          } else {
            if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
              currentalign = props.data[style][styleTab]["desktop"]["default"][property];
            }
          }
        }
      }
    }
  }
  }else{
    if (props.data[style][device][styleState]?.[property]) {
      currentalign = props.data[style][device][styleState][property];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (props.data[style][device]["default"]?.[property]) {
            currentalign = props.data[style][device]["default"][property];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (props.data[style]["desktop"]["default"]?.[property]) {
            currentalign = props.data[style]["desktop"]["default"][property];
          }
        } else {
          if (props.data[style][device]["default"]?.[property]) {
            currentalign = props.data[style][device]["default"][property];
          } else {
            if (props.data[style]["desktop"]["hover"]?.[property]) {
              currentalign = props.data[style]["desktop"]["hover"][property];
            } else {
              if (props.data[style]["desktop"]["default"]?.[property]) {
                currentalign = props.data[style]["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (props.data[style]["desktop"]["default"]?.[property]) {
            currentalign = props.data[style]["desktop"]["default"][property];
          }
        } else {
          if (props.data[style][device]["default"]?.[property]) {
            currentalign = props.data[style][device]["default"][property];
          } else {
            if (props.data[style]["desktop"]["hover"]?.[property]) {
              currentalign = props.data[style]["desktop"]["hover"][property];
            } else {
              if (props.data[style]["desktop"]["default"]?.[property]) {
                currentalign = props.data[style]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  } 

  const handleAlign = (value) => {
    let items = { ...props.data };
    let swcopy = "";

    if(styleTab!==""){
      swcopy = { ...items[style][styleTab][device] };
    }else{
      swcopy = { ...items[style][device] };
    }

    let item = { ...swcopy[styleState] };

    item[property] = value;
    swcopy[styleState] = item;

    if(styleTab!==""){
      items[style][styleTab][device] = swcopy;
    }else{
      items[style][device] = swcopy;
    }
    
    props.onChangeStyle(props.data);
  };

  const resetValue = () => {
    let items = { ...props.data };
    if(styleTab!==""){
      let swcopy = { ...items[style][styleTab][device] };
      let item = { ...swcopy[styleState] };
      item[property] = "left";
      swcopy[styleState] = item;
      items[style][styleTab][device] = swcopy;
    }else{
      let swcopy = { ...items[style][device] };
      let item = { ...swcopy[styleState] };
      item[property] = "left";
      swcopy[styleState] = item;
      items[style][device] = swcopy;
    }

    props.onChangeStyle(props.data);
  };
  return (
    <div className="caf-builder-setting-row-label">
      <label>
        <span>{label}</span> 
        <Tooltip title="Reset">
        <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
        </Tooltip>
      </label>
      <div className="caf-aligned-settings">
        <AlignLeftOutlined
          title="Left"
          className={currentalign == "left" && "active"}
          onClick={() => handleAlign("left")}
          style={{ fontSize: "20px" }}
        ></AlignLeftOutlined>
        <AlignCenterOutlined
          title="Center"
          className={currentalign == "center" && "active"}
          onClick={() => handleAlign("center")}
          style={{ fontSize: "20px" }}
        ></AlignCenterOutlined>
        <AlignRightOutlined
          title="Right"
          className={currentalign == "right" && "active"}
          onClick={() => handleAlign("right")}
          style={{ fontSize: "20px" }}
        ></AlignRightOutlined>
        <AlignRightOutlined
          title="Justify"
          className={currentalign == "justify" && "active"}
          onClick={() => handleAlign("justify")}
          style={{ fontSize: "20px" }}
        ></AlignRightOutlined>
      </div>
    </div>
  );
}

export default TextAlignMain;
