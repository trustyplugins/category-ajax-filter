import React, { useCallback, useEffect, useRef, useState ,memo, useMemo} from "react";
import { Skeleton } from "antd";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import parse from "html-react-parser";
import CustomFieldData from "./CustomFieldData";
import {
  generateFilterCSS,
  generateSkinCSS,
  validateTerm,
  generateFilterLabelCSS,
  generateFilterLabelInnerCSS
} from "../../../utils/functions";
import {
  commitFilterModuleSettingsPatch,
  dispatchFilterLayoutChange,
} from "../settingTabContent/ModuleContentData/filterSettingsSnapshot";
import { resolvePreviewTemplateDataFromBuilderData } from "../../../utils/builderDataAdapters";
import FilterModuleSortChrome from "./shared/FilterModuleSortChrome";
import {
  getShowMoreItemClassName,
  resolveTermShowMoreSettings,
} from "./shared/termShowMoreUtils";
import TermShowMoreButton from "./shared/TermShowMoreButton";
import { hasMultipleSortableTaxonomyTerms, canUseFilterTermReorder } from "./shared/taxonomyTermDrag";
import { hasMultipleSortableCustomFieldValues } from "./shared/customFieldTermDrag";
import {
  syncPreviewSelectedTags,
} from "../../../PreviewComponents/postPreview/previewRangeSliderTagUtils";
import { previewDropdownResetMatchesModule } from "../../../PreviewComponents/postPreview/previewSelectedTagsClose";
import {
  resolveFilterModuleSettingsForOutput,
  resolveFilterShowIconSetting,
} from "../settingTabContent/ModuleContentData/shared/filterModuleTier";
import { getResolvedFilterPostType } from "../settingTabContent/ModuleContentData/useResolvedMainBuilderData";
import {
  isTermVisualColor,
  getTermSwatchColor,
  shouldHideTermLabel,
  shouldShowTermLabelAsTooltip,
} from "../settingTabContent/ModuleContentData/termVisualUtils";
import { useCafTermLabelTooltip } from "./shared/useCafTermLabelTooltip";
import {
  getWooVirtualMetaKey,
  isWooVirtualTaxonomyKey,
} from "../woocommerce/wooVirtualTaxonomies";
import { isFacetTermUnavailable } from "../../../utils/facetTermAvailability";
import {
  buildPreviewFacetCountKey,
  resolvePreviewTermFacetState,
  shouldRenderPreviewTerm,
  PreviewFacetCountSpan,
} from "../../../PreviewComponents/postPreview/previewFacetCounts";
import { usePreviewFacetCounts } from "../../../PreviewComponents/postPreview/previewFacetCountsContext";
import {
  backfillTaxonomyDataCounts,
  buildTermCountMapFromTaxonomyList,
  termCountNeedsBackfill,
} from "../settingTabContent/ModuleContentData/termCountUtils";

import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
const TermSwatch = ({ color, className = "" }) => {
  if (!color) return null;
  return (
    <span
      className={`caf-term-swatch ${className}`.trim()}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
};

const DropdownToggleIcon = ({ isOpen }) => (
  <span className="selected-icon">
    <i className={`fas ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`} />
  </span>
);


const isPredefinedTermMatched = (predefinedTerms = [], itemId) => {
  const currentTerm = predefinedTerms[0];

  if (!currentTerm?.includes("___")) {
    return false;
  }

  return currentTerm.includes(`___${itemId}`);
};

const getDropdownAllOptionLabel = (settings) => {
  const value = settings?.dropdown_data?.all_option?.value;
  return value !== "" && value !== undefined && value !== null ? value : "All";
};

const hasAnyTaxonomyTerms = (taxonomyData = []) =>
  (taxonomyData || []).some((group) => (group?.term_data || []).length > 0);

function DropdownAllOptionItem({
  settings,
  activeTermKey,
  handleItemClick,
  textCount,
  iconText,
}) {
  const label = getDropdownAllOptionLabel(settings);
  const icons = settings?.dropdown_data?.all_option?.icons;
  const isActive = activeTermKey === "0";

  return (
    <li
      className={`caf-terms-list-item caf-dropdown-all-option caf-layout-${iconText} ${isActive ? "caf-selected active" : ""}`}
      term-id="0"
      term-value="all"
      predefine="false"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleItemClick(e, label, "0");
      }}
    >
      {icons?.visibility === true &&
        icons?.type === "icon" &&
        icons?.icon &&
        icons?.icon !== "" &&
        settings?.show_icon === "true" && (
          <i className={`fa-solid ${icons.icon} filter-before-icon`} />
        )}
      {icons?.visibility === true &&
        icons?.icon &&
        icons?.type === "svg" &&
        icons?.icon !== "" &&
        settings?.show_icon === "true" && (
          <InlineSVG
            src={icons?.icon?.url}
            className="caf-inline-svg-icon"
          />
        )}
      <div className={`manage-text-lbl caf-layout-${textCount}`}>
        <span className="trm-name">{label}</span>
      </div>
    </li>
  );
}

