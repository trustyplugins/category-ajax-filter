"use strict";
(globalThis["webpackChunkreact_builder"] = globalThis["webpackChunkreact_builder"] || []).push([["src_MainComponents_FilterComponents_components_settingTabContent_DesignTab_js"],{

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/AlignMain.js"
/*!********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/AlignMain.js ***!
  \********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/radio/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/segmented/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);






/** Swap justifyContent start/end when toggling row <-> row-reverse so X dropdown label stays the same. */

function syncJustifyContentForRowDirectionChange(previousFlexFlow, nextFlexFlow, styleItem) {
  const rowPair = previousFlexFlow === "row" && nextFlexFlow === "row-reverse" || previousFlexFlow === "row-reverse" && nextFlexFlow === "row";
  if (!rowPair || previousFlexFlow === nextFlexFlow) return;
  const justify = styleItem.justifyContent;
  if (justify === "flex-start") {
    styleItem.justifyContent = "flex-end";
  } else if (justify === "flex-end") {
    styleItem.justifyContent = "flex-start";
  }
}
function AlignMain(props) {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const {
    property,
    label,
    styleState = 'default',
    deviceSwitch,
    styleTab: originalStyleTab,
    defaultValue = "",
    options,
    isMeta
  } = props;
  let styleTab = originalStyleTab;
  //console.log(isMeta);
  if (type === 'module' && module?.key === 'checkbox_filter' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'dropdown_filter' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'range_slider' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'search' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  let currentalign = "";
  if (defaultValue !== "") {
    currentalign = defaultValue;
  }
  let device = deviceSwitch;
  //console.log(styleTab);
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
        if (styleState === "hover") {
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
    //console.log(ModuleStyle, styleTab, device, styleState);
    if (styleTab !== "") {
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
                  currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
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
                  currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[device][styleState]?.[property]) {
        currentalign = ModuleStyle[device][styleState][property];
      } else {
        if (device === "desktop") {
          if (styleState === "hover") {
            if (ModuleStyle[device]["default"]?.[property]) {
              currentalign = ModuleStyle[device]["default"][property];
            }
          }
        }
        if (device === "tablet") {
          if (styleState === "default") {
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
                  currentalign = ModuleStyle["desktop"]["default"][property];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleState === "default") {
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
                  currentalign = ModuleStyle["desktop"]["default"][property];
                }
              }
            }
          }
        }
      }
    }
  }
  //const [align, setAlign] = useState(currentalign);
  const handleAlign = e => {
    const value = typeof e === "string" ? e : e?.target?.value;
    //let value = e.target.value;
    setValue(value);
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab !== "") {
        let msCopy = {
          ...ModuleStyle[styleTab]
        };
        let deviceCopy = {
          ...msCopy[device]
        };
        let item = {
          ...deviceCopy[styleState]
        };
        const previousFlexFlow = property === "flexFlow" ? item.flexFlow : undefined;
        item[property] = value;
        if (property === "flexFlow") {
          syncJustifyContentForRowDirectionChange(previousFlexFlow, value, item);
        }
        deviceCopy[styleState] = item;
        msCopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy;
      } else {
        let deviceCopy = {
          ...ModuleStyle[device]
        };
        let item = {
          ...deviceCopy[styleState]
        };
        const previousFlexFlow = property === "flexFlow" ? item.flexFlow : undefined;
        item[property] = value;
        if (property === "flexFlow") {
          syncJustifyContentForRowDirectionChange(previousFlexFlow, value, item);
        }
        deviceCopy[styleState] = item;
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
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = defaultValue;
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = defaultValue;
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab !== "") {
        let msCopy = {
          ...ModuleStyle[styleTab]
        };
        let deviceCopy = {
          ...msCopy[device]
        };
        let item = {
          ...deviceCopy[styleState]
        };
        item[property] = defaultValue;
        deviceCopy[styleState] = item;
        msCopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = msCopy;
      } else {
        let deviceCopy = {
          ...ModuleStyle[device]
        };
        let item = {
          ...deviceCopy[styleState]
        };
        item[property] = defaultValue;
        deviceCopy[styleState] = item;
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  };
  const [value, setValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(currentalign);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setValue(currentalign);
  }, [currentalign, styleState, styleTab, isMeta, property, device]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: "caf-builder-setting-row-label",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("label", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: `Adjust ${label} settings.`,
        children: label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Reset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
          onClick: resetValue,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_4__.FontAwesomeIcon, {
            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__.faArrowRotateLeft
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
      className: "caf-aligned-settings",
      children: props?.isNewTab ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        value: value,
        style: {
          marginBottom: 8
        },
        onChange: handleAlign,
        options: [...options]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"].Group, {
        className: "caf-align-radio-main",
        onChange: handleAlign,
        value: value,
        options: [...options]
      })
    })]
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AlignMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/BorderMain.js"
/*!*********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/BorderMain.js ***!
  \*********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/col/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/color-picker/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/slider/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var _utils_colorPicker__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../../utils/colorPicker */ "./src/MainComponents/utils/colorPicker.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/BorderBottomOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/BorderLeftOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/BorderOuterOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/BorderRightOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/BorderTopOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FullscreenExitOutlined.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__);







