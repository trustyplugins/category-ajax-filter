import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ModuleErrorBoundary from "../../../../components/ModuleErrorBoundary";
import { getModuleErrorBoundaryResetKey } from "../../../../utils/moduleErrorBoundaryUtils";
import ModuleTitle from "../../../PostComponents/components/modules-output/ModuleTitle";
import ModuleExcerpt from "../../../PostComponents/components/modules-output/ModuleExcerpt";
import ModuleImage from "../../../PostComponents/components/modules-output/ModuleImage";
import ModuleProductImage from "../../../PostComponents/components/modules-output/WooModules/ModuleProductImage";
import ModuleProductPrice from "../../../PostComponents/components/modules-output/WooModules/ModuleProductPrice";
import ModuleProductRating from "../../../PostComponents/components/modules-output/WooModules/ModuleProductRating";
import ModuleAddToCart from "../../../PostComponents/components/modules-output/WooModules/ModuleAddToCart";
import ModuleAttributeSwatch from "../../../PostComponents/components/modules-output/WooModules/ModuleAttributeSwatch";
import ModuleCategories from "../../../PostComponents/components/modules-output/ModuleCategories";
import ModuleAuthor from "../../../PostComponents/components/modules-output/ModuleAuthor";
import ModuleDate from "../../../PostComponents/components/modules-output/ModuleDate";
import ModuleCommentCount from "../../../PostComponents/components/modules-output/ModuleCommentCount";
import ModuleButton from "../../../PostComponents/components/modules-output/ModuleButton";
import ModuleBadges from "../../../PostComponents/components/modules-output/ModuleBadges";
import ModuleCustomField from "../../../PostComponents/components/modules-output/ModuleCustomField";
import ModuleCustomText from "../../../PostComponents/components/modules-output/ModuleCustomText";
import {generateGridLayoutCSS,generatePreviewSingleCSS} from "../../../utils/functions";
import {Skeleton,Select} from "antd";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import {
  resolveFilterTypeFromBuilderData,
  resolvePostExtraDataFromBuilderData,
  resolvePostTypeFromBuilderData,
  resolvePreviewTemplateDataFromBuilderData,
} from "../../../utils/builderDataAdapters";
import { resolvePaginationType } from "../shared/previewSettingsTier";
import {
  PREVIEW_FILTER_SEARCH_ROOT,
  commitSearchKeywordToDom,
  clearCommittedSearchKeywordOnDom,
  getRawSearchInput,
  getSearchModuleOutput,
  getSearchTrigger,
  isBlockedByMinCharLimit,
  resolvePreviewSearchQueryFromDom,
  shouldSubmitPreviewSearch,
  getSearchModuleSettingsFromOutput,
} from "../previewSearchUtils";
import {
  applyPreviewSmartFilterSearch,
  clearPreviewSmartSearchSelections,
  getPreviewSmartMatchedTermsCount,
} from "../previewSmartFilterSearch";
import { CAFSmartFilterSearch } from "../smartFilterSearchEngine";
import { runPreviewFilterReset } from "../previewSelectedTagsClose";
import {
  getPreviewSortSettingsSignature,
  resolvePreviewSortQueryArgs,
} from "../previewSortUtils";
import { isHiddenOnDevice } from "../../../utils/builderVisibility";
import { resolvePostModuleSettingsForOutput } from "../../../PostComponents/components/settingTabContent/ModuleContentData/shared/postModuleTier";
import {
  clearMasonryItemSpans,
  observeMasonryLayout,
  scheduleMasonryLayout,
} from "../../../utils/masonryLayout";
import { canUseFeature } from "../../../../tier/capabilities";
import { resolveMasonryEnabled } from "../shared/previewSettingsTier";
import {
  resolveFilterDataSource,
  resolveMetaRelation,
} from "../../../FilterComponents/components/settingTabContent/ModuleContentData/shared/filterModuleTier";
import {
  resolvePreviewWooAndRatingMetaFromDom,
  shouldSkipPreviewTaxonomyGroup,
} from "../previewFilterMetaQuery";
import { WooProductCardVariationProvider } from "../../../PostComponents/components/woocommerce/WooProductCardVariationContext";

