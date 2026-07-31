import React, { useState } from "react";
import SelectMain from "./SelectMain";
import ColorMain from "./ColorMain";
import SliderMain from "./SliderMain";
import StyleMain from "./StyleMain";
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
  const { type, rowindex, columnindex, moduleindex,module } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    fonts,
    styleTab,
    hoverSwitch,
    isMeta = 'header'
  } = props;



  let styleState = "default";
  if (hoverSwitch === true) {
    styleState = "hover";
  }
  else if (hoverSwitch === 'selected') {
    styleState = "selected";
  }



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
        deviceSwitch={props.deviceSwitch}
        styleState={styleState}
        styleTab={props.styleTab}
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
        options={fonts ? fonts?.map((item, index) => ({
          label: item.family,
          value: item.family,
        })) : ''}
      ></SelectMain>

      <SelectMain
        data={props.data}
        indexes={props.indexes}
        onChangeStyle={onChangeStyle}
        property="fontWeight"
        label="Font Weight"
        defaultValue="400"
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        styleTab={props.styleTab}
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
        options={FONT_WEIGHT_OPTIONS}
      ></SelectMain>
      <StyleMain
        data={props.data}
        indexes={props.indexes}
        property="fontStyle"
        label="Font Style"
        onChangeStyle={onChangeStyle}
        deviceSwitch={props.deviceSwitch}
        styleTab={props.styleTab}
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
        styleState={styleState} />
      <ColorMain
        data={props.data}
        indexes={props.indexes}
        property="color"
        defaultValue="#333333"
        label="Color"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        styleTab={props.styleTab}
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
      ></ColorMain>
      <SliderMain
        data={props.data}
        indexes={props.indexes}
        property="fontSize"
        label="Font Size"
        defaultSuffix="px"
        defaultValue="14"
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        styleTab={props.styleTab}
        isSlider={true}
      ></SliderMain>
      <SliderMain
        data={props.data}
        indexes={props.indexes}
        property="letterSpacing"
        label="Letter Spacing"
        defaultSuffix="px"
        defaultValue="0"
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        styleTab={props.styleTab}
        isSlider={true}
      ></SliderMain>
      <SliderMain
        data={props.data}
        indexes={props.indexes}
        property="lineHeight"
        label="Line Height"
        defaultSuffix="px"
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
        defaultValue=""
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        styleTab={props.styleTab}
        isSlider={true}
      ></SliderMain>
      <TextAlignMain
        data={props.data}
        indexes={props.indexes}
        property="textAlign"
        label="Text Align"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        styleTab={props.styleTab}
        isMeta={type === 'module' && (module?.key === 'search') && styleTab==='input' ? 'input' :isMeta}
      ></TextAlignMain>
    </>
  );
}

export default TextMain;
