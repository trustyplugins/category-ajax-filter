import React from "react";
import {generatePostPreviewElementCSS} from "../../../utils/functions";
import { isHiddenOnDevice } from "../../../utils/builderVisibility";

const ResultCount = ({ resultCountData, deviceType ,countRes }) => {
  if (isHiddenOnDevice(resultCountData?.settings, deviceType)) {
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
if (resultCountData?.style?.desktop?.default?.fontFamily) {
  loadFont(resultCountData.style.desktop.default.fontFamily);
}
if (resultCountData?.style?.desktop?.hover?.fontFamily) {
  loadFont(resultCountData.style.desktop.hover.fontFamily);
}
if (resultCountData?.style?.tablet?.default?.fontFamily) {
  loadFont(resultCountData.style.tablet.default.fontFamily);
}
if (resultCountData?.style?.tablet?.hover?.fontFamily) {
  loadFont(resultCountData.style.tablet.hover.fontFamily);
}
if (resultCountData?.style?.mobile?.default?.fontFamily) {
  loadFont(resultCountData.style.mobile.default.fontFamily);
}
if (resultCountData?.style?.mobile?.hover?.fontFamily) {
  loadFont(resultCountData.style.mobile.hover.fontFamily);
}
/* End Main Font Loading */

/*============================================== End Font Family Linking =========================================================*/
  return (
    <div className={`caf-builder-template-preview-result-count-container ${resultCountData?.settings?.custom_class ?? ""}`}>
      {/* <div
        className="caf-builder-template-preview-result-count-inner"
        style={{
          justifyContent:
            resultCountData?.position == "top-left" ? "flex-start" : "flex-end",
        }}
      > */}
        {/* <div className="caf-builder-template-preview-result-count-content"> */}
          {resultCountData?.settings?.prefix?.is_enable === "true" && (
            <div className="caf-builder-template-preview-result-count-prefix-text">
              {resultCountData?.settings?.prefix?.value}
            </div>
          )}
          {/* <span className='caf-builder-template-preview-start-count'>{countRes?.start}</span>
          <span className="caf-builder-template-preview-separator">-</span>
          <span className='caf-builder-template-preview-end-count'>{countRes?.end}</span>
          <span className="caf-builder-template-preview-separator-text">of</span> */}
          <span className="caf-builder-template-preview-total-results">{countRes?.total_results}</span>

          {resultCountData?.settings?.suffix?.is_enable === "true" && (
            <div className="caf-builder-template-preview-result-count-suffix-text">
              {resultCountData?.settings?.suffix?.value}
            </div>
          )}
          <style>
            {`
            .caf-builder-template-preview-result-count-container{
                ${generatePostPreviewElementCSS(resultCountData?.style?.container, deviceType, "default")}
            }
            .caf-builder-template-preview-result-count-container:hover{
                ${generatePostPreviewElementCSS(resultCountData?.style?.container, deviceType, "hover")}
            }
            .caf-builder-template-preview-result-count-container .caf-builder-template-preview-result-count-prefix-text{
                ${generatePostPreviewElementCSS(resultCountData?.style?.meta, deviceType, "default")}
            }
            .caf-builder-template-preview-result-count-container .caf-builder-template-preview-result-count-prefix-text:hover{
                ${generatePostPreviewElementCSS(resultCountData?.style?.meta, deviceType, "hover")}
            }   
            .caf-builder-template-preview-result-count-container .caf-builder-template-preview-result-count-suffix-text{
                ${generatePostPreviewElementCSS(resultCountData?.style?.meta1, deviceType, "default")}
            }
            .caf-builder-template-preview-result-count-container .caf-builder-template-preview-result-count-suffix-text:hover{
                ${generatePostPreviewElementCSS(resultCountData?.style?.meta1, deviceType, "hover")}
            }
            `}
          </style>
        {/* </div> */}
      {/* </div> */}
    </div>
  );
};

export default ResultCount;
