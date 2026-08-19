import React, { useCallback, useEffect, useState, useRef, memo, useMemo } from "react";
import { Skeleton } from "antd";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import parse from "html-react-parser";
import CustomFieldData from "./CustomFieldData";
import HorizontalScrollList from "./HorizontalScrollList";
import { generateFilterCSS, getMetaStyle, generateSkinCSS, validateTerm ,generateFilterLabelCSS,generateFilterLabelInnerCSS} from '../../../utils/functions';
import { resolvePreviewTemplateDataFromBuilderData } from "../../../utils/builderDataAdapters";
import {
  commitFilterModuleSettingsPatch,
  dispatchFilterLayoutChange,
} from "../settingTabContent/ModuleContentData/filterSettingsSnapshot";
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
import { previewFilterResetMatchesModule } from "../../../PreviewComponents/postPreview/previewSelectedTagsClose";
import { buildLayoutClassesFromStyle } from "../../../shared/buildLayoutClassesFromStyle";
import { joinClassNames } from "../../../shared/joinClassNames";
import {
  resolveFilterModuleSettingsForOutput,
  resolveFilterShowIconSetting,
} from "../settingTabContent/ModuleContentData/shared/filterModuleTier";
import {
  backfillTaxonomyDataCounts,
  buildTermCountMapFromTaxonomyList,
  termCountNeedsBackfill,
} from "../settingTabContent/ModuleContentData/termCountUtils";
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


// const checkPredefinedTermSelected = (
//   settings,
//   item,
//   taxonomyKey,
//   isSelected,
//   index = 0
// ) => {
//   const predefinedTerms = settings?.predefined_terms || [];
//   const relation = settings?.category_relation;

//   const checkMatch = (term) => {
//     if (!term?.includes("___")) return false;

//     const [taxKey, termId] = term.split("___");

//     return (
//       taxKey?.trim() === taxonomyKey?.trim() &&
//       Number(termId) === Number(item?.key)
//     );
//   };

//   if (relation === "OR") {
//     return predefinedTerms.some(checkMatch) || isSelected;
//   }

//   if (relation === "AND") {
//     return checkMatch(predefinedTerms[index]) || isSelected;
//   }

//   return isSelected;
// };

