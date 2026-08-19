import React, { useEffect, useState } from "react";
import { CaretDownOutlined } from "@ant-design/icons";
import { Collapse, Switch, Tabs, Segmented, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import apiClient from "../../../../api/client";
import SliderMain from "../design-components/common-component/SliderMain";
import SelectMain from "../design-components/common-component/SelectMain";
import ColorMain from "../design-components/common-component/ColorMain";
import AlignMain from "../design-components/common-component/AlignMain";
import BorderMain from "../design-components/common-component/BorderMain";
import BoxShadow from "../design-components/common-component/BoxShadow";
import TextMain from "../design-components/common-component/TextMain";
import wrapdownicon from "../../../images/flex/wrap-down.svg";
import wrapupicon from "../../../images/flex/wrap-up.svg";
import singlerowicon from "../../../images/flex/single-row.svg";
import wrapdown2icon from "../../../images/flex/wrap-down2.svg";
import wrapup2icon from "../../../images/flex/wrap-up.svg";
import wraprighticon from "../../../images/flex/wrap-right.svg";
import wraplefticon from "../../../images/flex/wrap-left.svg";
import singlecolumnicon from "../../../images/flex/single-column.svg";
import wrapright2icon from "../../../images/flex/wrap-right2.svg";
import wrapleft2icon from "../../../images/flex/wrap-left2.svg";
import { cloneFilterLayoutData } from "./ModuleContentData/filterSettingsSnapshot";
import {
  resolveFilterDesignTabStyleStates,
  resolveFlexFlowForFilterDesignTab,
  buildFlexAlignOptions,
  resolveDisplayPropertyForFilterDesignTab,
  resolveFilterDesignEffectiveStyleTab,
} from "./filterDesignTabDerivedState";
import { collapseMainContentClass } from "../../../utils/collapseMainContentClass";
import { buildFilterDesignTabContainerItems } from "./filterDesignTabContainerItems";
import { buildFilterDesignTabHeaderItems } from "./filterDesignTabHeaderItems";
import { buildFilterDesignTabMetaItems } from "./filterDesignTabMetaItems";
import { buildFilterDesignTabMeta1Items } from "./filterDesignTabMeta1Items";
import { getSearchModuleEnabledIcons, canUseFilterTermShowMore } from "./ModuleContentData/shared/filterModuleTier";
import {
  useResolvedMainBuilderData,
  getResolvedFilterPostType,
} from "./ModuleContentData/useResolvedMainBuilderData";
import {
  getTermVisualDesignLabel,
  getTermVisualWithTextDesignLabel,
  getAttributeSwatchDesignLabel,
  getAttributeSwatchWithTextDesignLabel,
  shouldHideTermLabel,
  shouldShowFilterDesignIconStyleTabUnderText,
} from "./ModuleContentData/termVisualUtils";
import { usesRatingStarStyles, isWooRatingFilterModule } from "../woocommerce/wooFilterModuleTemplates";
import { fModuleStyle } from "../../styleData";
const DesignTab = (props) => {
  //console.log(props);
  const { type, rowindex, columnindex, moduleindex, module } = props.indexes;
  // Prefer live layout data — indexes.module goes stale after onChangeStyle clones.
  const liveModule =
    type === "module"
      ? props.data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex] ?? module
      : module;
  const mainBuilderData = useResolvedMainBuilderData(props.mainBuilderData);
  // Deep-clone every commit: child style controls may forward layout after
  // shallow copies that still alias nested nodes under `props.data`.
  const onChangeStyle = (style) => {
    if (!Array.isArray(style)) return;
    props.onChangeStyle(cloneFilterLayoutData(style));
  };
  let settings = {};
  if (type === "module") {
    settings = {
      ...(liveModule?.settings ?? {}),
    };
  }
  // Attribute Swatch never uses multiple selection or the swatch/checkbox box.
  const isAttributeSwatchModule =
    module?.key === "woo_attribute_swatch" ||
    liveModule?.key === "woo_attribute_swatch";
  if (isAttributeSwatchModule) {
    settings.show_checkbox = "false";
    settings.multiple_term = "false";
  }
  const resolvedPostType = getResolvedFilterPostType(
    mainBuilderData,
    settings?.post_type
  );
  const termVisualSettings = {
    ...settings,
    post_type: resolvedPostType,
  };
  const termVisualLabel = isAttributeSwatchModule
    ? getAttributeSwatchDesignLabel(termVisualSettings)
    : getTermVisualDesignLabel(termVisualSettings);
  const termVisualWithTextLabel = isAttributeSwatchModule
    ? getAttributeSwatchWithTextDesignLabel(termVisualSettings)
    : getTermVisualWithTextDesignLabel(termVisualSettings);
  const hideTermLabel = shouldHideTermLabel(termVisualSettings);
  let device = props.selectedDevice;
  const [fontFamilyArray, setFontFamilyArray] = useState("");
  const [hoverSwitchText, setHoverSwitchText] = useState(false);
  const [hoverSwitchSpacing, setHoverSwitchSpacing] = useState(false);
  const [hoverSwitchPosition, setHoverSwitchPosition] = useState(false);
  const [hoverSwitchBg, setHoverSwitchBg] = useState(false);
  const [hoverSwitchAl, setHoverSwitchAl] = useState(false);
  const [hoverSwitchBr, setHoverSwitchBr] = useState(false);
  const [hoverSwitchBs, setHoverSwitchBs] = useState(false);
  const [deviceSwitch, setDeviceSwitch] = useState(props.selectedDevice);
  const [styleTab, setStyleTab] = useState("container");
  const [selectedMetaDropdown, setSelectedMetaDropdown] = useState('meta1');
  const [rangeSliderSizingSub, setRangeSliderSizingSub] = useState('meta2');
  const [selectedMetaContainer, setSelectedMetaContainer] = useState('container');
  const [activeDesignCollapsePanelKey, setActiveDesignCollapsePanelKey] = useState(null);
  const [hoverValue, setHoverValue] = useState("Hover an option to see direction and wrap values.");

  const site_url = tc_caf_ajax.plugin_path;
  let url = site_url + "admin/google-fonts.json";
  const [isMarginVerticalJoint, setIsMarginVerticalJoint] = useState(false);
  const [isMarginHorizontalJoint, setIsMarginHorizontalJoint] = useState(false);
  const [isPaddingVerticalJoint, setIsPaddingVerticalJoint] = useState(false);
  const [isPaddingHorizontalJoint, setIsPaddingHorizontalJoint] = useState(false);
  const toggleMarginVerticalJoint = () => setIsMarginVerticalJoint(prev => !prev);
  const toggleMarginHorizontalJoint = () => setIsMarginHorizontalJoint(prev => !prev);
  const togglePaddingVerticalJoint = () => setIsPaddingVerticalJoint(prev => !prev);
  const togglePaddingHorizontalJoint = () => setIsPaddingHorizontalJoint(prev => !prev);
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await apiClient.get(url);
        // console.log(response);
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
    setDeviceSwitch(props.selectedDevice);
    setHoverSwitchText(false);
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
  }, [props.selectedDevice]);

  useEffect(() => {
    setRangeSliderSizingSub('meta2');
  }, [rowindex, columnindex, moduleindex, module?.key]);

  useEffect(() => {
    setActiveDesignCollapsePanelKey(null);
  }, [styleTab, rowindex, columnindex, moduleindex, module?.key]);

  useEffect(() => {
    if (
      styleTab === "showmore" &&
      (!canUseFilterTermShowMore() ||
        String(settings?.term_show_more ?? "false") !== "true")
    ) {
      setStyleTab("container");
      setSelectedMetaDropdown("container");
    }
  }, [settings?.term_show_more, styleTab]);

  useEffect(() => {
    const isCheckboxDropdown =
      liveModule?.key === "checkbox_filter" ||
      liveModule?.key === "dropdown_filter";
    if (
      !isCheckboxDropdown ||
      activeDesignCollapsePanelKey !== "1" ||
      shouldShowFilterDesignIconStyleTabUnderText(settings, liveModule?.key)
    ) {
      return;
    }
    if (selectedMetaDropdown === "icon") {
      setSelectedMetaDropdown("meta1");
    } else if (selectedMetaDropdown === "selecticon") {
      setSelectedMetaDropdown("selectmeta");
    }
  }, [
    liveModule?.key,
    settings?.show_icon,
    settings?.term_visual,
    resolvedPostType,
    selectedMetaDropdown,
    styleTab,
    activeDesignCollapsePanelKey,
  ]);

  // Legacy layouts: section must exist before HeaderItems / layout resolvers can bind.
  // Only fill when completely missing — same defaults as NewModulePopUp / Content enable.
  useEffect(() => {
    const canUseShowMoreTab =
      canUseFilterTermShowMore() &&
      (liveModule?.key === "checkbox_filter" ||
        liveModule?.key === "dropdown_filter") &&
      String(settings?.term_show_more ?? "false") === "true";
    if (!canUseShowMoreTab || liveModule?.style?.showmore || !fModuleStyle?.showmore) {
      return;
    }
    if (!props?.data || !props?.onChangeStyle) {
      return;
    }
    const items = cloneFilterLayoutData(props.data);
    const moduleRef = items?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
    if (!moduleRef) {
      return;
    }
    if (!moduleRef.style) {
      moduleRef.style = {};
    }
    if (moduleRef.style.showmore) {
      return;
    }
    moduleRef.style.showmore = JSON.parse(JSON.stringify(fModuleStyle.showmore));
    props.onChangeStyle(items);
  }, [
    liveModule?.key,
    liveModule?.style?.showmore,
    settings?.term_show_more,
    rowindex,
    columnindex,
    moduleindex,
  ]);

  const handleDesignCollapseChange = (key) => {
    const nextKey = Array.isArray(key) ? key[0] : key;
    setActiveDesignCollapsePanelKey(nextKey ?? null);
  };

  useEffect(() => {
    if (rangeSliderSizingSub === "meta3" && hoverSwitchBg === "active") {
      setHoverSwitchBg(false);
    }
  }, [rangeSliderSizingSub, hoverSwitchBg]);

  // useEffect(()=>{
  //   if(styleTab === "selectmeta"){
  //     setSelectedMetaDropdown("selectmeta")
  //   }else{
  //     setSelectedMetaDropdown(settings?.show_checkbox === 'true' ? 'meta1':  settings?.show_icon === 'true'? 'meta2' :   settings?.show_count === 'true' ? 'meta3' : null)
  //   }
  // },[styleTab])

  // useEffect(() => {
  //   if (filterLabel === "true") {
  //     setHeaderTab({
  //       key: "header",
  //       label: "Header",
  //     });
  //   } else {
  //     setHeaderTab("");
  //   }
  // }, [filterLabel]);

  let tab_items = [
    {
      key: "container",
      label: "Container",
    },
    module.key === "search" && 
    {
       key: "meta",
       label: "Search Field",
    },
    // {
    //   key: "container",
    //   label: "Title",
    // },
    // {
    //   key: "meta",
    //   label: "Filter Wrapper",
    // },
    module.key === "dropdown_filter" ?
      {
        key: "selectmeta",
        label: "Select Field",
      } : null,
      
    module.key !== "search" &&
    {
      key: "meta1",
      label:
        module?.key === "dropdown_filter"
          ? "Options"
          : module?.key === "range_slider"
          ? "Slider"
          : "Single Item",
    },
    (liveModule?.key === "checkbox_filter" ||
      liveModule?.key === "dropdown_filter") &&
    canUseFilterTermShowMore() &&
    settings?.term_show_more === "true" && {
      key: "showmore",
      label: "Show More",
    },
  ].filter(Boolean);
  // if (module.key === "search") {
  //   tab_items = [
  //     {
  //       key: "container",
  //       label: "Title",
  //     },
  //     {
  //       key: "input",
  //       label: "Input",
  //     },
  //     {
  //       key: "meta",
  //       label: "Icons",
  //     },
  //   ];
  // }
  if (module.key === "reset" || module.key === "customtext") {
    tab_items = [
      {
        key: "container",
        label: "Container",
      },
    ];
  }
  const handleHover = (value) => {
    // console.log("Hovered:", value);
    setHoverValue(value);
  };
  const handleSettingChange = (value) => {
    // console.log(value);
    setSelectedMetaDropdown(value);
  }
  const handleSettingChangeContainer = (value) => {
    // console.log(value);
    setSelectedMetaContainer(value);
  }

  const onChangeTab = (key) => {
    // console.log(key);
    if (key === 'meta1') {
      if (module?.key === 'range_slider') {
        setSelectedMetaDropdown('meta1');
        setRangeSliderSizingSub('meta2');
      } else {
        if (settings?.show_checkbox === 'false' && settings?.show_icon === 'true') {
          setSelectedMetaDropdown('meta2');
        }
        if (
          isWooRatingFilterModule(module?.key) &&
          usesRatingStarStyles(settings)
        ) {
          setSelectedMetaDropdown("icon");
        }
        if (settings?.show_checkbox === 'false' && settings?.show_icon === 'false' && settings?.show_count === 'true') {
          setSelectedMetaDropdown('meta3');
        }
      }
    }
    else {
      setSelectedMetaDropdown(key);
    }
    if (module?.key === 'range_slider') {
      setRangeSliderSizingSub('meta2');
    }
    setStyleTab(key);
    // setDeviceSwitch(false)
    setHoverSwitchText(false);
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
  };
  const onHoverSwitchText = (value) => {
    setHoverSwitchText(value);
  };

  const onHoverSwitchSpacing = (value) => {
    setHoverSwitchSpacing(value);
  };
  const onHoverSwitchPosition = (value) => {
    setHoverSwitchPosition(value);
  };
  const onHoverSwitchBg = (value) => {
    setHoverSwitchBg(value);
  };
  const onHoverSwitchAl = (value) => {
    setHoverSwitchAl(value);
  };
  const onHoverSwitchBr = (value) => {
    setHoverSwitchBr(value);
  };
  const onHoverSwitchBs = (value) => {
    setHoverSwitchBs(value);
  };


  const handleWrapChange = (value) => {
    let items = cloneFilterLayoutData(props.data);
    const metaStyle =
      items[rowindex].data[columnindex].data[moduleindex].style.meta;
    if (!metaStyle[deviceSwitch]) {
      metaStyle[deviceSwitch] = {};
    }
    if (!metaStyle[deviceSwitch][styleStateAl]) {
      metaStyle[deviceSwitch][styleStateAl] = {};
    }
    metaStyle[deviceSwitch][styleStateAl].flexWrap = value;
    if (value === "nowrap") {
      metaStyle[deviceSwitch][styleStateAl].overflow = "auto";
    } else {
      metaStyle[deviceSwitch][styleStateAl].overflow = "inherit";
    }
    props.onChangeStyle(items);
  };
  const resetValue = () => {
    const items = cloneFilterLayoutData(props.data);
    const wrapStyleKey =
      type === "module" &&
      (module?.key === "checkbox_filter" ||
        module?.key === "dropdown_filter" ||
        module?.key === "woo_attribute_swatch")
        ? "meta"
        : styleTab;
    const moduleStyleTab =
      items?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.style?.[
        wrapStyleKey
      ];

    if (type === "module" && moduleStyleTab) {
      if (
        !moduleStyleTab[deviceSwitch] ||
        typeof moduleStyleTab[deviceSwitch] !== "object"
      ) {
        moduleStyleTab[deviceSwitch] = {};
      }
      if (
        !moduleStyleTab[deviceSwitch][styleStateAl] ||
        typeof moduleStyleTab[deviceSwitch][styleStateAl] !== "object"
      ) {
        moduleStyleTab[deviceSwitch][styleStateAl] = {};
      }
      moduleStyleTab[deviceSwitch][styleStateAl] = {
        ...moduleStyleTab[deviceSwitch][styleStateAl],
        flexWrap: "wrap",
        overflow: "inherit",
      };
    }

    onChangeStyle(items);
  };

  // const onChangeDevice = (checked) => {
  //   setDeviceSwitch(checked)
  //   setHoverSwitchText(false)
  //   setHoverSwitchSpacing(false)
  //   setHoverSwitchPosition(false)
  //   setHoverSwitchBg(false)
  //   setHoverSwitchAl(false)
  //   setHoverSwitchBr(false)
  //   setHoverSwitchBs(false)
  // }

  const {
    styleStateSpacing,
    styleStatePosition,
    styleStateBg,
    styleStateAl,
    styleStateBr,
    styleStateBs,
    styleStateIcon,
  } = resolveFilterDesignTabStyleStates({
    hoverSwitchSpacing,
    hoverSwitchPosition,
    hoverSwitchBg,
    hoverSwitchAl,
    hoverSwitchBr,
    hoverSwitchBs,
    hoverSwitchText,
  });

  const effectiveStyleTab = resolveFilterDesignEffectiveStyleTab({
    moduleKey: module?.key,
    styleTab,
    selectedMetaContainer,
    selectedMetaDropdown,
  });
  const flexFlow = resolveFlexFlowForFilterDesignTab({
    data: props.data,
    type,
    rowindex,
    columnindex,
    moduleindex,
    device,
    styleStateAl,
    styleTab: effectiveStyleTab,
  });

  const displayProperty = resolveDisplayPropertyForFilterDesignTab({
    data: props.data,
    type,
    rowindex,
    columnindex,
    moduleindex,
    device,
    styleStateAl,
    styleTab: effectiveStyleTab,
  });

  const { opt1, opt2 } = buildFlexAlignOptions(flexFlow);

  let fWrap = "";
  if (
    type === "module" &&
    (module?.key === "checkbox_filter" ||
      module?.key === "dropdown_filter" ||
      module?.key === "woo_attribute_swatch")
  ) {
    fWrap =
      props?.data[rowindex]?.data[columnindex]?.data[moduleindex].style?.meta?.[
        deviceSwitch
      ]?.[styleStateAl]?.flexWrap;
  }
  //console.log(fWrap);
  // console.log(fontFamilyArray);
  let selectedTabsubItems = [
    // {
    //   key: "selectmeta",
    //   label: "Main",
    // },
    settings?.show_icon === 'true'
      ? {
        key: "meta4",
        label: termVisualWithTextLabel,
      } : null,
      settings?.show_icon === 'false'
      ? {
        key: "meta4",
        label: "Text",
      } : null,
  ].filter(Boolean);


