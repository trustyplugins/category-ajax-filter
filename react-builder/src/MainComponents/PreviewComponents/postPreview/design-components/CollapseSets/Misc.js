import React, { useState, useEffect } from "react";
import { Skeleton, Collapse, Switch, Row, Col, Tooltip ,Segmented} from "antd";
import { PreviewDesignTabInnerTabs } from "../common-component/PreviewDesignTabInnerTabs";
import SliderMain from "../common-component/SliderMain";
import SelectMain from "../common-component/SelectMain";
import ColorMain from "../common-component/ColorMain";
import AlignMain from "../common-component/AlignMain";
import BorderMain from "../common-component/BorderMain";
import BoxShadow from "../common-component/BoxShadow";
import TextMain from "../common-component/TextMain";
import InputMain2 from "../../GeneralComponents/CommonComponents/InputMain";
import SwitchMain2 from "../../GeneralComponents/CommonComponents/SwitchMain";
import InputMain from "../common-component/InputMain";
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
import { resolvePreviewTemplateDataFromBuilderData } from "../../../../utils/builderDataAdapters";
import {resolvePropertyForPreViewMiscDesignTab,buildFlexAlignOptions} from "./previewDesignTabDerivedState"
import { collapseMainContentClass } from "../../../../utils/collapseMainContentClass";
const Misc = (props) => {
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let miscPreviewData = previewTemplateData?.misc_preview_data;
  let dndColData  = miscPreviewData?.dnd_column_data;
  const commitPreviewPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data) {
      nextBuilder.common_data.preview_template_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data.misc_preview_data) {
      nextBuilder.common_data.preview_template_data.misc_preview_data = {};
    }
    mutator(nextBuilder.common_data.preview_template_data.misc_preview_data);
    props.miscPreviewStyle(nextBuilder);
  };
  const {
    type,
    column_index,
    item_index,
    itemKey,
    itemData: selectedItemData,
  } = props?.selectedItemDnd;
  const itemData =
    dndColData?.[column_index]?.data?.[item_index] || selectedItemData;
  let device = props?.deviceSwitch;
  const site_url = tc_caf_ajax.plugin_path;
  const baseUrl = site_url + "admin/google-fonts.json";
   const [loadingMeta, setLoadingMeta] = useState(false);
  const [deviceType, setDeviceType] = useState("desktop");
  const [hoverSwitchText, setHoverSwitchText] = useState(false);
  const [fontFamilyArray, setFontFamilyArray] = useState("");
  const [hoverSwitchSpacing, setHoverSwitchSpacing] = useState(false);
  const [hoverSwitchPosition, setHoverSwitchPosition] = useState(false);
  const [hoverSwitchBg, setHoverSwitchBg] = useState(false);
  const [hoverSwitchAl, setHoverSwitchAl] = useState(false);
  const [hoverSwitchBr, setHoverSwitchBr] = useState(false);
  const [hoverSwitchBs, setHoverSwitchBs] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [SortingTab, setSortingTab] = useState("main");
  const [selectedTab ,setSelectedTab] =useState('container');
  const [seletedMetaTab ,setSeletedMetaTab] =useState('');
  const [activeCollapsePanelKey, setActiveCollapsePanelKey] = useState(null);
  const isCollapsePanelOpen = (panelKey) => activeCollapsePanelKey === panelKey;
  const Tabs = ({ collapsePanelKey, ...rest }) => (
    <PreviewDesignTabInnerTabs
      isCollapseOpen={isCollapsePanelOpen(collapsePanelKey)}
      {...rest}
    />
  );
  const resolveDefaultMetaTabForCurrentSelection = (
    nextSelectedTab = selectedTab,
  ) => {
    if (type !== "item" || nextSelectedTab !== "container") {
      return "";
    }

    const styleTabs =
      dndColData?.[column_index]?.data?.[item_index]?.style || {};
    const orderedKeys = [
      "container",
      "meta",
      "meta1",
      "meta2",
      "meta3",
      "meta4",
      "input",
      "icon",
      "count",
    ];
    const firstAvailable = orderedKeys.find((key) => styleTabs?.[key]);
    return firstAvailable || "container";
  };

  const effectiveSelectedTab =
    selectedTab === "container"
      ? seletedMetaTab || resolveDefaultMetaTabForCurrentSelection()
      : selectedTab;
  // const [sortingLabel ,setSortingLabel]=useState({
  //   key: "label",
  //   label: "Label",
  // })
    const [hoverValue, setHoverValue] = useState(
    "Hover an option to see direction and wrap values.",
  );

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
  

  useEffect(()=>{
    setLoadingMeta(true);
    setActiveCollapsePanelKey(null);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
  },[type,column_index ,item_index,itemKey])

  useEffect(() => {
    if (type !== "item" || selectedTab !== "container") {
      return;
    }

    const defaultMetaTab = resolveDefaultMetaTabForCurrentSelection();
    if (!defaultMetaTab) {
      return;
    }

    if (!seletedMetaTab || !dndColData?.[column_index]?.data?.[item_index]?.style?.[seletedMetaTab]) {
      setSeletedMetaTab(defaultMetaTab);
    }
  }, [type, selectedTab, column_index, item_index, itemKey]);

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

// useEffect(()=>{
//   if(miscPreviewData.sorting.label?.is_label == 'true'){
//     setSortingLabel({
//       key: "label",
//       label: "Label",
//     })
//   }else{
//     setSortingLabel({})
//   }
// },[miscPreviewData.sorting.label?.is_label])

//   const SortingTabItems = [
//     {
//       key: "main",
//       label: "Main",
//     },
//     ,sortingLabel
//   ];

  useEffect(() => {
    
    // if(selectedTab === "meta" && itemKey === "sorting"){
    //   setHoverSwitchText("placeholder");
    //   setHoverSwitchSpacing("placeholder");
    //   setHoverSwitchBg("placeholder");
    //   setHoverSwitchBr("placeholder");
    //   setHoverSwitchBs("placeholder");
    // }else{
    //   setHoverSwitchText(false);
    //   setHoverSwitchSpacing(false);
    //   setHoverSwitchPosition(false);
    //   setHoverSwitchBg(false);
    //   setHoverSwitchAl(false);
    //   setHoverSwitchBr(false);
    //   setHoverSwitchBs(false);
    // }
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
  }, [props.deviceSwitch,selectedTab,itemKey]);
  const onHoverSwitchText = (checked) => {
    setHoverSwitchText(checked);
  };
  const onHoverSwitchSpacing = (checked) => {
    setHoverSwitchSpacing(checked);
  };
  const onHoverSwitchPosition = (checked) => {
    setHoverSwitchPosition(checked);
  };
  const onHoverSwitchBg = (checked) => {
    setHoverSwitchBg(checked);
  };
  const onHoverSwitchAl = (checked) => {
    setHoverSwitchAl(checked);
  };
  const onHoverSwitchBr = (checked) => {
    setHoverSwitchBr(checked);
  };
  const onHoverSwitchBs = (checked) => {
    setHoverSwitchBs(checked);
  };

  let styleStateSpacing = "default";
  if (hoverSwitchSpacing === true) {
    styleStateSpacing = "hover";
  }
  else if (hoverSwitchSpacing === 'selected') {
    styleStateSpacing = "selected";
  }
  else if (hoverSwitchSpacing === 'placeholder') {
    styleStateSpacing = "placeholder";
  }

  let styleStatePosition = "default";
  if (hoverSwitchPosition) {
    styleStatePosition = "hover";
  }
  else if (hoverSwitchPosition === 'selected') {
    styleStatePosition = "selected";
  }

  let styleStateBg = "default";
  if (hoverSwitchBg === true) {
    styleStateBg = "hover";
  }
  else if (hoverSwitchBg === 'selected') {
    styleStateBg = "selected";
  }
  else if (hoverSwitchBg === 'placeholder') {
    styleStateBg = "placeholder";
  }

  let styleStateAl = "default";
  if (hoverSwitchAl) {
    styleStateAl = "hover";
  }
  else if (hoverSwitchAl === 'selected') {
    styleStateAl = "selected";
  }

  let styleStateBr = "default";
  if (hoverSwitchBr === true) {
    styleStateBr = "hover";
  }
  else if (hoverSwitchBr === 'selected') {
    styleStateBr = "selected";
  }
  else if (hoverSwitchBr === 'placeholder') {
    styleStateBr = "placeholder";
  }

  let styleStateBs = "default";
  if (hoverSwitchBs === true) {
    styleStateBs = "hover";
  }
  else if (hoverSwitchBs === 'selected') {
    styleStateBs = "selected";
  }
  else if (hoverSwitchBs === 'placeholder') {
    styleStateBs = "placeholder";
  }


  let styleStateText = "default";
  if (hoverSwitchText) {
    styleStateText = "hover";
  }
  else if (hoverSwitchText === 'selected') {
    styleStateText = "selected";
  }
  else if (hoverSwitchText === 'placeholder') {
    styleStateText = "placeholder";
  }
  else{
    styleStateText = "default";
  }

   const handleHover = (value) => {
    setHoverValue(value);
  };



