import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { Tooltip, Input, Radio, Segmented} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
function AlignMain(props) {
  const { type, rowindex, columnindex, moduleindex } = props.indexes;
  const { property, label, styleState = 'default', styleTab = '', deviceSwitch, defaultValue = "", options } = props;
  let currentalign = "";
  if (defaultValue != "") {
    currentalign = defaultValue;
  }
  let device = deviceSwitch;
  //console.log(styleTab);
  if (type === 'row') {
    let RowStyle = props.data[rowindex].style;
    if (RowStyle[device][styleState]?.[property]) {
      currentalign = RowStyle[device][styleState][property];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.[property]) {
            currentalign = RowStyle[device]["default"][property];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.[property]) {
            currentalign = RowStyle["desktop"]["default"][property];
          }
        } else {
          if (RowStyle[device]["default"]?.[property]) {
            currentalign = RowStyle[device]["default"][property];
          } else {
            if (RowStyle["desktop"]["hover"]?.[property]) {
              currentalign = RowStyle["desktop"]["hover"][property];
            } else {
              if (RowStyle["desktop"]["default"]?.[property]) {
                currentalign =
                  RowStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.[property]) {
            currentalign = RowStyle["desktop"]["default"][property];
          }
        } else {
          if (RowStyle[device]["default"]?.[property]) {
            currentalign = RowStyle[device]["default"][property];
          } else {
            if (RowStyle["desktop"]["hover"]?.[property]) {
              currentalign = RowStyle["desktop"]["hover"][property];
            } else {
              if (RowStyle["desktop"]["default"]?.[property]) {
                currentalign =
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
      currentalign = ColStyle[device][styleState][property];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.[property]) {
            currentalign = ColStyle[device]["default"][property];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.[property]) {
            currentalign = ColStyle["desktop"]["default"][property];
          }
        } else {
          if (ColStyle[device]["default"]?.[property]) {
            currentalign = ColStyle[device]["default"][property];
          } else {
            if (ColStyle["desktop"]["hover"]?.[property]) {
              currentalign = ColStyle["desktop"]["hover"][property];
            } else {
              if (ColStyle["desktop"]["default"]?.[property]) {
                currentalign =
                  ColStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.[property]) {
            currentalign = ColStyle["desktop"]["default"][property];
          }
        } else {
          if (ColStyle[device]["default"]?.[property]) {
            currentalign = ColStyle[device]["default"][property];
          } else {
            if (ColStyle["desktop"]["hover"]?.[property]) {
              currentalign = ColStyle["desktop"]["hover"][property];
            } else {
              if (ColStyle["desktop"]["default"]?.[property]) {
                currentalign =
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
    if (styleTab != "") {
      if (ModuleStyle?.[styleTab]?.[device]?.[styleState]?.[property]) {
        currentalign = ModuleStyle[styleTab][device][styleState][property];
      }
      else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.[property]) {
              currentalign = ModuleStyle[styleTab][device]["default"][property];
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
              currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.[property]) {
              currentalign = ModuleStyle[styleTab][device]["default"][property];
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.[property]) {
                currentalign = ModuleStyle[styleTab]["desktop"]["hover"][property];
              } else {
                if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
                  currentalign =
                    ModuleStyle[styleTab]["desktop"]["default"][property];
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
              currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.[property]) {
              currentalign = ModuleStyle[styleTab][device]["default"][property];
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.[property]) {
                currentalign = ModuleStyle[styleTab]["desktop"]["hover"][property];
              } else {
                if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
                  currentalign =
                    ModuleStyle[styleTab]["desktop"]["default"][property];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[device][styleState]?.[property]) {
        currentalign = ModuleStyle[device][styleState][property];
      }
      else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle[device]["default"]?.[property]) {
              currentalign = ModuleStyle[device]["default"][property];
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.[property]) {
              currentalign = ModuleStyle["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle[device]["default"]?.[property]) {
              currentalign = ModuleStyle[device]["default"][property];
            } else {
              if (ModuleStyle["desktop"]["hover"]?.[property]) {
                currentalign = ModuleStyle["desktop"]["hover"][property];
              } else {
                if (ModuleStyle["desktop"]["default"]?.[property]) {
                  currentalign =
                    ModuleStyle["desktop"]["default"][property];
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.[property]) {
              currentalign = ModuleStyle["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle[device]["default"]?.[property]) {
              currentalign = ModuleStyle[device]["default"][property];
            } else {
              if (ModuleStyle["desktop"]["hover"]?.[property]) {
                currentalign = ModuleStyle["desktop"]["hover"][property];
              } else {
                if (ModuleStyle["desktop"]["default"]?.[property]) {
                  currentalign =
                    ModuleStyle["desktop"]["default"][property];
                }
              }
            }
          }
        }
      }
    }
  }
  //const [align, setAlign] = useState(currentalign);
  const handleAlign = (e) => {
    const value = typeof e === "string" ? e : e?.target?.value;
    //let value = e.target.value;
    setValue(value);
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
      if (styleTab != "") {
        let msCopy = { ...ModuleStyle[styleTab] }
        let deviceCopy = { ...msCopy[device] }
        let item = { ...deviceCopy[styleState] }
        item[property] = value;
        deviceCopy[styleState] = item
        msCopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy;
      } else {
        let deviceCopy = { ...ModuleStyle[device] }
        let item = { ...deviceCopy[styleState] }
        item[property] = value;
        deviceCopy[styleState] = item
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  };
  const resetValue = () => {
    setValue(defaultValue);
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
      if (styleTab != "") {
        let msCopy = { ...ModuleStyle[styleTab] }
        let deviceCopy = { ...msCopy[device] }
        let item = { ...deviceCopy[styleState] }
        item[property] = defaultValue;
        deviceCopy[styleState] = item
        msCopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy;
      } else {
        let deviceCopy = { ...ModuleStyle[device] }
        let item = { ...deviceCopy[styleState] }
        item[property] = defaultValue;
        deviceCopy[styleState] = item
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  }
  const [value, setValue] = useState(currentalign);
  useEffect(() => {
    setValue(currentalign);
  }, [currentalign, styleState, styleTab, property, device]);
  return (
    <div className="caf-builder-setting-row-label">
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
      <div className='caf-aligned-settings'>
        {/* <AlignLeftOutlined
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
        ></AlignRightOutlined> */}
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
  )
}

export default AlignMain