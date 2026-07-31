import React from "react";
import { canUseFeature } from "../../../../tier/capabilities";

export const BADGE_TYPE_OPTIONS = [
  { label: "Sale", value: "sale" },
  { label: "Featured", value: "featured" },
  { label: "New", value: "new" },
  { label: "Stock Status Text", value: "stock_status_text" },
  { label: "Stock Quantity", value: "stock_quantity" },
  { label: "Discount", value: "discount" },
  { label: "Best Seller", value: "best_seller" },
];

export const BADGE_TYPE_DEFAULT = "sale";
export const FREE_BADGE_TYPE_DEFAULT = "new";
export const FREE_BADGE_TYPES = ["new", "sale"];

export function isFreeBadgeType(value) {
  return FREE_BADGE_TYPES.includes(value);
}

export const BADGE_DEFAULT_TEXT = {
  sale: "Sale",
  featured: "Featured",
  new: "New",
  stock_status_text: "In stock",
  stock_quantity: "12",
  discount: "17%",
  best_seller: "Best Seller",
};

export const BADGE_TEXT_SOURCE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Custom Text", value: "custom_text" },
];

export const BADGE_TEXT_SOURCE_DEFAULT = "default";

export const BADGE_NEW_CONDITION_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Days", value: "days" },
];

export const BADGE_NEW_CONDITION_DEFAULT = "default";
export const BADGE_NEW_DAYS_DEFAULT = 30;

export const BADGE_BEST_SELLER_MIN_SALE_MODE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Custom", value: "custom" },
];

export const BADGE_BEST_SELLER_MIN_SALE_MODE_DEFAULT = "default";
export const BADGE_BEST_SELLER_MIN_SALE_DEFAULT = 1;

export const BADGE_STOCK_STATUS_DISPLAY_OPTIONS = [
  { label: "Current Stock Status", value: "current" },
  { label: "In Stock Only", value: "in_stock" },
  { label: "Out of Stock Only", value: "out_of_stock" },
  { label: "Backorder Only", value: "backorder" },
];

export const BADGE_STOCK_STATUS_DISPLAY_DEFAULT = "current";

export const BADGE_STOCK_QUANTITY_THRESHOLD_DEFAULT = 5;

export const BADGE_DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Amount", value: "amount" },
];

export const BADGE_DISCOUNT_TYPE_DEFAULT = "percentage";

export const BADGE_STOCK_STATUS_DEFAULT_LABELS = {
  instock: "In stock",
  outofstock: "Out of stock",
  onbackorder: "On backorder",
};

const BADGE_TYPE_LABELS = BADGE_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function normalizeBadgeType(value) {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return BADGE_TYPE_LABELS[nextValue] ? nextValue : BADGE_TYPE_DEFAULT;
}

/**
 * Free tier allows New and Sale badges; all other types stay Pro.
 *
 * @param {string} value Raw badge type.
 * @returns {string}
 */
export function resolveBadgeTypeForTier(value) {
  const normalized = normalizeBadgeType(value);
  if (!canUseFeature("woo_badge_types") && !isFreeBadgeType(normalized)) {
    return FREE_BADGE_TYPE_DEFAULT;
  }
  return normalized;
}

/**
 * Badge type Select options with Pro locks for free tier.
 * On free, available types are listed first, then locked Pro types.
 *
 * @returns {Array<{label: *, value: string, disabled?: boolean}>}
 */
export function getBadgeTypeSelectOptions() {
  const locked = !canUseFeature("woo_badge_types");
  const mapped = BADGE_TYPE_OPTIONS.map((option) => {
    if (!locked || isFreeBadgeType(option.value)) {
      return option;
    }
    return {
      ...option,
      disabled: true,
      label: (
        <span>
          {option.label}{" "}
          <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
            Pro
          </span>
        </span>
      ),
    };
  });

  if (!locked) {
    return mapped;
  }

  const available = mapped.filter((option) => isFreeBadgeType(option.value));
  const proOnly = mapped.filter((option) => !isFreeBadgeType(option.value));
  return [...available, ...proOnly];
}

export function getBadgeTypeLabel(badgeType) {
  const normalized = normalizeBadgeType(badgeType);
  return BADGE_TYPE_LABELS[normalized] || BADGE_TYPE_LABELS[BADGE_TYPE_DEFAULT];
}

export function normalizeBadgeTextSource(value) {
  return value === "custom_text" ? "custom_text" : BADGE_TEXT_SOURCE_DEFAULT;
}

