import React,{useState} from 'react'
import { Input,Tooltip} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
const InputMain = (props) => {
    const { type, rowindex, columnindex, moduleindex } = props.indexes;
  const { property, label,defaultValue, styleState = 'default',deviceSwitch,styleTab="" } = props;
    let currentValue = "";
    if (defaultValue) {
        currentValue = defaultValue;
    }
      let device = deviceSwitch;
      if (type == 'row') {
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
      if (type == 'column') {
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
      if (type == "module") {
        let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
          if(styleTab!=""){
            if (ModuleStyle?.[styleTab]?.[device]?.[styleState]?.[property]) {
              currentValue = ModuleStyle[styleTab][device][styleState][property];
            } 
            else {
              if (device == "desktop") {
                if (styleState == "hover") {
                  if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.[property]) {
                    currentValue = ModuleStyle[styleTab][device]["default"][property];
                  }
                }
              }
              if (device == "tablet") {
                if (styleState == "default") {
                  if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
                    currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
                  }
                } else {
                  if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.[property]) {
                    currentValue = ModuleStyle[styleTab][device]["default"][property];
                  } else {
                    if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.[property]) {
                      currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
                    } else {
                      if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
                        currentValue =
                          ModuleStyle[styleTab]["desktop"]["default"][property];
                      }
                    }
                  }
                }
              }
              if (device == "mobile") {
                if (styleState == "default") {
                  if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
                    currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
                  }
                } else {
                  if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.[property]) {
                    currentValue = ModuleStyle[styleTab][device]["default"][property];
                  } else {
                    if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.[property]) {
                      currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
                    } else {
                      if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.[property]) {
                        currentValue =
                        ModuleStyle[styleTab]["desktop"]["default"][property];
                      }
                    }
                  }
                }
              }
            }
        }else{
        if (ModuleStyle[device][styleState]?.[property]) {
          currentValue = ModuleStyle[device][styleState][property];
        } 
        else {
          if (device == "desktop") {
            if (styleState == "hover") {
              if (ModuleStyle[device]["default"]?.[property]) {
                currentValue = ModuleStyle[device]["default"][property];
              }
            }
          }
          if (device == "tablet") {
            if (styleState == "default") {
              if (ModuleStyle["desktop"]["default"]?.[property]) {
                currentValue = ModuleStyle["desktop"]["default"][property];
              }
            } else {
              if (ModuleStyle[device]["default"]?.[property]) {
                currentValue = ModuleStyle[device]["default"][property];
              } else {
                if (ModuleStyle["desktop"]["hover"]?.[property]) {
                  currentValue = ModuleStyle["desktop"]["hover"][property];
                } else {
                  if (ModuleStyle["desktop"]["default"]?.[property]) {
                    currentValue =
                      ModuleStyle["desktop"]["default"][property];
                  }
                }
              }
            }
          }
          if (device == "mobile") {
            if (styleState == "default") {
              if (ModuleStyle["desktop"]["default"]?.[property]) {
                currentValue = ModuleStyle["desktop"]["default"][property];
              }
            } else {
              if (ModuleStyle[device]["default"]?.[property]) {
                currentValue = ModuleStyle[device]["default"][property];
              } else {
                if (ModuleStyle["desktop"]["hover"]?.[property]) {
                  currentValue = ModuleStyle["desktop"]["hover"][property];
                } else {
                  if (ModuleStyle["desktop"]["default"]?.[property]) {
                    currentValue =
                    ModuleStyle["desktop"]["default"][property];
                  }
                }
              }
            }
          }
        }
      }
      }
      // const [zindex,setZindex]=useState(currentValue); 
      const onChangeZindex = (e) => {
        let value = e.target.value
        // setZindex(value)
        let items = [...props.data];
        if (type == "row") {
          let RowStyle = props.data[rowindex].style;
          let swcopy = { ...RowStyle[device] };
          let item = { ...swcopy[styleState] };
          item[property] = value;
          swcopy[styleState] = item
          items[rowindex]["style"][device] = swcopy;
        }
        if (type == "column") {
          let ColStyle = props.data[rowindex].data[columnindex].style;
          let swcopy = { ...ColStyle[device] };
          let item = { ...swcopy[styleState] };
          item[property] = value;
          swcopy[styleState] = item
          items[rowindex].data[columnindex]["style"][device] = swcopy;
        }
        if (type == "module") {
          let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
          if(styleTab!=""){
            let msCopy = { ...ModuleStyle[styleTab] }
            let deviceCopy = { ...msCopy[device] }
            let item = { ...deviceCopy[styleState] }
            item[property] = value;
            deviceCopy[styleState] = item
            msCopy[device]= deviceCopy;
            items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy;
          }else{
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
        // setZindex(zindex)
        let items = [...props.data];
        if (type == "row") {
          let RowStyle = props.data[rowindex].style;
          let swcopy = { ...RowStyle[device] };
          let item = { ...swcopy[styleState] };
          if (styleState == 'hover') {
            item[property] = '';
          } else {
            item[property] = defaultValue;
          }
          swcopy[styleState] = item
          items[rowindex]["style"][device] = swcopy;
        }
        if (type == "column") {
          let ColStyle = props.data[rowindex].data[columnindex].style;
          let swcopy = { ...ColStyle[device] };
          let item = { ...swcopy[styleState] };
          if (styleState == 'hover') {
            item[property] = '';
          } else {
            item[property] = defaultValue;
          }
          swcopy[styleState] = item
          items[rowindex].data[columnindex]["style"][device] = swcopy;
        }
        if (type == "module") {
          let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
          if(styleTab!=""){
            let msCopy = { ...ModuleStyle[styleTab] }
            let deviceCopy = { ...msCopy[device] }
            let item = { ...deviceCopy[styleState] }
            if (styleState == 'hover') {
              item[property] = '';
            } else {
              item[property] = defaultValue;
            }
            deviceCopy[styleState] = item
            msCopy[device]= deviceCopy;
            items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy;
          }else{
          let deviceCopy = { ...ModuleStyle[device] }
          let item = { ...deviceCopy[styleState] }
          if (styleState == 'hover') {
            item[property] = '';
          } else {
            item[property] = defaultValue;
          }
          deviceCopy[styleState] = item
          items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
        }
      }
        props.onChangeStyle(props.data);
      }
    
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
      <Input type="number" value={currentValue} defaultValue={defaultValue} onChange={(e)=>onChangeZindex(e)}/>
  </div>
  )
}

export default InputMain