const { Option } = Select;
const Grid = (props) => {
  const previewRootRef = useRef(null);
  const getScopeDocument = () =>
    previewRootRef.current?.ownerDocument || document;
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let miscPreviewData = {
    ...previewTemplateData.misc_preview_data,
  };
  
const pagination = miscPreviewData?.dnd_column_data
  ?.flatMap(col => col?.data || [])
  ?.find(item => item.key === "pagination") || {};
const paginationType = resolvePaginationType(
  pagination?.settings?.pagination_type
);


  const extraDataSaved =miscPreviewData.extra;
  const noResultsMessage = String(extraDataSaved?.noresult || "").trim() || "No Result.";
  const masonryEnabled = resolveMasonryEnabled(extraDataSaved?.masonary);
  const gridDefaultOrderBy = extraDataSaved?.orderby || "title";
  const gridDefaultOrderType = extraDataSaved?.order || "ASC";
  const previewSortArgs = resolvePreviewSortQueryArgs(
    props.orderBy,
    props.orderType,
    gridDefaultOrderBy,
    gridDefaultOrderType
  );
  let postPreviewData = {
    ...previewTemplateData.post_preview_data,
  };
  let selectedDevice = props.deviceType
  // const sorting =
  //   props.mainBuilderData.common_data.misc_setting_data.sorting_data;
  const extra_data = resolvePostExtraDataFromBuilderData(props.mainBuilderData);
  const initialdata = Array.isArray(
    props.mainBuilderData?.post_layout_data?.initial_data
  )
    ? props.mainBuilderData.post_layout_data.initial_data
    : [];
  const [suffix, setSuffix] = useState(extra_data?.slider_data?.suffix ?? "%");
  const [currentPage,setCurrentPage]=useState(props.currPage);
  const [postsList, setPostsList] = useState([]);
  const [previewWidth, setPreviewWidth] = useState(
    extra_data?.slider_data?.value ?? "25"
  );
  const[loading,setLoading]=useState(true);
  const fetchRequestIdRef = useRef(0);
  const fetchPreviewPostsRef = useRef(null);
  const filterDomRefetchedRef = useRef(false);
  const prevSettingsSignatureRef = useRef("");
  const hasLoadedPostsRef = useRef(false);
  const prevFetchedPageRef = useRef(null);
  const { setPage, setCountRes, updateCurrentPage, setCheckLoading } = props;

  useEffect(() => {
    setCheckLoading(false);
  }, [setCheckLoading]);

  const postType = resolvePostTypeFromBuilderData(props.mainBuilderData);
  const settingsSignature = [
    pagination?.settings?.is_enable,
    pagination?.settings?.posts_per_page,
    paginationType,
    getPreviewSortSettingsSignature(
      props.orderBy,
      props.orderType,
      gridDefaultOrderBy,
      gridDefaultOrderType
    ),
    postType,
  ].join("|");
  const filterDomReady = Boolean(
    props?.checkboxDomLoad || props?.dropdownDomLoad || props?.filterModuleDomLoad
  );

  let filterType = resolveFilterTypeFromBuilderData(props.mainBuilderData);
  let  filterQueryData = props.mainBuilderData.filter_layout_data.filter_query_data;

  let filterExtradata = props?.mainBuilderData?.filter_layout_data?.extra_data;
  let taxonomyRelation = filterExtradata?.taxonomy_relation;
  let metaRelation = resolveMetaRelation(filterExtradata?.meta_relation);

  useEffect(()=>{
    setCurrentPage(props.currPage)
  },[props.currPage])
  useEffect(() => {
    if (props.newSliderval?.suffix) {
      setSuffix(props.newSliderval?.suffix);
    }
    if (props.newSliderval?.value) {
      setPreviewWidth(props.newSliderval?.value);
    }
  }, [props.newSliderval]);

  useLayoutEffect(() => {
    let searchDebounceTimer = null;
    let lastActiveSearchKeyword = "";
    const scopeDocument = getScopeDocument();
    const triggerPreviewRefresh = (options = {}) => {
      updateCurrentPage(1);
      prevFetchedPageRef.current = null;
      fetchPreviewPostsRef.current?.(1, {
        showSkeleton: false,
        showLoader: options.showLoader !== false,
        replaceList: true,
      });
    };
    const onFilterInteraction = (event) => {
      const target = event?.target;
      if (!target?.closest) {
        return;
      }

      const interactedWithFilterItem = target.closest(
        ".caf-builder-template-preview-filter .caf-terms-list-item"
      );
      if (!interactedWithFilterItem) {
        return;
      }
      setTimeout(() => {
        triggerPreviewRefresh();
      }, 0);
    };
    const runPreviewSearch = (moduleOutput = null, options = {}) => {
      if (moduleOutput && !shouldSubmitPreviewSearch(moduleOutput, options)) {
        return;
      }
      triggerPreviewRefresh();
    };

    const commitSearchKeywordForTags = (moduleOutput) => {
      if (!moduleOutput) {
        return;
      }
      const keyword = commitSearchKeywordToDom(moduleOutput);
      scopeDocument.dispatchEvent(
        new CustomEvent("caf-preview-search-committed", {
          detail: {
            keyword,
            rowindex: moduleOutput.getAttribute("data-preview-row"),
            columnindex: moduleOutput.getAttribute("data-preview-column"),
            moduleindex: moduleOutput.getAttribute("data-preview-module"),
          },
        })
      );
    };

    const runSmartSearchPhase = (moduleOutput) => {
      const keyword = moduleOutput ? getRawSearchInput(moduleOutput) : "";
      const searchSettings = moduleOutput
        ? getSearchModuleSettingsFromOutput(moduleOutput)
        : { smartEnabled: false };

      if (!keyword.trim()) {
        clearPreviewSmartSearchSelections(scopeDocument);
        return;
      }

      if (searchSettings.smartEnabled) {
        const searchCommands = CAFSmartFilterSearch.parseSearchCommands(keyword);
        if (searchCommands.reset) {
          const selectedFilter = miscPreviewData?.selected_filter;
          runPreviewFilterReset(scopeDocument, selectedFilter);
          scopeDocument.dispatchEvent(
            new CustomEvent("caf-preview-filter-refresh")
          );
          return;
        }
        applyPreviewSmartFilterSearch({
          scopeDocument,
          mainBuilderData: props.mainBuilderData,
          keyword,
          searchSettings,
        });
      } else {
        clearPreviewSmartSearchSelections(scopeDocument);
      }
    };

    const runSearchWithTags = (moduleOutput, options = {}) => {
      if (!moduleOutput) {
        return;
      }

      const trigger = getSearchTrigger(moduleOutput);
      const explicitSubmit = options.explicitSubmit === true;

      // Enter/icon mode: never search on live typing — only explicit submit actions.
      if (trigger === "enter_icon" && !explicitSubmit) {
        return;
      }

      if (
        options.viaEnter === true &&
        trigger === "typing" &&
        !getRawSearchInput(moduleOutput)
      ) {
        return;
      }

      const raw = getRawSearchInput(moduleOutput);
      const belowMinChar = Boolean(raw && isBlockedByMinCharLimit(moduleOutput));

      if (belowMinChar) {
        const hadSmartMatches = getPreviewSmartMatchedTermsCount(scopeDocument) > 0;
        const hadActiveKeyword = lastActiveSearchKeyword !== "";
        if (hadSmartMatches) {
          clearPreviewSmartSearchSelections(scopeDocument);
        }
        if (trigger === "typing" && (hadSmartMatches || hadActiveKeyword)) {
          commitSearchKeywordForTags(moduleOutput);
          lastActiveSearchKeyword = "";
          window.setTimeout(() => {
            triggerPreviewRefresh({ showLoader: false });
          }, 0);
        }
        return;
      }

      if (!raw) {
        clearPreviewSmartSearchSelections(scopeDocument);
        commitSearchKeywordForTags(moduleOutput);
        lastActiveSearchKeyword = "";
        window.setTimeout(() => {
          triggerPreviewRefresh();
        }, 0);
        return;
      }

      const searchSettings = getSearchModuleSettingsFromOutput(moduleOutput);
      if (
        searchSettings.smartEnabled &&
        CAFSmartFilterSearch.parseSearchCommands(raw).reset
      ) {
        const selectedFilter = miscPreviewData?.selected_filter;
        runPreviewFilterReset(scopeDocument, selectedFilter);
        lastActiveSearchKeyword = "";
        scopeDocument.dispatchEvent(
          new CustomEvent("caf-preview-filter-refresh")
        );
        return;
      }

      runSmartSearchPhase(moduleOutput);
      commitSearchKeywordForTags(moduleOutput);
      lastActiveSearchKeyword = raw;
      window.setTimeout(() => {
        runPreviewSearch(moduleOutput, options);
      }, 0);
    };

    const onSearchExecute = (event) => {
      const moduleOutput =
        event?.detail?.moduleOutput ||
        getSearchModuleOutput(scopeDocument.activeElement) ||
        scopeDocument.querySelector(
          `${PREVIEW_FILTER_SEARCH_ROOT} .caf-filter-module-search-output`
        );
      runSearchWithTags(moduleOutput, { explicitSubmit: true });
    };

    const onPreviewFilterRefresh = () => {
      triggerPreviewRefresh();
    };

    const onPreviewResetSearch = () => {
      lastActiveSearchKeyword = "";
      clearPreviewSmartSearchSelections(scopeDocument);
      scopeDocument
        .querySelectorAll(
          `${PREVIEW_FILTER_SEARCH_ROOT} .caf-filter-module-search-output`
        )
        .forEach((moduleOutput) => {
          clearCommittedSearchKeywordOnDom(moduleOutput);
          scopeDocument.dispatchEvent(
            new CustomEvent("caf-preview-search-committed", {
              detail: {
                keyword: "",
                rowindex: moduleOutput.getAttribute("data-preview-row"),
                columnindex: moduleOutput.getAttribute("data-preview-column"),
                moduleindex: moduleOutput.getAttribute("data-preview-module"),
              },
            })
          );
        });
      triggerPreviewRefresh();
    };

    const onSearchKeydown = (event) => {
      const target = event?.target;
      const moduleOutput = getSearchModuleOutput(target);
      if (!moduleOutput || event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      runSearchWithTags(moduleOutput, { viaEnter: true, explicitSubmit: true });
    };

    const scheduleTypingSearch = (moduleOutput) => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
      searchDebounceTimer = setTimeout(() => {
        runSearchWithTags(moduleOutput, { explicitSubmit: true });
      }, 350);
    };

    const onSearchInput = (event) => {
      const target = event?.target;
      const moduleOutput = getSearchModuleOutput(target);
      if (!moduleOutput) {
        return;
      }

      const trigger = getSearchTrigger(moduleOutput);
      if (trigger !== "typing") {
        const committed =
          moduleOutput.getAttribute("data-committed-search-keyword") || "";
        const raw = getRawSearchInput(moduleOutput);
        if (!raw && committed) {
          clearCommittedSearchKeywordOnDom(moduleOutput);
          clearPreviewSmartSearchSelections(scopeDocument);
          commitSearchKeywordForTags(moduleOutput);
          triggerPreviewRefresh();
        }
        return;
      }

      scheduleTypingSearch(moduleOutput);
    };

    const onSearchKeyup = (event) => {
      const target = event?.target;
      const moduleOutput = getSearchModuleOutput(target);
      if (!moduleOutput) {
        return;
      }

      const trigger = getSearchTrigger(moduleOutput);
      if (trigger !== "typing") {
        return;
      }

      // Char-limit check on keyup for live search (debounced submit).
      scheduleTypingSearch(moduleOutput);
    };

    const onSearchIconClick = (event) => {
      const searchIcon = event.target?.closest?.(
        `${PREVIEW_FILTER_SEARCH_ROOT} .caf-module-search .search-icon`
      );
      if (!searchIcon) {
        return;
      }
      const moduleOutput = getSearchModuleOutput(searchIcon);
      if (!moduleOutput) {
        return;
      }
      event.preventDefault();
      runSearchWithTags(moduleOutput, { explicitSubmit: true });
    };

    const onSearchClearClick = (event) => {
      const clearIcon = event.target?.closest?.(
        `${PREVIEW_FILTER_SEARCH_ROOT} .caf-module-search .clear-icon`
      );
      if (!clearIcon) {
        return;
      }
      setTimeout(() => {
        scopeDocument.dispatchEvent(new CustomEvent("caf-preview-reset-search"));
      }, 0);
    };

    const onRangeSliderChanged = () => {
      setTimeout(() => {
        triggerPreviewRefresh();
      }, 0);
    };
    // Use capture so module handlers calling stopPropagation
    // do not block our listener.
    scopeDocument.addEventListener("click", onFilterInteraction, true);
    scopeDocument.addEventListener("click", onSearchIconClick, true);
    scopeDocument.addEventListener("click", onSearchClearClick, true);
    scopeDocument.addEventListener("input", onSearchInput, true);
    scopeDocument.addEventListener("keyup", onSearchKeyup, true);
    scopeDocument.addEventListener("keydown", onSearchKeydown, true);
    scopeDocument.addEventListener("cafRangeSliderChanged", onRangeSliderChanged, true);
    scopeDocument.addEventListener("caf-preview-search-execute", onSearchExecute);
    scopeDocument.addEventListener("caf-preview-filter-refresh", onPreviewFilterRefresh);
    scopeDocument.addEventListener("caf-preview-reset-search", onPreviewResetSearch);
    return () => {
      scopeDocument.removeEventListener("click", onFilterInteraction, true);
      scopeDocument.removeEventListener("click", onSearchIconClick, true);
      scopeDocument.removeEventListener("click", onSearchClearClick, true);
      scopeDocument.removeEventListener("input", onSearchInput, true);
      scopeDocument.removeEventListener("keyup", onSearchKeyup, true);
      scopeDocument.removeEventListener("keydown", onSearchKeydown, true);
      scopeDocument.removeEventListener("cafRangeSliderChanged", onRangeSliderChanged, true);
      scopeDocument.removeEventListener("caf-preview-search-execute", onSearchExecute);
      scopeDocument.removeEventListener("caf-preview-filter-refresh", onPreviewFilterRefresh);
      scopeDocument.removeEventListener("caf-preview-reset-search", onPreviewResetSearch);
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };

  }, [props.mainBuilderData, props.deviceType, pagination?.settings?.posts_per_page, paginationType]);

  const getPostsList = async () => {
    try {
      const { data } = await apiClient.get(
        apiEndpoints.getPostsList(resolvePostTypeFromBuilderData(props.mainBuilderData))
      );
      if (data) {
        if (data.status === "success") {
          setPostsList(data.posts_list);
          if (paginationType === "load-more") {
            props.setCountRes(prevState => {
                return {
                  ...prevState,  // Keep existing values
                  start: data.posts_list?.length > 0 ? "1" : "0",
                  end:data.results_count.end,
                  total_results: data.results_count.total_results,
              };
            });
        }
        else{
            props.setCountRes(data.results_count); 
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };
const normalizeGroupedCustomFieldData = (value) => {
  const source = Array.isArray(value) ? value : [];
  if (source.length === 0) return [];
  if (Array.isArray(source[0])) return source;
  return [source];
};

const extractCustomFieldValues = (field) => {
  const raw = field?.custom_field_value_list;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return String(entry).trim();
      }
      if (entry && typeof entry === "object") {
        return String(entry.key ?? entry.value ?? "").trim();
      }
      return "";
    })
    .filter((val) => val !== "");
};

const buildMetaQuery = (customFieldData) => {
    const groups = [];

    normalizeGroupedCustomFieldData(customFieldData).forEach((group) => {
        const groupEntry = [];
        //groupEntry.relation = "AND";

        (group || []).forEach((field) => {
            const key = String(field?.custom_field_key ?? "").trim();
            if (!key || key === "0") return;

            const values = extractCustomFieldValues(field);
            if (values.length === 0) return;

            const compareOp = field?.compare_operator || "=";
            groupEntry.push({
                key,
                value: values.length > 1 ? values : values[0],
                compare:
                    values.length > 1 && compareOp === "=" ? "IN" : compareOp,
                type: field?.meta_type || "CHAR",
            });
        });

        if (groupEntry.length > 0) {
            //groups.push(groupEntry);
            if (groupEntry.length > 0) {
              const groupEntryData = [...groupEntry];
              if (groupEntry.length > 1) {
                  groupEntryData.relation = 'AND';
              }
              groups.push(groupEntryData);
          }
        }
    });

    return groups;
};
const normalizeGroupedTaxonomyData = (value) => {
  const source = Array.isArray(value) ? value : [];
  if (source.length === 0) return [];
  if (Array.isArray(source[0])) return source;
  return [source];
};

const buildTaxQuery = (taxonomyData) => {
  const groups = [];

  normalizeGroupedTaxonomyData(taxonomyData).forEach((group) => {
      
      const groupFields = []; 

      (group || []).forEach((tax) => {
          const termIds = Array.isArray(tax?.term_data)
              ? tax.term_data
                  .map((term) => Number(term?.key ?? term?.id))
                  .filter((id) => Number.isFinite(id) && id > 0)
              : [];

          if (termIds.length === 0) return;

          const operator =
              String(tax?.operator || "IN").toUpperCase() === "OR" ||
              String(tax?.operator || "IN").toUpperCase() === "IN"
                  ? "IN"
                  : termIds.length > 1
                  ? "AND"
                  : "IN";

          groupFields.push({ 
              taxonomy: tax.key,
              field:    "term_id",
              terms:    termIds.length > 1 ? termIds : termIds[0],
              operator,
          });
      });

      
      if (groupFields.length > 0) {
          const groupEntry = [...groupFields];
          if (groupFields.length > 1) {
              groupEntry.relation = 'AND';
          }
          groups.push(groupEntry);
      }
  });

  return groups;
};

const collectTermIds = (terms = []) =>
  terms.flatMap((term) => [
    Number(term?.key),
    ...(Array.isArray(term?.children_data) ? collectTermIds(term.children_data) : []),
  ]);
 const collectTermIdsByLabel = (terms = [], label = "") =>
  terms.flatMap((term) => {
    const currentLabel = String(term?.value || "").trim().toLowerCase();
    const next = currentLabel === label ? [Number(term?.key)] : [];
    return [
      ...next,
      ...(Array.isArray(term?.children_data)
        ? collectTermIdsByLabel(term.children_data, label)
        : []),
    ];
  });
 const resolveSelectedTaxQueryFromDom = () => {
  const scopeDocument = getScopeDocument();
  const initialFilterData = Array.isArray(
    props.mainBuilderData?.filter_layout_data?.initial_data
  )
    ? props.mainBuilderData.filter_layout_data.initial_data
    : [];
  const taxChunks = [];
  initialFilterData.forEach((row, rowindex) => {
    (row?.data || []).forEach((column, columnindex) => {
      (column?.data || []).forEach((module, moduleindex) => {
        const moduleRoot = scopeDocument.querySelector(
          `.caf-builder-template-preview-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}`
        );
        if (!moduleRoot || !Array.isArray(module?.settings?.taxonomy_data)) {
          return;
        }
        let selectedTerms = [];
        if (module?.key === "checkbox_filter" && module?.settings?.data_source === "taxonomy") {
          selectedTerms = Array.from(moduleRoot.querySelectorAll(".caf-taxo-input:checked"))
            .map((el) => Number(el?.value))
            .filter((val) => Number.isFinite(val));

        } else if (module?.key === "dropdown_filter" && module?.settings?.data_source === "taxonomy") {
          const selectedLi = moduleRoot.querySelector(".caf-dropdown-child .caf-terms-list-item.caf-selected");
          if (selectedLi) {
            const termIdAttr = Number(selectedLi.getAttribute("term-id"));
            if (Number.isFinite(termIdAttr) && termIdAttr > 0) {
              selectedTerms = [termIdAttr];
            } else {
              const label = String(
                selectedLi.querySelector(".trm-name")?.textContent || selectedLi.textContent || ""
              )
                .trim()
                .toLowerCase();
              if (label) {
                selectedTerms = collectTermIdsByLabel(module.settings.taxonomy_data.flatMap((g) => g?.term_data || []), label)
                  .filter((val) => Number.isFinite(val));
              }
            }
          }
        }
        if (selectedTerms.length === 0) {
          return;
        }
        const modCatRel = String(module?.settings?.category_relation || "OR").toUpperCase();
        const termOp = modCatRel === "AND" ? "AND" : "IN";
        const clauses = [];
        (module.settings.taxonomy_data || []).forEach((group) => {
          if (shouldSkipPreviewTaxonomyGroup(group?.key)) {
            return;
          }
          const groupIds = collectTermIds(group?.term_data || []).filter((val) =>
            Number.isFinite(val)
          );
          const matched = selectedTerms.filter((termId) => groupIds.includes(termId));
          if (!group?.key || matched.length === 0) {
            return;
          }
          clauses.push({
            taxonomy: group.key,
            field: "term_id",
            terms: Array.from(new Set(matched)),
            operator: matched.length > 1 ? termOp : "IN",
          });
        });
        if (clauses.length === 0) {
          return;
        }
        if (clauses.length === 1) {
          taxChunks.push(clauses[0]);
        } else {
          const nested = { relation: modCatRel === "AND" ? "AND" : "OR" };
          clauses.forEach((c, i) => {
            nested[i] = c;
          });
          taxChunks.push(nested);
        }
      });
    });
  });
  return taxChunks;
 };

 /**
  * Active taxonomy filter term slugs by taxonomy (DOM order).
  * Prefer term-slug attrs / taxonomy_data.slug so every card can sync
  * without depending on each product's categories payload.
  */
 const resolveFilterAttributeSlugMapFromDom = () => {
  const scopeDocument = getScopeDocument();
  const initialFilterData = Array.isArray(
    props.mainBuilderData?.filter_layout_data?.initial_data
  )
    ? props.mainBuilderData.filter_layout_data.initial_data
    : [];
  const map = {};

  const findTermMeta = (termData, termId) => {
    const id = Number(termId);
    const stack = Array.isArray(termData) ? [...termData] : [];
    while (stack.length) {
      const term = stack.shift();
      if (!term) continue;
      if (Number(term?.key ?? term?.id ?? term?.term_id) === id) {
        return term;
      }
      if (Array.isArray(term?.children_data) && term.children_data.length) {
        stack.push(...term.children_data);
      }
    }
    return null;
  };

  const slugFromTermMeta = (term) => {
    if (!term) return "";
    if (term.slug) return String(term.slug).trim();
    const label = String(term.value || term.name || "").trim();
    if (!label) return "";
    return label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
  };

  initialFilterData.forEach((row, rowindex) => {
    (row?.data || []).forEach((column, columnindex) => {
      (column?.data || []).forEach((module, moduleindex) => {
        if (
          (module?.key !== "checkbox_filter" && module?.key !== "dropdown_filter") ||
          module?.settings?.data_source !== "taxonomy"
        ) {
          return;
        }
        const moduleRoot = scopeDocument.querySelector(
          `.caf-builder-template-preview-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}`
        );
        if (!moduleRoot || !Array.isArray(module?.settings?.taxonomy_data)) {
          return;
        }

        const selectedItems = [];
        const pushSelected = (li) => {
          if (!li) return;
          const input = li.querySelector(".caf-taxo-input");
          const termId = Number(input?.value || li.getAttribute("term-id"));
          if (!Number.isFinite(termId) || termId <= 0) return;
          if (selectedItems.some((row) => row.termId === termId)) return;
          selectedItems.push({
            termId,
            slug: String(li.getAttribute("term-slug") || "").trim(),
            taxonomy: String(
              li.getAttribute("taxonomy") || li.getAttribute("data-key") || ""
            ).trim(),
          });
        };

        if (module.key === "checkbox_filter") {
          moduleRoot
            .querySelectorAll(".caf-terms-list-item.caf-selected")
            .forEach((li) => pushSelected(li));
          moduleRoot.querySelectorAll(".caf-taxo-input:checked").forEach((input) => {
            pushSelected(input.closest(".caf-terms-list-item"));
          });
        } else {
          pushSelected(
            moduleRoot.querySelector(
              ".caf-dropdown-child .caf-terms-list-item.caf-selected"
            )
          );
        }

        if (!selectedItems.length) {
          return;
        }

        selectedItems.forEach((selected) => {
          const termId = Number(selected.termId);
          if (!Number.isFinite(termId) || termId <= 0) {
            return;
          }

          (module.settings.taxonomy_data || []).forEach((group) => {
            const tax = String(group?.key || selected.taxonomy || "").trim();
            if (!tax || shouldSkipPreviewTaxonomyGroup(tax) || tax.indexOf("__caf_woo_") === 0) {
              return;
            }
            const groupIds = collectTermIds(group?.term_data || []).filter((val) =>
              Number.isFinite(val)
            );
            if (!groupIds.includes(termId)) {
              return;
            }

            let slug = selected.slug;
            if (!slug) {
              slug = slugFromTermMeta(findTermMeta(group?.term_data || [], termId));
            }
            if (!slug) {
              return;
            }

            if (!map[tax]) {
              map[tax] = [];
            }
            if (map[tax].indexOf(slug) === -1) {
              map[tax].push(slug);
            }
          });
        });
      });
    });
  });

  return map;
 };

 const flattenMetaQueryGroupsForPreview = (metaQueryData) => {
   if (!Array.isArray(metaQueryData) || metaQueryData.length === 0) {
     return [];
   }
   const out = [];
   metaQueryData.forEach((entry) => {
     if (!entry) {
       return;
     }
     if (Array.isArray(entry)) {
       entry.forEach((part) => {
         if (part && typeof part === "object" && typeof part.key === "string" && part.key !== "") {
           out.push(part);
         }
       });
     } else if (typeof entry === "object" && typeof entry.key === "string" && entry.key !== "") {
       out.push(entry);
     }
   });
   return out;
 };

 const resolveRangeSliderMetaFromDom = () => {
   const scopeDocument = getScopeDocument();
   const clauses = [];
   const initialFilterData = Array.isArray(
     props.mainBuilderData?.filter_layout_data?.initial_data
   )
     ? props.mainBuilderData.filter_layout_data.initial_data
     : [];

   initialFilterData.forEach((row, rowindex) => {
     (row?.data || []).forEach((column, columnindex) => {
       (column?.data || []).forEach((module, moduleindex) => {
         if (module?.key !== "range_slider") {
           return;
         }
         const moduleRoot = scopeDocument.querySelector(
           `.caf-builder-template-preview-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}`
         );
         const slider = moduleRoot?.querySelector?.(".caf-range-slider-ui");
         if (!slider) {
           return;
         }
         const key = String(slider.getAttribute("data-meta-key") || "").trim();
         if (!key || key === "0") {
           return;
         }
         const rangeType = String(slider.getAttribute("data-range-type") || "double").toLowerCase();
         const minVal = Number(slider.getAttribute("data-current-min"));
         const maxVal = Number(slider.getAttribute("data-current-max"));
         const dataMin = Number(slider.getAttribute("data-min"));
         const dataMax = Number(slider.getAttribute("data-max"));
         const safeMin = Number.isFinite(minVal) ? minVal : dataMin;
         const safeMax = Number.isFinite(maxVal) ? maxVal : dataMax;
         if (!Number.isFinite(safeMin) || !Number.isFinite(safeMax)) {
           return;
         }
         if (rangeType === "single") {
           const defaultsEnabled =
             slider.getAttribute("data-default-values-enabled") === "true";
           const hasValidDefaults =
             slider.getAttribute("data-has-valid-defaults") === "true";
           if (defaultsEnabled && hasValidDefaults) {
             if (Number.isFinite(dataMax) && safeMax === dataMax) {
               return;
             }
           } else {
             const startMaxDefault = Number(slider.getAttribute("data-start-max"));
             const neutralMax = Number.isFinite(startMaxDefault)
               ? startMaxDefault
               : dataMax;
             if (Number.isFinite(neutralMax) && safeMax === neutralMax) {
               return;
             }
           }
           clauses.push({
             key,
             value: safeMax,
             compare: "<=",
             type: "NUMERIC",
           });
           return;
         }
         if (
           Number.isFinite(dataMin) &&
           Number.isFinite(dataMax) &&
           safeMin === dataMin &&
           safeMax === dataMax
         ) {
           return;
         }
         clauses.push({
           key,
           value: [safeMin, safeMax],
           compare: "BETWEEN",
           type: "NUMERIC",
         });
       });
     });
   });
   return clauses;
 };

 const resolveCustomFieldMetaFromDom = () => {
  const scopeDocument = getScopeDocument();
  const initialFilterData = Array.isArray(
    props.mainBuilderData?.filter_layout_data?.initial_data
  )
    ? props.mainBuilderData.filter_layout_data.initial_data
    : [];
  const metaChunks = [];
  initialFilterData.forEach((row, rowindex) => {
    (row?.data || []).forEach((column, columnindex) => {
      (column?.data || []).forEach((module, moduleindex) => {
        const moduleRoot = scopeDocument.querySelector(
          `.caf-builder-template-preview-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}`
        );
        if (!moduleRoot || !Array.isArray(module?.settings?.custom_field_data)) {
          return;
        }
        if(module?.key !== "checkbox_filter" && module?.key !== "dropdown_filter") return ;
        const moduleDataSource = resolveFilterDataSource(module?.settings?.data_source);
        if (moduleDataSource !== "custom_field" || !canUseFeature("filter_custom_field")) {
          return;
        }
        
        let selectedTerms = [];
        if (module?.key === "checkbox_filter") {
          selectedTerms = Array.from(moduleRoot.querySelectorAll(".caf-cf-value-input:checked"))
            .map((el) => String(el?.value))
            .filter((val) => val.trim() !== "");
          
        }
        
        else if (module?.key === "dropdown_filter") {
          const selectedLi = moduleRoot.querySelector(".caf-dropdown-child .caf-terms-list-item.caf-selected");
          if (selectedLi) {
            let termIdAttr = String(selectedLi.getAttribute("term-id"));
            if (String(termIdAttr) && termIdAttr.trim() !="") {
              selectedTerms = [termIdAttr];
            } 
            // else {
            //   const label = String(
            //     selectedLi.querySelector(".cf-value-name")?.textContent || selectedLi.textContent || ""
            //   )
            //     .trim()
            //     .toLowerCase();
            //   if (label) {
            //     selectedTerms = collectTermIdsByLabel(module.settings.taxonomy_data.flatMap((g) => g?.term_data || []), label)
            //       .filter((val) => Number.isFinite(val));
            //   }
            // }
        }
      }
        if (selectedTerms.length === 0) {
          return;
        }
        //const clauses = [];
        (module?.settings?.custom_field_data || []).forEach((group) => {

          const groupIds = Array.isArray(group?.custom_field_value_list)
          ? group.custom_field_value_list.map((item) => item?.key)
          : [group?.custom_field_value_list?.key].filter(Boolean);

          // ✅ Empty values skip 
          if (groupIds.length === 0) return;

          const matched = selectedTerms.filter((termId) => groupIds.includes(termId));
          if (!group?.custom_field_key || matched.length === 0) {
            return;
          }
          metaChunks.push({
            key:     group.custom_field_key,
            value:   matched.length > 1 ? matched : matched[0],
            compare: (matched.length > 1 && group.compare_operator === '=')
                      ? 'IN'
                      : group.compare_operator,
            type:    group.meta_type,
          });
        });

        if (metaChunks.length === 0) {
          return;
        }
        // if (clauses.length === 1) {
        //   taxChunks.push(clauses[0]);
        // }else{
        //   taxChunks.push(clauses);
        // } 
        // else {
        //   const nested = { relation: modCatRel === "AND" ? "AND" : "OR" };
        //   clauses.forEach((c, i) => {
        //     nested[i] = c;
        //   });
        //   taxChunks.push(nested);
        // }
      });
    });
  });
  return metaChunks;
 };
 const MakeBuilderQuery=()=>{
  let query_data = props.mainBuilderData.filter_layout_data.filter_query_data;
  let filterStatus = resolveFilterTypeFromBuilderData(props.mainBuilderData);
  let queryArgs ={};
  let taxQueryData = [];
  let metaQueryData = [];
  if(query_data.data_source.taxonomy ==='true'){ 
      if (query_data.taxonomy_data.length > 0 && filterStatus === "false") {
      taxQueryData = buildTaxQuery(query_data.taxonomy_data);
      if (taxQueryData.length > 1) {
        taxQueryData = { relation: 'OR', ...taxQueryData };
    }
      }
  }
  if(query_data.data_source.custom_field ==='true' && filterStatus === "false"){

    if (canUseFeature("filter_custom_field") && query_data.custom_field_data.length > 0) {
      metaQueryData = buildMetaQuery(query_data.custom_field_data);
      if (metaQueryData.length > 1) {
        metaQueryData = { relation: 'OR', ...metaQueryData };
      }
    }
  }
  
  const rangeSliderMeta = resolveRangeSliderMetaFromDom();
  const customFieldsMeta = resolveCustomFieldMetaFromDom();
  const wooAndRatingMeta = resolvePreviewWooAndRatingMetaFromDom(getScopeDocument());

  let mergedMeta = [...rangeSliderMeta, ...customFieldsMeta, ...wooAndRatingMeta];
  if (mergedMeta.length > 1) {
    const rel = metaRelation === "AND" ? "AND" : metaRelation === "IN" ? "IN" : "OR";
    const metaWrapped = { relation: rel };
    mergedMeta.forEach((m, i) => {
      metaWrapped[i] = m;
    });
    mergedMeta = metaWrapped;
  }

  const selectedTaxQuery = resolveSelectedTaxQueryFromDom();
  let finalTaxQuery = selectedTaxQuery;
  if (selectedTaxQuery?.length > 0) {
    let taxoRelation = String(
      taxonomyRelation || "OR"
    ).toUpperCase();
    if (taxoRelation !== "AND" && taxoRelation !== "OR") {
      taxoRelation = "OR";
    }
    if (selectedTaxQuery.length === 1) {
      finalTaxQuery = [selectedTaxQuery[0]];
    } else {
      const taxWrapped = { relation: taxoRelation };
      selectedTaxQuery.forEach((chunk, i) => {
        taxWrapped[i] = chunk;
      });
      finalTaxQuery = taxWrapped;
    }
  }
  const searchQuery = resolvePreviewSearchQueryFromDom(getScopeDocument());

  const taxQueryIsNonEmpty = (tq) => {
    if (!tq) {
      return false;
    }
    if (Array.isArray(tq)) {
      return tq.length > 0;
    }
    if (typeof tq === "object") {
      return Object.keys(tq).length > 0;
    }
    return false;
  };

  const metaQueryIsNonEmpty = (mq) => {
    if (!mq) {
      return false;
    }
    if (Array.isArray(mq)) {
      return mq.length > 0 ;
    }
    if (typeof mq === "object") {
      return Object.keys(mq).length > 0 ;
    }
    return false;
  };

  const finalMetaQuery = metaQueryIsNonEmpty(mergedMeta) ? mergedMeta : metaQueryData ;

  // Layout query restriction (permanent pool) — independent of Build Your Query.
  const restriction = props.mainBuilderData?.filter_layout_data?.extra_data
    ?.query_restriction;
  const restrictionEnabled =
    filterStatus === "true" &&
    (restriction?.enabled === true || restriction?.enabled === "true");

  const buildRestrictionClause = (block, operator) => {
    if (!block?.taxonomy) return null;
    const termIds = (Array.isArray(block.term_data) ? block.term_data : [])
      .map((term) => Number(term?.key ?? term?.id))
      .filter((id) => Number.isFinite(id) && id > 0);
    if (termIds.length === 0) return null;
    return {
      taxonomy: block.taxonomy,
      field: "term_id",
      terms: termIds.length > 1 ? termIds : termIds[0],
      operator,
    };
  };

  let restrictionTaxQuery = null;
  let restrictionPostNotIn = [];
  if (restrictionEnabled && restriction) {
    const taxChunks = [];
    // New include/exclude shape.
    if (restriction.include?.by === "terms") {
      const includeClause = buildRestrictionClause(restriction.include, "IN");
      if (includeClause) taxChunks.push(includeClause);
    } else if (Array.isArray(restriction.taxonomy_data)) {
      // Legacy taxonomy_data.
      let legacy = buildTaxQuery(restriction.taxonomy_data);
      if (legacy.length > 1) {
        legacy = { relation: "OR", ...legacy };
        taxChunks.push(legacy);
      } else if (legacy.length === 1) {
        taxChunks.push(legacy[0]);
      }
    }
    if (restriction.exclude?.by === "terms") {
      const excludeClause = buildRestrictionClause(
        restriction.exclude,
        "NOT IN"
      );
      if (excludeClause) taxChunks.push(excludeClause);
    }
    if (restriction.exclude?.by === "posts") {
      restrictionPostNotIn = (Array.isArray(restriction.exclude.post_data)
        ? restriction.exclude.post_data
        : []
      )
        .map((post) => Number(post?.value ?? post?.id))
        .filter((id) => Number.isFinite(id) && id > 0);
    }
    if (taxChunks.length === 1) {
      restrictionTaxQuery = taxChunks[0];
    } else if (taxChunks.length > 1) {
      const wrapped = { relation: "AND" };
      taxChunks.forEach((chunk, i) => {
        wrapped[i] = chunk;
      });
      restrictionTaxQuery = wrapped;
    }
  }

  const mergeRestriction = (activeTax) => {
    if (!taxQueryIsNonEmpty(restrictionTaxQuery)) {
      return activeTax;
    }
    if (!taxQueryIsNonEmpty(activeTax)) {
      return restrictionTaxQuery;
    }
    return {
      relation: "AND",
      0: restrictionTaxQuery,
      1: activeTax,
    };
  };

  queryArgs = {
    post_type : resolvePostTypeFromBuilderData(props.mainBuilderData),
    posts_per_page: pagination?.settings?.posts_per_page ?? -1,
    ...previewSortArgs,
    post_status: "publish",
  };
  if (taxQueryIsNonEmpty(finalTaxQuery)) {
    queryArgs.tax_query = mergeRestriction(finalTaxQuery);
  } else if (taxQueryIsNonEmpty(taxQueryData)) {
    queryArgs.tax_query = mergeRestriction(taxQueryData);
  } else if (taxQueryIsNonEmpty(restrictionTaxQuery)) {
    queryArgs.tax_query = restrictionTaxQuery;
  }
  if (restrictionPostNotIn.length > 0) {
    queryArgs.post__not_in = restrictionPostNotIn;
  }
  if (metaQueryIsNonEmpty(finalMetaQuery)) {
    queryArgs.meta_query = finalMetaQuery;
  }
  if (searchQuery.s) {
    Object.assign(queryArgs, searchQuery);
  }
  return queryArgs;
}

const parsePreviewPostsPayload = (data) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  return data;
};

  const fetchPreviewPosts = useCallback(
    async (
      page = currentPage,
      { showSkeleton = true, showLoader = false, replaceList } = {}
    ) => {
      const requestId = ++fetchRequestIdRef.current;

      if (showLoader) {
        setCheckLoading(true);
      }
      if (showSkeleton && !hasLoadedPostsRef.current) {
        setLoading(true);
      }

      let query = {
        post_type: postType,
        posts_per_page: pagination?.settings?.posts_per_page ?? -1,
        paged: page,
        ...previewSortArgs,
        post_status: "publish",
      };
      const queryArgs = MakeBuilderQuery();
      query = {
        ...query,
        ...queryArgs,
        paged: page,
      };
      const query_data = {
        query,
        pagination_type: paginationType || "number",
        filter_layout_data: {
          initial_data: props.mainBuilderData?.filter_layout_data?.initial_data ?? [],
          extra_data: props.mainBuilderData?.filter_layout_data?.extra_data ?? {},
        },
        post_layout_data: {
          initial_data: props.mainBuilderData?.post_layout_data?.initial_data ?? [],
          extra_data: props.mainBuilderData?.post_layout_data?.extra_data ?? {},
        },
      };

      try {
        const { data } = await apiClient.post(apiEndpoints.getPreviewPosts(), {
          query_data,
        });
        const payload = parsePreviewPostsPayload(data);
        if (requestId !== fetchRequestIdRef.current) {
          return;
        }

        if (payload?.status === "success") {
          const paginationTypeValue = paginationType;
          const shouldReplaceList =
            replaceList === true ||
            (replaceList !== false &&
              (paginationTypeValue !== "load-more" || page <= 1));

          if (shouldReplaceList) {
            setPostsList(payload.posts_list || []);
          } else {
            setPostsList((prevPosts) => {
              const merged = [...prevPosts, ...(payload.posts_list || [])];
              return Array.from(new Map(merged.map((item) => [item.id, item])).values());
            });
          }

          setPage({
            total: payload.total_page,
            next: payload.next,
            prev: payload.prev,
            load_more: payload?.load_more,
          });

          if (paginationType === "load-more") {
            const totalResults = parseInt(payload.results_count?.total_results || "0", 10);
            setCountRes({
              start: totalResults > 0 ? "1" : "0",
              end: String(payload.results_count?.end ?? "0"),
              total_results: String(payload.results_count?.total_results ?? "0"),
            });
          } else {
            setCountRes(payload.results_count);
          }

          hasLoadedPostsRef.current = true;

          // Always hydrate show_count from live facet_counts when the API returns them.
          if (payload.facet_counts && typeof payload.facet_counts === "object") {
            props.onPreviewFacetCountsUpdate?.(payload.facet_counts);
          }
        }
      } finally {
        if (requestId === fetchRequestIdRef.current) {
          setLoading(false);
          setCheckLoading(false);
        }
      }
    },
    [
      currentPage,
      previewSortArgs.orderby,
      previewSortArgs.order,
      props.orderBy,
      props.orderType,
      paginationType,
      pagination?.settings?.posts_per_page,
      postType,
      props.mainBuilderData,
      setPage,
      setCountRes,
      setCheckLoading,
      props.onPreviewFacetCountsUpdate,
    ]
  );

  fetchPreviewPostsRef.current = fetchPreviewPosts;

  useEffect(() => {
    if (
      prevSettingsSignatureRef.current &&
      prevSettingsSignatureRef.current !== settingsSignature &&
      currentPage !== 1
    ) {
      prevSettingsSignatureRef.current = settingsSignature;
      updateCurrentPage(1);
      return;
    }

    prevSettingsSignatureRef.current = settingsSignature;

    const timer = window.setTimeout(() => {
      const isPaginationChange =
        hasLoadedPostsRef.current &&
        prevFetchedPageRef.current !== null &&
        prevFetchedPageRef.current !== currentPage;

      fetchPreviewPosts(currentPage, {
        showSkeleton: !hasLoadedPostsRef.current,
        showLoader: isPaginationChange,
        replaceList:
          paginationType !== "load-more" ||
          currentPage <= 1,
      });

      prevFetchedPageRef.current = currentPage;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [currentPage, settingsSignature, fetchPreviewPosts, updateCurrentPage]);

  useEffect(() => {
    if (!filterDomReady || filterDomRefetchedRef.current) {
      return;
    }

    filterDomRefetchedRef.current = true;
    const timer = window.setTimeout(() => {
      if (props.currPage !== 1) {
        updateCurrentPage(1);
        return;
      }
      fetchPreviewPosts(1, { showSkeleton: false, showLoader: false });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [filterDomReady, fetchPreviewPosts, props.currPage, updateCurrentPage]);

  useLayoutEffect(() => {
    const grid = previewRootRef.current;
    if (!grid) {
      return undefined;
    }

    if (!masonryEnabled) {
      clearMasonryItemSpans(grid);
      return undefined;
    }

    const disconnect = observeMasonryLayout(grid);
    scheduleMasonryLayout(grid);
    return disconnect;
  }, [
    masonryEnabled,
    postsList,
    selectedDevice,
    loading,
    postPreviewData?.grid?.device_columns,
    postPreviewData?.inner?.style,
  ]);

  return (
    <div
      ref={previewRootRef}
      className={`caf-builder-preview-post-template grid caf-bl-post ${masonryEnabled ? "caf-masonary-enable" : ""}`}
      style={{
       gridTemplateColumns: `repeat(${postPreviewData.grid?.device_columns?.[selectedDevice]}, minmax(0, 1fr))`,
       columnGap:`${postPreviewData?.inner?.style?.[selectedDevice]?.default?.columnGap}`,
       rowGap:`${postPreviewData?.inner?.style?.[selectedDevice]?.default?.rowGap}`
      }}
    >
      {postsList?.length > 0 ? (
        <>
          {initialdata.length === 0 ? (
            <>
              <Skeleton active />
              <Skeleton active />
            </>
          ) : (
            ""
          )}
          {(() => {
            const filterSlugMap = resolveFilterAttributeSlugMapFromDom();
            return postsList.map((post, postIndex) => {
            const postScopeClass = `post-id-${post?.id ?? postIndex}`;
            return (
            <div
              className={`caf-builder-preview-single-post-item ${postScopeClass}`} data-post-id={post?.id ?? 0}
              // style={{ width: "33%" }}
              key={post?.id ?? post?.value ?? postIndex}
            >
              <WooProductCardVariationProvider
                postData={post}
                filterSlugMap={filterSlugMap}
              >
              {initialdata?.map((row, rowindex) => {
                const rowStyle = row.style;
                const rowSettings = row.settings;
                const row_custom_class = row.settings?.custom_class;
                if (isHiddenOnDevice(rowSettings, selectedDevice)) {
                  return null;
                }

                return (
                  <div
                    className={`caf-builder-row-main caf-row-${rowindex} ${
                      row_custom_class || ""
                    }`}
                    key={rowindex}
                  >
                    {row?.data?.map((column, columnindex) => {
                      const columnStyle = column.style;
                      const ColSettings = column.settings;
                      const col_custom_class = column.settings?.custom_class;
                      if (isHiddenOnDevice(ColSettings, selectedDevice)) {
                        return null;
                      }

                      return (
                        <div
                          className={`caf-builder-column-main caf-column-${columnindex} ${
                            col_custom_class || ""
                          }`}
                          key={columnindex}
                        >
                          {column?.data?.map((module, moduleindex) => {
                            const moduleStyle = module.style;
                            const moduleSettings = resolvePostModuleSettingsForOutput(
                              module.settings
                            );
                            if (isHiddenOnDevice(moduleSettings, selectedDevice)) {
                              return null;
                            }
                            return (
                              <ModuleErrorBoundary
                                key={`${post?.id ?? postIndex}-${rowindex}-${columnindex}-${moduleindex}`}
                                moduleKey={module.key}
                                moduleLabel={module.title || module.key}
                                resetKey={getModuleErrorBoundaryResetKey(
                                  rowindex,
                                  columnindex,
                                  moduleindex,
                                  module.key
                                )}
                              >
                                {module.key === "title" ? (
                                  <ModuleTitle
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "excerpt" ? (
                                  <ModuleExcerpt
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "image" ? (
                                  <ModuleImage
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "woo_product_image" ? (
                                  <ModuleProductImage
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "product_price" ? (
                                  <ModuleProductPrice
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                    hideDuplicateRegularPrice
                                    applyTextVisibilityFilter
                                  />
                                ) : module.key === "woo_product_rating" ? (
                                  <ModuleProductRating
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                    hideAffixWhenZeroRating
                                  />
                                ) : module.key === "woo_add_to_cart" ? (
                                  <ModuleAddToCart
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "woo_attribute_swatch" ? (
                                  <ModuleAttributeSwatch
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                    initialdata={initialdata}
                                    mainBuilderData={props.mainBuilderData}
                                    selectType="post-preview"
                                  />
                                ) : module.key === "badges" ? (
                                  <ModuleBadges
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                    isBuilderPreview={true}
                                    selectType="post-preview"
                                  />
                                ) : module.key === "categories" ? (
                                  <ModuleCategories
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "author" ? (
                                  <ModuleAuthor
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "date" ? (
                                  <ModuleDate
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "commentcount" ? (
                                  <ModuleCommentCount
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "button" ? (
                                  <ModuleButton
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "customfield" ? (
                                  <ModuleCustomField
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : module.key === "customtext" ? (
                                  <ModuleCustomText
                                    postData={post}
                                    settings={moduleSettings}
                                    styleDefault={moduleStyle}
                                    module={module}
                                    rowindex={rowindex}
                                    columnindex={columnindex}
                                    moduleindex={moduleindex}
                                    selectedDevice={selectedDevice}
                                  />
                                ) : (
                                  module.title
                                )}
                              </ModuleErrorBoundary>
                            );
                          })}
                          <style>
                            {`
            .caf-bl-post .${postScopeClass} .caf-row-${rowindex} .caf-column-${columnindex}{
              ${generateGridLayoutCSS(columnStyle, "default", selectedDevice,ColSettings,post?.image)}
            }
            .caf-bl-post .${postScopeClass} .caf-row-${rowindex} .caf-column-${columnindex}:hover{ 
              ${generateGridLayoutCSS(columnStyle, "hover", selectedDevice,ColSettings,post?.image)}
            }
            `}
                          </style>
                        </div>
                      );
                    })}
                    <style>
                      {`
          .caf-bl-post .${postScopeClass} .caf-row-${rowindex}{
            ${generateGridLayoutCSS(rowStyle, "default", selectedDevice,rowSettings,post?.image)}
          }
          .caf-bl-post .${postScopeClass} .caf-row-${rowindex}:hover{ 
            ${generateGridLayoutCSS(rowStyle, "hover", selectedDevice,rowSettings,post?.image)}
          }
          `}
                    </style>
                  </div>
                );
              })}
              </WooProductCardVariationProvider>
            </div>
          );
          });
          })()}
        </>
      ) : !loading ? (
        <p className="caf-builder-post-error">{noResultsMessage}</p>
      ) : (
        <Skeleton active />
      )}

      {(props.customCSS || props.onExtraData) && (
        <style id={"custom-css"}>{props.customCSS || props.onExtraData}</style>
      )}
      <style>
       {`
          .caf-builder-preview-post-template.grid {
            ${generatePreviewSingleCSS(
              props.deviceType,
              "default",
              postPreviewData
            )}
          }
          .caf-builder-preview-post-template.grid:hover{ 
              ${generatePreviewSingleCSS(
              props.deviceType,
              "hover",
              postPreviewData
            )}
          }
          `}

      </style>
    </div>
  );
};

export default Grid;
