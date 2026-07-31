export const resolvePreviewPostId = (postData) => {
  const raw = postData?.value ?? postData?.id ?? postData?.key ?? 0;
  const postId = Number(raw);
  return Number.isFinite(postId) && postId > 0 ? postId : 0;
};

const formatMetaFieldScalar = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim() === "" ? null : value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const formatted = formatMetaFieldScalar(value[index]);
      if (formatted !== null) {
        return formatted;
      }
    }
    return null;
  }
  if (typeof value === "object" && value !== null) {
    if (typeof value.url === "string" && value.url.trim() !== "") {
      return value.url;
    }
    if (typeof value.label === "string" && value.label.trim() !== "") {
      return value.label;
    }
    if (
      Object.prototype.hasOwnProperty.call(value, "value") &&
      value.value !== null &&
      value.value !== undefined
    ) {
      return formatMetaFieldScalar(value.value);
    }
  }
  return null;
};

export const resolveCustomFieldValueFromPostMeta = (postData, fieldName) => {
  if (!fieldName || fieldName === "0") {
    return null;
  }

  const bucket = postData?.meta_fields?.[fieldName];
  if (bucket === undefined || bucket === null) {
    return null;
  }

  if (Array.isArray(bucket)) {
    for (let index = 0; index < bucket.length; index += 1) {
      const formatted = formatMetaFieldScalar(bucket[index]);
      if (formatted !== null) {
        return formatted;
      }
    }
    return null;
  }

  return formatMetaFieldScalar(bucket);
};

export const hasCustomFieldPreviewSelection = (fieldName) =>
  Boolean(fieldName && fieldName !== "0");
