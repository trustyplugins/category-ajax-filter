import cloneDeep from "lodash/cloneDeep";

const TAXONOMY_FILTER_MODULE_KEYS = new Set([
  "checkbox_filter",
  "dropdown_filter",
]);

function clearSettingsKeyIfPresent(settings, key, emptyValue) {
  if (!settings || typeof settings !== "object") return;
  if (!Object.prototype.hasOwnProperty.call(settings, key)) return;
  settings[key] = emptyValue;
}

export function normalizeGroupedTaxonomyData(value) {
  const source = Array.isArray(value) ? value : [];
  if (source.length === 0) return [];
  if (Array.isArray(source[0])) return source;
  return [source];
}

function isTaxonomyGroup(node) {
  return (
    node &&
    typeof node === "object" &&
    typeof node.key === "string" &&
    Array.isArray(node.term_data)
  );
}

export function collectTaxonomyKeysFromFilterLayout(filterLayoutData) {
  const keys = new Set();
  const walkGroups = (taxonomyData) => {
    normalizeGroupedTaxonomyData(taxonomyData).forEach((entry) => {
      if (isTaxonomyGroup(entry)) {
        keys.add(entry.key);
        return;
      }
      if (Array.isArray(entry)) {
        entry.forEach((group) => {
          if (group?.key) keys.add(group.key);
        });
      }
    });
  };

  (filterLayoutData?.initial_data || []).forEach((row) => {
    (row?.data || []).forEach((col) => {
      (col?.data || []).forEach((module) => {
        walkGroups(module?.settings?.taxonomy_data);
      });
    });
  });

  walkGroups(filterLayoutData?.filter_query_data?.taxonomy_data);
  return [...keys];
}

export async function fetchVerifiedTaxonomyMap(
  apiClient,
  apiEndpoints,
  taxonomyKeys
) {
  const keys = [...new Set((taxonomyKeys || []).filter(Boolean))];
  if (keys.length === 0) return {};

  const res = await apiClient.get(apiEndpoints.verifyTaxonomyTerms(keys));
  if (res?.data?.status !== "success" || !res.data.taxonomy_data) {
    return {};
  }

  const map = {};
  Object.entries(res.data.taxonomy_data).forEach(([taxonomy, ids]) => {
    map[taxonomy] = new Set((ids || []).map((id) => String(id)));
  });
  return map;
}

function filterTermTreeByValidIds(terms, validIds) {
  if (!Array.isArray(terms)) return [];
  return terms
    .map((term) => {
      const key = String(term?.key ?? "");
      if (!validIds.has(key)) return null;
      return {
        ...term,
        predefine: String(term?.predefine) === "true" ? "true" : "false",
        children_data: filterTermTreeByValidIds(term?.children_data, validIds),
      };
    })
    .filter(Boolean);
}

function emptyTaxonomyGroups(taxonomyData) {
  if (!Array.isArray(taxonomyData)) return taxonomyData;
  return taxonomyData.map((entry) => {
    if (isTaxonomyGroup(entry)) {
      return { ...entry, term_data: [] };
    }
    if (Array.isArray(entry)) {
      return entry.map((group) =>
        isTaxonomyGroup(group) ? { ...group, term_data: [] } : group
      );
    }
    return entry;
  });
}

function filterTaxonomyGroups(taxonomyData, validTaxonomyMap) {
  if (!Array.isArray(taxonomyData)) return taxonomyData;
  return taxonomyData.map((entry) => {
    if (isTaxonomyGroup(entry)) {
      const validIds = validTaxonomyMap[entry.key] || new Set();
      return {
        ...entry,
        term_data: filterTermTreeByValidIds(entry.term_data, validIds),
      };
    }
    if (Array.isArray(entry)) {
      return entry.map((group) => {
        if (!isTaxonomyGroup(group)) return group;
        const validIds = validTaxonomyMap[group.key] || new Set();
        return {
          ...group,
          term_data: filterTermTreeByValidIds(group.term_data, validIds),
        };
      });
    }
    return entry;
  });
}