function BorderMain(props) {
  // console.log(props);
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const {
    property,
    label,
    styleState = "default",
    styleTab: originalStyleTab,
    deviceSwitch,
    isMeta
  } = props;
  let styleTab = originalStyleTab;
  //console.log(styleTab,isMeta);
  if (type === 'module' && (module?.key === 'checkbox_filter' || module?.key === 'dropdown_filter' || module?.key === 'search' || module?.key === 'range_slider') && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  const [radiusJoint, setRadiusJoint] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  let borderstyletype = "outer";
  let radiusSuffix = "px";
  const [radiusSuffixnew, setRadiusSuffixnew] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    topLeft: 'px',
    topRight: 'px',
    bottomLeft: 'px',
    bottomRight: 'px'
  });
  const selectAfter = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
    defaultValue: "px",
    value: "px",
    placement: "bottomRight",
    popupMatchSelectWidth: 70,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
      value: "px",
      children: "PX"
    })
  });
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    //let items = [...props.data];
    let item = "";
    let objShallowCopy = "";
    let colObjShallowCopy = "";
    let rowObjShallowCopy = "";
    let deviceCopy = "";

    // --- get correct style reference ---
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      rowObjShallowCopy = {
        ...RowStyle[device]
      };
      item = {
        ...rowObjShallowCopy[styleState]
      };
    } else if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      colObjShallowCopy = {
        ...ColStyle[device]
      };
      item = {
        ...colObjShallowCopy[styleState]
      };
    } else if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab !== "") {
        objShallowCopy = {
          ...ModuleStyle[styleTab]
        };
        deviceCopy = {
          ...objShallowCopy[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      } else {
        deviceCopy = {
          ...ModuleStyle[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      }
    }
    setRadiusSuffixnew({
      topLeft: getUnit(item?.borderTopLeftRadius),
      topRight: getUnit(item?.borderTopRightRadius),
      bottomLeft: getUnit(item?.borderBottomLeftRadius),
      bottomRight: getUnit(item?.borderBottomRightRadius)
    });
  }, []);
  const getUnit = value => {
    if (!value) return "px"; // null, undefined, empty string → px
    let match = value?.match(/[a-z%]+$/i);
    return match ? match[0] : "px";
  };
  const handleRadiusSuffixChange = (placement, suffix) => {
    const updated = {
      ...radiusSuffixnew,
      [placement]: suffix
    };
    setRadiusSuffixnew(updated);
    onChangeBorderRadius(placement, placement === "topLeft" ? bordertopleftradius : placement === "topRight" ? bordertoprightradius : placement === "bottomLeft" ? borderbottomleftradius : borderbottomrightradius, updated);
  };
  let borderprops = {
    borderTopWidth: "0px",
    borderRightWidth: "0px",
    borderBottomWidth: "0px",
    borderLeftWidth: "0px",
    borderTopColor: "#ffffff00",
    borderRightColor: "#ffffff00",
    borderBottomColor: "#ffffff00",
    borderLeftColor: "#ffffff00",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid"
    //   borderWidth: "0px",
  };
  let bordertopleftradius = 0;
  let bordertoprightradius = 0;
  let borderbottomleftradius = 0;
  let borderbottomrightradius = 0;
  let device = deviceSwitch;
  // 🔹 --- Helper functions (top of bordermain.js) ---
  const getBorderValue = (styleObj, styleTab, device, styleState, key) => {
    if (!styleObj || !device || !styleState) return null;

    // If styleTab exists, use that section
    const base = styleTab && styleObj[styleTab] ? styleObj[styleTab] : styleObj;
    const tryPaths = [[device, styleState, key], [device, "default", key], ["desktop", styleState, key], ["desktop", "hover", key], ["desktop", "selected", key], ["desktop", "default", key]];
    for (const [d, s, k] of tryPaths) {
      if (base?.[d]?.[s]?.[k]) return base[d][s][k];
    }
    return null;
  };
  const parseValue = val => {
    // If value is null, undefined, or empty string → return defaults
    if (val === null || val === undefined || val === "") {
      return {
        num: 0,
        unit: "px"
      };
    }

    // If value is already a number, just return it with default unit
    if (typeof val === "number") {
      return {
        num: val,
        unit: "px"
      };
    }

    // Try to match "number + optional unit" (e.g., 12px, 50%, 1.5em)
    const match = String(val).match(/^(\d*\.?\d+)?([a-zA-Z%]*)$/);

    // Gracefully handle bad input
    if (!match) {
      return {
        num: 0,
        unit: "px"
      };
    }
    const num = parseFloat(match[1]) || 0;
    const unit = match[2] || "px";
    return {
      num,
      unit
    };
  };
  const applyBorderStyles = (styleObj, styleTab, device, styleState, borderprops, setVars) => {
    const borderKeys = {
      radius: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"],
      width: ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
      color: ["borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"],
      style: ["borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle"]
    };

    // --- Border Radius ---
    borderKeys.radius.forEach(key => {
      const val = getBorderValue(styleObj, styleTab, device, styleState, key);
      if (val) {
        const {
          num,
          unit
        } = parseValue(val);
        if (key === "borderTopLeftRadius") setVars.topLeft(num, unit);
        if (key === "borderTopRightRadius") setVars.topRight(num, unit);
        if (key === "borderBottomLeftRadius") setVars.bottomLeft(num, unit);
        if (key === "borderBottomRightRadius") setVars.bottomRight(num, unit);
      }
    });

    // --- Border Widths, Colors, and Styles ---
    ["width", "color", "style"].forEach(type => {
      borderKeys[type].forEach(key => {
        const val = getBorderValue(styleObj, styleTab, device, styleState, key);
        if (val) borderprops[key] = val;
      });
    });
  };

  // 🔹 --- Your Existing Border Logic Simplified ---
  if (type === "row" || type === "column" || type === "module") {
    let styleObj = null;
    if (type === "row") {
      styleObj = props.data[rowindex].style;
    } else if (type === "column") {
      styleObj = props.data[rowindex].data[columnindex].style;
    } else if (type === "module") {
      styleObj = props.data[rowindex].data[columnindex].data[moduleindex].style;
    }
    applyBorderStyles(styleObj, styleTab, device, styleState, borderprops, {
      topLeft: (num, unit) => {
        bordertopleftradius = num;
        radiusSuffix = unit;
      },
      topRight: (num, unit) => {
        bordertoprightradius = num;
        radiusSuffix = unit;
      },
      bottomLeft: (num, unit) => {
        borderbottomleftradius = num;
        radiusSuffix = unit;
      },
      bottomRight: (num, unit) => {
        borderbottomrightradius = num;
        radiusSuffix = unit;
      }
    });
  }
  const [borderStyleType, setBorderStyleType] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(borderstyletype);
  //const [borderProps, setBorderProps] = useState({ ...borderprops });
  const [radiusSuffixVal, setRadiusSuffixVal] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(radiusSuffix);
  const currentBorderColorValue = borderStyleType === "outer" ? borderprops.borderTopColor : borderStyleType === "top" ? borderprops.borderTopColor : borderStyleType === "right" ? borderprops.borderRightColor : borderStyleType === "bottom" ? borderprops.borderBottomColor : borderStyleType === "left" ? borderprops.borderLeftColor : "";
  const borderPickerValue = currentBorderColorValue;
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    let allValues = [bordertopleftradius, bordertoprightradius, borderbottomleftradius, borderbottomrightradius];
    let allEqual = allValues.every(val => val === allValues[0]);
    //let allEqual = allValues.every((val) => val === allValues[0] && val > 0);
    if (allEqual === true) {
      setRadiusJoint(allEqual);
    }
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setRadiusSuffixVal(radiusSuffix);
  }, [styleState]);
  const onChangeBorderRadius = (placement, value, updatedRadiusSuffix = radiusSuffixnew) => {
    if (value !== "auto") {
      let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      //let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }
    let items = [...props.data];
    let item = "";
    let objShallowCopy = "";
    let colObjShallowCopy = "";
    let rowObjShallowCopy = "";
    let deviceCopy = "";

    // --- get correct style reference ---
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      rowObjShallowCopy = {
        ...RowStyle[device]
      };
      item = {
        ...rowObjShallowCopy[styleState]
      };
    } else if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      colObjShallowCopy = {
        ...ColStyle[device]
      };
      item = {
        ...colObjShallowCopy[styleState]
      };
    } else if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab !== "") {
        objShallowCopy = {
          ...ModuleStyle[styleTab]
        };
        deviceCopy = {
          ...objShallowCopy[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      } else {
        deviceCopy = {
          ...ModuleStyle[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      }
    }

    // --- joint vs individual corner control ---
    if (radiusJoint) {
      const suffixes = Object.values(updatedRadiusSuffix);
      const unique = [...new Set(suffixes)];
      let uniqueSuffix = unique.length === 1 ? unique[0] // sab same → one  value
      : unique.length === 2 && suffixes.filter(v => v === unique[0]).length === 1 ? unique[0] // first unique single
      : unique.length === 2 && suffixes.filter(v => v === unique[1]).length === 1 ? unique[1] // second unique single
      : "px"; // multiple unique → px return

      item["borderTopLeftRadius"] = value + uniqueSuffix;
      item["borderTopRightRadius"] = value + uniqueSuffix;
      item["borderBottomLeftRadius"] = value + uniqueSuffix;
      item["borderBottomRightRadius"] = value + uniqueSuffix;
      setRadiusSuffixnew(prev => ({
        ...prev,
        topLeft: uniqueSuffix,
        topRight: uniqueSuffix,
        bottomLeft: uniqueSuffix,
        bottomRight: uniqueSuffix
      }));
    } else {
      // independent control for each corner
      const currentSuffix = updatedRadiusSuffix[placement] || "px";
      if (placement === "topLeft") {
        item["borderTopLeftRadius"] = value + currentSuffix;
      } else if (placement === "topRight") {
        item["borderTopRightRadius"] = value + currentSuffix;
      } else if (placement === "bottomLeft") {
        item["borderBottomLeftRadius"] = value + currentSuffix;
      } else if (placement === "bottomRight") {
        item["borderBottomRightRadius"] = value + currentSuffix;
      }
    }

    // --- assign back to props.data correctly ---
    if (type === "row") {
      rowObjShallowCopy[styleState] = item;
      items[rowindex]["style"][device] = rowObjShallowCopy;
    } else if (type === "column") {
      colObjShallowCopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = colObjShallowCopy;
    } else if (type === "module") {
      if (styleTab !== "") {
        deviceCopy[styleState] = item;
        objShallowCopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = objShallowCopy;
      } else {
        deviceCopy[styleState] = item;
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }

    // --- update style in parent ---
    props.onChangeStyle(props.data);
  };

  // const onChangeStyle = (style) => {
  //   //console.log(style);
  //   props.onChangeStyle(style);
  // };
  const handleRadiusJoint = () => {
    //setRadiusJoint(true);
    setRadiusJoint(prevCheck => !prevCheck);
  };
  const handleBorderType = type => {
    setBorderStyleType(type);
  };
  //console.log(radiusJoint);

  const onChangeWidth = (value, isReset) => {
    if (value !== "auto") {
      let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      //let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
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
      rSwcopy = {
        ...RowStyle[device]
      };
      item = {
        ...rSwcopy[styleState]
      };
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      cSwcopy = {
        ...ColStyle[device]
      };
      item = {
        ...cSwcopy[styleState]
      };
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab != "") {
        mSwcopy = {
          ...ModuleStyle[styleTab]
        };
        deviceCopy = {
          ...mSwcopy[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      } else {
        deviceCopy = {
          ...ModuleStyle[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      }
    }
    if (borderStyleType === "outer") {
      borderprops.borderTopWidth = value + "px";
      borderprops.borderRightWidth = value + "px";
      borderprops.borderBottomWidth = value + "px";
      borderprops.borderLeftWidth = value + "px";
    }
    if (borderStyleType === "top") {
      borderprops.borderTopWidth = value + "px";
    }
    if (borderStyleType === "right") {
      borderprops.borderRightWidth = value + "px";
    }
    if (borderStyleType === "bottom") {
      borderprops.borderBottomWidth = value + "px";
    }
    if (borderStyleType === "left") {
      borderprops.borderLeftWidth = value + "px";
    }
    if (type == "row") {
      rSwcopy[styleState] = {
        ...item,
        ...borderprops
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == "column") {
      cSwcopy[styleState] = {
        ...item,
        ...borderprops
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == "module") {
      deviceCopy[styleState] = {
        ...item,
        ...borderprops
      };
      if (styleTab != "") {
        mSwcopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
      } else {
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  };
  const setColorHexFun = (value, cssValue) => {
    value = (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_11__.normalizeColorPickerValue)(value, "#ffffff00", cssValue);
    if (Array.isArray(value)) {
      value = (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_11__.normalizeColorPickerValue)(value, "#ffffff00");
    }
    let items = [...props.data];
    let item = "";
    let rSwcopy = "";
    let cSwcopy = "";
    let mSwcopy = "";
    let deviceCopy = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      rSwcopy = {
        ...RowStyle[device]
      };
      item = {
        ...rSwcopy[styleState]
      };
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      cSwcopy = {
        ...ColStyle[device]
      };
      item = {
        ...cSwcopy[styleState]
      };
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab != "") {
        mSwcopy = {
          ...ModuleStyle[styleTab]
        };
        deviceCopy = {
          ...mSwcopy[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      } else {
        deviceCopy = {
          ...ModuleStyle[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      }
    }
    if (borderStyleType === "outer") {
      borderprops.borderTopColor = value;
      borderprops.borderRightColor = value;
      borderprops.borderBottomColor = value;
      borderprops.borderLeftColor = value;
    }
    if (borderStyleType === "top") {
      borderprops.borderTopColor = value;
    }
    if (borderStyleType === "right") {
      borderprops.borderRightColor = value;
    }
    if (borderStyleType === "bottom") {
      borderprops.borderBottomColor = value;
    }
    if (borderStyleType === "left") {
      borderprops.borderLeftColor = value;
    }
    if (type == "row") {
      rSwcopy[styleState] = {
        ...item,
        ...borderprops
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == "column") {
      cSwcopy[styleState] = {
        ...item,
        ...borderprops
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == "module") {
      deviceCopy[styleState] = {
        ...item,
        ...borderprops
      };
      if (styleTab != "") {
        mSwcopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
      } else {
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  };
  const handleChange = (value, isReset) => {
    let items = [...props.data];
    let item = "";
    let rSwcopy = "";
    let cSwcopy = "";
    let mSwcopy = "";
    let deviceCopy = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      rSwcopy = {
        ...RowStyle[device]
      };
      item = {
        ...rSwcopy[styleState]
      };
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      cSwcopy = {
        ...ColStyle[device]
      };
      item = {
        ...cSwcopy[styleState]
      };
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab != "") {
        mSwcopy = {
          ...ModuleStyle[styleTab]
        };
        deviceCopy = {
          ...mSwcopy[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      } else {
        deviceCopy = {
          ...ModuleStyle[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      }
    }
    if (borderStyleType === "outer") {
      borderprops.borderTopStyle = value;
      borderprops.borderRightStyle = value;
      borderprops.borderBottomStyle = value;
      borderprops.borderLeftStyle = value;
    }
    if (borderStyleType === "top") {
      borderprops.borderTopStyle = value;
    }
    if (borderStyleType === "right") {
      borderprops.borderRightStyle = value;
    }
    if (borderStyleType === "bottom") {
      borderprops.borderBottomStyle = value;
    }
    if (borderStyleType === "left") {
      borderprops.borderLeftStyle = value;
    }
    if (type == "row") {
      rSwcopy[styleState] = {
        ...item,
        ...borderprops
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == "column") {
      cSwcopy[styleState] = {
        ...item,
        ...borderprops
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == "module") {
      deviceCopy[styleState] = {
        ...item,
        ...borderprops
      };
      if (styleTab != "") {
        mSwcopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
      } else {
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  };
  const resetBorderRadius = () => {
    setRadiusSuffixVal('px');
    let items = [...props.data];
    let item = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      item = {
        ...swcopy[styleState]
      };
      item["borderTopLeftRadius"] = 0 + "px";
      item["borderTopRightRadius"] = 0 + "px";
      item["borderBottomLeftRadius"] = 0 + "px";
      item["borderBottomRightRadius"] = 0 + "px";
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      item = {
        ...swcopy[styleState]
      };
      item["borderTopLeftRadius"] = 0 + "px";
      item["borderTopRightRadius"] = 0 + "px";
      item["borderBottomLeftRadius"] = 0 + "px";
      item["borderBottomRightRadius"] = 0 + "px";
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab != "") {
        let mSwcopy = {
          ...ModuleStyle[styleTab]
        };
        let deviceCopy = {
          ...mSwcopy[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
        item["borderTopLeftRadius"] = 0 + "px";
        item["borderTopRightRadius"] = 0 + "px";
        item["borderBottomLeftRadius"] = 0 + "px";
        item["borderBottomRightRadius"] = 0 + "px";
        deviceCopy[styleState] = item;
        mSwcopy[device] = deviceCopy;
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
      } else {
        let deviceCopy = {
          ...ModuleStyle[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
        item["borderTopLeftRadius"] = 0 + "px";
        item["borderTopRightRadius"] = 0 + "px";
        item["borderBottomLeftRadius"] = 0 + "px";
        item["borderBottomRightRadius"] = 0 + "px";
        deviceCopy[styleState] = item;
        console.log(deviceCopy);
        items[rowindex].data[columnindex].data[moduleindex]["style"][device] = deviceCopy;
      }
    }
    props.onChangeStyle(props.data);
  };
  const resetBorderStyle = () => {
    handleBorderType("outer");
  };
  const safeNumber = v => {
    if (!v) return 0; // null, undefined, empty
    if (v === "NaNpx" || v === "nullpx") return 0;
    const num = parseInt(v, 10);
    return isNaN(num) ? 0 : num;
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.Fragment, {
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
      className: "caf-builder-border-container",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
        className: "caf-builder-setting-row-label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("label", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Adjust border radius values.",
            children: "Border Radius"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Reset",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)("span", {
              onClick: resetBorderRadius,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_9__.FontAwesomeIcon, {
                icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_10__.faArrowRotateLeft
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
          className: "caf-border-radius-container",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
            className: "caf-border-radius-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_7__["default"].Compact, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
                value: safeNumber(bordertopleftradius),
                onChange: value => onChangeBorderRadius("topLeft", value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
                value: radiusSuffixnew.topLeft,
                onChange: val => handleRadiusSuffixChange("topLeft", val),
                placement: "bottomRight",
                popupMatchSelectWidth: 70,
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "px",
                  children: "PX"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "%",
                  children: "%"
                })]
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_7__["default"].Compact, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
                value: safeNumber(bordertoprightradius),
                onChange: value => onChangeBorderRadius("topRight", value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
                value: radiusSuffixnew.topRight,
                onChange: val => handleRadiusSuffixChange("topRight", val),
                placement: "bottomRight",
                popupMatchSelectWidth: 70,
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "px",
                  children: "PX"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "%",
                  children: "%"
                })]
              })]
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)("div", {
            className: "border-radius-joint",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)("div", {
              className: `border-radius-joint-inner ${radiusJoint ? "active" : ""}`,
              onClick: handleRadiusJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_17__["default"], {
                className: "border-radius-joint-icon"
              })
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
            className: "caf-border-radius-row",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_7__["default"].Compact, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
                value: safeNumber(borderbottomleftradius),
                onChange: value => onChangeBorderRadius("bottomLeft", value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
                value: radiusSuffixnew.bottomLeft,
                onChange: val => handleRadiusSuffixChange("bottomLeft", val),
                placement: "bottomRight",
                popupMatchSelectWidth: 70,
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "px",
                  children: "PX"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "%",
                  children: "%"
                })]
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_7__["default"].Compact, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
                value: safeNumber(borderbottomrightradius),
                onChange: value => onChangeBorderRadius("bottomRight", value)
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
                value: radiusSuffixnew.bottomRight,
                onChange: val => handleRadiusSuffixChange("bottomRight", val),
                placement: "bottomRight",
                popupMatchSelectWidth: 70,
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "px",
                  children: "PX"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
                  value: "%",
                  children: "%"
                })]
              })]
            })]
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
        className: "caf-builder-setting-row-label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("label", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Configure border side selection and styling.",
            children: "Border Position"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Reset",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)("span", {
              onClick: resetBorderStyle,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_9__.FontAwesomeIcon, {
                icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_10__.faArrowRotateLeft
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
          className: "border-styles-bar",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_14__["default"], {
            className: `border-bar b-outer ${borderStyleType === "outer" ? "active" : ""}`,
            onClick: () => handleBorderType("outer")
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_16__["default"], {
            className: `border-bar b-top ${borderStyleType === "top" ? "active" : ""}`,
            onClick: () => handleBorderType("top")
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_15__["default"], {
            className: `border-bar b-right ${borderStyleType === "right" ? "active" : ""}`,
            onClick: () => handleBorderType("right")
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_12__["default"], {
            className: `border-bar b-bottom ${borderStyleType === "bottom" ? "active" : ""}`,
            onClick: () => handleBorderType("bottom")
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_13__["default"], {
            className: `border-bar b-left ${borderStyleType === "left" ? "active" : ""}`,
            onClick: () => handleBorderType("left")
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
        className: "caf-builder-setting-row-label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("label", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Adjust border width for the selected side.",
            children: "Border Width"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Reset",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)("span", {
              onClick: () => onChangeWidth(0, 'reset'),
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_9__.FontAwesomeIcon, {
                icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_10__.faArrowRotateLeft
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 15,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
              min: 0,
              max: 100,
              onChange: onChangeWidth
              // value={parseInt(
              //   borderStyleType === "outer"
              //     ? borderprops.borderTopWidth
              //     : borderStyleType === "top"
              //       ? borderprops.borderTopWidth
              //       : borderStyleType === "right"
              //         ? borderprops.borderRightWidth
              //         : borderStyleType === "bottom"
              //           ? borderprops.borderBottomWidth
              //           : borderStyleType === "left"
              //             ? borderprops.borderLeftWidth
              //             : 0,
              //   10
              // )}
              ,
              value: safeNumber(borderStyleType === "outer" ? borderprops.borderTopWidth : borderStyleType === "top" ? borderprops.borderTopWidth : borderStyleType === "right" ? borderprops.borderRightWidth : borderStyleType === "bottom" ? borderprops.borderBottomWidth : borderStyleType === "left" ? borderprops.borderLeftWidth : 0)
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
            className: "caf-manage-suffix-look",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
              span: 20,
              className: "input-inner-px slide-cnt-col",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
                style: {
                  margin: "0 0px 0 10px"
                }
                // value={parseInt(
                //   borderStyleType === "outer"
                //     ? borderprops.borderTopWidth
                //     : borderStyleType === "top"
                //       ? borderprops.borderTopWidth
                //       : borderStyleType === "right"
                //         ? borderprops.borderRightWidth
                //         : borderStyleType === "bottom"
                //           ? borderprops.borderBottomWidth
                //           : borderStyleType === "left"
                //             ? borderprops.borderLeftWidth
                //             : 0,
                //   10
                // )}
                ,
                value: safeNumber(borderStyleType === "outer" ? borderprops.borderTopWidth : borderStyleType === "top" ? borderprops.borderTopWidth : borderStyleType === "right" ? borderprops.borderRightWidth : borderStyleType === "bottom" ? borderprops.borderBottomWidth : borderStyleType === "left" ? borderprops.borderLeftWidth : 0),
                onChange: newValue => onChangeWidth(newValue)
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
              span: 4,
              className: "slide-cnt-col selectafter",
              children: selectAfter
            })]
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
        className: "caf-builder-setting-row-label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("label", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Set border color for the selected side.",
            children: "Border Color"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Reset",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)("span", {
              onClick: () => setColorHexFun("#ffffff00", 'reset'),
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_9__.FontAwesomeIcon, {
                icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_10__.faArrowRotateLeft
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
          className: "custom-color",
          value: borderPickerValue,
          mode: "single"
          //format="rgb"
          ,
          onChange: setColorHexFun,
          placement: "center"
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("div", {
        className: "caf-builder-setting-row-label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsxs)("label", {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Choose border line style for the selected side.",
            children: "Border Style"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Reset",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)("span", {
              onClick: () => handleChange("solid", 'reset'),
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_9__.FontAwesomeIcon, {
                icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_10__.faArrowRotateLeft
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_18__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
          defaultValue: borderStyleType === "outer" ? borderprops.borderTopStyle : borderStyleType === "top" ? borderprops.borderTopStyle : borderStyleType === "right" ? borderprops.borderRightStyle : borderStyleType === "bottom" ? borderprops.borderBottomStyle : borderStyleType === "left" ? borderprops.borderLeftStyle : "",
          style: {
            width: "100%"
          },
          onChange: handleChange,
          options: [{
            value: "solid",
            label: "Solid"
          }, {
            value: "dashed",
            label: "Dashed"
          }, {
            value: "dotted",
            label: "Dotted"
          }, {
            value: "double",
            label: "Double"
          }, {
            value: "groove",
            label: "Groove"
          }, {
            value: "ridge",
            label: "Ridge"
          }, {
            value: "inset",
            label: "Inset"
          }, {
            value: "outset",
            label: "Outset"
          }, {
            value: "none",
            label: "None"
          }],
          value: borderStyleType === "outer" ? borderprops.borderTopStyle : borderStyleType === "top" ? borderprops.borderTopStyle : borderStyleType === "right" ? borderprops.borderRightStyle : borderStyleType === "bottom" ? borderprops.borderBottomStyle : borderStyleType === "left" ? borderprops.borderLeftStyle : ""
        })]
      })]
    })
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BorderMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/BoxShadow.js"
/*!********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/BoxShadow.js ***!
  \********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/col/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/color-picker/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/slider/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var _utils_colorPicker__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../utils/colorPicker */ "./src/MainComponents/utils/colorPicker.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);






function BoxShadow(props) {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  //console.log(props, type);
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    styleState = "default",
    styleTab: originalStyleTab,
    deviceSwitch,
    isMeta
  } = props;
  let styleTab = originalStyleTab;
  //console.log(styleTab,isMeta);
  if (type === 'module' && (module?.key === 'checkbox_filter' || module?.key === 'dropdown_filter' || module?.key === 'range_slider') && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  const boxshadow = {
    shadow: "inset",
    hPosition: "0px",
    vPosition: "0px",
    blur: "0px",
    spread: "0px",
    color: "#333333"
  };
  const selectAfter = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
    defaultValue: 'px',
    value: 'px',
    placement: "bottomRight",
    popupMatchSelectWidth: 70,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"].Option, {
      value: "px",
      children: "PX"
    })
  });
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
      if (device === "tablet") {
        if (styleState === "default") {
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
      if (device === "mobile") {
        if (styleState === "default") {
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
  if (type === 'column') {
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
      if (device === "desktop") {
        if (styleState === "hover") {
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
      if (device === "tablet") {
        if (styleState === "default") {
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
      if (device === "mobile") {
        if (styleState === "default") {
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
  if (type === "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    if (styleTab !== "") {
      if (ModuleStyle[styleTab][device][styleState]?.["boxShadow"]) {
        let boxshadow1 = ModuleStyle[styleTab][device][styleState]["boxShadow"];
        let barray = boxshadow1.split(" ");
        boxshadow.hPosition = barray[0];
        boxshadow.vPosition = barray[1];
        boxshadow.blur = barray[2];
        boxshadow.spread = barray[3];
        boxshadow.shadow = barray[4];
        boxshadow.color = barray[5];
      } else {
        if (device === "desktop") {
          if (styleState === "hover" || styleState === "selected" || styleState === "placeholder") {
            if (ModuleStyle[styleTab][device]["default"]?.["boxShadow"]) {
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
        if (device === "tablet") {
          if (styleState === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["boxShadow"]) {
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
            if (ModuleStyle[styleTab][device]["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[styleTab][device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["boxShadow"]) {
                let boxshadow1 = ModuleStyle[styleTab]["desktop"]["hover"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["boxShadow"]) {
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
        if (device === "mobile") {
          if (styleState === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["boxShadow"]) {
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
            if (ModuleStyle[styleTab][device]["default"]?.["boxShadow"]) {
              let boxshadow1 = ModuleStyle[styleTab][device]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["boxShadow"]) {
                let boxshadow1 = ModuleStyle[styleTab]["desktop"]["hover"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["boxShadow"]) {
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
    if (value !== "auto" && ftype !== "color" && ftype !== "shadow") {
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
      rSwcopy = {
        ...RowStyle[device]
      };
      item = {
        ...rSwcopy[styleState]
      };
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      cSwcopy = {
        ...ColStyle[device]
      };
      item = {
        ...cSwcopy[styleState]
      };
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      if (styleTab != "") {
        mSwcopy = {
          ...ModuleStyle[styleTab]
        };
        deviceCopy = {
          ...mSwcopy[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      } else {
        deviceCopy = {
          ...ModuleStyle[device]
        };
        item = {
          ...deviceCopy[styleState]
        };
      }
    }
    if (ftype == "hPosition" || ftype == "vPosition" || ftype == "blur" || ftype == "spread") {
      boxshadow[ftype] = value + "px";
    }
    if (ftype == "color") {
      if (typeof value == "object") {
        boxshadow[ftype] = (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_10__.normalizeColorPickerValue)(value);
      } else {
        boxshadow[ftype] = value;
      }
    }
    if (ftype == "shadow") {
      if (value == 'inset') {
        boxshadow[ftype] = value;
      } else {
        boxshadow[ftype] = '';
      }
    }
    let bShadow = boxshadow["hPosition"] + " " + boxshadow["vPosition"] + " " + boxshadow["blur"] + " " + boxshadow['spread'] + " " + boxshadow['shadow'] + " " + boxshadow['color'];
    if (type == "row") {
      rSwcopy[styleState] = {
        ...item,
        boxShadow: bShadow
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == "column") {
      cSwcopy[styleState] = {
        ...item,
        boxShadow: bShadow
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == "module") {
      deviceCopy[styleState] = {
        ...item,
        boxShadow: bShadow
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
          boxShadow: ""
        };
        items[rowindex]["style"][device] = rSwcopy;
      } else {
        rSwcopy[styleState] = {
          ...item,
          boxShadow: bShadow
        };
        items[rowindex]["style"][device] = rSwcopy;
      }
    }
    if (type == "column") {
      if (styleState == "hover" && isReset == "reset") {
        cSwcopy[styleState] = {
          ...item,
          boxShadow: ""
        };
        items[rowindex].data[columnindex]["style"][device] = cSwcopy;
      } else {
        cSwcopy[styleState] = {
          ...item,
          boxShadow: bShadow
        };
        items[rowindex].data[columnindex]["style"][device] = cSwcopy;
      }
    }
    if (type == "module") {
      if (styleState == "hover" && isReset == "reset") {
        deviceCopy[styleState] = {
          ...item,
          boxShadow: ""
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
          boxShadow: bShadow
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
  const safeNumber = v => {
    if (!v) return 0; // null, undefined, empty
    if (v === "NaNpx" || v === "nullpx") return 0;
    const num = parseInt(v, 10);
    return isNaN(num) ? 0 : num;
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
      className: "caf-builder-setting-row-label",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Set the shadow color.",
          children: "Color"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Reset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
            onClick: () => resetPosition("#333333", "color", "reset"),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__.FontAwesomeIcon, {
              icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__.faArrowRotateLeft
            })
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        className: "custom-color",
        value: boxshadow.color,
        mode: ["single"]
        // format="rgb"
        ,
        onChange: value => onChangeBox(value, "color"),
        placement: "center"
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
      className: "caf-builder-setting-row-label",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Adjust horizontal shadow offset.",
          children: "Horizontal Position"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Reset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
            onClick: () => resetPosition(0, "hPosition", "reset"),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__.FontAwesomeIcon, {
              icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__.faArrowRotateLeft
            })
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
          span: 15,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            min: -80,
            max: 100,
            onChange: value => onChangeBox(value, "hPosition"),
            value: parseInt(boxshadow.hPosition, 10)
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "caf-manage-suffix-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 22,
            className: "input-inner-px slide-cnt-col",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
              style: {
                margin: "0 0px 0 10px"
              },
              value: safeNumber(boxshadow.hPosition, 10),
              onChange: newValue => onChangeBox(newValue, "hPosition")
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 4,
            className: "slide-cnt-col selectafter",
            children: selectAfter
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
      className: "caf-builder-setting-row-label",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Adjust vertical shadow offset.",
          children: "Vertical Position"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Reset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
            onClick: () => resetPosition(0, "vPosition", "reset"),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__.FontAwesomeIcon, {
              icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__.faArrowRotateLeft
            })
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
          span: 15,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            min: -80,
            max: 100,
            onChange: value => onChangeBox(value, "vPosition"),
            value: parseInt(boxshadow.vPosition, 10)
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "caf-manage-suffix-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 22,
            className: "input-inner-px slide-cnt-col",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
              style: {
                margin: "0 0px 0 10px"
              },
              value: safeNumber(boxshadow.vPosition, 10),
              onChange: newValue => onChangeBox(newValue, "vPosition")
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 4,
            className: "slide-cnt-col selectafter",
            children: selectAfter
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
      className: "caf-builder-setting-row-label",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Control shadow blur intensity.",
          children: "Blur Strength"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Reset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
            onClick: () => resetPosition(0, "blur", "reset"),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__.FontAwesomeIcon, {
              icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__.faArrowRotateLeft
            })
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
          span: 15,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            min: 0,
            max: 50,
            onChange: value => onChangeBox(value, "blur"),
            value: parseInt(boxshadow.blur, 10)
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "caf-manage-suffix-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 22,
            className: "input-inner-px slide-cnt-col",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
              style: {
                margin: "0 0px 0 10px"
              },
              value: safeNumber(boxshadow.blur, 10),
              onChange: newValue => onChangeBox(newValue, "blur")
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 4,
            className: "slide-cnt-col selectafter",
            children: selectAfter
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
      className: "caf-builder-setting-row-label",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Control how far the shadow spreads.",
          children: "Spread Strength"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Reset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
            onClick: () => resetPosition(0, "spread", "reset"),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__.FontAwesomeIcon, {
              icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__.faArrowRotateLeft
            })
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
          span: 15,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            min: -80,
            max: 80,
            onChange: value => onChangeBox(value, "spread"),
            value: parseInt(boxshadow.spread, 10)
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
          className: "caf-manage-suffix-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 22,
            className: "input-inner-px slide-cnt-col",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
              style: {
                margin: "0 0px 0 10px"
              },
              value: safeNumber(boxshadow.spread, 10),
              onChange: newValue => onChangeBox(newValue, "spread")
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 4,
            className: "slide-cnt-col selectafter",
            children: selectAfter
          })]
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
      className: "caf-builder-setting-row-label",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("label", {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Choose inner or outer shadow position.",
          children: "Position"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Reset",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
            onClick: () => resetPosition("inset", "shadow", "reset"),
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__.FontAwesomeIcon, {
              icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__.faArrowRotateLeft
            })
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
        defaultValue: boxshadow.shadow == "inset" ? "inset" : "outset",
        style: {
          width: "100%"
        },
        onChange: value => onChangeBox(value, "shadow"),
        options: [{
          value: "inset",
          label: "Inner Shadow"
        }, {
          value: "outset",
          label: "Outer Shadow"
        }],
        value: boxshadow.shadow == "inset" ? "inset" : "outset"
      })]
    })]
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BoxShadow);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js"
/*!********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js ***!
  \********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/color-picker/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var _utils_colorPicker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../utils/colorPicker */ "./src/MainComponents/utils/colorPicker.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);






const ColorMain = props => {
  const {
    property,
    label,
    styleState = "default",
    defaultValue,
    deviceSwitch,
    styleTab: originalStyleTab,
    isMeta
  } = props;
  const allowGradient = String(property || "").toLowerCase() !== "color";
  const gradientAllowed = allowGradient && (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_5__.canUseGradientColors)();
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  let currentValue = "";
  let device = deviceSwitch;
  let styleTab = originalStyleTab;
  //console.log(styleState);
  if (type === 'module' && (module?.key === 'checkbox_filter' || module?.key === 'dropdown_filter' || module?.key === 'search' || module?.key === 'range_slider') && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'dropdown_filter' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  //  const [colorHex, setColorHex] = useState(currentValue);
  if (type === 'row') {
    let RowStyle = props.data[rowindex].style;
    if (RowStyle[device][styleState]?.[property]) {
      currentValue = RowStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState === "hover") {
          if (RowStyle[device]["default"]?.[property]) {
            currentValue = RowStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
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
      if (device === "mobile") {
        if (styleState === "default") {
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
  if (type === 'column') {
    let ColStyle = props.data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleState]?.[property]) {
      currentValue = ColStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.[property]) {
            currentValue = ColStyle[device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
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
      if (device === "mobile") {
        if (styleState === "default") {
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
  if (type === "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    // console.log(device, styleState);
    if (ModuleStyle[styleTab][device][styleState]?.[property]) {
      currentValue = ModuleStyle[styleTab][device][styleState][property];
    } else {
      if (device === "desktop") {
        //console.log(styleState);
        if (styleState === "hover" || styleState === "selected" || styleState === "placeholder") {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab][device]["default"][property];
          }
        }
      }
      if (device === "tablet") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleState === "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.[property]) {
            currentValue = ModuleStyle[styleTab][device]["default"][property];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }
  const normalizedCurrentValue = (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_5__.normalizeColorPickerValue)(currentValue, defaultValue);
  const normalizedStops = typeof normalizedCurrentValue === "string" && normalizedCurrentValue.includes("gradient(") ? (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_5__.gradientCssToStops)(normalizedCurrentValue) : null;
  const pickerValue = !gradientAllowed && normalizedStops?.length ? normalizedStops[0].color : normalizedStops ? normalizedStops || normalizedCurrentValue : normalizedCurrentValue;
  const setColorHexFun = (value, cssValue) => {
    ChangeStyle(property, (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_5__.normalizeColorPickerValue)(value, defaultValue, cssValue));
  };
  const ChangeStyle = (property, value) => {
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = {
        ...ModuleStyle[styleTab]
      };
      let deviceCopy = {
        ...swcopy[device]
      };
      let item = {
        ...deviceCopy[styleState]
      };
      item[property] = value;
      deviceCopy[styleState] = item;
      swcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(items);
  };
  const resetValue = () => {
    ChangeStyle(property, defaultValue);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: `caf-builder-setting-row-label`,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("label", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: `Adjust ${label} settings.`,
        children: label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Reset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
          onClick: resetValue,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_3__.FontAwesomeIcon, {
            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_4__.faArrowRotateLeft
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
      className: "custom-color",
      value: pickerValue,
      mode: (0,_utils_colorPicker__WEBPACK_IMPORTED_MODULE_5__.getColorPickerModes)(allowGradient)
      // format="rgb"
      ,
      onChange: setColorHexFun,
      placement: "center"
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ColorMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js"
/*!*********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js ***!
  \*********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var _utils_globalFontFamily__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../utils/globalFontFamily */ "./src/MainComponents/utils/globalFontFamily.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);






const SelectMain = props => {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const {
    property,
    label,
    options,
    defaultValue,
    styleState = 'default',
    deviceSwitch,
    styleTab: originalStyleTab,
    isMeta
  } = props;
  const [direction, setDirection] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('unset');
  let currentposition = "";
  let styleTab = originalStyleTab;
  if (type === 'module' && (module?.key === 'checkbox_filter' || module?.key === 'dropdown_filter' || module?.key === 'search' || module?.key === 'range_slider') && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'dropdown_filter' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'search' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
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
                currentposition = RowStyle["desktop"]["default"][property];
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
                currentposition = RowStyle["desktop"]["default"][property];
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
                currentposition = ColStyle["desktop"]["default"][property];
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
                currentposition = ColStyle["desktop"]["default"][property];
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
                currentposition = ModuleStyle[styleTab]["desktop"]["default"][property];
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
                currentposition = ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }
  const handleChange = value => {
    setDirection(value);
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = {
        ...ModuleStyle[styleTab]
      };
      let deviceCopy = {
        ...swcopy[device]
      };
      let item = {
        ...deviceCopy[styleState]
      };
      item[property] = value;
      deviceCopy[styleState] = item;
      swcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
      if (property === "fontFamily" && value) {
        (0,_utils_globalFontFamily__WEBPACK_IMPORTED_MODULE_5__.loadFontFamily)(value);
      }
    }
    props.onChangeStyle(props.data);
  };
  const resetValue = () => {
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = defaultValue;
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = defaultValue;
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = {
        ...ModuleStyle[styleTab]
      };
      let deviceCopy = {
        ...swcopy[device]
      };
      let item = {
        ...deviceCopy[styleState]
      };
      item[property] = defaultValue;
      deviceCopy[styleState] = item;
      swcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  let cl = 'webflow-dropdown';
  if (props?.class === 'flex-direction') {
    // cl='webflow-dropdown';
    //console.log(direction,currentposition,props);
    //   if(direction==='unset') {
    //   currentposition='unset';
    //   cl='webflow-dropdown-color';
    // }
    if (currentposition === 'row' || currentposition === 'column') {
      currentposition = 'unset';
      cl = 'webflow-dropdown-color';
    }
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: `caf-builder-setting-row-label ${props?.class ? props?.class : ''}`,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("label", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: `Adjust ${label} settings.`,
        children: label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Reset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
          onClick: resetValue,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_3__.FontAwesomeIcon, {
            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_4__.faArrowRotateLeft
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
      classNames: {
        root: "caf-builder-tooltip"
      },
      placement: "topLeft",
      title: props?.tooltip ? props.tooltip : '',
      styles: {
        container: {
          fontSize: 12
        }
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
        defaultValue: currentposition,
        style: {
          width: "100%"
        },
        onChange: handleChange,
        options: [...options],
        value: currentposition,
        placement: "topRight",
        popupMatchSelectWidth: true,
        className: cl,
        hoverValue: props?.hoverValue || "",
        ...(property === "fontFamily" ? {
          showSearch: true,
          optionFilterProp: "label"
        } : {}),
        popupRender: menu => props?.hoverValue ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
            children: [menu, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
              style: {
                padding: "8px 10px",
                borderTop: "1px solid #d7d3d3",
                background: "#e9e9e9",
                fontSize: "12px",
                fontWeight: "600"
              },
              dangerouslySetInnerHTML: {
                __html: props.hoverValue
              }
            })]
          })
        }) : menu // fallback: render normal dropdown when hoverValue not present
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SelectMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js"
/*!*********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js ***!
  \*********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/col/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input-number/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/select/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/slider/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/space/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);





const {
  Option
} = antd__WEBPACK_IMPORTED_MODULE_4__["default"];
const SliderMain = props => {
  //console.log(props);
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    styleState = 'default',
    deviceSwitch,
    styleTab: originalStyleTab,
    isMeta
  } = props;
  let styleTab = originalStyleTab;
  //console.log(styleTab,isMeta);
  if (type === 'module' && (module?.key === 'checkbox_filter' || module?.key === 'dropdown_filter' || module?.key === 'search' || module?.key === 'range_slider') && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'dropdown_filter' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'search' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  let currentValue = "";
  let device = deviceSwitch;
  if (defaultValue) {
    currentValue = defaultValue;
  }
  let currentSuffix = "";
  if (defaultSuffix) {
    currentSuffix = defaultSuffix;
  }
  function getSuffix(value) {
    if (value === "auto") {
      return "-"; // If value is "auto", return "auto"
    }
    // Use regex to match "px", "%", or any alphabetical unit
    let match = value.match(/[a-z%]+/i);
    return match ? match[0] : "px"; // Return the suffix or default to "px" if no match is found
  }
  if (type === 'row') {
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
  if (type === 'column') {
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
  if (type === "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    // console.log(ModuleStyle,styleTab,device,styleState);
    if (styleTab !== "") {
      if (ModuleStyle[styleTab][device][styleState]?.[property]) {
        currentValue = ModuleStyle[styleTab][device][styleState][property];
      } else {
        if (device === "desktop") {
          if (styleState === "hover" || styleState === "selected" || styleState === "placeholder") {
            if (ModuleStyle[styleTab][device]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab][device]["default"][property];
            }
          }
        }
        if (device === "tablet") {
          if (styleState === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab][device]["default"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
                currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                  currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleState === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab][device]["default"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
                currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                  currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
                }
              }
            }
          }
        }
      }
    } else {
      //console.log(ModuleStyle,styleTab,device,styleState);
      if (ModuleStyle[styleTab][device][styleState]?.[property]) {
        currentValue = ModuleStyle[styleTab][device][styleState][property];
      } else {
        if (device === "desktop") {
          if (styleState === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab][device]["default"][property];
            }
          }
        }
        if (device === "tablet") {
          if (styleState === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab][device]["default"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
                currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                  currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleState === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.[property]) {
              currentValue = ModuleStyle[styleTab][device]["default"][property];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.[property]) {
                currentValue = ModuleStyle[styleTab]["desktop"]["hover"][property];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.[property]) {
                  currentValue = ModuleStyle[styleTab]["desktop"]["default"][property];
                }
              }
            }
          }
        }
      }
    }
  }
  currentSuffix = getSuffix(currentValue);
  // const [inputValue, setInputValue] = useState(parseInt(currentValue, 10));
  const [suffix, setSuffix] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(currentSuffix);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setSuffix(getSuffix(String(currentValue || "")));
  }, [currentValue, styleState, styleTab, isMeta, property, device]);
  const onSelectChange = value => {
    if (value !== "auto") {
      setSuffix(value);
      ChangeStyle(property, parseInt(currentValue, 10), value);
    } else {
      setSuffix('-');
      ChangeStyle(property, "auto");
    }
  };
  //console.log(currentValue, property, label, suffix);
  const selectAfter = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
    defaultValue: suffix,
    value: suffix,
    onChange: onSelectChange,
    placement: "bottomRight",
    popupMatchSelectWidth: 70,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_4__["default"].Option, {
      value: "px",
      children: "PX"
    }), property !== 'fontSize' && property !== 'letterSpacing' && property !== 'lineHeight' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_4__["default"].Option, {
        value: "%",
        children: "%"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_4__["default"].Option, {
        value: "auto",
        children: "auto"
      })]
    })]
  });
  // const onChangeSlider = (newValue) => {
  //   //setInputValue(newValue);
  //   ChangeStyle(property, newValue, suffix);
  // };
  const onChangeNumber = value => {
    //setInputValue(e.target.value);
    ChangeStyle(property, value, suffix);
  };
  const ChangeStyle = (property, value, suffix = "") => {
    let items = [...props.data];
    const incomingValue = value;
    if (value !== "auto") {
      // let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }
    //console.log(value);
    // Define joint pairs
    const jointPairs = {
      marginTop: "marginBottom",
      marginBottom: "marginTop",
      marginLeft: "marginRight",
      marginRight: "marginLeft",
      paddingTop: "paddingBottom",
      paddingBottom: "paddingTop",
      paddingLeft: "paddingRight",
      paddingRight: "paddingLeft"
    };
    const applyChange = targetProperty => {
      const assignProperty = item => {
        if (targetProperty === "lineHeight" && (incomingValue === "" || incomingValue === null || incomingValue === undefined || isNaN(incomingValue))) {
          delete item[targetProperty];
        } else {
          item[targetProperty] = value + suffix;
        }
      };
      if (type === "row") {
        let RowStyle = props.data[rowindex].style;
        let deviceCopy = {
          ...RowStyle[device]
        };
        let item = {
          ...deviceCopy[styleState]
        };
        assignProperty(item);
        deviceCopy[styleState] = item;
        items[rowindex]["style"][device] = deviceCopy;
      }
      if (type === "column") {
        let ColStyle = props.data[rowindex].data[columnindex].style;
        let deviceCopy = {
          ...ColStyle[device]
        };
        let item = {
          ...deviceCopy[styleState]
        };
        assignProperty(item);
        deviceCopy[styleState] = item;
        items[rowindex].data[columnindex]["style"][device] = deviceCopy;
      }
      if (type === "module") {
        let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
        if (styleTab !== "") {
          let swcopy = {
            ...ModuleStyle[styleTab]
          };
          let deviceCopy = {
            ...swcopy[device]
          };
          let item = {
            ...deviceCopy[styleState]
          };
          assignProperty(item);
          deviceCopy[styleState] = item;
          swcopy[device] = deviceCopy;
          items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
        } else {
          let swcopy = {
            ...ModuleStyle[device]
          };
          let item = {
            ...swcopy[styleState]
          };
          assignProperty(item);
          swcopy[styleState] = item;
          items[rowindex].data[columnindex].data[moduleindex]["style"][device] = swcopy;
        }
      }
    };

    // Apply pair logic
    if (props.isSpacingJoint && jointPairs[property]) {
      applyChange(property);
      applyChange(jointPairs[property]);
    } else {
      applyChange(property);
    }
    //console.log(props.data)
    props.onChangeStyle(props.data);
  };
  const resetValue = () => {
    setSuffix(defaultSuffix);
    let items = [...props.data];
    const resetProperty = item => {
      if (property === "lineHeight" && (defaultValue === "" || defaultValue === null || defaultValue === undefined || isNaN(defaultValue))) {
        delete item[property];
      } else {
        item[property] = defaultValue + defaultSuffix;
      }
    };
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      resetProperty(item);
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      resetProperty(item);
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = {
        ...ModuleStyle[styleTab]
      };
      let deviceCopy = {
        ...swcopy[device]
      };
      let item = {
        ...deviceCopy[styleState]
      };
      resetProperty(item);
      deviceCopy[styleState] = item;
      swcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
    className: `${extraClass} caf-builder-setting-row-label width`,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("label", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: `Adjust ${label} settings.`,
        children: label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Reset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
          onClick: resetValue,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_8__.FontAwesomeIcon, {
            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_9__.faArrowRotateLeft
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
      orientation: "vertical"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
      children: props?.isSlider ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
          span: 15,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            min: 0,
            max: 100,
            value: parseInt(currentValue, 10) || 0,
            onChange: newValue => ChangeStyle(property, newValue, suffix),
            tooltip: {
              open: false
            }
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
          className: "caf-manage-suffix-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 20,
            className: "slide-cnt-col",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
              changeOnWheel: true,
              min: 0,
              value: property === "lineHeight" && (currentValue === undefined || currentValue === null || currentValue === "" || currentValue === "NaN" || Number.isNaN(currentValue)) ? null : currentValue !== "auto" ? currentValue === "NaN%" || currentValue === "NaNpx" || currentValue === "nullpx" || currentValue === "null%" ? 0 : parseInt(currentValue, 10) : "auto",
              onChange: newValue => ChangeStyle(property, newValue, suffix),
              tooltip: {
                open: false
              },
              className: "slide-cnt"
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 4,
            className: "slide-cnt-col selectafter",
            children: selectAfter
          })]
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "caf-manage-suffix-look col2",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
          span: extraClass === "colm2" ? 20 : 24,
          className: "slide-cnt-col",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
            changeOnWheel: true
            // suffix={selectAfter}
            ,
            value: currentValue !== "auto" ? currentValue === "NaN%" || currentValue === "NaNpx" || currentValue === "nullpx" || currentValue === "null%" ? 0 : parseInt(currentValue, 10) : "auto",
            onChange: newValue => onChangeNumber(newValue)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            span: 4,
            className: "slide-cnt-col selectafter",
            children: selectAfter
          }), props?.labelBottom ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
            className: "label-bottom",
            children: label
          }) : null]
        })
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SliderMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/StyleMain.js"
/*!********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/StyleMain.js ***!
  \********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/FontSizeOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ItalicOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/SortDescendingOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/StrikethroughOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/UnderlineOutlined.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);






const StyleMain = props => {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    fonts,
    styleState,
    deviceSwitch,
    styleTab: originalStyleTab,
    isMeta
  } = props;
  let styleTab = originalStyleTab;
  //console.log(isMeta);
  if (type === 'module' && (module?.key === 'checkbox_filter' || module?.key === 'dropdown_filter' || module?.key === 'search' || module?.key === 'range_slider') && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'dropdown_filter' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  let fstyle = "normal";
  let trans = "inherit";
  let uldcor = "inherit";
  let device = deviceSwitch;
  if (type == 'row') {
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
  if (type == 'column') {
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
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    if (ModuleStyle[styleTab][device][styleState]?.fontStyle) {
      fstyle = ModuleStyle[styleTab][device][styleState].fontStyle;
    } else {
      if (device == "desktop") {
        if (styleState == "hover" || styleState === "selected" || styleState === "placeholder") {
          if (ModuleStyle[styleTab][device]["default"]?.fontStyle) {
            fstyle = ModuleStyle[styleTab][device]["default"].fontStyle;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.fontStyle) {
            fstyle = ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.fontStyle) {
            fstyle = ModuleStyle[styleTab][device]["default"].fontStyle;
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.fontStyle) {
              fstyle = ModuleStyle[styleTab]["desktop"]["hover"].fontStyle;
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.fontStyle) {
                fstyle = ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.fontStyle) {
            fstyle = ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.fontStyle) {
            fstyle = ModuleStyle[styleTab][device]["default"].fontStyle;
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.fontStyle) {
              fstyle = ModuleStyle[styleTab]["desktop"]["hover"].fontStyle;
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.fontStyle) {
                fstyle = ModuleStyle[styleTab]["desktop"]["default"].fontStyle;
              }
            }
          }
        }
      }
    }
    if (ModuleStyle[styleTab][device][styleState]?.textTransform) {
      trans = ModuleStyle[styleTab][device][styleState].textTransform;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[styleTab][device]["default"]?.textTransform) {
            trans = ModuleStyle[styleTab][device]["default"].textTransform;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.textTransform) {
            trans = ModuleStyle[styleTab]["desktop"]["default"].textTransform;
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.textTransform) {
            trans = ModuleStyle[styleTab][device]["default"].textTransform;
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.textTransform) {
              trans = ModuleStyle[styleTab]["desktop"]["hover"].textTransform;
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.textTransform) {
                trans = ModuleStyle[styleTab]["desktop"]["default"].textTransform;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.textTransform) {
            trans = ModuleStyle[styleTab]["desktop"]["default"].textTransform;
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.textTransform) {
            trans = ModuleStyle[styleTab][device]["default"].textTransform;
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.textTransform) {
              trans = ModuleStyle[styleTab]["desktop"]["hover"].textTransform;
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.textTransform) {
                trans = ModuleStyle[styleTab]["desktop"]["default"].textTransform;
              }
            }
          }
        }
      }
    }
    if (ModuleStyle[styleTab][device][styleState]?.textDecoration) {
      uldcor = ModuleStyle[styleTab][device][styleState].textDecoration;
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[styleTab][device]["default"]?.textDecoration) {
            uldcor = ModuleStyle[styleTab][device]["default"].textDecoration;
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.textDecoration) {
            uldcor = ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.textDecoration) {
            uldcor = ModuleStyle[styleTab][device]["default"].textDecoration;
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.textDecoration) {
              uldcor = ModuleStyle[styleTab]["desktop"]["hover"].textDecoration;
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.textDecoration) {
                uldcor = ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.textDecoration) {
            uldcor = ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.textDecoration) {
            uldcor = ModuleStyle[styleTab][device]["default"].textDecoration;
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.textDecoration) {
              uldcor = ModuleStyle[styleTab]["desktop"]["hover"].textDecoration;
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.textDecoration) {
                uldcor = ModuleStyle[styleTab]["desktop"]["default"].textDecoration;
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
    textDecoration: uldcor
  };
  const handleStyle = action => {
    let items = [...props.data];
    let item = "";
    let rSwcopy = "";
    let cSwcopy = "";
    let mSwcopy = "";
    let deviceCopy = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      rSwcopy = {
        ...RowStyle[device]
      };
      item = {
        ...rSwcopy[styleState]
      };
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      cSwcopy = {
        ...ColStyle[device]
      };
      item = {
        ...cSwcopy[styleState]
      };
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      mSwcopy = {
        ...ModuleStyle[styleTab]
      };
      deviceCopy = {
        ...mSwcopy[device]
      };
      item = {
        ...deviceCopy[styleState]
      };
    }
    if (action == "fontStyle") {
      if (fontStyles.fontStyle == "normal") {
        fontStyles.fontStyle = "italic";
      } else {
        fontStyles.fontStyle = "normal";
      }
    }
    if (action == "textTransformU") {
      if (fontStyles.textTransform == "inherit" || fontStyles.textTransform == "capitalize") {
        fontStyles.textTransform = "uppercase";
      } else {
        fontStyles.textTransform = "inherit";
      }
    }
    if (action == "textTransformC") {
      if (fontStyles.textTransform == "inherit" || fontStyles.textTransform == "uppercase") {
        fontStyles.textTransform = "capitalize";
      } else {
        fontStyles.textTransform = "inherit";
      }
    }
    if (action == "textDecorationU") {
      if (fontStyles.textDecoration == "inherit" || fontStyles.textDecoration == "line-through") {
        fontStyles.textDecoration = "underline";
      } else {
        fontStyles.textDecoration = "inherit";
      }
    }
    if (action == "textDecorationL") {
      if (fontStyles.textDecoration == "inherit" || fontStyles.textDecoration == "underline") {
        fontStyles.textDecoration = "line-through";
      } else {
        fontStyles.textDecoration = "inherit";
      }
    }
    if (type == 'row') {
      rSwcopy[styleState] = {
        ...item,
        ...fontStyles
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == 'column') {
      cSwcopy[styleState] = {
        ...item,
        ...fontStyles
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == 'module') {
      deviceCopy[styleState] = {
        ...item,
        ...fontStyles
      };
      mSwcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
    }
    props.onChangeStyle(props.data);
  };
  const resetStyle = () => {
    let items = [...props.data];
    let item = "";
    let rSwcopy = "";
    let cSwcopy = "";
    let mSwcopy = "";
    let deviceCopy = "";
    fontStyles = {
      fontStyle: "normal",
      textTransform: "inherit",
      textDecoration: "inherit"
    };
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      rSwcopy = {
        ...RowStyle[device]
      };
      item = {
        ...rSwcopy[styleState]
      };
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      cSwcopy = {
        ...ColStyle[device]
      };
      item = {
        ...cSwcopy[styleState]
      };
      ;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = {
        ...ModuleStyle[styleTab]
      };
      let deviceCopy = {
        ...swcopy[device]
      };
      item = {
        ...deviceCopy[styleState]
      };
    }
    if (type == 'row') {
      rSwcopy[styleState] = {
        ...item,
        ...fontStyles
      };
      items[rowindex]["style"][device] = rSwcopy;
    }
    if (type == 'column') {
      cSwcopy[styleState] = {
        ...item,
        ...fontStyles
      };
      items[rowindex].data[columnindex]["style"][device] = cSwcopy;
    }
    if (type == 'module') {
      deviceCopy[styleState] = {
        ...item,
        ...fontStyles
      };
      mSwcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = mSwcopy;
    }
    props.onChangeStyle(props.data);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
    className: `caf-builder-setting-row-label`,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("label", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Adjust font style options.",
        children: "Font Style"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Reset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)("span", {
          onClick: resetStyle,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7__.FontAwesomeIcon, {
            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_8__.faArrowRotateLeft
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsxs)("div", {
      className: "style-icons-wrapped",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_2__["default"], {
        className: fstyle === "italic" ? "active" : "",
        onClick: () => handleStyle("fontStyle")
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_3__["default"], {
        onClick: () => handleStyle("textTransformU"),
        className: trans === "uppercase" ? "active" : ""
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
        className: trans === "capitalize" ? "active" : "",
        onClick: () => handleStyle("textTransformC")
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_5__["default"], {
        className: uldcor === "underline" ? "active" : "",
        onClick: () => handleStyle("textDecorationU")
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_4__["default"], {
        className: uldcor === "line-through" ? "active" : "",
        onClick: () => handleStyle("textDecorationL")
      })]
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StyleMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextAlignMain.js"
/*!************************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/TextAlignMain.js ***!
  \************************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/AlignCenterOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/AlignLeftOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/AlignRightOutlined.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);






function TextAlignMain(props) {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const {
    property,
    label,
    styleState = 'default',
    deviceSwitch,
    styleTab: originalStyleTab,
    isMeta
  } = props;
  let currentalign = "left";
  let device = deviceSwitch;
  let styleTab = originalStyleTab;
  //console.log(isMeta);
  if (type === 'module' && (module?.key === 'checkbox_filter' || module?.key === 'dropdown_filter' || module?.key === 'search' || module?.key === 'range_slider') && isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  if (type === 'module' && module?.key === 'reset' && isMeta !== undefined && isMeta !== '') {
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
                currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
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
                currentalign = ModuleStyle[styleTab]["desktop"]["default"][property];
              }
            }
          }
        }
      }
    }
  }

  //const [align, setAlign] = useState(currentalign);
  const handleAlign = value => {
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = value;
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = {
        ...ModuleStyle[styleTab]
      };
      let deviceCopy = {
        ...swcopy[device]
      };
      let item = {
        ...deviceCopy[styleState]
      };
      item[property] = value;
      deviceCopy[styleState] = item;
      swcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  const resetValue = () => {
    let items = [...props.data];
    if (type === "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = {
        ...RowStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = "left";
      swcopy[styleState] = item;
      items[rowindex]["style"][device] = swcopy;
    }
    if (type === "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = {
        ...ColStyle[device]
      };
      let item = {
        ...swcopy[styleState]
      };
      item[property] = "left";
      swcopy[styleState] = item;
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type === "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = {
        ...ModuleStyle[styleTab]
      };
      let deviceCopy = {
        ...swcopy[device]
      };
      let item = {
        ...deviceCopy[styleState]
      };
      item[property] = "left";
      deviceCopy[styleState] = item;
      swcopy[device] = deviceCopy;
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    className: "caf-builder-setting-row-label",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("label", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: `Adjust ${label} settings.`,
        children: label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Reset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
          onClick: resetValue,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_4__.FontAwesomeIcon, {
            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_5__.faArrowRotateLeft
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "caf-aligned-settings",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
        title: "Left",
        className: currentalign == "left" && "active",
        onClick: () => handleAlign("left"),
        style: {
          fontSize: "20px"
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_0__["default"], {
        title: "Center",
        className: currentalign == "center" && "active",
        onClick: () => handleAlign("center"),
        style: {
          fontSize: "20px"
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_2__["default"], {
        title: "Right",
        className: currentalign == "right" && "active",
        onClick: () => handleAlign("right"),
        style: {
          fontSize: "20px"
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_2__["default"], {
        title: "Justify",
        className: currentalign == "justify" && "active",
        onClick: () => handleAlign("justify"),
        style: {
          fontSize: "20px"
        }
      })]
    })]
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextAlignMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextMain.js"
/*!*******************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/TextMain.js ***!
  \*******************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _SelectMain__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SelectMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js");
/* harmony import */ var _ColorMain__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ColorMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js");
/* harmony import */ var _SliderMain__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SliderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js");
/* harmony import */ var _StyleMain__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./StyleMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/StyleMain.js");
/* harmony import */ var _TextAlignMain__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./TextAlignMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextAlignMain.js");
/* harmony import */ var _constants_fontWeightOptions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../constants/fontWeightOptions */ "./src/MainComponents/constants/fontWeightOptions.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);










function TextMain(props) {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    fonts,
    styleTab,
    hoverSwitch,
    isMeta = 'header'
  } = props;
  let styleState = "default";
  if (hoverSwitch === true) {
    styleState = "hover";
  } else if (hoverSwitch === 'selected') {
    styleState = "selected";
  }
  const onChangeStyle = style => {
    props.onChangeStyle(style);
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_SelectMain__WEBPACK_IMPORTED_MODULE_1__["default"], {
      data: props.data,
      indexes: props.indexes,
      onChangeStyle: onChangeStyle,
      property: "fontFamily",
      label: "Font Family",
      defaultValue: "Open Sans",
      deviceSwitch: props.deviceSwitch,
      styleState: styleState,
      styleTab: props.styleTab,
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta,
      options: fonts ? fonts?.map((item, index) => ({
        label: item.family,
        value: item.family
      })) : ''
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_SelectMain__WEBPACK_IMPORTED_MODULE_1__["default"], {
      data: props.data,
      indexes: props.indexes,
      onChangeStyle: onChangeStyle,
      property: "fontWeight",
      label: "Font Weight",
      defaultValue: "400",
      styleState: styleState,
      deviceSwitch: props.deviceSwitch,
      styleTab: props.styleTab,
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta,
      options: _constants_fontWeightOptions__WEBPACK_IMPORTED_MODULE_6__.FONT_WEIGHT_OPTIONS
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_StyleMain__WEBPACK_IMPORTED_MODULE_4__["default"], {
      data: props.data,
      indexes: props.indexes,
      property: "fontStyle",
      label: "Font Style",
      onChangeStyle: onChangeStyle,
      deviceSwitch: props.deviceSwitch,
      styleTab: props.styleTab,
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta,
      styleState: styleState
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_ColorMain__WEBPACK_IMPORTED_MODULE_2__["default"], {
      data: props.data,
      indexes: props.indexes,
      property: "color",
      defaultValue: "#333333",
      label: "Color",
      onChangeStyle: onChangeStyle,
      styleState: styleState,
      deviceSwitch: props.deviceSwitch,
      styleTab: props.styleTab,
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_SliderMain__WEBPACK_IMPORTED_MODULE_3__["default"], {
      data: props.data,
      indexes: props.indexes,
      property: "fontSize",
      label: "Font Size",
      defaultSuffix: "px",
      defaultValue: "14",
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta,
      onChangeStyle: onChangeStyle,
      styleState: styleState,
      deviceSwitch: props.deviceSwitch,
      styleTab: props.styleTab,
      isSlider: true
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_SliderMain__WEBPACK_IMPORTED_MODULE_3__["default"], {
      data: props.data,
      indexes: props.indexes,
      property: "letterSpacing",
      label: "Letter Spacing",
      defaultSuffix: "px",
      defaultValue: "0",
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta,
      onChangeStyle: onChangeStyle,
      styleState: styleState,
      deviceSwitch: props.deviceSwitch,
      styleTab: props.styleTab,
      isSlider: true
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_SliderMain__WEBPACK_IMPORTED_MODULE_3__["default"], {
      data: props.data,
      indexes: props.indexes,
      property: "lineHeight",
      label: "Line Height",
      defaultSuffix: "px",
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta,
      defaultValue: "",
      onChangeStyle: onChangeStyle,
      styleState: styleState,
      deviceSwitch: props.deviceSwitch,
      styleTab: props.styleTab,
      isSlider: true
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_TextAlignMain__WEBPACK_IMPORTED_MODULE_5__["default"], {
      data: props.data,
      indexes: props.indexes,
      property: "textAlign",
      label: "Text Align",
      onChangeStyle: onChangeStyle,
      styleState: styleState,
      deviceSwitch: props.deviceSwitch,
      styleTab: props.styleTab,
      isMeta: type === 'module' && module?.key === 'search' && styleTab === 'input' ? 'input' : isMeta
    })]
  });
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TextMain);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/DesignTab.js"
/*!***************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/DesignTab.js ***!
  \***************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/CaretDownOutlined.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/collapse/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tabs/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _api_client__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../api/client */ "./src/api/client.js");
/* harmony import */ var _design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../design-components/common-component/SliderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js");
/* harmony import */ var _design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../design-components/common-component/SelectMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js");
/* harmony import */ var _design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../design-components/common-component/ColorMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js");
/* harmony import */ var _design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../design-components/common-component/AlignMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/AlignMain.js");
/* harmony import */ var _design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../design-components/common-component/BorderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BorderMain.js");
/* harmony import */ var _design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../design-components/common-component/BoxShadow */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BoxShadow.js");
/* harmony import */ var _design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../design-components/common-component/TextMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextMain.js");
/* harmony import */ var _images_flex_wrap_down_svg__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../../images/flex/wrap-down.svg */ "./src/MainComponents/images/flex/wrap-down.svg");
/* harmony import */ var _images_flex_wrap_up_svg__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../../images/flex/wrap-up.svg */ "./src/MainComponents/images/flex/wrap-up.svg");
/* harmony import */ var _images_flex_single_row_svg__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../images/flex/single-row.svg */ "./src/MainComponents/images/flex/single-row.svg");
/* harmony import */ var _images_flex_wrap_down2_svg__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../images/flex/wrap-down2.svg */ "./src/MainComponents/images/flex/wrap-down2.svg");
/* harmony import */ var _images_flex_wrap_right_svg__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../images/flex/wrap-right.svg */ "./src/MainComponents/images/flex/wrap-right.svg");
/* harmony import */ var _images_flex_wrap_left_svg__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../images/flex/wrap-left.svg */ "./src/MainComponents/images/flex/wrap-left.svg");
/* harmony import */ var _images_flex_single_column_svg__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../images/flex/single-column.svg */ "./src/MainComponents/images/flex/single-column.svg");
/* harmony import */ var _images_flex_wrap_right2_svg__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../images/flex/wrap-right2.svg */ "./src/MainComponents/images/flex/wrap-right2.svg");
/* harmony import */ var _images_flex_wrap_left2_svg__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../images/flex/wrap-left2.svg */ "./src/MainComponents/images/flex/wrap-left2.svg");
/* harmony import */ var _ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./ModuleContentData/filterSettingsSnapshot */ "./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/filterSettingsSnapshot.js");
/* harmony import */ var _filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./filterDesignTabDerivedState */ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabDerivedState.js");
/* harmony import */ var _utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../../../utils/collapseMainContentClass */ "./src/MainComponents/utils/collapseMainContentClass.js");
/* harmony import */ var _filterDesignTabContainerItems__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./filterDesignTabContainerItems */ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabContainerItems.js");
/* harmony import */ var _filterDesignTabHeaderItems__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./filterDesignTabHeaderItems */ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabHeaderItems.js");
/* harmony import */ var _filterDesignTabMetaItems__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./filterDesignTabMetaItems */ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabMetaItems.js");
/* harmony import */ var _filterDesignTabMeta1Items__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./filterDesignTabMeta1Items */ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabMeta1Items.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__);































const DesignTab = props => {
  //console.log(props);
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  // Deep-clone every commit: child style controls may forward layout after
  // shallow copies that still alias nested nodes under `props.data`.
  const onChangeStyle = style => {
    if (!Array.isArray(style)) return;
    props.onChangeStyle((0,_ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_22__.cloneFilterLayoutData)(style));
  };
  let settings = {};
  if (type === "module") {
    settings = {
      ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]["settings"]
    };
  }
  let device = props.selectedDevice;
  const [fontFamilyArray, setFontFamilyArray] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const [hoverSwitchText, setHoverSwitchText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [hoverSwitchSpacing, setHoverSwitchSpacing] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [hoverSwitchPosition, setHoverSwitchPosition] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [hoverSwitchBg, setHoverSwitchBg] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [hoverSwitchAl, setHoverSwitchAl] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [hoverSwitchBr, setHoverSwitchBr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [hoverSwitchBs, setHoverSwitchBs] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [deviceSwitch, setDeviceSwitch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(props.selectedDevice);
  const [styleTab, setStyleTab] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("container");
  const [selectedMetaDropdown, setSelectedMetaDropdown] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('meta1');
  const [rangeSliderSizingSub, setRangeSliderSizingSub] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('meta2');
  const [selectedMetaContainer, setSelectedMetaContainer] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('container');
  const [activeDesignCollapsePanelKey, setActiveDesignCollapsePanelKey] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [hoverValue, setHoverValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("Hover an option to see direction and wrap values.");
  const site_url = tc_caf_ajax.plugin_path;
  let url = site_url + "admin/google-fonts.json";
  const [isMarginVerticalJoint, setIsMarginVerticalJoint] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isMarginHorizontalJoint, setIsMarginHorizontalJoint] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isPaddingVerticalJoint, setIsPaddingVerticalJoint] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isPaddingHorizontalJoint, setIsPaddingHorizontalJoint] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const toggleMarginVerticalJoint = () => setIsMarginVerticalJoint(prev => !prev);
  const toggleMarginHorizontalJoint = () => setIsMarginHorizontalJoint(prev => !prev);
  const togglePaddingVerticalJoint = () => setIsPaddingVerticalJoint(prev => !prev);
  const togglePaddingHorizontalJoint = () => setIsPaddingHorizontalJoint(prev => !prev);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const fetchFonts = async () => {
      try {
        const response = await _api_client__WEBPACK_IMPORTED_MODULE_5__["default"].get(url);
        // console.log(response);
        if (response?.data?.items) {
          setFontFamilyArray(response.data.items);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };
    fetchFonts();
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setDeviceSwitch(props.selectedDevice);
    setHoverSwitchText(false);
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
  }, [props.selectedDevice]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setRangeSliderSizingSub('meta2');
  }, [rowindex, columnindex, moduleindex, module?.key]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setActiveDesignCollapsePanelKey(null);
  }, [styleTab, rowindex, columnindex, moduleindex, module?.key]);
  const handleDesignCollapseChange = key => {
    const nextKey = Array.isArray(key) ? key[0] : key;
    setActiveDesignCollapsePanelKey(nextKey ?? null);
  };
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (rangeSliderSizingSub === "meta3" && hoverSwitchBg === "active") {
      setHoverSwitchBg(false);
    }
  }, [rangeSliderSizingSub, hoverSwitchBg]);

  // useEffect(()=>{
  //   if(styleTab === "selectmeta"){
  //     setSelectedMetaDropdown("selectmeta")
  //   }else{
  //     setSelectedMetaDropdown(settings?.show_checkbox === 'true' ? 'meta1':  settings?.show_icon === 'true'? 'meta2' :   settings?.show_count === 'true' ? 'meta3' : null)
  //   }
  // },[styleTab])

  // useEffect(() => {
  //   if (filterLabel === "true") {
  //     setHeaderTab({
  //       key: "header",
  //       label: "Header",
  //     });
  //   } else {
  //     setHeaderTab("");
  //   }
  // }, [filterLabel]);

  let tab_items = [{
    key: "container",
    label: "Container"
  }, module.key === "search" && {
    key: "meta",
    label: "Search Field"
  },
  // {
  //   key: "container",
  //   label: "Title",
  // },
  // {
  //   key: "meta",
  //   label: "Filter Wrapper",
  // },
  module.key === "dropdown_filter" ? {
    key: "selectmeta",
    label: "Select Field"
  } : null, module.key !== "search" && {
    key: "meta1",
    label: module?.key === "dropdown_filter" ? "Options" : module?.key === "range_slider" ? "Slider" : "Single Item"
  }].filter(Boolean);
  // if (module.key === "search") {
  //   tab_items = [
  //     {
  //       key: "container",
  //       label: "Title",
  //     },
  //     {
  //       key: "input",
  //       label: "Input",
  //     },
  //     {
  //       key: "meta",
  //       label: "Icons",
  //     },
  //   ];
  // }
  if (module.key === "reset" || module.key === "customtext") {
    tab_items = [{
      key: "container",
      label: "Container"
    }];
  }
  const handleHover = value => {
    // console.log("Hovered:", value);
    setHoverValue(value);
  };
  const handleSettingChange = value => {
    // console.log(value);
    setSelectedMetaDropdown(value);
  };
  const handleSettingChangeContainer = value => {
    // console.log(value);
    setSelectedMetaContainer(value);
  };
  const onChangeTab = key => {
    // console.log(key);
    if (key === 'meta1') {
      if (module?.key === 'range_slider') {
        setSelectedMetaDropdown('meta1');
        setRangeSliderSizingSub('meta2');
      } else {
        if (settings?.show_checkbox === 'false' && settings?.show_icon === 'true') {
          setSelectedMetaDropdown('meta2');
        }
        if (settings?.show_checkbox === 'false' && settings?.show_icon === 'false' && settings?.show_count === 'true') {
          setSelectedMetaDropdown('meta3');
        }
      }
    } else {
      setSelectedMetaDropdown(key);
    }
    if (module?.key === 'range_slider') {
      setRangeSliderSizingSub('meta2');
    }
    setStyleTab(key);
    // setDeviceSwitch(false)
    setHoverSwitchText(false);
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
  };
  const onHoverSwitchText = value => {
    setHoverSwitchText(value);
  };
  const onHoverSwitchSpacing = value => {
    setHoverSwitchSpacing(value);
  };
  const onHoverSwitchPosition = value => {
    setHoverSwitchPosition(value);
  };
  const onHoverSwitchBg = value => {
    setHoverSwitchBg(value);
  };
  const onHoverSwitchAl = value => {
    setHoverSwitchAl(value);
  };
  const onHoverSwitchBr = value => {
    setHoverSwitchBr(value);
  };
  const onHoverSwitchBs = value => {
    setHoverSwitchBs(value);
  };
  const handleWrapChange = value => {
    let items = (0,_ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_22__.cloneFilterLayoutData)(props.data);
    const metaStyle = items[rowindex].data[columnindex].data[moduleindex].style.meta;
    if (!metaStyle[deviceSwitch]) {
      metaStyle[deviceSwitch] = {};
    }
    if (!metaStyle[deviceSwitch][styleStateAl]) {
      metaStyle[deviceSwitch][styleStateAl] = {};
    }
    metaStyle[deviceSwitch][styleStateAl].flexWrap = value;
    if (value === "nowrap") {
      metaStyle[deviceSwitch][styleStateAl].overflow = "auto";
    } else {
      metaStyle[deviceSwitch][styleStateAl].overflow = "inherit";
    }
    props.onChangeStyle(items);
  };
  const resetValue = () => {
    const items = (0,_ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_22__.cloneFilterLayoutData)(props.data);
    const wrapStyleKey = type === "module" && (module?.key === "checkbox_filter" || module?.key === "dropdown_filter") ? "meta" : styleTab;
    const moduleStyleTab = items?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.style?.[wrapStyleKey];
    if (type === "module" && moduleStyleTab) {
      if (!moduleStyleTab[deviceSwitch] || typeof moduleStyleTab[deviceSwitch] !== "object") {
        moduleStyleTab[deviceSwitch] = {};
      }
      if (!moduleStyleTab[deviceSwitch][styleStateAl] || typeof moduleStyleTab[deviceSwitch][styleStateAl] !== "object") {
        moduleStyleTab[deviceSwitch][styleStateAl] = {};
      }
      moduleStyleTab[deviceSwitch][styleStateAl] = {
        ...moduleStyleTab[deviceSwitch][styleStateAl],
        flexWrap: "wrap",
        overflow: "inherit"
      };
    }
    onChangeStyle(items);
  };

  // const onChangeDevice = (checked) => {
  //   setDeviceSwitch(checked)
  //   setHoverSwitchText(false)
  //   setHoverSwitchSpacing(false)
  //   setHoverSwitchPosition(false)
  //   setHoverSwitchBg(false)
  //   setHoverSwitchAl(false)
  //   setHoverSwitchBr(false)
  //   setHoverSwitchBs(false)
  // }

  const {
    styleStateSpacing,
    styleStatePosition,
    styleStateBg,
    styleStateAl,
    styleStateBr,
    styleStateBs,
    styleStateIcon
  } = (0,_filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_23__.resolveFilterDesignTabStyleStates)({
    hoverSwitchSpacing,
    hoverSwitchPosition,
    hoverSwitchBg,
    hoverSwitchAl,
    hoverSwitchBr,
    hoverSwitchBs,
    hoverSwitchText
  });
  const effectiveStyleTab = styleTab === "container" ? selectedMetaContainer : styleTab === "meta1" || styleTab === "selectmeta" ? selectedMetaDropdown : styleTab === "meta" && module?.key === "search" ? selectedMetaDropdown : styleTab;
  const flexFlow = (0,_filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_23__.resolveFlexFlowForFilterDesignTab)({
    data: props.data,
    type,
    rowindex,
    columnindex,
    moduleindex,
    device,
    styleStateAl,
    styleTab: effectiveStyleTab
  });
  const displayProperty = (0,_filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_23__.resolveDisplayPropertyForFilterDesignTab)({
    data: props.data,
    type,
    rowindex,
    columnindex,
    moduleindex,
    device,
    styleStateAl,
    styleTab: effectiveStyleTab
  });
  const {
    opt1,
    opt2
  } = (0,_filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_23__.buildFlexAlignOptions)(flexFlow);
  let fWrap = "";
  if (type === "module" && (module?.key === "checkbox_filter" || module?.key === "dropdown_filter")) {
    fWrap = props?.data[rowindex]?.data[columnindex]?.data[moduleindex].style?.meta?.[deviceSwitch]?.[styleStateAl]?.flexWrap;
  }
  //console.log(fWrap);
  // console.log(fontFamilyArray);
  let selectedTabsubItems = [
  // {
  //   key: "selectmeta",
  //   label: "Main",
  // },
  settings?.show_icon === 'true' ? {
    key: "meta4",
    label: "Icon + Text"
  } : null, settings?.show_icon === 'false' ? {
    key: "meta4",
    label: "Text"
  } : null].filter(Boolean);
  const searchMetaIconTabs = module?.key === "search" && styleTab === "meta" ? (() => {
    const iconSettings = [settings?.search_icon, settings?.voice_icon, settings?.clear_icon];
    const leftIconCount = iconSettings.filter(icon => icon?.is_enable === "true" && icon?.position === "left").length;
    const rightIconCount = iconSettings.filter(icon => icon?.is_enable === "true" && icon?.position === "right").length;
    return [{
      key: "input",
      label: "Input"
    }, leftIconCount >= 2 ? {
      key: "meta1",
      label: "Left Icons"
    } : null, rightIconCount >= 2 ? {
      key: "meta2",
      label: "Right Icons"
    } : null].filter(Boolean);
  })() : null;
  let meta1subItems = searchMetaIconTabs ?? [styleTab === "meta1" && module?.key === "dropdown_filter" ? {
    key: "mainmeta",
    label: "Items Container"
  } : null, settings?.show_checkbox === "true" ? {
    key: "meta1",
    label: "Checkbox + Content"
  } : null, settings?.show_icon === "true" ? {
    key: module?.key === "dropdown_filter" ? "meta1" : "meta2",
    label: "Icon + Text"
  } : null, settings?.show_count === "true" ? {
    key: "meta3",
    label: "Text + Count"
  } : null, module?.key === "checkbox_filter" && settings?.show_checkbox === "false" && settings?.show_icon === "false" && settings?.show_count === "false" ? {
    key: "meta3",
    label: "Text"
  } : null, module?.key === "dropdown_filter" && settings?.show_icon === "false" && settings?.show_count === "false" ? {
    key: "meta3",
    label: "Text"
  } : null].filter(Boolean);

  //console.log(selectedMetaContainer, selectedMetaDropdown);
  const ContainerItems = (0,_filterDesignTabContainerItems__WEBPACK_IMPORTED_MODULE_25__.buildFilterDesignTabContainerItems)({
    type,
    module,
    props,
    settings,
    selectedMetaContainer,
    activeCollapsePanelKey: activeDesignCollapsePanelKey,
    handleSettingChangeContainer,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty,
    fWrap,
    resetValue,
    handleWrapChange,
    onHoverSwitchText
  });
  const HeaderItems = (0,_filterDesignTabHeaderItems__WEBPACK_IMPORTED_MODULE_26__.buildFilterDesignTabHeaderItems)({
    type,
    module,
    props,
    settings,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty
  });
  const MetaItems = (0,_filterDesignTabMetaItems__WEBPACK_IMPORTED_MODULE_27__.buildFilterDesignTabMetaItems)({
    type,
    module,
    props,
    settings,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    fWrap,
    resetValue,
    handleWrapChange,
    displayProperty
  });

  //console.log(selectedMetaDropdown);
  const Meta1Items = (0,_filterDesignTabMeta1Items__WEBPACK_IMPORTED_MODULE_28__.buildFilterDesignTabMeta1Items)({
    type,
    module,
    props,
    settings,
    styleTab,
    onChangeStyle,
    deviceSwitch,
    device,
    selectedMetaDropdown,
    activeCollapsePanelKey: activeDesignCollapsePanelKey,
    handleSettingChange,
    rangeSliderSizingSub,
    onRangeSliderSizingSubChange: setRangeSliderSizingSub,
    selectedTabsubItems,
    meta1subItems,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    styleStateIcon,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchText,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
    children: [type === "module" && module.key !== "reset" && module.key !== "customtext" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"], {
      defaultActiveKey: "container",
      items: tab_items,
      onChange: onChangeTab,
      className: "caf-design-tabs"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "row-design-tab-data",
        children: type === "module" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
          children: [styleTab === "container" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
            //defaultActiveKey={['1']}
            , {
              accordion: true,
              onChange: handleDesignCollapseChange,
              expandIconPlacement: "end",
              expandIcon: ({
                isActive
              }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
                rotate: isActive ? 180 : 0
              }),
              items: (() => {
                if (settings?.label?.is_label === "true") {
                  return ContainerItems;
                } else if (module?.key === "reset" || module?.key === "customtext") {
                  return ContainerItems;
                } else {
                  return ContainerItems.filter(item => item.key !== "1");
                }
              })()
            })
          }), styleTab === "header" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
            //defaultActiveKey={['1']}
            , {
              accordion: true,
              onChange: handleDesignCollapseChange,
              expandIconPlacement: "end",
              expandIcon: ({
                isActive
              }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
                rotate: isActive ? 180 : 0
              }),
              items: HeaderItems
            })
          }), styleTab === "input" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
            //defaultActiveKey={['1']}
            , {
              accordion: true,
              onChange: handleDesignCollapseChange,
              expandIconPlacement: "end",
              expandIcon: ({
                isActive
              }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
                rotate: isActive ? 180 : 0
              }),
              items: HeaderItems
            })
          }), styleTab === "meta" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
            //defaultActiveKey={['1']}
            , {
              accordion: true,
              onChange: handleDesignCollapseChange,
              expandIconPlacement: "end",
              expandIcon: ({
                isActive
              }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
                rotate: isActive ? 180 : 0
              })
              // items={MetaItems}
              ,
              items: (() => {
                if (module?.key === "dropdown_filter") {
                  return MetaItems.filter(item => item.key !== "0");
                } else {
                  if (module?.key === "search") {
                    return Meta1Items;
                  } else {
                    return MetaItems;
                  }
                }
              })()
            })
          }), styleTab === "selectmeta" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
            //defaultActiveKey={['1']}
            , {
              accordion: true,
              onChange: handleDesignCollapseChange,
              expandIconPlacement: "end",
              expandIcon: ({
                isActive
              }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
                rotate: isActive ? 180 : 0
              }),
              items: Meta1Items
            })
          }), styleTab === "meta1" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
            //defaultActiveKey={['1']}
            , {
              accordion: true,
              onChange: handleDesignCollapseChange,
              expandIconPlacement: "end",
              expandIcon: ({
                isActive
              }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
                rotate: isActive ? 180 : 0
              }),
              items: Meta1Items
            })
          })]
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
          children: props.widgets === "1" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
          //defaultActiveKey={['1']}
          , {
            accordion: true,
            onChange: handleDesignCollapseChange,
            expandIconPlacement: "end",
            expandIcon: ({
              isActive
            }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
              rotate: isActive ? 180 : 0
            }),
            items: [{
              key: "1",
              label: "Sizing",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
                className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("sizing"),
                children: [type === "column" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_6__["default"], {
                    data: props.data,
                    indexes: props.indexes,
                    property: "width",
                    label: "Width",
                    defaultSuffix: "%",
                    defaultValue: "100",
                    onChangeStyle: onChangeStyle,
                    deviceSwitch: deviceSwitch,
                    isSlider: true
                  }), "` "]
                }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_6__["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  property: "width",
                  label: "Width",
                  defaultSuffix: "%",
                  defaultValue: "100",
                  onChangeStyle: onChangeStyle,
                  deviceSwitch: deviceSwitch,
                  styleTab: styleTab,
                  isSlider: true
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_6__["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  property: "height",
                  label: "Height",
                  defaultSuffix: "%",
                  defaultValue: "100",
                  onChangeStyle: onChangeStyle,
                  deviceSwitch: deviceSwitch,
                  styleTab: styleTab,
                  isSlider: true
                })]
              })
            }, {
              key: "2",
              label: "Alignment",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
                className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("alignment"),
                children: [type === "row" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  property: "float",
                  label: "Float",
                  defaultValue: "none",
                  onChangeStyle: onChangeStyle,
                  styleState: styleStateAl
                  //  styleState={false}
                  ,
                  deviceSwitch: deviceSwitch,
                  styleTab: styleTab,
                  options: [{
                    value: "none",
                    label: "none"
                  }, {
                    value: "left",
                    label: "left"
                  }, {
                    value: "right",
                    label: "right"
                  }]
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  property: "justifyContent",
                  label: "justify Content",
                  defaultValue: "flex-start",
                  onChangeStyle: onChangeStyle,
                  styleState: styleStateAl
                  // styleState={false}
                  ,
                  deviceSwitch: deviceSwitch,
                  styleTab: styleTab,
                  options: [{
                    value: "flex-start",
                    label: "flex-start"
                  }, {
                    value: "flex-end",
                    label: "flex-end"
                  }, {
                    value: "center",
                    label: "center"
                  }, {
                    value: "space-between",
                    label: "space-between"
                  }, {
                    value: "space-around",
                    label: "space-around"
                  }, {
                    value: "space-evenly",
                    label: "space-evenly"
                  }]
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  property: "alignItems",
                  label: "Align Items",
                  defaultValue: "flex-start",
                  onChangeStyle: onChangeStyle,
                  styleState: styleStateAl
                  // styleState={false}
                  ,
                  deviceSwitch: deviceSwitch,
                  styleTab: styleTab,
                  options: [{
                    value: "flex-start",
                    label: "flex-start"
                  }, {
                    value: "flex-end",
                    label: "flex-end"
                  }, {
                    value: "center",
                    label: "center"
                  }, {
                    value: "stretch",
                    label: "stretch"
                  }, {
                    value: "baseline",
                    label: "baseline"
                  }]
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  property: "flexDirection",
                  label: "Flex Direction",
                  defaultValue: "row",
                  onChangeStyle: onChangeStyle,
                  styleState: styleStateAl
                  // styleState={false}
                  ,
                  deviceSwitch: deviceSwitch,
                  styleTab: styleTab,
                  options: [{
                    value: "row",
                    label: "row"
                  }, {
                    value: "column",
                    label: "column"
                  }]
                })]
              })
            }]
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"]
          //defaultActiveKey={['1']}
          , {
            accordion: true,
            onChange: handleDesignCollapseChange,
            expandIconPlacement: "end",
            expandIcon: ({
              isActive
            }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {
              rotate: isActive ? 180 : 0
            }),
            items: (() => {
              if (type !== "module") {
                return ContainerItems.filter(item => item.key !== "4" && item.key !== "1");
              }
            })()
          })
        })
      })
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DesignTab);

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/FilterDesignTabInnerTabs.js"
/*!******************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/FilterDesignTabInnerTabs.js ***!
  \******************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FilterDesignTabInnerTabs: () => (/* binding */ FilterDesignTabInnerTabs)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tabs/index.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);



