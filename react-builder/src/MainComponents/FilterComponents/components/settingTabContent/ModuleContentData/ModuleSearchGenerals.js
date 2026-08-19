import React, { useState, useEffect } from "react";
import {
  Checkbox,
  Select,
  Modal,
  Button,
  Switch,
  Input,
  Descriptions,
  Segmented,
  Tooltip as AntTooltip,
} from "antd";
import SwitchMain from "./ContentComponents/SwitchMain";
import SelectMain from "./ContentComponents/SelectMain";
import apiClient from "../../../../../api/client";
import LabelIcons from "./ContentComponents/LabelIcons";
import ContentIcons1 from "./ContentComponents/ContentIcons1";
import {
  useResolvedMainBuilderData,
  getResolvedSinglePostData,
} from "./useResolvedMainBuilderData";
import {
  commitFilterModuleSettingsPatch,
  commitFilterModuleReplaceSettings,
} from "./filterSettingsSnapshot";
import { BUILDER_TOOLTIP_CLASS_NAMES } from "../../../../shared/builderTooltipProps";
import { canUseFeature } from "../../../../../tier/capabilities";
import {
  FilterLabelShowIconLockedSection,
  FilterLabelCollapseLockedSection,
  canUseLabelShowIcon,
  canUseFilterLabelCollapse,
  canUseSearchClearInput,
  canUseSearchShowIcon,
} from "./shared/filterModuleTier";
import {
  includeSmartAiSearchMode,
  getSearchModeOptions,
  SearchAiModeLockedOverlay,
  SearchAiUpsellRow,
  SearchCustomFieldControls,
  SearchVoiceControls,
} from "./searchProFeatures";
import SearchIconProPanel from "./SearchIconProPanel";
import SearchClearIconProPanel from "./SearchClearIconProPanel";

const Tooltip = ({ classNames, ...tooltipProps }) => (
  <AntTooltip
    classNames={{
      ...BUILDER_TOOLTIP_CLASS_NAMES,
      ...classNames,
    }}
    {...tooltipProps}
  />
);