export function filterPredefinedTerms(predefinedTerms, validTaxonomyMap) {
  return (predefinedTerms || []).filter((entry) => {
    const token = String(entry);
    if (!token.includes("___")) return false;
    const idx = token.lastIndexOf("___");
    const taxonomy = token.slice(0, idx);
    const termId = token.slice(idx + 3);
    const validIds = validTaxonomyMap[taxonomy];
    return validIds && validIds.has(String(termId));
  });
}

function applyPredefineFlagsFromPredefined(taxonomyData, predefinedTerms) {
  const preset = new Set((predefinedTerms || []).map((entry) => String(entry)));

  const mapGroup = (group) => {
    if (!isTaxonomyGroup(group)) return group;
    const taxonomy = group.key;
    const walk = (terms) =>
      (terms || []).map((term) => {
        const token = `${taxonomy}___${term.key}`;
        return {
          ...term,
          predefine: preset.has(token) ? "true" : "false",
          children_data: walk(term.children_data),
        };
      });
    return { ...group, term_data: walk(group.term_data) };
  };

  if (!Array.isArray(taxonomyData)) return taxonomyData;
  return taxonomyData.map((entry) => {
    if (isTaxonomyGroup(entry)) return mapGroup(entry);
    if (Array.isArray(entry)) return entry.map((group) => mapGroup(group));
    return entry;
  });
}

export function sanitizeModuleTaxonomySettings(
  settings,
  validTaxonomyMap,
  clearAllTermSelections
) {
  if (!settings || typeof settings !== "object") return settings;
  const next = { ...settings };

  if (clearAllTermSelections) {
    next.predefined_terms = [];
    clearSettingsKeyIfPresent(next, "cf_predefined_terms", []);
    next.taxonomy_data = emptyTaxonomyGroups(next.taxonomy_data);
    clearSettingsKeyIfPresent(next, "custom_field_data", []);
    return next;
  }

  next.predefined_terms = filterPredefinedTerms(
    next.predefined_terms,
    validTaxonomyMap
  );
  next.taxonomy_data = filterTaxonomyGroups(next.taxonomy_data, validTaxonomyMap);
  next.taxonomy_data = applyPredefineFlagsFromPredefined(
    next.taxonomy_data,
    next.predefined_terms
  );
  return next;
}

function isTaxonomyFilterModule(module) {
  if (!module?.settings) return false;
  if (TAXONOMY_FILTER_MODULE_KEYS.has(module.key)) return true;
  return (
    module.settings?.data_source === "taxonomy" &&
    Array.isArray(module.settings?.taxonomy_data)
  );
}

export function collectTaxonomyKeysFromModuleSettings(settings) {
  const keys = new Set();
  (settings?.taxonomy_data || []).forEach((group) => {
    if (group?.key) keys.add(group.key);
  });
  return [...keys];
}

/**
 * Sanitize a single imported filter module (module import from New Module / Import Module).
 */
export async function sanitizeImportedFilterModule(
  module,
  { apiClient, apiEndpoints, currentPostType, importedPostType }
) {
  if (!module || typeof module !== "object") return module;
  const next = cloneDeep(module);
  if (!next.settings || typeof next.settings !== "object") {
    return next;
  }

  const resolvedImportedPostType =
    importedPostType || next.settings?.post_type || "";
  const resolvedCurrentPostType = currentPostType || "";
  const clearAllTermSelections =
    Boolean(resolvedCurrentPostType) &&
    Boolean(resolvedImportedPostType) &&
    resolvedCurrentPostType !== resolvedImportedPostType;

  if (!isTaxonomyFilterModule(next)) {
    if (clearAllTermSelections) {
      clearSettingsKeyIfPresent(next.settings, "cf_predefined_terms", []);
      clearSettingsKeyIfPresent(next.settings, "custom_field_data", []);
    }
    if (resolvedCurrentPostType) {
      next.settings.post_type = resolvedCurrentPostType;
    }
    return next;
  }

  let validTaxonomyMap = {};
  if (!clearAllTermSelections) {
    const taxonomyKeys = collectTaxonomyKeysFromModuleSettings(next.settings);
    validTaxonomyMap = await fetchVerifiedTaxonomyMap(
      apiClient,
      apiEndpoints,
      taxonomyKeys
    );
  }

  next.settings = sanitizeModuleTaxonomySettings(
    next.settings,
    validTaxonomyMap,
    clearAllTermSelections
  );
  if (resolvedCurrentPostType) {
    next.settings.post_type = resolvedCurrentPostType;
  }

  return next;
}

