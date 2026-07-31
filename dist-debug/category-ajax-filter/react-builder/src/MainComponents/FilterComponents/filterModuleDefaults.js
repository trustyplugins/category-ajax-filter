/** Default reset-module icon (must match NewModulePopUp / BuilderLayoutData). */
export const FILTER_RESET_DEFAULT_ICON = "fas fa-redo";

export const FILTER_RESET_DEFAULT_ICONS = Object.freeze({
  visibility: true,
  icon: FILTER_RESET_DEFAULT_ICON,
  type: "icon",
});

export function isEmptyIconValue(iconValue) {
  if (iconValue === undefined || iconValue === null) return true;
  if (typeof iconValue === "string") return iconValue.trim() === "";
  if (typeof iconValue === "object") return Object.keys(iconValue).length === 0;
  return false;
}
