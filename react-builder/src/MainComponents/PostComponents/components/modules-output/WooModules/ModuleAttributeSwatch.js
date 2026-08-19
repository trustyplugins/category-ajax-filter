import React, { useCallback, useEffect, useState, useRef, memo, useMemo } from "react";
import parse from "html-react-parser";
import HorizontalScrollList from "../../../../FilterComponents/components/modules-output/HorizontalScrollList";
import { generateFilterCSS, generateFilterLabelCSS, generateFilterLabelInnerCSS } from '../../../../utils/functions';
import {
  commitFilterModuleSettingsPatch,
  dispatchFilterLayoutChange,
} from "../../../../FilterComponents/components/settingTabContent/ModuleContentData/filterSettingsSnapshot";
import {
  useWooProductCardVariation,
} from "../../woocommerce/WooProductCardVariationContext";
import FilterModuleSortChrome from "../../../../FilterComponents/components/modules-output/shared/FilterModuleSortChrome";
import { hasMultipleSortableTaxonomyTerms, canUseFilterTermReorder } from "../../../../FilterComponents/components/modules-output/shared/taxonomyTermDrag";
import { buildLayoutClassesFromStyle } from "../../../../shared/buildLayoutClassesFromStyle";
import { joinClassNames } from "../../../../shared/joinClassNames";
import {
  resolveFilterModuleSettingsForOutput,
  resolveFilterShowIconSetting,
} from "../../../../FilterComponents/components/settingTabContent/ModuleContentData/shared/filterModuleTier";
import {
  isTermVisualColor,
  getTermSwatchColor,
  resolveAttributeSwatchDisplayMode,
  applyAttributeSwatchDisplayMode,
  resolveTermLabelDisplay,
  TERM_LABEL_DISPLAY_SHOW,
  TERM_LABEL_DISPLAY_TOOLTIP,
} from "../../../../FilterComponents/components/settingTabContent/ModuleContentData/termVisualUtils";
import { useCafTermLabelTooltip } from "../../../../FilterComponents/components/modules-output/shared/useCafTermLabelTooltip";
import {
  getWooVirtualMetaKey,
  isWooVirtualTaxonomyKey,
} from "../../../../FilterComponents/components/woocommerce/wooVirtualTaxonomies";
import { isFacetTermUnavailable } from "../../../../utils/facetTermAvailability";
import { shouldRenderPreviewTerm } from "../../../../PreviewComponents/postPreview/previewFacetCounts";
import { usePreviewFacetCounts } from "../../../../PreviewComponents/postPreview/previewFacetCountsContext";

