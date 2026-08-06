import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Button } from "antd";
import { HolderOutlined, SortAscendingOutlined } from "@ant-design/icons";
import parse from "html-react-parser";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  reorderTaxonomyTermData,
  taxonomyTermReorderCollisionDetection,
  useTaxonomyTermDragSensors,
} from "./taxonomyTermDrag";

const cloneTaxonomyData = (taxonomyData) =>
  JSON.parse(JSON.stringify(taxonomyData || []));

const formatTaxonomyLabel = (key) =>
  String(key || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const countGroupTerms = (group) => {
  let total = 0;
  (group?.term_data || []).forEach((term) => {
    total += 1;
    total += (term?.children_data || []).length;
  });
  return total;
};

const getTermLabel = (term) => {
  const raw = term?.value;
  if (raw == null || raw === "") {
    return `Term ${term?.key ?? ""}`;
  }
  if (typeof raw === "string" && raw.includes("<")) {
    return parse(raw);
  }
  return String(raw);
};

function ModalDragHandle({ attributes, listeners, label }) {
  const { onPointerDown, ...restListeners } = listeners || {};

  return (
    <button
      type="button"
      className="caf-term-reorder-handle"
      aria-label={label}
      {...attributes}
      {...restListeners}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        event.stopPropagation();
      }}
    >
      <HolderOutlined />
    </button>
  );
}

function ModalSortableTermRow({ id, label, sortData, isChild = false, disabled = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: sortData,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`caf-term-reorder-row${isChild ? " is-child" : ""}${
        isDragging ? " is-dragging" : ""
      }`}
    >
      <ModalDragHandle
        attributes={attributes}
        listeners={listeners}
        label="Drag to reorder term"
      />
      <span className="caf-term-reorder-label">{label}</span>
    </div>
  );
}

function ModalSortableTaxonomyGroup({
  group,
  canReorderGroups,
  children,
  disabled = false,
}) {
  const groupId = `modal-group-${group.key}`;
  const termCount = countGroupTerms(group);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: groupId,
    disabled: !canReorderGroups || disabled,
    data: {
      type: "group",
      groupKey: group.key,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`caf-term-reorder-group${
        isDragging ? " is-dragging" : ""
      }`}
    >
      <div className="caf-term-reorder-group-header">
        {canReorderGroups && (
          <ModalDragHandle
            attributes={attributes}
            listeners={listeners}
            label="Drag to reorder taxonomy"
          />
        )}
        <div className="caf-term-reorder-group-heading">
          <span className="caf-term-reorder-group-title">
            {formatTaxonomyLabel(group.key)}
          </span>
          <span className="caf-term-reorder-group-meta">{group.key}</span>
        </div>
        <span className="caf-term-reorder-group-count">
          {termCount} {termCount === 1 ? "term" : "terms"}
        </span>
      </div>
      <div className="caf-term-reorder-group-body">{children}</div>
    </div>
  );
}

export default function FilterTermReorderModal({
  open,
  taxonomyData,
  dataSource = "taxonomy",
  onClose,
  onSave,
}) {
  const isCustomFieldSource = dataSource === "custom_field";
  const [draft, setDraft] = useState(() => cloneTaxonomyData(taxonomyData));
  const [activeDragType, setActiveDragType] = useState(null);
  const dragSensors = useTaxonomyTermDragSensors();

  useEffect(() => {
    if (open) {
      setDraft(cloneTaxonomyData(taxonomyData));
    }
  }, [open, taxonomyData]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveDragType(null);

    if (!over || active.id === over.id) {
      return;
    }

    setDraft((current) => {
      const next = reorderTaxonomyTermData(
        current,
        active.data.current,
        over.data.current
      );
      return next || current;
    });
  }, []);

  const handleDragStart = useCallback((event) => {
    setActiveDragType(event.active?.data?.current?.type || null);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveDragType(null);
  }, []);

  const groups = useMemo(
    () =>
      (draft || []).filter((group) => (group?.term_data || []).length > 0),
    [draft]
  );

  const canReorderGroups = groups.length > 1;
  const groupSortableIds = useMemo(
    () => groups.map((group) => `modal-group-${group.key}`),
    [groups]
  );

  const handleSave = () => {
    onSave(cloneTaxonomyData(draft));
  };

  const renderGroupTerms = (group) => (
    <SortableContext
      items={group.term_data.map(
        (term) => `modal-parent-${group.key}-${term.key}`
      )}
      strategy={verticalListSortingStrategy}
    >
      {group.term_data.map((term) => (
        <React.Fragment key={String(term.key)}>
          <ModalSortableTermRow
            id={`modal-parent-${group.key}-${term.key}`}
            label={getTermLabel(term)}
            disabled={activeDragType === "group"}
            sortData={{
              type: "parent",
              groupKey: group.key,
              termKey: term.key,
            }}
          />
          {(term?.children_data || []).length > 0 && (
            <SortableContext
              items={term.children_data.map(
                (child) => `modal-child-${term.key}-${child.key}`
              )}
              strategy={verticalListSortingStrategy}
            >
              <div className="caf-term-reorder-children">
                {term.children_data.map((child) => (
                  <ModalSortableTermRow
                    key={String(child.key)}
                    id={`modal-child-${term.key}-${child.key}`}
                    label={getTermLabel(child)}
                    isChild
                    disabled={activeDragType === "group"}
                    sortData={{
                      type: "child",
                      groupKey: group.key,
                      parentKey: term.key,
                      termKey: child.key,
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </React.Fragment>
      ))}
    </SortableContext>
  );

  return (
    <Modal
      className="caf-term-reorder-modal caf-builder-modal"
      title={
        <div className="caf-term-reorder-modal-title">
          <SortAscendingOutlined aria-hidden />
          <span>Sort Filter Terms</span>
        </div>
      }
      width={580}
      centered
      open={open}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save Order
        </Button>,
      ]}
    >
      <div className="caf-term-reorder-modal-body">
        <div className="caf-term-reorder-modal-hint">
          {canReorderGroups ? (
            isCustomFieldSource ? (
              <>
                <strong>Reorder custom fields</strong> using the orange section
                headers, or <strong>reorder values</strong> inside each custom
                field using the row handles.
              </>
            ) : (
              <>
                <strong>Reorder taxonomies</strong> using the orange section
                headers, or <strong>reorder terms</strong> inside each taxonomy
                using the row handles.
              </>
            )
          ) : (
            <>
              Drag the handle beside each term to change the display order in
              your filter preview.
            </>
          )}
        </div>
        <div className="caf-term-reorder-modal-list">
          <DndContext
            sensors={dragSensors}
            collisionDetection={taxonomyTermReorderCollisionDetection}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            {canReorderGroups ? (
              <SortableContext
                items={groupSortableIds}
                strategy={verticalListSortingStrategy}
              >
                {groups.map((group) => (
                  <ModalSortableTaxonomyGroup
                    key={String(group.key)}
                    group={group}
                    canReorderGroups={canReorderGroups}
                    disabled={
                      activeDragType === "parent" || activeDragType === "child"
                    }
                  >
                    {renderGroupTerms(group)}
                  </ModalSortableTaxonomyGroup>
                ))}
              </SortableContext>
            ) : (
              groups.map((group) => (
                <div key={String(group.key)} className="caf-term-reorder-group is-single">
                  {renderGroupTerms(group)}
                </div>
              ))
            )}
          </DndContext>
        </div>
      </div>
    </Modal>
  );
}