/**
 * Design-tab sub-tabs inside a Collapse panel. When the parent panel opens,
 * selects the first available tab if the current activeKey is not in items.
 */

function FilterDesignTabInnerTabs({
  isCollapseOpen = false,
  activeKey,
  onChange,
  items,
  ...rest
}) {
  const filteredItems = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => Array.isArray(items) ? items.filter(Boolean) : [], [items]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!isCollapseOpen || typeof onChange !== "function") {
      return;
    }
    const keys = filteredItems.map(item => item.key);
    if (!keys.length) {
      return;
    }
    if (!keys.includes(activeKey)) {
      onChange(keys[0]);
    }
  }, [isCollapseOpen, filteredItems, activeKey, onChange]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
    ...rest,
    activeKey: activeKey,
    onChange: onChange,
    items: filteredItems
  });
}

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabContainerItems.js"
/*!***********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabContainerItems.js ***!
  \***********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildFilterDesignTabContainerItems: () => (/* binding */ buildFilterDesignTabContainerItems)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowDownOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowLeftOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowRightOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowUpOutlined.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/segmented/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/switch/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./FilterDesignTabInnerTabs */ "./src/MainComponents/FilterComponents/components/settingTabContent/FilterDesignTabInnerTabs.js");
/* harmony import */ var _design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../design-components/common-component/SliderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js");
/* harmony import */ var _design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../design-components/common-component/SelectMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js");
/* harmony import */ var _design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../design-components/common-component/ColorMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js");
/* harmony import */ var _design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../design-components/common-component/AlignMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/AlignMain.js");
/* harmony import */ var _design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../design-components/common-component/BorderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BorderMain.js");
/* harmony import */ var _design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../design-components/common-component/BoxShadow */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BoxShadow.js");
/* harmony import */ var _design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../design-components/common-component/TextMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextMain.js");
/* harmony import */ var _images_flex_wrap_down_svg__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../images/flex/wrap-down.svg */ "./src/MainComponents/images/flex/wrap-down.svg");
/* harmony import */ var _images_flex_wrap_up_svg__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../images/flex/wrap-up.svg */ "./src/MainComponents/images/flex/wrap-up.svg");
/* harmony import */ var _images_flex_single_row_svg__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../images/flex/single-row.svg */ "./src/MainComponents/images/flex/single-row.svg");
/* harmony import */ var _images_flex_wrap_down2_svg__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../images/flex/wrap-down2.svg */ "./src/MainComponents/images/flex/wrap-down2.svg");
/* harmony import */ var _images_flex_wrap_right_svg__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../images/flex/wrap-right.svg */ "./src/MainComponents/images/flex/wrap-right.svg");
/* harmony import */ var _images_flex_wrap_left_svg__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../../images/flex/wrap-left.svg */ "./src/MainComponents/images/flex/wrap-left.svg");
/* harmony import */ var _images_flex_single_column_svg__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../../images/flex/single-column.svg */ "./src/MainComponents/images/flex/single-column.svg");
/* harmony import */ var _images_flex_wrap_right2_svg__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../../../images/flex/wrap-right2.svg */ "./src/MainComponents/images/flex/wrap-right2.svg");
/* harmony import */ var _images_flex_wrap_left2_svg__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../../../images/flex/wrap-left2.svg */ "./src/MainComponents/images/flex/wrap-left2.svg");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var _utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../../../utils/collapseMainContentClass */ "./src/MainComponents/utils/collapseMainContentClass.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__);

