import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../../../shared/cafUploadedIcon";

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
  updatedTaxonomy,
  itemLayoutClasses,
  textCount,
  textCountVeritcal,
  iconText,
  iconTextVeritcal,
  isSelected,
  isUnavailable = false,
  isIncompatible = false,
  termSlug = "",
  onToggle,
  trustConfiguredTerms = false,
}) => {
  const { dynamicTermCountsEnabled } = usePreviewFacetCounts();
  const valid =
    trustConfiguredTerms ||
    shouldRenderPreviewTerm({
      groupKey,
      itemKey: item.key,
      updatedTaxonomy,
      dynamicTermCountsEnabled,
    });
  if (!valid) return null;

  const showIconEnabled = resolveFilterShowIconSetting(settings?.show_icon, settings) === "true";
  const termLabelDisplay = resolveTermLabelDisplay(settings);
  const hideTermLabel = termLabelDisplay !== TERM_LABEL_DISPLAY_SHOW;
  const showTermLabelTooltip = termLabelDisplay === TERM_LABEL_DISPLAY_TOOLTIP;
  const termLabel = String(item?.value ?? "");
  const { tooltipProps, portal: termTooltipPortal, showTermTooltipClass } =
    useCafTermLabelTooltip(showTermLabelTooltip, termLabel);
  const isVirtualGroup = isWooVirtualTaxonomyKey(groupKey);
  const itemDataKey = isVirtualGroup ? getWooVirtualMetaKey(groupKey) : groupKey;
  const resolvedSlug = String(termSlug || item?.slug || "").trim();

  return (
    <li
      className={joinClassNames(
        "caf-terms-list-item",
        "caf-attribute-swatch-term",
        isSelected && "caf-selected",
        isUnavailable && "caf-variation-option-unavailable",
        isIncompatible && "caf-variation-option-incompatible",
        hideTermLabel && "caf-hide-term-label",
        showTermTooltipClass && "caf-has-term-tooltip",
        isVirtualGroup && "caf-woo-virtual-item"
      )}
      taxonomy={groupKey}
      data-key={itemDataKey}
      term-id={item.key}
      term-value={item.key}
      term-slug={resolvedSlug}
      aria-disabled={isUnavailable ? "true" : undefined}
      {...(isVirtualGroup
        ? {
            "data-woo-virtual": "1",
            "data-woo-virtual-taxonomy": groupKey,
          }
        : {})}
      {...tooltipProps}
      onClick={(e) => {
        e.stopPropagation();
        if (isUnavailable || isFacetTermUnavailable(e.currentTarget)) {
          return;
        }
        onToggle(item.key);
      }}
    >
      {termTooltipPortal}
      <input
        type="checkbox"
        className="caf-taxo-input"
        value={item.key}
        name="caf-taxo-input"
        style={{ display: "none" }}
        checked={isSelected}
        readOnly
        data-predefined={isSelected}
      />
      {showIconEnabled &&
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
        item.icons?.type === "icon" &&
        showIconEnabled &&
        (!item.icons?.position || item.icons?.position === "before") && (
          <i className={`fa-solid ${item.icons.icon} filter-before-icon`} />
        )}
      {!isTermVisualColor(settings) &&
        item.icons?.icon &&
        item.icons?.type === "svg" &&
        showIconEnabled &&
        (!item.icons?.position || item.icons?.position === "before") && (
          <InlineSVG
            src={item.icons?.icon?.url}
            className="caf-inline-svg-icon filter-before-icon"
          />
        )}
      {!hideTermLabel && (
        <span className="trm-name caf-term-label">{parse(`${item?.value}`)}</span>
      )}
      {showIconEnabled &&
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
        showIconEnabled &&
        (item.icons?.type === "icon" ? (
          <i className={`fa-solid ${item.icons.icon} filter-after-icon`} />
        ) : item.icons?.type === "svg" ? (
          <InlineSVG
            src={item.icons?.icon?.url}
            className="caf-inline-svg-icon filter-after-icon"
          />
        ) : null)}
    </li>
  );
};

const getProductAttributeTermMap = (postData, taxonomyKey) => {
  const categories = postData?.categories;
  if (!categories || typeof categories !== "object" || !taxonomyKey) {
    return null;
  }
  // Missing key means preview payload never loaded this attribute — do not
  // treat as "product has zero terms" or layout preview will go blank.
  if (!Object.prototype.hasOwnProperty.call(categories, taxonomyKey)) {
    return null;
  }
  const rows = categories[taxonomyKey];
  const map = new Map();
  if (!Array.isArray(rows)) {
    return map;
  }
  rows.forEach((row) => {
    const id = String(row?.term_id ?? row?.termId ?? row?.key ?? "").trim();
    if (!id || id === "0") {
      return;
    }
    map.set(id, row);
  });
  return map;
};

const enrichTermFromProductRow = (term, productRow, settings) => {
  if (!term || !productRow || !isTermVisualColor(settings)) {
    return term;
  }
  if (getTermSwatchColor(term?.icons)) {
    return term;
  }
  const color = String(productRow?.color || "").trim();
  if (!color) {
    return term;
  }
  return {
    ...term,
    icons: {
      ...(term.icons || {}),
      type: "color",
      icon: color,
      color,
      position: term?.icons?.position || "before",
    },
  };
};

