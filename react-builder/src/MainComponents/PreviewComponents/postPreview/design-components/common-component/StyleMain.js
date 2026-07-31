import React from "react";
import {
  FontSizeOutlined,
  ItalicOutlined,
  SortDescendingOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "antd";
const StyleMain = (props) => {
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    fonts,
    styleState,
    deviceSwitch,
    style,
    isMeta="",
    // styleTab,
  } = props;
   let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  let fstyle = "normal";
  let trans = "inherit";
  let uldcor = "inherit";

  let device = "desktop";
  if (deviceSwitch) {
    device = deviceSwitch;
  }
   
  let itemStyle = "";

  if(styleTab!==""){
    itemStyle = props.data[style]?.[styleTab];
  }else{
    itemStyle = props.data[style];
  }

  if (itemStyle[device][styleState]?.fontStyle) {
    fstyle = itemStyle[device][styleState].fontStyle;
  } else {
    if (device == "desktop") {
      if (styleState == "hover") {
        if (itemStyle[device]["default"]?.fontStyle) {
          fstyle = itemStyle[device]["default"].fontStyle;
        }
      }
    }
    if (device == "tablet") {
      if (styleState == "default") {
        if (itemStyle["desktop"]["default"]?.fontStyle) {
          fstyle = itemStyle["desktop"]["default"].fontStyle;
        }
      } else {
        if (itemStyle[device]["default"]?.fontStyle) {
          fstyle = itemStyle[device]["default"].fontStyle;
        } else {
          if (itemStyle["desktop"]["hover"]?.fontStyle) {
            fstyle = itemStyle["desktop"]["hover"].fontStyle;
          } else {
            if (itemStyle["desktop"]["default"]?.fontStyle) {
              fstyle = itemStyle["desktop"]["default"].fontStyle;
            }
          }
        }
      }
    }
    if (device == "mobile") {
      if (styleState == "default") {
        if (itemStyle["desktop"]["default"]?.fontStyle) {
          fstyle = itemStyle["desktop"]["default"].fontStyle;
        }
      } else {
        if (itemStyle[device]["default"]?.fontStyle) {
          fstyle = itemStyle[device]["default"].fontStyle;
        } else {
          if (itemStyle["desktop"]["hover"]?.fontStyle) {
            fstyle = itemStyle["desktop"]["hover"].fontStyle;
          } else {
            if (itemStyle["desktop"]["default"]?.fontStyle) {
              fstyle = itemStyle["desktop"]["default"].fontStyle;
            }
          }
        }
      }
    }    
  }
  if (itemStyle[device][styleState]?.textTransform) {
    trans = itemStyle[device][styleState].textTransform;
  } else {
    if (device == "desktop") {
      if (styleState == "hover") {
        if (itemStyle[device]["default"]?.textTransform) {
          trans = itemStyle[device]["default"].textTransform;
        }
      }
    }
    if (device == "tablet") {
      if (styleState == "default") {
        if (itemStyle["desktop"]["default"]?.textTransform) {
          trans = itemStyle["desktop"]["default"].textTransform;
        }
      } else {
        if (itemStyle[device]["default"]?.textTransform) {
          trans = itemStyle[device]["default"].textTransform;
        } else {
          if (itemStyle["desktop"]["hover"]?.textTransform) {
            trans = itemStyle["desktop"]["hover"].textTransform;
          } else {
            if (itemStyle["desktop"]["default"]?.textTransform) {
              trans = itemStyle["desktop"]["default"].textTransform;
            }
          }
        }
      }
    }
    if (device == "mobile") {
      if (styleState == "default") {
        if (itemStyle["desktop"]["default"]?.textTransform) {
          trans = itemStyle["desktop"]["default"].textTransform;
        }
      } else {
        if (itemStyle[device]["default"]?.textTransform) {
          trans = itemStyle[device]["default"].textTransform;
        } else {
          if (itemStyle["desktop"]["hover"]?.textTransform) {
            trans = itemStyle["desktop"]["hover"].textTransform;
          } else {
            if (itemStyle["desktop"]["default"]?.textTransform) {
              trans = itemStyle["desktop"]["default"].textTransform;
            }
          }
        }
      }
    }
    
  }
  if (itemStyle[device][styleState]?.textDecoration) {
    uldcor = itemStyle[device][styleState].textDecoration;
  } else {
 if (device == "desktop") {
  if (styleState == "hover") {
    if (itemStyle[device]["default"]?.textDecoration) {
      uldcor = itemStyle[device]["default"].textDecoration;
    }
  }
}
if (device == "tablet") {
  if (styleState == "default") {
    if (itemStyle["desktop"]["default"]?.textDecoration) {
      uldcor = itemStyle["desktop"]["default"].textDecoration;
    }
  } else {
    if (itemStyle[device]["default"]?.textDecoration) {
      uldcor = itemStyle[device]["default"].textDecoration;
    } else {
      if (itemStyle["desktop"]["hover"]?.textDecoration) {
        uldcor = itemStyle["desktop"]["hover"].textDecoration;
      } else {
        if (itemStyle["desktop"]["default"]?.textDecoration) {
          uldcor = itemStyle["desktop"]["default"].textDecoration;
        }
      }
    }
  }
}
if (device == "mobile") {
  if (styleState == "default") {
    if (itemStyle["desktop"]["default"]?.textDecoration) {
      uldcor = itemStyle["desktop"]["default"].textDecoration;
    }
  } else {
    if (itemStyle[device]["default"]?.textDecoration) {
      uldcor = itemStyle[device]["default"].textDecoration;
    } else {
      if (itemStyle["desktop"]["hover"]?.textDecoration) {
        uldcor = itemStyle["desktop"]["hover"].textDecoration;
      } else {
        if (itemStyle["desktop"]["default"]?.textDecoration) {
          uldcor = itemStyle["desktop"]["default"].textDecoration;
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
    let items = { ...props.data };
    let Swcopy = "";

    if(styleTab!==""){
     Swcopy = { ...items[style][styleTab][device][styleState] };
    }else{
      Swcopy = { ...items[style][device][styleState] };
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

    Swcopy = {
      ...Swcopy,
      ...fontStyles,
    };
      if(styleTab!==""){
        items[style][styleTab][device][styleState] = Swcopy;
      }else{
        items[style][device][styleState] = Swcopy;
      }
    
    props.onChangeStyle(props.data);
  };
  const resetStyle = () => {
    let items = { ...props.data };
    let Swcopy = "";
    if(styleTab!==""){
      Swcopy = { ...items[style][styleTab][device][styleState] };
    }else{
      Swcopy = { ...items[style][device][styleState] };
    }
    fontStyles = {
      fontStyle: "normal",
      textTransform: "inherit",
      textDecoration: "inherit",
    };
    Swcopy = {
      ...Swcopy,
      ...fontStyles,
    };
    items[style][device][styleState] = Swcopy;

    props.onChangeStyle(props.data);
  };
  return (
    <div className={`caf-builder-setting-row-label`}>
      <label>
        <span>Font Style</span>
        <Tooltip title="Reset">
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
