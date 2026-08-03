"use strict";
(globalThis["webpackChunkreact_builder"] = globalThis["webpackChunkreact_builder"] || []).push([["src_MainComponents_FilterComponents_components_settingTabContent_ContentTab_js"],{

/***/ "./src/MainComponents/FilterComponents/components/settingTabContent/ContentTab.js"
/*!*****************************************************************************************************!*\
  !*** ./src/MainComponents/FilterComponents/components/settingTabContent/ContentTab.js + 26 modules ***!
  \*****************************************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ settingTabContent_ContentTab)
});

// EXTERNAL MODULE: external "React"
var external_React_ = __webpack_require__("react");
var external_React_default = /*#__PURE__*/__webpack_require__.n(external_React_);
// EXTERNAL MODULE: ./src/api/client.js + 50 modules
var client = __webpack_require__("./src/api/client.js");
// EXTERNAL MODULE: ./src/api/endpoints.js
var endpoints = __webpack_require__("./src/api/endpoints.js");
// EXTERNAL MODULE: ./node_modules/antd/es/skeleton/index.js + 10 modules
var skeleton = __webpack_require__("./node_modules/antd/es/skeleton/index.js");
// EXTERNAL MODULE: ./node_modules/antd/es/select/index.js + 68 modules
var es_select = __webpack_require__("./node_modules/antd/es/select/index.js");
// EXTERNAL MODULE: ./node_modules/antd/es/tooltip/index.js + 6 modules
var tooltip = __webpack_require__("./node_modules/antd/es/tooltip/index.js");
// EXTERNAL MODULE: ./node_modules/antd/es/button/index.js
var es_button = __webpack_require__("./node_modules/antd/es/button/index.js");
// EXTERNAL MODULE: ./node_modules/antd/es/input/index.js + 8 modules
var input = __webpack_require__("./node_modules/antd/es/input/index.js");
// EXTERNAL MODULE: ./node_modules/antd/es/segmented/index.js + 3 modules
var segmented = __webpack_require__("./node_modules/antd/es/segmented/index.js");
// EXTERNAL MODULE: ./node_modules/antd/es/modal/index.js + 28 modules
var modal = __webpack_require__("./node_modules/antd/es/modal/index.js");
// EXTERNAL MODULE: ./node_modules/html-react-parser/esm/index.mjs
var esm = __webpack_require__("./node_modules/html-react-parser/esm/index.mjs");
// EXTERNAL MODULE: ./node_modules/@fortawesome/react-fontawesome/index.es.js
var index_es = __webpack_require__("./node_modules/@fortawesome/react-fontawesome/index.es.js");
// EXTERNAL MODULE: ./node_modules/@fortawesome/free-solid-svg-icons/index.mjs
var free_solid_svg_icons = __webpack_require__("./node_modules/@fortawesome/free-solid-svg-icons/index.mjs");
// EXTERNAL MODULE: ./src/MainComponents/BuilderDeleteIcon.js
var BuilderDeleteIcon = __webpack_require__("./src/MainComponents/BuilderDeleteIcon.js");
// EXTERNAL MODULE: ./node_modules/@ant-design/icons/es/icons/PlusCircleFilled.js + 1 modules
var PlusCircleFilled = __webpack_require__("./node_modules/@ant-design/icons/es/icons/PlusCircleFilled.js");
// EXTERNAL MODULE: ./node_modules/antd/es/switch/index.js + 2 modules
var es_switch = __webpack_require__("./node_modules/antd/es/switch/index.js");
// EXTERNAL MODULE: ./node_modules/antd/es/popover/index.js + 3 modules
var popover = __webpack_require__("./node_modules/antd/es/popover/index.js");
// EXTERNAL MODULE: ./node_modules/@ant-design/icons/es/icons/DeleteOutlined.js
var DeleteOutlined = __webpack_require__("./node_modules/@ant-design/icons/es/icons/DeleteOutlined.js");
// EXTERNAL MODULE: ./src/MainComponents/shared/cafUploadedIcon.js
var cafUploadedIcon = __webpack_require__("./src/MainComponents/shared/cafUploadedIcon.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/filterSettingsSnapshot.js
var filterSettingsSnapshot = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/filterSettingsSnapshot.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/filterModuleDefaults.js
var filterModuleDefaults = __webpack_require__("./src/MainComponents/FilterComponents/filterModuleDefaults.js");
// EXTERNAL MODULE: external "ReactJSXRuntime"
var external_ReactJSXRuntime_ = __webpack_require__("react/jsx-runtime");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/ContentIcons1.js







const FILTER_LABEL_DEFAULT_ICON = "fas fa-filter";
const normalizeLabelIconConfig = labelSettings => {
  const nextLabel = JSON.parse(JSON.stringify(labelSettings || {}));
  if (!nextLabel.icons || typeof nextLabel.icons !== "object") {
    nextLabel.icons = {};
  }
  if (nextLabel.icons.visibility === true) {
    if ((0,filterModuleDefaults.isEmptyIconValue)(nextLabel.icons.icon)) {
      nextLabel.icons.icon = FILTER_LABEL_DEFAULT_ICON;
      nextLabel.icons.type = "icon";
    }
  }
  return nextLabel;
};
const normalizeResetIconConfig = settings => {
  const nextSettings = JSON.parse(JSON.stringify(settings || {}));
  if (!nextSettings.icons || typeof nextSettings.icons !== "object") {
    nextSettings.icons = {};
  }
  if (nextSettings.icons.visibility === true) {
    if ((0,filterModuleDefaults.isEmptyIconValue)(nextSettings.icons.icon)) {
      nextSettings.icons.icon = filterModuleDefaults.FILTER_RESET_DEFAULT_ICON;
      nextSettings.icons.type = "icon";
    }
  }
  return nextSettings;
};
const shouldShowLabelDeleteButton = labelIcons => {
  if (!labelIcons || typeof labelIcons !== "object") return false;
  const currentIcon = labelIcons.icon;
  if (typeof currentIcon === "string") {
    const trimmed = currentIcon.trim();
    return trimmed !== "" && trimmed !== FILTER_LABEL_DEFAULT_ICON;
  }
  if (typeof currentIcon === "object" && currentIcon !== null) {
    return Object.keys(currentIcon).length > 0;
  }
  return false;
};
const shouldShowResetDeleteButton = resetIcons => {
  if (!resetIcons || typeof resetIcons !== "object") return false;
  const currentIcon = resetIcons.icon;
  if (typeof currentIcon === "string") {
    const trimmed = currentIcon.trim();
    return trimmed !== "" && trimmed !== filterModuleDefaults.FILTER_RESET_DEFAULT_ICON;
  }
  if (typeof currentIcon === "object" && currentIcon !== null) {
    return Object.keys(currentIcon).length > 0;
  }
  return false;
};
function ContentIcons(props) {
  //console.log(props);
  const [popUpOpen, setPopUpOpen] = (0,external_React_.useState)(false);
  const [iconsArray, setIconsArray] = (0,external_React_.useState)(props?.iconsArray);
  const {
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  const moduleTarget = props.data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  //console.log(iconsArray);
  const modSettings = props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.["settings"];
  let item = "";
  if (props?.tab === "all_option") {
    item = {
      ...modSettings?.["dropdown_data"]?.["all_option"]
    };

    //item = {...props?.allOptArray}
  } else if (props?.tab === "reset_icon" || props?.tab === "customtext_icon") {
    item = {
      ...modSettings
    };
  } else if (props?.tab === "label") {
    item = {
      ...modSettings?.["label"]
    };
  } else if (props?.tab === "search_icon") {
    item = {
      ...modSettings?.["search_icon"]
    };
  } else if (props?.tab === "voice_icon") {
    item = {
      ...modSettings?.["voice_icon"]
    };
  } else if (props?.tab === "clear_icon") {
    item = {
      ...modSettings?.["clear_icon"]
    };
  } else {
    item = {
      ...modSettings?.["dropdown_data"]
    };
  }
  const commitLayoutFromItem = refItem => {
    if (!moduleTarget) return;
    const t = props?.tab;
    if (t === "reset_icon" || t === "customtext_icon") {
      (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        onSettingChange: props.onSettingChange,
        nextSettings: JSON.parse(JSON.stringify(refItem))
      });
      return;
    }
    const next = JSON.parse(JSON.stringify(refItem));
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        if (t === "label") {
          s.label = next;
        } else if (t === "all_option") {
          s.dropdown_data = s.dropdown_data || {};
          s.dropdown_data.all_option = next;
        } else if (t === "inactive_icon" || t === "active_icon") {
          s.dropdown_data = next;
        } else if (t === "search_icon") {
          s.search_icon = next;
        } else if (t === "voice_icon") {
          s.voice_icon = next;
        } else if (t === "clear_icon") {
          s.clear_icon = next;
        } else {
          s.dropdown_data = next;
        }
      }
    });
  };
  const searchModuleIconsKey = ['search_icon', 'voice_icon', 'clear_icon'];

  // console.log(item)
  const [searchString, setSearchString] = (0,external_React_.useState)("");
  // let icn = "";
  // if (item?.icons?.icon) {
  //   icn = item.icons.icon;
  // } else {
  //   icn = "";
  // }
  // let activetyp =""
  //   if (item?.icons?.active_type) {
  //   activetyp = item.icons.active_type;
  // } else {
  //   activetyp = "";
  // }
  // let inActivetyp =""
  //   if (item?.icons?.inactive_type) {
  //   inActivetyp = item.icons.inactive_type;
  // } else {
  //   inActivetyp = "";
  // }
  //  let iconAc =""
  //   if (item?.icons?.active_icon) {
  //   iconAc = item.icons.active_icon;
  // } else {
  //   iconAc = "";
  // }
  // let iconInAc =""
  //   if (item?.icons?.inactive_icon) {
  //   iconInAc = item.icons.inactive_icon;
  // } else {
  //   iconInAc = "";
  // }
  const [iconPosition, setIconPosition] = (0,external_React_.useState)(item?.icons?.position);
  const [dropdownIconPosition, setDropdownIconPosition] = (0,external_React_.useState)(item?.icons?.position ?? 'right');
  const [selectedIcon, setSelectedIcon] = (0,external_React_.useState)(props?.tab === "inactive_icon" ? item?.icons?.inactive_icon : props?.tab === "active_icon" ? item?.icons?.active_icon : props?.tab === "all_option" ? item?.icons?.icon : props?.tab === "label" ? item?.icons?.icon : props?.tab === "search_icon" ? item?.icon : props?.tab === "voice_icon" ? item?.icon : props?.tab === "clear_icon" ? item?.icon : props?.tab === "reset_icon" ? item?.icons?.icon : props?.tab === "customtext_icon" ? item?.icons?.icon : "");
  (0,external_React_.useEffect)(() => {
    if (props?.tab !== "label") return;
    const labelState = modSettings?.label;
    if (!labelState?.icons || labelState.icons.visibility !== true) return;
    if (!(0,filterModuleDefaults.isEmptyIconValue)(labelState.icons.icon)) return;
    const normalizedLabel = normalizeLabelIconConfig(labelState);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = normalizedLabel;
      }
    });
    setSelectedIcon(FILTER_LABEL_DEFAULT_ICON);
  }, [props?.tab, props.data, rowindex, columnindex, moduleindex]);
  (0,external_React_.useEffect)(() => {
    if (props?.tab !== "reset_icon") return;
    const resetIcons = modSettings?.icons;
    if (!resetIcons || resetIcons.visibility !== true) return;
    if (!(0,filterModuleDefaults.isEmptyIconValue)(resetIcons.icon)) return;
    const normalizedSettings = normalizeResetIconConfig(modSettings);
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      nextSettings: normalizedSettings
    });
    setSelectedIcon(filterModuleDefaults.FILTER_RESET_DEFAULT_ICON);
  }, [props?.tab, props.data, rowindex, columnindex, moduleindex]);
  (0,external_React_.useEffect)(() => {
    if (props?.tab === "all_option") {
      setSelectedIcon(item?.icons?.icon ?? "");
    }
  }, [props?.allOptArray]);
  (0,external_React_.useEffect)(() => {
    if (props?.tab !== "customtext_icon") return;
    const iconsConfig = modSettings?.icons;
    if (!iconsConfig) return;
    if (iconsConfig.type === "svg" && iconsConfig.icon?.url) {
      setSelectedIcon(iconsConfig.icon);
    } else if (typeof iconsConfig.icon === "string") {
      setSelectedIcon(iconsConfig.icon);
    }
    if (iconsConfig.position) {
      setIconPosition(iconsConfig.position);
    }
  }, [props?.tab, props.data, rowindex, columnindex, moduleindex]);
  let icons = props?.tab === "inactive_icon" || props?.tab === "active_icon" ? {
    icon_switch: true,
    active_icon: item?.icons?.active_icon,
    inactive_icon: item?.icons?.inactive_icon,
    active_type: item?.icons?.active_type,
    inactive_type: item?.icons?.inactive_type,
    position: item?.icons?.position
  } : props?.tab === "all_option" ? {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type
  } : props?.tab === "label" ? {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type,
    position: item?.icons?.position
  } : props?.tab === "reset_icon" ? {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type
  } : props?.tab === "customtext_icon" ? {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type,
    position: item?.icons?.position
  } : {};
  const getSourceIcons = () => Array.isArray(props?.iconsArray) ? props.iconsArray : [];
  const resetIconLibrarySearch = () => {
    setSearchString("");
    setIconsArray([...getSourceIcons()]);
  };
  const handlePopUpChange = newOpen => {
    if (newOpen) {
      resetIconLibrarySearch();
    }
    setPopUpOpen(newOpen);
  };
  const handlePositionChange = value => {
    setIconPosition(value);
    let ic = {
      ...icons
    };
    ic.position = value;
    item.icons = {
      ...icons,
      ...ic
    };
    if (props?.tab === "label" || props?.tab === "customtext_icon") {
      commitLayoutFromItem(item);
    }
  };
  const handleDrpdownPositionChange = value => {
    setDropdownIconPosition(value);
    let ic = {
      ...icons
    };
    ic.position = value;
    item.icons = {
      ...icons,
      ...ic
    };
    commitLayoutFromItem(item);
  };
  const handleIconSearch = e => {
    const searchValue = e.target.value;
    setSearchString(searchValue);
    const sourceIcons = getSourceIcons();
    const newArray = sourceIcons.filter(function (item) {
      return item.toString().toLowerCase().includes(searchValue.toString().toLowerCase());
    });
    setIconsArray([...newArray]);
  };
  const handleIconSelect = (icon, remove = "") => {
    const safeIcon = (props?.tab === "label" || props?.tab === "reset_icon") && icon === "" ? props?.tab === "label" ? FILTER_LABEL_DEFAULT_ICON : filterModuleDefaults.FILTER_RESET_DEFAULT_ICON : icon;
    setSelectedIcon(safeIcon);
    //setIconPosition(remove == '1' ? `before-${props.labelType || module?.key}` : item?.icons?.position);
    if (searchModuleIconsKey.includes(props?.tab)) {
      item.icon = icon;
      item.type = "icon";
    } else {
      let ic = {
        ...icons
      };
      if (props?.tab === "inactive_icon" || props?.tab === "active_icon") {
        ic[props?.tab] = icon;
        ic[props.type] = "icon";
      } else if (props?.tab === "all_option") {
        ic.icon = icon;
        ic.type = "icon";
      } else if (props?.tab === "label") {
        ic.icon = safeIcon;
        ic.type = "icon";
      } else if (props?.tab === "reset_icon") {
        ic.icon = safeIcon;
        ic.type = "icon";
      } else if (props?.tab === "customtext_icon") {
        ic.icon = icon;
        ic.type = "icon";
      }

      //ic.position = remove == '1' ? `before-${props.labelType || module?.key}` : item?.icons?.position;
      item.icons = {
        ...icons,
        ...ic
      };
      // if (props?.moduleIcon === "custom-field-label") {
      //   items[rowindex].data[columnindex].data[moduleindex]["settings"]["label"] =
      //     item;
      // } else {
    }
    if (moduleTarget) {
      commitLayoutFromItem(item);
    }
    //}
    //console.log(props.data)
    resetIconLibrarySearch();
    setPopUpOpen(false);
  };
  let img = "";
  const [selected, setSelected] = (0,external_React_.useState)(img);
  const canUseWpMedia = typeof window !== "undefined" && typeof window.wp?.media === "function";
  let customMediaLibrary1 = null;
  if (canUseWpMedia) {
    customMediaLibrary1 = window.wp.media({
      // Accepts [ 'select', 'post', 'image', 'audio', 'video' ]
      // Determines what kind of library should be rendered.
      frame: "select",
      // Modal title.
      title: "Select Images",
      // Enable/disable multiple select
      multiple: false,
      // Library wordpress query arguments.
      library: {
        order: "DESC",
        // [ 'name', 'author', 'date', 'title', 'modified', 'uploadedTo', 'id', 'post__in', 'menuOrder' ]
        orderby: "date",
        // mime type. e.g. 'image', 'image/jpeg'
        type: cafUploadedIcon.CAF_UPLOADED_ICON_MEDIA_TYPES,
        // Searches the attachment title.
        search: null,
        // Includes media only uploaded to the specified post (ID)
        uploadedTo: null // wp.media.view.settings.post.id (for current post ID)
      },
      button: {
        text: "Done"
      }
    });
  }
  const handleWpUploader1 = () => {
    if (!customMediaLibrary1) {
      return;
    }
    customMediaLibrary1.open();
    // Wait for uploader to initialize
  };
  if (customMediaLibrary1) {
    customMediaLibrary1.on("open", function () {
      var selectedImageIDs = selected;
      var selectionAPI = customMediaLibrary1.state().get("selection");
      var attachment = wp.media.attachment(selected?.id);
      selectionAPI.add(attachment ? [attachment] : []);
    });
    customMediaLibrary1.on("select", function () {
      var selectedImage = customMediaLibrary1.state().get("selection").first().toJSON();
      const isAllowedUpload = (0,cafUploadedIcon.isCafUploadedIconUrl)(selectedImage?.url);
      if (!isAllowedUpload) return;
      setSelectedIcon(selectedImage);
      if (searchModuleIconsKey.includes(props?.tab)) {
        item.icon = selectedImage;
        item.type = "svg";
      } else {
        let ic = {
          ...icons
        };
        if (props?.tab === "inactive_icon" || props?.tab === "active_icon") {
          ic[props?.tab] = selectedImage;
          ic[props.type] = "svg";
        } else if (props?.tab === "all_option") {
          ic.icon = selectedImage;
          ic.type = "svg";
        } else if (props?.tab === "label") {
          ic.icon = selectedImage;
          ic.type = "svg";
        } else if (props?.tab === "reset_icon") {
          ic.icon = selectedImage;
          ic.type = "svg";
        } else if (props?.tab === "customtext_icon") {
          ic.icon = selectedImage;
          ic.type = "svg";
        }
        item.icons = {
          ...icons,
          ...ic
        };
      }
      if (moduleTarget) {
        commitLayoutFromItem(item);
      }
      //}
    });
  }
  //console.log(item)
  const content = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "icon-popover-content",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      class: "module-content-tab-row",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "icons-search",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
          placeholder: "Search icon",
          onChange: handleIconSearch,
          value: searchString
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "icons-map",
        children: iconsArray && iconsArray?.map((icon, index) => {
          //console.log(icon,index);
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
              "data-icon-name": icon,
              value: icon,
              className: `${icon} ${selectedIcon === icon ? "active" : ""}`,
              onClick: () => handleIconSelect(icon)
            })
          });
        })
      })]
    })
  });
  //console.log(item);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: `caf-icon-container ${props?.tab === "all_option" ? "all-opt" : ""}`,
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "icon-container-wrapper",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "icon-wrapper-fa",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [(props?.tab === "inactive_icon" || props?.tab === "active_icon" ? item?.icons?.[props.type] === "icon" : props?.tab === "all_option" ? item?.icons?.type === "icon" : props?.tab === "label" ? item?.icons?.type === "icon" : props?.tab === "reset_icon" ? item?.icons?.type === "icon" : props?.tab === "customtext_icon" ? item?.icons?.type === "icon" : props?.tab === "search_icon" && item?.icon !== "" ? item?.type === "icon" : props?.tab === "voice_icon" && item?.icon !== "" ? item?.type === "icon" : props?.tab === "clear_icon" && item?.icon !== "" ? item?.type === "icon" : false) ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
              "data-icon-name": selectedIcon,
              value: selectedIcon,
              className: selectedIcon
            }) : selectedIcon?.url && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
              src: selectedIcon.url,
              alt: ""
            }), props?.tab === "search_icon" && item?.type === "icon" && item?.icon === "" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
              "data-icon-name": "fas fa-search",
              value: "fas fa-search",
              className: "fas fa-search",
              "caf-icon": "default"
            }), props?.tab === "voice_icon" && item?.type === "icon" && item?.icon === "" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
              "data-icon-name": "fas fa-microphone",
              value: "fas fa-microphone",
              className: "fas fa-microphone",
              "caf-icon": "default"
            }), props?.tab === "clear_icon" && item?.type === "icon" && item?.icon === "" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
              "data-icon-name": "fas fa-times",
              value: "fas fa-times",
              className: "fas fa-times",
              "caf-icon": "default"
            })]
          })
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "icon-container-header",
        children: [(props?.tab === "inactive_icon" || props?.tab === "active_icon") && (typeof item?.icons?.[props?.tab] === "string" && item.icons?.[props?.tab] !== "" || typeof item?.icons?.[props?.tab] === "object" && item.icons?.[props?.tab] !== null && Object.keys(item.icons?.[props?.tab]).length > 0) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        }), props?.tab === "all_option" && (typeof item?.icons?.icon === "string" && item.icons?.icon !== "" || typeof item?.icons?.icon === "object" && item.icons?.icon !== null && Object.keys(item.icons?.icon).length > 0) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        }), props?.tab === "label" && shouldShowLabelDeleteButton(item?.icons) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        }), props?.tab === "reset_icon" && shouldShowResetDeleteButton(item?.icons) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        }), props?.tab === "customtext_icon" && (typeof item?.icons?.icon === "string" && item.icons?.icon !== "" || typeof item?.icons?.icon === "object" && item.icons?.icon !== null && Object.keys(item.icons?.icon).length > 0) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        }), props?.tab === "search_icon" && (typeof item?.icon === "string" && item?.icon !== "" || typeof item?.icon === "object" && item?.icon !== null && Object.keys(item?.icon).length > 0) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        }), props?.tab === "voice_icon" && (typeof item?.icon === "string" && item?.icon !== "" || typeof item?.icon === "object" && item?.icon !== null && Object.keys(item?.icon).length > 0) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        }), props?.tab === "clear_icon" && (typeof item?.icon === "string" && item?.icon !== "" || typeof item?.icon === "object" && item?.icon !== null && Object.keys(item?.icon).length > 0) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          shape: "circle",
          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DeleteOutlined["default"], {}),
          onClick: () => handleIconSelect("", "1")
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: `icon-container-footer ${props?.tab === "active_icon" ? 'drp-active-icon' : ""}`,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(popover["default"], {
          destroyOnHidden: true,
          placement: "bottom",
          content: content,
          title: "Icons",
          trigger: "click",
          open: popUpOpen,
          onOpenChange: handlePopUpChange,
          classNames: {
            root: "caf-filter-dropdown-icons-popover"
          },
          getPopupContainer: triggerNode => triggerNode.closest(".caf-icon-container") || document.body,
          overlayStyle: {
            insetInline: "auto !important"
          },
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
            className: "ic-lib",
            children: "Icon Library"
          })
        }), props?.tab !== "active_icon" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
          className: "ic-lib",
          onClick: handleWpUploader1,
          children: "Upload Image"
        })]
      })]
    }), props?.tab === "customtext_icon" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-content-tab-row caf-design-two-half",
      style: {
        marginTop: "20px"
      },
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Choose icon placement relative to custom text.",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          children: "Icon Position"
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
        style: {
          width: "100%"
        },
        onChange: handlePositionChange,
        value: iconPosition || "before-customtext",
        options: [{
          value: "before-customtext",
          label: "Before Text"
        }, {
          value: "after-customtext",
          label: "After Text"
        }]
      })]
    }), props?.tab === "active_icon" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      class: "module-content-tab-row caf-design-two-half",
      style: {
        marginTop: "20px"
      },
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Choose icon placement.",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          children: "Icon Position"
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
        defaultValue: item?.icons?.position,
        style: {
          width: "100%"
        },
        onChange: handleDrpdownPositionChange,
        value: dropdownIconPosition,
        options: [{
          value: `left`,
          label: "Left"
        }, {
          value: `right`,
          label: "Right"
        }]
      })]
    })]
  });
}
/* harmony default export */ const ContentIcons1 = (ContentIcons);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/DropDownIcons.js




const DropDownIcons = props => {
  const {
    type,
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  let mainData = [...props.data];
  let settingData = {
    ...mainData[rowindex]?.data[columnindex]?.data[moduleindex]?.settings
  };
  let dropdownData = {
    ...settingData?.dropdown_data
  };
  const [iconsArrayActive, setIconsArrayActive] = (0,external_React_.useState)(props?.iconsArray);
  const [iconsArrayInActive, setIconsArrayInActive] = (0,external_React_.useState)(props?.iconsArray);
  const [state, setState] = (0,external_React_.useState)({
    iconSwitch: dropdownData.icons?.icon_switch,
    activeIcon: dropdownData.icons?.active_icon,
    inActiveIcon: dropdownData.icons?.inactive_icon,
    searchActive: '',
    searchInActive: ''
  });
  const [iconTabs, setIconTabs] = (0,external_React_.useState)('active');
  const handleIconSelectActive = icon => {
    setState(prev => ({
      ...prev,
      activeIcon: icon
    }));
    dropdownData.icons.active_icon = icon;
    settingData['dropdown_data'] = dropdownData;
    mainData[rowindex].data[columnindex].data[moduleindex].settings = settingData;
    props.onSettingChange(mainData);
  };
  const handleIconSelectInActive = icon => {
    setState(prev => ({
      ...prev,
      inActiveIcon: icon
    }));
    dropdownData.icons.inactive_icon = icon;
    settingData['dropdown_data'] = dropdownData;
    mainData[rowindex].data[columnindex].data[moduleindex].settings = settingData;
    props.onSettingChange(mainData);
  };
  const onIconSwitch = checked => {
    if (checked) {
      setState(prev => ({
        ...prev,
        iconSwitch: checked
      }));
    } else {
      setState(prev => ({
        ...prev,
        iconSwitch: checked,
        activeIcon: '',
        inActiveIcon: ''
      }));
      dropdownData.icons.active_icon = '';
      dropdownData.icons.inactive_icon = '';
      dropdownData.icons.active_type = 'icon';
      dropdownData.icons.inactive_type = '';
    }
    dropdownData.icons.icon_switch = checked;
    settingData['dropdown_data'] = dropdownData;
    mainData[rowindex].data[columnindex].data[moduleindex].settings = settingData;
    props.onSettingChange(mainData);
  };
  const handleIconSearchActive = e => {
    const searchValue = e.target.value;
    setState(prev => ({
      ...prev,
      searchActive: searchValue
    }));
    let newArray = props?.iconsArray.filter(function (item) {
      return item.toString().toLowerCase().includes(searchValue.toString().toLowerCase());
    });
    setIconsArrayActive([...newArray]);
  };
  const handleIconSearchInActive = e => {
    const searchValue = e.target.value;
    setState(prev => ({
      ...prev,
      searchInActive: searchValue
    }));
    let newArray = props?.iconsArray.filter(function (item) {
      return item.toString().toLowerCase().includes(searchValue.toString().toLowerCase());
    });
    setIconsArrayInActive([...newArray]);
  };
  const onChangeIconsTab = tab => {
    setIconTabs(tab);
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      class: "module-content-tab-row caf-design-two-half",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: `Configure ${String(props.title || "dropdown icons").toLowerCase()}.`,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          children: props.title
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "module-content-icon-switch",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
          onChange: onIconSwitch,
          checked: state.iconSwitch
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      class: "module-content-tab-row",
      children: state.iconSwitch && iconTabs === "active" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ContentIcons1, {
          title: "Icons",
          data: props.data,
          indexes: props.indexes,
          iconsArray: props?.iconsArray,
          onSettingChange: props.onSettingChange,
          tab: "active_icon",
          type: "active_type"
        })
      }) : ""
    })]
  });
};
/* harmony default export */ const ContentComponents_DropDownIcons = (DropDownIcons);
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/LabelIcons.js
var LabelIcons = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/LabelIcons.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/SelectMain.js
var SelectMain = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/SelectMain.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/SwitchMain.js
var SwitchMain = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/SwitchMain.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/termVisualUtils.js
var termVisualUtils = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/termVisualUtils.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/termCountUtils.js
var termCountUtils = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/termCountUtils.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/TermColorPickerTrigger.js
var TermColorPickerTrigger = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/TermColorPickerTrigger.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/useResolvedMainBuilderData.js
var useResolvedMainBuilderData = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/useResolvedMainBuilderData.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/styleData.js
var FilterComponents_styleData = __webpack_require__("./src/MainComponents/FilterComponents/styleData.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/modules-output/shared/termShowMoreUtils.js
var termShowMoreUtils = __webpack_require__("./src/MainComponents/FilterComponents/components/modules-output/shared/termShowMoreUtils.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/TermTaxonomyLabelText.js
var TermTaxonomyLabelText = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/TermTaxonomyLabelText.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/taxonomyPickerSections.js
var ModuleContentData_taxonomyPickerSections = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/taxonomyPickerSections.js");
// EXTERNAL MODULE: ./node_modules/@ant-design/icons/es/icons/PlusOutlined.js
var PlusOutlined = __webpack_require__("./node_modules/@ant-design/icons/es/icons/PlusOutlined.js");
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/extends.js
var esm_extends = __webpack_require__("./node_modules/@babel/runtime/helpers/esm/extends.js");
;// ./node_modules/@ant-design/icons-svg/es/asn/StarFilled.js
// This icon file is generated automatically.
var StarFilled = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" } }] }, "name": "star", "theme": "filled" };
/* harmony default export */ const asn_StarFilled = (StarFilled);

// EXTERNAL MODULE: ./node_modules/@ant-design/icons/es/components/AntdIcon.js + 16 modules
var AntdIcon = __webpack_require__("./node_modules/@ant-design/icons/es/components/AntdIcon.js");
;// ./node_modules/@ant-design/icons/es/icons/StarFilled.js

// GENERATE BY ./scripts/generate.ts
// DON NOT EDIT IT MANUALLY




var StarFilled_StarFilled = function StarFilled(props, ref) {
  return /*#__PURE__*/external_React_.createElement(AntdIcon["default"], (0,esm_extends["default"])({}, props, {
    ref: ref,
    icon: asn_StarFilled
  }));
};

/**![star](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNjYWNhY2EiIHZpZXdCb3g9IjY0IDY0IDg5NiA4OTYiIGZvY3VzYWJsZT0iZmFsc2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkwOC4xIDM1My4xbC0yNTMuOS0zNi45TDU0MC43IDg2LjFjLTMuMS02LjMtOC4yLTExLjQtMTQuNS0xNC41LTE1LjgtNy44LTM1LTEuMy00Mi45IDE0LjVMMzY5LjggMzE2LjJsLTI1My45IDM2LjljLTcgMS0xMy40IDQuMy0xOC4zIDkuM2EzMi4wNSAzMi4wNSAwIDAwLjYgNDUuM2wxODMuNyAxNzkuMS00My40IDI1Mi45YTMxLjk1IDMxLjk1IDAgMDA0Ni40IDMzLjdMNTEyIDc1NGwyMjcuMSAxMTkuNGM2LjIgMy4zIDEzLjQgNC40IDIwLjMgMy4yIDE3LjQtMyAyOS4xLTE5LjUgMjYuMS0zNi45bC00My40LTI1Mi45IDE4My43LTE3OS4xYzUtNC45IDguMy0xMS4zIDkuMy0xOC4zIDIuNy0xNy41LTkuNS0zMy43LTI3LTM2LjN6IiAvPjwvc3ZnPg==) */
var RefIcon = /*#__PURE__*/external_React_.forwardRef(StarFilled_StarFilled);
if (true) {
  RefIcon.displayName = 'StarFilled';
}
/* harmony default export */ const icons_StarFilled = (RefIcon);
// EXTERNAL MODULE: ./node_modules/@ant-design/icons/es/icons/StarOutlined.js + 1 modules
var StarOutlined = __webpack_require__("./node_modules/@ant-design/icons/es/icons/StarOutlined.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/termIconUtils.js
const termHasIcon = icons => {
  if (!icons || typeof icons !== "object") return false;
  const iconValue = icons.icon;
  if (typeof iconValue === "string" && iconValue.trim() !== "") {
    return true;
  }
  if (iconValue && typeof iconValue === "object") {
    if (iconValue.url) return true;
    return Object.keys(iconValue).length > 0;
  }
  return false;
};
const getTermIconPreviewSrc = icons => {
  if (!termHasIcon(icons)) return "";
  const iconValue = icons.icon;
  if (typeof iconValue === "string") return iconValue;
  if (iconValue?.url) return iconValue.url;
  if (iconValue?.icon?.url) return iconValue.icon.url;
  return "";
};
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/CustomFieldValueRowActions.js





const CustomFieldValueRowActions = ({
  showIconControl = false,
  valueIcons,
  isDefault = false,
  onOpenSettings,
  onToggleDefault
}) => {
  const hasIcon = termHasIcon(valueIcons);
  const iconPreviewSrc = getTermIconPreviewSrc(valueIcons);
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
    className: "caf-term-row-actions",
    onClick: event => event.stopPropagation(),
    children: [showIconControl && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
      classNames: {
        root: "caf-builder-tooltip"
      },
      placement: "topLeft",
      title: hasIcon ? "Edit value icon" : "Add value icon",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: `caf-term-icon-trigger ${hasIcon ? "has-icon" : ""}`,
        "aria-label": hasIcon ? "Edit value icon" : "Add value icon",
        onClick: onOpenSettings,
        children: !hasIcon ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlusOutlined["default"], {}) : valueIcons?.type === "svg" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
          src: iconPreviewSrc,
          alt: ""
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
          className: valueIcons.icon,
          "aria-hidden": "true"
        })
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
      classNames: {
        root: "caf-builder-tooltip"
      },
      placement: "topLeft",
      title: isDefault ? "Remove as default value" : "Mark this value as selected by default",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("button", {
        type: "button",
        className: `caf-term-default-star ${isDefault ? "is-active" : ""}`,
        "aria-label": isDefault ? "Remove as default value" : "Set as default value",
        "aria-pressed": isDefault,
        onClick: onToggleDefault,
        children: isDefault ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(icons_StarFilled, {}) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(StarOutlined["default"], {})
      })
    })]
  });
};
/* harmony default export */ const ModuleContentData_CustomFieldValueRowActions = (CustomFieldValueRowActions);
// EXTERNAL MODULE: ./node_modules/@ant-design/icons/es/icons/EditOutlined.js + 1 modules
var EditOutlined = __webpack_require__("./node_modules/@ant-design/icons/es/icons/EditOutlined.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/CfValueLabelWithEdit.js




const CfValueLabelWithEdit = ({
  label,
  onEdit
}) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
  className: "caf-filter-query-cf-value-title",
  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
    className: "caf-filter-query-cf-value-label-group",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyLabelText["default"], {
      name: label
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
      className: "caf-filter-query-cf-value-edit",
      onClick: event => {
        event.stopPropagation();
        onEdit();
      },
      role: "button",
      tabIndex: 0,
      "aria-label": "Edit value label",
      onKeyDown: event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onEdit();
        }
      },
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(EditOutlined["default"], {})
    })]
  })
});
/* harmony default export */ const ModuleContentData_CfValueLabelWithEdit = (CfValueLabelWithEdit);
// EXTERNAL MODULE: ./src/MainComponents/images/caution-sign.svg
var caution_sign = __webpack_require__("./src/MainComponents/images/caution-sign.svg");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/filterModuleTier.js + 1 modules
var filterModuleTier = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/filterModuleTier.js");
// EXTERNAL MODULE: ./src/tier/TierLockedWrap.js
var TierLockedWrap = __webpack_require__("./src/tier/TierLockedWrap.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermShowMoreProPanel.js
var FilterTermShowMoreProPanel = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermShowMoreProPanel.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermRowProActions.js
var FilterTermRowProActions = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermRowProActions.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermIconSettingsModal.js
var FilterTermIconSettingsModal = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermIconSettingsModal.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterCfTermIconSettingsModal.js
var FilterCfTermIconSettingsModal = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterCfTermIconSettingsModal.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterLabelShowIconProPanel.js
var FilterLabelShowIconProPanel = __webpack_require__("./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterLabelShowIconProPanel.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterLabelCollapseProPanel.js



function FilterLabelCollapseProPanel() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "module-content-tab-row caf-design-two-half",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
      children: "Enable Collapse"
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
      checked: false,
      disabled: true
    })]
  });
}
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterShowIconModeProPanel.js



/** Static locked icon-mode chrome; Free colour swatches remain in the parent. */

