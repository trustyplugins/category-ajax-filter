import React, { useEffect, useState } from "react";
import { Select, Input, Switch, Button, Popover } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  CAF_UPLOADED_ICON_MEDIA_TYPES,
  isCafUploadedIconUrl,
} from "../../../../../shared/cafUploadedIcon";
function ContentIcons(props) {
  //console.log(props.contentIconDetail);
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [iconsArray, setIconsArray] = useState(props?.iconsArray);
  //const { type, rowindex, columnindex, moduleindex, module } = props.indexes;

  const [searchString, setSearchString] = useState("");
  const [position, setPosition] = useState(props.contentIconDetail.position);
  let pos = "";
  if (props?.contentIconDetail?.position) {
    pos = props?.contentIconDetail?.position;
  } else {
    pos = `before-${props.labelType || module?.key}`;
  }
  // let icn = "";
  // if (props?.contentIconDetail?.icon) {
  //   icn = props?.contentIconDetail?.icon;
  // } else {
  //   icn = "";
  // }
  let type = "icon";
  if (props?.contentIconDetail?.type) {
    type = props?.contentIconDetail?.type;
  } else {
    type = "icon";
  }
  const [iconPosition, setIconPosition] = useState(pos);
  const [selectedIcon, setSelectedIcon] = useState(type === 'icon' ? props?.contentIconDetail?.icon : type === 'svg' ? props?.contentIconDetail?.icon?.url : '');

  const [iconType, setIconType] = useState(type);
  let icons = {
    visibility: true,
    icon: selectedIcon,
    position: iconPosition,
    type: iconType,
  };
  useEffect(() => {
    if (props?.contentIconDetail?.type === 'icon') {
      setSelectedIcon(props?.contentIconDetail?.icon ?? '')
    }
    else {
      setSelectedIcon(props?.contentIconDetail?.icon?.url ?? '')
    }
  }, [props?.contentIconDetail])
  useEffect(() => {
    setPosition(props.contentIconDetail.position)
  }, [props.contentIconDetail.position])

  const getSourceIcons = () =>
    Array.isArray(props?.iconsArray) ? props.iconsArray : [];

  const resetIconLibrarySearch = () => {
    setSearchString("");
    setIconsArray([...getSourceIcons()]);
  };

  useEffect(() => {
    if (props.termDetail?.[0] == null || props.termDetail?.[0] === "") {
      return;
    }
    resetIconLibrarySearch();
    setPopUpOpen(false);
  }, [props.termDetail?.[0]]);

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
     setIconType('icon')
    let data = props.contentIconDetail;
    data.icon = icon;
    data.type = 'icon';
    data.iconChecked = true;
    props.setcontentIconDetail(data);
    props.setSelectedIcon(icon);
    resetIconLibrarySearch();
    setPopUpOpen(false);

  };
  const handlePositionChange = (value) => {
    setPosition(value)
    let data = props.contentIconDetail;
    data.position = value;
    props.setcontentIconDetail(data);
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

  const handlePopUpChange = (newOpen) => {
    if (newOpen) {
      resetIconLibrarySearch();
    }
    setPopUpOpen(newOpen);
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
    setIconType('svg')
    let ic = { ...icons };
    ic.icon = selectedImage;
    ic.type = "svg";
    let data = props.contentIconDetail;
    data = ic;
    // data.type = 'svg';
    data.iconChecked = true;
    props.setcontentIconDetail(data);
    props.setSelectedIcon(selectedImage);
 
    // props.setcontentIconDetail(data);
    // props.setSelectedIcon(icon);
    // console.log(data)
    // setPopUpOpen(false);
  });

  
  //console.log(props.contentIconDetail);
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
      <div className="caf-icon-container caf-trm-modal" style={{ marginTop: '15px' }}>
        <div className="icon-container-wrapper">
          <div className="icon-wrapper-fa">
            {props?.contentIconDetail?.type === "icon" ? (
              <i
                data-icon-name={selectedIcon}
                value={selectedIcon}
                class={selectedIcon}
              ></i>
            ) : (
              <img src={selectedIcon?.url ?? selectedIcon} alt=""></img>
            )}
          </div>
        </div>
        <div className="icon-container-header">
           {((typeof props?.contentIconDetail?.icon === "string" && props?.contentIconDetail.icon !== "") ||
            (typeof props?.contentIconDetail?.icon === "object" &&
              props?.contentIconDetail.icon !== null &&
              Object.keys(props?.contentIconDetail?.icon).length > 0)) && (
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleIconSelect("")}
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
            classNames={{ root: "caf-filter-content-icons-popover" }}
            getPopupContainer={(triggerNode) =>
              triggerNode.closest(".caf-icon-container") || document.body
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

      {(props.iconSwitch && props?.hidePosition !== true) ? (
        <div class="module-content-tab-row">
          <label>Icon Position</label>
          <Select
            defaultValue={position}
            style={{
              width: "100%",
            }}
            onChange={handlePositionChange}
            value={position}
            options={[
              {
                value: "before",
                label: "Before",
              },
              {
                value: "after",
                label: "After",
              },
            ]}
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default ContentIcons;
