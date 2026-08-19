import { getUpgradeUrl, isProTier } from "../../tier/capabilities";

export const PRO_FILTER_LIBRARY_TAB_KEYS = new Set([]);

export const PRO_LAYOUT_SETTINGS_LIBRARY_TAB_KEYS = new Set([
  "selected",
  "result_count",
  "sorting",
]);

export const isLibraryTemplateLocked = (template) =>
  !isProTier() && template?.tier === "pro";

export const isFilterLibraryTabLocked = (tabKey) =>
  !isProTier() && PRO_FILTER_LIBRARY_TAB_KEYS.has(tabKey);

export const isLayoutSettingsLibraryTabLocked = (tabKey) =>
  !isProTier() && PRO_LAYOUT_SETTINGS_LIBRARY_TAB_KEYS.has(tabKey);

export const getLibraryTemplateLockMessage = (template) =>
  `${template?.title || "This template"} is available in Category Ajax Filter Pro.`;

export const getFilterLibraryTabLockMessage = (tab) =>
  `${tab?.label || "This tab"} is available in Category Ajax Filter Pro.`;

export const getLayoutSettingsLibraryTabLockMessage = (tab) =>
  `${tab?.label || "This tab"} is available in Category Ajax Filter Pro.`;

export const getLibraryTemplateLockActionLabel = () => "Upgrade to Pro";

export const getLibraryTemplateUpgradeUrl = () => getUpgradeUrl();

export const shouldShowLibraryProUpsellCard = () => !isProTier();
