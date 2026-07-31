"use strict";
(globalThis["webpackChunkreact_builder"] = globalThis["webpackChunkreact_builder"] || []).push([["src_MainComponents_FilterComponents_components_settingTabContent_AdvancedTab_js"],{

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
          value: "static",
          label: "Static"
        }, {
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
//# sourceMappingURL=src_MainComponents_FilterComponents_components_settingTabContent_AdvancedTab_js.js.map?ver=047abe5b54d1da17be4b