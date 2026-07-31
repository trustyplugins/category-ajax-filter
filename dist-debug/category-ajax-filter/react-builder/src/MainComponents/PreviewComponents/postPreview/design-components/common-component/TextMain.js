import React, { useState } from "react";
import SelectMain from "./SelectMain";
import ColorMain from "./ColorMain";
import SliderMain from "./SliderMain";
import StyleMain from "./StyleMain";
import TextAlignMain from "./TextAlignMain";
import { FONT_WEIGHT_OPTIONS } from "../../../../constants/fontWeightOptions";

function TextMain(props) {
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    defaultValue,
    fonts,
    hoverSwitch,
    removeExtra=""
  } = props;

  let styleState = "default";
  if (hoverSwitch === true) {
    styleState = "hover";
  }
  else if (hoverSwitch === 'selected') {
    styleState = "selected";
  }
    else if (hoverSwitch === 'placeholder') {
    styleState = "placeholder";
  }
  else{
    styleState = "default";
  }

  const onChangeStyle = (style) => {
    props.onChangeStyle(style);
  };

  return (
    <>
    {removeExtra != "loader" && (
      <>
      <SelectMain
        data={props.data}
        onChangeStyle={props.onChangeStyle}
        property="fontFamily"
        label="Font Family"
        defaultValue="Open Sans"
        deviceSwitch={props.deviceSwitch}
        styleState={styleState}
        style={props.style}
        options={
          fonts
            ? fonts?.map((item, index) => ({
                label: item.family,
                value: item.family,
              }))
            : ""
        }
        styleTab={props?.styleTab}
        isMeta={props?.isMeta}
      ></SelectMain>

      <SelectMain
        data={props.data}
        onChangeStyle={props.onChangeStyle}
        property="fontWeight"
        label="Font Weight"
        defaultValue="400"
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        style={props.style}
        options={FONT_WEIGHT_OPTIONS}
      styleTab={props?.styleTab}
      isMeta={props?.isMeta}
      ></SelectMain>

      <StyleMain
        data={props.data}
        property="fontStyle"
        label="Font Style"
        onChangeStyle={props.onChangeStyle}
        deviceSwitch={props.deviceSwitch}
        style={props.style}
        styleState={styleState}
        styleTab={props?.styleTab}
        isMeta={props?.isMeta}
      />
      </>
      )}
      <ColorMain
        // setCheckColorPicker={props.setCheckColorPicker}
        // checkColorPicker={props.checkColorPicker}
        data={props.data}
        property="color"
        defaultValue="#333333"
        label="Color"
        onChangeStyle={props.onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        style={props.style}
        styleTab={props?.styleTab}
        isMeta={props?.isMeta}
      ></ColorMain>

      <SliderMain
        data={props.data}
        property="fontSize"
        label="Font Size"
        defaultSuffix="px"
        defaultValue="14"
        onChangeStyle={props.onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        style={props.style}
        isSlider={props?.isSlider}
        styleTab={props?.styleTab}
        isMeta={props?.isMeta}
      ></SliderMain>
  {removeExtra != "loader" && (
    <>
      <SliderMain
        data={props.data}
        property="letterSpacing"
        label="Letter Spacing"
        defaultSuffix="px"
        defaultValue="0"
        onChangeStyle={props.onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        style={props.style}
        isSlider={props?.isSlider}
        styleTab={props?.styleTab}
        isMeta={props?.isMeta}
      ></SliderMain>

      <SliderMain
        data={props.data}
        property="lineHeight"
        label="Line Height"
        defaultSuffix="px"
        defaultValue=""
        onChangeStyle={props.onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        style={props.style}
        isSlider={props?.isSlider}
        styleTab={props?.styleTab}
        isMeta={props?.isMeta}
      ></SliderMain>

      <TextAlignMain
        data={props.data}
        indexes={props.indexes}
        property="textAlign"
        label="Text Align"
        onChangeStyle={onChangeStyle}
        styleState={styleState}
        deviceSwitch={props.deviceSwitch}
        style={props.style}
        styleTab={props?.styleTab}
        isMeta={props?.isMeta}
      ></TextAlignMain>
    </>
    )}
    </>
  );
}

export default TextMain;
