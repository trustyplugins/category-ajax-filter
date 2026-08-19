import React, { useState, useEffect, useMemo } from "react";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import parse from "html-react-parser";
import { generateCSS } from "../../../utils/functions";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
import {
  isPostPrefixEnabled,
  isPostSuffixEnabled,
} from "../settingTabContent/ModuleContentData/shared/postModuleTier";
import {
  hasCustomFieldPreviewSelection,
  resolveCustomFieldValueFromPostMeta,
  resolvePreviewPostId,
} from "../../utils/postCustomFieldPreviewUtils";
function ModuleCustomField({
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
  //console.log(settings)
  const dynWrapper =
    styleDefault?.[selectedDevice]?.default?.justifyContent ?? "flex-start";

  const postId = resolvePreviewPostId(postData);
  const fieldName = settings?.custom_field;
  const hasSelection = hasCustomFieldPreviewSelection(fieldName);
  const metaResolvedValue = useMemo(
    () =>
      hasSelection
        ? resolveCustomFieldValueFromPostMeta(postData, fieldName)
        : null,
    [hasSelection, fieldName, postData, postId]
  );
  const [fallbackCfValue, setFallbackCfValue] = useState(null);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);
  const postScopeSelector = postId
    ? `.caf-builder-preview-single-post-item.post-id-${postId}, .caf-builder-post-preview.post-id-${postId}`
    : ".caf-bl-post";
  const [svgPrefixContent, setSvgPrefixContent] = useState(null);
  const [svgSuffixContent, setSvgSuffixContent] = useState(null);
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
    setFallbackCfValue(null);
    setIsFallbackLoading(false);
  }, [postId, fieldName]);

  useEffect(() => {
    if (!hasSelection || metaResolvedValue !== null || !postId) {
      return undefined;
    }

    let cancelled = false;
    setIsFallbackLoading(true);

    fetchCfValue(postId, fieldName)
      .then((value) => {
        if (cancelled) {
          return;
        }
        if (value !== null && value !== undefined && String(value).trim() !== "") {
          setFallbackCfValue(String(value));
        } else {
          setFallbackCfValue(null);
        }
        setIsFallbackLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFallbackCfValue(null);
          setIsFallbackLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasSelection, metaResolvedValue, postId, fieldName]);

  const fetchCfValue = async (postId, fieldName) => {
    const postedData = {
      post_id: postId,
      field_name: fieldName,
    };
    const res = await apiClient.post(apiEndpoints.getCfFieldValue, postedData);
    return res?.data?.data?.value ?? null;
  };

  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
    const visibility = settings?.visibility || {};
  const hideClass =
    visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  const displayCfValue = useMemo(() => {
    if (!hasSelection) {
      return "Custom Field Value";
    }
    if (metaResolvedValue !== null) {
      return metaResolvedValue;
    }
    if (isFallbackLoading) {
      return "";
    }
    if (fallbackCfValue !== null) {
      return fallbackCfValue;
    }
    return "Custom Field Value";
  }, [hasSelection, metaResolvedValue, isFallbackLoading, fallbackCfValue]);

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
                className={`caf-builder-custom-filed-suffix-wrapper caf-layout-${dynWrapper}`}
              >
                <div className="caf-builder-custom-filed-value">
                  {displayCfValue ? parse(`${displayCfValue}`) : null}
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
                      dangerouslySetInnerHTML={{ __html: svgSuffixContent }}
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
                <div className="caf-builder-custom-filed-value">
                  {displayCfValue ? parse(`${displayCfValue}`) : null}
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
                      dangerouslySetInnerHTML={{ __html: svgSuffixContent }}
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
              <div className="caf-builder-custom-filed-value">
                {displayCfValue ? parse(`${displayCfValue}`) : null}
              </div>
            ) : displayCfValue ? (
              parse(displayCfValue)
            ) : null}
          </>
        )}

        <style>
          {`
          .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
              ${generateCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData
              )}
          }
          .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData
            )}
          } 
          .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-custom-filed-suffix-wrapper{
            ${generateCSS(
              styleDefault?.meta,
              "default",
              selectedDevice,
              settings,
              postData
            )}
          }
          .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-custom-filed-suffix-wrapper:hover{
            ${generateCSS(
              styleDefault?.meta,
              "hover",
              selectedDevice,
              settings,
              postData
            )}
          }
         
          ${postScopeSelector} .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col{
            ${generateCSS(
              styleDefault?.prefix,
              "default",
              selectedDevice,
              settings,
              postData
            )}
          }
          ${postScopeSelector} .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col:hover{
            ${generateCSS(
              styleDefault?.prefix,
              "hover",
              selectedDevice,
              settings,
              postData
            )}
          }
        ${postScopeSelector} .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col{
          ${generateCSS(
            styleDefault?.suffix,
            "default",
            selectedDevice,
            settings,
            postData
          )}
        }
        ${postScopeSelector} .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col:hover{
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

export default ModuleCustomField;
