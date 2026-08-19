const stripPredefineInTermTree = (terms) => {
  if (!Array.isArray(terms)) {
    return terms;
  }

  return terms.map((term) => ({
    ...term,
    predefine: "false",
    children_data: stripPredefineInTermTree(term.children_data),
  }));
};

/** Attribute swatch no longer supports default-term selection — clear legacy saved data. */
export const stripAttributeSwatchDefaultTermSettings = (settings) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }

  settings.predefined_terms = [];
  settings.cf_predefined_terms = [];

  if (Array.isArray(settings.taxonomy_data)) {
    settings.taxonomy_data = settings.taxonomy_data.map((group) => ({
      ...group,
      term_data: stripPredefineInTermTree(group.term_data),
    }));
  }

  if (Array.isArray(settings.custom_field_data)) {
    settings.custom_field_data = settings.custom_field_data.map((cf) => ({
      ...cf,
      custom_field_value_list: (cf.custom_field_value_list || []).map((value) => ({
        ...value,
        predefine: "false",
      })),
    }));
  }

  return settings;
};

export const attributeSwatchSettingsHaveDefaultTermData = (settings) => {
  if (!settings || typeof settings !== "object") {
    return false;
  }

  if (
    (Array.isArray(settings.predefined_terms) &&
      settings.predefined_terms.length > 0) ||
    (Array.isArray(settings.cf_predefined_terms) &&
      settings.cf_predefined_terms.length > 0)
  ) {
    return true;
  }

  const walkTerms = (terms) => {
    if (!Array.isArray(terms)) {
      return false;
    }
    for (const term of terms) {
      if (String(term?.predefine) === "true") {
        return true;
      }
      if (walkTerms(term?.children_data)) {
        return true;
      }
    }
    return false;
  };

  if (Array.isArray(settings.taxonomy_data)) {
    for (const group of settings.taxonomy_data) {
      if (walkTerms(group?.term_data)) {
        return true;
      }
    }
  }

  if (Array.isArray(settings.custom_field_data)) {
    for (const cf of settings.custom_field_data) {
      for (const value of cf?.custom_field_value_list || []) {
        if (String(value?.predefine) === "true") {
          return true;
        }
      }
    }
  }

  return false;
};