function DropdownTermPreviewItem({
  item,
  groupKey,
  handleItemClick,
  settings,
  validateTerm,
  updatedTaxonomy,
  textCount, 
  textCountVeritcal,
  iconText,
  isSelected,
  showMoreClassName = "",
}) {
  const { dynamicTermCountsEnabled, facetCounts } = usePreviewFacetCounts();
  const valid = shouldRenderPreviewTerm({
    groupKey,
    itemKey: item.key,
    updatedTaxonomy,
    dynamicTermCountsEnabled,
  });
  if (!valid) return null;
  const hideTermLabel = shouldHideTermLabel(settings);
  const showTermLabelTooltip = shouldShowTermLabelAsTooltip(settings);
  const termLabel = String(item?.value ?? "");
  const { tooltipProps, portal: termTooltipPortal, showTermTooltipClass } =
    useCafTermLabelTooltip(showTermLabelTooltip, termLabel);
  const isVirtualGroup = isWooVirtualTaxonomyKey(groupKey);
  const itemDataKey = isVirtualGroup ? getWooVirtualMetaKey(groupKey) : groupKey;
  const { count: displayCount, unavailable } = resolvePreviewTermFacetState({
    dynamicTermCountsEnabled,
    facetCounts,
    countKey: buildPreviewFacetCountKey({
      dataSource: "taxonomy",
      taxonomy: groupKey,
      metaKey: itemDataKey,
      termId: item.key,
      isVirtual: isVirtualGroup,
    }),
    staticCount: item?.count,
    isSelected,
  });

  return (
    <li
      className={`caf-terms-list-item caf-layout-${iconText} ${isSelected ? "caf-selected active" : ""} ${
        hideTermLabel ? "caf-hide-term-label" : ""
      } ${showTermTooltipClass ? "caf-has-term-tooltip" : ""} ${
        isVirtualGroup ? "caf-woo-virtual-item" : ""
      } ${
        unavailable ? "caf-facet-term-unavailable" : ""
      }${showMoreClassName}`}
      taxonomy={groupKey}
      data-key={itemDataKey}
      term-id={item.key}
      term-value={item.key}
      aria-disabled={unavailable ? "true" : undefined}
      {...(isVirtualGroup
        ? {
            "data-woo-virtual": "1",
            "data-woo-virtual-taxonomy": groupKey,
          }
        : {})}
      predefine={String(isPredefinedTermMatched(settings?.predefined_terms, item?.key))}
      {...tooltipProps}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (unavailable || isFacetTermUnavailable(e.currentTarget)) {
          return;
        }
        handleItemClick(e, item.value, item.key);
      }}
    >
      {termTooltipPortal}
        {resolveFilterShowIconSetting(settings?.show_icon, settings) === "true" &&
          isTermVisualColor(settings) &&
          getTermSwatchColor(item.icons) &&
          (!item.icons?.position || item.icons?.position === "before") && (
            <TermSwatch
              color={getTermSwatchColor(item.icons)}
              className="filter-before-icon"
            />
          )}
        {!isTermVisualColor(settings) &&
          item.icons?.icon &&
          item.icons?.type === 'icon' &&
          item.icons?.icon !== "" &&
          settings?.show_icon === "true" && (
            <i className={`fa-solid ${item.icons.icon} filter-before-icon`} />
          )}
        {!isTermVisualColor(settings) &&
          item.icons?.icon &&
          item.icons?.type==='svg' &&
          settings?.show_icon === 'true' && (
          <InlineSVG
          src={item.icons?.icon?.url}
          className="caf-inline-svg-icon"
        />
        )}
        {(!hideTermLabel || settings?.show_count === "true") && (
        <div className={`manage-text-lbl caf-layout-${textCount} ${textCountVeritcal}`}>
          {!hideTermLabel && (
            <span className="trm-name">{parse(`${item?.value}`)}</span>
          )}

          {settings?.show_count === "true" && (
            <PreviewFacetCountSpan settings={settings} count={displayCount} />
          )}
        </div>
        )}
        {resolveFilterShowIconSetting(settings?.show_icon, settings) === "true" &&
          isTermVisualColor(settings) &&
          getTermSwatchColor(item.icons) &&
          item.icons?.position === "after" && (
            <TermSwatch
              color={getTermSwatchColor(item.icons)}
              className="filter-after-icon"
            />
          )}
        {!isTermVisualColor(settings) &&
          item.icons?.icon &&
          item.icons?.position === "after" &&
          settings?.show_icon === "true" && (
              <i className={`fa-solid ${item.icons.icon} filter-after-icon`} />
            )}
    </li>
  );
}

const findTaxonomyKeyForTerm = (taxonomyData = [], termId) => {
  const walk = (nodes = []) => {
    for (const node of nodes) {
      if (String(node?.key) === String(termId)) {
        return true;
      }
      if (walk(node?.children_data || [])) {
        return true;
      }
    }
    return false;
  };

  for (const group of taxonomyData) {
    if (walk(group?.term_data || [])) {
      return String(group?.key ?? "");
    }
  }
  return "";
};

/**
 * Selected-value display of the dropdown. Resolves the live facet count so it
 * matches the open list instead of printing the stale layout-baked count.
 */
const DropdownSelectedTermContent = ({
  item,
  settings,
  selectedText,
  selectedTextVertical,
}) => {
  const { dynamicTermCountsEnabled, facetCounts } = usePreviewFacetCounts();
  const hideTermLabel = shouldHideTermLabel(settings);
  const groupKey = findTaxonomyKeyForTerm(
    settings?.taxonomy_data || [],
    item?.key
  );
  const isVirtualGroup = groupKey ? isWooVirtualTaxonomyKey(groupKey) : false;
  const itemDataKey = isVirtualGroup
    ? getWooVirtualMetaKey(groupKey)
    : groupKey;
  const { count: displayCount } = resolvePreviewTermFacetState({
    dynamicTermCountsEnabled,
    facetCounts,
    countKey: buildPreviewFacetCountKey({
      dataSource: "taxonomy",
      taxonomy: groupKey,
      metaKey: itemDataKey,
      termId: item?.key,
      isVirtual: isVirtualGroup,
    }),
    staticCount: item?.count,
    isSelected: true,
  });

  return (
    <>
      {resolveFilterShowIconSetting(settings?.show_icon, settings) === "true" &&
        isTermVisualColor(settings) &&
        getTermSwatchColor(item.icons) && (
          <TermSwatch
            color={getTermSwatchColor(item.icons)}
            className="filter-before-icon"
          />
        )}
      {!isTermVisualColor(settings) &&
        item.icons?.icon &&
        item.icons?.type === "icon" &&
        settings?.show_icon === "true" && (
        <i className={`fa-solid ${item.icons.icon} filter-before-icon`} />
      )}
      {!isTermVisualColor(settings) &&
        item.icons?.icon &&
        item.icons?.type === "svg" &&
        settings?.show_icon === "true" && (
        <InlineSVG src={item.icons?.icon?.url} className="caf-inline-svg-icon" />
      )}
      {(!hideTermLabel || settings?.show_count === "true") && (
      <div className={`manage-text-lbl caf-layout-${selectedText} ${selectedTextVertical}`}>
        {!hideTermLabel && (
          <span className="trm-name">{parse(`${item?.value}`)}</span>
        )}
        {settings?.show_count === "true" && (
          <PreviewFacetCountSpan settings={settings} count={displayCount} />
        )}
      </div>
      )}
    </>
  );
};

