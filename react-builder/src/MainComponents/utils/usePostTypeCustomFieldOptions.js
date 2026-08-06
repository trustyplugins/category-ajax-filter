import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../api/client";
import { apiEndpoints } from "../../api/endpoints";
import { selectBuilderEffectivePostType } from "../../store/selectors";

export const buildCustomFieldSelectOptions = (
  metaKeys,
  placeholderLabel = "Custom Field"
) => {
  const options = [{ label: placeholderLabel, value: "0" }];

  if (!Array.isArray(metaKeys)) {
    return options;
  }

  metaKeys.forEach((key) => {
    if (key) {
      options.push({ label: key, value: key });
    }
  });

  return options;
};

/**
 * Load custom field dropdown options scoped to the builder post type.
 * Uses ACF field groups when available; otherwise post-type meta keys from the API.
 */
export function usePostTypeCustomFieldOptions({
  postType: postTypeProp,
  includeValue,
  placeholderLabel = "Custom Field",
} = {}) {
  const reduxPostType = useSelector(selectBuilderEffectivePostType);
  const postType = postTypeProp || reduxPostType || "post";
  const [metaKeys, setMetaKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadFieldList = async () => {
      if (!postType || postType === "0") {
        setMetaKeys([]);
        return;
      }

      setLoading(true);

      try {
        const res = await apiClient.post(apiEndpoints.getCfFieldList, {
          post_type: postType,
        });
        const keys = res?.data?.data?.meta_keys;

        if (!cancelled && Array.isArray(keys)) {
          setMetaKeys(keys);
        }
      } catch (error) {
        if (!cancelled) {
          setMetaKeys([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFieldList();

    return () => {
      cancelled = true;
    };
  }, [postType]);

  const options = useMemo(() => {
    let keys = [...metaKeys];

    if (includeValue && includeValue !== "0" && !keys.includes(includeValue)) {
      keys = [...keys, includeValue];
      keys.sort((a, b) => a.localeCompare(b));
    }

    return buildCustomFieldSelectOptions(keys, placeholderLabel);
  }, [metaKeys, includeValue, placeholderLabel]);

  return { options, loading, postType };
}
