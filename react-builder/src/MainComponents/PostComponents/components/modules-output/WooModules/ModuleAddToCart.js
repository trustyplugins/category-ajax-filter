import React, { useEffect, useMemo, useRef, useState } from "react";
import ModuleButton from "../ModuleButton";
import { useWooProductCardVariation } from "../../woocommerce/WooProductCardVariationContext";
import { canUseFeature } from "../../../../../tier/capabilities";

import { isCafUploadedIconUrl, isCafSvgIconUrl } from "../../../../shared/cafUploadedIcon";
const BUTTON_TEXT_BY_TYPE_DEFAULTS = {
  simple: "Add to cart",
  variable: "Select options",
  grouped: "View products",
  external: "Buy product",
  subscription: "Subscribe",
};

const DEFAULT_AFTER_ATC_TEXT = "Added";
const PREVIEW_LOADER_MS = 600;
const PREVIEW_MESSAGE_MS = 2000;

function resolveProductTypeBucket(productType) {
  const type = String(productType || "simple");
  if (type === "grouped") return "grouped";
  if (type === "external" || type === "affiliate") return "external";
  if (type === "subscription" || type === "variable-subscription") {
    return "subscription";
  }
  if (type.includes("variable")) return "variable";
  return "simple";
}

function resolveAddToCartButtonText(settings, product) {
  const mode = settings?.button_text_mode || "woo_default";
  if (mode === "icon_only") {
    return "";
  }
  if (mode === "custom") {
    return String(settings?.changeButtonValue ?? "").trim() || "Add to cart";
  }
  if (mode === "by_product_type") {
    const bucket = resolveProductTypeBucket(product?.product_type);
    const byType =
      settings?.button_text_by_type &&
      typeof settings.button_text_by_type === "object"
        ? settings.button_text_by_type
        : {};
    return (
      String(byType[bucket] ?? "").trim() ||
      BUTTON_TEXT_BY_TYPE_DEFAULTS[bucket] ||
      String(product?.add_to_cart_text || "").trim() ||
      "Add to cart"
    );
  }
  return String(product?.add_to_cart_text || "").trim() || "Add to cart";
}

function resolveButtonIconSettings(settings) {
  const icons = settings?.button_icon?.icons;
  if (icons && typeof icons === "object") {
    return {
      visibility: icons.visibility !== false,
      type: icons.type || "icon",
      icon: icons.icon || "fas fa-shopping-cart",
      position: icons.position || "before-button",
    };
  }
  return {
    visibility: true,
    type: "icon",
    icon: "fas fa-shopping-cart",
    position: "before-button",
  };
}

function resolveAfterAtcText(settings) {
  const next = String(settings?.after_atc_text ?? "").trim();
  return next !== "" ? next : DEFAULT_AFTER_ATC_TEXT;
}

/**
 * Add to Cart preview — reuses Post Button UI/CSS with Woo ATC text/url.
 * Icon Only mode maps the dedicated button icon into the button value area.
 */
