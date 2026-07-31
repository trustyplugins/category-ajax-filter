import { CAFSmartFilterSearch } from "./smartFilterSearchEngine";
import { previewFilterResetMatchesModule } from "./previewSelectedTagsClose";

const PREVIEW_FILTER_ROOT = ".caf-builder-template-preview-filter";

export const PREVIEW_SMART_MATCH_COUNT_ATTR = "data-caf-smart-matched-terms-count";

const engine = CAFSmartFilterSearch;

const getFilterRoot = (scopeDocument) =>
  scopeDocument.querySelector(PREVIEW_FILTER_ROOT);

export const getPreviewSmartMatchedTermsCount = (scopeDocument) => {
  const root = getFilterRoot(scopeDocument);
  return parseInt(root?.getAttribute(PREVIEW_SMART_MATCH_COUNT_ATTR) || "0", 10) || 0;
};

const setPreviewSmartMatchedTermsCount = (scopeDocument, count) => {
  const root = getFilterRoot(scopeDocument);
  if (root) {
    root.setAttribute(PREVIEW_SMART_MATCH_COUNT_ATTR, String(count));
  }
};

export const clearPreviewSmartSearchSelections = (scopeDocument) => {
  scopeDocument.dispatchEvent(new CustomEvent("caf-preview-smart-search-clear"));
  setPreviewSmartMatchedTermsCount(scopeDocument, 0);
};

const buildListContextTokens = (taxonomyKey, moduleLabel) => {
  const listContextTokens = new Set();
  const addTokens = (value) => {
    engine
      .getContextTokens(String(value || "").replace(/[_-]+/g, " "))
      .forEach((token) => listContextTokens.add(token));
  };
  addTokens(taxonomyKey);
  addTokens(moduleLabel);
  return listContextTokens;
};

const scoreTermMatch = ({
  keyword,
  queryNorm,
  queryContextTokens,
  queryNumericMeta,
  queryContextValuePairs,
  queryRawLower,
  queryHasPlusThreshold,
  rawTermLabel,
  listContextTokens,
}) => {
  const termLabel = engine.normalize(rawTermLabel);
  if (!termLabel) {
    return 0;
  }

  let textScore = 0;
  const termTextTokens = engine.getContextTokens(rawTermLabel);
  if (termLabel && termTextTokens.length && queryNorm.includes(termLabel)) {
    textScore += 110;
  }
  if (queryContextTokens.length && termTextTokens.length) {
    let overlapCount = 0;
    queryContextTokens.forEach((queryToken) => {
      const matched = termTextTokens.some((termToken) =>
        engine.isTokenMatch(queryToken, termToken)
      );
      if (matched) {
        overlapCount += 1;
      }
    });
    if (overlapCount > 0) {
      textScore += overlapCount * 45;
      if (
        queryContextTokens.some((queryToken) => {
          for (const listToken of listContextTokens) {
            if (engine.isTokenMatch(queryToken, listToken)) {
              return true;
            }
          }
          return false;
        }) ||
        listContextTokens.size === 0
      ) {
        textScore += 15;
      }
    }
  }

  const termNumericMeta = engine.extractNumericMeta(rawTermLabel);
  const termRawLower = String(rawTermLabel || "").toLowerCase();
  const termHasPlusThreshold = /\b\d+(?:\.\d+)?\s*\+/.test(termRawLower);

  const requiresNumericContext =
    queryNumericMeta.numbers.length > 0 && queryContextTokens.length > 0;
  const hasListContextTokens = listContextTokens.size > 0;
  const contextMatched =
    !requiresNumericContext ||
    queryContextTokens.some((queryToken) => {
      for (const listToken of listContextTokens) {
        if (engine.isTokenMatch(queryToken, listToken)) {
          return true;
        }
      }
      return false;
    });

  const constrainedNumbers = queryContextValuePairs
    .filter((pair) => {
      for (const listToken of listContextTokens) {
        if (engine.isTokenMatch(pair.context, listToken)) {
          return true;
        }
      }
      return false;
    })
    .map((pair) => pair.value);
  const uniqueConstrainedNumbers = Array.from(new Set(constrainedNumbers));
  const numericMetaForList = uniqueConstrainedNumbers.length
    ? {
        ...queryNumericMeta,
        numbers: uniqueConstrainedNumbers,
        comparator: "eq",
        ranges: [],
      }
    : queryNumericMeta;
  const numericScore = engine.scoreNumericMatch(numericMetaForList, termNumericMeta);

  if (
    requiresNumericContext &&
    hasListContextTokens &&
    !contextMatched &&
    termNumericMeta.numbers.length > 0
  ) {
    return 0;
  }

  if (
    termNumericMeta.numbers.length > 0 &&
    queryNumericMeta.comparator === "range" &&
    termNumericMeta.comparator !== "range"
  ) {
    return 0;
  }

  let adjustedScore = textScore + numericScore;
  if (queryHasPlusThreshold && termNumericMeta.numbers.length > 0) {
    if (termHasPlusThreshold) {
      adjustedScore += 180;
    } else {
      adjustedScore -= 160;
    }
  }

  return adjustedScore > 0
    ? {
        score: adjustedScore,
        termHasNumeric: termNumericMeta.numbers.length > 0,
        requiresNumericContext,
        hasListContextTokens,
        contextMatched,
        constrainedNumbers: uniqueConstrainedNumbers,
      }
    : null;
};