function FilterShowIconModeProPanel({
  label = "Show Icon"
}) {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "module-content-tab-row",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-content-tab-row caf-design-two-half",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Icon mode is available in Category Ajax Filter Pro.",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          children: label
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "module-content-icon-switch",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
          checked: false,
          disabled: true
        })
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
      className: "setting-hr-main"
    })]
  });
}
// EXTERNAL MODULE: ./src/tier/capabilities.js
var capabilities = __webpack_require__("./src/tier/capabilities.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/utils/filterBuilderUiFlags.js
var filterBuilderUiFlags = __webpack_require__("./src/MainComponents/FilterComponents/utils/filterBuilderUiFlags.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/woocommerce/wooAttributeColorImport.js + 5 modules
var wooAttributeColorImport = __webpack_require__("./src/MainComponents/FilterComponents/components/woocommerce/wooAttributeColorImport.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/FilterTypes/DropdownFilter.js






































const normalizeCustomFieldData = value => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};
const getPlainTextFromHtml = html => {
  const value = String(html ?? "");
  return value.replace(/<[^>]+>/g, "").trim();
};
const DropdownFilter1 = (0,external_React_.memo)(props => {
  const {
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  const mainBuilderData = (0,useResolvedMainBuilderData.useResolvedMainBuilderData)(props.mainBuilderData);
  let items = [...props.data];
  let settingData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.settings
  };
  const resolvedPostType = (0,useResolvedMainBuilderData.getResolvedFilterPostType)(mainBuilderData, settingData?.post_type);
  let styleData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.style
  };
  let selectedDevice = props.selectedDevice;
  const singlePostData = (0,useResolvedMainBuilderData.getResolvedSinglePostData)(mainBuilderData);
  const [postType, setPostType] = (0,external_React_.useState)(resolvedPostType);
  const [taxonomyList, setTaxonomyList] = (0,external_React_.useState)([]);
  //   const [filterType, setFilterType] = useState(settingData.filter_type);

  let meta_fields = singlePostData?.meta_fields;
  let fieldOptions = [{
    label: "Select Field",
    value: "0"
  }];
  if (meta_fields) {
    Object.keys(meta_fields)?.map((item, i) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
      children: fieldOptions.push({
        value: item,
        label: item
      })
    }));
  }
  const [dataSource, setDataSource] = (0,external_React_.useState)((0,filterModuleTier.resolveFilterDataSource)(settingData.data_source));
  const effectiveDataSource = (0,filterModuleTier.canUseFilterCustomField)() ? dataSource : "taxonomy";
  const {
    importLoading: wooColorImportLoading,
    resetLoading: wooColorResetLoading,
    handleImport: handleImportWooColors,
    handleReset: handleResetWooColors
  } = (0,wooAttributeColorImport.useWooAttributeColorActions)({
    data: props.data,
    rowindex,
    columnindex,
    moduleindex,
    resolvedPostType,
    onSettingChange: props.onSettingChange,
    onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
  });
  const [termSettingPopUp, setTermSettingPopUp] = (0,external_React_.useState)(false);
  const [termSettingPopUpCusFieldLabel, setTermSettingPopUpCusFieldLabel] = (0,external_React_.useState)(false);
  const [termSettingPopUpCusFieldIcon, setTermSettingPopUpCusFieldIcon] = (0,external_React_.useState)(false);
  const [termPredefinedCusField, setTermPredefinedCusField] = (0,external_React_.useState)(false);
  const [termDetail, setTermDetail] = (0,external_React_.useState)([]);
  const [termPredefined, setTermPredefined] = (0,external_React_.useState)(false);
  const [isParent, setIsParent] = (0,external_React_.useState)(false);
  const [iconsArray, setIconsArray] = (0,external_React_.useState)("");
  const [isLoading, setIsLoading] = (0,external_React_.useState)(false);
  const [LoadingCatogries, setLoadingCatogries] = (0,external_React_.useState)(true);
  const [contentIconDetail, setcontentIconDetail] = (0,external_React_.useState)({
    icon: "",
    position: "before",
    iconChecked: true,
    type: 'icon'
  });
  const [allIconSwitch, setAllIconSwitch] = (0,external_React_.useState)((0,filterModuleTier.canUseFilterShowIcon)() ? settingData?.dropdown_data?.all_option?.icons?.visibility : false);
  const [allOptArray, setAllOptArray] = (0,external_React_.useState)(settingData?.dropdown_data?.all_option);
  const [allOptEnable, setAllOptEnable] = (0,external_React_.useState)(settingData?.dropdown_data?.all_option?.is_enable === "true" ? true : false);
  const [iconSwitch, setIconSwitch] = (0,external_React_.useState)("");
  const [selectedIcon, setSelectedIcon] = (0,external_React_.useState)("");
  const [labelIconSwitch, setLabelIconSwitch] = (0,external_React_.useState)((0,filterModuleTier.canUseLabelShowIcon)() ? settingData?.label?.icons?.visibility : false);
  // custom field
  const [contentIconDetailCusField, setcontentIconDetailCusField] = (0,external_React_.useState)({
    icon: "",
    position: "before",
    iconChecked: false
  });
  const [iconSwitchCusField, setIconSwitchCusField] = (0,external_React_.useState)("");
  const [selectedIconCusField, setSelectedIconCusField] = (0,external_React_.useState)("");
  const [currCustomFieldValue, setCurrCustomFieldValue] = (0,external_React_.useState)([]);
  const [checkError, setCheckError] = (0,external_React_.useState)(false);
  const [metaKeys, setMetaKeys] = (0,external_React_.useState)([]);
  const [checkLabel, setCheckLabel] = (0,external_React_.useState)(settingData.label.is_label === "false" ? false : true);
  const [labelInput, setLabelInput] = (0,external_React_.useState)(settingData.label.value);
  const [toggle, setToggle] = (0,external_React_.useState)(() => (0,filterModuleTier.resolveFilterLabelCollapseToggleState)(settingData));
  const [allOptionInput, setAllOptionInput] = (0,external_React_.useState)(settingData.dropdown_data.all_option.value);
  const [customFieldKey, setCustomFieldKey] = (0,external_React_.useState)(settingData?.custom_field_data?.custom_field_key || (Array.isArray(settingData?.custom_field_data) ? settingData.custom_field_data?.[0]?.custom_field_key : ""));
  const [openCfRows, setOpenCfRows] = (0,external_React_.useState)({});
  const [openCfAdv, setOpenCfAdv] = (0,external_React_.useState)({});
  const [customFieldValue, setCustomFieldValue] = (0,external_React_.useState)("");
  const [customFieldArray, setCustomFieldArray] = (0,external_React_.useState)(normalizeCustomFieldData(settingData.custom_field_data));
  const [compareOperator, setCompareOperator] = (0,external_React_.useState)(settingData?.custom_field_data?.compare_operator || (Array.isArray(settingData?.custom_field_data) ? settingData.custom_field_data?.[0]?.compare_operator : "="));
  const [keyValueCf, setKeyValueCf] = (0,external_React_.useState)("");
  const [labelValueCf, setLabelValueCf] = (0,external_React_.useState)("");
  const [taxonomyListArray, setTaxonomyListArray] = (0,external_React_.useState)([]);
  const productFiltersLocked = !(0,filterModuleTier.canUseWooProductFilters)();
  const showProductFiltersSection = String(resolvedPostType || "") === "product" && (0,capabilities.isWooCommerceActive)() && (0,capabilities.canUseProductPostType)();
  const taxonomyPickerSections = (0,external_React_.useMemo)(() => (0,ModuleContentData_taxonomyPickerSections.getTaxonomyPickerSections)(taxonomyListArray, {
    ensureProductFiltersSection: showProductFiltersSection && productFiltersLocked,
    productFiltersLocked: showProductFiltersSection && productFiltersLocked
  }), [taxonomyListArray, showProductFiltersSection, productFiltersLocked]);
  const [firstRender, setFirstRender] = (0,external_React_.useState)(true);
  const [expandedTaxoItems, setExpandedTaxoItems] = (0,external_React_.useState)([]);
  const [expandedItems, setExpandedItems] = (0,external_React_.useState)([]);
  const [allOptModal, setAllOptModal] = (0,external_React_.useState)(false);
  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";

  // useEffect(() => {
  //   let value = "";
  //   if (customFieldArray.length > 0) {
  //     value = customFieldArray.reduce(
  //       (accu, curr) => accu + `${curr.key},`,
  //       ""
  //     );
  //     setCustomFieldValue(value);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (props.saveLayoutClick == true) {
  //     setTimeout(() => {
  //       props.setSaveLayoutClick(false);
  //     }, 600);
  //   }
  //   setCustomFieldKey(settingData.custom_field_data.custom_field_key);
  //   setCustomFieldArray(settingData.custom_field_data.custom_field_value);
  //   if (settingData.custom_field_data.custom_field_value?.length == 0) {
  //     setCustomFieldValue("");
  //   }
  // }, [settingData]);
  (0,external_React_.useEffect)(() => {
    setTaxonomyList(settingData?.taxonomy_data);
  }, [settingData?.taxonomy_data]);
  (0,external_React_.useEffect)(() => {
    setDataSource(settingData.data_source);
  }, [settingData.data_source]);
  (0,external_React_.useEffect)(() => {
    const normalizedCustomFields = normalizeCustomFieldData(settingData?.custom_field_data);
    setCustomFieldArray(normalizedCustomFields);
    setCompareOperator(settingData?.custom_field_data?.compare_operator || normalizedCustomFields?.[0]?.compare_operator || "=");
    setCustomFieldKey(settingData?.custom_field_data?.custom_field_key || normalizedCustomFields?.[0]?.custom_field_key || "");
    const pruneCollapseState = (prev, length) => {
      const next = {
        ...prev
      };
      Object.keys(next).forEach(key => {
        if (Number(key) >= length) {
          delete next[key];
        }
      });
      return next;
    };
    setOpenCfRows(prev => pruneCollapseState(prev, normalizedCustomFields.length));
    setOpenCfAdv(prev => pruneCollapseState(prev, normalizedCustomFields.length));
  }, [settingData?.custom_field_data]);
  (0,external_React_.useEffect)(() => {
    setCheckError(false);
  }, [iconSwitch, iconSwitchCusField]);

  // useEffect(() => {
  //   if (settingData?.label?.icons?.icon == "") {
  //     settingData.label.icons.visibility = false;
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //       settingData;
  //     props.onSettingChange(props.data);
  //   }
  // }, [checkLabel]);

  (0,external_React_.useEffect)(() => {
    let icons = {};
    if (termDetail?.length > 0) {
      if (termDetail[6] && termDetail[6]?.predefine == "true") {
        setTermPredefined(true);
      } else {
        setTermPredefined(false);
      }
      icons = termDetail[6].icons;
      const colorMode = (0,termVisualUtils.isTermVisualColor)({
        ...settingData,
        post_type: resolvedPostType
      });
      const swatchColor = (0,termVisualUtils.getTermSwatchColor)(icons);
      if (colorMode) {
        setIconSwitch(Boolean(swatchColor));
        setcontentIconDetail({
          icon: swatchColor || "#000000",
          position: icons?.position || "before",
          iconChecked: Boolean(swatchColor),
          type: "color"
        });
        setSelectedIcon(swatchColor || "");
        setCheckError(false);
        return;
      }
      const iconSource = icons?.type === "color" && icons?.icon_backup ? icons.icon_backup : icons;
      setIconSwitch(iconSource?.icon ? true : false);
      if (iconSource && Object?.keys(iconSource).length !== 0) {
        let data = contentIconDetail;
        data.icon = iconSource.icon;
        data.position = icons?.position || iconSource.position || "before";
        data.iconChecked = true;
        data.type = iconSource.type || "icon";
        setcontentIconDetail(data);
      }
      if (iconSource?.type === 'icon') {
        setSelectedIcon(iconSource?.icon ? iconSource.icon : "");
      } else {
        // console.log("aa1",icons.icon.icon.url);
        setSelectedIcon(iconSource?.icon?.icon?.url ? iconSource.icon.icon.url : iconSource?.icon?.url || "");
      }
      setCheckError(false);
    } else {
      return;
    }
  }, [termDetail[0]]);
  (0,external_React_.useEffect)(() => {
    let valueData = currCustomFieldValue[2];
    setKeyValueCf(valueData?.key || "");
    setLabelValueCf(valueData?.label || "");
    if (valueData && valueData.predefine === "true") {
      setTermPredefinedCusField(true);
    } else {
      setTermPredefinedCusField(false);
    }
    let icons = {};
    if (valueData && Object?.keys(valueData).length !== 0) {
      icons = valueData?.icons || {};
      let data = contentIconDetailCusField;
      data.icon = icons?.icon || "";
      data.position = icons?.position || "before";
      data.iconChecked = true;
      data.type = icons?.type || "icon";
      setcontentIconDetailCusField(data);
    }
    if (icons?.type === 'icon') {
      setSelectedIconCusField(icons?.icon ? icons.icon : "");
    } else {
      setSelectedIconCusField(icons?.icon?.icon?.url ? icons.icon.icon.url : "");
    }
    setCheckError(false);
  }, [currCustomFieldValue[0], currCustomFieldValue[1]]);
  (0,external_React_.useEffect)(() => {
    const fetchIcons = async () => {
      try {
        const response = await client["default"].get(icons_url);
        if (response.data) {
          setIconsArray(response.data);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };
    fetchIcons();
  }, []);
  (0,external_React_.useEffect)(() => {
    setPostType(resolvedPostType);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, [resolvedPostType]);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await apiClient.get(
  //           baseURL + "get-taxonomy/?post-type=" + postType
  //         );
  //         if (response.data && response.data.status === "success") {
  //           setTaxonomyList(response.data.taxonomy_list);
  //           //setIsLoading(true);
  //           TemrsRefresh();
  //         }
  //       } catch (error) {
  //         console.error("Error fetching data:", error.message);
  //       }
  //     };
  //     fetchData();
  //   }, [postType]);

  const onAllIconSwitch = checked => {
    if (!(0,filterModuleTier.canUseFilterShowIcon)()) {
      return;
    }
    let itm = {
      ...settingData?.dropdown_data?.all_option
    };
    setAllIconSwitch(checked);
    let ic = {
      ...itm?.icons
    };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
    }
    ic.visibility = checked;
    itm.icons = {
      ...itm?.icons,
      ...ic
    };
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.dropdown_data = s.dropdown_data || {};
        s.dropdown_data.all_option = itm;
      }
    });
  };
  const onChange = e => {
    const value = e.target.value;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        if (!Array.isArray(s.taxonomy_data)) {
          s.taxonomy_data = [];
        }
        if (s.post_type != postType && s.taxonomy_data.length > 0) {
          s.taxonomy_data = [];
        }
        const isValuePresent = s.taxonomy_data?.some(obj => Object.values(obj).includes(value));
        if (isValuePresent) {
          s.taxonomy_data = s.taxonomy_data.filter(element => element.key !== value);
        } else {
          const itemData = {
            key: value,
            term_data: []
          };
          s.taxonomy_data.push(itemData);
          s.post_type = postType;
        }
      }
    });
    setTimeout(() => {
      func();
    }, 500);
    TermChecked();
  };
  (0,external_React_.useEffect)(() => {
    let fieldOptions = [{
      label: "Select Field",
      value: "0"
    }];
    if (meta_fields) {
      Object.keys(meta_fields)?.map((item, i) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: fieldOptions.push({
          value: item,
          label: item
        })
      }));
    }
    setMetaKeys(fieldOptions);
    setCustomFieldKey("0");
    //console.log('new')
  }, [singlePostData?.value]);
  const dataSourceOptions = [{
    label: "Taxonomy",
    value: "taxonomy"
  }, {
    label: "Custom Field",
    value: "custom_field"
  }];
  const customFieldCompareOperators = [{
    label: "is Equal to",
    value: "="
  }, {
    label: "is Not Equal to",
    value: "!="
  }, {
    label: ">",
    value: ">"
  }, {
    label: ">=",
    value: ">="
  }, {
    label: "<",
    value: "<"
  }, {
    label: "<=",
    value: "<="
  }
  // {
  //   label: "LIKE",
  //   value: "LIKE",
  // },
  // {
  //   label: "NOT LIKE",
  //   value: "NOT LIKE",
  // },
  // {
  //   label: "IN",
  //   value: "IN",
  // },
  // {
  //   label: "NOT IN",
  //   value: "NOT IN",
  // },
  // {
  //   label: "BETWEEN",
  //   value: "BETWEEN",
  // },
  // {
  //   label: "NOT BETWEEN",
  //   value: "NOT BETWEEN",
  // },
  // {
  //   label: "EXISTS",
  //   value: "EXISTS",
  // },
  // {
  //   label: "NOT EXISTS",
  //   value: "NOT EXISTS",
  // },
  // {
  //   label: "REGEXP",
  //   value: "REGEXP",
  // },
  // {
  //   label: "NOT REGEXP",
  //   value: "NOT REGEXP",
  // },
  ];
  const customFieldMetaTypes = [{
    label: "CHAR",
    value: "CHAR"
  }, {
    label: "NUMERIC",
    value: "NUMERIC"
  }
  // {
  //   label: "BINARY",
  //   value: "BINARY",
  // },
  // {
  //   label: "DATE",
  //   value: "DATE",
  // },
  // {
  //   label: "DATETIME",
  //   value: "DATETIME",
  // },
  // {
  //   label: "DECIMAL",
  //   value: "DECIMAL",
  // },
  // {
  //   label: "SIGNED",
  //   value: "SIGNED",
  // },
  // {
  //   label: "TIME",
  //   value: "TIME",
  // },
  // {
  //   label: "UNSIGNED",
  //   value: "UNSIGNED",
  // },
  ];
  const handleTermSettingCancel = () => {
    setTermDetail([]);
    setTermSettingPopUp(false);
    setTermPredefined(false);
    setIsParent(false);
    setcontentIconDetail(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: 'icon'
    }));
  };
  const handleTermSettingSave = () => {
    const {
      freshItems,
      settingsRef
    } = (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxonomyExists = newtaxonomyData.some(data => data.key === termDetail[1]);
    if (taxonomyExists) {
      // if (contentIconDetail.icon === "" && contentIconDetail.iconChecked) {
      //   setCheckError(true);
      //   return;
      // }
      if (termPredefined === true) {
        settingsRef.predefined_terms = [termDetail[2]];
        const targetId = (0,filterSettingsSnapshot.extractNumericTermIdFromPredefinedKey)(termDetail[2]);
        newtaxonomyData = newtaxonomyData.map(group => ({
          ...group,
          term_data: (0,filterSettingsSnapshot.setSingleDefaultPredefineInTree)((0,filterSettingsSnapshot.clearAllTermPredefineInTree)(group.term_data), targetId)
        }));
      } else if (settingsRef.predefined_terms?.includes(termDetail[2])) {
        settingsRef.predefined_terms = settingsRef.predefined_terms.filter(item => item !== termDetail[2]);
      }
      const data = newtaxonomyData.find(d => d.key === termDetail[1]);
      const termData = [...data.term_data];
      const alreadyPresent = termData.some(obj => {
        if (obj.key === termDetail[0]) {
          obj.predefine = termPredefined ? "true" : "false";
          if (contentIconDetail.iconChecked === true && contentIconDetail.icon != "") {
            if ((0,termVisualUtils.isTermVisualColor)(settingsRef) || contentIconDetail.type === "color") {
              obj.icons = (0,termVisualUtils.buildColorTermIcons)(obj.icons, contentIconDetail.icon, contentIconDetail.position);
            } else {
              obj.icons = (0,termVisualUtils.buildIconTermIcons)(obj.icons, {
                icon: contentIconDetail.icon,
                position: contentIconDetail.position,
                type: contentIconDetail?.type || "icon"
              });
            }
          } else if ((0,termVisualUtils.isTermVisualColor)(settingsRef)) {
            obj.icons = obj.icons?.icon_backup ? {
              type: obj.icons.icon_backup.type || "icon",
              icon: obj.icons.icon_backup.icon,
              position: obj.icons?.position || "before",
              icon_backup: obj.icons.icon_backup,
              color: ""
            } : {};
          } else {
            obj.icons = {
              ...(obj.icons?.color ? {
                color: obj.icons.color
              } : {})
            };
          }
          return true;
        }
        return false;
      });
    }
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
    });
    setTermSettingPopUp(false);
    setTermPredefined(false);
    setCheckError(false);
    setcontentIconDetail(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon"
    }));
    setTermDetail(prev => {
      prev[0] = null;
      return prev;
    });
  };
  const handleTermSwitch = checked => {
    setTermPredefined(checked);
  };
  const handleIsParent = checked => {
    setIsParent(checked);
  };
  const checkTermData = (id, taxo) => {
    //if click on terms settings then check , it present or not in the taxonomy data
    if (id) {
      for (let index = 0; index < settingData.taxonomy_data?.length; index++) {
        let data = settingData.taxonomy_data[index];
        if (data.key == taxo) {
          let termData = data.term_data;
          for (let i = 0; i < termData.length; i++) {
            let obj = termData[i];
            let childData = obj.children_data;
            for (let j = 0; j < childData.length; j++) {
              if (childData[j].key == id) {
                return true;
              }
            }
            if (obj.key == id) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  const handleLabel = val => {
    setLabelInput(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = {
          ...s.label,
          value: val
        };
      }
    });
  };
  const handleEdit = () => {
    props.openBuilderSetting(true);
  };
  const seedShowMoreStyleIfNeeded = moduleRef => {
    if (String(moduleRef?.settings?.term_show_more) !== "true") {
      return;
    }
    if (!moduleRef.style) {
      moduleRef.style = {};
    }
    if (!moduleRef.style.showmore && FilterComponents_styleData.fModuleStyle?.showmore) {
      moduleRef.style.showmore = JSON.parse(JSON.stringify(FilterComponents_styleData.fModuleStyle.showmore));
    }
  };
  const changeInitialData = data => {
    setDataSource(data.data_source);
    if (data.data_source != settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label == "false" ? false : true);
    if (data.label.is_label == "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    setToggle(prev => ({
      ...prev,
      enable: (0,filterModuleTier.resolveFilterLabelCollapseToggleState)(data).enable
    }));
    if (!(0,filterModuleTier.canUseFilterLabelCollapse)() || data.enable_toggle == "false") {
      data.close_toggle = "false";
      setToggle(prev => ({
        ...prev,
        close: false
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);
    let nextSettings = (0,filterSettingsSnapshot.enforceSingleDefaultTermsInSettings)((0,filterModuleTier.applyFilterLabelCollapseTierToSettings)({
      ...data,
      multiple_term: "false"
    }), {
      forceSingle: true
    });
    nextSettings = (0,termShowMoreUtils.ensureTermShowMoreSettingsDefaults)(nextSettings);
    const prevVisual = (0,termVisualUtils.resolveTermVisual)({
      ...settingData,
      post_type: resolvedPostType
    });
    const nextVisual = (0,termVisualUtils.resolveTermVisual)((0,filterModuleTier.resolveSettingsForTermVisualDefaults)(nextSettings, resolvedPostType));
    if (prevVisual !== termVisualUtils.TERM_VISUAL_COLOR && nextVisual === termVisualUtils.TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: termVisualUtils.TERM_VISUAL_COLOR
      };
      nextSettings = (0,termVisualUtils.ensureDefaultSwatchColorsOnSettings)(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    } else if (!(0,filterModuleTier.canUseFilterShowIcon)() && String(nextSettings.show_icon) === "true" && (0,filterModuleTier.canUseFilterColorSwatch)(resolvedPostType) && nextSettings.term_visual !== termVisualUtils.TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: termVisualUtils.TERM_VISUAL_COLOR
      };
    }
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
      patchModule: seedShowMoreStyleIfNeeded
    });
    //removeParentChild();
  };
  const changeInitialDataOptChnage = data => {
    setDataSource(data.data_source);
    if (data.data_source != settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label == "false" ? false : true);
    if (data.label.is_label == "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    setToggle(prev => ({
      ...prev,
      enable: (0,filterModuleTier.resolveFilterLabelCollapseToggleState)(data).enable
    }));
    if (!(0,filterModuleTier.canUseFilterLabelCollapse)() || data.enable_toggle == "false") {
      data.close_toggle = "false";
      setToggle(prev => ({
        ...prev,
        close: false
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);

    // styleData.meta1[selectedDevice].default.flexFlow = "row";
    // styleData.meta1[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta1[selectedDevice].default.alignItems = "flex-start";

    // styleData.meta3[selectedDevice].default.flexFlow = "row";
    // styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta3[selectedDevice].default.alignItems = "flex-start";

    // items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
    // props.onSettingChange(items);

    let nextSettings = (0,filterSettingsSnapshot.enforceSingleDefaultTermsInSettings)((0,filterModuleTier.applyFilterLabelCollapseTierToSettings)({
      ...data,
      multiple_term: "false"
    }), {
      forceSingle: true
    });
    nextSettings = (0,termShowMoreUtils.ensureTermShowMoreSettingsDefaults)(nextSettings);
    // Free may flip to Color Swatch via applyFreeColorSwatchOnEnable — seed white defaults.
    const prevVisual = (0,termVisualUtils.resolveTermVisual)({
      ...settingData,
      post_type: resolvedPostType
    });
    const nextForDefaults = (0,filterModuleTier.resolveSettingsForTermVisualDefaults)(nextSettings, resolvedPostType);
    const nextVisual = (0,termVisualUtils.resolveTermVisual)(nextForDefaults);
    if (prevVisual !== termVisualUtils.TERM_VISUAL_COLOR && nextVisual === termVisualUtils.TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: termVisualUtils.TERM_VISUAL_COLOR
      };
      nextSettings = (0,termVisualUtils.ensureDefaultSwatchColorsOnSettings)(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    } else if (!(0,filterModuleTier.canUseFilterShowIcon)() && String(nextSettings.show_icon) === "true" && (0,filterModuleTier.canUseFilterColorSwatch)(resolvedPostType) && nextSettings.term_visual !== termVisualUtils.TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: termVisualUtils.TERM_VISUAL_COLOR
      };
    }
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
      patchModule: seedShowMoreStyleIfNeeded
    });
  };

  // const changeInitialDataCountOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source != settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label == "false" ? false : true);
  //   if (data.label.is_label == "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle == "false" ? false : true,
  //   }));
  //   if (data.enable_toggle == "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);

  //   items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
  //   props.onSettingChange(items);

  //   commitFilterModuleReplaceSettings({
  //     data: props.data,
  //     rowindex,
  //     columnindex,
  //     moduleindex,
  //     resolvedPostType,
  //     onSettingChange: props.onSettingChange,
  //     nextSettings: data,
  //   });

  // };

  const handleAllOptionInput = val => {
    setAllOptionInput(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.dropdown_data = s.dropdown_data || {};
        s.dropdown_data.all_option = {
          ...(s.dropdown_data.all_option || {}),
          value: val
        };
      }
    });
  };
  const customFieldKeyFunc = (value, customField, index) => {
    let updateData = [];
    let updatedPredefinedTerms = settingData?.cf_predefined_terms;
    if (customField === "key") {
      let customFieldKey = "";
      let valueArray = [];
      updateData = customFieldArray.map((item, id) => {
        if (id === index) {
          customFieldKey = item?.custom_field_key;
          valueArray = item?.custom_field_value_list;
          return {
            ...item,
            custom_field_key: value,
            custom_field_value_list: []
          };
        }
        return item;
      });
      updatedPredefinedTerms = removeMatchedPredefinedTerms(customFieldKey, valueArray, settingData?.cf_predefined_terms);
    }
    if (customField === "value") {
      updateData = customFieldArray?.map((item, id) => {
        if (id === index) {
          return {
            ...item,
            custom_field_value_list: [...(item.custom_field_value_list || []), {
              key: value,
              label: value,
              icons: {
                icon: "",
                type: "icon",
                position: "before",
                iconChecked: true
              },
              predefine: "false"
            }]
          };
        }
        return item;
      });
    }
    setCustomFieldArray(updateData);
    settingData.custom_field_data = updateData;
    settingData.cf_predefined_terms = updatedPredefinedTerms;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      }
    });
  };

  // const handleCustomFieldSetting = (index) => {
  //   setCurrCustomFieldValue(index);
  //   setTimeout(() => {
  //     setTermSettingPopUpCusField(true);
  //   }, 500);
  // };
  const handleSaveCustomFieldLabel = () => {
    if (keyValueCf === "" || labelValueCf === "") {
      setCheckError(true);
      return false;
    }
    const updateData = customFieldArray?.map((item, id) => {
      if (id !== currCustomFieldValue[0]) return item;
      return {
        ...item,
        custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {
          if (vid !== currCustomFieldValue[1]) return value;
          return {
            ...value,
            key: keyValueCf,
            label: labelValueCf
          };
        })
      };
    });
    setTermSettingPopUpCusFieldLabel(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);
    setCustomFieldArray(updateData);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const handleSaveCustomFieldIcon = () => {
    const updateData = customFieldArray?.map((item, id) => {
      if (id !== currCustomFieldValue[0]) return item;
      return {
        ...item,
        custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {
          if (vid !== currCustomFieldValue[1]) return value;
          return {
            ...value,
            icons: {
              ...(value.icons || {}),
              icon: contentIconDetailCusField.icon,
              position: contentIconDetailCusField.position,
              type: contentIconDetailCusField.type,
              iconChecked: false
            }
          };
        })
      };
    });
    setcontentIconDetailCusField(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon"
    }));
    setTermSettingPopUpCusFieldIcon(false);
    setCurrCustomFieldValue([]);
    setCheckError(false);
    setCustomFieldArray(updateData);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const handleCancelCustomFieldLabel = () => {
    setTermSettingPopUpCusFieldLabel(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);
  };
  const handleCancelCustomFieldIcon = () => {
    setcontentIconDetailCusField(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon"
    }));
    setTermSettingPopUpCusFieldIcon(false);
    setCurrCustomFieldValue([]);
    setCheckError(false);
  };
  const handleTermSwitchCusField = checked => {
    setTermPredefinedCusField(checked);
  };
  //   const TemrsRefresh=()=>{
  //     setIsLoading(false)
  //     setTimeout(()=>{
  //     setIsLoading(true);
  //   },600)
  //   }

  (0,external_React_.useEffect)(() => {
    const fetchTaxoData = async () => {
      try {
        const res = await client["default"].get(endpoints.apiEndpoints.getTaxonomyRecursiveData(resolvedPostType));
        if (res.data && res.data.status === "success") {
          //console.log(res.data);
          setTaxonomyListArray(res.data.taxonomy_list);
          setIsLoading(false);
          setLoadingCatogries(true);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };
    if (resolvedPostType) {
      setPostType(resolvedPostType);
      setLoadingCatogries(false);
      //console.log(resolvedPostType)
      fetchTaxoData();
    }
  }, [resolvedPostType]);

  // Refresh saved term counts from live taxonomy totals (catalog-aware).
  // Also heals the dropdown "first selected term" bug where count was omitted.
  (0,external_React_.useEffect)(() => {
    if (!Array.isArray(taxonomyListArray) || taxonomyListArray.length === 0) {
      return;
    }
    const savedGroups = settingData?.taxonomy_data;
    if (!Array.isArray(savedGroups) || savedGroups.length === 0) {
      return;
    }
    const {
      next,
      changed
    } = (0,termCountUtils.backfillTaxonomyDataCounts)(savedGroups, (0,termCountUtils.buildTermCountMapFromTaxonomyList)(taxonomyListArray));
    if (!changed) {
      return;
    }
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: settingsRef => {
        settingsRef.taxonomy_data = next;
      },
      onAfterCommit: nextSettings => setTaxonomyList(nextSettings.taxonomy_data)
    });
  }, [taxonomyListArray]);
  const getAllTermsRecursive = termList => {
    let all = [];
    const defaultTermIcons = (0,termVisualUtils.getDefaultTermIconsForMode)((0,filterModuleTier.resolveSettingsForTermVisualDefaults)(settingData, resolvedPostType));
    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach(term => {
        all.push({
          key: term?.id,
          value: term?.name,
          predefine: "false",
          icons: defaultTermIcons,
          count: term?.total_count ?? term?.count
        });
        if (Array.isArray(term.children_data) && term.children_data.length > 0) {
          all = [...all, ...getAllTermsRecursive(term.children_data)];
        }
      });
    }
    return all;
  };
  const isAllSelected = taxonomyKey => {
    const taxItem = taxonomyListArray.find(item => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(data => data.key === taxonomyKey);
    if (!taxItem) return false;
    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;
    return allTerms.every(term => savedTax.term_data.some(saved => saved.key === term.key));
  };
  const isAnySelected = taxonomyKey => {
    const taxItem = taxonomyListArray.find(item => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(data => data.key === taxonomyKey);
    if (!taxItem) return false;
    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;

    // agar ek bhi term.key savedTax.term_data me mil jaye to true return kare
    const hasAnyMatch = allTerms.some(term => savedTax.term_data.some(saved => saved.key === term.key));
    if (hasAnyMatch) {
      return true;
    } else {
      false;
    }
  };
  const TaxoToggleExpand = taxokey => {
    setFirstRender(false);
    setExpandedTaxoItems(prev => {
      const newArray = prev.includes(taxokey) ? prev.filter(x => x !== taxokey) : [...prev, taxokey];
      return Array.from(new Set(newArray));
    });
  };
  const toggleExpand = id => {
    setExpandedItems(prev => {
      const newArray = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return Array.from(new Set(newArray));
    });
  };
  const getFreshSettingsSnapshot = () => {
    return (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
  };
  const commitSettingsSnapshot = (freshItems, settingsRef, nexttaxonomyData) => {
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: nextSettings => setTaxonomyList(nextSettings.taxonomy_data)
    });
  };
  const handleTerm = (e, taxonomy, term) => {
    // console.log(e.target.checked, taxonomy, term)
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    let updatedPredefinedTerms = [...settingsRef?.predefined_terms];
    const checked = e.target.checked;
    const taxonomyExists = newtaxonomyData.some(data => data.key === taxonomy);
    const defaultTermIcons = (0,termVisualUtils.getDefaultTermIconsForMode)((0,filterModuleTier.resolveSettingsForTermVisualDefaults)(settingsRef, resolvedPostType));
    if (checked) {
      if (taxonomyExists) {
        const data = newtaxonomyData.find(d => d.key === taxonomy);
        const termData = [...data.term_data];
        const isValuePresent = termData.some(obj => obj.key === term?.id);
        if (!isValuePresent) {
          termData.push({
            key: term?.id,
            value: term?.name,
            predefine: "false",
            icons: defaultTermIcons,
            count: term?.total_count ?? term?.count
          });
          data.term_data = termData;
        }
      } else {
        newtaxonomyData.push({
          key: taxonomy,
          term_data: [{
            key: term?.id,
            value: term?.name,
            predefine: "false",
            icons: defaultTermIcons,
            count: term?.total_count ?? term?.count
          }]
        });
      }
    } else {
      if (taxonomyExists) {
        const data = newtaxonomyData.find(d => d.key === taxonomy);
        if (data) {
          data.term_data = data.term_data.filter(obj => obj.key !== term?.id);
          if (data.term_data.length === 0) {
            data.term_data = [];
            newtaxonomyData = newtaxonomyData.filter(tx => tx.key !== taxonomy);
          }
        }
        /* start remove from PredefinedTerms */
        updatedPredefinedTerms = updatedPredefinedTerms?.filter(itemData => itemData !== `${String(taxonomy).trim()}___${String(term?.id).trim()}`);
        /* end remove from PredefinedTerms */
      }
    }
    settingsRef.predefined_terms = updatedPredefinedTerms;
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };
  const handleTermChecked = (taxonomy, term) => {
    const taxo = Array.isArray(settingData.taxonomy_data) && settingData.taxonomy_data?.find(d => d.key === taxonomy);
    if (!taxo || !Array.isArray(taxo.term_data)) return false;
    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };
    for (const obj of taxo.term_data) {
      if (obj.key === term?.id) return true;
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const foundInChildren = searchInChildren(obj.children_data, term?.id);
        if (foundInChildren) return true;
      }
    }
    return false;
  };
  const findTermObjRecursive = (data, termId) => {
    if (!Array.isArray(data)) return null;
    for (const obj of data) {
      if (obj.key === termId) {
        return obj;
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const found = findTermObjRecursive(obj.children_data, termId);
        if (found) return found;
      }
    }
    return null;
  };
  const isTermPredefined = (taxonomy, term) => {
    const taxo = settingData.taxonomy_data?.find(d => d.key === taxonomy);
    if (!taxo) return false;
    const termObj = findTermObjRecursive(taxo.term_data, term?.id);
    return termObj?.predefine === "true";
  };
  const getTermSavedIcons = (taxonomy, term) => {
    const taxo = settingData.taxonomy_data?.find(d => d.key === taxonomy);
    if (!taxo) return null;
    const termObj = findTermObjRecursive(taxo.term_data, term?.id);
    return termObj?.icons || null;
  };
  const termHasIcon = icons => {
    if (!icons || typeof icons !== "object") return false;
    const iconValue = icons.icon;
    if (typeof iconValue === "string" && iconValue.trim() !== "") {
      return true;
    }
    if (iconValue && typeof iconValue === "object") {
      if (iconValue.url) return true;
      return Object.keys(iconValue).length > 0;
    }
    return false;
  };
  const getTermIconPreviewSrc = icons => {
    if (!termHasIcon(icons)) return "";
    const iconValue = icons.icon;
    if (typeof iconValue === "string") return iconValue;
    if (iconValue?.url) return iconValue.url;
    if (iconValue?.icon?.url) return iconValue.icon.url;
    return "";
  };
  const updateTermPredefineInTree = (terms, termId, checked) => {
    if (!Array.isArray(terms)) return terms;
    return terms.map(obj => {
      if (obj.key === termId) {
        return {
          ...obj,
          predefine: checked ? "true" : "false"
        };
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        return {
          ...obj,
          children_data: updateTermPredefineInTree(obj.children_data, termId, checked)
        };
      }
      return obj;
    });
  };
  const applyColorToTermTree = (terms, termId, color) => {
    if (!Array.isArray(terms)) return terms;
    return terms.map(obj => {
      if (obj.key === termId) {
        return {
          ...obj,
          icons: (0,termVisualUtils.buildColorTermIcons)(obj.icons, color, obj.icons?.position || "before")
        };
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        return {
          ...obj,
          children_data: applyColorToTermTree(obj.children_data, termId, color)
        };
      }
      return obj;
    });
  };
  const handleTermColorInline = (term, taxonomy, color) => {
    if (!color || !handleTermChecked(taxonomy, term)) {
      return;
    }
    const {
      freshItems,
      settingsRef
    } = (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
    const taxonomyExists = settingsRef.taxonomy_data?.some(data => data.key === taxonomy);
    if (!taxonomyExists) {
      return;
    }
    const newtaxonomyData = settingsRef.taxonomy_data.map(group => {
      if (group.key !== taxonomy) return group;
      return {
        ...group,
        term_data: applyColorToTermTree(group.term_data, term?.id, color)
      };
    });
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
    });
  };
  const handleTermPredefinedInline = (term, taxonomy, checked) => {
    if (!handleTermChecked(taxonomy, term)) {
      return;
    }
    const term_id = `${taxonomy}___${term?.id}`;
    const {
      freshItems,
      settingsRef
    } = (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
    (0,filterSettingsSnapshot.applyTaxonomyDefaultTermToSettings)({
      settingsRef,
      termKey: term_id,
      taxonomyKey: taxonomy,
      numericTermId: term?.id,
      checked,
      allowMultiple: false
    });
    const taxonomyExists = settingsRef.taxonomy_data?.some(data => data.key === taxonomy);
    if (!taxonomyExists) {
      return;
    }
    const newtaxonomyData = settingsRef.taxonomy_data;
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
    });
  };
  const TermTaxonomyRowActions = ({
    term,
    taxonomy,
    onOpenSettings
  }) => {
    const showTermIconControl = (0,filterModuleTier.shouldShowFilterTermIconControl)(settingData?.show_icon);
    const colorMode = (0,termVisualUtils.isTermVisualColor)({
      ...settingData,
      post_type: resolvedPostType
    });
    const isTermSelected = handleTermChecked(taxonomy, term);
    const isDefault = isTermPredefined(taxonomy, term);
    const termIcons = getTermSavedIcons(taxonomy, term);
    const hasColor = (0,termVisualUtils.termHasColorSwatch)(termIcons);
    const hasIcon = colorMode ? hasColor : termHasIcon(termIcons) && termIcons?.type !== "color";
    const iconPreviewSrc = getTermIconPreviewSrc(termIcons);
    const swatchColor = (0,termVisualUtils.getTermSwatchColor)(termIcons);
    const termIconActionsLocked = !(0,filterModuleTier.canUseFilterTermIcon)();
    const termDefaultLocked = !(0,filterModuleTier.canUseFilterTermDefault)();
    const termActionsLocked = termDefaultLocked || termIconActionsLocked;
    // Free: color swatch picker is unlocked; FA/SVG icon picker stays Pro.
    const colorTriggerDisabled = !isTermSelected;
    const iconTriggerDisabled = !isTermSelected || termIconActionsLocked;
    const addLabel = colorMode ? hasColor ? "Edit term color" : "Add term color" : hasIcon ? "Edit term icon" : "Add term icon";
    const handleColorCommit = (0,external_React_.useCallback)(nextColor => {
      handleTermColorInline(term, taxonomy, nextColor);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [term?.id, taxonomy]);
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
      className: "caf-term-row-actions",
      onClick: event => event.stopPropagation(),
      children: [showTermIconControl && colorMode && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermColorPickerTrigger["default"], {
        color: swatchColor,
        disabled: colorTriggerDisabled,
        label: addLabel,
        onColorCommit: handleColorCommit
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTermRowProActions["default"], {
        isTermSelected: isTermSelected,
        isDefault: isDefault,
        hasIcon: hasIcon,
        termIcons: termIcons,
        iconPreviewSrc: iconPreviewSrc,
        iconTriggerDisabled: iconTriggerDisabled,
        termDefaultLocked: termDefaultLocked,
        termIconActionsLocked: termIconActionsLocked,
        addLabel: addLabel,
        onOpenSettings: onOpenSettings,
        onToggleDefault: checked => handleTermPredefinedInline(term, taxonomy, checked),
        showIconControl: showTermIconControl && !colorMode
      })]
    });
  };
  function NestedTerms({
    taxoKey,
    childrenData,
    expandedItems,
    toggleExpand,
    handleTerm,
    handleTermChecked
  }) {
    if (!Array.isArray(childrenData) || childrenData.length === 0) return null;
    return (
      /*#__PURE__*/
      // <ul className="children">
      (0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: childrenData.map(child => {
          const hasChildren = Array.isArray(child?.children_data) && child.children_data.length > 0;
          const hasChildClass = Array.isArray(child?.children_data) && child.children_data.length > 0 ? "tc-caf-has-child" : "";
          const isExpanded = expandedItems.includes(child.id);
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
            className: `cat-item cat-item-${child?.id} ${hasChildClass}`,
            count: child?.total_count,
            "term-id": child?.id,
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: "trusty-manage-bar-sec-label",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("label", {
                htmlFor: `${taxoKey}-list-id${child?.id}`,
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                  className: `${taxoKey}-list check`,
                  type: "checkbox",
                  "term-name": child?.name,
                  name: `${taxoKey}[]`,
                  id: `${taxoKey}-list-id${child?.id}`,
                  value: `${taxoKey}___${child?.id}`,
                  onChange: e => handleTerm(e, taxoKey, child),
                  checked: handleTermChecked(taxoKey, child)
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyLabelText["default"], {
                  name: child?.name,
                  count: child?.total_count
                })]
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyRowActions, {
                term: child,
                taxonomy: taxoKey,
                onOpenSettings: () => handleTermSetting(child, taxoKey)
              }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
                className: `fa ${isExpanded ? "fa-angle-up" : "fa-angle-down"} caf-builder-plus`,
                "aria-hidden": "true",
                onClick: e => {
                  e.stopPropagation();
                  toggleExpand(child.id);
                },
                style: {
                  cursor: "pointer"
                }
              })]
            }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
              className: `children ${isExpanded ? "tc_caf_active_list" : ""}`,
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(NestedTerms, {
                taxoKey: taxoKey,
                childrenData: child.children_data,
                expandedItems: expandedItems,
                toggleExpand: toggleExpand,
                handleTerm: handleTerm,
                handleTermChecked: handleTermChecked
              })
            })]
          }, child?.id);
        })
      })
      // </ul>
    );
  }
  const handleSelectAll = taxonomy => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxItem = taxonomyListArray.find(item => item.key === taxonomy);
    if (!taxItem) return;
    const existingTaxData = newtaxonomyData.find(data => data.key === taxonomy);
    const existingTerms = existingTaxData ? existingTaxData.term_data : [];
    const allTerms = getAllTermsRecursiveForAll(taxItem.term_data, existingTerms);
    if (existingTaxData) {
      newtaxonomyData = newtaxonomyData.map(data => {
        if (data.key === taxonomy) {
          const merged = [...data.term_data, ...allTerms];
          const unique = Array.from(new Map(merged.map(item => [item.key, item])).values());
          return {
            ...data,
            term_data: unique
          };
        }
        return data;
      });
    } else {
      newtaxonomyData.push({
        key: taxonomy,
        term_data: allTerms
      });
    }
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };
  const getAllTermsRecursiveForAll = (termList, existingTerms = []) => {
    let all = [];
    const defaultTermIcons = (0,termVisualUtils.getDefaultTermIconsForMode)((0,filterModuleTier.resolveSettingsForTermVisualDefaults)(settingData, resolvedPostType));
    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach(term => {
        const alreadyExists = existingTerms.some(t => t.key === term.id);
        if (!alreadyExists) {
          all.push({
            key: term.id,
            value: term.name,
            predefine: "false",
            icons: defaultTermIcons,
            count: term?.total_count ?? term?.count
          });
        }
        if (Array.isArray(term.children_data) && term.children_data.length > 0) {
          all = [...all, ...getAllTermsRecursiveForAll(term.children_data, existingTerms)];
        }
      });
    }
    return all;
  };
  const removeTaxoMatchedPredefinedTerms = (predefinedTerms = [], taxonomy, termData = []) => {
    // nested keys collect karne ka func
    const collectKeys = (items = [], keys = []) => {
      items.forEach(item => {
        if (item?.key !== undefined && item?.key !== null) {
          keys.push(`${String(taxonomy).trim()}___${String(item.key).trim()}`);
        }
        if (Array.isArray(item?.children_data) && item?.children_data?.length) {
          collectKeys(item?.children_data, keys);
        }
      });
      return keys;
    };
    const matchedKeys = collectKeys(termData);
    return predefinedTerms.filter(item => !matchedKeys.includes(item));
  };
  const handleSelectNone = taxonomy => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    let updatedPredefinedTerms = [...settingsRef?.predefined_terms];
    const taxonomyItem = newtaxonomyData.find(data => data.key === taxonomy);
    if (taxonomyItem) {
      /* start remove from PredefinedTerms */
      updatedPredefinedTerms = removeTaxoMatchedPredefinedTerms(updatedPredefinedTerms, taxonomy, taxonomyItem?.term_data);
      /* end remove from PredefinedTerms */
      taxonomyItem.term_data = [];
      newtaxonomyData = newtaxonomyData.filter(tx => tx.key !== taxonomy);
    }
    settingsRef.predefined_terms = updatedPredefinedTerms;
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };
  const handleTermSetting = (term, taxonomy) => {
    if ((0,termVisualUtils.isTermVisualColor)({
      ...settingData,
      post_type: resolvedPostType
    })) {
      return;
    }
    let hasParent = false;
    if (term?.children_data?.length > 0) {
      hasParent = true;
    }
    let term_id = taxonomy + "___" + term?.id;
    let newtaxonomyData = [...settingData.taxonomy_data];
    const data = newtaxonomyData.find(d => d.key === taxonomy);
    const termData = Array.isArray(data?.term_data) ? [...data.term_data] : [];
    const termObj = findTermObjRecursive(termData, term?.id) || {};
    setTermDetail([term?.id, taxonomy, term_id, term?.name, hasParent, handleTermChecked(taxonomy, term), termObj]);
    setTimeout(() => {
      setTermSettingPopUp(true);
    }, 100);
  };
  const onLabelIconSwitch = checked => {
    if (!(0,filterModuleTier.canUseLabelShowIcon)()) {
      return;
    }
    setLabelIconSwitch(checked);
    let itm = {
      ...settingData?.label
    };
    let ic = {
      ...itm?.icons
    };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
      ic.position = "before-label";
    }
    ic.visibility = checked;
    itm.icons = {
      ...itm.icons,
      ...ic
    };
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = itm;
      }
    });
  };
  const handleAllOptionChecked = checked => {
    setAllOptEnable(checked);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.dropdown_data = s.dropdown_data || {};
        s.dropdown_data.all_option = {
          ...(s.dropdown_data.all_option || {}),
          is_enable: checked ? "true" : "false"
        };
      }
    });
  };
  const handleAllOptSetting = () => {
    // setTimeout(()=>{
    //setAllOptModal(true);
    // },1500)
  };
  const handleSaveAllOption = () => {
    const value = allOptionInput;
    const iconData = allOptArray?.icons;
    const visibility = allIconSwitch;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.dropdown_data = s.dropdown_data || {};
        let itm = {
          ...(s.dropdown_data.all_option || {})
        };
        itm.value = value;
        itm.icons = {
          ...(itm.icons || {}),
          ...(iconData || {})
        };
        let ic = {
          ...itm.icons
        };
        if (visibility === false) {
          ic.icon = "";
          ic.type = "icon";
        }
        ic.visibility = visibility;
        itm.icons = {
          ...itm.icons,
          ...ic
        };
        s.dropdown_data.all_option = itm;
      },
      onAfterCommit: next => setAllOptArray(next.dropdown_data?.all_option)
    });
    setAllOptModal(false);
  };
  const handleCancelAllOption = () => {
    setAllOptionInput(settingData?.dropdown_data?.all_option?.value ?? "");
    setAllIconSwitch((0,filterModuleTier.canUseFilterShowIcon)() ? settingData?.dropdown_data?.all_option?.icons?.visibility ?? false : false);
    setAllOptArray(settingData?.dropdown_data?.all_option);
    setAllOptModal(false);
  };
  const changeDataSource = value => {
    if (value === "custom_field" && !(0,filterModuleTier.canUseFilterCustomField)()) {
      return;
    }
    setDataSource(value);
    // console.log(data);
    if (value !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.data_source = value;
        if (value === "custom_field") {
          s.show_count = "false";
        }
      }
    });
  };
  const getCompareLabel = value => {
    const match = customFieldCompareOperators?.find(item => item.value === value);
    return match ? match.label : "";
  };
  const formatCfValueListSummary = list => (list || []).map(val => val && typeof val === "object" ? String(val.label ?? val.key ?? "") : String(val ?? "")).filter(Boolean).join(" , ");
  const removeArray = (arr, index) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // part of the array after the specified index
  ...arr.slice(index + 1)];
  const removeMatchedPredefinedTerms = (customFieldKey = "", valueArray = [], cfPredefinedTerms = []) => {
    if (customFieldKey === "" || valueArray.length === 0) {
      return cfPredefinedTerms;
    }
    const removeValues = new Set(valueArray.map(item => `${String(customFieldKey).trim()}___${String(item?.key).trim()}`));
    return cfPredefinedTerms.filter(predefinedItem => !removeValues.has(String(predefinedItem).trim()));
  };
  const deleteCustomField = (index, item) => {
    let updatedCustomFieldData = JSON.parse(JSON.stringify(customFieldArray));
    updatedCustomFieldData = removeArray(updatedCustomFieldData, index);
    setCustomFieldArray([...updatedCustomFieldData]);

    /* start remove from predefine */

    let customFieldKey = item?.custom_field_key;
    let valueArray = item?.custom_field_value_list;
    let updatedPredefinedTerms = removeMatchedPredefinedTerms(customFieldKey, valueArray, settingData?.cf_predefined_terms);

    /* start remove from predefine */

    settingData.custom_field_data = updatedCustomFieldData;
    settingData.cf_predefined_terms = updatedPredefinedTerms;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updatedCustomFieldData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      }
    });
  };
  const addCustomField = () => {
    let newField = {
      custom_field_key: "0",
      custom_field_value_list: [],
      compare_operator: "=",
      meta_type: "CHAR"
    };
    let updatedCustomFieldData = [...customFieldArray];
    updatedCustomFieldData?.push(newField);
    setCustomFieldArray(updatedCustomFieldData);
    settingData.custom_field_data = updatedCustomFieldData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updatedCustomFieldData;
      }
    });
  };
  const toggleCfRow = index => {
    setOpenCfRows(prev => ({
      ...prev,
      [index]: !(prev[index] ?? true)
    }));
  };
  const toggleCfAdv = index => {
    setOpenCfAdv(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  const handleCompareOperator = (value, index) => {
    let updateData = customFieldArray?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          compare_operator: value
        };
      }
      return item;
    });
    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const handleMetaType = (value, index) => {
    let updateData = customFieldArray?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          meta_type: value
        };
      }
      return item;
    });
    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const openCustomFieldLabelSetting = (cfIndex, valueIndex, valueData) => {
    setCurrCustomFieldValue([cfIndex, valueIndex, valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusFieldLabel(true);
    }, 100);
  };
  const openCustomFieldIconSetting = (cfIndex, valueIndex, valueData) => {
    setCurrCustomFieldValue([cfIndex, valueIndex, valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusFieldIcon(true);
    }, 100);
  };
  const handleCfPredefinedInline = (cfIndex, valueIndex, checked) => {
    const cfItem = customFieldArray[cfIndex];
    const val = cfItem?.custom_field_value_list?.[valueIndex];
    if (!cfItem || !val?.key) return;
    const termId = `${String(cfItem.custom_field_key).trim()}___${String(val.key).trim()}`;
    const {
      customFieldData: updateData,
      cfPredefinedTerms: updatedPredefinedTerms
    } = (0,filterSettingsSnapshot.applyCustomFieldDefaultTermToSettings)({
      customFieldData: customFieldArray,
      cfPredefinedTerms: settingData.cf_predefined_terms,
      termId,
      cfIndex,
      valueIndex,
      checked,
      allowMultiple: false
    });
    setCustomFieldArray(updateData);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
        s.multiple_term = "false";
      }
    });
  };
  const deleteCustomFieldValue = (index, valueIndex, item, value) => {
    const layoutCopy = JSON.parse(JSON.stringify(customFieldArray));
    const customFieldKey = item?.custom_field_key;
    const valueKey = value?.key;
    let updateData = layoutCopy?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          custom_field_value_list: item.custom_field_value_list.filter((_, i) => i !== valueIndex)
        };
      }
      return item;
    });

    /* start delete form predefined array */
    let updatedPredefinedTerms = settingData.cf_predefined_terms.filter(itemData => itemData !== `${String(customFieldKey).trim()}___${String(valueKey).trim()}`);

    /* end delete form predefined array*/

    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    settingData.cf_predefined_terms = updatedPredefinedTerms;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      }
    });
  };
  const getTermDataLength = keyName => {
    const found = taxonomyList?.find(item => item.key === keyName);
    return found?.term_data?.length || 0;
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
    children: !isLoading ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-content-tab-row no-pad-0",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          className: "setting-label-main",
          children: "Data Source"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterDataSourceSegment, {
          value: effectiveDataSource,
          onChange: changeDataSource
        }), effectiveDataSource === "taxonomy" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            class: "module-content-tab-row no-pad-0 caf-dropdown-taxo-wrapper",
            children: [LoadingCatogries ? Array.isArray(taxonomyListArray) ? taxonomyPickerSections.map(section => {
              const sectionContent = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "caf-taxonomy-picker-section",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "caf-taxonomy-picker-section-heading",
                  children: section.label
                }), section.items.map((taxo, indx) =>
                /*#__PURE__*/
                // TaxonomyChecked(taxo.key) === true && (
                (0,external_ReactJSXRuntime_.jsxs)("ul", {
                  className: `tc-caf-each-tax-data ${taxo.key}`,
                  "data-name": taxo.key,
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
                    className: "caf-term-title-main",
                    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "tc-caf-taxo-name-left-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                        className: "tc-caf-all-check-uncheck-main",
                        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                          className: "tc-caf-all-check-uncheck-wrapper",
                          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                            type: "checkbox",
                            className: "tc-caf-all-check-uncheck-btn",
                            checked: isAllSelected(taxo.key),
                            onChange: e => {
                              if (e.target.checked) {
                                handleSelectAll(taxo.key);
                              } else {
                                handleSelectNone(taxo.key);
                              }
                            }
                          })
                        })
                      }, taxo.key), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("h2", {
                        style: {
                          display: "flex",
                          width: "100%",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          padding: 0,
                          margin: 0,
                          alignItems: "center"
                        },
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
                          className: `caf-taxonomy-label-text`,
                          title: getPlainTextFromHtml(taxo?.label),
                          children: (0,esm["default"])(`${taxo?.label}`)
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                          className: "caf-selected-terms-count-wrapper",
                          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
                            className: "caf-selected-terms-count",
                            children: ["(", getTermDataLength(taxo.key)]
                          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
                            className: "caf-selected-terms-count-suffix",
                            children: ["Selected", ")"]
                          })]
                        })]
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-terms-cat-btn",
                      children: [(0,wooAttributeColorImport.isWooProductAttributeTaxonomy)(taxo.key) && (0,termVisualUtils.isTermVisualColor)({
                        ...settingData,
                        post_type: resolvedPostType
                      }) && getTermDataLength(taxo.key) > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(wooAttributeColorImport.WooAttributeColorActions, {
                        variant: "icons",
                        visible: true,
                        importLoading: wooColorImportLoading,
                        resetLoading: wooColorResetLoading,
                        onImport: handleImportWooColors,
                        onReset: handleResetWooColors
                      }), (firstRender === true ? isAnySelected(taxo.key) || expandedTaxoItems.includes(taxo.key) : expandedTaxoItems.includes(taxo.key)) ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                        icon: free_solid_svg_icons.faChevronUp,
                        onClick: e => {
                          e.stopPropagation();
                          TaxoToggleExpand(taxo.key);
                        },
                        style: {
                          cursor: "pointer"
                        }
                      }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                        icon: free_solid_svg_icons.faChevronDown,
                        onClick: e => {
                          e.stopPropagation();
                          TaxoToggleExpand(taxo.key);
                        },
                        style: {
                          cursor: "pointer"
                        }
                      })]
                    })]
                  }), Array.isArray(taxo?.term_data) && taxo.term_data.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
                    children: (() => {
                      const isActive = firstRender === true ? isAnySelected(taxo.key) || expandedTaxoItems.includes(taxo.key) : expandedTaxoItems.includes(taxo.key);
                      if (isActive && !expandedTaxoItems.includes(taxo.key)) {
                        setExpandedTaxoItems(prev => {
                          const newArray = [...prev, taxo.key];
                          return Array.from(new Set(newArray));
                        });
                      }
                      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                        className: `tc-caf-taxo-term-list-section ${isActive ? "active-term-list" : ""}`,
                        children: taxo.term_data.map(term => {
                          const hasChildren = Array.isArray(term?.children_data) && term.children_data.length > 0;
                          const hasChildClass = hasChildren ? "tc-has-child" : "";
                          const isExpanded = expandedItems.includes(term.id);
                          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
                            className: `cat-item cat-item-${term?.id} ${hasChildClass}`,
                            count: term?.total_count,
                            "term-id": term?.id,
                            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                              className: "trusty-manage-bar-sec-label",
                              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("label", {
                                htmlFor: `${taxo?.key}-list-id${term?.id}`,
                                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                                  className: `${taxo?.key}-list check`,
                                  type: "checkbox",
                                  "term-name": term?.name,
                                  name: `${taxo.key}[]`,
                                  id: `${taxo?.key}-list-id${term?.id}`,
                                  value: `${taxo?.key}___${term?.id}`,
                                  onChange: e => handleTerm(e, taxo?.key, term),
                                  checked: handleTermChecked(taxo?.key, term)
                                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyLabelText["default"], {
                                  name: term?.name,
                                  count: term?.total_count
                                })]
                              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyRowActions, {
                                term: term,
                                taxonomy: taxo?.key,
                                onOpenSettings: () => handleTermSetting(term, taxo?.key)
                              }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
                                className: `fa ${isExpanded ? "fa-angle-up" : "fa-angle-down"} caf-builder-plus`,
                                "aria-hidden": "true",
                                onClick: e => {
                                  e.stopPropagation();
                                  toggleExpand(term.id);
                                },
                                style: {
                                  cursor: "pointer"
                                }
                              })]
                            }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
                              className: `children ${isExpanded ? "tc_caf_active_list" : ""}`,
                              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(NestedTerms, {
                                taxoKey: taxo.key,
                                childrenData: term.children_data,
                                expandedItems: expandedItems,
                                toggleExpand: toggleExpand,
                                handleTerm: handleTerm,
                                handleTermChecked: handleTermChecked
                              })
                            })]
                          }, term?.id);
                        })
                      });
                    })()
                  }), Array.isArray(taxo?.term_data) && taxo.term_data.length === 0 && (() => {
                    const isActive = firstRender === true ? isAnySelected(taxo.key) || expandedTaxoItems.includes(taxo.key) : expandedTaxoItems.includes(taxo.key);
                    if (isActive && !expandedTaxoItems.includes(taxo.key)) {
                      setExpandedTaxoItems(prev => {
                        const newArray = [...prev, taxo.key];
                        return Array.from(new Set(newArray));
                      });
                    }
                    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                      className: `tc-caf-taxo-term-list-section ${isActive ? "active-term-list" : ""}`,
                      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
                        className: "tc-cat-item-none",
                        children: "No Categories"
                      })
                    });
                  })()]
                }, `${section.id}-${taxo.key}-${indx}`))]
              });
              if (section.locked) {
                return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedWrap.TierLockedWrap, {
                  locked: true,
                  showProBadge: true,
                  className: "caf-builder-tier-locked-product-filters",
                  upgradeMessage: "Product filters (stock, sale, and rating) are available in Category Ajax Filter Pro.",
                  children: sectionContent
                }, section.id);
              }
              return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)((external_React_default()).Fragment, {
                children: sectionContent
              }, section.id);
            }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
              className: "tc-taxo-item-none",
              children: "No Taxonomy"
            }) :
            /*#__PURE__*/
            // )
            (0,external_ReactJSXRuntime_.jsx)(skeleton["default"], {
              active: true
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
              className: "setting-hr-main"
            })]
          })
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "caf-custom-field-data-container caf-filter-module-cf-cont caf-dropdown-custom-field-wrapper",
          children: [customFieldArray?.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              className: "setting-label-main",
              children: "Custom Field"
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "caf-filter-custom-field-items-wrapper",
              children: customFieldArray?.map((item, index) => {
                return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                  className: `caf-filter-custom-field-single-row ${openCfRows[index] ?? true ? "toggle-active" : ""} ${item?.custom_field_key === "0" ? "warning-cf-row" : ""}`,
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                    className: "caf-filter-label-inner-row-top-bar",
                    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-fl-query-cf-left-col",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("strong", {
                        className: "caf-fl-query-cf-name",
                        children: item?.custom_field_key === "0" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
                          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
                            src: caution_sign["default"],
                            alt: "",
                            className: "caf-fl-query-warning-icon"
                          }), " ", "Select Custom Field", " "]
                        }) : item?.custom_field_key
                      }), item?.custom_field_key !== "0" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
                          className: "caf-fl-query-cf-compare-label",
                          children: getCompareLabel(item?.compare_operator)
                        }), item?.custom_field_value_list?.length > 0 ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("strong", {
                          className: "caf-fl-query-cf-value",
                          children: formatCfValueListSummary(item.custom_field_value_list)
                        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
                          className: "caf-fl-query-cf-value warning-cf-value",
                          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
                            src: caution_sign["default"],
                            alt: "",
                            className: "caf-fl-query-warning-icon"
                          }), " ", "Add Values"]
                        })]
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-fl-query-cf-right-col",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(BuilderDeleteIcon["default"], {
                        onClick: () => deleteCustomField(index, item)
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                        icon: openCfRows[index] ?? true ? free_solid_svg_icons.faChevronUp : free_solid_svg_icons.faChevronDown,
                        className: "caf-fl-query-cf-fields-collapse-btn",
                        style: {
                          cursor: "pointer"
                        },
                        onClick: () => toggleCfRow(index)
                      })]
                    })]
                  }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                    className: "caf-fl-query-cf-fields-collapse-wrapper",
                    style: {
                      display: openCfRows[index] ?? true ? "flex" : "none"
                    },
                    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-fl-query-cf-fields-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                        className: "caf-filter-query-custom-field-select caf-header-dropdown",
                        options: metaKeys,
                        onChange: value => customFieldKeyFunc(value, "key", index),
                        style: {
                          width: "50%"
                        },
                        value: item?.custom_field_key
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                        className: "caf-filter-query-compare caf-header-dropdown",
                        options: customFieldCompareOperators,
                        onChange: value => handleCompareOperator(value, index),
                        style: {
                          width: "50%"
                        },
                        value: item?.compare_operator,
                        disabled: item?.custom_field_key === "0" ? true : false
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-filter-query-custom-field-adv-opt-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        className: "caf-filter-query-custom-field-adv-opt-top-bar",
                        onClick: () => toggleCfAdv(index),
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
                          className: "caf-filter-query-adv-opt-label",
                          children: "Advanced Options"
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                          icon: openCfAdv[index] ? free_solid_svg_icons.faChevronUp : free_solid_svg_icons.faChevronDown,
                          style: {
                            cursor: "pointer"
                          },
                          className: "caf-filter-query-adv-opt-toggle-btn"
                        })]
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        className: "caf-filter-query-meta-type-wrapper",
                        style: {
                          display: openCfAdv[index] ? "flex" : "none"
                        },
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                          classNames: {
                            root: "caf-builder-tooltip"
                          },
                          placement: "topLeft",
                          title: "Select meta value type for comparison.",
                          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                            children: "Meta Type"
                          })
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                          className: "caf-filter-query-meta-type",
                          options: customFieldMetaTypes,
                          onChange: value => handleMetaType(value, index),
                          style: {
                            width: "auto"
                          },
                          value: item?.meta_type,
                          disabled: item?.custom_field_key === "0" ? true : false
                        })]
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-filter-query-multi-value-field-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                        className: "caf-filter-query-multi-value-field-label",
                        children: "Add Value"
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        class: "caf-filter-query-multi-value-field-input-wrapper",
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                          style: {
                            width: "100%"
                          },
                          className: "caf-filter-query-multi-value-field",
                          type: "text",
                          placeholder: "Enter Value",
                          disabled: item?.custom_field_key === "0" ? true : false
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
                          title: "Add",
                          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlusCircleFilled["default"], {}),
                          className: "caf-filter-query-add-value-btn",
                          onClick: e => {
                            let input = e.currentTarget.closest(".caf-filter-query-multi-value-field-wrapper").querySelector("input");
                            if (input.value.trim() !== "") {
                              if (item?.custom_field_key === "0") {
                                return;
                              }
                              customFieldKeyFunc(input.value.trim(), "value", index);
                              input.value = "";
                            }
                          },
                          children: "Add"
                        })]
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        className: "caf-filter-query-multi-value-results",
                        children: [item?.custom_field_value_list?.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                          classNames: {
                            root: "caf-builder-tooltip"
                          },
                          placement: "topLeft",
                          title: "Enter values for this custom field rule.",
                          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                            children: "Values"
                          })
                        }), Object?.keys(item)?.map(key => {
                          if (key === "custom_field_value_list" && item[key]?.length > 0) {
                            return item[key]?.map((val, valueIndex) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                              className: "caf-filter-query-cf-value-item",
                              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                                className: "trusty-manage-bar-sec-label caf-filter-query-cf-value-row",
                                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_CfValueLabelWithEdit, {
                                  label: val?.label,
                                  onEdit: () => openCustomFieldLabelSetting(index, valueIndex, val)
                                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_CustomFieldValueRowActions, {
                                  showIconControl: settingData?.show_icon === "true",
                                  valueIcons: val?.icons,
                                  isDefault: val?.predefine === "true",
                                  onOpenSettings: () => openCustomFieldIconSetting(index, valueIndex, val),
                                  onToggleDefault: () => handleCfPredefinedInline(index, valueIndex, val?.predefine !== "true")
                                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(BuilderDeleteIcon["default"], {
                                  className: "caf-filter-query-cf-value-delete",
                                  onClick: () => deleteCustomFieldValue(index, valueIndex, item, val)
                                })]
                              })
                            }, valueIndex));
                          }
                          return null;
                        })]
                      })]
                    })]
                  })]
                }, index);
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "select-layout-btn filter-cf-ad-btn",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
              className: "caf-filter-query-add-new-cf-btn",
              onClick: () => addCustomField(),
              children: "Add Field"
            })
          })]
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-content-tab-row-placeholder",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          className: "setting-label-main",
          children: "Placeholder"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row caf-design-two-half",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Set placeholder text.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Text"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => handleAllOptionInput(e.target.value),
            value: allOptionInput
          })]
        })]
      }), iconsArray && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterShowIconLockedSection, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterShowIconModeProPanel, {
          data: props.data,
          indexes: props.indexes,
          iconsArray: iconsArray,
          onSettingChange: props.onSettingChange,
          enabled: (0,filterModuleTier.canUseFilterShowIcon)() && allIconSwitch,
          onToggle: onAllIconSwitch,
          tab: "all_option"
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterShowIconLockedSection, {
          unlockForColorSwatch: (0,filterModuleTier.canUseFilterColorSwatch)(resolvedPostType),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              className: "setting-label-main",
              children: (0,termVisualUtils.canUseColorSwatchFeatures)(resolvedPostType) ? "Show Icon / Color Swatch" : "Show Icon"
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-tab-row caf-design-two-half",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
                label: "Enable",
                property: "show_icon",
                onSettingChange: data => {
                  changeInitialDataOptChnage((0,filterModuleTier.applyFreeColorSwatchOnEnable)(data, resolvedPostType));
                },
                data: settingData,
                currValue: (0,filterModuleTier.canUseFilterShowIconOrColorSwatch)(resolvedPostType) ? settingData?.show_icon : "false"
              })
            }), (0,filterModuleTier.canUseFilterShowIconOrColorSwatch)(resolvedPostType) && settingData?.show_icon === "true" && (0,termVisualUtils.canUseColorSwatchFeatures)(resolvedPostType) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectMain["default"], {
                label: "Display As",
                property: "term_visual",
                classn: "caf-design-two-half",
                options: (0,filterModuleTier.getFilterTermVisualDisplayOptions)(),
                onSettingChange: data => {
                  if (!(0,filterModuleTier.canUseFilterShowIcon)() && data?.term_visual !== termVisualUtils.TERM_VISUAL_COLOR) {
                    changeInitialData({
                      ...data,
                      term_visual: termVisualUtils.TERM_VISUAL_COLOR
                    });
                    return;
                  }
                  changeInitialData(data);
                },
                data: {
                  ...settingData,
                  post_type: resolvedPostType,
                  term_visual: (0,filterModuleTier.canUseFilterShowIcon)() ? (0,termVisualUtils.resolveTermVisual)({
                    ...settingData,
                    post_type: resolvedPostType
                  }) : termVisualUtils.TERM_VISUAL_COLOR
                }
              }), (0,termVisualUtils.isTermVisualColor)({
                ...settingData,
                post_type: resolvedPostType,
                term_visual: (0,filterModuleTier.canUseFilterShowIcon)() ? settingData?.term_visual : termVisualUtils.TERM_VISUAL_COLOR
              }) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "module-content-tab-row caf-design-two-half",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                  classNames: {
                    root: "caf-builder-tooltip"
                  },
                  placement: "topLeft",
                  title: "Choose how the term label appears with the color swatch.",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                    children: "Label"
                  })
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "hoverswitchguard",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(segmented["default"], {
                    value: (0,termVisualUtils.resolveTermLabelDisplay)(settingData),
                    style: {
                      marginBottom: 10
                    },
                    onChange: value => {
                      changeInitialDataOptChnage((0,termVisualUtils.applyTermLabelDisplay)({
                        ...settingData
                      }, value));
                    },
                    className: "hoverTabCaf",
                    options: [{
                      label: "Show",
                      value: "show"
                    }, {
                      label: "Hide",
                      value: "hide"
                    }, {
                      label: "Tooltip",
                      value: "tooltip"
                    }]
                  })
                })]
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
              className: "setting-hr-main"
            })]
          })
        }), effectiveDataSource === "taxonomy" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              className: "setting-label-main",
              children: "Show Count"
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-tab-row caf-design-two-half",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
                label: "Enable",
                property: "show_count",
                onSettingChange: changeInitialDataOptChnage,
                data: settingData,
                currValue: settingData?.show_count
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [settingData?.show_count === 'true' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectMain["default"], {
                label: "Separator",
                property: "count_separator",
                classn: "caf-design-two-half",
                options: [{
                  value: "brackets",
                  label: "(Brackets)"
                }, {
                  value: "hyphen",
                  label: "Hyphen - "
                }, {
                  value: "none",
                  label: "None"
                }, {
                  value: "custom",
                  label: "Custom"
                }],
                onSettingChange: changeInitialData,
                data: settingData,
                defaultValue: settingData?.count_separator ?? "none"
              }), settingData?.count_separator === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                  className: "module-content-tab-row caf-design-two-half",
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                    classNames: {
                      root: "caf-builder-tooltip"
                    },
                    placement: "topLeft",
                    title: "Set count prefix text.",
                    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                      children: "Prefix"
                    })
                  }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                    type: "text",
                    value: settingData?.count_prefix || '',
                    placeholder: "e.g. (",
                    onChange: e => {
                      changeInitialData({
                        ...settingData,
                        count_prefix: e.target.value
                      });
                    }
                  })]
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                  className: "module-content-tab-row caf-design-two-half",
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                    classNames: {
                      root: "caf-builder-tooltip"
                    },
                    placement: "topLeft",
                    title: "Set count suffix text.",
                    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                      children: "Suffix"
                    })
                  }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                    type: "text",
                    value: settingData?.count_suffix || '',
                    placeholder: "e.g. )",
                    onChange: e => {
                      changeInitialData({
                        ...settingData,
                        count_suffix: e.target.value
                      });
                    }
                  })]
                })]
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
              className: "setting-hr-main"
            })]
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterTermShowMoreLockedSection, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTermShowMoreProPanel["default"], {
            settingData: settingData,
            onSettingChange: changeInitialDataOptChnage
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row no-pad-0",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            className: "setting-label-main",
            children: "Filter Label"
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
              label: "Enable",
              property: "label",
              property2: "is_label",
              onSettingChange: changeInitialData,
              data: settingData,
              currValue: settingData.label.is_label
            })
          }), checkLabel && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: "caf-filter-label-inner-row",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "module-content-tab-row caf-design-two-half",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                  classNames: {
                    root: "caf-builder-tooltip"
                  },
                  placement: "topLeft",
                  title: "Set filter label text.",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                    children: "Label Text"
                  })
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
                  onChange: e => handleLabel(e.target.value),
                  value: labelInput
                })]
              }), iconsArray && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterLabelShowIconLockedSection, {
                className: "module-content-tab-row caf-builder-show-label-icon",
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterLabelShowIconProPanel["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  iconsArray: iconsArray,
                  onSettingChange: props.onSettingChange,
                  enabled: (0,filterModuleTier.canUseLabelShowIcon)() && labelIconSwitch,
                  onToggle: onLabelIconSwitch,
                  label: "Show Icons"
                })
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterLabelCollapseLockedSection, {
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterLabelCollapseProPanel, {
                settingData: settingData,
                onSettingChange: changeInitialData,
                enabled: (0,filterModuleTier.canUseFilterLabelCollapse)() && toggle.enable
              })
            })]
          })]
        })]
      }), (0,filterModuleTier.canUseFilterCustomField)() && effectiveDataSource === "custom_field" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTermIconSettingsModal["default"], {
        title: termDetail[3],
        open: termSettingPopUp,
        onSave: handleTermSettingSave,
        onCancel: handleTermSettingCancel,
        saveDisabled: !termDetail[5],
        termSelected: termDetail[5],
        iconsArray: iconsArray,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: props.onSettingChange,
        termDetail: termDetail,
        contentIconDetail: contentIconDetail,
        setcontentIconDetail: setcontentIconDetail,
        iconSwitch: iconSwitch,
        setIconSwitch: setIconSwitch,
        selectedIcon: selectedIcon,
        setSelectedIcon: setSelectedIcon,
        checkError: checkError,
        showAddAsParentSwitch: termDetail[4] && (0,filterBuilderUiFlags.canShowAddAsParentSwitch)(),
        isParent: isParent,
        onToggleParent: handleIsParent,
        destroyOnHidden: true,
        className: "caf-dropdown-filter-term-setting-modal caf-builder-modal"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(modal["default"], {
        title: labelValueCf || keyValueCf || "Edit Value",
        open: termSettingPopUpCusFieldLabel,
        onOk: handleSaveCustomFieldLabel,
        onCancel: handleCancelCustomFieldLabel,
        className: "caf-dropdown-filter-cf-label-modal caf-builder-modal",
        footer: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          onClick: handleCancelCustomFieldLabel,
          children: "Cancel"
        }, "back"), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          type: "primary",
          onClick: handleSaveCustomFieldLabel,
          children: "Save"
        }, "save")],
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Enter option key value.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Key"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => setKeyValueCf(e.target.value),
            value: keyValueCf,
            disabled: true
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Enter option label text.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Label"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => setLabelValueCf(e.target.value),
            value: labelValueCf
          })]
        }), checkError && (keyValueCf === "" || labelValueCf === "") && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Both fields are mandatory.",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            style: {
              color: "red"
            },
            children: "Both Key and Label fields are required."
          })
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterCfTermIconSettingsModal["default"], {
        title: labelValueCf || keyValueCf || "Value Icon",
        open: termSettingPopUpCusFieldIcon,
        onSave: handleSaveCustomFieldIcon,
        onCancel: handleCancelCustomFieldIcon,
        iconsArray: iconsArray,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: props.onSettingChange,
        contentIconDetail: contentIconDetailCusField,
        setcontentIconDetail: setcontentIconDetailCusField,
        iconSwitch: iconSwitchCusField,
        setIconSwitch: setIconSwitchCusField,
        selectedIcon: selectedIconCusField,
        setSelectedIcon: setSelectedIconCusField,
        destroyOnHidden: true,
        className: "caf-dropdown-filter-cf-icon-modal caf-builder-modal"
      })]
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(skeleton["default"], {
      active: true
    })
  });
});
/* harmony default export */ const DropdownFilter = (DropdownFilter1);
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/design-components/common-component/InputMain.js
var InputMain = __webpack_require__("./src/MainComponents/FilterComponents/components/design-components/common-component/InputMain.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/FilterTypes/CheckboxFilter.js






































const CheckboxFilter_normalizeCustomFieldData = value => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};
const CheckboxFilter_getPlainTextFromHtml = html => {
  const value = String(html ?? "");
  return value.replace(/<[^>]+>/g, "").trim();
};
const CheckboxFilter = (0,external_React_.memo)(props => {
  const {
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  const mainBuilderData = (0,useResolvedMainBuilderData.useResolvedMainBuilderData)(props.mainBuilderData);
  let items = [...props.data];
  let settingData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.settings
  };
  let styleData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.style
  };
  let selectedDevice = props.selectedDevice;
  const resolvedPostType = (0,useResolvedMainBuilderData.getResolvedFilterPostType)(mainBuilderData, settingData?.post_type);
  const singlePostData = (0,useResolvedMainBuilderData.getResolvedSinglePostData)(mainBuilderData);
  const [postType, setPostType] = (0,external_React_.useState)(resolvedPostType);
  let meta_fields = singlePostData?.meta_fields;
  let fieldOptions = [{
    label: "Select Field",
    value: "0"
  }];
  if (meta_fields) {
    Object.keys(meta_fields)?.map((item, i) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
      children: fieldOptions.push({
        value: item,
        label: item
      })
    }));
  }
  const [taxonomyList, setTaxonomyList] = (0,external_React_.useState)([]);
  //   const [filterType, setFilterType] = useState(settingData.filter_type);
  const [dataSource, setDataSource] = (0,external_React_.useState)((0,filterModuleTier.resolveFilterDataSource)(settingData.data_source));
  const effectiveDataSource = (0,filterModuleTier.canUseFilterCustomField)() ? dataSource : "taxonomy";
  const {
    importLoading: wooColorImportLoading,
    resetLoading: wooColorResetLoading,
    handleImport: handleImportWooColors,
    handleReset: handleResetWooColors
  } = (0,wooAttributeColorImport.useWooAttributeColorActions)({
    data: props.data,
    rowindex,
    columnindex,
    moduleindex,
    resolvedPostType,
    onSettingChange: props.onSettingChange,
    onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
  });
  const [termSettingPopUp, setTermSettingPopUp] = (0,external_React_.useState)(false);
  const [termSettingPopUpCusFieldLabel, setTermSettingPopUpCusFieldLabel] = (0,external_React_.useState)(false);
  const [termSettingPopUpCusFieldIcon, setTermSettingPopUpCusFieldIcon] = (0,external_React_.useState)(false);
  const [termPredefinedCusField, setTermPredefinedCusField] = (0,external_React_.useState)(false);
  const [termDetail, setTermDetail] = (0,external_React_.useState)([]);
  const [termPredefined, setTermPredefined] = (0,external_React_.useState)(false);
  const [isParent, setIsParent] = (0,external_React_.useState)(false);
  const [iconsArray, setIconsArray] = (0,external_React_.useState)("");
  const [isLoading, setIsLoading] = (0,external_React_.useState)(false);
  const [LoadingCatogries, setLoadingCatogries] = (0,external_React_.useState)(true);
  const [contentIconDetail, setcontentIconDetail] = (0,external_React_.useState)({
    icon: "",
    position: "before",
    iconChecked: true,
    type: 'icon'
  });
  const [iconSwitch, setIconSwitch] = (0,external_React_.useState)("");
  const [selectedIcon, setSelectedIcon] = (0,external_React_.useState)("");
  const [labelIconSwitch, setLabelIconSwitch] = (0,external_React_.useState)((0,filterModuleTier.canUseLabelShowIcon)() ? settingData?.label?.icons?.visibility : false);
  const [metaKeys, setMetaKeys] = (0,external_React_.useState)([]);
  // custom field
  const [contentIconDetailCusField, setcontentIconDetailCusField] = (0,external_React_.useState)({
    icon: "",
    position: "before",
    iconChecked: false
  });
  const [iconSwitchCusField, setIconSwitchCusField] = (0,external_React_.useState)("");
  const [selectedIconCusField, setSelectedIconCusField] = (0,external_React_.useState)("");
  const [currCustomFieldValue, setCurrCustomFieldValue] = (0,external_React_.useState)([]);
  const [checkError, setCheckError] = (0,external_React_.useState)(false);
  const [checkLabel, setCheckLabel] = (0,external_React_.useState)(settingData.label.is_label === "false" ? false : true);
  const [labelInput, setLabelInput] = (0,external_React_.useState)(settingData.label.value);
  const [toggle, setToggle] = (0,external_React_.useState)(() => (0,filterModuleTier.resolveFilterLabelCollapseToggleState)(settingData));
  // const [allOptionInput, setAllOptionInput] = useState(
  //   settingData.dropdown_data.all_option.value
  // );
  const [customFieldKey, setCustomFieldKey] = (0,external_React_.useState)(settingData?.custom_field_data?.custom_field_key || (Array.isArray(settingData?.custom_field_data) ? settingData.custom_field_data?.[0]?.custom_field_key : ""));
  const [customFieldValue, setCustomFieldValue] = (0,external_React_.useState)("");
  const [customFieldArray, setCustomFieldArray] = (0,external_React_.useState)(CheckboxFilter_normalizeCustomFieldData(settingData.custom_field_data));
  const [openCfRows, setOpenCfRows] = (0,external_React_.useState)({});
  const [openCfAdv, setOpenCfAdv] = (0,external_React_.useState)({});
  const [compareOperator, setCompareOperator] = (0,external_React_.useState)(settingData?.custom_field_data?.compare_operator || (Array.isArray(settingData?.custom_field_data) ? settingData.custom_field_data?.[0]?.compare_operator : "="));
  const [keyValueCf, setKeyValueCf] = (0,external_React_.useState)("");
  const [labelValueCf, setLabelValueCf] = (0,external_React_.useState)("");
  const [taxonomyListArray, setTaxonomyListArray] = (0,external_React_.useState)([]);
  const productFiltersLocked = !(0,filterModuleTier.canUseWooProductFilters)();
  const showProductFiltersSection = String(resolvedPostType || "") === "product" && (0,capabilities.isWooCommerceActive)() && (0,capabilities.canUseProductPostType)();
  const taxonomyPickerSections = (0,external_React_.useMemo)(() => (0,ModuleContentData_taxonomyPickerSections.getTaxonomyPickerSections)(taxonomyListArray, {
    ensureProductFiltersSection: showProductFiltersSection && productFiltersLocked,
    productFiltersLocked: showProductFiltersSection && productFiltersLocked
  }), [taxonomyListArray, showProductFiltersSection, productFiltersLocked]);
  const [firstRender, setFirstRender] = (0,external_React_.useState)(true);
  const [expandedTaxoItems, setExpandedTaxoItems] = (0,external_React_.useState)([]);
  const [expandedItems, setExpandedItems] = (0,external_React_.useState)([]);
  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";
  (0,external_React_.useEffect)(() => {
    setTaxonomyList(settingData?.taxonomy_data);
  }, [settingData?.taxonomy_data]);

  // useEffect(() => {
  //   let value = "";
  //   if (customFieldArray.length > 0) {
  //     value = customFieldArray.reduce(
  //       (accu, curr) => accu + `${curr.key},`,
  //       ""
  //     );
  //     setCustomFieldValue(value);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (props.saveLayoutClick == true) {
  //     func();
  //     setTimeout(() => {
  //       props.setSaveLayoutClick(false);
  //     }, 600);
  //   }
  //   setCustomFieldKey(settingData.custom_field_data.custom_field_key);
  //   setCustomFieldArray(settingData.custom_field_data.custom_field_value);
  //   if (settingData.custom_field_data.custom_field_value?.length == 0) {
  //     setCustomFieldValue("");
  //   }
  // }, [settingData]);

  (0,external_React_.useEffect)(() => {
    setDataSource(settingData.data_source);
  }, [settingData.data_source]);
  (0,external_React_.useEffect)(() => {
    const normalizedCustomFields = CheckboxFilter_normalizeCustomFieldData(settingData?.custom_field_data);
    setCustomFieldArray(normalizedCustomFields);
    setCompareOperator(settingData?.custom_field_data?.compare_operator || normalizedCustomFields?.[0]?.compare_operator || "=");
    setCustomFieldKey(settingData?.custom_field_data?.custom_field_key || normalizedCustomFields?.[0]?.custom_field_key || "");
    const pruneCollapseState = (prev, length) => {
      const next = {
        ...prev
      };
      Object.keys(next).forEach(key => {
        if (Number(key) >= length) {
          delete next[key];
        }
      });
      return next;
    };
    setOpenCfRows(prev => pruneCollapseState(prev, normalizedCustomFields.length));
    setOpenCfAdv(prev => pruneCollapseState(prev, normalizedCustomFields.length));
  }, [settingData.custom_field_data]);
  (0,external_React_.useEffect)(() => {
    setCheckError(false);
  }, [iconSwitch, iconSwitchCusField]);

  // useEffect(() => {
  //   if (settingData?.label?.icons?.icon == "") {
  //     settingData.label.icons = {};
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //       settingData;
  //     props.onSettingChange(props.data);
  //   }
  // }, [checkLabel]);

  (0,external_React_.useEffect)(() => {
    let icons = {};
    if (termDetail?.length > 0) {
      if (termDetail[6] && termDetail[6]?.predefine === "true") {
        setTermPredefined(true);
      } else {
        setTermPredefined(false);
      }
      if (termDetail[6]?.is_parent === "true") {
        setIsParent(true);
      } else {
        setIsParent(false);
      }
      icons = termDetail[6]?.icons;
      const colorMode = (0,termVisualUtils.isTermVisualColor)({
        ...settingData,
        post_type: resolvedPostType
      });
      const swatchColor = (0,termVisualUtils.getTermSwatchColor)(icons);
      if (colorMode) {
        setIconSwitch(Boolean(swatchColor));
        setcontentIconDetail({
          icon: swatchColor || "#000000",
          position: icons?.position || "before",
          iconChecked: Boolean(swatchColor),
          type: "color"
        });
        setSelectedIcon(swatchColor || "");
        setCheckError(false);
        return;
      }
      const iconSource = icons?.type === "color" && icons?.icon_backup ? icons.icon_backup : icons;
      setIconSwitch(iconSource?.icon ? true : false);
      if (iconSource && Object?.keys(iconSource).length !== 0) {
        let data = contentIconDetail;
        data.icon = iconSource.icon;
        data.position = icons?.position || iconSource.position || "before";
        data.iconChecked = true;
        data.type = iconSource.type || "icon";
        setcontentIconDetail(data);
      }
      if (iconSource?.type === 'icon') {
        setSelectedIcon(iconSource?.icon ? iconSource.icon : "");
      } else {
        setSelectedIcon(iconSource?.icon?.icon?.url ? iconSource.icon.icon.url : iconSource?.icon?.url || "");
      }
      setCheckError(false);
    } else {
      return;
    }
  }, [termDetail[0]]);
  (0,external_React_.useEffect)(() => {
    let valueData = currCustomFieldValue[2];
    setKeyValueCf(valueData?.key || "");
    setLabelValueCf(valueData?.label || "");
    if (valueData && valueData.predefine === "true") {
      setTermPredefinedCusField(true);
    } else {
      setTermPredefinedCusField(false);
    }
    let icons = {};
    if (valueData && Object?.keys(valueData).length !== 0) {
      icons = valueData?.icons || {};
      let data = contentIconDetailCusField;
      data.icon = icons?.icon || "";
      data.position = icons?.position || "before";
      data.iconChecked = true;
      data.type = icons?.type || "icon";
      setcontentIconDetailCusField(data);
    }
    if (icons?.type === 'icon') {
      setSelectedIconCusField(icons?.icon ? icons.icon : "");
    } else {
      setSelectedIconCusField(icons?.icon?.icon?.url ? icons.icon.icon.url : "");
    }
    setCheckError(false);
  }, [currCustomFieldValue[0], currCustomFieldValue[1]]);
  (0,external_React_.useEffect)(() => {
    const fetchIcons = async () => {
      try {
        const response = await client["default"].get(icons_url);
        if (response.data) {
          setIconsArray(response.data);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };
    fetchIcons();
  }, []);
  (0,external_React_.useEffect)(() => {
    setPostType(resolvedPostType);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, [resolvedPostType]);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await apiClient.get(
  //           baseURL + "get-taxonomy/?post-type=" + postType
  //         );
  //         if (response.data && response.data.status === "success") {
  //           setTaxonomyList(response.data.taxonomy_list);
  //           //setIsLoading(true);
  //           TemrsRefresh();
  //         }
  //       } catch (error) {
  //         console.error("Error fetching data:", error.message);
  //       }
  //     };
  //     fetchData();
  //   }, [postType]);

  //   const onChange = (e) => {
  //     let items = [...props.data];
  //     let item = {
  //       ...items[rowindex].data[columnindex].data[moduleindex].settings,
  //     };
  //     let value = e.target.value;
  //     if (item.taxonomy_data) {
  //       if (item.post_type != postType && item.taxonomy_data.length > 0) {
  //         item.taxonomy_data = [];
  //       }
  //       const isValuePresent = item.taxonomy_data?.some((obj) =>
  //         Object.values(obj).includes(value)
  //       );
  //       if (isValuePresent) {
  //         item.taxonomy_data = item.taxonomy_data.filter(
  //           (element) => element.key !== value
  //         );
  //       } else {
  //         let itemData = { key: value, term_data: [] };
  //         item.taxonomy_data.push(itemData);
  //         item.post_type = postType;
  //       }
  //     } else {
  //       let itemData = { key: value, term_data: [] };
  //       item.taxonomy_data.push(itemData);
  //     }
  //     items[rowindex].data[columnindex].data[moduleindex].settings = item;
  //     props.onSettingChange(props.data);
  //     setTimeout(() => {
  //       func();
  //     }, 500);
  //     TermChecked();
  //   };

  (0,external_React_.useEffect)(() => {
    let fieldOptions = [{
      label: "Select Field",
      value: "0"
    }];
    if (meta_fields) {
      Object.keys(meta_fields)?.map((item, i) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: fieldOptions.push({
          value: item,
          label: item
        })
      }));
    }
    setMetaKeys(fieldOptions);
    setCustomFieldKey("0");
  }, [singlePostData?.value]);
  const checkboxSkin = [{
    label: "Checkbox Skin 1",
    value: "checkbox_skin1"
  }, {
    label: "Checkbox Skin 2",
    value: "checkbox_skin2"
  }];
  const dataSourceOptions = [{
    label: "Taxonomy",
    value: "taxonomy"
  }, {
    label: "Custom Field",
    value: "custom_field"
  }];
  const customFieldCompareOperators = [{
    label: "is Equal to",
    value: "="
  }, {
    label: "is Not Equal to",
    value: "!="
  }, {
    label: ">",
    value: ">"
  }, {
    label: ">=",
    value: ">="
  }, {
    label: "<",
    value: "<"
  }, {
    label: "<=",
    value: "<="
  }
  // {
  //   label: "LIKE",
  //   value: "LIKE",
  // },
  // {
  //   label: "NOT LIKE",
  //   value: "NOT LIKE",
  // },
  // {
  //   label: "IN",
  //   value: "IN",
  // },
  // {
  //   label: "NOT IN",
  //   value: "NOT IN",
  // },
  // {
  //   label: "BETWEEN",
  //   value: "BETWEEN",
  // },
  // {
  //   label: "NOT BETWEEN",
  //   value: "NOT BETWEEN",
  // },
  // {
  //   label: "EXISTS",
  //   value: "EXISTS",
  // },
  // {
  //   label: "NOT EXISTS",
  //   value: "NOT EXISTS",
  // },
  // {
  //   label: "REGEXP",
  //   value: "REGEXP",
  // },
  // {
  //   label: "NOT REGEXP",
  //   value: "NOT REGEXP",
  // },
  ];
  const customFieldMetaTypes = [{
    label: "CHAR",
    value: "CHAR"
  }, {
    label: "NUMERIC",
    value: "NUMERIC"
  }
  // {
  //   label: "BINARY",
  //   value: "BINARY",
  // },
  // {
  //   label: "DATE",
  //   value: "DATE",
  // },
  // {
  //   label: "DATETIME",
  //   value: "DATETIME",
  // },
  // {
  //   label: "DECIMAL",
  //   value: "DECIMAL",
  // },
  // {
  //   label: "SIGNED",
  //   value: "SIGNED",
  // },
  // {
  //   label: "TIME",
  //   value: "TIME",
  // },
  // {
  //   label: "UNSIGNED",
  //   value: "UNSIGNED",
  // },
  ];
  const handleTermSettingCancel = () => {
    setTermDetail([]);
    setTermSettingPopUp(false);
    setTermPredefined(false);
    setIsParent(false);
    setcontentIconDetail(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: 'icon'
    }));
  };
  const handleTermSettingSave = () => {
    const {
      freshItems,
      settingsRef
    } = (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxonomyExists = newtaxonomyData.some(data => data.key === termDetail[1]);
    if (taxonomyExists) {
      // if (contentIconDetail.icon === "" && contentIconDetail.iconChecked) {
      //   setCheckError(true);
      //   return;
      // }

      const allowMultipleDefaults = (0,filterSettingsSnapshot.allowsMultipleDefaultTerms)(settingsRef);
      if (termPredefined === true) {
        if (allowMultipleDefaults) {
          if (!settingsRef.predefined_terms?.includes(termDetail[2])) {
            settingsRef.predefined_terms.push(termDetail[2]);
          }
        } else {
          settingsRef.predefined_terms = [termDetail[2]];
          const targetId = (0,filterSettingsSnapshot.extractNumericTermIdFromPredefinedKey)(termDetail[2]);
          newtaxonomyData = newtaxonomyData.map(group => ({
            ...group,
            term_data: (0,filterSettingsSnapshot.setSingleDefaultPredefineInTree)((0,filterSettingsSnapshot.clearAllTermPredefineInTree)(group.term_data), targetId)
          }));
        }
      } else if (settingsRef.predefined_terms?.includes(termDetail[2])) {
        settingsRef.predefined_terms = settingsRef.predefined_terms.filter(item => item !== termDetail[2]);
      }

      // ✅ find and update the taxonomy inside settingData
      newtaxonomyData = newtaxonomyData.map(data => {
        if (data.key !== termDetail[1]) return data;
        let termData = [...data.term_data];
        let childObjIds = [];
        let allChildObjects = [];
        // ✅ handle parent logic
        if (isParent) {
          const txoArray = taxonomyListArray.find(d => d.key === termDetail[1]);
          if (txoArray) {
            let taxoTermData = [...txoArray.term_data];
            const parentTerm = taxoTermData.find(t => t.id === termDetail[0]);
            if (parentTerm) {
              const collectChildrenRecursive = (children, topParentId) => {
                if (!Array.isArray(children)) return;
                children.forEach(child => {
                  //let termIsPresent = termData.some((term) => term.key === child?.id);
                  // helper function to recursively find term by key
                  const findNestedTermByKey = (terms, key) => {
                    for (const term of terms) {
                      if (term.key === key) {
                        return term;
                      }
                      if (Array.isArray(term.children_data) && term.children_data.length > 0) {
                        const found = findNestedTermByKey(term.children_data, key);
                        if (found) return found;
                      }
                    }
                    return null;
                  };
                  const savedTerm = findNestedTermByKey(termData, child?.id);
                  const termIsPresent = !!savedTerm;
                  if (termIsPresent) {
                    //let savedTerm = termData.find((term) => term.key === child?.id);
                    const childCopy = {
                      key: child?.id,
                      value: child?.name,
                      predefine: savedTerm.predefine,
                      icons: savedTerm.icons,
                      parent_id: topParentId,
                      children_data: [],
                      children: "false",
                      count: child?.count
                    };
                    allChildObjects.push(childCopy);
                    childObjIds.push(child.id);
                  }
                  // else{
                  //     const childCopy = {
                  //     key: child?.id,
                  //     value: child?.name,
                  //     predefine: 'false',
                  //     icons: {},
                  //     parent_id: topParentId,
                  //     children_data: [],
                  //     children: "false",
                  //   };
                  //   allChildObjects.push(childCopy);
                  //   childObjIds.push(child.id);
                  // }

                  if (Array.isArray(child.children_data) && child.children_data.length > 0) {
                    collectChildrenRecursive(child.children_data, topParentId);
                  }
                });
              };
              if (Array.isArray(parentTerm.children_data) && parentTerm.children_data.length > 0) {
                collectChildrenRecursive(parentTerm.children_data, termDetail[0]);
              }
              // 🧹 remove nested children from top-level termData
              termData = termData.filter(term => !childObjIds.includes(term.key));
              // return
            }
          }
        } else {
          const parentTerm = termData.find(t => t.key === termDetail[0]);
          //  return
          if (parentTerm && Array.isArray(parentTerm.children_data) && parentTerm.children_data.length > 0) {
            // ✅ Step 1: copy all children
            allChildObjects = parentTerm.children_data;

            // ✅ Step 2: empty children_data from parentTerm
            parentTerm.children_data = [];

            // ✅ Step 3: update termData (remove old parentTerm and reinsert updated one)
            termData = termData.map(term => term.id === parentTerm.id ? {
              ...term,
              children_data: []
            } : term);

            // ✅ Step 4: push all children into termData
            termData = [...termData, ...allChildObjects];
          }
        }
        // ✅ update parent object
        const hasMatchingChild = (children = []) => {
          return children.some(child => child.key === termDetail[0] || Array.isArray(child.children_data) && hasMatchingChild(child.children_data));
        };

        // return 
        const updatedTermData = termData.map(obj => {
          if (obj.key === termDetail[0]) {
            obj.predefine = termPredefined ? "true" : "false";
            if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
              if ((0,termVisualUtils.isTermVisualColor)(settingsRef) || contentIconDetail.type === "color") {
                obj.icons = (0,termVisualUtils.buildColorTermIcons)(obj.icons, contentIconDetail.icon, contentIconDetail.position);
              } else {
                obj.icons = (0,termVisualUtils.buildIconTermIcons)(obj.icons, {
                  icon: contentIconDetail.icon,
                  position: contentIconDetail.position,
                  type: contentIconDetail?.type || "icon"
                });
              }
            } else if ((0,termVisualUtils.isTermVisualColor)(settingsRef)) {
              const preserved = obj.icons?.icon_backup ? {
                type: obj.icons.icon_backup.type || "icon",
                icon: obj.icons.icon_backup.icon,
                position: obj.icons?.position || "before",
                icon_backup: obj.icons.icon_backup,
                color: ""
              } : {};
              obj.icons = preserved;
            } else {
              obj.icons = {
                ...(obj.icons?.color ? {
                  color: obj.icons.color
                } : {})
              };
            }
            if (isParent) {
              obj.children_data = [...allChildObjects];
              obj.is_parent = "true";
            } else {
              obj.is_parent = "false";
            }
          } else {
            updateNestedTerm(obj.children_data, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects, settingsRef);
          }
          return obj;
        });

        // ✅ return updated taxonomy data object
        return {
          ...data,
          term_data: updatedTermData
        };
      });
      (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
        freshItems,
        rowindex,
        columnindex,
        moduleindex,
        settingsRef,
        nexttaxonomyData: newtaxonomyData,
        onSettingChange: props.onSettingChange,
        onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
      });

      // ✅ Reset form states
      setTermSettingPopUp(false);
      setTermPredefined(false);
      setCheckError(false);
      setcontentIconDetail({
        icon: "",
        position: "before",
        iconChecked: false,
        type: 'icon'
      });
      setTermDetail([null]);
    }
  };
  const updateNestedTerm = (children, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects, settingsRef = settingData) => {
    if (!Array.isArray(children)) return;
    children.forEach(child => {
      if (child.key === termDetail[0]) {
        // ✅ same logic as main update
        child.predefine = termPredefined ? "true" : "false";
        if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
          if ((0,termVisualUtils.isTermVisualColor)(settingsRef) || contentIconDetail.type === "color") {
            child.icons = (0,termVisualUtils.buildColorTermIcons)(child.icons, contentIconDetail.icon, contentIconDetail.position);
          } else {
            child.icons = (0,termVisualUtils.buildIconTermIcons)(child.icons, {
              icon: contentIconDetail.icon,
              position: contentIconDetail.position,
              type: contentIconDetail?.type || "icon"
            });
          }
        } else if ((0,termVisualUtils.isTermVisualColor)(settingsRef)) {
          child.icons = child.icons?.icon_backup ? {
            type: child.icons.icon_backup.type || "icon",
            icon: child.icons.icon_backup.icon,
            position: child.icons?.position || "before",
            icon_backup: child.icons.icon_backup,
            color: ""
          } : {};
        } else {
          child.icons = {
            ...(child.icons?.color ? {
              color: child.icons.color
            } : {})
          };
        }
        if (isParent) {
          child.children_data = [...allChildObjects];
          child.is_parent = "true";
        } else {
          child.is_parent = "false";
        }
      } else if (Array.isArray(child.children_data) && child.children_data.length > 0) {
        // 🔁 recursive call for deeper nested children
        updateNestedTerm(child.children_data, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects, settingsRef);
      }
    });
  };
  const handleTermSwitch = checked => {
    setTermPredefined(checked);
  };
  const handleIsParent = checked => {
    setIsParent(checked);
  };
  const checkTermData = (id, taxo) => {
    //if click on terms settings then check , it present or not in the taxonomy data
    if (id) {
      for (let index = 0; index < settingData.taxonomy_data?.length; index++) {
        let data = settingData.taxonomy_data[index];
        if (data.key == taxo) {
          let termData = data.term_data;
          for (let i = 0; i < termData.length; i++) {
            let obj = termData[i];
            let childData = obj.children_data;
            for (let j = 0; j < childData.length; j++) {
              if (childData[j].key == id) {
                return true;
              }
            }
            if (obj.key == id) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  const handleLabel = val => {
    setLabelInput(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = {
          ...s.label,
          value: val
        };
      }
    });
  };
  const removeParentChild = () => {
    settingData?.taxonomy_data.map((data, index) => {
      if (data.term_data?.length > 0) {
        data.term_data.map(item => {
          if (item.children_data?.length > 0) {
            data.term_data.push(...item.children_data);
            item.children_data = [];
            item.is_parent = "false";
          }
        });
      }
    });
    setLoadingCatogries(false);
    setTimeout(() => {
      setLoadingCatogries(true);
    }, 400);
  };
  const handleEdit = () => {
    props.openBuilderSetting(true);
  };
  const seedShowMoreStyleIfNeeded = moduleRef => {
    if (String(moduleRef?.settings?.term_show_more) !== "true") {
      return;
    }
    if (!moduleRef.style) {
      moduleRef.style = {};
    }
    if (!moduleRef.style.showmore && FilterComponents_styleData.fModuleStyle?.showmore) {
      moduleRef.style.showmore = JSON.parse(JSON.stringify(FilterComponents_styleData.fModuleStyle.showmore));
    }
  };
  const changeInitialData = data => {
    setDataSource(data.data_source);
    if (data.data_source !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label === "false" ? false : true);
    if (data.label.is_label === "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    setToggle(prev => ({
      ...prev,
      enable: (0,filterModuleTier.resolveFilterLabelCollapseToggleState)(data).enable
    }));
    if (!(0,filterModuleTier.canUseFilterLabelCollapse)() || data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle(prev => ({
        ...prev,
        close: false
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);
    let nextSettings = (0,filterSettingsSnapshot.enforceSingleDefaultTermsInSettings)((0,filterModuleTier.applyFilterLabelCollapseTierToSettings)(data));
    nextSettings = (0,termShowMoreUtils.ensureTermShowMoreSettingsDefaults)(nextSettings);
    const prevVisual = (0,termVisualUtils.resolveTermVisual)({
      ...settingData,
      post_type: resolvedPostType
    });
    const nextVisual = (0,termVisualUtils.resolveTermVisual)((0,filterModuleTier.resolveSettingsForTermVisualDefaults)(nextSettings, resolvedPostType));
    if (prevVisual !== termVisualUtils.TERM_VISUAL_COLOR && nextVisual === termVisualUtils.TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: termVisualUtils.TERM_VISUAL_COLOR
      };
      nextSettings = (0,termVisualUtils.ensureDefaultSwatchColorsOnSettings)(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    }
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
      patchModule: seedShowMoreStyleIfNeeded
    });
  };
  const changeInitialDataOptChange = data => {
    setDataSource(data.data_source);
    if (data.data_source !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label === "false" ? false : true);
    if (data.label.is_label === "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    setToggle(prev => ({
      ...prev,
      enable: (0,filterModuleTier.resolveFilterLabelCollapseToggleState)(data).enable
    }));
    if (!(0,filterModuleTier.canUseFilterLabelCollapse)() || data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle(prev => ({
        ...prev,
        close: false
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);

    // styleData.meta1[selectedDevice].default.flexFlow = "row";
    // styleData.meta1[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta1[selectedDevice].default.alignItems = "flex-start";

    // styleData.meta2[selectedDevice].default.flexFlow = "row";
    // styleData.meta2[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta2[selectedDevice].default.alignItems = "flex-start";

    // styleData.meta3[selectedDevice].default.flexFlow = "row";
    // styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta3[selectedDevice].default.alignItems = "flex-start";

    // items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
    // props.onSettingChange(items);

    let nextSettings = (0,filterSettingsSnapshot.enforceSingleDefaultTermsInSettings)((0,filterModuleTier.applyFilterLabelCollapseTierToSettings)(data));
    nextSettings = (0,termShowMoreUtils.ensureTermShowMoreSettingsDefaults)(nextSettings);
    // Free may flip to Color Swatch via applyFreeColorSwatchOnEnable — seed white defaults.
    const prevVisual = (0,termVisualUtils.resolveTermVisual)({
      ...settingData,
      post_type: resolvedPostType
    });
    const nextForDefaults = (0,filterModuleTier.resolveSettingsForTermVisualDefaults)(nextSettings, resolvedPostType);
    const nextVisual = (0,termVisualUtils.resolveTermVisual)(nextForDefaults);
    if (prevVisual !== termVisualUtils.TERM_VISUAL_COLOR && nextVisual === termVisualUtils.TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: termVisualUtils.TERM_VISUAL_COLOR
      };
      nextSettings = (0,termVisualUtils.ensureDefaultSwatchColorsOnSettings)(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    } else if (!(0,filterModuleTier.canUseFilterShowIcon)() && String(nextSettings.show_icon) === "true" && (0,filterModuleTier.canUseFilterColorSwatch)(resolvedPostType) && nextSettings.term_visual !== termVisualUtils.TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: termVisualUtils.TERM_VISUAL_COLOR
      };
    }
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
      patchModule: seedShowMoreStyleIfNeeded
    });
  };

  // const changeInitialDataIconOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source !== settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label === "false" ? false : true);
  //   if (data.label.is_label === "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle === "false" ? false : true,
  //   }));
  //   if (data.enable_toggle === "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);

  //   styleData.meta2[selectedDevice].default.justifyContent = "flex-start";
  //   styleData.meta2[selectedDevice].default.alignItems = "flex-start";

  //   items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
  //   props.onSettingChange(items);

  //   commitFilterModuleReplaceSettings({
  //     data: props.data,
  //     rowindex,
  //     columnindex,
  //     moduleindex,
  //     resolvedPostType,
  //     onSettingChange: props.onSettingChange,
  //     nextSettings: data,
  //   });
  // };

  // const changeInitialDataCountOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source !== settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label === "false" ? false : true);
  //   if (data.label.is_label === "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle === "false" ? false : true,
  //   }));
  //   if (data.enable_toggle === "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);

  //   styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
  //   styleData.meta3[selectedDevice].default.alignItems = "flex-start";

  //   items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
  //   props.onSettingChange(items);

  //   commitFilterModuleReplaceSettings({
  //     data: props.data,
  //     rowindex,
  //     columnindex,
  //     moduleindex,
  //     resolvedPostType,
  //     onSettingChange: props.onSettingChange,
  //     nextSettings: data,
  //   });
  // };

  const changeDataSource = value => {
    if (value === "custom_field" && !(0,filterModuleTier.canUseFilterCustomField)()) {
      return;
    }
    setDataSource(value);
    if (value !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        if (value === "custom_field") {
          s.show_count = "false";
        }
        s.data_source = value;
      }
    });
  };
  const removeMatchedPredefinedTerms = (customFieldKey = "", valueArray = [], cfPredefinedTerms = []) => {
    if (customFieldKey === "" || valueArray.length === 0) {
      return cfPredefinedTerms;
    }
    const removeValues = new Set(valueArray.map(item => `${String(customFieldKey).trim()}___${String(item?.key).trim()}`));
    return cfPredefinedTerms.filter(predefinedItem => !removeValues.has(String(predefinedItem).trim()));
  };
  const customFieldKeyFunc = (value, customField, index) => {
    let updateData = [];
    let updatedPredefinedTerms = settingData?.cf_predefined_terms;
    if (customField === "key") {
      let customFieldKey = "";
      let valueArray = [];
      updateData = customFieldArray.map((item, id) => {
        if (id === index) {
          customFieldKey = item?.custom_field_key;
          valueArray = item?.custom_field_value_list;
          return {
            ...item,
            custom_field_key: value,
            custom_field_value_list: []
          };
        }
        return item;
      });
      updatedPredefinedTerms = removeMatchedPredefinedTerms(customFieldKey, valueArray, settingData?.cf_predefined_terms);
    }
    if (customField === "value") {
      updateData = customFieldArray?.map((item, id) => {
        if (id === index) {
          return {
            ...item,
            custom_field_value_list: [...(item.custom_field_value_list || []), {
              key: value,
              label: value,
              icons: {
                icon: "",
                type: "icon",
                position: "before",
                iconChecked: true
              },
              predefine: "false"
            }]
          };
        }
        return item;
      });
    }
    setCustomFieldArray(updateData);
    settingData.custom_field_data = updateData;
    settingData.cf_predefined_terms = updatedPredefinedTerms;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      }
    });
  };
  const openCustomFieldLabelSetting = (cfIndex, valueIndex, valueData) => {
    setCurrCustomFieldValue([cfIndex, valueIndex, valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusFieldLabel(true);
    }, 100);
  };
  const openCustomFieldIconSetting = (cfIndex, valueIndex, valueData) => {
    setCurrCustomFieldValue([cfIndex, valueIndex, valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusFieldIcon(true);
    }, 100);
  };
  const handleCfPredefinedInline = (cfIndex, valueIndex, checked) => {
    const cfItem = customFieldArray[cfIndex];
    const val = cfItem?.custom_field_value_list?.[valueIndex];
    if (!cfItem || !val?.key) return;
    const termId = `${String(cfItem.custom_field_key).trim()}___${String(val.key).trim()}`;
    const allowMultipleDefaults = (0,filterSettingsSnapshot.allowsMultipleDefaultTerms)(settingData);
    const {
      customFieldData: updateData,
      cfPredefinedTerms: updatedPredefinedTerms
    } = (0,filterSettingsSnapshot.applyCustomFieldDefaultTermToSettings)({
      customFieldData: customFieldArray,
      cfPredefinedTerms: settingData.cf_predefined_terms,
      termId,
      cfIndex,
      valueIndex,
      checked,
      allowMultiple: allowMultipleDefaults
    });
    setCustomFieldArray(updateData);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      }
    });
  };
  const handleSaveCustomFieldLabel = () => {
    if (keyValueCf === "" || labelValueCf === "") {
      setCheckError(true);
      return false;
    }
    const updateData = customFieldArray?.map((item, id) => {
      if (id !== currCustomFieldValue[0]) return item;
      return {
        ...item,
        custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {
          if (vid !== currCustomFieldValue[1]) return value;
          return {
            ...value,
            key: keyValueCf,
            label: labelValueCf
          };
        })
      };
    });
    setTermSettingPopUpCusFieldLabel(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);
    setCustomFieldArray(updateData);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const handleSaveCustomFieldIcon = () => {
    const updateData = customFieldArray?.map((item, id) => {
      if (id !== currCustomFieldValue[0]) return item;
      return {
        ...item,
        custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {
          if (vid !== currCustomFieldValue[1]) return value;
          return {
            ...value,
            icons: {
              ...(value.icons || {}),
              icon: contentIconDetailCusField.icon,
              position: contentIconDetailCusField.position,
              type: contentIconDetailCusField.type,
              iconChecked: false
            }
          };
        })
      };
    });
    setcontentIconDetailCusField(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon"
    }));
    setTermSettingPopUpCusFieldIcon(false);
    setCurrCustomFieldValue([]);
    setCheckError(false);
    setCustomFieldArray(updateData);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const handleCancelCustomFieldLabel = () => {
    setTermSettingPopUpCusFieldLabel(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);
  };
  const handleCancelCustomFieldIcon = () => {
    setcontentIconDetailCusField(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon"
    }));
    setTermSettingPopUpCusFieldIcon(false);
    setCurrCustomFieldValue([]);
    setCheckError(false);
  };
  const handleTermSwitchCusField = checked => {
    setTermPredefinedCusField(checked);
  };
  //   const TemrsRefresh=()=>{
  //     setIsLoading(false)
  //     setTimeout(()=>{
  //     setIsLoading(true);
  //   },600)
  //   }
  (0,external_React_.useEffect)(() => {
    const fetchTaxoData = async () => {
      try {
        const res = await client["default"].get(endpoints.apiEndpoints.getTaxonomyRecursiveData(resolvedPostType));
        if (res.data && res.data.status === "success") {
          setTaxonomyListArray(res.data.taxonomy_list);
          setIsLoading(false);
          setLoadingCatogries(true);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };
    if (resolvedPostType) {
      setPostType(resolvedPostType);
      setLoadingCatogries(false);
      fetchTaxoData();
    }
  }, [resolvedPostType]);

  // Refresh saved term counts from live taxonomy totals (catalog-aware).
  (0,external_React_.useEffect)(() => {
    if (!Array.isArray(taxonomyListArray) || taxonomyListArray.length === 0) {
      return;
    }
    const savedGroups = settingData?.taxonomy_data;
    if (!Array.isArray(savedGroups) || savedGroups.length === 0) {
      return;
    }
    const {
      next,
      changed
    } = (0,termCountUtils.backfillTaxonomyDataCounts)(savedGroups, (0,termCountUtils.buildTermCountMapFromTaxonomyList)(taxonomyListArray));
    if (!changed) {
      return;
    }
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: settingsRef => {
        settingsRef.taxonomy_data = next;
      },
      onAfterCommit: nextSettings => setTaxonomyList(nextSettings.taxonomy_data)
    });
  }, [taxonomyListArray]);

  //   const getAllTermsRecursive = (termList ,type="parent") => {
  //     let all = [];
  //     if (Array.isArray(termList) && termList.length > 0) {
  //       termList.forEach((term) => {
  //         let childrenExist = "false";
  //         let childrenArray = [];
  //         let is_parent = "false";
  //         let parent_id = null;
  //         if (
  //           Array.isArray(term.children_data) &&
  //           term.children_data.length > 0 && type == "parent"
  //         ) {
  //             childrenExist ="true";
  //         }
  //         all.push({
  //           key: term?.id,
  //           value: term?.name,
  //           predefine: "false",
  //           icons: {},
  //           is_parent: is_parent,
  //           children_data:childrenArray,
  //           children:childrenExist,
  //           parent_id : type == "parent" ? parent_id :parent_id,
  //         });
  //         if (
  //           Array.isArray(term.children_data) &&
  //           term.children_data.length > 0
  //         ) {
  //           all = [...all, ...getAllTermsRecursive(term.children_data,'child',)];
  //         }
  //       });
  //     }
  //     return all;
  //   };

  const getAllTermsRecursive = (termList, type = "parent", rootParentId = null) => {
    let all = [];
    const defaultTermIcons = (0,termVisualUtils.getDefaultTermIconsForMode)((0,filterModuleTier.resolveSettingsForTermVisualDefaults)(settingData, resolvedPostType));
    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach(term => {
        const hasChildren = type === "parent" && Array.isArray(term.children_data) && term.children_data.length > 0;

        // Determine if this is a root parent (first level)
        const isRootParent = type === "parent";
        const currentParentId = isRootParent ? term?.id : rootParentId;

        // Push current term
        all.push({
          key: term?.id,
          value: term?.name,
          predefine: "false",
          icons: defaultTermIcons,
          is_parent: "false",
          children_data: [],
          // flattened later
          children: hasChildren ? "true" : "false",
          count: term?.total_count ?? term?.count,
          parent_id: isRootParent ? null : rootParentId // 🔥 children use top-level parent ID
        });

        // Recursively process children, passing the top-level parent’s ID
        if (Array.isArray(term.children_data) && term.children_data.length > 0) {
          all = [...all, ...getAllTermsRecursive(term.children_data, "child", currentParentId)];
        }
      });
    }
    return all;
  };

  // const isAllSelected = (taxonomyKey) => {
  //     const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
  //     const savedTax = settingData.taxonomy_data.find(
  //       (data) => data.key === taxonomyKey
  //     );

  //     if (!taxItem) return false;

  //     const allTerms = getAllTermsRecursive(taxItem.term_data);

  //     if (!savedTax || !savedTax.term_data) return false;

  //     return allTerms.every((term) =>
  //       savedTax.term_data.some((saved) => saved.key === term.key)
  //     );
  //   };

  const isAllSelected = taxonomyKey => {
    const taxItem = taxonomyListArray.find(item => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(data => data.key === taxonomyKey);
    if (!taxItem) return false;
    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;

    // 🔍 Helper function to search recursively inside children_data
    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    // ✅ Check if every term is present either at top-level or inside any children
    return allTerms.every(term => {
      return savedTax.term_data.some(saved => {
        if (saved.key === term.key) return true;
        if (Array.isArray(saved.children_data) && saved.children_data.length > 0) {
          return searchInChildren(saved.children_data, term.key);
        }
        return false;
      });
    });
  };

  //   const isAnySelected = (taxonomyKey) => {
  //     const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
  //     const savedTax = settingData.taxonomy_data.find(
  //       (data) => data.key === taxonomyKey
  //     );

  //     if (!taxItem) return false;

  //     const allTerms = getAllTermsRecursive(taxItem.term_data);

  //     if (!savedTax || !savedTax.term_data) return false;

  //     // agar ek bhi term.key savedTax.term_data me mil jaye to true return kare
  //     const hasAnyMatch = allTerms.some((term) =>
  //       savedTax.term_data.some((saved) => saved.key === term.key)
  //     );
  //     if (hasAnyMatch) {
  //       return true;
  //     } else {
  //       false;
  //     }
  //   };

  const isAnySelected = taxonomyKey => {
    const taxItem = taxonomyListArray.find(item => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(data => data.key === taxonomyKey);
    if (!taxItem) return false;
    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;

    // 🔍 Helper: recursive search for a term inside nested children_data
    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    // ✅ If any term exists anywhere (top-level or nested), return true
    return allTerms.some(term => {
      return savedTax.term_data.some(saved => {
        if (saved.key === term.key) return true;
        if (Array.isArray(saved.children_data) && saved.children_data.length > 0) {
          return searchInChildren(saved.children_data, term.key);
        }
        return false;
      });
    });
  };
  const TaxoToggleExpand = taxokey => {
    setFirstRender(false);
    setExpandedTaxoItems(prev => {
      const newArray = prev.includes(taxokey) ? prev.filter(x => x !== taxokey) : [...prev, taxokey];
      return Array.from(new Set(newArray));
    });
  };
  const toggleExpand = id => {
    setExpandedItems(prev => {
      const newArray = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return Array.from(new Set(newArray));
    });
  };
  const getFreshSettingsSnapshot = () => {
    return (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
  };
  const commitSettingsSnapshot = (freshItems, settingsRef, nexttaxonomyData) => {
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: nextSettings => setTaxonomyList(nextSettings.taxonomy_data)
    });
  };
  const handleTerm = (e, taxonomy, term, type = "parent", parantTermData = {}) => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    let updatedPredefinedTerms = [...settingsRef?.predefined_terms];
    const checked = e.target.checked;
    const taxonomyExists = newtaxonomyData.some(data => data.key === taxonomy);
    const defaultTermIcons = (0,termVisualUtils.getDefaultTermIconsForMode)((0,filterModuleTier.resolveSettingsForTermVisualDefaults)(settingsRef, resolvedPostType));
    let childrenExist = "false";
    let childrenArray = [];
    let is_parent = "false";
    let parent_id = null;
    if (term?.children_data.length > 0 && type == "parent") {
      childrenExist = "true";
    }
    if (checked) {
      if (taxonomyExists) {
        const data = newtaxonomyData.find(d => d.key === taxonomy);
        const termData = [...data.term_data];
        const parent = termData.find(obj => obj.key === parantTermData?.id);
        if (type === "child" && Object.keys(parantTermData).length > 0 && parent?.is_parent === "true") {
          parent_id = parent?.key;

          // Find the parent object
          const parantObjIndex = termData.findIndex(obj => obj.key === parent_id);
          if (parantObjIndex !== -1) {
            const parantObj = {
              ...termData[parantObjIndex]
            };
            const parantChildData = [...parantObj.children_data];
            const isChildPresent = parantChildData.some(obj => obj.key === term?.id);
            if (!isChildPresent) {
              parantChildData.push({
                key: term?.id,
                value: term?.name,
                predefine: "false",
                icons: defaultTermIcons,
                is_parent: "false",
                children_data: [],
                children: "false",
                parent_id: parent_id,
                count: term?.total_count ?? term?.count
              });
            }
            parantObj.children_data = parantChildData;
            termData[parantObjIndex] = parantObj;
            const dataIndex = newtaxonomyData.findIndex(d => d.key === taxonomy);
            if (dataIndex !== -1) {
              newtaxonomyData[dataIndex] = {
                ...newtaxonomyData[dataIndex],
                term_data: termData
              };
            }
          }
        } else {
          const isValuePresent = termData.some(obj => obj.key === term?.id);
          if (!isValuePresent) {
            termData.push({
              key: term?.id,
              value: term?.name,
              predefine: "false",
              icons: defaultTermIcons,
              is_parent: is_parent,
              children_data: childrenArray,
              children: childrenExist,
              parent_id: parent_id,
              count: term?.total_count ?? term?.count
            });
          }
          data.term_data = termData;
        }
      } else {
        newtaxonomyData.push({
          key: taxonomy,
          term_data: [{
            key: term?.id,
            value: term?.name,
            predefine: "false",
            icons: defaultTermIcons,
            is_parent: is_parent,
            children_data: childrenArray,
            children: childrenExist,
            parent_id: parent_id,
            count: term?.total_count ?? term?.count
          }]
        });
      }
    } else {
      if (taxonomyExists) {
        const data = newtaxonomyData.find(d => d.key === taxonomy);
        if (data) {
          const termData = [...data.term_data];
          const parent = termData.find(obj => obj.key === parantTermData?.id);
          if (type == "child" && Object.keys(parantTermData).length > 0 && parent?.is_parent == "true") {
            parent_id = parent?.key;

            // Find parent index inside term_data
            const parantObjIndex = data.term_data.findIndex(obj => obj.key === parent_id);
            if (parantObjIndex !== -1) {
              const parantObj = {
                ...data.term_data[parantObjIndex]
              };
              const parantChildData = [...parantObj.children_data];

              // Remove the unchecked child
              parantObj.children_data = parantChildData.filter(obj => obj.key !== term?.id);

              /* start remove from PredefinedTerms */
              updatedPredefinedTerms = updatedPredefinedTerms?.filter(itemData => itemData !== `${String(taxonomy).trim()}___${String(term?.id).trim()}`);
              /* end remove from PredefinedTerms */

              // ✅ Update the parent object back in term_data
              const updatedTermData = [...data.term_data];
              updatedTermData[parantObjIndex] = parantObj;

              // ✅ Update taxonomy in newtaxonomyData
              const taxonomyIndex = newtaxonomyData.findIndex(tx => tx.key === taxonomy);
              if (taxonomyIndex !== -1) {
                newtaxonomyData[taxonomyIndex] = {
                  ...newtaxonomyData[taxonomyIndex],
                  term_data: updatedTermData
                };
              }
            }
          } else {
            data.term_data = data.term_data.filter(obj => obj.key !== term?.id);
            if (data.term_data.length === 0) {
              data.term_data = [];
              newtaxonomyData = newtaxonomyData.filter(tx => tx.key !== taxonomy);
            }
            /* start remove from PredefinedTerms */
            updatedPredefinedTerms = updatedPredefinedTerms?.filter(itemData => itemData !== `${String(taxonomy).trim()}___${String(term?.id).trim()}`);
            /* end remove from PredefinedTerms */
          }
        }
      }
    }
    settingsRef.predefined_terms = updatedPredefinedTerms;
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  //   const handleTermChecked = (taxonomy, term,type="parent",parantTermData={}) => {
  //     const taxo =
  //       Array.isArray(settingData.taxonomy_data) &&
  //       settingData.taxonomy_data?.find((d) => d.key == taxonomy);
  //     if (!taxo || !Array.isArray(taxo.term_data)) return false;

  //     const parent = termData.find((obj) => obj.key === parantTermData?.id);

  //     return taxo.term_data.some((obj) => obj.key == term?.id);
  //   };

  const handleTermChecked = (taxonomy, term, type = "parent", parantTermData = {}) => {
    const taxo = Array.isArray(settingData.taxonomy_data) && settingData.taxonomy_data.find(d => d.key === taxonomy);
    if (!taxo || !Array.isArray(taxo.term_data)) return false;
    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    // 🔍 Check at both top level and nested children
    for (const obj of taxo.term_data) {
      if (obj.key === term?.id) return true;
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const foundInChildren = searchInChildren(obj.children_data, term?.id);
        if (foundInChildren) return true;
      }
    }
    return false;
  };
  const findTermObjRecursive = (data, termId) => {
    if (!Array.isArray(data)) return null;
    for (const obj of data) {
      if (obj.key === termId) {
        return obj;
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const found = findTermObjRecursive(obj.children_data, termId);
        if (found) return found;
      }
    }
    return null;
  };
  const isTermPredefined = (taxonomy, term) => {
    const taxo = settingData.taxonomy_data?.find(d => d.key === taxonomy);
    if (!taxo) return false;
    const termObj = findTermObjRecursive(taxo.term_data, term?.id);
    return termObj?.predefine === "true";
  };
  const getTermSavedIcons = (taxonomy, term) => {
    const taxo = settingData.taxonomy_data?.find(d => d.key === taxonomy);
    if (!taxo) return null;
    const termObj = findTermObjRecursive(taxo.term_data, term?.id);
    return termObj?.icons || null;
  };
  const termHasIcon = icons => {
    if (!icons || typeof icons !== "object") return false;
    const iconValue = icons.icon;
    if (typeof iconValue === "string" && iconValue.trim() !== "") {
      return true;
    }
    if (iconValue && typeof iconValue === "object") {
      if (iconValue.url) return true;
      return Object.keys(iconValue).length > 0;
    }
    return false;
  };
  const getTermIconPreviewSrc = icons => {
    if (!termHasIcon(icons)) return "";
    const iconValue = icons.icon;
    if (typeof iconValue === "string") return iconValue;
    if (iconValue?.url) return iconValue.url;
    if (iconValue?.icon?.url) return iconValue.icon.url;
    return "";
  };
  const updateTermPredefineInTree = (terms, termId, checked) => {
    if (!Array.isArray(terms)) return terms;
    return terms.map(obj => {
      if (obj.key === termId) {
        return {
          ...obj,
          predefine: checked ? "true" : "false"
        };
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        return {
          ...obj,
          children_data: updateTermPredefineInTree(obj.children_data, termId, checked)
        };
      }
      return obj;
    });
  };
  const applyColorToTermTree = (terms, termId, color) => {
    if (!Array.isArray(terms)) return terms;
    return terms.map(obj => {
      if (obj.key === termId) {
        return {
          ...obj,
          icons: (0,termVisualUtils.buildColorTermIcons)(obj.icons, color, obj.icons?.position || "before")
        };
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        return {
          ...obj,
          children_data: applyColorToTermTree(obj.children_data, termId, color)
        };
      }
      return obj;
    });
  };
  const handleTermColorInline = (term, taxonomy, color) => {
    if (!color || !handleTermChecked(taxonomy, term)) {
      return;
    }
    const {
      freshItems,
      settingsRef
    } = (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
    const taxonomyExists = settingsRef.taxonomy_data?.some(data => data.key === taxonomy);
    if (!taxonomyExists) {
      return;
    }
    const newtaxonomyData = settingsRef.taxonomy_data.map(group => {
      if (group.key !== taxonomy) return group;
      return {
        ...group,
        term_data: applyColorToTermTree(group.term_data, term?.id, color)
      };
    });
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
    });
  };
  const handleTermPredefinedInline = (term, taxonomy, type, checked) => {
    if (!handleTermChecked(taxonomy, term, type)) {
      return;
    }
    const term_id = `${taxonomy}___${term?.id}`;
    const {
      freshItems,
      settingsRef
    } = (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
    const allowMultipleDefaults = (0,filterSettingsSnapshot.allowsMultipleDefaultTerms)(settingsRef);
    (0,filterSettingsSnapshot.applyTaxonomyDefaultTermToSettings)({
      settingsRef,
      termKey: term_id,
      taxonomyKey: taxonomy,
      numericTermId: term?.id,
      checked,
      allowMultiple: allowMultipleDefaults
    });
    const taxonomyExists = settingsRef.taxonomy_data?.some(data => data.key === taxonomy);
    if (!taxonomyExists) {
      return;
    }
    const newtaxonomyData = settingsRef.taxonomy_data;
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
    });
  };
  const TermTaxonomyRowActions = ({
    term,
    taxonomy,
    type = "parent",
    parentTermData = {},
    onOpenSettings
  }) => {
    const showTermIconControl = (0,filterModuleTier.shouldShowFilterTermIconControl)(settingData?.show_icon);
    const colorMode = (0,termVisualUtils.isTermVisualColor)({
      ...settingData,
      post_type: resolvedPostType
    });
    const isTermSelected = handleTermChecked(taxonomy, term, type, parentTermData);
    const isDefault = isTermPredefined(taxonomy, term);
    const termIcons = getTermSavedIcons(taxonomy, term);
    const hasColor = (0,termVisualUtils.termHasColorSwatch)(termIcons);
    const hasIcon = colorMode ? hasColor : termHasIcon(termIcons) && termIcons?.type !== "color";
    const iconPreviewSrc = getTermIconPreviewSrc(termIcons);
    const swatchColor = (0,termVisualUtils.getTermSwatchColor)(termIcons);
    const termIconActionsLocked = !(0,filterModuleTier.canUseFilterTermIcon)();
    const termDefaultLocked = !(0,filterModuleTier.canUseFilterTermDefault)();
    // Free: color swatch picker is unlocked; FA/SVG icon picker stays Pro.
    const colorTriggerDisabled = !isTermSelected;
    const iconTriggerDisabled = !isTermSelected || termIconActionsLocked;
    const addLabel = colorMode ? hasColor ? "Edit term color" : "Add term color" : hasIcon ? "Edit term icon" : "Add term icon";
    const handleColorCommit = (0,external_React_.useCallback)(nextColor => {
      handleTermColorInline(term, taxonomy, nextColor);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [term?.id, taxonomy]);
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
      className: "caf-term-row-actions",
      onClick: event => event.stopPropagation(),
      children: [showTermIconControl && colorMode && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermColorPickerTrigger["default"], {
        color: swatchColor,
        disabled: colorTriggerDisabled,
        label: addLabel,
        onColorCommit: handleColorCommit
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTermRowProActions["default"], {
        isTermSelected: isTermSelected,
        isDefault: isDefault,
        hasIcon: hasIcon,
        termIcons: termIcons,
        iconPreviewSrc: iconPreviewSrc,
        iconTriggerDisabled: iconTriggerDisabled,
        termDefaultLocked: termDefaultLocked,
        termIconActionsLocked: termIconActionsLocked,
        addLabel: addLabel,
        onOpenSettings: onOpenSettings,
        onToggleDefault: checked => handleTermPredefinedInline(term, taxonomy, type, checked),
        showIconControl: showTermIconControl && !colorMode
      })]
    });
  };
  function NestedTerms({
    taxoKey,
    childrenData,
    termData,
    expandedItems,
    toggleExpand,
    handleTerm,
    handleTermChecked
  }) {
    if (!Array.isArray(childrenData) || childrenData.length === 0) return null;
    return (
      /*#__PURE__*/
      // <ul className="children">
      (0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: childrenData.map(child => {
          const hasChildren = Array.isArray(child?.children_data) && child.children_data.length > 0;
          const hasChildClass = Array.isArray(child?.children_data) && child.children_data.length > 0 ? "tc-caf-has-child" : "";
          const isExpanded = expandedItems.includes(child.id);
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
            className: `cat-item cat-item-${child?.id} ${hasChildClass}`,
            count: child?.total_count,
            "term-id": child?.id,
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: "trusty-manage-bar-sec-label",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("label", {
                htmlFor: `${taxoKey}-list-id${child?.id}`,
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                  className: `${taxoKey}-list check`,
                  type: "checkbox",
                  "term-name": child?.name,
                  name: `${taxoKey}[]`,
                  id: `${taxoKey}-list-id${child?.id}`,
                  value: `${taxoKey}___${child?.id}`,
                  onChange: e => handleTerm(e, taxoKey, child, 'child', termData),
                  checked: handleTermChecked(taxoKey, child, 'child', termData)
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyLabelText["default"], {
                  name: child?.name,
                  count: child?.total_count
                })]
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyRowActions, {
                term: child,
                taxonomy: taxoKey,
                type: "child",
                parentTermData: termData,
                onOpenSettings: () => handleTermSetting(child, taxoKey, "child", termData)
              }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
                className: `fa ${isExpanded ? "fa-angle-up" : "fa-angle-down"} caf-builder-plus`,
                "aria-hidden": "true",
                onClick: e => {
                  e.stopPropagation();
                  toggleExpand(child.id);
                },
                style: {
                  cursor: "pointer"
                }
              })]
            }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
              className: `children ${isExpanded ? "tc_caf_active_list" : ""}`,
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(NestedTerms, {
                taxoKey: taxoKey,
                childrenData: child.children_data,
                termData: termData,
                expandedItems: expandedItems,
                toggleExpand: toggleExpand,
                handleTerm: handleTerm,
                handleTermChecked: handleTermChecked
              })
            })]
          }, child?.id);
        })
      })
      // </ul>
    );
  }
  const handleSelectAll = taxonomy => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxItem = taxonomyListArray.find(item => item.key === taxonomy);
    if (!taxItem) return;
    const allTerms = getAllTermsRecursive(taxItem.term_data, 'parent');
    const exists = newtaxonomyData.some(data => data.key === taxonomy);
    if (exists) {
      newtaxonomyData = newtaxonomyData.map(data => {
        if (data.key === taxonomy) {
          // Prefer existing term entries so custom colors/icons are kept.
          const merged = [...allTerms, ...data.term_data];
          const unique = Array.from(new Map(merged.map(item => [item.key, item])).values());
          return {
            ...data,
            term_data: unique
          };
        }
        return data;
      });
    } else {
      newtaxonomyData.push({
        key: taxonomy,
        term_data: allTerms
      });
    }
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };
  const removeTaxoMatchedPredefinedTerms = (predefinedTerms = [], taxonomy, termData = []) => {
    // nested keys collect karne ka func
    const collectKeys = (items = [], keys = []) => {
      items.forEach(item => {
        if (item?.key !== undefined && item?.key !== null) {
          keys.push(`${String(taxonomy).trim()}___${String(item.key).trim()}`);
        }
        if (Array.isArray(item?.children_data) && item?.children_data?.length) {
          collectKeys(item?.children_data, keys);
        }
      });
      return keys;
    };
    const matchedKeys = collectKeys(termData);
    return predefinedTerms.filter(item => !matchedKeys.includes(item));
  };
  const handleSelectNone = taxonomy => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let updatedPredefinedTerms = [...settingsRef.predefined_terms];
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxonomyItem = newtaxonomyData.find(data => data.key === taxonomy);
    if (taxonomyItem) {
      /* start remove from PredefinedTerms */
      updatedPredefinedTerms = removeTaxoMatchedPredefinedTerms(updatedPredefinedTerms, taxonomy, taxonomyItem?.term_data);
      /* end remove from PredefinedTerms */

      taxonomyItem.term_data = [];
      newtaxonomyData = newtaxonomyData.filter(tx => tx.key !== taxonomy);
    }
    settingsRef.predefined_terms = updatedPredefinedTerms;
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };
  const handleTermSetting = (term, taxonomy, type = "parent", parantTermData = {}) => {
    if ((0,termVisualUtils.isTermVisualColor)({
      ...settingData,
      post_type: resolvedPostType
    })) {
      return;
    }
    let hasParent = false;
    if (term?.children_data.length > 0 && type == "parent") {
      hasParent = true;
    }
    let term_id = taxonomy + "___" + term?.id;
    let newtaxonomyData = [...settingData.taxonomy_data];
    const taxonomyExists = newtaxonomyData.some(data => data.key === taxonomy);
    // if (taxonomyExists) {
    const data = newtaxonomyData.find(d => d.key === taxonomy) || {};
    const termData = Array.isArray(data?.term_data) ? [...data.term_data] : [];
    // const currentTerm = termData.some((obj) => obj.key === term?.id)
    const termObj = findTermObjRecursive(termData, term?.id) || {};
    setTermDetail([term?.id, taxonomy, term_id, term?.name, hasParent, handleTermChecked(taxonomy, term, type), termObj]);
    setTimeout(() => {
      setTermSettingPopUp(true);
    }, 100);
    // }
  };
  const onLabelIconSwitch = checked => {
    if (!(0,filterModuleTier.canUseLabelShowIcon)()) {
      return;
    }
    setLabelIconSwitch(checked);
    let itm = {
      ...settingData?.label
    };
    let ic = {
      ...itm?.icons
    };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
      ic.position = "before-label";
    }
    ic.visibility = checked;
    itm.icons = {
      ...itm.icons,
      ...ic
    };
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = itm;
      }
    });
  };
  const getCompareLabel = value => {
    const match = customFieldCompareOperators?.find(item => item.value === value);
    return match ? match.label : "";
  };
  const formatCfValueListSummary = list => (list || []).map(val => val && typeof val === "object" ? String(val.label ?? val.key ?? "") : String(val ?? "")).filter(Boolean).join(" , ");
  const addCustomField = () => {
    let newField = {
      custom_field_key: "0",
      custom_field_value_list: [],
      compare_operator: "=",
      meta_type: "CHAR"
    };
    let updatedCustomFieldData = [...CheckboxFilter_normalizeCustomFieldData(customFieldArray)];
    updatedCustomFieldData?.push(newField);
    setCustomFieldArray(updatedCustomFieldData);
    settingData.custom_field_data = updatedCustomFieldData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updatedCustomFieldData;
      }
    });
  };
  const toggleCfRow = index => {
    setOpenCfRows(prev => ({
      ...prev,
      [index]: !(prev[index] ?? true)
    }));
  };
  const toggleCfAdv = index => {
    setOpenCfAdv(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  const removeArray = (arr, index) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // part of the array after the specified index
  ...arr.slice(index + 1)];
  const deleteCustomField = (index, item) => {
    let updatedCustomFieldData = JSON.parse(JSON.stringify(customFieldArray));
    updatedCustomFieldData = removeArray(updatedCustomFieldData, index);
    setCustomFieldArray([...updatedCustomFieldData]);

    /* start remove from predefine */

    let customFieldKey = item?.custom_field_key;
    let valueArray = item?.custom_field_value_list;
    let updatedPredefinedTerms = removeMatchedPredefinedTerms(customFieldKey, valueArray, settingData?.cf_predefined_terms);

    /* start remove from predefine */

    settingData.custom_field_data = updatedCustomFieldData;
    settingData.cf_predefined_terms = updatedPredefinedTerms;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updatedCustomFieldData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      }
    });
  };
  const handleCompareOperator = (value, index) => {
    let updateData = customFieldArray?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          compare_operator: value
        };
      }
      return item;
    });
    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const handleMetaType = (value, index) => {
    let updateData = customFieldArray?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          meta_type: value
        };
      }
      return item;
    });
    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const deleteCustomFieldValue = (index, valueIndex, item, value) => {
    const layoutCopy = JSON.parse(JSON.stringify(customFieldArray));
    const customFieldKey = item?.custom_field_key;
    const valueKey = value?.key;
    let updateData = layoutCopy?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          custom_field_value_list: item.custom_field_value_list.filter((_, i) => i !== valueIndex)
        };
      }
      return item;
    });

    /* start delete form predefined array */
    let updatedPredefinedTerms = settingData.cf_predefined_terms.filter(itemData => itemData !== `${String(customFieldKey).trim()}___${String(valueKey).trim()}`);

    /* end delete form predefined array*/

    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    settingData.cf_predefined_terms = updatedPredefinedTerms;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      }
    });
  };
  //   const getTermDataLength = (keyName) => {
  //   const found = taxonomyList?.find(item => item.key === keyName);
  //   return found?.term_data?.length || 0;
  // };
  const getTermDataLength = keyName => {
    const found = taxonomyList?.find(item => item.key === keyName);
    if (!found?.term_data) return 0;
    return found.term_data.reduce((total, item) => {
      const childrenCount = item?.children_data?.length || 0;
      return total + 1 + childrenCount; // 1 for parent item
    }, 0);
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
    children: !isLoading ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-content-tab-row no-pad-0",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          className: "setting-label-main",
          children: "Data Source"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterDataSourceSegment, {
          value: effectiveDataSource,
          onChange: changeDataSource
        }), effectiveDataSource === "taxonomy" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "module-content-tab-row caf-checkbox-taxo-wrapper",
            children: LoadingCatogries ? Array.isArray(taxonomyListArray) ? taxonomyPickerSections.map(section => {
              const sectionContent = /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "caf-taxonomy-picker-section",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "caf-taxonomy-picker-section-heading",
                  children: section.label
                }), section.items.map((taxo, indx) =>
                /*#__PURE__*/
                // TaxonomyChecked(taxo.key) === true && (
                (0,external_ReactJSXRuntime_.jsxs)("ul", {
                  className: `tc-caf-each-tax-data ${taxo.key}`,
                  "data-name": taxo.key,
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
                    className: "caf-term-title-main",
                    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "tc-caf-taxo-name-left-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                        className: "tc-caf-all-check-uncheck-main",
                        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                          className: "tc-caf-all-check-uncheck-wrapper",
                          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                            type: "checkbox",
                            className: "tc-caf-all-check-uncheck-btn",
                            checked: isAllSelected(taxo.key),
                            onChange: e => {
                              if (e.target.checked) {
                                handleSelectAll(taxo.key);
                              } else {
                                handleSelectNone(taxo.key);
                              }
                            }
                          })
                        })
                      }, taxo.key), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("h2", {
                        style: {
                          display: "flex",
                          width: "100%",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          padding: 0,
                          margin: 0,
                          alignItems: "center"
                        },
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
                          className: `caf-taxonomy-label-text`,
                          title: CheckboxFilter_getPlainTextFromHtml(taxo?.label),
                          children: (0,esm["default"])(`${taxo?.label}`)
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                          className: "caf-selected-terms-count-wrapper",
                          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
                            className: "caf-selected-terms-count",
                            children: ["(", getTermDataLength(taxo.key)]
                          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
                            className: "caf-selected-terms-count-suffix",
                            children: ["Selected", ")"]
                          })]
                        })]
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-terms-cat-btn",
                      children: [(0,wooAttributeColorImport.isWooProductAttributeTaxonomy)(taxo.key) && (0,termVisualUtils.isTermVisualColor)({
                        ...settingData,
                        post_type: resolvedPostType
                      }) && getTermDataLength(taxo.key) > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(wooAttributeColorImport.WooAttributeColorActions, {
                        variant: "icons",
                        visible: true,
                        importLoading: wooColorImportLoading,
                        resetLoading: wooColorResetLoading,
                        onImport: handleImportWooColors,
                        onReset: handleResetWooColors
                      }), (firstRender === true ? isAnySelected(taxo.key) || expandedTaxoItems.includes(taxo.key) : expandedTaxoItems.includes(taxo.key)) ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                        icon: free_solid_svg_icons.faChevronUp,
                        onClick: e => {
                          e.stopPropagation();
                          TaxoToggleExpand(taxo.key);
                        },
                        style: {
                          cursor: "pointer"
                        }
                      }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                        icon: free_solid_svg_icons.faChevronDown,
                        onClick: e => {
                          e.stopPropagation();
                          TaxoToggleExpand(taxo.key);
                        },
                        style: {
                          cursor: "pointer"
                        }
                      })]
                    })]
                  }), Array.isArray(taxo?.term_data) && taxo.term_data.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
                    children: (() => {
                      const isActive = firstRender === true ? isAnySelected(taxo.key) || expandedTaxoItems.includes(taxo.key) : expandedTaxoItems.includes(taxo.key);
                      if (isActive && !expandedTaxoItems.includes(taxo.key)) {
                        setExpandedTaxoItems(prev => {
                          const newArray = [...prev, taxo.key];
                          return Array.from(new Set(newArray));
                        });
                      }
                      return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                        className: `tc-caf-taxo-term-list-section ${isActive ? "active-term-list" : ""}`,
                        children: taxo.term_data.map(term => {
                          const hasChildren = Array.isArray(term?.children_data) && term.children_data.length > 0;
                          const hasChildClass = hasChildren ? "tc-has-child" : "";
                          const isExpanded = expandedItems.includes(term.id);
                          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
                            className: `cat-item cat-item-${term?.id} ${hasChildClass}`,
                            count: term?.total_count,
                            "term-id": term?.id,
                            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                              className: "trusty-manage-bar-sec-label",
                              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("label", {
                                htmlFor: `${taxo?.key}-list-id${term?.id}`,
                                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                                  className: `${taxo?.key}-list check`,
                                  type: "checkbox",
                                  "term-name": term?.name,
                                  name: `${taxo.key}[]`,
                                  id: `${taxo?.key}-list-id${term?.id}`,
                                  value: `${taxo?.key}___${term?.id}`,
                                  onChange: e => handleTerm(e, taxo?.key, term, "parent"),
                                  checked: handleTermChecked(taxo?.key, term, "parent")
                                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyLabelText["default"], {
                                  name: term?.name,
                                  count: term?.total_count
                                })]
                              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TermTaxonomyRowActions, {
                                term: term,
                                taxonomy: taxo?.key,
                                type: "parent",
                                onOpenSettings: () => handleTermSetting(term, taxo?.key, "parent")
                              }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
                                className: `fa ${isExpanded ? "fa-angle-up" : "fa-angle-down"} caf-builder-plus`,
                                "aria-hidden": "true",
                                onClick: e => {
                                  e.stopPropagation();
                                  toggleExpand(term.id);
                                },
                                style: {
                                  cursor: "pointer"
                                }
                              })]
                            }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
                              className: `children ${isExpanded ? "tc_caf_active_list" : ""}`,
                              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(NestedTerms, {
                                taxoKey: taxo.key,
                                childrenData: term.children_data,
                                termData: term,
                                expandedItems: expandedItems,
                                toggleExpand: toggleExpand,
                                handleTerm: handleTerm,
                                handleTermChecked: handleTermChecked
                              })
                            })]
                          }, term?.id);
                        })
                      });
                    })()
                  }), Array.isArray(taxo?.term_data) && taxo.term_data.length === 0 && (() => {
                    const isActive = firstRender === true ? isAnySelected(taxo.key) || expandedTaxoItems.includes(taxo.key) : expandedTaxoItems.includes(taxo.key);
                    if (isActive && !expandedTaxoItems.includes(taxo.key)) {
                      setExpandedTaxoItems(prev => {
                        const newArray = [...prev, taxo.key];
                        return Array.from(new Set(newArray));
                      });
                    }
                    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                      className: `tc-caf-taxo-term-list-section ${isActive ? "active-term-list" : ""}`,
                      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
                        className: "tc-cat-item-none",
                        children: "No Categories"
                      })
                    });
                  })()]
                }, `${section.id}-${taxo.key}-${indx}`))]
              });
              if (section.locked) {
                return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedWrap.TierLockedWrap, {
                  locked: true,
                  showProBadge: true,
                  className: "caf-builder-tier-locked-product-filters",
                  upgradeMessage: "Product filters (stock, sale, and rating) are available in Category Ajax Filter Pro.",
                  children: sectionContent
                }, section.id);
              }
              return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)((external_React_default()).Fragment, {
                children: sectionContent
              }, section.id);
            }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("li", {
              className: "tc-taxo-item-none",
              children: "No Taxonomy"
            }) :
            /*#__PURE__*/
            // )
            (0,external_ReactJSXRuntime_.jsx)(skeleton["default"], {
              active: true
            })
          })
        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "caf-custom-field-data-container caf-filter-module-cf-cont caf-checkbox-taxo-custom-field-wrapper",
          children: [customFieldArray?.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              className: "setting-label-main",
              children: "Custom Field"
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "caf-filter-custom-field-items-wrapper",
              children: customFieldArray?.map((item, index) => {
                return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                  className: `caf-filter-custom-field-single-row ${openCfRows[index] ?? true ? "toggle-active" : ""} ${item?.custom_field_key === "0" ? "warning-cf-row" : ""}`,
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                    className: "caf-filter-label-inner-row-top-bar",
                    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-fl-query-cf-left-col",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("strong", {
                        className: "caf-fl-query-cf-name",
                        children: item?.custom_field_key === "0" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
                          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
                            src: caution_sign["default"],
                            alt: "",
                            className: "caf-fl-query-warning-icon"
                          }), " ", "Select Custom Field", " "]
                        }) : item?.custom_field_key
                      }), item?.custom_field_key !== "0" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
                          className: "caf-fl-query-cf-compare-label",
                          children: getCompareLabel(item?.compare_operator)
                        }), item?.custom_field_value_list?.length > 0 ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("strong", {
                          className: "caf-fl-query-cf-value",
                          children: formatCfValueListSummary(item.custom_field_value_list)
                        }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
                          className: "caf-fl-query-cf-value warning-cf-value",
                          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("img", {
                            src: caution_sign["default"],
                            alt: "",
                            className: "caf-fl-query-warning-icon"
                          }), " ", "Add Values"]
                        })]
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-fl-query-cf-right-col",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(BuilderDeleteIcon["default"], {
                        onClick: () => deleteCustomField(index, item)
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                        icon: openCfRows[index] ?? true ? free_solid_svg_icons.faChevronUp : free_solid_svg_icons.faChevronDown,
                        className: "caf-fl-query-cf-fields-collapse-btn",
                        style: {
                          cursor: "pointer"
                        },
                        onClick: () => toggleCfRow(index)
                      })]
                    })]
                  }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                    className: "caf-fl-query-cf-fields-collapse-wrapper",
                    style: {
                      display: openCfRows[index] ?? true ? "flex" : "none"
                    },
                    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-fl-query-cf-fields-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                        className: "caf-filter-query-custom-field-select caf-header-dropdown",
                        options: metaKeys,
                        onChange: value => customFieldKeyFunc(value, "key", index),
                        style: {
                          width: "50%"
                        },
                        value: item?.custom_field_key
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                        className: "caf-filter-query-compare caf-header-dropdown",
                        options: customFieldCompareOperators,
                        onChange: value => handleCompareOperator(value, index),
                        style: {
                          width: "50%"
                        },
                        value: item?.compare_operator,
                        disabled: item?.custom_field_key === "0" ? true : false
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-filter-query-custom-field-adv-opt-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        className: "caf-filter-query-custom-field-adv-opt-top-bar",
                        onClick: () => toggleCfAdv(index),
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
                          className: "caf-filter-query-adv-opt-label",
                          children: "Advanced Options"
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(index_es.FontAwesomeIcon, {
                          icon: openCfAdv[index] ? free_solid_svg_icons.faChevronUp : free_solid_svg_icons.faChevronDown,
                          style: {
                            cursor: "pointer"
                          },
                          className: "caf-filter-query-adv-opt-toggle-btn"
                        })]
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        className: "caf-filter-query-meta-type-wrapper",
                        style: {
                          display: openCfAdv[index] ? "flex" : "none"
                        },
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                          classNames: {
                            root: "caf-builder-tooltip"
                          },
                          placement: "topLeft",
                          title: "Select meta value type for comparison.",
                          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                            children: "Meta Type"
                          })
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                          className: "caf-filter-query-meta-type",
                          options: customFieldMetaTypes,
                          onChange: value => handleMetaType(value, index),
                          style: {
                            width: "auto"
                          },
                          value: item?.meta_type,
                          disabled: item?.custom_field_key === "0" ? true : false
                        })]
                      })]
                    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                      className: "caf-filter-query-multi-value-field-wrapper",
                      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                        className: "caf-filter-query-multi-value-field-label",
                        children: "Add Value"
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        class: "caf-filter-query-multi-value-field-input-wrapper",
                        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                          style: {
                            width: "100%"
                          },
                          className: "caf-filter-query-multi-value-field",
                          type: "text",
                          placeholder: "Enter Value",
                          disabled: item?.custom_field_key === "0" ? true : false
                        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
                          title: "Add",
                          icon: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(PlusCircleFilled["default"], {}),
                          className: "caf-filter-query-add-value-btn",
                          onClick: e => {
                            let input = e.currentTarget.closest(".caf-filter-query-multi-value-field-wrapper").querySelector("input");
                            if (input.value.trim() !== "") {
                              if (item?.custom_field_key === "0") {
                                return;
                              }
                              customFieldKeyFunc(input.value.trim(), "value", index);
                              input.value = "";
                            }
                          },
                          children: "Add"
                        })]
                      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                        className: "caf-filter-query-multi-value-results",
                        children: [item?.custom_field_value_list?.length > 0 && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                          classNames: {
                            root: "caf-builder-tooltip"
                          },
                          placement: "topLeft",
                          title: "Enter values for this custom field rule.",
                          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                            children: "Values"
                          })
                        }), Object?.keys(item)?.map(key => {
                          if (key === "custom_field_value_list" && item[key]?.length > 0) {
                            return item[key]?.map((val, valueIndex) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                              className: "caf-filter-query-cf-value-item",
                              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                                className: "trusty-manage-bar-sec-label caf-filter-query-cf-value-row",
                                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_CfValueLabelWithEdit, {
                                  label: val?.label,
                                  onEdit: () => openCustomFieldLabelSetting(index, valueIndex, val)
                                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_CustomFieldValueRowActions, {
                                  showIconControl: settingData?.show_icon === "true",
                                  valueIcons: val?.icons,
                                  isDefault: val?.predefine === "true",
                                  onOpenSettings: () => openCustomFieldIconSetting(index, valueIndex, val),
                                  onToggleDefault: () => handleCfPredefinedInline(index, valueIndex, val?.predefine !== "true")
                                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(BuilderDeleteIcon["default"], {
                                  className: "caf-filter-query-cf-value-delete",
                                  onClick: () => deleteCustomFieldValue(index, valueIndex, item, val)
                                })]
                              })
                            }, valueIndex));
                          }
                          return null;
                        })]
                      })]
                    })]
                  })]
                }, index);
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "select-layout-btn filter-cf-ad-btn",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
              className: "caf-filter-query-add-new-cf-btn",
              onClick: () => addCustomField(),
              children: "Add Field"
            })
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
          className: "setting-hr-main"
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row no-pad-0",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            className: "setting-label-main",
            children: "Allow Multiple Selection"
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
              label: "Enable",
              property: "multiple_term",
              onSettingChange: changeInitialData,
              data: settingData,
              currValue: settingData.multiple_term
            })
          })]
        }), effectiveDataSource === "taxonomy" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [settingData.multiple_term === "true" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectMain["default"], {
              label: "Category Relation",
              property: "category_relation",
              classn: 'caf-design-two-half',
              options: [{
                label: "OR",
                value: "OR"
              }, {
                label: "AND",
                value: "AND"
              }],
              onSettingChange: changeInitialData,
              data: settingData
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
              className: "setting-hr-main"
            })]
          })
        }), (0,filterModuleTier.canUseFilterCustomField)() && effectiveDataSource === "custom_field" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [settingData.multiple_term === "true" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: `module-content-tab-row ${'caf-design-two-half'}`,
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                classNames: {
                  root: "caf-builder-tooltip"
                },
                placement: "topLeft",
                title: `Configure custom field values relation.`,
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                  children: "Relation"
                })
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                className: "caf-select-post-type caf-header-dropdown",
                defaultValue: "OR",
                options: [{
                  label: "OR",
                  value: "OR"
                }],
                onChange: () => {},
                style: {
                  width: "100%"
                },
                value: "OR",
                disabled: true
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
              className: "setting-hr-main"
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row no-pad-0",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            className: "setting-label-main",
            children: "Show Checkbox"
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
              label: "Enable",
              property: "show_checkbox",
              onSettingChange: changeInitialDataOptChange,
              data: settingData,
              currValue: settingData.show_checkbox
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
            className: "setting-hr-main"
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterShowIconLockedSection, {
          unlockForColorSwatch: (0,filterModuleTier.canUseFilterColorSwatch)(resolvedPostType),
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              className: "setting-label-main",
              children: (0,termVisualUtils.canUseColorSwatchFeatures)(resolvedPostType) ? "Show Icon / Color Swatch" : "Show Icon"
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-tab-row caf-design-two-half",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
                label: "Enable",
                property: "show_icon",
                onSettingChange: data => {
                  changeInitialDataOptChange((0,filterModuleTier.applyFreeColorSwatchOnEnable)(data, resolvedPostType));
                },
                data: settingData,
                currValue: (0,filterModuleTier.canUseFilterShowIconOrColorSwatch)(resolvedPostType) ? settingData?.show_icon : "false"
              })
            }), (0,filterModuleTier.canUseFilterShowIconOrColorSwatch)(resolvedPostType) && settingData?.show_icon === "true" && (0,termVisualUtils.canUseColorSwatchFeatures)(resolvedPostType) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectMain["default"], {
                label: "Display As",
                property: "term_visual",
                classn: "caf-design-two-half",
                options: (0,filterModuleTier.getFilterTermVisualDisplayOptions)(),
                onSettingChange: data => {
                  // Free cannot select Icon mode.
                  if (!(0,filterModuleTier.canUseFilterShowIcon)() && data?.term_visual !== termVisualUtils.TERM_VISUAL_COLOR) {
                    changeInitialData({
                      ...data,
                      term_visual: termVisualUtils.TERM_VISUAL_COLOR
                    });
                    return;
                  }
                  changeInitialData(data);
                },
                data: {
                  ...settingData,
                  post_type: resolvedPostType,
                  term_visual: (0,filterModuleTier.canUseFilterShowIcon)() ? (0,termVisualUtils.resolveTermVisual)({
                    ...settingData,
                    post_type: resolvedPostType
                  }) : termVisualUtils.TERM_VISUAL_COLOR
                }
              }), (0,termVisualUtils.isTermVisualColor)({
                ...settingData,
                post_type: resolvedPostType,
                term_visual: (0,filterModuleTier.canUseFilterShowIcon)() ? settingData?.term_visual : termVisualUtils.TERM_VISUAL_COLOR
              }) && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "module-content-tab-row caf-design-two-half",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                  classNames: {
                    root: "caf-builder-tooltip"
                  },
                  placement: "topLeft",
                  title: "Choose how the term label appears with the color swatch.",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                    children: "Label"
                  })
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "hoverswitchguard",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(segmented["default"], {
                    value: (0,termVisualUtils.resolveTermLabelDisplay)(settingData),
                    style: {
                      marginBottom: 10
                    },
                    onChange: value => {
                      changeInitialDataOptChange((0,termVisualUtils.applyTermLabelDisplay)({
                        ...settingData
                      }, value));
                    },
                    className: "hoverTabCaf",
                    options: [{
                      label: "Show",
                      value: "show"
                    }, {
                      label: "Hide",
                      value: "hide"
                    }, {
                      label: "Tooltip",
                      value: "tooltip"
                    }]
                  })
                })]
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
              className: "setting-hr-main"
            })]
          })
        }), effectiveDataSource === "taxonomy" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              className: "setting-label-main",
              children: "Show Count"
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-tab-row caf-design-two-half",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
                label: "Enable",
                property: "show_count",
                onSettingChange: changeInitialDataOptChange,
                data: settingData,
                currValue: settingData?.show_count
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row no-pad-0",
            children: [settingData?.show_count === 'true' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectMain["default"], {
                label: "Separator",
                property: "count_separator",
                classn: "caf-design-two-half",
                options: [{
                  value: "brackets",
                  label: "(Brackets)"
                }, {
                  value: "hyphen",
                  label: "Hyphen - "
                }, {
                  value: "none",
                  label: "None"
                }, {
                  value: "custom",
                  label: "Custom"
                }],
                onSettingChange: changeInitialData,
                data: settingData,
                defaultValue: settingData?.count_separator ?? "none"
              }), settingData?.count_separator === 'custom' && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                  className: "module-content-tab-row caf-design-two-half",
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                    classNames: {
                      root: "caf-builder-tooltip"
                    },
                    placement: "topLeft",
                    title: "Set count prefix text.",
                    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                      children: "Prefix"
                    })
                  }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                    type: "text",
                    value: settingData?.count_prefix || '',
                    placeholder: "e.g. (",
                    onChange: e => {
                      changeInitialData({
                        ...settingData,
                        count_prefix: e.target.value
                      });
                    }
                  })]
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                  className: "module-content-tab-row caf-design-two-half",
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                    classNames: {
                      root: "caf-builder-tooltip"
                    },
                    placement: "topLeft",
                    title: "Set count suffix text.",
                    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                      children: "Suffix"
                    })
                  }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                    type: "text",
                    value: settingData?.count_suffix || '',
                    placeholder: "e.g. )",
                    onChange: e => {
                      changeInitialData({
                        ...settingData,
                        count_suffix: e.target.value
                      });
                    }
                  })]
                })]
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
              className: "setting-hr-main"
            })]
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterTermShowMoreLockedSection, {
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTermShowMoreProPanel["default"], {
            settingData: settingData,
            onSettingChange: changeInitialDataOptChange
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row no-pad-0",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            className: "setting-label-main",
            children: "Filter Label"
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
              label: "Enable",
              property: "label",
              property2: "is_label",
              onSettingChange: changeInitialData,
              data: settingData,
              currValue: settingData.label.is_label
            })
          }), checkLabel && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: "caf-filter-label-inner-row",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "module-content-tab-row caf-design-two-half",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                  classNames: {
                    root: "caf-builder-tooltip"
                  },
                  placement: "topLeft",
                  title: "Set filter label text.",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                    children: "Label Text"
                  })
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
                  onChange: e => handleLabel(e.target.value),
                  value: labelInput
                })]
              }), iconsArray && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterLabelShowIconLockedSection, {
                className: "module-content-tab-row caf-builder-show-label-icon",
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterLabelShowIconProPanel["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  iconsArray: iconsArray,
                  onSettingChange: props.onSettingChange,
                  enabled: (0,filterModuleTier.canUseLabelShowIcon)() && labelIconSwitch,
                  onToggle: onLabelIconSwitch,
                  label: "Show Icon"
                })
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterLabelCollapseLockedSection, {
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterLabelCollapseProPanel, {
                settingData: settingData,
                onSettingChange: changeInitialData,
                enabled: (0,filterModuleTier.canUseFilterLabelCollapse)() && toggle.enable
              })
            })]
          })]
        })]
      }), (0,filterModuleTier.canUseFilterCustomField)() && effectiveDataSource === "custom_field" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTermIconSettingsModal["default"], {
        title: termDetail[3],
        open: termSettingPopUp,
        onSave: handleTermSettingSave,
        onCancel: handleTermSettingCancel,
        saveDisabled: !termDetail[5],
        termSelected: termDetail[5],
        iconsArray: iconsArray,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: props.onSettingChange,
        termDetail: termDetail,
        contentIconDetail: contentIconDetail,
        setcontentIconDetail: setcontentIconDetail,
        iconSwitch: iconSwitch,
        setIconSwitch: setIconSwitch,
        selectedIcon: selectedIcon,
        setSelectedIcon: setSelectedIcon,
        checkError: checkError,
        showAddAsParentSwitch: termDetail[4] && (0,filterBuilderUiFlags.canShowAddAsParentSwitch)(),
        isParent: isParent,
        onToggleParent: handleIsParent,
        className: "caf-checkbox-filter-term-setting-modal caf-builder-modal"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(modal["default"], {
        title: labelValueCf || keyValueCf || "Edit Value",
        open: termSettingPopUpCusFieldLabel,
        onOk: handleSaveCustomFieldLabel,
        onCancel: handleCancelCustomFieldLabel,
        className: "caf-checkbox-filter-cf-label-modal caf-builder-modal",
        footer: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          onClick: handleCancelCustomFieldLabel,
          children: "Cancel"
        }, "back"), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_button["default"], {
          type: "primary",
          onClick: handleSaveCustomFieldLabel,
          children: "Save"
        }, "save")],
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Enter option key value.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Key"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => setKeyValueCf(e.target.value),
            value: keyValueCf,
            disabled: true
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Enter option label text.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Label"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => setLabelValueCf(e.target.value),
            value: labelValueCf
          })]
        }), checkError && (keyValueCf === "" || labelValueCf === "") && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Both fields are mandatory.",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            style: {
              color: "red"
            },
            children: "Both Key and Label fields are required."
          })
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterCfTermIconSettingsModal["default"], {
        title: labelValueCf || keyValueCf || "Value Icon",
        open: termSettingPopUpCusFieldIcon,
        onSave: handleSaveCustomFieldIcon,
        onCancel: handleCancelCustomFieldIcon,
        iconsArray: iconsArray,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: props.onSettingChange,
        contentIconDetail: contentIconDetailCusField,
        setcontentIconDetail: setcontentIconDetailCusField,
        iconSwitch: iconSwitchCusField,
        setIconSwitch: setIconSwitchCusField,
        selectedIcon: selectedIconCusField,
        setSelectedIcon: setSelectedIconCusField,
        className: "caf-checkbox-filter-cf-icon-modal caf-builder-modal"
      })]
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(skeleton["default"], {
      active: true
    })
  });
});
/* harmony default export */ const FilterTypes_CheckboxFilter = (CheckboxFilter);
// EXTERNAL MODULE: ./src/MainComponents/utils/usePostTypeCustomFieldOptions.js
var usePostTypeCustomFieldOptions = __webpack_require__("./src/MainComponents/utils/usePostTypeCustomFieldOptions.js");
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/woocommerce/wooPriceSlider.js
var wooPriceSlider = __webpack_require__("./src/MainComponents/FilterComponents/components/woocommerce/wooPriceSlider.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/FilterTypes/rangeSliderFieldOptions.js
/**
 * Free: range slider may only target WooCommerce `_price` (no Pro meta-key list).
 */


function useRangeFieldSelectOptions({
  resolvedPostType
}) {
  return (0,external_React_.useMemo)(() => {
    const options = [{
      label: "Select Field",
      value: "0"
    }];
    if (resolvedPostType === "product") {
      options.push({
        label: wooPriceSlider.WOO_PRICE_META_KEY,
        value: wooPriceSlider.WOO_PRICE_META_KEY
      });
    }
    return options;
  }, [resolvedPostType]);
}
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/FilterTypes/RangeSliderFilter.js























const RangeSliderFilter_normalizeCustomFieldData = value => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};
const getDefaultCustomFieldRow = () => ({
  custom_field_key: "0",
  custom_field_value_list: [],
  compare_operator: "=",
  meta_type: "CHAR"
});
const rangeTypeOptions = [{
  label: "Single",
  value: "single"
}, {
  label: "Double",
  value: "double"
}];
const rangePlacementOptions = [{
  label: "Horizontal",
  value: "horizontal"
}, {
  label: "Vertical",
  value: "vertical"
}];
const RANGE_TEXT_DEFAULTS = {
  prefix: "Prefix",
  suffix: "Suffix"
};
const getDefaultRangeTextValue = type => RANGE_TEXT_DEFAULTS[type] || "Value";
const normalizeRangeTextValue = (type, value) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : getDefaultRangeTextValue(type);
};

