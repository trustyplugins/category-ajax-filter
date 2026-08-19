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

/**
 * Resolve the count shown next to a term in the builder canvas.
 *
 * Priority (never invent a bare 0 over a known baked count):
 * 1. Live map value when the key is present (including real 0)
 * 2. Layout-baked staticCount while loading / on miss / on empty map
 * 3. null only when neither is available (pending placeholder)
 */
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

  const mapReady =
    facetCounts &&
    typeof facetCounts === "object" &&
    Object.keys(facetCounts).length > 0;

  const getLiveCount = () => {
    if (!mapReady || !countKey) {
      return null;
    }
    if (!Object.prototype.hasOwnProperty.call(facetCounts, countKey)) {
      return null;
    }
    const parsed = parseInt(facetCounts[countKey], 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const live = getLiveCount();
  if (live !== null) {
    return {
      count: live,
      unavailable: dynamicTermCountsEnabled && live <= 0 && !isSelected,
      pending: false,
    };
  }

  if (hasStaticCount) {
    return {
      count: Number(staticCount),
      unavailable: false,
      // Keep baked visible while live request is in flight — never flash 0/….
      pending: false,
    };
  }

  return {
    count: null,
    unavailable: false,
    pending: facetCounts === null,
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

export const PreviewFacetCountSpan = ({ settings, count, pending = false }) => {
  if (settings?.show_count !== "true") {
    return null;
  }

  // Reserve space only when we have neither live nor baked values.
  if (pending || count === null || typeof count === "undefined") {
    let pendingText = "…";
    if (settings?.count_separator === "brackets") {
      pendingText = "(…)";
    } else if (settings?.count_separator === "hyphen") {
      pendingText = "- …";
    } else if (settings?.count_separator === "custom") {
      pendingText = `${settings?.count_prefix || ""}…${settings?.count_suffix || ""}`;
    }
    return (
      <span className="count-span count-span--pending" aria-hidden="true">
        {pendingText}
      </span>
    );
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
