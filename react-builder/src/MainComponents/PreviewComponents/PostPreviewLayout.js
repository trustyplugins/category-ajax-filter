import React, { useState, useEffect } from "react";
import PostGridIcon from "./PostGridIcon";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Draggable from "react-draggable";
import SettingPopUp from "./postPreview/SettingPopUp";
import PreviewTemplate from "./postPreview/PreviewTemplate";
import leftFilter from "../images/left-filter.png";
import rightFilter from "../images/right-filter.png";
import topFilter from "../images/top-filter.png";
import bottomFilter from "../images/bottom-filter.png";
import MobilePreviewFrameIcon from "../MobilePreviewFrameIcon";
import tabletFrame from "../images/tablet.svg";
import selectedIcon from "../images/selected-icon.png";
import PreviewFooter from "./postPreview/PreviewFooter";
import DraggableColumn from "./postPreview/MiscComponents/DraggableColumn";
import {
  resolveFilterTypeFromBuilderData,
  resolvePreviewFilterPlacementFromBuilderData,
  resolvePreviewPostLayoutTypeFromBuilderData,
  resolvePreviewTemplateDataFromBuilderData,
} from "../utils/builderDataAdapters";
import DevicePreviewIframe from "./DevicePreviewIframe";
import { resolveBuilderPreviewDevice } from "../utils/builderPreviewDevice";
import { getDefaultLayoutControlsSelectedItem, getFreeLayoutControlsSelectedItem } from "./postPreview/shared/previewSettingsTier";

