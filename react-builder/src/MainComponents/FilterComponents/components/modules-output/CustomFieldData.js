import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import parse from "html-react-parser";
import { generateSkinCSS } from "../../../utils/functions";
import { resolvePreviewTemplateDataFromBuilderData } from "../../../utils/builderDataAdapters";
import { buildLayoutClassesFromStyle } from "../../../shared/buildLayoutClassesFromStyle";
import { previewDropdownResetMatchesModule } from "../../../PreviewComponents/postPreview/previewSelectedTagsClose";
import { resolveFilterShowIconSetting } from "../settingTabContent/ModuleContentData/shared/filterModuleTier";
import HorizontalScrollList from "./HorizontalScrollList";
import { isFacetTermUnavailable } from "../../../utils/facetTermAvailability";
import { usePreviewFacetCounts } from "../../../PreviewComponents/postPreview/previewFacetCountsContext";
import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
import {
  buildPreviewFacetCountKey,
  resolvePreviewTermFacetState,
  PreviewFacetCountSpan,
} from "../../../PreviewComponents/postPreview/previewFacetCounts";


const DropdownToggleIcon = ({ isOpen }) => (
  <span className="selected-icon">
    <i className={`fas ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`} />
  </span>
);

const isPredefinedTermMatched = (predefinedTerms = [], itemId) => {
  const currentTerm = predefinedTerms[0];

  if (!currentTerm?.includes("___")) {
    return false;
  }

  return currentTerm.includes(`___${itemId}`);
};

const getDropdownAllOptionLabel = (settings) => {
  const value = settings?.dropdown_data?.all_option?.value;
  return value !== "" && value !== undefined && value !== null ? value : "All";
};

function CfDropdownAllOptionItem({
  settings,
  activeTermKey,
  handleItemClick,
  textCountDropdown,
  iconTextDropdown,
}) {
  const label = getDropdownAllOptionLabel(settings);
  const icons = settings?.dropdown_data?.all_option?.icons;
  const isActive = activeTermKey === "0";

  return (
    <li
      className={`caf-terms-list-item caf-custom-field-list-item caf-dropdown-all-option caf-layout-${iconTextDropdown} ${isActive ? "caf-selected active" : ""}`}
      term-id="0"
      term-value="all"
      predefine="false"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleItemClick(e, label, "0");
      }}
    >
      {icons?.type === "icon" &&
        icons?.icon &&
        icons?.icon !== "" &&
        settings?.show_icon === "true" && (
          <i className={`fa-solid ${icons.icon} filter-before-icon`} />
        )}
      {icons?.icon &&
        icons?.type === "svg" &&
        icons?.icon !== "" &&
        settings?.show_icon === "true" && (
          <InlineSVG
            src={icons?.icon?.url}
            className="caf-inline-svg-icon"
          />
        )}
      <div className={`manage-text-lbl caf-layout-${textCountDropdown}`}>
        <span className="cf-value-name">{label}</span>
      </div>
    </li>
  );
}

function SortableItem({
  item,
  fieldKey = "",
  handleItemClick,
  settings,
  textCountDropdown, 
  iconTextDropdown,
  textCountVeritcalDropdown,
  isSelected
}) {
  const { dynamicTermCountsEnabled, facetCounts } = usePreviewFacetCounts();
  const { count: displayCount, unavailable } = resolvePreviewTermFacetState({
    dynamicTermCountsEnabled,
    facetCounts,
    countKey: buildPreviewFacetCountKey({
      dataSource: "custom_field",
      metaKey: fieldKey,
      termId: item.key,
    }),
    staticCount: item?.count,
    isSelected,
  });

  return (
    <li
      className={`caf-terms-list-item caf-custom-field-list-item caf-layout-${iconTextDropdown} ${isSelected ? "caf-selected active" : ""} ${
        unavailable ? "caf-facet-term-unavailable" : ""
      }`}
      data-key={fieldKey}
      term-id={item.key}
      term-value={item.key}
      aria-disabled={unavailable ? "true" : undefined}
      predefine={String(isPredefinedTermMatched(settings?.cf_predefined_terms, item?.key))}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (unavailable || isFacetTermUnavailable(e.currentTarget)) {
          return;
        }
        handleItemClick(e, item.value, item.key);
      }}
    >
        {item.icons?.icon && item.icons?.type === 'icon' &&
          item.icons?.icon !== "" &&
          settings?.show_icon === "true" && (
            <i className={`fa-solid ${item.icons.icon} filter-before-icon`} />
          )}
        {item.icons?.icon && item.icons?.type==='svg' && settings?.show_icon === 'true' && (
          <InlineSVG
          src={item.icons?.icon?.url}
          className="caf-inline-svg-icon"
        />
        )}
        <div className={`manage-text-lbl caf-layout-${textCountDropdown} ${textCountVeritcalDropdown}`}>
          <span className="cf-value-name">{item.label}</span>
          <PreviewFacetCountSpan settings={settings} count={displayCount} />
        </div>
        {item.icons?.icon &&
          item.icons?.position === "after" &&
          settings?.show_icon === "true" && (
              <i className={`fa-solid ${item.icons.icon} filter-after-icon`} />
            )}
    </li>
  );
}

