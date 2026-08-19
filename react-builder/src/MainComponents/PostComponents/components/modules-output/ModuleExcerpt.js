import React, { useEffect, useState } from "react";
import { generateCSS } from "../../../utils/functions";

const DEFAULT_EXCERPT_LENGTH = 20;
const EXCERPT_PLACEHOLDER =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";

function resolveExcerptLength(settings) {
  if (settings?.excerptLength === "" || settings?.excerptLength == null) {
    return DEFAULT_EXCERPT_LENGTH;
  }
  const parsed = Number(settings.excerptLength);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_EXCERPT_LENGTH;
  }
  return parsed;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimToWords(text, limit) {
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
}

/**
 * Trim HTML by word count while keeping tags balanced (mirrors PHP trim_html_excerpt_to_words).
 */
function trimHtmlToWords(html, limit) {
  const content = String(html || "");
  if (!content) {
    return "";
  }
  const wordLimit = Number(limit);
  if (!Number.isFinite(wordLimit) || wordLimit <= 0) {
    return content;
  }

  const tokens = content.match(/<[^>]+?>|[^<>\s]+|\s+/gu) || [];
  let words = 0;
  let output = "";
  const openTags = [];
  let truncated = false;

  for (const token of tokens) {
    if (/^<[^>]+>$/.test(token)) {
      output += token;
      const openMatch = token.match(/^<([a-z0-9]+)(?![^>]*\/>)(?:\s[^>]*)?>$/i);
      const closeMatch = token.match(/^<\/([a-z0-9]+)>$/i);
      const voidMatch = /^<(br|hr|img|input|meta|link|source|area|base|col|embed|wbr)\b/i.test(
        token
      );
      if (openMatch && !voidMatch && !token.endsWith("/>")) {
        openTags.push(openMatch[1]);
      } else if (closeMatch) {
        openTags.pop();
      }
    } else if (!String(token).trim()) {
      output += token;
    } else {
      output += token;
      words += 1;
      if (words >= wordLimit) {
        truncated = true;
        break;
      }
    }
  }

  while (openTags.length) {
    output += `</${openTags.pop()}>`;
  }

  if (truncated) {
    output += "...";
  }

  return output.trim();
}

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
  const excerptLength = resolveExcerptLength(settings);
  const htmlRenderEnabled =
    settings?.htmlRender === true || settings?.htmlRender === "true";

  const [excerpt, setExcerpt] = useState(() =>
    usePlaceholderWhenEmpty
      ? trimToWords(EXCERPT_PLACEHOLDER, excerptLength)
      : ""
  );

  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  const visibility = settings?.visibility || {};
  const hideClass =
    visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  useEffect(() => {
    const length = resolveExcerptLength(settings);
    const htmlEnabled =
      settings?.htmlRender === true || settings?.htmlRender === "true";

    let nextExcerpt = "";
    if (htmlEnabled) {
      const htmlSource =
        postData?.description || postData?.excerpt || "";
      nextExcerpt = trimHtmlToWords(htmlSource, length);
      if (!stripHtml(nextExcerpt) && usePlaceholderWhenEmpty) {
        nextExcerpt = trimToWords(EXCERPT_PLACEHOLDER, length);
      }
    } else {
      const plainSource =
        postData?.excerpt || stripHtml(postData?.description);
      nextExcerpt = trimToWords(plainSource, length);
      if (!nextExcerpt && usePlaceholderWhenEmpty) {
        nextExcerpt = trimToWords(EXCERPT_PLACEHOLDER, length);
      }
    }

    setExcerpt(nextExcerpt);
  }, [
    settings?.excerptLength,
    settings?.htmlRender,
    postData?.excerpt,
    postData?.description,
    usePlaceholderWhenEmpty,
  ]);

  const moduleClassName = `caf-builder-module-main caf-module-${
    module.key
  } caf-module-${moduleindex} ${custom_class} ${
    indexes?.type === "module" &&
    indexes?.rowindex === rowindex &&
    indexes?.columnindex === columnindex &&
    indexes?.moduleindex === moduleindex
      ? "active"
      : ""
  } ${hideClass}`;

  const onModuleClick = () =>
    setIndexes({
      type: "module",
      rowindex: rowindex,
      columnindex: columnindex,
      moduleindex: moduleindex,
      module: module,
    });

  return (
    <>
      {htmlRenderEnabled && /</.test(excerpt) ? (
        <div
          onClick={onModuleClick}
          className={moduleClassName}
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
      ) : (
        <div onClick={onModuleClick} className={moduleClassName}>
          {excerpt}
        </div>
      )}
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
    </>
  );
}

export default ModuleExcerpt;
