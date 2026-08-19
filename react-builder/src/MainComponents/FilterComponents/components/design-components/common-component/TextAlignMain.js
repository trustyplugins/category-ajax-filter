import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from '@ant-design/icons'
import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import {Tooltip } from "antd";
import { shouldBindFilterModuleMetaStyleTab } from "../../woocommerce/wooFilterModuleTemplates";

function TextAlignMain(props) {
  const { type, rowindex, columnindex, moduleindex ,module} = props.indexes;
  const { property, label, styleState = 'default', deviceSwitch,styleTab: originalStyleTab,isMeta } = props;
  let currentalign = "left";
  let device = deviceSwitch;
  let styleTab = originalStyleTab;
  //console.log(isMeta);
  if (shouldBindFilterModuleMetaStyleTab(module?.key, type, isMeta)) {
    styleTab = isMeta;
  }
  if (type === 'row') {
    let RowStyle = props.data[rowindex].style;

    if (RowStyle[device][styleState]?.[property]) {
      currentalign = RowStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState === "hover") {
          if (RowStyle[device]["default"]?.[property]) {
            currentalign = RowStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
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
                currentalign = RowStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
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
                currentalign = RowStyle["desktop"]["default"][property];
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
      if (device === "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.[property]) {
            currentalign = ColStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
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
                currentalign = ColStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
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
                currentalign = ColStyle["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }

  if (type === "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    if (ModuleStyle[styleTab][device][styleState]?.[property]) {
      currentalign = ModuleStyle[styleTab][device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState === "hover" || styleState === "selected" || styleState === "placeholder") {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentalign = ModuleStyle[styleTab][device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentalign = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentalign = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentalign =
                  ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentalign = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentalign = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentalign =
                ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }

  //const [align, setAlign] = useState(currentalign);
  const handleAlign = (value) => {
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
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };

  const resetValue = () => {
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      let item = { ...swcopy[styleState] };
      item[property] = "left";
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      let item = { ...swcopy[styleState] };
      item[property] = "left";
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      let item = { ...deviceCopy[styleState] }
      item[property] = "left";
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
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
      <div className='caf-aligned-settings'>
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
  )
}

export default TextAlignMain