function PostPreviewLayout(props) {
  //console.log(props);
  const [deviceType, setDeviceType] = useState(() =>
    resolveBuilderPreviewDevice(props.mainBuilderData)
  );
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  const previewLayoutType = resolvePreviewPostLayoutTypeFromBuilderData(
    props.mainBuilderData
  );
  const [selectFilter, setSelectFilter] = useState(
    resolvePreviewFilterPlacementFromBuilderData(props.mainBuilderData)
  );
  const [selectLayout, setSelectLayout] = useState(previewLayoutType);
  const filterStatus = resolveFilterTypeFromBuilderData(props.mainBuilderData);
  let miscPreviewData = {
    ...previewTemplateData.misc_preview_data,
  };
  const dndColData = miscPreviewData?.dnd_column_data;

  const [selectedItem, setSelectedItem] = useState(() =>
    getDefaultLayoutControlsSelectedItem(dndColData, filterStatus)
  );
  const [selectMisc, setSelectMisc] = useState("container");
  const [selectedTab, setSelectedTab] = useState("post-layout");
  const [selectedModule, setSelectedModule] = useState(previewLayoutType);
  const FilterPlacements = [
    { key: "top", value: topFilter },
    { key: "bottom", value: bottomFilter },
    { key: "left", value: leftFilter },
    { key: "right", value: rightFilter },
  ];
  const layouts = [
    {
      key: "grid",
      title: "Post Grid",
    },
  ];
  useEffect(() => {
    setSelectLayout(resolvePreviewPostLayoutTypeFromBuilderData(props.mainBuilderData));
  }, [props.mainBuilderData]);
  useEffect(() => {
    setDeviceType(resolveBuilderPreviewDevice(props.mainBuilderData));
  }, [props.mainBuilderData]);
  // useEffect(()=>{
  //   if(selectedTab =='post-layout'){
  //     setSelectedModule(selectLayout)
  //   }
  // },[selectLayout])

  const [layoutBounds, setlayoutBounds] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const [bounds, setBounds] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const [collapse, setCollapse] = useState(false);
  const [checkColorPicker, setCheckColorPicker] = useState(false);
  const [draggingDisabled, setDraggingDisabled] = useState(false);
  const [draggingState, setDraggingState] = useState(false);
  const calculateLayoutBounds = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setlayoutBounds({
      left: 0,
      right: width - 335,
      top: 0,
      bottom: height - 120,
    });
  };
  const calculateBounds = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setBounds({
      left: -width + 335,
      right: 0,
      top: 0,
      bottom: height - 120,
    });
  };
  const [popupCollapse, setPopupCollapse] = useState("1");
  const [rightPopupCollapse, setRightPopupCollapse] = useState(false);
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    mutator(nextBuilder);
    props.updatedBuilderData(nextBuilder);
  };
  useEffect(() => {
    setDraggingState(checkColorPicker);
  }, [checkColorPicker]);

  useEffect(() => {
    setDraggingState(draggingDisabled);
  }, [draggingDisabled]);

  useEffect(() => {
    calculateLayoutBounds();
    window.addEventListener("resize", calculateLayoutBounds);
    return () => window.removeEventListener("resize", calculateLayoutBounds);
  }, []);

  useEffect(() => {
    calculateBounds();
    window.addEventListener("resize", calculateBounds);
    return () => window.removeEventListener("resize", calculateBounds);
  }, []);

  const handleExpand = () => {
    setCollapse((prev) => !prev);
    setPopupCollapse("0");
  };
  const changeDeviceType = (type) => {
    setDeviceType(type);
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) {
        nextBuilder.common_data = {};
      }
      nextBuilder.common_data.builder_preview_device = type;
    });
  };
  const handleTabChange = (val) => {
    setSelectedTab(val);
    if (val === "misc-layout") {
      setSelectMisc("container");
      setSelectedModule("container");
      const freeDefault = getFreeLayoutControlsSelectedItem(
        dndColData,
        filterStatus
      );
      if (freeDefault) {
        setSelectedItem(freeDefault);
      }
    }
    if (val === "post-layout") {
      setSelectedModule(selectLayout);
    }
    if (val === "filter-layout") {
      setSelectedModule(selectFilter);
    }
  };
  const handleSelectFilter = (key) => {
    setSelectFilter(key);
    setSelectedModule(key);
    let filterWidth = "25%";
    let postWidth = "75%";
    if (key === "top" || key === "bottom") {
      filterWidth = "100%";
      postWidth = "100%";
    } else if (key === "right" || key === "left") {
      filterWidth = "25%";
      postWidth = "75%";
    }
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) {
        nextBuilder.common_data = {};
      }
      const previewData =
        nextBuilder?.common_data?.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const filterPreview =
        previewData.filter_preview_data ||
        (previewData.filter_preview_data = {});
      filterPreview.filter_placement = key;
      const filterStyle = filterPreview.style || (filterPreview.style = {});
      const filterDevice = filterStyle[deviceType] || (filterStyle[deviceType] = {});
      const filterDefault = filterDevice.default || (filterDevice.default = {});
      filterDefault.width = filterWidth;

      const postPreview =
        previewData.post_preview_data || (previewData.post_preview_data = {});
      const selectedLayoutData =
        postPreview[selectLayout] || (postPreview[selectLayout] = {});
      const selectedStyle =
        selectedLayoutData.style || (selectedLayoutData.style = {});
      const selectedDeviceStyle =
        selectedStyle[deviceType] || (selectedStyle[deviceType] = {});
      const selectedDefault =
        selectedDeviceStyle.default || (selectedDeviceStyle.default = {});
      selectedDefault.width = postWidth;
    });
  };
  const renderLayoutIcon = (layoutKey) => {
    if (layoutKey === "grid") {
      return (
        <PostGridIcon className="post-preview-caf-post-select-module-pop-up-img" />
      );
    }
    return null;
  };
  const onSelectLayout = (val) => {
    setSelectLayout(val);
    setSelectedModule(val);
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) {
        nextBuilder.common_data = {};
      }
      const previewData =
        nextBuilder?.common_data?.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const postPreview =
        previewData.post_preview_data || (previewData.post_preview_data = {});
      postPreview.layout_type = val;
    });
  };
  const onSelectMisc = (val) => {
    setSelectMisc(val);
    setSelectedModule(val);
  };
  const updateCollapse = (res) => {
    if (res === true) {
      setPopupCollapse("1");
    } else {
      setPopupCollapse("0");
    }
    setCollapse(res);
    setRightPopupCollapse(res);
  };
  const rightUpdateCollapse = (res) => {
    if (res === true) {
      setPopupCollapse("1");
    } else {
      setPopupCollapse("0");
    }
    setRightPopupCollapse(res);
  };
  const isDeviceFrameView = deviceType === "mobile" || deviceType === "tablet";
  //console.log(selectedItem)
  return (
    <div className="caf-builder-template-preview-main-container">
      <Draggable bounds={layoutBounds} handle=".caf-main-layout-content-section.layout-preview .post-preview-setting-popup-title-bar">
        <div className="caf-builder-template-preview-dragable-popup-left">
          <div className="post-preview-setting-popup-overlay-wrapper new-module">
            <div className="post-preview-setting-popup">
              <div className="post-preview-setting-popup-title-bar">
                <h5>Layout Settings</h5>
                <div
                  className="post-preview-closeSettingPop"
                  onClick={() => handleExpand()}
                >
                  <FontAwesomeIcon
                    icon={collapse ? faChevronDown : faChevronUp}
                    color="white"
                    size="1x"
                  />
                </div>
              </div>
              <div
                style={{ display: !collapse ? "block" : "none" }}
                className="post-preview-new-modules-container"
              >
                <div className="layout-preview-caf-tab-section">
                  <div
                    className={`setting-popup-tab post-layout ${
                      selectedTab === "post-layout" ? " active" : ""
                    }`}
                    onClick={() => handleTabChange("post-layout")}
                  >
                    Choose Layout
                  </div>
                  <div
                    className={`setting-popup-tab content ${
                      selectedTab === "misc-layout" ? " active" : ""
                    }`}
                    onClick={() => handleTabChange("misc-layout")}
                  >
                    Layout Controls
                  </div>
                  {/* <div
                    className={`setting-popup-tab filter-layout ${
                      selectedTab === "filter-layout" ? " active" : ""
                    }`}
                    onClick={() => handleTabChange("filter-layout")}
                  >
                    Filter
                  </div> */}
                </div>
                {selectedTab === "misc-layout" && (
                  <div className="caf-preview-dnd-column-main-container">
                    <DraggableColumn 
                    setSelectedItem={setSelectedItem}
                      mainBuilderData={props.mainBuilderData}
                      updatedBuilderData={props.updatedBuilderData}
                    />
                  </div>
                  // <ul className="post-preview-caf-misc-layouts-items">
                  //   <li
                  //     className={`post-preview-caf-post-select-misc-module-pop-up ${
                  //       selectMisc === "container" ? "active" : ""
                  //     }`}
                  //     onClick={() => onSelectMisc("container")}
                  //   >
                  //     <img src={containerIcon} className="misc-item-icon" alt=''/>
                  //     Container
                  //     {selectMisc === "container" ? <img src={selectedIcon} className="selected-icon" alt=''/> : ""}
                  //   </li>
                  //   <li
                  //     className={`post-preview-caf-post-select-misc-module-pop-up ${
                  //       selectMisc === "sorting" ? "active" : ""
                  //     }`}
                  //     onClick={() => onSelectMisc("sorting")}
                  //   >
                  //     <img src={sortingIcon} className="misc-item-icon" alt=''/>
                  //     Sorting
                  //     {selectMisc === "sorting" ? <img src={selectedIcon} className="selected-icon" alt=''/> : ""}
                  //   </li>
                  //   <li
                  //     className={`post-preview-caf-post-select-misc-module-pop-up ${
                  //       selectMisc === "selected_filter" ? "active" : ""
                  //     }`}
                  //     onClick={() => onSelectMisc("selected_filter")}
                  //   >
                  //     <img src={selectedTagIcon} className="misc-item-icon" alt=''/>
                  //     Selected Filter
                  //     {selectMisc === "selected_filter" ? <img src={selectedIcon} className="selected-icon" alt=''/> : ""}
                  //   </li>
                  //   <li
                  //     className={`post-preview-caf-post-select-misc-module-pop-up ${
                  //       selectMisc === "pagination" ? "active" : ""
                  //     }`}
                  //     onClick={() => onSelectMisc("pagination")}
                  //   >
                  //     <img src={paginationIcon} className="misc-item-icon" alt=''/>
                  //     Pagination
                  //     {selectMisc === "pagination" ? <img src={selectedIcon} className="selected-icon" alt=''/> : ""}
                  //   </li>
                  //   <li
                  //     className={`post-preview-caf-post-select-misc-module-pop-up ${
                  //       selectMisc === "result_count" ? "active" : ""
                  //     }`}
                  //     onClick={() => onSelectMisc("result_count")}
                  //   >
                  //     <img src={counterIcon} className="misc-item-icon" alt=''/>
                  //     Result Count
                  //     {selectMisc === "result_count" ? <img src={selectedIcon} className="selected-icon" alt=''/> : ""}
                  //   </li>
                  //   <li
                  //     className={`post-preview-caf-post-select-misc-module-pop-up ${
                  //       selectMisc === "loader" ? "active" : ""
                  //     }`}
                  //     onClick={() => onSelectMisc("loader")}
                  //   >
                  //     <img src={loaderIcon} className="misc-item-icon" alt=''/>
                  //     Loader
                  //     {selectMisc === "loader" ? <img src={selectedIcon} className="selected-icon" alt=''/> : ""}
                  //   </li>
                  // </ul>
                )}




                {selectedTab === "post-layout" && (
                  <div className="post-preview-caf-post-layouts-section">
                    <ul className="post-preview-caf-post-layouts-items">
                      {layouts.map((item) => (
                        <li
                          key={item.key}
                          className={`post-preview-caf-post-select-module-pop-up ${
                            selectLayout === item.key ? "active" : ""
                          }`}
                          onClick={() => onSelectLayout(item.key)}
                        >
                          {renderLayoutIcon(item.key)}
                          <span className="post-preview-caf-post-layout-title">
                            {item.title}
                          </span>
                          {selectLayout === item.key ? (
                            <img
                              src={selectedIcon}
                              className="selected-post-icon"
                              alt=""
                            />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


                {selectedTab === "filter-layout" && (
                  <>
                    {resolveFilterTypeFromBuilderData(props.mainBuilderData) === "true" && (
                      <div className="module-content-tab-row filter-placement">
                        <div className="caf-select-filter-preview-label">
                          <label>Filter Placements</label>
                        </div>
                        <div className="caf-post-preview-general-filter-img">
                          {FilterPlacements.map((item, id) => (
                            <div onClick={() => handleSelectFilter(item.key)}>
                              <img
                                className={`${
                                  selectFilter === item.key ? "active" : ""
                                }`}
                                src={item.value}
                                alt="img"
                              />
                              {selectFilter === item.key && (
                                <img src={selectedIcon} alt="img" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}


                
              </div>
            </div>
          </div>
        </div>
      </Draggable>

      <div
        className={`caf-preview-template-stage ${
          isDeviceFrameView ? "caf-device-frame-stage" : ""
        }`}
      >
        {deviceType === "mobile" ? (
          <div className="caf-mobile-preview-frame-shell">
            <MobilePreviewFrameIcon alt="Mobile Frame" />
            <div className="caf-mobile-preview-frame-screen">
              <DevicePreviewIframe
                iframeClassName="caf-mobile-preview-iframe"
                bodyClassName="caf-mobile-preview-iframe-body"
                rootId="caf-mobile-preview-iframe-root"
                title="Mobile Preview Frame"
              >
                <PreviewTemplate
                  mainBuilderData={props.mainBuilderData}
                  updatedBuilderData={props.updatedBuilderData}
                  deviceType={deviceType}
                  selectedTab={selectedTab}
                  selectedModule={selectedModule}
                  selectType={props.selectType}
                  currStep={props.currStep}
                  withDeviceFrame
                />
              </DevicePreviewIframe>
            </div>
          </div>
        ) : deviceType === "tablet" ? (
          <div className="caf-tablet-preview-portrait-wrap">
            <div className="caf-tablet-preview-portrait-inner">
              <img
                src={tabletFrame}
                alt="Tablet Frame"
                className="caf-tablet-preview-frame-image-portrait"
              />
              <div className="caf-tablet-preview-frame-screen-portrait">
                <DevicePreviewIframe
                  iframeClassName="caf-tablet-preview-iframe"
                  bodyClassName="caf-tablet-preview-iframe-body"
                  rootId="caf-tablet-preview-iframe-root"
                  title="Tablet Preview Frame"
                >
                  <PreviewTemplate
                    mainBuilderData={props.mainBuilderData}
                    updatedBuilderData={props.updatedBuilderData}
                    deviceType={deviceType}
                    selectedTab={selectedTab}
                    selectedModule={selectedModule}
                    selectType={props.selectType}
                    currStep={props.currStep}
                    withDeviceFrame
                  />
                </DevicePreviewIframe>
              </div>
            </div>
          </div>
        ) : (
          <PreviewTemplate
            mainBuilderData={props.mainBuilderData}
            updatedBuilderData={props.updatedBuilderData}
            deviceType={deviceType}
            selectedTab={selectedTab}
            selectedModule={selectedModule}
            selectType={props.selectType}
            currStep={props.currStep}
          />
        )}
      </div>
      <Draggable bounds={bounds} disabled={draggingState} handle=".caf-main-layout-content-section.layout-preview .setting-popup-title-bar">
        <div className="caf-builder-template-preview-dragable-popup-right">
          <SettingPopUp
            mainBuilderData={props.mainBuilderData}
            updatedBuilderData={props.updatedBuilderData}
            // setCheckColorPicker={setCheckColorPicker}
            // checkColorPicker={checkColorPicker}
            // setDraggingDisabled={setDraggingDisabled}
            deviceType={deviceType}
            selectedTab={selectedTab}
            selectedModule={selectedModule}
            updateCollapse={rightUpdateCollapse}
            popupCollapse={rightPopupCollapse}
            selectedItemDnd = {selectedItem}
          />
        </div>
      </Draggable>
      <PreviewFooter
        mainBuilderData={props.mainBuilderData}
        updatedBuilderData={props.updatedBuilderData}
        deviceType={deviceType}
        changeDeviceType={changeDeviceType}
        updateCollapse={updateCollapse}
        popupCollapse={popupCollapse}
        setSelectType={props.setSelectType}
        setCurrStep={props.setCurrStep}
      />
    </div>
  );
}

export default PostPreviewLayout;
