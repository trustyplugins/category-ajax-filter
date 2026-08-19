import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { generateCSS } from "../../../../utils/functions";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../../shared/cafUploadedIcon";
import {
  isPostPrefixEnabled,
  isPostSuffixEnabled,
} from "../../settingTabContent/ModuleContentData/shared/postModuleTier";

function renderAffixContent(
  settings,
  placement,
  svgContent,
  postData,
  { showDesignFallback = false } = {},
) {
  const affix = settings?.[placement];
  if (!affix) {
    return null;
  }

  if (affix.meta_type === "text" && affix.meta_text) {
    return parse(`${affix.meta_text}`);
  }

  if (affix.meta_type === "review_count") {
    let rawCount = postData?.rating_data?.review_count;
    if (rawCount === null || rawCount === undefined || rawCount === "") {
      // Post canvas only: keep count affix visible for design when data is empty.
      if (!showDesignFallback) {
        return null;
      }
      rawCount = 0;
    }
    const countText = String(rawCount);
    const separator = affix.count_separator || "none";
    if (separator === "brackets") {
      return `(${countText})`;
    }
    if (separator === "hyphen") {
      return `- ${countText}`;
    }
    if (separator === "slash") {
      return `/${countText}`;
    }
    // none
    return countText;
  }

  if (
    affix.meta_type === "icon" &&
    affix.icons?.visibility &&
    affix.icons?.type === "icon" &&
    affix.icons?.icon !== ""
  ) {
    return (
      <i data-icon-name={affix.icons.icon} className={affix.icons.icon}></i>
    );
  }

  if (
    affix.meta_type === "icon" &&
    affix.icons?.visibility &&
    affix.icons?.type === "svg" &&
    affix.icons?.icon?.url !== "" &&
    isCafSvgIconUrl(affix.icons?.icon?.url) &&
    svgContent
  ) {
    return (
      <span
        className="svg-dynamic"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  if (
    affix.meta_type === "icon" &&
    affix.icons?.visibility &&
    affix.icons?.type === "svg" &&
    isCafUploadedIconUrl(affix.icons?.icon?.url)
  ) {
    return (
      <img
        className="svg-dynamic"
        src={affix.icons.icon.url}
        alt=""
      />
    );
  }

  return null;
}

function resolveAverageRating(postData) {
  const raw = postData?.rating_data?.average_rating;
  if (raw === null || raw === undefined || raw === "") {
    return "";
  }
  return String(raw);
}

function hasZeroAverageRating(postData) {
  const averageRating = resolveAverageRating(postData);
  if (!averageRating) {
    return true;
  }
  const numeric = Number.parseFloat(String(averageRating).trim());
  return !Number.isFinite(numeric) || numeric === 0;
}

const TOTAL_STAR_COUNT = 5;

/** Filled portion of the 5-star row, as a percentage (3.7 → 74). */
function resolveStarFillPercent(averageRating) {
  const numeric = Number.parseFloat(String(averageRating ?? "").trim());
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }
  const clamped = Math.min(numeric, TOTAL_STAR_COUNT);
  return Number(((clamped / TOTAL_STAR_COUNT) * 100).toFixed(4));
}

function renderStarRow(modifier, keyPrefix) {
  const stars = [];
  for (let index = 0; index < TOTAL_STAR_COUNT; index += 1) {
    stars.push(
      <i
        key={`${keyPrefix}-${index}`}
        className={`fas fa-star caf-rating-star caf-rating-star--${modifier} filter-before-icon`}
      ></i>,
    );
  }
  return stars;
}

/**
 * Always render 5 stars: an empty base row with a clipped filled row on top,
 * so fractional ratings (3.7) fill part of a star instead of dropping it.
 */
function renderFiveStarIcons(averageRating, keyPrefix = "caf-rating-star") {
  const fillPercent = resolveStarFillPercent(averageRating);

  return (
    <span className="caf-builder-rating-stars">
      <span className="caf-builder-rating-stars-base">
        {renderStarRow("empty", `${keyPrefix}-empty`)}
      </span>
      <span
        className="caf-builder-rating-stars-fill"
        style={{ width: `${fillPercent}%` }}
        aria-hidden="true"
      >
        {renderStarRow("filled", `${keyPrefix}-filled`)}
      </span>
    </span>
  );
}

function resolveStarStyleProperty(styleStar, selectedDevice, state, property) {
  const deviceKey = selectedDevice || "desktop";
  const fromDevice = styleStar?.[deviceKey]?.[state]?.[property];
  if (fromDevice !== undefined && fromDevice !== null && fromDevice !== "") {
    return String(fromDevice);
  }
  if (state === "hover") {
    const fromDefault = styleStar?.[deviceKey]?.default?.[property];
    if (fromDefault !== undefined && fromDefault !== null && fromDefault !== "") {
      return String(fromDefault);
    }
  }
  if (deviceKey !== "desktop") {
    const fromDesktopState = styleStar?.desktop?.[state]?.[property];
    if (
      fromDesktopState !== undefined &&
      fromDesktopState !== null &&
      fromDesktopState !== ""
    ) {
      return String(fromDesktopState);
    }
    if (state === "hover") {
      const fromDesktopDefault = styleStar?.desktop?.default?.[property];
      if (
        fromDesktopDefault !== undefined &&
        fromDesktopDefault !== null &&
        fromDesktopDefault !== ""
      ) {
        return String(fromDesktopDefault);
      }
    }
  }
  return "";
}

function renderRatingContent(
  settings,
  postData,
  { showDesignStarsWhenEmpty = false } = {},
) {
  const averageRating = resolveAverageRating(postData);
  const ratingDisplay = settings?.rating_display || "stars";

  if (ratingDisplay === "average_value") {
    const numeric = Number.parseFloat(String(averageRating ?? "").trim());
    if (!Number.isFinite(numeric) || numeric === 0) {
      // Post canvas only: keep average value visible for design when rating is empty.
      if (showDesignStarsWhenEmpty) {
        return "0";
      }
      return null;
    }
    return averageRating;
  }

  // Stars: always draw 5 slots (empty base + clipped fill). Rating 0/null → 5 empty.
  return renderFiveStarIcons(averageRating);
}

function ModuleProductRating({
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
  hideAffixWhenZeroRating = false,
  /** Post builder canvas: average_value "0" + affix design fallbacks when rating is empty. Preview leaves this false. */
  showDesignStarsWhenEmpty = false,
}) {
  const customClass = settings?.custom_class || "";
  const visibility = settings?.visibility || {};
  const hideClass =
    visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  const dynWrapper =
    styleDefault?.[selectedDevice]?.default?.justifyContent ?? "flex-start";
  const isActive =
    indexes?.type === "module" &&
    indexes?.rowindex === rowindex &&
    indexes?.columnindex === columnindex &&
    indexes?.moduleindex === moduleindex;
  const moduleClassName = `caf-builder-module-main caf-module-${module.key} caf-module-${moduleindex} ${customClass} ${
    isActive ? "active" : ""
  } ${hideClass}`;

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

  const handleSelect = () => {
    setIndexes({
      type: "module",
      rowindex,
      columnindex,
      moduleindex,
      module,
    });
  };

  const ratingDisplay = settings?.rating_display || "stars";
  // Preview hides affixes on zero rating only for average_value; stars keep affixes with empty stars.
  const hideAffixForZeroRating =
    hideAffixWhenZeroRating &&
    hasZeroAverageRating(postData) &&
    ratingDisplay === "average_value";
  const affixDesignFallback =
    showDesignStarsWhenEmpty && !hideAffixWhenZeroRating;

  const prefixContent =
    !hideAffixForZeroRating && isPostPrefixEnabled(settings)
      ? renderAffixContent(settings, "prefix", svgPrefixContent, postData, {
          showDesignFallback: affixDesignFallback,
        })
      : null;
  const suffixContent =
    !hideAffixForZeroRating && isPostSuffixEnabled(settings)
      ? renderAffixContent(settings, "suffix", svgSuffixContent, postData, {
          showDesignFallback: affixDesignFallback,
        })
      : null;
  const showPrefix = Boolean(prefixContent);
  const showSuffix = Boolean(suffixContent);

  const ratingNode = (
    <div className="caf-builder-rating-value">
      {renderRatingContent(settings, postData, { showDesignStarsWhenEmpty })}
    </div>
  );

  const styleStar = styleDefault?.star;
  const isStarsDisplay = ratingDisplay === "stars";
  const emptyStarColor = isStarsDisplay
    ? resolveStarStyleProperty(styleStar, selectedDevice, "default", "color")
    : "";
  const filledStarColor = isStarsDisplay
    ? resolveStarStyleProperty(styleStar, selectedDevice, "hover", "color")
    : "";
  const starFontSize = isStarsDisplay
    ? resolveStarStyleProperty(styleStar, selectedDevice, "default", "fontSize")
    : "";
  const moduleScope = `.caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}`;
  const starLayoutCss = isStarsDisplay
    ? `
    ${moduleScope} .caf-builder-rating-value .caf-builder-rating-stars {
      position: relative;
      display: inline-flex;
      line-height: 1;
      vertical-align: middle;
    }
    ${moduleScope} .caf-builder-rating-value .caf-builder-rating-stars-base,
    ${moduleScope} .caf-builder-rating-value .caf-builder-rating-stars-fill {
      display: inline-flex;
      flex: 0 0 auto;
      white-space: nowrap;
      ${generateCSS(styleStar, "default", selectedDevice, settings, postData)}
    }
    ${moduleScope} .caf-builder-rating-value .caf-builder-rating-stars-fill {
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      pointer-events: none;
    }`
    : "";
  // Only emit overrides when Star tab has values so Text All hover can inherit otherwise.
  const starColorCss =
    (emptyStarColor
      ? `
    ${moduleScope} .caf-builder-rating-value .caf-rating-star--empty {
      color: ${emptyStarColor};
    }`
      : "") +
    (filledStarColor
      ? `
    ${moduleScope} .caf-builder-rating-value .caf-rating-star--filled,
    ${moduleScope} .caf-builder-rating-value .caf-rating-star--half {
      color: ${filledStarColor};
    }`
      : "") +
    (starFontSize
      ? `
    ${moduleScope} .caf-builder-rating-value .caf-rating-star--empty,
    ${moduleScope} .caf-builder-rating-value .caf-rating-star--filled,
    ${moduleScope} .caf-builder-rating-value .caf-rating-star--half {
      font-size: ${starFontSize};
    }`
      : "");

  const moduleStyles = `
    ${moduleScope} {
      ${generateCSS(styleDefault, "default", selectedDevice, settings, postData)}
    }
    ${moduleScope}:hover {
      ${generateCSS(styleDefault, "hover", selectedDevice, settings, postData)}
    }
    ${starLayoutCss}
    ${starColorCss}
    .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-title-suffix-wrapper {
      ${generateCSS(
        styleDefault?.meta,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-title-suffix-wrapper:hover {
      ${generateCSS(
        styleDefault?.meta,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
    ${moduleScope} .caf-builder-prefix-col {
      ${generateCSS(
        styleDefault?.prefix,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    ${moduleScope} .caf-builder-prefix-col:hover {
      ${generateCSS(
        styleDefault?.prefix,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
    ${moduleScope} .caf-builder-suffix-col {
      ${generateCSS(
        styleDefault?.suffix,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    ${moduleScope} .caf-builder-suffix-col:hover {
      ${generateCSS(
        styleDefault?.suffix,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
  `;

  return (
    <div onClick={handleSelect} className={moduleClassName}>
      {showPrefix && (
        <div className="caf-builder-prefix-col">{prefixContent}</div>
      )}

      {showSuffix ? (
        showPrefix ? (
          <div
            className={`caf-builder-title-suffix-wrapper caf-layout-${dynWrapper}`}
          >
            {ratingNode}
            <div className="caf-builder-suffix-col">{suffixContent}</div>
          </div>
        ) : (
          <>
            {ratingNode}
            <div className="caf-builder-suffix-col">{suffixContent}</div>
          </>
        )
      ) : (
        ratingNode
      )}

      <style>{moduleStyles}</style>
    </div>
  );
}

export default ModuleProductRating;
