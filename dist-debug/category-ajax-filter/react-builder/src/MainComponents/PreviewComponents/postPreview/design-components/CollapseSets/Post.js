import React, { useState, useEffect } from "react";
import {
  Tabs,
  Skeleton,
  Collapse,
  Switch,
  Row,
  Col,
  Tooltip,
  Segmented,
} from "antd";
import SliderMain from "../common-component/SliderMain";
import SelectMain from "../common-component/SelectMain";
import ColorMain from "../common-component/ColorMain";
import AlignMain from "../common-component/AlignMain";
import BorderMain from "../common-component/BorderMain";
import BoxShadow from "../common-component/BoxShadow";
import InputMain from "../common-component/InputMain";
import TextMain from "../common-component/TextMain";
import InputMain2 from "../../GeneralComponents/CommonComponents/InputMain";
import SelectMain2 from "../../GeneralComponents/CommonComponents/SelectMain";
import SwitchMain2 from "../../GeneralComponents/CommonComponents/SwitchMain";
import CodeEditor from "../../GeneralComponents/CodeEditor";
import apiClient from "../../../../../api/client";
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  CaretDownOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import wrapdownicon from "../../../../images/flex/wrap-down.svg";
import wrapupicon from "../../../../images/flex/wrap-up.svg";
import singlerowicon from "../../../../images/flex/single-row.svg";
import wrapdown2icon from "../../../../images/flex/wrap-down2.svg";
import wrapup2icon from "../../../../images/flex/wrap-up.svg";
import wraprighticon from "../../../../images/flex/wrap-right.svg";
import wraplefticon from "../../../../images/flex/wrap-left.svg";
import singlecolumnicon from "../../../../images/flex/single-column.svg";
import wrapright2icon from "../../../../images/flex/wrap-right2.svg";
import wrapleft2icon from "../../../../images/flex/wrap-left2.svg";
import { resolvePreviewTemplateDataFromBuilderData ,resolveFilterTypeFromBuilderData} from "../../../../utils/builderDataAdapters";
import { resolveFilterPosition, canUseScrollToContainer, resolveScrollDeviceSettings } from "../../shared/previewSettingsTier";
import { TierLockedWrap } from "../../../../../tier/TierLockedWrap";
import {resolvePropertyForPreViewDesignTab,buildFlexAlignOptions} from "./previewDesignTabDerivedState"
import { collapseMainContentClass } from "../../../../utils/collapseMainContentClass";
import { PreviewDesignTabInnerTabs } from "../common-component/PreviewDesignTabInnerTabs";
const Post = (props) => {
  const site_url = tc_caf_ajax.plugin_path;
  const baseUrl = site_url + "admin/google-fonts.json";
  const [loaderTab, setLoaderTab] = useState("icon");
  const [hoverSwitchText, setHoverSwitchText] = useState(false);
  const [fontFamilyArray, setFontFamilyArray] = useState("");
  const [hoverSwitchSpacing, setHoverSwitchSpacing] = useState(false);
  const [hoverSwitchPosition, setHoverSwitchPosition] = useState(false);
  const [hoverSwitchBg, setHoverSwitchBg] = useState(false);
  const [hoverSwitchAl, setHoverSwitchAl] = useState(false);
  const [hoverSwitchBr, setHoverSwitchBr] = useState(false);
  const [hoverSwitchBs, setHoverSwitchBs] = useState(false);
  const [hoverValue, setHoverValue] = useState(
    "Hover an option to see direction and wrap values.",
  );
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [selectedTab, setSelectedTab] = useState(props?.tab === "advanced" ? "filter" : "container");
  const [activeCollapseKey, setActiveCollapseKey] = useState([]);
  const [activeCollapsePanelKey, setActiveCollapsePanelKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCollapsePanelOpen = (panelKey) => activeCollapsePanelKey === panelKey;

  // Independent joint toggles
  const [isMarginVerticalJoint, setIsMarginVerticalJoint] = useState(false);
  const [isMarginHorizontalJoint, setIsMarginHorizontalJoint] = useState(false);
  const [isPaddingVerticalJoint, setIsPaddingVerticalJoint] = useState(false);
  const [isPaddingHorizontalJoint, setIsPaddingHorizontalJoint] =
    useState(false);
  const toggleMarginVerticalJoint = () =>
    setIsMarginVerticalJoint((prev) => !prev);
  const toggleMarginHorizontalJoint = () =>
    setIsMarginHorizontalJoint((prev) => !prev);
  const togglePaddingVerticalJoint = () =>
    setIsPaddingVerticalJoint((prev) => !prev);
  const togglePaddingHorizontalJoint = () =>
    setIsPaddingHorizontalJoint((prev) => !prev);

  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  const filterStatus = resolveFilterTypeFromBuilderData(props.mainBuilderData);
  let postPreviewData = previewTemplateData?.post_preview_data;
  let filterPreviewData = previewTemplateData?.filter_preview_data;
  let miscPreviewData = previewTemplateData?.misc_preview_data;
  const commitPreviewPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data) {
      nextBuilder.common_data.preview_template_data = {};
    }
    const previewTemplate = nextBuilder.common_data.preview_template_data;
    if (!previewTemplate.post_preview_data) {
      previewTemplate.post_preview_data = {};
    }
    if (!previewTemplate.filter_preview_data) {
      previewTemplate.filter_preview_data = {};
    }
    if (!previewTemplate.misc_preview_data) {
      previewTemplate.misc_preview_data = {};
    }
    mutator(previewTemplate);
    props.postPreviewStyle(nextBuilder);
  };
  let device = props?.deviceSwitch;
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await apiClient.get(baseUrl);
        if (response?.data?.items) {
          setFontFamilyArray(response.data.items);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchFonts();
  }, []);

  useEffect(() => {
    setHoverSwitchText(false);
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
  }, [props.deviceSwitch]);

  useEffect(() => {
    setLoadingMeta(true);
    setActiveCollapsePanelKey(null);
    //setActiveCollapseKey([]);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500); 
  }, [selectedTab]);

  const onHoverSwitchText = (checked) => {
    setHoverSwitchText((checked) => !checked);
  };
  const onHoverSwitchSpacing = (checked) => {
    setHoverSwitchSpacing((checked) => !checked);
  };
  const onHoverSwitchPosition = (checked) => {
    setHoverSwitchPosition((checked) => !checked);
  };
  const onHoverSwitchBg = (checked) => {
    setHoverSwitchBg((checked) => !checked);
  };
  const onHoverSwitchAl = (checked) => {
    setHoverSwitchAl((checked) => !checked);
  };
  const onHoverSwitchBr = (checked) => {
    setHoverSwitchBr((checked) => !checked);
  };
  const onHoverSwitchBs = (checked) => {
    setHoverSwitchBs((checked) => !checked);
  };

  let styleStateSpacing = "default";
  if (hoverSwitchSpacing) {
    styleStateSpacing = "hover";
  }
  let styleStatePosition = "default";
  if (hoverSwitchPosition) {
    styleStatePosition = "hover";
  }
  let styleStateBg = "default";
  if (hoverSwitchBg) {
    styleStateBg = "hover";
  }
  let styleStateAl = "default";
  if (hoverSwitchAl) {
    styleStateAl = "hover";
  }
  let styleStateBr = "default";
  if (hoverSwitchBr) {
    styleStateBr = "hover";
  }
  let styleStateBs = "default";
  if (hoverSwitchBs) {
    styleStateBs = "hover";
  }

  const handleHover = (value) => {
    setHoverValue(value);
  };

  let flexFlow = resolvePropertyForPreViewDesignTab({
    data: miscPreviewData,
    styleTab: selectedTab === "container" ? "container" : "meta",
    device,
    styleState: styleStateAl,
    property: "flexFlow",
    
  });
  let { opt1, opt2 } = buildFlexAlignOptions(flexFlow);

  let displayProperty = resolvePropertyForPreViewDesignTab({
    data: miscPreviewData,
    styleTab: selectedTab === "container" ? "container" : "meta",
    device,
    styleState: styleStateAl,
    property: "display",
    
  });


  const handleSettingChange = (value) => {
    setSelectedTab(value);
    //setLoadingMeta(true);

    setHoverSwitchText(false);
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
    // setTimeout(() => {
    //   setLoadingMeta(false);
    // }, 500);
  };
  const handleAvancedSettingChange = (value) => {
    setSelectedTab(value);
    setLoadingMeta(true);
    setHoverSwitchPosition(false);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
  };
  const postPreviewStyle = (data) => {
    commitPreviewPatch((previewTemplate) => {
      previewTemplate.post_preview_data[props.selectedModule] = data;
    });
  };

  const postPreviewSettings = (data) => {
    commitPreviewPatch((previewTemplate) => {
      previewTemplate.post_preview_data = data;
    });
  };
  const filterPreviewStyle = (data) => {
    commitPreviewPatch((previewTemplate) => {
      previewTemplate.filter_preview_data = data;
    });
  };

  const updateMainPreviewStyle = (data, mkey) => {
    commitPreviewPatch((previewTemplate) => {
      previewTemplate.misc_preview_data[mkey] = data;
    });
  };
  const handleCollapseChange = (key) => {
    const nextKey = Array.isArray(key) ? key[0] : key;
    setActiveCollapsePanelKey(nextKey ?? null);
    if (!key || !Array.isArray(key) || key.length === 0) return;
    setLoadingMeta(true);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
  };
  const handleGridSettingTab = (value) => {
    setSelectedTab(value);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }
  const handleCollapseChangeAdv = (key) => {
    const nextKey = Array.isArray(key) ? key[0] : key;
    setActiveCollapsePanelKey(nextKey ?? null);
    if (!key || !Array.isArray(key) || key.length === 0) return;
    if (key == 1 && filterStatus === "true") {
      setSelectedTab("filter");
    } else {
      setSelectedTab("container");
    }
    setLoadingMeta(true);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
  };

