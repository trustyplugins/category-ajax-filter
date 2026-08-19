import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import apiClient from "../../../../../../api/client";
import { apiEndpoints } from "../../../../../../api/endpoints";
import { Modal, Button, Switch, Skeleton, Input, Tooltip ,Segmented ,Select } from "antd";
import parse from "html-react-parser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import BuilderDeleteIcon from "../../../../../BuilderDeleteIcon";
import {
  EditOutlined,
  ReloadOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import DropDownIcons from "../ContentComponents/DropDownIcons";
import LabelIcons from "../ContentComponents/LabelIcons";
import SelectMain from "../ContentComponents/SelectMain";
import SwitchMain from "../ContentComponents/SwitchMain";
import {
  TERM_VISUAL_COLOR,
  TERM_VISUAL_ICON,
  resolveTermVisual,
  isTermVisualColor,
  canUseColorSwatchFeatures,
  getTermSwatchColor,
  termHasColorSwatch,
  buildColorTermIcons,
  buildIconTermIcons,
  ensureDefaultSwatchColorsOnSettings,
  ensureDefaultTermIconsOnSettings,
  applyDefaultTermIconsIfNeeded,
  getDefaultTermIconsForMode,
  resolveTermLabelDisplay,
  applyTermLabelDisplay,
} from "../termVisualUtils";
import {
  ensureDefaultSwatchColorsOnCustomFieldSettings,
  restoreCustomFieldIconsFromColorBackup,
  applyColorToCustomFieldValue,
  buildDefaultCustomFieldValueIcons,
} from "../customFieldVisualUtils";
import {
  backfillTaxonomyDataCounts,
  buildTermCountMapFromTaxonomyList,
} from "../termCountUtils";
import TermColorPickerTrigger from "../TermColorPickerTrigger";
import {
  useResolvedMainBuilderData,
  getResolvedFilterPostType,
  getResolvedSinglePostData,
} from "../useResolvedMainBuilderData";
import {
  createFilterModuleSettingsSnapshot,
  commitFilterModuleTaxonomyData,
  commitFilterModuleSettingsPatch,
  commitFilterModuleReplaceSettings,
  applyTaxonomyDefaultTermToSettings,
  applyCustomFieldDefaultTermToSettings,
  enforceSingleDefaultTermsInSettings,
  extractNumericTermIdFromPredefinedKey,
  setSingleDefaultPredefineInTree,
  clearAllTermPredefineInTree,
} from "../filterSettingsSnapshot";
import { fModuleStyle } from "../../../../styleData";
import { ensureTermShowMoreSettingsDefaults } from "../../../modules-output/shared/termShowMoreUtils";
import TermTaxonomyLabelText from "../TermTaxonomyLabelText";
import { getTaxonomyPickerSections } from "../taxonomyPickerSections";
import CustomFieldValueRowActions from "../CustomFieldValueRowActions";
import CfValueLabelWithEdit from "../CfValueLabelWithEdit";
import warningIcon from "../../../../../images/caution-sign.svg";
import {
  FilterDataSourceSegment,
  FilterShowIconLockedSection,
  FilterTermShowMoreLockedSection,
  FilterLabelShowIconLockedSection,
  FilterLabelCollapseLockedSection,
  canUseFilterCustomField,
  canUseFilterShowIcon,
  canUseFilterShowIconOrColorSwatch,
  canUseFilterColorSwatch,
  applyFreeColorSwatchOnEnable,
  resolveSettingsForTermVisualDefaults,
  canUseFilterTermShowMore,
  canUseLabelShowIcon,
  canUseFilterLabelCollapse,
  canUseFilterTermDefault,
  canUseFilterTermIcon,
  canUseWooProductFilters,
  resolveFilterDataSource,
  resolveFilterLabelCollapseToggleState,
  applyFilterLabelCollapseTierToSettings,
  shouldShowFilterTermIconControl,
  getFilterTermVisualDisplayOptions,
} from "../shared/filterModuleTier";
import { TierLockedWrap } from "../../../../../../tier/TierLockedWrap";
import FilterTermShowMoreProPanel from "../shared/FilterTermShowMoreProPanel";
import FilterTermRowProActions from "../shared/FilterTermRowProActions";
import FilterTermIconSettingsModal from "../shared/FilterTermIconSettingsModal";
import FilterCfTermIconSettingsModal from "../shared/FilterCfTermIconSettingsModal";
import FilterLabelShowIconProPanel from "../shared/FilterLabelShowIconProPanel";
import FilterLabelCollapseProPanel from "../shared/FilterLabelCollapseProPanel";
import FilterShowIconModeProPanel from "../shared/FilterShowIconModeProPanel";
import {
  canUseProductPostType,
  isWooCommerceActive,
} from "../../../../../../tier/capabilities";
import { canShowAddAsParentSwitch } from "../../../../utils/filterBuilderUiFlags";
import {
  useWooAttributeColorActions,
  WooAttributeColorActions,
  isWooProductAttributeTaxonomy,
} from "../../../woocommerce/wooAttributeColorImport";

const normalizeCustomFieldData = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};

const getPlainTextFromHtml = (html) => {
  const value = String(html ?? "");
  return value.replace(/<[^>]+>/g, "").trim();
};

const DropdownFilter1 = memo((props) => {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const mainBuilderData = useResolvedMainBuilderData(props.mainBuilderData);
  let items = [...props.data];
  let settingData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.settings,
  };
  const resolvedPostType = getResolvedFilterPostType(
    mainBuilderData,
    settingData?.post_type
  );
  let styleData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.style,
  };
  let selectedDevice = props.selectedDevice;
  const singlePostData = getResolvedSinglePostData(mainBuilderData);
  const [postType, setPostType] = useState(
    resolvedPostType
  );
const [taxonomyList, setTaxonomyList] = useState([]);
  //   const [filterType, setFilterType] = useState(settingData.filter_type);


