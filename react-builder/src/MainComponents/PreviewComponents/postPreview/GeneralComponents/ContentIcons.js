import React, { useState } from "react";
import { Select, Input, Switch, Button, Popover } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  CAF_UPLOADED_ICON_MEDIA_TYPES,
  isCafUploadedIconUrl,
} from "../../../shared/cafUploadedIcon";
function ContentIcons(props) {
  //console.log(props);
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [iconsArray, setIconsArray] = useState(props?.iconsArray);

  let items = {...props.data};
  let item = "";
 
  if (props?.moduleIcon == "prev") {
    item = {
      ...items["prev"],
    };
  }
  if (props?.moduleIcon == "next") {
    item = {
      ...items["next"],
    };
  }
   if (props?.moduleIcon == "load_more") {
    item = {
      ...items["load_more"],
    };
  }   

  const [searchString, setSearchString] = useState("");
  // let pos = "";
  // if (item?.icons?.position) {
  //   pos = item.icons.position;
  // } else {
  //   pos = `before-${props?.labelType || ""}`;
  // }
  let icn = "";
  if (item?.icons?.icon) {
    icn = item.icons.icon;
  } else {
    icn = "";
  }
  let typ =""
    if (item?.icons?.type) {
    typ = item.icons.type;
  } else { 
    typ = "";
  }
  // const [iconPosition, setIconPosition] = useState(pos);
  const [selectedIcon, setSelectedIcon] = useState(icn);
  let icons = {
    visibility: true,
    icon: selectedIcon,
    // position: iconPosition,
    type: typ,
  };

  const handlePopUpChange = (newOpen) => {
    setPopUpOpen(newOpen);
  };

  // const handlePositionChange = (value) => {
  //   //console.log(value);
  //   setIconPosition(value);
  //   let ic = { ...icons };
  //   ic.position = value;
  //   item.icons = { ...icons, ...ic };
  //   if (props?.moduleIcon === "custom-field-label") {
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"]["label"] =
  //       item;
  //   } else {
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] = item;
  //   }
  //   props.onSettingChange(props.data);
  // };

  const handleIconSearch = (e) => {
    const searchValue = e.target.value;
    setSearchString(searchValue);
    let newArray = props?.iconsArray.filter(function (item) {
      return item
        .toString()
        .toLowerCase()
        .includes(searchValue.toString().toLowerCase());
    });
    setIconsArray([...newArray]);
  };
  const handleIconSelect = (icon,remove="") => {
    setSelectedIcon(icon);
    // setIconPosition(remove == '1' ? `before-${props.labelType || module?.key}` : item?.icons?.position);
    let ic = { ...icons };
    ic.icon = icon;
    ic.type = "icon";
    // ic.position = remove == '1' ? `before-${props.labelType || module?.key}` : item?.icons?.position;
    ic.visibility = remove == '1' ? false : true ;
    item.icons = { ...icons, ...ic };
    if (props?.moduleIcon === "prev") {
      items["prev"] = item;
    }
    if (props?.moduleIcon === "next") {
      items["next"] = item;
    }
    if (props?.moduleIcon == "load_more") {
      items["load_more"] = item
    }   
    props.onSettingChange(items);
    setPopUpOpen(false);
  };
  let img = "";
  const [selected, setSelected] = useState(img);
  var customMediaLibrary1 = window.wp.media({
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
  const handleWpUploader1 = () => {
    customMediaLibrary1.open();
    // Wait for uploader to initialize
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
    item.icons = { ...icons, ...ic };
  
    if (props?.moduleIcon === "prev") {
        items["prev"] = item;
    }
    if (props?.moduleIcon === "next") {
        items["next"] = item;
    }
    if (props?.moduleIcon == "load_more") {
      items["load_more"] = item
    }  
    props.onSettingChange(items);
  });
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
          {iconsArray?.map((icon, index) => {
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
          {((typeof item?.icons?.icon === "string" && item.icons.icon !== "") ||
            (typeof item?.icons?.icon === "object" &&
              item.icons.icon !== null &&
              Object.keys(item.icons.icon).length > 0)) && (
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => handleIconSelect("",'1')}
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
            classNames={{ root: "caf-preview-content-icons-popover" }}
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
