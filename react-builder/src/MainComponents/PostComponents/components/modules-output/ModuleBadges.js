import React, { useEffect, useMemo, useState } from "react";
import { generateCSS } from "../../../utils/functions";
import parse from "html-react-parser";
import {
  isPostPrefixEnabled,
  isPostSuffixEnabled,
} from "../settingTabContent/ModuleContentData/shared/postModuleTier";
import {
  resolveBadgeTypeForTier,
  resolveBadgeValue,
} from "../woocommerce/badgeTypeOptions";
import { useWooProductCardVariation } from "../woocommerce/WooProductCardVariationContext";

import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
function ModuleBadges({
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
  extraRootClassName = "",
  isBuilderPreview = true,
  selectType = "",
}) {
  const [svgPrefixContent, setSvgPrefixContent] = useState(null);
  const [svgSuffixContent, setSvgSuffixContent] = useState(null);
  const variationCtx = useWooProductCardVariation();

  const isLayoutPreview = selectType === "post-preview";
  const postId = postData?.id ?? postData?.value ?? 0;
  const moduleScope = isLayoutPreview
    ? `.caf-builder-preview-single-post-item.post-id-${postId} .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}`
    : `.caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}`;

  const badgeType = useMemo(
    () => resolveBadgeTypeForTier(settings?.badge_type),
    [settings?.badge_type],
  );

  const variationStock = useMemo(() => {
    if (badgeType !== "stock_quantity") {
      return null;
    }
    if (!variationCtx?.matrix) {
      return null;
    }
    // Incomplete selection: do not fall back to parent qty on variation cards.
    if (!variationCtx.isComplete || !variationCtx.resolvedVariation) {
      return {
        managing_stock: false,
        stock_quantity: null,
      };
    }
    return {
      managing_stock: Boolean(variationCtx.resolvedVariation.managing_stock),
      stock_quantity: variationCtx.resolvedVariation.stock_quantity ?? null,
    };
  }, [
    badgeType,
    variationCtx?.matrix,
    variationCtx?.isComplete,
    variationCtx?.resolvedVariation,
  ]);

  const variationPrice = useMemo(() => {
    if (badgeType !== "discount") {
      return null;
    }
    if (!variationCtx?.matrix) {
      return null;
    }
    if (!variationCtx.isComplete || !variationCtx.resolvedVariation?.price) {
      return {
        regular_price: "",
        sale_price: "",
        currency: postData?.price_data?.currency,
      };
    }
    const price = variationCtx.resolvedVariation.price;
    return {
      regular_price: price.regular_price,
      sale_price: price.sale_price,
      currency: price.currency ?? postData?.price_data?.currency,
    };
  }, [
    badgeType,
    variationCtx?.matrix,
    variationCtx?.isComplete,
    variationCtx?.resolvedVariation,
    postData?.price_data?.currency,
  ]);

  const badgeValue = useMemo(
    () =>
      resolveBadgeValue(
        postData,
        badgeType,
        isBuilderPreview,
        settings,
        variationStock,
        variationPrice,
      ),
    [
      postData,
      postData?.product,
      postData?.price_data,
      postData?.post_date,
      postData?.date_created,
      badgeType,
      isBuilderPreview,
      settings,
      settings?.badge_settings,
      variationStock,
      variationPrice,
    ],
  );

  const dynWrapper =
    styleDefault?.[selectedDevice]?.default?.justifyContent ?? "flex-start";

  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  if (extraRootClassName) {
    custom_class = `${custom_class} ${extraRootClassName}`.trim();
  }

  const visibility = settings?.visibility || {};
  const hideClass =
    visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

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
  }, [
    settings?.prefix?.icons?.icon?.url,
    settings?.prefix?.icons?.icon?.color,
  ]);

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
  }, [
    settings?.suffix?.icons?.icon?.url,
    settings?.suffix?.icons?.icon?.color,
  ]);

  if (!badgeValue) {
    return null;
  }

  const renderPrefix = () => {
    if (!isPostPrefixEnabled(settings)) {
      return null;
    }

    return (
      <div className="caf-builder-prefix-col">
        {settings?.prefix?.meta_type === "text" &&
          parse(`${settings?.prefix?.meta_text}`)}
        {settings?.prefix?.meta_type === "icon" &&
          settings?.prefix?.icons?.visibility &&
          settings?.prefix?.icons?.type === "icon" &&
          settings?.prefix?.icons?.icon !== "" && (
            <i
              data-icon-name={settings?.prefix?.icons?.icon}
              className={settings?.prefix?.icons?.icon}
            ></i>
          )}
        {settings?.prefix?.meta_type === "icon" &&
        settings?.prefix?.icons?.visibility &&
        settings?.prefix?.icons?.type === "svg" &&
        settings?.prefix?.icons?.icon?.url !== "" &&
        (isCafSvgIconUrl(settings?.prefix?.icons?.icon?.url) &&
                    svgPrefixContent ? (
                      <span
            className="svg-dynamic"
            dangerouslySetInnerHTML={{ __html: svgPrefixContent }}
          />
                    ) : isCafUploadedIconUrl(settings?.prefix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.prefix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
      </div>
    );
  };

  const renderSuffix = () => (
    <div className="caf-builder-suffix-col">
      {settings?.suffix?.meta_type === "text" &&
        settings?.suffix?.meta_text &&
        parse(`${settings?.suffix?.meta_text}`)}

      {settings?.suffix?.meta_type === "icon" &&
        settings?.suffix?.icons?.visibility &&
        settings?.suffix?.icons?.type === "icon" &&
        settings?.suffix?.icons?.icon !== "" && (
          <i
            data-icon-name={settings?.suffix?.icons?.icon}
            className={settings?.suffix?.icons?.icon}
          ></i>
        )}
      {settings?.suffix?.meta_type === "icon" &&
      settings?.suffix?.icons?.visibility &&
      settings?.suffix?.icons?.type === "svg" &&
      settings?.suffix?.icons?.icon?.url !== "" &&
      (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
          className="svg-dynamic"
          dangerouslySetInnerHTML={{
            __html: svgSuffixContent,
          }}
        />
                    ) : isCafUploadedIconUrl(settings?.suffix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.suffix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
    </div>
  );

  const renderBadgeValue = () => (
    <div className="caf-builder-badges-value">{badgeValue}</div>
  );

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
        data-badge-type={badgeType}
        data-module-type="badges"
      >
        {renderPrefix()}

        {isPostSuffixEnabled(settings) ? (
          isPostPrefixEnabled(settings) ? (
            <div
              className={`caf-builder-badges-suffix-wrapper caf-layout-${dynWrapper}`}
            >
              {renderBadgeValue()}
              {renderSuffix()}
            </div>
          ) : (
            <>
              {renderBadgeValue()}
              {renderSuffix()}
            </>
          )
        ) : isPostPrefixEnabled(settings) ? (
          renderBadgeValue()
        ) : (
          badgeValue
        )}

        <style>
          {`
            ${moduleScope}{
              ${generateCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
            }
            ${moduleScope}:hover{
              ${generateCSS(
                styleDefault,
                "hover",
                selectedDevice,
                settings,
                postData,
              )}
            }
            ${moduleScope} .caf-builder-badges-suffix-wrapper{
              ${generateCSS(
                styleDefault?.meta,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
            }
            ${moduleScope} .caf-builder-badges-suffix-wrapper:hover{
              ${generateCSS(
                styleDefault?.meta,
                "hover",
                selectedDevice,
                settings,
                postData,
              )}
            }
            ${moduleScope} .caf-builder-prefix-col{
              ${generateCSS(
                styleDefault?.prefix,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
            }
            ${moduleScope} .caf-builder-prefix-col:hover{
              ${generateCSS(
                styleDefault?.prefix,
                "hover",
                selectedDevice,
                settings,
                postData,
              )}
            }
            ${moduleScope} .caf-builder-suffix-col{
              ${generateCSS(
                styleDefault?.suffix,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
            }
            ${moduleScope} .caf-builder-suffix-col:hover{
              ${generateCSS(
                styleDefault?.suffix,
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

export default ModuleBadges;
