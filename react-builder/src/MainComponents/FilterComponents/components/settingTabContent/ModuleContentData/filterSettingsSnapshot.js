const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizePostType = (postType) =>
  typeof postType === "string" ? postType.trim() : "";

/** Deep clone full filter layout tree (rows → columns → modules). Use before mutating layout/style. */
export const cloneFilterLayoutData = (data) =>
  JSON.parse(JSON.stringify(data || []));

export const createFilterModuleSettingsSnapshot = ({
  data,
  rowindex,
  columnindex,
  moduleindex,
  resolvedPostType,
}) => {
  const freshItems = JSON.parse(JSON.stringify(data || []));
  const moduleRef =
    freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  const settingsRef = moduleRef?.settings ? { ...moduleRef.settings } : {};

  settingsRef.taxonomy_data = ensureArray(settingsRef.taxonomy_data);
  settingsRef.predefined_terms = ensureArray(settingsRef.predefined_terms);
  settingsRef.cf_predefined_terms = ensureArray(settingsRef.cf_predefined_terms);

  const modulePt = normalizePostType(settingsRef.post_type);
  const resolvedPt = normalizePostType(resolvedPostType);

  // Only clear term picks when the module was explicitly tied to a *different* post type.
  // If `post_type` is missing (undefined / ""), set it without wiping taxonomy — otherwise every
  // snapshot looked like a mismatch and term selections never stuck after reset.
  if (resolvedPt && modulePt && modulePt !== resolvedPt) {
    settingsRef.post_type = resolvedPt;
    settingsRef.taxonomy_data = [];
    settingsRef.predefined_terms = [];
    settingsRef.cf_predefined_terms = [];
  } else if (resolvedPt && !modulePt) {
    settingsRef.post_type = resolvedPt;
  }

  if (moduleRef) {
    moduleRef.settings = settingsRef;
  }

  return { freshItems, settingsRef };
};

export const commitFilterModuleTaxonomyData = ({
  freshItems,
  rowindex,
  columnindex,
  moduleindex,
  settingsRef,
  nexttaxonomyData,
  onSettingChange,
  onAfterCommit,
}) => {
  
  const moduleRef =
    freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];

  if (!moduleRef || typeof onSettingChange !== "function") {
    return;
  }

  moduleRef.settings = {
    ...settingsRef,
    taxonomy_data: ensureArray(nexttaxonomyData),
  };

  if (typeof onAfterCommit === "function") {
    onAfterCommit(moduleRef.settings);
  }

  onSettingChange(freshItems);
};

/**
 * Deep snapshot + patch current module settings, then commit layout.
 * `patch(settingsRef)` should mutate `settingsRef` in place.
 */
export const commitFilterModuleSettingsPatch = ({
  data,
  rowindex,
  columnindex,
  moduleindex,
  resolvedPostType,
  onSettingChange,
  onAfterCommit,
  patch,
}) => {
  const { freshItems, settingsRef } = createFilterModuleSettingsSnapshot({
    data,
    rowindex,
    columnindex,
    moduleindex,
    resolvedPostType,
  });
  const moduleRef =
    freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  if (
    !moduleRef ||
    typeof patch !== "function" ||
    typeof onSettingChange !== "function"
  ) {
    return;
  }
  patch(settingsRef);
  moduleRef.settings = settingsRef;
  if (typeof onAfterCommit === "function") {
    onAfterCommit(settingsRef);
  }
  onSettingChange(freshItems);
};

/**
 * Replace entire module settings object (deep clone) and commit layout.
 * Optional `patchModule(moduleRef)` runs after settings are assigned (e.g. seed style sections).
 */