function ModuleAddToCart(props) {
  const { postData, settings } = props;
  const variationCtx = useWooProductCardVariation();
  const product =
    postData?.product && typeof postData.product === "object"
      ? postData.product
      : {};
  const isIconOnly =
    canUseFeature("label_show_icon") &&
    settings?.button_text_mode === "icon_only";
  const buttonIcon = useMemo(
    () => resolveButtonIconSettings(settings),
    [settings?.button_icon],
  );
  const [svgIconContent, setSvgIconContent] = useState(null);
  // null | "loading" | custom message string (ajax feedback in layout preview)
  const [feedbackLabel, setFeedbackLabel] = useState(null);
  const feedbackTimersRef = useRef([]);

  const clearFeedbackTimers = () => {
    feedbackTimersRef.current.forEach((id) => clearTimeout(id));
    feedbackTimersRef.current = [];
  };

  useEffect(() => () => clearFeedbackTimers(), []);

  const buttonText = useMemo(
    () => resolveAddToCartButtonText(settings, product),
    [
      settings?.button_text_mode,
      settings?.changeButtonValue,
      settings?.button_text_by_type,
      product.add_to_cart_text,
      product.product_type,
    ],
  );

  const variationAtcState = useMemo(() => {
    if (!variationCtx?.matrix) {
      return null;
    }
    const labels = variationCtx.matrix.labels || {};
    if (!variationCtx.isComplete) {
      return {
        label: labels.select_options || "Select options",
        disabled: true,
        ready: false,
        stateClass: "",
      };
    }
    if (!variationCtx.resolvedVariation) {
      return {
        label: labels.unavailable || "Unavailable",
        disabled: true,
        ready: false,
        stateClass: "caf-variation-unavailable",
      };
    }
    if (
      !variationCtx.resolvedVariation.is_in_stock ||
      !variationCtx.resolvedVariation.is_purchasable
    ) {
      return {
        label: labels.out_of_stock || "Out of stock",
        disabled: true,
        ready: false,
        stateClass: "caf-variation-outofstock",
      };
    }
    return {
      label: null,
      disabled: false,
      ready: true,
      stateClass: "caf-variation-ready",
    };
  }, [variationCtx]);

  const effectiveButtonText = useMemo(() => {
    if (variationAtcState?.label) {
      return variationAtcState.label;
    }
    return buttonText;
  }, [variationAtcState, buttonText]);

  const previewUrl = useMemo(() => {
    const behaviour =
      canUseFeature("woo_ajax_add_to_cart") &&
      settings?.atc_behaviour === "ajax"
        ? "ajax"
        : "product_page";
    if (behaviour === "product_page") {
      return postData?.url || product.add_to_cart_url || "#";
    }
    return product.add_to_cart_url || postData?.url || "#";
  }, [settings?.atc_behaviour, postData?.url, product.add_to_cart_url]);

  useEffect(() => {
    const iconUrl = buttonIcon?.icon?.url;
    if (
      !isIconOnly ||
      buttonIcon?.type !== "svg" ||
      !iconUrl ||
      !isCafSvgIconUrl(iconUrl)
    ) {
      setSvgIconContent(null);
      return;
    }

    let cancelled = false;
    fetch(iconUrl)
      .then((res) => res.text())
      .then((svgText) => {
        if (cancelled) return;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (svg) {
          const iconColor = buttonIcon?.icon?.color || "currentColor";
          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });
          setSvgIconContent(svg.outerHTML);
        }
      })
      .catch(() => {
        if (!cancelled) setSvgIconContent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isIconOnly, buttonIcon]);

  const iconOnlyLabel = useMemo(() => {
    if (!isIconOnly) {
      return null;
    }
    if (
      buttonIcon.visibility !== false &&
      buttonIcon.type === "icon" &&
      typeof buttonIcon.icon === "string" &&
      buttonIcon.icon
    ) {
      return (
        <i
          data-icon-name={buttonIcon.icon}
          className={buttonIcon.icon}
          aria-hidden="true"
        />
      );
    }
    if (
      buttonIcon.visibility !== false &&
      buttonIcon.type === "svg" &&
      buttonIcon.icon?.url &&
      isCafSvgIconUrl(buttonIcon.icon.url) &&
      svgIconContent
    ) {
      return (
        <span
          className="svg-dynamic"
          dangerouslySetInnerHTML={{ __html: svgIconContent }}
        />
      );
    }
    if (
      buttonIcon.visibility !== false &&
      buttonIcon.type === "svg" &&
      buttonIcon.icon?.url
    ) {
      return (
        <img
          className="svg-dynamic"
          src={buttonIcon.icon.url}
          alt=""
          style={{ width: "20px" }}
        />
      );
    }
    return <i className="fas fa-shopping-cart" aria-hidden="true" />;
  }, [isIconOnly, buttonIcon, svgIconContent]);

  const resolvedLabel = useMemo(() => {
    if (feedbackLabel === "loading") {
      return (
        <i
          className="fas fa-spinner fa-spin caf-woo-atc-spinner"
          aria-hidden="true"
        />
      );
    }
    if (typeof feedbackLabel === "string") {
      return feedbackLabel;
    }
    if (isIconOnly) {
      return iconOnlyLabel || "";
    }
    return effectiveButtonText;
  }, [feedbackLabel, isIconOnly, iconOnlyLabel, effectiveButtonText]);

  const handleAtcPreviewClick = () => {
    if (variationAtcState && !variationAtcState.ready) {
      return;
    }
    if (
      !canUseFeature("woo_ajax_add_to_cart") ||
      settings?.atc_behaviour !== "ajax"
    ) {
      return;
    }
    clearFeedbackTimers();
    setFeedbackLabel("loading");

    const loaderTimer = setTimeout(() => {
      if (settings?.after_atc === "custom_text") {
        setFeedbackLabel(resolveAfterAtcText(settings));
        const restoreTimer = setTimeout(() => {
          setFeedbackLabel(null);
        }, PREVIEW_MESSAGE_MS);
        feedbackTimersRef.current.push(restoreTimer);
      } else {
        setFeedbackLabel(null);
      }
    }, PREVIEW_LOADER_MS);
    feedbackTimersRef.current.push(loaderTimer);
  };

  const patchedSettings = useMemo(() => {
    const behaviour =
      canUseFeature("woo_ajax_add_to_cart") &&
      settings?.atc_behaviour === "ajax"
        ? "ajax"
        : "product_page";
    const base = {
      ...settings,
      atc_behaviour: behaviour,
      changeButtonValue: resolvedLabel,
      link: {
        ...(settings?.link || {}),
        visibility: true,
        type: "post-url",
        target: settings?.link?.target || "same-tab",
      },
    };

    // Prefix/suffix stays locked for Add to Cart on free.
    if (!canUseFeature("post_prefix_suffix") || isIconOnly) {
      return {
        ...base,
        prefix: {
          ...(settings?.prefix || {}),
          is_enable: "false",
        },
        suffix: {
          ...(settings?.suffix || {}),
          is_enable: "false",
        },
      };
    }

    return base;
  }, [settings, resolvedLabel, isIconOnly]);

  const patchedPostData = useMemo(
    () => ({
      ...postData,
      url: previewUrl,
    }),
    [postData, previewUrl],
  );

  return (
    <ModuleButton
      {...props}
      postData={patchedPostData}
      settings={patchedSettings}
      extraRootClassName={`caf-module-button${
        variationCtx?.matrix ? " caf-woo-variation-atc" : ""
      }${
        variationAtcState?.stateClass ? ` ${variationAtcState.stateClass}` : ""
      }${feedbackLabel === "loading" ? " caf-woo-atc-loading" : ""}`}
      onLinkClick={handleAtcPreviewClick}
    />
  );
}

export default ModuleAddToCart;