function buildFilterDesignTabContainerItems(ctx) {
  const {
    type,
    module,
    props,
    settings,
    selectedMetaContainer,
    activeCollapsePanelKey,
    handleSettingChangeContainer,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty,
    fWrap,
    resetValue,
    handleWrapChange,
    onHoverSwitchText
  } = ctx;
  if (!props?.data || !props?.indexes) {
    return [];
  }
  const isCollapsePanelOpen = panelKey => activeCollapsePanelKey === panelKey;
  return [
  //0:Layout
  {
    key: "0",
    label: "Layout",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: [type === 'module' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: module.key !== 'reset' && module.key !== 'customtext' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("0"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: "Outer Wrapper"
          }, settings?.label?.is_label === "true" ? {
            key: "header",
            label: "Label"
          } : null, module.key !== 'dropdown_filter' && module.key !== 'search' && {
            key: "meta",
            label: module.key === "range_slider" ? "Slider Wrapper" : "Items Container"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("layout", "webflow-sync"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "display",
            label: "Display",
            defaultValue: "flex",
            onChangeStyle: onChangeStyle,
            styleState: styleStateAl,
            styleTab: styleTab
            //  styleState={false}
            ,
            deviceSwitch: deviceSwitch,
            options: [{
              value: 'block',
              label: 'Block'
            }, {
              value: 'flex',
              label: 'Flex'
            }],
            isNewTab: true,
            isMeta: selectedMetaContainer
          }), displayProperty === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: "webflow-custom-dropdown new-caf-look",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "flexFlow",
              label: "Direction",
              defaultValue: "row",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl,
              deviceSwitch: deviceSwitch,
              styleTab: styleTab,
              options: [{
                value: 'row',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
                  title: "Horizontal",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_3__["default"], {})
                })
              }, {
                value: 'column',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
                  title: "Vertical",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {})
                })
              }, {
                value: 'row-reverse',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
                  title: "Row Reverse",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_2__["default"], {})
                })
              }, {
                value: 'column-reverse',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
                  title: "Column Reverse",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_4__["default"], {})
                })
              }],
              isMeta: selectedMetaContainer
            })
          })]
        }), displayProperty === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
            className: "align-flex-flow",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
              className: "flex-flow-align-label",
              children: "Align"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
              className: `flex-align-control ${flexFlow === 'column wrap' || flexFlow === 'column wrap-reverse' ? 'caf-reverse-me1' : ''}`,
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: `${flexFlow === 'column' || flexFlow === 'column-reverse' ? 'alignItems' : "justifyContent"}`,
                label: 'X',
                defaultValue: "flex-start",
                onChangeStyle: onChangeStyle,
                styleState: styleStateAl,
                deviceSwitch: deviceSwitch,
                class: 'align-x-flex',
                options: opt1,
                styleTab: styleTab,
                isMeta: selectedMetaContainer
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: `${flexFlow === 'column' || flexFlow === 'column-reverse' ? 'justifyContent' : "alignItems"}`,
                label: 'Y',
                defaultValue: "flex-start",
                onChangeStyle: onChangeStyle,
                styleState: styleStateAl
                // styleState={false}
                ,
                deviceSwitch: deviceSwitch,
                class: 'align-y-flex',
                options: opt2,
                styleTab: styleTab,
                isMeta: selectedMetaContainer
              })]
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: "webflow-slider webflow-gap-slider",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "gap",
              label: "Gap",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl,
              deviceSwitch: deviceSwitch,
              styleTab: styleTab,
              isSlider: true,
              isMeta: selectedMetaContainer
            })
          }), module?.key === "checkbox_filter" && selectedMetaContainer === "meta" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: "webflow-slider webflow-gap-slider",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
              className: "caf-builder-setting-row-label caf-builder-wrap-row",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("label", {
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
                  classNames: {
                    root: "caf-builder-tooltip"
                  },
                  placement: "topLeft",
                  title: "Toggle flex wrap for items.",
                  children: "Wrap"
                }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
                  classNames: {
                    root: "caf-builder-tooltip"
                  },
                  placement: "topLeft",
                  title: "Reset",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
                    onClick: resetValue,
                    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_26__.FontAwesomeIcon, {
                      icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_27__.faArrowRotateLeft
                    })
                  })
                })]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                className: "caf-builder-design-switch",
                checked: (fWrap || "wrap") === "wrap",
                onChange: checked => {
                  handleWrapChange(checked ? "wrap" : "nowrap");
                }
              })]
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "float",
          label: "Float",
          defaultValue: "none",
          onChangeStyle: onChangeStyle,
          styleState: styleStateAl,
          styleTab: styleTab
          //  styleState={false}
          ,
          deviceSwitch: deviceSwitch,
          options: [{
            value: 'none',
            label: 'None'
          }, {
            value: 'left',
            label: 'Left'
          }, {
            value: 'right',
            label: 'Right'
          }],
          isNewTab: true,
          isMeta: selectedMetaContainer
        })]
      })]
    })
  }, {
    key: "1",
    label: "Text",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
        children: [type === 'module' && module.key !== 'reset' && module.key !== 'customtext' && settings?.label?.is_label === "true" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "caf-builder-setting-row-label meta-dropdown-dyn",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs
          // activeKey={'header'}
          , {
            isCollapseOpen: isCollapsePanelOpen("1"),
            activeKey: selectedMetaContainer,
            onChange: value => handleSettingChangeContainer(value),
            items: [{
              key: "header",
              label: "Label"
            }].filter(Boolean)
            //defaultActiveKey={'header'}
          })
        }), type === 'module' && (module.key === 'reset' || module.key === 'customtext') && settings?.icons?.visibility && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "caf-builder-setting-row-label meta-dropdown-dyn",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
            isCollapseOpen: isCollapsePanelOpen("1"),
            activeKey: selectedMetaContainer,
            onChange: value => handleSettingChangeContainer(value),
            items: [{
              key: "container",
              label: module.key === "customtext" ? "Text" : "Button"
            }, {
              key: "icon",
              label: "Icon"
            }].filter(Boolean),
            defaultActiveKey: 'container'
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
          className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("text"),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: "hoverswitchguard",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
              value: hoverSwitchText,
              style: {
                marginBottom: 8
              },
              onChange: onHoverSwitchText,
              className: 'hoverTabCaf',
              options: [{
                label: 'Default',
                value: false
              }, {
                label: 'Hover',
                value: true
              }]
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_16__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "text",
            label: "Text",
            onChangeStyle: onChangeStyle,
            fonts: fontFamilyArray,
            hoverSwitch: hoverSwitchText,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            isMeta: selectedMetaContainer === 'header' ? 'header' : selectedMetaContainer
          })]
        })]
      })
    })
  }, {
    key: "2",
    label: "Sizing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: [type === 'module' && module.key !== 'reset' && module.key !== 'customtext' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("2"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: "Outer Wrapper"
          }, settings?.label?.is_label === "true" ? {
            key: "header",
            label: "Label"
          } : null, {
            key: "meta",
            label: module.key === "search" ? "Field Container" : module.key === "range_slider" ? "Slider Wrapper" : "Items Container"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), type === 'module' && (module.key === 'reset' || module.key === 'customtext') && settings?.icons?.visibility && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("2"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: module.key === "customtext" ? "Text" : "Button"
          }, {
            key: "icon",
            label: "Icon"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("sizing"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: 'width',
          label: "Width",
          defaultSuffix: "%",
          defaultValue: "100",
          onChangeStyle: onChangeStyle,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isSlider: true,
          isMeta: selectedMetaContainer
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "height",
          label: "Height",
          defaultSuffix: "%",
          defaultValue: "100",
          onChangeStyle: onChangeStyle,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isSlider: true,
          isMeta: selectedMetaContainer
        })]
      })]
    })
  }, {
    key: "3",
    label: "Spacing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: [type === 'module' && module.key !== 'reset' && module.key !== 'customtext' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("3"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: "Outer Wrapper"
          }, settings?.label?.is_label === "true" ? {
            key: "header",
            label: "Label"
          } : null, {
            key: "meta",
            label: module.key === "search" ? "Field Container" : module.key === "range_slider" ? "Slider Wrapper" : "Items Container"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), type === 'module' && (module.key === 'reset' || module.key === 'customtext') && settings?.icons?.visibility && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("3"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: module.key === "customtext" ? "Text" : "Button"
          }, {
            key: "icon",
            label: "Icon"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("spacing"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchSpacing,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchSpacing,
            className: 'hoverTabCaf',
            options: [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
          className: "label-span-spacing",
          children: "Margin"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
          className: "caf-spacing-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginTop",
              label: "Top",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginVerticalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginBottom",
              label: "Bottom",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginVerticalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
              className: `spacing-joint ${isMarginVerticalJoint ? "active" : ""}`,
              onClick: toggleMarginVerticalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginLeft",
              label: "Left",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginHorizontalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginRight",
              label: "Right",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginHorizontalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
              className: `spacing-joint ${isMarginHorizontalJoint ? "active" : ""}`,
              onClick: toggleMarginHorizontalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
          className: "label-span-spacing",
          children: "Padding"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
          className: "caf-spacing-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            className: "without-border",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingTop",
              label: "Top",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingVerticalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingBottom",
              label: "Bottom",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingVerticalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
              className: `spacing-joint ${isPaddingVerticalJoint ? "active" : ""}`,
              onClick: togglePaddingVerticalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingLeft",
              label: "Left",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingHorizontalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingRight",
              label: "Right",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingHorizontalJoint,
              styleTab: styleTab,
              isMeta: selectedMetaContainer
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
              className: `spacing-joint ${isPaddingHorizontalJoint ? "active" : ""}`,
              onClick: togglePaddingHorizontalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          })]
        })]
      })]
    })
  },
  // {
  //   key: "4",
  //   label: "Positioning",
  //   children: (
  //     <div className="collapse-main-content">
  //       <div className="hoverswitchguard">
  //         <Switch
  //           checkedChildren="Hover"
  //           unCheckedChildren="Default"
  //           onChange={onHoverSwitchPosition}
  //           checked={hoverSwitchPosition}
  //           className="hoverSwitch"
  //         />
  //       </div>
  //       <SelectMain
  //         data={props.data}
  //         indexes={props.indexes}
  //         onChangeStyle={onChangeStyle}
  //         property="position"
  //         defaultValue="relative"
  //         label="Position"
  //         styleState={styleStatePosition}
  //         isMeta={'header'}
  //         options={[
  //           {
  //             value: "relative",
  //             label: "Relative",
  //           },
  //           {
  //             value: "absolute",
  //             label: "Absolute",
  //           },
  //           {
  //             value: "inherit",
  //             label: "Inherit",
  //           },
  //         ]}
  //         deviceSwitch={deviceSwitch}
  //         styleTab={styleTab}
  //       ></SelectMain>
  //       <InputMain
  //         data={props.data}
  //         indexes={props.indexes}
  //         onChangeStyle={onChangeStyle}
  //         property="zIndex"
  //         defaultValue="999"
  //         label="Z Index"
  //         styleState={styleStatePosition}
  //         deviceSwitch={deviceSwitch}
  //         styleTab={styleTab}
  //         isMeta={'header'}
  //       />
  //       <Row>
  //         <Col span={12}>
  //           <SliderMain
  //             data={props.data}
  //             indexes={props.indexes}
  //             property="top"
  //             label="Top"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             styleState={styleStatePosition}
  //             onChangeStyle={onChangeStyle}
  //             extraClass="colm2"
  //             deviceSwitch={deviceSwitch}
  //             styleTab={styleTab}
  //             isMeta={'header'}
  //           ></SliderMain>
  //         </Col>
  //         <Col span={12}>
  //           <SliderMain
  //             data={props.data}
  //             indexes={props.indexes}
  //             property="right"
  //             label="Right"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             styleState={styleStatePosition}
  //             onChangeStyle={onChangeStyle}
  //             extraClass="colm2"
  //             deviceSwitch={deviceSwitch}
  //             styleTab={styleTab}
  //             isMeta={'header'}
  //           ></SliderMain>
  //         </Col>
  //       </Row>
  //       <Row>
  //         <Col span={12}>
  //           <SliderMain
  //             data={props.data}
  //             indexes={props.indexes}
  //             property="bottom"
  //             label="Bottom"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             styleState={styleStatePosition}
  //             onChangeStyle={onChangeStyle}
  //             extraClass="colm2"
  //             deviceSwitch={deviceSwitch}
  //             styleTab={styleTab}
  //             isMeta={'header'}
  //           ></SliderMain>
  //         </Col>
  //         <Col span={12}>
  //           <SliderMain
  //             data={props.data}
  //             indexes={props.indexes}
  //             property="left"
  //             label="Left"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             styleState={styleStatePosition}
  //             onChangeStyle={onChangeStyle}
  //             extraClass="colm2"
  //             deviceSwitch={deviceSwitch}
  //             styleTab={styleTab}
  //             isMeta={'header'}
  //           ></SliderMain>
  //         </Col>
  //       </Row>
  //     </div>
  //   ),
  // },

  {
    key: "5",
    label: "Background",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: [type === 'module' && module.key !== 'reset' && module.key !== 'customtext' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("5"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: "Outer Wrapper"
          }, settings?.label?.is_label === "true" ? {
            key: "header",
            label: "Label"
          } : null, {
            key: "meta",
            label: module.key === "search" ? "Field Container" : module.key === "range_slider" ? "Slider Wrapper" : "Items Container"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), type === 'module' && (module.key === 'reset' || module.key === 'customtext') && settings?.icons?.visibility && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("5"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: module.key === "customtext" ? "Text" : "Button"
          }, {
            key: "icon",
            label: "Icon"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("background"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchBg,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchBg,
            className: 'hoverTabCaf',
            options: [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_12__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "backgroundColor",
          defaultValue: type === "column" ? "#00000000" : "#333333",
          label: "Background Color",
          onChangeStyle: onChangeStyle,
          styleState: styleStateBg,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isMeta: selectedMetaContainer
        })]
      })]
    })
  }, {
    key: "6",
    label: "Border",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: [type === 'module' && module.key !== 'reset' && module.key !== 'customtext' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("6"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: "Outer Wrapper"
          }, settings?.label?.is_label === "true" ? {
            key: "header",
            label: "Label"
          } : null, {
            key: "meta",
            label: module.key === "search" ? "Field Container" : module.key === "range_slider" ? "Slider Wrapper" : "Items Container"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), type === 'module' && (module.key === 'reset' || module.key === 'customtext') && settings?.icons?.visibility && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("6"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: module.key === "customtext" ? "Text" : "Button"
          }, {
            key: "icon",
            label: "Icon"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("border"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchBr,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchBr,
            className: 'hoverTabCaf',
            options: [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_14__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "border",
          label: "Border",
          onChangeStyle: onChangeStyle,
          styleState: styleStateBr,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isMeta: selectedMetaContainer
        })]
      })]
    })
  }, {
    key: "7",
    label: "Box Shadow",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
      children: [type === 'module' && module.key !== 'reset' && module.key !== 'customtext' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("7"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: "Outer Wrapper"
          }, settings?.label?.is_label === "true" ? {
            key: "header",
            label: "Label"
          } : null, {
            key: "meta",
            label: module.key === "search" ? "Field Container" : module.key === "range_slider" ? "Slider Wrapper" : "Items Container"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), type === 'module' && (module.key === 'reset' || module.key === 'customtext') && settings?.icons?.visibility && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_9__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("7"),
          activeKey: selectedMetaContainer,
          onChange: value => handleSettingChangeContainer(value),
          items: [{
            key: "container",
            label: module.key === "customtext" ? "Text" : "Button"
          }, {
            key: "icon",
            label: "Icon"
          }].filter(Boolean),
          defaultActiveKey: 'container'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("box-shadow"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchBs,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchBs,
            className: 'hoverTabCaf',
            options: [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_15__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "boxShadow",
          label: "Box Shadow",
          onChangeStyle: onChangeStyle,
          styleState: styleStateBs,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isMeta: selectedMetaContainer
        })]
      })]
    })
  }];
}

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabDerivedState.js"
/*!*********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabDerivedState.js ***!
  \*********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildFlexAlignOptions: () => (/* reexport safe */ _shared_designTabFlexAlignOptions__WEBPACK_IMPORTED_MODULE_0__.buildFlexAlignOptions),
