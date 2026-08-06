import React, { useState, useEffect } from "react";
import { Checkbox, Skeleton, Switch, Segmented, Tooltip } from "antd";
import apiClient from "../../../../api/client";
import SwitchMain from "./CommonComponents/SwitchMain";
import InputMain from "./CommonComponents/InputMain";
import SelectMain from "./CommonComponents/SelectMain";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import IconUpload from "./IconUpload";
import CodeEditor from "./CodeEditor";
import ContentIcons from "./ContentIcons";
import { resolvePreviewTemplateDataFromBuilderData } from "../../../utils/builderDataAdapters";
import { PaginationTypeSelect } from "../shared/previewSettingsTier";
const RESULT_COUNT_TEXT_DEFAULTS = {
  prefix: "Prefix",
  suffix: "Suffix",
};
const normalizeResultCountTextValue = (placement, value) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : RESULT_COUNT_TEXT_DEFAULTS[placement] || "Text";
};
const normalizeResultCountPrefixSuffixSettings = (settings) => {
  const nextSettings = { ...(settings || {}) };
  ["prefix", "suffix"].forEach((placement) => {
    const placementSettings = nextSettings?.[placement];
    if (!placementSettings || typeof placementSettings !== "object") return;
    if (placementSettings.is_enable === "true") {
      nextSettings[placement] = {
        ...placementSettings,
        value: normalizeResultCountTextValue(placement, placementSettings.value),
      };
    }
  });
  return nextSettings;
};
const Misc = (props) => {
  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";

  const { type, column_index, item_index, itemKey, itemData } = props?.selectedItemDnd;

  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let miscPreviewData = previewTemplateData?.misc_preview_data;
  let dndColData = miscPreviewData?.dnd_column_data;

  let OrderTypeArr = dndColData?.[column_index]?.data?.[item_index]?.settings?.['order']?.values;

  let OrderByArr = dndColData?.[column_index]?.data?.[item_index]?.settings?.['order_by']?.values;

  //const [itemData ,setItemData] = useState({});
  const [codeData, setCodeData] = useState({ cssCode: "" });
  const [selectedIcon, setSelectedIcon] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [prevNextTab, setPrevNextTab] = useState('prev');
  const [iconsArray, setIconsArray] = useState("");
  const [loading, setLoading] = useState(false);
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
    props.onSettingsChange(nextBuilder);
  };

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

  // useEffect(()=>{
  //   setLoadingMeta(true);
  //   if(type === "item"){
  //   setItemData(dndColData?.[column_index]?.data?.[item_index]);
  //   }else{
  //   setItemData({})
  //   }
  //   setTimeout(() => {
  //     setLoadingMeta(false);
  //   }, 500);
  // },[type,column_index ,item_index])



  useEffect(() => {
    setSelectedIcon(miscPreviewData.loader?.icon_data?.icon);
  }, [miscPreviewData.loader?.icon_data?.icon]);

  const onChangeData = (data) => {
    commitPreviewPatch((miscPreview) => {
      miscPreview[props.selectedModule] = data;
    });
  };

  const onChangeOrderBy = (checked, value) => {
    //const { value, checked } = e.target;
    let newArray = [...dndColData?.[column_index]?.data?.[item_index]?.settings?.['order_by']?.values];
    if (checked === true) {
      if (!newArray.includes(value)) {
        newArray.push(value);
      }
    } else {
      if (newArray.length === 1 && newArray.includes(value)) {
        return;
      }
      newArray = newArray.filter((item) => item !== value);
    }
    commitPreviewPatch((miscPreview) => {
      const updatedData = structuredClone(miscPreview.dnd_column_data || []);
      if (!updatedData?.[column_index]?.data?.[item_index]?.settings?.order_by) {
        return;
      }
      updatedData[column_index].data[item_index].settings.order_by.values = newArray;
      miscPreview.dnd_column_data = updatedData;
    });
  };
  const onChangeOrderType = (checked, value) => {
    //const { value, checked } = e.target;
    let newArray = [...dndColData?.[column_index]?.data?.[item_index]?.settings?.['order']?.values];
    if (checked === true) {
      if (!newArray.includes(value)) {
        newArray.push(value);
      }
    } else {
      if (newArray.length === 1 && newArray.includes(value)) {
        return;
      }
      newArray = newArray.filter((item) => item !== value);
    }

    commitPreviewPatch((miscPreview) => {
      const updatedData = structuredClone(miscPreview.dnd_column_data || []);
      if (!updatedData?.[column_index]?.data?.[item_index]?.settings?.order) {
        return;
      }
      updatedData[column_index].data[item_index].settings.order.values = newArray;
      miscPreview.dnd_column_data = updatedData;
    });
  };
  const handleSelectIcon = (val) => {
    setSelectedIcon(val);
    commitPreviewPatch((miscPreview) => {
      if (!miscPreview.loader) {
        miscPreview.loader = {};
      }
      if (!miscPreview.loader.icon_data) {
        miscPreview.loader.icon_data = {};
      }
      miscPreview.loader.icon_data.icon = val;
    });
  };

  const updateDndColItemSettings = (settings) => {
    commitPreviewPatch((miscPreview) => {
      const updatedData = structuredClone(miscPreview.dnd_column_data || []);
      if (!updatedData?.[column_index]?.data?.[item_index]) {
        return;
      }
      const nextSettings =
        itemKey === "result_count"
          ? normalizeResultCountPrefixSuffixSettings(settings)
          : settings;
      updatedData[column_index].data[item_index].settings = nextSettings;
      miscPreview.dnd_column_data = updatedData;
    });
  };

  const handleOrderType = (checked) => {
    let orderItems = { ...dndColData?.[column_index]?.data?.[item_index]?.settings?.['order'] };
    let orderByItems = { ...dndColData?.[column_index]?.data?.[item_index]?.settings?.['order_by'] };

    if (checked === true) {
      orderItems.is_enable = checked.toString();
    } else {
      if (orderByItems?.is_enable === "false") {
        return;
      }
      orderItems.is_enable = checked.toString();
    }
    commitPreviewPatch((miscPreview) => {
      const updatedData = structuredClone(miscPreview.dnd_column_data || []);
      if (!updatedData?.[column_index]?.data?.[item_index]?.settings) {
        return;
      }
      updatedData[column_index].data[item_index].settings.order = orderItems;
      miscPreview.dnd_column_data = updatedData;
    });
  }
  const handlePaginationMetaChange = (value, key) => {
    commitPreviewPatch((miscPreview) => {
      const updatedData = structuredClone(miscPreview.dnd_column_data || []);
      if (!updatedData?.[column_index]?.data?.[item_index]?.settings) {
        return;
      }
      updatedData[column_index].data[item_index].settings[key].type = value;
      miscPreview.dnd_column_data = updatedData;
    });
  }
  const handleOrderBy = (checked) => {
    let orderItems = { ...dndColData?.[column_index]?.data?.[item_index]?.settings?.['order'] };
    let orderByItems = { ...dndColData?.[column_index]?.data?.[item_index]?.settings?.['order_by'] };

    if (checked === true) {
      orderByItems.is_enable = checked.toString();
    } else {
      if (orderItems?.is_enable === "false") {
        return;
      }
      orderByItems.is_enable = checked.toString();
    }
    commitPreviewPatch((miscPreview) => {
      const updatedData = structuredClone(miscPreview.dnd_column_data || []);
      if (!updatedData?.[column_index]?.data?.[item_index]?.settings) {
        return;
      }
      updatedData[column_index].data[item_index].settings.order_by = orderByItems;
      miscPreview.dnd_column_data = updatedData;
    });
  }

  const onChangePrevNext = (val) => {
    setPrevNextTab(val);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }

  return (
    <div class="caf-post-preview-setting-pop-general misc">
      {loadingMeta ? (
        <Skeleton active />
      ) : (
        <>
          {/* {props.selectedModule === "container" && (
        <>
          <SelectMain
            onChangeData={onChangeData}
            defaultValue="disabled"
            data={miscPreviewData?.[props.selectedModule]}
            property="scroll_device"
            label="Scroll To Container"
            options={[
              { label: "Disabled", value: "disabled" },
              { label: "Desktop", value: "desktop" },
              { label: "Mobile", value: "mobile" },
              { label: "Desktop & Mobile", value: "desktop&mobile" },
            ]}
          />
          {miscPreviewData[props.selectedModule].scroll_device !=
            "disabled" && (
            <>
              {(miscPreviewData[props.selectedModule].scroll_device ===
                "desktop" ||
                miscPreviewData[props.selectedModule].scroll_device ===
                  "desktop&mobile") && (
                <InputMain
                  onChangeData={onChangeData}
                  defaultValue="-100"
                  data={miscPreviewData?.[props.selectedModule]}
                  property="scroll_position_desktop"
                  label="Scroll Position for Desktop"
                  type="number"
                />
              )}

              {(miscPreviewData[props.selectedModule].scroll_device ===
                "mobile" ||
                miscPreviewData[props.selectedModule].scroll_device ===
                  "desktop&mobile") && (
                <InputMain
                  onChangeData={onChangeData}
                  defaultValue="-100"
                  data={miscPreviewData?.[props.selectedModule]}
                  property="scroll_position_mobile"
                  label="Scroll Position for Mobile"
                  type="number"
                />
              )}
            </>
          )}
           <SwitchMain
            onChangeData={onChangeData}
            checked="Enable"
            unchecked="Disable"
            data={miscPreviewData?.[props.selectedModule]}
            property="nonce"
            label="Enable/Disable Nonce"
          />
          <CodeEditor
          onChangeData={onChangeData}
          data={miscPreviewData?.[props.selectedModule]}
          property="custom_css"
          label="Add Custom CSS"
          />
        </>
      )} */}
          {type === "item" && itemKey === "sorting" && item_index !== null && itemData?.settings?.is_enable === "true" && props.deviceType === "desktop" && (
            <>
              <div class="setting-manage-f-label caf-pad-20">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure order filter options.">
                  <label className="setting-label-main">Sort Order Dropdown</label>
                </Tooltip>
                {/* <SwitchMain
            onChangeData={updateDndColItemSettings}
            checked=""
            unchecked=""
            data={dndColData?.[column_index]?.data[item_index]?.settings}
            property="is_enable"
            parentKey="order"
            label="Enable"
          /> */}
                <div class={`module-content-tab-row caf-design-two-half`}>
                  <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable order option in filters.">
                    <label>Enable</label>
                  </Tooltip>
                  <Switch
                    onChange={handleOrderType}
                    checked={dndColData?.[column_index]?.data[item_index]?.settings?.order?.is_enable === "true" ? true : false}
                  />
                </div>
              </div>
              {dndColData?.[column_index]?.data?.[item_index]?.settings?.['order']?.is_enable === "true" && (
                <>
                  <div className="module-content-tab-row order-type no-pad-0">
                    {/* <label>Select Order Type</label> */}
                    <div class={`module-content-tab-row caf-design-two-half`}>
                      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Allow ascending sort direction.">
                        <label>Ascending</label>
                      </Tooltip>
                      <Switch
                        onChange={(checked) => onChangeOrderType(checked, "ASC")}
                        checked={OrderTypeArr.includes("ASC")}
                      />
                    </div>
                    <div class={`module-content-tab-row caf-design-two-half`}>
                      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Allow descending sort direction.">
                        <label>Descending</label>
                      </Tooltip>
                      <Switch
                        onChange={(checked) => onChangeOrderType(checked, "DESC")}
                        checked={OrderTypeArr.includes("DESC")}
                      />
                    </div>
                    <InputMain
                      onChangeData={updateDndColItemSettings}
                      data={dndColData?.[column_index]?.data[item_index]?.settings}
                      property="placeholder"
                      parentKey="order"
                      label="Placeholder"
                      extraClass="caf-design-two-half"
                    />
                    <SelectMain
                      onChangeData={updateDndColItemSettings}
                      data={dndColData?.[column_index]?.data[item_index]?.settings}
                      property="icon_position"
                      parentKey="order"
                      label="Drop down Icon Position"
                      extraClass="caf-design-two-half"
                      options={[
                        {
                          label: "Left",
                          value: "left",
                        },
                        {
                          label: "Right",
                          value: "right",
                        }
                      ]}
                    />
                  </div>

                </>
              )}
              <div class="setting-manage-f-label caf-pad-20">
                <hr className="setting-hr-main"></hr>
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure order-by filter options.">
                  <label className="setting-label-main">Sort By Dropdown</label>
                </Tooltip>
                {/* <SwitchMain
            onChangeData={updateDndColItemSettings}
            checked=""
            unchecked=""
            data={dndColData?.[column_index]?.data[item_index]?.settings}
            property="is_enable"
            parentKey="order_by"
            label="Enable"
          /> */}
                <div class={`module-content-tab-row caf-design-two-half`}>
                  <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable order-by option in filters.">
                    <label>Enable</label>
                  </Tooltip>
                  <Switch
                    onChange={handleOrderBy}
                    checked={dndColData?.[column_index]?.data[item_index]?.settings?.order_by?.is_enable === "true" ? true : false}
                  />
                </div>
              </div>
              {dndColData?.[column_index]?.data?.[item_index]?.settings?.['order_by']?.is_enable === "true" && (
                <div className="module-content-tab-row post-order-by no-pad-0">
                  {/* <label>Select Order By</label> */}

                  <div class={`module-content-tab-row caf-design-two-half`}>
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Allow sorting by title.">
                      <label>Title</label>
                    </Tooltip>
                    <Switch
                      onChange={(checked) => onChangeOrderBy(checked, "title")}
                      checked={OrderByArr.includes("title")}
                    />
                  </div>
                  <div class={`module-content-tab-row caf-design-two-half`}>
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Allow sorting by post ID.">
                      <label>Post ID</label>
                    </Tooltip>
                    <Switch
                      onChange={(checked) => onChangeOrderBy(checked, "ID")}
                      checked={OrderByArr.includes("ID")}
                    />
                  </div>
                  <div class={`module-content-tab-row caf-design-two-half`}>
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Allow sorting by date.">
                      <label>Date</label>
                    </Tooltip>
                    <Switch
                      onChange={(checked) => onChangeOrderBy(checked, "date")}
                      checked={OrderByArr.includes("date")}
                    />
                  </div>
                  <div class={`module-content-tab-row caf-design-two-half`}>
                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Allow random sort mode.">
                      <label>Random</label>
                    </Tooltip>
                    <Switch
                      onChange={(checked) => onChangeOrderBy(checked, "rand")}
                      checked={OrderByArr.includes("rand")}
                    />
                  </div>
                  <InputMain
                    onChangeData={updateDndColItemSettings}
                    data={dndColData?.[column_index]?.data[item_index]?.settings}
                    property="placeholder"
                    parentKey="order_by"
                    label="Placeholder"
                    extraClass="caf-design-two-half"
                  />
                  <SelectMain
                    onChangeData={updateDndColItemSettings}
                    data={dndColData?.[column_index]?.data[item_index]?.settings}
                    property="icon_position"
                    parentKey="order_by"
                    label="Drop down Icon Position"
                    extraClass="caf-design-two-half"
                    options={[
                      {
                        label: "Left",
                        value: "left",
                      },
                      {
                        label: "Right",
                        value: "right",
                      }
                    ]}
                  />
                </div>
              )}
            </>
          )}
          {type === "item" && itemKey === "selected" && item_index !== null && itemData?.settings?.is_enable === "true" && props.deviceType === "desktop" && (
            <>
              {/* <div class="setting-manage-f-label">
          <label className="setting-label-main">Selected Filter</label>
          <SwitchMain
            onChangeData={updateDndColItemSettings}
            checked=""
            unchecked=""
            data={dndColData?.[column_index]?.data[item_index]?.settings}
            property="is_enable"
            label="Enable"
            extraClass="caf-pad-20"
          />
          </div> */}
              {dndColData?.[column_index]?.data[item_index]?.settings?.is_enable == "true" && (
                <>
                  <SwitchMain
                    onChangeData={updateDndColItemSettings}
                    checked=""
                    unchecked=""
                    data={dndColData?.[column_index]?.data[item_index]?.settings}
                    property="close_button"
                    label="Show Close Button"
                  />
                </>
              )}
            </>
          )}
          {type === "item" && itemKey === "result_count" && item_index !== null && itemData?.settings?.is_enable === "true" && props.deviceType === "desktop" && (
            <>
              <div class="setting-manage-f-label">
                <label className="setting-label-main">Prefix <span className="setting-label-sub-text">(Before Count)</span></label>
                <SwitchMain
                  onChangeData={updateDndColItemSettings}
                  checked=""
                  unchecked=""
                  data={dndColData?.[column_index]?.data[item_index]?.settings}
                  property="is_enable"
                  parentKey="prefix"
                  label="Enable"
                />
              </div>
              {dndColData?.[column_index]?.data[item_index]?.settings?.prefix?.is_enable == "true" && (
                <>
                  <InputMain
                    onChangeData={updateDndColItemSettings}
                    onBlurData={(val) => normalizeResultCountTextValue("prefix", val)}
                    defaultValue=""
                    data={dndColData?.[column_index]?.data[item_index]?.settings}
                    property="value"
                    parentKey="prefix"
                    label="Prefix Text"
                    type="text"
                    extraClass="caf-design-two-half"
                  />
                </>
              )}
              <div class="setting-manage-f-label">
                <hr className="setting-hr-main"></hr>
                <label className="setting-label-main">Suffix <span className="setting-label-sub-text">(After Count)</span></label>
                <SwitchMain
                  onChangeData={updateDndColItemSettings}
                  checked=""
                  unchecked=""
                  data={dndColData?.[column_index]?.data[item_index]?.settings}
                  property="is_enable"
                  parentKey="suffix"
                  label="Enable"
                />
              </div>
              {dndColData?.[column_index]?.data[item_index]?.settings?.suffix?.is_enable == "true" && (
                <>
                  <InputMain
                    onChangeData={updateDndColItemSettings}
                    onBlurData={(val) => normalizeResultCountTextValue("suffix", val)}
                    defaultValue=""
                    data={dndColData?.[column_index]?.data[item_index]?.settings}
                    property="value"
                    parentKey="suffix"
                    label="Suffix Text"
                    type="text"
                    extraClass="caf-design-two-half"
                  />
                </>
              )}
            </>
          )}

          {type === "item" && itemKey === "pagination" && item_index !== null && itemData?.settings?.is_enable === "true" && props.deviceType === "desktop" && (
            <>
              {/* <div class="setting-manage-f-label">
          <label className="setting-label-main">Pagination</label>
          <SwitchMain
            onChangeData={updateDndColItemSettings}
            checked=""
            unchecked=""
            data={dndColData?.[column_index]?.data[item_index]?.settings}
            property="is_enable"
            label="Enable"
            extraClass="caf-pad-20"
          />
          </div> */}
              {dndColData?.[column_index]?.data[item_index]?.settings?.is_enable == "true" && (
                <>
                      <PaginationTypeSelect
                        value={
                          dndColData?.[column_index]?.data[item_index]?.settings
                            ?.pagination_type
                        }
                        onChange={(paginationType) =>
                          updateDndColItemSettings({
                            ...dndColData?.[column_index]?.data[item_index]
                              ?.settings,
                            pagination_type: paginationType,
                          })
                        }
                      />
                   
                  {(dndColData?.[column_index]?.data[item_index]?.settings?.pagination_type === "number2" ||
                    dndColData?.[column_index]?.data[item_index]?.settings?.pagination_type === "number") && (
                      <>
                        <SwitchMain
                          onChangeData={updateDndColItemSettings}
                          checked=""
                          unchecked=""
                          data={dndColData?.[column_index]?.data[item_index]?.settings}
                          property="is_enable"
                          parentKey="ellipsis"
                          label="Show Ellipsis"
                          extraClass="caf-pad-20"
                        />
                        {dndColData?.[column_index]?.data[item_index]?.settings?.ellipsis?.is_enable === "true" && (
                         
                            <InputMain
                              onChangeData={updateDndColItemSettings}
                              defaultValue=""
                              data={dndColData?.[column_index]?.data[item_index]?.settings}
                              property="value"
                              parentKey="ellipsis"
                              label="Ellipsis Symbol"
                              type="text"
                              placeholder="..."
                              extraClass="caf-design-two-half"
                            />
                          
                        )}
                      </>
                    )}
                  {(dndColData?.[column_index]?.data[item_index]?.settings?.pagination_type === "number2" ||
                    dndColData?.[column_index]?.data[item_index]?.settings?.pagination_type === "button") && (
                      <>
                      <div className="module-content-tab-row">
                        <div className="hoverswitchguard">
                          <Segmented
                            value={prevNextTab}
                            onChange={onChangePrevNext}
                            className={"hoverTabCaf caf-preview-pagi-setting"}
                            options={[
                              { label: "Previous", value: "prev" },
                              { label: "Next", value: "next" },
                            ]}
                          />
                        </div>
                        </div>
                        {loading ? (
                          <Skeleton active />
                        ) : (
                          <>
                            {prevNextTab === "prev" && (
                              <>
                                  <div className={`module-content-tab-row caf-design-two-half`}>
                                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure previous type.">
                                      <label>Type</label>
                                    </Tooltip>
                                    <Segmented
                                      value={dndColData?.[column_index]?.data?.[item_index]?.settings?.prev?.type}
                                      onChange={(value) => handlePaginationMetaChange(value, "prev")}
                                      className={"hoverTabCaf"}
                                      options={[
                                        { label: "Text", value: "text" },
                                        { label: "Icon", value: "icon" },
                                      ]}
                                    />
                                  </div>
                                {dndColData?.[column_index]?.data?.[item_index]?.settings?.prev?.type === "text" && (
                                  <InputMain
                                    onChangeData={updateDndColItemSettings}
                                    defaultValue=""
                                    data={dndColData?.[column_index]?.data[item_index]?.settings}
                                    property="text"
                                    parentKey="prev"
                                    label="Label"
                                    type="text"
                                    placeholder="Previous"
                                    extraClass="caf-design-two-half"
                                  />
                                )}
                                {dndColData?.[column_index]?.data?.[item_index]?.settings?.prev?.type === "icon" && (
                                  <div className="module-content-tab-row">
                                    {iconsArray.length > 0 ? (
                                      <ContentIcons
                                        title="Icons"
                                        labelType={"label"}
                                        moduleIcon="prev"
                                        data={dndColData?.[column_index]?.data[item_index]?.settings}
                                        iconsArray={iconsArray}
                                        onSettingChange={updateDndColItemSettings}
                                      ></ContentIcons>
                                    ) : (
                                      <Skeleton active></Skeleton>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                            {prevNextTab === "next" && (
                              <>
                                  <div className={`module-content-tab-row caf-design-two-half`}>
                                    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure next type.">
                                      <label>Type</label>
                                    </Tooltip>
                                    <Segmented
                                      value={dndColData?.[column_index]?.data?.[item_index]?.settings?.next?.type}
                                      // style={{ marginBottom: 20 }}
                                      onChange={(value) => handlePaginationMetaChange(value, "next")}
                                      className={"hoverTabCaf"}
                                      options={[
                                        { label: "Text", value: "text" },
                                        { label: "Icon", value: "icon" },
                                      ]}
                                    />
                                  </div>
                                {dndColData?.[column_index]?.data?.[item_index]?.settings?.next.type === "text" && (
                                  <InputMain
                                    onChangeData={updateDndColItemSettings}
                                    defaultValue=""
                                    data={dndColData?.[column_index]?.data[item_index]?.settings}
                                    property="text"
                                    parentKey="next"
                                    label="Label"
                                    type="text"
                                    placeholder="Next"
                                    extraClass="caf-design-two-half"
                                  />
                                )}
                                {dndColData?.[column_index]?.data?.[item_index]?.settings?.next?.type === "icon" && (
                                  <div className="module-content-tab-row">
                                    {iconsArray.length > 0 ? (
                                      <ContentIcons
                                        title="Icons"
                                        labelType={"label"}
                                        moduleIcon="next"
                                        data={dndColData?.[column_index]?.data[item_index]?.settings}
                                        iconsArray={iconsArray}
                                        onSettingChange={updateDndColItemSettings}
                                      ></ContentIcons>
                                    ) : (
                                      <Skeleton active></Skeleton>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  {dndColData?.[column_index]?.data[item_index]?.settings?.pagination_type === "load-more" && (
                    <>
                      <div className="setting-manage-f-label">
                        <InputMain
                          onChangeData={updateDndColItemSettings}
                          defaultValue=""
                          data={dndColData?.[column_index]?.data[item_index]?.settings}
                          property="text"
                          parentKey="load_more"
                          label="Load More Text"
                          type="text"
                          placeholder="Load More"
                        />
                      </div>
                      <SwitchMain
                        onChangeData={updateDndColItemSettings}
                        checked=""
                        unchecked=""
                        data={dndColData?.[column_index]?.data[item_index]?.settings}
                        property="icon_enable"
                        parentKey="load_more"
                        label="Icon"
                        extraClass="caf-pad-20"
                      />
                      {dndColData?.[column_index]?.data[item_index]?.settings?.load_more?.icon_enable === "true" && (
                        <div className="module-content-tab-row">
                          {iconsArray.length > 0 ? (
                            <ContentIcons
                              title="Icons"
                              labelType={"label"}
                              moduleIcon="load_more"
                              data={dndColData?.[column_index]?.data[item_index]?.settings}
                              iconsArray={iconsArray}
                              onSettingChange={updateDndColItemSettings}
                            ></ContentIcons>
                          ) : (
                            <Skeleton active></Skeleton>
                          )}
                        </div>
                      )}
                      {/* <div class="setting-manage-f-label ">
              <SelectMain
                onChangeData={updateDndColItemSettings}
                data={dndColData?.[column_index]?.data[item_index]?.settings}
                property="icon_position"
                label="Icon Position"
                parentKey="load_more"
                extraClass="caf-design-two-half"
                options={[
                  {
                    label:"Left",
                    value:"left",
                  },
                  {
                    label:"Right",
                    value:"right",
                  },
                ]}
                />
              </div> */}
                    </>
                  )}

                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Misc;
