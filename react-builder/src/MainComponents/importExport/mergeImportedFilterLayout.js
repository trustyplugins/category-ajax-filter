import cloneDeep from "lodash/cloneDeep";
import { sanitizeImportedFilterModule } from "./sanitizeImportedFilterTerms";
import {
  enforceSingleInstanceFilterModulesInLayout,
  getSingleInstanceFilterModuleLimitMessage,
  wouldExceedSingleInstanceFilterModuleLimit,
} from "../FilterComponents/utils/filterLayoutSearchRules";
import newRow from "../FilterComponents/components/newElementData/newRow";

export const extractFilterModulesFromLayout = (filterLayoutData) => {
  const modules = [];
  if (!filterLayoutData || typeof filterLayoutData !== "object") {
    return modules;
  }

  if (filterLayoutData.type === "module") {
    return [cloneDeep(filterLayoutData)];
  }

  if (filterLayoutData.module_data?.type === "module") {
    return [cloneDeep(filterLayoutData.module_data)];
  }

  const nestedLayout = filterLayoutData.filter_layout_data;
  if (nestedLayout && nestedLayout !== filterLayoutData) {
    const nestedModules = extractFilterModulesFromLayout(nestedLayout);
    if (nestedModules.length > 0) {
      return nestedModules;
    }
  }

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

export const resolveImportedFilterMergeSource = (importedDoc, importedJson) => {
  if (importedJson?.module_data?.type === "module") {
    return importedJson.module_data;
  }
  if (importedDoc?.module_data?.type === "module") {
    return importedDoc.module_data;
  }
  if (importedJson?.type === "module") {
    return importedJson;
  }
  return importedDoc?.filter_layout_data;
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

const createHostRowForModules = () => {
  const row = cloneDeep(newRow);
  if (!Array.isArray(row.data) || row.data.length === 0) {
    row.data = [
      {
        type: "column",
        data: [],
        settings: {},
        style: {},
      },
    ];
  }
  if (!Array.isArray(row.data[0].data)) {
    row.data[0].data = [];
  }
  return row;
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

  const incomingEntity =
    importedModules.length === 1
      ? importedModules[0]
      : { data: importedModules };

  if (
    wouldExceedSingleInstanceFilterModuleLimit(
      currentFilterLayout,
      incomingEntity
    )
  ) {
    throw new Error(
      getSingleInstanceFilterModuleLimitMessage(
        currentFilterLayout,
        incomingEntity
      )
    );
  }

  const merged = cloneDeep(currentFilterLayout || {});
  if (!merged.initial_data) {
    merged.initial_data = [];
  }

  if (merged.initial_data.length === 0) {
    const importedRows = importedFilterLayout?.initial_data;
    if (Array.isArray(importedRows) && importedRows.length > 0) {
      merged.initial_data = enforceSingleInstanceFilterModulesInLayout(
        cloneDeep(importedRows)
      );
      return merged;
    }

    merged.initial_data = [createHostRowForModules()];
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