export function normalizeBadgeNewCondition(value) {
  return value === "days" ? "days" : BADGE_NEW_CONDITION_DEFAULT;
}

export function normalizeBadgeNewDays(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return BADGE_NEW_DAYS_DEFAULT;
  }
  return parsed;
}

export function resolveBadgeNewDays(settings) {
  const typeSettings = getBadgeTypeSettings(settings, "new");
  const condition = normalizeBadgeNewCondition(typeSettings?.condition);
  if (condition === "days") {
    return normalizeBadgeNewDays(typeSettings?.days);
  }
  return BADGE_NEW_DAYS_DEFAULT;
}

export function normalizeBadgeBestSellerMinSaleMode(value) {
  return value === "custom"
    ? "custom"
    : BADGE_BEST_SELLER_MIN_SALE_MODE_DEFAULT;
}

export function normalizeBadgeBestSellerMinSale(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return BADGE_BEST_SELLER_MIN_SALE_DEFAULT;
  }
  return parsed;
}

export function resolveBadgeBestSellerMinSale(settings) {
  const typeSettings = getBadgeTypeSettings(settings, "best_seller");
  const mode = normalizeBadgeBestSellerMinSaleMode(typeSettings?.min_sale);
  if (mode === "custom") {
    return normalizeBadgeBestSellerMinSale(typeSettings?.min_sale_count);
  }
  return BADGE_BEST_SELLER_MIN_SALE_DEFAULT;
}

export function normalizeBadgeStockStatusDisplay(value) {
  const allowed = BADGE_STOCK_STATUS_DISPLAY_OPTIONS.map((item) => item.value);
  return allowed.includes(value) ? value : BADGE_STOCK_STATUS_DISPLAY_DEFAULT;
}

export function isBadgeSettingEnabled(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function normalizeBadgeStockQuantityThreshold(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return BADGE_STOCK_QUANTITY_THRESHOLD_DEFAULT;
  }
  return parsed;
}

export function normalizeBadgeDiscountType(value) {
  return value === "amount" ? "amount" : BADGE_DISCOUNT_TYPE_DEFAULT;
}

export function getBadgeTypeSettings(settings, badgeType) {
  const type = normalizeBadgeType(badgeType);
  const source =
    settings?.badge_settings && typeof settings.badge_settings === "object"
      ? settings.badge_settings
      : {};
  return source[type] && typeof source[type] === "object" ? source[type] : {};
}

export function getBadgeDefaultText(badgeType) {
  const type = normalizeBadgeType(badgeType);
  return BADGE_DEFAULT_TEXT[type] || getBadgeTypeLabel(type);
}

const BADGE_TYPES_WITH_TEXT_SOURCE = new Set([
  "sale",
  "featured",
  "new",
  "stock_status_text",
  "best_seller",
]);

export function resolveBadgeTypeLabel(settings, badgeType) {
  const type = normalizeBadgeType(badgeType);
  const typeSettings = getBadgeTypeSettings(settings, type);
  const textSource = normalizeBadgeTextSource(typeSettings?.text_source);

  if (BADGE_TYPES_WITH_TEXT_SOURCE.has(type) && textSource === "custom_text") {
    const customText = String(typeSettings?.custom_text ?? "").trim();
    return customText !== "" ? customText : getBadgeDefaultText(type);
  }

  return getBadgeDefaultText(type);
}

function toNumber(value) {
  const parsed = Number.parseFloat(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function isScalarPriceValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.includes("-")) {
    return false;
  }
  return Number.isFinite(Number.parseFloat(raw));
}

function isVariableLikeProductType(product, priceData) {
  const type = String(
    product?.product_type ?? priceData?.product_type ?? "",
  ).trim();
  return (
    type === "variable" ||
    type === "variable-subscription" ||
    type === "grouped"
  );
}

function resolveProductStockStatusKey(product, priceData) {
  const status = String(product?.stock_status ?? priceData?.stock_status ?? "")
    .trim()
    .toLowerCase();
  if (
    status === "instock" ||
    status === "outofstock" ||
    status === "onbackorder"
  ) {
    return status;
  }
  if (product?.is_in_stock === false) {
    return "outofstock";
  }
  if (product?.is_in_stock === true) {
    return "instock";
  }
  return "";
}

function resolveStockStatusDefaultLabel(statusKey) {
  return BADGE_STOCK_STATUS_DEFAULT_LABELS[statusKey] || "";
}

