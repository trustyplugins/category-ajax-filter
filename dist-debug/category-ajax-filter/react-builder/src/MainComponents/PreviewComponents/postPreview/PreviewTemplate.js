import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Grid from "./previewLayouts/Grid";
import FilterPreview from "./FilterPreview";
import Pagination from "./Pagination";
import Sorting from "./MiscComponents/Sorting";
import SelectedTag from "./MiscComponents/SelectedTag";
import ResultCount from "./MiscComponents/ResultCount";
import Loader from "./MiscComponents/Loader";
import {
  generateMiscContainerCSS,
  generatePostPreviewCSS,
  generateFilterWrapperPreviewCSS,
} from "../../utils/functions";
import {
  resolveFilterTypeFromBuilderData,
  resolvePreviewPostLayoutTypeFromBuilderData,
  resolvePreviewTemplateDataFromBuilderData,
} from "../../utils/builderDataAdapters";
import {
  resolveFilterPosition,
  resolvePreviewLoaderData,
  resolveDndMiscItemEnabled,
  shouldRenderMiscZoneWrapper,
} from "./shared/previewSettingsTier";
import { syncPreviewSelectedTags } from "./previewRangeSliderTagUtils";
import {
  handlePreviewSelectedTagClose,
  runPreviewFilterReset,
} from "./previewSelectedTagsClose";
import { isHiddenOnDevice } from "../../utils/builderVisibility";
import { isPreviewDynamicTermCountsEnabled } from "./previewFacetCounts";
import { PreviewFacetCountsContext } from "./previewFacetCountsContext";
import useBuilderFacetCounts from "./useBuilderFacetCounts";

const getFloatDeviceFallbackValue = (data, device, key) => {
  if (!data) return undefined;

  if (device === "mobile") {
    return data?.mobile?.[key] ?? data?.desktop?.[key];
  }

  if (device === "tablet") {
    return data?.tablet?.[key] ?? data?.desktop?.[key];
  }

  return data?.desktop?.[key];
};