//  if(type === "column"){
//   if (
//     dndColData?.[column_index]?.["style"][device]?.[styleStateAl]?.[
//       "flexFlow"
//     ]
//   ) {
//     flexFlow =
//       dndColData?.[column_index]["style"][device][styleStateAl]["flexFlow"];
//   } else {
//     if (device == "desktop") {
//       if (styleStateAl == "hover") {
//         if (
//           dndColData?.[column_index]?.["style"]?.[device]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]["style"][device]["default"][
//               "flexFlow"
//             ];
//         }
//       }
//     }
//     if (device == "tablet") {
//       if (styleStateAl == "default") {
//         if (
//           dndColData?.[column_index]?.["style"]?.["desktop"]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]["style"]["desktop"]["default"][
//               "flexFlow"
//             ];
//         }
//       } else {
//         if (
//           dndColData?.[column_index]?.["style"]?.[device]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]["style"][device]["default"][
//               "flexFlow"
//             ];
//         } else {
//           if (
//             dndColData?.[column_index]?.["style"]?.["desktop"]?.["hover"]?.[
//               "flexFlow"
//             ]
//           ) {
//             flexFlow =
//               dndColData?.[column_index]["style"]["desktop"]["hover"][
//                 "flexFlow"
//               ];
//           } else {
//             if (
//               dndColData?.[column_index]?.["style"]?.["desktop"]?.[
//                 "default"
//               ]?.["flexFlow"]
//             ) {
//               flexFlow =
//                 dndColData?.[column_index]["style"]["desktop"]["default"][
//                   "flexFlow"
//                 ];
//             }
//           }
//         }
//       }
//     }
//     if (device == "mobile") {
//       if (styleStateAl == "default") {
//         if (
//           dndColData?.[column_index]?.["style"]?.["desktop"]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]["style"]["desktop"]["default"][
//               "flexFlow"
//             ];
//         }
//       } else {
//         if (
//           dndColData?.[column_index]?.["style"]?.[device]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]["style"][device]["default"][
//               "flexFlow"
//             ];
//         } else {
//           if (
//             dndColData?.[column_index]?.["style"]?.["desktop"]?.["hover"]?.[
//               "flexFlow"
//             ]
//           ) {
//             flexFlow =
//               dndColData?.[column_index]["style"]["desktop"]["hover"][
//                 "flexFlow"
//               ];
//           } else {
//             if (
//               dndColData?.[column_index]?.["style"]?.["desktop"]?.[
//                 "default"
//               ]?.["flexFlow"]
//             ) {
//               flexFlow =
//                 dndColData?.[column_index]["style"]["desktop"]["default"][
//                   "flexFlow"
//                 ];
//             }
//           }
//         }
//       }
//     }
//   }
//  }
// if(type === "item"){
//     if (
//     dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.[device]?.[styleStateAl]?.[
//       "flexFlow"
//     ]
//   ) {
//     flexFlow =
//       dndColData?.[column_index]?.data?.[item_index]["style"]?.[effectiveSelectedTab]?.[device][styleStateAl]["flexFlow"];
//   } else {
//     if (device == "desktop") {
//       if (styleStateAl == "hover") {
//         if (
//           dndColData?.[column_index]?.data?.[item_index]?.["style"][effectiveSelectedTab]?.[device]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.[device]["default"][
//               "flexFlow"
//             ];
//         }
//       }
//     }
//     if (device == "tablet") {
//       if (styleStateAl == "default") {
//         if (
//           dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.["desktop"]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]["desktop"]["default"][
//               "flexFlow"
//             ];
//         }
//       } else {
//         if (
//           dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.[device]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]?.data?.[item_index]["style"]?.[effectiveSelectedTab][device]["default"][
//               "flexFlow"
//             ];
//         } else {
//           if (
//             dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.["desktop"]?.["hover"]?.[
//               "flexFlow"
//             ]
//           ) {
//             flexFlow =
//               dndColData?.[column_index]?.data?.[item_index]["style"]?.[effectiveSelectedTab]?.["desktop"]["hover"][
//                 "flexFlow"
//               ];
//           } else {
//             if (
//               dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.["desktop"]?.[
//                 "default"
//               ]?.["flexFlow"]
//             ) {
//               flexFlow =
//                 dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]["desktop"]["default"][
//                   "flexFlow"
//                 ];
//             }
//           }
//         }
//       }
//     }
//     if (device == "mobile") {
//       if (styleStateAl == "default") {
//         if (
//           dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.["desktop"]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]["desktop"]["default"][
//               "flexFlow"
//             ];
//         }
//       } else {
//         if (
//           dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.[device]?.["default"]?.[
//             "flexFlow"
//           ]
//         ) {
//           flexFlow =
//             dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab][device]["default"][
//               "flexFlow"
//             ];
//         } else {
//           if (
//             dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.["desktop"]?.["hover"]?.[
//               "flexFlow"
//             ]
//           ) {
//             flexFlow =
//               dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]["desktop"]["hover"][
//                 "flexFlow"
//               ];
//           } else {
//             if (
//               dndColData?.[column_index]?.data?.[item_index]?.["style"]?.[effectiveSelectedTab]?.["desktop"]?.[
//                 "default"
//               ]?.["flexFlow"]
//             ) {
//               flexFlow =
//                 dndColData?.[column_index]?.data?.[item_index]["style"]?.[effectiveSelectedTab]["desktop"]["default"][
//                   "flexFlow"
//                 ];
//             }
//           }
//         }
//       }
//     }
//   }
//  }

  // let opt1 = [];
  // let opt2 = [];
  // if (flexFlow === "column wrap" || flexFlow === "column wrap-reverse") {
  //   opt1 = [
  //     {
  //       value: "flex-start",
  //       label: `${
  //         flexFlow === "row-reverse" ||
  //         flexFlow === "row-reverse wrap" ||
  //         flexFlow === "row-reverse wrap-reverse"
  //           ? "Right"
  //           : "Left"
  //       }`,
  //     },
  //     {
  //       value: "center",
  //       label: "Center",
  //     },
  //     {
  //       value: "flex-end",
  //       label: `${
  //         flexFlow === "row-reverse" ||
  //         flexFlow === "row-reverse wrap" ||
  //         flexFlow === "row-reverse wrap-reverse"
  //           ? "Left"
  //           : "Right"
  //       }`,
  //     },
  //     {
  //       value: "stretch",
  //       label: "Stretch",
  //     },
  //     {
  //       value: "baseline",
  //       label: "Baseline",
  //     },
  //   ];
  //   opt2 = [
  //     {
  //       value: "flex-start",
  //       label: "Top",
  //     },
  //     {
  //       value: "center",
  //       label: "Center",
  //     },
  //     {
  //       value: "flex-end",
  //       label: "Bottom",
  //     },
  //     {
  //       value: "space-between",
  //       label: "Space between",
  //     },
  //     {
  //       value: "space-around",
  //       label: "Space around",
  //     },
  //     {
  //       value: "space-evenly",
  //       label: "Space evenly",
  //     },
  //   ];
  // } else if (
  //   flexFlow === "column-reverse" ||
  //   flexFlow === "column-reverse wrap" ||
  //   flexFlow === "column-reverse wrap-reverse"
  // ) {
  //   opt1 = [
  //     {
  //       value: "flex-start",
  //       label: "Left",
  //     },
  //     {
  //       value: "center",
  //       label: "Center",
  //     },
  //     {
  //       value: "flex-end",
  //       label: "Right",
  //     },
  //     {
  //       value: "stretch",
  //       label: "Stretch",
  //     },
  //     {
  //       value: "baseline",
  //       label: "Baseline",
  //     },
  //   ];
  //   opt2 = [
  //     {
  //       value: "flex-end",
  //       label: "Top",
  //     },
  //     {
  //       value: "center",
  //       label: "Center",
  //     },
  //     {
  //       value: "flex-start",
  //       label: "Bottom",
  //     },
  //     {
  //       value: "space-between",
  //       label: "Space between",
  //     },
  //     {
  //       value: "space-around",
  //       label: "Space around",
  //     },
  //     {
  //       value: "space-evenly",
  //       label: "Space evenly",
  //     },
  //   ];
  // } else {
  //   opt1 = [
  //     {
  //       value: "flex-start",
  //       label: `${
  //         flexFlow === "row-reverse" ||
  //         flexFlow === "row-reverse wrap" ||
  //         flexFlow === "row-reverse wrap-reverse"
  //           ? "Right"
  //           : "Left"
  //       }`,
  //     },
  //     {
  //       value: "center",
  //       label: "Center",
  //     },
  //     {
  //       value: "flex-end",
  //       label: `${
  //         flexFlow === "row-reverse" ||
  //         flexFlow === "row-reverse wrap" ||
  //         flexFlow === "row-reverse wrap-reverse"
  //           ? "Left"
  //           : "Right"
  //       }`,
  //     },
  //     {
  //       value: "space-between",
  //       label: "Space between",
  //     },
  //     {
  //       value: "space-around",
  //       label: "Space around",
  //     },
  //     {
  //       value: "space-evenly",
  //       label: "Space evenly",
  //     },
  //   ];
  //   opt2 = [
  //     {
  //       value: "flex-start",
  //       label: "Top",
  //     },
  //     {
  //       value: "center",
  //       label: "Center",
  //     },
  //     {
  //       value: "flex-end",
  //       label: "Bottom",
  //     },
  //     {
  //       value: "stretch",
  //       label: "Stretch",
  //     },
  //     {
  //       value: "baseline",
  //       label: "Baseline",
  //     },
  //   ];
  // }

  let flexFlow = "";

  if(type === "column"){
    flexFlow = resolvePropertyForPreViewMiscDesignTab({
      data: dndColData?.[column_index],
      type:type,
      selectedTab: effectiveSelectedTab,
      device,
      styleState: styleStateAl,
      property: "flexFlow",
      
    });
  }
  
  if(type === "item"){
    flexFlow = resolvePropertyForPreViewMiscDesignTab({
      data: dndColData?.[column_index]?.data?.[item_index],
      type:type,
      selectedTab: effectiveSelectedTab,
      device,
      styleState: styleStateAl,
      property: "flexFlow",
      
    });
  }
  let { opt1, opt2 } = buildFlexAlignOptions(flexFlow);

  let displayProperty ="";

  if(type === "column"){
    displayProperty = resolvePropertyForPreViewMiscDesignTab({
      data: dndColData?.[column_index],
      type:type,
      selectedTab: effectiveSelectedTab,
      device,
      styleState: styleStateAl,
      property: "display",
      
    });
  }
  
  if(type === "item"){
    displayProperty = resolvePropertyForPreViewMiscDesignTab({
      data: dndColData?.[column_index]?.data?.[item_index],
      type:type,
      selectedTab: effectiveSelectedTab,
      device,
      styleState: styleStateAl,
      property: "display",
      
    });
  }


  const miscPreviewStyle = (data) => {
    commitPreviewPatch((miscPreview) => {
      miscPreview[props.selectedModule] = data;
    });
  };

  const miscSortingLabelStyle = (data) => {
    commitPreviewPatch((miscPreview) => {
      if (!miscPreview[props.selectedModule]) {
        miscPreview[props.selectedModule] = {};
      }
      miscPreview[props.selectedModule].label = data;
    });
  };
  const miscLoaderIconStyle = (data) => {
    commitPreviewPatch((miscPreview) => {
      if (!miscPreview[props.selectedModule]) {
        miscPreview[props.selectedModule] = {};
      }
      miscPreview[props.selectedModule].icon_data = data;
    });
  };
  // const handleChangeSortingTab = (key) => {
  //   setSortingTab(key);
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 500);
  // };

