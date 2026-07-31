import { getWooProductFilterPickerPlaceholders } from "../../woocommerce/wooVirtualTaxonomies";

export const TAXONOMY_PICKER_SECTION_TAXONOMIES = {
  id: "taxonomies",
  label: "Taxonomies",
};

export const TAXONOMY_PICKER_SECTION_ATTRIBUTES = {
  id: "attributes",
  label: "Attributes",
};

/** Virtual Woo groups: stock, on sale, product rating (checkbox/dropdown). */
export const TAXONOMY_PICKER_SECTION_PRODUCT_FILTERS = {
  id: "product_filters",
  label: "Product filters",
};

/**
 * @param {Array<{ key?: string, is_woo_virtual?: boolean }>} taxonomyListArray
 * @returns {{ taxonomies: array, attributes: array, productFilters: array }}
 */
export function groupTaxonomyListForPicker(taxonomyListArray) {
  const grouped = {
    taxonomies: [],
    attributes: [],
    productFilters: [],
  };

  if (!Array.isArray(taxonomyListArray)) {
    return grouped;
  }

  taxonomyListArray.forEach((taxo) => {
    if (!taxo || typeof taxo !== "object") {
      return;
    }
    if (taxo.is_woo_virtual) {
      grouped.productFilters.push(taxo);
      return;
    }
    const key = String(taxo.key || "");
    if (key.startsWith("pa_")) {
      grouped.attributes.push(taxo);
      return;
    }
    grouped.taxonomies.push(taxo);
  });

  return grouped;
}

/**
 * @param {Array<{ key?: string, is_woo_virtual?: boolean }>} taxonomyListArray
 * @param {{
 *   ensureProductFiltersSection?: boolean,
 *   productFiltersLocked?: boolean,
 * }} [options]
 * @returns {Array<{ id: string, label: string, items: array, locked?: boolean }>}
 */
export function getTaxonomyPickerSections(taxonomyListArray, options = {}) {
  const ensureProductFiltersSection = Boolean(options.ensureProductFiltersSection);
  const productFiltersLocked = Boolean(options.productFiltersLocked);
  const grouped = groupTaxonomyListForPicker(taxonomyListArray);
  const sections = [];

  if (grouped.taxonomies.length > 0) {
    sections.push({
      ...TAXONOMY_PICKER_SECTION_TAXONOMIES,
      items: grouped.taxonomies,
    });
  }
  if (grouped.attributes.length > 0) {
    sections.push({
      ...TAXONOMY_PICKER_SECTION_ATTRIBUTES,
      items: grouped.attributes,
    });
  }

  const hasProductFilters = grouped.productFilters.length > 0;
  if (hasProductFilters || ensureProductFiltersSection) {
    sections.push({
      ...TAXONOMY_PICKER_SECTION_PRODUCT_FILTERS,
      items: hasProductFilters
        ? grouped.productFilters
        : getWooProductFilterPickerPlaceholders(),
      locked: productFiltersLocked,
    });
  }

  return sections;
}

/**
 * Ant Design Select option groups for filter-with-query taxonomy dropdowns.
 *
 * @param {Array<{ key?: string, label?: string, is_woo_virtual?: boolean }>} taxonomyListArray
 * @param {string} placeholderLabel
 * @returns {Array<{ label: string, value?: string, options?: Array<{ label: string, value: string }> }>}
 */
export function getTaxonomyPickerSelectOptions(
  taxonomyListArray,
  placeholderLabel = "Add Taxonomy"
) {
  const options = [{ label: placeholderLabel, value: "0" }];
  const sections = getTaxonomyPickerSections(taxonomyListArray);

  sections.forEach((section) => {
    options.push({
      label: section.label,
      options: section.items.map((item) => ({
        label: item.label,
        value: item.key,
      })),
    });
  });

  return options;
}
