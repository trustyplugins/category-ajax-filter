import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
} from "@ant-design/icons";
import { Tabs, Skeleton, Collapse, Switch, Row, Col, Tooltip ,Segmented,Radio} from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import React ,{useState,useEffect} from "react";

function AlignMain(props) {
  const {
    property,
    label,
    styleState = "default",
    deviceSwitch,
    style,
    defaultValue = "",
    moduleKey = "",
    options,
    //styleTab =""
    isMeta=""
  } = props;
  let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  let currentalign = "";
  let device = "desktop";
  if (deviceSwitch ) {
    device = deviceSwitch;
  }

  if(styleTab !==""){
  if (props.data[style]?.[styleTab]?.[device][styleState]?.[property]) {
    currentalign = props.data[style]?.[styleTab]?.[device][styleState][property];
  } else {
    if (device == "desktop") {
      if (styleState == "hover" || styleState === "selected" || styleState === "placeholder") {
        if (props.data?.[style]?.[styleTab]?.[device]["default"]?.[property]) {
          currentalign = props.data[style]?.[styleTab]?.[device]["default"][property];
        }
      }
    }
    if (device == "tablet") {
      if (styleState == "default") {
        if (props.data?.[style]?.[styleTab]?.["desktop"]["default"]?.[property]) {
          currentalign = props.data[style]?.[styleTab]?.["desktop"]["default"][property];
        }
      } else {
        if (props.data?.[style]?.[styleTab]?.[device]["default"]?.[property]) {
          currentalign = props.data[style]?.[styleTab]?.[device]["default"][property];
        } else {
          if (props.data?.[style]?.[styleTab]?.["desktop"]["hover"]?.[property]) {
            currentalign = props.data[style]?.[styleTab]?.["desktop"]["hover"][property];
          } else {
            if (props.data?.[style]?.[styleTab]?.["desktop"]["default"]?.[property]) {
              currentalign = props.data[style]?.[styleTab]?.["desktop"]["default"][property];
            }
          }
        }
      }
    }
    if (device == "mobile") {
      if (styleState == "default") {
        if (props.data?.[style]?.[styleTab]?.["desktop"]["default"]?.[property]) {
          currentalign = props.data[style]?.[styleTab]?.["desktop"]["default"][property];
        }
      } else {
        if (props.data?.[style]?.[styleTab]?.[device]["default"]?.[property]) {
          currentalign = props.data[style]?.[styleTab]?.[device]["default"][property];
        } else {
          if (props.data?.[style]?.[styleTab]?.["desktop"]["hover"]?.[property]) {
            currentalign = props.data[style]?.[styleTab]?.["desktop"]["hover"][property];
          } else {
            if (props.data?.[style]?.[styleTab]?.["desktop"]["default"]?.[property]) {
              currentalign = props.data[style]?.[styleTab]?.["desktop"]["default"][property];
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
 const [value, setValue] = useState(currentalign);
  useEffect(() => {
    setValue(currentalign);
  }, [currentalign, styleState, styleTab, isMeta, property, device]);
  const handleAlign = (e) => {
    const val = typeof e === "string" ? e : e?.target?.value;
    setValue(val)
    let items = { ...props.data };
    if(styleTab!==""){
    let swcopy = { ...items[style][styleTab][device] };
    let item = { ...swcopy[styleState] };
    item[property] = val;
    swcopy[styleState] = item;
    items[style][styleTab][device] = swcopy;
    }else{
      let swcopy = { ...items[style][device] };
      let item = { ...swcopy[styleState] };
      item[property] = val;
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
    setValue(defaultValue)
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
    // <div className="caf-builder-setting-row-label">
    //   <label>
    //     {label} 
    //     <Tooltip title="Reset">
    //     <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //     </Tooltip>
    //   </label>
    //   <div className="caf-aligned-settings">
    //     <AlignLeftOutlined
    //       title="Left"
    //       className={currentalign == "left" && "active"}
    //       onClick={() => handleAlign("left")}
    //       style={{ fontSize: "20px" }}
    //     ></AlignLeftOutlined>
    //     <AlignCenterOutlined
    //       title="Center"
    //       className={currentalign == "center" && "active"}
    //       onClick={() => handleAlign("center")}
    //       style={{ fontSize: "20px" }}
    //     ></AlignCenterOutlined>
    //     <AlignRightOutlined
    //       title="Right"
    //       className={currentalign == "right" && "active"}
    //       onClick={() => handleAlign("right")}
    //       style={{ fontSize: "20px" }}
    //     ></AlignRightOutlined>
    //   </div>
    // </div>

       <div className="caf-builder-setting-row-label">
      <label>
        <span>{label}</span>
        <Tooltip title="Reset">
          <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
        </Tooltip>
      </label>
      <div className='caf-aligned-settings'>
        {props?.isNewTab ? (
          <Segmented
            value={value}
            style={{ marginBottom: 8 }}
            onChange={handleAlign}
            options={[...options]}
          />
        ) : (
          <Radio.Group
            className='caf-align-radio-main'
            onChange={handleAlign}
            value={value}
            options={[...options]}
          />
        )}
      </div>
    </div>
  );
}

export default AlignMain;
