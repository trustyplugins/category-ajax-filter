import {
  getWooVirtualDefinition,
  isWooVirtualTaxonomyKey,
} from "../../FilterComponents/components/woocommerce/wooVirtualTaxonomies";
import { PREVIEW_FILTER_ROOT } from "./previewFacetCounts";

const getSelectedPreviewFilterItems = (scopeDocument) =>
  scopeDocument.querySelectorAll(
    `${PREVIEW_FILTER_ROOT} .caf-module-filter .caf-terms-list-item.caf-selected,` +
      `${PREVIEW_FILTER_ROOT} .caf-module-filter .caf-dropdown-child .caf-terms-list-item.active`
  );

const pushMetaClause = (chunks, key, value, compare = "=", type = "CHAR") => {
  if (!key || value === undefined || value === null || value === "") {
    return;
  }
  const normalized = String(value);
  if (!normalized || normalized === "0" || normalized === "all") {
    return;
  }

  const existing = chunks.find((entry) => entry.key === key);
  if (existing) {
    const values = Array.isArray(existing.value)
      ? existing.value
      : [existing.value];
    if (!values.includes(normalized)) {
      values.push(normalized);
      existing.value = values.length > 1 ? values : values[0];
      if (values.length > 1 && existing.compare === "=") {
        existing.compare = "IN";
      }
    }
    return;
  }

  chunks.push({
    key,
    value: normalized,
    compare,
    type,
  });
};

export const resolvePreviewWooAndRatingMetaFromDom = (scopeDocument) => {
  const metaChunks = [];

  getSelectedPreviewFilterItems(scopeDocument).forEach((itemEl) => {
    const listEl = itemEl.closest(".caf-terms-list");
    const dataSource = String(listEl?.getAttribute("data-source") || "");
    const taxonomy = String(itemEl.getAttribute("taxonomy") || "").trim();
    const isVirtual =
      String(itemEl.getAttribute("data-woo-virtual") || "") === "1" ||
      isWooVirtualTaxonomyKey(taxonomy);

    const termValue = String(
      itemEl.getAttribute("term-value") ||
        itemEl.getAttribute("term-id") ||
        itemEl.querySelector(".caf-rating-input, .caf-taxo-input, .caf-cf-value-input")?.value ||
        ""
    ).trim();

    if (isVirtual) {
      const definition = getWooVirtualDefinition(taxonomy);
      const metaKey =
        String(itemEl.getAttribute("data-key") || "").trim() ||
        definition?.metaKey ||
        "";
      if (!metaKey) {
        return;
      }
      pushMetaClause(
        metaChunks,
        metaKey,
        termValue,
        definition?.compare || "=",
        definition?.metaType || "CHAR"
      );
      return;
    }

    if (dataSource === "woo_rating") {
      const metaKey = String(
        itemEl.getAttribute("data-key") || listEl?.getAttribute("data-key") || "_wc_average_rating"
      ).trim();
      const compare = String(listEl?.getAttribute("meta-operator") || ">=").trim();
      const type = String(listEl?.getAttribute("meta-type") || "DECIMAL").trim();
      pushMetaClause(metaChunks, metaKey, termValue, compare, type);
    }
  });

  return metaChunks;
};

export const shouldSkipPreviewTaxonomyGroup = (groupKey) =>
  isWooVirtualTaxonomyKey(groupKey);
