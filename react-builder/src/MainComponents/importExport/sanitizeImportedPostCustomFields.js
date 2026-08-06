import cloneDeep from "lodash/cloneDeep";
import { clearCustomUploadedBackgroundImage } from "./sanitizeImportedPostBackgroundImages";

const MODULES_WITH_FIELD_SOURCE = new Set(["customfield", "image"]);
const MODULES_WITH_LINK_CUSTOM_FIELD = new Set(["title", "button", "image"]);

const normalizePostType = (postType) =>
  typeof postType === "string" ? postType.trim() : "";

export function shouldClearImportedPostCustomFieldsOnPostTypeMismatch(
  currentPostType,
  importedPostType
) {
  const current = normalizePostType(currentPostType);
  const imported = normalizePostType(importedPostType);
  return Boolean(current) && Boolean(imported) && current !== imported;
}

export function resolveImportedPostTypeFromExport(importJson) {
  if (!importJson || typeof importJson !== "object") {
    return "";
  }

  const meta = importJson._export_meta || {};
  return normalizePostType(
    meta.post_type ||
      importJson.common_data?.post_type ||
      importJson.post_layout_data?.extra_data?.post_type ||
      ""
  );
}

const resetModuleCustomFieldSource = (settings, moduleKey) => {
  if (!settings || typeof settings !== "object") {
    return;
  }

  settings.custom_field = "0";

  if (moduleKey === "image") {
    settings.placeholder_image = "";
  }
};

const resetModuleLinkCustomField = (settings) => {
  if (!settings?.link || typeof settings.link !== "object") {
    return;
  }

  settings.link = {
    ...settings.link,
    custom_field: "0",
  };
};

const applyPostModuleCustomFieldReset = (module) => {
  const moduleKey = module?.key;
  const settings = module?.settings;

  if (!moduleKey || !settings || typeof settings !== "object") {
    return;
  }

  if (MODULES_WITH_FIELD_SOURCE.has(moduleKey)) {
    resetModuleCustomFieldSource(settings, moduleKey);
  }

  if (MODULES_WITH_LINK_CUSTOM_FIELD.has(moduleKey)) {
    resetModuleLinkCustomField(settings);
  }
};

/**
 * Sanitize a single imported post module (Import Module from post builder).
 */
export function sanitizeImportedPostModule(
  module,
  { currentPostType, importedPostType } = {}
) {
  if (!module || typeof module !== "object") {
    return module;
  }

  const next = cloneDeep(module);
  if (
    !shouldClearImportedPostCustomFieldsOnPostTypeMismatch(
      currentPostType,
      importedPostType
    )
  ) {
    return next;
  }

  clearCustomUploadedBackgroundImage(next);
  applyPostModuleCustomFieldReset(next);
  return next;
}

/** Sanitize all post modules inside an imported column or row tree. */
export function sanitizeImportedPostModulesInTree(
  container,
  importOptions = {}
) {
  if (!container || typeof container !== "object") {
    return container;
  }

  const next = cloneDeep(container);
  if (
    !shouldClearImportedPostCustomFieldsOnPostTypeMismatch(
      importOptions.currentPostType,
      importOptions.importedPostType
    )
  ) {
    return next;
  }

  const sanitizeModuleList = (modules) => {
    if (!Array.isArray(modules)) {
      return modules;
    }

    return modules.map((module) => sanitizeImportedPostModule(module, importOptions));
  };

  if (next.type === "column" && Array.isArray(next.data)) {
    clearCustomUploadedBackgroundImage(next);
    next.data = sanitizeModuleList(next.data);
    return next;
  }

  if (next.type === "row" && Array.isArray(next.data)) {
    clearCustomUploadedBackgroundImage(next);
    next.data = next.data.map((column) => {
      if (!column || typeof column !== "object") {
        return column;
      }
      const nextColumn = { ...column };
      clearCustomUploadedBackgroundImage(nextColumn);
      if (Array.isArray(nextColumn.data)) {
        nextColumn.data = sanitizeModuleList(nextColumn.data);
      }
      return nextColumn;
    });
  }

  return next;
}

/**
 * Clear post-layout custom field selections (and image placeholder URLs) after
 * cross-post-type import. Mirrors filter term clearing when post types differ.
 */
export function clearImportedPostLayoutCustomFields(postLayoutData) {
  if (!postLayoutData || typeof postLayoutData !== "object") {
    return postLayoutData;
  }

  const layout = cloneDeep(postLayoutData);
  const rows = layout.initial_data;

  if (!Array.isArray(rows)) {
    return layout;
  }

  rows.forEach((row) => {
    clearCustomUploadedBackgroundImage(row);
    (row?.data || []).forEach((column) => {
      clearCustomUploadedBackgroundImage(column);
      (column?.data || []).forEach((module) => {
        clearCustomUploadedBackgroundImage(module);
        applyPostModuleCustomFieldReset(module);
      });
    });
  });

  return layout;
};
