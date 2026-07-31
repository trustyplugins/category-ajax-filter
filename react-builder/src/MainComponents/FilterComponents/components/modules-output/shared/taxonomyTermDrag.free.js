/**
 * Free: no term reorder implementation (dnd-kit handlers absent).
 */
export const canUseFilterTermReorder = () => false;

export const hasMultipleSortableTaxonomyTerms = () => false;

export const useTaxonomyTermDragSensors = () => [];

export const taxonomyTermReorderCollisionDetection = () => null;

export const reorderTaxonomyTermData = (taxonomyData) => taxonomyData;

export const getTaxonomyTermDragDisabled = () => true;
