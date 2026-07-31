import React, { useEffect, useState, useMemo } from "react";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import { generateCSS, generateLinkParentCSS } from "../../../utils/functions";
import parse from "html-react-parser";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
import {
  isPostPrefixEnabled,
  isPostSuffixEnabled,
  resolvePostLinkType,
} from "../settingTabContent/ModuleContentData/shared/postModuleTier";
function ModuleButton({
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
  extraRootClassName = "",
  onLinkClick = null,
}) {
  const linkType = useMemo(
    () => resolvePostLinkType(settings?.link?.type),
    [settings?.link?.type]
  );
  const [CfURLValue, setCfURLValue] = useState("#");
  const [svgPrefixContent, setSvgPrefixContent] = useState(null);
  const [svgSuffixContent, setSvgSuffixContent] = useState(null);

  const dynWrapper =
    styleDefault?.[selectedDevice]?.default?.justifyContent ?? "flex-start";
  let title = "Read More";
  let postUrl = "#";
  if (postData?.url) {
    postUrl = postData.url;
  }
  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  if (extraRootClassName) {
    custom_class = `${custom_class} ${extraRootClassName}`.trim();
  }

  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  useEffect(() => {
    const iconUrl = settings?.prefix?.icons?.icon?.url;
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
            settings?.prefix?.icons?.icon?.color || "currentColor";
          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });
          setSvgPrefixContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [settings?.prefix?.icons?.icon?.url]);

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

  useEffect(() => {
    if (
      linkType === "custom-url" &&
      settings?.link?.custom_field !== "" &&
      settings?.link?.custom_field != "0"
    ) {
      fetchCfImageSizes(postData?.value, settings?.link?.custom_field);
    } else {
      setCfURLValue("#");
    }
  }, [linkType, settings?.link?.custom_field, postData?.value]);

  const fetchCfImageSizes = async (postId, fieldName, type) => {
    const postedData = {
      post_id: postId,
      field_name: fieldName,
    };

    const res = await apiClient.post(apiEndpoints.getCfFieldValue, postedData);
    //console.log(res?.data?.data)
    const url = res?.data?.data?.value ?? "#";
    setCfURLValue(url);
    return url;
  };

  return (
    <>
      {/* <div
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
        }`}
      > */}
      {settings?.link?.visibility && linkType === "post-url" ? (
        <>
          <a
            onClick={(e) => {
              e.preventDefault();
              if (typeof onLinkClick === "function") {
                onLinkClick(e);
              }
              setIndexes({
                type: "module",
                rowindex: rowindex,
                columnindex: columnindex,
                moduleindex: moduleindex,
                module: module,
              });
            }}
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
            href={postUrl}
            //onClick={(e) => e.preventDefault()}
            target={settings?.link?.target === "new-tab" ? "_blank" : "_self"}
          >
            {isPostPrefixEnabled(settings) && (
              <>
                <div className="caf-builder-prefix-col">
                  {settings?.prefix?.meta_type === "text" &&
                    parse(`${settings?.prefix?.meta_text}`)}
                  {settings?.prefix?.meta_type === "icon" &&
                    settings?.prefix?.icons?.visibility &&
                    settings?.prefix?.icons?.type === "icon" &&
                    settings?.prefix?.icons?.icon !== "" && (
                      <i
                        data-icon-name={settings?.prefix?.icons?.icon}
                        className={settings?.prefix?.icons?.icon}
                      ></i>
                    )}
                  {settings?.prefix?.meta_type === "icon" &&
                  settings?.prefix?.icons?.visibility &&
                  settings?.prefix?.icons?.type === "svg" &&
                  settings?.prefix?.icons?.icon?.url !== "" &&
                  (isCafSvgIconUrl(settings?.prefix?.icons?.icon?.url) &&
                    svgPrefixContent ? (
                      <span
                      className="svg-dynamic"
                      dangerouslySetInnerHTML={{ __html: svgPrefixContent }}
                    />
                    ) : isCafUploadedIconUrl(settings?.prefix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.prefix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
                </div>
              </>
            )}

            {isPostSuffixEnabled(settings) ? (
              <>
                {isPostPrefixEnabled(settings) ? (
                  <div
                    className={`caf-builder-button-suffix-wrapper caf-layout-${dynWrapper}`}
                  >
                    <div className="caf-builder-title-value">
                      {settings.changeButtonValue
                        ? settings.changeButtonValue
                        : title}
                    </div>
                    <div className="caf-builder-suffix-col">
                      {settings?.suffix?.meta_type === "text" &&
                        settings?.suffix?.meta_text &&
                        parse(`${settings?.suffix?.meta_text}`)}

                      {settings?.suffix?.meta_type === "icon" &&
                        settings?.suffix?.icons?.visibility &&
                        settings?.suffix?.icons?.type === "icon" &&
                        settings?.suffix?.icons?.icon !== "" && (
                          <i
                            data-icon-name={settings?.suffix?.icons?.icon}
                            className={settings?.suffix?.icons?.icon}
                          ></i>
                        )}
                      {settings?.suffix?.meta_type === "icon" &&
                      settings?.suffix?.icons?.visibility &&
                      settings?.suffix?.icons?.type === "svg" &&
                      settings?.suffix?.icons?.icon?.url !== "" &&
                      (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                          className="svg-dynamic"
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
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="caf-builder-button-value">
                      {settings.changeButtonValue
                        ? settings.changeButtonValue
                        : title}
                    </div>
                    <div className="caf-builder-suffix-col">
                      {settings?.suffix?.meta_type === "text" &&
                        settings?.suffix?.meta_text &&
                        parse(`${settings?.suffix?.meta_text}`)}

                      {settings?.suffix?.meta_type === "icon" &&
                        settings?.suffix?.icons?.visibility &&
                        settings?.suffix?.icons?.type === "icon" &&
                        settings?.suffix?.icons?.icon !== "" && (
                          <i
                            data-icon-name={settings?.suffix?.icons?.icon}
                            className={settings?.suffix?.icons?.icon}
                          ></i>
                        )}
                      {settings?.suffix?.meta_type === "icon" &&
                      settings?.suffix?.icons?.visibility &&
                      settings?.suffix?.icons?.type === "svg" &&
                      settings?.suffix?.icons?.icon?.url !== "" &&
                      (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                          className="svg-dynamic"
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
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {isPostPrefixEnabled(settings) ? (
                  <div className="caf-builder-button-value">
                    {settings.changeButtonValue
                      ? settings.changeButtonValue
                      : title}
                  </div>
                ) : (
                  <>
                    {settings.changeButtonValue
                      ? settings.changeButtonValue
                      : title}
                  </>
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
                .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-button-suffix-wrapper{
                  ${generateCSS(
                    styleDefault?.meta,
                    "default",
                    selectedDevice,
                    settings,
                    postData
                  )}
                }
                .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-button-suffix-wrapper:hover{
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
          </a>
        </>
      ) : settings?.link?.visibility &&
        linkType === "custom-url" ? (
        <>
          <a
            onClick={(e) => {
              e.preventDefault();
              setIndexes({
                type: "module",
                rowindex: rowindex,
                columnindex: columnindex,
                moduleindex: moduleindex,
                module: module,
              });
            }}
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
            href={CfURLValue}
            //onClick={(e) => e.preventDefault()}
            target={settings?.link?.target === "new-tab" ? "_blank" : "_self"}
          >
            {isPostPrefixEnabled(settings) && (
              <>
                <div className="caf-builder-prefix-col">
                  {settings?.prefix?.meta_type === "text" &&
                    parse(`${settings?.prefix?.meta_text}`)}
                  {settings?.prefix?.meta_type === "icon" &&
                    settings?.prefix?.icons?.visibility &&
                    settings?.prefix?.icons?.type === "icon" &&
                    settings?.prefix?.icons?.icon !== "" && (
                      <i
                        data-icon-name={settings?.prefix?.icons?.icon}
                        className={settings?.prefix?.icons?.icon}
                      ></i>
                    )}
                  {settings?.prefix?.meta_type === "icon" &&
                  settings?.prefix?.icons?.visibility &&
                  settings?.prefix?.icons?.type === "svg" &&
                  settings?.prefix?.icons?.icon?.url !== "" &&
                  (isCafSvgIconUrl(settings?.prefix?.icons?.icon?.url) &&
                    svgPrefixContent ? (
                      <span
                      className="svg-dynamic"
                      dangerouslySetInnerHTML={{ __html: svgPrefixContent }}
                    />
                    ) : isCafUploadedIconUrl(settings?.prefix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.prefix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
                </div>
              </>
            )}

            {isPostSuffixEnabled(settings) ? (
              <>
                {isPostPrefixEnabled(settings) ? (
                  <div
                    className={`caf-builder-button-suffix-wrapper caf-layout-${dynWrapper}`}
                  >
                    <div className="caf-builder-button-value">
                      {settings.changeButtonValue
                        ? settings.changeButtonValue
                        : title}
                    </div>
                    <div className="caf-builder-suffix-col">
                      {settings?.suffix?.meta_type === "text" &&
                        settings?.suffix?.meta_text &&
                        parse(`${settings?.suffix?.meta_text}`)}

                      {settings?.suffix?.meta_type === "icon" &&
                        settings?.suffix?.icons?.visibility &&
                        settings?.suffix?.icons?.type === "icon" &&
                        settings?.suffix?.icons?.icon !== "" && (
                          <i
                            data-icon-name={settings?.suffix?.icons?.icon}
                            className={settings?.suffix?.icons?.icon}
                          ></i>
                        )}
                      {settings?.suffix?.meta_type === "icon" &&
                      settings?.suffix?.icons?.visibility &&
                      settings?.suffix?.icons?.type === "svg" &&
                      settings?.suffix?.icons?.icon?.url !== "" &&
                      (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                          className="svg-dynamic"
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
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="caf-builder-button-value">
                      {settings.changeButtonValue
                        ? settings.changeButtonValue
                        : title}
                    </div>
                    <div className="caf-builder-suffix-col">
                      {settings?.suffix?.meta_type === "text" &&
                        settings?.suffix?.meta_text &&
                        parse(`${settings?.suffix?.meta_text}`)}

                      {settings?.suffix?.meta_type === "icon" &&
                        settings?.suffix?.icons?.visibility &&
                        settings?.suffix?.icons?.type === "icon" &&
                        settings?.suffix?.icons?.icon !== "" && (
                          <i
                            data-icon-name={settings?.suffix?.icons?.icon}
                            className={settings?.suffix?.icons?.icon}
                          ></i>
                        )}
                      {settings?.suffix?.meta_type === "icon" &&
                      settings?.suffix?.icons?.visibility &&
                      settings?.suffix?.icons?.type === "svg" &&
                      settings?.suffix?.icons?.icon?.url !== "" &&
                      (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                          className="svg-dynamic"
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
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {isPostPrefixEnabled(settings) ? (
                  <div className="caf-builder-button-value">
                    {settings.changeButtonValue
                      ? settings.changeButtonValue
                      : title}
                  </div>
                ) : (
                  <>
                    {settings.changeButtonValue
                      ? settings.changeButtonValue
                      : title}
                  </>
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
                    
                .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-button-suffix-wrapper{
                  ${generateCSS(
                    styleDefault?.meta,
                    "default",
                    selectedDevice,
                    settings,
                    postData
                  )}
                }
                .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-button-suffix-wrapper:hover{
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
          </a>
        </>
      ) : (
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
            <>
              <div className="caf-builder-prefix-col">
                {settings?.prefix?.meta_type === "text" &&
                  parse(`${settings?.prefix?.meta_text}`)}
                {settings?.prefix?.meta_type === "icon" &&
                  settings?.prefix?.icons?.visibility &&
                  settings?.prefix?.icons?.type === "icon" &&
                  settings?.prefix?.icons?.icon !== "" && (
                    <i
                      data-icon-name={settings?.prefix?.icons?.icon}
                      className={settings?.prefix?.icons?.icon}
                    ></i>
                  )}
                {settings?.prefix?.meta_type === "icon" &&
                settings?.prefix?.icons?.visibility &&
                settings?.prefix?.icons?.type === "svg" &&
                settings?.prefix?.icons?.icon?.url !== "" &&
                (isCafSvgIconUrl(settings?.prefix?.icons?.icon?.url) &&
                    svgPrefixContent ? (
                      <span
                    className="svg-dynamic"
                    dangerouslySetInnerHTML={{ __html: svgPrefixContent }}
                  />
                    ) : isCafUploadedIconUrl(settings?.prefix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.prefix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
              </div>
            </>
          )}

          {isPostSuffixEnabled(settings) ? (
            <>
              {isPostPrefixEnabled(settings) ? (
                <div
                  className={`caf-builder-button-suffix-wrapper caf-layout-${dynWrapper}`}
                >
                  <div className="caf-builder-button-value">
                    {settings.changeButtonValue
                      ? settings.changeButtonValue
                      : title}
                  </div>
                  <div className="caf-builder-suffix-col">
                    {settings?.suffix?.meta_type === "text" &&
                      settings?.suffix?.meta_text &&
                      parse(`${settings?.suffix?.meta_text}`)}

                    {settings?.suffix?.meta_type === "icon" &&
                      settings?.suffix?.icons?.visibility &&
                      settings?.suffix?.icons?.type === "icon" &&
                      settings?.suffix?.icons?.icon !== "" && (
                        <i
                          data-icon-name={settings?.suffix?.icons?.icon}
                          className={settings?.suffix?.icons?.icon}
                        ></i>
                      )}
                    {settings?.suffix?.meta_type === "icon" &&
                    settings?.suffix?.icons?.visibility &&
                    settings?.suffix?.icons?.type === "svg" &&
                    settings?.suffix?.icons?.icon?.url !== "" &&
                    (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                        className="svg-dynamic"
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
                  </div>
                </div>
              ) : (
                <>
                  <div className="caf-builder-button-value">
                    {settings.changeButtonValue
                      ? settings.changeButtonValue
                      : title}
                  </div>
                  <div className="caf-builder-suffix-col">
                    {settings?.suffix?.meta_type === "text" &&
                      settings?.suffix?.meta_text &&
                      parse(`${settings?.suffix?.meta_text}`)}

                    {settings?.suffix?.meta_type === "icon" &&
                      settings?.suffix?.icons?.visibility &&
                      settings?.suffix?.icons?.type === "icon" &&
                      settings?.suffix?.icons?.icon !== "" && (
                        <i
                          data-icon-name={settings?.suffix?.icons?.icon}
                          className={settings?.suffix?.icons?.icon}
                        ></i>
                      )}
                    {settings?.suffix?.meta_type === "icon" &&
                    settings?.suffix?.icons?.visibility &&
                    settings?.suffix?.icons?.type === "svg" &&
                    settings?.suffix?.icons?.icon?.url !== "" &&
                    (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                        className="svg-dynamic"
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
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {isPostPrefixEnabled(settings) ? (
                <div className="caf-builder-button-value">
                  {settings.changeButtonValue
                    ? settings.changeButtonValue
                    : title}
                </div>
              ) : (
                <>
                  {settings.changeButtonValue
                    ? settings.changeButtonValue
                    : title}
                </>
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
                  .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-button-suffix-wrapper{
                  ${generateCSS(
                    styleDefault?.meta,
                    "default",
                    selectedDevice,
                    settings,
                    postData
                  )}
                }
                .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-button-suffix-wrapper:hover{
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
      )}
      {/* </div> */}
    </>
  );
}

export default ModuleButton;
