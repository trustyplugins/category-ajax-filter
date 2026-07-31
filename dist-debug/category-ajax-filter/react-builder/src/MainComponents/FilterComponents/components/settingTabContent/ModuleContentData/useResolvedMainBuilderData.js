import { useSelector } from "react-redux";
import {
  selectBuilderEffectivePostType,
  selectBuilderPostPreviewData,
} from "../../../../../store/selectors";

const hasObjectValues = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0
  );

export const useResolvedMainBuilderData = (propMainBuilderData) => {
  const builderPostType = useSelector(selectBuilderEffectivePostType);
  const builderPostPreviewData = useSelector(selectBuilderPostPreviewData);
  const storeMainBuilderData = {
    post_type: builderPostType || "post",
    common_data: {
      post_type: builderPostType || "post",
    },
    post_layout_data: {
      extra_data: {
        post_type: builderPostType || "post",
        single_post_data: builderPostPreviewData || {},
      },
    },
    single_post_data: builderPostPreviewData || {},
  };
  if (hasObjectValues(propMainBuilderData)) {
    return propMainBuilderData;
  }
  if (hasObjectValues(storeMainBuilderData)) {
    return storeMainBuilderData;
  }
  return propMainBuilderData || storeMainBuilderData || {};
};

const normalizePostType = (postType) =>
  typeof postType === "string" ? postType.trim() : "";

export const getResolvedFilterPostType = (mainBuilderData, modulePostType) => {
  const canonicalPostType = normalizePostType(mainBuilderData?.common_data?.post_type);
  if (canonicalPostType) {
    return canonicalPostType;
  }

  const candidates = [
    normalizePostType(modulePostType),
    normalizePostType(mainBuilderData?.post_type),
    normalizePostType(mainBuilderData?.post_layout_data?.extra_data?.post_type),
    normalizePostType(
      mainBuilderData?.post_layout_data?.extra_data?.single_post_data?.post_type
    ),
  ].filter(Boolean);

  return candidates[0] || "post";
};

export const getResolvedSinglePostData = (mainBuilderData) =>
  mainBuilderData?.post_layout_data?.extra_data?.single_post_data ||
  mainBuilderData?.single_post_data ||
  {};
