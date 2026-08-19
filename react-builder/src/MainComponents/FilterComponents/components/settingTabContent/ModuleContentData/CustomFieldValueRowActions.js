import React from "react";
import { Tooltip } from "antd";
import { PlusOutlined, StarOutlined, StarFilled } from "@ant-design/icons";
import { getTermIconPreviewSrc, termHasIcon } from "./termIconUtils";
import { getTermSwatchColor } from "./termVisualUtils";
import TermColorPickerTrigger from "./TermColorPickerTrigger";

const CustomFieldValueRowActions = ({
  showIconControl = false,
  colorMode = false,
  valueIcons,
  isDefault = false,
  onOpenSettings,
  onColorCommit,
  onToggleDefault,
}) => {
  const hasIcon = termHasIcon(valueIcons);
  const iconPreviewSrc = getTermIconPreviewSrc(valueIcons);
  const swatchColor = getTermSwatchColor(valueIcons);
  const hasColor = Boolean(swatchColor);
  const colorLabel = hasColor ? "Edit value color" : "Add value color";

  return (
    <span
      className="caf-term-row-actions"
      onClick={(event) => event.stopPropagation()}
    >
      {showIconControl && colorMode && (
        <TermColorPickerTrigger
          color={swatchColor}
          disabled={false}
          label={colorLabel}
          onColorCommit={onColorCommit}
        />
      )}
      {showIconControl && !colorMode && (
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title={hasIcon ? "Edit value icon" : "Add value icon"}
        >
          <button
            type="button"
            className={`caf-term-icon-trigger ${hasIcon ? "has-icon" : ""}`}
            aria-label={hasIcon ? "Edit value icon" : "Add value icon"}
            onClick={onOpenSettings}
          >
            {!hasIcon ? (
              <PlusOutlined />
            ) : valueIcons?.type === "svg" ? (
              <img src={iconPreviewSrc} alt="" />
            ) : (
              <i className={valueIcons.icon} aria-hidden="true" />
            )}
          </button>
        </Tooltip>
      )}
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title={
          isDefault
            ? "Remove as default value"
            : "Mark this value as selected by default"
        }
      >
        <button
          type="button"
          className={`caf-term-default-star ${isDefault ? "is-active" : ""}`}
          aria-label={
            isDefault ? "Remove as default value" : "Set as default value"
          }
          aria-pressed={isDefault}
          onClick={onToggleDefault}
        >
          {isDefault ? <StarFilled /> : <StarOutlined />}
        </button>
      </Tooltip>
    </span>
  );
};

export default CustomFieldValueRowActions;