const updateDndColData = (newColumnObj) => {

  const updatedData = [...dndColData];

  updatedData[column_index] = newColumnObj;

  commitPreviewPatch((miscPreview) => {
    miscPreview.dnd_column_data = updatedData;
  });
};
const updateDndColSettingData = (newSettingObj) => {

  const updatedData = [...dndColData];

  updatedData[column_index]['settings'] = newSettingObj;

  commitPreviewPatch((miscPreview) => {
    miscPreview.dnd_column_data = updatedData;
  });
};

const updateDndColItemData = (newItemObj) => {

  const updatedData = [...dndColData];

  updatedData[column_index]['data'][item_index] = newItemObj;

  commitPreviewPatch((miscPreview) => {
    miscPreview.dnd_column_data = updatedData;
  });
};

const updateDndColItemSettingsData = (newSettingsObj) => {

  const updatedData = [...dndColData];

  updatedData[column_index]['data'][item_index]['settings'] = newSettingsObj;
  commitPreviewPatch((miscPreview) => {
    miscPreview.dnd_column_data = updatedData;
  });
};

//console.log(dndColData[column_index]);


  // let CommonModuleItems = [
  //   {
  //     key: "1",
  //     label: "Text",
  //     children: (
  //       <div className="collapse-main-content">
  //         <div className="hoverswitchguard">
  //           <Switch
  //             checkedChildren="hover"
  //             unCheckedChildren="default"
  //             onChange={onHoverSwitchText}
  //             checked={hoverSwitchText}
  //             className="hoverSwitch"
  //           />
  //         </div>
  //         <TextMain
  //           data={miscPreviewData?.[props.selectedModule]}
  //           onChangeStyle={miscPreviewStyle}
  //           fonts={fontFamilyArray}
  //           hoverSwitch={hoverSwitchText}
  //           deviceSwitch={props.deviceSwitch}
  //           style="style"
  //         />
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "2",
  //     label: "Sizing",
  //     children: (
  //       <div className="collapse-main-content">
  //         <SliderMain
  //           data={miscPreviewData?.[props.selectedModule]}
  //           property="width"
  //           label="Width"
  //           defaultSuffix="%"
  //           defaultValue="100"
  //           onChangeStyle={miscPreviewStyle}
  //           deviceSwitch={props.deviceSwitch}
  //           style="style"
  //         />
  //         <SliderMain
  //           data={miscPreviewData?.[props.selectedModule]}
  //           property="height"
  //           label="Height"
  //           defaultSuffix="%"
  //           defaultValue="100"
  //           onChangeStyle={miscPreviewStyle}
  //           deviceSwitch={props.deviceSwitch}
  //           style="style"
  //         />
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "3",
  //     label: "Spacing",
  //     children: (
  //       <div className="collapse-main-content">
  //         <div className="hoverswitchguard">
  //           <Switch
  //             checkedChildren="hover"
  //             unCheckedChildren="default"
  //             onChange={onHoverSwitchSpacing}
  //             checked={hoverSwitchSpacing}
  //             className="hoverSwitch"
  //           />
  //         </div>

  //         <Row className="without-border">
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="paddingTop"
  //             label="Padding Top"
  //             defaultSuffix="px"
  //             defaultValue="20"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="paddingRight"
  //             label="Padding Right"
  //             defaultSuffix="px"
  //             defaultValue="20"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //         </Row>
  //         <Row>
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="paddingBottom"
  //             label="Padding Bottom"
  //             defaultSuffix="px"
  //             defaultValue="20"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="paddingLeft"
  //             label="Padding Left"
  //             defaultSuffix="px"
  //             defaultValue="20"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //         </Row>
  //         <Row>
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="marginTop"
  //             label="Margin Top"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="marginRight"
  //             label="Margin Right"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //         </Row>
  //         <Row>
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="marginBottom"
  //             label="Margin Bottom"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //           <SliderMain
  //             data={miscPreviewData?.[props.selectedModule]}
  //             property="marginLeft"
  //             label="Margin Left"
  //             defaultSuffix="px"
  //             defaultValue="0"
  //             extraClass="colm2"
  //             styleState={styleStateSpacing}
  //             onChangeStyle={miscPreviewStyle}
  //             deviceSwitch={props.deviceSwitch}
  //             style="style"

  //           />
  //         </Row>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "4",
  //     label: "Background",
  //     children: (
  //       <div className="collapse-main-content">
  //         <div className="hoverswitchguard">
  //           <Switch
  //             checkedChildren="hover"
  //             unCheckedChildren="default"
  //             onChange={onHoverSwitchBg}
  //             checked={hoverSwitchBg}
  //             className="hoverSwitch"
  //           />
  //         </div>
  //         <ColorMain
  //           data={miscPreviewData?.[props.selectedModule]}
  //           property="backgroundColor"
  //           defaultValue="#333333"
  //           label="Background Color"
  //           onChangeStyle={miscPreviewStyle}
  //           styleState={styleStateBg}
  //           deviceSwitch={props.deviceSwitch}
  //           style="style"
  //         ></ColorMain>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "5",
  //     label: "Border",
  //     children: (
  //       <div className="collapse-main-content">
  //         <div className="hoverswitchguard">
  //           <Switch
  //             checkedChildren="hover"
  //             unCheckedChildren="default"
  //             onChange={onHoverSwitchBr}
  //             checked={hoverSwitchBr}
  //             className="hoverSwitch"
  //           />
  //         </div>
  //         <BorderMain
  //           data={miscPreviewData?.[props.selectedModule]}
  //           property="border"
  //           label="Border"
  //           deviceSwitch={props.deviceSwitch}
  //           onChangeStyle={miscPreviewStyle}
  //           styleState={styleStateBr}
  //           style="style"
  //         ></BorderMain>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "6",
  //     label: "Box Shadow",
  //     children: (
  //       <div className="collapse-main-content">
  //         <div className="hoverswitchguard">
  //           <Switch
  //             checkedChildren="hover"
  //             unCheckedChildren="default"
  //             onChange={onHoverSwitchBs}
  //             checked={hoverSwitchBs}
  //             className="hoverSwitch"
  //           />
  //         </div>
  //         <BoxShadow
  //           data={miscPreviewData?.[props.selectedModule]}
  //           property="boxShadow"
  //           label="Box Shadow"
  //           deviceSwitch={props.deviceSwitch}
  //           onChangeStyle={miscPreviewStyle}
  //           styleState={styleStateBs}
  //           style="style"
  //         ></BoxShadow>
  //       </div>
  //     ),
  //   },
  // ];
  // let LoaderItems = [
  //   {
  //     key: "1",
  //     label: "Text",
  //     children: (
  //       <div className="collapse-main-content">
  //         {/* <div className="hoverswitchguard">
  //           <Switch
  //             checkedChildren="hover"
  //             unCheckedChildren="default"
  //             onChange={onHoverSwitchText}
  //             checked={hoverSwitchText}
  //             className="hoverSwitch"
  //           />
  //         </div> */}
  //         {miscPreviewData?.[props.selectedModule].overlay == 'true' && (
  //         <ColorMain
  //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //           onChangeStyle={miscLoaderIconStyle}
  //           property="overlay"
  //           defaultValue="#00000080"
  //           label="Overlay Color"
  //           styleState="default"
  //           deviceSwitch={props.deviceSwitch}
  //           style="style"
  //         />
  //         )}
  //         <TextMain
  //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //           onChangeStyle={ miscLoaderIconStyle}
  //           fonts={fontFamilyArray}
  //           hoverSwitch={hoverSwitchText}
  //           deviceSwitch={props.deviceSwitch}
  //           style="style"
  //           removeExtra="loader"
  //         />
  //       </div>
  //     ),
  //   },
  //   // {
  //   //   key: "2",
  //   //   label: "Sizing",
  //   //   children: (
  //   //     <div className="collapse-main-content">
  //   //       <SliderMain
  //   //         data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //         onChangeStyle={ miscLoaderIconStyle}
  //   //         property="width"
  //   //         label="Width"
  //   //         defaultSuffix="%"
  //   //         defaultValue="100"
  //   //         deviceSwitch={props.deviceSwitch}
  //   //         style="style"
  //   //       />
  //   //       <SliderMain
  //   //         property="height"
  //   //         label="Height"
  //   //         defaultSuffix="%"
  //   //         defaultValue="100"
  //   //         data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //         onChangeStyle={ miscLoaderIconStyle}
  //   //         deviceSwitch={props.deviceSwitch}
  //   //         style="style"
  //   //       />
  //   //     </div>
  //   //   ),
  //   // },
  //   // {
  //   //   key: "3",
  //   //   label: "Spacing",
  //   //   children: (
  //   //     <div className="collapse-main-content">
  //   //       <div className="hoverswitchguard">
  //   //         <Switch
  //   //           checkedChildren="hover"
  //   //           unCheckedChildren="default"
  //   //           onChange={onHoverSwitchSpacing}
  //   //           checked={hoverSwitchSpacing}
  //   //           className="hoverSwitch"
  //   //         />
  //   //       </div>

  //   //       <Row className="without-border">
  //   //         <SliderMain
  //   //           property="paddingTop"
  //   //           label="Padding Top"
  //   //           defaultSuffix="px"
  //   //           defaultValue="20"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={ miscLoaderIconStyle}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"

  //   //         />
  //   //         <SliderMain
  //   //           property="paddingRight"
  //   //           label="Padding Right"
  //   //           defaultSuffix="px"
  //   //           defaultValue="20"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={ miscLoaderIconStyle}
  //   //         />
  //   //       </Row>
  //   //       <Row>
  //   //         <SliderMain
  //   //           property="paddingBottom"
  //   //           label="Padding Bottom"
  //   //           defaultSuffix="px"
  //   //           defaultValue="20"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={miscLoaderIconStyle}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"

  //   //         />
  //   //         <SliderMain
  //   //           property="paddingLeft"
  //   //           label="Padding Left"
  //   //           defaultSuffix="px"
  //   //           defaultValue="20"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={ miscLoaderIconStyle}
  //   //         />
  //   //       </Row>
  //   //       <Row>
  //   //         <SliderMain
  //   //           property="marginTop"
  //   //           label="Margin Top"
  //   //           defaultSuffix="px"
  //   //           defaultValue="0"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={ miscLoaderIconStyle}
  //   //         />
  //   //         <SliderMain
  //   //           property="marginRight"
  //   //           label="Margin Right"
  //   //           defaultSuffix="px"
  //   //           defaultValue="0"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={ miscLoaderIconStyle}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"

  //   //         />
  //   //       </Row>
  //   //       <Row>
  //   //         <SliderMain
  //   //           property="marginBottom"
  //   //           label="Margin Bottom"
  //   //           defaultSuffix="px"
  //   //           defaultValue="0"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={ miscLoaderIconStyle}
  //   //         />
  //   //         <SliderMain
  //   //           property="marginLeft"
  //   //           label="Margin Left"
  //   //           defaultSuffix="px"
  //   //           defaultValue="0"
  //   //           extraClass="colm2"
  //   //           styleState={styleStateSpacing}
  //   //           data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //           onChangeStyle={ miscLoaderIconStyle}
  //   //           deviceSwitch={props.deviceSwitch}
  //   //           style="style"

  //   //         />
  //   //       </Row>
  //   //     </div>
  //   //   ),
  //   // },
  //   // {
  //   //   key: "4",
  //   //   label: "Background",
  //   //   children: (
  //   //     <div className="collapse-main-content">
  //   //       <div className="hoverswitchguard">
  //   //         <Switch
  //   //           checkedChildren="hover"
  //   //           unCheckedChildren="default"
  //   //           onChange={onHoverSwitchBg}
  //   //           checked={hoverSwitchBg}
  //   //           className="hoverSwitch"
  //   //         />
  //   //       </div>
  //   //       <ColorMain
  //   //         data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //         onChangeStyle={ miscLoaderIconStyle}
  //   //         property="backgroundColor"
  //   //         defaultValue="#333333"
  //   //         label="Background Color"
  //   //         styleState={styleStateBg}
  //   //         deviceSwitch={props.deviceSwitch}
  //   //         style="style"
  //   //       />
  //   //       {miscPreviewData?.[props.selectedModule].overlay == 'true' && (
  //   //         <ColorMain
  //   //         data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //         onChangeStyle={miscLoaderIconStyle}
  //   //         property="overlay"
  //   //         defaultValue="#00000080"
  //   //         label="Overlay Color"
  //   //         styleState={styleStateBg}
  //   //         deviceSwitch={props.deviceSwitch}
  //   //         style="style"
  //   //       />
  //   //     )}
  //   //     </div>
  //   //   ),
  //   // },
  //   // {
  //   //   key: "5",
  //   //   label: "Border",
  //   //   children: (
  //   //     <div className="collapse-main-content">
  //   //       <div className="hoverswitchguard">
  //   //         <Switch
  //   //           checkedChildren="hover"
  //   //           unCheckedChildren="default"
  //   //           onChange={onHoverSwitchBr}
  //   //           checked={hoverSwitchBr}
  //   //           className="hoverSwitch"
  //   //         />
  //   //       </div>
  //   //       <BorderMain
  //   //         property="border"
  //   //         label="Border"
  //   //         deviceSwitch={props.deviceSwitch}
  //   //         data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //         onChangeStyle={ miscLoaderIconStyle}
  //   //         styleState={styleStateBr}
  //   //         style="style"
  //   //       ></BorderMain>
  //   //     </div>
  //   //   ),
  //   // },
  //   // {
  //   //   key: "6",
  //   //   label: "Box Shadow",
  //   //   children: (
  //   //     <div className="collapse-main-content">
  //   //       <div className="hoverswitchguard">
  //   //         <Switch
  //   //           checkedChildren="hover"
  //   //           unCheckedChildren="default"
  //   //           onChange={onHoverSwitchBs}
  //   //           checked={hoverSwitchBs}
  //   //           className="hoverSwitch"
  //   //         />
  //   //       </div>
  //   //       <BoxShadow
  //   //         property="boxShadow"
  //   //         label="Box Shadow"
  //   //         deviceSwitch={props.deviceSwitch}
  //   //         data={miscPreviewData?.[props.selectedModule].icon_data}
  //   //         onChangeStyle={ miscLoaderIconStyle}
  //   //         styleState={styleStateBs}
  //   //         style="style"
  //   //       ></BoxShadow>
  //   //     </div>
  //   //   ),
  //   // },
  // ];

  let selectedLayoutTabItems = [
    {
      key: "container",
      label: "Container",
    },
    {
      key: "meta",
      label: "Select Field",
    },
    {
      key: "meta1",
      label: "Options",
    },
  ].filter(Boolean);
    
  
  let ColItems = [
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
                  data={dndColData?.[column_index]}
                  property="display"
                  label="Display"
                  defaultValue="flex"
                  onChangeStyle={updateDndColData}
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
                  isNewTab={true}
                />
                {displayProperty === "flex" && (
                <div className="webflow-custom-dropdown new-caf-look">
                  <AlignMain
                    data={dndColData?.[column_index]}
                    property="flexFlow"
                    label="Direction"
                    defaultValue="row"
                    onChangeStyle={updateDndColData}
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
                  />
                </div> 
                )}
              </>
              {displayProperty === "flex" && (
                <>
                <div className="align-flex-flow">
                  <span class="flex-flow-align-label">Align</span>
                  <div
                    className={`flex-align-control ${
                      flexFlow === "column wrap" ||
                      flexFlow === "column wrap-reverse"
                        ? "caf-reverse-me1"
                        : ""
                    }`}
                  >
                    <SelectMain
                      data={dndColData?.[column_index]}
                      property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'alignItems' : "justifyContent"}`}
                      label={"X"}
                      defaultValue="flex-start"
                      onChangeStyle={updateDndColData}
                      styleState={styleStateAl}
                      style="style"
                      deviceSwitch={props.deviceSwitch}
                      class={"align-x-flex"}
                      options={opt1}
                    />
                    <SelectMain
                      data={dndColData?.[column_index]}
                      property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'justifyContent' : "alignItems"}`}
                      label={"Y"}
                      defaultValue="flex-start"
                      onChangeStyle={updateDndColData}
                      styleState={styleStateAl}
                      style="style"
                      deviceSwitch={props.deviceSwitch}
                      class={"align-y-flex"}
                      options={opt2}
                    />
                  </div>
                </div>
                <div className="webflow-slider webflow-gap-slider">
                  <SliderMain
                    data={dndColData?.[column_index]}
                    property="gap"
                    label="Gap"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateDndColData}
                    styleState={styleStateAl}
                    style="style"
                    deviceSwitch={props.deviceSwitch}
                    isSlider={true}
                  ></SliderMain>
                </div>
              </>
              )}

              <AlignMain
                data={dndColData?.[column_index]}
                property="float"
                label="Float"
                defaultValue="none"
                onChangeStyle={updateDndColData}
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
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("sizing")}>
              <SliderMain
                data={dndColData?.[column_index]}
                property="width"
                label="Width"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={updateDndColData}
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
              />
              <SliderMain
                data={dndColData?.[column_index]}
                property="height"
                label="Height"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={updateDndColData}
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
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
                    data={dndColData?.[column_index]}
                    property="marginTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                  />
                  <SliderMain
                    data={dndColData?.[column_index]}
                    property="marginBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                  />
                  <div
                    className={`spacing-joint ${
                      isMarginVerticalJoint ? "active" : ""
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
                    data={dndColData?.[column_index]}
                    property="marginLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                  />
                  <SliderMain
                    data={dndColData?.[column_index]}
                    property="marginRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                  />
                  <div
                    className={`spacing-joint ${
                      isMarginHorizontalJoint ? "active" : ""
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
                    data={dndColData?.[column_index]}
                    property="paddingTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                  />
                  <SliderMain
                    data={dndColData?.[column_index]}
                    property="paddingBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                  />
                  <div
                    className={`spacing-joint ${
                      isPaddingVerticalJoint ? "active" : ""
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
                    data={dndColData?.[column_index]}
                    property="paddingLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                  />
                  <SliderMain
                    data={dndColData?.[column_index]}
                    property="paddingRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="10"
                    onChangeStyle={updateDndColData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                  />
                  <div
                    className={`spacing-joint ${
                      isPaddingHorizontalJoint ? "active" : ""
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
                data={dndColData?.[column_index]}
                property="backgroundColor"
                defaultValue="#00000000"
                label="Background Color"
                onChangeStyle={updateDndColData}
                styleState={styleStateBg}
                deviceSwitch={props.deviceSwitch}
                style="style"
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
            data={dndColData?.[column_index]}
            property="border"
            label="Border"
            onChangeStyle={updateDndColData}
            styleState={styleStateBr}
            deviceSwitch={props.deviceSwitch}
            style="style"
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
            data={dndColData?.[column_index]}
            property="boxShadow"
            label="Box Shadow"
            onChangeStyle={updateDndColData}
            styleState={styleStateBs}
            deviceSwitch={props.deviceSwitch}
            style="style"
          ></BoxShadow>
        </div>
            )}
        </>
      ),
    },
  ];

