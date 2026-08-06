export const BUILDER_PREVIEW_DEVICES = ["desktop", "tablet", "mobile"];
export const DEFAULT_BUILDER_PREVIEW_DEVICE = "desktop";

/** Active preview device for the current builder session (in-memory only). */
export const resolveBuilderPreviewDevice = (builderData) => {
  const device = builderData?.common_data?.builder_preview_device;
  return BUILDER_PREVIEW_DEVICES.includes(device)
    ? device
    : DEFAULT_BUILDER_PREVIEW_DEVICE;
};

export const applyBuilderPreviewDevice = (
  builderData,
  device = DEFAULT_BUILDER_PREVIEW_DEVICE
) => {
  if (!builderData) {
    return builderData;
  }
  const next = structuredClone(builderData);
  if (!next.common_data) {
    next.common_data = {};
  }
  next.common_data.builder_preview_device = BUILDER_PREVIEW_DEVICES.includes(
    device
  )
    ? device
    : DEFAULT_BUILDER_PREVIEW_DEVICE;
  return next;
};

/** Always start a freshly opened layout on desktop preview. */
export const resetBuilderPreviewDeviceForOpen = (builderData) =>
  applyBuilderPreviewDevice(builderData, DEFAULT_BUILDER_PREVIEW_DEVICE);

/** Preview device is session UI state — do not persist to the database. */
export const stripBuilderPreviewDeviceForSave = (builderData) => {
  const next = structuredClone(builderData);
  if (next?.common_data) {
    delete next.common_data.builder_preview_device;
  }
  return next;
};

export const withSessionPreviewDevice = (builderData, sessionDevice) =>
  applyBuilderPreviewDevice(builderData, sessionDevice);
