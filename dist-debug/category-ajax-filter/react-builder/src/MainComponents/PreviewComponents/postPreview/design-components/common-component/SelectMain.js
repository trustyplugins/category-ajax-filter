import React, { useEffect, useState } from "react";
import { Col, Input, Row, Slider, Select, Space, Tooltip} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
const SelectMain = (props) => {
  const {
    property,
    label,
    options,
    defaultValue,
    styleState = "default",
    deviceSwitch,
    style,
    moduleKey = "",
    isMeta="",
    //styleTab="",
  } = props;
   let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  const [direction, setDirection] = useState('unset');
  let currentposition = "";

  if (defaultValue) {
    currentposition = defaultValue;
  }
  let device = deviceSwitch;

  if(styleTab!==""){
    if (props.data[style][styleTab][device][styleState]?.[property]) {
      currentposition = props.data[style][styleTab][device][styleState][property];
    } else {
      if (device == "desktop") {
        if (styleState == "hover" || styleState === "selected" || styleState === "placeholder") {
          if (props.data[style][styleTab][device]["default"]?.[property]) {
            currentposition = props.data[style][styleTab][device]["default"][property];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
            currentposition = props.data[style][styleTab]["desktop"]["default"][property];
          }
        } else {
          if (props.data[style][styleTab][device]["default"]?.[property]) {
            currentposition = props.data[style][styleTab][device]["default"][property];
          } else {
            if (props.data[style][styleTab]["desktop"]["hover"]?.[property]) {
              currentposition = props.data[style][styleTab]["desktop"]["hover"][property];
            } else {
              if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
                currentposition =
                  props.data[style][styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
            currentposition = props.data[style][styleTab]["desktop"]["default"][property];
          }
        } else {
          if (props.data[style][styleTab][device]["default"]?.[property]) {
            currentposition = props.data[style][styleTab][device]["default"][property];
          } else {
            if (props.data[style][styleTab]["desktop"]["hover"]?.[property]) {
              currentposition = props.data[style][styleTab]["desktop"]["hover"][property];
            } else {
              if (props.data[style][styleTab]["desktop"]["default"]?.[property]) {
                currentposition =
                  props.data[style][styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }else{
    if (props.data[style][device][styleState]?.[property]) {
      currentposition = props.data[style][device][styleState][property];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (props.data[style][device]["default"]?.[property]) {
            currentposition = props.data[style][device]["default"][property];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (props.data[style]["desktop"]["default"]?.[property]) {
            currentposition = props.data[style]["desktop"]["default"][property];
          }
        } else {
          if (props.data[style][device]["default"]?.[property]) {
            currentposition = props.data[style][device]["default"][property];
          } else {
            if (props.data[style]["desktop"]["hover"]?.[property]) {
              currentposition = props.data[style]["desktop"]["hover"][property];
            } else {
              if (props.data[style]["desktop"]["default"]?.[property]) {
                currentposition =
                  props.data[style]["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (props.data[style]["desktop"]["default"]?.[property]) {
            currentposition = props.data[style]["desktop"]["default"][property];
          }
        } else {
          if (props.data[style][device]["default"]?.[property]) {
            currentposition = props.data[style][device]["default"][property];
          } else {
            if (props.data[style]["desktop"]["hover"]?.[property]) {
              currentposition = props.data[style]["desktop"]["hover"][property];
            } else {
              if (props.data[style]["desktop"]["default"]?.[property]) {
                currentposition =
                  props.data[style]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }
  //console.log(currentposition);
  const handleChange = (value) => {
    setDirection(value);
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
    setDirection(defaultValue);
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

  let cl='';
  if(props?.class==='flex-direction') {
    cl='webflow-dropdown';
    //console.log(direction,currentposition,props);
  //   if(direction==='unset') {
  //   currentposition='unset';
  //   cl='webflow-dropdown-color';
  // }
  if(currentposition==='row' || currentposition==='column') {
    currentposition='unset';
    cl='webflow-dropdown-color';
  }
}

  return (
    // <div className="caf-builder-setting-row-label">
    //   <label>
    //     {label} 
    //     <Tooltip title="Reset">
    //     <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //     </Tooltip>
    //   </label>
    //   <Select
    //     defaultValue={currentposition}
    //     style={{
    //       width: "100%",
    //     }}
    //     onChange={handleChange}
    //     options={[...options]}
    //     value={currentposition}
    //   />
    // </div>

     <div className={`caf-builder-setting-row-label ${props?.class? props?.class :''}`}>
          <label>
            <span>{label}</span> 
            <Tooltip title="Reset">
            <span onClick={resetValue}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
            </Tooltip>
          </label>
          <Tooltip
            title={props?.tooltip ? props.tooltip : ''}
            styles={{ container: { fontSize: 12 } }}
          >
          <Select
      defaultValue={currentposition}
      style={{ width: "100%" }}
      onChange={handleChange}
      options={[...options]}
      value={currentposition}
      placement="topRight"
      popupMatchSelectWidth={true}
      className={cl}
      hoverValue={props?.hoverValue || ""}
      {...(property === "fontFamily"
        ? { showSearch: true, optionFilterProp: "label" }
        : {})}
      popupRender={(menu) =>
        props?.hoverValue ? (
          <>
            <div>
              {menu}
              <div
                  style={{
                    padding: "8px 10px",
                    borderTop: "1px solid #d7d3d3",
                    background: "#e9e9e9",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}
                  dangerouslySetInnerHTML={{ __html: props.hoverValue }}
                />
            </div>
          </>
        ) : (
          menu // fallback: render normal dropdown when hoverValue not present
        )
      }
    />
    </Tooltip>
        </div>
  );
};

export default SelectMain;
