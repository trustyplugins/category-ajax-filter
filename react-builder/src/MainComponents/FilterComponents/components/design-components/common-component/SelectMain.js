import React, { useEffect, useState } from "react";
import { Col, Input, Row, Slider, Select, Space, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { loadFontFamily } from "../../../../utils/globalFontFamily";
import { shouldBindFilterModuleMetaStyleTab } from "../../woocommerce/wooFilterModuleTemplates";

const SelectMain = (props) => {
  const { type, rowindex, columnindex, moduleindex ,module} = props.indexes;
  const { property, label, options, defaultValue, styleState = 'default', deviceSwitch, styleTab: originalStyleTab,isMeta } = props;
  const [direction, setDirection] = useState('unset');
  let currentposition = "";
  let styleTab = originalStyleTab;
  if (shouldBindFilterModuleMetaStyleTab(module?.key, type, isMeta)) {
    styleTab = isMeta;
  }
  if (defaultValue) {
    currentposition = defaultValue;
  }
  let device = deviceSwitch;

  if (type === 'row') {
    let RowStyle = props.data[rowindex].style;
    //console.log(RowStyle,device,styleState);
    if (RowStyle[device][styleState]?.[property]) {
      currentposition = RowStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState === "hover") {
          if (RowStyle[device]["default"]?.[property]) {
            currentposition = RowStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
          if (RowStyle["desktop"]["default"]?.[property]) {
            currentposition = RowStyle["desktop"]["default"][property];
          }
        } else {
          if (RowStyle[device]["default"]?.[property]) {
            currentposition = RowStyle[device]["default"][property];
          } else {
            if (RowStyle["desktop"]["hover"]?.[property]) {
              currentposition = RowStyle["desktop"]["hover"][property];
            } else {
              if (RowStyle["desktop"]["default"]?.[property]) {
                currentposition =
                  RowStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (RowStyle["desktop"]["default"]?.[property]) {
            currentposition = RowStyle["desktop"]["default"][property];
          }
        } else {
          if (RowStyle[device]["default"]?.[property]) {
            currentposition = RowStyle[device]["default"][property];
          } else {
            if (RowStyle["desktop"]["hover"]?.[property]) {
              currentposition = RowStyle["desktop"]["hover"][property];
            } else {
              if (RowStyle["desktop"]["default"]?.[property]) {
                currentposition =
                  RowStyle["desktop"]["default"][property];
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
      currentposition = ColStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.[property]) {
            currentposition = ColStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.[property]) {
            currentposition = ColStyle["desktop"]["default"][property];
          }
        } else {
          if (ColStyle[device]["default"]?.[property]) {
            currentposition = ColStyle[device]["default"][property];
          } else {
            if (ColStyle["desktop"]["hover"]?.[property]) {
              currentposition = ColStyle["desktop"]["hover"][property];
            } else {
              if (ColStyle["desktop"]["default"]?.[property]) {
                currentposition =
                  ColStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (ColStyle["desktop"]["default"]?.[property]) {
            currentposition = ColStyle["desktop"]["default"][property];
          }
        } else {
          if (ColStyle[device]["default"]?.[property]) {
            currentposition = ColStyle[device]["default"][property];
          } else {
            if (ColStyle["desktop"]["hover"]?.[property]) {
              currentposition = ColStyle["desktop"]["hover"][property];
            } else {
              if (ColStyle["desktop"]["default"]?.[property]) {
                currentposition =
                  ColStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }
  if (type === "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    //console.log(ModuleStyle,styleTab,device,styleState);

    if (ModuleStyle[styleTab][device][styleState]?.[property]) {
      currentposition = ModuleStyle[styleTab][device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState === "hover" || styleState === "selected" || styleState === "placeholder") {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentposition = ModuleStyle[styleTab][device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentposition = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentposition = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentposition = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentposition =
                  ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentposition = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentposition = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentposition = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentposition =
                  ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }

  const handleChange = (value) => {
      setDirection(value);
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
      if (property === "fontFamily" && value) {
        loadFontFamily(value);
      }
    }
    props.onChangeStyle(props.data);
  };

  const resetValue = () => {
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      let item = { ...swcopy[styleState] };
      item[property] = defaultValue;
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      let item = { ...swcopy[styleState] };
      item[property] = defaultValue;
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      let item = { ...deviceCopy[styleState] }
      item[property] = defaultValue;
      deviceCopy[styleState] = item
      swcopy[device] = deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  }
  let cl='webflow-dropdown';
  if(props?.class==='flex-direction') {
   // cl='webflow-dropdown';
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
    <div className={`caf-builder-setting-row-label ${props?.class ? props?.class : ''}`}>
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
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
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
