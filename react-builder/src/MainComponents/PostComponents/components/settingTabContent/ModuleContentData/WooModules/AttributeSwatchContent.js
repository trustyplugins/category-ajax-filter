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
  EyeOutlined,
  EyeInvisibleOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  canUseFilterTermReorder,
  reorderTaxonomyTermData,
  useTaxonomyTermDragSensors,
} from "../../../../../FilterComponents/components/modules-output/shared/taxonomyTermDrag";
import LabelIcons from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/LabelIcons";
import SelectMain from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/SelectMain";
import SwitchMain from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/ContentComponents/SwitchMain";
import InputMain from "../../../../../FilterComponents/components/design-components/common-component/InputMain";
import {
  TERM_VISUAL_COLOR,
  TERM_VISUAL_ICON,
  TERM_VISUAL_TEXT,
  resolveAttributeSwatchDisplayMode,
  applyAttributeSwatchDisplayMode,
  isTermVisualColor,
  getTermSwatchColor,
  termHasColorSwatch,
  buildColorTermIcons,
  buildIconTermIcons,
  ensureDefaultSwatchColorsOnSettings,
  ensureDefaultTermIconsOnSettings,
  getAttributeSwatchDefaultTermIcons,
  termHasIconVisual,
} from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/termVisualUtils";
import TermColorPickerTrigger from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/TermColorPickerTrigger";
import {
  useResolvedMainBuilderData,
  getResolvedFilterPostType,
  getResolvedSinglePostData,
} from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/useResolvedMainBuilderData";
import {
  createFilterModuleSettingsSnapshot,
  commitFilterModuleTaxonomyData,
  commitFilterModuleSettingsPatch,
  commitFilterModuleReplaceSettings,
} from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/filterSettingsSnapshot";
import {
  attributeSwatchSettingsHaveDefaultTermData,
  stripAttributeSwatchDefaultTermSettings,
} from "./attributeSwatchDefaultTermStrip";
import TermTaxonomyLabelText from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/TermTaxonomyLabelText";
import {
  getTaxonomyPickerSections,
  groupTaxonomyListForPicker,
} from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/taxonomyPickerSections";
import warningIcon from "../../../../../images/caution-sign.svg";
import {
  FilterLabelShowIconLockedSection,
  FilterLabelCollapseLockedSection,
  canUseFilterCustomField,
  canUseLabelShowIcon,
  canUseFilterLabelCollapse,
  canUseFilterTermIcon,
  resolveFilterDataSource,
  resolveFilterLabelCollapseToggleState,
  applyFilterLabelCollapseTierToSettings,
  shouldShowFilterTermIconControl,
} from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/shared/filterModuleTier";
import FilterTermRowProActions from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermRowProActions";
import FilterTermIconSettingsModal from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterTermIconSettingsModal";
import FilterCfTermIconSettingsModal from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterCfTermIconSettingsModal";
import FilterLabelShowIconProPanel from "../../../../../FilterComponents/components/settingTabContent/ModuleContentData/shared/FilterLabelShowIconProPanel";
import { canShowAddAsParentSwitch } from "../../../../../FilterComponents/utils/filterBuilderUiFlags";
import {
  canShowWooAttributeColorActions,
  useWooAttributeColorActions,
  WooAttributeColorActions,
} from "../../../../../FilterComponents/components/woocommerce/wooAttributeColorImport";

const commitSwatchPatch = (opts) =>
  commitFilterModuleSettingsPatch({
    ...opts,
    patch: (settings) => {
      opts.patch?.(settings);
      stripAttributeSwatchDefaultTermSettings(settings);
    },
  });

const commitSwatchReplace = (opts) =>
  commitFilterModuleReplaceSettings({
    ...opts,
    nextSettings: stripAttributeSwatchDefaultTermSettings({
      ...opts.nextSettings,
    }),
  });

const commitSwatchTaxonomyData = (opts) => {
  const { settingsRef, nexttaxonomyData, ...rest } = opts;
  settingsRef.taxonomy_data = nexttaxonomyData;
  stripAttributeSwatchDefaultTermSettings(settingsRef);
  commitFilterModuleTaxonomyData({
    ...rest,
    settingsRef,
    nexttaxonomyData: settingsRef.taxonomy_data,
  });
};

const normalizeCustomFieldData = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};

const getPlainTextFromHtml = (html) => {
  const value = String(html ?? "");
  return value.replace(/<[^>]+>/g, "").trim();
};

