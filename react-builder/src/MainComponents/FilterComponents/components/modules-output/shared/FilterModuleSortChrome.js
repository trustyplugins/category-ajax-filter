import React, { useMemo, useState } from "react";
import { canUseFilterTermReorder } from "../../../../../tier/capabilities";
import FilterTermReorderModal from "./FilterTermReorderModal";
import { hasMultipleSortableTaxonomyTerms } from "./taxonomyTermDrag";
import {
  applyTaxonomyReorderToCustomFieldData,
  customFieldDataToTaxonomyReorderShape,
  hasMultipleSortableCustomFieldValues,
} from "./customFieldTermDrag";

const SORTABLE_MODULE_KEYS = new Set(["checkbox_filter", "dropdown_filter"]);

export default function FilterModuleSortChrome({
  isActive,
  moduleKey,
  dataSource = "taxonomy",
  taxonomyData,
  customFieldData,
  onSave,
}) {
  const [open, setOpen] = useState(false);
  const isCustomFieldSource = dataSource === "custom_field";

  const reorderTaxonomyData = useMemo(() => {
    if (isCustomFieldSource) {
      return customFieldDataToTaxonomyReorderShape(customFieldData);
    }
    return taxonomyData;
  }, [customFieldData, isCustomFieldSource, taxonomyData]);

  const showSortButton = useMemo(() => {
    if (!isActive || !canUseFilterTermReorder()) {
      return false;
    }
    if (!SORTABLE_MODULE_KEYS.has(moduleKey)) {
      return false;
    }
    if (isCustomFieldSource) {
      return hasMultipleSortableCustomFieldValues(customFieldData);
    }
    return hasMultipleSortableTaxonomyTerms(taxonomyData);
  }, [
    customFieldData,
    isActive,
    isCustomFieldSource,
    moduleKey,
    taxonomyData,
  ]);

  if (!showSortButton) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="caf-builder-module-sort-btn"
        aria-label="Sort terms"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        Sort
      </button>
      <FilterTermReorderModal
        open={open}
        taxonomyData={reorderTaxonomyData}
        dataSource={dataSource}
        onClose={() => setOpen(false)}
        onSave={(nextTaxonomyData) => {
          if (isCustomFieldSource) {
            onSave(
              applyTaxonomyReorderToCustomFieldData(
                customFieldData,
                nextTaxonomyData
              )
            );
          } else {
            onSave(nextTaxonomyData);
          }
          setOpen(false);
        }}
      />
    </>
  );
}
