import React, { useState, useEffect, useLayoutEffect, memo, useRef, useMemo } from "react";
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
import { EditOutlined, ReloadOutlined ,PlusCircleFilled} from "@ant-design/icons";
import LabelIcons from "../ContentComponents/LabelIcons";
import SelectMain from "../ContentComponents/SelectMain";
import SwitchMain from "../ContentComponents/SwitchMain";
import InputMain from "../../../design-components/common-component/InputMain";
import {
  useResolvedMainBuilderData,
  getResolvedFilterPostType,
} from "../useResolvedMainBuilderData";
import {
  createFilterModuleSettingsSnapshot,
  commitFilterModuleTaxonomyData,
  commitFilterModuleSettingsPatch,
  commitFilterModuleReplaceSettings,
} from "../filterSettingsSnapshot";
import { canShowAddAsParentSwitch } from "../../../../utils/filterBuilderUiFlags";
import { usePostTypeCustomFieldOptions } from "../../../../../utils/usePostTypeCustomFieldOptions";
import {
  ensureWooPriceFieldRow,
  ensureWooDimensionFieldRow,
  isWooPriceMetaKey,
  isWooDimensionMetaKey,
  isWooAllowlistedRangeMetaKey,
  resolveRangeSliderMetaKey,
  WOO_PRICE_META_KEY,
  WOO_DIMENSION_META_OPTIONS,
} from "../../../woocommerce/wooPriceSlider";
import {
  FilterLabelCollapseLockedSection,
  FilterLabelShowIconLockedSection,
  canUseFilterLabelCollapse,
  canUseLabelShowIcon,
  canUseRangeSliderCustomFields,
  resolveFilterLabelCollapseToggleState,
} from "../shared/filterModuleTier";
import { useRangeFieldSelectOptions } from "./rangeSliderFieldOptions";
import FilterTermIconSettingsModal from "../shared/FilterTermIconSettingsModal";
import FilterCfTermIconSettingsModal from "../shared/FilterCfTermIconSettingsModal";
import FilterLabelShowIconProPanel from "../shared/FilterLabelShowIconProPanel";

const normalizeCustomFieldData = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};
const getDefaultCustomFieldRow = () => ({
  custom_field_key: "0",
  custom_field_value_list: [],
  compare_operator: "=",
  meta_type: "CHAR",
});
const rangeTypeOptions = [
  { label: "Single", value: "single" },
  { label: "Double", value: "double" },
];
const rangePlacementOptions = [
  { label: "Horizontal", value: "horizontal" },
  { label: "Vertical", value: "vertical" },
];
const RANGE_TEXT_DEFAULTS = {
  prefix: "Prefix",
  suffix: "Suffix",
};
const getDefaultRangeTextValue = (type) =>
  RANGE_TEXT_DEFAULTS[type] || "Value";
const normalizeRangeTextValue = (type, value) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : getDefaultRangeTextValue(type);
};

/** Legacy layouts omit `default_values`; treat as custom defaults on (previous behavior). */
const rangeSliderCustomDefaultsEnabled = (range) => {
  const dv = range?.default_values;
  if (!dv || typeof dv !== "object") return true;
  if (dv.is_enable === undefined || dv.is_enable === null) return true;
  return dv.is_enable === "true";
};

