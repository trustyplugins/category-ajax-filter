import React from "react";
import { PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { canUseFilterTermReorder } from "../../../../../tier/capabilities";

export { canUseFilterTermReorder };

export const hasMultipleSortableTaxonomyTerms = (taxonomyData = []) => {
  const populatedGroups = (taxonomyData || []).filter(
    (group) => (group?.term_data || []).length > 0
  );

  if (populatedGroups.length > 1) {
    return true;
  }

  for (const group of populatedGroups) {
    if ((group?.term_data || []).length > 1) {
      return true;
    }
    for (const term of group?.term_data || []) {
      if ((term?.children_data || []).length > 1) {
        return true;
      }
    }
  }
  return false;
};

const DRAG_ACTIVATION_DISTANCE = 8;

/** Pointer sensor with a small distance threshold so term clicks do not start a drag. */
export const useTaxonomyTermDragSensors = () =>
  useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    })
  );

/** Keep group drags on groups and term drags on terms (nested sortable fix). */
export const taxonomyTermReorderCollisionDetection = (args) => {
  const activeType = args.active?.data?.current?.type;

  if (!activeType) {
    return closestCenter(args);
  }

  const filteredContainers = args.droppableContainers.filter((container) => {
    const containerType = container.data?.current?.type;
    return containerType === activeType;
  });

  if (filteredContainers.length === 0) {
    return closestCenter(args);
  }

  return closestCenter({
    ...args,
    droppableContainers: filteredContainers,
  });
};

const normalizeTaxonomyReorderOverData = (activeData, overData) => {
  if (!activeData || !overData) {
    return null;
  }

  if (activeData.type === overData.type) {
    return overData;
  }

  if (
    activeData.type === "group" &&
    overData.groupKey &&
    String(overData.groupKey) !== String(activeData.groupKey)
  ) {
    return {
      type: "group",
      groupKey: overData.groupKey,
    };
  }

  return null;
};

/**
 * Reorder taxonomy groups, parent terms, or child terms in module settings.
 * Returns a new taxonomy_data array, or null when reorder is not allowed.
 */
export const reorderTaxonomyTermData = (taxonomyData, activeData, overData) => {
  const normalizedOver = normalizeTaxonomyReorderOverData(activeData, overData);

  if (!activeData || !normalizedOver || activeData.type !== normalizedOver.type) {
    return null;
  }

  const nextData = JSON.parse(JSON.stringify(taxonomyData || []));

  if (activeData.type === "group") {
    const oldIndex = nextData.findIndex(
      (entry) => String(entry.key) === String(activeData.groupKey)
    );
    const newIndex = nextData.findIndex(
      (entry) => String(entry.key) === String(normalizedOver.groupKey)
    );

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return null;
    }

    return arrayMove(nextData, oldIndex, newIndex);
  }

  if (activeData.type === "parent") {
    if (String(activeData.groupKey) !== String(overData.groupKey)) {
      return null;
    }

    const group = nextData.find(
      (entry) => String(entry.key) === String(activeData.groupKey)
    );
    if (!group?.term_data) {
      return null;
    }

    const oldIndex = group.term_data.findIndex(
      (term) => String(term.key) === String(activeData.termKey)
    );
    const newIndex = group.term_data.findIndex(
      (term) => String(term.key) === String(normalizedOver.termKey)
    );

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return null;
    }

    group.term_data = arrayMove(group.term_data, oldIndex, newIndex);
    return nextData;
  }

  if (activeData.type === "child") {
    if (String(activeData.parentKey) !== String(overData.parentKey)) {
      return null;
    }

    for (const group of nextData) {
      const parent = group.term_data?.find(
        (term) => String(term.key) === String(activeData.parentKey)
      );
      if (!parent?.children_data) {
        continue;
      }

      const oldIndex = parent.children_data.findIndex(
        (term) => String(term.key) === String(activeData.termKey)
      );
      const newIndex = parent.children_data.findIndex(
        (term) => String(term.key) === String(normalizedOver.termKey)
      );

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return null;
      }

      parent.children_data = arrayMove(parent.children_data, oldIndex, newIndex);
      return nextData;
    }
  }

  return null;
};
