import React, { useState } from "react";
import { Col, Input, Row, Slider, Select, Space, ColorPicker, Tooltip, InputNumber } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { normalizeColorPickerValue } from "../../../../utils/colorPicker";
function BoxShadow(props) {
  const { type, rowindex, columnindex, moduleindex } = props.indexes;
  //console.log(props, type);
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    styleState = "default",
    styleTab = "",
    deviceSwitch
  } = props;
  const boxshadow = {
    shadow: "inset",
    hPosition: "0px",
    vPosition: "0px",
    blur: "0px",
    spread: "0px",
    color: "#333333",
  };
  const selectAfter = (
    <Select defaultValue={'px'} value={'px'} placement="bottomRight" popupMatchSelectWidth={70}>
      <Select.Option value="px">PX</Select.Option>
    </Select>
  );
  let device = deviceSwitch;
  if (type == 'row') {
    let RowStyle = props.data[rowindex].style;

    if (RowStyle[device][styleState]?.["boxShadow"]) {
      let boxshadow1 = RowStyle[device][styleState]["boxShadow"];
      let barray = boxshadow1.split(" ");
      boxshadow.hPosition = barray[0];
      boxshadow.vPosition = barray[1];
      boxshadow.blur = barray[2];
      boxshadow.spread = barray[3];
      boxshadow.shadow = barray[4];
      boxshadow.color = barray[5];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.["boxShadow"]) {
            let boxshadow1 = RowStyle[device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1 = RowStyle["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (RowStyle[device]["default"]?.["boxShadow"]) {
            let boxshadow1 = RowStyle[device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (RowStyle["desktop"]["hover"]?.["boxShadow"]) {
              let boxshadow1 = RowStyle["desktop"]["hover"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (RowStyle["desktop"]["default"]?.["boxShadow"]) {
                let boxshadow1 = RowStyle["desktop"]["default"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1 = RowStyle["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (RowStyle[device]["default"]?.["boxShadow"]) {
            let boxshadow1 = RowStyle[device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (RowStyle["desktop"]["hover"]?.["boxShadow"]) {
              let boxshadow1 = RowStyle["desktop"]["hover"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (RowStyle["desktop"]["default"]?.["boxShadow"]) {
                let boxshadow1 = RowStyle["desktop"]["default"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              }
            }
          }
        }
      }
    }
  }
  if (type == 'column') {
    let ColStyle = props.data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleState]?.["boxShadow"]) {
      let boxshadow1 = ColStyle[device][styleState]["boxShadow"];
      let barray = boxshadow1.split(" ");
      boxshadow.hPosition = barray[0];
      boxshadow.vPosition = barray[1];
      boxshadow.blur = barray[2];
      boxshadow.spread = barray[3];
      boxshadow.shadow = barray[4];
      boxshadow.color = barray[5];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.["boxShadow"]) {
            let boxshadow1 = ColStyle[device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1 = ColStyle["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (ColStyle[device]["default"]?.["boxShadow"]) {
            let boxshadow1 = ColStyle[device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (ColStyle["desktop"]["hover"]?.["boxShadow"]) {
              let boxshadow1 = ColStyle["desktop"]["hover"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ColStyle["desktop"]["default"]?.["boxShadow"]) {
                let boxshadow1 = ColStyle["desktop"]["default"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1 = ColStyle["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (ColStyle[device]["default"]?.["boxShadow"]) {
            let boxshadow1 = ColStyle[device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (ColStyle["desktop"]["hover"]?.["boxShadow"]) {
              let boxshadow1 = ColStyle["desktop"]["hover"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ColStyle["desktop"]["default"]?.["boxShadow"]) {
                let boxshadow1 = ColStyle["desktop"]["default"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              }
            }
          }
        }
      }
    }
  }
  if (type == "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    if (styleTab != "") {
      if (ModuleStyle?.[styleTab]?.[device]?.[styleState]?.["boxShadow"]) {
        let boxshadow1 = ModuleStyle[styleTab][device][styleState]["boxShadow"];
        let barray = boxshadow1.split(" ");
        boxshadow.hPosition = barray[0];
        boxshadow.vPosition = barray[1];
        boxshadow.blur = barray[2];
        boxshadow.spread = barray[3];
        boxshadow.shadow = barray[4];
        boxshadow.color = barray[5];
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[styleTab][device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[styleTab]["desktop"]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[styleTab][device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.["boxShadow"]) {
                let boxshadow1 = ModuleStyle[styleTab]["desktop"]["hover"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              } else {
                if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.["boxShadow"]) {
                  let boxshadow1 = ModuleStyle[styleTab]["desktop"]["default"]["boxShadow"];
                  let barray = boxshadow1.split(" ");
                  boxshadow.hPosition = barray[0];
                  boxshadow.vPosition = barray[1];
                  boxshadow.blur = barray[2];
                  boxshadow.spread = barray[3];
                  boxshadow.shadow = barray[4];
                  boxshadow.color = barray[5];
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[styleTab]["desktop"]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[styleTab][device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.["boxShadow"]) {
                let boxshadow1 = ModuleStyle[styleTab]["desktop"]["hover"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              } else {
                if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.["boxShadow"]) {
                  let boxshadow1 = ModuleStyle[styleTab]["desktop"]["default"]["boxShadow"];
                  let barray = boxshadow1.split(" ");
                  boxshadow.hPosition = barray[0];
                  boxshadow.vPosition = barray[1];
                  boxshadow.blur = barray[2];
                  boxshadow.spread = barray[3];
                  boxshadow.shadow = barray[4];
                  boxshadow.color = barray[5];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[device][styleState]?.["boxShadow"]) {
        let boxshadow1 = ModuleStyle[device][styleState]["boxShadow"];
        let barray = boxshadow1.split(" ");
        boxshadow.hPosition = barray[0];
        boxshadow.vPosition = barray[1];
        boxshadow.blur = barray[2];
        boxshadow.spread = barray[3];
        boxshadow.shadow = barray[4];
        boxshadow.color = barray[5];
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle[device]["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle["desktop"]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            }
          } else {
            if (ModuleStyle[device]["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ModuleStyle["desktop"]["hover"]?.["boxShadow"]) {
                let boxshadow1 = ModuleStyle["desktop"]["hover"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              } else {
                if (ModuleStyle["desktop"]["default"]?.["boxShadow"]) {
                  let boxshadow1 = ModuleStyle["desktop"]["default"]["boxShadow"];
                  let barray = boxshadow1.split(" ");
                  boxshadow.hPosition = barray[0];
                  boxshadow.vPosition = barray[1];
                  boxshadow.blur = barray[2];
                  boxshadow.spread = barray[3];
                  boxshadow.shadow = barray[4];
                  boxshadow.color = barray[5];
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle["desktop"]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            }
          } else {
            if (ModuleStyle[device]["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ModuleStyle["desktop"]["hover"]?.["boxShadow"]) {
                let boxshadow1 = ModuleStyle["desktop"]["hover"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              } else {
                if (ModuleStyle["desktop"]["default"]?.["boxShadow"]) {
                  let boxshadow1 = ModuleStyle["desktop"]["default"]["boxShadow"];
                  let barray = boxshadow1.split(" ");
                  boxshadow.hPosition = barray[0];
                  boxshadow.vPosition = barray[1];
                  boxshadow.blur = barray[2];
                  boxshadow.spread = barray[3];
                  boxshadow.shadow = barray[4];
                  boxshadow.color = barray[5];
                }
              }
            }
          }
        }
      }
    }
  }
  const onChangeBox = (value, ftype, isReset) => {
    //console.log(value,type);
    if (value !== "auto" && ftype !== "color" && ftype !== "shadow" ) {
      //let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }
    let items = [...props.data];
    let item = "";
    let rSwcopy = "";
    let cSwcopy = "";
    let mSwcopy = "";
    let deviceCopy = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      rSwcopy = { ...RowStyle[device] };
      item = { ...rSwcopy[styleState] };
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      cSwcopy = { ...ColStyle[device] };
      item = { ...cSwcopy[styleState] };
    }

    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab != "") {
        mSwcopy = { ...ModuleStyle[styleTab] }
        deviceCopy = { ...mSwcopy[device] }
        item = { ...deviceCopy[styleState] }
      } else {
        deviceCopy = { ...ModuleStyle[device] }
        item = { ...deviceCopy[styleState] }
      }
    }
    if (
      ftype == "hPosition" ||
      ftype == "vPosition" ||
      ftype == "blur" ||
      ftype == "spread"
    ) {
      boxshadow[ftype] = value + "px";
    }
    if (ftype == "color") {
      if (typeof (value) == "object") {
        boxshadow[ftype] = normalizeColorPickerValue(value);
      } else {
        boxshadow[ftype] = value;
      }
    }
    if (ftype == "shadow") {
      if (value == 'inset') {
        boxshadow[ftype] = value;
      }
      else {
        boxshadow[ftype] = '';
      }
    }

    let bShadow =
      boxshadow["hPosition"] +
      " " +
      boxshadow["vPosition"] +
      " " +
      boxshadow["blur"] +
      " " +
      boxshadow['spread'] +
      " " +
      boxshadow['shadow'] +
      " " +
      boxshadow['color'];

    if (type == "row") {
      rSwcopy[styleState] = {
        ...item,
        boxShadow: bShadow,
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == "column") {
      cSwcopy[styleState] = {
        ...item,
        boxShadow: bShadow,
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == "module") {
      deviceCopy[styleState] = {
        ...item,
        boxShadow: bShadow,
      };
      if (styleTab != "") {
        mSwcopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
      } else {
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }


    if (type == "row") {
      if (styleState == "hover" && isReset == "reset") {
        rSwcopy[styleState] = {
          ...item,
          boxShadow: "",
        };
        items[rowindex]["style"][device] = rSwcopy;
      } else {
        rSwcopy[styleState] = {
          ...item,
          boxShadow: bShadow,
        };
        items[rowindex]["style"][device] = rSwcopy;
      }
    }

    if (type == "column") {
      if (styleState == "hover" && isReset == "reset") {
        cSwcopy[styleState] = {
          ...item,
          boxShadow: "",
        };
        items[rowindex].data[columnindex]["style"][device] = cSwcopy;
      } else {
        cSwcopy[styleState] = {
          ...item,
          boxShadow: bShadow,
        };
        items[rowindex].data[columnindex]["style"][device] = cSwcopy;
      }
    }

    if (type == "module") {
      if (styleState == "hover" && isReset == "reset") {
        deviceCopy[styleState] = {
          ...item,
          boxShadow: "",
        };
        if (styleTab != "") {
          mSwcopy[device] = deviceCopy;
          items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
        } else {
          items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
        }
      } else {
        deviceCopy[styleState] = {
          ...item,
          boxShadow: bShadow,
        };
        if (styleTab != "") {
          mSwcopy[device] = deviceCopy;
          items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
        } else {
          items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
        }
      }
    }
    props.onChangeStyle(props.data);
  };
  const resetPosition = (value, type, isReset) => {
    if (type == "hPosition") {
      onChangeBox(0, "hPosition", isReset);
    } else if (type == "vPosition") {
      onChangeBox(0, "vPosition", isReset);
    } else if (type == "blur") {
      onChangeBox(0, "blur", isReset);
    } else if (type == "spread") {
      onChangeBox(0, "spread", isReset);
    } else if (type == "shadow") {
      onChangeBox("inset", "shadow", isReset);
    } else if (type == "color") {
      onChangeBox(value, type, isReset);
    }
  };
    const safeNumber = (v) => {
    if (!v) return 0; // null, undefined, empty
    if (v === "NaNpx" || v === "nullpx") return 0;

    const num = parseInt(v, 10);
    return isNaN(num) ? 0 : num;
  };
  return (
    <>
      <div className="caf-builder-setting-row-label">
        <label>
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Set the shadow color."
          >
            Color
          </Tooltip>
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
            <span onClick={() => resetPosition("#333333", "color", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
          </Tooltip>
        </label>
        <ColorPicker
          className="custom-color"
          value={boxshadow.color}
          mode={["single"]}
          // format="rgb"
          onChange={(value) => onChangeBox(value, "color")}
          placement="center"
        />
      </div>
      <div className="caf-builder-setting-row-label">
        <label>
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Adjust horizontal shadow offset."
          >
            Horizontal Position
          </Tooltip>
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
            <span onClick={() => resetPosition(0, "hPosition", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
          </Tooltip>
        </label>
        <Row>
          <Col span={15}>
            <Slider
              min={-80}
              max={100}
              onChange={(value) => onChangeBox(value, "hPosition")}
              value={parseInt(boxshadow.hPosition, 10)}
            />
          </Col>
          <div className="caf-manage-suffix-look">
            <Col span={20} className="input-inner-px slide-cnt-col">
              <InputNumber
                style={{
                  margin: "0 0px 0 10px",
                }}
                value={safeNumber(boxshadow.hPosition, 10)}
                onChange={(newValue) => onChangeBox(newValue, "hPosition")}
              />
            </Col>
            <Col span={4} className="slide-cnt-col selectafter">
              {selectAfter}
            </Col>
          </div>
        </Row>
      </div>
      <div className="caf-builder-setting-row-label">
        <label>
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Adjust vertical shadow offset."
          >
            Vertical Position
          </Tooltip>
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
            <span onClick={() => resetPosition(0, "vPosition", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
          </Tooltip>
        </label>
        <Row>
          <Col span={15}>
            <Slider
              min={-80}
              max={100}
              onChange={(value) => onChangeBox(value, "vPosition")}
              value={parseInt(boxshadow.vPosition, 10)}
            />
          </Col>
          <div className="caf-manage-suffix-look">
            <Col span={20} className="input-inner-px slide-cnt-col">
              <InputNumber
                style={{
                  margin: "0 0px 0 10px",
                }}
                value={safeNumber(boxshadow.vPosition, 10)}
                onChange={(newValue) => onChangeBox(newValue, "vPosition")}
              />
            </Col>
            <Col span={4} className="slide-cnt-col selectafter">
              {selectAfter}
            </Col>
          </div>
        </Row>
      </div>
      <div className="caf-builder-setting-row-label">
        <label>
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Control shadow blur intensity."
          >
            Blur Strength
          </Tooltip>
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
            <span onClick={() => resetPosition(0, "blur", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
          </Tooltip>
        </label>
        <Row>
          <Col span={15}>
            <Slider
              min={0}
              max={50}
              onChange={(value) => onChangeBox(value, "blur")}
              value={parseInt(boxshadow.blur, 10)}
            />
          </Col>
          <div className="caf-manage-suffix-look">
            <Col span={20} className="input-inner-px slide-cnt-col">
              <InputNumber
                style={{
                  margin: "0 0px 0 10px",
                }}
                value={safeNumber(boxshadow.blur, 10)}
                onChange={(newValue) => onChangeBox(newValue, "blur")}
              />
            </Col>
            <Col span={4} className="slide-cnt-col selectafter">
              {selectAfter}
            </Col>
          </div>
        </Row>
      </div>
      <div className="caf-builder-setting-row-label">
        <label>
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Control how far the shadow spreads."
          >
          Spread Strength
          </Tooltip>
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
            <span onClick={() => resetPosition(0, "spread", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
          </Tooltip>
        </label>
        <Row>
          <Col span={15}>
            <Slider
              min={-80}
              max={80}
              onChange={(value) => onChangeBox(value, "spread")}
              value={parseInt(boxshadow.spread, 10)}
            />
          </Col>
          <div className="caf-manage-suffix-look">
              <Col span={20} className="input-inner-px slide-cnt-col">
            <InputNumber
              style={{
                margin: "0 0px 0 10px",
              }}
              value={safeNumber(boxshadow.spread, 10)}
              onChange={(newValue) => onChangeBox(newValue, "spread")}
            />
          </Col>
          <Col span={4} className="slide-cnt-col selectafter">
                {selectAfter}
              </Col>
          </div>
        </Row>
      </div>
      <div className="caf-builder-setting-row-label">
        <label>
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Choose inner or outer shadow position."
          >
            Position
          </Tooltip>
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
            <span onClick={() => resetPosition("inset", "shadow", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
          </Tooltip>
        </label>
        <Select
          defaultValue={boxshadow.shadow == "inset" ? "inset" : "outset"}
          style={{
            width: "100%",
          }}
          onChange={(value) => onChangeBox(value, "shadow")}
          options={[
            {
              value: "inset",
              label: "Inner Shadow",
            },
            {
              value: "outset",
              label: "Outer Shadow",
            },
          ]}
          value={boxshadow.shadow == "inset" ? "inset" : "outset"}
        />
      </div>
    </>
  );
}

export default BoxShadow;
