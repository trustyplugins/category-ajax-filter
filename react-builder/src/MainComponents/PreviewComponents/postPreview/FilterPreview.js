import React, { useEffect, useRef, useState } from "react";
import ModuleErrorBoundary from "../../../components/ModuleErrorBoundary";
import { getModuleErrorBoundaryResetKey } from "../../../utils/moduleErrorBoundaryUtils";
import ModuleSearch from "../../FilterComponents/components/modules-output//ModuleSearch";
import ModuleReset from "../../FilterComponents/components/modules-output/ModuleReset";
import ModuleCustomTextFilter from "../../FilterComponents/components/modules-output/ModuleCustomTextFilter";
import CheckboxFilter from "../../FilterComponents/components/modules-output/CheckboxFilter";
import DropdownFilter from "../../FilterComponents/components/modules-output/DropdownFilter";
import RangeSliderFilter from "../../FilterComponents/components/modules-output/RangeSliderFilter";
import WooFilterOutput from "../../FilterComponents/components/modules-output/WooFilterOutput";
import { isWooFilterModuleKey } from "../../FilterComponents/components/woocommerce/wooFilterModuleTemplates";
import { canUseFilterModule } from "../../../tier/capabilities";
import {generateFilterRowColCSS} from "../../utils/functions";
import { normalizeColorPickerValue } from "../../utils/colorPicker";
import { ColorPicker, Skeleton } from "antd";
import {
  ArrowsAltOutlined,
  QuestionCircleOutlined,
  ShrinkOutlined,
  MobileOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import { Col, Input, Row, Slider, Select, Space } from "antd";
import { resolvePreviewTemplateDataFromBuilderData } from "../../utils/builderDataAdapters";
const { Option } = Select;
const FilterPreview = (props) => {
   //console.log("mainArea", props);
  //  const [emptySearchInput ,setEmptySearchInput] = useState(false)
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  const filterExtra =
    props.mainBuilderData?.filter_layout_data?.extra_data &&
    typeof props.mainBuilderData.filter_layout_data.extra_data === "object"
      ? props.mainBuilderData.filter_layout_data.extra_data
      : {};
  const extra_data = { ...filterExtra };
  const initialdata = Array.isArray(
    props.mainBuilderData?.filter_layout_data?.initial_data
  )
    ? props.mainBuilderData.filter_layout_data.initial_data
    : [];
  const miscPreviewExtraData = {
    ...previewTemplateData.misc_preview_data?.extra,
  };
  //console.log(miscPreviewExtraData);
  const [colorHex, setColorHex] = useState(extra_data?.bg_color);
  const [fullScreen, setFullScreen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [suffix, setSuffix] = useState(extra_data?.footerSlider?.suffix ?? "%");
  const [previewWidth, setPreviewWidth] = useState(
    extra_data?.footerSlider?.value ?? "20"
  );
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [selectedDevice, setSelectedDevice] = useState(
    props.deviceType || "desktop"
  );
  const previewRootRef = useRef(null);
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.filter_layout_data) {
      nextBuilder.filter_layout_data = {};
    }
    if (!nextBuilder.filter_layout_data.extra_data) {
      nextBuilder.filter_layout_data.extra_data = {};
    }
    mutator(nextBuilder.filter_layout_data.extra_data);
    props.updatedBuilderData(nextBuilder);
  };
  const setColorHexFun = (value) => {
    const nextColor = normalizeColorPickerValue(value);
    setColorHex(nextColor);
    commitBuilderPatch((extraDataState) => {
      extraDataState.bg_color = nextColor;
    });
  };

  // function CamelToSnake(string) {
  //   return string.replace(/([a-z]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  // }

  const handleFullScreenChange = () => {
    setFullScreen(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
  };

  useEffect(() => {
    setSelectedDevice(props.deviceType || "desktop");
  }, [props.deviceType]);

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullScreenChange
      );
    };
  }, []);
  const handleFullScreen = () => {
    var elem = document.documentElement;

    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      // Document is not in fullscreen mode, request fullscreen.
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
      }
    } else {
      // Document is in fullscreen mode, exit fullscreen.
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
    }
  };
  const onSelectChange = (val) => {
    setSuffix(val);
    commitBuilderPatch((extraDataState) => {
      if (!extraDataState.footerSlider) {
        extraDataState.footerSlider = {};
      }
      extraDataState.footerSlider.suffix = val;
    });
  };
  const onChangeSlider = (val) => {
    setPreviewWidth(val);
    commitBuilderPatch((extraDataState) => {
      if (!extraDataState.footerSlider) {
        extraDataState.footerSlider = {};
      }
      extraDataState.footerSlider.value = val;
    });
  };
  const onChangeNumber = (e) => {
    const value = e?.target?.value;
    setPreviewWidth(value);
    commitBuilderPatch((extraDataState) => {
      if (!extraDataState.footerSlider) {
        extraDataState.footerSlider = {};
      }
      extraDataState.footerSlider.value = value;
    });
  };
  const selectAfter = (
    <Select
      defaultValue={suffix}
      onChange={onSelectChange}
      value={suffix}
      options={[
        {
          value: "px",
          label: "PX",
        },
        {
          value: "%",
          label: "%",
        },
      ]}
    />
  );
  const onSelectDevice = (val) => {
    setSelectedDevice(val);
  };
  {
    /* <Select.Option value="px">PX</Select.Option>
      <Select.Option value="%">%</Select.Option> */
  }
  {
    /* </Select> */
  }

  window.onresize = function () {
    setScreenWidth(window.innerWidth);
  };

  return (
    <>
      <div
        ref={previewRootRef}
        className="caf-builder-post-preview caf-bl-filter"
        style={{ width: `${previewWidth}${suffix}` }}
      >
        {initialdata.length == 0 ? (
          <>
            <Skeleton active />
            <Skeleton active />
          </>
        ) : (
          ""
        )}



        {initialdata.map((row, rowindex) => {
          const rowStyle = row.style;
          const row_custom_class = row.settings?.custom_class;
         
          return (

            <div
              className={`caf-builder-row-main caf-row-${rowindex} ${
                row_custom_class || ""}`}
              key={rowindex}
            >
              {row.data.map((column, columnindex) => {
                const columnStyle = column.style;
                const col_custom_class = column.settings?.custom_class;

                return (
                  <div
                    className={`caf-builder-column-main caf-column-${columnindex} ${
                      col_custom_class || ""
                    }`}
                    key={columnindex}
                  >
                    {column.data?.map((module, moduleindex) => {
                      const moduleStyle = module.style;
                      const moduleSettings = module.settings;
                      return (
                        <ModuleErrorBoundary
                          key={`${rowindex}-${columnindex}-${moduleindex}`}
                          moduleKey={module.key}
                          moduleLabel={module.title || module.key}
                          resetKey={getModuleErrorBoundaryResetKey(
                            rowindex,
                            columnindex,
                            moduleindex,
                            module.key
                          )}
                        >
                          {module.key == "checkbox_filter" ? (
                            <CheckboxFilter
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                              onSettingChange={props.updatedBuilderData}
                              initialdata={initialdata}
                              mainBuilderData={props.mainBuilderData}
                              isDragDisabled={props.isDragDisabled}
                              selectType={props.selectType}
                              currStep={props.currStep}
                              setCheckboxDomLoad={props.setCheckboxDomLoad}
                            />
                          ) : module.key == "dropdown_filter" ? (
                            <DropdownFilter
                              postData={props.postData}
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                              onSettingChange={props.updatedBuilderData}
                              initialdata={initialdata}
                              mainBuilderData={props.mainBuilderData}
                              isDragDisabled={props.isDragDisabled}
                              selectType={props.selectType}
                              currStep={props.currStep}
                              setDropdownDomLoad={props.setDropdownDomLoad}
                            />
                          ) : module.key == "range_slider" ? (
                            <RangeSliderFilter
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                              mainBuilderData={props.mainBuilderData}
                            />
                          ) : isWooFilterModuleKey(module.key) ? (
                            canUseFilterModule(module.key) ? (
                            <WooFilterOutput
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                              mainBuilderData={props.mainBuilderData}
                              selectType={props.selectType}
                              setFilterModuleDomLoad={props.setFilterModuleDomLoad}
                            />
                            ) : null
                          ) : module.key == "search" ? (
                            <ModuleSearch
                              postData={props.postData}
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                              mainBuilderData={props.mainBuilderData}
                              // emptySearchInput = {props?.emptySearchInput}
                              // setEmptySearchInput={props?.setEmptySearchInput}
                            />
                          ) : module.key == "reset" ? (
                            <ModuleReset
                              postData={props.postData}
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                              mainBuilderData={props.mainBuilderData}
                            />
                          ) : module.key === "customtext" ? (
                            <ModuleCustomTextFilter
                              settings={moduleSettings}
                              styleDefault={moduleStyle}
                              module={module}
                              rowindex={rowindex}
                              columnindex={columnindex}
                              moduleindex={moduleindex}
                              selectedDevice={selectedDevice}
                            />
                          ) : (
                            module.title
                          )}
                        </ModuleErrorBoundary>
                      );
                    })}
                    <style>
                      {`
                      .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex}{
                        ${generateFilterRowColCSS(columnStyle, "default", selectedDevice)}
                      }
                      .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex}:hover{
                        ${generateFilterRowColCSS(columnStyle, "hover", selectedDevice)}
                      }
                      `}
                    </style>
                  </div>
                );
              })}
              <style>
                {`
                .caf-bl-filter .caf-row-${rowindex}{
                  ${generateFilterRowColCSS(rowStyle, "default", selectedDevice)}
                }
                .caf-bl-filter .caf-row-${rowindex}:hover{
                  ${generateFilterRowColCSS(rowStyle, "hover", selectedDevice)}
                }
              `}
              </style>
            </div>
          );
        })}



        {(props.customCSS || props.onExtraData) && (
          <style id={"custom-css"}>
            {props.customCSS || props.onExtraData}
          </style>
        )}
      </div>
    </>
  );
};

export default FilterPreview;