/** Inline drag handle for Attribute Swatch Values (no modal). */
const AttributeTermDragHandle = ({ attributes, listeners }) => {
  const { onPointerDown, ...restListeners } = listeners || {};
  return (
    <button
      type="button"
      className="caf-attr-swatch-term-drag-handle"
      aria-label="Drag to reorder term"
      title="Drag to reorder"
      {...attributes}
      {...restListeners}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        event.stopPropagation();
      }}
    >
      <HolderOutlined />
    </button>
  );
};

/** Sortable Values row — Attribute Swatch settings only. */
const SortableAttributeTermRow = ({
  term,
  taxonomyKey,
  canReorder,
  isDisplayed,
  onOpenSettings,
  onToggleDisplay,
  toSyntheticAttrTerm,
  TermTaxonomyRowActions,
}) => {
  const sortableId = `attr-swatch-term-${taxonomyKey}-${term?.key}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled: !canReorder,
    data: {
      type: "parent",
      groupKey: taxonomyKey,
      termKey: term?.key,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`caf-filter-query-cf-value-item${
        isDisplayed ? "" : " caf-attr-term-row-hidden"
      }${isDragging ? " is-dragging" : ""}`}
    >
      <div className="trusty-manage-bar-sec-label caf-filter-query-cf-value-row">
        {canReorder && (
          <AttributeTermDragHandle
            attributes={attributes}
            listeners={listeners}
          />
        )}
        <div className="caf-filter-query-cf-value-title">
          <TermTaxonomyLabelText name={term?.value} />
        </div>
        <TermTaxonomyRowActions
          term={toSyntheticAttrTerm(term)}
          taxonomy={taxonomyKey}
          type="parent"
          onOpenSettings={() => onOpenSettings(taxonomyKey, term)}
        />
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title={
            isDisplayed
              ? "Hide this term from the swatch"
              : "Show this term in the swatch"
          }
        >
          <button
            type="button"
            className={`caf-attr-term-display-toggle${
              isDisplayed ? "" : " is-hidden"
            }`}
            aria-label={isDisplayed ? "Hide term" : "Show term"}
            aria-pressed={!isDisplayed}
            onClick={() => onToggleDisplay(taxonomyKey, term)}
          >
            {isDisplayed ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

const AttributeSwatchContent = memo((props) => {
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
  const singlePostData = getResolvedSinglePostData(mainBuilderData);
  const [postType, setPostType] = useState(
    resolvedPostType
  );

let meta_fields = singlePostData?.meta_fields;
let fieldOptions = [{ label: "Select Field", value: "0" }];
if (meta_fields) {
  Object.keys(meta_fields)?.map((item, i) => (
    <>{fieldOptions.push({ value: item, label: item })}</>
  ))
}

  const [taxonomyList, setTaxonomyList] = useState([]);
  //   const [filterType, setFilterType] = useState(settingData.filter_type);
  const [dataSource, setDataSource] = useState("taxonomy");
  // Attribute Swatch: attribute taxonomy only (dropdown + term value rows).
  const effectiveDataSource = "taxonomy";
  const [editingAttributeTerm, setEditingAttributeTerm] = useState(null);

  // Attribute Swatch enforce data_source + Display As sync (show_icon / term_visual).
  useEffect(() => {
    const displayMode = resolveAttributeSwatchDisplayMode({
      ...settingData,
      post_type: resolvedPostType,
    });
    const expectedShowIcon =
      displayMode === TERM_VISUAL_TEXT ? "false" : "true";
    const expectedHideLabel =
      displayMode === TERM_VISUAL_COLOR || displayMode === TERM_VISUAL_ICON
        ? "true"
        : "false";
    const termTreeNeedsIconSeed = (terms) => {
      if (!Array.isArray(terms)) return false;
      return terms.some(
        (term) =>
          !termHasIconVisual(term?.icons) ||
          (Array.isArray(term?.children_data) &&
            termTreeNeedsIconSeed(term.children_data))
      );
    };
    const needsIconSeed =
      displayMode === TERM_VISUAL_ICON &&
      Array.isArray(settingData?.taxonomy_data) &&
      settingData.taxonomy_data.some((group) =>
        termTreeNeedsIconSeed(group?.term_data)
      );
    const needsDataSource =
      settingData?.data_source && settingData.data_source !== "taxonomy";
    const needsDisplaySync =
      settingData?.term_visual !== displayMode ||
      settingData?.show_icon !== expectedShowIcon ||
      settingData?.hide_term_label !== expectedHideLabel ||
      needsIconSeed;

    if (!needsDataSource && !needsDisplaySync) {
      return;
    }

    setDataSource("taxonomy");
    commitSwatchPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.data_source = "taxonomy";
        s.show_count = "false";
        const synced = applyAttributeSwatchDisplayMode(s, displayMode);
        Object.assign(s, synced);
        if (displayMode === TERM_VISUAL_COLOR) {
          const withColors = ensureDefaultSwatchColorsOnSettings(s);
          s.taxonomy_data = withColors.taxonomy_data;
        }
        if (displayMode === TERM_VISUAL_ICON) {
          const withIcons = ensureDefaultTermIconsOnSettings(s);
          s.taxonomy_data = withIcons.taxonomy_data;
        }
      },
    });
  }, [settingData?.data_source, settingData?.term_visual, settingData?.show_icon, settingData?.hide_term_label, settingData?.taxonomy_data, props.data, rowindex, columnindex, moduleindex, resolvedPostType, props.onSettingChange]);

  useEffect(() => {
    if (!attributeSwatchSettingsHaveDefaultTermData(settingData)) {
      return;
    }
    commitSwatchPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      patch: () => {},
    });
    // Strip legacy default-term data once when opening settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    type:'icon'
  });
  const [iconSwitch, setIconSwitch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [labelIconSwitch, setLabelIconSwitch] = useState(
    canUseLabelShowIcon() ? settingData?.label?.icons?.visibility : false
  );
   const [metaKeys, setMetaKeys] = useState([]);
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
  const taxonomyPickerSections = useMemo(
    () => getTaxonomyPickerSections(taxonomyListArray),
    [taxonomyListArray]
  );
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
  let fieldOptions = [{ label: "Select Field", value: "0" }];
  if (meta_fields) {
    Object.keys(meta_fields)?.map((item, i) => (
      <>{fieldOptions.push({ value: item, label: item })}</>
    ))
  }
    setMetaKeys(fieldOptions);
    setCustomFieldKey("0")
  }, [singlePostData?.value]);

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
            obj.predefine = "false";
            if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
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
              const preserved = obj.icons?.icon_backup
                ? {
                    type: obj.icons.icon_backup.type || "icon",
                    icon: obj.icons.icon_backup.icon,
                    position: obj.icons?.position || "before",
                    icon_backup: obj.icons.icon_backup,
                    color: "",
                  }
                : {};
              obj.icons = preserved;
            } else {
              obj.icons = {
                ...(obj.icons?.color ? { color: obj.icons.color } : {}),
              };
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
              allChildObjects,
              settingsRef
            );
          }
          return obj;
        });

        // ✅ return updated taxonomy data object
        return { ...data, term_data: updatedTermData };
      });

      commitSwatchTaxonomyData({
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
  const updateNestedTerm = (children, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects, settingsRef = settingData) => {
    if (!Array.isArray(children)) return;

    children.forEach((child) => {
      if (child.key === termDetail[0]) {
        // ✅ same logic as main update
        child.predefine = "false";

        if (contentIconDetail.iconChecked && contentIconDetail.icon !== "") {
          if (isTermVisualColor(settingsRef) || contentIconDetail.type === "color") {
            child.icons = buildColorTermIcons(
              child.icons,
              contentIconDetail.icon,
              contentIconDetail.position
            );
          } else {
            child.icons = buildIconTermIcons(child.icons, {
              icon: contentIconDetail.icon,
              position: contentIconDetail.position,
              type: contentIconDetail?.type || "icon",
            });
          }
        } else if (isTermVisualColor(settingsRef)) {
          child.icons = child.icons?.icon_backup
            ? {
                type: child.icons.icon_backup.type || "icon",
                icon: child.icons.icon_backup.icon,
                position: child.icons?.position || "before",
                icon_backup: child.icons.icon_backup,
                color: "",
              }
            : {};
        } else {
          child.icons = {
            ...(child.icons?.color ? { color: child.icons.color } : {}),
          };
        }

        if (isParent) {
          child.children_data = [...allChildObjects];
          child.is_parent = "true";
        } else {
          child.is_parent = "false";
        }
      } else if (Array.isArray(child.children_data) && child.children_data.length > 0) {
        // 🔁 recursive call for deeper nested children
        updateNestedTerm(child.children_data, termDetail, termPredefined, contentIconDetail, isParent, allChildObjects, settingsRef);
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
    commitSwatchPatch({
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
      enable: resolveFilterLabelCollapseToggleState(data).enable,
    }));
    if (
      !canUseFilterLabelCollapse() ||
      data.enable_toggle === "false"
    ) {
      data.close_toggle = "false";
      setToggle((prev) => ({
        ...prev,
        close: false,
      }));
    }
    setCompareOperator(data?.custom_field_data?.compare_operator);
    const prevVisual = resolveAttributeSwatchDisplayMode({
      ...settingData,
      post_type: resolvedPostType,
    });
    let nextSettings = stripAttributeSwatchDefaultTermSettings(
      applyFilterLabelCollapseTierToSettings(data)
    );
    // Keep show_icon / hide_term_label in sync with Display As (Text | Icon/Image | Color).
    const nextVisual = resolveAttributeSwatchDisplayMode({
      ...nextSettings,
      post_type: resolvedPostType,
    });
    nextSettings = applyAttributeSwatchDisplayMode(nextSettings, nextVisual);
    if (prevVisual !== TERM_VISUAL_COLOR && nextVisual === TERM_VISUAL_COLOR) {
      nextSettings = ensureDefaultSwatchColorsOnSettings(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    }
    if (prevVisual !== TERM_VISUAL_ICON && nextVisual === TERM_VISUAL_ICON) {
      nextSettings = ensureDefaultTermIconsOnSettings(nextSettings);
      setTaxonomyList(nextSettings.taxonomy_data);
    }
    commitSwatchReplace({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
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
      enable: resolveFilterLabelCollapseToggleState(data).enable,
    }));
    if (
      !canUseFilterLabelCollapse() ||
      data.enable_toggle === "false"
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

    // styleData.meta2[selectedDevice].default.flexFlow = "row";
    // styleData.meta2[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta2[selectedDevice].default.alignItems = "flex-start";

    // styleData.meta3[selectedDevice].default.flexFlow = "row";
    // styleData.meta3[selectedDevice].default.justifyContent = "flex-start";
    // styleData.meta3[selectedDevice].default.alignItems = "flex-start";

    // items[rowindex].data[columnindex].data[moduleindex]["style"] = styleData ;
    // props.onSettingChange(items);

    let nextSettings = stripAttributeSwatchDefaultTermSettings(
      applyFilterLabelCollapseTierToSettings(data)
    );
    commitSwatchReplace({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      resolvedPostType,
      onSettingChange: props.onSettingChange,
      nextSettings,
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

  //   commitSwatchReplace({
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
    
  //   commitSwatchReplace({
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
    if (value === "custom_field" && !canUseFilterCustomField()) {
      return;
    }
    setDataSource(value);
    if (value !== settingData.data_source) {
      setLoadingCatogries(false);
      setTimeout(() => {
        setLoadingCatogries(true);
      }, 400);
    }
    commitSwatchPatch({
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
    settingData.cf_predefined_terms = updatedPredefinedTerms
    commitSwatchPatch({
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

  const handleSaveCustomFieldLabel = () => {
    if (keyValueCf === "" || labelValueCf === "") {
      setCheckError(true);
      return false;
    }

    if (editingAttributeTerm?.taxonomy) {
      const { freshItems, settingsRef } = getFreshSettingsSnapshot();
      const taxKey = editingAttributeTerm.taxonomy;
      const termKey = editingAttributeTerm.termKey;
      const nextTaxonomyData = (settingsRef.taxonomy_data || []).map((group) => {
        if (group.key !== taxKey) return group;
        return {
          ...group,
          term_data: (group.term_data || []).map((term) => {
            if (term.key !== termKey) return term;
            return {
              ...term,
              value: labelValueCf,
            };
          }),
        };
      });
      setTermSettingPopUpCusFieldLabel(false);
      setEditingAttributeTerm(null);
      setKeyValueCf("");
      setLabelValueCf("");
      setCheckError(false);
      commitSettingsSnapshot(freshItems, settingsRef, nextTaxonomyData);
      return;
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
    commitSwatchPatch({
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
    commitSwatchPatch({
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
    setEditingAttributeTerm(null);
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
    const defaultTermIcons = getAttributeSwatchDefaultTermIcons({
      ...settingData,
      post_type: resolvedPostType,
    });

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
          display: "true",
          icons: defaultTermIcons,
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
    commitSwatchTaxonomyData({
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
    let updatedPredefinedTerms = [...settingsRef?.predefined_terms];
    const checked = e.target.checked;
    const taxonomyExists = newtaxonomyData.some(
      (data) => data.key === taxonomy
    );
    const defaultTermIcons = getAttributeSwatchDefaultTermIcons({
      ...settingsRef,
      post_type: resolvedPostType,
    });

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
                icons: defaultTermIcons,
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
              icons: defaultTermIcons,
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
              icons: defaultTermIcons,
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

                /* start remove from PredefinedTerms */
                  updatedPredefinedTerms = updatedPredefinedTerms?.filter(
                    (itemData) =>
                      itemData !== `${String(taxonomy).trim()}___${String(term?.id).trim()}`
                  );
                /* end remove from PredefinedTerms */

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
            /* start remove from PredefinedTerms */
            updatedPredefinedTerms = updatedPredefinedTerms?.filter(
              (itemData) =>
                itemData !== `${String(taxonomy).trim()}___${String(term?.id).trim()}`
            );
            /* end remove from PredefinedTerms */

          }
        }
      }
    }
    settingsRef.predefined_terms = updatedPredefinedTerms;
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

    const targetId = String(term?.id ?? "");
    if (!targetId) return false;

    const searchInChildren = (childrenArray, termId) => {
      for (const child of childrenArray) {
        if (String(child.key) === termId) return true;
        if (Array.isArray(child.children_data) && child.children_data.length > 0) {
          const found = searchInChildren(child.children_data, termId);
          if (found) return true;
        }
      }
      return false;
    };

    // 🔍 Check at both top level and nested children
    for (const obj of taxo.term_data) {
      if (String(obj.key) === targetId) return true;
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const foundInChildren = searchInChildren(obj.children_data, targetId);
        if (foundInChildren) return true;
      }
    }

    return false;
  };

  const findTermObjRecursive = (data, termId) => {
    if (!Array.isArray(data)) return null;
    const targetId = String(termId ?? "");
    for (const obj of data) {
      if (String(obj.key) === targetId) {
        return obj;
      }
      if (Array.isArray(obj.children_data) && obj.children_data.length > 0) {
        const found = findTermObjRecursive(obj.children_data, termId);
        if (found) return found;
      }
    }
    return null;
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

  const applyColorToTermTree = (terms, termId, color) => {
    if (!Array.isArray(terms)) return terms;
    const targetId = String(termId ?? "");
    return terms.map((obj) => {
      if (String(obj.key) === targetId) {
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

    commitSwatchTaxonomyData({
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

  const TermTaxonomyRowActions = ({
    term,
    taxonomy,
    type = "parent",
    parentTermData = {},
    onOpenSettings,
  }) => {
    const showTermIconControl = shouldShowFilterTermIconControl(
      settingData?.show_icon
    );
    const colorMode = isTermVisualColor({
      ...settingData,
      post_type: resolvedPostType,
    });
    const isTermSelected = handleTermChecked(taxonomy, term, type, parentTermData);
    const termIcons = getTermSavedIcons(taxonomy, term);
    const hasColor = termHasColorSwatch(termIcons);
    const hasIcon = colorMode
      ? hasColor
      : termHasIcon(termIcons) && termIcons?.type !== "color";
    const iconPreviewSrc = getTermIconPreviewSrc(termIcons);
    const swatchColor = getTermSwatchColor(termIcons);
    const termIconActionsLocked = !canUseFilterTermIcon();
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
          hasIcon={hasIcon}
          termIcons={termIcons}
          iconPreviewSrc={iconPreviewSrc}
          iconTriggerDisabled={iconTriggerDisabled}
          termIconActionsLocked={termIconActionsLocked}
          addLabel={addLabel}
          onOpenSettings={onOpenSettings}
          showIconControl={showTermIconControl && !colorMode}
          showDefaultControl={false}
        />
      </span>
    );
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
                  <TermTaxonomyLabelText
                    name={child?.name}
                    count={child?.total_count}
                  />
                </label>
                <TermTaxonomyRowActions
                  term={child}
                  taxonomy={taxoKey}
                  type="child"
                  parentTermData={termData}
                  onOpenSettings={() =>
                    handleTermSetting(child, taxoKey, "child", termData)
                  }
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
          // Prefer existing term entries so custom colors/icons are kept.
          const merged = [...allTerms, ...data.term_data];
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
    let updatedPredefinedTerms = [...settingsRef.predefined_terms];
    let newtaxonomyData = [...settingsRef.taxonomy_data];
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

  const handleTermSetting = (term, taxonomy, type = "parent", parantTermData = {}) => {
    if (isTermVisualColor({
      ...settingData,
      post_type: resolvedPostType,
    })) {
      return;
    }
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
    commitSwatchPatch({
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

const formatCfValueListSummary = (list) =>
  (list || [])
    .map((val) =>
      val && typeof val === "object"
        ? String(val.label ?? val.key ?? "")
        : String(val ?? ""),
    )
    .filter(Boolean)
    .join(" , ");

  const attributeSelectOptions = useMemo(() => {
    const attrs = groupTaxonomyListForPicker(taxonomyListArray).attributes || [];
    return [
      { label: "Select Attribute", value: "0" },
      ...attrs.map((item) => ({
        label: item.label,
        value: item.key,
      })),
    ];
  }, [taxonomyListArray]);

  const selectedAttributeKey =
    Array.isArray(settingData?.taxonomy_data) &&
    settingData.taxonomy_data.length > 0
      ? settingData.taxonomy_data[0]?.key || "0"
      : "0";

  const selectedAttributeTerms = useMemo(() => {
    const group =
      Array.isArray(settingData?.taxonomy_data) &&
      settingData.taxonomy_data.find((g) => g.key === selectedAttributeKey);
    return Array.isArray(group?.term_data) ? group.term_data : [];
  }, [settingData?.taxonomy_data, selectedAttributeKey]);

  // Auto-append newly imported Woo attribute terms (backend merge).
  useEffect(() => {
    if (
      !selectedAttributeKey ||
      selectedAttributeKey === "0" ||
      !Array.isArray(settingData?.taxonomy_data) ||
      settingData.taxonomy_data.length === 0
    ) {
      return;
    }

    let cancelled = false;

    const syncFromBackend = async () => {
      try {
        const response = await apiClient.post(
          apiEndpoints.syncAttributeSwatchTaxonomyData,
          {
            taxonomy_data: settingData.taxonomy_data,
            post_type: resolvedPostType || "product",
          }
        );
        const payload = response?.data;
        if (
          cancelled ||
          !payload ||
          payload.status !== "success" ||
          !payload.changed ||
          !Array.isArray(payload.taxonomy_data)
        ) {
          return;
        }

        commitSwatchPatch({
          data: props.data,
          rowindex,
          columnindex,
          moduleindex,
          resolvedPostType,
          onSettingChange: props.onSettingChange,
          patch: (settingsRef) => {
            settingsRef.taxonomy_data = payload.taxonomy_data;
          },
          onAfterCommit: (nextSettings) =>
            setTaxonomyList(nextSettings.taxonomy_data),
        });
      } catch (error) {
        // Non-blocking: settings still work with saved snapshot.
      }
    };

    syncFromBackend();

    return () => {
      cancelled = true;
    };
    // Sync when the module/attribute context opens — not on every taxonomy_data ref change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttributeKey, resolvedPostType, rowindex, columnindex, moduleindex]);

  const toSyntheticAttrTerm = (savedTerm) => ({
    id: savedTerm?.key,
    name: savedTerm?.value,
    children_data: Array.isArray(savedTerm?.children_data)
      ? savedTerm.children_data
      : [],
    count: savedTerm?.count,
  });

  const handleAttributeSelect = (value) => {
    const nextKey = value && value !== "0" ? String(value) : "";
    const { freshItems, settingsRef } = getFreshSettingsSnapshot();
    let updatedPredefinedTerms = [...(settingsRef.predefined_terms || [])];
    let newtaxonomyData = [];
    const previousGroup =
      nextKey &&
      (settingsRef.taxonomy_data || []).find((group) => group.key === nextKey);

    // Drop any previously selected attribute + matching defaults (unless reloading same).
    (settingsRef.taxonomy_data || []).forEach((group) => {
      if (!group?.key || group.key === nextKey) return;
      updatedPredefinedTerms = removeTaxoMatchedPredefinedTerms(
        updatedPredefinedTerms,
        group.key,
        group.term_data || []
      );
    });

    if (nextKey) {
      const taxItem = taxonomyListArray.find((item) => item.key === nextKey);
      if (!taxItem) return;
      let allTerms = getAllTermsRecursive(taxItem.term_data, "parent");
      if (previousGroup?.term_data?.length) {
        const previousByKey = new Map(
          previousGroup.term_data.map((term) => [String(term.key), term])
        );
        const mergedFromPrevious = previousGroup.term_data
          .map((previous) => {
            const fresh = allTerms.find(
              (term) => String(term.key) === String(previous.key)
            );
            if (!fresh) return null;
            return {
              ...fresh,
              display: previous.display ?? "true",
              predefine: previous.predefine ?? fresh.predefine,
              icons: previous.icons ?? fresh.icons,
            };
          })
          .filter(Boolean);
        const keptKeys = new Set(
          mergedFromPrevious.map((term) => String(term.key))
        );
        const newlyAdded = allTerms
          .filter((term) => !keptKeys.has(String(term.key)))
          .map((term) => {
            const previous = previousByKey.get(String(term.key));
            if (!previous) return term;
            return {
              ...term,
              display: previous.display ?? "true",
              predefine: previous.predefine ?? term.predefine,
              icons: previous.icons ?? term.icons,
            };
          });
        allTerms = [...mergedFromPrevious, ...newlyAdded];
      }
      newtaxonomyData = [
        {
          key: nextKey,
          term_data: allTerms,
        },
      ];
    }

    settingsRef.predefined_terms = updatedPredefinedTerms;
    commitSettingsSnapshot(freshItems, settingsRef, newtaxonomyData);
  };

  const openAttributeTermIconSetting = (taxonomy, savedTerm) => {
    const synthetic = toSyntheticAttrTerm(savedTerm);
    handleTermSetting(synthetic, taxonomy, "parent", {});
  };

  const isAttributeTermDisplayed = (savedTerm) =>
    String(savedTerm?.display ?? "true") !== "false";

  const toggleAttributeTermDisplay = (taxonomy, savedTerm) => {
    const nextDisplay = isAttributeTermDisplayed(savedTerm) ? "false" : "true";
    const { freshItems, settingsRef } = getFreshSettingsSnapshot();
    const nextTaxonomyData = (settingsRef.taxonomy_data || []).map((group) => {
      if (group.key !== taxonomy) return group;
      return {
        ...group,
        term_data: (group.term_data || []).map((term) => {
          if (String(term.key) !== String(savedTerm?.key)) return term;
          return {
            ...term,
            display: nextDisplay,
          };
        }),
      };
    });
    commitSettingsSnapshot(freshItems, settingsRef, nextTaxonomyData);
  };

  const canReorderAttributeTerms =
    canUseFilterTermReorder() && selectedAttributeTerms.length > 1;
  const attributeTermSortableIds = useMemo(
    () =>
      selectedAttributeTerms.map(
        (term) => `attr-swatch-term-${selectedAttributeKey}-${term?.key}`
      ),
    [selectedAttributeTerms, selectedAttributeKey]
  );
  const attributeTermDragSensors = useTaxonomyTermDragSensors();

  const handleAttributeTermDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }
      const { freshItems, settingsRef } = getFreshSettingsSnapshot();
      const nextTaxonomyData = reorderTaxonomyTermData(
        settingsRef.taxonomy_data,
        active.data?.current,
        over.data?.current
      );
      if (!nextTaxonomyData) {
        return;
      }
      commitSettingsSnapshot(freshItems, settingsRef, nextTaxonomyData);
    },
    // getFreshSettingsSnapshot / commitSettingsSnapshot close over stable props
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data, rowindex, columnindex, moduleindex, resolvedPostType]
  );

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
    commitSwatchPatch({
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
    commitSwatchPatch({
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
    const handleCompareOperator = (value,index) => {
    let updateData = customFieldArray?.map((item, id) => {

      if (id === index) {
         return { ...item, compare_operator: value };
      }
      return item;

    });

    setCustomFieldArray([...updateData])
    settingData.custom_field_data = updateData;
    commitSwatchPatch({
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
    commitSwatchPatch({
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
  const deleteCustomFieldValue = (index, valueIndex ,item,value) => {
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
    commitSwatchPatch({
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
            <label className="setting-label-main">Data Source</label>
            <div className="caf-custom-field-data-container caf-filter-module-cf-cont caf-checkbox-taxo-custom-field-wrapper caf-attribute-swatch-data-source">
              <div className="caf-filter-custom-field-items-wrapper">
                    <div className="module-content-tab-row caf-design-two-half">
                      <Tooltip
                        classNames={{ root: "caf-builder-tooltip" }}
                        placement="topLeft"
                        title="Select the product attribute to show as swatches."
                      >
                        <label>Attribute</label>
                      </Tooltip>
                      <Select
                        className="caf-select-post-type caf-header-dropdown"
                        options={attributeSelectOptions}
                        onChange={handleAttributeSelect}
                        style={{ width: "100%" }}
                        value={selectedAttributeKey || "0"}
                      />
                    </div>
                    <SelectMain
                      label="Display As"
                      property="term_visual"
                      classn="caf-design-two-half"
                      options={[
                        { value: TERM_VISUAL_TEXT, label: "Text" },
                        { value: TERM_VISUAL_ICON, label: "Icon/Image" },
                        { value: TERM_VISUAL_COLOR, label: "Color" },
                      ]}
                      onSettingChange={changeInitialData}
                      data={{
                        ...settingData,
                        post_type: resolvedPostType,
                        term_visual: resolveAttributeSwatchDisplayMode({
                          ...settingData,
                          post_type: resolvedPostType,
                        }),
                      }}
                      defaultValue={resolveAttributeSwatchDisplayMode({
                        ...settingData,
                        post_type: resolvedPostType,
                      })}
                    />
                <div className="caf-filter-custom-field-single-row toggle-active">
                  <div
                    className="caf-fl-query-cf-fields-collapse-wrapper"
                    style={{ display: "flex" }}
                  >
                    {selectedAttributeKey &&
                      selectedAttributeKey !== "0" &&
                      selectedAttributeTerms?.length > 0 && (
                        <div className="caf-filter-query-multi-value-field-wrapper">
                          <div className="caf-filter-query-multi-value-results">
                            <div className="caf-attr-swatch-values-header">
                              <Tooltip
                                classNames={{ root: "caf-builder-tooltip" }}
                                placement="topLeft"
                                title="Attribute terms for this swatch. Drag the handle to reorder."
                              >
                                <label>Values</label>
                              </Tooltip>
                              {resolveAttributeSwatchDisplayMode({
                                ...settingData,
                                post_type: resolvedPostType,
                              }) === TERM_VISUAL_COLOR && (
                                <WooAttributeColorActions
                                  variant="icons"
                                  visible={canShowWooAttributeColorActions(
                                    {
                                      ...settingData,
                                      show_icon: "true",
                                      term_visual: TERM_VISUAL_COLOR,
                                    },
                                    resolvedPostType,
                                    effectiveDataSource
                                  )}
                                  importLoading={wooColorImportLoading}
                                  resetLoading={wooColorResetLoading}
                                  onImport={handleImportWooColors}
                                  onReset={handleResetWooColors}
                                />
                              )}
                            </div>
                            <DndContext
                              sensors={attributeTermDragSensors}
                              onDragEnd={handleAttributeTermDragEnd}
                            >
                              <SortableContext
                                items={attributeTermSortableIds}
                                strategy={verticalListSortingStrategy}
                              >
                                {selectedAttributeTerms.map((term) => (
                                  <SortableAttributeTermRow
                                    key={`attr-swatch-term-${selectedAttributeKey}-${term?.key}`}
                                    term={term}
                                    taxonomyKey={selectedAttributeKey}
                                    canReorder={canReorderAttributeTerms}
                                    isDisplayed={isAttributeTermDisplayed(term)}
                                    onOpenSettings={openAttributeTermIconSetting}
                                    onToggleDisplay={toggleAttributeTermDisplay}
                                    toSyntheticAttrTerm={toSyntheticAttrTerm}
                                    TermTaxonomyRowActions={TermTaxonomyRowActions}
                                  />
                                ))}
                              </SortableContext>
                            </DndContext>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
            <hr className="setting-hr-main"></hr>
          </div>
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
                        label="Show Icon"
                      />
                      </FilterLabelShowIconLockedSection>
                    )}
                  </div>
                  <FilterLabelCollapseLockedSection>
                  <div className="module-content-tab-row caf-design-two-half">
                    <SwitchMain
                      label="Enable Collapse"
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
                        label="Default Collapsed"
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

          {effectiveDataSource === "custom_field" && (
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
            className="caf-checkbox-filter-term-setting-modal caf-builder-modal"
          />

          {/* Custom Field — label */}

          <Modal
            title={labelValueCf || keyValueCf || "Edit Value"}
            open={termSettingPopUpCusFieldLabel}
            onOk={handleSaveCustomFieldLabel}
            onCancel={handleCancelCustomFieldLabel}
            className="caf-checkbox-filter-cf-label-modal caf-builder-modal"
            footer={[
              <Button key="back" onClick={handleCancelCustomFieldLabel}>
                Cancel
              </Button>,
              <Button key="save" type="primary" onClick={handleSaveCustomFieldLabel}>
                Save
              </Button>,
            ]}
          >
            {!editingAttributeTerm && (
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
            )}
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
                <label style={{ color: "red" }}>
                  {editingAttributeTerm
                    ? "Label field is required."
                    : "Both Key and Label fields are required."}
                </label>
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
            className="caf-checkbox-filter-cf-icon-modal caf-builder-modal"
          />
        </>
      ) : (
        <Skeleton active />
      )}
    </>
  );
});

export default AttributeSwatchContent;