/** Legacy layouts omit `default_values`; treat as custom defaults on (previous behavior). */
const rangeSliderCustomDefaultsEnabled = range => {
  const dv = range?.default_values;
  if (!dv || typeof dv !== "object") return true;
  if (dv.is_enable === undefined || dv.is_enable === null) return true;
  return dv.is_enable === "true";
};

/** Keep range bounds and default handles consistent (min ≤ max; double defaults within span and start_min ≤ start_max). */
const normalizeRangeSliderSettings = (range, changedKey) => {
  const out = {
    ...range
  };
  const sliderType = out.type === "single" ? "single" : "double";
  const readNum = v => {
    if (v === "" || v === undefined || v === null) return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  let minNum = readNum(out.min);
  let maxNum = readNum(out.max);
  const defaultsOn = rangeSliderCustomDefaultsEnabled(out);
  if (Number.isFinite(minNum) && Number.isFinite(maxNum)) {
    if (minNum > maxNum) {
      // While typing min or max, min may briefly exceed max (or vice versa). Do not rewrite the
      // other bound on each keystroke — that breaks multi-digit entry (e.g. max "5" would pull min down to 5).
      if (changedKey !== "min" && changedKey !== "max") {
        const lo = Math.min(minNum, maxNum);
        const hi = Math.max(minNum, maxNum);
        out.min = lo;
        out.max = hi;
        minNum = lo;
        maxNum = hi;
      }
    }
    const boundsOrdered = minNum <= maxNum;
    if (boundsOrdered && defaultsOn) {
      const lower = minNum;
      const upper = maxNum;
      if (sliderType === "double") {
        if (out.start_min !== "" && Number.isFinite(Number(out.start_min))) {
          out.start_min = Math.max(lower, Math.min(Number(out.start_min), upper));
        }
        if (out.start_max !== "" && Number.isFinite(Number(out.start_max))) {
          out.start_max = Math.max(lower, Math.min(Number(out.start_max), upper));
        }
        if (out.start_min !== "" && out.start_max !== "" && Number.isFinite(Number(out.start_min)) && Number.isFinite(Number(out.start_max))) {
          const sm = Number(out.start_min);
          const sx = Number(out.start_max);
          if (sx < sm) {
            if (changedKey === "start_max") {
              out.start_max = sm;
            } else if (changedKey === "start_min") {
              out.start_max = sm;
            } else {
              out.start_max = sm;
            }
          }
        }
      } else if (out.start_max !== "" && Number.isFinite(Number(out.start_max))) {
        out.start_max = Math.max(lower, Math.min(Number(out.start_max), upper));
      }
    }
  }
  ["prefix", "suffix"].forEach(type => {
    const textConfig = out?.[type];
    if (!textConfig || typeof textConfig !== "object") return;
    if (textConfig.is_enable === "true") {
      out[type] = {
        ...textConfig,
        value: normalizeRangeTextValue(type, textConfig.value)
      };
    }
  });
  return out;
};
const RangeSliderFilter = (0,external_React_.memo)(props => {
  const {
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  const mainBuilderData = (0,useResolvedMainBuilderData.useResolvedMainBuilderData)(props.mainBuilderData);
  let items = [...props.data];
  let settingData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.settings
  };
  let styleData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.style
  };
  let selectedDevice = props.selectedDevice;
  const resolvedPostType = (0,useResolvedMainBuilderData.getResolvedFilterPostType)(mainBuilderData, settingData?.post_type);
  const {
    options: customFieldOptions
  } = (0,usePostTypeCustomFieldOptions.usePostTypeCustomFieldOptions)({
    postType: resolvedPostType,
    includeValue: (0,wooPriceSlider.resolveRangeSliderMetaKey)(settingData),
    placeholderLabel: "Select Field"
  });
  const rangeFieldSelectOptions = useRangeFieldSelectOptions({
    customFieldOptions,
    resolvedPostType,
    includeValue: (0,wooPriceSlider.resolveRangeSliderMetaKey)(settingData)
  });
  const rangeDefaultNormalizeTimerRef = (0,external_React_.useRef)(null);
  const latestLayoutItemsRef = (0,external_React_.useRef)(props.data);
  (0,external_React_.useLayoutEffect)(() => {
    latestLayoutItemsRef.current = props.data;
  }, [props.data]);
  (0,external_React_.useEffect)(() => () => {
    if (rangeDefaultNormalizeTimerRef.current) {
      clearTimeout(rangeDefaultNormalizeTimerRef.current);
      rangeDefaultNormalizeTimerRef.current = null;
    }
  }, []);

  // Free: only WooCommerce `_price` — force field when custom fields are locked.
  (0,external_React_.useEffect)(() => {
    if ((0,filterModuleTier.canUseRangeSliderCustomFields)()) {
      return;
    }
    if (resolvedPostType !== "product") {
      return;
    }
    const currentKey = (0,wooPriceSlider.resolveRangeSliderMetaKey)(settingData);
    if ((0,wooPriceSlider.isWooPriceMetaKey)(currentKey)) {
      return;
    }
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: latestLayoutItemsRef.current,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: settings => {
        settings.data_source = "custom_field";
        const rows = RangeSliderFilter_normalizeCustomFieldData(settings.custom_field_data);
        const first = rows[0] || getDefaultCustomFieldRow();
        settings.custom_field_data = [(0,wooPriceSlider.ensureWooPriceFieldRow)({
          ...first,
          custom_field_key: wooPriceSlider.WOO_PRICE_META_KEY
        })];
      }
    });
  }, [resolvedPostType, rowindex, columnindex, moduleindex, props.onSettingChange]);
  const [postType, setPostType] = (0,external_React_.useState)(resolvedPostType);
  const [taxonomyList, setTaxonomyList] = (0,external_React_.useState)([]);
  //   const [filterType, setFilterType] = useState(settingData.filter_type);
  const [dataSource, setDataSource] = (0,external_React_.useState)("custom_field");
  const [termSettingPopUp, setTermSettingPopUp] = (0,external_React_.useState)(false);
  const [termSettingPopUpCusField, setTermSettingPopUpCusField] = (0,external_React_.useState)(false);
  const [termPredefinedCusField, setTermPredefinedCusField] = (0,external_React_.useState)(false);
  const [termDetail, setTermDetail] = (0,external_React_.useState)([]);
  const [termPredefined, setTermPredefined] = (0,external_React_.useState)(false);
  const [isParent, setIsParent] = (0,external_React_.useState)(false);
  const [iconsArray, setIconsArray] = (0,external_React_.useState)("");
  const [isLoading, setIsLoading] = (0,external_React_.useState)(false);
  const [LoadingCatogries, setLoadingCatogries] = (0,external_React_.useState)(true);
  const [contentIconDetail, setcontentIconDetail] = (0,external_React_.useState)({
    icon: "",
    position: "before",
    iconChecked: true,
    type: 'icon'
  });
  const [iconSwitch, setIconSwitch] = (0,external_React_.useState)("");
  const [selectedIcon, setSelectedIcon] = (0,external_React_.useState)("");
  const [labelIconSwitch, setLabelIconSwitch] = (0,external_React_.useState)((0,filterModuleTier.canUseLabelShowIcon)() ? settingData?.label?.icons?.visibility : false);
  // custom field
  const [contentIconDetailCusField, setcontentIconDetailCusField] = (0,external_React_.useState)({
    icon: "",
    position: "before",
    iconChecked: false
  });
  const [iconSwitchCusField, setIconSwitchCusField] = (0,external_React_.useState)("");
  const [selectedIconCusField, setSelectedIconCusField] = (0,external_React_.useState)("");
  const [currCustomFieldValue, setCurrCustomFieldValue] = (0,external_React_.useState)([]);
  const [checkError, setCheckError] = (0,external_React_.useState)(false);
  const [checkLabel, setCheckLabel] = (0,external_React_.useState)(settingData.label.is_label === "false" ? false : true);
  const [labelInput, setLabelInput] = (0,external_React_.useState)(settingData.label.value);
  const [toggle, setToggle] = (0,external_React_.useState)(() => (0,filterModuleTier.resolveFilterLabelCollapseToggleState)(settingData));
  // const [allOptionInput, setAllOptionInput] = useState(
  //   settingData.dropdown_data.all_option.value
  // );
  const [customFieldKey, setCustomFieldKey] = (0,external_React_.useState)(settingData?.custom_field_data?.custom_field_key || (Array.isArray(settingData?.custom_field_data) ? settingData.custom_field_data?.[0]?.custom_field_key : ""));
  const [customFieldValue, setCustomFieldValue] = (0,external_React_.useState)("");
  const [customFieldArray, setCustomFieldArray] = (0,external_React_.useState)(RangeSliderFilter_normalizeCustomFieldData(settingData.custom_field_data));
  const [openCfRows, setOpenCfRows] = (0,external_React_.useState)({});
  const [openCfAdv, setOpenCfAdv] = (0,external_React_.useState)({});
  const [compareOperator, setCompareOperator] = (0,external_React_.useState)(settingData?.custom_field_data?.compare_operator || (Array.isArray(settingData?.custom_field_data) ? settingData.custom_field_data?.[0]?.compare_operator : "="));
  const [keyValueCf, setKeyValueCf] = (0,external_React_.useState)("");
  const [labelValueCf, setLabelValueCf] = (0,external_React_.useState)("");
  const [taxonomyListArray, setTaxonomyListArray] = (0,external_React_.useState)([]);
  const [firstRender, setFirstRender] = (0,external_React_.useState)(true);
  const [expandedTaxoItems, setExpandedTaxoItems] = (0,external_React_.useState)([]);
  const [expandedItems, setExpandedItems] = (0,external_React_.useState)([]);
  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";
  (0,external_React_.useEffect)(() => {
    setTaxonomyList(settingData?.taxonomy_data);
  }, [settingData?.taxonomy_data]);

  // useEffect(() => {
  //   let value = "";
  //   if (customFieldArray.length > 0) {
  //     value = customFieldArray.reduce(
  //       (accu, curr) => accu + `${curr.key},`,
  //       ""
  //     );
  //     setCustomFieldValue(value);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (props.saveLayoutClick == true) {
  //     func();
  //     setTimeout(() => {
  //       props.setSaveLayoutClick(false);
  //     }, 600);
  //   }
  //   setCustomFieldKey(settingData.custom_field_data.custom_field_key);
  //   setCustomFieldArray(settingData.custom_field_data.custom_field_value);
  //   if (settingData.custom_field_data.custom_field_value?.length == 0) {
  //     setCustomFieldValue("");
  //   }
  // }, [settingData]);

  (0,external_React_.useEffect)(() => {
    // Range slider settings should always use custom-field flow.
    setDataSource("custom_field");
  }, [settingData.data_source]);
  (0,external_React_.useEffect)(() => {
    const normalizedCustomFields = RangeSliderFilter_normalizeCustomFieldData(settingData?.custom_field_data);
    if (normalizedCustomFields.length === 0) {
      const fallbackRows = [getDefaultCustomFieldRow()];
      setCustomFieldArray(fallbackRows);
      setCompareOperator("=");
      setCustomFieldKey("0");
      setOpenCfRows({});
      setOpenCfAdv({});
      (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange: props.onSettingChange,
        patch: s => {
          s.custom_field_data = fallbackRows;
          s.data_source = "custom_field";
        }
      });
      return;
    }
    setCustomFieldArray(normalizedCustomFields);
    setCompareOperator(settingData?.custom_field_data?.compare_operator || normalizedCustomFields?.[0]?.compare_operator || "=");
    setCustomFieldKey(settingData?.custom_field_data?.custom_field_key || normalizedCustomFields?.[0]?.custom_field_key || "");
    setOpenCfRows({});
    setOpenCfAdv({});
  }, [settingData.custom_field_data]);
  (0,external_React_.useEffect)(() => {
    setCheckError(false);
  }, [iconSwitch, iconSwitchCusField]);

  // useEffect(() => {
  //   if (settingData?.label?.icons?.icon == "") {
  //     settingData.label.icons = {};
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //       settingData;
  //     props.onSettingChange(props.data);
  //   }
  // }, [checkLabel]);

  (0,external_React_.useEffect)(() => {
    let icons = {};
    if (termDetail?.length > 0) {
      if (termDetail[6] && termDetail[6]?.predefine === "true") {
        setTermPredefined(true);
      } else {
        setTermPredefined(false);
      }
      if (termDetail[6]?.is_parent === "true") {
        setIsParent(true);
      } else {
        setIsParent(false);
      }
      icons = termDetail[6]?.icons;
      setIconSwitch(icons?.icon ? true : false);
      if (icons && Object?.keys(icons).length !== 0) {
        let data = contentIconDetail;
        data.icon = icons.icon;
        data.position = icons.position;
        data.iconChecked = true;
        data.type = icons.type;
        setcontentIconDetail(data);
      }
      if (icons?.type === 'icon') {
        setSelectedIcon(icons?.icon ? icons.icon : "");
      } else {
        setSelectedIcon(icons?.icon?.icon?.url ? icons.icon.icon.url : "");
      }
      setCheckError(false);
    } else {
      return;
    }
  }, [termDetail[0]]);
  (0,external_React_.useEffect)(() => {
    let valueData = currCustomFieldValue[2];
    setKeyValueCf(valueData?.key || "");
    setLabelValueCf(valueData?.label || "");
    if (valueData && valueData.predefine === "true") {
      setTermPredefinedCusField(true);
    } else {
      setTermPredefinedCusField(false);
    }
    let icons = {};
    if (valueData && Object?.keys(valueData).length !== 0) {
      icons = valueData?.icons || {};
      let data = contentIconDetailCusField;
      data.icon = icons?.icon || "";
      data.position = icons?.position || "before";
      data.iconChecked = true;
      data.type = icons?.type || "icon";
      setcontentIconDetailCusField(data);
    }
    if (icons?.type === 'icon') {
      setSelectedIconCusField(icons?.icon ? icons.icon : "");
    } else {
      setSelectedIconCusField(icons?.icon?.icon?.url ? icons.icon.icon.url : "");
    }
    setCheckError(false);
  }, [currCustomFieldValue[0], currCustomFieldValue[1]]);
  (0,external_React_.useEffect)(() => {
    const fetchIcons = async () => {
      try {
        const response = await client["default"].get(icons_url);
        if (response.data) {
          setIconsArray(response.data);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };
    fetchIcons();
  }, []);
  (0,external_React_.useEffect)(() => {
    setPostType(resolvedPostType);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, [resolvedPostType]);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await apiClient.get(
  //           baseURL + "get-taxonomy/?post-type=" + postType
  //         );
  //         if (response.data && response.data.status === "success") {
  //           setTaxonomyList(response.data.taxonomy_list);
  //           //setIsLoading(true);
  //           TemrsRefresh();
  //         }
  //       } catch (error) {
  //         console.error("Error fetching data:", error.message);
  //       }
  //     };
  //     fetchData();
  //   }, [postType]);

  //   const onChange = (e) => {
  //     let items = [...props.data];
  //     let item = {
  //       ...items[rowindex].data[columnindex].data[moduleindex].settings,
  //     };
  //     let value = e.target.value;
  //     if (item.taxonomy_data) {
  //       if (item.post_type != postType && item.taxonomy_data.length > 0) {
  //         item.taxonomy_data = [];
  //       }
  //       const isValuePresent = item.taxonomy_data?.some((obj) =>
  //         Object.values(obj).includes(value)
  //       );
  //       if (isValuePresent) {
  //         item.taxonomy_data = item.taxonomy_data.filter(
  //           (element) => element.key !== value
  //         );
  //       } else {
  //         let itemData = { key: value, term_data: [] };
  //         item.taxonomy_data.push(itemData);
  //         item.post_type = postType;
  //       }
  //     } else {
  //       let itemData = { key: value, term_data: [] };
  //       item.taxonomy_data.push(itemData);
  //     }
  //     items[rowindex].data[columnindex].data[moduleindex].settings = item;
  //     props.onSettingChange(props.data);
  //     setTimeout(() => {
  //       func();
  //     }, 500);
  //     TermChecked();
  //   };

  (0,external_React_.useEffect)(() => {
    setCustomFieldKey((0,wooPriceSlider.resolveRangeSliderMetaKey)(settingData) || "0");
  }, [settingData?.custom_field_data, resolvedPostType]);
  const checkboxSkin = [{
    label: "Checkbox Skin 1",
    value: "checkbox_skin1"
  }, {
    label: "Checkbox Skin 2",
    value: "checkbox_skin2"
  }];
  const dataSourceOptions = [{
    label: "Taxonomy",
    value: "taxonomy"
  }, {
    label: "Custom Field",
    value: "custom_field"
  }];
  const customFieldCompareOperators = [{
    label: "is Equal to",
    value: "="
  }, {
    label: "is Not Equal to",
    value: "!="
  }, {
    label: ">",
    value: ">"
  }, {
    label: ">=",
    value: ">="
  }, {
    label: "<",
    value: "<"
  }, {
    label: "<=",
    value: "<="
  }
  // {
  //   label: "LIKE",
  //   value: "LIKE",
  // },
  // {
  //   label: "NOT LIKE",
  //   value: "NOT LIKE",
  // },
  // {
  //   label: "IN",
  //   value: "IN",
  // },
  // {
  //   label: "NOT IN",
  //   value: "NOT IN",
  // },
  // {
  //   label: "BETWEEN",
  //   value: "BETWEEN",
  // },
  // {
  //   label: "NOT BETWEEN",
  //   value: "NOT BETWEEN",
  // },
  // {
  //   label: "EXISTS",
  //   value: "EXISTS",
  // },
  // {
  //   label: "NOT EXISTS",
  //   value: "NOT EXISTS",
  // },
  // {
  //   label: "REGEXP",
  //   value: "REGEXP",
  // },
  // {
  //   label: "NOT REGEXP",
  //   value: "NOT REGEXP",
  // },
  ];
  const customFieldMetaTypes = [{
    label: "CHAR",
    value: "CHAR"
  }, {
    label: "NUMERIC",
    value: "NUMERIC"
  }
  // {
  //   label: "BINARY",
  //   value: "BINARY",
  // },
  // {
  //   label: "DATE",
  //   value: "DATE",
  // },
  // {
  //   label: "DATETIME",
  //   value: "DATETIME",
  // },
  // {
  //   label: "DECIMAL",
  //   value: "DECIMAL",
  // },
  // {
  //   label: "SIGNED",
  //   value: "SIGNED",
  // },
  // {
  //   label: "TIME",
  //   value: "TIME",
  // },
  // {
  //   label: "UNSIGNED",
  //   value: "UNSIGNED",
  // },
  ];
  const handleTermSettingCancel = () => {
    setTermDetail([]);
    setTermSettingPopUp(false);
    setTermPredefined(false);
    setIsParent(false);
    setcontentIconDetail(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: 'icon'
    }));
  };
  const handleTermSettingSave = () => {
    const {
      freshItems,
      settingsRef
    } = (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxonomyExists = newtaxonomyData.some(data => data.key === termDetail[1]);
    if (taxonomyExists) {
      // if (contentIconDetail.icon === "" && contentIconDetail.iconChecked) {
      //   setCheckError(true);
      //   return;
      // }

      const isValuePresent = settingsRef.predefined_terms?.includes(termDetail[2]);
      if (termPredefined === true && !isValuePresent) {
        settingsRef.predefined_terms.push(termDetail[2]);
      } else if (settingsRef.predefined_terms && termPredefined === false) {
        let indexToRemove = settingsRef.predefined_terms.indexOf(termDetail[2]);
        if (indexToRemove !== -1) {
          settingsRef.predefined_terms.splice(indexToRemove, 1);
        }
      }

      // ✅ find and update the taxonomy inside settingData
      newtaxonomyData = newtaxonomyData.map(data => {
        if (data.key !== termDetail[1]) return data;
        let termData = [...data.term_data];
        let childObjIds = [];
        let allChildObjects = [];
        // ✅ handle parent logic
        if (isParent) {
          const txoArray = taxonomyListArray.find(d => d.key === termDetail[1]);
          if (txoArray) {
            let taxoTermData = [...txoArray.term_data];
            const parentTerm = taxoTermData.find(t => t.id === termDetail[0]);
            if (parentTerm) {
              const collectChildrenRecursive = (children, topParentId) => {
                if (!Array.isArray(children)) return;
                children.forEach(child => {
                  //let termIsPresent = termData.some((term) => term.key === child?.id);
                  // helper function to recursively find term by key
                  const findNestedTermByKey = (terms, key) => {
                    for (const term of terms) {
                      if (term.key === key) {
                        return term;
                      }
                      if (Array.isArray(term.children_data) && term.children_data.length > 0) {
                        const found = findNestedTermByKey(term.children_data, key);
                        if (found) return found;
                      }
                    }
                    return null;
                  };
                  const savedTerm = findNestedTermByKey(termData, child?.id);
                  const termIsPresent = !!savedTerm;
                  if (termIsPresent) {
                    //let savedTerm = termData.find((term) => term.key === child?.id);
                    const childCopy = {
                      key: child?.id,
                      value: child?.name,
                      predefine: savedTerm.predefine,
                      icons: savedTerm.icons,
                      parent_id: topParentId,
                      children_data: [],
                      children: "false",
                      count: child?.count
                    };
                    allChildObjects.push(childCopy);
                    childObjIds.push(child.id);
                  }
                  // else{
                  //     const childCopy = {
                  //     key: child?.id,
                  //     value: child?.name,
                  //     predefine: 'false',
                  //     icons: {},
                  //     parent_id: topParentId,
                  //     children_data: [],
                  //     children: "false",
                  //   };
                  //   allChildObjects.push(childCopy);
                  //   childObjIds.push(child.id);
                  // }

                  if (Array.isArray(child.children_data) && child.children_data.length > 0) {
                    collectChildrenRecursive(child.children_data, topParentId);
                  }
                });
              };
              if (Array.isArray(parentTerm.children_data) && parentTerm.children_data.length > 0) {
                collectChildrenRecursive(parentTerm.children_data, termDetail[0]);
              }
              // 🧹 remove nested children from top-level termData
              termData = termData.filter(term => !childObjIds.includes(term.key));
              // return
            }
          }
        } else {
          const parentTerm = termData.find(t => t.key === termDetail[0]);
          //  return
          if (parentTerm && Array.isArray(parentTerm.children_data) && parentTerm.children_data.length > 0) {
            // ✅ Step 1: copy all children
            allChildObjects = parentTerm.children_data;

            // ✅ Step 2: empty children_data from parentTerm
            parentTerm.children_data = [];

            // ✅ Step 3: update termData (remove old parentTerm and reinsert updated one)
            termData = termData.map(term => term.id === parentTerm.id ? {
              ...term,
              children_data: []
            } : term);

            // ✅ Step 4: push all children into termData
            termData = [...termData, ...allChildObjects];
          }
        }
        // ✅ update parent object
        const hasMatchingChild = (children = []) => {
          return children.some(child => child.key === termDetail[0] || Array.isArray(child.children_data) && hasMatchingChild(child.children_data));
        };

        // return 
        const updatedTermData = termData.map(obj => {
          if (obj.key === termDetail[0]) {
            obj.predefine = termPredefined ? "true" : "false";
            if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
              obj.icons = {
                icon: contentIconDetail.icon,
                position: contentIconDetail.position,
                type: contentIconDetail?.type
              };
            } else {
              obj.icons = {};
            }
            if (isParent) {
              obj.children_data = [...allChildObjects];
              obj.is_parent = "true";
            } else {
              obj.is_parent = "false";
            }
          } else {
            updateNestedTerm(obj.children_data, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects);
          }
          return obj;
        });

        // ✅ return updated taxonomy data object
        return {
          ...data,
          term_data: updatedTermData
        };
      });
      (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
        freshItems,
        rowindex,
        columnindex,
        moduleindex,
        settingsRef,
        nexttaxonomyData: newtaxonomyData,
        onSettingChange: props.onSettingChange,
        onAfterCommit: next => setTaxonomyList(next.taxonomy_data)
      });

      // ✅ Reset form states
      setTermSettingPopUp(false);
      setTermPredefined(false);
      setCheckError(false);
      setcontentIconDetail({
        icon: "",
        position: "before",
        iconChecked: false,
        type: 'icon'
      });
      setTermDetail([null]);
    }
  };
  const updateNestedTerm = (children, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects) => {
    if (!Array.isArray(children)) return;
    children.forEach(child => {
      if (child.key === termDetail[0]) {
        // ✅ same logic as main update
        child.predefine = termPredefined ? "true" : "false";
        if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
          child.icons = {
            icon: contentIconDetail.icon,
            position: contentIconDetail.position
          };
        } else {
          child.icons = {};
        }
        if (isParent) {
          child.children_data = [...allChildObjects];
          child.is_parent = "true";
        } else {
          child.is_parent = "false";
        }
      } else if (Array.isArray(child.children_data) && child.children_data.length > 0) {
        // 🔁 recursive call for deeper nested children
        updateNestedTerm(child.children_data, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects);
      }
    });
  };
  const handleTermSwitch = checked => {
    setTermPredefined(checked);
  };
  const handleIsParent = checked => {
    setIsParent(checked);
  };
  const checkTermData = (id, taxo) => {
    //if click on terms settings then check , it present or not in the taxonomy data
    if (id) {
      for (let index = 0; index < settingData.taxonomy_data?.length; index++) {
        let data = settingData.taxonomy_data[index];
        if (data.key == taxo) {
          let termData = data.term_data;
          for (let i = 0; i < termData.length; i++) {
            let obj = termData[i];
            let childData = obj.children_data;
            for (let j = 0; j < childData.length; j++) {
              if (childData[j].key == id) {
                return true;
              }
            }
            if (obj.key == id) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };
  const handleLabel = val => {
    setLabelInput(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = {
          ...s.label,
          value: val
        };
      }
    });
  };
  const removeParentChild = () => {
    settingData?.taxonomy_data.map((data, index) => {
      if (data.term_data?.length > 0) {
        data.term_data.map(item => {
          if (item.children_data?.length > 0) {
            data.term_data.push(...item.children_data);
            item.children_data = [];
            item.is_parent = "false";
          }
        });
      }
    });
    setLoadingCatogries(false);
    setTimeout(() => {
      setLoadingCatogries(true);
    }, 400);
  };
  const handleEdit = () => {
    props.openBuilderSetting(true);
  };
  const changeInitialData = data => {
    setDataSource(data.data_source);
    if (data.data_source !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label === "false" ? false : true);
    if (data.label.is_label === "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    setToggle(prev => ({
      ...prev,
      enable: data.enable_toggle === "false" ? false : true
    }));
    if (data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle(prev => ({
        ...prev,
        close: false
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings: data
    });
  };
  const changeInitialDataOptChange = data => {
    setDataSource(data.data_source);
    if (data.data_source !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label === "false" ? false : true);
    if (data.label.is_label === "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    setToggle(prev => ({
      ...prev,
      enable: data.enable_toggle === "false" ? false : true
    }));
    if (data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle(prev => ({
        ...prev,
        close: false
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);
    styleData.meta1[selectedDevice].default.justifyContent = "flex-start";
    styleData.meta1[selectedDevice].default.alignItems = "flex-start";
    styleData.meta2[selectedDevice].default.justifyContent = "flex-start";
    styleData.meta2[selectedDevice].default.alignItems = "flex-start";
    styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
    styleData.meta3[selectedDevice].default.alignItems = "flex-start";
    items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData;
    props.onSettingChange(items);
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings: data
    });
  };

  // const changeInitialDataIconOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source !== settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label === "false" ? false : true);
  //   if (data.label.is_label === "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle === "false" ? false : true,
  //   }));
  //   if (data.enable_toggle === "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);

  //   styleData.meta2[selectedDevice].default.justifyContent = "flex-start";
  //   styleData.meta2[selectedDevice].default.alignItems = "flex-start";

  //   items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
  //   props.onSettingChange(items);

  //   commitFilterModuleReplaceSettings({
  //     data: props.data,
  //     rowindex,
  //     columnindex,
  //     moduleindex,
  //     resolvedPostType,
  //     onSettingChange: props.onSettingChange,
  //     nextSettings: data,
  //   });
  // };

  // const changeInitialDataCountOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source !== settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label === "false" ? false : true);
  //   if (data.label.is_label === "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle === "false" ? false : true,
  //   }));
  //   if (data.enable_toggle === "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);

  //   styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
  //   styleData.meta3[selectedDevice].default.alignItems = "flex-start";

  //   items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
  //   props.onSettingChange(items);

  //   commitFilterModuleReplaceSettings({
  //     data: props.data,
  //     rowindex,
  //     columnindex,
  //     moduleindex,
  //     resolvedPostType,
  //     onSettingChange: props.onSettingChange,
  //     nextSettings: data,
  //   });
  // };

  const changeDataSource = value => {
    setDataSource(value);
    if (value !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        if (value === "custom_field") {
          s.show_count = "false";
        }
        s.data_source = value;
      }
    });
  };
  const customFieldKeyFunc = (value, customField, index) => {
    if (customField === "key" && !(0,filterModuleTier.canUseRangeSliderCustomFields)() && !(0,wooPriceSlider.isWooPriceMetaKey)(value) && value !== "0") {
      return;
    }
    let updateData = [];
    if (customField === "key") {
      updateData = customFieldArray.map((item, id) => {
        if (id === index) {
          if ((0,wooPriceSlider.isWooPriceMetaKey)(value)) {
            return (0,wooPriceSlider.ensureWooPriceFieldRow)({
              ...item,
              custom_field_key: value
            });
          }
          if ((0,wooPriceSlider.isWooDimensionMetaKey)(value)) {
            return (0,wooPriceSlider.ensureWooDimensionFieldRow)({
              ...item,
              custom_field_key: value
            }, value);
          }
          return {
            ...item,
            custom_field_key: value
          };
        }
        return item;
      });
    }
    if (customField === "value") {
      updateData = customFieldArray?.map((item, id) => {
        if (id === index) {
          return {
            ...item,
            custom_field_value_list: [...(item.custom_field_value_list || []), {
              key: value,
              label: value,
              icons: {
                icon: "",
                type: "icon",
                position: "before",
                iconChecked: true
              },
              predefine: "false"
            }]
          };
        }
        return item;
      });
    }
    setCustomFieldArray(updateData);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        // Switching Woo price/dimension field re-seeds catalog bounds.
        if (customField === "key" && (0,wooPriceSlider.isWooAllowlistedRangeMetaKey)(value)) {
          s.range_slider = {
            ...(s.range_slider || {}),
            bounds_manual: "false"
          };
        }
      }
    });
  };
  const customFieldValueSetting = (cfIndex, valueIndex, valueData) => {
    setCurrCustomFieldValue([cfIndex, valueIndex, valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusField(true);
    }, 500);
  };
  const handleSaveCustomField = () => {
    if (keyValueCf === "" || labelValueCf === "") {
      setCheckError(true);
      return false;
    }
    let updateData = customFieldArray?.map((item, id) => {
      if (id === currCustomFieldValue[0]) {
        return {
          ...item,
          custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {
            if (vid === currCustomFieldValue[1]) {
              let updatedValue = {
                ...value,
                predefine: termPredefinedCusField ? "true" : "false",
                key: keyValueCf,
                label: labelValueCf
              };
              updatedValue.icons = {
                ...(value.icons || {}),
                icon: contentIconDetailCusField.icon,
                position: contentIconDetailCusField.position,
                type: contentIconDetailCusField.type,
                iconChecked: false
              };
              // for predefine save start
              if (termPredefinedCusField) {
                const exists = settingData.cf_predefined_terms?.some(itemData => itemData.key === item?.custom_field_key && itemData.value === value.key);
                if (!exists) {
                  settingData.cf_predefined_terms.push({
                    key: item?.custom_field_key,
                    value: value.key
                  });
                } else {
                  settingData.cf_predefined_terms = settingData.cf_predefined_terms.filter(itemData => !(itemData.key === item?.custom_field_key && itemData.value === value.key));
                }
              }

              // predefine save end
              return updatedValue;
            }
            return value;
          })
        };
      }
      return item;
    });
    setcontentIconDetailCusField(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon"
    }));
    setTermSettingPopUpCusField(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);
    setCustomFieldArray(updateData);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
        if (Array.isArray(settingData.cf_predefined_terms)) {
          s.cf_predefined_terms = [...settingData.cf_predefined_terms];
        }
      }
    });
  };
  const handleCancelCustomField = () => {
    setcontentIconDetailCusField(prev => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon"
    }));
    setTermSettingPopUpCusField(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);
  };
  const handleTermSwitchCusField = checked => {
    setTermPredefinedCusField(checked);
  };
  //   const TemrsRefresh=()=>{
  //     setIsLoading(false)
  //     setTimeout(()=>{
  //     setIsLoading(true);
  //   },600)
  //   }
  (0,external_React_.useEffect)(() => {
    const fetchTaxoData = async () => {
      try {
        const res = await client["default"].get(endpoints.apiEndpoints.getTaxonomyRecursiveData(resolvedPostType));
        if (res.data && res.data.status === "success") {
          setTaxonomyListArray(res.data.taxonomy_list);
          setIsLoading(false);
          setLoadingCatogries(true);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };
    if (resolvedPostType) {
      setPostType(resolvedPostType);
      setLoadingCatogries(false);
      fetchTaxoData();
    }
  }, [resolvedPostType]);

  //   const getAllTermsRecursive = (termList ,type="parent") => {
  //     let all = [];
  //     if (Array.isArray(termList) && termList.length > 0) {
  //       termList.forEach((term) => {
  //         let childrenExist = "false";
  //         let childrenArray = [];
  //         let is_parent = "false";
  //         let parent_id = null;
  //         if (
  //           Array.isArray(term.children_data) &&
  //           term.children_data.length > 0 && type == "parent"
  //         ) {
  //             childrenExist ="true";
  //         }
  //         all.push({
  //           key: term?.id,
  //           value: term?.name,
  //           predefine: "false",
  //           icons: {},
  //           is_parent: is_parent,
  //           children_data:childrenArray,
  //           children:childrenExist,
  //           parent_id : type == "parent" ? parent_id :parent_id,
  //         });
  //         if (
  //           Array.isArray(term.children_data) &&
  //           term.children_data.length > 0
  //         ) {
  //           all = [...all, ...getAllTermsRecursive(term.children_data,'child',)];
  //         }
  //       });
  //     }
  //     return all;
  //   };

  const getAllTermsRecursive = (termList, type = "parent", rootParentId = null) => {
    let all = [];
    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach(term => {
        const hasChildren = type === "parent" && Array.isArray(term.children_data) && term.children_data.length > 0;

        // Determine if this is a root parent (first level)
        const isRootParent = type === "parent";
        const currentParentId = isRootParent ? term?.id : rootParentId;

        // Push current term
        all.push({
          key: term?.id,
          value: term?.name,
          predefine: "false",
          icons: {},
          is_parent: "false",
          children_data: [],
          // flattened later
          children: hasChildren ? "true" : "false",
          count: term?.count,
          parent_id: isRootParent ? null : rootParentId // 🔥 children use top-level parent ID
        });

        // Recursively process children, passing the top-level parent’s ID
        if (Array.isArray(term.children_data) && term.children_data.length > 0) {
          all = [...all, ...getAllTermsRecursive(term.children_data, "child", currentParentId)];
        }
      });
    }
    return all;
  };

  // const isAllSelected = (taxonomyKey) => {
  //     const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
  //     const savedTax = settingData.taxonomy_data.find(
  //       (data) => data.key === taxonomyKey
  //     );

  //     if (!taxItem) return false;

  //     const allTerms = getAllTermsRecursive(taxItem.term_data);

  //     if (!savedTax || !savedTax.term_data) return false;

  //     return allTerms.every((term) =>
  //       savedTax.term_data.some((saved) => saved.key === term.key)
  //     );
  //   };

  const isAllSelected = taxonomyKey => {
    const taxItem = taxonomyListArray.find(item => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(data => data.key === taxonomyKey);
    if (!taxItem) return false;
    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;

    // 🔍 Helper function to search recursively inside children_data
    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    // ✅ Check if every term is present either at top-level or inside any children
    return allTerms.every(term => {
      return savedTax.term_data.some(saved => {
        if (saved.key === term.key) return true;
        if (Array.isArray(saved.children_data) && saved.children_data.length > 0) {
          return searchInChildren(saved.children_data, term.key);
        }
        return false;
      });
    });
  };

  //   const isAnySelected = (taxonomyKey) => {
  //     const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
  //     const savedTax = settingData.taxonomy_data.find(
  //       (data) => data.key === taxonomyKey
  //     );

  //     if (!taxItem) return false;

  //     const allTerms = getAllTermsRecursive(taxItem.term_data);

  //     if (!savedTax || !savedTax.term_data) return false;

  //     // agar ek bhi term.key savedTax.term_data me mil jaye to true return kare
  //     const hasAnyMatch = allTerms.some((term) =>
  //       savedTax.term_data.some((saved) => saved.key === term.key)
  //     );
  //     if (hasAnyMatch) {
  //       return true;
  //     } else {
  //       false;
  //     }
  //   };

  const isAnySelected = taxonomyKey => {
    const taxItem = taxonomyListArray.find(item => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(data => data.key === taxonomyKey);
    if (!taxItem) return false;
    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;

    // 🔍 Helper: recursive search for a term inside nested children_data
    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    // ✅ If any term exists anywhere (top-level or nested), return true
    return allTerms.some(term => {
      return savedTax.term_data.some(saved => {
        if (saved.key === term.key) return true;
        if (Array.isArray(saved.children_data) && saved.children_data.length > 0) {
          return searchInChildren(saved.children_data, term.key);
        }
        return false;
      });
    });
  };
  const TaxoToggleExpand = taxokey => {
    setFirstRender(false);
    setExpandedTaxoItems(prev => {
      const newArray = prev.includes(taxokey) ? prev.filter(x => x !== taxokey) : [...prev, taxokey];
      return Array.from(new Set(newArray));
    });
  };
  const toggleExpand = id => {
    setExpandedItems(prev => {
      const newArray = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return Array.from(new Set(newArray));
    });
  };
  const getFreshSettingsSnapshot = () => {
    return (0,filterSettingsSnapshot.createFilterModuleSettingsSnapshot)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType
    });
  };
  const commitSettingsSnapshot = (freshItems, settingsRef, nexttaxonomyData) => {
    (0,filterSettingsSnapshot.commitFilterModuleTaxonomyData)({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: nextSettings => setTaxonomyList(nextSettings.taxonomy_data)
    });
  };
  const handleTerm = (e, taxonomy, term, type = "parent", parantTermData = {}) => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const checked = e.target.checked;
    const taxonomyExists = newtaxonomyData.some(data => data.key === taxonomy);
    let childrenExist = "false";
    let childrenArray = [];
    let is_parent = "false";
    let parent_id = null;
    if (term?.children_data.length > 0 && type == "parent") {
      childrenExist = "true";
    }
    if (checked) {
      if (taxonomyExists) {
        const data = newtaxonomyData.find(d => d.key === taxonomy);
        const termData = [...data.term_data];
        const parent = termData.find(obj => obj.key === parantTermData?.id);
        if (type === "child" && Object.keys(parantTermData).length > 0 && parent?.is_parent === "true") {
          parent_id = parent?.key;

          // Find the parent object
          const parantObjIndex = termData.findIndex(obj => obj.key === parent_id);
          if (parantObjIndex !== -1) {
            const parantObj = {
              ...termData[parantObjIndex]
            };
            const parantChildData = [...parantObj.children_data];
            const isChildPresent = parantChildData.some(obj => obj.key === term?.id);
            if (!isChildPresent) {
              parantChildData.push({
                key: term?.id,
                value: term?.name,
                predefine: "false",
                icons: {},
                is_parent: "false",
                children_data: [],
                children: "false",
                parent_id: parent_id,
                count: term?.count
              });
            }
            parantObj.children_data = parantChildData;
            termData[parantObjIndex] = parantObj;
            const dataIndex = newtaxonomyData.findIndex(d => d.key === taxonomy);
            if (dataIndex !== -1) {
              newtaxonomyData[dataIndex] = {
                ...newtaxonomyData[dataIndex],
                term_data: termData
              };
            }
          }
        } else {
          const isValuePresent = termData.some(obj => obj.key === term?.id);
          if (!isValuePresent) {
            termData.push({
              key: term?.id,
              value: term?.name,
              predefine: "false",
              icons: {},
              is_parent: is_parent,
              children_data: childrenArray,
              children: childrenExist,
              parent_id: parent_id,
              count: term?.count
            });
          }
          data.term_data = termData;
        }
      } else {
        newtaxonomyData.push({
          key: taxonomy,
          term_data: [{
            key: term?.id,
            value: term?.name,
            predefine: "false",
            icons: {},
            is_parent: is_parent,
            children_data: childrenArray,
            children: childrenExist,
            parent_id: parent_id,
            count: term?.count
          }]
        });
      }
    } else {
      if (taxonomyExists) {
        const data = newtaxonomyData.find(d => d.key === taxonomy);
        if (data) {
          const termData = [...data.term_data];
          const parent = termData.find(obj => obj.key === parantTermData?.id);
          if (type == "child" && Object.keys(parantTermData).length > 0 && parent?.is_parent == "true") {
            parent_id = parent?.key;

            // Find parent index inside term_data
            const parantObjIndex = data.term_data.findIndex(obj => obj.key === parent_id);
            if (parantObjIndex !== -1) {
              const parantObj = {
                ...data.term_data[parantObjIndex]
              };
              const parantChildData = [...parantObj.children_data];

              // Remove the unchecked child
              parantObj.children_data = parantChildData.filter(obj => obj.key !== term?.id);

              // ✅ Update the parent object back in term_data
              const updatedTermData = [...data.term_data];
              updatedTermData[parantObjIndex] = parantObj;

              // ✅ Update taxonomy in newtaxonomyData
              const taxonomyIndex = newtaxonomyData.findIndex(tx => tx.key === taxonomy);
              if (taxonomyIndex !== -1) {
                newtaxonomyData[taxonomyIndex] = {
                  ...newtaxonomyData[taxonomyIndex],
                  term_data: updatedTermData
                };
              }
            }
          } else {
            data.term_data = data.term_data.filter(obj => obj.key !== term?.id);
            if (data.term_data.length === 0) {
              data.term_data = [];
              newtaxonomyData = newtaxonomyData.filter(tx => tx.key !== taxonomy);
            }
          }
        }
      }
    }

    //updateFilterQueryData("taxonomy_data", newtaxonomyData);
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  //   const handleTermChecked = (taxonomy, term,type="parent",parantTermData={}) => {
  //     const taxo =
  //       Array.isArray(settingData.taxonomy_data) &&
  //       settingData.taxonomy_data?.find((d) => d.key == taxonomy);
  //     if (!taxo || !Array.isArray(taxo.term_data)) return false;

  //     const parent = termData.find((obj) => obj.key === parantTermData?.id);

  //     return taxo.term_data.some((obj) => obj.key == term?.id);
  //   };

  const handleTermChecked = (taxonomy, term, type = "parent", parantTermData = {}) => {
    const taxo = Array.isArray(settingData.taxonomy_data) && settingData.taxonomy_data.find(d => d.key === taxonomy);
    if (!taxo || !Array.isArray(taxo.term_data)) return false;
    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    // 🔍 Check at both top level and nested children
    for (const obj of taxo.term_data) {
      if (obj.key === term?.id) return true;
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const foundInChildren = searchInChildren(obj.children_data, term?.id);
        if (foundInChildren) return true;
      }
    }
    return false;
  };
  function NestedTerms({
    taxoKey,
    childrenData,
    termData,
    expandedItems,
    toggleExpand,
    handleTerm,
    handleTermChecked
  }) {
    if (!Array.isArray(childrenData) || childrenData.length === 0) return null;
    return (
      /*#__PURE__*/
      // <ul className="children">
      (0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
        children: childrenData.map(child => {
          const hasChildren = Array.isArray(child?.children_data) && child.children_data.length > 0;
          const hasChildClass = Array.isArray(child?.children_data) && child.children_data.length > 0 ? "tc-caf-has-child" : "";
          const isExpanded = expandedItems.includes(child.id);
          return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("li", {
            className: `cat-item cat-item-${child?.id} ${hasChildClass}`,
            count: child?.total_count,
            "term-id": child?.id,
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: "trusty-manage-bar-sec-label",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("label", {
                htmlFor: `${taxoKey}-list-id${child?.id}`,
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("input", {
                  className: `${taxoKey}-list check`,
                  type: "checkbox",
                  "term-name": child?.name,
                  name: `${taxoKey}[]`,
                  id: `${taxoKey}-list-id${child?.id}`,
                  value: `${taxoKey}___${child?.id}`,
                  onChange: e => handleTerm(e, taxoKey, child, 'child', termData),
                  checked: handleTermChecked(taxoKey, child, 'child', termData)
                }), (0,esm["default"])(`${child?.name}`), " ", `(${child?.total_count})`]
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
                className: "fa fa-cog caf-term-setting",
                "aria-hidden": "true",
                onClick: () => handleTermSetting(child, taxoKey, "child", termData)
              }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("i", {
                className: `fa ${isExpanded ? "fa-minus" : "fa-plus"} caf-builder-plus`,
                "aria-hidden": "true",
                onClick: e => {
                  e.stopPropagation();
                  toggleExpand(child.id);
                },
                style: {
                  cursor: "pointer"
                }
              })]
            }), hasChildren && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("ul", {
              className: `children ${isExpanded ? "tc_caf_active_list" : ""}`,
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(NestedTerms, {
                taxoKey: taxoKey,
                childrenData: child.children_data,
                termData: termData,
                expandedItems: expandedItems,
                toggleExpand: toggleExpand,
                handleTerm: handleTerm,
                handleTermChecked: handleTermChecked
              })
            })]
          }, child?.id);
        })
      })
      // </ul>
    );
  }
  const handleSelectAll = taxonomy => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxItem = taxonomyListArray.find(item => item.key === taxonomy);
    if (!taxItem) return;
    const allTerms = getAllTermsRecursive(taxItem.term_data, 'parent');
    const exists = newtaxonomyData.some(data => data.key === taxonomy);
    if (exists) {
      newtaxonomyData = newtaxonomyData.map(data => {
        if (data.key === taxonomy) {
          const merged = [...data.term_data, ...allTerms];
          const unique = Array.from(new Map(merged.map(item => [item.key, item])).values());
          return {
            ...data,
            term_data: unique
          };
        }
        return data;
      });
    } else {
      newtaxonomyData.push({
        key: taxonomy,
        term_data: allTerms
      });
    }
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };
  const handleSelectNone = taxonomy => {
    const {
      freshItems,
      settingsRef
    } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxonomyItem = newtaxonomyData.find(data => data.key === taxonomy);
    if (taxonomyItem) {
      taxonomyItem.term_data = [];
      newtaxonomyData = newtaxonomyData.filter(tx => tx.key !== taxonomy);
    }
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };
  const handleTermSetting = (term, taxonomy, type = "parent", parantTermData = {}) => {
    let hasParent = false;
    if (term?.children_data.length > 0 && type == "parent") {
      hasParent = true;
    }
    let term_id = taxonomy + "___" + term?.id;
    let newtaxonomyData = [...settingData.taxonomy_data];
    const taxonomyExists = newtaxonomyData.some(data => data.key === taxonomy);
    // if (taxonomyExists) {
    const data = newtaxonomyData.find(d => d.key === taxonomy) || {};
    const termData = Array.isArray(data?.term_data) ? [...data.term_data] : [];
    // const currentTerm = termData.some((obj) => obj.key === term?.id)
    const findTermObjRecursive = (data, termId) => {
      for (const obj of data) {
        if (obj.key === termId) {
          return obj;
        }
        if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
          const found = findTermObjRecursive(obj.children_data, termId);
          if (found) return found;
        }
      }
      return null;
    };
    const termObj = findTermObjRecursive(termData, term?.id) || {};
    setTermDetail([term?.id, taxonomy, term_id, term?.name, hasParent, handleTermChecked(taxonomy, term, type), termObj]);
    setTimeout(() => {
      setTermSettingPopUp(true);
    }, 100);
    // }
  };
  const onLabelIconSwitch = checked => {
    if (!(0,filterModuleTier.canUseLabelShowIcon)()) {
      return;
    }
    setLabelIconSwitch(checked);
    let itm = {
      ...settingData?.label
    };
    let ic = {
      ...itm?.icons
    };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
      ic.position = "before-label";
    }
    ic.visibility = checked;
    itm.icons = {
      ...itm.icons,
      ...ic
    };
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = itm;
      }
    });
  };
  const getCompareLabel = value => {
    const match = customFieldCompareOperators?.find(item => item.value === value);
    return match ? match.label : "";
  };
  const RANGE_DEFAULT_NORMALIZE_MS = 500;
  function clearRangeDefaultNormalizeDebounce() {
    if (rangeDefaultNormalizeTimerRef.current) {
      clearTimeout(rangeDefaultNormalizeTimerRef.current);
      rangeDefaultNormalizeTimerRef.current = null;
    }
  }
  function flushRangeSliderDefaultNormalize() {
    clearRangeDefaultNormalizeDebounce();
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: latestLayoutItemsRef.current,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.range_slider = normalizeRangeSliderSettings(s.range_slider || {}, null);
      }
    });
  }
  function scheduleRangeSliderDefaultNormalize() {
    clearRangeDefaultNormalizeDebounce();
    rangeDefaultNormalizeTimerRef.current = setTimeout(() => {
      rangeDefaultNormalizeTimerRef.current = null;
      (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
        data: latestLayoutItemsRef.current,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange: props.onSettingChange,
        patch: s => {
          s.range_slider = normalizeRangeSliderSettings(s.range_slider || {}, null);
        }
      });
    }, RANGE_DEFAULT_NORMALIZE_MS);
  }
  (0,external_React_.useEffect)(() => {
    if (rangeDefaultNormalizeTimerRef.current) {
      clearTimeout(rangeDefaultNormalizeTimerRef.current);
      rangeDefaultNormalizeTimerRef.current = null;
    }
  }, [rowindex, columnindex, moduleindex]);
  const rangeSettings = {
    min: typeof settingData?.range_slider?.min !== "undefined" ? settingData?.range_slider?.min : "",
    max: typeof settingData?.range_slider?.max !== "undefined" ? settingData?.range_slider?.max : "",
    step: typeof settingData?.range_slider?.step !== "undefined" ? settingData?.range_slider?.step : "",
    start_min: typeof settingData?.range_slider?.start_min !== "undefined" ? settingData?.range_slider?.start_min : "",
    start_max: typeof settingData?.range_slider?.start_max !== "undefined" ? settingData?.range_slider?.start_max : ""
  };
  const handleRangeSettingChange = (key, value) => {
    const parsed = value === "" ? "" : Number(value);
    if (value !== "" && Number.isNaN(parsed)) {
      return;
    }
    if (key === "start_min" || key === "start_max") {
      (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange: props.onSettingChange,
        patch: s => {
          s.range_slider = {
            ...(s.range_slider || {}),
            [key]: parsed
          };
        }
      });
      scheduleRangeSliderDefaultNormalize();
      return;
    }
    clearRangeDefaultNormalizeDebounce();
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        const nextRange = {
          ...(s.range_slider || {}),
          [key]: parsed
        };
        // User edited track bounds — keep these on frontend (don't re-auto from catalog).
        if (key === "min" || key === "max") {
          nextRange.bounds_manual = "true";
        }
        s.range_slider = normalizeRangeSliderSettings(nextRange, key);
      }
    });
  };
  const rangeTextPrefixRaw = settingData?.range_slider?.prefix || {
    is_enable: "false",
    value: ""
  };
  const rangeTextSuffixRaw = settingData?.range_slider?.suffix || {
    is_enable: "false",
    value: ""
  };
  const rangeTextPrefix = {
    ...rangeTextPrefixRaw,
    value: rangeTextPrefixRaw?.is_enable === "true" ? normalizeRangeTextValue("prefix", rangeTextPrefixRaw?.value) : rangeTextPrefixRaw?.value || ""
  };
  const rangeTextSuffix = {
    ...rangeTextSuffixRaw,
    value: rangeTextSuffixRaw?.is_enable === "true" ? normalizeRangeTextValue("suffix", rangeTextSuffixRaw?.value) : rangeTextSuffixRaw?.value || ""
  };
  const rangeCustomDefaultsEnabled = rangeSliderCustomDefaultsEnabled(settingData?.range_slider);
  const handleRangeDefaultValuesToggle = enabled => {
    clearRangeDefaultNormalizeDebounce();
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        const next = {
          ...(s.range_slider || {}),
          default_values: {
            ...(s.range_slider && s.range_slider.default_values || {}),
            is_enable: enabled ? "true" : "false"
          }
        };
        s.range_slider = normalizeRangeSliderSettings(next, null);
      }
    });
  };
  const handleRangeTextToggle = (type, enabled) => {
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        const prevTextConfig = {
          ...(s.range_slider && s.range_slider[type] || {})
        };
        s.range_slider = {
          ...(s.range_slider || {}),
          [type]: {
            ...prevTextConfig,
            is_enable: enabled ? "true" : "false",
            value: enabled ? normalizeRangeTextValue(type, prevTextConfig.value) : prevTextConfig.value || ""
          }
        };
      }
    });
  };
  const handleRangeTextValueChange = (type, value) => {
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.range_slider = {
          ...(s.range_slider || {}),
          [type]: {
            ...(s.range_slider && s.range_slider[type] || {}),
            value
          }
        };
      }
    });
  };
  const handleRangeTextValueBlur = (type, value) => {
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.range_slider = {
          ...(s.range_slider || {}),
          [type]: {
            ...(s.range_slider && s.range_slider[type] || {}),
            value: normalizeRangeTextValue(type, value)
          }
        };
      }
    });
  };
  const handleRangeModeChange = value => {
    clearRangeDefaultNormalizeDebounce();
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        const prevType = s?.range_slider?.type || "double";
        const nextSlider = {
          ...(s.range_slider || {}),
          type: value
        };

        // On single -> double:
        // - keep single selected value as default min
        // - force default max to the configured max field value
        if (prevType === "single" && value === "double") {
          const currentMaxField = typeof s?.range_slider?.max !== "undefined" ? s.range_slider.max : "";
          const currentSingleValue = typeof s?.range_slider?.start_max !== "undefined" ? s.range_slider.start_max : typeof s?.range_slider?.min !== "undefined" ? s.range_slider.min : "";
          nextSlider.start_min = currentSingleValue;
          nextSlider.start_max = currentMaxField;
        }

        // On double -> single:
        // - keep double default min as the single selected default value.
        if (prevType === "double" && value === "single") {
          const currentDoubleMin = typeof s?.range_slider?.start_min !== "undefined" ? s.range_slider.start_min : typeof s?.range_slider?.min !== "undefined" ? s.range_slider.min : "";
          nextSlider.start_max = currentDoubleMin;
        }
        s.range_slider = normalizeRangeSliderSettings(nextSlider, null);
      }
    });
  };
  const handleRangePlacementChange = value => {
    clearRangeDefaultNormalizeDebounce();
    const currentPlacement = settingData?.range_slider?.placement || "horizontal";
    const freshItems = JSON.parse(JSON.stringify(props.data || []));
    const moduleRef = freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
    if (!moduleRef) return;
    moduleRef.settings = moduleRef.settings || {};
    moduleRef.settings.range_slider = {
      ...(moduleRef.settings.range_slider || {}),
      placement: value
    };
    if (value !== currentPlacement) {
      const devices = ["desktop", "tablet", "mobile"];
      const states = ["default", "hover"];
      const toVertical = value === "vertical";
      if (moduleRef.style?.meta2) {
        devices.forEach(device => {
          states.forEach(state => {
            const styleObj = moduleRef.style.meta2?.[device]?.[state];
            if (!styleObj) return;
            const hasW = styleObj.width !== undefined;
            const hasH = styleObj.height !== undefined;
            if (!hasW && !hasH) return;
            const w = styleObj.width;
            const h = styleObj.height;
            if (toVertical) {
              const isWPercent = typeof w === "string" && w.includes("%");
              styleObj.width = hasH ? h : "8px";
              // Fixed pixel height when width is missing — 100% collapses without an explicit parent height.
              styleObj.height = hasW ? isWPercent ? "150px" : w : "130px";
            } else {
              const isHPercent = typeof h === "string" && h.includes("%");
              styleObj.width = hasH ? isHPercent ? "100%" : h : "100%";
              styleObj.height = hasW ? w : "8px";
            }
          });
        });
      }
      if (moduleRef.style?.meta3) {
        devices.forEach(device => {
          states.forEach(state => {
            const styleObj = moduleRef.style.meta3?.[device]?.[state];
            if (!styleObj) return;
            const hasMT = styleObj.marginTop !== undefined;
            const hasML = styleObj.marginLeft !== undefined;
            const hasMB = styleObj.marginBottom !== undefined;
            if (!hasMT && !hasML && !hasMB) return;
            if (toVertical) {
              const mt = styleObj.marginTop;
              const ml = styleObj.marginLeft;
              styleObj.marginLeft = hasMT ? mt : "0px";
              styleObj.marginBottom = hasML ? ml : "0px";
              if (hasMT) styleObj.marginTop = "0px";
            } else {
              const ml = styleObj.marginLeft;
              const mb = styleObj.marginBottom;
              styleObj.marginTop = hasML ? ml : "0px";
              styleObj.marginLeft = hasMB ? mb : "0px";
              if (hasMB) styleObj.marginBottom = "0px";
            }
          });
        });
      }
    }
    props.onSettingChange(freshItems);
  };
  const addCustomField = () => {
    let newField = {
      custom_field_key: "0",
      custom_field_value_list: [],
      compare_operator: "=",
      meta_type: "CHAR"
    };
    let updatedCustomFieldData = [...RangeSliderFilter_normalizeCustomFieldData(customFieldArray)];
    updatedCustomFieldData?.push(newField);
    setCustomFieldArray(updatedCustomFieldData);
    settingData.custom_field_data = updatedCustomFieldData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updatedCustomFieldData;
      }
    });
  };
  const toggleCfRow = index => {
    setOpenCfRows(prev => ({
      ...prev,
      [index]: !(prev[index] ?? true)
    }));
  };
  const toggleCfAdv = index => {
    setOpenCfAdv(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  const removeArray = (arr, index) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // part of the array after the specified index
  ...arr.slice(index + 1)];
  const deleteCustomField = index => {
    let updatedCustomFieldData = JSON.parse(JSON.stringify(customFieldArray));
    updatedCustomFieldData = removeArray(updatedCustomFieldData, index);
    setCustomFieldArray([...updatedCustomFieldData]);
    settingData.custom_field_data = updatedCustomFieldData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updatedCustomFieldData;
      }
    });
  };
  const handleCompareOperator = (value, index) => {
    let updateData = customFieldArray?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          compare_operator: value
        };
      }
      return item;
    });
    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const handleMetaType = (value, index) => {
    let updateData = customFieldArray?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          meta_type: value
        };
      }
      return item;
    });
    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  const deleteCustomFieldValue = (index, valueIndex) => {
    const layoutCopy = JSON.parse(JSON.stringify(customFieldArray));
    let updateData = layoutCopy?.map((item, id) => {
      if (id === index) {
        return {
          ...item,
          custom_field_value_list: item.custom_field_value_list.filter((_, i) => i !== valueIndex)
        };
      }
      return item;
    });
    setCustomFieldArray([...updateData]);
    settingData.custom_field_data = updateData;
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field_data = updateData;
      }
    });
  };
  //   const getTermDataLength = (keyName) => {
  //   const found = taxonomyList?.find(item => item.key === keyName);
  //   return found?.term_data?.length || 0;
  // };
  const getTermDataLength = keyName => {
    const found = taxonomyList?.find(item => item.key === keyName);
    if (!found?.term_data) return 0;
    return found.term_data.reduce((total, item) => {
      const childrenCount = item?.children_data?.length || 0;
      return total + 1 + childrenCount; // 1 for parent item
    }, 0);
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
    children: !isLoading ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-content-tab-row no-pad-0",
        children: [ false ? /*#__PURE__*/0 : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
          className: "caf-custom-field-data-container-range",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              className: "setting-label-main",
              children: "Custom Field"
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "caf-filter-custom-field-items-wrapper",
              children: customFieldArray?.map((item, index) => {
                return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                  className: "module-content-tab-row caf-design-two-half",
                  children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                    classNames: {
                      root: "caf-builder-tooltip"
                    },
                    placement: "topLeft",
                    title: "Select custom field key.",
                    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                      children: "Select Field"
                    })
                  }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
                    className: "caf-filter-query-custom-field-select caf-header-dropdown",
                    options: rangeFieldSelectOptions,
                    onChange: value => customFieldKeyFunc(value, "key", index),
                    style: {
                      width: "100%"
                    },
                    value: item?.custom_field_key || "0"
                  })]
                });
              })
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
          className: "setting-hr-main"
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row no-pad-0",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            className: "setting-label-main",
            children: "Range Settings"
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Choose slider type.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Type"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "hoverswitchguard",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(segmented["default"], {
                value: settingData?.range_slider?.type || "double",
                style: {
                  marginBottom: 10
                },
                onChange: handleRangeModeChange,
                className: "hoverTabCaf",
                options: rangeTypeOptions
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Choose slider placement.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Placement"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "hoverswitchguard",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(segmented["default"], {
                value: settingData?.range_slider?.placement || "horizontal",
                style: {
                  marginBottom: 10
                },
                onChange: handleRangePlacementChange,
                className: "hoverTabCaf",
                options: rangePlacementOptions
              })
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Set minimum value.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Min"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
              type: "number",
              value: rangeSettings.min,
              onChange: e => handleRangeSettingChange("min", e.target.value)
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Set maximum value.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Max"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
              type: "number",
              value: rangeSettings.max,
              onChange: e => handleRangeSettingChange("max", e.target.value)
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Set step interval.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Step"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
              type: "number",
              value: rangeSettings.step,
              onChange: e => handleRangeSettingChange("step", e.target.value)
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Enable default slider handles.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Default values"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-icon-switch",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
                checked: rangeCustomDefaultsEnabled,
                onChange: handleRangeDefaultValuesToggle
              })
            })]
          }), rangeCustomDefaultsEnabled ? (settingData?.range_slider?.type || "double") === "single" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Set default range values.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Values"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
              type: "number",
              value: rangeSettings.start_max,
              onChange: e => handleRangeSettingChange("start_max", e.target.value),
              onBlur: flushRangeSliderDefaultNormalize
            })]
          }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row  caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Set default min and max handles.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Default"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                gap: 4,
                width: "50%"
              },
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                style: {
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 8,
                  width: "100%"
                },
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "caf-design-two-half-inputs",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
                    type: "number",
                    value: rangeSettings.start_min,
                    onChange: e => handleRangeSettingChange("start_min", e.target.value),
                    onBlur: flushRangeSliderDefaultNormalize
                  })
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  style: {
                    opacity: 0.8,
                    flex: "0 0 auto"
                  },
                  children: "-"
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "caf-design-two-half-inputs",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
                    type: "number",
                    value: rangeSettings.start_max,
                    onChange: e => handleRangeSettingChange("start_max", e.target.value),
                    onBlur: flushRangeSliderDefaultNormalize
                  })
                })]
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                style: {
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 8,
                  width: "100%"
                },
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  style: {
                    width: 72,
                    fontSize: 11,
                    opacity: 0.75,
                    textAlign: "center"
                  },
                  children: "min"
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  style: {
                    flex: "0 0 auto",
                    width: 10
                  }
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  style: {
                    width: 72,
                    fontSize: 11,
                    opacity: 0.75,
                    textAlign: "center"
                  },
                  children: "max"
                })]
              })]
            })]
          }) : null, /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
            className: "setting-hr-main"
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row no-pad-0",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            className: "setting-label-main",
            children: "Text Settings"
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Enable or disable prefix text.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Prefix"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-icon-switch",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
                checked: rangeTextPrefix?.is_enable === "true",
                onChange: checked => handleRangeTextToggle("prefix", checked)
              })
            })]
          }), rangeTextPrefix?.is_enable === "true" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Set prefix text value.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Prefix Text"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
              value: rangeTextPrefix?.value || "",
              onChange: e => handleRangeTextValueChange("prefix", e.target.value),
              onBlur: e => handleRangeTextValueBlur("prefix", e.target.value),
              placeholder: "e.g. $"
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Enable or disable suffix text.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Suffix"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-icon-switch",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
                checked: rangeTextSuffix?.is_enable === "true",
                onChange: checked => handleRangeTextToggle("suffix", checked)
              })
            })]
          }), rangeTextSuffix?.is_enable === "true" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
              classNames: {
                root: "caf-builder-tooltip"
              },
              placement: "topLeft",
              title: "Set suffix text value.",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                children: "Suffix Text"
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
              value: rangeTextSuffix?.value || "",
              onChange: e => handleRangeTextValueChange("suffix", e.target.value),
              onBlur: e => handleRangeTextValueBlur("suffix", e.target.value),
              placeholder: "e.g. kg"
            })]
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
            className: "setting-hr-main"
          })]
        }),  false && /*#__PURE__*/0,  false && /*#__PURE__*/0, /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row no-pad-0",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            className: "setting-label-main",
            children: "Filter Label"
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
              label: "Enable",
              property: "label",
              property2: "is_label",
              onSettingChange: changeInitialData,
              data: settingData,
              currValue: settingData.label.is_label
            })
          }), checkLabel && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              className: "caf-filter-label-inner-row",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
                className: "module-content-tab-row caf-design-two-half",
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
                  classNames: {
                    root: "caf-builder-tooltip"
                  },
                  placement: "topLeft",
                  title: "Set filter label text.",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                    children: "Enter Label Name"
                  })
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
                  onChange: e => handleLabel(e.target.value),
                  value: labelInput
                })]
              }), iconsArray && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterLabelShowIconLockedSection, {
                className: "module-content-tab-row",
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterLabelShowIconProPanel["default"], {
                  data: props.data,
                  indexes: props.indexes,
                  iconsArray: iconsArray,
                  onSettingChange: props.onSettingChange,
                  enabled: (0,filterModuleTier.canUseLabelShowIcon)() && labelIconSwitch,
                  onToggle: onLabelIconSwitch,
                  label: "Icons"
                })
              })]
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(filterModuleTier.FilterLabelCollapseLockedSection, {
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                className: "module-content-tab-row caf-design-two-half",
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
                  label: "Enable Toggle",
                  property: "enable_toggle",
                  onSettingChange: changeInitialData,
                  data: settingData,
                  currValue: (0,filterModuleTier.canUseFilterLabelCollapse)() ? settingData.enable_toggle : "false"
                })
              }), (0,filterModuleTier.canUseFilterLabelCollapse)() && toggle.enable && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
                children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectMain["default"], {
                  label: "Toggle Icon Position",
                  property: "toggle_position",
                  classn: 'caf-design-two-half',
                  options: [{
                    label: "Left",
                    value: "left"
                  }, {
                    label: "Right",
                    value: "right"
                  }],
                  onSettingChange: changeInitialData,
                  data: settingData
                }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                  className: "module-content-tab-row caf-design-two-half",
                  children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
                    label: "Default Toggle Collapse",
                    property: "close_toggle",
                    onSettingChange: changeInitialData,
                    data: settingData,
                    currValue: settingData.close_toggle
                  })
                })]
              })]
            })]
          })]
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(FilterTermIconSettingsModal["default"], {
        title: termDetail[3],
        open: termSettingPopUp,
        onSave: handleTermSettingSave,
        onCancel: handleTermSettingCancel,
        saveDisabled: !termDetail[5],
        termSelected: termDetail[5],
        iconsArray: iconsArray,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: props.onSettingChange,
        termDetail: termDetail,
        contentIconDetail: contentIconDetail,
        setcontentIconDetail: setcontentIconDetail,
        iconSwitch: iconSwitch,
        setIconSwitch: setIconSwitch,
        selectedIcon: selectedIcon,
        setSelectedIcon: setSelectedIcon,
        checkError: checkError,
        showAddAsParentSwitch: termDetail[4] && (0,filterBuilderUiFlags.canShowAddAsParentSwitch)(),
        isParent: isParent,
        onToggleParent: handleIsParent,
        className: "caf-range-slider-filter-term-setting-modal caf-builder-modal",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Mark this term as selected by default.",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            children: "Add As Default Term"
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
          checkedChildren: "Remove",
          unCheckedChildren: "Add",
          onChange: handleTermSwitch,
          checked: termPredefined
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(FilterCfTermIconSettingsModal["default"], {
        open: termSettingPopUpCusField,
        onSave: handleSaveCustomField,
        onCancel: handleCancelCustomField,
        iconsArray: iconsArray,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: props.onSettingChange,
        contentIconDetail: contentIconDetailCusField,
        setcontentIconDetail: setcontentIconDetailCusField,
        iconSwitch: iconSwitchCusField,
        setIconSwitch: setIconSwitchCusField,
        selectedIcon: selectedIconCusField,
        setSelectedIcon: setSelectedIconCusField,
        className: "caf-range-slider-filter-cf-modal caf-builder-modal",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Enter option key value.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Key"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => setKeyValueCf(e.target.value),
            value: keyValueCf
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Enter option label text.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Label"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => setLabelValueCf(e.target.value),
            value: labelValueCf
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
            classNames: {
              root: "caf-builder-tooltip"
            },
            placement: "topLeft",
            title: "Select this option by default.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Add As Default Selected"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
            checkedChildren: "Remove",
            unCheckedChildren: "Add",
            onChange: handleTermSwitchCusField,
            checked: termPredefinedCusField
          })]
        }), (checkError || keyValueCf === "" || labelValueCf === "" || checkError && keyValueCf === "" && labelValueCf === "") && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
          classNames: {
            root: "caf-builder-tooltip"
          },
          placement: "topLeft",
          title: "Both fields are mandatory.",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            style: {
              color: "red"
            },
            children: "Both Key and Label fields are required."
          })
        })]
      })]
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(skeleton["default"], {
      active: true
    })
  });
});
/* harmony default export */ const FilterTypes_RangeSliderFilter = (RangeSliderFilter);
// EXTERNAL MODULE: ./src/tier/TierLockedSection.js
var TierLockedSection = __webpack_require__("./src/tier/TierLockedSection.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterModuleLockedPanel.js




function FilterModuleLockedPanel({
  title,
  upgradeMessage = filterModuleTier.FILTER_MODULE_PRO_MESSAGE,
  className = "caf-builder-tier-locked-filter-module-settings"
}) {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedSection.TierLockedSection, {
    locked: true,
    sectionTitle: title,
    className: className,
    upgradeMessage: upgradeMessage,
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
      className: "caf-builder-tier-locked-filter-module-settings__text",
      children: "Upgrade to Pro to configure this module."
    })
  });
}
/* harmony default export */ const shared_FilterModuleLockedPanel = (FilterModuleLockedPanel);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ModuleFilterGeneral.js







