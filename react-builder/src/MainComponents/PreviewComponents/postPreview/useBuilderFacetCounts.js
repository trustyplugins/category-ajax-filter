import { useEffect, useMemo, useRef, useState } from "react";
import apiClient from "../../../api/client";
import { apiEndpoints } from "../../../api/endpoints";
import { resolvePostTypeFromBuilderData } from "../../utils/builderDataAdapters";

const parsePayload = (data) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  return data;
};

const collectTermTokens = (nodes) =>
  (Array.isArray(nodes) ? nodes : []).map((node) => [
    node?.key,
    collectTermTokens(node?.term_data),
    collectTermTokens(node?.children_data),
  ]);

const collectCustomFieldTokens = (groups) => {
  const list = Array.isArray(groups) ? groups : groups ? [groups] : [];
  return list.map((group) => [
    group?.custom_field_key,
    (Array.isArray(group?.custom_field_value)
      ? group.custom_field_value
      : Array.isArray(group?.custom_field_value_list)
      ? group.custom_field_value_list
      : []
    ).map((value) => value?.key),
  ]);
};

/**
 * Signature of everything that can change facet counts. Style-only edits keep
 * the signature stable so the builder does not refetch on every tweak.
 */
const buildFacetCountsSignature = (mainBuilderData) => {
  const filterLayoutData = mainBuilderData?.filter_layout_data || {};
  const extraData = filterLayoutData.extra_data || {};
  const rows = Array.isArray(filterLayoutData.initial_data)
    ? filterLayoutData.initial_data
    : [];

  const moduleTokens = [];
  rows.forEach((row) => {
    (Array.isArray(row?.data) ? row.data : []).forEach((column) => {
      (Array.isArray(column?.data) ? column.data : []).forEach((module) => {
        const settings = module?.settings || {};
        moduleTokens.push([
          module?.key,
          settings?.data_source,
          collectTermTokens(settings?.taxonomy_data),
          collectCustomFieldTokens(settings?.custom_field_data),
          settings?.star_count,
          settings?.rating_compare,
        ]);
      });
    });
  });

  // dynamicTermCounts is intentionally omitted: live catalog counts are always
  // fetched; DTC only changes intersection / unavailable styling on the client.
  return JSON.stringify({
    postType: resolvePostTypeFromBuilderData(mainBuilderData),
    restriction: extraData.query_restriction ?? null,
    modules: moduleTokens,
  });
};

/**
 * Fetch live (canonical) facet counts for the builder, so previews never rely
 * only on stale layout-baked term counts. Uses the lightweight facet_counts
 * response mode of the get-preview-posts endpoint.
 *
 * Fail-soft: leave facetCounts null on error / empty maps so the UI keeps baked
 * counts instead of flashing zeros.
 *
 * @param {object}  mainBuilderData Builder state.
 * @param {object}  options
 * @param {boolean} options.enabled Skip fetching when false.
 * @returns {object|null} facet counts map, or null while unavailable.
 */
const useBuilderFacetCounts = (mainBuilderData, { enabled = true } = {}) => {
  const [facetCounts, setFacetCounts] = useState(null);
  const requestIdRef = useRef(0);
  const builderDataRef = useRef(mainBuilderData);
  builderDataRef.current = mainBuilderData;

  const signature = useMemo(
    () => buildFacetCountsSignature(mainBuilderData),
    [mainBuilderData]
  );

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      const builderData = builderDataRef.current;
      const postType = resolvePostTypeFromBuilderData(builderData);
      const query_data = {
        query: {
          post_type: postType,
          post_status: "publish",
          posts_per_page: 1,
          paged: 1,
        },
        // So PHP build_base_query_args / CAF_PRO_Builder_Data resolve product correctly.
        common_data: {
          post_type: postType,
        },
        response_mode: "facet_counts",
        filter_layout_data: {
          initial_data: builderData?.filter_layout_data?.initial_data ?? [],
          extra_data: builderData?.filter_layout_data?.extra_data ?? {},
        },
      };

      try {
        const { data } = await apiClient.post(apiEndpoints.getPreviewPosts(), {
          query_data,
        });
        if (requestId !== requestIdRef.current) {
          return;
        }
        const payload = parsePayload(data);
        if (
          payload?.status === "success" &&
          payload?.facet_counts &&
          typeof payload.facet_counts === "object" &&
          Object.keys(payload.facet_counts).length > 0
        ) {
          setFacetCounts(payload.facet_counts);
        }
        // Empty / failed maps: keep prior or null so baked counts remain.
      } catch (error) {
        // Keep previous counts (or the saved fallback) on failure.
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [signature, enabled]);

  return facetCounts;
};

export default useBuilderFacetCounts;
