import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import {
  generateFilterCSS,
  generateFilterLabelCSS,
  generateFilterLabelInnerCSS,
} from "../../../utils/functions";
import {
  WOO_FILTER_DATA_SOURCES,
  WOO_FILTER_META,
  WOO_RATING_FILTER_TYPE,
  WOO_RATING_INPUT_CLASS,
  WOO_RATING_ITEM_CLASS,
  getEnabledWooRatingOptions,
  getRatingCompare,
  getRatingDefaultValue,
  getWooRatingListClass,
  isRatingDisplayPicker,
  isWooFilterModuleKey,
} from "../woocommerce/wooFilterModuleTemplates";
import { resolvePreviewTemplateDataFromBuilderData } from "../../../utils/builderDataAdapters";
import { syncPreviewSelectedTags } from "../../../PreviewComponents/postPreview/previewRangeSliderTagUtils";
import { previewFilterResetMatchesModule } from "../../../PreviewComponents/postPreview/previewSelectedTagsClose";
import { usePreviewFacetCounts } from "../../../PreviewComponents/postPreview/previewFacetCountsContext";
import {
  buildPreviewFacetCountKey,
  resolvePreviewTermFacetState,
  PreviewFacetCountSpan,
} from "../../../PreviewComponents/postPreview/previewFacetCounts";
import { isFacetTermUnavailable } from "../../../utils/facetTermAvailability";

import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";