export const commitFilterModuleReplaceSettings = ({
  data,
  rowindex,
  columnindex,
  moduleindex,
  resolvedPostType,
  onSettingChange,
  onAfterCommit,
  nextSettings,
  patchModule,
}) => {
  const { freshItems } = createFilterModuleSettingsSnapshot({
    data,
    rowindex,
    columnindex,
    moduleindex,
    resolvedPostType,
  });
  const moduleRef =
    freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  if (!moduleRef || typeof onSettingChange !== "function") {
    return;
  }
  const merged =
    typeof nextSettings === "object" && nextSettings !== null
      ? JSON.parse(JSON.stringify(nextSettings))
      : {};
  merged.taxonomy_data = ensureArray(merged.taxonomy_data);
  merged.predefined_terms = ensureArray(merged.predefined_terms);
  merged.cf_predefined_terms = ensureArray(merged.cf_predefined_terms);
  moduleRef.settings = merged;
  if (typeof patchModule === "function") {
    patchModule(moduleRef);
  }
  if (typeof onAfterCommit === "function") {
    onAfterCommit(moduleRef.settings);
  }
  onSettingChange(freshItems);
};

/**
 * Preview / builder passes different `onSettingChange` shapes:
 * - Filter MainArea (Redux): expects the layout array only.
 * - OutputArea (embedded): expects full `mainBuilderData` with `filter_layout_data.initial_data` updated.
 */
export const allowsMultipleDefaultTerms = (settings, { forceSingle = false } = {}) => {
  if (forceSingle) {
    return false;
  }
  return String(settings?.multiple_term) === "true";
};

export const extractNumericTermIdFromPredefinedKey = (predefinedKey) => {
  const key = String(predefinedKey || "");
  const idx = key.lastIndexOf("___");
  return idx >= 0 ? key.slice(idx + 3) : key;
};

export const clearAllTermPredefineInTree = (terms) => {
  if (!Array.isArray(terms)) {
    return [];
  }
  return terms.map((obj) => ({
    ...obj,
    predefine: "false",
    children_data: clearAllTermPredefineInTree(obj.children_data),
  }));
};

export const setTermPredefineInTree = (terms, termId, checked) => {
  if (!Array.isArray(terms)) {
    return [];
  }
  return terms.map((obj) => {
    if (String(obj.key) === String(termId)) {
      return { ...obj, predefine: checked ? "true" : "false" };
    }
    if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
      return {
        ...obj,
        children_data: setTermPredefineInTree(obj.children_data, termId, checked),
      };
    }
    return obj;
  });
};

export const setSingleDefaultPredefineInTree = (terms, termId) => {
  if (!Array.isArray(terms)) {
    return [];
  }
  return terms.map((obj) => ({
    ...obj,
    predefine: String(obj.key) === String(termId) ? "true" : "false",
    children_data: setSingleDefaultPredefineInTree(obj.children_data || [], termId),
  }));
};

/** Update predefined_terms + taxonomy tree for a default-term toggle. */
export const applyTaxonomyDefaultTermToSettings = ({
  settingsRef,
  termKey,
  taxonomyKey,
  numericTermId,
  checked,
  allowMultiple,
}) => {
  const predefined = ensureArray(settingsRef.predefined_terms);
  const isPresent = predefined.includes(termKey);

  if (checked) {
    settingsRef.predefined_terms = allowMultiple
      ? isPresent
        ? predefined
        : [...predefined, termKey]
      : [termKey];
  } else if (isPresent) {
    settingsRef.predefined_terms = predefined.filter((item) => item !== termKey);
  }

  settingsRef.taxonomy_data = ensureArray(settingsRef.taxonomy_data).map((group) => {
    let termData = ensureArray(group.term_data);
    if (!allowMultiple && checked) {
      termData = clearAllTermPredefineInTree(termData);
    }
    if (group.key === taxonomyKey) {
      termData = setTermPredefineInTree(termData, numericTermId, checked);
    } else if (!allowMultiple && checked) {
      termData = clearAllTermPredefineInTree(termData);
    }
    return { ...group, term_data: termData };
  });
};

