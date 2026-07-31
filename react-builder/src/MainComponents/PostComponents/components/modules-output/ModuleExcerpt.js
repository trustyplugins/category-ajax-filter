import React, { useEffect, useState } from "react";
import { generateCSS } from "../../../utils/functions";
// import { Skeleton } from "antd";
// import parse from "html-react-parser";

const EXCERPT_PLACEHOLDER =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";

function ModuleExcerpt({
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
  /** Post builder canvas only — layout preview leaves excerpt empty when post has none. */
  usePlaceholderWhenEmpty = false,
}) {
  const [excerpt, setExcerpt] = useState(
    usePlaceholderWhenEmpty ? EXCERPT_PLACEHOLDER : ""
  );
  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  const stripHtml = (html) =>
    String(html || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const trimToWords = (text, limit) => {
    const normalized = String(text || "").trim();
    if (!normalized) {
      return "";
    }
    const wordLimit = Number(limit);
    if (!Number.isFinite(wordLimit) || wordLimit <= 0) {
      return normalized;
    }
    const words = normalized.split(/\s+/);
    if (words.length <= wordLimit) {
      return normalized;
    }
    return `${words.slice(0, wordLimit).join(" ")}...`;
  };

  useEffect(() => {
    const excerptLength =
      settings?.excerptLength === "" || settings?.excerptLength == null
        ? 20
        : settings?.excerptLength;
    const htmlRenderEnabled =
      settings?.htmlRender === true || settings?.htmlRender === "true";
    const sourceText = htmlRenderEnabled
      ? stripHtml(postData?.description || postData?.excerpt)
      : postData?.excerpt || stripHtml(postData?.description);
    const nextExcerpt = trimToWords(sourceText, excerptLength);
    setExcerpt(
      nextExcerpt || (usePlaceholderWhenEmpty ? EXCERPT_PLACEHOLDER : "")
    );
  }, [
    settings?.excerptLength,
    settings?.htmlRender,
    postData?.excerpt,
    postData?.description,
    usePlaceholderWhenEmpty,
  ]);
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
        dangerouslySetInnerHTML={{ __html: excerpt }}
      >
      </div>
      <style>
        {`
.caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
     ${generateCSS(styleDefault, "default", selectedDevice, settings, postData)}
}
.caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
  ${generateCSS(styleDefault, "hover", selectedDevice, settings, postData)}
}
`}
      </style>
      {/* .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}.post-id-${
          postData?.id ?? 0
        } {
        -webkit-line-clamp:${excerptLines};
        } */}
    </>
  );
}

export default ModuleExcerpt;
