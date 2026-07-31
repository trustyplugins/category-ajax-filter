import React, { useState, useEffect } from "react";
import parse from "html-react-parser";
import { generateCSS } from "../../../utils/functions";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
import {
  isPostPrefixEnabled,
  isPostSuffixEnabled,
} from "../settingTabContent/ModuleContentData/shared/postModuleTier";
function ModuleAuthor({
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
  const dynWrapper = styleDefault?.[selectedDevice]?.default?.justifyContent ?? 'flex-start';
  const [svgPrefixContent, setSvgPrefixContent] = useState(null);
  const [svgSuffixContent, setSvgSuffixContent] = useState(null);
  useEffect(() => {
    const iconUrl = settings?.prefix?.icons?.icon?.url;
    if (!iconUrl || !isCafSvgIconUrl(iconUrl)) {
      setSvgPrefixContent(null);
      return;
    }
    // console.log('work')
    fetch(iconUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (svg) {
          // Apply dynamic color or fallback
          const iconColor = settings?.prefix?.icons?.color || "currentColor";
          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });
          setSvgPrefixContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [settings?.prefix?.icons?.icon?.url, settings?.prefix?.icons?.color]);

  useEffect(() => {
    const iconUrl = settings?.suffix?.icons?.icon?.url;
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
            settings?.suffix?.icons?.icon?.color || "currentColor";

          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });

          setSvgSuffixContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [settings?.suffix?.icons?.icon?.url]);

  let author = "Author";
  if (postData?.author) {
    author = postData.author;
  }
  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  //console.log(settings?.icons);
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
        {isPostPrefixEnabled(settings) && (
          <div className={`caf-builder-prefix-col${settings?.prefix?.meta_type === "avatar" ? "-avatar":""}`}>
            {settings?.prefix?.meta_type === "avatar" && (
              <img
                className="caf-author-avatar"
                src={postData?.author_avatar ?? ""}
                alt=""
              />
            )}
            {settings?.prefix?.meta_type === "text" && (
              <>{settings?.prefix?.meta_text}</>
            )}
            {settings?.prefix?.meta_type === "icon" && (
              <>
                {settings?.prefix?.icons?.visibility && (
                  <>
                    {settings?.prefix?.icons?.icon &&
                    settings?.prefix?.icons?.type === "icon" ? (
                      <i
                        data-icon-name={settings.prefix.icons.icon}
                        value={settings.prefix.icons.icon}
                        className={settings.prefix.icons.icon}
                        // style={{ marginRight: "5px" }}
                      ></i>
                    ) : (
                      <>
                        {(isCafSvgIconUrl(settings?.prefix?.icons?.icon?.url) &&
                    svgPrefixContent ? (
                          <span
                            className="svg-dynamic"
                            dangerouslySetInnerHTML={{
                              __html: svgPrefixContent,
                            }}
                          />
                        ) : isCafUploadedIconUrl(settings?.prefix?.icons?.icon?.url) ? (
                          <img
                            className="svg-dynamic"
                            src={settings?.prefix?.icons?.icon?.url}
                            alt=""
                          />
                        ) : null)}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {isPostSuffixEnabled(settings) ? (
          <>
            {isPostPrefixEnabled(settings) ? (
              <div className={`caf-builder-author-wrapper caf-layout-${dynWrapper}`}>
                <div className="caf-builder-author-name">
                  {postData?.author ? postData.author : "Author"}
                </div>
                <div className={`caf-builder-suffix-col${settings?.suffix?.meta_type === "avatar" ? "-avatar":""}`}>
                  {settings?.suffix?.meta_type === "avatar" && (
                    <img
                      className="caf-author-avatar"
                      src={postData?.author_avatar ?? ""}
                      alt=""
                    />
                  )}
                  {settings?.suffix?.meta_type === "text" && (
                    <>{settings?.suffix?.meta_text}</>
                  )}
                  {settings?.suffix?.meta_type === "icon" && (
                    <>
                      {settings?.suffix?.icons?.visibility && (
                        <>
                          {settings?.suffix?.icons?.icon &&
                          settings?.suffix?.icons?.type === "icon" ? (
                            <i
                              data-icon-name={settings.suffix.icons.icon}
                              value={settings.suffix.icons.icon}
                              className={settings.suffix.icons.icon}
                              // style={{ marginRight: "5px" }}
                            ></i>
                          ) : (
                            <>
                              {(isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                                <span
                                  className="svg-dynamic"
                                  // style={{ marginRight: "5px" }}
                                  dangerouslySetInnerHTML={{
                                    __html: svgSuffixContent,
                                  }}
                                />
                              ) : isCafUploadedIconUrl(settings?.suffix?.icons?.icon?.url) ? (
                          <img
                            className="svg-dynamic"
                            src={settings?.suffix?.icons?.icon?.url}
                            alt=""
                          />
                        ) : null)}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="caf-builder-author-name">
                  {postData?.author ? postData.author : "Author"}
                </div>
                <div className={`caf-builder-suffix-col${settings?.suffix?.meta_type === "avatar" ? "-avatar":""}`}>
                  {settings?.suffix?.meta_type === "avatar" && (
                    <img
                      className="caf-author-avatar"
                      src={postData?.author_avatar ?? ""}
                      alt=""
                    />
                  )}
                  {settings?.suffix?.meta_type === "text" && (
                    <>{settings?.suffix?.meta_text}</>
                  )}
                  {settings?.suffix?.meta_type === "icon" && (
                    <>
                      {settings?.suffix?.icons?.visibility && (
                        <>
                          {settings?.suffix?.icons?.icon &&
                          settings?.suffix?.icons?.type === "icon" ? (
                            <i
                              data-icon-name={settings.suffix.icons.icon}
                              value={settings.icons.icon}
                              className={settings.icons.icon}
                              // style={{ marginRight: "5px" }}
                            ></i>
                          ) : (
                            <>
                              {(isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                                <span
                                  className="svg-dynamic"
                                  // style={{ marginRight: "5px" }}
                                  dangerouslySetInnerHTML={{
                                    __html: svgSuffixContent,
                                  }}
                                />
                              ) : isCafUploadedIconUrl(settings?.suffix?.icons?.icon?.url) ? (
                          <img
                            className="svg-dynamic"
                            src={settings?.suffix?.icons?.icon?.url}
                            alt=""
                          />
                        ) : null)}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {isPostPrefixEnabled(settings) ? (
              <div className="caf-builder-author-name">
                {postData?.author ? postData.author : "Author"}
              </div>
            ) : (
              <>{postData?.author ? postData.author : "Author"}</>
            )}
          </>
        )}

        <style>
          {`
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
                      ${generateCSS(
                        styleDefault,
                        "default",
                        selectedDevice,
                        settings,
                        postData
                      )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
                      ${generateCSS(
                        styleDefault,
                        "hover",
                        selectedDevice,
                        settings,
                        postData
                      )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-author-wrapper{
                      ${generateCSS(
                        styleDefault?.meta,
                        "default",
                        selectedDevice,
                        settings,
                        postData
                      )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-author-wrapper:hover{
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
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col-avatar img{
                      ${generateCSS(
                        styleDefault?.prefix,
                        "default",
                        selectedDevice,
                        settings,
                        postData
                      )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col-avatar img:hover{
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
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col-avatar img{
                      ${generateCSS(
                        styleDefault?.suffix,
                        "default",
                        selectedDevice,
                        settings,
                        postData
                      )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col-avatar img:hover{
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

export default ModuleAuthor;
