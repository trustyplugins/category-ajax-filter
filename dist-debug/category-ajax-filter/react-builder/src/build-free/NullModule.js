import React from 'react';

/** Stub for Pro-only modules excluded from the free admin bundle. */
const NullModule = () => null;

/** Named fallback used by the custom-field term-reorder adapter. */
export const hasMultipleSortableCustomFieldValues = () => false;
export const customFieldDataToTaxonomyReorderShape = () => [];
export const applyTaxonomyReorderToCustomFieldData = (customFieldData) =>
  customFieldData;

export default NullModule;
