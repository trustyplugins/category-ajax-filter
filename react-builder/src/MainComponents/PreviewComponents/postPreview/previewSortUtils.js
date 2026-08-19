/**
 * Resolve sort args for builder preview queries (matches live frontend AJAX).
 * Placeholder ("0") omits that param so WordPress core defaults apply.
 * Unset values use post grid defaults from builder settings.
 */
import { isProTier, isWooCommerceActive } from "../../../tier/capabilities";
import { resolvePostTypeFromBuilderData } from "../../utils/builderDataAdapters";

export const POST_GRID_ORDERBY_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "ID", label: "ID" },
  { value: "date", label: "Date" },
  { value: "rand", label: "Random" },
];

/** Woo shop catalog keys (date already exists on the post list). */
export const WOO_CATALOG_ORDERBY_OPTIONS = [
  { value: "menu_order", label: "Default sorting" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Average rating" },
  { value: "price", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PREVIEW_ORDER_BY_LABELS = {
  title: "Title",
  ID: "ID",
  id: "ID",
  date: "Date",
  rand: "Random",
  author: "Author",
  menu_order: "Default sorting",
  popularity: "Popularity",
  rating: "Average rating",
  price: "Price: low to high",
  "price-desc": "Price: high to low",
};

export const formatPreviewOrderByLabel = (value) => {
  if (!value || value === "0") {
    return "";
  }
  const key = String(value);
  if (PREVIEW_ORDER_BY_LABELS[key]) {
    return PREVIEW_ORDER_BY_LABELS[key];
  }
  if (PREVIEW_ORDER_BY_LABELS[key.toLowerCase()]) {
    return PREVIEW_ORDER_BY_LABELS[key.toLowerCase()];
  }
  return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
};

export function shouldOfferWooCatalogOrderby(mainBuilderData) {
  if (!isProTier() || !isWooCommerceActive()) {
    return false;
  }
  return resolvePostTypeFromBuilderData(mainBuilderData) === "product";
}

export function getPostGridOrderbyOptions(includeWoo = false) {
  if (!includeWoo) {
    return POST_GRID_ORDERBY_OPTIONS;
  }
  const seen = new Set(POST_GRID_ORDERBY_OPTIONS.map((option) => option.value));
  return [
    ...POST_GRID_ORDERBY_OPTIONS,
    ...WOO_CATALOG_ORDERBY_OPTIONS.filter((option) => !seen.has(option.value)),
  ];
}

export function resolvePreviewSortQueryArgs(
  orderBy,
  orderType,
  gridDefaultOrderBy = "title",
  gridDefaultOrderType = "ASC"
) {
  const args = {};

  if (orderBy !== "0") {
    args.orderby = orderBy || gridDefaultOrderBy;
  }

  if (orderType !== "0") {
    args.order = orderType || gridDefaultOrderType;
  }

  return args;
}

export function getPreviewSortSettingsSignature(
  orderBy,
  orderType,
  gridDefaultOrderBy = "title",
  gridDefaultOrderType = "ASC"
) {
  const sort = resolvePreviewSortQueryArgs(
    orderBy,
    orderType,
    gridDefaultOrderBy,
    gridDefaultOrderType
  );

  return `${sort.orderby ?? "__wp_default__"}|${sort.order ?? "__wp_default__"}`;
}
