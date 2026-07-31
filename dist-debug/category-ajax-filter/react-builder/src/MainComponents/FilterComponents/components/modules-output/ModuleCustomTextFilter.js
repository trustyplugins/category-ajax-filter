import React, { useEffect, useState, memo, useMemo } from "react";
import { generateFilterCSS } from "../../../utils/functions";
import { resolveCustomTextModuleSettingsForOutput } from "../settingTabContent/ModuleContentData/shared/filterModuleTier";

import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";


function ModuleCustomTextFilter({
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  setIndexes,
  indexes,
}) {
  const outputSettings = useMemo(
    () => resolveCustomTextModuleSettingsForOutput(settings),
    [settings]
  );
  const customText = outputSettings?.customText || "Custom Text";
  const customClass = outputSettings?.custom_class || "";
  const visibility = outputSettings?.visibility || {};
  const hideClass =
    visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  const showBeforeIcon =
    outputSettings?.icons?.position === "before-customtext" &&
    outputSettings?.icons?.icon &&
    outputSettings?.icons?.visibility;
  const showAfterIcon =
    outputSettings?.icons?.position === "after-customtext" &&
    outputSettings?.icons?.icon &&
    outputSettings?.icons?.visibility;

  const hasIconStyle = Boolean(styleDefault?.icon?.desktop?.default);
  const iconCss = (state) =>
    hasIconStyle
      ? generateFilterCSS("icon", state, selectedDevice, styleDefault)
      : "";

  return (
    <div
      onClick={() =>
        setIndexes &&
        setIndexes({
          type: "module",
          rowindex,
          columnindex,
          moduleindex,
          module,
        })
      }
      className={`caf-builder-module-main caf-module-${
        module.key
      } caf-module-${moduleindex} ${customClass} caf-builder-filter ${
        indexes?.type === "module" &&
        indexes?.rowindex === rowindex &&
        indexes?.columnindex === columnindex &&
        indexes?.moduleindex === moduleindex
          ? "active"
          : ""
      } ${hideClass}`}
    >
      {showBeforeIcon && (
        <>
          {outputSettings?.icons?.type === "icon" ? (
            <i className={outputSettings.icons.icon}></i>
          ) : (
            <>
              {isCafUploadedIconUrl(outputSettings?.icons?.icon?.url) ? (
                <InlineSVG
                  src={outputSettings.icons.icon.url}
                  className="caf-inline-svg-icon svg-dynamic"
                  style={{ marginRight: "5px" }}
                />
              ) : (
                <img
                  src={outputSettings.icons.icon.url}
                  alt=""
                  className="caf-inline-svg-icon"
                  style={{ width: "20px", marginRight: "5px" }}
                />
              )}
            </>
          )}
        </>
      )}

      <div
        className="caf-filter-custom-text-content"
        dangerouslySetInnerHTML={{ __html: customText }}
      />

      {showAfterIcon && (
        <>
          {outputSettings?.icons?.type === "icon" ? (
            <i className={outputSettings.icons.icon}></i>
          ) : (
            <>
              {isCafUploadedIconUrl(outputSettings?.icons?.icon?.url) ? (
                <InlineSVG
                  src={outputSettings.icons.icon.url}
                  className="caf-inline-svg-icon svg-dynamic"
                  style={{ marginLeft: "5px" }}
                />
              ) : (
                <img
                  src={outputSettings.icons.icon.url}
                  alt=""
                  className="caf-inline-svg-icon"
                  style={{ width: "20px", marginLeft: "5px" }}
                />
              )}
            </>
          )}
        </>
      )}

      <style>
        {`
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
            ${generateFilterCSS("container", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateFilterCSS("container", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} svg,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img.caf-inline-svg-icon {
            ${iconCss("default")}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} i:hover,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} svg:hover,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img.caf-inline-svg-icon:hover {
            ${iconCss("hover")}
          }
        `}
      </style>
    </div>
  );
}

export default ModuleCustomTextFilter;
