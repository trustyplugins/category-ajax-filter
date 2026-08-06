import React from "react";
import { Tooltip } from "antd";
import { PlusOutlined, StarOutlined, StarFilled } from "@ant-design/icons";
import { FilterTermActionsLockedWrap } from "./filterModuleTier";

export default function FilterTermRowProActions({
  isTermSelected,
  isDefault,
  hasIcon,
  termIcons,
  iconPreviewSrc,
  iconTriggerDisabled,
  termDefaultLocked,
  termIconActionsLocked,
  addLabel,
  onOpenSettings,
  onToggleDefault,
  showIconControl = true,
  showDefaultControl = true,
}) {
  const wrapIfLocked = (locked, node) =>
    locked && node ? (
      <FilterTermActionsLockedWrap>{node}</FilterTermActionsLockedWrap>
    ) : (
      node
    );

  const iconControl = showIconControl ? (
    <Tooltip
      classNames={{ root: "caf-builder-tooltip" }}
      placement="topLeft"
      title={addLabel}
    >
      <button
        type="button"
        className={`caf-term-icon-trigger ${hasIcon ? "has-icon" : ""} ${
          iconTriggerDisabled ? "is-disabled" : ""
        }`}
        disabled={iconTriggerDisabled}
        aria-label={addLabel}
        onClick={onOpenSettings}
      >
        {!hasIcon ? (
          <PlusOutlined />
        ) : termIcons?.type === "svg" ? (
          <img src={iconPreviewSrc} alt="" />
        ) : (
          <i className={termIcons.icon} aria-hidden="true" />
        )}
      </button>
    </Tooltip>
  ) : null;

  const defaultStarControl = (
    <Tooltip
      classNames={{ root: "caf-builder-tooltip" }}
      placement="topLeft"
      title={
        isDefault
          ? "Remove as default term"
          : "Mark this term as selected by default"
      }
    >
      <button
        type="button"
        className={`caf-term-default-star ${isDefault ? "is-active" : ""} ${
          !isTermSelected || termDefaultLocked ? "is-disabled" : ""
        }`}
        disabled={!isTermSelected || termDefaultLocked}
        aria-label={isDefault ? "Remove as default term" : "Set as default term"}
        aria-pressed={isDefault}
        onClick={() => {
          if (!termDefaultLocked) {
            onToggleDefault?.(!isDefault);
          }
        }}
      >
        {isDefault ? <StarFilled /> : <StarOutlined />}
      </button>
    </Tooltip>
  );

  return (
    <>
      {wrapIfLocked(termIconActionsLocked, iconControl)}
      {showDefaultControl
        ? wrapIfLocked(termDefaultLocked, defaultStarControl)
        : null}
    </>
  );
}
