import React from "react";
import {Tooltip} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import {
  FontSizeOutlined,
  ItalicOutlined,
  SortDescendingOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";
const StyleMain = (props) => {
  const { type, rowindex, columnindex, moduleindex } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    fonts,
    styleState,
    deviceSwitch,
    styleTab,
  } = props;
  let fstyle = "normal";
  let trans = "inherit";
  let uldcor = "inherit";

  let device = deviceSwitch;

  if (type == "row") {
    let RowStyle = props.data[rowindex].style;
    if (RowStyle[device][styleState]?.fontStyle) {
      fstyle = RowStyle[device][styleState].fontStyle;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.fontStyle) {
            fstyle = RowStyle[device]["default"].fontStyle;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.fontStyle) {
            fstyle = RowStyle["desktop"]["default"].fontStyle;
          }
        } else {
          if (RowStyle[device]["default"]?.fontStyle) {
            fstyle = RowStyle[device]["default"].fontStyle;
          } else {
            if (RowStyle["desktop"]["hover"]?.fontStyle) {
              fstyle = RowStyle["desktop"]["hover"].fontStyle;
            } else {
              if (RowStyle["desktop"]["default"]?.fontStyle) {
                fstyle = RowStyle["desktop"]["default"].fontStyle;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.fontStyle) {
            fstyle = RowStyle["desktop"]["default"].fontStyle;
          }
        } else {
          if (RowStyle[device]["default"]?.fontStyle) {
            fstyle = RowStyle[device]["default"].fontStyle;
          } else {
            if (RowStyle["desktop"]["hover"]?.fontStyle) {
              fstyle = RowStyle["desktop"]["hover"].fontStyle;
            } else {
              if (RowStyle["desktop"]["default"]?.fontStyle) {
                fstyle = RowStyle["desktop"]["default"].fontStyle;
              }
            }
          }
        }
      }
    }

    if (RowStyle[device][styleState]?.textTransform) {
      trans = RowStyle[device][styleState].textTransform;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.textTransform) {
            trans = RowStyle[device]["default"].textTransform;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.textTransform) {
            trans = RowStyle["desktop"]["default"].textTransform;
          }
        } else {
          if (RowStyle[device]["default"]?.textTransform) {
            trans = RowStyle[device]["default"].textTransform;
          } else {
            if (RowStyle["desktop"]["hover"]?.textTransform) {
              trans = RowStyle["desktop"]["hover"].textTransform;
            } else {
              if (RowStyle["desktop"]["default"]?.textTransform) {
                trans = RowStyle["desktop"]["default"].textTransform;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.textTransform) {
            trans = RowStyle["desktop"]["default"].textTransform;
          }
        } else {
          if (RowStyle[device]["default"]?.textTransform) {
            trans = RowStyle[device]["default"].textTransform;
          } else {
            if (RowStyle["desktop"]["hover"]?.textTransform) {
              trans = RowStyle["desktop"]["hover"].textTransform;
            } else {
              if (RowStyle["desktop"]["default"]?.textTransform) {
                trans = RowStyle["desktop"]["default"].textTransform;
              }
            }
          }
        }
      }
    }

    if (RowStyle[device][styleState]?.textDecoration) {
      uldcor = RowStyle[device][styleState].textDecoration;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.textDecoration) {
            uldcor = RowStyle[device]["default"].textDecoration;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.textDecoration) {
            uldcor = RowStyle["desktop"]["default"].textDecoration;
          }
        } else {
          if (RowStyle[device]["default"]?.textDecoration) {
            uldcor = RowStyle[device]["default"].textDecoration;
          } else {
            if (RowStyle["desktop"]["hover"]?.textDecoration) {
              uldcor = RowStyle["desktop"]["hover"].textDecoration;
            } else {
              if (RowStyle["desktop"]["default"]?.textDecoration) {
                uldcor = RowStyle["desktop"]["default"].textDecoration;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.textDecoration) {
            uldcor = RowStyle["desktop"]["default"].textDecoration;
          }
        } else {
          if (RowStyle[device]["default"]?.textDecoration) {
            uldcor = RowStyle[device]["default"].textDecoration;
          } else {
            if (RowStyle["desktop"]["hover"]?.textDecoration) {
              uldcor = RowStyle["desktop"]["hover"].textDecoration;
            } else {
              if (RowStyle["desktop"]["default"]?.textDecoration) {
                uldcor = RowStyle["desktop"]["default"].textDecoration;
              }
            }
          }
        }
      }
    }
  }
  if (type == "column") {
    let ColStyle = props.data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleState]?.fontStyle) {
      fstyle = ColStyle[device][styleState].fontStyle;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.fontStyle) {
            fstyle = ColStyle[device]["default"].fontStyle;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.fontStyle) {
            fstyle = ColStyle["desktop"]["default"].fontStyle;
          }
        } else {
          if (ColStyle[device]["default"]?.fontStyle) {
            fstyle = ColStyle[device]["default"].fontStyle;
          } else {
            if (ColStyle["desktop"]["hover"]?.fontStyle) {
              fstyle = ColStyle["desktop"]["hover"].fontStyle;
            } else {
              if (ColStyle["desktop"]["default"]?.fontStyle) {
                fstyle = ColStyle["desktop"]["default"].fontStyle;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.fontStyle) {
            fstyle = ColStyle["desktop"]["default"].fontStyle;
          }
        } else {
          if (ColStyle[device]["default"]?.fontStyle) {
            fstyle = ColStyle[device]["default"].fontStyle;
          } else {
            if (ColStyle["desktop"]["hover"]?.fontStyle) {
              fstyle = ColStyle["desktop"]["hover"].fontStyle;
            } else {
              if (ColStyle["desktop"]["default"]?.fontStyle) {
                fstyle = ColStyle["desktop"]["default"].fontStyle;
              }
            }
          }
        }
      }
    }

    if (ColStyle[device][styleState]?.textTransform) {
      trans = ColStyle[device][styleState].textTransform;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.textTransform) {
            trans = ColStyle[device]["default"].textTransform;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.textTransform) {
            trans = ColStyle["desktop"]["default"].textTransform;
          }
        } else {
          if (ColStyle[device]["default"]?.textTransform) {
            trans = ColStyle[device]["default"].textTransform;
          } else {
            if (ColStyle["desktop"]["hover"]?.textTransform) {
              trans = ColStyle["desktop"]["hover"].textTransform;
            } else {
              if (ColStyle["desktop"]["default"]?.textTransform) {
                trans = ColStyle["desktop"]["default"].textTransform;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.textTransform) {
            trans = ColStyle["desktop"]["default"].textTransform;
          }
        } else {
          if (ColStyle[device]["default"]?.textTransform) {
            trans = ColStyle[device]["default"].textTransform;
          } else {
            if (ColStyle["desktop"]["hover"]?.textTransform) {
              trans = ColStyle["desktop"]["hover"].textTransform;
            } else {
              if (ColStyle["desktop"]["default"]?.textTransform) {
                trans = ColStyle["desktop"]["default"].textTransform;
              }
            }
          }
        }
      }
    }

    if (ColStyle[device][styleState]?.textDecoration) {
      uldcor = ColStyle[device][styleState].textDecoration;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.textDecoration) {
            uldcor = ColStyle[device]["default"].textDecoration;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.textDecoration) {
            uldcor = ColStyle["desktop"]["default"].textDecoration;
          }
        } else {
          if (ColStyle[device]["default"]?.textDecoration) {
            uldcor = ColStyle[device]["default"].textDecoration;
          } else {
            if (ColStyle["desktop"]["hover"]?.textDecoration) {
              uldcor = ColStyle["desktop"]["hover"].textDecoration;
            } else {
              if (ColStyle["desktop"]["default"]?.textDecoration) {
                uldcor = ColStyle["desktop"]["default"].textDecoration;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.textDecoration) {
            uldcor = ColStyle["desktop"]["default"].textDecoration;
          }
        } else {
          if (ColStyle[device]["default"]?.textDecoration) {
            uldcor = ColStyle[device]["default"].textDecoration;
          } else {
            if (ColStyle["desktop"]["hover"]?.textDecoration) {
              uldcor = ColStyle["desktop"]["hover"].textDecoration;
            } else {
              if (ColStyle["desktop"]["default"]?.textDecoration) {
                uldcor = ColStyle["desktop"]["default"].textDecoration;
              }
            }
          }
        }
      }
    }
  }

  if (type == "module") {
    let ModuleStyle =
      props.data[rowindex].data[columnindex].data[moduleindex].style;
    if (styleTab != "") {
      if (ModuleStyle?.[styleTab]?.[device]?.[styleState]?.fontStyle) {
        fstyle = ModuleStyle[styleTab][device][styleState].fontStyle;
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.fontStyle) {
              fstyle = ModuleStyle[styleTab][device]["default"].fontStyle;
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.fontStyle) {
              fstyle = ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.fontStyle) {
              fstyle = ModuleStyle[styleTab][device]["default"].fontStyle;
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.fontStyle) {
                fstyle = ModuleStyle[styleTab]["desktop"]["hover"].fontStyle;
              } else {
                if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.fontStyle) {
                  fstyle =
                    ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.fontStyle) {
              fstyle = ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.fontStyle) {
              fstyle = ModuleStyle[styleTab][device]["default"].fontStyle;
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.fontStyle) {
                fstyle = ModuleStyle[styleTab]["desktop"]["hover"].fontStyle;
              } else {
                if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.fontStyle) {
                  fstyle =
                    ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
                }
              }
            }
          }
        }
      }

      if (ModuleStyle?.[styleTab]?.[device]?.[styleState]?.textTransform) {
        trans = ModuleStyle[styleTab][device][styleState].textTransform;
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.textTransform) {
              trans = ModuleStyle[styleTab][device]["default"].textTransform;
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textTransform) {
              trans = ModuleStyle[styleTab]["desktop"]["default"].textTransform;
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.textTransform) {
              trans = ModuleStyle[styleTab][device]["default"].textTransform;
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.textTransform) {
                trans = ModuleStyle[styleTab]["desktop"]["hover"].textTransform;
              } else {
                if (
                  ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textTransform
                ) {
                  trans =
                    ModuleStyle[styleTab]["desktop"]["default"].textTransform;
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textTransform) {
              trans = ModuleStyle[styleTab]["desktop"]["default"].textTransform;
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.textTransform) {
              trans = ModuleStyle[styleTab][device]["default"].textTransform;
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.textTransform) {
                trans = ModuleStyle[styleTab]["desktop"]["hover"].textTransform;
              } else {
                if (
                  ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textTransform
                ) {
                  trans =
                    ModuleStyle[styleTab]["desktop"]["default"].textTransform;
                }
              }
            }
          }
        }
      }

      if (ModuleStyle?.[styleTab]?.[device]?.[styleState]?.textDecoration) {
        uldcor = ModuleStyle[styleTab][device][styleState].textDecoration;
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.textDecoration) {
              uldcor = ModuleStyle[styleTab][device]["default"].textDecoration;
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textDecoration) {
              uldcor =
                ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.textDecoration) {
              uldcor = ModuleStyle[styleTab][device]["default"].textDecoration;
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.textDecoration) {
                uldcor =
                  ModuleStyle[styleTab]["desktop"]["hover"].textDecoration;
              } else {
                if (
                  ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textDecoration
                ) {
                  uldcor =
                    ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textDecoration) {
              uldcor =
                ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
            }
          } else {
            if (ModuleStyle?.[styleTab]?.[device]?.["default"]?.textDecoration) {
              uldcor = ModuleStyle[styleTab][device]["default"].textDecoration;
            } else {
              if (ModuleStyle?.[styleTab]?.["desktop"]?.["hover"]?.textDecoration) {
                uldcor =
                  ModuleStyle[styleTab]["desktop"]["hover"].textDecoration;
              } else {
                if (
                  ModuleStyle?.[styleTab]?.["desktop"]?.["default"]?.textDecoration
                ) {
                  uldcor =
                    ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[device][styleState]?.fontStyle) {
        fstyle = ModuleStyle[device][styleState].fontStyle;
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle[device]["default"]?.fontStyle) {
              fstyle = ModuleStyle[device]["default"].fontStyle;
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.fontStyle) {
              fstyle = ModuleStyle["desktop"]["default"].fontStyle;
            }
          } else {
            if (ModuleStyle[device]["default"]?.fontStyle) {
              fstyle = ModuleStyle[device]["default"].fontStyle;
            } else {
              if (ModuleStyle["desktop"]["hover"]?.fontStyle) {
                fstyle = ModuleStyle["desktop"]["hover"].fontStyle;
              } else {
                if (ModuleStyle["desktop"]["default"]?.fontStyle) {
                  fstyle = ModuleStyle["desktop"]["default"].fontStyle;
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.fontStyle) {
              fstyle = ModuleStyle["desktop"]["default"].fontStyle;
            }
          } else {
            if (ModuleStyle[device]["default"]?.fontStyle) {
              fstyle = ModuleStyle[device]["default"].fontStyle;
            } else {
              if (ModuleStyle["desktop"]["hover"]?.fontStyle) {
                fstyle = ModuleStyle["desktop"]["hover"].fontStyle;
              } else {
                if (ModuleStyle["desktop"]["default"]?.fontStyle) {
                  fstyle = ModuleStyle["desktop"]["default"].fontStyle;
                }
              }
            }
          }
        }
      }

      if (ModuleStyle[device][styleState]?.textTransform) {
        trans = ModuleStyle[device][styleState].textTransform;
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle[device]["default"]?.textTransform) {
              trans = ModuleStyle[device]["default"].textTransform;
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.textTransform) {
              trans = ModuleStyle["desktop"]["default"].textTransform;
            }
          } else {
            if (ModuleStyle[device]["default"]?.textTransform) {
              trans = ModuleStyle[device]["default"].textTransform;
            } else {
              if (ModuleStyle["desktop"]["hover"]?.textTransform) {
                trans = ModuleStyle["desktop"]["hover"].textTransform;
              } else {
                if (ModuleStyle["desktop"]["default"]?.textTransform) {
                  trans = ModuleStyle["desktop"]["default"].textTransform;
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.textTransform) {
              trans = ModuleStyle["desktop"]["default"].textTransform;
            }
          } else {
            if (ModuleStyle[device]["default"]?.textTransform) {
              trans = ModuleStyle[device]["default"].textTransform;
            } else {
              if (ModuleStyle["desktop"]["hover"]?.textTransform) {
                trans = ModuleStyle["desktop"]["hover"].textTransform;
              } else {
                if (ModuleStyle["desktop"]["default"]?.textTransform) {
                  trans = ModuleStyle["desktop"]["default"].textTransform;
                }
              }
            }
          }
        }
      }

      if (ModuleStyle[device][styleState]?.textDecoration) {
        uldcor = ModuleStyle[device][styleState].textDecoration;
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (ModuleStyle[device]["default"]?.textDecoration) {
              uldcor = ModuleStyle[device]["default"].textDecoration;
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.textDecoration) {
              uldcor = ModuleStyle["desktop"]["default"].textDecoration;
            }
          } else {
            if (ModuleStyle[device]["default"]?.textDecoration) {
              uldcor = ModuleStyle[device]["default"].textDecoration;
            } else {
              if (ModuleStyle["desktop"]["hover"]?.textDecoration) {
                uldcor = ModuleStyle["desktop"]["hover"].textDecoration;
              } else {
                if (ModuleStyle["desktop"]["default"]?.textDecoration) {
                  uldcor = ModuleStyle["desktop"]["default"].textDecoration;
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (ModuleStyle["desktop"]["default"]?.textDecoration) {
              uldcor = ModuleStyle["desktop"]["default"].textDecoration;
            }
          } else {
            if (ModuleStyle[device]["default"]?.textDecoration) {
              uldcor = ModuleStyle[device]["default"].textDecoration;
            } else {
              if (ModuleStyle["desktop"]["hover"]?.textDecoration) {
                uldcor = ModuleStyle["desktop"]["hover"].textDecoration;
              } else {
                if (ModuleStyle["desktop"]["default"]?.textDecoration) {
                  uldcor = ModuleStyle["desktop"]["default"].textDecoration;
                }
              }
            }
          }
        }
      }
    }
  }
  let fontStyles = {
    fontStyle: fstyle,
    textTransform: trans,
    textDecoration: uldcor,
  };
  const handleStyle = (action) => {
    let items = [...props.data];
    let item = "";
    let rSwcopy = "";
    let cSwcopy = "";
    let deviceCopy = "";
    let msCopy ="";
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
      let ModuleStyle =
        props.data[rowindex].data[columnindex].data[moduleindex].style;
      if(styleTab!=""){
        msCopy = { ...ModuleStyle[styleTab] }
       deviceCopy = { ...msCopy[device] }
       item = { ...deviceCopy[styleState] }
      }else{  
      deviceCopy = { ...ModuleStyle[device] };
      item = { ...deviceCopy[styleState] };
      }
    }
    if (action == "fontStyle") {
      if (fontStyles.fontStyle == "normal") {
        fontStyles.fontStyle = "italic";
      } else {
        fontStyles.fontStyle = "normal";
      }
    }
    if (action == "textTransformU") {
      if (
        fontStyles.textTransform == "inherit" ||
        fontStyles.textTransform == "capitalize"
      ) {
        fontStyles.textTransform = "uppercase";
      } else {
        fontStyles.textTransform = "inherit";
      }
    }
    if (action == "textTransformC") {
      if (
        fontStyles.textTransform == "inherit" ||
        fontStyles.textTransform == "uppercase"
      ) {
        fontStyles.textTransform = "capitalize";
      } else {
        fontStyles.textTransform = "inherit";
      }
    }
    if (action == "textDecorationU") {
      if (
        fontStyles.textDecoration == "inherit" ||
        fontStyles.textDecoration == "line-through"
      ) {
        fontStyles.textDecoration = "underline";
      } else {
        fontStyles.textDecoration = "inherit";
      }
    }
    if (action == "textDecorationL") {
      if (
        fontStyles.textDecoration == "inherit" ||
        fontStyles.textDecoration == "underline"
      ) {
        fontStyles.textDecoration = "line-through";
      } else {
        fontStyles.textDecoration = "inherit";
      }
    }
    if (type == "row") {
      rSwcopy[styleState] = {
        ...item,
        ...fontStyles,
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == "column") {
      cSwcopy[styleState] = {
        ...item,
        ...fontStyles,
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == "module") {
      deviceCopy[styleState] = {
        ...item,
        ...fontStyles,
      };
      if(styleTab!=""){
        msCopy[device]=deviceCopy
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy
      }else{
      items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }

    props.onChangeStyle(props.data);
  };
  const resetStyle = () => {
    let items = [...props.data];
    let item = "";
    let rSwcopy = "";
    let cSwcopy = "";
    let deviceCopy = "";
    let msCopy ="";
    fontStyles = {
      fontStyle: "normal",
      textTransform: "inherit",
      textDecoration: "inherit",
    };
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
      let ModuleStyle =
        props.data[rowindex].data[columnindex].data[moduleindex].style;
        if(styleTab!=""){
          msCopy = { ...ModuleStyle[styleTab] }
         deviceCopy = { ...msCopy[device] }
         item = { ...deviceCopy[styleState] }
        }else{  
        deviceCopy = { ...ModuleStyle[device] };
        item = { ...deviceCopy[styleState] };
        }
    }
    if (type == "row") {
      rSwcopy[styleState] = {
        ...item,
        ...fontStyles,
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == "column") {
      cSwcopy[styleState] = {
        ...item,
        ...fontStyles,
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == "module") {
      deviceCopy[styleState] = {
        ...item,
        ...fontStyles,
      };
      if(styleTab!=""){
        msCopy[device]=deviceCopy
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy
      }else{
      items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  };
  return (
    <div className={`caf-builder-setting-row-label`}>
      <label>
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Adjust font style options."
        >
          Font Style
        </Tooltip>
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
        <span onClick={resetStyle}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
        </Tooltip>
      </label>
      <div className="style-icons-wrapped">
        <ItalicOutlined
          className={fstyle === "italic" ? "active" : ""}
          onClick={() => handleStyle("fontStyle")}
        />
        <SortDescendingOutlined
          onClick={() => handleStyle("textTransformU")}
          className={trans === "uppercase" ? "active" : ""}
        />
        <FontSizeOutlined
          className={trans === "capitalize" ? "active" : ""}
          onClick={() => handleStyle("textTransformC")}
        />
        <UnderlineOutlined
          className={uldcor === "underline" ? "active" : ""}
          onClick={() => handleStyle("textDecorationU")}
        />
        <StrikethroughOutlined
          className={uldcor === "line-through" ? "active" : ""}
          onClick={() => handleStyle("textDecorationL")}
        />
      </div>
    </div>
  );
};

export default StyleMain;
