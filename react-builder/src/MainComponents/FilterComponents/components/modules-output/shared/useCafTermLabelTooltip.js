import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Body-ported term label tooltip — immune to parent overflow from Design CSS.
 * Pair with `.caf-has-term-tooltip` on the trigger element.
 */
export function useCafTermLabelTooltip(enabled, label) {
  const [pos, setPos] = useState(null);
  const tipRef = useRef(null);
  const measuredKeyRef = useRef("");
  const text = String(label || "").trim();
  const active = Boolean(enabled && text);

  const hide = useCallback(() => {
    measuredKeyRef.current = "";
    setPos(null);
  }, []);

  const showFromEvent = useCallback(
    (e) => {
      if (!active) return;
      const el = e.currentTarget;
      if (!el || typeof el.getBoundingClientRect !== "function") return;
      const r = el.getBoundingClientRect();
      measuredKeyRef.current = "";
      setPos({
        text,
        x: r.left + r.width / 2,
        y: r.top,
        bottom: r.bottom,
        flipped: false,
      });
    },
    [active, text]
  );

  useLayoutEffect(() => {
    if (!pos || !tipRef.current) return;
    const key = `${pos.x}|${pos.y}|${pos.text}`;
    if (measuredKeyRef.current === key) return;
    measuredKeyRef.current = key;

    const tip = tipRef.current;
    const tipHeight = tip.offsetHeight || 0;
    const tipWidth = tip.offsetWidth || 0;
    const pad = 8;
    let left = pos.x;
    left = Math.max(
      pad + tipWidth / 2,
      Math.min(left, window.innerWidth - pad - tipWidth / 2)
    );
    const flipped = pos.y - tipHeight - 12 < pad;
    if (left !== pos.x || flipped !== pos.flipped) {
      setPos((prev) =>
        prev
          ? {
              ...prev,
              x: left,
              flipped,
            }
          : prev
      );
    }
  }, [pos]);

  useEffect(() => {
    if (!pos) return undefined;
    const onScroll = () => hide();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [pos, hide]);

  const tooltipProps = active
    ? {
        "data-caf-tooltip": text,
        onMouseEnter: showFromEvent,
        onFocus: showFromEvent,
        onMouseLeave: hide,
        onBlur: hide,
      }
    : {};

  const portal =
    pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={tipRef}
            className={`caf-term-tooltip-portal is-visible${
              pos.flipped ? " is-flipped" : ""
            }`}
            role="tooltip"
            style={{
              left: `${pos.x}px`,
              top: `${pos.flipped ? pos.bottom : pos.y}px`,
            }}
          >
            {pos.text}
          </div>,
          document.body
        )
      : null;

  return { tooltipProps, portal, showTermTooltipClass: active };
}
