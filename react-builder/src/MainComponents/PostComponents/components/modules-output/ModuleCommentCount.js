import React, { useState, useEffect, useMemo } from "react";
import { generateCSS } from "../../../utils/functions";
import parse from "html-react-parser";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
import {
  getCommentCountModuleSettingsForOutput,
  isCommentCountSuffixVisible,
  isPostPrefixEnabled,
} from "../settingTabContent/ModuleContentData/shared/postModuleTier";
function ModuleCommentCount({
  postData,
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  indexes,
  setIndexes = () => {},
}) {
  const [svgContent, setSvgContent] = useState(null);
  const [svgPrefixContent, setSvgPrefixContent] = useState(null);
  const [svgSuffixContent, setSvgSuffixContent] = useState(null);

  const dynWrapper =
    styleDefault?.[selectedDevice]?.default?.justifyContent ?? "flex-start";

  const outputSettings = useMemo(
    () => getCommentCountModuleSettingsForOutput(settings),
    [settings]
  );
  const showSuffix = isCommentCountSuffixVisible(settings);
  const showPrefix = isPostPrefixEnabled(outputSettings);

  useEffect(() => {
    const iconUrl = outputSettings?.prefix?.icons?.icon?.url;
    if (!iconUrl || !isCafSvgIconUrl(iconUrl)) {
      setSvgPrefixContent(null);
      return;
    }

    fetch(iconUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (svg) {
          // Apply dynamic color or fallback
          const iconColor =
            outputSettings?.prefix?.icons?.icon?.color || "currentColor";
          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });
          setSvgPrefixContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [outputSettings?.prefix?.icons?.icon?.url]);

  useEffect(() => {
    const iconUrl = outputSettings?.suffix?.icons?.icon?.url;
    if (!iconUrl || !isCafSvgIconUrl(iconUrl)) {
      setSvgSuffixContent(null);
      return;
    }

    fetch(iconUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");

        if (svg) {
          // Apply dynamic color or fallback
          const iconColor =
            outputSettings?.suffix?.icons?.icon?.color || "currentColor";

          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });

          setSvgSuffixContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [outputSettings?.suffix?.icons?.icon?.url]);

  let commentcount = "0";
  if (postData?.commentcount) {
    commentcount = postData.commentcount;
  }
  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
    const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  return (
    <>
      <div
        onClick={() =>
          setIndexes({
            type: "module",
            rowindex: rowindex,
            columnindex: columnindex,
            moduleindex: moduleindex,
            module: module,
          })
        }
        className={`caf-builder-module-main caf-module-${
          module.key
        } caf-module-${moduleindex} ${custom_class} ${
          indexes?.type === "module" &&
          indexes?.rowindex === rowindex &&
          indexes?.columnindex === columnindex &&
          indexes?.moduleindex === moduleindex
            ? "active"
            : ""
        } ${hideClass}`}
      >
        {showPrefix && (
          <>
            <div className="caf-builder-prefix-col">
              {outputSettings?.prefix?.meta_type === "text" &&
                parse(`${outputSettings?.prefix?.meta_text}`)}
              {outputSettings?.prefix?.meta_type === "icon" &&
                outputSettings?.prefix?.icons?.visibility &&
                outputSettings?.prefix?.icons?.type === "icon" &&
                outputSettings?.prefix?.icons?.icon !== "" && (
                  <i
                    data-icon-name={outputSettings?.prefix?.icons?.icon}
                    className={outputSettings?.prefix?.icons?.icon}
                  ></i>
                )}
              {outputSettings?.prefix?.meta_type === "icon" &&
              outputSettings?.prefix?.icons?.visibility &&
              outputSettings?.prefix?.icons?.type === "svg" &&
              outputSettings?.prefix?.icons?.icon?.url !== "" &&
              (isCafSvgIconUrl(outputSettings?.prefix?.icons?.icon?.url) &&
                    svgPrefixContent ? (
                      <span
                  className="svg-dynamic"
                  dangerouslySetInnerHTML={{ __html: svgPrefixContent }}
                />
                    ) : isCafUploadedIconUrl(outputSettings?.prefix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={outputSettings?.prefix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
            </div>
          </>
        )}

        {showSuffix ? (
          <>
            {showPrefix ? (
              <div
                className={`caf-builder-comment-suffix-wrapper caf-layout-${dynWrapper}`}
              >
                <div className="caf-builder-comment-value">{commentcount}</div>
                <div className="caf-builder-suffix-col">
                  {outputSettings?.suffix?.meta_type === "text" &&
                    outputSettings?.suffix?.meta_text &&
                    parse(`${outputSettings?.suffix?.meta_text}`)}

                  {outputSettings?.suffix?.meta_type === "icon" &&
                    outputSettings?.suffix?.icons?.visibility &&
                    outputSettings?.suffix?.icons?.type === "icon" &&
                    outputSettings?.suffix?.icons?.icon !== "" && (
                      <i
                        data-icon-name={outputSettings?.suffix?.icons?.icon}
                        className={outputSettings?.suffix?.icons?.icon}
                      ></i>
                    )}
                  {outputSettings?.suffix?.meta_type === "icon" &&
                  outputSettings?.suffix?.icons?.visibility &&
                  outputSettings?.suffix?.icons?.type === "svg" &&
                  outputSettings?.suffix?.icons?.icon?.url !== "" &&
                  (isCafSvgIconUrl(outputSettings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                      className="svg-dynamic"
                      dangerouslySetInnerHTML={{ __html: svgSuffixContent }}
                    />
                    ) : isCafUploadedIconUrl(outputSettings?.suffix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={outputSettings?.suffix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
                </div>
              </div>
            ) : (
              <>
                <div className="caf-builder-comment-value">{commentcount}</div>
                <div className="caf-builder-suffix-col">
                  {outputSettings?.suffix?.meta_type === "text" &&
                    outputSettings?.suffix?.meta_text &&
                    parse(`${outputSettings?.suffix?.meta_text}`)}

                  {outputSettings?.suffix?.meta_type === "icon" &&
                    outputSettings?.suffix?.icons?.visibility &&
                    outputSettings?.suffix?.icons?.type === "icon" &&
                    outputSettings?.suffix?.icons?.icon !== "" && (
                      <i
                        data-icon-name={outputSettings?.suffix?.icons?.icon}
                        className={outputSettings?.suffix?.icons?.icon}
                      ></i>
                    )}
                  {outputSettings?.suffix?.meta_type === "icon" &&
                  outputSettings?.suffix?.icons?.visibility &&
                  outputSettings?.suffix?.icons?.type === "svg" &&
                  outputSettings?.suffix?.icons?.icon?.url !== "" &&
                  (isCafSvgIconUrl(outputSettings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                      className="svg-dynamic"
                      dangerouslySetInnerHTML={{ __html: svgSuffixContent }}
                    />
                    ) : isCafUploadedIconUrl(outputSettings?.suffix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={outputSettings?.suffix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {showPrefix ? (
              <div className="caf-builder-comment-value">{commentcount}</div>
            ) : (
              <>
              {commentcount}
              </>
            )}
          </>
        )}

        <style>
          {`
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
                ${generateCSS(styleDefault, "default", selectedDevice, settings, postData)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
              ${generateCSS(styleDefault, "hover", selectedDevice, settings, postData)}
            }
              
            .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-comment-suffix-wrapper{
              ${generateCSS(
                styleDefault?.meta,
                "default",
                selectedDevice,
                settings,
                postData
              )}
            }
            .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-comment-suffix-wrapper:hover{
              ${generateCSS(
                styleDefault?.meta,
                "hover",
                selectedDevice,
                settings,
                postData
              )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col{
              ${generateCSS(
                styleDefault?.prefix,
                "default",
                selectedDevice,
                settings,
                postData
              )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col:hover{
              ${generateCSS(
                styleDefault?.prefix,
                "hover",
                selectedDevice,
                settings,
                postData
              )}
            }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col{
            ${generateCSS(
              styleDefault?.suffix,
              "default",
              selectedDevice,
              settings,
              postData
            )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col:hover{
            ${generateCSS(
              styleDefault?.suffix,
              "hover",
              selectedDevice,
              settings,
              postData
            )}
          }
      `}
        </style>
      </div>
    </>
  );
}

export default ModuleCommentCount;