function PreviewTemplate(props) {
  //console.log(props.mainBuilderData.common_data.preview_template_data.misc_preview_data);
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let miscPreviewData = {
    ...previewTemplateData.misc_preview_data,
  };
  const miscPreviewExtraData = {
    ...previewTemplateData.misc_preview_data?.extra,
  };
  let postPreviewData = {
    ...previewTemplateData.post_preview_data,
  };
  let filterPreviewData = {
    ...previewTemplateData.filter_preview_data,
  };
  let dndColData = miscPreviewData?.dnd_column_data;
  const pagination = miscPreviewData.pagination;
  const sorting = miscPreviewData.sorting;
  const selectedFilter = miscPreviewData.selected_filter;
  const resultCount = miscPreviewData.result_count;
  const loaderData = resolvePreviewLoaderData(miscPreviewData.loader);
  const extraDataSaved = miscPreviewData.extra;
  const [selectedPostLayout, setSelectedPostLayout] = useState(
    resolvePreviewPostLayoutTypeFromBuilderData(props.mainBuilderData)
  );
  const [orderBy, setOrderBy] = useState(extraDataSaved?.orderby || "title");
  const [orderType, setOrderType] = useState(extraDataSaved?.order || "ASC");
  const [checkLoading, setCheckLoading] = useState(false);

  useEffect(() => {
    setOrderBy(extraDataSaved?.orderby || "title");
    setOrderType(extraDataSaved?.order || "ASC");
  }, [extraDataSaved?.orderby, extraDataSaved?.order]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currPage, setCurrPage] = useState(1);
  const [page, setPage] = useState({
    total: 1,
    next: true,
    prev: false,
  });
  const [countRes, setCountRes] = useState({
    start: "0",
    end: "0",
    total_results: "0",
  });
  const updateCurrentPage = useCallback((page) => {
    setCurrPage(page);
  }, []);
  useEffect(() => {
    setSelectedPostLayout(resolvePreviewPostLayoutTypeFromBuilderData(props.mainBuilderData));
  }, [props.mainBuilderData]);

  // useEffect(()=>{
  //   if(miscPreviewData.pagination.pagination_type=="load-more"){
  //     setCountRes("1");
  //   }
  // },[miscPreviewData.pagination.pagination_type])
  const [checkboxDomLoad ,setCheckboxDomLoad] = useState(false);
  const [dropdownDomLoad ,setDropdownDomLoad] = useState(false);
  const [filterModuleDomLoad, setFilterModuleDomLoad] = useState(false);
  const [previewFacetCounts, setPreviewFacetCounts] = useState(null);
  // Seed live counts via the lightweight facet_counts request so the first
  // paint doesn't show stale layout-baked counts while the (heavier) posts
  // request is still in flight. Once the posts response delivers counts,
  // those take over and this early fetch is disabled.
  const earlyFacetCounts = useBuilderFacetCounts(props.mainBuilderData, {
    enabled: previewFacetCounts === null,
  });
  const previewFacetCountsContextValue = useMemo(
    () => ({
      dynamicTermCountsEnabled: isPreviewDynamicTermCountsEnabled(
        props.mainBuilderData
      ),
      facetCounts: previewFacetCounts ?? earlyFacetCounts,
    }),
    [props.mainBuilderData, previewFacetCounts, earlyFacetCounts]
  );
  const previewContainerRef = useRef(null);
  const initialTagsSyncedRef = useRef(false);
  // const [emptySearchInput ,setEmptySearchInput] = useState(false)

  useLayoutEffect(() => {
    const container = previewContainerRef.current;
    if (!container) {
      return;
    }
    const scopeDocument = container.ownerDocument;
    const onPreviewInteraction = (event) => {
      const resetModuleClicked = event.target?.closest?.(
        ".caf-builder-template-preview-filter .caf-module-reset"
      );
      if (resetModuleClicked) {
        event.preventDefault();
        event.stopPropagation();
        runPreviewFilterReset(scopeDocument, selectedFilter);
        scopeDocument.dispatchEvent(new CustomEvent("caf-preview-filter-refresh"));
        return;
      }
      handlePreviewSelectedTagClose(event, scopeDocument, selectedFilter);
    };
    scopeDocument.addEventListener("click", onPreviewInteraction, true);
    return () => {
      scopeDocument.removeEventListener("click", onPreviewInteraction, true);
    };
  }, [
    selectedFilter,
    selectedFilter?.settings?.is_enable,
    selectedFilter?.settings?.close_button,
    props.deviceType,
  ]);

  useEffect(() => {
    if (selectedFilter?.settings?.is_enable !== "true") {
      return;
    }
    if (!checkboxDomLoad && !dropdownDomLoad && !filterModuleDomLoad) {
      return;
    }

    const scopeDocument =
      previewContainerRef.current?.ownerDocument || document;
    const syncTimers = [
      window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedFilter), 0),
      window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedFilter), 400),
    ];

    if (!initialTagsSyncedRef.current) {
      syncTimers.push(
        window.setTimeout(() => syncPreviewSelectedTags(scopeDocument, selectedFilter), 4000)
      );
      initialTagsSyncedRef.current = true;
    }

    return () => {
      syncTimers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [
    checkboxDomLoad,
    dropdownDomLoad,
    filterModuleDomLoad,
    selectedFilter?.settings?.is_enable,
    selectedFilter?.settings?.close_button,
  ]);

  useEffect(() => {
    const position = resolveFilterPosition(
      getFloatDeviceFallbackValue(
        resolvePreviewTemplateDataFromBuilderData(props.mainBuilderData)
          ?.misc_preview_data?.extra,
        props.deviceType,
        "filterPosition"
      )
    );

    if (position !== "floating") {
      setIsFilterOpen(false);
    }
  }, [props.mainBuilderData, props.deviceType]);


  const postLayouts = () => {
    switch (selectedPostLayout) {
      case "grid":
        return (
          <Grid
            mainBuilderData={props.mainBuilderData}
            currPage={currPage}
            setPage={setPage}
            updateCurrentPage={updateCurrentPage}
            deviceType={props.deviceType}
            orderBy={orderBy}
            orderType={orderType}
            setCheckLoading={setCheckLoading}
            setCountRes={setCountRes}
            checkboxDomLoad={checkboxDomLoad}
            dropdownDomLoad={dropdownDomLoad}
            filterModuleDomLoad={filterModuleDomLoad}
            onPreviewFacetCountsUpdate={setPreviewFacetCounts}
            // emptySearchInput={emptySearchInput}
          />
        );
      default:
        return (
          <Grid
            mainBuilderData={props.mainBuilderData}
            currPage={currPage}
            setPage={setPage}
            deviceType={props.deviceType}
            updateCurrentPage={updateCurrentPage}
            orderBy={orderBy}
            orderType={orderType}
            setCheckLoading={setCheckLoading}
            setCountRes={setCountRes}
            checkboxDomLoad={checkboxDomLoad}
            dropdownDomLoad={dropdownDomLoad}
            filterModuleDomLoad={filterModuleDomLoad}
            onPreviewFacetCountsUpdate={setPreviewFacetCounts}
            // emptySearchInput={emptySearchInput}
          />
        );
    }
  };

  const selectedLayout = postLayouts();

  /*============================================== Start Font Family Linking =========================================================*/

  /* Start Filter Builder Font Family*/
  let filterInitialdata = Array.isArray(
    props.mainBuilderData?.filter_layout_data?.initial_data
  )
    ? props.mainBuilderData.filter_layout_data.initial_data
    : [];
  let postInitialdata = Array.isArray(
    props.mainBuilderData?.post_layout_data?.initial_data
  )
    ? props.mainBuilderData.post_layout_data.initial_data
    : [];
  const toggleFilter = () => {
    setIsFilterOpen(prev => !prev);
  };
  const loadFont = (fontFamily) => {
    if (!document.getElementById(fontFamily) && fontFamily) {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css?family=${fontFamily}:regular&display=swap`;
      link.async = true;
      link.id = fontFamily;
      link.type = "text/css";
      link.rel = "stylesheet";
      document.body.appendChild(link);
    }
  };
  {
    /* Start For Row */
    filterInitialdata?.map((row, rowindex) => {
      if (row?.style?.desktop?.default?.fontFamily) {
        loadFont(row?.style?.desktop?.default?.fontFamily);
      }
      if (row?.style?.desktop?.hover?.fontFamily) {
        loadFont(row?.style?.desktop?.hover?.fontFamily);
      }
      if (row?.style?.tablet?.default?.fontFamily) {
        loadFont(row?.style?.tablet?.default?.fontFamily);
      }
      if (row?.style?.tablet?.hover?.fontFamily) {
        loadFont(row?.style?.tablet?.hover?.fontFamily);
      }
      if (row?.style?.mobile?.default?.fontFamily) {
        loadFont(row?.style?.mobile?.default?.fontFamily);
      }
      if (row?.style?.mobile?.hover?.fontFamily) {
        loadFont(row?.style?.mobile?.hover?.fontFamily);
      }
      /* Start For Column */
      row.data?.map((column, columnindex) => {
        if (column?.style?.desktop?.default?.fontFamily) {
          loadFont(column?.style?.desktop?.default?.fontFamily);
        }
        if (column?.style?.desktop?.hover?.fontFamily) {
          loadFont(column?.style?.desktop?.hover?.fontFamily);
        }
        if (column?.style?.tablet?.default?.fontFamily) {
          loadFont(column?.style?.tablet?.default?.fontFamily);
        }
        if (column?.style?.tablet?.hover?.fontFamily) {
          loadFont(column?.style?.tablet?.hover?.fontFamily);
        }
        if (column?.style?.mobile?.default?.fontFamily) {
          loadFont(column?.style?.mobile?.default?.fontFamily);
        }
        if (column?.style?.mobile?.hover?.fontFamily) {
          loadFont(column?.style?.mobile?.hover?.fontFamily);
        }
        /* Start For Module */
        column.data?.map((module, moduleindex) => {
          /*Start for container*/

          if (module?.style?.container?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.container?.desktop?.default?.fontFamily);
          }
          if (module?.style?.container?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.container?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.container?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.container?.tablet?.default?.fontFamily);
          }
          if (module?.style?.container?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.container?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.container?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.default?.fontFamily);
          }
          if (module?.style?.container?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.hover?.fontFamily);
          }
          /* start for header*/

          if (module?.style?.header?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.header?.desktop?.default?.fontFamily);
          }
          if (module?.style?.header?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.header?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.header?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.header?.tablet?.default?.fontFamily);
          }
          if (module?.style?.header?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.header?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.header?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.header?.mobile?.default?.fontFamily);
          }
          if (module?.style?.header?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.header?.mobile?.hover?.fontFamily);
          }

          /* start for meta*/

          if (module?.style?.meta?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.meta?.desktop?.default?.fontFamily);
          }
          if (module?.style?.meta?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.meta?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.meta?.tablet?.default?.fontFamily);
          }
          if (module?.style?.meta?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.meta?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.meta?.mobile?.default?.fontFamily);
          }
          if (module?.style?.meta?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.mobile?.hover?.fontFamily);
          }

          /* start for input */

          if (module?.style?.input?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.input?.desktop?.default?.fontFamily);
          }
          if (module?.style?.input?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.input?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.input?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.input?.tablet?.default?.fontFamily);
          }
          if (module?.style?.input?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.input?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.input?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.input?.mobile?.default?.fontFamily);
          }
          if (module?.style?.input?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.input?.mobile?.hover?.fontFamily);
          }
        });
      });
    });
  }
  /* End Filter Builder Font Family*/

  /* Start Post Builder Font Family*/
  {
    /* Start For Row */
    postInitialdata?.map((row, rowindex) => {
      if (row?.style?.desktop?.default?.fontFamily) {
        loadFont(row?.style?.desktop?.default?.fontFamily);
      }
      if (row?.style?.desktop?.hover?.fontFamily) {
        loadFont(row?.style?.desktop?.hover?.fontFamily);
      }
      if (row?.style?.tablet?.default?.fontFamily) {
        loadFont(row?.style?.tablet?.default?.fontFamily);
      }
      if (row?.style?.tablet?.hover?.fontFamily) {
        loadFont(row?.style?.tablet?.hover?.fontFamily);
      }
      if (row?.style?.mobile?.default?.fontFamily) {
        loadFont(row?.style?.mobile?.default?.fontFamily);
      }
      if (row?.style?.mobile?.hover?.fontFamily) {
        loadFont(row?.style?.mobile?.hover?.fontFamily);
      }
      /* Start For Column */
      row.data?.map((column, columnindex) => {
        if (column?.style?.desktop?.default?.fontFamily) {
          loadFont(column?.style?.desktop?.default?.fontFamily);
        }
        if (column?.style?.desktop?.hover?.fontFamily) {
          loadFont(column?.style?.desktop?.hover?.fontFamily);
        }
        if (column?.style?.tablet?.default?.fontFamily) {
          loadFont(column?.style?.tablet?.default?.fontFamily);
        }
        if (column?.style?.tablet?.hover?.fontFamily) {
          loadFont(column?.style?.tablet?.hover?.fontFamily);
        }
        if (column?.style?.mobile?.default?.fontFamily) {
          loadFont(column?.style?.mobile?.default?.fontFamily);
        }
        if (column?.style?.mobile?.hover?.fontFamily) {
          loadFont(column?.style?.mobile?.hover?.fontFamily);
        }
        /* Start For Module */
        column.data?.map((module, moduleindex) => {
          /*Start for container*/

          if (module?.style?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.desktop?.default?.fontFamily);
          }
          if (module?.style?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.tablet?.default?.fontFamily);
          }
          if (module?.style?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.default?.fontFamily);
          }
          if (module?.style?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.container?.mobile?.hover?.fontFamily);
          }

          /* start for custom field label */

          if (module?.style?.label?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.label?.desktop?.default?.fontFamily);
          }
          if (module?.style?.label?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.label?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.label?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.label?.tablet?.default?.fontFamily);
          }
          if (module?.style?.label?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.label?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.label?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.label?.mobile?.default?.fontFamily);
          }
          if (module?.style?.label?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.label?.mobile?.hover?.fontFamily);
          }

          /*start for custom field  meta*/

          if (module?.style?.meta?.desktop?.default?.fontFamily) {
            loadFont(module?.style?.meta?.desktop?.default?.fontFamily);
          }
          if (module?.style?.meta?.desktop?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.desktop?.hover?.fontFamily);
          }
          if (module?.style?.meta?.tablet?.default?.fontFamily) {
            loadFont(module?.style?.meta?.tablet?.default?.fontFamily);
          }
          if (module?.style?.meta?.tablet?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.tablet?.hover?.fontFamily);
          }
          if (module?.style?.meta?.mobile?.default?.fontFamily) {
            loadFont(module?.style?.meta?.mobile?.default?.fontFamily);
          }
          if (module?.style?.meta?.mobile?.hover?.fontFamily) {
            loadFont(module?.style?.meta?.mobile?.hover?.fontFamily);
          }
        });
      });
    });
  }
  /* End Post Builder Font Family*/
  /*============================================== End Font Family Linking =========================================================*/

  const renderColItems = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return null;

    return dataArray.map((item) => (
      <>
        {item.key === "sorting" &&
          resolveDndMiscItemEnabled(item) &&
          !isHiddenOnDevice(item?.settings, props.deviceType) && (
          <>
            <Sorting
              sortingData={item}
              deviceType={props.deviceType}
              setOrderBy={setOrderBy}
              setOrderType={setOrderType}
              extraDataSaved={extraDataSaved}
            />
          </>
        )}
        {item.key === "result_count" &&
          resolveDndMiscItemEnabled(item) &&
          !isHiddenOnDevice(item?.settings, props.deviceType) && (
          <>
            <ResultCount
              resultCountData={item}
              deviceType={props.deviceType}
              countRes={countRes}
            />
          </>
        )}
        {item.key === "selected" &&
          resolveDndMiscItemEnabled(item) &&
          !isHiddenOnDevice(item?.settings, props.deviceType) && (
          <>
            <SelectedTag
              selectedFilterData={item}
              deviceType={props.deviceType}
            />
          </>
        )}
        {item.key === "pagination" &&
          resolveDndMiscItemEnabled(item) &&
          !isHiddenOnDevice(item?.settings, props.deviceType) && (
          <>
            <Pagination
              mainBuilderData={props.mainBuilderData}
              updatedBuilderData={props.updatedBuilderData}
              deviceType={props.deviceType}
              currPage={currPage}
              setCurrPage={updateCurrentPage}
              page={page}
              paginationData={item}
            />
          </>
        )}

      </>
    ));
  };

const renderMiscZoneWrapper = (zone, className, deviceType, children, forceRender = false) => {
  if (!shouldRenderMiscZoneWrapper(zone, deviceType, isHiddenOnDevice, forceRender)) {
    return null;
  }
  return (
    <div
      className={`${className} ${zone?.settings?.custom_class || ""}`}
    >
      {children}
    </div>
  );
};

const buildMiscZoneWrapperCss = (zone, selector, deviceType, forceRender = false) => {
  if (!shouldRenderMiscZoneWrapper(zone, deviceType, isHiddenOnDevice, forceRender)) {
    return "";
  }
  return `
    ${selector} {
      ${generateFilterWrapperPreviewCSS(deviceType, "default", zone)}
    }
    ${selector}:hover {
      ${generateFilterWrapperPreviewCSS(deviceType, "hover", zone)}
    }
  `;
};

let buttonContent;

const floatButton = getFloatDeviceFallbackValue(miscPreviewExtraData, props.deviceType, 'floatButton');
const floatIcon = getFloatDeviceFallbackValue(miscPreviewExtraData, props.deviceType, 'floatIcon');
const floatButtonValue = getFloatDeviceFallbackValue(miscPreviewExtraData, props.deviceType, 'floatButtonValue');
const floatIconValue = getFloatDeviceFallbackValue(miscPreviewExtraData, props.deviceType, 'floatIconValue');

if (floatButton && !floatIcon) {
  buttonContent = floatButtonValue;

} else if (floatButton && floatIcon) {
  buttonContent = (
    <>
      <i className={floatIconValue}></i>
      {floatButtonValue}
    </>
  );

} else {
  buttonContent = (
    <i className={floatIconValue}></i>
  );
}

const filterPosition = resolveFilterPosition(
  getFloatDeviceFallbackValue(
    miscPreviewExtraData,
    props.deviceType,
    "filterPosition"
  )
);
const isFloatingFilter = filterPosition === "floating";
const isFloatingPanelOpen = isFloatingFilter && isFilterOpen;

 // console.log(filterPreviewData, miscPreviewData);
// if (
//   !miscPreviewExtraData?.[props?.deviceType]?.floatIcon
// ) {
//   buttonContent =
//     miscPreviewExtraData?.[props?.deviceType]?.floatButtonValue;
// } else if (
//   miscPreviewExtraData?.[props?.deviceType]?.floatButton &&
//   miscPreviewExtraData?.[props?.deviceType]?.floatIcon
// ) {
//   buttonContent = (
//     <>
//       <i
//         className={
//           miscPreviewExtraData?.[props?.deviceType]?.floatIconValue
//         }
//       ></i>
//       {miscPreviewExtraData?.[props?.deviceType]?.floatButtonValue}
//     </>
//   );
// } else {
//   buttonContent = (
//     <i
//       className={
//         miscPreviewExtraData?.[props?.deviceType]?.floatIconValue
//       }
//     ></i>
//   );
// }
 // console.log(filterPreviewData, miscPreviewData);
  return (
    <>
      <div className={`caf-builder-filter-post-overlay ${isFloatingPanelOpen ? "filter-open" : ""}`} style={{
        backgroundColor:
           getFloatDeviceFallbackValue(miscPreviewExtraData, props?.deviceType,"overlay") ?? "rgba(32, 31, 31, 0.624)"
      }}></div>
      <PreviewFacetCountsContext.Provider value={previewFacetCountsContextValue}>
      <div
        ref={previewContainerRef}
        className={`caf-builder-preview-template-container ${
          props?.deviceType === "mobile" && !props?.withDeviceFrame
            ? "caf-mobile-preview-wrapper"
            : props?.deviceType === "tablet" && !props?.withDeviceFrame
            ? "caf-tablet-preview-wrapper"
            : ""
        } ${miscPreviewData.container.custom_class ?? ""} ${filterPosition} `}
      >
        {resolveFilterTypeFromBuilderData(props.mainBuilderData) === "true" && (
        <>
        {isFloatingFilter && (
          <>
            <div className="caf-builder-template-preview-filter-floating">
              <button onClick={toggleFilter} className="caf-filter-slide-button">
                {buttonContent}
              </button>
              <style>
                {`
              .caf-builder-template-preview-filter-floating button.caf-filter-slide-button {${generateFilterWrapperPreviewCSS(props.deviceType, "default", miscPreviewData['meta'])}
              }
            
          `}
              </style>
            </div>
          </>
        )}

            <div
              className={`caf-builder-template-preview-filter ${filterPreviewData.custom_class ?? ""
                } ${isFloatingFilter ? (isFilterOpen ? "filter-open" : "filter-close") : "filter-open"} ${getFloatDeviceFallbackValue(miscPreviewExtraData, props?.deviceType,'animationType')}`}
            >
              {renderMiscZoneWrapper(
                dndColData?.[0],
                "caf-builder-template-preview-filter-top-wrapper",
                props.deviceType,
                <>
                  {renderColItems(dndColData?.[0]?.data)}
                  {isFloatingPanelOpen && (
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="caf-builder-filter-close"
                    >
                      X
                    </button>
                  )}
                </>,
                isFloatingPanelOpen
              )}

              <FilterPreview
                mainBuilderData={props.mainBuilderData}
                updatedBuilderData={props.updatedBuilderData}
                deviceType={props.deviceType}
                isDragDisabled={true}
                selectType={props.selectType}
                currStep={props.currStep}
                setCheckboxDomLoad={setCheckboxDomLoad}
                setDropdownDomLoad={setDropdownDomLoad}
                setFilterModuleDomLoad={setFilterModuleDomLoad}
                // emptySearchInput={emptySearchInput}
                // setEmptySearchInput={setEmptySearchInput}
              ></FilterPreview>

              {renderMiscZoneWrapper(
                dndColData?.[1],
                "caf-builder-template-preview-filter-bottom-wrapper",
                props.deviceType,
                renderColItems(dndColData?.[1]?.data)
              )}

              <style>
                {`
              .caf-builder-template-preview-filter {${generateFilterWrapperPreviewCSS(props.deviceType, "default", filterPreviewData)}}
              .caf-builder-template-preview-filter:hover{${generateFilterWrapperPreviewCSS(props.deviceType, "hover", filterPreviewData)}}
              ${buildMiscZoneWrapperCss(
                dndColData?.[0],
                ".caf-builder-template-preview-filter .caf-builder-template-preview-filter-top-wrapper",
                props.deviceType,
                isFloatingPanelOpen
              )}
              ${buildMiscZoneWrapperCss(
                dndColData?.[1],
                ".caf-builder-template-preview-filter .caf-builder-template-preview-filter-bottom-wrapper",
                props.deviceType
              )}
              `}
              </style>
            </div>
            </>
          )}
        <div
          className={`caf-builder-template-preview-post ${postPreviewData?.custom_class ?? ""
            }`}
        >
          {/* 
        <div className="caf-builder-template-preview-post-top-wrapper">
          {renderColItems(dndColData?.[2]?.data)}
        </div> */}

          {renderMiscZoneWrapper(
            dndColData?.[2],
            "caf-builder-template-preview-post-top-wrapper",
            props.deviceType,
            renderColItems(dndColData?.[2]?.data)
          )}
          {loaderData?.is_enable === "true" &&
            !isHiddenOnDevice(loaderData?.settings, props.deviceType) && (
              <Loader
                loaderData={loaderData}
                deviceType={props.deviceType}
                checkLoading={checkLoading}
                isDesignPreview={
                  props.selectedTab === "misc-layout" &&
                  props.selectedModule === "loader"
                }
              />
            )}
          {/* {selectedFilter.is_enable === "true" && (
          <SelectedTag
            selectedFilterData={selectedFilter}
            deviceType={props.deviceType}
          />
        )}
        {resultCount?.is_enable === "true" && (
          <ResultCount
            resultCountData={resultCount}
            deviceType={props.deviceType}
            countRes={countRes}
          />
        )}
        {sorting.is_enable === "true" && (
          <Sorting
            sortingData={sorting}
            deviceType={props.deviceType}
            setOrderBy={setOrderBy}
            setOrderType={setOrderType}
          />
        )} */}


          {selectedLayout}
          {/* {pagination.is_enable === "true" && (
          <Pagination
            mainBuilderData={props.mainBuilderData}
            updatedBuilderData={props.updatedBuilderData}
            deviceType={props.deviceType}
            currPage={currPage}
            setCurrPage={updateCurrentPage}
            page={page}
          />
        )} */}

          {/* <div className="caf-builder-template-preview-post-bottom-wrapper">
          {renderColItems(dndColData?.[3]?.data)}
        </div> */}
          {renderMiscZoneWrapper(
            dndColData?.[3],
            "caf-builder-template-preview-post-bottom-wrapper",
            props.deviceType,
            renderColItems(dndColData?.[3]?.data)
          )}
          <style>
            {`
              .caf-builder-template-preview-post{
                ${generatePostPreviewCSS(
              props.deviceType,
              "default",
              postPreviewData,
              selectedPostLayout
            )}
              }
              .caf-builder-template-preview-post:hover{ 
                 ${generatePostPreviewCSS(
              props.deviceType,
              "hover",
              postPreviewData,
              selectedPostLayout
            )}
              }
              ${buildMiscZoneWrapperCss(
                dndColData?.[2],
                ".caf-builder-template-preview-post .caf-builder-template-preview-post-top-wrapper",
                props.deviceType
              )}
              ${buildMiscZoneWrapperCss(
                dndColData?.[3],
                ".caf-builder-template-preview-post .caf-builder-template-preview-post-bottom-wrapper",
                props.deviceType
              )}
          `}
          </style>
        </div>
        <style>
          {`
              .caf-builder-preview-template-container {
                ${generateMiscContainerCSS(
            miscPreviewData.container?.style,
            props.deviceType,
            "default"
          )}
              }
              .caf-builder-preview-template-container:hover{ 
                ${generateMiscContainerCSS(
            miscPreviewData.container?.style,
            props.deviceType,
            "hover"
          )}
              }
              `}
        </style>
        <style id="caf-builder-preview-template-container-custom-css">
          {miscPreviewData?.container?.custom_css}
        </style>
      </div>
      </PreviewFacetCountsContext.Provider>
    </>
  );
}
export default PreviewTemplate;
