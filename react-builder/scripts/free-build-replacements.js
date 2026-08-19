/**
 * Pro-only modules replaced with NullModule when CAF_BUILD_FREE=1.
 * Keeps tier-locked UI out of the free plugin admin bundle.
 *
 * Patterns must match exact module file paths (end-anchored) so similarly
 * named modules are not stripped — e.g. ModuleCustomText.js vs ModuleCustomTextFilter.js.
 *
 * Path separators: webpack on Windows resolves with `\`. Match `/` or `\`
 * between segments so Free builds actually strip these modules.
 */
const path = require('path');

const NULL_MODULE = path.resolve(__dirname, '../src/build-free/NullModule.js');

const freeStub = (...segments) =>
  path.resolve(__dirname, '../src', ...segments);

/** Resolved path must end with one of these segments (file name included). */
const PRO_ONLY_MODULE_PATH_ENDINGS = [
  'ModuleContentData/ModuleCustomFieldContent.js',
  'ModuleContentData/ModuleCustomTextContent.js',
  'modules-output/ModuleCustomField.js',
  'modules-output/ModuleCustomText.js',
  'MiscComponents/Sorting.js',
  'MiscComponents/ResultCount.js',
  'MiscComponents/SelectedTag.js',
  'MainComponents/AnalyticsDashboardV2.js',
  'BuilderAnalyticsLogoIcon.js',
  'BuilderElementorLogoIcon.js',
  'modules-output/CustomFieldData.js',
  'MainComponents/CustomFontManager.js',
  'BadgeTypeSettings/DiscountBadgeSettings.js',
  'BadgeTypeSettings/FeaturedBadgeSettings.js',
  'BadgeTypeSettings/StockQuantityBadgeSettings.js',
  'BadgeTypeSettings/StockStatusTextBadgeSettings.js',
  'BadgeTypeSettings/BestSellerBadgeSettings.js',
  'shared/FilterTermReorderModal.js',
  'shared/customFieldTermDrag.js',
  'ModuleContentData/ResetModuleIconProPanel.js',
  'ModuleContentData/CustomTextModuleIconProPanel.js',
  'ModuleContentData/SearchIconProPanel.js',
  'ModuleContentData/SearchClearIconProPanel.js',
];

/**
 * Pro feature panels replaced with Free CTA / locked-chrome stubs (not NullModule).
 * Preserve Free feature paths; strip Pro implementation bodies.
 */