/* harmony export */   resolveDisplayPropertyForFilterDesignTab: () => (/* binding */ resolveDisplayPropertyForFilterDesignTab),
/* harmony export */   resolveFilterDesignTabStyleStates: () => (/* binding */ resolveFilterDesignTabStyleStates),
/* harmony export */   resolveFlexFlowForFilterDesignTab: () => (/* binding */ resolveFlexFlowForFilterDesignTab)
/* harmony export */ });
/* harmony import */ var _shared_designTabFlexAlignOptions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../shared/designTabFlexAlignOptions */ "./src/MainComponents/shared/designTabFlexAlignOptions.js");
/**
 * Pure helpers for Filter DesignTab (layout-derived UI state).
 * Extracted from DesignTab.js without logic changes — easier to test and split further later.
 */

function resolveFilterDesignTabStyleStates({
  hoverSwitchSpacing,
  hoverSwitchPosition,
  hoverSwitchBg,
  hoverSwitchAl,
  hoverSwitchBr,
  hoverSwitchBs,
  hoverSwitchText
}) {
  let styleStateSpacing = "default";
  if (hoverSwitchSpacing === true) {
    styleStateSpacing = "hover";
  } else if (hoverSwitchSpacing === "selected") {
    styleStateSpacing = "selected";
  }
  let styleStatePosition = "default";
  if (hoverSwitchPosition === true) {
    styleStatePosition = "hover";
  } else if (hoverSwitchPosition === "selected") {
    styleStatePosition = "selected";
  }
  let styleStateBg = "default";
  if (hoverSwitchBg === true) {
    styleStateBg = "hover";
  } else if (hoverSwitchBg === "active") {
    styleStateBg = "active";
  } else if (hoverSwitchBg === "selected") {
    styleStateBg = "selected";
  }
  let styleStateAl = "default";
  if (hoverSwitchAl === true) {
    styleStateAl = "hover";
  } else if (hoverSwitchAl === "selected") {
    styleStateAl = "selected";
  }
  let styleStateBr = "default";
  if (hoverSwitchBr === true) {
    styleStateBr = "hover";
  } else if (hoverSwitchBr === "selected") {
    styleStateBr = "selected";
  }
  let styleStateBs = "default";
  if (hoverSwitchBs === true) {
    styleStateBs = "hover";
  } else if (hoverSwitchBs === "selected") {
    styleStateBs = "selected";
  }
  let styleStateIcon = "default";
  if (hoverSwitchText === true) {
    styleStateIcon = "hover";
  } else if (hoverSwitchText === "selected") {
    styleStateIcon = "selected";
  } else if (hoverSwitchText === "placeholder") {
    styleStateIcon = "placeholder";
  } else {
    styleStateIcon = "default";
  }
  return {
    styleStateSpacing,
    styleStatePosition,
    styleStateBg,
    styleStateAl,
    styleStateBr,
    styleStateBs,
    styleStateIcon
  };
}
function resolveFlexFlowForFilterDesignTab({
  data,
  type,
  rowindex,
  columnindex,
  moduleindex,
  device,
  styleStateAl,
  styleTab
}) {
  let flexFlow = "";
  if (type === "row") {
    let RowStyle = data[rowindex].style;
    if (RowStyle[device][styleStateAl]?.["flexFlow"]) {
      flexFlow = RowStyle[device][styleStateAl]["flexFlow"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "default") {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          }
        }
        if (styleStateAl === "hover") {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = RowStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (RowStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = RowStyle[device]["default"]["flexFlow"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = RowStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (RowStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = RowStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
    }
  }
  if (type === "column") {
    let ColStyle = data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleStateAl]?.["flexFlow"]) {
      flexFlow = ColStyle[device][styleStateAl]["flexFlow"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "hover") {
          if (ColStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle[device]["default"]["flexFlow"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (ColStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle[device]["default"]["flexFlow"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = ColStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
          }
        } else {
          if (ColStyle[device]["default"]?.["flexFlow"]) {
            flexFlow = ColStyle[device]["default"]["flexFlow"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["flexFlow"]) {
              flexFlow = ColStyle["desktop"]["hover"]["flexFlow"];
            } else {
              if (ColStyle["desktop"]["default"]?.["flexFlow"]) {
                flexFlow = ColStyle["desktop"]["default"]["flexFlow"];
              }
            }
          }
        }
      }
    }
  }
  if (type === "module") {
    let ModuleStyle = data[rowindex].data[columnindex].data[moduleindex].style;
    if (styleTab !== "container") {
      if (ModuleStyle[styleTab][device][styleStateAl]?.["flexFlow"]) {
        flexFlow = ModuleStyle[styleTab][device][styleStateAl]["flexFlow"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow = ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
                  flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow = ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
                  flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[styleTab][device][styleStateAl]?.["flexFlow"]) {
        flexFlow = ModuleStyle[styleTab][device][styleStateAl]["flexFlow"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow = ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
                  flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["flexFlow"]) {
              flexFlow = ModuleStyle[styleTab][device]["default"]["flexFlow"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["flexFlow"]) {
                flexFlow = ModuleStyle[styleTab]["desktop"]["hover"]["flexFlow"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["flexFlow"]) {
                  flexFlow = ModuleStyle[styleTab]["desktop"]["default"]["flexFlow"];
                }
              }
            }
          }
        }
      }
    }
  }
  return flexFlow;
}
function resolveDisplayPropertyForFilterDesignTab({
  data,
  type,
  rowindex,
  columnindex,
  moduleindex,
  device,
  styleStateAl,
  styleTab
}) {
  let display = "";
  if (type === "row") {
    let RowStyle = data[rowindex].style;
    if (RowStyle[device][styleStateAl]?.["display"]) {
      display = RowStyle[device][styleStateAl]["display"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "default") {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          }
        }
        if (styleStateAl === "hover") {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["display"]) {
            display = RowStyle["desktop"]["default"]["display"];
          }
        } else {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["display"]) {
              display = RowStyle["desktop"]["hover"]["display"];
            } else {
              if (RowStyle["desktop"]["default"]?.["display"]) {
                display = RowStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (RowStyle["desktop"]["default"]?.["display"]) {
            display = RowStyle["desktop"]["default"]["display"];
          }
        } else {
          if (RowStyle[device]["default"]?.["display"]) {
            display = RowStyle[device]["default"]["display"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["display"]) {
              display = RowStyle["desktop"]["hover"]["display"];
            } else {
              if (RowStyle["desktop"]["default"]?.["display"]) {
                display = RowStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
    }
  }
  if (type === "column") {
    let ColStyle = data[rowindex].data[columnindex].style;
    if (ColStyle[device][styleStateAl]?.["display"]) {
      display = ColStyle[device][styleStateAl]["display"];
    } else {
      if (device === "desktop") {
        if (styleStateAl === "hover") {
          if (ColStyle[device]["default"]?.["display"]) {
            display = ColStyle[device]["default"]["display"];
          }
        }
      }
      if (device === "tablet") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["display"]) {
            display = ColStyle["desktop"]["default"]["display"];
          }
        } else {
          if (ColStyle[device]["default"]?.["display"]) {
            display = ColStyle[device]["default"]["display"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["display"]) {
              display = ColStyle["desktop"]["hover"]["display"];
            } else {
              if (ColStyle["desktop"]["default"]?.["display"]) {
                display = ColStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
      if (device === "mobile") {
        if (styleStateAl === "default") {
          if (ColStyle["desktop"]["default"]?.["display"]) {
            display = ColStyle["desktop"]["default"]["display"];
          }
        } else {
          if (ColStyle[device]["default"]?.["display"]) {
            display = ColStyle[device]["default"]["display"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["display"]) {
              display = ColStyle["desktop"]["hover"]["display"];
            } else {
              if (ColStyle["desktop"]["default"]?.["display"]) {
                display = ColStyle["desktop"]["default"]["display"];
              }
            }
          }
        }
      }
    }
  }
  if (type === "module") {
    let ModuleStyle = data[rowindex].data[columnindex].data[moduleindex].style;
    if (styleTab !== "container") {
      if (ModuleStyle[styleTab][device][styleStateAl]?.["display"]) {
        display = ModuleStyle[styleTab][device][styleStateAl]["display"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display = ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
                  display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display = ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
                  display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
      }
    } else {
      if (ModuleStyle[styleTab][device][styleStateAl]?.["display"]) {
        display = ModuleStyle[styleTab][device][styleStateAl]["display"];
      } else {
        if (device === "desktop") {
          if (styleStateAl === "hover") {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            }
          }
        }
        if (device === "tablet") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display = ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
                  display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
        if (device === "mobile") {
          if (styleStateAl === "default") {
            if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
              display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
            }
          } else {
            if (ModuleStyle[styleTab][device]["default"]?.["display"]) {
              display = ModuleStyle[styleTab][device]["default"]["display"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["hover"]?.["display"]) {
                display = ModuleStyle[styleTab]["desktop"]["hover"]["display"];
              } else {
                if (ModuleStyle[styleTab]["desktop"]["default"]?.["display"]) {
                  display = ModuleStyle[styleTab]["desktop"]["default"]["display"];
                }
              }
            }
          }
        }
      }
    }
  }
  return display;
}


/***/ },

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabHeaderItems.js"
/*!********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabHeaderItems.js ***!
  \********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildFilterDesignTabHeaderItems: () => (/* binding */ buildFilterDesignTabHeaderItems)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowDownOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowLeftOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowRightOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowUpOutlined.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/segmented/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../design-components/common-component/SliderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js");
/* harmony import */ var _design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../design-components/common-component/SelectMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js");
/* harmony import */ var _design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../design-components/common-component/ColorMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js");
/* harmony import */ var _design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../design-components/common-component/AlignMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/AlignMain.js");
/* harmony import */ var _design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../design-components/common-component/BorderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BorderMain.js");
/* harmony import */ var _design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../design-components/common-component/BoxShadow */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BoxShadow.js");
/* harmony import */ var _design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../design-components/common-component/TextMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextMain.js");
/* harmony import */ var _images_flex_wrap_down_svg__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../../../images/flex/wrap-down.svg */ "./src/MainComponents/images/flex/wrap-down.svg");
/* harmony import */ var _images_flex_wrap_up_svg__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../images/flex/wrap-up.svg */ "./src/MainComponents/images/flex/wrap-up.svg");
/* harmony import */ var _images_flex_single_row_svg__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../images/flex/single-row.svg */ "./src/MainComponents/images/flex/single-row.svg");
/* harmony import */ var _images_flex_wrap_down2_svg__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../images/flex/wrap-down2.svg */ "./src/MainComponents/images/flex/wrap-down2.svg");
/* harmony import */ var _images_flex_wrap_right_svg__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../images/flex/wrap-right.svg */ "./src/MainComponents/images/flex/wrap-right.svg");
/* harmony import */ var _images_flex_wrap_left_svg__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../images/flex/wrap-left.svg */ "./src/MainComponents/images/flex/wrap-left.svg");
/* harmony import */ var _images_flex_single_column_svg__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../images/flex/single-column.svg */ "./src/MainComponents/images/flex/single-column.svg");
/* harmony import */ var _images_flex_wrap_right2_svg__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../../images/flex/wrap-right2.svg */ "./src/MainComponents/images/flex/wrap-right2.svg");
/* harmony import */ var _images_flex_wrap_left2_svg__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../../images/flex/wrap-left2.svg */ "./src/MainComponents/images/flex/wrap-left2.svg");
/* harmony import */ var _utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../../../utils/collapseMainContentClass */ "./src/MainComponents/utils/collapseMainContentClass.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__);






















