import React from "react";
import {generatePostPreviewElementCSS} from "../../../utils/functions";
import { isHiddenOnDevice } from "../../../utils/builderVisibility";

const SelectedTag = ({ selectedFilterData, deviceType }) => {
  if (isHiddenOnDevice(selectedFilterData?.settings, deviceType)) {
    return null;
  }

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
if (selectedFilterData?.style?.desktop?.default?.fontFamily) {
  loadFont(selectedFilterData.style.desktop.default.fontFamily);
}
if (selectedFilterData?.style?.desktop?.hover?.fontFamily) {
  loadFont(selectedFilterData.style.desktop.hover.fontFamily);
}
if (selectedFilterData?.style?.tablet?.default?.fontFamily) {
  loadFont(selectedFilterData.style.tablet.default.fontFamily);
}
if (selectedFilterData?.style?.tablet?.hover?.fontFamily) {
  loadFont(selectedFilterData.style.tablet.hover.fontFamily);
}
if (selectedFilterData?.style?.mobile?.default?.fontFamily) {
  loadFont(selectedFilterData.style.mobile.default.fontFamily);
}
if (selectedFilterData?.style?.mobile?.hover?.fontFamily) {
  loadFont(selectedFilterData.style.mobile.hover.fontFamily);
}
/* End Main Font Loading */

//console.log(selectedFilterData?.style)

/*============================================== End Font Family Linking =========================================================*/
  return (
    <ul className={`caf-builder-template-preview-selected-tags-container ${selectedFilterData?.settings?.custom_class ?? ""}`}>
      {/* <li className="caf-builder-template-preview-selected-tag-single-item">
          <span className="caf-builder-template-preview-selected-tag-term-name">Bags</span>
          {selectedFilterData?.settings?.close_button == "true" && (
            <span className="caf-builder-template-preview-selected-tag-close-btn">
              <i className="fa fa-times" aria-hidden="true"></i>
            </span>
          )}
        </li>
        <li className="caf-builder-template-preview-selected-tag-single-item">
          <span className="caf-builder-template-preview-selected-tag-term-name">Laptop</span>
          {selectedFilterData?.settings?.close_button == "true" && (
            <span className="caf-builder-template-preview-selected-tag-close-btn">
             <i className="fa fa-times" aria-hidden="true"></i>
            </span>
          )}
        </li>
        <li className="caf-builder-template-preview-selected-tag-single-item">
        <span className="caf-builder-template-preview-selected-tag-term-name">Mobile</span>
          {selectedFilterData?.settings?.close_button == "true" && (
            <span className="caf-builder-template-preview-selected-tag-close-btn">
              <i className="fa fa-times" aria-hidden="true"></i>
            </span>
          )}
        </li> */}
        <style>
          {`
            .caf-builder-template-preview-selected-tags-container{
                ${generatePostPreviewElementCSS(selectedFilterData?.style?.container, deviceType, "default")}
            }
            .caf-builder-template-preview-selected-tags-container:hover{
                ${generatePostPreviewElementCSS(selectedFilterData?.style?.container, deviceType, "hover")}
            }
            
            .caf-builder-template-preview-selected-tags-container .caf-builder-template-preview-selected-tag-single-item {
                ${generatePostPreviewElementCSS(selectedFilterData?.style?.meta, deviceType, "default")}
            }
            .caf-builder-template-preview-selected-tags-container .caf-builder-template-preview-selected-tag-single-item:hover{
                ${generatePostPreviewElementCSS(selectedFilterData?.style?.meta, deviceType, "hover")}
            }
            
            .caf-builder-template-preview-selected-tags-container .caf-builder-template-preview-selected-tag-single-item .caf-builder-template-preview-selected-tag-close-btn{
                ${generatePostPreviewElementCSS(selectedFilterData?.style?.meta1, deviceType, "default")}
            }
            .caf-builder-template-preview-selected-tags-container .caf-builder-template-preview-selected-tag-single-item .caf-builder-template-preview-selected-tag-close-btn:hover{
                ${generatePostPreviewElementCSS(selectedFilterData?.style?.meta1, deviceType, "hover")}
            }
            
            `}
        </style>
    </ul>
  );
};

export default SelectedTag;
