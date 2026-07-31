import React, { useEffect, useState } from "react";
import {generatePostPreviewElementCSS} from "../../../utils/functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { SettingFilled } from "@ant-design/icons";
import { isHiddenOnDevice } from "../../../utils/builderVisibility";
import { formatPreviewOrderByLabel } from "../previewSortUtils";

const Sorting = ({ sortingData, deviceType ,setOrderBy,setOrderType,extraDataSaved}) => {

  const defaultOrderBy = extraDataSaved?.orderby || "title";
  const defaultOrderType = extraDataSaved?.order || "ASC";
  const [activeOrderBy ,setActiveOrderBy]=useState(defaultOrderBy);
  const [activeOrderType ,setActiveOrderType]=useState(defaultOrderType);
  const [isOpenOrder, setIsOpenOrder] = useState(false);
  const [isOpenOrderBy, setIsOpenOrderBy] = useState(false);
  const formatOrderByLabel = formatPreviewOrderByLabel;
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const handleChangeOrderBy=(val)=>{
  setActiveOrderBy(val)
  setOrderBy(val);
} 
const handleChangeOrderType=(val)=>{
  setActiveOrderType(val)
  setOrderType(val)
} 

useEffect(() => {
  setActiveOrderBy((prev) => {
    if (prev === "0") {
      return prev;
    }
    setOrderBy(defaultOrderBy);
    return defaultOrderBy;
  });
  setActiveOrderType((prev) => {
    if (prev === "0") {
      return prev;
    }
    setOrderType(defaultOrderType);
    return defaultOrderType;
  });
}, [defaultOrderBy, defaultOrderType, setOrderBy, setOrderType]);

/*============================================== Start Font Family Linking =========================================================*/
const loadFont = (fontFamily) => {
  if (!document.getElementById(fontFamily) && fontFamily) {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css?family=${fontFamily}:regular&display=swap`;
    link.async = true;
    link.id = fontFamily;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.body.appendChild(link);
  }
};

/* Start Main Font Loading */
if (sortingData?.style?.desktop?.default?.fontFamily) {
  loadFont(sortingData.style.desktop.default.fontFamily);
}
if (sortingData?.style?.desktop?.hover?.fontFamily) {
  loadFont(sortingData.style.desktop.hover.fontFamily);
}
if (sortingData?.style?.tablet?.default?.fontFamily) {
  loadFont(sortingData.style.tablet.default.fontFamily);
}
if (sortingData?.style?.tablet?.hover?.fontFamily) {
  loadFont(sortingData.style.tablet.hover.fontFamily);
}
if (sortingData?.style?.mobile?.default?.fontFamily) {
  loadFont(sortingData.style.mobile.default.fontFamily);
}
if (sortingData?.style?.mobile?.hover?.fontFamily) {
  loadFont(sortingData.style.mobile.hover.fontFamily);
}
/* End Main Font Loading */

/* Start Label Font Loading */
if (sortingData?.label?.style?.desktop?.default?.fontFamily) { 
  loadFont(sortingData.label.style.desktop.default.fontFamily);
}
if (sortingData?.label?.style?.desktop?.hover?.fontFamily) {
  loadFont(sortingData.label.style.desktop.hover.fontFamily);
}
if (sortingData?.label?.style?.tablet?.default?.fontFamily) {
  loadFont(sortingData.label.style.tablet.default.fontFamily);
}
if (sortingData?.label?.style?.tablet?.hover?.fontFamily) {
  loadFont(sortingData.label.style.tablet.hover.fontFamily);
}
if (sortingData?.label?.style?.mobile?.default?.fontFamily) {
  loadFont(sortingData.label.style.mobile.default.fontFamily);
}
if (sortingData?.label?.style?.mobile?.hover?.fontFamily) {
  loadFont(sortingData.label.style.mobile.hover.fontFamily);
}
/* End Label Font Loading */

/*============================================== End Font Family Linking =========================================================*/

  if (isHiddenOnDevice(sortingData?.settings, deviceType)) {
    return null;
  }

  return (
    <div className={`caf-builder-template-preview-sorting-container ${sortingData?.settings?.custom_class ?? ""}`}>

    {sortingData?.settings?.order?.is_enable === "true" &&
  sortingData?.settings?.order?.values.length > 0 && (

  <div className="caf-builder-template-preview-sorting-content-dropdown-order-type caf-custom-dropdown-wrapper">

    {/* Selected */}
      <div
        className={`caf-selectbox 
        ${activeOrderType === "0" ? "caf-placeholder-selected" : "caf-item-selected"}
      `}
        onClick={(e) => {
        const parent = e.currentTarget.parentElement;
        parent.classList.toggle("open");
        setIsOpenOrder((prev) => !prev);
      }}
    >
      {sortingData?.settings?.order?.icon_position ==="left" && (
      <span className="caf-dropdown-arrow">
         {isOpenOrder ? <i class="fa-solid fa-caret-up"></i> : <i class="fa-solid fa-caret-down"></i>}
      </span>
      )}
      <span className="caf-sorting-placeholder">
        {activeOrderType === "0"
          ? sortingData?.settings?.order?.placeholder
          : capitalize(activeOrderType)}
      </span>
      {sortingData?.settings?.order?.icon_position ==="right" && (
      <span className="caf-dropdown-arrow">
         {isOpenOrder ? <i class="fa-solid fa-caret-up"></i> : <i class="fa-solid fa-caret-down"></i>}
      </span>
      )}
    </div>

    {/* Options */}
    <ul className="caf-dropdown-opt-list">
        <li
          className={`caf-dropdown-opt-list-item order-plc ${activeOrderType === "0" ? "active" : ""}`}
          onClick={(e) => {
            handleChangeOrderType("0");
            e.currentTarget
              .closest(".caf-custom-dropdown-wrapper")
              .classList.remove("open");

            setIsOpenOrder(false);
          }}
        >
          {sortingData?.settings?.order?.placeholder}
        </li>
      {sortingData?.settings?.order?.values?.map((item) => (
        <li
          key={item}
          className={`caf-dropdown-opt-list-item ${activeOrderType === item ? "active" : ""} `}
          onClick={(e) => {
            handleChangeOrderType(item);
            // 👇 dropdown close karo
            e.currentTarget
              .closest(".caf-custom-dropdown-wrapper")
              .classList.remove("open");
            setIsOpenOrder(false);
          }}
        >
          {formatOrderByLabel(item)}
        </li>
      ))}

    </ul>

  </div>
)}
    {sortingData?.settings?.order_by?.is_enable === "true"  && sortingData?.settings?.order_by?.values.length > 0 && (
    <div className="caf-builder-template-preview-sorting-content-dropdown-order-by caf-custom-dropdown-wrapper">

    {/* Selected */}
      <div
        className={`caf-selectbox 
        ${activeOrderBy === "0" ? "caf-placeholder-selected" : "caf-item-selected"}
      `}
        onClick={(e) => {
        const parent = e.currentTarget.parentElement;
        parent.classList.toggle("open");
        setIsOpenOrderBy((prev) => !prev);
      }}
    >
      {sortingData?.settings?.order_by?.icon_position ==="left" && (
      <span className="caf-dropdown-arrow">
        {isOpenOrderBy ? <i class="fa-solid fa-caret-up"></i> : <i class="fa-solid fa-caret-down"></i>}
      </span>
      )}
      <span className="caf-sorting-placeholder">
        {activeOrderBy === "0"
          ? sortingData?.settings?.order_by?.placeholder
          : formatOrderByLabel(activeOrderBy)}
      </span>

      {sortingData?.settings?.order_by?.icon_position ==="right" && (
        <span className="caf-dropdown-arrow">
          {isOpenOrderBy ? <i class="fa-solid fa-caret-up"></i> : <i class="fa-solid fa-caret-down"></i>}
        </span>
      )}
    </div>

    {/* Options */}
    <ul className="caf-dropdown-opt-list">
        <li
          className={`caf-dropdown-opt-list-item order-plc ${activeOrderBy === "0" ? "active" : ""}`}
          onClick={(e) => {
            handleChangeOrderBy("0");
            e.currentTarget
              .closest(".caf-custom-dropdown-wrapper")
              .classList.remove("open");

            setIsOpenOrderBy(false);
          }}
        >
          {sortingData?.settings?.order_by?.placeholder}
        </li>
      {sortingData?.settings?.order_by?.values?.map((item) => (
        <li
          key={item}
          className={`caf-dropdown-opt-list-item ${activeOrderBy === item ? "active" : ""} `}
          onClick={(e) => {
            handleChangeOrderBy(item);
            // 👇 dropdown close karo
            e.currentTarget
              .closest(".caf-custom-dropdown-wrapper")
              .classList.remove("open");
            setIsOpenOrderBy(false);
          }}
        >
          {formatOrderByLabel(item)}
        </li>
      ))}

    </ul>

  </div>
      )}
 
 <style>
  {`
        .caf-builder-template-preview-sorting-container {
            ${generatePostPreviewElementCSS(
              sortingData?.style?.container,
              deviceType,
              "default"
            )}
        }
        .caf-builder-template-preview-sorting-container:hover{
            ${generatePostPreviewElementCSS(
              sortingData?.style?.container,
              deviceType,
              "hover"
            )}
            }
      
        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type {
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta2,
          deviceType,
          "default"
        )}
        }
        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type:hover{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta2,
          deviceType,
          "hover"
        )}
        }
        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-dropdown-opt-list{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta4,
          deviceType,
          "default"
        )}
        }

      .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-selectbox{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta,
          deviceType,
          "default"
        )}
        }

        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-selectbox.caf-item-selected{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta,
          deviceType,
          "selected"
        )}
      }
      
      .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-dropdown-opt-list .caf-dropdown-opt-list-item{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta1,
          deviceType,
          "default"
        )}
        }
        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-dropdown-opt-list .caf-dropdown-opt-list-item:hover{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta1,
          deviceType,
          "hover"
        )}
        }
        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type .caf-dropdown-opt-list .caf-dropdown-opt-list-item.active{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta1,
          deviceType,
          "selected"
        )}
        }


        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by {
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta3,
          deviceType,
          "default"
        )}
        }

      .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by:hover {
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta3,
          deviceType,
          "hover"
        )}
        }

        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-dropdown-opt-list{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta4,
          deviceType,
          "default"
        )}
        }

        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-selectbox{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta5,
          deviceType,
          "default"
        )}
        }

        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-selectbox.caf-item-selected{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta5,
          deviceType,
          "selected"
        )}
      }

      .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-selectbox{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta,
          deviceType,
          "default"
        )}
        }

        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-selectbox.caf-item-selected{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta,
          deviceType,
          "selected"
        )}
      }

      
      .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-dropdown-opt-list .caf-dropdown-opt-list-item{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta1,
          deviceType,
          "default"
        )}
        }
        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-dropdown-opt-list .caf-dropdown-opt-list-item:hover{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta1,
          deviceType,
          "hover"
        )}
        }
        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by .caf-dropdown-opt-list .caf-dropdown-opt-list-item.active{
        ${generatePostPreviewElementCSS(
          sortingData?.style?.meta1,
          deviceType,
          "selected"
        )}
        }



  `}
 </style>
      {/* <style>
        {`
              .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by {
                  ${generatePostPreviewElementCSS(
                    // sortingData?.style?.container,
                    // deviceType,
                    // "default"
                  )}
              }
              .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by:hover{
                  ${generatePostPreviewElementCSS(
                    // sortingData?.style?.container,
                    // deviceType,
                    // "hover"
                  )}
                  }
                  .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type {
                  ${generatePostPreviewElementCSS(
                    // sortingData?.style?.container,
                    // deviceType,
                    // "default"
                  )}
              }
              .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type:hover{
                  ${generatePostPreviewElementCSS(
                  //   sortingData?.style?.container,
                  //   deviceType,
                  //   "hover"
                  )}
                  }
              `}
      </style> */}
      {/* <div
        className="caf-builder-template-preview-sorting-inner">
       
        {(sortingData.posts_order_by.length > 0 ||
          sortingData.posts_order_type.length > 0) && (
          <>
            {sortingData.display_type == "dropdown" ? (
              <div
                className="caf-builder-template-preview-sorting-content-dropdown"
                style={{
                  justifyContent:
                    sortingData?.position == "top-left"
                      ? "flex-start"
                      : "flex-end",
                }}
              >
                {sortingData.posts_order_by.length > 0 && (
                  <select className="caf-builder-template-preview-sorting-content-dropdown-order-by" 
                  onChange={(e)=>handleChangeOrderBy(e.target.value)}
                  value={activeOrderBy}
                  >
                    <option value="0">Order By</option>
                    {sortingData.posts_order_by?.map((item) => {
                      return <option class={`${activeOrderBy == item ? "active" :""}`} value={item}>{formatOrderByLabel(item)}</option>;
                    })}
                  </select>
                )}
                {sortingData.posts_order_type.length > 0 && (
                  <select className="caf-builder-template-preview-sorting-content-dropdown-order-type"
                  onChange={(e)=>handleChangeOrderType(e.target.value)}
                  value={activeOrderType}
                  >
                    <option value="0">Order Type</option>
                    {sortingData.posts_order_type?.map((item) => {
                      return <option class={`${activeOrderType == item ? "active" :""}`} value={item}>{capitalize(item)}</option>;
                    })}
                  </select>
                )}
                <style>
                  {`
                        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by {
                            ${generatePostPreviewElementCSS(
                              sortingData.style,
                              deviceType,
                              "default"
                            )}
                        }
                        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-by:hover{
                            ${generatePostPreviewElementCSS(
                              sortingData.style,
                              deviceType,
                              "hover"
                            )}
                            }
                            .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type {
                            ${generatePostPreviewElementCSS(
                              sortingData.style,
                              deviceType,
                              "default"
                            )}
                        }
                        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-content-dropdown-order-type:hover{
                            ${generatePostPreviewElementCSS(
                              sortingData.style,
                              deviceType,
                              "hover"
                            )}
                            }
                        `}
                </style>
              </div>
            ) : (
              <>
                {sortingData.label?.is_label == "true" && (
                  <div
                    className="caf-builder-template-preview-sorting-label"
                    style={{
                      justifyContent:
                        sortingData?.position == "top-left"
                          ? "flex-start"
                          : "flex-end",
                    }}
                  >
                    {sortingData.label?.label_text}
                    <style>
                      {`
                .caf-builder-template-preview-sorting-label {
                    ${generatePostPreviewElementCSS(
                      sortingData.label.style,
                      deviceType,
                      "default"
                    )}
                }
                .caf-builder-template-preview-sorting-label:hover{
                    ${generatePostPreviewElementCSS(
                      sortingData.label.style,
                      deviceType,
                      "hover"
                    )}
                    }
                `}
                    </style>
                  </div>
                )}
                <ul
                  className="caf-builder-template-preview-sorting-content-items-list"
                  style={{
                    justifyContent:
                      sortingData?.position == "top-left"
                        ? "flex-start"
                        : "flex-end",
                  }}
                >
                  {sortingData.posts_order_by.length > 0 &&
                    sortingData.posts_order_by?.map((item, index) => {
                      return (
                        <li
                          key={index}
                          className={`caf-builder-template-preview-sorting-item order-by ${activeOrderBy == item ? "active" :""}`}
                          onClick={()=>handleChangeOrderBy(item)}
                        >
                          <label className="caf-builder-template-preview-sorting-item-label">
                            {formatOrderByLabel(item)}
                          </label>
                          <input
                            type="radio"
                            name="order_by"
                            className="caf-builder-template-preview-sorting-item-button"
                            value={item}
                          />
                        </li>
                      );
                    })}
                  {sortingData.posts_order_type.length > 0 &&
                    sortingData.posts_order_type?.map((item, index) => {
                      return (
                        <li
                          key={index}
                          className={`caf-builder-template-preview-sorting-item order-type ${activeOrderType == item ? "active":""}`}
                          onClick={()=>handleChangeOrderType(item)}
                        >
                          <label className="caf-builder-template-preview-sorting-item-label">
                            {capitalize(item)}
                          </label>
                          <input
                            type="radio"
                            name="order_type"
                            className="caf-builder-template-preview-sorting-item-button"
                            value={item}
                          />
                        </li>
                      );
                    })}
                  <style>
                    {`
                        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-item {
                            ${generatePostPreviewElementCSS(
                              sortingData.style,
                              deviceType,
                              "default"
                            )}
                        }
                        .caf-builder-template-preview-sorting-container .caf-builder-template-preview-sorting-item:hover{
                            ${generatePostPreviewElementCSS(
                              sortingData.style,
                              deviceType,
                              "hover"
                            )}
                            }
                        `}
                  </style>
                </ul>
              </>
            )}
          </>
        )}
    </div> */}
    </div>
  );
};

export default Sorting;
