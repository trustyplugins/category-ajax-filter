/**
 * Custom-field adapters for the shared filter term reorder UI.
 * Maps custom_field_data to the taxonomy_data shape used by FilterTermReorderModal.
 */

const normalizeCustomFieldData = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === "object") {
    return [value];
  }
  return [];
};

export const hasMultipleSortableCustomFieldValues = (customFieldData = []) => {
  const populatedGroups = normalizeCustomFieldData(customFieldData).filter(
    (group) => (group?.custom_field_value_list || []).length > 0
  );

  if (populatedGroups.length > 1) {
    return true;
  }

  for (const group of populatedGroups) {
    if ((group?.custom_field_value_list || []).length > 1) {
      return true;
    }
  }

  return false;
};

export const customFieldDataToTaxonomyReorderShape = (customFieldData = []) =>
  normalizeCustomFieldData(customFieldData).map((group) => ({
    key: group.custom_field_key,
    term_data: (group.custom_field_value_list || []).map((value) => ({
      key: value.key,
      value: value.value ?? value.label ?? "",
      children_data: [],
    })),
  }));

/** Apply modal reorder results back onto custom_field_data, preserving value metadata. */
export const applyTaxonomyReorderToCustomFieldData = (
  customFieldData,
  reorderedTaxonomyShape
) => {
  const originalMap = new Map(
    normalizeCustomFieldData(customFieldData).map((group) => [
      String(group.custom_field_key),
      group,
    ])
  );

  return (reorderedTaxonomyShape || [])
    .map((reorderedGroup) => {
      const originalGroup = originalMap.get(String(reorderedGroup.key));
      if (!originalGroup) {
        return null;
      }

      const valueMap = new Map(
        (originalGroup.custom_field_value_list || []).map((value) => [
          String(value.key),
          value,
        ])
      );

      const nextGroup = JSON.parse(JSON.stringify(originalGroup));
      nextGroup.custom_field_value_list = (reorderedGroup.term_data || [])
        .map((term) => valueMap.get(String(term.key)))
        .filter(Boolean);

      return nextGroup;
    })
    .filter(Boolean);
};
