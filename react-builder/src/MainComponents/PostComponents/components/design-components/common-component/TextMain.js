import React, { useState,useEffect } from "react";
import SelectMain from "./SelectMain";
import StyleMain from "./StyleMain";
import ColorMain from "./ColorMain";
import SliderMain from "./SliderMain";
import {
  FontSizeOutlined,
  ItalicOutlined,
  SortDescendingOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from "@ant-design/icons";
import TextAlignMain from "./TextAlignMain";
import { Switch } from "antd";
import { FONT_WEIGHT_OPTIONS } from "../../../../constants/fontWeightOptions";

function TextMain(props) {
  const { type, rowindex, columnindex, moduleindex ,module } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    fonts,
    hoverSwitch,
    styleTab =''
  } = props;

  let fstyle = "normal";
  let trans = "inherit";
  let decor = "inherit";

  let styleState = "default";
  if (hoverSwitch) {
    styleState = "hover";
  }
  

 
  const [labelStatus,setLabelStatus]=useState("false");

  useEffect(()=>{
    if(module.key =='customfield'){
      if(module.settings?.label?.is_label == 'true'){
        setLabelStatus('true')
      }else{
        setLabelStatus('false')
      }
    }
  },[module.settings])

  const onChangeStyle = (style) => {
    props.onChangeStyle(style);
  };
  
  return (
    <>
      <SelectMain
        data={props.data}
        indexes={props.indexes}
        onChangeStyle={onChangeStyle}
        property="fontFamily"
        label="Font Family"
        defaultValue="Open Sans"
        styleState={styleState}
        options={fonts ? fonts?.map((item, index) => ({
          label: item.family,
          value: item.family,
        })) : ''}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
      ></SelectMain>

      <SelectMain
        data={props.data}
        indexes={props.indexes}
        onChangeStyle={onChangeStyle}
        property="fontWeight"
        label="Font Weight"
        defaultValue="400"
        styleState={styleState}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
        options={FONT_WEIGHT_OPTIONS}
      ></SelectMain>
        <StyleMain
        data={props.data}
        indexes={props.indexes}
        property="fontStyle"
        label="Font Style"
        onChangeStyle={onChangeStyle}
        deviceSwitch={props.deviceSwitch}
        styleTab={styleTab}
        styleState={styleState} />
      <ColorMain
        data={props.data}
        indexes={props.indexes}
        property="color"
        defaultValue="#333333"
        label="Color"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
      ></ColorMain>
      {/* {styleTab!="" && module?.key === "customfield" &&(
        <ColorMain
        data={props.data}
        indexes={props.indexes}
        property="backgroundColor"
        defaultValue="#333333"
        label="Background Color"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
      ></ColorMain>
      )} */}
      <SliderMain
        data={props.data}
        indexes={props.indexes}
        property="fontSize"
        label="Font Size"
        defaultSuffix="px"
        defaultValue="14"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
        isSlider={true}
      />
      <SliderMain
        data={props.data}
        indexes={props.indexes}
        property="letterSpacing"
        label="Letter Spacing"
        defaultSuffix="px"
        defaultValue="0"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
        isSlider={true}
      />
      <SliderMain
        data={props.data}
        indexes={props.indexes}
        property="lineHeight"
        label="Line Height"
        defaultSuffix="px"
        defaultValue=""
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
        isSlider={true}
      />
      <TextAlignMain
        data={props.data}
        indexes={props.indexes}
        property="textAlign"
        label="Text Align"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        styleTab={styleTab}
        deviceSwitch={props.deviceSwitch}
      />
  
    </>
  );
}

export default TextMain;
