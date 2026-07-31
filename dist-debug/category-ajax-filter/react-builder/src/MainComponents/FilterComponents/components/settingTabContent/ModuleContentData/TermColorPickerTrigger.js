import React, { useEffect, useRef, useState, memo } from "react";
import { ColorPicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  normalizeColorPickerValue,
  getColorPickerModes,
} from "../../../../utils/colorPicker";

const TermColorPickerTrigger = memo(function TermColorPickerTrigger({
  color = "",
  disabled = false,
  label = "Add term color",
  onColorCommit,
}) {
  const [open, setOpen] = useState(false);
  const [draftColor, setDraftColor] = useState(color || "#000000");
  const draftColorRef = useRef(draftColor);

  useEffect(() => {
    if (!open) {
      const next = color || "#000000";
      draftColorRef.current = next;
      setDraftColor(next);
    }
  }, [color, open]);

  const previewColor = open ? draftColor : color || "#000000";
  const showFilledSwatch = Boolean(color) || open;

  return (
    <ColorPicker
      open={open}
      value={draftColor}
      mode={getColorPickerModes(false)}
      disabled={disabled}
      destroyTooltipOnHide
      getPopupContainer={() => document.body}
      onOpenChange={(nextOpen) => {
        if (disabled) return;
        if (nextOpen) {
          const next = color || "#000000";
          draftColorRef.current = next;
          setDraftColor(next);
          setOpen(true);
          return;
        }
        setOpen(false);
        const nextColor = normalizeColorPickerValue(
          draftColorRef.current,
          "#000000"
        );
        if (nextColor && typeof onColorCommit === "function") {
          onColorCommit(nextColor);
        }
      }}
      onChange={(value) => {
        const next = normalizeColorPickerValue(value, "#000000");
        draftColorRef.current = next;
        setDraftColor(next);
      }}
      placement="bottomLeft"
    >
      <button
        type="button"
        className={`caf-term-icon-trigger caf-term-color-trigger has-icon ${
          disabled ? "is-disabled" : ""
        }`}
        disabled={disabled}
        aria-label={label}
        title={label}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span
          className={`caf-term-swatch caf-term-swatch--preview ${
            showFilledSwatch ? "is-filled" : "is-empty"
          }`}
          style={{
            backgroundColor: showFilledSwatch ? previewColor : "transparent",
          }}
          aria-hidden="true"
        >
          <PlusOutlined />
        </span>
      </button>
    </ColorPicker>
  );
});

export default TermColorPickerTrigger;