let meta_fields = singlePostData?.meta_fields;
let fieldOptions = [{ label: "Select Field", value: "0" }];
if (meta_fields) {
  Object.keys(meta_fields)?.map((item, i) => (
    <>{fieldOptions.push({ value: item, label: item })}</>
  ))
}

  const [dataSource, setDataSource] = useState(
    resolveFilterDataSource(settingData.data_source)
  );
  const effectiveDataSource = canUseFilterCustomField()
    ? dataSource
    : "taxonomy";
  const {
    importLoading: wooColorImportLoading,
    resetLoading: wooColorResetLoading,
    handleImport: handleImportWooColors,
    handleReset: handleResetWooColors,
  } = useWooAttributeColorActions({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      onAfterCommit: (next) => setTaxonomyList(next.taxonomy_data),
    });

  // Seed default tag icons on taxonomy terms when Show Icon is enabled (Icon mode).
  useEffect(() => {
    if (!canUseFilterShowIcon()) {
      return;
    }
    const seeded = applyDefaultTermIconsIfNeeded(settingData, resolvedPostType);
    if (seeded.taxonomy_data === settingData?.taxonomy_data) {
      return;
    }
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.taxonomy_data = seeded.taxonomy_data;
      },
      onAfterCommit: (next) => setTaxonomyList(next.taxonomy_data),
    });
  }, [
    settingData?.show_icon,
    settingData?.term_visual,
    settingData?.taxonomy_data,
    resolvedPostType,
    props.data,
    rowindex,
    columnindex,
    moduleindex,
    props.onSettingChange,
  ]);

  const [termSettingPopUp, setTermSettingPopUp] = useState(false);
  const [termSettingPopUpCusFieldLabel, setTermSettingPopUpCusFieldLabel] =
    useState(false);
  const [termSettingPopUpCusFieldIcon, setTermSettingPopUpCusFieldIcon] =
    useState(false);
  const [termPredefinedCusField, setTermPredefinedCusField] = useState(false);
  const [termDetail, setTermDetail] = useState([]);
  const [termPredefined, setTermPredefined] = useState(false);
  const [isParent, setIsParent] = useState(false);
  const [iconsArray, setIconsArray] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [LoadingCatogries, setLoadingCatogries] = useState(true);
  const [contentIconDetail, setcontentIconDetail] = useState({
    icon: "",
    position: "before",
    iconChecked: true,
    type: 'icon'
  });
  const [allIconSwitch, setAllIconSwitch] = useState(
    canUseFilterShowIcon()
      ? settingData?.dropdown_data?.all_option?.icons?.visibility
      : false
  );
  const [allOptArray ,setAllOptArray]=useState(settingData?.dropdown_data?.all_option);
  const [allOptEnable,setAllOptEnable]=useState(settingData?.dropdown_data?.all_option?.is_enable ==="true" ? true : false )
  const [iconSwitch, setIconSwitch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [labelIconSwitch, setLabelIconSwitch] = useState(
    canUseLabelShowIcon() ? settingData?.label?.icons?.visibility : false
  );
  // custom field
  const [contentIconDetailCusField, setcontentIconDetailCusField] = useState({
    icon: "",
    position: "before",
    iconChecked: false,
  });
  const [iconSwitchCusField, setIconSwitchCusField] = useState("");
  const [selectedIconCusField, setSelectedIconCusField] = useState("");
  const [currCustomFieldValue, setCurrCustomFieldValue] = useState([]);
  const [checkError, setCheckError] = useState(false);
  const [metaKeys, setMetaKeys] = useState([]);
  const [checkLabel, setCheckLabel] = useState(
    settingData.label.is_label === "false" ? false : true
  );
  const [labelInput, setLabelInput] = useState(settingData.label.value);
  const [toggle, setToggle] = useState(() =>
    resolveFilterLabelCollapseToggleState(settingData)
  );
  const [allOptionInput, setAllOptionInput] = useState(
    settingData.dropdown_data.all_option.value
  );
  const [customFieldKey, setCustomFieldKey] = useState(
    settingData?.custom_field_data?.custom_field_key ||
      (Array.isArray(settingData?.custom_field_data)
        ? settingData.custom_field_data?.[0]?.custom_field_key
        : "")
  );
  const [openCfRows, setOpenCfRows] = useState({});
  const [openCfAdv, setOpenCfAdv] = useState({});

  const [customFieldValue, setCustomFieldValue] = useState("");
  const [customFieldArray, setCustomFieldArray] = useState(
    normalizeCustomFieldData(settingData.custom_field_data)
  );
  const [compareOperator, setCompareOperator] = useState(
    settingData?.custom_field_data?.compare_operator ||
      (Array.isArray(settingData?.custom_field_data)
        ? settingData.custom_field_data?.[0]?.compare_operator
        : "=")
  );

  const [keyValueCf, setKeyValueCf] = useState("");
  const [labelValueCf, setLabelValueCf] = useState("");

  const [taxonomyListArray, setTaxonomyListArray] = useState([]);
  const productFiltersLocked = !canUseWooProductFilters();
  const showProductFiltersSection =
    String(resolvedPostType || "") === "product" &&
    isWooCommerceActive() &&
    canUseProductPostType();
  const taxonomyPickerSections = useMemo(
    () =>
      getTaxonomyPickerSections(taxonomyListArray, {
        ensureProductFiltersSection:
          showProductFiltersSection && productFiltersLocked,
        productFiltersLocked:
          showProductFiltersSection && productFiltersLocked,
      }),
    [taxonomyListArray, showProductFiltersSection, productFiltersLocked]
  );
  const [firstRender, setFirstRender] = useState(true);
  const [expandedTaxoItems, setExpandedTaxoItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [allOptModal ,setAllOptModal]=useState(false);

  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";

  // useEffect(() => {
  //   let value = "";
  //   if (customFieldArray.length > 0) {
  //     value = customFieldArray.reduce(
  //       (accu, curr) => accu + `${curr.key},`,
  //       ""
  //     );
  //     setCustomFieldValue(value);
  //   }
  // }, []);



  // useEffect(() => {
  //   if (props.saveLayoutClick == true) {
  //     setTimeout(() => {
  //       props.setSaveLayoutClick(false);
  //     }, 600);
  //   }
  //   setCustomFieldKey(settingData.custom_field_data.custom_field_key);
  //   setCustomFieldArray(settingData.custom_field_data.custom_field_value);
  //   if (settingData.custom_field_data.custom_field_value?.length == 0) {
  //     setCustomFieldValue("");
  //   }
  // }, [settingData]);
    useEffect(()=>{
      setTaxonomyList(settingData?.taxonomy_data)
    },[settingData?.taxonomy_data])

  const applyDropdownCustomFieldVisualDefaults = (
    nextSettings,
    prevVisual,
    nextVisual,
  ) => {
    if (prevVisual !== TERM_VISUAL_COLOR && nextVisual === TERM_VISUAL_COLOR) {
      const withCfColors =
        ensureDefaultSwatchColorsOnCustomFieldSettings(nextSettings);
      if (Array.isArray(withCfColors.custom_field_data)) {
        setCustomFieldArray(withCfColors.custom_field_data);
      }
      return withCfColors;
    }
    if (
      prevVisual === TERM_VISUAL_COLOR &&
      nextVisual === TERM_VISUAL_ICON &&
      canUseFilterShowIcon()
    ) {
      const withCfIcons = restoreCustomFieldIconsFromColorBackup(nextSettings);
      if (Array.isArray(withCfIcons.custom_field_data)) {
        setCustomFieldArray(withCfIcons.custom_field_data);
      }
      return withCfIcons;
    }
    return nextSettings;
  };

  useEffect(() => {
    setDataSource(settingData.data_source);
  }, [settingData.data_source]);

  useEffect(() => {
    const normalizedCustomFields = normalizeCustomFieldData(
      settingData?.custom_field_data
    );
    setCustomFieldArray(normalizedCustomFields);
    setCompareOperator(
      settingData?.custom_field_data?.compare_operator ||
        normalizedCustomFields?.[0]?.compare_operator ||
        "="
    );
    setCustomFieldKey(
      settingData?.custom_field_data?.custom_field_key ||
        normalizedCustomFields?.[0]?.custom_field_key ||
        ""
    );
    const pruneCollapseState = (prev, length) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (Number(key) >= length) {
          delete next[key];
        }
      });
      return next;
    };
    setOpenCfRows((prev) =>
      pruneCollapseState(prev, normalizedCustomFields.length)
    );
    setOpenCfAdv((prev) =>
      pruneCollapseState(prev, normalizedCustomFields.length)
    );
  }, [settingData?.custom_field_data]);

  useEffect(() => {
    setCheckError(false);
  }, [iconSwitch, iconSwitchCusField]);

  // useEffect(() => {
  //   if (settingData?.label?.icons?.icon == "") {
  //     settingData.label.icons.visibility = false;
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //       settingData;
  //     props.onSettingChange(props.data);
  //   }
  // }, [checkLabel]);

  useEffect(() => {
    let icons = {};
    if (termDetail?.length > 0) {
      if (termDetail[6] && termDetail[6]?.predefine == "true") {
        setTermPredefined(true);
      } else {
        setTermPredefined(false);
      }
      icons = termDetail[6].icons;
      const colorMode = isTermVisualColor({
        ...settingData,
        post_type: resolvedPostType,
      });
      const swatchColor = getTermSwatchColor(icons);
      if (colorMode) {
        setIconSwitch(Boolean(swatchColor));
        setcontentIconDetail({
          icon: swatchColor || "#000000",
          position: icons?.position || "before",
          iconChecked: Boolean(swatchColor),
          type: "color",
        });
        setSelectedIcon(swatchColor || "");
        setCheckError(false);
        return;
      }
      const iconSource =
        icons?.type === "color" && icons?.icon_backup
          ? icons.icon_backup
          : icons;
      setIconSwitch(iconSource?.icon ? true : false);
      if (iconSource && Object?.keys(iconSource).length !== 0) {
        let data = contentIconDetail;
        data.icon = iconSource.icon;
        data.position = icons?.position || iconSource.position || "before";
        data.iconChecked = true;
        data.type = iconSource.type || "icon";
        setcontentIconDetail(data);
      }
       if(iconSource?.type==='icon') {
      setSelectedIcon(iconSource?.icon ? iconSource.icon : "");
      }
      else {
       // console.log("aa1",icons.icon.icon.url);
        setSelectedIcon(iconSource?.icon?.icon?.url ? iconSource.icon.icon.url : iconSource?.icon?.url || "");
      }
      setCheckError(false);
    } else {
      return;
    }
  }, [termDetail[0]]);

  useEffect(() => {
    let valueData = currCustomFieldValue[2];

    setKeyValueCf(valueData?.key || "");
    setLabelValueCf(valueData?.label || "")

    if(valueData && valueData.predefine === "true"){
        setTermPredefinedCusField(true);
    }else{
      setTermPredefinedCusField(false);
    }
    
    let icons={};
    if (valueData && Object?.keys(valueData).length !== 0) {
      icons = valueData?.icons || {};
      let data = contentIconDetailCusField;
        data.icon = icons?.icon || "";
        data.position = icons?.position || "before" ;
        data.iconChecked = true;
        data.type=icons?.type || "icon";
        setcontentIconDetailCusField(data);
    }
    if(icons?.type==='icon') {
    setSelectedIconCusField(icons?.icon ? icons.icon : "");
    }
    else {
    setSelectedIconCusField(icons?.icon?.icon?.url ? icons.icon.icon.url : "");
    }
    setCheckError(false);
   
  }, [currCustomFieldValue[0],currCustomFieldValue[1]]);

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

  useEffect(() => {
    setPostType(resolvedPostType);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, [resolvedPostType]);

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await apiClient.get(
  //           baseURL + "get-taxonomy/?post-type=" + postType
  //         );
  //         if (response.data && response.data.status === "success") {
  //           setTaxonomyList(response.data.taxonomy_list);
  //           //setIsLoading(true);
  //           TemrsRefresh();
  //         }
  //       } catch (error) {
  //         console.error("Error fetching data:", error.message);
  //       }
  //     };
  //     fetchData();
  //   }, [postType]);

  const onAllIconSwitch = (checked) => {
    if (!canUseFilterShowIcon()) {
      return;
    }
     let itm = { ...settingData?.dropdown_data?.all_option};
    setAllIconSwitch(checked);
    let ic = { ...itm?.icons };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
    }
    ic.visibility = checked;
    itm.icons = { ...itm?.icons, ...ic };
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.dropdown_data = s.dropdown_data || {};
        s.dropdown_data.all_option = itm;
      },
    });
}

  const onChange = (e) => {
    const value = e.target.value;
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        if (!Array.isArray(s.taxonomy_data)) {
          s.taxonomy_data = [];
        }
        if (s.post_type != postType && s.taxonomy_data.length > 0) {
          s.taxonomy_data = [];
        }
        const isValuePresent = s.taxonomy_data?.some((obj) =>
          Object.values(obj).includes(value)
        );
        if (isValuePresent) {
          s.taxonomy_data = s.taxonomy_data.filter(
            (element) => element.key !== value
          );
        } else {
          const itemData = { key: value, term_data: [] };
          s.taxonomy_data.push(itemData);
          s.post_type = postType;
        }
      },
    });
    setTimeout(() => {
      func();
    }, 500);
    TermChecked();
  };

  useEffect(() => {
  let fieldOptions = [{ label: "Select Field", value: "0" }];
  if (meta_fields) {
    Object.keys(meta_fields)?.map((item, i) => (
      <>{fieldOptions.push({ value: item, label: item })}</>
    ))
  }
    setMetaKeys(fieldOptions);
    setCustomFieldKey("0")
    //console.log('new')
  }, [singlePostData?.value]);
  const dataSourceOptions = [
    {
      label: "Taxonomy",
      value: "taxonomy",
    },
    {
      label: "Custom Field",
      value: "custom_field",
    },
  ];

  const customFieldCompareOperators = [
    {
      label: "is Equal to",
      value: "=",
    },
    {
      label: "is Not Equal to",
      value: "!=",
    },
    {
      label: ">",
      value: ">",
    },
    {
      label: ">=",
      value: ">=",
    },
    {
      label: "<",
      value: "<",
    },
    {
      label: "<=",
      value: "<=",
    },
    // {
    //   label: "LIKE",
    //   value: "LIKE",
    // },
    // {
    //   label: "NOT LIKE",
    //   value: "NOT LIKE",
    // },
    // {
    //   label: "IN",
    //   value: "IN",
    // },
    // {
    //   label: "NOT IN",
    //   value: "NOT IN",
    // },
    // {
    //   label: "BETWEEN",
    //   value: "BETWEEN",
    // },
    // {
    //   label: "NOT BETWEEN",
    //   value: "NOT BETWEEN",
    // },
    // {
    //   label: "EXISTS",
    //   value: "EXISTS",
    // },
    // {
    //   label: "NOT EXISTS",
    //   value: "NOT EXISTS",
    // },
    // {
    //   label: "REGEXP",
    //   value: "REGEXP",
    // },
    // {
    //   label: "NOT REGEXP",
    //   value: "NOT REGEXP",
    // },
  ];

  const customFieldMetaTypes = [
    {
      label: "CHAR",
      value: "CHAR",
    },
    {
      label: "NUMERIC",
      value: "NUMERIC",
    },
    // {
    //   label: "BINARY",
    //   value: "BINARY",
    // },
    // {
    //   label: "DATE",
    //   value: "DATE",
    // },
    // {
    //   label: "DATETIME",
    //   value: "DATETIME",
    // },
    // {
    //   label: "DECIMAL",
    //   value: "DECIMAL",
    // },
    // {
    //   label: "SIGNED",
    //   value: "SIGNED",
    // },
    // {
    //   label: "TIME",
    //   value: "TIME",
    // },
    // {
    //   label: "UNSIGNED",
    //   value: "UNSIGNED",
    // },
  ];

  const handleTermSettingCancel = () => {
    setTermDetail([]);
    setTermSettingPopUp(false);
    setTermPredefined(false);
    setIsParent(false);
    setcontentIconDetail((prev) => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: 'icon'
    }));
  };
  const handleTermSettingSave = () => {
    const { freshItems, settingsRef } = createFilterModuleSettingsSnapshot({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
    });
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxonomyExists = newtaxonomyData.some(
      (data) => data.key === termDetail[1]
    );
    if (taxonomyExists) {
      // if (contentIconDetail.icon === "" && contentIconDetail.iconChecked) {
      //   setCheckError(true);
      //   return;
      // }
      if (termPredefined === true) {
        settingsRef.predefined_terms = [termDetail[2]];
        const targetId = extractNumericTermIdFromPredefinedKey(termDetail[2]);
        newtaxonomyData = newtaxonomyData.map((group) => ({
          ...group,
          term_data: setSingleDefaultPredefineInTree(
            clearAllTermPredefineInTree(group.term_data),
            targetId
          ),
        }));
      } else if (settingsRef.predefined_terms?.includes(termDetail[2])) {
        settingsRef.predefined_terms = settingsRef.predefined_terms.filter(
          (item) => item !== termDetail[2]
        );
      }
      const data = newtaxonomyData.find((d) => d.key === termDetail[1]);
      const termData = [...data.term_data];
      const alreadyPresent = termData.some((obj) => {
        if (obj.key === termDetail[0]) {
          obj.predefine = termPredefined ? "true" : "false";
          if (
            contentIconDetail.iconChecked === true &&
            contentIconDetail.icon != ""
          ) {
            if (isTermVisualColor(settingsRef) || contentIconDetail.type === "color") {
              obj.icons = buildColorTermIcons(
                obj.icons,
                contentIconDetail.icon,
                contentIconDetail.position
              );
            } else {
              obj.icons = buildIconTermIcons(obj.icons, {
                icon: contentIconDetail.icon,
                position: contentIconDetail.position,
                type: contentIconDetail?.type || "icon",
              });
            }
          } else if (isTermVisualColor(settingsRef)) {
            obj.icons = obj.icons?.icon_backup
              ? {
                  type: obj.icons.icon_backup.type || "icon",
                  icon: obj.icons.icon_backup.icon,
                  position: obj.icons?.position || "before",
                  icon_backup: obj.icons.icon_backup,
                  color: "",
                }
              : {};
          } else {
            obj.icons = {
              ...(obj.icons?.color ? { color: obj.icons.color } : {}),
            };
          }
          return true;
        }
        return false;
      });
    }
    commitFilterModuleTaxonomyData({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: (next) => setTaxonomyList(next.taxonomy_data),
    });
    setTermSettingPopUp(false);
    setTermPredefined(false);
    setCheckError(false);
    setcontentIconDetail((prev) => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type:"icon",
    }));
    setTermDetail((prev) => {
      prev[0] = null;
      return prev;
    });
  };
  const handleTermSwitch = (checked) => {
    setTermPredefined(checked);
  };
  const handleIsParent = (checked) => {
    setIsParent(checked);
  };

  const checkTermData = (id, taxo) => {
    //if click on terms settings then check , it present or not in the taxonomy data
    if (id) {
      for (let index = 0; index < settingData.taxonomy_data?.length; index++) {
        let data = settingData.taxonomy_data[index];
        if (data.key == taxo) {
          let termData = data.term_data;
          for (let i = 0; i < termData.length; i++) {
            let obj = termData[i];
            let childData = obj.children_data;
            for (let j = 0; j < childData.length; j++) {
              if (childData[j].key == id) {
                return true;
              }
            }
            if (obj.key == id) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const handleLabel = (val) => {
    setLabelInput(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.label = { ...s.label, value: val };
      },
    });
  };

  const handleEdit = () => {
    props.openBuilderSetting(true);
  };

  const seedShowMoreStyleIfNeeded = (moduleRef) => {
    if (String(moduleRef?.settings?.term_show_more) !== "true") {
      return;
    }
    if (!moduleRef.style) {
      moduleRef.style = {};
    }
    if (!moduleRef.style.showmore && fModuleStyle?.showmore) {
      moduleRef.style.showmore = JSON.parse(JSON.stringify(fModuleStyle.showmore));
    }
  };

  const changeInitialData = (data) => {
    setDataSource(data.data_source);
    if (data.data_source != settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label == "false" ? false : true);
    if (data.label.is_label == "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }

    setToggle((prev) => ({
      ...prev,
      enable: resolveFilterLabelCollapseToggleState(data).enable,
    }));
    if (
      !canUseFilterLabelCollapse() ||
      data.enable_toggle == "false"
    ) {
      data.close_toggle = "false";
      setToggle((prev) => ({
        ...prev,
        close: false,
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);
    let nextSettings = enforceSingleDefaultTermsInSettings(
      applyFilterLabelCollapseTierToSettings({ ...data, multiple_term: "false" }),
      { forceSingle: true }
    );
    nextSettings = ensureTermShowMoreSettingsDefaults(nextSettings);
    const prevVisual = resolveTermVisual({
      ...settingData,
      post_type: resolvedPostType,
    });
    const nextVisual = resolveTermVisual(
      resolveSettingsForTermVisualDefaults(nextSettings, resolvedPostType)
    );
    if (prevVisual !== TERM_VISUAL_COLOR && nextVisual === TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: TERM_VISUAL_COLOR,
      };
      nextSettings = ensureDefaultSwatchColorsOnSettings(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    } else if (
      prevVisual === TERM_VISUAL_COLOR &&
      nextVisual === TERM_VISUAL_ICON &&
      canUseFilterShowIcon()
    ) {
      nextSettings = ensureDefaultTermIconsOnSettings(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    } else if (
      !canUseFilterShowIcon() &&
      String(nextSettings.show_icon) === "true" &&
      canUseFilterColorSwatch(resolvedPostType) &&
      nextSettings.term_visual !== TERM_VISUAL_COLOR
    ) {
      nextSettings = {
        ...nextSettings,
        term_visual: TERM_VISUAL_COLOR,
      };
    }
    nextSettings = applyDropdownCustomFieldVisualDefaults(
      nextSettings,
      prevVisual,
      nextVisual,
    );
    const withDefaultIcons = applyDefaultTermIconsIfNeeded(
      nextSettings,
      resolvedPostType
    );
    if (withDefaultIcons.taxonomy_data !== nextSettings.taxonomy_data) {
      nextSettings = withDefaultIcons;
      setTaxonomyList(nextSettings.taxonomy_data);
    }
    commitFilterModuleReplaceSettings({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
      patchModule: seedShowMoreStyleIfNeeded,
    });
    //removeParentChild();
  };

  const changeInitialDataOptChnage = (data) => {
    setDataSource(data.data_source);
    if (data.data_source != settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label == "false" ? false : true);
    if (data.label.is_label == "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }

    setToggle((prev) => ({
      ...prev,
      enable: resolveFilterLabelCollapseToggleState(data).enable,
    }));
    if (
      !canUseFilterLabelCollapse() ||
      data.enable_toggle == "false"
    ) {
      data.close_toggle = "false";
      setToggle((prev) => ({
        ...prev,
        close: false,
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);

    // styleData.meta1[selectedDevice].default.flexFlow = "row";
    // styleData.meta1[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta1[selectedDevice].default.alignItems = "flex-start";

    // styleData.meta3[selectedDevice].default.flexFlow = "row";
    // styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta3[selectedDevice].default.alignItems = "flex-start";

    // items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
    // props.onSettingChange(items);

    let nextSettings = enforceSingleDefaultTermsInSettings(
      applyFilterLabelCollapseTierToSettings({
        ...data,
        multiple_term: "false",
      }),
      { forceSingle: true }
    );
    nextSettings = ensureTermShowMoreSettingsDefaults(nextSettings);
    // Free may flip to Color Swatch via applyFreeColorSwatchOnEnable — seed white defaults.
    const prevVisual = resolveTermVisual({
      ...settingData,
      post_type: resolvedPostType,
    });
    const nextForDefaults = resolveSettingsForTermVisualDefaults(
      nextSettings,
      resolvedPostType
    );
    const nextVisual = resolveTermVisual(nextForDefaults);
    if (prevVisual !== TERM_VISUAL_COLOR && nextVisual === TERM_VISUAL_COLOR) {
      nextSettings = {
        ...nextSettings,
        term_visual: TERM_VISUAL_COLOR,
      };
      nextSettings = ensureDefaultSwatchColorsOnSettings(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    } else if (
      prevVisual === TERM_VISUAL_COLOR &&
      nextVisual === TERM_VISUAL_ICON &&
      canUseFilterShowIcon()
    ) {
      nextSettings = ensureDefaultTermIconsOnSettings(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    } else if (
      !canUseFilterShowIcon() &&
      String(nextSettings.show_icon) === "true" &&
      canUseFilterColorSwatch(resolvedPostType) &&
      nextSettings.term_visual !== TERM_VISUAL_COLOR
    ) {
      nextSettings = {
        ...nextSettings,
        term_visual: TERM_VISUAL_COLOR,
      };
    }
    nextSettings = applyDropdownCustomFieldVisualDefaults(
      nextSettings,
      prevVisual,
      nextVisual,
    );
    const withDefaultIcons = applyDefaultTermIconsIfNeeded(
      nextSettings,
      resolvedPostType
    );
    if (withDefaultIcons.taxonomy_data !== nextSettings.taxonomy_data) {
      nextSettings = withDefaultIcons;
      setTaxonomyList(nextSettings.taxonomy_data);
    }
    commitFilterModuleReplaceSettings({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
      patchModule: seedShowMoreStyleIfNeeded,
    });
    
  };

  // const changeInitialDataCountOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source != settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label == "false" ? false : true);
  //   if (data.label.is_label == "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle == "false" ? false : true,
  //   }));
  //   if (data.enable_toggle == "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);


    
  //   items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
  //   props.onSettingChange(items);
    
  //   commitFilterModuleReplaceSettings({
  //     data: props.data,
  //     rowindex,
  //     columnindex,
  //     moduleindex,
  //     resolvedPostType,
  //     onSettingChange: props.onSettingChange,
  //     nextSettings: data,
  //   });
    
  // };

  const handleAllOptionInput = (val) => {
    setAllOptionInput(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.dropdown_data = s.dropdown_data || {};
        s.dropdown_data.all_option = {
          ...(s.dropdown_data.all_option || {}),
          value: val,
        };
      },
    });
  };


  const customFieldKeyFunc = (value, customField ,index) => {
    let updateData = [];
    let updatedPredefinedTerms = settingData?.cf_predefined_terms;
    if (customField === "key") {
      let customFieldKey = "";
      let valueArray =[];
      updateData = customFieldArray.map((item, id) => {
        if (id === index) {
          customFieldKey = item?.custom_field_key;
          valueArray = item?.custom_field_value_list;
          return { ...item, custom_field_key: value ,custom_field_value_list : []};
        }

        return item;

      });
      updatedPredefinedTerms = removeMatchedPredefinedTerms(
        customFieldKey,
        valueArray,
        settingData?.cf_predefined_terms
      );
      
  }
    if (customField === "value") {
      
    updateData = customFieldArray?.map((item, id) => {

      if (id === index) {

        return {
          ...item,
          custom_field_value_list: [
            ...(item.custom_field_value_list || []),
            {
              key: value,
              label: value,
              icons: buildDefaultCustomFieldValueIcons(
                isTermVisualColor({
                  ...settingData,
                  post_type: resolvedPostType,
                }),
              ),
              predefine:"false",
            }
          ],
        };

      }

      return item;

    });
    }
    setCustomFieldArray(updateData);
    settingData.custom_field_data = updateData;
    settingData.cf_predefined_terms = updatedPredefinedTerms
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      },
    });
  };

  // const handleCustomFieldSetting = (index) => {
  //   setCurrCustomFieldValue(index);
  //   setTimeout(() => {
  //     setTermSettingPopUpCusField(true);
  //   }, 500);
  // };
  const handleSaveCustomFieldLabel = () => {
    if (keyValueCf === "" || labelValueCf === "") {
      setCheckError(true);
      return false;
    }

    const updateData = customFieldArray?.map((item, id) => {
      if (id !== currCustomFieldValue[0]) return item;

      return {
        ...item,
        custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {
          if (vid !== currCustomFieldValue[1]) return value;

          return {
            ...value,
            key: keyValueCf,
            label: labelValueCf,
          };
        }),
      };
    });

    setTermSettingPopUpCusFieldLabel(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);

    setCustomFieldArray(updateData);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
      },
    });
  };

  const handleSaveCustomFieldIcon = () => {
    const updateData = customFieldArray?.map((item, id) => {
      if (id !== currCustomFieldValue[0]) return item;

      return {
        ...item,
        custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {
          if (vid !== currCustomFieldValue[1]) return value;

          return {
            ...value,
            icons: {
              ...(value.icons || {}),
              icon: contentIconDetailCusField.icon,
              position: contentIconDetailCusField.position,
              type: contentIconDetailCusField.type,
              iconChecked: false,
            },
          };
        }),
      };
    });

    setcontentIconDetailCusField((prev) => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon",
    }));
    setTermSettingPopUpCusFieldIcon(false);
    setCurrCustomFieldValue([]);
    setCheckError(false);

    setCustomFieldArray(updateData);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
      },
    });
  };

  const handleCancelCustomFieldLabel = () => {
    setTermSettingPopUpCusFieldLabel(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);
  };

  const handleCancelCustomFieldIcon = () => {
    setcontentIconDetailCusField((prev) => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type: "icon",
    }));
    setTermSettingPopUpCusFieldIcon(false);
    setCurrCustomFieldValue([]);
    setCheckError(false);
  };
  const handleTermSwitchCusField = (checked) => {
    setTermPredefinedCusField(checked);
  };
  //   const TemrsRefresh=()=>{
  //     setIsLoading(false)
  //     setTimeout(()=>{
  //     setIsLoading(true);
  //   },600)
  //   }

  useEffect(() => {
    const fetchTaxoData = async () => {
      try {
        const res = await apiClient.get(
          apiEndpoints.getTaxonomyRecursiveData(
            resolvedPostType
          )
        );
        if (res.data && res.data.status === "success") {
          //console.log(res.data);
          setTaxonomyListArray(res.data.taxonomy_list);
          setIsLoading(false);
          setLoadingCatogries(true);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    if (resolvedPostType) {
      setPostType(resolvedPostType);
      setLoadingCatogries(false);
      //console.log(resolvedPostType)
      fetchTaxoData();
    }
  }, [resolvedPostType]);

  // Refresh saved term counts from live taxonomy totals (catalog-aware).
  // Also heals the dropdown "first selected term" bug where count was omitted.
  useEffect(() => {
    if (!Array.isArray(taxonomyListArray) || taxonomyListArray.length === 0) {
      return;
    }
    const savedGroups = settingData?.taxonomy_data;
    if (!Array.isArray(savedGroups) || savedGroups.length === 0) {
      return;
    }

    const { next, changed } = backfillTaxonomyDataCounts(
      savedGroups,
      buildTermCountMapFromTaxonomyList(taxonomyListArray)
    );

    if (!changed) {
      return;
    }

    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (settingsRef) => {
        settingsRef.taxonomy_data = next;
      },
      onAfterCommit: (nextSettings) => setTaxonomyList(nextSettings.taxonomy_data),
    });
  }, [taxonomyListArray]);

  const getAllTermsRecursive = (termList) => {
    let all = [];
    const defaultTermIcons = getDefaultTermIconsForMode(
      resolveSettingsForTermVisualDefaults(settingData, resolvedPostType)
    );
    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach((term) => {
        all.push({
          key: term?.id,
          value: term?.name,
          predefine: "false",
          icons: defaultTermIcons,
          count: term?.total_count ?? term?.count,
        });
        if (
          Array.isArray(term.children_data) &&
          term.children_data.length > 0
        ) {
          all = [...all, ...getAllTermsRecursive(term.children_data)];
        }
      });
    }
    return all;
  };
  const isAllSelected = (taxonomyKey) => {
    const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(
      (data) => data.key === taxonomyKey
    );

    if (!taxItem) return false;

    const allTerms = getAllTermsRecursive(taxItem.term_data);

    if (!savedTax || !savedTax.term_data) return false;

    return allTerms.every((term) =>
      savedTax.term_data.some((saved) => saved.key === term.key)
    );
  };

  const isAnySelected = (taxonomyKey) => {
    const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(
      (data) => data.key === taxonomyKey
    );

    if (!taxItem) return false;

    const allTerms = getAllTermsRecursive(taxItem.term_data);

    if (!savedTax || !savedTax.term_data) return false;

    // agar ek bhi term.key savedTax.term_data me mil jaye to true return kare
    const hasAnyMatch = allTerms.some((term) =>
      savedTax.term_data.some((saved) => saved.key === term.key)
    );
    if (hasAnyMatch) {
      return true;
    } else {
      false;
    }
  };
  const TaxoToggleExpand = (taxokey) => {
    setFirstRender(false);
    setExpandedTaxoItems((prev) => {
      const newArray = prev.includes(taxokey)
        ? prev.filter((x) => x !== taxokey)
        : [...prev, taxokey];
      return Array.from(new Set(newArray));
    });
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => {
      const newArray = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      return Array.from(new Set(newArray));
    });
  };

  const getFreshSettingsSnapshot = () => {
    return createFilterModuleSettingsSnapshot({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
    });
  };

  const commitSettingsSnapshot = (freshItems, settingsRef, nexttaxonomyData) => {
    commitFilterModuleTaxonomyData({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: (nextSettings) => setTaxonomyList(nextSettings.taxonomy_data),
    });
  };

  const handleTerm = (e, taxonomy, term) => {
    // console.log(e.target.checked, taxonomy, term)
    const { freshItems, settingsRef } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    let updatedPredefinedTerms = [...settingsRef?.predefined_terms];
    const checked = e.target.checked;
    const taxonomyExists = newtaxonomyData.some(
      (data) => data.key === taxonomy
    );
    const defaultTermIcons = getDefaultTermIconsForMode(
      resolveSettingsForTermVisualDefaults(settingsRef, resolvedPostType)
    );

    if (checked) {
      if (taxonomyExists) {
        const data = newtaxonomyData.find((d) => d.key === taxonomy);
        const termData = [...data.term_data];
        const isValuePresent = termData.some((obj) => obj.key === term?.id);
        if (!isValuePresent) {
          termData.push({
            key: term?.id,
            value: term?.name,
            predefine: "false",
            icons: defaultTermIcons,
            count: term?.total_count ?? term?.count,
          });
          data.term_data = termData;
        }
      } else {
        newtaxonomyData.push({
          key: taxonomy,
          term_data: [
            {
              key: term?.id,
              value: term?.name,
              predefine: "false",
              icons: defaultTermIcons,
              count: term?.total_count ?? term?.count,
            },
          ],
        });
      }
    } else {
      if (taxonomyExists) {
        const data = newtaxonomyData.find((d) => d.key === taxonomy);
        if (data) {
          data.term_data = data.term_data.filter((obj) => obj.key !== term?.id);
          if (data.term_data.length === 0) {
            data.term_data = [];
            newtaxonomyData = newtaxonomyData.filter(
              (tx) => tx.key !== taxonomy
            );
          }
        }
        /* start remove from PredefinedTerms */
        updatedPredefinedTerms = updatedPredefinedTerms?.filter(
          (itemData) =>
            itemData !== `${String(taxonomy).trim()}___${String(term?.id).trim()}`
        );
        /* end remove from PredefinedTerms */
      }
    }

    settingsRef.predefined_terms = updatedPredefinedTerms;
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  const handleTermChecked = (taxonomy, term) => {
    const taxo =
      Array.isArray(settingData.taxonomy_data) &&
      settingData.taxonomy_data?.find((d) => d.key === taxonomy);

    if (!taxo || !Array.isArray(taxo.term_data)) return false;

    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (child.key === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    for (const obj of taxo.term_data) {
      if (obj.key === term?.id) return true;
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const foundInChildren = searchInChildren(obj.children_data, term?.id);
        if (foundInChildren) return true;
      }
    }

    return false;
  };

  const findTermObjRecursive = (data, termId) => {
    if (!Array.isArray(data)) return null;
    for (const obj of data) {
      if (obj.key === termId) {
        return obj;
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const found = findTermObjRecursive(obj.children_data, termId);
        if (found) return found;
      }
    }
    return null;
  };

  const isTermPredefined = (taxonomy, term) => {
    const taxo = settingData.taxonomy_data?.find((d) => d.key === taxonomy);
    if (!taxo) return false;
    const termObj = findTermObjRecursive(taxo.term_data, term?.id);
    return termObj?.predefine === "true";
  };

  const getTermSavedIcons = (taxonomy, term) => {
    const taxo = settingData.taxonomy_data?.find((d) => d.key === taxonomy);
    if (!taxo) return null;
    const termObj = findTermObjRecursive(taxo.term_data, term?.id);
    return termObj?.icons || null;
  };

  const termHasIcon = (icons) => {
    if (!icons || typeof icons !== "object") return false;
    const iconValue = icons.icon;
    if (typeof iconValue === "string" && iconValue.trim() !== "") {
      return true;
    }
    if (iconValue && typeof iconValue === "object") {
      if (iconValue.url) return true;
      return Object.keys(iconValue).length > 0;
    }
    return false;
  };

  const getTermIconPreviewSrc = (icons) => {
    if (!termHasIcon(icons)) return "";
    const iconValue = icons.icon;
    if (typeof iconValue === "string") return iconValue;
    if (iconValue?.url) return iconValue.url;
    if (iconValue?.icon?.url) return iconValue.icon.url;
    return "";
  };

  const updateTermPredefineInTree = (terms, termId, checked) => {
    if (!Array.isArray(terms)) return terms;
    return terms.map((obj) => {
      if (obj.key === termId) {
        return { ...obj, predefine: checked ? "true" : "false" };
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        return {
          ...obj,
          children_data: updateTermPredefineInTree(obj.children_data, termId, checked),
        };
      }
      return obj;
    });
  };

  const applyColorToTermTree = (terms, termId, color) => {
    if (!Array.isArray(terms)) return terms;
    return terms.map((obj) => {
      if (obj.key === termId) {
        return {
          ...obj,
          icons: buildColorTermIcons(
            obj.icons,
            color,
            obj.icons?.position || "before"
          ),
        };
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        return {
          ...obj,
          children_data: applyColorToTermTree(obj.children_data, termId, color),
        };
      }
      return obj;
    });
  };

  const handleTermColorInline = (term, taxonomy, color) => {
    if (!color || !handleTermChecked(taxonomy, term)) {
      return;
    }

    const { freshItems, settingsRef } = createFilterModuleSettingsSnapshot({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
    });

    const taxonomyExists = settingsRef.taxonomy_data?.some(
      (data) => data.key === taxonomy
    );
    if (!taxonomyExists) {
      return;
    }

    const newtaxonomyData = settingsRef.taxonomy_data.map((group) => {
      if (group.key !== taxonomy) return group;
      return {
        ...group,
        term_data: applyColorToTermTree(group.term_data, term?.id, color),
      };
    });

    commitFilterModuleTaxonomyData({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: (next) => setTaxonomyList(next.taxonomy_data),
    });
  };

  const handleTermPredefinedInline = (term, taxonomy, checked) => {
    if (!handleTermChecked(taxonomy, term)) {
      return;
    }

    const term_id = `${taxonomy}___${term?.id}`;
    const { freshItems, settingsRef } = createFilterModuleSettingsSnapshot({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
    });

    applyTaxonomyDefaultTermToSettings({
      settingsRef,
      termKey: term_id,
      taxonomyKey: taxonomy,
      numericTermId: term?.id,
      checked,
      allowMultiple: false,
    });

    const taxonomyExists = settingsRef.taxonomy_data?.some(
      (data) => data.key === taxonomy
    );
    if (!taxonomyExists) {
      return;
    }

    const newtaxonomyData = settingsRef.taxonomy_data;

    commitFilterModuleTaxonomyData({
      freshItems,
      rowindex,
      columnindex,
      moduleindex,
      settingsRef,
      nexttaxonomyData: newtaxonomyData,
      onSettingChange: props.onSettingChange,
      onAfterCommit: (next) => setTaxonomyList(next.taxonomy_data),
    });
  };

  const TermTaxonomyRowActions = ({ term, taxonomy, onOpenSettings }) => {
    const showTermIconControl = shouldShowFilterTermIconControl(
      settingData?.show_icon
    );
    const colorMode = isTermVisualColor({
      ...settingData,
      post_type: resolvedPostType,
    });
    const isTermSelected = handleTermChecked(taxonomy, term);
    const isDefault = isTermPredefined(taxonomy, term);
    const termIcons = getTermSavedIcons(taxonomy, term);
    const hasColor = termHasColorSwatch(termIcons);
    const hasIcon = colorMode
      ? hasColor
      : termHasIcon(termIcons) && termIcons?.type !== "color";
    const iconPreviewSrc = getTermIconPreviewSrc(termIcons);
    const swatchColor = getTermSwatchColor(termIcons);
    const termIconActionsLocked = !canUseFilterTermIcon();
    const termDefaultLocked = !canUseFilterTermDefault();
    const termActionsLocked = termDefaultLocked || termIconActionsLocked;
    // Free: color swatch picker is unlocked; FA/SVG icon picker stays Pro.
    const colorTriggerDisabled = !isTermSelected;
    const iconTriggerDisabled = !isTermSelected || termIconActionsLocked;
    const addLabel = colorMode
      ? hasColor
        ? "Edit term color"
        : "Add term color"
      : hasIcon
        ? "Edit term icon"
        : "Add term icon";

    const handleColorCommit = useCallback(
      (nextColor) => {
        handleTermColorInline(term, taxonomy, nextColor);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [term?.id, taxonomy]
    );

    return (
      <span
        className="caf-term-row-actions"
        onClick={(event) => event.stopPropagation()}
      >
        {showTermIconControl && colorMode && (
          <TermColorPickerTrigger
            color={swatchColor}
            disabled={colorTriggerDisabled}
            label={addLabel}
            onColorCommit={handleColorCommit}
          />
        )}
        <FilterTermRowProActions
          isTermSelected={isTermSelected}
          isDefault={isDefault}
          hasIcon={hasIcon}
          termIcons={termIcons}
          iconPreviewSrc={iconPreviewSrc}
          iconTriggerDisabled={iconTriggerDisabled}
          termDefaultLocked={termDefaultLocked}
          termIconActionsLocked={termIconActionsLocked}
          addLabel={addLabel}
          onOpenSettings={onOpenSettings}
          onToggleDefault={(checked) =>
            handleTermPredefinedInline(term, taxonomy, checked)
          }
          showIconControl={showTermIconControl && !colorMode}
        />
      </span>
    );
  };

  function NestedTerms({
    taxoKey,
    childrenData,
    expandedItems,
    toggleExpand,
    handleTerm,
    handleTermChecked,
  }) {
    if (!Array.isArray(childrenData) || childrenData.length === 0) return null;
    return (
      // <ul className="children">
      <>
        {childrenData.map((child) => {
          const hasChildren =
            Array.isArray(child?.children_data) &&
            child.children_data.length > 0;
          const hasChildClass =
            Array.isArray(child?.children_data) &&
              child.children_data.length > 0
              ? "tc-caf-has-child"
              : "";
          const isExpanded = expandedItems.includes(child.id);
          return (
            <li
              key={child?.id}
              className={`cat-item cat-item-${child?.id} ${hasChildClass}`}
              count={child?.total_count}
              term-id={child?.id}
            >
              <div className="trusty-manage-bar-sec-label">
                <label htmlFor={`${taxoKey}-list-id${child?.id}`}>
                  <input
                    className={`${taxoKey}-list check`}
                    type="checkbox"
                    term-name={child?.name}
                    name={`${taxoKey}[]`}
                    id={`${taxoKey}-list-id${child?.id}`}
                    value={`${taxoKey}___${child?.id}`}
                    onChange={(e) => handleTerm(e, taxoKey, child)}
                    checked={handleTermChecked(taxoKey, child)}
                  />
                  <TermTaxonomyLabelText
                    name={child?.name}
                    count={child?.total_count}
                  />
                </label>
                <TermTaxonomyRowActions
                  term={child}
                  taxonomy={taxoKey}
                  onOpenSettings={() => handleTermSetting(child, taxoKey)}
                />
                {hasChildren && (
                  <i
                    className={`fa ${isExpanded ? "fa-angle-up" : "fa-angle-down"
                      } caf-builder-plus`}
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(child.id);
                    }}
                    style={{ cursor: "pointer" }}
                  ></i>
                )}
              </div>

              {hasChildren && (
                <ul
                  className={`children ${isExpanded ? "tc_caf_active_list" : ""
                    }`}
                >
                  {/* <NestedTerms taxoKey={taxoKey} childrenData={child.children_data} /> */}
                  <NestedTerms
                    taxoKey={taxoKey}
                    childrenData={child.children_data}
                    expandedItems={expandedItems}
                    toggleExpand={toggleExpand}
                    handleTerm={handleTerm}
                    handleTermChecked={handleTermChecked}
                  />
                </ul>
              )}
            </li>
          );
        })}
      </>
      // </ul>
    );
  }

  const handleSelectAll = (taxonomy) => {
    const { freshItems, settingsRef } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];

    const taxItem = taxonomyListArray.find(item => item.key === taxonomy);
    if (!taxItem) return;


    const existingTaxData = newtaxonomyData.find(data => data.key === taxonomy);
    const existingTerms = existingTaxData ? existingTaxData.term_data : [];

    const allTerms = getAllTermsRecursiveForAll(taxItem.term_data, existingTerms);

    if (existingTaxData) {
      newtaxonomyData = newtaxonomyData.map(data => {
        if (data.key === taxonomy) {
          const merged = [...data.term_data, ...allTerms];
          const unique = Array.from(new Map(merged.map(item => [item.key, item])).values());
          return { ...data, term_data: unique };
        }
        return data;
      });
    } else {
      newtaxonomyData.push({
        key: taxonomy,
        term_data: allTerms
      });
    }

    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  const getAllTermsRecursiveForAll = (termList, existingTerms = []) => {
    let all = [];
    const defaultTermIcons = getDefaultTermIconsForMode(
      resolveSettingsForTermVisualDefaults(settingData, resolvedPostType)
    );
    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach(term => {
        const alreadyExists = existingTerms.some(t => t.key === term.id);
        if (!alreadyExists) {
          all.push({
            key: term.id,
            value: term.name,
            predefine: "false",
            icons: defaultTermIcons,
            count: term?.total_count ?? term?.count,
          });
        }
        if (Array.isArray(term.children_data) && term.children_data.length > 0) {
          all = [...all, ...getAllTermsRecursiveForAll(term.children_data, existingTerms)];
        }
      });
    }
    return all;
  };
  const removeTaxoMatchedPredefinedTerms = (
    predefinedTerms = [],
    taxonomy,
    termData = []
  ) => {
    // nested keys collect karne ka func
    const collectKeys = (items = [], keys = []) => {
      items.forEach((item) => {
        if (item?.key !== undefined && item?.key !== null) {
          keys.push(
            `${String(taxonomy).trim()}___${String(item.key).trim()}`
          );
        }
  
        if (Array.isArray(item?.children_data) && item?.children_data?.length) {
          collectKeys(item?.children_data, keys);
        }
      });
  
      return keys;
    };
  
    const matchedKeys = collectKeys(termData);
  
    return predefinedTerms.filter(
      (item) => !matchedKeys.includes(item)
    );
  };
  const handleSelectNone = (taxonomy) => {
    const { freshItems, settingsRef } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    let updatedPredefinedTerms = [...settingsRef?.predefined_terms];
    const taxonomyItem = newtaxonomyData.find((data) => data.key === taxonomy);

    if (taxonomyItem) {
      /* start remove from PredefinedTerms */
      updatedPredefinedTerms = removeTaxoMatchedPredefinedTerms(
        updatedPredefinedTerms,
        taxonomy,
        taxonomyItem?.term_data
      );
    /* end remove from PredefinedTerms */
      taxonomyItem.term_data = [];
      newtaxonomyData = newtaxonomyData.filter((tx) => tx.key !== taxonomy);
    }
    settingsRef.predefined_terms = updatedPredefinedTerms;
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  const handleTermSetting = (term, taxonomy) => {
    if (isTermVisualColor({
      ...settingData,
      post_type: resolvedPostType,
    })) {
      return;
    }
    let hasParent = false;
    if (term?.children_data?.length > 0) {
      hasParent = true;
    }
    let term_id = taxonomy + "___" + term?.id;
    let newtaxonomyData = [...settingData.taxonomy_data];
    const data = newtaxonomyData.find((d) => d.key === taxonomy);
    const termData = Array.isArray(data?.term_data) ? [...data.term_data] : [];
    const termObj = findTermObjRecursive(termData, term?.id) || {};
    setTermDetail([
      term?.id,
      taxonomy,
      term_id,
      term?.name,
      hasParent,
      handleTermChecked(taxonomy, term),
      termObj,
    ]);
    setTimeout(() => {
      setTermSettingPopUp(true);
    }, 100);
  };
    const onLabelIconSwitch = (checked) => {
    if (!canUseLabelShowIcon()) {
      return;
    }
    setLabelIconSwitch(checked);
    let itm = { ...settingData?.label};
    let ic = { ...itm?.icons };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
      ic.position ="before-label";
    }
    ic.visibility = checked;
    itm.icons = { ...itm.icons, ...ic };
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.label = itm;
      },
    });
  };
  const handleAllOptionChecked=(checked)=>{
     setAllOptEnable(checked);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.dropdown_data = s.dropdown_data || {};
        s.dropdown_data.all_option = {
          ...(s.dropdown_data.all_option || {}),
          is_enable: checked ? "true" : "false",
        };
      },
    });
  }
  const handleAllOptSetting =()=>{
    // setTimeout(()=>{
    //setAllOptModal(true);
    // },1500)
    
  }
  const handleSaveAllOption =()=>{
    const value = allOptionInput;
    const iconData = allOptArray?.icons;
    const visibility = allIconSwitch;
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.dropdown_data = s.dropdown_data || {};
        let itm = { ...(s.dropdown_data.all_option || {}) };
        itm.value = value;
        itm.icons = { ...(itm.icons || {}), ...(iconData || {}) };
        let ic = { ...itm.icons };
        if (visibility === false) {
          ic.icon = "";
          ic.type = "icon";
        }
        ic.visibility = visibility;
        itm.icons = { ...itm.icons, ...ic };
        s.dropdown_data.all_option = itm;
      },
      onAfterCommit: (next) =>
        setAllOptArray(next.dropdown_data?.all_option),
    });

    setAllOptModal(false);

  }
  const handleCancelAllOption =()=>{
    setAllOptionInput(settingData?.dropdown_data?.all_option?.value ?? "")
    setAllIconSwitch(
      canUseFilterShowIcon()
        ? (settingData?.dropdown_data?.all_option?.icons?.visibility ?? false)
        : false
    )
    setAllOptArray(settingData?.dropdown_data?.all_option)
    setAllOptModal(false);
  }
  const changeDataSource = (value) => {
  if (value === "custom_field" && !canUseFilterCustomField()) {
    return;
  }
  setDataSource(value);
  // console.log(data);
  if (value !== settingData.data_source) {
    setLoadingCatogries(false);
    setTimeout(() => {
      setLoadingCatogries(true);
    }, 400);
  }
  commitFilterModuleSettingsPatch({
    data: props.data,
    rowindex,
    columnindex,
    moduleindex,
    resolvedPostType,
    onSettingChange: props.onSettingChange,
    patch: (s) => {
      s.data_source = value;
      if (value === "custom_field") {
        s.show_count = "false";
      }
    },
  });
};
  const getCompareLabel = (value) => {
    const match = customFieldCompareOperators?.find(
      (item) => item.value === value
    );
    return match ? match.label : "";
  };

  const formatCfValueListSummary = (list) =>
    (list || [])
      .map((val) =>
        val && typeof val === "object"
          ? String(val.label ?? val.key ?? "")
          : String(val ?? ""),
      )
      .filter(Boolean)
      .join(" , ");

  const removeArray = (arr, index) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // part of the array after the specified index
    ...arr.slice(index + 1),
  ];

  const removeMatchedPredefinedTerms = (
    customFieldKey = "",
    valueArray = [],
    cfPredefinedTerms = []
  ) => {
    if (customFieldKey === "" || valueArray.length === 0) {
      return cfPredefinedTerms;
    }
  
    const removeValues = new Set(
      valueArray.map(
        (item) =>
          `${String(customFieldKey).trim()}___${String(item?.key).trim()}`
      )
    );
  
    return cfPredefinedTerms.filter(
      (predefinedItem) =>
        !removeValues.has(String(predefinedItem).trim())
    );
  };

  const deleteCustomField = (index,item) => {

    let updatedCustomFieldData = JSON.parse(JSON.stringify(customFieldArray));
    updatedCustomFieldData = removeArray(updatedCustomFieldData, index);
    setCustomFieldArray([...updatedCustomFieldData])

    
    /* start remove from predefine */

    let customFieldKey = item?.custom_field_key
    let valueArray = item?.custom_field_value_list;
    let updatedPredefinedTerms =  removeMatchedPredefinedTerms(customFieldKey,valueArray,settingData?.cf_predefined_terms);
    
    /* start remove from predefine */

    settingData.custom_field_data = updatedCustomFieldData;
    settingData.cf_predefined_terms = updatedPredefinedTerms;
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updatedCustomFieldData;
        s.cf_predefined_terms = updatedPredefinedTerms;
      },
    });
    
  };
  const addCustomField = () => {
    let newField = {
      custom_field_key: "0",
      custom_field_value_list: [],
      compare_operator: "=",
      meta_type: "CHAR",
    };
    let updatedCustomFieldData  = [...customFieldArray];
    updatedCustomFieldData?.push(newField); 
    setCustomFieldArray(updatedCustomFieldData);
    settingData.custom_field_data = updatedCustomFieldData;
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updatedCustomFieldData;
      },
    });
  };
  const toggleCfRow = (index) => {
  setOpenCfRows((prev) => ({
    ...prev,
     [index]: !(prev[index] ?? true),
  }));
};
const toggleCfAdv = (index) => {
  setOpenCfAdv((prev) => ({
    ...prev,
     [index]: !prev[index],
  }));
};
    const handleCompareOperator = (value,index) => {
    let updateData = customFieldArray?.map((item, id) => {

      if (id === index) {
         return { ...item, compare_operator: value };
      }
      return item;
    });

    setCustomFieldArray([...updateData])
    settingData.custom_field_data = updateData;
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
      },
    });

  };
     const handleMetaType = (value,index) => {

   let updateData = customFieldArray?.map((item, id) => {
      if (id === index) {
        return { ...item, meta_type: value };
      }
      return item;
    });

    setCustomFieldArray([...updateData])
    settingData.custom_field_data = updateData;
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
      },
    });
  };
  const openCustomFieldLabelSetting = (cfIndex, valueIndex, valueData) => {
    setCurrCustomFieldValue([cfIndex, valueIndex, valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusFieldLabel(true);
    }, 100);
  };

  const openCustomFieldIconSetting = (cfIndex, valueIndex, valueData) => {
    setCurrCustomFieldValue([cfIndex, valueIndex, valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusFieldIcon(true);
    }, 100);
  };

  const handleCfColorInline = (cfIndex, valueIndex, color) => {
    if (!color) {
      return;
    }
    const cfItem = customFieldArray[cfIndex];
    if (!cfItem) {
      return;
    }
    const updateData = customFieldArray.map((item, id) => {
      if (id !== cfIndex) {
        return item;
      }
      return {
        ...item,
        custom_field_value_list: applyColorToCustomFieldValue(
          item?.custom_field_value_list,
          valueIndex,
          color,
        ),
      };
    });
    setCustomFieldArray(updateData);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
      },
    });
  };

  const handleCfPredefinedInline = (cfIndex, valueIndex, checked) => {
    const cfItem = customFieldArray[cfIndex];
    const val = cfItem?.custom_field_value_list?.[valueIndex];
    if (!cfItem || !val?.key) return;

    const termId = `${String(cfItem.custom_field_key).trim()}___${String(val.key).trim()}`;
    const { customFieldData: updateData, cfPredefinedTerms: updatedPredefinedTerms } =
      applyCustomFieldDefaultTermToSettings({
        customFieldData: customFieldArray,
        cfPredefinedTerms: settingData.cf_predefined_terms,
        termId,
        cfIndex,
        valueIndex,
        checked,
        allowMultiple: false,
      });

    setCustomFieldArray(updateData);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
        s.cf_predefined_terms = updatedPredefinedTerms;
        s.multiple_term = "false";
      },
    });
  };