const CheckboxTermPreviewItem = ({
  item,
  groupKey,
  settings,
  validateTerm,
  updatedTaxonomy,
  itemLayoutClasses,
  textCount,
  textCountVeritcal,
  iconText,
  iconTextVeritcal,
  isSelected,
  onToggle,
  showMoreClassName = "",
}) => {
  const { dynamicTermCountsEnabled, facetCounts } = usePreviewFacetCounts();
  const valid = shouldRenderPreviewTerm({
    groupKey,
    itemKey: item.key,
    updatedTaxonomy,
    dynamicTermCountsEnabled,
  });
  if (!valid) return null;

  const showCheckboxEnabled = settings?.show_checkbox === "true";
  const showIconEnabled = resolveFilterShowIconSetting(settings?.show_icon, settings) === "true";
  const showCountEnabled = settings?.show_count === "true";
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
      className={joinClassNames(
        "caf-terms-list-item",
        itemLayoutClasses,
        isSelected && "caf-selected",
        showCheckboxEnabled ? "caf-show-checkbox" : "caf-hidden-checkbox",
        showIconEnabled ? "caf-show-icon" : "caf-hidden-icon",
        showCountEnabled ? "caf-show-count" : "caf-hidden-count",
        hideTermLabel && "caf-hide-term-label",
        showTermTooltipClass && "caf-has-term-tooltip",
        isVirtualGroup && "caf-woo-virtual-item",
        unavailable && "caf-facet-term-unavailable",
        showMoreClassName
      )}
      taxonomy={groupKey}
      data-key={itemDataKey}
      term-id={item.key}
      term-value={item.key}
      term-slug={item?.slug || undefined}
      data-caf-term-label={termLabel || undefined}
      aria-disabled={unavailable ? "true" : undefined}
      {...(isVirtualGroup
        ? {
            "data-woo-virtual": "1",
            "data-woo-virtual-taxonomy": groupKey,
          }
        : {})}
      {...tooltipProps}
      onClick={(e) => {
        e.stopPropagation();
        if (unavailable || isFacetTermUnavailable(e.currentTarget)) {
          return;
        }
        onToggle(item.key);
      }}
    >
      {termTooltipPortal}
      <input
        type="checkbox"
        className={`caf-taxo-input`}
        value={item.key}
        name="caf-taxo-input"
        style={{ display: 'none' }}
        checked={isSelected}
        readOnly
        disabled={unavailable}
        data-predefined={isSelected}
      />
      {settings?.show_checkbox === 'true' && (
        <span className="caf-checkbox-box"></span>

      )}
      <div className={joinClassNames("manage-ic-lbl", `caf-layout-${iconText}`, iconTextVeritcal)}>

        {resolveFilterShowIconSetting(settings?.show_icon, settings) === 'true' &&
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
          resolveFilterShowIconSetting(settings?.show_icon, settings) === 'true' && (
          <i className={`fa-solid ${item.icons.icon} filter-before-icon`} />
        )}
        {!isTermVisualColor(settings) &&
          item.icons?.icon &&
          item.icons?.type === 'svg' &&
          resolveFilterShowIconSetting(settings?.show_icon, settings) === 'true' && (
          <InlineSVG
            src={item.icons?.icon?.url}
            className="caf-inline-svg-icon"
          />
        )}
        {(!hideTermLabel || showCountEnabled) && (
        <div className={joinClassNames(`manage-text-lbl caf-layout-${textCount}`, textCountVeritcal)}>
          {!hideTermLabel && (
            <span className="trm-name">{parse(`${item?.value}`)}</span>
          )}

          {settings?.show_count === 'true' && (
            <PreviewFacetCountSpan settings={settings} count={displayCount} />
          )}

        </div>
        )}
        {resolveFilterShowIconSetting(settings?.show_icon, settings) === 'true' &&
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
          resolveFilterShowIconSetting(settings?.show_icon, settings) === 'true' && (
          <i className={`fa-solid ${item.icons.icon} filter-after-icon`} />
        )}
      </div>
      {/* </label> */}
    </li>
  );
};