function CfCheckboxFacetItem({
  item,
  fieldKey = "",
  settings,
  itemLayoutClasses,
  textCount,
  iconText,
  iconTextVeritcal,
  textCountVeritcal,
  isSelected,
  onToggle,
}) {
  const { dynamicTermCountsEnabled, facetCounts } = usePreviewFacetCounts();
  const { count: displayCount, unavailable } = resolvePreviewTermFacetState({
    dynamicTermCountsEnabled,
    facetCounts,
    countKey: buildPreviewFacetCountKey({
      dataSource: "custom_field",
      metaKey: fieldKey,
      termId: item.key,
    }),
    staticCount: item?.count,
    isSelected,
  });
  const showCheckboxEnabled = settings?.show_checkbox === "true";
  const showIconEnabled = settings?.show_icon === "true";
  const showCountEnabled = settings?.show_count === "true";

  return (
    <li
      className={`caf-terms-list-item caf-custom-field-list-item ${itemLayoutClasses} ${
        isSelected ? "caf-selected" : ""
      } ${showCheckboxEnabled ? "caf-show-checkbox" : "caf-hidden-checkbox"} ${
        showIconEnabled ? "caf-show-icon" : "caf-hidden-icon"
      } ${showCountEnabled ? "caf-show-count" : "caf-hidden-count"} ${
        unavailable ? "caf-facet-term-unavailable" : ""
      }`}
      data-key={fieldKey}
      term-id={item.key}
      term-value={item.key}
      aria-disabled={unavailable ? "true" : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (unavailable || isFacetTermUnavailable(e.currentTarget)) {
          return;
        }
        onToggle(item.key);
      }}
    >
      <input
        type="checkbox"
        className={`caf-taxo-input caf-cf-value-input`}
        value={item.key}
        name="caf-cf-value-input"
        style={{ display: "none" }}
        readOnly
        checked={isSelected}
        disabled={unavailable}
        data-predefined={isSelected}
      />
      {settings?.show_checkbox === "true" && (
        <span className="caf-checkbox-box"></span>
      )}
      <div className={`manage-ic-lbl caf-layout-${iconText} ${iconTextVeritcal}`}>
        {item.icons?.icon &&
          item.icons?.type === "icon" &&
          settings?.show_icon === "true" && (
            <i className={`fa-solid ${item.icons.icon} filter-before-icon`} />
          )}
        {item.icons?.icon &&
          item.icons?.type === "svg" &&
          settings?.show_icon === "true" && (
            <InlineSVG
              src={item.icons?.icon?.url}
              className="caf-inline-svg-icon"
            />
          )}
        <div className={`manage-text-lbl caf-layout-${textCount} ${textCountVeritcal}`}>
          <span className="trm-name cf-value-name">{item.label}</span>
          <PreviewFacetCountSpan settings={settings} count={displayCount} />
        </div>
        {item.icons?.icon &&
          item.icons?.position === "after" &&
          settings?.show_icon === "true" && (
            <i className={`fa-solid ${item.icons.icon} filter-after-icon`} />
          )}
      </div>
    </li>
  );
}
const CustomFieldData = ({
  settings,
  rowindex,
  columnindex,
  moduleindex,
  initialdata,
  onSettingChange,
  styleDefault,
  selectedDevice,
  moduleKey,
  mainBuilderData,
  isDragDisabled,
  selectedTermKeys,
  onToggle,
  currStep,
  selectType,
  activeTermKey,
  setActiveTermKey,
  getPredefinedTermId,
  AddSelectedTags,
  previewDefaultOverrideRef,
}) => {
  const moduleRootRef = useRef(null);
  const [active, setActive] = useState(false);
  const [selectDevice, setselectDevice] = useState(selectedDevice);
  const [selectedTags, setSelectedTags] = useState(false);
 const [seletedTermHtml, setSeletedTermHtml] = useState(() => {

  const allOption = settings?.dropdown_data?.all_option;
  const icons = allOption?.icons;
  const label = allOption?.value !== "" ? allOption?.value : "All";

  if (icons?.visibility === true && settings.show_icon === "true") {
    // FONT ICON
    if (icons?.type === "icon" && icons?.icon) {
      //console.log('yes1')
      return (
        <>
        {/* <div className="manage-ic-lbl"> */}
          <i
            className={`fa-solid ${icons.icon} filter-before-icon`}
          />
          <div className="manage-text-lbl">
            <span className="cf-value-name">{label}</span>
          </div>
        {/* </div> */}
        </>
      );
    }

    // SVG ICON
    if (icons?.type === "svg" && icons?.icon?.url) {
      return (
        <>
        {/* <div className="manage-ic-lbl"> */}
          <InlineSVG
            src={icons.icon.url}
            className="caf-inline-svg-icon"
          />
          <div className="manage-text-lbl">
            <span className="cf-value-name">{label}</span>
          </div>
        {/* </div> */}
        </>
      );
    }
  }
  // DEFAULT (NO ICON)
  return (
    <>
    {/* <div className="manage-ic-lbl"> */}
      <div className="manage-text-lbl">
        {label}
      </div>
    {/* </div> */}
    </>
  );
});

  useEffect(() => {
    setselectDevice(selectedDevice);
  }, [selectedDevice]);

  /* start for checkbox functions */

  // start flex functions for checkbox fiter

  const getResolvedFlexProperty = (styleObj,metaKey,settings) => {
    if (!styleObj) return "flex-start";
    if(metaKey === "meta1" && settings?.show_checkbox === "false"){
      return "flex-start";
    }
  
    const flexFlow = styleObj?.flexFlow;
  
    if (flexFlow === "column" || flexFlow === "column-reverse") {
      return styleObj?.alignItems ?? "flex-start";
    } else {
      return styleObj?.justifyContent ?? "flex-start";
    }
  };

  const getResolvedFlexVerticalProperty = (styleObj,metaKey,settings) => {
    if (!styleObj) return "";
      if(metaKey === "meta2" && settings?.show_checkbox === "false"){
        return "caf-layout-height-100";
      }
      if(metaKey === "meta1" && settings?.show_checkbox === "false" && settings?.show_icon === "false"){
        return "caf-layout-height-100";
      }
     return "";
  };

  const meta1Style = styleDefault?.meta1?.[selectedDevice]?.default;
  const itemLayoutClasses = buildLayoutClassesFromStyle(meta1Style);
  const iconText = getResolvedFlexProperty(styleDefault?.meta2?.[selectedDevice]?.default,"meta2",settings);
  const textCount = getResolvedFlexProperty(styleDefault?.meta1?.[selectedDevice]?.default,"meta1",settings);

  const iconTextVeritcal = getResolvedFlexVerticalProperty(styleDefault?.meta2?.[selectedDevice]?.default,"meta2",settings);
  const textCountVeritcal = getResolvedFlexVerticalProperty(styleDefault?.meta1?.[selectedDevice]?.default,"meta1",settings);

 // end flex functions for checkbox fiter

 // start flex functions for dropdown fiter
 const getResolvedFlexPropertyDropdown = (styleObj, metaKey, settings) => {
  if (!styleObj) return "flex-start";

  if (
    metaKey === "meta1" &&
    resolveFilterShowIconSetting(settings?.show_icon, settings) !== "true"
  ) {
    return "flex-start";
  }

  if (
    metaKey === "meta3" &&
    settings?.show_count !== "true" &&
    resolveFilterShowIconSetting(settings?.show_icon, settings) === "true"
  ) {
    return "flex-start";
  }

  const flexFlow = styleObj?.flexFlow;

  if (flexFlow === "column" || flexFlow === "column-reverse") {
    return styleObj?.alignItems ?? "flex-start";
  }

  return styleObj?.justifyContent ?? "flex-start";
};

const getResolvedFlexVerticalPropertyDropdown = (styleObj, metaKey, settings) => {
  if (!styleObj) return "";

  if (
    metaKey === "meta1" &&
    resolveFilterShowIconSetting(settings?.show_icon, settings) !== "true"
  ) {
    return "caf-layout-height-100";
  }

  if (
    metaKey === "meta3" &&
    settings?.show_count !== "true" &&
    resolveFilterShowIconSetting(settings?.show_icon, settings) === "true"
  ) {
    return "";
  }

  return "";
};

const iconTextDropdown = getResolvedFlexPropertyDropdown(
  styleDefault?.meta1?.[selectedDevice]?.default,
  "meta1",
  settings
);
const textCountDropdown = getResolvedFlexPropertyDropdown(
  styleDefault?.meta3?.[selectedDevice]?.default,
  "meta3",
  settings
);
const textCountVeritcalDropdown = getResolvedFlexVerticalPropertyDropdown(
  styleDefault?.meta3?.[selectedDevice]?.default,
  "meta3",
  settings
);
const selectedTextDropdown = getResolvedFlexPropertyDropdown(
  styleDefault?.meta4?.[selectedDevice]?.default,
  "meta4",
  settings
);
const selectedTextVerticalDropdown = getResolvedFlexVerticalPropertyDropdown(
  styleDefault?.meta4?.[selectedDevice]?.default,
  "meta4",
  settings
);

const selectedBox = styleDefault?.selectmeta?.[selectedDevice]?.default?.justifyContent ?? 'space-between';

 // end flex functions for dropdown fiter

  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    mainBuilderData
  );

  let dndColDataData = [
    ...(previewTemplateData?.misc_preview_data?.dnd_column_data || []),
  ];
  useEffect(() => {
    if (settings.preview_state === "selected") {
      document
        .querySelectorAll(".caf-bl-filter .caf-cf-value-input")
        .forEach((cb) => {
          cb.checked = true;
          cb.closest("li")?.classList.add("caf-selected");
        });
    }
  }, [settings.preview_state]);

  useEffect(() => {
    if (settings.multiple_term === "false") {
      const checkboxes = document.querySelectorAll(
        ".caf-bl-filter .caf-row-" +
          rowindex +
          " .caf-column-" +
          columnindex +
          " .caf-module-" +
          moduleindex +
          " .caf-custom-field-list.caf-checkbox" +
          " .caf-cf-value-input",
      );
      checkboxes.forEach(function (cb) {
        cb.checked = false;
        cb.style = "";
        let li = cb.closest("li");
        li.style = "";
        li?.classList.remove("caf-selected");
      });
    }
  }, [settings.multiple_term]);
  let selectedTagData = dndColDataData
    .flatMap((col) => col.data || [])
    .find((item) => item.key === "selected");

  // const AddSelectedTags = () => {
  //   const elementExists = document.querySelector(
  //     ".caf-builder-template-preview-selected-tags-container",
  //   );
  //   if (elementExists) {
  //     const checkboxes = document.querySelectorAll(
  //       ".caf-bl-filter " + " .caf-custom-field-list" + " .caf-cf-value-input",
  //     );
  //     let selectedTagsArr = [];
  //     if (checkboxes) {
  //       checkboxes.forEach((checkbox) => {
  //         if (checkbox.checked) {
  //           let label = checkbox.parentNode;
  //           let labelText = label.textContent || label.innerText;
  //           selectedTagsArr.push(labelText);
  //         }
  //       });
  //     }
  //     const DropdownFilterSelected = document.querySelectorAll(
  //       ".caf-bl-filter .caf-selected-term-main .result",
  //     );
  //     if (DropdownFilterSelected) {
  //       DropdownFilterSelected.forEach((selected) => {
  //         const selectedMain = selected.closest(".caf-selected-term-main");
  //         if (selectedMain?.classList?.contains("caf-all-selected")) {
  //           return;
  //         }
  //         let labelText = selected.textContent || selected.innerText;
  //         selectedTagsArr.push(labelText);
  //       });
  //     }
  //     let htmlData = "";
  //     if (selectedTagsArr.length > 0) {
  //       htmlData = selectedTagsArr
  //         .map(function (item) {
  //           let closeBtn = "";
  //           if (selectedTagData?.settings?.close_button === "true") {
  //             closeBtn =
  //               '<span class="caf-builder-template-preview-selected-tag-close-btn">' +
  //               '<i class="fa fa-times" aria-hidden="true"></i>' +
  //               "</span>";
  //           }

  //           return (
  //             '<li class="caf-builder-template-preview-selected-tag-single-item">' +
  //             closeBtn +
  //             '<span class="caf-builder-template-preview-selected-tag-term-name">' +
  //             item +
  //             "</span>" +
  //             "</li>"
  //           );
  //         })
  //         .join("");
  //     } else {
  //       htmlData = "";
  //     }

  //     const styleTag = elementExists.querySelector("style");
  //     elementExists.innerHTML = htmlData;
  //     if (styleTag) {
  //       elementExists.append(styleTag);
  //     }

  //     //elementExists.innerHTML = htmlData;
  //     // const listItem = elementExists.querySelector('.caf-builder-template-preview-selected-tags-list-items');
  //     // if (listItem) {
  //     //   listItem.innerHTML = htmlData;
  //     // }
  //   }
  // };
  useEffect(() => {
    if (selectedTags === true) {
      AddSelectedTags();
    }
  }, [
    selectedTagData?.settings?.is_enable,
    selectedTagData?.settings?.close_button,
  ]);

  // const checkboxSkinsStyling = (e, skin, filterType) => {
  //   const checkbox = e.target;
  //   const li = checkbox.closest("li");

  //   // Single select logic (already correct)
  //   if (settings.multiple_term === "false") {
  //     const checkboxes = document.querySelectorAll(
  //       ".caf-bl-filter .caf-row-" +
  //         rowindex +
  //         " .caf-column-" +
  //         columnindex +
  //         " .caf-module-" +
  //         moduleindex +
  //         " .caf-custom-field-list." +
  //         filterType +
  //         " .caf-cf-value-input",
  //     );

  //     checkboxes.forEach((cb) => {
  //       if (cb !== checkbox) {
  //         cb.checked = false;
  //         cb.closest("li")?.classList.remove("caf-selected");
  //       }
  //     });
  //   }

  //   // 🔥 SELECTED STATE HANDLING
  //   if (checkbox.checked) {
  //     li.classList.add("caf-selected");
  //   } else {
  //     li.classList.remove("caf-selected");
  //   }

  //   AddSelectedTags();
  // };
  /* end checkbox functions*/

  const hasCfAnyValue = () => {
    return settings?.custom_field_data?.some(
      (item) => item?.custom_field_value_list?.length > 0,
    );
  };
  /* start dropdown function */

  const buildCustomFieldDropdownResultContent = (item) => (
    <>
      {item.icons?.icon && item.icons?.type === "icon" && settings?.show_icon === "true" && (
        <i className={`fa-solid ${item.icons.icon} filter-before-icon`} />
      )}
      {item.icons?.icon && item.icons?.type === "svg" && settings?.show_icon === "true" && (
        <InlineSVG src={item.icons?.icon?.url} className="caf-inline-svg-icon" />
      )}
      <div className={`manage-text-lbl caf-layout-${selectedTextDropdown} ${selectedTextVerticalDropdown}`}>
        <span className="cf-value-name">{item.label}</span>
      </div>
    </>
  );

  useEffect(() => {
    if (selectType !== "post-preview" || currStep !== "3" || moduleKey !== "dropdown_filter") {
      return;
    }
    if (previewDefaultOverrideRef?.current) {
      return;
    }
    if (settings?.data_source !== "custom_field") {
      return;
    }

    const termId = getPredefinedTermId(settings?.cf_predefined_terms || []);
    if (!termId || termId === "0") {
      return;
    }

    for (const cfGroup of settings?.custom_field_data || []) {
      const matchedItem = (cfGroup?.custom_field_value_list || []).find(
        (item) => String(item?.key) === String(termId)
      );
      if (!matchedItem) {
        continue;
      }

      setActiveTermKey(String(termId));
      setSeletedTermHtml(buildCustomFieldDropdownResultContent(matchedItem));
      setTimeout(() => {
        AddSelectedTags?.();
      }, 0);
      return;
    }
  }, [
    selectType,
    currStep,
    moduleKey,
    settings?.data_source,
    settings?.cf_predefined_terms,
    settings?.custom_field_data,
  ]);

  const applyCfAllOptionDisplayHtml = () => {
    const allOption = settings?.dropdown_data?.all_option;
    const icons = allOption?.icons;
    const label = allOption?.value !== "" ? allOption?.value : "All";

    if (icons?.visibility === true && settings.show_icon === "true") {
      if (icons?.type === "icon" && icons?.icon) {
        setSeletedTermHtml(
          <>
            <i className={`fa-solid ${icons.icon} filter-before-icon`} />
            <div className="manage-text-lbl">
              <span className="cf-value-name">{label}</span>
            </div>
          </>
        );
        return;
      }
      if (icons?.type === "svg" && icons?.icon?.url) {
        setSeletedTermHtml(
          <>
            <InlineSVG src={icons.icon.url} className="caf-inline-svg-icon" />
            <div className="manage-text-lbl">
              <span className="cf-value-name">{label}</span>
            </div>
          </>
        );
        return;
      }
    }

    setSeletedTermHtml(
      <div className="manage-text-lbl">
        {label}
      </div>
    );
  };

  useEffect(() => {
    if (moduleKey !== "dropdown_filter") {
      return;
    }
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    const resetDropdownToAll = (event) => {
      if (
        !previewDropdownResetMatchesModule(
          event?.detail || {},
          rowindex,
          columnindex,
          moduleindex
        )
      ) {
        return;
      }
      if (previewDefaultOverrideRef) {
        previewDefaultOverrideRef.current = true;
      }
      const dropdownRoot = moduleRootRef.current?.closest(
        ".caf_module_dropdown_filter"
      );
      if (dropdownRoot) {
        dropdownRoot.setAttribute("data-active-term-key", "0");
        const selectedMain = dropdownRoot.querySelector(".caf-selected-term-main");
        if (selectedMain) {
          selectedMain.classList.add("caf-all-selected");
        }
      }
      setActiveTermKey("0");
      setActive(false);
      applyCfAllOptionDisplayHtml();
      window.setTimeout(() => {
        AddSelectedTags?.();
      }, 80);
    };

    scopeDocument.addEventListener("caf-preview-reset-dropdown", resetDropdownToAll);
    return () => {
      scopeDocument.removeEventListener("caf-preview-reset-dropdown", resetDropdownToAll);
    };
  }, [moduleKey, rowindex, columnindex, moduleindex]);

  const handleArrow = (arrow) => {
    if (arrow == "up") {
      setActive(false);
    } else {
      setActive(true);
    }
  };
   const containsHTML = (str) => {
    // Check if the string contains HTML tags
    const div = document.createElement("div");
    div.innerHTML = str;
    return Array.from(div.childNodes).some((node) => node.nodeType === 1); // Node.ELEMENT_NODE === 1
  };

  const findCustomFieldItemByKey = (termKey) => {
    for (const cfGroup of settings?.custom_field_data || []) {
      const matchedItem = (cfGroup?.custom_field_value_list || []).find(
        (item) => String(item?.key) === String(termKey)
      );
      if (matchedItem) {
        return matchedItem;
      }
    }
    return null;
  };

  const handleItemClick = (e, val, termKey = "0") => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (e?.stopPropagation) {
      e.stopPropagation();
    }

    if (previewDefaultOverrideRef) {
      previewDefaultOverrideRef.current = true;
    }

    const normalizedTermKey = String(termKey ?? "0");
    setActiveTermKey(normalizedTermKey);
    setActive(false);

    if (normalizedTermKey === "0") {
      applyCfAllOptionDisplayHtml();
    } else {
      const matchedItem = findCustomFieldItemByKey(normalizedTermKey);
      if (matchedItem) {
        setSeletedTermHtml(buildCustomFieldDropdownResultContent(matchedItem));
      }
    }

    setSelectedTags(true);
    setTimeout(() => {
      AddSelectedTags?.();
    }, 100);
  };

  /* end drop dropdown function */
  return (
    <>
      {(moduleKey === "checkbox_filter" ||
        moduleKey === "woo_attribute_swatch") && (
      <>
      {settings?.custom_field_data?.length > 0 &&
      hasCfAnyValue() ? (
        <HorizontalScrollList
          className={
            moduleKey === "woo_attribute_swatch"
              ? "caf-terms-list caf-custom-field-list caf-attribute-swatch"
              : "caf-terms-list caf-custom-field-list caf-checkbox"
          }
          dataSource="custom_field"
          categoryRelation={settings?.category_relation ?? "OR"}
          multipleTerm={settings?.multiple_term ?? "false"}
        >
          {settings?.custom_field_data.map((cfItem, cfIndex) => (
            <>
              {cfItem?.custom_field_value_list?.map((item) => (
                <React.Fragment key={item.key}>
                  <CfCheckboxFacetItem
                    item={item}
                    fieldKey={cfItem?.custom_field_key ?? ""}
                    settings={settings}
                    itemLayoutClasses={itemLayoutClasses}
                    textCount={textCount}
                    iconText={iconText}
                    iconTextVeritcal={iconTextVeritcal}
                    textCountVeritcal={textCountVeritcal}
                    isSelected={selectedTermKeys.includes(String(item.key))}
                    onToggle={onToggle}
                  />
                </React.Fragment>
              ))}
            </>
          ))}
        </HorizontalScrollList>
      ) : (
        <p>No Data Found</p>
      )}
      </>
      )}
      {moduleKey === "dropdown_filter" && (
      <>
      {settings?.custom_field_data?.length > 0 &&
      hasCfAnyValue() ? (
          <ul
            ref={moduleRootRef}
            className="caf-terms-list caf-custom-field-list dropdown"
            data-source="custom_field"
            category-relation={settings?.category_relation ?? "OR"}
            multiple-term={settings?.multiple_term ?? "false"}
          >
            <li
              className="caf-terms-list-item-wrraper"
              term-value={settings?.dropdown_data?.all_option?.value ?? "all"}
            >
              <div
                className={`caf-selected-term-main ${
                  activeTermKey === "0" ? "caf-all-selected" : ""
                }`}
                onClick={() => handleArrow(active ? "up" : "down")}
              >
                <div
                  key={settings?.dropdown_data?.all_option?.value ?? "all"}
                  className={`result caf-layout-${selectedBox}`}
                >
                  {containsHTML(seletedTermHtml)
                    ? parse(seletedTermHtml)
                    : seletedTermHtml}
                </div>
                <DropdownToggleIcon isOpen={active} />
              </div>
              <ul
                style={{ display: active ? "flex" : "none" }}
                className="caf-dropdown-child"
              >
                {hasCfAnyValue() && (
                  <CfDropdownAllOptionItem
                    key="caf-dropdown-all-option"
                    settings={settings}
                    activeTermKey={activeTermKey}
                    handleItemClick={handleItemClick}
                    textCountDropdown={textCountDropdown}
                    iconTextDropdown={iconTextDropdown}
                  />
                )}
                {settings?.custom_field_data?.map((items, cfIndex) => {
                  return (
                    <>
                      {items?.custom_field_value_list.length > 0 && (
                        <>
                          {items?.custom_field_value_list.map((item, ind) => (
                            <SortableItem
                              key={String(item.key)}
                              item={item}
                              fieldKey={items?.custom_field_key ?? ""}
                              handleItemClick={handleItemClick}
                              settings={settings}
                              textCountDropdown={textCountDropdown}
                              iconTextDropdown={iconTextDropdown}
                              textCountVeritcalDropdown={textCountVeritcalDropdown}
                              isSelected={activeTermKey === String(item.key)}
                            />
                          ))}
                        </>
                      )}
                    </>
                  );
                })}
              </ul>
            </li>
          </ul>
    ) : (
        <p>No Data Found</p>
      )}
      </>
      )}
    </>
  );
};

export default CustomFieldData;
