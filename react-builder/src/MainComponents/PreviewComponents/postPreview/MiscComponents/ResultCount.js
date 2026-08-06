import React, { useEffect } from "react";
import {generatePostPreviewElementCSS} from "../../../utils/functions";
import { isHiddenOnDevice } from "../../../utils/builderVisibility";
import { loadFontFamiliesFromObject } from "../../../utils/loadGoogleFontsFromLayout";

const ResultCount = ({ resultCountData, deviceType ,countRes }) => {
  useEffect(() => {
    loadFontFamiliesFromObject(resultCountData);
  }, [resultCountData]);

  if (isHiddenOnDevice(resultCountData?.settings, deviceType)) {
    return null;
  }

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
