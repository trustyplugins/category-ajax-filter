import React, { useEffect } from "react";
import {generateLoaderContainerCSS,generatePostPreviewElementCSS} from "../../../utils/functions";
import { loadFontFamiliesFromObject } from "../../../utils/loadGoogleFontsFromLayout";

const Loader = ({ loaderData, deviceType, checkLoading, isDesignPreview = false }) => {
  useEffect(() => {
    loadFontFamiliesFromObject(loaderData);
  }, [loaderData]);

  return (
    <div
      className={`caf-builder-template-preview-loader-container ${
        checkLoading ? "active" : ""
      } ${isDesignPreview ? "is-design-preview" : ""} ${
        loaderData.custom_class ?? ""
      }`}
    >
      <div
        className="caf-builder-template-preview-loader-content"
        style={{ top: checkLoading !== true ? "50%" : "" }}
      >
        {loaderData.loader_type == "false" ? (
          <>
            <span className="caf-builder-template-preview-loader-text">
              {loaderData?.loader_text}
            </span>

            <style>
              {`
            .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content {
                ${generatePostPreviewElementCSS(
                  loaderData.icon_data.style,
                  deviceType,
                  "default"
                )}
            }
            .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content:hover{
                ${generatePostPreviewElementCSS(loaderData.icon_data.style, deviceType, "hover")}
            }
            `}
            </style>
          </>
        ) : (
          <>
            {loaderData.icon_data.source == "list" ? (
              <>
                <i className={`${loaderData.icon_data?.icon}`}></i>
                <style>
                  {`
                .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content {
                    ${generatePostPreviewElementCSS(
                      loaderData.icon_data.style,
                      deviceType,
                      "default"
                    )}
                }
                .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content:hover{
                    ${generatePostPreviewElementCSS(
                      loaderData.icon_data.style,
                      deviceType,
                      "hover"
                    )}
                }
                `}
                </style>
              </>
            ) : loaderData.icon_data.source == "upload" ? (
              <>
                <img
                  src={loaderData.icon_data?.upload.url}
                  className="upload-loader-img common-img"
                />
                <style>
                  {`
                    .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content .common-img {
                        ${generatePostPreviewElementCSS(
                          loaderData.icon_data.style,
                          deviceType,
                          "default"
                        )}
                    }
                    .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content .common-img:hover{
                        ${generatePostPreviewElementCSS(
                          loaderData.icon_data.style,
                          deviceType,
                          "hover"
                        )}
                    }
                `}
                </style>
              </>
            ) : (
              <>
                {loaderData.icon_data.source == "url" && (
                  <>
                    <img
                      src={loaderData.icon_data?.url}
                      className="url-loader-img common-img"
                    />
                    <style>
                      {`
                    .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content .common-img {
                        ${generatePostPreviewElementCSS(
                          loaderData.icon_data.style,
                          deviceType,
                          "default"
                        )}
                    }
                    .caf-builder-template-preview-loader-container .caf-builder-template-preview-loader-content .common-img:hover{
                        ${generatePostPreviewElementCSS(
                          loaderData.icon_data.style,
                          deviceType,
                          "hover"
                        )}
                    }
                    `}
                    </style>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      {loaderData?.overlay == "true" ? (
      <style>
        {`
            .caf-builder-template-preview-loader-container.active,
            .caf-builder-template-preview-loader-container.is-design-preview {
                ${generateLoaderContainerCSS(
                  loaderData.icon_data.style,
                  deviceType,
                  "default"
                )}
            }
            .caf-builder-template-preview-loader-container.active:hover,
            .caf-builder-template-preview-loader-container.is-design-preview:hover {
                ${generateLoaderContainerCSS(
                  loaderData.icon_data.style,
                  deviceType,
                  "hover"
                )}
            }
            `}
      </style>
      ) : (
      <style>
        {`
            .caf-builder-template-preview-loader-container.active,
            .caf-builder-template-preview-loader-container.is-design-preview {
                background-color: transparent;
            }
            `}
      </style>
      )}
    </div>
  );
};

export default Loader;
