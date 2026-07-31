const normalizePostType = (postType) =>
  typeof postType === "string" ? postType.trim() : "";

/** True when value looks like a full CAF layout document (not filter rows alone). */
export const isBuilderLayoutDocument = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.filter_layout_data &&
      typeof value.filter_layout_data === "object"
  );

export const resolvePostTypeFromBuilderData = (mainBuilderData) => {
  const candidates = [
    normalizePostType(mainBuilderData?.common_data?.post_type),
    normalizePostType(mainBuilderData?.post_type),
    normalizePostType(mainBuilderData?.post_layout_data?.extra_data?.post_type),
    normalizePostType(
      mainBuilderData?.post_layout_data?.extra_data?.single_post_data?.post_type
    ),
  ].filter(Boolean);
  return candidates[0] || "post";
};

export const resolveSinglePostFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.post_layout_data?.extra_data?.single_post_data || {};

export const resolveLayoutNameFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.common_data?.layout_name || "";

export const resolveLayoutKeyFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.common_data?.layout_key || "";

export const resolveLayoutIndexFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.common_data?.layout_index || "";

export const resolveLayoutPublishFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.common_data?.layout_publish || "draft";

export const resolvePostExtraDataFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.post_layout_data?.extra_data || {};

export const resolvePreviewTemplateDataFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.common_data?.preview_template_data || {};

export const resolvePreviewPostLayoutTypeFromBuilderData = (mainBuilderData) =>
  resolvePreviewTemplateDataFromBuilderData(mainBuilderData)?.post_preview_data
    ?.layout_type || "grid";

export const resolvePreviewFilterPlacementFromBuilderData = (mainBuilderData) =>
  resolvePreviewTemplateDataFromBuilderData(mainBuilderData)?.filter_preview_data
    ?.filter_placement || "left";

export const resolveFilterTypeFromBuilderData = (mainBuilderData) =>
  mainBuilderData?.filter_layout_data?.extra_data?.filter_type || "false";

export const resolveGlobalFontFamilyFromBuilderData = (mainBuilderData) => {
  const stored = mainBuilderData?.common_data?.global_font_family;
  if (typeof stored === "string" && stored.trim()) {
    return stored.trim();
  }
  return "DM Sans";
};