function buildFilterDesignTabHeaderItems(ctx) {
  const {
    type,
    module,
    props,
    settings,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty
  } = ctx;
  return [{
    key: "0",
    label: "Layout",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("layout", "webflow-sync"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "display",
          label: "Display",
          defaultValue: "flex",
          onChangeStyle: onChangeStyle,
          styleState: styleStateAl,
          styleTab: styleTab
          //  styleState={false}
          ,
          deviceSwitch: deviceSwitch,
          options: [{
            value: 'block',
            label: 'Block'
          }, {
            value: 'flex',
            label: 'Flex'
          }],
          isNewTab: true
        }), displayProperty === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
          className: "webflow-custom-dropdown new-caf-look",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "flexFlow",
            label: "Direction",
            defaultValue: "row",
            onChangeStyle: onChangeStyle,
            styleState: styleStateAl,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            options: [{
              value: 'row',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                title: "Horizontal",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_3__["default"], {})
              })
            }, {
              value: 'column',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                title: "Vertical",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {})
              })
            }, {
              value: 'row-reverse',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                title: "Row Reverse",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_2__["default"], {})
              })
            }, {
              value: 'column-reverse',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                title: "Column Reverse",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_4__["default"], {})
              })
            }]
          })
        })]
      }), displayProperty === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
          className: "align-flex-flow",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("span", {
            className: "flex-flow-align-label",
            children: "Align"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
            className: `flex-align-control ${flexFlow === 'column wrap' || flexFlow === 'column wrap-reverse' ? 'caf-reverse-me1' : ''}`,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: `${flexFlow === 'column' || flexFlow === 'column-reverse' ? 'alignItems' : "justifyContent"}`,
              label: 'X',
              defaultValue: "flex-start",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl,
              deviceSwitch: deviceSwitch,
              class: 'align-x-flex',
              options: opt1,
              styleTab: styleTab
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: `${flexFlow === 'column' || flexFlow === 'column-reverse' ? 'justifyContent' : "alignItems"}`,
              label: 'Y',
              defaultValue: "flex-start",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl
              // styleState={false}
              ,
              deviceSwitch: deviceSwitch,
              class: 'align-y-flex',
              options: opt2,
              styleTab: styleTab
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
          className: "webflow-slider webflow-gap-slider",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "gap",
            label: "Gap",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            styleState: styleStateAl,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            isSlider: true
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "float",
        label: "Float",
        defaultValue: "none",
        onChangeStyle: onChangeStyle,
        styleState: styleStateAl,
        styleTab: styleTab
        //  styleState={false}
        ,
        deviceSwitch: deviceSwitch,
        options: [{
          value: 'none',
          label: 'None'
        }, {
          value: 'left',
          label: 'Left'
        }, {
          value: 'right',
          label: 'Right'
        }],
        isNewTab: true
      })]
    })
  }, {
    key: "1",
    label: "Text",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("text"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          value: hoverSwitchBg,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchBg,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_14__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "text",
        label: "Text",
        onChangeStyle: onChangeStyle,
        fonts: fontFamilyArray,
        hoverSwitch: hoverSwitchText,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab
      })]
    })
  }, {
    key: "2",
    label: "Sizing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("sizing"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "width",
        label: "Width",
        defaultSuffix: "%",
        defaultValue: "100",
        onChangeStyle: onChangeStyle,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab,
        isSlider: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "height",
        label: "Height",
        defaultSuffix: "%",
        defaultValue: "100",
        onChangeStyle: onChangeStyle,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab,
        isSlider: true
      })]
    })
  }, {
    key: "3",
    label: "Spacing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("spacing"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          value: hoverSwitchSpacing,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchSpacing,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("span", {
        className: "label-span-spacing",
        children: "Margin"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
        className: "caf-spacing-look",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginTop",
            label: "Top",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginBottom",
            label: "Bottom",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
            className: `spacing-joint ${isMarginVerticalJoint ? "active" : ""}`,
            onClick: toggleMarginVerticalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginLeft",
            label: "Left",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginRight",
            label: "Right",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
            className: `spacing-joint ${isMarginHorizontalJoint ? "active" : ""}`,
            onClick: toggleMarginHorizontalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("span", {
        className: "label-span-spacing",
        children: "Padding"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
        className: "caf-spacing-look",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
          className: "without-border",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingTop",
            label: "Top",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingBottom",
            label: "Bottom",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
            className: `spacing-joint ${isPaddingVerticalJoint ? "active" : ""}`,
            onClick: togglePaddingVerticalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingLeft",
            label: "Left",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingRight",
            label: "Right",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
            className: `spacing-joint ${isPaddingHorizontalJoint ? "active" : ""}`,
            onClick: togglePaddingHorizontalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        })]
      })]
    })
  }, {
    key: "4",
    label: "Background",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("background"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          value: hoverSwitchBg,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchBg,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "backgroundColor",
        defaultValue: "#333333",
        label: "Background Color",
        onChangeStyle: onChangeStyle,
        styleState: styleStateBg,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab
      })]
    })
  }, {
    key: "5",
    label: "Border",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("border"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          value: hoverSwitchBg,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchBg,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_12__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "border",
        label: "Border",
        onChangeStyle: onChangeStyle,
        styleState: styleStateBr,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab
      })]
    })
  }, {
    key: "6",
    label: "Box Shadow",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_24__.collapseMainContentClass)("box-shadow"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          value: hoverSwitchBg,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchBg,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_25__.jsx)(_design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_13__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "boxShadow",
        label: "Box Shadow",
        onChangeStyle: onChangeStyle,
        styleState: styleStateBs,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab
      })]
    })
  }];
}

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabMeta1Items.js"
/*!*******************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabMeta1Items.js ***!
  \*******************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildFilterDesignTabMeta1Items: () => (/* binding */ buildFilterDesignTabMeta1Items)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowDownOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowLeftOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowRightOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowUpOutlined.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/segmented/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./FilterDesignTabInnerTabs */ "./src/MainComponents/FilterComponents/components/settingTabContent/FilterDesignTabInnerTabs.js");