const deleteCustomFieldValue = (index, valueIndex,item,value) => {
      const layoutCopy = JSON.parse(JSON.stringify(customFieldArray));
      const customFieldKey =  item?.custom_field_key;
      const valueKey = value?.key;

      let  updateData = layoutCopy?.map((item, id) => {
          if (id === index) {
            return {
              ...item,
              custom_field_value_list: item.custom_field_value_list.filter(
                (_, i) => i !== valueIndex
              ),
            };
    
          }
          return item;
    
        });
    
      /* start delete form predefined array */
      let updatedPredefinedTerms = settingData.cf_predefined_terms.filter(
        (itemData) =>
          itemData !== `${String(customFieldKey).trim()}___${String(valueKey).trim()}`
      );

      /* end delete form predefined array*/

      setCustomFieldArray([...updateData])
      settingData.custom_field_data = updateData;
      settingData.cf_predefined_terms = updatedPredefinedTerms;
      commitFilterModuleSettingsPatch({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange: props.onSettingChange,
        patch: (s) => {
          s.custom_field_data = updateData;
          s.cf_predefined_terms = updatedPredefinedTerms;
        },
      });
};
  const getTermDataLength = (keyName) => {
  const found = taxonomyList?.find(item => item.key === keyName);
  return found?.term_data?.length || 0;
};
  return (
    <>
      {!isLoading ? (
        <>
          <div className="module-content-tab-row no-pad-0">
            <label className="setting-label-main">Data Source</label>
            <FilterDataSourceSegment
              value={effectiveDataSource}
              onChange={changeDataSource}
            />
            {effectiveDataSource === "taxonomy" ? (
              <>
              <div class="module-content-tab-row no-pad-0 caf-dropdown-taxo-wrapper">
                {LoadingCatogries ? (
                  Array.isArray(taxonomyListArray) ? (
                    taxonomyPickerSections.map((section) => {
                      const sectionContent = (
                      <div
                        className="caf-taxonomy-picker-section"
                      >
                        <div className="caf-taxonomy-picker-section-heading">
                          {section.label}
                        </div>
                        {section.items.map((taxo, indx) => (
                        // TaxonomyChecked(taxo.key) === true && (
                        <ul
                          className={`tc-caf-each-tax-data ${taxo.key}`}
                          data-name={taxo.key}
                          key={`${section.id}-${taxo.key}-${indx}`}
                        >
                          <li className="caf-term-title-main">
                            <div className="tc-caf-taxo-name-left-wrapper">
                              <div
                                key={taxo.key}
                                className="tc-caf-all-check-uncheck-main"
                              >
                                <label className="tc-caf-all-check-uncheck-wrapper">
                                  <input
                                    type="checkbox"
                                    className="tc-caf-all-check-uncheck-btn"
                                    checked={isAllSelected(taxo.key)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        handleSelectAll(taxo.key);
                                      } else {
                                        handleSelectNone(taxo.key);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <h2
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  padding: 0,
                                  margin: 0,
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  className={`caf-taxonomy-label-text`}
                                  title={getPlainTextFromHtml(taxo?.label)}
                                >
                                  {parse(`${taxo?.label}`)}
                                </span>
                                <div
                                    className="caf-selected-terms-count-wrapper" 
                                  >
                                      <span className="caf-selected-terms-count">
                                        {"("}
                                        {getTermDataLength(taxo.key)}
                                      </span>
                                      <span className="caf-selected-terms-count-suffix">
                                        Selected{")"}
                                      </span>
                                  </div>
                              </h2>
                            </div>
                            <div className="caf-terms-cat-btn">
                              {isWooProductAttributeTaxonomy(taxo.key) &&
                                isTermVisualColor({
                                  ...settingData,
                                  post_type: resolvedPostType,
                                }) &&
                                getTermDataLength(taxo.key) > 0 && (
                                  <WooAttributeColorActions
                                    variant="icons"
                                    visible={true}
                                    importLoading={wooColorImportLoading}
                                    resetLoading={wooColorResetLoading}
                                    onImport={handleImportWooColors}
                                    onReset={handleResetWooColors}
                                  />
                                )}
                              {(
                                firstRender === true
                                  ? isAnySelected(taxo.key) ||
                                  expandedTaxoItems.includes(taxo.key)
                                  : expandedTaxoItems.includes(taxo.key)
                              ) ? (
                                <FontAwesomeIcon
                                  icon={faChevronUp}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    TaxoToggleExpand(taxo.key);
                                  }}
                                  style={{ cursor: "pointer" }}
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    TaxoToggleExpand(taxo.key);
                                  }}
                                  style={{ cursor: "pointer" }}
                                />
                              )}
                            </div>
                          </li>
                          {Array.isArray(taxo?.term_data) &&
                            taxo.term_data.length > 0 && (
                              <>
                                {(() => {
                                  const isActive =
                                    firstRender === true
                                      ? isAnySelected(taxo.key) ||
                                      expandedTaxoItems.includes(taxo.key)
                                      : expandedTaxoItems.includes(taxo.key);

                                  if (
                                    isActive &&
                                    !expandedTaxoItems.includes(taxo.key)
                                  ) {
                                    setExpandedTaxoItems((prev) => {
                                      const newArray = [...prev, taxo.key];
                                      return Array.from(new Set(newArray));
                                    });
                                  }

                                  return (
                                    <div
                                      className={`tc-caf-taxo-term-list-section ${isActive ? "active-term-list" : ""
                                        }`}
                                    >
                                      {taxo.term_data.map((term) => {
                                        const hasChildren =
                                          Array.isArray(term?.children_data) &&
                                          term.children_data.length > 0;
                                        const hasChildClass = hasChildren
                                          ? "tc-has-child"
                                          : "";
                                        const isExpanded = expandedItems.includes(
                                          term.id
                                        );

                                        return (
                                          <li
                                            key={term?.id}
                                            className={`cat-item cat-item-${term?.id} ${hasChildClass}`}
                                            count={term?.total_count}
                                            term-id={term?.id}
                                          >
                                            <div className="trusty-manage-bar-sec-label">
                                              <label
                                                htmlFor={`${taxo?.key}-list-id${term?.id}`}
                                              >
                                                <input
                                                  className={`${taxo?.key}-list check`}
                                                  type="checkbox"
                                                  term-name={term?.name}
                                                  name={`${taxo.key}[]`}
                                                  id={`${taxo?.key}-list-id${term?.id}`}
                                                  value={`${taxo?.key}___${term?.id}`}
                                                  onChange={(e) =>
                                                    handleTerm(e, taxo?.key, term)
                                                  }
                                                  checked={handleTermChecked(
                                                    taxo?.key,
                                                    term
                                                  )}
                                                />
                                                <TermTaxonomyLabelText
                                                  name={term?.name}
                                                  count={term?.total_count}
                                                />
                                              </label>
                                              <TermTaxonomyRowActions
                                                term={term}
                                                taxonomy={taxo?.key}
                                                onOpenSettings={() =>
                                                  handleTermSetting(term, taxo?.key)
                                                }
                                              />
                                              {hasChildren && (
                                                <i
                                                  className={`fa ${isExpanded
                                                    ? "fa-angle-up"
                                                    : "fa-angle-down"
                                                    } caf-builder-plus`}
                                                  aria-hidden="true"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(term.id);
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                ></i>
                                              )}
                                            </div>

                                            {hasChildren && (
                                              <ul
                                                className={`children ${isExpanded
                                                  ? "tc_caf_active_list"
                                                  : ""
                                                  }`}
                                              >
                                                <NestedTerms
                                                  taxoKey={taxo.key}
                                                  childrenData={
                                                    term.children_data
                                                  }
                                                  expandedItems={expandedItems}
                                                  toggleExpand={toggleExpand}
                                                  handleTerm={handleTerm}
                                                  handleTermChecked={
                                                    handleTermChecked
                                                  }
                                                />
                                              </ul>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          {Array.isArray(taxo?.term_data) &&
                            taxo.term_data.length === 0 &&
                            (() => {
                              const isActive =
                                firstRender === true
                                  ? isAnySelected(taxo.key) ||
                                  expandedTaxoItems.includes(taxo.key)
                                  : expandedTaxoItems.includes(taxo.key);

                              if (
                                isActive &&
                                !expandedTaxoItems.includes(taxo.key)
                              ) {
                                setExpandedTaxoItems((prev) => {
                                  const newArray = [...prev, taxo.key];
                                  return Array.from(new Set(newArray));
                                });
                              }

                              return (
                                <div
                                  className={`tc-caf-taxo-term-list-section ${isActive ? "active-term-list" : ""
                                    }`}
                                >
                                  <li className="tc-cat-item-none">
                                    No Categories
                                  </li>
                                </div>
                              );
                            })()}
                        </ul>
                        ))}
                      </div>
                      );
                      if (section.locked) {
                        return (
                          <TierLockedWrap
                            key={section.id}
                            locked
                            showProBadge
                            className="caf-builder-tier-locked-product-filters"
                            upgradeMessage="Product filters (stock, sale, and rating) are available in Category Ajax Filter Pro."
                          >
                            {sectionContent}
                          </TierLockedWrap>
                        );
                      }
                      return (
                        <React.Fragment key={section.id}>
                          {sectionContent}
                        </React.Fragment>
                      );
                    })
                  ) : (
                      <li className="tc-taxo-item-none">
                        No Taxonomy
                      </li>
                    )
                ) : (
                  // )
                  <Skeleton active />
                )}
                <hr className="setting-hr-main"></hr>
              </div>
                    {/* <div className="module-content-tab-row">
                      <label className="setting-label-main">Placeholder</label>
                      <Input
                        onChange={(e) => handleAllOptionInput(e.target.value)}
                        value={allOptionInput}
                      />
                    </div>
                    {iconsArray && (
                      <div className="module-content-tab-row">
                        <div class="module-content-tab-row caf-design-two-half">
                          <label>Icons</label>
                          <div className="module-content-icon-switch">
                              <Switch onChange={onAllIconSwitch} checked={allIconSwitch} />
                          </div>
                        </div>
                        {allIconSwitch &&
                        <ContentIcons1
                        title="Icons"
                        data={props.data}
                        indexes={props.indexes}
                        iconsArray={iconsArray}
                        onSettingChange={props.onSettingChange}
                        tab="all_option"
                        type=""
                       ></ContentIcons1>
                      }
                      </div>
                    )} */}
              </>
            ) : (
              <div className="caf-custom-field-data-container caf-filter-module-cf-cont caf-dropdown-custom-field-wrapper">
                    {customFieldArray?.length > 0 && (
                      <>
                      <label className="setting-label-main">Custom Field</label>
                       <div className="caf-filter-custom-field-items-wrapper">
                        {customFieldArray?.map((item, index) => {
                          return(
                              <div
                                key={index}
                                className={`caf-filter-custom-field-single-row ${
                                  (openCfRows[index] ?? true) ? "toggle-active" : ""
                                } ${item?.custom_field_key === "0" ? "warning-cf-row" : ""}`}
                              >
                                <div className="caf-filter-label-inner-row-top-bar">
                                  <div className="caf-fl-query-cf-left-col">
                                      {/* {customFieldData.length > 1 && index > 0 &&(
                                      <span className="caf-fl-query-cf-group-realtion">
                                        {customFieldData[index-1]?.group_relation}
                                      </span>
                                      )} */}
                                    <strong className="caf-fl-query-cf-name">
                                      {item?.custom_field_key === "0" ? (
                                        <>
                                          <img
                                            src={warningIcon}
                                            alt=""
                                            className="caf-fl-query-warning-icon"
                                          />{" "}
                                          Select Custom Field{" "}
                                        </>
                                      ) : (
                                        item?.custom_field_key
                                      )}
                                    </strong>
                                    {item?.custom_field_key !== "0" && (
                                      <>
                                        <span className="caf-fl-query-cf-compare-label">
                                          {getCompareLabel(item?.compare_operator)}
                                        </span>
                                        {item?.custom_field_value_list?.length > 0 ? (
                                          <strong className="caf-fl-query-cf-value">
                                            {formatCfValueListSummary(
                                              item.custom_field_value_list,
                                            )}
                                          </strong>
                                        ) : (
                                          <span className="caf-fl-query-cf-value warning-cf-value">
                                            <img
                                              src={warningIcon}
                                              alt=""
                                              className="caf-fl-query-warning-icon"
                                            />{" "}
                                            Add Values
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <div className="caf-fl-query-cf-right-col">
                                    <BuilderDeleteIcon
                                      onClick={() => deleteCustomField(index,item)}
                                    />
                                  <FontAwesomeIcon
                                    icon={(openCfRows[index] ?? true) ? faChevronUp : faChevronDown}
                                    className="caf-fl-query-cf-fields-collapse-btn"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => toggleCfRow(index)}
                                  />
                                  </div>
                                </div>
                                <div className="caf-fl-query-cf-fields-collapse-wrapper"
                                style={{ display: (openCfRows[index] ?? true) ? "flex" : "none" }}
                                >
                                  <div className="caf-fl-query-cf-fields-wrapper">
                                    <Select
                                      className="caf-filter-query-custom-field-select caf-header-dropdown"
                                      options={metaKeys}
                                      onChange={(value) =>
                                        customFieldKeyFunc(value, "key",index)
                                      }
                                      style={{ width: "50%" }}
                                      value={item?.custom_field_key}
                                    />
                                    <Select
                                      className="caf-filter-query-compare caf-header-dropdown"
                                      options={customFieldCompareOperators}
                                      onChange={(value) =>
                                        handleCompareOperator(value,index)
                                      }
                                      style={{ width: "50%" }}
                                      value={item?.compare_operator}
                                      disabled={item?.custom_field_key === "0" ? true : false}
                                    />

                                  </div>
                                  <div className="caf-filter-query-custom-field-adv-opt-wrapper">
                                    <div className="caf-filter-query-custom-field-adv-opt-top-bar"
                                    onClick={() => toggleCfAdv(index)}
                                    >
                                      <span className="caf-filter-query-adv-opt-label">
                                        Advanced Options
                                      </span>
                                      <FontAwesomeIcon
                                        icon={openCfAdv[index] ? faChevronUp : faChevronDown}
                                        style={{ cursor: "pointer" }}
                                        className="caf-filter-query-adv-opt-toggle-btn"   
                                      />
                                    </div>
                                    <div className="caf-filter-query-meta-type-wrapper"
                                    style={{ display: openCfAdv[index] ? "flex" : "none" }}
                                    >
                                      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select meta value type for comparison.">
                                        <label>Meta Type</label>
                                      </Tooltip>
                                    <Select
                                      className="caf-filter-query-meta-type"
                                      options={customFieldMetaTypes}
                                      onChange={(value) => handleMetaType(value,index)}
                                      style={{ width: "auto" }}
                                      value={item?.meta_type}
                                      disabled={item?.custom_field_key === "0" ? true : false}
                                    />
                                  </div>
                                  </div>
                                  <div className="caf-filter-query-multi-value-field-wrapper">
                                    <label className="caf-filter-query-multi-value-field-label">Add Value</label>
                                    <div class="caf-filter-query-multi-value-field-input-wrapper">
                                      <input
                                        style={{ width: "100%" }}
                                        className="caf-filter-query-multi-value-field"
                                        type="text"
                                        placeholder="Enter Value"
                                        disabled={item?.custom_field_key === "0" ? true : false}
                                      />
                                      <Button
                                        title="Add"
                                        icon={<PlusCircleFilled />}
                                        className="caf-filter-query-add-value-btn"
                                        onClick={(e) => {
                                          let input = e.currentTarget
                                            .closest(
                                              ".caf-filter-query-multi-value-field-wrapper",
                                            )
                                            .querySelector("input");
                                            if(input.value.trim()!==""){
                                              if (item?.custom_field_key === "0") {
                                                return;
                                              }
                                                customFieldKeyFunc(
                                                  input.value.trim(),
                                                  "value",
                                                 index
                                                );
                                                input.value = "";
                                              }
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                      <div className="caf-filter-query-multi-value-results">
                                        {item?.custom_field_value_list?.length > 0 && (
                                        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enter values for this custom field rule.">
                                          <label>Values</label>
                                        </Tooltip>
                                        )}
                                        {Object?.keys(item)?.map((key) => {
                                          if (
                                            key === "custom_field_value_list" &&
                                            item[key]?.length > 0
                                          ) {

                                            return item[key]?.map((val, valueIndex) => (
                                              <div
                                                key={valueIndex}
                                                className="caf-filter-query-cf-value-item"
                                              >
                                                <div className="trusty-manage-bar-sec-label caf-filter-query-cf-value-row">
                                                  <CfValueLabelWithEdit
                                                    label={val?.label}
                                                    onEdit={() =>
                                                      openCustomFieldLabelSetting(
                                                        index,
                                                        valueIndex,
                                                        val
                                                      )
                                                    }
                                                  />
                                                  <CustomFieldValueRowActions
                                                    showIconControl={
                                                      settingData?.show_icon === "true"
                                                    }
                                                    colorMode={isTermVisualColor({
                                                      ...settingData,
                                                      post_type: resolvedPostType,
                                                    })}
                                                    valueIcons={val?.icons}
                                                    isDefault={val?.predefine === "true"}
                                                    onOpenSettings={() =>
                                                      openCustomFieldIconSetting(
                                                        index,
                                                        valueIndex,
                                                        val
                                                      )
                                                    }
                                                    onColorCommit={(nextColor) =>
                                                      handleCfColorInline(
                                                        index,
                                                        valueIndex,
                                                        nextColor
                                                      )
                                                    }
                                                    onToggleDefault={() =>
                                                      handleCfPredefinedInline(
                                                        index,
                                                        valueIndex,
                                                        val?.predefine !== "true"
                                                      )
                                                    }
                                                  />
                                                  <BuilderDeleteIcon
                                                    className="caf-filter-query-cf-value-delete"
                                                    onClick={() =>
                                                      deleteCustomFieldValue(
                                                        index,
                                                        valueIndex,
                                                        item,
                                                        val
                                                      )
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            ));
                                          }
                                          return null;
                                        })}
                                      </div>
                                  </div>
                                </div>
                                
                              </div>
                          );
                        })}
                       </div>
                      </>
                    )}
                <div className="select-layout-btn filter-cf-ad-btn">
                  <span 
                  className="caf-filter-query-add-new-cf-btn"
                  onClick={()=>addCustomField()}
                  >Add Field</span>
                </div>
              </div>
            )}

          </div>
          <div className="module-content-tab-row-placeholder">
            <label className="setting-label-main">Placeholder</label>
            <div className="module-content-tab-row caf-design-two-half">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set placeholder text.">
              <label>Text</label>
            </Tooltip>
            <Input
              onChange={(e) => handleAllOptionInput(e.target.value)}
              value={allOptionInput}
            />
            </div>
          </div>
            {iconsArray && (
              <FilterShowIconLockedSection>
                <FilterShowIconModeProPanel
                  data={props.data}
                  indexes={props.indexes}
                  iconsArray={iconsArray}
                  onSettingChange={props.onSettingChange}
                  enabled={canUseFilterShowIcon() && allIconSwitch}
                  onToggle={onAllIconSwitch}
                  tab="all_option"
                />
              </FilterShowIconLockedSection>
            )}
          <>
            

            <FilterShowIconLockedSection
              unlockForColorSwatch={canUseFilterColorSwatch(resolvedPostType)}
            >
            <div className="module-content-tab-row no-pad-0">
              <label className="setting-label-main">
                {canUseColorSwatchFeatures(resolvedPostType)
                  ? "Show Icon / Color Swatch"
                  : "Show Icon"}
              </label>
              <div className="module-content-tab-row caf-design-two-half">
              <SwitchMain
                label="Enable"
                property="show_icon"
                onSettingChange={(data) => {
                  changeInitialDataOptChnage(
                    applyFreeColorSwatchOnEnable(data, resolvedPostType)
                  );
                }}
                data={settingData}
                currValue={
                  canUseFilterShowIconOrColorSwatch(resolvedPostType)
                    ? settingData?.show_icon
                    : "false"
                }
              />
              </div>
              {canUseFilterShowIconOrColorSwatch(resolvedPostType) &&
                settingData?.show_icon === "true" &&
                canUseColorSwatchFeatures(resolvedPostType) && (
                <>
                  <SelectMain
                    label="Display As"
                    property="term_visual"
                    classn="caf-design-two-half"
                    options={getFilterTermVisualDisplayOptions()}
                    onSettingChange={(data) => {
                      if (
                        !canUseFilterShowIcon() &&
                        data?.term_visual !== TERM_VISUAL_COLOR
                      ) {
                        changeInitialData({
                          ...data,
                          term_visual: TERM_VISUAL_COLOR,
                        });
                        return;
                      }
                      changeInitialData(data);
                    }}
                    data={{
                      ...settingData,
                      post_type: resolvedPostType,
                      term_visual: canUseFilterShowIcon()
                        ? resolveTermVisual({
                            ...settingData,
                            post_type: resolvedPostType,
                          })
                        : TERM_VISUAL_COLOR,
                    }}
                  />
                  {isTermVisualColor({
                    ...settingData,
                    post_type: resolvedPostType,
                    term_visual: canUseFilterShowIcon()
                      ? settingData?.term_visual
                      : TERM_VISUAL_COLOR,
                  }) && (
                    <div className="module-content-tab-row caf-design-two-half">
                      <Tooltip
                        classNames={{ root: "caf-builder-tooltip" }}
                        placement="topLeft"
                        title="Choose how the term label appears with the color swatch."
                      >
                        <label>Label</label>
                      </Tooltip>
                      <div className="hoverswitchguard">
                        <Segmented
                          value={resolveTermLabelDisplay(settingData)}
                          style={{ marginBottom: 10 }}
                          onChange={(value) => {
                            changeInitialDataOptChnage(
                              applyTermLabelDisplay({ ...settingData }, value)
                            );
                          }}
                          className={"hoverTabCaf"}
                          options={[
                            { label: "Show", value: "show" },
                            { label: "Hide", value: "hide" },
                            { label: "Tooltip", value: "tooltip" },
                          ]}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              <hr className="setting-hr-main"></hr>
            </div>
            </FilterShowIconLockedSection>
            {effectiveDataSource === "taxonomy" && (
              <>
                <div className="module-content-tab-row no-pad-0">
                  <label className="setting-label-main">Show Count</label>
                  <div className="module-content-tab-row caf-design-two-half">
                  <SwitchMain
                    label="Enable"
                    property="show_count"
                    onSettingChange={changeInitialDataOptChnage}
                    data={settingData}
                    currValue={settingData?.show_count}
                  />
                  </div>
                </div>
                <div className="module-content-tab-row no-pad-0">
                  {settingData?.show_count === 'true' && (
                    <>
                      <SelectMain
                        label="Separator"
                        property="count_separator"
                        classn="caf-design-two-half"
                        options={[
                          {
                            value: "brackets",
                            label: "(Brackets)",
                          },
                          {
                            value: "hyphen",
                            label: "Hyphen - ",
                          },
                          {
                            value: "none",
                            label: "None",
                          },
                          {
                            value: "custom",
                            label: "Custom",
                          }
                        ]}
                        onSettingChange={changeInitialData}
                        data={settingData}
                        defaultValue={settingData?.count_separator ?? "none"}
                      />
                      {settingData?.count_separator === 'custom' && (
                        <>
                          {/* Prefix */}
                          <div className="module-content-tab-row caf-design-two-half">
                            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set count prefix text.">
                              <label>Prefix</label>
                            </Tooltip>
                            <input
                              type="text"
                              value={settingData?.count_prefix || ''}
                              placeholder="e.g. ("
                              onChange={(e) => {
                                changeInitialData({
                                  ...settingData,
                                  count_prefix: e.target.value,
                                });
                              }}
                            />
                          </div>

                          {/* Suffix */}
                          <div className="module-content-tab-row caf-design-two-half">
                            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set count suffix text.">
                              <label>Suffix</label>
                            </Tooltip>
                            <input
                              type="text"
                              value={settingData?.count_suffix || ''}
                              placeholder="e.g. )"
                              onChange={(e) => {
                                changeInitialData({
                                  ...settingData,
                                  count_suffix: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </>
                      )}


                    </>
                  )}
                  <hr className="setting-hr-main"></hr>
                </div>
              </>
            )}
            <FilterTermShowMoreLockedSection>
              <FilterTermShowMoreProPanel
                settingData={settingData}
                onSettingChange={changeInitialDataOptChnage}
              />
            </FilterTermShowMoreLockedSection>
            
            <div className="module-content-tab-row no-pad-0">
              <label className="setting-label-main">Filter Label</label>
              <div className="module-content-tab-row caf-design-two-half">
              <SwitchMain
                label="Enable"
                property="label"
                property2="is_label"
                onSettingChange={changeInitialData}
                data={settingData}
                currValue={settingData.label.is_label}
              />
              </div>
              {checkLabel && (
                <>
                <div className="caf-filter-label-inner-row">
                   <div className="module-content-tab-row caf-design-two-half">
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set filter label text.">
                      <label>Label Text</label>
                    </Tooltip>
                    <Input
                      onChange={(e) => handleLabel(e.target.value)}
                      value={labelInput}
                    />
                  </div>
                  {iconsArray && (
                    <FilterLabelShowIconLockedSection className="module-content-tab-row caf-builder-show-label-icon">
                      <FilterLabelShowIconProPanel
                        data={props.data}
                        indexes={props.indexes}
                        iconsArray={iconsArray}
                        onSettingChange={props.onSettingChange}
                        enabled={canUseLabelShowIcon() && labelIconSwitch}
                        onToggle={onLabelIconSwitch}
                        label="Show Icons"
                      />
                    </FilterLabelShowIconLockedSection>
                  )}
                </div>
            <FilterLabelCollapseLockedSection>
                    <FilterLabelCollapseProPanel
                      settingData={settingData}
                      onSettingChange={changeInitialData}
                      enabled={canUseFilterLabelCollapse() && toggle.enable}
                    />
                  </FilterLabelCollapseLockedSection>
                </>
              )}

               {/* <hr className="setting-hr-main"></hr> */}
              </div>
             
            </>
            {/* {dataSource == "taxonomy" && (
            <>
             {settingData.multiple_term == "true" && (
              <SelectMain
                label="Select Category Relation"
                property="category_relation"
                options={[
                  {
                    label: "OR",
                    value: "OR",
                  },
                  {
                    label: "AND",
                    value: "AND",
                  },
                ]}
                onSettingChange={changeInitialData}
                data={settingData}
              />
             )}
            </>
          )} */}
            {canUseFilterCustomField() && effectiveDataSource === "custom_field" && (
              <>
                {/* <SelectMain
              label="Select Meta Relation"
              property="meta_relation"
              options={[
                {
                  label: "IN",
                  value: "IN",
                },
                {
                  label: "NOT IN",
                  value: "NOT IN",
                },
                {
                  label: "AND",
                  value: "AND",
                },
                {
                  label: "EXISTS",
                  value: "EXISTS",
                },
                {
                  label: "NOT EXISTS",
                  value: "NOT EXISTS",
                },
              ]}
              onSettingChange={changeInitialData}
              data={settingData}
            /> */}
              </>
            )}
            {/* <div className="module-content-tab-row no-pad-0">
            <label className="setting-label-main">Toggle</label>
            <div className="module-content-tab-row caf-design-two-half">
            <SwitchMain
              label="Enable"
              property="enable_toggle"
              onSettingChange={changeInitialData}
              data={settingData}
              currValue={settingData.enable_toggle}
            />
            </div>
            {toggle.enable && (
              <div className="module-content-tab-row caf-design-two-half">
              <SwitchMain
                label="Default Toggle Collapse"
                property="close_toggle"
                onSettingChange={changeInitialData}
                data={settingData}
                currValue={settingData.close_toggle}
              />
              </div>
            )}

            </div> */}
            {/* taxonomy */}
            <FilterTermIconSettingsModal
              title={termDetail[3]}
              open={termSettingPopUp}
              onSave={handleTermSettingSave}
              onCancel={handleTermSettingCancel}
              saveDisabled={!termDetail[5]}
              termSelected={termDetail[5]}
              iconsArray={iconsArray}
              data={props.data}
              indexes={props.indexes}
              onSettingChange={props.onSettingChange}
              termDetail={termDetail}
              contentIconDetail={contentIconDetail}
              setcontentIconDetail={setcontentIconDetail}
              iconSwitch={iconSwitch}
              setIconSwitch={setIconSwitch}
              selectedIcon={selectedIcon}
              setSelectedIcon={setSelectedIcon}
              checkError={checkError}
              showAddAsParentSwitch={
                termDetail[4] && canShowAddAsParentSwitch()
              }
              isParent={isParent}
              onToggleParent={handleIsParent}
              destroyOnHidden
              className="caf-dropdown-filter-term-setting-modal caf-builder-modal"
            />
            {/* Custom Field — label */}

          <Modal
            title={labelValueCf || keyValueCf || "Edit Value"}
            open={termSettingPopUpCusFieldLabel}
            onOk={handleSaveCustomFieldLabel}
            onCancel={handleCancelCustomFieldLabel}
            className="caf-dropdown-filter-cf-label-modal caf-builder-modal"
            footer={[
              <Button key="back" onClick={handleCancelCustomFieldLabel}>
                Cancel
              </Button>,
              <Button key="save" type="primary" onClick={handleSaveCustomFieldLabel}>
                Save
              </Button>,
            ]}
          >
            <div className="module-content-tab-row">
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enter option key value.">
                <label>Key</label>
              </Tooltip>
              <Input
                onChange={(e) => setKeyValueCf(e.target.value)}
                value={keyValueCf}
                disabled={true}
              />
            </div>
            <div className="module-content-tab-row">
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enter option label text.">
                <label>Label</label>
              </Tooltip>
              <Input
                onChange={(e) => setLabelValueCf(e.target.value)}
                value={labelValueCf}
              />
            </div>
            {checkError && (keyValueCf === "" || labelValueCf === "") && (
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Both fields are mandatory.">
                <label style={{ color: "red" }}>Both Key and Label fields are required.</label>
              </Tooltip>
            )}
          </Modal>

          {/* Custom Field — icon */}

          <FilterCfTermIconSettingsModal
            title={labelValueCf || keyValueCf || "Value Icon"}
            open={termSettingPopUpCusFieldIcon}
            onSave={handleSaveCustomFieldIcon}
            onCancel={handleCancelCustomFieldIcon}
            iconsArray={iconsArray}
            data={props.data}
            indexes={props.indexes}
            onSettingChange={props.onSettingChange}
            contentIconDetail={contentIconDetailCusField}
            setcontentIconDetail={setcontentIconDetailCusField}
            iconSwitch={iconSwitchCusField}
            setIconSwitch={setIconSwitchCusField}
            selectedIcon={selectedIconCusField}
            setSelectedIcon={setSelectedIconCusField}
            destroyOnHidden
            className="caf-dropdown-filter-cf-icon-modal caf-builder-modal"
          />
                {/* All Option*/}
            {/* <Modal
              title="All Option"
              open={allOptModal}
              onOk={handleSaveAllOption}
              onCancel={handleCancelAllOption}
              footer={[
                <Button key="back" onClick={handleCancelAllOption}>
                  Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSaveAllOption}>
                  Save
                </Button>,
              ]}
            >
             <div className="module-content-tab-row">
                {settingData?.dropdown_data?.all_option?.is_enable ==="true" ? (
                  <>
                    <div className="module-content-tab-row">
                      <label>Enter All Option Label</label>
                      <Input
                        onChange={(e) => handleAllOptionInput(e.target.value)}
                        value={allOptionInput}
                      />
                    </div>
                    {iconsArray && (
                      <div className="module-content-tab-row">
                        <div class="module-content-tab-row caf-design-two-half">
                          <label>Icon</label>
                          <div className="module-content-icon-switch">
                              <Switch onChange={onAllIconSwitch} checked={allIconSwitch} />
                          </div>
                        </div>
                        {allIconSwitch &&
                        <ContentIcons1
                        title="Icons"
                        data={props.data}
                        indexes={props.indexes}
                        iconsArray={iconsArray}
                        onSettingChange={props.onSettingChange}
                        tab="all_option"
                        type=""
                        allOptArray={allOptArray}
                        setAllOptArray={setAllOptArray}
                       ></ContentIcons1>
                      }
                      </div>
                    )}
                  </>
                ) : (
                  <label style={{ color: "red" }}>
                    Ooops! ⚠ you didn't Enable this option, please Enable it First
                  </label>
                )}
              </div>
                
            </Modal> */}

          </>
          ) : (
          <Skeleton active />
      )}
        </>
      );
});

      export default DropdownFilter1;