const mapConfiguredTermsForPreview = (
  group,
  settings,
  postData,
  { scopeToProduct = false } = {}
) => {
  const taxonomyKey = String(group?.key || "");
  const configuredTerms = Array.isArray(group?.term_data) ? group.term_data : [];
  const visibleTerms = configuredTerms.filter(
    (term) => String(term?.display ?? "true") !== "false"
  );
  const productMap = getProductAttributeTermMap(postData, taxonomyKey);

  if (scopeToProduct) {
    // Layout grid preview — mirror frontend (product ∩ configured).
    if (!productMap) {
      return visibleTerms.map((term) =>
        enrichTermFromProductRow(term, null, settings)
      );
    }
    return visibleTerms
      .filter((term) => productMap.has(String(term?.key)))
      .map((term) =>
        enrichTermFromProductRow(
          term,
          productMap.get(String(term?.key)),
          settings
        )
      );
  }

  // Post builder canvas — always show configured terms so authors can style.
  // Still enrich colors from the sample product when that term exists on it.
  return visibleTerms.map((term) =>
    enrichTermFromProductRow(
      term,
      productMap?.get(String(term?.key)) || null,
      settings
    )
  );
};

const ModuleAttributeSwatch = ({
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
  postData,
  isDragDisabled,
  setIndexes,
  indexes,
  selectType,
}) => {
  const outputSettings = useMemo(() => {
    const resolved = resolveFilterModuleSettingsForOutput(settings) || {};
    const displayMode = resolveAttributeSwatchDisplayMode({
      ...resolved,
      post_type: "product",
    });
    const synced = applyAttributeSwatchDisplayMode(
      { ...resolved, post_type: "product" },
      displayMode
    );
    return {
      ...synced,
      // Attribute Swatch is always single-select with no swatch/checkbox box.
      multiple_term: "false",
      show_checkbox: "false",
      data_source: "taxonomy",
      post_type: "product",
    };
  }, [settings]);
  // Grid/layout preview passes selectType="post-preview"; post builder does not.
  const isLayoutProductPreview = selectType === "post-preview";
  const moduleRootRef = useRef(null);
  const applyFilterLayoutChange = useCallback(
    (freshItems) =>
      dispatchFilterLayoutChange({
        freshItems,
        mainBuilderData,
        onSettingChange,
      }),
    [mainBuilderData, onSettingChange]
  );
  const [enableToggle, setEnableToggle] = useState(outputSettings?.enable_toggle);
  const [closeToggle, setCloseToggle] = useState(outputSettings?.close_toggle);
  const [selectedTermKeys, setSelectedTermKeys] = useState([]);
  const variationCtx = useWooProductCardVariation();

  const resolveTermSlug = useCallback((item, groupKey) => {
    if (item?.slug) {
      return String(item.slug);
    }
    const categories = postData?.categories?.[groupKey];
    if (Array.isArray(categories)) {
      const match = categories.find(
        (term) =>
          String(term?.term_id ?? term?.id ?? term?.key) === String(item?.key)
      );
      if (match?.slug) {
        return String(match.slug);
      }
    }
    return String(item?.value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }, [postData]);

  const isTermSelected = useCallback(
    (item, groupKey) => {
      const taxonomy = String(groupKey || "").trim();
      if (
        variationCtx?.matrix?.attributes?.includes(taxonomy)
      ) {
        const slug = resolveTermSlug(item, taxonomy);
        return String(variationCtx.selections?.[taxonomy] || "") === slug;
      }
      return selectedTermKeys.includes(String(item.key));
    },
    [variationCtx, selectedTermKeys, resolveTermSlug]
  );

  const isTermUnavailable = useCallback(
    (item, groupKey) => {
      const taxonomy = String(groupKey || "").trim();
      if (
        !variationCtx?.matrix ||
        !variationCtx?.isOptionAvailable ||
        !variationCtx.matrix.attributes?.includes(taxonomy)
      ) {
        return false;
      }
      const slug = resolveTermSlug(item, taxonomy);
      return !variationCtx.isOptionAvailable(taxonomy, slug);
    },
    [variationCtx, resolveTermSlug]
  );

  const isTermIncompatible = useCallback(
    (item, groupKey) => {
      const taxonomy = String(groupKey || "").trim();
      if (
        !variationCtx?.matrix ||
        !variationCtx?.isOptionCompatible ||
        !variationCtx.matrix.attributes?.includes(taxonomy)
      ) {
        return false;
      }
      const slug = resolveTermSlug(item, taxonomy);
      return !variationCtx.isOptionCompatible(taxonomy, slug);
    },
    [variationCtx, resolveTermSlug]
  );

  const getResolvedFlexProperty = (styleObj, metaKey, settings) => {
    if (!styleObj) return "flex-start";
    // meta1 always treated as checkbox/swatch-box off for attribute swatch.
    if (metaKey === "meta1") {
      return "flex-start";
    }
    if (
      metaKey === "meta2" &&
      resolveFilterShowIconSetting(settings?.show_icon, settings) !== "true"
    ) {
      return "flex-start";
    }
    // Attribute Swatch does not support show_count — meta3 always uses default justify.
    if (metaKey === "meta3") {
      return "flex-start";
    }

    const flexFlow = styleObj?.flexFlow;

    if (flexFlow === "column" || flexFlow === "column-reverse") {
      return styleObj?.alignItems ?? "flex-start";
    } else {
      return styleObj?.justifyContent ?? "flex-start";
    }
  };

  const getResolvedFlexVerticalProperty = (styleObj, metaKey, settings) => {
    if (!styleObj) return "";
    // show_checkbox always false for attribute swatch.
    if (metaKey === "meta2") {
      return "caf-layout-height-100";
    }
    if (metaKey === "meta1" && settings?.show_icon === "false") {
      return "caf-layout-height-100";
    }
    if (metaKey === "meta3") {
      return "";
    }
    return "";
  };

  // show_checkbox always off — do not apply meta1 layout classes from checkbox styling.
  const itemLayoutClasses = buildLayoutClassesFromStyle(null);

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

  const previewTaxonomyData = useMemo(() => {
    const groups = Array.isArray(outputSettings?.taxonomy_data)
      ? outputSettings.taxonomy_data
      : [];

    return groups.map((group) => ({
      ...group,
      term_data: mapConfiguredTermsForPreview(
        group,
        outputSettings,
        postData,
        { scopeToProduct: isLayoutProductPreview }
      ),
    }));
  }, [outputSettings, postData, isLayoutProductPreview]);

  // Attribute Swatch trusts configured (+ product-scoped) terms — no verify-taxonomy-terms API.
  const effectiveUpdatedTaxonomy = useMemo(() => {
    const base = {};
    previewTaxonomyData.forEach((group) => {
      const taxonomyKey = String(group?.key || "");
      if (!taxonomyKey) {
        return;
      }
      base[taxonomyKey] = (group?.term_data || [])
        .map((term) => String(term?.key ?? "").trim())
        .filter((id) => id && id !== "0");
    });
    return base;
  }, [previewTaxonomyData]);

  useEffect(() => {
    if (outputSettings?.enable_toggle) {
      setEnableToggle(outputSettings.enable_toggle);
    }
    if (outputSettings?.close_toggle) {
      setCloseToggle(outputSettings.close_toggle);
    }
  }, [outputSettings?.close_toggle, outputSettings?.enable_toggle]);

  const handleToggle = () => {
    if (enableToggle === "true") {
      if (closeToggle === "false") {
        setCloseToggle('true');
      } else {
        setCloseToggle('false');
      }
    }
  };
  const isTermsDataEmpty = () => {
    for (let i = 0; i < previewTaxonomyData.length; i++) {
      if ((previewTaxonomyData[i]?.term_data || []).length !== 0) {
        return true;
      }
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

  const isModuleActive =
    indexes?.type === "module" &&
    indexes?.rowindex === rowindex &&
    indexes?.columnindex === columnindex &&
    indexes?.moduleindex === moduleindex;

  const showTermSortChrome =
    Boolean(onSettingChange) &&
    isModuleActive &&
    canUseFilterTermReorder() &&
    hasMultipleSortableTaxonomyTerms(previewTaxonomyData);

  const handleCheckboxToggle = (termKey, termSlug, taxonomy, slugOrder = []) => {
    const normalizedKey = String(termKey);
    const normalizedSlug = String(termSlug || "").trim();
    const tax = String(taxonomy || "").trim();

    if (variationCtx?.matrix && variationCtx?.setSelection && tax && normalizedSlug) {
      if (
        variationCtx.isOptionAvailable &&
        !variationCtx.isOptionAvailable(tax, normalizedSlug)
      ) {
        return;
      }
      const isCurrentlySelected =
        String(variationCtx.selections?.[tax] || "") === normalizedSlug;
      variationCtx.setSelection(
        tax,
        isCurrentlySelected ? "" : normalizedSlug,
        slugOrder
      );
      return;
    }

    setSelectedTermKeys((prev) => {
      const exists = prev.includes(normalizedKey);
      return exists ? [] : [normalizedKey];
    });
  };

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
        "caf-module-woo_attribute_swatch",
        `caf-module-${module.key}`,
        `caf_module_${module.key}`,
        `caf-module-${moduleindex}`,
        custom_class,
        isModuleActive && "active",
        showTermSortChrome && "caf-has-term-sort",
        hideClass
      )}
    >
      {onSettingChange ? (
        <FilterModuleSortChrome
          isActive={isModuleActive}
          moduleKey={module.key}
          dataSource="taxonomy"
          taxonomyData={settings?.taxonomy_data}
          onSave={commitTaxonomyPreview}
        />
      ) : null}
      {outputSettings.label?.is_label === "true" && (
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
          {isTermsDataEmpty() ? (
            <HorizontalScrollList
              className="caf-terms-list caf-attribute-swatch"
              dataSource="taxonomy"
              categoryRelation={outputSettings?.category_relation ?? "OR"}
              multipleTerm="false"
            >
              {previewTaxonomyData.map((group) => (
                  <React.Fragment key={`parent-group-${group.key}`}>
                    {(group.term_data || []).map((item) => {
                      if (String(item?.display ?? "true") === "false") {
                        return null;
                      }
                      const slugOrder = (group.term_data || [])
                        .map((term) => resolveTermSlug(term, group.key))
                        .filter(Boolean);
                      const isSelected = isTermSelected(item, group.key);

                      return (
                        <React.Fragment key={item.key}>
                          <CheckboxTermPreviewItem
                            item={item}
                            groupKey={group.key}
                            settings={outputSettings}
                            updatedTaxonomy={effectiveUpdatedTaxonomy}
                            itemLayoutClasses={itemLayoutClasses}
                            textCount={textCount}
                            textCountVeritcal={textCountVeritcal}
                            iconText={iconText}
                            iconTextVeritcal={iconTextVeritcal}
                            isSelected={isSelected}
                            isUnavailable={isTermUnavailable(item, group.key)}
                            isIncompatible={isTermIncompatible(item, group.key)}
                            termSlug={resolveTermSlug(item, group.key)}
                            onToggle={(termKey) =>
                              handleCheckboxToggle(
                                termKey,
                                resolveTermSlug(item, group.key),
                                group.key,
                                slugOrder
                              )
                            }
                            trustConfiguredTerms
                          />
                          {item.children_data?.length > 0 && (
                            <ul className="children">
                              {item.children_data.map((child) => {
                                if (
                                  String(child?.display ?? "true") === "false"
                                ) {
                                  return null;
                                }
                                return (
                                  <CheckboxTermPreviewItem
                                    key={child.key}
                                    item={child}
                                    groupKey={group.key}
                                    settings={outputSettings}
                                    updatedTaxonomy={effectiveUpdatedTaxonomy}
                                    itemLayoutClasses={itemLayoutClasses}
                                    textCount={textCount}
                                    textCountVeritcal={textCountVeritcal}
                                    iconText={iconText}
                                    iconTextVeritcal={iconTextVeritcal}
                                    isSelected={isTermSelected(child, group.key)}
                                    isUnavailable={isTermUnavailable(
                                      child,
                                      group.key
                                    )}
                                    isIncompatible={isTermIncompatible(
                                      child,
                                      group.key
                                    )}
                                    termSlug={resolveTermSlug(child, group.key)}
                                    onToggle={(termKey) =>
                                      handleCheckboxToggle(
                                        termKey,
                                        resolveTermSlug(child, group.key),
                                        group.key,
                                        slugOrder
                                      )
                                    }
                                    trustConfiguredTerms
                                  />
                                );
                              })}
                            </ul>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
            </HorizontalScrollList>
          ) : isLayoutProductPreview ? null : (
            <p>Select an attribute and terms in Content settings.</p>
          )}
        </>
      )}

      <style>
        {`
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} {
                ${generateFilterCSS("container", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover {
                ${generateFilterCSS("container", "hover", selectedDevice, styleDefault)}
            }    
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}.caf-builder-module-main ul.caf-attribute-swatch,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}.caf-builder-module-main ul.caf-attribute-swatch{
              ${generateFilterCSS("meta", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}.caf-builder-module-main ul.caf-attribute-swatch:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}.caf-builder-module-main ul.caf-attribute-swatch:hover{
              ${generateFilterCSS("meta", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item{
              ${generateFilterCSS("meta1", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item:hover{
              ${generateFilterCSS("meta1", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch{
              display: inline-block;
              width: 1em;
              height: 1em;
              min-width: 1em;
              box-sizing: border-box;
              vertical-align: middle;
              flex-shrink: 0;
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch{
              ${generateFilterCSS("icon", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i:hover,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg:hover,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon:hover,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch:hover{
              ${generateFilterCSS("icon", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .trm-name,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .trm-name{
              ${generateFilterCSS("meta3", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .trm-name:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .trm-name:hover{
              ${generateFilterCSS("meta3", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch{
              ${generateFilterCSS("meta2", "default", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i:hover,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg:hover,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon:hover,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > i:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > svg:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > img.caf-inline-svg-icon:hover,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-terms-list-item > .caf-term-swatch:hover{
              ${generateFilterCSS("meta2", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header{
              ${generateFilterLabelCSS("header", "default", selectedDevice, styleDefault)}
              }
           .caf-bl-post  .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header:hover{
            ${generateFilterLabelCSS("header", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper{
              ${generateFilterLabelInnerCSS("header", "default", selectedDevice, styleDefault)}
            }
           .caf-bl-post  .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper:hover{
            ${generateFilterLabelInnerCSS("header", "hover", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected {
              ${generateFilterCSS("meta1", "selected", selectedDevice, styleDefault)}
            }
            
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > .trm-name,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > .trm-name {
              ${generateFilterCSS("meta3", "selected", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > i,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > svg,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > img.caf-inline-svg-icon,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > .caf-term-swatch,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > i,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > svg,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > img.caf-inline-svg-icon,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > .caf-term-swatch{
              ${generateFilterCSS("icon", "selected", selectedDevice, styleDefault)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > i,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > svg,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > img.caf-inline-svg-icon,
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > .caf-term-swatch,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > i,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > svg,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > img.caf-inline-svg-icon,
            .caf-builder-post-preview .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-attribute-swatch li.caf-selected > .caf-term-swatch{
              ${generateFilterCSS("meta2", "selected", selectedDevice, styleDefault)}
            }
            `}
      </style>
    </div>
  );
};

export default ModuleAttributeSwatch;
