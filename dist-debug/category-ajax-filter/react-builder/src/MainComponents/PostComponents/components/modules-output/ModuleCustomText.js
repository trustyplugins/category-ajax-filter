import React, { useEffect, useState } from "react";
import { generateCSS } from "../../../utils/functions";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
function ModuleCustomText({
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
  useEffect(() => {
    const iconUrl = settings?.icons?.icon?.url;
    if (!iconUrl || !isCafSvgIconUrl(iconUrl)) {
      setSvgContent(null);
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
          const iconColor = settings?.icons?.color || "currentColor";
          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });
          setSvgContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [settings?.label?.icons?.icon?.url, settings?.label?.icons?.color]);

  let customtext = "Custom Text";
  if (settings?.customText) {
    customtext = settings.customText;
  }
  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  //console.log(excerpt);

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
        {settings?.icons?.position === "before-customtext" &&
          settings?.icons?.icon &&
          settings?.icons?.visibility && (
            <>
              {settings?.icons?.type === "icon" ? (
                <i
                  data-icon-name={settings.icons.icon}
                  value={settings.icons.icon}
                  class={settings.icons.icon}
                  style={{ marginRight: "5px" }}
                ></i>
              ) : (
                <>
                  {isCafSvgIconUrl(settings?.icons?.icon?.url) &&
                  svgContent ? (
                    <span
                      className="svg-dynamic"
                      style={{ marginRight: "5px" }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <img
                      src={settings.icons.icon.url}
                      alt=""
                      style={{ width: "20px", marginRight: "5px" }}
                    />
                  )}
                </>
              )}
            </>
          )}
        <div dangerouslySetInnerHTML={{ __html: customtext }} />
        {settings?.icons?.position === "after-customtext" &&
          settings?.icons?.icon &&
          settings?.icons?.visibility && (
            <>
              {settings?.icons?.type === "icon" ? (
                <i
                  data-icon-name={settings.icons.icon}
                  value={settings.icons.icon}
                  class={settings.icons.icon}
                  style={{ marginLeft: "5px" }}
                ></i>
              ) : (
                <>
                  {isCafSvgIconUrl(settings?.icons?.icon?.url) &&
                  svgContent ? (
                    <span
                      className="svg-dynamic"
                      style={{ marginLeft: "5px" }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <img
                      src={settings.icons.icon.url}
                      alt=""
                      style={{ width: "20px", marginLeft: "5px" }}
                    />
                  )}
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
      ${generateCSS(styleDefault, "hover", selectedDevice, settings, postData)}
    }
    `}
        </style>
      </div>
    </>
  );
}

export default ModuleCustomText;
