import {
  getSearchModuleSettingsFromOutput,
  getSearchKeywordForSelectedTags,
} from "./previewSearchUtils";
import { getPreviewSmartMatchedTermsCount } from "./previewSmartFilterSearch";

/** Strip prefix/suffix for numeric comparison on range slider display values. */
export const parseSliderDisplayNumber = (value) =>
  String(value || "").replace(/[^\d.]/g, "");

/**
 * True when Default Values is on and start_min/start_max form a real filter (not full span).
 */
export const computeHasValidRangeSliderCustomDefaults = ({
  defaultsEnabled,
  isSingle,
  safeMin,
  safeMax,
  startMinSafe,
  startMaxSafe,
}) => {
  if (!defaultsEnabled) {
    return false;
  }
  if (isSingle) {
    return (
      Number.isFinite(startMaxSafe) &&
      startMaxSafe >= safeMin &&
      startMaxSafe <= safeMax
    );
  }
  if (
    !Number.isFinite(startMinSafe) ||
    !Number.isFinite(startMaxSafe) ||
    startMinSafe < safeMin ||
    startMaxSafe > safeMax ||
    startMinSafe > startMaxSafe
  ) {
    return false;
  }
  return startMinSafe > safeMin || startMaxSafe < safeMax;
};

/**
 * Whether a range slider should appear in layout-preview selected tags.
 *
 * Default Values off: no tag until the user moves away from the inactive default position.
 * Default Values on + valid configured range: tag on load (active default filter).
 *
 * Prefer live data-current-min/max on .caf-range-slider-ui (updated synchronously on reset)
 * over slider-value (React may lag behind after reset).
 */
export const shouldIncludeRangeSliderSelectedTag = (sliderValuesEl) => {
  if (!sliderValuesEl) {
    return false;
  }
  const sliderValue = sliderValuesEl.getAttribute("slider-value") || "";
  const sType = sliderValuesEl.getAttribute("slider-type");
  const sMin = sliderValuesEl.getAttribute("slider-min");
  const sMax = sliderValuesEl.getAttribute("slider-max");
  const defaultsEnabled =
    sliderValuesEl.getAttribute("slider-default-values-enabled") === "true";
  const hasValidDefaults =
    sliderValuesEl.getAttribute("slider-has-valid-defaults") === "true";
  const sliderUi = sliderValuesEl
    .closest(".caf-range-slider-output")
    ?.querySelector(".caf-range-slider-ui");

  if (sliderUi) {
    const dataMin = sliderUi.getAttribute("data-min") ?? sMin;
    const dataMax = sliderUi.getAttribute("data-max") ?? sMax;
    const curMin = sliderUi.getAttribute("data-current-min");
    const curMax = sliderUi.getAttribute("data-current-max");

    if (sType === "1") {
      if (defaultsEnabled && hasValidDefaults) {
        return curMax !== "" && curMax !== String(dataMax);
      }
      const startMax = sliderUi.getAttribute("data-start-max") ?? dataMax;
      return curMax !== "" && curMax !== String(startMax);
    }

    if (sType === "2") {
      if (curMin === String(dataMin) && curMax === String(dataMax)) {
        return false;
      }
      return curMin !== "" && curMax !== "";
    }
  }

  if (sType === "1") {
    const value = parseSliderDisplayNumber(sliderValue);
    if (defaultsEnabled && hasValidDefaults) {
      return value !== "" && value !== String(sMax);
    }
    const defaultAttr = sliderValuesEl.getAttribute("slider-default-value");
    const defaultNum = defaultAttr
      ? parseSliderDisplayNumber(defaultAttr)
      : String(sMax);
    return value !== "" && value !== defaultNum;
  }

  if (sType === "2") {
    const parts = sliderValue.split("-").map((val) => parseSliderDisplayNumber(val));
    const minPart = parts[0] ?? "";
    const maxPart = parts[1] ?? "";
    if (minPart === String(sMin) && maxPart === String(sMax)) {
      return false;
    }
    return Boolean(sliderValue);
  }

  return Boolean(sliderValue);
};

export const RANGE_SLIDER_TAG_SOURCE = "range_slider";
export const CHECKBOX_TAG_SOURCE = "checkbox_filter";
export const DROPDOWN_TAG_SOURCE = "dropdown_filter";
export const SEARCH_TAG_SOURCE = "search";
/** Matches live frontend `data_source: "woo_rating"`. */
export const WOO_RATING_TAG_SOURCE = "woo_rating";

const escapeTagAttr = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

