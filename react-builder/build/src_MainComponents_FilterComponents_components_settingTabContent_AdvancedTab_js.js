"use strict";
(globalThis["webpackChunkreact_builder"] = globalThis["webpackChunkreact_builder"] || []).push([["src_MainComponents_FilterComponents_components_settingTabContent_AdvancedTab_js"],{

/***/ "./src/MainComponents/FilterComponents/components/design-components/common-component/InputMain.js"
/*!********************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/design-components/common-component/InputMain.js ***!
  \********************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/tooltip/index.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);





const InputMain = props => {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  const {
    property,
    label,
    defaultValue,
    styleState = 'default',
    deviceSwitch,
    styleTab
  } = props;
  let currentValue = "";
  if (defaultValue) {
    currentValue = defaultValue;
  }
  let device = deviceSwitch;
  if (type === 'row') {
    let RowStyle = props.data[rowindex].style;
    if (RowStyle[device][styleState]?.[property]) {
      currentValue = RowStyle[device][styleState][property];
    } else {
      if (device === "desktop") {
        if (styleState == "hover") {
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
        if (styleState === "hover") {
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
  const [inputValue, setInputValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(currentValue);
  const onChangeValue = e => {
    let value = e.target.value;
    setInputValue(value);
    let items = [...props.data];
    if (type == "row") {
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
    if (type == "column") {
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
    if (type == "module") {
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
    setInputValue(defaultValue);
    let items = [...props.data];
    if (type == "row") {
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
    if (type == "column") {
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
    if (type == "module") {
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "caf-builder-setting-row-label",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("label", {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: `Adjust ${label} settings.`,
        children: label
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Reset",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          onClick: resetValue,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_3__.FontAwesomeIcon, {
            icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_4__.faArrowRotateLeft
          })
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
      type: "number",
      value: inputValue,
      defaultValue: inputValue,
      onChange: e => onChangeValue(e)
    })]
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (InputMain);

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

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/AdvancedTab.js"
/*!*****************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/AdvancedTab.js ***!
  \*****************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/button/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/col/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/collapse/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/input/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/message/index.js");
/* harmony import */ var antd__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! antd */ "./node_modules/antd/es/row/index.js");
/* harmony import */ var _design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../design-components/common-component/SliderMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SliderMain.js");
/* harmony import */ var _design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../design-components/common-component/SelectMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/SelectMain.js");
/* harmony import */ var _ant_design_icons__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ant-design/icons */ "./node_modules/@ant-design/icons/es/icons/CaretDownOutlined.js");
/* harmony import */ var _design_components_common_component_InputMain__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../design-components/common-component/InputMain */ "./src/MainComponents/FilterComponents/components/design-components/common-component/InputMain.js");
/* harmony import */ var _ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ModuleContentData/filterSettingsSnapshot */ "./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/filterSettingsSnapshot.js");
/* harmony import */ var _utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../utils/collapseMainContentClass */ "./src/MainComponents/utils/collapseMainContentClass.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__);