const walkInitialModules = (mainBuilderData, visitor) => {
  const initialData = mainBuilderData?.filter_layout_data?.initial_data;
  if (!Array.isArray(initialData)) {
    return;
  }
  initialData.forEach((row, rowindex) => {
    (row?.data || []).forEach((column, columnindex) => {
      (column?.data || []).forEach((module, moduleindex) => {
        visitor(module, { rowindex, columnindex, moduleindex });
      });
    });
  });
};

const flattenTaxonomyTerms = (termData = []) => {
  const items = [];
  const walk = (nodes) => {
    (nodes || []).forEach((term) => {
      if (term?.key != null && String(term.key) !== "" && String(term.key) !== "0") {
        items.push({
          termId: String(term.key),
          label: String(term.value || term.label || ""),
        });
      }
      walk(term.children_data || []);
    });
  };
  walk(termData);
  return items;
};

const flattenCustomFieldTerms = (settings) => {
  const group = Array.isArray(settings?.custom_field_data)
    ? settings.custom_field_data[0]
    : settings?.custom_field_data;
  const list = group?.custom_field_value_list || [];
  return list
    .filter((item) => item?.key != null && String(item.key) !== "")
    .map((item) => ({
      termId: String(item.key),
      label: String(item.label || item.value || item.key),
      metaKey: String(group?.custom_field_key || ""),
    }));
};

const resolvePreviewSmartMatches = (mainBuilderData, keyword) => {
  const queryNorm = engine.normalize(keyword);
  if (!queryNorm) {
    return [];
  }

  const queryTokens = engine.tokenize(keyword);
  const queryNumericMeta = engine.extractNumericMeta(keyword);
  const queryContextTokens = engine.getContextTokens(keyword);
  const queryContextValuePairs = engine.extractContextValuePairs(keyword);
  const queryRawLower = String(keyword || "").toLowerCase();
  const queryHasPlusThreshold = /\b\d+(?:\.\d+)?\s*\+/.test(queryRawLower);

  const matches = [];

  walkInitialModules(mainBuilderData, (module, position) => {
    const settings = module?.settings || {};
    const moduleLabel = settings?.label?.value || "";
    const { rowindex, columnindex, moduleindex } = position;

    const pushTermMatches = ({
      filterType,
      dataSource,
      multipleTerm,
      dataKey,
      terms,
    }) => {
      const listContextTokens = buildListContextTokens(dataKey, moduleLabel);
      terms.forEach((term) => {
        const scored = scoreTermMatch({
          keyword,
          queryNorm,
          queryContextTokens,
          queryNumericMeta,
          queryContextValuePairs,
          queryRawLower,
          queryHasPlusThreshold,
          rawTermLabel: term.label,
          listContextTokens,
        });
        if (!scored) {
          return;
        }
        matches.push({
          ...scored,
          kind: "term",
          termId: term.termId,
          filterType,
          dataSource,
          multipleTerm,
          rowindex,
          columnindex,
          moduleindex,
          moduleKey: module.key,
        });
      });
    };

    if (
      (module.key === "checkbox_filter" || module.key === "dropdown_filter") &&
      settings.data_source === "taxonomy"
    ) {
      (settings.taxonomy_data || []).forEach((group) => {
        pushTermMatches({
          filterType: module.key === "dropdown_filter" ? "dropdown" : "checkbox",
          dataSource: "taxonomy",
          multipleTerm: settings.multiple_term === "true",
          dataKey: group?.key || "",
          terms: flattenTaxonomyTerms(group?.term_data || []),
        });
      });
    }

    if (
      (module.key === "checkbox_filter" || module.key === "dropdown_filter") &&
      settings.data_source === "custom_field"
    ) {
      const cfGroup = Array.isArray(settings.custom_field_data)
        ? settings.custom_field_data[0]
        : settings.custom_field_data;
      pushTermMatches({
        filterType: module.key === "dropdown_filter" ? "dropdown" : "checkbox",
        dataSource: "custom_field",
        multipleTerm: settings.multiple_term === "true",
        dataKey: cfGroup?.custom_field_key || "",
        terms: flattenCustomFieldTerms(settings),
      });
    }

    if (module.key === "range_slider" && queryNumericMeta.numbers.length > 0) {
      const cfGroup = Array.isArray(settings?.custom_field_data)
        ? settings.custom_field_data[0]
        : settings?.custom_field_data;
      const metaKey = String(cfGroup?.custom_field_key || "").trim();
      if (!metaKey || metaKey === "0") {
        return;
      }

      const sliderContextTokens = buildListContextTokens(metaKey, moduleLabel);
      const contextMatched = queryContextTokens.some((queryToken) => {
        for (const sliderToken of sliderContextTokens) {
          if (engine.isTokenMatch(queryToken, sliderToken)) {
            return true;
          }
        }
        return false;
      });
      if (!contextMatched) {
        return;
      }

      matches.push({
        kind: "range_slider",
        score: 200,
        rowindex,
        columnindex,
        moduleindex,
        metaKey,
        comparator: queryNumericMeta.comparator,
        exactIntent: Boolean(queryNumericMeta.exactIntent),
        numbers: queryContextValuePairs
          .filter((pair) => {
            for (const sliderToken of sliderContextTokens) {
              if (engine.isTokenMatch(pair.context, sliderToken)) {
                return true;
              }
            }
            return false;
          })
          .map((pair) => pair.value),
        fallbackNumbers: queryNumericMeta.numbers,
        ranges: queryNumericMeta.ranges,
        sliderType: String(settings?.range_slider?.type || "double"),
        min: Number(settings?.range_slider?.min ?? 0),
        max: Number(settings?.range_slider?.max ?? 100),
      });
    }
  });

  return matches;
};