/** Find an index class (e.g. caf-row-2) on element or ancestors. */
const findIndexFromSelfOrAncestors = (startEl, classPrefix) => {
  let node = startEl;
  while (node) {
    const cls = String(node.className || "");
    const match = cls.match(new RegExp(`\\b${classPrefix}-(\\d+)\\b`));
    if (match) {
      return match[1];
    }
    node = node.parentElement;
  }
  return "";
};

/** Extract row/column/module index from module root + its layout ancestors. */
const extractModuleIds = (moduleRootEl) => {
  if (!moduleRootEl) {
    return { rowId: "", columnId: "", moduleId: "" };
  }
  const readDataAttr = (name, classPrefix) =>
    moduleRootEl.getAttribute(name) ||
    findIndexFromSelfOrAncestors(moduleRootEl, classPrefix);

  return {
    moduleId: readDataAttr("data-preview-module", "caf-module"),
    rowId: readDataAttr("data-preview-row", "caf-row"),
    columnId: readDataAttr("data-preview-column", "caf-column"),
  };
};

const pushCheckboxTagEntry = (entries, seen, listItem, moduleRoot) => {
  if (!listItem) {
    return;
  }
  const labelText =
    listItem.querySelector(".trm-name")?.textContent?.trim() ||
    String(listItem.textContent || "").trim();
  if (!labelText) {
    return;
  }
  const resolvedModuleRoot =
    moduleRoot || listItem.closest(".caf_module_checkbox_filter");
  const { rowId, columnId, moduleId } = extractModuleIds(resolvedModuleRoot);
  const dedupeKey = `${rowId}-${columnId}-${moduleId}-${labelText}`;
  if (seen.has(dedupeKey)) {
    return;
  }
  seen.add(dedupeKey);
  entries.push({
    type: CHECKBOX_TAG_SOURCE,
    label: labelText,
    rowId,
    columnId,
    moduleId,
  });
};

/** Collect checked checkbox tags across all checkbox modules. */
export const collectCheckboxTagEntries = (scopeDocument) => {
  const entries = [];
  const seen = new Set();

  scopeDocument
    .querySelectorAll(
      ".caf-bl-filter .caf_module_checkbox_filter .caf-terms-list-item.caf-selected"
    )
    .forEach((listItem) => {
      pushCheckboxTagEntry(
        entries,
        seen,
        listItem,
        listItem.closest(".caf_module_checkbox_filter")
      );
    });

  scopeDocument
    .querySelectorAll(".caf-bl-filter .caf-terms-list .caf-taxo-input:checked")
    .forEach((checkbox) => {
      const listItem = checkbox.closest(".caf-terms-list-item");
      if (listItem?.classList?.contains("caf-selected")) {
        return;
      }
      pushCheckboxTagEntry(
        entries,
        seen,
        listItem || checkbox.parentNode,
        checkbox.closest(".caf_module_checkbox_filter")
      );
    });

  return entries;
};

const readDropdownTermLabel = (rootEl) => {
  if (!rootEl) {
    return "";
  }
  return (
    rootEl.querySelector(".trm-name")?.textContent?.trim() ||
    rootEl.querySelector(".cf-value-name")?.textContent?.trim() ||
    ""
  );
};

/** Collect active dropdown tags across all dropdown modules (one tag per module). */
export const collectDropdownTagEntries = (scopeDocument) => {
  const entries = [];
  const seenModules = new Set();

  scopeDocument
    .querySelectorAll(".caf-bl-filter .caf_module_dropdown_filter")
    .forEach((moduleRoot) => {
      const { rowId, columnId, moduleId } = extractModuleIds(moduleRoot);
      const moduleKey = `${rowId}-${columnId}-${moduleId}`;
      if (seenModules.has(moduleKey)) {
        return;
      }

      const activeTermKey = moduleRoot.getAttribute("data-active-term-key");
      if (activeTermKey === "0") {
        return;
      }

      const selectedMain = moduleRoot.querySelector(".caf-selected-term-main");
      if (!selectedMain || selectedMain.classList.contains("caf-all-selected")) {
        return;
      }

      const resultEl = selectedMain.querySelector(".result");
      let labelText = readDropdownTermLabel(resultEl);

      if (!labelText) {
        const activeListItem = moduleRoot.querySelector(
          ".caf-dropdown-child .caf-terms-list-item.caf-selected.active"
        );
        const termId = activeListItem?.getAttribute("term-id");
        if (!termId || termId === "0") {
          return;
        }
        labelText = readDropdownTermLabel(activeListItem);
      }

      if (!labelText) {
        return;
      }

      seenModules.add(moduleKey);
      entries.push({
        type: DROPDOWN_TAG_SOURCE,
        label: labelText,
        rowId,
        columnId,
        moduleId,
      });
    });

  return entries;
};