const PRO_FEATURE_STUB_REPLACEMENTS = [
  {
    ending: 'ModuleContentData/searchProFeatures.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/searchProFeatures.free.js'
    ),
  },
  {
    ending: 'shared/filterDataSourceControls.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/filterDataSourceControls.free.js'
    ),
  },
  {
    ending: 'FilterTypes/rangeSliderFieldOptions.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/FilterTypes/rangeSliderFieldOptions.free.js'
    ),
  },
  {
    ending: 'FilterComponents/filterQueryCustomFieldSource.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/filterQueryCustomFieldSource.free.js'
    ),
  },
  {
    ending: 'MainComponents/MiscSettingDrawer.js',
    newResource: freeStub('MainComponents/MiscSettingDrawer.free.js'),
  },
  {
    ending: 'MainComponents/GlobalSettingsDrawer.js',
    newResource: freeStub('MainComponents/GlobalSettingsDrawer.free.js'),
  },
  {
    ending: 'components/QueryRestrictionSettings.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/QueryRestrictionSettings.free.js'
    ),
  },
  {
    ending: 'utils/colorPicker.js',
    newResource: freeStub('MainComponents/utils/colorPicker.free.js'),
  },
  {
    ending: 'woocommerce/badgeTypeOptions.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/woocommerce/badgeTypeOptions.free.js'
    ),
  },
  {
    ending: 'WooModules/ProductImageContent.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/settingTabContent/ModuleContentData/WooModules/ProductImageContent.free.js'
    ),
  },
  {
    ending: 'WooModules/ProductPriceContent.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/settingTabContent/ModuleContentData/WooModules/ProductPriceContent.free.js'
    ),
  },
  {
    ending: 'WooModules/AddToCartContent.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/settingTabContent/ModuleContentData/WooModules/AddToCartContent.free.js'
    ),
  },
  {
    ending: 'ModuleContentData/WooFilterSettings.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/WooFilterSettings.free.js'
    ),
  },
  {
    ending: 'shared/filterModuleTier.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/filterModuleTier.free.js'
    ),
  },
  {
    ending: 'shared/FilterTermShowMoreProPanel.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermShowMoreProPanel.free.js'
    ),
  },
  {
    ending: 'shared/FilterLabelShowIconProPanel.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterLabelShowIconProPanel.free.js'
    ),
  },
  {
    ending: 'shared/FilterTermRowProActions.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermRowProActions.free.js'
    ),
  },
  {
    ending: 'shared/FilterTermIconSettingsModal.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermIconSettingsModal.free.js'
    ),
  },
  {
    ending: 'shared/FilterCfTermIconSettingsModal.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterCfTermIconSettingsModal.free.js'
    ),
  },
  {
    ending: 'shared/FilterLabelCollapseProPanel.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterLabelCollapseProPanel.free.js'
    ),
  },
  {
    ending: 'shared/FilterShowIconModeProPanel.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterShowIconModeProPanel.free.js'
    ),
  },
  {
    ending: 'shared/postModuleTier.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/settingTabContent/ModuleContentData/shared/postModuleTier.free.js'
    ),
  },
  {
    ending: 'ModuleContentData/PostPrefixSuffixProPanel.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/settingTabContent/ModuleContentData/PostPrefixSuffixProPanel.free.js'
    ),
  },
  {
    ending: 'ModuleContentData/PostModuleIconProPanel.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/settingTabContent/ModuleContentData/PostModuleIconProPanel.free.js'
    ),
  },
  {
    ending: 'shared/previewSettingsTier.js',
    newResource: freeStub(
      'MainComponents/PreviewComponents/postPreview/shared/previewSettingsTier.free.js'
    ),
  },
  {
    ending: 'GeneralComponents/PreviewLoaderSettingsPanel.js',
    newResource: freeStub(
      'MainComponents/PreviewComponents/postPreview/GeneralComponents/PreviewLoaderSettingsPanel.free.js'
    ),
  },
  {
    ending: 'GeneralComponents/FloatingFilterSettingsPanel.js',
    newResource: freeStub(
      'MainComponents/PreviewComponents/postPreview/GeneralComponents/FloatingFilterSettingsPanel.free.js'
    ),
  },
  {
    ending: 'ModuleContentData/PostImageCustomFieldProPanel.js',
    newResource: freeStub(
      'MainComponents/PostComponents/components/settingTabContent/ModuleContentData/PostImageCustomFieldProPanel.free.js'
    ),
  },
  {
    ending: 'ContentComponents/PostLinkCustomFieldProPanel.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/PostLinkCustomFieldProPanel.free.js'
    ),
  },
  {
    ending: 'shared/taxonomyTermDrag.js',
    newResource: freeStub(
      'MainComponents/FilterComponents/components/modules-output/shared/taxonomyTermDrag.free.js'
    ),
  },
];

/** Pro-only modules that a future free Woo feature may explicitly require. */
const WOO_DEPENDENT_MODULE_PATH_ENDINGS = [];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build an end-anchored regex that accepts `/` or `\` between path segments.
 *
 * @param {string} ending Forward-slash path ending (see PRO_ONLY_MODULE_PATH_ENDINGS).
 * @return {RegExp}
 */
function endingToResourceRegExp(ending) {
  const pattern = String(ending)
    .split('/')
    .map(escapeRegExp)
    .join('[\\\\/]');
  return new RegExp(`${pattern}$`);
}

/**
 * Free ships the curated Woo runtime by default. Set CAF_BUILD_WOO=0 only
 * for an intentional non-Woo build.
 */
function isWooSyncEnabled() {
  return process.env.CAF_BUILD_WOO !== '0';
}

function getFreeBuildReplacements() {
  const includeWoo = isWooSyncEnabled();
  const endings = includeWoo
    ? PRO_ONLY_MODULE_PATH_ENDINGS.filter(
        (ending) => !WOO_DEPENDENT_MODULE_PATH_ENDINGS.includes(ending)
      )
    : PRO_ONLY_MODULE_PATH_ENDINGS;

  const nullReplacements = endings.map((ending) => ({
    resourceRegExp: endingToResourceRegExp(ending),
    newResource: NULL_MODULE,
  }));

  const stubReplacements = PRO_FEATURE_STUB_REPLACEMENTS.map(
    ({ ending, newResource }) => ({
      resourceRegExp: endingToResourceRegExp(ending),
      newResource,
    })
  );

  return [...nullReplacements, ...stubReplacements];
}

module.exports = {
  getFreeBuildReplacements,
  endingToResourceRegExp,
  isWooSyncEnabled,
  NULL_MODULE,
  PRO_ONLY_MODULE_PATH_ENDINGS,
  PRO_FEATURE_STUB_REPLACEMENTS,
  WOO_DEPENDENT_MODULE_PATH_ENDINGS,
};
