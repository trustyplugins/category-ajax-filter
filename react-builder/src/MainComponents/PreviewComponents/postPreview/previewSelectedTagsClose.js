import {
  syncPreviewSelectedTags,
  clearPreviewSelectedTags,
  WOO_RATING_TAG_SOURCE,
  resolveListItemTermLabel,
} from "./previewRangeSliderTagUtils";

const normalizeText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** Sync dropdown DOM to "All" before React re-render so tag collection stays empty. */
export const markDropdownModulePreviewAll = (
  scopeDocument,
  rowId = "",
  columnId = "",
  moduleId = ""
) => {
  const selectors =
    rowId !== "" && columnId !== "" && moduleId !== ""
      ? [
          `.caf-bl-filter .caf-row-${rowId} .caf-column-${columnId} .caf-module-${moduleId}`,
        ]
      : [".caf-bl-filter .caf_module_dropdown_filter"];

  const seen = new Set();
  selectors.forEach((selector) => {
    scopeDocument.querySelectorAll(selector).forEach((moduleRoot) => {
      if (seen.has(moduleRoot)) {
        return;
      }
      seen.add(moduleRoot);
      moduleRoot.setAttribute("data-active-term-key", "0");
      const selectedMain = moduleRoot.querySelector(".caf-selected-term-main");
      if (selectedMain) {
        selectedMain.classList.add("caf-all-selected");
      }
      moduleRoot
        .querySelectorAll(
          ".caf-dropdown-child .caf-terms-list-item.caf-selected, .caf-dropdown-child .caf-terms-list-item.active"
        )
        .forEach((li) => {
          li.classList.remove("caf-selected", "active");
        });
      const allOption = moduleRoot.querySelector(
        ".caf-dropdown-child .caf-dropdown-all-option, .caf-dropdown-child .caf-terms-list-item[term-id='0'], .caf-dropdown-child .caf-terms-list-item[term-id='all']"
      );
      if (allOption) {
        allOption.classList.add("active");
      }
    });
  });
};

export const previewFilterResetMatchesModule = (
  detail,
  rowindex,
  columnindex,
  moduleindex
) => {
  const hasRow =
    detail?.rowindex !== undefined && String(detail.rowindex) !== "";
  const hasCol =
    detail?.columnindex !== undefined && String(detail.columnindex) !== "";
  const hasMod =
    detail?.moduleindex !== undefined && String(detail.moduleindex) !== "";

  if (!hasRow && !hasCol && !hasMod) {
    return true;
  }
  if (hasRow && String(detail.rowindex) !== String(rowindex)) {
    return false;
  }
  if (hasCol && String(detail.columnindex) !== String(columnindex)) {
    return false;
  }
  if (hasMod && String(detail.moduleindex) !== String(moduleindex)) {
    return false;
  }
  return true;
};

export const previewDropdownResetMatchesModule = previewFilterResetMatchesModule;

/**
 * Document-level handler for layout-preview selected tag close buttons.
 */