const DropdownFilter = ({
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  initialdata,
  onSettingChange,
  mainBuilderData,
  isDragDisabled,
  setIndexes,
  indexes,
  selectType,
  currStep,
  setDropdownDomLoad = () => {},
}) => {
  const outputSettings = useMemo(() => {
    const resolved = resolveFilterModuleSettingsForOutput(settings) || {};
    const postType = getResolvedFilterPostType(
      mainBuilderData,
      settings?.post_type
    );
    return {
      ...resolved,
      post_type: postType || resolved?.post_type || settings?.post_type || "post",
    };
  }, [settings, mainBuilderData]);
  const moduleRootRef = useRef(null);
  const previewDefaultOverrideRef = useRef(false);
  const wasPreviewStepRef = useRef(false);
  const [active, setActive] = useState(false);
  const [selectDevice, setselectDevice] = useState(selectedDevice);
  const [enableToggle, setEnableToggle] = useState(outputSettings?.enable_toggle);
  const [closeToggle, setCloseToggle] = useState(outputSettings?.close_toggle);
  const [loading, setLoading] = useState(true);
  const [updatedTaxonomy, setUpdatedTaxonomy] = useState([]);
  const [slectedTags, setSelectedTags] = useState(false);
  const [activeTermKey, setActiveTermKey] = useState("0");
  const [termListExpanded, setTermListExpanded] = useState(false);
  const countBackfillRef = useRef(false);
  const applyFilterLayoutChange = useCallback(
    (freshItems) =>
      dispatchFilterLayoutChange({
        freshItems,
        mainBuilderData,
        onSettingChange,
      }),
    [mainBuilderData, onSettingChange]
  );

  // Heal missing term counts (dropdown first-selected-term often had no count).
  useEffect(() => {
    if (String(outputSettings?.show_count) !== "true") {
      return;
    }
    if (outputSettings?.data_source && outputSettings.data_source !== "taxonomy") {
      return;
    }
    const groups = outputSettings?.taxonomy_data;
    if (!Array.isArray(groups) || groups.length === 0) {
      return;
    }
    const needsBackfill = groups.some((group) =>
      (group?.term_data || []).some((term) => termCountNeedsBackfill(term?.count))
    );
    if (!needsBackfill || countBackfillRef.current) {
      return;
    }

    const postType =
      getResolvedFilterPostType(mainBuilderData, outputSettings?.post_type) ||
      outputSettings?.post_type ||
      "post";

    let cancelled = false;
    countBackfillRef.current = true;

    (async () => {
      try {
        const res = await apiClient.get(
          apiEndpoints.getTaxonomyRecursiveData(postType)
        );
        if (cancelled || res?.data?.status !== "success") {
          countBackfillRef.current = false;
          return;
        }
        const { next, changed } = backfillTaxonomyDataCounts(
          groups,
          buildTermCountMapFromTaxonomyList(res.data.taxonomy_list)
        );
        if (!changed || cancelled) {
          return;
        }
        commitFilterModuleSettingsPatch({
          data: initialdata,
          rowindex,
          columnindex,
          moduleindex,
          resolvedPostType: postType,
          onSettingChange: applyFilterLayoutChange,
          patch: (settingsRef) => {
            settingsRef.taxonomy_data = next;
          },
        });
      } catch (error) {
        countBackfillRef.current = false;
        console.warn(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    outputSettings?.show_count,
    outputSettings?.data_source,
    outputSettings?.taxonomy_data,
    outputSettings?.post_type,
    mainBuilderData,
    initialdata,
    rowindex,
    columnindex,
    moduleindex,
    applyFilterLayoutChange,
  ]);

    const getResolvedFlexProperty = (styleObj, metaKey, settings) => {
      if (!styleObj) return "flex-start";

      if (
        metaKey === "meta1" &&
        resolveFilterShowIconSetting(settings?.show_icon, settings) !== "true"
      ) {
        return "flex-start";
      }

      if (
        metaKey === "meta3" &&
        settings?.show_count !== "true" &&
        resolveFilterShowIconSetting(settings?.show_icon, settings) === "true"
      ) {
        return "flex-start";
      }

      const flexFlow = styleObj?.flexFlow;

      if (flexFlow === "column" || flexFlow === "column-reverse") {
        return styleObj?.alignItems ?? "flex-start";
      }

      return styleObj?.justifyContent ?? "flex-start";
    };

    const getResolvedFlexVerticalProperty = (styleObj, metaKey, settings) => {
      if (!styleObj) return "";

      if (
        metaKey === "meta1" &&
        resolveFilterShowIconSetting(settings?.show_icon, settings) !== "true"
      ) {
        return "caf-layout-height-100";
      }

      if (
        metaKey === "meta3" &&
        settings?.show_count !== "true" &&
        resolveFilterShowIconSetting(settings?.show_icon, settings) === "true"
      ) {
        return "";
      }

      return "";
    };

    const iconText = getResolvedFlexProperty(
      styleDefault?.meta1?.[selectedDevice]?.default,
      "meta1",
      outputSettings
    );
    const textCount = getResolvedFlexProperty(
      styleDefault?.meta3?.[selectedDevice]?.default,
      "meta3",
      outputSettings
    );
    const textCountVeritcal = getResolvedFlexVerticalProperty(
      styleDefault?.meta3?.[selectedDevice]?.default,
      "meta3",
      outputSettings
    );
    const selectedText = getResolvedFlexProperty(
      styleDefault?.meta4?.[selectedDevice]?.default,
      "meta4",
      outputSettings
    );
    const selectedTextVertical = getResolvedFlexVerticalProperty(
      styleDefault?.meta4?.[selectedDevice]?.default,
      "meta4",
      outputSettings
    );
    const selectedBox =
      styleDefault?.selectmeta?.[selectedDevice]?.default?.justifyContent ??
      "space-between";

 const [seletedTermHtml, setSeletedTermHtml] = useState(() => {

  const allOption = outputSettings?.dropdown_data?.all_option;
  const icons = allOption?.icons;
  const label = allOption?.value !== "" ? allOption?.value : "All";

  if (icons?.visibility === true && outputSettings.show_icon === "true") {
    // FONT ICON
    if (icons?.type === "icon" && icons?.icon) {
      //console.log('yes1')
      return (
        <>
        {/* <div className="manage-ic-lbl"> */}
          <i
            className={`fa-solid ${icons.icon} filter-before-icon`}
          />
          <div className="manage-text-lbl">
            <span className="trm-name">{label}</span>
          </div>
        {/* </div> */}
        </>
      );
    }

    // SVG ICON
    if (icons?.type === "svg" && icons?.icon?.url) {
      return (
        <>
        {/* <div className="manage-ic-lbl"> */}
          <InlineSVG
            src={icons.icon.url}
            className="caf-inline-svg-icon"
          />
          <div className="manage-text-lbl">
            <span className="trm-name">{label}</span>
          </div>
        {/* </div> */}
        </>
      );
    }
  }
  // DEFAULT (NO ICON)
  return (
    <>
    {/* <div className="manage-ic-lbl"> */}
      <div className="manage-text-lbl">
        {label}
      </div>
    {/* </div> */}
    </>
  );
});

const getPredefinedTermId = (predefinedTerms = []) => {
  const currentTerm = predefinedTerms[0];
  if (!currentTerm?.includes("___")) {
    return null;
  }

  const idx = String(currentTerm).lastIndexOf("___");
  return String(currentTerm).slice(idx + 3);
};

const findTaxonomyTermById = (taxonomyData = [], termId) => {
  const walk = (nodes = []) => {
    for (const node of nodes) {
      if (String(node?.key) === String(termId)) {
        return node;
      }
      const childMatch = walk(node?.children_data || []);
      if (childMatch) {
        return childMatch;
      }
    }
    return null;
  };

  for (const group of taxonomyData) {
    const match = walk(group?.term_data || []);
    if (match) {
      return match;
    }
  }
  return null;
};

const buildDropdownTermResultContent = (
  item,
  settings,
  selectedText,
  selectedTextVertical
) => (
  <DropdownSelectedTermContent
    item={item}
    settings={settings}
    selectedText={selectedText}
    selectedTextVertical={selectedTextVertical}
  />
);

// console.log(seletedTermHtml)

let custom_class = "";
  if (outputSettings?.custom_class) {
    custom_class = outputSettings.custom_class;
  }

  const visibility = outputSettings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    mainBuilderData
  );

  // let selectedTagData = {
  //   ...mainBuilderData.common_data.preview_template_data.misc_preview_data
  //     .selected_filter,
  // };
  let dndColDataData = [
    ...(previewTemplateData?.misc_preview_data?.dnd_column_data || []),
  ];
  let selectedTagData = dndColDataData.flatMap(col => col.data || []).find(item => item.key === "selected");

//console.log(selectedTagData);

  const AddSelectedTags = () => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    syncPreviewSelectedTags(scopeDocument, selectedTagData);
  };

  useEffect(() => {
    if (slectedTags === true) {
      AddSelectedTags();
    }
  }, [selectedTagData?.settings?.is_enable, selectedTagData?.settings?.close_button]);

  useEffect(() => {
    const isPreviewStep = selectType === "post-preview" && currStep === "3";
    if (isPreviewStep && !wasPreviewStepRef.current) {
      previewDefaultOverrideRef.current = false;
    }
    wasPreviewStepRef.current = isPreviewStep;
  }, [selectType, currStep]);

  useEffect(() => {
    previewDefaultOverrideRef.current = false;
  }, [settings?.predefined_terms, settings?.cf_predefined_terms]);

  useEffect(() => {
    if (selectType !== "post-preview" || currStep !== "3") {
      return;
    }
    if (previewDefaultOverrideRef.current) {
      return;
    }
    if (outputSettings?.data_source !== "taxonomy") {
      return;
    }

    const termId = getPredefinedTermId(outputSettings?.predefined_terms || []);
    if (!termId || termId === "0") {
      return;
    }
    if (!updatedTaxonomy || Object.keys(updatedTaxonomy).length === 0) {
      return;
    }

    const term = findTaxonomyTermById(outputSettings?.taxonomy_data || [], termId);
    if (!term) {
      return;
    }

    const taxonomyKey = (outputSettings?.taxonomy_data || []).find((group) => {
      const walk = (nodes = []) => {
        for (const node of nodes) {
          if (String(node?.key) === String(termId)) {
            return true;
          }
          if (walk(node?.children_data || [])) {
            return true;
          }
        }
        return false;
      };
      return walk(group?.term_data || []);
    })?.key;

    if (!validateTerm(taxonomyKey, termId, updatedTaxonomy)) {
      return;
    }

    setActiveTermKey(String(termId));
    setSeletedTermHtml(
      buildDropdownTermResultContent(term, outputSettings, selectedText, selectedTextVertical)
    );
  }, [
    selectType,
    currStep,
    outputSettings?.data_source,
    outputSettings?.predefined_terms,
    outputSettings?.taxonomy_data,
    updatedTaxonomy,
    selectedText,
    selectedTextVertical,
  ]);

  useEffect(() => {
    AddSelectedTags();
  }, [
    activeTermKey,
    updatedTaxonomy,
    selectedTagData?.settings?.close_button,
    selectedTagData?.settings?.is_enable,
  ]);

  const applyAllOptionDisplayHtml = () => {
    const allOption = outputSettings?.dropdown_data?.all_option;
    const icons = allOption?.icons;
    const label = allOption?.value !== "" ? allOption?.value : "All";
    const defaultHtml = (
      <div className={`manage-text-lbl caf-layout-${selectedText}`}>{label}</div>
    );

    if (icons?.visibility === true && outputSettings.show_icon === "true") {
      if (icons.type === "icon" && icons.icon) {
        setSeletedTermHtml(
          <>
            <i className={`fa-solid ${icons.icon} filter-before-icon`} />
            <div className={`manage-text-lbl caf-layout-${selectedText}`}>
              <span className="trm-name">{label}</span>
            </div>
          </>
        );
        return;
      }
      if (icons.type === "svg" && icons.icon?.url) {
        setSeletedTermHtml(
          <>
            <InlineSVG src={icons.icon.url} className="caf-inline-svg-icon" />
            <div className={`manage-text-lbl caf-layout-${selectedText}`}>
              <span className="trm-name">{label}</span>
            </div>
          </>
        );
        return;
      }
    }

    setSeletedTermHtml(defaultHtml);
  };

  const resetDropdownPreviewToAll = () => {
    previewDefaultOverrideRef.current = true;
    setActiveTermKey("0");
    setActive(false);
    applyAllOptionDisplayHtml();
    window.setTimeout(() => {
      AddSelectedTags();
    }, 80);
  };

  useEffect(() => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    const resetDropdownToAll = (event) => {
      if (
        !previewDropdownResetMatchesModule(
          event?.detail || {},
          rowindex,
          columnindex,
          moduleindex
        )
      ) {
        return;
      }
      resetDropdownPreviewToAll();
    };

    const handleSmartSearchClear = () => {
      resetDropdownPreviewToAll();
    };

    scopeDocument.addEventListener("caf-preview-reset-dropdown", resetDropdownToAll);
    scopeDocument.addEventListener(
      "caf-preview-smart-search-clear",
      handleSmartSearchClear
    );
    return () => {
      scopeDocument.removeEventListener("caf-preview-reset-dropdown", resetDropdownToAll);
      scopeDocument.removeEventListener(
        "caf-preview-smart-search-clear",
        handleSmartSearchClear
      );
    };
  }, [rowindex, columnindex, moduleindex]);

  useEffect(() => {
    const markReady = () => {
      setLoading(false);
      if (selectType === "post-preview") {
        setDropdownDomLoad(true);
      }
    };

    if (outputSettings.data_source === "custom_field") {
      markReady();
      return undefined;
    }

    const taxonomyKeys = [];
    if (settings.taxonomy_data.length != 0) {
      settings.taxonomy_data.forEach((ele) => {
        taxonomyKeys.push(ele.key);
      });
    }

    if (taxonomyKeys.length === 0) {
      markReady();
      return undefined;
    }

    setLoading(true);
    let cancelled = false;

    (async () => {
      try {
        const res = await apiClient.get(
          apiEndpoints.verifyTaxonomyTerms(taxonomyKeys)
        );
        if (!cancelled && res.data.status == "success") {
          setUpdatedTaxonomy(res.data.taxonomy_data);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(error);
        }
      } finally {
        if (!cancelled) {
          markReady();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    JSON.stringify(settings.taxonomy_data),
    outputSettings.data_source,
    outputSettings.custom_field_data,
    selectType,
  ]);
  useEffect(() => {
    if (outputSettings?.enable_toggle) {
      setEnableToggle(outputSettings.enable_toggle);
    }
    if (outputSettings?.close_toggle) {
      setCloseToggle(outputSettings.close_toggle);
    }
  }, [outputSettings?.close_toggle, outputSettings?.enable_toggle]);

  useEffect(() => {
    setselectDevice(selectedDevice);
  }, [selectedDevice]);

  const handleItemClick = (e, val, termKey = "0") => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (e?.stopPropagation) {
      e.stopPropagation();
    }

    previewDefaultOverrideRef.current = true;
    const normalizedTermKey = String(termKey ?? "0");

    setActiveTermKey(normalizedTermKey);
    setActive(false);

    if (normalizedTermKey === "0") {
      applyAllOptionDisplayHtml();
    } else {
      const term = findTaxonomyTermById(
        settings?.taxonomy_data || [],
        normalizedTermKey
      );
      if (term) {
        setSeletedTermHtml(
          buildDropdownTermResultContent(
            term,
            settings,
            selectedText,
            selectedTextVertical
          )
        );
      }
    }

    setSelectedTags(true);
    setTimeout(() => {
      AddSelectedTags();
    }, 100);
  };

  useEffect(() => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    const handleSmartApplyDropdown = (event) => {
      if (
        !previewDropdownResetMatchesModule(
          event?.detail || {},
          rowindex,
          columnindex,
          moduleindex
        )
      ) {
        return;
      }
      const termKey = String(event?.detail?.termKey ?? "0");
      if (!termKey || termKey === "0") {
        resetDropdownPreviewToAll();
        return;
      }
      handleItemClick(
        { preventDefault() {}, stopPropagation() {} },
        "",
        termKey
      );
    };

    scopeDocument.addEventListener(
      "caf-preview-smart-apply-dropdown",
      handleSmartApplyDropdown
    );
    return () => {
      scopeDocument.removeEventListener(
        "caf-preview-smart-apply-dropdown",
        handleSmartApplyDropdown
      );
    };
  }, [rowindex, columnindex, moduleindex, settings?.taxonomy_data, settings?.custom_field_data]);

useEffect(() => {
  if (previewDefaultOverrideRef.current) {
    return;
  }
  if (selectType === "post-preview" && currStep === "3") {
    const termId = getPredefinedTermId(settings?.predefined_terms || []);
    if (termId && termId !== "0") {
      return;
    }
  }
  setActiveTermKey("0");
}, [
  settings?.dropdown_data?.all_option?.is_enable,
  settings?.dropdown_data?.all_option?.value,
  selectType,
  currStep,
  settings?.predefined_terms,
]);

useEffect(() => {
  if (previewDefaultOverrideRef.current) {
    return;
  }

  const allOption = outputSettings?.dropdown_data?.all_option;
  const icons = allOption?.icons;
  const label = allOption?.value !== "" ? allOption?.value : "All";

  // const defaultHtml = (
  //   <div className="manage-ic-lbl">
  //     <div className="manage-text-lbl">{label}</div>
  //   </div>
  // );
   const defaultHtml = (<div className={`manage-text-lbl caf-layout-${selectedText}`}>{label}</div>);

  if (icons?.visibility === true && outputSettings.show_icon === "true") {

    if (icons.type === "icon" && icons.icon) {
      setSeletedTermHtml(
        <>
        {/* <div className="manage-ic-lbl"> */}
          <i className={`fa-solid ${icons.icon} filter-before-icon`} />
          <div className={`manage-text-lbl caf-layout-${selectedText}`}>
            <span className="trm-name">{label}</span>
          </div>
        {/* </div> */}
        </>
      );
      return;
    }

    if (icons.type === "svg" && icons.icon?.url) {
      // console.log(icons.icon.url)
      setSeletedTermHtml(
        <>
        {/* <div className="manage-ic-lbl"> */}
          <InlineSVG
            src={icons.icon.url}
            className="caf-inline-svg-icon"
          />
          <div className={`manage-text-lbl caf-layout-${selectedText}`}>
            <span className="trm-name">{label}</span>
          </div>
        {/* </div> */}
        </>
      );
      return;
    }
  }

  setSeletedTermHtml(defaultHtml);

}, [
  outputSettings.show_icon,
  outputSettings.dropdown_data?.all_option?.icons?.visibility,
  outputSettings.dropdown_data?.all_option?.icons?.icon,
  outputSettings.dropdown_data?.all_option?.icons?.icon?.url,
  outputSettings.dropdown_data?.all_option?.icons?.type,
  outputSettings.dropdown_data?.all_option?.value,
  selectedText,
  selectedTextVertical,
]);

  const handleArrow = (arrow) => {
    if (arrow == "up") {
      setActive(false);
    } else {
      setActive(true);
    }
  };
  const handleToggle = () => {
    if (enableToggle == "true") {
      if (closeToggle == "false") {
        setCloseToggle("true");
      } else {
        setCloseToggle("false");
      }
    }
  };
  const showMoreOverflowCount = useMemo(() => {
    const config = resolveTermShowMoreSettings(outputSettings);
    if (!config.enabled || config.limit < 1) {
      return 0;
    }

    let termIndex = 0;
    let overflowCount = 0;

    (outputSettings?.taxonomy_data || []).forEach((group) => {
      (group?.term_data || []).forEach((item) => {
        const isPinned =
          String(activeTermKey) === String(item.key) ||
          String(item?.predefine) === "true";
        if (!isPinned && termIndex >= config.limit) {
          overflowCount += 1;
        }
        if (!isPinned) {
          termIndex += 1;
        }
      });
    });

    return overflowCount;
  }, [outputSettings, activeTermKey]);

  useEffect(() => {
    setTermListExpanded(false);
  }, [
    outputSettings?.term_show_more,
    outputSettings?.term_visible_limit,
    outputSettings?.taxonomy_data,
  ]);

  const isTermsDataEmpty = () => {
    if (
      outputSettings.data_source == "taxonomy" &&
      outputSettings.taxonomy_data?.length > 0
    ) {
      for (let i = 0; i < outputSettings.taxonomy_data.length; i++) {
        if (outputSettings.taxonomy_data[i].term_data.length != 0) {
          return true;
        }
      }
    } else {
      if (outputSettings.data_source == "custom_field") return true;
    }
    return false;
  };

  const commitTaxonomyPreview = useCallback(
    (mdata) => {
      commitFilterModuleSettingsPatch({
        data: initialdata,
        rowindex,
        columnindex,
        moduleindex,
        onSettingChange: applyFilterLayoutChange,
        patch: (s) => {
          s.taxonomy_data = JSON.parse(JSON.stringify(mdata));
        },
      });
    },
    [
      applyFilterLayoutChange,
      columnindex,
      initialdata,
      moduleindex,
      rowindex,
    ]
  );

  const commitCustomFieldPreview = useCallback(
    (nextCustomFieldData) => {
      commitFilterModuleSettingsPatch({
        data: initialdata,
        rowindex,
        columnindex,
        moduleindex,
        onSettingChange: applyFilterLayoutChange,
        patch: (moduleSettings) => {
          moduleSettings.custom_field_data = JSON.parse(
            JSON.stringify(nextCustomFieldData)
          );
        },
      });
    },
    [
      applyFilterLayoutChange,
      columnindex,
      initialdata,
      moduleindex,
      rowindex,
    ]
  );

  const isModuleActive =
    indexes?.type === "module" &&
    indexes?.rowindex === rowindex &&
    indexes?.columnindex === columnindex &&
    indexes?.moduleindex === moduleindex;

  const showTermSortChrome =
    isModuleActive &&
    canUseFilterTermReorder() &&
    ((outputSettings.data_source === "taxonomy" &&
      hasMultipleSortableTaxonomyTerms(outputSettings.taxonomy_data)) ||
      (outputSettings.data_source === "custom_field" &&
        hasMultipleSortableCustomFieldValues(outputSettings.custom_field_data)));

  const containsHTML = (str) => {
    // Check if the string contains HTML tags
    const div = document.createElement("div");
    div.innerHTML = str;
    return Array.from(div.childNodes).some((node) => node.nodeType === 1); // Node.ELEMENT_NODE === 1
  };

  return (
    <div
      ref={moduleRootRef}
      data-preview-row={rowindex}
      data-preview-column={columnindex}
      data-preview-module={moduleindex}
      data-active-term-key={activeTermKey}
      onClick={() =>
        setIndexes &&
        setIndexes({
          type: "module",
          rowindex: rowindex,
          columnindex: columnindex,
          moduleindex: moduleindex,
          module: module,
        })
      }
      className={`caf-builder-module-main caf-module-filter caf_module_${module.key} caf-module-${moduleindex} ${custom_class} ${
        isModuleActive ? "active" : ""
      } ${showTermSortChrome ? "caf-has-term-sort" : ""} ${hideClass}${
        termListExpanded ? " caf-term-list-expanded" : ""
      }`}
    >
      <FilterModuleSortChrome
        isActive={isModuleActive}
        moduleKey={module.key}
        dataSource={outputSettings.data_source}
        taxonomyData={settings.taxonomy_data}
        customFieldData={settings.custom_field_data}
        onSave={
          outputSettings.data_source === "custom_field"
            ? commitCustomFieldPreview
            : commitTaxonomyPreview
        }
      />
      
      {settings.label.is_label === "true" && (
        <div className="caf-filter-label-common label-header" onClick={() => handleToggle()}>
          {enableToggle === "true" && outputSettings?.toggle_position === "left" &&(
            <div className="caf-builder-filter-toggle-icon">
              {closeToggle === "false" ? (
                <span
                  className="label-icon-common">
                  <i className="fas fa-chevron-up"></i>
                </span>
              ) : (
                <span
                  className="label-icon-common">
                  <i className="fas fa-chevron-down"></i>
                </span>
              )}
            </div>
          )}
          <div className="caf-builder-filter-label-wrapper">
            {settings.label?.icons && settings.label?.icons?.icon !== "" ? (
                 <>
              {settings.label?.icons?.type ==="icon" && 
              <>
                {/* <div className="caf-builder-custom-filed-label-inner"> */}
                  {settings.label?.icons.position == "before-label" &&  settings.label?.icons. visibility === true &&(
                    <i
                      className={`caf-builder-before-label before-common ${settings.label?.icons.icon}`}
                    ></i>
                  )}
                  <span className="caf-builder-filter-label">
                  {settings.label?.value ? settings.label?.value : "Label"}
                  </span>
                  {settings.label?.icons.position == "after-label" && settings.label?.icons. visibility === true && (
                    <i
                      className={`caf-builder-after-label after-common ${settings.label?.icons.icon}`}
                    ></i>
                  )}
                {/* </div> */}
                </>
                }
                 {settings.label?.icons?.type ==="svg" && 
                 <>
                {/* <div className="caf-builder-custom-filed-label-inner"> */}
                  {settings.label?.icons.position == "before-label" && settings.label?.icons. visibility === true && (
                     <InlineSVG
                      src={settings.label?.icons?.icon?.url}
                      className="caf-inline-svg-icon caf-builder-before-label before-common"
                    />
                  )}
                  <span className="caf-builder-filter-label">
                    {settings.label?.value ? settings.label?.value : "Label"}
                  </span>
                  {settings.label?.icons.position == "after-label" && settings.label?.icons. visibility === true && (
                     <InlineSVG
                      src={settings.label?.icons?.icon?.url}
                      className="caf-inline-svg-icon caf-builder-after-label after-common"
                    />
                  )}
                {/* </div> */}
                </>
                }
                </>
            ) : (
              // <div className="caf-builder-custom-filed-label-inner">
              <span className="caf-builder-filter-label">
                {settings.label?.value ? settings.label?.value : "Label"}
                </span>
              // </div>
            )}
          </div>
          {enableToggle === "true" && outputSettings?.toggle_position === "right" && (
            <div className="caf-builder-filter-toggle-icon">
              {closeToggle === "false" ? (
                <span
                  className="label-icon-common">
                  <i className="fas fa-chevron-up"></i>
                </span>
              ) : (
                <span
                  className="label-icon-common">
                  <i className="fas fa-chevron-down"></i>
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {closeToggle === "false" && (
        <>
          {isTermsDataEmpty() === true ? (
            <>
              {outputSettings.data_source === "taxonomy" ? (
                <>
                  {
                    outputSettings.taxonomy_data?.length > 0 && (

                      <ul
                        className="caf-terms-list dropdown"
                        data-source="taxonomy"
                        category-relation={outputSettings?.category_relation ?? "OR"}
                        multiple-term={outputSettings?.multiple_term ?? "false"}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <li
                          className="caf-terms-list-item-wrraper"
                          term-value={outputSettings?.dropdown_data?.all_option?.value ?? 'all'}
                        >
                          <div
                            className={`caf-selected-term-main ${
                              activeTermKey === "0" ? "caf-all-selected" : ""
                            }`}
                            onClick={() => handleArrow(active ? "up" : "down")}
                          >
                            <div key={outputSettings?.dropdown_data?.all_option?.value ?? 'all'} className={`result caf-layout-${selectedBox}`}>
                              {containsHTML(seletedTermHtml)
                                ? parse(seletedTermHtml)
                                : seletedTermHtml}
                            </div>
                            <DropdownToggleIcon isOpen={active} />
                          </div>
                          <ul
                            style={{ display: active ? "flex" : "none" }}
                            className="caf-dropdown-child"
                          >
                            {hasAnyTaxonomyTerms(outputSettings.taxonomy_data) && (
                                <DropdownAllOptionItem
                                  key="caf-dropdown-all-option"
                                  settings={outputSettings}
                                  activeTermKey={activeTermKey}
                                  handleItemClick={handleItemClick}
                                  textCount={textCount}
                                  iconText={iconText}
                                />
                              )}
                            {(() => {
                              let termIndex = 0;
                              return outputSettings.taxonomy_data.map((items) => (
                                <React.Fragment key={String(items.key)}>
                                  {items?.term_data.length > 0 &&
                                    items.term_data.map((item) => {
                                      const isSelected =
                                        activeTermKey === String(item.key);
                                      const isPinned =
                                        isSelected ||
                                        String(item?.predefine) === "true";
                                      const showMoreClassName =
                                        getShowMoreItemClassName(
                                          outputSettings,
                                          termIndex,
                                          isPinned,
                                          termListExpanded
                                        );
                                      if (!isPinned) {
                                        termIndex += 1;
                                      }

                                      return (
                                        <DropdownTermPreviewItem
                                          key={String(item.key)}
                                          item={item}
                                          groupKey={items.key}
                                          handleItemClick={handleItemClick}
                                          settings={outputSettings}
                                          validateTerm={validateTerm}
                                          updatedTaxonomy={updatedTaxonomy}
                                          textCount={textCount}
                                          textCountVeritcal={textCountVeritcal}
                                          iconText={iconText}
                                          isSelected={isSelected}
                                          showMoreClassName={showMoreClassName}
                                        />
                                      );
                                    })}
                                </React.Fragment>
                              ));
                            })()}
                            <TermShowMoreButton
                              settings={outputSettings}
                              isExpanded={termListExpanded}
                              overflowCount={showMoreOverflowCount}
                              onToggle={() =>
                                setTermListExpanded((prev) => !prev)
                              }
                            />
                          </ul>
                        </li>
                      </ul>
                      // </div>
                    )}
                </>
              ) : (
                <CustomFieldData
                  moduleKey="dropdown_filter"
                  selectedDevice={selectedDevice}
                  styleDefault={styleDefault}
                  settings={outputSettings}
                  onSettingChange={onSettingChange}
                  rowindex={rowindex}
                  columnindex={columnindex}
                  moduleindex={moduleindex}
                  initialdata={initialdata}
                  mainBuilderData={mainBuilderData}
                  isDragDisabled={isDragDisabled}
                  getPredefinedTermId={getPredefinedTermId}
                  currStep={currStep}
                  selectType={selectType}
                  activeTermKey={activeTermKey}
                  setActiveTermKey={setActiveTermKey}
                  AddSelectedTags={AddSelectedTags}
                  previewDefaultOverrideRef={previewDefaultOverrideRef}
                />
              )}
            </>
          ) : loading ? (
            <Skeleton active />
          ) : (
            <p>No Data Found</p>
          )}
        </>
      )}
      <style>
        {`
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
              ${generateFilterCSS(
                "container",
                "default",
                selectedDevice,
                styleDefault
              )}
          }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
              ${generateFilterCSS(
                "container",
                "hover",
                selectedDevice,
                styleDefault
              )}
          }
        `}
        {`
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown{
           ${generateFilterCSS("meta", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list.dropdown:hover{
          ${generateFilterCSS("meta", "hover", selectedDevice, styleDefault)}
          }

          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown ul.caf-dropdown-child{
           ${generateFilterCSS(
             "mainmeta",
             "default",
             selectedDevice,
             styleDefault
           )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list.dropdown ul.caf-dropdown-child:hover{
          ${generateFilterCSS(
            "mainmeta",
            "hover",
            selectedDevice,
            styleDefault
          )}
          }

          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header{
              ${generateFilterLabelCSS("header", "default", selectedDevice, styleDefault)}
              }
           .caf-bl-filter  .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header:hover{
            ${generateFilterLabelCSS("header", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper{
              ${generateFilterLabelInnerCSS("header", "default", selectedDevice, styleDefault)}
            }
           .caf-bl-filter  .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper:hover{
            ${generateFilterLabelInnerCSS("header", "hover", selectedDevice, styleDefault)}
            }

          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li.caf-terms-list-item{
            ${generateFilterCSS(
              "meta1",
              "default",
              selectedDevice,
              styleDefault
            )}
           }
           .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li.caf-terms-list-item:hover{
           ${generateFilterCSS("meta1", "hover", selectedDevice, styleDefault)}
           }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li.caf-terms-list-item.caf-selected {
           ${generateFilterCSS(
             "meta1",
             "selected",
             selectedDevice,
             styleDefault
           )}
           }

          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item i,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item svg,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item img.caf-inline-svg-icon,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item .caf-term-swatch{
             ${generateFilterCSS(
               "icon",
               "default",
               selectedDevice,
               styleDefault
             )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item i:hover,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item svg:hover,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item img.caf-inline-svg-icon:hover,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item .caf-term-swatch:hover{
             ${generateFilterCSS("icon", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item.caf-selected i,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item.caf-selected svg,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item.caf-selected img.caf-inline-svg-icon,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item.caf-selected .caf-term-swatch{
             ${generateFilterCSS(
               "icon",
               "selected",
               selectedDevice,
               styleDefault
             )}
          }   
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item .manage-text-lbl span.count-span {
             ${generateFilterCSS(
               "count",
               "default",
               selectedDevice,
               styleDefault
             )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item .manage-text-lbl span.count-span {
             ${generateFilterCSS(
               "count",
               "hover",
               selectedDevice,
               styleDefault
             )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item.caf-selected .manage-text-lbl span.count-span {
             ${generateFilterCSS(
               "count",
               "selected",
               selectedDevice,
               styleDefault
             )}
          }  
       
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item .manage-text-lbl {
            ${generateFilterCSS(
              "meta3",
              "default",
              selectedDevice,
              styleDefault
            )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item .manage-text-lbl:hover {
            ${generateFilterCSS("meta3", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-terms-list.dropdown li.caf-terms-list-item.caf-selected .manage-text-lbl {
            ${generateFilterCSS(
              "meta3",
              "selected",
              selectedDevice,
              styleDefault
            )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected{
            ${generateFilterCSS(
              "selectmeta",
              "default",
              selectedDevice,
              styleDefault
            )}
           }
           .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected:hover{
           ${generateFilterCSS(
             "selectmeta",
             "hover",
             selectedDevice,
             styleDefault
           )}
           }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main{
            ${generateFilterCSS(
              "selectmeta",
              "selected",
              selectedDevice,
              styleDefault
            )}
           }
 
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main .result {
            ${generateFilterCSS(
              "meta4",
              "default",
              selectedDevice,
              styleDefault
            )}
          }
           .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main .result:hover {
           ${generateFilterCSS("meta4", "hover", selectedDevice, styleDefault)}
           }

          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result i ,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result svg,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result img.caf-inline-svg-icon,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result .caf-term-swatch
          {
            ${generateFilterCSS(
              "selecticon",
              "default",
              selectedDevice,
              styleDefault
            )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result i:hover ,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result svg:hover,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result img.caf-inline-svg-icon:hover,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main.caf-all-selected .result .caf-term-swatch:hover
          {
           ${generateFilterCSS(
             "selecticon",
             "hover",
             selectedDevice,
             styleDefault
           )}
           }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main .result i ,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main  .result svg,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main .result img.caf-inline-svg-icon,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li .caf-selected-term-main .result .caf-term-swatch
          {
            ${generateFilterCSS(
              "selecticon",
              "selected",
              selectedDevice,
              styleDefault
            )}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li.caf-term-show-more-item .caf-term-show-more-btn{
              ${generateFilterCSS("showmore", "default", selectedDevice, styleDefault)}
            }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} li.caf-term-show-more-item .caf-term-show-more-btn:hover{
              ${generateFilterCSS("showmore", "hover", selectedDevice, styleDefault)}
            }
        `}
      </style>
    </div>
  );
};

export default DropdownFilter;