/**
 * Collect selected Star Rating filter tags (preview only).
 * Mirrors live frontend: each `.caf-selected` rating item becomes a tag.
 */
export const collectWooRatingTagEntries = (scopeDocument) => {
  const entries = [];
  const seen = new Set();

  scopeDocument
    .querySelectorAll(
      '.caf-bl-filter .caf-terms-list[data-source="woo_rating"] .caf-terms-list-item.caf-selected'
    )
    .forEach((listItem) => {
      const listEl = listItem.closest(".caf-terms-list");
      const value = String(
        listItem.getAttribute("term-value") ||
          listItem.getAttribute("term-id") ||
          listItem.querySelector(".caf-rating-input")?.value ||
          ""
      ).trim();
      if (!value || value === "0" || value === "all") {
        return;
      }

      const labelText =
        listItem.querySelector(".trm-name, .caf-term-label")?.textContent?.trim() ||
        String(listItem.getAttribute("title") || "").trim() ||
        value;
      if (!labelText) {
        return;
      }

      const moduleRoot =
        listItem.closest(".caf_module_woo_rating_filter") ||
        listItem.closest(".caf-module-filter");
      const fromAncestors = extractModuleIds(moduleRoot);
      const rowId =
        String(listEl?.getAttribute("row-id") || "").trim() || fromAncestors.rowId;
      const columnId =
        String(listEl?.getAttribute("column-id") || "").trim() ||
        fromAncestors.columnId;
      const moduleId =
        String(listEl?.getAttribute("module-id") || "").trim() ||
        fromAncestors.moduleId;

      const dedupeKey = `${rowId}-${columnId}-${moduleId}-${value}`;
      if (seen.has(dedupeKey)) {
        return;
      }
      seen.add(dedupeKey);
      entries.push({
        type: WOO_RATING_TAG_SOURCE,
        label: labelText,
        value,
        rowId,
        columnId,
        moduleId,
      });
    });

  return entries;
};

export const isTagEntry = (item) =>
  Boolean(item && typeof item === "object" && item.type);

/** @returns {Array<{ type: string, label: string, value: string, rowId: string, columnId: string, moduleId: string }>} */
export const collectRangeSliderTagEntries = (scopeDocument) => {
  const entries = [];
  scopeDocument
    .querySelectorAll(".caf-bl-filter .caf_module_range_slider .caf-range-slider-values")
    .forEach((slider) => {
      const sliderValue = slider.getAttribute("slider-value") || "";
      if (!shouldIncludeRangeSliderSelectedTag(slider)) {
        return;
      }
      const moduleRoot = slider.closest(".caf_module_range_slider");
      const moduleLabel =
        moduleRoot
          ?.querySelector(
            ".caf-filter-label-common .caf-builder-filter-label, .caf-filter-label-common .caf-builder-custom-field-label-inner"
          )
          ?.textContent?.trim() || "";
      const displayLabel = `${moduleLabel || "Range Slider"}: ${sliderValue}`;
      entries.push({
        type: RANGE_SLIDER_TAG_SOURCE,
        label: displayLabel,
        value: sliderValue,
        rowId: slider.getAttribute("slider-row-id") ?? "",
        columnId: slider.getAttribute("slider-column-id") ?? "",
        moduleId: slider.getAttribute("slider-module-id") ?? "",
      });
    });
  return entries;
};

export const appendRangeSliderTags = (selectedTagsArr, scopeDocument) => {
  collectRangeSliderTagEntries(scopeDocument).forEach((entry) => {
    selectedTagsArr.push(entry);
  });
};

/** Collect search tags (matches live frontend: "Search: keyword"). */
export const collectSearchTagEntries = (scopeDocument) => {
  const entries = [];
  const smartMatchCount = getPreviewSmartMatchedTermsCount(scopeDocument);
  const seen = new Set();

  scopeDocument
    .querySelectorAll(
      ".caf-bl-filter .caf-module-type-search, .caf-bl-filter .caf_module_search"
    )
    .forEach((moduleRoot) => {
      const moduleOutput = moduleRoot.querySelector(".caf-filter-module-search-output");
      if (!moduleOutput) {
        return;
      }
      const settings = getSearchModuleSettingsFromOutput(moduleOutput);
      if (settings.smartEnabled && smartMatchCount > 0) {
        return;
      }
      const keyword = getSearchKeywordForSelectedTags(moduleOutput);
      if (!keyword) {
        return;
      }
      const { rowId, columnId, moduleId } = extractModuleIds(moduleRoot);
      const dedupeKey = `${rowId}-${columnId}-${moduleId}-${keyword}`;
      if (seen.has(dedupeKey)) {
        return;
      }
      seen.add(dedupeKey);
      entries.push({
        type: SEARCH_TAG_SOURCE,
        label: `Search: ${keyword}`,
        value: keyword,
        rowId,
        columnId,
        moduleId,
      });
    });

  return entries;
};