/** Sanitize all filter modules inside an imported column or row tree. */
export async function sanitizeImportedFilterModulesInTree(
  container,
  importOptions
) {
  if (!container || typeof container !== "object") return container;
  const next = cloneDeep(container);

  const sanitizeModuleList = async (modules) => {
    if (!Array.isArray(modules)) return modules;
    const sanitized = [];
    for (const module of modules) {
      sanitized.push(await sanitizeImportedFilterModule(module, importOptions));
    }
    return sanitized;
  };

  if (next.type === "column" && Array.isArray(next.data)) {
    next.data = await sanitizeModuleList(next.data);
    return next;
  }

  if (next.type === "row" && Array.isArray(next.data)) {
    for (let i = 0; i < next.data.length; i += 1) {
      const col = next.data[i];
      if (col && Array.isArray(col.data)) {
        col.data = await sanitizeModuleList(col.data);
      }
    }
  }

  return next;
}

export async function sanitizeFilterLayoutTermData(
  filterLayoutData,
  { apiClient, apiEndpoints, clearAllTermSelections = false }
) {
  if (!filterLayoutData) return filterLayoutData;
  const layout = cloneDeep(filterLayoutData);

  let validTaxonomyMap = {};
  if (!clearAllTermSelections) {
    const taxonomyKeys = collectTaxonomyKeysFromFilterLayout(layout);
    validTaxonomyMap = await fetchVerifiedTaxonomyMap(
      apiClient,
      apiEndpoints,
      taxonomyKeys
    );
  }

  (layout.initial_data || []).forEach((row) => {
    (row?.data || []).forEach((col) => {
      (col?.data || []).forEach((module) => {
        if (!module?.settings) return;
        if (isTaxonomyFilterModule(module)) {
          module.settings = sanitizeModuleTaxonomySettings(
            module.settings,
            validTaxonomyMap,
            clearAllTermSelections
          );
          return;
        }
        if (clearAllTermSelections) {
          clearSettingsKeyIfPresent(module.settings, "cf_predefined_terms", []);
          clearSettingsKeyIfPresent(module.settings, "custom_field_data", []);
        }
      });
    });
  });

  if (layout.filter_query_data) {
    const query = layout.filter_query_data;
    layout.filter_query_data = {
      ...query,
      predefined_terms: clearAllTermSelections
        ? []
        : filterPredefinedTerms(query.predefined_terms, validTaxonomyMap),
      cf_predefined_terms: clearAllTermSelections
        ? Object.prototype.hasOwnProperty.call(query, "cf_predefined_terms")
          ? []
          : query.cf_predefined_terms
        : [...(query.cf_predefined_terms || [])],
      taxonomy_data: clearAllTermSelections
        ? emptyTaxonomyGroups(query.taxonomy_data)
        : applyPredefineFlagsFromPredefined(
            filterTaxonomyGroups(query.taxonomy_data, validTaxonomyMap),
            filterPredefinedTerms(query.predefined_terms, validTaxonomyMap)
          ),
      ...(clearAllTermSelections &&
      Object.prototype.hasOwnProperty.call(query, "custom_field_data")
        ? {
            custom_field_data: [],
            data_source: {
              ...(query.data_source || {}),
              custom_field: "false",
            },
          }
        : {}),
    };
  }

  return layout;
}
