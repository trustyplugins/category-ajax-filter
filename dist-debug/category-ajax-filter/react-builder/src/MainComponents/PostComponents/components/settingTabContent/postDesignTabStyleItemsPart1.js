import React from "react";
import {
  ArrowRightOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { Tabs as AntTabs, Tooltip, Segmented } from "antd";
import SliderMain from "../design-components/common-component/SliderMain";
import SelectMain from "../design-components/common-component/SelectMain";
import AlignMain from "../design-components/common-component/AlignMain";
import TextMain from "../design-components/common-component/TextMain";
import wrapdownicon from "../../../images/flex/wrap-down.svg";
import wrapupicon from "../../../images/flex/wrap-up.svg";
import singlerowicon from "../../../images/flex/single-row.svg";
import wrapdown2icon from "../../../images/flex/wrap-down2.svg";
import wrapup2icon from "../../../images/flex/wrap-up.svg";
import wraprighticon from "../../../images/flex/wrap-right.svg";
import wraplefticon from "../../../images/flex/wrap-left.svg";
import singlecolumnicon from "../../../images/flex/single-column.svg";
import wrapright2icon from "../../../images/flex/wrap-right2.svg";
import wrapleft2icon from "../../../images/flex/wrap-left2.svg";
import { collapseMainContentClass } from "../../../utils/collapseMainContentClass";

const Tabs = (props) => (
  <AntTabs
    {...props}
    items={Array.isArray(props.items) ? props.items.filter(Boolean) : props.items}
  />
);

/**
 * Collapse items keys "0" (Layout), "1" (Text), "2" (Sizing) for post DesignTab.
 */
export function buildPostDesignTabStyleItemsPart1(ctx) {
  const {
    props,
    module,
    item,
    modulesKeysArray,
    selectedSubTab,
    handleSettingChange,
    SubTabLayoutItems,
    subTabCommonItems,
    onChangeStyle,
    styleStateAl,
    hoverValue,
    handleHover,
    flexFlow,
    displayProperty,
    opt1,
    opt2,
    fontFamilyArray,
    hoverSwitchText,
    onHoverSwitchText,
  } = ctx;

  return [
    //0:Layout
    {
      key: "0",
      label: "Layout",
      children: (
        <>
        {
          modulesKeysArray.includes(module?.key) && (item?.prefix?.is_enable === "true" || item?.suffix?.is_enable === "true") &&
        <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              activeKey={selectedSubTab}
              onChange={(value) => handleSettingChange(value)}
              items={SubTabLayoutItems}
              defaultActiveKey={selectedSubTab}
            />
        </div>
        }
        
        {( 
        <div className={collapseMainContentClass("layout", "webflow-sync")}>
          <>
            <AlignMain
              data={props.data}
              indexes={props.indexes}
              property="display"
              label="Display"
              defaultValue="flex"
              onChangeStyle={onChangeStyle}
              styleState={styleStateAl}
              //  styleState={false}
              styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              deviceSwitch={props.deviceSwitch}
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
              isNewTab={true}
            />

            {displayProperty === "flex" && (
            <div className="webflow-custom-dropdown new-caf-look">
              <AlignMain
                data={props.data}
                indexes={props.indexes}
                property="flexFlow"
                label="Direction"
                defaultValue="row"
                onChangeStyle={onChangeStyle}
                styleState={styleStateAl}
                 styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
                deviceSwitch={props.deviceSwitch}
                options={[
                  {
                    value: "row",
                    label: (
                      <Tooltip title="Horizontal">
                        <ArrowRightOutlined />
                      </Tooltip>
                    ),
                  },
                  {
                    value: "column",
                    label: (
                      <Tooltip title="Vertical">
                        <ArrowDownOutlined />
                      </Tooltip>
                    ),
                  },
                  {
                    value: 'row-reverse',
                    label: <Tooltip title="Row Reverse"><ArrowLeftOutlined /></Tooltip>,
                  },
                  {
                    value: 'column-reverse',
                    label: <Tooltip title="Column Reverse"><ArrowUpOutlined /></Tooltip>,
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
            <div
              className={`flex-align-control ${
                flexFlow === "column wrap" || flexFlow === "column wrap-reverse"
                  ? "caf-reverse-me1"
                  : ""
              }`}
            >
              <SelectMain
                data={props.data}
                indexes={props.indexes}
                property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'alignItems' : "justifyContent"}`}
                label={"X"}
                defaultValue="flex-start"
                onChangeStyle={onChangeStyle}
                styleState={styleStateAl}
                 styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
                deviceSwitch={props.deviceSwitch}
                class={"align-x-flex"}
                options={opt1}
              />
              <SelectMain
                data={props.data}
                indexes={props.indexes}
                property={`${(flexFlow === 'column' || flexFlow === 'column-reverse') ? 'justifyContent' : "alignItems"}`}
                label={"Y"}
                defaultValue="flex-start"
                onChangeStyle={onChangeStyle}
                styleState={styleStateAl}
                 styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
                // styleState={false}
                deviceSwitch={props.deviceSwitch}
                class={"align-y-flex"}
                options={opt2}
              />
            </div>
          </div>
          <div className="webflow-slider webflow-gap-slider">
            <SliderMain
              data={props.data}
              indexes={props.indexes}
              property="gap"
              label="Gap"
              defaultSuffix="px"
              defaultValue="0"
              onChangeStyle={onChangeStyle}
              styleState={styleStateAl}
               styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
              deviceSwitch={props.deviceSwitch}
              isSlider={true}
            ></SliderMain>
          </div>
          </>
          )}
          <AlignMain
            data={props.data}
            indexes={props.indexes}
            property="float"
            label="Float"
            defaultValue="none"
            onChangeStyle={onChangeStyle}
            styleState={styleStateAl}
             styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
            //  styleState={false}
            deviceSwitch={props.deviceSwitch}
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
            isNewTab={true}
          />
        </div>
      )}
        </>
      ),
    },
    //1:Text
    {
      key: "1",
      label: "Text",
      children: (
        <>
        {modulesKeysArray.includes(module?.key) && (item?.prefix?.is_enable ==="true" || item?.suffix?.is_enable ==="true")  &&
        <div className="caf-builder-setting-row-label meta-dropdown-dyn">
          <Tabs
            activeKey={selectedSubTab}
            onChange={(value) => handleSettingChange(value)}
            // defaultActiveKey="container"
            items={subTabCommonItems}
            defaultActiveKey={selectedSubTab}
          />
        </div>
        }
          {( 
        <div className={collapseMainContentClass("text")}>
          <div className="hoverswitchguard">
            <Segmented
              value={hoverSwitchText}
              style={{ marginBottom: 8 }}
              onChange={onHoverSwitchText}
              className={"hoverTabCaf"}
              options={[
                { label: "Default", value: false },
                { label: "Hover", value: true },
              ]}
            />
          </div>
          <TextMain
            data={props.data}
            indexes={props.indexes}
            property="text"
            label="Text"
            onChangeStyle={onChangeStyle}
            fonts={fontFamilyArray}
            hoverSwitch={hoverSwitchText}
            deviceSwitch={props.deviceSwitch}
            styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
          />
        </div>
            )}
        </>
      ),
    },
    //2:Sizing
    {
      key: "2",
      label: "Sizing",
      children: (
        <>
        {modulesKeysArray.includes(module?.key) && (item?.prefix?.is_enable ==="true" || item?.suffix?.is_enable ==="true")  &&
        <div className="caf-builder-setting-row-label meta-dropdown-dyn">
          <Tabs
            activeKey={selectedSubTab}
            onChange={(value) => handleSettingChange(value)}
            items={subTabCommonItems}
            defaultActiveKey={selectedSubTab}
          />
        </div>
        }
          {module?.key ==="categories" &&(
            <div className="caf-builder-setting-row-label meta-dropdown-dyn">
            <Tabs
              activeKey={selectedSubTab}
              onChange={(value) => handleSettingChange(value)}
              items={[
                {
                key: "container",
                label: "Main",
              },
              {
                key: "meta",
                label: "Item",
              }
              ]}
              defaultActiveKey={selectedSubTab}
            />
          </div>
          )}
          {( 
        <div className={collapseMainContentClass("sizing")}>
          <SliderMain
            data={props.data}
            indexes={props.indexes}
            property="width"
            label="Width"
            defaultSuffix="%"
            defaultValue="100"
            onChangeStyle={onChangeStyle}
            deviceSwitch={props.deviceSwitch}
            isSlider={true}
            styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
          />
          {/* <SliderMain
            data={props.data}
            indexes={props.indexes}
            property="flexBasis"
            label="FlexBasis"
            defaultSuffix="%"
            defaultValue="100"
            onChangeStyle={onChangeStyle}
            deviceSwitch={props.deviceSwitch}
          /> */}
          <SliderMain
            data={props.data}
            indexes={props.indexes}
            property="height"
            label="Height"
            defaultSuffix="%"
            defaultValue="100"
            onChangeStyle={onChangeStyle}
            deviceSwitch={props.deviceSwitch}
            isSlider={true}
            styleTab={(selectedSubTab !== "container") ? selectedSubTab:""}
          />
        </div>
      )}
        </>
      ),
    },
  ];
}