// console.log(itemData?.settings,itemKey)

  let ItemsData = [
     {
      key: "0",
      label: "Layout",
      children: (
        <>
          {itemKey === "selected" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="0"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                },
                itemData?.settings?.close_button === "true" ?  
                {
                key: "meta",
                label: "Item",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "pagination" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="0"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Container",
                },
                itemData?.settings?.pagination_type === "number2" ?  
                {
                key: "meta2",
                label: "Numbers",
                }:null,
                (itemData?.settings?.pagination_type === "load-more" &&  itemData?.settings?.load_more?.icon_enable === "true" )?  
                {
                key: "meta",
                label: "Load More",
                }:null,  
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("layout", "webflow-sync")}>
              <>
                <AlignMain
                  data={dndColData?.[column_index]?.data?.[item_index]}
                  property="display"
                  label="Display"
                  defaultValue="flex"
                  onChangeStyle={updateDndColItemData}
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
                  isNewTab={true}
                  styleTab={selectedTab === "container" ? "container" : selectedTab }
                  isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                />
                  {displayProperty === "flex" && (
                  <div className="webflow-custom-dropdown new-caf-look">
                    <AlignMain
                      data={dndColData?.[column_index]?.data?.[item_index]}
                      property="flexFlow"
                      label="Direction"
                      defaultValue="row"
                      onChangeStyle={updateDndColItemData}
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
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                    />
                  </div> 
                  )}
              </>
              {displayProperty === "flex" && (
                <>
                <div className="align-flex-flow">
                  <span class="flex-flow-align-label">Align</span>
                  <div
                    className={`flex-align-control ${
                      flexFlow === "column wrap" ||
                      flexFlow === "column wrap-reverse"
                        ? "caf-reverse-me1"
                        : ""
                    }`}
                  >
                    <SelectMain
                      data={dndColData?.[column_index]?.data?.[item_index]}
                      property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'alignItems' : "justifyContent"}`}
                      label={"X"}
                      defaultValue="flex-start"
                      onChangeStyle={updateDndColItemData}
                      styleState={styleStateAl}
                      style="style"
                      deviceSwitch={props.deviceSwitch}
                      class={"align-x-flex"}
                      options={opt1}
                      styleTab={selectedTab === "container" ? "container" : selectedTab }
                      isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                    />
                    <SelectMain
                      data={dndColData?.[column_index]?.data?.[item_index]}
                      property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'justifyContent' : "alignItems"}`}
                      label={"Y"}
                      defaultValue="flex-start"
                      onChangeStyle={updateDndColItemData}
                      styleState={styleStateAl}
                      style="style"
                      deviceSwitch={props.deviceSwitch}
                      class={"align-y-flex"}
                      options={opt2}
                      styleTab={selectedTab === "container" ? "container" : selectedTab }
                      isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                    />
                  </div>
                </div>
                <div className="webflow-slider webflow-gap-slider">
                  <SliderMain
                    data={dndColData?.[column_index]?.data?.[item_index]}
                    property="gap"
                    label="Gap"
                    defaultSuffix="px"
                    defaultValue="0"
                    onChangeStyle={updateDndColItemData}
                    styleState={styleStateAl}
                    style="style"
                    deviceSwitch={props.deviceSwitch}
                    isSlider={true}
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  ></SliderMain>
                </div>
                </>
              )}

              <AlignMain
                data={dndColData?.[column_index]?.data?.[item_index]}
                property="float"
                label="Float"
                defaultValue="none"
                onChangeStyle={updateDndColItemData}
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
                styleTab={selectedTab === "container" ? "container" : selectedTab }
                isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
              />
            </div>
          )}
        </>
      ),
    },   
    {
      key: "1",
      label: "Text",
      children: (
        <>
          {itemKey === "result_count" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="1"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "All",
                },
                itemData?.settings?.prefix?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Prefix",
                }:null,
                itemData?.settings?.suffix?.is_enable === "true" ?  
                {
                key: "meta1",
                label: "Suffix",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "selected" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="1"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[   
                {
                key: "meta",
                label: "Item",
                },
                itemData?.settings?.close_button === "true" ?  
                {
                key: "meta1",
                label: "Close Icon",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "pagination" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="1"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={
                itemData?.settings?.pagination_type === "number2" ?  
                [  
                {
                key: "meta",
                label: "Button",
                }, 
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "number"?   [  
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "button" || itemData?.settings?.pagination_type === "load-more" ? [    
                {
                key: "meta",
                label: itemData?.settings?.pagination_type === "button" ? "Button" : "Load More",
                },]:[]
          }
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
          {loadingMeta ? (
              <Skeleton active />
            ) : ( 
        <div className={collapseMainContentClass("text")}>
          <div className="hoverswitchguard">
              <Segmented
                value={hoverSwitchText}
                style={{ marginBottom: 8 }}
                onChange={onHoverSwitchText}
                className="hoverTabCaf"
                //defaultValue={(selectedTab === "meta" && itemKey === "sorting")? "placeholder":hoverSwitchText}
                options={
                  selectedTab === "meta" && itemKey === "sorting"
                    ? [
                        { label: "Placeholder", value: false },
                        { label: "Selected", value: "selected" },
                      ]
                    : 
                     selectedTab === "meta1" && itemKey === "sorting" ?
                      [
                      { label: "Default", value: false },
                      { label: "Hover", value: true },
                      { label: "Selected", value: "selected" },
                      ]:
                      seletedMetaTab === "meta1" && itemKey === "pagination" ?
                      [
                      { label: "Default", value: false },
                      { label: "Hover", value: true },
                      { label: "Selected", value: "selected" },
                      ]:
                      [
                        { label: "Default", value: false },
                        { label: "Hover", value: true },
                      ]
                }
              />
          </div>
          <TextMain
            data={dndColData?.[column_index]?.data?.[item_index]}
            property="text"
            label="Text"
            onChangeStyle={updateDndColItemData}
            fonts={fontFamilyArray}
            hoverSwitch={hoverSwitchText}
            deviceSwitch={props.deviceSwitch}
            style="style"
            isSlider={true}
            styleTab={selectedTab === "container" ? "container" : selectedTab }
            isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
          />
        </div>
            )}
        </>
      ),
    },
    // 1 Sizing
    {
      key: "2",
      label: "Sizing",
      children: (
        <>
          {itemKey === "sorting" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="2"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                },
                itemData?.settings?.order?.is_enable === "true" ?  
                {
                key: "meta2",
                label: "Order Wrapper",
                }:null,
                itemData?.settings?.order_by?.is_enable === "true" ?  
                {
                key: "meta3",
                label: "Order By Wrapper",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "sorting" &&  selectedTab === "meta" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="2"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                itemData?.settings?.order?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Sort Order",
                }:null,
                itemData?.settings?.order_by?.is_enable === "true" ?  
                {
                key: "meta5",
                label: "Order By",
                }:null,  
   
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "sorting" &&  selectedTab === "meta1" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="2"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "meta4",
                label: "Outer Wrapper",
                },
                {
                key: "meta1",
                label: "Item",
                },
   
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "result_count" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="2"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "All",
                },
                itemData?.settings?.prefix?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Prefix",
                }:null,
                itemData?.settings?.suffix?.is_enable === "true" ?  
                {
                key: "meta1",
                label: "Suffix",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
          {itemKey === "selected" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="2"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                }, 
                {
                key: "meta",
                label: "Item",
                }, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "pagination" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="2"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={
                itemData?.settings?.pagination_type === "number2" ?  
                [
                {
                key: "container",
                label: "Container",
                },   
                {
                key: "meta",
                label: "Button",
                }, 
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "number"?   [  
                {
                key: "container",
                label: "Container",
                },
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "button" || itemData?.settings?.pagination_type === "load-more" ? [    
                {
                key: "container",
                label: "Container",
                },
                {
                key: "meta",
                label: itemData?.settings?.pagination_type === "button" ? "Button" : "Load More",
                },]:[]
          }
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("sizing")}>
              <SliderMain
                data={dndColData?.[column_index]?.data[item_index]}
                property="width"
                label="Width"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={updateDndColItemData}
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
                styleTab={selectedTab === "container" ? "container" : selectedTab }
                isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}

              />
              <SliderMain
                data={dndColData?.[column_index]?.data[item_index]}
                property="height"
                label="Height"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={updateDndColItemData}
                deviceSwitch={props.deviceSwitch}
                isSlider={true}
                style="style"
                styleTab={selectedTab === "container" ? "container" : selectedTab }
                isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
              />
            </div>
          )}
        </>
      ),
    },
        //2:Spacing
    {
      key: "3",
      label: "Spacing",
      children: (
        <>
        {itemKey === "sorting" &&  selectedTab === "meta1" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="3"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "meta4",
                label: "Outer Wrapper",
                },
                {
                key: "meta1",
                label: "Item",
                },
   
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "sorting" &&  selectedTab === "meta" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="3"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                itemData?.settings?.order?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Sort Order",
                }:null,
                itemData?.settings?.order_by?.is_enable === "true" ?  
                {
                key: "meta5",
                label: "Order By",
                }:null,  
   
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "sorting" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="3"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                },
                // itemData?.settings?.order?.is_enable === "true" ?  
                // {
                // key: "meta2",
                // label: "Order Wrapper",
                // }:null,
                // itemData?.settings?.order_by?.is_enable === "true" ?  
                // {
                // key: "meta3",
                // label: "Order By Wrapper",
                // }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "result_count" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="3"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "All",
                },
                itemData?.settings?.prefix?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Prefix",
                }:null,
                itemData?.settings?.suffix?.is_enable === "true" ?  
                {
                key: "meta1",
                label: "Suffix",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "selected" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="3"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                }, 
                {
                key: "meta",
                label: "Item",
                }, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "pagination" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="3"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={
                itemData?.settings?.pagination_type === "number2" ?  
                [
                {
                key: "container",
                label: "Container",
                },    
                {
                key: "meta",
                label: "Button",
                }, 
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "number"?   [  
                {
                key: "container",
                label: "Container",
                },  
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "button" || itemData?.settings?.pagination_type === "load-more" ? [
                {
                key: "container",
                label: "Container",
                },        
                {
                key: "meta",
                label: itemData?.settings?.pagination_type === "button" ? "Button" : "Load More",
                },]:[]
          }
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("spacing")}>
               {itemKey === "sorting" &&  seletedMetaTab === "meta4" ? (<></>):(
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchSpacing}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchSpacing}
                  className={"hoverTabCaf"}
                options={
                  selectedTab === "meta" && itemKey === "sorting"
                    ? [
                        { label: "Placeholder", value: false },
                        { label: "Selected", value: "selected" },
                      ]
                    : selectedTab === "meta1" && itemKey === "sorting" ?
                      [
                        { label: "Deafult", value: false },
                        { label: "Hover", value: true },
                        { label: "Selected", value: "selected" },
                      ]:
                      seletedMetaTab === "meta1" && itemKey === "pagination" ?
                      [
                      { label: "Default", value: false },
                      { label: "Hover", value: true },
                      { label: "Selected", value: "selected" },
                      ]:
                      [
                        { label: "Default", value: false },
                        { label: "Hover", value: true },
                      ]
                }
                />
              </div>
              )}
              <span className="label-span-spacing">Margin</span>
              <div className="caf-spacing-look">
                <Row>
                  <SliderMain
                    data={dndColData?.[column_index]?.data[item_index]}
                    property="marginTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="0"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <SliderMain
                    data={dndColData?.[column_index]?.data[item_index]}
                    property="marginBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="0"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginVerticalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <div
                    className={`spacing-joint ${
                      isMarginVerticalJoint ? "active" : ""
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
                     data={dndColData?.[column_index]?.data[item_index]}
                    property="marginLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="0"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <SliderMain
                     data={dndColData?.[column_index]?.data[item_index]}
                    property="marginRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="0"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isMarginHorizontalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <div
                    className={`spacing-joint ${
                      isMarginHorizontalJoint ? "active" : ""
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
                     data={dndColData?.[column_index]?.data[item_index]}
                    property="paddingTop"
                    label="Top"
                    defaultSuffix="px"
                    defaultValue="10"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <SliderMain
                     data={dndColData?.[column_index]?.data[item_index]}
                    property="paddingBottom"
                    label="Bottom"
                    defaultSuffix="px"
                    defaultValue="10"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingVerticalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <div
                    className={`spacing-joint ${
                      isPaddingVerticalJoint ? "active" : ""
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
                    data={dndColData?.[column_index]?.data[item_index]}
                    property="paddingLeft"
                    label="Left"
                    defaultSuffix="px"
                    defaultValue="10"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <SliderMain
                    data={dndColData?.[column_index]?.data[item_index]}
                    property="paddingRight"
                    label="Right"
                    defaultSuffix="px"
                    defaultValue="10"
                   onChangeStyle={updateDndColItemData}
                    extraClass="colm2"
                    styleState={styleStateSpacing}
                    deviceSwitch={props.deviceSwitch}
                    labelBottom={true}
                    isSpacingJoint={isPaddingHorizontalJoint}
                    style="style"
                    styleTab={selectedTab === "container" ? "container" : selectedTab }
                    isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
                  />
                  <div
                    className={`spacing-joint ${
                      isPaddingHorizontalJoint ? "active" : ""
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
      key: "4",
      label: "Background",
      children: (
        <>
          {itemKey === "sorting" &&  selectedTab === "meta1" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="4"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "meta4",
                label: "Outer Wrapper",
                },
                {
                key: "meta1",
                label: "Item",
                },
   
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "result_count" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="4"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "All",
                },
                itemData?.settings?.prefix?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Prefix",
                }:null,
                itemData?.settings?.suffix?.is_enable === "true" ?  
                {
                key: "meta1",
                label: "Suffix",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "selected" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="4"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                }, 
                {
                key: "meta",
                label: "Item",
                }, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "pagination" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="4"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={
                itemData?.settings?.pagination_type === "number2" ?  
                [
                {
                key: "container",
                label: "Container",
                },    
                {
                key: "meta",
                label: "Button",
                }, 
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "number"?   [  
                {
                key: "container",
                label: "Container",
                },  
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "button" || itemData?.settings?.pagination_type === "load-more" ? [
                {
                key: "container",
                label: "Container",
                },        
                {
                key: "meta",
                label: itemData?.settings?.pagination_type === "button" ? "Button" : "Load More",
                },]:[]
          }
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
          {loadingMeta ? (
            <Skeleton active />
          ) : (
            <div className={collapseMainContentClass("background")}>
               {itemKey === "sorting" &&  seletedMetaTab === "meta4" ? (<></>):(
              <div className="hoverswitchguard">
                <Segmented
                  value={hoverSwitchBg}
                  style={{ marginBottom: 8 }}
                  onChange={onHoverSwitchBg}
                  className={"hoverTabCaf"}
                  options={
                  selectedTab === "meta" && itemKey === "sorting"
                    ? [
                         { label: "Placeholder", value: false },
                        { label: "Selected", value: "selected" },
                      ]
                    :  selectedTab === "meta1" && itemKey === "sorting"
                    ? [
                       { label: "Default", value: false },
                       { label: "Hover", value: true },
                       { label: "Selected", value: "selected" },
                      ]:
                      seletedMetaTab === "meta1" && itemKey === "pagination" ?
                      [
                      { label: "Default", value: false },
                      { label: "Hover", value: true },
                      { label: "Selected", value: "selected" },
                      ]:
                      [
                        { label: "Default", value: false },
                        { label: "Hover", value: true },
                      ]
                }
                />
              </div>
               )}
              <ColorMain
                data={dndColData?.[column_index]?.data[item_index]}
                property="backgroundColor"
                defaultValue="#00000000"
                label="Background Color"
                onChangeStyle={updateDndColItemData}
                styleState={styleStateBg}
                deviceSwitch={props.deviceSwitch}
                style="style"
                styleTab={selectedTab === "container" ? "container" : selectedTab }
                isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
              />
            </div>
          )}
        </>
      ),
    },
    //4:Border
    {
      key: "5",
      label: "Border",
      children: (
        <>
          {itemKey === "sorting" &&  selectedTab === "meta1" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="5"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "meta4",
                label: "Outer Wrapper",
                },
                {
                key: "meta1",
                label: "Item",
                },
   
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "result_count" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="5"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "All",
                },
                itemData?.settings?.prefix?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Prefix",
                }:null,
                itemData?.settings?.suffix?.is_enable === "true" ?  
                {
                key: "meta1",
                label: "Suffix",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "selected" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="5"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                }, 
                {
                key: "meta",
                label: "Item",
                }, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "pagination" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="5"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={
                itemData?.settings?.pagination_type === "number2" ?  
                [
                {
                key: "container",
                label: "Container",
                },    
                {
                key: "meta",
                label: "Button",
                }, 
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "number"?   [  
                {
                key: "container",
                label: "Container",
                },  
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "button" || itemData?.settings?.pagination_type === "load-more" ? [
                {
                key: "container",
                label: "Container",
                },        
                {
                key: "meta",
                label: itemData?.settings?.pagination_type === "button" ? "Button" : "Load More",
                },]:[]
          }
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {loadingMeta ? (
              <Skeleton active />
            ) : (
        <div className={collapseMainContentClass("border")}>
           {itemKey === "sorting" &&  seletedMetaTab === "meta4" ? (<></>):(
          <div className="hoverswitchguard">
            <Segmented
              value={hoverSwitchBr}
              style={{ marginBottom: 8 }}
              onChange={onHoverSwitchBr}
              className={"hoverTabCaf"}
                options={
                  selectedTab === "meta" && itemKey === "sorting"
                    ? [
                        { label: "Placeholder", value: false },
                        { label: "Selected", value: "selected" },
                      ]
                    :  selectedTab === "meta1" && itemKey === "sorting"
                    ? [
                       { label: "Default", value: false },
                       { label: "Hover", value: true },
                       { label: "Selected", value: "selected" },
                      ]:seletedMetaTab === "meta1" && itemKey === "pagination" ?
                      [
                      { label: "Default", value: false },
                      { label: "Hover", value: true },
                      { label: "Selected", value: "selected" },
                      ]:
                      [
                        { label: "Default", value: false },
                        { label: "Hover", value: true },
                      ]
                }
            />
          </div>
           )}
          <BorderMain
            data={dndColData?.[column_index]?.data[item_index]}
            property="border"
            label="Border"
            onChangeStyle={updateDndColItemData}
            styleState={styleStateBr}
            deviceSwitch={props.deviceSwitch}
            style="style"
            styleTab={selectedTab === "container" ? "container" : selectedTab }
            isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
          ></BorderMain>
        </div>
            )}
        </>
      ),
    },
    //5:Box Shadow
    {
      key: "6",
      label: "Box Shadow",
      children: (
        <>
        {itemKey === "sorting" &&  selectedTab === "meta1" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="6"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "meta4",
                label: "Outer Wrapper",
                },
                {
                key: "meta1",
                label: "Item",
                },
   
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "result_count" &&  selectedTab === "container" && (
          <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="6"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "All",
                },
                itemData?.settings?.prefix?.is_enable === "true" ?  
                {
                key: "meta",
                label: "Prefix",
                }:null,
                itemData?.settings?.suffix?.is_enable === "true" ?  
                {
                key: "meta1",
                label: "Suffix",
                }:null, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "selected" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="6"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={[  
                {
                key: "container",
                label: "Outer Wrapper",
                }, 
                {
                key: "meta",
                label: "Item",
                }, 
            ]}
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
        {itemKey === "pagination" &&  selectedTab === "container" && (
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              collapsePanelKey="6"
              activeKey={seletedMetaTab}
              onChange={(value) => handleSettingMetaTab(value)}
              items={
                itemData?.settings?.pagination_type === "number2" ?  
                [
                {
                key: "container",
                label: "Container",
                },    
                {
                key: "meta",
                label: "Button",
                }, 
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "number"?   [  
                {
                key: "container",
                label: "Container",
                },  
                {
                key: "meta1",
                label: "Numbers",
                }, 
                ]:itemData?.settings?.pagination_type === "button" || itemData?.settings?.pagination_type === "load-more" ? [
                {
                key: "container",
                label: "Container",
                },        
                {
                key: "meta",
                label: itemData?.settings?.pagination_type === "button" ? "Button" : "Load More",
                },]:[]
          }
              defaultActiveKey={seletedMetaTab}
            />
          </div>
        )}
          {loadingMeta ? (
              <Skeleton active />
            ) : (
        <div className={collapseMainContentClass("box-shadow")}>
           {itemKey === "sorting" &&  seletedMetaTab === "meta4" ? (<></>):(
          <div className="hoverswitchguard">
            <Segmented
              value={hoverSwitchBs}
              style={{ marginBottom: 8 }}
              onChange={onHoverSwitchBs}
              className={"hoverTabCaf"}
                options={
                  selectedTab === "meta" && itemKey === "sorting"
                    ? [
                        { label: "Placeholder", value: false },
                        { label: "Selected", value: "selected" },
                      ]
                    :  selectedTab === "meta1" && itemKey === "sorting"
                    ? [
                       { label: "Default", value: false },
                       { label: "Hover", value: true },
                       { label: "Selected", value: "selected" },
                      ]:seletedMetaTab === "meta1" && itemKey === "pagination" ?
                      [
                      { label: "Default", value: false },
                      { label: "Hover", value: true },
                      { label: "Selected", value: "selected" },
                      ]:
                      [
                        { label: "Default", value: false },
                        { label: "Hover", value: true },
                      ]
                }
            />
          </div>
           )}
          <BoxShadow
            data={dndColData?.[column_index]?.data[item_index]}
            property="boxShadow"
            label="Box Shadow"
            onChangeStyle={updateDndColItemData}
            styleState={styleStateBs}
            deviceSwitch={props.deviceSwitch}
            style="style"
            styleTab={selectedTab === "container" ? "container" : selectedTab }
            isMeta={selectedTab === "container" ? seletedMetaTab : seletedMetaTab}
          ></BoxShadow>
        </div>
            )}
        </>
      ),
    },
  ];


  let AdvancedCols = [
    //1:positioning
    {
      key: "1",
      label: "Positioning",
      children: (
        <>
           {loadingMeta ? (
            <Skeleton active />
          ) : (
        <div className={collapseMainContentClass("positioning")}>
          <SelectMain
            data={dndColData?.[column_index]}
            onChangeStyle={updateDndColData}
            style="style"
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
          />
          <InputMain
            data={dndColData?.[column_index]}
            onChangeStyle={updateDndColData}
            property="zIndex"
            defaultValue="999"
            label="Z Index"
            styleState={styleStatePosition}
            deviceSwitch={props.deviceSwitch}
            style="style"
            type="number"
          />
          <div className='caf-position-spacing-look'>
          <Row>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]}
                onChangeStyle={updateDndColData}
                property="top"
                label="Top"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]}
                onChangeStyle={updateDndColData}
                property="right"
                label="Right"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]}
                onChangeStyle={updateDndColData}
                property="bottom"
                label="Bottom"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]}
                onChangeStyle={updateDndColData}
                property="left"
                label="Left"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
          </Row>
          </div>
          <SelectMain
            data={dndColData?.[column_index]}
            onChangeStyle={updateDndColData}
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
           {loadingMeta ? (
            <Skeleton active />
          ) : (
        <div className={collapseMainContentClass("custom-class")}>
          <div className="caf-builder-setting-row-label">
            <InputMain2
              data={dndColData?.[column_index]}
              onChangeData={updateDndColData}
              defaultValue=""
              property="custom_class"
              parentKey="settings"
              label="Add Custom Class"
              placeholder = "Add Custom Class"
              type="Text"
            />
          </div>
        </div>
      )}
        </>
      ),
    },
    {
      key: "3",
      label: "Visibility",
      children: (
        <>
           {loadingMeta ? (
            <Skeleton active />
          ) : (
          <div className={collapseMainContentClass("visibility")}>
          <div className='caf-builder-setting-row-label'>
            <label>Disable on</label>
            <div className='caf-builder-disable-on-control'>
              <SwitchMain2
                onChangeData={updateDndColSettingData}
                checked=""
                unchecked=""
                data={dndColData?.[column_index]?.settings}
                parentKey ="visibility"
                property="mobile"
                label="Phone"
              />
              <SwitchMain2
                onChangeData={updateDndColSettingData}
                checked=""
                unchecked=""
                data={dndColData?.[column_index]?.settings}
                parentKey ="visibility"
                property="tablet"
                label="Tablet"
              />
              <SwitchMain2
                onChangeData={updateDndColSettingData}
                checked=""
                unchecked=""
                data={dndColData?.[column_index]?.settings}
                parentKey ="visibility"
                property="desktop"
                label="Desktop"
              />
            </div>
          </div>
        </div>
      )}
        </>
      ),
    },

  ];


  let AdvancedColsItems = [
    //1:positioning
    {
      key: "1",
      label: "Positioning",
      children: (
        <>
           {loadingMeta ? (
            <Skeleton active />
          ) : (
        <div className={collapseMainContentClass("positioning")}>
          <SelectMain
            data={dndColData?.[column_index]?.data?.[item_index]}
            onChangeStyle={updateDndColItemData}
            style="style"
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
            styleTab="container"
          />
          <InputMain
            data={dndColData?.[column_index]?.data?.[item_index]}
            onChangeStyle={updateDndColItemData}
            property="zIndex"
            defaultValue="999"
            label="Z Index"
            styleState={styleStatePosition}
            deviceSwitch={props.deviceSwitch}
            style="style"
            type="number"
            styleTab="container"
          />
          <div className='caf-position-spacing-look'>
          <Row>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]?.data?.[item_index]}
                onChangeStyle={updateDndColItemData}
                styleTab="container"
                property="top"
                label="Top"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]?.data?.[item_index]}
                onChangeStyle={updateDndColItemData}
                styleTab="container"
                property="right"
                label="Right"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]?.data?.[item_index]}
                onChangeStyle={updateDndColItemData}
                styleTab="container"
                property="bottom"
                label="Bottom"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
            <Col span={12}>
              <SliderMain
                data={dndColData?.[column_index]?.data?.[item_index]}
                onChangeStyle={updateDndColItemData}
                styleTab="container"
                property="left"
                label="Left"
                defaultSuffix="px"
                defaultValue="0"
                styleState={styleStatePosition}
                extraClass="colm2"
                deviceSwitch={props.deviceSwitch}
                style="style"
              />
            </Col>
          </Row>
          </div>
          <SelectMain
            data={dndColData?.[column_index]?.data?.[item_index]}
            onChangeStyle={updateDndColItemData}
            styleTab="container"
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
           {loadingMeta ? (
            <Skeleton active />
          ) : (
        <div className={collapseMainContentClass("custom-class")}>
          <div className="caf-builder-setting-row-label">
            <InputMain2
              data={dndColData?.[column_index]?.data?.[item_index]}
              onChangeData={updateDndColItemData}
              defaultValue=""
              property="custom_class"
              parentKey="settings"
              label="Add Custom Class"
              placeholder = "Add Custom Class"
              type="Text"
            />
          </div>
        </div>
      )}
        </>
      ),
    },
    {
      key: "3",
      label: "Visibility",
      children: (
        <>
           {loadingMeta ? (
            <Skeleton active />
          ) : (
          <div className={collapseMainContentClass("visibility")}>
          <div className='caf-builder-setting-row-label'>
            <label>Disable on</label>
            <div className='caf-builder-disable-on-control'>
              <SwitchMain2
                onChangeData={updateDndColItemSettingsData}
                checked=""
                unchecked=""
                data={dndColData?.[column_index]?.data?.[item_index]?.settings}
                parentKey ="visibility"
                property="mobile"
                label="Phone"
              />
              <SwitchMain2
                onChangeData={updateDndColItemSettingsData}
                checked=""
                unchecked=""
                data={dndColData?.[column_index]?.data?.[item_index]?.settings}
                parentKey ="visibility"
                property="tablet"
                label="Tablet"
              />
              <SwitchMain2
                onChangeData={updateDndColItemSettingsData}
                checked=""
                unchecked=""
                data={dndColData?.[column_index]?.data?.[item_index]?.settings}
                parentKey ="visibility"
                property="desktop"
                label="Desktop"
              />
            </div>
          </div>
        </div>
      )}
        </>
      ),
    },
  ];

    const handleCollapseChangeCol = (key) => {
    const nextKey = Array.isArray(key) ? key[0] : key;
    setActiveCollapsePanelKey(nextKey ?? null);
    setLoadingMeta(true);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
  };

  const handleCollapseChangeAdvCol = (key) => {
    const nextKey = Array.isArray(key) ? key[0] : key;
    setActiveCollapsePanelKey(nextKey ?? null);
    setLoadingMeta(true);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
  };

  const handleCollapseChangeColItem = (key) => {
    const nextKey = Array.isArray(key) ? key[0] : key;
    setActiveCollapsePanelKey(nextKey ?? null);
    setLoadingMeta(true);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
  };


