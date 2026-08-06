import React from "react";
import {
  getWooVirtualMetaKey,
  isWooVirtualTaxonomyKey,
} from "../../FilterComponents/components/woocommerce/wooVirtualTaxonomies";
import { validateTerm } from "../../utils/functions";

export const PREVIEW_FILTER_ROOT = ".caf-builder-template-preview-filter";

export const isPreviewDynamicTermCountsEnabled = (mainBuilderData) =>
  String(
    mainBuilderData?.filter_layout_data?.extra_data?.dynamic_term_counts ?? "false"
  ) === "true";

export const buildPreviewFacetCountKey = ({
  dataSource = "",
  taxonomy = "",
  metaKey = "",
  termId = "",
  isVirtual = false,
} = {}) => {
  const token = String(termId ?? "").trim();
  if (!token || token === "0" || token === "all") {
    return "";
  }

  const taxonomyKey = String(taxonomy || "").trim();
  const virtual =
    isVirtual || (taxonomyKey ? isWooVirtualTaxonomyKey(taxonomyKey) : false);

  if (virtual) {
    const resolvedMetaKey =
      String(metaKey || "").trim() || getWooVirtualMetaKey(taxonomyKey);
    return resolvedMetaKey
      ? `meta:${resolvedMetaKey}:${encodeURIComponent(token)}`
      : "";
  }

  if (dataSource === "taxonomy" && taxonomyKey) {
    return `tax:${taxonomyKey}:${encodeURIComponent(token)}`;
  }

  const resolvedMetaKey = String(metaKey || "").trim();
  return resolvedMetaKey
    ? `meta:${resolvedMetaKey}:${encodeURIComponent(token)}`
    : "";
};

export const buildPreviewRangeFacetCountKey = (metaKey = "") => {
  const key = String(metaKey || "").trim();
  return key ? `range:${key}` : "";
};

export const resolvePreviewTermFacetState = ({
  dynamicTermCountsEnabled = false,
  facetCounts = null,
  countKey = "",
  staticCount,
  isSelected = false,
} = {}) => {
  const hasStaticCount =
    staticCount != null &&
    staticCount !== "" &&
    Number.isFinite(Number(staticCount));

  const getLiveCount = () => {
    if (
      !facetCounts ||
      !countKey ||
      !Object.prototype.hasOwnProperty.call(facetCounts, countKey)
    ) {
      return null;
    }
    const parsed = parseInt(facetCounts[countKey], 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Dynamic counts: live facet map drives display + unavailable styling.
  if (dynamicTermCountsEnabled) {
    const live = getLiveCount();
    if (live !== null) {
      return {
        count: live,
        unavailable: live <= 0 && !isSelected,
      };
    }
  }

  // Static show_count: use layout-baked term.count (catalog / restriction snapshot).
  if (hasStaticCount) {
    return {
      count: Number(staticCount),
      unavailable: false,
    };
  }

  // No baked count yet — fall back to preview facet API (restriction-scoped base query).
  const live = getLiveCount();
  if (live !== null) {
    return {
      count: live,
      unavailable: false,
    };
  }

  return {
    count: staticCount,
    unavailable: false,
  };
};

export const shouldRenderPreviewTerm = ({
  groupKey = "",
  itemKey = "",
  updatedTaxonomy = null,
  dynamicTermCountsEnabled = false,
} = {}) =>
  isWooVirtualTaxonomyKey(groupKey) ||
  dynamicTermCountsEnabled ||
  validateTerm(groupKey, itemKey, updatedTaxonomy);

export const PreviewFacetCountSpan = ({ settings, count }) => {
  if (settings?.show_count !== "true") {
    return null;
  }

  return (
    <span className="count-span">
      {settings?.count_separator === "brackets" && "("}
      {settings?.count_separator === "hyphen" && "- "}
      {settings?.count_separator === "custom" && settings?.count_prefix}
      {count}
      {settings?.count_separator === "brackets" && ")"}
      {settings?.count_separator === "custom" && settings?.count_suffix}
    </span>
  );
};