const ModuleSearchGenerals = (props) => {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const mainBuilderData = useResolvedMainBuilderData(props.mainBuilderData);
  const singlePostData = getResolvedSinglePostData(mainBuilderData);
  const canUseSmartAiSearch = canUseFeature("smart_ai_search");
  const canUseSearchCustomField = canUseFeature("search_custom_field");
  const canUseVoiceSearch = canUseFeature("voice_search");

  let settingData = {
    ...props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings,
  };

  let meta_fields = singlePostData?.meta_fields;

  //console.log(meta_fields);
  
  let meta_object = [{ label: "Select Custom Field", value: "0" }];

  if (meta_fields) {
    Object.keys(meta_fields)?.map((item, i) => (
      <>{meta_object.push({ value: item, label: item })}</>
    ));
  }
  const [customfield, setCustomfield] = useState(settingData?.custom_field ?? "0");
  const [checkSearch, setCheckSearch] = useState(
    canUseSearchShowIcon()
      ? settingData?.search_icon?.is_enable !== "false"
      : false,
  );
  const [checkVoice, setVoiceSearch] = useState(
    settingData?.voice_icon?.is_enable === "false" ? false : true,
  );
  const [checkClear, setClearSearch] = useState(
    canUseSearchClearInput()
      ? settingData?.clear_icon?.is_enable !== "false"
      : false,
  );
  const [label, setLabel] = useState(settingData.search_label);
  const [placeholder, setPlaceholder] = useState(
    settingData.search_placeholder,
  );
  const [headerlabel, setHeaderlabel] = useState(
    settingData.label.is_label === "false" ? false : true,
  );
  const [toggle, setToggle] = useState({
    enable:
      canUseFilterLabelCollapse() && settingData.enable_toggle !== "false",
    close:
      canUseFilterLabelCollapse() && settingData.close_toggle !== "false",
  });
  const [haederlabelInput, setHaederlabelInput] = useState(
    settingData.label.value,
  );
  const [labelIconSwitch, setLabelIconSwitch] = useState(
    canUseLabelShowIcon() ? settingData?.label?.icons?.visibility : false,
  );
  const [position, setPosition] = useState(
    settingData?.search_icon?.position ?? "right",
  );
  const [voiceposition, setVoicePosition] = useState(
    settingData?.voice_icon?.position ?? "right",
  );
  const [clearposition, setClearPosition] = useState(
    settingData?.clear_icon?.position ?? "right",
  );
  const [iconsArray, setIconsArray] = useState("");
  const [clearVisible, setClearVisible] = useState(
    settingData?.clear_icon?.visibility ?? "type",
  );
  const [inputValue, setInputValue] = useState(
    settingData?.voice_icon?.placeholder ?? "Listing Now...",
  );
  const [source, setSource] = useState(
    settingData?.source ?? {
      everything: true,
      title: false,
      descriptions: false,
      custom_field: false,
    },
  );
  const [charLimit, setCharLimit] = useState(
    settingData?.char_limit?.is_enable === "true" ? true : false,
  );
  const [limit, setLimit] = useState(settingData?.char_limit?.limit ?? "3");
  const [searchTrigger, setSearchTrigger] = useState(
    settingData?.search_trigger ?? "enter_icon",
  );
  const [searchMode, setSearchMode] = useState(() => {
    const smartEnabled = settingData?.smart_ai_search?.is_enable === "true";
    const keywordDisabled = settingData?.keyword_search?.is_enable === "false";
    if (
      includeSmartAiSearchMode &&
      canUseSmartAiSearch &&
      keywordDisabled &&
      smartEnabled
    ) {
      return "smart_ai_search";
    }
    return "keyword_search";
  });

  const searchModeOptions = getSearchModeOptions(canUseSmartAiSearch);
  const iconPositionOptions = [
    {
      label: (
        <Tooltip placement="topLeft" title="Place the icon on the left side of the input.">
          <span>Left</span>
        </Tooltip>
      ),
      value: "left",
    },
    {
      label: (
        <Tooltip placement="topLeft" title="Place the icon on the right side of the input.">
          <span>Right</span>
        </Tooltip>
      ),
      value: "right",
    },
  ];

  const IconPositionTabs = ({ value, onChange }) => (
    <div className="hoverswitchguard">
      <Segmented
        value={value}
        style={{ marginBottom: 10 }}
        onChange={onChange}
        className="hoverTabCaf"
        options={iconPositionOptions}
      />
    </div>
  );

  //const [sourceEverything,setSourceEverything] =useState(settingData?.source_everything === "true" ? true : false)

  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";
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
  // console.log(iconsArray)
  // useEffect(() => {
  //   if (settingData?.label?.icons?.icon == "") {
  //     settingData.label.icons.visibility = false;
  //     items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //       settingData;
  //     props.onSettingChange(props.data);
  //   }
  // }, [headerlabel]);

  const handleSearch = (checked) => {
    if (!canUseSearchShowIcon()) {
      return;
    }
    setCheckSearch(checked);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.search_icon = { ...(s.search_icon || {}), is_enable: checked ? "true" : "false" };
      },
    });
  };
  const handleVoice = (checked) => {
    if (!canUseVoiceSearch) {
      return;
    }
    setVoiceSearch(checked);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.voice_icon = { ...(s.voice_icon || {}), is_enable: checked ? "true" : "false" };
      },
    });
  };
  const handleClear = (checked) => {
    if (!canUseSearchClearInput()) {
      return;
    }
    setClearSearch(checked);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.clear_icon = { ...(s.clear_icon || {}), is_enable: checked ? "true" : "false" };
      },
    });
  };

  const handleLabel = (val) => {
    setLabel(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.search_label = val;
      },
    });
  };

  const handlePlaceholder = (val) => {
    setPlaceholder(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.search_placeholder = val;
      },
    });
  };

  const changeInitialData = (data) => {
    setHeaderlabel(data.label.is_label == "false" ? false : true);
    if (data.label.is_label == "false") {
      if (data?.icons) {
        data.icons = {};
      }
    }
    if (!canUseFilterLabelCollapse()) {
      data.enable_toggle = "false";
      data.close_toggle = "false";
    }
    setToggle((prev) => ({
      ...prev,
      enable:
        canUseFilterLabelCollapse() && data.enable_toggle !== "false",
    }));
    if (!canUseFilterLabelCollapse() || data.enable_toggle === "false") {
      data.close_toggle = "false";
      setToggle((prev) => ({
        ...prev,
        close: false,
      }));
    }
    commitFilterModuleReplaceSettings({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      nextSettings: data,
    });
  };

  const handleHeaderLabel = (val) => {
    setHaederlabelInput(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.label = { ...(s.label || {}), value: val };
      },
    });
  };
  const handlePosition = (val) => {
    setPosition(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.search_icon = { ...(s.search_icon || {}), position: val };
      },
    });
  };
  const handleVoicePosition = (val) => {
    setVoicePosition(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.voice_icon = { ...(s.voice_icon || {}), position: val };
      },
    });
  };
  const handleClearPosition = (val) => {
    setClearPosition(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.clear_icon = { ...(s.clear_icon || {}), position: val };
      },
    });
  };
  const onLabelIconSwitch = (checked) => {
    if (!canUseLabelShowIcon()) {
      return;
    }
    setLabelIconSwitch(checked);
    let itm = { ...settingData?.label };
    let ic = { ...itm?.icons };
    if (checked === false) {
      ic.icon = "";
      ic.type = "icon";
      ic.position = "before-label";
    }
    ic.visibility = checked;
    itm.icons = { ...itm.icons, ...ic };
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.label = itm;
      },
    });
  };
  const onChangePlaceholder = (val) => {
    setInputValue(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.voice_icon = { ...(s.voice_icon || {}), placeholder: val };
      },
    });
  };
  const handleClearVisible = (val) => {
    setClearVisible(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.clear_icon = { ...(s.clear_icon || {}), visibility: val };
      },
    });
  };
  // const handleSearchSource1 = (val) => {
  //   setSource(val);
  //   settingData.source = val;
  //   items[rowindex].data[columnindex].data[moduleindex]["settings"] =
  //     settingData;
  //   props.onSettingChange(props.data);
  // };
  const handleCharLimit = (checked) => {
    setCharLimit(checked);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.char_limit = {
          ...(s.char_limit || {}),
          is_enable: checked ? "true" : "false",
        };
      },
    });
  };
  const onChangeLimit = (val) => {
    setLimit(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.char_limit = { ...(s.char_limit || {}), limit: val };
      },
    });
  };
  const handleSearchTrigger = (val) => {
    setSearchTrigger(val);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.search_trigger = val;
      },
    });
  };
  const handleSearchModeChange = (mode) => {
    if (
      mode === "smart_ai_search" &&
      (!includeSmartAiSearchMode || !canUseSmartAiSearch)
    ) {
      return;
    }
    setSearchMode(mode);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.smart_ai_search = {
          ...(s.smart_ai_search || {}),
          is_enable: mode === "smart_ai_search" ? "true" : "false",
        };
        s.keyword_search = {
          ...(s.keyword_search || {}),
          is_enable: mode === "keyword_search" ? "true" : "false",
        };
      },
    });
  };
  const handleSearchSource = (checked, key) => {
    if (key === "custom_field" && !canUseSearchCustomField) {
      return;
    }

  if (!checked) {
    const hasAnyOtherTrue = Object.keys(settingData?.source).some(
      (k) => k !== key && settingData?.source[k] === true
    );
    if (!hasAnyOtherTrue && key !== "everything" && settingData?.source?.everything === false) {
      return;
    }
  }

    const base = { ...(settingData?.source || {}) };
    let nextSource = { ...base };

    if(key === "everything" && checked === true){
     setSource((prev) => ({
      ...prev,
      [key]: checked,
      title: false,
      descriptions: false,
      custom_field: false
    }));
    nextSource = {
      ...nextSource,
      [key]: checked,
      title: false,
      descriptions: false,
      custom_field: false,
    };
  }else if(key === "everything" && checked === false){
    setSource((prev) => ({
      ...prev,
      [key]: checked,
      title: true,
    }));
    nextSource = {
      ...nextSource,
      [key]: checked,
      title: true,
    };
  }else{
    setSource((prev) => ({
      ...prev,
      [key]: checked,
    }));
    nextSource = { ...nextSource, [key]: checked };
  }

    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.source = { ...(s.source || {}), ...nextSource };
      },
    });
  };
  const handleChangeCf = (value) => {
    if (!canUseSearchCustomField) {
      return;
    }
    setCustomfield(value);
    commitFilterModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field = value;
      },
    });
  };
  return (
    <>
  
      <div className="module-content-tab-row smart-ai-search-row">
        <label className="setting-label-main">Search Type</label>
        <div
          className={`hoverswitchguard caf-search-type-segmented-wrap${
            includeSmartAiSearchMode && !canUseSmartAiSearch
              ? " caf-search-type-segmented-wrap--locked"
              : ""
          }`}
        >
          <Segmented
            value={searchMode}
            style={{ marginBottom: 10 }}
            onChange={handleSearchModeChange}
            className="hoverTabCaf caf-search-type-segmented"
            options={searchModeOptions}
          />
          <SearchAiModeLockedOverlay canUseSmartAiSearch={canUseSmartAiSearch} />
        </div>
        <SearchAiUpsellRow />
        <hr className="setting-hr-main"></hr>
      </div>
        {searchMode === "keyword_search" && (
          <div className="module-content-tab-row">
            <label className="setting-label-main">Search In</label>
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip placement="topLeft" title="Search across all supported fields.">
                <label>Search All Fields</label>
              </Tooltip>
              <Switch
                onChange={(val) => handleSearchSource(val, "everything")}
                checked={source?.everything}
              />
            </div>
            {!source?.everything && (
              <>
                <div className="module-content-tab-row caf-design-two-half">
                  <Tooltip placement="topLeft" title="Include post titles in keyword matching.">
                    <label>Title</label>
                  </Tooltip>
                  <Switch
                    onChange={(val) => handleSearchSource(val, "title")}
                    checked={source?.title}
                  />
                </div>
                <div className="module-content-tab-row caf-design-two-half">
                  <Tooltip placement="topLeft" title="Include post descriptions/excerpts in matching.">
                    <label>Content</label>
                  </Tooltip>
                  <Switch
                    onChange={(val) => handleSearchSource(val, "descriptions")}
                    checked={source?.descriptions}
                  />
                </div>
                <SearchCustomFieldControls
                  canUseSearchCustomField={canUseSearchCustomField}
                  source={source}
                  customfield={customfield}
                  metaObject={meta_object}
                  onToggleCustomField={handleSearchSource}
                  onChangeCustomField={handleChangeCf}
                />
              </>
            )}
            <hr className="setting-hr-main"></hr>
          </div>
        )}

      <div className="module-search-text-row">
        <label className="setting-label-main">Text Search</label>
        {canUseSearchShowIcon() ? (
          <SearchIconProPanel
            data={props.data}
            indexes={props.indexes}
            onSettingChange={props.onSettingChange}
            enabled={checkSearch}
            icons={iconsArray}
            position={position}
            onToggle={handleSearch}
            onPositionChange={handlePosition}
            IconPositionTabs={IconPositionTabs}
          />
        ) : null}

        <div className="module-content-tab-row caf-design-two-half" style={{paddingBottom: "15px"}}>
            <Tooltip placement="topLeft" title="Choose when search requests are triggered.">
              <label>Search Trigger</label>
            </Tooltip>
            <Select
              defaultValue={"0"}
              style={{
                width: "100%",
              }}
              onChange={handleSearchTrigger}
              options={[
                {
                  value: "enter_icon",
                  label: "On Enter / Icon Click",
                },
                {
                  value: "typing",
                  label: "On Typing (Live Search)",
                },
              ]}
              value={searchTrigger}
            />
          </div>

        <div className="module-search-min-characters-row">
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip placement="topLeft" title="Require a minimum number of characters before search.">
              <label>Min Characters</label>
            </Tooltip>
            <Switch onChange={handleCharLimit} checked={charLimit} />
          </div>
          {charLimit && (
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip placement="topLeft" title="Set the minimum characters required to search.">
                <label>Enter Minimum Characters Limit</label>
              </Tooltip>
              <Input
                type="number"
                value={limit}
                defaultValue={limit}
                onChange={(e) => onChangeLimit(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="module-content-tab-row caf-design-two-half">
            <Tooltip placement="topLeft" title="Text shown before the user starts typing.">
              <label>Placeholder</label>
            </Tooltip>
            <Input
              onChange={(e) => handlePlaceholder(e.target.value)}
              value={placeholder}
              placeholder={"Search..."}
            />
          </div>

        <hr className="setting-hr-main"></hr>
      </div>
      <SearchVoiceControls
        canUseVoiceSearch={canUseVoiceSearch}
        checkVoice={checkVoice}
        iconsArray={iconsArray}
        voiceposition={voiceposition}
        inputValue={inputValue}
        indexes={props.indexes}
        data={props.data}
        onSettingChange={props.onSettingChange}
        onToggleVoice={handleVoice}
        onVoicePosition={handleVoicePosition}
        onVoicePlaceholder={onChangePlaceholder}
        IconPositionTabs={IconPositionTabs}
      />

      {canUseSearchClearInput() ? (
        <SearchClearIconProPanel
          data={props.data}
          indexes={props.indexes}
          onSettingChange={props.onSettingChange}
          enabled={checkClear}
          icons={iconsArray}
          position={clearposition}
          visibility={clearVisible}
          onToggle={handleClear}
          onPositionChange={handleClearPosition}
          onVisibilityChange={handleClearVisible}
          IconPositionTabs={IconPositionTabs}
        />
      ) : null}

      
      <div className="module-content-tab-row">
        <label className="setting-label-main">Filter Label</label>
        <div className="module-content-tab-row caf-design-two-half">
        <SwitchMain
          label="Enable"
          labelTooltip="Show or hide the filter label."
          property="label"
          property2="is_label"
          onSettingChange={changeInitialData}
          data={settingData}
          currValue={settingData.label.is_label}
        />
        </div>
        {headerlabel && (
          <div
            className="caf-filter-label-inner-row"
            style={{ paddingTop: "15px" }}
          >
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip
                placement="topLeft"
                title={haederlabelInput && String(haederlabelInput).trim() !== "" ? `Current label: ${haederlabelInput}` : "Set the filter label text."}
              >
                <label>Label Text </label>
              </Tooltip>
              <Input
                onChange={(e) => handleHeaderLabel(e.target.value)}
                value={haederlabelInput}
              />
            </div>
            {iconsArray && (
              <FilterLabelShowIconLockedSection className="module-content-tab-row caf-builder-show-label-icon">
              <div className="module-content-tab-row caf-builder-show-label-icon">
                <div class="module-content-tab-row caf-design-two-half">
                  <Tooltip placement="topLeft" title="Show an icon next to the filter label.">
                    <label>Show Icon</label>
                  </Tooltip>
                  <div className="module-content-icon-switch">
                    <Switch
                      onChange={onLabelIconSwitch}
                      checked={canUseLabelShowIcon() ? labelIconSwitch : false}
                      disabled={!canUseLabelShowIcon()}
                    />
                  </div>
                </div>
                {canUseLabelShowIcon() && labelIconSwitch && (
                  <ContentIcons1
                    title="Icons"
                    data={props.data}
                    indexes={props.indexes}
                    iconsArray={iconsArray}
                    onSettingChange={props.onSettingChange}
                    tab="label"
                    type=""
                  ></ContentIcons1>
                )}
              </div>
              </FilterLabelShowIconLockedSection>
            )}
            <FilterLabelCollapseLockedSection>
            <div className="module-content-tab-row caf-design-two-half">
              <SwitchMain
                label="Enable Collapse"
                labelTooltip="Allow users to expand or collapse this filter."
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
            {/* <div className="module-content-tab-row caf-design-two-half"> */}
              {canUseFilterLabelCollapse() && toggle.enable && (
                <>
                <div className="module-content-tab-row">
                  <SelectMain
                  label="Toggle Icon Position"
                  labelTooltip="Choose where the toggle icon appears."
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
                </div>
                <div className="module-content-tab-row caf-design-two-half">
                <SwitchMain
                  label="Default Collapsed"
                  labelTooltip="Load this filter in collapsed state by default."
                  property="close_toggle"
                  onSettingChange={changeInitialData}
                  data={settingData}
                  currValue={settingData.close_toggle}
                />
                </div>
                </>
              )}
            {/* </div> */}
            </FilterLabelCollapseLockedSection>
          </div>
        )}
      </div>
     
    </>
  );
};

export default ModuleSearchGenerals;
