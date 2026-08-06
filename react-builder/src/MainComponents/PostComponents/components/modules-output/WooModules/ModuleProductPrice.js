import React, { useEffect, useMemo, useState } from "react";
import parse from "html-react-parser";
import { generateCSS } from "../../../../utils/functions";
import { canUseFeature } from "../../../../../tier/capabilities";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../../shared/cafUploadedIcon";
import {
  useWooProductCardVariation,
  formatVariationPriceText,
  resolveVariationRegularPriceAffix,
  shouldShowVariationRegularPriceAffix,
} from "../../woocommerce/WooProductCardVariationContext";

function decodeHtmlEntities(value) {
  const raw = String(value ?? "");
  if (!raw) {
    return "";
  }
  if (typeof document === "undefined") {
    return raw;
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = raw;
  return textarea.value;
}

function isEmptyPriceAmount(amount) {
  return (
    amount === null ||
    amount === undefined ||
    amount === "" ||
    typeof amount === "boolean"
  );
}

function resolveProductPriceByKey(postData, priceKey) {
  const priceData = postData?.price_data;
  if (!priceData || typeof priceData !== "object") {
    return "";
  }

  const amount = priceData?.[priceKey];
  if (isEmptyPriceAmount(amount)) {
    return "";
  }

  const currency = decodeHtmlEntities(priceData.currency || "");
  return `${currency}${amount}`;
}

function resolveProductRegularPrice(postData) {
  return resolveProductPriceByKey(postData, "regular_price");
}

function resolveProductSalePrice(postData) {
  return resolveProductPriceByKey(postData, "sale_price");
}

function isVariableOrGroupedProduct(postData) {
  const productType = postData?.price_data?.product_type;
  return (
    productType === "variable" ||
    productType === "variable-subscription" ||
    productType === "grouped"
  );
}

function isVariableProduct(postData) {
  return postData?.price_data?.product_type === "variable";
}

function isGroupedProduct(postData) {
  return postData?.price_data?.product_type === "grouped";
}

function isSimpleProduct(postData) {
  return postData?.price_data?.product_type === "simple";
}

// subscription uses the same path as simple (sale → regular, no show_price split).
function isSimpleLikeProduct(postData) {
  if (isSubscriptionProduct(postData)) {
    return true;
  }
  return !isVariableOrGroupedProduct(postData);
}

function shouldShowAffixTextByVisibility(postData, textVisibility) {
  const visibility = textVisibility || "all";
  if (visibility === "all") {
    return true;
  }
  if (visibility === "simple_products") {
    return isSimpleProduct(postData);
  }
  if (visibility === "variable_products") {
    return isVariableProduct(postData);
  }
  if (visibility === "grouped_products") {
    return isGroupedProduct(postData);
  }
  return true;
}

function isVariableSubscriptionProduct(postData) {
  return postData?.price_data?.product_type === "variable-subscription";
}

function isSubscriptionProduct(postData) {
  return postData?.price_data?.product_type === "subscription";
}

function getPeriodUnitLabels(period) {
  const periodKey = String(period ?? "")
    .trim()
    .toLowerCase();
  const map = {
    day: ["Day", "Days"],
    week: ["Week", "Weeks"],
    month: ["Month", "Months"],
    year: ["Year", "Years"],
  };
  if (map[periodKey]) {
    return map[periodKey];
  }
  const fallback = periodKey.charAt(0).toUpperCase() + periodKey.slice(1);
  return [fallback, `${fallback}s`];
}

function formatSubscriptionPeriodPhrase(interval, period) {
  const count = Number.parseInt(String(interval ?? "").trim(), 10);
  const periodKey = String(period ?? "")
    .trim()
    .toLowerCase();
  if (!Number.isFinite(count) || count < 1 || !periodKey) {
    return "";
  }
  const [singular, plural] = getPeriodUnitLabels(periodKey);
  const unit = count === 1 ? singular : plural;
  return `${count} ${unit}`;
}

function resolveVariableSubscriptionPeriodLabel(priceData, showPrice) {
  const minInterval = priceData?.min_subscription_period_interval;
  const maxInterval = priceData?.max_subscription_period_interval;
  const minPeriod = priceData?.min_subscription_period;
  const maxPeriod = priceData?.max_subscription_period;

  if (showPrice === "highest_price") {
    return formatSubscriptionPeriodPhrase(maxInterval, maxPeriod);
  }
  if (showPrice === "lowest_price") {
    return formatSubscriptionPeriodPhrase(minInterval, minPeriod);
  }

  const minLabel = formatSubscriptionPeriodPhrase(minInterval, minPeriod);
  const maxLabel = formatSubscriptionPeriodPhrase(maxInterval, maxPeriod);
  if (!minLabel) {
    return maxLabel;
  }
  if (!maxLabel || minLabel === maxLabel) {
    return minLabel;
  }

  const minPeriodKey = String(minPeriod ?? "")
    .trim()
    .toLowerCase();
  const maxPeriodKey = String(maxPeriod ?? "")
    .trim()
    .toLowerCase();
  const minCount = Number.parseInt(String(minInterval ?? "").trim(), 10);
  const maxCount = Number.parseInt(String(maxInterval ?? "").trim(), 10);

  if (
    minPeriodKey &&
    minPeriodKey === maxPeriodKey &&
    Number.isFinite(minCount) &&
    Number.isFinite(maxCount) &&
    minCount > 0 &&
    maxCount > 0
  ) {
    const [singular, plural] = getPeriodUnitLabels(minPeriodKey);
    const unit = minCount === 1 && maxCount === 1 ? singular : plural;
    return `${minCount}-${maxCount} ${unit}`;
  }

  return `${minLabel} - ${maxLabel}`;
}

function resolveSubscriptionPeriodLabel(postData, settings) {
  const priceData = postData?.price_data;
  if (!priceData || typeof priceData !== "object") {
    return "";
  }

  if (isSubscriptionProduct(postData)) {
    return formatSubscriptionPeriodPhrase(
      priceData.subscription_period_interval,
      priceData.subscription_period,
    );
  }

  if (isVariableSubscriptionProduct(postData)) {
    const showPrice = settings?.show_price || "default";
    return resolveVariableSubscriptionPeriodLabel(priceData, showPrice);
  }

  return "";
}

function shouldAppendSubscriptionPeriod(postData) {
  return (
    isVariableSubscriptionProduct(postData) || isSubscriptionProduct(postData)
  );
}

function appendSubscriptionPeriodToPrice(priceText, postData, settings) {
  if (!priceText || !shouldAppendSubscriptionPeriod(postData)) {
    return priceText;
  }

  const periodLabel = resolveSubscriptionPeriodLabel(postData, settings);
  if (!periodLabel) {
    return priceText;
  }

  return `${priceText} / ${periodLabel}`;
}

function getMainPriceAmountRaw(postData) {
  const priceData = postData?.price_data;
  if (!priceData || typeof priceData !== "object") {
    return "";
  }

  const saleAmount = priceData.sale_price;
  if (!isEmptyPriceAmount(saleAmount)) {
    return String(saleAmount);
  }

  const regularAmount = priceData.regular_price;
  if (!isEmptyPriceAmount(regularAmount)) {
    return String(regularAmount);
  }

  return "";
}

function splitPriceRangeAmount(amount) {
  const parts = String(amount ?? "")
    .split("-")
    .map((part) => part.trim())
    .filter((part) => part !== "");

  if (parts.length === 0) {
    return { low: "", high: "", isRange: false };
  }

  if (parts.length === 1) {
    return { low: parts[0], high: parts[0], isRange: false };
  }

  return {
    low: parts[0],
    high: parts[parts.length - 1],
    isRange: true,
  };
}

function formatAmountByShowPrice(amount, currency, showPrice) {
  if (!amount) {
    return "";
  }

  const { low, high, isRange } = splitPriceRangeAmount(amount);

  if (showPrice === "lowest_price") {
    return low ? `${currency}${low}` : "";
  }

  if (showPrice === "highest_price") {
    return high ? `${currency}${high}` : "";
  }

  // default
  if (isRange && low && high && low !== high) {
    return `${currency}${low}-${currency}${high}`;
  }

  return `${currency}${amount}`;
}

function resolveMainProductPrice(postData, settings) {
  // Simple + subscription: unchanged sale → regular flow.
  if (isSimpleLikeProduct(postData)) {
    const salePrice = resolveProductSalePrice(postData);
    if (salePrice) {
      return salePrice;
    }
    return resolveProductRegularPrice(postData);
  }

  // Variable / variable-subscription / grouped: apply show_price on main price value.
  const amount = getMainPriceAmountRaw(postData);
  if (!amount) {
    return "";
  }

  const currency = decodeHtmlEntities(postData?.price_data?.currency || "");
  const showPrice = settings?.show_price || "default";
  return formatAmountByShowPrice(amount, currency, showPrice);
}

function resolveAffixRegularPrice(postData, settings) {
  // Simple + subscription: full regular price as before.
  if (isSimpleLikeProduct(postData)) {
    return resolveProductRegularPrice(postData);
  }

  // Variable / variable-subscription / grouped: same show_price logic on regular_price amount.
  const amount = postData?.price_data?.regular_price;
  if (isEmptyPriceAmount(amount)) {
    return "";
  }

  const currency = decodeHtmlEntities(postData?.price_data?.currency || "");
  const showPrice = settings?.show_price || "default";
  return formatAmountByShowPrice(String(amount), currency, showPrice);
}

function shouldShowRegularPriceAffix(
  postData,
  hideDuplicateRegularPrice,
  settings,
  mainPriceText,
) {
  if (!hideDuplicateRegularPrice) {
    return true;
  }
  // Preview: hide when main already shows regular (no sale).
  if (!resolveProductSalePrice(postData)) {
    return false;
  }
  // Preview: hide when formatted affix equals main price (e.g. lowest/highest).
  const affixPrice = resolveAffixRegularPrice(postData, settings);
  if (affixPrice && mainPriceText && affixPrice === mainPriceText) {
    return false;
  }
  return true;
}

function resolveAffixRegularPriceForRender(
  postData,
  settings,
  variationCtx,
  mainPriceText,
) {
  if (
    variationCtx?.isComplete &&
    variationCtx?.resolvedVariation?.price
  ) {
    const showPrice = settings?.show_price || "default";
    return resolveVariationRegularPriceAffix(
      variationCtx.resolvedVariation.price,
      showPrice,
    );
  }

  return resolveAffixRegularPrice(postData, settings);
}

function shouldShowRegularPriceAffixForRender(
  postData,
  hideDuplicateRegularPrice,
  settings,
  mainPriceText,
  variationCtx,
) {
  if (
    variationCtx?.isComplete &&
    variationCtx?.resolvedVariation?.price
  ) {
    const showPrice = settings?.show_price || "default";
    const mainText =
      mainPriceText ||
      formatVariationPriceText(variationCtx.resolvedVariation.price, showPrice);
    return shouldShowVariationRegularPriceAffix(
      variationCtx.resolvedVariation.price,
      mainText,
    );
  }

  return shouldShowRegularPriceAffix(
    postData,
    hideDuplicateRegularPrice,
    settings,
    mainPriceText,
  );
}

function renderAffixContent(
  settings,
  placement,
  svgContent,
  postData,
  hideDuplicateRegularPrice,
  mainPriceText,
  applyTextVisibilityFilter,
  variationCtx = null,
) {
  const affix = settings?.[placement];
  if (!affix) {
    return null;
  }

  if (affix.meta_type === "regular_price") {
    if (
      !shouldShowRegularPriceAffixForRender(
        postData,
        hideDuplicateRegularPrice,
        settings,
        mainPriceText,
        variationCtx,
      )
    ) {
      return null;
    }
    const regularPrice = resolveAffixRegularPriceForRender(
      postData,
      settings,
      variationCtx,
      mainPriceText,
    );
    return regularPrice ? (
      <span className="caf-builder-regular-price-affix">{regularPrice}</span>
    ) : null;
  }

  if (affix.meta_type === "text" && affix.meta_text) {
    // Preview (screen 3) only: honor text_visibility by product type.
    if (
      applyTextVisibilityFilter &&
      !shouldShowAffixTextByVisibility(postData, affix.text_visibility)
    ) {
      return null;
    }
    return parse(`${affix.meta_text}`);
  }

  if (affix.meta_type === "icon" && !canUseFeature("label_show_icon")) {
    return null;
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

function ModuleProductPrice({
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
  hideDuplicateRegularPrice = false,
  applyTextVisibilityFilter = false,
}) {
  const variationCtx = useWooProductCardVariation();
  const showPrice = settings?.show_price || "default";
  const priceText = useMemo(() => {
    if (
      variationCtx?.matrix &&
      variationCtx.isComplete &&
      variationCtx.resolvedVariation?.price
    ) {
      return formatVariationPriceText(
        variationCtx.resolvedVariation.price,
        showPrice,
      );
    }
    return resolveMainProductPrice(postData, settings);
  }, [variationCtx, postData, settings, showPrice]);
  const displayPriceText = appendSubscriptionPeriodToPrice(
    priceText,
    postData,
    settings,
  );
  const priceNode = (
    <div className="caf-builder-price-value price">
      {displayPriceText || ""}
    </div>
  );

  const [svgPrefixContent, setSvgPrefixContent] = useState(null);
  const [svgSuffixContent, setSvgSuffixContent] = useState(null);

  const dynWrapper =
    styleDefault?.[selectedDevice]?.default?.justifyContent ?? "flex-start";
  const customClass = settings?.custom_class || "";
  const visibility = settings?.visibility || {};
  const hideClass =
    visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  const isActive =
    indexes?.type === "module" &&
    indexes?.rowindex === rowindex &&
    indexes?.columnindex === columnindex &&
    indexes?.moduleindex === moduleindex;
  const moduleClassName = `caf-builder-module-main caf-module-${
    module.key
  } caf-module-${moduleindex} ${customClass} ${
    isActive ? "active" : ""
  } ${hideClass}`;

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

  const handleSelect = (event) => {
    if (event) {
      event.preventDefault();
    }
    setIndexes({
      type: "module",
      rowindex,
      columnindex,
      moduleindex,
      module,
    });
  };

  // Prefix/suffix stays available for product price on free (icon affixes stay Pro).
  const prefixContent =
    String(settings?.prefix?.is_enable ?? "") === "true"
      ? renderAffixContent(
          settings,
          "prefix",
          svgPrefixContent,
          postData,
          hideDuplicateRegularPrice,
          priceText,
          applyTextVisibilityFilter,
          variationCtx,
        )
      : null;
  const suffixContent =
    String(settings?.suffix?.is_enable ?? "") === "true"
      ? renderAffixContent(
          settings,
          "suffix",
          svgSuffixContent,
          postData,
          hideDuplicateRegularPrice,
          priceText,
          applyTextVisibilityFilter,
          variationCtx,
        )
      : null;
  const showPrefix = Boolean(prefixContent);
  const showSuffix = Boolean(suffixContent);

  const mediaContent = (
    <>
      {showPrefix && (
        <div className="caf-builder-prefix-col">{prefixContent}</div>
      )}

      {showSuffix ? (
        showPrefix ? (
          <div
            className={`caf-builder-price-suffix-wrapper caf-layout-${dynWrapper}`}
          >
            {priceNode}
            <div className="caf-builder-suffix-col">{suffixContent}</div>
          </div>
        ) : (
          <>
            {priceNode}
            <div className="caf-builder-suffix-col">{suffixContent}</div>
          </>
        )
      ) : (
        priceNode
      )}
    </>
  );

  const moduleStyles = `
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} {
      ${generateCSS(
        styleDefault,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover {
      ${generateCSS(styleDefault, "hover", selectedDevice, settings, postData)}
    }
    .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-price-suffix-wrapper{
      ${generateCSS(
        styleDefault?.meta,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-price-suffix-wrapper:hover{
      ${generateCSS(
        styleDefault?.meta,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col{
      ${generateCSS(
        styleDefault?.prefix,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col:hover{
      ${generateCSS(
        styleDefault?.prefix,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col{
      ${generateCSS(
        styleDefault?.suffix,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col:hover{
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
      {mediaContent}
      <style>{moduleStyles}</style>
    </div>
  );
}

export default ModuleProductPrice;
