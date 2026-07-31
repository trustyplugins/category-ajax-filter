import React, { useState } from "react";
import { Input, Button, Popover } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  CAF_UPLOADED_ICON_MEDIA_TYPES,
  isCafUploadedIconUrl,
} from "../../../../../shared/cafUploadedIcon";
const DEFAULT_ICON_BY_MODULE_ICON = {
  prefix: "fas fa-tag",
  suffix: "fas fa-tag",
  button_icon: "fas fa-shopping-cart",
  "custom-field-label": "fas fa-filter",
};
const getDefaultIconForScope = (moduleIcon) =>
  DEFAULT_ICON_BY_MODULE_ICON[moduleIcon] || "fas fa-tag";
const isEmptyIconValue = (iconValue) => {
  if (iconValue === undefined || iconValue === null) return true;
  if (typeof iconValue === "string") return iconValue.trim() === "";
  if (typeof iconValue === "object") return Object.keys(iconValue).length === 0;
  return false;
};
const shouldShowDeleteButton = (iconValue, moduleIcon) => {
  if (typeof iconValue === "string") {
    const trimmed = iconValue.trim();
    return trimmed !== "" && trimmed !== getDefaultIconForScope(moduleIcon);
  }
  if (typeof iconValue === "object" && iconValue !== null) {
    return Object.keys(iconValue).length > 0;
  }
  return false;
};

