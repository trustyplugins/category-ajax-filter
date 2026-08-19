import React, { useMemo } from "react";
import parse from "html-react-parser";

const getPlainTextFromHtml = (html) => {
  const value = String(html ?? "");
  if (!value) return "";
  if (typeof document !== "undefined") {
    const node = document.createElement("div");
    node.innerHTML = value;
    return (node.textContent || node.innerText || "").trim();
  }
  return value.replace(/<[^>]+>/g, "").trim();
};

const TermTaxonomyLabelText = ({ name, count = null }) => {
  const showCount = count !== null && count !== undefined;

  const plainName = useMemo(
    () => getPlainTextFromHtml(name),
    [name]
  );

  return (
    <>
      <span className="caf-term-label-text" title={plainName}>
        {parse(String(name ?? ""))}
      </span>
      {showCount ? (
        <span className="caf-term-label-count">{` (${count})`}</span>
      ) : null}
    </>
  );
};

export default TermTaxonomyLabelText;
