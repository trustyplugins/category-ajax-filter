export const WOO_VIRTUAL_STOCK_KEY = "__caf_woo_stock";
export const WOO_VIRTUAL_SALE_KEY = "__caf_woo_sale";
export const WOO_VIRTUAL_RATING_KEY = "__caf_woo_rating";

const WOO_VIRTUAL_DEFINITIONS = {
  [WOO_VIRTUAL_STOCK_KEY]: {
    metaKey: "_stock_status",
    compare: "IN",
    metaType: "CHAR",
  },
  [WOO_VIRTUAL_SALE_KEY]: {
    metaKey: "_on_sale",
    compare: "=",
    metaType: "CHAR",
  },
  [WOO_VIRTUAL_RATING_KEY]: {
    metaKey: "_wc_average_rating",
    compare: ">=",
    metaType: "DECIMAL",
  },
};

export const isWooVirtualTaxonomyKey = (key) =>
  Object.prototype.hasOwnProperty.call(WOO_VIRTUAL_DEFINITIONS, String(key || ""));

export const getWooVirtualDefinition = (key) =>
  WOO_VIRTUAL_DEFINITIONS[String(key || "")] || null;

export const getWooVirtualMetaKey = (taxonomyKey) =>
  getWooVirtualDefinition(taxonomyKey)?.metaKey || "";

/**
 * Placeholder Product filters rows for free-tier locked picker UI
 * when the API does not return virtual Woo groups.
 */
export const getWooProductFilterPickerPlaceholders = () => [
  {
    key: WOO_VIRTUAL_STOCK_KEY,
    label: "Stock Status",
    is_woo_virtual: true,
    term_data: [
      { id: "instock", name: "In stock", total_count: 0, children_data: [] },
      { id: "outofstock", name: "Out of stock", total_count: 0, children_data: [] },
      { id: "onbackorder", name: "On backorder", total_count: 0, children_data: [] },
    ],
  },
  {
    key: WOO_VIRTUAL_SALE_KEY,
    label: "On Sale",
    is_woo_virtual: true,
    term_data: [
      { id: "yes", name: "On sale", total_count: 0, children_data: [] },
      { id: "no", name: "Not on sale", total_count: 0, children_data: [] },
    ],
  },
  {
    key: WOO_VIRTUAL_RATING_KEY,
    label: "Rating",
    is_woo_virtual: true,
    term_data: [
      { id: "5", name: "5 stars & up", total_count: 0, children_data: [] },
      { id: "4", name: "4 stars & up", total_count: 0, children_data: [] },
      { id: "3", name: "3 stars & up", total_count: 0, children_data: [] },
      { id: "2", name: "2 stars & up", total_count: 0, children_data: [] },
      { id: "1", name: "1 star & up", total_count: 0, children_data: [] },
    ],
  },
];