const isAnyDeviceNotInline = (data, key) => {
  if (!data) return false;

  return ['desktop', 'tablet', 'mobile'].some(
    (device) => data?.[device]?.[key] && data?.[device]?.[key] !== 'inline'
  );
};
  const getDeviceFallbackValue = (data, device, key) => {
  if (!data) return undefined;

  if (device === "mobile") {
    return data?.mobile?.[key] ?? data?.desktop?.[key];
  }

  if (device === "tablet") {
    return data?.tablet?.[key] ?? data?.desktop?.[key];
  }
  // desktop
  return data?.desktop?.[key];
};

  const getResolvedFilterPosition = () =>
    resolveFilterPosition(
      getDeviceFallbackValue(
        miscPreviewData?.extra,
        props.deviceSwitch,
        "filterPosition"
      )
    );
  const isFilterInlineForDesign = () => getResolvedFilterPosition() === "inline";
  const isFloatingFilterPosition = () => getResolvedFilterPosition() === "floating";

  const activeScrollDevice = props?.deviceSwitch || "desktop";
  const scrollSettingsData = miscPreviewData?.container?.scroll || {};
  const scrollLocked = !canUseScrollToContainer();

  const getScrollFallbackValue = (device, key) =>
    resolveScrollDeviceSettings(scrollSettingsData, device)?.[key];

  const getScrollDisplaySlice = () => ({
    is_enable: getScrollFallbackValue(activeScrollDevice, "is_enable") ?? "false",
    position: String(getScrollFallbackValue(activeScrollDevice, "position") ?? "-100"),
  });

  const commitScrollDevicePatch = (patch) => {
    if (scrollLocked) {
      return;
    }
    const device =  props?.deviceSwitch || "desktop";
    commitPreviewPatch((previewTemplate) => {
      const misc = previewTemplate.misc_preview_data;
      if (!misc.container) {
        misc.container = {};
      }
      if (!misc.container.scroll) {
        misc.container.scroll = { desktop: {}, tablet: {}, mobile: {} };
      }
      if (
        !misc.container.scroll[device] ||
        typeof misc.container.scroll[device] !== "object"
      ) {
        misc.container.scroll[device] = {};
      }
      Object.assign(misc.container.scroll[device], patch);
    });
  };

  const handleScrollSwitchChange = (newData) => {
    commitScrollDevicePatch({
      is_enable: String(newData?.is_enable ?? "false"),
    });
  };

  const handleScrollPositionChange = (newData) => {
    commitScrollDevicePatch({
      position: String(newData?.position ?? "-100"),
    });
  };

  const scrollEnableDisplayValue = scrollLocked
    ? "false"
    : (getScrollFallbackValue(activeScrollDevice, "is_enable") ?? "false");