/** Keep range bounds and default handles consistent (min ≤ max; double defaults within span and start_min ≤ start_max). */
const normalizeRangeSliderSettings = (range, changedKey) => {
  const out = { ...range };
  const sliderType = out.type === "single" ? "single" : "double";
  const readNum = (v) => {
    if (v === "" || v === undefined || v === null) return NaN;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  let minNum = readNum(out.min);
  let maxNum = readNum(out.max);
  const defaultsOn = rangeSliderCustomDefaultsEnabled(out);

  if (Number.isFinite(minNum) && Number.isFinite(maxNum)) {
    if (minNum > maxNum) {
      // While typing min or max, min may briefly exceed max (or vice versa). Do not rewrite the
      // other bound on each keystroke — that breaks multi-digit entry (e.g. max "5" would pull min down to 5).
      if (changedKey !== "min" && changedKey !== "max") {
        const lo = Math.min(minNum, maxNum);
        const hi = Math.max(minNum, maxNum);
        out.min = lo;
        out.max = hi;
        minNum = lo;
        maxNum = hi;
      }
    }

    const boundsOrdered = minNum <= maxNum;
    if (boundsOrdered && defaultsOn) {
      const lower = minNum;
      const upper = maxNum;

      if (sliderType === "double") {
        if (out.start_min !== "" && Number.isFinite(Number(out.start_min))) {
          out.start_min = Math.max(lower, Math.min(Number(out.start_min), upper));
        }
        if (out.start_max !== "" && Number.isFinite(Number(out.start_max))) {
          out.start_max = Math.max(lower, Math.min(Number(out.start_max), upper));
        }
        if (
          out.start_min !== "" &&
          out.start_max !== "" &&
          Number.isFinite(Number(out.start_min)) &&
          Number.isFinite(Number(out.start_max))
        ) {
          const sm = Number(out.start_min);
          const sx = Number(out.start_max);
          if (sx < sm) {
            if (changedKey === "start_max") {
              out.start_max = sm;
            } else if (changedKey === "start_min") {
              out.start_max = sm;
            } else {
              out.start_max = sm;
            }
          }
        }
      } else if (out.start_max !== "" && Number.isFinite(Number(out.start_max))) {
        out.start_max = Math.max(lower, Math.min(Number(out.start_max), upper));
      }
    }
  }

  ["prefix", "suffix"].forEach((type) => {
    const textConfig = out?.[type];
    if (!textConfig || typeof textConfig !== "object") return;
    if (textConfig.is_enable === "true") {
      out[type] = {
        ...textConfig,
        value: normalizeRangeTextValue(type, textConfig.value),
      };
    }
  });

  return out;
};

const RangeSliderFilter = memo((props) => {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const mainBuilderData = useResolvedMainBuilderData(props.mainBuilderData);
  let items = [...props.data];
  let settingData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.settings,
  };
  let styleData = {
    ...items[rowindex]?.data[columnindex]?.data[moduleindex]?.style,
  };
  let selectedDevice = props.selectedDevice;

  const resolvedPostType = getResolvedFilterPostType(
    mainBuilderData,
    settingData?.post_type
  );
  const { options: customFieldOptions } = usePostTypeCustomFieldOptions({
    postType: resolvedPostType,
    includeValue: resolveRangeSliderMetaKey(settingData),
    placeholderLabel: "Select Field",
  });

  const rangeFieldSelectOptions = useRangeFieldSelectOptions({
    customFieldOptions,
    resolvedPostType,
    includeValue: resolveRangeSliderMetaKey(settingData),
  });

  const rangeDefaultNormalizeTimerRef = useRef(null);
  const latestLayoutItemsRef = useRef(props.data);
  useLayoutEffect(() => {
    latestLayoutItemsRef.current = props.data;
  }, [props.data]);
  useEffect(
    () => () => {
      if (rangeDefaultNormalizeTimerRef.current) {
        clearTimeout(rangeDefaultNormalizeTimerRef.current);
        rangeDefaultNormalizeTimerRef.current = null;
      }
    },
    []
  );

  // Free: only WooCommerce `_price` — force field when custom fields are locked.
  useEffect(() => {
    if (canUseRangeSliderCustomFields()) {
      return;
    }
    if (resolvedPostType !== "product") {
      return;
    }
    const currentKey = resolveRangeSliderMetaKey(settingData);
    if (isWooPriceMetaKey(currentKey)) {
      return;
    }
    commitFilterModuleSettingsPatch({
      data: latestLayoutItemsRef.current,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (settings) => {
        settings.data_source = "custom_field";
        const rows = normalizeCustomFieldData(settings.custom_field_data);
        const first = rows[0] || getDefaultCustomFieldRow();
        settings.custom_field_data = [
          ensureWooPriceFieldRow({
            ...first,
            custom_field_key: WOO_PRICE_META_KEY,
          }),
        ];
      },
    });
  }, [
    resolvedPostType,
    rowindex,
    columnindex,
    moduleindex,
    props.onSettingChange,
  ]);

  const [postType, setPostType] = useState(
    resolvedPostType
  );

  const [taxonomyList, setTaxonomyList] = useState([]);
  //   const [filterType, setFilterType] = useState(settingData.filter_type);
  const [dataSource, setDataSource] = useState("custom_field");
  const [termSettingPopUp, setTermSettingPopUp] = useState(false);
  const [termSettingPopUpCusField, setTermSettingPopUpCusField] =
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
    type:'icon'
  });
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
  const [checkLabel, setCheckLabel] = useState(
    settingData.label.is_label === "false" ? false : true
  );
  const [labelInput, setLabelInput] = useState(settingData.label.value);
  const [toggle, setToggle] = useState(() =>
    resolveFilterLabelCollapseToggleState(settingData)
  );
  // const [allOptionInput, setAllOptionInput] = useState(
  //   settingData.dropdown_data.all_option.value
  // );
  const [customFieldKey, setCustomFieldKey] = useState(
    settingData?.custom_field_data?.custom_field_key ||
      (Array.isArray(settingData?.custom_field_data)
        ? settingData.custom_field_data?.[0]?.custom_field_key
        : "")
  );
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [customFieldArray, setCustomFieldArray] = useState(
    normalizeCustomFieldData(settingData.custom_field_data)
  );
  const [openCfRows, setOpenCfRows] = useState({});
  const [openCfAdv, setOpenCfAdv] = useState({});
  const [compareOperator, setCompareOperator] = useState(
    settingData?.custom_field_data?.compare_operator ||
      (Array.isArray(settingData?.custom_field_data)
        ? settingData.custom_field_data?.[0]?.compare_operator
        : "=")
  );

  const [keyValueCf, setKeyValueCf] = useState("");
  const [labelValueCf, setLabelValueCf] = useState("");

  const [taxonomyListArray, setTaxonomyListArray] = useState([]);
  const [firstRender, setFirstRender] = useState(true);
  const [expandedTaxoItems, setExpandedTaxoItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);

  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";

  useEffect(()=>{
    setTaxonomyList(settingData?.taxonomy_data)
  },[settingData?.taxonomy_data])

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
  //     func();
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

  useEffect(() => {
    // Range slider settings should always use custom-field flow.
    setDataSource("custom_field");
  }, [settingData.data_source]);


  useEffect(() => {
    const normalizedCustomFields = normalizeCustomFieldData(
      settingData?.custom_field_data
    );
    if (normalizedCustomFields.length === 0) {
      const fallbackRows = [getDefaultCustomFieldRow()];
      setCustomFieldArray(fallbackRows);
      setCompareOperator("=");
      setCustomFieldKey("0");
      setOpenCfRows({});
      setOpenCfAdv({});
      commitFilterModuleSettingsPatch({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange: props.onSettingChange,
        patch: (s) => {
          s.custom_field_data = fallbackRows;
          s.data_source = "custom_field";
        },
      });
      return;
    }

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
    setOpenCfRows({});
    setOpenCfAdv({});
  }, [settingData.custom_field_data]);

  useEffect(() => {
    setCheckError(false);
  }, [iconSwitch, iconSwitchCusField]);

  // useEffect(() => {
  //   if (settingData?.label?.icons?.icon == "") {
  //     settingData.label.icons = {};
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //       settingData;
  //     props.onSettingChange(props.data);
  //   }
  // }, [checkLabel]);

  useEffect(() => {
    let icons = {};
    if (termDetail?.length > 0) {
      if (termDetail[6] && termDetail[6]?.predefine === "true") {
        setTermPredefined(true);
      } else {
        setTermPredefined(false);
      }
      if (termDetail[6]?.is_parent === "true") {
        setIsParent(true);
      } else {
        setIsParent(false);
      }
      icons = termDetail[6]?.icons;
      setIconSwitch(icons?.icon ? true : false);
      if (icons && Object?.keys(icons).length !== 0) {
        let data = contentIconDetail;
        data.icon = icons.icon;
        data.position = icons.position;
        data.iconChecked = true;
        data.type=icons.type;
        setcontentIconDetail(data);
      }
      if(icons?.type==='icon') {
      setSelectedIcon(icons?.icon ? icons.icon : "");
      }
      else {
        setSelectedIcon(icons?.icon?.icon?.url ? icons.icon.icon.url : "");
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

  //   const onChange = (e) => {
  //     let items = [...props.data];
  //     let item = {
  //       ...items[rowindex].data[columnindex].data[moduleindex].settings,
  //     };
  //     let value = e.target.value;
  //     if (item.taxonomy_data) {
  //       if (item.post_type != postType && item.taxonomy_data.length > 0) {
  //         item.taxonomy_data = [];
  //       }
  //       const isValuePresent = item.taxonomy_data?.some((obj) =>
  //         Object.values(obj).includes(value)
  //       );
  //       if (isValuePresent) {
  //         item.taxonomy_data = item.taxonomy_data.filter(
  //           (element) => element.key !== value
  //         );
  //       } else {
  //         let itemData = { key: value, term_data: [] };
  //         item.taxonomy_data.push(itemData);
  //         item.post_type = postType;
  //       }
  //     } else {
  //       let itemData = { key: value, term_data: [] };
  //       item.taxonomy_data.push(itemData);
  //     }
  //     items[rowindex].data[columnindex].data[moduleindex].settings = item;
  //     props.onSettingChange(props.data);
  //     setTimeout(() => {
  //       func();
  //     }, 500);
  //     TermChecked();
  //   };

  useEffect(() => {
    setCustomFieldKey(resolveRangeSliderMetaKey(settingData) || "0");
  }, [settingData?.custom_field_data, resolvedPostType]);

  const checkboxSkin = [
    {
      label: "Checkbox Skin 1",
      value: "checkbox_skin1",
    },
    {
      label: "Checkbox Skin 2",
      value: "checkbox_skin2",
    },
  ];
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
      type:'icon'
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

      const isValuePresent = settingsRef.predefined_terms?.includes(termDetail[2]);
      if (termPredefined === true && !isValuePresent) {
        settingsRef.predefined_terms.push(termDetail[2]);
      } else if (settingsRef.predefined_terms && termPredefined === false) {
        let indexToRemove = settingsRef.predefined_terms.indexOf(termDetail[2]);
        if (indexToRemove !== -1) {
          settingsRef.predefined_terms.splice(indexToRemove, 1);
        }
      }

      // ✅ find and update the taxonomy inside settingData
      newtaxonomyData = newtaxonomyData.map((data) => {
        if (data.key !== termDetail[1]) return data;
        let termData = [...data.term_data];
        let childObjIds = [];
        let allChildObjects = [];
        // ✅ handle parent logic
        if (isParent) {
          const txoArray = taxonomyListArray.find((d) => d.key === termDetail[1]);
          if (txoArray) {
            let taxoTermData = [...txoArray.term_data];
            const parentTerm = taxoTermData.find((t) => t.id === termDetail[0]);
            if (parentTerm) {
              const collectChildrenRecursive = (children, topParentId) => {
                if (!Array.isArray(children)) return;
                children.forEach((child) => {
                  //let termIsPresent = termData.some((term) => term.key === child?.id);
                  // helper function to recursively find term by key
                  const findNestedTermByKey = (terms, key) => {
                    for (const term of terms) {
                      if (term.key === key) {
                        return term;
                      }
                      if (Array.isArray(term.children_data) && term.children_data.length > 0) {
                        const found = findNestedTermByKey(term.children_data, key);
                        if (found) return found;
                      }
                    }
                    return null;
                  };
                  const savedTerm = findNestedTermByKey(termData, child?.id);
                  const termIsPresent = !!savedTerm;

                  if (termIsPresent) {
                    //let savedTerm = termData.find((term) => term.key === child?.id);
                    const childCopy = {
                      key: child?.id,
                      value: child?.name,
                      predefine: savedTerm.predefine,
                      icons: savedTerm.icons,
                      parent_id: topParentId,
                      children_data: [],
                      children: "false",
                      count: child?.count
                    };
                    allChildObjects.push(childCopy);
                    childObjIds.push(child.id);
                  }
                  // else{
                  //     const childCopy = {
                  //     key: child?.id,
                  //     value: child?.name,
                  //     predefine: 'false',
                  //     icons: {},
                  //     parent_id: topParentId,
                  //     children_data: [],
                  //     children: "false",
                  //   };
                  //   allChildObjects.push(childCopy);
                  //   childObjIds.push(child.id);
                  // }

                  if (Array.isArray(child.children_data) && child.children_data.length > 0) {
                    collectChildrenRecursive(child.children_data, topParentId);
                  }
                });
              };

              if (Array.isArray(parentTerm.children_data) && parentTerm.children_data.length > 0) {
                collectChildrenRecursive(parentTerm.children_data, termDetail[0]);
              }
              // 🧹 remove nested children from top-level termData
              termData = termData.filter((term) => !childObjIds.includes(term.key));
              // return
            }
          }
        } else {
          const parentTerm = termData.find((t) => t.key === termDetail[0]);
          //  return
          if (parentTerm && Array.isArray(parentTerm.children_data) && parentTerm.children_data.length > 0) {

            // ✅ Step 1: copy all children
            allChildObjects = parentTerm.children_data;

            // ✅ Step 2: empty children_data from parentTerm
            parentTerm.children_data = [];

            // ✅ Step 3: update termData (remove old parentTerm and reinsert updated one)
            termData = termData.map((term) =>
              term.id === parentTerm.id ? { ...term, children_data: [] } : term
            );

            // ✅ Step 4: push all children into termData
            termData = [...termData, ...allChildObjects];

          }
        }
        // ✅ update parent object
        const hasMatchingChild = (children = []) => {
          return children.some(
            (child) =>
              child.key === termDetail[0] ||
              (Array.isArray(child.children_data) && hasMatchingChild(child.children_data))
          );
        };

        // return 
        const updatedTermData = termData.map((obj) => {
          if (obj.key === termDetail[0]) {
            obj.predefine = termPredefined ? "true" : "false";
            if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
              obj.icons = {
                icon: contentIconDetail.icon,
                position: contentIconDetail.position,
                type: contentIconDetail?.type
              };
            } else {
              obj.icons = {};
            }

            if (isParent) {
              obj.children_data = [...allChildObjects];
              obj.is_parent = "true";
            } else {
              obj.is_parent = "false";
            }
          } else {
            updateNestedTerm(
              obj.children_data,
              termDetail,
              termPredefined,
              contentIconDetail,
              isParent,
              allChildObjects
            );
          }
          return obj;
        });

        // ✅ return updated taxonomy data object
        return { ...data, term_data: updatedTermData };
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

      // ✅ Reset form states
      setTermSettingPopUp(false);
      setTermPredefined(false);
      setCheckError(false);
      setcontentIconDetail({
        icon: "",
        position: "before",
        iconChecked: false,
        type:'icon'
      });
      setTermDetail([null]);
    }
  };
  const updateNestedTerm = (children, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects) => {
    if (!Array.isArray(children)) return;

    children.forEach((child) => {
      if (child.key === termDetail[0]) {
        // ✅ same logic as main update
        child.predefine = termPredefined ? "true" : "false";

        if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
          child.icons = {
            icon: contentIconDetail.icon,
            position: contentIconDetail.position,
          };
        } else {
          child.icons = {};
        }

        if (isParent) {
          child.children_data = [...allChildObjects];
          child.is_parent = "true";
        } else {
          child.is_parent = "false";
        }
      } else if (Array.isArray(child.children_data) && child.children_data.length > 0) {
        // 🔁 recursive call for deeper nested children
        updateNestedTerm(child.children_data, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects);
      }
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

  const removeParentChild = () => {
    settingData?.taxonomy_data.map((data, index) => {
      if (data.term_data?.length > 0) {
        data.term_data.map((item) => {
          if (item.children_data?.length > 0) {
            data.term_data.push(...item.children_data);
            item.children_data = [];
            item.is_parent = "false";
          }
        });
      }
    });
    setLoadingCatogries(false);
    setTimeout(() => {
      setLoadingCatogries(true);
    }, 400);
  };
  const handleEdit = () => {
    props.openBuilderSetting(true);
  };

  const changeInitialData = (data) => {
    setDataSource(data.data_source);
    if (data.data_source !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label === "false" ? false : true);
    if (data.label.is_label === "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }

    setToggle((prev) => ({
      ...prev,
      enable: data.enable_toggle === "false" ? false : true,
    }));
    if (data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle((prev) => ({
        ...prev,
        close: false,
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);
    commitFilterModuleReplaceSettings({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings: data,
    });
  };

  const changeInitialDataOptChange = (data) => {
    setDataSource(data.data_source);
    if (data.data_source !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    setCheckLabel(data.label.is_label === "false" ? false : true);
    if (data.label.is_label === "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }

    setToggle((prev) => ({
      ...prev,
      enable: data.enable_toggle === "false" ? false : true,
    }));
    if (data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle((prev) => ({
        ...prev,
        close: false,
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);

    styleData.meta1[selectedDevice].default.justifyContent = "flex-start";
    styleData.meta1[selectedDevice].default.alignItems = "flex-start";
    styleData.meta2[selectedDevice].default.justifyContent = "flex-start";
    styleData.meta2[selectedDevice].default.alignItems = "flex-start";
    styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
    styleData.meta3[selectedDevice].default.alignItems = "flex-start";

    items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
    props.onSettingChange(items);

    commitFilterModuleReplaceSettings({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings: data,
    });
  };

  // const changeInitialDataIconOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source !== settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label === "false" ? false : true);
  //   if (data.label.is_label === "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle === "false" ? false : true,
  //   }));
  //   if (data.enable_toggle === "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);
    
  //   styleData.meta2[selectedDevice].default.justifyContent = "flex-start";
  //   styleData.meta2[selectedDevice].default.alignItems = "flex-start";

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

  // const changeInitialDataCountOpt = (data) => {
  //   setDataSource(data.data_source);
  //   if (data.data_source !== settingData.data_source) {
  //     setLoadingCatogries(false);
  //     setTimeout(() => {
  //       setLoadingCatogries(true);
  //     }, 400);
  //   }
  //   setCheckLabel(data.label.is_label === "false" ? false : true);
  //   if (data.label.is_label === "false") {
  //     if (data?.icons) {
  //       data.icons = {};
  //     }
  //   }

  //   setToggle((prev) => ({
  //     ...prev,
  //     enable: data.enable_toggle === "false" ? false : true,
  //   }));
  //   if (data.enable_toggle === "false") {
  //     data.close_toggle = "false";
  //     setToggle((prev) => ({
  //       ...prev,
  //       close: false,
  //     }));
  //   }
  //   setCompareOperator(data?.custom_field_data?.compare_operator);

  //   styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
  //   styleData.meta3[selectedDevice].default.alignItems = "flex-start";

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

    const changeDataSource = (value) => {
    setDataSource(value);
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
        if (value === "custom_field") {
          s.show_count = "false";
        }
        s.data_source = value;
      },
    });
  };


  const customFieldKeyFunc = (value, customField ,index) => {
    if (
      customField === "key" &&
      !canUseRangeSliderCustomFields() &&
      !isWooPriceMetaKey(value) &&
      value !== "0"
    ) {
      return;
    }
    let updateData = [];
    if (customField === "key") {
      updateData = customFieldArray.map((item, id) => {
        if (id === index) {
          if (isWooPriceMetaKey(value)) {
            return ensureWooPriceFieldRow({ ...item, custom_field_key: value });
          }
          if (isWooDimensionMetaKey(value)) {
            return ensureWooDimensionFieldRow(
              { ...item, custom_field_key: value },
              value
            );
          }
          return { ...item, custom_field_key: value };
        }
        return item;

      });
      
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
              icons: {
                icon:"",
                type:"icon",
                position:"before",
                iconChecked:true,

              },
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
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field_data = updateData;
        // Switching Woo price/dimension field re-seeds catalog bounds.
        if (
          customField === "key" &&
          isWooAllowlistedRangeMetaKey(value)
        ) {
          s.range_slider = {
            ...(s.range_slider || {}),
            bounds_manual: "false",
          };
        }
      },
    });
  };

  const customFieldValueSetting = (cfIndex,valueIndex,valueData) => {
    setCurrCustomFieldValue([cfIndex,valueIndex,valueData]);
    setTimeout(() => {
      setTermSettingPopUpCusField(true);
    }, 500);
  };
  const handleSaveCustomField = () => {
    if (keyValueCf === "" || labelValueCf === "") {
      setCheckError(true);
      return false;
    }

        let updateData = customFieldArray?.map((item, id) => {

          if (id === currCustomFieldValue[0]) {

            return {
              ...item,
              custom_field_value_list: item?.custom_field_value_list?.map((value, vid) => {

                if (vid === currCustomFieldValue[1]) {

                  let updatedValue = {
                    ...value,
                    predefine: termPredefinedCusField ? "true" : "false",
                    key:keyValueCf,
                    label:labelValueCf
                  };
                  updatedValue.icons = {
                      ...(value.icons || {}),
                      icon: contentIconDetailCusField.icon,
                      position: contentIconDetailCusField.position,
                      type: contentIconDetailCusField.type,
                      iconChecked: false,
                    };
                    // for predefine save start
                      if (termPredefinedCusField) {
                            const exists = settingData.cf_predefined_terms?.some(
                              (itemData) =>
                                itemData.key === item?.custom_field_key &&
                                itemData.value === value.key
                          );
                          if (!exists) {
                          settingData.cf_predefined_terms.push({
                            key: item?.custom_field_key,
                            value: value.key,
                          });
                          }
                          else {
                            settingData.cf_predefined_terms = settingData.cf_predefined_terms.filter(
                              (itemData) =>
                                !(
                                  itemData.key === item?.custom_field_key &&
                                  itemData.value === value.key
                                )
                            );

                          }
                      } 

                      // predefine save end
                  return updatedValue;
                }

                return value;
              }),
            };

          }

          return item;

        });
    setcontentIconDetailCusField((prev) => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type:"icon",
    }));
     setTermSettingPopUpCusField(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
    setCheckError(false);

    setCustomFieldArray(updateData);
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
        if (Array.isArray(settingData.cf_predefined_terms)) {
          s.cf_predefined_terms = [...settingData.cf_predefined_terms];
        }
      },
    });
  };
  const handleCancelCustomField = () => {
    setcontentIconDetailCusField((prev) => ({
      ...prev,
      icon: "",
      position: "before",
      iconChecked: false,
      type:"icon",
    }));
    setTermSettingPopUpCusField(false);
    setCurrCustomFieldValue([]);
    setKeyValueCf("");
    setLabelValueCf("");
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
      fetchTaxoData();
    }
  }, [resolvedPostType]);

  //   const getAllTermsRecursive = (termList ,type="parent") => {
  //     let all = [];
  //     if (Array.isArray(termList) && termList.length > 0) {
  //       termList.forEach((term) => {
  //         let childrenExist = "false";
  //         let childrenArray = [];
  //         let is_parent = "false";
  //         let parent_id = null;
  //         if (
  //           Array.isArray(term.children_data) &&
  //           term.children_data.length > 0 && type == "parent"
  //         ) {
  //             childrenExist ="true";
  //         }
  //         all.push({
  //           key: term?.id,
  //           value: term?.name,
  //           predefine: "false",
  //           icons: {},
  //           is_parent: is_parent,
  //           children_data:childrenArray,
  //           children:childrenExist,
  //           parent_id : type == "parent" ? parent_id :parent_id,
  //         });
  //         if (
  //           Array.isArray(term.children_data) &&
  //           term.children_data.length > 0
  //         ) {
  //           all = [...all, ...getAllTermsRecursive(term.children_data,'child',)];
  //         }
  //       });
  //     }
  //     return all;
  //   };

  const getAllTermsRecursive = (termList, type = "parent", rootParentId = null) => {
    let all = [];

    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach((term) => {
        const hasChildren =
          type === "parent" &&
          Array.isArray(term.children_data) &&
          term.children_data.length > 0;

        // Determine if this is a root parent (first level)
        const isRootParent = type === "parent";
        const currentParentId = isRootParent ? term?.id : rootParentId;

        // Push current term
        all.push({
          key: term?.id,
          value: term?.name,
          predefine: "false",
          icons: {},
          is_parent: "false",
          children_data: [], // flattened later
          children: hasChildren ? "true" : "false",
          count: term?.count,
          parent_id: isRootParent ? null : rootParentId, // 🔥 children use top-level parent ID
        });

        // Recursively process children, passing the top-level parent’s ID
        if (Array.isArray(term.children_data) && term.children_data.length > 0) {
          all = [
            ...all,
            ...getAllTermsRecursive(term.children_data, "child", currentParentId),
          ];
        }
      });
    }

    return all;
  };


  // const isAllSelected = (taxonomyKey) => {
  //     const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
  //     const savedTax = settingData.taxonomy_data.find(
  //       (data) => data.key === taxonomyKey
  //     );

  //     if (!taxItem) return false;

  //     const allTerms = getAllTermsRecursive(taxItem.term_data);

  //     if (!savedTax || !savedTax.term_data) return false;

  //     return allTerms.every((term) =>
  //       savedTax.term_data.some((saved) => saved.key === term.key)
  //     );
  //   };

  const isAllSelected = (taxonomyKey) => {
    const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(
      (data) => data.key === taxonomyKey
    );

    if (!taxItem) return false;

    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;

    // 🔍 Helper function to search recursively inside children_data
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

    // ✅ Check if every term is present either at top-level or inside any children
    return allTerms.every((term) => {
      return savedTax.term_data.some((saved) => {
        if (saved.key === term.key) return true;
        if (Array.isArray(saved.children_data) && saved.children_data.length > 0) {
          return searchInChildren(saved.children_data, term.key);
        }
        return false;
      });
    });
  };


  //   const isAnySelected = (taxonomyKey) => {
  //     const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
  //     const savedTax = settingData.taxonomy_data.find(
  //       (data) => data.key === taxonomyKey
  //     );

  //     if (!taxItem) return false;

  //     const allTerms = getAllTermsRecursive(taxItem.term_data);

  //     if (!savedTax || !savedTax.term_data) return false;

  //     // agar ek bhi term.key savedTax.term_data me mil jaye to true return kare
  //     const hasAnyMatch = allTerms.some((term) =>
  //       savedTax.term_data.some((saved) => saved.key === term.key)
  //     );
  //     if (hasAnyMatch) {
  //       return true;
  //     } else {
  //       false;
  //     }
  //   };

  const isAnySelected = (taxonomyKey) => {
    const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
    const savedTax = settingData.taxonomy_data.find(
      (data) => data.key === taxonomyKey
    );

    if (!taxItem) return false;

    const allTerms = getAllTermsRecursive(taxItem.term_data);
    if (!savedTax || !savedTax.term_data) return false;

    // 🔍 Helper: recursive search for a term inside nested children_data
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

    // ✅ If any term exists anywhere (top-level or nested), return true
    return allTerms.some((term) => {
      return savedTax.term_data.some((saved) => {
        if (saved.key === term.key) return true;
        if (Array.isArray(saved.children_data) && saved.children_data.length > 0) {
          return searchInChildren(saved.children_data, term.key);
        }
        return false;
      });
    });
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

  const handleTerm = (e, taxonomy, term, type = "parent", parantTermData = {}) => {
    const { freshItems, settingsRef } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const checked = e.target.checked;
    const taxonomyExists = newtaxonomyData.some(
      (data) => data.key === taxonomy
    );

    let childrenExist = "false";
    let childrenArray = [];
    let is_parent = "false";
    let parent_id = null;
    if (term?.children_data.length > 0 && type == "parent") {
      childrenExist = "true";
    }

    if (checked) {
      if (taxonomyExists) {
        const data = newtaxonomyData.find((d) => d.key === taxonomy);
        const termData = [...data.term_data];
        const parent = termData.find((obj) => obj.key === parantTermData?.id);

        if (type === "child" && Object.keys(parantTermData).length > 0 && parent?.is_parent === "true") {
          parent_id = parent?.key;

          // Find the parent object
          const parantObjIndex = termData.findIndex((obj) => obj.key === parent_id);
          if (parantObjIndex !== -1) {
            const parantObj = { ...termData[parantObjIndex] };
            const parantChildData = [...parantObj.children_data];

            const isChildPresent = parantChildData.some((obj) => obj.key === term?.id);
            if (!isChildPresent) {
              parantChildData.push({
                key: term?.id,
                value: term?.name,
                predefine: "false",
                icons: {},
                is_parent: "false",
                children_data: [],
                children: "false",
                parent_id: parent_id,
                count: term?.count
              });
            }

            parantObj.children_data = parantChildData;
            termData[parantObjIndex] = parantObj;

            const dataIndex = newtaxonomyData.findIndex((d) => d.key === taxonomy);
            if (dataIndex !== -1) {
              newtaxonomyData[dataIndex] = {
                ...newtaxonomyData[dataIndex],
                term_data: termData,
              };
            }
          }
        } else {
          const isValuePresent = termData.some((obj) => obj.key === term?.id);
          if (!isValuePresent) {
            termData.push({
              key: term?.id,
              value: term?.name,
              predefine: "false",
              icons: {},
              is_parent: is_parent,
              children_data: childrenArray,
              children: childrenExist,
              parent_id: parent_id,
              count: term?.count
            });
          }
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
              icons: {},
              is_parent: is_parent,
              children_data: childrenArray,
              children: childrenExist,
              parent_id: parent_id,
              count: term?.count
            },
          ],
        });

      }
    } else {
      if (taxonomyExists) {

        const data = newtaxonomyData.find((d) => d.key === taxonomy);
        if (data) {
          const termData = [...data.term_data];
          const parent = termData.find((obj) => obj.key === parantTermData?.id);

          if (type == "child" && Object.keys(parantTermData).length > 0 && parent?.is_parent == "true") {
            parent_id = parent?.key;

            // Find parent index inside term_data
            const parantObjIndex = data.term_data.findIndex((obj) => obj.key === parent_id);
            if (parantObjIndex !== -1) {
              const parantObj = { ...data.term_data[parantObjIndex] };
              const parantChildData = [...parantObj.children_data];

              // Remove the unchecked child
              parantObj.children_data = parantChildData.filter((obj) => obj.key !== term?.id);

              // ✅ Update the parent object back in term_data
              const updatedTermData = [...data.term_data];
              updatedTermData[parantObjIndex] = parantObj;

              // ✅ Update taxonomy in newtaxonomyData
              const taxonomyIndex = newtaxonomyData.findIndex((tx) => tx.key === taxonomy);
              if (taxonomyIndex !== -1) {
                newtaxonomyData[taxonomyIndex] = {
                  ...newtaxonomyData[taxonomyIndex],
                  term_data: updatedTermData,
                };
              }
            }
          }
          else {
            data.term_data = data.term_data.filter((obj) => obj.key !== term?.id);
            if (data.term_data.length === 0) {
              data.term_data = [];
              newtaxonomyData = newtaxonomyData.filter(
                (tx) => tx.key !== taxonomy
              );
            }
          }
        }
      }
    }

    //updateFilterQueryData("taxonomy_data", newtaxonomyData);
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  //   const handleTermChecked = (taxonomy, term,type="parent",parantTermData={}) => {
  //     const taxo =
  //       Array.isArray(settingData.taxonomy_data) &&
  //       settingData.taxonomy_data?.find((d) => d.key == taxonomy);
  //     if (!taxo || !Array.isArray(taxo.term_data)) return false;

  //     const parent = termData.find((obj) => obj.key === parantTermData?.id);


  //     return taxo.term_data.some((obj) => obj.key == term?.id);
  //   };

  const handleTermChecked = (taxonomy, term, type = "parent", parantTermData = {}) => {
    const taxo =
      Array.isArray(settingData.taxonomy_data) &&
      settingData.taxonomy_data.find((d) => d.key === taxonomy);

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

    // 🔍 Check at both top level and nested children
    for (const obj of taxo.term_data) {
      if (obj.key === term?.id) return true;
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const foundInChildren = searchInChildren(obj.children_data, term?.id);
        if (foundInChildren) return true;
      }
    }

    return false;
  };


  function NestedTerms({
    taxoKey,
    childrenData,
    termData,
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
                    onChange={(e) => handleTerm(e, taxoKey, child, 'child', termData)}
                    checked={handleTermChecked(taxoKey, child, 'child', termData)}
                  />
                  {parse(`${child?.name}`)} {`(${child?.total_count})`}
                </label>
                <i
                  className="fa fa-cog caf-term-setting"
                  aria-hidden="true"
                  onClick={() => handleTermSetting(child, taxoKey, "child", termData)}
                ></i>
                {hasChildren && (
                  <i
                    className={`fa ${isExpanded ? "fa-minus" : "fa-plus"
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
                    termData={termData}
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

    const taxItem = taxonomyListArray.find((item) => item.key === taxonomy);
    if (!taxItem) return;
    const allTerms = getAllTermsRecursive(taxItem.term_data, 'parent');
    const exists = newtaxonomyData.some((data) => data.key === taxonomy);

    if (exists) {
      newtaxonomyData = newtaxonomyData.map((data) => {
        if (data.key === taxonomy) {
          const merged = [...data.term_data, ...allTerms];
          const unique = Array.from(
            new Map(merged.map((item) => [item.key, item])).values()
          );
          return { ...data, term_data: unique };
        }
        return data;
      });
    } else {
      newtaxonomyData.push({
        key: taxonomy,
        term_data: allTerms,
      });
    }

    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  const handleSelectNone = (taxonomy) => {
    const { freshItems, settingsRef } = getFreshSettingsSnapshot();
    let newtaxonomyData = [...settingsRef.taxonomy_data];
    const taxonomyItem = newtaxonomyData.find((data) => data.key === taxonomy);

    if (taxonomyItem) {
      taxonomyItem.term_data = [];
      newtaxonomyData = newtaxonomyData.filter((tx) => tx.key !== taxonomy);
    }
    commitSettingsSnapshot(freshItems, settingsRef, [...newtaxonomyData]);
  };

  const handleTermSetting = (term, taxonomy, type = "parent", parantTermData = {}) => {
    let hasParent = false;
    if (term?.children_data.length > 0 && type == "parent") {
      hasParent = true;
    }
    let term_id = taxonomy + "___" + term?.id;
    let newtaxonomyData = [...settingData.taxonomy_data];
    const taxonomyExists = newtaxonomyData.some(
      (data) => data.key === taxonomy
    );
    // if (taxonomyExists) {
    const data = newtaxonomyData.find((d) => d.key === taxonomy) || {};
    const termData = Array.isArray(data?.term_data) ? [...data.term_data] : [];
    // const currentTerm = termData.some((obj) => obj.key === term?.id)
    const findTermObjRecursive = (data, termId) => {
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
    const termObj = findTermObjRecursive(termData, term?.id) || {};
    setTermDetail([
      term?.id,
      taxonomy,
      term_id,
      term?.name,
      hasParent,
      handleTermChecked(taxonomy, term, type),
      termObj,
    ]);
    setTimeout(()=>{
    setTermSettingPopUp(true);
    },100)
    // }
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
const getCompareLabel = (value) => {
  const match = customFieldCompareOperators?.find(
    (item) => item.value === value
  );
  return match ? match.label : "";
};

  const RANGE_DEFAULT_NORMALIZE_MS = 500;

  function clearRangeDefaultNormalizeDebounce() {
    if (rangeDefaultNormalizeTimerRef.current) {
      clearTimeout(rangeDefaultNormalizeTimerRef.current);
      rangeDefaultNormalizeTimerRef.current = null;
    }
  }

  function flushRangeSliderDefaultNormalize() {
    clearRangeDefaultNormalizeDebounce();
    commitFilterModuleSettingsPatch({
      data: latestLayoutItemsRef.current,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.range_slider = normalizeRangeSliderSettings(s.range_slider || {}, null);
      },
    });
  }

  function scheduleRangeSliderDefaultNormalize() {
    clearRangeDefaultNormalizeDebounce();
    rangeDefaultNormalizeTimerRef.current = setTimeout(() => {
      rangeDefaultNormalizeTimerRef.current = null;
      commitFilterModuleSettingsPatch({
        data: latestLayoutItemsRef.current,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange: props.onSettingChange,
        patch: (s) => {
          s.range_slider = normalizeRangeSliderSettings(s.range_slider || {}, null);
        },
      });
    }, RANGE_DEFAULT_NORMALIZE_MS);
  }

  useEffect(() => {
    if (rangeDefaultNormalizeTimerRef.current) {
      clearTimeout(rangeDefaultNormalizeTimerRef.current);
      rangeDefaultNormalizeTimerRef.current = null;
    }
  }, [rowindex, columnindex, moduleindex]);

  const rangeSettings = {
    min:
      typeof settingData?.range_slider?.min !== "undefined"
        ? settingData?.range_slider?.min
        : "",
    max:
      typeof settingData?.range_slider?.max !== "undefined"
        ? settingData?.range_slider?.max
        : "",
    step:
      typeof settingData?.range_slider?.step !== "undefined"
        ? settingData?.range_slider?.step
        : "",
    start_min:
      typeof settingData?.range_slider?.start_min !== "undefined"
        ? settingData?.range_slider?.start_min
        : "",
    start_max:
      typeof settingData?.range_slider?.start_max !== "undefined"
        ? settingData?.range_slider?.start_max
        : "",
  };
  const handleRangeSettingChange = (key, value) => {
    const parsed = value === "" ? "" : Number(value);
    if (value !== "" && Number.isNaN(parsed)) {
      return;
    }

    if (key === "start_min" || key === "start_max") {
      commitFilterModuleSettingsPatch({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        resolvedPostType,
        onSettingChange: props.onSettingChange,
        patch: (s) => {
          s.range_slider = { ...(s.range_slider || {}), [key]: parsed };
        },
      });
      scheduleRangeSliderDefaultNormalize();
      return;
    }

    clearRangeDefaultNormalizeDebounce();
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        const nextRange = {
          ...(s.range_slider || {}),
          [key]: parsed,
        };
        // User edited track bounds — keep these on frontend (don't re-auto from catalog).
        if (key === "min" || key === "max") {
          nextRange.bounds_manual = "true";
        }
        s.range_slider = normalizeRangeSliderSettings(nextRange, key);
      },
    });
  };

  const rangeTextPrefixRaw = settingData?.range_slider?.prefix || {
    is_enable: "false",
    value: "",
  };
  const rangeTextSuffixRaw = settingData?.range_slider?.suffix || {
    is_enable: "false",
    value: "",
  };
  const rangeTextPrefix = {
    ...rangeTextPrefixRaw,
    value:
      rangeTextPrefixRaw?.is_enable === "true"
        ? normalizeRangeTextValue("prefix", rangeTextPrefixRaw?.value)
        : rangeTextPrefixRaw?.value || "",
  };
  const rangeTextSuffix = {
    ...rangeTextSuffixRaw,
    value:
      rangeTextSuffixRaw?.is_enable === "true"
        ? normalizeRangeTextValue("suffix", rangeTextSuffixRaw?.value)
        : rangeTextSuffixRaw?.value || "",
  };
  const rangeCustomDefaultsEnabled = rangeSliderCustomDefaultsEnabled(
    settingData?.range_slider
  );

  const handleRangeDefaultValuesToggle = (enabled) => {
    clearRangeDefaultNormalizeDebounce();
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        const next = {
          ...(s.range_slider || {}),
          default_values: {
            ...((s.range_slider && s.range_slider.default_values) || {}),
            is_enable: enabled ? "true" : "false",
          },
        };
        s.range_slider = normalizeRangeSliderSettings(next, null);
      },
    });
  };

  const handleRangeTextToggle = (type, enabled) => {
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        const prevTextConfig = {
          ...((s.range_slider && s.range_slider[type]) || {}),
        };
        s.range_slider = {
          ...(s.range_slider || {}),
          [type]: {
            ...prevTextConfig,
            is_enable: enabled ? "true" : "false",
            value: enabled
              ? normalizeRangeTextValue(type, prevTextConfig.value)
              : prevTextConfig.value || "",
          },
        };
      },
    });
  };

  const handleRangeTextValueChange = (type, value) => {
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.range_slider = {
          ...(s.range_slider || {}),
          [type]: {
            ...((s.range_slider && s.range_slider[type]) || {}),
            value,
          },
        };
      },
    });
  };
  const handleRangeTextValueBlur = (type, value) => {
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.range_slider = {
          ...(s.range_slider || {}),
          [type]: {
            ...((s.range_slider && s.range_slider[type]) || {}),
            value: normalizeRangeTextValue(type, value),
          },
        };
      },
    });
  };
  const handleRangeModeChange = (value) => {
    clearRangeDefaultNormalizeDebounce();
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        const prevType = s?.range_slider?.type || "double";
        const nextSlider = {
          ...(s.range_slider || {}),
          type: value,
        };

        // On single -> double:
        // - keep single selected value as default min
        // - force default max to the configured max field value
        if (prevType === "single" && value === "double") {
          const currentMaxField = typeof s?.range_slider?.max !== "undefined" ? s.range_slider.max : "";
          const currentSingleValue =
            typeof s?.range_slider?.start_max !== "undefined"
              ? s.range_slider.start_max
              : (typeof s?.range_slider?.min !== "undefined" ? s.range_slider.min : "");

          nextSlider.start_min = currentSingleValue;
          nextSlider.start_max = currentMaxField;
        }

        // On double -> single:
        // - keep double default min as the single selected default value.
        if (prevType === "double" && value === "single") {
          const currentDoubleMin =
            typeof s?.range_slider?.start_min !== "undefined"
              ? s.range_slider.start_min
              : (typeof s?.range_slider?.min !== "undefined" ? s.range_slider.min : "");
          nextSlider.start_max = currentDoubleMin;
        }

        s.range_slider = normalizeRangeSliderSettings(nextSlider, null);
      },
    });
  };
  const handleRangePlacementChange = (value) => {
    clearRangeDefaultNormalizeDebounce();
    const currentPlacement = settingData?.range_slider?.placement || "horizontal";
    const freshItems = JSON.parse(JSON.stringify(props.data || []));
    const moduleRef = freshItems?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex];
    if (!moduleRef) return;

    moduleRef.settings = moduleRef.settings || {};
    moduleRef.settings.range_slider = {
      ...(moduleRef.settings.range_slider || {}),
      placement: value,
    };

    if (value !== currentPlacement) {
      const devices = ["desktop", "tablet", "mobile"];
      const states = ["default", "hover"];

      const toVertical = value === "vertical";

      if (moduleRef.style?.meta2) {
        devices.forEach((device) => {
          states.forEach((state) => {
            const styleObj = moduleRef.style.meta2?.[device]?.[state];
            if (!styleObj) return;
            const hasW = styleObj.width !== undefined;
            const hasH = styleObj.height !== undefined;
            if (!hasW && !hasH) return;
            const w = styleObj.width;
            const h = styleObj.height;
            if (toVertical) {
              const isWPercent = typeof w === "string" && w.includes("%");
              styleObj.width = hasH ? h : "8px";
              // Fixed pixel height when width is missing — 100% collapses without an explicit parent height.
              styleObj.height = hasW ? (isWPercent ? "150px" : w) : "130px";
            } else {
              const isHPercent = typeof h === "string" && h.includes("%");
              styleObj.width = hasH ? (isHPercent ? "100%" : h) : "100%";
              styleObj.height = hasW ? w : "8px";
            }
          });
        });
      }

      if (moduleRef.style?.meta3) {
        devices.forEach((device) => {
          states.forEach((state) => {
            const styleObj = moduleRef.style.meta3?.[device]?.[state];
            if (!styleObj) return;
            const hasMT = styleObj.marginTop !== undefined;
            const hasML = styleObj.marginLeft !== undefined;
            const hasMB = styleObj.marginBottom !== undefined;
            if (!hasMT && !hasML && !hasMB) return;
            if (toVertical) {
              const mt = styleObj.marginTop;
              const ml = styleObj.marginLeft;
              styleObj.marginLeft = hasMT ? mt : "0px";
              styleObj.marginBottom = hasML ? ml : "0px";
              if (hasMT) styleObj.marginTop = "0px";
            } else {
              const ml = styleObj.marginLeft;
              const mb = styleObj.marginBottom;
              styleObj.marginTop = hasML ? ml : "0px";
              styleObj.marginLeft = hasMB ? mb : "0px";
              if (hasMB) styleObj.marginBottom = "0px";
            }
          });
        });
      }
    }

    props.onSettingChange(freshItems);
  };
  const addCustomField = () => {
    let newField = {
      custom_field_key: "0",
      custom_field_value_list: [],
      compare_operator: "=",
      meta_type: "CHAR",
    };
    let updatedCustomFieldData  = [...normalizeCustomFieldData(customFieldArray)];
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
  const removeArray = (arr, index) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // part of the array after the specified index
    ...arr.slice(index + 1),
  ];
  const deleteCustomField = (index) => {

    let updatedCustomFieldData = JSON.parse(JSON.stringify(customFieldArray));
    updatedCustomFieldData = removeArray(updatedCustomFieldData, index);
    setCustomFieldArray([...updatedCustomFieldData])
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
  const deleteCustomFieldValue = (index, valueIndex) => {
    const layoutCopy = JSON.parse(JSON.stringify(customFieldArray));
  
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
//   const getTermDataLength = (keyName) => {
//   const found = taxonomyList?.find(item => item.key === keyName);
//   return found?.term_data?.length || 0;
// };
const getTermDataLength = (keyName) => {
  const found = taxonomyList?.find(item => item.key === keyName);

  if (!found?.term_data) return 0;

  return found.term_data.reduce((total, item) => {
    const childrenCount = item?.children_data?.length || 0;
    return total + 1 + childrenCount; // 1 for parent item
  }, 0);
};
  return (
    <>
      {!isLoading ? (
        <>
          <div className="module-content-tab-row no-pad-0">
            {false ? (
              <>
                <div className="module-content-tab-row">
                  <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select taxonomy source.">
                    <label>Taxonomy</label>
                  </Tooltip>
                  {LoadingCatogries ? (
                    Array.isArray(taxonomyListArray) ?
                      taxonomyListArray.map(
                        (taxo, indx) => (
                          // TaxonomyChecked(taxo.key) === true && (
                          <ul
                            className={`tc-caf-each-tax-data ${taxo.key}`}
                            data-name={taxo.key}
                            key={`${taxo.key}-${indx}`}
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
                                    display: "inline-block",
                                    width: "100%",
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                    padding: 0,
                                    margin: 0,
                                  }}
                                >
                                  {parse(`${taxo?.label}`)}
                                  <span className="caf-selected-terms-count">{"("}{getTermDataLength(taxo.key)}{")"}</span>
                                  <span className="caf-selected-terms-count-suffix">Selected</span>
                                </h2>
                              </div>
                              <div className="caf-terms-cat-btn">
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
                                                      handleTerm(e, taxo?.key, term, "parent")
                                                    }
                                                    checked={handleTermChecked(
                                                      taxo?.key,
                                                      term,
                                                      "parent"
                                                    )}
                                                  />
                                                  {parse(`${term?.name}`)} ({term?.total_count})
                                                </label>
                                                <i
                                                  className="fa fa-cog caf-term-setting"
                                                  aria-hidden="true"
                                                  onClick={() =>
                                                    handleTermSetting(
                                                      term,
                                                      taxo?.key
                                                      , "parent"
                                                    )
                                                  }
                                                ></i>
                                                {hasChildren && (
                                                  <i
                                                    className={`fa ${isExpanded
                                                      ? "fa-minus"
                                                      : "fa-plus"
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
                                                    termData={term}
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
                        )
                        // )
                      ) : (
                        <li className="tc-taxo-item-none">
                          No Taxonomy
                        </li>
                      )
                  ) : (
                    // )
                    <Skeleton active />
                  )}
                </div>
              </>
            ) : (
              <div className="caf-custom-field-data-container-range">
                      <>
                      <label className="setting-label-main">Custom Field</label>
                       <div className="caf-filter-custom-field-items-wrapper">
                        {customFieldArray?.map((item, index) => {
                          return(
                                <div className="module-content-tab-row caf-design-two-half">
                                  <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select custom field key.">
                                    <label>Select Field</label>
                                  </Tooltip>
                                  <Select
                                    className="caf-filter-query-custom-field-select caf-header-dropdown"
                                    options={rangeFieldSelectOptions}
                                    onChange={(value) => customFieldKeyFunc(value, "key", index)}
                                    style={{ width: "100%" }}
                                    value={item?.custom_field_key || "0"}
                                  />
                                </div>
                          );
                        })}
                       </div>
                      </>
                {/* Range slider uses a single custom-field flow; no add-field button needed. */}
              </div>
            )}
            <hr className="setting-hr-main"></hr>
          </div>
          <>
            <div className="module-content-tab-row no-pad-0">
              <label className="setting-label-main">Range Settings</label>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose slider type.">
                  <label >Type</label>
                </Tooltip>
                <div className="hoverswitchguard">
                  <Segmented
                    value={settingData?.range_slider?.type || "double"}
                    style={{ marginBottom: 10 }}
                    onChange={handleRangeModeChange}
                    className={"hoverTabCaf"}
                    options={rangeTypeOptions}
                  />
                </div>
              </div>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose slider placement.">
                  <label >Placement</label>
                </Tooltip>
                <div className="hoverswitchguard">
                  <Segmented
                    value={settingData?.range_slider?.placement || "horizontal"}
                    style={{ marginBottom: 10 }}
                    onChange={handleRangePlacementChange}
                    className={"hoverTabCaf"}
                    options={rangePlacementOptions}
                  />
                </div>
              </div>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set minimum value.">
                  <label>Min</label>
                </Tooltip>
                <Input
                  type="number"
                  value={rangeSettings.min}
                  onChange={(e) => handleRangeSettingChange("min", e.target.value)}
                />
              </div>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set maximum value.">
                  <label>Max</label>
                </Tooltip>
                <Input
                  type="number"
                  value={rangeSettings.max}
                  onChange={(e) => handleRangeSettingChange("max", e.target.value)}
                />
              </div>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set step interval.">
                  <label>Step</label>
                </Tooltip>
                <Input
                  type="number"
                  value={rangeSettings.step}
                  onChange={(e) => handleRangeSettingChange("step", e.target.value)}
                />
              </div>

              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable default slider handles.">
                  <label>Default values</label>
                </Tooltip>
                <div className="module-content-icon-switch">
                  <Switch
                    checked={rangeCustomDefaultsEnabled}
                    onChange={handleRangeDefaultValuesToggle}
                  />
                </div>
              </div>

              {rangeCustomDefaultsEnabled ? (
                (settingData?.range_slider?.type || "double") === "single" ? (
                  <div className="module-content-tab-row caf-design-two-half">
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set default range values.">
                      <label>Values</label>
                    </Tooltip>
                    <Input
                      type="number"
                      value={rangeSettings.start_max}
                      onChange={(e) => handleRangeSettingChange("start_max", e.target.value)}
                      onBlur={flushRangeSliderDefaultNormalize}
                    />
                  </div>
                ) : (
                  <div className="module-content-tab-row  caf-design-two-half">
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set default min and max handles.">
                      <label>Default</label>
                    </Tooltip>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        gap: 4,
                        width: "50%",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, width: "100%" }}>
                        <div className="caf-design-two-half-inputs">
                          <Input
                            type="number"
                            value={rangeSettings.start_min}
                            onChange={(e) => handleRangeSettingChange("start_min", e.target.value)}
                            onBlur={flushRangeSliderDefaultNormalize}
                          />
                        </div>
                        <div style={{ opacity: 0.8, flex: "0 0 auto" }}>-</div>
                        <div className="caf-design-two-half-inputs">
                          <Input
                            type="number"
                            value={rangeSettings.start_max}
                            onChange={(e) => handleRangeSettingChange("start_max", e.target.value)}
                            onBlur={flushRangeSliderDefaultNormalize}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, width: "100%" }}>
                        <div style={{ width: 72, fontSize: 11, opacity: 0.75, textAlign: "center" }}>min</div>
                        <div style={{ flex: "0 0 auto", width: 10 }} />
                        <div style={{ width: 72, fontSize: 11, opacity: 0.75, textAlign: "center" }}>max</div>
                      </div>
                    </div>
                  </div>
                )
              ) : null}

              <hr className="setting-hr-main"></hr>
            </div>

            <div className="module-content-tab-row no-pad-0">
              <label className="setting-label-main">Text Settings</label>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable or disable prefix text.">
                  <label>Prefix</label>
                </Tooltip>
                <div className="module-content-icon-switch">
                  <Switch
                    checked={rangeTextPrefix?.is_enable === "true"}
                    onChange={(checked) => handleRangeTextToggle("prefix", checked)}
                  />
                </div>
                
              </div>
              {rangeTextPrefix?.is_enable === "true" && (
                  <div className="module-content-tab-row caf-design-two-half">
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set prefix text value.">
                      <label>Prefix Text</label>
                    </Tooltip>
                    <Input
                      value={rangeTextPrefix?.value || ""}
                      onChange={(e) => handleRangeTextValueChange("prefix", e.target.value)}
                      onBlur={(e) =>
                        handleRangeTextValueBlur("prefix", e.target.value)
                      }
                      placeholder="e.g. $"
                    />
                  </div>
                )}
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable or disable suffix text.">
                  <label>Suffix</label>
                </Tooltip>
                <div className="module-content-icon-switch">
                  <Switch
                    checked={rangeTextSuffix?.is_enable === "true"}
                    onChange={(checked) => handleRangeTextToggle("suffix", checked)}
                  />
                </div>
                
              </div>
              {rangeTextSuffix?.is_enable === "true" && (
                  <div className="module-content-tab-row caf-design-two-half">
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set suffix text value.">
                      <label>Suffix Text</label>
                    </Tooltip>
                    <Input
                      value={rangeTextSuffix?.value || ""}
                      onChange={(e) => handleRangeTextValueChange("suffix", e.target.value)}
                      onBlur={(e) =>
                        handleRangeTextValueBlur("suffix", e.target.value)
                      }
                      placeholder="e.g. kg"
                    />
                  </div>
                )}
              <hr className="setting-hr-main"></hr>
            </div>
            {false && (
              <>
                <div className="module-content-tab-row no-pad-0">
                  {settingData.multiple_term === "true" && (
                    <SelectMain
                      label="Category Relation"
                      property="category_relation"
                      classn={'caf-design-two-half'}
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
                  <hr className="setting-hr-main"></hr>
                </div>
              </>
            )}
              {false && (
                <>
              <div className="module-content-tab-row no-pad-0">
                    <label className="setting-label-main">Display Count</label>
                    <SwitchMain
                      label="Enable"
                      property="show_count"
                      onSettingChange={changeInitialDataOptChange}
                      data={settingData}
                      currValue={settingData?.show_count}
                    />
              </div>

              <div className="module-content-tab-row no-pad-0" style={{ paddingTop: '10px' }}>
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
                          <label>Prefix</label>
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
                          <label>Suffix</label>
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
                        <label>Enter Label Name</label>
                      </Tooltip>
                      <Input
                        onChange={(e) => handleLabel(e.target.value)}
                        value={labelInput}
                      />
                    </div>
                    {iconsArray && (
                      <FilterLabelShowIconLockedSection className="module-content-tab-row">
                        <FilterLabelShowIconProPanel
                          data={props.data}
                          indexes={props.indexes}
                          iconsArray={iconsArray}
                          onSettingChange={props.onSettingChange}
                          enabled={canUseLabelShowIcon() && labelIconSwitch}
                          onToggle={onLabelIconSwitch}
                          label="Icons"
                        />
                      </FilterLabelShowIconLockedSection>
                    )}
                  </div>
                  <FilterLabelCollapseLockedSection>
                  <div className="module-content-tab-row caf-design-two-half">
                    <SwitchMain
                      label="Enable Toggle"
                      property="enable_toggle"
                      onSettingChange={changeInitialData}
                      data={settingData}
                      currValue={
                        canUseFilterLabelCollapse()
                          ? settingData.enable_toggle
                          : "false"
                      }
                    />
                  </div>
                  {canUseFilterLabelCollapse() && toggle.enable && (
                    <>
                      <SelectMain
                      label="Toggle Icon Position"
                      property="toggle_position"
                      classn={'caf-design-two-half'}
                      options={[
                        {
                          label: "Left",
                          value: "left",
                        },
                        {
                          label: "Right",
                          value: "right",
                        },
                      ]}
                      onSettingChange={changeInitialData}
                      data={settingData}
                    />
                    <div className="module-content-tab-row caf-design-two-half">
                      <SwitchMain
                        label="Default Toggle Collapse"
                        property="close_toggle"
                        onSettingChange={changeInitialData}
                        data={settingData}
                        currValue={settingData.close_toggle}
                      />
                    </div>
                    </>
                  )}
                  </FilterLabelCollapseLockedSection>
                </>
              )}

            </div>
          </>

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
            className="caf-range-slider-filter-term-setting-modal caf-builder-modal"
          >
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Mark this term as selected by default.">
              <label>Add As Default Term</label>
            </Tooltip>
            <Switch
              checkedChildren="Remove"
              unCheckedChildren="Add"
              onChange={handleTermSwitch}
              checked={termPredefined}
            />
          </FilterTermIconSettingsModal>

          {/* Custom Field */}

          <FilterCfTermIconSettingsModal
            open={termSettingPopUpCusField}
            onSave={handleSaveCustomField}
            onCancel={handleCancelCustomField}
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
            className="caf-range-slider-filter-cf-modal caf-builder-modal"
          >
            <div className="module-content-tab-row">
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enter option key value.">
                <label>Key</label>
              </Tooltip>
              <Input
                onChange={(e) => setKeyValueCf(e.target.value)}
                value={keyValueCf}
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
            <div className="module-content-tab-row">
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select this option by default.">
                <label>Add As Default Selected</label>
              </Tooltip>
              <Switch
                checkedChildren="Remove"
                unCheckedChildren="Add"
                onChange={handleTermSwitchCusField}
                checked={termPredefinedCusField}
              />
            </div>
            {(
                checkError ||
                keyValueCf === "" ||
                labelValueCf === "" ||
                (checkError && keyValueCf === "" && labelValueCf === "")
              )  &&
             (
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Both fields are mandatory.">
                  <label style={{ color: "red" }}>Both Key and Label fields are required.</label>
                </Tooltip>
              )}
          </FilterCfTermIconSettingsModal>
        </>
      ) : (
        <Skeleton active />
      )}
    </>
  );
});

export default RangeSliderFilter;
