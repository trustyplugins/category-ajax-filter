import React, { useState, useEffect } from "react";
import { Tabs, Skeleton, Collapse, Switch, Row, Col, Tooltip } from "antd";
import SliderMain from "../common-component/SliderMain";
import SelectMain from "../common-component/SelectMain";
import ColorMain from "../common-component/ColorMain";
import AlignMain from "../common-component/AlignMain";
import BorderMain from "../common-component/BorderMain";
import BoxShadow from "../common-component/BoxShadow";
import TextMain from "../common-component/TextMain";
import apiClient from "../../../../../api/client";
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { resolvePreviewTemplateDataFromBuilderData } from "../../../../utils/builderDataAdapters";
import { collapseMainContentClass } from "../../../../utils/collapseMainContentClass";
const Filter = (props) => {
  const site_url = tc_caf_ajax.plugin_path;
  const baseUrl = site_url + "admin/google-fonts.json";
  const [loaderTab, setLoaderTab] = useState("icon");
  const [hoverSwitchText, setHoverSwitchText] = useState(false);
  const [fontFamilyArray, setFontFamilyArray] = useState("");
  const [hoverSwitchSpacing, setHoverSwitchSpacing] = useState(false);
  const [hoverSwitchPosition, setHoverSwitchPosition] = useState(false);
  const [hoverSwitchBg, setHoverSwitchBg] = useState(false);
  const [hoverSwitchAl, setHoverSwitchAl] = useState(false);
  const [hoverSwitchBr, setHoverSwitchBr] = useState(false);
  const [hoverSwitchBs, setHoverSwitchBs] = useState(false);
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    props.mainBuilderData
  );
  let filterPreviewData = previewTemplateData?.filter_preview_data;
  const commitPreviewPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data) {
      nextBuilder.common_data.preview_template_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data.filter_preview_data) {
      nextBuilder.common_data.preview_template_data.filter_preview_data = {};
    }
    mutator(nextBuilder.common_data.preview_template_data.filter_preview_data);
    props.filterPreviewStyle(nextBuilder);
  };
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await apiClient.get(baseUrl);
        if (response?.data?.items) {
          setFontFamilyArray(response.data.items);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchFonts();
  }, []);

  useEffect(() => {
    setHoverSwitchText(false);
    setHoverSwitchSpacing(false);
    setHoverSwitchPosition(false);
    setHoverSwitchBg(false);
    setHoverSwitchAl(false);
    setHoverSwitchBr(false);
    setHoverSwitchBs(false);
  }, [props.deviceSwitch]);
  const onHoverSwitchText = (checked) => {
    setHoverSwitchText((checked) => !checked);
  };
  const onHoverSwitchSpacing = (checked) => {
    setHoverSwitchSpacing((checked) => !checked);
  };
  const onHoverSwitchPosition = (checked) => {
    setHoverSwitchPosition((checked) => !checked);
  };
  const onHoverSwitchBg = (checked) => {
    setHoverSwitchBg((checked) => !checked);
  };
  const onHoverSwitchAl = (checked) => {
    setHoverSwitchAl((checked) => !checked);
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
  let styleStatePosition = "default";
  if (hoverSwitchPosition) {
    styleStatePosition = "hover";
  }
  let styleStateBg = "default";
  if (hoverSwitchBg) {
    styleStateBg = "hover";
  }
  let styleStateAl = "default";
  if (hoverSwitchAl) {
    styleStateAl = "hover";
  }
  let styleStateBr = "default";
  if (hoverSwitchBr) {
    styleStateBr = "hover";
  }
  let styleStateBs = "default";
  if (hoverSwitchBs) {
    styleStateBs = "hover";
  }
  const filterPreviewStyle = (data) => {
    commitPreviewPatch((filterPreview) => {
      Object.assign(filterPreview, data || {});
    });
  };
  let FilterItems = [
    {
      key: "1",
      label: "Sizing",
      children: (
        <div className={collapseMainContentClass("sizing")}>
          <SliderMain
            data={filterPreviewData}
            property="width"
            label="Width"
            defaultSuffix="%"
            defaultValue="100"
            onChangeStyle={filterPreviewStyle}
            deviceSwitch={props.deviceSwitch}
            style="style"
          />
          <SliderMain
            data={filterPreviewData}
            property="height"
            label="Height"
            defaultSuffix="%"
            defaultValue="100"
            onChangeStyle={filterPreviewStyle}
            deviceSwitch={props.deviceSwitch}
            style="style"
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Spacing",
      children: (
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
            <SliderMain
              data={filterPreviewData}
              property="paddingTop"
              label="Padding Top"
              defaultSuffix="px"
              defaultValue="20"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
            <SliderMain
              data={filterPreviewData}
              property="paddingRight"
              label="Padding Right"
              defaultSuffix="px"
              defaultValue="20"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
          </Row>
          <Row>
            <SliderMain
              data={filterPreviewData}
              property="paddingBottom"
              label="Padding Bottom"
              defaultSuffix="px"
              defaultValue="20"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
            <SliderMain
              data={filterPreviewData}
              property="paddingLeft"
              label="Padding Left"
              defaultSuffix="px"
              defaultValue="20"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
          </Row>
          <Row>
            <SliderMain
              data={filterPreviewData}
              property="marginTop"
              label="Margin Top"
              defaultSuffix="px"
              defaultValue="0"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
            <SliderMain
              data={filterPreviewData}
              property="marginRight"
              label="Margin Right"
              defaultSuffix="px"
              defaultValue="0"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
          </Row>
          <Row>
            <SliderMain
              data={filterPreviewData}
              property="marginBottom"
              label="Margin Bottom"
              defaultSuffix="px"
              defaultValue="0"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
            <SliderMain
              data={filterPreviewData}
              property="marginLeft"
              label="Margin Left"
              defaultSuffix="px"
              defaultValue="0"
              extraClass="colm2"
              styleState={styleStateSpacing}
              onChangeStyle={filterPreviewStyle}
              deviceSwitch={props.deviceSwitch}
              style="style"

            />
          </Row>
        </div>
      ),
    },
  ];
 
  return (
    <div className="caf-preview-design-containers-design">
        <Collapse
          //defaultActiveKey={["1"]}
          expandIconPlacement="end"
          expandIcon={({ isActive }) => (
            <CaretDownOutlined rotate={isActive ? 180 : 0} />
          )}
          items={FilterItems}
        />
    </div>
  );
};

export default Filter;