/** Clear all layout-preview selected tag lists (preserves inline style blocks). */
export const clearPreviewSelectedTags = (scopeDocument) => {
  scopeDocument
    .querySelectorAll(".caf-builder-template-preview-selected-tags-container")
    .forEach((container) => {
      const styleTag = container.querySelector("style");
      container.innerHTML = "";
      if (styleTag) {
        container.append(styleTag);
      }
    });
};

/** Rebuild layout-preview selected tags from current filter DOM state. */
export const syncPreviewSelectedTags = (scopeDocument, selectedTagData) => {
  if (selectedTagData?.settings?.is_enable !== "true") {
    return;
  }

  const tagContainers = scopeDocument.querySelectorAll(
    ".caf-builder-template-preview-selected-tags-container"
  );
  if (!tagContainers.length) {
    return;
  }

  const selectedTagsArr = [];
  collectCheckboxTagEntries(scopeDocument).forEach((entry) => {
    selectedTagsArr.push(entry);
  });
  collectDropdownTagEntries(scopeDocument).forEach((entry) => {
    selectedTagsArr.push(entry);
  });
  collectWooRatingTagEntries(scopeDocument).forEach((entry) => {
    selectedTagsArr.push(entry);
  });
  collectSearchTagEntries(scopeDocument).forEach((entry) => {
    selectedTagsArr.push(entry);
  });
  appendRangeSliderTags(selectedTagsArr, scopeDocument);

  const htmlData = renderPreviewSelectedTagsHtml(
    selectedTagsArr,
    selectedTagData?.settings?.close_button === "true"
  );
  tagContainers.forEach((elementExists) => {
    const styleTag = elementExists.querySelector("style");
    elementExists.innerHTML = htmlData;
    if (styleTag) {
      elementExists.append(styleTag);
    }
  });
};

export const isRangeSliderTagEntry = (item) =>
  Boolean(item && typeof item === "object" && item.type === RANGE_SLIDER_TAG_SOURCE);

export const renderPreviewSelectedTagsHtml = (selectedTagsArr, showCloseButton) => {
  if (!Array.isArray(selectedTagsArr) || selectedTagsArr.length === 0) {
    return "";
  }
  const closeBtn = showCloseButton
    ? '<span class="caf-builder-template-preview-selected-tag-close-btn">' +
      '<i class="fa fa-times" aria-hidden="true"></i></span>'
    : "";

  return selectedTagsArr
    .map((item) => {
      if (isTagEntry(item)) {
        const tagValue = item.value ?? item.label;
        return (
          '<li class="caf-builder-template-preview-selected-tag-single-item"' +
          ` data-source="${escapeTagAttr(item.type)}"` +
          ` data-row-id="${escapeTagAttr(item.rowId)}"` +
          ` data-column-id="${escapeTagAttr(item.columnId)}"` +
          ` data-module-id="${escapeTagAttr(item.moduleId)}"` +
          ` data-value="${escapeTagAttr(tagValue)}">` +
          closeBtn +
          '<span class="caf-builder-template-preview-selected-tag-term-name">' +
          item.label +
          "</span></li>"
        );
      }
      return (
        '<li class="caf-builder-template-preview-selected-tag-single-item">' +
        closeBtn +
        '<span class="caf-builder-template-preview-selected-tag-term-name">' +
        item +
        "</span></li>"
      );
    })
    .join("");
};

/** True when a targeted reset event applies to this module instance. */
export const previewRangeSliderResetMatchesModule = (detail, rowindex, columnindex, moduleindex) => {
  const hasRow = Object.prototype.hasOwnProperty.call(detail || {}, "rowindex");
  const hasCol = Object.prototype.hasOwnProperty.call(detail || {}, "columnindex");
  const hasMod = Object.prototype.hasOwnProperty.call(detail || {}, "moduleindex");
  if (!hasRow && !hasCol && !hasMod) {
    return true;
  }
  return (
    String(detail.rowindex) === String(rowindex) &&
    String(detail.columnindex) === String(columnindex) &&
    String(detail.moduleindex) === String(moduleindex)
  );
};
