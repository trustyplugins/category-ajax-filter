/**
 * Sync saved filter/post term labels from live WordPress taxonomy names.
 * Used once when a layout is opened in the builder (option: refresh on open).
 */

/**
 * Live term labels keyed by `taxonomy:termId`.
 * @param {Array} taxonomyList
 * @returns {Record<string, string>}
 */
export const buildTermNameMapFromTaxonomyList = (taxonomyList = []) => {
  const nameMap = {};
  const walk = (taxonomyKey, terms) => {
    if (!Array.isArray(terms)) {
      return;
    }
    terms.forEach((term) => {
      const id = term?.id ?? term?.key;
      const name = term?.name ?? term?.value ?? term?.label;
      if (id != null && id !== "" && name != null && String(name) !== "") {
        nameMap[`${taxonomyKey}:${String(id)}`] = String(name);
      }
      if (Array.isArray(term?.children_data) && term.children_data.length) {
        walk(taxonomyKey, term.children_data);
      }
    });
  };
  (taxonomyList || []).forEach((tax) => {
    const key = String(tax?.key || "").trim();
    if (key) {
      walk(key, tax?.term_data);
    }
  });
  return nameMap;
};

const patchTermRows = (taxonomyKey, terms, nameMap) => {
  if (!Array.isArray(terms)) {
    return { next: terms, changed: false };
  }
  let changed = false;
  const next = terms.map((term) => {
    let nextTerm = term;
    const live = nameMap[`${taxonomyKey}:${String(term?.key ?? "")}`];
    if (live && String(term?.value ?? "") !== live) {
      changed = true;
      nextTerm = { ...nextTerm, value: live };
    }
    if (Array.isArray(term?.children_data) && term.children_data.length) {
      const childResult = patchTermRows(taxonomyKey, term.children_data, nameMap);
      if (childResult.changed) {
        changed = true;
        nextTerm = { ...nextTerm, children_data: childResult.next };
      }
    }
    return nextTerm;
  });
  return { next, changed };
};

/**
 * Patch taxonomy_data[].term_data[].value from a live name map.
 * @param {Array} taxonomyData
 * @param {Record<string, string>} nameMap
 * @returns {{ next: Array, changed: boolean }}
 */
export const syncTaxonomyDataTermLabels = (taxonomyData = [], nameMap) => {
  if (!nameMap || typeof nameMap !== "object" || !Array.isArray(taxonomyData)) {
    return { next: taxonomyData, changed: false };
  }
  let changed = false;
  const next = taxonomyData.map((group) => {
    const taxKey = String(group?.key || "");
    if (!taxKey || !Array.isArray(group?.term_data)) {
      return group;
    }
    const result = patchTermRows(taxKey, group.term_data, nameMap);
    if (!result.changed) {
      return group;
    }
    changed = true;
    return { ...group, term_data: result.next };
  });
  return { next, changed };
};

const walkLayoutRowsForTermLabels = (rows, nameMap) => {
  if (!Array.isArray(rows)) {
    return { next: rows, changed: false };
  }
  let changed = false;
  const next = rows.map((row) => {
    if (!Array.isArray(row?.data)) {
      return row;
    }
    let rowChanged = false;
    const nextColumns = row.data.map((column) => {
      if (!Array.isArray(column?.data)) {
        return column;
      }
      let colChanged = false;
      const nextModules = column.data.map((module) => {
        const settings = module?.settings;
        if (!settings || !Array.isArray(settings.taxonomy_data)) {
          return module;
        }
        const result = syncTaxonomyDataTermLabels(
          settings.taxonomy_data,
          nameMap
        );
        if (!result.changed) {
          return module;
        }
        colChanged = true;
        changed = true;
        rowChanged = true;
        return {
          ...module,
          settings: {
            ...settings,
            taxonomy_data: result.next,
          },
        };
      });
      return colChanged ? { ...column, data: nextModules } : column;
    });
    return rowChanged ? { ...row, data: nextColumns } : row;
  });
  return { next, changed };
};

/**
 * Refresh baked term.value snapshots across filter + post layout modules.
 * @param {object} doc Full layout document
 * @param {Record<string, string>} nameMap
 * @returns {{ doc: object, changed: boolean }}
 */
export const syncTermLabelsInLayoutDocument = (doc, nameMap) => {
  if (!doc || typeof doc !== "object" || !nameMap) {
    return { doc, changed: false };
  }

  let changed = false;
  const next = { ...doc };

  if (next.filter_layout_data && Array.isArray(next.filter_layout_data.initial_data)) {
    const filterResult = walkLayoutRowsForTermLabels(
      next.filter_layout_data.initial_data,
      nameMap
    );
    if (filterResult.changed) {
      changed = true;
      next.filter_layout_data = {
        ...next.filter_layout_data,
        initial_data: filterResult.next,
      };
    }
  }

  if (next.post_layout_data && Array.isArray(next.post_layout_data.initial_data)) {
    const postResult = walkLayoutRowsForTermLabels(
      next.post_layout_data.initial_data,
      nameMap
    );
    if (postResult.changed) {
      changed = true;
      next.post_layout_data = {
        ...next.post_layout_data,
        initial_data: postResult.next,
      };
    }
  }

  return { doc: next, changed };
};