/* harmony import */ var _design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../design-components/common-component/SliderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js");
/* harmony import */ var _design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../design-components/common-component/SelectMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js");
/* harmony import */ var _design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../design-components/common-component/ColorMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js");
/* harmony import */ var _design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../design-components/common-component/AlignMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/AlignMain.js");
/* harmony import */ var _design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../design-components/common-component/BorderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BorderMain.js");
/* harmony import */ var _design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../design-components/common-component/BoxShadow */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BoxShadow.js");
/* harmony import */ var _design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../design-components/common-component/TextMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextMain.js");
/* harmony import */ var _constants_fontWeightOptions__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../../../constants/fontWeightOptions */ "./src/MainComponents/constants/fontWeightOptions.js");
/* harmony import */ var _images_flex_wrap_down_svg__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../images/flex/wrap-down.svg */ "./src/MainComponents/images/flex/wrap-down.svg");
/* harmony import */ var _images_flex_wrap_up_svg__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../images/flex/wrap-up.svg */ "./src/MainComponents/images/flex/wrap-up.svg");
/* harmony import */ var _images_flex_single_row_svg__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../images/flex/single-row.svg */ "./src/MainComponents/images/flex/single-row.svg");
/* harmony import */ var _images_flex_wrap_down2_svg__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../images/flex/wrap-down2.svg */ "./src/MainComponents/images/flex/wrap-down2.svg");
/* harmony import */ var _images_flex_wrap_right_svg__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../images/flex/wrap-right.svg */ "./src/MainComponents/images/flex/wrap-right.svg");
/* harmony import */ var _images_flex_wrap_left_svg__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../../images/flex/wrap-left.svg */ "./src/MainComponents/images/flex/wrap-left.svg");
/* harmony import */ var _images_flex_single_column_svg__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../../images/flex/single-column.svg */ "./src/MainComponents/images/flex/single-column.svg");
/* harmony import */ var _images_flex_wrap_right2_svg__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../../../images/flex/wrap-right2.svg */ "./src/MainComponents/images/flex/wrap-right2.svg");
/* harmony import */ var _images_flex_wrap_left2_svg__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../../../images/flex/wrap-left2.svg */ "./src/MainComponents/images/flex/wrap-left2.svg");
/* harmony import */ var _filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./filterDesignTabDerivedState */ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabDerivedState.js");
/* harmony import */ var _utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ../../../utils/collapseMainContentClass */ "./src/MainComponents/utils/collapseMainContentClass.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__);

























function buildFilterDesignTabMeta1Items(ctx) {
  const {
    type,
    module,
    props,
    settings,
    styleTab,
    onChangeStyle,
    deviceSwitch,
    device,
    selectedMetaDropdown,
    activeCollapsePanelKey,
    handleSettingChange,
    rangeSliderSizingSub = "meta2",
    onRangeSliderSizingSubChange,
    selectedTabsubItems,
    meta1subItems,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    styleStateIcon,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchText,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty
  } = ctx;
  if (!props?.data || !props?.indexes) {
    return [];
  }
  const isCollapsePanelOpen = panelKey => activeCollapsePanelKey === panelKey;
  const isRsSliderDesign = module?.key === "range_slider" && styleTab === "meta1";
  const rsTrackThumbTabItems = isRsSliderDesign ? [{
    key: "meta2",
    label: "Track"
  }, {
    key: "meta3",
    label: "Thumbs"
  }] : null;
  const rsTrackThumbTabsActiveKey = isRsSliderDesign ? rangeSliderSizingSub : selectedMetaDropdown;
  const onRsTrackThumbTabsChange = value => {
    if (isRsSliderDesign) {
      onRangeSliderSizingSubChange?.(value);
    } else {
      handleSettingChange(value);
    }
  };
  const rsOrMetaIsMeta = isRsSliderDesign ? rangeSliderSizingSub : selectedMetaDropdown === "meta" ? "meta1" : selectedMetaDropdown;
  const isSearchLayoutPanel = module?.key === "search" && styleTab === "meta";
  const SEARCH_LAYOUT_TAB_KEYS = ["input", "meta1", "meta2"];
  const layoutMetaKey = isSearchLayoutPanel && SEARCH_LAYOUT_TAB_KEYS.includes(selectedMetaDropdown) ? selectedMetaDropdown : isSearchLayoutPanel ? "input" : selectedMetaDropdown;
  const layoutTabsActiveKey = isSearchLayoutPanel ? layoutMetaKey : selectedMetaDropdown;
  const layoutDerivedCtx = {
    data: props.data,
    type,
    rowindex: props.indexes.rowindex,
    columnindex: props.indexes.columnindex,
    moduleindex: props.indexes.moduleindex,
    device: deviceSwitch,
    styleStateAl
  };
  const layoutFlexFlow = isSearchLayoutPanel ? (0,_filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_26__.resolveFlexFlowForFilterDesignTab)({
    ...layoutDerivedCtx,
    styleTab: layoutMetaKey
  }) : flexFlow;
  const layoutDisplayProperty = isSearchLayoutPanel ? (0,_filterDesignTabDerivedState__WEBPACK_IMPORTED_MODULE_26__.resolveDisplayPropertyForFilterDesignTab)({
    ...layoutDerivedCtx,
    styleTab: layoutMetaKey
  }) : displayProperty;
  const layoutPanelFlexFlow = isSearchLayoutPanel ? layoutFlexFlow : flexFlow;
  const layoutPanelDisplay = isSearchLayoutPanel ? layoutDisplayProperty : displayProperty;
  const layoutPanelIsMeta = isSearchLayoutPanel ? layoutMetaKey : selectedMetaDropdown;
  return [!(module?.key === "range_slider" && styleTab === "meta1") && (settings?.show_checkbox === 'true' || settings?.show_icon === 'true' || settings?.show_count === 'true' || styleTab === "selectmeta" || module?.key === "search" || settings?.show_checkbox === 'false' || settings?.show_icon === 'false' || settings?.show_count === 'false') ? {
    key: "0",
    label: "Layout",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("0"),
          activeKey: layoutTabsActiveKey,
          onChange: value => handleSettingChange(value),
          items: styleTab === "selectmeta" ? selectedTabsubItems : meta1subItems,
          defaultActiveKey: styleTab === "selectmeta" ? styleTab : null
        })
      }), isSearchLayoutPanel && layoutMetaKey === "input" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("layout", "webflow-sync"),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
          className: "webflow-slider webflow-gap-slider",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "gap",
            label: "Gap",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            styleState: styleStateAl,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            isSlider: true,
            isMeta: "input"
          })
        })
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("layout", "webflow-sync"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_12__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "display",
            label: "Display",
            defaultValue: "flex",
            onChangeStyle: onChangeStyle,
            styleState: styleStateAl,
            styleTab: styleTab,
            deviceSwitch: deviceSwitch,
            options: [{
              value: 'block',
              label: 'Block'
            }, {
              value: 'flex',
              label: 'Flex'
            }],
            isNewTab: true,
            isMeta: layoutPanelIsMeta
          }), layoutPanelDisplay === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
            className: "webflow-custom-dropdown new-caf-look",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_12__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "flexFlow",
              label: "Direction",
              defaultValue: "row",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl,
              deviceSwitch: deviceSwitch,
              styleTab: styleTab,
              isMeta: layoutPanelIsMeta,
              options: [{
                value: 'row',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                  title: "Horizontal",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_3__["default"], {})
                })
              }, {
                value: 'column',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                  title: "Vertical",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {})
                })
              }, {
                value: 'row-reverse',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                  title: "Row Reverse",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_2__["default"], {})
                })
              }, {
                value: 'column-reverse',
                label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
                  title: "Column Reverse",
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_4__["default"], {})
                })
              }]
            })
          })]
        }), layoutPanelDisplay === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
            className: "align-flex-flow",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("span", {
              className: "flex-flow-align-label",
              children: "Align"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
              className: `flex-align-control ${layoutPanelFlexFlow === 'column wrap' || layoutPanelFlexFlow === 'column wrap-reverse' ? 'caf-reverse-me1' : ''}`,
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: `${layoutPanelFlexFlow === 'column' || layoutPanelFlexFlow === 'column-reverse' ? 'alignItems' : "justifyContent"}`,
                defaultValue: "flex-start",
                label: 'X',
                onChangeStyle: onChangeStyle,
                styleState: styleStateAl,
                deviceSwitch: deviceSwitch,
                class: 'align-x-flex',
                options: opt1,
                styleTab: styleTab,
                isMeta: layoutPanelIsMeta
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: `${layoutPanelFlexFlow === 'column' || layoutPanelFlexFlow === 'column-reverse' ? 'justifyContent' : "alignItems"}`,
                label: 'Y',
                defaultValue: "flex-start",
                onChangeStyle: onChangeStyle,
                styleState: styleStateAl,
                deviceSwitch: deviceSwitch,
                class: 'align-y-flex',
                options: opt2,
                styleTab: styleTab,
                isMeta: layoutPanelIsMeta
              })]
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
            className: "webflow-slider webflow-gap-slider",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "gap",
              label: "Gap",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl,
              deviceSwitch: deviceSwitch,
              styleTab: styleTab,
              isSlider: true,
              isMeta: layoutPanelIsMeta
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_12__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "float",
          label: "Float",
          defaultValue: "none",
          onChangeStyle: onChangeStyle,
          styleState: styleStateAl,
          styleTab: styleTab,
          isMeta: layoutPanelIsMeta,
          deviceSwitch: deviceSwitch,
          options: [{
            value: 'none',
            label: 'None'
          }, {
            value: 'left',
            label: 'Left'
          }, {
            value: 'right',
            label: 'Right'
          }],
          isNewTab: true
        })]
      })]
    })
  } : null, {
    key: "1",
    label: "Text",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
      children: module?.key === "range_slider" && styleTab === "meta1" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("text"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchText,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchText,
            className: 'hoverTabCaf',
            options: [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_15__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "text",
          label: "Text",
          onChangeStyle: onChangeStyle,
          fonts: fontFamilyArray,
          hoverSwitch: hoverSwitchText,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isMeta: "meta1"
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
          className: "caf-builder-setting-row-label meta-dropdown-dyn",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__.FilterDesignTabInnerTabs, {
            isCollapseOpen: isCollapsePanelOpen("1"),
            activeKey: selectedMetaDropdown,
            defaultActiveKey: styleTab === "selectmeta" ? "selectmeta" : "meta1",
            onChange: value => handleSettingChange(value),
            items: styleTab === "selectmeta" ? [{
              key: "selectmeta",
              label: "Select Field"
            }, settings?.show_icon === 'true' ? {
              key: "selecticon",
              label: "Icon"
            } : null].filter(Boolean) : styleTab === "meta" && module?.key === "search" ? [{
              key: "input",
              label: "Field"
            }, settings?.search_icon?.is_enable === 'true' ? {
              key: "icon",
              label: "Search Icon"
            } : null, settings?.voice_icon?.is_enable === 'true' ? {
              key: "icon2",
              label: "Voice Icon"
            } : null, settings?.voice_icon?.is_enable === 'true' ? {
              key: "icon3",
              label: "Clear Icon"
            } : null].filter(Boolean) : [{
              key: "meta1",
              label: "Item"
            }, settings?.show_checkbox === 'true' ? {
              key: "input",
              label: "Checkbox"
            } : null, settings?.show_icon === 'true' ? {
              key: "icon",
              label: "Icon"
            } : null, settings?.show_count === 'true' ? {
              key: "count",
              label: "Count"
            } : null].filter(Boolean)
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
          className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("text"),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
            className: "hoverswitchguard",
            children: styleTab === "meta" && module?.key === "search" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
              value: hoverSwitchText,
              style: {
                marginBottom: 8
              },
              onChange: onHoverSwitchText,
              className: 'hoverTabCaf',
              options: selectedMetaDropdown === 'input' ? [{
                label: 'Default',
                value: false
              },
              // { label: 'Hover', value: true, },
              {
                label: 'Focus',
                value: 'selected'
              }, {
                label: 'Placeholder',
                value: 'placeholder'
              }].filter(Boolean) : [{
                label: 'Default',
                value: false
              }, {
                label: 'Hover',
                value: true
              }].filter(Boolean)
            }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
              children: selectedMetaDropdown === 'input' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
                value: 'selected',
                style: {
                  marginBottom: 8
                },
                onChange: onHoverSwitchText,
                className: 'hoverTabCaf',
                options: [{
                  label: 'Selected',
                  value: 'selected'
                }].filter(Boolean)
              }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
                value: hoverSwitchText,
                style: {
                  marginBottom: 8
                },
                onChange: onHoverSwitchText,
                className: 'hoverTabCaf',
                options: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? [{
                  label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
                  value: false
                }, {
                  label: 'Selected',
                  value: 'selected'
                }].filter(Boolean) : [{
                  label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
                  value: false
                }, {
                  label: 'Hover',
                  value: true
                }, {
                  label: 'Selected',
                  value: 'selected'
                }].filter(Boolean)
              })
            })
          }), styleTab === "meta" && module?.key === "search" ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
            children: styleTab === "meta" && module?.key === "search" && selectedMetaDropdown === 'input' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
                data: props.data,
                indexes: props.indexes,
                onChangeStyle: onChangeStyle,
                property: "fontFamily",
                label: "Font Family",
                defaultValue: "Open Sans",
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                styleState: styleStateIcon,
                isMeta: selectedMetaDropdown,
                options: fontFamilyArray ? fontFamilyArray?.map((item, index) => ({
                  label: item.family,
                  value: item.family
                })) : ''
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
                data: props.data,
                indexes: props.indexes,
                onChangeStyle: onChangeStyle,
                property: "fontWeight",
                label: "Font Weight",
                defaultValue: "400",
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                styleState: styleStateIcon,
                isMeta: selectedMetaDropdown,
                options: _constants_fontWeightOptions__WEBPACK_IMPORTED_MODULE_16__.FONT_WEIGHT_OPTIONS
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "fontSize",
                label: "Font Size",
                defaultSuffix: "px",
                defaultValue: "16px",
                onChangeStyle: onChangeStyle,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                styleState: styleStateIcon,
                isSlider: true,
                isMeta: selectedMetaDropdown
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "color",
                defaultValue: "#333333",
                label: "Color",
                onChangeStyle: onChangeStyle,
                styleState: styleStateIcon,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                isMeta: selectedMetaDropdown
              })]
            }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "fontSize",
                label: "Font Size",
                defaultSuffix: "px",
                defaultValue: "16px",
                onChangeStyle: onChangeStyle,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                styleState: styleStateIcon,
                isSlider: true,
                isMeta: selectedMetaDropdown
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "color",
                defaultValue: "#333333",
                label: "Color",
                onChangeStyle: onChangeStyle,
                styleState: styleStateIcon,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                isMeta: selectedMetaDropdown
              })]
            })
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
            children: selectedMetaDropdown === 'icon' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "fontSize",
                label: "Font Size",
                defaultSuffix: "px",
                defaultValue: "16px",
                onChangeStyle: onChangeStyle,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                styleState: styleStateIcon,
                isSlider: true,
                isMeta: rsOrMetaIsMeta
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "color",
                defaultValue: "#333333",
                label: "Color",
                onChangeStyle: onChangeStyle,
                styleState: styleStateIcon,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                isMeta: rsOrMetaIsMeta
              })]
            }) : selectedMetaDropdown === 'input' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "color",
                defaultValue: "#333333",
                label: "Color",
                onChangeStyle: onChangeStyle,
                styleState: styleStateIcon,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab,
                isMeta: 'input'
              })
            }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_15__["default"], {
                data: props.data,
                indexes: props.indexes,
                property: "text",
                label: "Text",
                onChangeStyle: onChangeStyle,
                fonts: fontFamilyArray,
                hoverSwitch: hoverSwitchText,
                deviceSwitch: deviceSwitch,
                styleTab: styleTab
                //isMeta={selectedMetaDropdown === 'meta' ? 'meta1' : styleTab!=="selectmeta" ? selectedMetaDropdown : selectedMetaDropdown}
                ,
                isMeta: rsOrMetaIsMeta
              })
            })
          })]
        })]
      })
    })
  }, {
    key: "2",
    label: "Sizing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("2"),
          activeKey: rsTrackThumbTabsActiveKey,
          defaultActiveKey: styleTab === "selectmeta" ? "selectmeta" : "meta1",
          onChange: onRsTrackThumbTabsChange,
          items: rsTrackThumbTabItems ? rsTrackThumbTabItems : styleTab === "selectmeta" ? [{
            key: "selectmeta",
            label: "Select Field"
          }].filter(Boolean) : styleTab === "meta" && module?.key === "search" ? [{
            key: "input",
            label: "Field"
          }].filter(Boolean) : [styleTab === "meta1" && module?.key === "dropdown_filter" ? {
            key: "mainmeta",
            label: "Items Container"
          } : null, {
            key: "meta1",
            label: "Item"
          }, settings?.show_checkbox === 'true' ? {
            key: "input",
            label: "Checkbox"
          } : null].filter(Boolean)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("sizing"),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "width",
            label: "Width",
            defaultSuffix: "%",
            defaultValue: "100",
            onChangeStyle: onChangeStyle,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            isSlider: true,
            isMeta: rsOrMetaIsMeta
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "height",
            label: "Height",
            defaultSuffix: "%",
            defaultValue: "100",
            onChangeStyle: onChangeStyle,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            isSlider: true,
            isMeta: rsOrMetaIsMeta
          })]
        })
      })]
    })
  }, {
    key: "3",
    label: "Spacing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("3"),
          activeKey: rsTrackThumbTabsActiveKey,
          defaultActiveKey: styleTab === "selectmeta" ? "selectmeta" : "meta1",
          onChange: onRsTrackThumbTabsChange,
          items: rsTrackThumbTabItems ? rsTrackThumbTabItems : styleTab === "selectmeta" ? [{
            key: "selectmeta",
            label: "Select Field"
          }, settings?.show_icon === 'true' ? {
            key: "selecticon",
            label: "Icon"
          } : null].filter(Boolean) : styleTab === "meta" && module?.key === "search" ? [{
            key: "input",
            label: "Field"
          }, settings?.search_icon?.is_enable === 'true' ? {
            key: "icon",
            label: "Search Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon2",
            label: "Voice Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon3",
            label: "Clear Icon"
          } : null].filter(Boolean) : [styleTab === "meta1" && module?.key === "dropdown_filter" ? {
            key: "mainmeta",
            label: "Items Container"
          } : null, {
            key: "meta1",
            label: "Item"
          }, settings?.show_checkbox === 'true' ? {
            key: "input",
            label: "Checkbox"
          } : null, settings?.show_icon === 'true' ? {
            key: "icon",
            label: "Icon"
          } : null, settings?.show_count === 'true' ? {
            key: "count",
            label: "Count"
          } : null].filter(Boolean)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("spacing"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchSpacing,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchSpacing,
            className: 'hoverTabCaf',
            options: isRsSliderDesign ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : selectedMetaDropdown === "mainmeta" ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown === 'input' ? [{
              label: 'Default',
              value: false
            },
            // { label: 'Hover', value: true, },
            {
              label: 'Focus',
              value: 'selected'
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown !== 'input' ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : module?.key === "dropdown_filter" && styleTab === "selectmeta" ? [{
              label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
              value: false
            }, {
              label: 'Selected',
              value: 'selected'
            }] : [{
              label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }, {
              label: 'Selected',
              value: 'selected'
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("span", {
          className: "label-span-spacing",
          children: "Margin"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
          className: "caf-spacing-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginTop",
              label: "Top",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginVerticalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginBottom",
              label: "Bottom",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginVerticalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
              className: `spacing-joint ${isMarginVerticalJoint ? "active" : ""}`,
              onClick: toggleMarginVerticalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginLeft",
              label: "Left",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginHorizontalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "marginRight",
              label: "Right",
              defaultSuffix: "px",
              defaultValue: "0",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isMarginHorizontalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
              className: `spacing-joint ${isMarginHorizontalJoint ? "active" : ""}`,
              onClick: toggleMarginHorizontalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("span", {
          className: "label-span-spacing",
          children: "Padding"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
          className: "caf-spacing-look",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            className: "without-border",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingTop",
              label: "Top",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingVerticalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingBottom",
              label: "Bottom",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingVerticalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
              className: `spacing-joint ${isPaddingVerticalJoint ? "active" : ""}`,
              onClick: togglePaddingVerticalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingLeft",
              label: "Left",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingHorizontalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_9__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "paddingRight",
              label: "Right",
              defaultSuffix: "px",
              defaultValue: "10",
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              styleState: styleStateSpacing,
              deviceSwitch: props.selectedDevice,
              labelBottom: true,
              isSpacingJoint: isPaddingHorizontalJoint,
              styleTab: styleTab,
              isMeta: rsOrMetaIsMeta
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
              className: `spacing-joint ${isPaddingHorizontalJoint ? "active" : ""}`,
              onClick: togglePaddingHorizontalJoint,
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("svg", {
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("path", {
                  d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                  fill: "#383A3D"
                })
              })
            })]
          })]
        })]
      })]
    })
  }, {
    key: "4",
    label: "Background",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("4"),
          activeKey: rsTrackThumbTabsActiveKey,
          defaultActiveKey: styleTab === "selectmeta" ? styleTab : "meta1",
          onChange: onRsTrackThumbTabsChange,
          items: rsTrackThumbTabItems ? rsTrackThumbTabItems : styleTab === "selectmeta" ? [{
            key: "selectmeta",
            label: "Select Field"
          }, settings?.show_icon === 'true' ? {
            key: "selecticon",
            label: "Icon"
          } : null].filter(Boolean) : styleTab === "meta" && module?.key === "search" ? [{
            key: "input",
            label: "Field"
          }, settings?.search_icon?.is_enable === 'true' ? {
            key: "icon",
            label: "Search Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon2",
            label: "Voice Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon3",
            label: "Clear Icon"
          } : null].filter(Boolean) : [styleTab === "meta1" && module?.key === "dropdown_filter" ? {
            key: "mainmeta",
            label: "Main"
          } : null, {
            key: "meta1",
            label: "Item"
          }, settings?.show_checkbox === 'true' ? {
            key: "input",
            label: "Checkbox"
          } : null, settings?.show_icon === 'true' ? {
            key: "icon",
            label: "Icon"
          } : null, settings?.show_count === 'true' ? {
            key: "count",
            label: "Count"
          } : null].filter(Boolean)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("background"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchBg,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchBg,
            className: 'hoverTabCaf',
            options: isRsSliderDesign ? rangeSliderSizingSub === "meta2" ? [{
              label: "Default",
              value: false
            }, {
              label: "Hover",
              value: true
            }, {
              label: "Active",
              value: "active"
            }] : [{
              label: "Default",
              value: false
            }, {
              label: "Hover",
              value: true
            }] : selectedMetaDropdown === "mainmeta" ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown !== 'input' ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown === 'input' ? [{
              label: 'Default',
              value: false
            },
            // { label: 'Hover', value: true, },
            {
              label: 'Focus',
              value: 'selected'
            }] : module?.key === "dropdown_filter" && styleTab === "selectmeta" ? [{
              label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
              value: false
            }, {
              label: 'Selected',
              value: 'selected'
            }] : [{
              label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }, {
              label: 'Selected',
              value: 'selected'
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "backgroundColor",
          defaultValue: "#333333",
          label: "Background Color",
          onChangeStyle: onChangeStyle,
          styleState: styleStateBg,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isMeta: rsOrMetaIsMeta
        })]
      })]
    })
  }, {
    key: "5",
    label: "Border",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("5"),
          activeKey: rsTrackThumbTabsActiveKey,
          defaultActiveKey: styleTab === "selectmeta" ? styleTab : "meta1",
          onChange: onRsTrackThumbTabsChange,
          items: rsTrackThumbTabItems ? rsTrackThumbTabItems : styleTab === "selectmeta" ? [{
            key: "selectmeta",
            label: "Select Field"
          }, settings?.show_icon === 'true' ? {
            key: "selecticon",
            label: "Icon"
          } : null].filter(Boolean) : styleTab === "meta" && module?.key === "search" ? [{
            key: "input",
            label: "Field"
          }, settings?.search_icon?.is_enable === 'true' ? {
            key: "icon",
            label: "Search Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon2",
            label: "Voice Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon3",
            label: "Clear Icon"
          } : null].filter(Boolean) : [styleTab === "meta1" && module?.key === "dropdown_filter" ? {
            key: "mainmeta",
            label: "Main"
          } : null, {
            key: "meta1",
            label: "Item"
          }, settings?.show_checkbox === 'true' ? {
            key: "input",
            label: "Checkbox"
          } : null, settings?.show_icon === 'true' ? {
            key: "icon",
            label: "Icon"
          } : null, settings?.show_count === 'true' ? {
            key: "count",
            label: "Count"
          } : null].filter(Boolean)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("border"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchBr,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchBr,
            className: 'hoverTabCaf',
            options: isRsSliderDesign ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : selectedMetaDropdown === "mainmeta" ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown !== 'input' ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown === 'input' ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }, {
              label: 'Focus',
              value: 'selected'
            }] : [{
              label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }, {
              label: 'Selected',
              value: 'selected'
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_13__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "border",
          label: "Border",
          onChangeStyle: onChangeStyle,
          styleState: styleStateBr,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isMeta: rsOrMetaIsMeta
        })]
      })]
    })
  }, {
    key: "6",
    label: "Box Shadow",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
        className: "caf-builder-setting-row-label meta-dropdown-dyn",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_FilterDesignTabInnerTabs__WEBPACK_IMPORTED_MODULE_8__.FilterDesignTabInnerTabs, {
          isCollapseOpen: isCollapsePanelOpen("6"),
          activeKey: rsTrackThumbTabsActiveKey,
          defaultActiveKey: styleTab === "selectmeta" ? styleTab : "meta1",
          onChange: onRsTrackThumbTabsChange,
          items: rsTrackThumbTabItems ? rsTrackThumbTabItems : styleTab === "selectmeta" ? [{
            key: "selectmeta",
            label: "Select Field"
          }, settings?.show_icon === 'true' ? {
            key: "selecticon",
            label: "Icon"
          } : null].filter(Boolean) : styleTab === "meta" && module?.key === "search" ? [{
            key: "input",
            label: "Field"
          }, settings?.search_icon?.is_enable === 'true' ? {
            key: "icon",
            label: "Search Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon2",
            label: "Voice Icon"
          } : null, settings?.voice_icon?.is_enable === 'true' ? {
            key: "icon3",
            label: "Clear Icon"
          } : null].filter(Boolean) : [styleTab === "meta1" && module?.key === "dropdown_filter" ? {
            key: "mainmeta",
            label: "Main"
          } : null, {
            key: "meta1",
            label: "Item"
          }, settings?.show_checkbox === 'true' ? {
            key: "input",
            label: "Checkbox"
          } : null, settings?.show_icon === 'true' ? {
            key: "icon",
            label: "Icon"
          } : null].filter(Boolean)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsxs)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_27__.collapseMainContentClass)("box-shadow"),
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)("div", {
          className: "hoverswitchguard",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
            value: hoverSwitchBs,
            style: {
              marginBottom: 8
            },
            onChange: onHoverSwitchBs,
            className: 'hoverTabCaf',
            options: isRsSliderDesign ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : selectedMetaDropdown === "mainmeta" ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown !== 'input' ? [{
              label: 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }] : styleTab === "meta" && module?.key === "search" && selectedMetaDropdown === 'input' ? [{
              label: 'Default',
              value: false
            },
            // { label: 'Hover', value: true, },
            {
              label: 'Focus',
              value: 'selected'
            }] : [{
              label: module?.key === "dropdown_filter" && styleTab === "selectmeta" ? "Placeholder" : 'Default',
              value: false
            }, {
              label: 'Hover',
              value: true
            }, {
              label: 'Selected',
              value: 'selected'
            }]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_28__.jsx)(_design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_14__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "boxShadow",
          label: "Box Shadow",
          onChangeStyle: onChangeStyle,
          styleState: styleStateBs,
          deviceSwitch: deviceSwitch,
          styleTab: styleTab,
          isMeta: rsOrMetaIsMeta
        })]
      })]
    })
  }].filter(Boolean);
}

