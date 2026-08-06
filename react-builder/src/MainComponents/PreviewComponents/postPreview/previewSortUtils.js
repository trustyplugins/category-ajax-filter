/**
 * Resolve sort args for builder preview queries (matches live frontend AJAX).
 * Placeholder ("0") omits that param so WordPress core defaults apply.
 * Unset values use post grid defaults from builder settings.
 */
export const POST_GRID_ORDERBY_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "ID", label: "ID" },
  { value: "date", label: "Date" },
  { value: "rand", label: "Random" },
];

const PREVIEW_ORDER_BY_LABELS = {
  title: "Title",
  ID: "ID",
  id: "ID",
  date: "Date",
  rand: "Random",
  author: "Author",
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