function doesStockStatusMatchDisplay(statusKey, display) {
  const normalizedDisplay = normalizeBadgeStockStatusDisplay(display);
  if (!statusKey) {
    return false;
  }
  if (normalizedDisplay === "current") {
    return true;
  }
  if (normalizedDisplay === "in_stock") {
    return statusKey === "instock";
  }
  if (normalizedDisplay === "out_of_stock") {
    return statusKey === "outofstock";
  }
  if (normalizedDisplay === "backorder") {
    return statusKey === "onbackorder";
  }
  return false;
}

function resolveStockStatusBadgeText(
  product,
  priceData,
  settings,
  isBuilderPreview,
) {
  const typeSettings = getBadgeTypeSettings(settings, "stock_status_text");
  const display = normalizeBadgeStockStatusDisplay(typeSettings?.display);
  const textSource = normalizeBadgeTextSource(typeSettings?.text_source);
  const statusKey = resolveProductStockStatusKey(product, priceData);
  const matchesDisplay = doesStockStatusMatchDisplay(statusKey, display);

  if (!matchesDisplay && !isBuilderPreview) {
    return "";
  }

  if (textSource === "custom_text") {
    const customText = String(typeSettings?.custom_text ?? "").trim();
    if (customText !== "") {
      return customText;
    }
  }

  if (matchesDisplay && statusKey) {
    return resolveStockStatusDefaultLabel(statusKey);
  }

  if (isBuilderPreview) {
    if (display === "in_stock") {
      return BADGE_STOCK_STATUS_DEFAULT_LABELS.instock;
    }
    if (display === "out_of_stock") {
      return BADGE_STOCK_STATUS_DEFAULT_LABELS.outofstock;
    }
    if (display === "backorder") {
      return BADGE_STOCK_STATUS_DEFAULT_LABELS.onbackorder;
    }
    return (
      resolveStockStatusDefaultLabel(statusKey) ||
      BADGE_STOCK_STATUS_DEFAULT_LABELS.instock
    );
  }

  return "";
}

function resolveStockQuantityBadgeText(
  product,
  priceData,
  settings,
  isBuilderPreview,
  variationStock = null,
) {
  const typeSettings = getBadgeTypeSettings(settings, "stock_quantity");
  const thresholdEnabled = isBadgeSettingEnabled(
    typeSettings?.low_stock_threshold_enable,
  );
  const threshold = normalizeBadgeStockQuantityThreshold(
    typeSettings?.show_when_quantity,
  );

  const hasVariationStock =
    variationStock && typeof variationStock === "object";
  let rawQty = null;
  let managingStock = true;

  if (hasVariationStock) {
    managingStock = Boolean(variationStock.managing_stock);
    rawQty = variationStock.stock_quantity;
  } else {
    rawQty = product?.stock_quantity ?? priceData?.stock_quantity;
  }

  if (!managingStock) {
    return isBuilderPreview ? String(threshold) : "";
  }

  if (rawQty === null || rawQty === undefined || String(rawQty).trim() === "") {
    return isBuilderPreview ? String(threshold) : "";
  }

  const quantity = Number.parseInt(String(rawQty).trim(), 10);
  if (!Number.isFinite(quantity)) {
    return isBuilderPreview ? String(threshold) : "";
  }

  if (thresholdEnabled && quantity > threshold) {
    return isBuilderPreview ? String(quantity) : "";
  }

  return String(quantity);
}

function decodeCurrencySymbol(currency) {
  if (currency === null || currency === undefined) {
    return "$";
  }
  const raw = String(currency);
  if (typeof document === "undefined") {
    return raw || "$";
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = raw;
  return textarea.value || "$";
}

function formatDiscountAmountText(amount, currency) {
  const symbol = decodeCurrencySymbol(currency);
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const formatted = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/\.?0+$/, "");
  return `${symbol}${formatted}`;
}