const ModuleFilterGeneral = props => {
  const {
    module
  } = props.indexes;
  const onSettingChange = data => {
    props.onSettingChange(data);
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [module.key == "checkbox_filter" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTypes_CheckboxFilter, {
      mainBuilderData: props.mainBuilderData,
      openBuilderSetting: props.openBuilderSetting,
      data: props.data,
      indexes: props.indexes,
      onSettingChange: onSettingChange,
      selectedDevice: props.selectedDevice
    }), module.key == "range_slider" && ((0,capabilities.canUseFilterModule)("range_slider") ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(FilterTypes_RangeSliderFilter, {
      mainBuilderData: props.mainBuilderData,
      openBuilderSetting: props.openBuilderSetting,
      data: props.data,
      indexes: props.indexes,
      onSettingChange: onSettingChange,
      selectedDevice: props.selectedDevice
    }) : /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(shared_FilterModuleLockedPanel, {
      title: "Range Slider",
      upgradeMessage: "Range Slider is available in Category Ajax Filter Pro."
    })), module.key == "dropdown_filter" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(DropdownFilter, {
      mainBuilderData: props.mainBuilderData,
      openBuilderSetting: props.openBuilderSetting,
      data: props.data,
      indexes: props.indexes,
      onSettingChange: onSettingChange,
      selectedDevice: props.selectedDevice
    })]
  });
};
/* harmony default export */ const ModuleContentData_ModuleFilterGeneral = (ModuleFilterGeneral);
;// ./src/MainComponents/shared/builderTooltipProps.js
/** Ant Design v6 Tooltip classNames (replaces deprecated overlayClassName). */
const BUILDER_TOOLTIP_CLASS_NAMES = {
  root: "caf-builder-tooltip"
};
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/SearchModeIcon.js


