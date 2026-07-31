/** Ant Design v6 Dropdown popup classNames (replaces deprecated overlayClassName). */
export const BUILDER_NEW_MODULE_DROPDOWN_CLASS_NAMES = {
  root: "caf-module-action-dropdown-new-module",
};

/** Shared builder dropdown behavior (placement + popup mount). */
export const getBuilderDropdownProps = (overrides = {}) => ({
  trigger: ["click"],
  placement: "bottomRight",
  autoAdjustOverflow: false,
  getPopupContainer: () => document.body,
  ...overrides,
});

/** New Module action dropdown only — adds popup styling class. */
export const getBuilderNewModuleDropdownProps = (overrides = {}) =>
  getBuilderDropdownProps({
    classNames: BUILDER_NEW_MODULE_DROPDOWN_CLASS_NAMES,
    ...overrides,
  });
