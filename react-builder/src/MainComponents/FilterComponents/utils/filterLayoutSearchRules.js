import { isProTier } from "../../../tier/capabilities";

/** Free tier: only search is limited to one instance per layout. */
export const FREE_SINGLE_INSTANCE_FILTER_MODULES = ["search"];

/** Pro tier: only search is limited to one instance per layout. */
export const PRO_SINGLE_INSTANCE_FILTER_MODULES = ["search"];

export const FILTER_MODULE_LIMIT_MESSAGES = {
  search: "You cannot add more than one Search module.",
};

/** @deprecated Use FILTER_MODULE_LIMIT_MESSAGES.search */
export const FILTER_SEARCH_MODULE_LIMIT_MESSAGE =
  FILTER_MODULE_LIMIT_MESSAGES.search;

export const getSingleInstanceFilterModulesForTier = () =>
  isProTier()
    ? PRO_SINGLE_INSTANCE_FILTER_MODULES
    : FREE_SINGLE_INSTANCE_FILTER_MODULES;

export const isSingleInstanceFilterModuleForTier = (moduleKey) =>
  getSingleInstanceFilterModulesForTier().includes(String(moduleKey || ""));

/** @deprecated Use isSingleInstanceFilterModuleForTier */
export const isSingleInstanceFilterModule = (moduleKey) =>
  isSingleInstanceFilterModuleForTier(moduleKey);

const resolveLayoutRows = (layoutData) => {
  if (Array.isArray(layoutData)) {
    return layoutData;
  }
  if (Array.isArray(layoutData?.initial_data)) {
    return layoutData.initial_data;
  }
  return [];
};

export const countFilterModulesByKey = (layoutData, moduleKey) => {
  const rows = resolveLayoutRows(layoutData);
  if (!rows.length) {
    return 0;
  }

  let count = 0;
  rows.forEach((row) => {
    (row?.data || []).forEach((column) => {
      (column?.data || []).forEach((module) => {
        if (module?.key === moduleKey) {
          count += 1;
        }
      });
    });
  });

  return count;
};

/** @deprecated Use countFilterModulesByKey(layoutData, "search") */
export const countFilterSearchModules = (layoutData) =>
  countFilterModulesByKey(layoutData, "search");

const createEmptyModuleCounts = (moduleKeys) => {
  const counts = {};
  moduleKeys.forEach((key) => {
    counts[key] = 0;
  });
  return counts;
};

export const countSingleInstanceFilterModules = (
  layoutData,
  moduleKeys = getSingleInstanceFilterModulesForTier()
) => {
  const counts = createEmptyModuleCounts(moduleKeys);
  const rows = resolveLayoutRows(layoutData);
  if (!rows.length) {
    return counts;
  }

  rows.forEach((row) => {
    (row?.data || []).forEach((column) => {
      (column?.data || []).forEach((module) => {
        const key = module?.key;
        if (key && Object.prototype.hasOwnProperty.call(counts, key)) {
          counts[key] += 1;
        }
      });
    });
  });

  return counts;
};

export const countModulesInFilterEntity = (
  entity,
  moduleKeys = getSingleInstanceFilterModulesForTier()
) => {
  const keys = new Set(moduleKeys);
  const counts = createEmptyModuleCounts(moduleKeys);

  if (!entity || typeof entity !== "object") {
    return counts;
  }

  if (entity.key && keys.has(entity.key) && !Array.isArray(entity.data)) {
    counts[entity.key] += 1;
    return counts;
  }

  if (Array.isArray(entity.initial_data)) {
    const layoutCounts = countSingleInstanceFilterModules(
      entity.initial_data,
      moduleKeys
    );
    moduleKeys.forEach((key) => {
      counts[key] += layoutCounts[key] || 0;
    });
    return counts;
  }

  if (!Array.isArray(entity.data)) {
    return counts;
  }

  const firstChild = entity.data[0];
  if (firstChild && Array.isArray(firstChild.data)) {
    entity.data.forEach((column) => {
      const columnCounts = countModulesInFilterEntity(column, moduleKeys);
      moduleKeys.forEach((key) => {
        counts[key] += columnCounts[key] || 0;
      });
    });
    return counts;
  }

  entity.data.forEach((module) => {
    const key = module?.key;
    if (key && keys.has(key)) {
      counts[key] += 1;
    }
  });

  return counts;
};

/** @deprecated Use countModulesInFilterEntity */
export const countSearchModulesInFilterEntity = (entity) =>
  countModulesInFilterEntity(entity, ["search"]).search || 0;

export const isFilterModuleAtInstanceLimit = (moduleKey, layoutData) => {
  if (!isSingleInstanceFilterModuleForTier(moduleKey)) {
    return false;
  }
  return countFilterModulesByKey(layoutData, moduleKey) >= 1;
};

export const getSingleInstanceFilterModuleLimitMessage = (
  layoutData,
  entityToAdd
) => {
  const moduleKeys = getSingleInstanceFilterModulesForTier();
  const existing = countSingleInstanceFilterModules(layoutData, moduleKeys);
  const incoming = countModulesInFilterEntity(entityToAdd, moduleKeys);

  for (const key of moduleKeys) {
    if ((existing[key] || 0) + (incoming[key] || 0) > 1) {
      return FILTER_MODULE_LIMIT_MESSAGES[key];
    }
  }

  return "You cannot add more than one of this filter module.";
};

export const getSingleInstanceFilterModuleLimitMessageWithUpgrade = (
  layoutData,
  entityToAdd
) => {
  const message = getSingleInstanceFilterModuleLimitMessage(
    layoutData,
    entityToAdd
  );
  if (isProTier()) {
    return message;
  }
  return `${message} Upgrade to Pro to add more.`;
};

export const wouldExceedSingleInstanceFilterModuleLimit = (
  layoutData,
  entityToAdd
) => {
  const moduleKeys = getSingleInstanceFilterModulesForTier();
  const existing = countSingleInstanceFilterModules(layoutData, moduleKeys);
  const incoming = countModulesInFilterEntity(entityToAdd, moduleKeys);

  return moduleKeys.some(
    (key) => (existing[key] || 0) + (incoming[key] || 0) > 1
  );
};

/** @deprecated Use wouldExceedSingleInstanceFilterModuleLimit */
export const wouldExceedFilterSearchModuleLimit = (
  layoutData,
  entityToAdd
) => wouldExceedSingleInstanceFilterModuleLimit(layoutData, entityToAdd);

/**
 * Keep the first occurrence of each tier-limited filter module.
 *
 * @param {Array} layoutData Filter layout initial_data tree.
 * @returns {Array}
 */
export const enforceSingleInstanceFilterModulesInLayout = (layoutData) => {
  if (!Array.isArray(layoutData)) {
    return layoutData;
  }

  const limitedKeys = new Set(getSingleInstanceFilterModulesForTier());
  if (limitedKeys.size === 0) {
    return layoutData;
  }

  const seen = new Set();

  return layoutData.map((row) => ({
    ...row,
    data: (row?.data || []).map((column) => ({
      ...column,
      data: (column?.data || []).filter((module) => {
        const key = module?.key;
        if (!limitedKeys.has(key)) {
          return true;
        }
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      }),
    })),
  }));
};
