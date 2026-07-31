import React from "react";

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

const BADGE_TYPE_LABELS = BADGE_TYPE_OPTIONS.reduce((labels, option) => {
  labels[option.value] = option.label;
  return labels;
}, {});

export const isFreeBadgeType = (value) => FREE_BADGE_TYPES.includes(value);

export function normalizeBadgeType(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return BADGE_TYPE_LABELS[normalized] ? normalized : BADGE_TYPE_DEFAULT;
}

export function resolveBadgeTypeForTier(value) {
  const type = normalizeBadgeType(value);
  return isFreeBadgeType(type) ? type : FREE_BADGE_TYPE_DEFAULT;
}

export function getBadgeTypeSelectOptions() {
  const available = BADGE_TYPE_OPTIONS.filter((option) =>
    isFreeBadgeType(option.value),
  );
  const proOnly = BADGE_TYPE_OPTIONS.filter(
    (option) => !isFreeBadgeType(option.value),
  ).map((option) => ({
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
  }));
  return [...available, ...proOnly];
}

export function getBadgeTypeLabel(badgeType) {
  return BADGE_TYPE_LABELS[normalizeBadgeType(badgeType)];
}

export const normalizeBadgeTextSource = (value) =>
  value === "custom_text" ? "custom_text" : BADGE_TEXT_SOURCE_DEFAULT;
export const normalizeBadgeNewCondition = (value) =>
  value === "days" ? "days" : BADGE_NEW_CONDITION_DEFAULT;
export const normalizeBadgeNewDays = (value) => {
  const days = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(days) && days >= 1 ? days : BADGE_NEW_DAYS_DEFAULT;
};
export const normalizeBadgeBestSellerMinSaleMode = () =>
  BADGE_BEST_SELLER_MIN_SALE_MODE_DEFAULT;
export const normalizeBadgeBestSellerMinSale = () =>
  BADGE_BEST_SELLER_MIN_SALE_DEFAULT;
export const resolveBadgeBestSellerMinSale = () =>
  BADGE_BEST_SELLER_MIN_SALE_DEFAULT;
export const normalizeBadgeStockStatusDisplay = () =>
  BADGE_STOCK_STATUS_DISPLAY_DEFAULT;
export const isBadgeSettingEnabled = (value) =>
  value === true || value === "true" || value === 1 || value === "1";
export const normalizeBadgeStockQuantityThreshold = () =>
  BADGE_STOCK_QUANTITY_THRESHOLD_DEFAULT;
export const normalizeBadgeDiscountType = () => BADGE_DISCOUNT_TYPE_DEFAULT;

export function getBadgeTypeSettings(settings, badgeType) {
  const type = resolveBadgeTypeForTier(badgeType);
  const badgeSettings =
    settings?.badge_settings && typeof settings.badge_settings === "object"
      ? settings.badge_settings
      : {};
  return badgeSettings[type] && typeof badgeSettings[type] === "object"
    ? badgeSettings[type]
    : {};
}

export function getBadgeDefaultText(badgeType) {
  return BADGE_DEFAULT_TEXT[resolveBadgeTypeForTier(badgeType)];
}

export function resolveBadgeTypeLabel(settings, badgeType) {
  const type = resolveBadgeTypeForTier(badgeType);
  const typeSettings = getBadgeTypeSettings(settings, type);
  const customText = String(typeSettings?.custom_text ?? "").trim();
  return normalizeBadgeTextSource(typeSettings?.text_source) === "custom_text" &&
    customText
    ? customText
    : getBadgeDefaultText(type);
}

export function resolveBadgeNewDays(settings) {
  const settingsForNew = getBadgeTypeSettings(settings, "new");
  return normalizeBadgeNewCondition(settingsForNew?.condition) === "days"
    ? normalizeBadgeNewDays(settingsForNew?.days)
    : BADGE_NEW_DAYS_DEFAULT;
}

function isProductOnSale(product, priceData) {
  return (
    product?.is_on_sale === true ||
    String(priceData?.sale_price ?? product?.sale_price ?? "").trim() !== ""
  );
}

function isNewProduct(product, postData, daysLimit) {
  const rawDate =
    product?.date_created ??
    postData?.date_created ??
    postData?.post_date_gmt ??
    postData?.post_date;
  const date = new Date(String(rawDate ?? "").replace(" ", "T")).getTime();
  const age = (Date.now() - date) / 86400000;
  return Number.isFinite(date) && age >= 0 && age <= normalizeBadgeNewDays(daysLimit);
}

export function resolveBadgeValue(
  postData,
  badgeType,
  isBuilderPreview = false,
  settings = null,
) {
  const type = resolveBadgeTypeForTier(badgeType);
  const product = postData?.product || {};
  const priceData = postData?.price_data || {};
  const isVisible =
    type === "sale"
      ? isProductOnSale(product, priceData)
      : isNewProduct(product, postData, resolveBadgeNewDays(settings));
  return isVisible || isBuilderPreview ? resolveBadgeTypeLabel(settings, type) : "";
}