/** Update custom-field default term arrays + predefine flags. */
export const applyCustomFieldDefaultTermToSettings = ({
  customFieldData,
  cfPredefinedTerms,
  termId,
  cfIndex,
  valueIndex,
  checked,
  allowMultiple,
}) => {
  const predefined = ensureArray(cfPredefinedTerms);
  const isPresent = predefined.includes(termId);

  let nextPredefined;
  if (checked) {
    nextPredefined = allowMultiple
      ? isPresent
        ? predefined
        : [...predefined, termId]
      : [termId];
  } else {
    nextPredefined = predefined.filter((item) => item !== termId);
  }

  const nextCustomFieldData = ensureArray(customFieldData).map((item, id) => {
    const valueList = ensureArray(item.custom_field_value_list).map((value, vid) => {
      if (!allowMultiple && checked) {
        if (id === cfIndex && vid === valueIndex) {
          return { ...value, predefine: "true" };
        }
        return { ...value, predefine: "false" };
      }
      if (id === cfIndex && vid === valueIndex) {
        return { ...value, predefine: checked ? "true" : "false" };
      }
      return value;
    });
    return { ...item, custom_field_value_list: valueList };
  });

  return {
    customFieldData: nextCustomFieldData,
    cfPredefinedTerms: nextPredefined,
  };
};

/** Keep at most one default term when multi-select is off (or always for dropdown). */
export const enforceSingleDefaultTermsInSettings = (
  settings,
  { forceSingle = false } = {}
) => {
  if (allowsMultipleDefaultTerms(settings, { forceSingle })) {
    return settings;
  }

  const next = JSON.parse(JSON.stringify(settings || {}));
  next.predefined_terms = ensureArray(next.predefined_terms);
  next.cf_predefined_terms = ensureArray(next.cf_predefined_terms);

  if (next.predefined_terms.length > 1) {
    next.predefined_terms = [
      next.predefined_terms[next.predefined_terms.length - 1],
    ];
  }

  if (next.cf_predefined_terms.length > 1) {
    next.cf_predefined_terms = [
      next.cf_predefined_terms[next.cf_predefined_terms.length - 1],
    ];
  }

  const taxonomyDefaultId = next.predefined_terms[0]
    ? extractNumericTermIdFromPredefinedKey(next.predefined_terms[0])
    : null;

  next.taxonomy_data = ensureArray(next.taxonomy_data).map((group) => ({
    ...group,
    term_data: taxonomyDefaultId
      ? setSingleDefaultPredefineInTree(
          clearAllTermPredefineInTree(group.term_data),
          taxonomyDefaultId
        )
      : clearAllTermPredefineInTree(group.term_data),
  }));

  const cfDefaultId = next.cf_predefined_terms[0] || null;
  next.custom_field_data = ensureArray(next.custom_field_data).map((item) => ({
    ...item,
    custom_field_value_list: ensureArray(item.custom_field_value_list).map((value) => {
      const valueKey = `${String(item.custom_field_key).trim()}___${String(value.key).trim()}`;
      return {
        ...value,
        predefine: cfDefaultId && valueKey === cfDefaultId ? "true" : "false",
      };
    }),
  }));

  return next;
};

export const dispatchFilterLayoutChange = ({
  freshItems,
  mainBuilderData,
  onSettingChange,
}) => {
  if (typeof onSettingChange !== "function") return;
  const hasEmbeddedShape =
    mainBuilderData &&
    typeof mainBuilderData === "object" &&
    mainBuilderData.filter_layout_data &&
    typeof mainBuilderData.filter_layout_data === "object";

  if (hasEmbeddedShape) {
    onSettingChange({
      ...mainBuilderData,
      filter_layout_data: {
        ...mainBuilderData.filter_layout_data,
        initial_data: freshItems,
      },
    });
  } else if (typeof console !== "undefined" && console.error) {
    // Callers must pass full mainBuilderData so we never commit a bare rows array.
    console.error(
      "[CAF Builder] dispatchFilterLayoutChange called without a full layout document; update skipped."
    );
  }
};