const AdvancedTab = props => {
  //console.log(props);
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  const [hoverSwitchPosition, setHoverSwitchPosition] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [labelStatus, setLabelStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(module.settings?.label?.is_label === "true" ? true : false);
  const items = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_11__.cloneFilterLayoutData)(props.data), [props.data]);
  let item = '';
  if (type === 'row') {
    item = {
      ...items[rowindex]["settings"]
    };
  }
  if (type === 'column') {
    item = {
      ...items[rowindex].data[columnindex]["settings"]
    };
  }
  if (type === 'module') {
    item = {
      ...items[rowindex].data[columnindex].data[moduleindex]["settings"]
    };
  }
  const [value, setValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(item?.custom_class ?? "");
  const [adminLabel, setAdminLabel] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(item?.admin_label ?? "");
  //console.log(item)
  const handleChange = val => {
    setValue(val);
    item.custom_class = val;
    if (type === 'row') {
      items[rowindex]["settings"] = item;
    }
    if (type === 'column') {
      items[rowindex].data[columnindex]["settings"] = item;
    }
    if (type === 'module') {
      items[rowindex].data[columnindex].data[moduleindex]["settings"] = item;
    }
    props.onChangeData(items);
  };
  const handleAdminLabel = val => {
    setAdminLabel(val);
    item.admin_label = val;
    if (type === 'row') {
      items[rowindex]["settings"] = item;
    }
    if (type === 'column') {
      items[rowindex].data[columnindex]["settings"] = item;
    }
    if (type === 'module') {
      items[rowindex].data[columnindex].data[moduleindex]["settings"] = item;
    }
    props.onChangeData(items);
  };
  let styleStatePosition = "default";
  if (hoverSwitchPosition) {
    styleStatePosition = "hover";
  }
  const onChangeStyle = style => {
    // console.log(style);
    props.onChangeStyle(style);
  };
  const buildAdvancedEntityExportPayload = () => {
    if (type === "row") {
      const rowData = items?.[rowindex];
      if (!rowData) return null;
      return {
        payload: {
          row_data: (0,_ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_11__.cloneFilterLayoutData)(rowData),
          _export_meta: {
            version: "1.0.0",
            plugin: "category-ajax-filter-pro",
            scope: "filter_row",
            exported_at: new Date().toISOString()
          }
        },
        fileNamePart: "row",
        successText: "Row exported successfully."
      };
    }
    if (type === "column") {
      const columnData = items?.[rowindex]?.data?.[columnindex];
      if (!columnData) return null;
      return {
        payload: {
          column_data: (0,_ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_11__.cloneFilterLayoutData)(columnData),
          _export_meta: {
            version: "1.0.0",
            plugin: "category-ajax-filter-pro",
            scope: "filter_column",
            exported_at: new Date().toISOString()
          }
        },
        fileNamePart: "column",
        successText: "Column exported successfully."
      };
    }
    if (type === "module") {
      const moduleData = items?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
      if (!moduleData) return null;
      return {
        payload: {
          module_data: (0,_ModuleContentData_filterSettingsSnapshot__WEBPACK_IMPORTED_MODULE_11__.cloneFilterLayoutData)(moduleData),
          _export_meta: {
            version: "1.0.0",
            plugin: "category-ajax-filter-pro",
            scope: "filter_module",
            exported_at: new Date().toISOString(),
            module_key: moduleData?.key || "",
            module_title: moduleData?.title || ""
          }
        },
        fileNamePart: moduleData?.key || "module",
        successText: "Module exported successfully."
      };
    }
    return null;
  };
  const handleEntityExport = () => {
    const exportData = buildAdvancedEntityExportPayload();
    if (!exportData) {
      antd__WEBPACK_IMPORTED_MODULE_5__["default"].error("Export data is not available.");
      return;
    }
    const blob = new Blob([JSON.stringify(exportData.payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `caf-filter-${exportData.fileNamePart}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    antd__WEBPACK_IMPORTED_MODULE_5__["default"].success(exportData.successText);
  };
  let styleItems = [
  //1:positioning
  {
    key: "1",
    label: "Positioning",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_12__.collapseMainContentClass)("positioning"),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
        data: props.data,
        indexes: props.indexes,
        onChangeStyle: onChangeStyle,
        property: "position",
        defaultValue: "relative",
        label: "Position",
        styleState: styleStatePosition,
        deviceSwitch: props.deviceSwitch,
        styleTab: 'container',
        options: [{
          value: "relative",
          label: "Relative"
        }, {
          value: "absolute",
          label: "Absolute"
        }, {
          value: "inherit",
          label: "Inherit"
        }]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_design_components_common_component_InputMain__WEBPACK_IMPORTED_MODULE_10__["default"], {
        data: props.data,
        indexes: props.indexes,
        onChangeStyle: onChangeStyle,
        property: "zIndex",
        defaultValue: "999",
        label: "Z Index",
        styleState: styleStatePosition,
        deviceSwitch: props.deviceSwitch,
        styleTab: 'container'
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
        className: "caf-position-spacing-look",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
            span: 12,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_7__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "top",
              label: "Top",
              defaultSuffix: "px",
              defaultValue: "0",
              styleState: styleStatePosition,
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              deviceSwitch: props.deviceSwitch,
              styleTab: 'container'
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
            span: 12,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_7__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "right",
              label: "Right",
              defaultSuffix: "px",
              defaultValue: "0",
              styleState: styleStatePosition,
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              deviceSwitch: props.deviceSwitch,
              styleTab: 'container'
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)(antd__WEBPACK_IMPORTED_MODULE_6__["default"], {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
            span: 12,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_7__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "bottom",
              label: "Bottom",
              defaultSuffix: "px",
              defaultValue: "0",
              styleState: styleStatePosition,
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              deviceSwitch: props.deviceSwitch,
              styleTab: 'container'
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_2__["default"], {
            span: 12,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_design_components_common_component_SliderMain__WEBPACK_IMPORTED_MODULE_7__["default"], {
              data: props.data,
              indexes: props.indexes,
              property: "left",
              label: "Left",
              defaultSuffix: "px",
              defaultValue: "0",
              styleState: styleStatePosition,
              onChangeStyle: onChangeStyle,
              extraClass: "colm2",
              deviceSwitch: props.deviceSwitch,
              styleTab: 'container'
            })
          })]
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_design_components_common_component_SelectMain__WEBPACK_IMPORTED_MODULE_8__["default"], {
        data: props.data,
        indexes: props.indexes,
        onChangeStyle: onChangeStyle,
        property: "overflow",
        defaultValue: "inherit",
        label: "Overflow",
        styleState: styleStatePosition,
        deviceSwitch: props.deviceSwitch,
        styleTab: 'container',
        options: [{
          value: "auto",
          label: "Auto"
        }, {
          value: "clip",
          label: "Clip"
        }, {
          value: "hidden",
          label: "Hidden"
        }, {
          value: "overlay",
          label: "Overlay"
        }, {
          value: "scroll",
          label: "Scroll"
        }, {
          value: "visible",
          label: "Visible"
        }, {
          value: "inherit",
          label: "Inherit"
        }, {
          value: "inherit",
          label: "Inherit"
        }]
      })]
    })
  }, {
    key: "3",
    label: "Custom Class",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_12__.collapseMainContentClass)("custom-class"),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
        className: "caf-builder-setting-row-label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("label", {
          children: "Add Custom Class"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
          onChange: e => handleChange(e.target.value),
          value: value,
          placeholder: "Add Custom Class"
        })]
      })
    })
  }, {
    key: "4",
    label: "Admin label",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
      className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_12__.collapseMainContentClass)("admin-label"),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
        className: "caf-builder-setting-row-label",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("label", {
          children: "Add Admin Label"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_4__["default"], {
          onChange: e => handleAdminLabel(e.target.value),
          value: adminLabel,
          placeholder: "Add Admin Label"
        })]
      })
    })
  }];
  if (type === "module" || type === "row" || type === "column") {
    const exportLabel = type === "module" ? "Export current module" : type === "column" ? "Export current column" : "Export current row";
    const exportButtonText = type === "module" ? "Export Module JSON" : type === "column" ? "Export Column JSON" : "Export Row JSON";
    styleItems.push({
      key: "export",
      label: "Export",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
        className: (0,_utils_collapseMainContentClass__WEBPACK_IMPORTED_MODULE_12__.collapseMainContentClass)("export"),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsxs)("div", {
          className: "caf-builder-setting-row-label",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("label", {
            children: exportLabel
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_1__["default"], {
            type: "primary",
            onClick: handleEntityExport,
            children: exportButtonText
          })]
        })
      })
    });
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)("div", {
    className: "row-design-tab-data",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(antd__WEBPACK_IMPORTED_MODULE_3__["default"]
    // defaultActiveKey={["1"]}
    , {
      expandIconPlacement: "end",
      accordion: true,
      expandIcon: ({
        isActive
      }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__.jsx)(_ant_design_icons__WEBPACK_IMPORTED_MODULE_9__["default"], {
        rotate: isActive ? 180 : 0
      }),
      items: styleItems
    })
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AdvancedTab);

/***/ }

}]);
//# sourceMappingURL=src_MainComponents_FilterComponents_components_settingTabContent_AdvancedTab_js.js.map?ver=69b0342aaec5a9c54642