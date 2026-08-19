import React from "react";
import { generateCSS } from "../../../utils/functions";
function ModuleCategories({
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
  const selectedCat = settings?.categories || "";
  const custom_class = settings?.custom_class || "";

  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  // let categories = (
  //   <ul>
  //     <li>Test</li>
  //     <li>Test 2</li>
  //   </ul>
  // );

  //console.log(settings);
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
        style={{
          ...styleDefault,
          ...(styleDefault?.backgroundImage
            ? { backgroundImage: `url(${styleDefault?.backgroundImage})` }
            : ""),
        }}
      >
        {selectedCat !== "0" && postData?.categories?.[selectedCat] ? (
          postData.categories[selectedCat]
            ?.slice(0, settings?.limit)
            ?.map((term, term_index, arr) =>
              settings?.link?.visibility ? (
                <a
                  onClick={(e) => e.preventDefault()}
                  target={
                    settings?.link?.target === "new-tab" ? "_blank" : "_self"
                  }
                  key={term_index}
                  href={term?.term_link ?? "#"}
                  term-id={term?.term_id}
                  className={`caf-module-term-name caf-module-term-name-${term_index} term-tax-${selectedCat}`}
                >
                  {term?.name}
                  {settings?.separator !== "none" &&
                    arr.length > 1 &&
                    term_index !== arr.length - 1 && (
                      <>
                        <span className="caf-builder-term-separator">
                          {settings?.separator}
                        </span>
                      </>
                    )}
                  {settings?.separator !== "none" &&
                    settings?.last_separator &&
                    term_index === arr.length - 1 && (
                      <span className="caf-builder-term-separator caf-last-separator">
                        {settings?.separator}
                      </span>
                    )}
                </a>
              ) : (
                <div
                  key={term_index}
                  term-id={term?.term_id}
                  className={`caf-module-term-name caf-module-term-name-${term_index} term-tax-${selectedCat}`}
                >
                  {term?.name}
                  {settings?.separator !== "none" &&
                    arr.length > 1 &&
                    term_index !== arr.length - 1 && (
                      <>
                        <span className="caf-builder-term-separator">
                          {settings?.separator}
                        </span>
                      </>
                    )}
                  {settings?.separator !== "none" &&
                    settings?.last_separator &&
                    term_index === arr.length - 1 && (
                      <span className="caf-builder-term-separator caf-last-separator">
                        {settings?.separator}
                      </span>
                    )}
                </div>
              ),
            )
        ) : (
          <div className="caf-module-term-name-empty">No Terms Found</div>
        )}
        <style>
          {`
        .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
            ${generateCSS(
              styleDefault,
              "default",
              selectedDevice,
              settings,
              postData,
            )}
        }
        .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
          ${generateCSS(
            styleDefault,
            "hover",
            selectedDevice,
            settings,
            postData,
          )}
        }
        .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-module-term-name{
            ${generateCSS(
              styleDefault?.meta,
              "default",
              selectedDevice,
              settings,
              postData,
            )}
        }
        .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-module-term-name:hover{
          ${generateCSS(
            styleDefault?.meta,
            "hover",
            selectedDevice,
            settings,
            postData,
          )}
        }
      `}
        </style>
      </div>
    </>
  );
}

export default ModuleCategories;
