import React, { useEffect } from "react";
import {generatePostPreviewElementCSS} from "../../../utils/functions";
import { isHiddenOnDevice } from "../../../utils/builderVisibility";
import { loadFontFamiliesFromObject } from "../../../utils/loadGoogleFontsFromLayout";

const SelectedTag = ({ selectedFilterData, deviceType }) => {
  useEffect(() => {
    loadFontFamiliesFromObject(selectedFilterData);
  }, [selectedFilterData]);

  if (isHiddenOnDevice(selectedFilterData?.settings, deviceType)) {
    return null;
  }

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