const CheckboxFilter = ({
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
  setCheckboxDomLoad = () => {},
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
  const [active, setActive] = useState(false);
  const [selectDevice, setselectDevice] = useState(selectedDevice);
  const [enableToggle, setEnableToggle] = useState(outputSettings?.enable_toggle);
  const [closeToggle, setCloseToggle] = useState(outputSettings?.close_toggle);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState(false);
  const [updatedTaxonomy, setUpdatedTaxonomy] = useState([]);
  const [selectedTermKeys, setSelectedTermKeys] = useState([]);
  const [termListExpanded, setTermListExpanded] = useState(false);

  const getResolvedFlexProperty = (styleObj,metaKey,settings) => {
    if (!styleObj) return "flex-start";
    if(metaKey === "meta1" && settings?.show_checkbox === "false"){
      return "flex-start";
    }
    if (
      metaKey === "meta2" &&
      resolveFilterShowIconSetting(settings?.show_icon, settings) !== "true"
    ) {
      return "flex-start";
    }
    if (
      metaKey === "meta3" &&
      settings?.show_count !== "true"
    ) {
      return "flex-start";
    }
  
    const flexFlow = styleObj?.flexFlow;
  
    if (flexFlow === "column" || flexFlow === "column-reverse") {
      return styleObj?.alignItems ?? "flex-start";
    } else {
      return styleObj?.justifyContent ?? "flex-start";
    }
  };

  const getResolvedFlexVerticalProperty = (styleObj,metaKey,settings) => {
    if (!styleObj) return "";
      if(metaKey === "meta2" && settings?.show_checkbox === "false"){
        return "caf-layout-height-100";
      }
      if (
        metaKey === "meta2" &&
        resolveFilterShowIconSetting(settings?.show_icon, settings) !== "true"
      ) {
        return "";
      }
      if(metaKey === "meta1" && settings?.show_checkbox === "false" && settings?.show_icon === "false"){
        return "caf-layout-height-100";
      }
      if (
        metaKey === "meta3" &&
        settings?.show_count !== "true"
      ) {
        return "";
      }
     return "";
  };
  

  const meta1Style =
    outputSettings?.show_checkbox === "true"
      ? styleDefault?.meta1?.[selectedDevice]?.default
      : null;
  const itemLayoutClasses = buildLayoutClassesFromStyle(meta1Style);

  const iconText = getResolvedFlexProperty(styleDefault?.meta2?.[selectedDevice]?.default,"meta2",outputSettings);
  const textCount = getResolvedFlexProperty(
    styleDefault?.meta3?.[selectedDevice]?.default,
    "meta3",
    outputSettings
  );

  const iconTextVeritcal = getResolvedFlexVerticalProperty(styleDefault?.meta2?.[selectedDevice]?.default,"meta2",outputSettings);
  const textCountVeritcal = getResolvedFlexVerticalProperty(
    styleDefault?.meta3?.[selectedDevice]?.default,
    "meta3",
    outputSettings
  );

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

  // let selectedTagData = { ...mainBuilderData.common_data.preview_template_data.misc_preview_data.selected_filter }

    let dndColDataData = [
    ...(previewTemplateData?.misc_preview_data?.dnd_column_data || []),
  ];
  let selectedTagData = dndColDataData.flatMap(col => col.data || []).find(item => item.key === "selected");

  const AddSelectedTags = () => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    syncPreviewSelectedTags(scopeDocument, selectedTagData);
  };
  useEffect(() => {
    if (selectedTags === true) {
      AddSelectedTags();
    }
  }, [selectedTagData?.settings?.is_enable, selectedTagData?.settings?.close_button])

  useEffect(() => {
    const markReady = () => {
      setLoading(false);
      if (selectType === "post-preview") {
        setCheckboxDomLoad(true);
      }
    };

    if (outputSettings.data_source === "custom_field") {
      markReady();
      return undefined;
    }

    const taxonomyKeys = [];
    if (settings.taxonomy_data.length !== 0) {
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
        if (!cancelled && res.data.status === "success") {
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

  // Heal missing term counts when show_count is on (new modules / terms without baked count).
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

  useEffect(() => {
    if (outputSettings?.enable_toggle) {
      setEnableToggle(outputSettings.enable_toggle);
    }
    if (outputSettings?.close_toggle) {
      setCloseToggle(outputSettings.close_toggle);
    }
  }, [outputSettings?.close_toggle, outputSettings?.enable_toggle]);

  useEffect(() => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    const handlePreviewResetCheckbox = (event) => {
      if (
        !previewFilterResetMatchesModule(
          event?.detail || {},
          rowindex,
          columnindex,
          moduleindex
        )
      ) {
        return;
      }
      setSelectedTermKeys([]);
    };

    const handleSmartApplyCheckbox = (event) => {
      if (
        !previewFilterResetMatchesModule(
          event?.detail || {},
          rowindex,
          columnindex,
          moduleindex
        )
      ) {
        return;
      }
      const keys = Array.isArray(event?.detail?.selectedTermKeys)
        ? event.detail.selectedTermKeys.map(String)
        : [];
      setSelectedTermKeys(keys);
    };

    const handleSmartSearchClear = () => {
      setSelectedTermKeys([]);
    };

    scopeDocument.addEventListener(
      "caf-preview-reset-checkbox",
      handlePreviewResetCheckbox
    );
    scopeDocument.addEventListener(
      "caf-preview-smart-apply-checkbox",
      handleSmartApplyCheckbox
    );
    scopeDocument.addEventListener(
      "caf-preview-smart-search-clear",
      handleSmartSearchClear
    );
    return () => {
      scopeDocument.removeEventListener(
        "caf-preview-reset-checkbox",
        handlePreviewResetCheckbox
      );
      scopeDocument.removeEventListener(
        "caf-preview-smart-apply-checkbox",
        handleSmartApplyCheckbox
      );
      scopeDocument.removeEventListener(
        "caf-preview-smart-search-clear",
        handleSmartSearchClear
      );
    };
  }, [rowindex, columnindex, moduleindex]);

  useEffect(() => {
    setselectDevice(selectedDevice);
  }, [selectedDevice]);
  const handleToggle = () => {
    if (enableToggle === "true") {
      if (closeToggle === "false") {
        setCloseToggle('true');
      } else {
        setCloseToggle('false');
      }
    }
  };
  useEffect(() => {
    if (selectType === "post-preview" && currStep === "3") {
     if(outputSettings?.data_source === "taxonomy"){
      const predefinedTerms = outputSettings?.predefined_terms || [];
      const multipleSelect = outputSettings?.multiple_term;
      let defaultSelected = [];
      if (multipleSelect === "true") {
        const fromPreset = predefinedTerms
          .map((term) => {
            const s = String(term);
            if (s.includes("___")) {
              const idx = s.lastIndexOf("___");
              return s.slice(idx + 3);
            }
            return s;
          })
          .filter(Boolean);
        const fromFlags = [];
        (outputSettings.taxonomy_data || []).forEach((g) => {
          const walk = (nodes) => {
            (nodes || []).forEach((t) => {
              if (String(t?.predefine) === "true" && t.key != null && t.key !== "") {
                fromFlags.push(String(t.key));
              }
              walk(t.children_data || []);
            });
          };
          walk(g?.term_data || []);
        });
        defaultSelected = [...new Set([...fromPreset, ...fromFlags])];
      }

      if (multipleSelect === "false") {
        const currentTerm = predefinedTerms[0];
        if (currentTerm?.includes("___")) {
          const idx = String(currentTerm).lastIndexOf("___");
          defaultSelected = [String(currentTerm).slice(idx + 3)];
        } else if (currentTerm) {
          defaultSelected = [String(currentTerm)];
        }
        //setSelectedTermKeys(defaultSelected);
      }

      setSelectedTermKeys(defaultSelected);
    }else{
      const predefinedTerms = outputSettings?.cf_predefined_terms || []; 
      const multipleSelect = outputSettings?.multiple_term; 
    
      let defaultSelected = [];
    
      if (multipleSelect === "true") {
        defaultSelected = predefinedTerms.map((term) => {
          const [, termId] = term.split("___");
          return String(termId);
        });
      }
    
      if (multipleSelect === "false") {
        const currentTerm = predefinedTerms[0];
        if (currentTerm?.includes("___")) {
          const [, termId] = currentTerm.split("___");
          defaultSelected = [String(termId)];
        }
      }
      setSelectedTermKeys(defaultSelected);
    }
  }
  }, [
    selectType,
    currStep,
    outputSettings?.predefined_terms,
    outputSettings?.multiple_term,
    outputSettings?.taxonomy_data,
  ]);
  useEffect(() => {
    if (outputSettings.multiple_term === "false" && selectedTermKeys.length > 1) {
      setSelectedTermKeys((prev) => (prev.length > 0 ? [prev[prev.length - 1]] : []));
    }
  }, [outputSettings.multiple_term, selectedTermKeys]);

  useEffect(() => {
    setTermListExpanded(false);
  }, [
    outputSettings?.term_show_more,
    outputSettings?.term_visible_limit,
    outputSettings?.taxonomy_data,
    outputSettings?.custom_field_data,
    outputSettings?.data_source,
  ]);

  const showMoreOverflowCount = useMemo(() => {
    const config = resolveTermShowMoreSettings(outputSettings);
    if (!config.enabled || config.limit < 1) {
      return 0;
    }

    const isPinnedTerm = (item, itemKey) =>
      selectedTermKeys.includes(itemKey) ||
      String(item?.predefine) === "true" ||
      (outputSettings?.cf_predefined_terms || []).some((term) => {
        const raw = String(term ?? "");
        return raw.includes("___") && raw.includes(`___${itemKey}`);
      });

    let pinCount = 0;
    const walkItems = (visitor) => {
      if (outputSettings?.data_source === "custom_field") {
        (outputSettings?.custom_field_data || []).forEach((group) => {
          (group?.custom_field_value_list || []).forEach((item) => {
            visitor(item, String(item?.key));
          });
        });
        return;
      }
      (outputSettings?.taxonomy_data || []).forEach((group) => {
        (group?.term_data || []).forEach((item) => {
          visitor(item, String(item?.key));
        });
      });
    };

    walkItems((item, itemKey) => {
      if (
        outputSettings?.data_source === "custom_field"
          ? isPinnedTerm(item, itemKey)
          : selectedTermKeys.includes(itemKey) ||
            String(item?.predefine) === "true"
      ) {
        pinCount += 1;
      }
    });

    const freeSlots = Math.max(0, config.limit - pinCount);
    let nonPinnedIndex = 0;
    let overflowCount = 0;

    walkItems((item, itemKey) => {
      const pinned =
        outputSettings?.data_source === "custom_field"
          ? isPinnedTerm(item, itemKey)
          : selectedTermKeys.includes(itemKey) ||
            String(item?.predefine) === "true";
      if (pinned) {
        return;
      }
      if (nonPinnedIndex >= freeSlots) {
        overflowCount += 1;
      }
      nonPinnedIndex += 1;
    });

    return overflowCount;
  }, [outputSettings, selectedTermKeys]);

  const isTermsDataEmpty = () => {
    if (
      outputSettings.data_source === "taxonomy" &&
      outputSettings.taxonomy_data?.length > 0
    ) {
      for (let i = 0; i < outputSettings.taxonomy_data.length; i++) {
        if (outputSettings.taxonomy_data[i].term_data.length !== 0) {
          return true;
        }
      }
    } else {
      if (outputSettings.data_source === "custom_field") return true;
    }
    return false;
  };

  const commitTaxonomyPreview = useCallback(
    (nextTaxonomyData) => {
      commitFilterModuleSettingsPatch({
        data: initialdata,
        rowindex,
        columnindex,
        moduleindex,
        onSettingChange: applyFilterLayoutChange,
        patch: (moduleSettings) => {
          moduleSettings.taxonomy_data = JSON.parse(
            JSON.stringify(nextTaxonomyData)
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

  const handleCheckboxToggle = (termKey) => {
    const normalizedKey = String(termKey);
    setSelectedTermKeys((prev) => {
      const exists = prev.includes(normalizedKey);
      if (outputSettings.multiple_term === "false") {
        return exists ? [] : [normalizedKey];
      }
      if (exists) {
        return prev.filter((key) => key !== normalizedKey);
      }
      return [...prev, normalizedKey];
    });
  };
  useEffect(() => {
    AddSelectedTags();
  }, [
    selectedTermKeys,
    updatedTaxonomy,
    selectedTagData?.settings?.close_button,
    selectedTagData?.settings?.is_enable,
  ]);
  useEffect(() => {
    if (outputSettings.preview_state === 'selected') {
      const allKeys = (outputSettings.taxonomy_data || []).flatMap((group) => {
        const flatten = (terms = []) =>
          terms.flatMap((term) => [
            String(term?.key),
            ...(Array.isArray(term?.children_data) ? flatten(term.children_data) : []),
          ]);
        return flatten(group?.term_data || []);
      });
      setSelectedTermKeys(allKeys);
    }
  }, [outputSettings.preview_state]);

  return (
    <div
      ref={moduleRootRef}
      onClick={() =>
        setIndexes && setIndexes({
          type: "module",
          rowindex: rowindex,
          columnindex: columnindex,
          moduleindex: moduleindex,
          module: module,
        })
      }
      className={joinClassNames(
        "caf-builder-module-main",
        "caf-module-filter",
        `caf_module_${module.key}`,
        `caf-module-${moduleindex}`,
        custom_class,
        isModuleActive && "active",
        showTermSortChrome && "caf-has-term-sort",
        hideClass,
        termListExpanded && "caf-term-list-expanded"
      )}
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
      {outputSettings.label.is_label === "true" && (
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
            {outputSettings.label?.icons && outputSettings.label?.icons?.icon !== "" ? (
                 <>
              {outputSettings.label?.icons?.type ==="icon" && 
              <>
                {/* <div className="caf-builder-custom-filed-label-inner"> */}
                  {outputSettings.label?.icons.position === "before-label" &&  outputSettings.label?.icons. visibility === true &&(
                    <i
                      className={`caf-builder-before-label before-common ${outputSettings.label?.icons.icon}`}
                    ></i>
                  )}
                  <span className="caf-builder-filter-label">
                  {outputSettings.label?.value ? outputSettings.label?.value : "Label"}
                  </span>
                  {outputSettings.label?.icons.position === "after-label" && outputSettings.label?.icons. visibility === true && (
                    <i
                      className={`caf-builder-after-label after-common ${outputSettings.label?.icons.icon}`}
                    ></i>
                  )}
                {/* </div> */}
                </>
                }
                 {outputSettings.label?.icons?.type ==="svg" && 
                 <>
                {/* <div className="caf-builder-custom-filed-label-inner"> */}
                  {outputSettings.label?.icons.position === "before-label" && outputSettings.label?.icons. visibility === true && (
                     <InlineSVG
                      src={outputSettings.label?.icons?.icon?.url}
                      className="caf-inline-svg-icon caf-builder-before-label before-common"
                    />
                  )}
                  <span className="caf-builder-filter-label">
                    {outputSettings.label?.value ? outputSettings.label?.value : "Label"}
                  </span>
                  {outputSettings.label?.icons.position === "after-label" && outputSettings.label?.icons. visibility === true && (
                     <InlineSVG
                      src={outputSettings.label?.icons?.icon?.url}
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
                {outputSettings.label?.value ? outputSettings.label?.value : "Label"}
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
                  <HorizontalScrollList
                    dataSource="taxonomy"
                    categoryRelation={outputSettings?.category_relation ?? "OR"}
                    multipleTerm={outputSettings?.multiple_term ?? "false"}
                  >
                    {(() => {
                      let pinCount = 0;
                      outputSettings.taxonomy_data.forEach((group) => {
                        (group?.term_data || []).forEach((item) => {
                          if (
                            selectedTermKeys.includes(String(item.key)) ||
                            String(item?.predefine) === "true"
                          ) {
                            pinCount += 1;
                          }
                        });
                      });
                      let nonPinnedIndex = 0;
                      return outputSettings.taxonomy_data.map((group) => (
                        <React.Fragment key={`parent-group-${group.key}`}>
                          {group.term_data.map((item) => {
                            const isSelected = selectedTermKeys.includes(
                              String(item.key)
                            );
                            const isPinned =
                              isSelected || String(item?.predefine) === "true";
                            const showMoreClassName = getShowMoreItemClassName(
                              outputSettings,
                              nonPinnedIndex,
                              isPinned,
                              termListExpanded,
                              pinCount
                            );
                            if (!isPinned) {
                              nonPinnedIndex += 1;
                            }

                            return (
                              <React.Fragment key={item.key}>
                                <CheckboxTermPreviewItem
                                  item={item}
                                  groupKey={group.key}
                                  settings={outputSettings}
                                  validateTerm={validateTerm}
                                  updatedTaxonomy={updatedTaxonomy}
                                  itemLayoutClasses={itemLayoutClasses}
                                  textCount={textCount}
                                  textCountVeritcal={textCountVeritcal}
                                  iconText={iconText}
                                  iconTextVeritcal={iconTextVeritcal}
                                  isSelected={isSelected}
                                  onToggle={handleCheckboxToggle}
                                  showMoreClassName={showMoreClassName}
                                />
                                {item.children_data?.length > 0 && (
                                  <ul className="children">
                                    {item.children_data.map((child) => (
                                      <CheckboxTermPreviewItem
                                        key={child.key}
                                        item={child}
                                        groupKey={group.key}
                                        settings={outputSettings}
                                        validateTerm={validateTerm}
                                        updatedTaxonomy={updatedTaxonomy}
                                        itemLayoutClasses={itemLayoutClasses}
                                        textCount={textCount}
                                        textCountVeritcal={textCountVeritcal}
                                        iconText={iconText}
                                        iconTextVeritcal={iconTextVeritcal}
                                        isSelected={selectedTermKeys.includes(
                                          String(child.key)
                                        )}
                                        onToggle={handleCheckboxToggle}
                                      />
                                    ))}
                                  </ul>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      ));
                    })()}
                    <TermShowMoreButton
                      settings={outputSettings}
                      isExpanded={termListExpanded}
                      overflowCount={showMoreOverflowCount}
                      onToggle={() => setTermListExpanded((prev) => !prev)}
                    />
                  </HorizontalScrollList>
                </>
              ) : (
                <CustomFieldData
                  moduleKey="checkbox_filter"
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
                  selectedTermKeys={selectedTermKeys}
                  onToggle={handleCheckboxToggle}
                  termListExpanded={termListExpanded}
                  showMoreOverflowCount={showMoreOverflowCount}
                  onToggleShowMore={() => setTermListExpanded((prev) => !prev)}
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
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} {
                ${generateFilterCSS("container", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover {
                ${generateFilterCSS("container", "hover", selectedDevice, styleDefault)}
            }    
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}.caf-builder-module-main.caf-module-filter ul.caf-checkbox{
              ${generateFilterCSS("meta", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}.caf-builder-module-main.caf-module-filter ul.caf-checkbox:hover{
              ${generateFilterCSS("meta", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-terms-list-item{
              ${generateFilterCSS("meta1", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-terms-list-item:hover{
              ${generateFilterCSS("meta1", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li span.caf-checkbox-box{
              ${generateFilterCSS("input", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li span.caf-checkbox-box:hover{
              ${generateFilterCSS("input", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl i,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl svg,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl img.caf-inline-svg-icon,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl .caf-term-swatch{
              ${generateFilterCSS("icon", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl i:hover,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl svg:hover,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl img.caf-inline-svg-icon:hover,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl .caf-term-swatch:hover{
              ${generateFilterCSS("icon", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-text-lbl span.count-span{
              ${generateFilterCSS("count", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-text-lbl span.count-span:hover{
              ${generateFilterCSS("count", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl{
              ${generateFilterCSS("meta2", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-ic-lbl:hover{
              ${generateFilterCSS("meta2", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-text-lbl{
              ${generateFilterCSS("meta3", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li .manage-text-lbl:hover{
              ${generateFilterCSS("meta3", "hover", selectedDevice, styleDefault)}
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
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected {
              ${generateFilterCSS("meta1", "selected", selectedDevice, styleDefault)}
            }
            
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected span.caf-checkbox-box {
              ${generateFilterCSS("input", "selected", selectedDevice, styleDefault)}
            }
            
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected .manage-ic-lbl {
              ${generateFilterCSS("meta2", "selected", selectedDevice, styleDefault)}
            }
            
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected .manage-text-lbl {
              ${generateFilterCSS("meta3", "selected", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected .manage-ic-lbl i,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected .manage-ic-lbl svg,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected .manage-ic-lbl img.caf-inline-svg-icon,
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected .manage-ic-lbl .caf-term-swatch{
              ${generateFilterCSS("icon", "selected", selectedDevice, styleDefault)}
            }
            .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-checkbox li.caf-selected .manage-text-lbl span.count-span{
              ${generateFilterCSS("count", "selected", selectedDevice, styleDefault)}
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

export default CheckboxFilter;
