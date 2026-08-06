import React, { useEffect, useState } from "react";
import { CaretDownOutlined } from "@ant-design/icons";
import {
  Collapse,
  Col,
  Row,
  Switch,
  Tabs,
  Segmented,
  Tooltip,
} from "antd";
import apiClient from "../../../../api/client";
import SliderMain from "../design-components/common-component/SliderMain";
import SelectMain from "../design-components/common-component/SelectMain";
import AlignMain from "../design-components/common-component/AlignMain";
import TextMain from "../design-components/common-component/TextMain";
import InputMain from "../design-components/common-component/InputMain";
import CustomFieldSubTab from "../design-components/CustomFieldSubTab";
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
import { clonePostLayoutData } from "./ModuleContentData/postLayoutSnapshot";
import { buildFlexAlignOptions } from "../../../shared/designTabFlexAlignOptions";
import {
  resolvePostDesignTabStyleStates,
  resolveFlexFlowForPostDesignTab,
  resolveDisplayPropertyForPostDesignTab,
} from "./postDesignTabDerivedState";
import {
  buildPostDesignTabSubTabLayoutItems,
  buildPostDesignTabSubTabCommonItems,
  buildPostDesignTabTextSubTabItems,
  shouldShowPostDesignTabTextSubTabs,
} from "./postDesignTabSubTabItems";
import { applyPostDesignTabBgTypeChange } from "./postDesignTabBgType";
import { buildPostDesignTabStyleItemsPart1 } from "./postDesignTabStyleItemsPart1";
import { buildPostDesignTabStyleItemsPart2 } from "./postDesignTabStyleItemsPart2";
import { buildPostDesignTabStyleItemsPart3 } from "./postDesignTabStyleItemsPart3";
import { PostDesignTabWidgetsCollapse } from "./postDesignTabWidgetsCollapse";
const DesignTab = (props) => {
  const hoverItems = [
    { key: "1", label: "Default", children: "Content of Tab Pane 1" },
    { key: "2", label: "Hover", children: "Content of Tab Pane 2" },
  ];
  //console.log(props, '21');
  const { type, rowindex, columnindex, moduleindex, module } = {
    ...props.indexes,
  };
  //console.log(props);
  // Deep-clone every commit: many design controls pass `props.data` after only
  // shallow-copying the row array, which mutates nested layout in place.
  const onChangeStyle = (style) => {
    if (!Array.isArray(style)) return;
    props.onChangeStyle(clonePostLayoutData(style));
  };

  let item = {};

  if (type === "row") {
    item = {
      ...props.data[rowindex]?.["settings"],
    };
  }
  if (type === "column") {
    item = {
      ...props.data[rowindex]?.data[columnindex]?.["settings"],
    };
  }
  if (type === "module") {
    item = {
      ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.["settings"],
    };
  }

// console.log(item);

  const [fontFamilyArray, setFontFamilyArray] = useState("");
  const [hoverSwitchText, setHoverSwitchText] = useState(false);
  const [hoverSwitchSpacing, setHoverSwitchSpacing] = useState(false);
  const [hoverSwitchPosition, setHoverSwitchPosition] = useState(false);
  const [hoverSwitchBg, setHoverSwitchBg] = useState(false);
  const [hoverSwitchAl, setHoverSwitchAl] = useState(false);
  const [hoverSwitchBr, setHoverSwitchBr] = useState(false);
  const [hoverSwitchBs, setHoverSwitchBs] = useState(false);
  const [bgType,setBgType] = useState(item?.bg_type || 'color')

  // const [labelStatus, setLabelStatus] = useState(
  //   module.settings?.label?.is_label == "true" ? true : false
  // );
  const [labelTab, setLabelTab] = useState({ key: "label", label: "Label" });
  const [metaTab, setMetaTab] = useState({ key: "meta", label: "Meta" });
  const [styleTab, setStyleTab] = useState("container");
   const [selectedSubTab, setSelectedSubTab] = useState('container');
  const [hoverValue, setHoverValue] = useState(
    "Hover an option to see direction and wrap values."
  );
  const site_url = tc_caf_ajax.plugin_path;
  let url = site_url + "admin/google-fonts.json";
  let icons_url = site_url + "admin/fa-icons/fontawesome-5.json";
  let device = props.deviceSwitch;
  const [iconsArray, setIconsArray] = useState("");

  let modulesKeysArray = ["button","title","date","commentcount","author","customfield","product_price","woo_product_rating","woo_add_to_cart","badges"];

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
  const [alignValue, setAlignValue] = React.useState("Default");
  // console.log(props.indexes);
  useEffect(() => {
    if (selectedSubTab !== "star") return;
    const starTabAvailable =
      module?.key === "woo_product_rating" &&
      (item?.rating_display || "stars") === "stars";
    if (!starTabAvailable) {
      setSelectedSubTab("container");
    }
  }, [selectedSubTab, module?.key, item?.rating_display]);

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
    if (type !== "module") return;
    const settings =
      props.data?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings;
    if (settings?.icons?.icon != "") return;
    const next = clonePostLayoutData(props.data);
    const modRef = next?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
    if (!modRef) return;
    modRef.settings = {
      ...modRef.settings,
      icons: { ...modRef.settings?.icons, icon: "", visibility: false },
    };
    props.onChangeStyle(next);
  }, [iconsArray]);

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await apiClient.get(icons_url);
        if (response.data) {
          setIconsArray(response.data);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchIcons();
  }, []);
  const onSettingChange = (data) => {
    props.onSettingChange(data);
  };

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

  const {
    styleStateSpacing,
    styleStatePosition,
    styleStateBg,
    styleStateAl,
    styleStateBr,
    styleStateBs,
  } = resolvePostDesignTabStyleStates({
    hoverSwitchSpacing,
    hoverSwitchPosition,
    hoverSwitchBg,
    hoverSwitchAl,
    hoverSwitchBr,
    hoverSwitchBs,
  });

  const onChangeTab = (key) => {
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
  const handleHover = (value) => {
    // console.log("Hovered:", value);
    setHoverValue(value);
  };

  // let tab_items = [
  //   {
  //     key: "container",
  //     label: "Container",
  //   },
  // (item?.prefix?.is_enable === "true" || item?.suffix?.is_enable === "true") && module?.key === "customfield"  &&
  // { key: "meta", label: "Meta" },
  // ];

  const effectiveLayoutStyleTab = selectedSubTab !== "container" ? selectedSubTab : "";

  const flexFlow = resolveFlexFlowForPostDesignTab({
    data: props.data,
    type,
    rowindex,
    columnindex,
    moduleindex,
    module,
    device,
    styleStateAl,
    styleTab: effectiveLayoutStyleTab,
  });

  const displayProperty = resolveDisplayPropertyForPostDesignTab({
    data: props.data,
    type,
    rowindex,
    columnindex,
    moduleindex,
    module,
    device,
    styleStateAl,
    styleTab: effectiveLayoutStyleTab,
  });

  const { opt1, opt2 } = buildFlexAlignOptions(flexFlow);

  //  let cfsubTabItems = [
  //   module?.key === "customfield" && (item?.prefix?.is_enable ==="true" || item?.suffix?.is_enable ==="true")?
  //   {
  //     key: "container",
  //     label: module?.key === "customfield" && item?.prefix?.is_enable === "true" ? "Prefix + Content" : module?.key === "customfield" && item?.suffix?.is_enable === "true" ? "Content + Suffix" :"Main",
  //   }:null,
  //   module?.key === "customfield" && (item?.prefix?.is_enable ==="true" && item?.suffix?.is_enable ==="true")
  //     ? {
  //       key:"meta",
  //       label:"Content + Suffix",
  //     } : null,
  // ].filter(Boolean);
    const handleSettingChange = (value) => {
    setSelectedSubTab(value);
  }

  const SubTabLayoutItems = buildPostDesignTabSubTabLayoutItems({
    module,
    item,
    modulesKeysArray,
  });
  const hasOnlyStarLayoutTab =
    Array.isArray(SubTabLayoutItems) &&
    SubTabLayoutItems.length === 1 &&
    SubTabLayoutItems[0]?.key === "star";

  
  const handleCollapseChange = (key) => {

    if(!key || !Array.isArray(key) || key.length === 0) return;

    if(type !=="module") return;

    // let collapseKey = 0 ;
    // if(Array.isArray(key) && key.length > 0){
    //   collapseKey = key[0];
    // }

    const activeCollapseKey = key[0];
    if (module?.key === "categories" && activeCollapseKey === "1") {
      setSelectedSubTab("meta");
      return;
    }

    if (activeCollapseKey === "0" && hasOnlyStarLayoutTab) {
      setSelectedSubTab("star");
      return;
    }

    setSelectedSubTab("container");


    };

  const handleBgType = (key) => {
    setBgType(key);
    if (type !== "row" && type !== "column") return;
    const next = clonePostLayoutData(props.data);
    applyPostDesignTabBgTypeChange({
      key,
      next,
      type,
      rowindex,
      columnindex,
    });
    props.onChangeStyle(next);
  };

  const subTabCommonItems = buildPostDesignTabSubTabCommonItems({ item });
  const textSubTabItems = buildPostDesignTabTextSubTabItems({ item, module });
  const showTextSubTabs = shouldShowPostDesignTabTextSubTabs({
    item,
    module,
    modulesKeysArray,
  });

  let styleItems = [
    ...buildPostDesignTabStyleItemsPart1({
      props,
      module,
      item,
      modulesKeysArray,
      selectedSubTab,
      handleSettingChange,
      SubTabLayoutItems,
      subTabCommonItems,
      textSubTabItems,
      showTextSubTabs,
      onChangeStyle,
      styleStateAl,
      hoverValue,
      handleHover,
      flexFlow,
      displayProperty,
      opt1,
      opt2,
      fontFamilyArray,
      hoverSwitchText,
      onHoverSwitchText,
    }),
    ...buildPostDesignTabStyleItemsPart2({
      props,
      module,
      item,
      modulesKeysArray,
      selectedSubTab,
      handleSettingChange,
      subTabCommonItems,
      onChangeStyle,
      styleStateSpacing,
      hoverSwitchSpacing,
      onHoverSwitchSpacing,
      isMarginVerticalJoint,
      toggleMarginVerticalJoint,
      isMarginHorizontalJoint,
      toggleMarginHorizontalJoint,
      isPaddingVerticalJoint,
      togglePaddingVerticalJoint,
      isPaddingHorizontalJoint,
      togglePaddingHorizontalJoint,
      iconsArray,
    }),
    ...buildPostDesignTabStyleItemsPart3({
      props,
      module,
      item,
      modulesKeysArray,
      selectedSubTab,
      handleSettingChange,
      subTabCommonItems,
      onChangeStyle,
      type,
      bgType,
      handleBgType,
      styleStateBg,
      hoverSwitchBg,
      onHoverSwitchBg,
      styleStateBr,
      hoverSwitchBr,
      onHoverSwitchBr,
      styleStateBs,
      hoverSwitchBs,
      onHoverSwitchBs,
    }),
  ];

  return (
    <>
      {(
        <div className="row-design-tab-data">
          {props.widgets === "1" ? (
            <PostDesignTabWidgetsCollapse
              tabProps={props}
              onChangeStyle={onChangeStyle}
              styleStateAl={styleStateAl}
              hoverValue={hoverValue}
              handleHover={handleHover}
              type={type}
              displayProperty={displayProperty}
            />
          ) : (
            <>
              {styleTab === "container" && (
                <>
                  <Collapse
                    //defaultActiveKey={["1"]}
                    expandIconPlacement="end"
                    expandIcon={({ isActive }) => (
                      <CaretDownOutlined rotate={isActive ? 180 : 0} />
                    )}
                    onChange={handleCollapseChange}
                    accordion ={true}
                    items={(() => {
                      if (type !== "module") {
                        return styleItems.filter(
                          (item) =>
                            item.key !== "1" &&
                            item.key !== "6" &&
                            item.key !== "4"
                        );
                      }
                      if (type === "module" && module?.key === "image") {
                        return styleItems.filter(
                          (item) =>
                            item.key !== "1" &&
                            item.key !== "5" &&
                            item.key !== "4"
                        );
                      }
                      return styleItems.filter((item) => item.key !== "4");
                    })()}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default DesignTab;
