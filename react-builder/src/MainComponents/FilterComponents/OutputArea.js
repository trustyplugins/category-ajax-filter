import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModuleErrorBoundary from "../../components/ModuleErrorBoundary";
import { getModuleErrorBoundaryResetKey } from "../../utils/moduleErrorBoundaryUtils";
import ModuleSearch from "./components/modules-output/ModuleSearch";
import ModuleReset from "./components/modules-output/ModuleReset";
import ModuleCustomTextFilter from "./components/modules-output/ModuleCustomTextFilter";
import CheckboxFilter from "./components/modules-output/CheckboxFilter";
import DropdownFilter from "./components/modules-output/DropdownFilter";
import RangeSliderFilter from "./components/modules-output/RangeSliderFilter";
import WooFilterOutput from "./components/modules-output/WooFilterOutput";
import { isWooFilterModuleKey } from "./components/woocommerce/wooFilterModuleTemplates";
import { generateFilterRowColCSS } from "../utils/functions"
import { normalizeColorPickerValue, getColorPickerModes } from "../utils/colorPicker";
import { ColorPicker, Skeleton } from "antd";
import cloneDeep from "lodash/cloneDeep";
import {
  ArrowsAltOutlined,
  QuestionCircleOutlined,
  ShrinkOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  EyeInvisibleFilled,
  EyeFilled
} from "@ant-design/icons";
import { Col, Input, Row, Slider, Select, Space } from "antd";
import { resolvePostExtraDataFromBuilderData, resolvePostTypeFromBuilderData } from "../utils/builderDataAdapters";
import { layoutIndexEquals } from "../utils/layoutIndexes";
import { selectFilterExtraData } from "../../store/selectors";
import { setExtraData as setFilterBuilderExtraData } from "../../store/filterBuilderSlice";
import DevicePreviewIframe from "../PreviewComponents/DevicePreviewIframe";
import MobilePreviewFrameIcon from "../MobilePreviewFrameIcon";
import tabletFrame from "../images/tablet.svg";
import { resolveBuilderPreviewDevice } from "../utils/builderPreviewDevice";
import { canUseFilterModule } from "../../tier/capabilities";
import { TierLockedWrap } from "../../tier/TierLockedWrap";
import useBuilderFacetCounts from "../PreviewComponents/postPreview/useBuilderFacetCounts";
import { isPreviewDynamicTermCountsEnabled } from "../PreviewComponents/postPreview/previewFacetCounts";
import { PreviewFacetCountsContext } from "../PreviewComponents/postPreview/previewFacetCountsContext";
const { Option } = Select;
const OutputArea = (props) => {
  const dispatch = useDispatch();
  const reduxExtraData = useSelector(selectFilterExtraData);
  const filterExtraBase =
    Object.keys(reduxExtraData || {}).length > 0
      ? { ...reduxExtraData }
      : { ...props.mainBuilderData.filter_layout_data.extra_data };
  /**
   * Use `mainBuilderData.filter_layout_data.initial_data` only. FilterBuilder passes
   * `previewMainBuilderData` with live rows/terms; Redux `updatedInitialData` is not
   * updated on each settings change, so preferring Redux kept preview out of sync.
   */
  const propInitialData =
    props.mainBuilderData?.filter_layout_data?.initial_data;
  const initialdata = Array.isArray(propInitialData) ? propInitialData : [];
  const [colorHex, setColorHex] = useState(filterExtraBase?.bg_color);
  const [mainBuilderData, setMainBuilderData] = useState(props.mainBuilderData);
  const prevMainBuilderData = useRef(cloneDeep(mainBuilderData));
  const [fullScreen, setFullScreen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [previewState, setPreviewState] = useState("1");
  const [suffix, setSuffix] = useState(
    filterExtraBase?.footerSlider?.suffix ?? "%"
  );
  const [previewWidth, setPreviewWidth] = useState(
    filterExtraBase?.footerSlider?.value ?? "20"
  );
  const [desktopPreviewWidth, setDesktopPreviewWidth] = useState(
    filterExtraBase?.footerSlider?.value ?? "20"
  );
  const [desktopPreviewSuffix, setDesktopPreviewSuffix] = useState(
    filterExtraBase?.footerSlider?.suffix ?? "%"
  );
  const desktopPreviewWidthRef = useRef(filterExtraBase?.footerSlider?.value ?? "20");
  const desktopPreviewSuffixRef = useRef(filterExtraBase?.footerSlider?.suffix ?? "%");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [selectedDevice, setSelectedDevice] = useState(() =>
    resolveBuilderPreviewDevice(props.mainBuilderData)
  );
  const isCompactDevice = selectedDevice === "mobile" || selectedDevice === "tablet";
  const effectivePreviewWidth = isCompactDevice ? "100" : previewWidth;
  const effectiveSuffix = isCompactDevice ? "%" : suffix;
  const [postExtraData, setPostExtraData] = useState(
    resolvePostExtraDataFromBuilderData(props.mainBuilderData)
  );
  const [isInside, setIsInside] = useState(false);
  // Live (canonical) term counts so show_count never displays stale
  // layout-baked snapshots in the filter builder canvas.
  const liveFacetCounts = useBuilderFacetCounts(props.mainBuilderData);
  const facetCountsContextValue = useMemo(
    () => ({
      dynamicTermCountsEnabled: isPreviewDynamicTermCountsEnabled(
        props.mainBuilderData
      ),
      facetCounts: liveFacetCounts,
    }),
    [props.mainBuilderData, liveFacetCounts]
  );
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.filter_layout_data) nextBuilder.filter_layout_data = {};
    if (!nextBuilder.common_data) nextBuilder.common_data = {};
    if (!nextBuilder.filter_layout_data.extra_data) {
      nextBuilder.filter_layout_data.extra_data = {};
    }
    if (!nextBuilder.filter_layout_data.extra_data.footerSlider) {
      nextBuilder.filter_layout_data.extra_data.footerSlider = {};
    }
    mutator(nextBuilder);
    props.updatedBuilderData(nextBuilder);
    const ex = nextBuilder.filter_layout_data?.extra_data;
    if (ex && typeof ex === "object") {
      dispatch(setFilterBuilderExtraData(structuredClone(ex)));
    }
  };

  const setColorHexFun = (value) => {
    const hex = normalizeColorPickerValue(value);
    setColorHex(hex);
    commitBuilderPatch((nextBuilder) => {
      nextBuilder.filter_layout_data.extra_data.bg_color = hex;
    });
  };
  const handleFullScreenChange = () => {
    setFullScreen(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  };
  useEffect(() => {
    setPostExtraData(resolvePostExtraDataFromBuilderData(props.mainBuilderData));
  }, [props.mainBuilderData]);

  useEffect(() => {
    const next =
      Object.keys(reduxExtraData || {}).length > 0
        ? reduxExtraData
        : props.mainBuilderData.filter_layout_data.extra_data;
    setColorHex(next?.bg_color);
    setSuffix(next?.footerSlider?.suffix ?? "%");
    setPreviewWidth(next?.footerSlider?.value ?? "20");
  }, [reduxExtraData, props.mainBuilderData]);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullScreenChange
      );
    };
  }, []);
  useEffect(() => {
    setMainBuilderData(props.mainBuilderData);
  }, [props.mainBuilderData]);
  const handleFullScreen = () => {
    var elem = document.documentElement;

    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      // Document is not in fullscreen mode, request fullscreen.
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
      }
    } else {
      // Document is in fullscreen mode, exit fullscreen.
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
    }
  };
  const onSelectChange = (val) => {
    if (isCompactDevice) return;
    setSuffix(val);
    setDesktopPreviewSuffix(val);
    desktopPreviewSuffixRef.current = val;
    commitBuilderPatch((nextBuilder) => {
      nextBuilder.filter_layout_data.extra_data.footerSlider.suffix = val;
    });
  };
  const onChangeSlider = (val) => {
    if (isCompactDevice) return;
    setPreviewWidth(val);
    setDesktopPreviewWidth(val);
    desktopPreviewWidthRef.current = val;
    commitBuilderPatch((nextBuilder) => {
      nextBuilder.filter_layout_data.extra_data.footerSlider.value = val;
    });
  };
  const onChangeNumber = (e) => {
    if (isCompactDevice) return;
    setPreviewWidth(e.target.value);
    setDesktopPreviewWidth(e.target.value);
    desktopPreviewWidthRef.current = e.target.value;
    commitBuilderPatch((nextBuilder) => {
      nextBuilder.filter_layout_data.extra_data.footerSlider.value = e.target.value;
    });
  };
  const selectAfter = (
    <Select
      defaultValue={suffix}
      onChange={onSelectChange}
      value={effectiveSuffix}
      disabled={isCompactDevice}
      options={[
        {
          value: "px",
          label: "PX",
        },
        {
          value: "%",
          label: "%",
        },
      ]}
    />
  );
  const handleDeviceChange = (val) => {
    if (val === "desktop") {
      const restoredWidth = desktopPreviewWidthRef.current ?? desktopPreviewWidth;
      const restoredSuffix = desktopPreviewSuffixRef.current ?? desktopPreviewSuffix;
      setSelectedDevice(val);
      setPreviewWidth(restoredWidth);
      setSuffix(restoredSuffix);
      setDesktopPreviewWidth(restoredWidth);
      setDesktopPreviewSuffix(restoredSuffix);
      props.setSelectedDevice(val);
      commitBuilderPatch((nextBuilder) => {
        nextBuilder.common_data.builder_preview_device = val;
        nextBuilder.filter_layout_data.extra_data.footerSlider.value = restoredWidth;
        nextBuilder.filter_layout_data.extra_data.footerSlider.suffix = restoredSuffix;
      });
      return;
    }
    if (selectedDevice === "desktop") {
      desktopPreviewWidthRef.current = previewWidth;
      desktopPreviewSuffixRef.current = suffix;
      setDesktopPreviewWidth(previewWidth);
      setDesktopPreviewSuffix(suffix);
    }
    setSelectedDevice(val);
    props.setSelectedDevice(val);
    commitBuilderPatch((nextBuilder) => {
      nextBuilder.common_data.builder_preview_device = val;
    });
  };
  window.onresize = function () {
    setScreenWidth(window.innerWidth);
  };

  const onEyeClick = (val) => {
    setPreviewState(val);
    props.previewState(val);
  }

  const handleBack = () => {
    props.setSelectType("");
    props.setCurrStep("0");
  }

  const handleNext = () => {
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.filter_layout_data.breadcrumb_data) {
        nextBuilder.filter_layout_data.breadcrumb_data = {};
      }
      nextBuilder.filter_layout_data.breadcrumb_data.select_builder = "true";
    });
    if (postExtraData?.layout_source === 'caf_builder') {
      props.setSelectType("post");
      props.setCurrStep("2");
    } else {
      // Other (Elementor / Main Query): no CAF Layout Settings step.
      props.setCurrStep("0");
      props.setSelectType("");
    }
  }

  const filterBuilderPreview = (
    <div
      className={`caf-builder-post-preview ${selectedDevice === "mobile"
          ? "caf-mobile-post-view-wrapper"
          : selectedDevice === "tablet"
            ? "caf-tablet-post-view-wrapper"
            : ""
        }`}
      style={{
        width: `${effectivePreviewWidth}${effectiveSuffix}`,
      }}
    >
      {initialdata.length == 0 ? (
        <>
          <Skeleton active />
          <Skeleton active />
        </>
      ) : (
        ""
      )}
      {initialdata.map((row, rowindex) => {
        const rowStyle = row.style;
        const row_custom_class = row.settings?.custom_class;
        const rowVisibility = row?.settings?.visibility || {};
        const hideRowClass =
          rowVisibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
        return (
          <div
            className={`caf-builder-row-main caf-row-${rowindex} ${hideRowClass} ${row_custom_class || ""
              } ${props?.indexes.type === "row" &&
                layoutIndexEquals(props?.indexes.rowindex, rowindex)
                ? "active"
                : ""
              }`}
            key={rowindex}
          >
            {row.data.map((column, columnindex) => {
              const columnStyle = column.style;
              const col_custom_class = column.settings?.custom_class;
              const colVisibility = column?.settings?.visibility || {};
              const hideColClass =
                colVisibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
              return (
                <div
                  className={`caf-builder-column-main caf-column-${columnindex} ${hideColClass} ${col_custom_class || ""
                    } ${props?.indexes.type === "column" &&
                      layoutIndexEquals(props?.indexes.rowindex, rowindex) &&
                      layoutIndexEquals(props?.indexes.columnindex, columnindex)
                      ? "active"
                      : ""
                    }`}
                  key={columnindex}
                >
                  {column.data?.map((module, moduleindex) => {
                    const moduleStyle = module.style;
                    const moduleSettings = module.settings;
                    return (
                      <ModuleErrorBoundary
                        key={`${rowindex}-${columnindex}-${moduleindex}`}
                        moduleKey={module.key}
                        moduleLabel={module.title || module.key}
                        resetKey={getModuleErrorBoundaryResetKey(
                          rowindex,
                          columnindex,
                          moduleindex,
                          module.key
                        )}
                      >
                        {module.key === "checkbox_filter" ? (
                          <CheckboxFilter
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            selectedDevice={selectedDevice}
                            onSettingChange={props.updatedBuilderData}
                            initialdata={initialdata}
                            mainBuilderData={props.mainBuilderData}
                            isDragDisabled={props.isDragDisabled}
                            setIndexes={props.setIndexes}
                            indexes={props?.indexes}
                            selectType={props.selectType}
                            currStep={props.currStep}
                          />
                        ) : module.key == "dropdown_filter" ? (
                          <DropdownFilter
                            postData={props.postData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            selectedDevice={selectedDevice}
                            onSettingChange={props.updatedBuilderData}
                            initialdata={initialdata}
                            mainBuilderData={props.mainBuilderData}
                            isDragDisabled={props.isDragDisabled}
                            setIndexes={props.setIndexes}
                            indexes={props?.indexes}
                            selectType={props.selectType}
                            currStep={props.currStep}
                          />
                        ) : module.key == "range_slider" ? (
                          canUseFilterModule("range_slider", {
                            postType: resolvePostTypeFromBuilderData(
                              props.mainBuilderData
                            ),
                          }) ? (
                          <RangeSliderFilter
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            selectedDevice={selectedDevice}
                            setIndexes={props.setIndexes}
                            indexes={props?.indexes}
                            mainBuilderData={props.mainBuilderData}
                          />
                          ) : (
                            <TierLockedWrap
                              locked
                              className="caf-builder-tier-locked-module-preview caf-module-range_slider"
                              upgradeMessage="On Free, Range Slider is available only for WooCommerce Product layouts. Upgrade to Pro for custom-field ranges on any post type."
                              showProBadge
                            >
                              <div
                                className={`caf-builder-module-main caf-module-${module.key} caf-module-${moduleindex} caf-builder-filter`}
                                onClick={() =>
                                  props.setIndexes &&
                                  props.setIndexes({
                                    type: "module",
                                    rowindex,
                                    columnindex,
                                    moduleindex,
                                    module,
                                  })
                                }
                              >
                                <div className="caf-range-slider-locked-preview">
                                  Range Slider
                                </div>
                              </div>
                            </TierLockedWrap>
                          )
                        ) : isWooFilterModuleKey(module.key) ? (
                          canUseFilterModule(module.key) ? (
                            <WooFilterOutput
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                              setIndexes={props.setIndexes}
                              indexes={props?.indexes}
                              mainBuilderData={props.mainBuilderData}
                            />
                          ) : null
                        ) : module.key == "search" ? (
                          <ModuleSearch
                            postData={props.postData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            selectedDevice={selectedDevice}
                            setIndexes={props.setIndexes}
                            indexes={props?.indexes}
                            mainBuilderData={props.mainBuilderData}
                          />
                        ) : module.key == "reset" ? (
                          <ModuleReset
                            postData={props.postData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            selectedDevice={selectedDevice}
                            setIndexes={props.setIndexes}
                            indexes={props?.indexes}
                          />
                        ) : module.key === "customtext" ? (
                          <ModuleCustomTextFilter
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            selectedDevice={selectedDevice}
                            setIndexes={props.setIndexes}
                            indexes={props?.indexes}
                          />
                        ) : (
                          module.title
                        )}
                      </ModuleErrorBoundary>
                    );
                  })}
                  <style>
                    {`
                      .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex}{
                        ${generateFilterRowColCSS(columnStyle, "default", selectedDevice)}
                      }
                      .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex}:hover{
                        ${generateFilterRowColCSS(columnStyle, "hover", selectedDevice)}
                      }
                      `}
                  </style>
                </div>
              );
            })}
            <style>
              {`
                .caf-bl-filter .caf-row-${rowindex}{
                  ${generateFilterRowColCSS(rowStyle, "default", selectedDevice)}
                }
                .caf-bl-filter .caf-row-${rowindex}:hover{
                  ${generateFilterRowColCSS(rowStyle, "hover", selectedDevice)}
                }
              `}
            </style>
          </div>
        );
      })}
      {(props.customCSS || props.onExtraData) && (
        <style id={"custom-css"}>{props.customCSS || props.onExtraData}</style>
      )}
    </div>
  );

  return (
    <PreviewFacetCountsContext.Provider value={facetCountsContextValue}>
    <div
      className={`caf-builder-mainarea caf-bl-filter ${isInside ? "inside-active" : "outside-active"
        }`}
      style={{ background: colorHex }}
      onMouseEnter={() => setIsInside(true)}
      onMouseLeave={() => setIsInside(false)}
    >
      <svg aria-hidden="true" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotPattern-filter" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1" fill="var(--dot-color, #e0e0e0)"></circle>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern-filter)"></rect>
      </svg>
      <div
        className={`caf-builder-post-preview-wrapper${isCompactDevice ? " caf-device-frame-stage" : ""
          }`}
      >
        {selectedDevice === "mobile" ? (
          <div className="caf-mobile-preview-frame-shell">
            <MobilePreviewFrameIcon alt="Mobile preview frame" />
            <div className="caf-mobile-preview-frame-screen caf-filter-builder-preview-frame-screen">
              <DevicePreviewIframe
                iframeClassName="caf-mobile-preview-iframe"
                bodyClassName="caf-mobile-preview-iframe-body caf-filter-builder-preview-iframe-body"
                rootId="caf-filter-builder-mobile-preview-iframe-root"
                title="Filter builder mobile preview"
              >
                <div className="caf-bl-filter">{filterBuilderPreview}</div>
              </DevicePreviewIframe>
            </div>
          </div>
        ) : selectedDevice === "tablet" ? (
          <div className="caf-tablet-preview-portrait-wrap">
            <div className="caf-tablet-preview-portrait-inner">
              <img
                src={tabletFrame}
                alt=""
                className="caf-tablet-preview-frame-image-portrait"
              />
              <div className="caf-tablet-preview-frame-screen-portrait caf-filter-builder-preview-frame-screen">
                <DevicePreviewIframe
                  iframeClassName="caf-tablet-preview-iframe"
                  bodyClassName="caf-tablet-preview-iframe-body caf-filter-builder-preview-iframe-body"
                  rootId="caf-filter-builder-tablet-preview-iframe-root"
                  title="Filter builder tablet preview"
                >
                  <div className="caf-bl-filter">{filterBuilderPreview}</div>
                </DevicePreviewIframe>
              </div>
            </div>
          </div>
        ) : (
          filterBuilderPreview
        )}
      </div>
      <div className="caf-builder-mainarea-footer-bar">
        <div className="manage-footer-bar">
          <div className="caf-builder-footer-back-btn" onClick={handleBack}>Back</div>
          <div className="caf-builder-footer-center-box">
            <div className="caf-builder-footer-device-section">
              <Select
                value={selectedDevice}
                style={{
                  width: 65,
                }}
                onChange={handleDeviceChange}
                options={[
                  {
                    value: "desktop",
                    label: <DesktopOutlined />,
                  },
                  {
                    value: "tablet",
                    label: <TabletOutlined />,
                  },
                  {
                    value: "mobile",
                    label: <MobileOutlined />,
                  },
                ]}
              />
            </div>
            <div className="caf-builder-footer-slider-section">
              <Slider
                value={parseInt(effectivePreviewWidth)}
                disabled={isCompactDevice}
                onChange={onChangeSlider}
              />
              <Space.Compact
                style={{
                  margin: "0 0px 0 10px",
                }}
              >
                <Input
                  value={parseInt(effectivePreviewWidth)}
                  onChange={onChangeNumber}
                  type="number"
                  disabled={isCompactDevice}
                />
                {selectAfter}
              </Space.Compact>
              <ColorPicker
                className="footer-bg-color"
                value={colorHex}
                mode={getColorPickerModes()}
                onChange={setColorHexFun}
                placement="top"
              />
              {previewState == "1" ? (
                <EyeFilled className="eye-icon" onClick={() => onEyeClick('0')} />
              ) : (
                <EyeInvisibleFilled className="eye-icon" onClick={() => onEyeClick('1')} />
              )}
            </div>
          </div>
          <div className="caf-builder-footer-next-btn" onClick={handleNext}>Next</div>

        </div>
      </div>
    </div>
    </PreviewFacetCountsContext.Provider>
  );
};

export default OutputArea;
