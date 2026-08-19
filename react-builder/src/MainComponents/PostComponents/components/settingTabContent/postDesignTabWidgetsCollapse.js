import React from "react";
import {
  CaretDownOutlined,
  ArrowRightOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { Collapse } from "antd";
import SliderMain from "../design-components/common-component/SliderMain";
import SelectMain from "../design-components/common-component/SelectMain";
import AlignMain from "../design-components/common-component/AlignMain";
import { collapseMainContentClass } from "../../../utils/collapseMainContentClass";

/**
 * Widgets layout mode (parent passes widgets === "1"): simplified Layout + Sizing accordion.
 */
export function PostDesignTabWidgetsCollapse({
  tabProps,
  onChangeStyle,
  styleStateAl,
  hoverValue,
  handleHover,
  type,
  displayProperty
}) {
  return (
    <Collapse
      //defaultActiveKey={["1"]}
      expandIconPlacement="end"
      expandIcon={({ isActive }) => (
        <CaretDownOutlined rotate={isActive ? 180 : 0} />
      )}
      accordion={true}
      items={[
        {
          key: "1",
          label: "Layout",
          children: (
            <div className={collapseMainContentClass("layout", "webflow-sync")}>
              <>
                <AlignMain
                  data={tabProps.data}
                  indexes={tabProps.indexes}
                  property="display"
                  label="Display"
                  defaultValue="flex"
                  onChangeStyle={onChangeStyle}
                  styleState={styleStateAl}
                  //  styleState={false}
                  deviceSwitch={tabProps.deviceSwitch}
                  options={[
                    {
                      value: "block",
                      label: "Block",
                    },
                    {
                      value: "flex",
                      label: "Flex",
                    },
                  ]}
                />
                
                {displayProperty === "flex" && (
                <div className="webflow-custom-dropdown new-caf-look">
                  <AlignMain
                    data={tabProps.data}
                    indexes={tabProps.indexes}
                    property="flexFlow"
                    label="Direction"
                    defaultValue="row"
                    onChangeStyle={onChangeStyle}
                    styleState={styleStateAl}
                    deviceSwitch={tabProps.deviceSwitch}
                    options={[
                      {
                        value: "row",
                        label: <ArrowRightOutlined />,
                      },
                      {
                        value: "column",
                        label: <ArrowDownOutlined />,
                      },
                      {
                        value: 'row-reverse',
                        label: <ArrowLeftOutlined />,
                      },
                      {
                        value: 'column-reverse',
                        label: <ArrowUpOutlined />,
                      },
                    ]}
                  />
                </div>
                )}
              </>
              {displayProperty === "flex" && (
              <>
              <div className="align-flex-flow">
                <span class="flex-flow-align-label">Align</span>
                <div className="flex-align-control">
                  <SelectMain
                    data={tabProps.data}
                    indexes={tabProps.indexes}
                    property="alignItems"
                    label="X"
                    defaultValue="flex-start"
                    onChangeStyle={onChangeStyle}
                    styleState={styleStateAl}
                    deviceSwitch={tabProps.deviceSwitch}
                    class={"align-x-flex"}
                    options={[
                      {
                        value: "flex-start",
                        label: "Left",
                      },
                      {
                        value: "center",
                        label: "Center",
                      },
                      {
                        value: "flex-end",
                        label: "Right",
                      },
                      {
                        value: "stretch",
                        label: "Stretch",
                      },
                      {
                        value: "baseline",
                        label: "Baseline",
                      },
                    ]}
                  />
                  <SelectMain
                    data={tabProps.data}
                    indexes={tabProps.indexes}
                    property="justifyContent"
                    label="Y"
                    defaultValue="flex-start"
                    onChangeStyle={onChangeStyle}
                    styleState={styleStateAl}
                    // styleState={false}
                    deviceSwitch={tabProps.deviceSwitch}
                    class={"align-y-flex"}
                    options={[
                      {
                        value: "flex-end",
                        label: "Top",
                      },
                      {
                        value: "center",
                        label: "Center",
                      },
                      {
                        value: "flex-start",
                        label: "Bottom",
                      },
                      {
                        value: "space-between",
                        label: "Space between",
                      },
                      {
                        value: "space-around",
                        label: "Space around",
                      },
                      {
                        value: "space-evenly",
                        label: "Space evenly",
                      },
                    ]}
                  />
                </div>
              </div>
              <SliderMain
                data={tabProps.data}
                indexes={tabProps.indexes}
                property="gap"
                label="Gap"
                defaultSuffix="px"
                defaultValue="0"
                onChangeStyle={onChangeStyle}
                styleState={styleStateAl}
                deviceSwitch={tabProps.deviceSwitch}
                styleTab={""}
              ></SliderMain>
              </>
                )}
              <AlignMain
                data={tabProps.data}
                indexes={tabProps.indexes}
                property="float"
                label="Float"
                defaultValue="none"
                onChangeStyle={onChangeStyle}
                styleState={styleStateAl}
                //  styleState={false}
                deviceSwitch={tabProps.deviceSwitch}
                options={[
                  {
                    value: "none",
                    label: "None",
                  },
                  {
                    value: "left",
                    label: "Left",
                  },
                  {
                    value: "right",
                    label: "Right",
                  },
                ]}
              />
            </div>
          ),
        },
        {
          key: "2",
          label: "Sizing",
          children: (
            <div className={collapseMainContentClass("sizing")}>
              {type == "column" ? (
                <>
                  <SliderMain
                    data={tabProps.data}
                    indexes={tabProps.indexes}
                    property="width"
                    label="Width"
                    defaultSuffix="%"
                    defaultValue="100"
                    onChangeStyle={onChangeStyle}
                    deviceSwitch={tabProps.deviceSwitch}
                    isSlider={true}
                  />
                  {/* <SliderMain
                    data={tabProps.data}
                    indexes={tabProps.indexes}
                    property="flexBasis"
                    label="Flex Basis"
                    defaultSuffix="%"
                    defaultValue="100"
                    onChangeStyle={onChangeStyle}
                    deviceSwitch={tabProps.deviceSwitch}
                  /> */}
                </>
              ) : (
                <SliderMain
                  data={tabProps.data}
                  indexes={tabProps.indexes}
                  property="width"
                  label="Width"
                  defaultSuffix="%"
                  defaultValue="100"
                  onChangeStyle={onChangeStyle}
                  deviceSwitch={tabProps.deviceSwitch}
                  isSlider={true}
                />
              )}
              <SliderMain
                data={tabProps.data}
                indexes={tabProps.indexes}
                property="height"
                label="Height"
                defaultSuffix="%"
                defaultValue="100"
                onChangeStyle={onChangeStyle}
                deviceSwitch={tabProps.deviceSwitch}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