const iconClass = (className, mode) => ["caf-search-mode-tab-icon", `caf-search-mode-tab-icon--${mode}`, className].filter(Boolean).join(" ");
function KeywordSearchIcon({
  className
}) {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("svg", {
    className: iconClass(className, "keyword"),
    viewBox: "0 0 12 12",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("path", {
      d: "M4.83036 9.65566C5.90309 9.65569 6.94516 9.29777 7.79147 8.63859L10.9843 11.8315C11.2229 12.0618 11.6029 12.0552 11.8333 11.8167C12.058 11.584 12.058 11.2152 11.8333 10.9825L8.64042 7.78965C10.2761 5.68406 9.89522 2.65115 7.78963 1.01545C5.68404 -0.620258 2.65115 -0.239359 1.01545 1.86623C-0.620258 3.97183 -0.239359 7.00474 1.86623 8.64044C2.71393 9.29898 3.75693 9.65621 4.83036 9.65566ZM2.26492 2.26307C3.68179 0.846177 5.97899 0.846151 7.39588 2.26302C8.81278 3.67989 8.8128 5.97709 7.39594 7.39398C5.97907 8.81088 3.68187 8.81091 2.26497 7.39404L2.26492 7.39398C0.84805 5.98744 0.839702 3.69861 2.24625 2.28174L2.26492 2.26307Z",
      fill: "currentColor"
    })
  });
}
function SmartAiSearchIcon({
  className
}) {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("svg", {
    className: iconClass(className, "smart-ai"),
    viewBox: "0 0 14 13",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("path", {
      d: "M0.287378 7.00934C0.318817 6.94647 0.397414 6.91503 0.460292 6.89931C0.821838 6.89931 3.93428 6.77355 3.93428 3.15809C3.93428 3.04805 4.0286 2.95374 4.13863 2.95374C4.24867 2.95374 4.34299 3.04805 4.34299 3.15809C4.34299 6.77355 7.45543 6.89931 7.80126 6.89931C7.84841 6.89931 7.89557 6.91503 7.92701 6.94647C7.95845 6.96219 7.97417 6.99363 7.98989 7.00934C8.02133 7.07222 8.02133 7.15082 7.98989 7.2137C7.95845 7.27657 7.87985 7.32373 7.80126 7.32373H7.78554C7.42399 7.32373 4.32727 7.44949 4.32727 11.065C4.32727 11.175 4.23295 11.2693 4.12291 11.2693C4.01288 11.2693 3.91856 11.175 3.91856 11.065C3.91856 7.46521 0.821838 7.32373 0.460292 7.32373C0.381695 7.32373 0.318817 7.27657 0.271659 7.2137C0.24022 7.15082 0.24022 7.07222 0.287378 7.00934ZM4.13863 9.52445C4.5945 8.03111 5.71057 7.38661 6.59086 7.10366C5.71057 6.82071 4.5945 6.17622 4.13863 4.68287C3.68277 6.17622 2.56669 6.82071 1.68641 7.10366C2.56669 7.38661 3.68277 8.03111 4.13863 9.52445ZM6.73234 2.9223C6.6223 2.9223 6.52798 2.82798 6.52798 2.70223C6.52798 2.59219 6.6223 2.49788 6.73234 2.49788C6.92097 2.49788 8.61866 2.435 8.61866 0.454352C8.61866 0.344316 8.71298 0.25 8.82302 0.25C8.93305 0.25 9.02737 0.344316 9.02737 0.454352C9.02737 2.435 10.7251 2.49788 10.9137 2.49788H10.9294C11.0395 2.51359 11.118 2.59219 11.118 2.70223C11.118 2.81226 11.0237 2.90658 10.9137 2.90658C10.7093 2.90658 9.02737 2.96946 9.02737 4.9501C9.02737 5.06014 8.93305 5.15445 8.82302 5.15445C8.7287 5.17017 8.63438 5.07586 8.63438 4.96582C8.63438 2.98518 6.93669 2.9223 6.74805 2.9223H6.73234ZM8.83874 3.81831C9.09025 3.22097 9.54611 2.89086 9.97053 2.70223C9.51467 2.51359 9.09025 2.15205 8.83874 1.58615C8.58722 2.18349 8.13136 2.51359 7.70694 2.70223C8.1628 2.89086 8.58722 3.25241 8.83874 3.81831ZM8.54007 9.58733C8.7287 9.58733 10.4264 9.52445 10.4264 7.5438C10.4264 7.43377 10.5207 7.33945 10.6307 7.33945C10.7408 7.33945 10.8351 7.43377 10.8351 7.5438C10.8351 9.52445 12.5328 9.58733 12.7214 9.58733H12.7371C12.8472 9.60305 12.9258 9.68164 12.9258 9.79168C12.9258 9.90172 12.8315 9.99603 12.7214 9.99603C12.5171 9.99603 10.8351 10.0589 10.8351 12.0396C10.8351 12.1496 10.7408 12.2439 10.6307 12.2439C10.5364 12.2753 10.4421 12.181 10.4421 12.0553C10.4421 10.0746 8.74442 10.0118 8.55579 10.0118H8.54007C8.43003 10.0118 8.33571 9.91743 8.33571 9.79168C8.33571 9.68164 8.43003 9.58733 8.54007 9.58733ZM10.6465 10.9235C10.9137 10.3261 11.3538 9.99603 11.7783 9.8074C11.3224 9.61877 10.898 9.25722 10.6465 8.69132C10.395 9.28866 9.93909 9.61877 9.51467 9.8074C9.97053 9.99603 10.395 10.3576 10.6465 10.9235Z",
      fill: "url(#caf-smart-ai-search-fill)",
      stroke: "url(#caf-smart-ai-search-stroke)",
      strokeWidth: "0.5"
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("defs", {
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("linearGradient", {
        id: "caf-smart-ai-search-fill",
        x1: "13.4571",
        y1: "0.25",
        x2: "-0.348556",
        y2: "0.384006",
        gradientUnits: "userSpaceOnUse",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("stop", {
          stopColor: "#FF642D",
          stopOpacity: "0"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("stop", {
          offset: "1",
          stopColor: "#8675C7"
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("linearGradient", {
        id: "caf-smart-ai-search-stroke",
        x1: "13.1998",
        y1: "0.25",
        x2: "-1.03499",
        y2: "0.897201",
        gradientUnits: "userSpaceOnUse",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("stop", {
          stopColor: "#8675C7"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("stop", {
          offset: "1",
          stopColor: "#FF642D"
        })]
      })]
    })]
  });
}
function SearchModeIcon({
  mode,
  className
}) {
  if (mode === "smart_ai_search") {
    return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SmartAiSearchIcon, {
      className: className
    });
  }
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(KeywordSearchIcon, {
    className: className
  });
}
/* harmony default export */ const ModuleContentData_SearchModeIcon = (SearchModeIcon);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/searchProFeatures.js
/**
 * Free build: Elementor-style Pro CTAs only — no AI / voice / CF search implementations.
 * Wired via free-build-replacements.js when CAF_BUILD_FREE=1.
 */






const Tooltip = ({
  classNames,
  ...tooltipProps
}) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
  classNames: {
    ...BUILDER_TOOLTIP_CLASS_NAMES,
    ...classNames
  },
  ...tooltipProps
});
const includeSmartAiSearchMode = false;
function getSearchModeOptions() {
  return [{
    label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(Tooltip, {
      placement: "topLeft",
      title: "Classic keyword matching based on selected sources.",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("span", {
        className: "caf-search-mode-tab-label",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_SearchModeIcon, {
          mode: "keyword_search"
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
          children: "Keyword"
        })]
      })
    }),
    value: "keyword_search"
  }];
}
function SearchAiModeLockedOverlay() {
  return null;
}
function SearchAiUpsellRow() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "module-content-tab-row caf-free-pro-upsell-row",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedSection.TierLockedSection, {
      locked: true,
      sectionTitle: "AI Search",
      upgradeMessage: "Smart AI Search is available in the separate Category Ajax Filter Pro plugin.",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
        className: "caf-free-pro-upsell-copy",
        children: "Semantic, intent-based search is included with Category Ajax Filter Pro."
      })
    })
  });
}
function SearchCustomFieldControls() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "module-content-tab-row caf-free-pro-upsell-row",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedSection.TierLockedSection, {
      locked: true,
      sectionTitle: "Custom Field Search",
      upgradeMessage: "Custom field search is available in the separate Category Ajax Filter Pro plugin.",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
        className: "caf-free-pro-upsell-copy",
        children: "Search specific custom fields with Category Ajax Filter Pro."
      })
    })
  });
}
function SearchVoiceControls() {
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "module-content-tab-row caf-free-pro-upsell-row module-search-voice-row",
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedSection.TierLockedSection, {
      locked: true,
      sectionTitle: "Voice Search",
      upgradeMessage: "Voice Search is available in the separate Category Ajax Filter Pro plugin.",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("p", {
        className: "caf-free-pro-upsell-copy",
        children: "Hands-free voice search is included with Category Ajax Filter Pro."
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
      className: "setting-hr-main"
    })]
  });
}
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/SearchIconProPanel.js