/***/ },

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabMetaItems.js"
/*!******************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/filterDesignTabMetaItems.js ***!
  \******************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildFilterDesignTabMetaItems: () => (/* binding */ buildFilterDesignTabMetaItems)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowDownOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowLeftOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowRightOutlined.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/ArrowUpOutlined.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/col/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/segmented/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/switch/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../design-components/common-component/SliderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js");
/* harmony import */ var _design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../design-components/common-component/SelectMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js");
/* harmony import */ var _design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../design-components/common-component/ColorMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/ColorMain.js");
/* harmony import */ var _design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../design-components/common-component/AlignMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/AlignMain.js");
/* harmony import */ var _design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../design-components/common-component/BorderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BorderMain.js");
/* harmony import */ var _design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../design-components/common-component/BoxShadow */ "./src/MainComponents/FilterComponents/components/design-components/common-component/BoxShadow.js");
/* harmony import */ var _design_components_common_component_TextMain__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ../design-components/common-component/TextMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/TextMain.js");
/* harmony import */ var _images_flex_wrap_down_svg__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ../../../images/flex/wrap-down.svg */ "./src/MainComponents/images/flex/wrap-down.svg");
/* harmony import */ var _images_flex_wrap_up_svg__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../../../images/flex/wrap-up.svg */ "./src/MainComponents/images/flex/wrap-up.svg");
/* harmony import */ var _images_flex_single_row_svg__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../../../images/flex/single-row.svg */ "./src/MainComponents/images/flex/single-row.svg");
/* harmony import */ var _images_flex_wrap_down2_svg__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ../../../images/flex/wrap-down2.svg */ "./src/MainComponents/images/flex/wrap-down2.svg");
/* harmony import */ var _images_flex_wrap_right_svg__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ../../../images/flex/wrap-right.svg */ "./src/MainComponents/images/flex/wrap-right.svg");
/* harmony import */ var _images_flex_wrap_left_svg__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ../../../images/flex/wrap-left.svg */ "./src/MainComponents/images/flex/wrap-left.svg");
/* harmony import */ var _images_flex_single_column_svg__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ../../../images/flex/single-column.svg */ "./src/MainComponents/images/flex/single-column.svg");
/* harmony import */ var _images_flex_wrap_right2_svg__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ../../../images/flex/wrap-right2.svg */ "./src/MainComponents/images/flex/wrap-right2.svg");
/* harmony import */ var _images_flex_wrap_left2_svg__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ../../../images/flex/wrap-left2.svg */ "./src/MainComponents/images/flex/wrap-left2.svg");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var _utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ../../../utils/collapseMainContentClass */ "./src/MainComponents/utils/collapseMainContentClass.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__);
























function buildFilterDesignTabMetaItems(ctx) {
  const {
    type,
    module,
    props,
    settings,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    fWrap,
    resetValue,
    handleWrapChange,
    displayProperty
  } = ctx;
  if (!props?.data || !props?.indexes) {
    return [];
  }
  return [{
    key: "0",
    label: "Layout",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("layout", "webflow-sync"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__["default"], {
          data: props.data,
          indexes: props.indexes,
          property: "display",
          label: "Display",
          defaultValue: "flex",
          onChangeStyle: onChangeStyle,
          styleState: styleStateAl,
          styleTab: styleTab
          //  styleState={false}
          ,
          deviceSwitch: deviceSwitch,
          options: [{
            value: 'block',
            label: 'Block'
          }, {
            value: 'flex',
            label: 'Flex'
          }],
          isNewTab: true
        }), displayProperty === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "webflow-custom-dropdown new-caf-look",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "flexFlow",
            label: "Direction",
            defaultValue: "row",
            onChangeStyle: onChangeStyle,
            styleState: styleStateAl,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            options: [{
              value: 'row',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__["default"], {
                title: "Horizontal",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_3__["default"], {})
              })
            }, {
              value: 'column',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__["default"], {
                title: "Vertical",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_1__["default"], {})
              })
            }, {
              value: 'row-reverse',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__["default"], {
                title: "Row Reverse",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_2__["default"], {})
              })
            }, {
              value: 'column-reverse',
              label: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__["default"], {
                title: "Column Reverse",
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_4__["default"], {})
              })
            }]
          })
        })]
      }), displayProperty === "flex" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
          className: "align-flex-flow",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
            className: "flex-flow-align-label",
            children: "Align"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
            className: `flex-align-control ${flexFlow === 'column wrap' || flexFlow === 'column wrap-reverse' ? 'caf-reverse-me1' : ''}`,
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: `${flexFlow === 'column' || flexFlow === 'column-reverse' ? 'alignItems' : "justifyContent"}`,
              label: 'X',
              defaultValue: "flex-start",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl,
              deviceSwitch: deviceSwitch,
              class: 'align-x-flex',
              options: opt1,
              styleTab: styleTab
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_11__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: `${flexFlow === 'column' || flexFlow === 'column-reverse' ? 'justifyContent' : "alignItems"}`,
              label: 'Y',
              defaultValue: "flex-start",
              onChangeStyle: onChangeStyle,
              styleState: styleStateAl
              // styleState={false}
              ,
              deviceSwitch: deviceSwitch,
              class: 'align-y-flex',
              options: opt2,
              styleTab: styleTab
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
          className: "webflow-slider webflow-gap-slider",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "gap",
            label: "Gap",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            styleState: styleStateAl,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab,
            isSlider: true
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_AlignMain__WEBPACK_IMPORTED_MODULE_13__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "float",
        label: "Float",
        defaultValue: "none",
        onChangeStyle: onChangeStyle,
        styleState: styleStateAl,
        styleTab: styleTab
        //  styleState={false}
        ,
        deviceSwitch: deviceSwitch,
        options: [{
          value: 'none',
          label: 'None'
        }, {
          value: 'left',
          label: 'Left'
        }, {
          value: 'right',
          label: 'Right'
        }],
        isNewTab: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "webflow-slider webflow-gap-slider",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
          className: "caf-builder-setting-row-label caf-builder-wrap-row",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("label", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Toggle flex wrap for items.",
              children: "Wrap"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_9__["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Reset",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
                onClick: resetValue,
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_26__.FontAwesomeIcon, {
                  icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_27__.faArrowRotateLeft
                })
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_8__["default"], {
            className: "caf-builder-design-switch",
            checked: (fWrap || "wrap") === "wrap",
            onChange: checked => {
              handleWrapChange(checked ? "wrap" : "nowrap");
            }
          })]
        })
      })]
    })
  }, {
    key: "2",
    label: "Sizing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("sizing"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "width",
        label: "Width",
        defaultSuffix: "%",
        defaultValue: "100",
        onChangeStyle: onChangeStyle,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab,
        isSlider: true
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "height",
        label: "Height",
        defaultSuffix: "%",
        defaultValue: "100",
        onChangeStyle: onChangeStyle,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab,
        isSlider: true
      }), module.key == "search" && styleTab == "meta" && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
          span: 12,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "left",
            label: "Left",
            defaultSuffix: "px",
            defaultValue: "-32",
            onChangeStyle: onChangeStyle,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_5__["default"], {
          span: 12,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "right",
            label: "Right",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            deviceSwitch: deviceSwitch,
            styleTab: styleTab
          })
        })]
      })]
    })
  }, {
    key: "3",
    label: "Spacing",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("spacing"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          value: hoverSwitchSpacing,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchSpacing,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
        className: "label-span-spacing",
        children: "Margin"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: "caf-spacing-look",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginTop",
            label: "Top",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginBottom",
            label: "Bottom",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: `spacing-joint ${isMarginVerticalJoint ? "active" : ""}`,
            onClick: toggleMarginVerticalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginLeft",
            label: "Left",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "marginRight",
            label: "Right",
            defaultSuffix: "px",
            defaultValue: "0",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isMarginHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: `spacing-joint ${isMarginHorizontalJoint ? "active" : ""}`,
            onClick: toggleMarginHorizontalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("span", {
        className: "label-span-spacing",
        children: "Padding"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
        className: "caf-spacing-look",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          className: "without-border",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingTop",
            label: "Top",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingBottom",
            label: "Bottom",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingVerticalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: `spacing-joint ${isPaddingVerticalJoint ? "active" : ""}`,
            onClick: togglePaddingVerticalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingLeft",
            label: "Left",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
            data: props.data,
            indexes: props.indexes,
            property: "paddingRight",
            label: "Right",
            defaultSuffix: "px",
            defaultValue: "10",
            onChangeStyle: onChangeStyle,
            extraClass: "colm2",
            styleState: styleStateSpacing,
            deviceSwitch: props.selectedDevice,
            labelBottom: true,
            isSpacingJoint: isPaddingHorizontalJoint,
            styleTab: styleTab
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
            className: `spacing-joint ${isPaddingHorizontalJoint ? "active" : ""}`,
            onClick: togglePaddingHorizontalJoint,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("path", {
                d: "M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z",
                fill: "#383A3D"
              })
            })
          })]
        })]
      })]
    })
  }, {
    key: "4",
    label: "Background",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("background"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          value: hoverSwitchBg,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchBg,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_ColorMain__WEBPACK_IMPORTED_MODULE_12__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "backgroundColor",
        defaultValue: "#333333",
        label: "Background Color",
        onChangeStyle: onChangeStyle,
        styleState: styleStateBg,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab
      })]
    })
  }, {
    key: "5",
    label: "Border",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("border"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          value: hoverSwitchBg,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchBg,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_BorderMain__WEBPACK_IMPORTED_MODULE_14__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "border",
        label: "Border",
        onChangeStyle: onChangeStyle,
        styleState: styleStateBr,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab
      })]
    })
  }, {
    key: "6",
    label: "Box Shadow",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_28__.collapseMainContentClass)("box-shadow"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)("div", {
        className: "hoverswitchguard",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(antd__WEBPACK_IMPORTED_MODULE_7__["default"], {
          value: hoverSwitchBg,
          style: {
            marginBottom: 8
          },
          onChange: onHoverSwitchBg,
          className: 'hoverTabCaf',
          options: [{
            label: 'Default',
            value: false
          }, {
            label: 'Hover',
            value: true
          }]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_29__.jsx)(_design_components_common_component_BoxShadow__WEBPACK_IMPORTED_MODULE_15__["default"], {
        data: props.data,
        indexes: props.indexes,
        property: "boxShadow",
        label: "Box Shadow",
        onChangeStyle: onChangeStyle,
        styleState: styleStateBs,
        deviceSwitch: deviceSwitch,
        styleTab: styleTab
      })]
    })
  }];
}

/***/ }

}]);
//# sourceMappingURL=src_MainComponents_FilterComponents_components_settingTabContent_DesignTab_js.js.map?ver=8824cf59709bdb37bfc2