//console.log(filterPreviewData,miscPreviewData);
  let selectedTabItems = [
    {
      key: "container",
      label: "Outer Wrapper",
    },
    {
      key: "post",
      label: "Post Layout",
    },
    props.mainBuilderData?.filter_layout_data?.extra_data.filter_type === "true"
      ? {
        key: "filter",
        label: isFloatingFilterPosition() ? "Slide Panel" : "Filter",
      }
      : null,
  ].filter(Boolean);


  let gridLayoutTabItems = [
    {
      key: "container",
      label: "Container",
    },
    {
      key: "meta",
      label: "Float Button",
    },
  ].filter(Boolean);

//console.log(selectedTab);
  let AdvancedIems = [
    //1:positioning
    {
      key: "1",
      label: "Positioning",
      children: (
        <>
          {filterStatus === "true" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("1")}
              activeKey={selectedTab}
              onChange={(value) => handleAvancedSettingChange(value)}
              items={[{ key: "filter", label: isFilterInlineForDesign() ? "Filter" : "Float Button" }]}
              defaultActiveKey={selectedTab}
            />
          </div>
          )}
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("positioning")}>
              <SelectMain
                data={selectedTab === "container" ? miscPreviewData?.["container"] : selectedTab === "post"
                      ? postPreviewData[props.selectedModule] : selectedTab === "filter" && isFilterInlineForDesign() ? filterPreviewData : 
                      selectedTab === "filter" && !isFilterInlineForDesign() ? miscPreviewData['meta'] : ''
                }
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter" && isFilterInlineForDesign()
                        ? filterPreviewStyle
                        : updateMainPreviewStyle
                }
                property="position"
                defaultValue="relative"
                label="Position"
                styleState={styleStatePosition}
                deviceSwitch={props.deviceSwitch}
                options={[
                  {
                    value: "static",
                    label: "Static",
                  },
                  {
                    value: "relative",
                    label: "Relative",
                  },
                  {
                    value: "absolute",
                    label: "Absolute",
                  },
                  {
                    value: "inherit",
                    label: "Inherit",
                  },
                  {
                    value: "fixed",
                    label: "Fixed",
                  },
                ]}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : selectedTab === "filter" && !isFilterInlineForDesign()?'meta':''}
              />
              <InputMain
                data={selectedTab === "container" ? miscPreviewData?.["container"] : selectedTab === "post"
                ? postPreviewData[props.selectedModule] : selectedTab === "filter" && isFilterInlineForDesign() ? filterPreviewData : 
                selectedTab === "filter" && !isFilterInlineForDesign() ? miscPreviewData['meta'] : ''
          }
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter" && isFilterInlineForDesign()
                        ? filterPreviewStyle
                        : updateMainPreviewStyle
                }
                property="zIndex"
                defaultValue="999"
                label="Z Index"
                styleState={styleStatePosition}
                deviceSwitch={props.deviceSwitch}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : selectedTab === "filter" && !isFilterInlineForDesign()?'meta':''}
              />
              <div className='caf-position-spacing-look'>
                <Row>
                  <Col span={12}>
                    <SliderMain
                      data={selectedTab === "container" ? miscPreviewData?.["container"] : selectedTab === "post"
                      ? postPreviewData[props.selectedModule] : selectedTab === "filter" && isFilterInlineForDesign() ? filterPreviewData : 
                      selectedTab === "filter" && !isFilterInlineForDesign() ? miscPreviewData?.meta : ''
                }
                      onChangeStyle={
                        selectedTab === "container"
                          ? updateMainPreviewStyle
                          : selectedTab === "post"
                            ? postPreviewStyle
                            : selectedTab === "filter" && isFilterInlineForDesign()
                              ? filterPreviewStyle
                              : updateMainPreviewStyle
                      }
                      property="top"
                      label="Top"
                      defaultSuffix="px"
                      defaultValue="0"
                      styleState={styleStatePosition}
                      extraClass="colm2"
                      deviceSwitch={props.deviceSwitch}
                      style="style"
                      moduleKey={selectedTab === "container" ? "container" : ""}
                    />
                  </Col>
                  <Col span={12}>
                    <SliderMain
                      data={selectedTab === "container" ? miscPreviewData?.["container"] : selectedTab === "post"
                      ? postPreviewData[props.selectedModule] : selectedTab === "filter" && isFilterInlineForDesign() ? filterPreviewData : 
                      selectedTab === "filter" && !isFilterInlineForDesign() ? miscPreviewData?.meta : ''
                }
                      onChangeStyle={
                        selectedTab === "container"
                          ? updateMainPreviewStyle
                          : selectedTab === "post"
                            ? postPreviewStyle
                            : selectedTab === "filter" && isFilterInlineForDesign()
                              ? filterPreviewStyle
                              : updateMainPreviewStyle
                      }
                      property="right"
                      label="Right"
                      defaultSuffix="px"
                      defaultValue="0"
                      styleState={styleStatePosition}
                      extraClass="colm2"
                      deviceSwitch={props.deviceSwitch}
                      style="style"
                      moduleKey={selectedTab === "container" ? "container" : ""}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <SliderMain
                     data={selectedTab === "container" ? miscPreviewData?.["container"] : selectedTab === "post"
                     ? postPreviewData[props.selectedModule] : selectedTab === "filter" && isFilterInlineForDesign() ? filterPreviewData : 
                     selectedTab === "filter" && !isFilterInlineForDesign() ? miscPreviewData?.meta : ''
               }
                      onChangeStyle={
                        selectedTab === "container"
                          ? updateMainPreviewStyle
                          : selectedTab === "post"
                            ? postPreviewStyle
                            : selectedTab === "filter" && isFilterInlineForDesign()
                              ? filterPreviewStyle
                              : updateMainPreviewStyle
                      }
                      property="bottom"
                      label="Bottom"
                      defaultSuffix="px"
                      defaultValue="0"
                      styleState={styleStatePosition}
                      extraClass="colm2"
                      deviceSwitch={props.deviceSwitch}
                      style="style"
                      moduleKey={selectedTab === "container" ? "container" : ""}
                    />
                  </Col>
                  <Col span={12}>
                    <SliderMain
                      data={selectedTab === "container" ? miscPreviewData?.["container"] : selectedTab === "post"
                      ? postPreviewData[props.selectedModule] : selectedTab === "filter" && isFilterInlineForDesign() ? filterPreviewData : 
                      selectedTab === "filter" && !isFilterInlineForDesign() ? miscPreviewData?.meta : ''
                }
                      onChangeStyle={
                        selectedTab === "container"
                          ? updateMainPreviewStyle
                          : selectedTab === "post"
                            ? postPreviewStyle
                            : selectedTab === "filter" && isFilterInlineForDesign()
                              ? filterPreviewStyle
                              : updateMainPreviewStyle
                      }
                      property="left"
                      label="Left"
                      defaultSuffix="px"
                      defaultValue="0"
                      styleState={styleStatePosition}
                      extraClass="colm2"
                      deviceSwitch={props.deviceSwitch}
                      style="style"
                      moduleKey={selectedTab === "container" ? "container" : ""}
                    />
                  </Col>
                </Row>
              </div>
              <SelectMain
                data={selectedTab === "container" ? miscPreviewData?.["container"] : selectedTab === "post"
                ? postPreviewData[props.selectedModule] : selectedTab === "filter" && isFilterInlineForDesign() ? filterPreviewData : 
                selectedTab === "filter" && !isFilterInlineForDesign() ? miscPreviewData?.meta : ''
          }
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter" && isFilterInlineForDesign()
                        ? filterPreviewStyle
                        : updateMainPreviewStyle
                }
                property="overflow"
                defaultValue="inherit"
                label="Overflow"
                styleState={styleStatePosition}
                deviceSwitch={props.deviceSwitch}
                options={[
                  {
                    value: "auto",
                    label: "Auto",
                  },
                  {
                    value: "clip",
                    label: "Clip",
                  },
                  {
                    value: "hidden",
                    label: "Hidden",
                  },
                  {
                    value: "overlay",
                    label: "Overlay",
                  },
                  {
                    value: "scroll",
                    label: "Scroll",
                  },
                  {
                    value: "visible",
                    label: "Visible",
                  },
                  {
                    value: "inherit",
                    label: "Inherit",
                  },
                ]}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : ""}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: "Custom Class",
      children: (
        <>
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("2")}
              activeKey={selectedTab}
              onChange={(value) => handleAvancedSettingChange(value)}
              items={selectedTabItems}
              defaultActiveKey={selectedTab}
            />
          </div>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("custom-class")}>
              <InputMain2
                onChangeData={selectedTab === "container"
                  ? updateMainPreviewStyle
                  : selectedTab === "post"
                    ? postPreviewSettings
                    : selectedTab === "filter"
                      ? filterPreviewStyle
                      : ""
                }
                defaultValue=""
                data={
                  selectedTab === "container"
                    ? miscPreviewData?.["container"]
                    : selectedTab === "post"
                      ? postPreviewData
                      : selectedTab === "filter"
                        ? filterPreviewData
                        : ""
                }
                property="custom_class"
                label="Add Custom Class"
                placeholder="Add Custom Class"
                type="Text"
                moduleKey={selectedTab === "container" ? "container" : ""}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "3",
      label: "Custom Css",
      children: (
        <>
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("3")}
              activeKey={selectedTab}
              onChange={(value) => handleAvancedSettingChange(value)}
              items={[{ key: "container", label: "Container", }]}
              defaultActiveKey={selectedTab}
            />
          </div>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("custom-css", "code-editor-wrapper")}>
              <CodeEditor
                onChangeData={selectedTab === "container"
                  ? updateMainPreviewStyle
                  : selectedTab === "post"
                    ? postPreviewSettings
                    : selectedTab === "filter"
                      ? filterPreviewStyle
                      : ""
                }
                data={
                  selectedTab === "container"
                    ? miscPreviewData?.["container"]
                    : selectedTab === "post"
                      ? postPreviewData
                      : selectedTab === "filter"
                        ? filterPreviewData
                        : ""
                }
                property="custom_css"
                label="Add Custom Css"
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "4",
      label: "Scroll",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <>
              <div className="caf-builder-setting-row-label">
                <TierLockedWrap
                  locked={scrollLocked}
                  showProBadge
                  upgradeMessage="Scroll to container is available in Category Ajax Filter Pro."
                >
                  <SwitchMain2
                    key={`scroll-enable-${activeScrollDevice}`}
                    onChangeData={handleScrollSwitchChange}
                    checked=""
                    unchecked=""
                    data={getScrollDisplaySlice()}
                    property="is_enable"
                    label="Scroll To Container"
                  />

                  {scrollEnableDisplayValue === "true" && !scrollLocked && (
                    <InputMain2
                      key={`scroll-position-${activeScrollDevice}`}
                      onChangeData={handleScrollPositionChange}
                      defaultValue="-100"
                      data={getScrollDisplaySlice()}
                      property="position"
                      label="Scroll Position"
                      type="number"
                      extraClass="caf-design-two-half"
                    />
                  )}
                </TierLockedWrap>
              </div>
            </>
          )}
        </>
      ),
    },
    {
      key: "5",
      label: "Nonce",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <>
              <div className="caf-builder-setting-row-label">
                <SwitchMain2
                  onChangeData={selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewSettings
                      : selectedTab === "filter"
                        ? filterPreviewStyle
                        : ""
                  }
                  checked=""
                  unchecked=""
                  data={
                    selectedTab === "container"
                      ? miscPreviewData?.["container"]
                      : selectedTab === "post"
                        ? postPreviewData
                        : selectedTab === "filter"
                          ? filterPreviewData
                          : ""
                  }
                  property="nonce"
                  label="Enable Nonce"
                  moduleKey={selectedTab === "container" ? "container" : ""}
                />
              </div>

            </>
          )}
        </>
      ),
    },

  ];

  //console.log(miscPreviewData);
  let containerItems = [
    //0:Layout
    {
      key: "0",
      label: "Layout",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("layout", "webflow-sync")}>
              <>
                <AlignMain
                  data={miscPreviewData?.["container"]}
                  property="display"
                  label="Display"
                  defaultValue="flex"
                  onChangeStyle={updateMainPreviewStyle}
                  deviceSwitch={props.deviceSwitch}
                  styleState={styleStateAl}
                  style="style"
                  options={[
                    {
                      value: "block",
                      label: "Block",
                    },
                    {
                      value: "flex",
                      label: "Flex",
                    },
                  ]}
                  moduleKey="container"
                  isNewTab={true}
                />
                {displayProperty === "flex" && (
                <div className="webflow-custom-dropdown new-caf-look">
                  <AlignMain
                    data={miscPreviewData?.["container"]}
                    property="flexFlow"
                    label="Direction"
                    defaultValue="row"
                    onChangeStyle={updateMainPreviewStyle}
                    style="style"
                    styleState={styleStateAl}
                    deviceSwitch={props.deviceSwitch}
                    options={[
                      {
                        value: "row",
                        label: (
                          <Tooltip title="Horizontal">
                            <ArrowRightOutlined />
                          </Tooltip>
                        ),
                      },
                      {
                        value: "column",
                        label: (
                          <Tooltip title="Vertical">
                            <ArrowDownOutlined />
                          </Tooltip>
                        ),
                      },
                      {
                        value: 'row-reverse',
                        label: <Tooltip title="Row Reverse"><ArrowLeftOutlined /></Tooltip>,
                      },
                      {
                        value: 'column-reverse',
                        label: <Tooltip title="Column Reverse"><ArrowUpOutlined /></Tooltip>,
                      },
  
                    ]}
                    moduleKey="container"
                  />
                </div>
                )}
              </>
              {displayProperty === "flex" && (
                <>
              <div className="align-flex-flow">
                <span class="flex-flow-align-label">Align</span>
                <div
                  className={`flex-align-control ${flexFlow === "column wrap" ||
                    flexFlow === "column wrap-reverse"
                    ? "caf-reverse-me1"
                    : ""
                    }`}
                >
                  <SelectMain
                    data={miscPreviewData?.["container"]}
                    property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'alignItems' : "justifyContent"}`}
                    label={"X"}
                    defaultValue="flex-start"
                    onChangeStyle={updateMainPreviewStyle}
                    styleState={styleStateAl}
                    style="style"
                    deviceSwitch={props.deviceSwitch}
                    class={"align-x-flex"}
                    options={opt1}
                    moduleKey="container"
                  />
                  <SelectMain
                    data={miscPreviewData?.["container"]}
                    property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'justifyContent' : "alignItems"}`}
                    label={"Y"}
                    defaultValue="flex-start"
                    onChangeStyle={updateMainPreviewStyle}
                    styleState={styleStateAl}
                    style="style"
                    deviceSwitch={props.deviceSwitch}
                    class={"align-y-flex"}
                    options={opt2}
                    moduleKey="container"
                  />
                </div>
              </div>
              <div className="webflow-slider webflow-gap-slider">
                <SliderMain
                  data={miscPreviewData?.["container"]}
                  property="gap"
                  label="Gap"
                  defaultSuffix="px"
                  defaultValue="0"
                  onChangeStyle={updateMainPreviewStyle}
                  styleState={styleStateAl}
                  style="style"
                  deviceSwitch={props.deviceSwitch}
                  isSlider={true}
                  moduleKey="container"
                ></SliderMain>
              </div>
              </>
                )}
              <AlignMain
                data={miscPreviewData?.["container"]}
                property="float"
                label="Float"
                defaultValue="none"
                onChangeStyle={updateMainPreviewStyle}
                styleState={styleStateAl}
                style="style"
                deviceSwitch={props.deviceSwitch}
                options={[
                  {
                    value: "none",
                    label: "None",
                  },
                  {
                    value: "left",
                    label: "Left",
                  },
                  {
                    value: "right",
                    label: "Right",
                  },
                ]}
                isNewTab={true}
                moduleKey="container"
              />
            </div>
          )}
        </>
      ),
    },
    //1:Sizing
    {
      key: "1",
      label: "Sizing",
      children: (
        <>
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("1")}
              activeKey={selectedTab}
              onChange={(value) => handleSettingChange(value)}
              items={selectedTabItems}
              defaultActiveKey={selectedTab}
            />
          </div>

          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("sizing")}>
              <SliderMain
                data={
                  selectedTab === "container"
                    ? miscPreviewData?.["container"]
                    : selectedTab === "post"
                      ? postPreviewData[props.selectedModule]
                      : selectedTab === "filter"
                        ? filterPreviewData
                        : ""
                }
                property="width"
                label="Width"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter"
                        ? filterPreviewStyle
                        : ""
                }
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : ""}
              />
              <SliderMain
                data={
                  selectedTab === "container"
                    ? miscPreviewData?.["container"]
                    : selectedTab === "post"
                      ? postPreviewData[props.selectedModule]
                      : selectedTab === "filter"
                        ? filterPreviewData
                        : ""
                }
                property="height"
                label="Height"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter"
                        ? filterPreviewStyle
                        : ""
                }
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : ""}
              />
            </div>
          )}
        </>
      ),
    },
    //2:Spacing
    {
      key: "2",
      label: "Spacing",
      children: (
        <>
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("2")}
              activeKey={selectedTab}
              onChange={(value) => handleSettingChange(value)}
              items={selectedTabItems}
              defaultActiveKey={selectedTab}
            />
          </div>

          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("spacing")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchSpacing}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchSpacing}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <span className="label-span-spacing">Margin</span>
              <div className="caf-spacing-look">
                <Row>
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="marginTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="marginBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <div
                    className={`spacing-joint ${isMarginVerticalJoint ? "active" : ""
                      }`}
                    onClick={toggleMarginVerticalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
                <Row>
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="marginLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="marginRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <div
                    className={`spacing-joint ${isMarginHorizontalJoint ? "active" : ""
                      }`}
                    onClick={toggleMarginHorizontalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
              </div>

              <span className="label-span-spacing">Padding</span>
              <div className="caf-spacing-look">
                <Row className="without-border">
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="paddingTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="paddingBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <div
                    className={`spacing-joint ${isPaddingVerticalJoint ? "active" : ""
                      }`}
                    onClick={togglePaddingVerticalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
                <Row>
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="paddingLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <SliderMain
                    data={
                      selectedTab === "container"
                        ? miscPreviewData?.["container"]
                        : selectedTab === "post"
                          ? postPreviewData[props.selectedModule]
                          : selectedTab === "filter"
                            ? filterPreviewData
                            : ""
                    }
                    property="paddingRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={
                      selectedTab === "container"
                        ? updateMainPreviewStyle
                        : selectedTab === "post"
                          ? postPreviewStyle
                          : selectedTab === "filter"
                            ? filterPreviewStyle
                            : ""
                    }
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                    moduleKey={selectedTab === "container" ? "container" : ""}
                  />
                  <div
                    className={`spacing-joint ${isPaddingHorizontalJoint ? "active" : ""
                      }`}
                    onClick={togglePaddingHorizontalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
              </div>
            </div>
          )}
        </>
      ),
    },
    //3:Background
    {
      key: "3",
      label: "Background",
      children: (
        <>
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("3")}
              activeKey={selectedTab}
              onChange={(value) => handleSettingChange(value)}
              items={selectedTabItems}
              defaultActiveKey={selectedTab}
            />
          </div>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("background")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchBg}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchBg}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <ColorMain
                data={
                  selectedTab === "container"
                    ? miscPreviewData?.["container"]
                    : selectedTab === "post"
                      ? postPreviewData[props.selectedModule]
                      : selectedTab === "filter"
                        ? filterPreviewData
                        : ""
                }
                property="backgroundColor"
                defaultValue="#00000000"
                label="Background Color"
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter"
                        ? filterPreviewStyle
                        : ""
                }
                styleState={styleStateBg}
                deviceSwitch={props.deviceSwitch}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : ""}
              />
            </div>
          )}
        </>
      ),
    },
    //4:Border
    {
      key: "4",
      label: "Border",
      children: (
        <>
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("4")}
              activeKey={selectedTab}
              onChange={(value) => handleSettingChange(value)}
              items={selectedTabItems}
              defaultActiveKey={selectedTab}
            />
          </div>

          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("border")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchBr}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchBr}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <BorderMain
                data={
                  selectedTab === "container"
                    ? miscPreviewData?.["container"]
                    : selectedTab === "post"
                      ? postPreviewData[props.selectedModule]
                      : selectedTab === "filter"
                        ? filterPreviewData
                        : ""
                }
                property="border"
                label="Border"
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter"
                        ? filterPreviewStyle
                        : ""
                }
                styleState={styleStateBr}
                deviceSwitch={props.deviceSwitch}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : ""}
              ></BorderMain>
            </div>
          )}
        </>
      ),
    },
    //5:Box Shadow
    {
      key: "5",
      label: "Box Shadow",
      children: (
        <>
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <PreviewDesignTabInnerTabs
              isCollapseOpen={isCollapsePanelOpen("5")}
              activeKey={selectedTab}
              onChange={(value) => handleSettingChange(value)}
              items={selectedTabItems}
              defaultActiveKey={selectedTab}
            />
          </div>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("box-shadow")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchBs}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchBs}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <BoxShadow
                data={
                  selectedTab === "container"
                    ? miscPreviewData?.["container"]
                    : selectedTab === "post"
                      ? postPreviewData[props.selectedModule]
                      : selectedTab === "filter"
                        ? filterPreviewData
                        : ""
                }
                property="boxShadow"
                label="Box Shadow"
                onChangeStyle={
                  selectedTab === "container"
                    ? updateMainPreviewStyle
                    : selectedTab === "post"
                      ? postPreviewStyle
                      : selectedTab === "filter"
                        ? filterPreviewStyle
                        : ""
                }
                styleState={styleStateBs}
                deviceSwitch={props.deviceSwitch}
                style="style"
                moduleKey={selectedTab === "container" ? "container" : ""}
              ></BoxShadow>
            </div>
          )}
        </>
      ),
    },
  ];

  let filterButtonItems = [
    //0:Layout
    {
      key: "0",
      label: "Layout",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("layout", "webflow-sync")}>
              <>
                <AlignMain
                  data={miscPreviewData?.["meta"]}
                  property="display"
                  label="Display"
                  defaultValue="flex"
                  onChangeStyle={updateMainPreviewStyle}
                  deviceSwitch={props.deviceSwitch}
                  styleState={styleStateAl}
                  style="style"
                  options={[
                    {
                      value: "block",
                      label: "Block",
                    },
                    {
                      value: "flex",
                      label: "Flex",
                    },
                  ]}
                  moduleKey="meta"
                  isNewTab={true}
                />
                   {displayProperty === "flex" && (
                <div className="webflow-custom-dropdown new-caf-look">
                  <AlignMain
                    data={miscPreviewData?.["meta"]}
                    property="flexFlow"
                    label="Direction"
                    defaultValue="row"
                    onChangeStyle={updateMainPreviewStyle}
                    style="style"
                    styleState={styleStateAl}
                    deviceSwitch={props.deviceSwitch}
                    options={[
                      {
                        value: "row",
                        label: (
                          <Tooltip title="Horizontal">
                            <ArrowRightOutlined />
                          </Tooltip>
                        ),
                      },
                      {
                        value: "column",
                        label: (
                          <Tooltip title="Vertical">
                            <ArrowDownOutlined />
                          </Tooltip>
                        ),
                      },
                      {
                        value: 'row-reverse',
                        label: <Tooltip title="Row Reverse"><ArrowLeftOutlined /></Tooltip>,
                      },
                      {
                        value: 'column-reverse',
                        label: <Tooltip title="Column Reverse"><ArrowUpOutlined /></Tooltip>,
                      },
                    ]}
                    moduleKey="meta"
                  />

                </div>
                  )}
              </>
              {displayProperty === "flex" && (
                <>
              <div className="align-flex-flow">
                <span class="flex-flow-align-label">Align</span>
                <div
                  className={`flex-align-control ${flexFlow === "column wrap" ||
                    flexFlow === "column wrap-reverse"
                    ? "caf-reverse-me1"
                    : ""
                    }`}
                >
                  <SelectMain
                    data={miscPreviewData?.["meta"]}
                    property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'alignItems' : "justifyContent"}`}
                    label={"X"}
                    defaultValue="flex-start"
                    onChangeStyle={updateMainPreviewStyle}
                    styleState={styleStateAl}
                    style="style"
                    deviceSwitch={props.deviceSwitch}
                    class={"align-x-flex"}
                    options={opt1}
                    moduleKey="meta"
                  />
                  <SelectMain
                    data={miscPreviewData?.["meta"]}
                    property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'justifyContent' : "alignItems"}`}
                    label={"Y"}
                    defaultValue="flex-start"
                    onChangeStyle={updateMainPreviewStyle}
                    styleState={styleStateAl}
                    style="style"
                    deviceSwitch={props.deviceSwitch}
                    class={"align-y-flex"}
                    options={opt2}
                    moduleKey="meta"
                  />
                </div>
              </div>
              <div className="webflow-slider webflow-gap-slider">
                <SliderMain
                  data={miscPreviewData?.["meta"]}
                  property="gap"
                  label="Gap"
                  defaultSuffix="px"
                  defaultValue="0"
                  onChangeStyle={updateMainPreviewStyle}
                  styleState={styleStateAl}
                  style="style"
                  deviceSwitch={props.deviceSwitch}
                  isSlider={true}
                  moduleKey="meta"
                ></SliderMain>
              </div>
              </>
              )}

              <AlignMain
                data={miscPreviewData?.["meta"]}
                property="float"
                label="Float"
                defaultValue="none"
                onChangeStyle={updateMainPreviewStyle}
                styleState={styleStateAl}
                style="style"
                deviceSwitch={props.deviceSwitch}
                options={[
                  {
                    value: "none",
                    label: "None",
                  },
                  {
                    value: "left",
                    label: "Left",
                  },
                  {
                    value: "right",
                    label: "Right",
                  },
                ]}
                isNewTab={true}
                moduleKey="meta"
              />
            </div>
          )}
        </>
      ),
    },
    //1:Text
    {
      key: "1",
      label: "Text",
      children: (
        <div className={collapseMainContentClass("text")}>
          <div className="hoverswitchguard">
          <Segmented
            value={hoverSwitchText}
            style={{ marginBottom: 8 }}
            onChange={onHoverSwitchText}
            className={"hoverTabCaf"}
            options={[
              { label: "Default", value: false },
              { label: "Hover", value: true },
            ]}
          />
          </div>
          <TextMain
            data={miscPreviewData?.["meta"]}
            onChangeStyle={updateMainPreviewStyle}
            fonts={fontFamilyArray}
            hoverSwitch={hoverSwitchText}
            deviceSwitch={props.deviceSwitch}
            style="style"
            isSlider={true}
          />
        </div>
      ),
    },
    //2:Sizing
    {
      key: "2",
      label: "Sizing",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("sizing")}>
              <SliderMain
                data={miscPreviewData?.["meta"]}
                property="width"
                label="Width"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={updateMainPreviewStyle}
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
                moduleKey={'meta'}
              />
              <SliderMain
                data={miscPreviewData?.["meta"]}
                property="height"
                label="Height"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={updateMainPreviewStyle}
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
                moduleKey={'meta'}
              />
            </div>
          )}
        </>
      ),
    },
    //3:Spacing
    {
      key: "3",
      label: "Spacing",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("spacing")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchSpacing}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchSpacing}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <span className="label-span-spacing">Margin</span>
              <div className="caf-spacing-look">
                <Row>
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="marginTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="marginBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <div
                    className={`spacing-joint ${isMarginVerticalJoint ? "active" : ""
                      }`}
                    onClick={toggleMarginVerticalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
                <Row>
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="marginLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="marginRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <div
                    className={`spacing-joint ${isMarginHorizontalJoint ? "active" : ""
                      }`}
                    onClick={toggleMarginHorizontalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
              </div>

              <span className="label-span-spacing">Padding</span>
              <div className="caf-spacing-look">
                <Row className="without-border">
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="paddingTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="paddingBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <div
                    className={`spacing-joint ${isPaddingVerticalJoint ? "active" : ""
                      }`}
                    onClick={togglePaddingVerticalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
                <Row>
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="paddingLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <SliderMain
                    data={miscPreviewData?.["meta"]}
                    property="paddingRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateMainPreviewStyle}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                    moduleKey={"meta"}
                  />
                  <div
                    className={`spacing-joint ${isPaddingHorizontalJoint ? "active" : ""
                      }`}
                    onClick={togglePaddingHorizontalJoint}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.20001 2.4C6.86863 2.4 6.60001 2.66864 6.60001 3C6.60001 3.33137 6.86863 3.6 7.20001 3.6V2.4ZM4.8 9.60001C5.13138 9.60001 5.4 9.33139 5.4 9.00001C5.4 8.66863 5.13138 8.40001 4.8 8.40001V9.60001ZM7.20001 8.40001C6.86863 8.40001 6.60001 8.66863 6.60001 9.00001C6.60001 9.33139 6.86863 9.60001 7.20001 9.60001V8.40001ZM3.6 5.40001C3.26863 5.40001 3 5.66863 3 6.00001C3 6.33139 3.26863 6.60001 3.6 6.60001V5.40001ZM1.02427 0.175734C0.789949 -0.0585781 0.410052 -0.0585781 0.175734 0.175734C-0.058578 0.410053 -0.058578 0.789949 0.175734 1.02427L1.02427 0.175734ZM10.9757 11.8243C11.2101 12.0586 11.59 12.0586 11.8243 11.8243C12.0586 11.59 12.0586 11.2101 11.8243 10.9758L10.9757 11.8243ZM10.4469 7.25389C10.2734 7.53625 10.3618 7.90579 10.6441 8.07919C10.9265 8.25265 11.296 8.16433 11.4694 7.88197L10.4469 7.25389ZM6.00001 6.60001C6.33139 6.60001 6.60001 6.33139 6.60001 6.00001C6.60001 5.66863 6.33139 5.40001 6.00001 5.40001V6.60001ZM3.6 8.40001C2.27452 8.40001 1.2 7.32547 1.2 6.00001H0C0 7.98823 1.61178 9.60001 3.6 9.60001V8.40001ZM8.40001 3.6C9.72547 3.6 10.8 4.67452 10.8 6.00001H12C12 4.01178 10.3882 2.4 8.40001 2.4V3.6ZM7.20001 3.6H8.40001V2.4H7.20001V3.6ZM4.8 8.40001H3.6V9.60001H4.8V8.40001ZM8.40001 8.40001H7.20001V9.60001H8.40001V8.40001ZM10.8 6.00001C10.8 6.46069 10.6708 6.88939 10.4469 7.25389L11.4694 7.88197C11.806 7.33393 12 6.68869 12 6.00001H10.8ZM3.6 6.60001H6.00001V5.40001H3.6V6.60001ZM0.175734 1.02427L2.626 3.47453L3.47453 2.626L1.02427 0.175734L0.175734 1.02427ZM3.05026 3.05026C2.98992 2.72443 2.67401 2.50451 2.36283 2.6184C0.984036 3.12303 0 4.44611 0 6.00001H1.2C1.2 5.03589 1.7689 4.20379 2.5894 3.82233C2.88989 3.68263 3.1106 3.37609 3.05026 3.05026ZM2.626 3.47453L8.52547 9.37399L9.37399 8.52547L3.47453 2.626L2.626 3.47453ZM8.52547 9.37399L10.9757 11.8243L11.8243 10.9758L9.37399 8.52547L8.52547 9.37399ZM8.92112 8.79531C8.87658 8.55478 8.64463 8.40001 8.40001 8.40001V9.60001C8.42093 9.60001 8.44182 9.59983 8.46266 9.59948C8.79399 9.5938 9.01007 9.27558 8.94973 8.94974L8.92112 8.79531Z"
                        fill="#383A3D"
                      />
                    </svg>
                  </div>
                </Row>
              </div>
            </div>
          )}
        </>
      ),
    },
    //4:Background
    {
      key: "4",
      label: "Background",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("background")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchBg}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchBg}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <ColorMain
                data={miscPreviewData?.["meta"]}
                property="backgroundColor"
                defaultValue="#00000000"
                label="Background Color"
                onChangeStyle={updateMainPreviewStyle}
                styleState={styleStateBg}
                deviceSwitch={props.deviceSwitch}
                style="style"
                moduleKey={"meta"}
              />
            </div>
          )}
        </>
      ),
    },
    //5:Border
    {
      key: "5",
      label: "Border",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("border")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchBr}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchBr}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <BorderMain
                data={miscPreviewData?.["meta"]}
                property="border"
                label="Border"
                onChangeStyle={updateMainPreviewStyle}
                styleState={styleStateBr}
                deviceSwitch={props.deviceSwitch}
                style="style"
                moduleKey={"meta"}
              ></BorderMain>
            </div>
          )}
        </>
      ),
    },
    //6:Box Shadow
    {
      key: "6",
      label: "Box Shadow",
      children: (
        <>
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("box-shadow")}>
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchBs}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchBs}
                  className={"hoverTabCaf"}
                  options={[
                    { label: "Default", value: false },
                    { label: "Hover", value: true },
                  ]}
                />
              </div>
              <BoxShadow
                data={miscPreviewData?.["meta"]}
                property="boxShadow"
                label="Box Shadow"
                onChangeStyle={updateMainPreviewStyle}
                styleState={styleStateBs}
                deviceSwitch={props.deviceSwitch}
                style="style"
                moduleKey={"meta"}
              ></BoxShadow>
            </div>
          )}
        </>
      ),
    },
  ];

  //console.log(selectedTab);
  return (
    <div className="row-design-tab-data">

      {props?.tab === "advanced" ? (
        <div className="caf-preview-collapse-design">
          <Collapse
            //defaultActiveKey={["1"]}
            expandIconPlacement="end"
            onChange={handleCollapseChangeAdv}
            accordion={true}
            expandIcon={({ isActive }) => (
              <CaretDownOutlined rotate={isActive ? 180 : 0} />
            )}
            //items={AdvancedIems}
            items={(() => {
              if(filterStatus === "false"){
                return AdvancedIems.filter((item) => item.key !== "1");
              }else{
                return AdvancedIems;
              }
            })()}
          />
        </div>
      ) :
        props.selectedModule === "grid" && (
          <>
            {isFloatingFilterPosition() &&
              <div className="caf-builder-setting-row-label">
                <Tabs
                  activeKey={selectedTab}
                  onChange={(value) => handleGridSettingTab(value)}
                  items={gridLayoutTabItems}
                  defaultActiveKey={selectedTab}
                />
              </div>
            }
            {loading ? (
              <Skeleton active />
              ):(
              <Collapse
              // defaultActiveKey={["0"]}
              //activeKey={activeCollapseKey}
              expandIconPlacement="end"
              onChange={handleCollapseChange}
              accordion={true}
              expandIcon={({ isActive }) => (
                <CaretDownOutlined rotate={isActive ? 180 : 0} />
              )}
              //items={containerItems}
              items={(() => {
                if (selectedTab === "container") {
                  return containerItems;
                }
                if (selectedTab === "meta") {
                  return filterButtonItems;
                }
                return containerItems;
              })()}
            />
            )}
          </>
        )}
    </div>
  );
};

export default Post;
