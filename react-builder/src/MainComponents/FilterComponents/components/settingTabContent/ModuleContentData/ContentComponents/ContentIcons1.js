import React, { useState ,useEffect } from "react";
import { Select, Input, Switch, Button, Popover, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  CAF_UPLOADED_ICON_MEDIA_TYPES,
  isCafUploadedIconUrl,
} from "../../../../../shared/cafUploadedIcon";
import {
  commitFilterModuleSettingsPatch,
  commitFilterModuleReplaceSettings,
} from "../filterSettingsSnapshot";
import {
  FILTER_RESET_DEFAULT_ICON,
  isEmptyIconValue,
} from "../../../../filterModuleDefaults";
const FILTER_LABEL_DEFAULT_ICON = "fas fa-filter";
const normalizeLabelIconConfig = (labelSettings) => {
  const nextLabel = JSON.parse(JSON.stringify(labelSettings || {}));
  if (!nextLabel.icons || typeof nextLabel.icons !== "object") {
    nextLabel.icons = {};
  }
  if (nextLabel.icons.visibility === true) {
    if (isEmptyIconValue(nextLabel.icons.icon)) {
      nextLabel.icons.icon = FILTER_LABEL_DEFAULT_ICON;
      nextLabel.icons.type = "icon";
    }
  }
  return nextLabel;
};
const normalizeResetIconConfig = (settings) => {
  const nextSettings = JSON.parse(JSON.stringify(settings || {}));
  if (!nextSettings.icons || typeof nextSettings.icons !== "object") {
    nextSettings.icons = {};
  }
  if (nextSettings.icons.visibility === true) {
    if (isEmptyIconValue(nextSettings.icons.icon)) {
      nextSettings.icons.icon = FILTER_RESET_DEFAULT_ICON;
      nextSettings.icons.type = "icon";
    }
  }
  return nextSettings;
};
const shouldShowLabelDeleteButton = (labelIcons) => {
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
const shouldShowResetDeleteButton = (resetIcons) => {
  if (!resetIcons || typeof resetIcons !== "object") return false;
  const currentIcon = resetIcons.icon;
  if (typeof currentIcon === "string") {
    const trimmed = currentIcon.trim();
    return trimmed !== "" && trimmed !== FILTER_RESET_DEFAULT_ICON;
  }
  if (typeof currentIcon === "object" && currentIcon !== null) {
    return Object.keys(currentIcon).length > 0;
  }
  return false;
};
function ContentIcons(props) {
  //console.log(props);
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [iconsArray, setIconsArray] = useState(props?.iconsArray);
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const moduleTarget =
    props.data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  //console.log(iconsArray);
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.["settings"];
  let item = "";
  if(props?.tab === "all_option"){
    item = {
        ...modSettings?.["dropdown_data"]?.["all_option"],
      };

    //item = {...props?.allOptArray}
  }
  else if(props?.tab === "reset_icon" || props?.tab === "customtext_icon"){
    item = {
        ...modSettings,
      };
  }
  else if(props?.tab === "label"){
    item = {
        ...modSettings?.["label"],
      };
  }
  else if(props?.tab === "search_icon"){
    item = {
        ...modSettings?.["search_icon"],
      };
  }
  else if(props?.tab === "voice_icon"){
    item = {
        ...modSettings?.["voice_icon"],
      };
  }
  else if(props?.tab === "clear_icon"){
    item = {
        ...modSettings?.["clear_icon"],
      };
  }
  else{
    item = {
      ...modSettings?.["dropdown_data"],
    };
  }

  const commitLayoutFromItem = (refItem) => {
    if (!moduleTarget) return;
    const t = props?.tab;
    if (t === "reset_icon" || t === "customtext_icon") {
      commitFilterModuleReplaceSettings({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        onSettingChange: props.onSettingChange,
        nextSettings: JSON.parse(JSON.stringify(refItem)),
      });
      return;
    }
    const next = JSON.parse(JSON.stringify(refItem));
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
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
      },
    });
  };

  const searchModuleIconsKey =['search_icon','voice_icon','clear_icon'];

 // console.log(item)
  const [searchString, setSearchString] = useState("");
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
  const [iconPosition, setIconPosition] = useState(item?.icons?.position);
  const [dropdownIconPosition ,setDropdownIconPosition] = useState(item?.icons?.position ?? 'right')
  const [selectedIcon, setSelectedIcon] = useState(props?.tab === "inactive_icon" ? item?.icons?.inactive_icon : props?.tab === "active_icon" ? item?.icons?.active_icon : props?.tab === "all_option" ? item?.icons?.icon : props?.tab === "label" ? item?.icons?.icon : props?.tab === "search_icon" ? item?.icon : props?.tab === "voice_icon" ? item?.icon : props?.tab === "clear_icon" ? item?.icon : props?.tab === "reset_icon" ? item?.icons?.icon : props?.tab === "customtext_icon" ? item?.icons?.icon : "" );
  useEffect(() => {
    if (props?.tab !== "label") return;
    const labelState = modSettings?.label;
    if (!labelState?.icons || labelState.icons.visibility !== true) return;
    if (!isEmptyIconValue(labelState.icons.icon)) return;
    const normalizedLabel = normalizeLabelIconConfig(labelState);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.label = normalizedLabel;
      },
    });
    setSelectedIcon(FILTER_LABEL_DEFAULT_ICON);
  }, [props?.tab, props.data, rowindex, columnindex, moduleindex]);
  useEffect(() => {
    if (props?.tab !== "reset_icon") return;
    const resetIcons = modSettings?.icons;
    if (!resetIcons || resetIcons.visibility !== true) return;
    if (!isEmptyIconValue(resetIcons.icon)) return;
    const normalizedSettings = normalizeResetIconConfig(modSettings);
    commitFilterModuleReplaceSettings({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      nextSettings: normalizedSettings,
    });
    setSelectedIcon(FILTER_RESET_DEFAULT_ICON);
  }, [props?.tab, props.data, rowindex, columnindex, moduleindex]);
  
  useEffect(()=>{
    if(props?.tab === "all_option"){
    setSelectedIcon(item?.icons?.icon ?? "");
    }
  },[props?.allOptArray])

  useEffect(() => {
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
  
  
  let icons = 
  props?.tab === "inactive_icon" || props?.tab === "active_icon" ?
  {
    icon_switch: true,
    active_icon : item?.icons?.active_icon,
    inactive_icon : item?.icons?.inactive_icon,
    active_type: item?.icons?.active_type,
    inactive_type: item?.icons?.inactive_type,
    position:item?.icons?.position,
  }:
  props?.tab === "all_option" ?
  {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type,
  }:
  props?.tab === "label"?
  {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type,
    position : item?.icons?.position,
  }:
  props?.tab === "reset_icon" ?
  {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type,
  }:
  props?.tab === "customtext_icon" ?
  {
    visibility: true,
    icon: item?.icons?.icon,
    type: item?.icons?.type,
    position: item?.icons?.position,
  }:{
  };

  const getSourceIcons = () =>
    Array.isArray(props?.iconsArray) ? props.iconsArray : [];

  const resetIconLibrarySearch = () => {
    setSearchString("");
    setIconsArray([...getSourceIcons()]);
  };

  const handlePopUpChange = (newOpen) => {
    if (newOpen) {
      resetIconLibrarySearch();
    }
    setPopUpOpen(newOpen);
  };

  const handlePositionChange = (value) => {
    setIconPosition(value);
    let ic = { ...icons };
    ic.position = value;
    item.icons = { ...icons, ...ic };

    if (props?.tab === "label" || props?.tab === "customtext_icon") {
      commitLayoutFromItem(item);
    }
  };
    const handleDrpdownPositionChange = (value) => {
    setDropdownIconPosition(value);
    let ic = { ...icons };
    ic.position = value;
    item.icons = { ...icons, ...ic };
    commitLayoutFromItem(item);
  };
  const handleIconSearch = (e) => {
    const searchValue = e.target.value;
    setSearchString(searchValue);
    const sourceIcons = getSourceIcons();
    const newArray = sourceIcons.filter(function (item) {
      return item
        .toString()
        .toLowerCase()
        .includes(searchValue.toString().toLowerCase());
    });
    setIconsArray([...newArray]);
  };
  const handleIconSelect = (icon,remove="") => {
    const safeIcon =
      (props?.tab === "label" || props?.tab === "reset_icon") && icon === ""
        ? props?.tab === "label"
          ? FILTER_LABEL_DEFAULT_ICON
          : FILTER_RESET_DEFAULT_ICON
        : icon;
    setSelectedIcon(safeIcon);
    //setIconPosition(remove == '1' ? `before-${props.labelType || module?.key}` : item?.icons?.position);
    if(searchModuleIconsKey.includes(props?.tab)){
    item.icon = icon;
    item.type = "icon";
    }
    else{
    let ic = { ...icons };
    if(props?.tab === "inactive_icon" || props?.tab === "active_icon" ){
      ic[props?.tab] = icon;
      ic[props.type] = "icon";
    }
    else if (props?.tab === "all_option") {
      ic.icon = icon;
      ic.type = "icon";
    }
     else if (props?.tab === "label") {
      ic.icon = safeIcon;
      ic.type = "icon";
    }
    else if (props?.tab === "reset_icon") {
      ic.icon = safeIcon;
      ic.type = "icon";
    }
    else if (props?.tab === "customtext_icon") {
      ic.icon = icon;
      ic.type = "icon";
    }


    //ic.position = remove == '1' ? `before-${props.labelType || module?.key}` : item?.icons?.position;
    item.icons = { ...icons, ...ic };
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
  const [selected, setSelected] = useState(img);
  const canUseWpMedia =
    typeof window !== "undefined" && typeof window.wp?.media === "function";
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
      type: CAF_UPLOADED_ICON_MEDIA_TYPES,
      // Searches the attachment title.
      search: null,
      // Includes media only uploaded to the specified post (ID)
      uploadedTo: null, // wp.media.view.settings.post.id (for current post ID)
    },
    button: {
      text: "Done",
    },
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
    var selectedImage = customMediaLibrary1
      .state()
      .get("selection")
      .first()
      .toJSON();
     
  const isAllowedUpload = isCafUploadedIconUrl(selectedImage?.url);
  if (!isAllowedUpload) return;

  setSelectedIcon(selectedImage);

  if(searchModuleIconsKey.includes(props?.tab)){
    item.icon = selectedImage;
    item.type = "svg";
    }
    else{
    let ic = { ...icons };
    if(props?.tab === "inactive_icon" || props?.tab === "active_icon" ){
      ic[props?.tab] = selectedImage;
      ic[props.type] = "svg";
    }
    else if (props?.tab === "all_option") {
      ic.icon = selectedImage;
      ic.type = "svg";
    }
    else if (props?.tab === "label") {
      ic.icon = selectedImage;
      ic.type = "svg";
    }
    else if (props?.tab === "reset_icon") {
      ic.icon = selectedImage;
      ic.type = "svg";
    }
    else if (props?.tab === "customtext_icon") {
      ic.icon = selectedImage;
      ic.type = "svg";
    }
    item.icons = { ...icons, ...ic };
    }

    if (moduleTarget) {
      commitLayoutFromItem(item);
    }
    //}
  });
  }
  //console.log(item)
  const content = (
    <div className="icon-popover-content">
      <div class="module-content-tab-row">
        {/* <label>{props.title}</label> */}
        <div className="icons-search">
          <Input
            placeholder="Search icon"
            onChange={handleIconSearch}
            value={searchString}
          />
        </div>
        <div className="icons-map">
          {iconsArray && iconsArray?.map((icon, index) => {
            //console.log(icon,index);
            return (
              <>
                <i
                  data-icon-name={icon}
                  value={icon}
                  className={`${icon} ${selectedIcon === icon ? "active" : ""}`}
                  onClick={() => handleIconSelect(icon)}
                ></i>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
  //console.log(item);
  return (
    <>
      <div className={`caf-icon-container ${props?.tab ==="all_option" ? "all-opt" :""}`}>
        <div className="icon-container-wrapper">
        <div className="icon-wrapper-fa">
          <>
          {(
            (props?.tab === "inactive_icon" || props?.tab === "active_icon")
              ? item?.icons?.[props.type] === "icon"
              : props?.tab === "all_option"
                ? item?.icons?.type === "icon"
                : props?.tab === "label" ? item?.icons?.type === "icon" : props?.tab === "reset_icon" ? item?.icons?.type === "icon" : props?.tab === "customtext_icon" ? item?.icons?.type === "icon" : (props?.tab === "search_icon" && item?.icon !== "") ? item?.type === "icon" : (props?.tab === "voice_icon" && item?.icon !== "") ? item?.type === "icon" : (props?.tab === "clear_icon" && item?.icon !== "") ? item?.type === "icon" : false
          ) ? (
            <i
              data-icon-name={selectedIcon}
              value={selectedIcon}
              className={selectedIcon}
            />
          ) : (
            selectedIcon?.url && (
              <img src={selectedIcon.url} alt="" />
            )
          )}
          {props?.tab === "search_icon" && item?.type === "icon" && item?.icon === "" && 
            <i
            data-icon-name={"fas fa-search"}
            value={"fas fa-search"}
            className={"fas fa-search"}
            caf-icon={"default"}
          />
          }
          {props?.tab === "voice_icon" && item?.type === "icon" && item?.icon === "" && 
            <i
            data-icon-name={"fas fa-microphone"}
            value={"fas fa-microphone"}
            className={"fas fa-microphone"}
            caf-icon={"default"}
          />
          }
          {props?.tab === "clear_icon" && item?.type === "icon" && item?.icon === "" && 
          <i
            data-icon-name={"fas fa-times"}
            value={"fas fa-times"}
            className={"fas fa-times"}
            caf-icon={"default"}
          />
          }
        </>
        </div>
        </div>
            <div className="icon-container-header">
              {(
                props?.tab === "inactive_icon" ||
                props?.tab === "active_icon"
              ) && (
                ((typeof item?.icons?.[props?.tab] === "string" &&
                  item.icons?.[props?.tab] !== "") ||
                  (typeof item?.icons?.[props?.tab] === "object" &&
                    item.icons?.[props?.tab] !== null &&
                    Object.keys(item.icons?.[props?.tab]).length > 0)) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}

              {props?.tab === "all_option" && (
                ((typeof item?.icons?.icon === "string" &&
                  item.icons?.icon !== "") ||
                  (typeof item?.icons?.icon === "object" &&
                    item.icons?.icon !== null &&
                    Object.keys(item.icons?.icon).length > 0)) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}
              
              {props?.tab === "label" && (
                shouldShowLabelDeleteButton(item?.icons) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}
                            
              {props?.tab === "reset_icon" && (
                shouldShowResetDeleteButton(item?.icons) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}
              {props?.tab === "customtext_icon" && (
                ((typeof item?.icons?.icon === "string" &&
                  item.icons?.icon !== "") ||
                  (typeof item?.icons?.icon === "object" &&
                    item.icons?.icon !== null &&
                    Object.keys(item.icons?.icon).length > 0)) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}
              {props?.tab === "search_icon" && (
                ((typeof item?.icon === "string" &&
                  item?.icon !== "") ||
                  (typeof item?.icon === "object" &&
                    item?.icon !== null &&
                    Object.keys(item?.icon).length > 0)) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}
              {props?.tab === "voice_icon" && (
                ((typeof item?.icon === "string" &&
                  item?.icon !== "") ||
                  (typeof item?.icon === "object" &&
                    item?.icon !== null &&
                    Object.keys(item?.icon).length > 0)) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}
              {props?.tab === "clear_icon" && (
                ((typeof item?.icon === "string" &&
                  item?.icon !== "") ||
                  (typeof item?.icon === "object" &&
                    item?.icon !== null &&
                    Object.keys(item?.icon).length > 0)) && (
                  <Button
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => handleIconSelect("", "1")}
                  />
                )
              )}
            </div>

        <div className={`icon-container-footer ${props?.tab === "active_icon" ? 'drp-active-icon':""}`}>
          <Popover
            destroyOnHidden
            placement="bottom"
            content={content}
            title="Icons"
            trigger="click"
            open={popUpOpen}
            onOpenChange={handlePopUpChange}
            classNames={{ root: "caf-filter-dropdown-icons-popover" }}
            getPopupContainer={(triggerNode) =>
              triggerNode.closest(".caf-icon-container") || document.body
            }
            overlayStyle={{ insetInline: "auto !important" }}
          >
            <button className="ic-lib">Icon Library</button>
          </Popover>
          {props?.tab !== "active_icon" &&
          <button className="ic-lib" onClick={handleWpUploader1}>
            Upload Image
          </button>
          }
        </div>
      </div>

     {/* {props?.tab === "label" && 
     
      <div class="module-content-tab-row" style={{ marginTop: "20px" }} >
        <label>Icon Position</label>
        <Select
          defaultValue={item?.icons?.position}
          style={{
            width: "100%",
          }}
          onChange={handlePositionChange}
          value={iconPosition}
          options={[
            {
              value: `before-label`,
              label: "Before Label",
            },
            {
              value: `after-label`,
              label: "After Label",
            },
          ]}
        />
      </div>
    } */}

      {props?.tab === "customtext_icon" && (
        <div className="module-content-tab-row caf-design-two-half" style={{ marginTop: "20px" }}>
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Choose icon placement relative to custom text."
          >
            <label>Icon Position</label>
          </Tooltip>
          <Select
            style={{ width: "100%" }}
            onChange={handlePositionChange}
            value={iconPosition || "before-customtext"}
            options={[
              { value: "before-customtext", label: "Before Text" },
              { value: "after-customtext", label: "After Text" },
            ]}
          />
        </div>
      )}

      {props?.tab === "active_icon" && 
     
      <div class="module-content-tab-row caf-design-two-half" style={{ marginTop: "20px" }} >
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose icon placement.">
          <label>Icon Position</label>
        </Tooltip>
        <Select
          defaultValue={item?.icons?.position}
          style={{
            width: "100%",
          }}
          onChange={handleDrpdownPositionChange}
          value={dropdownIconPosition}
          options={[
            {
              value: `left`,
              label: "Left",
            },
            {
              value: `right`,
              label: "Right",
            },
          ]}
        />
      </div>
    }
    </>
  );
}

export default ContentIcons;