export const handlePreviewSelectedTagClose = (event, scopeDocument, selectedTagData) => {
  const closeBtn = event.target?.closest(
    ".caf-builder-template-preview-selected-tag-close-btn"
  );
  if (!closeBtn) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();

  const tagItem = closeBtn.closest(
    ".caf-builder-template-preview-selected-tag-single-item"
  );
  if (!tagItem) {
    return true;
  }

  const tagSource = tagItem.getAttribute("data-source") || "";
  const tagRowId = tagItem.getAttribute("data-row-id") || "";
  const tagColumnId = tagItem.getAttribute("data-column-id") || "";
  const tagModuleId = tagItem.getAttribute("data-module-id") || "";
  const tagValue = tagItem.getAttribute("data-value") || "";

  if (tagSource === "range_slider") {
    scopeDocument.dispatchEvent(
      new CustomEvent("caf-preview-reset-range-slider", {
        detail: {
          rowindex: tagRowId,
          columnindex: tagColumnId,
          moduleindex: tagModuleId,
          neutral: true,
        },
      })
    );
    scopeDocument.dispatchEvent(new CustomEvent("caf-preview-filter-refresh"));
    window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 50);
    return true;
  }

  if (tagSource === "search") {
    scopeDocument.dispatchEvent(new CustomEvent("caf-preview-reset-search"));
    window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 50);
    return true;
  }

  if (tagSource === "checkbox_filter") {
    const moduleSelector =
      tagRowId && tagColumnId && tagModuleId
        ? `.caf-bl-filter .caf-row-${tagRowId} .caf-column-${tagColumnId} .caf-module-${tagModuleId}`
        : ".caf-bl-filter .caf_module_checkbox_filter";
    const moduleRoot = scopeDocument.querySelector(moduleSelector);
    if (moduleRoot) {
      const tagTermId = String(tagItem.getAttribute("data-value") || "").trim();
      const selectedTerm = Array.from(
        moduleRoot.querySelectorAll(".caf-terms-list-item.caf-selected")
      ).find((item) => {
        if (tagTermId && /^\d+$/.test(tagTermId)) {
          return (
            String(item.getAttribute("term-id") || item.getAttribute("term-value") || "") ===
            tagTermId
          );
        }
        return (
          normalizeText(resolveListItemTermLabel(item)) === normalizeText(tagValue)
        );
      });
      if (selectedTerm) {
        selectedTerm.click();
      }
    }
    window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 50);
    return true;
  }

  if (tagSource === WOO_RATING_TAG_SOURCE) {
    const moduleSelector =
      tagRowId && tagColumnId && tagModuleId
        ? `.caf-bl-filter .caf-row-${tagRowId} .caf-column-${tagColumnId} .caf-module-${tagModuleId}`
        : '.caf-bl-filter .caf_module_woo_rating_filter, .caf-bl-filter .caf-terms-list[data-source="woo_rating"]';
    const moduleRoots = scopeDocument.querySelectorAll(moduleSelector);
    let matched = false;
    moduleRoots.forEach((moduleRoot) => {
      if (matched) {
        return;
      }
      const selectedTerm = Array.from(
        moduleRoot.querySelectorAll(
          '.caf-terms-list[data-source="woo_rating"] .caf-terms-list-item.caf-selected, .caf-terms-list-item.caf-selected'
        )
      ).find((item) => {
        const termValue = String(
          item.getAttribute("term-value") ||
            item.getAttribute("term-id") ||
            item.querySelector(".caf-rating-input")?.value ||
            ""
        ).trim();
        return termValue === String(tagValue).trim();
      });
      if (selectedTerm) {
        selectedTerm.click();
        matched = true;
      }
    });
    window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 50);
    return true;
  }

  if (tagSource === "dropdown_filter") {
    markDropdownModulePreviewAll(
      scopeDocument,
      tagRowId,
      tagColumnId,
      tagModuleId
    );
    tagItem.remove();
    scopeDocument.dispatchEvent(
      new CustomEvent("caf-preview-reset-dropdown", {
        detail: {
          rowindex: tagRowId,
          columnindex: tagColumnId,
          moduleindex: tagModuleId,
        },
      })
    );
    scopeDocument.dispatchEvent(new CustomEvent("caf-preview-filter-refresh"));
    window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 80);
    return true;
  }

  const tagText = normalizeText(
    tagItem.querySelector(".caf-builder-template-preview-selected-tag-term-name")
      ?.textContent || tagItem.textContent
  );
  if (!tagText) {
    return true;
  }

  const searchInputs = scopeDocument.querySelectorAll(
    ".caf-bl-filter .caf-module-search input.input-field, .caf-builder-template-preview-filter .caf-module-search input.input-field"
  );
  let matchedSearch = false;
  searchInputs.forEach((inputEl) => {
    const raw = normalizeText(inputEl?.value?.trim());
    if (
      raw === tagText ||
      normalizeText(`search: ${raw}`) === tagText
    ) {
      matchedSearch = true;
    }
  });

  if (matchedSearch) {
    scopeDocument.dispatchEvent(new CustomEvent("caf-preview-reset-search"));
    window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 50);
    return true;
  }

  const matchedRangeValues = Array.from(
    scopeDocument.querySelectorAll(
      ".caf-bl-filter .caf_module_range_slider .caf-range-slider-values, .caf-builder-template-preview-filter .caf_module_range_slider .caf-range-slider-values"
    )
  ).find((el) => {
    const sliderValue = normalizeText(el.getAttribute("slider-value"));
    const moduleRoot = el.closest(".caf_module_range_slider");
    const moduleLabel = normalizeText(
      moduleRoot?.querySelector(
        ".caf-filter-label-common .caf-builder-filter-label, .caf-filter-label-common .caf-builder-custom-field-label-inner"
      )?.textContent
    );
    const prefixedLabel = moduleLabel
      ? normalizeText(`${moduleLabel}: ${el.getAttribute("slider-value") || ""}`)
      : normalizeText(`range slider: ${el.getAttribute("slider-value") || ""}`);
    return sliderValue === tagText || prefixedLabel === tagText;
  });

  if (matchedRangeValues) {
    scopeDocument.dispatchEvent(
      new CustomEvent("caf-preview-reset-range-slider", {
        detail: {
          sliderValue: matchedRangeValues.getAttribute("slider-value") || "",
          neutral: true,
        },
      })
    );
    scopeDocument.dispatchEvent(new CustomEvent("caf-preview-filter-refresh"));
    window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 50);
    return true;
  }

  return true;
};

/** Reset all layout-preview filters and rebuild selected tags from cleared state. */
export const runPreviewFilterReset = (scopeDocument, selectedTagData) => {
  if (!scopeDocument) {
    return;
  }

  clearPreviewSelectedTags(scopeDocument);

  scopeDocument.dispatchEvent(
    new CustomEvent("caf-preview-reset-checkbox", { detail: {} })
  );

  markDropdownModulePreviewAll(scopeDocument);
  scopeDocument.dispatchEvent(
    new CustomEvent("caf-preview-reset-dropdown", { detail: {} })
  );

  scopeDocument
    .querySelectorAll(
      ".caf-bl-filter .caf-filter-module-search-output input.input-field, .caf-builder-template-preview-filter .caf-filter-module-search-output input.input-field"
    )
    .forEach((inputEl) => {
      if (inputEl.value === "") {
        return;
      }
      inputEl.value = "";
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    });
  scopeDocument.dispatchEvent(new CustomEvent("caf-preview-reset-search"));
  scopeDocument.dispatchEvent(
    new CustomEvent("caf-preview-reset-range-slider", { detail: { neutral: true } })
  );
  scopeDocument.dispatchEvent(
    new CustomEvent("caf-preview-reset-woo-rating", { detail: {} })
  );

  window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 120);
  window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedTagData), 320);
};
