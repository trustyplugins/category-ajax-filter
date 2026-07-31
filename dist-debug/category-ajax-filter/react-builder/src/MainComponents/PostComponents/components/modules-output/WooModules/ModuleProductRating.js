import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { generateCSS } from "../../../../utils/functions";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../../shared/cafUploadedIcon";
import {
  isPostPrefixEnabled,
  isPostSuffixEnabled,
} from "../../settingTabContent/ModuleContentData/shared/postModuleTier";

function renderAffixContent(settings, placement, svgContent, postData) {
  const affix = settings?.[placement];
  if (!affix) {
    return null;
  }

  if (affix.meta_type === "text" && affix.meta_text) {
    return parse(`${affix.meta_text}`);
  }

  if (affix.meta_type === "review_count") {
    const rawCount = postData?.rating_data?.review_count;
    if (rawCount === null || rawCount === undefined || rawCount === "") {
      return null;
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

/**
 * Stars display:
 * - 3 / 3.0 → 3 full stars
 * - fractional .1–.4 → floor full + fa-star-half
 * - fractional .5–.9 → floor full + fa-star-half-alt
 */
function resolveStarDisplayParts(averageRating) {
  const numeric = Number.parseFloat(String(averageRating ?? "").trim());
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { fullStars: 0, halfClass: "" };
  }

  const fullStars = Math.floor(numeric);
  const fraction = Number((numeric - fullStars).toFixed(10));

  if (fraction <= 0) {
    return { fullStars, halfClass: "" };
  }

  if (fraction >= 0.1 && fraction < 0.5) {
    return { fullStars, halfClass: "fas fa-star-half" };
  }

  if (fraction >= 0.5) {
    return { fullStars, halfClass: "fas fa-star-half-alt" };
  }

  // 0 < fraction < 0.1 → treat as whole (no half)
  return { fullStars, halfClass: "" };
}

function renderRatingContent(settings, postData) {
  const averageRating = resolveAverageRating(postData);
  const ratingDisplay = settings?.rating_display || "stars";

  if (ratingDisplay === "average_value") {
    const numeric = Number.parseFloat(String(averageRating ?? "").trim());
    if (!Number.isFinite(numeric) || numeric === 0) {
      return null;
    }
    return averageRating;
  }

  // Default: stars
  const { fullStars, halfClass } = resolveStarDisplayParts(averageRating);
  if (fullStars <= 0 && !halfClass) {
    return null;
  }

  const stars = [];
  for (let index = 0; index < fullStars; index += 1) {
    stars.push(
      <i
        key={`caf-rating-star-${index}`}
        className="fas fa-star caf-rating-star filter-before-icon"
      ></i>,
    );
  }
  if (halfClass) {
    stars.push(
      <i
        key="caf-rating-star-half"
        className={`${halfClass} caf-rating-star filter-before-icon`}
      ></i>,
    );
  }

  return stars;
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

  const hideAffixForZeroRating =
    hideAffixWhenZeroRating && hasZeroAverageRating(postData);

  const prefixContent =
    !hideAffixForZeroRating && isPostPrefixEnabled(settings)
      ? renderAffixContent(settings, "prefix", svgPrefixContent, postData)
      : null;
  const suffixContent =
    !hideAffixForZeroRating && isPostSuffixEnabled(settings)
      ? renderAffixContent(settings, "suffix", svgSuffixContent, postData)
      : null;
  const showPrefix = Boolean(prefixContent);
  const showSuffix = Boolean(suffixContent);

  const ratingNode = (
    <div className="caf-builder-rating-value">
      {renderRatingContent(settings, postData)}
    </div>
  );

  const moduleStyles = `
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} {
      ${generateCSS(styleDefault, "default", selectedDevice, settings, postData)}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover {
      ${generateCSS(styleDefault, "hover", selectedDevice, settings, postData)}
    }
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
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col {
      ${generateCSS(
        styleDefault?.prefix,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col:hover {
      ${generateCSS(
        styleDefault?.prefix,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col {
      ${generateCSS(
        styleDefault?.suffix,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col:hover {
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
