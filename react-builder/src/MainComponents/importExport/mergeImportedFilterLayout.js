import cloneDeep from "lodash/cloneDeep";
import { sanitizeImportedFilterModule } from "./sanitizeImportedFilterTerms";
import {
  enforceSingleInstanceFilterModulesInLayout,
  getSingleInstanceFilterModuleLimitMessage,
  wouldExceedSingleInstanceFilterModuleLimit,
} from "../FilterComponents/utils/filterLayoutSearchRules";

export const extractFilterModulesFromLayout = (filterLayoutData) => {
  const modules = [];
  const rows = filterLayoutData?.initial_data || [];

  rows.forEach((row) => {
    (row?.data || []).forEach((column) => {
      (column?.data || []).forEach((module) => {
        if (module?.type === "module") {
          modules.push(cloneDeep(module));
        }
      });
    });
  });

  return modules;
};

const resolveModuleInsertColumn = (row) => {
  const columns = Array.isArray(row?.data) ? row.data : [];
  if (columns.length === 0) {
    return null;
  }

  const columnWithModules = [...columns]
    .reverse()
    .find((column) => Array.isArray(column?.data) && column.data.length > 0);

  return columnWithModules || columns[columns.length - 1];
};

export const mergeFilterModulesIntoLayout = async (
  currentFilterLayout,
  importedFilterLayout,
  importOptions = {}
) => {
  const importedModules = extractFilterModulesFromLayout(importedFilterLayout);

  if (importedModules.length === 0) {
    throw new Error("Selected template does not contain a filter module.");
  }

  if (
    wouldExceedSingleInstanceFilterModuleLimit(
      currentFilterLayout,
      importedFilterLayout
    )
  ) {
    throw new Error(
      getSingleInstanceFilterModuleLimitMessage(
        currentFilterLayout,
        importedFilterLayout
      )
    );
  }

  const merged = cloneDeep(currentFilterLayout || {});
  if (!merged.initial_data) {
    merged.initial_data = [];
  }

  if (merged.initial_data.length === 0) {
    merged.initial_data = enforceSingleInstanceFilterModulesInLayout(
      cloneDeep(importedFilterLayout?.initial_data || [])
    );
    return merged;
  }

  const targetRow = merged.initial_data[0];
  const targetColumn = resolveModuleInsertColumn(targetRow);

  if (!targetColumn) {
    throw new Error("Current filter layout has no columns to insert into.");
  }

  if (!Array.isArray(targetColumn.data)) {
    targetColumn.data = [];
  }

  for (const module of importedModules) {
    const sanitizedModule = await sanitizeImportedFilterModule(
      module,
      importOptions
    );
    targetColumn.data.push(sanitizedModule);
  }

  merged.initial_data = enforceSingleInstanceFilterModulesInLayout(
    merged.initial_data
  );

  return merged;
};
