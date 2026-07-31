import React, { useEffect, useState } from "react";
import { CaretDownOutlined } from "@ant-design/icons";
import { Collapse, Col, Row, Switch,Tabs } from "antd";
import TextMain from "./common-component/TextMain";
import SliderMain from "./common-component/SliderMain";
import BorderMain from "./common-component/BorderMain";
import BoxShadow from "./common-component/BoxShadow";
import { collapseMainContentClass } from "../../../utils/collapseMainContentClass";
const CustomFieldSubTab = (props) => {
    const onChangeStyle = (style) => {
        props.onChangeStyle(style);
      };
const TabItems=[
        {
            key:"text",
            label:"Text"
        },
        {
            key:"sizing",
            label:"Sizing"
        },
        {
            key:"border",
            label:"Border"
        },
        {
            key:"boxshadow",
            label:"BoxShadow"
        }
    ]

      const [hoverSwitchText, setHoverSwitchText] = useState(false);
      const [hoverSwitchSpacing, setHoverSwitchSpacing] = useState(false);
      const [hoverSwitchBr, setHoverSwitchBr] = useState(false);
      const [hoverSwitchBs, setHoverSwitchBs] = useState(false);
      const [subStyleTab,setSubStyleTab]=useState("text");

     
      const onHoverSwitchText = (checked) => {
        setHoverSwitchText((checked) => !checked);
      };
      const onHoverSwitchSpacing = (checked) => {
        setHoverSwitchSpacing((checked) => !checked);
      };
      const onHoverSwitchBr = (checked) => {
        setHoverSwitchBr((checked) => !checked);
      };
      const onHoverSwitchBs = (checked) => {
        setHoverSwitchBs((checked) => !checked);
      };

      let styleStateSpacing = "default";
      if (hoverSwitchSpacing) {
        styleStateSpacing = "hover";
      }
      let styleStateBr = "default";
      if (hoverSwitchBr) {
        styleStateBr = "hover";
      }
      let styleStateBs = "default";
      if (hoverSwitchBs) {
        styleStateBs = "hover";
      }
      const onChangeTab=(key)=>{
        setSubStyleTab(key)
        setHoverSwitchText(false)
        setHoverSwitchSpacing(false);
        setHoverSwitchBr(false)
      }
    //console.log(props.styleTab)
  return (
    <div className="caf-builder-custom-field-sub-tab-container">
      <Tabs defaultActiveKey="text" items={TabItems} onChange={onChangeTab} className="caf-design-tabs"/>
            {subStyleTab =='text' &&
            <div className={collapseMainContentClass("text", "caf-sub-tab-inner-content text-main")}>
                <div className="hoverswitchguard">
                  <Switch
                    checkedChildren="hover"
                    unCheckedChildren="default"
                    onChange={onHoverSwitchText}
                    checked={hoverSwitchText}
                    className="hoverSwitch"
                  />
                </div>
                <TextMain
                  data={props.data}
                  indexes={props.indexes}
                  property="text"
                  label="Text"
                  onChangeStyle={onChangeStyle}
                  fonts={props.fontFamilyArray}
                  hoverSwitch={hoverSwitchText}
                  styleTab={props.styleTab}
                  deviceSwitch={props.deviceSwitch}
                ></TextMain>
              </div>
            }
            {subStyleTab =='sizing' &&
            <>
             <div className={collapseMainContentClass("sizing", "caf-sub-tab-inner-content sizing")}>
             <SliderMain
               data={props.data}
               indexes={props.indexes}
               property="width"
               label="Width"
               defaultSuffix="%"
               defaultValue="100"
               onChangeStyle={onChangeStyle}
               styleTab={props.styleTab}
               deviceSwitch={props.deviceSwitch}
             ></SliderMain>
             <SliderMain
               data={props.data}
               indexes={props.indexes}
               property="height"
               label="Height"
               defaultSuffix="%"
               defaultValue="100"
               onChangeStyle={onChangeStyle}
               styleTab={props.styleTab}
               deviceSwitch={props.deviceSwitch}
             ></SliderMain>
           </div>
           <div className={collapseMainContentClass("spacing")}>
           <div className="hoverswitchguard">
             <Switch
               checkedChildren="hover"
               unCheckedChildren="default"
               onChange={onHoverSwitchSpacing}
               checked={hoverSwitchSpacing}
               className="hoverSwitch"
             />
           </div>

           <Row className="without-border">
             {/* <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="paddingTop"
                 label="Padding Top"
                 defaultSuffix="px"
                 defaultValue="10"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col> */}
             {/* <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="paddingRight"
                 label="Padding Right"
                 defaultSuffix="px"
                 defaultValue="10"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col> */}
           </Row>
           <Row>
             {/* <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="paddingBottom"
                 label="Padding Bottom"
                 defaultSuffix="px"
                 defaultValue="10"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col> */}
             {/* <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="paddingLeft"
                 label="Padding Left"
                 defaultSuffix="px"
                 defaultValue="10"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col> */}
           </Row>
           <Row>
             {/* <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="marginTop"
                 label="Margin Top"
                 defaultSuffix="px"
                 defaultValue="0"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col> */}
             {/* <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="marginRight"
                 label="Margin Right"
                 defaultSuffix="px"
                 defaultValue="0"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col> */}
           </Row>
           <Row>
             {/* <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="marginBottom"
                 label="Margin Bottom"
                 defaultSuffix="px"
                 defaultValue="0"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col>
             <Col span={12}> */}
               <SliderMain
                 data={props.data}
                 indexes={props.indexes}
                 property="marginLeft"
                 label="Margin Left"
                 defaultSuffix="px"
                 defaultValue="0"
                 onChangeStyle={onChangeStyle}
                 extraClass="colm2"
                 styleState={styleStateSpacing}
                 styleTab={props.styleTab}
                 deviceSwitch={props.deviceSwitch}
               ></SliderMain>
             {/* </Col> */}
           </Row>
         </div>
             </>
            }
        {subStyleTab =='border' &&
           <div className={collapseMainContentClass("border", "caf-sub-tab-inner-content border")}>
           <div className="hoverswitchguard">
             <Switch
               checkedChildren="hover"
               unCheckedChildren="default"
               onChange={onHoverSwitchBr}
               checked={hoverSwitchBr}
               className="hoverSwitch"
             />
           </div>
           <BorderMain
             data={props.data}
             indexes={props.indexes}
             property="border"
             label="Border"
             onChangeStyle={onChangeStyle}
             styleState={styleStateBr}
             styleTab={props.styleTab}
             deviceSwitch={props.deviceSwitch}
           ></BorderMain>
         </div>
        }
        {subStyleTab =='boxshadow' && 
         <div className={collapseMainContentClass("box-shadow", "caf-sub-tab-inner-content boxshadow")}>
         <div className="hoverswitchguard">
           <Switch
             checkedChildren="hover"
             unCheckedChildren="default"
             onChange={onHoverSwitchBs}
             checked={hoverSwitchBs}
             className="hoverSwitch"
           />
         </div>
         <BoxShadow
          data={props.data}
          indexes={props.indexes}
          property="boxShadow"
          label="Box Shadow"
          onChangeStyle={onChangeStyle}
          styleState={styleStateBs}
          styleTab={props.styleTab}
          deviceSwitch={props.deviceSwitch}
          />
       </div>
        }

    </div>
  )
}

export default CustomFieldSubTab
