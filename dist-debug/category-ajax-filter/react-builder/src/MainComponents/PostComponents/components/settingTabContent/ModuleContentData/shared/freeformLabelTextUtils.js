/**
 * Shared helpers for freeform label/text inputs (button labels, badge text, etc.).
 * Trim only on blur — not on onChange or layout sync — so spaces between words work while typing.
 */

export const normalizeFreeformLabelText = (value, defaultText = "") => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : defaultText;
};

/**
 * Input display: preserve raw text (including trailing spaces) while typing.
 * Substitutes default only when stored value is empty after trim.
 */
export const getFreeformLabelTextForUi = (raw, defaultText = "") => {
  const value = typeof raw === "string" ? raw : "";
  return value.trim() === "" ? defaultText : value;
};