function ContentIcons(props) {
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [iconsArray, setIconsArray] = useState(props?.iconsArray);
  const { rowindex, columnindex, moduleindex, module } = props.indexes;
  let item = "";

  if (props?.moduleIcon == "custom-field-label") {
    item = {
      ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]["settings"][
        "label"
      ],
    };
  } else if (
    props?.moduleIcon === "prefix" ||
    props?.moduleIcon === "suffix" ||
    props?.moduleIcon === "button_icon"
  ) {
    item = {
      ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]["settings"][
        props?.moduleIcon
      ],
    };
  } else {
    item = {
      ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]["settings"],
    };
  }

  const persistItem = (nextItem) => {
    const snapshot = JSON.parse(JSON.stringify(nextItem));
    const base = {
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
    };
    if (props?.moduleIcon === "custom-field-label") {
      commitPostModuleSettingsPatch({
        ...base,
        patch: (s) => {
          s.label = snapshot;
        },
      });
    } else if (
      props?.moduleIcon === "prefix" ||
      props?.moduleIcon === "suffix" ||
      props?.moduleIcon === "button_icon"
    ) {
      commitPostModuleSettingsPatch({
        ...base,
        patch: (s) => {
          s[props.moduleIcon] = snapshot;
        },
      });
    } else {
      commitPostModuleSettingsPatch({
        ...base,
        patch: (s) => {
          Object.keys(s).forEach((k) => delete s[k]);
          Object.assign(s, snapshot);
        },
      });
    }
  };

  const [searchString, setSearchString] = useState("");
  let pos = "";
  if (item?.icons?.position) {
    pos = item.icons.position;
  } else {
    pos = `before-${props.labelType || module?.key}`;
  }
  let icn = "";
  if (item?.icons?.icon) {
    icn = item.icons.icon;
  } else {
    icn = "";
  }
  let typ = "";
  if (item?.icons?.type) {
    typ = item.icons.type;
  } else {
    typ = "";
  }
  const [iconPosition, setIconPosition] = useState(pos);
  const [selectedIcon, setSelectedIcon] = useState(icn);
  let icons = {
    visibility: true,
    icon: selectedIcon,
    position: iconPosition,
    type: typ,
  };
  React.useEffect(() => {
    const currentIcon = item?.icons?.icon;
    if (!isEmptyIconValue(currentIcon)) return;
    const defaultIcon = getDefaultIconForScope(props?.moduleIcon);
    const ic = {
      ...icons,
      icon: defaultIcon,
      type: "icon",
      visibility: true,
      position: item?.icons?.position || `before-${props.labelType || module?.key}`,
    };
    const nextItem = { ...item, icons: { ...icons, ...ic } };
    persistItem(nextItem);
    setSelectedIcon(defaultIcon);
  }, [props.data, props?.moduleIcon, rowindex, columnindex, moduleindex]);

  const handlePopUpChange = (newOpen) => {
    setPopUpOpen(newOpen);
  };

  const handleIconSearch = (e) => {
    const searchValue = e.target.value;
    setSearchString(searchValue);
    let newArray = props?.iconsArray.filter(function (filterItem) {
      return filterItem
        .toString()
        .toLowerCase()
        .includes(searchValue.toString().toLowerCase());
    });
    setIconsArray([...newArray]);
  };
  const handleIconSelect = (icon, remove = "") => {
    const defaultIcon = getDefaultIconForScope(props?.moduleIcon);
    const safeIcon = icon === "" ? defaultIcon : icon;
    setSelectedIcon(safeIcon);
    setIconPosition(
      remove == "1"
        ? `before-${props.labelType || module?.key}`
        : item?.icons?.position
    );
    let ic = { ...icons };
    ic.icon = safeIcon;
    ic.type = "icon";
    ic.position =
      remove == "1"
        ? `before-${props.labelType || module?.key}`
        : item?.icons?.position;
    ic.visibility = true;
    const nextItem = { ...item, icons: { ...icons, ...ic } };
    persistItem(nextItem);
    setPopUpOpen(false);
  };
  let img = "";
  const [selected, setSelected] = useState(img);
  var customMediaLibrary1 = window.wp.media({
    frame: "select",
    title: "Select Images",
    multiple: false,
    library: {
      order: "DESC",
      orderby: "date",
      type: CAF_UPLOADED_ICON_MEDIA_TYPES,
      search: null,
      uploadedTo: null,
    },
    button: {
      text: "Done",
    },
  });
  const handleWpUploader1 = () => {
    customMediaLibrary1.open();
  };
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
    if (!isCafUploadedIconUrl(selectedImage?.url)) {
      return;
    }
    setSelectedIcon(selectedImage);
    let ic = { ...icons };
    ic.icon = selectedImage;
    ic.type = "svg";
    const nextItem = { ...item, icons: { ...icons, ...ic } };
    persistItem(nextItem);
  });
  const content = (
    <div className="icon-popover-content">
      <div class="module-content-tab-row">
        <div className="icons-search">
          <Input
            placeholder="Search icon"
            onChange={handleIconSearch}
            value={searchString}
          />
        </div>
        <div className="icons-map">
          {iconsArray?.map((icon, index) => {
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
  return (
    <>
      <div className="caf-icon-container">
        <div className="icon-container-wrapper">
          <div className="icon-wrapper-fa">
            {item?.icons?.type === "icon" ? (
              <i
                data-icon-name={selectedIcon}
                value={selectedIcon}
                class={selectedIcon}
              ></i>
            ) : (
              <img src={selectedIcon?.url} alt=""></img>
            )}
          </div>
        </div>
        <div className="icon-container-header">
          {shouldShowDeleteButton(item?.icons?.icon, props?.moduleIcon) && (
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => handleIconSelect("", "1")}
            />
          )}
        </div>
        <div className="icon-container-footer">
          <Popover
            placement="bottom"
            content={content}
            title="Icons"
            trigger="click"
            open={popUpOpen}
            onOpenChange={handlePopUpChange}
            classNames={{ root: "caf-post-content-icons-popover" }}
            getPopupContainer={() =>
              document.querySelector(".caf-icon-container") || document.body
            }
            overlayStyle={{ insetInline: "auto !important" }}
          >
            <button className="ic-lib">Icon Library</button>
          </Popover>
          <button className="ic-lib" onClick={handleWpUploader1}>
            Upload Image
          </button>
        </div>
      </div>
    </>
  );
}

export default ContentIcons;