const dispatchModuleEvent = (scopeDocument, eventName, detail) => {
  scopeDocument.dispatchEvent(
    new CustomEvent(eventName, {
      detail,
    })
  );
};

export const applyPreviewSmartFilterSearch = ({
  scopeDocument,
  mainBuilderData,
  keyword,
  searchSettings = {},
}) => {
  clearPreviewSmartSearchSelections(scopeDocument);

  if (!searchSettings.smartEnabled) {
    return 0;
  }

  const trimmed = String(keyword || "").trim();
  if (!trimmed) {
    return 0;
  }

  const queryNumericMeta = engine.extractNumericMeta(trimmed);
  const queryContextTokens = engine.getContextTokens(trimmed);
  const normalizedKeyword = engine.normalize(trimmed);
  const isBareNumericQuery = /^\d+(?:\.\d+)?$/.test(
    String(normalizedKeyword || "").trim()
  );

  if (
    isBareNumericQuery &&
    queryNumericMeta.numbers.length > 0 &&
    !queryNumericMeta.comparator &&
    (!Array.isArray(queryNumericMeta.ranges) || !queryNumericMeta.ranges.length) &&
    queryContextTokens.length === 0
  ) {
    return 0;
  }

  const matches = resolvePreviewSmartMatches(mainBuilderData, trimmed);
  if (!matches.length) {
    return 0;
  }

  const rangeMatches = matches.filter((entry) => entry.kind === "range_slider");
  const termMatches = matches.filter((entry) => entry.kind === "term");

  let matchCount = 0;

  rangeMatches.forEach((entry) => {
    const safeSliderMin = Number.isFinite(entry.min) ? entry.min : 0;
    const safeSliderMax = Number.isFinite(entry.max) ? entry.max : 100;
    const rangeType = entry.sliderType === "single" ? "single" : "double";
    const chosenNumbers = entry.numbers.length
      ? entry.numbers
      : entry.fallbackNumbers || [];
    const queryNum = chosenNumbers.length ? chosenNumbers[0] : null;

    let newMin = safeSliderMin;
    let newMax = safeSliderMax;

    if (entry.exactIntent && queryNum !== null) {
      const exactValue = Math.max(safeSliderMin, Math.min(queryNum, safeSliderMax));
      if (rangeType === "single") {
        newMin = safeSliderMin;
        newMax = exactValue;
      } else {
        newMin = exactValue;
        newMax = exactValue;
      }
    } else if (entry.comparator === "lt" && queryNum !== null) {
      if (queryNum <= safeSliderMin) {
        return;
      }
      newMin = safeSliderMin;
      newMax = Math.min(queryNum, safeSliderMax);
    } else if (entry.comparator === "gt" && queryNum !== null) {
      if (queryNum >= safeSliderMax) {
        return;
      }
      newMin = Math.max(queryNum, safeSliderMin);
      newMax = safeSliderMax;
    } else if (entry.comparator === "range" && entry.ranges.length) {
      newMin = Math.max(entry.ranges[0].min, safeSliderMin);
      newMax = Math.min(entry.ranges[0].max, safeSliderMax);
    } else if (entry.comparator === "eq" && queryNum !== null) {
      const tolerance = (safeSliderMax - safeSliderMin) * 0.1;
      newMin = Math.max(queryNum - tolerance, safeSliderMin);
      newMax = Math.min(queryNum + tolerance, safeSliderMax);
    } else if (!entry.comparator && queryNum !== null) {
      newMin = safeSliderMin;
      newMax = Math.min(queryNum, safeSliderMax);
    } else {
      return;
    }

    if (rangeType === "single") {
      newMin = safeSliderMin;
      newMax = Math.max(safeSliderMin, Math.min(newMax, safeSliderMax));
    } else if (newMin > newMax) {
      return;
    }

    dispatchModuleEvent(scopeDocument, "caf-preview-smart-apply-range-slider", {
      rowindex: entry.rowindex,
      columnindex: entry.columnindex,
      moduleindex: entry.moduleindex,
      min: newMin,
      max: newMax,
      sliderType: rangeType,
    });
    matchCount += 1;
  });

  const moduleBuckets = new Map();
  termMatches.forEach((entry) => {
    const key = `${entry.rowindex}:${entry.columnindex}:${entry.moduleindex}`;
    if (!moduleBuckets.has(key)) {
      moduleBuckets.set(key, []);
    }
    moduleBuckets.get(key).push(entry);
  });

  moduleBuckets.forEach((listMatches, key) => {
    const sample = listMatches[0];
    const sorted = [...listMatches].sort((a, b) => b.score - a.score);

    if (sample.filterType === "dropdown") {
      const chosen = sorted[0];
      dispatchModuleEvent(scopeDocument, "caf-preview-smart-apply-dropdown", {
        rowindex: sample.rowindex,
        columnindex: sample.columnindex,
        moduleindex: sample.moduleindex,
        termKey: chosen.termId,
      });
      matchCount += 1;
      return;
    }

    const hasExplicitNumericContextMatch = sorted.some(
      (entry) =>
        entry.termHasNumeric &&
        entry.requiresNumericContext &&
        entry.hasListContextTokens &&
        entry.contextMatched
    );
    const hasNumericContextIntent = sorted.some(
      (entry) => entry.requiresNumericContext && entry.termHasNumeric
    );
    const effectivePool = hasExplicitNumericContextMatch
      ? sorted.filter((entry) => {
          if (!entry.termHasNumeric) {
            return true;
          }
          if (!entry.requiresNumericContext) {
            return true;
          }
          return entry.hasListContextTokens && entry.contextMatched;
        })
      : hasNumericContextIntent
        ? sorted.filter((entry) => {
            if (!entry.termHasNumeric) {
              return true;
            }
            if (!entry.requiresNumericContext) {
              return true;
            }
            return entry.hasListContextTokens && entry.contextMatched;
          })
        : sorted;

    if (!effectivePool.length) {
      return;
    }

    let selectedKeys = [];
    if (sample.multipleTerm) {
      const singleNumericValueIntent =
        queryNumericMeta.numbers.length === 1 &&
        (!queryNumericMeta.comparator || queryNumericMeta.comparator === "eq");
      const constrainedListNumber =
        Array.isArray(effectivePool[0].constrainedNumbers) &&
        effectivePool[0].constrainedNumbers.length === 1;
      selectedKeys = (singleNumericValueIntent || constrainedListNumber
        ? [effectivePool[0]]
        : effectivePool
      ).map((entry) => entry.termId);
    } else {
      selectedKeys = [effectivePool[0].termId];
    }

    dispatchModuleEvent(scopeDocument, "caf-preview-smart-apply-checkbox", {
      rowindex: sample.rowindex,
      columnindex: sample.columnindex,
      moduleindex: sample.moduleindex,
      selectedTermKeys: selectedKeys,
    });
    matchCount += selectedKeys.length;
  });

  setPreviewSmartMatchedTermsCount(scopeDocument, matchCount);
  return matchCount;
};

export const previewSmartSearchMatchesModule = previewFilterResetMatchesModule;