/** Stub for Pro-only modules excluded from the free admin bundle. */
const NullModule = () => null;

/** Named fallback used by the custom-field term-reorder adapter. */
const hasMultipleSortableCustomFieldValues = () => false;
const customFieldDataToTaxonomyReorderShape = () => [];
const applyTaxonomyReorderToCustomFieldData = customFieldData => customFieldData;
/* harmony default export */ const SearchIconProPanel = (NullModule);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/SearchClearIconProPanel.js


/** Stub for Pro-only modules excluded from the free admin bundle. */
const SearchClearIconProPanel_NullModule = () => null;

/** Named fallback used by the custom-field term-reorder adapter. */
const SearchClearIconProPanel_hasMultipleSortableCustomFieldValues = () => false;
const SearchClearIconProPanel_customFieldDataToTaxonomyReorderShape = () => [];
const SearchClearIconProPanel_applyTaxonomyReorderToCustomFieldData = customFieldData => customFieldData;
/* harmony default export */ const SearchClearIconProPanel = (SearchClearIconProPanel_NullModule);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ModuleSearchGenerals.js

















const ModuleSearchGenerals_Tooltip = ({
  classNames,
  ...tooltipProps
}) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
  classNames: {
    ...BUILDER_TOOLTIP_CLASS_NAMES,
    ...classNames
  },
  ...tooltipProps
});
const ModuleSearchGenerals = props => {
  const {
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  const mainBuilderData = (0,useResolvedMainBuilderData.useResolvedMainBuilderData)(props.mainBuilderData);
  const singlePostData = (0,useResolvedMainBuilderData.getResolvedSinglePostData)(mainBuilderData);
  const canUseSmartAiSearch = (0,capabilities.canUseFeature)("smart_ai_search");
  const canUseSearchCustomField = (0,capabilities.canUseFeature)("search_custom_field");
  const canUseVoiceSearch = (0,capabilities.canUseFeature)("voice_search");
  let settingData = {
    ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings
  };
  let meta_fields = singlePostData?.meta_fields;

  //console.log(meta_fields);

  let meta_object = [{
    label: "Select Custom Field",
    value: "0"
  }];
  if (meta_fields) {
    Object.keys(meta_fields)?.map((item, i) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(external_ReactJSXRuntime_.Fragment, {
      children: meta_object.push({
        value: item,
        label: item
      })
    }));
  }
  const [customfield, setCustomfield] = (0,external_React_.useState)(settingData?.custom_field ?? "0");
  const [checkSearch, setCheckSearch] = (0,external_React_.useState)((0,filterModuleTier.canUseSearchShowIcon)() ? settingData?.search_icon?.is_enable !== "false" : false);
  const [checkVoice, setVoiceSearch] = (0,external_React_.useState)(settingData?.voice_icon?.is_enable === "false" ? false : true);
  const [checkClear, setClearSearch] = (0,external_React_.useState)((0,filterModuleTier.canUseSearchClearInput)() ? settingData?.clear_icon?.is_enable !== "false" : false);
  const [label, setLabel] = (0,external_React_.useState)(settingData.search_label);
  const [placeholder, setPlaceholder] = (0,external_React_.useState)(settingData.search_placeholder);
  const [headerlabel, setHeaderlabel] = (0,external_React_.useState)(settingData.label.is_label === "false" ? false : true);
  const [toggle, setToggle] = (0,external_React_.useState)({
    enable: (0,filterModuleTier.canUseFilterLabelCollapse)() && settingData.enable_toggle !== "false",
    close: (0,filterModuleTier.canUseFilterLabelCollapse)() && settingData.close_toggle !== "false"
  });
  const [haederlabelInput, setHaederlabelInput] = (0,external_React_.useState)(settingData.label.value);
  const [labelIconSwitch, setLabelIconSwitch] = (0,external_React_.useState)((0,filterModuleTier.canUseLabelShowIcon)() ? settingData?.label?.icons?.visibility : false);
  const [position, setPosition] = (0,external_React_.useState)(settingData?.search_icon?.position ?? "right");
  const [voiceposition, setVoicePosition] = (0,external_React_.useState)(settingData?.voice_icon?.position ?? "right");
  const [clearposition, setClearPosition] = (0,external_React_.useState)(settingData?.clear_icon?.position ?? "right");
  const [iconsArray, setIconsArray] = (0,external_React_.useState)("");
  const [clearVisible, setClearVisible] = (0,external_React_.useState)(settingData?.clear_icon?.visibility ?? "type");
  const [inputValue, setInputValue] = (0,external_React_.useState)(settingData?.voice_icon?.placeholder ?? "Listing Now...");
  const [source, setSource] = (0,external_React_.useState)(settingData?.source ?? {
    everything: true,
    title: false,
    descriptions: false,
    custom_field: false
  });
  const [charLimit, setCharLimit] = (0,external_React_.useState)(settingData?.char_limit?.is_enable === "true" ? true : false);
  const [limit, setLimit] = (0,external_React_.useState)(settingData?.char_limit?.limit ?? "3");
  const [searchTrigger, setSearchTrigger] = (0,external_React_.useState)(settingData?.search_trigger ?? "enter_icon");
  const [searchMode, setSearchMode] = (0,external_React_.useState)(() => {
    const smartEnabled = settingData?.smart_ai_search?.is_enable === "true";
    const keywordDisabled = settingData?.keyword_search?.is_enable === "false";
    if (includeSmartAiSearchMode && canUseSmartAiSearch && keywordDisabled && smartEnabled) {
      return "smart_ai_search";
    }
    return "keyword_search";
  });
  const searchModeOptions = getSearchModeOptions(canUseSmartAiSearch);
  const iconPositionOptions = [{
    label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
      placement: "topLeft",
      title: "Place the icon on the left side of the input.",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        children: "Left"
      })
    }),
    value: "left"
  }, {
    label: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
      placement: "topLeft",
      title: "Place the icon on the right side of the input.",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("span", {
        children: "Right"
      })
    }),
    value: "right"
  }];
  const IconPositionTabs = ({
    value,
    onChange
  }) => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
    className: "hoverswitchguard",
    children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(segmented["default"], {
      value: value,
      style: {
        marginBottom: 10
      },
      onChange: onChange,
      className: "hoverTabCaf",
      options: iconPositionOptions
    })
  });

  //const [sourceEverything,setSourceEverything] =useState(settingData?.source_everything === "true" ? true : false)

  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";
  (0,external_React_.useEffect)(() => {
    const fetchIcons = async () => {
      try {
        const response = await client["default"].get(icons_url);
        if (response.data) {
          setIconsArray(response.data);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };
    fetchIcons();
  }, []);
  // console.log(iconsArray)
  // useEffect(() => {
  //   if (settingData?.label?.icons?.icon == "") {
  //     settingData.label.icons.visibility = false;
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //       settingData;
  //     props.onSettingChange(props.data);
  //   }
  // }, [headerlabel]);

  const handleSearch = checked => {
    if (!(0,filterModuleTier.canUseSearchShowIcon)()) {
      return;
    }
    setCheckSearch(checked);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.search_icon = {
          ...(s.search_icon || {}),
          is_enable: checked ? "true" : "false"
        };
      }
    });
  };
  const handleVoice = checked => {
    if (!canUseVoiceSearch) {
      return;
    }
    setVoiceSearch(checked);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.voice_icon = {
          ...(s.voice_icon || {}),
          is_enable: checked ? "true" : "false"
        };
      }
    });
  };
  const handleClear = checked => {
    if (!(0,filterModuleTier.canUseSearchClearInput)()) {
      return;
    }
    setClearSearch(checked);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.clear_icon = {
          ...(s.clear_icon || {}),
          is_enable: checked ? "true" : "false"
        };
      }
    });
  };
  const handleLabel = val => {
    setLabel(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.search_label = val;
      }
    });
  };
  const handlePlaceholder = val => {
    setPlaceholder(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.search_placeholder = val;
      }
    });
  };
  const changeInitialData = data => {
    setHeaderlabel(data.label.is_label == "false" ? false : true);
    if (data.label.is_label == "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    if (!(0,filterModuleTier.canUseFilterLabelCollapse)()) {
      data.enable_toggle = "false";
      data.close_toggle = "false";
    }
    setToggle(prev => ({
      ...prev,
      enable: (0,filterModuleTier.canUseFilterLabelCollapse)() && data.enable_toggle !== "false"
    }));
    if (!(0,filterModuleTier.canUseFilterLabelCollapse)() || data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle(prev => ({
        ...prev,
        close: false
      }));
    }
    (0,filterSettingsSnapshot.commitFilterModuleReplaceSettings)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      nextSettings: data
    });
  };
  const handleHeaderLabel = val => {
    setHaederlabelInput(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = {
          ...(s.label || {}),
          value: val
        };
      }
    });
  };
  const handlePosition = val => {
    setPosition(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.search_icon = {
          ...(s.search_icon || {}),
          position: val
        };
      }
    });
  };
  const handleVoicePosition = val => {
    setVoicePosition(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.voice_icon = {
          ...(s.voice_icon || {}),
          position: val
        };
      }
    });
  };
  const handleClearPosition = val => {
    setClearPosition(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.clear_icon = {
          ...(s.clear_icon || {}),
          position: val
        };
      }
    });
  };
  const onLabelIconSwitch = checked => {
    if (!(0,filterModuleTier.canUseLabelShowIcon)()) {
      return;
    }
    setLabelIconSwitch(checked);
    let itm = {
      ...settingData?.label
    };
    let ic = {
      ...itm?.icons
    };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
      ic.position = "before-label";
    }
    ic.visibility = checked;
    itm.icons = {
      ...itm.icons,
      ...ic
    };
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.label = itm;
      }
    });
  };
  const onChangePlaceholder = val => {
    setInputValue(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.voice_icon = {
          ...(s.voice_icon || {}),
          placeholder: val
        };
      }
    });
  };
  const handleClearVisible = val => {
    setClearVisible(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.clear_icon = {
          ...(s.clear_icon || {}),
          visibility: val
        };
      }
    });
  };
  // const handleSearchSource1 = (val) => {
  //   setSource(val);
  //   settingData.source = val;
  //   items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //     settingData;
  //   props.onSettingChange(props.data);
  // };
  const handleCharLimit = checked => {
    setCharLimit(checked);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.char_limit = {
          ...(s.char_limit || {}),
          is_enable: checked ? "true" : "false"
        };
      }
    });
  };
  const onChangeLimit = val => {
    setLimit(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.char_limit = {
          ...(s.char_limit || {}),
          limit: val
        };
      }
    });
  };
  const handleSearchTrigger = val => {
    setSearchTrigger(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.search_trigger = val;
      }
    });
  };
  const handleSearchModeChange = mode => {
    if (mode === "smart_ai_search" && (!includeSmartAiSearchMode || !canUseSmartAiSearch)) {
      return;
    }
    setSearchMode(mode);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.smart_ai_search = {
          ...(s.smart_ai_search || {}),
          is_enable: mode === "smart_ai_search" ? "true" : "false"
        };
        s.keyword_search = {
          ...(s.keyword_search || {}),
          is_enable: mode === "keyword_search" ? "true" : "false"
        };
      }
    });
  };
  const handleSearchSource = (checked, key) => {
    if (key === "custom_field" && !canUseSearchCustomField) {
      return;
    }
    if (!checked) {
      const hasAnyOtherTrue = Object.keys(settingData?.source).some(k => k !== key && settingData?.source[k] === true);
      if (!hasAnyOtherTrue && key !== "everything" && settingData?.source?.everything === false) {
        return;
      }
    }
    const base = {
      ...(settingData?.source || {})
    };
    let nextSource = {
      ...base
    };
    if (key === "everything" && checked === true) {
      setSource(prev => ({
        ...prev,
        [key]: checked,
        title: false,
        descriptions: false,
        custom_field: false
      }));
      nextSource = {
        ...nextSource,
        [key]: checked,
        title: false,
        descriptions: false,
        custom_field: false
      };
    } else if (key === "everything" && checked === false) {
      setSource(prev => ({
        ...prev,
        [key]: checked,
        title: true
      }));
      nextSource = {
        ...nextSource,
        [key]: checked,
        title: true
      };
    } else {
      setSource(prev => ({
        ...prev,
        [key]: checked
      }));
      nextSource = {
        ...nextSource,
        [key]: checked
      };
    }
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.source = {
          ...(s.source || {}),
          ...nextSource
        };
      }
    });
  };
  const handleChangeCf = value => {
    if (!canUseSearchCustomField) {
      return;
    }
    setCustomfield(value);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.custom_field = value;
      }
    });
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-content-tab-row smart-ai-search-row",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
        className: "setting-label-main",
        children: "Search Type"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: `hoverswitchguard caf-search-type-segmented-wrap${includeSmartAiSearchMode && !canUseSmartAiSearch ? " caf-search-type-segmented-wrap--locked" : ""}`,
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(segmented["default"], {
          value: searchMode,
          style: {
            marginBottom: 10
          },
          onChange: handleSearchModeChange,
          className: "hoverTabCaf caf-search-type-segmented",
          options: searchModeOptions
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SearchAiModeLockedOverlay, {
          canUseSmartAiSearch: canUseSmartAiSearch
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SearchAiUpsellRow, {}), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
        className: "setting-hr-main"
      })]
    }), searchMode === "keyword_search" && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-content-tab-row",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
        className: "setting-label-main",
        children: "Search In"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-content-tab-row caf-design-two-half",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
          placement: "topLeft",
          title: "Search across all supported fields.",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            children: "Search All Fields"
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
          onChange: val => handleSearchSource(val, "everything"),
          checked: source?.everything
        })]
      }), !source?.everything && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row caf-design-two-half",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
            placement: "topLeft",
            title: "Include post titles in keyword matching.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Title"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
            onChange: val => handleSearchSource(val, "title"),
            checked: source?.title
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row caf-design-two-half",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
            placement: "topLeft",
            title: "Include post descriptions/excerpts in matching.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Content"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
            onChange: val => handleSearchSource(val, "descriptions"),
            checked: source?.descriptions
          })]
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SearchCustomFieldControls, {
          canUseSearchCustomField: canUseSearchCustomField,
          source: source,
          customfield: customfield,
          metaObject: meta_object,
          onToggleCustomField: handleSearchSource,
          onChangeCustomField: handleChangeCf
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
        className: "setting-hr-main"
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-search-text-row",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
        className: "setting-label-main",
        children: "Text Search"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedWrap.TierLockedWrap, {
        locked: !(0,filterModuleTier.canUseSearchShowIcon)(),
        className: "caf-builder-tier-locked-search-show-icon",
        upgradeMessage: "Search field icons are available in Category Ajax Filter Pro.",
        showProBadge: true,
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SearchIconProPanel, {
          data: props.data,
          indexes: props.indexes,
          onSettingChange: props.onSettingChange,
          enabled: checkSearch,
          icons: iconsArray,
          position: position,
          onToggle: handleSearch,
          onPositionChange: handlePosition,
          IconPositionTabs: IconPositionTabs
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-content-tab-row caf-design-two-half",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
          placement: "topLeft",
          title: "Choose when search requests are triggered.",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            children: "Search Trigger"
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_select["default"], {
          defaultValue: "0",
          style: {
            width: "100%"
          },
          onChange: handleSearchTrigger,
          options: [{
            value: "enter_icon",
            label: "On Enter / Icon Click"
          }, {
            value: "typing",
            label: "On Typing (Live Search)"
          }],
          value: searchTrigger
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-search-min-characters-row",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row caf-design-two-half",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
            placement: "topLeft",
            title: "Require a minimum number of characters before search.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Min Characters"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
            onChange: handleCharLimit,
            checked: charLimit
          })]
        }), charLimit && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row caf-design-two-half",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
            placement: "topLeft",
            title: "Set the minimum characters required to search.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Enter Minimum Characters Limit"
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            type: "number",
            value: limit,
            defaultValue: limit,
            onChange: e => onChangeLimit(e.target.value)
          })]
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "module-content-tab-row caf-design-two-half",
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
          placement: "topLeft",
          title: "Text shown before the user starts typing.",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
            children: "Placeholder"
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
          onChange: e => handlePlaceholder(e.target.value),
          value: placeholder,
          placeholder: "Search..."
        })]
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("hr", {
        className: "setting-hr-main"
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SearchVoiceControls, {
      canUseVoiceSearch: canUseVoiceSearch,
      checkVoice: checkVoice,
      iconsArray: iconsArray,
      voiceposition: voiceposition,
      inputValue: inputValue,
      indexes: props.indexes,
      data: props.data,
      onSettingChange: props.onSettingChange,
      onToggleVoice: handleVoice,
      onVoicePosition: handleVoicePosition,
      onVoicePlaceholder: onChangePlaceholder,
      IconPositionTabs: IconPositionTabs
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TierLockedWrap.TierLockedWrap, {
      locked: !(0,filterModuleTier.canUseSearchClearInput)(),
      className: "caf-builder-tier-locked-search-clear-input module-search-clear-row",
      upgradeMessage: "Clear input controls are available in Category Ajax Filter Pro.",
      showProBadge: true,
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SearchClearIconProPanel, {
        data: props.data,
        indexes: props.indexes,
        onSettingChange: props.onSettingChange,
        enabled: checkClear,
        icons: iconsArray,
        position: clearposition,
        visibility: clearVisible,
        onToggle: handleClear,
        onPositionChange: handleClearPosition,
        onVisibilityChange: handleClearVisible,
        IconPositionTabs: IconPositionTabs
      })
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-content-tab-row",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
        className: "setting-label-main",
        children: "Filter Label"
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "module-content-tab-row caf-design-two-half",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
          label: "Enable",
          labelTooltip: "Show or hide the filter label.",
          property: "label",
          property2: "is_label",
          onSettingChange: changeInitialData,
          data: settingData,
          currValue: settingData.label.is_label
        })
      }), headerlabel && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
        className: "caf-filter-label-inner-row",
        style: {
          paddingTop: "15px"
        },
        children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
          className: "module-content-tab-row caf-design-two-half",
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
            placement: "topLeft",
            title: haederlabelInput && String(haederlabelInput).trim() !== "" ? `Current label: ${haederlabelInput}` : "Set the filter label text.",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
              children: "Label Text "
            })
          }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
            onChange: e => handleHeaderLabel(e.target.value),
            value: haederlabelInput
          })]
        }), iconsArray && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.FilterLabelShowIconLockedSection, {
          className: "module-content-tab-row caf-builder-show-label-icon",
          children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
            className: "module-content-tab-row caf-builder-show-label-icon",
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
              class: "module-content-tab-row caf-design-two-half",
              children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleSearchGenerals_Tooltip, {
                placement: "topLeft",
                title: "Show an icon next to the filter label.",
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
                  children: "Show Icon"
                })
              }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
                className: "module-content-icon-switch",
                children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(es_switch["default"], {
                  onChange: onLabelIconSwitch,
                  checked: (0,filterModuleTier.canUseLabelShowIcon)() ? labelIconSwitch : false,
                  disabled: !(0,filterModuleTier.canUseLabelShowIcon)()
                })
              })]
            }), (0,filterModuleTier.canUseLabelShowIcon)() && labelIconSwitch && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ContentIcons1, {
              title: "Icons",
              data: props.data,
              indexes: props.indexes,
              iconsArray: iconsArray,
              onSettingChange: props.onSettingChange,
              tab: "label",
              type: ""
            })]
          })
        }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(filterModuleTier.FilterLabelCollapseLockedSection, {
          children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
            className: "module-content-tab-row caf-design-two-half",
            children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
              label: "Enable Collapse",
              labelTooltip: "Allow users to expand or collapse this filter.",
              property: "enable_toggle",
              onSettingChange: changeInitialData,
              data: settingData,
              currValue: (0,filterModuleTier.canUseFilterLabelCollapse)() ? settingData.enable_toggle : "false"
            })
          }), (0,filterModuleTier.canUseFilterLabelCollapse)() && toggle.enable && /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
            children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-tab-row",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SelectMain["default"], {
                label: "Toggle Icon Position",
                labelTooltip: "Choose where the toggle icon appears.",
                property: "toggle_position",
                classn: 'caf-design-two-half',
                options: [{
                  label: "Left",
                  value: "left"
                }, {
                  label: "Right",
                  value: "right"
                }],
                onSettingChange: changeInitialData,
                data: settingData
              })
            }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
              className: "module-content-tab-row caf-design-two-half",
              children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(SwitchMain["default"], {
                label: "Default Collapsed",
                labelTooltip: "Load this filter in collapsed state by default.",
                property: "close_toggle",
                onSettingChange: changeInitialData,
                data: settingData,
                currValue: settingData.close_toggle
              })
            })]
          })]
        })]
      })]
    })]
  });
};
/* harmony default export */ const ModuleContentData_ModuleSearchGenerals = (ModuleSearchGenerals);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ResetModuleIconProPanel.js


