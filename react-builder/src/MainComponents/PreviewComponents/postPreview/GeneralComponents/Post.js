import React, { useState, useEffect, useRef } from "react";
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
} from "@ant-design/icons";
import { Input, Select, Switch, Radio, Segmented, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import SliderMain from "../design-components/common-component/SliderMain";
import FloatingFilterSettingsPanel from "./FloatingFilterSettingsPanel";
import PreviewLoaderSettingsPanel from "./PreviewLoaderSettingsPanel";
import {
  resolvePreviewTemplateDataFromBuilderData,
  resolveFilterTypeFromBuilderData,
} from "../../../utils/builderDataAdapters";
import { getPostGridOrderbyOptions, shouldOfferWooCatalogOrderby } from "../previewSortUtils";
import { normalizeColorPickerValue } from "../../../utils/colorPicker";
import {
  canUseFloatingFilter,
  canUsePostMasonry,
  PostFilterPositionSegment,
  PreviewLoaderSettingsLockedSection,
  resolveFilterPosition,
  resolveMasonryEnabled,
  resolvePreviewLoaderData,
} from "../shared/previewSettingsTier";
import { TierLockedWrap } from "../../../../tier/TierLockedWrap";

const POSTS_PER_PAGE_DEBOUNCE_MS = 500;

const PostTab = (props) => {
   //console.table(props);
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let deviceData = {
    ...previewTemplateData.post_preview_data?.[props.selectedModule]?.device_columns,
  };
  let miscPreviewData = previewTemplateData?.misc_preview_data;
  let postPreviewData = previewTemplateData?.post_preview_data;
  let extraData = miscPreviewData?.['extra'];
  const previewLoaderData = resolvePreviewLoaderData(miscPreviewData?.loader);
 
  let paginationData = miscPreviewData?.dnd_column_data
    ?.flatMap(col => col?.data || [])
    ?.find(item => item.key === "pagination") || {};

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

  const [value, setValue] = useState(deviceData?.[props.deviceType]);
  const [perPagevalue, setPerPageValue] = useState(paginationData?.settings?.['posts_per_page'] ?? "3");
  const postsPerPageDebounceRef = useRef(null);
  const postsPerPageDraftRef = useRef(paginationData?.settings?.['posts_per_page'] ?? "3");
  const [checkMasonary, setCheckMasonary] = useState(
    resolveMasonryEnabled(miscPreviewData?.["extra"]?.["masonary"])
  );
  const masonryLocked = !canUsePostMasonry();
  const [checkFloatButton, setCheckFloatButton] = useState(getDeviceFallbackValue(extraData, props?.deviceType, 'floatButton'));
  const [disableButton, setDisableButton] = useState(true);
  const [floatButtonValue, setFloatButtonValue] = useState(getDeviceFallbackValue(extraData, props?.deviceType,'floatButtonValue'));
  const [checkFloatIcon, setCheckFloatIcon] = useState(getDeviceFallbackValue(extraData, props?.deviceType,'floatIcon'));
  const [selctedFloatIcon, setSelctedFloatIcon] = useState(getDeviceFallbackValue(extraData, props?.deviceType,'floatIconValue'));
  const [orderValue, setOrderValue] = useState(miscPreviewData?.['extra']?.['order']);
  const [orderByValue, setOrderByValue] = useState(miscPreviewData?.['extra']?.['orderby']);
  const [noResultValue, setNoResultValue] = useState(miscPreviewData?.['extra']?.['noresult']);
  const [filterPosition, setFilterposition] = useState(
    resolveFilterPosition(
      getDeviceFallbackValue(extraData, props?.deviceType, "filterPosition")
    )
  );
  const [selctedIcon, setSelctedIcon] = useState("");
  const [animationPosition, setAnimationPosition] = useState(miscPreviewData?.['extra']?.['animationPosition'] ?? "right");
  const [animationType, setAnimationType] = useState(getDeviceFallbackValue(extraData, props?.deviceType,"animationType"));
  const [overlayColor, setOverlayColor] = useState(getDeviceFallbackValue(extraData, props?.deviceType,"overlay"));
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    mutator(nextBuilder);
    props.onSettingsChange(nextBuilder);
  };

  const updateAllFloatStates = () => {
    setFilterposition(
      resolveFilterPosition(
        getDeviceFallbackValue(extraData, props?.deviceType, "filterPosition")
      )
    );
    setFloatButtonValue(getDeviceFallbackValue(extraData, props?.deviceType,'floatButtonValue'))
    setCheckFloatButton(getDeviceFallbackValue(extraData, props?.deviceType, 'floatButton'))
    setCheckFloatIcon(getDeviceFallbackValue(extraData, props?.deviceType,'floatIcon'))
    setSelctedFloatIcon(getDeviceFallbackValue(extraData, props?.deviceType,'floatIconValue'));
    setAnimationType(getDeviceFallbackValue(extraData, props?.deviceType,"animationType"))
    setOverlayColor(getDeviceFallbackValue(extraData, props?.deviceType,"overlay"))
};

  useEffect(() => {
    setSelctedIcon(miscPreviewData?.loader?.icon_data?.icon);
  }, [miscPreviewData?.loader?.icon_data?.icon]);

  useEffect(() => {
    const newValue =
      previewTemplateData.post_preview_data?.[
        props.selectedModule
      ]?.device_columns?.[props.deviceType];
    setValue(newValue);
  }, [props.deviceType, props.selectedModule, props.mainBuilderData]);

  useEffect(() => {
    if (postsPerPageDebounceRef.current) {
      clearTimeout(postsPerPageDebounceRef.current);
      postsPerPageDebounceRef.current = null;
    }
    setPerPageValue(paginationData?.settings?.['posts_per_page'] ?? "3");
    postsPerPageDraftRef.current =
      paginationData?.settings?.['posts_per_page'] ?? "3";
  }, [props.deviceType, props.mainBuilderData]);

  useEffect(
    () => () => {
      if (postsPerPageDebounceRef.current) {
        clearTimeout(postsPerPageDebounceRef.current);
      }
    },
    []
  );

  useEffect(()=>{
     updateAllFloatStates();
  },[props.deviceType])

  useEffect(() => {
    const newValue = resolveMasonryEnabled(
      previewTemplateData?.misc_preview_data?.extra?.masonary
    );
    setCheckMasonary(newValue);
  }, [props.deviceType, props.mainBuilderData]);

  useEffect(() => {
    const newValue =
      previewTemplateData?.misc_preview_data?.extra?.order;
    setOrderValue(newValue);
  }, [props.deviceType, props.mainBuilderData]);

  useEffect(() => {
    const newValue =
      previewTemplateData?.misc_preview_data?.extra?.orderby;
    setOrderByValue(newValue);
  }, [props.deviceType, props.mainBuilderData]);


  const handleAlign = (e) => {
    const value = typeof e === "string" ? e : e?.target?.value;
    //console.log(value);
    setValue(value);
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const postPreview =
        previewData.post_preview_data || (previewData.post_preview_data = {});
      const moduleData =
        postPreview[props.selectedModule] || (postPreview[props.selectedModule] = {});
      const deviceColumns =
        moduleData.device_columns || (moduleData.device_columns = {});
      deviceColumns[props.deviceType] = value;
    });
  };

  const handleRowColGap = (data) => {
    const key = "inner";
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const postPreview =
        previewData.post_preview_data || (previewData.post_preview_data = {});
      postPreview[key] = data;
    });
  };
  const resetValue = () => {
    setValue(3);
      let newData = {
      ...props.mainBuilderData,
      common_data: {
        ...props.mainBuilderData.common_data,
        preview_template_data: {
          ...previewTemplateData,
          post_preview_data: {
            ...previewTemplateData.post_preview_data,
            [props.selectedModule]: {
              ...previewTemplateData.post_preview_data?.[props.selectedModule],
              device_columns: {
                ...previewTemplateData.post_preview_data?.[props.selectedModule]
                  ?.device_columns,
                [props.deviceType]: "3",
              },
            },
          },
        },
      },
    }
     props.onSettingsChange(newData);
  }
  const onChangeDataSave = (selectedModule, key, value ) => {
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const miscPreview =
        previewData.misc_preview_data || (previewData.misc_preview_data = {});
      const moduleData =
        miscPreview[selectedModule] || (miscPreview[selectedModule] = {});
      moduleData[key] = value;
    });
  };
    const onChangeDataFloatFilterSave = (selectedModule, key, value ,childKey) => {
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const miscPreview =
        previewData.misc_preview_data || (previewData.misc_preview_data = {});
      const moduleData =
        miscPreview[selectedModule] || (miscPreview[selectedModule] = {});
      moduleData[props?.deviceType][key] = value;
    });
  };
  const handleChangeMasonary = (checked) => {
    if (!canUsePostMasonry()) {
      return;
    }
    setCheckMasonary(checked);
    onChangeDataSave('extra', 'masonary', checked);
  };
  const handleChangeFloatButton = (checked) => {
    setCheckFloatButton(checked);
    onChangeDataFloatFilterSave('extra', 'floatButton', checked);
    if (!checked) {
      setDisableButton(true);
    }
    else {
      setDisableButton(false);
    }
  };

  const handleChangeFloatIcon = (checked) => {
    setCheckFloatIcon(checked);
    onChangeDataFloatFilterSave('extra', 'floatIcon', checked);
    if (!checked) {
      setDisableButton(true);
    }
    else {
      setDisableButton(false);
    }
  };

  //console.log(disableButton);
  const handleFloatSelectIcon = (val) => {
    setSelctedFloatIcon(val);
   onChangeDataFloatFilterSave('extra', 'floatIconValue', val);
  };
  const handleFloatButton = (value) => {
    setFloatButtonValue(value);
    onChangeDataFloatFilterSave('extra', 'floatButtonValue', value);
  };
  const setColorHexFun = (value) => {
    const nextColor = normalizeColorPickerValue(value);
    setOverlayColor(nextColor);
    onChangeDataFloatFilterSave('extra', 'overlay', nextColor);
  };
  const handleOrder = (value) => {
    setOrderValue(value);
    onChangeDataSave('extra', 'order', value);
  };
  const handleOrderBy = (value) => {
    setOrderByValue(value);
    onChangeDataSave('extra', 'orderby', value);
  };
  const handleNoResult = (value) => {
    setNoResultValue(value);
    onChangeDataSave('extra', 'noresult', value);
  };
  const handleFilterPosition = (value) => {
    const nextValue = resolveFilterPosition(value);
    setFilterposition(nextValue);
    onChangeDataFloatFilterSave("extra", "filterPosition", nextValue);
  };
  const SelectAnimationPosition = (value) => {
    setAnimationPosition(value);
    onChangeDataSave('extra', 'animationPosition', value);
  };
  const SelectAnimationType = (value) => {
    setAnimationType(value);
    onChangeDataFloatFilterSave('extra', 'animationType', value);
  };
  const onChangeData = (data, moduleKey) => {
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const miscPreview =
        previewData.misc_preview_data || (previewData.misc_preview_data = {});
      miscPreview[moduleKey] = data;
    });
  };

  const handleSelectIcon = (val) => {
    setSelctedIcon(val);
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const miscPreview =
        previewData.misc_preview_data || (previewData.misc_preview_data = {});
      const loader = miscPreview.loader || (miscPreview.loader = {});
      const iconData = loader.icon_data || (loader.icon_data = {});
      iconData.icon = val;
    });
  };


  const LoaderIconStyle = (data) => {
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const miscPreview =
        previewData.misc_preview_data || (previewData.misc_preview_data = {});
      const loader = miscPreview.loader || (miscPreview.loader = {});
      loader.icon_data = data;
    });
  };
  const updatePagination = (value) => {
    const updatedData = miscPreviewData?.dnd_column_data?.map((col) => ({
      ...col,
      data: col.data?.map((item) => {
        if (item.key === "pagination") {
          return {
            ...item,
            settings: {
              ...item.settings,
              posts_per_page: value,
            },
          };
        }
        return item;
      }),
    }));
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const miscPreview =
        previewData.misc_preview_data || (previewData.misc_preview_data = {});
      miscPreview.dnd_column_data = updatedData;
    });
  };

  const handleChangePerPage = (value) => {

    let sanitizedValue = parseInt(value, 10);

    if (isNaN(sanitizedValue)) {
      sanitizedValue = 1;
    }
    if (sanitizedValue === 0) {
      sanitizedValue = 1;
    }
    if (sanitizedValue < -1) {
      sanitizedValue = 1;
    }
    
    setValue(sanitizedValue);
    postsPerPageDraftRef.current = sanitizedValue;
    setPerPageValue(sanitizedValue);
    if (postsPerPageDebounceRef.current) {
      clearTimeout(postsPerPageDebounceRef.current);
    }
    postsPerPageDebounceRef.current = setTimeout(() => {
      postsPerPageDebounceRef.current = null;
      updatePagination(sanitizedValue);
    }, POSTS_PER_PAGE_DEBOUNCE_MS);
  };

  const flushPostsPerPageCommit = () => {
    if (postsPerPageDebounceRef.current) {
      clearTimeout(postsPerPageDebounceRef.current);
      postsPerPageDebounceRef.current = null;
    }
    updatePagination(postsPerPageDraftRef.current);
  };

  return (
    <div className="caf-post-layout-preview-setting-pop-content general-tab">
      <div className="setting-manage-link">
        <div className="module-content-tab-row">
          <label>
           <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose post column count.">Columns</Tooltip>
          </label>
          <div className='caf-aligned-settings'>
            <Segmented
              style={{ marginBottom: 8 }}
              onChange={handleAlign}
              value={value}
              options={[{ value: "1", label: "1", }, { value: "2", label: "2", }, { value: "3", label: "3", }, { value: "4", label: "4", }, { value: "5", label: "5", },]}
            />
          </div>
        </div>
       
      </div>

        <div className="webflow-slider webflow-gap-slider column-row-gap-row">
          <SliderMain
            data={postPreviewData?.inner}
            property="columnGap"
            label="Column Gap"
            defaultSuffix="px"
            defaultValue="0"
            onChangeStyle={handleRowColGap}
            style="style"
            deviceSwitch={props.deviceType}
            isSlider={true}
            extraClass="module-content-tab-row caf-pad-lr-0"
          ></SliderMain>
          <SliderMain
            data={postPreviewData?.inner}
            property="rowGap"
            label="Row Gap"
            defaultSuffix="px"
            defaultValue="0"
            onChangeStyle={handleRowColGap}
            style="style"
            deviceSwitch={props.deviceType}
            isSlider={true}
            extraClass="module-content-tab-row caf-pad-lr-0"
          ></SliderMain>
        </div>
        {props?.deviceType === 'desktop' && (
          <>
          <div className="module-content-tab-row caf-design-two-half">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set how many posts load per page.">Items Per Page</Tooltip>
              
            </label>
            <Input
              type="number"
              value={perPagevalue}
              onChange={(e) => handleChangePerPage(e.target.value)}
              onBlur={flushPostsPerPageCommit}
            />
          </div>
          <TierLockedWrap
            locked={masonryLocked}
            showProBadge
            upgradeMessage="Masonry post layout is available in Category Ajax Filter Pro."
          >
            <div className="module-content-tab-row caf-design-two-half">
              <label>
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Toggle masonry layout mode.">Enable Masonry</Tooltip>
                
              </label>
              <Switch
                onChange={handleChangeMasonary}
                checked={masonryLocked ? false : checkMasonary}
                disabled={masonryLocked}
              />
            </div>
          </TierLockedWrap>
          <div className="module-content-tab-row caf-design-two-half">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set post order direction.">Sort Order</Tooltip>
            </label>
            <Select
              defaultValue="ASC"
              style={{
                width: "100%",
              }}
              onChange={handleOrder}
              value={orderValue}
              options={[
                {
                  value: "ASC",
                  label: "Asc",
                },
                {
                  value: "DESC",
                  label: "Desc",
                },
              ]}
            />
          </div>
          <div className="module-content-tab-row caf-design-two-half">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose the field used for sorting.">Sort By</Tooltip>
            </label>
            <Select
              defaultValue="title"
              style={{
                width: "100%",
              }}
              onChange={handleOrderBy}
              value={orderByValue}
              options={getPostGridOrderbyOptions(
                shouldOfferWooCatalogOrderby(props.mainBuilderData)
              )}
            />
          </div>
          <div className="module-content-tab-row caf-design-two-half">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set the empty-result message.">No Results Message</Tooltip>
            </label>
            <Input
              type="text"
              value={noResultValue}
              defaultValue={noResultValue}
              onChange={(e) => handleNoResult(e.target.value)}
            />
            
          </div>
          <hr className="setting-hr-main"></hr>
          </>
          )}
        {resolveFilterTypeFromBuilderData(props.mainBuilderData) === "true" && (
          <>
          <div className="module-content-tab-row filter-panel-row-main no-pad-0">
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure filter preview behavior.">
            <label className="setting-label-main">Filter Panel</label>
          </Tooltip>
          <div className="module-content-tab-row filter-position-row-panel">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose where the filter appears.">Filter Position</Tooltip>
            </label>
            <PostFilterPositionSegment
              onChange={handleFilterPosition}
              value={filterPosition}
              className="hoverTabCaf"
            />

          </div>
          {filterPosition === "floating" && canUseFloatingFilter() && (
            <FloatingFilterSettingsPanel
              checkFloatButton={checkFloatButton}
              handleChangeFloatButton={handleChangeFloatButton}
              floatButtonValue={floatButtonValue}
              handleFloatButton={handleFloatButton}
              checkFloatIcon={checkFloatIcon}
              handleChangeFloatIcon={handleChangeFloatIcon}
              selctedFloatIcon={selctedFloatIcon}
              handleFloatSelectIcon={handleFloatSelectIcon}
              animationType={animationType}
              SelectAnimationType={SelectAnimationType}
              overlayColor={overlayColor}
              setColorHexFun={setColorHexFun}
            />
          )}
          </div>
          <hr className="setting-hr-main"></hr>
          </>
        )}
      {props?.deviceType === "desktop" && (
          <>
          <PreviewLoaderSettingsLockedSection>
            <PreviewLoaderSettingsPanel
              previewLoaderData={previewLoaderData}
              onChangeData={onChangeData}
              handleSelectIcon={handleSelectIcon}
              selctedIcon={selctedIcon}
              LoaderIconStyle={LoaderIconStyle}
              deviceSwitch={props.deviceSwitch}
            />
          </PreviewLoaderSettingsLockedSection>
      </>
      )}
    </div >
  );
};

export default PostTab;
