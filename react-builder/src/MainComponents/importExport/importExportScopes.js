/**
 * Scoped import/export helpers — keep partial exports/imports from overwriting
 * unrelated layout sections (e.g. filter import must not reset preview template).
 */

const LAYOUT_IDENTITY_KEYS = new Set([
  "layout_name",
  "layout_key",
  "layout_index",
  "layout_publish",
  "layout_schema_version",
]);

const SCOPED_COMMON_EXPORT_KEYS = Object.freeze({
  filter_layout: ["post_type", "global_font_family"],
  post_layout: ["post_type", "global_font_family"],
});

export const pickCommonDataForScopedExport = (commonData, scope) => {
  const safe = commonData && typeof commonData === "object" ? commonData : {};
  const allowedKeys = SCOPED_COMMON_EXPORT_KEYS[scope];

  if (!Array.isArray(allowedKeys)) {
    return { ...safe };
  }

  const picked = {};
  allowedKeys.forEach((key) => {
    if (typeof safe[key] !== "undefined" && safe[key] !== null && safe[key] !== "") {
      picked[key] = safe[key];
    }
  });

  return picked;
};

/**
 * Merge only metadata fields that belong with a scoped import.
 * Never overwrites preview template data or layout identity fields.
 */
export const mergeScopedCommonDataOnImport = (
  currentCommon,
  importedCommon,
  scope
) => {
  const current =
    currentCommon && typeof currentCommon === "object" ? { ...currentCommon } : {};
  const imported =
    importedCommon && typeof importedCommon === "object" ? importedCommon : {};
  const allowedKeys = SCOPED_COMMON_EXPORT_KEYS[scope];

  if (!Array.isArray(allowedKeys) || allowedKeys.length === 0) {
    return current;
  }

  const next = { ...current };
  allowedKeys.forEach((key) => {
    if (
      typeof imported[key] !== "undefined" &&
      imported[key] !== null &&
      imported[key] !== ""
    ) {
      next[key] = imported[key];
    }
  });

  return next;
};

export const stripLayoutIdentityFromCommonData = (commonData) => {
  const safe = commonData && typeof commonData === "object" ? { ...commonData } : {};
  LAYOUT_IDENTITY_KEYS.forEach((key) => {
    delete safe[key];
  });
  return safe;
};
