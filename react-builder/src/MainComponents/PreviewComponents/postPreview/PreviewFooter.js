import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Select, Slider, Input ,ColorPicker, Space } from "antd";
import {
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined,
  EyeInvisibleFilled,
  EyeFilled
} from "@ant-design/icons"; 
import {
  resolvePostExtraDataFromBuilderData,
  resolvePreviewTemplateDataFromBuilderData,
} from "../../utils/builderDataAdapters";
import { normalizeColorPickerValue, getColorPickerModes } from "../../utils/colorPicker";
import { setBgColor } from "../../../store/builderSlice";
const PreviewFooter = (props) => {
  const dispatch = useDispatch();
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let extra_data = { ...resolvePostExtraDataFromBuilderData(props.mainBuilderData) };
  let containerStyle = {
    ...previewTemplateData.misc_preview_data?.container?.style,
  };
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [suffix, setSuffix] = useState("%");
  const [currentColor ,setCurrentColor]=useState(containerStyle?.[selectedDevice]?.default?.backgroundColor ?? extra_data?.bg_color)
  const [containerWidth,setContainerWidth]=useState(containerStyle?.[selectedDevice]?.default?.width ?? "100");
  const [fullWidthPreview,setFullWidthPreview]=useState("0");
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    mutator(nextBuilder);
    props.updatedBuilderData(nextBuilder);
    const bg = nextBuilder.post_layout_data?.extra_data?.bg_color;
    if (bg != null && bg !== "") {
      dispatch(setBgColor(bg));
    }
  };
  useEffect(() => {
    setSelectedDevice(props.deviceType || "desktop");
  }, [props.deviceType]);

  useEffect(() => {
    setCurrentColor(
      containerStyle?.[selectedDevice]?.default?.backgroundColor ?? extra_data?.bg_color
    );
    setContainerWidth(containerStyle?.[selectedDevice]?.default?.width ?? "100");
  }, [props.mainBuilderData, selectedDevice]);

  useEffect(()=>{
    if(props.popupCollapse === "0"){
    setFullWidthPreview(props.popupCollapse)
    }
  },[props.popupCollapse])
  const onEyeClick =(val)=>{
    setFullWidthPreview(val);
    if(val === "1"){
    props.updateCollapse(true);
    }else{
      props.updateCollapse(false);
    }
  }
  const onChangeSlider = (val) => {
    setContainerWidth(val);
    ChangeStyleData(val,suffix);
  };
  const handelBack = () => {
    props.setSelectType("post");
    props.setCurrStep("2");
  };

const ChangeStyleData =(val ,sufix)=>{
  commitBuilderPatch((nextBuilder) => {
    if (!nextBuilder.common_data) nextBuilder.common_data = {};
    const previewData =
      nextBuilder.common_data.preview_template_data ||
      (nextBuilder.common_data.preview_template_data = {});
    const miscPreview =
      previewData.misc_preview_data || (previewData.misc_preview_data = {});
    const container = miscPreview.container || (miscPreview.container = {});
    const style = container.style || (container.style = {});
    const deviceStyle = style[selectedDevice] || (style[selectedDevice] = {});
    const defaults = deviceStyle.default || (deviceStyle.default = {});
    defaults.width = `${val}${sufix}`;
  });
}
  
  const handleDeviceChange = (value) => {
    setSelectedDevice(value);
    props.changeDeviceType(value);
  };
  const onChangeNumber = (val) => {
    setContainerWidth(val);
    ChangeStyleData(val,suffix);
  };
  const onSelectChange = (val) => {
    setSuffix(val);
    ChangeStyleData(containerWidth,val);
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
  const setBgColorHexFun = (value) => {
    const nextColor = normalizeColorPickerValue(value);
    setCurrentColor(nextColor);
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.common_data) nextBuilder.common_data = {};
      const previewData =
        nextBuilder.common_data.preview_template_data ||
        (nextBuilder.common_data.preview_template_data = {});
      const miscPreview =
        previewData.misc_preview_data || (previewData.misc_preview_data = {});
      const container = miscPreview.container || (miscPreview.container = {});
      const style = container.style || (container.style = {});
      const deviceStyle = style[selectedDevice] || (style[selectedDevice] = {});
      const defaults = deviceStyle.default || (deviceStyle.default = {});
      defaults.backgroundColor = nextColor;

      if (!nextBuilder.post_layout_data) nextBuilder.post_layout_data = {};
      const postExtra =
        nextBuilder.post_layout_data.extra_data ||
        (nextBuilder.post_layout_data.extra_data = {});
      postExtra.bg_color = nextColor;
    });
  };

  return (
    <div className="caf-builder-template-preview-footer-container">
      <div className="caf-builder-template-preview-footer-inner">
        <div className="caf-builder-template-preview-footer-back-btn" onClick={handelBack}>Back</div>
        <div className="caf-builder-template-preview-footer-center-box">
          <div className="caf-builder-template-preview-footer-device-section">
            <Select
              value={selectedDevice}
              style={{
                width: 65,
              }}
              onChange={handleDeviceChange}
              options={[
                {
                  value: "desktop",
                  label: <DesktopOutlined />,
                },
                {
                  value: "tablet",
                  label: <TabletOutlined />,
                },
                {
                  value: "mobile",
                  label: <MobileOutlined />,
                },
              ]}
            />
          </div>
          <div className="caf-builder-template-preview-footer-slider-section">
            <Slider
              value={parseInt(containerWidth)}
              disabled={false}
              onChange={onChangeSlider}
            />
            <Space.Compact
              style={{
                margin: "0 0px 0 10px",
                width: "100%",
              }}
            >
              <Input
                value={parseInt(containerWidth)}
                onChange={(e) => onChangeNumber(e.target.value)}
                type="number"
              />
              {selectAfter}
            </Space.Compact>
            <ColorPicker
              className="footer-bg-color"
              value={currentColor}
              mode={getColorPickerModes()}
              onChange={setBgColorHexFun}
              placement="top"
            />
            {fullWidthPreview === "1" ?(
             <EyeInvisibleFilled className="eye-icon" onClick={()=>onEyeClick('0')}/>
            ):(
              <EyeFilled className="eye-icon" onClick={()=>onEyeClick('1')}/>
            )}
          </div>
        </div>
        <div className="caf-builder-template-preview-footer-next-btn"></div>
      </div>
    </div>
  );
};

export default PreviewFooter;
