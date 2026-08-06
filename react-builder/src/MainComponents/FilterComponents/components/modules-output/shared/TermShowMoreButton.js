import React from "react";
import {
  buildShowMoreButtonParts,
  resolveTermShowMoreSettings,
} from "./termShowMoreUtils";

export default function TermShowMoreButton({
  settings,
  isExpanded,
  overflowCount = 0,
  onToggle,
}) {
  const config = resolveTermShowMoreSettings(settings);
  if (!config.enabled || config.limit < 1 || overflowCount <= 0) {
    return null;
  }

  const { label, countText } = buildShowMoreButtonParts(
    settings,
    isExpanded,
    isExpanded ? 0 : overflowCount
  );

  return (
    <li className="caf-term-show-more-item" aria-hidden="false">
      <button
        type="button"
        className="caf-term-show-more-btn"
        aria-expanded={isExpanded ? "true" : "false"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof onToggle === "function") {
            onToggle();
          }
        }}
      >
        {label}
        {countText ? <span>{countText}</span> : null}
      </button>
    </li>
  );
}
