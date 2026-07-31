/** True when Advanced "Disable on" is enabled for the given device tab. */
export const isHiddenOnDevice = (settings, device = "desktop") =>
  String(settings?.visibility?.[device] ?? "false") === "true";

/** Sidebar class when an entity is hidden on the active device preview. */
export const getDeviceVisibilityDisabledClass = (settings, device = "desktop") =>
  isHiddenOnDevice(settings, device) ? "caf-builder-visibility-disabled" : "";