const RatingStars = ({ value, className = "" }) => {
  const count = Math.max(0, Math.min(10, Number(value) || 0));
  return (
    <span className={`caf-rating-stars ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <i key={index} className="fas fa-star caf-rating-star filter-before-icon" />
      ))}
    </span>
  );
};

const PickerStar = () => (
  <span className="caf-rating-stars caf-rating-picker-star-wrap" aria-hidden="true">
    <i className="fas fa-star caf-rating-star filter-before-icon" />
  </span>
);

const WooFilterOutput = ({
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  setIndexes,
  indexes,
  selectType,
  mainBuilderData,
  setFilterModuleDomLoad = () => {},
}) => {
  const moduleKey = module?.key || "";
  const moduleRootRef = useRef(null);
  const [selectedValues, setSelectedValues] = useState(() => {
    const defaultValue = getRatingDefaultValue(settings);
    return defaultValue ? [defaultValue] : [];
  });
  const [enableToggle, setEnableToggle] = useState(settings?.enable_toggle);
  const [closeToggle, setCloseToggle] = useState(settings?.close_toggle ?? "false");
  const [pickerHoverValue, setPickerHoverValue] = useState(0);
  const { dynamicTermCountsEnabled, facetCounts } = usePreviewFacetCounts();

  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    mainBuilderData
  );
  const dndColDataData = [
    ...(previewTemplateData?.misc_preview_data?.dnd_column_data || []),
  ];
  const selectedTagData = dndColDataData
    .flatMap((col) => col.data || [])
    .find((item) => item.key === "selected");

  const AddSelectedTags = () => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    // Defer so React can commit caf-selected classes before DOM collection.
    window.setTimeout(() => {
      syncPreviewSelectedTags(scopeDocument, selectedTagData);
    }, 0);
  };

  useEffect(() => {
    if (settings?.enable_toggle) {
      setEnableToggle(settings.enable_toggle);
    }
    if (settings?.close_toggle) {
      setCloseToggle(settings.close_toggle);
    }
  }, [settings?.enable_toggle, settings?.close_toggle]);

  useEffect(() => {
    if (selectType !== "post-preview") {
      return;
    }
    setFilterModuleDomLoad(true);
  }, [
    selectType,
    setFilterModuleDomLoad,
    settings?.star_count,
    settings?.woo_options,
    settings?.rating_display,
  ]);

  useEffect(() => {
    const defaultValue = getRatingDefaultValue(settings);
    setSelectedValues(defaultValue ? [defaultValue] : []);
  }, [settings?.default_value, settings?.star_count, settings?.rating_display]);

  useEffect(() => {
    AddSelectedTags();
  }, [
    selectedValues,
    selectedTagData?.settings?.is_enable,
    selectedTagData?.settings?.close_button,
  ]);

  useEffect(() => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    const handlePreviewResetRating = (event) => {
      if (
        !previewFilterResetMatchesModule(
          event?.detail,
          rowindex,
          columnindex,
          moduleindex
        )
      ) {
        return;
      }
      setSelectedValues([]);
      setPickerHoverValue(0);
    };

    const handleSmartApplyRating = (event) => {
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
      const ratingValue = String(event?.detail?.ratingValue || "").trim();
      if (!ratingValue || ratingValue === "0") {
        setSelectedValues([]);
        setPickerHoverValue(0);
        return;
      }
      setSelectedValues([ratingValue]);
      setPickerHoverValue(0);
      if (event?.detail?.compare && moduleRootRef.current) {
        const listEl = moduleRootRef.current.querySelector(
          '.caf-terms-list[data-source="woo_rating"]'
        );
        if (listEl) {
          listEl.setAttribute("meta-operator", String(event.detail.compare));
        }
      }
    };

    scopeDocument.addEventListener(
      "caf-preview-reset-woo-rating",
      handlePreviewResetRating
    );
    scopeDocument.addEventListener(
      "caf-preview-smart-apply-woo-rating",
      handleSmartApplyRating
    );
    return () => {
      scopeDocument.removeEventListener(
        "caf-preview-reset-woo-rating",
        handlePreviewResetRating
      );
      scopeDocument.removeEventListener(
        "caf-preview-smart-apply-woo-rating",
        handleSmartApplyRating
      );
    };
  }, [rowindex, columnindex, moduleindex]);

  const isStarPicker = isRatingDisplayPicker(settings);
  const options = useMemo(
    () => getEnabledWooRatingOptions(settings),
    [settings?.star_count, settings?.woo_options, settings?.rating_display]
  );
  const renderOptions = options;

  const dataSource = WOO_FILTER_DATA_SOURCES[moduleKey] || "woo_meta";
  const meta = WOO_FILTER_META[moduleKey] || {
    key: "",
    compare: "=",
    type: "CHAR",
  };
  const ratingCompare = getRatingCompare(settings) || meta.compare;
  const listClass = getWooRatingListClass(settings);

  const toggleValue = (value) => {
    setSelectedValues((prev) => {
      const exists = prev.includes(value);
      if (isStarPicker || settings?.multiple_term === "false") {
        return exists ? [] : [value];
      }
      return exists ? prev.filter((item) => item !== value) : [...prev, value];
    });
  };

  const handleToggle = () => {
    if (enableToggle === "true") {
      setCloseToggle((prev) => (prev === "false" ? "true" : "false"));
    }
  };

  if (!isWooFilterModuleKey(moduleKey)) {
    return null;
  }

  const labelIcons = settings?.label?.icons;
  const customClass = settings?.custom_class || "";
  const visibility = settings?.visibility || {};
  const hideClass = visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  const isModuleActive =
    indexes?.type === "module" &&
    indexes?.rowindex === rowindex &&
    indexes?.columnindex === columnindex &&
    indexes?.moduleindex === moduleindex;
  const labelText = settings?.label?.value ? settings.label.value : "Rating";

  return (
    <div
      ref={moduleRootRef}
      onClick={() =>
        setIndexes &&
        setIndexes({
          type: "module",
          rowindex,
          columnindex,
          moduleindex,
          module,
        })
      }
      className={`caf-builder-module-main caf-module-filter caf_module_${moduleKey} caf-module-${moduleindex} caf-module-type-${moduleKey} ${customClass} ${
        isModuleActive ? "active" : ""
      } ${hideClass}`}
      style={{ position: "relative" }}
    >
      {settings?.label?.is_label === "true" && (
        <div
          className="caf-filter-label-common label-header"
          onClick={handleToggle}
        >
          {enableToggle === "true" && settings?.toggle_position === "left" && (
            <div className="caf-builder-filter-toggle-icon">
              <span className="label-icon-common">
                <i
                  className={`fas ${
                    closeToggle === "false" ? "fa-chevron-up" : "fa-chevron-down"
                  }`}
                />
              </span>
            </div>
          )}
          <div className="caf-builder-filter-label-wrapper">
            {labelIcons && labelIcons?.icon !== "" ? (
              <>
                {labelIcons?.type === "icon" && (
                  <>
                    {labelIcons.position === "before-label" &&
                      labelIcons.visibility === true && (
                        <i
                          className={`caf-builder-before-label before-common ${labelIcons.icon}`}
                        />
                      )}
                    <span className="caf-builder-filter-label">{labelText}</span>
                    {labelIcons.position === "after-label" &&
                      labelIcons.visibility === true && (
                        <i
                          className={`caf-builder-after-label after-common ${labelIcons.icon}`}
                        />
                      )}
                  </>
                )}
                {labelIcons?.type === "svg" && (
                  <>
                    {labelIcons.position === "before-label" &&
                      labelIcons.visibility === true && (
                        <InlineSVG
                          src={labelIcons?.icon?.url}
                          className="caf-inline-svg-icon caf-builder-before-label before-common"
                        />
                      )}
                    <span className="caf-builder-filter-label">{labelText}</span>
                    {labelIcons.position === "after-label" &&
                      labelIcons.visibility === true && (
                        <InlineSVG
                          src={labelIcons?.icon?.url}
                          className="caf-inline-svg-icon caf-builder-after-label after-common"
                        />
                      )}
                  </>
                )}
              </>
            ) : (
              <span className="caf-builder-filter-label">{labelText}</span>
            )}
          </div>
          {enableToggle === "true" && settings?.toggle_position === "right" && (
            <div className="caf-builder-filter-toggle-icon">
              <span className="label-icon-common">
                <i
                  className={`fas ${
                    closeToggle === "false" ? "fa-chevron-up" : "fa-chevron-down"
                  }`}
                />
              </span>
            </div>
          )}
        </div>
      )}

      {closeToggle === "false" && (
        <ul
          className={`caf-terms-list ${listClass}`}
          data-source={dataSource}
          filter-type={WOO_RATING_FILTER_TYPE}
          multiple-term={isStarPicker ? "false" : settings?.multiple_term ?? "false"}
          data-key={meta.key}
          meta-operator={ratingCompare}
          meta-type={meta.type}
          row-id={String(rowindex)}
          column-id={String(columnindex)}
          module-id={String(moduleindex)}
          category-relation="OR"
          data-rating-display={isStarPicker ? "star_picker" : "stars"}
        >
          {renderOptions.map((option) => {
            const value = String(option?.value || "");
            const label = String(option?.label || value);
            const isSelected = selectedValues.includes(value);
            const selectedRating = selectedValues.length
              ? Math.max(...selectedValues.map((v) => Number(v) || 0))
              : 0;
            const isFilled =
              isStarPicker && selectedRating > 0 && Number(value) <= selectedRating;
            const isHoverFilled =
              isStarPicker &&
              pickerHoverValue > 0 &&
              Number(value) <= pickerHoverValue;
            const { count: displayCount, unavailable, pending: countPending } = resolvePreviewTermFacetState({
              dynamicTermCountsEnabled,
              facetCounts,
              countKey: buildPreviewFacetCountKey({
                dataSource,
                metaKey: meta.key,
                termId: value,
              }),
              staticCount: option?.count,
              isSelected,
            });
            return (
              <li
                key={value}
                className={`caf-terms-list-item ${WOO_RATING_ITEM_CLASS} caf-layout-row${
                  isSelected ? " active caf-selected" : ""
                }${isFilled ? " caf-rating-filled" : ""}${
                  isHoverFilled ? " caf-rating-hover-fill" : ""
                }${
                  isStarPicker ? " caf-rating-picker-item" : ""
                }${unavailable ? " caf-facet-term-unavailable" : ""}`}
                data-key={meta.key}
                term-id={value}
                term-value={value}
                title={label}
                aria-disabled={unavailable ? "true" : undefined}
                onClick={(event) => {
                  if (
                    unavailable ||
                    isFacetTermUnavailable(event.currentTarget)
                  ) {
                    return;
                  }
                  toggleValue(value);
                }}
                onMouseEnter={() => {
                  if (isStarPicker) {
                    setPickerHoverValue(Number(value) || 0);
                  }
                }}
                onMouseLeave={() => {
                  if (isStarPicker) {
                    setPickerHoverValue(0);
                  }
                }}
              >
                <input
                  type="checkbox"
                  className={WOO_RATING_INPUT_CLASS}
                  value={value}
                  checked={isSelected}
                  readOnly
                  disabled={unavailable}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <div className="manage-ic-lbl caf-layout-row">
                  {isStarPicker ? (
                    <>
                      <PickerStar />
                      <div className="manage-text-lbl caf-layout-row caf-rating-text-fallback">
                        <span className="trm-name caf-term-label screen-reader-text">
                          {label}
                        </span>
                        <PreviewFacetCountSpan
                          settings={settings}
                          count={displayCount}
                          pending={countPending}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <RatingStars value={value} />
                      <div className="manage-text-lbl caf-layout-row caf-rating-text-fallback">
                        <span className="trm-name caf-term-label screen-reader-text">
                          {label}
                        </span>
                        <PreviewFacetCountSpan
                          settings={settings}
                          count={displayCount}
                          pending={countPending}
                        />
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <style>
        {`
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} {
            ${generateFilterCSS("container", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover {
            ${generateFilterCSS("container", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating {
            ${generateFilterCSS("meta", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating:hover {
            ${generateFilterCSS("meta", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li {
            ${generateFilterCSS("meta1", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li:hover {
            ${generateFilterCSS("meta1", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.caf-selected {
            ${generateFilterCSS("meta1", "selected", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .manage-ic-lbl,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .caf-rating-stars {
            ${generateFilterCSS("meta2", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .manage-ic-lbl:hover,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .caf-rating-stars:hover {
            ${generateFilterCSS("meta2", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.caf-selected .manage-ic-lbl,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.caf-selected .caf-rating-stars,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.active .manage-ic-lbl,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.active .caf-rating-stars,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating--picker li.caf-rating-filled .manage-ic-lbl,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating--picker li.caf-rating-filled .caf-rating-stars {
            ${generateFilterCSS("meta2", "selected", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .caf-rating-stars i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .manage-ic-lbl i {
            ${generateFilterCSS("icon", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .caf-rating-stars i:hover,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li .manage-ic-lbl i:hover,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li:hover .caf-rating-stars i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li:hover .manage-ic-lbl i {
            ${generateFilterCSS("icon", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating--picker li.caf-rating-hover-fill .caf-rating-stars i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating--picker li.caf-rating-hover-fill .manage-ic-lbl i {
            ${generateFilterCSS("icon", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.caf-selected .caf-rating-stars i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.caf-selected .manage-ic-lbl i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.active .caf-rating-stars i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating li.active .manage-ic-lbl i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating--picker li.caf-rating-filled .caf-rating-stars i,
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} ul.caf-woo-rating--picker li.caf-rating-filled .manage-ic-lbl i {
            ${generateFilterCSS("icon", "selected", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header {
            ${generateFilterLabelCSS("header", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header:hover {
            ${generateFilterLabelCSS("header", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper {
            ${generateFilterLabelInnerCSS("header", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper:hover {
            ${generateFilterLabelInnerCSS("header", "hover", selectedDevice, styleDefault)}
          }
        `}
      </style>
    </div>
  );
};

export default WooFilterOutput;