/** Stub for Pro-only modules excluded from the free admin bundle. */
const ResetModuleIconProPanel_NullModule = () => null;

/** Named fallback used by the custom-field term-reorder adapter. */
const ResetModuleIconProPanel_hasMultipleSortableCustomFieldValues = () => false;
const ResetModuleIconProPanel_customFieldDataToTaxonomyReorderShape = () => [];
const ResetModuleIconProPanel_applyTaxonomyReorderToCustomFieldData = customFieldData => customFieldData;
/* harmony default export */ const ResetModuleIconProPanel = (ResetModuleIconProPanel_NullModule);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ModuleResetGeneral.js






const ModuleResetGeneral = props => {
  const {
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  let settingData = {
    ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings
  };
  const [resetlabel, setResetlabel] = (0,external_React_.useState)(settingData?.reset_label ?? "");
  const handleChange = val => {
    setResetlabel(val);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: s => {
        s.reset_label = val;
      }
    });
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-content-tab-row caf-design-two-half",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Set reset button label.",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          children: "Text"
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(input["default"], {
        onChange: e => handleChange(e.target.value),
        value: resetlabel
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "caf-filter-label-inner-row",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.ResetModuleIconLockedSection, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ResetModuleIconProPanel, {
          ...props
        })
      })
    })]
  });
};
/* harmony default export */ const ModuleContentData_ModuleResetGeneral = (ModuleResetGeneral);
// EXTERNAL MODULE: ./node_modules/antd/es/input/TextArea.js + 5 modules
var TextArea = __webpack_require__("./node_modules/antd/es/input/TextArea.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/CustomTextModuleIconProPanel.js


/** Stub for Pro-only modules excluded from the free admin bundle. */
const CustomTextModuleIconProPanel_NullModule = () => null;

/** Named fallback used by the custom-field term-reorder adapter. */
const CustomTextModuleIconProPanel_hasMultipleSortableCustomFieldValues = () => false;
const CustomTextModuleIconProPanel_customFieldDataToTaxonomyReorderShape = () => [];
const CustomTextModuleIconProPanel_applyTaxonomyReorderToCustomFieldData = customFieldData => customFieldData;
/* harmony default export */ const CustomTextModuleIconProPanel = (CustomTextModuleIconProPanel_NullModule);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ModuleCustomTextFilterGeneral.js







const ModuleCustomTextFilterGeneral = props => {
  const {
    rowindex,
    columnindex,
    moduleindex
  } = props.indexes;
  const modSettings = props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;
  const [text, setText] = (0,external_React_.useState)(modSettings?.customText ?? "");
  (0,external_React_.useEffect)(() => {
    setText(modSettings?.customText ?? "");
  }, [props.data, rowindex, columnindex, moduleindex]);
  const onChangeText = e => {
    const value = e.target.value;
    setText(value);
    (0,filterSettingsSnapshot.commitFilterModuleSettingsPatch)({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: settings => {
        settings.customText = value;
      }
    });
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)(external_ReactJSXRuntime_.Fragment, {
    children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
      className: "setting-label-main",
      children: "Custom Text"
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
      className: "module-content-tab-row",
      children: [/*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(tooltip["default"], {
        classNames: {
          root: "caf-builder-tooltip"
        },
        placement: "topLeft",
        title: "Enter custom text or HTML content.",
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("label", {
          children: "Content"
        })
      }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(TextArea["default"], {
        placeholder: "Add your text here ....",
        onChange: onChangeText,
        value: text
      })]
    }), /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "caf-filter-label-inner-row",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(filterModuleTier.CustomTextModuleIconLockedSection, {
        children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(CustomTextModuleIconProPanel, {
          ...props
        })
      })
    })]
  });
};
/* harmony default export */ const ModuleContentData_ModuleCustomTextFilterGeneral = (ModuleCustomTextFilterGeneral);
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/WooFilterSettings.js



/**
 * Free build replacement: rating filter configuration is Pro-only.
 * Keep the same locked-panel treatment without shipping rating settings logic.
 */

const WooFilterSettings = () => /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(shared_FilterModuleLockedPanel, {
  title: "Star Rating Filter",
  upgradeMessage: "Star rating filter is available in Category Ajax Filter Pro."
});
/* harmony default export */ const ModuleContentData_WooFilterSettings = (WooFilterSettings);
// EXTERNAL MODULE: ./src/MainComponents/FilterComponents/components/woocommerce/wooFilterModuleTemplates.js
var wooFilterModuleTemplates = __webpack_require__("./src/MainComponents/FilterComponents/components/woocommerce/wooFilterModuleTemplates.js");
;// ./src/MainComponents/FilterComponents/components/settingTabContent/ContentTab.js









const ContentTab = props => {
  //console.log(props);
  const {
    type,
    rowindex,
    columnindex,
    moduleindex,
    module
  } = props.indexes;
  //console.log(type);
  const handleChange = value => {
    //console.log(`selected ${value}`);
  };
  const onSettingChange = data => {
    props.onChangeStyle(data);
  };
  return /*#__PURE__*/(0,external_ReactJSXRuntime_.jsxs)("div", {
    className: "setting-pop-content caf-filter",
    children: [type === "row" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "rowdata",
      children: /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
        className: "caf-builder-setting-row-label",
        children: "Row Data"
      })
    }) : "", type === "column" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "columndata",
      children: "Column Data"
    }) : "", type === "module" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)("div", {
      className: "moduledata",
      children: module.key === "checkbox_filter" || module.key === "range_slider" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_ModuleFilterGeneral, {
        mainBuilderData: props.mainBuilderData,
        openBuilderSetting: props.openBuilderSetting,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: onSettingChange,
        selectedDevice: props.selectedDevice
      }) : module.key === "dropdown_filter" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_ModuleFilterGeneral, {
        mainBuilderData: props.mainBuilderData,
        openBuilderSetting: props.openBuilderSetting,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: onSettingChange,
        selectedDevice: props.selectedDevice
      }) : module.key === "search" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_ModuleSearchGenerals, {
        mainBuilderData: props.mainBuilderData,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: onSettingChange,
        selectedDevice: props.selectedDevice
      }) : module.key === "reset" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_ModuleResetGeneral, {
        mainBuilderData: props.mainBuilderData,
        data: props.data,
        indexes: props.indexes,
        onSettingChange: onSettingChange,
        selectedDevice: props.selectedDevice
      }) : module.key === "customtext" ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_ModuleCustomTextFilterGeneral, {
        data: props.data,
        indexes: props.indexes,
        onSettingChange: onSettingChange,
        selectedDevice: props.selectedDevice
      }) : (0,wooFilterModuleTemplates.isWooFilterModuleKey)(module.key) ? /*#__PURE__*/(0,external_ReactJSXRuntime_.jsx)(ModuleContentData_WooFilterSettings, {
        data: props.data,
        indexes: props.indexes,
        onSettingChange: onSettingChange,
        selectedDevice: props.selectedDevice
      }) : ""
    }) : ""]
  });
};
/* harmony default export */ const settingTabContent_ContentTab = (ContentTab);

/***/ }

}]);
//# sourceMappingURL=src_MainComponents_FilterComponents_components_settingTabContent_ContentTab_js.js.map?ver=dba42ad8e8f807a8f2cd