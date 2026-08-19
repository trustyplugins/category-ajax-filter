import React from "react";
import { Tooltip } from "antd";
import { PlusOutlined, StarOutlined } from "@ant-design/icons";
import { FilterTermActionsLockedWrap } from "./filterModuleTier";

export default function FilterTermRowProActions({
  addLabel = "Add term icon",
  showIconControl = true,
}) {
  return (
    <FilterTermActionsLockedWrap>
      {showIconControl && (
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title={addLabel}
        >
          <button
            type="button"
            className="caf-term-icon-trigger is-disabled"
            disabled
            aria-label={addLabel}
          >
            <PlusOutlined />
          </button>
        </Tooltip>
      )}
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title="Mark this term as selected by default"
      >
        <button
          type="button"
          className="caf-term-default-star is-disabled"
          disabled
          aria-label="Set as default term"
          aria-pressed={false}
        >
          <StarOutlined />
        </button>
      </Tooltip>
    </FilterTermActionsLockedWrap>
  );
}