function resolveDiscountText(
  product,
  priceData,
  settings,
  isBuilderPreview,
  variationPrice = null,
) {
  const typeSettings = getBadgeTypeSettings(settings, "discount");
  const discountType = normalizeBadgeDiscountType(typeSettings?.discount_type);
  const hasVariationPrice =
    variationPrice && typeof variationPrice === "object";

  // Variable/grouped parents expose price ranges — only resolve from a selected variation.
  if (
    !hasVariationPrice &&
    isVariableLikeProductType(product, priceData) &&
    !isBuilderPreview
  ) {
    return "";
  }

  const regularRaw = hasVariationPrice
    ? variationPrice.regular_price
    : priceData?.regular_price ?? product?.regular_price;
  const saleRaw = hasVariationPrice
    ? variationPrice.sale_price
    : priceData?.sale_price ?? product?.sale_price;

  if (
    !isBuilderPreview &&
    (!isScalarPriceValue(regularRaw) || !isScalarPriceValue(saleRaw))
  ) {
    return "";
  }

  const regular = toNumber(regularRaw);
  const sale = toNumber(saleRaw);
  const currency = hasVariationPrice
    ? variationPrice.currency ?? priceData?.currency
    : priceData?.currency;

  if (regular > 0 && sale > 0 && sale < regular) {
    if (discountType === "amount") {
      const saved = regular - sale;
      return saved > 0 ? formatDiscountAmountText(saved, currency) : "";
    }
    const percent = Math.round(((regular - sale) / regular) * 100);
    return percent > 0 ? `${percent}%` : "";
  }

  if (!isBuilderPreview) {
    return "";
  }

  // Canvas styling sample when product has no sale price.
  // "Off" (or any label) belongs in Suffix so users can edit it.
  return discountType === "amount"
    ? formatDiscountAmountText(5, currency)
    : "17%";
}

function isProductOnSale(product, priceData) {
  if (product?.is_on_sale === true) {
    return true;
  }
  const sale = priceData?.sale_price ?? product?.sale_price;
  return sale !== null && sale !== undefined && String(sale).trim() !== "";
}

function isFeaturedProduct(product) {
  return product?.is_featured === true;
}

function parseProductCreatedTime(value) {
  if (value === null || value === undefined || value === "") {
    return NaN;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  const raw = String(value).trim();
  if (!raw) {
    return NaN;
  }
  // WordPress post_date: "YYYY-MM-DD HH:mm:ss" — normalize for reliable parsing.
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const time = new Date(normalized).getTime();
  return Number.isFinite(time) ? time : NaN;
}

function isNewProduct(product, postData, daysLimit = BADGE_NEW_DAYS_DEFAULT) {
  const createdAt =
    product?.date_created ??
    postData?.date_created ??
    postData?.post_date_gmt ??
    postData?.post_date;
  const createdTime = parseProductCreatedTime(createdAt);
  if (!Number.isFinite(createdTime)) {
    return false;
  }
  const limit = normalizeBadgeNewDays(daysLimit);
  const days = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= limit;
}

function isBestSeller(product, minSale = BADGE_BEST_SELLER_MIN_SALE_DEFAULT) {
  const totalSales = Number.parseInt(
    String(product?.total_sales ?? "0").trim(),
    10,
  );
  const limit = normalizeBadgeBestSellerMinSale(minSale);
  return Number.isFinite(totalSales) && totalSales >= limit;
}

export function resolveBadgeValue(
  postData,
  badgeType,
  isBuilderPreview = false,
  settings = null,
  variationStock = null,
  variationPrice = null,
) {
  const type = normalizeBadgeType(badgeType);
  const product = postData?.product || {};
  const priceData = postData?.price_data || {};
  let value = "";

  switch (type) {
    case "sale":
      if (isProductOnSale(product, priceData) || isBuilderPreview) {
        value = resolveBadgeTypeLabel(settings, type);
      }
      break;
    case "featured":
      if (isFeaturedProduct(product) || isBuilderPreview) {
        value = resolveBadgeTypeLabel(settings, type);
      }
      break;
    case "new":
      if (
        isNewProduct(product, postData, resolveBadgeNewDays(settings)) ||
        isBuilderPreview
      ) {
        value = resolveBadgeTypeLabel(settings, type);
      }
      break;
    case "stock_status_text":
      value = resolveStockStatusBadgeText(
        product,
        priceData,
        settings,
        isBuilderPreview,
      );
      break;
    case "stock_quantity":
      value = resolveStockQuantityBadgeText(
        product,
        priceData,
        settings,
        isBuilderPreview,
        variationStock,
      );
      break;
    case "discount":
      value = resolveDiscountText(
        product,
        priceData,
        settings,
        isBuilderPreview,
        variationPrice,
      );
      break;
    case "best_seller":
      if (
        isBestSeller(product, resolveBadgeBestSellerMinSale(settings)) ||
        isBuilderPreview
      ) {
        value = resolveBadgeTypeLabel(settings, type);
      }
      break;
    default:
      value = "";
  }

  if (value !== "") {
    return value;
  }

  return isBuilderPreview ? resolveBadgeTypeLabel(settings, type) : "";
}