const searchMetaIconTabs =
  module?.key === "search" && styleTab === "meta"
    ? (() => {
        const iconSettings = getSearchModuleEnabledIcons(settings);
        const leftIconCount = iconSettings.filter(
          (icon) => icon?.position === "left",
        ).length;
        const rightIconCount = iconSettings.filter(
          (icon) => icon?.position === "right",
        ).length;

        return [
          {
            key: "input",
            label: "Input",
          },
          leftIconCount >= 2
            ? {
                key: "meta1",
                label: "Left Icons",
              }
            : null,
          rightIconCount >= 2
            ? {
                key: "meta2",
                label: "Right Icons",
              }
            : null,
        ].filter(Boolean);
      })()
    : null;

const isWooRatingModule = isWooRatingFilterModule(module?.key);
const ratingShowsStars = isWooRatingModule && usesRatingStarStyles(settings);

let meta1subItems =
  searchMetaIconTabs ??
    [
        styleTab === "meta1" && module?.key === "dropdown_filter"
          ? {
              key: "mainmeta",
              label: "Items Container",
            }
          : null,

        !isWooRatingModule && settings?.show_checkbox === "true"
          ? {
              key: "meta1",
              label: "Checkbox + Content",
            }
          : null,

        !isWooRatingModule && settings?.show_icon === "true"
          ? {
              key: module?.key === "dropdown_filter" ? "meta1" : "meta2",
              label: termVisualWithTextLabel,
            }
          : null,

        ratingShowsStars
          ? {
              key: "icon",
              label: "Stars",
            }
          : null,

        !isWooRatingModule && settings?.show_count === "true" && !hideTermLabel
          ? {
              key: "meta3",
              label: "Text + Count",
            }
          : null,
          (module?.key === "checkbox_filter" ||
            module?.key === "woo_attribute_swatch") &&
          settings?.show_checkbox === "false" &&
          settings?.show_icon === "false" &&
          settings?.show_count === "false"
          ?
          {
            key: "meta3",
            label: "Text",
          }
        : null,
        module?.key === "dropdown_filter" && settings?.show_icon === "false" && settings?.show_count === "false" 
        ?
        {
          key: "meta3",
          label: "Text",
        }
      : null,

      ].filter(Boolean);

  //console.log(selectedMetaContainer, selectedMetaDropdown);
  const ContainerItems = buildFilterDesignTabContainerItems({
    type,
    module,
    props,
    settings,
    selectedMetaContainer,
    activeCollapsePanelKey: activeDesignCollapsePanelKey,
    handleSettingChangeContainer,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty,
    fWrap,
    resetValue,
    handleWrapChange,
    onHoverSwitchText,
  });
  const HeaderItems = buildFilterDesignTabHeaderItems({
    type,
    module,
    props,
    settings,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchText,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty,
  });
  const MetaItems = buildFilterDesignTabMetaItems({
    type,
    module,
    props,
    settings,
    onChangeStyle,
    deviceSwitch,
    styleTab,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    fWrap,
    resetValue,
    handleWrapChange,
    displayProperty,
  });



  //console.log(selectedMetaDropdown);
  const Meta1Items = buildFilterDesignTabMeta1Items({
    type,
    module,
    props,
    settings,
    termVisualLabel,
    styleTab,
    onChangeStyle,
    deviceSwitch,
    device,
    selectedMetaDropdown,
    activeCollapsePanelKey: activeDesignCollapsePanelKey,
    handleSettingChange,
    rangeSliderSizingSub,
    onRangeSliderSizingSubChange: setRangeSliderSizingSub,
    selectedTabsubItems,
    meta1subItems,
    styleStateAl,
    styleStateSpacing,
    styleStateBg,
    styleStateBr,
    styleStateBs,
    styleStateIcon,
    flexFlow,
    opt1,
    opt2,
    hoverSwitchText,
    hoverSwitchSpacing,
    hoverSwitchBg,
    hoverSwitchBr,
    hoverSwitchBs,
    onHoverSwitchText,
    onHoverSwitchSpacing,
    onHoverSwitchBg,
    onHoverSwitchBr,
    onHoverSwitchBs,
    isMarginVerticalJoint,
    isMarginHorizontalJoint,
    isPaddingVerticalJoint,
    isPaddingHorizontalJoint,
    toggleMarginVerticalJoint,
    toggleMarginHorizontalJoint,
    togglePaddingVerticalJoint,
    togglePaddingHorizontalJoint,
    fontFamilyArray,
    hoverValue,
    handleHover,
    displayProperty,
  });


  return (
    <>
      {type === "module" && module.key !== "reset" && module.key !== "customtext" && (
        <Tabs
          activeKey={styleTab}
          items={tab_items}
          onChange={onChangeTab}
          className="caf-design-tabs"
        />
      )}

      {(
        <>
          <div className="row-design-tab-data">
            {type === "module" ? (
              <>
                {styleTab === "container" && (
                  <>
                    {/* {console.log(styleTab)} */}
                    <Collapse
                      //defaultActiveKey={['1']}
                      accordion={true}
                      onChange={handleDesignCollapseChange}
                      expandIconPlacement="end"
                      expandIcon={({ isActive }) => (
                        <CaretDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      items={(()=>{
                        if(settings?.label?.is_label === "true"){
                        return ContainerItems;
                        }
                        else if(module?.key === "reset" || module?.key === "customtext"){
                          return ContainerItems;
                        }
                        else{
                        return ContainerItems.filter(
                          (item) =>
                            item.key !== "1"
                        );
                      }
                      })()}
                    />
                  </>
                )}

                {styleTab === "header" && (
                  <>
                    {/* {console.log(styleTab)} */}
                    <Collapse
                      //defaultActiveKey={['1']}
                      accordion={true}
                      onChange={handleDesignCollapseChange}
                      expandIconPlacement="end"
                      expandIcon={({ isActive }) => (
                        <CaretDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      items={HeaderItems}
                    />
                  </>
                )}
                {styleTab === "showmore" && liveModule?.style?.showmore && (
                  <>
                    <Collapse
                      accordion={true}
                      onChange={handleDesignCollapseChange}
                      expandIconPlacement="end"
                      expandIcon={({ isActive }) => (
                        <CaretDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      items={HeaderItems}
                    />
                  </>
                )}
                {styleTab === "input" && (
                  <>
                    {/* {console.log(styleTab)} */}
                    <Collapse
                      //defaultActiveKey={['1']}
                      accordion={true}
                      onChange={handleDesignCollapseChange}
                      expandIconPlacement="end"
                      expandIcon={({ isActive }) => (
                        <CaretDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      items={HeaderItems}
                    />
                  </>
                )}
                {styleTab === "meta" && (
                  <>
                    {/* {console.log(styleTab)} */}
                    <Collapse
                      //defaultActiveKey={['1']}
                      accordion={true}
                      onChange={handleDesignCollapseChange}
                      expandIconPlacement="end"
                      expandIcon={({ isActive }) => (
                        <CaretDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      // items={MetaItems}
                      items={(() => {
                        if (module?.key === "dropdown_filter") {
                          return MetaItems.filter((item) => item.key !== "0");
                        } else {
                          if (module?.key === "search") {
                          return Meta1Items;
                          }else{
                            return MetaItems;
                          }
                        }
                      })()}
                    />
                  </>
                )}
                {styleTab === "selectmeta" && (
                  <>
                    {/* {console.log(styleTab)} */}
                    <Collapse
                      //defaultActiveKey={['1']}
                      accordion={true}
                      onChange={handleDesignCollapseChange}
                      expandIconPlacement="end"
                      expandIcon={({ isActive }) => (
                        <CaretDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      items={Meta1Items}
                    />
                  </>
                )}
                {styleTab === "meta1" && (
                  <>
                    {/* {console.log(styleTab)} */}
                    <Collapse
                      //defaultActiveKey={['1']}
                      accordion={true}
                      onChange={handleDesignCollapseChange}
                      expandIconPlacement="end"
                      expandIcon={({ isActive }) => (
                        <CaretDownOutlined rotate={isActive ? 180 : 0} />
                      )}
                      items={Meta1Items}
                    />
                  </>
                )}

              </>
            ) : (
              <>
                {props.widgets === "1" ? (
                  <Collapse
                    //defaultActiveKey={['1']}
                    accordion={true}
                    onChange={handleDesignCollapseChange}
                    expandIconPlacement="end"
                    expandIcon={({ isActive }) => (
                      <CaretDownOutlined rotate={isActive ? 180 : 0} />
                    )}
                    items={[
                      {
                        key: "1",
                        label: "Sizing",
                        children: (
                          <div className={collapseMainContentClass("sizing")}>
                            {type === "column" ? (
                              <>
                                <SliderMain
                                  data={props.data}
                                  indexes={props.indexes}
                                  property="width"
                                  label="Width"
                                  defaultSuffix="%"
                                  defaultValue="100"
                                  onChangeStyle={onChangeStyle}
                                  deviceSwitch={deviceSwitch}
                                  isSlider={true}
                                />
                                ` {/* <SliderMain
                                  data={props.data}
                                  indexes={props.indexes}
                                  property="flexBasis"
                                  label="Flex Basis"
                                  defaultSuffix="auto"
                                  defaultValue=""
                                  onChangeStyle={onChangeStyle}
                                  deviceSwitch={deviceSwitch}
                                  styleTab={styleTab}
                                />` */}
                              </>
                            ) : (
                              <SliderMain
                                data={props.data}
                                indexes={props.indexes}
                                property="width"
                                label="Width"
                                defaultSuffix="%"
                                defaultValue="100"
                                onChangeStyle={onChangeStyle}
                                deviceSwitch={deviceSwitch}
                                styleTab={styleTab}
                                isSlider={true}
                              />
                            )}
                            <SliderMain
                              data={props.data}
                              indexes={props.indexes}
                              property="height"
                              label="Height"
                              defaultSuffix="%"
                              defaultValue="100"
                              onChangeStyle={onChangeStyle}
                              deviceSwitch={deviceSwitch}
                              styleTab={styleTab}
                              isSlider={true}
                            />
                          </div>
                        ),
                      },
                      {
                        key: "2",
                        label: "Alignment",
                        children: (
                          <div className={collapseMainContentClass("alignment")}>
                            {/* <div className="hoverswitchguard">
                      <Switch
                        checkedChildren="hover"
                        unCheckedChildren="default"
                        onChange={onHoverSwitchAl}
                        checked={hoverSwitchAl}
                        className="hoverSwitch"
                      />
                    </div> */}
                            {type === "row" && (
                              <AlignMain
                                data={props.data}
                                indexes={props.indexes}
                                property="float"
                                label="Float"
                                defaultValue="none"
                                onChangeStyle={onChangeStyle}
                                styleState={styleStateAl}
                                //  styleState={false}
                                deviceSwitch={deviceSwitch}
                                styleTab={styleTab}
                                options={[
                                  {
                                    value: "none",
                                    label: "none",
                                  },
                                  {
                                    value: "left",
                                    label: "left",
                                  },
                                  {
                                    value: "right",
                                    label: "right",
                                  },
                                ]}
                              />
                            )}
                            <AlignMain
                              data={props.data}
                              indexes={props.indexes}
                              property="justifyContent"
                              label="justify Content"
                              defaultValue="flex-start"
                              onChangeStyle={onChangeStyle}
                              styleState={styleStateAl}
                              // styleState={false}
                              deviceSwitch={deviceSwitch}
                              styleTab={styleTab}
                              options={[
                                {
                                  value: "flex-start",
                                  label: "flex-start",
                                },
                                {
                                  value: "flex-end",
                                  label: "flex-end",
                                },
                                {
                                  value: "center",
                                  label: "center",
                                },
                                {
                                  value: "space-between",
                                  label: "space-between",
                                },
                                {
                                  value: "space-around",
                                  label: "space-around",
                                },
                                {
                                  value: "space-evenly",
                                  label: "space-evenly",
                                },
                              ]}
                            />
                            <AlignMain
                              data={props.data}
                              indexes={props.indexes}
                              property="alignItems"
                              label="Align Items"
                              defaultValue="flex-start"
                              onChangeStyle={onChangeStyle}
                              styleState={styleStateAl}
                              // styleState={false}
                              deviceSwitch={deviceSwitch}
                              styleTab={styleTab}
                              options={[
                                {
                                  value: "flex-start",
                                  label: "flex-start",
                                },
                                {
                                  value: "flex-end",
                                  label: "flex-end",
                                },
                                {
                                  value: "center",
                                  label: "center",
                                },
                                {
                                  value: "stretch",
                                  label: "stretch",
                                },
                                {
                                  value: "baseline",
                                  label: "baseline",
                                },
                              ]}
                            />
                            <AlignMain
                              data={props.data}
                              indexes={props.indexes}
                              property="flexDirection"
                              label="Flex Direction"
                              defaultValue="row"
                              onChangeStyle={onChangeStyle}
                              styleState={styleStateAl}
                              // styleState={false}
                              deviceSwitch={deviceSwitch}
                              styleTab={styleTab}
                              options={[
                                {
                                  value: "row",
                                  label: "row",
                                },
                                {
                                  value: "column",
                                  label: "column",
                                },
                              ]}
                            />
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <Collapse
                    //defaultActiveKey={['1']}
                    accordion={true}
                    onChange={handleDesignCollapseChange}
                    expandIconPlacement="end"
                    expandIcon={({ isActive }) => (
                      <CaretDownOutlined rotate={isActive ? 180 : 0} />
                    )}
                    items={(() => {
                      if (type !== "module") {
                        return ContainerItems.filter(
                          (item) =>
                            item.key !== "4" && item.key !== "1"
                        );
                      }
                    })()}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default DesignTab;
