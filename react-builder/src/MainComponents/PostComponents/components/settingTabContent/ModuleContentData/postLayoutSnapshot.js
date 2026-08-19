/** Deep clone full post layout tree (rows → columns → modules). */
export const clonePostLayoutData = (data) =>
  JSON.parse(JSON.stringify(data || []));

export const createPostModuleSettingsSnapshot = ({
  data,
  rowindex,
  columnindex,
  moduleindex,
}) => {
  const freshItems = JSON.parse(JSON.stringify(data || []));
  const moduleRef =
    freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  const settingsRef = moduleRef?.settings ? { ...moduleRef.settings } : {};

  if (moduleRef) {
    moduleRef.settings = settingsRef;
  }

  return { freshItems, settingsRef };
};

/**
 * Deep snapshot + patch current module settings, then commit layout.
 * `patch(settingsRef)` should mutate `settingsRef` in place.
 */
export const commitPostModuleSettingsPatch = ({
  data,
  rowindex,
  columnindex,
  moduleindex,
  onSettingChange,
  onAfterCommit,
  patch,
}) => {
  const { freshItems, settingsRef } = createPostModuleSettingsSnapshot({
    data,
    rowindex,
    columnindex,
    moduleindex,
  });
  const moduleRef =
    freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  if (
    !moduleRef ||
    typeof patch !== "function" ||
    typeof onSettingChange !== "function"
  ) {
    return;
  }
  patch(settingsRef);
  moduleRef.settings = settingsRef;
  if (typeof onAfterCommit === "function") {
    onAfterCommit(settingsRef);
  }
  onSettingChange(freshItems);
};

/**
 * Replace entire module settings object (deep clone) and commit layout.
 */
export const commitPostModuleReplaceSettings = ({
  data,
  rowindex,
  columnindex,
  moduleindex,
  onSettingChange,
  onAfterCommit,
  nextSettings,
}) => {
  const { freshItems } = createPostModuleSettingsSnapshot({
    data,
    rowindex,
    columnindex,
    moduleindex,
  });
  const moduleRef =
    freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
  if (!moduleRef || typeof onSettingChange !== "function") {
    return;
  }
  const merged =
    typeof nextSettings === "object" && nextSettings !== null
      ? JSON.parse(JSON.stringify(nextSettings))
      : {};
  moduleRef.settings = merged;
  if (typeof onAfterCommit === "function") {
    onAfterCommit(merged);
  }
  onSettingChange(freshItems);
};