const handleSettingTab =(value)=>{
  setSelectedTab(value)
  setSeletedMetaTab(resolveDefaultMetaTabForCurrentSelection(value))
     setLoadingMeta(true);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
}
const handleSettingMetaTab =(value)=>{
  setSeletedMetaTab(value)
     setLoadingMeta(true);
    setTimeout(() => {
      setLoadingMeta(false);
    }, 500);
}    
  //console.log(props?.selectedItemDnd)
  return (
    <div className="row-design-tab-data misc-cont">
      {props?.tab ==="advanced" ?(
        <div className="caf-preview-collapse-design">
        {type === "column" && ( 
        <Collapse
          //defaultActiveKey={["1"]}
          onChange={handleCollapseChangeAdvCol}
          expandIconPlacement="end"
          accordion={true}
          expandIcon={({ isActive }) => (
            <CaretDownOutlined rotate={isActive ? 180 : 0} />
          )}
          items={AdvancedCols}
        />
        )}
        {(type === "item" && item_index !== null && itemData?.settings?.is_enable === "true") && (
        <Collapse
          //defaultActiveKey={["1"]}
          onChange={handleCollapseChangeAdvCol}
          expandIconPlacement="end"
          accordion={true}
          expandIcon={({ isActive }) => (
            <CaretDownOutlined rotate={isActive ? 180 : 0} />
          )}
          items={AdvancedColsItems}
        />
        )}
        </div>
      ):(
      <>
      {type === "column" && ( 
        <div className="caf-preview-collapse-design">
        <Collapse
          //defaultActiveKey={["1"]}
          onChange={handleCollapseChangeCol}
          expandIconPlacement="end"
          accordion={true}
          expandIcon={({ isActive }) => (
            <CaretDownOutlined rotate={isActive ? 180 : 0} />
          )}
          items={ColItems}
        />
        </div>
      )}
      {(type === "item" && item_index !== null && itemData?.settings?.is_enable === "true") && (
        <>
        {itemKey === "sorting" && (
          <div className="caf-builder-setting-row-label">
            <Tabs
              activeKey={selectedTab}
              onChange={(value) => handleSettingTab(value)}
              items={selectedLayoutTabItems}
              defaultActiveKey={selectedTab}
            />
          </div>
        )}
        <div className="caf-preview-collapse-design">
        <Collapse
          //defaultActiveKey={["1"]}
          key={selectedTab}
          onChange={handleCollapseChangeColItem}
          expandIconPlacement="end"
          accordion={true}
          expandIcon={({ isActive }) => (
            <CaretDownOutlined rotate={isActive ? 180 : 0} />
          )}
          items={(() => {
            if (type === "item" && selectedTab === "container" && itemKey === "sorting") {
              return ItemsData.filter(
                (item) =>
                  item.key !== "1"
              );
            }
            if(type === "item" && itemKey === "sorting"  && (
              // selectedTab === "meta" || 
              selectedTab === "meta1")){
                return ItemsData.filter(
                  (item) =>
                    item.key !== "0"
                );
            }
            return ItemsData;
          })()}
        />
        </div>
        </>
      )}
      </>
      )}
    </div>
  );
};

export default Misc;
