/**
 * Helpers for keeping filter term counts in sync with live taxonomy totals.
 */

export const termCountNeedsBackfill = (count) =>
  count == null || count === "";

export const buildTermCountMapFromTaxonomyList = (taxonomyList = []) => {
  const countMap = new Map();
  const walk = (terms) => {
    if (!Array.isArray(terms)) {
      return;
    }
    terms.forEach((term) => {
      if (term?.id != null) {
        countMap.set(String(term.id), term?.total_count ?? term?.count ?? 0);
      }
      if (Array.isArray(term?.children_data) && term.children_data.length) {
        walk(term.children_data);
      }
    });
  };
  (taxonomyList || []).forEach((tax) => walk(tax?.term_data));
  return countMap;
};

/**
 * @param {Array} taxonomyData Saved module taxonomy_data.
 * @param {Map<string, number>} countMap Live counts keyed by term id.
 * @returns {{ next: Array, changed: boolean }}
 */
export const backfillTaxonomyDataCounts = (taxonomyData = [], countMap) => {
  if (!(countMap instanceof Map) || !Array.isArray(taxonomyData)) {
    return { next: taxonomyData, changed: false };
  }

  let changed = false;
  const next = taxonomyData.map((group) => {
    if (!Array.isArray(group?.term_data)) {
      return group;
    }
    let groupChanged = false;
    const nextTerms = group.term_data.map((term) => {
      const fresh = countMap.get(String(term?.key));
      if (fresh === undefined) {
        return term;
      }
      if (
        !termCountNeedsBackfill(term?.count) &&
        Number(term.count) === Number(fresh)
      ) {
        return term;
      }
      groupChanged = true;
      changed = true;
      return { ...term, count: fresh };
    });
    return groupChanged ? { ...group, term_data: nextTerms } : group;
  });

  return { next, changed };
};
