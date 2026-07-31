import React, { useState, useEffect, memo, useRef, useMemo } from "react";
import { generateFilterCSS } from "../../../utils/functions";
import { resolveResetModuleSettingsForOutput } from "../settingTabContent/ModuleContentData/shared/filterModuleTier";
import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";

function ModuleReset({
  postData,
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
    () => resolveResetModuleSettingsForOutput(settings),
    [settings]
  );
  let custom_class = "";
  if (outputSettings?.custom_class) {
    custom_class = outputSettings.custom_class;
  }

    const visibility = outputSettings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  return (
    <div
      onClick={() =>
        setIndexes &&
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
      } caf-module-${moduleindex} ${custom_class} caf-builder-filter ${
        indexes?.type === "module" &&
        indexes?.rowindex === rowindex &&
        indexes?.columnindex === columnindex &&
        indexes?.moduleindex === moduleindex
          ? "active"
          : ""
      } ${hideClass}`}
    >
      {(outputSettings?.icons && outputSettings?.icons?.visibility  &&
        outputSettings?.icons?.type === "icon" &&
        outputSettings?.icons?.icon !== "") ||
      (outputSettings?.icons &&
        outputSettings?.icons?.type === "svg" &&
        outputSettings?.icons?.icon?.url &&
        isCafUploadedIconUrl(outputSettings?.icons?.icon.url)) ? (
        <>
          {outputSettings?.icons &&
            outputSettings?.icons?.type === "icon" &&
            outputSettings?.icons?.icon !== "" && (
              <i className={outputSettings?.icons?.icon}></i>
            )}
          {outputSettings?.icons &&
            outputSettings?.icons?.type === "svg" &&
            outputSettings?.icons?.icon?.url &&
            isCafUploadedIconUrl(outputSettings?.icons?.icon.url) && (
              <InlineSVG
                src={outputSettings?.icons?.icon?.url}
                className="caf-inline-svg-icon"
              />
            )}
          <div className="caf-builder-reset-label">{outputSettings.reset_label}</div>
        </>
      ) : (
        <>{outputSettings.reset_label}</>
      )}

      {/* {settings?.icons && settings?.icons?.icon != "" ? (
        <>
          <div className="caf-builder-custom-filed-label">
            {settings?.icons.position == "before-reset" && (
              <span
                className={`caf-builder-before-label reset-icon-common ${settings?.icons.icon}`}
              ></span>
            )}
            {settings.reset_label}
            {settings?.icons.position == "after-reset" && (
              <span
                className={`caf-builder-after-label reset-icon-common ${settings?.icons.icon}`}
              ></span>
            )}
          </div>
        </>
      ) : (
        <div className="caf-builder-custom-filed-label">
          {settings.reset_label}
        </div>
      )} */}

      <style>
        {`
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
              ${generateFilterCSS(
                "container",
                "default",
                selectedDevice,
                styleDefault,
              )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateFilterCSS(
              "container",
              "hover",
              selectedDevice,
              styleDefault,
            )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} i ,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} svg {
              ${generateFilterCSS(
                "icon",
                "default",
                selectedDevice,
                styleDefault,
              )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} i:hover , 
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} i:hover {
            ${generateFilterCSS(
              "icon",
              "hover",
              selectedDevice,
              styleDefault,
            )}
          }
        `}
      </style>
    </div>
  );
}

export default ModuleReset;
